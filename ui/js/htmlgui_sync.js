/**********************************************************************
	 htmlgui_sync.js

$Comment: provides html basemap sync functiuons to the svggis htmlgui
$Source : htmlgui_sync.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2010/09/19 $
$Author: guenter richter $
$Id: htmlgui_sync.js 1 2010-09-19 22:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_sync.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides interface functions for map synchronisatation. Calls html map functions which must be resolved by base map specific javascript (e.s. htmlgui_sync_GoogleV3.js)<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

(function (window, document, undefined) {


	function expose() {
		var oldIxmaps = window.ixmaps;

		ixmaps.noConflict = function () {
			window.ixmaps = oldIxmaps;
			return this;
		};

		window.ixmaps = ixmaps;
	}

	// define Data for Node module pattern loaders, including Browserify
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = ixmaps;

		// define Data as an AMD module
	} else if (typeof define === 'function' && define.amd) {
		define(ixmaps);
	}

	// define Data as a global variable, saving the original Data to restore later if needed
	if (typeof window !== 'undefined') {
		expose();
	}


	// .............................................................................
	//
	//  h e l p e r
	//
	// .............................................................................

	var ___SVGHidden = false;

	function hideParentMap() {
		fEnableEventsOnSVG = false;
	}
	ixmaps.hideAll = function () {
		if (___SVGHidden) {
			return;
		}
		var div = this.svgDiv;
		if (div) {
			try {
				div.style.setProperty("visibility", "hidden", null);
			} catch (e) {
				div.style["visibility"] = "hidden";
			}
		}
		___SVGHidden = true;
	}
	ixmaps.showAll = function () {
		var div = this.svgDiv;
		if (div) {
			try {
				div.style.setProperty("visibility", "visible", null);
			} catch (e) {
				div.style["visibility"] = "visible";
			}
		}
		___SVGHidden = false;
	}

	function hideSVGMap() {
		try {
			ixmaps.embeddedSVG.window.map.hideMap();
		} catch (e) {}
	}

	function showSVGMap() {
		try {
			ixmaps.embeddedSVG.window.map.showMap();
		} catch (e) {}
	}

	/* ------------------------------------------------------------------  
	   deprecated; remains only for Google V2
	 ------------------------------------------------------------------ */ 

	function setCenterLatLon(lat, lon) {
		try {
			__timer_reset();
			ixmaps.embeddedSVG.window.map.Api.doCenterMapToGeoPosition(lat, lon);
			return __timer_getMS();
		} catch (e) {}
	}

	function setBoundsLatLon(latSW, lonSW, latNE, lonNE) {
		try {
			__timer_reset();
			ixmaps.embeddedSVG.window.map.Api.doSetMapToGeoBounds(latSW, lonSW, latNE, lonNE);
		} catch (e) {}
	}

	function setBoundsLatLonSilent(latSW, lonSW, latNE, lonNE) {
		try {
			__timer_reset();
			ixmaps.embeddedSVG.window.map.Api.froozeMap(true);
			ixmaps.embeddedSVG.window.map.Api.doCenterMapToGeoBounds(latSW, lonSW, latNE, lonNE);
			ixmaps.embeddedSVG.window.map.Api.froozeMap(false);
			return __timer_getMS();
		} catch (e) {}
	}

	function getCenterLatLon() {
		try {
			return ixmaps.embeddedSVG.window.map.Api.getCenterOfMapInGeoPosition();
		} catch (e) {
			return null;
		}
	}

	function getBoundsLatLon() {
		try {
			var arrayPtLatLon = ixmaps.embeddedSVG.window.map.Api.getBoundsOfMapInGeoBounds();
			arrayPtLatLon[0].x = Math.max(Math.min(arrayPtLatLon[0].x, 180), -180);
			arrayPtLatLon[0].y = Math.max(Math.min(arrayPtLatLon[0].y, 80), -80);
			arrayPtLatLon[1].x = Math.max(Math.min(arrayPtLatLon[1].x, 180), -180);
			arrayPtLatLon[1].y = Math.max(Math.min(arrayPtLatLon[1].y, 80), -80);
			return new Array({
				lat: arrayPtLatLon[0].y,
				lng: arrayPtLatLon[0].x
			}, {
				lat: arrayPtLatLon[1].y,
				lng: arrayPtLatLon[1].x
			});
		} catch (e) {
			return null;
		}
	}

	function setMapScale(nScale) {
		try {
			__timer_reset();
			ixmaps.embeddedSVG.window.map.Api.doZoomMap(nScale, 'byscale');
		} catch (e) {}
	}

	/* ------------------------------------------------------------------  
		t i m e r 
	  ------------------------------------------------------------------ */

	/**
	 * sets the timer to zero
	 */
	var __timer_nMillisec = 0;

	function __timer_reset() {
		var jetzt = new Date();
		__timer_nMillisec = jetzt.getTime();
	}
	/**
	 * gets the elapsed time (in ms)
	 */
	function __timer_getMS() {
		var jetzt = new Date();
		var nActMilli = jetzt.getTime();
		return (nActMilli - __timer_nMillisec);
	}
	/**
	 * gets the elapsed time (in ms)
	 */
	function __timer_getSEC() {
		var jetzt = new Date();
		var nActMilli = jetzt.getTime();
		return (nActMilli - __timer_nMillisec) / 1000;
	}

	/* ------------------------------------------------------------------  
		i n p u t   m o d e 
	  ------------------------------------------------------------------ */

	/**
	 * internal 
	 * @return void
	 * @private
	 */
	var __switchInputMode = function () {

		switch (ixmaps.getMapTool()) {
			case 'info':
			case 'clickinfo':
				ixmaps.mapTool('idle');
				break;
			case 'pan':
			default:
				ixmaps.mapTool('info');
				break;
		}
	};

	/**
	 * set the map input mode
	 * @param {string} szMode input mode to set
	 * @return void
	 * @private
	 */
	var __setInputMode = function (szMode) {
		try {
			switch (szMode) {
				case 'info':
					break;
				case 'pan':
				default:
					break;
			}
		} catch (e) {}
		try {
			$("#" + mode)[0].checked = true;
			$("#tools").buttonset('refresh');
		} catch (e) {}
	};

	__TS_isTouchDevice = function () {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	};
	/*
	 * test if device is touch device
	 * @type boolean
	 * @return true / false
	 */
	ixmaps.isTouchDevice = function () {
		return __TS_isTouchDevice();
	};


	// .............................................................................
	//
	//  S h a r e   E v e n t s
	//
	// .............................................................................

	/** share events between HTML and SVG
	 *  because only one hosting <div> can have events, either the HTML map or the SVG map,
	 *  the event ability of the SVG, which is on top, has to be switched according to the 
	 *  selected tool and the position of the pointer, expl. if poiunter is on map background,
	 *  event is switcht to the html map for a tetermined time window
	 */

	// we need this to know if we have click or move
	ixmaps.mouseMoveX = null;
	ixmaps.mouseMoveY = null;
	ixmaps.mouseDownX = null;
	ixmaps.mouseDownY = null;

	// flag to memory if we switched by click; only in this case switch back by idle
	ixmaps.fSwitchInputModeOnMapClick = false;
	ixmaps.fInputModeSwitched = false;

	var fSVGTriggerEvent = false;
	var fEnableAutoDisable = false;
	var fEnableEventsOnSVG = true;
	var fEnableSwitchEvents = true;
	var fBlockSVGMapEvents = false;
	var fEventsOnSVG = true;
	var fShareEvents = false;

	// GR 27.03.2014 chrome for android doesn't get events through overlay SVG even if there pointer-events == none
	// we create a transparent pane on top to enable zoom and pan of the HTML basemap 
	/**
	 * switch android event pane
	 * @param {boolean} flag activate or deactivate events
	 * @return void
	 * @private
	 */
	ixmaps.switchAndroidEventPane = function (fFlag) {
		//if ( fFlag && this.isTouchDevice() ) {
		if (fFlag) {
			$(".androideventpane").show();
		} else {
			$(".androideventpane").hide();
		}
	};

	/**
	 * activate events on SVG map
	 * @param {boolean} flag activate or deactivate events
	 * @return void
	 * @private
	 */
	var __activateSVGElements = function (flag) {

		if (!fEnableSwitchEvents) {
			return;
		}
		$("#svgmapdiv").css("pointer-events", (flag ? "all" : "none"));

		// GR 04.06.2014 new, for chrome on android 
		ixmaps.switchAndroidEventPane(!flag);

		if (!flag) {
			fSVGTriggerEvent = true;
		}
	};

	/**
	 **	general mouse event handler 
	 **  use mouse events to switch between SVG and HTML map input 
	 **/

	ixmaps.do_mapmousedown = function (e) {
		ixmaps.mouseDownX = e.clientX;
		ixmaps.mouseDownY = e.clientY;
		fEnableEventsOnSVG = false;
	};

	ixmaps.do_mapmouseup = function (e) {
		fEnableEventsOnSVG = true;
	};

	ixmaps.do_mapmouseout = function (e) {
		if (fShareEvents) {
			if (fEnableEventsOnSVG) {
				__activateSVGElements(true);
				fEnableAutoDisable = false;
			}
		}
	};
	ixmaps.do_mapmouseover = function (e) {
		if (fShareEvents) {
			if (fEnableEventsOnSVG) {
				__activateSVGElements(false);
				fEnableAutoDisable = true;
			}
		}
	};
	ixmaps.nMapMouseMove = 0;
	ixmaps.lastMoveTime = 1;
	ixmaps.do_mapmousemove = function (e) {
		if ((ixmaps.mouseMoveX != e.clientX) ||
		if ((ixmaps.mouseMoveX && (ixmaps.mouseMoveX != e.clientX)) ||
			(ixmaps.mouseMoveY && (ixmaps.mouseMoveY != e.clientY))) {
			var now = new Date();
			ixmaps.lastMoveTime = now.getTime();
		}
		ixmaps.mouseMoveX = e.clientX;
		ixmaps.mouseMoveY = e.clientY;
		return;
		if (++ixmaps.nMapMouseMove > 300) {
			ixmaps.nMapMouseMove = 0;
			if (fEnableEventsOnSVG) {
				__activateSVGElements(true);
			}
		}
	};
	ixmaps.do_mapclick = function (e) {
		if (ixmaps.fSwitchInputModeOnMapClick) {
			if (!ixmaps.mouseDownX || (
					(Math.abs(ixmaps.mouseDownX - ixmaps.mouseMoveX) < 10) &&
					(Math.abs(ixmaps.mouseDownY - ixmaps.mouseMoveY) < 10))) {
				var now = new Date();
				if (!this.isTouchDevice() || ((now.getTime() - ixmaps.lastMoveTime) > 50)) {
					ixmaps.mapTool("clickinfo");
					ixmaps.fInputModeSwitched = true;
					fEnableAutoDisable = true;
					//setTimeout("ixmaps.htmlgui_onSVGPointerIdle()",2000);
				}
			}
			ixmaps.mouseDownX = ixmaps.mouseMoveX = ixmaps.mouseDownY = ixmaps.mouseMoveY = null;
		}
	};

	ixmaps.do_svgtriggerevent = function () {
		fSVGTriggerEvent = false;
	};

	/**
	 **	enable/disable SVG mouse events 
	 **/

	/**
	 * enable events on SVG map
	 * @return void
	 */
	ixmaps.do_enableSVG = function () {
		if (fShareEvents) {
			if (fEnableEventsOnSVG && !fBlockSVGMapEvents) {
				__activateSVGElements(true);
				setTimeout("ixmaps.do_disableSVG()", 25);
			}
			setTimeout("ixmaps.do_enableSVG()", 250);
		}
	};
	/**
	 * disable events on SVG map
	 * @return void
	 */
	ixmaps.do_disableSVG = function () {
		if (fShareEvents) {
			if (fEnableAutoDisable) {
				__activateSVGElements(false);
			}
		}
	};

	/**
	 **	keyboard handler
	 **/

	ixmaps.do_keydown = function (evt,source) {

		// evoke theme editor by key ctrl+alt+E
		if (evt.keyCode == 69) {
			if ((evt.ctrlKey == true) && (evt.altKey == true)) {
				ixmaps.openDialog(null, "editor", './tools/theme_editor.html', 'Theme Editor', '10,103', 380, 600);
			}
		}
		// evoke tools bar ctrl+alt+S
		if (evt.keyCode == 83) {
			if ((evt.ctrlKey == true) && (evt.altKey == true)) {
				ixmaps.openDialog(null, "editor", './tools/share_new.html', 'Share', '50%,103', 380, 600);
			}
		}
		// evoke tools bar ctrl+alt+T
		if (evt.keyCode == 80) {
			if ((evt.ctrlKey == true) && (evt.altKey == true)) {
				ixmaps.openDialog(null, "editor", './tools/popuptools_line_v2.html', 'Tools', '10,10', "95%", 150);
			}
		}
		// evoke chart type menu bar ctrl+alt+C
		if (evt.keyCode == 67) {
			if ((evt.ctrlKey == true) && (evt.altKey == true)) {
				ixmaps.makeChartMenueHTML();
			}
		}
		//show/hide legend by ctrl+alt+L
		if (evt.keyCode == 76) {
			if ((evt.ctrlKey == true) && (evt.altKey == true)) {
				__switchLegendMode();
			}
		}

		if (fShareEvents) {
			// switch event target on 'shift' key down
			if (evt.keyCode == 16) {
				__activateSVGElements(!fEventsOnSVG);
				fEnableSwitchEvents = false;
			}
		}
		
		//ixmaps.mapTool("pan");
	};
	ixmaps.do_keyup = function (evt, source) {

		if (fShareEvents) {
			// switch back event target on 'shift' key up
			if (evt.keyCode == 16) {
				fEnableSwitchEvents = true;
				__activateSVGElements(true);
			}
		}
		
		//ixmaps.mapTool("info");
	};


	/* ------------------------------------------------------------------ * 
		set tool specifc event sharing when tool (zoom,drag,info,...) changes
	* ------------------------------------------------------------------ */

	ixmaps.htmlgui_onMapTool = function (szMode) {

		fEnableSwitchEvents = true;
		fEnableEventsOnSVG = true;
		fBlockSVGMapEvents = false;

		// GR 16.02.2012 if html map off, pointer events allways on SVG
		if (!ixmaps.htmlMap) {
			__activateSVGElements(true);
			fEnableSwitchEvents = false;
			return;
		}
		switch (szMode) {
			case "zoomrect":
			case "selectrect":
			case "selectbuffer":
			case "coord":
			case "measurement":
			case "polyline":
			case "polygon":
				__activateSVGElements(true);
				fEnableSwitchEvents = false;
				break;
			case "info":
			case "clickinfo":
				__activateSVGElements(true);
				fEnableSwitchEvents = true;
				break;
			case "idle":
			case "pan":
				if (navigator.userAgent.match(/MSIE/)) {
					// we must allow pan with SVG, because IE9 does not support pointer-events yet
					__activateSVGElements(true);
					fEnableSwitchEvents = true;
				} else {
					fEnableEventsOnSVG = false;
					fBlockSVGMapEvents = true;
					__activateSVGElements(false);
				}
				break;

			default:
				if (fShareEvents) {
					fEnableEventsOnSVG = false;
					fBlockSVGMapEvents = true;
					__activateSVGElements(false);
				}
				break;
		}
	};


	// .............................................................................
	//
	//  s y n c h r o n i z e   HTML <-> SVG
	//
	// .............................................................................

	/** synchronize map bounds
	 *  generally the SVG map is synchronized to the HTML map
	 *  the HTML map can only have defined zoom level 
	 */

	// hide SVG while panning the map
	ixmaps.panHidden = true;

	// if set to true, all maps on one html page will be synchronized (zoom and pan)
	// ! every map and containing iframe must have the same unique name 
	ixmaps.fSyncMultiMaps = true;

	ixmaps.fSynchronized = false;

	// variables to synchronize SVG and HTML

	var synchronizeTimeout = null;
	var fOrigDragSVGHidden = false;
	var nLastSynchZoom = null;
	
	// using flyTo we must ignore the first ixmaps.showAll() in __doSynchronizeSVGMap() 
	var __fFlyTo = false;

	ixmaps.syncSlaveMaps = function (ptSW, ptNE, nZoom) {
		if ((typeof(ixmaps.fSyncMap) != "undefined") && !ixmaps.fSyncMap){
			return;
		}
		if ((typeof(ixmaps.parentApi.fSyncMap) != "undefined") && !ixmaps.parentApi.fSyncMap){
			return;
		}
		if (ixmaps.szName == ixmaps.szSlave) {
			return;
		}
		ixmaps.parentApi.syncEmbed(ixmaps.szName, ptSW, ptNE, nZoom);
	};

	ixmaps.syncMap = function (szMap, ptSW, ptNE, nZoom) {
		if ((typeof(ixmaps.fSyncMap) != "undefined") && !ixmaps.fSyncMap){
			return;
		}
		ixmaps.szSlave = szMap;

		ixmaps.htmlgui_setCenterAndZoom({
			lat: (ptSW.lat + ptNE.lat) / 2,
			lng: (ptSW.lng + ptNE.lng) / 2
		}, nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);

		clearTimeout(ixmaps.slaveTimeout);
		ixmaps.slaveTimeout = setTimeout("ixmaps.szSlave = null", 100);
	};

	/**
	 * synchronize HTML map to the actual SVG bounds
	 * @param {function} callback a funcyion to call after the html map is synchronized
	 * @param {boolean} zoomto a flag to activate a zoom to action
	 * @return void
	 * @private
	 */
	ixmaps.htmlgui_synchronizeMap = function (callback, zoomto) {

		if (!window || !ixmaps.embeddedSVG || !this.htmlMap || ixmaps.embeddedSVG.window.map.Api.pendingNewGeoBounds()) {
			return;
		}

		// if we have set the view, sync the SVG and not the HTML
		if (ixmaps.htmlmap_view) {
			ixmaps.HTML_showMap();
			ixmaps.htmlgui_synchronizeSVG(false);
			return;
		}

		try {
			ixmaps.embeddedSVG.window._TRACE("htmlgui: htmlgui_synchronizeMap() callback=" + callback + " zoomto=" + zoomto);
		} catch (e) {}

		// ok, go ahead and sync the HTML map
		//
		try {
			ixmaps.embeddedSVG.window._TRACE("htmlgui: request to synchronize HTML map ! ==>    ==>    ==>   ==>    ==>");
		} catch (e) {}

		try {
			var arrayPtLatLon = getBoundsLatLon();
			ixmaps.embeddedSVG.window._TRACE("htmlgui: request to adapt HTML map ! to sw:" + arrayPtLatLon[0].lat + "," + arrayPtLatLon[0].lng + " ne:" + arrayPtLatLon[1].lat + "," + arrayPtLatLon[1].lng);
			if (arrayPtLatLon && (arrayPtLatLon.length == 2)) {
				if (1 || zoomto) {
					htmlMap_setBounds(arrayPtLatLon, zoomto);
				} else {
					htmlMap_setCenter({
						lat: (arrayPtLatLon[1].lat + (arrayPtLatLon[0].lat - arrayPtLatLon[1].lat) / 2),
						lng: (arrayPtLatLon[0].lng + (arrayPtLatLon[1].lng - arrayPtLatLon[0].lng) / 2)
					});
				}
				ixmaps.fSynchronized = true;
			}
		} catch (e) {}

	};

	/**
	 * synchronize SVG map 
	 * @param {boolean} fPanOnly only panning is needed
	 * @return void
	 */

	ixmaps.htmlgui_synchronizeSVG = function (fPanOnly) {

		if (fPanOnly) {
			// avoid to frequent syncs
			// privileges dragging of the html map over SVG sync
			//
			if (synchronizeTimeout) {
				clearTimeout(synchronizeTimeout);
			}
			synchronizeTimeout = setTimeout("ixmaps.delayedSynchronizeSVG(" + String(fPanOnly) + ")", 50);
		} else {
			setTimeout("ixmaps.delayedSynchronizeSVG(" + String(fPanOnly) + ")", 50);
		}
	};

	ixmaps.delayedSynchronizeSVG = function (fPanOnly) {
		__doSynchronizeSVGMap(fPanOnly);
		synchronizeTimeout = null;
	};

	// here we go and synchronize the SVG 
	//

	function __doSynchronizeSVGMap(fPanOnly) {

		if (!window) {
			return;
		}

		if (!ixmaps.htmlMap) {
			return;
		}

		if (ixmaps.fSVGInitializing) {
			return;
		}
		
		if (__fFlyTo){
			__fFlyTo = false;
			return;
		}
		
		//showAll();

		// get the HTML map bounds
		var arrayPtLatLon = htmlMap_getBounds();
		var nZoom = htmlMap_getZoom();

		try {
			ixmaps.embeddedSVG.window._TRACE("");
			ixmaps.embeddedSVG.window._TRACE("htmlgui: sync ================>");
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + arrayPtLatLon[0].lat);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + arrayPtLatLon[0].lng);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + arrayPtLatLon[1].lat);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + arrayPtLatLon[1].lng);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: zoom:" + nZoom);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: fPan:" + fPan);
		} catch (e) {}

		// get the HTML map center
		var ptLatLon = htmlMap_getCenter();
		var ptBlat = arrayPtLatLon[0].lat + (arrayPtLatLon[1].lat - arrayPtLatLon[0].lat) / 2;
		var ptBlng = arrayPtLatLon[0].lng + (arrayPtLatLon[1].lng - arrayPtLatLon[0].lng) / 2;

		// check if center is different from envelope center
		// ( google maps returns -180,180 ==> 0 on zoom 0 even if the center is different from 0)
		// if true, correkt it
		if ((ptBlng == 0) && (ptLatLon.lng != 0)) {
			arrayPtLatLon[0].lng += ptLatLon.lng;
			arrayPtLatLon[1].lng += ptLatLon.lng;
		}

		try {
			ixmaps.embeddedSVG.window._TRACE("htmlgui: Center = ");
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + ptLatLon.lat);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + ptLatLon.lng);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: bCenter = ");
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + ptBlat);
			ixmaps.embeddedSVG.window._TRACE("htmlgui: " + ptBlng);
		} catch (e) {}

		// do some coordinate smoothing
		// wrap center lat between -180 and 180
		while (ptLatLon.lng < -180) {
			ptLatLon.lng += 360;
		}
		while (ptLatLon.lng > 180) {
			ptLatLon.lng -= 360;
		}

		// wrap bounds around wrapped center
		while (arrayPtLatLon[0].lng > ptLatLon.lng) {
			arrayPtLatLon[0].lng -= 360;
		}
		while (arrayPtLatLon[1].lng < ptLatLon.lng) {
			arrayPtLatLon[1].lng += 360;
		}
		while (arrayPtLatLon[0].lng < ptLatLon.lng - 360) {
			arrayPtLatLon[0].lng += 360;
		}
		while (arrayPtLatLon[1].lng > ptLatLon.lng + 360) {
			arrayPtLatLon[1].lng -= 360;
		}

		ixmaps.fInSVGSync = true;

		// set SVG map bounds
		if (fPanOnly) {
			setCenterLatLon(ptLatLon.lat, ptLatLon.lng);

		} else {
			setBoundsLatLon(
				arrayPtLatLon[0].lat,
				arrayPtLatLon[0].lng,
				arrayPtLatLon[1].lat,
				arrayPtLatLon[1].lng);

			// GR 11.04.2013 same problem, part of the solution
			// try to set the center explicitly
			setBoundsLatLonSilent(
				ptLatLon.lat,
				ptLatLon.lng,
				ptLatLon.lat,
				ptLatLon.lng);
		}

		ixmaps.fInSVGSync = false;

		try {
			ixmaps.embeddedSVG.window._TRACE("htmlgui: request to adapt SVG map");
		} catch (e) {}

		// try to sync slave maps
		if (ixmaps.fSyncMultiMaps && ixmaps.fSync && (ixmaps.fSync == true) && !ixmaps.fSyncBySVG) {
			try {
				ixmaps.syncSlaveMaps(ptLatLon,
					ptLatLon, htmlMap_getZoom());
			} catch (e) {}
		}
		ixmaps.fSyncBySVG = null;
		ixmaps.fSync = true;

		// make shure to show the svg map, may has been hidden before
		// if dragg in hidden mode, show SVG map
		//
		if (ixmaps.panHidden) {
			var elapsedTime = __timer_getMS();
			// test, if dragging hidden still needed
			if (0 && elapsedTime < 1000) {
				ixmaps.panHidden = fOrigDragSVGHidden;
			}
		}

		// set visibility status after SVG syncronization 
		// in initialization phase, the SVG map is hidden, so make it visible when synchronized 

		ixmaps.showAll();

		setTimeout("ixmaps.HTML_showMap()", 1000);

		try {
			ixmaps.embeddedSVG.window._TRACE("htmlgui: sync done ===");
		} catch (e) {}

	}

	ixmaps.setSyncMultiMaps = function (fFlag) {
		ixmaps.fSyncMultiMaps = fFlag;
	};

	ixmaps.setAutoSwitchInfo = function (fFlag) {
		ixmaps.fSwitchInputModeOnMapClick = fFlag;
	};

	ixmaps.syncSVGMap = function (fFlag) {
		alert("rgsdsdfgsdfgdfg");
		// GR 15.10.2015 obsolete; (to be verified)
		return;
		__doSynchronizeSVGMap(fFlag);
	};

	// ------------------------------------------------------------------  
	//	synchronise map panning (dragging)
	// ------------------------------------------------------------------

	ixmaps.htmlgui_synchronizeSVGWithDelay = function (fPanOnly, nDelay) {

		// avoid to frequent syncs and sync only after 150 ms;
		// privileges dragging of the html map over SVG sync
		//
		if (synchronizeTimeout) {
			clearTimeout(synchronizeTimeout);
		}
		synchronizeTimeout = setTimeout("ixmaps.delayedSynchronizeSVG(" + String(fPanOnly) + ")", nDelay);
	};

	var fPan = false;

	ixmaps.htmlgui_panSVGStart = function () {
		fPan = true;
		if (synchronizeTimeout) {
			clearTimeout(synchronizeTimeout);
		}
		if (ixmaps.panHidden) {
			ixmaps.hideAll();
		}
	};

	ixmaps.htmlgui_panSVGEnd = function () {
		if (fPan) {
			ixmaps.htmlgui_synchronizeSVGWithDelay(false, 100);
		}
		fPan = false;
	};

	ixmaps.htmlgui_panSVG = function () {

		fPan = true;

		// try to sync slave maps if sync multi maps is activated
		//
		if (ixmaps.fSyncMultiMaps && ixmaps.fSync && (ixmaps.fSync == true) && !ixmaps.fSyncBySVG) {
			try {
				var ptLatLon = htmlMap_getCenter();
				ixmaps.syncSlaveMaps(ptLatLon,
					ptLatLon, htmlMap_getZoom());
			} catch (e) {}
		}

		if (ixmaps.panHidden) {
			return;
		}
		if (!window) {
			return;
		}

		// get bounds of HTML map
		var arrayPtLatLon = htmlMap_getBounds();

		// get center of HTML map
		var ptLatLon = htmlMap_getCenter();

		// do some coordinate smoothing
		// wrap bounds around wrapped center
		while (arrayPtLatLon[0].lng > ptLatLon.lng) {
			arrayPtLatLon[0].lng -= 360;
		}
		while (arrayPtLatLon[1].lng < ptLatLon.lng) {
			arrayPtLatLon[1].lng += 360;
		}
		while (arrayPtLatLon[0].lng < ptLatLon.lng - 360) {
			arrayPtLatLon[0].lng += 360;
		}
		while (arrayPtLatLon[1].lng > ptLatLon.lng + 360) {
			arrayPtLatLon[1].lng -= 360;
		}
	
		// set SVG map bounds
		var time = setBoundsLatLonSilent(
			ptLatLon.lat,
			ptLatLon.lng,
			ptLatLon.lat,
			ptLatLon.lng);

		// if dragging takes to much time, hide the SVG on start dragging
		//
		if (time > 100) {
			ixmaps.panHidden = true;
		}
	};


	// .............................................................................
	//
	//	H T M L   M a p   h a n d l i n g
	//
	// .............................................................................

	ixmaps.htmlmap_view = false;
	ixmaps.svgmap_view = false;
	ixmaps.htmlgui_setBounds = function (arrayPtLatLon) {
		htmlMap_setBounds(arrayPtLatLon);
		ixmaps.htmlmap_view = true;
	};
	ixmaps.htmlgui_setCenterAndZoom = function (ptCenter, nZoom) {
		htmlMap_setCenter(ptCenter);
		htmlMap_setZoom(nZoom);
		ixmaps.htmlmap_view = true;
	};
	/** 
	 *	set HTML map center
	 */
	ixmaps.htmlgui_setCenter = function (ptCenter) {
		htmlMap_setCenter(ptCenter);
		ixmaps.htmlmap_view = true;
	};
	/** 
	 *	set HTML map zoom
	 */
	ixmaps.htmlgui_setZoom = function (nZoom) {
		htmlMap_setZoom(nZoom);
	};
	/** 
	 *	set HTML minimal zoom
	 */
	ixmaps.htmlgui_minZoom = function (nZoom) {
		if (htmlMap_getZoom() < nZoom) {
			htmlMap_setZoom(nZoom);
		}
	};
	/** 
	 *	fly to HTML map center and zoom
	 */
	ixmaps.htmlgui_flyToCenterAndZoom = function (ptCenter, nZoom) {
		ixmaps.hideAll();
		__fFlyTo = true;
		htmlMap_flyTo(ptCenter, nZoom);
		ixmaps.htmlmap_view = true;
	};
	/** 
	 *	get HTML map center
	 */
	ixmaps.htmlgui_getCenter = function () {
		return htmlMap_getCenter();
	};
	/** 
	 *	get HTML map zoom
	 */
	ixmaps.htmlgui_getZoom = function () {
		return htmlMap_getZoom();
	};
	/** 
	 *	get HTML map bounding box
	 */
	ixmaps.htmlgui_getBoundingBox = function () {
		return htmlMap_getBounds();
	};


	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!
	// called by SVG map script !!!
	// !!!!!!!!!!!!!!!!!!!!!!!!!!!!

	/** notify htmlgui on SVG idle -> release events handling
	 */
	ixmaps.htmlgui_onSVGPointerIdle = function () {

		// share events active ?
		//
		if (fShareEvents) {
			__activateSVGElements(false);
		}

		// if we switched to SVG by clicking on the map, switch back to HTML
		//
		if (ixmaps.fInputModeSwitched) {
			__switchInputMode();
			__activateSVGElements(false);
			ixmaps.mouseDownX = ixmaps.mouseMoveX = ixmaps.mouseDownY = ixmaps.mouseMoveY = null;
			ixmaps.fInputModeSwitched = false;
		}

	};

	/** set HTML map bounds
	 */
	ixmaps.htmlgui_setCurrentEnvelopeByGeoBounds = function (ptSW, ptNE) {
		ixmaps.svgmap_view = true;
		if (ixmaps.htmlmap_view && ixmaps.htmlMap && !ixmaps.fInSVGSync) {
			ixmaps.htmlgui_synchronizeSVG(false);
			ixmaps.htmlmap_view = false;
			return true;
		}
		if (ixmaps.htmlMap && !ixmaps.fInSVGSync) {
			htmlMap_setBounds(new Array({
				lat: ptSW.y,
				lng: ptSW.x
			}, {
				lat: ptNE.y,
				lng: ptNE.x
			}));
			ixmaps.htmlgui_synchronizeSVG(false);
			return true;
		} else {
			return false;
		}
	};
	ixmaps.htmlgui_setCurrentCenterByGeoBounds = function (ptCenter) {
			htmlMap_setCenter({
				lat: ptCenter.y,
				lng: ptCenter.x
			});
		return;
		ixmaps.svgmap_view = true;
		if (ixmaps.htmlmap_view && ixmaps.htmlMap && !ixmaps.fInSVGSync) {
			ixmaps.htmlgui_synchronizeSVG(false);
			return true;
		}
		if (ixmaps.htmlMap && !ixmaps.fInSVGSync) {
			htmlMap_setCenter({
				lat: ptCenter.y,
				lng: ptCenter.x
			});
			// try to sync slave maps
			if (ixmaps.fSyncMultiMaps && ixmaps.fSync && (ixmaps.fSync == true)) {
				try {
					var arrayPtLatLon = htmlMap_getBounds();
					ixmaps.syncSlaveMaps(arrayPtLatLon[0],
						arrayPtLatLon[1], htmlMap_getZoom());
					ixmaps.fSyncBySVG = true;
				} catch (e) {}
			}
			ixmaps.htmlgui_synchronizeSVG(true);
			return true;
		} else {
			return false;
		}
	};

	ixmaps.htmlgui_message = function (szText) {
		if (ixmaps.htmlMap) {
			window.status = szText;
		}
	};


}(window, document));

// .............................................................................
// EOF
// .............................................................................
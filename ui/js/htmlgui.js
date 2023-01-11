/**********************************************************************
 htmlgui.js

$Comment: provides JavaScript HTML application interface to svggis
$Source : htmlgui.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: htmlgui.js 8 2007-06-05 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides GUI functions for a HTML page that embeds a SVGGIS map<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true,
   laxbreak: true, expr: true, sub: true, scripturl: true */
/* globals 
	window, document,
	movieobject, moviename, loadobject, nextobject, anzobjects, loadedobject, zoomname, map_zoomframe_level, _level, map_pan_level,
	map_extent
	*/

/** 
 * @namespace ixmaps
 */

(function (window, document, undefined) {
	
	var $ = window.$;
	var jQuery = window.jQuery;
	var alert = window.alert;

	var ixmaps = {
		version: "1.0",
		JSON_Schema: "https://gjrichter.github.io/ixmaps/schema/ixmaps/v1.json"
	};

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

	/* ------------------------------------------------------------------ * 
		global variables
	 * ------------------------------------------------------------------ */

	ixmaps.szDefaultMap = "../../maps/svg/maps/generic/mercator.svg";

	ixmaps.szUrlSVG = null;
	ixmaps.helpWindow = null;
	ixmaps.toolsWindow = null;
	ixmaps.sidebar = null;
	ixmaps.htmlMap = null;

	ixmaps.location = null;

	ixmaps.fMapLegendStyle = "hidden";
	ixmaps.fMapControlStyle = "large";
	ixmaps.fMapSizeMode = "fullscreen";
	ixmaps.blockLoadingMessage = false;
	ixmaps.fSilent = false;

	ixmaps.szCorsProxy = "";

	ixmaps.SVGmapWidth = 0;
	ixmaps.SVGmapHeight = 0;


	/* ------------------------------------------------------------------ * 
		local variables
	 * ------------------------------------------------------------------ */

	var __SVGEmbedWidth = 0;
	var __SVGEmbedHeight = 0;
	var __SVGmapPosX = 0;
	var __SVGmapPosY = 0;
	var __SVGmapOffX = 0;
	var __SVGmapOffY = 0;

	var __mapTop = 0;
	var __mapFooter = 0;
	var __mapLeft = 0;


	/* ------------------------------------------------------------------ * 
		jquery extensions
	 * ------------------------------------------------------------------ */

	(function ($) {

		/**
		 * assert a string.
		 * @example $(str).assertStr();
		 */
		$.fn.assertStr = function (szError) {
			if (this.selector && (typeof (this.selector) != "undefined") && this.selector.length && this.selector != "null") {
				return true;
			}
			if (szError) {
				alert(szError);
			}
			return false;
		};

	})(jQuery);

	/* ------------------------------------------------------------------ * 
		helper
	 * ------------------------------------------------------------------ */

	//	for IE9			- document.implementation.hasFeature("org.w3c.svg", "1.0") 
	//	for the rest	- document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
	ixmaps.hasSVG = function () {
		return (document.implementation.hasFeature("org.w3c.svg", "1.0") ||
			document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1"));
	};

	// write to console with time in sec : millisec
	//
	var _log_start_time = new Date();
	var _LOG = function (szLog) {
		var time = ((new Date()) - _log_start_time) / 1000;
		window.console.log("_LOG: time[sec.ms] " + time + " " + szLog);
	};

	var __addEvent = function (elem, type, eventHandle) {
		if (elem == null || elem == undefined) {
			return;
		}
		if (elem.addEventListener) {
			elem.addEventListener(type, eventHandle, false);
		} else if (elem.attachEvent) {
			elem.attachEvent("on" + type, eventHandle);
		}
	};


	/* ================================================================== * 
		create the map application
	 * ================================================================== */

	/**
	 * Create a new map instance.  
	 * @param szMapDiv the id of the div, where to create the SVG map
	 * @param options javascript object with the creation options
	 * @type object
	 * @return the new ixmaps object
	 */
	ixmaps.map = function (szMapDiv, options, callback) {
		
		if (ixmaps.szGmapDiv){
			return ixmaps;
		}

		window.console.log("*** htmlgui version: " + ixmaps.version);

		if (!ixmaps.hasSVG()) {
			alert("sorry ! your browser has no native SVG support;\n\nPlease try:   Chrome, Firefox, Safari, Opera or IE9");
			return;
		}

		var mapDiv = $('#' + szMapDiv)[0];

		/** 
		 *  try to get the offset of the map div 
		 *  is needed for the fullscreen mode
		 **/
		__mapTop = parseInt($('#' + szMapDiv).css("top"));
		__mapLeft = parseInt($('#' + szMapDiv).css("left"));

		if (isNaN(__mapTop) && mapDiv.parentNode) {
			__mapTop = parseInt($('#' + szMapDiv).parent().css("top"));
		}
		if (isNaN(__mapLeft && mapDiv.parentNode)) {
			__mapLeft = parseInt($('#' + szMapDiv).parent().css("left"));
		}
		/**
			for old map pages or if missing parent DIV
		**/
		if (isNaN(__mapTop)) {
			__SVGmapPosY = 38;
			__mapTop = 0;
		}
		if (isNaN(__mapLeft)) {
			__mapLeft = 0;
		}

		/** 
		 *  create the divs for svg and html map 
		 **/
		var aDiv = null;
		aDiv = document.createElement("div");
		aDiv.setAttribute("id", "gmap");
		mapDiv.appendChild(aDiv);
		aDiv = document.createElement("div");
		aDiv.setAttribute("id", "svgmapdiv");
		mapDiv.appendChild(aDiv);
		
		if (options.mapsize == "fix") {
			ixmaps.fMapSizeMode = "fix";
			__SVGEmbedWidth = mapDiv.clientWidth;
			__SVGEmbedHeight = mapDiv.clientHeight;
			__SVGmapPosX = mapDiv.offsetLeft;
			__SVGmapPosY = mapDiv.offsetTop;
			__mapTop = 0;
			__mapLeft = 0;
			__mapFooter = 0;
		}
		if (options.mode) {
			if (options.mode.match(/nolegend/)) {
				ixmaps.fMapLegendStyle = "hidden";
			}
		}
		if (options.controls) {
			if (options.controls.match(/small/)) {
				ixmaps.fMapControlStyle = "small";
			}
			if (options.controls.match(/mobile/)) {
				ixmaps.fMapControlStyle = "mobile";
			}
		}
		if (options.maptype) {
			if (options.maptype != "null") {
				ixmaps.fMapType = options.maptype;
			}
		}
		if (options.mapType) {
			if (options.mapType != "null") {
				ixmaps.fMapType = options.mapType;
			}
		}
		if (options.wheelzoom) {
			ixmaps.scrollWheelZoom = true;
		}
		if (options.footer) {
			__mapFooter = options.footer;
		}

		ixmaps.options = options;

		ixmaps.callback = callback;

		/** 
		 *  load the maps
		 **/
		return ixmaps.InitAll("gmap", "svgmapdiv", options.svg, options.mapService);
	};

	/**
	 * initialize the new map instance.  
	 * @param szGmapDiv the id of the div, where to create the Tile Map 
	 * @param szSVGDiv  the id of the div, where to create the SVG Map 
	 * @param szUrl the relative or absolute URL to the SVG map file
	 * @param szMapService the mapservice == Map API to use (e.g. "leaflet")
	 * @type object
	 * @return the initialized ixmaps object
	 */
	ixmaps.InitAll = function (szGmapDiv, szSvgDiv, szUrl, szMapService) {

		var szError = null;
		if (!$(szGmapDiv).assertStr()) {
			szError = "Error: missing map target (HTML div)!";
		}
		if (!$(szSvgDiv).assertStr()) {
			szError = "Error: missing map target (SVG div)!";
		}
		if (szError) {
			this.showLoading();
			$("#loading-text").append(szError + "x");
			$("#loading-image").css("visibility", "hidden");

			// call user defined method on map ready
			// --------------------------------------------------------
			try {
				this.onMapReady(this.szName);
			} catch (e) {}
			// bubble it up !
			try {
				this.parentApi.onMapReady(this.szName);
			} catch (e) {}
			return;
		}

		// store this for later use, needed in browser with more windows 
		this.location = window.location;

		this.szName = this.szName || "map";
		this.szUrlSVG = "";
		this.szGmapDiv = szGmapDiv;
		this.szSvgDiv = szSvgDiv;
		this.gmapDiv = $('#' + szGmapDiv)[0];
		this.svgDiv = $('#' + szSvgDiv)[0];

		if (szMapService == null || szMapService == 'null') {
			szMapService = "";
		}
		this.szMapService = szMapService;

		var fullWidth = __SVGEmbedWidth ? __SVGEmbedWidth : window.innerWidth;
		var fullHeight = __SVGEmbedHeight ? __SVGEmbedHeight : window.innerHeight;

		var mapWidth = fullWidth - __mapLeft - __SVGmapPosX;
		var mapHeight = fullHeight - __mapTop - __mapFooter - __SVGmapPosY;

		this.hideLoading();

		// -----------------------------------
		// prepare hosting div for google maps
		// -----------------------------------

		if (this.gmapDiv) {
			this.gmapDiv.setAttribute("onmousedown", "ixmaps.do_mapmousedown(event);");
			this.gmapDiv.setAttribute("onmouseup", "ixmaps.do_mapmouseup(event);");
			this.gmapDiv.setAttribute("onmouseout", "ixmaps.do_mapmouseout(event);");
			this.gmapDiv.setAttribute("onmouseover", "ixmaps.do_mapmouseover(event);");
			this.gmapDiv.setAttribute("onmousemove", "ixmaps.do_mapmousemove(event);");
			this.gmapDiv.setAttribute("onclick", "ixmaps.do_mapclick(event);");
			this.gmapDiv.setAttribute("ondblclick", "ixmaps.do_mapclick(event);");
			this.gmapDiv.setAttribute("onKeyDown", "ixmaps.do_keydown(event,1);");
			this.gmapDiv.setAttribute("onKeyUp", "ixmaps.do_keyup(event,1);");

			$(this.gmapDiv).css({
				'pointer-events': 'all',
				'position': 'absolute',
				'z-index': '1',
				'top': __SVGmapPosY + 'px',
				'left': __SVGmapPosX + 'px',
				'height': mapHeight + 'px',
				'width': mapWidth + 'px'
			});

			$(this.gmapDiv).css({
				'visibility': 'hidden'
			});
			this.htmlMap = true;
		}

		// ------------------------------------
		// prepare hosting div for ixmap svgmap
		// ------------------------------------

		if (this.svgDiv) {
			this.svgDiv.setAttribute("onmousedown", "ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmouseup", "ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmouseout", "ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmousemove", "ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmousewheel", "ixmaps.do_wheelEvent();");
			this.svgDiv.setAttribute("onKeyDown", "ixmaps.do_keydown(event,2);");
			this.svgDiv.setAttribute("onKeyUp", "ixmaps.do_keyup(event,2);");

			$(this.svgDiv).css({
				'pointer-events': 'none',
				'position': 'absolute',
				'z-index': '99',
				'top': +__SVGmapPosY + 'px',
				'left': +__SVGmapPosX + 'px'
			});

			$(this.svgDiv).css({
				'visibility': 'hidden'
			});

			// GR 09.01.2014 create without data="... attribute !
			//				 data= will be defined by ixmaps.HTML_loadSVGMap(...); see below
			this.svgDiv.innerHTML =
				"<iframe id='SVGMap' type='image/svg+xml' wmode='transparent' name='svgmap' style='border:0;' " +
				"width='" + (mapWidth) + "px' " +
				"height='" + (mapHeight) + "px' " +
				">";

			this.svgObject = $('#' + this.szSvgDiv + ' > iframe')[0];

			// --------------------
			// load basic SVG file
			// --------------------

			// GR 07.04.2018 default map
			szUrl = szUrl || ixmaps.szDefaultMap;

			if (szUrl || $(szUrl).assertStr()) {

				this.HTML_loadSVGMap(szUrl);
				this.szUrlSVG = szUrl;

			} else {
				// if no map is given
				// we are ready here ----> fire onMapReady event !
				// -----------------------------------------------
				this.showLoading();
				$("#loading-text").append("no map");
				$("#loading-image").css("visibility", "hidden");

				if (this.callback) {
					this.callback(this);
				} else {
					try {
						this.onMapReady(this.szName);
					} catch (e) {}
					// bubble it up !
					try {
						this.parentApi.onMapReady(this.szName);
					} catch (e) {}
				}
			}
		}

		// register window resize event to adapt the map always to the window size
		// -----------------------------------------------------------------------
		__addEvent(window, "resize", function () {
			ixmaps.resizeMap(null, false);
		});

		window.setTimeout("ixmaps.resizeMap(null,false)", 100);

		return ixmaps;
	};

	/**
	 * load an SVG map ino the map (embed) object    
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @param szName a name to identify the map, usefull if we have more than one map in a HTML page
	 * @type void
	 */
	ixmaps.HTML_loadSVGMap = function (szUrl) {

		if (!szUrl || (typeof (szUrl) != 'string')) {
			ixmaps.loadMapError(szUrl);
			return;
		}

		// GR 31.01.2018 if requested map == original SVG map and we have a loaded map, so reload the original map
		if ((szUrl == this.szUrlSVG) && this.loadedMap) {
			// GR 22.12.2020 we must clear the map to get the user informed of deleted themes
			ixmaps.clearAll();
			setTimeout(function(){$(ixmaps.svgObject).attr('src', ixmaps.szUrlSVG)},"100");
			delete this.loadedMap;
			return;
		}

		this.showLoading();
		if (ixmaps.embeddedSVG) {
			if (szUrl.match(/http/)) {
				this.loadingMap = szUrl;
				ixmaps.embeddedSVG.window.map.Api.loadMap(szUrl);
				return;
			} else {
				this.mapTool("");
			}
		}

		if (this.szUrlSVG == szUrl) {
			
			// call user defined method on map ready
			// --------------------------------------------------------
			if (this.callback) {
				this.callback(this);
			} else {
				this.onMapReady(this.szName);
			}
			return;
		}

		this.szUrlSVG = szUrl;
		this.szUrlSVGRoot = "";
		if (szUrl.match(/\//)) {
			var urlA = szUrl.split("/");
			for (var i = 0; i < urlA.length - 1; i++) {
				this.szUrlSVGRoot += urlA[i] + "/";
			}
		} else {
			this.szUrlSVGRoot = "";
		}
		$(this.svgObject).attr('onerror', 'ixmaps.loadMapError(ixmaps.szUrlSVG)');

		$.get(this.szUrlSVG).
		done(function (data) {
			$(ixmaps.svgObject).attr('src', ixmaps.szUrlSVG);
		}).
		fail(function () {
			$("#loading-text").empty();
			$("#loading-text").append("<span style='font-size:32px'><span style='color:red'>loading map error: </span>'" + ixmaps.szUrlSVG + "'<br> <span style='color:red'>not found</span></span>");
		});

		//$(this.svgObject).attr('data',this.szUrlSVG);

		this.dataLoaderA = null;
		this.embeddedSVG = null;
		ixmaps.do_enableSVG();
	};

	ixmaps.loadMapError = function (e) {
		alert("load SVG map error!\nurl: "+e);
	};

	/**
	 * load an SVG map out of a list     
	 * @type void
	 */
	ixmaps.HTML_setSVGMapByList = function () {

		var svgmapList = window.document.getElementById("svgMapList");
		this.HTML_loadSVGMap(svgmapList.value);
	};

	/**
	 * wrapper to load an SVG map
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @param szName a name to identify the map, usefull if we have more than one map in a HTML page
	 * @type void
	 */
	ixmaps.HTML_setSVGMap = function (szUrl) {

		this.HTML_loadSVGMap(szUrl);
		$("#dialog").dialog("close");
	};

	/**
	 * wrapper to load an SVG map
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @type void
	 */
	ixmaps.loadMap = function (szUrl, callback) {
		if ((szUrl == this.loadedMap)) {
			callback();
			return;
		}
		this.callback = callback;
		ixmaps.HTML_loadSVGMap(szUrl);
		ixmaps.dataLoaderA = [];
		return ixmaps;
	};

	/**
	 * on resize handler   
	 * @param mapBox an optinal boundigbox in screen coordinates
	 * @param fZoomTo parameter to pass to htmlgui_resizeMap()
	 * @param fCenter parameter to pass to htmlgui_resizeMap()
	 * @type void
	 */
	ixmaps.resizeMap = function (mapBox, fZoomTo, fCenter) {
		
		if (mapBox) {
			__SVGmapOffX = mapBox.x;
			__SVGmapOffY = mapBox.y;
			ixmaps.SVGmapWidth = mapBox.width;
			ixmaps.SVGmapHeight = mapBox.height;
		} else {
			if (ixmaps.fMapSizeMode == "fix") {
				return;
			}
			if ($("#banner-right").position()) {
				__SVGmapPosY = $("#banner-right").position().top - parseInt($("#banner-right").parent().css("padding-top"));
				$("#banner").css("height", "40px");
			}
			ixmaps.SVGmapWidth = window.innerWidth - __mapLeft - __SVGmapPosX - __SVGmapOffX;
			ixmaps.SVGmapHeight = window.innerHeight - __mapTop - __mapFooter - __SVGmapPosY - __SVGmapOffY;
			
			$("#attribution-div").css("bottom","18px");
		}

		if ($(this.gmapDiv)) {
			$(this.gmapDiv).css({
				"top": (__SVGmapPosY + __SVGmapOffY) + "px",
				"left": (__SVGmapPosX + __SVGmapOffX) + "px",
				"width": (ixmaps.SVGmapWidth) + "px",
				"height": (ixmaps.SVGmapHeight) + "px",
				"overflow": "hidden"
			});
		}
		if ($(this.svgDiv)) {
			$(this.svgDiv).css({
				"top": (__SVGmapPosY) + "px",
				"left": (__SVGmapPosX) + "px",
				"width": (__SVGmapOffX + ixmaps.SVGmapWidth) + "px",
				"height": (__SVGmapOffY + ixmaps.SVGmapHeight) + "px",
				"overflow": "hidden"
			});
		}
		if ($("#SVGMap")) {
			$("#SVGMap").css({
				"width": (__SVGmapOffX + ixmaps.SVGmapWidth) + "px",
				"height": (__SVGmapOffY + ixmaps.SVGmapHeight) + "px",
				"overflow": "hidden"
			});
		}
		if ($("#ixmap")) {
			$("#ixmap").css({
				"width": (__SVGmapOffX + ixmaps.SVGmapWidth) + "px",
				"height": (__SVGmapOffY + ixmaps.SVGmapHeight) + "px",
				"overflow": "hidden"
			});
		}
		if ($("#dummy-split-container")) {
			$("#dummy-split-container").css({
				"top": (__SVGmapPosY + __SVGmapOffY) + "px",
				"left": (__SVGmapPosX + __SVGmapOffX) + "px",
				"width": (ixmaps.SVGmapWidth) + "px",
				"height": (ixmaps.SVGmapHeight) + "px",
				"overflow": "hidden"
			});
		}

		htmlMap_setSize(ixmaps.SVGmapWidth, ixmaps.SVGmapHeight);

		this.htmlgui_resizeMap(fZoomTo, __SVGmapOffX + ixmaps.SVGmapWidth, __SVGmapOffY + ixmaps.SVGmapHeight, fCenter);

		try {
			this.htmlgui_onWindowResize();
		} catch (e) {}
	};


	// -----------------------------------
	// loading message 
	// -----------------------------------

	/**
	 * display the defined loading message
	 * @param szMessage the message text
	 * @type void
	 */
	ixmaps.showLoading = function (szMessage, fForce) {

		// GR 09.12.2016 ixmaps parameter defined to not show loading messages
		if (ixmaps.embeddedSVG && ixmaps.embeddedSVG.window.fExecuteSilent && !fForce) {
			return;
		}

		try {
			if (ixmaps.embeddedSVG) {
				szMessage = ixmaps.embeddedSVG.window.map.Dictionary.getLocalText(szMessage);
			}
		} catch (e) {}

		if (szMessage && (szMessage.length > 25)) {
			szMessage = "..." + szMessage.slice(-25);
		}

		/**
		if ( !$("#divloading")[0] )	{
			$(this.gmapDiv).append(
			'<div id="divloading" style="pointer-events:none;z-index:9999">'+
				'<div id="loading-text-div" style="position:absolute;top:47%;width:100%;opacity:1;z-index:99">'+
					'<div id="loading-text" style="font-family:arial;font-size:48px;opacity:1;'+
										'color: #cccccc;'+
										'background-color: #ffffff;'+
										'text-align:center;'+
										'">'+
					'</div>'+
					'<div id="loading-gif" style="margin-top:-1em"><img src="../../ui/resources/images/loading_blue.gif" style="display:block;position:absolute;top:3em;left:45%;margin:1em auto;height:64px"/></div>'+
					'</div>'+
				'</div>'+
			'</div>'
			);
		}
		**/
		if (!$("#divloading")[0]) {
			$(this.gmapDiv).append(
				'<div id="divloading" style="pointer-events:none;z-index:9999">' +
				'<div id="loading-text-div" class="loading-text-div">' +
				'<span id="loading-text" class="loading-text">.&nbsp;&nbsp;</span>' +
				'</div>' +
				'</div>'
			);
			$("#loading-text-div").css({
				"position": "absolute",
				"top": "47%",
				"width": "100%",
				"opacity": "1",
				"z-index": "99",
				"text-align": "center"
			});
			$("#loading-text").css({
				"font-family": "arial",
				"font-size": "28px",
				"opacity": "1",
				"color": "#666",
				"padding": "0.3em 1em 0.3em 1em",
				"border": "solid #666 1px",
				"border-radius": "0.2em",
				"background": "rgb(255, 255, 255, 0.6)"
			});
			$("#loading-gif").css({
				"margin-top": "-1em"
			});
			$("#loading-gif-img").css({
				"display": "block",
				"margin": "1em auto",
				"height": "64px"
			});
		}

		try {
			var top = (window.innerHeight * 0.4);
			var left = (window.innerWidth * 0.47);
			var gmapDiv = this.gmapDiv;
			if (gmapDiv && $(gmapDiv).css("visibility") == "visible") {
				top = parseInt($(gmapDiv).css("top")) + parseInt($(gmapDiv).css("height")) / 2;
				left = parseInt($(gmapDiv).css("left")) + parseInt($(gmapDiv).css("width")) / 2;
			}
			$("#divloading").css({
				"visibility": "visible",
				"top": String(top + "px"),
				"left": String(left + "px")
			});
			$("#loading-image").css("visibility", "visible");
			$("#loading-text-div").show();
			if (szMessage) {
				$("#loading-text").empty();
				$("#loading-text").append(szMessage);
			}

			ixmaps.blockLoadingMessage = true;

			clearTimeout(ixmaps.hideLoadingTimeout);
		} catch (e) {}
	};

	/**
	 * hide the loading message
	 * @type void
	 */
	ixmaps.hideLoading = function () {
		if (__showLoadingArrayCount > 0) {
			return;
		}

		try {
			$("#loading-image").css("visibility", "hidden");
			ixmaps.hideLoadingTimeout = setTimeout('$("#loading-text-div").hide()', 100);
			ixmaps.blockLoadingMessage = false;
		} catch (e) {}
	};

	// -----------------------------------
	// alternating loading message 
	// -----------------------------------

	var __showLoadingArray = [];
	var __showLoadingArrayCount = 0;
	var __showLoadingArrayIndex = 0;
	var __showLoadingArrayTimeout = null;
	var __showLoadingArrayActive = false;

	/**
	 * start displaying alternating loading messages
	 * @param szMessageA an array of alternative message texts
	 * @type void
	 */
	ixmaps.showLoadingArray = function (szMessageA) {
		__showLoadingArrayCount++;
		__showLoadingArray = szMessageA;
		__showLoadingArrayActive = true;
		__showLoadingArrayIndex = 0;
		ixmaps.showLoadingArrayNext();
	};
	/**
	 * show the next message from the array 
	 * @type void
	 */
	ixmaps.showLoadingArrayNext = function () {
		if (!__showLoadingArrayActive) {
			return;
		}
		ixmaps.showLoading(__showLoadingArray[__showLoadingArrayIndex++]);
		$("#loading-gif").show();

		__showLoadingArrayIndex = __showLoadingArrayIndex % (__showLoadingArray.length);
		__showLoadingArrayTimeout = setTimeout("ixmaps.showLoadingArrayNext()", 1000);
	};
	/**
	 * stot the alternating message display
	 * @type void
	 */
	ixmaps.showLoadingArrayStop = function () {
		__showLoadingArrayCount--;
		__showLoadingArrayActive = false;
		clearTimeout(__showLoadingArrayTimeout);
		if (__showLoadingArrayCount <= 0) {
			$("#loading-gif").hide();
		}
	};

	// -----------------------------------
	// set HTML map overlay
	// -----------------------------------

	/**
	 * display html text into map overlay
	 * @param szHTML the html text
	 * @type void
	 */
	ixmaps.setMapOverlayHTML = function (szHTML) {
		if (szHTML && szHTML.length) {
			$("#map-overlay").html(szHTML).show();
		} else {
			$("#map-overlay").html("").hide();
		}
	};
	
	/**
	 * display title
	 * @param szTitle an arbitrary text
	 * @type void
	 */
	ixmaps.setTitle = function (szTitle) {
		
		var szHtml = "";
		if (ixmaps.legendAlign && ixmaps.legendAlign=="left" ){
			szHtml = "<div style='float:right;margin-right:1em;;margin-top:0.5em;font-style:arial,helvetica;font-size:22px'>"+szTitle+"</div>";
		}else{
			szHtml = "<div style='position:relative;left:100px;top:10px;font-style:arial,helvetica;font-size:22px'>"+szTitle+"</div>";
		}
		this.setMapOverlayHTML(szHtml);
	};

	/**
	 * display title with border and background
	 * @param szTitle an arbitrary text
	 * @param szColor an arbitrary text
	 * @type void
	 */
	ixmaps.setTitleBox = function(szTitle,szColor){
		ixmaps.setTitle("<span style='padding: 0.3em 1em;border:solid #ddd 1px;border-radius:0.2em;font-family:courier new,Raleway,arial,helvetica;background:"+(szColor||"rgba(255,255,255,0.9)")+";color:"+(szColor?"#fff":"#888")+"'>"+szTitle+"</span");
	};

	// -----------------------------------
	// show/hide HTML map
	// -----------------------------------

	ixmaps.HTML_showMap = function () {
		if (this.fSVGInitializing) {
			return;
		}
		if (this.gmapDiv && !this.gmap) {
			this.gmap = this.loadGMap(this.szMapService);
			this.htmlMap = true;

			// --------------------------------------------------------
			// event error work around
			// --------------------------------------------------------
			// GR 09.04.2018 some broser don't get events through overlay SVG even if there pointer-events == none
			// we create a transparent pane on top to enable zoom and pan of the HTML basemap 
			aDiv = document.createElement("div");
			aDiv.setAttribute("id", "androideventpane");
			aDiv.setAttribute("class", "androideventpane");
			aDiv.setAttribute("style", "position:absolute;width:100%;height:100%;z-index:100");
			$('#' + this.szGmapDiv)[0].appendChild(aDiv);

		}
		$(this.gmapDiv).css("visibility", "visible");
		this.hideNorthArrow();
	};

	ixmaps.HTML_hideMap = function () {
		//$(this.gmapDiv).css("visibility","hidden");
		this.showNorthArrow();
	};

	ixmaps.HTML_toggleMap = function () {
		if ($(this.gmapDiv).css("visibility") == "visible") {
			this.HTML_hideMap();
			this.htmlMap = false;
		} else {
			this.HTML_showMap();
			this.htmlMap = true;
			this.htmlgui_synchronizeMap(false, false);
		}
	};

	/** query HTML map visibility
	 */
	ixmaps.htmlgui_isHTMLMapVisible = function () {
		return ($(this.gmapDiv).css("visibility") == "visible");
	};

	// -----------------------------------
	// show/hide SVG map
	// -----------------------------------

	ixmaps.HTML_toggleSVG = function () {
		if ($(this.svgDiv).css("width") == (__SVGmapOffX + "px")) {
			$(this.svgDiv).css("width", (__SVGmapOffX + ixmaps.SVGmapWidth) + "px");
		} else {
			$(this.svgDiv).css("width", (__SVGmapOffX) + "px");
		}
	};

	// -----------------------------------
	//	map opacity
	// -----------------------------------

	ixmaps.setSVGMapOpacity = function (nValue, szMode) {
		try {
			ixmaps.embeddedSVG.window.map.setOpacity(nValue, szMode);
		} catch (e) {}
	};
	ixmaps.toggleSVGMapOpacity = function () {
		try {
			ixmaps.embeddedSVG.window.map.toggleOpacity();
		} catch (e) {}
	};
	ixmaps.setHTMLMapOpacity = function (nValue, szMode) {
		var nOpacity = Number($(this.gmapDiv).css("opacity") || 1);
		nOpacity += nValue;
		$(this.gmapDiv).css("opacity", String(nOpacity));
	};


	/* ------------------------------------------------------------------ * 
		helper
	 * ------------------------------------------------------------------ */

	/**
	 * set map features
	 * @param {String} szFeatures a style string like "item1:value1;item2:value2;" 
	 * @return void
	 * @example	ixmaps.setMapFeatures("popupdelay:250;toolmargintop:60;flushPaintShape:5000;flushChartDraw:5000;featurescaling:true;objectscaling:dynamic;labelscaling:dynamic;dynamiclabel:NOSIZE;labelspace:2.0;checklabeloverlap:NOSQUEEZE;loadsilent:true;");
	 * @deprecated please use {@link ixmaps.setOptions} 
	 */
	ixmaps.setMapFeatures = function (szFeatures) {
		ixmaps.embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
		ixmaps.embeddedSVG.window.map.Viewport.reformat();
		return ixmaps;
	};

	/**
	 * set map options
	 * @param {Object} opt option object  like {item1:value1,item2:value2} 
	 * @return void
	 */
	ixmaps.setOptions = function (opt) {
		if (opt) {
			var szFeatures = "";
			for (var i in opt) {
				if ((typeof (i) == "string") && (i.match(/syncMap/i))) {
					this.fSyncMap = ((typeof (opt[i]) == "string") ? (opt[i] == "true") : opt[i]);
				} else
				if ((typeof (i) == "string") && (i.match(/autoSwitchInfo/i))) {
					this.setAutoSwitchInfo((typeof (opt[i]) == "string") ? (opt[i] == "true") : opt[i]);
				} else
				if ((typeof (i) == "string") && (i.match(/panHidden/i))) {
					this.panHidden = (typeof (opt[i]) == "string") ? (opt[i] == "true") : opt[i];
				} else
				if ((typeof (i) == "string") && (i.match(/normalSizeScale/i))) {
					this.setScaleParam({
						"normalSizeScale": opt[i]
					});
				} else
				if ((typeof (i) == "string") && (i.match(/basemapopacity/i))) {
					$(this.gmapDiv).css("opacity", opt[i]);
				} else {
					szFeatures += String(i + ":" + opt[i] + ";");
				}
			}
			ixmaps.embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
		}
		return ixmaps;
	};

	/**
	 * set map scale parameter
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szParam a style string like "item1:value1;item2:value2;" 
	 * @return void
	 * @example	ixmaps.setScaleParam("normalSizeScale:50000;labelScaling:1.5");
	 */
	ixmaps.setScaleParam = function (param) {
		if (param) {
			if (typeof (param) == 'string') {
				try {
					eval('param = {' + param.replace(/;/g, ',') + '}');
				} catch (e) {
					alert("invalid scale param: \"" + param + "\"");
					return;
				}
			}
			ixmaps.embeddedSVG.window.map.Api.setScaleParam(param);
		}
		return ixmaps;
	};


	// -----------------------------
	// map themes handling
	// -----------------------------

	ixmaps.newTheme = function (szThemeName, theme, fClear) {

		if (!theme) {
			alert("no theme defined");
			return;
		}
		// clone opt to not destroy the original
		// method found on stackoverflow.org
		ixmaps.tempTheme = JSON.parse(JSON.stringify(theme));

		// to clear, call clearAll() and give time by setTimeout 
		if (fClear) {
			if (fClear == "force") {
				theme.style.type += "|FORCE";
			}
			if (fClear == "clearcharts") {
				this.clearAllCharts();
			} else {
				this.clearAll();
			}
		}

		// set theme title to theme name if not defined in theme object
		if (!theme.style.title && szThemeName) {
			theme.style.title = szThemeName;
		}

		// GR 30.01.2021 
		//
		if (theme.type) {
			theme.style["type"] = theme.type;
		}
		
		// GR 30.01.2021  
		//
		if (theme.meta) {
			for (var i in theme.meta) {
				theme.style[i] = theme.meta[i];
			}
		}
		
		// GR 10.01.2019 new theme object data{} --> old JSON structure -> object style 
		//
		if (theme.data) {
			for (var i in theme.data) {
				if (i == "obj") {
					theme.style["dbtableObj"] = theme.data[i];
				} else
				if (i == "name") {
					theme.style["dbtable"] = theme.data[i];
				} else
				if (i == "url") {
					theme.style["dbtableUrl"] = theme.data[i];
				} else
				if (i == "type") {
					theme.style["dbtableType"] = theme.data[i];
				} else
				if (i == "ext") {
					theme.style["dbtableExt"] = theme.data[i];
				} else
				if (i == "process") {
					theme.style["dbtableProcess"] = theme.data[i].replace(/\s\s+/g, ' ');
				} else
				if (i == "query") {
					theme.style["dbtableQuery"] = theme.data[i].replace(/\s\s+/g, ' ');
				} else
				if (i == "cache") {
					theme.style["datacache"] = theme.data[i];
				} else
				if (i == "field") {
					theme["field"] = theme.data[i];
				} else
				if (i == "field100") {
					theme["field100"] = theme.data[i];
				} else {
					theme.style[i] = theme.data[i];
				}
			}
		}
		
		// GR 24.01.2022 new theme object binding{} --> old JSON structure -> object style 
		//
		if (theme.binding) {
			for (var i in theme.binding) {
				if ((i == "id") ||
					(i == "item") ||
				    (i == "itemfield")) {
					theme.style["itemfield"] = theme.binding[i];
				} else
				if ((i == "geo") ||
					(i == "georef") ||
					(i == "position") ||
					(i == "lookup") ||
					(i == "lookupfield")) {
					theme.style["lookupfield"] = theme.binding[i];
				} else
				if ((i == "geo1") ||
					(i == "georef1") ||
					(i == "position1") ||
					(i == "lookup1") ||
					(i == "lookupfield1")) {
					theme.style["lookupfield"] = theme.binding[i];
				} else
				if ((i == "geo2") ||
					(i == "georef2") ||
					(i == "position2") ||
					(i == "lookup2") ||
					(i == "lookupfield2")) {
					theme.style["lookupfield2"] = theme.binding[i];
				} else
				if ((i == "value") ||
					(i == "values") ||
					(i == "field") ||
					(i == "fields")) {
					theme["field"] = theme.binding[i];
				} else
				if ((i == "value100") ||
					(i == "field100")){
					theme["field100"] = theme.binding[i];
				} else
				if ((i == "size") ||
					(i == "sizefield")) {
					theme.style["sizefield"] = theme.binding[i];
				} else
				if ((i == "color") ||
					(i == "colorfield")) {
					theme.style["colorfield"] = theme.binding[i];
				} else
				if ((i == "alpha") || 
					(i == "alphafield")) {
					theme.style["alphfield"] = theme.binding[i];
				} else
				if ((i == "title") ||
					(i == "titlefield")) {
					theme.style["titlefield"] = theme.binding[i];
				} else
				if ((i == "aggregation") ||
					(i == "aggregationfield")) {
					theme.style["aggregationfield"] = theme.binding[i];
				} else
				if ((i == "time") ||
					(i == "timefield")) {
					theme.style["timefield"] = theme.binding[i];
				}
			}
		}
		
		// GR 07.02.20221 check and preset default values for geojson/topojson
		if ( theme.style["dbtabletype"] && theme.style["dbtabletype"](/geojson|topojson/i) ){
			theme.style["lookupfield"] = theme.style["lookupfield"] || "geometry";	
			theme.style["type"] = theme.style["type"] || "FEATURES|NOLEGEND";	
		}

		// GR 25.01.2022 new: user defined data given by object
		if ( theme.style["dbtableObj"] ){
			ixmaps.setExternalData(
					   theme.style["dbtableObj"],
					   {type:theme.style["dbtableType"],name:theme.style["dbtable"]});
			theme.style["dbtableObj"] = null;
			theme.style["dbtableType"] = null;
		}

		// GR 07.01.2022 new: user defined a data processing function given by string
		if (theme.style["dbtableProcess"]){
			try {
				eval("ixmaps."+theme.style["dbtable"]+" = ixmaps."+theme.style["dbtable"]+" || {}");
				eval("ixmaps."+theme.style["dbtable"]+".process = "+theme.style["dbtableProcess"]);
			} catch (e) {
				ixmaps.error("data.process - function not valid: '" + e, 2000);
			}
		}
		if (theme.style["dbtableQuery"]){
			try {
				eval("ixmaps."+theme.style["dbtable"]+" = ixmaps."+theme.style["dbtable"]+" || {}");
				eval("ixmaps."+theme.style["dbtable"]+" = "+theme.style["dbtableQuery"]);
			} catch (e) {
				ixmaps.error("data.query - function not valid: '" + e, 2000);
			}
		}

		try {
			ixmaps.embeddedSVG.window.map.Api.newMapThemeByObj(theme);
		} catch (e) {}
	};
	
	ixmaps.newStyleThemeJson = function (origTheme) {
		var theme = {};
		theme.layer = origTheme.layer;
		theme.data = {};
		theme.field = origTheme.field;
		theme.field100 = origTheme.field100;
		theme.style = origTheme.style;
		for (var i in theme.style) {
			if (i == "dbtable") {
				theme.data["name"] = theme.style[i];
				theme.style[i] = null;
			}
			if (i == "dbtableType") {
				theme.data["type"] = theme.style[i];
				theme.style[i] = null;
			}
			if (i == "dbtableUrl") {
				theme.data["url"] = theme.style[i];
				theme.style[i] = null;
			}
			if (i == "dbtableExt") {
				theme.data["ext"] = theme.style[i];
				theme.style[i] = null;
			}
			if (i == "datacache") {
				theme.data["cache"] = theme.style[i];
				theme.style[i] = null;
			}
		}
		return theme;
	};
	ixmaps.refreshTheme = function (szThemeId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.refreshTheme(szThemeId);
		} catch (e) {}
	};
	ixmaps.removeTheme = function (szThemeId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.removeTheme(szThemeId);
		} catch (e) {}
	};
	ixmaps.showTheme = function (szThemeId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.showTheme(szThemeId);
		} catch (e) {}
	};
	ixmaps.hideTheme = function (szThemeId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.hideTheme(szThemeId);
		} catch (e) {}
	};
	ixmaps.toggleTheme = function (szThemeId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.toggleTheme(szThemeId);
		} catch (e) {}
	};
	ixmaps.clearAll = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAll();
		} catch (e) {}
	};
	ixmaps.clearAllCharts = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
		} catch (e) {}
	};
	ixmaps.clearAllChoropleth = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAllChoropleth();
		} catch (e) {}
	};
	ixmaps.clearAllOverlays = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
		} catch (e) {}
	};
	ixmaps.clearHighlight = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearHighlight();
		} catch (e) {}
	};
	ixmaps.changeObjectScaling = function (nDelta) {
		try {
			ixmaps.embeddedSVG.window.map.Api.changeObjectScaling(nDelta);
		} catch (e) {}
	};
	ixmaps.changeFeatureScaling = function (nDelta) {
		try {
			ixmaps.embeddedSVG.window.map.Api.changeFeatureScaling(nDelta);
		} catch (e) {}
	};
	ixmaps.changeLabelScaling = function (nDelta) {
		try {
			ixmaps.embeddedSVG.window.map.Api.changeLabelScaling(nDelta);
		} catch (e) {}
	};
	ixmaps.changeLineScaling = function (nDelta) {
		try {
			ixmaps.embeddedSVG.window.map.Api.changeLineScaling(nDelta);
		} catch (e) {}
	};
	ixmaps.changeRotation = function (nDelta) {
		try {
			ixmaps.embeddedSVG.window.map.Api.changeRotation(nDelta);
		} catch (e) {}
	};
	ixmaps.showNorthArrow = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.showNorthArrow();
		} catch (e) {}
	};
	ixmaps.hideNorthArrow = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.hideNorthArrow();
		} catch (e) {}
	};
	ixmaps.popupThemeMenu = function (szId) {
		try {
			ixmaps.embeddedSVG.window.map.Api.popupThemeStyleMenu(szId);
		} catch (e) {}
	};
	_valuesFlag = false;
	ixmaps.toggleThemeValues = function (fFlag) {
		try {
			_valuesFlag = !_valuesFlag;
			ixmaps.embeddedSVG.window.map.Api.toggleThemeValues(_valuesFlag);
		} catch (e) {}
	};
	_legendsFlag = true;
	ixmaps.toggleThemeLegends = function (fFlag) {
		try {
			_legendsFlag = (typeof (fFlag) != "undefined") ? fFlag : !_legendsFlag;
			ixmaps.embeddedSVG.window.map.Api.toggleThemeLegends(_legendsFlag);
		} catch (e) {}
	};
	ixmaps.extendMap = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.extendMap();
			setTimeout("ixmaps.embeddedSVG.window.map.Api.hideLegend()", 1);
		} catch (e) {}
	};
	ixmaps.normalMap = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.normalMap();
			ixmaps.embeddedSVG.window.map.Api.showLegend();
		} catch (e) {}
	};
	var __fLegendSideBar = true;
	ixmaps.toggleLegend = function () {
		if (__fLegendSideBar) {
			ixmaps.extendMap();
		} else {
			ixmaps.normalMap();
		}
		__fLegendSideBar = !__fLegendSideBar;
	};
	ixmaps.zoomMapByList = function () {
		var zoomList = window.document.getElementById("zoomList");
		this.zoomMap(zoomList.value, 'byscale');
	};
	ixmaps.resetMap = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAll();
			ixmaps.embeddedSVG.window.map.Api.doZoomMapToFullExtend();
			this.htmlgui_synchronizeMap(false, true);
			ixmaps.resetCenter();
		} catch (e) {}
	};
	ixmaps.resetCenter = function () {
		var arrayPtLatLon = htmlMap_getBounds();
		ixmaps.embeddedSVG.window.map.Api.doSetMapToGeoBounds(
			arrayPtLatLon[0].lat,
			arrayPtLatLon[0].lng,
			arrayPtLatLon[1].lat,
			arrayPtLatLon[1].lng);
	};
	ixmaps.clearOverlays = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
		} catch (e) {}
	};

	ixmaps.changeThemeStyle = function (szThemeName, szStyle, szFlag, szPlus) {
		// may be called with szMap == null, then shift arguents
		if (arguments[0] == arguments[1]) {
			[].shift.call(arguments);
		}
		try {
			ixmaps.embeddedSVG.window.map.Api.changeThemeStyle(arguments[0], arguments[1], arguments[2]);
		} catch (e) {}
	};

	ixmaps.zoomToTheme = function (szThemeName) {
		try {
			ixmaps.embeddedSVG.window.map.Api.zoomToTheme(szThemeName);
		} catch (e) {}
	};

	ixmaps.getThemes = function () {
		try {
			return ixmaps.embeddedSVG.window.map.Api.getAllThemes();
		} catch (e) {
			return null;
		}
	};

	ixmaps.getThemeObj = function (szThemeName) {
		try {
			if (!szThemeName) {
				szThemeName = ixmaps.parentApi.getLegendThemeId();
			}
			return ixmaps.embeddedSVG.window.map.Api.getTheme(szThemeName);
		} catch (e) {
			return null;
		}
	};

	ixmaps.getThemeDefinitionObj = function (szThemeName) {
		try {
			if (!szThemeName) {
				szThemeName = ixmaps.parentApi.getLegendThemeId();
			}
			var themeObj = ixmaps.embeddedSVG.window.map.Api.getMapThemeDefinitionObj(szThemeName); 
			//themeObj = ixmaps.newStyleThemeJson(themeObj);
			return themeObj;
		} catch (e) {
			return null;
		}
	};

	ixmaps.getThemeStyleString = function (szThemeName) {
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeStyleString(szThemeName);
		} catch (e) {
			return null;
		}
	};

	/**
	 * get the data of a theme object or map item
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the data as JSON object
	 */
	ixmaps.getData = function (szItem) {
		try {
			var theme = szItem.split(":")[0];
			if (theme && (szItem.match("chartgroup") || szItem.match("chartontop") || szItem.match("text"))) {
				// if is something like "theme:layername::itemname:chartgroup"
				// remove first and the last ":" qualifier from id
				szItem = szItem.split(":");
				szItem.shift();
				szItem.pop();
				szItem = szItem.join(":");

				var dataA = ixmaps.embeddedSVG.window.map.Api.getMapThemeDataRow(theme, szItem);
				var result = [];
				var data = {};
				var nItems = dataA.length / 2;
				for (i = 0; i < nItems; i++) {
					if (data[dataA[i]]) {
						result.push(data);
						data = {};
					}
					data[dataA[i]] = dataA[i + nItems];
				}
				result.push(data);
				return result;
			}
		} catch (e) {
			return null;
		}
	};

	/**
	 * get the position of a theme object or map item
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the position as JSON object
	 */
	ixmaps.getPosition = function (szItem) {
		try {
			var theme = szItem.split(":")[0];
			if (theme.match("theme")) {
				szItem = szItem.split(theme + ":")[1];
				szItem = szItem.split(":chartgroup")[0];
				return ixmaps.embeddedSVG.window.map.Api.getMapThemeItemPosition(null, szItem);
			}
		} catch (e) {
			return null;
		}
	};
	/**
	 * mark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.markThemeClass = function (szThemeId, nIndex) {
		try {
			ixmaps.embeddedSVG.window.map.Api.markThemeClass(szThemeId, nIndex);
		} catch (e) {
			return null;
		}
	};
	/**
	 * unmark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.unmarkThemeClass = function (szThemeId, nIndex) {
		try {
			ixmaps.embeddedSVG.window.map.Api.unmarkThemeClass(szThemeId, nIndex);
		} catch (e) {
			return null;
		}
	};
	/**
	 * set theme time frame
	 * @param szThemeId the id of the theme received on create
	 * @param nUMin lower time limint (utime)
	 * @param nUMax upper time limint (utime)
	 * @return void
	 */
	ixmaps.setThemeTimeFrame = function (szThemeId, nUMin, nUMax) {
		try {
			ixmaps.embeddedSVG.window.map.Api.setThemeTimeFrame(szThemeId, nUMin, nUMax);
		} catch (e) {
			return null;
		}
	};

	/**
	 * filter theme items 
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 */
	ixmaps.filterThemeItems = function (szThemeId, szFilter, mode) {
		try {
			ixmaps.embeddedSVG.window.map.Api.filterThemeItems(szThemeId, szFilter, mode);
		} catch (e) {
			return null;
		}
	};

	/**
	 * highlight theme items 
	 * @param szThemeId the id of the theme received on create
	 * @param szItems the id of the items to highlight
	 * @param mode an additional flag
	 * @return void
	 */
	ixmaps.highlightThemeItems = function (szThemeId, szItems, separator) {
		try {
			ixmaps.embeddedSVG.window.map.Api.highlightThemeItems(szThemeId,szItems,separator);
		} catch (e) {
			return null;
		}
	};

	/**
	 * pause theme clip
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.pauseThemeClip = function(szThemeId){
		try {
			ixmaps.embeddedSVG.window.map.Api.pauseClip(szThemeId);
		} catch (e) {
			return null;
		}
	};

	/**
	 * start theme clip
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.startThemeClip = function(szThemeId,nFrame){
		try {
			ixmaps.embeddedSVG.window.map.Api.startClip(szThemeId,nFrame);
		} catch (e) {
			return null;
		}
	};

	/**
	 * set theme clip frame
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {Number} nFrame number of the clip frame to show
	 * @return void
	 */
	ixmaps.setThemeClipFrame = function(szThemeId,nFrame){
		try {
			ixmaps.embeddedSVG.window.map.Api.setClipFrame(szThemeId,nFrame);
		} catch (e) {
			return null;
		}
	};

	/**
	 * next theme clip frame
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.nextThemeClipFrame = function(szThemeId){
		try {
			ixmaps.embeddedSVG.window.map.Api.nextClipFrame(szThemeId);
		} catch (e) {
			return null;
		}
	};
		
	/**
	 * create a selection of theme items by a given shape, buffer
	 * @param {String} szThemeId the id of the theme with map items to select
	 * @param {String} szSelectShape the id of the selection shape
	 * @param {String} szStyle one of "circle","square","shape"
	 * @param {String} szTitle an optional title 
	 * @return void
	 */
	ixmaps.newSelection = function (szThemes,szSelectShape,szStyle,szTitle) {
		try {
			ixmaps.embeddedSVG.window.map.Api.newMapSelection(szThemes,szSelectShape,szStyle,szTitle);
		} catch (e) {}
	};

	/**
	 * zoom to map item
	 * @param {String} szItemId the id of the map item
	 * @return void
	 */
	ixmaps.zoomMapToItem = function (szItemId) {
		ixmaps.embeddedSVG.window.map.Api.zoomMapToItem(szItemId);
	};
	
	// -----------------------------
	// html button handler
	// -----------------------------

	ixmaps.panMap = function (nDeltaX, nDeltaY, szMode) {
		try {
			ixmaps.embeddedSVG.window.map.Api.doPanMap(nDeltaX, nDeltaY, szMode);
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.zoomMap = function (nIndex, szMode, newZoom) {
		try {
			var zoomSelect = window.document.getElementById("zoomList");
			var newScale = ixmaps.embeddedSVG.window.map.Api.doZoomMap(nIndex, szMode, newZoom);
			if (szMode == null) {
				zoomSelect.options[zoomSelect.options.length - 1].text = "1:" + newScale;
				zoomSelect.selectedIndex = zoomSelect.options.length - 1;
			}
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.clipLayer = function (szLayerName, nWidth) {
		try {
			ixmaps.embeddedSVG.window.map.Api.setLayerClip(szLayerName, nWidth);
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.clipMap = function (nWidth) {
		try {
			ixmaps.embeddedSVG.window.map.Api.setMapClip(nWidth);
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.backwardsMap = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.backwards();
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.forwardsMap = function () {
		try {
			ixmaps.embeddedSVG.window.map.Api.forwards();
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.mapTool = function (szMode) {
		if ((szMode == "pan")) {
			try {
				ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
			} catch (e) {
				alert('map api error!');
			}
		}
		try {
			ixmaps.embeddedSVG.window.map.Api.setMapTool(szMode);
		} catch (e) {
			alert('map api error!');
		}
	};
	ixmaps.setMapTool = function (szMode) {
		ixmaps.mapTool(szMode);
	};
	ixmaps.getMapTool = function () {
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapTool();
		} catch (e) {
			alert('map api error!');
		}
	};

	// ----------------------------------------------------------------------
	// Interface between SVG and HTML for zoom, pan and scale synchronizing
	// functions that will be called by the SVG map script
	// ----------------------------------------------------------------------

	/**
	 * called if SVG map is loaded and in phase di initialising
	 * permits to intervent in the initialising process
	 * @param mapwindow the window handle of the SVG map 
	 * @return ---
	 */
	ixmaps.htmlgui_onMapInit = function (mapwindow) {

		_LOG("init ...");

		this.fSVGInitializing = true;

		this.embeddedSVG = new Object({
			window: mapwindow
		});

		this.dataLoaderA = [];

		if (this.fMapLegendStyle.match(/hidden/)) {
			this.extendMap();
		}
	};

	/**
	 * called if SVG map is loaded and in phase di initialising
	 * permits to intervent in the initialising process
	 * @param mapwindow the window handle of the SVG map 
	 * @return ---
	 */
	ixmaps.htmlgui_onMapError = function () {
		alert("error");

		_LOG("onMapError");

		this.fSVGInitializing = false;

		// hide loding image 
		// --------------------------
		try {
			$("#divloading").css("visibility", "hidden");
			$("#ixmap").css("background", "#fff");
		} catch (e) {}

		// call user defined method on map ready
		// --------------------------------------------------------
		if (this.callback) {
			this.callback(this);
		} else {
			this.onMapReady(this.szName);
		}
	};

	/**
	 * check if ixmaps has already synchronized the two maps SVG and HTML 
	 * @param void
	 * @return void
	 */
	ixmaps.htmlgui_checkSync = function () {

		if (!ixmaps.fSynchronized) {
			ixmaps.htmlgui_synchronizeMap(false, true);
		}
	};
	/**
	 * called if SVG map is loaded and formatted
	 * @param mapwindow the window handle of the SVG map 
	 * @return ---
	 */
	ixmaps.htmlgui_onMapReady = function (mapwindow) {

		_LOG("ready");
		this.fSVGInitializing = false;

		ixmaps.blockLoadingMessage = false;

		if (this.htmlMap && this.gmapDiv) {
			ixmaps.HTML_showMap();
			// setTimeout("$('#loading-text').empty()",250);
		} else {
			var div = window.document.getElementById("svgmapdiv");
			if (div) {
				try {
					div.style.setProperty("visibility", "visible", null);
				} catch (e) {
					div.style["visibility"] = "visible";
				}
			}
			setTimeout("ixmaps.hideLoading()", 250);
			this.mapTool("pan");
		}

		// enable access to the SVG map
		// ----------------------------
		this.embeddedSVG = new Object({
			window: mapwindow
		});
		try {
			this.embeddedSVG.window._TRACE("==> htmlgui: onMapReady() ! ==>   ==>   ==>   ==>   ==>   ==>   ==>   ==>");
		} catch (e) {}
		if (this.parentApi && this.parentApi.setEmbeddedSVG) {
			this.parentApi.setEmbeddedSVG(this.embeddedSVG);
		}

		// set loaded map flag
		// --------------------------------------------------------
		this.loadedMap = this.loadingMap || "";
		delete this.loadingMap;

		// call user defined method on map ready
		// --------------------------------------------------------

		if (this.callback) {
			this.callback(this);
		} else {
			try {
				this.onMapReady(this.szName);
			} catch (e) {}
			// bubble it up !
			try {
				this.parentApi.onMapReady(this.szName);
			} catch (e) {}
		}
		if (this.fSilent) {
			this.embeddedSVG.window.map.Api.setMapFeatures('worksilent:true');
			this.embeddedSVG.window.map.Api.setMapFeatures('loadsilent:true');
		}

		// in case we have no user defined view in the initializing process, we must program a sync via timeout !
		setTimeout("ixmaps.htmlgui_checkSync()", 1000);

		$("#loading-gif").hide();

	};

	/**
	 * called if SVG map has been resized (e.g. legend switched off)
	 * @return ---
	 */
	ixmaps.htmlgui_onMapResize = function () {

		// adapt the HTML map to the canvas offsets of the SVG map
		// --------------------------------------------------------
		try {
			var mapBox = this.embeddedSVG.window.map.Api.getMapBox();
			this.resizeMap(mapBox, false);
		} catch (e) {}
	};

	/**
	 * set actual scale in HTML scale select form 
	 * @param newScale the scale to set (integer value)
	 * @return ---
	 */
	ixmaps.htmlgui_setScaleSelect = function (newScale) {
		if (this.embeddedSVG) {
			try {
				var zoomSelect = window.document.getElementById("zoomList");
				zoomSelect.options[zoomSelect.options.length - 1].text = "1:" + newScale;
				zoomSelect.selectedIndex = zoomSelect.options.length - 1;
			} catch (e) {}
		}
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_setScaleSelect(newScale);
		}
	};

	/**
	 * set actual map envelope
	 * save in cookie and synchronize evt. HTML map
	 * @param szEnvelope the scale to set (integer value)
	 * @return ---
	 */
	ixmaps.htmlgui_setCurrentEnvelope = function (szEnvelope, fZoomto) {
		if (this.embeddedSVG) {
			try {
				this.htmlgui_synchronizeMap(false, fZoomto);
			} catch (e) {}
		}
	};

	/**
	 * Is called by the map to open a browser popup window
	 */
	ixmaps.htmlgui_popupWindow = function (szUrl) {
		window.open(szUrl, "test", "dependent=yes,alwaysRaised=yes,width=600,height=700,resizable=yes,scrollbars=yes");
	};

	/**
	 * Is called by the map to notify the active theme (necessary?)
	 */
	ixmaps.htmlgui_setActiveTheme = function (szTheme) {
		$("#switchinfobutton").show();
	};

	/**
	 * Is called by the map to notify the actual theme (necessary?)
	 */
	ixmaps.htmlgui_setActualTheme = function (szTheme) {
		ixmaps.initThemeTools();
	};

	/**
	 * Is called on resize of hosting window
	 */
	ixmaps.htmlgui_resizeMap = function (fZoomTo, nWidth, nHeight, fCenter) {

		var szMethod = fCenter ? "center" : "extendmax";
		// GR 15.10.2015 test
		szMethod = "center";
		if (ixmaps.embeddedSVG) {
			if (nWidth && nHeight) {
				ixmaps.embeddedSVG.window.map.Api.resizeCanvas(0, 0, nWidth, nHeight, szMethod);
			} else {
				ixmaps.embeddedSVG.window.map.Api.resizeCanvas(0, 0, ixmaps.embeddedSVG.window.innerWidth, ixmaps.embeddedSVG.window.innerHeight, szMethod);
			}
		}
		ixmaps.htmlgui_synchronizeMap(false, fZoomTo);
	};

	/**
	 * Is called by the map script when the map is loaded; to get parameter
	 */
	__mapsEmbedA = null;
	__mapsEmbedded = 0;
	__mapsLoaded = 0;

	ixmaps.htmlgui_queryMapFeatures = function () {

		if (__mapsEmbedA == null) {
			__mapsEmbedA = new Array(0);
			var embedsA = window.document.embeds;
			for (var a in embedsA) {
				if (a.match(/SVG/)) {
					__mapsEmbedA[a] = a;
					__mapsEmbedded++;
				}
			}
		}
		if (++__mapsLoaded == __mapsEmbedded) {
			for (a in __mapsEmbedA) {
				htmlgui_setEmbedName(a);
			}
		}
	};

	/**
	 * Is called for every (embedded) SVG when all (embedded) maps are loaded
	 */
	htmlgui_setEmbedName = function (szEmbed) {
		var embeddedSVG = window.document.getElementById(szEmbed);
		// 1. set the name of the embedding object ( necessary because the SVG DOM has no way to know its embedding parent 
		embeddedSVG.window.map.setFeatures("embedname:" + szEmbed);
		// 2. try to call a function, that, if defined, may push init actions for this map; if all parts of the map are loaded, this actions are evaluated
		try {
			htmlgui_queryActions(szEmbed);
		} catch (e) {}
	};

	/**
	 * Is called by the svg map script when the map tool has been changed
	 */
	ixmaps.htmlgui_setMapTool = function (szToolId) {
		try {
			if (szToolId == "") {
				/**
				ixmaps.htmlgui_onMapTool("pan");

				$("#zoom")[0].checked=false; 
				$("#pan")[0].checked=true; 
				$("#tools").buttonset().refresh();
				**/
			}
		} catch (e) {}
		try {
			this.htmlgui_onMapTool(szToolId);
		} catch (e) {}
	};

	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	var infoWindow = null;
	var tDisplayInfo = null;
	ixmaps.htmlgui_displayInfo = function (szMessage) {
		if (szMessage.length >= 3) {
			//ixmaps.showLoadingArrayStop();
			ixmaps.htmlgui_doDisplayInfo(szMessage);
			ixmaps.blockLoadingMessage = false;
		}
	};
	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	ixmaps.htmlgui_doDisplayInfo = function (szMessage) { //return;

		if (szMessage && (szMessage.length > 25)) {
			szMessage = szMessage.slice(0, 25) + " ...";
		}
		if (szMessage.match("error")) {
			szMessage = "<span style='color:red'>" + szMessage + "</span>";
		}
		$("#loading-text").empty();
		$("#loading-text").append(szMessage);
		ixmaps.showLoading();
		return;
	};
	/**
	 * Is called by the svg map script to delete messages display in a HTML window
	 */
	ixmaps.htmlgui_killInfo = function () {
		if (ixmaps.blockLoadingMessage) {
			ixmaps.blockLoadingMessage = false;
			setTimeout("ixmaps.htmlgui_killInfo()", 1000);
			return;
		}
		clearTimeout(tDisplayInfo);
		//$("#loading-text").empty();
		setTimeout("ixmaps.hideLoading()", 250);
		return;
	};
	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	ixmaps.htmlgui_isInfoDisplay = function () {
		return $("#loading-text")[0].innerHTML.length;
	};

	/**
	 * Is called by the svg map script to log error messages 
	 */
	ixmaps.htmlgui_errorLog = function (szMessage) {
		ixmaps.error(szMessage);
		ixmaps.status(szMessage,2000);
	};

	// ---------------------------------------------------------
	// foreward these events to an hosting window, if present
	// ---------------------------------------------------------

	ixmaps.htmlgui_onItemOver = function (evt,szId) {
		if (ixmaps.parentApi != ixmaps) {
			return ixmaps.parentApi.htmlgui_onItemOver(evt,szId);
		}
	};
	
	ixmaps.htmlgui_onItemClick = function (evt,szId) {
		if (ixmaps.parentApi != ixmaps) {
			return ixmaps.parentApi.htmlgui_onItemClick(evt,szId);
		}
	};

	ixmaps.htmlgui_onInfoDisplay = function (szId) {
		if (ixmaps.parentApi != ixmaps) {
			return ixmaps.parentApi.htmlgui_onInfoDisplay(szId);
		}
	};

	ixmaps.htmlgui_onSelection = function (szId) {
		if (ixmaps.parentApi != ixmaps) {
			return ixmaps.parentApi.htmlgui_onSelection(szId);
		}
	};

	ixmaps.htmlgui_onNewTheme = function (szId) {
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_onNewTheme(szId);
		}
	};

	ixmaps.htmlgui_onDrawTheme = function (szId) {
		try {
			ixmaps.updatePageHistory();
		} catch (e) {}
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_onDrawTheme(szId);
		}
	};

	ixmaps.htmlgui_onRemoveTheme = function (szId) {
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_onRemoveTheme(szId);
		}
	};

	ixmaps.htmlgui_onErrorTheme = function (szId) {
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_onErrorTheme(szId);
		}
	};

	ixmaps.htmlgui_initChart = function (SVGDoc, args) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_initChart(SVGDoc, args) : null;
	};

	ixmaps.htmlgui_drawChart = function (SVGDoc, args) { 
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_drawChart(SVGDoc, args) : null;
	};

	ixmaps.htmlgui_drawChartAfter = function (SVGDoc, args) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_drawChartAfter(SVGDoc, args) : null;
	};

	ixmaps.htmlgui_onTooltipDisplay = function (evt,szText,args) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_onTooltipDisplay(evt,szText,args) : szText;
	};

	ixmaps.htmlgui_onTooltipDelete = function (szText,args) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_onTooltipDelete(szText,args) : szText;
	};

	ixmaps.htmlgui_onInfoTitle = function (szText, item) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_onInfoTitle(szText, item) : szText;
	};

	ixmaps.htmlgui_onInfoDisplayExtend = function (svgDoc, szId) {
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_onInfoDisplayExtend(svgDoc, szId) : null;
	};

	ixmaps.htmlgui_colorScheme = function (theme) {
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_colorScheme(theme);
		}
	};

	ixmaps.htmlgui_onZoomAndPan = function (nZoom) {
		try {
			ixmaps.updatePageHistory();
		} catch (e) {}
		if (ixmaps.parentApi != ixmaps) {
			try {
				ixmaps.parentApi.onMapZoom(nZoom);
			} catch (e) {}
			try {
				ixmaps.parentApi.htmlgui_onZoomAndPan(nZoom);
			} catch (e) {}
		}
	};

	ixmaps.htmlgui_onWindowResize = function () {
		if (ixmaps.parentApi != ixmaps) {
			ixmaps.parentApi.htmlgui_onWindowResize();
		}
	};

	function changeCss(className, classValue) {
		var cssMainContainer = $('#css-modifier-container');

		if (cssMainContainer.length == 0) {
			var cssMainContainer = $('<style id="css-modifier-container"></style>');
			cssMainContainer.appendTo($('head'));
		}
		cssMainContainer.append(className + " {" + classValue + "}\n");
	}

	ixmaps.htmlgui_setMapTypeBG = function (szId) {
		// dummy
	};

	ixmaps.htmlgui_saveBookmark = function () {
		ixmaps.htmlgui_doSaveBookmark();
	};

	ixmaps.htmlgui_doSaveBookmark = function (szName) {

		var szBookMarkJS = this.getBookmarkString();

		htmlgui_setCookie("test", szBookMarkJS);
		this.embeddedSVG.window.map.Api.displayMessage("Bookmark saved", 1000);
	};

	ixmaps.getEnvelopeString = function (nZoom) {

		var arrayPtLatLon = this.embeddedSVG.window.map.Api.getBoundsOfMapInGeoBounds();
		arrayPtLatLon[0].x = Math.max(Math.min(arrayPtLatLon[0].x, 180), -180);
		arrayPtLatLon[0].y = Math.max(Math.min(arrayPtLatLon[0].y, 80), -80);
		arrayPtLatLon[1].x = Math.max(Math.min(arrayPtLatLon[1].x, 180), -180);
		arrayPtLatLon[1].y = Math.max(Math.min(arrayPtLatLon[1].y, 80), -80);

		var mX = (arrayPtLatLon[1].x + arrayPtLatLon[0].x) / 2;
		var mY = (arrayPtLatLon[1].y + arrayPtLatLon[0].y) / 2;

		var dX = (arrayPtLatLon[1].x - arrayPtLatLon[0].x);
		var dY = (arrayPtLatLon[1].y - arrayPtLatLon[0].y);

		dX = dX / (2 * Math.max(1, nZoom || 1));
		dY = dY / (2 * Math.max(1, nZoom || 1));

		var szEnvelope = String(mY - dY) + "," +
			String(mX - dX) + "," +
			String(mY + dY) + "," +
			String(mX + dX);

		return szEnvelope;
	};

	ixmaps.getThemesString = function () {

		var szThemesJS = ixmaps.htmlgui_getParamString().replace(/\"/gi, "'");
		szThemesJS += ixmaps.htmlgui_getFeaturesString().replace(/\"/gi, "'");
		szThemesJS = "";

		var szThemesA = this.embeddedSVG.window.map.Api.getMapThemeDefinitionStrings();
		for (var i = 0; i < szThemesA.length; i++) {
			szThemesJS += szThemesA[i];
		}

		return szThemesJS;
	};
	ixmaps.htmlgui_getParamString = function () {

		var scaleParam = this.embeddedSVG.window.map.Api.getScaleParam();
		return "map.Api.setScaleParam(" + JSON.stringify(scaleParam) + ");";
	};
	ixmaps.htmlgui_getFeaturesString = function () {

		var szFeatures = this.embeddedSVG.window.map.Api.getMapFeatures() || "";

		// scan for doubles and keep only last one 
		// by creatating an object to reduce and remake the feature string form that

		var szFeaturesA = szFeatures.split(";");
		var d = {};
		for (i = 0; i < szFeaturesA.length; i++) {
			var xA = szFeaturesA[i].split(":");
			d[xA[0]] = xA[1];
		}
		var szResult = "";
		for (var i in d) {
			szResult += i + ":" + d[i] + ";";
		}
		return "map.Api.setMapFeatures('" + szResult + "');";
	};
	ixmaps.getScaleParam = function () {

		return this.embeddedSVG.window.map.Api.getScaleParam();
	};
	ixmaps.getOptions = function () {

		var szFeatures = this.embeddedSVG.window.map.Api.getMapFeatures();
		if (!szFeatures || szFeatures == "") {
			return null;
		}
		// scan for doubles and keep only last one 
		// by creatating an object to reduce and remake the feature string form that

		var szFeaturesA = szFeatures.split(";");
		var result = {};
		for (i = 0; i < szFeaturesA.length; i++) {
			var xA = szFeaturesA[i].split(":");
			result[xA[0]] = String(xA[1]);
		}

		// add htmlgui options
		result.basemapopacity = $(this.gmapDiv).css("opacity");
		result.panHidden = this.panHidden;

		return result;
	};

	ixmaps.getLayerSwitch = function () {

		var layerA = ixmaps.getLayer();

		var switchLayerObject = {};

		for (a in layerA) {
			fOff = false;

			var sub = false;
			var layer = layerA[a];
			for (c in layer.categoryA) {
				if (c && (layer.categoryA[c].type != "single") && (layer.categoryA[c].legendname)) {
					sub = true;
				}
			}

			if (sub) {
				for (c in layerA[a].categoryA) {
					if (layerA[a].categoryA[c].display == "none") {
						fOff = true;
					}
				}
				if (fOff) {
					var offlist = [];
					var onlist = [];
					switchLayerObject[a] = {};
					for (c in layerA[a].categoryA) {
						if (layerA[a].categoryA[c].display == "none") {
							offlist.push(c);
						} else {
							onlist.push(c);
						}
					}
					if (offlist.length < onlist.length) {
						switchLayerObject[a]["off"] = offlist;
					} else {
						switchLayerObject[a]["on"] = onlist;
					}
				}
			} else {
				if (layerA[a].szDisplay == "none") {
					switchLayerObject[a] = {
						"display": "none"
					};
				}
			}
		}
		return switchLayerObject;
	};

	ixmaps.getBookmarkString = function (nZoom) {

		if (!nZoom) {
			nZoom = 1;
		}

		var szBookMarkJS = "";

		// GR 24.11.2018 get loaded Map String 
		szBookMarkJS += ixmaps.getLoadedMapString();

		szBookMarkJS += ixmaps.htmlgui_getParamString().replace(/\"/gi, "'");
		szBookMarkJS += ixmaps.htmlgui_getFeaturesString().replace(/\"/gi, "'");

		var szEnvelope = this.getEnvelopeString(nZoom);

		// make executable SVG map API call
		szBookMarkJS += "map.Api.doZoomMapToGeoBounds(" + szEnvelope + ");";

		var center = this.htmlgui_getCenter();
		var zoom = this.htmlgui_getZoom();
		var szView = "[" + center.lat + "," + center.lng + "]," + zoom;

		szBookMarkJS += "map.Api.doZoomMapToView(" + szView + ");";

		szBookMarkJS += this.getThemesString();

		return szBookMarkJS;
	};

	ixmaps.htmlgui_getAttributionString = function () {
		if ($("#attribution")) {
			return $("#attribution").html();
		}
		return "";
	};

	ixmaps.htmlgui_setAttributionString = function (szAttribution) {
		if ($("#attribution")) {
			$("#attribution").html(szAttribution);
		}
	};

	ixmaps.htmlgui_loadBookmark = function () {

		try {
			// get the bookmark
			var xxx = htmlgui_getCookie("test");
			// if bookmark includes map themes, clear map first
			if (xxx.match(/newMapTheme/)) {
				this.clearAll();
			}
			// GR 05.09.2011 magick !!
			ixmaps.htmlgui_synchronizeMap(false, true);

			// execute bookmark, which are direct Javascript calls
			this.embeddedSVG.window.map.Api.executeJavascriptWithMessage(xxx, "-> Bookmark", 100);
		} catch (e) {
			try {
				ixmaps.embeddedSVG.window.map.Api.displayMessage("no bookmark found !", 1000);
			} catch (e) {
				alert("no bookmark found!");
			}
		}
	};

	ixmaps.storedBookmarkA = new Array(0);

	ixmaps.execBookmark = function (szBookmark, fClear) {

		this.fBookmark = true;

		if (!this.embeddedSVG || !this.embeddedSVG.window || !this.embeddedSVG.window.map.Api) {
			ixmaps.pushBookmark(szBookmark);
			return;
		}

		if (!szBookmark || typeof (szBookmark) == "undefined") {
			this.embeddedSVG.window.map.Api.displayMessage("Bookmark undefined", 1000);
			return;
		}

		if (fClear) {
			this.clearAll();
		}

		// execute bookmark, which are direct Javascript calls
		var bookmarkA = szBookmark.split("map.Api");
		for (var i = 0; i < bookmarkA.length; i++) {
			//this.embeddedSVG.window.map.Api.executeJavascriptWithMessage(szBookmark,"...",100);
			this.embeddedSVG.window.map.Api.executeJavascriptWithMessage("map.Api" + bookmarkA[i], "...", 100);
		}

	};

	ixmaps.pushBookmark = function (szBookmark) {
		ixmaps.storedBookmarkA.push(szBookmark);
		setTimeout("ixmaps.popBookmark()", 100);
	};
	ixmaps.popBookmark = function () {
		if (!this.embeddedSVG) {
			setTimeout("ixmaps.popBookmark()", 100);
			return;
		}
		if (ixmaps.storedBookmarkA.length) {
			ixmaps.execBookmark(ixmaps.storedBookmarkA.pop());
			setTimeout("ixmaps.popBookmark()", 100);
		}
	};
	ixmaps.isBookmark = function () {
		return this.fBookmark ? true : false;
	}

	ixmaps.execScript = function (szScript, fClear) {

		if (!this.embeddedSVG || !this.embeddedSVG.window || !this.embeddedSVG.window.map.Api) {
			ixmaps.pushBookmark(szScript);
			return;
		}
		if (fClear) {
			ixmaps.embeddedSVG.window.map.Api.clearAll();
			if (szScript.match(/CHOROPLETH/)) {
				ixmaps.embeddedSVG.window.map.Api.clearAllChoropleth();
			} else {
				ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
			}
		}
		eval('ixmaps.embeddedSVG.window.' + szScript);
	};

	ixmaps.message = function (szMessage,nTimeout) {
		ixmaps.htmlgui_displayInfo(szMessage);
		if (nTimeout){
			setTimeout("ixmaps.htmlgui_killInfo()",nTimeout);
		}
	};

	// -----------------------------------------------------------
	// map bounds, zoom, pan, ...
	// -----------------------------------------------------------

	/**
	 * setBounds
	 * @param bounds array of 2 lat/lon pairs
	 * @return void
	 */
	ixmaps.setBounds = function (bounds) {
		ixmaps.htmlgui_setBounds([{
			lat: bounds[0],
			lng: bounds[1]
		}, {
			lat: bounds[2],
			lng: bounds[3]
		}]);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * setView
	 * @param center the new center of the view
	 * @param nZoom the new zoomfactor of the view
	 * @return void
	 */
	ixmaps.setView = function (center, nZoom) {
		// GR 15.08.2018 call 2 times needed (magick)
		ixmaps.htmlgui_setCenterAndZoom({
			lat: center[0],
			lng: center[1]
		}, nZoom);
		ixmaps.htmlgui_setCenterAndZoom({
			lat: center[0],
			lng: center[1]
		}, nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * setCenter
	 * @param center the new center of the view
	 * @return void
	 */
	ixmaps.setCenter = function (center) {
		ixmaps.htmlgui_setCenter({
			lat: center[0],
			lng: center[1]
		});
		ixmaps.htmlgui_synchronizeSVG(true);
		return ixmaps;
	};
	/**
	 * setZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.setZoom = function (nZoom) {
		ixmaps.htmlgui_setZoom(nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * flyTo
	 * @param center the new center of the view
	 * @param nZoom the new zoomfactor of the view
	 * @return void
	 */
	ixmaps.flyTo = function (center, nZoom) {
		// GR 15.08.2018 call 2 times needed (magick)
		ixmaps.htmlgui_flyToCenterAndZoom({
			lat: center[0],
			lng: center[1]
		}, nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * minZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.minZoom = function (nZoom) {
		ixmaps.htmlgui_minZoom(nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * getCenter
	 * @param void
	 * @return object
	 */
	ixmaps.getCenter = function () {
		return ixmaps.htmlgui_getCenter();
	};
	/**
	 * getZoom
	 * @param void
	 * @type int
	 * @return zoomfactor
	 */
	ixmaps.getZoom = function () {
		return ixmaps.htmlgui_getZoom();
	};
	/**
	 * getBoundingBox
	 * @param void
	 * @return object
	 */
	ixmaps.getBoundingBox = function () {
		return ixmaps.htmlgui_getBoundingBox();
	};
	/**
	 * getMapScale
	 * @param void
	 * @return Number
	 */
	ixmaps.getMapScale = function () {
		return ixmaps.embeddedSVG.window.map.Api.getMapScale();
	};

	/**
	 * zoomIn
	 * @param void
	 * @type int
	 * @return zoomfactor
	 */
	ixmaps.zoomIn = function () {
		var nZoom = ixmaps.htmlgui_getZoom();
		ixmaps.htmlgui_setZoom(++nZoom);
		return nZoom;
	};

	/**
	 * zoomOut
	 * @param void
	 * @type int
	 * @return zoomfactor
	 */
	ixmaps.zoomOut = function () {
		var nZoom = ixmaps.htmlgui_getZoom();
		ixmaps.htmlgui_setZoom(--nZoom);
		return nZoom;
	};

	// -----------------------------------------------------------
	// map layer handling
	// -----------------------------------------------------------

	/**
	 * get layer list
	 * @return array array of layer objects
	 */
	ixmaps.getLayer = function () {

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayer();
		} catch (e) {}
	};
	/**
	 * get layer dependency list
	 * @return array array of layer dependency objects
	 */
	ixmaps.getLayerDependency = function () {

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayerDependency();
		} catch (e) {}
	};
	/**
	 * get tile Info
	 * @return object map tile object
	 */
	ixmaps.getTileInfo = function () {

		try {
			return ixmaps.embeddedSVG.window.map.Api.getTileInfo();
		} catch (e) {}
	};
	/**
	 * switch layer
	 * @param szLayerName the name of the layer to switch visible/invisible
	 * @param fState true or false
	 * @return void
	 */
	ixmaps.switchLayer = function (szLayerName, fState) {

		try {
			ixmaps.embeddedSVG.window.map.Api.switchLayer(szLayerName, fState);
		} catch (e) {}
	};

	/**
	 * set map layer ON/OFF
	 * @param layerObject JSON object tha defines which layer to switch ON or OFF
	 * @return void
	 */
	ixmaps.setMapLayer = function (layerObject) {

		try {
			ixmaps.embeddedSVG.window.map.Api.setMapLayer(JSON.stringify(layerObject));
		} catch (e) {}
	};

	// -----------------------------
	// helper
	// -----------------------------

	htmlgui_getEmbeddedSVG = function () {
		return ixmaps.embeddedSVG;
	};

	// -----------------------------
	// D A T A    L O A D E R 
	// -----------------------------
	
	var __lastOptionName = null;
	
	/**
	 * Is called by the svg map script to load external data from FusionTable, GeoRSS, GeoJson, ...
	 * @param szUrl where to find the data
	 * @param options description of the data source type
	 * @type void
	 */
	ixmaps.htmlgui_loadExternalData = function (szUrl, options) {
		
		if ((!szUrl || (szUrl === undefined)) && !(options.type === "ext")) {
			alert("htmlgui_loadExternalData: szUrl is 'undefined' !");
			return;
		}

		// GR 16.07.2017
		// if szUrl == type, than we have a javascript object 
		// set the javascript object with name = options.name as external data
		if (szUrl && (szUrl == options.type)) {
			this.setExternalData(eval(options.name), options);
			return;
		}

		// GR 13.06.2014
		// check if we have a complete path, if not, add story root and maybe ".js"
		if (options.ext && options.ext.length && !options.ext.match(/\//) && !options.ext.match(/function/)) {
			var root = ixmaps.storyRoot || ixmaps.parentApi.storyRoot || ixmaps.parentApi.parentApi.storyRoot || "";
			options.ext = root + options.ext + (options.ext.match(/.js/) ? "" : ".js");
			// set the complete ext path for further use
			options.theme.coTableExt = options.ext;
		}

		ixmaps.showLoadingArray(["loading data ...", " ... "]);
		
		$.getScript("../../../data.min.js/data.js")
			.done(function (script, textStatus) {

				// a) data is loaded by a specific data provider function
				// -------------------------------------------------------
				if (options.type == "ext") {
					if (eval("ixmaps." + options.name)){
						options.setData = ixmaps.setExternalData;
						var fLoading = false;

						try {
							eval("fLoading = ixmaps." + options.name + "(options.theme,options)");
						} catch (e) {
							try {
								eval("fLoading = ixmaps.parentApi." + options.name + "(options.theme,options)");
							} catch (e) {
								try {
									eval("fLoading = ixmaps.parentApi.parentApi." + options.name + "(options.theme,options)");
								} catch (e) {
									try {
										eval("fLoading = ixmaps.queryData(options.theme,options)");
									} catch (e) {
										ixmaps.showLoadingArrayStop();
										ixmaps.hideLoading();
										ixmaps.error("external data function: '" + options.name + "' not defined !", 2000);
									}
								}
							}
						}
						if (!fLoading && __lastOptionName && (options.name == __lastOptionName) ) {
							//ixmaps.showLoadingArrayStop();
						}else{
							__lastOptionName = options.name;
						}
						return;
					}
					$.ajax({
						type: "GET",
						url: options.ext,
						dataType: "text",
						success: function (script) {

							eval(script);
							options.setData = ixmaps.setExternalData;
							var fLoading = false;

							try {
								eval("fLoading = ixmaps." + options.name + "(options.theme,options)");
							} catch (e) {
								try {
									eval("fLoading = ixmaps.parentApi." + options.name + "(options.theme,options)");
								} catch (e) {
									try {
										eval("fLoading = ixmaps.parentApi.parentApi." + options.name + "(options.theme,options)");
									} catch (e) {
										try {
											eval("fLoading = ixmaps.queryData(options.theme,options)");
										} catch (e) {
											ixmaps.showLoadingArrayStop();
											ixmaps.hideLoading();
											ixmaps.error("external data function: '" + options.name + "' not defined !", 2000);
										}
									}
								}
							}
							if (!fLoading && __lastOptionName && (options.name == __lastOptionName) ) {
								ixmaps.showLoadingArrayStop();
							}else{
								__lastOptionName = options.name;
							}
						},
						error: function (jqxhr, settings, exception) {
							ixmaps.showLoadingArrayStop();
							ixmaps.hideLoading();
							ixmaps.error("external data provider: '" + options.ext + "' could not be loaded !", 2000);
						}
					});

				} else {
					
					// b) data is loaded by data.js
					// -------------------------------------------------------

					// check if exist already a broker for this data source
					for (i in ixmaps.dataLoaderA) {
						if (ixmaps.dataLoaderA[i].url == szUrl &&
							ixmaps.dataLoaderA[i].name == options.name &&
							ixmaps.dataLoaderA[i].ext == options.ext &&
							options.theme.fDataCache) {
							_LOG("double loading suppressed: " + szUrl);
							ixmaps.showLoadingArrayStop();
							return;
						}
					}
					ixmaps.dataLoaderA.push({
						url: szUrl,
						name: options.name,
						ext: options.ext,
						cache: options.theme.fDataCache
					});

					var broker = new Data.Broker(options);
					broker.addSource(szUrl, options.type)
						.error(function (e) {
							ixmaps.error("loading data error: " + e + "\n \n<span style='color:#ddd'>" + szUrl + "</span>");
							ixmaps.showLoadingArrayStop();
							ixmaps.hideLoading();
						})
						.realize(function (dataA) {

							ixmaps.showLoadingArrayStop();
							//ixmaps.showLoading("processing data ...");
							ixmaps.hideLoading();

							var themeDataObj = dataA[0];

							if ( !themeDataObj ){
								ixmaps.error("loading data error: '" + szUrl + "' could not be loaded !", 2000);
								return;
							}

							// if there is an ext data after processor defined, call it
							// --------------------------------------------------
							if (typeof (options.ext) != "undefined") {

								_LOG("get external data processor");

								// inline function !
								if (options.ext.match(/function/)) {
									eval("var process = " + options.ext);
									process(themeDataObj,options);
									ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null, themeDataObj, options.name);
									return;
								}

								$.ajax({
									type: "GET",
									url: options.ext,
									dataType: "text",
									success: function (script) {

										eval(script);
										var fError = 0;
										try {
											eval("themeDataObj = ixmaps." + options.name + ".after(themeDataObj,options) || themeDataObj");
										} catch (e) {
											try {
												eval("themeDataObj = ixmaps.parentApi." + options.name + ".after(themeDataObj,options) || themeDataObj");
											} catch (e) {
												try {
													eval("themeDataObj = ixmaps.parentApi.parentApi." + options.name + ".after(themeDataObj,options) || themeDataObj");
												} catch (e) {
													try {
														eval("themeDataObj = ixmaps." + options.name + ".process(themeDataObj,options) || themeDataObj");
													} catch (e) {
														try {
															eval("themeDataObj = ixmaps.parentApi." + options.name + ".process(themeDataObj,options) || themeDataObj");
														} catch (e) {
															try {
																eval("themeDataObj = ixmaps.parentApi.parentApi." + options.name + ".process(themeDataObj,options) || themeDataObj");
															} catch (e) {
																alert(options.ext + ":\ndata processing functions\nixmaps." + options.name + ".after or ixmaps." + options.name + ".process\nnot found!");
															}
														}
													}
												}
											}
										}

										_LOG("set processed data");

										// set processed data
										// --------------------------------------------------
										ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null, themeDataObj, options.name);
									},
									error: function (jqxhr, settings, exception) {
										ixmaps.showLoadingArrayStop();
										ixmaps.hideLoading();
										ixmaps.error("external data provider: '" + options.ext + "' could not be loaded !", 2000);
									}
								});

								// no external processor file defined, so try to call internal processor and set data
								// -----------------------------------------------------------------------------------
							} else {
								try {
									eval("themeDataObj = ixmaps." + options.name + ".process(themeDataObj,options) || themeDataObj");
								} catch (e) {
									try {
										eval("themeDataObj = ixmaps.parentApi." + options.name + ".process(themeDataObj,options) || themeDataObj");
									} catch (e) {
										try {
											eval("themeDataObj = ixmaps.parentApi.parentApi." + options.name + ".process(themeDataObj,options) || themeDataObj");
										} catch (e) {}
									}
								}
								ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null, themeDataObj, options.name);
							}
						});
					}
				})
				.fail(function (jqxhr, settings, exception) {
					alert("'" + options.type + "' unknown format !");
				});
	};

	/**
	 * set theme data from data (javscript var) 
	 * @param {object} data the object containing data (see type)
	 * @param {object} opt optriobs to define the data
	 * @return void
	 * @example
	 * ixmaps.setExternalData(dataObject,{type:"json",name:"myData"});
	 */
	ixmaps.setExternalData = function (data, opt) {

		if (opt && opt.type && (opt.type != "jsonDB") && (opt.type != "dbtable")) {
			if ((typeof (Data) != "undefined") && Data.object) {
				// load the data using data.js
				Data.object({
					"source": data,
					"type": opt.type
				}).import(function (mydata) {
					ixmaps.setExternalData(mydata, {
						type: "dbtable",
						name: opt.name
					});
				});
			} else {
				$.getScript("../../../data.min.js/data.js")
					.done(function (script, textStatus) {
						// load the data using data.js
						Data.object({
							"source": data,
							"type": opt.type
						}).import(function (mydata) {
							ixmaps.setExternalData(mydata, {
								type: "dbtable",
								name: opt.name
							});
						});
					});
			}
		} else {
			ixmaps.showLoadingArrayStop();
			ixmaps.hideLoading();
			ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null, data, opt.name);
		}
	}

	/**
	 * set theme data from data (javscript var) 
	 * @param {object} data the object containing data (see type)
	 * @param {object} opt optriobs to define the data
	 * @return void
	 * @example
	 * ixmaps.setData(dataObject,{type:"json",name:"myData"});
	 */
	ixmaps.setData = function (data, opt) {
		this.setExternalData(data, opt);
		return ixmaps;
	};

	/**
	 * set local text; localize, change or suppress application messages; nearly every messsage of iXMaps can be changed by this 
	 * method; simply define a localized message or even only a word of a message; you can also suppress the message defining an empty string ("") 
	 * @param {String} szOrig the string to replace
	 * @param {String} szLocal the localized string
	 * @return void
	 * @example
	 * ixmaps.setLocalString("creating charts","...");
	 * ixmaps.setLocalString("loading data ...","... caricando dati ...");
	 */
	ixmaps.setLocalString = function (szOrig, szLocal) {
		try {
			this.embeddedSVG.window.map.Api.setLocalString(szOrig, szLocal);
		} catch (e) {}
	};

	/**
	 * set local text; localize, change or suppress application messages; nearly every messsage of iXMaps can be changed by this 
	 * method; simply define a localized message or even only a word of a message; you can also suppress the message defining an empty string ("") 
	 * @param {String} szOrig the string to replace
	 * @param {String} szLocal the localized string
	 * @return void
	 * @example
	 * ixmaps.setLocal("creating charts","...");
	 * ixmaps.setLocal("loading data ...","... caricando dati ...");
	 */
	ixmaps.setLocal = function (szOrig, szLocal) {
		try {
			this.embeddedSVG.window.map.Api.setLocalString(szOrig, szLocal);
		} catch (e) {}
		return ixmaps;
	};

	/**
	 * set localize
	 * @param {Object} localizeObj the json object with the global/local string pairs
	 * @return void
	 * @example
	 * ixmaps.setLocalize({"creating charts":"...","loading data ...":"... caricando dati ..."});
	 */
	ixmaps.setLocalize = function (localizeObj) {
		for (g in localizeObj) {
			ixmaps.setLocal(g, localizeObj[g]);
		}
	};

	/**
	 * set attribution
	 * @param {String} attribution stringlocalizeObj the json object with the global/local string pairs
	 * @return void
	 * @example
	 * ixmaps.setAttribution("powered by iXMaps");
	 */
	ixmaps.setAttribution = function (attribution) {
		ixmaps.htmlgui_setAttributionString(attribution);
	};

	/**
	 * set legend
	 * @param {String} legend (html)
	 * @return void
	 * @example
	 * ixmaps.setLegend("Title");
	 */
	ixmaps.setLegend = function (legend) {
		ixmaps.legend = ixmaps.legend || {};
		ixmaps.legend.url = (typeof (legend) != "undefined") ? legend : ixmaps.legend.url;
	};

	/**
	 * require
	 * @param {String} szUrl the URL of the external script to add toi project * @return void
	 * @return void
	 * @private
	 */
	ixmaps.require = function(szUrl){
		
		// save for use in project
		ixmaps.requiredUrlA = ixmaps.requiredUrlA || [];
		ixmaps.requiredUrlA.push(szUrl);
		
		// try to load the required file
		ixmaps.loading++;
		$.ajax({
			type: "GET",
			url: szUrl,
			dataType: "text",
			success: function (script) {
				eval(script);
				ixmaps.loading--;
			},
			error: function (jqxhr, settings, exception) {
				ixmaps.loading--;
				ixmaps.showLoadingArrayStop();
				ixmaps.hideLoading();
				ixmaps.error("required resource '"+szUrl+"' could not be loaded !", 2000);
			}
		});
	};

	/**
	 * set an ixmaps project from JSON   
	 * @param project the JSON object to define the project
	 * @param szFlag optional switches to set only parts of a project
	 * @type void
	 */
	ixmaps.setProjectJSON = function (project, szFlag) {

		szFlag = szFlag || "";

		if (project) {
			// new project JSON format with metadata; recognizable by project.map.map 
			if (project["$schema"] && (project["$schema"] != ixmaps.JSON_Schema) && !szFlag.match(/dontcare/)) {
				ixmaps.confirm("unexpected JSON Schema: '" + project["$schema"] + "'<br>Do you want to continue loading?",
					function () {
						ixmaps.setProjectJSON(project, szFlag + "|dontcare")
					},
					function () {
						return false
					});
				return;
			}
			// project requires external resources (scripts) 
			//
			if ( (typeof (project.required) != "undefined") ) {
				ixmaps.loading = 0;
				for ( i in project.required ){
					ixmaps.loading++;
					$.ajax({
						type: "GET",
						url: project.required[i],
						dataType: "text",
						success: function (script) {
							eval(script);
							if (--ixmaps.loading<=0){
								ixmaps.continueSetProjectJSON(project, szFlag);
							}	
						},
						error: function (jqxhr, settings, exception) {
							ixmaps.showLoadingArrayStop();
							ixmaps.hideLoading();
							ixmaps.error("required resource '"+project.required[ixmaps.loading]+"' could not be loaded !", 2000);
						}
					});
				}
			}else
			// project requires external resources (scripts) 
			//
			if ( (typeof (project.require) != "undefined") ) {
				ixmaps.loading = 0;
				for ( i in project.require ){
					ixmaps.loading++;
					$.ajax({
						type: "GET",
						url: project.require[i],
						dataType: "text",
						success: function (script) {
							eval(script);
							if (--ixmaps.loading<=0){
								ixmaps.continueSetProjectJSON(project, szFlag);
							}	
						},
						error: function (jqxhr, settings, exception) {
							ixmaps.showLoadingArrayStop();
							ixmaps.hideLoading();
							ixmaps.error("required resource '"+project.require[ixmaps.loading]+"' could not be loaded !", 2000);
						}
					});
				}
			}else{
				// no external resource -> go
				ixmaps.continueSetProjectJSON(project, szFlag);
			}
		}
	};
			
	/**
	 * continue realizing project JSON  
	 */
	ixmaps.continueSetProjectJSON = function (project, szFlag) {

		szFlag = szFlag || "";

		if (project && project.map) {
			
			if ((typeof (project.map) != "string") && !szFlag.match(/themeonly|add|replace/i)) {

				ixmaps.loadedProject = project;
				try {
					ixmaps.parentApi.setLoadedProject(project);
				}  catch (e) {}

				var map = project.map;

				if (!map.map || (typeof (map.map) != "string") || !map.map.length) {
					map.map = ixmaps.szDefaultMap;
				}

				ixmaps.loadMap(map.map, function () {
					if (map.center && map.zoom && !szFlag.match(/nonewview/i) && !szFlag.match(/keepview/i)) {
						ixmaps.setView([map.center.lat, map.center.lng], map.zoom);
						ixmaps.setView([map.center.lat, map.center.lng], map.zoom);
					}
					try {
						ixmaps.setOptions(map.options);
						ixmaps.setScaleParam(map.scaleParam);
						ixmaps.setMapTypeId(map.basemap);
						ixmaps.setLocalize(map.localize);
						ixmaps.setMapLayer(project.layerMask);

						if (map.attribution) {
							ixmaps.htmlgui_setAttributionString(map.attribution);
						}
						if (map.layout) {
							ixmaps.parentApi.parentApi.setLayout(map.layout);
						}
					} catch (e) {}

					ixmaps.legend = ixmaps.legend || {};
					ixmaps.legend.url = (typeof (map.legend) != "undefined") ? map.legend : ixmaps.legend.url;

					/**
					if (ixmaps.embeddedSVG && ixmaps.embeddedSVG.window.themeDataObj ){
						delete ixmaps.embeddedSVG.window.themeDataObj;
					}
					**/
					ixmaps.htmlgui_synchronizeMap(false, false);					

					if (project.themes) {
						for (i in project.themes) {
							ixmaps.newTheme("project", project.themes[i], (i == 0) ? "clear" : "");
						}
					} else
					if (project.theme) {
						ixmaps.newTheme("project", project.theme, "clear");
					} else {
						setTimeout("ixmaps.hideLoading()", 250);
					}
					// GR 29.08.2018 must force to show SVG layer
					// if not, it wasn't switched on sometimes 
					setTimeout("ixmaps.showAll();", 1000);
					try {
						ixmaps.onMapReady(map.map);
					} catch (e) {}
					if (map.search) {
						ixmaps.search.szSearchSuffix = map.search;
						ixmaps.search.show();
					}
				});
				if (project.search) {
					ixmaps.search.szSearchSuffix = project.search;
					ixmaps.search.show();
				}
			} else
				// old project JSON format without 
				if (project.map && !szFlag.match(/themeonly|add|replace/i)) {

					ixmaps.loadedProject = project;
					ixmaps.parentApi.setLoadedProject(project);

					ixmaps.loadMap(project.map, function (map) {
						if (project.center && project.zoom) {
							ixmaps.setView([project.center.lat, project.center.lng], project.zoom);
							ixmaps.setView([project.center.lat, project.center.lng], project.zoom);
						}
						try {
							ixmaps.setOptions(project.options);
							ixmaps.setScaleParam(project.scaleParam);
							ixmaps.setMapTypeId(project.basemap);
							ixmaps.setLocalize(project.localize);
							ixmaps.setMapLayer(project.layerMask);
						} catch (e) {}

						if (project.themes) {
							for (i in project.themes) {
								ixmaps.newTheme("project", project.themes[i], (i == 0) ? "clear" : "");
							}
						} else
						if (project.theme) {
							ixmaps.newTheme("project", project.theme, "clear");
						} else {
							setTimeout("ixmaps.hideLoading()", 250);
						}
						// GR 29.08.2018 must force to show SVG layer
						// if not, it wasn't switched on sometimes 
						setTimeout("ixmaps.showAll();", 1000);
					});
					if (project.search) {
						ixmaps.search.szSearchSuffix = project.search;
						ixmaps.search.show();
					}
				} else
			if (project.themes && !szFlag.match(/maponly/i)) {
				for (i in project.themes) {
					if ( project.themes[i].style.name && szFlag.match(/replace/i) ){
						ixmaps.removeTheme(project.themes[i].style.name);
						setTimeout(function(){ixmaps.newTheme("project", project.themes[i],"")},"1000");
					}else{
						ixmaps.newTheme("project", project.themes[i], (i == 0 && !szFlag.match(/add/i)) ? "clear" : "");
					}
				}
			} else
			if (project.theme && !szFlag.match(/maponly/i)) {
				ixmaps.newTheme("project", project.theme, "clear");
			} else {
				setTimeout("ixmaps.hideLoading()", 250);
			}
		}

	};

	/**
	 * set an ixmaps project from json string  
	 * @param szProject the stringified project JSON
	 * @type void
	 */
	ixmaps.setProject = function (szProject) {

		var project = null;
		
		if (typeof (szProject) != "string") {
			try {
				ixmaps.setProjectJSON(szProject);
			} catch (e) {
				ixmaps.error("Code: " + e);
			}
			return;
		}
		
		try {
			project = JSON.parse(szProject);
		} catch (e) {
			ixmaps.error("Code: " + e);
		}

		try {
			ixmaps.parentApi.htmlgui_onProjectLoaded(project);
		} catch (e) {}

		if (project) {
			ixmaps.setProjectJSON(project);
		}

	};

	/**
	 * load an ixmaps project    
	 * @param szUrl the relative or absolute URL of the ixmaps project file
	 * @type void
	 */
	ixmaps.loadProject = function (szUrl, szFlag) {
		
		// test if szUrl is not a string, but a JSON object
		// ------------------------------------------------
		if (typeof (szUrl) != "string") {
			try {
				ixmaps.setProjectJSON(szUrl, szFlag);
			} catch (e) {
				ixmaps.error("Code: " + e);
			}
			return;
		}

		// test if szUrl is stringified JSON
		// ---------------------------------
		if (decodeURIComponent(szUrl).match(/\{/)) {
			setTimeout("ixmaps.setProject(decodeURIComponent('" + szUrl + "'))", 100);
			return;
		}

		// load JSON from URL
		// ------------------
		$.get(szUrl,
			function (data) {

				var project = null;

				if (typeof (data) == "string") {
					try {
						project = JSON.parse(data);
					} catch (e) {
						ixmaps.error("Code: " + e);
					}
				} else {
					project = data;
				}

				szFlag = String(szFlag) || "";

				try {
					ixmaps.parentApi.htmlgui_onProjectLoaded(project);
				} catch (e) {}

				if (project) {
					ixmaps.setProjectJSON(project, szFlag);
					
					ixmaps.loadedProjectUrl = szUrl;
				}

			}).fail(function (e) {
			ixmaps.error('loading error with:' + szUrl);
		});

	};

	/**
	 * get an ixmaps project (JSON) string  
	 * @type string
	 * @return a project definition string (JSON)
	 */
	ixmaps.getProjectString = function () {

		_LOG("make project definition string (JSON)");

		// get definitions of actual map
		//
		var szMapType = ixmaps.getMapTypeId();
		var szMapUrl = ixmaps.loadedMap || ixmaps.getMapUrl();
		var szStoryUrl = ixmaps.getStoryUrl();
		var center = ixmaps.getCenter();
		var zoom = ixmaps.getZoom();
		var scaleParam = ixmaps.getScaleParam();
		var options = ixmaps.getOptions();
		var themesA = ixmaps.getThemes();
		var layerObj = ixmaps.getLayerSwitch();

		var szDate = new Date().toString();
		var szParent = ixmaps.parent || "";

		// get definitions actual theme(s)
		//
		var themeDefA = [];
		for (i in themesA) {
			themeDefA.push(ixmaps.getThemeDefinitionObj(themesA[i].szId));
		}
		for (i in themeDefA) {
			if (themeDefA[i].style.values && (themeDefA[i].style.values.length > 100)) {
				delete themeDefA[i].style.values;
			}
		}

		// make the project object (JSON)
		//
		var project = {};
		var map = {};
		var metadata = {};

		if (ixmaps.loadedProject && ixmaps.loadedProject.metadata) {
			metadata = ixmaps.loadedProject.metadata;
		} else {
			metadata.title = "";
			metadata.snippet = "";
			metadata.description = "";
			metadata.thumbnail = "";
			metadata.about = "";
		}

		project.metadata = metadata;

		map.map = szMapUrl;
		map.attribution = ixmaps.htmlgui_getAttributionString();

		map.basemap = szMapType;

		map.legend = ixmaps.legend ? (ixmaps.legend.url || "") : "";
		map.item   = (ixmaps.loadedProject && 
					  ixmaps.loadedProject.map && 
					  ixmaps.loadedProject.map.item) ? (ixmaps.loadedProject.map.item || "") : "";

		map.scaleParam = scaleParam;
		map.options = options;
		map.center = center;
		map.zoom = zoom;

		project.map = map;
		
		if (ixmaps.loadedProject && ixmaps.loadedProject.require) {
			project.require = ixmaps.loadedProject.require;
		}
		
		if (ixmaps.loadedProject && ixmaps.loadedProject.required) {
			project.required = ixmaps.loadedProject.required;
		}
		
		if (ixmaps.loadedProject && ixmaps.loadedProject.map && ixmaps.loadedProject.map.localize) {
			project.map.localize = ixmaps.loadedProject.map.localize;
		}
		
		if (ixmaps.requiredUrlA){
			project.require = ixmaps.requiredUrlA;
		}
		
		project.themes = themeDefA;
		project.layerMask = layerObj;

		// return the project object (JSON) as string !
		//
		var szProject = JSON.stringify(project);
		
		return szProject;
	};

	/**
	 * load an ixmaps project    
	 * @param szUrl the relative or absolute URL of the ixmaps project file
	 * @type void
	 */
	ixmaps.loadData = function (szUrl, szFlag) {
		setTimeout("ixmaps.doLoadData('"+szUrl+"','"+szFlag+"')",1000);
	};
	ixmaps.doLoadData = function (szUrl, szFlag) {
		
		var tt = {
			"layer": "World Mercator",
			"field": "$item$",
			"field100": "",
			"style": {
				"type": "CHART|BUBBLE|FAST|MULTIQUAD|ZOOMTO|SIMPLELEGEND",
				"colorscheme": [
					"blue"],
				"fillopacity": "0.7",
				"shadow": "false",
				"dbtable": "themeDataObj",
				"dbtableUrl": "http://corsme.herokuapp.com/http://turismo.comune.civitanova.mc.it/wp-content/blogs.dir/9/sites/9/csv/C_C770_dataset_strutture-ricettive-extra-alberghiere_1608373621.csv",
				"dbtableType": "csv",
				"datacache": "true",
				"showdata":"true",
				"lookupfield": "Latitudine|Longitudine",
				"symbols": [
					"circle"],
				"label":"items",
				"units": "",
				"refreshtimeout": "0",
				"scale": "1",
				"valuescale": "1",
				"valuedecimals": "0",
				"title": "dataset"
				}
		};

		// load data from URL
		// ------------------
		$.get(szUrl,
			function (data) {
				if (data[0] == "{" ){
					alert("json");
				}else{
					objTheme = {};
					objTheme.layer = "World Mercator";
					objTheme.fields = "$item$";
					objTheme.style = {};
					objTheme.style.type = "CHART|DOT",
					objTheme.style.colorscheme = ["blue"],
					objTheme.style.dbtableUrl = szUrl;
					objTheme.style.dbtableType = "csv";
					objTheme.style.dbtable = "themeDataObj";
					objTheme.style.lookupfield = "Latitudine|Longitudine";
					ixmaps.loadedProject = ixmaps.loadedProject || {};
					ixmaps.loadedProject.map = ixmaps.loadedProject.map || {};
					ixmaps.loadedProject.map.item = "html";
					
					tt.style.dbtableUrl = szUrl;
					if ( szUrl.match(/corsme/) ){
						szUrl = "http:"+szUrl.split("http:")[2];
					}
					tt.style.snippet = "fonte: <br><a href='"+szUrl+"'><small style='overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display:block; width:100%'>"+szUrl+"</small></a>";
					ixmaps.newTheme("project", tt, "clear");
				}
			}).fail(function (e) {
			ixmaps.error('loading error with:' + szUrl);
		});

	};
	
	ixmaps.editor = ixmaps.editor || {};
	ixmaps.editor.analyseValues = function(a) {

		var themeObj = {
			"type": "",
			"style": {
				"type": ""
			}
		};

		if (!a || (typeof(a) != "object")) {
			return null;
		}

		// get unique valyes array
		var onlyUnique = function(value, index, self) {
			return self.indexOf(value) === index;
		};
		var u = a.filter(onlyUnique);

		// if less than 20 unique values, assume distinct values -> theme type CATEGORICAL
		// 
		nDistinct = u.length;

		// if only one vale == 1
		// 
		if ((nDistinct == 1) && (u[0] == 1)) {
			themeObj.type = "item"
			themeObj.style.type += "|DOT";
			return themeObj;
		}

		// if less than 20 unique values, assume distinct values -> theme type CATEGORICAL
		// 
		if (0 && (nDistinct < 5)) {

			// sort the values to give the themes always the same value sequence
			u.sort();
			// correct known problem; ["dopo ...","entro ...","entro ...",...]
			if (String(u[0]).match(/dopo/)) {
				u.push(u.shift());
			}
			// set the values in the theme object !!! 
			themeObj.style.label = [];
			for (i = 0; i < u.length; i++) {
				themeObj.style.label.push(String(u[i]));
			}
			// set the theme distribution type 
			themeObj.type = "exact";
			themeObj.style.type += "|CATEGORICAL";
			themeObj.style.colorscheme = ["7", "fruit"];
		} else {
			// if we have textual values, make always CATEGORICAL 
			if (isNaN(u[0])) {
				themeObj.type = "exact";
				themeObj.style.type += "|CATEGORICAL";
				themeObj.style.colorscheme = ["7", "fruit"];
			} else {
				themeObj.type = "numeric";
				themeObj.style.colorscheme = ["7", "#ffffff", "#ff0000"];
			}
		}
		return themeObj;
	};

	ixmaps.editor.makeDefaultTheme = function(color_selected) {

		if (!ixmaps.editor.dbtable) {
			return {};
		}

		objTheme = {
			fields: "$item$"
		};
		objTheme.style = {};
		objTheme.style.dbtableUrl = ixmaps.editor.dbtableUrl || "";
		objTheme.style.dbtableType = ixmaps.editor.dbtableType || "";
		objTheme.style.dbtable = "themeDataObj";
		objTheme.style.lookupfield = " ";

		if (ixmaps.editor.dbtable && ixmaps.editor.dbtable.table && (ixmaps.editor.dbtable.table.records > 250000)) {
			objTheme.style.type = "CHART|SYMBOL|GRIDSIZE|DOPACITY|AGGREGATE|FAST|SUM|ZOOMTO";
			//objTheme.style.type = "CHART|SYMBOL|AUTOSIZE|AGGREGATE|SUM|ZOOMTO";
			objTheme.style.gridwidth = "10px";
			objTheme.style.symbols = ["hexagon"];
			objTheme.style.dopacitypow = 2;
			objTheme.style.dopacityscale = 2;
		} else
		if (ixmaps.editor.dbtable && ixmaps.editor.dbtable.table && (ixmaps.editor.dbtable.table.records > 100000)) {
			objTheme.style.type = "CHART|BUBBLE|AGGREGATE|FAST|SUM|ZOOMTO";
			objTheme.style.gridwidth = "2px";
			objTheme.style.fillopacity = "0.3";
		} else {
			//objTheme.style.type = "CHART|DOT|RAW|FAST";
			objTheme.style.type = "CHART|DOT|RAW|FAST|ZOOMTO";
			objTheme.style.fillopacity = "0.2";
		}
		objTheme.style.colorscheme = [1, "#eeeeff", "#0000dd"];
		objTheme.style.editor = true;
		ixmaps.editor.themeObj = objTheme;

		return objTheme;

	}

}(window, document));

// -----------------------------
// EOF
// -----------------------------

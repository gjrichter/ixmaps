/**********************************************************************
	 htmlgui_api.js

$Comment: provides api functions to HTML pages, that embed ixmaps maps
$Source : htmlgui_api.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2011/10/29 $
$Author: guenter richter $
$Id: htmlgui_api.js 1 2011-10-29 10:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_api.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides iXmaps interface functions for HTML Pages that embed ixmaps maps<br>
 * @example 
 *
 * 1. mode: embed the map by a dedicated frame and adress by the frame (and map) id
 *
 * <!DOCTYPE html>
 * <html>
 *   <body>
 *
 *     ...
 *     <iframe id="map" src="http://...map_source...">
 *     ...
 * 
 *     <script type="text/javascript" src = "../../ui/js/htmlgui_api.js" > </script>
 *
 *     <script type="text/javascript" charset="utf-8">
 *
 *       // wait for map ready
 *       // ----------------------------
 *       ixmaps.waitForMap("map",function() {
 *
 *         ixmaps.setView("map",[42.79540065303723,13.20831298828125],9);
 *
 *         ixmaps.newTheme("map","Totale complessivo",{  
 *           layer: "com2011_s",
 *           field: "Totale complessivo",
 *           style: {
 *             type: "CHOROPLETH|EQUIDISTANT",
 *             colorscheme: [  "5","#FFFDD8","#B5284B","2colors","#FCBA6C" ],
 *             dbtable: "themeDataObj csv url(http://mysite/mydata/data.csv)",
 *             lookupfield: "comune"
 *             },"clear"
 *           });
 *       });
 *
 *     </script>
 *   </body>
 * </html>
 *
 * @example
 *
 * 2. mode: embed the map by ixmaps api function and adress by the returned map handle
 *
 * <!DOCTYPE html>
 * <html>
 *   <body>
 *     <div id="map_div"></div>
 * 
 *     <script type="text/javascript" src = "../../ui/js/htmlgui_api.js" > </script>
 *     <script type="text/javascript" charset="utf-8">
 *
 *     ixmaps.embedMap("map_div",
 *       { 
 *          mapName:    "map", 
 *          mapService: "leaflet",
 *          mapType:    "OpenStreetMap - FR"
 *       },
 *       function(map) {
 *
 *         map.setView([42.79540065303723,13.20831298828125],9);
 *
 *         map.newTheme("Totale complessivo",
 *           {  
 *           layer: "com2011_s",
 *           field: "Totale complessivo",
 *           style: {
 *             type: "CHOROPLETH|EQUIDISTANT",
 *             colorscheme: [  "5","#FFFDD8","#B5284B","2colors","#FCBA6C" ],
 *             dbtable: "themeDataObj csv url(http://mysite/mydata/data.csv)",
 *             lookupfield: "comune"
 *             }
 *           },"clear");
 *         }
 *       );
 *
 *     </script>
 *   </body>
 * </html>
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

/** 
 * @namespace ixmaps
 */

(function( ixmaps, $, undefined ) {
	/**
	var ixmaps = {
		version: "1.0"
	};
	**/
	//ixmaps.version = "1.0";

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

	/** if true, we are in an api layer */

	ixmaps.api = true;
	ixmaps.isMap = false;

	// ================================================
	// workaround for cross domain restrictions
	// send bookmark string to framed map content
	// ================================================

	// listen to messages and execute coded functions
	// ----------------------------------------------

	function receiveMessage(e)  {
		//console.log("receiveMessage: "+e.data);
		if ( typeof(e.data) == "string" ) {
			//console.log("processMessage: "+e.data);
			if ( e.data.match(/executeThis/) ){
				eval(e.data.substr(12,e.data.length-12));
			}else
			if ( e.data.match(/resetMap/) ){
				var szMap = e.data.split(':')[1] || "map"; 
				ixmaps.resetEmbeddedMap(szMap);
			}else
			if ( e.data.match(/registerMap/) ){
				var szMap = e.data.split(':')[1] || "map";
				ixmaps.embeddedApiA[szMap] = {"crossdomain":true};
			}else
			if ( e.data.match(/waitForMap/) ){
				var szMap = e.data.split(':')[1] || "map"; 
				ixmaps.waitForEmbeddedMap(szMap, function(szMap){
					parent.postMessage("isMap:"+szMap,"*");
				});
			}else
			if ( e.data.match(/isMap/) ){
				if ( 1 || !ixmaps.isMap ) {
					ixmaps.isMap = true;
					var szMap = e.data.split(':')[1] || "map";
					// map ready, try to execute the callbacks
					try{ixmaps.waitCallbackA[szMap](new ixmaps.mapApi(szMap));
						ixmaps.waitCallbackA[szMap]=null;
						}catch(e){
					}
				}
			}else
			if ( e.data.match(/isEvent/) ){
				var szMap = e.data.split(':')[1] || "map";
				var szEvent = e.data.split(':')[2] || "generic";
				// try to execute the event callback
				try{ixmaps.waitEventA[szMap](ixmaps,szEvent);
					}catch(e){
				}
			}
		}
	} 
	window.addEventListener("message", receiveMessage, false);  
	
	// send bookmark messages to execute functions in (cross domain) iframes
	// ---------------------------------------------------------------------

	ixmaps.iframe = ixmaps.iframe || {};

	ixmaps.iframe.exec = function(szFrame,szFunction){

		//console.log("ixmaps.iframe.exec -------------- "+szFrame);

		var frame = window.document.getElementById(szFrame);
		if ( frame && frame.contentWindow ){
			frame.contentWindow.postMessage("executeThis:"+szFunction,"*");
		}else{
			for ( i in ixmaps.embeddedApiA ){
				frame = window.document.getElementById(i);
				if ( frame ){
					if ( frame.contentWindow ){
						frame.contentWindow.postMessage("executeThis:"+szFunction,"*");
					}
				}else{
					//console.log("no frame at all");
				}
			}
		}
	};

	// function to get a callback if map loaded
	//
	ixmaps.iframe.waitForMap = function(szFrame,callback){
		if ( callback ){
			if ( !ixmaps.waitCallbackA ){
				ixmaps.waitCallbackA = [];
			}
			ixmaps.waitCallbackA[szFrame] = callback;
			if ( ixmaps.isMap ){
				callback(new ixmaps.mapApi(ixmaps.szMap));
			}
		}
		try{
			var frame = window.document.getElementById(szFrame);
			// GR 09.01.2014 check if ixmaps is defined in frame content 
			if ( frame && frame.contentWindow && frame.contentWindow.ixmaps ){
				frame.contentWindow.postMessage("waitForMap:"+szFrame,"*");
			}else{
				// if ixmaps is not defined in frame content, give it some time
				setTimeout("ixmaps.iframe.waitForMap('"+szFrame+"')",250);
			}
		}
		catch (e){}

	};

	// function to get a callback on events
	//
	ixmaps.iframe.waitForEvent = function(szFrame,callback){

		console.log("waitForEvent:"+szFrame);
		if ( callback ){
			if ( !ixmaps.waitEventA ){
				ixmaps.waitEventA = [];
			}
			ixmaps.waitEventA[szFrame] = callback;
		}
		console.log("trigger done");
	};


	// function to reset map in cross domain iframes
	//
	ixmaps.iframe.resetMap = function(szFrame){
		var frame = window.document.getElementById(szFrame);
		if ( frame ){
			frame.contentWindow.postMessage("resetMap:"+szFrame,"*");
		}
	};

	// ================================================
	// cascaded api handling
	// ================================================

	// --------------------------------------
	// a) embedded apis will register here
	// --------------------------------------

	/** array to store the api objects of embedded ixmaps windows which have registered to this (HTML) parent */
	ixmaps.embeddedApi = null; 
	ixmaps.embeddedApiA = new Object(); 

	/**
	 * register the given api (from an embedded map) with the given name;
	 * this makes the api accessable from the parent HTML page
	 * @param {object} api the API object
	 * @param {String} szMap the name of the map registering the api (must be given as query parameter '&name=' with the maps URL)
	 * @param {object} apiwindow the window object of the map registering the api 
	 * @return void
	 * @private
	 */
	ixmaps.registerApi = function(api,szMap,apiwindow){

		console.log("registerApi: "+szMap);

		if ( api == this ){
			console.log("same level ---> exit"); 
			return;
		}
		this.embeddedApi = api;
		this.embeddedApi.window = apiwindow;
		for ( a in this.embeddedApiA ){
			// for every embedded frame only one entry  
			// if already exists an entry for this api, delete it
			if(this.embeddedApiA[a]==api){
				console.log("deleteApi: "+a);
				delete this.embeddedApiA[a];
			}
		}
		console.log("registerApi: "+szMap);
		this.embeddedApiA[szMap] = api;
	};

	// -----------------------------------------
	// b) register this api to the parent window
	// -----------------------------------------

	ixmaps.registerMe = function(){

		console.log("register me");
		try{
			if ( window.opener ){
				ixmaps.parentApi = window.opener.ixmaps;
			}else
			if ( parent ){
				ixmaps.parentApi = parent.window.ixmaps;
			}
			else{
				alert("error: missing parent window for parameter !");
			}
		}catch (e){}

		// register the embedded map,
		// in case the parent page holds more than one embedded map, we can sync them
		if (!ixmaps.szMap){
			ixmaps.szMap = "map";
		}
		if ( ixmaps.parentApi ){
			// register api to parent api 
			try{
				ixmaps.parentApi.registerApi(ixmaps,ixmaps.szMap,window );
			}catch (e){}
		}else{
			// register api to cross domain parent api
			parent.postMessage("registerMap:"+ixmaps.szMap,"*");
		}
	};

	// register this api ! 
	// ---------------------
	ixmaps.registerMe();


	// -----------------------------------------
	//
	// little helpers
	//
	// -----------------------------------------

	/**
	 * bubble up embeddedSVG handler
	 * @param {object} embeddedSVG the handler of the embedded SVG object
	 * @return void
	 * @private
	 */
	ixmaps.setEmbeddedSVG = function(embeddedSVG){
		if ( !this.embeddedSVG ){
			this.embeddedSVG = embeddedSVG;
		}
		if (this.parentApi && (this.parentApi != this) && this.parentApi.setEmbeddedSVG ){
			this.parentApi.setEmbeddedSVG(this.embeddedSVG);
		}
	};

	/**
	 * bubble up loaded project
	 * @param {object} loaded project (json)
	 * @return void
	 * @private
	 */
	ixmaps.setLoadedProject = function(loadedProject){
		this.loadedProject = loadedProject;
		if (this.parentApi && (this.parentApi != this) && this.parentApi.setLoadedProject ){
			this.parentApi.setLoadedProject(loadedProject);
		}
	};

    /**
	 * gives the parent api a function to wait for the embedded map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Function} fCallBack the function to call, if the map is loaded
	 * @return void
	 * @private
	 */
	ixmaps.waitForEmbeddedMap = function(szMap,fCallBack){

		if ( ( ixmaps.embeddedApiA[szMap] && ixmaps.embeddedApiA[szMap].embeddedSVG ) ||
			 ( ixmaps.embeddedApiA["map"]  && ixmaps.embeddedApiA["map"].embeddedSVG  ) ) {
			if ( typeof(ixmaps.embeddedApiA[szMap||"map"]) != "undefined" ){
				fCallBack(ixmaps.embeddedApiA[szMap||"map"]);
			}else{
				fCallBack(szMap||"map");
			}
		}else{
			setTimeout("ixmaps.waitForEmbeddedMap('"+szMap+"',"+fCallBack+")",1000);
		}
	};

	/**
	 * gives the parent a function to reset the embedded map
	 * practically resets the embedde SVG handler 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 * @private
	 */
	ixmaps.resetEmbeddedMap = function(szMap){
		try{ixmaps.embeddedApiA[szMap].embeddedSVG = null}catch(e){};
		try{ixmaps.embeddedApiA["map"].embeddedSVG = null}catch(e){};
	};

	// -----------------------------------------
	//
	// functions to control the mebedded map
	//
	// -----------------------------------------

	/**
	 * dispatch a function call to an embedded map which can be:<br>
	 * a) an embedded ixmaps api, if registered<br> 
	 * b) a cross domain iframe<br> 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szFunc the name of the function to dispatch
	 * @param {Array} argA an array of argument to pass
	 * @return void
	 * @private
	 */
	ixmaps.dispatchToEmbeddedApi = function(szMap,szFunc,argA){
		
		// GR 04.02.2020 handle'old' generic map name 'map'
		// --------------------------------------------------------------------
		if ( (szMap == "map") && !ixmaps.embeddedApiA[szMap] ){
			szMap = Object.keys(ixmaps.embeddedApiA)[0];
		}

		// GR 28.11.2017 workaround for 'old' calls without szMap specification
		// --------------------------------------------------------------------
		if ( 0 && szMap && !ixmaps.embeddedApiA[szMap] ){
			argA.unshift(szMap);
			szMap = Object.keys(ixmaps.embeddedApiA)[0];
		}
		szMap = szMap || Object.keys(ixmaps.embeddedApiA)[0] || "map";

		// create argument string
		//
		szArgs = "";
		for ( i=0; i<argA.length; i++ ){
			if ( (typeof(argA[i])!="undefined") ){

				szArgs += (i>0?",":"") +  JSON.stringify(argA[i]) ;
			}
		}
		// create function call
		//		if embedded ixmaps is another API or an cross domain iframe
		//		(prooven by ixmaps.embeddedApiA[szMap] not found),
		//		then add szMap as first argument
		//		than add all other arguments
		var szCall = szFunc +'(';
		if ( ixmaps.embeddedApiA[szMap] && ixmaps.embeddedApiA[szMap].api ){
			szCall += "'" + szMap + "',";
		}
		szCall += szArgs;
		szCall += ')';

		// dispatch call
		//
		//	1. try own context
		if ( ixmaps.embeddedApiA && Object.getOwnPropertyNames(ixmaps.embeddedApiA).length && ixmaps.embeddedApiA[szMap] && !ixmaps.embeddedApiA[szMap].crossdomain ){

			eval("ixmaps.embeddedApiA['"+(szMap||'map')+"']."+szCall);

		//	2. cross domain iframe
		}else{

			var szCall = szFunc +'(';
			szCall += "'" + szMap + "',";
			szCall += szArgs;
			szCall += ')';
			ixmaps.iframe.exec(szMap||"embed-cross","ixmaps."+szCall);
		}
	};

	/**
	 * dispatch a function call to an embedded map which can be:<br>
	 * a) an embedded ixmaps api, if registered<br> 
	 * b) a cross domain iframe<br> 
	 * @param {String} szFunc the name of the function to dispatch
	 * @param {Array} argA an array of argument to pass
	 * @return void
	 * @private
	 */
	ixmaps.dispatchToParentApi = function(szFunc,argA){

		// create argument string
		//
		szArgs = "";
		for ( i=0; i<argA.length; i++ ){
			if ( (typeof(argA[i])!="undefined") ){
				szArgs += (i>0?",":"") +  JSON.stringify(argA[i]) ;
			}
		}
		// create function call
		//
		var szCall = "ixmaps." + szFunc +'(';
		szCall += szArgs;
		szCall += ')';

		// dispatch call
		//
		parent.postMessage("executeThis:"+szCall,"*");
	};

	// .............................................................................
	//
	// e x p o r t e d
	//
	// .............................................................................

	/**
	 * a helper function to check number of arguments
	 */
	var __checkArguments = function(arg,n,fu){
		var args = Array.prototype.slice.call(arg);
		if (args.length<n){
			ixmaps.error("error: missing arguments in "+(fu||"function call")+" !");
		}
	};
	
	/**
	 * a function to wait for the embedded map
	 * a map can have a specific name or the generic name 'map'
	 * @param {String} szMap the name of the embedded map
	 * @param {Function} fCallBack the function to call, if the map is loaded
	 * @return void
	 * @example
	 * ixmaps.waitForMap("map1",function(){
     *	 ixmaps.setView("map1",[51.59898731096802,-0.33786544322673245],10);
     * };
	 * ixmaps.waitForMap("map2",function(){
     *	 ixmaps.setView("map2",[51.49898731096802,-0.04669189453125003],10);
     * };
	 */
	ixmaps.waitForMap = function(szMap,fCallBack){
		ixmaps.iframe.waitForMap(szMap,fCallBack);
	};

	/**
	 * a function to wait for map events
	 * a map can have a specific name or the generic name 'map'
	 * @param szMap the name of the embedded map
	 * @param fCallBack the function to call, if an event occurs
	 * @return void
	 */
	ixmaps.waitForEvent = function(szMap,fCallBack){
		ixmaps.iframe.waitForEvent(szMap,fCallBack);
	};

	/**
	 * load a data feed (CSV, JSON,... )into an embed context defined by a registered map name
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrlData the url of the data feed to be loaded
	 * @return void
	 */
	ixmaps.loadData = function(szMap,szUrlData,szFlag){
		__checkArguments(arguments,2,"loadData()");
		this.isMap = false;
		this.dispatchToEmbeddedApi(szMap,"loadData",[szUrlData,szFlag]);
	};
	
	/**
	 * load a new project (json) into an embed context defined by a registered map name
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrlProject the url of the SVG map to be loaded
	 * @return void
	 */
	ixmaps.loadProject = function(szMap,szUrlProject,szFlag){
		__checkArguments(arguments,2,"loadProject()");
		this.isMap = false;
		this.dispatchToEmbeddedApi(szMap,"loadProject",[szUrlProject,szFlag]);
	};
	/**
	 * load a new map (svg/svgz) into an embed context defined by a registered map name
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrlMap the url of the SVG map to be loaded
	 * @param {String} [szUrlStory] parameter to load and activate a story
	 * @return void
	 */
	ixmaps.loadMap = function(szMap,szUrlMap,szUrlStory){
		__checkArguments(arguments,2,"loadMap()");
		this.isMap = false;
		this.dispatchToEmbeddedApi(szMap,"loadMap",[szUrlMap,szUrlStory]);
	};
	/**
	 * load a new story; into the sidebar or hidden
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrlStory parameter to load and activate a story
	 * @param {Number} [nWidth] defines a new width for the sidebar where the story sits in
	 * @return void 
	 */
	ixmaps.loadStory = function(szMap,szUrlStory,nWidth){
		__checkArguments(arguments,2,"loadStory()");
		this.dispatchToEmbeddedApi(szMap,"loadStory",[szUrlStory,nWidth]);
	};
	/**
	 * load a new sidebar content
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrlStory parameter to load and activate a story
	 * @param {Number} [nWidth] defines a new width for the sidebar
	 * @return void
	 */
	ixmaps.loadSidebar = function(szMap,szUrlStory,nWidth){
		__checkArguments(arguments,2,"loadSidebar()");
		this.dispatchToEmbeddedApi(szMap,"loadSidebar",[szUrlStory,nWidth]);
	};
	/**
	 * show a new sidebar content
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.hideSidebar = function(szMap){
		this.dispatchToEmbeddedApi(szMap,"hideSidebar",[]);
	};
	/**
	 * show a new sidebar content
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.showSidebar = function(szMap){
		this.dispatchToEmbeddedApi(szMap,"showSidebar",[]);
	};
	/**
	 * set a new project (stringified json) into an embed context defined by a registered map name
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szProject the project definition (stringified JSON) 
	 * @return void
	 */
	ixmaps.setProject = function(szMap,szProject){
		__checkArguments(arguments,2,"setProject()");
		this.isMap = false;
		this.dispatchToEmbeddedApi(szMap,"setProject",[szProject]);
	};

	/**
	 * set the view of the map to the given bounding box; the box is defined by 2 points: SW (south,west) and NE (north,east) 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} bounds the new geo bounds with; array of 4 coordinates
	 * @return void
     * @example ixmaps.setBounds("map",[36.485910216989004,-0.11973237624387232,47.639325496476276,27.80527925124387]);
	 */
	ixmaps.setBounds = function(szMap,bounds){
		__checkArguments(arguments,2,"setBounds()");
		this.dispatchToEmbeddedApi(szMap,"setBounds",[bounds]);
	};
	/**
	 * set the center and zoom of a map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} center the new center of the map; array of 2 coordinates
	 * @param {Number} nZoom the new zoomfactor of the map
	 * @return void
     * @example ixmaps.setView("map1",[51.59898731096802,-0.33786544322673245],10);
	 */
	ixmaps.setView = function(szMap,center,nZoom){
		__checkArguments(arguments,3,"setView()");
		this.dispatchToEmbeddedApi(szMap,"setView",[center,nZoom]);
	};
	/**
	 * set the center of a map to a point given in latitide/longitude
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} center the new center of the map; array of 2 coordinates
	 * @return void
     * @example ixmaps.setCenter("map",[51.59898731096802,-0.33786544322673245]);
	 */
	ixmaps.setCenter = function(szMap,center){
		__checkArguments(arguments,2,"setCenter()");
		this.dispatchToEmbeddedApi(szMap,"setCenter",[center]);
	};
	/**
	 * setZoom
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nZoom the new zoom level of the view
	 * @return void
     * @example ixmaps.setZoom("map",10);
	 */
	ixmaps.setZoom = function(szMap,nZoom){
		__checkArguments(arguments,2,"setZoom()");
		this.dispatchToEmbeddedApi(szMap,"setZoom",[nZoom]);
	};
	/**
	 * fly to the center and zoom of a map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} center the new center of the map; array of 2 coordinates
	 * @param {Number} nZoom the new zoomfactor of the map
	 * @return void
     * @example ixmaps.flyTo("map1",[51.59898731096802,-0.33786544322673245],10);
	 */
	ixmaps.flyTo = function(szMap,center,nZoom){
		__checkArguments(arguments,3,"setView()");
		this.dispatchToEmbeddedApi(szMap,"flyTo",[center,nZoom]);
	};
	/**
	 * define a minimal zoom level for the map; the user cannot zoom out beyond this level
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nZoom the new minimal zoomm level of the view
	 * @return void
	 */
	ixmaps.minZoom = function(szMap,nZoom){
		__checkArguments(arguments,2,"minZoom()");
		this.dispatchToEmbeddedApi(szMap,"minZoom",[nZoom]);
	};
	/**
	 * get the actual center of the map view
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @type Array 
	 * @return {Array} center as lat/lon array (format see: {@link ixmaps.setCenter})
	 */
	ixmaps.getCenter = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getCenter();
	};
	/**
	 * get the actual zoomfactor of the map view
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @type Number
	 * @return {Number} zoomfactor
	 */
	ixmaps.getZoom = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getZoom();
	};
	/**
	 * get the actual scale of the map view
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @type Number
	 * @return {Number} map-scale
	 */
	ixmaps.getMapScale = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getMapScale();
	};
	/**
	 * get the actual bounding box of the map view
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @type Array 
	 * @return {Array} SW and NE point bounding box as array of 4 numbers (see: {@link ixmaps.setBounds})
	 */
	ixmaps.getBoundingBox = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getBoundingBox();
	};
	/**
	 * get layer info array 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @type Array
	 * @return {Array} array of layer objects
	 */
	ixmaps.getLayer = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getLayer();
	};
	/**
	 * get layer dependency list
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {Array} array of layer dependency objects
	 */
	ixmaps.getLayerDependency = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getLayerDependency();
	};
	/**
	 * get tile info object
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {object} map tile object
	 */
	ixmaps.getTileInfo = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getTileInfo();
	};
	/**
	 * switch layer
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szLayerName the name of the layer to switch visible/invisible
	 * @param {Boolean} fState true or false
	 * @return void
	 */
	ixmaps.switchLayer = function(szMap,szLayerName,fState){
		__checkArguments(arguments,3,"setView()");
		this.dispatchToEmbeddedApi(szMap,"switchLayer",[szLayerName,fState]);
	};
	/**
	 * execute a bookmark string, in substance a sequence of JavaScript calls
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szBookmark the bookmark string
	 * @param {Boolean} fClear if true, clears all existing map themes
	 * @return void
	 * @private
	 */
	ixmaps.execBookmark = function(szMap,szBookmark,fClear){
		__checkArguments(arguments,2,"execBookmark()");
		this.dispatchToEmbeddedApi(szMap,"execBookmark",[szBookmark,fClear]);
	};

	/**
	 * execute a JavaScript string
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szScript the script to be executed
	 * @param {Boolean} fClear if true, clears all existing map themes
	 * @return void
	 * @private
	 */
	ixmaps.execScript = function(szMap,szScript,fClear){
		__checkArguments(arguments,2,"execScript()");
		this.dispatchToEmbeddedApi(szMap,"execScript",[szScript,fClear]);
	};

	/**
	 * toggle a theme given by its name, if theme exists it will be removed
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szTheme the name of the theme 
	 * @param {String} [optional] szSourceName a (xml) theme definition file 
	 * @return void
	 * @deprecated in use for map applications which have themes defined in XML; these themes definitions where used to define standalone multitheme SVG map applications
	 */
	ixmaps.toggleTheme = function(szMap,szThemeName,szSourceName){
		this.dispatchToEmbeddedApi(szMap,"toggleTheme",[szThemeName,szSourceName]);
	};
	/**
	 * create the given theme
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName the name of the theme as defined in the xml file
	 * @param {String} szSourceName a (xml) theme definition file 
	 * @return void
	 * @deprecated in use for map applications which have themes defined in XML; these themes definitions where used to define standalone multitheme SVG map applications
	 */
	ixmaps.setTheme = function(szMap,szThemeName,szSourceName){
		this.dispatchToEmbeddedApi(szMap,"setTheme",[szThemeName,szSourceName]);
	};
	/**
	 * create a new Theme on the map; this is the principal method to create theme representations on the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName a name for the theme [optional]; will be displayed if the theme has no title defined
	 * @param {Object} opt a JSON definition of the theme; fro more information, please see <a href="http://public.ixmaps.com.s3-website-eu-west-1.amazonaws.com/docs/ixmaps-doc-themes-1.html" target="_blank">documentation</a>
	 * @param {Boolean} fClear if true, clears all previous themes
	 * @return void
	 * @example ixmaps.newTheme("map","Totale complessivo",{  
     *    layer: "com2011_s",
     *    field: "Totale complessivo",
     *    style: {
     *        type: "CHOROPLETH|EQUIDISTANT",
     *        colorscheme: [  "5","#FFFDD8","#B5284B","2colors","#FCBA6C" ],
     *        dbtable: "themeDataObj csv url(http://mysite/mydata/data.csv)",
     *        lookupfield: "comune"
     *    },"clear"
     * });
	 */
	ixmaps.newTheme = function(szMap,szThemeName,opt,fClear){

		// check if we have a call without 'szMap'
		// we must shift the arguments and insert null
		// GR 25.11.2017 after cleaning htmlgui_story.js

		var args = Array.prototype.slice.call(arguments);

		if ( (typeof(opt) == "undefined") || (typeof(opt) == "string") ){
			fClear = opt;
			opt = szThemeName;
			szThemeName = szMap;
			szMap = null;
		}				
		if ( opt == null || (typeof(opt) == "undefined") || (typeof(opt) == "string") ){
			ixmaps.error("illegal or incomplete function call on:\nixmaps.newTheme\nargs:"+args.join(',')+"");
		}
		//ixmaps.message("... creating theme ...");
		
		// GR 06.01.2022 must go this way now, opt has more substructures 
		this.dispatchToEmbeddedApi(szMap,"newTheme",[szThemeName,opt,fClear]);
		return;

		/**
		if ( typeof(opt.field) != 'string' ){
			s = "";
			for ( x=0; x<opt.field.length; x++ ){
				s += (x>0?"|":"") + opt.field[x];
			}
			opt.field = s;
		}
		if ( typeof(opt.style) != 'string' ){
			var szStyle = "";
			var s = null;
			for ( a in opt.style ){
				if ( opt.style[a] ){
					// separated by '|' because of possible RGB(r,g,b) color definition  
					if ( (typeof(opt.style[a]) != "string") && (typeof(opt.style[a]) != "number") ){
						s = "";
						for ( x=0; x<opt.style[a].length; x++ ){
							s += (x>0?"|":"") + opt.style[a][x];
						}
					}else{
						s = String(opt.style[a]);	
					}
					szStyle += a +':'+ s + ";";
				}
			}
			opt.style = szStyle;
		}

		if ( fClear ){
			if ( fClear == "force" ){
				opt.style.type += "|FORCE";
			}
			if ( fClear == "clearcharts" ){
				var szScript = "map.Api.clearAllCharts()";
				this.dispatchToEmbeddedApi(szMap,"execScript",[szScript]);
			}else{
				var szScript = "map.Api.clearAll()";
				this.dispatchToEmbeddedApi(szMap,"execScript",[szScript]);
			}
		}
		
		var szScript = "map.Api.newMapTheme(\""+(opt.layer||"")+"\",\""+(opt.field||"")+"\",\""+(opt.field100||"")+"\",\""+opt.style+"\",\""+szThemeName+"\",\""+opt.axis+"\")";

		this.dispatchToEmbeddedApi(szMap,"execScript",[szScript,fClear]);
		**/
		
	};

	/**
	 * refresh a Theme already on the ma
	 * reload data and redraw theme
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName a name for the theme [optional]; will be displayed if the theme has no title defined
	 * @return void
	 */
	ixmaps.refreshTheme = function(szMap,szThemeName){
		this.dispatchToEmbeddedApi(szMap,"refreshTheme",[szThemeName]);
	};
	/**
	 * show a Theme on the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName a name for the theme [optional]; will be displayed if the theme has no title defined
	 * @return void
	 */
	ixmaps.showTheme = function(szMap,szThemeName){
		this.dispatchToEmbeddedApi(szMap,"showTheme",[szThemeName]);
	};
	/**
	 * hide a Theme on the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName a name for the theme [optional]; will be displayed if the theme has no title defined
	 * @return void
	 */
	ixmaps.hideTheme = function(szMap,szThemeName){
		this.dispatchToEmbeddedApi(szMap,"hideTheme",[szThemeName]);
	};
	/**
	 * remove a Theme from the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName a name for the theme [optional]; will be displayed if the theme has no title defined
	 * @return void
	 */
	ixmaps.removeTheme = function(szMap,szThemeName){
		this.dispatchToEmbeddedApi(szMap,"removeTheme",[szThemeName]);
	};
	/**
	 * remove all themes (choropleth, symbol or chart symbols) from the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.clearAll = function(szMap){
		this.dispatchToEmbeddedApi(szMap,"clearAll",[]);
	};
	/**
	 * remove all chart themes (symbol or chart symbols) from the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.clearAllCharts = function(szMap){
		this.dispatchToEmbeddedApi(szMap,"clearAllCharts",[]);
	};
	/**
	 * remove all chart themes (symbol or chart symbols) from the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 * @private
	 * @deprecated - use ixmaps.clearAllCharts()
	 */
	ixmaps.clearAllChart = function(szMap){
		this.dispatchToEmbeddedApi(szMap,"clearAllChart",[]);
	};
	/**
	 * remove all choropleth themes from the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.clearAllChoropleth = function(szMap) {
		this.dispatchToEmbeddedApi(szMap,"clearAllChoropleth",[]);
	};
	
	/**
	 * selects a theme from the maps legend to be shown(switchd on)
	 * (theme must be present in the generated maps legend) 
	 * @param szMap the name of the embedded map
	 * @param szTheme the name of the theme as shown in the map legend (when in full mode)
	 * @return void
	 * @private
	 * @deprecated 19.06.2017 no more evidence of use found 
	 */
	ixmaps.checkTheme = function(szMap,szTheme){
		try	{
			ixmaps.embeddedApiA[szMap].embeddedSVG.window.map.Api.minimizeThemeLegends();
			ixmaps.embeddedApiA[szMap].embeddedSVG.window.map.Api.switchMapTheme(szTheme,'on');
		}catch (e){	}
	};

	/**
	 * change the style of one theme, 
	 * if the theme (szTheme) is not defined, the top most theme is changed
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szTheme the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @param {String} szStyle a style definition string (see <a href="http://public.ixmaps.com.s3-website-eu-west-1.amazonaws.com/docs/ixmaps-doc-themes-1.html" target="_blank">documentation</a>)
	 * @param {String} szFlag the style change method ('set' or 'factor' or 'remove' - see api doc)
	 * @example ixmaps.changeThemeStyle(null,null,"opacity:0.5","factor");
	 * @example ixmaps.changeThemeStyle("map1",null,"type:AGGREGATE","add");
	 * @return void
	 */
	ixmaps.changeThemeStyle = function(szMap,szTheme,szStyle,szFlag){
		this.dispatchToEmbeddedApi(szMap,"changeThemeStyle",[szTheme,szStyle,szFlag]);
	};

	/**
	 * change the object (charts) scaling of the map 
	 * @instance
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nDelta a numeric factor to scale the objects size with
	 * @return void
	 */
	ixmaps.changeObjectScaling = function(szMap,nDelta){
		this.dispatchToEmbeddedApi(szMap,"changeObjectScaling",[nDelta]);
	};

	/**
	 * change the feature scaling of the map 
	 * @instance
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nDelta a numeric factor to scale the objects size with
	 * @return void
	 */
	ixmaps.changeFeatureScaling = function(szMap,nDelta){
		this.dispatchToEmbeddedApi(szMap,"changeFeatureScaling",[nDelta]);
	};

	/**
	 * change the line scaling of the map 
	 * @instance
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nDelta a numeric factor to scale the objects size with
	 * @return void
	 */
	ixmaps.changeLineScaling = function(szMap,nDelta){
		this.dispatchToEmbeddedApi(szMap,"changeLineScaling",[nDelta]);
	};

	/**
	 * change the label scaling of the map 
	 * @instance
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Number} nDelta a numeric factor to scale the objects size with
	 * @return void
	 */
	ixmaps.changeLabelScaling = function(szMap,nDelta){
		this.dispatchToEmbeddedApi(szMap,"changeLabelScaling",[nDelta]);
	};

	/**
	 * zoom to theme extension, 
	 * if the theme (szTheme) is not defined, the top most theme is taken
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szTheme the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @return void
	 */
	ixmaps.zoomToTheme = function(szMap,szTheme){
		this.dispatchToEmbeddedApi(szMap,"zoomToTheme",[szTheme]);
	};

	/**
	 * mark theme class
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {Number} nClass the number of the theme class
	 * @return void
	 */
	ixmaps.markThemeClass = function(szMap,szThemeId,nClass){
		this.dispatchToEmbeddedApi(szMap,"markThemeClass",[szThemeId,nClass]);
	}

	/**
	 * unmark theme class
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {Number} nClass the number of the theme class
	 * @return void
	 */
	ixmaps.unmarkThemeClass = function(szMap,szThemeId,nIndex){
		this.dispatchToEmbeddedApi(szMap,"unmarkThemeClass",[szThemeId,nIndex]);
	}

	/**
	 * set time frame
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {Number} nUMin the lower time limit (utime) of the frame
	 * @param {Number} nUMax the upper time limit (utime) of the frame
	 * @return void
	 */
	ixmaps.setThemeTimeFrame = function(szMap,szThemeId,nUMin,nUMax){
		this.dispatchToEmbeddedApi(szMap,"setThemeTimeFrame",[szThemeId,nUMin,nUMax]);
	}

	/**
	 * pause theme clip
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.pauseThemeClip = function(szMap,szThemeId){
		this.dispatchToEmbeddedApi(szMap,"pauseThemeClip",[szThemeId]);
	}

	/**
	 * start theme clip
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.startThemeClip = function(szMap,szThemeId,nFrame){
		this.dispatchToEmbeddedApi(szMap,"startThemeClip",[szThemeId,nFrame]);
	}

	/**
	 * set theme clip frame
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {Number} nFrame number of the clip frame to show
	 * @return void
	 */
	ixmaps.setThemeClipFrame = function(szMap,szThemeId,nFrame){
		this.dispatchToEmbeddedApi(szMap,"setThemeClipFrame",[szThemeId,nFrame]);
	}

	/**
	 * bext theme clip frame
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.nextThemeClipFrame = function(szMap,szThemeId){
		this.dispatchToEmbeddedApi(szMap,"nextThemeClipFrame",[szThemeId]);
	}

	
	/**
	 * filter theme items by reloading theme
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 * @private
	 */
	ixmaps.filterThemeItemsReload = function(szThemeId,szFilter,mode){
		if ( ixmaps.tFilterThemeItemsReload ){
			clearTimeout(ixmaps.tFilterThemeItemsReload);
		}
		// GR30.10.2017 szFilter may contain "'" characters; replace with \' to pass string encoding
		ixmaps.tFilterThemeItemsReload = setTimeout("ixmaps.filterThemeItemsReloadExecute('"+szThemeId+"','"+szFilter.replace(/'/g,"\\'")+"','"+mode+"')",1000);
	};
	/**
	 * filter theme items by reloading theme - delayed execute
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 * @private
	 */
	ixmaps.filterThemeItemsReloadExecute = function(szThemeId,szFilter,mode){
		ixmaps.changeThemeStyle(szThemeId,'filter:'+ szFilter);	
	};
	/**
	 * filter theme items 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {String} szFilter the filter string
	 * @param {String} mode an additional flag
	 * @return void
	 */
	ixmaps.filterThemeItems = function(szMap,szThemeId,szFilter,mode){
		// GR 30.06.2015 different filter for AGGREGATE themes
		var themeObj = ixmaps.getThemeObj(szThemeId);
		if ( themeObj && ( themeObj.szFlag.match(/AGGREGATE/) || themeObj.szFlag.match(/MULTI/)) || szFilter.match(/WHERE/) ){
			ixmaps.filterThemeItemsReload(szThemeId,(szFilter||" "),mode);
			return;
		}
		this.dispatchToEmbeddedApi(szMap,"filterThemeItems",[szThemeId,szFilter,mode]);
	};
	/**
	 * highlight theme items 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeId the id of the theme received on create
	 * @param {String} szItems the ids of the items to highlight
	 * @param {String} mode an additional flag
	 * @return void
	 */
	ixmaps.highlightThemeItems = function(szMap,szThemeId,szItems,separator){
		this.dispatchToEmbeddedApi(szMap,"highlightThemeItems",[szThemeId,szItems,separator]);
	};

	/**
	 * create a selection of theme items by a given shape, buffer
	 * @param {String} szThemeId the id of the theme with map items to select
	 * @param {String} szSelectShape the id of the selection shape
	 * @param {String} szStyle one of "circle","square","shape"
	 * @param {String} szTitle an optional title 
	 * @return void
	 */
	ixmaps.newSelection = function (szMap,szThemeId,szSelectShape,szStyle,szTitle) {
		this.dispatchToEmbeddedApi(szMap,"newSelection",[szThemeId,szSelectShape,szStyle,szTitle]);
	};

	/**
	 * loadExternalData
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szUrl the URL of the external data to be loaded
	 * @param {Object} opt a JSON object that describes the data source  
	 * @return void
	 * @private
	 */
	ixmaps.loadExternalData = function(szMap,szUrl,opt){
		try{
			ixmaps.embeddedApi.htmlgui_loadExternalData(szUrl,opt);
		}
		catch (e){
			ixmaps.embeddedApi.embeddedApi.htmlgui_loadExternalData(szUrl,opt);
		}
	};
	
	/**
	 * require
	 * @param {String} szUrl the URL of the external script to add toi project * @return void
	 * @return void
	 * @private
	 */
	ixmaps.require = function(szMap,szUrl){
		this.dispatchToEmbeddedApi(szMap,"require",[szUrl]);
	};
	
	/**
	 * show data table
	 * @void
	 */
	ixmaps.popupThemeTable = function(){
		try{
			ixmaps.embeddedApi.viewTable('dialog','10,103');
		}
		catch (e){
			ixmaps.embeddedApi.embeddedApi.viewTable('dialog','10,103');
		}
	};

	/**
	 * show Project dialog
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupProject = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popupProject",[position]);
	};
	/**
	 * show Bookmarks dialog
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupBookmarks = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popupBookmarks",[position]);
	};
	/**
	 * show share dialog
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupShare = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popupShare",[position]);
	};
	/**
	 * show Theme Code Editor
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupThemeEditor = function(szMap,position,szId){
		this.dispatchToEmbeddedApi(szMap,"popupThemeEditor",[position,szId]);
	};
	/**
	 * show Theme Configurator (Wizzard)
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupThemeConfigurator = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popupThemeConfigurator",[position]);
	};
	/**
	 * show Theme Facets (Filter)
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popupThemeFacets = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popupThemeFacets",[position]);
	};
	/**
	 * show actual map in viewer
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popOutMap = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popOutMap",["window"]);
	};
	/**
	 * show actual map in viewer
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popOutView = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popOutView",["window"]);
	};
	/**
	 * show actual map in config
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popOutEdit = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popOutEdit",["window"]);
	};
	/**
	 * show actual map in project explorer
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Array} position x,y screen position for the modal dialog
	 * @void
	 */
	ixmaps.popOutProject = function(szMap,position){
		this.dispatchToEmbeddedApi(szMap,"popOutProject",["window"]);
	};
	/**
	 * get themes
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {array} an array ot the theme ids
	 */
	ixmaps.getThemes = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemes();
	};
	/**
	 * get the style of a theme
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @return {String} the 'style' part of a theme definition to be used for legends
	 */
	ixmaps.getThemeStyleString = function(szMap,szThemeName){
		if (arguments.length == 1){szThemeName=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeStyleString(szThemeName);
	};
	/**
	 * get the definition string of a theme
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @return {String} a serialized representation of the theme definition object (JSON)
	 */
	ixmaps.getThemeDefinitionString = function(szMap,szThemeName){
		if (arguments.length == 1){szThemeName=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeDefinitionString(szThemeName);
	};
	/**
	 * get the definition object of a theme
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @return {Object} the theme definition object (JSON)
	 */
	ixmaps.getThemeDefinitionObj = function(szMap,szThemeName){
		if (arguments.length == 1){szThemeName=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeDefinitionObj(szThemeName);
	};
	/**
	 * get the actual theme object, may be different from the definition object
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szThemeName the name of the theme [optional] <em>if null it refers to the upmost or only theme</em>
	 * @return {Object} the actual theme definition object (JSON) which can differ from the definitiuon object
	 */
	ixmaps.getThemeObj = function(szMap,szThemeName){
		if (arguments.length == 1){szThemeName=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeObj(szThemeName);
	};

	/**
	 * get the data of a theme object or map item
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the data as JSON object
	 */
	ixmaps.getData = function(szMap,szItem){
		if (arguments.length == 1){szItem=szMap;szMap=null;}
		if ( (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).api == true ){
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getData(szMap,szItem);
		}else{
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getData(szItem);
		}
	};

	/**
	 * get the position of a theme object or map item
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the data as JSON object
	 */
	ixmaps.getPosition = function(szMap,szItem){
		if (arguments.length == 1){szItem=szMap;szMap=null;}
		if ( (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).api == true ){
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getPosition(szMap,szItem);
		}else{
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getPosition(szItem);
		}
	};

	/**
	 * create a browser bookmark by updating the URL with the actual theme and map view
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Integer} nZoom a possible additive zoom for bookmark
	 * @param {Boolean} fFlag true or false
	 * @return void
	 */
	ixmaps.updatePageHistory = function(szMap,nZoom,fFlag){
		this.dispatchToEmbeddedApi(szMap,"updatePageHistory",[nZoom||1,fFlag||true]);
	};

	/**
	 * get a JavaScript string to set the maps envelove (bounds)
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Integer} nZoom optional parameter (2,3,4,...) to get a zoomed envelope
	 * @return {String} executable Javascript to set the map bounds; part of a bookmark
	 */
	ixmaps.getEnvelopeString = function(szMap,nZoom){
		if (arguments.length == 1){nZoom=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getEnvelopeString(nZoom);
	};
	/**
	 * @deprecated old function call
	 * @private 
	 */
	ixmaps.htmlgui_getEnvelopeString = function(szMap,nZoom){
		if (arguments.length == 1){nZoom=szMap;szMap=null;}
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getEnvelopeString(nZoom);
	};

	/**
	 * get a JavaScript string to create all actual themes of the map
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {String} executable Javascript to create all themes; part of a bookmark
	 */
	ixmaps.getThemesString = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemesString();
	};
	/**
	 * @deprecated old function call
	 * @private 
	 */
	ixmaps.htmlgui_getThemesString = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemesString();
	};

	/**
	 * get a complete bookmark string to reproduce map, view and themes
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {String} executable Javascript to reproduce the map; a comlete bookmark
	 */
	ixmaps.getBookmarkString = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getBookmarkString();
	};
	/**
	 * @private
	 * @deprecated old function call
	 */
	ixmaps.htmlgui_getBookmarkString = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getBookmarkString();
	};

	/**
	 * get a complete project definition string (JSON) to reproduce map, view and themes
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {String} project definition string (JSON) to reproduce the map and theme
	 */
	ixmaps.getProjectString = function(szMap){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getProjectString();
	};

	/**
	 * zoom to map item
	 * @param {String} szItemId the id of the map item
	 * @return void
	 */
	ixmaps.zoomMapToItem = function (szMap,szItemId) {
		this.dispatchToEmbeddedApi(szMap,"zoomMapToItem",[szItemId]);
	};

	/**
	 * dispatch on window resize event 
	 * @param {String} szMap the name of the embedded map
	 * @param {Object} box a bounding given in x,y,width,height
	 * @param {Boolean} zoomto if true zoom map to fit the box
	 * @return void
	 * @private
	 */
	ixmaps.resizeMap = function(szMap,box,zoomto){
		(ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).resizeMap(box,zoomto);
	};

	/**
	 * reset the map application
	 * @return void
	 */
	ixmaps.reset = function(){
		ixmaps.embeddedApi.embeddedSVG.map.Api.clearAll();
		ixmaps.embeddedApi.embeddedSVG.map.Api.doZoomMapToFullExtend();
	};
	
	/**
	 * set title 
	 * @param {String}	a new title to show on the map
	 * @return void
	 */
	ixmaps.setTitle = function(szTitle){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setTitle(szId);
		}
	};

	
	/**
	 * set map tool in all embedded maps;  
	 * the map tool manages the mouse (touch) input; 
	 * possible values are:
	 * <table><tr><td> 
	 * 'pan'			</td><td>zoom and pan the map</td></tr><td>
	 * 'info'			</td><td>query info of map elements by click</td></tr><td>
	 * 'coord'			</td><td>display lat/lon coordinate on click</td></tr><td>
	 * 'measurement'	</td><td>measure distance</td></tr><td>
	 * 'polyline'		</td><td>measure multiple distances</td></tr><td>
	 * 'polybon'		</td><td>measure area20/06/2017</td></tr><td>
	 * 'selectrect'		</td><td>select and aggregate theme values by rectangular buffer</td></tr><td>
	 * 'selectbuffer'	</td><td>select and aggregate theme values by circular buffer</td></tr><td>
	 * </td></tr></table>
	 * @param {String}	szId the map tool to be set (e.g. 'info');
	 * @return void
	 */
	ixmaps.setMapTool = function(szId){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setMapTool(szId);
		}
	};

	/**
	 * set (base)map type by name; change the (HTML) basemap into type defined for the basemap provider (leaflet,google...) 
	 * @param {String} szMap the map name [optional] 
	 * @param {String} szId the map type id to be set (e.g. 'satellite');
	 * @return void
	 */
	ixmaps.setMapTypeId = function(szMap,szId){
		this.dispatchToEmbeddedApi(szMap,"setMapTypeId",[szId]);
	};
	/**
	 * @deprecated old function call
	 * @private
	 */
	ixmaps.htmlgui_setMapTypeId = function(szId){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setMapTypeId(a,szId);
		}
	};

	/**
	 * get the (base)map type; returns the name of the actual maptype of the basemap (examples: 'roads','satellite') 
	 * @param {String} szMap the map name [optional] 
	 * @return {String} the actual map type
	 */
	ixmaps.getMapTypeId = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getMapTypeId();
	};
	/**
	 * @deprecated old function call
	 * @private
	 */
	ixmaps.htmlgui_getMapTypeId = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getMapTypeId();
	};

	/**
	 * get the url of the actual loaded story 
	 * @param {String} szMap the map name [optional]
	 * @return {String} the URL of the story
	 */
	ixmaps.getStoryUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getStoryUrl();
	};
	/**
	 * @deprecated old function call
	 * @private
	 */
	ixmaps.htmlgui_getStoryUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getStoryUrl();
	};
	/**
	 * get the url of the actual loaded SVG map 
	 * @param {String} szMap the map name [optional]
	 * @return {String} the URL of the SVG map
	 */
	ixmaps.getMapUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getMapUrl();
	};
	/**
	 * get the url of the actual loaded SVG map 
	 * @param {String} szMap the map name [optional]
	 * @return {String} the URL of the SVG map
	 */
	ixmaps.getLoadedMapUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getLoadedMapUrl();
	};
	/**
	 * @deprecated old function call
	 * @private
	 */
	ixmaps.htmlgui_getMapUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getMapUrl();
	};

	/**
	 * get the part of a bookmark string to define the base map provider 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szService the name of the base map provider
	 * @return {String} the bookmark string token to define the basemap provider
	 * @private
	 */
	ixmaps.getBaseMapParameter = function(szMap,szService){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getBaseMapParameter(szService);
	};

	/**
	 * get the part of a bookmark that defines scale parameter 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {Object} the scale pareameter object
	 * @private
	 */
	ixmaps.getScaleParam = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getScaleParam();
	};

	/**
	 * get map options (JSON), defining the maps behavior
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {Object}
	 * @private
	 * @example
	 *	{
	 *		featurescaling:"dynamic",
	 *		labelscaling:"dynamic",
	 *		objectscaling:"dynamic"
	 *	}
	 */
	ixmaps.getOptions = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getOptions();
	};

	/**
	 * get layer on/off switch (JSON), defining the layer switched off
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return {Object}
	 * @private
	 * @example
	 *	{
	 *		featurescaling:"dynamic",
	 *		labelscaling:"dynamic",
	 *		objectscaling:"dynamic"
	 *	}
	 */
	ixmaps.getLayerSwitch = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getLayerSwitch();
	};

	/**
	 * get host prefix of a map<br> 
	 * used while create bookmarks of the actual map to transform relative URLs into absolute URLs
	 * @param {String} szUrl a relative Url
	 * @return {String} the dispatched url
	 * @private
	 */
	ixmaps.dispatch = function(szUrl){
		try{
			return ixmaps.embeddedApiA['map'].dispatch(szUrl);
		}
		catch (e){
			return ixmaps.embeddedApiA['map'].embeddedApi.dispatch(szUrl);
		}
	};

	/**
	 * set tool offset top; may be usefull if we need empty space at the page (map) top  
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Integer} nMarginTop the offset in pixel of the map tools/widgets
	 * @return void
	 */
	ixmaps.setMapWidgetMarginTop = function(szMap,nMarginTop){
		this.setMapFeatures(szMap,"toolmargintop:"+String(Number(nMarginTop)));
	};

	/**
	 * set map features
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szFeatures a style string like "item1:value1;item2:value2;" 
	 * @return void
	 * @example	ixmaps.setMapFeatures("map","popupdelay:250;toolmargintop:60;flushPaintShape:5000;flushChartDraw:5000;featurescaling:true;objectscaling:dynamic;labelscaling:dynamic;dynamiclabel:NOSIZE;labelspace:2.0;checklabeloverlap:NOSQUEEZE;loadsilent:true;");
	 * @deprecated please use {@link ixmaps.setOptions} 
	 */
	ixmaps.setMapFeatures = function(szMap,szFeatures){
		this.dispatchToEmbeddedApi(szMap,"setMapFeatures",[szFeatures]);
	};

	/**
	 * set map scale parameter
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szParam a style string like "item1:value1;item2:value2;" 
	 * @return void
	 * @example	ixmaps.setScaleParam("map","normalSizeScale:50000;labelScaling:1.5");
	 */
	ixmaps.setScaleParam = function(szMap,szParam){
		this.dispatchToEmbeddedApi(szMap,"setScaleParam",[szParam]);
	};

	/**
	 * set map options, define the maps behavior
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Object} opt option object  like {item1:value1,item2:value2} 
	 * @return void
	 * @example
	 *	ixmaps.setOptions("map",{
	 *		featurescaling:"dynamic",
	 *		labelscaling:"dynamic",
	 *		objectscaling:"dynamic"
	 *	});
	 */
	ixmaps.setOptions = function(szMap,opt){ 
		this.dispatchToEmbeddedApi(szMap,"setOptions",[opt]);
	};

	/**
	 * set local text; localize, change or suppress application messages; nearly every messsage of iXMaps can be changed by this 
	 * method; simply define a localized message or even only a word of a message; you can also suppress the message defining an empty string ("") 
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szOrig the string to replace
	 * @param {String} szLocal the localized string
	 * @return void
	 * @example
	 * ixmaps.setLocalString("map","creating charts","...");
	 * ixmaps.setLocalString("map","loading data ...","... caricando dati ...");
	 */
	ixmaps.setLocalString = function(szMap,szOrig,szLocal){
		this.dispatchToEmbeddedApi(szMap,"setLocal",[szOrig,szLocal]);
	};

	/**
	 * set local strings
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szOrig original string 
	 * @param {String} szLocal local string 
	 * @return void
	 * @example
	 *	ixmaps.setLocal("map","loading","scaricando");
	 *	});
	 */
	ixmaps.setLocal = function(szMap,szOrig,szLocal){
		this.dispatchToEmbeddedApi(szMap,"setLocal",[szOrig,szLocal]);
	};

	/**
	 * set attribution strings
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szAttribution the attribution string 
	 * @return void
	 * @example
	 *	ixmaps.setAttribution("map","powered by iXMaps");
	 *	});
	 */
	ixmaps.setAttribution = function(szMap,szAttribution){
		this.dispatchToEmbeddedApi(szMap,"setAttribution",[szAttribution]);
	};

	/**
	 * set legend by string
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szLegend the legend definition string (HTML)
	 * @return void
	 * @example
	 *	ixmaps.setLegend("map","Title");
	 *	});
	 */
	ixmaps.setLegend = function(szMap,szLegend){
		this.dispatchToEmbeddedApi(szMap,"setLegend",[szLegend]);
	};

	/**
	 * set external data
	 * make data present as JavaScript object usable by theme definitions
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {object} data the data object 
	 * @param {object} opt a javascript object with data definitions; minimal two properties: type and name see example
	 * <table>
	 * <tr><td>type</td><td>the type of the data object ('json' or 'array')</td></tr>
	 * <tr><td>name</td><td>the define the name you can use for themes (dbtable option in {@link ixmaps.newTheme})</td></tr>
	 * </table>
	 * @return void
	 * @example
	 *	ixmaps.setExternalData("map",dataObj,{type:"json",name:"theme_data"});
	 *	});
	 */
	ixmaps.setExternalData = function(szMap,data,opt) {
		this.dispatchToEmbeddedApi(szMap,"setExternalData",[data,opt]);
	}

	/**
	 * set data
	 * make data present as JavaScript object usable by theme definitions
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {object} data the data object 
	 * @param {object} opt a javascript object with data definitions; minimal two properties: type and name see example
	 * <table>
	 * <tr><td>type</td><td>the type of the data object ('json' or 'array')</td></tr>
	 * <tr><td>name</td><td>the define the name you can use for themes (dbtable option in {@link ixmaps.newTheme})</td></tr>
	 * </table>
	 * @return void
	 * @example
	 *	ixmaps.setData("map",dataObj,{type:"json",name:"theme_data"});
	 *	});
	 */
	ixmaps.setData = function(szMap,data,opt) {
		this.dispatchToEmbeddedApi(szMap,"setExternalData",[data,opt]);
	}

	// -----------------------------------------
	// functions to synchronize the embedded maps
	// -----------------------------------------

	/**
	 * synchronise all embedded maps on page
	 * @return void
	 * @private
	 */
	ixmaps.syncSVGMap = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].syncSVGMap();
		}
	};

	/**
	 * display a message
	 * @param {String} szMessage the message to display
	 * @return void
	 */
	ixmaps.message = function(szMessage,nTimeout){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].message(szMessage,nTimeout);
		}
	};

	/**
	 * display a loading icon and a message
	 * @param {String} szMessage the (loading)message to display
	 * @param {Boolean} flag if true, show always, also in silent mode
	 * @return void
	 */
	ixmaps.showLoading = function(szMessage,flag){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].showLoading(szMessage,flag);
		}
	};

	/**
	 * hide loading icon and message
	 * @return void
	 */
	ixmaps.hideLoading = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].hideLoading();
		}
	};

	/**
	 * hide the user interface of the map(s) (the pan,info,search... buttons)
	 * @return void
	 */
	ixmaps.hideUi = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].hideUi();
		}
	};

	/**
	 * show the user interface of the map(s) (the pan,info,search... buttons); complement to {@link ixmaps.hideUi}
	 * @return void
	 */
	ixmaps.showUi = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].showUi();
		}
	};
	
	/**
	 * show the an about dialog 
	 * @return void
	 */
	ixmaps.showAbout = function(){ 
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].showAbout();
		}
	};

	/**
	 * show error message
	 * @param szText the error message
	 * @return void
	 */
	ixmaps.error = function(szText){
		try	{
			MessageBox.show(MESSAGE_TYPE.Error, "iXmaps", szText.replace(/\n+/g,'<br>'), null, null);
		}
		catch (e){
			alert(szText);
		}
	};
	/**
	 * show confirm dialog
	 * @param szText a message
	 * @param callOk the function to call on ok
	 * @param callCancel the function to call on cancel
	 * @return void
	 */
	ixmaps.confirm = function(szText,callOk,callCancel){
		try	{
			MessageBox.show(MESSAGE_TYPE.Confirmation, "iXmaps", szText.replace(/\n+/g,'<br>'), callOk, callCancel);
		}
		catch (e){
			if ( confirm("szText") ){
				callOk();
			}else{
				callCancel();
			}
		}
	};

	/**
	 * display a HTML map overlay
	 * @param {String} szHTML the HTML code 
	 * @return void
	 */
	ixmaps.setMapOverlayHTML = function(szHTML){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setMapOverlayHTML(szHTML);
		}
	};
    
    
	// ---------------------------------------------------
	//
	// functions to synchronize two or more embedded maps
	//
	// ---------------------------------------------------

	/** holds the name of the map which will have the role of master */
	ixmaps.szMaster = null;

	/**
	 * sync slave maps 
	 * (embedded maps that have been rigistered with a name) 
	 * @param {Object} masterApi the api of the map that gives the new envelope
	 * @param {Object} ptSW south west point of the new envelope
	 * @param {Object} ptNE north east point of the new envelope
	 * @param {Integer} nZoom html map zoom to set, overrides the zoom of the envelope, necessary because the html map can only have integer zoom levels 
	 * @return void
	 * @private
	 */
	ixmaps.syncEmbed = function(szMaster,ptSW,ptNE,nZoom){

		// avoid recursion  
		//
		if ( ixmaps.szMaster && (szMaster != ixmaps.szMaster) ){
			return;
		}
		// fix master map to avoid recursion (see above)
		ixmaps.szMaster = szMaster;

		// bubble up the sync request
		//
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) && ixmaps.parentApi.syncEmbed ){
			if (ixmaps.parentApi.syncEmbed){
				ixmaps.parentApi.syncEmbed(szMaster,ptSW,ptNE,nZoom);
			}
			return;
		}

		// loop over the registered maps and synch center and zoom  
		//
		for ( a in ixmaps.embeddedApiA ){
			
			if ( a != szMaster ){
				if ( ixmaps.embeddedApiA[a].syncMap ){
					ixmaps.embeddedApiA[a].syncMap(a,ptSW,ptNE,nZoom);
				}else{
					this.dispatchToEmbeddedApi(a,"syncEmbed",[ptSW,ptNE,nZoom]);
				}
			}else{
				//ixmaps.dispatchToParentApi("syncEmbed",[szMaster,ptSW,ptNE,nZoom]);
			}
		}
		// free master map fixing
		setTimeout("ixmaps.szMaster = null",1000);

	};

	// ---------------------------------------------------
	//
	// functions to synchronize two or more embedded maps
	//
	// ---------------------------------------------------


	/**
	 * synchronise all embedded maps to given center and zoom
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {Object} ptSW south west point of the new envelope
	 * @param {Object} ptNE north east point of the new envelope
	 * @param {Integer} nZoom html map zoom to set, overrides the zoom of the envelope, necessary because the html map can only have integer zoom levels 
	 * @return void
	 * @private
	 */
	ixmaps.syncMap = function(szMap,ptSW,ptNE,nZoom){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].syncMap(a,ptSW,ptNE,nZoom);
		}
	};

	/**
	 * make an embedded maps fullscreen
	 * @param szTemplateUrl URL to a fullscreen template 
	 * @return void
	 * @private
	 */
	ixmaps.fullScreenMap = function(szTemplateUrl){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].fullScreenMap(szTemplateUrl);
		}
	};

	/**
	 * set the synchronisation behavior of multiple embedded maps
	 * @param fFlag true or false (default:false)
	 * @return void
	 */
	ixmaps.setSyncMultiMaps = function(fFlag){
		for ( a in ixmaps.embeddedApiA ){
			this.dispatchToEmbeddedApi(a,"setSyncMultiMaps",[fFlag]);
		}
	};

	/**
	 * set the onClick behavior of the map(s); if true, clicking on map symbols changes to 'info' mode
	 * @param fFlag true or false (default:false)
	 * @return void
	 */
	ixmaps.setAutoSwitchInfo = function(fFlag){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setAutoSwitchInfo(fFlag);
		}
	};

	/**
	 * check if map has an initial bookmark string given (with the URL)
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @return void
	 */
	ixmaps.isBookmark = function(szMap){
		if (szMap){
			return ixmaps.embeddedApiA[szMap]?ixmaps.embeddedApiA[szMap].isBookmark():false;
		}else
		for ( a in ixmaps.embeddedApiA ){
			return ixmaps.embeddedApiA[a].isBookmark();
		}
	};

	/**
	 * helper function to set attribute "unselectable" = "on" 
	 * @param {String} szNodeId id of the HTML element to apply the "unselectable" attribute
	 * @void
	 */
	ixmaps.makeUnselectable = function(szNodeId) {
		var node = window.document.getElementById(szNodeId);
		if ( node ){
			if (node.nodeType == 1) {
				node.setAttribute("unselectable","on");
			}
			var child = node.firstChild;
			while (child) {
				this.makeUnselectable(child);
				child = child.nextSibling;
			}
		}
	};

	/**
	 * helper function to get any theme id selected by a legend
     * bubble up though ixmaps apis and check .activeThemeId value
	 * @string 
	 */
    ixmaps.getLegendThemeId = function() {
        var api = ixmaps;
        do {
            if ( api.activeThemeId ){
                return api.activeThemeId;
            }
        }
        while (api.parentApi && (api.parentApi != api) && (api = api.parentApi) );
        
        return null;
    };
                                    
	// ---------------------------------------------------
	//
	// bubble up map events
	//
	// ---------------------------------------------------

	ixmaps.htmlgui_onItemClick = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			return ixmaps.parentApi.htmlgui_onItemClick(szId);
		}
		return false;
	};

	ixmaps.htmlgui_onSelection = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			return ixmaps.parentApi.htmlgui_onSelection(szId);
		}
		return false;
	};

	ixmaps.htmlgui_onInfoDisplay = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			return ixmaps.parentApi.htmlgui_onInfoDisplay(szId);
		}
	};

	ixmaps.htmlgui_onNewTheme = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onNewTheme(szId);
		}
	};

	ixmaps.htmlgui_onDrawTheme = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onDrawTheme(szId);
		}
	};

	ixmaps.htmlgui_onRemoveTheme = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onRemoveTheme(szId);
		}
	};

	ixmaps.htmlgui_onErrorTheme = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onErrorTheme(szId);
		}
	};

	ixmaps.htmlgui_onZoomAndPan = function(nZoom){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onZoomAndPan(nZoom);
		}
	};
	
	ixmaps.htmlgui_setScaleSelect = function(szScale){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_setScaleSelect(szScale);
		}
	};

	ixmaps.htmlgui_initChart = function(SVGDoc,args){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_initChart(SVGDoc,args) : null;
	};

	ixmaps.htmlgui_drawChart = function(SVGDoc,args){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_drawChart(SVGDoc,args) : null;
	};

	ixmaps.htmlgui_drawChartAfter = function(SVGDoc,args){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_drawChartAfter(SVGDoc,args) : null;
	};

	ixmaps.htmlgui_onTooltipDisplay = function(szText){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_onTooltipDisplay(szText) : szText
	};

	ixmaps.htmlgui_onInfoTitle = function(szText,item){
		return (ixmaps.parentApi != ixmaps) ? ixmaps.parentApi.htmlgui_onInfoTitle(szText,item) : szText;
	};

	ixmaps.htmlgui_onInfoDisplayExtend = function(svgDoc,szId){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_onInfoDisplayExtend(svgDoc,szId) : null;
	};

	ixmaps.htmlgui_colorScheme = function(theme){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_colorScheme(theme);
		}
	};

	ixmaps.htmlgui_onStoryLoaded = function(szUrl,target){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_onStoryLoaded(szUrl,target);
		}
	};

	ixmaps.htmlgui_onProjectLoaded = function(obj){
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) ){
			ixmaps.parentApi.htmlgui_onProjectLoaded(obj);
		}
	};
	// function called on SVG map ready
	// must be dispatched
	// !! may be redefined by user
	//
	ixmaps.onMapReady = function(szMap){

		parent.postMessage("isMap:"+szMap,"*");

		try{
			// bubble up 
			if ( ixmaps.parentApi != ixmaps ){
				ixmaps.parentApi.onMapReady(szMap);
			}
		}
		catch (e){
		}
	};

	ixmaps.onMapZoom = function(obj){
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) ){
			ixmaps.parentApi.onMapZoom(obj);
		}
	};

	ixmaps.htmlgui_onWindowResize = function(){
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) ){
			ixmaps.parentApi.htmlgui_onWindowResize();
		}
	};

	ixmaps.htmlgui_setMapTypeBG = function(szId){
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) ){
			ixmaps.parentApi.htmlgui_setMapTypeBG(szId);
		}
	};

	// =====================================================
	// =====================================================
	//
	// function wrapper to create an easy to use interface
	// with selectors for map and theme  
	//
	// like: map().theme().changeStyle(...)
	//       map("mymap").theme().changeStyle(...)
	//       map("mymap").theme(themeId).changeStyle(...)
	//
	// =====================================================
	// =====================================================

	/**
	 * the ixmaps.themeApi class
	 * provides methods to manipulate realized map themes
	 * @class It realizes an object to hold a theme handle
	 * @constructor
	 * @param {String} [szMap] the name of the map, to define if more than one map present
	 * @param {String} [szTheme] the theme id, to define if more than one theme present
	 * @return A new ixmaps.themeApi object
	 */

	ixmaps.themeApi = function(szMap,szTheme){
		this.szMap = szMap||null;
		this.szTheme = szTheme||null;
	};
	ixmaps.themeApi.prototype = {

		/**
		 * change Style 
		 * @param {String} szStyle a style definition string (see <a href="http://public.ixmaps.com.s3-website-eu-west-1.amazonaws.com/docs/ixmaps-doc-themes-1.html" target="_blank">documentation</a>)
		 * @param {String} szFlag the style change method ('set' or 'factor' or 'remove' - see api doc)
		 * @example ixmaps.map().theme().changeStyle("opacity:0.5","factor");
		 * @example ixmaps.map("map1").theme().changeStyle("type:AGGREGATE","add");
		 * @return void
		 **/
		changeStyle: function(szStyle,szFlag){
			ixmaps.changeThemeStyle(this.szMap,this.szTheme,szStyle,szFlag);
		},
		/**
		 * mark/highlight theme class
		 * @param {Number} nClass the number of the class to mark/highlight
		 * @example ixmaps.map().theme().markClass(1);
		 * @return void
		 **/
		markClass: function(nClass){
			ixmaps.markThemeClass(this.szMap,this.szTheme,nClass);
		},
		/**
		 * unmark theme class
		 * @param {Number} nClass the number of the class to un mark
		 * @example ixmaps.map().theme().unmarkClass(1);
		 * @return void
		 **/
		unmarkClass: function(nClass){
			ixmaps.unmarkThemeClass(this.szMap,this.szTheme,nClass);
		},
		/**
		 * show theme
		 * @example ixmaps.map().theme().show();
		 * @return void
		 **/
		show: function(){
			ixmaps.showTheme(this.szMap,this.szTheme);
		},
		/**
		 * hide theme
		 * @example ixmaps.map().theme().show();
		 * @return void
		 **/
		hide: function(){
			ixmaps.hideTheme(this.szMap,this.szTheme);
		},
		/**
		 * remove theme
		 * @example ixmaps.map().theme().remove();
		 * @return void
		 **/
		remove: function(){
			ixmaps.removeTheme(this.szMap,this.szTheme);
		},
		/**
		 * replace theme
		 * @example ixmaps.map().theme().replace(newTheme);
		 * @return void
		 **/
		replace: function(theme,flag){
			ixmaps.removeTheme(this.szMap,this.szTheme);
			ixmaps.newTheme(this.szMap,"layer",theme,flag);
		}

	};

	/**
	 * the ixmaps.mapApi class.  
	 * provides methods to handle maps
	 * @class It realizes an object to hold a map handle
	 * @constructor
	 * @param {String} [szMap] the name of the map, to define if more than one map present
	 * @return A new ixmaps.themeApi object
	 */
	ixmaps.mapApi = function(szMap){
		this.szMap = szMap||null;
	};
	ixmaps.mapApi.prototype = {

		setMapTypeId: function(szMapTypeId){
			ixmaps.setMapTypeId(this.szMap,szMapTypeId);
			return this;
		},
		setMapType: function(szMapTypeId){
			ixmaps.setMapTypeId(this.szMap,szMapTypeId);
			return this;
		},
		mapType: function(szMapTypeId){
			ixmaps.setMapTypeId(this.szMap,szMapTypeId);
			return this;
		},
		
		loadMap: function(szUrl){
			ixmaps.loadMap(this.szMap,szUrl);
			return this;
		},

		setBounds: function(bounds){
			ixmaps.setBounds(this.szMap,bounds);
			return this;
		},

		setView: function(center,zoom){
			ixmaps.setView(this.szMap,center,zoom);
			return this;
		},
		view: function(center,zoom){
			ixmaps.setView(this.szMap,center,zoom);
			return this;
		},
		
		flyTo: function(center,zoom){
			ixmaps.flyTo(this.szMap,center,zoom);
			return this;
		},

		setScaleParam: function(szParam){
			ixmaps.setScaleParam(this.szMap,szParam);
			return this;
		},
			
		setMapFeatures: function(szFeatures){
			ixmaps.setMapFeatures(szFeatures);
			return this;
		},

		setOptions: function(options){
			ixmaps.setOptions(this.szMap,options);
			return this;
		},
		options: function(options){
			ixmaps.setOptions(this.szMap,options);
			return this;
		},
		
		attribution: function(attribution){
			ixmaps.setAttribution(this.szMap,attribution);
			return this;
		},
		
		legend: function(legend){
			ixmaps.setLegend(this.szMap,legend);
			return this;
		},


		setExternalData: function(data,options){
			ixmaps.setExternalData(this.szMap,data,options);
			return this;
		},
		setData: function(data,options){
			ixmaps.setExternalData(this.szMap,data,options);
			return this;
		},
		data: function(data,options){
			ixmaps.setExternalData(this.szMap,data,options);
			return this;
		},


		setLocalString: function(szGlobal,szLocal){
			ixmaps.setLocal(this.szMap,szGlobal,szLocal);
			return this;
		},
		setLocal: function(szGlobal,szLocal){
			ixmaps.setLocal(this.szMap,szGlobal,szLocal);
			return this;
		},
		localize: function(szGlobal,szLocal){
			ixmaps.setLocal(this.szMap,szGlobal,szLocal);
			return this;
		},


		newTheme: function(title,theme,flag){
			ixmaps.newTheme(this.szMap,title,theme,flag);
			return this;
		},
		addTheme: function(title,theme,flag){
			ixmaps.newTheme(this.szMap,title,theme,flag);
			return this;
		},
		layer: function(theme,flag){
			ixmaps.newTheme(this.szMap,"layer",theme,flag);
			return this;
		},

		
		changeThemeStyle: function(szTheme,style,flag){
			ixmaps.changeThemeStyle(this.szMap,szTheme,style,flag);
			return this;
		},

		removeTheme: function(szTheme){
			ixmaps.removeTheme(this.szMap,szTheme);
			return this;
		},

		getLayer: function(){
			return ixmaps.getLayer(this.szMap);
		},

		getLayerDependency: function(){
			return ixmaps.getLayerDependency(this.szMap);
		},

		getTileInfo: function(){
			return ixmaps.getTileInfo(this.szMap);
		},

		switchLayer: function(szLayerName,fState){
			ixmaps.switchLayer(this.szMap,szLayerName,fState);
			return this;
		},
		
		
		loadProject: function(szUrl,szFlag){
			ixmaps.loadProject(this.szMap,szUrl,szFlag);
			return this;
		},
		project: function(szUrl,szFlag){
			ixmaps.loadProject(this.szMap,szUrl,szFlag);
			return this;
		},

		setProject: function(szProject){
			ixmaps.setProject(this.szMap,szProject);
			return this;
		},


		loadSidebar: function(szUrl){
			ixmaps.loadSidebar(this.szMap,szUrl);
			return this;
		},
		
		getData: function(szItem){
			return ixmaps.getData(this.szMap,szItem);
		},
		
		require: function(szUrl){
			ixmaps.require(this.szMap,szUrl);
			return this;
		},
		
		
		theme: function(szTheme,flag){
			if ( typeof(szTheme) == "object" ){
				ixmaps.newTheme(this.szMap,"layer",szTheme,flag);
				return this;
			}else{
				console.log(new ixmaps.themeApi(this.szMap,szTheme));
				return new ixmaps.themeApi(this.szMap,szTheme);
			}
		}
	};

	/**
	 * ixmaps.themeConstruct  
	 * @class It realizes an object to create a theme JSON 
	 * @constructor
	 * @param {Object} [map] a map object to define the theme for
	 * @return A new ixmaps.themeConstruct object
	 */
	
	ixmaps.themeConstruct = function(szMap,szLayer){
		this.szMap = szMap;
		this.def = {};
		this.def.layer = szLayer || "generic";
		this.def.data = {};	
		this.def.style = {type:"CHART|DOT"};
		this.def.field = "$item$";
	};
	ixmaps.themeConstruct.prototype = {
		data: function(dataObj,szType,szName){
			var szName = szName || "DBTABLE"+Math.floor(Math.random()*100000000);
			this.def.data.name = szName;
			if (dataObj){
				if ( typeof(dataObj) == "string" ){
					if (szType == "ext" ){
						this.def.data.ext = dataObj;
						this.def.data.type = szType;
					}else{
						this.def.data.url = dataObj;
						this.def.data.type = szType;
					}
				}else{
					if ( szType ){
						this.def.data.obj = dataObj;
						this.def.data.szType = szType;
					}else{
						for (var i in dataObj){
							this.def.data[i] = dataObj[i];
						}
					}
					
					if (dataObj.name){
						this.def.data.name = dataObj.name;	
					}
					if (dataObj.url){
						this.def.data.type = szType || dataObj.type;
						if (this.def.data.type && (this.def.data.type == "ext") ){
							this.def.data.ext = dataObj.url;
						}else{
							this.def.data.url = dataObj.url;
						}
					}else
					if (dataObj.ext){
						this.def.data.ext = dataObj.ext;
						this.def.data.type = szType || dataObj.type || "ext";
					}else
					if (dataObj.query){
						this.def.data.query = dataObj.query;
						this.def.data.type = szType || dataObj.type || "ext";
					}else{
						this.def.data.type = szType;
						//ixmaps.setData(this.szMap,dataObj,{type:szType,name:szName});
					}
					
				}
			}else{
				this.def.data.type = szType || "ext";
			}
			if ( this.def.data.type && this.def.data.type.match(/geojson|topojson/i) ){
				this.def.style.lookupfield = "geometry";	
				this.def.style.type = "FEATURES|NOLEGEND";	
			}
			return this;
		},
		process: function(szProcess){
			this.def.data.process = szProcess;
			return this;
		},
		query: function(szQuery){
			this.def.data.query = szQuery;
			return this;
		},
		field: function(szName){
			this.def.field = szName;
			return this;
		},
		field100: function(szName){
			this.def.field100 = szName;
			return this;
		},
		lookup: function(szName){
			this.def.style.lookupfield = szName;
			return this;
		},
		geo: function(szName){
			this.def.style.lookupfield = szName;
			return this;
		},
		binding: function(bObj){
			this.def.binding = this.def.binding || {};
			for (var i in bObj){
				this.def.binding[i] = bObj[i];
			}
			return this;
		},
		filter: function(szFilter){
			this.def.style = this.def.style || {};
			this.def.style.filter = szFilter;
			return this;
		},
		type: function(szType){
			this.def.style.type = szType;
			return this;
		},
		style: function(styleObj){
			this.def.style = this.def.style || {};
			for (var i in styleObj){
				this.def.style[i] = styleObj[i];
			}
			return this;
		},
		meta: function(styleObj){
			this.def.meta = this.def.meta || {};
			for (var i in styleObj){
				this.def.meta[i] = styleObj[i];
			}
			return this;
		},
		title: function(szTitle){
			this.def.style.title = szTitle;
			return this;
		},
		
		// get the theme definition object (JSON)
		
		definition: function(){
			return this.def;
		},
		define: function(){
			return this.def;
		},
		json: function(){
			return this.def;
		}
		
	};
	
	/**
	 * ixmaps.map 
	 * get an ixmaps.mapApi instance
	 * @param {String} [szMap] a map name to get the handle from
	 * @return A new ixmaps.mapApi instance
	 */
	ixmaps.map = function(szMap){
		return new ixmaps.mapApi(szMap);
	};
	

	/**
	 * ixmaps.theme 
	 * get an ixmaps.themeConstructer instance
	 * @param {String} [szLayer] the name of a layer to define or to refer
	 * @return A new ixmaps.themeConstruct instance
	 */
	ixmaps.theme = function(szLayer){
		return new ixmaps.themeConstruct(this.szMap,szLayer);
	}
	
	/**
	 * ixmaps.layer 
	 * get an ixmaps.themeConstructer instance
	 * @param {String} [szLayer] the name of a layer to define or to refer
	 * @return A new ixmaps.themeConstruct instance
	 */
	ixmaps.layer = function(szLayer){
		return new ixmaps.themeConstruct(this.szMap,szLayer);
	}

	// generate iframe and embed a map
	// --------------------------------------
	/**
	 * embedMap
	 * @param {String} szTargetDiv the id of the <div> to host the map
	 * @param {Object} opt a JSON object that describes the map source  
	 * @param {Function} fCallBack the function to call, if the map is loaded
	 * @return void
	 * @example
	 *
	 * <!DOCTYPE html>
	 * <html>
	 *   <body>
	 *     <div id="map_div"></div>
	 *   </body>
	 * 
	 *     <script type="text/javascript" src = "../../ui/js/htmlgui_api.js" > </script>
	 *     <script type="text/javascript" charset="utf-8">
	 *
     *     ixmaps.embedMap("map_div",
	 *       { 
	 *          mapName:    "map", 
	 *          mapService: "leaflet",
	 *          mapType:    "OpenStreetMap - FR"
	 *       }
	 *     ); 
	 *     </script>
	 * </html>
	 */
	ixmaps.embedMap = function(szTargetDiv,opt,callback){
	
		//return new Promise(function(resolve, reject){

			var target = window.document.getElementById(szTargetDiv);
			if ( !target ){
				alert("embed map target-element '" + szTargetDiv + "' not found!");
				return;
			}
			var szName = opt.mapName || opt.name || szTargetDiv || "map" + String(Math.random()).split(".")[1];
			var szBasemap = opt.mapService || opt.basemap || "leaflet";
			var szMapType = opt.mapType || opt.maptype || "CartoDB - Positron";

			// make sure than a map name exists only once
			while ( ixmaps.embeddedApiA[szName] ){
				szName += "1";
			}
			// register map name
			ixmaps.embeddedApiA[szName] = {};
		
			var szUrl = "";
			if ( opt.story ) {
				szUrl = "/ui/dispatch.htm?ui=story&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName+"&story="+opt.story;
			}else if ( opt.mapStory ) {
				szUrl = "/ui/dispatch.htm?ui=story&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName+"&story="+opt.mapStory;
			}else{
				szUrl = "/ui/dispatch.htm?ui=embed&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName;
			}

			var scripts = window.document.scripts;
			for ( a in scripts ){
				if ( scripts[a].src && scripts[a].src.match(/htmlgui_api/)){
					opt.mapCdn = scripts[a].src.split("/ui")[0];
				}
			}
			if ( opt.mapCdn ){
				szUrl = opt.mapCdn+szUrl;
			}else{
				szUrl = "../.."+szUrl;
			}

			if ( opt.mapUrl ){
				szUrl += "&svggis="+opt.mapUrl;
			}
			if ( opt.search ){
				szUrl += "&search="+opt.search;
			}
			if ( opt.align ){
				szUrl += "&align="+opt.align;
			}
			if ( opt.legend ){
				szUrl += "&legend="+opt.legend;
			}
			if ( opt.themeLegend ){
				szUrl += "&themelegend="+opt.themeLegend;
			}
			if ( opt.mode ){
				szUrl += "&mode="+opt.mode;
			}
			if ( opt.scrollsafe ){
				szUrl += "&scrollsafe="+(opt.scrollsafe?"1":"0");
			}
			if ( opt.scrollsafesilent ){
				szUrl += "&scrollsafesilent="+(opt.scrollsafesilent?"1":"0");
			}
			if ( opt.tools ){
				szUrl += "&tools="+(opt.tools?"1":"0");
			}
			if ( opt.footer ){
				szUrl += "&footer="+(opt.footer?"1":"0");
			}
			if ( opt.silent ){
				szUrl += "&silent="+(opt.silent?"1":"0");
			}
			if ( opt.mapControl ){
				for ( o in opt.mapControl )	{
					szUrl += "&"+o+'='+opt.mapControl[o];
				}
			}
			if ( opt.mapOpt ){
				for ( o in opt.mapOpt )	{
					szUrl += "&"+o+'='+opt.mapOpt[o];
				}
			}
			if ( opt.project ){
				szUrl += "&project="+opt.project;
			}

			var szHeight = opt.height || "640px";
			var szWidth  = opt.width  || "100%";
		
			if ( target ){
				target.innerHTML = "<iframe id=\""+szName+"\" style=\"border:0;width:"+szWidth+";height:"+szHeight+"\" src=\""+szUrl+"\" ></iframe>";
                // GR 08.09.2019 adapt the created frame on window resize 
                window.onresize = function(event) {
                    var newWidth  = window.innerWidth;
                    var newHeight = window.innerHeight;
                    window.document.getElementById(szName).style.setProperty("width",String(newWidth)+"px");
                    window.document.getElementById(szName).style.setProperty("height",String(newHeight-5)+"px");
                };
			}
        
 			if ( callback )	{
				ixmaps.waitForMap(szName,callback);
			}else{
				ixmaps.waitForMap(szName,
					function(map) {
						if (map ){
							resolve(map);
						}else{
							reject("error");
						}
					}
				);
			}
		//});
	}
	ixmaps.embed = function(szTargetDiv,opt,callback){
	
		//return new Promise(function(resolve, reject){
		
			var iFrame = null;

			var target = window.document.getElementById(szTargetDiv);

			var szName = opt.mapName || opt.name || szTargetDiv || "map" + String(Math.random()).split(".")[1];
			var szBasemap = opt.mapService || opt.basemap || "leaflet";
			var szMapType = opt.mapType || opt.maptype || "CartoDB - Positron";

			// make sure than a map name exists only once
			while ( ixmaps.embeddedApiA[szName] ){
				szName += "1";
			}
			// register map name
			ixmaps.embeddedApiA[szName] = {};
		
			var szUrl = "";
			if ( opt.story ) {
				szUrl = "/ui/dispatch.htm?ui=story&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName+"&story="+opt.story;
			}else if ( opt.mapStory ) {
				szUrl = "/ui/dispatch.htm?ui=story&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName+"&story="+opt.mapStory;
			}else{
				szUrl = "/ui/dispatch.htm?ui=embed&basemap="+szBasemap+"&maptype="+szMapType+"&name="+szName;
			}

			var scripts = window.document.scripts;
			for ( a in scripts ){
				if ( scripts[a].src && scripts[a].src.match(/htmlgui_api/)){
					opt.mapCdn = scripts[a].src.split("/ui")[0];
				}
			}
			if ( opt.mapCdn ){
				szUrl = opt.mapCdn+szUrl;
			}else{
				szUrl = "../.."+szUrl;
			}

			if ( opt.map ){
				szUrl += "&svggis="+opt.map;
			}
			if ( opt.mapUrl ){
				szUrl += "&svggis="+opt.mapUrl;
			}
			if ( opt.mapSVG ){
				szUrl += "&svggis="+opt.mapSVG;
			}
			if ( opt.search ){
				szUrl += "&search="+opt.search;
			}
			if ( opt.align ){
				szUrl += "&align="+opt.align;
			}
			if ( opt.legend ){
				szUrl += "&legend="+opt.legend;
			}
			if ( opt.themeLegend ){
				szUrl += "&themelegend="+opt.themeLegend;
			}
			if ( opt.item ){
				szUrl += "&item="+opt.item;
			}
			if ( opt.mode ){
				szUrl += "&mode="+opt.mode;
			}
			if ( opt.scrollsafe ){
				szUrl += "&scrollsafe="+(opt.scrollsafe?"1":"0");
			}
			if ( opt.scrollsafesilent ){
				szUrl += "&scrollsafesilent="+(opt.scrollsafesilent?"1":"0");
			}
			if ( opt.tools ){
				szUrl += "&tools="+(opt.tools?"1":"0");
			}
			if ( opt.footer ){
				szUrl += "&footer="+(opt.footer?"1":"0");
			}
			if ( opt.silent ){
				szUrl += "&silent="+(opt.silent?"1":"0");
			}
			if ( opt.mapControl ){
				for ( o in opt.mapControl )	{
					szUrl += "&"+o+'='+opt.mapControl[o];
				}
			}
			if ( opt.mapOpt ){
				for ( o in opt.mapOpt )	{
					szUrl += "&"+o+'='+opt.mapOpt[o];
				}
			}
			if ( opt.project ){
				szUrl += "&project="+opt.project;
			}

			var szHeight = opt.height || "640px";
			var szWidth  = opt.width  || "100%";
		
			if ( callback )	{
				ixmaps.waitForMap(szName,callback);
			}else{
				ixmaps.waitForMap(szName,
					function(map) {
						if (map ){
							resolve(map);
						}else{
							reject("error");
						}
					}
				);
			}

			if ( target ){
				target.innerHTML = "<iframe id=\""+szName+"\" style=\"border:0;width:"+szWidth+";height:"+szHeight+"\" src=\""+szUrl+"\" ></iframe>";
				target.setAttributeNS(null,"id",szName+"_target");
                // GR 08.09.2019 adapt the created frame on window resize 
			}else{
				iFrame = document.createElement('iframe');
				iFrame.id = szName;
				iFrame.style = "border:0;width:"+szWidth+";height:"+szHeight+";";
				iFrame.src = szUrl; 
			}

		return iFrame;
		//});
	}

	ixmaps.getGeoFields = function(data){
		
		var fields = data.columnNames();
		var lat = null;
		var lon = null;
		
		for (var i in fields) {
			if (fields[i].match(/latitud/i) || (fields[i] == "lat") || (fields[i] == "LAT") || (fields[i] == "Y") || (fields[i] == "y")) {
				lat = fields[i];
			}
			if (fields[i].match(/longitud/i) || (fields[i] == "lon") || (fields[i] == "long") || (fields[i] == "lng") || (fields[i] == "LON") || (fields[i] == "LNG") || (fields[i] == "X")|| (fields[i] == "x")) {
				lon = fields[i];
			}
		}
		if ( lat && lon ){
			return lat + "|" + lon;
		}
		
		return null;
	};
	

}( window.ixmaps = window.ixmaps || {} ));

// .............................................................................
// EOF
// .............................................................................


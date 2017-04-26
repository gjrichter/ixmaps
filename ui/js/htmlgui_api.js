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
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

(function( ixmaps, $, undefined ) {

	ixmaps.api = true;

	// ------------------------------------------------
	// workaround for cross domain restrictions
	// send bookmark string to framed map content
	// ------------------------------------------------

	// listen to messages and execute coded functions
	// ----------------------------------------------

	window.addEventListener("message", receiveMessage, false);  
	function receiveMessage(e)  {
		//console.log("receiveMessage: "+e.data);
		if ( e.data.match(/executeThis/) ){
			eval(e.data.substr(12,e.data.length-12));
		}else
		if ( e.data.match(/resetMap/) ){
			var szMap = e.data.split(':')[1] || "map"; 
			ixmaps.resetEmbeddedMap(szMap);
		}else
		if ( e.data.match(/waitForMap/) ){
			var szMap = e.data.split(':')[1] || "map"; 
			ixmaps.waitForEmbeddedMap(szMap, function(szMap){
				parent.postMessage("isMap:"+szMap,"*");
			});
		}else
		if ( e.data.match(/isMap/) ){
			var szMap = e.data.split(':')[1] || "map";
			// try to execute the callbacks
			// remove callback on success to avoid double call

			// 1. map specific callback
			try{ixmaps.waitCallbackA[szMap](ixmaps);
				ixmaps.waitCallbackA[szMap]=null;
//				ixmaps.waitCallback=null;
				}catch(e){

//				// 2. generic callback
//				try{ixmaps.waitCallback(ixmaps);
//					ixmaps.waitCallback=null;
//					}catch(e){}
			}
		}
	} 
	
	// send bookmark messages to execute functions in (cross domain) iframes
	// ---------------------------------------------------------------------

	ixmaps.iframe = ixmaps.iframe || {};

	ixmaps.iframe.exec = function(szFrame,szFunction){

		//console.log("ixmaps.iframe.exec -------------- "+szFrame);

		var frame = window.document.getElementById(szFrame);
		if ( frame ){
			//console.log("postMessage -------------- "+szFrame);
			//console.log("executeThis:"+szFunction);
			frame.contentWindow.postMessage("executeThis:"+szFunction,"*");
		}else{
			for ( i in ixmaps.embeddedApiA ){
				frame = window.document.getElementById(i);
				if ( frame ){
					//console.log("postMessage -------------- "+i);
					//console.log("executeThis:"+szFunction);
					if ( frame.contentWindow ){
						frame.contentWindow.postMessage("executeThis:"+szFunction,"*");
					}
				}else{
					//console.log("no frame at all");
				}
			}
		}
	};

	// special function to get a callback if map loaded
	//
	ixmaps.iframe.waitForMap = function(szFrame,callback){
		if ( callback ){
			if ( !ixmaps.waitCallbackA ){
				ixmaps.waitCallbackA = [];
			}
			ixmaps.waitCallbackA[szFrame] = callback;
//			ixmaps.waitCallback = callback;
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

	// special function to reset map in cross domain iframes
	//
	ixmaps.iframe.resetMap = function(szFrame){
		var frame = window.document.getElementById(szFrame);
		if ( frame ){
			frame.contentWindow.postMessage("resetMap:"+szFrame,"*");
		}
	};

	// --------------------------------------
	// a) embedded apis will register here
	// --------------------------------------

	/** array to store the api objects of embedded ixmaps windows which have registered to this (HTML) parent */
	ixmaps.embeddedApi = null; 
	ixmaps.embeddedApiA = new Object(); 

	/**
	 * register the given api (from an embedded map) with the given name
	 * this makes the api accessable from the parent HTML page
	 * @param api the API object
	 * @param szName the name of the map registering the api (must be given as query parameter '&name=' with the maps URL)
	 * @return void
	 */
	ixmaps.registerApi = function(api,szName,window){

		//console.log("registerApi: "+szName);

		if ( api == this ){
			return;
		}
		this.embeddedApi = api;
		this.embeddedApi.window = window;
		this.embeddedApiA[szName] = api;

	};

	// -----------------------------------------
	// b) register this api to the parent window
	// -----------------------------------------

	ixmaps.registerMe = function(){
	
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
		if (!ixmaps.szName){
			ixmaps.szName = "map";
		}
		if ( ixmaps.parentApi ){
			try{
				ixmaps.parentApi.registerApi(ixmaps,ixmaps.szName,window );
			}catch (e){}
		}
	};

	ixmaps.registerMe();

	// generate iframe
	// --------------------------------------
	ixmaps.embedViewer = function(szTargetDiv,szUrl,ixmaps){
		var target = window.document.getElementById(szTargetDiv);
		if ( target ){
			target.innerHTML = "<iframe id=\"myframe\" style=\"border:0;width:100%;height:100%\" src=\""+szUrl+"\" ></iframe>";
		}
	};

	// bubble up embeddedSVG
	// --------------------------------------
	ixmaps.setEmbeddedSVG = function(embeddedSVG){
		if ( !this.embeddedSVG ){
			this.embeddedSVG = embeddedSVG;
		}
		if (this.parentApi && (this.parentApi != this) && this.parentApi.setEmbeddedSVG ){
			this.parentApi.setEmbeddedSVG(this.embeddedSVG);
		}
	};

	// gives the parent a function to wait for the embedded map
	// a map can have a specific name or the generic name 'map'
	// ---------------------------------------
	ixmaps.waitForEmbeddedMap = function(szName,fCallBack){

		//console.log("waitForEmbeddedMap: "+szName);

		if ( ( ixmaps.embeddedApiA[szName] && ixmaps.embeddedApiA[szName].embeddedSVG ) ||
			 ( ixmaps.embeddedApiA["map"]  && ixmaps.embeddedApiA["map"].embeddedSVG  ) ) {
			if ( typeof(ixmaps.embeddedApiA[szName||"map"]) != "undefined" ){
				fCallBack(ixmaps.embeddedApiA[szName||"map"]);
			}else{
				fCallBack(szName||"map");
			}
		}else{
			setTimeout("ixmaps.waitForEmbeddedMap('"+szName+"',"+fCallBack+")",1000);
		}
	};
	// gives the parent a function to reset the embedded map
	// a map can have a specific name or the generic name 'map'
	// ---------------------------------------
	ixmaps.resetEmbeddedMap = function(szName){
		try{ixmaps.embeddedApiA[szName].embeddedSVG = null}catch(e){};
		try{ixmaps.embeddedApiA["map"].embeddedSVG = null}catch(e){};
	};

	// -----------------------------------------
	// functions to control the mebedded map
	// -----------------------------------------

	/**
	 * dispatch a function call to 
	 * a) an embedded ixmaps api, if registered 
	 * b) a cross domain iframe  
	 * @param szMap the name of the embedded map
	 * @param szFunc the function to dispatch
	 * @return void
	 */
	ixmaps.dispatchToembeddedApi = function(szMap,szFunc,argA){

		szMap = szMap || "map";

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
		if ( ixmaps.embeddedApiA && Object.getOwnPropertyNames(ixmaps.embeddedApiA).length && ixmaps.embeddedApiA[szMap] ){

			eval("ixmaps.embeddedApiA['"+(szMap||'map')+"']."+szCall);
			//console.log("ixmaps.embeddedApiA['"+(szMap||'map')+"']."+szCall);

		//	2. cross domain iframe
		}else{

			var szCall = szFunc +'(';
			szCall += "'" + szMap + "',";
			szCall += szArgs;
			szCall += ')';
			ixmaps.iframe.exec(szMap||"embed-cross","ixmaps."+szCall);
			//console.log(szMap||"embed-cross"+','+"ixmaps."+szCall);
		}
	};

	/**
	 * gives the parent a function to wait for the embedded map
	 * a map can have a specific name or the generic name 'map'
	 * @param szName the name of the embedded map
	 * @param fCallBack the function to call, if the map is loaded
	 * @return void
	 */
	ixmaps.waitForMap = function(szName,fCallBack){
		if ( 0 && ixmaps.embeddedApi ){
			// if we have a registered API,
			// the map is not cross domain embedded
			ixmaps.waitForEmbeddedMap(szName,fCallBack);
		}else{
			// if not, call cross domain (iframe) procedure
			//console.log("waitForMap:"+szName);
			ixmaps.iframe.waitForMap(szName,fCallBack);
		}
	};

	/**
	 * selects a theme from the maps legend to be shown(switchd on)
	 * (theme must be present in the generated maps legend) 
	 * @param szName the name of the embedded map
	 * @param szTheme the name of the theme as shown in the map legend (when in full mode)
	 * @return void
	 */
	ixmaps.checkTheme = function(szName,szTheme){
		try	{
			ixmaps.embeddedApiA[szName].embeddedSVG.window.map.Api.minimizeThemeLegends();
			ixmaps.embeddedApiA[szName].embeddedSVG.window.map.Api.switchMapTheme(szTheme,'on');
		}catch (e){	}
	};

	/**
	 * change the style of one theme, 
	 * if the theme (szTheme) is not defined, the top most theme is changed
	 * @param szName the name of the embedded map
	 * @param szTheme the name of the theme as shown in the map legend (when in full mode)
	 * @param szStyle a style definition string (see api doc)
	 * @return void
	 */
	ixmaps.changeThemeStyle = function(szMap,szTheme,szStyle,szFlag){
		this.dispatchToembeddedApi(szMap,"changeThemeStyle",[szTheme,szStyle,szFlag]);
	};

	/**
	 * load a new map (svg/svgz) into an embed context defined by a registered map name
	 * @param szMap the name of the embedded map
	 * @param szUrlMap the url of the SVG map to be loaded
	 * @param szUrlStory [optional] parameter to load and activate a story
	 * @return void
	 */
	ixmaps.loadMap = function(szMap,szUrlMap,szUrlStory){
		if ( ixmaps.embeddedApiA[szMap].HTML_setSVGMap ){
			ixmaps.embeddedApiA[szMap].HTML_setSVGMap(szUrlMap);
			if ( szUrlStory ){
				ixmaps.embeddedApiA[szMap].resetStory();
				ixmaps.embeddedApiA[szMap].loadStory(szUrlStory);
			}
		}else{
			this.dispatchToembeddedApi(szMap,"loadMap",[szUrlMap,szUrlStory]);
		}
	};
	/**
	 * load a new story
	 * @param szMap the name of the embedded map
	 * @param szUrlStory parameter to load and activate a story
	 * @return void
	 */
	ixmaps.loadStory = function(szMap,szUrlStory,nWidth){
		if ( ixmaps.embeddedApiA[szMap] && ixmaps.embeddedApiA[szMap].HTML_setSVGMap ){
			ixmaps.embeddedApiA[szMap].loadStory(szUrlStory,nWidth);
		}else{
			this.dispatchToembeddedApi(szMap,"loadStory",[szUrlStory,nWidth]);
		}
	};
	/**
	 * load a new sidebar content
	 * @param szMap the name of the embedded map
	 * @param szUrlStory parameter to load and activate a story
	 * @return void
	 */
	ixmaps.loadSidebar = function(szMap,szUrlStory,nWidth){
		if ( ixmaps.embeddedApiA[szMap] && ixmaps.embeddedApiA[szMap].HTML_setSVGMap ){
			ixmaps.embeddedApiA[szMap].loadSidebar(szUrlStory,nWidth);
		}else{
			this.dispatchToembeddedApi(szMap,"loadSidebar",[szUrlStory,nWidth]);
		}
	};
	/**
	 * setBounds
	 * @param szMap the name of the embedded map
	 * @param bounds the new geo bounds with; array of 4 coordinates
	 * @return void
	 */
	ixmaps.setBounds = function(szMap,bounds){
		this.dispatchToembeddedApi(szMap,"setBounds",[bounds]);
	};
	/**
	 * setView
	 * @param szMap the name of the embedded map
	 * @param center the new center of the map
	 * @param nZoom the new zoomfactor of the map
	 * @return void
	 */
	ixmaps.setView = function(szMap,center,nZoom){
		this.dispatchToembeddedApi(szMap,"setView",[center,nZoom]);
	};
	/**
	 * setCenter
	 * @param szMap the name of the embedded map
	 * @param center the new center of the map
	 * @return void
	 */
	ixmaps.setCenter = function(szMap,center){
		this.dispatchToembeddedApi(szMap,"setCenter",[center]);
	};
	/**
	 * setZoom
	 * @param szMap the name of the embedded map
	 * @param nZoom the new zoomfactor of the view
	 * @return void
	 */
	ixmaps.setZoom = function(szMap,nZoom){
		this.dispatchToembeddedApi(szMap,"setZoom",[nZoom]);
	};
	/**
	 * minZoom
	 * @param szMap the name of the embedded map
	 * @param nZoom the new minimal zoomfactor of the view
	 * @return void
	 */
	ixmaps.minZoom = function(szMap,nZoom){
		this.dispatchToembeddedApi(szMap,"minZoom",[nZoom]);
	};
	/**
	 * get the actual center of the map view
	 * @param szMap the map name [optional]
	 * @type object 
	 * @return center
	 */
	ixmaps.getCenter = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getCenter();
	};
	/**
	 * get the actual zoomfactor of the map view
	 * @param szMap the map name [optional]
	 * @return zoomfactor
	 */
	ixmaps.getZoom = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getZoom();
	};
	/**
	 * get the actual center of the map view
	 * @param szMap the map name [optional]
	 * @type object 
	 * @return center
	 */
	ixmaps.getBoundingBox = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getBoundingBox();
	};
	/**
	 * execBookmark
	 * @param szMap the name of the embedded map
	 * @param szBookmark the bookmark string
	 * @param fClear if true, clears all previout themes
	 * @return void
	 */
	ixmaps.execBookmark = function(szMap,szBookmark,fClear){
		this.dispatchToembeddedApi(szMap,"execBookmark",[szBookmark,fClear]);
	};

	/**
	 * execBookmark
	 * @param szMap the name of the embedded map
	 * @param szBookmark the bookmark string
	 * @param fClear if true, clears all previout themes
	 * @return void
	 */
	ixmaps.execScript = function(szMap,szScript,fClear){
		this.dispatchToembeddedApi(szMap,"execScript",[szScript,fClear]);
	};

	/**
	 * toggleTheme
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
	 */
	ixmaps.toggleTheme = function(szMap,szThemeName,szSourceName){
		this.dispatchToembeddedApi(szMap,"toggleTheme",[szThemeName,szSourceName]);
	};
	/**
	 * toggleTheme
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
	 */
	ixmaps.setTheme = function(szMap,szThemeName,szSourceName){
		this.dispatchToembeddedApi(szMap,"setTheme",[szThemeName,szSourceName]);
	};
	/**
	 * toggleTheme
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
	 */
	ixmaps.newTheme = function(szMap,szThemeName,opt,fClear){ 

		ixmaps.message("... creating theme ...");

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
				this.clearAllCharts();
			}else{
				this.clearAll();
			}
		}
		
		var szScript = "map.Api.newMapTheme('"+(opt.layer||"")+"','"+(opt.field||"")+"','"+(opt.field100||"")+"','"+opt.style+"','"+szThemeName+"','"+opt.axis+"')";
		this.dispatchToembeddedApi(szMap,"execScript",[szScript,fClear]);
	};

	/**
	 * clearThemes
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
	 */
	ixmaps.clearAll = function(szMap){
		var szScript = "map.Api.clearAll()";
		this.dispatchToembeddedApi(szMap,"execScript",[szScript]);
	}
	
	/**
	 * loadExternalData
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
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
	 * show data table
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
	 * show Bookmarks
	 */
	ixmaps.popupBookmarks = function(szMap,position){
		this.dispatchToembeddedApi(szMap,"popupBookmarks",[position]);
	};
	/**
	 * show Theme Code Editor
	 */
	ixmaps.popupThemeEditor = function(szMap,position){
		this.dispatchToembeddedApi(szMap,"popupThemeEditor",[position]);
	};

	/**
	 * get the style of a theme
	 */
	ixmaps.getThemeStyleString = function(szMap,szThemeName){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeStyleString(szThemeName);
	};
	/**
	 * get the definition string of a theme
	 */
	ixmaps.getThemeDefinitionString = function(szMap,szThemeName){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeDefinitionString(szThemeName);
	};
	/**
	 * get the definition string of a theme
	 */
	ixmaps.getThemeDefinitionObj = function(szMap,szThemeName){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeDefinitionObj(szThemeName);
	};
	/**
	 * get the definition string of a theme
	 */
	ixmaps.getThemeObj = function(szMap,szThemeName){
		return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).getThemeObj(szThemeName);
	};

	/**
	 * change the object (charts) scaling of the map 
	 * @param szMap the name of the embedded map
	 * @param szStyle a style definition string (see api doc)
	 * @return void
	 */
	ixmaps.changeObjectScaling = function(szMap,nDelta){
		this.dispatchToembeddedApi(szMap,"changeObjectScaling",[nDelta]);
	};

	/**
	 * bookmark current map+theme and set URL in browser
	 * @param szMap the name of the embedded map
	 * @param nZoom a possible additive zoom for bookmark
	 * @param fFlag true or false
	 * @return void
	 */
	ixmaps.updatePageHistory = function(szMap,nZoom,fFlag){
		this.dispatchToembeddedApi(szMap,"updatePageHistory",[nZoom||1,fFlag||true]);
	};

	/**
	 * htmlgui_getEnvelopeString
	 * @param szMap the name of the embedded map
	 * @param nZoom optional parameter (2,3,4,...) to get a zoomed envelope
	 * @return void
	 */
	ixmaps.htmlgui_getEnvelopeString = function(szMap,nZoom){
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).htmlgui_getEnvelopeString(nZoom);
	};

	/**
	 * htmlgui_getThemesString
	 * @param szMap the name of the embedded map
	 * @return void
	 */
	ixmaps.htmlgui_getThemesString = function(szMap){
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).htmlgui_getThemesString();
	};

	/**
	 * htmlgui_getBookmarkString
	 * @param szMap the name of the embedded map
	 * @return void
	 */
	ixmaps.htmlgui_getBookmarkString = function(szMap){
			return (ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).htmlgui_getBookmarkString();
	};

	/**
	 * on resize
	 * @param szMap the name of the embedded map
	 * @return void
	 */
	ixmaps.onWindowResize = function(szMap,box,zoomto){
		(ixmaps.embeddedApiA[szMap]||ixmaps.embeddedApi).onWindowResize(box,zoomto);
	};

	/**
	 * reset
	 * @param szMap the name of the embedded map
	 * @return void
	 */
	ixmaps.reset = function(){
		ixmaps.embeddedApi.embeddedSVG.map.Api.clearAll();
		ixmaps.embeddedApi.embeddedSVG.map.Api.doZoomMapToFullExtend();
	};

	/**
	 * set map tool by name in embedded maps 
	 * @param szId the map tool to be set (e.g. 'info');
	 * @return void
	 */
	ixmaps.setMapTool = function(szId){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setMapTool(szId);
		}
	};

	/**
	 * set map type by id in embedded maps 
	 * @param szId the map type id to be set (e.g. 'satellite');
	 * @return void
	 */
	ixmaps.htmlgui_setMapTypeId = function(szId){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].htmlgui_setMapTypeId(szId);
		}
	};

	/**
	 * get map type by id in embedded maps 
	 * @param szMap the map name [optional]
	 * @return void
	 */
	ixmaps.htmlgui_getMapTypeId = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).htmlgui_getMapTypeId();
	};

	/**
	 * get the url of the actual loaded story 
	 * @param szMap the map name [optional]
	 * @return void
	 */
	ixmaps.htmlgui_getStoryUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).htmlgui_getStoryUrl();
	};

	/**
	 * get the url of the actual loaded SVG map 
	 * @param szMap the map name [optional]
	 * @return void
	 */
	ixmaps.htmlgui_getMapUrl = function(szMap){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).htmlgui_getMapUrl();
	};

	/**
	 * get the url of the actual loaded SVG map 
	 * @param szMap the map name [optional]
	 * @param szId the map type id to be set (e.g. 'satellite');
	 * @return void
	 */
	ixmaps.getBaseMapParameter = function(szMap,szService){
		return (ixmaps.embeddedApiA[szMap||'map']||ixmaps.embeddedApi).getBaseMapParameter(szService);
	};
	/**
	 * get host prefix 
	 * @param szUrl a relative Url
	 * @return the dispatched url
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
	 * set tool offset top 
	 * @param nTop the offset in pixel of the map tools/widgets
	 * @return void
	 */
	ixmaps.setMapWidgetMarginTop = function(nMarginTop){
		try {
			if ( ixmaps.embeddedApi && ixmaps.embeddedApi.embeddedSVG ){
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.setMapFeatures("toolmargintop:40");
				ixmaps.embeddedApi.embeddedSVG.window.map.Viewport.reformat();
			}
			for ( a in ixmaps.embeddedApiA ){
				if ( ixmaps.embeddedApiA[a] && ixmaps.embeddedApiA[a].embeddedSVG ){
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Api.setMapFeatures("toolmargintop:40");
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Viewport.reformat();
				}
			}
		}
		catch (e){}
	};

	/**
	 * set map feature
	 * @param szFeature a style string like "item1:value1;item2:value2;" 
	 * @return void
	 */
	ixmaps.setMapFeatures = function(szFeatures){
		try {
			if ( ixmaps.embeddedApi && ixmaps.embeddedApi.embeddedSVG ){
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
				ixmaps.embeddedApi.embeddedSVG.window.map.Viewport.reformat();
			}
			for ( a in ixmaps.embeddedApiA ){
				if ( ixmaps.embeddedApiA[a] && ixmaps.embeddedApiA[a].embeddedSVG ){
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Viewport.reformat();
				}
			}
		}
		catch (e){}
	};

	/**
	 * set map scale parameter
	 * @param szParam a style string like "item1:value1;item2:value2;" 
	 * @return void
	 */
	ixmaps.setScaleParam = function(szParam){

		try {
			// we must make a json object from the parameter string
			// map.Api.setScaleParam needs it 
			if ( typeof(szParam) == 'string' ){
				eval('szParam = {'+szParam.replace(';',',')+'}');
			}
			if ( ixmaps.embeddedApi && ixmaps.embeddedApi.embeddedSVG ){
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.setScaleParam(szParam);
			}
			for ( a in ixmaps.embeddedApiA ){
				if ( ixmaps.embeddedApiA[a] && ixmaps.embeddedApiA[a].embeddedSVG ){
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Api.setScaleParam(szParam);
				}
			}
		}
		catch (e){}
	};

	/**
	 * set map options
	 * @param opt option object  like {item1:value1,item2:value2} 
	 * @return void
	 */
	ixmaps.setOptions = function(szMap,opt){
		var szFeatures = "";
		for ( i in opt ){
			szFeatures += String(i+":"+opt[i]+";");
		}
		var szScript = "map.Api.setMapFeatures(\""+szFeatures+"\")";
		this.dispatchToembeddedApi(szMap,"execScript",[szScript]);
	};

	/**
	 * set local text
	 * @param szOrig the string to replace
	 * @param szLocal the localized string
	 * @return void
	 */
	ixmaps.setLocalString = function(szOrig,szLocal){
		try {
			if ( ixmaps.embeddedApi && ixmaps.embeddedApi.embeddedSVG ){
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.setLocalString(szOrig,szLocal);
			}
			for ( a in ixmaps.embeddedApiA ){
				if ( ixmaps.embeddedApiA[a] && ixmaps.embeddedApiA[a].embeddedSVG ){
					ixmaps.embeddedApiA[a].embeddedSVG.window.map.Api.setLocalString(szOrig,szLocal)
				}
			}
		}
		catch (e){}
	};




	// -----------------------------------------
	// functions to synchronize the embedded maps
	// -----------------------------------------

	ixmaps.syncSVGMap = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].syncSVGMap();
		}
	};

	ixmaps.message = function(szMessage){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].message(szMessage);
		}
	};

	ixmaps.showLoading = function(szMessage,flag){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].HTML_showLoading(szMessage,flag);
		}
	};

	ixmaps.hideLoading = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].HTML_hideLoading();
		}
	};

	ixmaps.hideUi = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].HTML_hideUi();
		}
	};

	ixmaps.showUi = function(){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].HTML_showUi();
		}
	};

	// -----------------------------------------
	// functions to synchronize two embedded maps
	// -----------------------------------------

	/**
	 * sync slave maps 
	 * (embedded maps that have been rigistered with a name) 
	 * @param masterApi the api of the map that gives the new envelope
	 * @param ptSW south west point of the new envelope
	 * @param ptSW north east point of the new envelope
	 * @param nZoom html map zoom to set, overrides the zoom of the envelope, necessary because the html map can only have integer zoom levels 
	 * @return void
	 */
	ixmaps.masterApi = null;
	ixmaps.syncEmbed = function(masterApi,ptSW,ptNE,nZoom){
		if ( (ixmaps.masterApi != null) && (ixmaps.masterApi != masterApi) ){
			return;
		}
		if ( ixmaps.parentApi && (ixmaps.parentApi != ixmaps) && ixmaps.parentApi.syncEmbed ){
			ixmaps.parentApi.syncEmbed(ixmaps,ptSW,ptNE,nZoom);
			return;
		}
		ixmaps.masterApi = masterApi;
		for ( a in ixmaps.embeddedApiA ){
			if ( (ixmaps.embeddedApiA[a] != masterApi) && ixmaps.embeddedApiA[a].syncEmbedMap ){
				ixmaps.embeddedApiA[a].syncEmbedMap(ptSW,ptNE,nZoom);
			}
		}
		setTimeout("ixmaps.masterApi = null",1000);
	};

	ixmaps.syncEmbedMap = function(ptSW,ptNE,nZoom){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].syncEmbedMap(ptSW,ptNE,nZoom);
		}
	};

	ixmaps.fullScreenMap = function(szTemplateUrl){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].fullScreenMap(szTemplateUrl);
		}
	};

	ixmaps.setSyncMultiMaps = function(fFlag){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setSyncMultiMaps(fFlag);
		}
	};
	ixmaps.setAutoSwitchInfo = function(fFlag){
		for ( a in ixmaps.embeddedApiA ){
			ixmaps.embeddedApiA[a].setAutoSwitchInfo(fFlag);
		}
	};
	ixmaps.isBookmark = function(map){
		if (map){
			return ixmaps.embeddedApiA[map].isBookmark();
		}else
		for ( a in ixmaps.embeddedApiA ){
			return ixmaps.embeddedApiA[a].isBookmark();
		}
	};


	/**
	 * helper function to set attribute "unselectable" = "on"  
	 * @return true or false
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

	ixmaps.htmlgui_onItemClick = function(szId){
		return ixmaps.parentApi.htmlgui_onItemClick(szId);
	};

	ixmaps.htmlgui_onInfoDisplay = function(szId){
		return ixmaps.parentApi.htmlgui_onInfoDisplay(szId);
	};

	ixmaps.htmlgui_onInfoDisplayExtend = function(svgDoc,szId){
		return ixmaps.parentApi.htmlgui_onInfoDisplayExtend(svgDoc,szId);
	};

	ixmaps.htmlgui_onNewTheme = function(szId){
		return ixmaps.parentApi.htmlgui_onNewTheme(szId);
	};

	ixmaps.htmlgui_onDrawTheme = function(szId){
		return ixmaps.parentApi.htmlgui_onDrawTheme(szId);
	};

	ixmaps.htmlgui_onRemoveTheme = function(szId){
		return ixmaps.parentApi.htmlgui_onRemoveTheme(szId);
	};

	ixmaps.htmlgui_onErrorTheme = function(szId){
		return ixmaps.parentApi.htmlgui_onErrorTheme(szId);
	};

	ixmaps.htmlgui_onZoomAndPan = function(nZoom){
		return ixmaps.parentApi.htmlgui_onZoomAndPan(nZoom);
	};
	
	ixmaps.htmlgui_setScaleSelect = function(szScale){
		return ixmaps.parentApi.htmlgui_setScaleSelect(szScale);
	};

	ixmaps.htmlgui_drawChart = function(SVGDoc,args){
		return ixmaps.parentApi.htmlgui_drawChart(SVGDoc,args);
	};

	ixmaps.htmlgui_drawChartAfter = function(SVGDoc,args){
		return ixmaps.parentApi.htmlgui_drawChartAfter(SVGDoc,args);
	};

	ixmaps.htmlgui_onTooltipDisplay = function(szText){
		return ixmaps.parentApi.htmlgui_onTooltipDisplay(szText);
	};

	ixmaps.htmlgui_onInfoTitle = function(szText,item){
		return ixmaps.parentApi.htmlgui_onInfoTitle(szText,item);
	};

	ixmaps.htmlgui_colorScheme = function(theme){
		return ixmaps.parentApi.htmlgui_colorScheme(theme);
	};

	ixmaps.htmlgui_onStoryLoaded = function(szUrl,target){
		return ixmaps.parentApi.htmlgui_onStoryLoaded(szUrl,target);
	};
	// function called on SVG map ready
	// must be dispatched
	// !! may be redefined by user
	//
	ixmaps.onMapReady = function(szMap){

		//console.log("api_onMapReady: " + szMap);
		//console.log("api_onMapReady -> frame up: "+ szMap);
		parent.postMessage("isMap:"+szMap,"*");

		try{
			// bubble up 
			if ( ixmaps.parentApi != ixmaps ){
				//console.log("api_onMapReady -> parentApi up:" + szMap);
				ixmaps.parentApi.onMapReady(szMap);
            // or pass to frame parent
			//}else{
				//console.log("api_onMapReady -> frame up: "+ szMap);
				parent.postMessage("isMap:"+szMap,"*");
			}
		}
		catch (e){
		}
	};
	ixmaps.onMapZoom = function(obj){
		return ixmaps.parentApi.onMapZoom(obj);
	};
	ixmaps.htmlgui_onWindowResize = function(){
		return ixmaps.parentApi.htmlgui_onWindowResize();
	};
	ixmaps.htmlgui_setMapTypeBG = function(szId){
		ixmaps.parentApi.htmlgui_setMapTypeBG(szId);
	}


}( window.ixmaps = window.ixmaps || {} ));

// .............................................................................
// EOF
// .............................................................................


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

/** 
 * @namespace ixmaps
 */

(function (window, document, undefined) {

	var ixmaps = {
		version: "1.0"
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

	ixmaps.szDefaultMap				= "../../maps/svg/maps/generic/mercator.svg";

	ixmaps.szUrlSVG					= null;
	ixmaps.helpWindow				= null;
	ixmaps.toolsWindow				= null;
	ixmaps.sidebar					= null;
	ixmaps.htmlMap					= null;

	ixmaps.location					= null;

	ixmaps.fMapLegendStyle			= "hidden";
	ixmaps.fMapControlStyle			= "large";
	ixmaps.fMapSizeMode				= "fullscreen";
	ixmaps.blockLoadingMessage		= false;
	ixmaps.fSilent					= false;

	ixmaps.szCorsProxy 				= "";

	ixmaps.SVGmapWidth				= 0;			
	ixmaps.SVGmapHeight				= 0;


	/* ------------------------------------------------------------------ * 
		local variables
	 * ------------------------------------------------------------------ */

	var	__SVGFile					= "";
	var	__SVGEmbedWidth				= 0;
	var	__SVGEmbedHeight			= 0;
	var __SVGmapPosX				= 0;			
	var __SVGmapPosY				= 0;			
	var __SVGmapOffX				= 0;			
	var __SVGmapOffY				= 0;

	var __mapTop					= 0;
	var __mapLeft					= 0;


	/* ------------------------------------------------------------------ * 
		jquery extensions
	 * ------------------------------------------------------------------ */

	(function( $ ){ 

		/**
		* assert a string.
		* @example $(str).assertStr();
		*/ 
		$.fn.assertStr = function(szError){
		  if ( this.selector && (typeof(this.selector)!="undefined") && this.selector.length && this.selector!="null" ) {
			  return true;
		  }
		  if ( szError ){
			  alert(szError);
		  }
		  return false;
		};

	})( jQuery );

	/* ------------------------------------------------------------------ * 
		helper
	 * ------------------------------------------------------------------ */

	//	for IE9			- document.implementation.hasFeature("org.w3c.svg", "1.0") 
	//	for the rest	- document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")
	ixmaps.hasSVG = function(){
		return( document.implementation.hasFeature("org.w3c.svg", "1.0") ||
				document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") );
	};

	// write to console with time in sec : millisec
	//
	var _log_start_time = new Date();
	_LOG = function(szLog) {
		var time = ((new Date()) - _log_start_time)/1000;
		console.log("_LOG: time[sec.ms] "+time+" "+szLog);
	};

	var __addEvent = function(elem, type, eventHandle) {
		if (elem == null || elem == undefined){
			return;
		}
		if ( elem.addEventListener ) {
			elem.addEventListener( type, eventHandle, false );
		} else if ( elem.attachEvent ) {
			elem.attachEvent( "on" + type, eventHandle );
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
	ixmaps.map = function(szMapDiv,options,callback){

		console.log("*** htmlgui version: "+ixmaps.version);

		if ( !ixmaps.hasSVG() ){
			alert("sorry ! your browser has no native SVG support;\n\nPlease try:   Chrome, Firefox, Safari, Opera or IE9" );
			return;
		}

		var mapDiv = $('#'+szMapDiv)[0];

		/** 
		*  try to get the offset of the map div 
		*  is needed for the fullscreen mode
		**/
		__mapTop  = parseInt($('#'+szMapDiv).css("top"));
		__mapLeft = parseInt($('#'+szMapDiv).css("left"));

		if ( isNaN(__mapTop) && mapDiv.parentNode ){
			__mapTop  = parseInt($('#'+szMapDiv).parent().css("top"));
		}
		if ( isNaN(__mapLeft && mapDiv.parentNode) ){
			__mapLeft = parseInt($('#'+szMapDiv).parent().css("left"));
		}
		/**
			for old map pages or if missing parent DIV
		**/
		if ( isNaN(__mapTop) ){
			__SVGmapPosY = 38;
			__mapTop = 0;
		}
		if ( isNaN(__mapLeft) ){
			__mapLeft = 0;
		}

		/** 
		*  create the divs for svg and html map 
		**/
		var aDiv = null;
		aDiv = document.createElement("div");
		aDiv.setAttribute("id","gmap");
		mapDiv.appendChild(aDiv);
		aDiv = document.createElement("div");
		aDiv.setAttribute("id","svgmapdiv");
		mapDiv.appendChild(aDiv);

		if (options.mapsize == "fix"){
			ixmaps.fMapSizeMode	= "fix";
			__SVGEmbedWidth = mapDiv.clientWidth;
			__SVGEmbedHeight = mapDiv.clientHeight;
			__SVGmapPosX = mapDiv.offsetLeft;
			__SVGmapPosY = mapDiv.offsetTop;
			__mapTop  = 0;
			__mapLeft = 0;
		}
		if (options.mode){
			if (options.mode.match(/nolegend/)){
				ixmaps.fMapLegendStyle = "hidden";
			}
		}
		if (options.controls){
			if (options.controls.match(/small/)){
				ixmaps.fMapControlStyle = "small";
			}
			if (options.controls.match(/mobile/)){
				ixmaps.fMapControlStyle = "mobile";
			}
		}
		if (options.maptype){
			if (options.maptype != "null"){
				ixmaps.fMapType = options.maptype;
			}
		}
		if (options.mapType){
			if (options.mapType != "null"){
				ixmaps.fMapType = options.mapType;
			}
		}
		if (options.wheelzoom){
			ixmaps.scrollWheelZoom = true;
		}

		ixmaps.options = options;

		ixmaps.callback = callback;

		/** 
		*  load the maps
		**/
		return ixmaps.InitAll("gmap","svgmapdiv",options.svg,options.mapService);
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
	ixmaps.InitAll = function(szGmapDiv,szSvgDiv,szUrl,szMapService){

		var szError = null;
		if (!$(szGmapDiv).assertStr()){
			szError = "Error: missing map target (HTML div)!";
		}
		if (!$(szSvgDiv).assertStr()){
			szError = "Error: missing map target (SVG div)!";
		}
		if ( szError ){
			this.showLoading();
			$("#loading-text").append(szError+"x");
			$("#loading-image").css("visibility","hidden");

			// call user defined method on map ready
			// --------------------------------------------------------
			try{
				this.onMapReady(this.szName);
			}
			catch (e){
			}
			// bubble it up !
			try{
				this.parentApi.onMapReady(this.szName);
			}
			catch (e){
			}
			return;
		}

		// store this for later use, needed in browser with more windows 
		this.location = window.location;

		this.szName     = this.szName || "map";
		this.szUrlSVG	= "";
		this.szGmapDiv  = szGmapDiv;
		this.szSvgDiv   = szSvgDiv;
		this.gmapDiv	= $('#'+szGmapDiv)[0];
		this.svgDiv		= $('#'+szSvgDiv)[0];

		if ( szMapService == null || szMapService == 'null'){
			szMapService = "";
		}
		this.szMapService = szMapService;
		
		var fullWidth	= __SVGEmbedWidth?__SVGEmbedWidth:window.innerWidth;
		var fullHeight	= __SVGEmbedHeight?__SVGEmbedHeight:window.innerHeight;

		var mapWidth  = fullWidth  - __mapLeft - __SVGmapPosX;			
		var mapHeight = fullHeight - __mapTop  - __SVGmapPosY;			

		this.hideLoading();

		// -----------------------------------
		// prepare hosting div for google maps
		// -----------------------------------

		if (this.gmapDiv){
			this.gmapDiv.setAttribute("onmousedown","javascript:ixmaps.do_mapmousedown(event);");
			this.gmapDiv.setAttribute("onmouseup","javascript:ixmaps.do_mapmouseup(event);");
			this.gmapDiv.setAttribute("onmouseout","javascript:ixmaps.do_mapmouseout(event);");
			this.gmapDiv.setAttribute("onmouseover","javascript:ixmaps.do_mapmouseover(event);");
			this.gmapDiv.setAttribute("onmousemove","javascript:ixmaps.do_mapmousemove(event);");
			this.gmapDiv.setAttribute("onclick","javascript:ixmaps.do_mapclick(event);");
			this.gmapDiv.setAttribute("ondblclick","javascript:ixmaps.do_mapclick(event);");
			this.gmapDiv.setAttribute("onKeyDown","javascript:ixmaps.do_keydown(event);");
			this.gmapDiv.setAttribute("onKeyUp","javascript:ixmaps.do_keyup(event);");
			
			$(this.gmapDiv).css({'pointer-events':'all'	,
								 'position':'absolute'	,
								 'z-index':'1',
								 'top':__SVGmapPosY+'px',
								 'left':__SVGmapPosX+'px',
								 'height':mapHeight+'px',
								 'width':mapWidth+'px'	});

			$(this.gmapDiv).css({'visibility':'hidden'});
			this.htmlMap = true;
		}

		// ------------------------------------
		// prepare hosting div for ixmap svgmap
		// ------------------------------------

		if (this.svgDiv){
			this.svgDiv.setAttribute("onmousedown","javascript:ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmouseup","javascript:ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmouseout","javascript:ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmousemove","javascript:ixmaps.do_svgtriggerevent();");
			this.svgDiv.setAttribute("onmousewheel","javascript:ixmaps.do_wheelEvent();");
			this.svgDiv.setAttribute("onKeyDown","javascript:ixmaps.do_keydown(event);");
			this.svgDiv.setAttribute("onKeyUp","javascript:ixmaps.do_keyup(event);");

			$(this.svgDiv).css({'pointer-events':'none',
								'position':'absolute',
								'z-index':'99',
								'top':+__SVGmapPosY+'px',
								'left':+__SVGmapPosX+'px' });

			$(this.svgDiv).css({'visibility':'hidden'});

			// GR 09.01.2014 create without data="... attribute !
			//				 data= will be defined by ixmaps.HTML_loadSVGMap(...); see below
 			this.svgDiv.innerHTML = 
				"<iframe id='SVGMap' type='image/svg+xml' wmode='transparent' name='svgmap' style='border:0;' "+
				"width='"+(mapWidth)+"px' "+
				"height='"+(mapHeight)+"px' "+
				">";

			this.svgObject = $('#'+this.szSvgDiv+' > iframe')[0];
	
			// --------------------
			// load basic SVG file
			// --------------------

			// GR 07.04.2018 default map
			szUrl = szUrl || ixmaps.szDefaultMap;

			if ( szUrl || $( szUrl).assertStr()){

				this.HTML_loadSVGMap(szUrl);
				this.szUrlSVG = szUrl;

			}else{
				// if no map is given
				// we are ready here ----> fire onMapReady event !
				// -----------------------------------------------
				this.showLoading();
				$("#loading-text").append("no map");
				$("#loading-image").css("visibility","hidden");

				if ( this.callback ) {
					this.callback(this);
				}else{
					try{
						this.onMapReady(this.szName);
					}
					catch (e){
					}
					// bubble it up !
					try{
						this.parentApi.onMapReady(this.szName);
					}
					catch (e){
					}
				}
			}
		}

		// register window resize event to adapt the map always to the window size
		// -----------------------------------------------------------------------
		__addEvent(window, "resize", function() { ixmaps.resizeMap(null,false); } );

		setTimeout("ixmaps.resizeMap(null,false)",100);

		return ixmaps;
	};

	/**
	 * load an SVG map ino the map (embed) object    
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @param szName a name to identify the map, usefull if we have more than one map in a HTML page
	 * @type void
	 */
	ixmaps.HTML_loadSVGMap = function(szUrl,szName){

		this.showLoading();
		if (ixmaps.embeddedSVG){
			if (szUrl.match(/http/)){
				this.loadedMap = szUrl;
				ixmaps.embeddedSVG.window.map.Api.loadMap(szUrl);
				return;
			}else{
				this.mapTool("");
			}
		}

		if ( this.szUrlSVG == szUrl ){

			// call user defined method on map ready
			// --------------------------------------------------------
			if ( this.callback ) {
				this.callback(this);
			}else{
				this.onMapReady(this.szName);
			}
			return;
		}

		this.szUrlSVG = szUrl;
		this.szUrlSVGRoot = "";
		if (szUrl.match(/\//)){
			urlA = szUrl.split("/");
			for ( var i=0; i<urlA.length-1; i++){
				this.szUrlSVGRoot += urlA[i]+"/";
			}
		}else{
			this.szUrlSVGRoot = "";
		}
		$(this.svgObject).attr('onerror','ixmaps.loadMapError()');

		$.get(this.szUrlSVG).
			done(function(data) {
				$(ixmaps.svgObject).attr('src',ixmaps.szUrlSVG);
			}).
			fail(function() {
				$("#loading-text").empty();
				$("#loading-text").append("<span style='font-size:32px'><span style='color:red'>loading map error: </span>'"+ixmaps.szUrlSVG+"'<br> <span style='color:red'>not found</span></span>");
			});

		//$(this.svgObject).attr('data',this.szUrlSVG);

		this.embeddedSVG = null;
		do_enableSVG();
	};

	ixmaps.loadMapError = function(){
		alert("SVG load error!");
	};

	/**
	 * load an SVG map out of a list     
	 * @type void
	 */
	ixmaps.HTML_setSVGMapByList = function(){

		var svgmapList = window.document.getElementById("svgMapList");
		this.HTML_loadSVGMap(svgmapList.value);
	};

	/**
	 * wrapper to load an SVG map
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @param szName a name to identify the map, usefull if we have more than one map in a HTML page
	 * @type void
	 */
	ixmaps.HTML_setSVGMap = function(szUrl,szName){

		this.HTML_loadSVGMap(szUrl,szName);
		$("#dialog").dialog( "close" );
	};

	/**
	 * wrapper to load an SVG map
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @type void
	 */
	ixmaps.loadMap = function(szUrl,callback) {
		this.callback = callback;
		ixmaps.HTML_loadSVGMap(szUrl);
	};

	/**
	 * on resize handler   
	 * @param mapBox an optinal boundigbox in screen coordinates
	 * @param fZoomTo parameter to pass to htmlgui_resizeMap()
	 * @param fCenter parameter to pass to htmlgui_resizeMap()
	 * @type void
	 */
	ixmaps.resizeMap = function(mapBox,fZoomTo,fCenter){

		if (mapBox){
			__SVGmapOffX = mapBox.x;			
			__SVGmapOffY = mapBox.y;	
			ixmaps.SVGmapWidth  = mapBox.width;			
			ixmaps.SVGmapHeight = mapBox.height;			
		}else{
			if ( ixmaps.fMapSizeMode == "fix" ){
				return;
			}
			if ( $("#banner-right").position() ){
				__SVGmapPosY = $("#banner-right").position().top - parseInt($("#banner-right").parent().css("padding-top"));
				$("#banner").css("height","40px");
			}
			ixmaps.SVGmapWidth  = window.innerWidth  - __mapLeft - __SVGmapPosX - __SVGmapOffX;			
			ixmaps.SVGmapHeight = window.innerHeight - __mapTop  - __SVGmapPosY - __SVGmapOffY;			
		}
		
		if ($(this.gmapDiv)){
			$(this.gmapDiv).css({
				"top"	:(__SVGmapPosY+__SVGmapOffY)+"px",
				"left"	:(__SVGmapPosX+__SVGmapOffX)+"px",
				"width"	:(ixmaps.SVGmapWidth)+"px",
				"height":(ixmaps.SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($(this.svgDiv)){
			$(this.svgDiv).css({
				"top"	:(__SVGmapPosY)+"px",
				"left"	:(__SVGmapPosX)+"px",
				"width"	:(__SVGmapOffX+ixmaps.SVGmapWidth)+"px",
				"height":(__SVGmapOffY+ixmaps.SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#SVGMap")){
			$("#SVGMap").css({
				"width"	:(__SVGmapOffX+ixmaps.SVGmapWidth)+"px",
				"height":(__SVGmapOffY+ixmaps.SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#ixmap")){
			$("#ixmap").css({
				"width"	:(__SVGmapOffX+ixmaps.SVGmapWidth)+"px",
				"height":(__SVGmapOffY+ixmaps.SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#dummy-split-container")){
			$("#dummy-split-container").css({
				"top"	:(__SVGmapPosY+__SVGmapOffY)+"px",
				"left"	:(__SVGmapPosX+__SVGmapOffX)+"px",
				"width"	:(ixmaps.SVGmapWidth)+"px",
				"height":(ixmaps.SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}

		htmlMap_setSize(ixmaps.SVGmapWidth,ixmaps.SVGmapHeight);

		this.htmlgui_resizeMap(fZoomTo,__SVGmapOffX+ixmaps.SVGmapWidth,__SVGmapOffY+ixmaps.SVGmapHeight,fCenter);

		try{
			this.htmlgui_onWindowResize();
		}
		catch (e){}
	};


	// -----------------------------------
	// loading message 
	// -----------------------------------

	/**
	 * display the defined loading message
	 * @param szMessage the message text
	 * @type void
	 */
	ixmaps.showLoading = function(szMessage,fForce){

		// GR 09.12.2016 ixmaps parameter defined to not show loading messages
		if ( ixmaps.embeddedSVG && ixmaps.embeddedSVG.window.fExecuteSilent && !fForce ){
			return;
		}

		try{
			if ( ixmaps.embeddedSVG ){
				szMessage = ixmaps.embeddedSVG.window.map.Dictionary.getLocalText(szMessage);
			}
		}
		catch (e){
		}

		if ( szMessage && (szMessage.length > 25) ){
			szMessage = "..."+szMessage.slice(-25);
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
		if ( !$("#divloading")[0] )	{
			$(this.gmapDiv).append(
			'<div id="divloading" style="pointer-events:none;z-index:9999">'+
				'<div id="loading-text-div" class="loading-text-div">'+
					'<span id="loading-text" class="loading-text">IXMAPS</span>'+
				'</div>'+
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
				"font-size": "42px",
				"opacity": "1",
				"color": "#aaa",
				"padding": "0em 1em",
				"border": "solid #666 0.5px",
				"border-radius": "0.2em",
				"background": "rgb(255, 255, 255, 0.5)" 
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

		try{
			var top  = (window.innerHeight*0.4);
			var left = (window.innerWidth*0.47);
			var gmapDiv = this.gmapDiv;
			if (gmapDiv && $(gmapDiv).css("visibility") == "visible" ){
				top  = parseInt($(gmapDiv).css("top")) + parseInt($(gmapDiv).css("height"))/2;
				left = parseInt($(gmapDiv).css("left"))+ parseInt($(gmapDiv).css("width"))/2;
			}
			$("#divloading").css({
				"visibility":"visible",
				"top"		:String(top+"px"),
				"left"		:String(left+"px")
				});
			$("#loading-image").css("visibility","visible");
			$("#loading-text-div").show();
			if ( szMessage ){
				$("#loading-text").empty();
				$("#loading-text").append(szMessage);
			}

			ixmaps.blockLoadingMessage = true;

			clearTimeout(ixmaps.hideLoadingTimeout);
		}
		catch (e){
		}
	};

	/**
	 * hide the loading message
	 * @type void
	 */
	ixmaps.hideLoading = function(){
		try{
			$("#loading-image").css("visibility","hidden");
			ixmaps.hideLoadingTimeout = setTimeout('$("#loading-text-div").fadeOut(100)',500);
			ixmaps.blockLoadingMessage = false;
		}
		catch (e){
		}
	};

	// -----------------------------------
	// alternating loading message 
	// -----------------------------------

	var __showLoadingArray = [];
	var __showLoadingArrayIndex = 0;
	var __showLoadingArrayTimeout = null;
	var __showLoadingArrayActive = false;

	/**
	 * start displaying alternating loading messages
	 * @param szMessageA an array of alternative message texts
	 * @type void
	 */
	ixmaps.showLoadingArray = function(szMessageA){
		__showLoadingArray = szMessageA;
		__showLoadingArrayActive = true;
		__showLoadingArrayIndex = 0;
		ixmaps.showLoadingArrayNext();
	};
	/**
	 * show the next message from the array 
	 * @type void
	 */
	ixmaps.showLoadingArrayNext = function(){
		if ( !__showLoadingArrayActive ){
			return;
		}
		ixmaps.showLoading(__showLoadingArray[__showLoadingArrayIndex++]);
		$("#loading-gif").show();

		__showLoadingArrayIndex = __showLoadingArrayIndex%(__showLoadingArray.length);
		__showLoadingArrayTimeout = setTimeout("ixmaps.showLoadingArrayNext()",1000);
	};
	/**
	 * stot the alternating message display
	 * @type void
	 */
	ixmaps.showLoadingArrayStop = function(){
		__showLoadingArrayActive = false;
		clearTimeout(__showLoadingArrayTimeout);
		$("#loading-gif").hide();
	};

	// -----------------------------------
	// show/hide HTML map
	// -----------------------------------

	ixmaps.HTML_showMap = function(){
		if ( this.fSVGInitializing ){
			return;
		}
		if ( this.gmapDiv && !this.gmap ){
			this.gmap = this.loadGMap(this.szMapService);
			this.htmlMap = true;

			// --------------------------------------------------------
			// event error work around
			// --------------------------------------------------------
			// GR 09.04.2018 some broser don't get events through overlay SVG even if there pointer-events == none
			// we create a transparent pane on top to enable zoom and pan of the HTML basemap 
			aDiv = document.createElement("div");
			aDiv.setAttribute("id","androideventpane");
			aDiv.setAttribute("class", "androideventpane");
			aDiv.setAttribute("style", "position:absolute;width:100%;height:100%;z-index:100");
			$('#'+this.szGmapDiv)[0].appendChild(aDiv);

		}
		$(this.gmapDiv).css("visibility","visible");
		this.hideNorthArrow();
	};

	ixmaps.HTML_hideMap = function(){
		//$(this.gmapDiv).css("visibility","hidden");
		this.showNorthArrow();
	};
	
	ixmaps.HTML_toggleMap = function(){
		if ( $(this.gmapDiv).css("visibility") == "visible" ){
			this.HTML_hideMap();
			this.htmlMap = false;
		}else{
			this.HTML_showMap();
			this.htmlMap = true;
			this.htmlgui_synchronizeMap(false,false);
		}
	};

	/** query HTML map visibility
	 */
	ixmaps.htmlgui_isHTMLMapVisible = function(){
		return ($(this.gmapDiv).css("visibility") == "visible");
	};

	// -----------------------------------
	// show/hide SVG map
	// -----------------------------------

	ixmaps.HTML_toggleSVG = function(){
		if ( $(this.svgDiv).css("width") == (__SVGmapOffX+"px") ){
			$(this.svgDiv).css("width",(__SVGmapOffX+ixmaps.SVGmapWidth)+"px");
		}else{
			$(this.svgDiv).css("width",(__SVGmapOffX)+"px");
		}
	};

	// -----------------------------------
	//	map opacity
	// -----------------------------------

	ixmaps.setSVGMapOpacity = function(nValue,szMode){
		try { ixmaps.embeddedSVG.window.map.setOpacity(nValue,szMode);
		} catch (e){}
	};
	ixmaps.toggleSVGMapOpacity = function(){
		try { ixmaps.embeddedSVG.window.map.toggleOpacity();
		} catch (e){}
	};
	ixmaps.setHTMLMapOpacity = function(nValue,szMode){
		var nOpacity = Number($(this.gmapDiv).css("opacity") || 1);
		nOpacity += nValue;
		$(this.gmapDiv).css("opacity",String(nOpacity));
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
	ixmaps.setMapFeatures = function(szFeatures){
		ixmaps.embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
		ixmaps.embeddedSVG.window.map.Viewport.reformat();
		return ixmaps;
	};

	/**
	 * set map options
	 * @param {Object} opt option object  like {item1:value1,item2:value2} 
	 * @return void
	 */
	ixmaps.setOptions = function(opt){
		var szFeatures = "";
		for ( i in opt ){
			if ( (typeof(i) == "string") && (i.match(/autoSwitchInfo/i)) ){
				this.setAutoSwitchInfo(true);
			}else
			if ( (typeof(i) == "string") && (i.match(/panHidden/i)) ){
				this.panHidden = (typeof(opt[i]) == "string") ? (opt[i]=="true") : opt[i];
			}else
			if ( (typeof(i) == "string") && (i.match(/normalSizeScale/i)) ){
				this.setScaleParam({"normalSizeScale":opt[i]});
			}else{
				szFeatures += String(i+":"+opt[i]+";");
			}
		}
		ixmaps.embeddedSVG.window.map.Api.setMapFeatures(szFeatures);
		return ixmaps;
	};

	/**
	 * set map scale parameter
	 * @param {String} szMap the name of the embedded map [optional] <em>null if there is only one map</em>
	 * @param {String} szParam a style string like "item1:value1;item2:value2;" 
	 * @return void
	 * @example	ixmaps.setScaleParam("normalSizeScale:50000;labelScaling:1.5");
	 */
	ixmaps.setScaleParam = function(szParam){
		if ( typeof(szParam) == 'string' ){
			try	{
				eval('szParam = {'+szParam.replace(/;/g,',')+'}');
			} catch (e) {
				alert("invalid scale param: \""+szParam+"\"");
				return;
			}
		}
		ixmaps.embeddedSVG.window.map.Api.setScaleParam(szParam);
		return ixmaps;
	};


	// -----------------------------
	// map themes handling
	// -----------------------------

	ixmaps.newTheme = function(szThemeName,theme,fClear){ 

		if ( !theme ){
			alert("no theme defined");
			return;
		}
		// clone opt to not destroy the original
		// method found on stackoverflow.org
		ixmaps.theme = JSON.parse(JSON.stringify(theme));

		// to clear, call clearAll() and give time by setTimeout 
		if ( fClear ){
			if ( fClear == "force" ){
				theme.style.type += "|FORCE";
			}
			if ( fClear == "clearcharts" ){
				this.clearAllCharts();
			}else{
				this.clearAll();
			}
		}

		// set theme title to theme name if not defined in theme object
		if ( !theme.style.title && szThemeName ){
			theme.style.title = szThemeName;
		}

		try {
			ixmaps.embeddedSVG.window.map.Api.newMapThemeByObj(theme);
		}
		catch (e){}
	};
	ixmaps.refreshTheme = function(szThemeId){
		try {
			ixmaps.embeddedSVG.window.map.Api.refreshTheme(szThemeId);
		}
		catch (e){}
	};
	ixmaps.removeTheme = function(szThemeId){
		try {
			ixmaps.embeddedSVG.window.map.Api.removeTheme(szThemeId);
		}
		catch (e){}
	};
	ixmaps.clearAll = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAll();
		}catch (e){}
	};
	ixmaps.clearAllCharts = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
		}catch (e){}
	};
	ixmaps.clearAllChoropleth = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAllChoropleth();
		}catch (e){}
	};
	ixmaps.clearAllOverlays = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
		}catch (e){}
	};
	ixmaps.changeObjectScaling = function(nDelta){
		try{
			ixmaps.embeddedSVG.window.map.Api.changeObjectScaling(nDelta);
		}catch (e){}
	};
	ixmaps.changeFeatureScaling = function(nDelta){
		try{
			ixmaps.embeddedSVG.window.map.Api.changeFeatureScaling(nDelta);
		}catch (e){}
	};
	ixmaps.changeLabelScaling = function(nDelta){
		try{
			ixmaps.embeddedSVG.window.map.Api.changeLabelScaling(nDelta);
		}catch (e){}
	};
	ixmaps.changeLineScaling = function(nDelta){
		try{
			ixmaps.embeddedSVG.window.map.Api.changeLineScaling(nDelta);
		}catch (e){}
	};
	ixmaps.changeRotation = function(nDelta){
		try{
			ixmaps.embeddedSVG.window.map.Api.changeRotation(nDelta);
		}catch (e){}
	};
	ixmaps.showNorthArrow = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.showNorthArrow();
		}catch (e){}
	};
	ixmaps.hideNorthArrow = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.hideNorthArrow();
		}catch (e){}
	};
	ixmaps.popupThemeMenu = function(szId){
		try{
			ixmaps.embeddedSVG.window.map.Api.popupThemeStyleMenu(szId);
		}catch (e){}
	};
	_valuesFlag = false;
	ixmaps.toggleThemeValues = function(fFlag){
		try{
			_valuesFlag = !_valuesFlag;
			ixmaps.embeddedSVG.window.map.Api.toggleThemeValues(_valuesFlag);
		}catch (e){}
	};
	_legendsFlag = true;
	ixmaps.toggleThemeLegends = function(fFlag){
		try{
			_legendsFlag = (typeof(fFlag)!="undefined")?fFlag:!_legendsFlag;
			ixmaps.embeddedSVG.window.map.Api.toggleThemeLegends(_legendsFlag);
		}catch (e){}
	};
	ixmaps.extendMap = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.extendMap();
			setTimeout("ixmaps.embeddedSVG.window.map.Api.hideLegend()",1);
		}catch (e){}
	};
	ixmaps.normalMap = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.normalMap();
			ixmaps.embeddedSVG.window.map.Api.showLegend();
		}catch (e){}
	};
	var __fLegendSideBar = true;
	ixmaps.toggleLegend = function(){
		if ( __fLegendSideBar ){
			ixmaps.extendMap();
		}else{
			ixmaps.normalMap();
		}
		__fLegendSideBar =! __fLegendSideBar;
	};
	ixmaps.zoomMapByList = function(){
	var zoomList = window.document.getElementById("zoomList");
		this.zoomMap(zoomList.value,'byscale');
	};
	ixmaps.resetMap = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAll();
			ixmaps.embeddedSVG.window.map.Api.doZoomMapToFullExtend();
			this.htmlgui_synchronizeMap(false,true);
			ixmaps.resetCenter();
			}catch (e){}	
	};
	ixmaps.resetCenter = function(){
			var arrayPtLatLon = htmlMap_getBounds();
			ixmaps.embeddedSVG.window.map.Api.doSetMapToGeoBounds(
				arrayPtLatLon[0].lat,
				arrayPtLatLon[0].lng,
				arrayPtLatLon[1].lat,
				arrayPtLatLon[1].lng);
	};
	ixmaps.clearOverlays = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
			}catch (e){}	
	};

	ixmaps.changeThemeStyle = function(szThemeName,szStyle,szFlag){
		try {
			ixmaps.embeddedSVG.window.map.Api.changeThemeStyle(szThemeName,szStyle,szFlag);
		}
		catch (e){}
	};

	ixmaps.zoomToTheme = function(szThemeName){
		try {
			ixmaps.embeddedSVG.window.map.Api.zoomToTheme(szThemeName);
		}
		catch (e){}
	};

	ixmaps.getThemes = function(){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getAllThemes();
		}catch (e){return null;}	
	};

	ixmaps.getThemeObj = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getTheme(szThemeName);
		}catch (e){return null;}	
	};

	ixmaps.getThemeDefinitionObj = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeDefinitionObj(szThemeName);
		}catch (e){return null;}	
	};

	ixmaps.getThemeStyleString = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeStyleString(szThemeName);
		}catch (e){return null;}
	};

	/**
	 * get the data of a theme object or map item
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the data as JSON object
	 */
	ixmaps.getData = function(szItem){
		try {
			var theme = szItem.split(":")[0];
			if ( theme.match("theme") ){
				szItem = szItem.split(theme+":")[1];
				szItem = szItem.split(":chartgroup")[0];
				var dataA = ixmaps.embeddedSVG.window.map.Api.getMapThemeDataRow(null,szItem);
				var result = [];
				var data = {};
				var nItems = dataA.length/2;
				for ( i=0; i<nItems;i++ ) {
					if ( data[dataA[i]] ){
						result.push(data);
						data = {};
					}
					data[dataA[i]] = dataA[i+nItems];
				}
				result.push(data);
				return result;
			}
		}catch (e){return null;}	
	};

	/**
	 * get the position of a theme object or map item
	 * @param {String} szItem the id of the theme item or map item
	 * @return {Object} the position as JSON object
	 */
	ixmaps.getPosition = function(szItem){
		try {
			var theme = szItem.split(":")[0];
			if ( theme.match("theme") ){
				szItem = szItem.split(theme+":")[1];
				szItem = szItem.split(":chartgroup")[0];
				return ixmaps.embeddedSVG.window.map.Api.getMapThemeItemPosition(null,szItem);
			}
		}catch (e){return null;}	
	};
	/**
	 * mark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.markThemeClass = function(szThemeId,nIndex){
		try {
			ixmaps.embeddedSVG.window.map.Api.markThemeClass(szThemeId,nIndex);
		}catch (e){
			return null;
		}	
	};
	/**
	 * unmark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.unmarkThemeClass = function(szThemeId,nIndex){
		try {
			ixmaps.embeddedSVG.window.map.Api.unmarkThemeClass(szThemeId,nIndex);
		}catch (e){
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
	ixmaps.filterThemeItems = function(szThemeId,szFilter,mode){
		console.log("exec");
		console.log(arguments);
		try {
			ixmaps.embeddedSVG.window.map.Api.filterThemeItems(szThemeId,szFilter,mode);
		}catch (e){
			return null;
		}	
	};

	// -----------------------------
	// html button handler
	// -----------------------------

	ixmaps.panMap = function(nDeltaX,nDeltaY,szMode){
		try{
			ixmaps.embeddedSVG.window.map.Api.doPanMap(nDeltaX,nDeltaY,szMode);
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.zoomMap = function(nIndex,szMode,newZoom){
		try{
			var zoomSelect  = window.document.getElementById("zoomList");
			var newScale = ixmaps.embeddedSVG.window.map.Api.doZoomMap(nIndex,szMode,newZoom);
			if ( szMode == null ){
				zoomSelect.options[zoomSelect.options.length-1].text = "1:"+newScale;
				zoomSelect.selectedIndex = zoomSelect.options.length-1;
			}
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.clipLayer = function(szLayerName,nWidth){
		try{
			ixmaps.embeddedSVG.window.map.Api.setLayerClip(szLayerName,nWidth);
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.clipMap = function(nWidth){
		try{
			ixmaps.embeddedSVG.window.map.Api.setMapClip(nWidth);
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.backwardsMap = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.backwards();
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.forwardsMap = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.forwards();
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.mapTool = function(szMode){
		if ( (szMode == "pan") ){
			try{
				ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
			}
			catch (e){
				alert('map api error!');
			}
		}
		try{
			ixmaps.embeddedSVG.window.map.Api.setMapTool(szMode);
		}
		catch (e){
			alert('map api error!');
		}
	};
	ixmaps.getMapTool = function(){
		try{
			return ixmaps.embeddedSVG.window.map.Api.getMapTool();
		}
		catch (e){
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
	ixmaps.htmlgui_onMapInit = function(mapwindow){

		_LOG("init ...");

		this.fSVGInitializing = true;

		this.embeddedSVG = new Object({window:mapwindow});

		if ( this.fMapLegendStyle.match(/hidden/) ){
			this.extendMap();
		}
	};

	/**
	 * called if SVG map is loaded and in phase di initialising
	 * permits to intervent in the initialising process
	 * @param mapwindow the window handle of the SVG map 
	 * @return ---
	 */
	ixmaps.htmlgui_onMapError = function(){alert("error");

		_LOG("onMapError");

		this.fSVGInitializing = false;

		// hide loding image 
		// --------------------------
		try{
			$("#divloading").css("visibility","hidden");
			$("#ixmap").css("background","#fff");
		}
		catch (e){
		}

		// call user defined method on map ready
		// --------------------------------------------------------
		if ( this.callback ) {
			this.callback(this);
		}else{
			this.onMapReady(this.szName);
		}
	};

	/**
	 * check if ixmaps has already synchronized the two maps SVG and HTML 
	 * @param void
	 * @return void
	 */
	ixmaps.htmlgui_checkSync = function(){
		
		if ( !ixmaps.fSynchronized ){
			ixmaps.htmlgui_synchronizeMap(false,true);
		}
	};
	/**
	 * called if SVG map is loaded and formatted
	 * @param mapwindow the window handle of the SVG map 
	 * @return ---
	 */
	ixmaps.htmlgui_onMapReady = function(mapwindow){ 

		_LOG("ready");
		this.fSVGInitializing = false;

		ixmaps.blockLoadingMessage = false;

		if ( this.htmlMap && this.gmapDiv ){
			ixmaps.HTML_showMap();
			// setTimeout("$('#loading-text').empty()",250);
		}
		else{
			var div = window.document.getElementById("svgmapdiv");
			if (div){
				try	{		div.style.setProperty("visibility","visible",null); }
				catch (e) { div.style["visibility"] = "visible";         	   }
			}
			setTimeout("ixmaps.hideLoading()",250);
			this.mapTool("pan");
		}

		// enable access to the SVG map
		// ----------------------------
		this.embeddedSVG = new Object({window:mapwindow});
		try{
			this.embeddedSVG.window._TRACE("==> htmlgui: onMapReady() ! ==>   ==>   ==>   ==>   ==>   ==>   ==>   ==>");
		}
		catch (e){
		}
		if (this.parentApi && this.parentApi.setEmbeddedSVG ){
			this.parentApi.setEmbeddedSVG(this.embeddedSVG);
		}

		// call user defined method on map ready
		// --------------------------------------------------------

		if ( this.callback ) {
			this.callback(this);
		}else{
			try{
				this.onMapReady(this.szName);
			}
			catch (e){
			}
			// bubble it up !
			try{
				this.parentApi.onMapReady(this.szName);
			}
			catch (e){
			}
		}
		if ( this.fSilent ){
			this.embeddedSVG.window.map.Api.setMapFeatures('worksilent:true');
			this.embeddedSVG.window.map.Api.setMapFeatures('loadsilent:true');
		}

		// in case we have no user defined view in the initializing process, we must program a sync via timeout !
		setTimeout("ixmaps.htmlgui_checkSync()",1000);

		$("#loading-gif").hide();

	};

	/**
	 * called if SVG map has been resized (e.g. legend switched off)
	 * @return ---
	 */
	ixmaps.htmlgui_onMapResize = function(){

		// adapt the HTML map to the canvas offsets of the SVG map
		// --------------------------------------------------------
		try{
			var mapBox = this.embeddedSVG.window.map.Api.getMapBox();
			this.resizeMap(mapBox,false);
		}
		catch (e){
		}
	};

	/**
	 * set actual scale in HTML scale select form 
	 * @param newScale the scale to set (integer value)
	 * @return ---
	 */
	ixmaps.htmlgui_setScaleSelect = function(newScale){
		if ( this.embeddedSVG ){
			try{
				var zoomSelect  = window.document.getElementById("zoomList");
				zoomSelect.options[zoomSelect.options.length-1].text = "1:"+newScale;
				zoomSelect.selectedIndex = zoomSelect.options.length-1;
			}
			catch (e){
			}
		}
		if ( ixmaps.parentApi != ixmaps ) {
			ixmaps.parentApi.htmlgui_setScaleSelect(newScale);
		}
	};

	/**
	 * set actual map envelope
	 * save in cookie and synchronize evt. HTML map
	 * @param szEnvelope the scale to set (integer value)
	 * @return ---
	 */
	ixmaps.htmlgui_setCurrentEnvelope = function(szEnvelope,fZoomto){
		if ( this.embeddedSVG ){
			try{
				this.htmlgui_synchronizeMap(false,fZoomto);
			}
			catch (e){
			}
		}
	};

	/**
	 * Is called by the map to open a browser popup window
	 */
	ixmaps.htmlgui_popupWindow = function(szUrl){
		window.open(szUrl,"test","dependent=yes,alwaysRaised=yes,width=600,height=700,resizable=yes,scrollbars=yes");
	};

	/**
	 * Is called by the map to notify the active theme (necessary?)
	 */
	ixmaps.htmlgui_setActiveTheme = function(szTheme){
		$("#switchinfobutton").show();
	};

	/**
	 * Is called by the map to notify the actual theme (necessary?)
	 */
	ixmaps.htmlgui_setActualTheme = function(szTheme){
		ixmaps.initThemeTools();
	};

	/**
	 * Is called on resize of hosting window
	 */
	ixmaps.htmlgui_resizeMap = function(fZoomTo,nWidth,nHeight,fCenter){

		var szMethod = fCenter?"center":"extendmax";
		// GR 15.10.2015 test
		szMethod = "center";	
		if ( ixmaps.embeddedSVG ){
			if ( nWidth && nHeight ){
				ixmaps.embeddedSVG.window.map.Api.resizeCanvas(0,0,nWidth,nHeight,szMethod);
			}else{
				ixmaps.embeddedSVG.window.map.Api.resizeCanvas(0,0,ixmaps.embeddedSVG.window.innerWidth,ixmaps.embeddedSVG.window.innerHeight,szMethod);
			}
		}
		ixmaps.htmlgui_synchronizeMap(false,fZoomTo);
	};

	/**
	 * Is called by the map script when the map is loaded; to get parameter
	 */
	__mapsEmbedA = null;
	__mapsEmbedded = 0;
	__mapsLoaded = 0;

	ixmaps.htmlgui_queryMapFeatures = function(){

		if ( __mapsEmbedA == null ){
			__mapsEmbedA = new Array(0);
			var embedsA = window.document.embeds;
			for ( a in embedsA ){
				if ( a.match(/SVG/)){
					__mapsEmbedA[a] = a;
					__mapsEmbedded++;
				}
			}
		}
		if ( ++__mapsLoaded == __mapsEmbedded ){
			for ( a in __mapsEmbedA ){
				htmlgui_setEmbedName(a);
				}
		}
	};

	/**
	 * Is called for every (embedded) SVG when all (embedded) maps are loaded
	 */
	htmlgui_setEmbedName = function(szEmbed){
		var embeddedSVG = window.document.getElementById(szEmbed);
		// 1. set the name of the embedding object ( necessary because the SVG DOM has no way to know its embedding parent 
		embeddedSVG.window.map.setFeatures("embedname:"+szEmbed);
		// 2. try to call a function, that, if defined, may push init actions for this map; if all parts of the map are loaded, this actions are evaluated
		try{
			htmlgui_queryActions(szEmbed);
		}
		catch (e){
		}
	};

	/**
	 * Is called by the svg map script when the map tool has been changed
	 */
	ixmaps.htmlgui_setMapTool = function(szToolId){
		try	{
			if ( szToolId == "" ){
				 /**
				 ixmaps.htmlgui_onMapTool("pan");

				 $("#zoom")[0].checked=false; 
				 $("#pan")[0].checked=true; 
				 $("#tools").buttonset().refresh();
				 **/
			}
		}
		catch (e){
		}
		try{
			this.htmlgui_onMapTool(szToolId);
		}
		catch (e){
		}
	};

	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	var infoWindow = null;
	var tDisplayInfo = null;
	ixmaps.htmlgui_displayInfo = function(szMessage){
		if ( szMessage.length > 3 ){
			ixmaps.htmlgui_doDisplayInfo(szMessage);
			ixmaps.blockLoadingMessage = false;
		}
	};
	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	ixmaps.htmlgui_doDisplayInfo = function(szMessage){ //return;

		if ( szMessage && (szMessage.length > 25) ){
			szMessage = szMessage.slice(0,25)+" ...";
		}
		if ( szMessage.match("error") ){
			szMessage = "<span style='color:red'>"+szMessage+"</span>";
		}
		$("#loading-text").empty();
		$("#loading-text").append(szMessage);
		ixmaps.showLoading();
		return; 
	};
	/**
	 * Is called by the svg map script to delete messages display in a HTML window
	 */
	ixmaps.htmlgui_killInfo = function(){
		if ( ixmaps.blockLoadingMessage  ){
			return;
		}
		clearTimeout(tDisplayInfo); 
		//$("#loading-text").empty();
		setTimeout("ixmaps.hideLoading()",250);
		return; 
	};
	/**
	 * Is called by the svg map script to display messages in a HTML window
	 */
	ixmaps.htmlgui_isInfoDisplay = function(){
		return $("#loading-text")[0].innerHTML.length;
	};

	/**
	 * Is called by the svg map script to log error messages 
	 */
	ixmaps.htmlgui_errorLog = function(szMessage){

		$("#loading-text").empty();
		$("#loading-text").append(szMessage+"e");

		alert(szMessage);
	};

	// ---------------------------------------------------------
	// foreward these events to an hosting window, if present
	// ---------------------------------------------------------

	ixmaps.htmlgui_onItemClick = function(szId){
		if ( ixmaps.parentApi != ixmaps ){
			return ixmaps.parentApi.htmlgui_onItemClick(szId);
		}
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
		try{
			ixmaps.updatePageHistory();
		}
		catch (e){}
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

	ixmaps.htmlgui_drawChart = function(SVGDoc,args){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_drawChart(SVGDoc,args) : null;
	};

	ixmaps.htmlgui_drawChartAfter = function(SVGDoc,args){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_drawChartAfter(SVGDoc,args) :null;
	};

	ixmaps.htmlgui_onTooltipDisplay = function(szText){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_onTooltipDisplay(szText) : szText;
	};

	ixmaps.htmlgui_onInfoTitle = function(szText,item){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_onInfoTitle(szText,item) : szText;
	};

	ixmaps.htmlgui_onInfoDisplayExtend = function(svgDoc,szId){
		return ( ixmaps.parentApi != ixmaps ) ? ixmaps.parentApi.htmlgui_onInfoDisplayExtend(svgDoc,szId) : null;
	};

	ixmaps.htmlgui_colorScheme = function(theme){
		if ( ixmaps.parentApi != ixmaps ){
			ixmaps.parentApi.htmlgui_colorScheme(theme);
		}
	};

	ixmaps.htmlgui_onZoomAndPan = function(nZoom){
		try{
			ixmaps.updatePageHistory();
		}catch (e){}
		if ( ixmaps.parentApi != ixmaps ){
			try	{
				ixmaps.parentApi.onMapZoom(nZoom);
			}catch (e){}
			try	{
				ixmaps.parentApi.htmlgui_onZoomAndPan(nZoom);
			}catch (e){}
		}
	};

	ixmaps.htmlgui_onWindowResize = function(){
		if ( ixmaps.parentApi != ixmaps ){
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

	ixmaps.htmlgui_setMapTypeBG = function(szId){
		// dummy
	};

	ixmaps.htmlgui_saveBookmark = function(){
		ixmaps.htmlgui_doSaveBookmark();
	};

	ixmaps.htmlgui_doSaveBookmark = function(szName){

		var szBookMarkJS = this.getBookmarkString();

		htmlgui_setCookie("test", szBookMarkJS);
		this.embeddedSVG.window.map.Api.displayMessage("Bookmark saved",1000);
	};

	ixmaps.getEnvelopeString = function(nZoom){

		var arrayPtLatLon = this.embeddedSVG.window.map.Api.getBoundsOfMapInGeoBounds();
		arrayPtLatLon[0].x = Math.max(Math.min(arrayPtLatLon[0].x,180),-180);
		arrayPtLatLon[0].y = Math.max(Math.min(arrayPtLatLon[0].y,80),-80);
		arrayPtLatLon[1].x = Math.max(Math.min(arrayPtLatLon[1].x,180),-180);
		arrayPtLatLon[1].y = Math.max(Math.min(arrayPtLatLon[1].y,80),-80);
		
		var mX = (arrayPtLatLon[1].x+arrayPtLatLon[0].x)/2;
		var mY = (arrayPtLatLon[1].y+arrayPtLatLon[0].y)/2;

		var dX = (arrayPtLatLon[1].x-arrayPtLatLon[0].x);
		var dY = (arrayPtLatLon[1].y-arrayPtLatLon[0].y);

		dX = dX / (2*Math.max(1,nZoom||1));
		dY = dY / (2*Math.max(1,nZoom||1));

		var szEnvelope = String(mY-dY) +","+
						 String(mX-dX) +","+
						 String(mY+dY) +","+
						 String(mX+dX);

		return szEnvelope;
	};

	ixmaps.getThemesString = function(){

		var szThemesJS  = ixmaps.htmlgui_getParamString().replace(/\"/gi,"'");
			szThemesJS += ixmaps.htmlgui_getFeaturesString().replace(/\"/gi,"'");
		szThemesJS = "";

		var szThemesA	  = this.embeddedSVG.window.map.Api.getMapThemeDefinitionStrings();
		for ( var i=0; i<szThemesA.length; i++){
			szThemesJS += szThemesA[i];
		}
		
		return szThemesJS;
	};
	ixmaps.htmlgui_getParamString = function(){

		var scaleParam = this.embeddedSVG.window.map.Api.getScaleParam();
		return "map.Api.setScaleParam("+JSON.stringify(scaleParam)+");";
	};
	ixmaps.htmlgui_getFeaturesString = function(){

		var szFeatures = this.embeddedSVG.window.map.Api.getMapFeatures()||"";

		// scan for doubles and keep only last one 
		// by creatating an object to reduce and remake the feature string form that

		var szFeaturesA = szFeatures.split(";");
		var d = {};
		for ( i=0; i<szFeaturesA.length; i++ ){
			var xA = szFeaturesA[i].split(":");
			d[xA[0]] = xA[1];
		}
		var szResult = "";
		for ( i in d ){
			szResult += i +":" + d[i] +";";
		}
		return "map.Api.setMapFeatures('"+szResult+"');";
	};
	ixmaps.getScaleParam = function(){

		return this.embeddedSVG.window.map.Api.getScaleParam();
	};
	ixmaps.getOptions = function(){

		var szFeatures = this.embeddedSVG.window.map.Api.getMapFeatures();
		if ( !szFeatures || szFeatures == "" ){
			return null;
		}
		// scan for doubles and keep only last one 
		// by creatating an object to reduce and remake the feature string form that

		var szFeaturesA = szFeatures.split(";");
		var result = {};
		for ( i=0; i<szFeaturesA.length; i++ ){
			var xA = szFeaturesA[i].split(":");
			result[xA[0]] = String(xA[1]);
		}
		return result;
	};

	ixmaps.getLayerSwitch = function(){

		var layerA = ixmaps.getLayer();

		var switchLayerObject = {};

		for ( a in layerA ){
			fOff = false;

			var sub = false;
			var layer = layerA[a];
			for ( c in layer.categoryA ){
				if ( c && (layer.categoryA[c].type != "single") && (layer.categoryA[c].legendname) ){
					sub = true;
				}
			}

			if ( sub ){
				for ( c in layerA[a].categoryA ){
					if ( layerA[a].categoryA[c].display == "none" )	{
						fOff = true;
					}
				}
				if ( fOff ){
					var offlist = [];
					var onlist = [];
					switchLayerObject[a] = {};
					for ( c in layerA[a].categoryA ){
						if ( layerA[a].categoryA[c].display == "none" )	{
							offlist.push(c);
						}else{
							onlist.push(c);
						}
					}
					if ( offlist.length < onlist.length ){
						switchLayerObject[a]["off"] = offlist;
					}else{
						switchLayerObject[a]["on"]  = onlist;
					}
				}
			}else{
				if ( layerA[a].szDisplay == "none" )	{
					switchLayerObject[a] = {"display":"none"};
				}
			}
		}
		return switchLayerObject;
	};

	ixmaps.getBookmarkString = function(nZoom){ 

		if ( !nZoom ){
			nZoom = 1;
		}

		var szBookMarkJS = "";

		// GR 24.11.2018 get loaded Map String 
		szBookMarkJS += ixmaps.getLoadedMapString();

		szBookMarkJS += ixmaps.htmlgui_getParamString().replace(/\"/gi,"'");
		szBookMarkJS += ixmaps.htmlgui_getFeaturesString().replace(/\"/gi,"'");

		var szEnvelope = this.getEnvelopeString(nZoom);

		// make executable SVG map API call
		szBookMarkJS += "map.Api.doZoomMapToGeoBounds("+szEnvelope+");";

		var center = this.htmlgui_getCenter();
		var zoom = this.htmlgui_getZoom();
		var szView = "["+center.lat+","+center.lng+"],"+ zoom;

		szBookMarkJS += "map.Api.doZoomMapToView("+szView+");";

		szBookMarkJS += this.getThemesString();

		return szBookMarkJS;
	};

	ixmaps.htmlgui_getAttributionString = function(){
		if ($("#attribution")){
			return $("#attribution").html();
		}
		return "";
	};

	ixmaps.htmlgui_loadBookmark = function(){

		try	{
			// get the bookmark
			var xxx = htmlgui_getCookie("test");
			// if bookmark includes map themes, clear map first
			if ( xxx.match(/newMapTheme/) ){
				this.clearAll();
			}
			// GR 05.09.2011 magick !!
			ixmaps.htmlgui_synchronizeMap(false,true);

			// execute bookmark, which are direct Javascript calls
			this.embeddedSVG.window.map.Api.executeJavascriptWithMessage(xxx,"-> Bookmark",100);
		}
		catch (e){
			try{
				ixmaps.embeddedSVG.window.map.Api.displayMessage("no bookmark found !",1000);
			}catch (e){
				alert("no bookmark found!");
			}
		}
	};
	
	ixmaps.storedBookmarkA = new Array(0);

	ixmaps.execBookmark = function(szBookmark,fClear){

		this.fBookmark = true;

		if ( !this.embeddedSVG || !this.embeddedSVG.window || !this.embeddedSVG.window.map.Api ){
			ixmaps.pushBookmark(szBookmark);
			return;
		}

		if ( !szBookmark || typeof(szBookmark) == "undefined" ){
			this.embeddedSVG.window.map.Api.displayMessage("Bookmark undefined",1000);
			return;
		}

		if ( fClear ){
			this.clearAll();
		}

		// execute bookmark, which are direct Javascript calls
		var bookmarkA = szBookmark.split("map.Api");
		for ( var i=0; i<bookmarkA.length; i++ ){
			//this.embeddedSVG.window.map.Api.executeJavascriptWithMessage(szBookmark,"...",100);
			this.embeddedSVG.window.map.Api.executeJavascriptWithMessage("map.Api"+bookmarkA[i],"...",100);
		}

	};

	ixmaps.pushBookmark = function(szBookmark){
		ixmaps.storedBookmarkA.push(szBookmark);
		setTimeout("ixmaps.popBookmark()",100);
	};
	ixmaps.popBookmark = function(){
		if ( !this.embeddedSVG ){
			setTimeout("ixmaps.popBookmark()",100);
			return;
		}
		if ( ixmaps.storedBookmarkA.length ){
			ixmaps.execBookmark(ixmaps.storedBookmarkA.pop());
			setTimeout("ixmaps.popBookmark()",100);
		}
	};
	ixmaps.isBookmark = function(){
		return this.fBookmark?true:false;
	}

	ixmaps.execScript = function(szScript,fClear){

		if ( !this.embeddedSVG || !this.embeddedSVG.window || !this.embeddedSVG.window.map.Api ){
			ixmaps.pushBookmark(szScript);
			return;
		}
		if ( fClear ){
			ixmaps.embeddedSVG.window.map.Api.clearAll();
			if ( szScript.match(/CHOROPLETH/) ){
				ixmaps.embeddedSVG.window.map.Api.clearAllChoropleth();
			}else{
				ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
			}
		}
		eval('ixmaps.embeddedSVG.window.'+szScript);
	};

	ixmaps.message = function(szMessage){
		ixmaps.htmlgui_displayInfo(szMessage);
	};
	
	// -----------------------------------------------------------
	// map bounds, zoom, pan, ...
	// -----------------------------------------------------------
	
	/**
	 * setBounds
	 * @param bounds array of 2 lat/lon pairs
	 * @return void
	 */
	ixmaps.setBounds = function(bounds){
		ixmaps.htmlgui_setBounds([{lat:bounds[0],lng:bounds[1]},{lat:bounds[2],lng:bounds[3]}]);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * setView
	 * @param center the new center of the view
	 * @param nZoom the new zoomfactor of the view
	 * @return void
	 */
	ixmaps.setView = function(center,nZoom){
		// GR 15.08.2018 call 2 times needed (magick)
		ixmaps.htmlgui_setCenterAndZoom({lat:center[0],lng:center[1]},nZoom);
		ixmaps.htmlgui_setCenterAndZoom({lat:center[0],lng:center[1]},nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * setCenter
	 * @param center the new center of the view
	 * @return void
	 */
	ixmaps.setCenter = function(center){
		ixmaps.htmlgui_setCenter({lat:center[0],lng:center[1]});
		ixmaps.htmlgui_synchronizeSVG(true);
		return ixmaps;
	};
	/**
	 * setZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.setZoom = function(nZoom){
		ixmaps.htmlgui_setZoom(nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * minZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.minZoom = function(nZoom){
		ixmaps.htmlgui_minZoom(nZoom);
		ixmaps.htmlgui_synchronizeSVG(false);
		return ixmaps;
	};
	/**
	 * getCenter
	 * @param void
	 * @return object
	 */
	ixmaps.getCenter = function(){
		return ixmaps.htmlgui_getCenter();
	};
	/**
	 * getZoom
	 * @param void
	 * @type int
	 * @return zoomfactor
	 */
	ixmaps.getZoom = function(){
		return ixmaps.htmlgui_getZoom();
	};
	/**
	 * getBoundingBox
	 * @param void
	 * @return object
	 */
	ixmaps.getBoundingBox = function(){
		return ixmaps.htmlgui_getBoundingBox();
	};
	/**
	 * getMapScale
	 * @param void
	 * @return Number
	 */
	ixmaps.getMapScale = function(){
		return ixmaps.embeddedSVG.window.map.Api.getMapScale();
	};



	// -----------------------------------------------------------
	// map layer handling
	// -----------------------------------------------------------
	
	/**
	 * get layer list
	 * @return array array of layer objects
	 */
	ixmaps.getLayer = function(){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayer();
		}
		catch (e){}
	};
	/**
	 * get layer dependency list
	 * @return array array of layer dependency objects
	 */
	ixmaps.getLayerDependency = function(){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayerDependency();
		}
		catch (e){}
	};
	/**
	 * get tile Info
	 * @return object map tile object
	 */
	ixmaps.getTileInfo = function(){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getTileInfo();
		}
		catch (e){}
	};
	/**
	 * switch layer
	 * @param szLayerName the name of the layer to switch visible/invisible
	 * @param fState true or false
	 * @return void
	 */
	ixmaps.switchLayer = function(szLayerName,fState){

		try {
			ixmaps.embeddedSVG.window.map.Api.switchLayer(szLayerName,fState);
		}
		catch (e){}
	};

	/**
	 * set map layer ON/OFF
	 * @param layerObject JSON object tha defines which layer to switch ON or OFF
	 * @return void
	 */
	ixmaps.setMapLayer = function(layerObject){

		try {
			ixmaps.embeddedSVG.window.map.Api.setMapLayer(JSON.stringify(layerObject));
		}
		catch (e){}
	};

	// -----------------------------
	// helper
	// -----------------------------

	htmlgui_getEmbeddedSVG = function(){
		return ixmaps.embeddedSVG;
	};

	// -----------------------------
	// D A T A    L O A D E R 
	// -----------------------------

	/**
	 * Is called by the svg map script to load external data from FusionTable, GeoRSS, GeoJson, ...
	 * @param szUrl where to find the data
	 * @param options description of the data source type
	 * @type void
	 */
	ixmaps.htmlgui_loadExternalData = function(szUrl,options){ 

		if ( (!szUrl || (szUrl === undefined)) && !(options.type === "ext") ){
			alert("htmlgui_loadExternalData: szUrl is 'undefined' !");
			return;
		}

		// GR 16.07.2017
		// if szUrl == type, than we have a javascript object 
		// set the javascript object with name = options.name as external data
		if ( szUrl && (szUrl == options.type) ){
			this.setExternalData(eval(options.name),options);
			return;
		}

		// GR 13.06.2014
		// check if we have a complete path, if not, add story root and maybe ".js"
		if ( options.ext && options.ext.length && !options.ext.match(/\//) ){
			var root = ixmaps.storyRoot || ixmaps.parentApi.storyRoot || ixmaps.parentApi.parentApi.storyRoot || "";
			options.ext = root + options.ext + (options.ext.match(/.js/)?"":".js");
			// set the complete ext path for further use
			options.theme.coTableExt = options.ext;
		}

		ixmaps.showLoadingArray(["loading data ..."," ... "]);

		// a) data is loaded by a specific data provider function
		// -------------------------------------------------------
		if ( options.type == "ext" ){
			$.getScript(options.ext)
				.done(function(script, textStatus) {

					options.setData = ixmaps.setExternalData;

					try {
						eval("ixmaps."+options.name+"(options.theme,options)");
					} catch (e){
						try {
							eval("ixmaps.parentApi."+options.name+"(options.theme,options)");
						}catch (e){
							try {
								eval("ixmaps.parentApi.parentApi."+options.name+"(options.theme,options)");
							}catch (e){
								try {
									eval("ixmaps.queryData(options.theme,options)");
								}catch (e){
								}
							}
						}
					}
				})
				.fail(function(jqxhr, settings, exception) {
				  alert("external data provider: '"+options.ext+"' could not be loaded !",2000);
				});
		}else{

		// b) data is loaded by data.js
		// -------------------------------------------------------
			$.getScript("../../../data.js/data.js")
			.done(function(script, textStatus) {

				var broker = new Data.Broker();
				broker.addSource(szUrl,options.type)
					  .error(	function(e) { 
						ixmaps.error("loading data error: "+e+"\n \n<span style='color:#ddd'>"+szUrl+"</span>"); 
						ixmaps.showLoadingArrayStop();
						ixmaps.hideLoading();
					})
					  .realize(	function(dataA) {

					ixmaps.showLoadingArrayStop();
					ixmaps.hideLoading();

					var themeDataObj = dataA[0];

					// if there is an ext data after processor defined, call it
					// --------------------------------------------------
					if ( typeof(options.ext) != "undefined" ){

						_LOG("get external data processor");

						$.getScript(options.ext)
						.done(function(script, textStatus) {
							var fError = 0;
							/**
							eval("var fu = ixmaps."+options.name+".after;");
							if ( fu ){
								try	{
									themeDataObj = fu(themeDataObj);
								} catch (e)	{
									alert(options.ext+":\nerror on executing\nixmaps." +options.name+ ".after() !");
								}
							}else{
								eval("var fu = ixmaps."+options.name+".process;");
								if ( fu ){
									try	{
										themeDataObj = fu(themeDataObj);
									} catch (e)	{
										alert(options.ext+":\nerror on executing\nixmaps." +options.process+ ".after() !");
									}
								}else{
									alert(options.ext+":\ndata processing functions\nixmaps." +options.name+ ".after or ixmaps."+options.name+ ".process\nnot found!");
								}
							}
							**/
							try {
								eval("themeDataObj = ixmaps."+options.name+".after(themeDataObj) || themeDataObj");
							} catch (e){
								try {
									eval("themeDataObj = ixmaps.parentApi."+options.name+".after(themeDataObj) || themeDataObj");
								}catch (e){
									try {
										eval("themeDataObj = ixmaps.parentApi.parentApi."+options.name+".after(themeDataObj) || themeDataObj");
									}catch (e){
										try {
											eval("themeDataObj = ixmaps."+options.name+".process(themeDataObj) || themeDataObj");
										} catch (e){
											try {
												eval("themeDataObj = ixmaps.parentApi."+options.name+".process(themeDataObj) || themeDataObj");
											}catch (e){
												try {
													eval("themeDataObj = ixmaps.parentApi.parentApi."+options.name+".process(themeDataObj) || themeDataObj");
												}catch (e){
													alert(options.ext+":\ndata processing functions\nixmaps." +options.name+ ".after or ixmaps."+options.name+ ".process\nnot found!");
												}
											}
										}
									}
								}
							}

							_LOG("set processed data");

							// set processed data
							// --------------------------------------------------
							ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null,themeDataObj,options.name);
						})
						.fail(function(jqxhr, settings, exception) {
							alert("'"+options.ext+"' could not be loaded !");
						});

					// no external processor file defined, so try to call internal processor and set data
					// -----------------------------------------------------------------------------------
					}else{
						try {
							eval("themeDataObj = ixmaps."+options.name+".process(themeDataObj) || themeDataObj");
						} catch (e){
							try {
								eval("themeDataObj = ixmaps.parentApi."+options.name+".process(themeDataObj) || themeDataObj");
							}catch (e){
								try {
									eval("themeDataObj = ixmaps.parentApi.parentApi."+options.name+".process(themeDataObj) || themeDataObj");
								}catch (e){
								}
							}
						}
						ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null,themeDataObj,options.name);
					}
				});
			})
			.fail(function(jqxhr, settings, exception) {
				alert("'"+options.type+"' unknown format !");
			});
		}
	};

	/**
	 * set theme data from data (javscript var) 
	 * @param {object} data the object containing data (see type)
	 * @param {object} opt optriobs to define the data
	 * @return void
	 * @example
	 * ixmaps.setExternalData(dataObject,{type:"json",name:"myData"});
	 */
	ixmaps.setExternalData = function(data,opt) {

		ixmaps.showLoadingArrayStop();
		ixmaps.hideLoading();

		if ( opt && opt.type && (opt.type != "jsonDB") && (opt.type != "dbtable") ){
			if ( (typeof(Data) != "undefined")  && Data.object ){
				// load the data using data.js
				Data.object({"source":data,"type":opt.type}).import(function(mydata){
					ixmaps.setExternalData(mydata,{type:"dbtable",name:opt.name});
				});
			}else{
				$.getScript("../../../data.js/data.js")
				.done(function(script, textStatus) {
					// load the data using data.js
					Data.object({"source":data,"type":opt.type}).import(function(mydata){
						ixmaps.setExternalData(mydata,{type:"dbtable",name:opt.name});
					});
				});
			}
		} else {
			ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null,data,opt.name);
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
	ixmaps.setData = function(data,opt) {
		this.setExternalData(data,opt);
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
	ixmaps.setLocalString = function(szOrig,szLocal){
		try {
			this.embeddedSVG.window.map.Api.setLocalString(szOrig,szLocal);
		}
		catch (e){}
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
	ixmaps.setLocal = function(szOrig,szLocal){
		try {
			this.embeddedSVG.window.map.Api.setLocalString(szOrig,szLocal);
		}
		catch (e){}
		return ixmaps;
	};

	/**
	 * set localize
	 * @param {Object} localizeObj the json object with the global/local string pairs
	 * @return void
	 * @example
	 * ixmaps.setLocalize({"creating charts":"...","loading data ...":"... caricando dati ..."});
	 */
	ixmaps.setLocalize = function(localizeObj){
		for ( g in localizeObj ) {
			ixmaps.setLocal(g,localizeObj[g]);
		}
	};

	/**
	 * load an ixmaps project    
	 * @param szUrl the relative or absolute URL of the ixmaps project file
	 * @type void
	 */
	ixmaps.xxloadProject = function(szUrl){

		$.get(szUrl, function(data){

			if ( typeof(data) == "string" ){
				ixmaps.setProject(data);
			}else{
				ixmaps.setProject(JSON.stringify(data));
			}

		}).fail(function(e) { 
			ixmaps.error('loading error with:'+szUrl);
		});

	};
	
	/**
	 * set an ixmaps project from JSON   
	 * @param project the JSON object to define the project
	 * @param szFlag optional switches to set only parts of a project
	 * @type void
	 */
	ixmaps.setProjectJSON = function(project,szFlag){ 

		szFlag = szFlag || "";

		if ( project ){
			// new project JSON format with metadata; recognizable by project.map.map 
			if ( project.map.map && !szFlag.match(/themeonly/i) ){
				var map = project.map;
				ixmaps.loadMap(map.map,function(){
					if ( map.center && map.zoom ){
						ixmaps.setView([map.center.lat,map.center.lng],map.zoom);
						ixmaps.setView([map.center.lat,map.center.lng],map.zoom);
					}
					try
					{
					ixmaps.setOptions(map.options);
					ixmaps.setScaleParam(map.scaleParam);
					ixmaps.setMapTypeId(map.basemap);
					ixmaps.setLocalize(map.localize);
					ixmaps.setMapLayer(project.layerMask);
					}
					catch (e)
					{
					}

					if ( project.themes ){
						for ( i in project.themes )	{
							ixmaps.newTheme("project",project.themes[i],(i == 0)?"clear":"");
						}
					}else
					if ( project.theme ){
						ixmaps.newTheme("project",project.theme,"clear");
					}else{
						setTimeout("ixmaps.hideLoading()",250);
					}
					// GR 29.08.2018 must force to show SVG layer
					// if not, it wasn't switched on sometimes 
					setTimeout("ixmaps.showAll();",1000);
				});
				if ( project.search ){
					ixmaps.search.szSearchSuffix = project.search;
				}
			}else
			// old project JSON format without 
			if ( project.map && !szFlag.match(/themeonly/i) ){
				ixmaps.loadMap(project.map,function(map){
					if ( project.center && project.zoom ){
						ixmaps.setView([project.center.lat,project.center.lng],project.zoom);
						ixmaps.setView([project.center.lat,project.center.lng],project.zoom);
					}
					try
					{
					ixmaps.setOptions(project.options);
					ixmaps.setScaleParam(project.scaleParam);
					ixmaps.setMapTypeId(project.basemap);
					ixmaps.setLocalize(project.localize);
					ixmaps.setMapLayer(project.layerMask);
					}
					catch (e)
					{
					}

					if ( project.themes ){
						for ( i in project.themes )	{
							ixmaps.newTheme("project",project.themes[i],(i == 0)?"clear":"");
						}
					}else
					if ( project.theme ){
						ixmaps.newTheme("project",project.theme,"clear");
					}else{
						setTimeout("ixmaps.hideLoading()",250);
					}
					// GR 29.08.2018 must force to show SVG layer
					// if not, it wasn't switched on sometimes 
					setTimeout("ixmaps.showAll();",1000);
				});
				if ( project.search ){
					ixmaps.search.szSearchSuffix = project.search;
				}
			}else
			if ( project.themes && !szFlag.match(/maponly/i) ){
				for ( i in project.themes )	{
					ixmaps.newTheme("project",project.themes[i],(i == 0)?"clear":"");
				}
			}else
			if ( project.theme && !szFlag.match(/maponly/i) ){
				ixmaps.newTheme("project",project.theme,"clear");
			}else{
				setTimeout("ixmaps.hideLoading()",250);
			}
		}

	};

	/**
	 * set an ixmaps project from json string  
	 * @param szProject the stringified project JSON
	 * @type void
	 */
	ixmaps.setProject = function(szProject){

		var project = null;
		try	{
			project = JSON.parse(szProject);
		} catch (e){
			ixmaps.error("Code: "+e);
		}

		if ( project ){
			ixmaps.setProjectJSON(project);
		}

	};

	/**
	 * load an ixmaps project    
	 * @param szUrl the relative or absolute URL of the ixmaps project file
	 * @type void
	 */
	ixmaps.loadProject = function(szUrl,szFlag){ 

		$.get(szUrl,
			function(data){

			var project = null;

			if ( typeof(data) == "string" ){
				try	{
					project = JSON.parse(data);
				} catch (e){
					ixmaps.error("Code: "+e);
				}
			}else{
				project = data;
			}

			szFlag = String(szFlag) || "";

			if ( project ){
				ixmaps.setProjectJSON(project,szFlag);
			}

		}).fail(function(e) { 
			ixmaps.error('loading error with:'+szUrl);
		});

	};

	/**
	 * get an ixmaps project (JSON) string  
	 * @type string
	 * @return a project definition string (JSON)
	 */
	ixmaps.getProjectString = function(){

		_LOG("make project definition string (JSON)");

		// get definitions of actual map
		//
		var szMapType	= ixmaps.getMapTypeId();
		var szMapUrl	= ixmaps.loadedMap||ixmaps.getMapUrl();
		var szStoryUrl	= ixmaps.getStoryUrl();
		var center		= ixmaps.getCenter();
		var zoom		= ixmaps.getZoom();
		var scaleParam	= ixmaps.getScaleParam();
		var options		= ixmaps.getOptions();
		var themesA		= ixmaps.getThemes();
		var layerObj	= ixmaps.getLayerSwitch();

		var szDate     = new Date().toString();
		var szParent   = ixmaps.parent || "";

		// get definitions actual theme(s)
		//
		szTheme =	ixmaps.getThemeDefinitionObj();
		var themeDefA = [];
		for ( i in themesA ){
			themeDefA.push(ixmaps.getThemeDefinitionObj(themesA[i].szId));
		}

		// make the project object (JSON)
		//
		var project = {};
		var map     = {};
		var metadata= {};

		metadata.title = "";
		metadata.snippet = "";
		metadata.descriptrion = "";
		metadata.thumbnail = "";
		metadata.about = "";

		project.metadata = metadata;

		map.map  = szMapUrl;
		map.basemap  = szMapType;
		map.scaleParam = scaleParam;
		map.options = options;
		map.center  = center;
		map.zoom  = zoom; 

		project.map = map;

		project.themes = themeDefA;
		project.layerMask = layerObj;

		console.log(project);
		console.log(JSON.stringify(project));

		// return the project object (JSON) as string !
		//
		return JSON.stringify(project)
	};
	

}(window, document));

// -----------------------------
// EOF
// -----------------------------

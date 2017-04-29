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
 * define namespace ixmaps
 */

(function( ixmaps, $, undefined ) {

	/* ------------------------------------------------------------------ * 
		global variables
	 * ------------------------------------------------------------------ */

	ixmaps.szUrlSVG					= null;
	ixmaps.helpWindow				= null;
	ixmaps.toolsWindow				= null;
	ixmaps.sidebar					= null;
	ixmaps.htmlMap					= null;

	ixmaps.location					= null;

	ixmaps.fMapLegendStyle			= "visible";
	ixmaps.fMapControlStyle			= "large";
	ixmaps.fMapSizeMode				= "fullscreen";
	ixmaps.blockLoadingMessage		= false;
	ixmaps.fSilent					= false;

	ixmaps.szCorsProxy 				= "";

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
	var __SVGmapWidth				= 0;			
	var __SVGmapHeight				= 0;

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
		var x = new Date();
		var time = x.getMinutes()+":"+String(x.getSeconds())+"."+String(x.getMilliseconds());
		console.log("_LOG: time["+time+"] "+szLog);

		// //var time = String(x.getSeconds()+(x.getMilliseconds()/1000));
		//var time = ((new Date()) - _log_start_time)/1000;
		//console.log("_LOG: time[sec.ms] "+time+" "+szLog);
	};

	/* ================================================================== * 
		Init functions
	 * ================================================================== */

	/**
	 * Create a new map instance.  
	 * @param szMapDiv the id of the div, where to create the SVG map
	 * @param options javascript object with the creation options
	 * @type object
	 * @return the new ixmaps object
	 */
	ixmaps.map = function(szMapDiv,options){

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

		this.options = options;

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
			this.HTML_showLoading();
			$("#loading-text").append(szError);
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

		this.szUrlSVG = szUrl;
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

		this.HTML_hideLoading();

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
			this.gmapDiv.setAttribute("onKeyDown","javascript:ixmaps.do_keydown(event);");
			this.gmapDiv.setAttribute("onKeyUp","javascript:ixmaps.do_keyup(event);");
			
			$(this.gmapDiv).css({'pointer-events':'all'	,
								 'position':'absolute'	,
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

			this.svgDiv.setAttribute("style","pointer-events:none;position:absolute;z-index:2;visibility:hidden;"+
				"top:"+__SVGmapPosY+"px;"+
				"left:"+__SVGmapPosX+"px;"+
				"width:100%;"+
				"height:100%;");

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

			if (this.szUrlSVG || $(this.szUrlSVG).assertStr()){

				this.HTML_loadSVGMap(this.szUrlSVG);

			}else{
				// if no map is given
				// we are ready here ----> fire onMapReady event !
				// -----------------------------------------------
				this.HTML_showLoading();
				$("#loading-text").append("no map");
				$("#loading-image").css("visibility","hidden");
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

		// register window resize event to adapt the map always to the window size
		// -----------------------------------------------------------------------
		__addEvent(window, "resize", function() { ixmaps.onWindowResize(null,false); } );

		setTimeout("ixmaps.onWindowResize(null,false)",100);

		return ixmaps;
	};

	/**
	 * on resize handler   
	 * @param mapBox an optinal boundigbox in screen coordinates
	 * @param fZoomTo parameter to pass to htmlgui_resizeMap()
	 * @param fCenter parameter to pass to htmlgui_resizeMap()
	 * @type void
	 */
	ixmaps.onWindowResize = function(mapBox,fZoomTo,fCenter){

		if (mapBox){
			__SVGmapOffX = mapBox.x;			
			__SVGmapOffY = mapBox.y;	
			__SVGmapWidth  = mapBox.width;			
			__SVGmapHeight = mapBox.height;			
		}else{
			if ( ixmaps.fMapSizeMode == "fix" ){
				return;
			}
			if ( $("#banner-right").position() ){
				__SVGmapPosY = $("#banner-right").position().top - parseInt($("#banner-right").parent().css("padding-top"));
				$("#banner").css("height","40px");
			}
			__SVGmapWidth  = window.innerWidth  - __mapLeft - __SVGmapPosX - __SVGmapOffX;			
			__SVGmapHeight = window.innerHeight - __mapTop  - __SVGmapPosY - __SVGmapOffY;			
		}
		
		if ($(this.gmapDiv)){
			$(this.gmapDiv).css({
				"top"	:(__SVGmapPosY+__SVGmapOffY)+"px",
				"left"	:(__SVGmapPosX+__SVGmapOffX)+"px",
				"width"	:(__SVGmapWidth)+"px",
				"height":(__SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($(this.svgDiv)){
			$(this.svgDiv).css({
				"top"	:(__SVGmapPosY)+"px",
				"left"	:(__SVGmapPosX)+"px",
				"width"	:(__SVGmapOffX+__SVGmapWidth)+"px",
				"height":(__SVGmapOffY+__SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#SVGMap")){
			$("#SVGMap").css({
				"width"	:(__SVGmapOffX+__SVGmapWidth)+"px",
				"height":(__SVGmapOffY+__SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#ixmap")){
			$("#ixmap").css({
				"width"	:(__SVGmapOffX+__SVGmapWidth)+"px",
				"height":(__SVGmapOffY+__SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}
		if ($("#dummy-split-container")){
			$("#dummy-split-container").css({
				"top"	:(__SVGmapPosY+__SVGmapOffY)+"px",
				"left"	:(__SVGmapPosX+__SVGmapOffX)+"px",
				"width"	:(__SVGmapWidth)+"px",
				"height":(__SVGmapHeight)+"px",
				"overflow":"hidden"
				});
		}

		htmlMap_setSize(__SVGmapWidth,__SVGmapHeight);

		this.htmlgui_resizeMap(fZoomTo,__SVGmapOffX+__SVGmapWidth,__SVGmapOffY+__SVGmapHeight,fCenter);

		try{
			this.htmlgui_onWindowResize();
		}
		catch (e){}
	};

	/**
	 * load an SVG map ino the map (embed) object    
	 * @param szUrl the relative or absolute URL of the SVG file
	 * @param szName a name to identify the map, usefull if we have more than one map in a HTML page
	 * @type void
	 */
	ixmaps.HTML_loadSVGMap = function(szUrl,szName){

		this.HTML_showLoading();
		if (ixmaps.embeddedSVG){
			this.mapTool("");
		}
		remove_popupTools();
		remove_popupHelp();

		$(this.svgDiv).css("visibility","visible");

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

		$("#loading-text").empty();
		$("#loading-text").append(szName?szName:" ... loading ...");

	};
	ixmaps.loadMapError = function(){
		alert("alert");
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

	// -----------------------------------
	// loading message 
	// -----------------------------------

	/**
	 * display the defined loading message
	 * @param szMessage the message text
	 * @type void
	 */
	ixmaps.HTML_showLoading = function(szMessage,fForce){

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
			if ( szMessage ){
				$("#loading-text").empty();
				$("#loading-text").append(szMessage);
			}

			ixmaps.blockLoadingMessage = true;

		}
		catch (e){
		}
	};
	ixmaps.HTML_hideLoading = function(){
		try{
			$("#loading-image").css("visibility","hidden");
			ixmaps.blockLoadingMessage = false;
		}
		catch (e){
		}
	};

	var __showLoadingArray = [];
	var __showLoadingArrayIndex = 0;
	var __showLoadingArrayTimeout = null;
	var __showLoadingArrayActive = false;

	ixmaps.HTML_showLoadingArray = function(szMessageA){
		__showLoadingArray = szMessageA;
		__showLoadingArrayActive = true;
		__showLoadingArrayIndex = 0;
		ixmaps.HTML_showLoadingArrayNext();
	};
	ixmaps.HTML_showLoadingArrayNext = function(){
		if ( !__showLoadingArrayActive ){
			return;
		}
		ixmaps.HTML_showLoading(__showLoadingArray[__showLoadingArrayIndex++]);
		__showLoadingArrayIndex = __showLoadingArrayIndex%(__showLoadingArray.length);
		__showLoadingArrayTimeout = setTimeout("ixmaps.HTML_showLoadingArrayNext()",1000);
	};
	ixmaps.HTML_showLoadingArrayStop = function(){
		__showLoadingArrayActive = false;
		clearTimeout(__showLoadingArrayTimeout);
	};

	// show/hide HTML User Interface
	// -----------------------------
	ixmaps.HTML_hideUi = function(){
		try{
			ixmaps.switchUi(false);
		}
		catch (e){}
	};
	ixmaps.HTML_showUi = function(){
		try{
			ixmaps.switchUi(true);
		}
		catch (e){}
	};

	// show/hide HTML map
	// ------------------

	ixmaps.HTML_showMap = function(){
		if ( this.fSVGInitializing ){
			return;
		}
		if ( this.gmapDiv && !this.gmap ){
			this.gmap = this.loadGMap(this.szMapService);
			this.htmlMap = true;
		}
		$(this.gmapDiv).css("visibility","visible");
		this.hideNorthArrow();
	};

	ixmaps.HTML_hideMap = function(){
		$(this.gmapDiv).css("visibility","hidden");
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

	// show/hide SVG map
	// ------------------
	ixmaps.HTML_toggleSVG = function(){
		if ( $(this.svgDiv).css("width") == (__SVGmapOffX+"px") ){
			$(this.svgDiv).css("width",(__SVGmapOffX+__SVGmapWidth)+"px");
		}else{
			$(this.svgDiv).css("width",(__SVGmapOffX)+"px");
		}
	};

	/** query HTML map visibility
	 */
	ixmaps.htmlgui_isHTMLMapVisible = function(){
		return ($(this.gmapDiv).css("visibility") == "visible");
	};



	/* ------------------------------------------------------------------ * 
		helper
	 * ------------------------------------------------------------------ */

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
	ixmaps.onDialogClose = null;
	ixmaps.beforeDialogTool = "";
	ixmaps.openDialog = function(event,szElement,szUrl,szTitle,szPosition,nMaxWidth,nMaxHeight,nOpacity){

		if ( typeof($("#"+szElement)[0]) != "undefined" ){
			if ( $("#"+szElement)[0].innerHTML.length > 10 ){
				$("#"+szElement)[0].innerHTML = "";
				$("#"+szElement).dialog( "destroy" );
				ixmaps.mapTool(ixmaps.beforeDialogTool);
				return;
			}
		}
		// GR 05.06.2014 restore input mode after dialog closed
		ixmaps.beforeDialogTool = ixmaps.getMapTool();

		var offsetLeft = null;
		var offsetTop  = null;
		if ( event && (typeof(event) != "undefined") ){
			if ( $(event.currentTarget) ){
				offsetLeft = $(event.currentTarget).offset().left + $(event.currentTarget).innerWidth();
				offsetTop  = $(event.currentTarget).offset().top  + $(event.currentTarget).innerHeight();
			}
		}

		var dialogWidth  = nMaxWidth?nMaxWidth:450;
		var dialogHeight = Math.min(__SVGmapHeight-30,nMaxHeight?nMaxHeight:__SVGmapHeight-30);

		var nPosition = [450,50];

		if ( !szPosition ){
			szPosition = "center";
		}

		if ( szPosition ){
			if ( szPosition == "left" ){
				nPosition = [0,50];
			}
			else
			if ( szPosition == "centerleft" ){
				nPosition = [50,50];
			}
			else
			if ( szPosition == "right" ){
				nPosition = [window.innerWidth-dialogWidth-50,50];
			}
			else
			if ( szPosition == "center" ){
				nPosition = [window.innerWidth/2-dialogWidth/2,50];
			}
			else
			if ( szPosition == "auto" && offsetLeft && offsetTop ){
				nPosition = [Math.max(10,offsetLeft-dialogWidth-5),offsetTop+10];
			}
			else
			if ( szPosition.match(/,/) ){
				var szValueA = szPosition.split(",");
				nPosition = [Number(szValueA[0]),Number(szValueA[1])];
			}
			else{
				nPosition = [window.innerWidth/2-dialogWidth/2,50];
			}
		}
		// GR 18.02.2014 limit width again
		if ( dialogWidth > window.innerWidth-nPosition[0] ){
			dialogWidth = Math.min(window.innerWidth-20,dialogWidth);
			// for 1 line dialogs add a line to avoid scrollbars
			dialogHeight += 26;
		}
		// if no spez. host element given, create randomone
		if ( typeof($("#"+szElement)[0]) == "undefined" ){
			if ( !szElement ){
				szElement = "dialog-"+String(Math.random()).substr(2,10);
			}
			var dialogDiv = document.createElement("div");
			dialogDiv.setAttribute("id",szElement);
			$("#dialog")[0].parentNode.appendChild(dialogDiv);
		}

		$("#"+szElement).css("visibility","visible");
	    $("#"+szElement).dialog({	draggable: true,
									resizable: true,
									    width: dialogWidth,
									   height: dialogHeight,
									    title: szTitle,
			                         position: nPosition,
								        close: function(event, ui) {
				$("#"+szElement)[0].innerHTML = "";
				$("#"+szElement).dialog("destroy");
				ixmaps.mapTool(ixmaps.beforeDialogTool);
				if (ixmaps.onDialogClose){
					ixmaps.onDialogClose();
				}
			}
			});
		// GR 18.02.2014 set correct height
		$("#"+szElement).parent().css("height",String(dialogHeight-60)+"px");
		// GR 13.10.2011 set opacity
		if (nOpacity){
			$("#"+szElement).parent().css("opacity",String(nOpacity));
		}
		// load content
		if ( typeof(szUrl) == "string" && szUrl.length ){
			$("#"+szElement)[0].innerHTML = 
				"<div overflow=\"auto\">"+
				"<iframe style=\"width:100%;height:"+(dialogHeight-60)+"px;\" id=\"dialogframe\" src=\""+szUrl+"\" frameborder=\"0\" marginwidth=\"0px\" />"+
				"</div>";
			}
		return 	$("#"+szElement)[0];
	};
	ixmaps.openSidebar = function(event,szElement,szUrl,szTitle,szPosition,nMinWidth,nMinHeight){
		if ( typeof($("#"+szElement)[0]) == "undefined" ){
			szElement = "dialog";
		}
		if ( ixmaps.sidebar ){
			$(ixmaps.sidebar).css("visibility","hidden");
			ixmaps.sidebar.innerHTML = "";
			ixmaps.sidebar = null;
			return;
		}
		$("#"+szElement).css({
			"visibility":"visible",	
			"position"	:"absolute",
			"top"		:"30px;",
			"left"		:"10px;",
			"z-index"	:"1000",
			"width"		:"370px",
			"height"	:(__SVGmapHeight-30) +"px",
			"background-color":"#fff",
			"border-right":"solid 1px #ddd",
			"border-bottom":"solid 1px #ddd"
		});
		if ( typeof(szUrl) == "string" && szUrl.length ){
			$("#"+szElement)[0].innerHTML = 
				"<div id=\"sidebarclosebutton\" style=\position:absolute;top:1px;left:370px;background-color:#fff;border-right:solid;border-bottom:solid;border-color:#ddd;border-width:1;\">" + 
				"<a style=\"font-family:verdana;font-size:16px;color:#888\" href=\"javascript:ixmaps.closeSidebar();\">&nbsp;x&nbsp;</a></div>" +
				//"<button type=\"button\" id=\"closetools\" style=\"position:absolute;top:6px;left:368px;background-color:#fff;height:23px;\"><label for=\"popuptools\"></label></button>" +
				"<iframe src=\""+szUrl+"\" width=\"100%\" height=\"100%\" frameborder=\"0\" marginwidth=\"0px\" />";

		}
		$( "#closetools" ).button({ icons:{primary:'ui-icon-close'}}).click(function(e){
							ixmaps.openSidebar(e,'dialog','','','auto',350,800);
							});
		ixmaps.sidebar = $("#"+szElement)[0];
	};
	ixmaps.closeSidebar = function(){
		if ( ixmaps.sidebar ){
			$(ixmaps.sidebar).css("visibility","hidden");
			ixmaps.sidebar.innerHTML = "";
			ixmaps.sidebar = null;
			return;
		}
	};
	ixmaps.openMegaBox = function(event,szElement,szUrl,szTitle){
		if ( typeof($("#"+szElement)[0]) == "undefined" ){
			return;
		}

		var dialogWidth   = Math.min(800,window.innerWidth*0.75);
		var dialogHeight  = Math.min(800,window.innerHeight*0.85);
		var nPosition = [window.innerWidth/2-dialogWidth/2,50];

		$("#velo").css({
			"visibility":"visible",
			"width":(__SVGmapOffX+__SVGmapWidth)+"px",
			"height":(__SVGmapHeight)-"px"
		});
		$("#"+szElement).css("visibility","visible");
	    $("#"+szElement).dialog({ width: dialogWidth, height: dialogHeight, title: szTitle, position:  nPosition, close: function(event, ui) {
			$("#velo").css("visibility","hidden");
			}
			});
		if ( typeof(szUrl) == "string" && szUrl.length ){
			$("#"+szElement)[0].innerHTML = 
				"<iframe src=\""+szUrl+"\" width=\"100%\" height=\"100%\" frameborder=\"0\" marginwidth=\"0px\" />";
			}	
	};

	/* ------------------------------------------------------------------ * 
		splitter - whipe SVG content over the HTML basemap
	 * ------------------------------------------------------------------ */

	var ___splitterMode = "div";
	var ___splitter = false;
	var ___splitterVisible = false;
	var ___splitterWidth = 0;
	ixmaps.toggleSplitter = function(){
		if ( !___splitter ){
			initSplitter();
			___splitter = true;
		}else{
			if ( ___splitterVisible ){
				$('#dummy-split-container').css("visibility","hidden");
				if ( ___splitterMode == "div" && this.svgDiv){
					$(this.svgDiv).css("width",(__SVGmapOffX+__SVGmapWidth)+"px");
				}else{
					ixmaps.clipLayer(null,(__SVGmapWidth));
				}
			}else{
				$('#dummy-split-container').css("visibility","visible");
				if ( ___splitterMode == "div" && this.svgDiv){
					$(this.svgDiv).css("width",(__SVGmapPosX+__SVGmapOffX+___splitterWidth)+"px");
				}else{
					ixmaps.clipLayer(null,(___splitterWidth));
				}
			}
		}
		___splitterVisible = ___splitterVisible?false:true;
	};
	ixmaps.removeSplitter = function(){
		if ( !___splitter ){
			return;
		}else{
			if ( ___splitterVisible ){
				$('#dummy-split-container').css("visibility","hidden");
				if ( ___splitterMode == "div" && this.svgDiv ){
					$(this.svgDiv).css("width",(__SVGmapOffX+__SVGmapWidth)+"px");
				}else{
					ixmaps.clipLayer(null,(__SVGmapWidth));
				}
			}
		}
		___splitterVisible = false;
	};
	function initSplitter(){
		var splitterDiv = document.createElement("div");
		splitterDiv.setAttribute("id","dummy-split-container");
		splitterDiv.setAttribute("style","position:absolute");
		splitterDiv.innerHTML  = "<div><img alt=\"before\" src=\"\" style=\"visibility:hidden\" width=\""+(__SVGmapWidth)+"px"+"\" height=\""+(__SVGmapHeight)+"px"+"\" /></div>";
		splitterDiv.innerHTML += "<div><img alt=\"after\" src=\"\" style=\"visibility:hidden\" /></div>";

		ixmaps.svgDiv.parentNode.insertBefore(splitterDiv,ixmaps.svgDiv.nextSibling);

		var splitterDiv = window.document.getElementById("dummy-split-container");
		if ($("#dummy-split-container")){
			$("#dummy-split-container").css({
				"top"	:(__SVGmapPosY+__SVGmapOffY)+"px",
				"left"	:(__SVGmapPosX+__SVGmapOffX)+"px",
				"width"	:(__SVGmapWidth)+"px",
				"height":(__SVGmapHeight)+"px"
			});
		}

		$('#dummy-split-container').beforeAfter({showFullLinks:false,
												 onReady:setSplitter,
												 onMove:setSplitter,
												 imagePath : '../../ui/libs/beforeafter/js/'});
	}
	function setSplitter(nWidth){
		___splitterWidth = nWidth;
		if ( ___splitterMode == "div" && ixmaps.svgDiv){
			$(ixmaps.svgDiv).css("width",(__SVGmapPosX+__SVGmapOffX+___splitterWidth)+"px");
		}else{
			ixmaps.clipLayer(null,(___splitterWidth));
		}
		/**
			var gmapDiv = window.document.getElementById("gmap");
			if (0 && gmapDiv){
				gmapDiv.style["width"] = (nWidth)+"px";
			}
		**/
	}

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
		if ( szMode == "pan"){
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

	ixmaps.newTheme = function(theme){alert("embed hi");
		try{
			ixmaps.embeddedSVG.window.map.Api.newMapTheme(theme.layer,theme.fields,theme.field100,theme.style,theme.title,theme.label);
		}catch (e){}
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
	ixmaps.clearAllChoroplethe = function(){
		try{
			ixmaps.embeddedSVG.window.map.Api.clearAllChoroplethe();
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

	// ----------------------------------------------------------------------
	// touch to mouse !!!
	// ----------------------------------------------------------------------

	ixmaps.simulateMouseDown = function(pos){
		var evt = ixmaps.embeddedSVG.window.document.createEvent("MouseEvents");
		var cb = ixmaps.embeddedSVG.window.document.getElementById("mapbackground:eventrect");

		evt.initMouseEvent("mousedown", true, false, this, 1, pos.x, pos.y, pos.x, pos.y, false,
                         false, false, false, 0, cb);
		cb.dispatchEvent(evt);
		evt.target = cb;
		ixmaps.embeddedSVG.window.map.Event.defaultMouseDown(evt);
	};
	ixmaps.simulateMouseMove = function(pos){
		var evt = ixmaps.embeddedSVG.window.document.createEvent("MouseEvents");
		var cb = ixmaps.embeddedSVG.window.document.getElementById("mapbackground:eventrect");

		evt.initMouseEvent("mousemove", true, false, this, 1, pos.x, pos.y, pos.x, pos.y, false,
                         false, false, false, 0, cb);
		cb.dispatchEvent(evt);
		evt.target = cb;
		ixmaps.embeddedSVG.window.map.Event.defaultMouseMove(evt);
	};
	ixmaps.simulateMouseUp = function(pos){
		var evt = ixmaps.embeddedSVG.window.document.createEvent("MouseEvents");

		evt.initMouseEvent("mouseup", true, false, window, 1, 0, 0, 0, 0, false,
                         false, false, false, 0, null);
		var cb = ixmaps.embeddedSVG.window.document.getElementById("mapbackground:eventrect");
		cb.dispatchEvent(evt);
		evt.target = cb;
		ixmaps.embeddedSVG.window.map.Event.defaultMouseUp(evt);
	};
	ixmaps.simulateClick = function(pos){
		var evt = ixmaps.embeddedSVG.window.document.createEvent("MouseEvents");

		evt.initMouseEvent("mouseover", true, false, window, 1, pos.x, pos.y, pos.x, pos.y, false,
                         false, false, false, 0, null);
		var cb = ixmaps.embeddedSVG.window.document.getElementById("mapobjects");
		cb.dispatchEvent(evt);
		evt.target = cb;
		ixmaps.embeddedSVG.window.map.Event.defaultMouseClick(evt);
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

		$("#loading-text").empty();
		$("#loading-text").append(this.embeddedSVG.window.map.Dictionary.getLocalText("... initializing ..."));

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

		//this.htmlgui_displayInfo("exit");

		// call user defined method on map ready
		// --------------------------------------------------------
		this.onMapReady(this.szName);
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

		$("#loading-text").empty();
		$("#loading-text").append(this.embeddedSVG.window.map.Dictionary.getLocalText("... initializing ..."));

		ixmaps.blockLoadingMessage = false;

		if ( this.htmlMap && this.gmapDiv ){
			ixmaps.HTML_showMap();
			setTimeout("$('#loading-text').empty()",1000);
		}
		else{
			var div = window.document.getElementById("svgmapdiv");
			if (div){
				try	{		div.style.setProperty("visibility","visible",null); }
				catch (e) { div.style["visibility"] = "visible";         	   }
			}
			setTimeout("ixmaps.HTML_hideLoading()",1000);
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

		// hide loding image 
		// --------------------------
		/**
		try{
			$("#divloading").css("visibility","hidden");
			$("#ixmap").css("background","#fff");
		}
		catch (e){
		}
		**/
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
		if ( this.fSilent ){
			this.embeddedSVG.window.map.Api.setMapFeatures('worksilent:true');
			this.embeddedSVG.window.map.Api.setMapFeatures('loadsilent:true');
		}

		// in case we have no user defined view in the initializing process, we must program a sync via timeout !
		setTimeout("ixmaps.htmlgui_checkSync()",1000);

	};

	/**
	 * called if SVG map has been resized (e.g. legend switched off)
	 * @return ---
	 */
	ixmaps.htmlgui_doMapResize = function(){

		// adapt the HTML map to the canvas offsets of the SVG map
		// --------------------------------------------------------
		try{
			var mapBox = this.embeddedSVG.window.map.Api.getMapBox();
			this.onWindowResize(mapBox,true);
		}
		catch (e){
		}
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
			this.onWindowResize(mapBox,false);
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
		ixmaps.parentApi.htmlgui_setScaleSelect(newScale);
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
	ixmaps.htmlgui_doDisplayInfo = function(szMessage){

		if ( szMessage && (szMessage.length > 25) ){
			szMessage = szMessage.slice(0,25)+" ...";
		}
		$("#loading-text").empty();
		$("#loading-text").append(szMessage);
		ixmaps.HTML_showLoading();
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
		$("#loading-text").empty();
		setTimeout("ixmaps.HTML_hideLoading()",1000);
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
		$("#loading-text").append(szMessage);

		alert(szMessage);
		return; 
		/**
		if (infoWindow){
			try{
				infoWindow.focus();
			}
			catch (e){
				infoWindow = null;
			}
		}
		if (!infoWindow){
			try{
				infoWindow = window.open("info.html","Info","dependent=yes,alwaysRaised=yes,'toolbar=0,scrollbars=0,location=0,statusbar=0,menubar=0,resizable=0,width=300,height=50,left=200,top=200");
			}
			catch (e){
			}
		}
		if (infoWindow){
			var dField = infoWindow.document.getElementById("infofield");
			dField.innerHTML = szMessage;
		}
		**/

	};
	/**
	 * foreward these events to an hosting window, if present
	 */

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
		ixmaps.parentApi.htmlgui_onNewTheme(szId);
	};

	ixmaps.htmlgui_onDrawTheme = function(szId){
		ixmaps.updatePageHistory();
		ixmaps.parentApi.htmlgui_onDrawTheme(szId);
	};

	ixmaps.htmlgui_onRemoveTheme = function(szId){
		ixmaps.parentApi.htmlgui_onRemoveTheme(szId);
	};

	ixmaps.htmlgui_onErrorTheme = function(szId){
		ixmaps.parentApi.htmlgui_onErrorTheme(szId);
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

	ixmaps.htmlgui_onZoomAndPan = function(nZoom){ 
		ixmaps.updatePageHistory(nZoom);
		try	{
			ixmaps.parentApi.onMapZoom(nZoom);
		}catch (e){}
		try	{
			ixmaps.parentApi.htmlgui_onZoomAndPan(nZoom);
		}catch (e){}
	};

	ixmaps.htmlgui_onWindowResize = function(){
		ixmaps.parentApi.htmlgui_onWindowResize();
	};

	// --------------------------------------------------
	// create bookmark by changing url in browser window
	// --------------------------------------------------

	ixmaps.fDynamicPageHistory = false;

	ixmaps.setDynamicPageHistory = function(fFlag){
		ixmaps.fDynamicPageHistory = fFlag;
	};

	ixmaps.updatePageHistory = function(nZoom,fFlag){ 

		if ( ixmaps.fDynamicPageHistory || fFlag ){

			// -----------------------------
			// change url in browser window
			// -----------------------------

			var szBookmark = ixmaps.htmlgui_getBookmarkString(nZoom);

			// dispatch to cross domain parent frames
			// --------------------------------------------------------
			try{
				this.onUrlChange(this.szName,szBookmark);
			}
			catch (e){
			}
			// bubble it up !
			try{
				this.parentApi.onUrlChange(this.szName,szBookmark);
			}
			catch (e){
			}

			// try to set URL for non cross domain frames
			w = window;
			while ( w && w.parent && (w != w.parent) ){
				w = w.parent;
			}

			var szUrl =  String(w.location.href);
			x = szUrl.match(/\?/);

			var szMapUrl    = this.htmlgui_getMapUrl();
			    szUrl =  w.location.href.split("bookmark")[0]+(x?"":"?");
				szUrl += "bookmark="+encodeURIComponent(szBookmark);
				szUrl += "&maptype="+ixmaps.htmlgui_getMapTypeId();
				szUrl += "&svggis="+encodeURI(szMapUrl);
				szUrl += "&center="+encodeURI(JSON.stringify(ixmaps.htmlgui_getCenter()));
				szUrl += "&zoom="+encodeURI(ixmaps.htmlgui_getZoom());

			w.history.replaceState({"foo":"bar"}, "page 2", szUrl);

			this.embeddedSVG.window.map.Api.displayMessage("Bookmark saved !",1000,"notify");

		}
	};

	// -----------------------------
	// html bookmark handler
	// -----------------------------

	ixmaps.dispatch = function(szUrl){

		// case a) localhost
		if ( 0 && String(ixmaps.location).match(/localhost/) ){
			return "../../" + szUrl;
		}

		// case b) 'real' URL
		// look for 'ui' in path and set the part before as root
		var szRoot = String(ixmaps.location);
		var szRootUrlA = szRoot.split('/');
		while ( szRootUrlA.length ){
			if ( szRootUrlA.pop() == "ui" ){
				break;
			}
		}
		szRoot = szRootUrlA.join('/');
		return szRoot+ "/" + szUrl;

		/** GR 01.02.2014 commented
		var szHost = "http://"+$(location).attr('host');
		return szHost+ "/" + szUrl;
		**/
	};

	ixmaps.getBaseMapParameter = function(szMapService){
		if ( szMapService == "leaflet" ){
			return "&basemap=ll";
		}else
		if ( szMapService == "openlayers" ){
			return "&basemap=ol";
		}else
		if ( szMapService == "microsoft" ){
			return "&basemap=bg";
		}else{
			return "&basemap=go";
		}
	};
	ixmaps.shareMap = function(target,position){
		this.openDialog(null,'share-dialog',"share.html",'share map',position||'auto',500,550);
	};

	ixmaps.exportMap = function(target,position){
		window.szMapTypeId = ixmaps.htmlgui_getMapTypeId();
		window.DOMViewerObj = ixmaps.embeddedSVG.window.document;
		this.openDialog(null,'export-dialog',"export.html",'export map',position||'auto',500,150);
	};

	ixmaps.viewTable = function(target,position){
		this.openDialog(null,'table-dialog',"table.html",'data table',position||'auto',800,600);
	};

	ixmaps.popupBookmarks = function(position){
		this.openDialog(null,'bookmarks','./history.html','Bookmarks',position||'10,103',250,450);
	};

	ixmaps.popupThemeEditor = function(position){
		window.idialog = this.openDialog(null,'themeeditor','./theme_editor.html','Theme Editor',position||'10,103',380,600);
	};

	ixmaps.fullScreenMap = function(szTemplateUrl){

		var szMapService = this.szMapService;
		var szMapUrl    = this.htmlgui_getMapUrl();
		var szMapType   = this.htmlgui_getMapTypeId();
		var szStoryUrl  = this.htmlgui_getStoryUrl();

		// get envelope 
		var szEnvelope = this.htmlgui_getEnvelopeString(1);
		// get all themes
		var szThemesJS = this.htmlgui_getThemesString();
		// compose bookmark
		var szBookmark = "map.Api.doZoomMapToGeoBounds("+szEnvelope+");" + "map.Api.clearAll();" + szThemesJS;

		// make url of the map template 
		if ( !szTemplateUrl ){
			szTemplateUrl = ixmaps.dispatch("ui/dispatch.htm?ui=popout&minimal=1&toolbutton=1&logo=1");
		}
		szTemplateUrl += ixmaps.getBaseMapParameter(szMapService);
		// create complete url with query string 
		var szUrl = szTemplateUrl;
		szUrl += szMapUrl?  ("&svggis="		+ encodeURI(szMapUrl))		:"";
		szUrl += szMapType? ("&maptype="	+ szMapType)				:"";
		szUrl += szStoryUrl?("&story="		+ szStoryUrl)					:"";
		szUrl += szBookmark?("&bookmark="	+ encodeURI(szBookmark))	:"";

		window.open(szUrl,'map fullscreen'+Math.random());
	};

	ixmaps.popOutMap = function(fFlag,szTemplateUrl){

		var szMapService = this.szMapService;
		var szMapType    = this.htmlgui_getMapTypeId();
		var szMapUrl     = this.htmlgui_getMapUrl();

		// get envelope with zoom factor 3 because the popout window is smaller than the map window
		var szEnvelope = this.htmlgui_getEnvelopeString(3);
		// get all themes
		var szThemesJS = this.htmlgui_getThemesString();
		// compose bookmark
		var szBookmark = "map.Api.doZoomMapToGeoBounds("+szEnvelope+");" + "map.Api.clearAll();" + szThemesJS;
		
		// make url of the map template 
		if ( !szTemplateUrl ){
			szTemplateUrl = ixmaps.dispatch("ui/dispatch.htm?ui=popout&minimal=1&toolbutton=1&logo=1");
		}
		szTemplateUrl += ixmaps.getBaseMapParameter(szMapService);

		// create complete url with query string 
		var szUrl = szTemplateUrl;
		szUrl += "&svggis=" + encodeURI(szMapUrl);
		szUrl += "&maptype=" + szMapType;
		szUrl += "&bookmark=" + encodeURI(szBookmark);

		// alternative store map parameter for child window access
		ixmaps.popoutURL		= szTemplateUrl;
		ixmaps.popoutSVGGIS		= szMapUrl;
		ixmaps.popoutTYPE		= szMapType;
		ixmaps.popoutBOOKMARK	= szBookmark;

		// here we can decide which mode of parameter passing we want (with query string or through ixmaps properties)
		var szPopOutUrl = szUrl;

		if ( !fFlag.match(/window/) ){
			this.openDialog(null,null,szPopOutUrl,'','auto',400,450);
		}
		if ( !fFlag.match(/dialog/) ){
			window.open(szPopOutUrl,'map popout'+Math.random(), 'alwaysRaised=yes, titlebar=no, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=400, height=450');
		}
	};
	ixmaps.mailMap = function(fFlag,szTemplateUrl){

		var szMapService = this.szMapService;
		var szMapUrl	 = this.htmlgui_getMapUrl();
		var szMapType    = this.htmlgui_getMapTypeId();
		// get envelope 
		var szEnvelope = this.htmlgui_getEnvelopeString(1);
		// get all themes
		var szThemesJS = this.htmlgui_getThemesString();
		// compose bookmark
		var szBookmark = "map.Api.doZoomMapToGeoBounds("+szEnvelope+");"+szThemesJS;

		var szHost = ""; //"http://"+$(location).attr('host');

		// make url of the map template 
		if ( !szTemplateUrl ){
			szTemplateUrl = ixmaps.dispatch("ui/dispatch.htm?ui=full");
		}
		szTemplateUrl += ixmaps.getBaseMapParameter(szMapService);

		// create complete url with query string 
		var szUrl = szHost + szTemplateUrl;
		szUrl += "&svggis=" + encodeURI(szMapUrl);
		szUrl += "&maptype=" + szMapType;
		szUrl += "&bookmark=" + encodeURIComponent(szBookmark);

		var szSubject = "iXmaps - map link sent by user";		
		var szBody    = "This email was sent to you by a user of iXmaps:\n\n"+
						"The below link will open an interactive SVG map in HTML5 enabled browser (Chrome, Firefox and Safari):\n\n";		
		var szBody2   = "\n\n(the link may be long because it contains zoom and charting parameter)\n";		
		location.href='mailto:?subject='+szSubject+'&body='+encodeURI(szBody)+encodeURIComponent(szUrl)+encodeURI(szBody2)+'';
	};

	ixmaps.htmlgui_getMapUrl = function(){
		return decodeURI(ixmaps.szUrlSVG);
	};
	ixmaps.htmlgui_getStoryUrl = function(){
		return decodeURI( $(document).getUrlParam('story')					||
						  $(window.parent.document).getUrlParam('story')	||
						  $(window.parent.parent.document).getUrlParam('story') );
	};
	ixmaps.htmlgui_getMapTypeId = function(){
		return htmlMap_getMapTypeId();
	};
	ixmaps.htmlgui_setMapTypeId = function(szId){
		if ( szId != htmlMap_getMapTypeId() ){
			ixmaps.htmlgui_setMapTypeBG(szId);
			return htmlMap_setMapTypeId(szId);
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

		$("#css-modifier-container").remove();

		if ( szId.match(/dark/i) || szId.match(/black/i) ){
			$("#ixmap").css({"background":"black"});
			$("#gmap").css({"background":"black"});

			$( "#switchlegendbutton" ).css("background-color","#222222");
			$( "#switchlegendbutton" ).css("border-color","#666666");

			//$( "#switchmodebutton" ).css("background-color","#888888");
			//$( "#switchmodebutton" ).css("border-color","#666666");

			changeCss(".ui-dialog", "opacity:0.9" );
			changeCss(".ui-dialog", "background:#222" );
			changeCss(".ui-dialog-titlebar", "background:#222" );
			changeCss(".ui-dialog-titlebar", "color:#888" );
			changeCss(".legend-description", "color:#888" );
			changeCss("tr.theme-legend-item-selected", "background:#333" );

			changeCss("span.theme-button", "background:none" );
			changeCss("span.theme-button", "color:white" );
			changeCss("span.legend-button-settings", "color:#333333" );

			changeCss(".btn-default","background-color:#444444");

			$(".leaflet-bar a").css("opacity","0.7" );
			$(".leaflet-bar a").css("background-color","#333333" );
			$(".leaflet-bar a").css("color","#888888" );
			$(".leaflet-bar a").css("border","solid #888888 0.5px" );


		}else if ( szId.match(/gray/i) ){
			$("#ixmap").css({"background":"#E6E6E6"});
			$("#gmap").css({"background":"#E6E6E6"});
			$( "#switchlegendbutton" ).css("background-color","#E6E6E6");
			$( "#switchlegendbutton" ).css("border-color","#dddddd");
		}else{
			$("#ixmap").css({"background":"white"});
			$("#gmap").css({"background":"white"});
			$( "#switchlegendbutton" ).css("background-color","#ffffff");
			$( "#switchlegendbutton" ).css("border-color","#dddddd");
		}
		// bubble it up !
		try{
			this.parentApi.htmlgui_setMapTypeBG(szId);
		}
		catch (e){
		}
	};

	ixmaps.htmlgui_saveBookmark = function(){
		ixmaps.htmlgui_doSaveBookmark();
//		ixmaps.openDialog('dialog','../../resources/html/help/help.html','?');
	};
	ixmaps.htmlgui_doSaveBookmark = function(szName){

		var szBookMarkJS = this.htmlgui_getBookmarkString();

		htmlgui_setCookie("test", szBookMarkJS);
		this.embeddedSVG.window.map.Api.displayMessage("Bookmark saved",1000);
	};

	ixmaps.htmlgui_getEnvelopeString = function(nZoom){

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

	ixmaps.htmlgui_getThemesString = function(){

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

		var szFeatures = this.embeddedSVG.window.map.Api.getMapFeatures();

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

	ixmaps.htmlgui_getBookmarkString = function(nZoom){

		if ( !nZoom ){
			nZoom = 1;
		}

		var szBookMarkJS = "";

		szBookMarkJS += ixmaps.htmlgui_getParamString().replace(/\"/gi,"'");
		szBookMarkJS += ixmaps.htmlgui_getFeaturesString().replace(/\"/gi,"'");

		var szEnvelope = this.htmlgui_getEnvelopeString(nZoom);

		// make executable SVG map API call
		szBookMarkJS += "map.Api.doZoomMapToGeoBounds("+szEnvelope+");";

		var center = this.htmlgui_getCenter();
		var zoom = this.htmlgui_getZoom();
		var szView = "["+center.lat+","+center.lng+"],"+ zoom;

		szBookMarkJS += "map.Api.doZoomMapToView("+szView+");";

		szBookMarkJS += this.htmlgui_getThemesString();

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

//			// force HTML map synchronisation 
//			setTimeout('ixmaps.htmlgui_synchronizeMap(false,true);',100);
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

		// force HTML map synchronisation 
		if ( 0 && szBookmark.match(/doCenterMapToGeoBounds/) ){
			this.HTML_hideMap();
			setTimeout('ixmaps.htmlgui_synchronizeMap(false,true);',1000);
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
			if ( szScript.match(/CHOROPLETHE/) ){
				ixmaps.embeddedSVG.window.map.Api.clearAllChoroplethe();
			}else{
				ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
			}
		}
		eval('ixmaps.embeddedSVG.window.'+szScript);
	};


	ixmaps.message = function(szMessage){
		ixmaps.htmlgui_displayInfo(szMessage);
	};
	
	/**
	 * setBounds
	 * @param bounds the new geo bounds with; array of 4 coordinates
	 * @return void
	 */
	ixmaps.setBoundsXXX = function(bounds){alert("noooo");
		ixmaps.embeddedSVG.window.map.Api.doSetMapToGeoBounds(
			bounds[0],
			bounds[1],
			bounds[2],
			bounds[3]);
	};
	/**
	 * setBounds
	 * @param bounds array of 2 lat/lon pairs
	 * @return void
	 */
	ixmaps.setBounds = function(bounds){
		ixmaps.htmlgui_setBounds([{lat:bounds[0],lng:bounds[1]},{lat:bounds[2],lng:bounds[3]}]);
		htmlgui_synchronizeSVG(false);
	};
	/**
	 * setView
	 * @param center the new center of the view
	 * @param nZoom the new zoomfactor of the view
	 * @return void
	 */
	ixmaps.setView = function(center,nZoom){
		ixmaps.htmlgui_setCenterAndZoom({lat:center[0],lng:center[1]},nZoom);
		htmlgui_synchronizeSVG(false);
	};
	/**
	 * setCenter
	 * @param center the new center of the view
	 * @return void
	 */
	ixmaps.setCenter = function(center){
		ixmaps.htmlgui_setCenter({lat:center[0],lng:center[1]});
		htmlgui_synchronizeSVG(true);
	};
	/**
	 * setZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.setZoom = function(nZoom){
		ixmaps.htmlgui_setZoom(nZoom);
		htmlgui_synchronizeSVG(false);
	};
	/**
	 * minZoom
	 * @param nZoom the zoomfactor of the view
	 * @return void
	 */
	ixmaps.minZoom = function(nZoom){
		ixmaps.htmlgui_minZoom(nZoom);
		htmlgui_synchronizeSVG(false);
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

	// -----------------------------
	// popup window handler
	// -----------------------------

	popupTools = function(szUrl){
			if (ixmaps.toolsWindow){
				try{
					ixmaps.toolsWindow.focus();
				}
				catch (e){
					ixmaps.toolsWindow = null;
				}
			}
			if (!ixmaps.toolsWindow || ixmaps.toolsWindow.closed){
				if ( szUrl == null || szUrl.length < 2 ){
					szUrl = "../../../resources/html/popupresult.html";
				}
	//			ixmaps.toolsWindow = window.open(szUrl,"test","dependent=yes,alwaysRaised=yes,titlebar=no,width=400,height=500,resizable=yes,screenX=200,screenY=100");
				ixmaps.toolsWindow = window.open(szUrl,"test",
					"dependent=yes,alwaysRaised=yes,addressbar=no,titlebar=no,width=400,height=600,resizable=yes,screenX=200,screenY=100");
			}
	};
	remove_popupTools = function(){
			if ( ixmaps.toolsWindow ){
				ixmaps.toolsWindow.close();
			}
	};

	popupResult = function(szUrl){
			if (resultWindow){
				try{
					resultWindow.focus();
				}
				catch (e){
					resultWindow = null;
				}
			}
			if (!resultWindow){
				if ( szUrl == null || szUrl.length < 2 ){
					szUrl = "../../../resources/html/popupresult.html";
				}
				resultWindow = window.open(szUrl,"test","dependent=yes,alwaysRaised=yes,titlebar=no,width=400,height=500,resizable=yes,screenX=200,screenY=100");
			}
	};
	remove_popupHelp = function(){
			if ( ixmaps.helpWindow ){
				ixmaps.helpWindow.close();
			}
	};

	popupHelp = function(szUrl){
			if (ixmaps.helpWindow){
				try{
					ixmaps.helpWindow.focus();
				}
				catch (e){
					ixmaps.helpWindow = null;
				}
			}
			if (!ixmaps.helpWindow){
				if ( szUrl == null || szUrl.length < 2 ){
					szUrl = "../html/help/help.html";
				}
				ixmaps.helpWindow = window.open(szUrl,"test","dependent=yes,alwaysRaised=yes,width=600,height=700,resizable=yes,scrollbars=yes");
			}
	};

	function htmlgui_contextualSearch(szField){
		if (typeof(contextualSearch) != "undefined" ){
			contextualSearch(szField);
		}
		else{
			popupTools('popup.html');
			setTimeout("ixmaps.toolsWindow.contextualSearch('"+szField+"')",10);
		}
	}
	function htmlgui_showContextInfo(){
		try{
			var szId = ixmaps.embeddedSVG.window.map.Event.getContextMenuObjId();
			ixmaps.embeddedSVG.window.map.Api.displayContextMenuTargetInfo();
		}
		catch(e){
			alert("map api error!");
		}
	}
	function htmlgui_createContextBuffer(){
		try{
			var szId = ixmaps.embeddedSVG.window.map.Event.getContextMenuObjId();
			ixmaps.embeddedSVG.window.map.Api.createContextMenuTargetBuffer();
		}
		catch(e){
			alert("map api error!");
		}
	}

	// -----------------------------
	// helper
	// -----------------------------

	htmlgui_getEmbeddedSVG = function(){
		return ixmaps.embeddedSVG;
	};

	_HTML_TRACE = function(szMessage){
		if ( typeof(console) != "undefined"  && typeof(console.log) != "undefined"  ){
			console.log("_TRACE:"+szMessage);
		}
	};

	// -----------------------------
	// mouse wheel interception
	// -----------------------------

	/** This is high-level function; REPLACE IT WITH YOUR CODE.
	 * It must react to delta being more/less than zero.
	 */
	function handle(delta) {

		// GR 03.06.2014 if there is a map service basemap, do it with her api (safe!) 
		if ( ixmaps.gmap && ixmaps.htmlMap ){
			var nZoom = htmlMap_getZoom();
			htmlMap_setZoom(nZoom+(delta>0?1:-1));
			return;
		}

		if (delta < 0){
			ixmaps.embeddedSVG.window.map.Api.doZoomMap(0.66);
			/* something. */
		}else{
			ixmaps.embeddedSVG.window.map.Api.doZoomMap(1.5);
			/* something. */
		}
		ixmaps.htmlgui_synchronizeMap(false,true);
	}

	function wheel(event){
		var delta = 0;
		if (!event){
			event = window.event;
		}
		if (event.wheelDelta) {
			delta = event.wheelDelta/120; 
			if (window.opera){
				delta = -delta;
			}
		} else if (event.detail) {
			delta = -event.detail/3;
		}
		if (delta){
			handle(delta);
		}
		if (event.preventDefault){
			event.preventDefault();
		}
		event.returnValue = false;
	}

	// make public
	ixmaps.do_wheelEvent = function(event){
		wheel(event);
	};
	// -----------------------------
	// D A T A    L O A D E R 
	// -----------------------------

	/**
	 * Is called by the svg map script to load external data from FusionTable, GeoRSS, GeoJson, ...
	 * @param szUrl where to find the data
	 * @param option description of the data source type
	 * @type void
	 */
	ixmaps.htmlgui_loadExternalData = function(szUrl,option){ 

		// GR 13.06.2014
		// check if we have a complete path, if not, add story root and maybe ".js"
		if ( option.ext && option.ext.length && !option.ext.match(/\//) ){
			var root = ixmaps.storyRoot || ixmaps.parentApi.storyRoot || ixmaps.parentApi.parentApi.storyRoot || "";
			option.ext = root + option.ext + (option.ext.match(/.js/)?"":".js");
			// set the complete ext path for further use
			option.theme.coTableExt = option.ext;
		}
		ixmaps.HTML_showLoadingArray(["loading data ..."," ... "]);

		if ( option.type == "ext" ){
			$.getScript(option.ext)
				.done(function(script, textStatus) {
				  __createThemeDataObjectExt(null,option.type,option);
				})
				.fail(function(jqxhr, settings, exception) {
				  alert("external data provider: '"+option.ext+"' could not be loaded !",2000);
				});
		}else
		if ( option.type == "FT" ){
			var options = {packages: ['corechart'], callback : function() {
								__doFTImport(szUrl,option);
							}};
			google.load('visualization', '1', options);
		}else
		if ( option.type == "FTV1" ){
			__doFTImportNew(szUrl,option);
		}else
		if ( (option.type == "csv") || (option.type == "CSV") ){
			__doCSVImport(szUrl,option);
		}else
		if ( (option.type == "json") || (option.type == "JSON") || (option.type == "Json")){
			__doJSONImport(szUrl,option);
		}else
		if ( (option.type == "jsonDB") || (option.type == "JSONDB") || (option.type == "JsonDB") || (option.type == "jsondb") ){
			__doJsonDBImport(szUrl,option);
		}else
		if ( (option.type == "jsonstat") || (option.type == "JSONSTAT") ){
			$.getScript("http://json-stat.org/lib/json-stat.js")
			.done(function(script, textStatus) {
			  __doLoadJSONstat(szUrl,option);
			  return;
			})
			.fail(function(jqxhr, settings, exception) {
			  ixmaps.htmlgui_displayInfo("'"+option.type+"' unknown format !",2000);
			});
		}else{
			ixmaps.htmlgui_displayInfo("'"+option.type+"' unknown format !",2000);
			setTimeout("ixmaps.htmlgui_killInfo();",3000);
		}
	};
	/**
	 * loadExternalData - wrapper for user calls
	 * @param szMap the name of the embedded map
	 * @param szThemeName the theme id string
	 * @param szSourceName a (xml) theme definituion file 
	 * @return a theme to pass to execScript/execBookmark
	 */
	ixmaps.loadExternalData = function(szMap,szUrl,opt){
		this.htmlgui_loadExternalData(szUrl,opt);
	};

	/**
	 * doFTImport  
	 * reads from Google Fusion Table 
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	function __doFTImport(ftId,opt) {

       // Construct query
        var query = "SELECT * FROM " + ftId;
        var queryText = encodeURIComponent(query);
        var gvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

        // Send query and draw table with data in response
        gvizQuery.send(function(response) {

			var numRows = response.getDataTable().getNumberOfRows();
			var numCols = response.getDataTable().getNumberOfColumns();

			var newData = new Array();

			var newRow = new Array();
			for (var i = 0; i < numCols; i++) {
				newRow.push(response.getDataTable().getColumnLabel(i));
			}
			newData.push(newRow);

			for (var i = 0; i < numRows; i++) {
				newRow = new Array();
				for(var j = 0; j < numCols; j++) {
					newRow.push(response.getDataTable().getValue(i, j));
				}
				newData.push(newRow);
			}
			// user defined callback
			if ( opt.callback ){
				opt.callback(newData,opt);
				return;
			}
			// called by a theme 
			__createThemeDataObject(newData,opt.type,opt);
       });
	}
	/**
	 * doFTImportNew 
	 * reads from Google Fusion Table using API V1 (requires API key !)
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	function __doFTImportNew(ftId,opt) {

		var szKey = "AIzaSyDvly_8Nx4wPF-Otful4IdGVEvjNJdPl5M";
		var szFT  = "https://www.googleapis.com/fusiontables/v1/query?";

		// Construct query
        var szUrl = szFT + "sql=SELECT * FROM " + ftId + "&key=" + szKey;

		$.getJSON(szUrl,function( data, textStatus, jqxhr ) {

			var newData = new Array();

			newData.push(data.columns);
			for (var i = 0; i < data.rows.length; i++) {
				newData.push(data.rows[i]);
			}
			// user defined callback
			if ( opt.callback ){
				opt.callback(newData,opt);
				return;
			}
			// called by a theme 
			__createThemeDataObject(newData,opt.type,opt);
		});
	}

	/**
	 * doLoadJSONstat 
	 * reads JSONstat format using JSONstat Javascript
	 * parses the data into the map data source
	 * @param szUrl JSONstat URL
	 * @param opt options
	 * @type void
	 */
	function __doLoadJSONstat(szUrl,opt) {

		if ( !szUrl.match(/http:/) ){
			var szPathA = ixmaps.embeddedApi.editor.szExternalDataPath.split('/');
			szPathA = szPathA.slice(1);
			szUrl = szPathA.join('/') + "jsonstat/" + szUrl;
		}
		JSONstat( szUrl, 
			function(){
				var dataA = new Array();
				
				// here we must ask for what dimension to use 
				// TBD

				// for now we take dimension 0 and 1
				// 0 for the y axis = first column
				// 1 for the x axis = values columns

				// first row = column names
				//
				var row = [this.Dataset(0).Dimension(0).label];
				var index = this.Dataset(0).Dimension(1).id;
				for ( i=0; i<index.length; i++ ){
					row.push(this.Dataset(0).Dimension(1).Category(index[i]).label);
				}
				dataA.push(row);

				// data rows
				//
				for (var i=0; i<this.Dataset(0).Dimension(0).length; i++ ){
					var row = new Array();
					row.push(this.Dataset(0).Dimension(0).Category(this.Dataset(0).Dimension(0).id[i]).label);
					for (var ii=0; ii<this.Dataset(0).Dimension(1).length; ii++ ){
						row.push(this.Dataset(0).Data([i,ii]).value);
					}
						dataA.push(row);
				}
				// user defined callback
				if ( opt.callback ){
					opt.callback(dataA,opt);
					return;
				}else
				// called by a theme 
				{
					__createThemeDataObject(dataA,opt.type,opt);
				}
			}
		);
	}

	/**
	 * doJsonDBImport 
	 * reads JsonDB files from URL
	 * JsonDB files are regural JavaScript files, the data object is parsed automatically on load 
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	function __doJsonDBImport(szUrl,opt) {

		_LOG("__doJsonDBImport: "+szUrl);

		opt.url = szUrl;

		$.getScript(szUrl+".gz")
			.done(function(script, textStatus) {
			  __processJsonDBData(script,opt);
			})
			.fail(function(jqxhr, settings, exception) {
				$.getScript(szUrl)
				.done(function(script, textStatus) {
				  __processJsonDBData(script,opt);
				})
				.fail(function(jqxhr, settings, exception) {
				  alert("external data (JsonDB) '"+szUrl+"' could not be loaded ! \n\nMaybe data source not found or is not of type 'JsonDB'?",2000);
				});
			});
	}

	function __processJsonDBData(script,opt) {

		_LOG("__processJsonDBData:");

		ixmaps.HTML_showLoading("data loaded ...");

		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			if ( opt.ext.length ){
				$.getScript(opt.ext)
					.done(function(script, textStatus) {
					__callThemeDataObjectExt(script,opt);
					})
					.fail(function(jqxhr, settings, exception) {
					  alert("external data provider: '"+opt.ext+"' could not be parsed !",2000);
					});
			}else{
				__callThemeDataObjectExt(script,opt);
			}
		}else{
			__setJsonDBData(script,opt);
		}

	}

	function __callThemeDataObjectExt(script,opt){
		_LOG("__callThemeDataObjectExt:");

		var zValues = 0;
		var nValues = 0;

		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			if ( eval("ixmaps."+opt.name) ){
				eval("ixmaps."+opt.name+"(script)");
			}else
			if ( eval("ixmaps.parentApi."+opt.name) ){
				eval("ixmaps.parentApi."+opt.name+"(script)");
			}else
			if ( eval("ixmaps.parentApi.parentApi."+opt.name) ){
				eval("ixmaps.parentApi.parentApi."+opt.name+"(script)");
			}
		}
		__setJsonDBData(script,opt);
	}

	function __setJsonDBData(script,opt) {
		ixmaps.HTML_showLoadingArrayStop();
		ixmaps.HTML_showLoading("creating theme ...");
		setTimeout("ixmaps.HTML_hideLoading()",1000);
		setTimeout("__doSetJsonDBData('"+opt.name+"','"+opt.url+"')",100);
	}

	__doSetJsonDBData = function(dataName,szUrl) {
		if ( (eval("typeof("+dataName+")")) != "undefined" ){
			eval("themeDataObj = "+dataName );
			ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null,themeDataObj,dataName);
		}else{
			ixmaps.htmlgui_displayInfo("data '"+dataName+"' not defined");
		}
	};

	/**
	 * doCSVImport 
	 * reads CSV files from URL
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	function __doCSVImport(szUrl,opt) {

		_LOG("__doCSVImport: "+szUrl);

		$.ajax({
			type: "GET",
			url: szUrl,
			dataType: "text",
			success: function(data) {
			  __processCSVData(data,opt);
			},
			error: function() {
				__doCSVImport2(ixmaps.szUrlSVGRoot+"csv/"+szUrl,opt);
			}
		 });
	}
	function __doCSVImport2(szUrl,opt) {

		_LOG("__doCSVImport2: "+szUrl);

		$.ajax({
			type: "GET",
			url: szUrl,
			dataType: "text",
			success: function(data) {
			  __processCSVData(data,opt);
			},
			error: function() {
				alert("external data (csv) \"" + szUrl + "\" could not be loaded!");
			}
		 });
	}

	function __processCSVData(csv,opt) {

		_LOG("__processCSVData:");

		ixmaps.HTML_showLoadingArrayStop();
		ixmaps.HTML_showLoading("data loaded ...");
		setTimeout("ixmaps.HTML_hideLoading()",1000);

		var c1 = null;
		var c2 = null;
		var newData1 = new Array(0);
		var newData2 = new Array(0);

		// GR 02.11.2015 nuovo csv parser Papa Parse by Matt Hold 
		// GR 21.07.2016 if autodecet delimiter fails, try first ; and then ,   

		var newData = Papa.parse(csv).data;
		if ( newData[0].length != newData[1].length ){
			_LOG("csv parser: autodetect failed");
			_LOG("csv parser: delimiter = ;");
			newData = Papa.parse(csv,{delimiter:";"}).data;
			if ( newData[0].length != newData[1].length ){
				_LOG("csv parser: delimiter = ; failed");
				_LOG("csv parser: delimiter = ,");
				newData = Papa.parse(csv,{delimiter:","}).data;
				if ( newData[0].length != newData[1].length ){
					_LOG("csv parser: delimiter = , failed");
					alert("csv parsing error");
				}
			}
		}

		// if csv ends with /n, last element is " ", so we must pop it 
		//
		if ( newData[newData.length-1].length != newData[0].length ){
			newData.pop();
		}

		// if only the first line ends with delimiter, we get one more (empty!) column
		// the parser gives the first row with different length; 
		// we must correct this here, because iXMaps checks every row's length with the first ones length later 
		// 
		if ( (newData[0].length - newData[1].length) == 1 ) {
			if ( newData[0][newData[0].length-1] == " " ){
				newData[0].pop();
			}
		}
		// user defined callback
		if ( opt.callback ){
			opt.callback(newData,opt);
			return;
		}
		// called by a theme 
		if ( newData ){
			__createThemeDataObject(newData,"csv",opt);
			return true;
		}
		return false;
	}
	function __doCheckTable(newData,szSource){
		for ( i=2; i<newData.length; i++ ){
			if ( newData[i].length != newData[i-1].length ){
				return false;
			}
		}
		return newData[i-1].length;
	}

	/**
	 * doLoadJSON 
	 * reads a simple JSON table 
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	function __doJSONImport(szUrl,opt) {

		if ( !szUrl.match(/http:/) && !szUrl.match(/.\//) ){
			var szPathA = ixmaps.embeddedApi.editor.szExternalDataPath.split('/');
			szPathA = szPathA.slice(1);
			szUrl = szPathA.join('/') + "json/" + szUrl;
		}

		$.getJSON(ixmaps.szCorsProxy+szUrl+".gz",
			function(data){
				__processJsonData(data,opt);
			}).fail(function(e) { 
				$.getJSON(ixmaps.szCorsProxy+szUrl,
					function(data){
						__processJsonData(data,opt);
					}).fail(function(e) { 
						ixmaps.HTML_showLoadingArrayStop();
						$("#loading-text").html("<span style='font-size:32px'><span style='color:red'>loading error with: </span>'"+szUrl);
					});
			});
	}
	function __processJsonData(script,opt) {

		var data = {};

		if ( typeof(script) == "string" ){
			try	{
				eval("data = "+script );
			}catch (e){
				ixmaps.HTML_showLoadingArrayStop();
				$("#loading-text").html("<span style='font-size:32px'><span style='color:red'>JSON parser error</span>'");
				return;
			}
		}else{
			data = script;
		}

		if ( ! data || (data.length == 0) ){
			ixmaps.HTML_showLoadingArrayStop();
			$("#loading-text").html("<span style='font-size:32px'><span style='color:red'>JSON parser error</span>'");
			return;
		}

		var dataA = [];

		var row = [];
		for ( a in data[0] ){
			row.push(a);
		}
		dataA.push(row);

		for ( i=1; i<data.length;i++ ){
			var row = [];
			for ( a in data[0] ){
				row.push(data[i][a]);
			}
			dataA.push(row);
		}
		__createThemeDataObject(dataA,"json",opt);
	}

	/**
	 * createThemeDataObject  
	 * take the loaded data and create a json object with the iXmaps data structure
	 * @type void
	 */
	function __createThemeDataObject(dataA,szType,opt){

		_LOG("__createThemeDataObject:");

		var zValues = 0;
		var nValues = 0;

		ixmaps.HTML_showLoadingArrayStop();
		ixmaps.HTML_hideLoading();
		
		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			if ( opt.ext.length ){
				$.getScript(opt.ext)
					.done(function(script, textStatus) {
					  __createThemeDataObjectExt(dataA,szType,opt);
					})
					.fail(function(jqxhr, settings, exception) {
					  alert("external data provider: '"+opt.ext+"' could not be loaded !",2000);
					});
			}else{
				__createThemeDataObjectExt(dataA,szType,opt);
			}

		// if not store data table as loaded
		// --------------------------------------------------
		}else{
			__doCreateThemeDataObjectExt(dataA,szType,opt);
		}

	}

	function __createThemeDataObjectExt(dataA,szType,opt){

		_LOG("__createThemeDataObjectExt:");

		var zValues = 0;
		var nValues = 0;

		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			try {
				eval("dataA = ixmaps."+opt.name+"(dataA)");
			} catch (e){
				try {
					eval("dataA = ixmaps.parentApi."+opt.name+"(dataA)");
				}catch (e){
					try {
						eval("dataA = ixmaps.parentApi.parentApi."+opt.name+"(dataA)");
					}catch (e){
					}
				}
			}
		}
		if ( dataA ){
			__doCreateThemeDataObjectExt(dataA,szType,opt);
		}
	}

	function __doCreateThemeDataObjectExt(dataA,szType,opt){

		var zValues = 0;
		var nValues = 0;

		// cteate data object
		// ------------------
		var themeDataObj = new Object();

		// first row of data => object.fields
		// ------------
		themeDataObj.fields = new Array ();
		for ( var a in dataA[0] ){
			themeDataObj.fields.push({id:(dataA[0][a].trim()||" "),typ:0,width:60,decimals:0});
		}

		// following rows => object.records
		// records array
		// --------------
		themeDataObj.records = new Array ();

		// get all values we want 
		// loop over countries
		for ( i=1; i<dataA.length; i++ ){
			// add one record
			var valuesA = new Array ();
			for ( var a in dataA[i] ){
				valuesA.push((dataA[i][a]||" "));
			}
			themeDataObj.records.push(valuesA);
		}

		// finish the data object by creating object.table
		// -----------------------------------------------
		themeDataObj.table = {records:dataA.length-1 , fields:dataA[0].length };

		eval(opt.name + ' = themeDataObj;');

		// if there is an ext data after processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			try {
				eval("dataA = ixmaps."+opt.name+".after(dataA)");
			} catch (e){
				try {
					eval("dataA = ixmaps.parentApi."+opt.name+".after(dataA)");
				}catch (e){
					try {
						eval("dataA = ixmaps.parentApi.parentApi."+opt.name+".after(dataA)");
					}catch (e){
					}
				}
			}
		}
		// deploy the object into the map
		// ------------------------------

		ixmaps.embeddedSVG.window.map.Api.setThemeExternalData(null,themeDataObj,opt.name);
	}
	
	/** 
	 * all calls from the embedded SVG map
	 * for documentation reasons

	ixmaps.htmlgui_onMapInit(window)
	ixmaps.htmlgui_onMapResize(window)
	ixmaps.htmlgui_onMapReady(window)
	ixmaps.htmlgui_queryMapFeatures()
	ixmaps.htmlgui_onSVGPointerIdle()
	ixmaps.htmlgui_onZoomAndPan()
	ixmaps.htmlgui_onInfoDisplayExtend(SVGDocument,szObjId)
	ixmaps.htmlgui_setCurrentEnvelope = function(szEnvelope,fZoomto)
	ixmaps.htmlgui_setCurrentEnvelopeByGeoBounds = function(ptSW,ptNE)
	ixmaps.htmlgui_setCurrentCenterByGeoBounds = function(ptCenter)
	ixmaps.htmlgui_setActiveTheme = function(szTheme)
	ixmaps.htmlgui_setMapTool = function(szType)
	ixmaps.htmlgui_setScaleSelect = function(szScale)
	ixmaps.htmlgui_popupWindow = function(szUrl)
	ixmaps.htmlgui_displayInfo = function(szMessage)
	ixmaps.htmlgui_killInfo = function()
	ixmaps.htmlgui_isHTMLMapVisible = function()
	ixmaps.htmlgui_onNewTheme = function(szId)
	ixmaps.htmlgui_onRemoveTheme = function(szId)
	ixmaps.htmlgui_onErrorTheme = function(szId)
	ixmaps.htmlgui_drawChart = function(SVGDocument,param)
	ixmaps.htmlgui_drawChartAfter = function(SVGDocument,param)

	**/

}( window.ixmaps = window.ixmaps || {}, jQuery ));

// -----------------------------
// EOF
// -----------------------------

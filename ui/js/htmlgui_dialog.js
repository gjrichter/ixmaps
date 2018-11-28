/**********************************************************************
 htmlgui_dialog.js

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

(function( ixmaps, $, undefined ) {

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
		var dialogHeight = Math.min(ixmaps.SVGmapHeight-30,nMaxHeight?nMaxHeight:ixmaps.SVGmapHeight-30);

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
		$("#"+szElement).parent().css("z-index","10000");
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
			"height"	:(ixmaps.SVGmapHeight-30) +"px",
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
			"width":(ixmaps.SVGmapOffX+ixmaps.SVGmapWidth)+"px",
			"height":(ixmaps.SVGmapHeight)-"px"
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
		this.openDialog(null,'share-dialog',"./tools/share_new.html",'share map',position||'auto',400,550);
	};

	ixmaps.popupShare = function(position) {
		ixmaps.shareMap('dialog',position);
	};

	ixmaps.exportMap = function(target,position){
		window.szMapTypeId = ixmaps.getMapTypeId();
		window.DOMViewerObj = ixmaps.embeddedSVG.window.document;
		this.openDialog(null,'export-dialog',"./tools/export.html",'export map',position||'auto',500,150);
	};

	ixmaps.viewTable = function(target,position){
		this.openDialog(null,'table-dialog',"./tools/table_new.html",'data table',position||'auto',800,600);
	};

	ixmaps.popupBookmarks = function(position){
		this.openDialog(null,'bookmarks','./tools/history.html','Bookmarks',position||'50%,103',250,450);
	};

	ixmaps.popupProject = function(position){
		this.openDialog(null,'projects','./tools/project_save.html','Save actual map & theme as project',position||'200,103',550,580);
	};

	ixmaps.popupThemeEditor = function(position){
		window.idialog = this.openDialog(null,'editor','./tools/theme_editor.html','Theme Editor',position||'10,103',380,600);
	};

	ixmaps.popupTools = function(position){
		ixmaps.openDialog(null, "tools", './tools/popuptools_line_v2.html', 'Tools', '10,10', "95%", 150);
	};

	ixmaps.fullScreenMap = function(szTemplateUrl){

		var szMapService = this.szMapService;
		var szMapUrl    = this.getMapUrl();
		var szMapType   = this.getMapTypeId();
		var szStoryUrl  = this.getStoryUrl();

		// get envelope 
		var szEnvelope = this.getEnvelopeString(1);
		// get all themes
		var szThemesJS = this.getThemesString();
		// compose bookmark
		var szBookmark = szLoadedMap + "map.Api.doZoomMapToGeoBounds("+szEnvelope+");" + "map.Api.clearAll();" + szThemesJS;

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

	ixmaps.getShareUrl = function(szType){

		var szAloneUrl = null;
		var szEmbedUrl = null;
		var szPopoutUrl = null;

		// GR 30.04.2015 try to call explicit functions to get the share urls 
		// ------------------------------------------------------------------
		var szEditUrl   = ixmaps.getEditUrl  ?ixmaps.getEditUrl()  :null;
		var szViewUrl   = ixmaps.getViewUrl  ?ixmaps.getViewUrl()  :null;
		var szAloneUrl  = ixmaps.getLinkUrl  ?ixmaps.getLinkUrl()  :null;
		var szEmbedUrl  = ixmaps.getEmbedUrl ?ixmaps.getEmbedUrl() :null;
		var szPopoutUrl = ixmaps.getPopoutUrl?ixmaps.getPopoutUrl():null;
		// ------------------------------------------------------------------

		// GR 30.04.2015 get the last valid map name to query the bookmark from
		// ------------------------------------------------------------------
		szName = "map";
		for ( i in ixmaps.embeddedApiA ){
			szName = i;	
		}

		// GR 30.04.2015 go to the main window API, important for dispatch() 
		// ------------------------------------------------------------------
		while( ixmaps.embeddedApiA && ixmaps.embeddedApiA[szName] && (ixmaps.embeddedApiA[szName] != ixmaps) ){
			ixmaps = ixmaps.embeddedApiA[szName];
		}
		
		// GR 30.04.2015 dispatch() the url returned from the explicit function 
		//				 szAloneUrl is already complete
		// ------------------------------------------------------------------
		szEmbedUrl  = szEmbedUrl ?ixmaps.dispatch(szEmbedUrl) :szEmbedUrl;
		szPopoutUrl = szPopoutUrl?ixmaps.dispatch(szPopoutUrl):szPopoutUrl;

		// make generic share urls from the internal map template 
		// used only, if above defined explicit urls are null
		// ------------------------------------------------------

		// make url of the map template 
		var szTemplateUrl = ixmaps.dispatch("ui/dispatch.htm?");
		var szBasemap = ixmaps.getBaseMapParameter(ixmaps.szMapService);

		var szTemplateEdit   = szTemplateUrl + "ui=edit"   + szBasemap;
		var szTemplateView   = szTemplateUrl + "ui=view"   + szBasemap;
		var szTemplateEmbed  = szTemplateUrl + "ui=embed"  + szBasemap;
		var szTemplateMain   = szTemplateUrl + "ui=embed"  + szBasemap;
		var szTemplatePopout = szTemplateUrl + "ui=popout" + szBasemap;

		window.document.body.topMargin = 0;
		window.document.body.leftMargin = 0;

		var szMapType  = ixmaps.getMapTypeId();
		var szMapUrl   = ixmaps.getMapUrl();
		var szStoryUrl = ixmaps.getStoryUrl();
		var szBookmark = ixmaps.getBookmarkString(2);
		var szAttrib   = ixmaps.htmlgui_getAttributionString();

		szQuery  = "&maptype=" + szMapType;
		szQuery += "&minimal=1&toolbutton=1&logo=1&child=1";
		szQuery += "&svggis=" + encodeURI(szMapUrl);
		szQuery += "&story="  + encodeURI(szStoryUrl||"");
		szQuery += "&bookmark=" + encodeURIComponent(szBookmark);
		szQuery += "&attribution=" + encodeURIComponent(szAttrib);

		szEmbedUrl  = szEmbedUrl || (szTemplateEmbed + szQuery);
		szAloneUrl  = szAloneUrl || (szTemplateMain + szQuery);
		szEditUrl   = szEditUrl  || (szTemplateEdit + szQuery);
		szViewUrl   = szViewUrl  || (szTemplateView + szQuery);
		szPopoutUrl = szTemplatePopout + szQuery;

		switch(szType){
			case "view":
				return szViewUrl;
			case "edit":
				return szEditUrl;
		}

	};

	ixmaps.popOutView = function(fFlag,szTemplateUrl){
		window.open(ixmaps.getShareUrl("view"));
	};

	ixmaps.popOutEdit = function(fFlag,szTemplateUrl){
		window.open(ixmaps.getShareUrl("edit"));
	};

	ixmaps.popOutMap = function(fFlag,szTemplateUrl){

		var szMapService = this.szMapService;
		var szMapType    = this.getMapTypeId();
		var szMapUrl     = this.getMapUrl();

		// get envelope with zoom factor 3 because the popout window is smaller than the map window
		var szEnvelope = this.getEnvelopeString(3);
		// get all themes
		var szThemesJS = this.getThemesString();
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
		var szMapUrl	 = this.getMapUrl();
		var szMapType    = this.getMapTypeId();
		// get envelope 
		var szEnvelope = this.getEnvelopeString(1);
		// get all themes
		var szThemesJS = this.getThemesString();
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

	ixmaps.getMapUrl = function(){
		return decodeURI(ixmaps.szUrlSVG);
	};
	ixmaps.getLoadedMapString = function(){
		if ( ixmaps.loadedMap ){
			return "map.Api.loadMap('"+decodeURI(ixmaps.loadedMap)+"');";
		}else{
			return "";
		}
	};
	ixmaps.getStoryUrl = function(){
		return decodeURI( $(document).getUrlParam('story')					||
						  $(window.parent.document).getUrlParam('story')	 );
	};
	ixmaps.getMapTypeId = function(){
		return htmlMap_getMapTypeId();
	};
	ixmaps.setMapTypeId = function(szId){
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
			$("#story_board").css({"background":"black"});

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

			changeCss(".loading-text","background-color:rgba(0,0,0,0.5)");

		}else if ( szId.match(/gray/i) ){
			$("#ixmap").css({"background":"#E6E6E6"});
			$("#gmap").css({"background":"#E6E6E6"});
			$("#story_board").css({"background":"#E6E6E6"});
			$( "#switchlegendbutton" ).css("background-color","#E6E6E6");
			$( "#switchlegendbutton" ).css("border-color","#dddddd");
		}else{
			$("#ixmap").css({"background":"white"});
			$("#gmap").css({"background":"white"});
			$("#story_board").css({"background":"#ffffff"});
			$( "#switchlegendbutton" ).css("background-color","#ffffff");
			$( "#switchlegendbutton" ).css("border-color","#dddddd");
		}

		__cssControls(szId);

		// bubble it up !
		try{
			this.parentApi.htmlgui_setMapTypeBG(szId);
		}
		catch (e){
		}
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

	ixmaps.getLayerString = function(){

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
		return "map.Api.setMapLayer('"+JSON.stringify(switchLayerObject)+"');"
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
			result[xA[0]] = xA[1];
		}
		return result;
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

		szBookMarkJS += this.getLayerString();

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
			if ( szScript.match(/CHOROPLETH/) ){
				ixmaps.embeddedSVG.window.map.Api.clearAllChoropleth();
			}else{
				ixmaps.embeddedSVG.window.map.Api.clearAllCharts();
			}
		}
		eval('ixmaps.embeddedSVG.window.'+szScript);
	};



	// ----------------------
	// make chart type menu 
	// ----------------------

	var szChartMenuId = null;
	var fChartMenuDialog = false;
	var fChartMenuVisible = true;

	ixmaps.makeChartMenueHTML = function(szId){

		ixmaps.themeObj = ixmaps.themeObj || ixmaps.getThemeObj(szId);

		// make <div> + <svg> to receive the chart menu (in svg)
		var szHtml = "";
		szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em'>select chart type:</div>";
		szHtml += "<div id='menuDiv' style='height:300px;width:260px;overflow:auto'><div><svg width='240' height='2000' viewBox='0 0 4800 40000'><g id='getchartmenutarget'></g></svg></div></div>";

		// create dialog
		__showChartDialog(szHtml,ixmaps.themeObj.szTitle);

		// call theme method to draw the charts
		var szTypelistA = ixmaps.themeObj.getChartTypeMenu($("#getchartmenutarget")[0],null,240);

		// create click map to select the chart for the theme
		szHtml = "<div style='position:relative;top:-2010px;'>";
		for ( i in szTypelistA ){
			if ( i%4 == 0 ){
				szHtml += "<div style='clear:both'>";
			}
			szHtml += "<a href=\"javascript:ixmaps.changeThemeStyle(null,'type:"+szTypelistA[i]+"','set');\"><div style='float:left;height:60px;width:60px;'></div></a>";
		}
		szHtml += "</div>";

		$("#menuDiv").append(szHtml);
	};

	__showChartDialog = function(szHtml,szTitle){

		ixmaps.szChartHtml  = szHtml  || ixmaps.szChartHtml  || "";
		ixmaps.szChartTitle = szTitle || ixmaps.szChartTitle || "";

		if ( !fChartMenuVisible ){
			return;
		}
	
		// create dialog (oversized) to host the ChartMenu
		//
		if ( !fChartMenuDialog ){
			ixmaps.openDialog(null,'chartmenue','',ixmaps.szChartTitle,'10,103',300,400);
			fChartMenuDialog = true;
		}

		// set content and resize
		//
		$("#chartmenue").html(ixmaps.szChartHtml);

		$("#chartmenue").parent().css("width","300px");
		$("#chartmenue").parent().css("height","400px");

		$("#chartmenue").dialog({
		  close: function( event, ui ) {
				fChartMenuDialog = false;
				$("#chartmenue").remove();
			}
		});
	};

	ixmaps.copyThemeToClipboard = function(){
		navigator.clipboard.writeText(JSON.stringify(ixmaps.getThemeDefinitionObj()))
			.then(() => {
				ixmaps.message("theme copied",100);
			})
			.catch(err => {
				ixmaps.message("no theme to copy",100);
				console.log('Something went wrong', err);
			});
	};

	ixmaps.pasteThemeFromClipboard = function(){
		navigator.clipboard.readText()
			.then(text => {
				this.embeddedSVG.window.map.Api.newMapThemeByObj(JSON.parse(text));
			})
			.catch(err => {
				// maybe user didn't grant access to read from clipboard
				ixmaps.message("no theme to paste",100);
				console.log('Something went wrong', err);
			});
	};

}( window.ixmaps = window.ixmaps || {}, jQuery ));

// -----------------------------
// EOF
// -----------------------------

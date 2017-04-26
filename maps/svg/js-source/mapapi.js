/**********************************************************************
 mapapi.js

$Comment: provides JavaScript application interface to svggis
$Source : mapapi.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2006/02/03 $
$Author: guenter richter $
$Id: mapapi.js 7 2007-05-10 07:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: mapapi.js,v $
**********************************************************************/

/** 
 * @fileoverview This file is the public JavaScript API for {@link http://www.ixmaps.com SVGGIS} Map Applications.<br>
 * It contains classes and methods to
 * <ul>
 * <li>zoom and pan the map</li>
 * <li>control layer</li> 
 * <li>execute searches</li>
 * </ul>
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

/**
 * Create a new Map.Api instance.  
 * @class It provides methods to call map functions
 * @constructor
 * @return A new Map.Api instance
 */
Map.Api = function(map){
	/** tell the api calls to use pushAction; needed for execBookmark */
	this.executeWithPush = false;
	this.map = map;
};
Map.Api.prototype = new Map();

// create instance here
if ( (typeof(thisversion) == "string") && map.checkVersion(thisversion) ){
	map.Api = new Map.Api(map);
}
else{
	alert("Map.Api incompatible !");
}

/**
 * May be called by the embedding HTML page to set/change the map behaviour.<br>
 * Must be called as the answer to htmlgui_queryMapFeatures().
 * @param szFeatures string that contains the features
 * <br><br>
 * The following map feature can be set:
 * <br><br>
 *  <table>
 *  <tr><td>featurescaling</td><td>adapt map features to zoom (p.e. line thickness)</td><td>false / true / dynamic</td></tr>
 *  <tr><td>dynamiclabel</td><td>adapt label to path length</td><td>false / true / delayed</td></tr>
 *  <tr><td>dynamiclayer</td><td>switch layer on/off according to defined min/max scale</td><td>false / true / delayed</td></tr>
 *  <tr><td>dynamictiles</td><td>load tiles according to the map position (panning)</td><td>false / true / delayed</td></tr>
 *  <tr><td>discardtiles</td><td>clear unused (switched off) tiles</td><td>false / true / delayed</td></tr>
 *  <tr><td>loadmultitiles</td><td>allow multiple xml http request</td><td>false / true</td></tr>
 *  <tr><td>loadexternaldata</td><td>try to load db data for a layer from external file (before looking for metadata in the map shapes)</td><td>false / true</td></tr>
 *  <tr><td>fastpan</td><td>hide map tools while panning</td><td>false / true</td></tr>
 *  <tr><td>clipmap</td><td>clip the map to the visible range (affects panning)</td><td>false / true / dynamic</td></tr>
 *  <tr><td>checklabeloverlap</td><td>activates a function that tries to resolves label overlappings</td></tr>
 *  <tr><td>embedname</td><td>tell the name of the embed object (svg viewer)</td><td>[name]</td></tr>
 *  </table>
 * <br>
 * <strong>Sample:</strong><br> map.Api.setMapFeatures("featurescaling:dynamic;dynamiclayer:true;loadmultitiles:false"); 
 * <br><br>
 * <strong>Hints:</strong>
 * <table>
 * <tr><td>"featurescaling:dynamic"</td><td> - features size will increase with progressive zoom</td></tr>
 * <tr><td>"mapclip:dynamic"</td><td> - clip affects pattern, when map is zoomed; value 'dynamic' resolves that problem, but causes slower panning</td></tr>
 * <tr><td>"delayed"</td><td> - the appropriate feature will be called with a little timeout; faster map rendering  but shows transitory map states</td></tr>
 *  </table>
*/
Map.Api.prototype.setMapFeatures = function(szFeatures){
	this.map.setFeatures(szFeatures);
};

/**
 * get actual features string  
 * @type string
 * @return features string as given by .setMapFeatures(szFeatures) 
 */
Map.Api.prototype.getMapFeatures = function(){
	return this.map.getFeatures();
};

/**
 * localize map gui 
 * @param szPath the path from where to load the localization
 * @param szFiles one or more filnames (e.g. maplocal.svg)
 */
Map.Api.prototype.setMapLocal = function(szPath,szFiles){
	var szFileA = szFiles.split('|');
	for ( var i=0; i<szFileA.length; i++ ){
		loadSVGIncludes(null,szPath,szFileA[i]);
	}
};
/**
 * add translation to dictionary 
 * @param szOrig the string ti transtale
 * @param szLocal the local translation
 */
Map.Api.prototype.setLocalString = function(szOrig,szLocal){
	this.map.Dictionary.replace(szOrig,szLocal);
};

/*****************
 *  bookmark API
 *****************/

/**
 * set a bookmark to the actual zoom and pan
 */
Map.Api.prototype.setBookmark = function(){
	try{
		var rectArea = this.map.Zoom.getBox();
		var pt1 = this.map.Scale.getMapCoordinate(rectArea.x,rectArea.y);
		var pt2 = this.map.Scale.getMapCoordinate(rectArea.x+rectArea.width,rectArea.y+rectArea.height);
		var szEnvelope = "MinBoundX='"+pt1.x+"' MaxBoundX='"+pt2.x+"' MinBoundY='"+pt2.y+"' MaxBoundY='"+pt1.y;
		bookmarkList.createBookmark(null,szEnvelope);
	}
	catch (e){
		alert("Bookmark could not be set !");
	}
};
/**
 * go to bookmark.
 * @param szName the name of the bookmark
 */
Map.Api.prototype.gotoBookmark = function(szName){
	try{
		bookmarkList.exec(szName);
	}
	catch (e){
		alert("Bookmarks could not be found !");
	}
};
/**
 * clear all bookmarks.
 */
Map.Api.prototype.clearBookmarks = function(){
	try{
		bookmarkList.clear();
	}
	catch (e){
		alert("Bookmarks could not be deleted !");
	}
};

/**
 * get map posituion and size in screen coordinates
 * @return new box object with map size
 */
Map.Api.prototype.getMapBox = function(){
	return new box(
		 this.map.Scale.mapPosition.x / this.map.Scale.normalX(1)
		,this.map.Scale.mapPosition.y / this.map.Scale.normalX(1)
		,this.map.Scale.bBox.width / this.map.Scale.normalX(1)
		,this.map.Scale.bBox.height / this.map.Scale.normalX(1)
		);
};
/**
 * set new map extension in screen coordinates
 * @param x position 
 * @param y position 
 * @param width position 
 * @param height position 
 */
Map.Api.prototype.resizeCanvas = function(x,y,width,height,szMethod){
	return this.map.Scale.resizeCanvas(x,y,width,height,szMethod);
};

/*****************
 *  zooming API
 *****************/

/**
 * reset map zooming 
 */
Map.Api.prototype.doZoomMapToFullExtend = function(){
	this.map.Zoom.doZoomMapToLayer('maplayer');
};
/**
 * execute map zooming 
 * @param nFactor the zoom factor to be set
 * @param szMode 'absolute', 'byscale' or 'relative'
 * @return new map scale ( for sample 25000 which means 1:25000 )
 */
Map.Api.prototype.doZoomMap = function(nFactor,szMode){
	return this.map.Zoom.doZoomMap(nFactor,szMode);
};
/**
 * execute map panning relative to the actual position
 * @param nDeltaX the x panning amount (in client screen pixel)
 * @param nDeltaY the y panning amount (in client screen pixel)
 */
Map.Api.prototype.doPanMap = function (nDeltaX,nDeltaY){
	this.map.Zoom.setNewPan(nDeltaX,nDeltaY);
};
/**
 * zoom the map to a rectangular area given in widget coodinates (= screen pixel coordinates relative to the upper left corner of the SVG canvas)
 * @param rectArea the new area to zoom to
 */
Map.Api.prototype.doZoomMapToWidgetRect = function(rectArea){
	this.map.Zoom.doZoomMapToWidgetRect(rectArea);
};
/**
 * center the map to a position given in geo coodinates 
 * @param lat the latitude  of the new position
 * @param lon the longitude of the new position
 */
Map.Api.prototype.doCenterMapToGeoPosition = function(lat,lon){
	this.map.Zoom.doCenterMapToGeoPosition(lat,lon);
};
/**
 * center the map to a rect given in geo coodinates 
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Api.prototype.doCenterMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	this.map.Zoom.doCenterMapToGeoBounds(latSW,lonSW,latNE,lonNE);
};
/**
 * zoom the map to a rect given in geo coodinates
 * (may lead to different bounds, due to zoom limitations) 
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Api.prototype.doZoomMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	this.map.Zoom.doZoomMapToGeoBounds(latSW,lonSW,latNE,lonNE);
};
/**
 * set the map bounds to a rect given in geo coodinates 
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Api.prototype.doSetMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	if ( (lonNE-lonSW) < 180){
		fPreserveMapRatio = false;
	}
	this.map.Zoom.doSetMapToGeoBounds(latSW,lonSW,latNE,lonNE);
	setTimeout("fPreserveMapRatio = true;",5000);
};
/**
 * pan the map to a center given in geo coodinates and zoom to level zoom
 * (zomm executed by hosting map application) 
 * @param center array with latitude,longitude
 */
Map.Api.prototype.doZoomMapToView = function(center,zoom){
	this.map.Zoom.doZoomMapToView(center,zoom);
};
/**
 * gets the map center in geo coodinates 
 */
Map.Api.prototype.getCenterOfMapInGeoPosition = function(){
	return this.map.Zoom.getCenterOfMapInGeoPosition();
};
/**
 * gets the map bounds in geo coodinates 
 * @type array
 * @return an array of 2 points (SouthWest and NorthEast ) 
 */
Map.Api.prototype.getBoundsOfMapInGeoBounds = function(){
	return this.map.Zoom.getBoundsOfMapInGeoBounds();
};
/**
 * boolean is there a pending new bounds 
 * @type boolean
 * @return true/false 
 */
Map.Api.prototype.pendingNewGeoBounds = function(){
	return fPendingNewGeoBounds;
};
/**
 * set the visibility of the map layer
 * @fFlag true or false
 */
Map.Api.prototype.setVisibility = function(fFlag){
	var mapTool = new MapTool(evt,"nothing");
	if ( fFlag == "invisible" ){
		mapTool.hideLayer(evt);
	}else{
		mapTool.showLayer(evt);
	}
};
/**
 * hide the overview map
 */
Map.Api.prototype.hideOverviewMap = function(){
	this.map.Zoom.hideOverviewMap();
};
/**
 * show the overview map (if defined)
 */
Map.Api.prototype.showOverviewMap = function(){
	this.map.Zoom.showOverviewMap();
};
/**
 * hide the north harrow
 */
Map.Api.prototype.hideNorthArrow = function(){
	this.map.Viewport.hideNorthArrow();
};
/**
 * show the north harrow (if defined)
 */
Map.Api.prototype.showNorthArrow = function(){
	this.map.Viewport.showNorthArrow();
};
/**
 * go one step back in zoom and pan history
 */
Map.Api.prototype.backwards = function(){
	zoomAndPanHistory.backwards();
};
/**
 * go one step forwards in zoom and pan history
 */
Map.Api.prototype.forwards = function(){
	zoomAndPanHistory.forwards();
};

/**
 * change the value displays of all present themes
 * @param fFlag true or false or null
 */
Map.Api.prototype.toggleThemeValues = function(fFlag){
	try	{
		this.map.Themes.toggleThemeValues(null,fFlag);
	}catch (e){}
};
/**
 * change the legend displays of all present themes
 * @param fFlag true or false or null
 */
Map.Api.prototype.toggleThemeLegends = function(fFlag){
	try	{
		this.map.Themes.toggleThemeLegends(null,fFlag);
	}catch (e){}
};
/**
 * change the legend displays of all present themes
 * @param fFlag true or false or null
 */
Map.Api.prototype.minimizeThemeLegends = function(){
	try	{
		this.map.Themes.minimizeThemeLegends(null);
	}catch (e){}
};
/**
 * change the scaling of elements within the object layer
 * @param nDelta the scaling factor
 */
Map.Api.prototype.changeObjectScaling = function(nDelta){
	this.map.Layer.changeObjectScaling(null,nDelta);
};
/**
 * change the scaling of label 
 * @param nDelta the scaling factor
 */
Map.Api.prototype.changeLabelScaling = function(nDelta){
	this.map.Layer.changeLabelScaling(null,nDelta);
};
/**
 * change the scaling of lines 
 * @param nDelta the scaling factor
 */
Map.Api.prototype.changeLineScaling = function(nDelta){
	this.map.Layer.changeLineScaling(null,nDelta);
};
/**
 * get scale parameter
 */
Map.Api.prototype.getScaleParam = function(){
	return this.map.Scale.getScaleParam();
};
/**
 * set scale parameter
 * @param obj javascript object containing the parameter to set
 */
Map.Api.prototype.setScaleParam = function(obj){
	this.map.Scale.setScaleParam(obj);
};
/**
 * change the rotation of the map canvas 
 * @param nDelta the rotation change amount (clockwise)
 */
Map.Api.prototype.changeRotation = function(nDelta){
	this.map.Scale.changeRotation(null,nDelta);
};
/**
 * set the rotation of the map canvas
 * @param nDelta the new rotation angle (clockwise)
 */
Map.Api.prototype.setRotation = function(nAngle){
	this.map.Scale.setRotation(null,nAngle);
};
/**
 * set the map background color
 * @param szColor the new background color
 */
Map.Api.prototype.setMapBackgroundColor = function(szColor){
	this.map.Viewport.setBackgroundColor(szColor);
};
/**
 * switch the border to pan the map 
 */
Map.Api.prototype.togglePanBorder = function(){
	this.map.Viewport.togglePanBorder();
};
/**
 * display printer friendly 
 */
Map.Api.prototype.setPrintScaling = function(){
	this.map.Event.doPrintZoom();
};
/**
 * inhibit dynamic content and scaling  
 */
Map.Api.prototype.froozeMap = function(flag){
	fFroozeDynamicContent = flag;
};
/**
 * set a clipping width for the map
 * @param nWidth the new map width
 */
Map.Api.prototype.setMapClip = function(nWidth){
	this.map.Viewport.clipMap(nWidth);
};
/**
 * set a clipping width for a named layer
 * @param szName the name of the layer to clip
 * @param nWidth the new map width
 */
Map.Api.prototype.setLayerClip = function(szName,nWidth){
	this.map.Viewport.clipLayer(szName,nWidth);
};
/**
 * switch a named layer on/off
 * @param szName the name of the layer to clip
 * @param nWidth the new map width
 */
Map.Api.prototype.switchLayer = function(szName,nState){
	this.map.Layer.switchLayer(null,szName,null,nState);
};
/**
 * get layer object array
 */
Map.Api.prototype.getLayer = function(){
	return this.map.Layer.listA;
};
/**
 * get layer dependency array
 */
Map.Api.prototype.getLayerDependency = function(){
	return this.map.Layer.depListA;
};
	
/*****************
 *  map tool API
 *****************/

/**
 * select and activate map tool
 * @param szType string that describes the desired tool
 * <br><br>
 * The following tools can be set:
 * <br><br>
 *  <table>
 *  <tr><td>info</td><td>show data fields of shape</td><td>on mouse over</td></tr>
 *  <tr><td>zoomrect</td><td>enable zoom in by selecting an rectangular area by the mouse</td><td>on mouse click and drag</td></tr>
 *  <tr><td>pan</td><td>pan the map by the mouse</td><td>on mouse click and drag</td></tr>
 *  <tr><td>measurement</td><td>draw circle and line from an origin to the actual mouse position; show the length of the line</td><td>on mouse click and drag</td></tr>
 *  <tr><td>coordinates</td><td>show the mouse position in map coordinates</td><td>on mouse click</td></tr>
 *  <tr><td>polyline</td><td>create polyline on mouse positions; show line length</td><td>on mouse click</td></tr>
 *  <tr><td>polygon</td><td>create polygon on mouse positions; calculate and show surface</td><td>on mouse click</td></tr>
 *  </table>
 */
Map.Api.prototype.setMapTool = function(szType){
	setMapTool(szType);
};
/**
 * return the actual map tool name
 * @type string
 * @return the map tool name
 */
Map.Api.prototype.getMapTool = function(){
	return getMapTool();
};
/**
 * check if specified map tool is active (may be called by context menu to check item)
 * @param szType string that describes the tool type ( "zoomarea",...)
 * @return 'yes' or 'no'
 */
Map.Api.prototype.isMapTool = function(szType){
	if (szType == "overviewmap" ){
		if ( this.map.Zoom.overviewThumbObj ){
			return 'yes';
		}
	}
	if ( szMapToolType == szType ){
		return 'yes';
	}
	return 'no';
};
/**
 * check if specified map tool is not active (may be called by context menu to uncheck item)
 * @param szType string that describes the tool type ( "zoomarea",...)
 * @return 'yes' or 'no'
 */
Map.Api.prototype.isNotMapTool = function(szType){
	if ( this.isMapTool(szType) == 'no' ){
		return 'yes';
	}
	return 'no';
};
/**
 * change the display state of a map theme(layer)
 * @param szTheme the name (id) of the theme (layer)
 * @param szState the desired state ( "off" or "on" )
 */
Map.Api.prototype.switchMapTheme = function(szTheme,szState){
	if (szTheme){

		szState = szState || (this.map.Layer.isLayerOn(szTheme)?"off":"on");

		if ( map.Legend ){
			// search legend item
			var itemNode = SVGDocument.getElementById("legend:"+szState+":this:item:"+szTheme);
			if (itemNode){
				this.map.Legend.execLegendMouseClickOnItem(null,itemNode,"legend:"+szState+":this:item:"+szTheme);
				return;
			}
			// if not found, assume layer and do this
			if ( szState == "on" ){
				this.map.Layer.switchLayer(null,szTheme,null,true);
				map.Legend.switchLegendCheckBox(null,szTheme,"inline");
			}
			else{
				this.map.Layer.switchLayer(null,szTheme,null,false);
				map.Legend.switchLegendCheckBox(null,szTheme,"none");
			}
		}else{
			if ( szState == "on" ){
				this.map.Layer.switchLayer(null,szTheme,null,true);
			}
			else{
				this.map.Layer.switchLayer(null,szTheme,null,false);
			}
		}
	}
};
/**
 * get the layer object of map theme(layer); the layer object provides properties and methods for the layer
 * @param szId the name of the theme
 * @return a layer object (or null)
 */
Map.Api.prototype.getMapTheme = function(szId){
	var szTheme = szId.split('#')[0].split(':')[0];
	if ( szTheme == 'legend' ){
		szTheme = szId.split(':')[2];
	}
	return this.map.Layer.listA[szTheme];
};
/**
 * get renderer field of a map theme(layer); this is the field that gives the rendering of each shape of the theme
 * (only avilable, if the theme is rendered by 'unique symbols' or 'graduated symbols')
 * @param szId the name of the theme
 * @return a string with the field name (or null)
 */
Map.Api.prototype.getMapThemeRendererField = function(szId){
	var themeObj = this.getMapTheme(szId);
	if (themeObj){
		return themeObj.szRenderer;
	}
	return null;
};
/**
 * get data row of one theme item
 * @param szId the name of the theme
 * @return a string with the field name (or null)
 */
Map.Api.prototype.getMapThemeDataRow = function(szId,szItemId){
	var themeObj = map.Themes.getTheme(szId);
	if (themeObj){
		return map.Themes.getDataRow(szItemId,themeObj);
	}
	return null;
};
/**
 * get the chart one theme item or overview
 * @param szId the name of the theme
 * @return a string with the field name (or null)
 */
Map.Api.prototype.getMapThemeChart = function(szId,szItemId,targetGroup,szFlag){
	var themeObj = map.Themes.getTheme(szId);
	if (themeObj){
		return map.Themes.getChart(szItemId,targetGroup,szFlag,themeObj);
	}
	return null;
};
/**
 * get the histogram of one theme
 * @param szId the name of the theme
 * @param szId the name of the theme
 * @return a string with the field name (or null)
 */
Map.Api.prototype.getMapThemeHistogram = function(szId,szItemId,targetGroup,szFlag){
	var themeObj = map.Themes.getTheme(szId);
	if (themeObj){
		return map.Themes.getHistogram(szId,targetGroup,szFlag,themeObj);
	}
	return null;
};
/**
 * execute JavaScript code displaying a message first
 * @param szJS the JavaScript code
 * @param szText the message text
 * @param nTimeout if set, the message will disappear after nTimeout seconds
 */
Map.Api.prototype.executeJavascriptWithMessage = function(szJS,szText,nTimeout){
	// GR 16.07.2011 replace all " with \" in szJS string and call via pushAction
	if ( szJS && typeof(szJS != "undefined" ) ){
		this.map.pushAction("map.Api.executeWithPush = true;");
		this.map.pushAction("executeWithMessage(\""+szJS.replace(/\"/gi,"\\\"")+"\",\""+szText+"\","+nTimeout+")");
		this.map.pushAction("map.Api.executeWithPush = false;");
	}
//	executeWithMessage(szJS,szText,nTimeout);
};
/**
 * show message on  map
 * @param szText the message text
 * @param nTimeout if set, the message will disappear after nTimeout seconds
 */
Map.Api.prototype.displayMessage = function(szText,nTimeout,szFlag){
	displayMessage(szText,nTimeout,szFlag);
};
/**
 * change horizontal position of map and legend (if the legend has been on the left, it will be on the right and viceversa)  
 */
Map.Api.prototype.flipLegend = function(){
	// flip map
	var matrixA = getMatrix(this.map.Scale.offsetNode);
	if ( matrixA[4] == 0 ){
		matrixA[4] = this.map.Scale.viewBox.width-this.map.Scale.bBox.width;
	}
	else{
		matrixA[4] = this.map.Scale.viewBox.width-(this.map.Scale.mapPosition.x+this.map.Scale.bBox.width);
	}
	setMatrix(this.map.Scale.offsetNode,matrixA);
	this.map.Scale	 = new Map.Scale();
	this.map.Viewport = new Map.Viewport(evt);
	// flip legend
	var SVGDoc = SVGDocument;
	var legendGroup  = SVGDoc.getElementById("legend:group");
	if ( legendGroup ){
		matrixA = getMatrix(legendGroup);
		if ( matrixA[4] == 0 ){
			var bBox = this.map.Dom.getBox(legendGroup);
			matrixA[4] = this.map.Scale.mapPosition.x+this.map.Scale.bBox.width;
		}
		else{
			matrixA[4] = 0;
		}
	setMatrix(legendGroup,matrixA);
	displayScale(evt,'bottom');
	this.map.Toolbar.refresh(evt);
	}
};
/**
 * change horizontal position of map and take the original legend width  
 */
var __nLegendSpace = 0;
Map.Api.prototype.extendMap = function(){
	// extend map
	var matrixA = getMatrix(this.map.Scale.offsetNode);
	__nLegendSpace = matrixA[4];
	if ( __nLegendSpace ){
		matrixA[4] = 0;
		setMatrix(this.map.Scale.offsetNode,matrixA);
		this.map.Zoom.doPanMap(__nLegendSpace/this.map.Scale.normalX(1)/2,0);
		this.map.Scale.reset();
		this.map.Viewport.reformat();
		try{
			this.map.Legend.hide();
		}
		catch (e){}
		try{
			HTMLWindow.ixmaps.htmlgui_onMapResize(window);
		}
		catch (e){
			this.map.Viewport.reformat();
		}
	}else{
		fInitLegendOff = true;
	}
};
/**
 * change horizontal position of map and take the original legend width  
 */
Map.Api.prototype.normalMap = function(){
	if ( __nLegendSpace <= 0 ){
		return;
	}
	// extend legend
	var matrixA = getMatrix(this.map.Scale.offsetNode);
	matrixA[4] = __nLegendSpace;
	setMatrix(this.map.Scale.offsetNode,matrixA);
	this.map.Zoom.doPanMap(-__nLegendSpace/this.map.Scale.normalX(1)/2,0);
	this.map.Scale.reset();
	this.map.Viewport.reformat();
	try{
		this.map.Legend.show();
	}
	catch (e){}
	try{
		HTMLWindow.ixmaps.htmlgui_onMapResize(window);
	}
	catch (e){
		this.map.Viewport.reformat();
	}
};
/**
 * hide the map legend
 */
Map.Api.prototype.hideLegend = function(){
	var SVGDoc = SVGDocument;
	var legendGroup  = SVGDoc.getElementById("legend:group");
	if ( legendGroup ){
		legendGroup.style.setProperty("display","none","");
	}
};
/**
 * show the map legend
 */
Map.Api.prototype.showLegend = function(){
	var SVGDoc = SVGDocument;
	var legendGroup  = SVGDoc.getElementById("legend:group");
	if ( legendGroup ){
		legendGroup.style.setProperty("display","inline","");
	}
};
/**
 * clear all map tools, highlights, themes, selections etc.
 */
Map.Api.prototype.clearAll = function(){
	this.map.clearAll();
};
/**
 * clear all chart themes
 */
Map.Api.prototype.clearAllCharts = function(){
	if ( this.map.Themes ){
		this.map.Themes.removeAllCharts();
	}
};
/**
 * clear all chart themes
 */
Map.Api.prototype.clearAllChoroplethe = function(){
	if ( this.map.Themes ){
		this.map.Themes.removeAllChoroplethe();
	}
};
/**
 * clear all overlays (info, message, ...)
 */
Map.Api.prototype.clearAllOverlays = function(){

	if(SVGPopupGroup){
		SVGToolsGroup.fu.clear();
	}
	if(SVGPopupGroup){
		SVGFixedGroup.fu.clear();
	}
	if(SVGPopupGroup){
		SVGPopupGroup.fu.clear();
	}
	if(SVGPopupGroup){
		SVGMessageGroup.fu.clear();
	}
	if ( this.map.Themes ){
		this.map.Themes.removeAllSelections();
	}
};
/**
 * get the actual envelope as a string
 * @return a string of the type "MinBoundX='1234.123 ..."
 */
Map.Api.prototype.getActualEnvelopeString = function(){
	return this.map.Zoom.getEnvelopeString();
};
/**
 * get the actual envelope as a set of coordinates
 * @return an array with 2 point objects
 */
Map.Api.prototype.getActualEnvelopeCoordinates = function(){
	return this.map.Zoom.getEnvelope();
};
/**
 * generate the actual zoom and pan as ARCXML &lt;ENVELOPE&gt; element<br>
 * (may be called by context menu to create information for building project XML code)
 */
Map.Api.prototype.printActualEnvelope = function(){
	var rectArea = this.map.Zoom.getBox();
	var pt1 = this.map.Scale.getMapCoordinate(rectArea.x,rectArea.y);
	var pt2 = this.map.Scale.getMapCoordinate(rectArea.x+rectArea.width,rectArea.y+rectArea.height);
	szPrint =  "<ENVELOPE minx=\""+pt1.x+"\"\n";
	szPrint += "          maxx=\""+pt2.x+"\"\n";
	szPrint += "          miny=\""+pt2.y+"\"\n";
	szPrint += "          maxy=\""+pt1.y+"\" name=\"Initial_Extent\" />";
	try{
		htmlgui_prettyPrintXML("Actual zoom Envelope (for SVGGIS XML)",szPrint+"\n");
	}
	catch (e){
		alert(szEnvelope);
	}
};
/**
 * create a text link with standard link text style 
 * @param targetNode where to create the nodes
 * @param szText the text to display
 * @param szLink the link to set: if "javascript:..."  set event handler to call this function
 * @return the created SVG object
 */
Map.Api.prototype.createTextLink = function(targetNode,szText,szLink){
	var linkNode = this.map.Dom.newGroup(targetNode);
	var aGroup = null;
	if ( szLink.match(/javascript/)){
		aGroup = this.map.Dom.constructNode("a",linkNode,{'xlink:href':''});
		var selfLink = this.map.Dom.newText(aGroup,0,this.map.Scale.normalY(nNormalFontSize*0.75),"font-family:arial;font-size:"+this.map.Scale.normalY(nNormalFontSize*0.75)+"px;fill:blue;",szText);
		var newRect = this.map.Dom.newShape('rect',aGroup,0,0,this.map.Scale.normalX(nNormalFontSize*10),this.map.Scale.normalY(nNormalFontSize+3),"fill:#fffff0;stroke:#000000;opacity:0");
		if ( selfLink ){
			newRect.setAttributeNS(null,"onclick",szLink);
			newRect.setAttributeNS(null,"onmousedown","this.map.Event.stopMouseEvent(evt)");
			newRect.setAttributeNS(null,"onmouseup","this.map.Event.stopMouseEvent(evt)");
		}
	}
	else{
		aGroup = this.map.Dom.constructNode("a",linkNode,{'xlink:href':szLink});
		this.map.Dom.newText(aGroup,0,this.map.Scale.normalY(nNormalFontSize*0.75),"font-family:arial;font-size:"+this.map.Scale.normalY(nNormalFontSize*0.75)+"px;fill:blue;",szText);
	}
	return linkNode;
};
/**
 * create and show info bubble (display the given Text Array as text grid with n columns; create a backround with a pointing edge and
 * position the bubble so that it points to the given map shape)
 * @param objNode the map shape to let the bubble point to
 * @param szTextA an array of strings containing the info text
 * @param nColumns number of columns for grid formtting
 * @return the created SVG object
 */
Map.Api.prototype.createInfoBubble = function(objNode,szTextA,nColumns){
	if ( objNode && szTextA ){
		if ( !nColumns ){
			nColumns = 1;
		}
		var szBubbleId = "bubble:"+String(Math.random()+":movable");
		var newText = createTextGrid(SVGDocument,SVGFixedGroup,szBubbleId,szTextA,nColumns);

		var offset = new point(this.map.Scale.normalX(-10),this.map.Scale.normalY(15));
		var position = this.map.Scale.getScreenPosition(objNode);
		var newPosition = this.map.Scale.clipWidgetObjectToSVG(newText,position,offset);
		newText.fu.setPosition(newPosition.x,newPosition.y);

		// make pointing edge

		var newPath = null;
		var bBox = this.map.Dom.getBox(newText);

		var buttonObj = new Button(newText,"xx","BUTTON",'#delete_button'
									,"this.map.Dom.removeElementById('"+szBubbleId+"')"
									,""
									,"remove");
		buttonObj.setPosition(bBox.width,this.map.Scale.normalY(9));
		bBox.width += this.map.Scale.normalY(9);

		if ( newPosition.y == position.y+offset.y ){
			szPeek = "top";
		}
		else {
			szPeek = "bottom";
		}
		if ( newPosition.x == position.x+offset.x ){
			szPeek += "left";
		}
		else {
			szPeek += "right";
		}
			
		var pSize   = this.map.Scale.normalX(15);
		var pXoff   = this.map.Scale.normalX(5);
		var xPos	= -offset.x;
		var yPos	= 0;
		var xR		= this.map.Scale.normalX(5);
		var yR		= this.map.Scale.normalX(5);

		var pHeight = offset.y;
		var pWidth  = this.map.Scale.normalX(15);
		var pPeek   = -offset.x-pXoff-xR;

		var szPath = 'M'+bBox.x+','+bBox.y+' ';

		szPath += 'm'+(xR)+','+(0)+' ';

		// top line  
		if ( szPeek == "topleft" ){
			szPath += 'l'+(pXoff)+','+(0)+' ';
			szPath += 'l'+(pPeek)+','+(-pHeight)+' ';
			szPath += 'l'+(-pPeek+pWidth)+','+(+pHeight)+' ';
			szPath += 'l'+(bBox.width-xR*2-pXoff-pWidth)+','+(0)+' ';
		}
		else
		if ( szPeek == "topright" ){
			szPath += 'l'+(bBox.width-xR*2-pXoff-pWidth)+','+(0)+' ';
			szPath += 'l'+(-pPeek+pWidth)+','+(-pHeight)+' ';
			szPath += 'l'+(pPeek)+','+(+pHeight)+' ';
			szPath += 'l'+(pXoff)+','+(0)+' ';
		}
		else{
			szPath += 'l'+(bBox.width-xR*2)+','+(0)+' ';
		}

		szPath += 'q'+(xR)+','+(0)+' '+(xR)+','+(yR)+' ';
		szPath += 'l'+(0)+','+(bBox.height-yR*2)+' ';
		szPath += 'q'+(0)+','+(yR)+' '+(-xR)+','+(yR)+' ';

		// bottom line  
		if ( szPeek == "bottomright" ){
			szPath += 'l'+(-pXoff)+','+(0)+' ';
			szPath += 'l'+(-pPeek)+','+(pHeight)+' ';
			szPath += 'l'+(+pPeek-pWidth)+','+(-pHeight)+' ';
			szPath += 'l'+(-bBox.width+xR*2+pXoff+pWidth)+','+(0)+' ';
		}
		else
		if ( szPeek == "bottomleft" ){
			szPath += 'l'+(-bBox.width+xR*2+pXoff+pWidth)+','+(0)+' ';
			szPath += 'l'+(pPeek-pWidth)+','+(pHeight)+' ';
			szPath += 'l'+(-pPeek)+','+(-pHeight)+' ';
			szPath += 'l'+(-pXoff)+','+(0)+' ';
		}
		else{
			szPath += 'l'+(-bBox.width+xR*2)+','+0+' ';
		}

		szPath += 'q'+(-xR)+','+(0)+' '+(-xR)+','+(-yR)+' ';
		szPath += 'l'+(0)+','+(-bBox.height+yR*2)+' ';

		szPath += 'q'+(0)+','+(-yR)+' '+(xR)+','+(-yR)+' ';
		szPath += 'z';

		newPath = this.map.Dom.newShape('path',newText,szPath,'fill:white;stroke:grey');
		newText.style.setProperty("filter","url(#DropShadowFilterTools)","");
		newPath.parentNode.insertBefore(newPath,newPath.parentNode.firstChild);
	}
};
/**
 * create and show info container with the given text and position it
 * position the bubble so that it points to the given map shape)
 * @param objNode the map shape to let the bubble point to
 * @param szTextA an array of strings containing the info text
 * @param nColumns number of columns for grid formtting
 * @return the created SVG object
 */
Map.Api.prototype.createInfoContainer = function(szId,szTextA,nColumns,xPos,yPos,szMode){
	if ( szId && szTextA ){
		if ( !szMode ){szMode = "fix";}
		var position = new point(xPos,yPos);
		var offset = new point(0,0);
		var newInfo = new InfoContainer(SVGDocument,SVGPopupGroup,szId+":more"+(szMode.match(/pointer/)?"":":movable"),position,offset,szMode);
		var infoWorkspace = newInfo.workspaceNode;

		var newText = createTextGrid(SVGDocument,infoWorkspace,szId+":more:textgrid",szTextA,2);
		this.map.Dictionary.applyToNode(newText);
		newInfo.reformat();
		this.map.Event.stopMouseEvent(evt);
		return newInfo;
	}
};
/**
 * get the target or the context menu (returns a SVG DOM element; may be called by context menu to get the assoziated object)
 * @return a SVG DOM element (or null)
 */
Map.Api.prototype.getContextMenuTarget = function(){
	return this.map.Event.contextMenuObj;
};
/**
 * get the shape of the actual map tool (= shape created by the map tool; actually polyline or polygon; both SVG path elements)
 * @return a SVG DOM element (or null)
 */
Map.Api.prototype.getMapToolShape = function(){
	return mapToolList.toolShape;
};
/**
 * get the points of an SVG shape in SVG coordinates (actually only implemented for 'path' elements)
 * @param objNode the map shape which coordinates are requested
 * @return an array with point objects; every point has the properties .x and .y)
 */
Map.Api.prototype.getShapePoints = function(objNode){
	// actually supports only path
	if ( objNode.nodeName == 'path' ){
		var ptList = new Array(0);
		var fMode = null;
		var ptOff = new point(0,0);
		var szD = objNode.getAttributeNS(null,"d");
		szD = szD.substr(1,szD.length-2);
		szDA = szD.split(' ');
		for ( var i=0; i<szDA.length; i++){
			if ( (szDA[i]=='l') || (szDA[i]=='L') ){
				fMode = szDA[i];
			}
			else{
				var szDPA = szDA[i].split(',');
				if ( fMode == 'l' ){
					ptList[ptList.length] = new point(ptOff.x+Number(szDPA[0]),ptOff.y+Number(szDPA[1]));
				}
				else{
					ptList[ptList.length] = new point(Number(szDPA[0]),Number(szDPA[1]));
				}
				ptOff = ptList[ptList.length-1];
			}
		}
		return ptList;
	}
	return null;
};
/**
 * get the points of an SVG shape in map coordinates (actually only implemented for 'path' elements)
 * @param objNode the map shape which coordinates are requested
 * @return an array with point objects; every point has the properties .x and .y)
 */
Map.Api.prototype.getShapeCoordinates = function(objNode){
	// actually supports only path
	if ( objNode.nodeName == 'path' ){
		var ptPointA = this.getShapePoints(objNode);
		if ( ptPointA ){
			var mapPos = null;
			var mapCoord = null;
			var ptCoordA = new Array(0);
			for ( a in ptPointA ){
				mapPos   = this.map.Scale.getMapPosition(ptPointA[a].x,ptPointA[a].y);
				mapCoord = this.map.Scale.getMapCoordinate(mapPos.x,mapPos.y);
				ptCoordA[ptCoordA.length] = new point(mapCoord.x,mapCoord.y);
			}
			return ptCoordA;
		}
	}
	return null;
};
/**
 * calculate the surface of a map shape
 * @param objNode the map shape to calculate its surface 
 * @return the calculated surface
*/
Map.Api.prototype.getSurface = function(objNode){
	if ( objNode ){
		// try to get stored area, if present, take this;
		// why: due to resolution reduction of the SVG, the stored area may be exacter
		if ( objNode.parentNode.nodeName == 'g' ){
			var szArea = objNode.parentNode.getAttributeNS(szMapNs,"area");
			if ( szArea && szArea.length){
				return Number(szArea);
			}
		}
		var ptList = this.getShapePoints(objNode);
		if ( ptList ){
			return __doGetPolygonSurface(ptList);
 		}
	}
	return null;
};
/**
 * calculate and show the surface of a map shape<br>
 * @param objNode the map shape 
 * @return the created SVG object to show the surface
 */
Map.Api.prototype.printSurface = function(objNode){
	if ( objNode ){
		var nArea = this.getSurface(objNode);
		if ( nArea ){
			var szText = this.map.Scale.formatSurfaceString(nArea) + "  ";
			var szTextA = new Array(szText);

			return this.createInfoBubble(objNode,szTextA,1);
 		}
	}
};
/**
 * may be called by context menu to show the info of the context map object
 */
Map.Api.prototype.displayContextMenuTargetInfo = function(){
	var contextMenuObj = this.map.Event.contextMenuObj;
	if ( contextMenuObj ){
		displayInfoDelayed(null,contextMenuObj,10);
	}
};

/**
 * may be called by context menu to remove the context map object
 */
Map.Api.prototype.removeContextMenuTarget = function(){
	var contextMenuObj = this.map.Event.contextMenuObj;
	if ( contextMenuObj ){
		this.map.Dom.clearGroup(SVGToolsGroup);
		mapToolList.clear();
	}
};
/**
 * may be called by context menu to remove the context map object, if it is part of a map tool (p.e. a polyline point).
 */
Map.Api.prototype.removeContextMapTool = function(){
	var contextMenuObj = this.map.Event.contextMenuObj;
	if ( contextMenuObj ){
		for ( ;  contextMenuObj;  contextMenuObj = contextMenuObj.parentNode){
			if ( contextMenuObj.getAttributeNS(null,"id").match(/maptoolnode/) ){
				mapToolList.removeMapTool(contextMenuObj);
				return;
			}
		}
	}
};
/**
 * may be called by context menu to create a buffer for the context map object
 */
Map.Api.prototype.createContextMenuTargetBuffer = function(){
	var contextMenuObj = this.map.Event.contextMenuObj;
	if ( contextMenuObj ){
		var contextObj = new MapObject(contextMenuObj);
		if ( contextObj.szId.match(/legend:setactive/)){
			var szTemp = contextObj.szId.split("legend:setactive:")[1];
			var szLayer = szTemp.split("::")[0];
			var szSubLayer = szTemp.split("::")[1];
			var layerObj = this.map.Layer.getLayerObjOfNode(contextObj.objNode);
		}
		this.map.Themes.newTheme2(szLayer,layerObj.szRenderer,'',"type:CHART|BUFFER;align:center;colorscheme:#aa4400;ranges:"+szSubLayer+";buffersize:1000;opacity:0.3;label:Ripetitore",
					'Buffer (1 km)','Ripetitore');
	}
};
/**
 * wrapper, to call theme creating function (old style)
 * @param szThemes the map layer(themes) to include into the new map theme; one ore more layer separated by '|'
 * @param szField the name of the field(s) to take the value; one ore more fieldnames separated by '|'
 * @param szField100 the name of the field to take the fraction value (for % analysis)
 * @param szFlag defines the type of the theme and representation details
 * @param colorScheme defines the colors to visualize the map theme; the number of colors in the scheme defines the number of classes (bars, pieparts, etc.)
 * @param szTitle title text to be displayed in the info pane of the map theme
 * @param szLabelA an array of texts to define label for classes, or chart parts
 * @return A new MapTheme object
 */
Map.Api.prototype.createTheme = function(szThemes,szFields,szField100,szFlag,colorScheme,szTitle,szLabelA){
	return this.map.Themes.newTheme(szThemes,szFields,szField100,szFlag,colorScheme,szTitle,szLabelA);
};
/**
 * Create a new map theme. This can be a choroplethe theme (colorize shapes) or charts (bubbles, bar charts, pies ...).<br>
 * A theme can be created on base of one or more layer (szThemes) and a list of data fields to process.<br>
 * When the theme is been created, a theme legend will pop up.
 * @param szThemes the map layer(themes) to include into the new map theme; one ore more layer separated by '|'
 * @param szFields the name of the field(s) to take the value(s); one ore more fieldnames separated by '|'
 * @param szField100 the name of the field to take the 100% or fraction value 
 * @param szStyle define the theme style
 * <br><br>szStyle is a string to define multiple properties with a syntax similar to CSS styles.<br>
 * <br>Sample: <em>'type:CHOROPLETHE;classes:5;colorscheme:spectrum'</em>
 * <br><br>The following properties can be set in szStyles:
 * <br><br>
 *  <table >
 *  <tr align="left"><th>property</th><th>decription</th><th>sample</th></tr>
 *  <tr><td>type</td><td>the theme/chart type</td><td>type:CHOROPLETHE|QUANTILE<br>type:CHART|BAR|3D|STACKED</td></tr>
 *  <tr><td  colspan="3" ><em>here is a list of all possible types</em></td></tr>
 *  <tr><td  colspan="3" >
 *   <table border="1" >
 *   <tr><td>CHOROPLETHE</td><td>colorize map shapes (poligons,lines)</td></tr>
 *   <tr><td></td><td>
 *   <table border="1" >
 *   <tr><td>EQUIDISTANT</td><td>generate equidistant classes</td></tr>
 *   <tr><td>QUANTILE</td><td>generate classes with equal number of members</td></tr>
 *   <tr><td>BUFFER</td><td>extends CHOROPLETHE on lines</td></tr>
 *   <tr><td>EXACT</td><td>select color by value </td></tr>
 *   <tr><td>RANGE</td><td>select color by given value ranges</td></tr>
 *   <tr><td>DOMINANT</td><td>select color by the greatest value</td></tr>
 *   <tr><td>PERCENTOFMEAN</td><td>select color by the value that is highest above the statistical mean</td></tr>
 *   </table>
 *   </td></tr>
 *   <tr><td>CHART</td><td>indicates a chart (BAR|BUBBLE|PIE..) theme</td></tr>
 *   <tr><td></td><td>
 *   <table border="1" >
 *   <tr><td>BUBBLE</td><td>show values as sized and colored circles </td></tr>
 *   <tr><td>SQUARE</td><td>show values as sized and colored squares</td></tr>
 *   <tr><td>BAR</td><td>show values as bar chart</td></tr>
 *   <tr><td>PIE</td><td>make pie chart</td></tr>
 *   <tr><td>DONUT</td><td>make donut</td></tr>
 *   <tr><td>STARBURST</td><td>make star burst chart</td></tr>
 *   </table>
 *   </td></tr>
 *   <tr><td></td><td>
 *   <table border="1" >
 *   <tr><td>POINTER</td><td>extends BAR: show single bar with arrow top</td></tr>
 *   <tr><td>STACKED</td><td>extends BAR: creates stacked bar chart </td></tr>
 *   <tr><td>COMPRESS</td><td>extends BAR: make bar half size (good vor horizontal barcharts) </td></tr>
 *   <tr><td>SPACED</td><td>extends BAR: make smaller bars with space between each other</td></tr>
 *   <tr><td>UP</td><td>extends BAR: make bar chart bottom up</td></tr>
 *   <tr><td>LEFT</td><td>extends BAR: make horizontal bars to the left</td></tr>
 *   <tr><td>RIGHT</td><td>extends BAR: make horizontal bars to the right</td></tr>
 *   <tr><td>HORZ</td><td>extends BAR: make horizontal bars</td></tr>
 *   <tr><td>CENTER</td><td>extends BAR: center the bar around 0</td></tr>
 *   <tr><td>SUM</td><td>extends BAR: show sum values instead of percentage</td></tr>
 *   </table>
 *   </td></tr>
 *   <tr><td></td><td>
 *   <table border="1" >
 *   <tr><td>SIZE</td><td>size the chart to the 100% value; applies to PIE,DUNUT,STARBURST</td></tr>
 *   <tr><td>SURFACE</td><td>size the BUBBLE,SQUARE in the way that its surface represets the value</td></tr>
 *   <tr><td>VOLUME</td><td>size the 3D PIE|DONUT|STARBURST in a way, that the volume equals the 100% value</td></tr>
 *   <tr><td>HEIGHT</td><td>set the height of the 3D PIE|DONUT|STARBURST according to the 100% value</td></tr>
 *   </table>
 *   </td></tr>
 *   <tr><td></td><td>
 *   <table border="1" >
 *   <tr><td>3D</td><td>extends all CHARTS to 3D</td></tr>
 *   <tr><td>RELATIVE</td><td>calculate the value as relative value respective to the 100% value</td></tr>
 *   <tr><td>DIFFERENCE</td><td>calculate the value as difference of value[n] and value[n-1]</td></tr>
 *   <tr><td>ZEROISVALUE</td><td>0 is a valid value</td></tr>
 *   <tr><td>NEGATIVEISVALUE</td><td>negative values are valid</td></tr>
 *   <tr><td>VALUES</td><td>show values as text</td></tr>
 *   <tr><td>NORMSIZE</td><td>generate normalized charts (fix size for menu)</td></tr>
 *   <tr><td>NOLINES</td><td>don't make boundary lines for the chart shapes (e.g. pie parts)</td></tr>
 *   <tr><td>SILENT</td><td>don't generate interactive events on chart parts</td></tr>
 *   <tr><td>WHITELINES</td><td>make white boundary lines for the chart shapes</td></tr>
 *   </table>
 *  </td></tr>
 *  </table>
 *  </td></tr>
 *  <tr height="20"><td></td></tr>
 *  <tr><td>classes</td><td>define the number of classes for choroplethe themes</td><td>1 - 50</td></tr>
 *  <tr><td>colorscheme</td><td>define a colorscheme</td><td>e.g. 'colorscheme:#eeeeff,#0000dd'</td></tr>
 *  <tr><td>colorstyle</td><td>define color scheme derivations for 'spectrum' colorscheme</td><td>e.g. 'colorstyle:pastel'</td></tr>
 *  <tr><td>filter</td><td>filter for 'DOMINANT' themes; defines the condition together with dfilter</td><td>min / max / mean / median</td></tr>
 *  <tr><td>dfilter</td><td>defines the percentage to add to the filter</td><td>e.g. 'filter:mean;dfilter:30' means: mean + 30% is the significant value fo dominance</td></tr>
 *  <tr><td>overviewchart</td><td>define the type of overviewchart for choroplethte themes</td><td>none / PIE / DONUT</td></tr>
 *  <tr><td>evidence</td><td>how to evidence class member, if the mouse is over a class in the legend</td><td>isolate / highlight</td></tr>
 *  <tr><td>opacity</td><td>set the initial opacity for this theme</td><td>e.g. opacity:0.5</td></tr>
 *  <tr><td>dbtable</td><td>associate an external (javascript) database table to this theme</td><td>name of the table (without suffix!)<br> e.g. dbtable:layerdb</td></tr>
 *  <tr><td>lookupfield</td><td>define a field of the above external table which values can be used to find the theme shapes;</td><td>eg lookupfield:statename</td></tr>
 *  <tr><td>ranges</td><td>define class ranges explicitly</td><td>e.g. ranges:0,100,200,300</td></tr>
 *  <tr><td>scale</td><td>define an initial scale for the generated chart objects</td><td>e.g. scale:2.0</td></tr>
 *  <tr><td>align</td><td>define how to align the generated chart objects to the map position</td><td>center / below / right / left</td></tr>
 *  <tr><td>units</td><td>define units for the value display</td><td>e.g. units:mg/l</td></tr>
 *  </table>
 * <br>
 * @param szTitle title text to be displayed in the info pane of the map theme
 * @param szLabel a string with label separated by '|' to define label for classes, or chart parts
 * @return A new MapTheme object
 * <br><br>
 * <strong>Samples:</strong>
 * <br> this.map.Api.newMapTheme("layer","fieldA","","style=type:CHOROPLETHE|EQUIDISTANT;classes:10;colorscheme:spectrum,pastel"); 
 * <br> this.map.Api.newMapTheme("layer","fieldA","field100","style=type:CHOROPLETHE;",title="this theme"); 
 * <br><br>
*/
Map.Api.prototype.newMapTheme = function(szThemes,szFields,szField100,szStyle,szTitle,szLabel){
	if ( this.map.Zoom.fExternalZoom ){
		this.map.pushAction("map.Api.newMapTheme(\""+szThemes+"\",\""+szFields+"\",\""+szField100+"\",\""+szStyle+"\",\""+szTitle+"\",\""+szLabel+"\")");
		return;
	}else
	if ( this.executeWithPush){
		this.map.pushAction("map.Themes.newTheme2(\""+szThemes+"\",\""+szFields+"\",\""+szField100+"\",\""+szStyle+"\",\""+szTitle+"\",\""+szLabel+"\")");
	}else{
		return this.map.Themes.newTheme2(szThemes,szFields,szField100,szStyle,szTitle,szLabel);
	}
};

Map.Api.prototype.newMapThemeByObj = function(themeObj){
	return this.map.Themes.newThemeByObj(themeObj);
};

/**
 * change the style of the theme given by szId (wrapper)
 * @param szId the id of the chart group 
 * @param szStyle the new style
 * The following styles can be changed/set:
 * <br><br>
 *  <table>
 *  <tr><td>type</td><td>change the theme/chart type</td><td>CHOROPLETHE,QUANTILE,BUBBLE,etc. see create chart for complete list</td></tr>
 *  <tr><td>classes</td><td>change the number of classes for choroplethe themes</td><td>1 - 50</td></tr>
 *  <tr><td>colorscheme</td><td>define a new colorscheme</td><td>e.g. 'colorscheme:#eeeeff,#0000dd'</td></tr>
 *  <tr><td>colorstyle</td><td>define color scheme derivations for 'spectrum' colorscheme</td><td>e.g. 'colorstyle:pastel'</td></tr>
 *  <tr><td>filter</td><td>filter for 'DOMINANT' themes; defines the condition together with dfilter</td><td>min / max / mean / median</td></tr>
 *  <tr><td>dfilter</td><td>defines the percentage to add to the filter</td><td>e.g. 'filter:mean;dfilter:30' means: mean + 30% is the significant value fo dominance</td></tr>
 *  <tr><td>overviewchart</td><td>define the type of overviewchart for choroplethte themes</td><td>none / PIE / DONUT</td></tr>
 *  <tr><td>evidence</td><td>how to evidence class member, if the mouse is over a class in the legend</td><td>isolate / highlight</td></tr>
 *  </table>
 * <br>
 * <strong>Samples:</strong>
 * <br> this.map.Api.changeThemeStyle("type:CHOROPLETHE|EQUIDISTANT;classes:10;colorscheme:spectrum,pastel;overviewchart:PIE|3D"); 
 * <br> this.map.Api.changeThemeStyle("type:CHART|BUBBLE|SURFACE|VALUE"); 
 * <br> this.map.Api.changeThemeStyle("type:CHART|PIE|DONUT|3D|VOLUME");
 * <br><br>
 * <strong>Hints:</strong>
 * <br>
 * CHOROPLETHE type can be changed only to BUBBLE type.<br>
 * CHART type can be changed into DOMINANT type.<br>
 */
Map.Api.prototype.changeContextThemeStyle = function(contextNode,szStyle){
	var widgetObj = new MapObject(contextNode);
	this.map.Themes.changeThemeStyle(null,widgetObj.szId,szStyle);
};

Map.Api.prototype.changeThemeStyle = function(szId,szStyle,szFlag){
	this.map.Themes.changeThemeStyle(null,szId,szStyle,szFlag);
};
Map.Api.prototype.showThemeClass = function(szId,nIndex,nStep){
	this.map.Themes.showClass(null,szId,nIndex,nStep);
};
Map.Api.prototype.hideThemeClass = function(szId,nIndex,nStep){
	this.map.Themes.hideClass(null,szId,nIndex,nStep);
};
Map.Api.prototype.markThemeClass = function(szId,nIndex,nStep){
	this.map.Themes.markClass(null,szId,nIndex,nStep);
};
Map.Api.prototype.unmarkThemeClass = function(szId,nIndex,nStep){
	this.map.Themes.unmarkClass(null,szId,nIndex,nStep);
};
Map.Api.prototype.filterThemeItems = function(szId,szFilter,mode){
	this.map.Themes.filterItems(null,szId,szFilter,mode);
};
Map.Api.prototype.selectFilterItems = function(szId){
	this.map.Themes.selectFilterItems(null,szId);
};
Map.Api.prototype.popupThemeStyleMenu = function(szId){
	this.map.Themes.chartTypeMenu(null,szId);
};

/**
 * wrapper for theme clips (theme with a number of frames, like a video clip)
 */
Map.Api.prototype.nextClipFrame = function(szId){
	this.map.Themes.nextClipFrame(szId);
};
Map.Api.prototype.setClipFrame = function(szId,n){
	this.map.Themes.setClipFrame(szId,n);
};
Map.Api.prototype.pauseClip = function(szId){
	this.map.Themes.pauseClip(szId);
};
Map.Api.prototype.startClip = function(szId){
	this.map.Themes.startClip(szId);
};

/**
 * wrapper, to get a theme
 */
Map.Api.prototype.getTheme = function(szId){
	return this.map.Themes.getTheme(szId);
};
/**
 * wrapper, to get all active Themes
 */
Map.Api.prototype.getAllThemes = function(){
	return this.map.Themes.getAllThemes();
};
/**
 * wrapper, to get the definitions of all actual map Themes
 */
Map.Api.prototype.getMapThemeDefinitionStrings = function(){
	return this.map.Themes.getAllThemeDefinitionStrings();
};
/**
 * wrapper, to get the definitions of one map Theme
 */
Map.Api.prototype.getMapThemeStyleString = function(szId){
	return this.map.Themes.getMapThemeStyleString(szId);
};
/**
 * wrapper, to get the definition object of one map Theme
 */
Map.Api.prototype.getMapThemeDefinitionObj = function(szId){
	return this.map.Themes.getMapThemeDefinitionObj(szId);
};
/**
 * wrapper, to remove one theme
 */
Map.Api.prototype.removeTheme = function(szId){
	this.map.Themes.removeTheme(null,szId);
};
/**
 * wrapper, to remove all created themes
 */
Map.Api.prototype.removeAllThemes = function(){
	this.map.Themes.removeAll();
};
/**
 * get the id of a map theme; needed bcause szId may be obfuscated
 * @param objNode an arbitrary map node
 */
Map.Api.prototype.getThemeId = function(themeNode){
	if (themeNode){
		return themeNode.szId;
	}
	return null;
};
/**
 * set external data object for actual theme
 * @param szThemeId the theme id string (optional)
 * @param dataObj the object containing the data to set
 * @param szDataName the nane of the future data object
 */
Map.Api.prototype.setThemeExternalData = function(szThemeId,dataObj,szDataName){
	// create the data object with the desired name, must be identical to style ...
	// export argument dataObj, necessary for javascript compressin by Google Code Compiler 
	if ( dataObj ){
		this._dataObj = dataObj;
		eval(szDataName+" = this._dataObj");
	}
	// remove flag that bloks the theme execution (because we were wairting for the data)
	this.map.Themes.fWaitingforData = false;
	// retrigger theme execution
	this.map.Themes.execute();
};

/**
 * remove a DOM element given by its id
 * @param szId the id of the object (shape,group,...) to remove
 */
Map.Api.prototype.removeElementById = function(szId){
	var objNode = SVGDocument.getElementById(szId);
	if (objNode && objNode.parentNode ){
		objNode.parentNode.removeChild(objNode);
	}
};
/**
 * get the id of a map object; bubbles up the DOM until an id is found
 * @param objNode an arbitrary map node
 */
Map.Api.prototype.getShapeId = function(objNode){
	var mapObj = new MapObject(objNode);
	if (mapObj){
		return mapObj.szId;
	}
	return null;
};
/**
 * get the layer obj a map node
 * @param objNode an arbitrary map node
 */
Map.Api.prototype.getShapeLayerObj = function(objNode){
	var layerObj = this.map.Layer.getLayerObjOfNode(objNode);
	if (layerObj){
		return layerObj;
	}
	return null;
};
/**
 * get the name of the layer of a map node
 * @param objNode an arbitrary map node
 * @type string	
 * @return the layer name or null
 */
Map.Api.prototype.getShapeLayerName = function(objNode){
	var layerObj = this.map.Layer.getLayerObjOfNode(objNode);
	if (layerObj){
		return layerObj.szName;
	}
	return null;
};
/**
 * get a named array of metadata of a map shape
 * @param objNode an arbitrary map node
 */
Map.Api.prototype.getShapeMetadataArray = function(objNode){
	var szData   = this.map.Dom.getAttributeByNodeOrParents(objNode,szMapNs,"info");
	var szTitles = "";
	var mapObj = new MapObject(objNode);
	if (mapObj){
		szTitles = this.map.Dom.getAttributeByNodeOrParents(mapObj.objNode.parentNode,szMapNs,"info");
	}
	if ( szTitles && szData ){
		szTitleA = szTitles.split("|");
		szDataA  = szData.split("|");
		if ( szTitleA.length && szDataA.length ){
			var dataArray = new Array(0);
			for ( var i=0; i<szTitleA.length; i++){
				dataArray[szTitleA[i]] = szDataA[i]; 
			}
			return dataArray;
		}
	}
	return null;
};

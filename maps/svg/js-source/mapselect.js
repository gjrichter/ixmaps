/**********************************************************************
 mapselect.js

$Comment: provides selection facilities for svggis
$Source : mapselection.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2007/08/25 $
$Author: guenter richter $
$Id: mapselect.js 9 2007-08-25 16:39:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: mapselect.js,v $
**********************************************************************/
var mapSelection = null;
/** 
 * @fileoverview This file provides the classes for map select functions<br>
 * (select by map tool, shape, buffers)
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */
/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true */
/* globals
	window, alert, setTimeout, _TRACE,
	szMapNs, Methods, MapObject, HighLight, activeSelection, 
	SVGDocument, HTMLWindow, getMatrix, setMatrix, SVGPopupGroup, SVGToolsGroup, SVGFixedGroup, SVGMessageGroup,
	Map, map, thisversion, box, point, Button, MapTool, setMapTool, szMapToolType, InfoContainer, mapToolList, highLightList, 
	displayMessage, clearMessage, executeWithMessage, displayInfoDelayed, displayScale, createTextGrid, __getStyleObj, getActiveTheme,
	loadSVGIncludes, bookmarkList, fInitLegendOff, fPreserveMapRatio, fPendingNewGeoBounds, fFroozeDynamicContent, zoomAndPanHistory,
	nNormalFontSize, htmlgui_prettyPrintXML, __doGetPolygonSurface, antiZoomAndPanList, szTextGridStyle, __formatValue, DonutCharts
	
	*/

/**
 * Create a new Selections instance.  
 * @class It realizes an object to create and manage map selections (buffer, circle, square, ... )
 * @constructor
 * @throws 
 * @return A new Selections object
 */
Map.Selections = function() {
};
Map.Selections.prototype = new Map();
// create instance on load
if ( (typeof(thisversion) == "string") && map.checkVersion(thisversion) ){
	map.Selections = new Map.Selections(); 
}
else{
	alert("Map.Themes incompatible !");
}
/**
 * creates a new map selection
 * <br>
 * @parameter szThemes the map layer(themes) to include into the new map selection
 * @parameter szSelectShape an optional shape, to act as the selecting area 
 * @parameter szFlag defines the type of the selection
 * @parameter szTitle title text to be displayed in the info pane of the selection
 * @throws 
 * @return A new MapSelection object
**/
Map.Selections.prototype.newSelection = function(szThemes,szSelectShape,szStyle,szTitle){

	if ( szSelectShape == null ){
		displayMessage("empty selection",1000);
		return null;
	}

	var mapTheme = null;

	// get the style object of the new selection
	var styleObj = null;
	if ( szStyle == null ){
		szStyle="type:circle";
	}

	var szStyleA = szStyle.split('style=');
	if ( szStyleA && szStyleA.length > 1 ){
		styleObj = __getStyleObj(szStyleA[1]);
	}
	else{
		styleObj = __getStyleObj(szStyle);
	}

	// create the new selection
	_TRACE(szStyle);
	if (styleObj ){

		_TRACE(styleObj.type);
		// if the theme is given generic as 'active theme', get this
		if ( szThemes == "activeLayer" ){
			szThemes = getActiveTheme(); // see mapscript.js
			// if no active layer; may be we have an active map theme ( see mapthemes.js)
			if ( (szThemes == null) && map.Themes.activeTheme ){
				szThemes = map.Themes.activeTheme.szThemes;
			}
		}
		// without a theme, no selection
		if ( szThemes == null ){
			displayMessage("nothing to select!",1000);
			return null;
		}
		// here we go 
		mapSelection = new MapSelection(szThemes,szSelectShape,"SELECTION|"+styleObj.type,szTitle);

		if ( styleObj.buffersize ){
			mapSelection.nBufferSize = styleObj.buffersize;
		}
	}
	// add Selection to map Themes
	mapSelection.parent = map.Themes;
	map.Themes.addTheme(mapSelection);
	mapSelection.fRealize = true;

	_TRACE("ok");
	executeWithMessage("map.Themes.execute()","please wait ...");

	return mapSelection;
};


// .............................................................................
// MapSelection
// .............................................................................

/**
 * This is the MapSelection class.  
 * It realizes an object for map selections (by shapes, buffer, ...)
 * @constructor
 * @parameter mapThemes the map layer(themes) to include into the new map selection
 * @parameter szSelectShape
 * @parameter szFlag defines the type of the selection
 * @parameter szTitle title text to be displayed in the info pane of the selection
 * @throws 
 * @return A new MapSelection object
 */
function MapSelection(szThemes,szSelectShape,szFlag,szTitle) {
	
	var i;

	/** number of shapes in the themes */
	this.nCount = 0;
	/** number of selected shapes */
	this.nSelected = 0;
	/** themes/layer included into the selection */
	this.szThemes = szThemes;
	/** split the themes string into an array of strings */
	this.szThemesA = szThemes.split('|');
	/** the definition of the selecting shape, if null, select all */
	this.szSelectShape = szSelectShape;

	/** private highlight list, to highlight the selected shapes */
	this.highLightList = new HighLight();

	/** the title of the selection */
	this.szTitle = szTitle?szTitle:"["+szSelectShape+"] - "+szThemes;
	this.szTitle = map.Dictionary.getLocalText(this.szTitle); 
	/** flag: holds the flag that defines the theme type, info pane style, ...) */
	this.szFlag = szFlag?szFlag:"";
	/** holds the original flag */
	this.szOrigFlag = this.szFlag;
	/** a refresh timeout in seconds */
	this.nRefreshTimeout = 0;
	/** holds the (created) unique id of the theme */
	this.szId = "theme"+String(Math.random());
	/** holds the type of the theme layer (for paint) */
	this.szShapeType = "polygon";

	_TRACE("==> new MapSelection("+szThemes+","+szSelectShape+","+szFlag+")");
}

/**
 * initialize the map theme values
 */
MapSelection.prototype.initValues = function(){

	this.nNodes = 0;
	this.nCount = 0;
	this.nTested = 0;
	this.nThemeItems = 0;
	this.nSelected = 0;
	this.nSelectedArea = 0;
	
	// selection on charts --> 'generic'
	this.activeTheme = map.Themes.getTheme(this.szThemes) || map.Themes.getTheme();
	// to detect selection on charts ! theme layer == selection layer !
	if ( (this.activeTheme.szThemes == this.szThemes || this.activeTheme.szId == this.szThemes) && 
		this.activeTheme.szFlag.match(/CHART/) &&
		!this.activeTheme.szFlag.match(/MULTIPLE/)){
		this.szThemes = "generic";
	}

	// get nodes of the layer (theme(s)) which can be selected
	// ----------------------------------------------------------
	this.themeNodesA = new Array(0);

	if ( this.szThemes == "generic" ){

		// a) selection on generic theme and not on layer 		
		// ----------------------------------------------------------

		var themeObj = this.activeTheme;
		if ( themeObj.filterNodesA && (themeObj.filterNodesA != this.szSelectShape) ){
			this.themeRootNodesA =  myclone(themeObj.filterNodesA);
		}else{
			this.themeRootNodesA =  myclone(themeObj.indexA);
		}
		this.nCount = this.nNodes = this.nThemeItems = this.themeRootNodesA?this.themeRootNodesA.length:0;
		_TRACE(this.nCount+" nodes to check");
		
	}else{

		// b) selection on layer items	
		// ----------------------------------------------------------

		// get all root nodes (incl. tiles) of the layer
		this.themeRootNodesA = new Array(0);
		for ( var i=0; i<this.szThemesA.length; i++){
			_TRACE("Selection: get nodes of theme: "+ this.szThemesA[i]);
			var layerObj = map.Layer.getLayerObj(this.szThemesA[i]);
			if (layerObj) {
				if ( !layerObj.szSelection || layerObj.szSelection.length === 0 ){
					continue;
				}
				this.szThemeType = layerObj.szType;
				this.nThemeItems += layerObj.nItems;

				var tileRootNodesA = new Array(0);
				if ( layerObj.szFlag.match(/tiled/) ){
					_TRACE("Selection: get tile nodes of theme: "+ this.szThemesA[i]);
					tileRootNodesA = map.Tiles.getTileNodes(this.szThemesA[i]);
				}else{
					tileRootNodesA[0] = SVGDocument.getElementById(layerObj.szName);
				}
				// renderer dependent subgroups ??
				if ( (layerObj.nRenderer&1) && layerObj.szRenderer && layerObj.szRenderer.length ){
					for ( var k=0; k<tileRootNodesA.length; k++ ){
						var rootNode = tileRootNodesA[k];
						var rendererRootNodesA = rootNode.childNodes;
						for ( var r=0; r<rendererRootNodesA.length; r++ ){
							if (rendererRootNodesA.item(r).nodeType == 1 && rendererRootNodesA.item(r).hasChildNodes()){
								this.themeRootNodesA[this.themeRootNodesA.length] = rendererRootNodesA.item(r);
							}
						}
					}
				}else{
					for ( k=0; k<tileRootNodesA.length; k++ ){
						this.themeRootNodesA[this.themeRootNodesA.length] = tileRootNodesA[k];
					}
				}
			}
		}

		if ( this.themeRootNodesA.length === 0 ){
		_TRACE("error: no active layer");
			return false;
		}
		// get the child nodes of the collected root nodes
		_TRACE(this.themeRootNodesA.length+" root nodes");
		for ( var i=0; i<this.themeRootNodesA.length; i++ ){
			var addNodes = this.themeRootNodesA[i].childNodes;
			_TRACE(addNodes.length+" nodes in theme");
			this.nNodes += addNodes.length;
		}	
		this.nCount = this.nNodes;
		_TRACE(this.nCount+" nodes to check");
	}

	// init selecting shapes 
	// -------------------------------------------------------
	if ( this.szSelectShape == "queryresult" ){
		return true;
	}
	else
	if ( typeof(this.szSelectShape) == "object" ){

		// case I: we have already a list of the elements to select 
		// --------------------------------------------------------

		this.queryResultA = this.szSelectShape;
		if ( this.szThemes == "generic" ){
			// a) theme is not based on map items, position is in the id !!!
			for ( i=0; i<this.szSelectShape.length; i++ ){
				this.themeRootNodesA[i] = this.szSelectShape[i];
			}
		}else{
			// b) theme is based of map items
			for ( i=0; i<this.szSelectShape.length; i++ ){
				this.themeRootNodesA[i] = this.szSelectShape[i].node.parentNode;
			}
		}
		this.themeRootNodesA.length = this.szSelectShape.length;
		this.nNodes = this.szSelectShape.length;
		this.szSelectShape = "queryresult";
		this.szSelectQuery = this.szTitle;
		if ( !this.markGroup ){
			this.markGroup = map.Dom.newGroup(map.Layer.objectGroup,this.szId+":markgroup");
		}
		return true;
	}
	else
	if ( this.szSelectShape == "activeBuffer" ){

		// case II: selection by buffer 
		// ------------------------------------------------

		var mapTheme = map.Themes.activeBuffer;
		if ( mapTheme != null ){
			_TRACE(mapTheme.szThemesA[0]);
			var nodeA = [];
			var rootGroup = mapTheme.chartGroup;
			var childsA = rootGroup.getElementsByTagName('path');
			var childsB = rootGroup.getElementsByTagName('circle');

			for ( i=0; i<childsA.length; i++){
				nodeA[nodeA.length] = childsA.item(i);
			}
			for ( i=0; i<childsB.length; i++){
				nodeA[nodeA.length] = childsB.item(i);
			}
			_TRACE(nodeA.length);
			this.selectCenterA = [];
			for ( i=0; i<nodeA.length; i++){
				this.selectCenterA[this.selectCenterA.length] = map.Scale.getMapOffset(nodeA[i]);
			}
			this.selectBufferSize = mapTheme.nBufferSize/map.Scale.mapUnitsPPX; 
			this.selectScale = mapTheme.nScale; 

			if ( !this.markGroup ){
				this.markGroup = map.Dom.newGroup(map.Layer.objectGroup,this.szId+":markgroup");
			}
			return true;
		}
		else{
			alert("error: no active theme/buffer to select with");
			_TRACE("error: no active theme");
			return false;
		}
	}
	else
	if ( this.szSelectShape == "mapbounds" ){
		
		// case III: selection by map bounds
		// ----------------------------------
		
		var bBox = map.Zoom.getBox();
		this.selectCenterA = [];
		this.selectionCenter = new point(bBox.x+bBox.width/2,bBox.y+bBox.height/2);
		this.selectCenterA.push(this.selectionCenter);
		this.selectBufferSizeX = bBox.width/2;
		this.selectBufferSizeY = bBox.height/2;
		this.selectScale = 1; 
		return true;
	}
	else{
		
		// case IV: selection by user drawn shape (rect or circle)
		// --------------------------------------------------------

		this.selectCenterA = [];
		_TRACE("???? ---- "+this.szSelectShape);
		var bufferNode = SVGDocument.getElementById(this.szSelectShape);
		if ( !bufferNode ){
			return false;
		}
		bufferNode.fu = new Methods(bufferNode);

		if ( this.szFlag.match(/shape/)){
			
			var ptPos = bufferNode.fu.getPosition();
			var bBox  = bufferNode.fu.getBox();
			this.selectionCenter = new point(bBox.x+bBox.width/2,bBox.y+bBox.height/2);
			this.selectCenterA[this.selectCenterA.length] = this.selectionCenter;
			this.selectBufferSize = Math.max(bBox.width/2,bBox.height/2);
			this.selectBufferSize /= map.Scale.nZoomScale;
		}
		else if ( this.szFlag.match(/circle/)){
			var ptPos = bufferNode.fu.getPosition();
			ptPos.x = Number(bufferNode.getAttributeNS(null,"cx"));
			ptPos.y = Number(bufferNode.getAttributeNS(null,"cy"));
			this.selectionCenter = new point(ptPos.x,ptPos.y);
			this.selectCenterA[this.selectCenterA.length] = map.Scale.getMapPosition(ptPos.x,ptPos.y);
			ptPos = map.Scale.getMapPosition(ptPos.x,ptPos.y);
			this.selectBufferSize = bufferNode.getAttributeNS(null,"r");
			if (this.selectBufferSize === 0){
				return false;
			}
			// from widget to canvas
			var matrixA = antiZoomAndPanList.getActualMatrix();
			this.selectBufferSize	= this.selectBufferSize*matrixA[0];
		}
		else if ( this.szFlag.match(/square/)){
			var ptPos = bufferNode.fu.getPosition();
			ptPos.x = Number(bufferNode.getAttributeNS(null,"x"));
			ptPos.y = Number(bufferNode.getAttributeNS(null,"y"));
			var nWidth  = Number(bufferNode.getAttributeNS(null,"width"));
			var nHeight = Number(bufferNode.getAttributeNS(null,"height"));
			this.selectionCenter = new point(ptPos.x+nWidth/2,ptPos.y+nHeight/2);
			this.selectCenterA[this.selectCenterA.length] = map.Scale.getMapPosition(ptPos.x+nWidth/2,ptPos.y+nHeight/2);
			ptPos = map.Scale.getMapPosition(ptPos.x+nWidth/2,ptPos.y+nHeight/2);
			this.selectBufferSizeX = nWidth/2;
			this.selectBufferSizeY = nHeight/2;
			if (this.selectBufferSizeX === 0 || this.selectBufferSizeY === 0){
				return false;
			}
			// from widget to canvas
			var matrixA = antiZoomAndPanList.getActualMatrix();
			this.selectBufferSizeX	= this.selectBufferSizeX*matrixA[0];
			this.selectBufferSizeY	= this.selectBufferSizeY*matrixA[0];
		}
		this.selectScale = map.Scale.nZoomScale; 
		if ( !this.markGroup ){
			this.markGroup = map.Dom.newGroup(map.Layer.objectGroup,this.szId+":markgroup");
		}
		return true;
	}
};
function __inRange(a,b,c,d){
	if ( a && b && c ){
		var nDeltaX = b.x-a.x;
		var nDeltaY = b.y-a.y;
		if (d){
			return ((Math.abs(nDeltaX) <= c) && (Math.abs(nDeltaY) <= d) );
		}else{
			return (Math.sqrt(nDeltaX*nDeltaX+nDeltaY*nDeltaY) <= c);
		}
	}
	return false;
}

function __isPointInPoly(point, vs) {
	// ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point.x, y = point.y;
	var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

/**
 * realize the map theme
 */
MapSelection.prototype.realize = function(){

	_TRACE("MapSelection.prototype.realize");

	this.fShowProgressBar = true;

	if ( this.initValues() ){
		this.nDoneCount = 0;
		this.nSkipCount = 0;

		activeSelection = this;
		this.mapSleep = new Map.Sleep("activeSelection.selectShapes",100,map.Dictionary.getLocalText("do selection"));
		this.mapSleep.fShowProgressBar = true;
		this.mapSleep.nCount = this.nCount;
		this.mapSleep.szCancel = "activeSelection.cancel()";

		this.selectShapes();
	}
	else{
		this.remove();
		displayMessage("Selection could not be done",3000);
	}
};
/**
 * continue realizing the map theme with a given startIndex
 * @param startIndex the next theme part index to ralize 
 */
MapSelection.prototype.realizeContinue = function(startIndex){

	this.selectShapes(startIndex);

};

/**
 * finish realizing the map theme 
 */
MapSelection.prototype.realizeDone = function(){
	if ( this.nRefreshTimeout ){
		setTimeout("map.Themes.refreshTheme('"+this.szId+"')",this.nRefreshTimeout);
	}
};

/**
 * redraw the map theme
 */
MapSelection.prototype.redraw = function(){
};
/**
 * remove values of the map theme
 */
MapSelection.prototype.removeValues = function(){
};
/**
 * disable the map selection
 */
MapSelection.prototype.disable = function(){
};

/**
 * cancel selection 
 */
MapSelection.prototype.cancel = function(){
	this.fCancel = true;
};

activeSelection = null;

MapSelection.prototype.nextThemeNode = function(nIndex){

	if ( this.szThemes == "generic" ){
		return this.themeRootNodesA[nIndex];
	}

	if ( this.szSelectShape == "queryresult" ){
		return this.themeRootNodesA[nIndex];
	}

	// initialize at the beginning with the first root node 
	if ( nIndex === 0 ){
		this.nRootIndex = 0;
		this.actNode = this.themeRootNodesA[this.nRootIndex].firstChild;
		return this.actNode;
	}
	// somethimg went wromg
	if (!this.actNode){
		return null;
	}
	// get next node, if not empty, return it
	this.actNode = this.actNode.nextSibling;
	if ( this.actNode ){
		return this.actNode;
	}
	// if list end reached, look for nex root node 
	else{
		// if no more root node, finish
		if ( ++this.nRootIndex >= this.themeRootNodesA.length ){
			_TRACE("finished !!!!");
			return null;
		}
		else{
			// fetch next root node, and return first child
			this.actNode = this.themeRootNodesA[this.nRootIndex].firstChild;
			return this.actNode;
		}
	}
};
function myclone(object){
	if ( object ){
		var newObj = (object instanceof Array) ? [] : {};
		for (var i in object) {
			if (i == 'clone'){
				continue;
			}
			if (object[i] && typeof object[i] == "object") {
				newObj[i] = myclone(object[i]);
			} else {
				newObj[i] = object[i];
			}
		} 
		return newObj;
	}	
  return null;
}
/** extending the object class is not working; syntaxerror ( code left for future debugging )
Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};
**/

/**
 * colorize the map shapes of the theme
 */
MapSelection.prototype.selectShapes = function(startIndex){

	_TRACE("== MapTheme.selectShapes("+startIndex+")===> "+(this.szId));

	if ( !startIndex || startIndex === 0 ){
		startIndex = 0;

		this.testA = new Array(0);
		this.itemA = new Array(0);
		this.chartPosA = new Array(0);
		this.exactCountA = new Array(0);
		this.exactSizeA = new Array(0);

		if ( !this.activeTheme ){
			this.activeTheme = map.Themes.activeTheme;
		}
		// if there is an active Theme, prepare statistics
		if ( this.activeTheme && (this.szThemesA[0]+" == "+this.activeTheme.szThemesA[0])){

			this.nPartsA   = myclone(this.activeTheme.nPartsA);
			this.partsA   = myclone(this.activeTheme.partsA);
			this.origColorScheme = myclone(this.activeTheme.origColorScheme);
			this.colorScheme = myclone(this.activeTheme.colorScheme);
			this.szFieldsA = myclone(this.activeTheme.szFieldsA);
			this.szLabelA = myclone(this.activeTheme.szLabelA);
			this.szLegendLabelA = myclone(this.activeTheme.szLegendLabelA);
			this.szXaxisA = myclone(this.activeTheme.szXaxisA);
			this.szSymbolsA = myclone(this.activeTheme.szSymbolsA);
			this.szRanges = this.activeTheme.szRanges;
			this.szSizeField = this.activeTheme.szSizeField;
			this.nMeanA = myclone(this.activeTheme.nMeanA);
			this.nMedianA = myclone(this.activeTheme.nMedianA);
			this.nDeviationA = myclone(this.activeTheme.nDeviationA);
			this.nFilterA = myclone(this.activeTheme.nFilterA);
			this.nOrigSumA = myclone(this.activeTheme.nOrigSumA);
			this.szUnit = this.activeTheme.szUnit;
			this.formatValue = this.activeTheme.formatValue;
			this.nMin100	 = this.activeTheme.nMin100;
			this.nMax100	 = this.activeTheme.nMax100;
			this.nClipFrames = this.activeTheme.nClipFrames;
			this.nActualFrame = this.activeTheme.nActualFrame;
			this.sortIndexDown = this.activeTheme.sortIndexDown;
			this.sortIndexUp = this.activeTheme.sortIndexUp;
			this.shuffleArray = this.activeTheme.shuffleArray;
			this.removeDefinition = this.activeTheme.removeDefinition;
			this.szValuesTextStyle = this.activeTheme.szValuesTextStyle;

			this.nOrigValuesSumA = new Array(0);
			this.nValuesSumA = new Array(0);
			this.nValuesMinA = new Array(0);
			this.nValuesMaxA = new Array(0);
			this.nSum100	 = 0;
			this.nSum		 = 0;
			this.nCount		 = 0;
			this.nExactCount = 0;
			this.nMin		 = Number.MAX_VALUE;
			this.nMax		 = -Number.MAX_VALUE;
			this.nMinSize = Number.MAX_VALUE;
			this.nMaxSize = -Number.MAX_VALUE;
			this.nSumSize = 0;
			for ( var k=0;k<this.activeTheme.szFieldsA.length;k++){
				this.nOrigValuesSumA[k] = 0;
				this.nValuesSumA[k] = 0;
				this.nValuesMinA[k] = Number.MAX_VALUE;
				this.nValuesMaxA[k] = -Number.MAX_VALUE;
			}
			for ( var i=0; i<this.partsA.length; i++ ){
				this.partsA[i].nCount = 0;
				this.partsA[i].nSum = 0;
				this.exactSizeA[i] = 0;
			}
		}
	}

	if ( 1 || this.szSelectShape == "activeTheme" ){
		if ( this.nNodes ){
			var i;
			var ii;
			var themeNode = null;
			var themeCenter = null;
			var nSelectRadius = this.selectBufferSize*this.selectScale;
			var nSelectRadius2 = null;
			if ( this.selectBufferSizeX ){
				nSelectRadius = this.selectBufferSizeX*this.selectScale;
				nSelectRadius2 = this.selectBufferSizeY*this.selectScale;
			}

			for (i=startIndex; i<this.nNodes; i++){

				// sleep work around to show progress -----------------
				this.mapSleep.nDoneCount = this.nDoneCount;
				if ( this.mapSleep.checkSleep(i,10) ){
					return;
				}

				if ( this.szThemes == "generic" ){
					
					var szMasterId = this.nextThemeNode(i);
					this.nDoneCount++;
					var fSelected = false;
					if ( this.szSelectShape == "queryresult" ){
						fSelected = true;
					}else{
						if ( this.szFlag.match(/shape/)){
							// selection by arbitrary shape
							var bufferNode = SVGDocument.getElementById(this.szSelectShape);
							var ptPointA = map.Api.getShapePoints(bufferNode.firstChild);
							fSelected = __isPointInPoly(this.activeTheme.getNodePosition(szMasterId),ptPointA);
						}else{
							// selection by rect or circle buffer
							for ( ii=0; ii<this.selectCenterA.length; ii++){
								if ( __inRange(this.activeTheme.getNodePosition(szMasterId),
											   this.selectCenterA[ii],nSelectRadius,nSelectRadius2) ){
									fSelected = true;
									break;
								}
							}
						}
					}
				}else{
					themeNode = this.nextThemeNode(i);
					this.nDoneCount++;
					if ( !themeNode || themeNode.nodeType != 1 ){
						continue;
					}
					if ( themeNode.getAttributeNS(null,"id").match(/:paint/) ){
						continue;
					}

					// if tiled, process only one tile node for statistic 
					var szMasterId = map.Tiles.getMasterId(themeNode.getAttributeNS(null,"id"));
					if ( this.testA && !this.testA[szMasterId]){
						this.testA[szMasterId] = themeNode;
						this.nTested++;
					}

					// check if selected
					// ------------------
					var fSelected = false;

					if ( this.szSelectShape == "queryresult" ){
						if ( !this.selectionCenter ){
							this.selectionCenter = new point(0,0);
						}
						for ( ii=0; ii<this.queryResultA.length; ii++){
							if ( this.queryResultA[ii].node.parentNode == themeNode ){
								fSelected = true;
								var szCenter = themeNode.getAttributeNS(szMapNs,"center");
								if ( szCenter && szCenter.length > 2 ){
									var szCenterA = szCenter.split(',');
									themeCenter = new point( Number(szCenterA[0].split(':')[1]), Number(szCenterA[1].split(':')[1]) );
								}
								if ( !themeCenter ){
									var bBox = map.Dom.getBox(themeNode);
									themeCenter = new point( bBox.x, bBox.y );
								}
								var ptCanvas = map.Scale.mapCanvasCenter;	
								var ptMapOffset = map.Scale.getMapOffset(themeNode);
								themeCenter.x += ptCanvas.x;
								themeCenter.y += ptCanvas.y;

								this.selectionCenter.x += themeCenter.x/this.queryResultA.length;
								this.selectionCenter.y += themeCenter.y/this.queryResultA.length;
								break;
							}
						}
					}
					else{
						var bBox = map.Dom.getBox(themeNode);
						var ptMapOffset = map.Scale.getMapOffset(themeNode);
						bBox.x += ptMapOffset.x;
						bBox.y += ptMapOffset.y;
						// check testie box completely outside selection box
						if ( bBox.x > this.selectCenterA[0].x+nSelectRadius ||
							 bBox.y > this.selectCenterA[0].y+nSelectRadius2 ||
							 bBox.x+bBox.width  < this.selectCenterA[0].x-nSelectRadius || 
							 bBox.y+bBox.height < this.selectCenterA[0].y-nSelectRadius2 ){
							// we are done
							fSelected = false;
						}else{
							// check selection box completely inside testie box
							if ( bBox.x < this.selectCenterA[0].x-nSelectRadius &&
								 bBox.y < this.selectCenterA[0].y-nSelectRadius2 &&
								 bBox.x+bBox.width  > this.selectCenterA[0].x+nSelectRadius && 
								 bBox.y+bBox.height > this.selectCenterA[0].y+nSelectRadius2 ){
								
								// then check if selection center is within polygon
								var childsA = themeNode.getElementsByTagName('path');
								var ptPointA = map.Api.getShapePoints(childsA.item(0));
								var offset = map.Scale.getMapOffset(themeNode);
								for ( p in ptPointA ){
									ptPointA[p].x += offset.x;
									ptPointA[p].y += offset.y;
								}
								fSelected = __isPointInPoly(new point(this.selectCenterA[0].x,
											  						  this.selectCenterA[0].y),ptPointA);
 							}else{
								// check intersection of testie with selection box
								// check if we find a testie point within the selection box
								fSelected = false;
								var childsA = themeNode.getElementsByTagName('path');
								var ptPointA = map.Api.getShapePoints(childsA.item(0));
								var offset = map.Scale.getMapOffset(themeNode);
								for ( p in ptPointA ){
									if ( ptPointA[p].x+offset.x <= this.selectCenterA[0].x+nSelectRadius &&
										 ptPointA[p].y+offset.y <= this.selectCenterA[0].y+nSelectRadius2 &&
										 ptPointA[p].x+offset.x >= this.selectCenterA[0].x-nSelectRadius && 
										 ptPointA[p].y+offset.y >= this.selectCenterA[0].y-nSelectRadius2 ){
										fSelected = true;
										break;	
									}
								}
							}
						}
					}
				}
				
				if ( fSelected ){

					// ==============================
					// if selected, add to selection
					// ==============================
				
					if ( this.szThemes == "generic" ){

						this.itemA[szMasterId] = this.activeTheme.itemA[szMasterId];
						this.nSelected++;

					}else{

						if ( 1 || this.fShow ){
							if (this.szThemeType == "point"){
								// mark selected shape
								if ( this.markGroup ){
									var newShape = map.Dom.newShape('circle',this.markGroup,themeCenter.x,themeCenter.y,map.Scale.normalX(1)*map.Scale.nZoomScale,"fill:yellow;stroke:none;");
								}
								else{
									if (themeNode){
										themeNode.style.setProperty("opacity","0.0");
									}
								}
							}
						}

						// calculate selection statistics

						var szArea = themeNode.getAttributeNS(szMapNs,"area");

						// if tiled, process only one tile node for statistic 
						if ( this.itemA && this.itemA[szMasterId]){
							continue;
						}
						this.itemA[szMasterId] = themeNode;
						this.nSelected++;
						this.nSelectedArea += Number(szArea);

					_TRACE("! "+this.nSelected+"/"+this.nTested+" "+themeNode.nodeName+" "+themeNode.getAttributeNS(null,"id")+" items:"+themeNode.childNodes.length);
					}
					
					if ( this.activeTheme ){
						
						var activeThemeItemA = new Array(0);

						if ( this.activeTheme.itemA[szMasterId] ){
							activeThemeItemA.push(this.activeTheme.itemA[szMasterId]);
						}else{
							if ( this.activeTheme.posItemA[szMasterId] ){
								activeThemeItemA = this.activeTheme.posItemA[szMasterId];
							}
						}
						
						var item;
						for ( item = 0; item < activeThemeItemA.length; item++ ){

							var activeThemeItem = activeThemeItemA[item];

							// if only one value and this is zero, and not allowe -> continue
							if ( activeThemeItem.nValuesA.length == 1 ){
								if ( isNaN(activeThemeItem.nValuesA[0]) ||
									 (activeThemeItem.nValuesA[0] === 0 & 
									 !this.activeTheme.szFlag.match(/ZEROISVALUE/)) 
									){
									continue;
								}
							}
							this.nCount++;
							for ( k=0;k<activeThemeItem.nValuesA.length;k++ ){
								if ( !isNaN(activeThemeItem.nValuesA[k]) ){
									this.nOrigValuesSumA[k] += activeThemeItem.nOrigValuesA[k];
									this.nValuesSumA[k] += activeThemeItem.nValuesA[k];
									this.nValuesMinA[k]  = Math.min(this.nValuesMinA[k],activeThemeItem.nValuesA[k]);
									this.nValuesMaxA[k]  = Math.max(this.nValuesMaxA[k],activeThemeItem.nValuesA[k]);
									this.nMin			 = Math.min(this.nMin,activeThemeItem.nValuesA[k]);
									this.nMax			 = Math.max(this.nMax,activeThemeItem.nValuesA[k]);

									this.nMinSize		 = Math.min(this.nMinSize,activeThemeItem.nSize||this.nMinSize);
									this.nMaxSize		 = Math.max(this.nMaxSize,activeThemeItem.nSize||this.nMaxSize);
									this.nSumSize		 += activeThemeItem.nSize;
								}
							}
							if ( activeThemeItem.nValue100 ){
								this.nSum100 += activeThemeItem.nValue100;
							}
							if ( this.activeTheme.szFlag.match(/AGGREGATE/) && 
							     this.activeTheme.szFlag.match(/CATEGORICAL/)){
								console.log(activeThemeItem.nValuesA);
								for ( var p=0;p<this.partsA.length;p++ ){
									this.partsA[p].nCount += (activeThemeItem.nValuesA[p]?1:0);
									this.partsA[p].nSum += activeThemeItem.nValuesA[p]||0;
									this.nSum += activeThemeItem.nValuesA[p];
									this.nExactCount++;
									this.exactSizeA[p] += activeThemeItem.nSize||1;
								}
							}else
							if ( this.activeTheme.szFlag.match(/CATEGORICAL/) ){
								for ( var v=0;v<activeThemeItem.nValuesA.length;v++ ){
									for ( var p=0;p<this.partsA.length;p++ ){
										if ( activeThemeItem.nValuesA[v] == this.partsA[p].min){
											this.partsA[p].nCount++;
											this.partsA[p].nSum += activeThemeItem.nValuesA[v];
											this.nSum += activeThemeItem.nValuesA[v];
											this.nExactCount++;
											this.exactSizeA[p] += activeThemeItem.nSize||1;
											break;
										}
									}
								}
							}else
							if ( this.activeTheme.szFlag.match(/SEQUENCE/) || this.activeTheme.szFlag.match(/CHART/) ){
								for ( p=0;p<this.partsA.length;p++ ){
									this.partsA[p].nCount++;
									this.partsA[p].nSum += activeThemeItem.nValuesA[p];
									this.nSum += activeThemeItem.nValuesA[p];
								}
							}
							else{
								if ( this.activeTheme.szFlag.match(/CLIP/) && this.activeTheme.nClipFrames ){
									if ( (this.nClipFrames == activeThemeItem.nValuesA.length) ){
										this.nSum += Number(activeThemeItem.nValuesA[this.nActualFrame]);
									}else{
										this.nSum += Number(activeThemeItem.nValuesA[0]*(this.nClipFrames-this.nActualFrame)/this.nClipFrames + activeThemeItem.nValuesA[activeThemeItem.nValuesA.length-1]*this.nActualFrame/this.nClipFrames);
									}
								}else{
									for ( v=0;v<activeThemeItem.nValuesA.length;v++ ){
										for ( p=0;p<this.partsA.length;p++ ){
											if ( activeThemeItem.nValuesA[v] < this.partsA[p].max){
												this.partsA[p].nCount++;
												this.partsA[p].nSum += activeThemeItem.nValuesA[v];
												this.nSum += activeThemeItem.nValuesA[v];
												break;
											}
										}
									}
								}
							}
						}
					}
				}

				// execution canceled ? -----------------
				if ( this.fCancel ){
					this.fShowProgressBar = false;
					this.showInfo(false);
					clearMessage();
					return;
				}
			}
		}
	}
	if ( this.nThemeItems === 0 ){
		this.nThemeItems = this.nTested;
	}
	// GR test test test 
	if (!( (this.szThemes    == "generic") ||
		   (this.szThemeType == "point")   )  ){
		var n;
		for ( n in this.itemA ){
			var tileNodesA = map.Tiles.getTileNodes(n);
			if ( tileNodesA && tileNodesA.length ){
				var t;
				for ( t in tileNodesA ){
					this.highLightList.addItem(tileNodesA[t]);
					this.highLightList.lock();
				}
			}else{
				this.highLightList.addItem(this.itemA[n]);
				this.highLightList.lock();
			}
		}
	}

	_TRACE("== done === ");
	_TRACE(this.nSelected+"("+this.nTested+") = "+100/this.nTested*this.nSelected+"%");
	this.isVisible = true;
	this.realizeDone();

	this.fShowProgressBar = false;
	clearMessage();
	
	if ( HTMLWindow.ixmaps.htmlgui_onSelection(this.szId) ){
		return null;
	}
	
	this.showInfo(true);
};
/**
 * Display the info pane for a realized selection
 */
MapSelection.prototype.showInfo = function(fDone){

	_TRACE("== MapSelection.showInfo("+this.szId+")===> ");

	if ( this.nCount === 0 ){
		displayMessage("Selection: no values found !",1000);
		this.remove();
		return;
	}
	if ( this.nSelected === 0 ){
		displayMessage("Selection is empty !",1000);
		this.remove();
		return;
	}
	if ( this.widgetNode && !this.fRedrawInfo ){
		return;
	}
	this.fRedrawInfo = false;

	var szDisplayId = this.szId+":display:widget";
	var szTitle = map.Dictionary.getLocalText("Selection");
	if ( typeof(fDone) != "undefined" &&  !fDone ){
		szTitle += " (" + map.Dictionary.getLocalText("incomplete")+"!)";
	}
	if ( !this.selectionCenter ) {
		this.selectionCenter = map.Scale.mapCanvasCenter;
	}
	if (this.widgetNode){
		var newInfo = this.widgetNode;
		newInfo.clear();
	}
	else{
		var newInfo = new InfoContainer(SVGDocument,SVGFixedGroup,szDisplayId+":movable",this.selectionCenter,new point(-map.Scale.normalX(55),map.Scale.normalY(50)),"fixed|pointer",szTitle);
	}
	// container backgrond gray
	newInfo.frameNode.style.setProperty("fill","#e8e8e8","");
	var temp = szTextGridStyle;
	szTextGridStyle = "firstgray";

	this.widgetNode = newInfo;
	newInfo.fClipped = false;

	var infoWorkspace = newInfo.workspaceNode;
	newInfo.setOnRemove("map.Themes.removeTheme(evt,'"+this.szId+"')");
	
	var szSelectShape = this.szSelectShape;
	var nIndent = 3;
	var nLineOff = 0;
	if ( this.szSelectShape == "activeBuffer" ){
		var mapTheme = map.Themes.activeBuffer;
		szSelectShape = mapTheme.szTitle;
		var textA = new Array(   map.Dictionary.getLocalText("layer")
								,map.Dictionary.getLocalText("selected by")
								,map.Dictionary.getLocalText("selected items")
								,this.szThemesA.length == 1?String(map.Layer.listA[this.szThemesA[0]].szLegendName):"(multiple)"
								,String(szSelectShape)
								,String(this.nSelected)+" / "+String(this.nThemeItems) + "  ("+String(__formatValue(100/this.nThemeItems*this.nSelected,2))+"%"+")"
							);
		var styleA = new Array(3);
		styleA[0] = "font-weight:bold;fill:#ffffff;";
		styleA[1] = "font-weight:bold;fill:#ffffff;";
		styleA[2] = "font-weight:bold;fill:#ffffff;";
		nLineOff += 50;
	}
	else if ( this.szSelectShape == "queryresult" ){
		var szLayer = this.szThemes;
		if ( this.szThemesA.length > 1){
			szLayer = "(multiple)";
		}else if ( this.szThemes != "generic" ) {
			szLayer = String(map.Layer.listA[this.szThemesA[0]].szLegendName);
		}
		var textA = new Array(   map.Dictionary.getLocalText("layer")
								,map.Dictionary.getLocalText("selected by")
								,map.Dictionary.getLocalText("selected items")
								,szLayer
								,this.szSelectQuery
								,String(this.nSelected)+" / "+String(this.nThemeItems) + "  ("+String(__formatValue(100/this.nThemeItems*this.nSelected,2))+"%"+")"
							);
		var styleA = new Array(3);
		styleA[0] = "font-weight:bold;fill:#ffffff;";
		styleA[1] = "font-weight:bold;fill:#ffffff;";
		styleA[2] = "font-weight:bold;fill:#ffffff;";
		nLineOff += 50;
	}
	else if ( this.szThemes == "generic" ){
		var textA = new Array(   map.Dictionary.getLocalText("layer")
								,map.Dictionary.getLocalText("selected items")
								,"(generic)"
								,String(this.nSelected)+" / "+String(this.nThemeItems) + "  ("+String(__formatValue(100/this.nThemeItems*this.nSelected,2))+"%"+")"
							);
		var styleA = new Array(2);
		styleA[0] = "font-weight:bold;fill:#ffffff;";
		styleA[1] = "font-weight:bold;fill:#ffffff;";
		nLineOff += 40;
	}
	else {
		var textA = new Array(   map.Dictionary.getLocalText("layer")
								,map.Dictionary.getLocalText("selected items")
								,this.szThemesA.length == 1?String(map.Layer.listA[this.szThemesA[0]].szLegendName):"(multiple)"
								,String(this.nSelected)+" / "+String(this.nThemeItems) + "  ("+String(__formatValue(100/this.nThemeItems*this.nSelected,2))+"%"+")"
							);
		var styleA = new Array(2);
		styleA[0] = "font-weight:bold;fill:#ffffff;";
		styleA[1] = "font-weight:bold;fill:#ffffff;";
		nLineOff += 40;
	}
	var gridGroup = map.Dom.newGroup(infoWorkspace,"");
	gridGroup.fu.setPosition(map.Scale.normalY(nIndent),map.Scale.normalY(3));
	var newText = createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA,"fill:#bbbbbb;");

	var chartsA = new Array(0);

	if ( this.activeTheme ){

		var chartGroup = null;
		var chartBox = null;

		nLineOff += 14;

		map.Dom.newText(infoWorkspace,map.Scale.normalX(3),map.Scale.normalY(nLineOff),"font-family:arial;font-weight:bold;font-size:"+map.Scale.normalY(11)+"px;fill:#555555;pointer-events:none",map.Dictionary.getLocalText("Theme")+": "+this.activeTheme.szTitle);
		nLineOff += 8;

		gridGroup = map.Dom.newGroup(infoWorkspace,"");
		gridGroup.fu.setPosition(map.Scale.normalY(nIndent),map.Scale.normalY(nLineOff));

		// GR 14.01.2009 test
		this.drawDonutText = this.activeTheme.drawDonutText;
		this.drawTextforOneQuadrant = this.activeTheme.drawTextforOneQuadrant;
		this.createTextLabel = this.activeTheme.createTextLabel;

		// 1. themes with 1 value (CHOROPLETH or bubble,square ...
		// ---------------------------------------------------------
		if ( this.nValuesSumA.length == 1 ){

			var nChartPosX = 0;

			this.addItemValues = this.activeTheme.addItemValues;
			this.szFieldsA = this.activeTheme.szFieldsA;
			this.fField100 = this.activeTheme.fField100;
			var szThisFlag = this.szFlag;
			this.szFlag	   = this.activeTheme.szFlag;
			this.itemA = new Array(0); 
			// GR 08.02.2009 !! .addItemValues changes 1. parameter 
			var tmpOrigValuesSumA = new Array(0);
			for ( var x=0;x<this.nOrigValuesSumA.length;x++ ){
				tmpOrigValuesSumA[x] = this.nOrigValuesSumA[x];
			}
			this.addItemValues("selection",tmpOrigValuesSumA,this.nSum100);
			this.szFlag = szThisFlag;

			// handle CATEGORICAL values 
			//
			if( this.activeTheme.szFlag.match(/CATEGORICAL/) ){
				var textA = new Array(  map.Dictionary.getLocalText("selected items")
										,String(__formatValue(Number(this.nCount,2)))
									);
				var styleA = new Array(2);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[1] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;

			// see if flag is set, to sum the values of a selection 
			//
			}else if ( (this.activeTheme.szAggregation && this.activeTheme.szAggregation.match(/sum/)) || this.activeTheme.szFlag.match(/SUM/) ){
				var textA = new Array(   map.Dictionary.getLocalText("value of selection")
										,map.Dictionary.getLocalText("% of total value")
										," "
										,map.Dictionary.getLocalText("min")
										,map.Dictionary.getLocalText("max")
										,map.Dictionary.getLocalText("average")
										,String(__formatValue(Number(this.itemA["selection"].nValuesA[0]),2))+" "+this.szUnit
										,String(__formatValue(Number(this.nValuesSumA[0])/Number(this.activeTheme.nOrigSumA[0])*100,2))+" %"
										," "
										,String(__formatValue(Number(this.nValuesMinA[0]),2))+" "+this.szUnit
										,String(__formatValue(Number(this.nValuesMaxA[0]),2))+" "+this.szUnit
										,String(__formatValue(Number(this.nValuesSumA[0])/this.nCount,2))+" "+this.szUnit
									);
				var styleA = new Array(12);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[6] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;

				// a) percent of total pie

				chartGroup = map.Dom.newGroup(infoWorkspace,"");
				chartsA.push(chartGroup);

				var donut = DonutCharts.newChart(SVGDocument,chartGroup,map.Scale.normalX(55),map.Scale.normalY(55),0,0);
				//donut.setStyle("3D");
				donut.setRadInner(0);
				donut.setRadOuter(map.Scale.normalX(55));
				donut.setCenter(map.Scale.normalX(80),map.Scale.normalY(100));
				var value = Number(this.nValuesSumA[0])/Number(this.activeTheme.nOrigSumA[0])*100;
				donut.addPart(value,map.Scale.normalY(20),"#ddddee",0,this.formatValue(value,2)+"%","selection: "+this.formatValue(value,2)+"% of total value");
				donut.addPart(100-value,map.Scale.normalY(20),"#f8f8ff",0,this.formatValue(100-value,2)+"%",this.formatValue(100-value,2)+"%");
				donut.realize();
				
				map.Dom.newText(chartGroup,map.Scale.normalX(80),map.Scale.normalX(82),"font-size:"+ map.Scale.normalX(10)/0.66 +"px;text-anchor:middle;baseline-shift:-60%;fill:darkgrey;stroke:none;pointer-events:none",this.formatValue(value,0)+" % of total");

				if ( this.activeTheme.szFlag.match(/BUBBLE/) ||
					 this.activeTheme.szFlag.match(/SQUARE/) ||
					 this.activeTheme.szFlag.match(/SYMBOL/) 
					){
					this.getOverviewChart = this.activeTheme.getOverviewChart;
					this.szOverviewChart = this.activeTheme.szOverviewChart;
					this.drawChart = this.activeTheme.drawChart;
					if ( this.getOverviewChart ){
						var posGroup = map.Dom.newGroup(infoWorkspace,"");
						chartGroup = map.Dom.newGroup(posGroup,"");
						chartsA.push(posGroup);
						var oldszFlag = this.szFlag;
						this.szFlag = this.activeTheme.szFlag;
						this.nOrigSumA = this.nOrigValuesSumA;
						this.nMaxA   = this.nValuesMaxA;
						this.nMinA   = this.nValuesMinA;
						this.szAggregation = this.activeTheme.szAggregation;
						this.getOverviewChart(chartGroup);
						this.szFlag = oldszFlag;
						chartGroup.fu.scale(1.30,1.30);
						chartGroup.fu.setPosition(map.Scale.normalX(-35),map.Scale.normalY(35));
					}
				}

				// b) class distribution graphs 
				//
				/**
				this.getOverviewChart = this.activeTheme.getOverviewChart;
				this.szOverviewChart = this.activeTheme.szOverviewChart;
				if ( this.activeTheme.szFlag.match(/CATEGORICAL/) || (!this.activeTheme.szFlag.match(/CHART/) && !this.activeTheme.szFlag.match(/DOMINANT/)) ){
					if ( this.nOrigSumA.length > 5 ){
						this.szOverviewChart = "BAR";
					}else{
						this.szOverviewChart = "PIE|3D";
					}
				}
				else{
					this.drawChart = this.activeTheme.drawChart;
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartGroup.fu.setPosition(map.Scale.normalX(70),map.Scale.normalY(nLineOff));
					chartGroup.fu.scale(0.50,0.50);
					var ptNull = this.drawChart(chartGroup,null,35,"VALUES|NORMSIZE");
					// var ptNull = map.Themes.getChart(null,chartGroup,"VALUES|NORMSIZE|AXIS",this);
					alert(printNode(chartGroup));
				}

				if ( this.szOverviewChart ){
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartGroup.fu.setPosition(map.Scale.normalX(70),map.Scale.normalY(nLineOff));
					chartGroup.fu.scale(0.50,0.50);

					this.getOverviewChart(chartGroup);

					if ( (this.szOverviewChart.match(/PIE/) && this.activeTheme.szAggregation.match(/sum/)) ){
						this.szOverviewChart += "|PERCENTOFVALUE";
						chartGroup = map.Dom.newGroup(infoWorkspace,"");
						chartGroup.fu.setPosition(map.Scale.normalX(140),map.Scale.normalY(nLineOff));
						chartGroup.fu.scale(0.50,0.50);
						this.getOverviewChart(chartGroup);
					}
				}
				**/

			// if we have a 100 % field given, the value of the selection can be calculated
			//
			}else if(this.fField100){
				var textA = new Array(   map.Dictionary.getLocalText("value of selection")
										," "
										,map.Dictionary.getLocalText("min value")
										,map.Dictionary.getLocalText("max value")
										,map.Dictionary.getLocalText("mean value")
										,String(__formatValue(Number(this.itemA["selection"].nValuesA[0]),2))+this.szUnit
										," "
										,String(__formatValue(Number(this.nValuesMinA[0]),2))+this.szUnit
										,String(__formatValue(Number(this.nValuesMaxA[0]),2))+this.szUnit
										,String(__formatValue(Number(this.nValuesSumA[0])/this.nCount,2))+this.szUnit
									);
				var styleA = new Array(10);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[5] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;

			// if we have a 100 % field given, the value of the selection can be calculated
			//
			}else if( this.activeTheme.szFlag.match(/DENSITY/) ){
				var textA = new Array(   map.Dictionary.getLocalText("value of selection")
										," "
										,map.Dictionary.getLocalText("min value")
										,map.Dictionary.getLocalText("max value")
										,map.Dictionary.getLocalText("mean value")
										,String(__formatValue(Number(this.itemA["selection"].nValuesA[0]),2))+this.szUnit
										," "
										,String(__formatValue(Number(this.nValuesMinA[0]),2))+this.szUnit
										,String(__formatValue(Number(this.nValuesMaxA[0]),2))+this.szUnit
										,String(__formatValue(Number(this.nValuesSumA[0])/this.nCount,2))+this.szUnit
									);
				var styleA = new Array(10);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[5] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;

			// else, we can do only min,max and mean 
			//
			}else{
				var textA = new Array(  map.Dictionary.getLocalText("mean value")
										,map.Dictionary.getLocalText(" ")
										,map.Dictionary.getLocalText("min value")
										,map.Dictionary.getLocalText("max value")
										,String(__formatValue(Number(this.nValuesSumA[0])/this.nCount,2))+this.szUnit
										,map.Dictionary.getLocalText(" ")
										,String(__formatValue(Number(this.nValuesMinA[0]),2))+this.szUnit
										,String(__formatValue(Number(this.nValuesMaxA[0]),2))+this.szUnit
									);
				var styleA = new Array(8);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[4] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;
			}
			// b) class distribution graphs 
			//
			this.getOverviewChart = this.activeTheme.getOverviewChart;
			this.szOverviewChart = this.activeTheme.szOverviewChart;

			if ( (this.activeTheme.colorScheme.length > 2 ) || this.activeTheme.szFlag.match(/CATEGORICAL/) || (!this.activeTheme.szFlag.match(/CHART/) && !this.activeTheme.szFlag.match(/DOMINANT/)) ){
				if ( this.nOrigSumA.length > 5 ){
					this.szOverviewChart = "BAR";
				}else{
					this.szOverviewChart = "PIE";
				}
			}

			if ( this.szOverviewChart ){
				chartGroup = map.Dom.newGroup(infoWorkspace,"");
				chartsA.push(chartGroup);
				this.getOverviewChart(chartGroup);

				if ( (this.szOverviewChart.match(/PIE/) && this.activeTheme.szAggregation.match(/sum/)) ){
					this.szOverviewChart += "|PERCENTOFVALUE";
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartsA.push(chartGroup);
					this.getOverviewChart(chartGroup);
				}
			}

			if ( this.activeTheme.szFlag.match(/CHART/) && !(this.activeTheme.szAggregation && this.activeTheme.szAggregation.match(/sum/))){
				this.getOverviewChart = this.activeTheme.getOverviewChart;
				this.szOverviewChart = null;
				this.drawChart = this.activeTheme.drawChart;
				if ( this.getOverviewChart ){
					posGroup = map.Dom.newGroup(infoWorkspace,"");
					chartGroup = map.Dom.newGroup(posGroup,"");
					chartsA.push(posGroup);
					var oldszFlag = this.szFlag;
					this.szFlag = this.activeTheme.szFlag;
					this.nOrigSumA = this.nOrigValuesSumA;
					this.nMaxA   = this.nValuesMaxA;
					this.nMinA   = this.nValuesMinA;
					this.nOverrideMax = this.activeTheme.nMax;
					this.szAggregation = this.activeTheme.szAggregation;
					this.getOverviewChart(chartGroup);
					this.szFlag = oldszFlag;
					if ( this.activeTheme.szFlag.match(/BAR/)){
						chartGroup.fu.scale(2.5,2.5);
						chartGroup.fu.setPosition(map.Scale.normalX(55),map.Scale.normalY(65));
					}else{
						chartGroup.fu.scale(1.30,1.30);
						chartGroup.fu.setPosition(map.Scale.normalX(-35),map.Scale.normalY(35));
					}


					var oldszFlag = this.szFlag;
					this.szFlag = this.activeTheme.szFlag;
					this.szOverviewChart += "|PERCENTOFVALUE";
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartsA.push(chartGroup);
					this.getOverviewChart(chartGroup);
					this.szFlag = oldszFlag;


					/**
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartsA.push(chartGroup);
					this.drawChart(chartGroup,null,30,"CHART|BAR|HORZ|ZOOM|VALUES|AXIS|NOZERO|SORT");
					**/

				}
			}


		// 2. more than 1 fields in theme ( bar/pie/donut chart )
		// ------------------------------------------------------
		}else{
			if ( this.activeTheme.szAggregation.match(/sum/) || this.activeTheme.szFlag.match(/SUM/) ){
				var nSelectionTotal = this.nSum100?this.nSum100:(this.activeTheme.szFlag.match(/CATEGORICAL/)?this.nExactCount:this.nSum);
				var nTotal			= this.activeTheme.nSum100?this.activeTheme.nSum100:(this.activeTheme.szFlag.match(/CATEGORICAL/)?this.activeTheme.nExactCount:this.activeTheme.nSum);

				var textA = new Array(   map.Dictionary.getLocalText("total of selection")
										,String(__formatValue(nSelectionTotal,2)) + " (" + String(__formatValue(Number(nSelectionTotal)/Number(nTotal)*100,2))+" %)"
									);
				var styleA = new Array(2);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[1] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;
			}
			if ( this.nSum100 ){
				var nSelectionTotal = this.nSum100;
				if ( !this.activeTheme.szFlag.match(/DOMINANT/) && !this.activeTheme.szAggregation.match(/sum/) ){
					nSelectionTotal = nSelectionTotal/this.nSelected;
				}
				var nTotal			= this.activeTheme.nSum100;

				var textA = new Array(   map.Dictionary.getLocalText("total of selection")
										,String(__formatValue(nSelectionTotal,2)) + " (" + String(__formatValue(Number(nSelectionTotal)/Number(nTotal)*100,2))+" %)"
									);
				var styleA = new Array(2);
				styleA[0] = "font-weight:bold;fill:#7996D7;";
				styleA[1] = "font-weight:bold;fill:#000000;font-size:240px;";
				createTextGrid(SVGDocument,gridGroup,szDisplayId+":textgrid",textA,2,11,styleA);
				nLineOff += gridGroup.fu.getBox().height/map.Scale.normalX(1)+5;
			}

			// Q&D clone active theme parameter to get the chart
			this.drawChart = this.activeTheme.drawChart;
			this.getOverviewChart = this.activeTheme.getOverviewChart;
			this.szOverviewChart = this.activeTheme.szOverviewChart;
			if ( 1 || !this.szOverviewChart || !this.szOverviewChart.length ){
				if ( this.activeTheme.szFlag.match(/CATEGORICAL/) || (!this.activeTheme.szFlag.match(/CHART/) && !this.activeTheme.szFlag.match(/DOMINANT/)) ){
					this.szOverviewChart = "PIE";
				}
			}
			this.nOrigSumA = this.nOrigValuesSumA;
			this.nMaxA   = this.nValuesMaxA;
			this.nMinA   = this.nValuesMinA;

			var szThisFlag = this.szFlag;
			this.szFlag	   = this.activeTheme.szFlag;
			this.szAggregation = this.activeTheme.szAggregation;

			if ( this.szOverviewChart ){
				chartGroup = map.Dom.newGroup(infoWorkspace,"");
				chartsA.push(chartGroup);
				this.getOverviewChart(chartGroup);

				if ( (this.szOverviewChart.match(/PIE/) && this.activeTheme.szAggregation.match(/sum/)) ){
					this.szOverviewChart += "|PERCENTOFVALUE";
					chartGroup = map.Dom.newGroup(infoWorkspace,"");
					chartsA.push(chartGroup);
					this.getOverviewChart(chartGroup);
				}
			}
			else { 
				chartGroup = map.Dom.newGroup(infoWorkspace,"");

				this.nMin    = this.activeTheme.nMin;
				this.nMax    = this.activeTheme.nMax;
				var nChartScale = 1.8;
				if ( this.szFlag.match(/DOMINANT/) ){
					nChartScale = 1.8;
				}

				this.drawColorSchemeLegend = this.activeTheme.drawColorSchemeLegend;
				this.nOrigSumA = this.activeTheme.nOrigSumA;
				this.nSum = this.activeTheme.nSum;
				this.szField100 = this.activeTheme.szField100;
				var legendNode = this.drawColorSchemeLegend(chartGroup,"test");
				legendNode.fu.scale(0.9/nChartScale,0.9/nChartScale);

				var chartBox = map.Dom.getBox(chartGroup);
				if ( chartBox.width > 0 && chartBox.height > 0){
					chartGroup.fu.scale(nChartScale,nChartScale);
					chartGroup.fu.setPosition(map.Scale.normalX(10)-chartBox.x*nChartScale,map.Scale.normalY(nLineOff)+map.Scale.normalY(5)-chartBox.y*nChartScale);
					map.Dom.newText(chartGroup,chartBox.x,chartBox.y+chartBox.height+map.Scale.normalX(6),"font-family:Arial;font-style:italic;font-size:"+map.Scale.normalY(6)+"px;fill:#888888;pointer-events:none",(this.activeTheme.fField100||this.activeTheme.szAggregation.match(/sum/))?map.Dictionary.getLocalText("* summary over selected area"):map.Dictionary.getLocalText("* arithmetic mean over selected area"));
				}
			}
			_TRACE(map.Themes.getSummary(null,this));
		}
		this.szFlag = szThisFlag;
	}
	var szSummary = (this.nSelected+"("+this.nThemeItems+") = "+__formatValue(100/this.nThemeItems*this.nSelected,2)+"%");
	_TRACE(szSummary);	

	__chartArrayReformat(chartsA,map.Scale.normalX(nLineOff),2);

	newInfo.reformat();
	// restore saved value
	szTextGridStyle = temp;

};

/**
 * helper to position charts
 */
function __chartArrayReformat(chartsA,nLineOff,nCols){

	var nPosX = 0;
	var nPosY = 0;
	var nMaxX = 1000;
	var nMaxY = 0;
	var nMaxWidth = 0;
	var nMaxHeight = 0;

	for ( var i=0; i<chartsA.length; i++ ) {
		var chartGroup = chartsA[i]; 
		chartGroup.fu.scale(0.8,0.8);
		var chartBox = chartGroup.fu.getBox();
		nMaxX = Math.min(nMaxX,chartBox.x);
		nMaxY = Math.min(nMaxY,chartBox.y);
		nMaxWidth = Math.max(nMaxWidth,chartBox.width);
	}
	nPosY = nLineOff - nMaxY + 40;
	for ( var i=0; i<chartsA.length; i++ ) {
		var chartGroup = chartsA[i]; 
		var chartBox = chartGroup.fu.getBox(); 
		if ( i === 0 ){
			nPosX = map.Scale.normalX(2)-(0?nMaxX:0);
		}else if ( nCols && (i%nCols === 0) ){
			nPosY += map.Scale.normalX(20)+nMaxHeight;
			nPosX = map.Scale.normalX(2)-chartBox.x;
			nMaxHeight = 0;
		}
		nMaxHeight = Math.max(nMaxHeight,chartBox.height);

		chartGroup.fu.setPosition(nPosX,nPosY);
		nPosX += nMaxWidth-map.Scale.normalX(10);
	}
}


/**
 * mark the map shapes of one class
 */
MapSelection.prototype.markClass = function(nClass){
};
/**
 * unmark the map shapes of one class
 */
MapSelection.prototype.unmarkClass = function(nClass){
};
/**
 * remove the theme (from the parents theme list) 
 * @param evt the event
 */
MapSelection.prototype.remove = function(evt){
	this.parent.removeTheme(evt,this.szId);
};
/**
 * remove the representation of this selection (shape colorizing) 
 * @param evt the event
 */
MapSelection.prototype.removeElements = function(evt){
	if ( this.markGroup ){
		this.markGroup.style.setProperty('display','none',"");
		setTimeout("map.Dom.removeElementById('"+this.markGroup.getAttributeNS(null,"id")+"')",10000);
	}
	try{
		this.mapTool.remove();
	}
	catch (e){
	}
	this.highLightList.unlock();
	this.highLightList.removeAll();
};
/**
 * return the selected Items
 * @param szId id del item only value possibile "selection"
 */
MapSelection.prototype.getItemNodes = function(szId) {
	// GR 30.10.2008 at the moment, we need only the method
	return new Array(0);
};
/**
 * return the area of the selected Items (in square Km)
 * @param szId id del item only value possibile "selection"
 */
MapSelection.prototype.getNodeArea = function(szId) {
	if ( this.nSelectedArea){
		return this.nSelectedArea/1000000;
	}else{
		return 1;
	}
};

// .............................................................................
// EOF
// .............................................................................


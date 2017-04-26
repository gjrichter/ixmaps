/**********************************************************************
 mapscript.js

$Comment: provides JavaScript interactivity for svggis
$Source : mapscript.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2004/12/15 $
$Author: guenter richter $
$Id: mapscript.js 9 2007-06-27 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: mapscript.js,v $
**********************************************************************/

/** 
 * @fileoverview This file is the main JavaScript for SVGGIS Map Applications.<br>
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

/* ...................................................................* 
 *  global vars                                                       * 
 * ...................................................................*/ 

var SVGDocument  = null;
var rootGroup  = null;
var nNodesCreated = 0;
var fObjectPseudoShadow = true;
var fEmbedScale = false;
var fSVGEmbeded = false;
var HTMLWindow = null;

var SVGRootElement  = null;
var SVGToolsGroup   = null;
var SVGThemeGroup   = null;
var SVGFixedGroup   = null;
var SVGPopupGroup   = null;
var SVGMessageGroup = null;
var SVGMenuGroup    = null;
var SVGTltipGroup   = null;
var SVGHiddenGroup  = null;

var fTransparentMap = false;
var fClipMap = true;
var fClipMapDynamic = false;
var fZoomByViewer = false;
var fPDFEmbed = false;
var fAllIncluded = false;
var fSwitchByCSS = true;
var szViewer = "Adobe3.0";
var fLocalHost = false;

var fLoadIncludes = true;

var fDynamicLayer = true;
var fDynamicTiles = true;
var fTilesLoaded = false;
var fDiscardTiles = "delayed";
var fLoadMultiTiles = true;
var fMarkTiles = false;
var fLoadingSilent = false;
var fExecuteSilent = false;
var fNotify = false;

var szObjectGroupId = "mapobjects";
var szShadowFilterId = "DropShadowFilterObjects:antizoomandpan";
var szShadowFilterToolsId = "DropShadowFilterTools:antizoomandpan";
var szShadowFilterShapeId = "DropShadowFilterShape";

var fAntiZoomAndPan = true;
var fFeatureScaling = true;
var fObjectScaling = true;
var fSymbolScalingDynamic = true;
var fFeatureScalingDynamic = false;
var fAdaptLabelToScaling = true;
var fCheckLabelOverlap = true;
var fCheckLabelSpace = false;
var nCheckLabelSpace = 0.8;
var fCheckLabelSqueeze = true;
var fCheckLabelSize = true;
var fKillOverlappingLabel = false;
var fCheckLabelOnlyOne = false;
var fCheckOverlapImplicit = true;
var fCheckOverlapAllLayer = true;
var fCheckOverlapClipOnTiles = false;
var fTileTextNoClip = false;
var fFeatureScalingByLayer = true;
var fFroozeDynamicContent = false;
var fPendingNewGeoBounds = false;

var fPanByViewer = false;
var fPanToolByViewer = true;
var fPanHideTools = true;
var fEndPan = "normal";
var fRotateOnMouseMove = false;
var fTriggerMouseMoveForPan = true;
var fPreserveMapRatio = true;

var fInitLegendOff = false;
var fMapBorder = false;
var fMapBorder3D = false;
var nMapBorderWidth = 1;
var szMapBorderColor = "#B6BAC0";
var szMapPanBorderStyle = "fill:#E0E5F0;stroke:white";
var szMapPanBorderOnoverStyle = "fill:#d0d5e0;stroke:white";
var szMapBackgroundStyle = null;
var szMapBackgroundColor = null;
var fClipMapToLegend = false;
var fLegendToggleButtons = false;
var fNorthArrow = "rotatable";
var szNorthArrowPosition = "INMAP";
var szLocalPopupAlignment = null;
var szMessagePosition = "center";
var nToolMarginTop = 0;
var nFixedInfoScale = 1;

var fScaleBar = true;
var fDebug = false;
var fStatus = false;

var fSetToolCursor = false;
var fActivateInfoOnClick = false;
var szTextGridStyle = "background:#dddddd";
var fCheckSublayerCollapse = false;
var fCreatTextLink = true;
var nClipTextLink = 30;
var nInfoOffsetX = 25;
var nInfoOffsetY = -25;
var szInfoTitleColor = '#000000';
var szInfoTitleBgColor = '#ffffff';
var szInfoBodyColor = '#444444';
var szInfoBodyBgColor = '#FFFFDD';
var nInfoRoundRect = 2;
var fInfoShowShape = false;
var fActiveThemeInfo = false;

var fDecimalPointComma = false;
var nNormalSymbolSize = 20;
var nNormalButtonSize = 10;
var nNormalFontSize = 12;
var nHighlightToggle = 0;
var fLoadExternalData = false;
var fScaleToFullscreen = false;
var fHighlightHint = true;
var fAdaptMapScaleToSize = true;
var fLimitMapToExtent = false;
var nStandardPPI = 72;
var nScreenPPI = 96;
var nInch = 2.54;

var idTooltipTimeout = null;
var nTooltipTimeout = 500;

var idInfoTimeout = null;
var nInfoTimeout = 250;

var szMapToolType = "";

var szSVG = "http:"+"/"+"/"+"www.w3.org/2000/svg";
var szMapNs = "http:"+"/"+"/"+"www.medienobjekte.de";
var szXlink = "http:"+"/"+"/"+"www.w3.org/1999/xlink";
var szHTTP = "http:"+"/"+"/";

var szLinkTarget = "_blank";
var szEmbedName = "SVGMap";
var newShape = null;

/** node of the legend text that is actually highlighted */
var _legendIdent = null;
/** name of the actually active theme (layer) */
var _activeTheme = null;
/** node found by map query, that activated a theme */
var _activeItem = null;
/** holds the actual tooltip text, is used as flag */
var _tooltip = null;

/**
 * define function printNode() if not given by the viewer
 */
if ( typeof(printNode) == "undefined" ){
	var szFunct = "function printNode(node)\{";
	szFunct += "var serializer = new XMLSerializer();";
	szFunct += "var xml = serializer.serializeToString(node);";
	szFunct += "return xml;";
	szFunct += "\}";
	eval(szFunct);
}

/* ...................................................................* 
 *  global objects                                                    * 
 * ...................................................................*/ 

var map = null;

var antiZoomAndPanList = null;
var mouseObject = null;
var mapTool = null;
var mapTiles = null;
var bookmarkList = null;
var zoomAndPanHistory = null;
var highLightList = null;

/* ...................................................................* 
 *  the main namespace                                                    * 
 * ...................................................................*/ 

/**
 * Create a new Map instance.  
 * @class the main namespace for all map properties and methods.
 * @constructor
 * @throws 
 * @return A new Map
 */
Map = function(){
	/** flag: initialization in progress */
	this.fInitializing = false;
	/** holds the subclass for event handling */
	this.Event = null;
	/** holds the subclass for map scaling */
	this.Scale = null;
	/** holds the subclass for map layer handling */
	this.Layer = null;
	/** holds the subclass for map tile handling */
	this.Tiles = null;
	/** holds the subclass for zooming methods */
	this.Zoom  = null;
	/** holds the subclass for map query methods */
	this.Query = null;
	/** holds the subclass for methods to create map themes */
	this.Themes = null;

	/** holds the subclass for map legend handling */
	this.Legend = null;
	/** holds the subclass for toolbar handling */
	this.Toolbar = null;
	/** holds the subclass for map viewport methods */
	this.Viewport = null;

	/** holds the subclass for map api methods */
	this.Api = null; 

	/** holds a SVG loader object, created on init() */
	this.Loader = new SVGLoader(); 
	/** holds the pushed init actions (see {@link #pushInitAction}) @type array */
	this.initActionA = new Array(0); 
	/** holds the pushed messages for the pushed init action (or null) */
	this.initMessageA = new Array(0); 
	/** holds the pushed actions (see {@link #pushAction}) @type array */
	this.actionA = new Array(0); 
	/** holds the pushed messages for the pushed action (or null) */
	this.messageA = new Array(0); 
};
/**
 * May be called by the embedding HTML page to set/change the map behaviour.<br>
 * Must be called as the answer to HTMLWindow.ixmaps.htmlgui_queryMapFeatures().
 * @param szFeatures string that contains the features
 * <br><br>
 * The syntax is similar to CSS stypes: "property_1:value_1;property_2:value_2;..."
 * <br><br>
 * The following map feature can be set:
 * <br><br>
 *  <table>
 *  <tr><td>featurescaling</td><td>adapt map features to zoom (p.e. line thickness)</td><td>false / true / dynamic</td></tr>
 *  <tr><td>objectscaling</td><td>adapt generated objets (e.b. charts) to the zoom</td><td>false / true / dynamic</td></tr>
 *  <tr><td>dynamiclabel</td><td>adapt label to path length, polygon space and check for overlap</td><td>false / true / delayed / ...</td></tr>
 *  <tr><td>dynamiclayer</td><td>switch layer on/off according to defined min/max scale</td><td>false / true / delayed</td></tr>
 *  <tr><td>dynamictiles</td><td>load tiles according to the map position (panning)</td><td>false / true / delayed</td></tr>
 *  <tr><td>discardtiles</td><td>clear unused (switched off) tiles</td><td>false / true / delayed</td></tr>
 *  <tr><td>loadmultitiles</td><td>allow multiple xml http request</td><td>false / true</td></tr>
 *  <tr><td>loadexternaldata</td><td>try to load map data from exeternal file (.js|.xml) before searching SVG</td><td>false / true</td></tr>
 *  <tr><td>loadincludes</td><td>load the defined SVG include files</td><td>false / true</td></tr>
 *  <tr><td>fastpan</td><td>hide map tools while panning</td><td>false / true</td></tr>
 *  <tr><td>panborder</td><td>define the width of a border around the map with which the map can be panned</td><td>false / true</td></tr>
 *  <tr><td>tooltipdelay</td><td>define delay (ms) for the tooltip display on mouse over</td><td>100 .. 1000</td></tr>
 *  <tr><td>popupdelay</td><td>define delay (ms) for the info display on mouse over</td><td>100 .. 1000</td></tr>
 *  <tr><td>popupgridstyle</td><td>define style of info display table</td><td>background|alternate|full|firstright|firstsmall|firstitalic|firstgray</td></tr>
 *  <tr><td>buttonsize</td><td>define the size (maximum of width/height) for all buttons (default 10 pixel)</td><td>[pixel]</td></tr>
 *  <tr><td>symbolsize</td><td>define the size (maximum of width/height) for all symbols (default 20 pixel)</td><td>[pixel]</td></tr>
 *  <tr><td>checklabeloverlap</td><td>if true, labels are checked for overlapping, and if possible the position is corrected</td><td>false / true</td></tr>
 *  <tr><td>onlyonelabel</td><td>if true, only one label per layer (or tile) is shown</td><td>false / true</td></tr>
 *  <tr><td>decimalpoint</td><td>the decimalpoint can be defined to comma by this</td><td>comma</td></tr>
 *  <tr><td>dynamicscale</td><td>adapt the map scale to the size of the embedding window (Browser, PDF Reader)</td><td>false / true</td></tr>
 *  <tr><td>screenppi</td><td>to set the screen ppi different from 96 (windows standard)</td><td>[number]</td></tr>
 *  <tr><td>clipmap</td><td>clip the map to the visible range (affects panning)</td><td>false / true / dynamic</td></tr>
 *  <tr><td>marktiles</td><td>show the tiling of the map by lines</td><td>[name]</td></tr>
 *  <tr><td>embedname</td><td>tell the name of the embed object (svg viewer)</td><td>[name]</td></tr>
 *  </table>
 * <br>
 * <strong>Sample:</strong><br> map.Api.setMapFeatures("featurescaling:dynamic;dynamiclayer:true;loadmultitiles:false"); 
 * <br><br>
 * <strong>Hints:</strong>
 * <table>
 * <tr><td>"featurescaling:dynamic"</td><td> features size will increase with progressive zoom</td></tr>
 * <tr><td>"mapclip:dynamic"</td><td> clip affects pattern, when map is zoomed; value 'dynamic' resolves that problem, but causes slower panning</td></tr>
 * <tr><td>"delayed"</td><td> the appropriate feature will be called with a little timeout; this enables faster map rendering, but shows transitory map states</td></tr>
 *  </table>
*/
Map.prototype.setFeatures = function(szFeatures){
	// save for bookmark creation
	// --------------------------
	this.szFeatures = (this.szFeatures || "") + ";" + szFeatures;
	var fOldCheckLabelOverlap = fCheckLabelOverlap;
	var featuresA = szFeatures.split(';');
	for ( i in featuresA ){
		var szAttA = featuresA[i].split(':');
		switch (szAttA[0]){
			case "featurescaling":
				if ( szAttA[1]=="dynamic" ){
					fFeatureScaling = true;
					fFeatureScalingDynamic = true;
				}
				else{
					fFeatureScaling = szAttA[1]=="false"?false:szAttA[1];
					fFeatureScalingDynamic = false;
				}
				break;
			case "objectscaling":
				if ( szAttA[1]=="dynamic" ){
					fObjectScaling = "dynamic";
//					fFeatureScalingDynamic = true;
				}
				else{
					fObjectScaling = szAttA[1]=="false"?false:szAttA[1];
				}
				break;
			case "objectlayer":
				if ( szAttA[1]=="belowlabel" ){
					szObjectGroupId = "mapobjects_below_label";
				}
				else{
					szObjectGroupId = szAttA[1];
				}
				break;
			case "dynamiclabel":
				fAdaptLabelToScaling = szAttA[1]=="false"?false:szAttA[1];
				if ( fAdaptLabelToScaling ){
					fCheckLabelOverlap = true;
					fCheckLabelSpace = true;
					fCheckLabelSqueeze = true;
					fKillOverlappingLabel = false;
					fCheckLabelOnlyOne = false;
					if ( szAttA[1].match(/CHECKSPACE/) ){
						fCheckLabelSpace = true;
					}
					if ( szAttA[1].match(/NOCHECKSPACE/) ){
						fCheckLabelSpace = false;
					}
					if ( szAttA[1].match(/NOREPOSITIONING/) ){
						fCheckLabelOverlap = true;
						fKillOverlappingLabel = true;
					}
					if ( szAttA[1].match(/CHECKOVERLAP/) ){
						fCheckLabelOverlap = true;
					}
					if ( szAttA[1].match(/NOCHECKOVERLAP/) ){
						fCheckLabelOverlap = false;
					}
					if ( szAttA[1].match(/ONLYONE/) ){
						fCheckLabelOnlyOne = true;
					}
					if ( szAttA[1].match(/SQUEEZE/) ){
						fCheckLabelSpace = true;
					}
					if ( szAttA[1].match(/NOSQUEEZE/) ){
						fCheckLabelSqueeze = false;
					}
					if ( szAttA[1].match(/SIZE/) ){
						fCheckLabelSize = true;
					}
					if ( szAttA[1].match(/NOSIZE/) ){
						fCheckLabelSize = false;
					}
					if ( szAttA[1].match(/CLIPONTILES/) ){
						 fCheckOverlapClipOnTiles = true;
					}
					if ( szAttA[1].match(/NOCLIPONTILES/) ){
						 fCheckOverlapClipOnTiles = false;
					}
				}
				else{
					fCheckLabelOverlap = false;
					fCheckLabelSpace = false;
					fCheckLabelSqueeze = false;
					fCheckLabelSize = false;
					fKillOverlappingLabel = false;
					fCheckLabelOnlyOne = false;
				}
				break;
			case "dynamiclayer":
				fDynamicLayer = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "dynamictiles":
				fDynamicTiles = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "discardtiles":
				fDiscardTiles = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "loadmultitiles":
				fLoadMultiTiles = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "loadexternaldata":
				fLoadExternalData = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "loadincludes":
				fLoadIncludes = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "loadsilent":
				fLoadingSilent = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "worksilent":
				fExecuteSilent = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "notify":
				fNotify = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "fastpan":
				fPanToolByViewer = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "fullscreen":
				fScaleToFullscreen = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "realtimerotate":
				fRotateOnMouseMove = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "tooltipdelay":
				nTooltipTimeout = Number(szAttA[1]);
				break;
			case "popupdelay":
				nInfoTimeout = Number(szAttA[1]);
				break;
			case "popupgridstyle":
				szTextGridStyle = szAttA[1];
				break;
			case "buttonsize":
				nNormalButtonSize = Number(szAttA[1]);
				break;
			case "symbolsize":
				nNormalSymbolSize = Number(szAttA[1]);
				break;
			case "panborder":
				fMapBorder = true; 
				nMapBorderWidth = Number(szAttA[1]);
				break;
			case "sidebarbuttons":
				fLegendToggleButtons = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "3Dborder":
				fMapBorder3D = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "mapbackgroundstyle":
				szMapBackgroundStyle = szAttA[1];
				break;
			case "mapbackgroundcolor":
				szMapBackgroundColor = szAttA[1];
				break;
			case "transparent":
			case "transparentbackground":
				fTransparentMap = true;
				break;
			case "clipmap":
				if ( szAttA[1]=="dynamic" ){
					fClipMap = true;
					fClipMapDynamic = true;
				}
				else{
					fClipMap = szAttA[1]=="false"?false:szAttA[1];
					fClipMapDynamic = false;
				}
				break;
			case "checklabeloverlap":
				fCheckLabelOverlap = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "onlyonelabel":
				fCheckLabelOnlyOne = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "labelspace":
				nCheckLabelSpace = parseFloat(szAttA[1]);
				break;
			case "decimalpoint":
				fDecimalPointComma = ((szAttA[1]==",")||(szAttA[1]=="komma")||(szAttA[1]=="Komma")||(szAttA[1]=="comma"))?true:false;
				break;
			case "dynamicscale":
				fAdaptMapScaleToSize = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "toolcursor":
				fSetToolCursor = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "scalebar":
				fScaleBar = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "northarrow":
				fNorthArrow = szAttA[1]=="false"?false:szAttA[1];
				break;
			case "northarrowposition":
				szNorthArrowPosition = szAttA[1];
				break;
			case "screenppi":
				nScreenPPI = Number(szAttA[1]);
				if (!nScreenPPI){
					nScreenPPI = 96;
				} 
				break;
			case "embedname":
				szEmbedName = szAttA[1];
				break;
			case "debug":
				fDebug = szAttA[1];
				break;
			case "marktiles":
				fMarkTiles = szAttA[1];
				break;
			case "popupalignment":
				szLocalPopupAlignment = szAttA[1];
				break;
			case "toolmargintop":
				nToolMarginTop = Number(szAttA[1]);
				break;
			case "messageposition":
				szMessagePosition = szAttA[1];
				break;

			// GR 25.06.2012 map themes parameter

			case "maxThemeCharts":
				this.Themes.nMaxThemeCharts = Number(szAttA[1]);
				break;
			case "maxShadowCharts":
				this.Themes.nMaxShadowCharts = Number(szAttA[1]);
				break;
			case "flushPaintShape":
				this.Themes.nflushPaintShape = Number(szAttA[1]);
				break;
			case "flushChartDraw":
				this.Themes.nflushChartDraw = Number(szAttA[1]);
				break;
			case "flushLabelDraw":
				this.Label.nflushLabelDraw = Number(szAttA[1]);
				break;
			case "activeThemeInfo":
				fActiveThemeInfo = szAttA[1];
				break;
			case "fixedInfoScale":
				nFixedInfoScale = Number(szAttA[1]);
				break;
		}
	}
	// execute new settings
	if (!fClipMap || fClipMapDynamic){
		map.Zoom.removeClipping();
	}
};
/**
 * get changed features string like: "featurescaling:dynamic;dynamiclayer:true;loadmultitiles:false"
 * @type string
 * @return the feature definition string
 */
Map.prototype.getFeatures = function(){
	return this.szFeatures;
};
/**
 * checks if any loading is in process (HTTLXMLRequest)
 * @return true or false
 */
Map.prototype.isLoading = function(){
	if ( this.Loader.isWaiting() || (map.Tiles && map.Tiles.isLoading()) || scriptLoaderPool.isLoading() ){
		return true;
	}
	return false;
};
/**
 * checks if an initializing (legend,toolbar,...) is in process 
 * @return true or false
 */
Map.prototype.isInitializing = function(){
	if ( this.fInitializing || (this.Legend && this.Legend.fInitializing) || !this.Scale ){
		return true;
	}
	return false;
};
/**
 * checks if no javascript is in process or planned 
 * @return true or false
 */
Map.prototype.isIdle = function(){
	if ( !this.isInitializing() && !this.isLoading() && (this.actionA.length == 0) && (this.initActionA.length == 0) ){
		return true;
	}
	return false;
};
/**
 * stores an action (JavaScript function to eval) for future execution.
 * the action will be executed when all actual loading processes are done.
 * a setTimeout("map.popAction()") is done to check this condition.
 * @param szAction the (JavaScript) action to be stored  
 */
Map.prototype.pushAction = function(szAction,szMessage){

	// GR 18.02.2014 prevent obsolet zoom and pan on initializing
	if ( szAction.match(/geobounds/i) ){
		for ( var i=0; i<this.actionA.length; i++ ){
			if ( this.actionA[i].match(/geobounds/i) ){
				this.actionA[i].slice(i, 1);
				if ( this.messageA[i] ){
					this.messageA[i].slice(i, 1);
				}
			}
		}
		fPendingNewGeoBounds = true;
	}
	if ( szAction.match(/toview/i) ){
		for ( var i=0; i<this.actionA.length; i++ ){
			if ( this.actionA[i].match(/toview/i) ){
				this.actionA[i].slice(i, 1);
				if ( this.messageA[i] ){
					this.messageA[i].slice(i, 1);
				}
			}
		}
		fPendingNewGeoBounds = true;
	}
	
	_TRACE("--- map.pushAction("+szAction+")");
	this.actionA.push(szAction);
	this.messageA.push(szMessage);
	if ( !this.isInitializing() && this.actionA.length == 1 ){
		setTimeout("map.popAction()",10);
	}
};
/**
 * stores an action (JavaScript function to eval) for future execution.
 * the action will be executed when all actual loading processes are done.
 * a setTimeout("map.popAction()") is done to check this condition.
 * @param szAction the (JavaScript) action to be stored  
 */
Map.prototype.pushInitAction = function(szAction,szMessage){
	_TRACE("--- map.pushInitAction("+szAction+")");
	this.initActionA.push(szAction);
	this.initMessageA.push(szMessage);
	if ( this.initActionA.length == 1 ){
		setTimeout("map.popInitAction()",10);
	}
};
/**
 * checks if all loading processes are done, to prove the condition for executing a stored (JacaScript) action.
 * if this condition is given, the action is executed by eval(szAction);
 * if not, a setTimeout("map.popAction()") is done to recheck later
 */
Map.prototype.popAction = function(){
	_TRACE("--- map.popAction() "+ this.actionA.length +" ["+ this.actionA[0]+"]");
	if ( this.actionA.length == 0 ){
		clearMessage();
		return;
	}
	if ( this.isLoading() || this.isInitializing() ){
		_TRACE("--- map.popAction() posticipated  isLoading:" + this.isLoading() +" isInitializing:"+ this.isInitializing());
		if ( !this.isLoading() ){
			this.npopActionWaitInit++;
		}else{
			this.npopActionWaitInit = 0;
		}
		if ( this.npopActionWaitInit < 100 ){
			setTimeout("map.popAction()",500);
		}else{
			alert("Error at initializing !\nResource missing or corrupted ?\n");
			this.actionA.length = 0;
			this.initActionA.length = 0;
			this.fInitializing = false;
			try{
				if ( HTMLWindow ){
					HTMLWindow.ixmaps.htmlgui_onMapError(window);
				}
			}catch (e){}
		}
		return;
	}
	var szAction = this.actionA.shift();
	var szMessage = this.messageA.shift();
	if ( szMessage ){
		displayMessage(szMessage,1000);
	}
	try{
		eval(szAction);
	}
	catch (e){
		if ( e && (typeof(e) != "undefined") && e.description && (typeof(e.description) != "undefined") ){
			alert("Error: " + e.description + ":\n\n" + szAction);
		}
	}
	setTimeout("map.popAction()",10);
};
/**
 * checks if all loading processes are done, to prove the condition for executing a stored (JacaScript) action.
 * if this condition is given, the action is executed by eval(szAction);
 * if not, a setTimeout("map.popAction()") is done to recheck later
 */
Map.prototype.popInitAction = function(){
	_TRACE("--- map.popInitAction()");
	if ( this.initActionA.length == 0 ){
		map.npopActionWaitInit = 0;
		map.popAction();
		return;
	}
	if ( this.isLoading() ){
		setTimeout("map.popInitAction()",10);
		return;
	}
	var szAction = this.initActionA.shift();
	var szMessage = this.initMessageA.shift();
	_TRACE("--- map.popInitAction() - "+szAction);
	if ( szMessage ){
		displayMessage(szMessage,1000);
	}
	try{
		eval(szAction);
	}
	catch (e){
	}
	setTimeout("map.popInitAction()",10);
};
/**
 * checks if the given version is correct; used by additional JavaScript modules to check their compatibility
 * @param szVersion the version check string
 * @type boolean
 * @return true, if version is ok
 */
Map.prototype.checkVersion = function(szVersion){
	if ( szVersion == null || szVersion != this.version ){
		return false;
	}
	return true;
};
/**
 * Is called by initAll with delay, to switch off the svggis logo
 */
Map.prototype.fadeLogo = function(){	
	var logoNode = SVGDocument.getElementById("mapbackground:logo");
	if (logoNode){
		logoNode.parentNode.removeChild(logoNode);
	}
};



/**
 * Is called by initAll to hide map and legend during initialization
 */
Map.prototype.hideAll = function(){
	var canvasNode = SVGDocument.getElementById("mapcanvas");
	if ( canvasNode ){
		canvasNode.style.setProperty("display","none","");
	}
};
/**
 * Is called by initAll to show map and legend
 */
Map.prototype.showAll = function(){
	var canvasNode = SVGDocument.getElementById("mapcanvas");
	if ( canvasNode ){
		canvasNode.style.setProperty("display","inline","");
	}
};
/**
 * hide all map shapes
 */
Map.prototype.hideMap = function(){
	if ( this.fHidden){
		return;
	}
	var canvasNode = SVGDocument.getElementById("maplayer");
	if ( canvasNode ){
		canvasNode.style.setProperty("display","none","");
	}
	var objectsNode = SVGDocument.getElementById("mapobjects");
	if ( objectsNode ){
		objectsNode.style.setProperty("display","none","");
	}
	this.fHidden = true;
};
/**
 * show all map shapes
 */
Map.prototype.showMap = function(){
	if ( !this.fHidden){
		return;
	}
	var canvasNode = SVGDocument.getElementById("maplayer");
	if ( canvasNode ){
		canvasNode.style.setProperty("display","inline","");
	}
	var objectsNode = SVGDocument.getElementById("mapobjects");
	if ( objectsNode ){
		objectsNode.style.setProperty("display","inline","");
	}
	this.fHidden = false;
};
/**
 * set opacity of map shapes
 */
Map.prototype.setOpacity = function(nValue,szMode){
	var canvasNode = SVGDocument.getElementById("mapcanvas");
	if ( canvasNode ){
		if ( szMode == "absolute" ){
			canvasNode.style.setProperty("opacity",nValue,"");
		}else{
			var szOpacity = canvasNode.style.getPropertyValue("opacity");
			if ( szOpacity == null || szOpacity.length == 0 ){
				szOpacity = "1";
			}
			var nOpacity = parseFloat(szOpacity);
			nOpacity = nOpacity+nValue;
			nOpacity = Math.min(Math.max(nOpacity,0),1);
			canvasNode.style.setProperty("opacity",nOpacity,"");
		}
	}
};
/**
 * toggle opacity of map shapes
 */
Map.prototype.toggleOpacity = function(){
	var canvasNode = SVGDocument.getElementById("mapcanvas");
	if ( canvasNode ){
		var szOpacity = canvasNode.style.getPropertyValue("opacity");
		if ( szOpacity == null || szOpacity.length == 0 ){
			szOpacity = "1";
		}
		var nOpacity = parseFloat(szOpacity);
		nOpacity = (nOpacity<1)?1:0;
		canvasNode.style.setProperty("opacity",nOpacity,"");
	}
};
/**
 * claer all highlights, themes, selections ...
 */
Map.prototype.clearAll = function(){
	map.Dom.clearGroup(SVGToolsGroup);
	map.Dom.clearGroup(SVGFixedGroup);
	map.removeAllHighlights();
	this.Themes.removeAll();
	setMapTool("");	
	this.Scale.nObjectScaling  = 1.0;
};

// create instance here 
var thisversion = "0.9";
map = new Map();
map.version = thisversion;

/* ...................................................................* 
 *  Initialization                                                    * 
 * ...................................................................*/ 

/**
 * Is called by the SVG document, if it is loaded 
 * @param evt the 'onload' event handle
 * @param embedName (optional) the name of the HTML tag that embeds the SVG document
 */
function initAll(evt,embedName){
	console.log("*** iXMaps mapscript version: "+ map.version);
	console.log("*** some .svg or .js files may not be found, this is normal and due to hierarchical location files ***");
	// GR 03.12.2011 new timeout necessary because of cascaded embedding of SVG maps and Firefox ( parent window width was not ready; see below)) 
	// set SVGDocument must be called here !! because evt is lost by setTimeout();
	setSVGDocument(evt,null);
	setTimeout("delayedInitAll(null,'"+embedName+"')",10);
}
var init=0;
function delayedInitAll(evt,embedName){

	if ( map.fInitializing ){
		return;
	}
	map.fInitializing = true;

	setSVGDocument(evt,null);

	_TRACE("--- initAll() ***********************");
	
	// clear screen during init                                    
	map.hideAll();

	// create the dom manipulating object                                    
	map.Dom = new Map.Dom(evt);

	// get root element                                     
    SVGRootElement  = SVGDocument.documentElement;

	// store the embed information in the SVGDocument
	if (fSVGEmbeded){
	    var embedGroup = map.Dom.newNode('g',SVGRootElement);
	    embedGroup.setAttribute("id",'embed');
	    embedGroup.setAttribute("name",embedName);
	}

	// create Group for all generated graphical objects         
	rootGroup = map.Dom.newGroup(SVGRootElement,'objects:antizoomandpan');

	// create all needed Groups for the different graphic elements  
	SVGToolsGroup   = map.Dom.newGroup(rootGroup,'ToolsGroup');
	SVGFixedGroup   = map.Dom.newGroup(rootGroup,'FixedGroup');
	SVGThemeGroup	= map.Dom.newGroup(rootGroup,'ThemeGroup');
	SVGThemeGroup.style.setProperty("display","none","");
	SVGPopupGroup   = map.Dom.newGroup(rootGroup,'PopupGroup');
	SVGNotifyGroup  = map.Dom.newGroup(rootGroup,'NotifyGroup');
	SVGMessageGroup = map.Dom.newGroup(rootGroup,'MessageGroup');
	SVGMenuGroup	= map.Dom.newGroup(rootGroup,'MenuGroup');
	SVGTltipGroup	= map.Dom.newGroup(rootGroup,'TltipGroup');
	SVGHiddenGroup  = map.Dom.newGroup(rootGroup,'HiddenGroup');
	SVGHiddenGroup.style.setProperty("display","none","");
	SVGTempGroup    = map.Dom.newGroup(rootGroup,'TempGroup');

	// read the SVG documents scaling                                   
	SVGWidth       		  = parseInt(SVGRootElement.getAttribute('width'));
	SVGHeight      		  = parseInt(SVGRootElement.getAttribute('height'));
	SVGOrigViewBoxString  = SVGRootElement.getAttribute('viewBox');
	SVGViewBox    		  = SVGRootElement.getAttribute('viewBox').split(' ');
	SVGViewBox[0]		  = Number(SVGViewBox[0]);	
	SVGViewBox[1]		  = Number(SVGViewBox[1]);	
	SVGViewBox[2]		  = Number(SVGViewBox[2]);	
	SVGViewBox[3]		  = Number(SVGViewBox[3]);

	// create the scaling object                                    
	map.Scale = new Map.Scale();
	if ( !map.Scale.scaleNode || !map.Scale.extentNode ){
		alert("SVG source not valid SVGGIS map !");
		return;
	}
	map.Scale.superclass = map;

	if (fAllIncluded || fPDFEmbed){
		map.Scale.createWidgetStyles();
		map.Scale.normalizeSymbols(SVGDocument.getElementById("symbolstore"));
		map.Scale.normalizeButtons(SVGDocument.getElementById("widgetstore"));
		map.Event.initUseNodes(SVGDocument.getElementById("widgetstore"));
	}else{
		map.pushAction('map.Scale.createWidgetStyles()');
		map.pushAction('map.Scale.normalizeSymbols(SVGDocument.getElementById("symbolstore"))');
		map.pushAction('map.Scale.normalizeButtons(SVGDocument.getElementById("widgetstore"))');

		// load local settings here, so they can parametrize the 2nd part of init
		try{
			if (1 || (szViewer != "Netscape")){
				// 1. load from referenced include path                                    
				if ( typeof(HTMLWindow.ixmaps.SVGResources_includePath) != 'undefined' ){
					map.Loader.importSVGFile(HTMLWindow.ixmaps.SVGResources_includePath+"/maplocal.svg",SVGDocument,SVGTempGroup,null);
				}
				// if not defined, try this                                    
				else{
					//map.Loader.importSVGFile("../../resources/svg/maplocal.svg",SVGDocument,SVGTempGroup,null);
					map.Loader.importSVGFile("../resources/svg/maplocal.svg",SVGDocument,SVGTempGroup,null);
				}
			}
			// than load from local include path                                    
			map.Loader.importSVGFile("./maplocal.svg",SVGDocument,SVGTempGroup,null);
		}
		catch (e){
		}
	}

	// GR 30.06.2007 make shadow for the objects
	if ( !SVGDocument.getElementById(szShadowFilterToolsId) ){ 
		_TRACE("create shadow filter ! --------------------------------------");
		var filterNode = map.Dom.newNode('filter',rootGroup);

		filterNode.setAttributeNS(null,"id",szShadowFilterToolsId);
		filterNode.setAttributeNS(null,"filterUnits","objectBoundingBox");
		filterNode.setAttributeNS(null,"x","-50%");
		filterNode.setAttributeNS(null,"y","-50%");
		filterNode.setAttributeNS(null,"width","200%");
		filterNode.setAttributeNS(null,"height","200%");

		var filter = map.Dom.newNode('feGaussianBlur',filterNode);
		filter.setAttributeNS(null,"stdDeviation","50");
		filter.setAttributeNS(null,"result","BlurAlpha");

		filter = map.Dom.newNode('feOffset',filterNode);
		filter.setAttributeNS(null,"in","BlurAlpha");
		filter.setAttributeNS(null,"dx","20");
		filter.setAttributeNS(null,"dy","20");
		filter.setAttributeNS(null,"result","OffsetBlurAlpha");

		filter = map.Dom.newNode('feColorMatrix',filterNode);
		filter.setAttributeNS(null,"in","OffsetBlurAlpha");
		filter.setAttributeNS(null,"type","matrix");
		filter.setAttributeNS(null,"values","0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0");
		filter.setAttributeNS(null,"result","matrixOut");

		filter = map.Dom.newNode('feMerge',filterNode);
		var merge = map.Dom.newNode('feMergeNode',filter);
		merge.setAttributeNS(null,"in","matrixOut");
		merge = map.Dom.newNode('feMergeNode',filter);
		merge.setAttributeNS(null,"in","SourceGraphic");
	}

	// GR 10.02.2011 workaround firefox (needs it twice; getBBox() error ) 
	if ( szViewer.match(/Firefox/i) ){
		map.pushAction('map.Scale.normalizeSymbols(SVGDocument.getElementById("symbolstore"))');
		map.pushAction('map.Scale.normalizeButtons(SVGDocument.getElementById("widgetstore"))');
	}	
	
	init++;
	displayMessage(" ... loading... "+(init>1?String(init):""));

	// loade external SVG fragments                                    
	if ( fLoadIncludes ){
		if ( fLoadIncludes == "delayed" ){
			map.pushInitAction("load_includes()");
		}
		else {
			load_includes();
		}
	}

	if (fAllIncluded || fPDFEmbed){
		doInitAll_2();
	}
	else{
		// give time to load and/or render before 2nd part
		map.pushInitAction("doInitAll_2(null)"," ... ");
	}
}
/**
 * Is called by initAll() to continue initialization 
 * @param evt the 'onload' event handle
 */
function doInitAll_2(evt){

	_TRACE("--- initAll_2() *********************");

	if ( HTMLWindow ){
		map.pushInitAction("HTMLWindow.ixmaps.htmlgui_onMapInit(window)");
	}

	// create the event object                                    
	map.Event = new Map.Event();

	// set basic actionhandler                                     
    SVGRootElement.setAttribute("onmouseover","map.Event.defaultMouseOver(evt)");
    SVGRootElement.setAttribute("onmouseout","map.Event.defaultMouseOut(evt)");
    SVGRootElement.setAttribute("onmousedown","map.Event.defaultMouseDown(evt)");
    SVGRootElement.setAttribute("onmouseup","map.Event.defaultMouseUp(evt)");
    SVGRootElement.setAttribute("onmousemove","map.Event.defaultMouseMove(evt)");
    SVGRootElement.setAttribute("onclick","map.Event.defaultMouseClick(evt)");
    SVGRootElement.setAttribute("onkeydown","map.Event.defaultKeyDown(evt)");
    SVGRootElement.setAttribute("onkeyup","map.Event.defaultKeyUp(evt)");

	// set viewer zoom actionhandler                                     
	if ( typeof(map.Event.doDefaultZoom) == 'function' ){
		SVGRootElement.addEventListener('SVGZoom',   map.Event.doDefaultZoom, false);
		SVGRootElement.addEventListener('SVGScroll', map.Event.doDefaultPan, false);
		SVGRootElement.addEventListener('SVGResize', map.Event.doDefaultResize, false);
	}

	// create the layer object                                    
	map.Layer = new Map.Layer(evt);

	// initialize anti zoom and pan                                   
	antiZoomAndPanList = new AntiZoomAndPan(evt);
	antiZoomAndPanList.initAntiZoomPattern(evt,null);
	// GR 04.02.2011
	antiZoomAndPanList.initAntiZoomSymbols(null,SVGDocument.getElementById("symbolstore"));
	antiZoomAndPanList.initAntiZoomStyles(evt);
	map.Layer.initPatternScaling(evt,null);

	// initialize zooming                                    
	map.Zoom  = new Map.Zoom(map.Scale.initScale);
	_TRACE("--- map.Zoom --- OK");

	// initialize tile processing                                   
	map.Tiles = new Map.Tiles();
	_TRACE("--- map.Tiles --- OK");

	// initialize label processing                                   
	map.Label = new Map.Label();
	_TRACE("--- map.Label --- OK");

	// initialize map viewport
	map.Viewport = new Map.Viewport(evt);
	_TRACE("--- map.Viewport --- OK");

	//setTimeout("displayScale(null,'bottom')",100);
	map.pushAction("map.Zoom.initOverviewMap(null)");

	// may be not necessary; TBD changes in SVGGIS GR 05.10.2006
	map.Layer.switchScaleDependentLayer(evt);
	map.Scale.refreshCSSStyles();

	// GR 28.02.2011 baseline-shift not working in Chrome, Firefox, ...
	map.pushAction('__scaleLineDecorations(SVGRootElement,1)');

	// initialize map GUI  
	try{
		// remove Adobe Context Menu
		var mRoot = contextMenu.firstChild;
		map.Dom.clearGroup(mRoot);
		}
	catch (e){
	}

	// initialize html GUI and ask for map feature parameter
	try{
		HTMLWindow.ixmaps.htmlgui_setScaleSelect(String(__formatValue(Math.floor(map.Scale.getTrueMapScale()*map.Scale.nZoomScale)),0,"BLANK"));
	}
	catch (e){
	}
	// report actual envelope 
	try{
		HTMLWindow.ixmaps.htmlgui_setCurrentEnvelope(map.Zoom.getEnvelopeString(),true);
	}
	catch (e){
	}
	try{
		HTMLWindow.ixmaps.htmlgui_queryMapFeatures();
	}
	catch (e){
	}

	_TRACE("--- map.GUI --- OK");

	// if clipping switched off, deactivate clip path
	if (!fClipMap || fClipMapDynamic){
		map.Zoom.removeClipping();
	}

	// finally load external tiles, if present
	if (fPDFEmbed){
		map.Tiles.switchScaleDependentTiles(evt);
		clearMessage();
	}else{
		if (!map.Scale.initZoomNode){
			//map.pushAction("executeWithMessage(\"map.Tiles.switchScaleDependentTiles(null)\",\"... loading map tiles ...\")");
		}
	}

	// show all
	setTimeout("map.showAll()",500);

	// init delayed to include all loaded parameter 
	setTimeout("map.Zoom.init()",1000);

	// and fade logo
	setTimeout("map.fadeLogo()",10000);

	// initiate dynamic label, if wanted
	map.Layer.prepareCheckOverlap(evt,map.Layer.layerNode);

	_TRACE("--- all init done ---");

	map.fInitializing = false;

	map.Loader.importSVGFile("./maplocal.svg",SVGDocument,SVGTempGroup,null);

	if ( HTMLWindow ){
		map.pushInitAction("HTMLWindow.ixmaps.htmlgui_onMapReady(window)");
	}

	// with this dummy, we force the popInitAction() to start, if no other pushInitAction() has been done
	// this is necessary to get the popAction() running when the initAction queue has been done
	map.pushInitAction("nothing()");

	_TRACE("--- initAll_2 finished !");
}

/* ...................................................................* 
 *  End Initialization                                                * 
 * ...................................................................*/ 

// .............................................................................
// init helpers            
// .............................................................................

/**
 * Is called by initAll (or with delay via popAction), to load external SVG fragments
 */
function load_includes(){
	try{
		// first load from general resource path                                    
		loadSVGIncludes(null,"../../resources/svg");
		// then load from maps resource path                                    
		setTimeout("loadSVGIncludes(null,'../resources/svg')",10);
		// then load from the map path                                    
		setTimeout("loadSVGIncludes(null,'./')",10);

		// finally, if defined, then load from an explicitly defined resource path                                    
		if ( typeof(HTMLWindow.ixmaps.SVGResources_includePath) != 'undefined' ){
			setTimeout("loadSVGIncludes(null,'"+HTMLWindow.ixmaps.SVGResources_includePath+"')");
		}
	}
	catch (e){
	}
}

/**
 * Is called by initAll
 * @param evt the 'onload' event handle
 * @param embedName (optional) the name of the HTML tag that embeds the SVG document
 */
function setSVGDocument(evt,embedName){
	if (embedName){
		fSVGEmbeded = true;
		if ( document.embeds[embedName]){
			SVGDocument	 		  = document.embeds[embedName].getSVGDocument();
			EmbedHeight			  = document.embeds[embedName].height; 		
			EmbedWidth			  = document.embeds[embedName].width; 		
		}
	}
	else{
		if (evt){
			SVGDocument	 = evt.target.ownerDocument;
		}
	}
	// check, if we have all external svg included ; 
	if ( SVGDocument.getElementById("widgetstore") && SVGDocument.getElementById("widgetstore").childNodes.length > 2){ 
		fAllIncluded = true;
	}
	// check, if we run inside PDF; 
	if ( !window.parent || !window.screen || !window.location ){
		fPDFEmbed = true;
	}

	fLocalHost = String(window.location).match(/localhost/);

	szViewer =  navigator.appName;

	// get SVG viever info
	if ( navigator.appName.match(/Adobe/) && navigator.appVersion.match(/6.0x/) ){
		szViewer  = "Adobe6.0";
	}
	else
	if ( navigator.appName.match(/Adobe/) && navigator.appVersion.match(/3.0/) ){
		szViewer  = "Adobe3.0";
	}
	else
	if ( navigator.appName.match(/Opera/) ){
		szViewer  = "Opera";
	}
	else
	if ( navigator.appName.match(/Netscape/) ){
		szViewer  = "Netscape";
	}

	if ( navigator.userAgent && navigator.userAgent.match(/Chrome/) ){
		szViewer  = "Chrome";
	}
	else
	if ( navigator.userAgent && navigator.userAgent.match(/Firefox/) ){
		szViewer  = "Firefox";
	}

	// set the map namespace
	var szNs = SVGDocument.documentElement.getAttribute("xmlns:xmap");
	if ( szNs && szNs.length > 3 ){
		szMapNs = szNs;
	}

	// GR 14.04.2010 set HTML document for __htmlgui calls (Firefox,Chrome,Opera,Safari)
	if ( window.parent && window.parent.window && window.parent.window.ixmaps ){
		HTMLWindow = window.parent.window;
	}
}

// GR 09.05.2011 delay method calls for Firefox ( getBBox() error )

var __execLaterA = new Array(0);
function __executeMethodLater(obj,szExec){
	__execLaterA.push({obj:obj,szExec:szExec});
	setTimeout("__doExecuteMethodLater()",1);
}
function __doExecuteMethodLater(){
	var exec = __execLaterA.shift();
	if ( exec ){
		eval("exec.obj."+exec.szExec);
	}
}

// .............................................................................
// methods to create and remove elements from the SVGObjectGroup (DOM)            
// .............................................................................

/**
 * Create a new Map.Dom instance.  
 * @class It links to the DOM of the SVG document and defines methods to query and change it
 * @constructor
 * @throws 
 * @return A new Map.Dom
 */
Map.Dom = function(evt){
	/** holds the main SVG document */
	this.targetDocument = SVGDocument;
	if (evt){
		this.targetDocument = evt.target.ownerDocument;
	}
	/** holds the root element of the SVG document @type DOM node */
	this.rootElement = this.targetDocument.documentElement;
	/** array that holds the result of the method {@link #getAllIds} @type array */
	this.idList		 = new Array(0);
	/** array that holds objects by random names created by pushObject; usefull to find DOM objects by a generated name on events */
	this.objStackA   = new Array(0);
};
Map.Dom.prototype = new Map();

/**
 * sets a new target document for all MapDom methods 
 * @param targetDocument the new target document to set
 */
Map.Dom.prototype.setTargetDocument = function(targetDocument){
	if (targetDocument){
		this.targetDocument = targetDocument;
	}
};
/**
 * sets a new target SVG group <g> for all create methods.
 * New elements will be created within this group
 * @param targetGroup the new target group to set
 */
Map.Dom.prototype.setTargetGroup = function(targetGroup){
	if (targetGroup){
		this.targetGroup = targetGroup;
	}
};
/**
 * creates a new DOM element with the given tag name 
 * @param tagName the tag name of the new element
 * @param targetGroup [optional] the target group to create the new node within 
 * @return the created element
 */
Map.Dom.prototype.newNode = function(tagName,targetGroup){
	var newNode = this.targetDocument.createElementNS(szSVG,tagName);
	if (!targetGroup && this.targetGroup){
		targetGroup = this.targetGroup;
	}
	if (targetGroup){
		targetGroup.appendChild(newNode);
	}
	return newNode;
};
/**
 * creates a new SVG group element with the given id
 * @param targetGroup [optional] the target group to create the new group within
 * @param szId  [optional] the id to be set for the created grouph
 * @return the created group element
 */
Map.Dom.prototype.newGroup = function(targetGroup,szId){
	var newNode = this.newNode('g',targetGroup);
	if (newNode){
		if (szId){
			newNode.setAttribute("id",szId);
		}		
		newNode.fu = new Methods(newNode);
	}
	return newNode;
};
/**
 * creates a new DOM element with the given tag name and adds extended methods
 * @param tagName the tag name of the new element
 * @param targetGroup [optional] the target group to create the new node within 
 * @return the created element
 */
Map.Dom.prototype.newObject = function(tagName,targetGroup){
	var newNode = this.newNode(tagName,targetGroup);
	if (newNode){
	  newNode.fu = new Methods(newNode);
	}
	return newNode;
};
/**
 * calls .getElementById(id) and adds extended methods if node found
 * @param szId the id of the DOM node to fetch 
 * @return the enhanced element or null
 */
Map.Dom.prototype.getObjectById = function(szId){
	var nNode = this.targetDocument.getElementById(szId);
	if (nNode){
	  nNode.fu = new Methods(nNode);
	}
	return nNode;
};
/**
 * removes all child elements from the given SVG group <g>
 * @param nodeGroup the node of the group to clear 
 */
Map.Dom.prototype.clearGroup = function(nodeGroup){
	if (nodeGroup && nodeGroup.hasChildNodes()){
		var childNodes = nodeGroup.childNodes;
		for (var i=childNodes.length-1; i>=0; i--){
			nodeGroup.removeChild(childNodes.item(i));
		}
	}
};
/**
 * remove a DOM element given by its id
 * @param szId the id of the object (shape,group,...) to remove
 */
Map.Dom.prototype.removeElementById = function(szId){
	var objNode = SVGDocument.getElementById(szId);
	if (objNode && objNode.parentNode ){
		objNode.parentNode.removeChild(objNode);
	}
};
/**
 * creates a new DOM node and sets the given attributes
 * @param tagName the tag name of the new element
 * @param targetGroup the target group to create the new node within 
 * @param attributes an array with the attributes to set after node creation; e.g. {x:200,y:200,width:234 ... }
 * @return the created node
 */
Map.Dom.prototype.constructNode = function(tagName,targetGroup,attributes){
	var newElement = this.newObject(tagName,targetGroup);
	var a;
	for ( a in attributes ){
		if ( a.match(/xlink/) ){ 
		   newElement.setAttributeNS("http:"+"/"+"/"+"www.w3.org/1999/xlink",a,attributes[a]);
		}
		else{
		   newElement.setAttributeNS(null,a,attributes[a]);
		}
    }
	return newElement;
};
/**
 * helper to store a DOM object handle with a generated random name into a array
 * this is usefull, to retrieve the object later by this random name on events (text names can be passed to eventhandler)  
 * @return the generated random name to later retrieve the object
 */
Map.Dom.prototype.pushObj = function(objNode){
	var szId = "stackedObject"+String(Math.random());
	this.objStackA[szId] = objNode;
	return szId;
};
/**
 * helper to retrieve a stored a DOM object handle with its assoziated generated random name   
 * @return the stored object handle
 */
Map.Dom.prototype.popObj = function(szId){
	return this.objStackA[szId];
};

/**
 * creates a new SVG shape;
 * usefull wraper to create rect, circle, line and path elements.
 * <br><br>
 * The following shapes can be created:
 * <br><br>
 *  <table>
 *  <tr><td><CODE>szShape</CODE></td><td><CODE>a,b,c,...</CODE></td></tr>
 *  <tr><td>rect</td><td>x,y,width,height,style</td></tr>
 *  <tr><td>circle</td><td>cx,cy,r,style</td></tr>
 *  <tr><td>line</td><td>x1,y1,x2,y2,style</td></tr>
 *  <tr><td>path</td><td>d,style</td></tr>
 *  </table>
 * <br>
 * <strong>Sample:</strong><br> map.Dom.newShape("rect",0,0,200,200,"fill:red"); 
 * <br><br>
 * @param szShape the tag name of the shape element
 * @param targetGroup the target group to create the new node within 
 * @param a,b,c,... CSV of attributes 
 * @return the created shape node or null
 */
Map.Dom.prototype.newShape = function(szShape,targetGroup,a,b,c,d,e,f,g,h,i,j,k){
	var attributeA = null;
	switch(szShape){
		case 'rect':
			if ( !( isNaN(c) || (c <= 0) || isNaN(d) || (d <= 0) ) ){
				attributeA = {x:String(a),y:String(b),width:String(c),height:String(d),style:e};
			}
			break;
		case 'circle':
			if ( isFinite(c) && (c > 0) ){
				attributeA = {cx:String(a),cy:String(b),r:String(c),style:d};
			}
			break;
		case 'line':
			if ( isFinite(a) && isFinite(b) && isFinite(c) && isFinite(d) ){
				attributeA = {x1:String(a),y1:String(b),x2:String(c),y2:String(d),style:e};
			}
			break;
		case 'path':
			attributeA = {d:String(a),style:b};
			break;
	}
	if ( attributeA){
		return this.constructNode(szShape,targetGroup,attributeA);
	}
	return null;
};
/**
 * creates a new SVG text element
 * @param targetGroup the target group to create the new text node within 
 * @param x x position of the text 
 * @param y y position of the text 
 * @param s style of the text 
 * @param szText text itself 
 * @return the created text element
 */
Map.Dom.prototype.newText = function(targetGroup,x,y,s,szText){
	if ( !( isFinite(x) && isFinite(y) ) ){
		return null;
	}
	if (!szText || (typeof(szText) == "undefined") ){
		szText = "(undefined)";
	}
	szText = String(szText);
	if ( fCreatTextLink && szText.substr(0,7) == szHTTP ){
		return this.newTextLink(targetGroup,x,y,s,szText);
	}
	nT = this.constructNode('text',targetGroup,{x:String(x),y:String(y),style:s});
	atext = this.targetDocument.createTextNode(szText);
	nT.appendChild(atext);
	return nT;
};
/**
 * creates a new SVG tspan element
 * @param targetGroup the target group to create the new tspan node within (must be a text node)
 * @param x x position of the text 
 * @param y y position of the text 
 * @param s style of the text 
 * @param szText text itself 
 * @return the created tspan element
 */
Map.Dom.prototype.newTSpan = function(targetGroup,s,szText){
	if ( targetGroup.nodeName != "text" ){
		return null;
	}
	if (!szText){
		var szText="(undefined)";
	}
	nT = this.constructNode('tspan',targetGroup,{style:s});
	atext = this.targetDocument.createTextNode(szText);
	nT.appendChild(atext);
	return nT;
};
/**
 * creates a new SVG text link element ( &lt;a&gt; tag with blue and underlined text ).
 * <br>If the parameter <CODE>szLink</CODE> is missing, the displayed text will be the same as the link, but clipped at 30 characters.
 * @param targetGroup the target group to create the new text node within 
 * @param x x position of the text 
 * @param y y position of the text 
 * @param s style of the text 
 * @param szText text itself 
 * @param szLink [optional] a link different from the text can be defined here 
 * @return the created text link element
 */
Map.Dom.prototype.newTextLink = function(targetGroup,x,y,s,szText,szLink){
	nL = this.constructNode('a',targetGroup);
	nL.setAttributeNS(szXlink,"xlink:href",(szLink?szLink:szText));
	nL.setAttributeNS(null,"target",szLinkTarget);
	if (szText && (szText.length > 30)){
		szText = szText.substr(0,29) + " ...";
	}
	nT = this.constructNode('text',nL,{x:String(x),y:String(y),style:s});
	atext = this.targetDocument.createTextNode(szText);
	nT.appendChild(atext);
	nT.style.setProperty("fill","blue","");
	nT.style.setProperty("text-decoration","underline","");
	return nL;
};
/**
 * get all id's within the childs of one node
 * @param objNode the node to start looking for ids 
 * @type array
 * @return an array with the found nodes
 */
Map.Dom.prototype.getAllIds = function(objNode,nRecursion){
	if ( nRecursion == null ){
		this.idList.length = 0;
	}
	if ( objNode && objNode.hasChildNodes() ){
		if (objNode.hasAttributes){
			var szId = objNode.getAttributeNS(null,"id");
			if ( szId ){
				this.idList[this.idList.length] = szId;
			}
		}
		var allChildsA = objNode.childNodes;
		for ( var i=0; i<allChildsA.length ;i++ ){
			this.getAllIds(allChildsA.item(i),1);
		}
	}
	return this.idList;
};
/**
 * add a given extension to all id's in the given node and its childnodes
 * usefull to create unique id's in loaded SVG fragments
 * @param objNode the node to start looking for ids to extend 
 * @param szExtend the string to add to all id found 
 */
Map.Dom.prototype.extendAllIds = function(objNode,szExtend){
	if ( objNode && objNode.nodeType == 1 ){
		var szId = objNode.getAttributeNS(null,"id");
		objNode.setAttributeNS(null,"id",szId+szExtend);
		var allChildsA = objNode.childNodes;
		for ( var i=0; i<allChildsA.length ;i++ ){
			this.extendAllIds(allChildsA.item(i),szExtend);
		}
	}
};
/**
 * returns the first parent node of a given node with a defined node name (tag i.e. <svg> ) 
 * @param objNode	 the starting node
 * @param szNodename the searched parent nodename
 * @return the first parent node that fits or null
 */
Map.Dom.prototype.getParentByNodename = function(objNode,szNodename){
	var parentNode = null;
	if (objNode){
		while ( (parentNode = objNode.parentNode) ){
			if ( parentNode.nodeName == szNodename ){
				return parentNode;
			}
			objNode = parentNode;
		}
	}
	return null;
};

/**
 * returns the first value found for the requested attribute starting from the given node 
 * @type string
 * @param objNode	 the starting node
 * @param szNspace   the namespace of the attribute
 * @param szAttName  the searched attribute field
 * @return the attribute value found or an empty string
 */
Map.Dom.prototype.getAttributeByNodeOrParents = function(objNode,szNspace,szAttName){
	var szId = null;
	while ( objNode && (objNode.nodeType == 1) ){
		szId = objNode.getAttributeNS(szNspace,szAttName);
		if ( (szId == null) || (szId.length == 0) ){
			objNode = objNode.parentNode;
		}
		else{
			return szId;
		}
	}
	return "";
};
/**
 * check if object has a clip-path defined, and return the clipping rect 
 * @param objNode	 the starting node
 * @return the clipping rect
 */
Map.Dom.prototype.getClipRect = function(objNode){
	var clipRect = null;
	var szClipUrl = objNode.getAttributeNS(null,"clip-path");
	if ( szClipUrl ){
		var szM = szClipUrl.match(urlRegExp);
		if ( szM && szM[1] ){
			var clipPathNode = SVGDocument.getElementById(szM[1]);
			if ( clipPathNode && clipPathNode.hasChildNodes ){
				clipRect = clipPathNode.firstChild;
			}
		}
	}
	return clipRect;
};
/**
 * set rectangular clipping to an object<br>
 * if clip-path not yet exists, create new one, else use existing one
 * @param objNode	 the starting node
 * @param setBox	 the clipping region as a box 
 * @return the clipping rect
 */
Map.Dom.prototype.setClipRect = function(objNode,bBox){
	var clipRect = this.getClipRect(objNode);
	if ( !clipRect ){
		var szId = objNode.getAttributeNS(null,"id");
		_TRACE("--- create cliprect for: "+szId);
		var clipPathNode = map.Dom.newNode('clipPath',objNode.parentNode);
		clipPathNode.setAttributeNS(null,"id",szId+":clippath");
		// for Firefox 1.5.0.1
		clipPathNode.setAttributeNS(null,"style","pointer-events:all");
		clipRect = map.Dom.newShape('rect',clipPathNode,0,0,1,1,"fill:none;stroke:none;opacity:0");
		clipRect.setAttributeNS(null,"id",szId+":cliprect");
		objNode.setAttributeNS(null,"clip-path","url(#"+szId+":clippath"+")");
	}
	clipRect.setAttributeNS(null,"x",bBox.x);
	clipRect.setAttributeNS(null,"y",bBox.y);
	clipRect.setAttributeNS(null,"width",bBox.width);
	clipRect.setAttributeNS(null,"height",bBox.height);
	return clipRect;
};

// .................................................................... 
// scaling              
// .................................................................... 

/**
 * Create a new Map.Scale instance.  
 * @class It provides all scaling and normalizing functions. <br>It scans the metadata of the SVG map to get the maps dimension and scale.
 * @constructor
 * @throws -
 * @return A new scale
 */
Map.Scale = function() {

	_TRACE("--- init scale");

	if ( fScaleToFullscreen && !fPDFEmbed && window.screen ){
		SVGRootElement.currentScale = 1;
		var xScale = window.innerWidth / SVGWidth;
		var yScale = window.innerHeight / SVGHeight;
		SVGRootElement.currentScale = Math.min(xScale,yScale);
	}
	/** the original viewbox of the SVG document as box object @type box */
	this.viewBox = new box(SVGViewBox[0],SVGViewBox[1],SVGViewBox[2],SVGViewBox[3]);
	/** the metadata node that contains the scaling attributes @type DOM node */
	this.scaleNode = null;
	/** the map scaling as factor (relative to the map scaling units) @type int */
	this.nMapScale  = null;
	/** the map units as string @type string */
	this.szMapUnits  = null;
	/** the map units as string @type string */
	this.szMapProjection  = "UTM";

	/** the position of the map relative to the SVG canvas @type point */
	this.mapPosition = new point(0,0);
	/** the internal offset of the map.  
	* Maps are generally generated around the coordinate 0,0. (e.g. -5000,-5000 - 5000,5000) and than translated. 
	* The mapOffset must be added to all map coordinates to get the canvas coordinate.
	* @type point
	*/
	this.mapOffset = new point(0,0);

	/** the SVG node, that realises the positioning of the map @type DOM node*/
	this.offsetNode = SVGDocument.getElementById("mapoffset");
	/** the SVG node, that realises the internal map coordinate offset @type DOM node */
	this.canvasNode = SVGDocument.getElementById("mapcanvas");
	/** the SVG node, that realises the map zooming and panning @type DOM node */
	this.zoomNode   = SVGDocument.getElementById("mapzoomandpan");

	if (this.canvasNode){
		this.mapOffset = getTranslate(this.canvasNode);
	}
	if (this.offsetNode){
		this.mapPosition = getTranslate(this.offsetNode);
	}

	/** holds the node of the css styles @type DOM node */
	this.CSSStyleNodes = SVGDocument.getElementById("mapstyles");
	/** flag to notify that any CSS style has been changed; for assynchronous style activation @type boolean */
	this.fCSSStyleNodeChanged = false;
	/** array to hold all symbols, that have been scaled */
	this.scaledSymbolsA = new Array(0);
	/** array to hold all symbols, that have been rotated */
	this.rotatedSymbolsA = new Array(0);

	/** the width of the screen (in pixle) @type int */
	this.screenX = 1024;
	/** the height of the screen (in pixle) @type int */
	this.screenY = 768;
	/** pixel per inch of the screen; needed for the map scale @type double */
	this.nPPI    = nScreenPPI;

	/** get map metadata */
	/** holds the root mode of the map metadata @type DOM node*/
	this.metadataNode = null;

	var mNodesA = SVGRootElement.getElementsByTagName("metadata");

	this.metadataNode = mNodesA[mNodesA.length-1];

	if (this.metadataNode){

		/** holds metadata information of the map creation @type DOM node */
		this.creationNode	= this.metadataNode.getElementsByTagNameNS(szMapNs,"creation").item(0);

		/** holds metadata information about the map extension @type DOM node */
		this.extentNode		= this.metadataNode.getElementsByTagNameNS(szMapNs,"extension").item(0);
		if ( this.extentNode ){
			/** map geo envelope, min x geo coordinate @type double */
			this.minBoundX  = Number(this.extentNode.getAttribute('minboundx'));
			/** map geo envelope, max x geo coordinate @type double */
			this.maxBoundX  = Number(this.extentNode.getAttribute('maxboundx'));
			/** map geo envelope, min y geo coordinate @type double */
			this.minBoundY  = Number(this.extentNode.getAttribute('minboundy'));
			/** map geo envelope, max y geo coordinate @type double */
			this.maxBoundY  = Number(this.extentNode.getAttribute('maxboundy'));
			/** map size, min SVG x value @type int */
			this.minX       = Number(this.extentNode.getAttribute('minx'));
			/** map size, min SVG y value @type int */
			this.minY       = Number(this.extentNode.getAttribute('miny'));
			/** map size, max SVG x value @type int */
			this.maxX       = Number(this.extentNode.getAttribute('maxx'));
			/** map size, max SVG y value @type int */
			this.maxY       = Number(this.extentNode.getAttribute('maxy'));

			/** map size as SVG coordinate box (x,y,width,height) @type box */
			this.bBox	    = new box(this.minX,this.minY,this.maxX-this.minX,this.maxY-this.minY);

			/** geo to svg coordinate resolution of x axis @type double */
			this.mapUnitsPPX = (this.maxBoundX-this.minBoundX)/(this.maxX-this.minX);
			/** geo to svg coordinate resolution of y axis @type double*/
			this.mapUnitsPPY = (this.maxBoundY-this.minBoundY)/(this.maxY-this.minY);

			this.origMinX = this.minX;
			this.origMinY = this.minY;
		}
		
		/** holds metadata information about the map scaling @type DOM node */
		this.scaleNode		= this.metadataNode.getElementsByTagNameNS(szMapNs,"scale").item(0);
		if ( this.scaleNode ){
			/** original scale of the map @type double */
			this.nMapScale  = Number(this.scaleNode.getAttribute('mapscale'));

			/** original dpi (dots per inch) of the map @type double */
			this.nMapPPI    = Number(this.scaleNode.getAttribute('dpi'));
			if ( !this.nMapPPI ){
				this.nMapPPI = nStandardPPI;
			}

			/** sacel units (as string) @type string */
			this.szMapUnits  = this.scaleNode.getAttribute('mapunitsstr');

			/** initial scale different from original scale (if defined) @type double */
			this.initScale   = this.scaleNode.getAttribute('mapinitscale');

			/** node that holds the initial zoom envelope (if defined, map will be zoomed to this extend after init() ) @type DOM node */
			this.initZoomNode = this.metadataNode.getElementsByTagNameNS(szMapNs,"initzoom").item(0);

			/** initial scaling for all features (lines,symbols,...) @type double */
			this.nFeatureScaling = 1;
			/** initial scaling for all border lines (of polygons) @type double */
			this.nBorderScaling  = 1;
			/** additional scaling only for lines @type double */
			this.nLineScaling    = 1;
			/** additional scaling only for label @type double */
			this.nLabelScaling   = 1;
			/** additional scaling only for objects @type double */
			this.nObjectScaling  = 1;

			/** sets the map scale as base scale for dyamic object scaling */
			/** GR 24.10.2016 */
			this.nNormalSizeScale = this.nMapScale;
			/** GR 24.10.2016 */
			this.nDynamicScalePow = 3;
		}
		/** holds metadata information about the map coordinate system @type DOM node */
		this.coordsysNode = this.metadataNode.getElementsByTagNameNS(szMapNs,"coordsys").item(0);
		if ( this.coordsysNode ){
			/** projection of the map coordinate system */
			this.szMapProjection = this.coordsysNode.getAttribute('projection');
			/** datum of the map coordinate system */
			this.szDatum = this.coordsysNode.getAttribute('datum');
			/** UTM zone of the map coordinate system */
			this.szUTMZone = this.coordsysNode.getAttribute('UTMZone');
			/** the false easting of the map coordinate system (only set if diverts from UTM standard) */
			this.nFalseEasting = Number(this.coordsysNode.getAttribute('falseeasting'));
			/** the false northing of the map coordinate system (only set if diverts from UTM standard) */
			this.nFalseNorthing = Number(this.coordsysNode.getAttribute('falsenorthing'));
			/** a correction to be applied to the false easting */
			this.nCorrectEasting = Number(this.coordsysNode.getAttribute('correcteasting'));
			/** a correction to be applied to the false northing */
			this.nCorrectNorthing = Number(this.coordsysNode.getAttribute('correctnorthing'));
		}
		/** node that can hold attributes to change the map features (e.g.cliptextpath="true") @type DOM node */
		this.featuresNode = this.metadataNode.getElementsByTagNameNS(szMapNs,"features").item(0);
		if ( this.featuresNode ){
			var szMapFeatures = this.featuresNode.getAttributeNS(null,"mapfeatures");
			if (szMapFeatures && szMapFeatures.length > 1){
				map.setFeatures(szMapFeatures);
			}
			if ( this.featuresNode.getAttributeNS(null,"cliptextpath") == "true" ){
				fAdaptLabelToScaling = "delayed";
			}
			if ( this.featuresNode.getAttributeNS(null,"initlegendoff") == "true" ){
				fInitLegendOff = true;
			}
			if ( this.featuresNode.getAttributeNS(null,"checklabeloverlap") == "true" ){
				fCheckLabelOverlap = true;
			}
			if ( this.featuresNode.getAttributeNS(null,"onlyonelabel") == "true" ){
				fCheckLabelOnlyOne = true;
			}
			if ( this.featuresNode.getAttributeNS(null,"tiletextnoclip") == "true" ){
				fTileTextNoClip = true;
			}

			this.nFeatureScaling = Number(this.featuresNode.getAttribute('featurescaling'));
			this.nBorderScaling  = Number(this.featuresNode.getAttribute('borderscaling'));
			this.nLineScaling    = Number(this.featuresNode.getAttribute('linescaling'));
			this.nLabelScaling   = Number(this.featuresNode.getAttribute('labelscaling'));
			this.nObjectScaling  = Number(this.featuresNode.getAttribute('objectscaling'));

			this.nFeatureScaling = this.nFeatureScaling?this.nFeatureScaling:1;
			this.nBorderScaling  = this.nBorderScaling?this.nBorderScaling:1;
			this.nLineScaling    = this.nLineScaling?this.nLineScaling:1;
			this.nLabelScaling   = this.nLabelScaling?this.nLabelScaling:1;
			this.nObjectScaling  = this.nObjectScaling?this.nObjectScaling:1;
		}
	}

	/** the size of grafic ui elements */
	this.nButtonSize = nNormalButtonSize;
	this.nSymbolSize = nNormalSymbolSize;
	this.nFontSize	 = nNormalFontSize;

	/** the screen coordinate scale */
	this.nScaleX = (this.viewBox.width/this.getEmbedWidth()*this.getEmbedScale());
	this.nScaleY = (this.viewBox.height/this.getEmbedHeight()*this.getEmbedScale());
	/** the actual map zoom ( factor applied to nMapScale ) @type double */
	this.nZoomScale = 1;

	/** the center of the view port in map coordinates; changes with zoom and pan */
	this.mapCenter = new point(0,0);

	/** the center of the map relative to the SVG canvas @type point */
	this.mapCanvasCenter = new point(this.mapPosition.x+this.bBox.width/2,this.mapPosition.y+this.bBox.height/2);

	this.setCanvasSize(0,0,window.innerWidth,window.innerHeight,"center");
};

Map.Scale.prototype = new Map();

/**
 * reset map scale to initial values
 */
Map.Scale.prototype.reset = function(){

	_TRACE("--- reset scale");

	if ( fScaleToFullscreen && !fPDFEmbed && window.screen ){
		SVGRootElement.currentScale = 1;
		var xScale = window.innerWidth / SVGWidth;
		var yScale = window.innerHeight / SVGHeight;
		SVGRootElement.currentScale = Math.min(xScale,yScale);
	}
	if (this.canvasNode){
		this.mapOffset = getTranslate(this.canvasNode);
	}
	if (this.offsetNode){
		this.mapPosition = getTranslate(this.offsetNode);
	}

	/** the center of the map relative to the SVG canvas @type point */
	this.mapCanvasCenter = new point(this.mapPosition.x+this.bBox.width/2,this.mapPosition.y+this.bBox.height/2);

	this.setCanvasSize(0,0,window.innerWidth,window.innerHeight,"center");
};
/**
 * set new map extension in screen coordinates
 * @param x position 
 * @param y position 
 * @param width position 
 * @param height position 
 */
Map.Scale.prototype.setCanvasSize = function(x,y,width,height,szMethod){

	_TRACE("--- setCanvasSize("+x+","+y+","+width+","+height+","+szMethod+") ***");

	var SVGViewBoxString = ""+ String(x) +" "+ String(y) +" "+ String(this.normalX(width)) +" "+ String(this.normalX(height)) +"";

	// new map width in svg coordinates - legend offset tolted
	var newWidth  = (this.normalX(width)  - this.mapPosition.x);
	var newHeight = (this.normalX(height) - this.mapPosition.y);

	// delta size for x and y 
	var dWidth  = newWidth  - (this.maxX - this.minX);
	var dHeight = newHeight - (this.maxY - this.minY);

	if ( szMethod == "extendmax" ){
		// resizing method I: via extending max x and y
		// --------------------------------------------
		this.maxX += dWidth;
		this.maxY += dHeight;
		this.maxBoundX += dWidth*this.mapUnitsPPX;
		this.minBoundY -= dHeight*this.mapUnitsPPY;
	}else{
		// resizing method II: keep center of map
		// --------------------------------------------
		this.minX -= dWidth/2;
		this.minY -= dHeight/2;
		this.maxX += dWidth/2;
		this.maxY += dHeight/2;
		this.minBoundX -= dWidth/2*this.mapUnitsPPX;
		this.maxBoundY += dHeight/2*this.mapUnitsPPY;
		this.maxBoundX += dWidth/2*this.mapUnitsPPX;
		this.minBoundY -= dHeight/2*this.mapUnitsPPY;
		if (this.canvasNode){
			setTranslate(this.canvasNode,this.maxX,this.maxY);
			this.mapOffset = getTranslate(this.canvasNode);
		}
	}


	// resizing SVG canvas 
	// --------------------------------------------
	SVGWidth  = width;
	SVGHeight = height;
	SVGRootElement.setAttribute('width',SVGWidth+"px");
	SVGRootElement.setAttribute('height',SVGHeight+"px");
	SVGRootElement.setAttribute('viewBox',SVGViewBoxString);

	SVGOrigViewBoxString  = SVGRootElement.getAttribute('viewBox');
	SVGViewBox    		  = SVGRootElement.getAttribute('viewBox').split(' ');
	SVGViewBox[0]		  = Number(SVGViewBox[0]);	
	SVGViewBox[1]		  = Number(SVGViewBox[1]);	
	SVGViewBox[2]		  = Number(SVGViewBox[2]);	
	SVGViewBox[3]		  = Number(SVGViewBox[3]);
	
	this.viewBox = new box(SVGViewBox[0],SVGViewBox[1],SVGViewBox[2],SVGViewBox[3]);
	this.bBox  = new box(this.minX,this.minY,this.maxX-this.minX,this.maxY-this.minY);
	this.mapCanvasCenter = new point(this.mapPosition.x+this.bBox.width/2,this.mapPosition.y+this.bBox.height/2);
	this.nScaleX = (this.viewBox.width/this.getEmbedWidth()*this.getEmbedScale());
	this.nScaleY = (this.viewBox.height/this.getEmbedHeight()*this.getEmbedScale());

	// resizing clipping 
	// --------------------------------------------
	if (  1){
		var clipRect = SVGDocument.getElementById("mapcliprect");
		if (clipRect){
			clipRect.setAttributeNS(null,"width",newWidth);
			clipRect.setAttributeNS(null,"height",newHeight);
		}
		clipRect = SVGDocument.getElementById("mapcliprect2");
		if (0 && clipRect){
			clipRect.setAttributeNS(null,"x",-newWidth/2);
			clipRect.setAttributeNS(null,"y",-newHeight/2);
			clipRect.setAttributeNS(null,"width",newWidth);
			clipRect.setAttributeNS(null,"height",newHeight);
		}
	}

	// reposition annotation 
	// --------------------------------------------
	var annotationObj = SVGDocument.getElementById("map:annotation");
	if (annotationObj){
		annotationObj.fu = new Methods(annotationObj);
		var bBox = annotationObj.fu.getBox();
		annotationObj.fu.setPosition(this.normalX(width-2)-this.mapPosition.x,
									 this.normalY(height)-this.mapPosition.y-bBox.height*2);
	}
};
/**
 * set new map extension in screen coordinates
 * @param x position 
 * @param y position 
 * @param width position 
 * @param height position 
 */
Map.Scale.prototype.resizeCanvas = function(x,y,width,height,szMethod){

	if ( !szMethod ){
		szMethod = "center";
	}

	_TRACE("--- resizeCanvas("+x+","+y+","+width+","+height+","+szMethod+") ***");

	this.setCanvasSize(x,y,width,height,szMethod);

	try	{
		map.Viewport.reformat();	
		map.Themes.reformat();
		// GR 18.01.2013 do also this
		map.Themes.actualizeActiveTheme(true);

		map.Legend.reformat();
	}
	catch (e){}

	try	{
		displayScale(null,"bottom");
	}
	catch (e){}

	_TRACE("--- resizeCanvas done ***");
};
/**
 * returns the distance between to map points in meter
 * @type double
 * @param x1 x of the first map coordinate
 * @param y1 y of the first map coordinate
 * @param x2 x of the second map coordinate
 * @param y2 y of the second map coordinate
 * @return the distance in meter
 */
Map.Scale.prototype.getDistanceInMeter = function(x1,y1,x2,y2){
	var nDeltaX = x2-x1;
	var nDeltaY = y2-y1;
	var nMeter = 0;
	if ( this.szMapProjection == "Mercator" ){
		this.szMapUnits = "degrees";
	}
	switch (this.szMapUnits){
		case "feet":
			nDeltaX /= 3.2808399;
			nDeltaY /= 3.2808399;
		case "meter":
		case "meters":
			nDeltaX = nDeltaX*this.nZoomScale*this.mapUnitsPPX;
			nDeltaY = nDeltaY*this.nZoomScale*this.mapUnitsPPY;
			nMeter = Math.sqrt(nDeltaX*nDeltaX+nDeltaY*nDeltaY);
			if (nMeter>100){
				nMeter = Math.round(nMeter);
			}
			if (nMeter>10){
				nMeter = Math.round(nMeter*10)/10;
			}
			else{
				nMeter = Math.round(nMeter*100)/100;
			}
			break;
		default:
			// lat lon coordinate system
			var mapPos1   = map.Scale.getMapPosition(x1,y1);
			var mapPos2   = map.Scale.getMapPosition(x2,y2);
			var mapCoord1 = map.Scale.getMapCoordinate(mapPos1.x,mapPos1.y);
			var mapCoord2 = map.Scale.getMapCoordinate(mapPos2.x,mapPos2.y);
				mapCoord1 = map.Scale.getGeoCoordinateOfPoint(mapCoord1.x,mapCoord1.y);
				mapCoord2 = map.Scale.getGeoCoordinateOfPoint(mapCoord2.x,mapCoord2.y);

			if (1){
				// Haversine Function ( correct for all distances )
				var nLat1 = mapCoord1.y/180*Math.PI;
				var nLat2 = mapCoord2.y/180*Math.PI;
				var nLon1 = mapCoord1.x/180*Math.PI;
				var nLon2 = mapCoord2.x/180*Math.PI;

				var dLon = Math.abs(nLon2-nLon1);
				var dLat = Math.abs(nLat2-nLat1);

				var a = Math.pow((Math.sin(dLat/2)),2) + Math.cos(nLat1) * Math.cos(nLat2) * Math.pow((Math.sin(dLon/2)),2); 
				var c = 2 * Math.atan2( Math.sqrt(a), Math.sqrt(1-a) ); 

				nMeter = c*6378.388*1000;

			}else{
				// Law of Cosines ( causes incorrect results on small distances because computationally inaccurate cos )
				nLat1 = this.minBoundY+y1*this.nZoomScale*this.mapUnitsPPY;
				nLat2 = this.minBoundY+y2*this.nZoomScale*this.mapUnitsPPY;
				nLon1 = this.minBoundX+x1*this.nZoomScale*this.mapUnitsPPX;
				nLon2 = this.minBoundX+x2*this.nZoomScale*this.mapUnitsPPX;
				nDist = Math.acos(Math.sin(nLat1/180*Math.PI)*Math.sin(nLat2/180*Math.PI) + 
								  Math.cos(nLat1/180*Math.PI)*Math.cos(nLat2/180*Math.PI)*Math.cos(nLon2/180*Math.PI-nLon1/180*Math.PI));
				nMeter = nDist*6378.388*1000;
				}

			break;
	}
	return nMeter;
};
/**
 * formats a distance given in meter into a string of the appropriate map unit ( meter, kilometer, feet, miles )
 * @type string
 * @param nMeter the distance in meter to format
 * @return string with distance and unit
 */
Map.Scale.prototype.formatDistanceString = function(nMeter){
	if (nMeter > 1000){
		return String(Math.round(nMeter/100)/10) + " km" ;
	}
	else if (nMeter > 100){
		return String(Math.round(nMeter*10)/10) + " m" ;
	}
	else{
		return String(Math.round(nMeter*100)/100) + " m" ;
	}
};
/**
 * formats a surface given in squaremeter into a string of the appropriate map unit ( meter2, km2, feet2, miles2 )
 * @type string
 * @param nQMeter the surface in meter to format
 * @return string with surface and unit
 */
Map.Scale.prototype.formatSurfaceString = function(nQMeter){
	var szValue = "";
	if ( nQMeter > 1000000 ){
		szValue =  String(Math.round(nQMeter/1000000*1000)/1000)+" km2";
	}
	else{
		szValue = String(Math.round(nQMeter*1000)/1000)+" m2";
	}
	szValueA = szValue.split(".");
	if (szValueA.length > 1){
		szValue = szValueA[0]+','+szValueA[1];
	}
	return szValue;
};
/**
 * returns the X scalar in canvas coordinates of a distance in meter
 * @type double
 * @param nMeter the distance in meter
 * @return the X scalar
 */
Map.Scale.prototype.getDeltaXofDistanceInMeter = function(nMeter){
	var n1000 = this.getDistanceInMeter(1000,1000,2000,1000);
	return 1000/n1000*nMeter;
};
/**
 * returns the Y scalar in canvas coordinates of a distance in meter
 * @type double
 * @param nMeter the distance in meter
 * @return the Y scalar
 */
Map.Scale.prototype.getDeltaYofDistanceInMeter = function(nMeter){
	var n1000 = this.getDistanceInMeter(1000,1000,1000,2000);
	return 1000/n1000*nMeter;
};
/**
 * returns the geo coordinates of a map position as longitude,latitude 
 * @param x x of the map coordinate
 * @param y y of the map coordinate
 * @return the geo coordinates as point object
 */
Map.Scale.prototype.getMapCoordinate = function(x,y){

	var nLon1 = 0;
	var nLat1 = 0;

	x = x + this.mapOffset.x;
	y = (this.maxY-this.minY) - (y + this.mapOffset.y);

	switch (this.szMapUnits){
		case "feet":
		case "meter":
		case "meters":
			nLon1 = (this.minBoundX + x * this.mapUnitsPPX);
			nLat1 = (this.minBoundY + y * this.mapUnitsPPY);
			break;
		default:
			nLon1 = (this.minBoundX + x *  this.mapUnitsPPX);
			nLat1 = (this.minBoundY + y *  this.mapUnitsPPY);
	}
	return new point(nLon1,nLat1);
};
/**
 * returns the geo coordinates of map position in UTM
 * @param x x of the map coordinate
 * @param y y of the map coordinate
 * @return the UTM coordinates as point object
 */
Map.Scale.prototype.getMapCoordinateUTM = function(x,y){

	var ptCoord = this.getMapCoordinate(x,y);
	if ( this.szMapProjection == "Mercator" ){
		ptCoord = _LLtoMercator(ptCoord.y, ptCoord.x);
	}else
	if ( this.szMapUnits != "feet" && this.szMapUnits != "meter" && this.szMapUnits != "meters" ){
		ptCoord = _LLtoUTM("WGS84", ptCoord.y, ptCoord.x);
	}
	return ptCoord;
};
/**
 * returns the map position of geo coordinates in Lat/Lon
 * @param lat of the map coordinate
 * @param lon of the map coordinate
 * @type point
 * @return the map coordinates as point object
 */
Map.Scale.prototype.getMapPositionOfLatLon = function(lat,lon){

	ptOff = map.Scale.getMapCoordinateOfLatLon(lat,lon);
	var nX  = (ptOff.x-map.Scale.minBoundX)/map.Scale.mapUnitsPPX - map.Scale.mapOffset.x;
	var nY  = map.Scale.maxY - map.Scale.minY - (ptOff.y-map.Scale.minBoundY)/map.Scale.mapUnitsPPY - map.Scale.mapOffset.y;
	return new point(nX,nY);
};
/**
 * returns the map coordinates of a geo coordinates in Lat/Lon
 * @param lat of the geo coordinate
 * @param lon of the geo coordinate
 * @type point
 * @return the map coordinates as point object
 */
Map.Scale.prototype.getMapCoordinateOfLatLon = function(lat,lon){

	var	ptCoord = new point(Number(lon),Number(lat));
	if ( this.szMapProjection == "Mercator" ){
		ptCoord = _LLtoMercator(lat, lon);
	}else
	if ( this.szMapUnits == "feet" || this.szMapUnits == "meter" || this.szMapUnits == "meters" ){
		if ( !this.szDatum && !this.szUTMZone ){
			return null;
		}
		var	ptCoord = _LLtoUTM(this.szDatum, lat, lon, this.szUTMZone);
		if ( this.nFalseEasting){
			ptCoord.x += (this.nFalseEasting-500000.0);
		}
		ptCoord.y += this.nFalseNorthing + this.nCorrectNorthing;

		ptCoord.x += this.nCorrectEasting;
		ptCoord.y += this.nCorrectNorthing;
	}
	return ptCoord;
};
/**
 * returns the map coordinates of a geo coordinates in Lat/Lon
 * @param lat of the geo coordinate
 * @param lon of the geo coordinate
 * @type point
 * @return the map coordinates as point object
 */
Map.Scale.prototype.getGeoCoordinateOfPoint = function(x,y){

	if ( this.szMapProjection == "Mercator" ){
		return _MercatortoLL(y,x);
	}
	if ( this.szMapUnits != "feet" && this.szMapUnits != "meter" && this.szMapUnits != "meters" ){
		return new point(x,y);
	}
	else{
		if ( !this.szDatum && !this.szUTMZone ){
			return null;
		}
		var	ptCoord = new point(x,y);
		if ( this.nFalseEasting){
			ptCoord.x -= (this.nFalseEasting-500000.0);
		}
		ptCoord.y -= this.nFalseNorthing + this.nCorrectNorthing;

		ptCoord.x -= this.nCorrectEasting;
		ptCoord.y -= this.nCorrectNorthing;

		return _UTMtoLL(this.szDatum, ptCoord.y, ptCoord.x, this.szUTMZone );
	}
};
/**
 * returns the map coordinates of a point given in widget coordinates (antizoomandpan).
 * usefull to translate tool coordinates to map coordinates
 * @param x x of the widget coordinate
 * @param y y of the widget coordinate
 * @return the map position (x,y) as point object
 */
Map.Scale.prototype.getMapPosition = function(x,y){

	var zoomMatrixA = getMatrix(this.zoomNode);
	var nZoomX = zoomMatrixA[0];
	var nZoomY = zoomMatrixA[3];
	
	// from widget to canvas
	var matrixA = antiZoomAndPanList.getActualMatrix();
	x		= x*matrixA[0]+matrixA[4];
	y		= y*matrixA[3]+matrixA[5];

	// from canvas to map
	x		= x-this.mapPosition.x-this.mapOffset.x;
	y		= y-this.mapPosition.y-this.mapOffset.y;

	// subtract old map zoom and pan
	x		= (x-zoomMatrixA[4])/nZoomX;
	y		= (y-zoomMatrixA[5])/nZoomY;

	return new point(x,y);
};
/**
 * clips the given point to the map position range
 * @param ptPos point to be clipped ( as point object )
 * @return the clipped position as point object
 */
Map.Scale.prototype.clipWidgetPositionToMap = function(ptPos){

	if ( ptPos.x >= this.mapPosition.x+this.bBox.width ){
		ptPos.x = this.mapPosition.x+this.bBox.width; 
	}
	if ( ptPos.x <= this.mapPosition.x ){
		ptPos.x = this.mapPosition.x; 
	}
	if ( ptPos.y >= this.mapPosition.y+this.bBox.height ){
		ptPos.y = this.mapPosition.y+this.bBox.height; 
	}
	if ( ptPos.y <= this.mapPosition.y ){
		ptPos.y = this.mapPosition.y; 
	}
	return ptPos;
};
/**
 * checks if the given point is within map position range
 * @type boolean
 * @param ptPos point to be checked
 * @return true or false
 */
Map.Scale.prototype.isWidgetPositionInMap = function(ptPos){

	if ( ptPos.x > this.mapPosition.x+this.bBox.width	|| 
	     ptPos.x < this.mapPosition.x						||
	     ptPos.y > this.mapPosition.y+this.bBox.height		||
		 ptPos.y < this.mapPosition.y						){
		return false;
	}
	return true;
};
/**
 * positions the given widget object relative to the given point and offset and
 * corrects the poition if the widget object box exeeds the map area.
 * The poition is corrected to show the whole object.
 * The object is automatically positioned to the possible side of the reference point. 
 * @param objNode widget object to be positioned
 * @param ptPos desired position
 * @param ptOffset desired offset from the given position
 * @return the clipped position as point object
 */
Map.Scale.prototype.clipWidgetObjectToMap = function(objNode,ptPos,ptOffset){

	var bBox = map.Dom.getBox(objNode);

	if ((ptPos.x+ptOffset.x+bBox.width)  > this.mapPosition.x+this.bBox.width ){
		ptPos.x -= bBox.width + ptOffset.x*2;
	}
	if ((ptPos.y+ptOffset.y+bBox.height) > this.mapPosition.y+this.bBox.height ){
		ptPos.y -= bBox.height + ptOffset.y*2;
	}
	return new point(ptPos.x+ptOffset.x,ptPos.y+ptOffset.y);
};
/**
 * positions the given widget object relative to the given point and offset and
 * corrects the poition if the widget object box exeeds the SVG canvas.
 * The poition is corrected to show the whole object.
 * The object is automatically positioned to the possible side of the reference point. 
 * @param objNode widget object to be positioned
 * @param ptPos desired position
 * @param ptOffset desired offset from the given position
 * @return the clipped position as point object
 */
Map.Scale.prototype.clipWidgetObjectToSVG = function(objNode,ptPos,ptOffset,bBox){

	if ( !bBox ){
		bBox = map.Dom.getBox(objNode);
	}
	if (objNode.getAttributeNS(null,"clip-path")){
		szClipPath = objNode.getAttributeNS(null,"clip-path");
		if (szClipPath.match(/url/) ){
			szClipPath = szClipPath.substr(5,szClipPath.length-6);
			var clipPathNode = SVGDocument.getElementById(szClipPath);
			if (clipPathNode){
				var clipPathRect = clipPathNode.firstChild;
				bBox.x = Number(clipPathRect.getAttributeNS(null,"x"));
				bBox.y = Number(clipPathRect.getAttributeNS(null,"y"));
				bBox.width = Number(clipPathRect.getAttributeNS(null,"width"));
				bBox.height = Number(clipPathRect.getAttributeNS(null,"height"));
			}
		}
	}
	var newPosition = new point(ptPos.x+ptOffset.x,ptPos.y+ptOffset.y);

	if ((newPosition.x+bBox.width)  > this.viewBox.width ){
		newPosition.x = ptPos.x - bBox.width - ptOffset.x;
	}
	if ((newPosition.x) < 0 ){
		newPosition.x = map.Scale.normalX(5);
		if ( ptOffset.y <= 0 ){
			newPosition.y -= ptOffset.y;
			ptOffset.y = map.Scale.normalY(20);
			newPosition.y += ptOffset.y;
		}
	}
	if ((newPosition.y+bBox.height) > this.viewBox.height ){
		newPosition.y = ptPos.y - bBox.height - ptOffset.y;
	}
	if ((newPosition.y) < 0 ){
		newPosition.y = map.Scale.normalX(5);
	}
	return newPosition;
};
/**
 * returns the width of the SVG document. If the SVG is embeded, it returns the actual client width
 * @type int
 * @return the width in pixel
 */
Map.Scale.prototype.getEmbedWidth = function(){

	if (typeof(HTMLDocument) != 'undefined' && HTMLDocument != null ){
		try{
			var nWidth  = HTMLDocument.embeds[szEmbedName].clientWidth;
			var nHeight = HTMLDocument.embeds[szEmbedName].clientHeight;
			var windowRatio = nWidth/nHeight;
			var SVGRatio    = SVGWidth/SVGHeight;
			if ( windowRatio < SVGRatio ){
				return (nWidth);
			}
			return nWidth*(SVGRatio/windowRatio);
		}
		catch (e){
			return SVGWidth;
		}
	}
	 
	if (fSVGEmbeded && fEmbedScale){
		if ( EmbedWidth.indexOf('%') != -1 ){
			return document.embeds["svgMain"].clientWidth;
		}
		return EmbedWidth;
	}
	if ( fPDFEmbed ){
		var windowRatio = window.innerWidth/window.innerHeight;
		var SVGRatio    = SVGWidth/SVGHeight;
		if ( windowRatio < SVGRatio ){
			return window.innerWidth;
		}
		return window.innerWidth*(SVGRatio/windowRatio);
	}
	return SVGWidth;
};
/**
 * returns the height of the SVG document. If the SVG is embeded, it returns the actual client height
 * @type int
 * @return the height in pixel
 */
Map.Scale.prototype.getEmbedHeight = function(){

	if (typeof(HTMLDocument) != 'undefined' && HTMLDocument != null ){
		try{
			var nWidth  = HTMLDocument.embeds[szEmbedName].clientWidth;
			var nHeight = HTMLDocument.embeds[szEmbedName].clientHeight;
			var windowRatio = nWidth/nHeight;
			var SVGRatio    = SVGWidth/SVGHeight;
			if ( SVGRatio < windowRatio ){
					return (nHeight);
				}
			return nHeight*(windowRatio/SVGRatio);
		}
		catch (e){
			return SVGHeight;
		}
	}

	if (fSVGEmbeded && fEmbedScale){
		if ( EmbedHeight.indexOf('%') != -1 ){
			return document.embeds["svgMain"].clientHeight;
		}
		return EmbedHeight;
	}
	if ( fPDFEmbed ) {
		var windowRatio = window.innerWidth/window.innerHeight;
		var SVGRatio    = SVGWidth/SVGHeight;
		if ( SVGRatio < windowRatio ){
			return window.innerHeight;
		}
		return window.innerHeight*(windowRatio/SVGRatio);
	}
	return SVGHeight;
};
/**
 * returns the scaling by the embedding document (HTML,PDF). the aspect ratio of the map is preserved, so only one scaling factor is needed
 * @type double
 * @return the scaling factor
 */
Map.Scale.prototype.getEmbedScale = function(){

	if (typeof(HTMLDocument) != 'undefined' && HTMLDocument != null ){
		try{
			var nWidth  = HTMLDocument.embeds[szEmbedName].clientWidth;
			var nHeight = HTMLDocument.embeds[szEmbedName].clientHeight;
			var windowRatio = nWidth/nHeight;
			var SVGRatio    = SVGWidth/SVGHeight;
			if ( SVGRatio < windowRatio ){
					return (nHeight/SVGHeight);
				}
			return (nWidth/SVGWidth);
		}
		catch (e){
			return 1;
		}
	}
	if ( fPDFEmbed ) {
		var windowRatio = window.innerWidth/window.innerHeight;
		var SVGRatio    = SVGWidth/SVGHeight;
		if ( SVGRatio < windowRatio ){
			return (window.innerHeight/SVGHeight);
		}
		return (window.innerWidth/SVGWidth);
	}
	return 1;
};
/**
 * returns the actual map scale as seen on the screen (including embed scaling and ppi scaling)
 * @type double
 * @return the map scale 
 */
Map.Scale.prototype.getTrueMapScale = function(){
	if ( fAdaptMapScaleToSize ){
		return this.nMapScale/this.getEmbedScale()*this.nPPI/this.nMapPPI;
	}else{
		return this.nMapScale*this.nPPI/this.nMapPPI;
	}
};
/**
 * scales a given x value to the initial SVG resolution
 * @type double
 * @param x the value to scale
 * @return the scaled x value
 */
Map.Scale.prototype.normalX= function(x){
	return (x*this.nScaleX);
	};
/**
 * scales a given y value to the initial SVG resolution
 * @type double
 * @param y the value to scale
 * @return the scaled y value
 */
Map.Scale.prototype.normalY = function(y){
	return (y*this.nScaleY);
	};
/**
 * scales a given x value to the embed (HTML) SVG resolution
 * @type double
 * @param x the value to scale
 * @return the scaled x value
 */
Map.Scale.prototype.embedX= function(x){
	return (x/this.nScaleX);
	};
/**
 * scales a given y value to the embed (HTML) SVG resolution
 * @type double
 * @param y the value to scale
 * @return the scaled y value
 */
Map.Scale.prototype.embedY = function(y){
	return (y/this.nScaleY);
	};
/**
 * scales a given x value to the actual (zoomed) SVG resolution
 * @type double
 * @param x the value to scale
 * @return the scaled x value
 */
Map.Scale.prototype.scaleX = function(x){
	return (x/SVGRootElement.currentScale*this.viewBox.width/this.getEmbedWidth());
	};
/**
 * scales a given y value to the actual (zoomed) SVG resolution
 * @type double
 * @param y the value to scale
 * @return the scaled y value
 */
Map.Scale.prototype.scaleY= function(y){
	return (y/SVGRootElement.currentScale*this.viewBox.height/this.getEmbedHeight());
	};
/**
 * scales a given x screen position (mouse) to the actual (zoomed and panned) SVG coordinate
 * @type double
 * @param x the value to scale
 * @return the scaled x value
 */
Map.Scale.prototype.toSVGx = function(x){
	return this.scaleX(x*SVGRootElement.currentScale-SVGRootElement.currentTranslate.x)+this.viewBox.x;
	};
/**
 * scales a given y screen position (mouse) to the actual (zoomed and panned) SVG coordinate
 * @type double
 * @param y the value to scale
 * @return the scaledy  value
 */
Map.Scale.prototype.toSVGy = function(y){
	return this.scaleY(y*SVGRootElement.currentScale-SVGRootElement.currentTranslate.y)+this.viewBox.y;
	};
/**
 * scales a given (zoomed and panned) SVG coordinate to screen position
 * @type double
 * @param x the value to scale
 * @return the scaled x value
 */
Map.Scale.prototype.toScreenX = function(x){
	return (x-this.scaleX(-SVGRootElement.currentTranslate.x)+Number(viewBox[0]))/SVGRootElement.currentScale/viewBoxScale;
	};
/**
 * scales a given (zoomed and panned) SVG coordinate to screen position
 * @type double
 * @param y the value to scale
 * @return the scaled y value
 */
Map.Scale.prototype.toScreenY = function(y){
	return (y-this.scaleY(-SVGRootElement.currentTranslate.y)+Number(viewBox[3]))/SVGRootElement.currentScale/viewBoxScale;
	};
/**
 * translates a given SVG position into a map position
 * @type double
 * @param x the value to scale
 * @return the x map position
 */
Map.Scale.prototype.toMapX = function(x){
	return (x-this.scaleX(-SVGRootElement.currentTranslate.x)+Number(viewBox[0]))/SVGRootElement.currentScale/viewBoxScale;
	};
/**
 * translates a given SVG position into a map position
 * @type double
 * @param y the value to scale
 * @return the y map position
 */
Map.Scale.prototype.toMapY = function(y){
	return (y-this.scaleY(-SVGRootElement.currentTranslate.y)+Number(viewBox[3]))/SVGRootElement.currentScale/viewBoxScale;
	};

// -----------------------------
// new tries
// -----------------------------

/**
 * get the offset of a node caused by an internal parent &lt;svg&gt; tag
 * @param objNode the node to look at
 * @return the offset as point object
 */
Map.Scale.prototype.getSVGOffset= function(objNode){
	var svgNode = objNode;
	if ( svgNode.nodeName != 'svg' ){
		svgNode = map.Dom.getParentByNodename(objNode,'svg');
	}
	if ( svgNode && svgNode != SVGRootElement ){
		var viewBox = svgNode.getAttribute('viewBox');
		var SVGViewBox = viewBox.split(' ');
		if ( SVGViewBox.length == 4 ){
			return new point(Number(SVGViewBox[0]),Number(SVGViewBox[1]));
			}
		else{
			return new point(0,0);
		}
	}
	return  new point(0,0);
};
/**
 * get the offset of a given node defined by parent groups (stops at group: mapzoomandpan)
 * @param objNode the node to look at
 * @return the group offset as point object
 */
Map.Scale.prototype.getGroupOffset= function(objNode){
	var pNode = null;
	var sumOffset = new point(0,0);
	if (objNode){
		while ( (pNode = objNode.parentNode) ){
			if ( pNode == map.Zoom.zoomNode || pNode.nodeType != 1 ){
				return sumOffset;
			}
			var nodeMatrixA = getMatrix(pNode);
			sumOffset.x = sumOffset.x  * nodeMatrixA[0] + nodeMatrixA[4]; 
			sumOffset.y = sumOffset.y  * nodeMatrixA[3] + nodeMatrixA[5]; 
			objNode = pNode;
		}
	}
	return  new point(0,0);
};
/**
 * get the scale of a given node defined by parent groups (stops at group: mapzoomandpan)
 * @param objNode the node to look at
 * @return the scale as point object
 */
Map.Scale.prototype.getGroupScale= function(objNode){
		var groupScale = new point(1,1);
		var pNode = objNode.parentNode;
		while ( pNode && pNode.nodeType == 1 ){
			var ptScale = getScale(pNode);
			if (ptScale){
				groupScale.x *= ptScale.x;
				groupScale.y *= ptScale.y;
			}
			pNode = pNode.parentNode;
		}
	return  groupScale;
};
/**
 * get the offset of a given node defined by &lt;svg&gt; and &lt;g&gt; tags
 * @param objNode the node to look at
 * @return the offset as point object
 */
Map.Scale.prototype.getMapOffset= function(objNode){
	var ptSVGOffset   = this.getSVGOffset(objNode);
	var ptGroupOffset = this.getGroupOffset(objNode);
	return new point(-ptSVGOffset.x+ptGroupOffset.x,-ptSVGOffset.y+ptGroupOffset.y);
};
/**
 * get the position of a node in screen coordinates
 * @param objNode the node to look at
 * @return the position as point object
 */
Map.Scale.prototype.getScreenPosition= function(objNode){
	var ptSVGOffset   = this.getSVGOffset(objNode);
	var ptGroupOffset = this.getGroupOffset(objNode);
	var ptOffset	  = getTranslate(objNode);
	var bBox          = map.Dom.getBox(objNode);
	if ( bBox ){
		ptOffset.x += bBox.x+bBox.width/2;
		ptOffset.y += bBox.y+bBox.height/2;
		}
	var matrixA		  = antiZoomAndPanList.getActualMatrix();
	var zoomMatrixA	  = getMatrix(this.zoomNode);

	// GR 14.12.1007 to be revisited
	ptOffset	      = map.Scale.rotatePoint(ptOffset,-1);

	// _TRACE("mapoffset:"+(this.mapPosition.x+this.mapOffset.x)+','+(this.mapPosition.x+this.mapOffset.x));
	// _TRACE("mapzoom:"+(zoomMatrixA[0])+','+(zoomMatrixA[3]));
	// _TRACE("mappan:"+(zoomMatrixA[4]/zoomMatrixA[0])+','+(zoomMatrixA[5]/zoomMatrixA[3]));
	// _TRACE("objoffset:"+(ptOffset.x-ptSVGOffset.x+ptGroupOffset.x)*zoomMatrixA[0]+','+(ptOffset.y-ptSVGOffset.y+ptGroupOffset.y)*zoomMatrixA[3]);
	// _TRACE("vieweroffset:"+(matrixA[4]*matrixA[0])+','+(matrixA[5]*matrixA[3]));

	//                 <----- map offset ----------------> <-- map pan -> <------------ position of the object -------------------> <-- antizoom & pan -->
	return new point( (this.mapPosition.x+this.mapOffset.x+zoomMatrixA[4]+(ptOffset.x-ptSVGOffset.x+ptGroupOffset.x)*zoomMatrixA[0]-matrixA[4])*matrixA[0],
		              (this.mapPosition.y+this.mapOffset.y+zoomMatrixA[5]+(ptOffset.y-ptSVGOffset.y+ptGroupOffset.y)*zoomMatrixA[3]-matrixA[5])*matrixA[3]  );
};
/**
 * returns the actual mouse position in SVG document coordinates
 * @param evt the mouse event
 * @param clientGroup [optional] if given, the returned position is relative to this node
 * @return the position as point object
 */
Map.Scale.prototype.getClientMousePosition = function(evt,clientGroup){
	var ret = null;
	if (evt){
		var temp = fEmbedScale;
		fEmbedScale=true;
		// if client is in antizoomandpan group, we have to scale differently
		if (clientGroup && antiZoomAndPanList && antiZoomAndPanList.isContained(clientGroup)){
			ret = new point(this.normalX(evt.clientX),this.normalY(evt.clientY));
			var clientScale = new point(this.getEmbedScale(),this.getEmbedScale());
			ret.x /= clientScale.x;
			ret.y /= clientScale.y;
		}
		// if not, do this
		else{
			ret = new point(this.toSVGx(evt.clientX),this.toSVGy(evt.clientY));
		}
		// add group scaling, if necessary
		if ( clientGroup){
			var ptScale = map.Scale.getGroupScale(clientGroup);
			ret.x /= ptScale.x;
			ret.y /= ptScale.y;
		}
		fEmbedScale=temp;
	}
	return ret;
};
/**
 * checks if CSSStyles has ben changed, if yes, makes a reappend to bring the new styles into display
 */
Map.Scale.prototype.refreshCSSStyles = function(){
	if ( this.fCSSStyleNodeChanged ){
		_TRACE("!! +++ Refresh CSS Styles");
		this.CSSStyleNodes.parentNode.parentNode.appendChild(this.CSSStyleNodes.parentNode);
		this.fCSSStyleNodeChanged = false;
		_TRACE("!! +++ Refresh CSS Styles done !");
	}
};
/**
 * normalize all symbols - calls {@link #normalizeElements} with <code>nNormalSymbolSize</code>
 * @param targetGroup the DOM group to look for symbols
 */
Map.Scale.prototype.normalizeSymbols = function(targetGroup){
	if ( __featureScaling_lastScale == 1 ){
		this.normalizeElements(targetGroup,/symbol/,nNormalSymbolSize);
	}
	this.nSymbolSize = nNormalButtonSize;
};
/**
 * normalize all buttons - calls {@link #normalizeElements} with <code>nNormalButtonSize</code>
 * @param targetGroup the DOM group to look for buttons
 */
Map.Scale.prototype.normalizeButtons = function(targetGroup){
	this.normalizeElements(targetGroup,/button/,nNormalButtonSize);
	this.normalizeElements(targetGroup,/icon/,nNormalButtonSize);
	this.nButtonSize = nNormalButtonSize;
};
/**
 * normalize all elements; set normal size and center symbol
 * @param targetGroup the DOM group to look for elements
 * @param regExMatch a regular expression to match the elements (e.g./symbol/)
 * @param nNormalSize the size (max x/y) all elements will be scaled to
 */
Map.Scale.prototype.normalizeElements = function(targetGroup,regExMatch,nNormalSize){
	if (targetGroup){
		var symbolObjects = targetGroup.getElementsByTagName('g');
		var objA = new Array(0);
		for(var i=0;i<symbolObjects.length;i++){
			objA[i] = symbolObjects.item(i);
		}
		for(var i=0;i<objA.length;i++){
			var symbolObj = objA[i];
			var szId = symbolObj.getAttributeNS(null,"id");
			if (szId && szId.match(regExMatch)){
				var firstObj = SVGDocument.getElementById(szId);
				if ( firstObj && (firstObj != symbolObj) ){
					//firstObj.setAttributeNS(null,"id","doublette");
					firstObj.parentNode.removeChild(firstObj);
				}
				symbolObj.fu = new Methods(symbolObj);

				var bBox = map.Dom.getBox(symbolObj);
				// if we can't get the box, make temporary use element and trry again (for firefox!)
				if ( bBox.width == 0 ){
					var cNode = map.Dom.constructNode('use',SVGTempGroup,{'xlink:href':'#'+szId});
					bBox = map.Dom.getBox(cNode);
				}

				var nScale = this.normalX(nNormalSize)/bBox.height;
				if ( 0 && szId.match(/symbol/) ){
					symbolObj.fu.setPosition((-bBox.width/2),(-bBox.height/2));
				}else{
					symbolObj.fu.setPosition((-bBox.x-bBox.width/2)*nScale,(-bBox.y-bBox.height/2)*nScale);
				}
				symbolObj.fu.scale(nScale,nScale);

				// re-create object 
				// have to do this for firefox 
				if ( szViewer.match(/Firefox/i) ){
					symbolObj.setAttributeNS(null,"id","");
					var normalObj = map.Dom.newGroup(symbolObj.parentNode);
					normalObj = symbolObj.parentNode.insertBefore(normalObj,symbolObj);
					normalObj.appendChild(symbolObj);
					normalObj.setAttributeNS(null,"id",szId);
				}
			}
		}
	}
	map.Dom.clearGroup(SVGTempGroup);
};
/**
 * change the rotation of the map canvas 
 * @param nDelta the rotation change amount
 */
Map.Scale.prototype.changeRotation = function(evt,nDelta){
	var nRot = getRotateAttributeValue(map.Scale.canvasNode);
	nRot = (360+Number(nRot)+Number(nDelta))%360;
	setRotate(map.Scale.canvasNode,nRot);
	map.Layer.setObjectRotate(evt,-nRot);
	map.Layer.setPatternRotate(evt,-nRot);
	map.Layer.setLabelRotate(evt,-nRot);
};
/**
 * set the rotation of the map canvas 
 * @param nAngle the rotation angle to set
 */
Map.Scale.prototype.setRotation = function(evt,nAngle){
	nAngle = Math.floor(nAngle);
	setRotate(map.Scale.canvasNode,nAngle);

	// GR 21.11.2007 rotate overview map
	setRotate(SVGDocument.getElementById("overviewmap:layer"),nAngle);
	map.Zoom.actualizeOverviewMap(evt);

	map.Layer.setSymbolRotate(evt,-nAngle);
	map.Layer.setObjectRotate(evt,-nAngle);
	map.Layer.setPatternRotate(evt,-nAngle);
	map.Layer.setLabelRotate(evt,-nAngle);
	if (map.Themes){
		map.Themes.resortCharts();
	}
	map.Dom.clearGroup(SVGToolsGroup);
	map.Dom.clearGroup(SVGFixedGroup);
	map.removeAllHighlights();
 };
/**
 * get rotated point
 * @type point
 * @param pPoint the point coordinates
 * @param nDir the direction of the rotate; -1 = unrotate
 */
Map.Scale.prototype.rotatePoint = function(pPoint,nDir){
	var nRot = getRotateAttributeValue(map.Scale.canvasNode)/180*Math.PI;
	if ( nRot ){
		if ( nDir == -1 ){
			nRot = -nRot;
		}
		var x = pPoint.x;
		var y = pPoint.y;
		pPoint.x =  x*Math.cos(nRot)+y*Math.sin(nRot);
		pPoint.y = -x*Math.sin(nRot)+y*Math.cos(nRot);
	}
	return pPoint;
};
/**
 * create widget styles
 */
Map.Scale.prototype.createWidgetStyles = function(){

	if ( typeof(szContainerTitle) != 'string' ){
		szContainerTitle =	"font-family:arial;font-size:12px;fill:#444444;pointer-events:none;";
	}
	if ( typeof(szInfoContainerTitle) != 'string' ){
		szInfoContainerTitle =	szContainerTitle;
	}
	if ( typeof(szDescription) != 'string' ){
		szDescription =		"font-family:arial;font-size:10px;fill:#888888;font-weight:bold;font-style:italic;pointer-events:none;";
	}
	if ( typeof(szSnippet) != 'string' ){
		szSnippet =		"font-family:arial;font-size:11px;fill:#555555;;pointer-events:none;";
	}
	if ( typeof(szSummary) != 'string' ){
		szSummary =			"font-family:arial;font-size:10px;fill:#444444;pointer-events:none;";
	}
	if ( typeof(szNote) != 'string' ){
		szNote =			"font-family:arial;font-size:11px;fill:darkgrey;font-style:italic;stroke:none;pointer-events:none;";
	}
	if ( typeof(szValues) != 'string' ){
		szValues =			"font-family:arial;font-size:10px;fill:#798697;font-style:normal;stroke:none;pointer-events:none;";
	}
	
	this.tStyle = new Object();

	this.tStyle.ContainerTitle = this.createTextObject(szContainerTitle);
	this.tStyle.InfoContainerTitle = this.createTextObject(szInfoContainerTitle);
	this.tStyle.Description =	 this.createTextObject(szDescription);
	this.tStyle.Snippet =		 this.createTextObject(szSnippet);
	this.tStyle.Summary =		 this.createTextObject(szSummary);
	this.tStyle.Note =			 this.createTextObject(szNote);
	this.tStyle.Values =		 this.createTextObject(szValues);
};
/**
 * create one text style object
 */
Map.Scale.prototype.createTextObject = function(szTextStyle){

	nFontHeight = this.normalY(10);

	var tObject = new Object();

	tObject.szStyle  = __scaleStyleString(szTextStyle,this.normalY(1));
	tObject.nFontHeight = __getFontHeightfromStyleString(tObject.szStyle);

	return tObject;
};
/**
 * get scale parameter
 * @type array 
 * @return javascript object with scale parameter
 */
Map.Scale.prototype.getScaleParam = function(){

	var scaleParam = new Object();

	if ( this.nFeatureScaling && (this.nFeatureScaling != 1) ){
		scaleParam.featureScaling = this.nFeatureScaling;
	}
	if ( this.nBorderScaling && (this.nBorderScaling != 1) ){
		scaleParam.borderScaling = this.nBorderScaling;
	}
	if ( this.nLineScaling && (this.nLineScaling != 1) ){
		scaleParam.lineScaling = this.nLineScaling;
	}
	if ( this.nObjectScaling && (this.nObjectScaling != 1) ){
		scaleParam.objectScaling = this.nObjectScaling;
	}
	if ( this.nLabelScaling && (this.nLabelScaling != 1) ){
		scaleParam.labelScaling = this.nLabelScaling;
	}
	if ( this.nNormalSizeScale && (this.nNormalSizeScale != 1 ) ){
		scaleParam.normalSizeScale = this.nNormalSizeScale;
	}
	if ( this.nDynamicScalePow && (this.nDynamicScalePow != 3 ) ){
		scaleParam.dynamicScalePow = this.nDynamicScalePow;
	}
	return scaleParam;
};
/**
 * get scale parameter
 * @param nodeObj the node to look at
 * @return void
 */
Map.Scale.prototype.setScaleParam = function(obj){

	// because featurescaliing acts on the actual zoom scale,
	// we must save/restore this local variable of .changeFeatureScaling()
	// TBD  split .changeFeatureScaling() into .unzoomFeatureScaling and .changeFeatureScaling()
	var saveScale = __featureScaling_lastScale;

	if ( obj.featureScaling && (obj.featureScaling != 1) ){
		this.nFeatureScaling = obj.featureScaling;
	}
	if ( obj.borderScaling && (obj.borderScaling != 1) ){
		//this.nBorderScaling = obj.borderScaling;
	}
	if ( obj.lineScaling && (obj.lineScaling != 1) ){
		map.Layer.changeLineScaling(null,obj.lineScaling/this.nLineScaling);
		__featureScaling_lastScale = saveScale;
	}
	if ( obj.labelScaling && (obj.labelScaling != 1) ){
		map.Layer.changeLabelScaling(null,obj.labelScaling/this.nLabelScaling);
		__featureScaling_lastScale = saveScale;
	}
	if ( obj.objectScaling && (obj.objectScaling != 1) ){
		this.nObjectScaling = obj.objectScaling;
	}
	if ( obj.normalSizeScale && (obj.normalSizeScale != 1) ){
		this.nNormalSizeScale = Number(obj.normalSizeScale);
	}
	if ( obj.dynamicScalePow && (obj.dynamicScalePow != 3) ){
		this.nDynamicScalePow = Number(obj.dynamicScalePow);
	}
};
// .................................................................... 
// helper for positioning and scaling of SVG elements       
// .................................................................... 

matrixRegExp=/matrix\(([^,]*)\)/;
matrixRegExp1=/matrix\(([^,]*)\)/;
matrixRegExp2=/matrix\(([0-9., -e]*)\)/;
translateRegExp1=/translate\(([^,]*)\)/;
translateRegExp2=/translate\(([0-9., -e]*)\)/;
rotateRegExp=/rotate\(([0-9]*)\)/;

urlRegExp=/url\(#([a-zA-Z0-9\-\.\_\:]*)\)/;

/**
 * get the transform matrix of the given node as Array(6)
 * @type array 
 * @param nodeObj the node to look at
 * @return the matrix as array[6] of numbers
 */
function getMatrix(nodeObj){
	if (nodeObj){
		var szM =nodeObj.getAttributeNS(null,"transform");
		var szMM = null;
		if (szM && (szMM = szM.match(matrixRegExp1)) ){
			var szMA = szMM[1].split(' ');
			// !!! parseFloat is magic !! don't know why
			return new Array(Number(szMA[0]),Number(szMA[1]),Number(szMA[2]),Number(szMA[3]),Number(szMA[4]),parseFloat(szMA[5]));
		}
		if (szM && (szMM = szM.match(matrixRegExp2)) ){
			var szMA = szMM[1].split(',');
			return new Array(Number(szMA[0]),Number(szMA[1]),Number(szMA[2]),Number(szMA[3]),Number(szMA[4]),Number(szMA[5]));
		}
	}
	return new Array(1,0,0,1,0,0);
}
/**
 * set the transform matrix of the given node
 * @param nodeObj the node 
 * @param m the matrix to be set as array[6] of numbers
 * @param m the matrix to be set as array[6] of numbers
 */
function setMatrix(nodeObj,m,fKeepTranslate){
	if (nodeObj && m.length == 6){
		var szTransform = nodeObj.getAttributeNS(null,"transform");
		var szNewTransform = "matrix("+m[0]+" "+m[1]+" "+m[2]+" "+m[3]+" "+m[4]+" "+m[5]+")";
		// may be we have other transform parts, keep only rotate(...) !
		var szTransformA = szTransform?szTransform.split(")"):new Array(0);
		for ( var i=0; i<szTransformA.length; i++ ){
			if ( szTransformA[i].length > 3 && 
				(szTransformA[i].match(/rotate/) || szTransformA[i].match(/scale/) || (fKeepTranslate && szTransformA[i].match(/translate/))) ){
				szNewTransform = szNewTransform + " " + szTransformA[i] + ")";
			}
		}
		nodeObj.setAttributeNS(null,"transform",szNewTransform);
	}
}
/**
 * return the translation of the given node as point(x,y) object
 * @param nodeObj the node 
 * @return the translation as point object
 */
function getTranslate(nodeObj){
	if (nodeObj){
		var m = getMatrix(nodeObj);
		return new point(Number(m[4]),Number(m[5]));
	}
	return new point(0,0);
}
/**
 * set the translation of the given node
 * @param nodeObj the node 
 * @param x the x position ( in relative svg coordinates )
 * @param y the y position ( in relative svg coordinates )
 */
function setTranslate(nodeObj,x,y){
	var m = getMatrix(nodeObj);
	m[4] = x;
	m[5] = y;
	setMatrix(nodeObj,new Array(m[0],m[1],m[2],m[3],m[4],m[5]));
}
/**
 * return the translation attribute! (not matrix) of the given node as point(x,y) object
 * @param nodeObj the node 
 * @return the translation as point object
 */
function getTranslateAttributeValue(nodeObj){
	if (nodeObj){
		var szM =nodeObj.getAttributeNS(null,"transform");
		var szMM = null;
		if (szM && (szMM = szM.match(translateRegExp1)) ){
			var szMA = szMM[1].split(' ');
			return new point(Number(szMA[0]),parseFloat(szMA[1]));
		}
		if (szM && (szMM = szM.match(translateRegExp2)) ){
			var szMA = szMM[1].split(',');
			return new point(Number(szMA[0]),Number(szMA[1]));
		}
	}
	return new point(0,0);
}
/**
 * return the x/y scaling factors of the given node as point(x,y) object
 * @param nodeObj the node 
 * @return the x/y scaling factors as point object
 */
function getScale(nodeObj){
	if (nodeObj){
		var m = getMatrix(nodeObj);
		return new point(Number(m[0]),Number(m[3]));
		}
	return new point(1,1);
}
/**
 * set the x/y scaling factors of the given node 
 * @param nodeObj the node 
 * @param x the x scaling factor 
 * @param y the y scaling factor  
 */
function setScale(nodeObj,x,y){
	if (nodeObj){
		var m = getMatrix(nodeObj);
		m[0] = x;
		m[3] = y;
		setMatrix(nodeObj,new Array(m[0],m[1],m[2],m[3],m[4],m[5]),true);
	}
}
/**
 * return the rotate attribute! (not matrix) of the given node as number
 * @param nodeObj the node 
 * @param szAttributeName optional parameter if != 'transform'  
 * @return the rotation as number
 */
function getRotateAttributeValue(nodeObj,szAttributeName){
	if ( !szAttributeName ){
		szAttributeName = "transform";
	}
	if (nodeObj){
		var szR =nodeObj.getAttributeNS(null,szAttributeName);
		var szRot = null;
		if (szR && (szRot = szR.match(rotateRegExp)) ){
			return Number(szRot[1]);
		}
	}
	return 0;
}
/**
 * set the rotation of the given node
 * @param nodeObj the node 
 * @param szAttributeName optional parameter if != 'transform'  
 * @param r the rotation to set
 */
function setRotate(nodeObj,r,szAttributeName){
	if ( !szAttributeName ){
		szAttributeName = "transform";
	}
	if (nodeObj){
		var fRotateFound = false;
		var szNewTransform = "";
		var szTransform = nodeObj.getAttributeNS(null,szAttributeName);
		var szTransformA = szTransform?szTransform.split(")"):new Array(0);
		for ( var i=0; i<szTransformA.length; i++ ){
			if ( szTransformA[i].match(/rotate/) ){
				szNewTransform = szNewTransform + " rotate("+r+")";
				fRotateFound = true;
			}
			else if ( szTransformA[i].length > 3 ){
				szNewTransform = szNewTransform + " " + szTransformA[i] + ")";
			}
		}
		if ( !fRotateFound ){
			szNewTransform = szNewTransform + " rotate("+r+")";
		}
		nodeObj.setAttributeNS(null,szAttributeName,szNewTransform);
	}
}
/**
 * get the transform matrix of the given pattern node as Array(6)
 * @type array
 * @param nodeObj the node to look at
 * @return the pattern matrix as array[6] of numbers
 */
function getPatternMatrix(nodeObj){
	if (nodeObj){
		var szM = nodeObj.getAttribute("patternTransform");
		if (szM && (szM = szM.match(matrixRegExp1)) ){
			var szMA = szM[1].split(' ');
			return new Array(Number(szMA[0]),Number(szMA[1]),Number(szMA[2]),Number(szMA[3]),Number(szMA[4]),Number(szMA[5]));
		}
		if (szM && (szM = szM.match(matrixRegExp2)) ){
			var szMA = szM[1].split(',');
			return new Array(Number(szMA[0]),Number(szMA[1]),Number(szMA[2]),Number(szMA[3]),Number(szMA[4]),Number(szMA[5]));
		}
	}
	return new Array(1,0,0,1,0,0);
}
/**
 * Create a new point instance.  
 * @class It realizes an object to define one coordinate point
 * @constructor
 * @return A new point object
 * @param x x position of the point 
 * @param y y position of the point 
 */
function point(x,y) {
	this.x = x;
	this.y = y;
}
/**
 * Create a new box instance.  
 * @class It realizes an object to define an coordinate area
 * @constructor
 * @return A new box object
 * @param x x position of the left upper corner 
 * @param y y position of the left upper corner
 * @param width  the width of the box
 * @param height the height of the box
 */
function box(x,y,width,height) {
	this.x = Number(x);
	this.y = Number(y);
	this.width = Number(width);
	this.height = Number(height);
}
/**
 * scale the box object by a given factor
 * @param nFactor scales width and height of the box 
 */
box.prototype.scale = function(nFactor) {
	var newWidth  = this.width*nFactor; 
	var newHeight = this.height*nFactor; 
	this.x -= (newWidth -this.width) /2;
	this.y -= (newHeight-this.height)/2;
	this.width  = newWidth;
	this.height = newHeight;
};
/**
 * returns an own duplicate of a given box
 * needed because IE9 don't gives a freely calcoltable box at getBBox()
 * @type array
 * @param abox the given box to duplicate
 * @return a new box object
 */
function __boxDup(aBox){
	return new box(aBox.x,aBox.y,aBox.width,aBox.height);
}
/**
 * safe method to ge a box 
 * returns an own duplicate of a given box or a zero box
 * needed for firefox (error if box is null) and IE9 (don't gives a freely calcoltable box at getBBox())
 * @type array
 * @param element the DOM element of which to give the box
 * @return a new box object
 */
Map.Dom.prototype.getBox = function(element){
	try	{
		return __boxDup(element.getBBox());
	}
	catch (e){
		return new box(0,0,0,0);
	}
};

// .................................................................... 
// function wrapper for map objects, SVG <g> nodes with id
// .................................................................... 

/**
 * Create a new mapObject instance.  
 * @class returns a mapobject for the given DOM node. A map object:
 * <ul>
 * <li>must have an id<br>(if the given node has no id, the first node upwards with an id is taken)</li>
 * <li>provides extended methods accessible with: object.fu.method()</li>
 * </ul>
 * @constructor
 * @param nodeObj the node to become an object
 * @throws -
 * @return A new mapObject
 */
function MapObject(nodeObj){
	if ( nodeObj.nodeType != 1 ){
		return null;
	}
	// must have an id !
	/** the id of the mapObject @type string */
	this.szId = "";
	while(this.szId == "" && nodeObj.parentNode && nodeObj.nodeType == 1 ) {
		this.szId = nodeObj.getAttributeNS(null,'id');
		if ( (typeof this.szId != "string" ) || (this.szId == "") || (this.szId.match(/noobject/)) ){
			nodeObj = nodeObj.parentNode;
			this.szId = "";
		}
	}
	/** the node itself @type DOM node */
	this.objNode = nodeObj;
	/** link to the exetended methods (class {@link Methods}) @type Methods */
	this.fu = new Methods(nodeObj);
}
/**
 * get the context menu id of this SVG node ( ore parents )
 * @type string
 * @return the id as string or null
 */
MapObject.prototype.getContextMenuId = function(){
	var nodeObj = null;
	for ( nodeObj = this.objNode; nodeObj; nodeObj = nodeObj.parentNode ){
		if ( nodeObj.nodeType == 1 ){
			var szMenuId = nodeObj.getAttributeNS(szMapNs,"menu");
			if ( szMenuId && szMenuId.length ){
				return szMenuId;
			}
		}
	}
	return null;
};
/**
 * set the context menu id of this SVG node 
 * @param szId the name of the assoziated menu 
 */
MapObject.prototype.setContextMenuId = function(szId){
	this.objNode.setAttributeNS(szMapNs,"menu",szId);
};

// .................................................................... 
// methods to query and manipulate SVG objects (nodes) 
// .................................................................... 

/**
 * Create a new Methods instance.  
 * @class It provides extended methods to an SVG DOM node; usage: anySVGNode.fu = new Methods(anySVGNode); 
 * @constructor
 * @param nodeObj the node to apply the methods
 * @throws -
 * @return A new Method
 */
function Methods(nodeObj){
	/* the target DOM node for the methods @type DOM node */
	this.nodeObj = nodeObj;
	}
/**
 * returns the position of this SVG node as point(x,y) object
 * @type point
 * @return the x/y position as point object
 */
Methods.prototype.getPosition = function(){
	var m = getMatrix(this.nodeObj);
	return new point(Number(m[4]),Number(m[5]));
};
/**
 * position this SVG node to x/y
 * @param x the x position ( in relative svg coordinates )
 * @param y the y position ( in relative svg coordinates )
 */
Methods.prototype.setPosition = function(x,y){
	var m = getMatrix(this.nodeObj);
	m[4] = x;
	m[5] = y;
	setMatrix(this.nodeObj,new Array(m[0],m[1],m[2],m[3],m[4],m[5]));
};
/**
 * scale this SVG node to x/y (absolute scaling)
 * @param x the new x scale factor
 * @param y the new y scale factor
 */
Methods.prototype.scale = function(x,y){
	var m = getMatrix(this.nodeObj);
	m[0] = x;
	m[3] = y;
	setMatrix(this.nodeObj,new Array(m[0],m[1],m[2],m[3],m[4],m[5]));
};
/**
 * scale this SVG node by x/y (relative scaling)
 * @param x the x scaling factor
 * @param y the y scaling factor
 */
Methods.prototype.scaleBy = function(x,y){
	var bBox = this.getBox();
	var dX = (bBox.width/2+bBox.x);
	var dY = (bBox.height/2+bBox.y);
	var m = getMatrix(this.nodeObj);
	m[0] *= x;
	m[3] *= y;
	if ( x>1){
		m[4] -= dX*x-dX;
		m[5] -= dY*y-dY;
	}
	else{
		m[4] -= dX-dX/x;
		m[5] -= dY-dY/y;
	}
	setMatrix(this.nodeObj,new Array(m[0],m[1],m[2],m[3],m[4],m[5]));
};
/**
 * gets the scale of this SVG node
 * @type point
 * @return the x/y scale as point object
 */
Methods.prototype.getScale = function(){
	var m = getMatrix(this.nodeObj);
	return new point(Number(m[0]),Number(m[3]));
};
/**
 * gets the scale of the parent of this SVG node
 * @type point
 * @return the x/y scale as point object
 */
Methods.prototype.getParentScale = function(){
	var m = getMatrix(this.nodeObj.parentNode);
	return new point(Number(m[0]),Number(m[3]));
};
/**
 * gets the scale of this SVG node relative to the SVG canvas
 * @type point
 * @return the x/y scale as point object
 */
Methods.prototype.getGroupScale = function(){
	return map.Scale.getGroupScale(this.nodeObj);
};
/**
 * scale this SVG node to the new width and height
 * @param nWidth the new width 
 * @param nHeight the new height
 */
Methods.prototype.scaleTo = function(nWidth,nHeight){
	var bBox = this.getBox();
	if ( nWidth && nHeight ){
		this.scaleBy(nWidth/bBox.width,nHeight/bBox.height);
	}
	else if ( nWidth ){
		this.scaleBy(nWidth/bBox.width,nWidth/bBox.width);
	}
	else if ( nHeight ){
		this.scaleBy(nHeight/bBox.height,nHeight/bBox.height);
	}
};
/**
 * gets the (scaled) box of this SVG node
 * (this is the box of the node as seen from outside!)
 * @type box
 * @return the position and extension of the node as box object
 */
Methods.prototype.getBox = function(){
	var bBox = map.Dom.getBox(this.nodeObj);
	var ptScale = this.getScale();
	var sBox = new box(bBox.x,bBox.y,bBox.width,bBox.height);
	sBox.x *= ptScale.x; 
	sBox.y *= ptScale.y; 
	sBox.width *= ptScale.x; 
	sBox.height *= ptScale.y; 
	return sBox;
};
/**
 * gets the (computed) text length of this SVG node
 * @type double
 * @return the textlengh
 */
Methods.prototype.getTextLength = function(){
	if (this.nodeObj.nodeName == "text" ){
		return this.nodeObj.getComputedTextLength();
	}
	return 0;
};
/**
 * position this SVG node to x/y and scale it to nScale
 * ( used to focus on the given node )
 * @param x the x position ( in relative svg coordinates )
 * @param y the y position ( in relative svg coordinates )
 * @param nScale the new scaling factor
 */
Methods.prototype.focus = function(x,y,nScale){
	setMatrix(this.nodeObj,new Array(nScale,0,0,nScale,Number(x*nScale),Number(y*nScale)));
};
/**
 * clear this SVG node; remove all child elements (only applicabile to SVG groups)
 */
Methods.prototype.clear = function(){
	map.Dom.clearGroup(this.nodeObj);
};
/**
 * check, if the given node is contained in (= is child of) the method target node
 * @type boolean
 * @param objNode the dom node to examine
 * @return true if the node is contained
 */
Methods.prototype.isContained = function(objNode){
	while ( (objNode = objNode.parentNode) ){
		if (objNode == this.nodeObj ){
			return true;
		}
	}
	return false;
};
/**
 * add a given extension to all id's of the node and its child nodes
 * @param szExtend the string to add to all ids found 
 */
Methods.prototype.extendAllIds = function(szExtend){
	map.Dom.extendAllIds(objNode,szExtend);
};


// .............................................................................
// layer handling              
// .............................................................................

/**
 * Create a new Map.Layer instance.  
 * @class It realizes an object for layer handling
 * @constructor
 * @throws 
 * @return A new Map.Layer Object
 */
Map.Layer = function(evt){

	_TRACE("--- init layer");

	/** the SVG document containing the layer */
	this.document = evt?evt.target.ownerDocument:SVGDocument;
	/** the metadata node describing the layer features @type DOM node */
	this.layerNode = SVGDocument.getElementById("maplayer");
	/** array to hold the {@link Map.Layer.Item} objects, that each describe one single layer @type array */
	this.listA = new Array(0);
	/** array (named!) to hold the {@link Map.Layer.Dependency} objects, that describe the layer dependencies (minscale,maxscale,...) @type named array */
	this.depListA = new Array(0);
	/** array (named!) to hold the groups generated for dynamic theme label */
	this.generatedLabelA = new Array(0);
	/** array to hold layer nodes (=features) that has temporary been changed by adding a style attribute; usefull later, to remove the style @type DOM node*/
	this.changedFeatureNodesA = new Array(0);
	/** the node to create new objects (charts,...) */
	this.objectGroup = SVGDocument.getElementById(szObjectGroupId);
	/** flag to define group switching abilities */
	this.fSwitchSublayer = true;
	/** actual feature scaling, to be used to adapt loaded tiles */
	this.nFeatureScale = 1;
	/** actual object scaling, to be used to adapt new map objects in themes */
	this.nObjectScale = 1;

	var i = 0;
	var layerNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
	_TRACE("--- - init layer list" );
	if ( layerNodesA.length ){
		this.listA["legend_body"] = new Map.Layer.Item(null);
		for ( i=0; i<layerNodesA.length; i++){
			this.listA[layerNodesA.item(i).getAttributeNS(null,"name")] = new Map.Layer.Item(layerNodesA.item(i));
		}
	}
	var scaleDepNodes = SVGDocument.getElementsByTagNameNS(szMapNs,"scaledependency");
	if (scaleDepNodes.length <= 0){
		return;
	}
	_TRACE("--- - init scale dependent layer");
	for ( i=0;i<scaleDepNodes.length ;i++ ){
		var depId    = scaleDepNodes.item(i).getAttributeNS(null,"feature");
		this.depListA[depId] = new Map.Layer.Dependency(scaleDepNodes.item(i));
	}
};
Map.Layer.prototype = new Map();

/**
 * Create a new Map.Layer.Item instance.  
 * @class It realizes an object for layer handling
 * @constructor
 * @throws 
 * @return A new Map.Layer.Item Object
 */
Map.Layer.Item = function(layerNode){
	if (layerNode){
		/** the name of the layer @type string */
		this.szName = layerNode.getAttributeNS(null,"name");
		/** the legend name of the layer @type string */
		this.szLegendName = layerNode.getAttributeNS(null,"legendname");
		/** a flag for layer specific features. 
		 *  <br><br>
		 *  the following values can be combined with '|' 
		 *  <br><br>
		 *  <table>
		 *  <tr><td><em>value</em></td><td><em>feature</em></td></tr>
		 *  <tr><td>'info'</td><td>layer contains info metadata fields</td></tr>
		 *  <tr><td>'invisiblepan'</td><td>layer must be switched off during panning</td></tr>
		 *  </table>
		 * @type string
		*/
		this.szFlag = layerNode.getAttributeNS(null,"flag");
		/** specifies the layer shape type. 
		 *  <br><br>
		 *  the layer can be of type 
		 *  <br><br>
		 *  <table>
		 *  <tr><td>'point'</td><td>realized by &lt;use&gt; elemets</td></tr>
		 *  <tr><td>'line'</td><td>realized by &lt;path&gt; elements</td></tr>
		 *  <tr><td>'polygon'</td><td>realized by closed &lt;path&gt; elements</td></tr>
		 *  </table>
		*/
		this.szType = layerNode.getAttributeNS(null,"type");
		/** the number of (grouped) shape items */
		this.nItems = Number(layerNode.getAttributeNS(null,"items"));
		/** specifies the renderer type of the layer. 
		 *  <br><br>
		 *  <table>
		 *  <tr><td>'0'</td><td>normal shape</td></tr>
		 *  <tr><td>'1'</td><td>rendered exactly by the value of a specific field</td></tr>
		 *  <tr><td>'2'</td><td>rendered by ranges of the the value of a specific field</td></tr>
		 *  <tr><td>'4'</td><td>layer has label</td></tr>
		 *  <tr><td>'8'</td><td>layer has extended label</td></tr>
		 *  </table>
		 * @type int
		*/
		this.nRenderer = layerNode.getAttributeNS(null,"renderer");
		/** the name of the field used for rendering (see szType) @type string */
		this.szRenderer = layerNode.getAttributeNS(null,"rendererfield");
		/** the name of the field used for label lookup (see szType) @type string */
		this.szLabel = layerNode.getAttributeNS(null,"label");
		/** the name of the field used for grouping the shapes of a layer (to allow selection) @type string */
		this.szSelection = layerNode.getAttributeNS(null,"selection");
		/** the name of the field used to filter shapes */
		this.szFilter = layerNode.getAttributeNS(null,"filter");
		/** the allowed value(s) of the filter field */
		this.szFilterValue = layerNode.getAttributeNS(null,"filtervalue");
		/** if defined, this SVG style should be used for highlighting @type string */
		this.szHighlight = layerNode.getAttributeNS(null,"highlightstyle");
		/** the initial visibility of the layer @type string */
		this.szDisplay = layerNode.getAttributeNS(null,"display");
		/** the initial visibility of the labels @type string */
		this.szDisplayLabel = layerNode.getAttributeNS(null,"displaylabel");
		/** a place to store the space layer label do occupy */
		this.labelBoxA = null;

		/** category list GR 24.06.2014 */
		this.categoryA = null;
		var categoryNodesA = layerNode.getElementsByTagNameNS(szMapNs,"category");
		if ( categoryNodesA.length ){
			this.categoryA = [];
			for ( var i=0; i<categoryNodesA.length; i++){
				var obj = this.categoryA[categoryNodesA.item(i).getAttributeNS(null,"name")] = new Object();
				obj.legendname = categoryNodesA.item(i).getAttributeNS(null,"legendname");			
				obj.fill = categoryNodesA.item(i).getAttributeNS(null,"fill");			
				obj.stroke = categoryNodesA.item(i).getAttributeNS(null,"stroke");			
			}
		}
	}
	else{
		this.szFlag = "";
		this.szType = "dummy";
		this.szDisplay = "inline";
		this.szDisplayLabel = "inline";
	}
};
/**
 * Create a new Map.Layer.Dependency instance.  
 * @class It realizes an object for layer scale depemdecies
 * @constructor
 * @throws 
 * @return A new Map.Layer.Dependency Object
 */
Map.Layer.Dependency = function(scaleDepNode){
	if (scaleDepNode){
		/** the id of the layer @type string */
		this.shapeId  = scaleDepNode.getAttributeNS(null,"shape");
		/** the name of the layer (== id) @type string */
		this.szFeature = scaleDepNode.getAttributeNS(null,"feature");
		/** the name of te CSS style, that defines the layer style @type string */
		this.depClass = scaleDepNode.getAttributeNS(null,"classname");
		/** the upper scale limit as number @type int */
		this.nUpper = 100000000000;
		/** the lower scale limit as number @type int */
		this.nLower = 0;
		/** the lower scale limit (1:nnn...) for the visibility of this layer @type string */
		this.depLower = scaleDepNode.getAttributeNS(null,"lower");
		/** the upper scale limit (1:nnnnnn...) for the visibility of this layer @type string */
		this.depUpper = scaleDepNode.getAttributeNS(null,"upper");
		if (this.depUpper && this.depUpper.length){
			this.nUpper = Number(this.depUpper.split(':')[1]);
		}
		if (this.depLower && this.depLower.length){
			this.nLower = Number(this.depLower.split(':')[1]);
		}
// GR 25.12.2006 actual display attribute must be set to 'inline', corresponds to the CSS preset
//
//		/** the visibility attribute of the layer resulting from the actual scale @type string */
//		this.szDisplayAttribute = String('none');
//		if((map.Scale.nMapScale*map.Scale.nZoomScale >= this.nLower) && (map.Scale.nMapScale*map.Scale.nZoomScale <= this.nUpper)){ 
//			this.szDisplayAttribute = String('inline');
//		}
		this.szDisplayAttribute = String('inline');
	}
};
function __doSwitchGroupTheme(szTheme,szState){
		_TRACE("doSwitchGroupTheme: "+szTheme);
	var itemNode = SVGDocument.getElementById("legend:"+szState+":"+szTheme);
	if (itemNode && map.Legend){
		_TRACE("doSwitchGroupTheme: "+szTheme);
		map.Legend.execLegendMouseClick(null,itemNode,szTheme,szState);
		map.Legend.execLegendMouseClick(null,itemNode,szTheme+":label",szState);
	}
}
function __doSwitchGroupThemes(szLayer,nState){
	var szLegendGroup = 'legend:collapsable:'+szLayer.split(":")[0];
	var legendGroup = SVGDocument.getElementById(szLegendGroup);
	if (legendGroup){
		var layerA = legendGroup.childNodes;
		for ( i=0; i<layerA.length; i++){
			if (layerA.item(i).nodeType == 1){
				var szTheme = layerA.item(i).getAttributeNS(null,"id").split("legend:setactive:")[1];
				if ( !szTheme ){
					szTheme = layerA.item(i).getAttributeNS(null,"id").split("legend:item:")[1];
				}
				var szState = nState?"on":"off";
				// GR 12.02.2008 !! check names (szTheme != szLayer) to avoid infinite recursion
				if ( szTheme && (szTheme != szLayer) ){
					// GR 14.12.2008 names with " cannot be done; see setTimeout(" ...
					if ( szTheme.match(/"/)){
						continue;
					}
					// GR 14.12.2008 if we have no check groups, skip
					if (!SVGDocument.getElementById("legend:"+szState+":"+szTheme)){
						continue;
					}
					if ( (nState == false) || map.Layer.isScaleDependentLayerOn(szTheme) ){
						_TRACE("__doSwitchGroupTheme(\""+szTheme+"\",\""+szState+"\")");
						setTimeout("__doSwitchGroupTheme(\""+szTheme+"\",\""+szState+"\")",i*10);
					}
				}
			}
		}
	}
}
/**
 * switch layer on/off;
 * dispatches to the different switching routines dependent on the presence of CSS or tiles
 * @param evt the event
 * @param szLayer the name of the layer
 * @param szClassName the name of the style to make inline/none
 * @param nState true or false
 * @type boolean
 * @return true, if the layer switching could been executed
 */
Map.Layer.prototype.switchLayer = function(evt,szLayer,szClassName,nState){
	var szDisplay = nState?'inline':'none';
	var layerItem = this.listA[szLayer.split(':')[0]];

	// a legend group is not a layer; so we have done here 
	if (szClassName && szClassName.match(/legendgroup/)){
		return true;
	}
	// a group is switched by its members
	// GR 24.11.2007; do also for sublayer, if this.fSwitchSublayer is true
//	if (szLayer && szLayer.match(/group/) && !szLayer.match(/label/)){
	if (szLayer && !szLayer.match(/label/) && !szLayer.match(/::/) && (szLayer.match(/group/) || this.fSwitchSublayer) ){
		_TRACE("*** switchgroup: \""+szLayer+"\" Item="+layerItem+" Class="+szClassName+" State="+nState);
		var szLegendGroup = 'legend:collapsable:'+szLayer.split(":")[0];
		var legendGroup = SVGDocument.getElementById(szLegendGroup);
		if (legendGroup){
			_TRACE("__doSwitchGroupThemes(\""+szLayer+"\","+nState+")");
			setTimeout("__doSwitchGroupThemes(\""+szLayer+"\","+nState+")",250);
		}
	}
	// GR 24.11.2007; if we switch sublayer, switch also the lead layer, and its checkbox
	if (szLayer && !szLayer.match(/label/) && szLayer.match(/::/) && (nState == true) ){
		var nTemp = this.fSwitchSublayer;
		this.fSwitchSublayer = false;
		this.switchLayer(evt,szLayer.split("::")[0],szClassName,true);
		this.fSwitchSublayer = nTemp;
		// do it here 
		var targetNode = SVGDocument.getElementById("legend:off:"+szLayer.split("::")[0]);
		if ( targetNode && (targetNode.style.getPropertyValue("display") != "inline") ){
			targetNode = SVGDocument.getElementById("legend:suboff:"+szLayer.split("::")[0]);
			if (targetNode){
				targetNode.style.setProperty("display","inline","");
			}
		}
	}

	// may be there is a background 
	if ( szLayer.match(/label/) && !szLayer.match(/:bg/) ){
		this.switchLayer(evt,szLayer+":bg",szClassName,nState);
	}

	_TRACE("switchLayer "+szLayer+' Item='+layerItem+' Class='+szClassName);
	if (layerItem ){
		if( this.switchLayerByFeature(szLayer,nState) ){
			if ( szLayer.match(/:label/) ){
				layerItem.szDisplayLabel = szDisplay;
			}
			else{
				layerItem.nState = nState;
				layerItem.szDisplay = szDisplay;
			}
			_TRACE("done by feature group");
			if (layerItem.szLabel){
				this.adaptLabel(evt);
			}
			return true;
		}
		else{
			if ( this.switchLayerOnTiles(szLayer,nState) ){
				if ( szLayer.match(/:label/) ){
					layerItem.szDisplayLabel = szDisplay;
				}
				else{
					layerItem.nState = nState;
					layerItem.szDisplay = szDisplay;
				}
				_TRACE("done by feature tiles groups");
				if (layerItem.szLabel){
					this.adaptLabel(evt);
				}
				return true;
			}
		}
	}
	if ( szClassName && !szLayer.match(/:label/) ){ 
		this.switchLayerByCSS(null,szLayer,szClassName,nState?'inline':'none');
		if (layerItem ){
			layerItem.szDisplay = szDisplay;
		}
		_TRACE("done by CSS style");
		return true;
	}

	_TRACE("not done");
	return false;
};
/**
 * switch layer on/off on tiles.
 * <br>gets a list of the layer ids with the tiles extensions
 * <br>then calls 'switchLayerByFeature()' for every tiled layer part
 * @param szLayer the name of the layer
 * @param nState true or false
 * @type boolean
 * @return true, if the switching could been executed
 */
Map.Layer.prototype.switchLayerOnTiles = function(szLayer,nState){
	var nRetval = false;
	if ( map.Tiles && map.Tiles.nCount > 0 ){
		var szTilesIdA  = map.Tiles.getTileNodeIds(szLayer);
		for ( var i=0; i<szTilesIdA.length; i++ ){
			nRetval = this.switchLayerByFeature(szTilesIdA[i],nState)?true:nRetval;
		}
	}
	return nRetval;
};
/**
 * switch layer on/off by changing style property 
 * @param szLayer the id of the layer
 * @param nState true or false
 * @type boolean
 * @return true, if the switching could been executed
 */
Map.Layer.prototype.switchLayerByFeature = function(szLayer,nState){
	var x;
	var nRetval = false;
	var featureNode = this.document.getElementById(szLayer);
	if( featureNode ){
		this.addChangedFeatureNode(featureNode);
		if (featureNode.getAttributeNS(null,"class") == "linetemplate"	 ||
			featureNode.getAttributeNS(szMapNs,"class") == "linetemplate" ){
			if (szLayer.match(/#/)){
				var szIdA = szLayer.split('#');
				for ( x=0; x<10; x++ ){
					featureNode = this.document.getElementById(szIdA[0]+'_'+x+'#'+szIdA[1]);
					if( featureNode ){
						featureNode.style.setProperty('display',nState?'inline':'none',"");
						nRetval = true;
					}
				}
			}
			else{
				for ( x=0; x<10; x++ ){
					featureNode = this.document.getElementById(szLayer+'_'+x);
					if( featureNode ){
						featureNode.style.setProperty('display',nState?'inline':'none',"");
						nRetval = true;
					}
				}
			}
		}
		else{
			featureNode.style.setProperty('display',nState?'inline':'none',"");
			nRetval = true;
		}
	}
	return nRetval;
};
/**
 * switch layer by classname on/off
 * @param evt the event
 * @param szLayer the name of the layer
 * @param szClassName the name of the style to make inline/none
 * @param szProperty the new display property
 */
Map.Layer.prototype.switchLayerByCSS = function(evt,szLayer,szClassName,szProperty){
	_TRACE("switchLayerByCSS:"+szClassName+','+szProperty+' layer:'+szLayer);
	
	if (szClassName == "(null)"){
		return;
	}
	// check if complex layer, if yes, switch all assoziated styles
	if ( szLayer ){
		szLayer = szLayer.split(':')[0];
		var layerItem = this.listA[szLayer+"_1"];
		if (layerItem){
			var szCSS = szClassName.substr(szLayer.length,szClassName.length-szLayer.length);
			var nCSS = parseInt(szCSS);
			var nSubStyle = parseInt(szCSS.substr(szCSS.length-1,1));

			szCSS = szClassName.substr(0,szLayer.length);
			var i=1;
			while ( (layerItem = this.listA[szLayer+"_"+i]) ){
				nCSS++;
				this.switchLayerByCSS(evt,null,szCSS+"-"+i+nCSS+"s"+(nSubStyle),szProperty);
				i++;
			}
			return;
		}
	}

	if ( map.Scale.CSSStyleNodes ){
		var styleNodes = map.Scale.CSSStyleNodes;

		map.CSS = new Map.CSS(map.Scale.CSSStyleNodes);
		map.CSS.setStyle(szClassName,'display',szProperty);
		map.Scale.fCSSStyleNodeChanged = true;
		styleNodes.firstChild.nextSibling.nodeValue = map.CSS.getStyleString();

		displayMessage("please wait ...",500);
		setTimeout("map.Scale.refreshCSSStyles()",200);
	}
};
/**
 * switch scale dependant layer on/off.
 * <br>called everytime when scale is changed
 * <br>also called, when layer is switched by legend button
 * @param evt the event
 * @param targetGroup root node to search for layer (if null, SVGRootElement is used)
 */
Map.Layer.prototype.switchScaleDependentLayer = function(evt,targetGroup){

	if (!fDynamicLayer){
		return;
	}
	var szNewDisplayAttribute = "";
	if ( this.depListA == null ){
		return;
	}
	_TRACE('Map.Layer: switch scale dependent layer -->');

	// calculate new display state and switch legend entry
	// ---------------------------------------------------

	var a = 0;
	for ( a in this.depListA ){
		if((map.Scale.getTrueMapScale()*map.Scale.nZoomScale >= this.depListA[a].nLower) && (map.Scale.getTrueMapScale()*map.Scale.nZoomScale <= this.depListA[a].nUpper)){ 
			szNewDisplayAttribute = String('inline');
		}
		else{
			szNewDisplayAttribute = String('none');
			if ( !this.depListA[a].shapeId.match(/:label/) && (map.Scale.getTrueMapScale()*map.Scale.nZoomScale > this.depListA[a].nUpper) ){
				if ( !map.Themes || (map.Themes.getThemeCount() == 0) ){
					displayMessage("'"+this.depListA[a].shapeId+"' not visible at actual zoom level!",3000,"notify");
				}
			}
		}
		if ( this.depListA[a].szDisplayAttribute != szNewDisplayAttribute ){
			this.depListA[a].szDisplayAttribute = szNewDisplayAttribute;
			if ( this.isChangedFeature(this.depListA[a].shapeId)){
				if ( this.depListA[a].szOldDisplayAttribute != szNewDisplayAttribute ){
//					this.removeChangedFeatures(this.depListA[a].shapeId);
				}
				else{
					_TRACE("++++++ !!!!! ++++++");
					continue;
				}
			this.depListA[a].szOldDisplayAttribute = this.depListA[a].szDisplayAttribute;
			}

			var szFeature = this.depListA[a].szFeature;
			if ( map.Legend ){
				map.Legend.switchLegendCheckBox(evt,szFeature,szNewDisplayAttribute);
			}
		}

		try{
			var shapeId = this.depListA[a].shapeId;
			if (shapeId.match(/label/)){
				var szLayerId = shapeId.split(':')[0];
				this.listA[shapeId.split(':')[0]].szDisplayLabel = szNewDisplayAttribute;
			}
			else{
				this.listA[shapeId].szDisplay = szNewDisplayAttribute;
			}
		}
		catch (e){
			alert("Syntax error: "+shapeId);
		}
	}

	// switch the dependent layer
	// ---------------------------------------------------
	// if we have css styles defined, switch layer by css class definition
	// -------------------------------------------------------------------
	var szStylesValue = "";
	if ( map.Scale.CSSStyleNodes && fSwitchByCSS ){
		var styleNodes = map.Scale.CSSStyleNodes; 
		szStylesValue = styleNodes.firstChild.nextSibling.nodeValue;

		// must be done every time ???? magic 
		map.CSS = new Map.CSS(map.Scale.CSSStyleNodes);

		var depClass = null;
		var depObj = null;
		for ( a in this.depListA ){
			depObj = this.depListA[a]; 
			if ( depObj.szDisplayAttribute != depObj.szOldDisplayAttribute ){
				depClass = depObj.depClass;
				if ( depClass.length > 3 ){
					map.CSS.setStyle(depClass,'display',depObj.szDisplayAttribute);
					map.Scale.fCSSStyleNodeChanged = true;
				}
				else{
					var shapeObj = SVGDocument.getElementById(depObj.shapeId);
					if ( shapeObj ){
						shapeObj.style.setProperty("display",depObj.szDisplayAttribute,"");
					}
				}
			}
		}
		if ( map.Scale.fCSSStyleNodeChanged ){
			_TRACE("Map.Layer: .! Layer CSS Style changed !");
			styleNodes.firstChild.nextSibling.nodeValue = map.CSS.getStyleString();
		}
	_TRACE('Map.Layer: .switch scale dependent layer done');
	}
	// else switch layer by group style attribute
	// ------------------------------------------
	else {
		targetGroup = targetGroup?targetGroup:SVGRootElement;

		var nodeA = targetGroup.getElementsByTagName('g');
		for ( var n=0; n<nodeA.length;n++){
			var szId = nodeA.item(n).getAttributeNS(null,"id");
			var depId = map.Tiles.getMasterId(szId);
			if ( this.depListA[depId] ){
				nodeA.item(n).style.setProperty("display",this.depListA[depId].szDisplayAttribute,"");
			}
			continue;
		}
		_TRACE('Map.Layer: .switch scale dependent layer [no css] done');
	}
};
/**
 * test if layer is scale dependent layer 
 * @param szLayerId the id of the layer to check
 * @type boolean
 * @return true or false
 */
Map.Layer.prototype.isScaleDependentLayer = function(szLayerId){
	if ( this.depListA && this.depListA[szLayerId] ){
		return true;
	}
	return false;
};
/**
 * test if scale dependent layer is actually on 
 * @param szLayerId the id of the layer to check
 * @type boolean
 * @return true or false
 */
Map.Layer.prototype.isScaleDependentLayerOn = function(szLayerId){
	if ( this.depListA && this.depListA[szLayerId] ){
		return this.depListA[szLayerId].szDisplayAttribute.match(/none/)?false:true;
	}
	return true;
};
/**
 * zoom in as much to make shure, the specific layer is switched on 
 * @param szLayerId the id of the layer to check
 * @type void
 */
Map.Layer.prototype.zoomToScaleDependentLayerOn = function(szLayerId){

	if ( typeof(this.listA[szLayerId]) == 'undefined' ){
		return;
	}

	// GR 24.04.2015 get pending zoom done
	map.Event.doDefaultZoom(null);

	// get actual scale and lower scale of scaledependent layer or tile set
	var nScale = map.Scale.getTrueMapScale()*map.Scale.nZoomScale;
	var nUpper = 0;
	if ( this.depListA && this.depListA[szLayerId] && this.depListA[szLayerId].nUpper ){
		nUpper = this.depListA[szLayerId].nUpper;
	}else{
		nUpper = map.Tiles.depUpper?map.Tiles.depUpper.split(":")[1]:0;
	}
	// now calcalate the zoom delta to get the layer (tiles) switched on
	var nDelta = Math.ceil(nScale/nUpper);
	// get the actual envelope and zoom in by the calcolated delta
	var allBox = map.Zoom.getBox();
	var newWidth  = allBox.width/nDelta;
	var newHeight = allBox.height/nDelta;
	allBox.x += (allBox.width-newWidth)/2;
	allBox.y += (allBox.height-newHeight)/2;
	allBox.width = newWidth;
	allBox.height = newHeight;
	map.Zoom.setNewArea(allBox);
	// GR 22.10.2014 needed to initiate tile loading, 
	setTimeout("map.Tiles.switchScaleDependentTiles()",5000);
};
/**
 * test if scale dependent layer is actually on 
 * @param szLayerId the id of the layer to check
 * @type boolean
 * @return true or false
 */
Map.Layer.prototype.isLayerOn = function(szLayerId){
	if (this.listA[szLayerId]){
		return this.listA[szLayerId].szDisplay.match(/none/)?false:true;
	}
	return false;
};
/**
 * change opacity of one layer.
 * @param szLayer the name of the layer
 * @param nDelta opacity change factor
 * @type boolean
 * @return true, if the opacity changing could been executed
 */
Map.Layer.prototype.changeLayerOpacity = function(szLayer,nDelta){
	var nRetval = false;
	nRetval = this.changeOpacity(szLayer,nDelta);
	if ( !nRetval ){
		nRetval = this.changeOpacityOnTiles(szLayer,nDelta);
	}
	return nRetval;
};
/**
 * change opacity on tiled layer.
 * <br>gets a list of the layer ids with the tiles extensions
 * <br>then calls 'changeOpacity()' for every tiled layer part
 * @param szLayer the name of the layer
 * @param nDelta opacity change factor
 * @type boolean
 * @return true, if the opacity changing could been executed
 */
Map.Layer.prototype.changeOpacityOnTiles = function(szLayer,nDelta){
	var nRetval = false;
	if ( map.Tiles && map.Tiles.nCount > 0 ){
		var szTilesIdA  = map.Tiles.getTileNodeIds(szLayer);
		for ( var i=0; i<szTilesIdA.length; i++ ){
			nRetval = this.changeOpacity(szTilesIdA[i],nDelta)?true:nRetval;
		}
	}
	else{
		nRetval = this.changeOpacity(szLayer,nDelta)?true:nRetval;
	}
	return nRetval;
};
/**
 * change opacity on layer.
 * @param szLayer the id of the layer
 * @param nDelta opacity change factor
 * @type boolean
 * @return true, if the switching could been executed
 */
Map.Layer.prototype.changeOpacity = function(szLayer,nDelta){
	var x;
	var nRetval = false;
	var featureNode = this.document.getElementById(szLayer);
	if( featureNode ){
		if (featureNode.getAttributeNS(null,"class") == "linetemplate"	 ||
			featureNode.getAttributeNS(szMapNs,"class") == "linetemplate" ){
			if (szLayer.match(/#/)){
				var szIdA = szLayer.split('#');
				for ( x=0; x<10; x++ ){
					featureNode = this.document.getElementById(szIdA[0]+'_'+x+'#'+szIdA[1]);
					if( featureNode ){
						this.changeNodeOpacity(featureNode,nDelta);
						nRetval = true;
					}
				}
			}
			else{
				for ( x=0; x<10; x++ ){
					featureNode = this.document.getElementById(szLayer+'_'+x);
					if( featureNode ){
						this.changeNodeOpacity(featureNode,nDelta);
						nRetval = true;
					}
				}
			}
		}
		else{
			this.changeNodeOpacity(featureNode,nDelta);
			nRetval = true;
		}
	}
	return nRetval;
};
/**
 * helper to change the opacity of one node
 * @param nodeObj the DOM node to change the opacity property
 * @param nDelta the opacity change factor
 * @param szOpacityProperty (optional) the opacity property, if not "opacity"
 */
Map.Layer.prototype.changeNodeOpacity = function(nodeObj,nDelta,szOpacityProperty){

	var szOpacity = nodeObj.style.getPropertyValue(szOpacityProperty?szOpacityProperty:"opacity");
	if ( !szOpacity || szOpacity.length == 0 ) {
		szOpacity = "1";
	}
	var nOpacity = Number(szOpacity);
	nOpacity = nOpacity*nDelta;
	nOpacity = Math.min(1,nOpacity);
	nOpacity = Math.max(0,nOpacity);
	nodeObj.style.setProperty(szOpacityProperty?szOpacityProperty:"opacity",String(nOpacity),"");
};
/**
 * called on init and SVG import to initialize the pattern matrix (adapt it to the actual scaling)
 * @param evt the event
 * @param rootGroup root node to search for pattern (if null, SVGRootElement is used)
 */
Map.Layer.prototype.initPatternScaling = function(evt,rootGroup){

	if ( !rootGroup ){
		rootGroup = SVGRootElement;
	}
	var patternScale = 1/map.Scale.getEmbedScale()*map.Scale.nFeatureScaling;
	var patternMatrixA = null;

	// get pattern --------------------------------------------
	nodeA = rootGroup.getElementsByTagName('pattern');

	for ( i=0; i<nodeA.length;i++){
		if (!nodeA.item(i).getAttributeNS(null,"id").match(/antizoomandpan/)){
			patternMatrixA = getPatternMatrix(nodeA.item(i));
			nodeA.item(i).setAttributeNS(null,"patternTransform","matrix("+patternScale+" 0 0 "+patternScale+" "+String(0)+" "+String(0)+")");
		}
	}
};

var __featureScaling_lastScale = 1;
var __symbolScaling_lastScale = 1;
var __objectScaling_lastScale = 1;

Map.Layer.prototype.changeLineScaling = function(evt,nDelta){
	this.doFeatureScaling(nDelta);
	map.Scale.nLineScaling *= nDelta;
};
Map.Layer.prototype.changeLabelScaling = function(evt,nDelta){
	this.doLabelScaling(nDelta);
	map.Scale.nLabelScaling *= nDelta;
};
/**
 * called when scale is changed to adapt the map feature styles ( dynamic feature scaling )
 * @param evt the event
 * @param newscale the scale to adapt the styles to
 */
Map.Layer.prototype.changeFeatureScaling = function(evt,newScale,fOverride){

	if (newScale >= 1 && __featureScaling_lastScale >= 1 && !fOverride){
		return;
	}
	// patern must not be dynamically scaled
	var patternScale = newScale/map.Scale.getEmbedScale();

	var newObjectScale = newScale;

	if ( fFeatureScalingDynamic ){
		_TRACE("fFeatureScalingDynamic:"+newScale+" d:"+Math.log(1/newScale));
			var nD = Math.log(1/newScale);
			if ( nD > 1 ){
				newScale *= nD;
			}
	}
	
	map.Layer.nFeatureScale = newScale;
	map.Layer.nDynamicScale = map.Layer.nFeatureScale/map.Scale.nZoomScale;

	var nDelta = newScale/__featureScaling_lastScale;
	__featureScaling_lastScale = newScale;

	if ( nDelta === 0 || nDelta === 1 ){
		return;
	}
	if (!fFeatureScaling){
		this.doObjectScaling(newObjectScale);
		return;
	}

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('feature scaling -->');

	// pattern --------------------------------------------
	nodeA = SVGRootElement.getElementsByTagName('pattern');

	var zoomMatrixA = getMatrix(map.Scale.zoomNode);
	var nZoom = zoomMatrixA[0];
	var newX  = zoomMatrixA[4] + map.Scale.scaleX(SVGRootElement.currentTranslate.x);
	var newY  = zoomMatrixA[5] + map.Scale.scaleY(SVGRootElement.currentTranslate.y);
	newX  = -newX*patternScale;
	newY  = -newY*patternScale;

	for ( i=0; i<nodeA.length;i++){
		if (!nodeA.item(i).getAttributeNS(null,"id").match(/antizoomandpan/)){
			var patternMatrixA = getPatternMatrix(nodeA.item(i));
			nodeA.item(i).setAttributeNS(null,"patternTransform","matrix("+patternScale+" 0 0 "+patternScale+" "+String(newX)+" "+String(newY)+")");
		}
	}
	_TRACE('.feature scaling: pattern done');

	// check if relative scaling (stroke, symbols, ...) is necessary 
	// -------------------------------------------------------------

	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	
	// if features are originally scaled < 1; increase scaling til 1:1 
	var fDoit = true;
	if ( map.Scale.nFeatureScaling < 1 ){
		fDoit = false;
		if ( (nDelta < 1) && (map.Scale.nFeatureScaling*map.Zoom.nZoom >= 1) ){
			if ( map.Scale.nFeatureScaling*map.Zoom.nZoom*nDelta < 1 ){
				nDelta = 1/map.Scale.nFeatureScaling/map.Zoom.nZoom;
			}
			fDoit = true;
		}
		if ( (nDelta > 1) && (map.Scale.nFeatureScaling*map.Zoom.nZoom*nDelta >= 1) ){
			if ( map.Scale.nFeatureScaling*map.Zoom.nZoom < 1 ){
				nDelta = map.Zoom.nZoom*nDelta/(1/map.Scale.nFeatureScaling);
			}
			fDoit = true;
		}
	}
	if (!fDoit){
		return;
	}

	// filter --------------------------------------------
	nodeA = SVGRootElement.getElementsByTagName('filter');

	for ( i=0; i<nodeA.length;i++){
		if (!nodeA.item(i).getAttributeNS(null,"id").match(/antizoomandpan/)){
			var childsA = nodeA.item(i).childNodes;
			for ( c=0; c<childsA.length;c++){
				if (childsA.item(c).nodeName == 'feMorphology' ){
					childsA.item(c).setAttributeNS(null,"radius",Number(childsA.item(c).getAttributeNS(null,"radius"))*nDelta);
				}
				if (childsA.item(c).nodeName == 'feOffset' ){
					childsA.item(c).setAttributeNS(null,"dx",Number(childsA.item(c).getAttributeNS(null,"dx"))*nDelta);
					childsA.item(c).setAttributeNS(null,"dy",Number(childsA.item(c).getAttributeNS(null,"dy"))*nDelta);
				}
				if (childsA.item(c).nodeName == 'feGaussianBlur' ){
					childsA.item(c).setAttributeNS(null,"stdDeviation",Number(childsA.item(c).getAttributeNS(null,"stdDeviation"))*nDelta);
				}
			}
		}
		// GR 20.06.2011 in Chrome and firefox no more neccessary, but produced disappearing;  furter tests needed
		if (0){
		// GR 26.09.2007 workaround for viewer bug, if fiter is not switched off, the object disappears
		if ( newScale < 0.03 ){
			if ( !nodeA.item(i).getAttributeNS(null,"id").match(/__off__/) ){
				nodeA.item(i).setAttributeNS(null,"id","__off__"+nodeA.item(i).getAttributeNS(null,"id"));
			}
		}
		else{
			if ( nodeA.item(i).getAttributeNS(null,"id").match(/__off__/) ){
				var szId = nodeA.item(i).getAttributeNS(null,"id");
				nodeA.item(i).setAttributeNS(null,"id",szId.substr(7,szId.length-7));
			}
		}
		}
	}
	_TRACE('.feature scaling: filter done');

	// styles --------------------------------------------

	this.doFeatureScaling(nDelta);

	// label --------------------------------------------

	this.doLabelScaling(nDelta);

	// symbols --------------------------------------------

	// old way to scale the use elements
	if ( 0 ){
		nodeA = SVGRootElement.getElementsByTagName('use');
		for ( i=0; i<nodeA.length;i++){
			if (antiZoomAndPanList.isContained(nodeA.item(i))){
				continue;
			}
			var szClass = nodeA.item(i).getAttributeNS(null,"class");
			if ( szClass				&&
				 szClass.length > 1		&&
				 szClass == "dontscale"  ) {
				continue;
			}
			var szId = nodeA.item(i).getAttributeNS(null,"id");
			if (szId && szId.match(/antizoomandpan/)) {
				continue;
			}
			if ( (matrixA = getMatrix(nodeA.item(i))) ){
				matrixA[0] *= nDelta;
				matrixA[3] *= nDelta;
				setMatrix(nodeA.item(i),matrixA);
			}
		}
	}
	// now we scale the symbols
	else{
		var tmpNewScale = newScale;
		var tmpDelta = nDelta;
		if ( 0 && fSymbolScalingDynamic && !fFeatureScalingDynamic ){
			if ( newScale*15 < 1 ){
				newScale /= newScale*15;
			}
			else if ( newScale*10 < 1 ){
				newScale /= newScale*10;
			}
			else if ( newScale*8 < 1 ){
				newScale /= newScale*8;
			}
			else if ( newScale*5 < 1 ){
				newScale /= newScale*5;
			}
			nDelta = newScale/__symbolScaling_lastScale;
			__symbolScaling_lastScale = newScale;
		}
		var markerNode = SVGDocument.getElementById('marker_symbols');
		if ( markerNode ){
			nodeA = markerNode.childNodes;
			for ( i=0; i<nodeA.length;i++){
				if ( nodeA.item(i).nodeType != 1 ){
					continue;
				}
				var szId = nodeA.item(i).getAttributeNS(null,"id");
				if ( !szId || !szId.length || szId.match(/antizoomandpan/)) {
					continue;
				}
				if ( (matrixA = getMatrix(nodeA.item(i))) ){
					matrixA[0] *= nDelta;
					matrixA[3] *= nDelta;
					setMatrix(nodeA.item(i),matrixA);
					map.Scale.scaledSymbolsA["#"+szId] = true;
				}
			}
		}
		var symbolsNode = SVGDocument.getElementById('symbolstore');
		if ( symbolsNode ){
			nodeA = symbolsNode.getElementsByTagName('g');
			_TRACE("S Y M B O L S T O R E : "+nodeA.length+" symbols to scale");
			for ( i=0; i<nodeA.length;i++){
				var szId = nodeA.item(i).getAttributeNS(null,"id");
				if ( !szId || !szId.length || !szId.match(/symbol/) || szId.match(/antizoomandpan/)  ) {
					continue;
				}
				if ( (matrixA = getMatrix(nodeA.item(i))) ){
					matrixA[0] *= nDelta;
					matrixA[3] *= nDelta;
					matrixA[4] *= nDelta;
					matrixA[5] *= nDelta;
					setMatrix(nodeA.item(i),matrixA);
					map.Scale.scaledSymbolsA["#"+szId] = true;
				}
			}
		}
		var legendNode = SVGDocument.getElementById("widgets:antizoomandpan");
		nodeA = legendNode.getElementsByTagName('use');
		_TRACE("L E G E N D N O D E : "+nodeA.length+" symbols to scale");
		for ( i=0; i<nodeA.length;i++){
			var szRefId = nodeA.item(i).getAttributeNS(szXlink,'href');
			if ( !map.Scale.scaledSymbolsA[szRefId] ){
				continue;
			}
			if ( (matrixA = getMatrix(nodeA.item(i))) ){
				matrixA[0] /= nDelta;
				matrixA[3] /= nDelta;
				setMatrix(nodeA.item(i),matrixA);
			}
		}
		nodeA = SVGHiddenGroup.getElementsByTagName('use');
		_TRACE("H I D D E N N O D E : "+nodeA.length+" symbols to scale");
		for ( i=0; i<nodeA.length;i++){
			var szRefId = nodeA.item(i).getAttributeNS(szXlink,'href');
			if ( !map.Scale.scaledSymbolsA[szRefId] ){
				continue;
			}
			if ( (matrixA = getMatrix(nodeA.item(i))) ){
				matrixA[0] /= nDelta;
				matrixA[3] /= nDelta;
				setMatrix(nodeA.item(i),matrixA);
			}
		}
		newScale = tmpNewScale;
		nDelta = tmpDelta;

		// workaround chrome GR 04.06.2012
		if ( 0 && szViewer.match(/chrome/i) ){
			for ( a in map.Layer.listA ){
				var layerItem = map.Layer.listA[a];
				var layerNode = SVGDocument.getElementById(layerItem.szName);
				if (layerNode){
					nodeA = layerNode.getElementsByTagName('use');
					for ( i=0; i<nodeA.length;i++){
						if ( (matrixA = getMatrix(nodeA.item(i))) ){
							matrixA[0] *= nDelta;
							matrixA[3] *= nDelta;
							setMatrix(nodeA.item(i),matrixA);
						}
					}
				}
			}
		}

	}
	_TRACE('.feature scaling: symbols done');

	__scaleTextOffsets(SVGRootElement,newScale,nDelta,SVGDoc.getElementById("mapstyles"));

	__scaleLineDecorations(SVGRootElement,newScale);

	// objects --------------------------------------------
	this.doObjectScaling(newObjectScale);

	_TRACE('.feature scaling done');
};
/**
 * called by changeFeatureScaling to change the scaling of generated objects (charts,...)
 * @param nDelta the scaling factor
 */
Map.Layer.prototype.doFeatureScaling = function(nDelta){

	var szStylesValue = null;
	var szNewStylesValue = null;

	var SVGDoc = SVGDocument;

	// css styles --------------------------------------------
	var cssStyles = SVGDoc.getElementById("mapstyles");
	if ( cssStyles ){
		szStylesValue = cssStyles.firstChild.nextSibling.nodeValue;

		szNewStylesValue = __scaleLineStyleString(szStylesValue,nDelta);
		cssStyles.firstChild.nextSibling.nodeValue = szNewStylesValue;
		map.Scale.fCSSStyleNodeChanged = true;
		_TRACE('.feature scaling: CSS styles done');
	}
	else{
	// normal style attributes -------------------------------------------
		if( fFeatureScalingByLayer ){
			// mode A: 
			// do it layer by layer 
			// ---------------------
			// first collect all nodes to scale
			var nodeTempA = null;
			var nodeStyleA = new Array(0);
			var nodeStyleDeltaA = new Array(0);
			var fGot = false;
			var tilesDone = false;

			// loop over all layer
			for ( a in map.Layer.listA ){
				var layerItem = map.Layer.listA[a];

				// handle tiled layer
				if ( layerItem.szFlag.match(/tiled/) ){
					if ( !tilesDone ){
						tilesDone = true;
						// on first tiled layer, than do all tiles
						var tileInfoA = map.Tiles.getTileInfo();
						if ( tileInfoA ){
							for ( var i=0; i<tileInfoA.length; i++){
								var nDeltaTBD = Number(tileInfoA[i].tileGroup.getAttributeNS(szMapNs,"deltaTBD"));

								if ( tileInfoA[i].tileGroup.style.getPropertyValue("display") == "inline" ){


								    _TRACE("**** doFeatureScaling for:"+tileInfoA[i].tileGroup.getAttributeNS(null,"id"));
									nodeTempA = tileInfoA[i].tileGroup.getElementsByTagName('g');
									for ( var j=0; j<nodeTempA.length; j++ ){
										if ( !nodeTempA.item(j).getAttributeNS(null,"id").match(/:label/) ) {
											nodeStyleA[nodeStyleA.length] = nodeTempA.item(j);
											nodeStyleDeltaA[nodeStyleA.length-1] = nDeltaTBD?nDeltaTBD:1;
										}
									}
									tileInfoA[i].tileGroup.setAttributeNS(szMapNs,"deltaTBD","1");
								}
								else{
									if ( tileInfoA[i].tileGroup.hasChildNodes() ){ 
										tileInfoA[i].tileGroup.setAttributeNS(szMapNs,"deltaTBD",String(nDelta*(nDeltaTBD?nDeltaTBD:1)));
									}
								}
							}
						}
					}
				}
				// handle normal layer
				else {
					if ( layerItem.szName ){
						var layerNode = SVGDocument.getElementById(layerItem.szName);
						if (layerNode){
							nodeStyleA[nodeStyleA.length] = layerNode;
							nodeStyleDeltaA[nodeStyleA.length-1] = 1;
							nodeTempA = layerNode.getElementsByTagName('g');
							for ( var j=0; j<nodeTempA.length; j++ ){
								if ( !nodeTempA.item(j).getAttributeNS(null,"id").match(/:label/) ) {
									nodeStyleA[nodeStyleA.length] = nodeTempA.item(j);
									nodeStyleDeltaA[nodeStyleA.length-1] = 1;
								}
							}
						}
					}
				}
			}

			// get all mapobjects g nodes GR 20.09.2011 for BUFFER chart styles
			var layerNode = SVGDocument.getElementById("mapobjects");
			nodeTempA = layerNode.getElementsByTagName('g');
			for ( var j=0; j<nodeTempA.length; j++ ){
				nodeStyleA[nodeStyleA.length] = nodeTempA.item(j);
				nodeStyleDeltaA[nodeStyleA.length-1] = 1;
			}

			// =====================================================
			// now scale the style attributes of the collected nodes
			// =====================================================
			for ( n=0; n<nodeStyleA.length;n++){
				var szStyle = nodeStyleA[n].getAttributeNS(null,"style");
				if (szStyle && szStyle.length){
					szNewStylesValue = __scaleLineStyleString(szStyle,nDelta*nodeStyleDeltaA[n]);
					nodeStyleA[n].setAttributeNS(null,"style",szNewStylesValue);
				}
			}
		}
		else{
			// mode B: 
			// search for all <g> in canvas, and scale the styles
			// --------------------------------------------------
			alert("B!!!");
			nodeA = map.Scale.canvasNode.getElementsByTagName('g');
			for ( n=0; n<nodeA.length;n++){
				if (antiZoomAndPanList.isContained(nodeA.item(n))){
					continue;
				}
				var szStyle = nodeA.item(n).getAttributeNS(null,"style");
				if (szStyle && szStyle.length){
					szNewStylesValue = __scaleLineStyleString(szStyle,nDelta);
					nodeA.item(n).setAttributeNS(null,"style",szNewStylesValue);
				}
			}
		}
		_TRACE('.feature scaling: '+nodeA.length+' styles done');
	}
};
/**
 * called by changeFeatureScaling to change the scaling of generated objects (charts,...)
 * @param nDelta the scaling factor
 */
Map.Layer.prototype.doObjectScaling = function(newScale){

	if ( !fObjectScaling ){
		return;
	}

	map.Layer.nObjectScale = newScale;

	if ( fObjectScaling == "dynamic" ){

		/** get the dynamic factor by comparing the actual map scale to the normal size scale
		**  actual scale = (map.Scale.getTrueMapScale()*map.Scale.nZoomScale)
		**/
		var dx = (map.Scale.getTrueMapScale()*map.Scale.nZoomScale)/map.Scale.nNormalSizeScale;

		/** dynamically scale the objects by qubic root function **/
		map.Layer.nObjectScale *= Math.pow(1/dx,1/map.Scale.nDynamicScalePow);	
			
		/** old dynamic scale
		var nD = Math.log(1/newScale);
		if ( nD > 1 ){
			newScale *= nD;
		}
		**/
	}

	/** store the dynamic scale part for use in maptheme
	**/
	map.Layer.nDynamicObjectScale = map.Layer.nObjectScale / newScale;

	var nDelta = map.Layer.nObjectScale/__objectScaling_lastScale;
	__objectScaling_lastScale = map.Layer.nObjectScale;

	if ( nDelta === 0 || nDelta === 1 ){
		return;
	}

	_TRACE("---- ???? ---- map.Scale.nObjectScaling = "+map.Scale.nObjectScaling);
	var fDoit = true;
	// if objects are originally scaled < 1; increase scaling til 1:1 
	if ( map.Scale.nObjectScaling < 1 ){
		fDoit = false;
		if ( (nDelta < 1) && (map.Scale.nObjectScaling*map.Zoom.nZoom >= 1) ){
			if ( map.Scale.nObjectScaling*map.Zoom.nZoom*nDelta < 1 ){
				nDelta = 1/map.Scale.nObjectScaling/map.Zoom.nZoom;
			}
			fDoit = true;
		}
		if ( (nDelta > 1) && (map.Scale.nObjectScaling*map.Zoom.nZoom*nDelta >= 1) ){
			if ( map.Scale.nObjectScaling*map.Zoom.nZoom < 1 ){
				nDelta = map.Zoom.nZoom*nDelta/(1/map.Scale.nObjectScaling);
			}
			fDoit = true;
		}
	}
	// here we go
	if ( fDoit ){
		_TRACE('.feature scaling: objects begin');
		var objectGroup = map.Layer.objectGroup;
		nodeA = objectGroup.childNodes;
		for ( i=0; i<nodeA.length;i++){
			if (antiZoomAndPanList.isContained(nodeA.item(i))){
				continue;
			}
			var objectsA = nodeA.item(i).childNodes;
			for ( ii=0; ii<objectsA.length;ii++){
				if ( (matrixA = getMatrix(objectsA.item(ii))) ){
					matrixA[0] *= nDelta;
					matrixA[3] *= nDelta;
					setMatrix(objectsA.item(ii),matrixA);
				}
			}
		}
	}
	_TRACE('.feature scaling: objects done');
};
/**
 * called on pan to do tiles which get visible and have stored feature scaling
 * @param evt the event
 */
Map.Layer.prototype.doStoredFeatureScaling = function(evt){

	if (!fFeatureScaling){
		return;
	}
	// styles --------------------------------------------

	var szStylesValue = null;
	var szNewStylesValue = null;
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;

	// css styles --------------------------------------------
	if ( SVGDoc.getElementById("mapstyles") ){
		return;
	}
	// normal style attributes -------------------------------------------
	// first collect all nodes to scale
	var nodeTempA = null;
	var nodeStyleA = new Array(0);
	var nodeStyleDeltaA = new Array(0);

	// loop over all tiles
	var tileInfoA = map.Tiles.getTileInfo();
	if ( tileInfoA ){
		for ( var i=0; i<tileInfoA.length; i++){
			if ( tileInfoA[i].tileGroup.style.getPropertyValue("display") == "inline" ){
				var nDeltaTBD = Number(tileInfoA[i].tileGroup.getAttributeNS(szMapNs,"deltaTBD"));
				if ( nDeltaTBD && (nDeltaTBD != 1) ){
					_TRACE("****** !!! doStoredFeatureScaling for:"+tileInfoA[i].tileGroup.getAttributeNS(null,"id"));
					nodeTempA = tileInfoA[i].tileGroup.getElementsByTagName('g');
					for ( var j=0; j<nodeTempA.length; j++ ){
						nodeStyleA[nodeStyleA.length] = nodeTempA.item(j);
						nodeStyleDeltaA[nodeStyleA.length-1] = nDeltaTBD?nDeltaTBD:1;
						tileInfoA[i].tileGroup.setAttributeNS(szMapNs,"deltaTBD","1");
					}
					/**
					nodeTempA = tileInfoA[i].tileGroup.getElementsByTagName('text');
					for ( var j=0; j<nodeTempA.length; j++ ){
						nodeStyleA[nodeStyleA.length] = nodeTempA.item(j);
						nodeStyleDeltaA[nodeStyleA.length-1] = nDeltaTBD?nDeltaTBD:1;
						tileInfoA[i].tileGroup.setAttributeNS(szMapNs,"deltaTBD","1");
					}
					**/
				}
			}
		}
	}
	// now scale the style attributes of the collected nodes
	for ( n=0; n<nodeStyleA.length;n++){
		if ( !nodeStyleA[n].getAttributeNS(null,"id").match(/:label/) ) {
			var szStyle = nodeStyleA[n].getAttributeNS(null,"style");
			if (szStyle && szStyle.length){
				szNewStylesValue = __scaleLineStyleString(szStyle,nodeStyleDeltaA[n]);
				nodeStyleA[n].setAttributeNS(null,"style",szNewStylesValue);
			}
		}
	}

_TRACE('.stored scaling done');
};
/**
 * helper function to scale text offsets; must be adapted on zooming, if baselineshift is used, only the text backgrounds need to be repositioned 
 * @param targetGroup the DOM node to start with
 * @param newScale the new zoom scale
 * @param nDelta new zoom scale / old zoom scale
 * @param cssStylesNode DOM node of the css styles used to define the text height (may be null)
 */
function __scaleTextOffsets(targetGroup,newScale,nDelta,cssStyles){

	// text backgrounds --------------------------------------------
	var nodeA = targetGroup.getElementsByTagName('rect');
	for ( i=0; i<nodeA.length;i++){
		var szId = nodeA.item(i).getAttributeNS(null,'id');
		if (szId && szId.match(/textbg/)){
			var textNode = nodeA.item(i).nextSibling.nextSibling;
			if (textNode && (textNode.nodeName == "text") ){
				var bBox = map.Dom.getBox(textNode);
				if ( bBox.width < 0 || bBox.height < 0 ){
					nodeA.item(i).setAttributeNS(null,'width',0);
					nodeA.item(i).setAttributeNS(null,'height',0);
					continue;
				}
				// changes though css are not yet active at this time
				if (cssStyles){
					bBox.x *= nDelta;
					bBox.y *= nDelta;
					bBox.width *= nDelta;
					bBox.height *= nDelta;
				}
				var nMargin = map.Scale.normalX(1)*newScale;
				nodeA.item(i).setAttributeNS(null,'x',bBox.x-nMargin);
				nodeA.item(i).setAttributeNS(null,'y',bBox.y-nMargin);
				nodeA.item(i).setAttributeNS(null,'width',bBox.width+nMargin*2);
				nodeA.item(i).setAttributeNS(null,'height',bBox.height+nMargin*2);
			}
		}
	}
	// texts --------------------------------------------
	nodeA = targetGroup.getElementsByTagName('text');
	for ( i=0; i<nodeA.length;i++){
		szId = nodeA.item(i).parentNode.getAttributeNS(null,'id');
		if (szId && szId.match(/label/)){
			var textNode = nodeA.item(i);
			var szTransform = textNode.getAttributeNS(null,'transform');
			if ( szTransform ){
				szTransformA = szTransform.split(" ");
				for ( var ii=0; ii<szTransformA.length; ii++ ){
					if ( szTransformA[ii].match(/translate/) ){
						szTrans = szTransformA[ii].substr(10,szTransformA[ii].length-11);
						szTransA = szTrans.split(',');
						x = Number(szTransA[0])*nDelta;
						y = Number(szTransA[1])*nDelta;
						szTransformA[ii] = "translate("+x+","+y+")";
					}
				}
				var szNew = "";
				for ( var ii=0; ii<szTransformA.length; ii++ ){
					szNew = szNew + szTransformA[ii] + " ";
				}
				textNode.setAttributeNS(null,'transform',szNew);
			}
		}
	}

	_TRACE('.feature scaling: text offsets done');

}
/**
 * helper function to set and scale linedecoration shift ( needed for Chrome, Firefox, ...)
 * @param targetGroup the DOM node to start with
 * @param newScale the new zoom scale
 */
function __scaleLineDecorations(targetGroup,newScale){

	var nodeA =  targetGroup.getElementsByTagName('text');
	for ( i=0; i<nodeA.length;i++){
		if ( nodeA.item(i) && nodeA.item(i).getAttributeNS(null,"id") && nodeA.item(i).getAttributeNS(null,"id").match(/linedecoration/) ){
			var szDominantBaseline = nodeA.item(i).style.getPropertyValue("dominant-baseline");
			var nBaselineShift = parseFloat(nodeA.item(i).style.getPropertyValue("baseline-shift"));
			var nSize = parseFloat(nodeA.item(i).style.getPropertyValue("font-size"));
			var nYoff = 0;
			if ( szDominantBaseline == "mathematical" ){
				nYoff += nSize/3;
			}
			if ( szDominantBaseline == "hanging" ){
				nYoff -= nSize;
			}
			nYoff -= nBaselineShift * newScale;
			nodeA.item(i).setAttributeNS(null,"dy",nYoff);
		}
	}
	_TRACE('.feature scaling: linedecoration done');

}
/**
 * change the scaling of all label
 * @param evt the event
 * @param nDelta the scaling factor
 */
Map.Layer.prototype.doLabelScaling = function(nDelta){

	var szStylesValue = null;
	var szNewtylesValue = null;

	var SVGDoc = SVGDocument;

	// css styles --------------------------------------------
	var cssStyles = SVGDoc.getElementById("mapstyles");
	if ( cssStyles ){
		szStylesValue = cssStyles.firstChild.nextSibling.nodeValue;

		szNewStylesValue = __scaleTextStyleString(szStylesValue,nDelta);
		cssStyles.firstChild.nextSibling.nodeValue = szNewStylesValue;
		map.Scale.fCSSStyleNodeChanged = true;
		map.Scale.refreshCSSStyles();

		_TRACE('.label scaling: CSS styles done');
	}
	else{
		var nodeA = null;
		var i = 0;
		var n = 0;

		_TRACE('! label scaling -->');

		// search for all <g> in canvas, and scale the styles
		// --------------------------------------------------
		nodeA = map.Scale.canvasNode.getElementsByTagName('g');
		for ( n=0; n<nodeA.length;n++){
			if (antiZoomAndPanList.isContained(nodeA.item(n))){
				continue;
			}
			var szId = nodeA.item(n).getAttributeNS(null,"id");
			if ( !szId || (szId.length == 0) || !(szId.match(/label/)) ){
				continue;
			}
			var szStyle = nodeA.item(n).getAttributeNS(null,"style");
			if (szStyle && szStyle.length){
				if ( nDelta == 0 ){
					map.Layer.switchLayer(null,szId,null,(nodeA.item(n).style.getPropertyValue("display")=="none")?true:false);
				}else{

					szNewStylesValue = __scaleStyleString(szStyle,nDelta);
					nodeA.item(n).setAttributeNS(null,"style",szNewStylesValue);

					// also in childs (grouped label with different scale!)
					childA = nodeA.item(n).childNodes;
					for ( c=0; c<childA.length;c++){
						if ( childA.item(c).nodeName == "text" ){
							var szStyle = childA.item(c).getAttributeNS(null,"style");
							if (szStyle && szStyle.length){

								szNewStylesValue = __scaleStyleString(szStyle,nDelta);
								childA.item(c).setAttributeNS(null,"style",szNewStylesValue);

							}
						}
					}
				}
			}
		}
	}
	// new GR 14.10.2013 
	// search for all <text> in generated value label and scale the styles
	// -------------------------------------------------------------------

	_TRACE("scale generated label");

	for ( l in map.Layer.generatedLabelA ){
		if ( map.Layer.generatedLabelA[l]){
			nodeA = map.Layer.generatedLabelA[l].getElementsByTagName('text');
			for ( n=0; n<nodeA.length;n++){
				var szStyle = nodeA.item(n).getAttributeNS(null,"style");
				if (szStyle && szStyle.length){
					szNewStylesValue = __scaleStyleString(szStyle,nDelta);
					nodeA.item(n).setAttributeNS(null,"style",szNewStylesValue);
				}
			}
		}
	}

	_TRACE('.label scaling done');

	this.adaptLabel(null);
};
/**
 * change the scaling of elements within the object layer of the map
 * @param evt the event
 * @param nDelta the scaling factor
 * @param objGroup the DOM node of the object layer
 */
Map.Layer.prototype.changeObjectScaling = function(evt,nDelta,objGroup){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! object scaling -->');

	if ( nDelta == 0 ){
		nDelta = 1/map.Scale.nObjectScaling;
	}
	if ( objGroup ){

		// a) only objects of a specified group ----------------------

		var objectsA = objGroup.childNodes;
		for ( i=0; i<objectsA.length;i++){
			if ( (matrixA = getMatrix(objectsA.item(i))) ){
				matrixA[0] *= nDelta;
				matrixA[3] *= nDelta;
				setMatrix(objectsA.item(i),matrixA);
			}

			var dObject = objectsA.item(i).childNodes[0];
			if ( dObject && (matrixA = getMatrix(dObject)) ){
				matrixA[4] /= Math.pow(nDelta,0.5);
				matrixA[5] /= Math.pow(nDelta,0.5);
				setMatrix(dObject,matrixA);
			}
		}
	}
	else {

		// b) all objects --------------------------------------------

		if ( ((map.Scale.nObjectScaling * nDelta) > 8  ) ||
			 ((map.Scale.nObjectScaling * nDelta) < 1/10) ){
			_TRACE('.object scaling is on limit! not done');
			return;
		}

		map.Scale.nObjectScaling *= nDelta;

		var objectGroup = map.Layer.objectGroup;
		nodeA = objectGroup.childNodes;
		for ( i=0; i<nodeA.length;i++){
			if (antiZoomAndPanList.isContained(nodeA.item(i))){
				continue;
			}
			var objectsA = nodeA.item(i).childNodes;
			for ( ii=0; ii<objectsA.length;ii++){
				if ( (matrixA = getMatrix(objectsA.item(ii))) ){
					matrixA[0] *= nDelta;
					matrixA[3] *= nDelta;
					setMatrix(objectsA.item(ii),matrixA);
				}
				/**
				var dObject = objectsA.item(ii).childNodes[0];
				if ( dObject && (matrixA = getMatrix(dObject)) ){
					matrixA[4] /= Math.pow(nDelta,0.5);
					matrixA[5] /= Math.pow(nDelta,0.5);
					setMatrix(dObject,matrixA);
				}
				**/			}
		}
	}
_TRACE('.object scaling done');
};
/**
 * set the rotation of elements within the object layer of the map
 * @param evt the event
 * @param nRot the rotation angle
 * @param objGroup the DOM node of the object layer
 */
Map.Layer.prototype.setObjectRotate = function(evt,nRot,objGroup){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! object rotate -->');

	// objects --------------------------------------------
	if ( objGroup ){
		var objectsA = objGroup.childNodes;
		for ( i=0; i<objectsA.length;i++){
			setRotate(objectsA.item(i),(360+Number(nRot))%360);
		}
	}
	else {
		var objectGroup = map.Layer.objectGroup;
		nodeA = objectGroup.childNodes;
		for ( i=0; i<nodeA.length;i++){
			if (antiZoomAndPanList.isContained(nodeA.item(i))){
				continue;
			}
			var objectsA = nodeA.item(i).childNodes;
			for ( ii=0; ii<objectsA.length;ii++){
				setRotate(objectsA.item(ii),(360+Number(nRot))%360);
			}
		}
	}
_TRACE('.object rotate done');
};
/**
 * set the rotation of the loaded pattern
 * @param evt the event
 * @param nRot the rotation angle
 * @param rootGroup optional base node for pattern elements
 */
Map.Layer.prototype.setPatternRotate = function(evt,nRot,rootGroup){
	var nodeA = null;
	var i = 0;
	var n = 0;
	_TRACE('! pattern rotate -->');
	if ( !rootGroup ){
		rootGroup = SVGRootElement;
	}
	_TRACE('! pattern rotate 2 -->');
	// get pattern --------------------------------------------
	nodeA = rootGroup.getElementsByTagName('pattern');
	_TRACE('! pattern rotate 3 -->');
	for ( i=0; i<nodeA.length;i++){
		if (!nodeA.item(i).getAttributeNS(null,"id").match(/antizoomandpan/)){
			setRotate(nodeA.item(i),(360+Number(nRot))%360,"patternTransform");
			_TRACE('.pattern rotate:'+i);
		}
	}
_TRACE('.pattern rotate done');
};
/**
 * set the rotation of elements within the object layer of the map
 * @param evt the event
 * @param nRot the rotation angle
 * @param objGroup the DOM node of the object layer
 */
Map.Layer.prototype.setSymbolRotate = function(evt,nRot,objGroup){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! symbol rotate -->');

	var markerNode = SVGDocument.getElementById('marker_symbols');
	if ( markerNode ){
		nodeA = markerNode.childNodes;
		for ( i=0; i<nodeA.length;i++){
			if ( nodeA.item(i).nodeType != 1 ){
				continue;
			}
			var szId = nodeA.item(i).getAttributeNS(null,"id");
			if ( !szId || !szId.length || szId.match(/antizoomandpan/)) {
				continue;
			}
			setRotate(nodeA.item(i),(360+Number(nRot))%360);
			map.Scale.rotatedSymbolsA["#"+szId] = true;
		}
	}
	var symbolsNode = SVGDocument.getElementById('symbolstore');
	if ( symbolsNode ){
		nodeA = symbolsNode.getElementsByTagName('g');
		_TRACE("S Y M B O L S T O R E : "+nodeA.length+" symbols to rotate");
		for ( i=0; i<nodeA.length;i++){
			var szId = nodeA.item(i).getAttributeNS(null,"id");
			if ( !szId || !szId.length || !szId.match(/symbol/) || szId.match(/antizoomandpan/)  ) {
				continue;
			}
			setRotate(nodeA.item(i),(360+Number(nRot))%360);
			map.Scale.rotatedSymbolsA["#"+szId] = true;
		}
	}
	var legendNode = SVGDocument.getElementById("widgets:antizoomandpan");
	nodeA = legendNode.getElementsByTagName('use');
	_TRACE("L E G E N D N O D E : "+nodeA.length+" symbols to rotate");
	for ( i=0; i<nodeA.length;i++){
		var szRefId = nodeA.item(i).getAttributeNS(szXlink,'href');
		if ( !map.Scale.rotatedSymbolsA[szRefId] ){
			continue;
		}
		setRotate(nodeA.item(i),(360+Number(-nRot))%360);
	}
	nodeA = SVGHiddenGroup.getElementsByTagName('use');
	_TRACE("H I D D E N N O D E : "+nodeA.length+" symbols to rotate");
	for ( i=0; i<nodeA.length;i++){
		var szRefId = nodeA.item(i).getAttributeNS(szXlink,'href');
		if ( !map.Scale.rotatedSymbolsA[szRefId] ){
			continue;
		}
		setRotate(nodeA.item(i),(360+Number(-nRot))%360);
	}
_TRACE('.object rotate done');
};
/**
 * change the rotation of elements within the object layer of the map
 * @param evt the event
 * @param nDelta the scaling factor
 * @param objGroup the DOM node of the object layer
 */
Map.Layer.prototype.changeObjectRotate = function(evt,nDelta,objGroup){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! object rotate -->');

	// objects --------------------------------------------
	if ( objGroup ){
		var objectsA = objGroup.childNodes;
		for ( i=0; i<objectsA.length;i++){
			var nRot = getRotateAttributeValue(objectsA.item(i));
			setRotate(objectsA.item(i),(360+Number(nRot)+Number(nDelta))%360);
		}
	}
	else {
		var objectGroup = map.Layer.objectGroup;
		nodeA = objectGroup.childNodes;
		for ( i=0; i<nodeA.length;i++){
			if (antiZoomAndPanList.isContained(nodeA.item(i))){
				continue;
			}
			var objectsA = nodeA.item(i).childNodes;
			for ( i=0; i<objectsA.length;i++){
				var nRot = getRotateAttributeValue(objectsA.item(i));
				setRotate(objectsA.item(i),(360+Number(nRot)+Number(nDelta))%360);
			}
		}
	}
_TRACE('.object rotate done');
};
/**
 * change the rotation of all label
 * @param evt the event
 * @param nDelta the scaling factor
 */
Map.Layer.prototype.setLabelRotate = function(evt,nRot){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! label rotate -->');

	// search for all <text> in canvas, and scale the styles
	// --------------------------------------------------
	nodeA = map.Layer.layerNode.getElementsByTagName('text');
	for ( n=0; n<nodeA.length;n++){
		if (antiZoomAndPanList.isContained(nodeA.item(n))){
			continue;
		}
		if (  nodeA.item(n).firstChild && (nodeA.item(n).firstChild.nodeName == "textPath") ){
			continue;
		} 
		setRotate(nodeA.item(n),(360+Number(nRot))%360);
	}
	_TRACE('.label rotate done');

	this.adaptLabel();
};
/**
 * change the rotation of all label
 * @param evt the event
 * @param nDelta the scaling factor
 */
Map.Layer.prototype.changeLabelRotate = function(evt,nDelta){

	var nodeA = null;
	var i = 0;
	var n = 0;

	_TRACE('! label rotate -->');

	// search for all <text> in canvas, and scale the styles
	// --------------------------------------------------
	nodeA = map.Scale.canvasNode.getElementsByTagName('text');
	for ( n=0; n<nodeA.length;n++){
		if (antiZoomAndPanList.isContained(nodeA.item(n))){
			continue;
		}
		if (  nodeA.item(n).firstChild && (nodeA.item(n).firstChild.nodeName == "textPath") ){
			continue;
		} 
		var nRot = getRotateAttributeValue(nodeA.item(n));
		setRotate(nodeA.item(n),(360+Number(nRot)+Number(nDelta))%360);
	}
	_TRACE('.label rotate done');

	this.adaptLabel();
};
/**
 * realize dynamic label  
 * @param evt the actual event
 * @param rootNode the DOM node from which on to look for labels on path
 */
Map.Layer.prototype.adaptLabel = function(evt,rootNode){
	// initiate dynamic label, if wanted
	if ( fAdaptLabelToScaling ){
		this.adaptLabelToScaling(evt,rootNode);
	}
	if ( fCheckLabelOverlap || fCheckLabelSpace || fCheckLabelSqueeze ){
		if (rootNode){
			this.prepareCheckOverlap(evt,rootNode);
		}
		this.checkLabelOverlapping(evt,rootNode);
	}
};
/**
 * checks labels on paths; displays label only if path is long enough
 * first clears all label on path and than calls the executing function ( if 'delayed' set, on timeout )
 * @param evt the actual event
 * @param rootNode the DOM node from which on to look for labels on path
 */
Map.Layer.prototype.adaptLabelToScaling = function(evt,rootNode){

	if (!rootNode){
		rootNode = SVGRootElement;
	}
	if ( (fAdaptLabelToScaling || fCheckLabelOnlyOne) ){
		var fDoit = false;
		for ( a in map.Layer.listA ){
			var layerItem = map.Layer.listA[a];
			if ( (layerItem.nRenderer & (4|8)) && (layerItem.szType == "line") && (layerItem.szDisplayLabel == "inline") ){
				fDoit = true;
			}
		}
		if (!fDoit){
			return;
		}

		// hide texts on path
		var nodeA = rootNode.getElementsByTagName('textPath');
		if ( map.Scale.oldZoomScale != map.Scale ){
			for ( var i=0; i<nodeA.length;i++ ){
				if ( !nodeA.item(i).parentNode.getAttributeNS(null,"id").match(/:linedecoration/) ){
					nodeA.item(i).parentNode.style.setProperty('display','none',"");
				}
			}
		}

		// init processing, if not yet done
		if ( !map.Label.fAdaptLabelToScalingPending ){
			map.Label.fAdaptLabelToScalingPending = true;
			if ( fAdaptLabelToScaling == 'delayed' ){
				map.pushAction('setTimeout("map.Label.adaptLabelToScaling(null)",1500)');
			}
			else{
				map.pushAction('map.Label.adaptLabelToScaling(null,null)');
			}
		}
	}
};
/**
 * check for overlapping label, and try to correct this by changing the labels position (at the moment only vertically)
 * @param evt the actual event
 * @param rootNode the DOM node to start looking for labels
 */
Map.Layer.prototype.checkLabelOverlapping = function(evt,rootNode){

	if ( fCheckLabelOverlap || fCheckLabelSpace || fCheckLabelSqueeze ){
		if (!rootNode){
			rootNode = map.Layer.layerNode;
		}
		if (!rootNode){
			rootNode = map.Scale.canvasNode;
		}
		map.Label.initCheckOverlap(rootNode);
	}
};
/**
 * hide label to prepare for check overlapping
 * @param evt the actual event
 * @param rootNode the DOM node to start looking for labels
 */
Map.Layer.prototype.prepareCheckOverlap = function(evt,rootNode){

	if ( (fCheckLabelOverlap || fCheckLabelSpace)  ){
		if (!rootNode){
			rootNode = map.Layer.layerNode;
		}
		if (!rootNode){
			rootNode = map.Scale.canvasNode;
		}
		map.Label.prepareCheckOverlap(rootNode);
	}
};
/**
 * add this node to the list of changed features
 * @param featureNode the node to add
 */
Map.Layer.prototype.addChangedFeatureNode = function(featureNode){
	var i;
	if ( this.changedFeatureNodesA ){
		for ( i=0; i<this.changedFeatureNodesA.length; i++){
			if (this.changedFeatureNodesA[i] == featureNode ){
				return;
			}
		}
		_TRACE("addChangedFeatureNode:"+featureNode.getAttributeNS(null,"id"));
		this.changedFeatureNodesA[this.changedFeatureNodesA.length] = featureNode;
	}
};
/**
 * check, if we have changed this layer manually
 * @param szId the id of the theme (layer)
 */
Map.Layer.prototype.isChangedFeature = function(szId){
	var i,k;
	if ( this.changedFeatureNodesA ){
		for ( i=0; i<this.changedFeatureNodesA.length; i++){
			if (map.Tiles.getMasterId(this.changedFeatureNodesA[i].getAttributeNS(null,"id")) == szId ){
				return true;
			}
		}
	}
	return false;
};
/**
 * remove all feature changes from a defined theme (layer); uses the list: changedFeatureNodesA
 * @param szId the id of the theme (layer)
 */
Map.Layer.prototype.removeChangedFeatures = function(szId){
	var i,k;
	if ( this.changedFeatureNodesA ){
		for ( i=0; i<this.changedFeatureNodesA.length; i++){
			if (map.Tiles.getMasterId(this.changedFeatureNodesA[i].getAttributeNS(null,"id")) == szId ){
				_TRACE("removeChangedFeatures["+i+"]("+this.changedFeatureNodesA.length+"):"+this.changedFeatureNodesA[i].getAttributeNS(null,"id"));
				this.changedFeatureNodesA[i].setAttributeNS(null,"style","");
				for ( k=i ; k<this.changedFeatureNodesA.length-1; k++){
					this.changedFeatureNodesA[k] = this.changedFeatureNodesA[k+1];
				}
				this.changedFeatureNodesA.length--;
				i--;
			}
		}
	}
};
/**
 * set pointer events to active layer
 * @param szId layer id
 * @return true if done
 */
Map.Layer.prototype.setPointerEvents = function(szId){
	for ( a in map.Layer.listA ){
		var szName = map.Layer.listA[a].szName;
		if ( szName ){
			var layerObj = SVGDocument.getElementById(szName);
			var szValue = ( szId == null || szId == szName )? null : "none"; 
			if ( layerObj ){
				if (szValue){
					layerObj.style.setProperty("pointer-events",szValue,"");
				}else{
					layerObj.style.removeProperty("pointer-events");
				}
			}
		}
		// TBD in tiles
	}
};
/**
 * get the layer object of the containing layer given the id of one layer item
 * @param szId and arbitrary item id
 * @type {@link Map.Layer.Item}
 * @return a layer object, if defined
 */
Map.Layer.prototype.getLayerObj = function(szId){
	if (!szId){
		return null;
	}
	var szTheme = szId.split('#')[0].split(':')[0];
	if ( szTheme == 'legend' ){
		szTheme = szId.split(':')[2];
	}	
	return this.listA[szTheme];
};
/**
 * get the name of the containing layer given the id of one layer item  
 * @param szId and arbitrary item id
 * @type string
 * @return a layer name, if object is within a layer, or null
 */
Map.Layer.prototype.getLayerName = function(szId){
	var layerObj = this.getLayerObj(szId);
	if ( layerObj ){
		return layerObj.szName;
	}
	return null;
};
/**
 * get the containing layer object of an arbitrary node 
 * @param nodeObj and arbitrary SVG node
 * @type {@link Map.Layer.Item}
 * @return a layer object, if defined, or null
 */
Map.Layer.prototype.getLayerObjOfNode = function(nodeObj){
	if (nodeObj){
		while ( nodeObj.parentNode && nodeObj.parentNode.nodeName != 'SVG' ){
			var layerObj = this.getLayerObj(nodeObj.getAttributeNS(null,"id"));
			if ( layerObj ){
				return  layerObj;
			}
			nodeObj = nodeObj.parentNode;
		}
	}
	return null;
};
/**
 * get the containing layer node of any node 
 * @param nodeObj and arbitrary SVG node
 * @type Dom node
 * @return the shape node, if the given node is part of a layer, or null
 */
Map.Layer.prototype.getLayerItemNodeOfNode = function(nodeObj){
	while ( nodeObj.parentNode && nodeObj.parentNode.nodeName != 'SVG' ){
		var layerObj = this.getLayerObj(nodeObj.getAttributeNS(null,"id"));
		if ( layerObj ){
			return  nodeObj;
		}
		nodeObj = nodeObj.parentNode;
	}
	return null;
};
/**
 * get all shape nodes (on all tiles) of a layer object given an arbitrary node within one shape node
 * @param nodeObj and arbitrary SVG node
 * @type array
 * @return an array of all relevant layer shape nodes
 */
Map.Layer.prototype.getLayerItemNodes = function(nodeObj){
	var layerItemNode = this.getLayerItemNodeOfNode(nodeObj);
	if ( layerItemNode ){
		var szId = layerItemNode.getAttributeNS(null,"id");
		var layerObj = this.getLayerObj(szId);
		if ( ((layerObj.szType == "point") && fTileTextNoClip) || (map.Tiles.getMasterId(szId) == szId) ){
			return new Array(layerItemNode);
		}
		return map.Tiles.getTileNodes(map.Tiles.getMasterId(szId));
	}
	return new Array(0);
};
/**
 * get the class or style attribute of one map node defined by itself or any parent
 * @param nodeObj and arbitrary SVG node
 * @return object with clas and/or style arguments
 */
Map.Layer.prototype.getStyleOrClass = function(nodeObj){
	var retObj = new Object();
	retObj.szClass = map.Dom.getAttributeByNodeOrParents(nodeObj,null,"class");
	retObj.szStyle = map.Dom.getAttributeByNodeOrParents(nodeObj,null,"style");
	return retObj;
};
/**
 * check if the given node is part of the map 
 * @param nodeObj and arbitrary SVG node
 * @type boolean
 * @return true or false
 */
Map.Layer.prototype.isMapObject = function(nodeObj){
	while ( nodeObj ){
		if ( nodeObj == map.Scale.canvasNode ){
			return true;
		}
		nodeObj = nodeObj.parentNode;
	}
	return false;
};
/**
 * check if the given layer is loaded 
 * if tiled, check if at least one tile is loaded 
 * @param nodeObj and arbitrary SVG node
 * @type boolean
 * @return true or false
 */
Map.Layer.prototype.isLoaded = function(szLayer){
	var layerObj = this.getLayerObj(szLayer);
	if ( layerObj ){
		if ( layerObj.szFlag.match(/tiled/) ){
			return map.Tiles.isAnyLayerTileLoaded();
		}else{
			return true;
		}
	}
	return false;
};

// --------------------------------------------------------------------------------- 
// modify tyle strings (class)
// --------------------------------------------------------------------------------- 

/**
 * Create a new Map.CSS instance.  
 * @class It reads the CSS styles of the SVG and realizes CSS style changing functions 
 * @constructor
 * @param styleNodes the DOM node that containes the CSS styles definition
 * @throws 
 * @return A new Map.CSS Object
 */
Map.CSS = function(styleNodes){

	this.stylesA = new Array(0);
	var	szStylesValue = styleNodes.firstChild.nextSibling.nodeValue;

	var szStylesA = szStylesValue.split('}');
	for (var s=0; s<szStylesA.length ;s++ ){
		var szClassName = szStylesA[s].split('{')[0];
		szClassName = szClassName.split('.')[1];
		this.stylesA[szClassName] = __getStyleArray(szStylesA[s].split('{')[1]);
	}
};
/**
 * create the new (changed) CSS style string; this can be set as new value of the DOM node that containes the CSS styles definition
 * @type string
 * @return a style string with all changes (featurescaling, ... )
 */
Map.CSS.prototype.getStyleString = function(){
	var szStyles = "";
	for (a in this.stylesA ){
		szStyles += ' .' + a + '{';
		for ( s in this.stylesA[a] ){
			szStyles += s+':'+ this.stylesA[a][s] + ';';
		}
		szStyles += '}';
	}
	return szStyles;
};
/**
 * set a new value for the given style of a specific class
 * @param szClass name of the CSS class
 * @param szAttribute style attribute to change
 * @param szValue new value to set
 */
Map.CSS.prototype.setStyle = function(szClass,szAttribute,szValue){
	try{
		this.stylesA[szClass][szAttribute] = szValue;
	}
	catch (e){
	}
};

// --------------------------------------------------------------------------------- 
// (helper)
// --------------------------------------------------------------------------------- 

/**
 * adapt one style string to the acual scaling ( nDelta = actual/incremental scaling
 * @param szStylesValue the original style string
 * @param nDelta the factor to change style attributes
 * @type string
 * @return the scaled style string
 */
function __scaleStyleString(szStylesValue,nDelta){
	if ( !szStylesValue || !nDelta ){
		return null;
	}
	var szStylesValuesA = szStylesValue.split(';');
	var styleA = null;
	for ( var i=0; i<szStylesValuesA.length;i++){
		if ( szStylesValuesA[i].match(/stroke-width/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta);
			szStylesValuesA[i] = styleA.join(':');
		}else 
		if ( szStylesValuesA[i].match(/font-size/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta)+'px';
			szStylesValuesA[i] = styleA.join(':');
		}else 
		if ( szStylesValuesA[i].match(/stroke-dashoffset/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta);
			szStylesValuesA[i] = styleA.join(':');
		}else 
		if ( szStylesValuesA[i].match(/stroke-dasharray/) ){
			styleA=szStylesValuesA[i].split(':');
			var dashA = styleA[1].split(',');
			if ( dashA.length > 1 ){
				szStylesValuesA[i] = styleA[0]+':';
				for ( var d=0; d<dashA.length; d++ ){
					dashA[d] = String(parseFloat(dashA[d])*nDelta);
					szStylesValuesA[i] += dashA[d];
					if ( d<dashA.length-1){
						szStylesValuesA[i] += ',';
					}
				}
			}else{
				dashA = styleA[1].split(' ');
				szStylesValuesA[i] = styleA[0]+':';
				for ( var d=0; d<dashA.length; d++ ){
					dashA[d] = String(parseFloat(dashA[d])*nDelta);
					szStylesValuesA[i] += dashA[d];
					if ( d<dashA.length-1){
						szStylesValuesA[i] += ',';
					}
				}
			}
		}
		/**
		if ( 0 && szStylesValuesA[i].match(/baseline-shift/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta);
			szStylesValuesA[i] = styleA[0]+':'+styleA[1];
		}
		**/
	}

	return szStylesValuesA.join(';');
}
/**
 * adapt one style string to the acual scaling ( nDelta = actual/incremental scaling
 * @param szStylesValue the original style string
 * @param nDelta the factor to change style attributes
 * @type string
 * @return the scaled style string
 */
function __scaleLineStyleString(szStylesValue,nDelta){
	if ( !szStylesValue || !nDelta ){
		return null;
	}
	var szStylesValuesA = szStylesValue.split(';');
	var styleA = null;
	for ( var i=0; i<szStylesValuesA.length;i++){
		if ( szStylesValuesA[i].match(/stroke-width/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta);
			szStylesValuesA[i] = styleA.join(':');
		}else 
		if ( szStylesValuesA[i].match(/stroke-dashoffset/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta);
			szStylesValuesA[i] = styleA.join(':');
		}else 
		if ( szStylesValuesA[i].match(/stroke-dasharray/) ){
			styleA=szStylesValuesA[i].split(':');
			var dashA = styleA[1].split(',');
			if ( dashA.length > 1 ){
				szStylesValuesA[i] = styleA[0]+':';
				for ( var d=0; d<dashA.length; d++ ){
					dashA[d] = String(parseFloat(dashA[d])*nDelta);
					szStylesValuesA[i] += dashA[d];
					if ( d<dashA.length-1){
						szStylesValuesA[i] += ',';
					}
				}
			}else{
				dashA = styleA[1].split(' ');
				szStylesValuesA[i] = styleA[0]+':';
				for ( var d=0; d<dashA.length; d++ ){
					dashA[d] = String(parseFloat(dashA[d])*nDelta);
					szStylesValuesA[i] += dashA[d];
					if ( d<dashA.length-1){
						szStylesValuesA[i] += ',';
					}
				}
			}
		}
	}
	return szStylesValuesA.join(';');
}
/**
 * adapt one text style string to the acual scaling ( nDelta = actual/incremental scaling
 * @param szStylesValue the original style string
 * @param nDelta the factor to change style attributes
 * @type string
 * @return the scaled style string
 */
function __scaleTextStyleString(szStylesValue,nDelta){
	if ( !szStylesValue || !nDelta ){
		return null;
	}
	var szStylesValuesA = szStylesValue.split(';');
	var styleA = null;
	for ( var i=0; i<szStylesValuesA.length;i++){
		if ( szStylesValuesA[i].match(/font-size/)){
			styleA=szStylesValuesA[i].split(':');
			styleA[1] = String(parseFloat(styleA[1])*nDelta)+'px';
			szStylesValuesA[i] = styleA.join(':');
		} 
	}
	return szStylesValuesA.join(';');
}
/**
 * get the font height for a text style string
 * @param szStylesValue the original style string
 * @type float
 * @return the text height
 */
function __getFontHeightfromStyleString(szStyle){
	if ( !szStyle ){
		return -1;
	}
	var szStyleA = szStyle.split(';');
	for ( var i=0; i<szStyleA.length;i++){
		if ( szStyleA[i].match(/font-size/) ){
			styleA=szStyleA[i].split(':');
			return parseFloat(styleA[1]);
		} 
	}
	return -1;
}

// .............................................................................
// v i e w p o r t            
// .............................................................................

/**
 * Create a new Map.Viewport instance.  
 * @class It realizes an object to place the map anto the SVG canvas
 * <ul>
 * <li>It initializes the map display area within the SVG document and, if wished, draws a frame around.</li>
 * <li>This frame can be generated also in form of panning buttons.</li>
 * <li>The parametration is done by map.setFeatures();</li> 
 * </ul>
 * @constructor
 * @throws 
 * @param evt the actual event
 * @return A new Map.Viewport Object
 */
Map.Viewport = function(evt){
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;

	if (map.Scale.metadataNode){
		/** holds metadata information of alignments */
		this.alignmentNode	= map.Scale.metadataNode.getElementsByTagNameNS(szMapNs,"alignments").item(0);
		/** holds the alignment definition for new popup windows */
		this.szPopupAlignment = this.alignmentNode?this.alignmentNode.getAttributeNS(null,"popupwindow"):"";
		this.szPopupAlignment = szLocalPopupAlignment?szLocalPopupAlignment:this.szPopupAlignment;
	}

	// GR 26.09.2007 set background color of map
	this.eventRect = SVGDocument.getElementById("mapbackground:eventrect");
	if (this.eventRect){
		if ( szMapBackgroundStyle ){
			this.eventRect.setAttributeNS(null,"style",szMapBackgroundStyle+";pointer-events:all");
		}
		if ( szMapBackgroundColor ){
			this.eventRect.setAttributeNS(null,"style","fill:"+szMapBackgroundColor+";opacity:1;pointer-events:all");
		}
		if ( 0 && fTransparentMap ){
			this.largeeventRect = SVGDocument.getElementById("mapbackground:largeeventrect");
			this.eventRect.style.setProperty("pointer-events","none","");
			this.largeeventRect.style.setProperty("pointer-events","none","");

		}
	}

	this.clipToolsGroup();

	this.createPanBorder();

	this.createNorthArrow();

	return true;
};
Map.Viewport.prototype = new Map();

/**
 * refresh map viewport (after resize)
 */
Map.Viewport.prototype.reformat = function (){
	this.clipToolsGroup();
	this.createPanBorder();
	this.createNorthArrow();
};
/**
 * clip the tools group (zoom/select rect ...) to the map size 
 */
Map.Viewport.prototype.clipToolsGroup = function (){
	map.Dom.setClipRect(SVGToolsGroup,new box( map.Scale.mapPosition.x+map.Scale.normalX(nMapBorderWidth)
											  ,map.Scale.mapPosition.y+map.Scale.normalY(nMapBorderWidth)
											  ,map.Scale.bBox.width-map.Scale.normalX(nMapBorderWidth)*2
											  ,map.Scale.bBox.height-map.Scale.normalY(nMapBorderWidth)*2));

	this.widgetBox  = new box( map.Scale.mapPosition.x+map.Scale.normalX(nMapBorderWidth)
							  ,map.Scale.mapPosition.y+map.Scale.normalY(nMapBorderWidth+nToolMarginTop)
							  ,map.Scale.bBox.width-map.Scale.normalX(nMapBorderWidth)*2
							  ,map.Scale.bBox.height-map.Scale.normalY(nMapBorderWidth)*2);
};
/**
 * create the panning buttons of the viewport map frame 
 */
Map.Viewport.prototype.createPanBorder = function (){
	var SVGDoc = SVGDocument;
	if ( fMapBorder ){
		var widgetGroup  = SVGDoc.getElementById("widgets:antizoomandpan");
		if ( widgetGroup ){
			var szFill = szMapBorderColor;
			var nWidth = map.Scale.normalX(nMapBorderWidth);

			var borderGroup = SVGDoc.getElementById("mapBorderClipCover");
			if (borderGroup){
				borderGroup.parentNode.removeChild(borderGroup);
			}
			var newGroup = map.Dom.newGroup(widgetGroup,"mapBorderClipCover");
			newGroup.setAttributeNS(null,"style","fill:white;opacity:1.0");
			widgetGroup.insertBefore(newGroup,widgetGroup.firstChild);

			map.Dom.newShape('rect',newGroup,0
											,0
											,map.Scale.mapPosition.x
											,map.Scale.viewBox.height
											,"");
			map.Dom.newShape('rect',newGroup,0
											,0
											,map.Scale.viewBox.width+10000
											,map.Scale.mapPosition.y
											,"");
			map.Dom.newShape('rect',newGroup,0
											,map.Scale.mapPosition.y+map.Scale.bBox.height
											,map.Scale.viewBox.width+10000
											,map.Scale.viewBox.height-(map.Scale.mapPosition.y+map.Scale.bBox.height)+10000
											,"");
			map.Dom.newShape('rect',newGroup,map.Scale.mapPosition.x+map.Scale.bBox.width
											,0
											,map.Scale.viewBox.width-(map.Scale.mapPosition.x+map.Scale.bBox.width)+10000
											,map.Scale.bBox.height
											,"");

			borderGroup = SVGDoc.getElementById("mapBorder");
			if (borderGroup){
				borderGroup.parentNode.removeChild(borderGroup);
			}
			newGroup = map.Dom.newGroup(widgetGroup,"mapBorder");

			if( fMapBorder3D && map.Scale.mapPosition.x ){
				szFill = "#ffffff";
				widgetGroup.insertBefore(newGroup,widgetGroup.firstChild);
				// newGroup.setAttributeNS(null,"style","filter:url(#DropShadowFilterTools:antizoomandpan)");
				newGroup.fu.setPosition(0,0);
				// top, bottom, left, right
				var nWidth = map.Scale.normalX(250);
				var nForceVisibility = map.Scale.normalX(-3);
				var newShape = null;
				newShape = map.Dom.newShape('rect',newGroup,map.Scale.mapPosition.x,map.Scale.mapPosition.y-nWidth+nForceVisibility,map.Scale.bBox.width,nWidth,"fill:"+szFill+";opacity:0.5");
				newShape.setAttributeNS(null,"style","filter:url(#DropShadowFilterTools:antizoomandpan)");
				newShape = map.Dom.newShape('rect',newGroup,0,map.Scale.mapPosition.y+map.Scale.bBox.height-nForceVisibility,map.Scale.mapPosition.x+map.Scale.bBox.width,nWidth,"fill:"+szFill+";opacity:0.5");
				newShape.setAttributeNS(null,"style","filter:url(#DropShadowFilterTools:antizoomandpan)");
				newShape = map.Dom.newShape('rect',newGroup,0,0,map.Scale.mapPosition.x,map.Scale.mapPosition.y+map.Scale.bBox.height,"fill:"+szFill+";opacity:0.5");
				newShape.setAttributeNS(null,"style","filter:url(#DropShadowFilterTools:antizoomandpan)");
				newShape = map.Dom.newShape('rect',newGroup,map.Scale.mapPosition.x+map.Scale.bBox.width-nForceVisibility,0,nWidth,map.Scale.mapPosition.y+map.Scale.bBox.height,"fill:"+szFill+";opacity:0.5");
				newShape.setAttributeNS(null,"style","filter:url(#DropShadowFilterTools:antizoomandpan)");
			}
			else{
				newGroup.setAttributeNS(null,"transform","matrix(1 0 0 1 "+ map.Scale.mapPosition.x +" "+ map.Scale.mapPosition.y +")");
				map.Dom.newShape('rect',newGroup,0,0,map.Scale.bBox.width,nWidth,"fill:"+szFill+";opacity:1.0");
				map.Dom.newShape('rect',newGroup,0,map.Scale.bBox.height-nWidth,map.Scale.bBox.width,nWidth,"fill:"+szFill+";opacity:1.0");
				map.Dom.newShape('rect',newGroup,0,0,nWidth,map.Scale.bBox.height,"fill:"+szFill+";opacity:1.0");
				map.Dom.newShape('rect',newGroup,map.Scale.bBox.width-nWidth,0,nWidth,map.Scale.bBox.height,"fill:"+szFill+";opacity:1.0");
				if ( nMapBorderWidth > 2 ){
					var szStyle = szMapPanBorderStyle+";stroke-width:"+map.Scale.normalX(1)+";opacity:1.0";
					var szOnoverStyle = szMapPanBorderOnoverStyle+";stroke-width:"+map.Scale.normalX(1)+";opacity:1.0";
					var panButton = null;
					var bBox = map.Scale.bBox;
					var nCorner = bBox.width/10;
					var nPan = bBox.width/3/+map.Scale.normalX(1);
					panButton = map.Dom.newShape('rect',newGroup,nCorner,0,bBox.width-nCorner*2,nWidth,szStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap(0,"+(nPan)+")");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton = map.Dom.newShape('rect',newGroup,nCorner,bBox.height-nWidth-1,bBox.width-nCorner*2,nWidth,szStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap(0,"+(-nPan)+")");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton = map.Dom.newShape('rect',newGroup,0,nCorner,nWidth,bBox.height-nCorner*2,szStyle);
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(nPan)+",0)");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton = map.Dom.newShape('rect',newGroup,bBox.width-nWidth-1,nCorner,nWidth,bBox.height-nCorner*2,szStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(-nPan)+",0)");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton = map.Dom.newShape('path',newGroup,'M'+0+','+0+' l '+nCorner+','+0+' '+0+','+nWidth+' '+(-(nCorner-nWidth))+','+0+' '+0+','+(nCorner-nWidth)+' '+(-nWidth)+','+0+' z',szStyle);
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(nPan)+","+(nPan)+")");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton = map.Dom.newShape('path',newGroup,'M'+bBox.width+','+bBox.height+' l '+(-nCorner)+','+0+' '+0+','+(-nWidth)+' '+((nCorner-nWidth))+','+0+' '+0+','+(-(nCorner-nWidth))+' '+(nWidth)+','+0+' z',szStyle);
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(-nPan)+","+(-nPan)+")");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton = map.Dom.newShape('path',newGroup,'M'+bBox.width+','+0+' l '+(-nCorner)+','+0+' '+0+','+nWidth+' '+((nCorner-nWidth))+','+0+' '+0+','+(nCorner-nWidth)+' '+(nWidth)+','+0+' z',szStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(-nPan)+","+(nPan)+")");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton = map.Dom.newShape('path',newGroup,'M'+0+','+bBox.height+' l '+nCorner+','+0+' '+0+','+(-nWidth)+' '+(-(nCorner-nWidth))+','+0+' '+0+','+(-(nCorner-nWidth))+' '+(-nWidth)+','+0+' z',szStyle);
					panButton.setAttributeNS(null,"onclick","map.Viewport.doPanMap("+(nPan)+","+(-nPan)+")");
					panButton.setAttributeNS(szMapNs,"tooltip","pan");
					panButton.setAttributeNS(szMapNs,"onoverstyle",szOnoverStyle);
				}
			}
		}
	}
};
/**
 * executes the panning buttons of the viewport map frame 
 * @param nDeltyX the x panning amount in pixel
 * @param nDeltyY the y panning amount in pixel
 */
Map.Viewport.prototype.doPanMap = function (nDeltaX,nDeltaY){
	executeWithMessage("map.Viewport.panMap("+nDeltaX+","+nDeltaY+")","please wait ...",100);
};
/**
 * helper for the execution of the panning buttons; needed to get a message displayed  
 * @param nDeltyX the x panning amount in pixel
 * @param nDeltyY the y panning amount in pixel
 */
Map.Viewport.prototype.panMap = function (nDeltaX,nDeltaY){
	map.Zoom.setNewPan(nDeltaX,nDeltaY);
	map.Event.doDefaultZoom(null);
};
/**
 * set the map background color
 * @param szColor the new background color
 */
Map.Viewport.prototype.setBackgroundColor = function(szColor){
	if (this.eventRect){
		this.eventRect.setAttributeNS(null,"style","fill:"+szColor+";opacity:1;pointer-events:all");
	}
};
/**
 * toggle the border to pan the map 
 */
Map.Viewport.prototype.togglePanBorder = function(){
	var SVGDoc = SVGDocument;
	var borderGroup = SVGDoc.getElementById("mapBorder");
	if (borderGroup){
		borderGroup.parentNode.removeChild(borderGroup);
	}
	else{
		map.Viewport.createPanBorder();
	}
};
/**
 * create the north arrow rotation slider
 */
Map.Viewport.prototype.createNorthArrow = function (){

	if (!fNorthArrow){
		return;
		}
	var SVGDoc = SVGDocument;
	var widgetGroup  = SVGDoc.getElementById("widgets:antizoomandpan");
	if ( widgetGroup ){
		var szVisible = "none";
		if (this.northGroup){
			szVisible = this.northGroup.style.getPropertyValue("display");
			this.northGroup.parentNode.removeChild(this.northGroup);
		}
		this.northGroup = map.Dom.newGroup(widgetGroup,"mapNorthArrow");
		if ( szVisible ) {
			this.northGroup.style.setProperty("display",szVisible);
		}	

		if ( szNorthArrowPosition == "TOP" ){
			this.northGroup.fu.setPosition(	this.widgetBox.x+this.widgetBox.width-map.Scale.normalX(75)
											,map.Scale.normalX(45+nToolMarginTop));
		}else{
			this.northGroup.fu.setPosition(	 this.widgetBox.x+this.widgetBox.width-map.Scale.normalX(75)
											,this.widgetBox.y+map.Scale.normalX((this.widgetBox.y?50:60)+nToolMarginTop));
		}

		var nHeight = map.Scale.normalY(30);
		var nWidth  = map.Scale.normalY(12);
		map.Dom.newShape('circle',this.northGroup,0,0,nHeight,"fill:white;opacity:0.2");

		map.Dom.newShape('path',this.northGroup,'M'+0+','+(-nHeight/2)+' l '+nWidth/2+','+nHeight*1.2+' '+(-nWidth/2)+','+(-nHeight/5)+' '+(-nWidth/2)+','+(nHeight/5)+' z','fill:#444444;stroke:#ffffff;stroke-width:'+map.Scale.normalX(0.4)+';');
		map.Dom.newText(this.northGroup,map.Scale.normalX(-5),map.Scale.normalY(-19),"font-family:arial;font-size:"+map.Scale.normalX(12)+"px;font-weight:bold;fill:#444444;stroke:white;stroke-width:0.2;pointer-events:none","N");
		map.Dom.newShape('rect',this.northGroup,-nWidth/2,-nHeight,nWidth,nHeight,"fill:green;opacity:0.0");
		
		if ( fNorthArrow == "rotatable" ){
			// GR 11.11.2010 
			this.northGroup.setAttributeNS(null,"cursor","pointer");
			this.northGroup.setAttributeNS(szMapNs,"tooltip",map.Dictionary.getLocalText("click to move it"));
			this.northArrowObj = new RotationSlider(this.northGroup,100,"0,360","1",90,9);
			if ( this.northArrowObj ){
				this.northArrowObj.parent = this;
			}
		}

		// GR 16.03.2012 zoom buttons below north arrow
		var zoomIn = new Button(this.northGroup,"mapNorthArrow:zoomin","BUTTON",'#plus_button1'
									,"map.Zoom.doZoomMap(2)"
									,""
									,"zoom in");
		zoomIn.setPosition(map.Scale.normalY(0),map.Scale.normalY(40));
		zoomIn.scale(1.3,1.3);
		zoomIn.nodeObj.style.setProperty("fill-opacity","0.5","");
		var zoomOut = new Button(this.northGroup,"mapNorthArrow:zoomout","BUTTON",'#minus_button1'
									,"map.Zoom.doZoomMap(0.5)"
									,""
									,"zoom out");
		zoomOut.setPosition(map.Scale.normalY(0),map.Scale.normalY(40+nNormalButtonSize*2));
		zoomOut.scale(1.3,1.3);
		zoomOut.nodeObj.style.setProperty("fill-opacity","0.5","");
	}
};
Map.Viewport.prototype.onClick = function(evt){
	if ( this.northArrowObj ){
		executeWithMessage("map.Scale.setRotation(null,"+0+")","...");
	}
};
Map.Viewport.prototype.onMouseUp = function(evt){
	if ( this.northArrowObj && !fRotateOnMouseMove ){
		executeWithMessage("map.Scale.setRotation(null,"+this.northArrowObj.getAngle()+")","...");
	}
};
Map.Viewport.prototype.onMouseMove = function(evt){
	if ( this.northArrowObj && fRotateOnMouseMove ){
		var newAngle = this.northArrowObj.getAngle();
		if ( newAngle != this.nAngle ){
			map.Scale.setRotation(null,newAngle);
			this.nAngle = newAngle;
		}
	}
};
Map.Viewport.prototype.showNorthArrow = function (){
	if ( this.northGroup ){
		this.northGroup.style.setProperty("display","inline","");
	}
};
Map.Viewport.prototype.hideNorthArrow = function (){
	if ( this.northGroup && (this.northGroup.style.getPropertyValue("display") != "none") ){
		this.northGroup.style.setProperty("display","none","");
		if ( this.northArrowObj ){
			executeWithMessage("map.Scale.setRotation(null,"+0+")","...");
		}
	}
};
/**
 * clip the map
 */
Map.Viewport.prototype.clipMap = function (newWidth){
	var clipRect = SVGDocument.getElementById("mapcliprect");
	if (clipRect){
		clipRect.setAttributeNS(null,"width",map.Scale.normalX(newWidth));
	}
};
/**
 * clip a layer
 */
Map.Viewport.prototype.clipLayer = function (szName,newWidth){

	if ( !szName ){
		szName = _activeTheme;
	}
	var layerObj = SVGDocument.getElementById(szName);
	var layerObjV = SVGDocument.getElementById(szName+":values");

	if ( typeof(this.lastClippedLayer) != "undefined" && (this.lastClippedLayer != layerObj) ){
		map.Dom.setClipRect(this.lastClippedLayer,new box(-map.Scale.mapOffset.x,-map.Scale.mapOffset.y,map.Scale.bBox.width,map.Scale.bBox.height));
		this.lastClippedLayer = null;
	}
	if ( typeof(this.lastClippedLayerV) != "undefined" && (this.lastClippedLayerV != layerObjV) ){
		map.Dom.setClipRect(this.lastClippedLayerV,new box(-map.Scale.mapOffset.x,-map.Scale.mapOffset.y,map.Scale.bBox.width,map.Scale.bBox.height));
		this.lastClippedLayerV = null;
	}
	if (layerObj){
		map.Dom.setClipRect(layerObj,new box(-map.Scale.mapOffset.x,-map.Scale.mapOffset.y,map.Scale.normalX(newWidth),map.Scale.bBox.height));
		this.lastClippedLayer = layerObj;
	}
	if (layerObjV){
		map.Dom.setClipRect(layerObjV,new box(-map.Scale.mapOffset.x,-map.Scale.mapOffset.y,map.Scale.normalX(newWidth),map.Scale.bBox.height));
		this.lastClippedLayerV = layerObjV;
	}
};

var __idSetRotationTimeout = null;
var __nOldAngle = 0;
function __setRotation(evt,nAngle){
	if ( nAngle == __nOldAngle ){
		return;
	}
	__nOldAngle = nAngle;
	if (__idSetRotationTimeout){
		clearTimeout(__idSetRotationTimeout);
	}
	__idSetRotationTimeout = setTimeout("__doSetRotation("+nAngle+")",200);
}
function __doSetRotation(nAngle){
	executeWithMessage("map.Scale.setRotation(null,"+nAngle+")","...");
	__idSetRotationTimeout = null;
}


// .................................................................... 
// adobe viewer zoom handler
// - prevent special Group(s) from zoom and pan
// - change map scaling 
// .................................................................... 

/**
 * Create a new AntiZoomAndPan instance.  
 * @class It realizes a list of groups, that shall not appear zoomed or panned; everytime, a zoom or pan is performed, this groups will be transformed in an adequate way, to keep their zooming and position.
 * @constructor
 * @throws 
 * @return A new AntiZoomAndPan list
 */
function AntiZoomAndPan(evt) {
	
	_TRACE("--- init antizoomandpan");

	/** the list of all SVG groups with 'antizoomandpan' property; they will be retransformed on zoom and pan  @type array */
	this.listA				= new Array(0);
	this.buildList(evt);

}
/**
 * create a new entry in the antizoomandpan list
 * @param nodeGroup the DOm node of the group
 */
AntiZoomAndPan.prototype.addGroup = function(nodeGroup){
	this.listA[this.listA.length] = nodeGroup;
};
/**
 * build the antizoomandpan list from the SVGRootElement on.
 * <br>add any group, who's id matches /antizoomandpan/
 * @param evt the actual event
 */
AntiZoomAndPan.prototype.buildList = function(evt){
	var childNodesA = SVGRootElement.childNodes;
	for (var i=0; i<childNodesA.length;i++ ){
		try{
			if ( childNodesA.item(i).nodeType == '1' && childNodesA.item(i).getAttributeNS(null,'id').match(/antizoomandpan/) ){
				this.addGroup(childNodesA.item(i));
			}
		}
		catch (e){
		}
	}
};
/**
 * check if an SVG element is or is contained in an antizoomandpan group 
 * @param nodeGroup the DOM node of the element
 * @type boolean
 * @return true, if is contained in antizoomandpan group
 */
AntiZoomAndPan.prototype.isContained = function(nodeGroup){
	while (nodeGroup){
		if (this.checkGroup(nodeGroup)){
			return true;
		}
		nodeGroup = nodeGroup.parentNode;
	}
	return false;
};
/**
 * check if an SVG group is within the antizoomandpan list 
 * @param nodeGroup the DOM node of the group
 * @type boolean
 * @return true, if group is in antizoomandpan list
 */
AntiZoomAndPan.prototype.checkGroup = function(nodeGroup){
	for ( var i=0; i<this.listA.length; i++ ){	
		if ( nodeGroup == this.listA[i] ){
			return true;
		}
	}
	return false;
};
/**
 * retransform the groups within the antizoomandpan list after a zooming or panning event
 * @param evt the actual event
 */
AntiZoomAndPan.prototype.adjustGroups = function(evt){
	if (!fAntiZoomAndPan){
		return;
	}
	var viewBox     = SVGRootElement.getAttribute('viewBox').split(' ');
	var origViewBox = SVGOrigViewBoxString.split(' ');
	var viewBoxScale = Number(origViewBox[2])/Number(viewBox[2]); 
	var matrixA;
	for ( var i=0; i<this.listA.length; i++ ){	
		var nodeGroup = this.listA[i];
		if ( (matrixA = getMatrix(nodeGroup)) ){
			matrixA[0] = 1/SVGRootElement.currentScale/viewBoxScale;
			matrixA[3] = 1/SVGRootElement.currentScale/viewBoxScale;	
		 	matrixA[4] = map.Scale.scaleX(-SVGRootElement.currentTranslate.x)+Number(viewBox[0]);
			matrixA[5] = map.Scale.scaleY(-SVGRootElement.currentTranslate.y)+Number(viewBox[1]);
			setMatrix(nodeGroup,matrixA);
		}
	}
	_TRACE("@ AntiZoomAndPan.adjustGroups: done");
};
/**
 * get the actual correction matrix of the AntiZoomAndPan groups
 * @param evt the actual event
 * @type array
 * @return the matrix
 */
AntiZoomAndPan.prototype.getActualMatrix = function(evt){
	var nodeGroup = this.listA[0];
	return getMatrix(nodeGroup);
};
/**
 * switches the the groups within the antizoomandpan list (tools,...) on/off; used in fast panning mode
 * @param evt the actual event
 * @param state the new display attribute value
 */
AntiZoomAndPan.prototype.setDisplay = function(evt,state){
	for ( var i=0; i<this.listA.length; i++ ){	
		var nodeGroup = this.listA[i];
		nodeGroup.style.setProperty("display",state,"");
	}
};

/**
 * clones the fill pattern for use within the legend (antizoomandpan)
 * @param evt the event
 * @param rootNode the dom node to start the recursive search for childs 
 */
AntiZoomAndPan.prototype.initAntiZoomPattern = function(evt,rootNode){

	if (rootNode == null){
		rootNode = SVGDocument;
	}
	if (evt){
		rootNode = evt.target.ownerDocument;
	}

	// clone pattern
	var nodeA = rootNode.getElementsByTagName('pattern');
	if (nodeA == null || nodeA.length == 0 ){
		return;
	}
	var nMaxP = nodeA.length;
	var patternNodes = nodeA.item(0).parentNode;
	var newPattern;
	for ( var p=0; p<nMaxP;p++){
		if (!nodeA.item(p).getAttributeNS(null,"id").match(/antizoomandpan/)){
			newPattern = nodeA.item(p).cloneNode(1000);
			newPattern.setAttributeNS(null,"id",newPattern.getAttributeNS(null,"id") + ":antizoomandpan");
			patternNodes.appendChild(newPattern);
		}
	}
	patternNodes.parentNode.appendChild(patternNodes);
};

/**
 * clones the fill pattern for use within the legend (antizoomandpan)
 * @param evt the event
 * @param rootNode the dom node to start the recursive search for childs 
 */
AntiZoomAndPan.prototype.initAntiZoomSymbols = function(evt,rootNode){

	if (rootNode == null){
		return;
	}
	// clone pattern
	var nodeA = rootNode.getElementsByTagName('g');
	if (nodeA == null || nodeA.length == 0 ){
		return;
	}
	var nMaxP = nodeA.length;
	var symbolNodes = nodeA.item(0).parentNode;
	var newSymbol;
	for ( var p=0; p<nMaxP;p++){
		var szId = nodeA.item(p).getAttributeNS(null,"id");
		if ( szId && szId.length && szId.match(/symbol/) && !szId.match(/antizoomandpan/)){
			newSymbol = nodeA.item(p).cloneNode(1000);
			newSymbol.setAttributeNS(null,"id",szId + ":antizoomandpan");
			symbolNodes.appendChild(newSymbol);
		}
	}
	symbolNodes.parentNode.appendChild(symbolNodes);
};

/**
 * exetends the url references of all fill properties to link to antizoomandpan pattern clones
 * @param evt the event
 * @param objNode the dom node to start the recursive search for childs 
 * @param szExtend the text to add to all url definitions within style attributes; sample: fill:url(#pattern) --> fill:url(#pattern:antizoomandpan) 
 */
AntiZoomAndPan.prototype.extendAllPatternStyles = function(evt,objNode,szExtend){
	if ( objNode && objNode.nodeType == 1 ){
		var szFill = objNode.style.getPropertyValue("fill");
		if (szFill && szFill.length>1 && szFill.match(/url/) ){
			var idA = szFill.split(')');
			szFill = idA[0]+szExtend+")";
			objNode.style.setProperty("fill",szFill,"");
		}
	}
};
/**
 * clones the style definitions for use within the legend (antizoomandpan)
 * @param evt the event
 */
AntiZoomAndPan.prototype.initAntiZoomStyles = function(evt){
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	var legendNode = SVGDocument.getElementById("widgets:antizoomandpan");
	this.extendAllPatternStyles(evt,legendNode,":antizoomandpan");
};

// .............................................................................
// t i l e s          
// .............................................................................


// .............................................................................
// z o o m      
// .............................................................................

/**
 * Create a new Map.Zoom instance.  
 * @class It realizes an object for defining and executing zoomin actions
 * @constructor
 * @throws 
 * @return A new Map.Zoom Object
 */
Map.Zoom = function(nZoom) {

	_TRACE("--- init zoom");

	/** the SVG node, that realises the internal map coordinate offset @type DOM node */
	this.canvasNode = SVGDocument.getElementById("mapcanvas");
	/** the SVG node, that realises the map zooming and panning @type DOM node */
	this.zoomNode   = SVGDocument.getElementById("mapzoomandpan");
	/** the actual zooming factor (&gt;= 1) @type double */
	this.nZoom = 1;
	/** the actual zooming factor for X axis */
	this.nZoomX = 1;
	/** the actual zooming factor for Y axis */
	this.nZoomY = 1;
	/** if != null, it containes a zooming factor to set by {@link #execute} @type double */
	this.doZoom = null;
	/** if != null, it containes an area (box object) to zoom to by {@link #execute} @type box */
	this.doArea = null;
	/** if != null, it containes a new (point object) to center the map by {@link #execute} @type point */
	this.doCenter = null;
	/** flag to note if any map area has been set, the map has been initialized  */
	this.fAreaSet = false;
	if ( nZoom && (nZoom > 1) ){
		this.doExecuteZoomMap(nZoom,1);
	}
};
Map.Zoom.prototype = new Map();

/**
 * init map zoom and pan
 */
Map.Zoom.prototype.init = function(){
	if (map.Scale.initZoomNode){
		_TRACE("map.Scale.initZoomNode");
		var minBoundX  = Number(map.Scale.initZoomNode.getAttribute('MinBoundX'));
		var maxBoundX  = Number(map.Scale.initZoomNode.getAttribute('MaxBoundX'));
		var minBoundY  = Number(map.Scale.initZoomNode.getAttribute('MinBoundY'));
		var maxBoundY  = Number(map.Scale.initZoomNode.getAttribute('MaxBoundY'));
		//	GR 09.10.2011 new degree
		if ( map.Scale.initZoomNode.getAttribute('units') == "degree" ){
			this.doZoomMapToGeoBounds(minBoundY,minBoundX,maxBoundY,maxBoundX);
		}else{
			this.Zoom.doZoomMapToEnvelope(minBoundX,maxBoundX,minBoundY,maxBoundY);
		}
	}
};
/**
 * resets zoom
 */
Map.Zoom.prototype.toFullExtend = function(){
//	displayMessage("please wait ...");
	setTimeout("map.Zoom.reset()",100);
};
/**
 * sets a new zoom
 * @param newZoom zoom factor to set (&gt;=1)
 */
Map.Zoom.prototype.setNewZoom = function(newZoom){
	this.doZoom = newZoom;
//	displayMessage("please wait ...");
//	setTimeout("map.Zoom.execute()",500);
	map.Zoom.execute();
};
/**
 * executes a new pan
 * @param nDeltaX relative x position change
 * @param nDeltaY relative y position change
 */
Map.Zoom.prototype.setNewPan = function(nDeltaX,nDeltaY){
	this.doPanMap(nDeltaX,nDeltaY);
};
/**
 * sets a new area
 * @param newArea box with SVG coordinates to zoom to
 */
Map.Zoom.prototype.setNewArea = function(newArea){
	this.fAreaSet = true;
	if ( !this.doSetAreaByParentMap(newArea) ){
		this.doArea = new box(newArea.x,newArea.y,newArea.width,newArea.height);
		map.Zoom.execute();
	}
};
/**
 * sets a new center
 * @param newArea box with SVG coordinates to center to
 */
Map.Zoom.prototype.setNewCenter = function(newArea){
	if ( !this.doCenterByParentMap(newArea) ){
		this.doCenter = new box(newArea.x,newArea.y,newArea.width,newArea.height);
		map.Zoom.execute();
	}
};
/**
 * executes stacked zooming operations (is called onTimeout()) 
 */
Map.Zoom.prototype.execute = function(){

	if (this.doZoom){
		this.doExecuteZoomMap(this.doZoom,this.nZoom);
		this.nZoom = this.doZoom;
		this.doZoom = null;
	}
	if (this.doArea){
		this.doZoomMapToArea(this.doArea);
		this.doArea = null;
	}
	if (this.doCenter){
		this.doCenterMapToArea(this.doCenter);
		this.doCenter = null;
	}

	if(SVGPopupGroup){
		SVGPopupGroup.fu.clear();
	}
};
/**
 * cancel executing
 */
Map.Zoom.prototype.cancel = function(){

	this.doZoom = null;
	this.doArea = null;
	this.doCenter = null;
};
/**
 * reset map zooming
 */
Map.Zoom.prototype.reset = function(){
	this.zoomNode.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
	SVGRootElement.currentTranslate.x = 0;
	SVGRootElement.currentTranslate.y = 0;
	this.nZoom = 1;
	map.Event.doDefaultZoom(null);
	clearMessage(100);
};
/**
 * query map zoom and pan as box in svg coordinates 
 * @type box
 * @return a box object with x,y,width,height in SVG coordinates
 */
Map.Zoom.prototype.getBox = function(){

	var canvasMatrixA = getMatrix(this.canvasNode);
	var zoomMatrixA = getMatrix(this.zoomNode);
	var xOff = -canvasMatrixA[4]/this.nZoomX;
	var yOff = -canvasMatrixA[5]/this.nZoomY;

	// GR 15.11.2007 respect canvas rotation  
	// var pRotated = map.Scale.rotatePoint(new point(zoomMatrixA[4],zoomMatrixA[5]),-1);
	// zoomMatrixA[4] = pRotated.x;
	// zoomMatrixA[5] = pRotated.y;

	xOff -= (map.Scale.normalX(SVGRootElement.currentTranslate.x) + zoomMatrixA[4]) / this.nZoomX;
	yOff -= (map.Scale.normalY(SVGRootElement.currentTranslate.y) + zoomMatrixA[5]) / this.nZoomY;
	return new box(xOff,yOff,map.Scale.bBox.width/this.nZoomX,map.Scale.bBox.height/this.nZoomY);
};
/**
 * query map zoom and pan as envelope 
 * @type array
 * @return an array of 2 point objects with the min and max coordinates
 */
Map.Zoom.prototype.getEnvelope = function(){

	var rectArea = this.getBox();
	var pt1 = map.Scale.getMapCoordinate(rectArea.x,rectArea.y);
	var pt2 = map.Scale.getMapCoordinate(rectArea.x+rectArea.width,rectArea.y+rectArea.height);
	return new Array(pt1,pt2);
};
/**
 * query map zoom and pan as envelope string
 * @type string
 * @return a string of the type "MinBoundX='1234.123 ..."
 */
Map.Zoom.prototype.getEnvelopeString = function(){

	var ptEnvelopeA = this.getEnvelope();
	return String("MinBoundX='"+ptEnvelopeA[0].x+"' MaxBoundX='"+ptEnvelopeA[1].x+"' MinBoundY='"+ptEnvelopeA[1].y+"' MaxBoundY='"+ptEnvelopeA[0].y+"'");
};
/**
 * query map zoom and pan as box in fraction values. Usefull to actualize the overwievmap  
 * @type box
 * @return a box object with actual zoom and pan defined as follows: 
 * <ul>
 * <li>x,y = pan position from 0...1 (0.5 = central position)</li>
 * <li>width,height = visible portion from 0...1 (1 = full extent)</li> 
 * </ul>
 */
Map.Zoom.prototype.getFractionBox = function(){

	var zoomMatrixA = getMatrix(this.zoomNode);
	// GR 15.11.2007 respect canvas rotation  
	var pRotated = map.Scale.rotatePoint(new point(zoomMatrixA[4],zoomMatrixA[5]),-1);
	zoomMatrixA[4] = pRotated.x;
	zoomMatrixA[5] = pRotated.y;
	xOff = (map.Scale.normalX(SVGRootElement.currentTranslate.x) + zoomMatrixA[4]) / this.nZoomX;
	yOff = (map.Scale.normalY(SVGRootElement.currentTranslate.y) + zoomMatrixA[5]) / this.nZoomY;
	var maxXoff = map.Scale.bBox.width-map.Scale.bBox.width/this.nZoomX;
	var maxYoff = map.Scale.bBox.height-map.Scale.bBox.height/this.nZoomY;
	if ( maxXoff > 0 && maxYoff > 0 ){
		return new box(0.5-xOff/maxXoff,0.5-yOff/maxYoff,1/this.nZoomX,1/this.nZoomY);
	}
	return new box(0,0,1/this.nZoomX,1/this.nZoomY);
};
/**
 * set map zoom and pan to a box given in fraction values. Usefull to execute zooming and panning via overwievmap  
 * @param nbox with x,y,width,height given as follows
 * <ul>
 * <li>x,y = pan position from 0...1 (0.5 = central position)</li>
 * <li>width,height = visible portion from 0...1 (1 = full extent)</li> 
 * </ul>
 */
Map.Zoom.prototype.setFractionBox = function(nBox){

	// calculate real width/height of fraction box
	var nWidth  = map.Scale.bBox.width*nBox.width;
	var nHeight = map.Scale.bBox.height*nBox.height;
	// calculate real offset range
	var maxXoff = map.Scale.bBox.width-nWidth;
	var maxYoff = map.Scale.bBox.height-nHeight;
	// offset is fraction of this range
	var xOff = maxXoff*nBox.x + map.Scale.bBox.x;
	var yOff = maxYoff*nBox.y + map.Scale.bBox.y;
	var zoomBox = new box(xOff,yOff,nWidth,nHeight);

	map.Zoom.setNewCenter(zoomBox);
};
/**
 * clip zoom or center area to map limits
 * @param rectArea the area to clip
 * @type box
 * @return the clipped area
 */
Map.Zoom.prototype.clipArea = function(rectArea){

	// 1. force area to the aspect ratio of the map
	//
	if ( rectArea.width/rectArea.height != map.Scale.bBox.width/map.Scale.bBox.height ){
		if ( rectArea.width>rectArea.height ){
			rectArea.height = rectArea.width/map.Scale.bBox.width*map.Scale.bBox.height;
		}
		else{
			rectArea.width = rectArea.height/map.Scale.bBox.height*map.Scale.bBox.width;
		}
	}

	// 2. clip the area
	//
	var leftMargin	 = rectArea.x - map.Scale.bBox.x;
	var rightMargin  = map.Scale.bBox.x+map.Scale.bBox.width - (rectArea.x+rectArea.width);
	var topMargin	 = rectArea.y - map.Scale.bBox.y;
	var bottomMargin = map.Scale.bBox.y+map.Scale.bBox.height - (rectArea.y+rectArea.height);

	if ( leftMargin < 0 || rightMargin < 0 || topMargin < 0 || bottomMargin < 0 ){
		if ( leftMargin < 0 && rightMargin < 0 ){
			rectArea.x = map.Scale.bBox.x;
			rectArea.width = map.Scale.bBox.width;
		}
		else if ( leftMargin < 0 ){
			rectArea.x += (-leftMargin);
			rectArea.width -= (rightMargin>(-leftMargin))?0:(-leftMargin)-rightMargin;
		}
		else if ( rightMargin < 0 ){
			rectArea.x -= (-rightMargin);
			return this.clipArea(rectArea);
		}
		if ( topMargin < 0 && bottomMargin < 0 ){
			rectArea.y = map.Scale.bBox.y;
			rectArea.height = map.Scale.bBox.heigt;
		}
		else if ( topMargin < 0 ){
			rectArea.y += (-topMargin);
			rectArea.height -= (bottomMargin>(-topMargin))?0:(-topMargin)-bottomMargin;
		}
		else if ( bottomMargin < 0 ){
			rectArea.y -= (-bottomMargin);
			return this.clipArea(rectArea);
		}
	}

	return rectArea;
};
/**
 * checks if a given box (map coordinates) is within the zoom box
 * @param bBox the box to check 
 * @type boolean
 * @return true or false
 */
Map.Zoom.prototype.isVisibleBox = function(bBox){

	try{
		var zoomBox = this.getBox();
		if ( bBox.x+bBox.width 	< zoomBox.x					||
			 bBox.x				> zoomBox.x+zoomBox.width	||
			 bBox.y+bBox.height	< zoomBox.y					||
			 bBox.y				> zoomBox.y+zoomBox.height  ){
			return false;
		}
		return true;
	}
	catch (e){
		return false;
	}
};
/**
 * checks if a given box (map coordinates) is completely within the zoom box
 * @param bBox the box to check 
 * @type boolean
 * @return true or false
 */
Map.Zoom.prototype.isCompletelyVisibleBox = function(bBox){

	var zoomBox = this.getBox();
	if ( bBox.x 			< zoomBox.x					||
		 bBox.x+bBox.width	> zoomBox.x+zoomBox.width	||
		 bBox.y				< zoomBox.y					||
		 bBox.y+bBox.height	> zoomBox.y+zoomBox.height  ){
		return false;
	}
	return true;
};

/**
 * execute map zooming
 * @param nZoom the new zoom fator 
 * @param nOldZoom the actual zoom factor
 */
Map.Zoom.prototype.doExecuteZoomMap = function(nZoom,nOldZoom){

	nZoom = this.checkZoomLimit(nZoom);
	if ( nZoom == this.nZoom ){
		return;
	}

	var zoomMatrixA = getMatrix(this.zoomNode);
	var newX = (SVGRootElement.currentTranslate.x + map.Scale.embedX(zoomMatrixA[4])) / nOldZoom * nZoom;
	var newY = (SVGRootElement.currentTranslate.y + map.Scale.embedX(zoomMatrixA[5])) / nOldZoom * nZoom;

	this.nZoomX = this.nZoomX / nOldZoom * nZoom;
	this.nZoomY = this.nZoomY / nOldZoom * nZoom;

	if ( fPanByViewer ){
		this.zoomNode.setAttributeNS(null,"transform","matrix("+this.nZoomX+" 0 0 "+this.nZoomY+" 0 0)");
		SVGRootElement.currentTranslate.x = newX;
		SVGRootElement.currentTranslate.y = newY;
	}
	else {
		this.zoomNode.setAttributeNS(null,"transform","matrix("+this.nZoomX+" 0 0 "+this.nZoomY+" "+map.Scale.normalX(newX)+" "+map.Scale.normalY(newY)+")");
	}
	this.nZoom = nZoom;
	map.Event.doDefaultZoom(null);
};
/**
 * execute map zooming to an area
 * @param rectArea the area to zoom to 
 */
Map.Zoom.prototype.doZoomMapToArea = function(rectArea){

	// debug: mark the area to zoom to
    // ---------------------------------
	// try{
	// 	var objectGroup = map.Layer.objectGroup;
	// 	map.Dom.clearGroup(objectGroup);
	// 		map.Dom.newShape('rect',objectGroup,rectArea.x,rectArea.y,rectArea.width,rectArea.height,"stroke:black;stroke-width:20;fill:none")
	// 		map.Dom.newShape('line',objectGroup,rectArea.x,rectArea.y,rectArea.x+rectArea.width,rectArea.y+rectArea.height,"stroke:black;stroke-width:20;fill:none")
	// 		map.Dom.newShape('line',objectGroup,rectArea.x,rectArea.y+rectArea.height,rectArea.x+rectArea.width,rectArea.y,"stroke:black;stroke-width:20;fill:none")
	// 	}catch (e){	}

	this.fAreaSet = true;

	var canvasMatrixA = getMatrix(this.canvasNode);
	var mapCanvas = new point(canvasMatrixA[4],canvasMatrixA[5]);

	var nNewZoom = Math.min(map.Scale.bBox.width/rectArea.width,map.Scale.bBox.height/rectArea.height);

	var nNewZoomX = map.Scale.bBox.width/rectArea.width;
	var nNewZoomY = map.Scale.bBox.height/rectArea.height;

	nNewZoom = Math.round(nNewZoom*1000000)/1000000;

	nNewZoomX = Math.round(nNewZoomX*1000000)/1000000;
	nNewZoomY = Math.round(nNewZoomY*1000000)/1000000;

	var nNewZoomChecked = this.checkZoomLimit(nNewZoom);
	if ( nNewZoomChecked != nNewZoom ){
		rectArea.scale(nNewZoom/nNewZoomChecked);
	}
	nNewZoom = nNewZoomChecked;

	if ( nNewZoom == this.nZoom ){
		this.doCenterMapToArea(rectArea);
		return;
	}

	// GR 15.08.2013
	if ( fPreserveMapRatio ){
		nNewZoomX = nNewZoomY = nNewZoom;
	}

	// zoom with different modes
	if ( fZoomByViewer && fPanByViewer ){
		this.zoomNode.setAttributeNS(null,"transform","matrix(1 0 0 1 0 0)");
		SVGRootElement.currentScale = nNewZoom;
	}
	else if ( fPanByViewer ){
		this.zoomNode.setAttributeNS(null,"transform","matrix("+nNewZoomX+" 0 0 "+nNewZoomY+" 0 0)");
		SVGRootElement.currentScale = 1;
	}
	else{
		this.zoomNode.setAttributeNS(null,"transform","matrix("+nNewZoomX+" 0 0 "+nNewZoomY+" "+0+" "+0+")");
	}
	this.nZoom = nNewZoom;
	this.nZoomX = nNewZoomX;
	this.nZoomY = nNewZoomY;
	this.doCenterMapToArea(rectArea);

};
/**
 * execute map centering to an area
 * @param rectArea the area to center to 
 */
Map.Zoom.prototype.doCenterMapToArea = function(rectArea){

	this.fAreaSet = true;
	this.fExternalZoom = false;

	var canvasMatrixA = getMatrix(this.canvasNode);
	var mapCanvas = new point(canvasMatrixA[4],canvasMatrixA[5]);

	var zoomMatrixA = getMatrix(this.zoomNode);
	var nZoom = zoomMatrixA[0];
	var nZoomX = zoomMatrixA[0];
	var nZoomY = zoomMatrixA[3];

	// calculate center
	rectArea.x	+= rectArea.width/2;
	rectArea.y	+= rectArea.height/2;

	// to new map zoom
	rectArea.x	= rectArea.x*nZoomX+mapCanvas.x;
	rectArea.y	= rectArea.y*nZoomY+mapCanvas.y;

	// new pan position
	var newX = -(rectArea.x) + map.Scale.bBox.width/2;
	var newY = -(rectArea.y) + map.Scale.bBox.height/2;

	// GR 15.11.2007 respect canvas rotation  
	var pRotated = map.Scale.rotatePoint(new point(newX,newY));
	newX = pRotated.x;
	newY = pRotated.y;

	// zoom and pan with different modes
	if ( fZoomByViewer && fPanByViewer ){
		SVGRootElement.currentScale = nNewZoom;
		SVGRootElement.currentTranslate.x = map.Scale.embedX(newX-rectArea.width/2)*nNewZoomX;
		SVGRootElement.currentTranslate.y = map.Scale.embedY(newY-rectArea.height/2)*nNewZoomY;
	}
	else if ( fPanByViewer ){
		SVGRootElement.currentTranslate.x = map.Scale.embedX(newX);
		SVGRootElement.currentTranslate.y = map.Scale.embedY(newY);
	}
	else{
		var ptOld = getTranslate(this.zoomNode);
		this.zoomNode.setAttributeNS(null,"transform","matrix("+nZoomX+" 0 0 "+nZoomY+" "+newX+" "+newY+")");
		// GR 31.12.2010
		this.doPanFixed(newX-ptOld.x,newY-ptOld.y);
	}

	if ( !fFroozeDynamicContent ){
		if ( map.isIdle() ){
			map.Event.doDefaultZoom(null);
		}else{
			map.pushAction('map.Event.doDefaultZoom(null)');
		}
	}
};
Map.Zoom.prototype.doPanFixed = function(deltaX,deltaY){
	var fixedNodes = SVGFixedGroup.childNodes;
	for ( var i=0; i<fixedNodes.length; i++ ){
		var ptPos = fixedNodes.item(i).fu.getPosition();
		if ( 1 ){
			fixedNodes.item(i).fu.setPosition(ptPos.x+deltaX,ptPos.y+deltaY);
		}else{
			var widget = widgetList.getWidget(fixedNodes.item(i));
			widget.owner.ptPosition.x+=deltaX;
			widget.owner.ptPosition.y+=deltaY;
			widget.owner.ptOffset.x-=deltaX;
			widget.owner.ptOffset.y-=deltaY;
			widget.owner.reformat();
		}
	}
	var toolsNodes = SVGToolsGroup.childNodes;
	for ( var i=0; i<toolsNodes.length; i++ ){
		var ptPos = toolsNodes.item(i).fu.getPosition();
		toolsNodes.item(i).fu.setPosition(ptPos.x+deltaX,ptPos.y+deltaY);
	}
};

/**
 * execute map area zoom tool
 * ! if SVG on top of a HTML map, foreward call to the HTML map !
 * @param rectArea the new area to zoom to given in widget (=screen) coordinates
 */
Map.Zoom.prototype.doZoomMapToWidgetRect = function(rectArea){

	var fCenter = Math.min(rectArea.width,rectArea.height) < map.Scale.normalX(25) ? true : false;

	var pStart = new point(rectArea.x,rectArea.y);
	var pEnd   = new point(rectArea.x-rectArea.width,rectArea.y-rectArea.height);

	var zoomMatrixA = getMatrix(map.Scale.zoomNode);
	var nZoomX = zoomMatrixA[0];
	var nZoomY = zoomMatrixA[3];
	
	// from widget to canvas
	var matrixA = antiZoomAndPanList.getActualMatrix();

	// GR 15.11.2007 respect canvas rotation  
	var pRotated = map.Scale.rotatePoint(new point(zoomMatrixA[4],zoomMatrixA[5]),-1);
	zoomMatrixA[4] = pRotated.x;
	zoomMatrixA[5] = pRotated.y;

	rectArea.x		= (rectArea.x)*matrixA[0]+matrixA[4];
	rectArea.y		= (rectArea.y)*matrixA[3]+matrixA[5];
	rectArea.width	= rectArea.width*matrixA[0];
	rectArea.height	= rectArea.height*matrixA[3];

	// from canvas to map
	rectArea.x		= rectArea.x-map.Scale.mapPosition.x-map.Scale.mapOffset.x;
	rectArea.y		= rectArea.y-map.Scale.mapPosition.y-map.Scale.mapOffset.y;

	// subtract old map zoom and pan
	rectArea.x		= (rectArea.x-zoomMatrixA[4])/nZoomX;
	rectArea.y		= (rectArea.y-zoomMatrixA[5])/nZoomY;
	rectArea.width  = rectArea.width/nZoomX;
	rectArea.height = rectArea.height/nZoomY;

	if (fCenter){
		map.Zoom.setNewCenter(rectArea);
	}else{
		map.Zoom.setNewArea(rectArea);
	}
};
/**
 * execute map zooming to an envelope ( geo cordinate bounding box )
 * @param minBoundX the x value of the min geo coordinate  
 * @param maxBoundX the x value of the max geo coordinate  
 * @param minBoundY the y value of the min geo coordinate  
 * @param maxBoundY the y value of the max geo coordinate  
 */
Map.Zoom.prototype.doZoomMapToEnvelope = function(minBoundX,maxBoundX,minBoundY,maxBoundY){

	if ( this.doCheckEnvelope(minBoundX,maxBoundX,minBoundY,maxBoundY) ) {
		var nLeft   = (minBoundX-map.Scale.minBoundX)/map.Scale.mapUnitsPPX - map.Scale.mapOffset.x;
		var nRight  = (maxBoundX-map.Scale.minBoundX)/map.Scale.mapUnitsPPX - map.Scale.mapOffset.x;
		var nTop    = map.Scale.maxY - map.Scale.minY - (maxBoundY-map.Scale.minBoundY)/map.Scale.mapUnitsPPY - map.Scale.mapOffset.y;
		var nBottom = map.Scale.maxY - map.Scale.minY - (minBoundY-map.Scale.minBoundY)/map.Scale.mapUnitsPPY - map.Scale.mapOffset.y;

		map.Zoom.setNewArea(new box(nLeft,nTop,nRight-nLeft,nBottom-nTop),300); 
	}else{
		map.Zoom.doZoomMapToLayer('maplayer');
	}

};
/**
 * execute map center to an envelope ( geo cordinate bounding box )
 * @param minBoundX the x value of the min geo coordinate  
 * @param maxBoundX the x value of the max geo coordinate  
 * @param minBoundY the y value of the min geo coordinate  
 * @param maxBoundY the y value of the max geo coordinate  
 */
Map.Zoom.prototype.doCenterMapToEnvelope = function(minBoundX,maxBoundX,minBoundY,maxBoundY){

	if ( this.doCheckEnvelope(minBoundX,maxBoundX,minBoundY,maxBoundY) ) {
		var nLeft   = (minBoundX-map.Scale.minBoundX)/map.Scale.mapUnitsPPX - map.Scale.mapOffset.x;
		var nRight  = (maxBoundX-map.Scale.minBoundX)/map.Scale.mapUnitsPPX - map.Scale.mapOffset.x;
		var nTop    = map.Scale.maxY - map.Scale.minY - (maxBoundY-map.Scale.minBoundY)/map.Scale.mapUnitsPPY - map.Scale.mapOffset.y;
		var nBottom = map.Scale.maxY - map.Scale.minY - (minBoundY-map.Scale.minBoundY)/map.Scale.mapUnitsPPY - map.Scale.mapOffset.y;

		map.Zoom.doCenterMapToArea(new box(nLeft,nTop,nRight-nLeft,nBottom-nTop)); 
	}
};
/**
 * execute map center to a geo position given in Lat/Lon
 * @param lat the latitude of the geo position
 * @param lon the longitude of the geo position
 */
Map.Zoom.prototype.doCenterMapToGeoPosition = function(lat,lon){
	var ptCenter = map.Scale.getMapCoordinateOfLatLon(lat,lon);
	if ( ptCenter ){
		if ( !this.doSetCenterByParentMap(ptCenter.x,ptCenter.y) ){
			this.doCenterMapToEnvelope(ptCenter.x,ptCenter.x,ptCenter.y,ptCenter.y);
		}
	}
	else{
		displayMessage("missing projection ! lat/lon could not be resolved",1000);
	}
};
/**
 * execute map center to bounds given in Lat/Lon
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Zoom.prototype.doCenterMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	this.fExternalZoom = false;
	var ptSW = map.Scale.getMapCoordinateOfLatLon(latSW,lonSW);
	var ptNE = map.Scale.getMapCoordinateOfLatLon(latNE,lonNE);
	if ( ptSW && ptNE ){
		this.doCenterMapToEnvelope(ptSW.x,ptNE.x,ptSW.y,ptNE.y);
	}
	else{
		displayMessage("missing projection ! lat/lon could not be resolved",1000);
	}
};
/**
 * execute map zoom to bounds given in Lat/Lon
 * ! if SVG on top of a HTML map, foreward call to the HTML map !
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Zoom.prototype.doZoomMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	var ptSW = map.Scale.getMapCoordinateOfLatLon(latSW,lonSW);
	var ptNE = map.Scale.getMapCoordinateOfLatLon(latNE,lonNE);
	if ( ptSW && ptNE ){
		if ( !this.doSetEnvelopeByParentMap(ptSW.x,ptNE.x,ptSW.y,ptNE.y) ){
			this.doZoomMapToEnvelope(ptSW.x,ptNE.x,ptSW.y,ptNE.y);
		}
	}
	else{
		displayMessage("missing projection ! lat/lon could not be resolved",1000);
	}
};
/**
 * execute map pan to given center in Lat/Lon and zoom level
 * ! if SVG on top of a HTML map, foreward call to the HTML map !
 * @param center point array with latitude,longitude
 * @param nZoom zoom level of hosting tile map
 */
Map.Zoom.prototype.doZoomMapToView = function(center,nZoom){
	try{
		HTMLWindow.ixmaps.htmlgui_setCenterAndZoom({lat:center[0],lng:center[1]},nZoom);
	}
	catch (e){
		return false;
	}
};
/**
 * execute map zoom to bounds given in Lat/Lon
 * ! if SVG on top of a HTML map, foreward call to the HTML map !
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Zoom.prototype.doZoomMapToLayer = function(szLayerName){
	_TRACE("---- ************ ----- doZoomMapToLayer -------------------");

	if ( fPendingNewGeoBounds ){
		fPendingNewGeoBounds = false;
		return;
	}

	var layerNode = SVGDocument.getElementById(szLayerName);
	var bBox = map.Dom.getBox(layerNode);
	var ptOffset = map.Scale.getMapOffset(layerNode);
	bBox.x += ptOffset.x;
	bBox.y += ptOffset.y;
	var allBox = new box(bBox.x,bBox.y,bBox.width,bBox.height);
	allBox.scale(0.8);

	// GR 29.04.2012 because of an error in CHROME, getBox() gets the box wrong (can't handle negative coordinates)
	// so we have to do the job; svggis creates now a <g> with id = layername::bbox, there we can find the bounds of one layer
	// we loop over all layer and make the hull
	//
	if ( szLayerName == "maplayer" ){
		var minX = 30000;
		var minY = 30000;
		var maxX = -30000;
		var maxY = -30000;
		var fDone = false;
		for ( a in map.Layer.listA ){
			if ( !a.match(/legend/) ){
				var layerBoxNode = SVGDocument.getElementById(a+"::bbox");
				if ( layerBoxNode ){
					minX = Math.min(minX,Number(layerBoxNode.getAttributeNS(null,"minboundx")));
					minY = Math.min(minY,Number(layerBoxNode.getAttributeNS(null,"minboundy")));
					maxX = Math.max(maxX,Number(layerBoxNode.getAttributeNS(null,"maxboundx")));
					maxY = Math.max(maxY,Number(layerBoxNode.getAttributeNS(null,"maxboundy")));
					fDone = true;
				}
			}
		}
		if ( fDone ){
			allBox = new box(minX,minY,Math.abs(maxX-minX),Math.abs(maxY-minY));
		}
	}

	if ( allBox.width && allBox.height && allBox.width < map.Scale.bBox.width && allBox.height < map.Scale.bBox.height ){
		if ( !map.Zoom.doSetAreaByParentMap(allBox) ){

			// debug: mark the area to zoom to
			// ---------------------------------
			/**
			try{
				var objectGroup = map.Layer.objectGroup;
				map.Dom.clearGroup(objectGroup);
					map.Dom.newShape('rect',objectGroup,allBox.x,allBox.y,allBox.width,allBox.height,"stroke:black;stroke-width:20;fill:none")
					map.Dom.newShape('line',objectGroup,allBox.x,allBox.y,allBox.x+allBox.width,allBox.y+allBox.height,"stroke:black;stroke-width:20;fill:none")
					map.Dom.newShape('line',objectGroup,allBox.x,allBox.y+allBox.height,allBox.x+allBox.width,allBox.y,"stroke:black;stroke-width:20;fill:none")
					_TRACE("box!!!:"+allBox.x+','+allBox.y+','+allBox.width+','+allBox.height);
				}catch (e){	}
			**/
			map.hideMap();
			map.Zoom.setNewArea(allBox);
		}
	}
};
/**
 * execute map sync to bounds given in Lat/Lon
 * @param latSW the latitude  of the South West point
 * @param lonSW the longitude of the North East point
 * @param latNE the latitude  of the South West point
 * @param lonNE the longitude of the North East point
 */
Map.Zoom.prototype.doSetMapToGeoBounds = function(latSW,lonSW,latNE,lonNE){
	this.fExternalZoom = false;
	var ptSW = map.Scale.getMapCoordinateOfLatLon(latSW,lonSW);
	var ptNE = map.Scale.getMapCoordinateOfLatLon(latNE,lonNE);
	if ( ptSW && ptNE ){
		map.hideMap();
		this.doZoomMapToEnvelope(ptSW.x,ptNE.x,ptSW.y,ptNE.y);
	}
	else{
		displayMessage("missing projection ! lat/lon could not be resolved",1000);
	}
};
/**
 * get map center in Lat/Lon
 * @TYPE point
 * @return the center point in lat (point.y) lon (point.x) 
 */
Map.Zoom.prototype.getCenterOfMapInGeoPosition = function(){
	var rectArea = this.getBox();
	var ptCenter = map.Scale.getMapCoordinate(rectArea.x+rectArea.width/2,rectArea.y+rectArea.height/2);
	ptCenter = map.Scale.getGeoCoordinateOfPoint(ptCenter.x,ptCenter.y); 
	return (ptCenter);
};
/**
 * get the actual map view (zoom/pan ) in Lat/Lon
 * @TYPE array of points
 * @return the bounds, array of 2 points (SouthWest, NorthEast) in lat (point.y) lon (point.x) 
 */
Map.Zoom.prototype.getBoundsOfMapInGeoBounds = function(){
	var rectArea = this.getBox();
	var ptSW = map.Scale.getMapCoordinate(rectArea.x,rectArea.y+rectArea.height);
	var ptNE = map.Scale.getMapCoordinate(rectArea.x+rectArea.width,rectArea.y);
	ptSW = map.Scale.getGeoCoordinateOfPoint(ptSW.x,ptSW.y); 
	ptNE = map.Scale.getGeoCoordinateOfPoint(ptNE.x,ptNE.y); 
	return (new Array(ptSW,ptNE));
};
/**
 * check if envelope (geo cordinate bounding box) is (even partially) within the map extension
 * @param minBoundX the x value of the min geo coordinate  
 * @param maxBoundX the x value of the max geo coordinate  
 * @param minBoundY the y value of the min geo coordinate  
 * @param maxBoundY the y value of the max geo coordinate
 * @type boolean
 * @return true, if within map extension
 */
Map.Zoom.prototype.doCheckEnvelope = function(minBoundX,maxBoundX,minBoundY,maxBoundY){

	if ( !fLimitMapToExtent ){
		return true;
	}
	if ( (minBoundX < map.Scale.minBoundX) &&
		 (maxBoundX > map.Scale.maxBoundX) &&
		 (minBoundY < map.Scale.minBoundY) &&
		 (maxBoundY > map.Scale.maxBoundY) &&
		 (maxBoundX-minBoundX) > ((map.Scale.maxBoundX-map.Scale.minBoundX)*2) ){
		displayMessage("position outside",500);
		return false;
	}
	if ( (minBoundX > map.Scale.maxBoundX) ||
		 (maxBoundX < map.Scale.minBoundX) ||
		 (minBoundY > map.Scale.maxBoundY) ||
		 (maxBoundY < map.Scale.minBoundY)  ){
		displayMessage("position outside",500);
		return false;
	}
	return true;
};
/**
 * check if we can set the new area by a HTML parent map, leads to less recursion
 * in synchronisation, because the parent map has its own possible zoom values 
 * @param rectArea the area to fit the map in
 * @type boolean
 * @return true, if new area has been set 
 */
Map.Zoom.prototype.doSetAreaByParentMap = function(rectArea){
	var ptSW = map.Scale.getMapCoordinate(rectArea.x,rectArea.y);
	var ptNE = map.Scale.getMapCoordinate(rectArea.x+rectArea.width,rectArea.y+rectArea.height);
	return this.doSetEnvelopeByParentMap(ptSW.x,ptNE.x,ptSW.y,ptNE.y);
};
/**
 * check if we can set the new envelope by a HTML parent map, leads to less recursion
 * in synchronisation, because the parent map has its own possible zoom values 
 * @param minBoundX the x value of the min geo coordinate  
 * @param maxBoundX the x value of the max geo coordinate  
 * @param minBoundY the y value of the min geo coordinate  
 * @param maxBoundY the y value of the max geo coordinate
 * @type boolean
 * @return true, if new envelope has been set 
 */
Map.Zoom.prototype.doSetEnvelopeByParentMap = function(minBoundX,maxBoundX,minBoundY,maxBoundY){

	try{
		ptSW = map.Scale.getGeoCoordinateOfPoint(minBoundX,minBoundY); 
		ptNE = map.Scale.getGeoCoordinateOfPoint(maxBoundX,maxBoundY);
		this.fExternalZoom = true;
		return HTMLWindow.ixmaps.htmlgui_setCurrentEnvelopeByGeoBounds(ptSW,ptNE);
	}
	catch (e){
		return false;
	}
};
/**
 * check if we can set the new area by a HTML parent map, leads to less recursion
 * in synchronisation, because the parent map has its own possible zoom values 
 * @param rectArea the area to fit the map in
 * @type boolean
 * @return true, if new area has been set 
 */
Map.Zoom.prototype.doCenterByParentMap = function(rectArea){
	var ptSW = map.Scale.getMapCoordinate(rectArea.x+rectArea.width/2,rectArea.y+rectArea.height/2);
	return this.doSetCenterByParentMap(ptSW.x,ptSW.y);
};
/**
 * check if we can set the new envelope by a HTML parent map, leads to less recursion
 * in synchronisation, because the parent map has its own possible zoom values 
 * @param minBoundX the x value of the min geo coordinate  
 * @param maxBoundX the x value of the max geo coordinate  
 * @param minBoundY the y value of the min geo coordinate  
 * @param maxBoundY the y value of the max geo coordinate
 * @type boolean
 * @return true, if new envelope has been set 
 */
Map.Zoom.prototype.doSetCenterByParentMap = function(minBoundX,minBoundY){

	try{
		ptCenter = map.Scale.getGeoCoordinateOfPoint(minBoundX,minBoundY); 
		return HTMLWindow.ixmaps.htmlgui_setCurrentCenterByGeoBounds(ptCenter);
	}
	catch (e){
		return false;
	}
};
/**
 * execute map zooming by factor and mode 
 * @param nFactor the zoom fator (to be set absolute or relative)
 * @param szMode 'absolute' or 'byscale' or 'relative' (default)
 * @type int
 * @return new map scale ( for sample 25000 which means 1:25000 )
 */
Map.Zoom.prototype.doZoomMap = function(nFactor,szMode){

	if (  this.zoomNode ){

		displayMessage("please wait ...",500);

		var matrixA = getMatrix(map.Zoom.zoomNode);
		var nOldZoom = matrixA[0];
		var nZoom = nOldZoom;

		// zoom to full extend
		if (nFactor == 0){
			this.toFullExtend();
			return Math.round(map.Scale.nMapScale);
		}
		else{
			switch (szMode){
				case 'absolute':	nZoom = nFactor; break;
				case 'byscale':		nZoom =  map.Scale.getTrueMapScale()/nFactor; break;
				default:			nZoom *= nFactor; break;
			}
		}
        this.setNewZoom(nZoom);
		return Math.round(map.Scale.nMapScale/nZoom);
	}	
};
/**
 * execute map panning by dx, dy 
 * @param nDeltaX pan map for this dx 
 * @param nDeltaY pan map for this dy
 */
Map.Zoom.prototype.doPanMap = function(nDeltaX,nDeltaY){

	var zoomMatrixA = getMatrix(this.zoomNode);
	var nZoomX = zoomMatrixA[0];
	var nZoomY = zoomMatrixA[3];

	var newX = SVGRootElement.currentTranslate.x + nDeltaX;
	var newY = SVGRootElement.currentTranslate.y + nDeltaY;

	// GR 15.11.2007 respect canvas rotation  
	var pRotated = map.Scale.rotatePoint(new point(newX,newY));
	newX = pRotated.x;
	newY = pRotated.y;

	newX += map.Scale.embedX(zoomMatrixA[4]);
	newY += map.Scale.embedY(zoomMatrixA[5]);


	if ( fPanByViewer ){
		SVGRootElement.currentTranslate.x = newX;
		SVGRootElement.currentTranslate.y = newY;
	}
	else {
		newX = map.Scale.normalX(newX);
		newY = map.Scale.normalY(newY);

		var ptOld = getTranslate(this.zoomNode);
		this.zoomNode.setAttributeNS(null,"transform","matrix("+nZoomX+" 0 0 "+nZoomY+" "+newX+" "+newY+")");

		this.doPanFixed(newX-ptOld.x,newY-ptOld.y);
	}

	// GR 17.06.2013 correct sync error 
	try{
		var rectArea = this.getBox();
		var pt1 = map.Scale.getMapCoordinate(rectArea.x+rectArea.width/2,rectArea.y+rectArea.height/2);
		this.doSetCenterByParentMap(pt1.x,pt1.y);
	}
	catch (e){
		try{
			HTMLWindow.ixmaps.htmlgui_setCurrentEnvelope(this.getEnvelopeString(),false);
		}
		catch (e){
		}
	}
};
/**
 * execute map panning by viewer by dx, dy 
 * @param nDeltaX pan map for this dx 
 * @param nDeltaY pan map for this dy
 */
Map.Zoom.prototype.doPanMapByViewer = function(nDeltaX,nDeltaY){

	var newX = SVGRootElement.currentTranslate.x + nDeltaX;
	var newY = SVGRootElement.currentTranslate.y + nDeltaY;
	SVGRootElement.currentTranslate.x = newX;
	SVGRootElement.currentTranslate.y = newY;
};
/**
 * check if new zoom within zoom limit 
 * @param nNewZoom new zoom value to check 
 * @type int
 * @return the checked and clipped zoom
 */
Map.Zoom.prototype.checkZoomLimit = function(nNewZoom){
	var nLimit = 1000000;
	if ( fPDFEmbed ){
		nLimit = 20;
		if ( map.Tiles && (map.Tiles.nCount > 1) ){
			nLimit = 20;
		}
	}
	if (nNewZoom >= nLimit){
		displayMessage("zoom limit !",1000);
		return nLimit;
	}
	nNewZoom = Math.round(nNewZoom*1000000)/1000000;
	return nNewZoom;
};
/**
 * remove clipping of zoomed map (may be important for pattern) 
 * @param evt the mouse event
 */
Map.Zoom.prototype.removeClipping = function(evt){
	if (fClipMapDynamic){
		var mapClipNode = SVGDocument.getElementById("mapclip");
		mapClipNode.setAttributeNS(null,"clip-path","");
	}
};
/**
 * activate clipping of zoomed map (may be important for panning) 
 * @param evt the mouse event
 */
Map.Zoom.prototype.activateClipping = function(evt){
	if (fClipMapDynamic){
		var mapClipNode = SVGDocument.getElementById("mapclip");
		mapClipNode.setAttributeNS(null,"clip-path","url(#mapclippath)");
	}
};
/**
 * initialize the overview map
 * @param evt the mouse event
 */
Map.Zoom.prototype.initOverviewMap = function(evt){return;
	var szIdExtend = ":clone";
	this.overviewNode = SVGDocument.getElementById("legend:overviewmap");
	this.overviewSrc  = SVGDocument.getElementById("overviewmap_widget");
	if (this.overviewNode && this.overviewSrc){

		// check if overviewmap is present
		if (this.overviewNode.childNodes.length > 1){
			return;
		}
		if ( !this.overviewForcedToShow ){
			if ( this.overviewNode.getAttributeNS(szMapNs,"mode").match(/hidden/) ){
				return;
			}
			if ( this.overviewNode.getAttributeNS(szMapNs,"mode").match(/autohide/) && (map.Scale.nZoomScale == 1) ){
				return;
			}
		}

		// check if all content is loaded 
		var szSrcA = null;
		var szSrc = this.overviewNode.getAttributeNS(szMapNs,"layer");
		if ( szSrc ){
			szSrcA = szSrc.split('|');
			for ( var i=0; i<szSrcA.length; i++ ){
				if ( SVGDocument.getElementById(szSrcA[i]) == null ){
					_TRACE("! initOverviewMap ("+szSrcA[i]+" not present)");
				}
				else{
					_TRACE("* initOverviewMap ("+szSrcA[i]+" present)");
				}
			}
		}

		_TRACE("--- init OverviewMap");

		// clone and instanzise the overview map template
		var overviewBody = this.overviewNode.appendChild(this.overviewSrc.cloneNode(1000));
		overviewBody.setAttributeNS(szMapNs,"menu","overviewmapmenu");
		map.Dom.extendAllIds(overviewBody,szIdExtend);

		// scale overview destination rect to the aspectratio of the overview map
		var overviewDest = SVGDocument.getElementById("overviewmap_widget_maprect"+szIdExtend);
		var rectBox		 = map.Dom.getBox(overviewDest);
		rectBox.width = rectBox.height/map.Scale.bBox.height*map.Scale.bBox.width;
		overviewDest.setAttributeNS(null,"width",rectBox.width);	
		
		// insert delete button
		var buttonObj = null;
		buttonObj = new Button(overviewBody,"","BUTTON",'#delete_button'
								,"map.Zoom.hideOverviewMap()"
								,""
								,"hide overview map");
		buttonObj.scale(0.1,0.1);
		buttonObj.setPosition(rectBox.width-13,13);

		// scale overview to legend width
		var overviewMargin = this.overviewNode.getAttributeNS(szMapNs,"margin");
		var overviewScale = this.overviewNode.getAttributeNS(szMapNs,"scale");
		overviewMargin = overviewMargin == ""?0:overviewMargin;
		overviewScale  = overviewScale  == ""?1 :overviewScale;

		var bBox = map.Dom.getBox(overviewBody);
		var nScale = (map.Scale.legendWidth-map.Scale.normalX(20+overviewMargin))*overviewScale/bBox.width;
		overviewBody.fu = new Methods(overviewBody);
		overviewBody.fu.scale(nScale,nScale);
		overviewBody.fu.setPosition(map.Scale.normalX(overviewMargin),map.Scale.normalY(5+overviewMargin));

		// rescale delete button
		buttonObj.scale(1/nScale,1/nScale);

		// clip the overview map
		var newClipPath = map.Dom.newNode('clipPath',overviewBody);
		newClipPath.setAttribute("id","overviewmap:clippath");
		// for Firefox 1.5.0.1
		newClipPath.setAttribute("style","pointer-events:all");
		var newClipRect = map.Dom.newShape('rect',newClipPath,0,0,rectBox.width,rectBox.height,"fill:none;stroke:none");

		var newOverviewFrame = map.Dom.newGroup(overviewDest.parentNode,"overviewmap:clipframe");
		newOverviewFrame = overviewDest.parentNode.insertBefore(newOverviewFrame,overviewDest.nextSibling);
		newOverviewFrame.setAttributeNS(null,"clip-path","url(#overviewmap:clippath)");
		var newOverview = map.Dom.newGroup(newOverviewFrame,"overviewmap:layer");

		// insert the content (predefined map layer) into the overview map
		szSrc = this.overviewNode.getAttributeNS(szMapNs,"layer");
		if ( szSrc ){
			szSrcA = szSrc.split('|');
			for ( var i=0; i<szSrcA.length; i++ ){
				var mapSrc = SVGDocument.getElementById(szSrcA[i]);
				var fClone = map.Layer.isScaleDependentLayer(szSrcA[i]);
				if (mapSrc){
					if ( fClone ){
						var cNode = newOverview.appendChild(mapSrc.cloneNode(1000));
					} else {
						var cNode = map.Dom.constructNode('use',newOverview,{'xlink:href':'#'+mapSrc.getAttributeNS(null,"id")});
					}
					var szClassName = cNode.getAttributeNS(null,"class");
					if (szClassName == "linetemplate" ){
						cNode.setAttributeNS(null,"style","fill:none;stroke:black;");
					}
					cNode.style.setProperty("display","inline","");
					map.Dom.extendAllIds(cNode,szIdExtend);
					_TRACE(".insert: "+szSrcA[i]);
				}
				else{
					var tileNodesA  = map.Tiles.getTileNodes(szSrcA[i]);
					var ptTilesA    = map.Tiles.getTilePositions();
					for ( var j=0; j<tileNodesA.length; j++ ){
						if (tileNodesA[j]){
							if ( fClone ){
								var tileNode = newOverview.appendChild(tileNodesA[j].cloneNode(1000));
							} else {
								var tileNode = map.Dom.constructNode('use',newOverview,{'xlink:href':'#'+tileNodesA[j].getAttributeNS(null,"id")});
							}
							map.Dom.extendAllIds(tileNode,szIdExtend);
							tileNode.fu = new Methods(tileNode);
							tileNode.fu.setPosition(ptTilesA[j].x+ptTilesA[j].width/2,ptTilesA[j].y+ptTilesA[j].height/2);
							_TRACE(".insert: "+tileNodesA[j].getAttributeNS(null,"id")+" at "+(ptTilesA[j].x+ptTilesA[j].width/2)+','+(ptTilesA[j].y+ptTilesA[j].height/2));
						}
					}
				}
			}
			// scale overview map
			var mapBox  = map.Dom.getBox(newOverview);
			var destBox = map.Dom.getBox(overviewDest);
			var matrixA = getMatrix(newOverview);
			matrixA[0] = destBox.width/map.Scale.bBox.width;
			matrixA[3] = destBox.height/map.Scale.bBox.height;
			matrixA[4] = destBox.width/2;
			matrixA[5] = destBox.height/2;
			setMatrix(newOverview,matrixA);
		}

		// initialise overview thumb rect
		var overviewThumb = SVGDocument.getElementById("overviewmap_widget_selectrect"+szIdExtend);
		var overviewThumbGroup = map.Dom.newGroup(overviewThumb.parentNode,"overviewmap_widget_selectgroup"+szIdExtend);
		overviewThumbGroup.appendChild(overviewThumb);

		overviewThumb.setAttributeNS(null,"width",String(rectBox.width/this.nZoomX));
		overviewThumb.setAttributeNS(null,"height",String(rectBox.height/this.nZoomY));
		var thumbBox = map.Dom.getBox(overviewThumb);
		overviewThumb.fu = new Methods(overviewThumb);
		overviewThumb.fu.setPosition(-thumbBox.x,-thumbBox.y);

		overviewThumb.setAttributeNS(null,"id","");
		this.overviewThumbObj = new Slider(overviewThumbGroup,new box(0,0,rectBox.width-thumbBox.width,rectBox.height-thumbBox.height));
		this.overviewThumbObj.parent = this;

		try{
			map.Legend.init(null);
		}
		catch (e){
		}
		// GR 14.02.2010 set rotation of overview map
		setRotate(SVGDocument.getElementById("overviewmap:layer"),getRotateAttributeValue(map.Scale.canvasNode));

		this.actualizeOverviewMap(evt);
	}
};
/**
 * adapt the overview map to the actual zoom and pan
 * @param evt the mouse event
 */
Map.Zoom.prototype.actualizeOverviewMap = function(evt){
	var szIdExtend = ":clone";
	// actualize overview thumb rect
	if ( this.overviewThumbObj ){

		if ( !this.overviewForcedToShow ){
			if ( this.overviewNode.getAttributeNS(szMapNs,"mode").match(/autohide/) && (map.Scale.nZoomScale == 1) ){
				this.hideOverviewMap(evt);
				this.overviewForcedToHide = false;
				return;
			}
		}

		var overviewThumbRect = this.overviewThumbObj.objNode.firstChild;
		var overviewThumbMarker = overviewThumbRect.nextSibling;

		var mapRect  = SVGDocument.getElementById("overviewmap_widget_maprect"+szIdExtend);
		var rectBox   = new box( mapRect.getAttributeNS(null,"x")
								,mapRect.getAttributeNS(null,"x")
								,mapRect.getAttributeNS(null,"width")
								,mapRect.getAttributeNS(null,"height"));

		if ( this.nZoom <= 1 ){
			overviewThumbRect.style.setProperty("display","none","");
		}
		else{
			overviewThumbRect.style.setProperty("display","inline","");
			overviewThumbRect.setAttributeNS(null,"width",String(rectBox.width/this.nZoomX));
			overviewThumbRect.setAttributeNS(null,"height",String(rectBox.height/this.nZoomY));
		}
		if ( this.nZoom >= 10 ){
			if (overviewThumbMarker == null){
				overviewThumbMarker = map.Dom.newGroup(overviewThumbRect.parentNode,"");
				map.Dom.newShape('rect',overviewThumbMarker,-20, -3,15, 6,"fill:#bbbbdd;opacity:0.8");
				map.Dom.newShape('rect',overviewThumbMarker,  5, -3,15, 6,"fill:#bbbbdd;opacity:0.8");
				map.Dom.newShape('rect',overviewThumbMarker, -3,-20,6 ,15,"fill:#bbbbdd;opacity:0.8");
				map.Dom.newShape('rect',overviewThumbMarker, -3,  5,6 ,15,"fill:#bbbbdd;opacity:0.8");

				map.Dom.newShape('line',overviewThumbMarker,-25,  0,-10,  0,"stroke:red;");
				map.Dom.newShape('line',overviewThumbMarker, 10,  0, 25,  0,"stroke:red;");
				map.Dom.newShape('line',overviewThumbMarker,  0,-25,  0,-10,"stroke:red;");
				map.Dom.newShape('line',overviewThumbMarker,  0, 10,  0, 25,"stroke:red;");
			}
			overviewThumbMarker.style.setProperty("display","inline","");
			overviewThumbMarker.fu = new Methods(overviewThumbMarker);
			overviewThumbMarker.fu.setPosition(rectBox.width/this.nZoomX/2,rectBox.height/this.nZoomY/2);
		}
		else{
			if (overviewThumbMarker){
				overviewThumbMarker.style.setProperty("display","none","");
			}
		}

		var thumbBox = map.Dom.getBox(overviewThumbRect);
		var actualZaP = this.getFractionBox();
		this.overviewThumbObj.setMoveArea(new box(0,0,rectBox.width-thumbBox.width,rectBox.height-thumbBox.height));
		this.overviewThumbObj.setValue(new point(actualZaP.x,actualZaP.y));
	}
	else{
		if ( this.overviewNode 	&&  !this.overviewForcedToHide ){
			if ( this.overviewNode.getAttributeNS(szMapNs,"mode").match(/autohide/) && (map.Scale.nZoomScale != 1) ){
				this.initOverviewMap(evt);
			}
		}
	}
};
/**
 * execute mousemove event, inherited from the overviewmap (does nothing)
 * @param evt the mouse event
 */
Map.Zoom.prototype.onMouseMove = function(evt){
};
/**
 * execute mousedown event, inherited from the overviewmap (does nothing)
 * @param evt the mouse event
 */
Map.Zoom.prototype.onMouseDown = function(evt){
};
/**
 * execute mouseup event, inherited from the overviewmap. Set the map and zoom according to the position and size of the select rectangle of the overviewmap
 * @param evt the mouse event
 */
Map.Zoom.prototype.onMouseUp = function(evt){
	this.setFractionBox( new box(this.overviewThumbObj.fraction.x,this.overviewThumbObj.fraction.y,1/this.nZoomX,1/this.nZoomY));
};

/**
 * hide the overview map
 * @type boolean 
 * @return true, if overviewmap has been visible
 */
Map.Zoom.prototype.hideOverviewMap = function(){
	var overviewNode = SVGDocument.getElementById("legend:overviewmap");
	if (overviewNode && this.overviewThumbObj ){
		this.overviewThumbObj.remove();
		this.overviewThumbObj = null;
		this.overviewForcedToHide = true;
		this.overviewForcedToShow = false;
		map.Dom.clearGroup(overviewNode);
		try{
			map.Legend.init(null);
		}
		catch (e){
		}
		return true;
	}
	return false;
};
/**
 * show the overview map
 * @type boolean 
 * @return true, if overviewmap has been hidden
 */
Map.Zoom.prototype.showOverviewMap = function(){
	if ( !this.overviewThumbObj ){
		this.overviewForcedToShow = true;
		this.overviewForcedToHide = false;
		this.initOverviewMap(null);
		return true;
	}
	return false;
};
/**
 * hide the overview map content
 * @type boolean 
 * @return true, if overviewmap found
 */
Map.Zoom.prototype.hideOverviewMapContent = function(){
	var overviewNode = SVGDocument.getElementById("overviewmap:layer");
	if (overviewNode) {
		overviewNode.style.setProperty("display","none","");
		return true;
	}
	return false;
};
/**
 * show the overview map content
 * @type boolean 
 * @return true, if overviewmap found
 */
Map.Zoom.prototype.showOverviewMapContent = function(){
	var overviewNode = SVGDocument.getElementById("overviewmap:layer");
	if (overviewNode) {
		overviewNode.style.setProperty("display","inline","");
		return true;
	}
	return false;
};
/**
 * activate theme 
 * @param szTheme the name of the theme to be activated
 */
function activateTheme(szTheme){

	if (szTheme.match(/:label/)){
		return;
	}

	// subtract tile appendix
	szTheme = map.Tiles.getMasterId(szTheme);

	if (_activeTheme == szTheme){
		return;
	}
	_TRACE('hit:'+szTheme);

	// GR 05.06.2012 
	if ( szTheme == "mapcanvas" ){
		return;
	}

	var legendIdent = SVGDocument.getElementById("legend:ident:"+szTheme);
	if ( legendIdent){
		clearThemes();
		_legendIdent = legendIdent;
		var textNode = _legendIdent.nextSibling.nextSibling;
		if (textNode && textNode.nodeName == "text" ){
			try{
				var bBox = map.Dom.getBox(textNode);
				_legendIdent.setAttributeNS(null,"width",bBox.width+map.Scale.normalX(10));
			}
			catch (e){
			}
		}
		_legendIdent.style.setProperty("display","inline","");
		_activeTheme = szTheme;

		// GR 25.10.2011 new; show info if we have an active theme
		// --------------------------------------------------------
		if ( fActiveThemeInfo ){
			var ptPos = new point(map.Scale.mapPosition.x,map.Scale.mapPosition.y+map.Scale.normalX(nToolMarginTop));
			if ( map.Viewport.szPopupAlignment.match(/TOP/) ){
				ptPos.y = map.Scale.bBox.height+map.Scale.mapPosition.y-map.Scale.normalY(38);
			}
			var _activeThemeInfo = new InfoContainer(SVGDocument,SVGMenuGroup,"movable",ptPos,{x:map.Scale.normalX(5),y:map.Scale.normalY(5)},"fix");
			_activeThemeInfo.frameNode.style.setProperty("fill","#fafafa","");
			_activeThemeInfo.setTitle("info on");
			_activeThemeInfo.setOnRemove("clearThemes()");

			var infoWorkspace = _activeThemeInfo.workspaceNode;
			var szTextStyle = map.Scale.tStyle.Description.szStyle;
			map.Dom.newText(infoWorkspace,map.Scale.normalX(5),map.Scale.tStyle.Description.nFontHeight,szTextStyle,textNode.firstChild.nodeValue);
			_activeThemeInfo.reformat();
		}
		// --------------------------------------------------------

		try{
			HTMLWindow.ixmaps.htmlgui_setActiveTheme(szTheme);
		}
		catch (e){
		}
		try{
			map.Themes.redrawInfoAll(null);
		}
		catch (e){
		}
	}
	else{
		clearThemes();
		_removeInfo(null);
		_activeTheme = szTheme;
		try{
			HTMLWindow.ixmaps.htmlgui_setActiveTheme(szTheme);
		}
		catch (e){
		}
		try{
			map.Themes.redrawInfoAll(null);
		}
		catch (e){
		}
	}

	// GR 21.01.2011 test test test
	map.Layer.setPointerEvents(_activeTheme);

	_activeItem = null;
}
/**
 * get active theme 
 */
function getActiveTheme(){
	return _activeTheme;
}
/**
 * is active theme 
 */
function isActiveTheme(szTheme){
	return ( szTheme == _activeTheme );
}
/**
 * deactive theme 
 */
function deactivateTheme(szTheme){
	if ( isActiveTheme(szTheme)){
		clearThemes();
	}
}
/**
 * clear highlight in legend
 */
function clearThemes(){
	if (_legendIdent){
		_legendIdent.style.setProperty("display","none","");
		_legendIdent = null;
	}
	_activeTheme = null;
	highLightList.removeAll();
	return;
	if ( szMapToolType == "info" ){
		setMapTool("");	
	}
	try{
		map.Themes.redrawInfoAll(null);
	}
	catch (e){
	}
	// GR 21.01.2011 test test test
	map.Layer.setPointerEvents();
}
/**
 * highlight theme 
 * @param szTheme the name of the theme to be activated
 */
 __highlightedTheme = null;
function highlightTheme(mapObj){

	while ( mapObj && (mapObj.objNode.nodeName != 'g') && mapObj.objNode.parentNode ){
		if ( (mapObj = new MapObject(mapObj.objNode.parentNode)) == null ){
			return;
		}
	}

	// subtract tile appendix
	var szTheme = mapObj.szId;
	if ( map.Tiles ){
		szTheme = map.Tiles.getMasterId(szTheme);
	}
	var szValue = mapObj.objNode.getAttributeNS(szMapNs,"value");
	if ( (!szValue || szValue.length < 1) && (mapObj.objNode.firstChild && mapObj.objNode.firstChild.nextSibling) ){
		szValue = mapObj.objNode.firstChild.nextSibling.getAttributeNS(szMapNs,"value");
	}
	if ( szValue && szValue.length ){
		szTheme = szTheme.split('::')[0]+'::'+szValue;
	}

	_TRACE("highlightTheme:  "+"legend:ident:"+szTheme);
	__highlightedTheme = SVGDocument.getElementById("legend:ident:"+szTheme);
	if ( __highlightedTheme ){
		var textNode = __highlightedTheme.nextSibling.nextSibling;
		if (textNode && textNode.nodeName == "text" ){
			var bBox = map.Dom.getBox(textNode);
			__highlightedTheme.setAttributeNS(null,"width",bBox.width+map.Scale.normalX(10));
		}
		__highlightedTheme.style.setProperty("display","inline","");
	}
}
/**
 * get active theme 
 */
function highlightThemeRemove(){
	if (__highlightedTheme){
		__highlightedTheme.style.setProperty("display","none","");
		__highlightedTheme = null;
	}
}

// .............................................................................
// popup tooltip     
// ..............................................................................

/**
 * Display the tooltip of an SVG shape as popup text at the mouse position.
 * To do this with delay, an execute function is called by setTimeout(...)
 * @param infoShape the SVG shape to get the 'tooltip' from (as attribute tooltip='...')
 */
function displayTooltip(evt,infoShape){

	if (infoShape && infoShape.nodeType == 1 ){
		// read tooltip from shape
		var szText = (infoShape.getAttributeNS(szMapNs,"tooltip") || "");
		// add parents tooltips until 'g' element
		while ( (infoShape = infoShape.parentNode) != null ){
			if ( !(infoShape.nodeName == 'g') ){
				break;
			}
			var szXText = infoShape.getAttributeNS(szMapNs,"tooltip");
			if ( szXText && szXText.length ){
				szText += (szText.length?String.fromCharCode(32,160):"") + szXText;
			}
		}
		if (szText && szText.length ){
			try{
				szText = map.User.onTooltipDisplay(null,szText,infoShape);
				}
			catch (e){
			}
			try{
				szText = HTMLWindow.ixmaps.htmlgui_onTooltipDisplay(szText,infoShape);
				}
			catch (e){
			}
			var position = map.Scale.getClientMousePosition(evt,SVGPopupGroup);
			killTooltip();
			idTooltipTimeout = setTimeout("doDisplayTooltip(\""+__stripQuotes(szText)+"\","+position.x+","+position.y+")",nTooltipTimeout);
			return true;
		}
	}
	return false;
}
function displayTooltipText(evt,szText){

	if ( szText && szText.length ){
		var position = map.Scale.getClientMousePosition(evt,SVGPopupGroup);
		killTooltip();
		idTooltipTimeout = setTimeout("doDisplayTooltip('"+__stripQuotes(szText)+"',"+position.x+","+position.y+")",nTooltipTimeout);
	}
}

function __stripQuotes(szText){

	var szTextA = szText.split('"');
	szText = szTextA[0];
	for (var i=1; i<szTextA.length; i++){
		szText += "``"+szTextA[i];
	}
	return szText;
}
function __encodeSingleQuote(szText){

	var szTextA = szText.split('\'');
	szText = szTextA[0];
	for (var i=1; i<szTextA.length; i++){
		szText += "`"+szTextA[i];
	}
	return szText;
}
function __encodeDoubleQuotes(szText){

	var szTextA = szText.split('"');
	szText = szTextA[0];
	for (var i=1; i<szTextA.length; i++){
		szText += "\\\""+szTextA[i];
	}
	return szText;
}
function __decodeSingleQuote(szText){

	var szTextA = szText.split("`");
	szText = szTextA[0];
	for (var i=1; i<szTextA.length; i++){
		szText += '\''+szTextA[i];
	}
	return szText;
}
/**
 * Display the tooltip at delay timeout 
 * @param szText the 'tooltip' text
 * @param xPos the x position of the popup
 * @param yPos the y position of the popup
 */
function doDisplayTooltip(szText,xPos,yPos){

	idTooltipTimeout = null;

	if (!szText || !szText.length){
		return;
	}
	SVGTltipGroup.fu.clear();
	var position = new point(xPos,yPos);
	if (szText.length){
		szText =  map.Dictionary.getLocalText(szText);
		var offset = new point(map.Scale.normalX(20),map.Scale.normalY(20));
		var newText = createTextField(SVGDocument,SVGTltipGroup,'tooltip',szText);
		newText.style.setProperty("pointer-events","none","");
		var textBox = map.Dom.getBox(newText);
		if ( SVGPopupGroup.hasChildNodes ){
			position.y -= map.Scale.normalY(20);
		}
		if ((position.x+offset.x+textBox.width) > map.Scale.viewBox.width ){
			position.x -= ((position.x+offset.x+textBox.width) - map.Scale.viewBox.width);
			position.y += textBox.height;
		}
		if ((position.y+offset.y+textBox.height) > map.Scale.viewBox.height ){
			position.y -= textBox.height + offset.y*2;
		}
		newText.fu.setPosition(position.x+offset.x,Math.max(position.y+offset.y,100));
		_tooltip = newText;
	}
}

/**
 * Clear the tooltip timeout, so a pending tooltip is not executed.
 * Called if the mouse gets 'out', or before a new tooltip is defined.
 */
function killTooltip(){
	if (idTooltipTimeout){
		clearTimeout(idTooltipTimeout);
	}
	if (_tooltip){
		SVGTltipGroup.fu.clear();
		_tooltip=null;
	}
}

// .............................................................................
// dictionary      
// ..............................................................................

/**
 * Create a new Dictionary instance.  
 * @class It realizes local text translations
 * @constructor
 * @throws 
 * @return A new Dictionary Object
 */
Dictionary = function() {
	this.szDictionary = [];
};
// realize the dictionary here, to have it ready
map.Dictionary = new Dictionary();

/**
 * add a definition pair into the dictionary 
 * @param szOrig the original text
 * @param szLocal the localized text
 */
Dictionary.prototype.add = function(szOrig,szLocal){
	if ( !this.szDictionary[szOrig] ){
		this.szDictionary[szOrig] = szLocal;
	}
};
/**
 * replace a definition pair in the dictionary 
 * @param szOrig the original text
 * @param szLocal the localized text
 */
Dictionary.prototype.replace = function(szOrig,szLocal){
	this.szDictionary[szOrig] = 	szLocal;
};
/**
 * get the local translation of an arbitrary text 
 * @param szText the source text
 * @type string
 * @return the translated text, or the original text if no translation found
 */
Dictionary.prototype.getLocalText = function(szText){
	try{
		if ( typeof(this.szDictionary[szText]) != 'undefined' ){
			return String(this.szDictionary[szText]);
		}
		else {
			var szDText = "";
			var szTextA = szText.split(' ');
			for ( var i=0; i<szTextA.length; i++ ){
				var szTrans = this.szDictionary["'"+szTextA[i]+"'"];
				szDText += String(szTrans?szTrans:szTextA[i]);
				szDText += (i<szTextA.length-1)?" ":"";
			}
			return szDText;
		}
	}
	catch (e){
		return szText;
	}
};
/**
 * translate all texts contained as childs in a given node 
 * @param nodeObj the root node to look for contained text nodes
 */
Dictionary.prototype.applyToNode = function(nodeObj){
	_TRACE("--- apply dictionary");
	var textNodesA = nodeObj.getElementsByTagName("text");
	for ( var i=0; i<textNodesA.length; i++ ){
		textNodesA.item(i).firstChild.nodeValue = this.getLocalText(textNodesA.item(i).firstChild.nodeValue);
	}
};

// .................................................................... 
// display loading, waiting, ... text               
// .................................................................... 

// to avoid flickering of messages
var tClearMessage = null;
var tClearNotify = null;

/**
 * Display the given text as message in the center of the SVG object  
 * @param szMessage		the text to display
 */
function displayMessage(szMessage,nTimeout,fAlert){

	if ( (fAlert == "notify") && !fNotify ){
		return;
	}

	if ( (typeof(szMessage) != 'string') || (szMessage.length == 0) ){
		SVGMessageGroup.fu.clear();
		return;
	}
	if ( tClearMessage ){
		clearTimeout(tClearMessage);
		tClearMessage = null;
	}
	szMessage =  map.Dictionary.getLocalText(szMessage);
	// use HTML messaging if possible
	//
	if ( fAlert != "notify" ){
		if ( map.isInitializing() ){
			try{
				HTMLWindow.ixmaps.htmlgui_displayInfo(szMessage);
				return;
			}
			catch (e){}
		}else{
			try{
				if ( HTMLWindow.ixmaps.htmlgui_isInfoDisplay() ){
					HTMLWindow.ixmaps.htmlgui_displayInfo(szMessage);
					return;
				}
			}
			catch (e){}
		}
	}

	// SVG messaging 
	//
	if ( fAlert == "big" ){
		var fontheight   = 64;
		var szTemplate = "transparent";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.normalY(64)
							 );
	}else
	if ( fAlert == "notify" ){
		var fontheight   = 24;
		var szTemplate = "flat";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.mapPosition.y + (map.Scale.normalY(fontheight*2/3) + nToolMarginTop)
							 );
	}else
	if ( fAlert == "top" ){
		var fontheight   = 24;
		var szTemplate = "flat";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.mapPosition.y + (map.Scale.normalY(fontheight*2/3) + nToolMarginTop)
							 );
	}else
	if ( 1 || szMessage.match(/initial/) || fAlert ){
		var fontheight   = 36;
		var szTemplate = "flat";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.bBox.height/2+map.Scale.mapPosition.y-map.Scale.normalX(fontheight/2) 
							 );
	}else{
		var fontheight   = 16;
		var szTemplate = "light";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.mapPosition.y+map.Scale.normalX((fMapBorder3D?4:6.2) + nToolMarginTop)
							 );
	}
	if(SVGDocument && SVGMessageGroup){

		(fAlert == "notify")?SVGNotifyGroup.fu.clear():SVGMessageGroup.fu.clear();
		if ( szMessage && szMessage.length ){

			var newGroup = null;

			try{
				var textField = new TextField(null,(fAlert == "notify")?SVGNotifyGroup:SVGMessageGroup,szTemplate,fontheight);
				textField.setText(szMessage);
				newGroup = textField.textGroup;
				var bBox = newGroup.fu.getBox();
				newGroup.fu.setPosition(ptPos.x-bBox.width/2,ptPos.y+bBox.height/2);
			}
			catch (e){
				newGroup = createTextField(SVGDocument,(fAlert == "notify")?SVGNotifyGroup:SVGMessageGroup,"popup_message",szMessage,fontheight);
				try{
					var bBox = newGroup.fu.getBox();
					newGroup.fu.setPosition(ptPos.x-bBox.width/2,ptPos.y+bBox.height/2);
				}
				catch (e){
					newGroup.fu.setPosition(ptPos.x-map.Scale.normalX(50),ptPos.y+map.Scale.normalX(10));
				}
			}
		}
	}

	if (nTimeout){
		(fAlert == "notify")?clearNotify(nTimeout):clearMessage(nTimeout);
	}

}
/**
 * Clear the message text box  
 */
function clearMessage(nTimeout){
	do_clearMessage(nTimeout||500);
}
function do_clearMessage(nTimeout){
	if (nTimeout){
		if ( tClearMessage ){
			clearTimeout(tClearMessage);
		}
		tClearMessage = setTimeout("do_clearMessage()",nTimeout);
		return;
	}
	else{
		try{
			HTMLWindow.ixmaps.htmlgui_killInfo();
		}
		catch (e){
		}
		SVGMessageGroup.fu.clear();
	}
}
/**
 * Clear the notify text box  
 */
function clearNotify(nTimeout){
	if (nTimeout){
		if ( tClearNotify ){
			clearTimeout(tClearNotify);
		}
		tClearNotify = setTimeout("clearNotify()",nTimeout);
		return;
	}
	else{
		SVGNotifyGroup.fu.clear();
	}
}
/**
 * Display the given text as message in the center of the SVG object  
 * @param szMessage		the text to display
 */
function displayProgressBar(nActual,nMaximal,szMessage,nTimeout,szCancel,nElapsedTime){

	if ( 0 ){
		var fontheight   = 24;
		var szTemplate = "messagetext_template";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.bBox.height/2+map.Scale.mapPosition.y 
							 );
	}else{
		var fontheight   = 13;
		var szTemplate = "light";
		var ptPos = new point(  map.Scale.bBox.width/2+map.Scale.mapPosition.x
							   ,map.Scale.mapPosition.y+map.Scale.normalX((fMapBorder3D?6:0) + nToolMarginTop)
							 );
	}

	if(SVGDocument && SVGMessageGroup){

		if ( !szMessage ){ szMessage = ""; }
		szMessage =  map.Dictionary.getLocalText(szMessage);
		var newGroup = null;
		var workspaceNode = null;

		var textField = new TextField(null,SVGMessageGroup,fPDFEmbed?"":szTemplate,fontheight);
		if (textField){
			textField.setText(szMessage);
			newGroup = textField.textGroup;
			workspaceNode = textField.workspaceNode;
		}
		else{
			newGroup = createTextField(SVGDocument,SVGMessageGroup,"popup_message",szMessage,24);
			workspaceNode = newGroup;
		}

		var nBarWidth = 100;
		var nBarHeight = fontheight/2.4; //10;
		var nStep	= nBarWidth/nMaximal;
		var nHeight = nBarHeight;
		var nXoff   = szMessage.length*fontheight/2;
		var nYoff   = nHeight-fontheight;
		var bBox = map.Dom.getBox(workspaceNode);
		if ( bBox.width ){
			var nXoff   = bBox.width + 10;
		}
		var maxRect = map.Dom.newShape('rect',workspaceNode,nXoff,nYoff,nBarWidth+2,nHeight,"fill:none;stroke:none;");
		var maxRect = map.Dom.newShape('rect',workspaceNode,nXoff,nYoff,nMaximal*nStep,nHeight,"fill:none;stroke:grey;");
		var actRect = map.Dom.newShape('rect',workspaceNode,nXoff,nYoff,nActual*nStep,nHeight,"fill:green;stroke:none;");

		if ( szCancel ){
			buttonObj = new Button(workspaceNode,"","BUTTON",'#delete_button'
							,szCancel
							,""
							,"cancel operation");
			buttonObj.scale(1/map.Scale.normalX(1),1/map.Scale.normalY(1));
			buttonObj.setPosition(nXoff+nBarWidth+20,-nBarHeight);
		}

		if ( nElapsedTime && nActual ){
			var szText  =     map.Dictionary.getLocalText("done")+" "+nActual+
						  " "+map.Dictionary.getLocalText("/")  +" "+nMaximal+
						  " "+map.Dictionary.getLocalText("in")  +" "+ __formatTime(nElapsedTime)+
						  " ";
			     szText += map.Dictionary.getLocalText("estimated time left")+": "+__formatTime((nElapsedTime/nActual*nMaximal)-nElapsedTime);
			var newText = map.Dom.newText(workspaceNode,0,fontheight*1.2,"font-family:arial;font-size:"+fontheight+"px;fill:gray;",szText);
		}

		if (textField){
			textField.resizeField();
		}
		try{
			var bBox = newGroup.fu.getBox();
			newGroup.fu.setPosition(ptPos.x-bBox.width/2,ptPos.y+map.Scale.normalY(fontheight*1.3));
		}
		catch (e){
		}
	}

	if (nTimeout){
		clearMessage(nTimeout);
	}
}
/**
 * Display the given text as Debug Output in the left upper corner  
 * @param szMessage		the text to display
 */
var debugLine = 0;
function _TRACE(szMessage){

	if ( typeof(console) != "undefined"  && typeof(console.log) != "undefined"  ){
		var x = new Date();
		var time = x.getMinutes()+":"+String(x.getSeconds())+"."+String(x.getMilliseconds());
		console.log("_TRACE: time["+time+"] "+szMessage);
		return;
	}

	if ( fPDFEmbed ){
		if (!fDebug){ 
			return;
		}
	}

	try{
		TRACE(szMessage);
	}
	catch (e){
		if (fDebug){
			var fontHeight   = 12;
			try{
				if(SVGDocument && SVGMenuGroup){

					var newGroup = createTextField(SVGDocument,SVGMenuGroup,'message',szMessage);
					newGroup.fu.setPosition(map.Scale.normalX(0),map.Scale.normalY(debugLine*(fontHeight+6)));
					if (++debugLine>20){
						debugLine=0;
						SVGMenuGroup.fu.clear();
					}
				}
			}
			catch (e){
			}
		}
	}
}
/**
 * console log with time stamp of the givven text   
 * @param szMessage	the text to display
 */
function _LOG(szMessage){

	if ( typeof(console) != "undefined"  && typeof(console.log) != "undefined"  ){
		var x = new Date();
		var time = x.getMinutes()+":"+String(x.getSeconds())+"."+String(x.getMilliseconds());
		console.log("_LOG: time["+time+"] "+szMessage);
		return;
	}
}
/**
 * Display the given text as status line output in the defined SVG group "legend:statusgroup"  
 * @param szMessage		the text to display
 */
function _STATUS(szMessage){
	if ( !fStatus ){
		return;
	}
	var statusGroup = map.Dom.getObjectById("legend:statusgroup");
	if ( !statusGroup ){
		var scaleGroup = map.Dom.getObjectById("legend:scalegroup");
		statusGroup = map.Dom.newGroup(scaleGroup,"legend:statusgroup");
	}
	map.Dom.clearGroup(statusGroup);
	var fontheight = 12;
	var newText = map.Dom.newText(statusGroup,map.Scale.normalX(220),map.Scale.normalY(fontheight),"font-family:arial;font-size:"+map.Scale.normalY(fontheight)+"px;fill:black",szMessage);
	return;
}

/**
 * Display the given text as Debug Output in the left upper corner  
 * @param szMessage		the text to display
 */
function _INFO(szMessage){

	try{
		HTMLWindow.ixmaps.htmlgui_displayInfo(szMessage);
	}
	catch (e){
		_TRACE(szMessage);
		if (fDebug){
			var fontheight   = 12;
			if(SVGDocument && SVGMessageGroup){
				var newGroup = createTextField(SVGDocument,SVGMessageGroup,'message',szMessage);
				newGroup.fu.setPosition(map.Scale.normalX(0),map.Scale.normalY(0));
			}
		}
	}
}
function _KILLINFO(){
	try{
		HTMLWindow.ixmaps.htmlgui_killInfo();
	}
	catch (e){}
}
/**
 * Display the given text as Debug Error Output
 * @param szMessage		the text to display
 */
function _ERROR(szMessage){
	try{
		HTMLWindow.ixmaps.htmlgui_errorLog(szMessage);
	}
	catch (e){
		_TRACE(szMessage);
		if (fDebug){
			var fontheight   = 12;
			if(SVGDocument && SVGMessageGroup){
				var newGroup = createTextField(SVGDocument,SVGMessageGroup,'message',szMessage);
				newGroup.fu.setPosition(map.Scale.normalX(0),map.Scale.normalY(0));
			}
		}
	}
}


// .................................................................... 
// display popup text               
// .................................................................... 

var __textField_group = null;
var __textField_frame = null;
var __textField_shadow = null;
var __textField_fontheight = 12;
/**
 * Display the given text with autosizing background and shadow  
 * @param SVGDocument		the target document
 * @param SVGTargetGroup	the target group
 * @param szId				give the new element this id
 * @param szText			the text to display
 */
function createTextField(SVGDocument,SVGTargetGroup,szId,szText,fontheight){
	if ( !fontheight){
		fontheight   = 12;
	}
	if(SVGDocument && SVGTargetGroup){
		var newGroup = map.Dom.newGroup(SVGTargetGroup,szId);
		var newShadow = map.Dom.newShape('rect',newGroup,1,1,1,1,"fill:#444444;opacity:0.5;stroke:none");
		var newRect = map.Dom.newShape('rect',newGroup,1,1,1,1,"fill:#fefeff;stroke:#444444;stroke-width:"+map.Scale.normalX(0.2)+"");
		var newText = map.Dom.newText(newGroup,0,map.Scale.normalY(fontheight*1.25),"font-family:arial;font-size:"+map.Scale.normalY(fontheight)+"px;fill:"+szInfoBodyColor+"",szText);

		__textField_group  = newGroup;
		__textField_frame  = newRect;
		__textField_shadow = newShadow;
		__textField_fontheight = fontheight;

		if ( 0 && szViewer.match(/Netscape/) ){
			setTimeout("sizeTextField()",10);
		}else{
			sizeTextField();
		}
		
		return newGroup;
	}
}
function sizeTextField(){
		var fontheight = __textField_fontheight;
		var bBox = map.Dom.getBox(__textField_group);
		__textField_frame.setAttributeNS(null,"rx" ,map.Scale.normalX(2));
		__textField_frame.setAttributeNS(null,"ry" ,map.Scale.normalX(2));
		__textField_frame.setAttributeNS(null,"x" ,-map.Scale.normalX(fontheight*0.75));
		__textField_frame.setAttributeNS(null,"y" ,-map.Scale.normalY(1));
		__textField_frame.setAttributeNS(null,"width" ,bBox.width +map.Scale.normalX(fontheight*1.5));
		__textField_frame.setAttributeNS(null,"height",bBox.height+map.Scale.normalY(fontheight)/2);

		__textField_shadow.setAttributeNS(null,"rx" ,map.Scale.normalX(4));
		__textField_shadow.setAttributeNS(null,"ry" ,map.Scale.normalX(4));
		__textField_shadow.setAttributeNS(null,"x" ,-map.Scale.normalX(fontheight*0.75)+map.Scale.normalX(2));
		__textField_shadow.setAttributeNS(null,"y" ,map.Scale.normalY(2));
		__textField_shadow.setAttributeNS(null,"width" ,bBox.width +map.Scale.normalX(fontheight*1.5)+map.Scale.normalX(1.5));
		__textField_shadow.setAttributeNS(null,"height",bBox.height+map.Scale.normalX(fontheight)/2-map.Scale.normalX(0));
		return;
}


/*
@ -----------------------------------------------------------------------------
@ H e l p e r 
@ -----------------------------------------------------------------------------
*/
function executeWithMessage(szFu,szMessage,nTimeout){
	if ( fExecuteSilent ){
		setTimeout("doExecuteWithMessage(\""+__encodeDoubleQuotes(szFu)+"\")",nTimeout);
		//doExecuteWithMessage(szFu);
		return;
	}

	if ( typeof(nTimeout) == "undefined" ){
		nTimeout = 100;
	}
	// GR 18.06.2014 displayMessage with 3. parameter true -> alert style -> centered
	displayMessage(szMessage,null,szMessagePosition);
	setTimeout("doExecuteWithMessage(\""+__encodeDoubleQuotes(szFu)+"\")",nTimeout);
}
function doExecuteWithMessage(szFu){

	if ( map.isIdle() ){
		clearMessage(250);
	}
	setTimeout("SVGMessageGroup.fu.clear()",500);
	
	try{
		eval(szFu);
	}
	catch (e){
		alert("error '"+e+"' on: "+szFu);
	}

}
function executeWithProgressBar(szFu,nActual,nMaximal,szMessage,szCancel,nElapsedTime){
	displayProgressBar(nActual,nMaximal,szMessage,0,szCancel,nElapsedTime);
	setTimeout(szFu,1);
}

function __doGetPolygonSurface(ptList,fWidget){
	for ( a in ptList ){
		if (fWidget){
			// get lan lon coordinates
			var mapPos   = map.Scale.getMapPosition(ptList[a].x,ptList[a].y);
			var mapCoord = map.Scale.getMapCoordinate(mapPos.x,mapPos.y);
				mapCoord = map.Scale.getGeoCoordinateOfPoint(mapCoord.x,mapCoord.y);
				// aprossimativo ??
				mapCoord = _LLtoUTM("WGS84", mapCoord.y, mapCoord.x);
		}
		else{
			var mapCoord = map.Scale.getMapCoordinateUTM(ptList[a].x,ptList[a].y);
		}
		ptList[a].x  = mapCoord.x;
		ptList[a].y  = mapCoord.y;
	}
	var nArea = 0;
	var nCalc = 0;
	ptList[ptList.length] = ptList[0];
	for ( i=0; i<ptList.length-1; i++ ){
		nCalc = ((ptList[i].x*ptList[i+1].y) - (ptList[i+1].x*ptList[i].y));
		nArea += nCalc;
	}
	return (nArea /= 2);
}
function __doGetPolygonCenter(ptList){
	var ptCenter = new point(0,0);
	for ( a in ptList ){
		ptCenter.x += ptList[a].x;
		ptCenter.y += ptList[a].y;
	}
	ptCenter.x /= ptList.length;
	ptCenter.y /= ptList.length;
	return(ptCenter);
}

/**
 * transform a style string: name:value;name:value ... into an object
 * @param szStyle the style string
 * @return an object of the kind: object.name = value
 */
function __getStyleObj(szStyle){
	if ( szStyle == null || szStyle.length < 2 ){
		return null;
	}
	try{
		map.styleObj = {};
		var szPartsA = szStyle.split(';');
		for ( var i=0;i<szPartsA.length;i++ ){
			if (szPartsA[i].length){
				var szPartA = szPartsA[i].split(':');
				var nPLen = szPartA[0].length+1;
				var szValue = szPartsA[i].substr(nPLen,szPartsA[i].length-nPLen);
				map.styleObj[szPartA[0].trim()] = szValue;
			}
		}
		return map.styleObj;
	}
	catch (e){
		alert("ERROR parsing: "+szStyle);
	}
	return null;
}
/**
 * transform a style string: name:value;name:value ... into a named array
 * @param szStyle the style string
 * @return an object of the kind: object.name = value
 */
function __getStyleArray(szStyle){
	if ( szStyle == null || szStyle.length < 2 ){
		return null;
	}
	try{
		var styleA = new Array(0);
		var szPartsA = szStyle.split(';');
		for ( var i=0;i<szPartsA.length;i++ ){
			if (szPartsA[i].length){
				var szPartA = szPartsA[i].split(':');
				styleA[szPartA[0]] = szPartA[1];
			}
		}
		return styleA;
	}
	catch (e){
		alert("ERROR parsing: "+szStyle);
	}
	return null;
}
/**
 * sets the timer to zero
 */
var __timer_nMillisec = 0;
function __timer_reset(){
	var jetzt = new Date();
	__timer_nMillisec = jetzt.getTime();
}
/**
 * gets the elapsed time (in ms)
 */
function __timer_getMS(){
	var jetzt = new Date();
	var nActMilli = jetzt.getTime();
	return (nActMilli - __timer_nMillisec);
}
/**
 * gets the elapsed time (in ms)
 */
function __timer_getSEC(){
	var jetzt = new Date();
	var nActMilli = jetzt.getTime();
	return (nActMilli - __timer_nMillisec)/1000;
}
/**
 * convert a number of seconds into a formatted string like "4 hr 3 min 25 sec"
 * @param nValue the time in seconds to format
 * @type string
 * @return the formatted time as string
 */
function __formatTime(nValue){
	var nHour = Math.floor(nValue/3600);
	nValue -= nHour*3600;
	var nMin = Math.floor(nValue/60);
	nValue -= nMin*60;
	if (nHour){
		return String(nHour+" hr "+nMin+" min "+Math.floor(nValue)+" sec");
	}
	else if (nMin){
		return String(nMin+" min "+Math.floor(nValue)+" sec");
	}
	else{
		return String(Math.floor(nValue)+" sec");
	}
}
/**
 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1.023.234 
 * @param nValue the number to format
 * @param nPrecision the wanted decimal points 
 * @param szFlag "CEIL" or "FLOOR" (round either up or down)
 */
function __formatValue(nValue,nPrecision,szFlag){

	nValue = Number(nValue);

	if ( !isFinite(nValue) || !isFinite(nPrecision) ){
		return String(nValue);
	}
	if ( nValue == 0 ){
		return String(nValue);
	}

	if ( !fDecimalPointComma ){
		szFlag += "|BLANK";
	}

	if ( !nPrecision ){
		nPrecision = 0;
	}
	nPrecision = Math.max(0,nPrecision);

	// GR 02.12.2011 make that low values do not collapse to 0
	if ( (nValue > 0.0000001) && (nPrecision > 0) ){
		while ( nValue.toFixed(nPrecision) == 0 ){
			nPrecision++;
		}
	}
	
	// GR 11.03.2009 fix precision before CEIL or FLOOR to avoid JS errors eg. 0.0000000000003
	nValue = nValue.toFixed(nPrecision+1);

	nClipDecimal = Math.pow(10,nPrecision);
	if (szFlag && szFlag.match(/CEIL/)){
		nValue = Math.ceil(nValue*nClipDecimal)/nClipDecimal;
	}else
	if (szFlag && szFlag.match(/FLOOR/)){
		nValue = Math.floor(nValue*nClipDecimal)/nClipDecimal;
	}
	else{
		nValue = Math.round(nValue*nClipDecimal)/nClipDecimal;
	}
	// format numbers > 1000
	if ( 0 && (nValue < 1000) ){
		return String(nValue);
	}
	else {
		var szDecimals = String(nValue);
		if (szDecimals.match(/\./) ){
			szDecimals = szDecimals.split(".")[1];
		}else {
			szDecimals = "";
		}
		while ( szDecimals.length < nPrecision ){
			szDecimals += '0';
		} 
		var szReturn = nValue<0?"-":"";
		var szLeading = "";

		nValue = Math.floor(Math.abs(nValue));

		// GR new flag
		if ( !szFlag || !szFlag.match(/NOBREAKS/) ){
			var nClip = 1000;
			while (nValue > nClip){
				nClip *= 1000;
			}
			nClip /= 1000;

			var nPart = 0;
			var szBreak   = " ";
			while (nClip >= 1000){
				nPart = Math.floor(nValue/nClip);
				szReturn += __maptheme_formatpart(nPart,szLeading);
				nValue = nValue%nClip;
				nClip /= 1000;
				if ( nPart ){
					szLeading = "0";
					if (szFlag && szFlag.match(/BLANK/)){
						szBreak   = " ";
					}else{
						szBreak   = ".";
					}
				}
				szReturn += szBreak;
			}
		}

		szReturn += __maptheme_formatpart(nValue,szLeading);

		if ( !szReturn.length || (szReturn == "-") ){
			szReturn += "0";
		}

		if ( szDecimals.length && szDecimals != "00" ){
			szReturn += ((szFlag && szFlag.match(/BLANK/))?".":",") + szDecimals;
		}
	}
	return	szReturn;
}
/**
 * helper to format a number from 0 to 999 into a string with leading character (sample 32 -> "032" )
 * @param nPart the number to format
 * @param szLeading the leading character to insert if necessary 
 */
function __maptheme_formatpart(nPart,szLeading){
	if (!szLeading){
		szLeading = "";
	}
	var szPart = "";
	if (nPart<100){
		szPart += szLeading;
	}
	if (nPart<10){
		szPart += szLeading;
	}
	if (nPart==0){
		szPart += szLeading;
	}
	else{
		szPart += String(nPart);
	}
	return szPart;
}

/*
@ -----------------------------------------------------------------------------
@ S V G   f r a g m e n t s   l o a d i n g
@ -----------------------------------------------------------------------------
*/

/**
 * Create a new SVGLoader instance.  
 * @class A loader can import SVG files to the current SVG document
 * @constructor
 * @throws 
 * @return A new SVGLoader
 */
function SVGLoader(){

	this.szUrlA = new Array(0);
	this.stackA = new Array(0);
	this.nPending  = 0;

	/**
	 * Import a SVG file containing a map tile to a specified group of the given document<br>  
	 * Stacks the import, is fLoadTilesMulti is false
	 * @param  szUrl
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.importSVGFile = function(szUrl, svgDocument, targetGroup, callback){

		_TRACE("SVGLoader: "+szUrl);
		
		if (this.szUrlA[szUrl] == targetGroup){
			return false;
		}
		if ( 0 && !fLoadMultiTiles && this.isWaiting() ){
			this.push(szUrl, svgDocument, targetGroup, callback);
		}
		else{
			this.doImportSVGFile(szUrl, svgDocument, targetGroup, callback);
		}
	};
	/**
	 * stack one tile import information (clled when no multi import allowed)
	 * @param  szUrl
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.push = function(szUrl, svgDocument, targetGroup, callback){
		_TRACE("SVGLoader: "+szUrl+" (push!)");
		this.stackA.push({szUrl:szUrl,svgDocument:svgDocument,targetGroup:targetGroup,callback:callback});	
	};
	/**
	 * unstack one tile import information<br>
	 * calls .doImportSVGFile(...) method if there is a stacked tile to import
	 */
    this.pop = function(){
		if ( !this.isWaiting() ){
			var nextTile = this.stackA.shift();
			if (nextTile){
				_TRACE("SVGLoader: "+nextTile.szUrl+" (pop)");
				this.doImportSVGFile(nextTile.szUrl, nextTile.svgDocument, nextTile.targetGroup, nextTile.callback);
			}
		}
	};
	/**
	 * Import a SVG file to a specified group of the given document  
	 * @param  szUrl
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.doImportSVGFile = function(szUrl, svgDocument, targetGroup, callback){
		this.nPending++;
        function CallbackHandler(parent){
			this.parent = parent;
        }
        CallbackHandler.prototype.operationComplete = function (status){
			this.parent.nPending--;
			this.parent.pop();
			if (status.success){
				var svgSrc = status.content;
			   
				var d =  parseXML(svgSrc,svgDocument);

				this.processImported(d);
				_LOG("SVGLoader: "+szUrl+" (loaded)");
			}
			else{
			}
        };
        CallbackHandler.prototype.operationComplete2 = function (status,xmlObject,szText){
			this.parent.nPending--;
			this.parent.pop();
			_TRACE("SVGLoader: "+szUrl+" (operationComplete2) status="+status);
			if ( xmlObject && status == 200 ){
				this.processImported(xmlObject.documentElement);
				_LOG("SVGLoader: "+szUrl+" (loaded)");
			}
		};
        CallbackHandler.prototype.processImported = function (d){

			try{
				d = SVGDocument.importNode(d, true);
			}
			catch (e){
			}

			if (szUrl.match(/widget/)){
				// check for already defined templates, and remove them
				var idA = map.Dom.getAllIds(d);
				for(var i=0;i<idA.length;i++){
					var isObj = SVGDocument.getElementById(idA[i]);
					if ( isObj ){
						isObj.parentNode.removeChild(isObj);
					}
				}
			}
			if (szUrl.match(/pattern/)){
				targetGroup = map.Dom.newGroup(targetGroup,String(Math.random()));
			}

			targetGroup.appendChild(d);

			if (this.initMenu(targetGroup)){
				return;
			}
			this.initCSS(targetGroup);

			this.initScripts(targetGroup);

			if (szUrl.match(/widget/)){
				this.initToolbar(targetGroup);
				this.initOverviewmap(null);
			}

			if (szUrl.match(/logo/)){
				this.initLogo(targetGroup);
			}

			this.loadScripts(targetGroup);
			try{
				antiZoomAndPanList.initAntiZoomPattern(null,targetGroup);
				map.Layer.initPatternScaling(evt,targetGroup);
			}
			catch (e){
			}
			// normalize symbol center to 0,0 
			if (szUrl.match(/symbol/)){
				map.Scale.normalizeSymbols(targetGroup);
			}
			// normalize buttons center to 0,0 
			if (szUrl.match(/widget/)){
				map.Scale.normalizeButtons(targetGroup);
			}
        };
		CallbackHandler.prototype.initMenu = function(targetGroup){
			var menuObjectsA = targetGroup.getElementsByTagName('menu');
			if (menuObjectsA.length){
				// remove older menu entries
				for(var i=0;i<menuObjectsA.length;i++){
					var szId = menuObjectsA.item(i).getAttributeNS(null,"id");
					var firstObj = SVGDocument.getElementById(szId);
					if ( firstObj && (firstObj != menuObjectsA.item(i)) ){
						firstObj.parentNode.removeChild(firstObj);
						i--;
					}
				}
				return true;
			}
			return false;
		};
		CallbackHandler.prototype.initToolbar = function(targetGroup){
			try{
				map.Toolbar.init();
				map.Legend.init();
			}
			catch (e){
			}
			return true;
		};
		CallbackHandler.prototype.initOverviewmap = function(targetGroup){
			var overviewSrc  = SVGDocument.getElementById("overviewmap_widget");
			if (overviewSrc && map.Zoom){
				setTimeout("map.Zoom.initOverviewMap()",1);
			}
			return true;
		};
		CallbackHandler.prototype.initLogo = function(targetGroup){
			var logoGroup  = SVGDocument.getElementById("mapbackground:logo");
			if ( logoGroup == null ){
				logoGroup = map.Dom.newGroup(SVGDocument.getElementById("mapbackground"),"mapbackground:logo");
			}
			if (logoGroup){
				map.Dom.clearGroup(logoGroup);
				var svgNodesA = targetGroup.getElementsByTagName('svg');
				var childNodesA = svgNodesA.item(0).childNodes;
				for( var i=0;i<childNodesA.length;i++ ){
					logoGroup.appendChild(childNodesA.item(i));
					i--;
				}
			}
			return true;
		};
		CallbackHandler.prototype.loadScripts = function(targetGroup){
			var scriptObjectA = targetGroup.getElementsByTagName('script');
			for ( var i=0; i<scriptObjectA.length; i++ ){
				var szScript = scriptObjectA.item(i).getAttributeNS(szXlink,'href');
				if ( szScript && szScript.length ){
					var jsLoader = new JSLoader();
					jsLoader.loadScript(szScript);
				}
			}
			return true;
		};
		CallbackHandler.prototype.initScripts = function(targetGroup){
			var scriptObjectA = targetGroup.getElementsByTagName('script');
			for ( var i=0; i<scriptObjectA.length; i++ ){
				if (scriptObjectA.item(i).firstChild){
					var szScript = scriptObjectA.item(i).firstChild.nodeValue;
					try{
						eval(szScript);
					}
					catch(e){
						_LOG("ERROR: could not eval loaded script!");
					}
				}
			}
			return true;
		};
		CallbackHandler.prototype.initCSS = function(targetGroup){
			var cssStylesA = targetGroup.getElementsByTagName("style");
			if (cssStylesA.length){
				var cssStyleNode = SVGDocument.getElementById("mapstyles");
				_TRACE("TBD: initCSS in SVGLoader() !!!");
				return true;
			}
		return false;
		};

		if (szUrl.length > 0){
			getData(szUrl, new CallbackHandler(this));
		}
    };
	/**
	 * tell the number of pending tiles (svg fragments)  
	 * @return number of asynchronous data loads still pending
	 */
    this.isWaiting = function(){
		return this.nPending;
	};
}

/**
 * Import all SVG files referenced by include statements.
 * Includes are defined by SVG groups with an 'xlink:href' which
 * must! be inside the one and only! <g> with  id='mapinclude' 
 * @param  evt the event
 */

function loadSVGIncludes(evt,szPath,szFile){

	_TRACE("--- load includes (from "+szPath+")");

	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	var includeGroup = SVGDoc.getElementById("mapinclude");
	if ( includeGroup){

		if ( szPath && szPath.length > 1 ){
			var lastChar = szPath.substr(szPath.length-1,1);
			if ( lastChar != '\\' && lastChar != '/' ){
				szPath += '/';
			}
		}
		var includeA = includeGroup.getElementsByTagName("g");
		for ( var i=0; i<includeA.length; i++ ){
			var includeNode = includeA.item(i);
			var szUrl = includeNode.getAttribute("xlink:href");
			// maplocal is loaded explizit (see init)
			if ( !szUrl || szUrl.match(/maplocal/)){
				continue;
			}
			if ( szUrl.match(/mapmenu/)){
				continue;
			}
			if ( szUrl.match(/mapimages/)){
				continue;
			}
			if ( szUrl.match(/mappattern/)){
				continue;
			}
			if ( szUrl.match(/mapfilter/)){
				continue;
			}
			if ( szUrl && szUrl.length > 1 && (!szFile || (szUrl == szFile)) ){
				szUrl = szPath+szUrl;
				_TRACE("--- .include: "+szUrl);
				var xLoader = new  SVGLoader();
				map.Loader.importSVGFile(szUrl,SVGDoc,includeNode,null);
			}
		}
	}
}

/*
@ -----------------------------------------------------------------------------
@ T i l e s   l o a d i n g
@ -----------------------------------------------------------------------------
*/
/**
 * Create a new SVGLoaderTiles instance.  
 * @class A loader to import SVG files representing map tiles into the current SVG document
 * @constructor
 * @throws 
 * @return A new SVGLoaderTiles
 */
var __svgLoaderTiles = null;
function SVGLoaderTiles(){
	this.szUrlA = new Array(0);
	this.stackA = new Array(0);
	this.nPending  = 0;
	this.nRequest  = 0;
	this.nToLoad  = 0;
	__svgLoaderTiles = this;

	/**
	 * Import a SVG file containing a map tile to a specified group of the given document<br>  
	 * Stacks the import, is fLoadTilesMulti is false
	 * @param  szUrl the URL of the SVG file
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.importSVGFile = function(szUrl, svgDocument, targetGroup, callback){
		if (this.szUrlA[szUrl] == targetGroup){
			return false;
		}
		this.nRequest++;
		this.nToLoad++;
		// silent
		if ( fLoadingSilent ){
			this.doImportSVGFile(szUrl, svgDocument, targetGroup, callback);
		}
		// show progress bar
		else
		if ( !fLoadMultiTiles && this.isWaiting() ){
			this.push(szUrl, svgDocument, targetGroup, callback);
		}
		else{
			displayProgressBar(0,1,map.Dictionary.getLocalText("loading map elements"));
			this.push(szUrl, svgDocument, targetGroup, callback);
			setTimeout("__svgLoaderTiles.pop()",10);
		}
		return true;
	};
	/**
	 * stack one tile import information (called when no multi import allowed)
	 * @param  szUrl the URL of the SVG file
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.push = function(szUrl, svgDocument, targetGroup, callback){
		if ( !this.isStacked(szUrl, svgDocument, targetGroup)){
			this.stackA.push({szUrl:szUrl,svgDocument:svgDocument,targetGroup:targetGroup,callback:callback});	
		}
	};
	/**
	 * unstack one tile import information<br>
	 * calls .doImportSVGFile(...) method if there is a stacked tile to import
	 */
    this.pop = function(){
		if ( !this.isWaiting() ){
			var nextTile = this.stackA.shift();
			if (nextTile){
				displayProgressBar(this.nToLoad-this.nPending-this.stackA.length,this.nToLoad,map.Dictionary.getLocalText("loading map elements"));
				this.doImportSVGFile(nextTile.szUrl, nextTile.svgDocument, nextTile.targetGroup, nextTile.callback);
			}
			else{
				this.nRequest = 0;
				this.nToLoad = 0;
				clearMessage();
			}
		}
	};
	/**
	 * check if szUrl is waiting in stack
	 * @param  szUrl the URL of the SVG file
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 */
    this.isStacked = function(szUrl, svgDocument, targetGroup){
		for ( i=0; i<this.stackA.length; i++ ){
			if (this.stackA[i].szUrl == szUrl ){
				if ( this.stackA[i].svgDocument == svgDocument &&
					 this.stackA[i].targetGroup == targetGroup ) {
					return true;
				}
			}
		}
		return false;
	};
	/**
	 * check if any URL is waiting in stack
	 */
    this.isAnyStacked = function(){
		return (this.stackA.length);
	};
	/**
	 * executes the Import a SVG file containing a map tile to a specified group of the given document  
	 * does some map scale and layer on/off adapting on the loaded fragment
	 * @param  szUrl the URL of the SVG file
	 * @param  svgDocument the target SVG document
	 * @param  targetGroup the target SVG group; content of the loaded document will be added as a new child to this group
	 * @param  callback optional function to be called on succeed
	 */
    this.doImportSVGFile = function(szUrl, svgDocument, targetGroup, callback){
		// check if loading in process
		if (this.szUrlA[szUrl] == targetGroup){
			return false;
		}
		this.szUrlA[szUrl] = targetGroup;
		this.nPending++;

        function CallbackHandler(parent){
			this.parent = parent;
        }
        CallbackHandler.prototype.operationComplete = function (status){
			this.parent.szUrlA[szUrl] = null;
			this.parent.nPending--;
			this.parent.nRequest--;
			if (status.success){
				_TRACE("SVGTilesL: "+szUrl);
				var svgSrc = status.content;
			   
				var d =  parseXML(svgSrc,svgDocument);

				this.processImported(d);
				_TRACE("SVGTilesL: "+szUrl+" (loaded - "+this.parent.nPending+" pending)");
			}
			else{
//				_TRACE("'"+szUrl+"' not loaded");
			}
			this.parent.pop();
        };
        CallbackHandler.prototype.operationComplete2 = function (status,xmlObject,szText){
			this.parent.szUrlA[szUrl] = null;
			this.parent.nPending--;
			this.parent.nRequest--;
			if ( xmlObject && (status == 200) ){
				this.processImported(xmlObject.documentElement);
				_TRACE("SVGTilesL: "+szUrl+" (loaded)");
			}
			this.parent.pop();
		};
        CallbackHandler.prototype.processImported = function (d){

			_TRACE("Tiling: -------------------------------------------------------------- "+szUrl+" process !!!");
			if ( targetGroup.childNodes.length ){
				_STATUS("Tiling: doppio tile !!!");
				_TRACE("Tiling: doppio tile !!!");
				return;
			}

			try{
				d = SVGDocument.importNode(d, true);
			}
			catch (e){
			}

			_TRACE("Tiling: -------------------------------------------------------------- "+szUrl+" imported !!!");
			targetGroup.appendChild(d);

			// report state (ddebug)
			// ------------

			if ( map && map.Layer ){
				for ( a in map.Layer.listA ){
					var layerItem = map.Layer.listA[a];
					if ( typeof(layerItem.nState) != "undefined" ){
						_TRACE("layer report:"+layerItem.szName+" "+layerItem.nState);
						var szTile = targetGroup.getAttributeNS(null,"id");
						var szTheme = layerItem.szName+"#"+szTile.substr(szTile.length-6,6);
						_TRACE("layer switch:"+szTheme);
						map.Layer.switchLayerByFeature(szTheme,layerItem.nState);
					}
				}
				if (!fSwitchByCSS || !map.Scale.CSSStyleNodes){
					_TRACE('switch scale dependent layer [no css] at loaded tile');
					map.Layer.switchScaleDependentLayer(null,targetGroup);
				}
			}

			if ( map && map.Zoom ){
				if (  map.Zoom.nZoom != 1 ){
					var nodeA = null;
					// adapt styles to scaling --------------------------------------
					nodeA = targetGroup.getElementsByTagName('g');
					for ( n=0; n<nodeA.length;n++){
						var szStyle = nodeA.item(n).getAttributeNS(null,"style");
						if (szStyle && szStyle.length){
							szNewStylesValue = __scaleStyleString(szStyle,map.Layer.nFeatureScale*map.Scale.nLineScaling);
							nodeA.item(n).setAttributeNS(null,"style",szNewStylesValue);
							targetGroup.setAttributeNS(szMapNs,"deltaTBD","1");
							// GR 27.06.2014
							targetGroup.setAttributeNS(szMapNs,"scale",String(map.Layer.nFeatureScale*map.Scale.nLineScaling));
						}
						childA = nodeA.item(n).childNodes;
						for ( c=0; c<childA.length;c++){
							if ( childA.item(c).nodeName == "text" ){
								var szStyle = childA.item(c).getAttributeNS(null,"style");
								if (szStyle && szStyle.length){
									szNewStylesValue = __scaleStyleString(szStyle,map.Layer.nFeatureScale*map.Scale.nLabelScaling);
									childA.item(c).setAttributeNS(null,"style",szNewStylesValue);
								}
							}
						}
					}
				
					__scaleTextOffsets(targetGroup,1/map.Zoom.nZoomX,1/map.Zoom.nZoomY,true);
				}
				map.Layer.adaptLabel(null,targetGroup);
			}

			if ( map && map.Themes ){
				if ( 0 ){
					map.Themes.resetThemeNodesCache();
				}else{
					// build node cache --------------------------------------
					map.Themes.addToThemeNodesCache(targetGroup);
					// all tiles loaded, actualize themes --------------------
					if ( (this.parent.nPending + this.parent.stackA.length) == 0 ){
						map.Themes.actualizeActiveTheme(true);
					}

				}
			}
        };
		_TRACE("SVGTilesL: "+szUrl+" ... ");
		if (szUrl.length > 0){
			getData(szUrl, new CallbackHandler(this));
			return true;
		}
		return false;
    };
	/**
	 * tell the number of pending tiles (svg fragments)  
	 * @return number of asynchronous data loads still pending
	 */
    this.isWaiting = function(){
		return this.nPending;
	};
	/**
	 * tell the number of pending tiles (svg fragments)  
	 * @return number of asynchronous data loads still pending
	 */
    this.isLoading = function(){
		return ( this.nPending |  this.isAnyStacked() ) ;
	};
}

/*
@ -----------------------------------------------------------------------------
@ S c r i p t   l o a d i n g
@ -----------------------------------------------------------------------------
*/
var	scriptLoaderPool = new JSLoaderPool();

/**
 * Create a new JSLoaderPool instance.  
 * @class It realizes an object to coordinate script loading
 * @constructor
 * @throws 
 * @return A new JSLoaderPool
 */
function JSLoaderPool(){
	/** holds the created {@link JSLoader} instances @type array */
	this.loaderA = new Array(0);
	/** defines the file ending for all scripts to load @type string */
	this.szSuffix = ".js";
	/** array of all scripts (URLs) already loaded @type string */
	this.loadedUrlA = new Array(0);
	/** array of the scripts (URLs) in progress of beeing loaded @type string */
	this.loadingUrlA = new Array(0);
	/** array of all scripts (URLs) that could not be loaded @type string */
	this.errorUrlA = new Array(0);
}
/**
 * adds one created loader object to the pool  
 * @param  loaderObj the loader object to add
 */
JSLoaderPool.prototype.add = function(loaderObj){
	this.loaderA[this.loaderA.length] = loaderObj;
};
/**
 * evaluates all loaded script, in order to make them functional  
 */
JSLoaderPool.prototype.evalScripts = function(){

	if ( this.isLoading() == false ){

		for ( i=0; i<this.loaderA.length; i++ ){
			var loader = this.loaderA[i];
			for(var ii=0; ii<loader.loadedScripts.length; ii++){
				if ( !this.isScriptLoaded(loader.szUrl) ){
					_TRACE("**** eval: "+loader.szUrl);
					this.evalScript(loader.loadedScripts[ii]);
					this.setScriptLoaded(loader.szUrl);
				}
			}
		}
		this.loaderA.length = 0;
	}
};
/**
 * evaluates a loaded script, in order to make it functional  
 */
JSLoaderPool.prototype.evalScript = function(){
	eval(arguments[0]);
};
/**
 * adds this url to the array of non loadable scripts  
 * @param  szUrl the URL of the script, that caused a loading error
 */
JSLoaderPool.prototype.setScriptError = function(szUrl){
	this.errorUrlA[this.errorUrlA.length] = szUrl;
};
/**
 * adds this url to the array of loaded scripts  
 * @param  szUrl the URL of the script, that has successfully been loaded
 */
JSLoaderPool.prototype.setScriptLoaded = function(szUrl){
	this.loadedUrlA[this.loadedUrlA.length] = szUrl;
};
/**
 * adds this url to the array of loads in progress  
 * @param  szUrl the URL of the script 
 */
JSLoaderPool.prototype.setScriptLoading = function(szUrl){
	this.loadingUrlA[this.loadingUrlA.length] = szUrl;
};
/**
 * check the loaded state of a script  
 * @type boolean
 * @param  szUrl the URL of the script to be checked
 * @return true if the script has successfully been loaded
 */
JSLoaderPool.prototype.isScriptLoaded = function(szUrl){
	for (var i=0; i<this.loadedUrlA.length; i++ ){
		if ( this.loadedUrlA[i] == szUrl ){
			return true;
		}
	}
	return false;
};
/**
 * check the loading state of a script  
 * @type boolean
 * @param  szUrl the URL of the script to be checked
 * @return true if the loading of the script is in progress
 */
JSLoaderPool.prototype.isScriptLoading = function(szUrl){
	for (var i=0; i<this.loadingUrlA.length; i++ ){
		if ( this.loadingUrlA[i] == szUrl ){
			return true;
		}
	}
	return false;
};
/**
 * check the error state of a script  
 * @type boolean
 * @param  szUrl the URL of the script to be checked
 * @return true if the script could not be loaded
 */
JSLoaderPool.prototype.isScriptError = function(szUrl){
	for (var i=0; i<this.errorUrlA.length; i++ ){
		if ( this.errorUrlA[i] == szUrl ){
			return true;
		}
	}
	return false;
};
/**
 * uncheck the loaded state of a script  
 * @type boolean
 * @param  szUrl the URL of the script to be checked
 */
JSLoaderPool.prototype.resetScriptLoading= function(szUrl){
	for (var i=0; i<this.loadingUrlA.length; i++ ){
		if ( this.loadingUrlA[i] == szUrl ){
			this.loadingUrlA[i] = "";
		}
	}
	for (var i=0; i<this.loadedUrlA.length; i++ ){
		if ( this.loadedUrlA[i] == szUrl ){
			this.loadedUrlA[i] = "";
		}
	}
	for (var i=0; i<this.errorUrlA.length; i++ ){
		if ( this.errorUrlA[i] == szUrl ){
			this.errorUrlA[i] = "";
		}
	}
};
/**
 * check the loading state of all loader in the pool  
 * @type boolean
 * @return true if any loader is in progress of loading
 */
JSLoaderPool.prototype.isLoading = function(){
	var i;
	for ( i=0; i<this.loaderA.length; i++ ){
		if ( this.loaderA[i].reqCnt>0 ){
			return true;
		}
	}
	return false;
};
/**
 * Create a new JSLoader instance.  
 * @class It realizes an object to load scripts from URL and evaluate them on load success
 * @constructor
 * @throws 
 * @return A new JSLoader
 */
function JSLoader(){
	/** array of strings which each can hold a loaded scripts @type array */
	this.loadedScripts = [];
	/** number of requests (loadings in progress) @type int */
	this.reqCnt =0;
	/** flag to indicate any loading process in progress @type boolean */
	this.isLoading = false;
	/** function to be called on loading error @type string */
	this.errorCallback=null;
	/** function to be called on loading success @type string */
	this.finishedCallback=null;
	/** message to be displayed on loading */
	this.szMessage = "... loading ...";
	/** link to a parent class ({@link JSLoaderPool}) that controlls all created JSLoader @type JSLoaderPool */
	this.pool = scriptLoaderPool;
	this.pool.add(this);
}
/**
 * start loading the specified script  
 * @param  szUrl the URL of the script to be loaded
 */
JSLoader.prototype.loadScript = function(szUrl,fRefresh){

	_TRACE('JS-Loader: "'+szUrl+'"');

	if ( fRefresh ){
		this.pool.resetScriptLoading(szUrl);
	}

	try{
		// check url, maybe add javascript file suffix 
		if ( !szUrl.match(/./) ){
			szUrl += this.pool.szSuffix;
			}
		this.szUrl = szUrl;
		if ( this.pool.isScriptError(this.szUrl) ){
			eval(this.errorCallback);
			return;
		}
		if ( this.pool.isScriptLoaded(this.szUrl) ){
			eval(this.finishedCallback);
			return;
		}
		if ( !this.pool.isScriptLoading(this.szUrl) ){
			this.isLoading = true;
			this.reqCnt++;
			this.pool.setScriptLoading(this.szUrl);
			getData(szUrl, this);
		}
	}
	catch (e){
	}
};
/**
 * callback function to terminate the data request
 * checks the error state and in case of success, activates the loaded content
 * @param  s the result of the loading process
 */
JSLoader.prototype.operationComplete= function(s){
	if ( !s.content || s.content.length == 0 || s.content.substr(0,5) == "Error" ){
		_TRACE('JS-Loader: "'+this.szUrl+'" not loaded ! ERROR:'+s.content);
		this.pool.setScriptError(this.szUrl);
		if(this.errorCallback){
			this.finishedCallback = null;
			eval(this.errorCallback);
		}
	}else{
		_TRACE('JS-Loader: '+this.szUrl+' (loaded)');
		this.loadedScripts.push(s.content);
	}
	this.reqCnt--;
	if(this.reqCnt <= 0){
		this.evalScripts();
	}
};
/**
 * callback function to terminate the data request from XMLHTTPRequest
 * checks the error state and in case of success, activates the loaded content
 * @param  status 
 * @param  xmlObject
 * @param  szText 
 */
JSLoader.prototype.operationComplete2= function(status,xmlObject,szText){
	if ( status != 200 || (!xmlObject && !szText) ){
		_TRACE('JS-Loader: "'+this.szUrl+'" not loaded ! ERROR:'+status);
		this.pool.setScriptError(this.szUrl);
		if(this.errorCallback){
			this.finishedCallback = null;
			eval(this.errorCallback);
		}
	}else{
		_TRACE('JS-Loader: '+this.szUrl+' (loaded)');
		this.loadedScripts.push(szText);
	}
	this.reqCnt--;
	if(this.reqCnt <= 0){
		this.evalScripts();
	}
};
/**
 * must not occur, if does instead, gives alert
 * @param  s the result of the loading process
 */
JSLoader.prototype.processImported= function(s){
	alert(s);
};
/**
 * activate all new loaded scripts, uses the appropriate methods of the pool !
 */
JSLoader.prototype.evalScripts = function(){
	this.pool.evalScripts();
	//or to have them all evaled in the same scope:
	//evalScripts(this.loadedScripts.join("\n");
	this.isLoading = false;
	if(this.finishedCallback){
		eval(this.finishedCallback);
	}
};
/**
 * returns the loading state of the loader object
 * Note: because is called periodically, does the 'loading...' message
 * @type boolean
 * @return true if the loader is loading (waiting)
 */
JSLoader.prototype.isLoading = function(){
	_TRACE("isLoading="+this.reqCnt);
	return 	(this.reqCnt>0);
};

// .............................................................................
// handle both getUrl (ASV) and XMLHttpRequest (Mozilla SVG)
// .............................................................................

/**
 * executes all !! asynchronous data loading (SVG,XML,Scrips,...); 
 * every loader uses this function, to achieve browser and XMLHttpRequest compatibility 
 * @param  szUrl the URL of the data to be loaded 
 * @param  getDataCallback the callback function to process the imported data
 */
function getData(szUrl,getDataCallback) { 
	// call getURL() if available, case ASV3, ASV6 and Batik
	if (window.getURL) {
		getURL(szUrl,getDataCallback);
	}
	// call XMLHttpRequest() if available, case MozillaSVG
	else if (window.XMLHttpRequest) {
		// this nested function is used to make XMLHttpRequest threadsafe
        // (subsequent calls would not override the state of the request and can use the variable/object context of the parent function)
        // this idea is borrowed from http://www.xml.com/cs/user/view/cs_msg/2815 (brockweaver)
        function XMLHttpRequestCallback() {
            // we are only interested in the complete transaction (readyState 4)
			if (xmlRequest.readyState == 4) {
				getDataCallback.operationComplete2(xmlRequest.status,xmlRequest.responseXML,xmlRequest.responseText);
            }
        }
		try{
			var xmlRequest = null;
			xmlRequest = new XMLHttpRequest();
			xmlRequest.open("GET",szUrl,true);
			xmlRequest.onreadystatechange = XMLHttpRequestCallback;
			xmlRequest.send(null);
		}
		catch (e){
		}
	}
	//write an error message if either method is not available
	else {
		alert("your browser/svg viewer neither supports window.getURL nor window.XMLHttpRequest!");
	}           
}

// .............................................................................
// C O O R D I N A T E    T R A N S F O R M A T I O N  
//  adapted from a Python script, written by Chuck Gantz- chuck.gantz@globalstar.com
//  based on Defense Mapping Agency. 1987b. DMA Technical Report: Supplement to Department of Defense World Geodetic System
//  1984 Technical Report. Part I and II. Washington, DC: Defense Mapping Agency
// .............................................................................

var _deg2rad = Math.PI / 180.0;
var _rad2deg = 180.0 / Math.PI;

var _refEllipsoid = {
	 "WGS84":					{ _EquatorialRadius: 6378137, _eccentricitySquared: 0.00669438 } 
	,"Airy":					{ _EquatorialRadius: 6377563, _eccentricitySquared: 0.00667054 }
	,"Australian National":	{ _EquatorialRadius: 6378160, _eccentricitySquared: 0.006694542}
	,"Bessel 1841":			{ _EquatorialRadius: 6377397, _eccentricitySquared: 0.006674372}
	,"Bessel 1841 (Nambia]":	{ _EquatorialRadius: 6377484, _eccentricitySquared: 0.006674372}
	,"Clarke 1866":			{ _EquatorialRadius: 6378206, _eccentricitySquared: 0.006768658}
	,"Clarke 1880":			{ _EquatorialRadius: 6378249, _eccentricitySquared: 0.006803511}
	,"Everest":				{ _EquatorialRadius: 6377276, _eccentricitySquared: 0.006637847}
	,"Fischer 1960 (Mercury]":{ _EquatorialRadius: 6378166, _eccentricitySquared: 0.006693422}
	,"Fischer 1968":			{ _EquatorialRadius: 6378150, _eccentricitySquared: 0.006693422}
	,"GRS 1967":				{ _EquatorialRadius: 6378160, _eccentricitySquared: 0.006694605}
	,"GRS 1980":				{ _EquatorialRadius: 6378137, _eccentricitySquared: 0.00669438 }
	,"Helmert 1906":			{ _EquatorialRadius: 6378200, _eccentricitySquared: 0.006693422}
	,"Hough":					{ _EquatorialRadius: 6378270, _eccentricitySquared: 0.00672267 }
	,"International":			{ _EquatorialRadius: 6378388, _eccentricitySquared: 0.00672267 }
	,"Krassovsky":			{ _EquatorialRadius: 6378245, _eccentricitySquared: 0.006693422}
	,"Modified Airy":			{ _EquatorialRadius: 6377340, _eccentricitySquared: 0.00667054 }
	,"Modified Everest":		{ _EquatorialRadius: 6377304, _eccentricitySquared: 0.006637847}
	,"Modified Fischer 1960":	{ _EquatorialRadius: 6378155, _eccentricitySquared: 0.006693422}
	,"South American 1969":	{ _EquatorialRadius: 6378160, _eccentricitySquared: 0.006694542}
	,"WGS 60":				{ _EquatorialRadius: 6378165, _eccentricitySquared: 0.006693422}
	,"WGS 66":				{ _EquatorialRadius: 6378145, _eccentricitySquared: 0.006694542}
	,"WGS-72":				{ _EquatorialRadius: 6378135, _eccentricitySquared: 0.006694318}
	,"WGS-84":				{ _EquatorialRadius: 6378137, _eccentricitySquared: 0.00669438 }
};

/**
 * converts lat/long to UTM coords.  Equations from USGS Bulletin 1532 
 * East Longitudes are positive, West longitudes are negative. 
 * North latitudes are positive, South latitudes are negative
 * Lat and Long are in decimal degrees
 * @param  ReferenceEllipsoid the name of the ReferenceEllipsoid ( only WGS84 )
 * @param  nLat latitude in decimal degrees
 * @param  nLon longitude in decimal degrees
 * @param  UTMZone UTM Zone (only set if diverts from standard)
 * @type   point
*/
function _LLtoUTM(szRefEllipsoid, nLat, nLon, UTMZone ){

	if ( !_refEllipsoid[szRefEllipsoid] ){
		szRefEllipsoid = "WGS84";
		_TRACE("_LLtoUTM Datum:'"+szRefEllipsoid+"' not found");
	}
	var a = _refEllipsoid[szRefEllipsoid]._EquatorialRadius;
    var eccSquared = _refEllipsoid[szRefEllipsoid]._eccentricitySquared;
    var k0 = 0.9996;

	// make sure the longitude is between -180.00 .. 179.9
    var nLongTemp = (nLon+180)-Math.floor((nLon+180)/360)*360-180; 

    var nLatRad = nLat*_deg2rad;
    var nLongRad = nLongTemp*_deg2rad;

    var nZoneNumber = Math.floor((nLongTemp + 180)/6) + 1;
  
    if ( nLat >= 56.0 && nLat < 64.0 && nLongTemp >= 3.0 && nLongTemp < 12.0 ){
        nZoneNumber = 32;
	}
    // special zones for Svalbard
    if ( nLat >= 72.0 && nLat < 84.0 ){
        if  ( nLongTemp >= 0.0  && nLongTemp <  9.0 ){nZoneNumber = 31;}
		else if ( nLongTemp >= 9.0  && nLongTemp < 21.0 ){nZoneNumber = 33;}
        else if ( nLongTemp >= 21.0 && nLongTemp < 33.0 ){nZoneNumber = 35;}
        else if ( nLongTemp >= 33.0 && nLongTemp < 42.0 ){nZoneNumber = 37;}
	}
    // GR 27.11.2007 zone given ?
	if ( UTMZone && UTMZone.length ){
		nZoneNumber = parseInt(UTMZone);
	}
	// +3 puts origin in middle of zone
	var nLongOrigin = (nZoneNumber - 1)*6 - 180 + 3; 
    var nLongOriginRad = nLongOrigin * _deg2rad;

    // compute the UTM Zone from the latitude and longitude
    szUTMZone = String(nZoneNumber+_UTMLetterDesignator(nLat));
    var eccPrimeSquared = (eccSquared)/(1-eccSquared);
    var N = a/Math.sqrt(1-eccSquared*Math.sin(nLatRad)*Math.sin(nLatRad));
    var T = Math.tan(nLatRad)*Math.tan(nLatRad);
    var C = eccPrimeSquared*Math.cos(nLatRad)*Math.cos(nLatRad);
    var A = Math.cos(nLatRad)*(nLongRad-nLongOriginRad);

    var M = a*((1
            - eccSquared/4
            - 3*eccSquared*eccSquared/64
            - 5*eccSquared*eccSquared*eccSquared/256)*nLatRad 
            - (3*eccSquared/8
            + 3*eccSquared*eccSquared/32
            + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(2*nLatRad)
            + (15*eccSquared*eccSquared/256 + 45*eccSquared*eccSquared*eccSquared/1024)*Math.sin(4*nLatRad) 
            - (35*eccSquared*eccSquared*eccSquared/3072)*Math.sin(6*nLatRad));
    
    var UTMEasting = (k0*N*(A+(1-T+C)*A*A*A/6
                        + (5-18*T+T*T+72*C-58*eccPrimeSquared)*A*A*A*A*A/120)
						+ 500000.0);

    var UTMNorthing = (k0*(M+N*Math.tan(nLatRad)*(A*A/2+(5-T+9*C+4*C*C)*A*A*A*A/24
                                        + (61
                                           -58*T
                                           +T*T
                                           +600*C
                                           -330*eccPrimeSquared)*A*A*A*A*A*A/720)));

	// 10000000 meter offset for southern hemisphere
	if ( nLat < 0 ){
        UTMNorthing = UTMNorthing + 10000000.0; 
	}
    return new point(UTMEasting,UTMNorthing);
}

function _UTMLetterDesignator(nLat){
// This routine determines the correct UTM letter designator for the given latitude
// returns 'Z' if latitude is outside the UTM limits of 84N to 80S
// Written by Chuck Gantz- chuck.gantz@globalstar.com

    if      ( 84 >= nLat >= 72 ) {return 'X';}
    else if ( 72 > nLat >=  64 ) {return 'W';}
    else if ( 64 > nLat >=  56 ) {return 'V';}
    else if ( 56 > nLat >=  48 ) {return 'U';}
    else if ( 48 > nLat >=  40 ) {return 'T';}
    else if ( 40 > nLat >=  32 ) {return 'S';}
    else if ( 32 > nLat >=  24 ) {return 'R';}
    else if ( 24 > nLat >=  16 ) {return 'Q';}
    else if ( 16 > nLat >=   8 ) {return 'P';}
    else if (  8 > nLat >=   0 ) {return 'N';}
    else if (  0 > nLat >=  -8 ) {return 'M';}
    else if (-8  > nLat >= -16 ) {return 'L';}
    else if (-16 > nLat >= -24 ) {return 'K';}
    else if (-24 > nLat >= -32 ) {return 'J';}
    else if (-32 > nLat >= -40 ) {return 'H';}
    else if (-40 > nLat >= -48 ) {return 'G';}
    else if (-48 > nLat >= -56 ) {return 'F';}
    else if (-56 > nLat >= -64 ) {return 'E';}
    else if (-64 > nLat >= -72 ) {return 'D';}
    else if (-72 > nLat >= -80 ) {return 'C';}
    else {return 'Z';}
// if the Latitude is outside the UTM limits
}
/*******************************************************************************/
/* void UTMtoLL(int szRefEllipsoid, const double UTMNorthing, const double UTMEasting, const char* UTMZone, */
/*			    double& Lat,  double& Long )                                   */
/* converts UTM coords to lat/long.  Equations from USGS Bulletin 1532         */
/* East Longitudes are positive, West longitudes are negative.                 */ 
/* North latitudes are positive, South latitudes are negative                  */
/* Lat and Long are in decimal degrees.                                        */
/* Written by Chuck Gantz- chuck.gantz@globalstar.com                          */
/* Converted to Python by Russ Nelson <nelson@crynwr.com>                      */ 
/*******************************************************************************/

function _UTMtoLL(szRefEllipsoid, UTMNorthing, UTMEasting, szUTMZone )
{
	if ( !_refEllipsoid[szRefEllipsoid] ){
		szRefEllipsoid = "WGS84";
		_TRACE("_UTMtoLL Datum:'"+szRefEllipsoid+"' not found");
	}
	if ( !szUTMZone ){
		return null;
	}

    var k0			= 0.9996;
    var a			= _refEllipsoid[szRefEllipsoid]._EquatorialRadius;
    var eccSquared	= _refEllipsoid[szRefEllipsoid]._eccentricitySquared;
    var e1			= (1-Math.sqrt(1-eccSquared))/(1+Math.sqrt(1-eccSquared));

	var NorthernHemisphere; //1 for northern hemispher, 0 for southern

    var x = UTMEasting - 500000.0; // remove 500,000 meter offset for longitude
    var y = UTMNorthing;

	var nZoneNumber  = parseInt(szUTMZone);
	var szZoneLetter = szUTMZone.substr(szUTMZone.length-1,1);
    if ( szZoneLetter >= 'N'){
        NorthernHemisphere = 1;  // point is in northern hemisphere
	}
    else {
        NorthernHemisphere = 0;  // point is in southern hemisphere
        y -= 10000000.0;         // remove 10,000,000 meter offset used for southern hemisphere
	}
    var LongOrigin = (nZoneNumber - 1)*6 - 180 + 3;  // +3 puts origin in middle of zone

    var eccPrimeSquared = (eccSquared)/(1-eccSquared);

    var M = y / k0;
    var mu = M/(a*(1-eccSquared/4-3*eccSquared*eccSquared/64-5*eccSquared*eccSquared*eccSquared/256));

    var phi1Rad = (mu + (3*e1/2-27*e1*e1*e1/32)*Math.sin(2*mu) 
               + (21*e1*e1/16-55*e1*e1*e1*e1/32)*Math.sin(4*mu)
               +(151*e1*e1*e1/96)*Math.sin(6*mu));
    var phi1 = phi1Rad*_rad2deg;

    var N1 = a/Math.sqrt(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad));
    var T1 = Math.tan(phi1Rad)*Math.tan(phi1Rad);
    var C1 = eccPrimeSquared*Math.cos(phi1Rad)*Math.cos(phi1Rad);
    var R1 = a*(1-eccSquared)/Math.pow(1-eccSquared*Math.sin(phi1Rad)*Math.sin(phi1Rad), 1.5);
    var D = x/(N1*k0);

	var nLat = 0;
	var nLong = 0;

    nLat = phi1Rad - (N1*Math.tan(phi1Rad)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*eccPrimeSquared)*D*D*D*D/24
                                          +(61+90*T1+298*C1+45*T1*T1-252*eccPrimeSquared-3*C1*C1)*D*D*D*D*D*D/720);
    nLat = nLat * _rad2deg;

    nLong = (D-(1+2*T1+C1)*D*D*D/6+(5-2*C1+28*T1-3*C1*C1+8*eccPrimeSquared+24*T1*T1)
            *D*D*D*D*D/120)/Math.cos(phi1Rad);
    nLong = LongOrigin + nLong * _rad2deg;

    return new point(nLong,nLat);
}

/**
 * Returns the hyperbolic sine of the number, defined as (exp(number) - exp(-number))/2  
 * @param  arg a number
*/
function sinh (arg) {
    return (Math.exp(arg) - Math.exp(-arg))/2;
}

/**
 * converts lat/long to Mercator coords.
 * East Longitudes are positive, West longitudes are negative. 
 * North latitudes are positive, South latitudes are negative
 * Lat and Long are in decimal degrees
 * @param  nLat latitude in decimal degrees
 * @param  nLon longitude in decimal degrees
 * @type   point
*/
function _LLtoMercator(nLat, nLon){

	// limit latitude to maximum ( defined to produce 180 in Mercator )
	var maxLat = Math.atan(sinh(Math.PI))*_rad2deg;
	if (nLat >=  maxLat) {nLat = maxLat;}
	if (nLat < -maxLat)  {nLat = -maxLat;}

	// conversion degre=>radians
	var phi = nLat*_deg2rad;

	var nNorthing = 0.5 * Math.log((1 + Math.sin(phi))/(1-Math.sin(phi))) *_rad2deg;
	var nEasting  = nLon;

    return new point(nEasting,nNorthing);
}

/**
 * converts Mercator coordinates to lat/long.
 * East Longitudes are positive, West longitudes are negative. 
 * North latitudes are positive, South latitudes are negative
 * Lat and Long are in decimal degrees
 * @param  nNorthing Mercator latitude
 * @param  nEasting Mercator longitude
 * @type   point
*/
function _MercatortoLL( nNorthing, nEasting )
{
	var nLat = Math.atan(sinh(nNorthing*_deg2rad))*_rad2deg;
	var nLon = nEasting;
    return new point(nLon,nLat);
}

// .............................................................................
// EOF
// .............................................................................

/**********************************************************************
 maptheme.js

$Comment: provides thematic map extensions for svggis
$Source : maptheme.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2004/12/15 $
$Author: guenter richter $
$Id: maptheme.js 9 2007-06-27 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: maptheme.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides the classes for thematic map functions<br>
 * (data collection, distribution and colorizing of shapes)
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */


/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true */
/* globals 
	map, 
	Map, 
	HTMLWindow, 
	szMapNs, 
	thisversion, 
	szShadowFilterId, 
	szShadowFilterShapeId, 
	alert, 
	console, 
	_TRACE, 
	_ERROR, 
	setTimeout, 
	clearTimeout, 
	executeWithMessage, 
	unescape, 
	displayMessage, 
	clearMessage, 
	displayProgressBar, 
	InfoContainer, 
	ScrollArea, 
	Button, 
	createTextGrid, 
	SVGDocument, 
	SVGThemeGroup, 
	SVGHiddenGroup, 
	SVGRootElement, 
	point, 
	box, 
	getMatrix, 
	setMatrix, 
	getTranslate, 
	setRotate, 
	getRotateAttributeValue, 
	Methods, 
	Widget, 
	widgetList, 
	Slider, 
	ColorScheme, 
	DonutCharts, 
	highLightList,  
	antiZoomAndPanList, 
	__getStyleObj, 
	__scaleStyleString, 
	__featureScaling_lastScale, 
	__formatValue, 
	fAllIncluded, 
	fLoadExternalData, 
	fLocalHost, 
	fObjectScaling, 
	fTilesLoaded, 
	fTransparentMap, 
	fCheckLabelOverlap, 
	_activeTheme, 
	fDebug, 
	JSLoader */

// .............................................................................
// locals to get theme definitions object / string
// .............................................................................

var themeStyleTranslateA = [
	 { style: "opacity"			,obj: "nOpacity" }
	,{ style: "fillopacity"		,obj: "fillOpacity" }
	,{ style: "autoopacity"		,obj: "autoOpacity" }
	,{ style: "shadow"			,obj: "fOrigShadow" }
	,{ style: "blur"			,obj: "nBlur" }
	,{ style: "filter"			,obj: "szFilter" }
	,{ style: "dfilter"			,obj: "nDeltaFilter" }
	,{ style: "filterfield"		,obj: "szFilterField" }
	,{ style: "visible"			,obj: "fVisible" }

	,{ style: "dbtable"			,obj: "coTable" }
	,{ style: "dbtableUrl"		,obj: "coTableUrl" }
	,{ style: "dbtableType"		,obj: "coTableType" }
	,{ style: "dbtableExt"		,obj: "coTableExt" }
	,{ style: "dbtableProcess"	,obj: "coTableProcess" }
	,{ style: "dbtableQuery"	,obj: "coTableQuery" }
	,{ style: "datacache"		,obj: "fDataCache" }
	,{ style: "itemfield"		,obj: "szItemField" }
	,{ style: "lookupfield"		,obj: "szSelectionField" }
	,{ style: "lookuptoupper"	,obj: "fSelectionFieldToUpper" }
	,{ style: "lookupsuffix"	,obj: "szSelectionFieldSuffix" }
	,{ style: "lookupdigits"	,obj: "nSelectionFieldDigits" }
	,{ style: "lookuptonumber"	,obj: "fSelectionFieldToNumber" }
	,{ style: "lookupfield2"	,obj: "szSelectionField2" }
	,{ style: "showdata"		,obj: "fShowData"  }
	,{ style: "datafields"		,obj: "szDataFieldsA" ,type: "array" }
	,{ style: "userdraw"		,obj: "userDraw" }
	,{ style: "child"			,obj: "fChild" }
	,{ style: "crsdatum"		,obj: "szCRSDatum" }
	,{ style: "crsutmzone"		,obj: "szCRSUTMZone" }
	,{ style: "server"			,obj: "szServer" }

	//,{ style: "ranges"			,obj: "szRanges" }
	,{ style: "ranges"			,obj: "szRangesA" ,type: "array" }
	,{ style: "rangecentervalue",obj: "nRangeCenterValue"  }

	,{ style: "symbols"			,obj: "szSymbolsA" ,type: "array" }
	,{ style: "values"			,obj: "szValuesA" ,type: "array" ,delimiter:"|" }
	,{ style: "colorvalues"		,obj: "szColorValuesA" ,type: "array" ,delimiter:"|" }
	,{ style: "symbolvalues"	,obj: "szSymbolValuesA" ,type: "array" ,delimiter:"|" }
	,{ style: "label"			,obj: "szOrigLabelA" ,type: "array" ,delimiter:"|" }
	,{ style: "valuemap"		,obj: "valueMap" ,type: "object" }
	,{ style: "xaxis"			,obj: "szXaxisA" ,type: "array" }
	,{ style: "units"			,obj: "szUnits"  }
	,{ style: "labelunits"		,obj: "szLabelUnits"  }
	,{ style: "units100"		,obj: "szUnits100"  }
	,{ style: "sizevalueunits"	,obj: "szSizeValueUnits"  }
	,{ style: "alphavalueunits"	,obj: "szAlphaValueUnits"  }
	,{ style: "legendunits"		,obj: "szLegendUnits"  }
	,{ style: "weights"			,obj: "szWeights"  }
	,{ style: "align"			,obj: "szAlign"  }
	,{ style: "offsetx"			,obj: "nOffsetX"  }
	,{ style: "offsety"			,obj: "nOffsetY"  }

	,{ style: "refreshtimeout"	,obj: "nRefreshTimeout"  }

	,{ style: "normalsizevalue"	,obj: "nNormalSizeValue"  }
	,{ style: "normalsizescale"	,obj: "szNormalSizeScale"  }
	,{ style: "scale"			,obj: "nScale"  }
	,{ style: "rangescale"		,obj: "nRangeScale"  }
	,{ style: "sizepow"			,obj: "nSizePow"  }

	,{ style: "colorfield"		,obj: "szColorField"  }
	,{ style: "symbolfield"		,obj: "szSymbolField"  }
	,{ style: "valuefield"		,obj: "szValueField"  }
	,{ style: "labelfield"		,obj: "szLabelField"  }
	,{ style: "sizefield"		,obj: "szSizeField"  }
	,{ style: "timefield"		,obj: "szTimeField"  }
	,{ style: "alphafield"		,obj: "szAlphaField"  }
	,{ style: "alphafield100"	,obj: "szAlphaField100"  }
	,{ style: "xfield"			,obj: "szXField"  }
	,{ style: "yfield"			,obj: "szYField"  }
	,{ style: "dopacitypow"		,obj: "nDopacityPow"  }
	,{ style: "dopacityramp"	,obj: "szDopacityRamp"  }
	,{ style: "dopacityscale"	,obj: "nDopacityScale"  }
	,{ style: "brightness"	    ,obj: "nBrightness"  }

	,{ style: "buffersize"		,obj: "nBufferSize"  }
	,{ style: "bufferstep"		,obj: "nBufferSizeStep"  }
	,{ style: "field100min"		,obj: "nField100Min"  }
	,{ style: "fractionscale"	,obj: "nFractionScale"  }
	,{ style: "minvalue"		,obj: "nMinValue"  }
	,{ style: "maxvalue"		,obj: "nMaxValue"  }
	,{ style: "lowvalue"		,obj: "nLowValue"  }
	,{ style: "highvalue"		,obj: "nHighValue"  }

	,{ style: "textfont"		,obj: "szTextFont"  }
	,{ style: "textcolor"		,obj: "szTextColor"  }
	,{ style: "textscale"		,obj: "nTextScale"  }
	,{ style: "linecolor"		,obj: "szLineColor"  }
	,{ style: "linecolor"		,obj: "szLineColorA",type: "array" }
	,{ style: "linewidth"		,obj: "nLineWidth"  }
	,{ style: "markersize"		,obj: "nMarkerSize"  }
	,{ style: "gapsize"			,obj: "nGapSize"  }
	,{ style: "bordercolor"		,obj: "szBorderColor"  }
	,{ style: "borderstyle"		,obj: "szBorderStyle"  }
	,{ style: "borderwidth"		,obj: "szBorderWidth"  }
	,{ style: "borderradius"	,obj: "nBorderRadius"  }
	,{ style: "boxcolor"		,obj: "szBoxColor"  }
	,{ style: "boxopacity"		,obj: "nBoxOpacity"  }
	,{ style: "boxmargin"		,obj: "nBoxMargin"  }

	,{ style: "textplacement"	,obj: "szTextPlacement"  }
	,{ style: "infotitle"		,obj: "szInfoTitle"  }
	,{ style: "titlefield"		,obj: "szTitleField"  }
	,{ style: "snippetfield"	,obj: "szSnippetField"  }
	,{ style: "exclude"			,obj: "szExcludeA" ,type: "array" }
	,{ style: "nodatacolor"		,obj: "szNoDataColor"  }
	,{ style: "titleupper"		,obj: "szTitleUpper"  }
	,{ style: "labelupper"		,obj: "szLabelUpper"  }
	,{ style: "valueupper"		,obj: "szValueUpper"  }
	,{ style: "valuelower"		,obj: "szValueLower"  }
	,{ style: "glowupper"		,obj: "szGlowUpper"  }
	,{ style: "glowlower"		,obj: "szGlowLower"  }
	,{ style: "chartupper"		,obj: "szChartUpper"  }
	,{ style: "chartlower"		,obj: "szChartLower"  }
	,{ style: "featureupper"	,obj: "szFeatureUpper"  }
	,{ style: "featurelower"	,obj: "szFeatureLower"  }
	,{ style: "boxupper"		,obj: "szBoxUpper"  }
	,{ style: "shadowupper"		,obj: "szShadowUpper"  }
	,{ style: "shadowlower"		,obj: "szShadowLower"  }
	,{ style: "declutterupper"	,obj: "szDeclutterUpper"  }
	,{ style: "valuescale"		,obj: "nValueScale"  }
	,{ style: "minvaluesize"	,obj: "nValueSizeMin"  }
	,{ style: "valuedecimals"	,obj: "nValueDecimals" }
	,{ style: "fadevaluepow"	,obj: "szFadeValuePow"  }
	,{ style: "fadenegative"	,obj: "nFadeNegative"  }
	,{ style: "centerpart"		,obj: "szCenterPart"  }

	,{ style: "clipframes"		,obj: "nClipFrames"  }
	,{ style: "clipframerate"	,obj: "nClipFrameRate"  }
	,{ style: "cliplegend"		,obj: "nClipColorLegend"  }
	,{ style: "clipparts"		,obj: "nClipParts"  }
	,{ style: "minchartsize"	,obj: "nChartSizeMin"  }
	,{ style: "maxcharts"		,obj: "nMaxCharts"  }
	,{ style: "showparts"		,obj: "szShowParts"  }
	,{ style: "gridx"			,obj: "nGridX"  }
	,{ style: "gridwidth"		,obj: "nGridWidth"  }
	,{ style: "gridmatrix"		,obj: "nGridMatrix"  }
	,{ style: "gridwidthpx"		,obj: "nGridWidthPx"  }
	,{ style: "gridoffsetx"		,obj: "nGridOffsetX"  }
	,{ style: "gridoffsety"		,obj: "nGridOffsetY"  }
	,{ style: "aggregationfield",obj: "szAggregationField"  }
	,{ style: "aggregationscale",obj: "szAggregationFieldA" ,type: "array"  }
	,{ style: "aggregation"		,obj: "szAggregation"  }
	,{ style: "minaggregation"	,obj: "szMinAggregation"  }
	,{ style: "aggregationupper",obj: "szAggregationUpper"  }
	,{ style: "aggregationlower",obj: "szAggregationLower"  }
	,{ style: "clipupper"		,obj: "szClipUpper"  }
	,{ style: "cliplower"		,obj: "szClipLower"  }

	,{ style: "dominantfilter"	,obj: "szDominantFilter" }
	,{ style: "dominantdfilter"	,obj: "nDominantDFilter" }
	,{ style: "overviewchart"	,obj: "szOverviewChart" }
	,{ style: "evidence"		,obj: "evidenceMode" }
	,{ style: "markclass"		,obj: "markedClass" }
	,{ style: "markclasses"		,obj: "markedClassesA" ,type: "array"  }

	,{ style: "name"			,obj: "szName"  }
	,{ style: "title"			,obj: "szTitle"  }
	,{ style: "snippet"			,obj: "szSnippet"  }
	,{ style: "splash"			,obj: "szSplash"  }
	,{ style: "description"		,obj: "szDescription"  }

];


function __maptheme_getOneStyleProperty(styleObj, szProperty, szType, szDelimiter) {

	szDelimiter = szDelimiter ? szDelimiter : ",";

	if ((typeof (styleObj) != "undefined") && (styleObj != null)) {

		if (szType && (typeof (szType) != "undefined")) {
			if (szType == "array" && styleObj && styleObj.length && (typeof(styleObj) == 'object')) {
				var szArray = styleObj.join(szDelimiter);
				return szProperty + ":" + szArray + ";";
			} else
			if (szType == "object" && styleObj) {
				return szProperty + ":" + JSON.stringify(styleObj) + ";";
			}
		} else {
			return szProperty + ":" + String(styleObj) + ";";
		}

	}
	return "";
}

function __maptheme_getStyleString(themeObj) {

	// GR 27.07.2019 get the definition object before making the style string
	// this asures a 'shorter' style string because of cleanUpThemeObj() implemented in getMapThemeDefinitionObj()
	var themeDefinitionObj = map.Themes.getMapThemeDefinitionObj(themeObj.szId);

	var szStyle = "";
	for (var i = 0; i < themeStyleTranslateA.length; i++) {
		szStyle += __maptheme_getOneStyleProperty(themeDefinitionObj.style[themeStyleTranslateA[i].style], themeStyleTranslateA[i].style, themeStyleTranslateA[i].type, themeStyleTranslateA[i].delimiter);
	}
	return szStyle.replace(/\"/gi, '\\"');
}


function __maptheme_getStyleObj(themeObj) {
	var szStyle = "";
	var styleObj = {};
	for (var i = 0; i < themeStyleTranslateA.length; i++) {
		if ((themeObj[themeStyleTranslateA[i].obj] != null) &&
			(themeObj[themeStyleTranslateA[i].obj] != "undefined")) {
			styleObj[themeStyleTranslateA[i].style] = themeObj[themeStyleTranslateA[i].obj];
		}
	}
	return styleObj;
}

function __isdef(obj) {
	return ((typeof obj !== "undefined") && (obj != null));
}

// .............................................................................
// Themes  (holds all map themes)     
// .............................................................................

/**
 * Create a new Themes instance.  
 * @class It realizes an object to create and manage map themes (colorized shapes, charts etc. )
 * @constructor
 * @throws 
 * @return A new Themes object
 */
Map.Themes = function () {
	/** array to hold all generated MapThemes object */
	this.themesA = [];
	/** array to hold all map shape nodes used; used to accellerate */
	this.themeNodesA = [];
	/** array to hold all map shape nodes used; used to accellerate */
	this.themeNodesPosA = [];
	/** array to hold the box of all map shape nodes used; used to accellerate */
	this.themeNodesBoxA = [];
	/** hold the number of nodes used for themes */
	this.themeNodes = 0;
	/** hold the active theme */
	this.activeTheme = null;
	/** hold the active buffer */
	this.activeBuffer = null;
	/** layer switched on, to make visible a theme */
	this.switchedLayerA = [];
	/** flag to enable dynamic chart offsets */
	this.enableChartOffset = false;
	/** flag to enable CHOROPLETH theme overlay */
	this.enableMultiChoropleth = false;
	/** flag to enable subthemes for multi field themes */
	this.enableSubThemes = true;

	/** flag to define the info style for CHOROPLETH values **/
	this.szChoroplethInfoStyle = ""; //"histogram";
	/** defines the max number of charts per theme **/
	this.nMaxThemeCharts = 1000000;
	/** defines the max number of shadowed charts per theme **/
	this.nMaxShadowCharts = 1000;
	/** defines the number of shapes color changes after which the display will be updated **/
	this.nflushPaintShape = 5000;
	/** defines the number of charts after which the display will be updated **/
	this.nflushChartDraw = 1000;
	/** defines the max height of color scheme legends (in pixel) **/
	this.nColorSchemeMaxHeight = 120;
	/** allways show values of CHOROPLETH themes **/
	this.allwaysShowValues = false;
	/** hide Info buttons and close more on mouseout **/
	this.autoHideInfoTools = false;
	/** array to hold the loaded data sources, for caching **/
	this.themeDataCacheA = [];
};

Map.Themes.prototype = new Map();
// create instance on load
if ((typeof (thisversion) == "string") && map.checkVersion(thisversion)) {
	map.Themes = new Map.Themes();
	try {
		HTMLWindow.ixmaps.htmlgui_onInitThemes();
	} catch (e) {}
} else {
	alert("Map.Themes incompatible !");
}

/**
 * adds a map theme to the list
 * @parameter mapTheme the map theme object to add
 */
Map.Themes.prototype.addTheme = function (mapTheme) {
	this.themesA[this.themesA.length] = mapTheme;
	// notify HTML user about the new theme
	if (!mapTheme.szFlag.match(/selection/i)) {
		try {
			HTMLWindow.ixmaps.htmlgui_onNewTheme(mapTheme.szId);
		} catch (e) {}
	}
};
/**
 * returns the number of themes in the list
 */
Map.Themes.prototype.getThemeCount = function () {
	return this.themesA.length;
};
/**
 * returns a list of all themes
 */
Map.Themes.prototype.getAllThemes = function () {
	return this.themesA;
};
/**
 * returns a list of all themes
 */
Map.Themes.prototype.getThemes = function () {
	return this.themesA;
};
/**
 * returns true, if theme already exists
 */
Map.Themes.prototype.isTheme = function (szIdStr) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szIdStr && (this.themesA[i].szIdStr == szIdStr)) {
			return this.themesA[i];
		}
	}
	return false;
};
/**
 * returns true, if all themes are realised
 */
Map.Themes.prototype.isIdle = function () {
	for (var i = 0; i < this.themesA.length; i++) {
		if (!this.themesA[i].fRealizeDone) {
			return false;
		}
	}
	return true;
};
// .............................................................................
// h e l p e r   to normalize theme parameter     
// .............................................................................

/**
 * test if object is array 
 * @parameter obj the object to test
 * @return true/false
 * @type boolean
 */
Map.Themes.prototype.isArray = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Array]';
};
/**
 * test if object is a json object 
 * @parameter obj the object to test
 * @return true/false
 * @type boolean
 */
Map.Themes.prototype.isObject = function (obj) {
	return Object.prototype.toString.call(obj) === '[object Object]';
};
/**
 * make sure, object is type array 
 * @parameter obj the object to transform
 * @return array
 * @type array of string
 */
Map.Themes.prototype.toArray = function (obj) {	
	if (this.isObject(obj)) {
		var array = [];
		for ( i in obj){
			array.push(i);
			array.push(obj[i]);
		}	
		return array;
	} else	
	if (this.isArray(obj)) {
		return obj;
	} else {
		// GR 15.06.2019 RGB color definition (e.g.RGB(255,128,128) ) must not be transformed into an array
		return (String(obj).match(/\|/) || String(obj).match(/\RGB/)) ? String(obj).split('|') : String(obj).split(',');
	}
};
/**
 * constructs the creation strings for all map themes 
 * @parameter obj the object to transform
 * @return string or array.join('|')
 * @type string
 */
Map.Themes.prototype.toString = function (obj) {
	if (this.isArray(obj)) {
		return obj.join('|');
	} else {
		return obj;
	}
};

// .............................................................................
// create new theme from fields and style string     
// .............................................................................

/**
 * creates a new map theme. <br>
 * <br>
 * If fLoadExternalData == true <br>
 * 1. tries to load the map data from external file<br>
 * 2. calls this function again on success or error
 * @parameter szThemes the map layer(themes) to include into the new map theme
 * @parameter szField the name of the field to take the value
 * @parameter szField100 the name of the field to take the fraction value (for % analysis)
 * @parameter szStyle define the theme style
 * <br><br>szStyle is a string to define multiple properties with a syntax similar to CSS styles.<br>
 * <br>Sample: <em>'type:CHOROPLETH;classes:5;colorscheme:spectrum'</em>
 * <br><br>plesase see the documentation of Map.Api.prototype.createTheme() for more specific information.
 * @parameter szTitle title text to be displayed in the info pane of the map theme
 * @parameter szLabel a string with label separated by '|' to define label for classes, or chart parts
 * @return A new MapTheme object
 * <br><br>
 * <strong>Samples:</strong>
 * <br> map.Themes.newTheme("layer","fieldA","","style=type:CHOROPLETH|EQUIDISTANT;classes:10;colorscheme:spectrum,pastel"); 
 * <br> map.Themes.newTheme("layer","fieldA","field100","style=type:CHOROPLETH;",title="this theme"); 
 * <br><br>
 */
Map.Themes.prototype.newTheme = function (szThemes, szFields, szField100, szStyle, szTitle, szLabel) {

	var styleObj = null;
	var szStyleA = szStyle.split('style=');
	if (szStyleA && szStyleA.length > 1) {
		styleObj = __getStyleObj(szStyleA[1]);
	} else {
		styleObj = __getStyleObj(szStyle);
	}
	styleObj.label = (szLabel && (szLabel != "undefined")) ? szLabel.split('|') : (styleObj.label || null);
	styleObj.szTitle = szTitle;

	// GR 19.06.2019 put .newTheme towards .newThemeByObj because it can handle multiple themes without loss of theme sequence
	// by stacking theme objects

	var themeObj = {
		"layer": szThemes,
		"field": szFields,
		"field100": szField100
	};
	return this.newThemeByObj({
		"layer": szThemes,
		"field": szFields,
		"field100": szField100,
		"style": styleObj
	});

};

// .............................................................................
// create new theme from JSON definition     
// .............................................................................

/**
 * creates a new map theme. <br>
 * <br>
 * If fLoadExternalData == true <br>
 * 1. tries to load the map data from external file<br>
 * 2. calls this function again on success or error
 * @parameter szThemes the map layer(themes) to include into the new map theme
 * @parameter szField the name of the field to take the value
 * @parameter szField100 the name of the field to take the fraction value (for % analysis)
 * @parameter szStyle define the theme style
 * <br><br>szStyle is a string to define multiple properties with a syntax similar to CSS styles.<br>
 * <br>Sample: <em>'type:CHOROPLETH;classes:5;colorscheme:spectrum'</em>
 * <br><br>plesase see the documentation of Map.Api.prototype.createTheme() for more specific information.
 * @parameter szTitle title text to be displayed in the info pane of the map theme
 * @parameter szLabel a string with label separated by '|' to define label for classes, or chart parts
 * @return A new MapTheme object
 * <br><br>
 * <strong>Samples:</strong>
 * <br> map.Themes.newTheme("layer","fieldA","","style=type:CHOROPLETH|EQUIDISTANT;classes:10;colorscheme:spectrum,pastel"); 
 * <br> map.Themes.newTheme("layer","fieldA","field100","style=type:CHOROPLETH;",title="this theme"); 
 * <br><br>
 */
Map.Themes.prototype.newThemeByObj = function (themeObj) {

	_TRACE("newThemeByObj --------------------------------------------");

	if (!map.isIdle()) {
		// cannot create theme now
		if (themeObj) {
			// if new theme definition given
			// stack it and for execution in future
			this.newThemeObjA = this.newThemeObjA || [];
			this.newThemeObjA.push(themeObj);
		}
		_TRACE("ixmaps not idle ! --- retry later ! ---");
		setTimeout(function(){map.Themes.newThemeByObj();}, 100);
		return;
	}

	// execute a given theme or a stacked one 
	if (this.newThemeObjA && this.newThemeObjA.length) {
		if (themeObj) {
			this.newThemeObjA.push(themeObj);
		}
		themeObj = this.newThemeObjA.shift();
	}

	if (!themeObj) {
		return;
	}

	// make unique identifier to toggle themes
	var szIdStr = JSON.stringify(themeObj);
	
	// if identique theme exists
	if (this.isTheme(szIdStr)){
		if (themeObj.style.type.match(/TOGGLE/)) {
			_TRACE("identic theme -> remove it");
			this.removeTheme(null, this.isTheme(szIdStr).szId);
			return null;
		}
	}

	var mapTheme = null;
	var styleObj = themeObj.style;

	if (!styleObj) {
		return null;
	}

	// ----------------------
	// here we go 
	// ----------------------
    
    var szLabelA,szLabel;

	if (this.isArray(styleObj.label)) {
		szLabelA = styleObj.label;
		szLabel = styleObj.label.join('|');
	} else {
		szLabel = styleObj.label;
		szLabelA = (szLabel && (szLabel != "undefined")) ? szLabel.split('|') : null;
	}

	var colorSchemeA = new Array(5, "white", "blue");
	if (styleObj.colorscheme) {
		colorSchemeA = this.toArray(styleObj.colorscheme);
	}

	themeObj.layer = this.toString(themeObj.layer);
	themeObj.field = this.toString(themeObj.field);

	// GR 10.10.2019 make compatible to old type keyword EXACT
	if (styleObj.type.match(/\bEXACT\b/) && !styleObj.type.match(/\bCATEGORICAL\b/)) {
		styleObj.type += "|CATEGORICAL";
	}

	// make new theme object

	mapTheme = new MapTheme(themeObj.layer, themeObj.field, themeObj.field100, styleObj.type, colorSchemeA, styleObj.title, szLabelA);
	mapTheme.nOrder = this.getThemeCount();
	mapTheme.szIdStr = szIdStr;
	
	mapTheme.origDef = themeObj;

	// parse theme parameter 
	this.parseStyle(mapTheme, styleObj);

	// GR 21.12.2011 flag allways show values 
	if (this.allwaysShowValues) {
		mapTheme.szFlag += "|VALUES";
	}

	// ------------------
	// realize the theme
	// ------------------

	mapTheme.parent = this;
	this.addTheme(mapTheme);
	mapTheme.fRealize = true;
	
	/** GR 29.05.2023 create group for theme charts here, this will secure the layer sequence */
	// -----------------------------------------------------------------------
	if (!mapTheme.szFlag.match(/CHOROPLETH||BUFFER/)){
		mapTheme.createChartGroup(map.Layer.objectGroup);
	}
	
	// if there is data to load, do this first, and draw the theme on callback
	// -----------------------------------------------------------------------
	if (1 || !fAllIncluded) {
		if (mapTheme.coTable) {
			this.loadExternalData(mapTheme.coTable, mapTheme.nRefreshTimeout, mapTheme);
			return mapTheme;
		} else
		if (fLoadExternalData) {
			var szThemesA = themeObj.layer.split("|");
			for (var i = 0; i < szThemesA.length; i++) {
				this.loadExternalData(szThemesA[i], mapTheme.nRefreshTimeout, mapTheme);
			}
			return mapTheme;
		}
	}

	// no data to load, so draw the theme
	// ----------------------------------

	// GR 05.06.2015 make sure, zoom factors are up to date	
	map.Event.doDefaultZoom();

	executeWithMessage("map.Themes.execute()", "... processing ...");

	return mapTheme;
};

/**
 * parse styleObj and create theme parameter
 * complement to newThemeByObj(...)
 * @return void
 */
Map.Themes.prototype.parseStyle = function (mapTheme, styleObj) {

	if (mapTheme && styleObj) {

		if (__isdef(styleObj.classes)) {
			if (isNaN(Number(mapTheme.origColorScheme[0]))) {
				var xxx = mapTheme.origColorScheme[mapTheme.origColorScheme.length - 1];
				mapTheme.origColorScheme[1] = mapTheme.origColorScheme[0];
				mapTheme.origColorScheme[2] = xxx;
			}
			mapTheme.origColorScheme[0] = Number(styleObj.classes);
		}
		if (__isdef(styleObj.colorstyle)) {
			if (mapTheme.origColorScheme[1] == 'spectrum') {
				mapTheme.origColorScheme[2] = styleObj.colorstyle;
			}
		}
		if (__isdef(styleObj.dominantdfilter)) {
			mapTheme.nDominantDFilter = Number(styleObj.dominantdfilter);
		}
		if (__isdef(styleObj.dominantfilter)) {
			mapTheme.szDominantFilter = String(styleObj.dominantfilter);
		}
		if (__isdef(styleObj.filter)) {
			mapTheme.szFilter = String(styleObj.filter);
		}
		if (__isdef(styleObj.filterfield)) {
			mapTheme.szFilterField = String(styleObj.filterfield);
		}
		if (__isdef(styleObj.filtervalue)) {
			mapTheme.szFilterValue = String(styleObj.filtervalue);
		}
		if (__isdef(styleObj.overviewchart)) {
			mapTheme.szOverviewChart = styleObj.overviewchart;
		}
		if (__isdef(styleObj.evidence)) {
			mapTheme.evidenceMode = styleObj.evidence;
		}
		if (__isdef(styleObj.markclass)) {
			mapTheme.markedClass = styleObj.markclass;
			if (!mapTheme.markedClasses) {
				mapTheme.markedClasses = [];
				mapTheme.markedClasses[mapTheme.markedClass] = true;
				mapTheme.markedClassesA = [mapTheme.markedClass];
			}
		}
		if (__isdef(styleObj.markclasses)) {
			mapTheme.markedClassesA = this.toArray(styleObj.markclasses);
			mapTheme.markedClasses = [];
			mapTheme.markedClassesA.forEach(function (item, index) {
				if (item.length) {
					mapTheme.markedClasses[item] = true;
					// needed for compatibility !!
					mapTheme.markedClass = item;
				}
			});
		}
		if (__isdef(styleObj.fillopacity)) {
			if (styleObj.fillopacity == 'auto') {
				mapTheme.autoOpacity = true;
				mapTheme.fillOpacity = 0;
			} else {
				mapTheme.fillOpacity = Number(styleObj.fillopacity);
			}
		}
		if (__isdef(styleObj.opacity)) {
			if (styleObj.opacity == 'auto') {
				mapTheme.autoOpacity = true;
				mapTheme.fillOpacity = 0;
			} else {
				mapTheme.nOpacity = Number(styleObj.opacity);
			}
		}
		if (__isdef(styleObj.autoopacity)) {
			mapTheme.autoOpacity = true;
			mapTheme.fillOpacity = 0;
		}
		if (__isdef(styleObj.shadow)) {
			mapTheme.fShadow = mapTheme.fOrigShadow = JSON.parse(styleObj.shadow);
		} else {
			mapTheme.fShadow = mapTheme.fOrigShadow = false;
		}
		if (__isdef(styleObj.maxshadow)) {
			mapTheme.nMaxShadowCharts = Number(styleObj.maxshadow);
		}
		if (__isdef(styleObj.blur)) {
			mapTheme.nBlur = Number(styleObj.blur);
		}
		if (__isdef(styleObj.dbtable)) {
			var dbTableA = styleObj.dbtable.split(" ");
			mapTheme.coTable = dbTableA[0];
			if (dbTableA.length == 2) {
				mapTheme.coTableType = "jsonDB";
				mapTheme.coTableUrl = dbTableA[1].split("(")[1].split(")")[0];
			}
			if (dbTableA.length == 3) {
				mapTheme.coTableType = dbTableA[1];
				mapTheme.coTableUrl = dbTableA[2].split("(")[1].split(")")[0];
			}
			if (dbTableA.length == 4) {
				mapTheme.coTableType = dbTableA[1];
				mapTheme.coTableUrl = dbTableA[2].split("(")[1].split(")")[0];
				mapTheme.coTableExt = dbTableA[3].split("(")[1].split(")")[0];
			}
		}
		if (__isdef(styleObj.dbtableType)) {
			mapTheme.coTableType = styleObj.dbtableType;
		}
		if (__isdef(styleObj.dbtableUrl)) {
			mapTheme.coTableUrl = styleObj.dbtableUrl;
		}
		if (__isdef(styleObj.dbtableExt)) {
			mapTheme.coTableExt = styleObj.dbtableExt;
		}
		if (__isdef(styleObj.dbtableProcess)) {
			mapTheme.coTableProcess = styleObj.dbtableProcess;
		}
		if (__isdef(styleObj.dbtableQuery)) {
			mapTheme.coTableQuery = styleObj.dbtableQuery;
		}
		if (__isdef(styleObj.lookupfield)) {
			mapTheme.szSelectionField = mapTheme.szItemField = styleObj.lookupfield;
		}
		if (__isdef(styleObj.lookupfield2)) {
			mapTheme.szSelectionField2 = styleObj.lookupfield2;
		}
		if (__isdef(styleObj.lookuptoupper)) {
			mapTheme.fSelectionFieldToUpper = JSON.parse(styleObj.lookuptoupper);
		}
		if (__isdef(styleObj.lookupsuffix)) {
			mapTheme.szSelectionFieldSuffix = styleObj.lookupsuffix;
		}
		if (__isdef(styleObj.lookupprefix)) {
			mapTheme.szSelectionFieldPrefix = styleObj.lookupprefix;
		}
		if (__isdef(styleObj.lookupdigits)) {
			mapTheme.nSelectionFieldDigits = Number(styleObj.lookupdigits);
		}
		if (__isdef(styleObj.lookuptonumber)) {
			mapTheme.fSelectionFieldToNumber = JSON.parse(styleObj.lookuptonumber);
		}
		if (__isdef(styleObj.crsutmzone)) {
			mapTheme.szCRSUTMZone = styleObj.crsutmzone;
		}
		if (__isdef(styleObj.crsdatum)) {
			mapTheme.szCRSDatum = styleObj.crsdatum;
		}
		if (__isdef(styleObj.server)) {
			mapTheme.szServer = styleObj.server;
		}
		if (__isdef(styleObj.itemfield)) {
			mapTheme.szItemField = styleObj.itemfield;
		}
		if (__isdef(styleObj.ranges)) {
			mapTheme.szRangesA = this.toArray(styleObj.ranges);
			mapTheme.szRanges = this.toString(styleObj.ranges);
		}
		if (__isdef(styleObj.symbols)) {
			mapTheme.szSymbolsA = this.toArray(styleObj.symbols);
		}
		if (__isdef(styleObj.values)) {
			mapTheme.szValuesA = this.toArray(styleObj.values);
			// GR 07.10.2014 if theme has flag CATEGORICAL, then szValues defines the value sequence
			if (styleObj.type.match(/CATEGORICAL/) && mapTheme.szValuesA.length) {
				// push all values into the value/index array
				for (var i = 0; i < mapTheme.szValuesA.length; i++) {
					mapTheme.getStringValueIndex(mapTheme.szValuesA[i], "set");
				}
			}
		}
		if (__isdef(styleObj.colorvalues)) {
			mapTheme.szColorValuesA = this.toArray(styleObj.colorvalues);
		}
		if (__isdef(styleObj.symbolvalues)) {
			mapTheme.szSymbolValuesA = this.toArray(styleObj.symbolvalues);
		}
		if (__isdef(styleObj.align)) {
			mapTheme.szAlign = styleObj.align;
		}
		if (__isdef(styleObj.offsetx)) {
			mapTheme.nOffsetX = Number(styleObj.offsetx) || 0;
		}
		if (__isdef(styleObj.offsety)) {
			mapTheme.nOffsetY = Number(styleObj.offsety) || 0;
		}
		if (__isdef(styleObj.units)) {
			mapTheme.szUnits = styleObj.units;
		}
		if (__isdef(styleObj.units100)) {
			mapTheme.szUnits100 = styleObj.units100;
		}
		if (__isdef(styleObj.sizevalueunits)) {
			mapTheme.szSizeValueUnits = " " + styleObj.sizevalueunits;
		}
		if (__isdef(styleObj.alphavalueunits)) {
			mapTheme.szAlphaValueUnits = " " + styleObj.alphavalueunits;
		}
		if (__isdef(styleObj.legendunits)) {
			mapTheme.szLegendUnits = " " + styleObj.legendunits;
		}
		if (__isdef(styleObj.labelunits)) {
			mapTheme.szLabelUnits = " " + styleObj.labelunits;
		}
		if (__isdef(styleObj.xaxis)) {
			mapTheme.szXaxisA = this.toArray(styleObj.xaxis);
		}
		if (__isdef(styleObj.id)) {
			mapTheme.szId = unescape(styleObj.id);
		}
		if (__isdef(styleObj.name)) {
			mapTheme.szId = mapTheme.szName = unescape(styleObj.name);
		}
		if (__isdef(styleObj.title)) {
			mapTheme.szTitle = unescape(styleObj.title);
		}
		if (__isdef(styleObj.snippet)) {
			mapTheme.szSnippet = unescape(styleObj.snippet);
		}
		if (__isdef(styleObj.splash)) {
			mapTheme.szSplash = unescape(styleObj.splash);
		}
		if (__isdef(styleObj.description)) {
			mapTheme.szDescription = unescape(styleObj.description);
		}
		if (__isdef(styleObj.label)) {
			mapTheme.szLabelA = mapTheme.szOrigLabelA = this.toArray(styleObj.label);
		}
		if (__isdef(styleObj.weights)) {
			mapTheme.szWeightsA = this.toArray(styleObj.weights);
			mapTheme.szWeights = this.toString(styleObj.weights);
		}
		if (__isdef(styleObj.weight)) {
			mapTheme.szWeightsA = [styleObj.weights];
			mapTheme.szWeights = styleObj.weight;
		}
		if (__isdef(styleObj.scale)) {
			mapTheme.nScale = Number(styleObj.scale);
		}
		if (__isdef(styleObj.colorfield)) {
			mapTheme.szColorField = styleObj.colorfield;
		}
		if (__isdef(styleObj.symbolfield)) {
			mapTheme.szSymbolField = styleObj.symbolfield;
		}
		if (__isdef(styleObj.valuefield)) {
			mapTheme.szValueField = styleObj.valuefield;
		}
		if (__isdef(styleObj.labelfield)) {
			mapTheme.szLabelField = styleObj.labelfield;
		}
		if (__isdef(styleObj.titlefield)) {
			mapTheme.szTitleField = styleObj.titlefield;
		}
		if (__isdef(styleObj.snippetfield)) {
			mapTheme.szSnippetField = styleObj.snippetfield;
		}
		if (__isdef(styleObj.sizefield)) {
			mapTheme.szSizeField = styleObj.sizefield;
		}
		if (__isdef(styleObj.timefield)) {
			mapTheme.szTimeField = styleObj.timefield;
		}
		if (__isdef(styleObj.alphafield)) {
			mapTheme.szAlphaField = styleObj.alphafield;
		}
		if (__isdef(styleObj.alphafield100)) {
			mapTheme.szAlphaField100 = styleObj.alphafield100;
		}
		if (__isdef(styleObj.xfield)) {
			mapTheme.szXField = styleObj.xfield;
		}
		if (__isdef(styleObj.yfield)) {
			mapTheme.szYField = styleObj.yfield;
		}
		if (__isdef(styleObj.refresh)) {
			mapTheme.nRefreshTimeout = Number(styleObj.refresh) * 1000;
		}
		if (__isdef(styleObj.refreshtimeout)) {
			mapTheme.nRefreshTimeout = Number(styleObj.refreshtimeout);
		}
		if (__isdef(styleObj.buffersize)) {
			mapTheme.nBufferSize = styleObj.buffersize;
		}
		if (__isdef(styleObj.bufferstep)) {
			mapTheme.nBufferSizeStep = styleObj.bufferstep;
		}
		if (__isdef(styleObj.field100min)) {
			mapTheme.nField100Min = styleObj.field100min;
		}
		if (__isdef(styleObj.fractionscale)) {
			mapTheme.nFractionScale = styleObj.fractionscale;
		}
		if (__isdef(styleObj.minvalue)) {
			mapTheme.nMinValue = styleObj.minvalue;
		}
		if (__isdef(styleObj.maxvalue)) {
			mapTheme.nMaxValue = styleObj.maxvalue;
		}
		if (__isdef(styleObj.lowvalue)) {
			mapTheme.nLowValue = styleObj.lowvalue;
		}
		if (__isdef(styleObj.highvalue)) {
			mapTheme.nHighValue = styleObj.highvalue;
		}
		if (__isdef(styleObj.showdata)) {
			mapTheme.fShowData = JSON.parse(styleObj.showdata);
		}
		if (__isdef(styleObj.datacache)) {
			mapTheme.fDataCache = JSON.parse(styleObj.datacache);
		}
		if (__isdef(styleObj.editor)) {
			mapTheme.fEditor = JSON.parse(styleObj.editor);
		}
		if (__isdef(styleObj.datafields)) {
			mapTheme.szDataFieldsA = this.toArray(styleObj.datafields);
		}
		if (__isdef(styleObj.textcolor)) {
			mapTheme.szTextColor = styleObj.textcolor;
		}
		if (__isdef(styleObj.textfont)) {
			mapTheme.szTextFont = styleObj.textfont;
		}
		if (__isdef(styleObj.textscale)) {
			mapTheme.nTextScale = Number(styleObj.textscale);
		}
		if (__isdef(styleObj.linecolor)) {
			mapTheme.szLineColorA = this.toArray(styleObj.linecolor);
			mapTheme.szLineColor = mapTheme.szLineColorA[mapTheme.szLineColorA.length - 1];
		}
		if (__isdef(styleObj.linewidth)) {
			mapTheme.nLineWidth = styleObj.linewidth;
		}
		if (__isdef(styleObj.markersize)) {
			mapTheme.nMarkerSize = styleObj.markersize;
		}
		if (__isdef(styleObj.gapsize)) {
			mapTheme.nGapSize = styleObj.gapsize;
		}
		// GR 28.01.2008 CSS like
		if (__isdef(styleObj.bordercolor)) {
			mapTheme.szBorderColor = styleObj.bordercolor;
		}
		// GR 28.01.2008 CSS like: none,solid,dashed,dotted
		if (__isdef(styleObj.borderstyle)) {
			mapTheme.szBorderStyle = styleObj.borderstyle;
		}
		// GR 28.01.2008 CSS like: thin,medium,thick
		if (__isdef(styleObj.borderwidth)) {
			mapTheme.szBorderWidth = styleObj.borderwidth;
		}
		// GR 30.01.2015 CSS like: 1,2,3 ...
		if (__isdef(styleObj.borderradius)) {
			mapTheme.nBorderRadius = Number(styleObj.borderradius);
		}
		// GR 25.11.2015 box fill opacity
		if (__isdef(styleObj.boxcolor)) {
			mapTheme.szBoxColor = styleObj.boxcolor;
		}
		// GR 28.08.2014 box fill opacity
		if (__isdef(styleObj.boxopacity)) {
			mapTheme.nBoxOpacity = styleObj.boxopacity;
		}
		// GR 28.08.2014 box margin
		if (__isdef(styleObj.boxmargin)) {
			mapTheme.nBoxMargin = styleObj.boxmargin;
		}
		// GR 28.01.2008 inside,outside,dynamic
		if (__isdef(styleObj.textplacement)) {
			mapTheme.szTextPlacement = styleObj.textplacement;
		}
		// GR 18.03.2008 info title 
		if (__isdef(styleObj.infotitle)) {
			mapTheme.szInfoTitle = styleObj.infotitle;
		}
		// GR 20.08.2008 define lookup values to exclude 
		if (__isdef(styleObj.exclude)) {
			mapTheme.szExcludeA = this.toArray(styleObj.exclude);
		}
		// GR 29.01.2009 define aggregation mode
		if (__isdef(styleObj.aggregation)) {
			mapTheme.szAggregation = styleObj.aggregation;
		}
		// GR 08.02.2009 define a center value for dynamic classes range
		if (__isdef(styleObj.rangecentervalue)) {
			mapTheme.nRangeCenterValue = Number(styleObj.rangecentervalue);
		}
		// GR 01.02.2015 define the range scale = expansion/compression factor
		if (__isdef(styleObj.rangescale)) {
			mapTheme.nRangeScale = styleObj.rangescale;
		}
		// GR 21.02.2009 define the value for full size chart symbol
		if (__isdef(styleObj.normalsizevalue)) {
			mapTheme.nNormalSizeValue = styleObj.normalsizevalue;
		}
		// GR 25.10.2016 define the scale of base to the dynamoc object scaling
		if (__isdef(styleObj.normalsizescale)) {
			mapTheme.szNormalSizeScale = styleObj.normalsizescale;
			mapTheme.nNormalSizeScale = __scanScaleValue(mapTheme.szNormalSizeScale);
		}
		// GR 21.03.2009 define the color for nodata 
		if (__isdef(styleObj.nodatacolor)) {
			mapTheme.szNoDataColor = __getSaveColor(styleObj.nodatacolor);
		}
		// GR 15.03.2017 define scaledependency for box display
		if (__isdef(styleObj.boxupper)) {
			mapTheme.szBoxUpper = styleObj.boxupper;
			mapTheme.nBoxUpper = __scanScaleValue(mapTheme.szBoxUpper);
		}
		// GR 25.05.2015 define scaledependency for label display
		if (__isdef(styleObj.titleupper)) {
			mapTheme.szTitleUpper = styleObj.titleupper;
			mapTheme.nTitleUpper = __scanScaleValue(mapTheme.szTitleUpper);
		}
		// GR 25.05.2015 define scaledependency for label display
		if (__isdef(styleObj.labelupper)) {
			mapTheme.szLabelUpper = styleObj.labelupper;
			mapTheme.nLabelUpper = __scanScaleValue(mapTheme.szLabelUpper);
		}
		// GR 21.03.2009 define scaledependency for value label 
		if (__isdef(styleObj.valueupper)) {
			mapTheme.szValueUpper = styleObj.valueupper;
			mapTheme.nValueUpper = __scanScaleValue(mapTheme.szValueUpper);
		}
		// GR 15.03.2017 accept also 'valuesupper' 
		if (__isdef(styleObj.valuesupper)) {
			mapTheme.szValueUpper = styleObj.valuesupper;
			mapTheme.nValueUpper = __scanScaleValue(mapTheme.szValueUpper);
		}
		// GR 12.01.2023 define scaledependency lower for value label 
		if (__isdef(styleObj.valuelower)) {
			mapTheme.szValueLower = styleObj.valuelower;
			mapTheme.nValueLower = __scanScaleValue(mapTheme.szValueLower);
		}
		// GR 12.01.2023 accept also 'valueslower' 
		if (__isdef(styleObj.valueslower)) {
			mapTheme.szValueLower = styleObj.valueslower;
			mapTheme.nValueLower = __scanScaleValue(mapTheme.szValueLower);
		}
		// GR 12.11.2016 define scaledependency for chart glowing 
		if (__isdef(styleObj.glowupper)) {
			mapTheme.szGlowUpper = styleObj.glowupper;
			mapTheme.nGlowUpper = __scanScaleValue(mapTheme.szGlowUpper);
		}
		// GR 12.11.2016 define scaledependency for chart glowing 
		if (__isdef(styleObj.glowlower)) {
			mapTheme.szGlowLower = styleObj.glowlower;
			mapTheme.nGlowLower = __scanScaleValue(mapTheme.szGlowLower);
		}
		// GR 24.02.2016 define scaledependency for chart 
		if (__isdef(styleObj.chartupper)) {
			mapTheme.szChartUpper = styleObj.chartupper;
			mapTheme.nChartUpper = __scanScaleValue(mapTheme.szChartUpper);
		}
		// GR 24.02.2016 define scaledependency for chart 
		if (__isdef(styleObj.chartlower)) {
			mapTheme.szChartLower = styleObj.chartlower;
			mapTheme.nChartLower = __scanScaleValue(mapTheme.szChartLower);
		}
		// GR 10.09.2021 define scaledependency for features (layer) 
		if (__isdef(styleObj.featureupper)) {
			mapTheme.szFeatureUpper = styleObj.featureupper;
			mapTheme.nFeatureUpper = __scanScaleValue(mapTheme.szFeatureUpper);
		}
		// GR 10.09.2021 define scaledependency for features (layer)
		if (__isdef(styleObj.featurelower)) {
			mapTheme.szFeatureLower = styleObj.featurelower;
			mapTheme.nFeatureLower = __scanScaleValue(mapTheme.szFeatureLower);
		}
		// GR 24.01.2018 define scaledependency for shadow 
		if (__isdef(styleObj.shadowupper)) {
			mapTheme.szShadowUpper = styleObj.shadowupper;
			mapTheme.nShadowUpper = __scanScaleValue(mapTheme.szShadowUpper);
		}
		// GR 24.01.2018 define scaledependency for shadow 
		if (__isdef(styleObj.shadowlower)) {
			mapTheme.szShadowLower = styleObj.shadowlower;
			mapTheme.nShadowLower = __scanScaleValue(mapTheme.szShadowLower);
		}
		// GR 29.05.2018 define scaledependency for declutter 
		if (__isdef(styleObj.declutterupper)) {
			mapTheme.szDeclutterUpper = styleObj.declutterupper;
			mapTheme.nDeclutterUpper = __scanScaleValue(mapTheme.szDeclutterUpper);
		}
		// GR 22.10.2013 define scale for value label 
		if (__isdef(styleObj.valuescale)) {
			mapTheme.nValueScale = Number(styleObj.valuescale);
		}
		// GR 06.04.2009 define the number of frames for a clip
		if (__isdef(styleObj.clipframes)) {
			mapTheme.nClipFrames = styleObj.clipframes;
		}
		if (__isdef(styleObj.clipframerate)) {
			mapTheme.nClipFrameRate = styleObj.clipframerate;
			mapTheme.nClipTimeout = 1 / Number(styleObj.clipframerate) * 1000;
		}
		if (__isdef(styleObj.cliplegend)) {
			mapTheme.nClipColorLegend = Number(styleObj.cliplegend);
		}
		// GR 28.01.2015 remains for compatibility reason
		if (__isdef(styleObj.clipvaluesize)) {
			mapTheme.nValueSizeMin = Number(styleObj.clipvaluesize);
		}
		// GR 20.11.2011 define size clipping for chart values
		if (__isdef(styleObj.minvaluesize)) {
			mapTheme.nValueSizeMin = Number(styleObj.minvaluesize);
		}
		// GR 18.01.2015 define number of decimals for value display
		if (__isdef(styleObj.valuedecimals)) {
			mapTheme.nValueDecimals = styleObj.valuedecimals;
		}
		// GR 19.06.2013 define power for calculating label fading 
		if (__isdef(styleObj.fadevaluepow)) {
			mapTheme.szFadeValuePow = styleObj.fadevaluepow;
		}
		// GR 18.03.2013 define scale for dynamic opacity calculation
		if (__isdef(styleObj.dopacityscale)) {
			mapTheme.nDopacityScale = styleObj.dopacityscale;
		}
		// GR 18.03.2013 define ramp type (linear|pow|log) for dynamic opacity calculation
		if (__isdef(styleObj.dopacityramp)) {
			mapTheme.szDopacityRamp = styleObj.dopacityramp;
		}
		// GR 18.03.2013 define power for dynamic opacity calculation
		if (__isdef(styleObj.dopacitypow)) {
			mapTheme.nDopacityPow = styleObj.dopacitypow;
		}
		// GR 02.10.2013 define fading for negative chart values 
		if (__isdef(styleObj.fadenegative)) {
			mapTheme.nFadeNegative = Number(styleObj.fadenegative) || 0.5;
		}
		// GR 16.09.2019 define brightness for COMPOSECOLOR
		if (__isdef(styleObj.brightness)) {
			mapTheme.nBrightness = styleObj.brightness;
		}
		// GR 21.02.2014 define clip for stacked bars 
		if (__isdef(styleObj.clipparts)) {
			mapTheme.nClipParts = Number(styleObj.clipparts) || 0;
		}
		// GR 16.01.2015 define clip for chart size 
		if (__isdef(styleObj.minsize)) {
			mapTheme.nChartSizeMin = Number(styleObj.minsize) || 0;
		}
		if (__isdef(styleObj.minchartsize)) {
			mapTheme.nChartSizeMin = Number(styleObj.minchartsize) || 0;
		}
		if (__isdef(styleObj.maxcharts)) {
			mapTheme.nMaxCharts = Math.round(Number(styleObj.maxcharts)) || 0;
		}
		// remains for compatibility 
		if (__isdef(styleObj.clipsize)) {
			mapTheme.nChartSizeMin = Number(styleObj.clipsize) || 0;
		}
		// GR 27.06.2019 define power for dynamic size calculation
		if (__isdef(styleObj.sizepow)) {
			mapTheme.nSizePow = styleObj.sizepow;
		}
		// GR 14.01.2015 define parts to show for stacked bars 
		if (__isdef(styleObj.showparts)) {
			mapTheme.szShowParts = this.toString(styleObj.showparts);
			mapTheme.szShowPartsA = this.toArray(styleObj.showparts);
		}
		// GR 15.05.2014 define MULTIGRID grid x  
		if (__isdef(styleObj.gridx)) {
			mapTheme.nGridX = Number(styleObj.gridx) || 1;
		}
		// GR 28.10.2014 define AGGREGATE width  
		if (__isdef(styleObj.gridwidth)) {
			if (String(styleObj.gridwidth).match(/px/)) {
				mapTheme.nGridWidthPx = parseFloat(styleObj.gridwidth) || 50;
				map.Themes.doChangeThemeStyle(mapTheme.szId, "AUTOGRID", "add");
			}
			mapTheme.nGridWidth = Number(styleObj.gridwidth) || 0;
		}
		// GR 05.11.2015 define AGGREGATE grid columns  
		if (__isdef(styleObj.gridmatrix)) {
			mapTheme.nGridMatrix = Number(styleObj.gridmatrix) || 20;
			map.Themes.doChangeThemeStyle(mapTheme.szId, "AUTOGRID", "add");
		}
		// GR 05.11.2015 define AGGREGATE grid columns  
		if (__isdef(styleObj.gridwidthpx)) {
			mapTheme.nGridWidthPx = Number(styleObj.gridwidthpx) || 50;
			map.Themes.doChangeThemeStyle(mapTheme.szId, "AUTOGRID", "add");
		}
		// GR 24.01.2019 define grid offset (in %)  
		if (__isdef(styleObj.gridoffsetx)) {
			mapTheme.nGridOffsetX = Number(styleObj.gridoffsetx) || 0;
		}
		// GR 24.01.2019 define grid offset (in %)  
		if (__isdef(styleObj.gridoffsety)) {
			mapTheme.nGridOffsetY = Number(styleObj.gridoffsety) || 0;
		}
		// GR 12.05.2015 define field for aggregation
		if (__isdef(styleObj.aggregationfield)) {
			mapTheme.szAggregationField = styleObj.aggregationfield;
		}
		// GR 29.01.2009 define aggregation mode
		if (__isdef(styleObj.aggregationscale)) {
			mapTheme.szAggregationFieldA = this.toArray(styleObj.aggregationscale);
		}
		// GR 12.07.2023 define aggregation mode (alias)
		if (__isdef(styleObj.aggregation)) {
			mapTheme.szAggregationFieldA = this.toArray(styleObj.aggregation);
		}
		// GR 21.10.2016 define ninimal aggregation count
		if (__isdef(styleObj.minaggregation)) {
			mapTheme.szMinAggregation = styleObj.minaggregation;
			mapTheme.nMinAggregation = Number(styleObj.minaggregation) || 0;
		}
		// GR 21.09.2018 define scaledependency for aggregation 
		if (__isdef(styleObj.aggregationupper)) {
			mapTheme.szAggregationUpper = styleObj.aggregationupper;
			mapTheme.nAggregationUpper = __scanScaleValue(mapTheme.szAggregationUpper);
		}
		// GR 21.09.2018 define scaledependency for aggregation 
		if (__isdef(styleObj.aggregationlower)) {
			mapTheme.szAggregationLower = styleObj.aggregationlower;
			mapTheme.nAggregationLower = __scanScaleValue(mapTheme.szAggregationLower);
		}
		// GR 18.12.2020 define scaledependency for clip to goe bounds 
		if (__isdef(styleObj.clipupper)) {
			mapTheme.szClipUpper = styleObj.clipupper;
			mapTheme.nClipUpper = __scanScaleValue(mapTheme.szClipUpper);
		}
		// GR 18.12.2020 define scaledependency for clip to goe bounds 
		if (__isdef(styleObj.cliplower)) {
			mapTheme.szClipLower = styleObj.cliplower;
			mapTheme.nClipLower = __scanScaleValue(mapTheme.szClipLower);
		}
		// GR 11.06.2016 define user draw function
		if (__isdef(styleObj.userdraw)) {
			mapTheme.userDraw = styleObj.userdraw;
		}
		// GR 26.07.2016 define the center part of a donut with center value
		if (__isdef(styleObj.centerpart)) {
			mapTheme.szCenterPart = this.toString(styleObj.centerpart);
		}
		// GR 03.02.2018 theme crated as bookmark from an original theme
		if (__isdef(styleObj.child)) {
			mapTheme.fChild = true;
		}
		// GR 29.08.2018 define value matcher for CATEGORICAL = categorical themes
		if (__isdef(styleObj.valuemap)) {
			mapTheme.valueMap = styleObj.valuemap;
		}
		// GR 13.12.2022 layer hidden ?
		if (__isdef(styleObj.visible)) {
			mapTheme.fVisible = JSON.parse(styleObj.visible);
			mapTheme.fHide = !mapTheme.fVisible;
		}
	}
};

/**
 * constructs the creation strings for all map themes 
 * complement to newTheme(...)
 * @return array of theme definition strings
 * @type array of string
 */
Map.Themes.prototype.getAllThemeDefinitionStrings = function () {
	var szDefA = [];
	for (var i = 0; i < this.themesA.length; i++) {
		szDefA.push(this.getThemeDefinitionString(this.themesA[i]));
	}
	return szDefA;
};

// .............................................................................
// local helper 
// .............................................................................

var __toRGB = function (color) {
	var rr, gg, bb = "0123456789abcdef";
	rr = parseInt(color.substr(1, 2), 16);
	gg = parseInt(color.substr(3, 2), 16);
	bb = parseInt(color.substr(5, 2), 16);
	return "RGB(" + rr + "," + gg + "," + bb + ")";
};
var __getSaveColor = function (color) {
	try {
		if (color.charAt(0) == '#') {
			return __toRGB(color);
		}
	} catch (e) {}
	return color;
};
var __getSaveColorScheme = function (colorSchemeA) {
	for (var i = 0; i < colorSchemeA.length; i++) {
		colorSchemeA[i] = __getSaveColor(colorSchemeA[i]);
	}
	return colorSchemeA.join('|');
};
var __scanScaleValue = function (szScale) {
	if (String(szScale).match(/:/)) {
		return Number(szScale.split(':')[1]);
	} else {
		return Number(szScale);
	}
};

// .............................................................................

/**
 * clean up the theme definition object 
 * simplify symbols array and remove default parameter
 * to make a smaller theme definition object
 * @parameter objTheme the theme object as source 
 * @return the cleared theme object
 * @type string
 */
Map.Themes.prototype.cleanUpThemeObj = function (themeObj,origObj) {
	
	// GR 09.01.2022 get original values to save or share theme
	themeObj.field 			= origObj.field;
	themeObj.style.values	= origObj.style.values;
	themeObj.style.label 	= origObj.style.label;
	themeObj.style.xaxis 	= origObj.style.xaxis;

	var style = themeObj.style;
    var first = null;
    
	if (style.colorscheme) {
		first = style.colorscheme[0];
		for (var i in style.colorscheme) {
			if (style.colorscheme[i] != first) {
				first = null;
				break;
			}
		}
		if (first) {
			style.colorscheme.length = 1;
		}
	}

	if (style.symbols) {
		first = style.symbols[0];
		for (var i in style.symbols) {
			if (style.symbols[i] != first) {
				first = null;
				break;
			}
		}
		if (first) {
			style.symbols.length = 1;
		}
	}

	if (style.aggregationscale) {
		style.aggregationfield = null;
		style.gridwidth = null;
		style.gridwidthpx = null;
	} else
	if (style.aggregationfield) {
		style.gridwidth = null;
		style.gridwidthpx = null;
	} else
	if (style.gridwidthpx) {
		style.gridwidth = null;
	}

	if (style.evidence) {
		if (style.evidence == "isolate") {
			style.evidence = null;
		}
	}
	if (style.aggregation) {
		style.aggregation = null;
	}
	if (!(style.type.match(/DOMINANT/) ||
			style.type.match(/PERCENTOFMEAN/) ||
			style.type.match(/OFFSETMEAN/) ||
			style.type.match(/PERCENTOFMEAN/) ||
			style.type.match(/DEVIATION/))) {
		style.dominantfilter = null;
		style.dominantdfilter = null;
	}
	if (style.itemfield && style.lookupfield && (style.itemfield == style.lookupfield)) {
		style.itemfield = null;
	}
	return themeObj;
};

/**
 * constructs the creation strings of one map theme
 * complement to newTheme(...)
 * @parameter objTheme the theme object as source 
 * @return the theme definition string
 * @type string
 */
Map.Themes.prototype.getThemeDefinitionString = function (themeObj) {

	var szTheme = "map.Api.newMapTheme" +
		"(\"" + themeObj.szThemes + "\",\"" + (themeObj.szFields || "") + "\",\"" + (themeObj.szField100 || "") + "\"" +
		",\"type:" + themeObj.szFlag + ";" + "colorscheme:" + __getSaveColorScheme(themeObj.origColorScheme) + ";" + __maptheme_getStyleString(themeObj) + ";child:true;\"" +
		");";
	return szTheme;
};
/**
 * constructs the style strings of one map theme
 * @parameter szId the id of the theme
 * @return the theme style string
 * @type string
 */
Map.Themes.prototype.getMapThemeStyleString = function (szId) {
	var themeObj = this.getTheme(szId) || this.activeTheme;
	if (themeObj && themeObj.colorScheme) {
		return "type:" + themeObj.szFlag + ";" + "colorscheme:" + themeObj.colorScheme + ";" + __maptheme_getStyleString(themeObj) + "";
	} else {
		return null;
	}
};
/**
 * constructs the creation object of one map theme
 * @parameter objTheme the theme object as source 
 * @return the theme definition object
 * @type object
 */
Map.Themes.prototype.getMapThemeDefinitionObj = function (szId) {
	var themeObj = this.getTheme(szId) || this.activeTheme;
	var newObj = {};
	newObj.layer = themeObj.szThemes;
	newObj.field = themeObj.szFields || "";
	newObj.field100 = themeObj.szField100 || "";
	
	// GR 10.02.2021 new theme type WMS server has different set of parameter 
	if ( themeObj.szFlag.match(/\bWMS|IMAGE\b/) ){
		var styleObj = {
			"type":themeObj.szFlag,
			"server":themeObj.szServer,
			"opacity":themeObj.nOpacity,
			"title":themeObj.szTitle,
			"name":themeObj.szName
		};
		newObj.style = styleObj;
		return newObj;
	}

	// GR 11.11.2019 make values array for CATEGORICAL themes is not exists but label are defined 
	// label are created while loading and parsing data
	if (themeObj.szFlag.match(/\bCATEGORICAL\b/) &&
		(themeObj.colorScheme && (themeObj.colorScheme.length > 3)) &&
		!(themeObj.szValuesA && themeObj.szValuesA.length) &&
		(themeObj.szLabelA && themeObj.szLabelA.length) &&
		(themeObj.szLabelA.length <= 100)) {
		themeObj.szValuesA = themeObj.szLabelA.slice(0);
	}

	var styleObj = {
		"type": themeObj.szFlag,
		"colorscheme": themeObj.origColorScheme
	};
	var sObj = __maptheme_getStyleObj(themeObj);
	for (var a in sObj) {
		styleObj[a] = sObj[a];
	}
	newObj.style = styleObj;
	
	return this.cleanUpThemeObj(newObj,themeObj.origDef);
};

/**
 * retrieve a MapTheme object from the list 
 * @parameter szId the id of the map theme to retrieve
 */
Map.Themes.prototype.getTheme = function (szId) {
	if (!szId || (typeof(szId) != 'string') ){
		return this.activeTheme;
	}
	szId = szId.split(":")[0];
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szId == szId) {
			return this.themesA[i];
		}
		if (this.themesA[i].szName == szId) {
			return this.themesA[i];
		}
	}
	// GR 27.08.2022 theme "0","1","2"...
	if ( !isNaN(Number(szId)) && (Number(szId) < this.themesA.length) ){
		return this.themesA[Number(szId)];
	}
	return this.activeTheme;
};
/**
 * returns the index of a themes in the list
 */
Map.Themes.prototype.getThemeIndex = function (szId) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szId == szId) {
			return i;
		}
	}
};
/**
 * refresh a MapTheme 
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.refreshTheme = function (szId) {

	var mapTheme = this.getTheme(szId);

	if (mapTheme) {
		// reload data
		mapTheme.fRealize = true;
		// but keep existing charts, don't make them twice !
		mapTheme.fRedraw = true;

		if (!fAllIncluded) {
			if (mapTheme.coTable) {
				this.loadExternalData(mapTheme.coTable, true, mapTheme);
				return;
			}
		}
		if ( mapTheme.animateTimeout ){
			clearTimeout(mapTheme.animateTimeout);
		}
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
};
/**
 * show next frame of a MapTheme type clip
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.nextClipFrame = function (szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.realizeNextClipFrame();
	}
};
/**
 * show a specifiv frame of a MapTheme type clip
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.setClipFrame = function (szId, n) {
	var mapTheme = szId ? (this.getTheme(szId)) : this.activeTheme;
	if (mapTheme) {
		mapTheme.setClipFrame(n);
	}
};
/**
 * pause a MapTheme type clip
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.pauseClip = function (szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.pauseClip();
	}
};
/**
 * restart a MapTheme type clip
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.startClip = function (szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.startClip();
	}
};
/**
 * load external data via JSLoader
 * do not load if data already loaded, but reload, if fRefresh == true 
 * @parameter szData the name of the external data; either equal theme or cotable
 * @parameter fRefresh flag, whether thedata should be reloaded if already present
 */
Map.Themes.prototype.loadExternalData = function (szData, fRefresh, themeObj) {

	// if not exists, create global array to preserve resolved external data script paths
	if (!this.coTableExt) {
		this.coTableExt = [];
	}
	_TRACE("... load external data ...:" + szData);
	if (szData) {
		var szMessage = map.Dictionary.getLocalText("... creating theme ...");
		if (fRefresh) {
			if ((eval("typeof(" + szData + ")")) != "undefined") {
				eval(szData + ".table = null");
			}
			szMessage = map.Dictionary.getLocalText("... refreshing theme ...");
		}

		// test 2 possible data formats !!
		// old one: data_table = {} and new one: data.table = {}
		this.__test = null;
		try {
			eval("this.__test = " + szData + ".table");
		} catch (e) {
			try {
				eval("this.__test = " + szData + "_table");
			} catch (e) {}
		}

		// load data if data object not found
		// ----------------------------------

		// check, if we have already loaded from this source
		// 

		// bypass check if editor mode or no data url given (data set by user object)

		var fCached = themeObj.fEditor || !(themeObj.coTableUrl && themeObj.coTableExt) || false;

		if (this.themeDataCacheA[szData]) {
			if (((!this.themeDataCacheA[szData].coTableUrl && !themeObj.coTableUrl) || (this.themeDataCacheA[szData].coTableUrl == themeObj.coTableUrl)) &&
				((!this.themeDataCacheA[szData].coTableExt && !themeObj.coTableExt) || (this.themeDataCacheA[szData].coTableExt == themeObj.coTableExt))) {
				fCached = true;
			}
		}

		// if data loaded, source equal and cache not disabled
		// 

		if ((this.__test && fCached && (themeObj.fDataCache === true))) {

			this.fWaitforData = false;
			themeObj.fWaitingforData = false;

			_TRACE("data is already loaded, then make the theme");
			// data is already loaded, then make the theme 
			executeWithMessage('map.Themes.execute()', szMessage);

			// if there is an external data script, get the stored resolved path
			// need this for sharing URL's
			if (themeObj && themeObj.coTableExt) {
				themeObj.coTableExt = this.coTableExt[themeObj.coTable];
			}
			return;
		} else {
			// if not, try to load external data

			// GR 20.10.2013 new external data loader by explicit data url 
			// -----------------------------------------------------------
			if (themeObj && (themeObj.coTableUrl || themeObj.coTableExt || (themeObj.coTableType == "ext") )) {
				try {
					// set cached object
					this.themeDataCacheA[szData] = {
						"coTableUrl": themeObj.coTableUrl,
						"coTableExt": themeObj.coTableExt
					};

					this.fWaitforData = true;
					themeObj.fWaitingforData = true;

					//clearMessage();
					HTMLWindow.ixmaps.htmlgui_loadExternalData(themeObj.coTableUrl, {
						"theme": themeObj,
						"type": themeObj.coTableType,
						"name": themeObj.coTable,
						"ext": themeObj.coTableExt
					});

					// htmlgui_loadExternalData resolves the path of the external data script to load changing .coTableExt
					// we have save this in a glabel array, for sharing URL's 
					this.coTableExt[themeObj.coTable] = themeObj.coTableExt;

					return;

				} catch (e) {}
			}
			// if no URL given, try to load from default path, that is the maps directory
			// --------------------------------------------------------------------------
			if (fLocalHost) {
				this.loadExternalDataDefault(szData, fRefresh, szMessage);
			} else {
				this.loadExternalDataZipped(szData, fRefresh, szMessage);
			}
		}
	}
};
Map.Themes.prototype.loadExternalDataZipped = function (szData, fRefresh, szMessage) {
	this.fWaitforData = true;
	displayMessage(map.Dictionary.getLocalText("... loading data ..."));
	_TRACE("... loading data ...");
	var jsLoader = new JSLoader();
	jsLoader.finishedCallback = "map.Themes.loadExternalDataFinish('" + szMessage + "')";
	jsLoader.errorCallback = "map.Themes.loadExternalDataDefault('" + szData + "'," + fRefresh + ",'" + szMessage + "')";
	jsLoader.szMessage = map.Dictionary.getLocalText("... loading data ...");
	jsLoader.loadScript(map.mapRoot + szData + ".js.gz", fRefresh);
};
Map.Themes.prototype.loadExternalDataDefault = function (szData, fRefresh, szMessage) {
	this.fWaitforData = true;
	displayMessage(map.Dictionary.getLocalText("... loading data ..."));
	_TRACE("... loading data ...");
	var jsLoader = new JSLoader();
	jsLoader.finishedCallback = "map.Themes.loadExternalDataFinish('" + szMessage + "')";
	jsLoader.errorCallback = "map.Themes.loadExternalDataFinish('" + szMessage + "')";
	//	jsLoader.errorCallback = "displayMessage('Error on loading data',1000)"; 
	jsLoader.szMessage = map.Dictionary.getLocalText("... loading data ...");
	jsLoader.loadScript(map.mapRoot + szData + ".js", fRefresh);
};
Map.Themes.prototype.loadExternalDataFinish = function (szMessage) {
	this.fWaitforData = false;
	executeWithMessage('map.Themes.execute()', szMessage);
};

/**
 * set external data 
 * create the data object (name given by szDataName) 
 * unblock the theme that is waiting for this data name
 * @parameter szThemeId the ID of the waiting theme (may be null)
 * @parameter dataObj loadad data in an internal (jsonDB) data table format
 * @parameter szDataName the name of the data object to create
 */
Map.Themes.prototype.setExternalData = function (szThemeId, dataObj, szDataName) {
	// create the data object with the desired name, must be identical to style ...
	// export argument dataObj, necessary for javascript compressin by Google Code Compiler 
	if (dataObj) {
		this._dataObj = dataObj;
		eval(szDataName + " = this._dataObj");
	}
	// remove flag that bloks the theme execution (because we were waiting for the data)
	this.fWaitforData = false;
	var themesA = this.getAllThemes();
	for (var i in themesA) {
		if (themesA[i].coTable == szDataName) {
			themesA[i].fWaitingforData = false;
		}
	}
	// retrigger theme execution
	this.execute();
};

/**
 * activate a MapTheme 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.activateTheme = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fRedraw = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	evt.stopPropagation();
	evt.preventDefault();
};
/**
 * show a MapTheme 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.showTheme = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fShow = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * hide a MapTheme 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.hideTheme = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fHide = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * toggle a MapTheme 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.toggleTheme = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fToggle = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * remove a MapTheme 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.removeTheme = function (evt, szId) {
	for (var i = 0; i < this.themesA.length; i++) {
		if ( (this.themesA[i].szId == szId) || (this.themesA[i].szName == szId) ){
			var mapTheme = this.themesA[i];
			if (mapTheme.szFlag.match(/LOCKED/)) {
				continue;
			}
			if (mapTheme.szFlag.match(/CHART/)) {
				mapTheme.fToggle = true;
			}
			mapTheme.fRemove = true;
			executeWithMessage("map.Themes.execute()", "... processing ...");
		}
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * remove all map themes
 * @parameter evt the event
 */
Map.Themes.prototype.removeAll = function (evt) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (!this.themesA[i].szFlag.match(/LOCKED/)) {
			this.themesA[i].fRemove = !this.themesA[i].fRealize;
		}
	}
	//executeWithMessage("map.Themes.execute()","... processing ...");
	//this.fWaitforData = true;
	setTimeout(function(){map.Themes.execute();},100);
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * remove all map themes
 * @parameter evt the event
 */
Map.Themes.prototype.removeAllCharts = function (evt) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szFlag.match(/CHART/) && !this.themesA[i].szFlag.match(/LOCKED/)) {
			this.themesA[i].fRemove = !this.themesA[i].fRealize;
		}
	}
	//executeWithMessage("map.Themes.execute()","... processing ...");
	this.fWaitforData = true;
	map.Themes.execute();
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * remove all map themes
 * @parameter evt the event
 */
Map.Themes.prototype.removeAllChoropleth = function (evt) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szFlag.match(/CHOROPLETH/) && !this.themesA[i].szFlag.match(/LOCKED/)) {
			this.themesA[i].fRemove = !this.themesA[i].fRealize;
		}
	}
	this.fWaitforData = true;
	executeWithMessage("map.Themes.execute()", "... processing ...");
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * remove all map themes
 * @parameter evt the event
 */
Map.Themes.prototype.removeAllSelections = function (evt) {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szFlag.match(/SELECTION/)) {
			this.themesA[i].fRemove = true;
			executeWithMessage("map.Themes.execute()", "... processing ...");
		}
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * refresh all map theme info displays
 * @parameter evt the event
 */
Map.Themes.prototype.redrawInfoAll = function (evt) {
	for (var i = 0; i < this.themesA.length; i++) {
		this.themesA[i].fRedrawInfo = true;
	}
	//executeWithMessage("map.Themes.execute()","... processing ...");
	map.Themes.execute();
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * reformat themes display on map resize
 * @parameter evt the event
 */
Map.Themes.prototype.reformat = function (evt) {

	this.minX = 0;
	this.minY = 0;

	for (var i = 0; i < this.themesA.length; i++) {
		this.themesA[i].fRepositionInfo = true;
		this.themesA[i].fRedrawInfo = true;
	}
	//executeWithMessage("map.Themes.execute()","... processing ...");
	map.Themes.execute();
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * execute the various actions on the MapTheme, which have been programmized by flags 
 */
Map.Themes.prototype.execute = function () {

	_TRACE("Map.Themes.execute() =====>");

	var szDisableType = null;
	var szDisableThemes = null;
	var i = 0;

	if (!map.isIdle()) {
		setTimeout(function(){map.Themes.execute();}, 100);
		return;
	}
	if (this.fWaitforData) {
		return;
	}
	if (map.Tiles.isLoading()) {
		setTimeout(function(){map.Themes.execute();}, 250);
		this.fExecuteDelayed = true;
		return;
	}
	if (this.fExecuteDelayed) {
		this.fExecuteDelayed = false;
		executeWithMessage("map.Themes.execute()", " ... ");
		return;
	}
	// disable theme widgets, if necessary
	for (i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].fRealize || this.themesA[i].fRedraw || this.themesA[i].fToFront) {
			if (this.themesA[i].szFlag.match(/CHOROPLETH/) && !this.themesA[i].szFlag.match(/SUBTHEME/)) {
				szDisableType = this.themesA[i].szShapeType;
				szDisableThemes = this.themesA[i].szThemes;
				_TRACE("Disable =====>");
			}
		}
	}
	if (szDisableType && this.enableMultiChoropleth) {
		_TRACE("do Disable =====>");
		for (i = 0; i < this.themesA.length; i++) {
			if (this.themesA[i].szFlag && this.themesA[i].szFlag.match(/CHOROPLETH/) &&
				(this.themesA[i].szShapeType == szDisableType)
			   ) {
				this.themesA[i].disable();
				this.themesA[i].isVisible = false;
				// GR 31.08.2008 to avoid enable via redrawInfoAll()
				this.themesA[i].fRedrawInfo = false;
				//				this.unlabelMap();
			}
		}
	}
	if (szDisableType && !this.enableMultiChoropleth) {
		_TRACE("test Remove old CHOROPLETH themes =====>");
		for (i = 0; i < this.themesA.length; i++) {
			if (this.themesA[i].szFlag && this.themesA[i].szFlag.match(/CHOROPLETH/) && 
				(this.themesA[i].szShapeType == szDisableType) &&
				(this.themesA[i].szThemes == szDisableThemes) 
			   ) {
				if (!(this.themesA[i].fRealize || this.themesA[i].fRedraw || this.themesA[i].fToFront)) {
					_TRACE("do Remove old CHOROPLETH theme" + this.themesA[i].szId + "=====>");
					this.themesA[i].fRemove = true;
				}
			}
		}
	}
	// execute projected methods
	for (i = 0; i < this.themesA.length; i++) {

		if (this.themesA[i].fWaitingforData) {
			return;
		}
		if (this.themesA[i].fShow && this.themesA[i].fDone) {
			_TRACE("Show =====>");
			this.themesA[i].toggle(true);
			this.themesA[i].fShow = false;
			break;
		}
		if (this.themesA[i].fHide && this.themesA[i].fDone) {
			_TRACE("Hide =====>");
			this.themesA[i].toggle(false);
			this.themesA[i].fHide = false;
			break;
		}
		if (this.themesA[i].fToggle && this.themesA[i].fDone) {
			_TRACE("Toggle =====>");
			this.themesA[i].toggle();
			this.themesA[i].fToggle = false;
			this.execute();
			//			setTimeout(function(){map.Themes.execute();},100);
			break;
		}
		if (this.themesA[i].fRemove) {
			_TRACE("Remove =====> " + this.themesA[i].szId);
			if ((this.themesA.length > 1) && !this.themesA[i].szFlag.match(/SELECTION/) && !this.themesA[i].szFlag.match(/CHART/)) {
				this.activateNextPaint(this.themesA[i]);
			}
			this.themesA[i].removeElements();
			this.remove(this.themesA[i]);
			this.reformat();
			this.execute();
			break;
		}
		if (this.themesA[i].fRealize) {
			if ( (this.themesA[i].nChartUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale >  this.themesA[i].nChartUpper)) ||
	     		 (this.themesA[i].nChartLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.themesA[i].nChartLower)) )  {
				continue;
			}
			// GR must be set to false, if not possible conflict with realize()
			// GR 20.02.2018 we need to keep the flag for refresh
			//this.themesA[i].fRedraw = false;
			_TRACE("realize " + this.themesA[i].szId);
			this.themesA[i].fEnableProgressBar = true;
			//setTimeout(function(){map.Themes.showProgressBar();}, 5000);
			this.themesA[i].fRealize = false;
			this.themesA[i].realize();
			//			this.themesA[i].fRedrawInfo = true;
			continue;
		}
		if (this.themesA[i].fRedraw) {
			_TRACE("Redraw =====> " + this.themesA[i].szId);
			this.themesA[i].fRedraw = false;
			this.themesA[i].fActualize = false;
			if (this.themesA[i].checkHiddenLayerState && this.themesA[i].checkHiddenLayerState()) {
				this.themesA[i].fRealize = true;
				this.themesA[i].fRedraw = false;
				this.themesA[i].fReload = false;
				this.themesA[i].unpaintMap();
				map.Themes.execute();
				continue;
			}
			this.themesA[i].fEnableProgressBar = true;
			if ( !this.themesA[i].szFlag.match(/FEATURES/) ){
				this.themesA[i].unpaintMap();
			}
			this.themesA[i].redraw(false);
			continue;
		}
		if (this.themesA[i].fActualize) {
			_TRACE("Actualize =====> " + this.themesA[i].szId);
			this.themesA[i].fActualize = false;
			if (this.themesA[i].checkHiddenLayerState && this.themesA[i].checkHiddenLayerState()) {
				this.themesA[i].fRealize = true;
				this.themesA[i].fRedraw = false;
				this.themesA[i].fReload = false;
				this.themesA[i].unpaintMap();
				map.Themes.execute();
				continue;
			}
			this.themesA[i].fEnableProgressBar = true;
			this.themesA[i].redraw(false);
			continue;
		}
		if (this.themesA[i].fToFront) {
			_TRACE("ToFront =====> " + this.themesA[i].szId);
			this.themesA[i].fEnableProgressBar = false;
			this.themesA[i].toFront();
			this.themesA[i].fToFront = false;
			continue;
		}
		if (this.themesA[i].fResize) {
			_TRACE("Resize =====> " + this.themesA[i].szId);
			this.themesA[i].resize(this.themesA[i].fResize);
			this.themesA[i].fResize = false;
			continue;
		}
		if (this.themesA[i].fOpacity) {
			_TRACE("Opacity =====> " + this.themesA[i].szId);
			this.themesA[i].opacity(this.themesA[i].fOpacity);
			this.themesA[i].fOpacity = false;
			continue;
		}
		if (this.themesA[i].fBlur) {
			_TRACE("Blur =====> " + this.themesA[i].szId);
			this.themesA[i].blur(this.themesA[i].nBlur);
			this.themesA[i].fBlur = false;
			continue;
		}
		if (this.themesA[i].fOffset) {
			_TRACE("Offset =====> " + this.themesA[i].szId);
			this.themesA[i].offset(this.themesA[i].fOffset);
			this.themesA[i].fOffset = false;
			continue;
		}
		if (this.themesA[i].fRedrawInfo) {
			_TRACE("Redraw Info =====> " + this.themesA[i].szId);
			if (this.themesA[i].widgetNode) {
				this.themesA[i].showInfo();
			}
			this.themesA[i].fRedrawInfo = false;
			continue;
		}
		if (this.themesA[i].fResort) {
			_TRACE("Resort =====> " + this.themesA[i].szId);
			try {
				this.themesA[i].sortChartObjects();
			} catch (e) {}
			this.themesA[i].fResort = false;
			continue;
		}
		if (this.themesA[i].fDeclutter) {
			_TRACE("Declutter =====> " + this.themesA[i].szId);
			try {
				this.themesA[i].declutterCharts();
			} catch (e) {}
			this.themesA[i].fDeclutter = false;
			continue;
		}
	}
	if (this.executeCallback) {
		_TRACE("Callback =====> ");
		eval(this.executeCallback);
		this.executeCallback = null;
	}
	
	clearMessage();
	clearMessage(1000);
	_TRACE("== Map.Themes.execute done");
};
/**
 * continue to execute the various actions on the MapTheme, which have been programmized by flags 
 */
Map.Themes.prototype.executeContinue = function () {
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].fAnalyze) {
			this.themesA[i].fAnalyze = false;
			this.themesA[i].realize_analyze();
		} else
		if (this.themesA[i].fDraw) {
			this.themesA[i].fDraw = false;
			this.themesA[i].realize_draw();
		} else
		if (this.themesA[i].fContinue) {
			this.themesA[i].fContinue = false;
			this.themesA[i].realizeContinue(this.themesA[i].continueIndex);
		} else
		if (this.themesA[i].fContinueLoadAndAggregate) {
			this.themesA[i].fContinueLoadAndAggregate = false;
			this.themesA[i].loadAndAggregateValuesOfTheme(this.themesA[i].szThemeLayer, this.themesA[i].continueIndex);
		}
	}
};
/**
 * a theme reports end of realization
 */
Map.Themes.prototype.realizeDone = function (mapTheme) {

	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].szFlag.match(/SELECTION/)) {
			this.themesA[i].fRealize = true;
		}
	}
	mapTheme.fRealizeDone = true;

	if (mapTheme.szFlag.match(/BUFFER/)) {
		this.activeBuffer = mapTheme;
	} else {
		this.activeTheme = mapTheme;
	}
	// notify HTML user about the actual theme
	try {
		HTMLWindow.ixmaps.htmlgui_setActualTheme(mapTheme.szId);
	} catch (e) {}

	// notify HTML user about the new theme
	try {
		HTMLWindow.ixmaps.htmlgui_onDrawTheme(mapTheme.szId);
	} catch (e) {}

	if (mapTheme.szFlag.match(/TEXTONLY/)) {
		setTimeout(function(){map.Layer.adaptLabel();}, 10);
	}
	
	if (mapTheme.szFlag.match(/ANIMATEPOSITION/)) {
		if ( mapTheme.animateTimeout ){
			clearTimeout(mapTheme.animateTimeout);
		}
		mapTheme.animateTimeout = setTimeout(function(){map.Themes.animateChartPosition(null,mapTheme.szId);}, 100);
	}
	if ( mapTheme.userChartDrawError && (mapTheme.userChartDrawError == mapTheme.nDoneCount) ){
		displayMessage("User draw function error! ",5000);
	}
	// if all themes done, clear message
	if (this.isIdle()) {
		clearMessage();
	}
};
/**
 * show progress bar while drawing 
 */
Map.Themes.prototype.showProgressBar = function () {
	for (var i = 0; i < this.themesA.length; i++) {
		if ((this.themesA[i].fRealize || this.themesA[i].fContinue || this.themesA[i].fAnalyze || this.themesA[i].fDraw) &&
			this.themesA[i].nCount / this.themesA[i].nDoneCount > 2 &&
			this.themesA[i].mapSleep) {
			this.themesA[i].mapSleep.fShowProgressBar = true;
		} else if (this.themesA[i].fRealize || this.themesA[i].fContinue || this.themesA[i].fAnalyze || this.themesA[i].fDraw) {
			//this.themesA[i].mapSleep = new Map.Sleep("map.Themes.executeContinue",25,map.Dictionary.getLocalText("do selection"));
			//this.themesA[i].mapSleep.nCount = this.themesA[i].nCount;
			//this.themesA[i].mapSleep.szCancel = "map.Themes.cancelExecute()";
			setTimeout(function(){map.Themes.showProgressBar();}, 1000);
		}
	}
};

/**
 * remove one MapTheme object from the list 
 * @parameter mapTheme the map theme object, to remove
 */
Map.Themes.prototype.remove = function (mapTheme) {
	if (mapTheme == this.activeTheme) {
		this.activeTheme = null;
	}
	if (mapTheme == this.activeBuffer) {
		this.activeBuffer = null;
	}
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i] == mapTheme) {
			for (; i < this.themesA.length - 1; i++) {
				this.themesA[i] = this.themesA[i + 1];
			}
			this.themesA.length--;
		}
	}
	mapTheme.removeValues();
	delete mapTheme;
};
/**
 * cancel execution of map themes
 */
Map.Themes.prototype.cancelExecute = function () {
	this.activeTheme.fCancel = true;
};
/**
 * play a sequence of map themes
 */
Map.Themes.prototype.sequence = function () {
	this.sequenceNr = 0;
	this.sequenceNext();
};
/**
 * activate the next theme in sequence
 */
Map.Themes.prototype.sequenceNext = function () {
	if (this.sequenceNr < this.themesA.length) {
		this.themesA[this.sequenceNr].fRedraw = true;
		map.Themes.executeCallback = "setTimeout('map.Themes.sequenceNext()',500)";
		map.Themes.execute();
		this.sequenceNr++;
	}
};
/**
 * activate the next theme in sequence
 */
Map.Themes.prototype.activateNextPaint = function (mapTheme) {
	var iStart = this.getThemeIndex(mapTheme.szId);
	for (var i = iStart - 1; i != iStart; i--) {
		if (i < 0) {
			i = this.themesA.length - 1;
		}
		if (i == iStart) {
			return false;
		}
		if (this.themesA[i].isChecked && !this.themesA[i].szFlag.match(/CHART/)) {
			this.themesA[i].fRedraw = true;
			this.themesA[i].fRedrawInfo = false;
			return true;
		}
	}
	return false;
};
/**
 * change the value display of all themes
 * @param evt the event
 * @param fFlag the change flag 
 */
Map.Themes.prototype.toggleThemeValues = function (evt, fFlag) {
	// this.allwaysShowValues = !this.activeTheme.szFlag.match(/VALUES/);
	this.toggleValueDisplay(evt, this.activeTheme.szId, !this.activeTheme.szFlag.match(/VALUES/));
	/** all othes themes; not active; deactivated
	for ( var i=0; i<this.themesA.length; i++ ){
		this.toggleValueDisplay(evt,this.themesA[i].szId,fFlag);
	}
	**/
};
/**
 * change the legend display of all themes
 * @param evt the event
 * @param fFlag the change flag 
 */
Map.Themes.prototype.toggleThemeLegends = function (evt, fFlag) {
	SVGThemeGroup.style.setProperty("display", fFlag ? "inline" : "none", "");
};
/**
 * minimize the legend display of all themes
 * @param evt the event
 */
Map.Themes.prototype.minimizeThemeLegends = function (evt) {
	this.fMinimizedLegends = true;
	for (var i = 0; i < this.themesA.length; i++) {
		this.minimizeInfo(evt, this.themesA[i].szId);
	}
};
/**
 * change the size of all chart objects
 * @param evt the event
 * @param nDelta the scaling factor 
 */
Map.Themes.prototype.changeAllChartScaling = function (evt, nDelta) {
	for (var i = 0; i < this.themesA.length; i++) {
		this.themesA[i].fResize = 999;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	evt.stopPropagation();
	evt.preventDefault();
};
/**
 * change the size of the chart objects
 * @param evt the event
 * @param szId the id of the chart group 
 * @param nDelta the scaling factor 
 */
Map.Themes.prototype.changeChartScaling = function (evt, szId, nDelta) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fResize = nDelta;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	evt.stopPropagation();
	evt.preventDefault();
};
/**
 * change the opacity of the chart objects
 * @param evt the event
 * @param szId the id of the chart group 
 * @param nDelta the opacity factor 
 */
Map.Themes.prototype.changeChartOpacity = function (evt, szId, nDelta) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fOpacity = nDelta;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	evt.stopPropagation();
	evt.preventDefault();
};
/**
 * change the position of the chart objects
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szLeadId the id of the lead chart (who's position has been changed) 
 */
Map.Themes.prototype.changeChartOffset = function (evt, szId, szLeadId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		if (mapTheme.leadOffset) {
			var leadObj = SVGDocument.getElementById(szLeadId);
			if (leadObj) {
				leadObj.fu = new Methods(leadObj);
				var newLeadOffset = leadObj.fu.getPosition();
				var newLeadScale = leadObj.fu.getGroupScale();
				mapTheme.fOffset = new point(newLeadOffset.x - mapTheme.leadOffset.x, newLeadOffset.y - mapTheme.leadOffset.y);
				leadObj.fu.setPosition(mapTheme.leadOffset.x, mapTheme.leadOffset.y);
				mapTheme.fOffset.x /= map.Zoom.nZoom / newLeadScale.x;
				mapTheme.fOffset.y /= map.Zoom.nZoom / newLeadScale.y;
				mapTheme.offset(mapTheme.fOffset);
				mapTheme.fOffset = false;
				mapTheme.leadOffset = false;
				//		executeWithMessage("map.Themes.execute()","... processing ...");
			}
		}
	}
};
/**
 * get the actual chart offset of the lead chart, the chart which has been moved
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szLeadId the id of the lead chart (who's position has been changed) 
 */
Map.Themes.prototype.tellChartOffset = function (evt, szId, szLeadId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && !mapTheme.leadOffset && this.enableChartOffset) {
		var leadObj = SVGDocument.getElementById(szLeadId);
		if (leadObj) {
			leadObj.fu = new Methods(leadObj);
			mapTheme.leadOffset = leadObj.fu.getPosition();
			_TRACE("Map.Themes.tellChartOffset((): " + mapTheme.leadOffset.x + ',' + mapTheme.leadOffset.y);
		}
	}
};
/**
 * called on the begining of moving the lead object
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szLeadId the id of the lead chart (who's position has been changed) 
 */
Map.Themes.prototype.initChartOffset = function (evt, szId, szLeadId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var leadObj = SVGDocument.getElementById(szLeadId);
		if (leadObj) {
			if (!leadObj.origPosition) {
				leadObj.origPosition = leadObj.fu.getPosition();
			}
			leadObj.onMouseMove = function (evt) {
				leadObj.actualPosition = leadObj.fu.getPosition();
				map.Themes.makeChartOffsetPointer(leadObj);
			};
			leadObj.widgetObj = new Widget(leadObj, leadObj);
		}
	}
};
/**
 * called at the end of the moving of the lead object
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szLeadId the id of the lead chart (who's position has been changed) 
 */
Map.Themes.prototype.endChartOffset = function (evt, szId, szLeadId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var leadObj = SVGDocument.getElementById(szLeadId);
		if (leadObj) {
			leadObj.widgetObj.remove();
		}
	}
};

/**
 * create the pointing edge from offset to position
 */
Map.Themes.prototype.makeChartOffsetPointer = function (node, nScale) {

	nScale = nScale || 1;

	var newPath = null;

	if (node.pointerObj) {
		map.Dom.clearGroup(node.pointerObj);
		map.Dom.clearGroup(node.pointShObj);
	} else {
		node.pointerObj = map.Dom.newGroup(node);
		node.pointShObj = map.Dom.newGroup(node);
		node.pointerObj.parentNode.insertBefore(node.pointerObj, node.pointerObj.parentNode.firstChild);
		node.pointShObj.parentNode.insertBefore(node.pointShObj, node.pointShObj.parentNode.firstChild);
	}

	if (!node.origPosition && !node.actualPosition) {
		return;
	}

	var xPos = 0;
	var yPos = 0;
	var bBox = new box(0, 0, 100, 75);
	var ptOffset = new point(node.actualPosition.x - node.origPosition.x, node.actualPosition.y - node.origPosition.y);

	var pWidth = map.Scale.normalX(15);
	var pHeight = map.Scale.normalX(5);
	var pSize = map.Scale.normalX(10);
	var pXoff = map.Scale.normalX(5);

	pHeight = ptOffset.y + bBox.height / 2;
	pWidth = ptOffset.x + bBox.width / 2;

	if ((Math.abs(pHeight) + bBox.width / 2 - bBox.height / 2 > Math.abs(pWidth))) {
		if (bBox.width / 3 > pSize) {
			if (ptOffset.x > -bBox.width / 3) {
				pWidth -= bBox.width / 3;
			}
			if (ptOffset.x < -bBox.width / 3 * 2) {
				pWidth += bBox.width / 3;
			}
		}
		if (pHeight > 0) {
			newPath = map.Dom.newShape('path', node.pointShObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (pWidth - map.Scale.normalX(5 / nScale)) + ',' + (ptOffset.y + map.Scale.normalX(1 / nScale)) + ' ' + map.Scale.normalX(4 / nScale) + ',0 z', 'fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path', node.pointerObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (pWidth - map.Scale.normalX(5 / nScale)) + ',' + (ptOffset.y + map.Scale.normalX(1 / nScale)) + ' ' + map.Scale.normalX(3 / nScale) + ',0 z', 'fill:white');
		} else {
			newPath = map.Dom.newShape('path', node.pointShObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (pWidth - map.Scale.normalX(4 / nScale)) + ',' + (ptOffset.y + bBox.height) + ' ' + map.Scale.normalX(4 / nScale) + ',0 z', 'fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path', node.pointerObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (pWidth - map.Scale.normalX(4 / nScale)) + ',' + (ptOffset.y + bBox.height) + ' ' + map.Scale.normalX(3 / nScale) + ',0 z', 'fill:white');
		}
	} else {
		if (bBox.height / 5 > pSize) {
			if (ptOffset.y > -bBox.height / 3) {
				pHeight -= bBox.height / 3;
			}
			if (ptOffset.y < -bBox.height / 3 * 2) {
				pHeight += bBox.height / 3;
			}
		}
		if (pWidth > 0) {
			newPath = map.Dom.newShape('path', node.pointShObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (ptOffset.x - bBox.width) + ',' + (pHeight - map.Scale.normalX(4 / nScale)) + ' 0,' + map.Scale.normalX(4 / nScale) + ' z', 'fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path', node.pointerObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (ptOffset.x - bBox.width) + ',' + (pHeight - map.Scale.normalX(4 / nScale)) + ' 0,' + map.Scale.normalX(3 / nScale) + ' z', 'fill:white');
		} else {
			newPath = map.Dom.newShape('path', node.pointShObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (ptOffset.x + bBox.width) + ',' + (pHeight - map.Scale.normalX(4 / nScale)) + ' 0,' + map.Scale.normalX(4 / nScale) + ' z', 'fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path', node.pointerObj, 'M' + (-ptOffset.x) + ',' + (-ptOffset.y) + ' l ' + (ptOffset.x + bBox.width) + ',' + (pHeight - map.Scale.normalX(4 / nScale)) + ' 0,' + map.Scale.normalX(3 / nScale) + ' z', 'fill:white');
		}
	}
};

/**
 * change the position of the chart objects
 * @param evt the event
 * @param szId the id of the chart group 
  */
Map.Themes.prototype.animateChartPosition = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var nodesA = mapTheme.chartGroup.childNodes;

		// remove old declutter position changes
		// -------------------------------------
		for (i = 0; i < nodesA.length; i++) {
			var ptPos = nodesA[i].fu.getPosition();
			var ptPos2 = new point(nodesA[i].getAttributeNS(szMapNs, "xEnd"), nodesA[i].getAttributeNS(szMapNs, "yEnd"));
			var nDur = nodesA[i].getAttributeNS(szMapNs, "dur");
			
			dx = (ptPos2.x - ptPos.x)/nDur;
			dy = (ptPos2.y - ptPos.y)/nDur;

			nodesA[i].fu.setPosition(ptPos.x+dx,ptPos.y+dy);
			
			nodesA[i].setAttributeNS(szMapNs, "dur", --nDur );
		}
		
		if ( mapTheme.animateTimeout ){
			clearTimeout(mapTheme.animateTimeout);
		}
		mapTheme.animateTimeout = setTimeout(function(){map.Themes.animateChartPosition(null,mapTheme.szId);}, 100);
	}
};

/**
 * align charts which are visible to the highest y position
 * and make a pointer to the original position 
 * @type void
 */
MapTheme.prototype.declutterCharts = function () {

	if (this.szDeclutterUpper) {
		if (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nDeclutterUpper) {
			return;
		}
	}

	// GR 11.11.2016 new: avoid overlapping charts and align on same y position
	// ------------------------------------------------------------------------

	var nodesA = this.chartGroup.childNodes;

	// remove old declutter position changes
	// -------------------------------------
	for (i = 0; i < nodesA.length; i++) {
		if (nodesA[i].actualPosition) {
			nodesA[i].fu.setPosition(nodesA[i].origPosition.x, nodesA[i].origPosition.y);
			nodesA[i].origPosition = null;
			nodesA[i].actualPosition = null;
			if (nodesA[i].pointerObj) {
				map.Dom.clearGroup(nodesA[i].pointerObj);
				map.Dom.clearGroup(nodesA[i].pointShObj);
			}
			nodesA[i].pointerObj = null;
			nodesA[i].pointShObj = null;
		}
	}

	// start decluttering
	// ---------------------------
	if (!nodesA[0].actualPosition) {

		// get the box of one chart for the aligning offset
		var chartBox = nodesA[0].fu.getBox();

		// get actual visible map bounds 
		var zoomBox = map.Zoom.getBox();

		// collect all visible charts
		var chartDeclutterA = [];

		for (var i = 0; i < nodesA.length; i++) {

			var fDone = false;

			var pos = nodesA[i].fu.getPosition();
			var box = nodesA[i].fu.getBox();
			box.x += pos.x;
			box.y += pos.y;

			for (var g in chartDeclutterA) {
				for (var c in chartDeclutterA[g]) {
					if (box.y + box.height < chartDeclutterA[g][c].box.y - chartDeclutterA[g][c].box.height * 0.3 ||
						box.y > chartDeclutterA[g][c].box.y + chartDeclutterA[g][c].box.height * 1.3 ||
						box.x + box.width < chartDeclutterA[g][c].box.x - chartDeclutterA[g][c].box.width ||
						box.x > chartDeclutterA[g][c].box.x + chartDeclutterA[g][c].box.width * 2) {
						continue;
					} else {
						chartDeclutterA[g].push({
							node: nodesA[i],
							y: nodesA[i].fu.getPosition().x,
							box: box
						});
						fDone = true;
						break;
					}
				}
			}

			if (!fDone) {
				chartDeclutterA.push([{
					node: nodesA[i],
					y: nodesA[i].fu.getPosition().x,
					box: box
				}]);
			}

		}

		// loop over declutter groups
		for (var g = 0; g < chartDeclutterA.length; g++) {

			var chartXPosA = chartDeclutterA[g];
			chartXPosA.sort(this.sortUpChartObjectsCompare);

			// if we have more than one chart in the group
			// then we align the charts on the highest position 

			if (chartXPosA.length > 1 && chartXPosA.length < 5) {

				var posTop = chartXPosA[0].node.fu.getPosition();

				for (var i = 0; i < chartXPosA.length; i++) {
					var pos = chartXPosA[i].node.fu.getPosition();
					if (pos.y < posTop.y) {
						posTop.x = pos.x;
						posTop.y = pos.y;
					}
				}
				posTop.y -= map.Scale.normalX(50) * map.Scale.nZoomScale;

				var pos = chartXPosA[0].node.fu.getPosition();

				for (var i = 0; i < chartXPosA.length; i++) {

					chartXPosA[i].node.origPosition = chartXPosA[i].node.fu.getPosition();
					chartXPosA[i].node.fu.setPosition(pos.x + (chartBox.width * 1.2 * i), posTop.y);
					chartXPosA[i].node.actualPosition = new point(pos.x + (chartBox.width * 1.2 * i), posTop.y);

					var scale = chartXPosA[i].node.fu.getScale().x;
					chartXPosA[i].node.actualPosition.x = chartXPosA[i].node.origPosition.x - (chartXPosA[i].node.origPosition.x - chartXPosA[i].node.actualPosition.x) / scale;
					chartXPosA[i].node.actualPosition.y = chartXPosA[i].node.origPosition.y - (chartXPosA[i].node.origPosition.y - chartXPosA[i].node.actualPosition.y) / scale;
					map.Themes.makeChartOffsetPointer(chartXPosA[i].node, this.nScale);
				}
			}
		}
	}
};

/**
 * change the visibility of the chart text values
 * @param evt the event
 * @param szId the id of the chart group 
 * @param fFlag true or false 
 */
Map.Themes.prototype.toggleValueDisplay = function (evt, szId, fFlag) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var szNewStyle = "";
		var szStyle = mapTheme.szFlag;
		var szStyleA = szStyle.split('|');
		for (var i = 0; i < szStyleA.length; i++) {
			if (szStyleA[i] != "VALUES") {
				szNewStyle += (szNewStyle.length ? "|" : "") + szStyleA[i];
			}
		}
		if (fFlag) {
			szNewStyle += "|VALUES";
		}
		executeWithMessage("map.Themes.doChangeThemeStyle('" + mapTheme.szId + "','type:" + szNewStyle + "')", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * change the dynamic opacity feature
 * @param evt the event
 * @param szId the id of the chart group 
 * @param fFlag true or false 
 */
Map.Themes.prototype.toggleDopacity = function (evt, szId, fFlag) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var szNewStyle = "";
		var szStyle = mapTheme.szFlag;
		var szStyleA = szStyle.split('|');
		for (var i = 0; i < szStyleA.length; i++) {
			if (!szStyleA[i].match(/DOPACITY/)) {
				szNewStyle += (szNewStyle.length ? "|" : "") + szStyleA[i];
			}
		}
		if (fFlag) {
			szNewStyle += "|DOPACITYMAX";
		}
		executeWithMessage("map.Themes.doChangeThemeStyle('" + mapTheme.szId + "','type:" + szNewStyle + "')", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * change the dynamic opacity feature alpha ramp
 * @param evt the event
 * @param szId the id of the chart group 
 * @param fFlag true or false 
 */
Map.Themes.prototype.changeDopacityAlphaRamp = function (evt, szId, nFactor) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var szNewStyle = mapTheme.szFlag;
		mapTheme.nDopacityScale = mapTheme.nDopacityScale || 1;
		mapTheme.nDopacityScale *= nFactor;
		//mapTheme.nDopacityScale = Math.max(mapTheme.nDopacityScale,1);


		executeWithMessage("map.Themes.doChangeThemeStyle('" + mapTheme.szId + "','type:" + szNewStyle + "')", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};

/**
 * change the visibility of the chart objects
 * @param evt the event
 * @param szId the id of the chart group 
 * @param fFlag true or false 
 */
Map.Themes.prototype.toggleChartDisplay = function (evt, szId, fFlag) {

	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.fToggle = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");
	}
	evt.stopPropagation();
	evt.preventDefault();
};

/**
 * zoom to the extension of a theme
 * @param evt the event
 * @param szId the theme id 
 */
Map.Themes.prototype.zoomTo = function (evt, szId) {
	var mapTheme = this.getTheme(szId) || this.activeTheme;
	if (mapTheme) {
		mapTheme.zoomTo();
	}
};
/**
 * zoom to the shapes of a selected class (chloroplete only)
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.zoomToClass = function (evt, szId, szClass, szStep) {
	setTimeout(function(){map.Themes.doZoomToClass(szId,szClass,szStep);}, 100);
};
/**
 * mark the shapes of a selected class (chloroplete only)
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.markClass = function (evt, szId, szClass, szStep) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible && !mapTheme.showInfoMore) {

		// GR 22.05.2015 toggle 
		if (((typeof (mapTheme.markedClass) != "undefined") && (mapTheme.markedClass == szClass)) ||
			((typeof (mapTheme.markedClasses) != "undefined") && (mapTheme.markedClasses[szClass]))) {
			this.unmarkClass(evt, szId, szClass);
			return;
		}

		mapTheme.fMarkEnable = true;
		mapTheme.fUnmarkEnable = false;
		if (this.markTimeout) {
			clearTimeout(this.markTimeout);
		}
		if (this.unmarkTimeout) {
			clearTimeout(this.unmarkTimeout);
		}
		displayMessage("...", 1000, true);
		this.markTimeout = setTimeout(function(){map.Themes.doMarkClass(szId,szClass,szStep);}, 50);
	}
};
/**
 * unmark the shapes of a selected class
 * @param evt the event
 * @param szId the id of the chart group 
 */
Map.Themes.prototype.unmarkClass = function (evt, szId, szClass) {

	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible && !mapTheme.showInfoMore) {

		displayMessage("...", 1000, true);
		this.unmarkTimeout = setTimeout(function(){map.Themes.doUnmarkClass(szId,szClass);}, 50);
		mapTheme.fUnmarkEnable = true;
		mapTheme.fMarkEnable = false;
	}
};
/**
 * zoom to the shapes of a selected class (chloroplete only)
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.doZoomToClass = function (szId, szClass, szStep) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.zoomToClass(Number(szClass), Number(szStep));
	}
};
/**
 * mark the shapes of a selected class (chloroplete only)
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.doMarkClass = function (szId, szClass, szStep) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.markedClass = szClass;

		// GR 24.10.2017 mark multiple classes
		mapTheme.markedClasses = mapTheme.markedClasses || [];
		mapTheme.markedClasses[szClass] = true;
		mapTheme.markedClassesA = [];
		for (var i in mapTheme.markedClasses) {
			if (mapTheme.markedClasses[i] === true) {
				mapTheme.markedClassesA.push(i);
			}
		}

		mapTheme.markClass(Number(szClass), Number(szStep));
		// notify HTML user about the new theme
		try {
			HTMLWindow.ixmaps.htmlgui_onDrawTheme(mapTheme.szId);
		} catch (e) {}
	}
};
/**
 * unmark the shapes of a selected class
 * @param szId the id of the chart group 
 */
Map.Themes.prototype.doUnmarkClass = function (szId, szClass) {
	// GR 30.05.2021 not working, therefore if (0... , test in progresss 
	if (0 && this.subTheme) {
		this.subTheme.removeSubTheme();
		this.subTheme = null;
		return;
	}
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.markedClass = null;

		// GR 24.10.2017 mark multiple classes
		if (mapTheme.markedClasses) {
			mapTheme.markedClasses[szClass] = false;
			mapTheme.markedClassesA = [];
			for (var i in mapTheme.markedClasses) {
				if (mapTheme.markedClasses[i] === true) {
					mapTheme.markedClassesA.push(i);
				}
			}
			if (mapTheme.markedClassesA.length) {
				displayMessage("...", 1000, true);
				mapTheme.fMarkEnable = true;
				mapTheme.markClass(mapTheme.markedClassesA[0],1);
				mapTheme.fMarkEnable = false;
				try {
					HTMLWindow.ixmaps.htmlgui_onDrawTheme(mapTheme.szId);
				} catch (e) {}
				return;
			} else {
				delete mapTheme.markedClassesA;
				delete mapTheme.markedClasses;
			}
		}
		mapTheme.unmarkClass();
		// notify HTML user about the new theme
		try {
			HTMLWindow.ixmaps.htmlgui_onDrawTheme(mapTheme.szId);
		} catch (e) {}
	}
};
/**
 * hide the shapes of a selected class (chloroplete only)
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.hideClass = function (evt, szId, szClass, szStep) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible) {
		mapTheme.showClass(Number(szClass), Number(szStep), false);
	}
};
/**
 * show the shapes of a selected class (chloroplete only)
 * @param evt the event
 * @param szId the id of the chart group 
 * @param szClass the class number
 */
Map.Themes.prototype.showClass = function (evt, szId, szClass, szStep) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible) {
		mapTheme.showClass(Number(szClass), Number(szStep), true);
	}
};
/**
 * convert the actual value classes into discret ranges
 * @param evt the event
 * @param szId the id of the chart group 
 */
Map.Themes.prototype.classesToRanges = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible) {
		mapTheme.classesToRanges();
	}
};
/**
 * filter the items of a theme
 * @param evt the event
 * @param szId the id of the theme 
 * @param szFilter the filter string
 * @param mode the filer mode (tbd)
 */
Map.Themes.prototype.filterItems = function (evt, szId, szFilter, opt) {
	var mapTheme = szId ? this.getTheme(szId) : this.activeTheme;
	if (mapTheme && mapTheme.isVisible && !mapTheme.showInfoMore) {
		mapTheme.fMarkEnable = true;
		mapTheme.fUnmarkEnable = false;
		if (this.markTimeout) {
			clearTimeout(this.markTimeout);
		}
		if (this.unmarkTimeout) {
			clearTimeout(this.unmarkTimeout);
		}
		this.opt = opt;
		this.markTimeout = setTimeout(function(){map.Themes.doFilterItems(szId,szFilter);}, 500);
	}
};
/**
 * filter the items of a theme
 * @param szId the id of the theme 
 * @param szFilter the filter string
 * @param mode the filer mode (tbd)
 */
Map.Themes.prototype.doFilterItems = function (szId, szFilter) {
	executeWithMessage("map.Themes.doFilterItemsGo('" + szId + "','" + szFilter + "')", "applying filter ...");
};
/**
 * filter the items of a theme
 * @param szId the id of the theme 
 * @param szFilter the filter string
 * @param mode the filer mode (tbd)
 */
Map.Themes.prototype.doFilterItemsGo = function (szId, szFilter) {
	clearMessage();
	var mapTheme = this.getTheme(szId ? (szId) : null);
	if (mapTheme) {
		mapTheme.filterItems(szFilter, this.opt);
		this.activeTheme = mapTheme;
	}
};

/**
 * select the filtered items
 * @param evt the event
 * @param szId the id of the theme 
 */
Map.Themes.prototype.selectFilterItems = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.selectFilterItems();
	}
};

/**
 * highlight items of a theme
 * @param evt the event
 * @param szId the id of the theme 
 * @param szItems items array (string, separated by ",")
 */
Map.Themes.prototype.highlightItems = function (evt, szId, szItems, szSeparator) {
	var mapTheme = szId ? this.getTheme(szId) : this.activeTheme;
	if (mapTheme && mapTheme.isVisible) {
		if (this.highlightTimeout) {
			clearTimeout(this.highlightTimeout);
		}
		this.highlightTimeout = setTimeout(function(){map.Themes.doHighlightItems(szId,szItems,szSeparator);}, 500);
	}
};
/**
 * highlight items of a theme (executer)
 * @param szId the id of the theme 
 * @param szFilter the filter string
 * @param mode the filer mode (tbd)
 */
Map.Themes.prototype.doHighlightItems = function (szId, szItems, szSeparator) {
	var mapTheme = szId ? this.getTheme(szId) : this.activeTheme;
	if (mapTheme) {
		mapTheme.highlightItems(szItems, szSeparator);
	}
};
/**
 * clear item highlight of a theme
 * @param evt the event
 * @param szId the id of the theme 
 */
Map.Themes.prototype.clearHighlightItems = function (evt, szId) {
	var mapTheme = szId ? this.getTheme(szId) : this.activeTheme;
	if (mapTheme && mapTheme.isVisible) {
		if (this.highlightTimeout) {
			clearTimeout(this.highlightTimeout);
		}
		mapTheme.clearHighlightItems();
	}
};
/**
 * select time frame for shapes/charts with time stamps
 * @param evt the event
 * @param szId the id of the chart group 
 * @param nUMin the minimum time (utime ms)
 * @param nUMax the maximum time (utime ms)
 */
Map.Themes.prototype.setTimeFrame = function (evt, szId, nUMin, nUMax) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme && mapTheme.isVisible && !mapTheme.showInfoMore) {

		if (this.markTimeout) {
			clearTimeout(this.markTimeout);
		}
		if (this.unmarkTimeout) {
			clearTimeout(this.unmarkTimeout);
		}
		//displayMessage("...", 1000, true);
		this.markTimeout = setTimeout(function(){map.Themes.doSetTimeFrame(szId,nUMin,nUMax);}, 1);
	}
};
/**
 * select time frame for shapes/charts with time stamps
 * @param szId the id of the chart group 
 * @param nUMin the minimum time (utime ms)
 * @param nUMax the maximum time (utime ms)
 */
Map.Themes.prototype.doSetTimeFrame = function (szId, nUMin, nUMax) {
	
	// GR 25/08/2023 if no specific theme id given, then loop over all themes
	if (szId == null) {
		var mapThemesA = this.getThemes();
		for ( var i in mapThemesA ){
			mapThemesA[i].setTimeFrame(nUMin, nUMax);
		}
		return;
	}

	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.setTimeFrame(nUMin, nUMax);
		// notify HTML user about the new theme
		try {
			//HTMLWindow.ixmaps.htmlgui_onDrawTheme(mapTheme.szId);
		} catch (e) {}
	}
};

/**
 * change the style of the theme given by szId 
 * @param szId the id of the chart group 
 * @param szStyle the new style
 */
Map.Themes.prototype.changeThemeStyle = function (evt, szId, szStyle, szFlag) {
	
	// GR 30.07.2023 null -> all themes
	if ( szId == null){
		themesA = this.getThemes();
		for ( i in themesA ){
			if (!themesA[i].szFlag.match(/FEATURE/))
			this.changeThemeStyle(evt, themesA[i].szId, szStyle, szFlag);
		}
		return;
	}
	
	// GR 30.10.2017 style may contain "'" characters
	_TRACE("changeThemeStyle" + ": '" + szId + "' , '" + szStyle.replace(/'/g, "\\\'") + "' , '" + szFlag + "'");
	if (szFlag.match(/fast|silent|direct/)){
		map.Themes.doChangeThemeStyle(szId,szStyle.replace(/'/g, "\\\'"),szFlag);
	}else{
		executeWithMessage("map.Themes.doChangeThemeStyle('" + szId + "','" + szStyle.replace(/'/g, "\\\'") + "','" + szFlag + "')", "... processing ...");
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};

// .............................................................................
// local helper 
// .............................................................................

function __calcNewValue(value, number, szFlag) {
	value = Number(value) || 0;
	number = Number(number) || 0;
	if (szFlag && szFlag.match(/pow/)) {
		return Math.pow(value, number);
	} else
	if (szFlag && szFlag.match(/factor/)) {
		return value * number;
	} else
	if (szFlag && (szFlag.match(/add/) || szFlag.match(/delta/))) {
		return value + number;
	} else {
		return number;
	}
}

function __calcFactor(value, number, szFlag) {
	value = value || 0;
	number = number || 0;
	if (szFlag && szFlag.match(/factor/)) {
		return number;
	} else
	if (szFlag && szFlag.match(/add/)) {
		return (value + number) / value;
	} else {
		return number / value;
	}
}

// .............................................................................

/**
 * change the style of the theme given by szId (wrapper)
 * @param szId the id of the chart group 
 * @param szStyle the new style
 * The following styles can be changed/set:
 * <br><br>
 *  <table>
 *  <tr><td>type</td><td>change the theme/chart type</td><td>CHOROPLETH,QUANTILE,BUBBLE,etc. see create chart for complete list</td></tr>
 *  <tr><td>classes</td><td>change the number of classes for CHOROPLETH themes</td><td>1 - 50</td></tr>
 *  <tr><td>colorscheme</td><td>define a new colorscheme</td><td>e.g. 'colorscheme:#eeeeff,#0000dd'</td></tr>
 *  <tr><td>colorstyle</td><td>define color scheme derivations for 'spectrum' colorscheme</td><td>e.g. 'colorstyle:pastel'</td></tr>
 *  <tr><td>filter</td><td>filter for 'DOMINANT' themes; defines the condition together with dfilter</td><td>min / max / mean / median</td></tr>
 *  <tr><td>dfilter</td><td>defines the percentage to add to the filter</td><td>e.g. 'filter:mean;dfilter:30' means: mean + 30% is the significant value fo dominance</td></tr>
 *  <tr><td>overviewchart</td><td>define the type of overviewchart for choroplethte themes</td><td>none / PIE / DONUT</td></tr>
 *  <tr><td>evidence</td><td>how to evidence class member, if the mouse is over a class in the legend</td><td>isolate / highlight</td></tr>
 *  </table>
 * <br>
 * <strong>Samples:</strong>
 * <br> map.Api.changeThemeStyle("type:CHOROPLETH|EQUIDISTANT;classes:10;colorscheme:spectrum,pastel;overviewchart:PIE|3D"); 
 * <br> map.Api.changeThemeStyle("type:CHART|BUBBLE|SURFACE|VALUES"); 
 * <br> map.Api.changeThemeStyle("type:CHART|PIE|DONUT|3D|VOLUME");
 * <br><br>
 * <strong>Hints:</strong>
 * <br>
 * CHOROPLETH type can be changed only to BUBBLE type.<br>
 * CHART type can be changed into DOMINANT type.<br>
 */
Map.Themes.prototype.doChangeThemeStyle = function (szId, szStyle, szFlag) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var styleObj = __getStyleObj(szStyle);
		if (styleObj) {
			if (styleObj.type) {

				styleObj.origType = styleObj.type;

				// flag 'add,'remove','toggle'
				// ---------------------------
				if (szFlag && szFlag.match(/add/)) {
					var styleA = styleObj.type.split("|");
					this.szTempStyle = mapTheme.szFlag;
					for (var i = 0; i < styleA.length; i++) {
						if (!eval("this.szTempStyle.match(/" + styleA[i] + "/)")) {
							this.szTempStyle += "|" + styleA[i];
						}
					}
					styleObj.type = this.szTempStyle;
				} else
				if (szFlag && szFlag.match(/remove/)) {
					var styleA = mapTheme.szFlag.split("|");
					var szTempStyle = "";
					for (var i = 0; i < styleA.length; i++) {
						if (styleA[i] != styleObj.type) {
							szTempStyle += ((szTempStyle.length ? "|" : "") + styleA[i]);
						}
					}
					styleObj.type = szTempStyle;
				} else
				if (szFlag && szFlag.match(/toggle/)) {
					var styleA = mapTheme.szFlag.split("|");
					var szTempStyle = "";
					var found = false;
					for (var i = 0; i < styleA.length; i++) {
						if (styleA[i] != styleObj.type) {
							szTempStyle += ((szTempStyle.length ? "|" : "") + styleA[i]);
						} else {
							found = true;
						}
					}
					styleObj.type = szTempStyle + (found ? "" : ("|" + styleObj.type));
				}
				// ---------------------------
				else {
					if (mapTheme.szFlag.match(/FRACTION/)) {
						styleObj.type += "|FRACTION";
					}
					if (mapTheme.szFlag.match(/PERMILLE/)) {
						styleObj.type += "|PERMILLE";
					}
					if (mapTheme.szFlag.match(/CALCVAL/)) {
						styleObj.type += "|CALCVAL";
					}
					if (mapTheme.szFlag.match(/CALC100/)) {
						styleObj.type += "|CALC100";
					}
					if (mapTheme.szFlag.match(/PRODUCT/)) {
						styleObj.type += "|PRODUCT";
					}
					if (mapTheme.szFlag.match(/RELATIVE/)) {
						styleObj.type += "|RELATIVE";
					}
					if (mapTheme.szFlag.match(/INVERT/)) {
						styleObj.type += "|INVERT";
					}
					if (mapTheme.szFlag.match(/INVERTSIZE/)) {
						styleObj.type += "|INVERTSIZE";
					}
					if (mapTheme.szFlag.match(/DENSITY/)) {
						styleObj.type += "|DENSITY";
					}
					//if ( mapTheme.szFlag.match(/DOPACITY/) ){
					//	styleObj.type += "|DOPACITY";
					//}
					if (mapTheme.szFlag.match(/SUM/)) {
						styleObj.type += "|SUM";
					}
					if (mapTheme.szFlag.match(/CALCMEAN/)) {
						styleObj.type += "|CALCMEAN";
					}
					if (mapTheme.szFlag.match(/AUTO100/)) {
						styleObj.type += "|AUTO100";
					}
				}
				// only LOCKED changed, than ready
				if (styleObj.type.match(/LOCKED/)) {
					mapTheme.fRedrawInfo = true;
					map.Themes.execute();
					//return;
				}
				if ((styleObj.type.match(/CHART/) && !mapTheme.szFlag.match(/CHART/)) ||
					(styleObj.type.match(/CHOROPLETH/) && !mapTheme.szFlag.match(/CHOROPLETH/))) {
					mapTheme.unpaintMap();
					this.activateNextPaint(mapTheme);
				}
				if (!styleObj.type.match(/CATEGORICAL/) &&
					(	styleObj.type.match(/EQUIDISTANT/) ||
						styleObj.type.match(/POW2/) ||
						styleObj.type.match(/POW3/) ||
						styleObj.type.match(/LOG/) ||
						styleObj.type.match(/QUANTILE/) 
					)) {
					mapTheme.szOldRanges = mapTheme.szRanges ? mapTheme.szRanges : mapTheme.szOldRanges;
					mapTheme.szRanges = null;
					mapTheme.szOldLabelA = mapTheme.szLabelA ? mapTheme.szLabelA : mapTheme.szOldLabelA;
					mapTheme.szLabelA = null;
					mapTheme.fRealize = true;
				}
				if (styleObj.type.match(/RANGES/) && styleObj.ranges) {
					mapTheme.szRanges = mapTheme.szOldRanges ? mapTheme.szOldRanges : mapTheme.szRanges;
					mapTheme.szRangesA = styleObj.ranges.split(styleObj.ranges.match(/\|/) ? '|' : ',');
					mapTheme.szLabelA = mapTheme.szOldLabelA ? mapTheme.szOldLabelA : mapTheme.szLabelA;
					if (Number(mapTheme.origColorScheme[0]) && mapTheme.szRanges) {
						mapTheme.origColorScheme[0] = mapTheme.szRangesA.length - 1;
					}
					mapTheme.fRealize = true;
				}
				if (styleObj.type.match(/RANGES/) && !styleObj.ranges) {
					mapTheme.szRangesA = [mapTheme.partsA[0].min];
					for (var a in mapTheme.partsA) {
						mapTheme.szRangesA.push(mapTheme.partsA[a].max);
					}
				}

				var oldFlag = mapTheme.szFlag;
				mapTheme.szFlag = styleObj.type;

				// GR 20.09.2011 charts preset with shadow
				if (mapTheme.szFlag.match(/CHART/) && !mapTheme.szFlag.match(/BUFFER/) && !oldFlag.match(/CHART/)) {
					mapTheme.fShadow = mapTheme.fOrigShadow = true;
				}


				if (styleObj.origType.match(/AGGREGATE/) || styleObj.origType.match(/GROUP/) || styleObj.origType.match(/\bRECT\b/) || styleObj.origType.match(/RELOCATE/)) {
					mapTheme.fRealize = true;
					mapTheme.fRedraw = false;
					mapTheme.unpaintMap();
					mapTheme.themeNodesPosA = [];
				} else {
					mapTheme.fRedraw = true;
					mapTheme.fRedrawInfo = true;
				}

				if (styleObj.type.match(/VALUES/) != oldFlag.match(/VALUES/)) {
					mapTheme.fRedraw = true;
				}
				
				if (styleObj.type.match(/DTEXT/) != oldFlag.match(/DTEXT/)) {
					mapTheme.unlabelMap();
				}

				if (styleObj.type.match(/AUTO100/) != oldFlag.match(/AUTO100/)) {
					mapTheme.fRealize = true;
					mapTheme.fRedraw = false;
					mapTheme.unpaintMap();
				}
				
				if (styleObj.type.match(/DIFFERENCE/) != oldFlag.match(/DIFFERENCE/)) {
					mapTheme.fRealize = true;
					mapTheme.fRedraw = false;
					mapTheme.unpaintMap();
				}

				if (styleObj.type.match(/NOOUTLIER/) != oldFlag.match(/NOOUTLIER/)) {
					mapTheme.fRealize = true;
					mapTheme.fRedraw = false;
					mapTheme.unpaintMap();
				}

				if (styleObj.type.match(/OUTLIER/) != oldFlag.match(/OUTLIER/)) {
					mapTheme.fRealize = true;
					mapTheme.fRedraw = false;
					mapTheme.unpaintMap();
				}

				if (styleObj.type.match(/NEGATIVEISNOTVALUE/) != oldFlag.match(/NEGATIVEISNOTVALUE/)) {
					mapTheme.fNegativeValuePossible = !styleObj.type.match(/NEGATIVEISNOTVALUE/);
					mapTheme.fRealize = true;
					mapTheme.fRedraw = true;
					mapTheme.unpaintMap();
				}

			} else

				// if 'remove' flag set
				// remove the style(s) from the theme definition
				//	
				if (szFlag && szFlag.match(/remove/)) {
					for (var p in styleObj) {
						for (var s in themeStyleTranslateA) {
							if (themeStyleTranslateA[s].style == p) {
								mapTheme[themeStyleTranslateA[s].obj] = null;
							}
						}
					}
					//map.Themes.unmarkClass(null,szId);
					mapTheme.fReload = true;
					mapTheme.fRealize = true;
					mapTheme.unpaintMap();

					// redraw the theme and exit 

					executeWithMessage("map.Themes.execute()", "... processing ...");
					return;
				}

			// if not remove, go through the styles
			// and change in theme definition
			//
			if (__isdef(styleObj.classes)) {
				if (isNaN(Number(mapTheme.origColorScheme[0]))) {
					mapTheme.origColorScheme[3] = mapTheme.origColorScheme[mapTheme.origColorScheme.length / 2];
					mapTheme.origColorScheme[4] = '2colors';
					var xxx = mapTheme.origColorScheme[mapTheme.origColorScheme.length - 1];
					mapTheme.origColorScheme[1] = mapTheme.origColorScheme[0];
					mapTheme.origColorScheme[2] = xxx;
				}
				mapTheme.origColorScheme[0] = Number(styleObj.classes);

				if (mapTheme.szFlag.match(/CHART/)) {
					mapTheme.unpaintMap();
				}
				mapTheme.szOldRanges = mapTheme.szRanges;
				mapTheme.szRanges = null;
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.ranges)) {
				mapTheme.szRanges = styleObj.ranges;
				mapTheme.szRangesA = styleObj.ranges.split(styleObj.ranges.match(/\|/) ? '|' : ',');
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.colorstyle)) {
				if (mapTheme.origColorScheme[1] == 'spectrum') {
					mapTheme.origColorScheme[2] = styleObj.colorstyle;
					if (mapTheme.szFlag.match(/CHART/)) {
						mapTheme.unpaintMap();
					}
					mapTheme.fRealize = true;
				}
			}
			if (__isdef(styleObj.colordef)) {
				mapTheme.origColorScheme = styleObj.colordef.match(/\|/) ? styleObj.colordef.split('|') : styleObj.colordef.split(',');
				mapTheme.colorScheme = mapTheme.origColorScheme;
				mapTheme.fRedraw = true;
				if (!mapTheme.szFlag.match(/CHART/)) {
					mapTheme.fRealize = true;
				}
				mapTheme.fRedrawInfo = true;
				mapTheme.showInfo();
			}
			if (__isdef(styleObj.colorscheme)) {
				var argA = styleObj.colorscheme.match(/\|/) ? styleObj.colorscheme.split('|') : styleObj.colorscheme.split(',');
				if (argA && argA.length) {
					if (isNaN(Number(mapTheme.origColorScheme[0]))) {
						mapTheme.origColorScheme[0] = mapTheme.origColorScheme.length;
					}
					mapTheme.origColorScheme.length = 1;
					for (var i = 0; i < 5; i++) {
						if (i < argA.length) {
							mapTheme.origColorScheme[i + 1] = argA[i];
						} else {
							mapTheme.origColorScheme[i + 1] = null;
						}
					}
					try {
						mapTheme.colorScheme = ColorScheme.createColorScheme(mapTheme.origColorScheme[1], mapTheme.origColorScheme[2], mapTheme.origColorScheme[0], mapTheme.origColorScheme[3], mapTheme.origColorScheme[4]);
					} catch (e) {
						mapTheme.colorScheme = mapTheme.defaultColorScheme;
					}

					mapTheme.fRedraw = true;
					if (!mapTheme.szFlag.match(/CHART/)) {
						mapTheme.unpaintMap();
					}else{
						mapTheme.unpaintMap();
					}

					mapTheme.fRedrawInfo = true;
					mapTheme.showInfo();
				}
			}
			if (__isdef(styleObj.colorschemegeneration)) {
				if (!isNaN(Number(mapTheme.origColorScheme[0]))) {
					switch (styleObj.colorschemegeneration) {
						case 'warm':
							mapTheme.origColorScheme[4] = '#FFFDD8';
							break;
						case 'cold':
							mapTheme.origColorScheme[4] = '#FFFFFF';
							break;
						default:
							mapTheme.origColorScheme[4] = styleObj.colorschemegeneration;
							break;
					}
					if (mapTheme.szFlag.match(/CHART/)) {
						mapTheme.unpaintMap();
					}
					try {
						mapTheme.colorScheme = ColorScheme.createColorScheme(mapTheme.origColorScheme[1], mapTheme.origColorScheme[2], mapTheme.origColorScheme[0], mapTheme.origColorScheme[3], mapTheme.origColorScheme[4]);
					} catch (e) {
						mapTheme.colorScheme = mapTheme.defaultColorScheme;
					}
					mapTheme.fRedraw = true;
					mapTheme.fRedrawInfo = true;
				}
			}
			if (__isdef(styleObj.symbols)) {
				mapTheme.szSymbolsA = styleObj.symbols.split(styleObj.symbols.match(/\|/) ? '|' : ',');
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.values)) {
				var szValuesA = this.toArray(styleObj.values);
				if ( szValuesA.length) {
					// push all values into the value/index array
					for (var i = 0; i < szValuesA.length; i++) {
						mapTheme.getStringValueIndex(szValuesA[i], "set");
					}
				}
				// set values and label from the index array !! 
				mapTheme.szValuesA = [];
				mapTheme.szLabelA = [];
				for ( i in mapTheme.nStringToValueA){
					mapTheme.szValuesA.push(i);
					mapTheme.szLabelA.push(i);
				}
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.dominantdfilter)) {
				mapTheme.nDominantDFilter = Number(styleObj.dominantdfilter);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.dominantfilter)) {
				mapTheme.szDominantFilter = String(styleObj.dominantfilter);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.filter)) {
				if (szFlag && szFlag.match(/remove/)) {
					mapTheme.szFilter = "";
				} else {
					mapTheme.szFilter = String(styleObj.filter);
				}
				mapTheme.fRealize = true;
				mapTheme.unpaintMap();
			}
			if (__isdef(styleObj.filterfield)) {
				mapTheme.szFilterField = String(styleObj.filterfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.markclasses)) {
				mapTheme.markedClassesA = this.toArray(styleObj.markclasses);
				mapTheme.markedClasses = [];
				mapTheme.unmarkClass();
				mapTheme.markedClassesA.forEach(function (item, index) {
					if (item >= 0) {
						mapTheme.markedClasses[item] = true;
					}
				});
				mapTheme.markClass();
			}
			if (__isdef(styleObj.field100min)) {
				mapTheme.nField100Min = styleObj.field100min;
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.overviewchart)) {
				if (!mapTheme.szFlag.match(/CHART/)) {
					mapTheme.szOverviewChart = styleObj.overviewchart;
					mapTheme.fRedrawInfo = true;
				}
			}
			if (__isdef(styleObj.evidence)) {
				mapTheme.evidenceMode = styleObj.evidence;
			}
			if (__isdef(styleObj.aggregation)) {
				mapTheme.szAggregation = styleObj.aggregation;
			}
			if (__isdef(styleObj.opacity)) {
				mapTheme.fOpacity = __calcNewValue(mapTheme.fOpacity, Number(styleObj.opacity), szFlag);
				mapTheme.autoOpacity = false;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.fillopacity)) {
				mapTheme.fillOpacity = __calcNewValue(mapTheme.fillOpacity || ((Number(styleObj.fillopacity) < 1) ? 1 : 0), Number(styleObj.fillopacity), szFlag);
				mapTheme.autoOpacity = false;
				mapTheme.fillOpacity = Math.min(Math.max(mapTheme.fillOpacity, 0.001), 1);
				mapTheme.unpaintMap();
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.shadow)) {
				if (styleObj.shadow == "toggle") {
					mapTheme.fShadow = mapTheme.fOrigShadow = !mapTheme.fOrigShadow;
				} else {
					mapTheme.fShadow = mapTheme.fOrigShadow = styleObj.shadow;
				}
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.showdata)) {
				if (styleObj.showdata == "toggle") {
					mapTheme.fShowData = !mapTheme.fShowData;
				} else {
					mapTheme.fShowData = JSON.parse(styleObj.showdata);
				}
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.blur)) {
				if (styleObj.blur == "toggle") {
					if (mapTheme.nBlur) {
						mapTheme.nOldBlur = mapTheme.nBlur;
						mapTheme.nBlur = 0;
					} else {
						mapTheme.nBlur = (mapTheme.nOldBlur || 1);
					}
				} else {
					mapTheme.nBlur = __calcNewValue(mapTheme.nBlur, Number(styleObj.blur), szFlag);
				}
				mapTheme.fBlur = true;
			}
			if (__isdef(styleObj.scale)) {
				mapTheme.fResize = __calcFactor(mapTheme.nScale, Number(styleObj.scale), szFlag);
			}
			if (__isdef(styleObj.dopacityscale)) {
				mapTheme.nDopacityScale = __calcNewValue(mapTheme.nDopacityScale, Number(styleObj.dopacityscale), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.d_dopacityscale)) {
				mapTheme.nDopacityScale = mapTheme.nDopacityScale * Number(styleObj.d_dopacityscale);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.alphafield)) {
				mapTheme.szAlphaField = String(styleObj.alphafield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.alphafield100)) {
				mapTheme.szAlphaField100 = String(styleObj.alphafield100);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.dopacityramp)) {
				mapTheme.szDopacityRamp = styleObj.dopacityramp;
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.dopacitypow)) {
				mapTheme.nDopacityPow = __calcNewValue(mapTheme.nDopacityPow, Number(styleObj.dopacitypow), szFlag);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.brightness)) {
				mapTheme.nBrightness = __calcNewValue(mapTheme.nBrightness || 1, Number(styleObj.brightness), szFlag);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.rangescale)) {
				mapTheme.nRangeScale = __calcNewValue(mapTheme.nRangeScale || 1, Number(styleObj.rangescale), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.sizefield)) {
				mapTheme.szSizeField = String(styleObj.sizefield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.timefield)) {
				mapTheme.szTimeField = String(styleObj.timefield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.xfield)) {
				mapTheme.szXField = String(styleObj.xfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.yfield)) {
				mapTheme.szYField = String(styleObj.yfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.labelfield)) {
				mapTheme.szLabelField = String(styleObj.labelfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.colorfield)) {
				mapTheme.szColorField = String(styleObj.colorfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.symbolfield)) {
				mapTheme.szSymbolField = String(styleObj.symbolfield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.valuefield)) {
				mapTheme.szValueField = String(styleObj.valuefield);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.normalsizevalue)) {
				if (!mapTheme.nNormalSizeValue) {
					mapTheme.nNormalSizeValue = mapTheme.szSizeField ? mapTheme.nMaxSize : mapTheme.nMax;
				}
				mapTheme.nNormalSizeValue = __calcNewValue(mapTheme.nNormalSizeValue, Number(styleObj.normalsizevalue), szFlag);
				mapTheme.fRedraw = true;
				//				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.minvalue)) {
				mapTheme.nMinValue = __calcNewValue(mapTheme.nMinValue || 1, Number(styleObj.minvalue), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.valuedecimals)) {
				mapTheme.nValueDecimals = styleObj.valuedecimals;
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.valuescale)) {
				mapTheme.nValueScale = __calcNewValue(mapTheme.nValueScale, Number(styleObj.valuescale), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.linewidth)) {
				mapTheme.nLineWidth = __calcNewValue(mapTheme.nLineWidth, Number(styleObj.linewidth), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.markersize)) {
				mapTheme.nMarkerSize = __calcNewValue(mapTheme.nMarkerSize, Number(styleObj.markersize), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.gapsize)) {
				mapTheme.nGapSize = __calcNewValue(mapTheme.nGapSize, Number(styleObj.gapsize), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.offsetx)) {
				mapTheme.nOffsetX = __calcNewValue(mapTheme.nOffsetX, Number(styleObj.offsetx), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.offsety)) {
				mapTheme.nOffsetY = __calcNewValue(mapTheme.nOffsetY, Number(styleObj.offsety), szFlag);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.linecolor)) {
				mapTheme.szLineColor = String(styleObj.linecolor);
				mapTheme.fRedraw = true;
			}
			// GR 21.03.2009 define scaledependency for value label 
			if (__isdef(styleObj.valueupper)) {
				mapTheme.szValueUpper = styleObj.valueupper;
				mapTheme.nValueUpper = __scanScaleValue(mapTheme.szValueUpper);
				mapTheme.fRedraw = true;
			}
			// GR 12.01.2023 define scaledependency for value label 
			if (__isdef(styleObj.valuelower)) {
				mapTheme.szValueLower = styleObj.valuelower;
				mapTheme.nValueLower = __scanScaleValue(mapTheme.szValueLower);
				mapTheme.fRedraw = true;
			}
			// GR 02.03.2017 define scaledependency for box title 
			if (__isdef(styleObj.titleupper)) {
				mapTheme.szTitleUpper = styleObj.titleupper;
				mapTheme.nTitleUpper = __scanScaleValue(mapTheme.szTitleUpper);
				mapTheme.fRedraw = true;
			}
			// GR 02.03.2017 define scaledependency for box
			if (__isdef(styleObj.boxupper)) {
				mapTheme.szBoxUpper = styleObj.boxupper;
				mapTheme.nBoxUpper = __scanScaleValue(mapTheme.szBoxUpper);
				mapTheme.fRedraw = true;
			}
			// GR 01.24.2018 define scaledependency for shadow
			if (__isdef(styleObj.shadowupper)) {
				mapTheme.szShadowUpper = styleObj.shadowupper;
				mapTheme.nShadowUpper = __scanScaleValue(mapTheme.szShadowUpper);
				mapTheme.fRedraw = true;
			}
			// GR 01.24.2018 define scaledependency for shadow
			if (__isdef(styleObj.shadowlower)) {
				mapTheme.szShadowLower = styleObj.shadowlower;
				mapTheme.nShadowLower = __scanScaleValue(mapTheme.szShadowLower);
				mapTheme.fRedraw = true;
			}
			// GR 29.05.2018 define scaledependency for declutter
			if (__isdef(styleObj.declutterupper)) {
				mapTheme.szDeclutterUpper = styleObj.declutterupper;
				mapTheme.nDeclutterUpper = __scanScaleValue(mapTheme.szdeclutterUpper);
				mapTheme.fRedraw = true;
			}
			// GR 21.09.2018 define scaledependency for aggregation
			if (__isdef(styleObj.aggregationupper)) {
				mapTheme.szAggregationUpper = styleObj.aggregationupper;
				mapTheme.nAggregationUpper = __scanScaleValue(mapTheme.szAggregationUpper);
				mapTheme.fRedraw = true;
			}
			// GR 21.09.2018 define scaledependency for aggregation
			if (__isdef(styleObj.aggregationlower)) {
				mapTheme.szAggregationLower = styleObj.aggregationlower;
				mapTheme.nAggregationLower = __scanScaleValue(mapTheme.szAggregationLower);
				mapTheme.fRedraw = true;
			}
			// GR 18.12.2020 define scaledependency for clip to goe bounds 
			if (__isdef(styleObj.clipupper)) {
				mapTheme.szClipUpper = styleObj.clipupper;
				mapTheme.nClipUpper = __scanScaleValue(mapTheme.szClipUpper);
				mapTheme.fRedraw = true;
			}
			// GR 18.12.2020 define scaledependency for clip to goe bounds 
			if (__isdef(styleObj.cliplower)) {
				mapTheme.szClipLower = styleObj.cliplower;
				mapTheme.nClipLower = __scanScaleValue(mapTheme.szClipLower);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.minvaluesize)) {
				mapTheme.nValueSizeMin = __calcNewValue(mapTheme.nValueSizeMin, Number(styleObj.minvaluesize), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			// remains for compatibility
			if (__isdef(styleObj.clipvaluesize)) {
				mapTheme.nValueSizeMin = __calcNewValue(mapTheme.nValueSizeMin, Number(styleObj.clipvaluesize), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.minsize)) {
				mapTheme.nChartSizeMin = __calcNewValue(mapTheme.nChartSizeMin, Number(styleObj.minsize), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.minchartsize)) {
				mapTheme.nChartSizeMin = __calcNewValue(mapTheme.nChartSizeMin, Number(styleObj.minchartsize), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.maxcharts)) {
				mapTheme.nMaxCharts = __calcNewValue(mapTheme.nMaxCharts, Number(styleObj.maxcharts), szFlag);
				mapTheme.nMaxCharts = Math.max(1, Math.round(mapTheme.nMaxCharts));
				//				mapTheme.fRealize = true;
				mapTheme.unpaintMap();
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.sizepow)) {
				mapTheme.nSizePow = __calcNewValue(mapTheme.nSizePow, Number(styleObj.sizepow), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			// remains for compatibility
			if (__isdef(styleObj.clipsize)) {
				mapTheme.nChartSizeMin = __calcNewValue(mapTheme.nChartSizeMin, Number(styleObj.clipsize), szFlag);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.clipparts)) {
				mapTheme.nClipParts = Number(styleObj.clipparts);
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.showparts)) {
				mapTheme.szShowParts = styleObj.showparts;
				mapTheme.szShowPartsA = styleObj.showparts.split(styleObj.showparts.match(/\|/) ? '|' : ',');
				map.Themes.unmarkClass(null, szId);
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.clipframerate)) {
				mapTheme.nClipFrameRate = __calcNewValue(mapTheme.nClipFrameRate || 1, Number(styleObj.clipframerate), szFlag);
				mapTheme.nClipTimeout = 1 / mapTheme.nClipFrameRate * 1000;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.refresh)) {
				mapTheme.nRefreshTimeout = Number(styleObj.refresh) * 1000;
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.refreshtimeout)) {
				mapTheme.nRefreshTimeout = Number(styleObj.refreshtimeout);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.gridx)) {
				mapTheme.nGridX = Number(styleObj.gridx) || 7;
				//				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
			}
			if (__isdef(styleObj.gridwidth)) {
				mapTheme.szAggregationField = null;
				if (styleObj.gridwidth == "auto") {
					mapTheme.nGridWidthPx = mapTheme.nGridWidthPx || 50;
				} else
				if (String(styleObj.gridwidth).match(/px/)) {
					mapTheme.nGridWidthPx = __calcNewValue(mapTheme.nGridWidthPx || 1, Number(styleObj.gridwidth), szFlag);
				} else
				if (szFlag == "factor") {
					if (__isdef(mapTheme.nGridWidthPx)) {
						mapTheme.nGridWidthPx = __calcNewValue(mapTheme.nGridWidthPx || 1, Number(styleObj.gridwidth), szFlag);
					} else {
						mapTheme.nGridWidth = __calcNewValue(mapTheme.nGridWidth || 1000, Number(styleObj.gridwidth), szFlag);
					}
				} else {
					mapTheme.nGridWidthPx = null;
					mapTheme.nGridWidth = __calcNewValue(mapTheme.nGridWidth || 1, Number(styleObj.gridwidth), szFlag);
				}
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.themeNodesPosA = [];
				mapTheme.unpaintMap();
			}
			if (__isdef(styleObj.gridmatrix)) {
				mapTheme.szAggregationField = null;
				mapTheme.nGridMatrix = __calcNewValue(mapTheme.nGridMatrix || 1, Number(styleObj.gridmatrix), szFlag);
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.unpaintMap();
				mapTheme.themeNodesPosA = [];
			}
			if (__isdef(styleObj.gridwidthpx)) {
				mapTheme.szAggregationField = null;
				mapTheme.nGridWidthPx = __calcNewValue(mapTheme.nGridWidthPx || 50, Number(styleObj.gridwidthpx), szFlag);
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.unpaintMap();
				mapTheme.themeNodesPosA = [];
			}
			if (__isdef(styleObj.gridoffsetx)) {
				mapTheme.nGridOffsetX = __calcNewValue(mapTheme.nGridOffsetX || 0, Number(styleObj.gridoffsetx), szFlag);
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.unpaintMap();
				mapTheme.themeNodesPosA = [];
			}
			if (__isdef(styleObj.gridoffsety)) {
				mapTheme.nGridOffsetY = __calcNewValue(mapTheme.nGridOffsetY || 0, Number(styleObj.gridoffsety), szFlag);
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.unpaintMap();
				mapTheme.themeNodesPosA = [];
			}
			if (__isdef(styleObj.aggregationfield)) {
				mapTheme.szAggregationField = styleObj.aggregationfield;
				mapTheme.fRealize = true;
				mapTheme.fRedraw = true;
				mapTheme.fSuppressAggregationScale = true;
				mapTheme.unpaintMap();
				mapTheme.themeNodesPosA = [];
			}
			if (__isdef(styleObj.snippet)) {
				mapTheme.szSnippet = unescape(styleObj.snippet);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.title)) {
				mapTheme.szTitle = unescape(styleObj.title);
				mapTheme.fRealize = true;
			}
			if (__isdef(styleObj.child)) {
				mapTheme.fChild = true;
			}
		}
		mapTheme.fRedrawInfo = true;
		map.Themes.execute();
		//map.Themes.actualizeActiveTheme();
		//executeWithMessage("map.Themes.execute()","... processing ...");
	}
};
/**
 * build a list of all themed layer
 * @return a list of layer
 */
Map.Themes.prototype.getThemeLayerList = function () {

	var szThemeA = [];
	var a;
	for (var i = 0; i < this.themesA.length; i++) {
		if (this.themesA[i].objThemesA &&
			!this.themesA[i].fRemove) {
			for (a in this.themesA[i].objThemesA) {
				szThemeA[szThemeA.length] = a;
			}
		}
	}
	return szThemeA;
};
/**
 * check if layer is part of a themed layer
 * @param szLayer the layer to check
 * @return true or false
 */
Map.Themes.prototype.isThemeLayerUsed = function (szLayer) {
	var szThemeLayerA = this.getThemeLayerList();
	for (var l = 0; l < szThemeLayerA.length; l++) {
		if (szLayer == szThemeLayerA[l]) {
			return true;
		}
	}
	return false;
};
/**
 * check if node is part of a themed layer
 * @param objNode the SVG node to check
 * @return true or false
 */
Map.Themes.prototype.isNodePartOfAnyTheme = function (objNode) {

	var layerItem = map.Layer.getLayerObjOfNode(objNode);
	if (layerItem) {
		var szThemeLayerA = map.Themes.getThemeLayerList();
		for (var l = 0; l < szThemeLayerA.length; l++) {
			if (layerItem.szName == szThemeLayerA[l]) {
				return true;
			}
		}
	}
	return false;
};
/**
 * discard cache of theme nodes (see .getItemNodes() )
 * @return ---
 */
Map.Themes.prototype.resetThemeNodesCache = function () {
	this.themeNodesA = [];
	this.themeNodes = 0;
};
/**
 * build cache of theme nodes (see .getItemNodes() )
 * @return ---
 */
Map.Themes.prototype.addToThemeNodesCache = function (sourceGroup) {

	// build node cache --------------------------------------
	var count = 0;
	var nodeA = sourceGroup.getElementsByTagName('g');
	for (var n = 0; n < nodeA.length; n++) {

		var szId = String(map.Tiles.getMasterId(nodeA.item(n).getAttributeNS(null, "id")));
		if (szId) {
			if (!map.Themes.themeNodesA[szId]) {
				map.Themes.themeNodesA[szId] = [];
			}
			map.Themes.themeNodesA[szId].push(nodeA.item(n));
			map.Themes.themeNodes++;
			count++;
		}
	}
	_TRACE("Tiling: -------------------------------------------------------------- " + count + " added to NodesCache");
};
/**
 * discard theme nodes from cache 
 * @return ---
 */
Map.Themes.prototype.removeFromThemeNodesCache = function (sourceGroup) {

	// remove from node cache --------------------------------------
	var count = 0;
	var nodeA = sourceGroup.getElementsByTagName('g');
	for (var n = 0; n < nodeA.length; n++) {

		var szId = String(map.Tiles.getMasterId(nodeA.item(n).getAttributeNS(null, "id")));
		if (szId && map.Themes.themeNodesA[szId]) {
			var index = map.Themes.themeNodesA[szId].indexOf(nodeA.item(n));
			if (index > -1) {
				map.Themes.themeNodesA[szId].splice(index, 1);
				count++;
			}
		}
	}
	_TRACE("Tiling: -------------------------------------------------------------- " + count + " removed from NodesCache");
};
/**
 * set this theme as active
 * @param themeObj the theme to set active
 */
Map.Themes.prototype.setActive = function (themeObj) {
	this.activeTheme = themeObj;
};
/**
 * minimize info display 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.minimizeInfo = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var infoNode = mapTheme.widgetNode.firstChild;
		if (infoNode) {
			var nTitleHeight = Number(infoNode.getAttributeNS(szMapNs, "titleheight"));
			if (nTitleHeight <= 0) {
				nTitleHeight = 420;
			}
			var partNodesA = infoNode.childNodes;
			for (var i = 0; i < partNodesA.length; i++) {
				var partNode = partNodesA.item(i);
				var szPartId = partNode.getAttributeNS(null, "id");
				if (szPartId.match(/body/)) {
					partNode.style.setProperty("display", "none", "");
				}
				if (szPartId.match(/footer/)) {
					partNode.style.setProperty("display", "none", "");
				}
				if (szPartId.match(/backgroundrect/)) {
					partNode.setAttributeNS(szMapNs, "maxheight", partNode.getAttributeNS(null, "height"));
					partNode.setAttributeNS(null, "height", nTitleHeight);
				}
				if (szPartId.match(/shadowrect/)) {
					partNode.setAttributeNS(szMapNs, "maxheight", partNode.getAttributeNS(null, "height"));
					partNode.setAttributeNS(null, "height", String(nTitleHeight - 100));
				}
				if (szPartId.match(/minimizebutton/)) {
					partNode.style.setProperty("display", "none", "");
				}
			}
			mapTheme.minimizebutton.nodeObj.style.setProperty("display", "none", "");
			mapTheme.morebutton.nodeObj.style.setProperty("display", "none", "");
			mapTheme.addDefinitionToFlag("MINIMIZED");
		}
	}
};
/**
 * maximize info display 
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.maximizeInfo = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		var infoNode = mapTheme.widgetNode.firstChild;
		if (infoNode) {
			var partNodesA = infoNode.childNodes;
			for (var i = 0; i < partNodesA.length; i++) {
				var partNode = partNodesA.item(i);
				var szPartId = partNode.getAttributeNS(null, "id");
				if (szPartId.match(/body/)) {
					partNode.style.setProperty("display", "inline", "");
				}
				if (szPartId.match(/footer/)) {
					partNode.style.setProperty("display", "inline", "");
				}
				if (szPartId.match(/backgroundrect/)) {
					partNode.setAttributeNS(null, "height", partNode.getAttributeNS(szMapNs, "maxheight"));
				}
				if (szPartId.match(/shadowrect/)) {
					partNode.setAttributeNS(null, "height", partNode.getAttributeNS(szMapNs, "maxheight"));
				}
				if (szPartId.match(/minimizebutton/)) {
					partNode.style.setProperty("display", "inline", "");
				}
			}
			mapTheme.minimizebutton.nodeObj.style.setProperty("display", "inline", "");
			mapTheme.morebutton.nodeObj.style.setProperty("display", "inline", "");
			mapTheme.removeDefinitionFromFlag("MINIMIZED");
		}
	}
};
/**
 * get all charts of the node of all themes
 * @param szId the id of the node
 * @param targetGroup the target SVG group for the chart to create
 * @return the chart node
 */
Map.Themes.prototype.getChartAll = function (szId, targetGroup, szFlag) {
	var szBaseId = targetGroup.getAttributeNS(null, "id");
	var nChartOffY = 0;
	for (var i = 0; i < this.themesA.length; i++) {
		var chartGroup = map.Dom.newGroup(targetGroup, szBaseId + ":C1");
		this.getChart(szId, chartGroup, szFlag, this.themesA[i]);
		var bBox = map.Dom.getBox(chartGroup);
		if (bBox.width < 0) {
			bBox = new box(0, 0, 0, 0);
		}
		chartGroup.fu.setPosition(0, nChartOffY);
		nChartOffY += bBox.height + map.Scale.normalY(10);
		// GR 22.06.2019 check also the syntetic id created on aggregation
		if (this.themesA[i].szFlag.match(/AGGREGATE/)) {
			var szAggregatedId = szId.split("::")[0] + "::" + this.themesA[i].getNodePosition(szId).x + ',' + this.themesA[i].getNodePosition(szId).y;
			this.getChart(szAggregatedId, chartGroup, szFlag, this.themesA[i]);
			var bBox = map.Dom.getBox(chartGroup);
			if (bBox.width < 0) {
				bBox = new box(0, 0, 0, 0);
			}
			chartGroup.fu.setPosition(0, nChartOffY);
			nChartOffY += bBox.height + map.Scale.normalY(10);
		}
	}


};
/**
 * get the chart of the node of a theme
 * @param szId the id of the node
 * @param targetGroup the target SVG group for the chart to create
 * @return the chart node
 */
Map.Themes.prototype.getChart = function (szId, targetGroup, szFlag, mapTheme) {

	if (!mapTheme) {
		//		return this.getChartAll(szId,targetGroup,szFlag);
		mapTheme = this.activeTheme;
	}
	if (!mapTheme) {
		return null;
	}
	// GR 28.09.2010 strip trailing :paint
	if (szId && (szId.substr(szId.length - 6, 6) == ":paint")) {
		szId = szId.substr(0, szId.length - 6);
	}

	if (mapTheme.szFlag.match(/CHOROPLETH/) && mapTheme.szFlag.match(/DOMINANT|COMPOSE/)) {

		// a) charts for CHOROPLETH themes that show dominant values; show the original values of the item 
		// ================================================================================================

		var nChartSize = 30;
		if (mapTheme.nOrigSumA.length > 2) {
			nChartSize = 15 * mapTheme.nOrigSumA.length / Math.log(mapTheme.nOrigSumA.length);
		}
		var chartGroup = map.Dom.newGroup(targetGroup, targetGroup.getAttributeNS(null, "id") + ":1");

		if (mapTheme.szFlag.match(/PERCENTOFMEAN/) || mapTheme.szFlag.match(/PERCENTOFMEDIAN/) || mapTheme.szFlag.match(/DEVIATION/)) {

			// 1. chart with values
			// --------------------
			mapTheme.drawChart(chartGroup, szId, nChartSize, "CHART|BAR|VALUES|ZOOM", (szId && mapTheme.itemA[szId]) ? mapTheme.itemA[szId].nDominant : null);

			var bBox = map.Dom.getBox(chartGroup);
			if (bBox.width < 0) {
				bBox = new box(0, 0, 0, 0);
			}

			chartGroup = map.Dom.newGroup(targetGroup, targetGroup.getAttributeNS(null, "id") + ":2");

			// 2. chart with deviations
			// ------------------------
			// !! the real chart flag will be set in drawChart() !!
			// !! hope we can change this in future
			var tmpUnits = mapTheme.szUnit;
			mapTheme.szUnit = "";
			var ptNull = mapTheme.drawChart(chartGroup, szId, nChartSize, "VALUES|ZOOM");
			mapTheme.szUnit = tmpUnits;

			var bBox2 = map.Dom.getBox(chartGroup);

			var nScale = (mapTheme.nOrigSumA.length > 1) ? (bBox.width / bBox2.width * 1.015) : (bBox2.width / bBox2.height); // factor heuristic
			var nOff = ((bBox2.x - bBox.x)); // +map.Scale.normalX(mapTheme.partsA.length*1.02))/nScale;

			chartGroup.fu.setPosition(nOff, bBox.height + bBox.y + Math.min(map.Scale.normalY(200), Math.max(map.Scale.normalY(10), -bBox2.y + map.Scale.normalY(6))));
			chartGroup.fu.scale(nScale, 1.0);

			var szMean = mapTheme.szFlag.match(/PERCENTOFMEDIAN/) ? "median" : "mean";
			var xPos = bBox2.width;

			map.Dom.newText(chartGroup, xPos, map.Scale.normalY(0 + 0.9), "font-family:arial;font-size:" + map.Scale.normalY(4) + "px;fill:#808080", map.Dictionary.getLocalText(szMean));
			map.Dom.newText(chartGroup, xPos, map.Scale.normalY(0 + 5.5), "font-family:arial;font-size:" + map.Scale.normalY(4) + "px;fill:#808080", map.Dictionary.getLocalText("-"));
			map.Dom.newText(chartGroup, xPos, map.Scale.normalY(0 - 3.7), "font-family:arial;font-size:" + map.Scale.normalY(4) + "px;fill:#808080", map.Dictionary.getLocalText("+"));
		} else {
			// ony 1 chart with values
			// -----------------------
			var szChartType = "CHART|BAR|SPACED|VALUES|ZOOM";
			if (mapTheme.szFlag.match(/3D/)) {
				szChartType += "|3D";
			}
			if (mapTheme.szFlag.match(/\bSORT\b/)) {
				szChartType += "|SORT";
			}
			if (mapTheme.szFlag.match(/HORZ/)) {
				szChartType += "|HORZ|AXIS";
			}
			mapTheme.drawChart(chartGroup, szId, nChartSize, szChartType, null);
		}
		return new point(0, map.Scale.normalY(30));
	} else {
		// b) buffers don't have charts 
		// ============================
		if (mapTheme.szFlag.match(/BUFFER/) && mapTheme.szFlag.match(/CHART/)) {
			return null;
		}

		// d) normal CHOROPLETH themes, evtl. with distribution histogram
		// ===============================================================
		if (mapTheme.szFlag.match(/CHOROPLETH/) && mapTheme.itemA[szId]) {
			var nValue = mapTheme.itemA[szId].nValuesA[mapTheme.nActualFrame||0];
			var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 1);

			if (mapTheme.szFlag.match(/CATEGORICAL/) && mapTheme.szLabelA && mapTheme.szLabelA.length) {
				var szValueText = mapTheme.szLabelA[nValue - 1];
			} else {
				var nDez = ((mapTheme.nMax-mapTheme.nMin) < 10) ? 2 : 0;
				var szValueText = mapTheme.formatValue(nValue, (mapTheme.nValueDecimals||nDez)) + mapTheme.szUnit;
			}
			
			if (mapTheme.szFlag.match(/\bCLIP\b/) && mapTheme.szXaxisA ){
				map.Dom.newText(targetGroup, -40, -280, __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 0.8) + ";font-weight:normal;fill:#888888", mapTheme.szXaxisA[mapTheme.nActualFrame]);
			}
			
			map.Dom.newText(targetGroup, -40, 0, szTextStyle + ";font-weight:normal;stroke:#ffffff;stroke-width:20;stroke-opacity:0.3", szValueText);
			map.Dom.newText(targetGroup, -40, 0, szTextStyle + ";font-weight:normal;fill:#444444", szValueText);
			
			
			var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 0.8);
			var szTitle = mapTheme.itemA[szId].szTitle;
			if ( 0 && (typeof(szTitle) != 'undefined') && (szTitle != "undefined") ){
				map.Dom.newText(targetGroup, -40, 280, szTextStyle + ";font-weight:normal;stroke:#ffffff;stroke-width:20;stroke-opacity:0.3", szTitle);
				map.Dom.newText(targetGroup, -40, 280, szTextStyle + ";font-weight:normal;fill:#888888", szTitle);
			}

			// GR 27.04.2011 new get distribution histogram
			if (!mapTheme.szFlag.match(/CATEGORICAL/)) {
				if (mapTheme.szChoroplethInfoStyle.match(/HISTOGRAM/) ||
					mapTheme.szChoroplethInfoStyle.match(/histogram/) ||
					mapTheme.szChoroplethInfoStyle.match(/CLASSES/) ||
					mapTheme.szChoroplethInfoStyle.match(/classes/)) {
					var fHistogramStyle = (mapTheme.szChoroplethInfoStyle.match(/HISTOGRAM/) || mapTheme.szChoroplethInfoStyle.match(/histogram/));
					var chartGroup = map.Dom.newGroup(targetGroup, targetGroup.getAttributeNS(null, "id") + ":histogram");
					this.getHistogram(szId, chartGroup, fHistogramStyle ? "DISTRIBUTION" : "CLASSES", mapTheme);
					chartGroup.fu.setPosition(0, map.Scale.normalY(4));
				}
			}

			return new point(0, 0);
		}
		// e) zoomed clones of map charts
		// ==============================
		else {
			if (mapTheme.szFlag.match(/INFOSIZE/)) {
				return mapTheme.drawChart(targetGroup, szId, 30, szFlag);
			} else {
				var nChartSize = 30;
				if (mapTheme.szFlag.match(/SEQUENCE/)) {
					nChartSize = 25;
				}
				if (mapTheme.szFlag.match(/BAR/)) {
					if (mapTheme.szFlag.match(/STACKED/)) {
						nChartSize = 300;
					} else
					if (mapTheme.nOrigSumA.length <= 2) {
						nChartSize = 30;
					} else
					if (mapTheme.szFlag.match(/\bUP\b/)) {
						nChartSize = 15 * mapTheme.nOrigSumA.length / Math.log(mapTheme.nOrigSumA.length);
					} else
					if (mapTheme.szFlag.match(/CENTER/) || mapTheme.szFlag.match(/SEQUENCE/)) {
						nChartSize = 15 * mapTheme.nOrigSumA.length / Math.log(mapTheme.nOrigSumA.length);
					} else {
						nChartSize = 15 * mapTheme.nOrigSumA.length / Math.log(mapTheme.nOrigSumA.length);
					}
				}
				return mapTheme.drawChart(targetGroup, szId, nChartSize, szFlag);
			}
		}
	}
};

/**
 * get the summary (text) of the node of a theme
 * @param szId the id of the node
 * @return the summary text
 * @type string
 */
Map.Themes.prototype.getSummary = function (szId, mapTheme) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}
	// GR 28.06.2007 look also for upper value
	if (!mapTheme.itemA[szId]) {
		var aA = szId.split('::');
		if (aA.length > 1) {
			szId = aA[0] + "::" + String(aA[1]).toUpperCase();
		}
	}
	if (!mapTheme.itemA[szId]) {
		return null;
	}
	var nPartsA = mapTheme.itemA[szId].nOrigValuesA;
	var nMySum = 0;
	for (var i = 0; i < nPartsA.length; i++) {
		if (isNaN(nPartsA[i])) {
			nPartsA[i] = 0;
		}
		nMySum += nPartsA[i];
	}
	if (mapTheme.szFlag.match(/DIFFERENCE/)) {
		nMySum = nPartsA[nPartsA.length - 1];
	}
	if (mapTheme.itemA[szId].nValue100) {
		// GR 17.06.2013 new parameter 'units100'
		// mapTheme.szUnits100 = mapTheme.szUnits100 || map.Dictionary.getLocalText("items");
		mapTheme.szUnits100 = mapTheme.szUnits100 || "";

		if (mapTheme.szFlag.match(/RELATIVE/) || mapTheme.szFlag.match(/DIFFERENCE/)) {
			return map.Dictionary.getLocalText("Relative to") + ": " + String(mapTheme.formatValue(mapTheme.itemA[szId].nValue100, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szUnits100 || "");
		} else if (mapTheme.itemA[szId].nSize) {
			if (mapTheme.szAggregation.match(/sum/)) {
				return map.Dictionary.getLocalText("Counted") + ": " + String(mapTheme.formatValue(mapTheme.itemA[szId].nSize, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szUnits100 || "");
			} else {
				//return map.Dictionary.getLocalText("Total") + ": " + String(mapTheme.formatValue(mapTheme.itemA[szId].nSize, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szUnits100 || "");
			}
		} else {
			if (nMySum != mapTheme.itemA[szId].nValue100) {
				return String(__formatValue(nMySum, 2)) + " / " + String(mapTheme.formatValue(mapTheme.itemA[szId].nValue100, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szUnits100 || "");
			} else {
				//return map.Dictionary.getLocalText("Total") + ": " + String(mapTheme.formatValue(nMySum, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szUnits100 || "");
			}
		}
	} else if (mapTheme.itemA[szId].nSize) {
		if (mapTheme.szFlag.match(/CATEGORICAL/) && (mapTheme.itemA[szId].nValuesA.length == 1) && mapTheme.szValueField) {
			return mapTheme.szLabelA[mapTheme.itemA[szId].nValuesA[0] - 1];
		} else {
			//return map.Dictionary.getLocalText("Total") + ": " + String(mapTheme.formatValue(mapTheme.itemA[szId].nSize, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szSizeValueUnits || "");
		}
	} else if (mapTheme.itemA[szId].nAlpha) {
		return map.Dictionary.getLocalText("Alpha value") + ": " + String(mapTheme.formatValue(mapTheme.itemA[szId].nAlpha, mapTheme.nValueDecimals || 0)) + " " + (mapTheme.szAlphaValueUnits || "");
	} else if (mapTheme.szFlag.match(/SUM/) && !mapTheme.szFlag.match(/SEQUENCE/) && !mapTheme.szFlag.match(/\bCLIP\b/)) {
		//		return map.Dictionary.getLocalText("Value:")+" "+String(mapTheme.formatValue(nMySum,mapTheme.nValueDecimals || 0))+mapTheme.szUnits;
	}
	return null;
};
/**
 * get a text to comment the value of the node of a theme
 * @param szId the id of the node
 * @return the summary text
 * @type string
 */
Map.Themes.prototype.getValueComment = function (szId, mapTheme) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}
	// GR 28.06.2007 look also for upper value
	if (!mapTheme.itemA[szId]) {
		var aA = szId.split('::');
		if (aA.length > 1) {
			szId = aA[0] + "::" + String(aA[1]).toUpperCase();
		}
	}
	if (!mapTheme.itemA[szId]) {
		return null;
	}
	var nPartsA = mapTheme.itemA[szId].nOrigValuesA;
	var nMySum = 0;
	for (var i = 0; i < nPartsA.length; i++) {
		if (isNaN(nPartsA[i])) {
			nPartsA[i] = 0;
		}
		nMySum += nPartsA[i];
	}
	if (mapTheme.szFlag.match(/DIFFERENCE/)) {
		nMySum = nPartsA[nPartsA.length - 1];
	}
	if (mapTheme.szFlag.match(/OFFSETMEAN/)) {
		return map.Dictionary.getLocalText("value") + ": " + String(__formatValue(mapTheme.itemA[szId].nValuesA[0], 2)) + " " +
			map.Dictionary.getLocalText("mean") + ": " + String(__formatValue(mapTheme.nMeanA[0], 2));
	}
	return null;
};

/**
 * get the title (text) of the node of a theme
 * @param szId the id of the node
 * @return the title of the chart
 * @type string
 */
Map.Themes.prototype.getTitle = function (szId, mapTheme) {

	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}

	// GR 18.08.2017 !!!
	szId = String(map.Tiles.getMasterId(szId));

	// GR 28.06.2007 look also for upper value
	if (!mapTheme.itemA[szId]) {
		var aA = szId.split('::');
		if (aA.length > 1) {
			szId = aA[0] + "::" + String(aA[1]).toUpperCase();
		}
	}
	if (!mapTheme.itemA[szId]) {
		return null;
	}
	return mapTheme.itemA[szId].szTitle || null;
};

/**
 * get the label (text) of the node of a theme
 * @param szId the id of the node
 * @return the summary text
 * @type string
 */
Map.Themes.prototype.getLabel = function (szId, mapTheme) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}
	// GR 28.06.2007 look also for upper value
	if (!mapTheme.itemA[szId]) {
		var aA = szId.split('::');
		if (aA.length > 1) {
			szId = aA[0] + "::" + String(aA[1]).toUpperCase();
		}
	}
	if (!mapTheme.itemA[szId]) {
		return null;
	}
	return mapTheme.itemA[szId].szLabel || null;
};
/**
 * get all text nodes of all themes
 * @return an array with the nodes
 * @type Array
 */
Map.Themes.prototype.getTextObjects = function () {
	var allNodes = [];
	for (var i = 0; i < this.themesA.length; i++) {

		if (this.themesA[i].szFlag.match(/TEXTONLY/) && this.themesA[i].chartGroup) {

			// class highlighting active ? exclude text switched of by class highlighting
			if ((typeof (this.themesA[i].markedClass) != "undefined") && (this.themesA[i].markedClass != null)) {

				var nClass = this.themesA[i].markedClass;

				var nodeA = this.themesA[i].chartGroup.getElementsByTagName('text');
				for (var n = 0; n < nodeA.length; n++) {
					if (nodeA.item(n).firstChild.nodeValue.length > 0) {
						if (Number(nodeA.item(n).getAttributeNS(szMapNs, "class")) == nClass) {
							allNodes.push(nodeA.item(n));
						}
					}
				}
				// nothing to exclude
			} else {

				var nodeA = this.themesA[i].chartGroup.getElementsByTagName('text');
				for (var n = 0; n < nodeA.length; n++) {
					if (nodeA.item(n).firstChild.nodeValue.length > 0) {
						allNodes.push(nodeA.item(n));
					}
				}
			}
		}
	}
	return allNodes;
};
/**
 * get the max value of one chart
 * @param szId the id of the node
 * @param mapTheme the theme object; if null take activeTheme
 * @return the max value
 * @type number
 */
Map.Themes.prototype.getMaxValue = function (szId, mapTheme) {

	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}
	var nMax = 0;
	var nPartsA = mapTheme.itemA[szId].nValuesA;
	for (var i = 0; i < nPartsA.length; i++) {
		if (isNaN(nPartsA[i])) {
			nPartsA[i] = 0;
		}
		nMax = Math.max(nMax, nPartsA[i]);
	}
	return nMax;
};
/**
 * get a text array with the data values of one chart
 * @param szId the id of the node
 * @return the data value array
 * @type array of string
 */
Map.Themes.prototype.getDataRow = function (szId, mapTheme) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme || !szId) {
		return null;
	}
	// GR 28.06.2007 look also for upper value
	if (!mapTheme.itemA[szId]) {
		var aA = szId.split('::');
		if (aA && (aA.length > 1)) {
			szId = aA[0] + "::" + String(aA[1]).toUpperCase();
		}
	}
	if (!mapTheme.itemA[szId]) {
		return null;
	}

	// GR 14.05.2016 if more than 1 item integrated, don't show raw data
	/**
	if (mapTheme.szFlag.match(/AGGREGATE/) && mapTheme.itemA[szId].nCount > 1) {
		return null;
	}
	**/

	var szTheme = mapTheme.szThemesA[0];
	var objTheme = mapTheme.objThemesA[szTheme];
	var fields = objTheme.dbFields;

	var dataIndexA = [];
	// GR 23.05.2015 handle data selection array
	if (mapTheme.szDataFieldsA) {
		for (var i = 0; i < mapTheme.szDataFieldsA.length; i++) {
			for (var ii = 0; ii < objTheme.dbFields.length; ii++) {
				if (mapTheme.szDataFieldsA[i] == objTheme.dbFields[ii].id) {
					dataIndexA.push(ii);
				}
			}
		}
	} else {
		for (var ii = 0; ii < objTheme.dbFields.length; ii++) {
			dataIndexA.push(ii);
		}
	}

	var valuesA = [];

	if (objTheme.dbRecords) {

		if ((typeof (mapTheme.itemA[szId].dbIndexA) != "undefined") && mapTheme.itemA[szId].dbIndexA.length) {
			for (var d in mapTheme.itemA[szId].dbIndexA) {
				// we have a data row associated
				if (d > 0) {
					valuesA.push("--------------------");
				}
				for (var ii = 0; ii < dataIndexA.length; ii++) {
					valuesA.push(objTheme.dbFields[dataIndexA[ii]].id);
				}
			}
			for (var d in mapTheme.itemA[szId].dbIndexA) {
				// we have a data row associated
				if (d > 0) {
					valuesA.push("--------------------");
				}
				var i = mapTheme.itemA[szId].dbIndexA[d];
				for (var ii = 0; ii < dataIndexA.length; ii++) {
					valuesA.push(objTheme.dbRecords[i][dataIndexA[ii]]);
				}
			}
			return valuesA;
		} else
		if (typeof (mapTheme.itemA[szId].dbIndex) != "undefined") {
			// we have a data row associated
			var i = mapTheme.itemA[szId].dbIndex;
			for (var ii = 0; ii < dataIndexA.length; ii++) {
				valuesA.push(objTheme.dbFields[dataIndexA[ii]].id);
			}
			for (var ii = 0; ii < dataIndexA.length; ii++) {
				valuesA.push(objTheme.dbRecords[i][dataIndexA[ii]]);
			}
			return valuesA;
		}

		szId = (szId.split('::')[1]);
		for (var i = 0; i < objTheme.dbRecords.length; i++) {
			if (objTheme.dbRecords[i] &&
				objTheme.dbRecords[i][objTheme.nFieldSelectionIndex] &&
				(String((objTheme.dbRecords[i][objTheme.nFieldSelectionIndex])).toUpperCase() == String(szId).toUpperCase())) {
				for (var ii = 0; ii < objTheme.dbFields.length; ii++) {
					valuesA.push(objTheme.dbFields[ii].id);
				}
				for (var ii = 0; ii < objTheme.dbFields.length; ii++) {
					valuesA.push(objTheme.dbRecords[i][ii]);
				}
				return valuesA;
			}
		}
	}
	return valuesA;
};
/**
 * get a number array with the field indices of the theme
 * @param szId the id of the node
 * @param mapTheme the theme object
 * @return the index array
 * @type array of numbers
 */
Map.Themes.prototype.getFieldIndexArray = function (mapTheme) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme) {
		return [];
	}
	if (mapTheme.szDataFieldsA) {
		return [];
	}

	mapTheme.fieldIndexArray = [];
	for (var i = 0; i < mapTheme.objThemesA[mapTheme.szThemesA[0]].nFieldIndexA.length; i++) {
		mapTheme.fieldIndexArray.push(mapTheme.objThemesA[mapTheme.szThemesA[0]].nFieldIndexA[i]);
	}
	if (mapTheme.objThemesA[mapTheme.szThemesA[0]].nField100Index >= 0) {
		mapTheme.fieldIndexArray.push(mapTheme.objThemesA[mapTheme.szThemesA[0]].nField100Index);
	}
	return mapTheme.fieldIndexArray;
};

/**
 * get the distribution of a theme
 * @param nTicks the the number of ticks
 * @param szFlag additional flags
 * @return an array with the distribution
 * @type array
 */
Map.Themes.prototype.getScatterArray = function (mapTheme, nTicks, szFlag) {
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	var nValuePos = 0;
	var nCountMax = 0;
	var nMin = mapTheme.nMin;
	var nMax = mapTheme.nMax;
	var dValue = 0;
	var a;

	_TRACE("nMin:" + nMin + " nMax:" + nMax);
	if (szFlag.match(/LOG/)) {
		dValue = 1 - nMin;
		nMin = Math.log(nMin + dValue);
		nMax = Math.log(nMax + dValue);
	} else
	if (szFlag.match(/POW2/)) {
		dValue = 1 - nMin;
		nMin = Math.pow((nMin + dValue), 1 / 2);
		nMax = Math.pow((nMax + dValue), 1 / 2);
	}
	if (szFlag.match(/POW3/)) {
		dValue = 1 - nMin;
		nMin = Math.pow((nMin + dValue), 1 / 3);
		nMax = Math.pow((nMax + dValue), 1 / 3);
	}
	_TRACE("nMin:" + nMin + " nMax:" + nMax);
	var nPop = (nMax - nMin) / nTicks;
	var nPopA = [];
	for (var i = 0; i < nTicks + 1; i++) {
		nPopA[i] = 0;
	}
	for (a in mapTheme.itemA) {
		var xValue = mapTheme.itemA[a].nValuesA[0];
		if (typeof (xValue) == 'number') {
			if (szFlag.match(/LOG/)) {
				xValue = Math.log(xValue + dValue);
			} else
			if (szFlag.match(/POW2/)) {
				xValue = Math.pow((xValue + dValue), 1 / 2);
			} else
			if (szFlag.match(/POW3/)) {
				xValue = Math.pow((xValue + dValue), 1 / 3);
			}
			var nPos = Math.max(0, Math.min(nTicks - 1, Math.floor((xValue - nMin) / nPop)));
			nPopA[nPos]++;
			nCountMax = Math.max(nCountMax, nPopA[nPos]);
		}
	}
	_TRACE("nTicks:" + nTicks);
	_TRACE("nPop:" + nPop + " nMax:" + nMax);
	_TRACE("nCountMax:" + nCountMax);
	return nPopA;
};
/**
 * get and index of the quality of a distribution of the theme
 * @param nPopA the popolation array of the distribution
 * @type number
 * @return quality index
 */
Map.Themes.prototype.getResolutionQualityOfArray = function (nPopA) {

	var nTicks = nPopA.length;
	var nCountMax = -1000000;
	var nTickMax = 0;
	var nMean = 0;
	var nVarianz = 0;
	var nDeviation = 0;

	for (var i = 0; i < nTicks; i++) {
		nCountMax = Math.max(nCountMax, nPopA[i]);
	}
	var nCount = 0;
	for (var i = 0; i < nTicks; i++) {
		if (nPopA[i] > nCountMax / 10) {
			nCount++;
		}
	}
	return nCount / nTicks * 100;
};
/**
 * get the deviation of a popolation array 
 * @param nPopA the popolation array of the distribution
 * @type number
 * @return the standard deviation
 */
Map.Themes.prototype.getDeviationOfArray = function (nPopA) {

	_TRACE("getDeviationOfArray --->");

	var nTicks = nPopA.length;
	var nCountMax = -1000000;
	var nTickMax = 0;
	var nMean = 0;
	var nVarianz = 0;
	var nDeviation = 0;

	for (var i = 0; i < nTicks; i++) {
		nCountMax = Math.max(nCountMax, nPopA[i]);
		if (nPopA[i] == nCountMax) {
			nTickMax = i;
		}
		nMean += nPopA[i];
	}
	nMean /= nTicks;

	_TRACE("nCountMax: " + nCountMax);
	_TRACE("nTickMax: " + nTickMax);
	_TRACE("nMean: " + nMean);

	for (var i = 0; i < nTicks; i++) {
		nVarianz += (nPopA[i] - nMean) * (nPopA[i] - nMean);
	}
	nVarianz /= nTicks;
	nDeviation = Math.sqrt(nVarianz);

	_TRACE("nVarianz: " + nVarianz);
	_TRACE("nDeviation: " + nDeviation);


	return nDeviation;
};
/**
 * get the value histogramm of a theme
 * @param szId the id of the node
 * @param targetGroup the target SVG group for the chart to create
 * @param szFlag additional flags
 * @param mapTheme optional parameter to select a map theme other than the active theme
 * @return the histogram node
 * @type object
 */
Map.Themes.prototype.getHistogram = function (szId, targetGroup, szFlag, mapTheme) {

	_TRACE("map.Themes.getHistogram --->");

	if (!targetGroup) {
		return null;
	}
	if (!mapTheme) {
		mapTheme = this.activeTheme;
	}
	if (!mapTheme) {
		return null;
	}
	if (mapTheme.nMin == mapTheme.nMax) {
		return null;
	}

	if (szId) {
		// GR 28.06.2007 look also for upper value
		if (!mapTheme.itemA[szId]) {
			var aA = szId.split('::');
			if (aA.length > 1) {
				szId = aA[0] + "::" + String(aA[1]).toUpperCase();
			}
		}
		if (!mapTheme.itemA[szId]) {
			return null;
		}
	}

	this.histGroup = map.Dom.newGroup(targetGroup, targetGroup.getAttributeNS(null, "id") + ":group");
	this.histFlag = szFlag;
	this.histTheme = mapTheme;

	var nWidth = map.Scale.normalX(70);
	var nHeight = map.Scale.normalY(20);

	map.Dom.newShape('rect', this.histGroup, 0, 0, nWidth - map.Scale.normalX(0.5), nHeight, "fill:none;stroke:none;");

	if (szId) {
		setTimeout(function(){map.Themes.makeHistogram(szId);}, 100);
	} else {
		setTimeout(function(){map.Themes.makeHistogram();}, 100);
	}
};

/**
 * make the complete (SVG) value histogramm of a theme 
 * @param szId the id of an item to mark within the histogram
 * @return the histogram group node (SVG)
 * @type object
 */
Map.Themes.prototype.makeHistogram = function (szId) {

	_TRACE("map.Themes.makeHistogram --->");

	var histGroup = this.histGroup;
	var szFlag = this.histFlag;
	var mapTheme = this.histTheme;
	if (szFlag.match("CLASSES")) {
		var nWidth = map.Scale.normalX(50);
		var nHeight = map.Scale.normalY(5);
		var nStep = nWidth / mapTheme.colorScheme.length;
		var nX = 0;
		var nY = 0;
		var nValue = szId ? mapTheme.itemA[szId].nValuesA[0] : 0;
		var nValuePos = 0;

		// create the histogram; width of color swatches depends on ranges (equidistant,quantile,... etc)
		for (var i = 0; i < mapTheme.partsA.length; i++) {

			nStep = nWidth / mapTheme.nCount * mapTheme.partsA[i].nCount;
			var newClassRect = map.Dom.newShape('rect', histGroup, nX, nY, nStep, nHeight, "fill:" + mapTheme.colorScheme[i] + ";stroke:black;stroke-width:1;");
			if (newClassRect) {
				newClassRect.setAttributeNS(szMapNs, "tooltip", mapTheme.szLegendLabelA[i] + " (" + mapTheme.formatValue(mapTheme.partsA[i].nCount) + " " + map.Dictionary.getLocalText("members") + ")");
			}
			nX += nStep;

			// calcolate item marker position 
			if (nValue > mapTheme.partsA[i].max) {
				nValuePos += nStep;
			} else
			if (nValue > mapTheme.partsA[i].min) {
				nValuePos += nStep / (mapTheme.partsA[i].max - mapTheme.partsA[i].min) * (nValue - mapTheme.partsA[i].min);
			}
		}

		// mark the item value within the histogram
		map.Dom.newShape('circle', histGroup, nValuePos, -map.Scale.normalX(0.1), map.Scale.normalX(1), "fill:#444444;stroke:none;");

		// make a distribution histogram
		// distribute the values in nTicks classes, or linear or logarithmic
		//
	} else if (szFlag.match("DISTRIBUTION")) {

		if (!isFinite(mapTheme.nMin) || !isFinite(mapTheme.nMax)) {
			return histGroup;
		}

		var nClasses = Math.min(140, Math.max(20, mapTheme.nCount / 5));
		var nClasses = Math.min(500, Math.max(20, mapTheme.nCount / 5));

		var nWidth = map.Scale.normalX(70);
		var nHeight = map.Scale.normalY(12);
		if (szFlag.match("INTERACTIVE")) {
			var nHeight = map.Scale.normalY(20);
		}
		var nClassWidth = nWidth / nClasses;

		var nX = 0;
		var nY = 0;

		var nValue = szId ? mapTheme.itemA[szId].nValuesA[0] : 0;
		var nValuePos = 0;
		var nCountMax = 0;
		var nMin = mapTheme.nMin;
		var nMax = mapTheme.nMax;
		var dValue = 0;

		// create a distribution (linear or logarithmic)
		// =============================================

		// 1. create the linear distribution
		var nPopA = this.getScatterArray(mapTheme, nClasses, "");
		var nDeviation = this.getDeviationOfArray(nPopA);
		// 2. create the logarithmic distribution
		var nPopALog = this.getScatterArray(mapTheme, nClasses, "LOG");
		var nDeviationLog = this.getDeviationOfArray(nPopALog);

		var fDoLog = false;
		var nClassStep = (nMax - nMin) / nClasses;

		_TRACE("nDeviation:" + nDeviation + " <> nDeviationLog:" + nDeviationLog);

		// test which distribution (log or non log) has the best standard deviation
		//
		if (nDeviationLog && (nDeviationLog < nDeviation)) {
			// if take the log, scale the variables 
			nPopA = nPopALog;
			dValue = 1 - nMin;
			nMin = Math.log(nMin + dValue);
			nMax = Math.log(nMax + dValue);
			nValue = Math.log(nValue + dValue);
			nClassStep = (nMax - nMin) / nClasses;
			fDoLog = true;
		}
		// get the maximum count
		//
		for (var i = 0; i < nClasses; i++) {
			nCountMax = Math.max(nCountMax, nPopA[i]);
		}

		// create the histogram;
		// ================================================	

		// draw color classes
		// 
		nX = -20;
		nY = 0;

		mapTheme.histogram = new Map.Histogram(mapTheme);
		mapTheme.histogram.fDoLog = fDoLog;
		mapTheme.histogram.dValue = dValue;
		mapTheme.histogram.nWidth = nWidth;
		mapTheme.histogram.nMin = nMin;
		mapTheme.histogram.nMax = nMax;

		var szSliderTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 0.4);

		var nLastStep = 0;
		for (var i = 0; i < mapTheme.partsA.length; i++) {
			if (fDoLog) {
				var nClassColorWidth = nWidth / (nMax - nMin) * (Math.min(nMax, Math.log(mapTheme.partsA[i].max + dValue)) - nMin);
			} else {
				var nClassColorWidth = nWidth / (nMax - nMin) * (Math.min(nMax, mapTheme.partsA[i].max) - nMin);
			}
			nStep = nClassColorWidth - nX;
			var newClassRect = map.Dom.newShape('rect', histGroup, nX, nY, nStep, nHeight, "fill:" + mapTheme.colorScheme[i] + ";stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";stroke-opacity:0.1");
			if (newClassRect) {
				newClassRect.setAttributeNS(szMapNs, "tooltip", mapTheme.szLegendLabelA[i] + " (" + mapTheme.formatValue(mapTheme.partsA[i].nCount) + " " + map.Dictionary.getLocalText("members") + ")");
				newClassRect.setAttributeNS(szMapNs, "onoverstyle", "fill:" + mapTheme.colorScheme[i] + ";stroke:black;stroke-width:" + map.Scale.normalX(0.5) + ";");
				newClassRect.setAttributeNS(null, "onmouseover", "map.Themes.markClass(evt,'" + mapTheme.szId + "','" + i + "','" + 1 + "')");
				newClassRect.setAttributeNS(null, "onmouseout", "map.Themes.unmarkClass(evt,'" + mapTheme.szId + "')");
			}

			mapTheme.histogram.classRectA[i] = newClassRect;
			mapTheme.histogram.classRectXA[i] = nX;
			mapTheme.histogram.classRectWidthA[i] = nStep;
			mapTheme.histogram.classRectMaxA[i] = mapTheme.partsA[i].max;

			if (szFlag.match("INTERACTIVE")) {
				// class slider
				var classSliderGroup = map.Dom.newGroup(histGroup, "");
				var newSliderText = null;
				if (i > 0) {
					map.Dom.newShape('line', classSliderGroup, nX, nY - map.Scale.normalY(2), nX, nY + nHeight, "stroke:black;stroke-width:" + map.Scale.normalX(0.5) + ";stroke-opacity:0.5");
					var newSliderRect = map.Dom.newShape('rect', classSliderGroup, nX - map.Scale.normalY(1.5), nY - map.Scale.normalY(6), map.Scale.normalX(3), map.Scale.normalY(5), "fill:" + mapTheme.colorScheme[i] + ";stroke:black;styroke-width(1);");
					if (newSliderRect) {
						newSliderRect.setAttributeNS(null, "rx", map.Scale.normalX(2));
						newSliderRect.setAttributeNS(null, "ry", map.Scale.normalY(1.5));
					}
					newSliderText = map.Dom.newText(classSliderGroup, nX, nY - map.Scale.normalY(7), szSliderTextStyle + "display:none;font-weight:normal;text-anchor:middle", mapTheme.formatValue(mapTheme.partsA[i - 1].max, 1));
				}
				var classSlider = new Slider(classSliderGroup, new box(-nLastStep, 0, nLastStep + nStep, 0));
				classSlider.setId(String(i));
				classSlider.parent = mapTheme.histogram;
				classSlider.textObj = newSliderText;
				nLastStep = nStep;
			}

			nX += nStep;
		}

		// draw distribution histogram
		// 
		nX = nClassWidth / 3;
		nY = 0;

		// scale the histogram in Y ! max values may bee outside after scaling !  
		var nScalingFactor = 0.9;
		// get the percent of values within 10% of maximum
		var nQuality = this.getResolutionQualityOfArray(nPopA);
		_TRACE(nQuality + "%");
		// if we have to many small values, increase scaling
		if (nQuality < 10) {
			nScalingFactor = 10 - nQuality;
		}

		for (var i = 0; i < nClasses; i++) {
			var xHeight = nPopA[i] / nCountMax * nHeight * nScalingFactor;
			var xMinValue = fDoLog ? (Math.exp(nMin + i * nClassStep) - dValue) : (nMin + i * nClassStep);
			var xMaxValue = fDoLog ? (Math.exp(nMin + (i + 1) * nClassStep) - dValue) : (nMin + (i + 1) * nClassStep);

			var szColor = "black";

			if (xHeight && !isNaN(xHeight)) {
				xHeight = Math.min(nHeight, Math.max(map.Scale.normalY(0.5), xHeight));
			} else {
				xHeight = 0;
			}

			var newLine = map.Dom.newShape('line', histGroup, nX, nY + nHeight, nX, nY + nHeight - xHeight, "stroke:" + szColor + ";stroke-width:" + nClassWidth + ";");
			if (newLine) {
				newLine.setAttributeNS(szMapNs, "tooltip", mapTheme.formatValue(xMinValue, 2) + ' ... ' + mapTheme.formatValue(xMaxValue, 2) + mapTheme.szUnit + " (" + nPopA[i] + " members)");
				newLine.setAttributeNS(szMapNs, "onoverstyle", "stroke:yellow;stroke-width:" + Math.max(map.Scale.normalX(1), nClassWidth) + ";");
			}

			nX += nClassWidth;
		}

		// frame the histogram
		//
		map.Dom.newShape('line', histGroup, -map.Scale.normalX(0.5), nHeight + 1, nWidth - map.Scale.normalX(0.5), nHeight + 1, "stroke:black;stroke-width:" + map.Scale.normalX(0.1) + ";");

		// draw x axis
		// ===========
		var nPosXLeft = -map.Scale.normalX(0.5);
		var nPosXRight = nWidth - map.Scale.normalX(0.5);
		var nTickHeight = map.Scale.normalX(2);
		map.Dom.newShape('line', histGroup, nPosXLeft, nHeight, nPosXLeft, nHeight + nTickHeight, "stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";");
		map.Dom.newShape('line', histGroup, nPosXRight, nHeight, nPosXRight, nHeight + nTickHeight, "stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";");

		var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 0.4);
		var nTextHeight = map.Scale.tStyle.Summary.nFontHeight * 0.4;
		var nTextPosY = nHeight + nTickHeight + nTextHeight * 0.8;
		var szMinValue = mapTheme.formatValue(mapTheme.nMin, 0);
		var szMaxValue = mapTheme.formatValue(mapTheme.nMax, 0);

		// show min value allways
		map.Dom.newText(histGroup, nPosXLeft - 10, nTextPosY, szTextStyle + ";font-weight:normal;text-anchor:start", szMinValue);

		// define 0 point, only if we have negative and positive values 
		if (mapTheme.nMin < 0 && mapTheme.nMax > 0) {
			var nValuePos = (0 - nMin) / nClassStep * nClassWidth;
			map.Dom.newShape('line', histGroup, nValuePos, nHeight, nValuePos, nHeight + nTickHeight, "stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";");
			map.Dom.newText(histGroup, nValuePos, nTextPosY, szTextStyle + ";font-weight:normal;text-anchor:start", "0");
		}

		// make scala 10, 20, ...
		var nNextFreeTextPos = 0;
		for (var i = 10; i < mapTheme.nMax; i *= 10) {
			for (var ii = 1; ii < 9; ii++) {
				if (i * ii > mapTheme.nMax || i * ii < mapTheme.nMin) {
					break;
				}
				nValuePos = ((fDoLog ? Math.log(i * ii + dValue) : i * ii) - nMin) / nClassStep * nClassWidth;
				var szValue = mapTheme.formatValue(i * ii, 0);
				if (nValuePos > nNextFreeTextPos + szValue.length * nTextHeight * 3 / 8) {
					map.Dom.newShape('line', histGroup, nValuePos, nHeight, nValuePos, nHeight + nTickHeight, "stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";");
					map.Dom.newText(histGroup, nValuePos, nTextPosY, szTextStyle + ";font-weight:normal;text-anchor:middle", szValue);
					nNextFreeTextPos = nValuePos + szValue.length * nTextHeight * 3 / 8;
				} else {
					map.Dom.newShape('line', histGroup, nValuePos, nHeight, nValuePos, nHeight + nTickHeight / 2, "stroke:black;stroke-width:" + map.Scale.normalX(0.2) + ";");
				}
			}
		}
		// if possible show max value
		if (nPosXRight > nNextFreeTextPos + szMaxValue.length * nTextHeight * 3 / 8) {
			map.Dom.newText(histGroup, nPosXRight, nTextPosY, szTextStyle + ";font-weight:normal;text-anchor:middle;", szMaxValue);
		}

		// mark the item value within the histogram
		// ========================================
		if (szId && !szFlag.match("INTERACTIVE")) {
			nValuePos = (nValue - nMin) / nClassStep * nClassWidth;
			map.Dom.newShape('circle', histGroup, nValuePos, -map.Scale.normalX(0.1), map.Scale.normalX(1), "fill:#dd0000;stroke:none;");
			map.Dom.newShape('line', histGroup, -10, -5, nValuePos - 10, -5, "stroke:#000000;stroke-width:" + map.Scale.normalX(0.5) + ";stroke-opacity:0.3");
		}

	} else {
		var nTicks = 700;
		var nWidth = map.Scale.normalX(70);
		var nHeight = map.Scale.normalY(12);
		var nStep = nWidth / nTicks;
		var nX = 0;
		var nY = 0;
		var nValue = szId ? mapTheme.itemA[szId].nValuesA[0] : 0;
		var nValuePos = 0;
		var nCountMax = 0;
		var nMin = mapTheme.nMin;
		var nMax = mapTheme.nMax;
		var nRange = nMax - nMin;
		var nScale = nHeight / nMax;
		var nAcc = Math.max(1, Math.ceil(mapTheme.nCount / nTicks));

		var nValueA = [];
		var nAccI = 0;
		var a;

		var nValueXA = [];
		for (a in mapTheme.itemA) {
			nValueXA.push(mapTheme.itemA[a].nValuesA[0]);
		}
		nValueXA.sort(mapTheme.sortUp);

		for (a in nValueXA) {
			if (nAccI % nAcc) {
				nValueA[nValueA.length - 1] += nValueXA[a] / nAcc;
			} else {
				nValueA[nValueA.length] = nValueXA[a] / nAcc;
			}
			nAccI++;
		}
		nValueA.sort(mapTheme.sortUp);

		// create the histogram;

		for (var i = 0; i < nValueA.length; i++) {
			var xValue = nValueA[i];
			var xHeight = nValueA[i] * nScale * 0.9;
			var szColor = "black";
			for (var p = 0; p < mapTheme.partsA.length; p++) {
				if (nValueA[i] < mapTheme.partsA[p].max) {
					szColor = mapTheme.colorScheme[p];
					break;
				}
			}

			var newLine = map.Dom.newShape('line', histGroup, nX, nY, nX, nHeight, "stroke:" + szColor + ";stroke-width:" + nStep + ";");
			newLine.setAttributeNS(szMapNs, "tooltip", mapTheme.formatValue(xValue, 2) + mapTheme.szUnit);

			if (isNaN(xHeight)) {
				xHeight = 0;
			}
			newLine = map.Dom.newShape('line', histGroup, nX, nY + nHeight, nX, nY + nHeight - xHeight, "stroke:#000000;stroke-width:" + nStep + ";");
			newLine.setAttributeNS(szMapNs, "tooltip", mapTheme.formatValue(xValue, 2) + mapTheme.szUnit);

			nX += nStep;
		}
		// if possible show min/max value
		if (1) {
			var szMinValue = mapTheme.formatValue(mapTheme.nMin, 0);
			var szMaxValue = mapTheme.formatValue(mapTheme.nMax, 0);
			var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle, 0.4);
			map.Dom.newText(histGroup, nX + map.Scale.normalX(1), nY + nHeight, szTextStyle + ";font-weight:normal;text-anchor:start;stroke-opacity:0.8;", szMinValue);
			map.Dom.newText(histGroup, nX + map.Scale.normalX(1), nY + map.Scale.normalY(3.5), szTextStyle + ";font-weight:normal;text-anchor:start;stroke-opacity:0.8;", szMaxValue);
		}

		// rescale the histogram to fit the required width, n*nStep is not exact enough
		if (histGroup) {
			histGroup.fu.scale(nWidth / nX, 1);
		}
	}

	return histGroup;
};

// .............................................................................
// histogram class
// .............................................................................

Map.Histogram = function (mapTheme) {
	this.mapTheme = mapTheme;
	this.fDoLog = false;
	this.dValue = 0;
	this.classRectA = [];
	this.classRectXA = [];
	this.classRectWidthA = [];
	this.classRectMaxA = [];
};
Map.Histogram.prototype = new Map();

Map.Histogram.prototype.onMouseOver = function (evt, szId, slider) {
	if (slider.textObj) {
		slider.textObj.style.setProperty("display", "inline", "");
	}
};
Map.Histogram.prototype.onMouseOut = function (evt, szId, slider) {
	if (slider.textObj) {
		slider.textObj.style.setProperty("display", "none", "");
	}
};
Map.Histogram.prototype.onMouseMove = function (evt, szId, slider) {
	_TRACE(szId + ' - ' + slider.value.x);
	var classRect = this.classRectA[Number(szId)];
	if (classRect) {
		classRect.setAttributeNS(null, "x", this.classRectXA[Number(szId)] + slider.value.x);
		classRect.setAttributeNS(null, "width", this.classRectWidthA[Number(szId)] - slider.value.x);
	}
	var classRect = this.classRectA[Number(szId) - 1];
	if (classRect) {
		classRect.setAttributeNS(null, "width", this.classRectWidthA[Number(szId) - 1] + slider.value.x);

		var newX = this.classRectXA[Number(szId)] + slider.value.x;
		var nToValueScale = (this.nMax - this.nMin) / this.nWidth;
		var nNewValue = this.nMin + newX * nToValueScale;
		nNewValue = this.fDoLog ? (Math.exp(nNewValue) - this.dValue) : nNewValue;
		this.classRectMaxA[Number(szId) - 1] = nNewValue;
	}
	if (slider.textObj) {
		slider.textObj.firstChild.nodeValue = __formatValue(nNewValue, 1);
	}
};
Map.Histogram.prototype.onMouseUp = function (evt, szId, slider) {
	var classRect = this.classRectA[Number(szId) - 1];
	if (classRect) {
		this.classRectWidthA[Number(szId) - 1] = classRect.getAttributeNS(null, "width");
	}
	var szRanges = "ranges:" + String(this.nMin);
	for (var i = 0; i < this.classRectMaxA.length; i++) {
		szRanges += "," + String(this.classRectMaxA[i]);
	}
	map.Themes.changeThemeStyle(evt, this.mapTheme.szId, szRanges);
};

// .............................................................................


/**
 * Display an error summary for the chart created
 * @parameter evt the event
 * @parameter szId the id of the theme
 */
Map.Themes.prototype.showErrorInfo = function (evt, szId) {
	var mapTheme = this.getTheme(szId);
	if (mapTheme) {
		mapTheme.showErrorInfo();
	}
};

/**
 * keep old redraw function for compatibility reason 
 * @parameter nZoomChangeFactor 1 if zoom not! changed
 */
Map.Themes.prototype.redraw = function (nZoomChangeFactor) {
	return this.actualize(nZoomChangeFactor);
}
/**
 * keep old actualize function for compatibility reason 
 * @parameter nZoomChangeFactor 1 if zoom not! changed
 */
Map.Themes.prototype.actualizeActiveTheme = function (nZoomChangeFactor) {
	return this.actualize(nZoomChangeFactor);
}

/**
 * redraw themes ( may be necessary after zoom )
 * @parameter nZoomChangeFactor 1 if zoom not! changed
 */
Map.Themes.prototype.actualize = function (nZoomChangeFactor) {
	
	_TRACE("A C T U A L I Z E");

	var lastExecutionTime = 0;
	for (var i = 0; i < this.themesA.length; i++) {
		if (!this.themesA[i].fDone) {
			continue;
		}
		if (this.themesA[i].szFlag.match(/WMS/)) {
			this.themesA[i].fRealize = true;
			executeWithMessage("map.Themes.execute()", "...", 100);
			continue;
		}
		if (this.themesA[i].szFlag.match(/FEATURES/)) {
			this.themesA[i].fActualize = true;
			continue;
		}
		
		if (this.themesA[i].szFlag.match(/CHART/)) {
			if (this.themesA[i].__fClipToGeoBounds) {
				this.themesA[i].fRealize = true;
			}
			if (nZoomChangeFactor && (nZoomChangeFactor != 1) && this.themesA[i].szFlag.match(/DYNAMICSCALE/)) {
				this.themesA[i].nScale *= Math.sqrt(nZoomChangeFactor);
				this.themesA[i].fRealize = true;
			}
			if (nZoomChangeFactor && (nZoomChangeFactor != 1) && this.themesA[i].szFlag.match(/BEZIER/)) {
				this.themesA[i].fRedraw = true;
			}
			if (this.themesA[i].szFlag.match(/DECLUTTER/)) {
				this.themesA[i].fDeclutter = true;
				map.Themes.execute();
			}
			if (nZoomChangeFactor && (nZoomChangeFactor != 1) ) {
				if (this.themesA[i].fRealizeDone ) {
					if (this.themesA[i].szAggregationFieldA) {
						var oldGridWidth = this.themesA[i].nGridWidth;
						var oldAggregationField = this.themesA[i].szAggregationField;
						for (var a = 0; a < this.themesA[i].szAggregationFieldA.length; a++) {
							var lower = Number(this.themesA[i].szAggregationFieldA[a].split(':')[1]);
							if (lower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > lower)) {
								if (!isNaN(parseFloat(this.themesA[i].szAggregationFieldA[a + 1]))) {
									if (this.themesA[i].szAggregationFieldA[a + 1].match(/px/)) {
										this.themesA[i].nGridWidthPx = parseFloat(this.themesA[i].szAggregationFieldA[a + 1]);
									} else {
										this.themesA[i].nGridWidth = parseFloat(this.themesA[i].szAggregationFieldA[a + 1]);
										this.themesA[i].nGridWidthPx = 0;
									}
									this.themesA[i].szAggregationField = null;
								} else {
									this.themesA[i].szAggregationField = this.themesA[i].szAggregationFieldA[a + 1];
								}
							}
							a++;
						}
						if ((this.themesA[i].szAggregationField != oldAggregationField) || (this.themesA[i].nGridWidth != oldGridWidth)) {
							this.themesA[i].fRealize = true;
							this.themesA[i].themeNodesPosA = [];
						} else {
							this.themesA[i].fRedraw = true;
						}
					}
					if (this.themesA[i].nGridWidthPx) {
						var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + map.Scale.normalX(this.themesA[i].nGridWidthPx), 1000);
						this.themesA[i].nGridWidth = maxDist / map.Scale.nZoomScale;
						this.themesA[i].fRealize = true;
						// important! to avoid rendering of intermediate scaled charts
						//this.themesA[i].unpaintMap();
						this.themesA[i].themeNodesPosA = [];
					} else
					if (this.themesA[i].nGridMatrix) {
						var mapArea = map.Zoom.getBox();
						var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + mapArea.width, 1000);
						this.themesA[i].nGridWidth = maxDist / (this.themesA[i].nGridMatrix || 20) / map.Scale.nZoomScale;
						this.themesA[i].fRealize = true;
						// important! to avoid rendering of intermediate scaled charts
						//this.themesA[i].unpaintMap();
						this.themesA[i].themeNodesPosA = [];
					} 
				} 

				if (this.themesA[i].autoOpacity) {
					this.themesA[i].fRedraw = true;
				}
				if (this.themesA[i].nValueUpper ||
					this.themesA[i].nValueLower	||
					this.themesA[i].nChartUpper ||
					this.themesA[i].nChartLower ||
					this.themesA[i].nBoxUpper 	||
					this.themesA[i].nTitleUpper ||
					this.themesA[i].nLabelUpper ||
					this.themesA[i].nMaxCharts){
					this.themesA[i].fRedraw = true;
				}
			
			}
			
		} 

		if ( this.themesA[i].fRealize ){
			this.themesA[i].fRedraw = false;
			this.themesA[i].fActualize = false;
		}else
		if ( this.themesA[i].fRedraw ){
			this.themesA[i].fActualize = false;
		}else{
			this.themesA[i].fActualize = true;
		}
		
		lastExecutionTime += this.themesA[i].timeAggregating;
	}
	
	
	if (1 || (lastExecutionTime > 10)) {
		executeWithMessage("map.Themes.execute()", "...", 100);
	} else {
		map.Themes.execute();
	}
	return null;
};
/**
 * resort all chart themes
 * @parameter evt the event
 */
Map.Themes.prototype.resortCharts = function (evt) {

	var fToDo = false;
	if (this.themesA.length) {
		for (var i = 0; i < this.themesA.length; i++) {
			if (this.themesA[i].fDone) {
				this.themesA[i].fResort = true;
				fToDo = true;
			}
		}
		if (fToDo) {
			map.Themes.execute();
		}
	}
	if (evt) {
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * clear the map theme list 
 */
Map.Themes.prototype.clear = function () {
	this.themesA.length = 0;
};







// .............................................................................
// ObjTheme  object that holds information about one layer which is part of a map theme 
// .............................................................................

/**
 * This is the ObjTheme class.  
 * It realizes an object for one layer (theme) which is part of a map theme
 * @constructor
 * @parameter szTheme the name of the layer (theme)
 * @parameter nIndex the index of this part of a map theme
 * @parameter coTable the name of the javascript object which holds external data 
 * @parameter szSelectionField name of the data field that contains the correlation to the map
 * @parameter szItemField name of the data field that identifies the item (if different from selection field)
 * @throws 
 * @return A new ObjTheme object
 */
function ObjTheme(szTheme, nIndex, coTable, szSelectionField, szItemField) {
	/** name of the theme (layer) */
	this.szName = szTheme;
	/** data object assoziated with the theme */
	this.coTable = coTable;
	/** name of the data field that contains the correlation to the map */
	this.szSelectionField = szSelectionField;
	/** name of the data field that identifies the item (if different from selection field */
	this.szItemField = szItemField;
	/** index of the theme (layer) within the map theme */
	this.nIndex = nIndex;
	/** array of indices to find the map theme fields in this layer */
	this.nFieldIndexA = [];
	/** index of the 100 % (fraction,diff) field in this layer */
	this.nField100Index = -1;
	/** index of the selection field of this layer, from this field, the id of the shapes is created */
	this.nFieldSelectionIndex = -1;
	/** Array of indices to selection fields, neccessary for lan/lon coord */
	this.nFieldSelectionIndexA = [];
	/** index of the theme (layer) within the map theme */
	this.nFieldItemIndex = -1;
	/** index of the label field of this layer, from this field, the char label is created */
	this.nValueFieldIndex = -1;
	/** index of the value display field of this layer, from this field, the textual value is created */
	this.nLabelFieldIndex = -1;
	/** if true, the chart objects can be moved synchronously */
	this.leadOffset = false;
}

/**
 * method to resolve the various field names of a theme to the data array column indexes  
 * @return true, if all names could be resolved
 * @type boolean
 */
ObjTheme.prototype.getFields = function () {
	
	this.szFields = this.theme.szFields;
	this.szFieldsA = this.theme.szFields.split('|');
	for (var i in this.szFieldsA) {
		this.szFieldsA[i] = this.szFieldsA[i].trim();
	}
	// GR 17.11.2021 update fields array also in theme object
	this.theme.szFieldsA = this.szFieldsA;

	this.szField100 = this.theme.szField100;
	this.szColorField = this.theme.szColorField;
	this.szSymbolField = this.theme.szSymbolField;
	this.szValueField = this.theme.szValueField;
	this.szLabelField = this.theme.szLabelField;
	this.szTitleField = this.theme.szTitleField;
	this.szSnippetField = this.theme.szSnippetField;
	this.szSizeField = this.theme.szSizeField;
	this.szAlphaField = this.theme.szAlphaField;
	this.szAlphaField100 = this.theme.szAlphaField100;
	this.szXField = this.theme.szXField;
	this.szYField = this.theme.szYField;
	this.szTimeField = this.theme.szTimeField;
	this.szFilterField = this.theme.szFilterField;
	this.szAggregationField = this.theme.szAggregationField;
	this.szSelectionFieldsA = (this.theme.szSelectionField || "").split('|');

	this.nFieldIndexA[0] = -1;
	this.nFieldSelectionIndexA[0] = -1;

	if (this.theme.szSelectionField2) {
		this.szSelectionField2 = (this.theme.szSelectionField2 || null);
		this.szSelectionFields2A = (this.theme.szSelectionField2 || "").split('|');
		this.nFieldSelection2IndexA = [-1];
	}

	var i;
	var j;
	var k;

	var szTableName = this.coTable ? this.coTable : this.szName;

	if (!this.szFields || this.szFields === "") {
		return true;
	}
	try {
		eval("this.dbTable = " + szTableName + ".table");
	} catch (e) {
		try {
			eval("this.dbTable = " + szTableName + "_table");
		} catch (e) {}
	}

	if (this.coTable && !this.dbTable) {
		displayMessage("Data not loaded!", 1000, true);
		return false;
	}
	if (this.dbTable) {
		try {
			eval("this.dbFields = " + szTableName + ".fields");
		} catch (e) {
			try {
				eval("this.dbFields = " + szTableName + "_fields");
			} catch (e) {}
		}
		try {
			if (!this.szSelectionField) {
				this.szSelectionField = map.Layer.getLayerObj(this.szName).szSelection;
			}
		} catch (e) {
			alert("no selection field found !!");
			return false;
		}
		for (j = 0; j < this.dbTable.fields; j++) {
			if (!this.dbFields || (this.dbFields.length === 0) || !this.dbFields[j]) {
				alert("ERROR: theme '" + this.szName + "' - table '" + szTableName + "' - object 'fields' incorrect !");
				return false;
			}
		}

		// GR 27.05.2017 get theme fields from table fields
		if (this.szFields == "$table$") {
			this.szFieldsA = [];
			for (j = 0; j < this.dbFields.length; j++) {
				if ((this.dbFields[j].id != this.szSelectionField) && (this.dbFields[j].id != "Total")) {
					this.szFieldsA.push(this.dbFields[j].id);
				}
			}
			// !! set theme vars after auto-define fields from table !! is important 
			this.theme.szFields = this.szFieldsA.join("|");
			this.theme.szFieldsA = this.szFieldsA;
			this.theme.szLabelA = this.szFieldsA;
		}
		for (j = 0; j < this.dbFields.length; j++) {
			
			// item field to compose the ids of the theme shapes
			if (typeof (this.szItemField) != "undefined" &&
				(String(this.dbFields[j].id).toLowerCase() == String(this.szItemField).toLowerCase())) {
				_TRACE("'" + this.dbFields[j].id + "' found [item] at " + j);
				this.nFieldItemIndex = j;
			}
			// selection field to compose the ids of the theme shapes
			if (typeof (this.szSelectionField) != "undefined" &&
				(String(this.dbFields[j].id).toLowerCase() == String(this.szSelectionField).toLowerCase())) {
				_TRACE("'" + this.dbFields[j].id + "' found [selection] at " + j);
				this.nFieldSelectionIndex = j;
			}
			// selection field to compose the ids of the theme shapes
			if (typeof (this.szSelectionField2) != "undefined") {
				if (String(this.dbFields[j].id).toLowerCase() == String(this.szSelectionField2).toLowerCase()) {
					_TRACE("'" + this.dbFields[j].id + "' found [selection] at " + j);
					this.nFieldSelection2Index = j;
				}
				// multiple selection field (lat/lon)
				for (k = 0; k < this.szSelectionFields2A.length; k++) {
					if (this.dbFields[j].id == this.szSelectionFields2A[k]) {
						_TRACE("'" + this.dbFields[j].id + "' found at " + j);
						this.nFieldSelection2IndexA[k] = j;
					}
				}
			}
			// multiple selection field (lat/lon)
			for (k = 0; k < this.szSelectionFieldsA.length; k++) {
				if (this.dbFields[j].id == this.szSelectionFieldsA[k]) {
					_TRACE("'" + this.dbFields[j].id + "' found at " + j);
					this.nFieldSelectionIndexA[k] = j;
				}
			}
			// get the values
			for (k = 0; k < this.szFieldsA.length; k++) {
				if (this.szFieldsA[k].substr(0, 1) == "!") {
					if (this.dbFields[j].id == this.szFieldsA[k].substr(1, this.szFieldsA[k].length - 1)) {
						_TRACE("'" + this.dbFields[j].id + "' found at " + j);
						this.nFieldIndexA[k] = j;
					}
				} else {
					if (this.dbFields[j].id == this.szFieldsA[k]) {
						_TRACE("'" + this.dbFields[j].id + "' found at " + j);
						this.nFieldIndexA[k] = j;
					}
				}
			}
			// for % values
			if (this.szField100) {
				if (this.dbFields[j].id == this.szField100) {
					_TRACE("'" + this.dbFields[j].id + "' found [100] at " + j);
					this.nField100Index = j;
				}
			}
			// for color selector
			if (this.szColorField) {
				if (this.dbFields[j].id == this.szColorField) {
					_TRACE("'" + this.dbFields[j].id + "' found [color] at " + j);
					this.nColorFieldIndex = j;
				}
			}
			// for symbol selector
			if (this.szSymbolField) {
				if (this.dbFields[j].id == this.szSymbolField) {
					_TRACE("'" + this.dbFields[j].id + "' found [symbol] at " + j);
					this.nSymbolFieldIndex = j;
				}
			}
			// for value display
			if (this.szValueField) {
				if (this.dbFields[j].id == this.szValueField) {
					_TRACE("'" + this.dbFields[j].id + "' found [label] at " + j);
					this.nValueFieldIndex = j;
				}
			}
			// for label
			if (this.szLabelField) {
				if (this.dbFields[j].id == this.szLabelField) {
					_TRACE("'" + this.dbFields[j].id + "' found [label] at " + j);
					this.nLabelFieldIndex = j;
				}
			}
			// for title
			if (this.szTitleField) {
				if (this.dbFields[j].id == this.szTitleField) {
					_TRACE("'" + this.dbFields[j].id + "' found [title] at " + j);
					this.nTitleFieldIndex = j;
				}
			}
			// for title
			if (this.szSnippetField) {
				if (this.dbFields[j].id == this.szSnippetField) {
					_TRACE("'" + this.dbFields[j].id + "' found [snippet] at " + j);
					this.nSnippetFieldIndex = j;
				}
			}
			// for size
			if (this.szSizeField) {
				if (this.dbFields[j].id == this.szSizeField) {
					_TRACE("'" + this.dbFields[j].id + "' found [size] at " + j);
					this.nSizeFieldIndex = j;
				}
			}
			// for time stamp
			if (this.szTimeField) {
				if (this.dbFields[j].id == this.szTimeField) {
					_TRACE("'" + this.dbFields[j].id + "' found [time] at " + j);
					this.nTimeFieldIndex = j;
				}
			}
			// for PLOTXY
			if (this.szXField) {
				if (this.dbFields[j].id == this.szXField) {
					_TRACE("'" + this.dbFields[j].id + "' found [xfield] at " + j);
					this.nXFieldIndex = j;
				}
			}
			// for PLOTXY
			if (this.szYField) {
				if (this.dbFields[j].id == this.szYField) {
					_TRACE("'" + this.dbFields[j].id + "' found [yfield] at " + j);
					this.nYFieldIndex = j;
				}
			}
			// for alpha by value
			if (this.szAlphaField) {
				if (this.dbFields[j].id == this.szAlphaField) {
					_TRACE("'" + this.dbFields[j].id + "' found [alpha] at " + j);
					this.nAlphaFieldIndex = j;
				}
			}
			if (this.szAlphaField100) {
				if (this.dbFields[j].id == this.szAlphaField100) {
					_TRACE("'" + this.dbFields[j].id + "' found [alpha100] at " + j);
					this.nAlphaField100Index = j;
				}
			}
			// for filter
			if (this.szFilterField) {
				if (this.dbFields[j].id == this.szFilterField) {
					_TRACE("'" + this.dbFields[j].id + "' found [filter] at " + j);
					this.nFilterFieldIndex = j;
				}
			}
			// for aggregation
			if (this.szAggregationField) {
				if (this.dbFields[j].id == this.szAggregationField) {
					_TRACE("'" + this.dbFields[j].id + "' found [title] at " + j);
					this.nAggregationFieldIndex = j;
				}
			}
		}
		if ((this.nFieldSelectionIndex == -1) && (this.nFieldSelectionIndexA[0] == -1)) {
			if (!this.szSelectionField || !this.szSelectionField.length) {
				_ERROR("ERROR on load theme data: selection not defined !");
			} else {
				_ERROR("ERROR on load theme data: selection field '" + this.szSelectionField + "' not found !");
			}
		}
		for (k = 0; k < this.szFieldsA.length; k++) {
			if (typeof (this.nFieldIndexA[k]) == 'undefined') {
				_ERROR("ERROR on load theme data: value field '" + this.szFieldsA[k] + "' not found !");
				return false;
			}
		}
		// GR 20.02.2018 check
		if (this.szField100 && !this.szField100.match(/\$/) && (typeof (this.nField100Index) == 'undefined')) {
			_ERROR("ERROR on load theme data: 100field '" + this.szField100 + "' not found !");
		}
		if (this.szColorField && !this.szColorField.match(/\$/) && (typeof (this.nColorFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: colorfield: '" + this.szColorField + "' not found !");
		}
		if (this.szSymbolField && !this.szSymbolField.match(/\$/) && (typeof (this.nSymbolFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: symbolfield: '" + this.szSymbolField + "' not found !");
		}
		if (this.szValueField && !this.szValueField.match(/\$/) && (typeof (this.nValueFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: valuefield: '" + this.szValueField + "' not found !");
		}
		if (this.szLabelField && !this.szLabelField.match(/\$/) && (typeof (this.nLabelFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: labelfield '" + this.szLabelField + "' not found !");
		}
		if (this.szTitleField && !this.szTitleField.match(/\$/) && (typeof (this.nTitleFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: titlefield '" + this.szTitleField + "' not found !");
		}
		if (this.szSnippetField && !this.szSnippetField.match(/\$/) && (typeof (this.nSnippetFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: snippetfield '" + this.szSnippetField + "' not found !");
		}
		if (this.szSizeField && !this.szSizeField.match(/\$/) && (typeof (this.nSizeFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: sizefield '" + this.szSizeField + "' not found !");
		}
		if (this.szTimeField && !this.szTimeField.match(/\$/) && (typeof (this.nTimeFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: timefield '" + this.szTimeField + "' not found !");
		}
		if (this.szXField && !this.szXField.match(/\$/) && (typeof (this.nXFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: xfield '" + this.szXField + "' not found !");
		}
		if (this.szYField && !this.szYField.match(/\$/) && (typeof (this.nYFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: yfield '" + this.szYField + "' not found !");
		}
		if (this.szAlphaField && !this.szAlphaField.match(/\$/) && (typeof (this.nAlphaFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: alphafield '" + this.szAlphaField + "' not found !");
		}
		if (this.szAlphaField100 && !this.szAlphaField100.match(/\$/) && (typeof (this.nAlphaField100Index) == 'undefined')) {
			_ERROR("ERROR on load theme data: alpha100field '" + this.szAlphaField100 + "' not found !");
		}
		if (this.szFilterField && !this.szFilterField.match(/\$/) && (typeof (this.nFilterFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: filterfield '" + this.szFilterField + "' not found !");
		}
		if (this.szAggregationField && !this.szAggregationField.match(/\$/) && (typeof (this.nAggregationFieldIndex) == 'undefined')) {
			_ERROR("ERROR on load theme data: aggregationfield '" + this.szAggregationField + "' not found !");
		}
		if (this.szItemField && (this.szItemField != this.szSelectionField) && !this.szItemField.match(/\$/) && ((typeof (this.nFieldItemIndex) == 'undefined') || this.nFieldItemIndex == -1)) {
			alert("ERROR on load theme data: itemfield '" + this.szItemField + "' not found !");
		}
	} else {
		var themeNode = SVGDocument.getElementById(this.szName);
		if (themeNode == null) {
			var themeNodesA = map.Tiles.getTileNodes(this.szName);
			if (themeNodesA) {
				themeNode = themeNodesA[0];
			}
		}
		if (!themeNode) {
			_TRACE(this.szName + '- not found');
			this.szName = "";
			return false;
		}
		var szFields = themeNode.getAttributeNS(szMapNs, "info");
		if (szFields == null || szFields === "") {
			this.szName = "";
			return false;
		}
		var szFieldsA = szFields.split('|');
		for (j = 0; j < szFieldsA.length; j++) {
			// get the values
			for (k = 0; k < this.szFieldsA.length; k++) {
				if (this.szFieldsA[k].substr(0, 1) == "!") {
					if (szFieldsA[j] == this.szFieldsA[k].substr(1, this.szFieldsA[k].length - 1)) {
						_TRACE("'" + szFieldsA[j] + "' found at " + j);
						this.nFieldIndexA[k] = j;
					}
				} else {
					if (szFieldsA[j] == this.szFieldsA[k]) {
						_TRACE("'" + szFieldsA[j] + "' found at " + j);
						this.nFieldIndexA[k] = j;
					}
				}
			}
			// for % values
			if (this.szField100) {
				if (szFieldsA[j] == this.szField100) {
					_TRACE("'" + szFieldsA[j] + "' found [100] at " + j);
					this.nField100Index = j;
				}
			}
			// for color display
			if (this.szColorField) {
				if (szFieldsA[j] == this.szColorField) {
					_TRACE("'" + szFieldsA[j] + "' found [color] at " + j);
					this.nColorFieldIndex = j;
				}
			}
			// for symbol display
			if (this.szSymbolField) {
				if (szFieldsA[j] == this.szSymbolField) {
					_TRACE("'" + szFieldsA[j] + "' found [symbol] at " + j);
					this.nSymbolFieldIndex = j;
				}
			}
			// for value display
			if (this.szValueField) {
				if (szFieldsA[j] == this.szValueField) {
					_TRACE("'" + szFieldsA[j] + "' found [label] at " + j);
					this.nValueFieldIndex = j;
				}
			}
			// for label
			if (this.szLabelField) {
				if (szFieldsA[j] == this.szLabelField) {
					_TRACE("'" + szFieldsA[j] + "' found [label] at " + j);
					this.nLabelFieldIndex = j;
				}
			}
			// for time stamp
			if (this.szTimeField) {
				if (szFieldsA[j] == this.szTimeField) {
					_TRACE("'" + szFieldsA[j] + "' found [size] at " + j);
					this.nTimeFieldIndex = j;
				}
			}
			// for size
			if (this.szSizeField) {
				if (szFieldsA[j] == this.szSizeField) {
					_TRACE("'" + szFieldsA[j] + "' found [size] at " + j);
					this.nSizeFieldIndex = j;
				}
			}
			// for x of PLOTXY
			if (this.szXField) {
				if (szFieldsA[j] == this.szXField) {
					_TRACE("'" + szFieldsA[j] + "' found [size] at " + j);
					this.nXFieldIndex = j;
				}
			}
			// for y of PLOTXY
			if (this.szYField) {
				if (szFieldsA[j] == this.szXField) {
					_TRACE("'" + szFieldsA[j] + "' found [size] at " + j);
					this.nYFieldIndex = j;
				}
			}
			// for alpha by value
			if (this.szAlphaField) {
				if (szFieldsA[j] == this.szAlphaField) {
					_TRACE("'" + szFieldsA[j] + "' found [alpha] at " + j);
					this.nAlphaFieldIndex = j;
				}
			}
			if (this.szAlphaField100) {
				if (szFieldsA[j] == this.szAlphaField100) {
					_TRACE("'" + szFieldsA[j] + "' found [alpha100] at " + j);
					this.nAlphaField100Index = j;
				}
			}
		}
	}
	for (k = 0; k < this.szFieldsA.length; k++) {
		if (this.nFieldIndexA[k] < 0) {
			if (!((this.szFieldsA[k] == "$item$") || (this.szFieldsA[k] == "$index$"))) {
				_ERROR("ERROR on load theme data: '" + this.szFieldsA[k] + "' not found !");
			}
			this.szName = "";
		}
	}
	return true;
};





// .............................................................................
// MapTheme   
// .............................................................................

/**
 * This is the MapTheme class.  
 * It realizes an object for map themes (colorized shapes, charts, ...)
 * @constructor
 * @parameter mapThemes the map layer(themes) to include into the new map theme
 * @parameter szField the name of the field to take the value
 * @parameter szField100 the name of the field to take the fraction value (for % analysis)
 * @parameter szFlag defines the type of the theme and representation details
 * @parameter colorScheme defines the colors to visualize the map theme; the number of colors in the scheme defines the number of classes (bars, pieparts, etc.)
 * @parameter szTitle title text to be displayed in the info pane of the map theme
 * @throws 
 * @return A new MapTheme object
 */
function MapTheme(szThemes, szFields, szField100, szFlag, colorScheme, szTitle, szLabelA) {

	var i;

	this.fDone = false;

	/** minimum value (found) of the theme */
	this.nMin = Number.MAX_VALUE;
	/** maximum value (found) of the theme */
	this.nMax = (-Number.MAX_VALUE);
	/** sum of all values (found) of the theme */
	this.nSum = 0;
	/** number of values of the theme */
	this.nCount = 0;
	/** number of no data values of the theme */
	this.nNoData = 0;

	this.szThemes = szThemes || "";
	this.szThemesA = szThemes.split('|');

	this.checkTheme();

	this.objThemesA = [];

	this.szFields = szFields || "$item$";
	this.szFieldsA = this.szFields.split('|');
	this.szField100 = szField100 || "";

	this.nFieldsA = [];
	this.nFields100A = [];
	this.nFieldsSelectionA = [];

	this.nMinA = [];
	this.nMaxA = [];
	this.nSumA = [];
	this.nMeanA = [];
	this.nMedianA = [];
	this.nDeviationA = [];
	this.nOrigMinA = [];
	this.nOrigMaxA = [];
	this.nOrigSumA = [];
	for (i = 0; i < this.szFieldsA.length; i++) {
		this.nMinA[i] = Number.MAX_VALUE;
		this.nMaxA[i] = (-Number.MAX_VALUE);
		this.nSumA[i] = 0;
		this.nOrigMinA[i] = Number.MAX_VALUE;
		this.nOrigMaxA[i] = (-Number.MAX_VALUE);
		this.nOrigSumA[i] = 0;
		this.nMedianA[i] = 0;
		this.nMeanA[i] = 0;
	}
	this.nMin100 = Number.MAX_VALUE;
	this.nMax100 = (-Number.MAX_VALUE);
	this.nSum100 = 0;

	// GR 03.08.2007 size by sizefield
	this.nMinSize = Number.MAX_VALUE;
	this.nMaxSize = (-Number.MAX_VALUE);
	this.nSumSize = 0;

	// GR 22.09.2013 alpha by alphafield
	this.nMinAlpha = Number.MAX_VALUE;
	this.nMaxAlpha = (-Number.MAX_VALUE);
	this.nSumAlpha = 0;

	// GR 22.07.2018 PLOTXY xfield
	this.nMinX = Number.MAX_VALUE;
	this.nMaxX = (-Number.MAX_VALUE);
	this.nSumX = 0;

	// GR 22.07.2018 PLOTXY xfield
	this.nMinY = Number.MAX_VALUE;
	this.nMaxY = (-Number.MAX_VALUE);
	this.nSumY = 0;

	this.szDominantFilter = null;
	this.nDominantDFilter = null;

	this.nFilterA = [];

	this.dbTableA = [];
	this.dbFieldsA = [];
	this.dbRecordsA = [];

	// GR 10.10.2006 copy the array to be independent from caller
	/** the colorscheme defined for the theme */
	if (colorScheme) {
		this.origColorScheme = [];
		for (i in colorScheme) {
			this.origColorScheme[i] = colorScheme[i];
		}
	} else {
		this.origColorScheme = null;
	}
	/** a default colorscheme, used if no colorscheme defined */
	this.defaultColorScheme = new Array("#008888", "#00aaaa", "#00cccc", "#00eeee", "#00ffff");
	/** a textstring used as title for the info pane */
	this.szTitle = szTitle ? szTitle : szThemes + " [" + szFields + "]";
	this.szTitle = map.Dictionary.getLocalText(this.szTitle);
	this.szTitle = (this.szTitle.length > 60) ? (this.szTitle.slice(0, 50) + " ...") : this.szTitle;
	/** textstrings used as value unit */
	this.szUnits = "";
	/** textstrings used as unit for size value display */
	this.szSizeValueUnits = null;
	/** textstrings used as unit for alpha value display */
	this.szAlphaValueUnits = null;
	/** textstrings used as value unit */
	this.szXaxisA = null;
	/** textstrings to be used as legend label */
	this.szLabelA = szLabelA;
	/** textstrings preserve the original label */
	this.szOrigLabelA = szLabelA;
	/** textstrings to store the really used legend label */
	this.szLegendLabelA = [];
	/** textstrings to hold flags for the legend style */
	this.szLegendStyle = "";
	/** evidence sigle shapes by highlight, or by fading out th other */
	this.evidenceMode = "isolate";
	/** method to aggregate theme values, for overviewcharts and selections */
	this.szAggregation = "sum";
	/** all values found */
	this.nValuesA = [];

	/** all exact values (string allowed) defined or generated */
	this.szValuesA = null;
	/** all ranges defined or generated */
	this.szRangesA = null;
	/** all ranges defined or generated */
	this.szExactA = null;

	/** the items of the theme */
	this.itemA = [];

	/** flag: to indicate the if layer is switched on/off (may be by scale)*/
	this.fVisible = true;
	/** flag: if true, reload data always */
	this.fDataCache = true;
	/** flag: if true, don't load data */
	this.fEditor = false;
	/** flag: if true, 0 (zero) is a valued */
	this.fNullIsValue = true;
	/** flag: if true, negative values are allowed */
	this.fNegativeValuePossible = true;
	/** flag: if true, negative values are allowed */
	this.fUndefinedValuePossible = true;
	/** running counter to convert stringd (exact values) to number */
	this.nStringToValue = 1;
	/** running counter to convert stringd (exact values) to number */
	this.nStringToValueA = [];
	/** flag: holds the flag that defines the theme type, info pane style, ...) */
	this.szFlag = szFlag ? szFlag : "CHOROPLETH";
	/** holds the original flag */
	this.szOrigFlag = this.szFlag;
	/** the scaling of the chart objects */
	this.nScale = 1.0;
	/** the scaling of the chart value labels */
	this.nValueScale = 1.0;
	/** a refresh timeout in seconds */
	this.nRefreshTimeout = 0;
	/** holds the (created) unique id of the theme */
	this.szId = "theme" + String(Math.random());
	/** holds the type of the theme layer (for paint) */
	this.szShapeType = "polygon";
	var layerInfo = map.Layer.getLayerObj(this.szThemesA[0]);
	if (layerInfo) {
		this.szShapeType = layerInfo.szType;
		if (this.szShapeType == "line" && this.szOrigFlag.match(/BUFFER/)) {
			this.szShapeType += "+buffer";
		}
	}
	/** layer not present, maybe scaledepentent */
	this.hiddenLayerA = [];

	_TRACE("new MapTheme(" + szThemes + "," + szFields + "," + szField100 + "," + szFlag + "," + colorScheme + ")");

	// workaround for older style definitions
	if (!this.szFlag.match(/CHART/)) {
		if (this.szFlag.match(/PIE/)) {
			this.szOverviewChart = "PIE";
		} else if (this.szFlag.match(/DONUT/)) {
			this.szOverviewChart = "DONUT";
		}
	}
	if (this.szFlag.match(/ZEROISNOTVALUE/)) {
		this.fNullIsValue = false;
	}
	if (this.szFlag.match(/ZEROISVALUE/)) {
		this.fNullIsValue = true;
	}
	if (this.szFlag.match(/NEGATIVEISNOTVALUE/)) {
		this.fNegativeValuePossible = false;
	}
	if (this.szFlag.match(/NEGATIVEISVALUE/)) {
		this.fNegativeValuePossible = true;
	}
	if (this.szFlag.match(/UNDEFINEDISVALUE/)) {
		this.fUndefinedValuePossible = true;
	}
	if (this.szFlag.match(/UNDEFINEDISNOTVALUE/)) {
		this.fUndefinedValuePossible = false;
	}
	if (this.szFlag.match(/SUM/)) {
		this.szAggregation = "sum";
	}
	if (this.szFlag.match(/MEAN/)) {
		this.szAggregation = "mean";
	}
	if (this.szFlag.match(/MAX/)) {
		this.szAggregation = "max";
	}
	// GR 16.01.2007 charts must have 0 value
	if (this.szFlag.match(/CHART/)) {
		if (this.szFlag.match(/CATEGORICAL/) || this.szFieldsA.length > 1) {
			this.fNullIsValue = true;
		}
		// GR 20.09.2011 charts preset with shadow
		if (!this.szFlag.match(/BUFFER/)) {
			this.fShadow = this.fOrigShadow = true;
		}
	}
	// GR 13.12.2020 CATEGORICAL must not have negative values
	if (this.szFlag.match(/CATEGORICAL/) && !this.szFlag.match(/AGGREGATE/)) {
		this.fNegativeValuePossible = false;
	}
	// GR 25.04.2011 CATEGORICAL must have szLabelA
	if (this.szFlag.match(/CATEGORICAL/) && !this.szLabelA) {
		this.szLabelA = [];
	}
	/** if true, the chart drawing will be clipped to the visible map area */
	this.fClipCharts = true;

	/** if true, the chart will be sorted before drawn */
	this.fSortBeforeDraw = true;

	/** if true, color scheme legend classes with no members will be grayed */
	this.fGrayNoMember = true;

	/** minimal duration of one frame */
	this.nClipTimeout = 1000;

	/** array to hold all painted shapes */
	this.paintedShapeNodesA = [];

	/** flag to define the info style for CHOROPLETH values **/
	this.szChoroplethInfoStyle = map.Themes.szChoroplethInfoStyle;

	/** defines the max number of charts per theme **/
	this.nMaxThemeCharts = map.Themes.nMaxThemeCharts;

	/** defines the max number of shadowed charts per theme **/
	this.nMaxShadowCharts = map.Themes.nMaxShadowCharts;

	/** defines the number of shapes color changes after which the display will be updated **/
	this.nflushPaintShape = map.Themes.nflushPaintShape;

	/** defines the number of charts after which the display will be updated **/
	this.nflushChartDraw = map.Themes.nflushChartDraw;

	/** array to hold all map shape nodes used; used to accellerate */
	this.themeNodesPosA = this.szFlag.match(/AGGREGATE|GROUP/) ? [] : map.Themes.themeNodesPosA;

	/** object to define style getter and setter */
	this.style = {theme:this};
	/** set theme properties  */
	this.setProperties = function(obj){
		this.szFields = obj.field || obj.fields || this.szFields;
		this.szField100 = obj.field100 || this.szField100;
		this.szFieldsA = szFields.split('|');
		this.style.setProperties(obj);
	}
	/** set theme.style properties  */
	this.style.setProperties = function(styleObj){
		map.Themes.parseStyle(this.theme,styleObj);
	}
}
/**
 * check the theme; check presence of theme layers
 */
MapTheme.prototype.checkTheme = function () {

	if (!this.szThemesA) {
		return false;
	}
	for (var i = 0; i < this.szThemesA.length; i++) {
		if ((this.szThemesA[i] == "generic") || map.Layer.isLoaded(this.szThemesA[i])) {
			return true;
		}
	}
	this.ErrorMessage = "theme layer not loaded ! zoom in ?";
	return false;
};
/**
 * get the theme definition object
 */
MapTheme.prototype.def = function () {

	return map.Themes.getMapThemeDefinitionObj(this.szId);
};
/**
 * get the theme definition object
 * long form of function name 
 */
MapTheme.prototype.getDefinitionObject = function () {

	return map.Themes.getMapThemeDefinitionObj(this.szId);
};

/**
 * set the theme definition object
  */
MapTheme.prototype.set = function (styleObj) {

	map.Themes.parseStyle(this,styleObj);
};

/**
 * set the theme definition object
 * long form of function name 
 */
MapTheme.prototype.setDefinitionObject = function (styleObj) {

	map.Themes.parseStyle(this,styleObj);
};

/**
 * initialize the map theme values
 */
MapTheme.prototype.initValues = function () {

	this.nMin = Number.MAX_VALUE;
	this.nMax = (-Number.MAX_VALUE);
	this.nSum = 0;
	this.nCount = 0;
	this.nNoData = 0;

	for (var i = 0; i < this.szFieldsA.length; i++) {
		this.nMinA[i] = Number.MAX_VALUE;
		this.nMaxA[i] = (-Number.MAX_VALUE);
		this.nSumA[i] = 0;
		this.nOrigMinA[i] = Number.MAX_VALUE;
		this.nOrigMaxA[i] = (-Number.MAX_VALUE);
		this.nOrigSumA[i] = 0;
		this.nMedianA[i] = 0;
		this.nMeanA[i] = 0;
		this.nDeviationA[i] = 0;
	}

	this.nMin100 = Number.MAX_VALUE;
	this.nMax100 = (-Number.MAX_VALUE);
	this.nSum100 = 0;

	this.itemA = [];
	this.posItemA = [];
	this.chartPosA = [];
	this.exactCountA = [];
	this.exactSizeA = [];
	this.quantileA = [];

	if (!this.szAggregation) {
		if (this.szField100) {
			this.szAggregation = "mean";
		} else {
			this.szAggregation = "sum";
		}
	}
	// GR 24.03.2016 new: aggregation by scale (different aggregation fields with scale lower range)
	// GR 27.01.2017 may be suppressed by maptheme.changeThemeStyle() via this.fSuppressAggregationScale
	// 
	if (this.szAggregationFieldA && !this.fSuppressAggregationScale) {
		for (var a = 0; a < this.szAggregationFieldA.length; a++) {
			var lower = Number(this.szAggregationFieldA[a].split(':')[1]);
			if (lower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > lower)) {
				if (!isNaN(parseFloat(this.szAggregationFieldA[a + 1]))) {
					if (this.szAggregationFieldA[a + 1].match(/px/)) {
						this.nGridWidthPx = parseFloat(this.szAggregationFieldA[a + 1]);
					} else {
						this.nGridWidth = parseFloat(this.szAggregationFieldA[a + 1]);
						this.nGridWidthPx = 0;
					}
					this.szAggregationField = null;
				} else {
					this.szAggregationField = this.szAggregationFieldA[a + 1];
				}
			}
			a++;
		}
	}
	this.fSuppressAggregationScale = false;
	this.nWrongRecordLengthCount = 0;

	this.missedA = [];

	// GR 15.04.2018 new: if no external data defined for the theme,
	// try to load the data from the meta data of the map layer
	// and create a data table object
	// give it the name "genericTable" so we can distinguish it from 'real' external data 
	// -----------------------------------------------------------------------------------
	if (!this.coTable || (this.coTable == "genericTable")) {
		if (this.loadTableFromMap()) {
			this.coTable = "genericTable";
		}
	}
};

/**
 * initialize the map theme values
 */
MapTheme.prototype.removeValues = function () {

	this.itemA = null;
	this.posItemA = null;
	this.chartPosA = null;
	this.exactCountA = null;
	this.exactSizeA = null;
	this.quantileA = null;

	this.missedA = null;
};

/**
 * get sorted value arrays for QUANTILE and calcolate mean and median
 * @return void
 */
MapTheme.prototype.getMeanMedianQuantile = function () { 
															
	// if already done, do nothing 
	if (this.quantileA && this.quantileA.length) {
		return;
	}
	// GR 09.02.2023 this.szFieldsA -> this.nMaxA (this.nMaxA must have been calculated by data loading)
	for (var i = 0; i < this.nMaxA.length; i++) {
		var quantileA = [];
		var nSum = 0;
		for (var a in this.itemA) {
			quantileA.push(this.itemA[a].nValuesA[i]);
			nSum += this.itemA[a].nValuesA[i];
		}
		if (this.szFieldsA[i] && (this.szFieldsA[i] != "$item$")) {
			quantileA.sort(this.sortUp);
		}
		var nMedianMember = Math.round(quantileA.length / 2);
		this.nMedianA[i] = quantileA[nMedianMember];
		this.nMeanA[i] = nSum / quantileA.length;
		this.quantileA[i] = quantileA;
	}
};

/**
 * realize the map theme
 */
MapTheme.prototype.realize = function () {

	_TRACE(" ");
	_TRACE("========================> ");
	_TRACE("== MapTheme.realize() ==> ");
	_TRACE("========================> ");
	_TRACE(this.szFlag);
	_TRACE(" ");
	
	_LOG("theme realize start - "+this.szId);
	
	if (this.szFlag.match(/WMS/)) {
		
		if ( !this.chartGroup ){
			this.chartGroup = map.Dom.newGroup(map.Layer.layerNode, this.szThemesA[0]);
			map.Layer.listA[this.szThemesA[0]] = new Map.Layer.Item(null);
			map.Layer.listA[this.szThemesA[0]].szName = this.szThemesA[0];
			this.fDone = true;
			this.isChecked = true;
		}
		
		var mapGeoBounds = map.Zoom.getBoundsOfMapInGeoBounds();
		var width = map.Scale.viewBox.width/map.Zoom.nZoomX;
		var height = map.Scale.viewBox.height/map.Zoom.nZoomY;
		
		var imageWidth  = map.Scale.bBox.width/20;
		var imageHeight = map.Scale.bBox.height/20;
		
		if (this.nChartLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nChartLower)) {
			map.Dom.clearGroup(this.chartGroup);
			return;
		}
		if (this.nChartUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nChartUpper)) {
			map.Dom.clearGroup(this.chartGroup);
			return;
		}
		var newShape = map.Dom.constructNode('image', this.chartGroup, {
			'xlink:href': this.szServer+'?f=image&transparent=true&bbox='+
			mapGeoBounds[0].x+','+
			mapGeoBounds[0].y+','+
			mapGeoBounds[1].x+','+
			mapGeoBounds[1].y+'&bboxSR=4326&size='+
			imageWidth+','+
			imageHeight+'',
			'x':-map.Scale.mapCenter.x/map.Zoom.nZoomX-width/2,
			'y':-map.Scale.mapCenter.y/map.Zoom.nZoomY-height/2,
			'style':'width:'+width+';height:'+height+''+";opacity:"+(this.nOpacity||0.8)+";pointer-events:none;",
			'onload':'map.Themes.getTheme("'+this.szId+'").cleanWMS();'
		});
		
		this.fDone = true;
		return;
	}

	// check if chart theme (visible) depends on FEATURE layer theme and control FEATURE theme done 
	if (this.szFlag.match(/CHART/) ){
		if ( (!this.nChartLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nChartLower)) &&
		     (!this.nChartUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nChartUpper)) ){
			var themes = map.Themes.getAllThemes();
			for ( i in themes ){
				if ( (themes[i] != this) && 
					 (themes[i].szFlag.match(/FEATURE/)) && 
					 (themes[i].szThemesA[0] == this.szThemesA[0]) && 
					 !themes[i].fDone ) {
					this.fRealize = true;
					setTimeout("map.Themes.execute()",500);
					return;
				}
			}
		}
	}

	var x = new Date();

	this.fShowProgressBar = true;

	this.initValues();

	if (!this.getFields()) {
		this.fRemove = true;
		return;
	}
	if (!this.loadValues()) {
		this.fRemove = true;
		return;
	}
	
	// GR 27.02.2021 POSITION now all here 
	// don't create SVG objects but only entries in map.Themes.themeNodesPosA[]
	// --------------------------------------------------------------------------
	if (this.szFlag.match(/\bPOSITION\b/)) {
		_LOG("start");

		var szTheme  = this.szThemesA[0];
		var objTheme = this.objThemesA[szTheme];
		var itemIndex = objTheme.nFieldItemIndex;
		var latIndex = objTheme.nFieldSelectionIndexA[0];
		var lonIndex = objTheme.nFieldSelectionIndexA[1];
		for ( var i in objTheme.dbRecords){
			map.Themes.themeNodesPosA[szTheme+"::"+objTheme.dbRecords[i][itemIndex]] =
				map.Scale.getMapPositionOfLatLon(
					Number(objTheme.dbRecords[i][latIndex].replace(",",".")),
					Number(objTheme.dbRecords[i][lonIndex].replace(",","."))
				);
		}
		_LOG("stop");

		this.fAnalyze = false;
		this.fDraw = false;
		this.fDone = true;
		return;
	}
	// --- end POSITION ---------------------------------------------------------
	
	this.fDone = false;

	this.timeLoading = new Date() - x;

	if (((this.timeLoading > 1000) || this.szFlag.match(/VERBOSE/)) && !this.szFlag.match(/SILENT/)) {
		executeWithMessage("map.Themes.executeContinue();", this.szFlag.match(/AGGREGATE/) ? "aggregating" : "parsing data");
	} else {
		map.Themes.executeContinue();
	}
};

/**
 * remove old image from WMS Layer
 */
MapTheme.prototype.cleanWMS  = function () {
	if ( this.chartGroup.childNodes.length > 1 ){
		this.chartGroup.removeChild(this.chartGroup.firstChild);
	}
}

/**
 * remove all images from WMS Layer
 */
MapTheme.prototype.clearWMS  = function () {
	map.Dom.clearGroup(this.chartGroup);
}

/**
 * realize the map theme
 */
MapTheme.prototype.realize_analyze = function () {

	_TRACE("=============================>");
	_TRACE("  MapTheme.realize_analyze()");
	_TRACE("=============================>");

	var x = new Date();

	_TRACE("distributeValues ---->");
	this.fDraw = this.distributeValues();
	_TRACE("---> done");
	
	// if we have an error on this.distributeValues(), we must end the realizing
	if (!this.fDraw){
		this.realizeDone();
	}

	this.timeAggregating = new Date() - x;
	//this.fDraw = true;
	if ((this.timeLoading > 1000 || this.szFlag.match(/VERBOSE/)) && !this.szFlag.match(/SILENT/)) {
		executeWithMessage("map.Themes.executeContinue();", "drawing");
	} else {
		map.Themes.executeContinue();
	}
};


/**
 * realize the map theme
 */
MapTheme.prototype.realize_draw = function () {
	
	
	var layerInfo = map.Layer.getLayerObj(this.szThemesA[0]);
	if (layerInfo) {
		this.szShapeType = layerInfo.szType;
		if (this.szShapeType == "line" && this.szOrigFlag.match(/BUFFER/)) {
			this.szShapeType += "+buffer";
		}
	}
	if (this.szOrigFlag.match(/FEATURES/) && this.szOrigFlag.match(/LINES/)){
		this.szShapeType = "line";
	}

	// GR 20.10.2021 new theme type modifier flag to show theme extend
	// now in realize done
	if (0 && this.szFlag.match(/SHOW/)) {
		this.removeDefinitionFromFlag("SHOW");
		this.zoomTo();
		this.zoomTo();
		this.realize_draw();
		return;
	}

	_TRACE("===========================> ");
	_TRACE("  MapTheme.realize_draw() ");
	_TRACE("===========================> ");
	_TRACE(this.szFlag);
	
	_LOG("theme draw start - "+this.szId);

	this.timeStart = new Date();

	_TRACE("get shapes in cache ---->");
	//this.getShapes();
	_TRACE("---> done");

	this.nDoneCount = 0;
	this.nSkipCount = 0;
	this.nRealizedCount = 0;
	this.nZeroValueCount = 0;
	this.nMissingRangeCount = 0;
	//this.nMissingPositionCount = 0;
	//this.missedA = [];
	this.nActualFrame = 0;

	var szDrawing = (this.szFlag.match(/VERBOSE/)) ? "drawing" : "";

	// make the theme creation 'multitasking'
	// -------------------------------------

	this.mapSleep = new Map.Sleep("map.Themes.executeContinue", this.nflushPaintShape, map.Dictionary.getLocalText(szDrawing));
	this.mapSleep.nCount = this.nCount;
	this.mapSleep.szCancel = "map.Themes.cancelExecute()";
	if (this.szFlag.match(/\bCLIP\b/)) {
		this.mapSleep = null;
		this.nClipIncr = 1;
	}

	// the main theme creation is here
	// -------------------------------

	if (this.szFlag.match(/FEATURE/)) {
		this.mapSleep = null;
		this.unpaintMap();
		this.chartMap();
	} else
	if (this.szFlag.match(/CHART/)) {
		if (this.mapSleep) {
			this.mapSleep.initCheckSleep(this.nflushChartDraw, szDrawing);
			// 04.09.2018 test
			this.mapSleep.fShowProgressBar = true;
		}
		//this.unpaintMap();
		this.chartMap();
	} else {
		this.unlabelMap();
		this.paintMap();
		this.makeVisible();
	}
	this.isChecked = true;

	// -------------------------------

	if (!(this.szFlag.match(/CHART/)) ||
		(this.szFlag.match(/BUBBLE/) || this.szFlag.match(/SQUARE/) || this.szFlag.match(/SYMBOL/)) ||
		(this.szFlag.match(/BAR/) && (this.colorScheme && this.nOrigSumA && this.nOrigSumA.length != this.colorScheme.length))) {
		this.isMarkable = true;
	} else {
		this.isMarkable = false;
	}
};

/**
 * continue realizing the map theme with a given startIndex
 * @param startIndex the next theme part index to ralize 
 * @return void
 */
MapTheme.prototype.realizeContinue = function (startIndex) {
	_TRACE("realizeContinue");
	if (this.fMakeLabel) {
		this.labelMap(startIndex);
	} else
	if (this.szFlag.match(/CHART/)) {
		this.chartMap(startIndex);
	} else {
		this.paintMap(startIndex);
	}
};

/**
 * realize the next clip frame,
 * if LOOP is set don't stop at the last frame
 * if BACK is set, step back through frames 
 * @return void
 */
MapTheme.prototype.realizeNextClipFrame = function () {
	_TRACE("realizeNextFrame");
	
	if (!this.szFlag.match(/\bCLIP\b/)) {
		return;
	}

	if (this.fClipPause) {
		return;
	}
	
	// needed for timeouts
	var szId = this.szId;
	
	this.nActualFrame += this.nClipIncr;
	if (this.nActualFrame >= this.nClipFrames) {
		if (this.szFlag.match(/BACK/)) {
			this.nClipIncr = -this.nClipIncr;
			this.clipTimeout = setTimeout(function(){map.Themes.nextClipFrame(szId);}, 1000);
			return;
		}
		if (this.szFlag.match(/LOOP/)) {
			this.nActualFrame = -1;
			this.clipTimeout = setTimeout(function(){map.Themes.nextClipFrame(szId);}, 1000);
			return;
		} else {
			this.nActualFrame = this.nClipFrames - 1;
			this.pauseClip();
			return;
		}
	}
	if (this.nActualFrame < 0) {
		if (this.szFlag.match(/BACK/)) {
			this.nClipIncr = -this.nClipIncr;
			this.clipTimeout = setTimeout(function(){map.Themes.nextClipFrame(szId);}, 10);
			return;
		} else {
			this.nActualFrame = 0;
			this.pauseClip();
			return;
		}
	}
	//displayMessage("... " + this.nActualFrame + " ...", 5000);
	this.mapSleep = null;
	if (this.szFlag.match(/CHART/)) {
		this.chartPosA = [];
		this.posItemA = [];
		this.fDone = false;
		this.fRedraw = true;
		if (this.nMaxCharts) {
			//this.unpaintMap();
		}
		this.chartMap();
	} else {
		this.paintMap();
	}
	this.fRedrawInfo = true;
};

/**
 * realize a specific clip frame,
 * @param the frame number
 */
MapTheme.prototype.setClipFrame = function (n) {
	_TRACE("setClipFrame: " + n);
	this.fClipPause = true;
	this.nActualFrame = Math.min(n, this.nClipFrames);
	this.mapSleep = null;
	if (this.szFlag.match(/CHART/)) {
		this.chartPosA = [];
		this.posItemA = [];
		this.fDone = false;
		//this.unpaintMap();
		this.chartMap();
	} else {
		this.paintMap();
	}
	this.fRedrawInfo = true;
};

/**
 * continue realizing the map theme with a given startIndex
 * @param startIndex the next theme part index to ralize 
 */
MapTheme.prototype.startClip = function (n) {
	_TRACE("startClip");
	var pauseButtonNode = SVGDocument.getElementById(this.szId + ":display:widget:clippausebutton:button");
	if (pauseButtonNode) {
		pauseButtonNode.style.setProperty("display", "inline", "");
	}
	var startButtonNode = SVGDocument.getElementById(this.szId + ":display:widget:clipstartbutton:button");
	if (startButtonNode) {
		startButtonNode.style.setProperty("display", "none", "");
	}
	this.fClipPause = false;
	this.nActualFrame = n||this.nActualFrame;
	this.realizeNextClipFrame();
};

/**
 * pause realizing the map theme with a given startIndex
 * @param startIndex the next theme part index to ralize 
 */
MapTheme.prototype.pauseClip = function () {
	_TRACE("pauseClip");
	var pauseButtonNode = SVGDocument.getElementById(this.szId + ":display:widget:clippausebutton:button");
	if (pauseButtonNode) {
		pauseButtonNode.style.setProperty("display", "none", "");
	}
	var startButtonNode = SVGDocument.getElementById(this.szId + ":display:widget:clipstartbutton:button");
	if (startButtonNode) {
		startButtonNode.style.setProperty("display", "inline", "");
	}
	if (this.clipTimeout) {
		clearTimeout(this.clipTimeout);
	}
	this.fClipPause = true;
};

/**
 * finish realizing the map theme 
 */
MapTheme.prototype.realizeDone = function () {
	// needed for timeouts
	var szId = this.szId;
	if (this.nRefreshTimeout) {
		if (this.refreshTimeout) {
			clearTimeout(this.refreshTimeout);
		}
		this.refreshTimeout = setTimeout(function(){map.Themes.refreshTheme(szId);}, this.nRefreshTimeout);
	}
	if (this.szFlag.match(/\bCLIP\b/)) {
		if (this.szFlag.match(/\bPAUSE\b/)) {
			this.removeDefinitionFromFlag("PAUSE");
			this.fClipPause = true;
		}
		if (this.szFlag.match(/\bLAST\b/)) {
			this.removeDefinitionFromFlag("LAST");
			var last = (this.nClipFrames-1);
			setTimeout(function(){map.Themes.setClipFrame(szId,last);},10);
		}
		if (this.clipTimeout) {
			clearTimeout(this.clipTimeout);
		}
		this.clipTimeout = setTimeout(function(){map.Themes.nextClipFrame(szId);}, (this.nActualFrame ? this.nClipTimeout : 1000));
	} else {
		// clearMessage();
	}
	if (this.nWrongRecordLengthCount && fDebug) {
		displayMessage("Data Error:  " + this.nWrongRecordLengthCount + " items have wrong record length", 10000, "notify");
	}
	this.fRedraw = false;
	this.fRealize = false;
	this.fDone = true;

	this.timeRealizing = new Date() - this.timeStart;

	_TRACE("<== realize done == ");
	_TRACE(this.szFlag);
	_TRACE(" ");
	_LOG("theme done - "+this.szId);
	
	// GR 16.10.2022 theme type modifier flag to show theme extend now here
	if (this.szFlag.match(/SHOW/)) {
		this.removeDefinitionFromFlag("SHOW");
		this.zoomTo();
	}
	
	map.Themes.realizeDone(this);
};

/**
 * do all things before drawing on the map
 */
MapTheme.prototype.beginDraw = function () {};
/**
 * do all things after drawing on the map
 */
MapTheme.prototype.endDraw = function () {};

/**
 * redraw the map theme
 * @param fEnable if true, get the theme into forground  
 */
MapTheme.prototype.redraw = function (fEnable) { 
	
	_TRACE("MapTheme.redraw() =====>");
	
	if (this.szFlag.match(/FEATURE/)) {
		return;
	}

	// GR 07.11.2013 remove clip rtimeout !
	if (this.clipTimeout) {
		clearTimeout(this.clipTimeout);
	}
	// GR 18.04.2011 see loadValues()
	if (this.fDataIncomplete && (this.__themeNodes != map.Themes.themeNodes)) {
		_TRACE("here we load again!");
		this.fDataIncomplete = false;
		this.initValues();
		this.loadValues();
		this.distributeValues();
	}

	if (this.szFlag.match(/CHART/)) {
		if ((this.fClipCharts) || this.fRedraw) { // && !this.szFlag.match(/CATEGORICAL/)){
			_TRACE("skip=" + this.nSkipCount);
			this.nSkipCount = 0;
			this.nDoneCount = 0;
			this.nRealizedCount = 0;
			this.nZeroValueCount = 0;
			this.nMissingRangeCount = 0;
			this.nMissingPositionCount = 0;
			this.chartMap();
		}
		if (fEnable) {
			this.enable();
		}
	} else {
		if (this.isChecked) {
			if (this.partsA) {
				for (var i = 0; i < this.partsA.length; i++) {
					this.partsA[i].nCount = 0;
					this.partsA[i].nSum = 0;
				}
			}
			if (this.mapSleep) {
				this.mapSleep.initCheckSleep(this.nflushPaintShape, "painting map");
			}
			this.makeVisible();
			this.paintMap();
		}
		if (fEnable) {
			this.enable();
		}
	}
};

/**
 * bring map theme to front
 */
MapTheme.prototype.toFront = function () {
	_TRACE("toFront !!!!! " + this.szId);
	if (this.szFlag.match(/CHART/)) {
		this.chartGroup.parentNode.appendChild(this.chartGroup);

		// GR 21.01.2011 work around to force the browserb to re-render 
		// due to an Chrome error; mixing up chart positions after the re-append
        var matrixA = getMatrix(this.chartGroup);
		if (matrixA) {
			setMatrix(this.chartGroup, matrixA);
		}

		//		this.fRedrawInfo = true;
		this.enable();
	} else {
		if (this.isChecked) {
			for (var i = 0; i < this.partsA.length; i++) {
				this.partsA[i].nCount = 0;
				this.partsA[i].nSum = 0;
			}
			if (this.mapSleep) {
				this.mapSleep.initCheckSleep(this.nflushPaintShape, "painting map");
			}
			this.paintMap();
		} else {
			this.enable();
		}
	}
};

/**
 * find the indices of all fields of the theme
 */
MapTheme.prototype.getFields = function () {

	_TRACE("== MapTheme.getFields() ===> ");

	for (var i = 0; i < this.szThemesA.length; i++) {

		var szTheme = this.szThemesA[i];

		this.objThemesA[szTheme] = new ObjTheme(szTheme, i, this.coTable, this.szSelectionField, this.szItemField);
		this.objThemesA[szTheme].theme = this;
		if (!this.objThemesA[szTheme].getFields()) {
			//			displayMessage("Data '"+this.coTable+"' not found!",2000,true);
			try {
				HTMLWindow.ixmaps.htmlgui_onErrorTheme(szTheme);
			} catch (e) {}
			return false;
		}
	}
	_TRACE("== done === ");
	return true;
};

/**
 * add the values of one item and calcolate min,max and sums
 * its a 'big' function that does a lot of calculations 
 * @parameter szId the id of the corresponding map shape
 * @parameter nValueA the array of values
 * @parameter nValue100 an optional value for the 100%
 * @parameter nValueSize an optional value to size the theme chart 
 * @parameter nValueAlpha an optional value for the theme opacity
 */
MapTheme.prototype.addItemValues = function (szId, nValuesA, nValue100, nValueSize, nValueAlpha) {

	// short way !!!
	// ------------
	if (this.szFlag.match(/RAW/) && !(nValue100 | nValueSize | nValueAlpha)) {

		this.itemA[szId] = {
			nOrigValuesA: [],
			nValuesA: nValuesA,
			nValue100: nValue100,
			nValueSum: 0
		};

		if (1 || !this.szFlag.match(/AGGREGATE/)) {

			for (i = 0; i < nValuesA.length; i++) {
				if (!this.nSumA) {
					return;
				}
				if (!isNaN(nValuesA[i])) {
					this.nMin = Math.min(this.nMin, nValuesA[i]);
					this.nMax = Math.max(this.nMax, nValuesA[i]);
					this.nSum += nValuesA[i];
				}
				if (nValuesA[i] < 0) {
					this.fNegativeValues = true;
				}
				if (this.__fExact && this.exactCountA) {
					if (nValuesA[i]) {
						if (this.exactCountA[nValuesA[i] - 1]) {
							this.exactCountA[nValuesA[i] - 1]++;
							this.exactSizeA[nValuesA[i] - 1] += this.itemA[szId].nSize || 1;
						} else {
							this.exactCountA[nValuesA[i] - 1] = 1;
							this.exactSizeA[nValuesA[i] - 1] = this.itemA[szId].nSize || 1;
						}
					}
				}
			}
		}

		this.nCount++;
		return;
	}
	// ------------

	var i;

	// GR 20.08.2008 handle lookup values to exclude 
	if (this.szExcludeA) {
		for (i = 0; i < this.szExcludeA.length; i++) {
			if (szId.split("::")[1] == this.szExcludeA[i]) {
				return;
			}
		}
	}

	// GR 25.07.2007 QaD test
	/**
	if ( this.szFlag.match(/BUFFER/) && this.szFlag.match(/CHART/) && this.szFields && this.szFields.length && this.szRangesA.length ){
		var fSelect = false;
		for ( i=0; i<rangesA.length; i++ ){
			if ( (nValuesA[0] == this.szRangesA[i]) || (Number(nValuesA[0]) == Number(this.szRangesA[i])) ){
				fSelect = true;
			}
		}
		if ( !fSelect){
			return;
		}
	}
	**/

	// GR 30.08.2007 check minimum for nValue100
	if (this.nField100Min && nValue100 && (nValue100 < this.nField100Min)) {
		return;
	}
	// GR 20.01.2010 check minimum for values
	if (this.nMinValue && nValuesA && !nValue100) {
		var fMinValueOk = false;
		for (var i = nValuesA.length - 1; i >= 0; i--) {
			if (nValuesA[i] >= this.nMinValue) {
				fMinValueOk = true;
			}
		}
		if (!fMinValueOk) {
			return;
		}
	}
	// GR 24.08.2007 calcolate density = value per area
	var nArea = 1;
	if (this.__fDensity || this.__fDensityAlpha) {
		nArea = this.getNodeArea(szId);
		if (!nArea && this.__fTiledLayer) {
			this.fDataIncomplete = true;
			return;
		}
	}
	// GR 23.10.2007 weighted values
	if (this.szWeights) {
		for (var i = 0; i < nValuesA.length; i++) {
			nValuesA[i] *= (this.szWeightsA[i] || this.szWeightsA[0]);
		}
	}
	// GR 23.10.2007 calcolate auto sum 100
	if (this.__fAuto100) {
		var i;
		nValue100 = 0;
		for (i = 0; i < nValuesA.length; i++) {
			nValue100 += nValuesA[i] || 0;
		}
		this.fField100 = true;
	}

	// ------------------------------------------------------------------------------------

	this.itemA[szId] = {
		nOrigValuesA: [],
		nValuesA: nValuesA,
		nValue100: nValue100,
		nValueSum: 0
	};

	// ------------------------------------------------------------------------------------

	for (var i = 0; i < nValuesA.length; i++) {

		this.itemA[szId].nOrigValuesA[i] = !isNaN(nValuesA[i]) ? nValuesA[i] : 0;

		// GR 04.04.2011
		this.itemA[szId].nValueSum += nValuesA[i] || 0;

		if (this.fField100) {
			if (nValue100) {
				var nValue = nValuesA[i];
				// fieldname starting with '!'
				if (nValue === 0 && !this.szFlag.match(/ZEROISVALUE/)) {
					nValue = 0;
				} else
				if (this.szFieldsA[i].substr(0, 1) == "!") {
					nValue = nValue100 - nValue;
					this.itemA[szId].nOrigValuesA[i] = nValue;
				} else
				if (this.szFlag.match(/CALCVAL/) || this.szFlag.match(/CALC100/)) {
					nValue = nValue100 ? Math.round(nValue * nValue100 / 100) : nValue;
					this.itemA[szId].nOrigValuesA[i] = nValue;
				} else
				if (this.szFlag.match(/PRODUCT/)) {
					nValue = nValue100 ? nValue * nValue100 : nValue;
				} else
				if (this.szFlag.match(/DIFFERENCE/) && (nValuesA.length == 1) && !this.szFlag.match(/RELATIVE/)) {
					nValue100 = i > 0 ? nValuesA[i - 1] : this.itemA[szId].nValue100;
					nValue = nValue - nValue100;
				} else {
					nValue = nValue100 ? nValue / nValue100 : 1;
					if (this.szFlag.match(/FRACTION/)) {
						nValue = nValue * (this.nFractionScale || 1);
					} else
					if (this.szFlag.match(/PERMILLE/)) {
						nValue = nValue * 1000;
					} else {
						nValue = nValue * 100;
						if (nValue > 0 && this.szFlag.match(/RELATIVE/)) {
							nValue -= 100;
						} else
						if (nValue > 0 && this.szFlag.match(/INVERT/)) {
							nValue = 100 - nValue;
						} else {
							// GR 07.12.2013 to be verified
							//nValue = Math.min(nValue,100);
						}
					}
				}
				nValuesA[i] = nValue;
			} else {
				nValuesA[i] = 0;
			}
		}

		// GR 24.08.2007 calcolate density = value per area
		if (this.__fDensity) {
			nValuesA[i] = nArea ? (nValuesA[i] / nArea) : null;
		}
	}

	if (this.__fDifference && (nValuesA.length > 1)) {
		for (var i = 0; i < nValuesA.length; i++) {
			if (i < nValuesA.length - 1) {
				var nTemp = nValuesA[i];
				nValuesA[i] = nValuesA[i + 1] - nValuesA[i];
				if (this.szFlag.match(/RELATIVE/)) {
					nValuesA[i] = 100 / nTemp * nValuesA[i];
				}
			} else if (!this.szFlag.match(/STACKED/)) {
				nValuesA[i] = 0;
			}
		}
		nValuesA.pop();
	}


	for (var i = 0; i < nValuesA.length; i++) {

		if (!this.nSumA) {
			return;
		}
		if (!isNaN(nValuesA[i]) && isFinite(nValuesA[i])) {
			this.nMin = Math.min(this.nMin, nValuesA[i]);
			this.nMax = Math.max(this.nMax, nValuesA[i]);
			this.nSum += nValuesA[i];
			this.nMinA[i] = Math.min(this.nMinA[i], nValuesA[i]);
			this.nMaxA[i] = Math.max(this.nMaxA[i], nValuesA[i]);
			this.nSumA[i] += nValuesA[i];
			this.nOrigMinA[i] = Math.min(this.nOrigMinA[i], this.itemA[szId].nOrigValuesA[i]);
			this.nOrigMaxA[i] = Math.max(this.nOrigMaxA[i], this.itemA[szId].nOrigValuesA[i]);
			this.nOrigSumA[i] += this.itemA[szId].nOrigValuesA[i];
		}
		if (nValuesA[i] < 0) {
			this.fNegativeValues = true;
		}
	}

	if (!isNaN(nValue100) && isFinite(nValue100)) {
		this.nMin100 = Math.min(this.nMin100, nValue100);
		this.nMax100 = Math.max(this.nMax100, nValue100);
		this.nSum100 += nValue100;
	}

	// handle size value
	if (this.szSizeField) {
		if (!isNaN(nValueSize) && isFinite(nValueSize)) {
			this.itemA[szId].nSize = nValueSize;
			this.nMinSize = Math.min(this.nMinSize, nValueSize);
			this.nMaxSize = Math.max(this.nMaxSize, nValueSize);
			this.nSumSize += nValueSize;
		}else{
			this.itemA[szId].nSize = 0;
		}
	}
	
	// handle alpha value
	if (this.szAlphaField && (nValueAlpha != null) && !isNaN(nValueAlpha) && isFinite(nValueAlpha) ) {
		if (this.__fDensityAlpha) {
			if (nArea) {
				nValueAlpha = nValueAlpha / nArea;
				nValueAlpha = Math.min(nValueAlpha, 50000);
			} else {
				nValueAlpha = 0;
			}
		}
		this.itemA[szId].nAlpha = nValueAlpha;
		this.nMinAlpha = Math.min(this.nMinAlpha, nValueAlpha);
		this.nMaxAlpha = Math.max(this.nMaxAlpha, nValueAlpha);
		this.nSumAlpha += nValueAlpha;
	}

	if (this.__fExact && this.exactCountA) {
		for (var i = 0; i < nValuesA.length; i++) {
			// GR 16.04.2011
			if (nValuesA[i]) {
				if (this.exactCountA[nValuesA[i] - 1]) {
					this.exactCountA[nValuesA[i] - 1]++;
					this.exactSizeA[nValuesA[i] - 1] += this.itemA[szId].nSize || 1;
				} else {
					this.exactCountA[nValuesA[i] - 1] = 1;
					this.exactSizeA[nValuesA[i] - 1] = this.itemA[szId].nSize || 1;
				}
			}
		}
	}

	this.nCount++;
};

//...................................................................
// we need to translate string values into numbers (for CATEGORICAL themes)
// therefore we use an array of 'string value'/'numeric index' pairs
//...................................................................

/**
 * get the index for a string value
 * if index not yet associated, create new value / index pair 
 * @parameter szValue the string value 
 * @parameter szFlag if 'set', the value is added to the string/value array if not exixts
 * @type number
 * @return associated index
 */
MapTheme.prototype.getStringValueIndex = function (szValue, szFlag) {

	if ((szValue.length === 0) || (szValue == " ")) {
		if (this.szFlag.match(/UNDEFINEDISVALUE/)) {
			szValue = "undefined";
		} else {
			return -1;
		}
	}
	if (this.szFlag.match(/IGNORECASE/)) {
		szValue = szValue.toUpperCase();
	}

	// strip trailing blancs
	szValue = szValue.trim();

	// add szValue/index pairs, only if no szValuesA array given or flag "set" is true
	// so create on init, it values are given, or on data load, if not 
	//
	if ((typeof (this.nStringToValueA[szValue]) == 'undefined') &&
		(!this.szValuesA || !this.szValuesA.length || szFlag == "set")) {

		// make new entry
		//

		// create arrays, if null
		this.szLabelA = this.szLabelA || [];
		this.szExactA = this.szExactA || [];

		this.nStringToValueA[szValue] = this.nStringToValue;
		// set Label for the value, if not yet given
		this.szLabelA[this.nStringToValue - 1] = this.szLabelA[this.nStringToValue - 1] || szValue;
		// add index to ranges, for CATEGORICAL themes 
		this.szExactA.push(this.nStringToValue);
		// next possibel index 
		this.nStringToValue++;
	}
	return this.nStringToValueA[szValue];
};

//...................................................................
// helper
//...................................................................

MapTheme.prototype.checkHiddenLayerState = function () {
	for (var i = 0; i < this.szThemesA.length; i++) {
		if (map.Layer.isScaleDependentLayer(this.szThemesA[i])) {
			if (this.hiddenLayerA[this.szThemesA[i]] && map.Layer.isScaleDependentLayerOn(this.szThemesA[i])) {
				return true;
			} else
			if (!this.hiddenLayerA[this.szThemesA[i]] && !map.Layer.isScaleDependentLayerOn(this.szThemesA[i])) {
				return true;
			}
		}
	}
	return false;
};

//...................................................................
// local helper
//...................................................................

var __scanValue = function (nValue) {
	// strips blanks inside numbers (e.g. 1 234 456 --> 1234456)
	if (String(nValue).match(/,/)) {
		return parseFloat(String(nValue).replace(/\./gi, "").replace(/,/gi, "."));
	} else {
		return parseFloat(String(nValue).replace(/ /gi, ""));
	}
};

/**
 * load the values of the map theme from the map
 * @type boolean
 * @return true if all theme values could be loaded 
 */
MapTheme.prototype.loadValues = function () {

	_TRACE("== MapTheme.loadValues() ===> ");

	this.nMissingLookupCount = 0;

	// get some process flags here once to fasten execution
	// -----------------------------------------------
	this.__fExact = (this.szFlag.match(/CATEGORICAL/));
	this.__fMax = (this.szFlag.match(/\bMAX\b/));
	this.__fDifference = (this.szFlag.match(/DIFFERENCE/));
	this.__fFilter = (this.szFilter && this.szFilter.length);
	this.__fDensity = (this.szFlag.match(/DENSITY/));
	this.__fDensityAlpha = (!this.szFlag.match(/CHART/) && (this.szAlphaField100 && this.szAlphaField100.match(/\$density\$/i)));
	this.__fAggregate = (this.szFlag.match(/AGGREGATE/));
	this.__fAuto100 = (this.szFlag.match(/AUTO100/) && !this.szFlag.match(/AGGREGATE/));
	this.__fTiledLayer = (map.Layer.getLayerObj(this.szThemesA[0]) ? map.Layer.getLayerObj(this.szThemesA[0]).szFlag.match(/tiled/) : false);

	this.__themeNodes = map.Themes.themeNodes;

	for (var i = 0; i < this.szThemesA.length; i++) {
			
		if (map.Layer.isScaleDependentLayer(this.szThemesA[i]) &&
			!map.Layer.isScaleDependentLayerOn(this.szThemesA[i])) {
			this.hiddenLayerA[this.szThemesA[i]] = true;
			this.fRealize = true;
			continue;
		} else {
			this.hiddenLayerA[this.szThemesA[i]] = false;
		}

		// no external data, do this
		// -------------------------
		/** GR 15.04.2018 no more neccessary; see new method this.loadTableFromMap:  map data >> external data table
		if ( !this.objThemesA[this.szThemesA[i]].dbTable ){
			return this.loadValuesFromMap();
		}
		**/

		// load external data
		// --------------------------------		
		if (!this.loadValuesOfTheme(this.szThemesA[i])) {
			return false;
		}
		// --------------------------------	

	}
	return true;
};

/**
 * applicate filter to one theme item
 * @parameter j the index (data row) of the item to check
 * @type boolean
 * @return true if item passes the filter
 */
MapTheme.prototype.filterValues = function (j) {

	if (this.szFilter.match(/WHERE/)) {

		// first time ?
		// get query parts
		if (!this.objTheme.filterQueryA) {

			// tokenize
			// ---------
			var szTokenA = this.szFilter.split('WHERE ')[1].split(' ');

			// test for quotes and join the included text parts
			for (var ii = 0; ii < szTokenA.length; ii++) {
				if (szTokenA[ii].length) {
					if ((szTokenA[ii][0] == '"') && (szTokenA[ii][szTokenA[ii].length - 1] != '"')) {
						do {
							szTokenA[ii] = szTokenA[ii] + " " + szTokenA[ii + 1];
							szTokenA.splice(ii + 1, 1);
						}
						while (szTokenA[ii][szTokenA[ii].length - 1] != '"');
					}
					if ((szTokenA[ii][0] == '(') && (szTokenA[ii][szTokenA[ii].length - 1] != ')')) {
						do {
							szTokenA[ii] = szTokenA[ii] + " " + szTokenA[ii + 1];
							szTokenA.splice(ii + 1, 1);
						}
						while (szTokenA[ii][szTokenA[ii].length - 1] != ')');
					}
				} else {
					szTokenA.splice(ii, 1);
					ii--;
				}
			}
			this.objTheme.filterQueryA = [];
			var filterObj = {};

			// make the query object(s)
			// ------------------------
			do {
				var nToken = 0;
				if (szTokenA.length >= 3) {
					filterObj = {};
					filterObj.szFilterField = szTokenA[0].replace(/("|)/g, "");
					filterObj.szFilterOp = szTokenA[1];
					filterObj.szFilterValue = szTokenA[2].replace(/("|)/g, "");
					nToken = 3;
				}
				if (filterObj.szFilterOp == "BETWEEN") {
					if (szTokenA.length >= 5) {
						if (szTokenA[3] == "AND") {
							filterObj.szFilterValue2 = szTokenA[4].replace(/("|)/g, "");
							nToken = 5;
						}
					}
				}

				if (nToken) {

					// get data table column index for query field
					for (var ii = 0; ii < this.objTheme.dbFields.length; ii++) {
						if (this.objTheme.dbFields[ii].id == filterObj.szFilterField) {
							filterObj.nFilterFieldIndex = ii;
						}
						if (("$"+this.objTheme.dbFields[ii].id+"$") == (filterObj.szFilterValue)) {
							filterObj.nFilterValueIndex = ii;
						}
					}

					// add the query object
					this.objTheme.filterQueryA.push(filterObj);
					szTokenA.splice(0, nToken);

				} else {
					alert("ixmaps - filter error - incomplete query!\nquery: " + this.szFilter);
					break;
				}

				// only 'AND' combination (OR tdb)
				if (szTokenA.length && (szTokenA[0] == "AND")) {
					szTokenA.splice(0, 1);
				} else {
					break;
				}
			}
			while (szTokenA.length);
		}

		// start filtering
		for (var i in this.objTheme.filterQueryA) {

			// get the value to test
			this.__szValue = String(this.objTheme.dbRecords[j][this.objTheme.filterQueryA[i].nFilterFieldIndex]);
			this.__szFilterOp = this.objTheme.filterQueryA[i].szFilterOp.toUpperCase();
			this.__szFilterValue = this.objTheme.filterQueryA[i].szFilterValue;
			this.__szFilterValue2 = this.objTheme.filterQueryA[i].szFilterValue2;

			// GR 26.12.2019 filter value may be column name
			if (this.objTheme.filterQueryA[i].nFilterValueIndex != null) {
				this.__szFilterValue = String(this.objTheme.dbRecords[j][this.objTheme.filterQueryA[i].nFilterValueIndex]);
			}

			// do the query 
			// ------------
			var result = true;
			//var nValue = parseFloat(this.__szValue);
			// gr 23.11.2017
			var nValue = __scanValue(this.__szValue);
			if (this.__szFilterOp == "=") {
				result = ((this.__szValue == this.__szFilterValue) || (nValue == Number(this.__szFilterValue)));
			} else
			if (this.__szFilterOp == "!=") {
				result = !((this.__szValue == this.__szFilterValue) || (nValue == Number(this.__szFilterValue)));
			} else
			if (this.__szFilterOp == "<>") {
				result = !((this.__szValue == this.__szFilterValue) || (nValue == Number(this.__szFilterValue)));
			} else
			if (this.__szFilterOp == ">") {
				result = (nValue > Number(this.__szFilterValue));
			} else
			if (this.__szFilterOp == "<") {
				result = (nValue < Number(this.__szFilterValue));
			} else
			if (this.__szFilterOp == ">=") {
				result = (nValue >= Number(this.__szFilterValue));
			} else
			if (this.__szFilterOp == "<=") {
				result = (nValue <= Number(this.__szFilterValue));
			} else
			if (this.__szFilterOp == "LIKE") {
				if (this.__szFilterValue == "*"){
					result = this.__szValue.length; 
				}else{
					result = eval("this.__szValue.match(/" + this.__szFilterValue.replace(/\//gi, '\\/') + "/i)");
				}
			} else
			if (this.__szFilterOp == "NOT") {
				result = eval("!this.__szValue.match(/" + this.__szFilterValue.replace(/\//gi, '\\/') + "/i)");
			} else
			if (this.__szFilterOp == "IN") {
				result = eval("this.__szFilterValue.match(/\\(" + this.__szValue.replace(/\//gi, '\\/') + "\\)/)") ||
					eval("this.__szFilterValue.match(/\\(" + this.__szValue.replace(/\//gi, '\\/') + "\\,/)") ||
					eval("this.__szFilterValue.match(/\\," + this.__szValue.replace(/\//gi, '\\/') + "\\,/)") ||
					eval("this.__szFilterValue.match(/\\," + this.__szValue.replace(/\//gi, '\\/') + "\\)/)");
			} else
			if ((this.__szFilterOp == "BETWEEN")) {
				result = ((nValue >= Number(this.__szFilterValue)) &&
					(nValue <= Number(this.__szFilterValue2)));
			} else {
				// default operator	
				result = eval("this.__szValue.match(/" + this.__szFilterValue.replace(/\//gi, '\\/') + "/i)");
			}
			// exec query result
			if (!result) {
				return false;
			}
		}
	} else {

		// match with all row cells
		// ------------------------
		this.__szValue = this.objTheme.dbRecords[j].join(' ');
		if (!eval("this.__szValue.match(/" + this.szFilter + "/i)")) {
			return false;
		}
	}
	return true;
};

/**
 * get the selection id of a theme item
 * this can either be the id of a map feature (SVG node) or a geo position (lat/lon) 
 * @parameter j the index (data row) of the item to check
 * @parameter j the index (data row) of the item to check
 * @type boolean
 * @return true if item passes the filter
 */
MapTheme.prototype.getSelectionId = function (szTheme, j) {

	// --------------------------------------------
	// 1. time, set the type 
	// --------------------------------------------

	if (!this.fSelection) {

		this.fSelection = "lookup";

		// GR 02.03.2014 multi selection field, (lat/lon/)
		if (this.objTheme.nFieldSelectionIndexA && this.objTheme.nFieldSelectionIndexA.length > 1) {
			this.fSelection = this.szCRSDatum ? "UTM" : "LatLon";
			this.nSelection_0 = this.objTheme.nFieldSelectionIndexA[0];
			this.nSelection_1 = this.objTheme.nFieldSelectionIndexA[1];
		} else
		if (this.objTheme.nFieldSelectionIndex >= 0) {
			var szId = __mpap_decode_utf8(String(this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex]));

			// GR 22.05.2015 geo-json point definition
			if (szId.match(/MultiPoint/)) {
				this.fSelection = "MultiPoint";
			} else
			// GR 22.05.2015 geo-json point definition
			if (szId.match(/Point/i)) {
				this.fSelection = "MultiPoint";
			} else
			// GR 22.05.2015 geo-json line definition
			if (szId.match(/LineString/)) {
				this.fSelection = "LineString";
			} else
			// GR 22.05.2015 geo-json line definition
			if (szId.match(/MultiLineString/)) {
				this.fSelection = "MultiLineString";
			} else
			// GR 22.05.2015 geo-json poligon definition
			if (szId.match(/Polygon/)) {
				this.fSelection = "MultiPolygon";
			} else
			// GR 22.05.2015 geo-json poligon definition
			if (szId.match(/MultiPolygon/)) {
				this.fSelection = "MultiPolygon";
			}
		}

		// GR 21.03.2019 second position (selection) field
		if (this.objTheme.nFieldSelection2IndexA && this.objTheme.nFieldSelection2IndexA.length > 1) {
			this.fSelection2 = this.szCRSDatum ? "UTM" : "LatLon";
			this.nSelection2_0 = this.objTheme.nFieldSelection2IndexA[0];
			this.nSelection2_1 = this.objTheme.nFieldSelection2IndexA[1];
		} else
		if (typeof (this.objTheme.nFieldSelection2Index) != "undefined") {
			var szId2 = __mpap_decode_utf8(String(this.objTheme.dbRecords[j][this.objTheme.nFieldSelection2Index]));

			// GR 22.05.2015 geo-json point definition
			if (szId2.match(/MultiPoint/)) {
				this.fSelection2 = "MultiPoint";
			} else
				// GR 22.05.2015 geo-json point definition
				if (szId2.match(/Point/)) {
					this.fSelection2 = "MultiPoint";
				} else {
					this.fSelection2 = "mapshape";
				}
		}

	}

	// --------------------------------------------
	// different types of selection
	// --------------------------------------------

	// a) selection by lat/lon fields
	// ---------------------------
	if (this.fSelection == "LatLon" || this.fSelection == "UTM") {

		return szTheme + "::" + (String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/,/g, ".") + ',' + String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/,/g, ".")) + (this.szSelectionFieldSuffix || "").replace(/,/g, ".");
	}

	// b) selection by geoJson geometry
	// ------------------------------
	if (this.fSelection == "Point" || 
		this.fSelection == "MultiPoint" 		
	   ) {
		szId = this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex];
		var szMA = null;
		if ((szMA = szId.match(positionRegExp))) {
			return szTheme + "::" + (szMA[2] + ',' + szMA[1]) + (this.szSelectionFieldSuffix || "");
		}
		return null;
	}
	if (this.fSelection == "LineString" ||
		this.fSelection == "MultiLineString" ||
		this.fSelection == "Polygon" ||
		this.fSelection == "MultiPolygon"		
	   ) {
		return szTheme + "::" + String(j) + (this.szSelectionFieldSuffix || "") 
	}

	// c) selection by lookup field
	// ----------------------------
	if (this.objTheme.nFieldSelectionIndex >= 0){
		szId = __mpap_decode_utf8(String(this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex]));

		if (this.nSelectionFieldDigits) {
			szId = ("000000000000000" + szId).slice(-this.nSelectionFieldDigits);
		}

		if (this.fSelectionFieldToNumber) {
			szId = String(Number(szId));
		}

		if (this.fSelectionFieldToUpper) {
			szId = String(szId).toUpperCase();
		}
		return szTheme + "::" + szId + (this.szSelectionFieldSuffix || "");
	}
	
	return null;
};


/**
 * load the values of the map theme from the map
 * @parameter szThemeLayer the id of one layer of the theme
 * @type boolean
 * @return true if all values could be loaded
 */
MapTheme.prototype.loadValuesOfTheme = function (szThemeLayer) {

	if (this.szFlag.match(/FAST/) || (this.szFlag.match(/AGGREGATE/) && !this.szFlag.match(/COMPATIBLE|PERCENTOFMEAN/))) {
		this.__fAggregateOnLoad = true;
		return this.loadAndAggregateValuesOfTheme(szThemeLayer);
	}
	
	var i;
	var j;
	var k;
	var szId;
	var szSelectionId;
	var nValueA;
	var nValue100;
	var nvalueA;

	_TRACE("MapTheme.loadValuesOfTheme() ---> ");

	this.fField100 = false;
	this.fNegativeValues = false;

	// important !!! ???
	this.szUnit = (this.szUnits ? ((this.szUnits.substr(0, 1) == '.') ? "" : " ") : "") + (this.szUnits || "");

	var fDone = true;

	this.objTheme = this.objThemesA[szThemeLayer];

	if (this.objTheme.nField100Index > 0) {
		this.fField100 = true;
	}

	// get a link to the data
	// 
	if (this.objTheme.dbTable && szThemeLayer && szThemeLayer.length) {
		if (this.coTable) {
			try {
				eval("this.objTheme.dbRecords = " + this.coTable + ".records");
			} catch (e) {
				eval("this.objTheme.dbRecords = " + this.coTable + "_records");
			}
			if (!this.objTheme.dbRecords) {
				displayMessage("Data " + this.coTable + " could not be loaded!", 2000, true);
				return false;
			}
		} else {
			try {
				eval("this.objTheme.dbRecords = " + szThemeLayer + ".records");
			} catch (e) {
				eval("this.objTheme.dbRecords = " + szThemeLayer + "_records");
			}
		}

		_TRACE("coTable: " + this.objTheme.dbRecords.length + " records");

		if (!this.objTheme.nFieldSelectionIndexA.length) {
			delete this.objTheme.nFieldSelectionIndexA;
		}


		// if we have number values, 
		// test parseFloat() contro __scanValue()
		// to include . or , decimals 
		// test 40 values, if find difference in one, set  this.__fScanValue = true; 
		//
		if ((this.szFieldsA[0] != "$item$") && !this.szFlag.match(/CATEGORICAL/)) {
			var maxTest = Math.min(40, this.objTheme.dbRecords.length);
			for (j = 0; j < maxTest; j++) {
				if (this.objTheme.dbRecords[j]) {
					for (k = 0; k < this.szFieldsA.length; k++) {
						var nValue = this.objTheme.dbRecords[j][this.objTheme.nFieldIndexA[k]];
						if (__scanValue(nValue) != parseFloat(nValue)) {
							this.__fScanValue = true;
							_TRACE("this.__fScanValue = " + this.__fScanValue);
							j = maxTest;
							break;
						}
					}
				}
			}
		}

		// -----------------------------------------------
		// loop over the records
		// -----------------------------------------------

		for (j = 0; j < this.objTheme.dbRecords.length; j++) {

			if (!this.objTheme.dbRecords[j] || (this.objTheme.dbRecords[j].length < this.objTheme.dbFields.length)) {
				this.nWrongRecordLengthCount++;
				continue;
			}

			if (this.__fFilter && !this.filterValues(j)) {
				continue;
			}

			// the value(s)
			// ----------------------

			nValueA = [];

			if (this.szFieldsA[0] == "$item$") {
				nValueA[0] = 1;
			} else
			if (this.szFieldsA[0] == "$index$") {
				nValueA[0] = (j + 1);
			} else {
				for (k = 0; k < this.szFieldsA.length; k++) {

					var nValue = this.objTheme.dbRecords[j][this.objTheme.nFieldIndexA[k]];

					if (this.__fExact) {
						nValue = this.valueMap ? this.valueMap[String(nValue)] : nValue;
						nValue = this.getStringValueIndex(String(nValue));
					} else
					if (this.__fScanValue) {
						// GR 17.01.2014 strip all blancs ( es. 12 345 456.34 --> 12345456.34 )
						nValue = __scanValue(nValue);
					} else {
						nValue = parseFloat(nValue);
					}
					if (isNaN(nValue)){
						if(!this.fUndefinedValuePossible) {
							continue;
						}else{
							nValue = 0;
						}
					}
					if (nValue === 0 && !this.fNullIsValue) {
						continue;
					}
					if (nValue < 0 && !this.fNegativeValuePossible) {
						continue;
					}
					nValueA[k] = nValue;
				}
			}
			nValueA.length = this.szFieldsA.length;

			// handle 100 value field 
			// ----------------------

			if (this.szField100 == "$item$") {
				nValue100 = 1;
			} else {
				nValue100 = (this.objTheme.nField100Index < 0) ? 0 : __scanValue(this.objTheme.dbRecords[j][this.objTheme.nField100Index]);
			}
			if (nValue100 === 0 && !this.fNullIsValue) {
				nValue100 = null;
			}
			if (nValue100 < 0 && !this.fNegativeValuePossible) {
				nValue100 = null;
			}

			// handle explizit size field 
			// GR 27.05.2023 bugfix 'undefined'
			// ----------------------
			var nValueSize = null;
			if (this.szSizeField && (this.szSizeField != "$item$")) {
				nValueSize = this.objTheme.dbRecords[j][this.objTheme.nSizeFieldIndex];
				nValueSize = this.valueMap ? this.valueMap[String(nValueSize)] || __scanValue(nValueSize) : __scanValue(nValueSize);
				nValueSize = (isFinite(nValueSize) && !isNaN(nValueSize)) ? nValueSize : 0;
				if (nValueSize === 0) {
					continue;
				}
				if (nValueSize < 0 ) {
					continue;
				}
			} else {
				nValueSize = 1;
			}
			
			// GR 22.09.2013
			// handle explizit alpha field 
			// ----------------------
			var nValueAlpha = null;
			if (this.szAlphaField) {
				nValueAlpha = __scanValue((this.objTheme.dbRecords[j][this.objTheme.nAlphaFieldIndex]));
				if (isNaN(nValueAlpha)) {
					nValueAlpha = 0;
				}
				//_TRACE(nValueAlpha);
			}
			if (this.szAlphaField100) {
				if (this.objTheme.nAlphaField100Index) {
					nValueAlpha = 100 / __scanValue((this.objTheme.dbRecords[j][this.objTheme.nAlphaField100Index])) * nValueAlpha;
					if (isNaN(nValueAlpha)) {
						nValueAlpha = 0;
					}
				}
			}

			// --------------------------------------------------
			// the selection field -> id -> map shape or position
			// --------------------------------------------------

			szSelectionId = szId = this.getSelectionId(szThemeLayer, j);

			if (!szSelectionId) {
				this.nMissingLookupCount++;
				continue;
			}

			// --------------------------------
			// ok, we have a selection/position
			// --------------------------------

			// GR 08.04.2011 new nFieldItemIndex to define different fields for chart id and (position) lookup id
			// ---------------------------------------------------------------------------------------------------
			if ((this.objTheme.nFieldItemIndex >= 0) && (this.objTheme.nFieldItemIndex != this.objTheme.nFieldSelectionIndex)) {
				szId = __mpap_decode_utf8(String(this.objTheme.dbRecords[j][this.objTheme.nFieldItemIndex]));
				if (this.fSelectionFieldToUpper) {
					szId = String(szId).toUpperCase();
				}
				szId = szThemeLayer + "::" + szId;
			}

			// make unique items !!!
			// -----------------------
			if (this.itemA[szId]) {
				if (this.szFlag.match(/DOT/)) {
					continue;
				}
				szId += "*" + Math.random();
				if (this.itemA[szId]) {
					continue;
				}
			}

			this.addItemValues(szId, nValueA, nValue100, nValueSize, nValueAlpha);

			// if item added; GR 20.01.2010
			if (this.itemA[szId]) {
				// add color value
				if (this.szColorField) {
					this.itemA[szId].szColor = (this.szColorField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nColorFieldIndex]));
				}
				// add symbol value
				if (this.szSymbolField) {
					this.itemA[szId].szSymbol = (this.szSymbolField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nSymbolFieldIndex]));
				}
				// add text value
				if (this.szValueField) {
					this.itemA[szId].szValue = (this.szValueField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nValueFieldIndex]));
				}
				// add time value
				if (this.szTimeField) {
					this.itemA[szId].szTime = (this.szTimeField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nTimeFieldIndex]));
					if (isNaN(this.itemA[szId].szTime)){
						this.itemA[szId].szTime = this.itemA[szId].szTime.replace(/ - /g,"");
					}
				}
				// add label value
				if (this.szLabelField) {
					this.itemA[szId].szLabel = (this.szLabelField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nLabelFieldIndex]));
					// GR 07.08.2018 if label field defined, overwrite exact value label for legend
					// if (this.__fExact) {
					//     this.szLabelA[nValueA[0]-1] = this.itemA[szId].szLabel;
					// }
				}
				// add title value
				if (this.szTitleField) {
					this.itemA[szId].szTitle = __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nTitleFieldIndex]));
				}
				// add snippet value
				if (this.szSnippetField) {
					this.itemA[szId].szSnippet = __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nSnippetFieldIndex]));
				}
				// add selection id if this.nFieldItemIndex >= 0 (item id differs from selection id))
				if (szSelectionId) {
					this.itemA[szId].szSelectionId = szSelectionId;
				} else {
					this.itemA[szId].szSelectionId = szId;
				}
				// add aggregation value
				if (this.szAggregationField) {
					this.itemA[szId].szAggregation = __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nAggregationFieldIndex]));
				}
				// add PLOTXY values
				if (this.szXField) {
					this.itemA[szId].nX = __scanValue((this.objTheme.dbRecords[j][this.objTheme.nXFieldIndex]));
					if (!isNaN(this.itemA[szId].nX)) {
						this.nMinX = Math.min(this.nMinX, this.itemA[szId].nX);
						this.nMaxX = Math.max(this.nMaxX, this.itemA[szId].nX);
						this.nSumX += this.itemA[szId].nXField;
					}
				}
				if (this.szYField) {
					this.itemA[szId].nY = __scanValue((this.objTheme.dbRecords[j][this.objTheme.nYFieldIndex]));
					if (!isNaN(this.itemA[szId].nY)) {
						this.nMinY = Math.min(this.nMinY, this.itemA[szId].nY);
						this.nMaxY = Math.max(this.nMaxY, this.itemA[szId].nY);
						this.nSumY += this.itemA[szId].nYField;
					}
				}
				// store data source row
				this.itemA[szId].dbIndex = j;
			}
		}
	} else {
		fDone = false;
	}

	if (fDone) {
		_TRACE("coTable: " + this.nMissingLookupCount + " lookups missing");
		_TRACE("coTable: " + (100 - this.nMissingLookupCount / this.objTheme.dbRecords.length * 100).toFixed(2) + " % mapped");

		_TRACE("== done with js data loaded === ");

		this.fAnalyze = true;

		return true;
	}
};

/**
 * load the values of the map theme from the map
 * @parameter szThemeLayer the id of one layer of the theme
 * @type boolean
 * @return true if all values could be loaded
 */
MapTheme.prototype.loadAndAggregateValuesOfTheme = function (szThemeLayer, nContinue) {

	var a;
	var i;
	var j;
	var k;
	var szId;
	var szSelectionId;
	var szSelectionId2;
	var nValueA;
	var nValue100;
	var nCountA;

	if (!nContinue) {

		console.log("*** F A S T ***");
		_TRACE("MapTheme.loadValuesOfTheme() ---> ");

		this.fField100 = false;
		this.fNegativeValues = false;
		this.__fMultiParts = (this.szFlag.match(/CATEGORICAL/) &&
			!(this.szFlag.match(/PIE/) ||
				this.szFlag.match(/BAR/) ||
				this.szFlag.match(/SEQUENCE/) ||
				this.szFlag.match(/PLOT/) ||
				this.szFlag.match(/DOMINANT/) ||
				this.szFlag.match(/COMPOSECOLOR/) ||
				this.szFlag.match(/\bUSER\b/) ||
				this.szFlag.match(/WAFFLE/))
		);
		
		// GR 23.12.2020 test tbd: make parameter clipUpper clipLower
		this.__fClipToGeoBounds = false;
		if ( this.szFlag.match(/CLIPTOGEOBOUNDS/) ){
			if ( (map.Scale.nTrueMapScale * map.Scale.nZoomScale) < (this.nClipUpper||1000000000) )  {
				this.__fClipToGeoBounds = true;
			}
		}

		// important !!! ???
		this.szUnit = (this.szUnits ? ((this.szUnits.substr(0, 1) == '.') ? "" : " ") : "") + (this.szUnits || "");

		this.objTheme = this.objThemesA[szThemeLayer];

		if (this.objTheme.nField100Index > 0) {
			this.fField100 = true;
		}

		if (!(this.objTheme.dbTable && szThemeLayer && szThemeLayer.length)) {
			return false;
		}

		// ---------------------------------------------
		// get a link to the data
		// ---------------------------------------------

		if (this.coTable) {
			try {
				eval("this.objTheme.dbRecords = " + this.coTable + ".records");
			} catch (e) {
				eval("this.objTheme.dbRecords = " + this.coTable + "_records");
			}
			if (!this.objTheme.dbRecords) {
				displayMessage("Data " + this.coTable + " could not be loaded!", 2000, true);
				return false;
			}
		} else {
			try {
				eval("this.objTheme.dbRecords = " + szThemeLayer + ".records");
			} catch (e) {
				eval("this.objTheme.dbRecords = " + szThemeLayer + "_records");
			}
		}

		_TRACE("coTable: " + this.objTheme.dbRecords.length + " records");

		if (!this.objTheme.nFieldSelectionIndexA.length) {
			delete this.objTheme.nFieldSelectionIndexA;
		}

		// .............................................
		// Z O O M T O
		//
		// if flag ZOOMTO is set, get bounding box of points 
		// and zoom the map to the area, then remove ZOOMTO and 
		// refresh the theme
		// .............................................
		if (this.szFlag.match(/ZOOMTO/)) {
			// call once to analyse 
			this.getSelectionId(szThemeLayer, 0);

			for (j = 0; j < this.objTheme.dbRecords.length; j++) {

				// get the data item position
				// ---------------------------
				if (this.fSelection == "UTM") {
					ptPos = map.Scale.getMapPositionOfUTM(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/\,/g, ".")), this.szCRSDatum, this.szCRSUTMZone);
				} else
				if (this.fSelection == "LatLon") {
					ptPos = map.Scale.getMapPositionOfLatLon(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/\,/g, ".")));
				} else
				if (this.fSelection == "Point" || 
					this.fSelection == "MultiPoint" ||
					this.fSelection == "LineString" ||
					this.fSelection == "MultiLineString" 
				   ) {
					szId = this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex];
					var szMA = szId.match(positionRegExp);
					ptPos = map.Scale.getMapPositionOfLatLon(parseFloat(szMA[2]), parseFloat(szMA[1]));
				} else {
					szId = this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex];
					if (this.fSelectionFieldToUpper) {
						szId = String(szId).toUpperCase();
					}
					ptPos = this.getNodePosition(szThemeLayer + "::" + szId);
				}
				if (ptPos) {
					this.itemA[(szThemeLayer + "::" + String(ptPos.x) + ',' + String(ptPos.y))] = {
						ptPos: ptPos
					};
				}
			}

			// execute zoomto 
			this.zoomTo();
			this.itemA = [];

			this.removeDefinitionFromFlag("ZOOMTO");
			//var defObj = map.Themes.getMapThemeDefinitionObj(this.szId);
			//map.Themes.newThemeObjA = map.Themes.newThemeObjA || [];
			//map.Themes.newThemeObjA.push(defObj);
			//setTimeout(function(){map.Themes.newThemeByObj();}, 100);
			//return;
		}
		// .............................................


		// ============================================
		//
		// do some preparations
		//
		// ============================================


		// GR 06.02.2020 create chart group here, because load and aggregate may sleep 
		// and another theme could pass in front
		// 
		this.createChartGroup(map.Layer.objectGroup);

		// if we have number values, 
		// test parseFloat() contro __scanValue()
		// to include . or , decimals 
		// test 40 values, if find difference in one, set  this.__fScanValue = true; 
		//
		if ((this.szFieldsA[0] != "$item$") && !this.szFlag.match(/CATEGORICAL/)) {
			var maxTest = Math.min(40, this.objTheme.dbRecords.length);
			for (j = 0; j < maxTest; j++) {
				if (this.objTheme.dbRecords[j]) {
					for (k = 0; k < this.szFieldsA.length; k++) {
						var nValue = this.objTheme.dbRecords[j][this.objTheme.nFieldIndexA[k]];
						if (__scanValue(nValue) != parseFloat(nValue)) {
							this.__fScanValue = true;
							_TRACE("this.__fScanValue = " + this.__fScanValue);
							j = maxTest;
							break;
						}
					}
				}
			}
		}

		if (this.szSizeField == "$item$") {
			this.oldSizefield = this.szSizeField;
			this.szSizeField = null;
		}

		// --------------------------------------------
		// calcolate grid parameter for aggregation
		// --------------------------------------------

		// grid defined in screen pixel, so gridwidth(meter) must be calculated
		if (this.nGridWidthPx) {
			var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + map.Scale.normalX(this.nGridWidthPx), 1000);
			this.nGridWidth = maxDist;
		}
		// grid defined by matrix, make grid with n x n parts (n = nGridMatrix || 20)   
		if (this.nGridMatrix) {
			var mapArea = map.Zoom.getBox();
			var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + mapArea.width, 1000);
			this.nGridWidth = maxDist / (this.nGridMatrix || 20) / map.Scale.nZoomScale;
		}

		// meters to internal x,y
		this.nGridWidthMap = this.nGridWidth ? (Math.round(map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / 20) * map.Scale.nZoomScale * 20) : 0;
		// if Math.round caused a zero result get the not-rounded value!
		if (this.nGridWidth && !this.nGridWidthMap) {
			this.nGridWidthMap = this.nGridWidth ? ((map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth)) * map.Scale.nZoomScale) : 0;
		}
		
		if (!this.nGridWidthPx) {
			this.nGridWidthMap = this.nGridWidth ? ((map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth)) * map.Scale.nZoomScale) : 0;
			var nClip = (Math.pow(10,Math.floor(Math.log10(1/map.Scale.nZoomScale))));
			this.nGridWidthMap = (Math.round(this.nGridWidthMap * nClip) / nClip);
		}
		
		// offset to the grid
		this.dX = 0;
		this.dY = 0;
		if (this.szFlag.match(/FIXGRID/)) {
			this.dX = map.Scale.mapCenter.x * map.Scale.nZoomScale;
			this.dY = map.Scale.mapCenter.y * map.Scale.nZoomScale;
		}
		if (this.nGridOffsetX) {
			this.dX -= (this.nGridWidthMap / 100 * this.nGridOffsetX);
		}
		if (this.nGridOffsetY) {
			this.dY += (this.nGridWidthMap / 100 * this.nGridOffsetY);
		}

		// hexbin constants 
		this.nHexaWidth = this.nGridWidthMap * 1.15;
		this.nHexaHalf = this.nGridWidthMap * 1.15 / 2;
		this.nHexa4th = this.nGridWidthMap / 4;

		// call once to analyse 
		this.getSelectionId(szThemeLayer, 0);

		// internal counter  
		this.aggregationCount = 0;

		// --------------------------------------------
		// reset counter and sums 
		// --------------------------------------------

		this.nMin = Number.MAX_VALUE;
		this.nMax = (-Number.MAX_VALUE);

		this.nMinSize = Number.MAX_VALUE;
		this.nMaxSize = (-Number.MAX_VALUE);
		this.nSumSize = 0;

		this.nMinAlpha = Number.MAX_VALUE;
		this.nMaxAlpha = (-Number.MAX_VALUE);
		this.nSumAlpha = 0;

		if (this.__fExact) {
			this.nMinA = [];
			this.nMaxA = [];
			this.nSumA = [];
			this.nOrigMinA = [];
			this.nOrigMaxA = [];
			this.nOrigSumA = [];
			this.nMedianA = [];
			this.nMeanA = [];
			this.nCountA = [];
		} else
			for (i = 0; i < this.szFieldsA.length; i++) {
				this.nMinA[i] = Number.MAX_VALUE;
				this.nMaxA[i] = (-Number.MAX_VALUE);
				this.nSumA[i] = 0;
				this.nOrigMinA[i] = Number.MAX_VALUE;
				this.nOrigMaxA[i] = (-Number.MAX_VALUE);
				this.nOrigSumA[i] = 0;
				this.nMedianA[i] = 0;
				this.nMeanA[i] = 0;
			}

		this.nEmptyValuesA = [];
		for (var v in this.szValuesA) {
			this.nEmptyValuesA.push(0);
		}

		if (this.szFlag.match(/DUMP/)) {
			if (fObjectScaling) {
				this.nChartGroupScale = (this.nAutoScale || this.nScale) * map.Layer.nObjectScale * map.Scale.nObjectScaling;
			} else {
				this.nChartGroupScale = (this.nAutoScale || this.nScale) * map.Scale.nFeatureScaling * map.Scale.nObjectScaling;
			}
			this.chartGroup = map.Dom.newGroup(map.Layer.objectGroup, this.szId + ":chartgroup");
		}

		if (!this.szWeightsA) {
			this.szWeightsA = [];
			for (i = 0; i < this.szFieldsA.length; i++) {
				this.szWeightsA.push(1);
			}
		} else
		if (this.szWeightsA.length && (this.szWeightsA.length != this.szFieldsA.length)) {
			var lastWeight = this.szWeightsA[this.szWeightsA.length - 1];
			for (i = this.szWeightsA.length; i < this.szFieldsA.length; i++) {
				this.szWeightsA.push(lastWeight);
			}
		}
	}
	
	if ((this.szAggregationUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nAggregationUpper)) ||
		(this.szAggregationLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale < this.nAggregationLower))) {
		this.__fAggregate = false;
	}

	var mapGeoBounds = map.Zoom.getBoundsOfMapInGeoBounds();	
	var zoomBox = map.Zoom.getBox();

	// ============================================
	// ============================================
	//
	// L O A D   A N D    A G G R E G A T E 
	//
	// ============================================
	// ============================================

	var __fVerbose = this.objTheme.dbRecords.length > 200000;

	// --------------------------------------------
	// loop over the data
	// --------------------------------------------

	for (j = nContinue || 0; j < this.objTheme.dbRecords.length; j++) {

		if (__fVerbose && (j > (nContinue || 0)) && ((j % 50000)===0))  {
			_TRACE(j);
			this.fContinueLoadAndAggregate = true;
			this.continueIndex = j;
			this.szThemeLayer = szThemeLayer;
			//displayMessage(""+__formatValue(j,0)+" aggregated");
			displayMessage(__formatValue((j / this.objTheme.dbRecords.length * 100), 0) + "% "+map.Dictionary.getLocalText("aggregated"));
			displayProgressBar(j, this.objTheme.dbRecords.length, "");
			setTimeout(function(){map.Themes.executeContinue();}, 10);
			return true;
		}

		if (!this.objTheme.dbRecords[j] || (this.objTheme.dbRecords[j].length < this.objTheme.dbFields.length)) {
			this.nWrongRecordLengthCount++;
			continue;
		}

		if (this.__fFilter && !this.filterValues(j)) {
			continue;
		}

		// GR 21.12.2020 clipping LatLon coordinates to map bounds 
		//
		if ( this.__fClipToGeoBounds && (this.fSelection == "LatLon") ) {
			var y = parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/\,/g, "."));
			var x = parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/\,/g, "."));					if ( (x < mapGeoBounds[0].x) || 
				 (x > mapGeoBounds[1].x) ||
				 (y < mapGeoBounds[0].y) ||
				 (y > mapGeoBounds[1].y) ){
				continue;
			}
		}
		// ---------------------------
		// get the data item position
		// ---------------------------

		var ptPos = null;
		var newPos = null;

		if (this.fSelection == "UTM") {
			ptPos = map.Scale.getMapPositionOfUTM(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/\,/g, ".")), this.szCRSDatum, this.szCRSUTMZone);
			szId = ptPos ? (String(ptPos.x) + ',' + String(ptPos.y)) : "";
		} else
		if (this.fSelection == "LatLon") {
			ptPos = map.Scale.getMapPositionOfLatLon(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection_1]).replace(/\,/g, ".")));
			szId = ptPos ? (String(ptPos.x) + ',' + String(ptPos.y)) : "";
		} else
		if (this.fSelection == "Point" || 
			this.fSelection == "MultiPoint" ||
			this.fSelection == "LineString" ||
			this.fSelection == "MultiLineString" 
		   ) {
			szId = this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex];
			var szMA = String(szId).match(positionRegExp);
			if (szMA){
				ptPos = map.Scale.getMapPositionOfLatLon(parseFloat(szMA[2]), parseFloat(szMA[1]));
			}
		} else {
			szId = this.objTheme.dbRecords[j][this.objTheme.nFieldSelectionIndex];
			if (this.fSelectionFieldToUpper) {
				szId = String(szId).toUpperCase();
			}
			if (this.nSelectionFieldDigits) {
				szId = ("000000000000000" + szId).slice(-this.nSelectionFieldDigits);
			}
			if (this.fSelectionFieldToNumber) {
				szId = String(Number(szId));
			}
			ptPos = this.getNodePosition(szThemeLayer + "::" + szId);
		}

		if (this.szFlag.match(/DUMP/)) {
			var shapeGroup = map.Dom.newGroup(this.chartGroup, this.szId + ":" + szId + ":chart");
			shapeGroup.fu.setMatrix([this.nChartGroupScale, 0, 0, this.nChartGroupScale, ptPos.x, ptPos.y]);
			map.Dom.newShape('circle', shapeGroup, 0, 0, map.Scale.normalX(3), "fill:blue;fill-opacity:0.2;stroke:none;");
		}

		if (!ptPos || isNaN(ptPos.x) || isNaN(ptPos.y)) {
			// GR 16/04/2023 made trouble on filter change and more than one theme
			//this.fRedraw = true;
			this.fDataIncomplete = true;
			continue;
		}

		var ptOrigPos = ptPos;

		// ---------------------------------------------------------------------
		// GR 21.03.2019 new if this.fSelection2 is defined, get second position
		// ---------------------------------------------------------------------

		var ptPos2 = null;
		var szId2 = null;

		if (this.fSelection2) {
			if (this.fSelection2 == "UTM") {
				ptPos2 = map.Scale.getMapPositionOfUTM(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection2_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection2_1]).replace(/\,/g, ".")), this.szCRSDatum, this.szCRSUTMZone);
				szId2 = ptPos2 ? (String(ptPos2.x) + ',' + String(ptPos2.y)) : "";
			} else
			if (this.fSelection2 == "LatLon") {
				ptPos2 = map.Scale.getMapPositionOfLatLon(parseFloat(String(this.objTheme.dbRecords[j][this.nSelection2_0]).replace(/\,/g, ".")), parseFloat(String(this.objTheme.dbRecords[j][this.nSelection2_1]).replace(/\,/g, ".")));
				szId2 = ptPos ? (String(ptPos.x) + ',' + String(ptPos.y)) : "";
			} else
			if (this.fSelection == "Point" || 
				this.fSelection == "MultiPoint" ||
				this.fSelection == "LineString" ||
				this.fSelection == "MultiLineString" 
			   ) {
				szId2 = this.objTheme.dbRecords[j][this.objTheme.nFieldSelection2Index];
				var szMA = szId.match(positionRegExp);
				ptPos2 = map.Scale.getMapPositionOfLatLon(parseFloat(szMA[2]), parseFloat(szMA[1]));
			} else {
				szId2 = this.objTheme.dbRecords[j][this.objTheme.nFieldSelection2Index];
				if (this.nSelectionFieldDigits) {
					szId2 = ("000000000000000" + szId).slice(-this.nSelectionFieldDigits);
				}
				if (this.fSelectionFieldToUpper) {
					szId2 = String(szId2).toUpperCase();
				}
				
				// GR 28.01.2022 look for positions in all layer
				for (var i = 0; i < this.szThemesA.length; i++) {
					ptPos2 = ptPos2 || this.getNodePosition(this.szThemesA[i] + "::" + szId2);
				}
			}

			// GR 10.03.2019 new fSelection2 defined, make item id and store position 2 (needed for DIRECTION or VECTOR)
			// --------------------------------------------------------------------------------------------------------------
			{
				szId2 = __mpap_decode_utf8(String(this.objTheme.dbRecords[j][this.objTheme.nFieldSelection2Index]));
				if (this.fSelectionFieldToUpper) {
					szId2 = String(szId2).toUpperCase();
				}
				szSelectionId2 = szId2;
				szId2 = szThemeLayer + "::" + szId2;
				this.themeNodesPosA[szId2] = ptPos2;
			}

		}

		if (ptPos2) {
			if ((ptPos.x == ptPos2.x) &&
				(ptPos.y == ptPos2.y)) {
				//continue;
			}
		}
		
		// GR 21.12.2020 clipping LatLon coordinates to map bounds 
		//
		if ( this.__fClipToGeoBounds ) {
			if ( ptPos.x < zoomBox.x ||
				 ptPos.x > zoomBox.x + zoomBox.width ||
				 ptPos.y < zoomBox.y ||
				 ptPos.y > zoomBox.y + zoomBox.height 
				) {
				continue;
			}
		}

		// get the values 
		// ---------------------------

		var suppress = false;
		var nValuesA = [];

		if (this.szFieldsA[0] == "$item$") {
			nValuesA[0] = 1;
		} else
		if (this.szFieldsA[0] == "$index$") {
			nValuesA[0] = (j + 1);
		} else {
			for (k = 0; k < this.szFieldsA.length; k++) {

				var nValue = this.objTheme.dbRecords[j][this.objTheme.nFieldIndexA[k]];
				nValue = this.valueMap ? this.valueMap[String(nValue)] || nValue : nValue;

				if (this.__fExact) {
					nValue = this.getStringValueIndex(String(nValue));
					this.exactCountA[nValue - 1] = (this.exactCountA[nValue - 1] || 0) + 1;
				} else
				if (this.__fScanValue) {
					// GR 17.01.2014 strip all blancs ( es. 12 345 456.34 --> 12345456.34 )
					nValue = __scanValue(nValue) * (this.szWeightsA[k] || 1);
				} else {
					nValue = parseFloat(nValue) * (this.szWeightsA[k] || 1);
				}
				if (isNaN(nValue)){
					if(!this.fUndefinedValuePossible) {
						suppress = true;
						continue;
					}else{
						nValue = 0;	
					}
				}
				if (nValue === 0 && !this.fNullIsValue) {
					suppress = true;
					continue;
				}
				if (nValue < 0 && !this.fNegativeValuePossible) {
					suppress = true;
					continue;
				}
				nValuesA[k] = nValue;
			}
		}
		nValuesA.length = this.szFieldsA.length;

		var nValue100 = 1;
		if (this.szField100 == "$item$") {
			nValue100 = 1;
		} else {
			nValue100 = (this.objTheme.nField100Index < 0) ? 0 : __scanValue(this.objTheme.dbRecords[j][this.objTheme.nField100Index]);
		}
		if (nValue100 === 0 && !this.fNullIsValue) {
			nValue100 = null;
		}
		if (nValue100 < 0 && !this.fNegativeValuePossible) {
			nValue100 = null;
		}
		if ( isNaN(nValue100) ){
			nValue100 = null;
		}
		var nValueSize = null;
		if (this.szSizeField && (this.szSizeField != "$item$")) {
			nValueSize = this.objTheme.dbRecords[j][this.objTheme.nSizeFieldIndex];
			nValueSize = this.valueMap ? this.valueMap[String(nValueSize)] || __scanValue(nValueSize) : __scanValue(nValueSize);
			nValueSize = (isFinite(nValueSize) && !isNaN(nValueSize)) ? nValueSize : 0;
			if (nValueSize === 0 && !this.fNullIsValue) {
				suppress = true;
				continue;
			}
			if (nValueSize < 0 && !this.fNegativeValuePossible) {
				suppress = true;
				continue;
			}
		} else {
			nValueSize = 1;
		}

		var nAlphaValue = null;
		if (this.szAlphaField) {
			nAlphaValue = __scanValue(this.objTheme.dbRecords[j][this.objTheme.nAlphaFieldIndex]);
		}

		var szTitle = null;
		if (this.szTitleField) {
			szTitle = this.objTheme.dbRecords[j][this.objTheme.nTitleFieldIndex];
		}

		var szColor = null;
		if (this.szColorField) {
			szColor = (this.szColorField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nColorFieldIndex]));
		}
		
		var szTime = null;
		if (this.szTimeField) {
			szTime = (this.szTimeField == "$index$") ? (j + 1) : __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nTimeFieldIndex]));
			szTime = szTime.replace(/ - /g," ");
		}

		var nX = null;
		if (this.szXField) {
			nX = __scanValue((this.objTheme.dbRecords[j][this.objTheme.nXFieldIndex]));
		}
		var nY = null;
		if (this.szYField) {
			nY = __scanValue((this.objTheme.dbRecords[j][this.objTheme.nYFieldIndex]));
		}

		var szValue = null;
		if (this.szValueField) {
			szValue = this.objTheme.dbRecords[j][this.objTheme.nValueFieldIndex];
		}

		// if we have a grid defined,
		// map the position to a grid
		// ============================================

		if (this.__fAggregate && this.nGridWidthMap) {

			if (this.szFlag.match(/\bRECT\b/)) {
				if (this.dX || this.dY) {
					ptPos = new point(Math.round((ptPos.x + this.dX) / this.nGridWidthMap) * this.nGridWidthMap - this.dX,
						Math.round((ptPos.y + this.dY) / this.nGridWidthMap) * this.nGridWidthMap - this.dY);
				} else {
					ptPos = new point(Math.round(ptPos.x / this.nGridWidthMap) * this.nGridWidthMap,
						Math.round(ptPos.y / this.nGridWidthMap) * this.nGridWidthMap);
				}
			} else {
				// diagonal grid

				if (this.szFlag.match(/PLOTY/)) {
					var yr = Math.round(ptPos.y / this.nGridWidthMap);
					var dx = (yr % 2) ? this.nHexaHalf : 0;
					newPos = new point(Math.round((ptPos.x + dx) / this.nHexaWidth) * this.nHexaWidth - dx,
						yr * this.nGridWidthMap);
				} else {
					var xr = Math.round(ptPos.x / this.nGridWidthMap);
					var dy = (xr % 2) ? this.nHexaHalf : 0;
					newPos = new point(xr * this.nGridWidthMap,
						Math.round((ptPos.y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
				}

				// HEXAGONAL GRID
				// above, we rounded the position to a rectangolar grid
				// because the diagonal grid is like a hexagonal grid, we must check if far out points belong to neighbours.
				// we do this, by comparing the distance of the original point to the rectangular center to 
				// the distance of the center of two neighbours or to the left, or to the right
				// if the distance to the neighbour is shorter, the point belongs to him

				// if the point is within the left or right triangle of the hexagon
				if ((Math.abs(newPos.x - ptPos.x) > this.nHexa4th)) {

					var ptPosA = [];
					var nDistA = [];
					// in a diagonal grid the neighbours are half way up and down
					dy = (dy === 0) ? this.nHexaHalf : 0;

					if (newPos.x > ptPos.x) {
						// get 2 neighbours to the left
						ptPosA[0] = new point(newPos.x - this.nGridWidthMap, newPos.y - this.nHexaHalf);
						ptPosA[1] = new point(newPos.x - this.nGridWidthMap, newPos.y + this.nHexaHalf);
					} else {
						// get 2 neighbours to the right
						ptPosA[0] = new point(newPos.x + this.nGridWidthMap, newPos.y - this.nHexaHalf);
						ptPosA[1] = new point(newPos.x + this.nGridWidthMap, newPos.y + this.nHexaHalf);
					}

					// calc the distances
					nDistA[0] = Math.sqrt(Math.pow((ptPosA[0].x - ptPos.x), 2) + Math.pow((ptPosA[0].y - ptPos.y), 2));
					nDistA[1] = Math.sqrt(Math.pow((ptPosA[1].x - ptPos.x), 2) + Math.pow((ptPosA[1].y - ptPos.y), 2));
					nDistA[3] = Math.sqrt(Math.pow((newPos.x - ptPos.x), 2) + Math.pow((newPos.y - ptPos.y), 2));

					// check if point belongs to neighbour
					if (nDistA[0] < nDistA[3]) {
						newPos = new point(Math.round(ptPosA[0].x / this.nGridWidthMap) * this.nGridWidthMap,
							Math.round((ptPosA[0].y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
					} else
					if (nDistA[1] < nDistA[3]) {
						newPos = new point(Math.round(ptPosA[1].x / this.nGridWidthMap) * this.nGridWidthMap,
							Math.round((ptPosA[1].y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
					}
				}
				ptPos = newPos;
			}
		}

		// if we have a grid and a second position (VECTOR,...)
		// map also the second position to a grid
		// ============================================

		if (this.__fAggregate && this.nGridWidthMap && ptPos2 && !this.szFlag.match(/\bORIGIN\b/)) {

			if (this.szFlag.match(/\bRECT\b/)) {
				if (this.dX || this.dY) {
					ptPos2 = new point(Math.round((ptPos2.x + this.dX) / this.nGridWidthMap) * this.nGridWidthMap - this.dX,
						Math.round((ptPos2.y + this.dY) / this.nGridWidthMap) * this.nGridWidthMap - this.dY);
				} else {
					ptPos2 = new point(Math.round(ptPos2.x / this.nGridWidthMap) * this.nGridWidthMap,
						Math.round(ptPos2.y / this.nGridWidthMap) * this.nGridWidthMap);
				}
			} else {
				// diagonal grid

				if (this.szFlag.match(/PLOTY/)) {
					var yr = Math.round(ptPos2.y / this.nGridWidthMap);
					var dx = (yr % 2) ? this.nHexaHalf : 0;
					newPos = new point(Math.round((ptPos2.x + dx) / this.nHexaWidth) * this.nHexaWidth - dx,
						yr * this.nGridWidthMap);
				} else {
					var xr = Math.round(ptPos2.x / this.nGridWidthMap);
					var dy = (xr % 2) ? this.nHexaHalf : 0;
					newPos = new point(xr * this.nGridWidthMap,
						Math.round((ptPos2.y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
				}

				// HEXAGONAL GRID
				// above, we rounded the position to a rectangolar grid
				// because the diagonal grid is like a hexagonal grid, we must check if far out points belong to neighbours.
				// we do this, by comparing the distance of the original point to the rectangular center to 
				// the distance of the center of two neighbours or to the left, or to the right
				// if the distance to the neighbour is shorter, the point belongs to him

				// if the point is within the left or right triangle of the hexagon
				if ((Math.abs(newPos.x - ptPos2.x) > this.nHexa4th)) {

					var ptPosA = [];
					var nDistA = [];
					// in a diagonal grid the neighbours are half way up and down
					dy = (dy === 0) ? this.nHexaHalf : 0;

					if (newPos.x > ptPos2.x) {
						// get 2 neighbours to the left
						ptPosA[0] = new point(newPos.x - this.nGridWidthMap, newPos.y - this.nHexaHalf);
						ptPosA[1] = new point(newPos.x - this.nGridWidthMap, newPos.y + this.nHexaHalf);
					} else {
						// get 2 neighbours to the right
						ptPosA[0] = new point(newPos.x + this.nGridWidthMap, newPos.y - this.nHexaHalf);
						ptPosA[1] = new point(newPos.x + this.nGridWidthMap, newPos.y + this.nHexaHalf);
					}

					// calc the distances
					nDistA[0] = Math.sqrt(Math.pow((ptPosA[0].x - ptPos2.x), 2) + Math.pow((ptPosA[0].y - ptPos2.y), 2));
					nDistA[1] = Math.sqrt(Math.pow((ptPosA[1].x - ptPos2.x), 2) + Math.pow((ptPosA[1].y - ptPos2.y), 2));
					nDistA[3] = Math.sqrt(Math.pow((newPos.x - ptPos2.x), 2) + Math.pow((newPos.y - ptPos2.y), 2));

					// check if point belongs to neighbour
					if (nDistA[0] < nDistA[3]) {
						newPos = new point(Math.round(ptPosA[0].x / this.nGridWidthMap) * this.nGridWidthMap,
							Math.round((ptPosA[0].y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
					} else
					if (nDistA[1] < nDistA[3]) {
						newPos = new point(Math.round(ptPosA[1].x / this.nGridWidthMap) * this.nGridWidthMap,
							Math.round((ptPosA[1].y + dy) / this.nHexaWidth) * this.nHexaWidth - dy);
					}
				}
				ptPos2 = newPos;
			}
			this.themeNodesPosA[szId2] = ptPos2;
		}

		// preserve the original id of the data point
		//
		szSelectionId = szId;

		// ============================================
		//
		// create the id to aggregate by
		//
		// ============================================

		// if aggregation by data field, then the id is the aggregation field value 
		// if not, create the id of the point from its (aggregated) position 
		// 
		if (this.szAggregationField) {
			var szAgId = __mpap_decode_utf8((this.objTheme.dbRecords[j][this.objTheme.nAggregationFieldIndex]));
			szId = szThemeLayer + "::" + szAgId;
			if (this.szTitleField == "$aggregation$"){
				szTitle = szAgId;
			}
		} else {
			szId = szThemeLayer + "::" + String(ptPos.x) + ',' + String(ptPos.y) + (this.__fMultiParts ? ("," + String(nValue)) : "");
			this.themeNodesPosA[szId] = ptPos;
		}

		// if themetype is VECTOR, add the second position to the id
		// doing this, vectors can be aggregated
		//
		if (ptPos2 && this.szFlag.match(/VECTOR/)) {
			szId += '&' + String(ptPos2.x) + ',' + String(ptPos2.y);
			this.themeNodesPosA[szId] = ptPos2;
		}

		if (this.__fAggregate) {

			// ============================================
			// 
			// A G G R E G A T E   I T E M S
			//
			// aggregate by position and grid
			// make new theme item or add to existant
			//
			// ============================================

			// if the position (=szId) is new 
			if (!this.itemA[szId]) {

				if (suppress) {
					continue;
				}
				
				// ------------------------------------------
				// make a new item at the aggregate position
				// ------------------------------------------

				this.aggregationCount++;
				var nSize = 0;
				if (this.__fMultiParts) {
					nSize = nValueSize;
				} else
				if (this.__fExact) {
					var n = nValuesA[0] - 1;
					if (!isNaN(n)){
						nValuesA = this.nEmptyValuesA.slice(0);
						nValuesA[n] = (nValueSize);
						nSize = nValueSize;
						nCountA = this.nEmptyValuesA.slice(0);
						nCountA[n] = 1;
					}else{
						continue;
					}
				} else {
					for (k = 0; k < this.szFieldsA.length; k++) {
						nSize = Math.max(nSize, nValuesA[k] || 0);
					}
				}
				this.itemA[szId] = {
					nOrigValuesA: [],
					nValuesA: nValuesA,
					nValue100: nValue100,
					nValueSum: 0,
					nCount: 1,
					nCountA: nCountA
				};
				this.itemA[szId].szTitle = szTitle;
				this.itemA[szId].szSelectionId = String(szSelectionId);
				this.itemA[szId].szSelectionId2 = String(szSelectionId2);
				this.itemA[szId].nSize = (nValueSize || (this.objTheme.nSizeFieldIndex ? 0 : nSize));
				this.itemA[szId].nAlpha = (nAlphaValue || 1);
				this.itemA[szId].szColor = (szColor);
				this.itemA[szId].szTime = (szTime);
				this.itemA[szId].szValue = (szValue);

				this.itemA[szId].dbIndexA = [j];
				this.itemA[szId].ptPos = ptPos;
				this.itemA[szId].ptPos2 = ptPos2;
				this.itemA[szId].ptPosA = [ptOrigPos];

				this.nCount++;

			} else {

				if (suppress) {
					continue;
				}

				// -----------------------------------------------------------------
				// add the values(s) to the existing item at the aggregate position
				// -----------------------------------------------------------------

				var nSize = 0;
				if (this.__fMultiParts) {
					nSize = (nValueSize);
				} else
				if (this.__fExact) {
					var n = nValuesA[0] - 1;
					if (!isNaN(n)){
						if (this.__fMax) {
							this.itemA[szId].nValuesA[n] = Math.max((this.itemA[szId].nValuesA[n] || 0), (nValueSize));
						} else {
							this.itemA[szId].nValuesA[n] = (this.itemA[szId].nValuesA[n] || 0) + (nValueSize);
						}
						this.itemA[szId].nCountA[n] = (this.itemA[szId].nCountA[n] || 0) + (1);
						nSize = (nValueSize);
					}else{
						continue;
					}
				} else {
					for (k = 0; k < this.szFieldsA.length; k++) {
						if (this.__fMax) {
							this.itemA[szId].nValuesA[k] = Math.max(this.itemA[szId].nValuesA[k],nValuesA[k]||0);
						}else{
							this.itemA[szId].nValuesA[k] += nValuesA[k] || 0;
						}
						nSize = Math.max(nSize, nValuesA[k] || 0);
					}
				}

				if (this.__fMax) {
					this.itemA[szId].nSize = Math.max(this.itemA[szId].nSize,
													  (nValueSize || (this.objTheme.nSizeFieldIndex ? 0 : nSize)));
					this.itemA[szId].nAlpha = Math.max(this.itemA[szId].nAlpha,(nAlphaValue || 1));
					this.itemA[szId].nValue100 = Math.max(this.itemA[szId].nValue100,(nValue100 || 0));
				}else{
					this.itemA[szId].nSize += (nValueSize || (this.objTheme.nSizeFieldIndex ? 0 : nSize));
					this.itemA[szId].nAlpha += (nAlphaValue || 1);
					this.itemA[szId].nValue100 += nValue100 || 0;
				}
				this.itemA[szId].nCount++;
				this.itemA[szId].dbIndexA.push(j);
				this.itemA[szId].ptPosA.push(ptOrigPos);

				if (!szTitle || (szTitle != this.itemA[szId].szTitle)) {
					//this.itemA[szId].szTitle = (this.itemA[szId].nCount + " items aggregated");
					this.itemA[szId].szTitle = this.szAggregation+" (" + this.itemA[szId].nCount + ")";
					this.itemA[szId].szTitle = this.szAggregation+" of " + this.itemA[szId].nCount + " items";
				}

			}
		} else {

			// ============================================
			// 
			// O R I G I N A L    I T E M S
			//
			// load without aggregation
			// make a new item in any case 
			//
			// ============================================
			
			// if item with id exists, make unique id by adding a random value 
			if (this.itemA[szId]) {
				szId += "*" + Math.random();
			}

			this.aggregationCount++;
			this.itemA[szId] = {
				nOrigValuesA: [],
				nValuesA: nValuesA,
				nValue100: nValue100,
				nValueSum: 0
			};

			this.itemA[szId].szSelectionId = String(szThemeLayer + "::" +szSelectionId);
			this.itemA[szId].szSelectionId2 = String(szThemeLayer + "::" +szSelectionId2);
			this.itemA[szId].nSize = nValueSize || 0;
			this.itemA[szId].ptPos = ptPos;
			this.itemA[szId].ptPos2 = ptPos2;
			this.itemA[szId].dbIndexA = [j];

			this.itemA[szId].nX = nX;
			this.itemA[szId].nY = nY;

			this.itemA[szId].szColor = (szColor);
			this.itemA[szId].szTime = (szTime);
			this.itemA[szId].szValue = (szValue);

			this.nCount++;
		}

	} // end loop over data to load and aggregate


	// ============================================================================
	//
	// P O S T   L O A D / A G G R E G A T E    P R O C E S S I N G
	//
	// apply value functions like PERCENT PERMILLE FRACTION DIFFERENCE etc
	// make MEAN SUM etc 
	//
	// ============================================================================

	// if 100 value defined, make percent, permille, etc 
	// -------------------------------------------------------
	if (this.objTheme.nField100Index >= 0) {
		this.fField100 = true;
		if (this.szFlag.match(/DIFFERENCE/) && (this.itemA[a].nValuesA.length == 1) && !this.szFlag.match(/RELATIVE/)) {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					this.itemA[a].nValuesA[k] = this.itemA[a].nValuesA[k] - this.itemA[a].nValue100;
				}
			}
		} else
		if (this.szFlag.match(/FRACTION/)) {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					this.itemA[a].nValuesA[k] = this.itemA[a].nValuesA[k] / this.itemA[a].nValue100 * (this.nFractionScale || 1);
				}
			}
		} else
		if (this.szFlag.match(/PRODUCT/)) {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					this.itemA[a].nValuesA[k] *= this.itemA[a].nValue100;
				}
			}
		} else
		if (this.szFlag.match(/CALCVAL/)) {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					this.itemA[a].nValuesA[k] = Math.round(this.itemA[a].nValuesA[k] * this.itemA[a].nValue100 / 100);
				}
			}
		} else
		if (this.szFlag.match(/PERMILLE/)) {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					this.itemA[a].nValuesA[k] *= (1000 / this.itemA[a].nValue100);
				}
			}
		} else {
			for (a in this.itemA) {
				for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
					if ( this.itemA[a].nValue100 > (this.nField100Min||0) ){
						this.itemA[a].nValuesA[k] *= (100 / this.itemA[a].nValue100);
						if (this.itemA[a].nValuesA[k] > 0 && this.szFlag.match(/RELATIVE/)) {
							this.itemA[a].nValuesA[k] -= 100;
						} else
						if (this.itemA[a].nValuesA[k] > 0 && this.szFlag.match(/INVERT/)) {
							this.itemA[a].nValuesA[k] = 100 - nValue;
						}
					}else{
						this.itemA[a].nValuesA[k] = 0;
					}	
				}
			}
		}
	} else
		// if AGGREGATE|MEAN, divide values per aggregation count 
		// -------------------------------------------------------
		if (this.__fAggregate && this.szFlag.match(/MEAN/)) {
			if (this.__fMultiParts) {
				for (a in this.itemA) {
					this.itemA[a].nSize /= this.itemA[a].nCount;
				}
			} else {
				for (a in this.itemA) {
					if (this.itemA[a].nCountA) {
						for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
							this.itemA[a].nValuesA[k] /= (this.itemA[a].nCountA[k] || 1);
						}
					} else {
						for (k = 0; k < this.itemA[a].nValuesA.length; k++) {
							this.itemA[a].nValuesA[k] /= (this.itemA[a].nCount);
						}
					}
					if (!this.szFlag.match(/SIZESUM/)){
						this.itemA[a].nSize /= this.itemA[a].nCount;
					}
				}
			}
		}

	if (this.szFlag.match(/DIFFERENCE/)) {
		for (var a in this.itemA) {
			for (var i = 0; i < this.itemA[a].nValuesA.length; i++) {
				if (i < this.itemA[a].nValuesA.length - 1) {
					var nTemp = this.itemA[a].nValuesA[i];
					this.itemA[a].nValuesA[i] = this.itemA[a].nValuesA[i + 1] - this.itemA[a].nValuesA[i];
					if (this.szFlag.match(/RELATIVE/)) {
						this.itemA[a].nValuesA[i] = (nTemp>(this.nField100Min||0))?(100 / nTemp * this.itemA[a].nValuesA[i]):0;
					}
				} else if (!this.szFlag.match(/STACKED/)) {
					this.itemA[a].nValuesA[i] = 0;
				}
			}
			this.itemA[a].nValuesA.pop();
		}
	}

	// if AUTO100, recalcolate values in % of sum of values 
	// -------------------------------------------------------
	if (this.szFlag.match(/AUTO100/)) {
		// GR 12/03/2023 if stacked chart 
		if(this.nGridX ){
			for (var a in this.itemA) {
				var i = 0;
				do {
					var nValue100 = 0;
					for (var ii=0; ii<this.nGridX; ii++){
						nValue100 += this.itemA[a].nValuesA[i+ii] || 0;
					}
					for (var ii=0; ii<this.nGridX; ii++){
						this.itemA[a].nValuesA[i+ii] /= (nValue100 / 100);
					}
					i += this.nGridX;
				}
				while (i<this.itemA[a].nValuesA.length);
			}
		}else{
			for (var a in this.itemA) {
				var nValue100 = 0;
				for (var i = 0; i < this.itemA[a].nValuesA.length; i++) {
					nValue100 += this.itemA[a].nValuesA[i] || 0;
				}
				this.itemA[a].nValue100 = nValue100;
				this.fField100 = true;
				for (var i = 0; i < this.itemA[a].nValuesA.length; i++) {
					this.itemA[a].nValuesA[i] /= (this.itemA[a].nValue100 / 100);
				}
			}
		}
	}

	// if RELOCATE, recalcolate center from original positions 
	// -------------------------------------------------------
	if (this.szFlag.match(/RELOCATE/) || this.szAggregationField) {
		for (a in this.itemA) {
			if (this.itemA[a].ptPosA) {
				var x = 0,
					y = 0;
				for (var p = 0; p < this.itemA[a].ptPosA.length; p++) {
					x += this.itemA[a].ptPosA[p].x;
					y += this.itemA[a].ptPosA[p].y;
				}
				this.itemA[a].ptPos = {
					x: (x / this.itemA[a].nCount),
					y: (y / this.itemA[a].nCount)
				};
			}
		}
	}

	// filter by min aggregation count
	// -------------------------------------------------------
	if (this.szMinAggregation) {
		
		// get media aggregation count
		// used for minaggregation == 'auto'
		var nCount = 0;
		var nMediaCount = 0;
		for (a in this.itemA) {
			nMediaCount += this.itemA[a].nCount;
			nCount++;
		}
		nMediaCount /= nCount;
		
		// filter by media aggregation count/2 or given minimum
		for (a in this.itemA) {
			if (this.itemA[a].nCount && (this.itemA[a].nCount < (this.nMinAggregation || Math.sqrt(nMediaCount)-1))) {
				delete this.itemA[a];
			}
		}
	}

	// calculate min/max
	// -----------------------------------------------------
	this.nMin = Number.MAX_VALUE;
	this.nMax = (-Number.MAX_VALUE);
	this.nMinA = [];
	this.nMaxA = [];

	if (this.__fExact || this.szSizeField) {
		for (a in this.itemA) {
			if (isFinite(this.itemA[a].nSize) && !isNaN(this.itemA[a].nSize)) {
				this.nMin = this.nMinSize = Math.min(this.nMinSize, this.itemA[a].nSize);
				this.nMax = this.nMaxSize = Math.max(this.nMaxSize, this.itemA[a].nSize);
				this.nSumSize += this.itemA[a].nSize;
			}
		}
	} else {
		for (a in this.itemA) {
			for (var v = 0; v < this.itemA[a].nValuesA.length; v++) {
				if (isFinite(this.itemA[a].nValuesA[v]) && !isNaN(this.itemA[a].nValuesA[v])) {
					this.nMin = Math.min(this.itemA[a].nValuesA[v], this.nMin);
					this.nMax = Math.max(this.itemA[a].nValuesA[v], this.nMax);
				}
			}
		}
	}

	for (a in this.itemA) {
		for (var v = 0; v < this.itemA[a].nValuesA.length; v++) {
			if (isFinite(this.itemA[a].nValuesA[v]) && !isNaN(this.itemA[a].nValuesA[v])) {
				this.nMinA[v] = Math.min(this.itemA[a].nValuesA[v], this.nMinA[v] || Number.MAX_VALUE);
				this.nMaxA[v] = Math.max(this.itemA[a].nValuesA[v], this.nMaxA[v] || (-Number.MAX_VALUE));
				this.nSumA[v] += this.itemA[a].nValuesA[v];
			} else {
				this.nMinA[v] = (this.nMinA[v] || Number.MAX_VALUE);
				this.nMaxA[v] = (this.nMaxA[v] || (-Number.MAX_VALUE));
			}
		}
	}

	// alphafield max/min/sum 
	// -------------------------------------------------------
	if (this.szAlphaField) {
		for (a in this.itemA) {
			if (isFinite(this.itemA[a].nAlpha) && !isNaN(this.itemA[a].nAlpha)) {
				this.nMinAlpha = Math.min(this.nMinAlpha, this.itemA[a].nAlpha);
				this.nMaxAlpha = Math.max(this.nMaxAlpha, this.itemA[a].nAlpha);
				this.nSumAlpha += this.itemA[a].nAlpha;
			}
		}
	}

	// sizefield max/min/sum 
	// -------------------------------------------------------
	if (this.szSizeField) {
		for (a in this.itemA) {
			if (isFinite(this.itemA[a].nSize) && !isNaN(this.itemA[a].nSize)) {
				this.nMinSize = Math.min(this.nMinSize, this.itemA[a].nSize);
				this.nMaxSize = Math.max(this.nMaxSize, this.itemA[a].nSize);
				this.nSumSize += this.itemA[a].nSize;
			}
		}
	}

	// plot x/y field max/min/sum 
	// -------------------------------------------------------
	if (this.szXField) {
		for (a in this.itemA) {
			if (!isNaN(this.itemA[a].nX)) {
				this.nMinX = Math.min(this.nMinX, this.itemA[a].nX);
				this.nMaxX = Math.max(this.nMaxX, this.itemA[a].nX);
				this.nSumX += this.itemA[a].nX;
			}
		}
	}
	if (this.szYField) {
		for (a in this.itemA) {
			if (!isNaN(this.itemA[a].nY)) {
				this.nMinY = Math.min(this.nMinY, this.itemA[a].nY);
				this.nMaxY = Math.max(this.nMaxY, this.itemA[a].nY);
				this.nSumY += this.itemA[a].nY;
			}
		}
	}

	// if valuefield defined and equal to sizefield, we can deliver it in FAST aggregation 
	// -------------------------------------------------------------------------------
	if (this.szValueField && (this.szSizeField == this.szValueField)) {
		for (a in this.itemA) {
			this.itemA[a].szValue = String(this.itemA[a].nSize);
		}
		//this.szValueField = null;
	}

	if (this.oldSizefield) {
		this.szSizeField = this.oldSizefield;
		this.oldSizeField = null;
	}

	_TRACE("aggregated: " + this.aggregationCount);

	_TRACE("coTable: " + this.nMissingLookupCount + " lookups missing");
	_TRACE("coTable: " + (100 - this.nMissingLookupCount / this.objTheme.dbRecords.length * 100).toFixed(2) + " % mapped");

	_TRACE("== done with js data loaded === ");

	this.fAnalyze = true;

	return true;
};

/**
 * load the values of the map theme from the map meta data
 * the meta data is stored in attributes of the items SVG element 
 * @type object
 * @return data table object or null 
 */
MapTheme.prototype.loadTableFromMap = function () {

	var i;
	var j;
	var k;
	var szId;
	var szSelectionId;
	var nValueA;
	var nValue100;
	var nvalueA;

	_TRACE("== MapTheme.loadTable()===> ");

	// define empty table object
	// -------------------------
	var table = {
		table: {
			fields: 0,
			records: 0
		},
		fields: [],
		records: []
	};

	// ------------------------
	// get fields
	// -------------------------

	var themeNode = SVGDocument.getElementById(this.szThemesA[0]);
	if (themeNode == null) {
		var themeNodesA = map.Tiles.getTileNodes(this.szThemesA[0]);
		if (themeNodesA) {
			themeNode = themeNodesA[0];
		}
	}
	if (!themeNode) {
		_TRACE(this.szThemes + '- not found');
		this.szThemes = "";
		return null;
	}
	var szFields = themeNode.getAttributeNS(szMapNs, "info");
	if (szFields == null || szFields === "") {
		this.szThemes = "";
		return null;
	}
	var szFieldsA = szFields.split('|');
	szFieldsA.push("FeatureId");

	for (i in szFieldsA) {
		table.fields.push({
			id: szFieldsA[i]
		});
		table.table.fields++;
	}

	// ------------------------
	// get values
	// ------------------------

	// 1. get all nodes of the theme layer
	// --------------------------------

	var nodeA = [];

	// GR 20.08.2007 accellerate value loading for untiled layer
	var valueRootNodeA = [];
	for (var iTheme = 0; iTheme < this.szThemesA.length; iTheme++) {

		var szTheme = this.szThemesA[iTheme];
		this.objTheme = this.objThemesA[szTheme];

		var layerObj = map.Layer.getLayerObj(this.szThemesA[iTheme]);
		if (layerObj == null) {
			alert("MapTheme error: no layer like '" + this.szThemesA[iTheme] + "'");
			return false;
		}
		if (layerObj.szFlag.match(/tiled/)) {
			valueRootNodeA[0] = map.Scale.canvasNode;
			valueRootNodeA.length = 1;
			// GR 18.04.2011 check if all tiles loaded
			this.fDataIncomplete = !map.Tiles.allTilesLoaded();
			break;
		} else {
			valueRootNodeA[valueRootNodeA.length] = SVGDocument.getElementById(layerObj.szName);
		}
	}

	var __fIdInParent = true;
	for (var iRoot = 0; iRoot < valueRootNodeA.length; iRoot++) {
		var childsA = valueRootNodeA[iRoot].getElementsByTagName('path');
		var childsB = valueRootNodeA[iRoot].getElementsByTagName('use');
		var childsC = valueRootNodeA[iRoot].getElementsByTagName('circle');

		for (i = 0; i < childsA.length; i++) {
			nodeA[nodeA.length] = childsA.item(i);
		}
		for (i = 0; i < childsB.length; i++) {
			nodeA[nodeA.length] = childsB.item(i);
		}
		for (i = 0; i < childsC.length; i++) {
			nodeA[nodeA.length] = childsC.item(i);
		}
	}

	// GR 07.10.2013 if no shapes present (flag NOSHAPE), search in <g> elements 
	if (nodeA.length === 0) {
		__fIdInParent = false;
		for (var iRoot = 0; iRoot < valueRootNodeA.length; iRoot++) {
			var childsA = valueRootNodeA[iRoot].getElementsByTagName('g');
			for (i = 0; i < childsA.length; i++) {
				nodeA[nodeA.length] = childsA.item(i);
			}
		}
	}

	// 2. loop over all nodes and read the info values
	// ------------------------------------------------

	for (i = 0; i < nodeA.length; i++) {
		if (nodeA[i].nodeType == 1 && nodeA[i].hasAttributeNS(szMapNs, "info")) {

			szId = __fIdInParent ? nodeA[i].parentNode.getAttributeNS(null, "id") : nodeA[i].getAttributeNS(null, "id");
			var fMatch = -1;
			if (szId && (szId.length !== 0)) {
				var szTest = map.Tiles.getMasterId(szId).split(':')[0];
				for (j = 0; j < this.szThemesA.length; j++) {
					if (szTest == this.szThemesA[j]) {
						fMatch = j;
					}
				}
			}
			// one tile representation of a shape is sufficient
			var szMasterId = map.Tiles.getMasterId(szId);
			if (this.itemA[szMasterId]) {
				continue;
			}
			if (fMatch >= 0) {
				var infoA = nodeA[i].getAttributeNS(szMapNs, "info").split('|');
				infoA.push(szMasterId.split("::")[1]);
				table.records.push(infoA);
				table.table.records++;
				this.itemA[szMasterId] = 1;
			}
		}
	}

	// clear the item array for loadValues()
	this.itemA = [];

	_TRACE("== done from shapes === ");
	return table;
};




/**
 * aggregate items with rules
 */
MapTheme.prototype.aggregateValues = function () {

	if (this.__fAggregateOnLoad) {
		return;
	}
	if (!this.szFlag.match(/AGGREGATE/) && !this.szFlag.match(/GROUP/)) {
		return;
	}
	if ((this.szAggregationUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nAggregationUpper)) ||
		(this.szAggregationLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale < this.nAggregationLower))) {
		return;
	}

	_TRACE("MapTheme.aggregateValues() ---> ");

	var uniqueTopicA = [];
	var uniqueTopicCount = [];
	var uniqueTopicValue = [];
	var uniqueTopicPos = [];
	var uniqueTopicTitleCount = [];

	var firstItemId = null;
	var nUniqueTopics = 0;

	this.nTopicsSkipedByZeroExclusion = 0;

	// --------------------------------------------
	// calcolate grid for aggregation
	// --------------------------------------------

	// grid defined in screen pixel, so gridwidth(meter) must be calcolated
	if (this.nGridWidthPx) {
		var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + map.Scale.normalX(this.nGridWidthPx), 1000);
		this.nGridWidth = maxDist;
	}
	// grid defined by matrix, make grid with n x n parts (n = nGridMatrix || 20)   
	if (this.nGridMatrix) {
		var mapArea = map.Zoom.getBox();
		var maxDist = map.Scale.getDistanceInMeter(1000, 1000, 1000 + mapArea.width, 1000);
		this.nGridWidth = maxDist / (this.nGridMatrix || 20) / map.Scale.nZoomScale;
	}

	// meters to internal x,y
	var nGridWidthMap = this.nGridWidth ? (Math.round(map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / 20) * map.Scale.nZoomScale * 20) : 0;

	// GR 10.09.2015 limit precision, solving problem: different gridposition with different map position
	// nGridWidthMap = Math.floor(nGridWidthMap*10000)/10000;	


	// --------------------------------------------
	// build array of unique topics to aggregate by
	// --------------------------------------------
	var getFirstKey = function (data) {
		for (var elem in data)
			return elem;
	};

	firstItemId = getFirstKey(this.itemA);

	var uI = "undefined";
	var szLayer = this.itemA[firstItemId].szSelectionId.split("::")[0];
	var newPos = null;

	var nHexaWidth = nGridWidthMap * 1.15;
	var nHexaHalf = nGridWidthMap * 1.15 / 2;
	var nHexa4th = nGridWidthMap / 4;

	// GR 12.05.2015 new
	//
	// A G G R E G A T E    B Y   value  
	//
	// -----------------------------------------------------------------------------------------
	if (this.szAggregationField) {

		for (var a in this.itemA) {

			var uI = "undefined";

			firstItemId = firstItemId || a;

			uI = this.itemA[a].szAggregation;

			// create unique item to collect, if not exist 
			if (!uniqueTopicA[uI]) {
				uniqueTopicA[uI] = [];
				uniqueTopicPos[uI] = new point(0, 0);
				uniqueTopicCount[uI] = 0;
				uniqueTopicValue[uI] = 0;
				nUniqueTopics++;
			}

			// add item to aggregation
			uniqueTopicA[uI][a] = this.itemA[a];

			// important: preset size with 1, if undefined 
			uniqueTopicA[uI][a].nSize = this.itemA[a].nSize || 1;
			uniqueTopicA[uI][a].szTitle = this.itemA[a].szTitle || uI;
			uniqueTopicValue[uI] += uniqueTopicA[uI][a].nSize;

			// add the node position to the collection, later we make the media (center of the collection)  
			var ptPos = this.getNodePosition(this.itemA[a].szSelectionId);
			if (ptPos) {
				uniqueTopicPos[uI].x += ptPos.x;
				uniqueTopicPos[uI].y += ptPos.y;
				uniqueTopicCount[uI]++;
			}
		}

	} else
	if (this.nGridWidth) {

		// A: aggregate by selectionId (= map position) + grid
		// ---------------------------------------------------

		for (a in this.itemA) {

			// A G G R E G A T E    B Y   position  
			//
			// -----------------------------------------------------------------------------------------

			var ptPos = this.getNodePosition(this.itemA[a].szSelectionId);

			if (ptPos) {

				// A G G R E G A T E   T O   1  
				//
				// if we have an aggregation grid without diffusion, 
				// round the position to the nearest grid point
				// -----------------------------------------------------------------------------------------
				if (this.szFlag.match(/\bRECT\b/)) {
					// rectangular grid
					// GR 02.05.2017, fixgrid: grid fixed to screen, not to map position
					if (this.szFlag.match(/FIXGRID/)) {
						var dX = map.Scale.mapCenter.x * map.Scale.nZoomScale;
						var dY = map.Scale.mapCenter.y * map.Scale.nZoomScale;
						newPos = new point(Math.round((ptPos.x + dX) / nGridWidthMap) * nGridWidthMap - dX,
							Math.round((ptPos.y + dY) / nGridWidthMap) * nGridWidthMap - dY);
					} else {
						newPos = new point(Math.round(ptPos.x / nGridWidthMap) * nGridWidthMap,
							Math.round(ptPos.y / nGridWidthMap) * nGridWidthMap);
					}
				} else {
					// diagonal grid

					if (this.szFlag.match(/PLOTY/)) {
						var yr = Math.round(ptPos.y / nGridWidthMap);
						var dx = (yr % 2) ? nHexaHalf : 0;
						newPos = new point(Math.round((ptPos.x + dx) / nHexaWidth) * nHexaWidth - dx,
							yr * nGridWidthMap);
					} else {
						var xr = Math.round(ptPos.x / nGridWidthMap);
						var dy = (xr % 2) ? nHexaHalf : 0;
						newPos = new point(xr * nGridWidthMap,
							Math.round((ptPos.y + dy) / nHexaWidth) * nHexaWidth - dy);
					}

					// HEXAGONAL GRID
					// above, we rounded the position to a rectangolar grid
					// because the diagonal grid is like a hexagonal grid, we must check if far out points belong to neighbours.
					// we do this, by comparing the distance of the original point to the rectangular center to 
					// the distance of the center of two neighbours or to the left, or to the right
					// if the distance to the neighbour is shorter, the point belongs to him

					// if the point is within the left or right triangle of the hexagon
					if ((Math.abs(x - ptPos.x) > nHexa4th)) {

						var ptPosA = [];
						var nDistA = [];
						// in a diagonal grid the neighbours are half way up and down
						dy = (dy === 0) ? nHexaHalf : 0;

						if (x > ptPos.x) {
							// get 2 neighbours to the left
							ptPosA[0] = new point(newPos.x - nGridWidthMap, newPos.y - nHexaHalf);
							ptPosA[1] = new point(newPos.x - nGridWidthMap, newPos.y + nHexaHalf);
						} else {
							// get 2 neighbours to the right
							ptPosA[0] = new point(newPos.x + nGridWidthMap, newPos.y - nHexaHalf);
							ptPosA[1] = new point(newPos.x + nGridWidthMap, newPos.y + nHexaHalf);
						}

						// calc the distances
						nDistA[0] = Math.sqrt(Math.pow((ptPosA[0].x - ptPos.x), 2) + Math.pow((ptPosA[0].y - ptPos.y), 2));
						nDistA[1] = Math.sqrt(Math.pow((ptPosA[1].x - ptPos.x), 2) + Math.pow((ptPosA[1].y - ptPos.y), 2));
						nDistA[3] = Math.sqrt(Math.pow((newPos.x - ptPos.x), 2) + Math.pow((newPos.y - ptPos.y), 2));

						// check if point belongs to neighbour
						if (nDistA[0] < nDistA[3]) {
							newPos = new point(Math.round(ptPosA[0].x / nGridWidthMap) * nGridWidthMap,
								Math.round((ptPosA[0].y + dy) / nHexaWidth) * nHexaWidth - dy);
						} else
						if (nDistA[1] < nDistA[3]) {
							newPos = new point(Math.round(ptPosA[1].x / nGridWidthMap) * nGridWidthMap,
								Math.round((ptPosA[1].y + dy) / nHexaWidth) * nHexaWidth - dy);
						}
					}
				}

				// this is the aggregation point id

				uI = szLayer + "::" + String(newPos.x) + "," + String(newPos.y);

				// if no relocation of the aggregation center to the center of the original points, 
				// we must set the aggregation center here 
				this.themeNodesPosA[a] = newPos;
				this.themeNodesPosA[uI] = newPos;

				if (!uniqueTopicA[uI]) {
					uniqueTopicA[uI] = [];
					uniqueTopicPos[uI] = new point(0, 0);
					uniqueTopicCount[uI] = 0;
					nUniqueTopics++;
				}
				// add item to gridded point
				uniqueTopicA[uI][a] = this.itemA[a];

				// important: preset size with 1, if undefined 
				uniqueTopicA[uI][a].nSize = this.itemA[a].nSize || 1;

				uniqueTopicPos[uI].x += ptPos.x;
				uniqueTopicPos[uI].y += ptPos.y;
				uniqueTopicCount[uI]++;

			} else {

				// position undefined
				// ------------------
				if (!uniqueTopicA[uI]) {
					uniqueTopicA[uI] = [];
					uniqueTopicPos[uI] = new point(0, 0);
					uniqueTopicCount[uI] = 0;
					this.fDataIncomplete = fTilesLoaded;
					nUniqueTopics++;
				}
				uniqueTopicA[uI][a] = this.itemA[a];
				uniqueTopicA[uI][a].nSize = this.itemA[a].nSize || 1;
				uniqueTopicCount[uI]++;

				// GR 29.11.2016
				// may be we have not loaded the tile, so this flag will force a tile load check
				// important for tiled layer, if the layer which defines the theme positions is not completely loaded
				// we can't do correct aggregation; fDataIncomplete -> waiting for the tiles and redraw the theme 
				this.fDataIncomplete = true;

			}
		}

	} else {

		// A: aggregate by selectionId (= map position)
		// --------------------------------------------

		for (a in this.itemA) {

			// A G G R E G A T E    B Y   position  
			//
			// -----------------------------------------------------------------------------------------

			var ptPos = this.getNodePosition(this.itemA[a].szSelectionId);

			if (ptPos) {

				// no grid, take the position to aggregate
				// ---------------------------------------
				uI = this.itemA[a].szSelectionId;

				if (!uniqueTopicA[uI]) {
					uniqueTopicA[uI] = [];
					uniqueTopicPos[uI] = new point(0, 0);
					uniqueTopicCount[uI] = 0;
					nUniqueTopics++;
				}
				// add item to gridded point
				uniqueTopicA[uI][a] = this.itemA[a];

				// important: preset size with 1, if undefined 
				uniqueTopicA[uI][a].nSize = this.itemA[a].nSize || 1;

				uniqueTopicPos[uI].x += ptPos.x;
				uniqueTopicPos[uI].y += ptPos.y;
				uniqueTopicCount[uI]++;

			} else {

				// position undefined
				// ------------------
				if (!uniqueTopicA[uI]) {
					uniqueTopicA[uI] = [];
					uniqueTopicPos[uI] = new point(0, 0);
					uniqueTopicCount[uI] = 0;
					this.fDataIncomplete = fTilesLoaded;
					nUniqueTopics++;
				}
				uniqueTopicA[uI][a] = this.itemA[a];
				uniqueTopicA[uI][a].nSize = this.itemA[a].nSize || 1;
				uniqueTopicCount[uI]++;

				// GR 29.11.2016
				// may be we have not loaded the tile, so this flag will force a tile load check
				// important for tiled layer, if the layer which defines the theme positions is not completely loaded
				// we can't do correct aggregation; fDataIncomplete -> waiting for the tiles and redraw the theme 
				this.fDataIncomplete = true;

			}
		}
	}

	_TRACE("== " + nUniqueTopics + " unique positions found == ");

	// --------------------------------------------
	// only aggregate positions
	// --------------------------------------------

	if (this.szFlag.match(/GROUP/)) {
		this.itemA = [];
		for (var t in uniqueTopicA) {
			var itemA = uniqueTopicA[t];

			this.indexA = [];
			for (a in itemA) {
				this.indexA.push(a);
			}
			var sortA = [];
			for (var i = 0; i < this.indexA.length; i++) {
				var nValue = itemA[this.indexA[i]].nValuesA[0];
				sortA.push({
					a: this.indexA[i],
					y: nValue
				});
			}
			// sort charts
			if (this.szFlag.match(/\bUP\b/)) {
				sortA.sort(this.sortDownChartObjectsCompare);
			} else {
				sortA.sort(this.sortUpChartObjectsCompare);
			}

			for (i in sortA) {
				itemA[sortA[i].a].szSelectionId = t;
				this.itemA[t + "*" + Math.random()] = itemA[sortA[i].a];
			}
		}
		_TRACE("== aggregation done == ");
		return;
	}

	// --------------------------------------------
	// aggregate within topics
	// --------------------------------------------

	if (this.szFlag.match(/CATEGORICAL/)) {

		// A: aggregate by CATEGORICAL value ( = sum the sizes )
		// ---------------------------------------------

		_TRACE("== aggregate by CATEGORICAL value == ");

		// with CATEGORICAL values, .nSize holds the aggregation value
		// so we must set the .szSizeField to a dummy, if not set in the definition of the theme,
		// to program the char draw algorithm to size the bubbles, ...
		//
		if (!this.szSizeField) {
			this.szSizeField = "$aggregation$";
		}
		for (var t in uniqueTopicA) {
			var itemA = uniqueTopicA[t];

			// GR 02.06.2016 count unique titles as number of aggregated items 
			// because we aggregate by exact values and position, and only the titlefield gives an entity id
			uniqueTopicTitleCount[t] = 0;
			var uniqueTitle = [];

			// aggregation by CATEGORICAL value
			//
			// first divide by CATEGORICAL value in .nValuesA[0]
			var exactItemA = [];
			for (a in itemA) {
				if (1 || !uniqueTitle[itemA[a].szTitle]) {
					uniqueTitle[itemA[a].szTitle] = 1;
					uniqueTopicTitleCount[t]++;
				}
				if (!exactItemA[itemA[a].nValuesA[0]]) {
					exactItemA[itemA[a].nValuesA[0]] = {
						itemA: []
					};
				}
				exactItemA[itemA[a].nValuesA[0]].itemA[a] = itemA[a];
			}
			// then aggregate 
			uniqueTopicA[t] = [];
			for (var v in exactItemA) {
				var itemX = exactItemA[v].itemA;
				var tItem = null;
				for (a in itemX) {
					if (tItem == null) {
						tItem = uniqueTopicA[t][a] = itemX[a];
						tItem.nCount = 1;
						tItem.dbIndexA = tItem.dbIndexA || [];
						tItem.nSize = (tItem.nSize || 1);
						tItem.nAlpha = (tItem.nAlpha || 1);
					} else {
						tItem.nCount += 1;
						tItem.nValue100 += itemX[a].nValue100;
						tItem.nSize += (itemX[a].nSize || 1);
						tItem.nAlpha += (itemX[a].nAlpha || 1);
						tItem.szValue = String(tItem.nSize);
						if (nGridWidthMap && !this.szAggregationField && (!tItem.szTitle || (tItem.nCount > 3))) {
							//tItem.szTitle = (this.formatValue(tItem.nCount, 0) + " " + map.Dictionary.getLocalText("items aggregated"));
							tItem.szTitle = "(" + tItem.nCount + ")";
						}
						tItem.dbIndexA.push(itemX[a].dbIndex);
					}
				}
			}
		}
	} else {

		// B: aggregate the values
		// --------------------------------------------

		_TRACE("== aggregate the values == ");
		for (t in uniqueTopicA) {
			var itemA = uniqueTopicA[t];

			// if we make average from aggregation ( SUM no set )
			// don't aggregate items with 1 zero value  
			if (!this.szFlag.match(/SUM/) && !this.szFlag.match(/ZEROISVALUE/)) {

				var skipA = [];
				var nItems = 0;

				for (a in itemA) {
					nItems++;
					if (itemA[a]) {
						for (var v = 0; v < itemA[a].nValuesA.length; v++) {
							if (itemA[a].nOrigValuesA[v] === 0) {
								skipA[a] = a;
								break;
							}
						}
					}
				}
				if (nItems > 1) {
					for (a in skipA) {
						delete itemA[a];
						this.nTopicsSkipedByZeroExclusion++;
					}
				}
			}

			// aggregate values over itemA
			// ---------------------------
			uniqueTopicA[t] = [];
			var tItem = null;
			for (a in itemA) {
				if (tItem == null) {
					tItem = uniqueTopicA[t][a] = itemA[a];
					tItem.nCount = 1;
					tItem.dbIndexA = tItem.dbIndexA || [];
					tItem.nSize = (tItem.nSize || 1);
					tItem.nAlpha = (tItem.nAlpha || 1);
				} else {
					for (var v = 0; v < itemA[a].nValuesA.length; v++) {
						tItem.nValuesA[v] += (itemA[a].nValuesA[v] || 0);
						tItem.nOrigValuesA[v] += (itemA[a].nOrigValuesA[v] || 0);
					}
					tItem.nCount += 1;
					tItem.nValue100 += itemA[a].nValue100;
					tItem.nSize += (itemA[a].nSize || 1);
					tItem.nAlpha += (itemA[a].nAlpha || 1);
					tItem.szValue = String(tItem.nSize);
					//					tItem.szTitle = (this.formatValue(tItem.nCount, 0) + " " + map.Dictionary.getLocalText("items aggregated"));
					tItem.szTitle = "(" + this.formatValue(tItem.nCount, 0) + ")";
					tItem.dbIndexA.push(itemA[a].dbIndex);
				}
			}
		}
	}

	_TRACE("== values aggregated by unique topics == ");

	// ---------------------------
	// get the aggregation center
	// ---------------------------
	if (this.szAggregationField || this.szFlag.match(/RELOCATE/)) {
		var centerPos = new point(0, 0);
		var low = 0;
		var left = 1000000;
		var centerCount = 0;
		var chartCount = 0;
		for (t in uniqueTopicA) {

			left = Math.min(left, uniqueTopicPos[t].x / uniqueTopicCount[t]);
			low = Math.max(low, uniqueTopicPos[t].y / uniqueTopicCount[t]);

			centerPos.x += uniqueTopicPos[t].x * (uniqueTopicValue[t] || 1);
			centerPos.y += uniqueTopicPos[t].y * (uniqueTopicValue[t] || 1);

			centerCount += uniqueTopicCount[t] * (uniqueTopicValue[t] || 1);
			chartCount += 1;
		}
		centerPos.x /= centerCount;
		centerPos.y /= centerCount;
		var leftPos = new point(left, centerPos.y);
		var lowPos = new point(centerPos.x, low);
	}

	_TRACE("== aggregation center set == ");

	// ---------------------------
	// set itemA = aggregated items
	// ---------------------------

	this.nMin = Number.MAX_VALUE;
	this.nMax = (-Number.MAX_VALUE);

	this.nMinSize = Number.MAX_VALUE;
	this.nMaxSize = 0;
	this.nSumSize = 0;

	this.nMinAlpha = Number.MAX_VALUE;
	this.nMaxAlpha = 0;
	this.nSumAlpha = 0;

	if (this.szFlag.match(/CATEGORICAL/)) {
		this.nMinA = [];
		this.nMaxA = [];
		this.nSumA = [];
		this.nOrigMinA = [];
		this.nOrigMaxA = [];
		this.nOrigSumA = [];
		this.nMedianA = [];
		this.nMeanA = [];
		this.nCountA = [];
	}

	// make array creation string for pivot values
	// array size = number of string to value entries 
	var szExactSize = "[";
	var nExactSize = this.nStringToValue - 1;
	for (var i = 0; i < nExactSize; i++) {
		szExactSize += "0,";
	}
	szExactSize += "]";

	this.itemA = [];
	var nUnique = 0;
	var nParts = Math.max(this.szRangesA ? this.szRangesA.length : 0, this.szExactA ? this.szExactA.length : 0) - (this.szFlag.match(/CATEGORICAL/) ? 0 : 1);

	_TRACE("== make aggregated topics == ");

	var fMultiParts = (this.szFlag.match(/CATEGORICAL/) &&
		(this.szFlag.match(/PIE/) ||
			this.szFlag.match(/BAR/) ||
			this.szFlag.match(/SEQUENCE/) ||
			this.szFlag.match(/PLOT/) ||
			this.szFlag.match(/DOMINANT/) ||
			this.szFlag.match(/\bUSER\b/) ||
			this.szFlag.match(/WAFFLE/))
	);


	for (t in uniqueTopicA) {
		nUnique++;
		if (t != "undefined") {
			var itemA = uniqueTopicA[t];
			var x;

			// -------------------------------------------------------------------------------------------
			// if CATEGORICAL and multi part charts defined in theme (pie, donut, sequence of bars)
			// resort values, every item gets n=coloscheme values with the aggregated size per CATEGORICAL value 
			// -------------------------------------------------------------------------------------------
			//
			if (fMultiParts) {

				// get a valid item id
				//
				for (a in itemA) {
					// get a valid item id
					x = a;
					break;
				}

				// define one item and redefine n values 
				//
				this.itemA[x] = {};

				// create values array  
				//
                var nValuesA = [];
				eval("nValuesA = " + szExactSize + ";");
				//				var nValuesA = [].slice.apply(new Uint8Array(nExactSize));

				var nMinA = [];
				var nMaxA = [];

				// grid points have new selection id = grid point position 
				//
				this.itemA[x].szSelectionId = x;
				this.itemA[x].szTitle = itemA[x].szTitle;

				// GR 12.05.2015
				// if aggregated by field values, position has been collected over points of same field value, 
				// here we must divide the x,y by the collection item count, and set it for the aggregated item
				//
				if (this.szAggregationField || this.szFlag.match(/RELOCATE/)) {

					if (this.szFlag.match(/ALIGN/)) {
						// a) align the charts
						// set all positions to the center of the theme
						// set unique selection Id (thes first we have found)
						// and let do the positioning by the CHART drawing function
						this.itemA[x].szSelectionId = firstItemId;
						if (this.szFlag.match(/\bUP\b/)) {
							this.themeNodesPosA[x] = new point(lowPos.x, lowPos.y);
						} else {
							this.themeNodesPosA[x] = new point(centerPos.x, centerPos.y);
						}
					} else {
						// b) set the center of the aggregation area
						this.themeNodesPosA[x] = new point((uniqueTopicPos[t].x / uniqueTopicCount[t]),
							(uniqueTopicPos[t].y / uniqueTopicCount[t]));
					}

				}

				this.itemA[x].dbIndexA = [];

				// because we aggregated before by the CATEGORICAL value and position
				// every item (a) rappresents the aggregated sum of one CATEGORICAL value
				// so in the new item we create, every CATEGORICAL sum is one value of the values array (nValuesA)
				// sum all size values to a final size 
				//
				var nSizeSum = 0;
				var nSizeCount = 0;
				for (a in itemA) {
					// here we set the sum of one CATEGORICAL value by the aggregated value kept in .nSize
					// -1 because n CATEGORICAL values are stores in the array nValuesA by index: 1 - n !!! and not by 0 - (n-1) as usual !!!
					//
					nValuesA[itemA[a].nValuesA[0] - 1] = itemA[a].nSize / ((this.szFlag.match(/SUM/)) ? 1 : itemA[a].nCount);
					nSizeSum += itemA[a].nSize;
					nSizeCount += itemA[a].nCount;

					// keep all the data row indexes 
					this.itemA[x].dbIndexA.push(itemA[a].dbIndex);
					for (var db in itemA[a].dbIndexA) {
						this.itemA[x].dbIndexA.push(itemA[a].dbIndexA[db]);
					}
					delete this.itemA[x].dbIndex;
				}

				// set the new values (aggregated sizes)
				this.itemA[x].nValuesA = this.itemA[x].nOrigValuesA = nValuesA;
				this.itemA[x].nMinA = nMinA;
				this.itemA[x].nMaxA = nMaxA;
				this.itemA[x].nSize = nSizeSum / ((this.szFlag.match(/SUM/)) ? 1 : nSizeCount);

				this.itemA[x].nCount = nSizeCount;

				this.itemA[x].nAlpha = itemA[a].nAlpha;

				this.itemA[x].szTitle = (this.nGridWidth && !this.szAggregationField && (uniqueTopicTitleCount[t] > 1)) ? (__formatValue(uniqueTopicTitleCount[t], 0) + " item(s) aggregated") : (this.itemA[x].szTitle || t);
				this.itemA[x].szValue = this.itemA[x].szTitle;
				this.itemA[x].szLabel = this.itemA[x].szTitle;

				// calcolate min/max size
				this.nMin = this.nMinSize = Math.min(this.nMinSize, this.itemA[x].nSize);
				this.nMax = this.nMaxSize = Math.max(this.nMaxSize, this.itemA[x].nSize);
				this.nSumSize += nSizeSum / ((this.szFlag.match(/SUM/)) ? 1 : nSizeCount);

				// calcolate min/max alpha
				this.nMinAlpha = Math.min(this.nMinAlpha, this.itemA[x].nAlpha);
				this.nMaxAlpha = Math.max(this.nMaxAlpha, this.itemA[x].nAlpha);
				this.nSumAlpha += this.itemA[x].nAlpha;

				// calcolate auto sum 100
				if (this.szFlag.match(/AUTO100/)) {
					var i;
					var nValue100 = 0;
					for (i = 0; i < this.itemA[x].nValuesA.length; i++) {
						nValue100 += this.itemA[x].nValuesA[i] || 0;
					}
					this.itemA[x].nValue100 = nValue100;
					this.fField100 = true;
					for (i = 0; i < this.itemA[x].nValuesA.length; i++) {
						this.itemA[x].nValuesA[i] = this.itemA[x].nOrigValuesA[i] / this.itemA[x].nValue100 * 100;
					}
				}
				if (this.szFlag.match(/CATEGORICAL/) && (this.szFlag.match(/CATEGORICAL/) || !this.nNormalSizeValue)) {
					if (!this.nMinA.length) {
						for (i = 0; i < this.itemA[x].nValuesA.length; i++) {
							this.nMinA[i] = null;
							this.nMaxA[i] = null;
							this.nSumA[i] = 0;
							this.nOrigMinA[i] = null;
							this.nOrigMaxA[i] = null;
							this.nOrigSumA[i] = 0;
							this.nMedianA[i] = 0;
							this.nMeanA[i] = 0;
							this.nCountA[i] = 0;
						}
					}
					for (i = 0; i < this.itemA[x].nValuesA.length; i++) {
						this.nMinA[i] = Math.min(this.nMinA[i] || this.itemA[x].nValuesA[i], this.itemA[x].nValuesA[i]);
						this.nMaxA[i] = Math.max(this.nMaxA[i] || this.itemA[x].nValuesA[i], this.itemA[x].nValuesA[i]);
						this.nSumA[i] += this.itemA[x].nValuesA[i];
						this.nOrigMinA[i] = Math.min(this.nOrigMinA[i] || this.itemA[x].nOrigValuesA[i], this.itemA[x].nOrigValuesA[i]);
						this.nOrigMaxA[i] = Math.max(this.nOrigMaxA[i] || this.itemA[x].nOrigValuesA[i], this.itemA[x].nOrigValuesA[i]);
						this.nOrigSumA[i] += this.itemA[x].nOrigValuesA[i];
						if (this.itemA[x].nValuesA[i]) {
							this.nCountA[i]++;
						}
					}
				}
				this.nCount = nUnique * nParts;

			} else {
				// ---------------------------------------------
				// for all other charts set the aggregated value 
				// ---------------------------------------------
				//
				for (a in itemA) {

					if (itemA[a]) {

						var newId = a;
						// GR 03.02.2017
						// if aggregation by grid, not by field, 
						// the new id must be the aggregatiuon topic = the agggregation position = the grid point
						// multiple aggregation (CATEGORICAL and not! multipart symbol, bar or pie), needed for MULTIPLE or MULTIGRID 
						if (!this.szAggregationField) {
							var newId = t;
							if (this.itemA[newId]) {
								newId = newId.split("*")[0] + "*" + Math.random();
							}
						}
						this.itemA[newId] = itemA[a];
						itemA[a].szValue = itemA[a].szValue || 1;

						// calcolate min/max size
						this.nMinSize = Math.min(this.nMinSize, this.itemA[newId].nSize);
						this.nMaxSize = Math.max(this.nMaxSize, this.itemA[newId].nSize);
						this.nSumSize += this.itemA[newId].nSize;

						// calcolate min/max alpha
						this.nMinAlpha = Math.min(this.nMinAlpha, this.itemA[newId].nAlpha);
						this.nMaxAlpha = Math.max(this.nMaxAlpha, this.itemA[newId].nAlpha);
						this.nSumAlpha += this.itemA[newId].nAlpha;

						// make sum or mean
						if (!this.szFlag.match(/SUM/)) {
							var nCount = (this.szFlag.match(/SUM/)) ? 1 : itemA[a].nCount;
							this.itemA[newId].nSize /= nCount;
							this.itemA[newId].szValue /= nCount;
							this.itemA[newId].nValue100 /= nCount;
						}

						// recalcolate min and max 
						//
						if (this.nGridWidth || this.szAggregationField) {
							// and for gridded aggregation also evt. percentages,...
							//
							nCount = (this.szFlag.match(/SUM/) || this.szFlag.match(/CATEGORICAL/)) ? 1 : itemA[a].nCount;

							this.itemA[newId].szSelectionId = a;
							for (var v = 0; v < this.itemA[newId].nValuesA.length; v++) {
								this.itemA[newId].nValuesA[v] /= nCount;
								this.itemA[newId].nOrigValuesA[v] /= nCount;
								// recalcolate percentages, ...
								if (this.itemA[newId].nValue100) {
									this.itemA[newId].nValuesA[v] = this.itemA[newId].nOrigValuesA[v] / this.itemA[newId].nValue100;
									if (!this.szFlag.match(/FRACTION/)) {
										this.itemA[newId].nValuesA[v] *= this.szFlag.match(/PERMILLE/) ? 1000 : 100;
									}
									if (this.szFlag.match(/INVERT/)) {
										this.itemA[newId].nValuesA[v] = 100 - this.itemA[newId].nValuesA[v];
									}
								}
								this.nMin = Math.min(this.itemA[newId].nValuesA[v] || Number.MAX_VALUE, this.nMin || Number.MAX_VALUE);
								this.nMax = Math.max(this.itemA[newId].nValuesA[v] || (-Number.MAX_VALUE), this.nMax || (-Number.MAX_VALUE));
							}
						} else {
							this.nMin = Math.min(this.itemA[newId].nSize, this.nMin || Number.MAX_VALUE);
							this.nMax = Math.max(this.itemA[newId].nSize, this.nMax || (-Number.MAX_VALUE));
						}

						// calcolate auto sum 100
						if (this.szFlag.match(/AUTO100/)) {
							var i;
							nValue100 = 0;
							for (i = 0; i < this.itemA[newId].nValuesA.length; i++) {
								nValue100 += this.itemA[newId].nValuesA[i] || 0;
							}
							this.itemA[newId].nValue100 = nValue100;
							this.fField100 = true;
							for (i = 0; i < this.itemA[newId].nValuesA.length; i++) {
								this.itemA[newId].nValuesA[i] = this.itemA[newId].nOrigValuesA[i] / this.itemA[newId].nValue100 * 100;
							}
						}

						if (this.szAggregationField || this.szFlag.match(/RELOCATE/)) {

							if (this.szFlag.match(/ALIGN/)) {
								// a) align the charts
								// set all positions to the center of the theme
								// set unique selection Id (thes first we have found)
								// and let do the positioning by the CHART drawing function
								if (this.szFlag.match(/\bUP\b/)) {
									this.themeNodesPosA[newId] = new point(lowPos.x, lowPos.y);
								} else {
									this.themeNodesPosA[newId] = new point(centerPos.x, centerPos.y);
								}
							} else {
								// b) set the center of the aggregation area
								this.themeNodesPosA[a] = new point((uniqueTopicPos[t].x / uniqueTopicCount[t]),
									(uniqueTopicPos[t].y / uniqueTopicCount[t]));
								this.themeNodesPosA[newId] = new point((uniqueTopicPos[t].x / uniqueTopicCount[t]),
									(uniqueTopicPos[t].y / uniqueTopicCount[t]));
							}

						}
					}
				}
			}
		}
	}

	// GR 11.10.2016 filter by min aggregation count
	// ---------------------------------------------
	if (this.szMinAggregation) {

		// get media aggregation count
		// used for minaggregation == 'auto'
		var nCount = 0;
		var nMediaCount = 0;
		for (a in this.itemA) {
			nMediaCount += this.itemA[a].nCount;
			nCount++;
		}
		nMediaCount /= nCount;

		// filter by media aggregation count/2 or given minimum
		for (a in this.itemA) {
			if (this.itemA[a].nCount && (this.itemA[a].nCount < (this.nMinAggregation || nMediaCount / 2))) {
				delete this.itemA[a];
			}
			/**
			else
			if (this.itemA[a].nSize && (this.itemA[a].nSize < (this.nMinAggregation || nMediaCount / 2))) {
				delete this.itemA[a];
			}
			**/
		}

		// !! recalculate min/max
		this.nMin = Number.MAX_VALUE;
		this.nMax = (-Number.MAX_VALUE);
		for (a in this.itemA) {
			for (var v = 0; v < this.itemA[a].nValuesA.length; v++) {
				this.nMin = Math.min(this.itemA[a].nValuesA[v], this.nMin);
				this.nMax = Math.max(this.itemA[a].nValuesA[v], this.nMax);
			}
		}
	}

	// -----------------------------------------------

	this.fSorted = true;
	_TRACE("== aggregation done == ");
};

/**
 * distribute the values to the color scheme classes
 * @type boolean
 * @return true if success
 */
MapTheme.prototype.distributeValues = function () {

	if (this.nCount === 0) {
		if (this.szFlag.match(/CATEGORICAL/)) {
			//_ERROR("ERROR on 'CATEGORICAL' theme: no matching values !");
			displayMessage("theme: no matching values !", 3000);
		}
		return false;
	}

	// GR 27.05.2018 new look for values outside of 3 times standard deviation
	//
	if (this.szFlag.match(/OUTLIER/)) {

		var nParts = this.szFieldsA.length;

		// get media and median 
		this.getMeanMedianQuantile();
		
		if (this.szFlag.match(/PLOT/)) {
			
			// get deviation
			for (var a in this.itemA) {
				var nPopA = [];
				for (var i = 0; i < nParts; i++) {
					if (this.itemA[a].nValuesA[i]) {
						nPopA.push(this.itemA[a].nValuesA[i]);
					}
				} 
				this.nDeviationA[a] = this.parent.getDeviationOfArray(nPopA);
			}

			for (var a in this.itemA) {
				for (var i = 0; i < nParts; i++) {
					if (Math.abs(this.itemA[a].nValuesA[i] - this.itemA[a].nValuesA[i-1]) > (this.nDeviationA[a])*2) {
						if (this.szFlag.match(/NOOUTLIER/)) {
							this.itemA[a].nValuesA[i] = this.itemA[a].nValuesA[i-1];
							//delete this.itemA[a];
						}
					}
				}
			}
			
		}else{

			// get deviation
			for (var i = 0; i < nParts; i++) {
				var nPopA = [];
				for (var a in this.itemA) {
					if (this.itemA[a].nValuesA[i]) {
						nPopA.push(this.itemA[a].nValuesA[i]);
					}
				}
				this.nDeviationA[i] = this.parent.getDeviationOfArray(nPopA);
			}

			for (var i = 0; i < nParts; i++) {
				for (var a in this.itemA) {
					if (Math.abs(this.itemA[a].nValuesA[i] - this.nMeanA[i]) > this.nDeviationA[i] * 3) {
						if (this.szFlag.match(/NOOUTLIER/)) {
							delete this.itemA[a];
						}
					} else {
						if (!this.szFlag.match(/NOOUTLIER/)) {
							delete this.itemA[a];
						}
					}
				}
			}
		}
		
		// !! GR 03.10.2019 recalculate min/max
		this.nMin = Number.MAX_VALUE;
		this.nMax = (-Number.MAX_VALUE);
		for (a in this.itemA) {
			for (var v = 0; v < this.itemA[a].nValuesA.length; v++) {
				if (!isNaN(this.itemA[a].nValuesA[v])){
					this.nMin = Math.min(this.itemA[a].nValuesA[v], this.nMin);
					this.nMax = Math.max(this.itemA[a].nValuesA[v], this.nMax);
				}
			}
		}

	}

	if (this.szFlag.match(/AGGREGATE/) || this.szFlag.match(/GROUP/)) {
		this.aggregateValues();
	}

	// GR 20.02.2018
	if (this.szSizeField == "$aggregation$") {
		this.szSizeField = null;
	}

	_TRACE("== MapTheme.distributeValues()");

	// GR 25.04.2011 CATEGORICAL must have ranges !
	if (this.szFlag.match(/CATEGORICAL/) && (!this.szExactA || !this.szExactA.length)) {
		this.szExactA = this.szExactA || [];
		// create ranges from value/index array
		if (this.nStringToValueA) {
			for (a in this.nStringToValueA) {
				this.szExactA.push(this.nStringToValueA[a]);
			}
			_TRACE("values: " + this.szExactA + " (generated)");
		}
	}
	// GR 25.04.2011 CATEGORICAL must have labels !
	if (this.szFlag.match(/CATEGORICAL/) && !(this.szLabelA && this.szLabelA.length)) {
		if (this.szValuesA) {
			this.szLabelA = this.szValuesA;
			_TRACE("(label generated from values)");
		}
	}

	// GR 16.02.2018 new color field
	// if explicit color field is defined, create color field value array
	// the length is the number of colors for the color scheme
	// -------------------------------------------------------------------
	if (this.szColorField) {
		this.colorFieldA = [];
		this.colorClassA = [];
		this.colorClassUsedA = [];
		// explicit color values defined ?
		if (this.szColorValuesA) {
			for (i in this.szColorValuesA) {
				this.colorFieldA[this.szColorValuesA[i]] = true;
			}
		} else
			// explicit values defined ?
			if (this.szValuesA) {
				for (i in this.szValuesA) {
					this.colorFieldA[this.szValuesA[i]] = true;
				}
			} else
				// if not, get unique color values from data
				for (a in this.itemA) {
					this.colorFieldA[this.itemA[a].szColor] = true;
				}
	}

	// GR 23.01.2019 new symbol field
	// if explicit symbol field is defined, create symbol field value array
	// the length is the number of symbol values
	// -------------------------------------------------------------------
	if (this.szSymbolField) {
		this.symbolFieldA = [];
		// explicit color values defined ?
		if (this.szSymbolValuesA) {
			for (i in this.szSymbolValuesA) {
				this.symbolFieldA[this.szSymbolValuesA[i]] = this.szSymbolsA[i];
			}
		} else
			// if not, get unique color values from data
			for (a in this.itemA) {
				this.symbolFieldA[this.itemA[a].szSymbol] = this.szSymbolsA[i];
			}
	}

	// --------------------------------------------------------------------

	// make colorscheme
	// ----------------

	if (!this.origColorScheme) {
		this.origColorScheme = this.colorScheme = this.defaultColorScheme;
	}
	_TRACE("colorScheme:" + this.origColorScheme + " (defined)");

	if (!isNaN(Number(this.origColorScheme[0]))) {
		// colorscheme must be >= number of fields
		if (!(this.szFlag.match(/SEQUENCE/) || this.szFlag.match(/\bCLIP\b/))) {
			if (this.szFieldsA.length > this.origColorScheme[0]) {
				this.origColorScheme[0] = this.szFieldsA.length;
			}
		}
		if (this.szFlag.match(/CATEGORICAL/)) {
			this.origColorScheme[0] = this.szExactA.length || 1;
		}
		// GR 16.02.2018 new color field
		// if explicit color field is defined, create color field value array
		// the length is the number of colors for the color scheme
		// -------------------------------------------------------------------
		if (this.szColorField) {
			var l = 0;
			for (a in this.colorFieldA) {
				l++;
			}
			this.origColorScheme[0] = l;
		}
		// --------------------------------------------------------------------

		// realize coloscheme
		// make all the colors
		// --------------------
		try {
			this.colorScheme = ColorScheme.createColorScheme(this.origColorScheme[1], this.origColorScheme[2], this.origColorScheme[0], this.origColorScheme[3], this.origColorScheme[4]);
		} catch (e) {
			this.colorScheme = this.defaultColorScheme;
		}


		// GR 28.03.2019
		// if CATEGORICAL theme and flag ORDER, assign the colors to alphabetically ordered exact values 
		// ---------------------------------------------------------------------------------------
		if (this.szFlag.match(/CATEGORICAL/) && this.szFlag.match(/ORDER/)) {

			var myColoscheme = this.colorScheme.slice();
			var myValuesA = this.szValuesA ? this.szValuesA.slice() : this.szLabelA.slice();

			if (this.szColorField) {
				myValuesA = [];
				for (a in this.colorFieldA) {
					myValuesA.push(a);
					this.getStringValueIndex(a, "set");
				}
			}

			if (myValuesA.length && myColoscheme.length && (myValuesA.length == myColoscheme.length)) {
				myValuesA.sort();
				this.colorScheme = [];
				for (var i = 0; i < myValuesA.length; i++) {
					this.colorScheme[this.nStringToValueA[myValuesA[i]] - 1] = myColoscheme[i];
				}
			}
		}

	} else {
		this.colorScheme = this.origColorScheme.slice(0);
	}

	// --------------------
	// GR 16.02.2018 new color field
	// if explicit color field is defined, assign color and class directly to items
	// -------------------------------------------------------------------
	if (this.szColorField) {
		var i = 0;
		for (a in this.colorFieldA) {
			this.colorClassA[a] = i;
			this.colorFieldA[a] = this.colorScheme[i++];
		}
		for (a in this.itemA) {
			this.itemA[a].nClass = this.colorClassA[this.itemA[a].szColor];
			this.itemA[a].szColor = this.colorFieldA[this.itemA[a].szColor];
		}
	}

	// --------------------
	// GR 23.01.2019 new symbol field
	// if explicit symbol field is defined, assign symbol directly to items
	// -------------------------------------------------------------------
	if (this.szSymbolField) {
		var i = 0;
		for (a in this.itemA) {
			this.itemA[a].szSymbol = this.symbolFieldA[this.itemA[a].szSymbol];
		}
	}
	// --------------------------------------------------------------------



	// GR 13.11.2016 user defined color scheme ?
	if (1 || this.colorScheme[0].match(/user/i)) {
		try {
			HTMLWindow.ixmaps.htmlgui_colorScheme(this);
		} catch (e) {}
	}

	// GR 23.04.2011
	// make shure that we have enough colors defined for DOMINANT type
	if (this.szFlag.match(/DOMINANT/)) {
		while (this.colorScheme.length < this.szFieldsA.length) {
			this.colorScheme[this.colorScheme.length] = "#dddddd";
			_TRACE("colorscheme: '" + this.colorScheme[this.colorScheme.length - 1] + "' added! -0-");
		}
	}

	// GR 08.10.2019
	// make shure that we have enough colors defined for fields > 1
	if (this.szFieldsA) {
		// GR 09.04.2020 if gridx is defined, number colors defined must be equal gridx 
		if ((this.colorScheme.length < this.szFieldsA.length) && this.nGridX ){
			while (this.colorScheme.length < this.nGridX) {
				this.colorScheme[this.colorScheme.length] = this.colorScheme[this.colorScheme.length - 1] || "#dddddd";
				_TRACE("colorscheme: '" + this.colorScheme[this.colorScheme.length - 1] + "' added! -2.1-");
			}
		}else
		if ( !this.szFlag.match(/\bCLIP\b/) )	
		while (this.colorScheme.length < this.szFieldsA.length) {
			this.colorScheme[this.colorScheme.length] = this.colorScheme[this.colorScheme.length - 1] || "#dddddd";
			_TRACE("colorscheme: '" + this.colorScheme[this.colorScheme.length - 1] + "' added! -2-");
		}
	}

	// nMax defined and flag NORMALIZE set
	// --------------------------------------------
	if (this.szFlag.match(/NORMALIZE/) && this.nMax) {
		var nRange = this.nMax - this.nMin;
		for (a in this.itemA) {
			this.itemA[a].nValuesA[0] = (this.itemA[a].nValuesA[0] - this.nMin) / nRange;
		}
		this.nMin = 0;
		this.nMax = 1;
	}
	// nMax defined and flag HARMONIZE set
	// --------------------------------------------
	if (this.szFlag.match(/HARMONIZE/) && this.nMax) {
		if (this.nMaxA) {
			this.nRangeA = [];
			for (v in this.nMaxA) {
				this.nRangeA.push(this.nMaxA[v] - this.nMinA[v]);
			}
			for (a in this.itemA) {
				for (v in this.itemA[a].nValuesA) {
					this.itemA[a].nValuesA[v] = (this.itemA[a].nValuesA[v] - this.nMinA[v]) / this.nRangeA[v];
				}
			}
			for (v in this.nMaxA) {
				this.nMinA[v] = 0;
				this.nMaxA[v] = 1;
			}
		} else {
			for (a in this.itemA) {
				this.itemA[a].nValuesA[0] /= this.nMax;
			}
			this.nMin /= this.nMax;
			this.nMax /= this.nMax;
		}
		this.nMin = 0;
		this.nMax = 1;
	}

	// sizefield defined and flag INVERTSIZE set
	// --------------------------------------------
	if (this.szFlag.match(/INVERTSIZE/) && this.szSizeField) {
		for (a in this.itemA) {
			this.itemA[a].nSize = this.nMaxSize - this.itemA[a].nSize;
		}
		this.nNormalSizeValue = this.nNormalSizeValue || this.nMaxSize;
	}

	_TRACE("start making classes ==>");

	// prepare median and quantile !! only 1. field 
	// --------------------------------------------
	if (!this.szFlag.match(/CATEGORICAL/) && !this.szFlag.match(/SEQUENCE/)) {
		this.getMeanMedianQuantile();
	}

	_TRACE("distrubute values ==> classes");

	// distribute values in ranges (classes)
	// -------------------------------------
	var nParts = this.colorScheme.length;
	var nRange = this.nMax - this.nMin;
	var nMin = this.nMin;
	var nMax = this.nMax;

	if ((this.nRangeCenterValue != null) && !isNaN(this.nRangeCenterValue)) {
		var nSymRange = Math.max(Math.abs(this.nRangeCenterValue - nMin), Math.abs(nMax - this.nRangeCenterValue));
		nMin = this.nRangeCenterValue - nSymRange;
		nMax = this.nRangeCenterValue + nSymRange;
		nRange = nMax - nMin;
	}

	if (this.szFlag.match(/INTEGER/)) {
		if (nParts > nRange) {
			nParts = nRange;
		} else if (nParts > nRange / 2) {
			nParts = Math.floor(nRange / 2);
		} else {
			nRange += nParts - nRange % nParts;
		}
	} else {
		// clip range to nearest precision
		var nPreClip = 1;
		if (this.szField100) {
			nPreClip = 0.01;
		}
		while (nRange > nPreClip * 1000) {
			nPreClip *= 10;
		}
		if (nPreClip > 1) {
			nMin = Math.floor(nMin / nPreClip) * nPreClip;
			nMax = Math.ceil(nMax / nPreClip) * nPreClip;
		} else {
			nMax += nMax / 100000;
		}
		nRange = nMax - nMin;
	}

	_TRACE("set range values ==>");
	
	if (this.szFlag.match(/CHART|CHOROPLETH/)) {
		if ( isNaN(nRange) || !isFinite(nRange) ){
			_ERROR("ERROR on distributeValues: infinite range !");
			displayMessage("ERROR: infinite value range !", 3000);
			return false;
		}
	}

	// GR 23.01.2019 if colorfield is defined, ranges must follow this values to calcolate color distribution
	// but this exeption must be reverted after the calculation of the ranges, for CATEGORICAL theme types  
	//
	if (this.szColorField) {
		this.nRangesA = [];
		var i = 0;
		for (a in this.colorFieldA) {
			this.nRangesA.push(i++);
		}
	} else {
		this.nRangesA = this.szRangesA || this.szExactA;
	}
	
	if (this.nRangesA && this.nRangesA.length) {

		// explicit ranges
		//
		// n ranges are defined by n+1 values 
		// example: 1,5,10,15 defines 3 ranges: 1-5, 5-10, 10-15 
		// 
		// in case of flag | CATEGORICAL, n ranges define n discret values
		// ! the ranges are created by maptheme.getStringValueIndex(value)
		// ---------------------------------------------------------------

		var nRangeWidth = this.szFlag.match(/CATEGORICAL/) ? 0 : 1;
		
		if ( this.szFlag.match(/BAR/) && this.szFlag.match(/SEQUENCE/)){
			nRangeWidth = 1;
		}
		
		// set number of parts from ranges, if flag CATEGORICAL, parts = number of rangevalues, if not, parts = number of rangevalues-1 
		nParts = this.nRangesA.length - nRangeWidth;
		// ------------------------------------------------------

		// if we have symbols, make shure that we have enought
		if (this.szSymbolsA && this.szSymbolsA.length) {
			while (this.szSymbolsA.length < nParts) {
				this.szSymbolsA[this.szSymbolsA.length] = this.szSymbolsA[this.szSymbolsA.length - 1];
			}
			_TRACE("symbols: '" + this.szSymbolsA[this.szSymbolsA.length - 1] + "' added!");
		}
		// if we have a color scheme, make shure that we have enough colors defined
		if (this.colorScheme && this.colorScheme.length) {
			while (this.colorScheme.length < nParts) {
				this.colorScheme[this.colorScheme.length] = this.colorScheme[this.colorScheme.length - 1] || "#dddddd";
			}
			_TRACE("colorscheme: '" + this.colorScheme[this.colorScheme.length - 1] + "'added! -1-");
		}

		// set the part values to range limits, if flag CATEGORICAL, min == max !
		// --------------------------------------------------------------------
		var i;
		this.partsA = [];
		for (i = 0; i < nParts; i++) {
			var nMin = Number(this.nRangesA[i]);
			var nMax = Number(this.nRangesA[i + nRangeWidth]) + 0.000000001;
			this.partsA[this.partsA.length] = {
				min: (nMin),
				max: (nMax),
				color: this.colorScheme[i],
				nCount: 0,
				nSum: 0
			};
		}

		if (this.szFlag.match(/CATEGORICAL/) && this.exactCountA) {
			for (i = 0; i < nParts; i++) {
				this.partsA[i].nCount = this.exactCountA[i];
			}
		}
		// get media and deviation 
		if (this.szFlag.match(/PLOTVAR/) || this.szFlag.match(/DOMINANT/)) {
			this.getMeanMedianQuantile();
			// get deviation
			for (i = 0; i < nParts; i++) {
				var nPopA = [];
				for (a in this.itemA) {
					if (this.itemA[a].nValuesA[i]) {
						nPopA.push(this.itemA[a].nValuesA[i]);
					}
				}
				this.nDeviationA[i] = this.parent.getDeviationOfArray(nPopA);

				this.szDominantFilter = this.szDominantFilter || "min";
				this.nDominantDFilter = this.nDominantDFilter || 0;

				if (this.szDominantFilter.match(/min/)) {
					this.nFilterA[i] = this.nMinA[i] + ((this.nMaxA[i] - this.nMinA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/max/)) {
					this.nFilterA[i] = this.nMinA[i] + ((this.nMaxA[i] - this.nMinA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/mean/)) {
					this.nFilterA[i] = this.nMeanA[i] + ((this.nMaxA[i] - this.nMeanA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/median/)) {
					this.nFilterA[i] = this.nMedianA[i] + ((this.nMaxA[i] - this.nMedianA[i]) / 100 * this.nDominantDFilter);
				}
			}
		}
	} else {

		// automatic ranges 
		//
		// created by distribution algorithms
		//
		// EQUIDISTANT, LOG, QUANTILE etc.
		// ---------------------------------------------------------------

		var i;
		var nStep = nRange / nParts;

		_TRACE("nStep:" + nStep);
		if (nStep > nPreClip) {
			nStep = Math.floor(nStep / nPreClip) * nPreClip;
		}
		_TRACE("nStep:" + nStep + " (clipped)");

		_TRACE("mapTheme min:" + this.nMin + " max:" + this.nMax + " Range:" + nRange + " Parts:" + nParts + " Step:" + nStep);
		if (this.nMin == this.nMax) {
			nParts = 1;
		}
		this.partsA = [];
		for (i = 0; i < nParts; i++) {
			this.partsA[this.partsA.length] = {
				min: (nMin + i * nStep),
				max: nMin + (i + 1) * nStep,
				color: this.colorScheme[i],
				nCount: 0,
				nSum: 0
			};
		}
		this.partsA[this.partsA.length - 1].max = nMax;

		if (this.szFlag.match(/QUANTILE/)) {
			this.getMeanMedianQuantile();
			var nMaxMember = Math.round(this.quantileA[0].length / nParts);
			for (i = 0; i < this.partsA.length; i++) {
				this.partsA[i].min = this.quantileA[0][i * nMaxMember];
				this.partsA[i].max = this.quantileA[0][(i + 1) * nMaxMember];
			}
			this.partsA[this.partsA.length - 1].max = nMax;
		}

		if (this.szFlag.match(/LOG/)) {
			var nMin = Math.log(this.nMin ? this.nMin : (Math.min(0.1, this.nMax / 10)));
			var nRange = Math.log(this.nMax ? this.nMax : 0.1) - nMin;
			var nStep = nRange / nParts;
			this.partsA = [];
			for (i = 0; i < nParts; i++) {
				this.partsA[this.partsA.length] = {
					min: Math.exp(nMin + i * nStep),
					max: Math.exp(nMin + (i + 1) * nStep),
					color: this.colorScheme[i],
					nCount: 0,
					nSum: 0
				};
			}
			this.partsA[this.partsA.length - 1].max = this.nMax;
		} else
		if (this.szFlag.match(/POW2/)) {
			var nMin = Math.pow((this.nMin ? this.nMin : 1), 1 / 2);
			var nRange = Math.pow((this.nMax ? this.nMax : 1), 1 / 2) - Math.pow((this.nMin ? this.nMin : 1), 1 / 2);
			var nStep = nRange / nParts;
			this.partsA = [];
			for (i = 0; i < nParts; i++) {
				this.partsA[this.partsA.length] = {
					min: Math.pow((nMin + i * nStep), 2),
					max: Math.pow((nMin + (i + 1) * nStep), 2),
					color: this.colorScheme[i],
					nCount: 0,
					nSum: 0
				};
			}
			this.partsA[this.partsA.length - 1].max = this.nMax;
		} else
		if (this.szFlag.match(/POW3/)) {
			var nMin = Math.pow((this.nMin ? this.nMin : 1), 1 / 3);
			var nRange = Math.pow((this.nMax ? this.nMax : 1), 1 / 3) - Math.pow((this.nMin ? this.nMin : 1), 1 / 3);
			var nStep = nRange / nParts;
			this.partsA = [];
			for (i = 0; i < nParts; i++) {
				this.partsA[this.partsA.length] = {
					min: Math.pow((nMin + i * nStep), 3),
					max: Math.pow((nMin + (i + 1) * nStep), 3),
					color: this.colorScheme[i],
					nCount: 0,
					nSum: 0
				};
			}
			this.partsA[this.partsA.length - 1].max = this.nMax;
		}

		if (this.szFlag.match(/DOMINANT/) || this.szFlag.match(/OFFSETMEAN/) || this.szFlag.match(/OFFSETMEDIAN/) ||
			this.szFlag.match(/DEVIATION/) || this.szFlag.match(/PLOTVAR/)) {
 			this.getMeanMedianQuantile();
			for (i = 0; i < this.szFieldsA.length; i++) {

				var quantileA = [];
				for (a in this.itemA) {
					if (this.itemA[a].nValuesA[i]) {
						quantileA.push(this.itemA[a].nValuesA[i]);
					}
				}
				if ((this.szFieldsA[i] != "$item$")) {
					quantileA.sort(this.sortUp);
				}
				this.nMedianA[i] = quantileA[Math.round(quantileA.length / 2)];

				if (this.nSum100) {
					if (this.szFlag.match(/DIFFERENCE/)) {
						this.nMeanA[i] = this.nSumA[i] / this.nCount;
					} else {
						this.nMeanA[i] = this.nOrigSumA[i] / this.nSum100;
						if (this.szFlag.match(/FRACTION/)) {
							this.nMeanA[i] *= (this.nFractionScale || 1);
						} else
						if (this.szFlag.match(/PERMILLE/)) {
							this.nMeanA[i] *= 1000;
						} else {
							this.nMeanA[i] *= 100;
							if (this.szFlag.match(/RELATIVE/)) {
								this.nMeanA[i] -= 100;
							} else
							if (this.szFlag.match(/INVERT/)) {
								this.nMeanA[i] = 100 - this.nMeanA[i];
							}
						}
					}
				} else {
					this.nMeanA[i] = this.nSumA[i] / this.nCount;
				}
			}

			// GR 16.08.2017 create filter for DOMINANT or DEVIATION 
			for (i = 0; i < this.partsA.length; i++) {
				// preset with default if not set
				//
				this.szDominantFilter = this.szDominantFilter || "min";
				this.nDominantDFilter = this.nDominantDFilter || 0;

				if (this.szDominantFilter.match(/min/)) {
					this.nFilterA[i] = this.nMinA[i] + ((this.nMaxA[i] - this.nMinA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/max/)) {
					this.nFilterA[i] = this.nMinA[i] + ((this.nMaxA[i] - this.nMinA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/mean/)) {
					this.nFilterA[i] = this.nMeanA[i] + ((this.nMaxA[i] - this.nMeanA[i]) / 100 * this.nDominantDFilter);
				} else if (this.szDominantFilter.match(/median/)) {
					this.nFilterA[i] = this.nMedianA[i] + ((this.nMaxA[i] - this.nMedianA[i]) / 100 * this.nDominantDFilter);
				}

				_TRACE("part-" + i + ": " + " min:" + this.nMinA[i] + " max:" + this.nMaxA[i] + " mean:" + this.nMeanA[i] + " median:" + this.nMedianA[i] + " filter:" + this.nFilterA[i]);
			}

			if (this.szFlag.match(/DEVIATION/) || this.szFlag.match(/PLOTVAR/)) {
				// get deviation
				for (i = 0; i < this.szFieldsA.length; i++) {
					var nPopA = [];
					for (a in this.itemA) {
						if (this.itemA[a].nValuesA[i]) {
							nPopA.push(this.itemA[a].nValuesA[i]);
						}
					}
					this.nDeviationA[i] = this.parent.getDeviationOfArray(nPopA);
				}
			}
		}
	}

	// GR 23.04.2015 we test for < max, so add something little for the last part 
	this.partsA[this.partsA.length - 1].max += 0.001;


	// GR 23.01.2019 we must undo the ranges set on this.szColorField defined
	if (this.szColorField) {
		this.nRangesA = this.szRangesA || this.szExactA;
	}

	// intensity calculation for COMPOSECOLOR -----------------
	//
	if (this.szFlag.match(/COMPOSECOLOR/)) {
		__maptheme_initComposedColor(this.colorScheme.slice(0));
	}

	_TRACE("== done === ");
	return true;
};

// .............................................................................
// local helpers 
// .............................................................................

/**
 * private sort function 
 */
MapTheme.prototype.sortUp = function (a, b) {
	return (a - b);
};
/**
 * private sort function 
 */
MapTheme.prototype.sortIndexUp = function (a, b) {
	return (a.value - b.value);
};
/**
 * private sort function 
 */
MapTheme.prototype.sortIndexDown = function (a, b) {
	return (b.value - a.value);
};
/**
 * private sort function 
 */
MapTheme.prototype.sortPartsUp = function (a, b) {
	return (a.nCount - b.nCount);
};
/**
 * private sort function 
 */
MapTheme.prototype.sortMeanUp = function (a, b) {
	return (a.mean - b.mean);
};
/**
 * private unsort function 
 * GR 15.11.2013 cached random added
 */
MapTheme.prototype.shuffleArray = function (a, randA) {
	for (var i = a.length - 1; i > 0; i--) {
		var j = Math.floor(((randA && randA[i]) ? randA[i] : Math.random()) * i + 1);
		var tmp = a[i];
		a[i] = a[j];
		a[j] = tmp;
	}
};
/**
 * private random array function 
 * cache random, so the chart will not change on redraw
 */
MapTheme.prototype.getRandomNumberArray = function (count) {
	var r = [];
	for (var i = 0; i < count; i++) {
		r.push(Math.random());
	}
	return r;
};

// ----------------
//  compose color 
// ----------------

/**
 * local variables 
 */
var sum_composecolor_intensity = 0;
var mean_composecolor_intensity = 0;

/**
 * private function to calculate composecolor sum and mean intensity  
 * using additive algorithm
 */
var __maptheme_initComposedColor = function (szColorsA) {
	sum_composecolor_intensity = 0;
	mean_composecolor_intensity = 0;

	for (var v = 0; v < szColorsA.length; v++) {
		var cc1 = ColorScheme.getHexaColor(szColorsA[v]);
		mean_composecolor_intensity += Math.max(Math.max(parseInt(cc1.substr(1, 2), 16), parseInt(cc1.substr(3, 2), 16)), parseInt(cc1.substr(5, 2), 16));
		sum_composecolor_intensity += (parseInt(cc1.substr(1, 2), 16) + parseInt(cc1.substr(3, 2), 16) + parseInt(cc1.substr(5, 2), 16));
	}
	sum_composecolor_intensity /= szColorsA.length;
	mean_composecolor_intensity /= szColorsA.length;
};

/**
 * private function to create a color from an array of colors and values 
 * using additive algorithm
 */
var __maptheme_getComposedColor_additive = function (nValuesA, szColorsA, nMax, nBrightness) {
	var rr1 = 0,
		gg1 = 0,
		bb1 = 0;
	for (var v = 0; v < nValuesA.length; v++) {
		var cc1 = ColorScheme.getHexaColor(szColorsA[v]);
		rr1 += parseInt(cc1.substr(1, 2), 16) * ((nValuesA[v] || 0) / (nMax || 1));
		gg1 += parseInt(cc1.substr(3, 2), 16) * ((nValuesA[v] || 0) / (nMax || 1));
		bb1 += parseInt(cc1.substr(5, 2), 16) * ((nValuesA[v] || 0) / (nMax || 1));
	}
	var max = Math.max(Math.max(rr1, gg1), bb1);
	rr1 = Math.floor(rr1 / max * (nBrightness || mean_composecolor_intensity));
	gg1 = Math.floor(gg1 / max * (nBrightness || mean_composecolor_intensity));
	bb1 = Math.floor(bb1 / max * (nBrightness || mean_composecolor_intensity));
	return ColorScheme.getHexaColor("rgb(" + rr1 + "," + gg1 + "," + bb1 + ")");
};

/**
 * private function to create a color from an array of colors and values 
 * using subtractive algorithm
 */
var __maptheme_getComposedColor_subtractive = function (nValuesA, szColorsA, nMax, nBrightness) {
	nBrightness = nBrightness || Math.min(Math.floor(sum_composecolor_intensity), 300) || 255;
	var rr1 = 0,
		gg1 = 0,
		bb1 = 0;
	for (var v = 0; v < nValuesA.length; v++) {
		var cc1 = ColorScheme.getHexaColor(szColorsA[v]);
		rr1 += (255 - parseInt(cc1.substr(1, 2), 16)) * ((nValuesA[v] || 0) / (nMax || 1));
		gg1 += (255 - parseInt(cc1.substr(3, 2), 16)) * ((nValuesA[v] || 0) / (nMax || 1));
		bb1 += (255 - parseInt(cc1.substr(5, 2), 16)) * ((nValuesA[v] || 0) / (nMax || 1));
	}
	var max = Math.max(Math.max(rr1, gg1), bb1);
	rr1 = Math.min(255, (nBrightness - Math.floor(rr1 / max * (mean_composecolor_intensity))));
	gg1 = Math.min(255, (nBrightness - Math.floor(gg1 / max * (mean_composecolor_intensity))));
	bb1 = Math.min(255, (nBrightness - Math.floor(bb1 / max * (mean_composecolor_intensity))));
	return ColorScheme.getHexaColor("rgb(" + rr1 + "," + gg1 + "," + bb1 + ")");
};

// .............................................................................
//
// make CHOROPLETH themes
//
// .............................................................................

/**
 * colorize the map shapes of the theme
 * is called several times with a item index to start or continue
 * @parameter startIndex if 0, init painting map items, else, continue painting
 */
MapTheme.prototype.paintMap = function (startIndex) {

	_TRACE("== MapTheme.paintMap(" + startIndex + ")===> " + (this.szId));

	if (this.nChartUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nChartUpper)) {
		this.unpaintMap();
		this.fVisible = false;
		this.realizeDone();
		return;
	}
	if (this.nChartLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nChartLower)) {
		this.unpaintMap();
		this.fVisible = false;
		this.realizeDone();
		return;
	}
	
	this.beginDraw();

	if (this.mapSleep) {
		this.mapSleep.checkSleepMessage = "painting map";
	}

	var nValue = 0;
	var nPercentOfMean = 0;
	var nPercentOfMedian = 0;
	var nDeviation = 0;
	var nRelevanz = 0;
	var nOpacity = 0;
	var szLabel = "";
	var szRelevanz = "";
	var szMean = map.Dictionary.getLocalText("of mean");
	var szMedian = map.Dictionary.getLocalText("of median");

	var xFound = false;
	var nLastRelevant = 0;
	var i = 0;
	var j = 0;
	var a = 0;

	var tilesNodesA = null;

	// GR 28.07.2012 for paint opacity = fillopacity
	this.fillOpacity = this.fillOpacity ? this.fillOpacity : this.nOpacity;
	this.szStyle = "fill-opacity:" + String(this.fillOpacity ? this.fillOpacity : (fTransparentMap ? 0.6 : 1.0));
	if (this.autoOpacity) {
		var dx = (map.Scale.nTrueMapScale*map.Scale.nZoomScale)/map.Scale.nNormalSizeScale;
		this.szStyle = "fill-opacity:" + String(Math.max(0.3, (Math.min(1, 0.3 + 0.7 / Math.max(1, Math.log(map.Zoom.nZoom/dx))))));
	}
	if (this.szShapeType.match(/line/)) {
		this.szStyle = this.fillOpacity ? "stroke-opacity:" + this.fillOpacity + ";" : "stroke-opacity:1";
	}

	if (!startIndex || startIndex === 0) {
		startIndex = 0;
		this.indexA = [];

		for (a in this.itemA) {
			this.indexA[this.indexA.length] = a;
			this.itemA[a].todo = true;
		}
		
		// GR 13/11/2023 !!!
		for (i = 0; i < this.partsA.length; i++) {
			this.partsA[i].nCount = 0;
			this.partsA[i].nSum = 0;
		}

		this.nDoneCount = 0;
		
		// GR 24.08.2022 do this at the beginning of every paint 
		if (this.szFlag.match(/COMPOSECOLOR/)) {
			__maptheme_initComposedColor(this.colorScheme.slice(0));
		}
		
		// GR 13.11.2022 if theme is SUBTHEME, clear shapes of parent theme colors 
		if (this.parentTheme){
			for (var j = 0; j < this.parentTheme.paintedShapeNodesA.length; j++) {
				this.parentTheme.unPaintShape(this.parentTheme.paintedShapeNodesA[j]);
			}
		}
	}

	for (var nAi = startIndex; nAi < this.indexA.length; nAi++) {

		// sleep work around to show progress -----------------
		if (this.mapSleep) {
			this.mapSleep.nDoneCount = this.nDoneCount;
			if (this.mapSleep.checkSleep(nAi, 10)) {
				this.fContinue = true;
				this.continueIndex = nAi;

				// GR 11.06.2015 if filter defined, apply on new items
				if (this.szItemFilter && this.szItemFilter.length) {
					this.filterItems(this.szItemFilter, this.itemFilterOpt);
				}
				if (this.markedClass != null) {
					//this.markClass(this.markedClass, 1);
				}

				return;
			}
		}

		var a = this.indexA[nAi];

		this.nDoneCount++;

		xFound = false;
		nLastRelevant = 0;

		if (this.szFlag.match(/COMPOSECOLOR/)) {

			// ==================================================================
			// color coposed by the single value colors = multivariate choropleth
			// ==================================================================

			if (this.szFlag.match(/SUBTRACTIVE/)) {
				var szColor = __maptheme_getComposedColor_subtractive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			} else {
				var szColor = __maptheme_getComposedColor_additive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			}
			tilesNodesA = this.getItemNodes(a);
			for (j = 0; j < tilesNodesA.length; j++) {
				var paintShape = this.paintShape(tilesNodesA[j], szColor, -1, -1);
				if (this.szFlag.match(/DOPACITY/)) {
					// explicit alpha field or $density$
					// -----------------------------------------
					if (this.szAlphaField) {
						nOpacity = 0;
						if (typeof (this.itemA[a].nAlpha) != "undefined") {
							var nPow = 1 / (this.nDopacityPow || 1);
							nOpacity = (this.nDopacityScale || 1) / Math.pow(this.nMaxAlpha, nPow) * Math.pow(this.itemA[a].nAlpha, nPow);
						}
					} else {
						var nPow = 1 / (this.nDopacityPow || 1);
						var nMyValue = (isNaN(this.itemA[a].nValueSum) ? 0 : this.itemA[a].nValueSum) / ((this.itemA[a].nValue100 / 100) || 1);
						var nMyMaxVal = (isNaN(this.nMax) ? 0 : this.nMax);
						nOpacity = (this.nDopacityScale || 1) * Math.pow(nMyValue, nPow) / Math.pow(nMyMaxVal, nPow);
					}
					paintShape.style.setProperty("fill-opacity", String(nOpacity), "");
				}
			}
			xFound = true;
		} else

			// ================================
			// dominant value CHOROPLETH theme
			// ================================

			if (this.szFlag.match(/DOMINANT/)) {

				xFound = true;

				// search for dominant value above filter 
				var nIndex = -1;
				for (i = 0; i < this.itemA[a].nValuesA.length; i++) {

					nValue = this.itemA[a].nValuesA[i];

					nPercentOfMean = 100 / this.nMeanA[i] * nValue;
					nPercentOfMedian = 100 / this.nMedianA[i] * nValue;
					nDeviation = (nValue - this.nMeanA[i]) / this.nDeviationA[i];

					nRelevanz = nValue;
					if (this.szFlag.match(/PERCENTOFMEAN/)) {
						nRelevanz = nPercentOfMean;
					}
					if (this.szFlag.match(/PERCENTOFMEDIAN/)) {
						nRelevanz = nPercentOfMedian;
					}
					if (this.szFlag.match(/DEVIATION/)) {
						nRelevanz = nDeviation;
					}
					if (nValue > this.nFilterA[i] && nRelevanz > nLastRelevant) {

						this.itemA[a].nClass = i;
						nLastRelevant = nRelevanz;
						nIndex = i;
					}
				}
				// if we have found a dominant value; do colorize 
				if (nIndex >= 0) {
					this.itemA[a].nDominant = nIndex;
					nValue = this.itemA[a].nValuesA[nIndex];

					szLabel = " " + this.szFieldsA[nIndex] + " ";
					if (this.szLabelA && this.szLabelA[nIndex]) {
						szLabel = " " + this.szLabelA[nIndex] + " ";
					}
					if (this.szFlag.match(/PERCENTOFMEAN/) || this.szFlag.match(/DEVIATION/)) {
						szRelevanz = map.Dictionary.getLocalText(" ( mean: ") + this.formatValue(this.nMeanA[nIndex], 1) + this.szUnit + ")";
					}
					if (this.szFlag.match(/PERCENTOFMEDIAN/)) {
						szRelevanz = map.Dictionary.getLocalText(" ( median: ") + this.formatValue(this.nMedianA[nIndex], 1) + this.szUnit + ")";
					}
					// colorize 
					this.itemA[a].nValue = this.itemA[a].nValuesA[nIndex];
					this.itemA[a].szLabel = szLabel;
					this.itemA[a].szColor = this.colorScheme[nIndex];
					this.itemA[a].nClass = nIndex;

					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						var paintShape = this.paintShape(tilesNodesA[j], this.colorScheme[nIndex], this.itemA[a].nValue, nIndex);
						paintShape.setAttributeNS(szMapNs, "tooltip", this.formatValue(nValue, 2) + this.szUnit + szLabel + szRelevanz);

						// GR 08.08.2012 new
						// variate the opacity to give importance to 1) the value 2) the item count at base
						if (this.szFlag.match(/DOPACITY/)) {
							var nPartsA = this.itemA[a].nOrigValuesA;
							var nMyValue = 0;
							var nMyMaxVal = 0;
							var nOpacity = 0;

							// calcolate importance from all parts > max and value = sum over all parts
							// 
							// for ( var xi=0; xi<nPartsA.length; xi++ ){
							//	 nMySum += isNaN(nPartsA[xi])?0:nPartsA[xi];
							//	 nTotalSum += isNaN(this.nOrigMaxA[xi])?0:this.nOrigMaxA[xi];
							// }
							// calcolate importance only from the dominant part
							//
							nMyValue = isNaN(this.itemA[a].nValuesA[nIndex]) ? 0 : this.itemA[a].nValuesA[nIndex];
							nMyMaxVal = isNaN(this.nMaxA[nIndex]) ? 0 : this.nMaxA[nIndex];

							if (this.szAlphaField) {
								nOpacity = 0;
								if (typeof (this.itemA[a].nAlpha) != "undefined") {
									var nPow = 1 / (this.nDopacityPow || 1);
									nOpacity = (this.nDopacityScale || 1) / Math.pow(this.nMaxAlpha, nPow) * Math.pow(this.itemA[a].nAlpha, nPow);
								}
							} else
							if (this.szFlag.match(/DOPACITYLOGMEAN/)) {
								nOpacity = Math.log((this.nDopacityScale || 1) * (nPercentOfMean - 100)) / Math.log(100);
							} else
							if (this.szFlag.match(/DOPACITYPOWMEAN/)) {
								var nPow = 1 / (this.nDopacityPow || 1);
								nOpacity = Math.pow((this.nDopacityScale || 1) * (nPercentOfMean - 100), nPow) / Math.pow(100, nPow);
							} else
							if (this.szFlag.match(/DOPACITYMEAN/)) {
								// nOpacity = (this.nDopacityScale||1)*(nPercentOfMean-100)/100;
								var nPow = 1 / (this.nDopacityPow || 1);
								nOpacity = Math.pow((this.nDopacityScale || 1) * (nPercentOfMean - 100), nPow) / Math.pow(100, nPow);
							} else
							if (this.szFlag.match(/DOPACITYLOGMAX/)) {
								// calc opacity from value/max
								nOpacity = Math.log(nMyValue) / Math.log(nMyMaxVal);
							} else
							if (this.szFlag.match(/DOPACITYPOWMAX/)) {
								// calc opacity from value/max
								var nPow = 1 / (this.nDopacityPow || 1);
								nOpacity = (this.nDopacityScale || 1) * Math.pow(nMyValue, nPow) / Math.pow(nMyMaxVal, nPow);
							} else
							if (this.szFlag.match(/DOPACITYMAX/)) {
								// calc opacity from value/max
								// nOpacity = (this.nDopacityScale||2)/nMyMaxVal*nMyValue;
								var nPow = 1 / (this.nDopacityPow || 1);
								nOpacity = (this.nDopacityScale || 1) * Math.pow(nMyValue, nPow) / Math.pow(nMyMaxVal, nPow);
							} else {
								// calc opacity from log(value)/log(max)
								nOpacity = Math.log((this.nDopacityScale || 1) * nMyValue) / Math.log(nMyMaxVal);
							}

							// clip opacity
							nOpacity = (nOpacity < 0.0001) ? 0 : nOpacity;
							nOpacity = Math.min((this.nOpacity || 0.9), nOpacity);

							// flag for auto opacity = more zoom, more transparency
							if (this.autoOpacity) {
								var dx = (map.Scale.nTrueMapScale*map.Scale.nZoomScale)/map.Scale.nNormalSizeScale;
								nOpacity *= Math.max(0.3, (Math.min(1, 0.3 + 0.7 / Math.max(1, Math.log(map.Zoom.nZoom/dx)))));
							}

							paintShape.style.setProperty("fill-opacity", String(nOpacity), "");

							//_TRACE("dopacity: pfm:"+nPercentOfMean+" sum:"+nTotalSum+" this.sum:"+nMyValue);

						} // ------------------------------------------------------------------------------
					}
					this.partsA[nIndex].nCount++;
				}
				// if not, remove old color
				else {
					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						this.unPaintShape(tilesNodesA[j]);
						tilesNodesA[j].removeAttributeNS(szMapNs, "tooltip");
					}
				}
			}
		else {

			// ===================================
			// normal CHOROPLETH theme
			// ===================================

			if (this.szFlag.match(/\bCLIP\b/) && this.nClipFrames) {
				if ((this.nClipFrames == this.itemA[a].nValuesA.length)) {
					nValue = Number(this.itemA[a].nValuesA[this.nActualFrame]);
				} else {
					nValue = this.itemA[a].nValuesA[0] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + this.itemA[a].nValuesA[1] * this.nActualFrame / (this.nClipFrames - 1);
				}
			} else {
				nValue = this.itemA[a].nValuesA[0];
			}
			for (i = 0; i < this.partsA.length; i++) {
				if (nValue < this.partsA[i].max) {

					// colorize 
					this.itemA[a].nValue = nValue;
					this.itemA[a].szColor = this.partsA[i].color;
					this.itemA[a].nClass = i;

					if (this.itemA[a].todo) {
						tilesNodesA = this.getItemNodes(a);
						for (j = 0; j < tilesNodesA.length; j++) {
							var paintShape = this.paintShape(tilesNodesA[j], this.partsA[i].color, nValue, i);
							if (this.szLabelA && this.szLabelA[i] && this.szFlag.match(/CATEGORICAL/)) {
								paintShape.setAttributeNS(szMapNs, "tooltip", this.szLabelA[i]);
							} else if (this.itemA[a].nValue100) {
								paintShape.setAttributeNS(szMapNs, "tooltip", this.formatValue(nValue, 2) + this.szUnit); //+"  ["+this.szTitle+"] "+Math.ceil(nValue*this.itemA[a].nValue100*0.01)+"  total="+this.itemA[a].nValue100);
							} else {
								paintShape.setAttributeNS(szMapNs, "tooltip", this.formatValue(nValue, 2) + this.szUnit); //+"  ["+this.szTitle+"]");
								
								paintShape.setAttributeNS(szMapNs, "tooltip", 
									(this.itemA[a].szTitle?this.itemA[a].szTitle:"") + " " + this.formatValue(nValue, 2) + this.szUnit);
								
							}
							// dynamic alpha / opacity
							// -----------------------
							if (this.szFlag.match(/DOPACITY/)) {

								// explicit alpha field or $density$
								// -----------------------------------------
								if (this.szAlphaField) {
									nOpacity = 0;
									if (typeof (this.itemA[a].nAlpha) != "undefined") {
										var nPow = 1 / (this.nDopacityPow || 1);
										nOpacity = (this.nDopacityScale || 1) / Math.pow(this.nMaxAlpha, nPow) * Math.pow(this.itemA[a].nAlpha, nPow);
									}
								} else

									// bipolar ? show min and max 
									// -----------------------------------------
									if ((this.nMin < 0) && (this.nMax > 0)) {
										nOpacity = 0;
										if (this.szFlag.match(/DOPACITYMAX/)) {
											var nPow = 1 / (this.nDopacityPow || 1);
											nOpacity = Math.pow(Math.abs(nValue), nPow) / Math.pow((this.nMedianA[0] - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
										} else
										if (this.szFlag.match(/DOPACITYLOG/)) {
											nOpacity = Math.log(Math.abs(nValue)) / Math.log((this.nMedianA[0] - this.nMin)) * 0.5 * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
										} else {
											nOpacity = Math.abs(nValue) / (this.nMedianA[0] - this.nMin) * 0.5 * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
										}
									}
								else

									// bipolar ? show min and max 
									// -----------------------------------------
									if (this.szFlag.match(/BIPOLAR/) || this.szFlag.match(/DOPACITYMINMAX/)) {
										nOpacity = 0;
										if (this.szFlag.match(/DOPACITYMAX/)) {
											var nPow = 1 / (this.nDopacityPow || 1);
											if (nValue >= this.nMeanA[0]) {
												nOpacity = Math.pow(Math.abs(nValue - this.nMeanA[0]), nPow) / Math.pow(Math.abs(this.nMax - this.nMeanA[0]), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											} else {
												nOpacity = Math.pow(Math.abs(this.nMeanA[0] - nValue), nPow) / Math.pow(Math.abs(this.nMeanA[0] - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											}
										} else
										if (this.szFlag.match(/DOPACITYLOG/)) {
											if (nValue >= this.nMedianA[0]) {
												nOpacity = Math.log(Math.abs(nValue - this.nMedianA[0])) / Math.log((this.nMax - this.nMedianA[0])) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											} else {
												nOpacity = Math.log(Math.abs(nValue - this.nMedianA[0])) / Math.log((this.nMedianA[0] - this.nMin)) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											}
										} else {
											var nPow = 1 / (this.nDopacityPow || 1);
											if (nValue >= this.nMedianA[0]) {
												nOpacity = Math.pow(Math.abs(nValue - this.nMedianA[0]), nPow) / Math.pow((this.nMax - this.nMedianA[0]), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											} else {
												nOpacity = Math.pow(Math.abs(nValue - this.nMedianA[0]), nPow) / Math.pow((this.nMedianA[0] - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
											}
										}
									}

								// one range from min to max
								// --------------------------------------
								else {
									if (this.szFlag.match(/DOPACITYMIN/)) {
										var nPow = 1 / (this.nDopacityPow || 1);
										nOpacity = Math.pow((this.nMax - nValue), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
									} // ------------------------------------------------------------------------------
									else
									if (this.szFlag.match(/DOPACITYMAX/)) {
										var nPow = 1 / (this.nDopacityPow || 1);
										nOpacity = Math.pow((nValue - this.nMin), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
									} // ------------------------------------------------------------------------------
									else
									if (this.szFlag.match(/DOPACITYLOG/)) {
										nOpacity = Math.log(nValue - this.nMin) / Math.log(this.nMedianA[0] - this.nMin) * 0.5 * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
									} // ------------------------------------------------------------------------------
									else
									if (this.szFlag.match(/DOPACITY/)) {
										nOpacity = (nValue - this.nMin) / (this.nMedianA[0] - this.nMin) * 0.5 * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
									} // ------------------------------------------------------------------------------
								}

								// clip opacity
								nOpacity = (nOpacity < 0.0001) ? 0 : nOpacity;
								nOpacity = Math.min((this.nOpacity || 0.9), nOpacity);

								// flag for auto opacity = more zoom, more transparency
								if (this.autoOpacity) {
									var dx = (map.Scale.nTrueMapScale*map.Scale.nZoomScale)/map.Scale.nNormalSizeScale;
									nOpacity *= Math.max(0.3, (Math.min(1, 0.3 + 0.7 / Math.max(1, Math.log(map.Zoom.nZoom/dx)))));
								}
								paintShape.style.setProperty("fill-opacity", String(nOpacity), "");
							}
						}
						this.itemA[a].todo = false;
					}
					this.partsA[i].nCount++;
					this.partsA[i].nSum += nValue;
					xFound = true;
					break;
				}
			}
		}

		if (!xFound) {
			_TRACE('no value: ' + a + ', ' + this.itemA[a].nValuesA[0] + ', ' + nValue);
			this.itemA[a].szColor = this.szNoDataColor ? this.szNoDataColor : "white";
			tilesNodesA = this.getItemNodes(a);
			for (j = 0; j < tilesNodesA.length; j++) {
				var paintShape = this.paintShape(tilesNodesA[j], this.szNoDataColor ? this.szNoDataColor : "white", -1, -1);
				paintShape.setAttributeNS(szMapNs, "tooltip", "no value");
				if (this.szFlag.match(/DOPACITY/)) {
					//paintShape.style.setProperty("fill-opacity", "0", "");
				}
				this.nNoData++;
			}
		}
	}
	_TRACE("== done === ");
	this.isVisible = true;
	this.realizeDone();

	this.fShowProgressBar = false;
	this.showInfo();

	this.endDraw();

	// GR 11.06.2015 if filter defined, apply on new items
	if (this.szItemFilter && this.szItemFilter.length) {
		this.filterItems(this.szItemFilter, this.itemFilterOpt);
	}
	/** GR 02.10.2019 causes infinite loop
	if (this.markedClass != null) {
		this.markClass(this.markedClass, 1);
	}
    **/
	if (this.szFlag.match(/\bCLIP\b/)) {

		if ((this.nClipFrames == this.itemA[a].nValuesA.length)) {
			if (this.szXaxisA && this.szXaxisA[this.nActualFrame]) {
				displayMessage(this.szXaxisA[this.nActualFrame], 3000, "big");
			} else
			if (this.szLabelA && this.szLabelA[this.nActualFrame]) {
				displayMessage(this.szLabelA[this.nActualFrame], 3000, "big");
			}
		} else {
			var labelA = this.szXaxisA || this.szLabelA;
			if (labelA) {
				if (this.nActualFrame === 0) {
					displayMessage(labelA[0], 3000, "big");
				} else
				if (this.nActualFrame == (this.nClipFrames - 1)) {
					displayMessage(labelA[1], 3000, "big");
				} else {
					displayMessage(" ... ", 3000, "big");
				}
			}
		}
	} else {
		if (this.ErrorMessage) {
			displayMessage(this.ErrorMessage, 10000, "notify");
			this.ErrorMessage = null;
		} else {
			clearMessage();
		}
	}

	// init creating label by a sleep and continue  
	// this way we allow the rendering of the CHOROPLETH theme
	if (this.szFlag.match(/VALUES/) &&
		(!this.szValueUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nValueUpper)) &&
		(!this.szValueLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale >= this.nValueLower))) {

		if (this.mapSleep) {
			this.mapSleep.initCheckSleep(25);
		}
		this.fMakeLabel = true;
		this.fContinue = true;
		this.continueIndex = 0;
		this.nDoneCount = 0;
		this.nSkipCount = 0;
		this.nRealizedCount = 0;
		this.nZeroValueCount = 0;
		this.nMissingRangeCount = 0;
		this.nMissingPositionCount = 0;
		this.nActualFrame = 0;
		setTimeout(function(){map.Themes.executeContinue();}, 1000);

	} else {
		this.unlabelMap();
	}

};

/**
 * remove the map shapes colorizing styles of the theme
 */
MapTheme.prototype.unpaintMap = function () {

	_TRACE("== MapTheme.unpaintMap() ===> ");
	if (this.szFlag.match(/FEATURE/)) {
		if (this.chartGroup) {
			map.Dom.clearGroup(this.chartGroup);
			//map.Layer.listA[this.szThemesA[0]] = null;
		}
		return;
	}
	if (this.szFlag.match(/CHART/)) {
		if (this.chartGroup) {

			// GR 29.04.2014 clear chart objects hosted by an other theme; if own chart group is empty  
			// 
			if ((this.chartGroup.childNodes.length === 0) && this.itemA) {
				var chartGroup = null;
				for (var a in this.itemA) {
					if ((chartGroup = SVGDocument.getElementById(this.szId + ":" + a + ":chartgroup"))) {
						chartGroup.parentNode.removeChild(chartGroup);
					}
				}
			}
			
			// GR 04.02.2022 if chart is reference for autoscale, clear master scales
			if (this.fAutoScaleLeader){
				map.Themes.autoScale = null;
			}

			map.Dom.clearGroup(this.chartGroup);
			//var szId = this.chartGroup.getAttributeNS(null, "id");
			//map.Dom.removeElementById(szId);
			//this.chartGroup = null;
		}
		return;
	}

	this.beginDraw();

	_TRACE("begin ===> ");
	for (var j = 0; j < this.paintedShapeNodesA.length; j++) {
		this.unPaintShape(this.paintedShapeNodesA[j]);
		this.paintedShapeNodesA[j].removeAttributeNS(szMapNs, "tooltip");
	}
	this.paintedShapeNodesA.length = 0;
	_TRACE("end ===> ");

	this.unlabelMap();

	this.endDraw();

	_TRACE("== unpaintMap done === ");
	this.isVisible = false;
	this.checkVisible();

	setTimeout(function(){map.Layer.adaptLabel(null);}, 10);
};

/**
 * paint one map shape
 * @parameter shapeNode the SVG node
 * @parameter szColor the color to set
 * @parameter nValue a number to store as metadata (SVG node attribute with namespace ixmaps) 
 */
MapTheme.prototype.paintShape = function (shapeNode, szColor, nValue, nClass) {

	this.paintedShapeNodesA.push(shapeNode);

	switch (this.szShapeType) {
		case "line":
			shapeNode.setAttributeNS(null, "style", "fill:none;stroke:" + szColor + ";" + this.szStyle);
			break;
		case "line+buffer":
			var szId = shapeNode.getAttributeNS(null, "id");
			if (!szId.match(":paint")) {
				var cloneShape = SVGDocument.getElementById(szId + ":paint");
				if (!cloneShape) {
					var cloneShape = shapeNode.cloneNode(1000);
					shapeNode.parentNode.insertBefore(cloneShape, shapeNode);
					cloneShape.setAttributeNS(null, "id", szId + ":paint");
				}
				shapeNode = cloneShape;
			}
			var nStrokeWidth = 4;
			if (this.nBufferSize) {
				if (this.nBufferSize.match(/\$value\$/)) {
					var szEvalA = this.nBufferSize.split("$value$");
					var szEval = "";
					for (var i = 0; i < szEvalA.length; i++) {
						szEval += szEvalA[i];
						if (i < szEvalA.length - 1) {
							szEval += "nValue";
						}
					}
					nStrokeWidth = eval(szEval);
				} else
				if (this.nBufferSize.match(/value/)) {
					var nDelta = 100 / (this.nMin + 0.000000001) * (this.nMax - this.nMin);
					if (nDelta > 1000) {
						nStrokeWidth = 6 + Math.log(nValue / this.nMax);
					} else {
						nStrokeWidth = 10 * nValue / (this.nMax - this.nMin);
					}
				} else {
					nStrokeWidth = this.nBufferSize;
				}
			}
			// GR 22.03.2011 adapt to featurescaling by zooming (maybe dynamic!)
			nStrokeWidth *= Math.log(1 + 1 / __featureScaling_lastScale);

			shapeNode.setAttributeNS(null, "style", "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(nStrokeWidth) * map.Scale.nZoomScale + ";" + this.szStyle + ";stroke-linecap:butt;");
			break;

		default:
			shapeNode.setAttributeNS(null, "style", "fill:" + szColor + ";" + this.szStyle);
			break;
	}
	// GR 24.10.2017 set class
	shapeNode.setAttributeNS(szMapNs, "class", nClass);

	return shapeNode;
};
/**
 * unpaint one shape 
 * @parameter shapeNode the SVG node
 */
MapTheme.prototype.unPaintShape = function (shapeNode) {

	if (this.szShapeType == "line+buffer") {
		var szId = shapeNode.getAttributeNS(null, "id");
		var cloneShape = SVGDocument.getElementById(szId + ":paint");
		if (cloneShape) {
			cloneShape.parentNode.removeChild(cloneShape);
		}
	}

	shapeNode.removeAttributeNS(null, "style");

	// GR 24.10.2017 remove class
	shapeNode.removeAttributeNS(szMapNs, "class");
};

// .............................................................................
//
// evidence CHOROPLETH or chart classes by changing color, or isolate them
//
// .............................................................................

/**
 * zoom to the shapes of one class
 * @parameter nClass the index of the class to evidence  
 * @parameter nStep number of subsequent classes to evidence  
 */
MapTheme.prototype.zoomToClass = function (nClass, nStep) {

	_TRACE("== MapTheme.zoomToClass() ===> ");

	var nCount = 0;
	if (this.szFlag.match(/DOMINANT/)) {
		for (var a in this.itemA) {
			if (this.itemA[a].nClass == nClass) {
				nCount++;
			}
		}
	} else {
		nCount = this.partsA[nClass].nCount;
	}

	if (nCount === 0) {
		displayMessage("No members !");
		return;
	}

	var j;
	var tilesNodesA = null;

	if (this.szFlag.match(/CHART/)) {
		var chartsA = this.chartGroup.childNodes;
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if ((chartNode.getAttributeNS(szMapNs, "class") == null) ||
				(chartNode.getAttributeNS(szMapNs, "class") === "")) {
				var childA = chartNode.firstChild.childNodes;
				for (var ii = 0; ii < childA.length; ii++) {
					var childNode = childA.item(ii);
					var value = Number(childNode.getAttributeNS(szMapNs, "class"));
				}
			} else {
				var value = Number(chartNode.getAttributeNS(szMapNs, "class"));
			}
		}
		return;
	}

	if (this.szFlag.match(/DOMINANT/)) {
		for (a in this.itemA) {
			if (this.itemA[a].nClass == nClass && this.evidenceMode == "highlight") {
				// highlight 
				tilesNodesA = this.getItemNodes(a);
				for (j = 0; j < tilesNodesA.length; j++) {

				}
			} else if (this.itemA[a].nClass != nClass && this.evidenceMode != "highlight") {
				// switch off 
				tilesNodesA = this.getItemNodes(a);
				for (j = 0; j < tilesNodesA.length; j++) {

				}
			}
		}
	} else {

		var pStart = new point(100000, 100000);
		var pEnd = new point(-100000, -100000);

		var nMin = this.partsA[nClass].min;
		var nMax = this.partsA[nClass].max;
		for (i = 1; i < nStep; i++) {
			nMin = Math.min(nMin, this.partsA[nClass + i].min);
			nMax = Math.max(nMax, this.partsA[nClass + i].max);
		}
		// GR 25.04.2011 
		if (this.szFlag.match(/CATEGORICAL/)) {
			nMin++;
			nMax++;
		}

		for (a in this.itemA) {
			if (this.itemA[a].nValuesA[0] > nMin &&
				this.itemA[a].nValuesA[0] < nMax) {
				tilesNodesA = this.getItemNodes(a);
				for (j = 0; j < tilesNodesA.length; j++) {
					var bBox = map.Dom.getBox(tilesNodesA[j]);
					if (bBox.width === 0 || bBox.height === 0) {
						var nodeMatrixA = getMatrix(tilesNodesA[j]);
						bBox.x += nodeMatrixA[4];
						bBox.y += nodeMatrixA[5];
						bBox.width = map.Scale.viewBox.width / 20;
						bBox.height = map.Scale.viewBox.height / 20;
						bBox.x -= bBox.width / 2;
						bBox.y -= bBox.height / 2;
					}
					var ptOffset = map.Scale.getMapOffset(tilesNodesA[j]);
					bBox.x += ptOffset.x;
					bBox.y += ptOffset.y;
					pStart.x = Math.min(pStart.x, bBox.x);
					pStart.y = Math.min(pStart.y, bBox.y);
					pEnd.x = Math.max(pEnd.x, bBox.x + bBox.width);
					pEnd.y = Math.max(pEnd.y, bBox.y + bBox.height);
				}
			}
		}
		var allBox = new box(pStart.x, pStart.y, pEnd.x - pStart.x, pEnd.y - pStart.y);
		allBox.scale(1.2);
		allBox = map.Zoom.clipArea(allBox);

		map.Zoom.setNewArea(allBox);
	}
	_TRACE("== zoomToClass done === ");
};

/**
 * mark the map shapes of one class
 * @parameter nClass the index of the class to evidence  
 * @parameter nStep number of subsequent classes to evidence  
 */
MapTheme.prototype.markClass = function (nClass, nStep) {

	_TRACE("== MapTheme.markClass(" + nClass + ") ===> ");

	if (this.fMarkEnable === false) {
		return;
	}

	if ((map.Themes.enableSubThemes) &&
		//(this.szFields.match(/\|/)) &&
		(this.szFlag.match(/DOMINANT|COMPOSE/) && !this.szFlag.match(/CHART/))) {
		this.createSubTheme(nClass);
		return;
	}

	if (isNaN(nClass)) {
		displayMessage("no class!");
		return;
	}

	var fFilter = (this.szItemFilter && this.szItemFilter.length);

	if (!this.szFlag.match(/CHART/) || fFilter) {
		this.fUnmarkEnable = true;
		this.unmarkClass();
		this.fUnmarkEnable = false;
	}

	if (this.fMarkEnable === false) {
		return;
	}

	var nCount = 0;
	if (this.szFlag.match(/DOMINANT/) && !this.szFlag.match(/CHART/)) {
		for (var a in this.itemA) {
			if (this.itemA[a].nClass == nClass) {
				nCount++;
			}
		}
	} else
		// GR 16.09.2017 special case continous dynamic opacity, let it pass!!
		if (this.partsA.length == 1 && this.szFlag.match(/DOPACITY/)) {
			nCount = 99;
		}
	else {
		nCount = this.partsA[nClass]?this.partsA[nClass].nCount:0;
	}
	if (nCount > 500 && this.evidenceMode == "highlight") {
		displayMessage("Sorry ! to many members");
		return;
	}
	if (nCount === 0) {
		displayMessage("class has no members !",3000);
		return;
	}

	clearMessage();
	highLightList.removeAll();

	var j;
	var tilesNodesA = null;
	var nIsolateGrayStrokeWidth = ((this.fShadow ? 5 : 10) / this.nScale);
	if (this.szFlag.match(/CHART/)) {
		var chartsA = this.chartGroup.childNodes;
		var toTopA = [];
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if ((chartNode.getAttributeNS(szMapNs, "class") == null) ||
				(chartNode.getAttributeNS(szMapNs, "class") === "")) {

				// element has no class attribute, can't be switched 
				// go through all child groups and look for atribute classng
				// switch on/off elements by class

				var childA = chartNode.getElementsByTagName('g');
				for (var ii = 0; ii < childA.length; ii++) {

					var childAA = childA.item(ii).childNodes;
					for (var iii = 0; iii < childAA.length; iii++) {

						var childNode = childAA.item(iii);
						if (childNode.getAttributeNS && childNode.getAttributeNS(szMapNs, "class")) {

							if (this.szFlag.match(/SEQUENCE/) && !this.szFlag.match(/PLOT/) && (this.evidenceMode != "isolate_gray")) {
								var szTransform = childNode.getAttributeNS(null, "transform");
								if (szTransform && szTransform.length) {
									childNode.setAttributeNS(szMapNs, "orig-transform", szTransform);
									childNode.setAttributeNS(null, "transform", "");
								}
							}

							var value = Number(childNode.getAttributeNS(szMapNs, "class"));

							if (this.szFlag.match(/BAR/) && this.szFlag.match(/3D/) && !this.szFlag.match(/STACKED/) && ((this.szFieldsA.length > 1) || (this.szFlag.match(/AGGREGATE/) && this.szFlag.match(/CATEGORICAL/)))) {
								if ((this.markedClasses[value] === true)) {
									childNode.setAttributeNS(null, "transform", "matrix(1 0 0 1 -10 6.6)");
									childNode.style.setProperty("fill-opacity", "1", "");
								} else {
									childNode.setAttributeNS(null, "transform", "matrix(1 0 0 1 0 0)");
									childNode.style.setProperty("fill-opacity", "0.85", "");
								}
							} else
							if ((this.markedClasses[value] === true)) {
								if (!fFilter) {
									childNode.style.setProperty("display", "inline", "");
									if (childNode.getAttributeNS(szMapNs, "save-style")) {
										childNode.setAttributeNS(null, "style", childNode.getAttributeNS(szMapNs, "save-style"));
									}
									toTopA.push(chartNode);
								}
							} else {
								if (this.evidenceMode == "isolate_gray") {
									if (!childNode.getAttributeNS(szMapNs, "save-style")) {
										childNode.setAttributeNS(szMapNs, "save-style", childNode.getAttributeNS(null, "style"));
									}
									childNode.style.setProperty("fill", "#bbbbbb", "");
									if (childNode.style.getPropertyValue("stroke") != "none") {
										childNode.style.setProperty("stroke", "#888888", "");
									}
									var fillopacity = childNode.style.getPropertyValue("fill-opacity");
									if (this.szFlag.match(/SEQUENCE/) || this.szFlag.match(/WAFFLE/)) {
										childNode.style.setProperty("fill-opacity", "0", "");
										childNode.style.setProperty("stroke-opacity", String(fillopacity * 0.9), "");
										childNode.style.setProperty("stroke-width", String(nIsolateGrayStrokeWidth), "");
									} else {
										childNode.style.setProperty("fill-opacity", String(0), "");
									}
								} else {
									childNode.style.setProperty("display", "none", "");
								}
							}
						}
					}
				}
			} else {
				// element has class attribute and can be switched

				var value = Number(chartNode.getAttributeNS(szMapNs, "class"));
				if ((this.markedClasses[value] === true)) {

					// show element 
					//
					if (!fFilter) {
						if (this.szFlag.match(/VECTOR/)) {
							chartNode.firstChild.style.setProperty("stroke", "", "");
							chartNode.firstChild.style.setProperty("stroke-opacity", "", "");
							chartNode.firstChild.style.setProperty("marker-end", "", "");
							chartNode.style.setProperty("display", "inline", "");
						} else {
							chartNode.style.setProperty("display", "inline", "");
							if ((value = chartNode.getAttributeNS(szMapNs, "fill"))) {
								chartNode.style.setProperty("fill", value, "");
							}
						}
						toTopA.push(chartNode);
					}
				} else {
					// hide or grey element non selected
					//
					if (this.evidenceMode == "isolate_gray") {
						if (this.szFlag.match(/VECTOR/)) {
							chartNode.firstChild.style.setProperty("stroke", "#888888", "");
							chartNode.firstChild.style.setProperty("stroke-opacity", "0.5", "");
							chartNode.firstChild.style.setProperty("marker-end", "none", "");
						} else {
							chartNode.setAttributeNS(szMapNs, "fill", chartNode.style.getPropertyValue("fill"));
							chartNode.style.setProperty("fill", "#bbbbbb", "");
							chartNode.setAttributeNS(szMapNs, "stroke", chartNode.style.getPropertyValue("fill"));
							chartNode.style.setProperty("stroke", "#888888", "");
							chartNode.setAttributeNS(szMapNs, "fill-opacity", chartNode.style.getPropertyValue("fill-opacity"));
							chartNode.style.setProperty("fill-opacity", "0.05", "");
						}
					} else {
						chartNode.style.setProperty("display", "none", "");
					}
				}
			}
		}
		toTopA.forEach(function (node) {
			node.parentNode.appendChild(node);
		});
		return;
	}

	// charts done 
	// now we switch choropleth themes 

	this.beginDraw();
	if (this.szFlag.match(/DOMINANT/)) {
		for (a in this.itemA) {
			if (this.itemA[a].nClass == nClass && this.evidenceMode == "highlight") {
				// highlight 
				tilesNodesA = this.getItemNodes(a);
				for (j = 0; j < tilesNodesA.length; j++) {
					highLightList.addItem(tilesNodesA[j]);
				}
			} else if (this.itemA[a].nClass != nClass && this.evidenceMode != "highlight") {
				// switch off 
				tilesNodesA = this.getItemNodes(a);
				for (j = 0; j < tilesNodesA.length; j++) {
					tilesNodesA[j].setAttributeNS(szMapNs, "themestyle", tilesNodesA[j].getAttributeNS(null, "style"));
					tilesNodesA[j].style.setProperty("display", "none", "");
				}
			}
		}
	} else {
		var nMin = this.partsA[nClass].min;
		var nMax = this.partsA[nClass].max;
		for (i = 1; i < nStep; i++) {
			nMin = Math.min(nMin, this.partsA[nClass + i].min);
			nMax = Math.max(nMax, this.partsA[nClass + i].max);
		}

		for (a in this.itemA) {

			// GR 24.10.2017 multiple marked classes
			var fClass = false;
			if (this.markedClasses && this.markedClasses[this.itemA[a].nClass]) {
				fClass = true;
			}

			if (fClass) {
				if (this.evidenceMode == "highlight") {
					// highlight 
					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						highLightList.addItem(tilesNodesA[j]);
					}
				}
			} else {
				if (this.evidenceMode != "highlight") {
					// switch off 
					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						if (this.szFlag.match(/BUFFER/)) {
							var nNode = SVGDocument.getElementById(tilesNodesA[j].getAttributeNS(null, "id") + ":paint");
							if (nNode) {
								nNode.style.setProperty("display", "none", "");
							}
						} else {
							tilesNodesA[j].setAttributeNS(szMapNs, "themestyle", tilesNodesA[j].getAttributeNS(null, "style"));
							tilesNodesA[j].setAttributeNS(null, "style", tilesNodesA[j].getAttributeNS(szMapNs, "origthemestyle"));
							// GR 11.11.2011 look for value node
							var szId = tilesNodesA[j].getAttribute("id");
							if (tilesNodesA[j].firstChild && tilesNodesA[j].firstChild.nextSibling){
								szId = tilesNodesA[j].firstChild.nextSibling.getAttribute("id") || szId;
							}
							var nNode = SVGDocument.getElementById(szId + "L");
							if (nNode) {
								nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
								nNode.style.setProperty("display", "none", "");
							}
							var nNode = SVGDocument.getElementById(szId + "L:bg");
							if (nNode) {
								nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
								nNode.style.setProperty("display", "none", "");
							}
							var nNode = SVGDocument.getElementById(szId + ":::value");
							if (nNode) {
								nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
								nNode.style.setProperty("display", "none", "");
							}
							var nNode = SVGDocument.getElementById(szId + ":::value:bg");
							if (nNode) {
								nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
								nNode.style.setProperty("display", "none", "");
							}
						}
					}
				}
			}
		}
	}

	this.endDraw();
	this.fMarkClass = true;
	_TRACE("== markClass done === ");
};

/**
 * unmark the map shapes of one class
 * @parameter nClass the index of the class to evidence  
 */
MapTheme.prototype.unmarkClass = function (nClass) {

	if (this.fUnmarkEnable === false) {
		return;
	}
	if (this.subTheme) {
		this.removeSubTheme();
		return;
	}
	if (this.szItemFilter && this.szItemFilter.length) {
		this.fMarkEnable = true;
		this.filterItems(this.szItemFilter, this.itemFilterOpt);
		return;
	}

	_TRACE("== MapTheme.unmarkClass() ===> ");
	clearMessage();

	if (this.szFlag.match(/CHART/)) {
		var chartsA = this.chartGroup.childNodes;
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if ((chartNode.getAttributeNS(szMapNs, "class") == null) ||
				(chartNode.getAttributeNS(szMapNs, "class") === "")) {

				// go through all child groups
				// switch on all elements with attribute class
				var childA = chartNode.getElementsByTagName('g');
				for (var ii = 0; ii < childA.length; ii++) {

					var childAA = childA.item(ii).childNodes;
					for (var iii = 0; iii < childAA.length; iii++) {

						var childNode = childAA.item(iii);
						if (childNode.getAttributeNS && childNode.getAttributeNS(szMapNs, "class")) {

							if (this.szFlag.match(/SEQUENCE/)) {
								var szTransform = childNode.getAttributeNS(szMapNs, "orig-transform");
								if (szTransform && szTransform.length) {
									childNode.removeAttributeNS(szMapNs, "orig-transform");
									childNode.setAttributeNS(null, "transform", szTransform);
								}
							}
							if (this.szFlag.match(/BAR/) && this.szFlag.match(/3D/) && !this.szFlag.match(/STACKED/)) {
								childNode.setAttributeNS(null, "transform", "matrix(1 0 0 1 0 0)");
								childNode.style.setProperty("fill-opacity", "1", "");
							}
							if (childNode.style) {
								childNode.style.setProperty("display", "inline", "");

								if (childNode.getAttributeNS(szMapNs, "save-style")) {
									childNode.setAttributeNS(null, "style", childNode.getAttributeNS(szMapNs, "save-style"));
								}

							}
						}
					}
				}
			} else {
				if (this.szFlag.match(/VECTOR/)) {
					chartNode.firstChild.style.setProperty("stroke", "", "");
					chartNode.firstChild.style.setProperty("stroke-opacity", "", "");
					chartNode.firstChild.style.setProperty("marker-end", "", "");
					chartNode.style.setProperty("display", "inline", "");
				} else {
					chartNode.style.setProperty("display", "inline", "");
				}
			}
		}
		if (this.szFlag.match(/TEXTONLY/)) {
			setTimeout(function(){map.Layer.adaptLabel();}, 10);
		}
		return;
	}

	this.beginDraw();

	if (this.evidenceMode != "highlight") {
		for (var a in this.itemA) {
			// switch on
			var tilesNodesA = this.getItemNodes(a);
			for (var j = 0; j < tilesNodesA.length; j++) {
				if (this.szFlag.match(/BUFFER/)) {
					var nNode = SVGDocument.getElementById(tilesNodesA[j].getAttributeNS(null, "id") + ":paint");
					if (nNode) {
						nNode.style.setProperty("display", "inline", "");
					}
				} else {
					var szThemeStyle = tilesNodesA[j].getAttributeNS(szMapNs, "themestyle");
					if (szThemeStyle && szThemeStyle.length && szThemeStyle != "null") {
						tilesNodesA[j].setAttributeNS(null, "style", szThemeStyle);
						tilesNodesA[j].removeAttributeNS(szMapNs, "themestyle");
						// GR 11.11.2011 look for value node
						var szId = tilesNodesA[j].getAttribute("id");
						if (tilesNodesA[j].firstChild && tilesNodesA[j].firstChild.nextSibling){
							szId = tilesNodesA[j].firstChild.nextSibling.getAttribute("id") || szId;
						}
						var nNode = SVGDocument.getElementById(szId + "L");
						if (nNode) {
							nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
						}
						var nNode = SVGDocument.getElementById(szId + "L:bg");
						if (nNode) {
							nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
						}
						var nNode = SVGDocument.getElementById(szId + ":::value");
						if (nNode) {
							nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
						}
						var nNode = SVGDocument.getElementById(szId + ":::value:bg");
						if (nNode) {
							nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
						}
					}
				}
			}
		}
	} else {
		highLightList.removeAll();
	}
	this.endDraw();
	this.fMarkClass = false;
	_TRACE("== unmarkClass done === ");
};

/**
 * show/hide the map shapes of one class
 * does choroplete and charts
 * @parameter nClass the index of the class to show  
 * @parameter nStep the index of the class to evidence  
 * @parameter fStatus the index of the class to evidence  
 */
MapTheme.prototype.showClass = function (nClass, nStep, fStatus) {

	_TRACE("== MapTheme.showClass() ===> ");

	var nCount = 0;
	if (this.szFlag.match(/DOMINANT/)) {
		for (var a in this.itemA) {
			if (this.itemA[a].nClass == nClass) {
				nCount++;
			}
		}
	} else {
		nCount = this.partsA[nClass].nCount;
	}

	clearMessage();

	var j;
	var tilesNodesA = null;
	var szDisplayAttribute = fStatus ? "inline" : "none";

	if (this.szFlag.match(/CHART/)) {

		// chart themes
		// -------------

		var chartsA = this.chartGroup.childNodes;
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if ((chartNode.getAttributeNS(szMapNs, "class") == null) ||
				(chartNode.getAttributeNS(szMapNs, "class") === "")) {
				var childA = chartNode.firstChild.childNodes;
				for (var ii = 0; ii < childA.length; ii++) {
					var childNode = childA.item(ii);
					var value = Number(childNode.getAttributeNS(szMapNs, "class"));
					if (value == nClass) {
						childNode.style.setProperty("display", szDisplayAttribute, "");
					}
				}
			} else {
				var value = Number(chartNode.getAttributeNS(szMapNs, "class"));
				if (value == nClass) {
					chartNode.style.setProperty("display", szDisplayAttribute, "");
				}
			}
		}

	} else {

		// choroplete themes
		// ------------------

		this.beginDraw();

		if (this.szFlag.match(/DOMINANT/)) {
			for (a in this.itemA) {
				if (this.itemA[a].nClass == nClass) {
					// switch off 
					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						tilesNodesA[j].setAttributeNS(szMapNs, "themestyle", tilesNodesA[j].getAttributeNS(null, "style"));
						tilesNodesA[j].style.setProperty("display", szDisplayAttribute, "");
					}
				}
			}
		} else {
			var nMin = this.partsA[nClass].min;
			var nMax = this.partsA[nClass].max;
			for (i = 1; i < nStep; i++) {
				nMin = Math.min(nMin, this.partsA[nClass + i].min);
				nMax = Math.max(nMax, this.partsA[nClass + i].max);
			}
			// GR 25.04.2011 
			if (this.szFlag.match(/CATEGORICAL/)) {
				nMin++;
				nMax++;
			}
			for (a in this.itemA) {
				if ((this.szFlag.match(/CATEGORICAL/) && (this.itemA[a].nValuesA[0] == nMin)) ||
					((this.itemA[a].nValuesA[0] > nMin) && (this.itemA[a].nValuesA[0] < nMax))
				) {
					tilesNodesA = this.getItemNodes(a);
					for (j = 0; j < tilesNodesA.length; j++) {
						if (this.szFlag.match(/BUFFER/)) {
							var nNode = SVGDocument.getElementById(tilesNodesA[j].getAttributeNS(null, "id") + ":paint");
							if (nNode) {
								nNode.style.setProperty("display", szDisplayAttribute, "");
							}
						} else {
							if (fStatus) { // show theme color
								var szThemeStyle = tilesNodesA[j].getAttributeNS(szMapNs, "themestyle");
								if (szThemeStyle && szThemeStyle.length && szThemeStyle != "null") {
									tilesNodesA[j].setAttributeNS(null, "style", szThemeStyle);
									tilesNodesA[j].removeAttributeNS(szMapNs, "themestyle");
								}
							} else {
								// show orig layer color
								tilesNodesA[j].setAttributeNS(szMapNs, "themestyle", tilesNodesA[j].getAttributeNS(null, "style"));
								tilesNodesA[j].setAttributeNS(null, "style", tilesNodesA[j].getAttributeNS(szMapNs, "origthemestyle"));
							}
						}
					}
				}
			}
		}
		this.endDraw();
	}

	_TRACE("== showClass done === ");
};

// .............................................................................
//
// display/hide charts/shapes by time value (utime)
//
// .............................................................................

/**
 * show/hide the map shapes by timestanp and time frame
 * @parameter nUMin low value of time frame  
 * @parameter nUMax high value of time frame  
 */
MapTheme.prototype.setTimeFrame = function (nUMin, nUMax) {

	_TRACE("== MapTheme.setTimeFrame(" + nUMin + "," + nUMax + ") ===> ");

	clearMessage();
	highLightList.removeAll();
	
	var fFilter = (this.szItemFilter && this.szItemFilter.length);

	var j;
	var tilesNodesA = null;
	var nIsolateGrayStrokeWidth = ((this.fShadow ? 5 : 10) / this.nScale);
	
	// GR 24/08/2023 now for all themes !
	if (1 || this.szFlag.match(/CHART/)) {
		var chartsA = this.chartGroup.childNodes;
		if (this.szFlag.match(/CHART/)) {
			chartsA = this.chartGroup.parentNode.childNodes;
		}
		var toTopA = [];
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if ((chartNode.getAttributeNS(szMapNs, "time") == null) ||
				(chartNode.getAttributeNS(szMapNs, "time") === "")) {

				// element has no time attribute, can't be switched 
				// go through all child groups and look for attribute time
				// switch on/off elements by time frame
				
				var childA = chartNode.getElementsByTagName('g');
				for (var ii = 0; ii < childA.length; ii++) {

					var childAA = childA.item(ii).childNodes;
					for (var iii = 0; iii < childAA.length; iii++) {

						var childNode = childAA.item(iii);
						if (childNode.getAttributeNS && childNode.getAttributeNS(szMapNs, "time")) {

							var uTime = Number(childNode.getAttributeNS(szMapNs, "time"));
							
							if (this.szFlag.match(/BAR/) && this.szFlag.match(/3D/) && !this.szFlag.match(/STACKED/) && ((this.szFieldsA.length > 1) || (this.szFlag.match(/AGGREGATE/) && this.szFlag.match(/CATEGORICAL/)))) {
								if ( (uTime >= nUMin) && (uTime <= nUMax) ) {
									childNode.setAttributeNS(null, "transform", "matrix(1 0 0 1 -10 6.6)");
									childNode.style.setProperty("fill-opacity", "1", "");
								} else {
									childNode.setAttributeNS(null, "transform", "matrix(1 0 0 1 0 0)");
									childNode.style.setProperty("fill-opacity", "0.85", "");
								}
							} else
							if ((uTime >= nUMin) && (uTime <= nUMax)) {
								if (!fFilter) {
									childNode.style.setProperty("display", "inline", "");
									if (childNode.getAttributeNS(szMapNs, "save-style")) {
										childNode.setAttributeNS(null, "style", childNode.getAttributeNS(szMapNs, "save-style"));
									}
									toTopA.push(chartNode);
								}
							} else {
								if (this.evidenceMode == "isolate_gray") {
									if (!childNode.getAttributeNS(szMapNs, "save-style")) {
										childNode.setAttributeNS(szMapNs, "save-style", childNode.getAttributeNS(null, "style"));
									}
									childNode.style.setProperty("fill", "#bbbbbb", "");
									if (childNode.style.getPropertyValue("stroke") != "none") {
										childNode.style.setProperty("stroke", "#888888", "");
									}
									var fillopacity = childNode.style.getPropertyValue("fill-opacity");
									if (this.szFlag.match(/SEQUENCE/) || this.szFlag.match(/WAFFLE/)) {
										childNode.style.setProperty("fill-opacity", "0", "");
										childNode.style.setProperty("stroke-opacity", String(fillopacity * 0.9), "");
										childNode.style.setProperty("stroke-width", String(nIsolateGrayStrokeWidth), "");
									} else {
										childNode.style.setProperty("fill-opacity", String(0), "");
									}
								} else {
									childNode.style.setProperty("display", "none", "");
								}
							}
						}
					}
				}
			} else {
				// element has time attribute and can be switched

				var uTime = Number(chartNode.getAttributeNS(szMapNs, "time"));
				if ((uTime >= nUMin) && (uTime <= nUMax)) {

					// show element 
					//
					if (!fFilter) {
						if (this.szFlag.match(/VECTOR/)) {
							chartNode.firstChild.style.setProperty("stroke", "", "");
							chartNode.firstChild.style.setProperty("stroke-opacity", "", "");
							chartNode.firstChild.style.setProperty("marker-end", "", "");
							chartNode.style.setProperty("display", "inline", "");
						} else {
							chartNode.style.setProperty("display", "inline", "");
                            var value;
							if ((value = chartNode.getAttributeNS(szMapNs, "fill"))) {
								chartNode.style.setProperty("fill", value, "");
							}
						}
						toTopA.push(chartNode);
					}
				} else {
					// hide or grey element non selected
					//
					if (this.evidenceMode == "isolate_gray") {
						if (this.szFlag.match(/VECTOR/)) {
							chartNode.firstChild.style.setProperty("stroke", "#888888", "");
							chartNode.firstChild.style.setProperty("stroke-opacity", "0.5", "");
							chartNode.firstChild.style.setProperty("marker-end", "none", "");
						} else {
							chartNode.setAttributeNS(szMapNs, "fill", chartNode.style.getPropertyValue("fill"));
							chartNode.style.setProperty("fill", "#bbbbbb", "");
							chartNode.setAttributeNS(szMapNs, "stroke", chartNode.style.getPropertyValue("fill"));
							chartNode.style.setProperty("stroke", "#888888", "");
							chartNode.setAttributeNS(szMapNs, "fill-opacity", chartNode.style.getPropertyValue("fill-opacity"));
							chartNode.style.setProperty("fill-opacity", "0.05", "");
						}
					} else {
						chartNode.style.setProperty("display", "none", "");
					}
				}
			}
		}
		toTopA.forEach(function (node) {
			node.parentNode.appendChild(node);
		});
		return;
	}
	_TRACE("== setTimeFrame done === ");
};




// .............................................................................
//
// subtheme of a dominant CHOROPLETH theme
//
// .............................................................................

/**
 * make a sub theme of a dominant theme
 * this is a 'normal' choroplete theme with one color/data column of the multicolumn dominant theme  
 * @parameter nClass the index of the class to create the SubTheme
 */
MapTheme.prototype.createSubTheme = function (nClass) {
	
	if (this.subTheme) {
		this.removeSubTheme();
	}
	
	if ( nClass == null ){
		if ( !this.markedClasses || !this.markedClasses.length ){
			return;
		}
	}

	// collect attributes to keep from trhe original theme
	//
	var szAttributes = "";

	if (this.coTable && (typeof (this.coTable) != "undefined")) {
		szAttributes += "dbtable:" + this.coTable + ";";
	}
	if (this.szSelectionField && (typeof (this.szSelectionField) != "undefined")) {
		szAttributes += "lookupfield:" + this.szSelectionField + ";";
	}
	if (this.szAlphaField && (typeof (this.szAlphaField) != "undefined")) {
		szAttributes += "alphafield:" + this.szAlphaField + ";";
	}
	if (this.szAlphaField100 && (typeof (this.szAlphaField100) != "undefined")) {
		szAttributes += "alphafield100:" + this.szAlphaField100 + ";";
	}
	if (this.szTitleField && (typeof (this.szTitleField) != "undefined")) {
		szAttributes += "titlefield:" + this.szTitleField + ";";
	}
	if (this.nDopacityScale && (typeof (this.nDopacityScale) != "undefined")) {
		szAttributes += "dopacityscale:" + this.nDopacityScale + ";";
	}
	if (this.nDopacityPow && (typeof (this.nDopacityPow) != "undefined")) {
		szAttributes += "dopacitypow:" + this.nDopacityPow + ";";
	}

	var szLookup = "lookuptoupper:" + (this.fSelectionFieldToUpper || null) + ";";
	szLookup += "lookupsuffix:" + (this.szSelectionFieldSuffix || null) + ";";
	szLookup += "lookupprefix:" + (this.szSelectionFieldPrefix || null) + ";";
	szLookup += "lookupdigits:" + (Number(this.nSelectionFieldDigits) || null) + ";";
	szLookup += "lookuptonumber:" + (this.fSelectionFieldToNumber || null) + ";";
	szLookup += "lookuptoupper:" + (this.fSelectionFieldToUpper || null) + ";";
	szAttributes += szLookup;

	if (this.szAggregationField && (typeof (this.szAggregationField) != "undefined")) {
		szAttributes += "aggregationfield:" + this.szAggregationField + ";";
	}
	if (this.szUnits && (typeof (this.szUnits) != "undefined")) {
		szAttributes += "units:" + this.szUnits + ";";
	}

	// collect style flags to keep from trhe original theme
	//
	var szFlag = "";

	if (this.szFlag.match(/DOPACITY/)) {
		szFlag += "DOPACITYMAX|";
	}
	if (this.szFlag.match(/AGGREGATE/)) {
		szFlag += "AGGREGATE|";
	}
	if (this.szFlag.match(/GROUP/)) {
		szFlag += "GROUP|";
	}
	if (this.szFlag.match(/SUM/)) {
		szFlag += "SUM|";
	}
	if (this.szFlag.match(/ZEROISVALUE/)) {
		szFlag += "ZEROISVALUE|";
	}
	if (this.szFlag.match(/VALUES/)) {
		szFlag += "VALUES|";
	}

	// allow to paint the sub theme over the original one  
	//
	map.Themes.enableMultiChoropleth = true;

	// make the subtheme 
	//

	// case a) CATEGORICAL and AGGREGATE themes -> we must use the original theme and define filter  
	//
	if (this.szFlag.match(/CATEGORICAL/) && this.szFlag.match(/AGGREGATE/) && this.szLabelA) {

		var filterA = [];
		var colorSchemeA = [];
		for (var i = 0; i < this.markedClassesA.length; i++) {
			filterA.push(this.szLabelA[this.markedClassesA[i]]);
			colorSchemeA.push(this.colorScheme[this.markedClassesA[i]]);
		}

		if (this.markedClassesA && (this.markedClassesA.length > 1)) {

			// subtheme with more than one class -> select values or define filter
			//
			var themeObj = this.getDefinitionObject();
			themeObj.style.type += "|NOINFO";
			themeObj.style.values = filterA;
			themeObj.style.colorscheme = colorSchemeA;
			//themeObj.style.filter = "WHERE \""+this.szFields+"\" IN \"("+filterA.join(',')+")\"";
			this.subTheme =
				map.Themes.newThemeByObj(themeObj);

		} else {

			// subtheme with only one class -> make special theme with one category
			//
			szAttributes += "filter:WHERE \"" + this.szFields + "\" IN \"(" + filterA.join(',') + ")\";";
			this.subTheme =
				map.Themes.newTheme(this.szThemes, this.szFields, this.szField100,
					"type:CHOROPLETH|CATEGORICAL|NOINFO|NOLEGEND|SUBTHEME|" + szFlag + ";colorscheme:7|white|" + this.colorScheme[nClass] + ";" + szAttributes, this.szLabelA[nClass], "");
			this.subTheme.parentTheme = this;
		}

	} else

		// case b) multi field themes
		//	
		if (this.markedClassesA && (this.markedClassesA.length > 1)) {

			// subtheme with more than one class
			//
			var fieldsA = this.szFields.split("|");
			var fields = "";
			var colorScheme = "";
			var label = "";
			for (i = 0; i < this.markedClassesA.length; i++) {
				fields += ((fields.length ? "|" : "") + fieldsA[this.markedClassesA[i]]);
				colorScheme += ((colorScheme.length ? "|" : "") + this.colorScheme[this.markedClassesA[i]]);
				label += ((label.length ? "|" : "") + this.szLabelA[this.markedClassesA[i]]);
			}
			this.subTheme =
				map.Themes.newTheme(this.szThemes, fields, this.szField100,
					"type:" + this.szFlag + "|NOINFO" + ";colorscheme:" + colorScheme + ";label:" + label + ";" + szAttributes);

		} else {

			nClass = this.markedClassesA[0] || nClass;

			// subtheme with one class
			//
			this.subTheme =
				map.Themes.newTheme(this.szThemes, this.szFields.split("|")[nClass], this.szField100,
					"type:CHOROPLETH|LOG|DOPACITY|NOINFO|NOLEGEND|SUBTHEME|" + szFlag + ";colorscheme:7|white|" + this.colorScheme[nClass] + ";" + szAttributes + ";alphafield:null;alphafield100:null;dopacitypow:1;dopacityscale:2;", this.szLabelA ? this.szLabelA[nClass] : "", "");

		}

	map.Themes.subTheme = this;
};
/**
 * delete a sub theme of a dominant theme
 */
MapTheme.prototype.removeSubTheme = function () {

	map.Themes.enableMultiChoropleth = false;
	if (this.subTheme) {
		map.Themes.subTheme = false;
		map.Themes.removeTheme(null, this.subTheme.szId);
		this.subTheme = null;
		map.Themes.realizeDone(this);
	}
};

// .............................................................................
//
// filter items of a realized theme 
//
// .............................................................................

/**
 * apply filter to one theme item and return boolean result
 * @parameter objTheme javascript object tha holds all theme values  
 * @parameter item the theme item to check
 * @parameter szFilter a filter expression to check
 * @parameter opt optional options (obj)
 * @type boolean
 * @return true if item matches the filter condition
 */
MapTheme.prototype.isItemInFilter = function (objTheme, item, szFilter, opt) {

	if ((szFilter.length === 0) && !((typeof (opt) != "undefined") && opt.field)) {
		return true;
	}
	if ((typeof (item.dbIndex) != "undefined") || (typeof (item.dbIndexA) != "undefined")) {
		var row = item.dbIndex || item.dbIndexA[0];
		if (szFilter.length) {
			this.__szValue = objTheme.dbRecords[row].join(' ');
			if (eval("this.__szValue.match(/" + szFilter.replace(/\//gi, "\\/") + "/i)")) {
				return true;
			}
		} else {
			if (opt && opt.field) {

				for (var i = 0; i < objTheme.dbFields.length; i++) {
					if (objTheme.dbFields[i].id == opt.field) {
						if (opt.min && (objTheme.dbRecords[row][i] < opt.min)) {
							return false;
						}
						if (opt.max && (objTheme.dbRecords[row][i] > opt.max)) {
							return false;
						}
						if (opt.txt && (objTheme.dbRecords[row][i] != opt.txt)) {
							return false;
						}
					}
				}
				return true;
			}
		}
	}
	return false;
};
/**
 * mark or isolate the theme items which match to a filter string
 * @parameter szFilter a filter expression to check
 * @parameter opt optional options (obj)
 */
MapTheme.prototype.filterItems = function (szFilter, opt) {

	_TRACE("== MapTheme.filterItems() ===> ");

	if (this.fMarkEnable === false) {
		return;
	}

	this.szItemFilter = szFilter;
	this.itemFilterOpt = opt;
	this.filterNodesA = (szFilter.length || (opt && opt.field)) ? [] : null;

	var objTheme = null;
	var row = null;

	for (var i = 0; i < this.szThemesA.length; i++) {
		objTheme = this.objThemesA[this.szThemesA[i]];
		if (objTheme && objTheme.dbRecords) {
			break;
		}
	}
	if (!objTheme || !objTheme.dbRecords) {
		return;
	}

	if (this.szFlag.match(/CHART/)) {
		var chartsA = this.chartGroup.childNodes;
		for (var i = 0; i < chartsA.length; i++) {

			var nodesA = [];
			var chartNode = chartsA.item(i);
			nodesA.push(chartNode);

			for (var ii = 0; ii < nodesA.length; ii++) {
				var szId = nodesA[ii].getAttributeNS(null, "id");
				szId = szId.split(":")[1] + "::" + szId.split(":")[3];
				if (this.itemA[szId]) {
					if (this.isItemInFilter(objTheme, this.itemA[szId], szFilter, opt)) {
						chartNode.style.setProperty("display", "inline", "");
						if (this.filterNodesA) {
							this.filterNodesA.push(szId);
						}
					} else {
						chartNode.style.setProperty("display", "none", "");
					}
				} else {
					chartNode.style.setProperty("display", "inline", "");
				}
			}
		}
	} else {
		this.beginDraw();
		for (var a in this.itemA) {
			if (this.itemA[a]) {
				if (typeof (this.itemA[a].dbIndex) != "undefined") {

					if (this.isItemInFilter(objTheme, this.itemA[a], szFilter, opt)) {

						if (this.filterNodesA) {
							this.filterNodesA.push(a);
						}

						// switch on 
						var tilesNodesA = this.getItemNodes(a);
						for (var j = 0; j < tilesNodesA.length; j++) {
							if (this.szFlag.match(/BUFFER/)) {
								var nNode = SVGDocument.getElementById(tilesNodesA[j].getAttributeNS(null, "id") + ":paint");
								if (nNode) {
									nNode.style.setProperty("display", "inline", "");
								}
							} else {
								var szThemeStyle = tilesNodesA[j].getAttributeNS(szMapNs, "themestyle");
								if (szThemeStyle && szThemeStyle.length && szThemeStyle != "null") {
									tilesNodesA[j].setAttributeNS(null, "style", szThemeStyle);
									tilesNodesA[j].removeAttributeNS(szMapNs, "themestyle");
									// GR 11.11.2011 look for value node
									var nNode = SVGDocument.getElementById(tilesNodesA[j].firstChild.nextSibling.getAttribute("id") + "L");
									if (nNode) {
										nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
									}
									var nNode = SVGDocument.getElementById(tilesNodesA[j].firstChild.nextSibling.getAttribute("id") + "L:bg");
									if (nNode) {
										nNode.style.setProperty("display", nNode.getAttributeNS(szMapNs, "display"), "");
									}
								}
							}
						}
					} else {
						// switch off 
						tilesNodesA = this.getItemNodes(a);
						for (j = 0; j < tilesNodesA.length; j++) {
							if (this.szFlag.match(/BUFFER/)) {
								var nNode = SVGDocument.getElementById(tilesNodesA[j].getAttributeNS(null, "id") + ":paint");
								if (nNode) {
									nNode.style.setProperty("display", "none", "");
								}
							} else {
								if (!tilesNodesA[j].getAttributeNS(szMapNs, "themestyle")) {
									tilesNodesA[j].setAttributeNS(szMapNs, "themestyle", tilesNodesA[j].getAttributeNS(null, "style"));
								}
								tilesNodesA[j].setAttributeNS(null, "style", tilesNodesA[j].getAttributeNS(szMapNs, "origthemestyle"));
								// GR 11.11.2011 look for value node
								var nNode = SVGDocument.getElementById(tilesNodesA[j].firstChild.nextSibling.getAttribute("id") + "L");
								if (nNode) {
									nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
									nNode.style.setProperty("display", "none", "");
								}
								var nNode = SVGDocument.getElementById(tilesNodesA[j].firstChild.nextSibling.getAttribute("id") + "L:bg");
								if (nNode) {
									nNode.setAttributeNS(szMapNs, "display", nNode.style.getPropertyValue("display"));
									nNode.style.setProperty("display", "none", "");
								}
							}
						}
					}
				}
			}
		}
		this.endDraw();
	}

	this.fMarkClass = true;
	_TRACE("== filterItems done === ");
};

/**
 * make a theme selection out of the filtered items
 */
MapTheme.prototype.selectFilterItems = function () {
	var newSelection = map.Selections.newSelection("generic", this.filterNodesA, "type:queryresult", this.szItemFilter);
};

/**
 * highlight the items in the list (array or string)
 */
MapTheme.prototype.highlightItems = function (szItems, szSeparator) {
	if ( szItems === "" ){
		this.clearHighlightItems();
		return;
	}
	highLightList.removeAll();
	var szItemsA = szItems.split(szSeparator || ",");
	var __this = this;
	szItemsA.forEach(function (a) {
		if (__this.szFlag.match(/CHART/)) {
			var c = SVGDocument.getElementById(__this.szId + ':' + a + ':chartgroup');
			if (!c){
				a = __this.szThemesA[0] + "::" + a;
				c = SVGDocument.getElementById(__this.szId + ':' + a + ':chartgroup');
			}
			highLightList.addItem(c.parentNode,"isolate");
			map.displayInfo(null, c.firstChild, "add|fix");
		} else {
			var tilesNodesA = __this.getItemNodes(a);
			for (var j = 0; j < tilesNodesA.length; j++) {
				highLightList.addItem(tilesNodesA[j]);
			}
			map.displayInfo(null, tilesNodesA[0].firstChild.nextSibling, "add|fix");
		}
	});
};
/**
 * clear the highlights 
 */
MapTheme.prototype.clearHighlightItems = function () {
	highLightList.removeAll();
	map.removeInfo();
};

// .............................................................................
//
// value label for chloroplethe themes
//
// .............................................................................

/**
 * create value label on the map
 * is called several times with a item index to start or continue
 * @parameter startIndex if 0, init labeling map items, else, continue labeling
 */
MapTheme.prototype.labelMap = function (startIndex) {

	_TRACE("== MapTheme.labelMap(" + startIndex + ")===> " + (this.szId));
	_TRACE("== ==> ");

	var zoomBox = map.Zoom.getBox();
	var ptOff = null;

	var nFontSize = 11;
	var szFontFamily = "verdana";

	this.szValuesTextStyle = "font-family:" + szFontFamily + ";font-size:" + map.Scale.normalX(nFontSize) + "px;pointer-events:none";

	if (!startIndex || startIndex === 0) {
		var a = 0;
		startIndex = 0;
		this.indexA = [];

		// check visibility
		// 
		var nToDraw = 0;
		var nCharts = 0;
		if (this.fClipCharts) {
			for (a in this.itemA) {
				nCharts++;
				if (this.itemA[a].nValuesA && (this.itemA[a].nValuesA.length > 0)) {
					var ptOff = this.getNodePosition(this.itemA[a].szSelectionId);
					if (!ptOff) {
						continue;
					}
					if (ptOff.x < zoomBox.x ||
						ptOff.x > zoomBox.x + zoomBox.width ||
						ptOff.y < zoomBox.y ||
						ptOff.y > zoomBox.y + zoomBox.height) {
						this.nSkipCount++;
                        var chartGroup;
						if ((chartGroup = SVGDocument.getElementById(this.szId + ":" + a + ":chart"))) {
							chartGroup.parentNode.removeChild(chartGroup);
							this.chartPosA[this.itemA[a].szSelectionId] = null;
							this.posItemA[this.itemA[a].szSelectionId] = null;
						}
						continue;
					}
					this.indexA[this.indexA.length] = a;
					nToDraw++;
				}
			}
		} else {
			for (a in this.itemA) {
				this.indexA[this.indexA.length] = a;
				nCharts++;
				nToDraw++;
			}
		}

		_TRACE(nToDraw + " to draw (" + nCharts + ")");

		if (nToDraw > this.nMaxThemeCharts) {
			this.indexA.length = 0;
			this.nSkipCount = nToDraw;
		}

		if (this.mapSleep) {
			this.mapSleep.nCount = nToDraw;
		}
		this.fEnableProgressBar = false;
	}

	for (var nAi = startIndex; nAi < this.indexA.length; nAi++) {

		// execution canceled ? -----------------
		if (this.fCancel) {
			displayMessage("Canceled by user", 1000, true);
			this.fCancel = false;
			return;
		}

		// sleep work around to show progress -----------------
		if (this.mapSleep) {
			this.mapSleep.nDoneCount = this.nDoneCount;
			if (this.mapSleep.checkSleep(nAi, 10)) {
				this.fContinue = true;
				this.continueIndex = nAi;
				return;
			}
		}
		
		var a = this.indexA[nAi];

		this.nDoneCount++;

		if (this.itemA[a].nValuesA && (this.itemA[a].nValuesA.length > 0)) {

			// first check, if we have a position, if not -> no chart
			ptOff = this.getNodePosition(this.itemA[a].szSelectionId);

			if (!ptOff) {
				_TRACE("missing position: " + a);
				this.nMissingPositionCount++;
				continue;
			}

			// check if position visible
			if (this.fClipCharts && !this.szFlag.match(/BUFFER/)) { // && !this.szFlag.match(/CATEGORICAL/) ){
				if (ptOff.x < zoomBox.x ||
					ptOff.x > zoomBox.x + zoomBox.width ||
					ptOff.y < zoomBox.y ||
					ptOff.y > zoomBox.y + zoomBox.height) {
					this.nSkipCount++;
					continue;
				}
			}

			var tilesNodesA = this.getItemNodes(a);
			for (var j = 0; j < tilesNodesA.length; j++) {
				var nValue = this.itemA[a].nValue;
				if ( !this.szValueField && this.itemA[a].szLabel ) {
					nValue = this.itemA[a].szLabel;
				}
				this.labelShape(tilesNodesA[j], this.itemA[a].szColor, nValue);
			}
		}
	}

	this.fMakeLabel = false;

	setTimeout(function(){map.Layer.adaptLabel(null);}, 10);

	_TRACE("== done === ");
};

/**
 * unlabel one theme 
 */
MapTheme.prototype.unlabelMap = function () {

	for (var a in map.Layer.generatedLabelA) {
		map.Dom.removeElementById(a);
		map.Layer.generatedLabelA[a] = null;
	}

};

/**
 * create label for one map shape
 * @parameter shapeNode the map shape node (SVG) to label
 * @parameter szColor the color for the label
 * @parameter nValue the value to display (as label)
 */
MapTheme.prototype.labelShape = function (shapeNode, szColor, nValue) {

	if (this.szFlag.match(/VALUES/) && nValue != "undefined" && typeof (nValue) != "undefined") {

		// GR 21.10.2015 don't draw zeros if NOZERO is set
		if (this.szFlag.match(/NOZERO/) && (nValue === 0)) {
			return;
		}
		var szFontStyle = "font-family:verdana;font-weight:normal";

		var szParentId = shapeNode.parentNode.getAttributeNS(null, "id");
		var labelParentNode = SVGDocument.getElementById(szParentId + ":label");
		if (labelParentNode) {
			var valueParentBgNode = SVGDocument.getElementById(szParentId + ":values:bg");
			if (!valueParentBgNode) {
				valueParentBgNode = map.Dom.newGroup(labelParentNode.parentNode, szParentId + ":values:bg");
				map.Layer.generatedLabelA[szParentId + ":values:bg"] = valueParentBgNode;
			}
			var valueParentNode = SVGDocument.getElementById(szParentId + ":values");
			if (!valueParentNode) {
				valueParentNode = map.Dom.newGroup(labelParentNode.parentNode, szParentId + ":values");
				map.Layer.generatedLabelA[szParentId + ":values"] = valueParentNode;
			}

			// make label id
			try {
				var szId = shapeNode.firstChild.nextSibling.getAttributeNS(null, "id");
				var szIdA = szId.split("#");
				var szValueNodeId = szIdA[0] + "L" + (szIdA[1] ? ("#" + szIdA[1]) : "");
			} catch (e) {
				var szValueNodeId = shapeNode.getAttributeNS(null, "id") + ":::value";
			}

			// test if we have already the value text
			if (SVGDocument.getElementById(szValueNodeId)) {
				return;
			}
			// create the value text
			var cColor = __maptheme_getChartColors(szColor);

			if (typeof (nValue) == "string") {
				var szValue = nValue;
			} else {
				var szValue = this.formatValue(nValue, this.nValueDecimals || 0) + (this.szUnit.match(/\%/) ? "%" : "");
			}

			var szTColor = "#ffffff";
			var szTColor = this.szTextColor || cColor.highColor;
			var szBgColor = cColor.lowColor;

			// GR 04.07.2013 DOPACITY
			// ----------------------
			var nScale = 1;
			var szOpacity = Math.max(0.3,shapeNode.style.getPropertyValue("fill-opacity")||"1");
			if (this.szFlag.match(/DTEXT/)) {
				//szOpacity = shapeNode.style.getPropertyValue("fill-opacity");
				//nScale = Math.max(0.7,Math.min(1.3,(3*Number(szOpacity))));
				nScale = Math.max(0.7, Math.min(1.5, (2 / Math.sqrt(this.nMax) * Math.sqrt(nValue))));
			}
			// ----------------------
			// var nFontSize = map.Scale.normalX(11)*map.Scale.nZoomScale*nScale;
			var nFontSize = map.Scale.normalX(11) * map.Scale.nZoomScale * nScale * map.Scale.nLabelScaling * (this.nLabelScale || 1);
			var newTextbg = map.Dom.newText(valueParentBgNode, 0, 0, szFontStyle + ";font-size:" + nFontSize + "px;text-anchor:middle;fill:none;stroke:" + szBgColor + ";stroke-width:" + map.Scale.normalX(4) * map.Scale.nZoomScale + ";stroke-opacity:0.5;pointer-events:none;display:none;stroke-linejoin:bevel;", szValue);
			var newText = map.Dom.newText(valueParentNode, 0, 0, szFontStyle + ";font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTColor + ";stroke:none;pointer-events:none;display:none;", szValue);

			newText.setAttributeNS(null, "id", szValueNodeId);
			newTextbg.setAttributeNS(null, "id", szValueNodeId + ":bg");

			// GR 04.07.2013 DOPACITY
			// ----------------------
			if (this.szFlag.match(/DOPACITY/)) {
				newText.style.setProperty("fill-opacity", szOpacity, "");
				newTextbg.style.setProperty("stroke-opacity", szOpacity*0.3, "");
			}
			// ----------------------

			var szCenter = shapeNode.getAttributeNS(szMapNs, "center");
			if (szCenter) {
				var szCenterA = szCenter.split(',');
				var ptPos = new point(Number(szCenterA[0].split(':')[1]), Number(szCenterA[1].split(':')[1]));
			} else {
				var ptPos = this.getNodePosition(shapeNode.getAttributeNS(null, "id"));
			}

			if (ptPos) {
				newText.fu.setPosition(ptPos.x, ptPos.y);
				newTextbg.fu.setPosition(ptPos.x, ptPos.y);
			} else {
				_TRACE(shapeNode.getAttributeNS(null, "id") + " no position");
			}
		} else {
			// _TRACE(shapeNode.getAttributeNS(null,"id")+" not found");
		}
	}
};

// .............................................................................
//
// zoom to theme extension
//
// .............................................................................
/**
 */
MapTheme.prototype.zoomTo = function () {

	_TRACE("== MapTheme.zoomTo() ===> ");

	var pStart = new point(100000, 100000);
	var pEnd = new point(-100000, -100000);

	// GR 16.10.2022 zoom to for FEATURE themes
	// ----------------------------------------
	if (this.szFlag.match(/FEATURE/)) {
		var node = SVGDocument.getElementById(this.szThemesA[0]);
		var bBox = map.Dom.getBox(node);
		map.Zoom.setNewArea(bBox);
		return;
	} 
	
	if (this.szFlag.match(/CHART/)) {
		for (var a in this.itemA) {
			var ptOff = this.itemA[a].ptPos || this.getNodePosition(this.itemA[a].szSelectionId);
			if (ptOff && ptOff.x && ptOff.y) {
				pStart.x = Math.min(pStart.x, ptOff.x);
				pStart.y = Math.min(pStart.y, ptOff.y);
				pEnd.x = Math.max(pEnd.x, ptOff.x);
				pEnd.y = Math.max(pEnd.y, ptOff.y);
			}
		}
	} else {
		for (var a in this.itemA) {
			var tilesNodesA = this.getItemNodes(a);
			for (var j = 0; j < tilesNodesA.length; j++) {
				var bBox = map.Dom.getBox(tilesNodesA[j]);
				if (bBox.width === 0 || bBox.height === 0) {
					var nodeMatrixA = getMatrix(tilesNodesA[j]);
					bBox.x += nodeMatrixA[4];
					bBox.y += nodeMatrixA[5];
					bBox.width = map.Scale.viewBox.width / 20;
					bBox.height = map.Scale.viewBox.height / 20;
					bBox.x -= bBox.width / 2;
					bBox.y -= bBox.height / 2;
				}
				var ptOffset = map.Scale.getMapOffset(tilesNodesA[j]);
				bBox.x += ptOffset.x;
				bBox.y += ptOffset.y;
				pStart.x = Math.min(pStart.x, bBox.x);
				pStart.y = Math.min(pStart.y, bBox.y);
				pEnd.x = Math.max(pEnd.x, bBox.x + bBox.width);
				pEnd.y = Math.max(pEnd.y, bBox.y + bBox.height);
			}
		}
	}
	var allBox = new box(pStart.x, pStart.y, pEnd.x - pStart.x, pEnd.y - pStart.y);
	allBox.scale(1);
	allBox = map.Zoom.clipArea(allBox);

	map.Zoom.setNewArea(allBox);

	_TRACE("== zoomTo done === ");
};

// .............................................................................
//
// chart themes
//
// .............................................................................
/**
 * create chart hosting group 
 * is called once
 */
MapTheme.prototype.createChartGroup = function (objectGroup) {
	
	if (this.chartGroup) {
		return;
	}

	if (this.szFlag.match(/FEATURE/)) {
		this.chartGroup = map.Dom.newGroup(map.Layer.layerNode, this.szThemesA[0]);
						  map.Dom.newGroup(map.Layer.layerNode, this.szThemesA[0] + ":label");
		map.Layer.listA[this.szThemesA[0]] = new Map.Layer.Item(null);
		map.Layer.listA[this.szThemesA[0]].szName = this.szThemesA[0];
		map.Layer.listA[this.szThemesA[0]].szHighlight = 
			"fill:url(#DiagUp200000000);stroke:black;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;";
		map.Layer.listA[this.szThemesA[0]].szSelection = this.szItemField;
		if (this.nFeatureLower || this.nFeatureUpper){
			map.Layer.depListA[this.szThemesA[0]] = {};
			map.Layer.depListA[this.szThemesA[0]].nLower = (this.nFeatureLower||0);
			map.Layer.depListA[this.szThemesA[0]].nUpper = (this.nFeatureUpper||1000000000);
			map.Layer.depListA[this.szThemesA[0]].shapeId = this.szThemesA[0];
			map.Layer.depListA[this.szThemesA[0]].szDisplayAttribute = "none";
			map.Layer.depListA[this.szThemesA[0]].szFeature = this.szThemesA[0];
			setTimeout("map.Layer.switchScaleDependentLayer(null)",10);
			}
	}else{
		this.chartGroup = map.Dom.newGroup(objectGroup, this.szId + ":chartgroup");
	}
	this.chartGroup.style.setProperty("opacity", String(this.nOpacity ? this.nOpacity : 1), "");
	
	// GR 21.12.2022 SILENT chart -> no pointer events	 
	if (this.szFlag.match(/SILENT/)) {
		this.chartGroup.style.setProperty("pointer-events", "none", "");
	}
	// GR 04.03.2017 vector charts must not be scaled	 
	if (this.szFlag.match(/VECTOR/)) {
		antiZoomAndPanList.addGroup(this.chartGroup);
	}
	// GR 17.12.2015 aggregated by grid with autosize, no object scaling on zoom	 
	if (this.szFlag.match(/NOSCALE/)) {
		antiZoomAndPanList.addGroup(this.chartGroup);
	}
	// GR 17.12.2015 aggregated by grid with autosize, no object scaling on zoom	 
	if (this.szFlag.match(/AGGREGATE/) && (this.szFlag.match(/AUTOSIZE/) || this.szFlag.match(/GRIDSIZE/))) {
		antiZoomAndPanList.addGroup(this.chartGroup);
	}
	// GR 24.09.2018 chart with size in meter	 
	if (this.szFlag.match(/GRIDSIZE/) && !this.szFlag.match(/AGGREGATE/)) {
		antiZoomAndPanList.addGroup(this.chartGroup);
	}

	if (this.szFlag.match(/BUFFER/)) {
		if (this.szFlag.match(/OVERLAY/) && !this.szShapeType.match(/line/)) {
			this.chartGroup.style.setProperty("opacity", String(1), "");
		}
		// GR buffer sotto object
		var layerObj = map.Layer.getLayerObj(this.szThemesA[0]);
		this.chartGroup.style.setProperty("pointer-events", "none", "");
		antiZoomAndPanList.addGroup(this.chartGroup);

		// GR 20.09.2011 try to set style here !! for all buffer charts
		// -------------------------------------------------------
		var szColor = this.colorScheme[0];
		var szLineColor = this.colorScheme[1] ? this.colorScheme[1] : "red";
		if (typeof (this.szBorderColor) != 'undefined') {
			szLineColor = this.szBorderColor;
		}
		var szLineStyle = "stroke-width:0;";
		if (typeof (this.szBorderStyle) != 'undefined') {
			switch (this.szBorderStyle) {
				case "dotted":
					szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:round;stroke-dasharray:1,50;";
					break;
				case "dashed":
					szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:butt;stroke-dasharray:300,300;";
					break;
				case "solid":
					szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";";
					break;
				case "none":
					szLineStyle = "stroke-width:0;";
					break;
			}
		}
		if (typeof (this.szBorderWidth) != 'undefined') {
			switch (this.szBorderWidth) {
				case "thin":
					szLineStyle += "stroke-width:" + map.Scale.normalX(0.5) + ";";
					break;
				case "thick":
					szLineStyle += "stroke-width:" + map.Scale.normalX(1.5) + ";";
					break;
				default:
					szLineStyle += "stroke-width:" + map.Scale.normalX(this.szBorderWidth) + ";";
					break;
			}
		}
		var nFillOpacity = this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 0);
		this.chartGroup.setAttributeNS(null, "style", "fill:" + szColor + ";fill-opacity:" + nFillOpacity + ";stroke:" + szLineColor + ";" + szLineStyle + ";");
		// -------------------------------------------------------
	}
};

/**
 * create charts of one theme on the map
 * is called several times with a item index to start or continue
 * @parameter startIndex if 0, init labeling map items, else, continue labeling
 */
MapTheme.prototype.chartMap = function (startIndex) {

	_TRACE("== MapTheme.chartMap()  ");
	
	// check if chart is scaledependent
	if ( (this.nChartUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale >  this.nChartUpper)) ||
	     (this.nChartLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nChartLower)) )  {
		// create chartgroup anyway to preserve layer sequence
		if (!this.chartGroup) {
			this.createChartGroup(map.Layer.objectGroup);
		}	
		this.chartGroup.style.setProperty("display", "none", "");
		//this.unpaintMap();
		this.fVisible = false;
		this.realizeDone();
		return;
	}
	
	this.fVisible = true;

	if (this.chartGroup) {
		this.chartGroup.style.setProperty("display", (this.chartGroup.display || "inline"), "");
	}

	if (this.chartGroup && !startIndex) {
		this.chartPosA = [];
	}

	var nChartSize = this.nChartSize ? this.nChartSize : 30;
	var zoomBox = map.Zoom.getBox();

	// GR 13.12.2015 box must be larger, to show all charts also if they are partly outside 
	if (this.szFlag.match(/AGGREGATE/) && this.nGridWidth) {
		var deltaX = map.Scale.getDeltaXofDistanceInMeter((this.nGridWidth || 0)) * map.Scale.nZoomScale;
		zoomBox.x -= deltaX / 2;
		zoomBox.y -= deltaX / 2;
		zoomBox.width += deltaX;
		zoomBox.height += deltaX;
	} else {
		var deltaX = map.Scale.normalX(30) * map.Scale.nZoomScale;
		zoomBox.x -= deltaX / 2;
		zoomBox.y -= deltaX / 2;
		zoomBox.width += deltaX;
		zoomBox.height += deltaX;
	}

	var ptOff = null;

	var szColor = "#777777";
	var szLColor = "#888888";
	var nFontSize = 8;

	// ---------------------------------
	//
	// first call, do the initializing !
	//
	// ---------------------------------

	if (!startIndex || startIndex === 0) {

		_TRACE("first call to chartMap(), init !");

		// no values, no charts		
		// --------------------				
		if (!this.partsA) {
			this.realizeDone();
			return;
		}
	
		var a = 0;
		startIndex = 0;
		this.indexA = [];

		// some preparations
		// -----------------
		this.szValuesLineStyle = "stroke:white;stroke-width:" + map.Scale.normalX(1.5) + ";opacity:0.5;";
		this.szValuesLineBgStyle = "stroke:" + szLColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";opacity:1;";
		this.szValuesTextStyle = "font-family:" + (this.szTextFont || "arial") + ";font-size:" + map.Scale.normalX(nFontSize) + "px;fill:" + szColor + ";pointer-events:none";
		this.szValuesTextBgStyle = "font-family:" + (this.szTextFont || "arial") + ";font-size:" + map.Scale.normalX(nFontSize) + "px;fill:none;stroke:white;stroke-width:" + map.Scale.normalY(nFontSize) / 5 + ";stroke-opacity:0.8;pointer-events:none;stroke-linejoin:bevel;pointer-events:none";

		var objectGroup = map.Layer.objectGroup;

		if (!this.chartGroup) {
			this.createChartGroup(objectGroup);
		}

		// GR 04.11.2014 make blur for the objects
		this.blur(this.nBlur);

		// GR 26.09.2017 auto opacity -> fillOpacity
		if (this.autoOpacity) {
			var dx = (map.Scale.nTrueMapScale*map.Scale.nZoomScale)/map.Scale.nNormalSizeScale;
			this.fillOpacity = 1 * Math.max(0.1, (Math.min(1, 20 / Math.max(1, Math.pow(map.Zoom.nZoom/dx, 0.5)))));
		}

		if (this.mapSleep) {
			this.mapSleep.checkSleepMessage = "creating charts";
		}

		// check the chart size
		var nSize = nChartSize * this.nScale * map.Scale.nFeatureScaling * map.Scale.nObjectScaling * map.Zoom.nZoom;
		if (fObjectScaling) {
			nSize = nChartSize * this.nScale * map.Scale.nFeatureScaling * map.Scale.nObjectScaling;
		}

		// get the canvas rotation
		var nRot = getRotateAttributeValue(map.Scale.canvasNode);

		// GR 15.12.2016 we must sort all charts 
		// -------------------------------------
		if (this.szFlag.match(/\bSORT\b/) && !(this.szFlag.match(/SEQUENCE/) || this.szFlag.match(/3D/))) {

			this.indexA = [];

			for (a in this.itemA) {
				this.indexA[this.indexA.length] = a;
			}
			var sortA = [];

			for (var i = 0; i < this.indexA.length; i++) {
				var nValue = this.itemA[this.indexA[i]].nValuesA[this.nActualFrame || 0];
				if (this.itemA[this.indexA[i]].nSize) {
					nValue = this.itemA[this.indexA[i]].nSize;
				} else if (this.szFlag.match(/SIZE/) && this.itemA[this.indexA[i]].nValueSum) {
					nValue = this.itemA[this.indexA[i]].nValueSum;
				}
				if (isNaN(nValue)) {
					continue;
				}
				sortA.push({
					a: this.indexA[i],
					y: nValue
				});
			}

			// sort charts
			// attention; up -> down because the last chart will be on top of the others
			if (this.szFlag.match(/\bUP\b/)) {
				sortA.sort(this.sortDownChartObjectsCompare);
			} else {
				sortA.sort(this.sortUpChartObjectsCompare);
			}

			if (this.szValueField && (this.szValueField == "$index$")) {
				for (var i = 0; i < sortA.length; i++) {
					this.itemA[sortA[i].a].szValue = String(sortA.length - i);
				}
			}

			this.indexA = [];
		}

		// ----------------- end of some preparations

		// clear counts for sequenze parts
		// -----------------------------
		if (this.szFlag.match(/CHART/) && !this.szFlag.match(/CATEGORICAL/)) {
			for (var s = 0; s < this.partsA.length; s++) {
				this.partsA[s].nCount = 0;
				this.partsA[s].nSum = 0;
			}
			this.fRedrawInfo = true;
			// GR 20.11.2013 if SEQUENCE set nFadeNegative to 1 if not yet set
			if (this.szFlag.match(/SEQUENCE/)) {
				this.nFadeNegative = this.nFadeNegative || 1;
			}
		}

		// check visibility
		// 
		var nToDraw = 0;
		var nCharts = 0;
		var nNoPos = 0;
		
		if (this.fClipCharts && !this.szFlag.match(/BUFFER/) && !this.szFlag.match(/\bPOSITION\b/) && !this.szFlag.match(/FEATURE/)) {
			for (i = 0; i < this.partsA.length; i++) {
				this.partsA[i].nCount = 0;
				this.partsA[i].nSum = 0;
			}
			for (a in this.itemA) {
				nCharts++;
				if (this.itemA[a].nValuesA && (this.itemA[a].nValuesA.length > 0)) {
					var ptOff = this.itemA[a].ptPos || this.getNodePosition(this.itemA[a].szSelectionId);
					if (!ptOff) {
						this.missedA[a] = a;
						nNoPos++;
						continue;
					}
					if ( !this.szFlag.match(/NOCLIPTOVIEW/) &&
					   (ptOff.x < zoomBox.x ||
						ptOff.x > zoomBox.x + zoomBox.width ||
						ptOff.y < zoomBox.y ||
						ptOff.y > zoomBox.y + zoomBox.height) 
						) {
						if (!this.szFlag.match(/\b(VECTOR|BEZIER)\b/)) {
							this.nSkipCount++;
                            var chartGroup;
							if ((chartGroup = this.itemA[a].chartNode) && chartGroup.parentNode) {
								if (chartGroup.parentNode) {
									chartGroup.parentNode.removeChild(chartGroup);
								}
								this.itemA[a].chartNode = null;
								this.chartPosA[this.itemA[a].szSelectionId] = null;
								this.posItemA[this.itemA[a].szSelectionId] = null;
							}
							continue;
						} else {
							var ptOff = this.itemA[a].ptPos2 || (this.szLabelA ? this.getNodePosition(this.szThemesA[0] + "::" + this.szLabelA[this.itemA[a].nValuesA[0] - 1]) : null);
							if (!ptOff) {
								continue;
							}
							if (ptOff.x < zoomBox.x ||
								ptOff.x > zoomBox.x + zoomBox.width ||
								ptOff.y < zoomBox.y ||
								ptOff.y > zoomBox.y + zoomBox.height) {
								this.nSkipCount++;
								if ((chartGroup = this.itemA[a].chartNode) && chartGroup.parentNode) {
									if (chartGroup.parentNode) {
										chartGroup.parentNode.removeChild(chartGroup);
									}
									this.itemA[a].chartNode = null;
									this.chartPosA[this.itemA[a].szSelectionId] = null;
									this.posItemA[this.itemA[a].szSelectionId] = null;
								}
								continue;
							}
						}
					}
					if (0 && this.itemA[a].ptPos && this.itemA[a].ptPos2 && (this.itemA[a].ptPos.x == this.itemA[a].ptPos2.x) && (this.itemA[a].ptPos.y == this.itemA[a].ptPos2.y)) {
						continue;
					}
					// chart is visibile !
					// ------------------
					this.indexA[this.indexA.length] = a;

					// sum counts for sequenze parts
					// and make value sum of visible charts for dynamic theme legends
					// --------------------------------------------------------------
					if (this.szFlag.match(/CHART/)) {
						if (this.szFlag.match(/CATEGORICAL/)) {
							if (this.nMaxA.length > 1) {
								// multiple value charts like pies,stars, ...
								for (i = 0; i < this.partsA.length; i++) {
									this.partsA[i].nCount += (this.itemA[a].nCountA && this.itemA[a].nCountA[i] && !isNaN(this.itemA[a].nCountA[i])) ? this.itemA[a].nCountA[i] : 0;
									this.partsA[i].nSum += (this.itemA[a].nValuesA && this.itemA[a].nValuesA[i] && !isNaN(this.itemA[a].nValuesA[i])) ? this.itemA[a].nValuesA[i] : 0;
								}
							} else {
								// single value charts like bubble, label, ...
								if (this.szAlphaField) {
									if (this.szColorField && this.partsA[this.itemA[a].nClass]) {
										this.partsA[this.itemA[a].nClass].nCount++;
										this.partsA[this.itemA[a].nClass].nSum += !isNaN(this.itemA[a].nAlpha) ? this.itemA[a].nAlpha : (!isNaN(this.itemA[a].nSize) ? this.itemA[a].nSize : 1);
									} else
									if (this.partsA[this.itemA[a].nValuesA[0] - 1]) {
										this.partsA[this.itemA[a].nValuesA[0] - 1].nCount++;
										this.partsA[this.itemA[a].nValuesA[0] - 1].nSum += !isNaN(this.itemA[a].nAlpha) ? this.itemA[a].nAlpha : (!isNaN(this.itemA[a].nSize) ? this.itemA[a].nSize : 1);
									}
								} else {
									if (this.szColorField && this.partsA[this.itemA[a].nClass]) {
										this.partsA[this.itemA[a].nClass].nCount++;
										this.partsA[this.itemA[a].nClass].nSum += (!isNaN(this.itemA[a].nSize) ? this.itemA[a].nSize : 1);
									} else
									if (this.partsA[this.itemA[a].nValuesA[0] - 1]) {
										this.partsA[this.itemA[a].nValuesA[0] - 1].nCount++;
										this.partsA[this.itemA[a].nValuesA[0] - 1].nSum += (!isNaN(this.itemA[a].nSize) ? this.itemA[a].nSize : 1);
									}
								}
							}
						} else {
							if (this.nMaxA.length > 1) {
								for (i = 0; i < this.partsA.length; i++) {
									if (!this.szFlag.match(/MEAN/) || this.itemA[a].nValuesA[i]) {
										this.partsA[i].nCount++;
										this.partsA[i].nSum += !isNaN(this.itemA[a].nValuesA[i]) ? this.itemA[a].nValuesA[i] : 0;
									}
								}
							} else {
								for (i = 0; i < this.partsA.length; i++) {
									if ((this.itemA[a].nValuesA[0] >= this.partsA[i].min) && (this.itemA[a].nValuesA[0] < this.partsA[i].max)) {
										this.partsA[i].nCount++;
										this.partsA[i].nSum += !isNaN(this.itemA[a].nValuesA[0]) ? this.itemA[a].nValuesA[0] : 0;
									}
								}
							}
						}
					}

					nToDraw++;
				}
			}

			// GR 29.11.2016 no position found ? may be we have to wait for tiles ?
			// -------------------------------------------------------------------
			if ((nCharts == nNoPos) && !map.Tiles.allTilesLoaded()) {
				this.fDataIncomplete = true;
				this.fRedraw = true;
				map.Tiles.switchScaleDependentTiles();
				setTimeout(function(){map.Themes.execute();}, 1);
				return;
			}
		} else {
			for (a in this.itemA) {
				this.indexA[this.indexA.length] = a;
				/**
				// sum counts for sequenze parts
				// -----------------------------
				if (this.szFlag.match(/CHART/) && !this.szFlag.match(/CATEGORICAL/)) {
					for (i = 0; i < this.partsA.length; i++) {
						this.partsA[i].nCount++;
						this.partsA[i].nSum += !isNaN(this.itemA[a].nValuesA[i]) ? this.itemA[a].nValuesA[i] : 0;
					}
				}
				**/
				nCharts++;
				nToDraw++;
			}
		}

		_TRACE(nToDraw + " to draw (" + nCharts + ")");

		if (nToDraw > this.nMaxThemeCharts) {
			this.ErrorMessage = "max charts (" + this.nMaxThemeCharts + ") exceeded; please zoom in";
			this.indexA.length = 0;
			this.nSkipCount = nToDraw;
			for (a in this.itemA) {
				if ((chartGroup = SVGDocument.getElementById(this.szId + ":" + a + ":chart"))) {
					chartGroup.parentNode.removeChild(chartGroup);
				}
			}
		}

		this.fRedrawAllCharts = false;

		// GR 26.07.2012 chrome crashes if more objects with shadow
		// if ( szViewer.match(/chrome/i) && (nToDraw > 1000) ){
		if ((nToDraw > this.nMaxShadowCharts)) {
			if (this.fShadow) {
				this.fRedrawAllCharts = true;
			}
			this.fShadow = false;
		} else {
			if (this.fOrigShadow && !this.fShadow) {
				this.fRedrawAllCharts = true;
			}
			this.fShadow = this.fOrigShadow;
		}

		// GR 24.01.2018 scale dependent shadow
		if (this.szShadowUpper) {
			if (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nShadowUpper) {
				this.xOrigShadow = this.xOrigShadow || this.fOrigShadow;
				this.fShadow = this.fOrigShadow = false;
			} else {
				this.fOrigShadow = this.xOrigShadow || this.fOrigShadow;
			}
		}

		// GR 24.01.2018 scale dependent shadow
		if (this.szShadowLower) {
			if (map.Scale.nTrueMapScale * map.Scale.nZoomScale < this.nShadowLower) {
				this.xOrigShadow = this.xOrigShadow || this.fOrigShadow;
				this.fShadow = this.fOrigShadow = false;
			} else {
				this.fOrigShadow = this.xOrigShadow || this.fOrigShadow;
			}
		}

		if (this.mapSleep) {
			this.mapSleep.nCount = nToDraw;
		}

		// sort the charts before drawing them
		// 
		this.fSorted = false;
		
		if (this.fSortBeforeDraw && ((this.nMin != this.nMax) || this.szSizeField) &&
			(!this.szFlag.match(/NOSRT/) && !this.szFlag.match(/DOT/)) &&
			(!this.szFlag.match(/NOSIZE/) || this.szFlag.match(/3D/) || this.szFlag.match(/\bSORT\b/)) &&
			(!this.szFlag.match(/CATEGORICAL/) || this.szFlag.match(/AGGREGATE/) || this.szSizeField || this.szFlag.match(/\bSORT\b/))) {

			_TRACE("sort before drawing");

			var chartYPosA = [];

			if ((this.szFlag.match(/3D/) || this.szFlag.match(/PLOT/) || this.szFlag.match(/xxxBOXxxx/) || (this.szFlag.match(/POINTER/) && this.szFlag.match(/BAR/))) &&
				!((this.szFlag.match(/MULTIPLE/) || this.szFlag.match(/MULTIGRID/)) && !this.szFlag.match(/AGGREGATE/))) {

				// sort by y position 
				// ------------------
				for (var i = 0; i < this.indexA.length; i++) {
					if ((ptOff = this.itemA[this.indexA[i]].ptPos || this.getNodePosition(this.itemA[this.indexA[i]].szSelectionId))) {
						if (nRot) {
							chartYPosA[i] = {
								a: this.indexA[i],
								y: (ptOff.x * Math.sin(nRot) + ptOff.y * Math.cos(nRot))
							};
						} else {
							chartYPosA[i] = {
								a: this.indexA[i],
								y: ptOff.y
							};
						}
					} else {
						chartYPosA[i] = {
							a: this.indexA[i],
							y: 0
						};
					}
				}
			} else {

				// sort by value 
				// -------------
				var nValue;
				if ((this.szSizeField || (this.szFlag.match(/AGGREGATE/) && this.szFlag.match(/SUM/)))) {
					for (var i = 0; i < this.indexA.length; i++) {
						nValue = this.itemA[this.indexA[i]].nSize;
						if (!isNaN(nValue)) {
							chartYPosA.push({
								a: this.indexA[i],
								y: nValue
							});
						}
					}
				} else
				if ((this.szSizeField || (this.szFlag.match(/AGGREGATE/) && this.szFlag.match(/MEAN/)))) {
					for (var i = 0; i < this.indexA.length; i++) {
						nValue = this.itemA[this.indexA[i]].nValuesA[this.nActualFrame || 0];
						if (!isNaN(nValue)) {
							chartYPosA.push({
								a: this.indexA[i],
								y: nValue
							});
						}
					}
				} else
				if (this.szFlag.match(/SIZE/)) {
					for (var i = 0; i < this.indexA.length; i++) {
						nValue = this.itemA[this.indexA[i]].nValueSum;
						if (!isNaN(nValue)) {
							chartYPosA.push({
								a: this.indexA[i],
								y: nValue
							});
						}
					}
				} else {
					for (var i = 0; i < this.indexA.length; i++) {
						nValue = this.itemA[this.indexA[i]].nValuesA[this.nActualFrame || 0];
						if (!isNaN(nValue)) {
							chartYPosA.push({
								a: this.indexA[i],
								y: nValue
							});
						}
					}
				}
			}

			_TRACE("sort ---> ");

			// sort charts
			// attention; up -> down because the last chart will be on top of the others
			if (this.szFlag.match(/\bSORT\b/) && this.szFlag.match(/\bUP\b/) && !(this.szFlag.match(/SEQUENCE/) || this.szFlag.match(/3D/))) {
				chartYPosA.sort(this.sortDownChartObjectsCompare);
			} else {
				chartYPosA.sort(this.sortUpChartObjectsCompare);
			}
			_TRACE("done");
			for (var i = 0; i < chartYPosA.length; i++) {
				this.indexA[i] = chartYPosA[i].a;
			}
			this.fSorted = true;
		}

		// skip first n charts if nToDraw > this.nMaxCharts 
		// ------------------------------------------------
		if (this.nMaxCharts && (nToDraw > this.nMaxCharts)) {
			this.fContinue = true;
			this.continueIndex = nToDraw - this.nMaxCharts;
			this.indexA.slice(nToDraw - this.nMaxCharts - 1, this.nMaxCharts);
			map.Themes.executeContinue();
			return;
		}

		// GR 18.12.2020 clear charts here!
		//
		if (!this.fDone) {
			this.unpaintMap();
		}

	}

	// ---------------------------------
	//
	// other stuff to do outside the loop
	//
	// ---------------------------------

	this.chart = {
		szColor: this.colorScheme[0],
		szLineColor: (this.colorScheme[1] ? this.colorScheme[1] : "none"),
		szTextColor: (this.colorScheme[1] ? this.colorScheme[1] : "none")
	};

	if (this.colorScheme.length > 2 || this.szFlag.match(/CATEGORICAL/)) {
		this.chart.szColor = this.colorScheme[this.colorScheme.length - 1];
		this.chart.szLineColor = this.colorScheme[0];
	}
	if (this.szFlag.match(/NOLINES/)) {
		this.chart.szLineColor = "none";
	} else
	if (this.chart.szLineColor == "none") {
		var cColor = __maptheme_getChartColors(szColor);
		this.chart.szLineColor = cColor.textColor;
	}

	// GR 21.07.2020 width of a PLOT
	this.nXLen = (this.nMaxA.length / (this.nGridX || 1)); 
	
	// GR 30.11.2016 calcolate scale to fit PLOT into grid
	// 
	if (this.szFlag.match(/PLOT/) && (this.szFlag.match(/GRIDSIZE/) || this.szFlag.match(/AUTOSIZE/))) {
		var nRadius = 0;
		var nDynScale = map.Layer.nDynamicObjectScale;
		var nAutoSize = this.szFlag.match(/GAP/) ? 1.2 : 1;
		if (this.nGridWidthPx) {
			nRadius = map.Scale.normalX(this.nGridWidthPx) / nAutoSize * this.nScale / nDynScale;
		} else {
			nRadius = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize * this.nScale / nDynScale) : map.Scale.normalX(nChartSize / 3);
		}
		this.nAutoScale = nRadius / map.Scale.normalX((nChartSize * ((this.itemA[a] ? this.itemA[a].nValuesA.length : 1) / (this.nGridX || 1))));
		this.nGridSize = nRadius;
	} else
		// GR 24.09.2018 calcolate scale to fit CHARTS into grid
		// 
		if (this.szFlag.match(/GRIDSIZE/)) {
			var nDynScale = map.Layer.nDynamicObjectScale;
			var nAutoSize = (this.szFlag.match(/\bRECT\b/) || !this.szFlag.match(/AGGREGATE/)) ? (this.szFlag.match(/GAP/) ? 1.15 : 1.0) : (this.szFlag.match(/GAP/) ? 0.8 : 0.75);
			if (this.nGridWidthPx) {
				this.nGridSize = map.Scale.normalX(this.nGridWidthPx) / nAutoSize / nDynScale;
			} else {
				this.nGridSize = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize / nDynScale) : map.Scale.normalX(nChartSize / 3);
			}
		}

	// GR 24.09.2018 calcolate PLOTXY grid values
	// 
	if (this.szFlag.match(/PLOTXY/)) {
		var nDynScale = map.Layer.nDynamicObjectScale;
		var nAutoSize = 1.15;
		if (this.nGridWidthPx) {
			this.nChartWidth = map.Scale.normalX(this.nGridWidthPx) / nAutoSize / this.nScale / nDynScale;
		} else {
			this.nChartWidth = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize / this.nScale / nDynScale) : map.Scale.normalX(nChartSize / 3);
		}
		this.nChartWidth -= map.Scale.normalX(this.nBoxMargin || 0) * 2;
		this.nChartHeight = this.nChartWidth - map.Scale.normalY(this.szFlag.match(/TITLE/) ? 10 : 0);

		this.nGridSize = this.nChartWidth;
		this.nAutoScale = 1;

		this.nRangeX = this.nMaxX - this.nMinX;
		this.nRangeY = this.nMaxY - this.nMinY;
	}


	// GR 10.08.2018 get out of loop
	if (fObjectScaling) {
		this.nChartGroupScale = (this.nAutoScale || this.nScale) * map.Layer.nObjectScale * map.Scale.nObjectScaling;
	} else {
		this.nChartGroupScale = (this.nAutoScale || this.nScale) * map.Scale.nFeatureScaling * map.Scale.nObjectScaling;
	}
	this.nChartGroupScaleX = this.nChartGroupScale;
	this.nChartGroupScaleY = this.nChartGroupScale / map.Zoom.nZoomY * map.Zoom.nZoomX;

	// GR 10.08.2018 get out of loop
	this.fGlowInScale = false;
	if ((!this.szGlowUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nGlowUpper)) &&
		(!this.szGlowLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale >= this.nGlowLower))) {
		this.fGlowInScale = true;
	}

	// GR 18.09.2018 get out of loop
	this.fDoRedraw = false;
	if ((this.indexA.length < 1000) || this.fRedraw || this.fRedrawAllCharts || ((this.szFlag.match(/BUFFER/)) && (this.szShapeType.match(/line/)))) {
		this.fDoRedraw = !this.fDone;
	}

	this.fHideValues = (this.szValueUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nValueUpper)) || 
					   (this.szValueLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale < this.nValueLower));

	// GR 19.94.2020 give user a chart draw init event
	//
	if (this.szFlag.match(/\bUSER\b/)) {
		try {
			var opt = {
				target: this.chartGroup,
				theme: this
			};
			
			if ( this.userDraw ){
				this.opt = opt;
				eval("HTMLWindow.ixmaps."+this.userDraw+"_init(SVGDocument,this.opt);");
				delete this.opt;
			}else{
				HTMLWindow.ixmaps.htmlgui_initChart(SVGDocument, opt);
			}
			
		} catch (e) {
			displayMessage("'"+(this.userDraw||"USER chart")+"' undefined!",5000);}
	}
	
	// GR 26.12.2020 define FEATURE style outside loop
	//
	if (this.szFlag.match(/FEATURE/)) {
		this.chartGroup.style.setProperty("fill", this.chart.szColor||"white");
		this.chartGroup.style.setProperty("fill-opacity",  (this.fillOpacity || 0.1));
		this.chartGroup.style.setProperty("stroke", this.szLineColor||"red");
		this.chartGroup.style.setProperty("stroke-width", map.Scale.normalX(this.nLineWidth||1)*this.nChartGroupScaleY / (fFeatureScalingDynamic? 1:map.Layer.nDynamicObjectScale));
		if (typeof (this.szBorderStyle) != 'undefined') {
			switch (this.szBorderStyle) {
				case "dotted":
					this.chartGroup.style.setProperty("stroke-dasharray", "0.1 0.2");
					break;
				case "dashed":
					this.chartGroup.style.setProperty("stroke-dasharray", "0.5 0.2");
					break;
			}
		}
		if (this.szFlag.match(/DASH/)) {
			this.chartGroup.style.setProperty("stroke-dasharray", "0.1 0.2");
		}
		this.chartGroup.style.setProperty("stroke-opacity", "1");
		this.chartGroup.style.setProperty("stroke-linecap", "butt");
		this.chartGroup.style.setProperty("stroke-linejoin", "round");
		
		if (this.szFlag.match(/SILENT/)) {
			this.chartGroup.style.setProperty("pointer-events", "none", "");
		}else{
			var szInfo = "";
			for ( var i=0; i<this.objTheme.dbFields.length-1; i++ ){
				szInfo += (i?"|":"")+this.objTheme.dbFields[i].id;
			}
			this.chartGroup.setAttributeNS(szMapNs,"info",szInfo);
		}
		
		// GR 28.10.2021 make shadow for the FEATURES
		if ((this.fShadow === true) && SVGDocument.getElementById(szShadowFilterShapeId)) {
			this.chartGroup.style.setProperty("filter", "url(#" + szShadowFilterShapeId + ")", "");
		} else
		if ((this.fShadow === true)) {
			_TRACE("create shadow filter for objects ! --------------------------------------");
			var filterNode = map.Dom.newNode('filter', this.chartGroup.parentNode);

			filterNode.setAttributeNS(null, "id", szShadowFilterShapeId);
			filterNode.setAttributeNS(null, "x", "-1");
			filterNode.setAttributeNS(null, "y", "-1");
			filterNode.setAttributeNS(null, "width", "2000%");
			filterNode.setAttributeNS(null, "height", "2000%");

			var filter = map.Dom.newNode('feGaussianBlur', filterNode);
			filter.setAttributeNS(null, "stdDeviation", "0.3");
			filter.setAttributeNS(null, "result", "BlurAlpha");

			filter = map.Dom.newNode('feOffset', filterNode);
			filter.setAttributeNS(null, "in", "BlurAlpha");
			filter.setAttributeNS(null, "dx", "0.2");
			filter.setAttributeNS(null, "dy", "0.5");
			filter.setAttributeNS(null, "result", "OffsetBlurAlpha");

			filter = map.Dom.newNode('feColorMatrix', filterNode);
			filter.setAttributeNS(null, "in", "OffsetBlurAlpha");
			filter.setAttributeNS(null, "type", "matrix");
			filter.setAttributeNS(null, "values", "0.1 0.1 0.1 0 0 0.1 0.1 0.1 0 0 0.1 0.1 0.1 0 0 0 0 0 1 0");
			filter.setAttributeNS(null, "result", "matrixOut");

			filter = map.Dom.newNode('feMerge', filterNode);
			var merge = map.Dom.newNode('feMergeNode', filter);
			merge.setAttributeNS(null, "in", "matrixOut");
			merge = map.Dom.newNode('feMergeNode', filter);
			merge.setAttributeNS(null, "in", "SourceGraphic");

			this.chartGroup.style.setProperty("filter", "url(#" + szShadowFilterShapeId + ")", "");
		}
	}
	
	// ---------------------------------
	//
	// lets do some charts
	//
	// ---------------------------------

	_TRACE("start drawing");

	var nRadius = map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / 2 * 20;
	nRadius = nRadius * map.Scale.nZoomScale * 20;
	
	for (var nAi = startIndex; nAi < this.indexA.length; nAi++) {

		// execution canceled ? -----------------
		if (this.fCancel) {
			displayMessage("Canceled by user", 1000, true);
			this.fCancel = false;
			return;
		}

		// sleep work around to show progress -----------------
		if (this.mapSleep) {
			this.mapSleep.nDoneCount = this.nDoneCount;
			if (this.mapSleep.checkSleep(nAi, 10)) {
				this.fContinue = true;
				this.continueIndex = nAi;

				// GR 11.06.2015 if filter defined, apply on new items
				if (this.szItemFilter && this.szItemFilter.length) {
					this.filterItems(this.szItemFilter, this.itemFilterOpt);
				}
				if (this.markedClass != null) {
					this.markClass(this.markedClass, 1);
				}

				return;
			}
		}

		var shapeGroup = null;
		var a = this.indexA[nAi];

		this.nDoneCount++;

		// if we don't have a value, don't draw
		if (!this.itemA[a] || !this.itemA[a].nValuesA || (this.itemA[a].nValuesA.length === 0)) {
			continue;
		}

		// ok we have a value

		var selectionId = this.itemA[a].szSelectionId;
		
		if (!this.szFlag.match(/FEATURE/)) {
			// check, if we have a position, if not -> no chart
			ptOff = this.itemA[a].ptPos || this.getNodePosition(selectionId);
			// tbd maybe a flag to switch this behaviour
			if (ptOff) {
				ptOff.x = isNaN(ptOff.x) ? 0 : ptOff.x;
				ptOff.y = isNaN(ptOff.y) ? 0 : ptOff.y;
			}
			if (!ptOff || isNaN(ptOff.x) || isNaN(ptOff.y)) {
				_TRACE("missing position: " + a);
				this.nMissingPositionCount++;
				continue;
			}
			// if .fRedraw get chart from DOM
			if (this.fRedraw) {
				this.itemA[a].chartNode = this.itemA[a].chartNode || SVGDocument.getElementById(this.szId + ":" + a + ":chart");
			}

			// if chart exists
			// ---------------
			if (this.itemA[a].chartNode && this.itemA[a].chartNode.parentNode) {
				// if fRedraw or other conditions, remove and redraw
				if (this.fDoRedraw) {
					this.itemA[a].chartNode.parentNode.removeChild(this.itemA[a].chartNode);
					this.itemA[a].chartNode = null;
				}
				// if not, quit
				else {
					this.nRealizedCount++;
					continue;
				}
			}
		}

		// ---------------
		// ok, here we go
		// ---------------

		var ptNull = new point(0, 0);

		// GR 28.02.2019 only position
		// GR 26.11.2020 added geojson features LineString, MultiLineString e Polygon 
		// ------------------------------------------------------------------------------
		if (this.szFlag.match(/FEATURE/)) {
			shapeGroup = map.Dom.newGroup(this.chartGroup, a);
			
			// -------------------------------
			// only position to define feature
 			// -------------------------------
			
			if (!this.objTheme.dbRecords[this.itemA[a].dbIndex][this.objTheme.nFieldSelectionIndex]){
				var ptOff = this.itemA[a].ptPos || this.getNodePosition(selectionId);
				if ( ptOff ){
					shapeGroup.fu.setMatrix([this.nChartGroupScaleX, 0, 0, this.nChartGroupScaleY, ptOff.x, ptOff.y]);
				}
				continue;
			}
			
			var szGeo = this.objTheme.dbRecords[this.itemA[a].dbIndex][this.objTheme.nFieldSelectionIndex];
			if (!szGeo.match(/coordinates/i)){
				var ptOff = this.itemA[a].ptPos || this.getNodePosition(selectionId);
				if ( ptOff ){
					shapeGroup.fu.setMatrix([this.nChartGroupScaleX, 0, 0, this.nChartGroupScaleY, ptOff.x, ptOff.y]);
				}
				continue;
			}
			
			// ------------------------------
			// geojson features 
			// ------------------------------
			
			var json = JSON.parse(this.objTheme.dbRecords[this.itemA[a].dbIndex][this.objTheme.nFieldSelectionIndex]);
			if (!json){
				continue;
			}
			if (this.szFlag.match(/SILENT/)) {
				shapeGroup.style.setProperty("pointer-events", "none", "");
			}else{
				var szInfo = "";
				var data = this.objTheme.dbRecords[this.itemA[a].dbIndex];
				for ( var i=0; i<data.length-1; i++ ){
					szInfo += (i?"|":"")+data[i];
				}
				shapeGroup.setAttributeNS(szMapNs,"info",szInfo);
				shapeGroup.setAttributeNS(szMapNs,"tooltip",a);
			}
			
			if ( this.szTimeField ){
				var uTime = new Date(this.itemA[a].szTime).getTime() || this.itemA[a].szTime;
				shapeGroup.setAttributeNS(szMapNs, "time", uTime);
			 }
		
			// if part of a theme, set the color
			// ----------------------------------
			if (this.szFlag.match(/CATEGORICAL/)) {
				this.chart.szColor = this.colorScheme[this.itemA[a].nValuesA[0] - 1];
			} else
			if (this.partsA.length > 1) {
				this.chart.szColor = this.szNoDataColor ? this.szNoDataColor : "white";
				for (i = 0; i < this.partsA.length; i++) {
					if ((this.itemA[a].nValuesA[0] >= this.partsA[i].min) && (this.itemA[a].nValuesA[0] < this.partsA[i].max)) {
						this.chart.szColor = this.colorScheme[i];
						this.itemA[a].nClass = i;
						this.partsA[i].nCount++;
					}
				}
			}
			shapeGroup.setAttributeNS(null,"style","stroke:"+this.chart.szColor);
			shapeGroup.setAttributeNS(szMapNs, "class", (typeof (this.itemA[a].nClass) != "undefined") ? this.itemA[a].nClass : String(this.itemA[a].nValuesA[0] - 1));
			
			// maximal length of map elements
			var maxLenX = (map.Scale.getMapPositionOfLatLon(80,180).x-map.Scale.getMapPositionOfLatLon(80,-180).x);
			
			// geojson Point
			// -------------		
			if ( json.type == "Point" ){
				
				map.Layer.listA[this.szThemesA[0]].szType = "point";
				var coordinatesA = json.coordinates;
				var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[1],coordinatesA[0]);
				shapeGroup.fu.setMatrix([this.nChartGroupScaleX, 0, 0, this.nChartGroupScaleY, pt.x, pt.y]);
				var shape = map.Dom.newShape('circle', shapeGroup, 0, 0, map.Scale.normalX(1),"fill:#dd0000;fill-opacity:0.3;stroke:#dd0000;stroke-opacity:1;stroke-width:1");
			}
			
			// geojson LineString
			// ------------------		
			if ( json.type == "LineString" ){
				
				this.chartGroup.style.setProperty("fill", "none");

				map.Layer.listA[this.szThemesA[0]].szType = "line";
				var coordinatesA = json.coordinates;
				var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[0][1],coordinatesA[0][0]);
				var d = "M "+pt.x+","+pt.y+" l ";
				var ptAct = new point(pt.x, pt.y);
				for (i in coordinatesA){
					var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[i][1],coordinatesA[i][0]);
					// polygon segments with x length >= 99% of max width 
					// are most probably caused by coordinate transition (-180 -> 178) or so
					// we treat them like coordinate overflow and add/subtract max width
					if ( Math.abs(pt.x-ptAct.x) > (maxLenX*0.99) ) {
						//pt.x += (pt.x<0)?maxLenX:-maxLenX;
						pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]+((pt.x<0)?360:-360));
					}
					d += (pt.x-ptAct.x) +','+ (pt.y-ptAct.y) +" ";
					ptAct = new point(pt.x, pt.y);
				}
				
				var shape = map.Dom.newShape('path', shapeGroup, d, "");
			}
			
			// geojson MultiLineString
			// -----------------------		
			if ( json.type == "MultiLineString" ){
				
				this.chartGroup.style.setProperty("fill", "none");

				map.Layer.listA[this.szThemesA[0]].szType = "line";
				var linesA = json.coordinates;
				for (i in linesA){
					var coordinatesA = linesA[i];
					var ptAct = null;
					
					var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[0][1],coordinatesA[0][0]);
					var d = "M "+(pt.x) +','+ (pt.y) +" l ";
					ptAct = new point(pt.x, pt.y);
					
					for (ii in coordinatesA){
						var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]);
						// polygon segments with x length >= 99% of max width 
						// are most probably caused by coordinate transition (-180 -> 178) or so
						// we treat them like coordinate overflow and add/subtract max width
						if ( Math.abs(pt.x-ptAct.x) > (maxLenX*0.99) ) {
							//pt.x += (pt.x<0)?maxLenX:-maxLenX;
							pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]+((pt.x<0)?360:-360));
						}
						d += (pt.x-ptAct.x) +','+ (pt.y-ptAct.y) +" ";
						ptAct = new point(pt.x, pt.y);
					}
					var shape = map.Dom.newShape('path', shapeGroup, d, "");
				}
			}

			// geojson Polygon
			// ---------------		
			if ( json.type == "Polygon" ){
				
				map.Layer.listA[this.szThemesA[0]].szType = "polygon";
				var linesA = json.coordinates;
				var d = "";
				var x = 0,
					y = 0,
					count = 0;
				for (i in linesA){
					var coordinatesA = linesA[i];
					var ptAct = null;
					
					var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[0][1],coordinatesA[0][0]);
					d += "M "+(pt.x) +','+ (pt.y) +" l ";
					ptAct = new point(pt.x, pt.y);
					
					for (ii in coordinatesA){
						var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]);
						// polygon segments with x length >= 99% of max width 
						// are most probably caused by coordinate transition (-180 -> 178) or so
						// we treat them like coordinate overflow and add/subtract max width
						if ( Math.abs(pt.x-ptAct.x) > (maxLenX*0.99) ) {
							//pt.x += (pt.x<0)?maxLenX:-maxLenX;
							pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]+((pt.x<0)?360:-360));
						}
						
						x += pt.x;
						y += pt.y;
						d += (pt.x-ptAct.x) +','+ (pt.y-ptAct.y) +" ";
						ptAct = new point(pt.x, pt.y);
					}
					d += " z";
					count += coordinatesA.length;
				}
				var shape = map.Dom.newShape('path', shapeGroup, d, "");
				shapeGroup.setAttributeNS(szMapNs,"center","x:"+x/count+",y:"+y/count);
				shapeGroup.setAttributeNS(szMapNs,"area",this.itemA[a].nSize);
				shapeGroup.setAttributeNS(null,"style","fill:"+this.chart.szColor+";fill-opacity:0.5");
			}

			// geojson MultiPolygon
			// --------------------		
			if ( json.type == "MultiPolygon" ){
				
				var x = [], y = [], count = [];
				
				map.Layer.listA[this.szThemesA[0]].szType = "polygon";
				var polygonA = json.coordinates;
				for (var p in polygonA){
					var linesA = polygonA[p];
					var d = "";
					
					x[p] = 0;
					y[p] = 0,
					count[p] = 0;
					
					for (i in linesA){
						var coordinatesA = linesA[i];
						var ptAct = null;
						
						var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[0][1],coordinatesA[0][0]);
						d += "M "+(pt.x) +','+ (pt.y) +" l ";
						ptAct = new point(pt.x, pt.y);

						for (ii in coordinatesA){
							var pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]);
							// polygon segments with x length >= 99% of max width 
							// are most probably caused by coordinate transition (-180 -> 178) or so
							// we treat them like coordinate overflow and add/subtract max width
							if ( Math.abs(pt.x-ptAct.x) > (maxLenX*0.99) ) {
								//pt.x += (pt.x<0)?maxLenX:-maxLenX;
								pt = map.Scale.getMapPositionOfLatLon(coordinatesA[ii][1],coordinatesA[ii][0]+((pt.x<0)?360:-360));
							}
							
							x[p] += pt.x;
							y[p] += pt.y;
							
							d += (pt.x-ptAct.x) +','+ (pt.y-ptAct.y) +" ";
							ptAct = new point(pt.x, pt.y);
						}
						d += " z";
						count[p] += coordinatesA.length;
					}
					var shape = map.Dom.newShape('path', shapeGroup, d, "");
				}
				
				// set center of biggest part
				var pp = 0;
				for ( p in count ){
					if ( count[p] > pp ){
						shapeGroup.setAttributeNS(szMapNs,"center","x:"+x[p]/count[p]+",y:"+y[p]/count[p]);
						shapeGroup.setAttributeNS(szMapNs,"area",this.itemA[a].nSize);
						pp = count[p];
					}
				}
				shapeGroup.setAttributeNS(null,"style","fill:"+this.chart.szColor+";fill-opacity:0.5");
			}

			continue;
			// ------------------------------------------------
		}

		// GR 10.08.2018 most simple rappresentation DOT
		// ------------------------------------------------
		if (this.szFlag.match(/DOT/)) {
			shapeGroup = map.Dom.newGroup(this.chartGroup, this.szId + ":" + selectionId + ":chartgroup");
			shapeGroup.fu.setMatrix([this.nChartGroupScaleX, 0, 0, this.nChartGroupScaleY, ptOff.x, ptOff.y]);
			if (this.szFlag.match(/CATEGORICAL/)) {
				this.chart.szColor = this.colorScheme[this.itemA[a].nValuesA[0] - 1];
			} else
			if (this.partsA.length > 1) {
				for (i = 0; i < this.partsA.length; i++) {
					if ((this.itemA[a].nValuesA[0] >= this.partsA[i].min) && (this.itemA[a].nValuesA[0] < this.partsA[i].max)) {
						this.chart.szColor = this.colorScheme[i];
					}
				}
			}
			this.itemA[a].chartNode = map.Dom.newShape('circle', shapeGroup, 0, 0, map.Scale.normalX(3), "fill:" + this.chart.szColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";stroke:none;");
			continue;
			// ------------------------------------------------
		}

		// GR 10.08.2018 most simple rappresentation QUAD
		// ------------------------------------------------
		if (this.szFlag.match(/\bQUAD\b/)) {
			shapeGroup = map.Dom.newGroup(this.chartGroup, this.szId + ":" + selectionId + ":chart");
			shapeGroup.fu.setMatrix([this.nChartGroupScaleX, 0, 0, this.nChartGroupScaleY, ptOff.x, ptOff.y]);
			if (this.szFlag.match(/CATEGORICAL/)) {
				this.chart.szColor = this.colorScheme[this.itemA[a].nValuesA[0] - 1];
			} else
			if (this.partsA.length > 1) {
				for (i = 0; i < this.partsA.length; i++) {
					if ((this.itemA[a].nValuesA[0] >= this.partsA[i].min) && (this.itemA[a].nValuesA[0] < this.partsA[i].max)) {
						this.chart.szColor = this.colorScheme[i];
					}
				}
			}
			this.itemA[a].chartNode = map.Dom.newShape('rect', shapeGroup, -nRadius, -nRadius, nRadius * 2, nRadius * 2, "fill:" + this.chart.szColor + ";stroke:none;");
			continue;
			// ------------------------------------------------
		}

		// GR 03.03.2019 bezier curve
		// ------------------------------------------------
		if (this.szFlag.match(/\bBEZIER\b/)) {

			if (this.nMinValue && (this.itemA[a].nSize < this.nMinValue)) {
				continue;
			}
			var p1 = this.itemA[a].ptPos;
			var p2 = this.itemA[a].ptPos2 || (this.szLabelA ? this.getNodePosition(this.szThemesA[0] + "::" + this.szLabelA[this.itemA[a].nValuesA[0] - 1]) : null);
			if (p1 && p2 && (p1 != p2)) {

				shapeGroup = this.itemA[a].chartNode = map.Dom.newGroup(this.chartGroup, this.szId + ":" + a + (a ? ":chartgroup" : ":ochrtgroup"));

				this.chart.szColor = this.szLineColor || this.itemA[a].szColor || this.colorScheme[this.itemA[a].nValuesA[0] - 1] || this.szNoDataColor;

				var nPow = 1 / (this.nSizePow || 1);

				var nLineWidth = this.nLineWidth ||
					(10 / Math.pow((this.nNormalSizeValue || this.nMaxSize), nPow) * Math.pow(Math.abs(this.itemA[a].nSize), nPow));

				var nGap = Number(this.nGapSize || 20);
				var ll = nLineWidth + (this.szFlag.match(/\bGAP\b/) ? nGap : 3);

				nLineWidth = map.Scale.normalX(nLineWidth) * this.nChartGroupScaleY * this.nScale;

				if (nLineWidth <= 0) {
					continue;
				}

				// negative value -> reverse start end of vector
				if (this.szFlag.match(/\bREVERSE\b/) || this.itemA[a].nSize < 0) {
					var tmp = p1;
					p1 = p2;
					p2 = tmp;
				}

				var len = Math.sqrt((p2.y - p1.y) * (p2.y - p1.y) + (p2.x - p1.x) * (p2.x - p1.x));
				var x = (p2.x - p1.x);
				var y = (p2.y - p1.y);
				var len = Math.sqrt(x * x + y * y);
                
				if ( len <= 0 ){
					continue;
				}
				
                var nBow = this.nRangeScale;
                if (this.szFlag.match(/\bRANDOM\b/)) {
                    nBow -= (this.nRangeScale * 0.66 * Math.random());
                }

				if (this.szFlag.match(/\bSHORT\b/)) {
					var dx = (y) / len * (nBow || 5) * 100 * this.nChartGroupScaleY;
					var dy = (x) / len * (nBow || 5) * 100 * this.nChartGroupScaleY;
				} else
				if (this.szFlag.match(/\bLONG\b/)) {
					var dx = (y) / 50000 * Math.max(len, 500) * (nBow || 5);
					var dy = (x) / 50000 * Math.max(len, 500) * (nBow || 5);
				} else {
					var dx = (y) / 50 * (nBow || 5);
					var dy = (x) / 50 * (nBow || 5);
				}

				if (this.szFlag.match(/\bPOINTER|ARROW\b/)) {
					x = x - (x / (len) * map.Scale.normalX(ll) * this.nChartGroupScaleY * this.nScale * (this.nMarkerSize || 1));
					y = y - (y / (len) * map.Scale.normalX(ll) * this.nChartGroupScaleY * this.nScale * (this.nMarkerSize || 1));
				}
				var x0 = 0;
				var y0 = 0;
				if (this.szFlag.match(/\bGAP\b/)) {
					x += dx / 500 * ll;
					y -= dy / 500 * ll;
					x0 = x / len * (nGap) * 20 * this.nChartGroupScaleY;
					y0 = y / len * (nGap) * 20 * this.nChartGroupScaleY;
				}
				var d = "M" + x0 + "," + y0 + " C" + (x / 4 + dx) + "," + (y / 4 - dy) + " " + (x / 2 + dx) + "," + (y / 2 - dy) + " " + (x) + "," + (y) + "";
				var shape = map.Dom.newShape('path', shapeGroup, d, "stroke-linecap:butt;fill:none;stroke:" + this.chart.szColor + ";stroke-width:" + nLineWidth + ";stroke-opacity:" + (this.fillOpacity || 0.3) + ";");

				if (this.szFlag.match(/DOPACITYMIN/)) {
					var nPow = 1 / (this.nDopacityPow || 1);
					var nOpacity = Math.pow((this.nMax - this.itemA[a].nSize), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
					shape.style.setProperty("stroke-opacity", String(nOpacity), "");
				} else
				if (this.szFlag.match(/DOPACITY/)) {
					var nPow = 1 / (this.nDopacityPow || 1);
					var nOpacity = Math.pow((this.itemA[a].nSize - this.nMin), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
					shape.style.setProperty("stroke-opacity", String(nOpacity), "");
				}
				
				// create dash and animation
				//
				if (this.szFlag.match(/\bDASH\b/)) {
					var d1 = 1000 * this.nChartGroupScaleY;
					var d2 = 100 * this.nChartGroupScaleY + nLineWidth;
					shape.style.setProperty("stroke-dasharray", String(d1) + " " + String(d2));
					shape.style.setProperty("stroke-dashoffset", "0");
					shape.style.setProperty("stroke-linecap", "round");
					var dashoff = Math.random() * d1;
					var from = dashoff + d1 + d2;
					var to = dashoff;
					var myAnimation = map.Dom.constructNode('animate', shape, {
						'attributeType': 'XML',
						'attributeName': 'stroke-dashoffset',
						'from': String(from),
						'to': String(to),
						'dur': '2s',
						'repeatCount': 'indefinite'
					});
				}

				// create vector with gradient stroke
				//
				if (this.szFlag.match(/\bGRADIENT\b|\bFADEIN\b/)) {
					var szColor2 = this.szLineColorA ? this.szLineColorA[0] : this.chart.szColor;
					var nFade = this.szFlag.match(/\bFADEIN\b/) ? 0.2 : 2;

					var gradientId = "Gradient" + Math.random();
					if (Math.abs(y) > Math.abs(x)) {
						var myGradient = map.Dom.constructNode('linearGradient', shapeGroup, {
							"id": gradientId,
							"x1": "0%",
							"y1": "0%",
							"x2": "0%",
							"y2": "100%"
						});
						map.Dom.constructNode('stop', myGradient, {
							"offset": "0",
							"stop-color": ((y < 0) ? this.chart.szColor : szColor2),
							"stop-opacity": ((y < 0) ? "2" : nFade)
						});
						map.Dom.constructNode('stop', myGradient, {
							"offset": "1",
							"stop-color": ((y < 0) ? szColor2 : this.chart.szColor),
							"stop-opacity": ((y < 0) ? nFade : "2")
						});
					} else {
						var myGradient = map.Dom.constructNode('linearGradient', shapeGroup, {
							"id": gradientId
						});
						map.Dom.constructNode('stop', myGradient, {
							"offset": "0",
							"stop-color": ((x < 0) ? this.chart.szColor : szColor2),
							"stop-opacity": ((x < 0) ? "2" : nFade)
						});
						map.Dom.constructNode('stop', myGradient, {
							"offset": "1",
							"stop-color": ((x < 0) ? szColor2 : this.chart.szColor),
							"stop-opacity": ((x < 0) ? nFade : "2")
						});
					}
					shape.style.setProperty("stroke", "");
					shape.style.setProperty("fill", "none");
					// GR 05.02.2019 browser Edge requires explizit stroke attribute for gradient 
					shape.setAttributeNS(null, "stroke", "url(#" + gradientId + ")");
				}

				// make arrow marker at vector end
				//
				if (this.szFlag.match(/\bPOINTER|ARROW\b/)) {
					var arrowId = "ArrowMarker" + Math.random();
					var tmpDefs = map.Dom.newNode('defs', shapeGroup);
					//var nP = Math.min(4,(len/nLineWidth*0.1));
					//var nP = Math.min(5,(50/(Math.sqrt(nLineWidth/map.Scale.nZoomScale))));
					var nP = Math.min(5, 2.5 + (100 / ((nLineWidth / this.nChartGroupScale)))) * (this.nMarkerSize || 1);
					//var nP = Math.min(7,Math.max(2.5,10/Math.sqrt(nLineWidth)));
					var myMarker = map.Dom.constructNode('marker', tmpDefs, {
						"id": arrowId,
						"markerWidth": nP,
						"markerHeight": nP,
						"refX": nP / 1.7,
						"refY": nP / 2,
						"orient": "auto",
						"markerUnits": "strokeWidth"
					});
					var myShape = map.Dom.constructNode('path', myMarker, {
						"d": "M0," + nP + " L" + nP + "," + nP / 2 + " L0,0 Z",
						"style": "fill:" + this.chart.szColor + ";opacity:" + ((this.fillOpacity || 0.3) * 2) + ";stroke:none;stroke-width:0.03"
					});
					if (1 || (len > nLineWidth * 3)) {
						shape.setAttributeNS(null, "marker-end", "url(#" + arrowId + ")");
					}
					if (this.szFlag.match(/DOPACITYMIN/)) {
						var nPow = 1 / (this.nDopacityPow || 1);
						var nOpacity = Math.pow((this.nMax - this.itemA[a].nSize), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
						myShape.style.setProperty("opacity", String(nOpacity), "");
					} else
					if (this.szFlag.match(/DOPACITY/)) {
						var nPow = 1 / (this.nDopacityPow || 1);
						var nOpacity = Math.pow((this.itemA[a].nSize - this.nMin), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
						myShape.style.setProperty("opacity", String(nOpacity), "");
					}
				}
				// text on path
				if (this.szFlag.match(/\bVALUES\b/) && !this.fHideValues) { 
					var pathId = "VectorPath" + Math.random();
					if ( x < 0 ){
						var d = "M" + x + "," + y + " C" + (x / 2 + dx) + "," + (y / 2 - dy) + " " + (x / 4 + dx) + "," + (y / 4 - dy) + " " + (x0) + "," + (y0) + "";
						var tshape = map.Dom.newShape('path', shapeGroup, d, "fill:none;stroke:none");
						tshape.setAttributeNS(null, "id", pathId);	
					}else{
						shape.setAttributeNS(null, "id", pathId);	
					}
					//var tPath = map.Dom.newTextOnPath(shapeGroup,pathId,this.itemA[a].nSize,"font-family:arial;font-size:"+(Math.sqrt(this.itemA[a].nSize)*0.002)+"px;fill:#888888;baseline-shift:-25%","40%");
					var nFontSize = Math.min(len,(Math.sqrt(this.itemA[a].nSize)/(Math.sqrt(this.nNormalSizeValue || this.nMaxSize) )) * this.nValueScale );
					nFontSize = 24 * map.Scale.normalX(nFontSize) * this.nChartGroupScaleY * this.nScale;
					var szText = (this.formatValue(this.itemA[a].nSize, this.nValueDecimals || (this.itemA[a].nSize < 1 ? 2 : 0), "ROUND") + this.szUnit);
					var tPath = map.Dom.newTextOnPath(shapeGroup,pathId,szText,"font-family:arial;font-size:"+nFontSize+"px;fill:"+this.chart.szColor+";stroke:#ffffff;stroke-width:"+(nLineWidth/10)+"px;baseline-shift:-35%","40%");
				}
				
				shapeGroup.setAttributeNS(szMapNs, "class", (typeof (this.itemA[a].nClass) != "undefined") ? this.itemA[a].nClass : String(this.itemA[a].nValuesA[0] - 1));
				shapeGroup.setAttributeNS(szMapNs, "tooltip", this.formatValue(this.itemA[a].nSize, this.nValueDecimals || (this.itemA[a].nSize < 1 ? 2 : 0), "ROUND") + this.szUnit);

                // make time stamp
                // -----------------
                if ( this.szTimeField ){
                    var uTime = new Date(this.itemA[a].szTime).getTime() || this.itemA[a].szTime;
                    shapeGroup.setAttributeNS(szMapNs, "time", uTime);
                 }

                shapeGroup.fu.setMatrix([1, 0, 0, 1, p1.x, p1.y]);
			}
			continue;
			// ------------------------------------------------
		}
		// GR 03.03.2019 vector
		// ------------------------------------------------
		if (this.szFlag.match(/\bVECTOR\b/)) {

			if (this.nMinValue && (this.itemA[a].nSize < this.nMinValue)) {
				continue;
			}
			var p1 = this.itemA[a].ptPos;
			var p2 = this.itemA[a].ptPos2 || (this.szLabelA ? this.getNodePosition(this.szThemesA[0] + "::" + this.szLabelA[this.itemA[a].nValuesA[0] - 1]) : null);
			if (p1 && p2) {

				shapeGroup = this.itemA[a].chartNode = map.Dom.newGroup(this.chartGroup, this.szId + ":" + a + (a ? ":chartgroup" : ":ochrtgroup"));
				//shapeGroup = this.itemA[a].chartNode = map.Dom.newGroup(this.chartGroup, this.szId + ":" + selectionId + ":chartgroup");

				this.chart.szColor = this.szLineColor || this.colorScheme[this.itemA[a].nValuesA[0] - 1];
				var nLineWidth = this.nLineWidth || (2 / (this.nNormalSizeValue || 1) / this.nMaxSize * this.itemA[a].nSize);
				var shape = map.Dom.newShape('line', shapeGroup, 0, 0, (p2.x - p1.x), (p2.y - p1.y), "stroke:" + this.chart.szColor + ";stroke-width:" + map.Scale.normalX((nLineWidth || 0.1) * this.nChartGroupScaleY) + ";stroke-opacity:" + (this.fillOpacity || 0.3) + ";");

				if (this.szFlag.match(/\bDASH\b/)) {
					var d1 = 1000 * this.nChartGroupScaleY;
					var d2 = 300 * this.nChartGroupScaleY;
					shape.style.setProperty("stroke-dasharray", String(d1) + " " + String(d2));
					shape.style.setProperty("stroke-dashoffset", "0");
					var dashoff = Math.random() * d1;
					var from = dashoff + d1 + d2;
					var to = dashoff;
					var myAnimation = map.Dom.constructNode('animate', shape, {
						'attributeType': 'XML',
						'attributeName': 'stroke-dashoffset',
						'from': String(from),
						'to': String(to),
						'dur': '1s',
						'repeatCount': 'indefinite'
					});
				}

				if (this.szFlag.match(/\bPOINTER|ARROW\b/)) {
					var tmpDefs = map.Dom.newNode('defs', shapeGroup);
					var myMarker = map.Dom.constructNode('marker', tmpDefs, {
						"id": this.szId + ":" + selectionId + ":chartgroup" + ":ArrowMarker",
						"markerWidth": "4",
						"markerHeight": "4",
						"refX": "4",
						"refY": "2",
						"orient": "auto",
						"markerUnits": "strokeWidth"
					});
					var myShape = map.Dom.constructNode('path', myMarker, {
						"d": "M0,4 L4,2 L0,0 Z",
						"style": "fill:" + this.chart.szColor + ";opacity:" + ((this.fillOpacity || 0.3) * 2) + ";stroke:white;stroke-width:0.1"
					});
					shape.setAttributeNS(null, "marker-end", "url(#" + this.szId + ":" + selectionId + ":chartgroup" + ":ArrowMarker)");
				}

				shapeGroup.setAttributeNS(szMapNs, "class", (typeof (this.itemA[a].nClass) != "undefined") ? this.itemA[a].nClass : String(this.itemA[a].nValuesA[0] - 1));
				shapeGroup.setAttributeNS(szMapNs, "tooltip", this.formatValue(this.itemA[a].nSize, this.nValueDecimals || (this.itemA[a].nSize < 1 ? 2 : 0), "ROUND") + this.szUnit);

				shapeGroup.fu.setMatrix([1, 0, 0, 1, p1.x, p1.y]);
			}
			continue;
			// ------------------------------------------------
		}

		// GR 11.04.2014 get multiple charts into one group
		// ------------------------------------------------
		shapeGroup = null;
		if (selectionId) {
			shapeGroup = SVGDocument.getElementById(this.szId + ":" + selectionId + ":chart");
			if (shapeGroup) {
				shapeGroup.fu = new Methods(shapeGroup);
			} else {
				shapeGroup = map.Dom.newGroup(this.chartGroup, this.szId + ":" + selectionId + ":chart");

				if (this.szFlag.match(/BOX/)) {

					var szLineColor = "#bbbbbb";
					if (typeof (this.szBorderColor) != 'undefined') {
						szLineColor = this.szBorderColor;
					}
					var szLineStyle = "stroke-width:" + map.Scale.normalX(0.5) + ";stroke-opacity:0.3;";
					if (typeof (this.szBorderStyle) != 'undefined') {
						switch (this.szBorderStyle) {
							case "dotted":
								szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:round;stroke-dasharray:1,50;";
								break;
							case "dashed":
								szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:butt;stroke-dasharray:30,30;";
								break;
							case "solid":
								szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";";
								break;
							case "none":
								szLineStyle = "stroke-width:0;";
								break;
						}
					}
					if (typeof (this.szBorderWidth) != 'undefined') {
						switch (this.szBorderWidth) {
							case "thin":
								szLineStyle += "stroke-width:" + map.Scale.normalX(0.3) + ";";
								break;
							case "thick":
								szLineStyle += "stroke-width:" + map.Scale.normalX(1.5) + ";";
								break;
						}
					}
					var newBox = map.Dom.newShape('rect', shapeGroup, 0, 0, 1, 1, "fill:" + (this.szBoxColor || "white") + ";fill-opacity:" + (this.nBoxOpacity || 1) + ";stroke:" + szLineColor + ";" + szLineStyle);
					newBox.setAttributeNS(null, "id", this.szId + ":" + selectionId + ":chart:box");
					switch (this.szSymbolBoxStyle) {
						case "frame":
							this.boxShape.setAttributeNS(null, "fill-opacity", 0);
							break;
						case "field":
							this.boxShape.setAttributeNS(null, "fill-opacity", 1);
							break;
					}
				}
			}
		}
		// ------------------------------------------------
		
		// add to existing any theme item hosting group
		/**
		for ( t in map.Themes.themesA ){
			if  ( map.Themes.themesA[t].itemA[a] && map.Themes.themesA[t].itemA[a].chartNode ){
				map.Themes.themesA[t].itemA[a].chartNode.parentNode.insertBefore(shapeGroup,map.Themes.themesA[t].itemA[a].chartNode);				
			}
		}
		**/ 
		
		this.itemA[a].chartNode = shapeGroup;

		// store value
		shapeGroup.setAttributeNS(szMapNs, "value", String(this.itemA[a].nValuesA[0]));

		// ------------------------------------------------
		// ===== here we do the chart ===================== 
		// ------------------------------------------------
		
		ptNull = this.drawChart(shapeGroup, a, nChartSize, this.szFlag + "|SILENT");

		// ------------------------------------------------
		//
		// ------------------------------------------------

		// position and scale the chart
		// -----------------------------

		// may bee we have an autoscale configurated, use it
		var __scale = this.nScale;
		this.nScale = this.nAutoScale || this.nScale;
		
		var nAutoScale = 1;
		if ( (this.nMaxValue == "auto") ){
			nAutoScale = 1 / Math.pow(this.nMax,1/3) *  Math.pow(this.nMaxValuePlot,1/3);
			// GR 30.07.2021
			// auto -> nAutoScale = individual plot sizes
			// so, if we have another curve for the same map id (a), 
			// me must know the size of the existing plot to fit the new one in
			// map.Themes.autoScale holds a plot scale for every map chart position (a)
			if (!map.Themes.autoScale){
				this.fAutoScaleLeader = true;
				map.Themes.autoScale = [];
			}
			nAutoScale = map.Themes.autoScale[a] = map.Themes.autoScale[a] || nAutoScale;
		}

		if (ptNull && ptOff && shapeGroup) {

			// GR 05.03.2017 place plots to the center of the plot box
			if (this.szFlag.match(/PLOT/) && this.nGridSize && this.nAutoScale) {
				ptNull.x += this.nGridSize / 2 / this.nAutoScale * nAutoScale;
				ptNull.y -= this.nGridSize / 2 / this.nAutoScale * nAutoScale;
			}
			if (this.szFlag.match(/NOSCALE/)) {
				shapeGroup.fu.setMatrix([this.nScale, 0, 0, this.nScale, ptOff.x - (ptNull.x * this.nScale), ptOff.y - (ptNull.y * this.nScale)]);
			} else {
				shapeGroup.fu.setMatrix([this.nChartGroupScaleX*nAutoScale, 0, 0, this.nChartGroupScaleY*nAutoScale, ptOff.x - (ptNull.x) * map.Layer.nObjectScale * this.nScale, ptOff.y - (ptNull.y) * map.Layer.nObjectScale * this.nScale]);
			}
			
			if ( this.itemA[a].ptPos && this.itemA[a].ptPos2 ) {
				shapeGroup.setAttributeNS(szMapNs, "xEnd", this.itemA[a].ptPos2.x);
				shapeGroup.setAttributeNS(szMapNs, "yEnd", this.itemA[a].ptPos2.y);
				shapeGroup.setAttributeNS(szMapNs, "dur", 10);
			}

		}
		this.nScale = __scale;

		if (ptNull) {
			selectionId = selectionId.split('*')[0];

			// GR 19.04.2011 calcolate char offset for multi charts at one position
			// GR 22.01.2014 new flag 'MULTIPLE' to do it only if wanted (.getBox() is time intensive!)

			if ((this.szFlag.match(/MULTIPLE/) || this.szFlag.match(/ALIGN/)) && shapeGroup.lastChild.firstChild) {
				var bBox = map.Dom.getBox(shapeGroup.lastChild);
				var offset = this.szFlag.match(/\bUP\b/) ? (bBox.height) : (bBox.width);
				if (this.chartPosA[selectionId]) {
					this.chartPosA[selectionId] += this.szFlag.match(/TEXTONLY/) ? 5 : offset * 0.5;
					var ptChart = shapeGroup.lastChild.fu.getPosition();
					var line = offset * (this.nGridX || 10);
					if (this.szFlag.match(/\bUP\b/)) {
						shapeGroup.lastChild.fu.setPosition(ptChart.x + bBox.width * Math.floor(this.chartPosA[selectionId] / line), ptChart.y - bBox.y - bBox.height / 2 - this.chartPosA[selectionId] % line);
					} else {
						shapeGroup.lastChild.fu.setPosition(ptChart.x + this.chartPosA[selectionId] % line, ptChart.y - bBox.height * Math.floor(this.chartPosA[selectionId] / line));
					}
					this.chartPosA[selectionId] += this.szFlag.match(/TEXTONLY/) ? offset : offset * 0.5;
				} else {
					this.chartPosA[selectionId] = this.szFlag.match(/TEXTONLY/) ? offset : -bBox.y;
				}
				// GR 19.04.2011 prepare reverse identification of multi charts at one position
				if (this.posItemA) {
					if (!this.posItemA[selectionId]) {
						this.posItemA[selectionId] = [];
					}
					this.posItemA[selectionId].push(this.itemA[a]);
				}
			} else
			if ((this.szFlag.match(/MULTIFIX/) || this.szFlag.match(/MULTIGRID/)) && shapeGroup.lastChild) {
				var offset = 1;
				var dX = map.Scale.normalX(this.nChartSizeDone * (this.nRangeScale || 1));
				var dY = map.Scale.normalX(this.nChartSizeDone * (this.nRangeScale || 1));

				// GR 13.06.2017 check also selectionIds like names and see if they have the same position
				if ((ptOff = this.getNodePosition(selectionId))) {
					selectionId = String(ptOff.x) + String(ptOff.y);

					if (this.chartPosA[selectionId]) {
						var ptChart = shapeGroup.lastChild.fu.getPosition();
						var actOffset = this.chartPosA[selectionId];
						var line = this.nGridX || 7;
						if (this.szFlag.match(/\bUP\b/)) {
							shapeGroup.lastChild.fu.setPosition(ptChart.x + dX * Math.floor(actOffset / line), ptChart.y - dY * (actOffset % line));
						} else {
							shapeGroup.lastChild.fu.setPosition(ptChart.x + dX * (actOffset % line), ptChart.y - dY * Math.floor(actOffset / line));
						}
						this.chartPosA[selectionId] += offset;
					} else {
						this.chartPosA[selectionId] = offset;
					}
					// GR 19.04.2011 prepare reverse identification of multi charts at one position
					if (this.posItemA) {
						if (!this.posItemA[selectionId]) {
							this.posItemA[selectionId] = [];
						}
						this.posItemA[selectionId].push(this.itemA[a]);
					}
					// GR 20.12.2016 only display last label of row
					if (this.itemA[a].labelGroup && (actOffset % line != line - 1)) {
						this.itemA[a].labelGroup.style.setProperty("display", "none", "");
					}
				}
			} else
			if ((this.szFlag.match(/MULTISQUARE/) || this.szFlag.match(/MULTIQUAD/)) && shapeGroup.lastChild) {
				var offset = 1;
				var dX = map.Scale.normalX(this.nChartSizeDone * (this.nRangeScale || 1));
				var dY = map.Scale.normalX(this.nChartSizeDone * (this.nRangeScale || 1));
				
				// GR 13.06.2017 check also selectionIds like names and see if they have the same position
				if ((ptOff = this.getNodePosition(selectionId))) {
					selectionId = String(ptOff.x) + String(ptOff.y);

					if (this.chartPosA[selectionId]) {
						var ptChart = shapeGroup.lastChild.fu.getPosition();
						var actOffset = this.chartPosA[selectionId];
						var square = Math.floor(Math.sqrt(actOffset));
						if (square < (this.nGridX || 10000000)) {
							var line = actOffset - (square * square);
							var x = (line <= square) ? line : square;
							var y = (line <= square) ? square : (square - (line - square));
							shapeGroup.lastChild.fu.setPosition(ptChart.x + x * dX, ptChart.y - y * dY);
							this.chartPosA[selectionId] += offset;
						} else {
							var ptChart = shapeGroup.lastChild.fu.getPosition();
							var actOffset = this.chartPosA[selectionId];
							var line = this.nGridX || 7;
							if (this.szFlag.match(/\bUP\b/)) {
								shapeGroup.lastChild.fu.setPosition(ptChart.x + dX * Math.floor(actOffset / line), ptChart.y - dY * (actOffset % line));
							} else {
								shapeGroup.lastChild.fu.setPosition(ptChart.x + dX * (actOffset % line), ptChart.y - dY * Math.floor(actOffset / line));
							}
							this.chartPosA[selectionId] += offset;
						}
					} else {
						this.chartPosA[selectionId] = offset;
					}
					// GR 19.04.2011 prepare reverse identification of multi charts at one position
					if (this.posItemA) {
						if (!this.posItemA[selectionId]) {
							this.posItemA[selectionId] = [];
						}
						this.posItemA[selectionId].push(this.itemA[a]);
					}
					// GR 20.12.2016 only display last label of row
					if (this.itemA[a].labelGroup && (actOffset % line != line - 1)) {
						this.itemA[a].labelGroup.style.setProperty("display", "none", "");
					}
				}
			}
			if (this.szFlag.match(/TEXTONLY/) && fCheckLabelOverlap) {
				var text = SVGDocument.getElementById(this.szId + ":" + a + ":text");
				if (text) {
					var cItem = new Map.Label.Item(text);
					// GR 23.06.2016 better not to clear chart label to avoid flicker
					//cItem.setDisplay("none");
				}
			}

			// GR 14.11.2007 compense canvas rotation 
			if (nRot) {
				setRotate(shapeGroup, -Number(nRot));
			}

			// GR 30.06.2007 make shadow for the objects
			if ((this.fShadow === true) && SVGDocument.getElementById(szShadowFilterId)) {
				shapeGroup.style.setProperty("filter", "url(#" + szShadowFilterId + ")", "");
			} else
			if ((this.fShadow === true)) {
				_TRACE("create shadow filter for objects ! --------------------------------------");
				var filterNode = map.Dom.newNode('filter', this.chartGroup.parentNode);

				filterNode.setAttributeNS(null, "id", szShadowFilterId);
				filterNode.setAttributeNS(null, "filterUnits", "objectBoundingBox");
				filterNode.setAttributeNS(null, "x", "-50%");
				filterNode.setAttributeNS(null, "y", "-50%");
				filterNode.setAttributeNS(null, "width", "200%");
				filterNode.setAttributeNS(null, "height", "200%");

				var filter = map.Dom.newNode('feGaussianBlur', filterNode);
				filter.setAttributeNS(null, "stdDeviation", "10");
				filter.setAttributeNS(null, "result", "BlurAlpha");

				filter = map.Dom.newNode('feOffset', filterNode);
				filter.setAttributeNS(null, "in", "BlurAlpha");
				filter.setAttributeNS(null, "dx", "10");
				filter.setAttributeNS(null, "dy", "10");
				filter.setAttributeNS(null, "result", "OffsetBlurAlpha");

				filter = map.Dom.newNode('feColorMatrix', filterNode);
				filter.setAttributeNS(null, "in", "OffsetBlurAlpha");
				filter.setAttributeNS(null, "type", "matrix");
				filter.setAttributeNS(null, "values", "0.1 0.1 0.1 0 0 0.1 0.1 0.1 0 0 0.1 0.1 0.1 0 0 0 0 0 1 0");
				filter.setAttributeNS(null, "result", "matrixOut");

				filter = map.Dom.newNode('feMerge', filterNode);
				var merge = map.Dom.newNode('feMergeNode', filter);
				merge.setAttributeNS(null, "in", "matrixOut");
				merge = map.Dom.newNode('feMergeNode', filter);
				merge.setAttributeNS(null, "in", "SourceGraphic");

				//GR 09.09.2014 now here, to avoid zero shadows, causing error of Chrome version 37.0.2062.103 m
				var bBox = map.Dom.getBox(shapeGroup.lastChild);
				if (bBox.width && bBox.height) {
					shapeGroup.style.setProperty("filter", "url(#" + szShadowFilterId + ")", "");
				}
			}
		}
	}

	// if BOX flag set, resize chart boxes
	// must be done here after all draw, because of MULTIPLE or MULTIGRID

	if (this.szFlag.match(/BOX/)) {

		if (this.nBoxUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nBoxUpper)) {
			var boxGroup = SVGDocument.getElementById(this.szId + ":" + p + ":chart:box");
			if (boxGroup) {
				boxGroup.parentNode.removeChild(boxGroup);
			}
		} else
			for (var nAi = 0; nAi < this.indexA.length; nAi++) {
				var a = this.indexA[nAi];
				if (this.itemA[a].fDone) {

					// for all charts done
					//
					var p = this.itemA[a].szSelectionId;
					var shapeGroup = SVGDocument.getElementById(this.szId + ":" + p + ":chart");
					var chartGroup = SVGDocument.getElementById(this.szId + ":" + p + ":chartgroup");
					var boxGroup = SVGDocument.getElementById(this.szId + ":" + p + ":chart:box");

					// if box exists and not yet sized
					//
					if (shapeGroup && boxGroup && !boxGroup.getAttributeNS(szMapNs, "boxed")) {

						// get the size of the chart
						//

						// GR 29.10.2019 hide chart and only size by grid (because chart may be clipped but this not reflects in box)
						if (this.szFlag.match(/\bPLOT\b/) && chartGroup) {
							chartGroup.style.setProperty("display", "none");
						}

						var bBox = map.Dom.getBox(shapeGroup);

						var margin = map.Scale.normalX(this.nBoxMargin || 2);
						margin = Math.min(margin * 2, margin * (bBox.width / map.Scale.normalX(nChartSize)));

						// make box title above the chart, if defined
						// 
						if (this.szFlag.match(/TITLE/) && this.szTitleField && (!this.nTitleUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nTitleUpper))) {

							var nFontSize = map.Scale.normalX(5);
							if (this.szFlag.match(/DTEXT/)) {
								nFontSize = Math.max(map.Scale.normalX(0.9), Math.min(bBox.width / 5, map.Scale.normalX(14 / this.nScale)));
							}
							if (this.szFlag.match(/GRIDSIZE/)) {
								nFontSize = Math.max(bBox.width / 10, map.Scale.normalX(6));
							}
							nFontSize *= this.nTextScale||this.nValueScale||1;
							var szTitle = this.itemA[a].szTitle;
							try {
								var szTitle = HTMLWindow.ixmaps.htmlgui_onInfoTitle(this.itemA[a].szTitle, this.itemA[a]);
							} catch (e) {}
							var textColor = this.szTextColor || "#888888";
							var posY = this.szFlag.match(/BOTTOMTITLE/) ? bBox.y + bBox.height + nFontSize * 1 : (bBox.y - nFontSize * 0.7);
							
							// GR 12.04.2022 new to get box around multiple bar charts
							if (this.szFlag.match(/BAR/) && !this.szFlag.match(/BOTTOMTITLE/)){
								posY = this.nMaxValue?-this.nMaxValue*nChartSize/this.nScale:posY;
							}
							
							if ( this.szAlign && this.szAlign.match(/right/) ){
								var newText = map.Dom.newText(shapeGroup, bBox.x+bBox.width, posY, "font-family:arial;font-size:" + nFontSize + "px;text-anchor:end;fill:" + textColor + ";stroke:none;pointer-events:none;", String(szTitle || " "));
							}else{
								var newText = map.Dom.newText(shapeGroup, bBox.x, posY, "font-family:arial;font-size:" + nFontSize + "px;text-anchor:start;fill:" + textColor + ";stroke:none;pointer-events:none;", String(szTitle || " "));
							}

							// make multi line text if necessary and possible
							var nRows = map.Dom.wrapText(newText, bBox.width);
							if ( !this.szFlag.match(/BOTTOMTITLE/) ){
								newText.fu.setPosition(newText.fu.getPosition().x, newText.fu.getPosition().y - (nFontSize * 1 * (nRows - 1)));
							}
							if (!this.szFlag.match(/CLIPPEDTITLE/)) {
								// enlarge the box to include all of the title
								bBox = map.Dom.getBox(shapeGroup);
								bBox.y += nFontSize * 0.1;
								bBox.height -= nFontSize * 0.1;
							} else {
								// or clip the title to the box
								var oldHeight = bBox.height;
								bBox.height += nFontSize * 1.8;
								bBox.y -= bBox.height - oldHeight;
								map.Dom.setClipRect(newText, new box(bBox.x, bBox.y - nFontSize * 10, bBox.width - nFontSize / 3, nFontSize * 20));
							}
							
							if ( this.szTimeField ){
								var uTime = new Date(this.itemA[a].szTime).getTime() || this.itemA[a].szTime;
								newText.setAttributeNS(szMapNs, "time", uTime);
							 }

						}

						// PLOTX or PLOTY must be sized by the biggest value, to make equal large boxes
						//
						if (this.szFlag.match(/\bPLOTX\b/)) {
							var oldHeight = bBox.height;
							bBox.height = map.Scale.normalX(nChartSize);
							bBox.y = -map.Scale.normalX(nChartSize / 2);
							bBox.width = this.nMax * map.Scale.normalX(nChartSize * 1.1) / this.nMax * 5 * (this.nRangeScale || 1);
						} else
						if (this.szFlag.match(/\bPLOTY\b/)) {
							var oldHeight = bBox.height;
							var oldWidth = bBox.width;
							bBox.width = map.Scale.normalX(nChartSize);
							bBox.height = this.nMax * map.Scale.normalX(nChartSize * 1.1) / this.nMax * 5 * (this.nRangeScale || 1);
							bBox.x -= (bBox.width - oldWidth) / 2;
							bBox.y -= (bBox.height - oldHeight) / 2;
						}

						// margins around the chart
						//
						var _width  = bBox.width  + margin * 2;
						var _height = bBox.height + margin * 2;
						if ( (_width>=0) && (_height>=0) ){
							boxGroup.setAttributeNS(null, "x", bBox.x - margin);
							boxGroup.setAttributeNS(null, "y", bBox.y - margin);
							boxGroup.setAttributeNS(null, "width", bBox.width + margin * 2);
							boxGroup.setAttributeNS(null, "height", bBox.height + margin * 2);
						}

						// if AUITOSIZE or GRIDSIZE make rectangular boxes
						//
						if ((this.szFlag.match(/AUTOSIZE/) || this.szFlag.match(/GRIDSIZE/)) && (bBox.width > bBox.height)) {
							boxGroup.setAttributeNS(null, "y", bBox.y - margin - (bBox.width - bBox.height));
							boxGroup.setAttributeNS(null, "height", bBox.width + margin * 2);
						}

						// make round corners
						//
						if ((typeof (this.nBorderRadius) != 'undefined') && !isNaN(this.nBorderRadius)) {
							var nCorner = Math.min(map.Scale.normalX(this.nBorderRadius), map.Scale.normalX(this.nBorderRadius * (bBox.width / map.Scale.normalX(nChartSize))));
							boxGroup.setAttributeNS(null, 'rx', nCorner);
							boxGroup.setAttributeNS(null, 'ry', nCorner);
						}
						var nStroke = map.Scale.normalX((this.szBorderWidth || 1) * 0.2 * (bBox.width / map.Scale.normalX(nChartSize)));
						boxGroup.style.setProperty("stroke-width", nStroke);

						boxGroup.setAttributeNS(szMapNs, "boxed", "1");

						// GR 29.10.2019 make chart visible
						if (this.szFlag.match(/\bPLOT\b/) && chartGroup) {
							chartGroup.style.setProperty("display", "inline");
						}
						
						// make time stamp
						// -----------------
						if ( this.szTimeField ){
							console.log("---------!");
							console.log("timestamp!");
							var uTime = new Date(this.itemA[a].szTime).getTime() || this.itemA[a].szTime;
							boxGroup.setAttributeNS(szMapNs, "time", uTime);
						 }
						
						
					}
				}
			}
	}

	_TRACE("== drawing done === ");

	// GR 08.09.2022 add new FEATURE elements to nodes cache (and evtl. override old ones)
	if (this.szFlag.match(/FEATURE/)) {
		map.Themes.addToThemeNodesCache(this.chartGroup);
	}

	// GR 11.06.2015 if filter defined, apply on new items
	if (this.szItemFilter && this.szItemFilter.length) {
		this.filterItems(this.szItemFilter, this.itemFilterOpt);
	}
	if (this.markedClass != null) {
		this.markClass(this.markedClass, 1);
	}

	this.isVisible = true;
	this.realizeDone();
	
	this.fShowProgressBar = false;
	// force hiding the progressbar 
	displayProgressBar(1,1,"",1,"",1);
	
	this.showInfo();

	if ((this.szFlag.match(/SHOWSTATISTIC/))) {
		this.showErrorInfo();
	}

	if (this.szFlag.match(/\bCLIP\b/)) {
		if ((this.nClipFrames == this.itemA[a].nValuesA.length)) {
			if (this.szXaxisA && this.szXaxisA[this.nActualFrame]) {
				displayMessage(this.szXaxisA[this.nActualFrame], 3000, "big");
			} else
			if (this.szLabelA && this.szLabelA[this.nActualFrame]) {
				displayMessage(this.szLabelA[this.nActualFrame], 3000, "big");
			}
		} else {
			var labelA = this.szXaxisA || this.szLabelA;
			if (labelA) {
				if (this.nActualFrame === 0) {
					displayMessage(labelA[0], 3000, "big");
				} else
				if (this.nActualFrame == (this.nClipFrames - 1)) {
					displayMessage(labelA[1], 3000, "big");
				} else {
					displayMessage(" ... ", 3000, "big");
				}
			}
		}
	} else {
		if (this.ErrorMessage) {
			displayMessage(this.ErrorMessage, 10000, "notify");
			this.ErrorMessage = null;
		} else {
			clearMessage();
		}
	}

	if (!this.fSorted) {
		this.fResort = true;
		map.Themes.execute();
	}

	if (this.szFlag.match(/DECLUTTER/)) {
		this.declutterCharts();

		//this.fDeclutter = true;
		//map.Themes.execute();
	}

};

/**
 * sort and reappend the mapobjects, in order to their y position.
 * important for the 3D effect
 */
MapTheme.prototype.sortChartObjects = function () {
	if (!this.chartGroup ||
		this.szFlag.match(/NOSRT/) ||
		(this.szFlag.match(/NOSIZE/) && !this.szFlag.match(/3D/)) ||
		(this.szFlag.match(/CATEGORICAL/) && !this.szFlag.match(/AGGREGATE/) && !this.szSizeField)) {
		return;
	}
	var chartNode = null;
	var chartYPosA = [];
	var chartsA = this.chartGroup.childNodes;
	if (this.szFlag.match(/BUBBLE/) || this.szFlag.match(/SQUARE/) || this.szFlag.match(/BUFFER/) || this.szFlag.match(/TEXTONLY/)) {
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			chartYPosA[i] = {
				node: chartNode,
				y: Math.abs(Number(chartNode.getAttributeNS(szMapNs, "value")))
			};
		}
	} else {
		var nRot = getRotateAttributeValue(map.Scale.canvasNode) / 180 * Math.PI;
		for (var i = 0; i < chartsA.length; i++) {
			var chartNode = chartsA.item(i);
			if (nRot) {
				chartYPosA[i] = {
					node: chartNode,
					y: (getTranslate(chartNode).x * Math.sin(nRot) + getTranslate(chartNode).y * Math.cos(nRot))
				};
			} else {
				chartYPosA[i] = {
					node: chartNode,
					y: getTranslate(chartNode).y
				};
			}
		}
	}
	// sort charts
	// attention; up -> down because the last chart will be on top of the others
	if (this.szFlag.match(/\bSORT\b/) && this.szFlag.match(/\bUP\b/) && !this.szFlag.match(/SEQUENCE/)) {
		chartYPosA.sort(this.sortDownChartObjectsCompare);
	} else {
		chartYPosA.sort(this.sortUpChartObjectsCompare);
	}
	for (var i = 0; i < chartYPosA.length; i++) {
		chartYPosA[i].node.parentNode.appendChild(chartYPosA[i].node);
	}
	// GR 21.01.2011 work around to force the browserb to re-render 
	// due to an Chrome error; mixing up chart positions after the re-append
    var matrixA;
	if ((matrixA = getMatrix(this.chartGroup))) {
		setMatrix(this.chartGroup, matrixA);
	}
};

/**
 * private sort function, to sort objects of the type: node:nodeObj y:nodeposition.y
 * @param a the first object to compare
 * @param b the second object to compare
 * @return 1 if the yPosition of a > yPosition of b; else return -1 
 */
MapTheme.prototype.sortUpChartObjectsCompare = function (a, b) {
	return (a.y - b.y);
};

/**
 * private sort function, to sort objects of the type: node:nodeObj y:nodeposition.y
 * @param a the first object to compare
 * @param b the second object to compare
 * @return 1 if the yPosition of a > yPosition of b; else return -1 
 */
MapTheme.prototype.sortDownChartObjectsCompare = function (a, b) {
	return (b.y - a.y);
};

/**
 * get the size of one chart 
 * @param a the item index (string) of the (future) chart you want to know the height
 * @param nChartSize the normalized chart size
 * @param szFlag the chart type definition
 * @param nMySum the sum of all chart values (determines height for some chart types)
 * @type Number
 * @return the calculated chart height
 */
MapTheme.prototype.getChartSize = function (a, nChartSize, szFlag, nMySum) {

	if (szFlag.match(/NOSIZE/)) {
		return Math.max(5, nChartSize / 4);
	}

	// must be positive
	nMySum = Math.abs(nMySum);

	var nHeight = 0;
	var nSize = Math.max(5, nChartSize / 2);
	var nRange = this.nMax - this.nMin;
	var nRange100 = this.nMax100 - this.nMin100;
	if (this.nNormalSizeValue) {
		nRange = nRange100 = this.nMaxSize = this.nNormalSizeValue;
	}
	var nValue100 = this.itemA[a].nValue100;

	if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/) && this.szSizeField && a && this.itemA[a]) {
		if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
			nSize = nSize / this.nMaxSize * this.itemA[a].nSize;
		} else
		if (szFlag.match(/SIZELOG/)) {
			nSize = Math.max(1,nSize / Math.log((this.nMaxSize)) * Math.log(this.itemA[a].nSize));
		} else
		if (szFlag.match(/SIZEP4/)) {
			nSize = nSize / Math.pow((this.nMaxSize), 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
		} else
		if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
			nSize = nSize / Math.pow((this.nMaxSize), 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
		} else {
			nSize = nSize / Math.sqrt((this.nMaxSize)) * Math.sqrt(this.itemA[a].nSize);
		}
	} else if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/)) {
		if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
			nSize = nSize / nRange * nMySum;
		} else
		if (szFlag.match(/SIZELOG/)) {
			nSize = Math.max(1,nSize / Math.log((nRange)) * Math.log(nMySum));
		} else
		if (szFlag.match(/SIZEP4/)) {
			nSize = nSize / Math.pow((nRange), 1 / 4) * Math.pow(nMySum, 1 / 4);
		} else
		if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
			nSize = nSize / Math.pow((nRange), 1 / 3) * Math.pow(nMySum, 1 / 3);
		} else {
			nSize = nSize / Math.sqrt((nRange)) * Math.sqrt(nMySum);
		}
		// _TRACE("nMySum:"+nMySum+" -> nSize:"+nSize);
	}

	nHeight = map.Scale.normalX(10);
	// variable height, last trim GR 04.04.2014
	if (szFlag.match(/HEIGHT/) && !szFlag.match(/NORMSIZE/)) {
		if (szFlag.match(/SIZE/)) {
			if (this.szSizeField && a && this.itemA[a]) {
				nHeight = nHeight * Math.pow((10 / nRange * this.itemA[a].nSize), 1 / 3) * 3;
			} else {
				nHeight = nHeight * Math.pow((10 / nRange * nMySum), 1 / 3) * 3;
			}
		} else {
			if (nValue100 && this.nMax100 && this.nMin100 && !szFlag.match(/FRACTION/)) {
				nHeight = nHeight * 10 / (nRange100) * nValue100;
			} else {
				nHeight = nHeight * 10 / (nRange) * nMySum;
			}
		}
	}

	if (szFlag.match(/ZOOM/)) {
		nSize *= map.Scale.nObjectScaling;
		this.origSize = nSize;
		nSize = nChartSize / 10 + nSize * 1 / ((Math.log(Math.abs(nRange)) * Math.log(Math.abs(nMySum)) || 1));
		nSize = Math.min(nSize, nChartSize);
		nSize = Math.max(nSize, nChartSize / 5);
	}

	return Math.abs(nSize);
};

/**
 * check chart size of a theme item if size clipping set 
 * @param a the item index (string) of the (future) chart you want to know the height
 * @param nChartSize the normalized chart size
 * @param szFlag the chart type definition
 * @param nSum the sum of all chart values (determines height for some chart types)
 * @type boolean
 * @return true, if the chart size passes the check
 */
MapTheme.prototype.checkChartSize = function (a, nChartSize, szFlag, nSum) {
	if (this.nChartSizeMin && !szFlag.match(/ZOOM/)) {
		var nSize = this.getChartSize(a, nChartSize, szFlag, nSum);
		if (nSize / map.Layer.nObjectScale < this.nChartSizeMin) {
			return false;
		}
	}
	return true;
};

//.................................................................
// create one chart 
//.................................................................

MapTheme.prototype.getChart = function (chartGroup, a, nChartSize, szFlag, nMark) {
	if ( !this.fRealizeDone ){
		this.realize();
	}
	return this.drawChart(chartGroup, a, nChartSize, szFlag, nMark);
}


/**
 * create one chart object (SVG grafic) for one item of a theme
 * @param chartGroup the SVG group node to host the chart object
 * @param a the item index (string) of the (future) chart you want to know the height
 * @param nChartSize the normalized chart size
 * @param szFlag the chart type definition
 * @param nMark for multi value charts (es. barchart), the partnumber to evidence in some way
 * @type point object
 * @return the anchor point of the chart created; if null, creatuion failed
 */
MapTheme.prototype.drawChart = function (chartGroup, a, nChartSize, szFlag, nMark) {

	var nPartsA = null;
	var nValue100 = 0;
	var nMax = 0;

	// only for text label purpose
	this.szChartFlag = szFlag;

	// item chart
	// ------------------------------------------------------------------

	if (a) {

		if (!this.itemA[a]) {
			return null;
		}
		// GR 01.02.2015 we need to know later, if chart has been drawn
		this.itemA[a].fDone = false;
		var nPartsA = this.itemA[a].nValuesA;
		var nValue100 = this.itemA[a].nValue100;
		var nMax = Math.max(this.nMax, Math.abs(this.nMin));
		var nMySum = 0;
		if (!this.szFlag.match(/BUFFER/)) {
			for (var i = 0; i < nPartsA.length; i++) {
				if (isNaN(nPartsA[i])) {
					nPartsA[i] = 0;
				}
				nMySum += nPartsA[i];
			}
		}
		if (this.szFlag.match(/MORPH/) && this.szFlag.match(/\bCLIP\b/) && this.nClipFrames) {
			nPartsA = [];
			var nValueA = this.itemA[a].nValuesA;
			for (i = 0; i < nValueA.length / 2; i++) {
				var nValue = nValueA[i] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + nValueA[i + nValueA.length / 2] * this.nActualFrame / (this.nClipFrames - 1);
				nPartsA[i] = nValue;
			}
			var nMySum = 0;
			for (var i = 0; i < nPartsA.length; i++) {
				if (isNaN(nPartsA[i])) {
					nPartsA[i] = 0;
				}
				nMySum += nPartsA[i];
			}
		}

		/**
		 ** test test test 
		 **/
		if (szFlag.match(/NOPE/)) {
			return new point(0, 0);
		}

		if (szFlag.match(/DOT/)) {

			var nSize = 1;

			var nValue = nPartsA[0];

			// GR 26.06.2006 bubbles with colorscheme (classes)
			if (szFlag.match(/CATEGORICAL/)) {
				this.chart.szColor = this.colorScheme[nValue];
			} else
				// GR 26.06.2006 bubbles with colorscheme (classes)
				if ((this.colorScheme.length > 2) || (this.szRanges && this.szRanges.length)) {
					fDoDraw = false;
					for (i = 0; i < this.partsA.length; i++) {
						if (nValue < this.partsA[i].max) {
							this.chart.szColor = this.colorScheme[i];
							var cColor = __maptheme_getChartColors(szColor);
							if (szFlag.match(/NOLINES/)) {
								this.chart.szLineColor = "none";
							} else {
								this.chart.szLineColor = cColor.textColor;
							}
							if (szFlag.match(/RANGE/) && !szFlag.match(/RANGES/)) {
								nSize = map.Scale.normalX(2 + 5 * (i + 1) / this.partsA.length);
							}
							// value attributes are defined in child nodes
							//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");
							nClass = i;
							fDoDraw = true;
							break;
						}
					}
				}
			//var shapeGroup = map.Dom.newGroup(chartGroup,this.szId+":"+a+(a?":chartgroup":":ochrtgroup"));
			//newShape = map.Dom.newShape('circle',chartGroup,0,0,map.Scale.normalX(0.2),"fill:"+this.chart.szColor+";stroke:"+(this.szLineColor||this.chart.szLineColor)+";stroke-width:"+(this.szTextColor||this.chart.szLineColor)+";");
			// GR test fast DOT
			newShape = map.Dom.newShape('circle', chartGroup, 0, 0, map.Scale.normalX(3), "fill:" + this.chart.szColor + ";stroke:none;");

			return new point(0, 0);

			/**
			 ** test end 
			 **/
		}
	}

	// sum or overview chart
	// ------------------------------------------------------------------
	else {
		var nPartsA = [];
		var nMySum = 0;

		szFlag = szFlag || this.szFlag + "|XAXIS";

		// GR 26.08.2015 AGGREGATE|CATEGORICAL themes are like multiple field themes, but have fieldsA with length 1, so take colorscheme   
		if (this.szOrigFlag.match(/CATEGORICAL/)) {
			if (this.szOrigFlag.match(/SUM/)) {
				for (var i = 0; i < this.colorScheme.length; i++) {
					if (this.partsA[i]) {
						nPartsA[i] = this.partsA[i].nSum;
						nMax = Math.max(nMax, this.partsA[i].nSum);
						nMySum += nPartsA[i];
					}
				}

			} else
			if (this.szOrigFlag.match(/COUNT/)) {
				for (var i = 0; i < this.colorScheme.length; i++) {
					nPartsA[i] = this.partsA[i].nSum * 100;
					nMax = Math.max(nMax, this.partsA[i].nSum * 100);
					nMySum += nPartsA[i];
				}
			} else {
				for (var i = 0; i < this.colorScheme.length; i++) {
					nPartsA[i] = this.nOrigSumA[i] || this.exactCountA[i] || 1;
					nMax = Math.max(nMax, this.nOrigSumA[i] || this.exactCountA[i] || 1);
				}
			}
		} else {
			if (this.szOrigFlag.match(/COUNT/)) {
				for (var i = 0; i < this.colorScheme.length; i++) {
					nPartsA[i] = this.partsA[i].nCount;
					nMax = Math.max(nMax, this.partsA[i].nCount);
					nMySum += nPartsA[i];
				}
			} else {
				for (var i = 0; i < this.colorScheme.length; i++) {
					nPartsA[i] = this.partsA[i].nSum;
					nMax = Math.max(nMax, this.partsA[i].nSum);
					nMySum += nPartsA[i];
				}
			}
		}

		var nValue100 = this.nSum100;
		if (nValue100) {
			nMax = 0;
			nMySum = nValue100;
			for (var i = nPartsA.length - 1; i >= 0; i--) {
				if (this.szFlag.match(/DIFFERENCE/)) {
					nValue100 = i > 0 ? nPartsA[i - 1] : this.nSum100;
				} else
				if (this.szFlag.match(/CALCVAL/) || this.szFlag.match(/CALC100/)) {
					nPartsA[i] = nPartsA[i];
				} else
				if (this.szFlag.match(/PRODUCT/)) {
					nPartsA[i] = nPartsA[i];
				} else {
					nPartsA[i] = nPartsA[i] / nValue100;
					nMax = Math.max(nMax, nPartsA[i]);
					if (this.szFlag.match(/PERMILLE/)) {
						nPartsA[i] = nPartsA[i] * 1000;
					} else
					if (!this.szFlag.match(/FRACTION/)) {
						nPartsA[i] = nPartsA[i] * 100;
					}
					if (this.szFlag.match(/RELATIVE/)) {
						nPartsA[i] = nPartsA[i] - 100;
					}
					if (this.szFlag.match(/INVERT/)) {
						nPartsA[i] = 100 - nPartsA[i];
					}
				}
			}
			// must clip the height !!
			// nValue100 = nValue100/100;
			if (this.szFlag.match(/STACKED/)) {
				nMax = 100;
				if (this.szFlag.match(/NORMSIZE/) || szFlag.match(/NORMSIZE/)) {
					nMax = 0;
					for (var i = 0; i < nPartsA.length; i++) {
						nMax += nPartsA[i];
					}
				}
			} else {
				nMax = nMax * 100;
				nMax += nMax / 10;
				nMax = this.nMax;
			}
		} else {
			if (this.szFlag.match(/DIFFERENCE/)) {
				for (var i = nPartsA.length - 1; i >= 0; i--) {
					if (i > 0) {
						nPartsA[i] -= nPartsA[i - 1];
					} else if (!this.szFlag.match(/STACKED/)) {
						nPartsA[i] = 0;
					}
				}
			}
			if (a && this.szAggregation && this.szAggregation.match(/mean/)) {
				for (var i = 0; i < nPartsA.length; i++) {
					nPartsA[i] = nPartsA[i] / this.nCount;
				}
				if (this.szFlag.match(/MENUSIZE/)) {
					nMax = nMax / this.nCount;
				} else {
					nMax = this.nMax;
				}
			}
			if (this.szFlag.match(/MEAN/)) {
				for (var i = 0; i < nPartsA.length; i++) {
					nPartsA[i] = nPartsA[i] / this.partsA[i].nCount;
				}
			}
			if (this.szFlag.match(/STACKED/) && (this.szFlag.match(/NORMSIZE/) || szFlag.match(/NORMSIZE/) || this.szFlag.match(/MENUSIZE/) || szFlag.match(/MENUSIZE/))) {
				nMax = 0;
				for (var i = 0; i < nPartsA.length; i++) {
					nMax += nPartsA[i];
				}
			}
		}
	}

	var nSize = a ? this.getChartSize(a, nChartSize, szFlag, nMySum) : 1;

	// GR 16.01.2015 new
	if (this.nChartSizeMin && !szFlag.match(/ZOOM/)) {
		if (nSize / map.Layer.nObjectScale < this.nChartSizeMin) {
			return null;
		}
	} else
	if (!this.szFlag.match(/MULTIFIX/) && !this.szFlag.match(/MULTIGRID/) && !this.szFlag.match(/MULTIQUAD/)) {
		if (isNaN(nSize) || (nSize === 0)) {
			return null;
		}
	}

	// some presets and checks
	// ------------------------------------------------------------------

	var ptNull = new point(0, 0);

	// handle chart type
	if (!szFlag) {
		szFlag = this.szFlag;
	} else if (!szFlag.match(/CHART/) && szFlag.match(/VALUES/) || szFlag.match(/NORMSIZE/) || szFlag.match(/MENUSIZE/)) {
		szFlag = this.szFlag + "|" + szFlag;
	}

	// !! here we make deviation charts for chloroplethe themes
	// --------------------------------------------------------
	if (szFlag.match(/DOMINANT|COMPOSE/) && !szFlag.match(/CHART/)) {
		if (szFlag.match(/PERCENTOFMEAN/)) {
			szFlag = "BAR|OFFSETMEAN|POINTER" + "|VALUES|ZOOM";
		} else if (szFlag.match(/PERCENTOFMEDIAN/)) {
			szFlag = "BAR|OFFSETMEDIAN|POINTER" + "|VALUES|ZOOM";
		} else if (szFlag.match(/DEVIATION/)) {
			szFlag = "BAR|DEVIATION|POINTER" + "|VALUES|ZOOM";
		} else {
			szFlag = "BAR|XAXIS|HORZ|SORT" + "|VALUES|ZOOM";
		}
	}

	// GR 05.10.2013 if we want a zoomed chart, don't size it
	// GR 24.01.2014 new ZOOM algorithm, so comment it out
	if (szFlag.match(/ZOOM/) && szFlag.match(/BAR/) && szFlag.match(/POINTER/) && (nPartsA.length > 1)) {
		szFlag = this.removeDefinition(szFlag, "SIZE") + "|COMPRESSMAX";
	}

	// GR 18.01.2007 if zero and not allowed, don't draw
	if (nPartsA.length == 1 && nPartsA[0] === 0 && !szFlag.match(/ZEROISVALUE/) && !szFlag.match(/CATEGORICAL/)) {
		this.nZeroValueCount++;
		return null;
	}

	// GR 29.01.2015 if nValueUpper and zoom not sufficient, remove VALUES from flag 
	if (szFlag.match(/VALUES/)) {
		this.fHideValues = false;
		if (!szFlag.match(/ZOOM/)) {
			this.fHideValues = (this.szValueUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nValueUpper)) ||
							   (this.szValueLower && (map.Scale.nTrueMapScale * map.Scale.nZoomScale < this.nValueLower));
		}
		// GR 29.01.2019 no VALUES on zoomed pie chart with more than 10 parts 
		if (szFlag.match(/ZOOM/) && szFlag.match(/PIE/) && nPartsA.length > 10) {
			szFlag = this.removeDefinition(szFlag, "VALUES");
		}
	}

	// ------------------------------------------------------------------
	// here we go --->
	// ------------------------------------------------------------------

	// GR 16.09.2008 if not a defined, name ochrtgroup to avoid infodisplay on mouseover
	var shapeGroup = map.Dom.newGroup(chartGroup, this.szId + ":" + a + (a ? ":chartgroup" : ":ochrtgroup"));
	var shapeOnTopGroup = null;
	var textOnTopGroup = null;
	//var topGroup = null;

	if (szFlag.match(/MOVABLE/)) {
		shapeGroup.setAttributeNS(null, "id", shapeGroup.getAttributeNS(null, "id") + ":movable");
		shapeGroup.setAttributeNS(null, "onmousedown", "map.Themes.initChartOffset(evt,\"" + this.szId + "\",\"" + this.szId + ":" + a + ":chartgroup:movable" + "\")");
		shapeGroup.setAttributeNS(null, "onmouseup", "map.Themes.endChartOffset(evt,\"" + this.szId + "\",\"" + this.szId + ":" + a + ":chartgroup:movable" + "\")");
	}

	if (szFlag.match(/CHOROPLETH/)) {
		var nMaxRadius = map.Scale.normalX(nChartSize / 2);
		var nRadius = nMaxRadius * 2 / 3;
		var szColor = this.colorScheme[0];
		var szLineColor = this.colorScheme[1] ? this.colorScheme[1] : "none";
		var nLineWidth = map.Scale.normalX(0.1) * map.Scale.nFeatureScaling * map.Scale.nObjectScaling;
		var newShape = map.Dom.constructNode('use', shapeGroup, {
			'xlink:href': '#choropleth_icon'
		});
		newShape.fu.scale(2, 2);
		nChartSize = nRadius * 2 / map.Scale.normalX(1);
		ptNull.x = 0;
		ptNull.y = nRadius + map.Scale.normalY(5);
	}

	// == BLANK chart (do nothing, serves for testing)  ===============================================

	if (szFlag.match(/BLANK/)) {
		return null;
	}

	// == user created chart  =======================================================================

	if (szFlag.match(/\bUSER\b/)) {
		try {
			var nRadius = map.Scale.normalX(nChartSize);
			if (szFlag.match(/GRIDSIZE/)) {
				nRadius = this.nGridSize;
			}
			
			var objTheme = this.objThemesA[this.szThemesA[0]];
			var opt = {
				target: shapeGroup,
				theme: this,
				item: this.itemA[a],
				values: nPartsA,
				maxSize: nRadius,
				flag: szFlag,
				mark: nMark,
				dbRecord: (objTheme.dbRecords ? objTheme.dbRecords[this.itemA[a].dbIndex] : null)
			};
			
			this.ptNullUser = null;
			if ( this.userDraw ){
				this.opt = opt;
				eval("this.ptNullUser = HTMLWindow.ixmaps."+this.userDraw+"(SVGDocument,this.opt);");
				delete this.opt;
			}
			else{
				this.ptNullUser = HTMLWindow.ixmaps.htmlgui_drawChart(SVGDocument, opt);
			}
			
			if (this.ptNullUser) {
				// position the generated chart object
				shapeGroup.fu.setPosition(shapeGroup.fu.getPosition().x - this.ptNullUser.x,
                                          shapeGroup.fu.getPosition().y - this.ptNullUser.y);
				this.ptNullUser.x = 0;
				this.ptNullUser.y = 0;
				return this.ptNullUser;
			}else{
				this.userChartDrawError = (this.userChartDrawError || 0) + 1; 
			}
		} catch (e) {}
	}

	// == PIE / DONUT  =======================================================================
	
	if (szFlag.match(/PIE/)) {
		
		if ((nMySum === 0) && !szFlag.match(/AUTOCOMPLETE/)) {
			return null;
		}

		// 20.02.2014 also here
		if (szFlag.match(/\bSORT\b/)) {
			this.sortedIndex = [];
			for (i = 0; i < nPartsA.length; i++) {
				this.sortedIndex[i] = {
					index: i,
					value: nPartsA[i]
				};
			}
			this.sortedIndex.sort(this.sortIndexDown);
		} else {
			this.sortedIndex = null;
		}
		if (szFlag.match(/\bREVERSE\b/)) {
			this.sortedIndex = [];
			for (i = 0; i < nPartsA.length; i++) {
				this.sortedIndex[i] = {
					index: nPartsA.length-i,
					value: nPartsA[i]
				};
			}
		}
		
		
		// GR 15.10.2014 new, last value == center part
		// --> Donut with center (inner radius) == last value 
		// GR 26.07.2016 center part variabile
		this.nCenterValue = 0;
		// --------------------------------------------------
		if (szFlag.match(/CENTER/)) {
			this.nCenter = 0;
			var __nSum = 0;
			var __nMax = (-Number.MAX_VALUE);
			var __nMin = Number.MAX_VALUE;

			for (var p = 0; p < (this.nClipParts || nPartsA.length); p++) {

				var nI = this.sortedIndex ? this.sortedIndex[p].index : p;

				__nSum += (nPartsA[nI]||0);
				if (nPartsA[nI] < __nMin) {
					__nMin = nPartsA[nI];
					this.nCenterMin = nI;
				}
				if (nPartsA[nI] > __nMax) {
					__nMax = nPartsA[nI];
					this.nCenterMax = nI;
				}
			}

			this.szCenterPart = this.szCenterPart || "max";

			if (this.szCenterPart) {
				if (this.szCenterPart == "first") {
					this.nCenter = 0;
				} else
				if (this.szCenterPart == "last") {
					this.nCenter = nPartsA.length - 1;
				} else
				if (this.szCenterPart == "min") {
					this.nCenter = this.nCenterMin;
				} else
				if (this.szCenterPart == "max") {
					this.nCenter = this.nCenterMax;
				} else
				if (Number(this.szCenterPart)) {
					this.nCenter = Number(this.szCenterPart);
				}
			}
			this.nCenterValue = nPartsA[this.nCenter];
			this.nCenterSize = this.nCenterValue / __nSum * 100;
		}
		// --------------------------------------------------

		var nHeight = 0;
		var nSize = Math.max(5, nChartSize / 2);
		var nRange = this.nMax - this.nMin;
		var nRange100 = this.nMax100 - this.nMin100;
		if (this.nNormalSizeValue) {
			nRange = nRange100 = this.nNormalSizeValue;
		}

		if (szFlag.match(/GRIDSIZE/) && !szFlag.match(/NORMSIZE/)) {
			nSize = this.nGridSize / nChartSize * (szFlag.match(/\bRECT\b/) ? 0.72 : 0.6);
		} else
		if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/) && this.szSizeField && a && this.itemA[a]) {
			if (szFlag.match(/SIZELOG/)) {
				nSize = Math.max(1,nSize / Math.log((this.nMaxSize)) * Math.log(this.itemA[a].nSize));
			} else
			if (szFlag.match(/SIZEP4/)) {
				nSize = nSize / Math.pow((this.nMaxSize), 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
			} else
			if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
				nSize = nSize / Math.pow((this.nMaxSize), 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
			} else {
				nSize = nSize / Math.sqrt((this.nMaxSize)) * Math.sqrt(this.itemA[a].nSize);
			}
		} else if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/)) {
			if (szFlag.match(/SIZELOG/)) {
				nSize = Math.max(1,nSize / Math.log((nRange)) * Math.log(nMySum));
			} else
			if (szFlag.match(/SIZEP4/)) {
				nSize = nSize / Math.pow((nRange), 1 / 4) * Math.pow(nMySum, 1 / 4);
			} else
			if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
				nSize = nSize / Math.pow((nRange), 1 / 3) * Math.pow(nMySum, 1 / 3);
			} else {
				nSize = nSize / Math.sqrt((nRange)) * Math.sqrt(nMySum);
			}
		}

		nHeight = map.Scale.normalX(10);
		// variable height, last trim GR 04.04.2014
		if (szFlag.match(/HEIGHT/) && !szFlag.match(/NORMSIZE/)) {
			if (szFlag.match(/SIZE/)) {
				if (this.szSizeField && a && this.itemA[a]) {
					nHeight = nHeight * Math.pow((10 / nRange * this.itemA[a].nSize), 1 / 3) * 3;
				} else {
					nHeight = nHeight * Math.pow((10 / nRange * nMySum), 1 / 3) * 3;
				}
			} else {
				if (nValue100 && this.nMax100 && this.nMin100 && !szFlag.match(/FRACTION/)) {
					nHeight = nHeight * 10 / (nRange100) * nValue100;
				} else {
					nHeight = nHeight * 10 / (nRange) * nMySum;
				}
			}
		}

		if (szFlag.match(/ZOOM/) ) {
			nSize *= map.Scale.nObjectScaling;
			this.origSize = nSize;
			nSize = nChartSize / 10 + nSize * 3 / Math.log((nRange)) * Math.log(nMySum) * map.Layer.nDynamicObjectScale;
			nSize = Math.min(nSize, nChartSize * 1.2);
			nSize = Math.max(nSize, nChartSize / 2);
		}

		var donutsA = [];
		for ( var s=0; s<(this.nGridX||1); s++ ){
			
			var donut = DonutCharts.newChart(SVGDocument, shapeGroup, 0, 0, map.Scale.normalX(nSize), 0);
			donut.ident = s;
			
			ptNull.x = 0;
			ptNull.y = map.Scale.normalY(nSize) + map.Scale.normalY(5);

			donut.setStyle("flat");
			donut.setLine("#555566");
			donut.setLineWidth(map.Scale.normalX(this.nLineWidth || 0.1));
			if (szFlag.match(/NOLINES/)) {
				donut.setLine("none");
			}
			if (szFlag.match(/WHITELINES/)) {
				donut.setLine("white");
			}
			if (this.szLineColor) {
				donut.setLine(this.szLineColor);
			}
			if (szFlag.match(/3D/)) {
				donut.setStyle("3D");

				var nPow = 1 / 2;
				if (szFlag.match(/P3/)) {
					nPow = 1 / 3;
				} else
				if (szFlag.match(/P4/)) {
					nPow = 1 / 4;
				}
				if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/) && this.szSizeField && a && this.itemA[a]) {
					nHeight = nHeight / Math.pow((this.nMaxSize), nPow) * Math.pow(this.itemA[a].nSize, nPow);
				} else if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/)) {
					nHeight = nHeight / Math.pow((nRange), nPow) * Math.pow(nMySum, nPow);
				}

				if (szFlag.match(/ZOOM/)) {
					nHeight *= map.Scale.nObjectScaling;
					nHeight = nHeight / this.origSize * nSize;
				}
				ptNull.y *= 0.7;
			}

			if (szFlag.match(/VOLUME/)) {
				donut.addStyle("VOLUME");
			}

			if (szFlag.match(/DONUT/)) {
				if (szFlag.match(/3D/)) {
					donut.setRadInner(map.Scale.normalX(nSize * 0.5));
				} else
				if (szFlag.match(/XTHIN/)) {
					donut.setRadInner(map.Scale.normalX(nSize * 0.95));
				} else
				if (szFlag.match(/THIN/)) {
					donut.setRadInner(map.Scale.normalX(nSize * 0.66));
				} else
				if (szFlag.match(/THICK/)) {
					donut.setRadInner(map.Scale.normalX(nSize * 0.25));
				} else {
					donut.setRadInner(map.Scale.normalX(nSize * 0.42));
				}
			} else
			if (szFlag.match(/CENTER/)) {
				var radius = Math.sqrt(Math.pow(map.Scale.normalX(nSize), 2) / 100 * this.nCenterSize);
				donut.setRadInner(radius);
			}

			if (szFlag.match(/STARBURST/)) {
				donut.addStyle("STARBURST");
				ptNull.y *= 0.8;
			}
			if (szFlag.match(/XLFLOWER/) || szFlag.match(/XLRAYS/)) {
				donut.addStyle("XLRAYS");
				ptNull.y *= 0.8;
			} else
			if (szFlag.match(/LFLOWER/) || szFlag.match(/LRAYS/)) {
				donut.addStyle("LRAYS");
				ptNull.y *= 0.8;
			} else
			if (szFlag.match(/XSFLOWER/) || szFlag.match(/XSRAYS/)) {
				donut.addStyle("XSRAYS");
				ptNull.y *= 0.8;
			} else
			if (szFlag.match(/SFLOWER/) || szFlag.match(/SRAYS/)) {
				donut.addStyle("SRAYS");
				ptNull.y *= 0.8;
			} else
			if (szFlag.match(/FLOWER/) || szFlag.match(/RAYS/)) {
				donut.addStyle("RAYS");
				ptNull.y *= 0.8;
			}
			if (szFlag.match(/SILENT/)) {
				donut.addStyle("SILENT");
			}
			// GR 14.04.2011
			if (szFlag.match(/AUTOCOMPLETE/)) {
				donut.addStyle("AUTOCOMPLETE");
				donut.szNoDataColor = this.szNoDataColor||"#eeeeee";
			}
			// GR 20.02.2014
			if (szFlag.match(/BIGTOTOP/)) {
				donut.addStyle("BIGTOTOP");
			}
			// GR 25.12.2014
			if (szFlag.match(/NOROTATE/)) {
				donut.addStyle("NOROTATE");
			}
			// GR 13.10.2018
			if (szFlag.match(/ROTATE/)) {
				donut.addStyle("ROTATE");
			}
			// GR 13.10.2018
			if (szFlag.match(/SYMMETRIC/)) {
				donut.addStyle("SYMMETRIC");
			}
			// GR 03.03.2018
			if (szFlag.match(/HALFPLUS20/)) {
				donut.addStyle("HALFPLUS20");
				donut.addStyle("NOROTATE");
			}
			if (szFlag.match(/HALFMINUS20/)) {
				donut.addStyle("HALFMINUS20");
				donut.addStyle("NOROTATE");
			}
			if (szFlag.match(/HALFPLUS10/)) {
				donut.addStyle("HALFPLUS10");
				donut.addStyle("NOROTATE");
			}
			if (szFlag.match(/HALFMINUS10/)) {
				donut.addStyle("HALFMINUS10");
				donut.addStyle("NOROTATE");
			}
			if (szFlag.match(/HALF/)) {
				donut.addStyle("HALF");
				donut.addStyle("NOROTATE");
			}
			// GR 02.03.2019
			if (szFlag.match(/DIRECTION/)) {
				donut.addStyle("DIRECTION");
			}
			// GR 02.03.2019
			if (szFlag.match(/POLAR/) && (s == ((this.nGridX||1)-1)) ) {
				donut.addStyle("POLAR");
			}

			// for donuts, get max value and recalclate percentages
			var nMaxI = 0;
			var nMinI = 0;
			var nMaxValue = 0;
			if (szFlag.match(/DONUT/)) {
				for (var i = 0; i < nPartsA.length; i++) {
					if (nPartsA[i] > nPartsA[nMaxI]) {
						nMaxI = i;
					}
					if (nPartsA[i] < nPartsA[nMinI]) {
						nMinI = i;
					}
				}
			}

			if ( szFlag.match(/STARBURST/) ) {
				for (var i = 0; i < nPartsA.length; i++) {
					// gr 29.03.2020 make all STARBURST parts! negative -> 0
					nPartsA[i] = Math.max(nPartsA[i],0);
					nMaxValue = Math.max(nMaxValue,this.nMaxA[i]);
				}
				if ( szFlag.match(/\bSIZE\b/) ) {
					donut.setMaxValue(this.nMaxValue||nMaxValue); 			
				}else{
					donut.setMaxValue(this.nNormalSizeValue||this.nMaxValue||nMaxValue); 			
				}

			}
			donutsA.push(donut);
		}

		var nSumPercent = 0;
		var stacked = 0;
		
		for (var i = 0; i < (this.nClipParts ? Math.min(this.nClipParts, nPartsA.length) : nPartsA.length); i++) {

			var nDonut = i%(this.nGridX||1);
			var donut = donutsA[nDonut];
						
			var szLabel = "";
			var nI = (i);
			if (this.sortedIndex) {
				nI = this.sortedIndex[nI].index;
			}

			// GR 26.07.2016 new pie with center part argorithm
			if (szFlag.match(/CENTER/) && !szFlag.match(/DONUT/)) {
				if (nI == this.nCenter) {
					continue;
				}
			}

			if (this.szLabelA && this.szLabelA[nI]) {
				szLabel = " '" + this.szLabelA[nI]+"'";
			} else {
				szLabel = " '" + this.szFieldsA[nI]+"'";
			}

			var szColor = a ? (this.itemA[a].szColor || this.colorScheme[nI]) : this.colorScheme[nI];
			var szColor = a ? (this.itemA[a].szColor || this.colorScheme[nI%(this.nGridX||100000)]) : this.colorScheme[nI%(this.nGridX||1000000)];

			// pie with 1 value but color classes
			if (nPartsA.length == 1) {
				for (x = 0; x < this.partsA.length; x++) {
					if ((szFlag.match(/CATEGORICAL/) && (nPartsA[nI] == this.partsA[x].min)) || (!szFlag.match(/CATEGORICAL/) && (nPartsA[nI] < this.partsA[x].max))) {
						szColor = this.colorScheme[x];
						chartGroup.setAttributeNS(szMapNs, "class", String(x));
						break;
					}
				}
			}
			var szUnit = ((szFlag.match(/AUTOCOMPLETE/) && !this.szUnit.match(/%/)) ? " % " : "") + this.szUnit;

			if (this.szShowParts) {
				var szTmpColor = szColor;
				szColor = "none";
				for (p in this.szShowPartsA) {
					if (this.szShowPartsA[p] == nI) {
						szColor = szTmpColor;
					}
				}
			}
			// only positive values make a pie part!
			if ( (nPartsA[nI] > 0) || 
				((nPartsA[nI] === 0) && !szFlag.match(/ZEROISNOTVALUE/)) ) {
				if (szFlag.match(/COUNT/) && this.itemA[a].nCountA){
					var donutPart = donut.addPart(nPartsA[nI]
												  ,nHeight
												  ,szColor
												  ,0
												  ,this.formatValue(this.itemA[a].nCountA[nI], this.nValueDecimals || (this.itemA[a].nCountA[nI] < 1 ? 2 : 0), "ROUND") + szUnit, szLabel);
				}else{
					if ( nDonut == 0 ){
						nStacked = 0;
					}
					var donutPart = donut.addPart(nPartsA[nI]+(szFlag.match(/STACKED/)?nStacked:0)
												  ,nHeight
												  ,szColor
												  ,0
												  ,(this.szAggregation && this.szAggregation.match(/sum/)) ? this.formatValue(nPartsA[nI], this.nValueDecimals || (nPartsA[nI] < 1 ? 2 : 0), "ROUND") + szUnit : this.formatValue(nPartsA[nI], this.nValueDecimals || (nPartsA[nI] < 1 ? 2 : 0), "ROUND") + szUnit, szLabel);
					
					nStacked += nPartsA[nI];
				}
				donutPart.nClass = nI;

				// GR 03.03.2019 new, donut/startburst part will be directed to the position of the source of the aggregated data
				// can be combined with AGGREGATED CATEGORICAL themes, where the CATEGORICAL values are the id's of the data sources
				// usefull for 'trip' data with start and end points
				// 
				if (szFlag.match(/DIRECTION/)) {
					var p1 = this.itemA[a].ptPos;
					var p2 = this.getNodePosition(this.szThemesA[0] + "::" + this.szLabelA[nI]);
					if (p1 && p2) {
						var angle = (Math.atan2((p1.y - p2.y), (p2.x - p1.x))) * (180 / Math.PI);
						donutPart.nAngle = (450 - angle) % 360; // 450 = 360 + 90
					}
				}
			}

			if (this.colorScheme[i] == "none") {
				donut.setLine(this.szLineColor || "black");
			}

			nSumPercent += nPartsA[nI];
			
		}

		// GR 09.11.2019 donut with count or size == 1 --> bubble
		if (donut.partsA.length < 2 && (a && (this.itemA[a].nCount == 1))) {
			donut.nRadInner = 0;
			//donut.nRadOuter *= 0.85;
		}

		//donut.realize();
		for ( var s=(this.nGridX||1)-1; s>=0; s-- ){
			donutsA[s].realize();
		}

		if (szFlag.match(/CENTER/) && !szFlag.match(/DONUT/)) {
					
			var nRadius = Math.sqrt(Math.pow(map.Scale.normalX(nSize), 2) / 100 * this.nCenterSize);
			var szColor = this.colorScheme[this.nCenter];
			var circle = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 0.9, "fill:" + szColor + ";");
			if (circle) {
				circle.setAttributeNS(szMapNs, "class", String(this.nCenter));
				circle.setAttributeNS(szMapNs, "tooltip", this.szLabelA ? (this.szLabelA[this.nCenter] + ": " + nPartsA[this.nCenter] + this.szUnit + "") : (nPartsA[this.nCenter] + this.szUnit));
			}
			// GR 29.12.2016 new
			if ((szFlag.match(/GLOW/) && !szFlag.match(/ZOOM/)) &&
				(!this.szGlowUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nGlowUpper)) &&
				(!this.szGlowLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale >= this.nGlowLower))
			) {
				var newShapeBg1 = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 6, "fill:" + szColor + ";stroke:none;fill-opacity:0.05;pointer-events:none;");
				if (newShapeBg1) {
					newShapeBg1.setAttributeNS(szMapNs, "class", String(nCenter));
				}
				var newShapeBg2 = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 2, "fill:" + szColor + ";stroke:none;fill-opacity:0.1;pointer-events:none;");
				if (newShapeBg2) {
					newShapeBg2.setAttributeNS(szMapNs, "class", String(nCenter));
				}
			} 
			if (szFlag.match(/CENTERVALUE/) || szFlag.match(/ZOOM/) || (szFlag.match(/VALUES/) && !this.fHideValues)) {
				var szText = this.formatValue(this.nCenterValue, this.nValueDecimals || (((this.nCenterSize < 1) || (nMaxValue < 10)) ? 0 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
				var cColor = __maptheme_getChartColors(szColor);
				var szTextColor = cColor.textColor;
				var nFontSize = String(Math.min(nRadius * 0.8, nRadius * (3.3 / szText.length)) * this.nValueScale);
				var text = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:arial;font-size:" + nFontSize + "px;font-weight:bold;text-anchor:middle;fill:" + szTextColor + ";opacity:" + String(this.nOpacity ? this.nOpacity : 1) + ";stroke:none;pointer-events:none", szText);
				if (text) {
					text.setAttributeNS(szMapNs, "class", String(this.nCenter));
				}
			}
		} else
		if (szFlag.match(/CENTERVALUE/)) {
			var szText = String(this.itemA[a].nCount || this.itemA[a].nSize);
			var szTextColor = this.szTextColor || "#888888";
			var nRadius = map.Scale.normalX(nSize);
			var nFontSize = String(Math.min(nRadius * 0.5, nRadius * (2 / szText.length)));
			var nOpacity = this.nValueSizeMin ? (nFontSize / map.Scale.normalX(5)) : 1;

			var newTextbg = map.Dom.newText(shapeGroup, 0, nFontSize * 0.35, "font-family:arial;font-size:" + nFontSize + "px;text-anchor:middle;fill:none;stroke:black;stroke-width:" + nFontSize / 40 + ";stroke-opacity:0.5;pointer-events:none;stroke-linejoin:bevel;", szText);

			var newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.35, "font-family:arial;font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";opacity:" + nOpacity + ";stroke:none;pointer-events:none", szText);
		}

		if (szFlag.match(/VALUES/) && !szFlag.match(/STACKED/) &&
			(szFlag.match(/ZOOM/) || !this.fHideValues)) {
			// GR check possible fontsize here, if to small, don't create inline text
			var nFontSize = Math.min(nSize * 0.8, nSize * (3.4 / (donut.partsA[0] ? donut.partsA[0].szText.length : 1)));
			if ((nPartsA.length > 1) || szFlag.match(/NOINLINETEXT/) ||
				(szFlag.match(/ZOOM/) && (nFontSize < 6))
			) {
				var nFontSize = ((szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) ?
					(map.Scale.normalX(8)) :
					(map.Scale.normalX(5 * (this.nValueScale || 1)))
				);
				this.drawDonutText(donut, nFontSize);
			} else {
				var szText = donut.partsA[0] ? donut.partsA[0].szText : ""; // this.formatValue(nValue,1)+(this.szUnit.length<=5?this.szUnit:"");
				var cColor = __maptheme_getChartColors(szColor);
				var szTextColor = this.szTextColor || cColor.textColor;
				var nRadius = map.Scale.normalX(nSize);
				var nFontSize = String(Math.min(nRadius * 0.8, nRadius * (3.4 / szText.length)));
				var nOpacity = this.nValueSizeMin ? (nFontSize / map.Scale.normalX(5)) : 1;
				// GR 03.04.2013 have to to this here 
				if (szFlag.match(/VOLUME/)) {
					nHeight = donut.donutPartsA[0].nHeight;
				}
				if (!szFlag.match(/3D/)) {
					nHeight = nRadius * 0.6;
				}
				var newText = map.Dom.newText(shapeGroup, 0, -nHeight + nRadius / 2 + nFontSize * 0.45, "font-family:arial;font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";opacity:" + nOpacity + ";stroke:none;pointer-events:none", szText);
				if (szFlag.match(/3D/)) {
					newText.fu.setPosition(0, -nRadius / 2 + nFontSize * (szFlag.match(/VOLUME/) ? 0.5 : 0.25));
					newText.fu.scale(1, 0.5);
				}
			}
		}

		// GR 15.10.2014 new, fillopacity also in PIE/DONUT 
		// 
		if (this.fillOpacity) {
			shapeGroup.setAttributeNS(null, "fill-opacity", String(this.fillOpacity));
		}
		if (this.nOpacity) {
			shapeGroup.setAttributeNS(null, "fill-opacity", String(this.nOpacity));
			shapeGroup.setAttributeNS(null, "stroke-opacity", String(this.nOpacity));
		}

		// GR 22.01.2014 try to limit the visual effect of extraordinary high values 
		// 
		if (szFlag.match(/FADEDEVIATION/)) {
			var nDev = (nPartsA[0] - this.nMeanA[0]) / this.nDeviationA[0];
			if (nDev > 10) {
				var nOpacity = (Math.pow(10, 1 / 2) / Math.pow(nDev, 1 / 2));
				shapeGroup.setAttributeNS(null, "opacity", String(nOpacity));
			}
		} else
		if (szFlag.match(/LIMITDEVIATION/)) {
			var nDev = (nPartsA[0] - this.nMeanA[0]) / this.nDeviationA[0];
			if (nDev > 10) {
				shapeGroup.setAttributeNS(null, "opacity", "0");
			}
		}
		
		if (szFlag.match(/ZOOM/) && szFlag.match(/STARBURST/)) {
			//shapeGroup.fu.scale(10,10);
		}

		// GR 17.08.2015 for mark/unmark class
		//

		if ((nPartsA.length == 1) && szFlag.match(/CATEGORICAL/)) {
			if (donut.donutPartsA[0]) {
				donut.donutPartsA[0].objNode.setAttributeNS(szMapNs, "class", chartGroup.getAttributeNS(szMapNs, "class"));
				if (donut.donutPartsA[0].textNode) {
					donut.donutPartsA[0].textNode.setAttributeNS(szMapNs, "class", chartGroup.getAttributeNS(szMapNs, "class"));
				}
			}
		} else
			for (var i = 0; i < donut.donutPartsA.length; i++) {
				if (donut.donutPartsA[i]) {
					donut.donutPartsA[i].objNode.setAttributeNS(szMapNs, "class", String(donut.partsA[i].nClass));
					if (donut.donutPartsA[i].textNode) {
						donut.donutPartsA[i].textNode.setAttributeNS(szMapNs, "class", String(donut.partsA[i].nClass));
					}
				}
			}

		this.nRealizedCount++;
	}

	// == WAFFLE =======================================================================================

	else if (szFlag.match(/WAFFLE/)) {

		var nChartWidth = map.Scale.normalX(nChartSize);
		if (szFlag.match(/GRIDSIZE/)) {
			nChartWidth = this.nGridSize * 1.05;
		} else
		if (szFlag.match(/AUTOSIZE/)) {
			var nDynScale = map.Layer.nDynamicObjectScale;
			var nAutoSize = szFlag.match(/\bRECT\b/) ? (szFlag.match(/GAP/) ? 2.3 : 2.0) : (szFlag.match(/GAP/) ? 1.7 : 1.6);
			nMaxValue = Math.max(nAllMaxValue, this.nMax);
			if (this.nGridWidthPx) {
				nChartWidth = map.Scale.normalX(this.nGridWidthPx) / nAutoSize / nDynScale;
			} else {
				nChartWidth = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize / nDynScale) : nMaxRadius;
			}
			nChartWidth = nChartWidth / Math.sqrt(this.nMaxSize) * Math.sqrt(this.itemA[a].nSize);
		}

		nChartWidth *= 0.97;

		// needed to set a class attribute in the chart parts 
		//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");

		// waffles background (with gap)
		// -----------------------------------------------------------
		newShape = map.Dom.newShape('rect', shapeGroup, -(nChartWidth / 2) + 10, -(nChartWidth / 2) + 10,
			nChartWidth - 20,
			nChartWidth - 20,
			"fill:" + (this.szBoxColor || "back") + ";stroke:" + (this.szBorderColor || "none") + ";stroke-width:" + (this.szBorderWidth || 2) + ";fill-opacity:" + (this.nBoxOpacity || 0.05) + ";opacity:1;");

		// border around waffles
		// ---------------------
		nChartWidth *= 0.9;

		// sort waffle parts to beginn with the large number
		// -----------------------------------------------------------
		if (szFlag.match(/\bSORT\b/)) {
			this.sortedIndex = [];
			for (i = 0; i < nPartsA.length; i++) {
				this.sortedIndex[i] = {
					index: i,
					value: nPartsA[i]
				};
			}
			this.sortedIndex.sort(this.sortIndexDown);
		} else {
			this.sortedIndex = null;
		}

		// ok, let's make the waffles
		// -----------------------------------------------------------

		// calcolate waffle params
		// use square root of max theme value to calculate waffle size
		// -----------------------------------------------------------

		var nMax = Math.max(this.nMax, Math.abs(this.nMin));
		var nGridX = this.nGridX || (szFlag.match(/WAFFLE100/) ? 10 : Math.max(5, Math.round(Math.sqrt(nMax))));
		if (szFlag.match(/AUTO100/)) {
			nGridX = 10;
		}
		var nWaffleWidth = nChartWidth / (nGridX * 1.1);

		var x = -nChartWidth / 2;
		var y = nChartWidth / 2;

		var nX = 0;
		var nRows = 0;

		// set to limit number of waffles if WAFFLE100 or WAFFLE1000 
		var nWaffles = 100000;
		if (szFlag.match(/WAFFLE100/)) {
			nWaffles = 100;
		}

		for (i = 0; i < nPartsA.length; i++) {

			var index = this.sortedIndex ? this.sortedIndex[i].index : i;

			nPartsA[index] = Math.round(nPartsA[index]);

			if (nPartsA[index]) {

				// limit number of waffles to 100/1000 if WAFFLE100 or WAFFLE1000 
				var nPart = Math.min(nPartsA[index], nWaffles);
				nWaffles -= nPartsA[index];

				for (ii = 0; ii < nPart; ii++) {

					newShape = map.Dom.newShape('rect', shapeGroup,
						x,
						y - nWaffleWidth,
						nWaffleWidth,
						nWaffleWidth,
						"fill:" + this.colorScheme[index] + ";stroke:null;fill-opacity:" + (this.fillOpacity || 1) + ";opacity:" + (this.nOpacity || 1) + ";");

					// must set these attributes with ixmaps namespace
					// don't know how to do with D3
					newShape.setAttributeNS(szMapNs, "class", String(index));
					newShape.setAttributeNS(szMapNs, "tooltip", this.szLabelA ? (this.szLabelA[index] + ": " + nPartsA[index] + this.szUnit + "") : (nPartsA[index] + this.szUnit));

					x += nWaffleWidth * 1.1;
					if (++nX >= nGridX) {
						x = -nChartWidth / 2;
						y -= nWaffleWidth * 1.1;
						nX = 0;
					}
				}
			}
		}
		this.nRealizedCount++;
	}

	// == LABEL ==
	// == BUBBLE ==
	// == SQUARE =======================================================================================
	else if (szFlag.match(/BUBBLE/) ||
		szFlag.match(/SQUARE/) ||
		szFlag.match(/LABEL/)) {

		var nMaxRadius = map.Scale.normalX(nChartSize / 2);
		if (szFlag.match(/AUTOSIZE/)) {
			var nDynScale = map.Layer.nDynamicObjectScale;
			var nAutoSize = szFlag.match(/\bRECT\b/) ? (szFlag.match(/GAP/) ? 2.3 : 2.0) : (szFlag.match(/GAP/) ? 1.7 : 1.6);
			nMaxValue = Math.max(nAllMaxValue, this.nMax);
			if (this.nGridWidthPx) {
				nMaxRadius = map.Scale.normalX(this.nGridWidthPx) / nAutoSize / nDynScale;
			} else {
				nMaxRadius = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize / nDynScale) : nMaxRadius;
			}
		}

		var nMaxValue = Math.max(this.nMax, this.nMaxA[0]);
		if (this.nNormalSizeValue) {
			nMaxValue = this.nNormalSizeValue;
			this.nMaxSize = this.nNormalSizeValue;
		}

		var nValue = nPartsA[0];
		// GR 07.04.2009 
		if (this.szFlag.match(/\bCLIP\b/) && !this.szFlag.match(/MORPH/) && this.nClipFrames) {
			if ((this.nClipFrames == nPartsA.length)) {
				nValue = Number(nPartsA[this.nActualFrame]);
				nMaxValue = this.nNormalSizeValue || this.nMaxA[this.nActualFrame];
			} else {
				nValue = nPartsA[0] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + nPartsA[nPartsA.length - 1] * this.nActualFrame / (this.nClipFrames - 1);
			}
			if ((nValue === 0) && !(szFlag.match(/ZEROISVALUE/))) {
				return null;
			}
		}
		if (szFlag.match(/INVERTSIZE/)) {
			if ((nMaxValue - nPartsA[0] === 0) && !(szFlag.match(/ZEROISVALUE/))) {
				return null;
			}
		}

		// GR 03.09.2007 explicit size field
		var nSizeValue = (a && this.itemA[a] && this.szSizeField) ? (this.itemA[a].nSize || 0) : nValue;
		var nSizeMax = (a && this.itemA[a] && this.szSizeField) ? this.nMaxSize : nMaxValue;

		if (nSizeValue === 0 && !szFlag.match(/NOSIZE/)) {
			return null;
		}
		if (this.nMinValue && (nSizeValue < this.nMinValue)) {
			return null;
		}

		if (szFlag.match(/MENUSIZE/)) {
			nRadius = map.Scale.normalX(nChartSize / 2.5);
		} else {
			if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
				nRadius = nMaxRadius / nSizeMax * Math.abs(nSizeValue);
			} else
			if (szFlag.match(/SIZEP3/)) {
				nRadius = nMaxRadius / Math.pow(nSizeMax, 1 / 3) * Math.pow(Math.abs(nSizeValue), 1 / 3);
			} else
			if (szFlag.match(/SIZEP4/)) {
				nRadius = nMaxRadius / Math.pow(nSizeMax, 1 / 4) * Math.pow(Math.abs(nSizeValue), 1 / 4);
			} else
			if (szFlag.match(/SIZELOG/)) {
				nRadius = Math.max(20,nMaxRadius / Math.log(nSizeMax) * Math.log(Math.abs(nSizeValue)));
			} else
			if (szFlag.match(/CATEGORICAL/) && !this.szSizeField) {
				nRadius = nMaxRadius / 3 / (this.nNormalSizeValue || 1);
				//nChartSize /= 3;
			} else
			if (szFlag.match(/NOSIZE/)) {
				nRadius = nMaxRadius / 2;
			} else
			if (szFlag.match(/FIXSIZE/)) {
				nRadius = nMaxRadius / 2 / (this.nNormalSizeValue || 1);
			} else
			if (0 && szFlag.match(/ZOOM/)) {
				nRadius = (nMaxRadius * 3 / 3); // GR 15.11.2013  / (szFlag.match(/CATEGORICAL/)?1:(Math.log(nMaxValue) * Math.log(Math.abs(nSizeValue)))); 
			} else
			if (szFlag.match(/NORMSIZE/)) {
				nRadius = (nMaxRadius * 2 / 3) / (szFlag.match(/CATEGORICAL/) ? 1 : (Math.log(nSizeMax) * Math.log(Math.abs(nSizeValue))));
			} else
			if (szFlag.match(/MENUSIZE/) || (szFlag.match(/SUM/) && !a)) {
				nRadius = nMaxRadius * 2 / 3;
			} else {
				nRadius = nMaxRadius / Math.sqrt(nSizeMax) * Math.sqrt(Math.abs(nSizeValue));
			}
		}

		var fDoDraw = true;
		var nClass = null;
		var newShape = null;
		var newShapeBg = null;
		var newShapeBg1 = null;
		var newShapeBg2 = null;
		var newText = null;
		var newTextBg = null;
		var newText2 = null;
		var newText2Bg = null;

		/** 
			!!! try to do this only once in parent function !!!
			---------------------------------------------------
		**/

		var szColor = this.colorScheme[0];
		var szLineColor = this.colorScheme[1] ? this.colorScheme[1] : "none";
		var szTextColor = this.colorScheme[1] ? this.colorScheme[1] : "white";
		if (this.colorScheme.length > 2 || szFlag.match(/CATEGORICAL/)) {
			szColor = this.colorScheme[this.colorScheme.length - 1];
			szLineColor = this.colorScheme[0];
		}
		if (szFlag.match(/NOLINES/)) {
			szLineColor = "none";
		} else
		if (szLineColor == "none") {
			var cColor = __maptheme_getChartColors(szColor);
			szLineColor = cColor.lowColor;
		}

		// GR 26.06.2006 bubbles with colorscheme (classes)
		if (szFlag.match(/CATEGORICAL/)) {
			nClass = nValue - 1;
			szColor = this.colorScheme[nClass] || this.colorScheme[0];

			var cColor = __maptheme_getChartColors(szColor);
			szTextColor = cColor.textColor;
			if (szFlag.match(/NOLINES/)) {
				szLineColor = "none";
			} else {
				szLineColor = cColor.lowColor;
			}
			if (szFlag.match(/RANGE/) && !szFlag.match(/RANGES/)) {
				nRadius = map.Scale.normalX(2 + 5 * (i + 1) / this.partsA.length);
			}
			// value attributes are defined in child nodes
			//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");
			fDoDraw = true;
		} else
		if (this.szFlag.match(/COMPOSECOLOR/)) {

			// ==================================================================
			// color coposed by the single value colors = multivariate choropleth
			// ==================================================================

			if (this.szFlag.match(/SUBTRACTIVE/)) {
				this.itemA[a].szColor = __maptheme_getComposedColor_subtractive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			} else {
				this.itemA[a].szColor = __maptheme_getComposedColor_additive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			}
		} else {
			if (this.colorScheme.length > 2 || (this.szRanges && this.szRanges.length)) {

				fDoDraw = false;

				// GR 15.02.2016 color shows the dominant value of n values
				if (this.szFlag.match(/DOMINANT/)) {

					var nRelevanz = 0;
					var nLastRelevant = 0;

					// search for dominant value above filter 
					nIndex = -1;
					for (i = 0; i < this.itemA[a].nValuesA.length; i++) {
						nValue = this.itemA[a].nValuesA[i];

						var nPercentOfMean = 100 / this.nMeanA[i] * nValue;
						var nPercentOfMedian = 100 / this.nMedianA[i] * nValue;
						var nDeviation = (nValue - this.nMeanA[i]) / this.nDeviationA[i];

						nRelevanz = nValue;
						if (this.szFlag.match(/PERCENTOFMEAN/)) {
							nRelevanz = nPercentOfMean;
						}
						if (this.szFlag.match(/PERCENTOFMEDIAN/)) {
							nRelevanz = nPercentOfMedian;
						}
						if (this.szFlag.match(/DEVIATION/)) {
							nRelevanz = nDeviation;
						}
						if ((nValue > this.nFilterA[i]) && (nRelevanz > nLastRelevant)) {
							// store next best dominant value
							this.itemA[a].nClass = i;
							nLastRelevant = nRelevanz;
							nIndex = i;
						}
					}

					// if we have found a dominant value; 
					if (nIndex >= 0) {
						this.itemA[a].nDominant = nIndex;
						nValue = this.itemA[a].nValuesA[nIndex];

						szLabel = " " + this.szFieldsA[nIndex] + " ";
						if (this.szLabelA && this.szLabelA[nIndex]) {
							szLabel = " " + this.szLabelA[nIndex] + " ";
						}
						// get the color 
						this.itemA[a].nValue = this.itemA[a].nValuesA[nIndex];
						this.itemA[a].szLabel = szLabel;
						szColor = this.colorScheme[nIndex];
						var cColor = __maptheme_getChartColors(szColor);
						szTextColor = cColor.textColor;
						if (szFlag.match(/NOLINES/)) {
							szLineColor = "none";
						} else {
							szLineColor = cColor.lowColor;
						}
						// value attributes are defined in child nodes
						//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");
						nClass = nIndex;
						fDoDraw = true;
					}
				} else

					// ==================================================================
					// color selected by ranges
					// ==================================================================

					for (i = 0; i < this.partsA.length; i++) {
						if ((nValue >= this.partsA[i].min) && (nValue < this.partsA[i].max)) {
							szColor = this.colorScheme[i];
							var cColor = __maptheme_getChartColors(szColor);
							szTextColor = cColor.textColor;
							if (szFlag.match(/NOLINES/)) {
								szLineColor = "none";
							} else {
								szLineColor = cColor.lowColor;
							}
							if (szFlag.match(/RANGE/) && !szFlag.match(/RANGES/)) {
								nRadius = map.Scale.normalX(2 + 5 * (i + 1) / this.partsA.length);
							}
							// value attributes are defined in child nodes
							//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");
							nClass = i;
							fDoDraw = true;
							break;
						}
					}
			}
		}
		
		if (this.itemA[a]){
			this.itemA[a].szColor = szColor;
		}

		/** 
			---------------------------------------------------
		**/

		// GR 25.09.2014 overwrite with defined
		// !! preset textcolor with calcolated linecolor, than evt. overwrite linecolor
		szTextColor = this.szTextColor || szTextColor;
		szLineColor = this.szLineColor || szLineColor;

		if (fDoDraw) {

			var nLineWidth = this.nLineWidth || 0.1;
			if (szFlag.match(/OUTLINE/)) {
				nLineWidth = map.Scale.normalX(Math.min(1, 1 / nMaxRadius * nRadius));
			} else {
				nLineWidth = map.Scale.normalX(nLineWidth / Math.sqrt(nMaxRadius) * Math.sqrt(nRadius));
			}

			if (szFlag.match(/BUBBLE/)) {
				var uTime = null;
				if ( this.szTimeField == "$item$" ){
					uTime = new Date(this.szFieldsA[nIndex].split(" ")[0]).getTime();
				}else if (a) {
					uTime = new Date(this.itemA[a].szTime).getTime();
				}
				if ((szFlag.match(/GLOW/) && !szFlag.match(/ZOOM/)) && this.fGlowInScale) {
					newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 6, "fill:" + szColor + ";stroke:none;fill-opacity:0.05;pointer-events:none;");
					if (newShape) {
						newShape.setAttributeNS(szMapNs, "class", String(nClass));
						newShape.setAttributeNS(szMapNs, "time", uTime);
					}
					newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 2, "fill:" + szColor + ";stroke:none;fill-opacity:0.1;pointer-events:none;");
					if (newShape) {
						newShape.setAttributeNS(szMapNs, "class", String(nClass));
						newShape.setAttributeNS(szMapNs, "time", uTime);
					}
				} else
				if ((szFlag.match(/AURA/) && !szFlag.match(/ZOOM/)) && this.fGlowInScale) {
					newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 1.3, "fill:" + (this.szLineColor || szColor) + ";stroke:none;fill-opacity:0.3;");
					if (newShape) {
						newShape.setAttributeNS(szMapNs, "class", String(nClass));
						newShape.setAttributeNS(szMapNs, "time", uTime);
					}
				}
				newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
			} else
			if (szFlag.match(/SQUARE/)) {
				newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nRadius, nRadius * 2, nRadius * 2, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
			} else
			if (szFlag.match(/TEXTONLY/)) {
				newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -8, nRadius * 2.05, 8, "fill:none;stroke:none;");
			} else
			if (szFlag.match(/LABEL/)) {
				// GR 16.04.2013 needed for label background
				var szText = this.formatValue(nValue, this.nValueDecimals || (((nValue < 1) || (nMaxValue <= 1)) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
				// GR 05.05.2014 make a positive sign, if positive value is result of a diff operation
				if ((nValue === 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/SIGN/))) {
					szText = "+-" + szText;
				}else
				if ((nValue > 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/SIGN/))) {
					szText = "+" + szText;
				}
				var nFontHeight = Math.min(nRadius * 0.8, nRadius * (3.4 / szText.length));
				// -----------------------------------------
				if (!this.fShadow && this.fOrigShadow && (nRadius > map.Scale.normalX(5))) {

					newShape = map.Dom.newShape('rect', shapeGroup, -nRadius + nRadius * 0.02, -nFontHeight * 0.83 + nRadius * 0.02, nRadius * 2.05, nFontHeight * 1.6, "fill:#000000;stroke:none;opacity:" + 0.4 * (this.fillOpacity ? this.fillOpacity : 1));
					if (newShape) {
						newShape.setAttributeNS(null, 'rx', map.Scale.normalX(2 * nRadius / nMaxRadius));
						newShape.setAttributeNS(null, 'ry', map.Scale.normalX(2 * nRadius / nMaxRadius));
					}

					newShape = map.Dom.newShape('rect', shapeGroup, -nRadius + nRadius * 0.03, -nFontHeight * 0.83 + nRadius * 0.03, nRadius * 2.05, nFontHeight * 1.6, "fill:" + szColor + ";stroke:none;opacity:" + 0.2 * (this.fillOpacity ? this.fillOpacity : 1));
					if (newShape) {
						newShape.setAttributeNS(null, 'rx', map.Scale.normalX(2 * nRadius / nMaxRadius));
						newShape.setAttributeNS(null, 'ry', map.Scale.normalX(2 * nRadius / nMaxRadius));
					}
				}
				newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nFontHeight * 0.83, nRadius * 2.05, nFontHeight * 1.6, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
				if (newShape) {
					newShape.setAttributeNS(null, 'rx', map.Scale.normalX(2 * nRadius / nMaxRadius));
					newShape.setAttributeNS(null, 'ry', map.Scale.normalX(2 * nRadius / nMaxRadius));
				}
			}
			if (newShape) {
				if (!szFlag.match(/SILENT/)) {
					if (szFlag.match(/CATEGORICAL/) && this.szLabelA && this.szLabelA[nValue - 1]) {
						newShape.setAttributeNS(szMapNs, "tooltip", this.szLabelA[nValue - 1] + " " + this.szTitle + "");
					} else {
						newShape.setAttributeNS(szMapNs, "tooltip", this.formatValue(nValue, 2) + this.szUnit + " " + this.szTitle + "");
					}
				}
				newText = null;
				if (szFlag.match(/VALUES/) && !this.fHideValues ){
						var szText = null;
					if (this.szValueField && (this.szValueField == "$title$")) {
						szText = this.itemA[a].szTitle;
					} else
					if (this.szValueField && this.itemA[a].szValue) {
						// GR 25.05.2015 explizit value display field
						szText = this.formatValue(__scanValue(this.itemA[a].szValue), this.nValueDecimals || ((this.itemA[a].szValue < 1) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
						if ((nValue === 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+/-" + szText;
						}else
						if ((nValue > 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+" + szText;
						}
					} else
					if (this.szValueField && (this.szValueField == this.szSizeField) && nSizeValue) {
						// GR 25.05.2015 explizit size display field
						szText = this.formatValue(__scanValue(nSizeValue), this.nValueDecimals || ((nSizeValue < 1) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
						if ((nSizeValue === 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+/-" + szText;
						}else
						if ((nSizeValue > 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+" + szText;
						}
					} else
					if (szFlag.match(/CATEGORICAL/) && this.szLabelA) {
						szText = this.szLabelA[nValue - 1] || "?";
					} else {
						szText = this.formatValue(nValue, this.nValueDecimals || (((nValue < 1) || (nMaxValue <= 1)) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
						// GR 05.05.2014 make a positive sign, if positive value is result of a diff operation
						if ((nValue === 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+/-" + szText;
						}else
						if ((nValue > 0) && (this.szFlag.match(/DIFFERENCE/) || this.szFlag.match(/RELATIVE/) || this.szFlag.match(/\bSIGN\b/))) {
							szText = "+" + szText;
						}
					}
					var nFontSize = String(Math.min(nRadius * 0.8, nRadius * (3.3 / szText.length)) * this.nValueScale);
					
					if (szFlag.match(/TEXTONLY/)) {
						var cColor = __maptheme_getChartColors(szColor);
						szTextColor = cColor.textColor;
						nFontSize = String(Math.max(Math.min(nRadius * 0.8, map.Scale.normalX(500)), map.Scale.normalX(2)));
						if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
							if (nFontSize * map.Layer.nDynamicObjectScale < map.Scale.normalX(this.nValueSizeMin)) {
								return null;
							}
						}
						var szFont = this.szTextFont || "arial";
						newTextBg = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:" + szFont + ";font-size:" + nFontSize + "px;font-weight:normal;text-anchor:middle;fill:none;stroke:" + szColor + ";stroke-width:" + nFontSize / 7 + ";stroke-opacity:0.5;pointer-events:none;stroke-linejoin:bevel;", szText);
						newTextBg.setAttributeNS(null, "id", this.szId + ":" + a + ":text:bg");
						newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:" + szFont + ";font-size:" + nFontSize + "px;font-weight:normal;text-anchor:middle;fill:" + (this.szTextColor || "#000000") + ";opacity:" + nOpacity + ";stroke:none;", szText);
						newText.setAttributeNS(null, "id", this.szId + ":" + a + ":text");
						newShape.parentNode.removeChild(newShape);
					} else
					if (szFlag.match(/LABEL/) || (nFontSize > map.Scale.normalX(1))) {
						var nOpacity = this.nValueSizeMin ? (nFontSize / map.Scale.normalX(5)) : 1;
						newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize + "px;font-weight:bold;text-anchor:middle;fill:" + szTextColor + ";opacity:" + nOpacity + ";stroke:none;pointer-events:none", szText);
					}
				}
				if (szFlag.match(/DTEXT/) && a && !szFlag.match(/ZOOM/)) {
					var nTextOpacity = Math.pow(Math.abs(nRadius), 1 / 3) / Math.pow(nMaxRadius, 1 / 3);
					newShape.style.setProperty("fill-opacity", String(nTextOpacity), "");
					newShape.style.setProperty("stroke-opacity", String(nTextOpacity), "");
					if (newText) {
						newText.style.setProperty("fill-opacity", String(nTextOpacity), "");
					}
				} else {
					newShape.style.setProperty("fill-opacity", String(this.fillOpacity ? this.fillOpacity : 1), "");
					if (szFlag.match(/OUTLINE/) || this.szLineColor) {
						newShape.style.setProperty("stroke-opacity", "1", "");
					} else {
						newShape.style.setProperty("stroke-opacity", String((this.fillOpacity && this.fillOpacity < 0.5) ? 1 : 0.3), "");
					}
				}
			}

			// define value and class, if set 
			//
			if (nClass != null) {
				if (newShape) {
					newShape.setAttributeNS(szMapNs, "value", String(nValue));
					newShape.setAttributeNS(szMapNs, "class", String(nClass));
				}
				if (newText) {
					newText.setAttributeNS(szMapNs, "value", String(nValue));
					newText.setAttributeNS(szMapNs, "class", String(nClass));
				}
				if (newTextBg) {
					newTextBg.setAttributeNS(szMapNs, "value", String(nValue));
					newTextBg.setAttributeNS(szMapNs, "class", String(nClass));
				}
			}
			
			// make time stamp
			// -----------------
			if ( this.szTimeField ){
				var uTime = null;
				if ( this.szTimeField == "$item$" ){
					uTime = new Date(this.szFieldsA[nIndex].split(" ")[0]).getTime();
				}else{
					uTime = new Date(this.itemA[a].szTime).getTime();
				}
				if (newShape) {
					newShape.setAttributeNS(szMapNs, "time", uTime);
				}
				if (newText) {
					newText.setAttributeNS(szMapNs, "time", uTime);
				}
				if (newTextBg) {
					newTextBg.setAttributeNS(szMapNs, "time", uTime);
				}
			}
			
			
			
			nChartSize = nRadius * 2 / map.Scale.normalX(1);
			ptNull.x = 0;
			ptNull.y = szFlag.match(/TEXTONLY/) ? (nRadius) : (nRadius + map.Scale.normalY(5));

			this.nRealizedCount++;
		} else {
			this.nMissingRangeCount++;
			return null;
		}
	}

	// == SYMBOL ================================================================================
	else if (szFlag.match(/SYMBOL/)) {

		// symbol with box ?
		// -------------------------
		if (typeof (this.szSymbolBoxStyle) != 'undefined') {

			var szLineColor = "#dddddd";
			if (typeof (this.szBorderColor) != 'undefined') {
				szLineColor = this.szBorderColor;
			}
			var szLineStyle = "stroke-width:0;";
			if (typeof (this.szBorderStyle) != 'undefined') {
				switch (this.szBorderStyle) {
					case "dotted":
						szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:round;stroke-dasharray:1,50;";
						break;
					case "dashed":
						szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";stroke-linecap:butt;stroke-dasharray:30,30;";
						break;
					case "solid":
						szLineStyle = "stroke-width:" + map.Scale.normalX(1.0) + ";";
						break;
					case "none":
						szLineStyle = "stroke-width:0;";
						break;
				}
			}
			var newFrame = map.Dom.newShape('rect', shapeGroup, 0, 0, 1, 1, "fill:white;stroke:" + szLineColor + ";" + szLineStyle);
			switch (this.szSymbolBoxStyle) {
				case "frame":
					newFrame.setAttributeNS(null, "fill-opacity", 0);
					break;
				case "field":
					newFrame.setAttributeNS(null, "fill-opacity", 1);
					break;
			}
		}

		// check symbols definition, if not, create it
		// -------------------------------------------
		if (!this.szSymbolsA) {
			this.szSymbolsA = [];
			for (i = 0; i < nPartsA.length; i++) {
				this.szSymbolsA.push("circle");
			}
		} else
		if ((this.szSymbolsA.length < nPartsA.length)) {
			for (i = this.szSymbolsA.length; i < nPartsA.length; i++) {
				this.szSymbolsA.push(this.szSymbolsA[this.szSymbolsA.length - 1]);
			}
		}

		// value attributes are defined in child nodes
		//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");

		// group to host text value
		// ---------------------------
		var shapeTextGroup = null;
		if (szFlag.match(/VALUES|AXIS/)) {
			shapeTextGroup = map.Dom.newGroup(shapeGroup, this.szId + ":" + a + ":textgroup");
		}

		this.initAngle = 0;

		// sort by value, if flags set
		// ---------------------------
		if (szFlag.match(/\bSORT\b/)) {
			if (szFlag.match(/\bBYMEAN\b/)) {
				this.sortedIndex = [];
				this.sortedMax = 0;
				for (i = 0; i < nPartsA.length; i++) {
					this.sortedIndex[i] = {
						index: i,
						value: nPartsA[i],
						tvalue: nPartsA[i],
						mean: this.nMeanA[i]
					};
					this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
				}
				this.sortedIndex.sort(this.sortMeanUp);
				this.initAngle = 0;
			} else
			if (szFlag.match(/\bBYMEDIAN\b/)) {
				this.sortedIndex = [];
				this.sortedMax = 0;
				for (i = 0; i < nPartsA.length; i++) {
					this.sortedIndex[i] = {
						index: i,
						value: nPartsA[i],
						tvalue: nPartsA[i],
						mean: this.nMedianA[i]
					};
					this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
				}
				this.sortedIndex.sort(this.sortMeanUp);
				this.initAngle = 0;
			} else
			if (szFlag.match(/\bUP\b/)) {
				this.sortedIndex = [];
				this.sortedMax = 0;
				for (i = 0; i < nPartsA.length; i++) {
					this.sortedIndex[i] = {
						index: i,
						value: nPartsA[i],
						tvalue: nPartsA[i]
					};
					this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
				}
				this.sortedIndex.sort(this.sortIndexUp);
				this.initAngle = 0;
			} else
			if (szFlag.match(/\bDOWN\b/)) {
				this.sortedIndex = [];
				this.sortedMax = 0;
				for (i = 0; i < nPartsA.length; i++) {
					this.sortedIndex[i] = {
						index: i,
						value: nPartsA[i],
						tvalue: nPartsA[i]
					};
					this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
				}
				this.sortedIndex.sort(this.sortIndexDown);
				this.initAngle = 0;
			} else
			if (szFlag.match(/\bRANDOM\b/)) {
				this.sortedIndex = [];
				this.sortedMax = 0;

				if (this.nClipParts && (this.nClipParts < nPartsA.length)) {
					var tempIndex = [];
					for (i = 0; i < nPartsA.length; i++) {
						tempIndex[i] = {
							index: i,
							value: nPartsA[i],
							tvalue: nPartsA[i]
						};
					}
					tempIndex.sort(this.sortIndexDown);
					for (i = 0; i < this.nClipParts; i++) {
						var sI = tempIndex[i].index;
						this.sortedIndex[i] = {
							index: sI,
							value: nPartsA[sI],
							tvalue: nPartsA[sI]
						};
						this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
					}
				} else {
					for (i = 0; i < nPartsA.length; i++) {
						this.sortedIndex[i] = {
							index: i,
							value: nPartsA[i],
							tvalue: nPartsA[i]
						};
						this.sortedMax = Math.max(this.sortedMax, nPartsA[i]);
					}
				}
				if (a) {
					if (!this.itemA[a].randomA) {
						this.itemA[a].randomA = this.getRandomNumberArray(nPartsA.length + 1);
					}
					this.shuffleArray(this.sortedIndex, this.itemA[a].randomA);
					this.initAngle = Math.floor(this.itemA[a].randomA[0] * 360);
				} else {
					this.initAngle = 0;
				}
			}
		} else {
			this.sortedIndex = null;
		}
		if (szFlag.match(/RINGS/)) {
			if (this.sortedIndex) {
				var dValue = 0;
				for (i = 0; i < this.sortedIndex.length; i++) {
					if (this.sortedIndex[i].value) {
						this.sortedIndex[i].value += dValue;
						dValue = this.sortedIndex[i].value;
					}
				}
				this.sortedIndex.sort(this.sortIndexDown);
			} else {
				var dValue = 0;
				this.sortedIndex = [];
				for (i = 0; i < nPartsA.length; i++) {
					this.sortedIndex[i] = {
						index: i,
						value: nPartsA[i],
						tvalue: nPartsA[i]
					};
					if (this.sortedIndex[i].value) {
						this.sortedIndex[i].value += dValue;
						dValue = this.sortedIndex[i].value;
					}
				}
				this.sortedIndex.sort(this.sortIndexDown);
			}
		}
		// --------------------------- end sort
		
		
		// smooth by rolling average
		// ---------------------------
		if (szFlag.match(/\bSMOOTH\b/)) {
			var ra = 3;
			for (i = nPartsA.length-1; i >= ra-1; i--) {
				for ( r=1; r<ra; r++ ){
					nPartsA[i] += nPartsA[i-r];
				}
				nPartsA[i] /= ra;
			}
		}
		
		// create linear regression
		// ---------------------------
		if (szFlag.match(/\bLINREG\b/)) {
			var xsum = 0;
			var ysum = 0;
			for (i = 0; i<nPartsA.length; i++) {
				xsum += i;
				ysum += nPartsA[i];
			}
			var xmean = xsum / nPartsA.length;
			var ymean = ysum / nPartsA.length;
			
			var num = 0;
			var denom = 0;
			for (var i = 0; i < nPartsA.length; i ++) {
				var x =i;
				var y = nPartsA[i];
				num += (x - xmean) * (y - ymean);
				denom += (x - xmean) * (x - xmean);
			}
			var linreg_m = num / denom;
			var linreg_b = ymean - (linreg_m * xmean);
		}
		
		var topShape = null;
		var topText = null;
		var topText2 = null;
		var topGrid = null;

		var nClass = 0;
		var szTooltip = "";

		var nSymbols = 0;
		var nSymbolOffsetX = 0;
		var nSymbolOffsetY = 0;

		var nStarRadius = 0;
		var nAllMaxValue = (-Number.MAX_VALUE);
		var nAllMinValue = Number.MAX_VALUE;
		var nChartMaxValue = 0;
		var nNonZeroValues = 0;
		var nNonZeroValuesDone = 0;

		var fPlotInit = false;
		var nPLastValue = 0;
		
		// GR 21.02.2014 enable parts clipping
		var nStartI = 0;
		var nMaxI = nPartsA.length;
		if (this.nClipParts && (this.nClipParts < nPartsA.length)) {
			if (szFlag.match(/\bUP\b/)) {
				nStartI = nPartsA.length - this.nClipParts;
			} else {
				nMaxI = this.nClipParts;
			}
		}

		// GR 15.02.2016 DOMINANT or PERCENTOFMEAN
		// ---------------------------------------
		// special case of symbol color	
		// color represents the dominant value (out of n <=> colorscheme values)
		// implemented by selecting the right part of the symbol sequence
		if (this.szFlag.match(/DOMINANT/)) {

			var nRelevanz = 0;
			var nLastRelevant = 0;

			// search for dominant value above filter 
			var nnIndex = -1;
			for (i = 0; i < this.itemA[a].nValuesA.length; i++) {
				var nValue = this.itemA[a].nValuesA[i];

				var nPercentOfMean = 100 / this.nMeanA[i] * nValue;
				var nPercentOfMedian = 100 / this.nMedianA[i] * nValue;
				var nDeviation = (nValue - (this.nMeanA[i] || 0)) / this.nDeviationA[i];

				nRelevanz = nValue;
				if (this.szFlag.match(/PERCENTOFMEAN/)) {
					nRelevanz = nPercentOfMean;
				}
				if (this.szFlag.match(/PERCENTOFMEDIAN/)) {
					nRelevanz = nPercentOfMedian;
				}
				if (this.szFlag.match(/DEVIATION/)) {
					nRelevanz = nDeviation;
				}
				if ((nValue > (this.nFilterA[i] || 0)) && (nRelevanz > nLastRelevant)) {

					this.itemA[a].nClass = i;
					nLastRelevant = nRelevanz;
					nnIndex = i;
				}
			}

			// if we have found a dominant value, set the nStartI and nMaxI to select it
			if (nnIndex >= 0) {
				this.itemA[a].nDominant = nnIndex;
				nStartI = nnIndex;
				nMaxI = nStartI + 1;
				nClass = nnIndex;
			}
		} else

		if (this.szFlag.match(/COMPOSECOLOR/)) {

			// ==================================================================
			// color coposed by the single value colors = multivariate choropleth
			// ==================================================================

			if (this.szFlag.match(/SUBTRACTIVE/)) {
				this.itemA[a].szColor = __maptheme_getComposedColor_subtractive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			} else {
				this.itemA[a].szColor = __maptheme_getComposedColor_additive(this.itemA[a].nValuesA, this.colorScheme, this.nMax, Math.floor(this.nBrightness * 255));
			}
		}

		// GR 04.01.2021 SYMBOLS and CLIP
		// ---------------------------------------
		if (this.szFlag.match(/\bCLIP\b/)) {
			nMaxI = nStartI+1;
		}
		
		// ----------------------------------------------------

		// get some info about the chart parts
		for (i = nStartI; i < nMaxI; i++) {
			nNonZeroValues += (nPartsA[i] !== 0);
			nAllMaxValue = Math.max(nAllMaxValue || this.nMaxA[i], this.nMaxA[i]);
			nAllMinValue = Math.min(nAllMinValue || this.nMinA[i], this.nMinA[i]);
			nChartMaxValue = Math.max(nChartMaxValue, nPartsA[i]);
		}
		// for stacked charts get stacked max
		if ( this.szFlag.match(/STACKED/) && this.nGridX ){
 			for (i = nStartI; i < nMaxI; ) {
				var nStacked = 0;
				for ( var ii=0; ii<this.nGridX; ii++ ){
					nStacked += nPartsA[i++];
				}
				nChartMaxValue = Math.max(nChartMaxValue,nStacked);
			}
		}
		
		// GR 21.09.2016 valuate 'biggest' text of theme to decide font-size
		var nAllMaxValueText = Math.max(nAllMaxValue, this.nMax);
		var szMaxText = this.formatValue(nAllMaxValueText, this.nValueDecimals || "") + (this.szUnit.length <= 5 ? this.szUnit : "");
		
		// --------------------------------------------------------
		// draw the chart parts ( n symbols )
		// --------------------------------------------------------
		
		var tStackValue = 0;

		for (i = nStartI; i < nMaxI; i++) {
			
			var nIndex = i;
			var nValue = nPartsA[nIndex];
			var tValue = nPartsA[nIndex];
			if (szFlag.match(/COUNT/) && this.itemA[a].nCountA){
				tValue = this.itemA[a].nCountA[nIndex];
			}
			
			if (this.sortedIndex) {
				nValue = this.sortedIndex[nIndex].value;
				tValue = this.sortedIndex[nIndex].tvalue;
				nIndex = this.sortedIndex[nIndex].index;
			}
			
			if (this.szValueField && this.itemA[a] && (this.szValueField == "$title$")) {
				tValue = this.itemA[a].szTitle;
			} else
			if (this.szValueField && this.itemA[a] && this.itemA[a].szValue ) {
				// GR 25.05.2015 explizit value display field, take it as is
				tValue = isNaN(this.itemA[a].szValue)?this.itemA[a].szValue:__scanValue(this.itemA[a].szValue);
			} else
			if ( !szFlag.match(/SEQUENCE|CATEGORICAL/) && this.szSizeField && this.itemA[a] && this.itemA[a].nSize ) {
				tValue = this.itemA[a].nSize || tValue;
			} 

			if (this.szShowParts) {
				var skipIt = true;
				for (p in this.szShowPartsA) {
					if (this.szShowPartsA[p] == nIndex % (this.nGridX || 1000000)) {
						skipIt = false;
					}
				}
				if (skipIt) {
					continue;
				}
			}

			if (szFlag.match(/ZOOM/) && this.markedClasses) {
				if (!this.markedClasses[nIndex]) {
					continue;
				}
			}

			// preset color class with chart part index 
			nClass = nIndex;
			if (this.nGridX && szFlag.match(/PLOT/)) {
				nClass %= this.nGridX;
			}
			// make stack value
			if (szFlag.match(/STACKED/)) {
				if (nClass == 0){
					tStackValue = 0;
				}
				tValue += tStackValue;
				tStackValue = tValue;
			}

			// make tooltip text
			// -----------------
			if ((szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) && this.szLabelA) {
				var szValue = this.formatValue(tValue, ((tValue < 1) ? 2 : 0));
				szTooltip = szValue + this.szUnit;
				szTooltip += " " + this.szLabelA[nIndex % (this.nGridX || 10000000)];
				if ( 0 && this.szXaxisA && this.szXaxisA.length) {
					szTooltip += " (" + this.szXaxisA[Math.floor(nIndex / (this.nGridX || 1))] + ")";
				}
			} else {
				var szValue = this.formatValue(tValue, 2);
				szTooltip = " " + szValue + this.szUnit;
			}
			
			var uTime = null;
			// make time stamp
			// -----------------
			if ( this.szTimeField ){
				if ( this.szTimeField == "$item$" ){
					uTime = new Date(this.szFieldsA[nIndex].split(" ")[0]).getTime();
				}else{
					uTime = new Date(this.itemA[a].szTime).getTime();
				}
			}

			// a) symbol equals value
			// ----------------------
			if (szFlag.match(/CATEGORICAL/) && !(szFlag.match(/AGGREGATE/) || szFlag.match(/GROUP/))) {
				var szSymbol = "";
				if (this.nRangesA && this.nRangesA.length) {
					for (ii = 0; ii < this.nRangesA.length; ii++) {
						if ((nValue == this.nRangesA[ii]) || (Number(nValue) == Number(this.nRangesA[ii]))) {
							szSymbol = this.szSymbolsA[ii] || this.szSymbolsA[0] || "circle";
							nClass = ii;
							break;
						}
					}
				}

				// if symbol is defined explicitly by symbol field, than take this 
				szSymbol = this.itemA[a].szSymbol || szSymbol;

				var szTooltip = String(nValue);
				var szLabel = String(nValue);

				if (this.szLabelA && this.szLabelA[nClass]) {
					szTooltip = this.szLabelA[nClass];
					szLabel = this.szLabelA[nClass];
				}

				if (!szSymbol.length && nIndex === 0) {
					szSymbol = "empty";
					szTooltip = szLabel = "no data";
					nClass = 0;
				}
				if (szSymbol.length) {
					nSymbols++;
					var newShape = null;

					// check explizit defined color values 
					nClass = (typeof (this.itemA[a].nClass) != "undefined") ? this.itemA[a].nClass : nClass;
					szColor = (typeof (this.itemA[a].szColor) != "undefined") ? this.itemA[a].szColor : this.colorScheme[nClass];

					if (szFlag.match(/NOLINES/)) {
						szLineColor = "none";
					} else {
						szLineColor = this.itemA[a].szColor || this.colorScheme[nClass];
						if (szColor == "white" || szColor == "#ffffff") {
							szLineColor = "gray";
						}
					}
					szLineColor = this.szLineColor || szLineColor;

					var nRadius = map.Scale.normalX(nChartSize / 2);

					// GR 01.07.2023 redesign size handling
					if (szFlag.match(/FIXSIZE/)) {
						nRadius = map.Scale.normalX(nChartSize / 2) / (this.nNormalSizeValue || 1);
					} else
					if (szFlag.match(/NOSIZE/)) {
						nRadius = map.Scale.normalX(nChartSize / 2);
					} else
					if (a && this.itemA[a] && this.itemA[a].nSize) {
						if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
							nRadius = nRadius / (this.nNormalSizeValue || this.nMaxSize) * this.itemA[a].nSize;
						} else 
						if (szFlag.match(/SIZELOG/)) {
							nRadius = Math.max(1, nRadius / Math.log(this.nNormalSizeValue || this.nMaxSize) * Math.log(this.itemA[a].nSize));
						} else
						if (szFlag.match(/SIZEP10/)) {
							nRadius = nRadius / Math.pow(this.nNormalSizeValue || this.nMaxSize, 1 / 10) * Math.pow(this.itemA[a].nSize, 1 / 10);
						} else
						if (szFlag.match(/SIZEP4/)) {
							nRadius = nRadius / Math.pow(this.nNormalSizeValue || this.nMaxSize, 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
						} else
						if (szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
							nRadius = nRadius / Math.pow(this.nNormalSizeValue || this.nMaxSize, 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
						} else {
							nRadius = nRadius / Math.sqrt(this.nNormalSizeValue || this.nMaxSize) * Math.sqrt(this.itemA[a].nSize);
						}
					}
					
					if (szSymbol == "circle" || szSymbol == "square" || szSymbol == "roundrect" || szSymbol == "label" || szSymbol == "carot" || szSymbol == "diamond" || szSymbol == "triangle" || szSymbol == "hexagon" || szSymbol == "cross" || szSymbol == "empty") {
						
						var nMaxRadius = map.Scale.normalX(nChartSize / 2);
						var nLineWidth = (this.nLineWidth || 1) * map.Scale.normalX(Math.min(nRadius / nMaxRadius, 1));
						switch (szSymbol) {
							case "empty":
								newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "fill:#888888;fill-opacity:0;stroke:#888888;stroke-width:" + nLineWidth + ";");
								break;
							case "circle":
								newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
							case "square":
								newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 0.8, -nRadius * 0.8, nRadius * 2 * 0.8, nRadius * 2 * 0.8, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
							case "roundrect":
								newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 0.8, -nRadius * 0.8, nRadius * 2 * 0.8, nRadius * 2 * 0.8, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								newShape.setAttributeNS(null, "rx", nRadius * 0.3);
								break;
							case "cross":
								var A = nRadius * 0.4;
								var B = nRadius * 0.8;
								newShape = map.Dom.newShape('path', shapeGroup, "M 0,-" + (B + A / 2) + " l" + (A / 2) + ",0 0," + B + " " + B + ",0 0," + A + " -" + B + ",0 0," + B + " -" + A + ",0 0,-" + B + " -" + B + ",0 0,-" + A + " " + B + ",0 0,-" + B + " " + A / 2 + ",0 z", "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
							case "diamond":
							case "carot":
								newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 0.8, -nRadius * 0.8, nRadius * 2 * 0.8, nRadius * 2 * 0.8, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								if (newShape) {
									newShape.setAttributeNS(null, "transform", "rotate(45)");
								}
								break;
							case "triangle":
								newShape = map.Dom.newShape('path', shapeGroup, "M 0," + nRadius + " l" + nRadius * 1.2 + ",-" + nRadius * 2 + " -" + nRadius * 2.4 + ",0 " + nRadius * 1.2 + "," + nRadius * 2 + "z", "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
							case "hexagon":
								var A = nRadius / 2;
								var B = nRadius * Math.sin(60 / 180 * Math.PI);
								var C = nRadius;
								newShape = map.Dom.newShape('path', shapeGroup, "M -" + nRadius + "," + 0 + " l " + A + ",-" + B + " " + C + "," + 0 + " " + A + "," + B + " -" + A + "," + B + " -" + C + "," + 0 + " -" + A + ",-" + B + " z", "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
							case "label":
								var nLabelHeight = nRadius * 2 * 0.4;
								newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 0.8, -nRadius * 0.4, nRadius * 2 * 0.8, nRadius * 2 * 0.4, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								break;
						}
						if (!newShape) {
							continue;
						}
						if (szFlag.match(/HORZ/)) {
							if (szFlag.match(/LEFT/)) {
								nIndex = -nIndex;
							}
							if (szFlag.match(/VALUES/)) {
								var cColor = __maptheme_getChartColors(szColor);
								szLineColor = cColor.textColor;
								var newText = map.Dom.newText(shapeTextGroup, 0, 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(nRadius / 2) + "px;text-anchor:start;baseline-shift:-90%;fill:" + "#bbbbbb" + ";stroke:none;pointer-events:none", szLabel);
								newText.fu.setPosition(nIndex * nRadius * 2, -nRadius - map.Scale.normalX(5));
								if (nPartsA.length > 1) {
									setRotate(newText, -45);
								}
							}
							if (szFlag.match(/AXIS/) && this.szXaxisA && (!this.fHideValues || szFlag.match(/ZOOM/))) {
								var cColor = __maptheme_getChartColors(szColor);
								szLineColor = cColor.textColor;
								var szAxisText = this.szXaxisA[i];
								var newText = map.Dom.newText(shapeTextGroup, 0, 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(nRadius) + "px;text-anchor:start;baseline-shift:-90%;fill:" + "#bbbbbb" + ";stroke:none;pointer-events:none", szAxisText);
								newText.fu.setPosition(nIndex * nRadius * 2 + map.Scale.normalX(2), nRadius + map.Scale.normalX(1));
								if (nPartsA.length > 1) {
									setRotate(newText, 45);
								}
							}
							newShape.setAttributeNS(szMapNs, "tooltip", szTooltip);
							newShape.fu.setPosition(nIndex * nRadius * 2, 0);
							if (szFlag.match(/LEFT/)) {
								nIndex = -nIndex;
							}
						} else {
							if (szFlag.match(/VALUES/) && (!this.fHideValues || szFlag.match(/ZOOM/))) {
								
								var cColor = __maptheme_getChartColors(szColor);
								var szTextColor = this.szTextColor || cColor.textColor;
								var szMaxTextLength = Math.max((tValue.length || 0) + 1, szMaxText.length);
								if( szFlag.match(/INLINETEXT/) ){
									var szText = this.formatValue(tValue, this.nValueDecimals || (((tValue < 1) || (nMaxValue <= 1)) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
									var nFontSize = String(Math.min(nMaxRadius * 1, nMaxRadius * (((szSymbol == "hexagon") ? 2.7 : 3.2) / szMaxTextLength)));
									nFontSize *= nRadius / nMaxRadius * this.nValueScale;
									var newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";stroke:none;pointer-events:none", szText);
								}else{
									var cColor = __maptheme_getChartColors(szColor);
									szLineColor = cColor.textColor;
									var szText = this.formatValue(tValue, this.nValueDecimals || (((tValue < 1) || (nMaxValue <= 1)) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
									var newText = map.Dom.newText(shapeTextGroup, 0, 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(nRadius/2*this.nValueScale) + "px;text-anchor:start;baseline-shift:-45%;fill:" + "#bbbbbb" + ";stroke:none;pointer-events:none", szText);
									newText.fu.setPosition(nRadius + map.Scale.normalX(3), -nIndex * (nRadius * 2 - map.Scale.normalY(0)));
								}
							}
							newShape.setAttributeNS(szMapNs, "tooltip", szTooltip);
							newShape.fu.setPosition(0, -nIndex * (nRadius * 2 - map.Scale.normalY(0)));
						}

						// set opacity
						// -----------
						if (szFlag.match(/OUTLINE/)) {
							newShape.style.setProperty("stroke-width", String(map.Scale.normalX(0.5)));
							newShape.style.setProperty("stroke-opacity", "1");
							newShape.style.setProperty("fill-opacity", "0.7");
						} else
						if (szFlag.match(/DOPACITY/) && this.szAlphaField) {
							if (a && (typeof (this.itemA[a].nAlpha) != "undefined")) {
								var nPow = 1 / (this.nDopacityPow || 1);
								var nOpacity = (this.nDopacityScale || 1) / Math.pow(this.nMaxAlpha, nPow) * Math.pow(this.itemA[a].nAlpha, nPow);
								newShape.style.setProperty("fill-opacity", String(nOpacity), "");
							}
						} else {
							newShape.style.setProperty("fill-opacity", String(this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 1)), "");
						}

					} else {
						//var nRadius = map.Scale.normalX(nChartSize * 0.4);
						
						if (szSymbol.match(/.svg|.png|.jpeg/)){
							// GR 29.11.2020 external SVG symbols given by SVG file realized with <image> tag
							newShape = map.Dom.constructNode('image', shapeGroup, {
								'xlink:href': szSymbol
							});
							newShape.setAttributeNS(null,"x",String(map.Scale.normalX(-nChartSize/2)));
							newShape.setAttributeNS(null,"y",String(map.Scale.normalY(-nChartSize)));
							newShape.setAttributeNS(null,"width",String(map.Scale.normalX(nChartSize)));
							newShape.setAttributeNS(null,"height",String(map.Scale.normalY(nChartSize)));
						}else{
							newShape = map.Dom.constructNode('use', shapeGroup, {
								'xlink:href': '#' + szSymbol + ":antizoomandpan"
							});
						}
						newShape.setAttributeNS(null, "style", "fill:" + szColor + ";stroke:" + szLineColor);
						// GR 20.04.2011 explicit size field
						if (this.szSizeField && a && this.itemA[a]) {
							var nScale = 1 / Math.sqrt(this.nMaxSize) * Math.sqrt(this.itemA[a].nSize);
							newShape.fu.scale(nScale, nScale);
						}
						newShape.fu.scale(nRadius/nChartSize, nRadius/nChartSize);
						
						newShape.fu.setPosition(map.Scale.normalX(0) + nIndex * map.Scale.normalX(20), map.Scale.normalY(0));
						if (nIndex > 0) {
							map.Dom.newText(shapeGroup, map.Scale.normalX(-9) + nIndex * map.Scale.normalX(20), 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(360) + "px;text-anchor:middle;baseline-shift:-50%;fill:none;stroke:black;stroke-width:60;pointer-events:none;opacity:0.3;", "+");
							map.Dom.newText(shapeGroup, map.Scale.normalX(-9) + nIndex * map.Scale.normalX(20), 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(360) + "px;text-anchor:middle;baseline-shift:-50%;fill:white;stroke:none;pointer-events:none;opacity:0.8;", "+");
						}
						if (szFlag.match(/VALUES/)) {
							var cColor = __maptheme_getChartColors(szColor);
							szLineColor = cColor.textColor;
							var newText = map.Dom.newText(shapeTextGroup, 0, 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(nRadius / 2) + "px;text-anchor:start;baseline-shift:-45%;fill:" + "#bbbbbb" + ";stroke:none;pointer-events:none", szLabel);
							newText.fu.setPosition(nRadius / 2 + map.Scale.normalX(3), -nIndex * (nRadius * 2));
							if (szFlag.match(/MULTILINE/) && this.szSizeField && a && this.itemA[a]) {
								newText = map.Dom.newText(shapeTextGroup, 0, 0, "font-family:"+(this.szTextFont||"arial")+";font-size:" + String(nRadius / 2) + "px;text-anchor:start;baseline-shift:-45%;fill:" + "#bbbbbb" + ";stroke:none;pointer-events:none", String(this.itemA[a].nSize) + this.szSizeValueUnits);
								newText.fu.setPosition(nRadius / 2 + map.Scale.normalX(3), -nIndex * (nRadius * 2) + (nRadius / 2));
							}
						}
					}
					newShape.setAttributeNS(szMapNs, "value", String(nValue));
					newShape.setAttributeNS(szMapNs, "class", String(nClass));
					newShape.setAttributeNS(szMapNs, "time", String(uTime));
					this.nRealizedCount++;
				} else {
					this.nMissingRangeCount++;
				}
			}
			// b) symbolsize equals value
			// --------------------------
			else {
				var nMaxRadius = map.Scale.normalX(nChartSize / 2);
				var nMaxValue = this.nNormalSizeValue || nAllMaxValue;

				if (szFlag.match(/MENUSIZE/)) {
					nMaxValue = nChartMaxValue * 5;
				} else
				if (this.nNormalSizeValue && !(szFlag.match(/SEQUENCE/) && this.szSizeField)) {
					nMaxValue = this.nNormalSizeValue;
					this.nMaxSize = this.nNormalSizeValue;
				}
				if (nChartMaxValue && szFlag.match(/ZOOM/) && szFlag.match(/SEQUENCE/)) {
					nMaxValue = nChartMaxValue / 2 + nChartMaxValue / 2 * Math.pow(nMaxValue, 1 / 2) / Math.pow(nChartMaxValue, 1 / 2);
				}
				if (szFlag.match(/INVERTSIZE/)) {
					if (((nMaxValue - nValue) === 0) && !(szFlag.match(/ZEROISVALUE/))) {
						return null;
					}
				}
				// GR 07.04.2009 theme like a video clip, every part is like a frame 
				if (this.szFlag.match(/\bCLIP\b/) && !this.szFlag.match(/MORPH/) && this.nClipFrames) {
					if ((this.nClipFrames == nPartsA.length)) {
						nValue = Number(nPartsA[this.nActualFrame]);
					} else {
						nValue = nPartsA[nIndex] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + nPartsA[nPartsA.length - 1] * this.nActualFrame / (this.nClipFrames - 1);
					}
					tValue = nValue;
				}

				// GR 22.07.2017 no value -> no chart part
				// exception PLOT - there we need zero symbols!
				if (!nValue && !szFlag.match(/PLOT|NOSIZE/)) {
					continue;
				}

				// calc symbol size (nRadius)
				// ---------------------------

				var nRadius = 0;

				if (szFlag.match(/AUTOSIZE/)) {
					var nDynScale = map.Layer.nDynamicObjectScale;
					var nAutoSize = szFlag.match(/\bRECT\b/) ? (szFlag.match(/GAP/) ? 2.3 : 2.0) : (szFlag.match(/GAP/) ? 1.6 : 1.5);
					nMaxValue = Math.max(nAllMaxValue, this.nMax);
					if (this.nGridWidthPx) {
						nMaxRadius = map.Scale.normalX(this.nGridWidthPx) / nAutoSize / nDynScale;
					} else {
						nMaxRadius = this.nGridWidth ? (map.Scale.getDeltaXofDistanceInMeter(this.nGridWidth) / nAutoSize / nDynScale) : nMaxRadius;
					}
				}

				if (szFlag.match(/GRIDSIZE/) && !szFlag.match(/PLOT/)) {
					nRadius = this.nGridSize / 2;
				} else
				if (szFlag.match(/NOSIZE/)) {
					nRadius = map.Scale.normalX(nChartSize / 3);
				} else
				if (szFlag.match(/FIXSIZE/)) {
					nRadius = map.Scale.normalX(nChartSize / 3) / (this.nNormalSizeValue || 1);
				} else
				if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
					nRadius = nMaxRadius / nMaxValue * nValue;
				} else {
					if (szFlag.match(/SIZELOG/)) {
						nRadius = Math.max(1,nMaxRadius / Math.log(nMaxValue) * Math.log(nValue));
					} else
					if (szFlag.match(/SIZEP10/)) {
						nRadius = nMaxRadius / Math.pow(nMaxValue, 1 / 10) * Math.pow(nValue, 1 / 10);
					} else
					if (szFlag.match(/SIZEP4/)) {
						nRadius = nMaxRadius / Math.pow(nMaxValue, 1 / 4) * Math.pow(nValue, 1 / 4);
					} else
					if (szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
						nRadius = nMaxRadius / Math.pow(nMaxValue, 1 / 3) * Math.pow(nValue, 1 / 3);
					} else {
						nRadius = nMaxRadius / Math.sqrt(nMaxValue) * Math.sqrt(nValue);
					}
				}

				if (szFlag.match(/SEQUENCE/)) {

					// special size fot MENU and ZOOM

					if (szFlag.match(/MENUSIZE/) || (szFlag.match(/SUM/) && !a)) {
						nRadius *= this.szField100 ? 1 : 2;
					} else
					if (szFlag.match(/ZOOM/) && !szFlag.match(/PLOT/)) {
						nRadius *= 2;
					}

					// GR 03.09.2007 explicit size field
					// GR 05.02.2016 only for not AGGREGATE, which have 
					// symbol size from value, but chart size from sizefield
					else
					if (!(szFlag.match(/AGGREGATE/) && szFlag.match(/CATEGORICAL/)) && this.szSizeField && a && this.itemA[a]) {

						if (szFlag.match(/SIZELOG/)) {
							nRadius = Math.max(1,nRadius / Math.log(this.nMaxSize) * Math.log(this.itemA[a].nSize));
						} else
						if (szFlag.match(/SIZEP4/)) {
							nRadius = nRadius / Math.pow(this.nMaxSize, 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
						} else
						if (szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
							nRadius = nRadius / Math.pow(this.nMaxSize, 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
						} else {
							nRadius = nRadius / Math.sqrt(this.nMaxSize) * Math.sqrt(this.itemA[a].nSize);
						}
					}
				} else {

					// special size for MENU and ZOOM

					if (szFlag.match(/MENUSIZE/) || (szFlag.match(/SUM/) && !a)) {
						nRadius = nMaxRadius * 1.5;
					} else
					if (szFlag.match(/ZOOM/) && !szFlag.match(/PLOT/)) {
						nRadius = Math.max(nRadius, nMaxRadius * 2 / 3);
					} else
					if (szFlag.match(/NOSIZE/)) {
						nRadius = nMaxRadius / 5;
					}
					// GR 03.09.2007 explicit size field
					else
					if (!szFlag.match(/GRIDSIZE/) && this.szSizeField && a && this.itemA[a]) {
						
						if (szFlag.match(/LINEAR|SIZEP1/)) {
							nRadius = nMaxRadius / this.nMaxSize * this.itemA[a].nSize;
						} else
						if (szFlag.match(/SIZELOG/)) {
							nRadius = Math.max(1,nMaxRadius / Math.log(this.nMaxSize) * Math.log(this.itemA[a].nSize));
						} else
						if (szFlag.match(/SIZEP4/)) {
							nRadius = nMaxRadius / Math.pow(this.nMaxSize, 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
						} else
						if (szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
							nRadius = nMaxRadius / Math.pow(this.nMaxSize, 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
						} else {
							nRadius = nMaxRadius / Math.sqrt(this.nMaxSize) * Math.sqrt(this.itemA[a].nSize);
						}
						
						if (szFlag.match(/PLOTXY/)) {
							nRadius /= 5;
						}
					} else
					if (szFlag.match(/PLOTXY/)) {
						nRadius = nRadius / 5;
					}
				}
 
				// GR 17.01.2014 don't draw stupid zero symbols
				if (isNaN(nRadius) || !nRadius) {
					if (!szFlag.match(/STAR|STACKED|PLOT/)) {
						continue;
					}
					nRadius = 1;
				}

				// get the symbol
				// ---------------

				var szSymbol = this.szSymbolsA[nIndex];
				/**
				// GR 31.10.2015 set exact value as text label
				if (this.szValueField && szFlag.match(/CATEGORICAL/) && this.szValuesA) {
					tValue = this.szValuesA[nIndex];
				}
				if (this.szValueField && this.itemA[a] && (this.szValueField == "$title$")) {
					tValue = this.itemA[a].szTitle;
				} 
				**/

				// get the symbol color
				// ---------------------

				if (a && this.itemA[a].szColor) {
					szColor = this.itemA[a].szColor;
					nClass = this.itemA[a].nClass;
					if (this.colorClassUsedA) {
						this.colorClassUsedA[nClass] = true;
					}
				} else
				if ((szFlag.match(/SEQUENCE/) || szFlag.match(/DOMINANT/)) && (this.colorScheme.length == this.partsA.length)) {
					var szColor = this.colorScheme[nIndex % (this.nGridX || 10000)];
					var szLineColor = this.colorScheme[nIndex];
				} else {
					var szColor = this.colorScheme[0];
					var szLineColor = this.colorScheme[1] ? this.colorScheme[1] : "none";
					if (this.colorScheme.length > 2) {
						szColor = this.colorScheme[this.colorScheme.length - 1];
						szLineColor = this.colorScheme[0];
					}
					if (szFlag.match(/NOLINES/)) {
						szLineColor = "none";
					} else
					if (szLineColor == "none") {
						var cColor = __maptheme_getChartColors(szColor);
						szLineColor = cColor.textColor;
					}
					// GR 26.06.2006 bubbles with colorscheme (classes)
					if (this.colorScheme.length > 2 || (this.szRanges && this.szRanges.length)) {
						for (ii = 0; ii < this.partsA.length; ii++) {
							if ((szFlag.match(/CATEGORICAL/) && (nValue == this.partsA[ii].min)) || (!szFlag.match(/CATEGORICAL/) && (nValue < this.partsA[ii].max))) {
								szColor = this.colorScheme[ii];
								var cColor = __maptheme_getChartColors(szColor);
								szLineColor = cColor.textColor;
								if (szFlag.match(/RANGE/) && !szFlag.match(/RANGES/)) {
									nRadius = map.Scale.normalX(2 + 5 * (ii + 1) / this.partsA.length);
								}
								nClass = ii;
								break;
							}else
							if (this.szRanges && this.szRanges.length && (nValue < this.partsA[ii].min)) {
								szColor = this.colorScheme[ii-1];
								var cColor = __maptheme_getChartColors(szColor);
								szLineColor = cColor.textColor;
								nClass = ii-1;
								break;
							}
						}
						if (szFlag.match(/NOLINES/)) {
							szLineColor = "none";
						}
					}
				}
				szLineColor = szLineColor || szColor;

				// make the symbol
				// ----------------
				
				this.nSymbolScale = nRadius/map.Scale.normalX(nChartSize);

				if (szSymbol == "circle" || szSymbol == "square"|| szSymbol == "roundrect" || szSymbol == "carot" || szSymbol == "diamond" || szSymbol == "triangle" || szSymbol == "hexagon" || szSymbol == "empty" || szSymbol == "label" || szSymbol == "cross") {
					szLineColor = this.szLineColor || szLineColor;
					var nLineWidth = (this.nLineWidth || 1) * map.Scale.normalX(Math.min(2 * nRadius / nMaxRadius, 0.2)); // map.Scale.normalX(0.2); //*map.Scale.nFeatureScaling*map.Scale.nObjectScaling;
					switch (szSymbol) {
						case "empty":
							newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "fill:#888888;fill-opacity:0;stroke:#888888;stroke-width:" + nLineWidth + ";");
							break;
						case "circle":
							if ((!this.fShadow) && this.fOrigShadow) {
								newShapeBg = map.Dom.newShape('circle', shapeGroup, map.Scale.normalX(0.5) + nRadius * 0.02, map.Scale.normalX(0.5) + nRadius * 0.02, nRadius * 1.02, "fill:#000000;stroke:none;opacity:" + 0.6 * (this.fillOpacity ? this.fillOpacity : 1));
							}
							newShapeBg1 = null;
							newShapeBg2 = null;
							// GR 29.12.2016 new
							if ((szFlag.match(/GLOW/) && (!this.sortedIndex || (i == nStartI)) && !szFlag.match(/ZOOM/)) &&
								(!this.szGlowUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nGlowUpper)) &&
								(!this.szGlowLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale >= this.nGlowLower))
							) {
								newShapeBg1 = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 6, "fill:" + szColor + ";stroke:none;fill-opacity:0.05;pointer-events:none;");
								if (newShapeBg1) {
									newShapeBg1.setAttributeNS(szMapNs, "class", String(nClass));
									newShapeBg1.setAttributeNS(szMapNs, "time", uTime);
								}
								newShapeBg2 = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 2, "fill:" + szColor + ";stroke:none;fill-opacity:0.1;pointer-events:none;");
								if (newShapeBg2) {
									newShapeBg2.setAttributeNS(szMapNs, "class", String(nClass));
									newShapeBg2.setAttributeNS(szMapNs, "time", String(uTime));
								}
							} else
							if ((szFlag.match(/AURA/) && (i == nStartI) && !szFlag.match(/ZOOM/)) &&
								(!this.szGlowUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nGlowUpper)) &
								(!this.szGlowLower || (map.Scale.nTrueMapScale * map.Scale.nZoomScale >= this.nGlowLower))
							) {
								newShapeBg1 = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 1.3, "fill:" + (this.szLineColor || szColor) + ";stroke:none;fill-opacity:0.3;");
								if (newShapeBg1) {
									newShapeBg1.setAttributeNS(szMapNs, "class", String(nClass));
									newShapeBg1.setAttributeNS(szMapNs, "time", String(uTime));
								}
							}
							newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							break;
						case "square":
							newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nRadius, nRadius * 2, nRadius * 2, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							break;
						case "roundrect":
							newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nRadius, nRadius * 2, nRadius * 2, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							newShape.setAttributeNS(null, "rx", nRadius * 0.3);
							break;
						case "cross":
							newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 1.6, -nRadius * 0.4, nRadius * 2 * 1.6, nRadius * 2 * 0.4, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + map.Scale.nFeatureScaling * map.Scale.nObjectScaling + ";");
							newShape = map.Dom.newShape('rect', shapeGroup, -nRadius * 0.4, -nRadius * 1.6, nRadius * 2 * 0.4, nRadius * 2 * 1.6, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + map.Scale.nFeatureScaling * map.Scale.nObjectScaling + ";");
							break;
						case "carot":
						case "diamond":
							newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nRadius, nRadius * 2, nRadius * 2, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							if (newShape) {
								newShape.setAttributeNS(null, "transform", "rotate(45)");
							}
							break;
						case "triangle":
							newShape = map.Dom.newShape('path', shapeGroup, "M 0," + nRadius + " l" + nRadius * 1.2 + ",-" + nRadius * 2 + " -" + nRadius * 2.4 + ",0 " + nRadius * 1.2 + "," + nRadius * 2 + "z", "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							break;
						case "hexagon":
							var A = nRadius / 2;
							var B = nRadius * Math.sin(60 / 180 * Math.PI);
							var C = nRadius;
							newShape = map.Dom.newShape('path', shapeGroup, "M -" + nRadius + "," + 0 + " l " + A + ",-" + B + " " + C + "," + 0 + " " + A + "," + B + " -" + A + "," + B + " -" + C + "," + 0 + " -" + A + ",-" + B + " z", "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
							break;
						case "label":
							var szText = this.formatValue(tValue, this.nValueDecimals || (((tValue < 1) || (nMaxValue <= 1)) ? 1 : 0), "ROUND") + (this.szUnit.length <= 5 ? this.szUnit : "");
							if (szFlag.match(/TEXTONLY/)) {
								szTextColor = __maptheme_getChartColors(szColor).textColor;
								nFontSize = String(Math.max(Math.min(nRadius * 0.8, map.Scale.normalX(500)), map.Scale.normalX(2)));
								if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
									if (nFontSize * map.Layer.nDynamicObjectScale < map.Scale.normalX(this.nValueSizeMin)) {
										newShape = map.Dom.newShape('rect', shapeGroup, 0, 0, 0, 0, "fill:none;");
										newShapeBg = map.Dom.newShape('rect', shapeGroup, 0, 0, 0, 0, "fill:none;");
										break;
									}
								}
								var szFont = this.szTextFont || "arial";
								newShapeBg = map.Dom.newText(shapeGroup, 0, 0, "font-family:" + szFont + ";font-size:" + nFontSize + "px;font-weight:bold;text-anchor:middle;fill:none;stroke:" + szColor + ";stroke-width:" + nFontSize / 7 + ";stroke-opacity:0.5;pointer-events:none;stroke-linejoin:bevel;", szText);
								newShapeBg.setAttributeNS(null, "id", this.szId + ":" + a + ":text:bg");
								newShape = map.Dom.newText(shapeGroup, 0, 0, "font-family:" + szFont + ";font-size:" + nFontSize + "px;font-weight:bold;text-anchor:middle;fill:" + (this.szTextColor || "#000000") + ";opacity:" + nOpacity + ";stroke:none;", szText);
								newShape.setAttributeNS(null, "id", this.szId + ":" + a + ":text");
							} else {
								var nFontSize = String(Math.max(1, Math.min(nRadius * 0.8, nRadius * (3.4 / szText.length))));
								if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
									if (nFontSize * map.Layer.nDynamicObjectScale < map.Scale.normalX(this.nValueSizeMin)) {
										newShape = map.Dom.newShape('rect', shapeGroup, 0, 0, 0, 0, "fill:none;");
										break;
									}
								}
								var nLabelHeight = nFontSize * 1.6;
								newShape = map.Dom.newShape('rect', shapeGroup, -nRadius, -nFontSize * 0.83, nRadius * 2.05, nFontSize * 1.6, "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
								if (newShape) {
									newShape.setAttributeNS(null, 'rx', map.Scale.normalX(2 * nRadius / nMaxRadius));
									newShape.setAttributeNS(null, 'ry', map.Scale.normalX(2 * nRadius / nMaxRadius));
								}
							}
							break;
					}
					if (newShape) {

						// set opacity
						// -----------
						if (szFlag.match(/OUTLINE/)) {
							newShape.style.setProperty("stroke-width", String(map.Scale.normalX(0.5)));
							newShape.style.setProperty("stroke-opacity", "1");
							newShape.style.setProperty("fill-opacity", "0.7");
						} else
						if (szFlag.match(/RANDOM/)) {
							newShape.style.setProperty("stroke-opacity", String(this.nOpacity ? this.nOpacity : 1), "");
							newShape.style.setProperty("fill-opacity", String(this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 1)), "");
							if (szFlag.match(/DOPACITY/)) {
								var nPow = 1 / (this.nDopacityPow || 1);
								var nOpacity = Math.pow((nValue), nPow) / Math.pow(this.sortedMax, nPow) * (this.nOpacity || 1) * (this.nDopacityScale || 1);
								newShape.style.setProperty("fill-opacity", String(nOpacity), "");
							}
						} else
						if (szFlag.match(/\bSORT\b/) && szFlag.match(/DOPACITY/)) {
							newShape.style.setProperty("stroke-opacity", String(this.nOpacity ? this.nOpacity : 1), "");
							var nPow = 1 / (this.nDopacityPow || 1);
							var nOpacity = Math.pow((nValue), nPow) / Math.pow(this.sortedMax, nPow) * (this.nOpacity || 1) * (this.nDopacityScale || 1);
							newShape.style.setProperty("fill-opacity", String(nOpacity), "");
							//newShape.style.setProperty("fill-opacity",String((this.nOpacity?this.nOpacity:1)*Math.pow(nValue,2)/Math.pow(this.sortedMax,2)),"");
						} else
						if (szFlag.match(/DOPACITY/) && this.szAlphaField) {
							if (a && (typeof (this.itemA[a].nAlpha) != "undefined")) {
								var nPow = 1 / (this.nDopacityPow || 1);
								var nOpacity = (this.nDopacityScale || 1) / Math.pow(this.nMaxAlpha, nPow) * Math.pow(this.itemA[a].nAlpha, nPow);
								newShape.style.setProperty("fill-opacity", String(nOpacity), "");
							}
						} else
						if (szFlag.match(/DOPACITY/)) {
							var nPow = 1 / (this.nDopacityPow || 1);
							//var nOpacity = (this.nDopacityScale||1)/Math.pow(nMaxValue,nPow)*Math.pow(nValue,nPow);
							var nOpacity = Math.pow((nValue - this.nMin), nPow) / Math.pow((this.nMax - this.nMin), nPow) * (this.fillOpacity || 1) * (this.nDopacityScale || 1);
							newShape.style.setProperty("fill-opacity", String(nOpacity), "");
							// GR 16.09.2017 opacity is continous, but we need 7 classes for legend interactivity
							if (!szFlag.match(/CATEGORICAL/)) {
								nClass = Math.min(6, Math.ceil((nValue - this.nMin) / (this.nMax - this.nMin) * 7));
								newShape.setAttributeNS(szMapNs, "class", String(nClass));
								shapeGroup.setAttributeNS(szMapNs, "class", String(nClass));
								chartGroup.setAttributeNS(szMapNs, "class", String(nClass));
							}
						} else {
							newShape.style.setProperty("fill-opacity", String(this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 1)), "");
						}

						if (this.chartGroup) {
							this.chartGroup.style.setProperty("opacity", String(1), "");
						}

						// set tooltip
						newShape.setAttributeNS(szMapNs, "tooltip", szTooltip);
						newShape.setAttributeNS(szMapNs, "time", uTime);
					}

				} else
				if (szFlag.match(/MULTIPLE/) && !szFlag.match(/NORMSIZE/) && !szFlag.match(/MENUSIZE/)) {
					newShape = map.Dom.newGroup(shapeGroup, shapeGroup.getAttributeNS(null, "id") + ":multiple");
					for (var z = 0; z < nValue; z++) {

						if (szSymbol.match(/.svg|.png|.jpeg/)){
							// GR 29.11.2020 external SVG symbols given by SVG file realized with <image> tag
							var newSymbol = map.Dom.constructNode('image', shapeGroup, {
								'xlink:href': szSymbol
							});
							newSymbol.setAttributeNS(null,"x",String(map.Scale.normalX(-nChartSize/2)));
							newSymbol.setAttributeNS(null,"y",String(map.Scale.normalY(-nChartSize/2)));
							newSymbol.setAttributeNS(null,"width",String(map.Scale.normalX(nChartSize)));
							newSymbol.setAttributeNS(null,"height",String(map.Scale.normalY(nChartSize)));
						}else{
							// loaded SVG symbols
							var newSymbol = map.Dom.constructNode('use', newShape, {
								'xlink:href': '#' + szSymbol + ":antizoomandpan"
							});
						}
						
						// GR 09.02.2011 workaround to get an event on 'use' elements
						newSymbol.fu.setPosition(z * (nMaxRadius + map.Scale.normalX(1)), 0);
						newSymbol.fu.scale(1, 1);
						newSymbol.setAttributeNS(null, "style", "fill:" + szColor + ";stroke:" + szLineColor);
						map.Dom.newShape('circle', newShape, z * nMaxRadius, 0, nRadius * 0.5, "fill:white;stroke:none;opacity:0");
					}
				} else {
					if (szSymbol.match(/.svg|.png|.jpeg/)){
						// GR 29.11.2020 external SVG symbols given by SVG file realized with <image> tag
						newShape = map.Dom.constructNode('image', shapeGroup, {
							'xlink:href': szSymbol
						});
						newShape.setAttributeNS(null,"x",String(map.Scale.normalX(-nChartSize/2)));
						newShape.setAttributeNS(null,"y",String(map.Scale.normalY(-nChartSize/2)));
						newShape.setAttributeNS(null,"width",String(map.Scale.normalX(nChartSize)));
						newShape.setAttributeNS(null,"height",String(map.Scale.normalY(nChartSize)));
					}else{
						// loaded SVG symbols
						newShape = map.Dom.constructNode('use', shapeGroup, {
							'xlink:href': '#' + szSymbol + ":antizoomandpan"
						});
					}
					
					// GR 09.02.2011 workaround to get an event on 'use' elements
					map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius * 0.5, "fill:white;stroke:none;opacity:0");
					newShape.fu.scale(nRadius / nMaxRadius, nRadius / nMaxRadius);
					newShape.setAttributeNS(null, "style", "fill:" + szColor + ";stroke:" + szLineColor);
				}

				if (newShape && szFlag.match(/VALUES/) && !szFlag.match(/TEXTONLY/) && (!this.fHideValues)) {
					var newText = null;
					var szText = tValue;
					if (!isNaN(tValue)) {
						szText = this.formatValue(tValue, this.nValueDecimals || "") + (this.szUnit.length <= 5 ? this.szUnit : "");
					}

					var cColor = __maptheme_getChartColors(szColor);
					var szTextColor = this.szTextColor || cColor.textColor;
					var szMaxTextLength = Math.max((tValue.length || 0) + 1, szMaxText.length);

					var nFontSize = String(Math.min(nMaxRadius * 1, nMaxRadius * (((szSymbol == "hexagon") ? 2.7 : 3.2) / szMaxTextLength)));
					nFontSize *= nRadius / nMaxRadius * this.nValueScale;

					if (szFlag.match(/ZOOM/) && szFlag.match(/LINES/) && !szFlag.match(/INLINETEXT/) && ((this.nGridX == null) || (this.nGridX <= 1) || (szFlag.match(/STACKED/)))) {
						szTextColor = "black";
						textOnTopGroup = textOnTopGroup || map.Dom.newGroup(chartGroup, this.szId + ":" + a + ":textchartontop");
						nFontSize = 4 + (0.5 * nPartsA.length / (this.nGridX ? (this.nGridX * 2) : 1));
						var scalefont = Math.log(nPartsA.length)/3;
						newText = this.createTextLabel(SVGDocument, textOnTopGroup, "", szText, nFontSize * scalefont, "", "rgba(255,255,255,0.3)", cColor.lowColor, "GLOW");
						newText.setAttributeNS(null, "opacity", "0.9");
						//textOnTopGroup.fu.setPosition(-map.Scale.normalX(nFontSize) * 1.7, - map.Scale.normalY(nFontSize) * 0.3 / (this.nGridX||1) );
						textOnTopGroup.fu.setPosition(-map.Scale.normalX(nFontSize* scalefont) * 0.7, - map.Scale.normalY(5/(this.nGridX||1)) );
					} else {
						if (szSymbol == "circle" || szSymbol == "square"|| szSymbol == "roundrect" || szSymbol == "triangle" || szSymbol == "hexagon" || szSymbol == "label" || szSymbol == "empty") {
							if (szFlag.match(/CENTERVALUES/)) {
								if (nClass === 0) {
									newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";stroke:none;pointer-events:none", szText);
								}
							} else
							if ((szFlag.match(/\bCENTER\b/) || szFlag.match(/\bTOP\b/) || szFlag.match(/\bBOTTOM\b/)) && !(szFlag.match(/\bDOMINANT\b/))) {
								if (nValue) {
									var nTextSize = 6;
									this.szChartFlag += "|VALUEBACKGROUND";
									shapeOnTopGroup = shapeOnTopGroup || map.Dom.newGroup(chartGroup, this.szId + ":" + a + ":chartontop");
									nStarRadius = nStarRadius ? nStarRadius : nRadius;
									var xPos = -map.Scale.normalX(1); //StarRadius*0.33;
									var yPos = -map.Scale.normalX(nTextSize * 1.33) * (nNonZeroValues - nNonZeroValuesDone - 1); //(i==nPartsA.length-1)?(map.Scale.normalX(2)):(-nRadius*0.5+map.Scale.normalX(2));
									newText = this.createTextLabel(SVGDocument, shapeOnTopGroup, "", szText, nTextSize, "", this.colorScheme[nIndex % (this.nGridX || 10000)], this.szTextColor);
									newText.fu.setPosition(xPos, yPos);
									if (a && (szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) && this.szLabelA) {
										var tWidth = newText.fu.getBox().width;
										
										newTextBg = map.Dom.newText(shapeOnTopGroup, 0, 0, this.szValuesTextBgStyle, this.szLabelA[nIndex]);
										newTextBg.fu.setPosition(xPos + tWidth + map.Scale.normalX(6), yPos - map.Scale.normalX(-1));
										newTextBg.fu.scale(0.6, 0.6);
										
										newText = map.Dom.newText(shapeOnTopGroup, 0, 0, this.szValuesTextStyle + ";fill:#000;fill-opacity:0.8", this.szLabelA[nIndex]);
										newText.fu.setPosition(xPos + tWidth + map.Scale.normalX(6), yPos - map.Scale.normalX(-1));
										newText.fu.scale(0.6, 0.6);
									}
									/** alternative 25.10.2021
										var tWidth = newText.fu.getBox().width;
										//newText = map.Dom.newText(shapeOnTopGroup, 0, 0, this.szValuesTextStyle + ";color:#000;", this.szLabelA[nIndex]);
										newText = this.createTextLabel(SVGDocument, shapeOnTopGroup, "", this.szLabelA[nIndex], nTextSize, "", "RGBA(255,255,255,0.3)", "RGBA(0,0,0,0.5)");
										newText.fu.setPosition(xPos + tWidth + map.Scale.normalX(1), yPos);
										newText.fu.scale(1,1);
									**/
									newText.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
									newText = null; // important , see below
									nNonZeroValuesDone++;
								}
							} else {
								if (this.szValueField && szFlag.match(/2VALUES/)) {
									newText = map.Dom.newText(shapeGroup, 0, -nFontSize * 0.2, "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";stroke:none;pointer-events:none", szText);
									var nFontSize2 = Math.min(nFontSize * 0.8, 120); // * ((szFlag.match(/ZOOM/))?2:1);
									var szValue = this.formatValue(nValue, this.nValueDecimals || 0) + this.szUnit;
									newText2 = map.Dom.newText(shapeGroup, 0, (nFontSize - nFontSize2 * 0.2), "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize2 + "px;text-anchor:middle;fill:" + szTextColor + ";stroke:none;pointer-events:none", szValue);
								} else {
									newText = map.Dom.newText(shapeGroup, 0, nFontSize * 0.33, "font-family:"+(this.szTextFont||"arial")+";font-size:" + nFontSize + "px;text-anchor:middle;fill:" + szTextColor + ";stroke:none;pointer-events:none", szText);
								}
							}
						} else {
							nFontSize = Math.max(nRadius * 0.8, 1) * this.nValueScale;
							shapeOnTopGroup = shapeOnTopGroup || map.Dom.newGroup(chartGroup, this.szId + ":" + a + ":chartontop");
							// GR 27/10/2022 text label changed
							//newText = this.createTextLabel(SVGDocument, shapeOnTopGroup, "", szText, nFontSize / map.Scale.normalX(1), "", szColor);
							newText = this.createTextLabel(SVGDocument, shapeOnTopGroup, "", szText, nFontSize / map.Scale.normalX(1), "", "rgba(255,255,255,0.3)", cColor.lowColor, "GLOW");
							newText.fu.setPosition(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
						}
					}
				}
				if (newShape) {
					// GR 17.08.2015 make class attribute for multiple symbols (sequenze) to mark class
					newShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
					newShape.setAttributeNS(szMapNs, "time", uTime);

					if (newText) {
						newText.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
						newText.setAttributeNS(szMapNs, "time", uTime);
						newText.setAttributeNS(szMapNs, "tooltip", szTooltip);
					}
					if (newText2) {
						newText2.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
						newText2.setAttributeNS(szMapNs, "time", uTime);
					}
					if (newShapeBg) {
						newShapeBg.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
						newShapeBg.setAttributeNS(szMapNs, "time", uTime);
					}

					if (!szFlag.match(/CENTER/)) {

						var pos = null;

						// calculate STAR, RANDOM, HORZ, ...
						// --------------------------------
						if (szFlag.match(/STAR/)) {
							if (i === 0) {
								// STAR, on first element make star (inner) radius
								topShape = newShape;
								topText = newText;
								topText2 = newText2;
								nStarRadius = nRadius;
								if (szFlag.match(/EXPAND/) && szFlag.match(/\bSORT\b/) && szFlag.match(/\bUP\b/)) {
									if (szFlag.match(/LINEAR/) || szFlag.match(/SIZEP1/)) {
										nStarRadius = (szFlag.match(/EXPANDMAX/) ? 2 : 0.5) * nMaxRadius / nMaxValue * this.sortedIndex[nPartsA.length - 1].value;
									} else {
										nStarRadius = (szFlag.match(/EXPANDMAX/) ? 2 : 0.5) * nMaxRadius / Math.sqrt(nMaxValue) * Math.sqrt(this.sortedIndex[nPartsA.length - 1].value);
									}
								}
								if (szFlag.match(/ZOOM/) && szFlag.match(/STAR/) && szFlag.match(/\bUP\b/)) {
									nStarRadius *= 2;
								} else
								if (szFlag.match(/COMPRESS/)) {
									nStarRadius *= (szFlag.match(/COMPRESSMAX/) ? 0.25 : 0.5);
								}
							}
							if (((i > 0) || szFlag.match(/\bUP\b/)) && nRadius) {
								var nStarParts = (this.nClipParts && (this.nClipParts < this.partsA.length)) ? this.nClipParts : this.partsA.length;

								// GR 02.06.2014 calc angles from radius an fit circles
								// used c*c = a*a + b*b, h = a*b/c, alpha = arcsin(h/a)

								// 1. calc angle by radius of satellite circle
								var _a = nRadius;
								var _c = nStarRadius + nRadius;
								var _b = Math.sqrt(Math.pow(_c, 2) - Math.pow(_a, 2));
								var _h = (_a) * _b / (_c);
								var _f = 90 - Math.asin(_h / _a) / Math.PI * 180;

								// 2. define radius for satellite circle and squeeze satellites if many
								var _r = nStarRadius + nRadius;
								if (szFlag.match(/\bUP\b/)) {
									if (i > 5) {
										_f /= (1 + 2 * (nRadius / nMaxRadius));
									}
									_r = nStarRadius * (1 + nStarParts / 5);
								}

								if (!szFlag.match(/ZOOM/)) {
									if (this.nRangeScale) {
										_r *= this.nRangeScale;
									} else {
										_r = (szFlag.match(/EXPANDMAX/) ? _r * 2 : (szFlag.match(/EXPAND/) ? _r * 1.5 : _r));
									}
								}

								// 3. get position by angle and radius
								this.initAngle += _f;
								nSymbolOffsetX = Math.cos(this.initAngle / 180 * Math.PI) * (_r);
								nSymbolOffsetY = Math.sin(this.initAngle / 180 * Math.PI) * (_r);
								this.initAngle += _f;

								pos = new point(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
							}
						} else
						if (szFlag.match(/RANDOM/)) {

							var dRadius = (szFlag.match(/EXPANDMAX/) ? nRadius * 2 : (szFlag.match(/EXPAND/) ? nRadius * 1.5 : nRadius));
							if (szFlag.match(/ZOOM/)) {
								nMaxRadius *= 2;
								dRadius *= 2;
							}
							nSymbolOffsetX = Math.cos(this.initAngle + (360 / (this.partsA.length) * (i)) / 180 * Math.PI) * Math.min(nMaxRadius, (dRadius));
							nSymbolOffsetY = Math.sin(this.initAngle + (360 / (this.partsA.length) * (i)) / 180 * Math.PI) * Math.min(nMaxRadius, (dRadius));
							pos = new point(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
						} else
						if (szFlag.match(/HORZ/)) {
							nSymbolOffsetX += nRadius;
							pos = new point(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
							nSymbolOffsetX += nRadius;
						} else
						if (szFlag.match(/BOTTOM/)) {
							pos = new point(map.Scale.normalX(0), -nRadius);
						} else
						if (szFlag.match(/TOP/)) {
							pos = new point(-nRadius * 0.3, nRadius * 0.7 - nMaxRadius);
						} else
						if (szFlag.match(/CONE/)) {
							pos = new point(map.Scale.normalY(i * 0.33), -map.Scale.normalY(i * 1));
						} else
						if (szFlag.match(/BASE/)) {
							pos = new point(map.Scale.normalX(0), nSymbolOffsetY - nRadius);
							nSymbolOffsetY -= nRadius * (szFlag.match(/VALUES/) ? 1.25 : 1);
						}
						// position STAR, RANDOM, HORZ, ...
						// --------------------------------
						if (pos) {
							newShape.fu.setPosition(pos.x, pos.y);
							if (newShapeBg) {
								newShapeBg.fu.setPosition(pos.x, pos.y);
							}
							if (newShapeBg1) {
								newShapeBg1.fu.setPosition(pos.x, pos.y);
							}
							if (newShapeBg2) {
								newShapeBg2.fu.setPosition(pos.x, pos.y);
							}
							if (newText) {
								newText.fu.setPosition(pos.x, pos.y);
							}
							if (newText2) {
								newText2.fu.setPosition(pos.x, pos.y);
							}
						} else {
							if (newText2) {
								newText2.fu.setPosition(0, 0);
							}
						}

						if (szFlag.match(/PLOT/)) {

							// ---------------------------------------------------------------------------------------	
							// PLOT 
							// special case of multi symbol charts
							//
							// in fact, bubble, line and area charts are derivants from SYMBOL charts ! 
							// ---------------------------------------------------------------------------------------	

							if ((nValue === 0) && !szFlag.match(/STACKED/)) {
								newShape.parentNode.removeChild(newShape);
								if (newShapeBg) {
									newShapeBg.parentNode.removeChild(newShapeBg);
								}
								if (newText) {
									newText.parentNode.removeChild(newText);
								}
								//continue;
							}

							var nStep = map.Scale.normalX(nChartSize) * (szFlag.match(/LINES/) ? 1 : 1);

							var nAxis = i * nStep;
							if (this.nGridX) {
								if (szFlag.match(/PLOTVAR/)) {
									nAxis = Math.floor(i % this.nGridX) * nStep;
								} else {
									nAxis = Math.floor(i / this.nGridX) * nStep;
								}
							}

							var nMinValue = 0;
							var nMaxValue = (nAllMaxValue || this.nMax);
							
							// GR 25.02.2019 for menu charts
							nMaxValue = Math.max(nChartMaxValue, nMaxValue);

							// set or calculate min/max values
							// if this.nMaxValue or this.nMinValue not defined in theme config, set it (once) from data
							//
							nMaxValue = this.nMaxValuePlot = (typeof this.nMaxValue !== "undefined") ? this.nMaxValue : nMaxValue;
							nMinValue = this.nMinValuePlot = (typeof this.nMinValue !== "undefined") ? this.nMinValue : Math.min(this.nMin, nAllMinValue);

							// if this.nMaxValue is "auto", every chart item has is own fitting scale 
							//
							if (this.nMaxValue == "auto") {
								nMaxValue = this.nMaxValuePlot = nChartMaxValue;
							}
							
							// GR 04.04.2019 if this.nMaxValue is "inherit" look in already present themes for nMaxValue 
							// needed for 'superposed' PLOT (curve) charts
							//
							if (this.nMaxValue == "inherit") {
								// !important
								this.nMaxValuePlot = this.nMinValuePlot = null;
								
								for (var t = 0; t < this.parent.themesA.length; t++) {
									if ((this.parent.themesA[t] != this) && this.parent.themesA[t].nMaxValuePlot) {
										nMaxValue = this.parent.themesA[t].nMaxValuePlot;
									}
								}
							}
							
							// calculate PLOT scale
							var nScale = map.Scale.normalX(nChartSize) / (nMaxValue - nMinValue) * (this.nGridX || (nPartsA.length - 1)) * (this.nRangeScale || 1);

							if (!fPlotInit) {
								var szGridId = this.szId + ":" + this.itemA[a].szSelectionId + ":chartgrid";
								var gridGroup = null; //SVGDocument.getElementById(szGridId);
								if (!gridGroup || szFlag.match(/ZOOM/)) {
									if (1||szFlag.match(/AREA/)) {
										shapeOnTopGroup = shapeOnTopGroup || map.Dom.newGroup(chartGroup, this.szId + ":" + a + ":chartontop");
										var gridGroup = map.Dom.newGroup(shapeOnTopGroup, szGridId);
									} else {
										var gridGroup = map.Dom.newGroup(chartGroup, szGridId);
										gridGroup.parentNode.insertBefore(gridGroup, gridGroup.parentNode.firstChild.nextSibling);
									}
								}
							}

							//topGroup = map.Dom.newGroup(shapeOnTopGroup, "");

							if (szFlag.match(/PLOTXY/)) {
								if (!fPlotInit) {
									fPlotInit = true;
									if (szFlag.match(/BOX/) && szFlag.match(/\bGRID\b/) && !gridGroup.childNodes.length) {

										map.Dom.newShape('line', gridGroup, 0, 0, this.nChartWidth + 100, 0, "stroke:#888888;stroke-width:" + map.Scale.normalX(0.3) + ";");
										map.Dom.newShape('line', gridGroup, 0, 0, 0, -this.nChartHeight - 100, "stroke:#888888;stroke-width:" + map.Scale.normalX(0.3) + ";");

										map.Dom.newText(gridGroup, 10, 80, "font-family:arial;font-size:80px;text-anchor:start;fill:#444444;stroke:none;pointer-events:none;", String(this.nMinX));
										map.Dom.newText(gridGroup, this.nChartWidth + 100, 80, "font-family:arial;font-size:80px;text-anchor:end;fill:#444444;stroke:none;pointer-events:none;", String(this.nMaxX));

										map.Dom.newText(gridGroup, -10, 10, "font-family:arial;font-size:80px;text-anchor:end;fill:#444444;stroke:none;pointer-events:none;", String(this.nMinY));
										map.Dom.newText(gridGroup, -10, -this.nChartHeight - 100 + 80, "font-family:arial;font-size:80px;text-anchor:end;fill:#444444;stroke:none;pointer-events:none;", String(this.nMaxY));
									}
								}
								/**
								var nPow = 1;
								var x =  50+Math.pow(this.itemA[a].nX-this.nMinX,nPow) * this.nChartWidth / Math.pow(this.nRangeX,nPow);
								var y = -100-Math.pow(this.itemA[a].nY-this.nMinY,nPow) * this.nChartHeight / Math.pow(this.nRangeY,nPow);
                                **/
								var x = 50 + (this.itemA[a].nX - this.nMinX) * this.nChartWidth / (this.nRangeX);
								var y = -100 - (this.itemA[a].nY - this.nMinY) * this.nChartHeight / (this.nRangeY);

								newShape.fu.setPosition(x, y);
								if (newShapeBg) {
									newShapeBg.fu.setPosition(x, y);
								}
								if (newShapeBg1) {
									newShapeBg1.fu.setPosition(x, y);
								}
								if (newShapeBg2) {
									newShapeBg2.fu.setPosition(x, y);
								}
								if (newText) {
									newText.fu.setPosition(x, y);
								}
							} else
							if (szFlag.match(/PLOTYX/)) {
								newShape.fu.setPosition((nMaxValue + Math.abs(nMaxValue - nValue)) * nScale, nAxis);
								if (newShapeBg) {
									newShapeBg.fu.setPosition((nMaxValue + Math.abs(nMaxValue - nValue)) * nScale, nAxis);
								}
								if (newText) {
									newText.fu.setPosition((nMaxValue + Math.abs(nMaxValue - nValue)) * nScale, nAxis);
								}
							} else
							if (szFlag.match(/PLOTY/)) {
								newShape.fu.setPosition(0, (-nMaxValue + Math.abs(nMaxValue - nValue)) * nScale);
								if (newShapeBg) {
									newShapeBg.fu.setPosition(0, (-nMaxValue + Math.abs(nMaxValue - nValue)) * nScale);
								}
								if (newText) {
									newText.fu.setPosition(0, (-nMaxValue + Math.abs(nMaxValue - nValue)) * nScale);
								}
								var nYStep = 1;
								nYStep = nMaxValue / 5;
								nYStep = (Math.ceil(nYStep / (Math.floor(Math.log(nYStep)) * 10)) * (Math.floor(Math.log(nYStep)) * 10)) || 1;
								nMaxValue = Math.ceil(nMaxValue / nYStep) * nYStep;
								if (!fPlotInit) {
									fPlotInit = true;
									if (szFlag.match(/BOX/) && szFlag.match(/\bGRID\b/)) {
										for (var s = map.Scale.normalX(nChartSize) / 2; s < nMaxValue * nScale; s += nScale * nYStep) {
											map.Dom.newShape('line', gridGroup, -20, -s, 20, -s, "stroke:#444444;stroke-width:" + map.Scale.normalX(1) + ";");
										}
									}
								}
							} else
							if (szFlag.match(/PLOTX/)) {
								newShape.fu.setPosition((nMaxValue - Math.abs(nMaxValue - nValue)) * nScale, 0);
								if (newShapeBg) {
									newShapeBg.fu.setPosition((nMaxValue - Math.abs(nMaxValue - nValue)) * nScale, 0);
								}
								if (newText) {
									newText.fu.setPosition((nMaxValue - Math.abs(nMaxValue - nValue)) * nScale, 0);
								}
								var nYStep = 1;
								nYStep = nMaxValue / 5;
								nYStep = (Math.ceil(nYStep / (Math.floor(Math.log(nYStep)) * 10)) * (Math.floor(Math.log(nYStep)) * 10)) || 1;
								nMaxValue = Math.ceil(nMaxValue / nYStep) * nYStep;
								if (!fPlotInit) {
									fPlotInit = true;
									if (szFlag.match(/BOX/) && szFlag.match(/\bGRID\b/)) {
										for (var s = map.Scale.normalX(nChartSize); s < nMaxValue * nScale + map.Scale.normalX(nChartSize); s += nScale * nYStep) {
											map.Dom.newShape('line', gridGroup, s, -20, s, 20, "stroke:#444444;stroke-width:" + map.Scale.normalX(1) + ";");
										}
									}
								}
							} else {
								var nYStep = 1;
								nYStep = Math.ceil(nMaxValue - nMinValue) / 5;
								if (nYStep < 0.5) {
									nYStep = Math.ceil(nMaxValue - nMinValue) / 10;
								}
								if (nYStep > 1) {
									var nDez = Math.pow(10, (Math.floor(Math.log10(nYStep))));
									nYStep = (Math.ceil(nYStep / nDez) * nDez) || 1;
								}
								nMaxValue = Math.ceil(nMaxValue / nYStep) * nYStep;
								nMinValue = Math.floor(nMinValue / nYStep) * nYStep;

								while ((nMaxValue - nMinValue) / nYStep < 5) {
									nYStep /= 2;
								}
								if ((nMaxValue - nMinValue) / nYStep > 5) {
									nYStep *= 2;
								}

								// ---------------------------------------------------------------------------------------	
								// init the plot, if not yet done
								// ---------------------------------------------------------------------------------------	

								if (!fPlotInit) {
									fPlotInit = true;
									this.plot_last_last_position = [];
									this.plot_last_position = [];
									this.plot_last_value = [];
									this.plot_last_stacked_value = [];
									this.plot_last_shape = [];
									this.plot_last_mean = [];
									this.plot_last_areaValue = [];

									this.plot_area_points = [];
									this.plot_area_shapes = [];

									this.plot_area_shapes[0] = map.Dom.newShape('path', shapeGroup, 'M0,0',
										"fill:" + szColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";stroke:none");
									
									var nPlotScale = nPartsA.length / (this.nGridX || 1);

									var nScaleFontSize = map.Scale.normalX(Math.max(nPartsA.length / (this.nGridX || 1), 3));
									nScaleFontSize *= (szFlag.match(/ZOOM/) ? 1 : 1);

									// make plot lines and fill in a special group below the plot symbols 
									var plotGroup = map.Dom.newGroup(shapeGroup, "");
									plotGroup.parentNode.insertBefore(plotGroup, shapeGroup.firstChild);

									// make coordinate grid
									// ---------------------------------------------------------------------------------------	
									if (szFlag.match(/BOX/) && 
										szFlag.match(/\bGRID\b/) &&
										!(!szFlag.match(/ZOOM/) && 
										  this.nBoxUpper && (map.Scale.nTrueMapScale * map.Scale.nZoomScale > this.nBoxUpper))
									   ) {
										
										// GR 14.03.2019 plot background, transparent, needed for click
										if (!szFlag.match(/ZOOM/)) {
											var left = -nStep / (szFlag.match(/LINES/) ? 3 : 1);
											var right = nStep * ((this.nGridX) ? nPartsA.length / this.nGridX - 1 : nPartsA.length - 1);
											map.Dom.newShape('rect', shapeGroup, 0, -(nMaxValue - nMinValue) * nScale, right, (nMaxValue - nMinValue) * nScale, "fill:#ffffff;fill-opacity:0;stroke:none;");
										}
										var nBgOpacity = 0.8;
										var incr = 0;
										for (var s = 0; s <= (nMaxValue - nMinValue) * nScale; s += nScale * nYStep) {
											
											var st = this.formatValue(Math.round(szFlag.match(/INVERT/) ? (nMaxValue - s / nScale + nMinValue) : (s / nScale + nMinValue) * 100) / 100, 2);
											
											if (nMaxValue > 5) {
												st = String(Math.round(szFlag.match(/INVERT/) ? (nMaxValue - s / nScale + nMinValue) : (s / nScale + nMinValue)));
											}
											var sy = s;
															
											if (szFlag.match(/LOG/)) {
												sy = 100 * (Math.pow(10,incr++));
												if ( sy > nMaxValue ){
													s = nMaxValue*nScale;
												}
												st = this.formatValue(sy,0);	
												sy = Math.log10(sy)*nMaxValue/Math.ceil(Math.log10(nMaxValue))*nScale;
											}
											
											var left = -nStep / (szFlag.match(/LINES/) ? 3 : 1);
											var right = nStep * ((this.nGridX) ? nPartsA.length / this.nGridX - 1 : nPartsA.length - 1);
															
											if (szFlag.match(/PLOTVAR/) && (nPartsA.length / this.nGridX > 1)) {
												right = nStep * this.nGridX;
											}
											if (szFlag.match(/GRADIENT/) && (s !== 0)) {
												var myRight = right + (szFlag.match(/LINES/) ? 0 : 0);
												plotShape = map.Dom.newShape('path', shapeGroup, 'M' + (left) + ',' + (-s) +
													' L ' + (myRight) + ',' + (-s) + ' ' +
													(myRight) + ',' + (-s + nScale * nYStep) + ' ' +
													(left) + ',' + (-s + nScale * nYStep) + ' z', "fill:#d8d8dd;fill-opacity:" + nBgOpacity + ";stroke:none;");
												nBgOpacity -= 0.3;
											}
                                            if (sy === (-nMinValue*nScale)){
                                                map.Dom.newShape('line', gridGroup, left, -sy, right, -sy, "stroke:#444444;stroke-opacity:1;stroke-width:" + map.Scale.normalX(0.05*nPlotScale)+ ";");
                                            }else{
                                                map.Dom.newShape('line', gridGroup, left, -sy, right, -sy, "stroke:#888888;stroke-opacity:0.4;stroke-width:" + (map.Scale.normalX(0.05*nPlotScale)) + ";stroke-dasharray:"+(6*nPlotScale)+" "+(3*nPlotScale)+";");
                                            }
											if (szFlag.match(/RIGHT/)){
												map.Dom.newText(gridGroup, right+map.Scale.normalX(15), -sy + nScaleFontSize * 0.3, "font-family:arial;font-size:" + nScaleFontSize + "px;text-anchor:start;fill:"+(szFlag.match(/\bCOLOR\b/)?szColor:"#888888")+";stroke:none;pointer-events:none;", st);
											}else{
												map.Dom.newText(gridGroup, left * 1.1, -sy + nScaleFontSize * 0.3, "font-family:arial;font-size:" + nScaleFontSize + "px;text-anchor:end;fill:"+(szFlag.match(/\bCOLOR\b/)?szColor:"#888888")+";stroke:none;pointer-events:none;", st);
											}	
												
											this.nPlotHeight = s;
										}
										
										if ( szFlag.match(/ZOOM/) ){
										if ( this.nLowValue ){
											map.Dom.newShape('line', gridGroup, left, -this.nLowValue*nScale, right, -this.nLowValue*nScale, "stroke:#dd0000;stroke-opacity:0.4;stroke-width:" + (map.Scale.normalX(0.1*nPlotScale)) + ";stroke-dasharray:"+(6*nPlotScale)+" "+(3*nPlotScale)+";");
											if ( szFlag.match(/ZOOM/) ) {
												map.Dom.newText(gridGroup, right*1.06, -this.nLowValue*nScale + nScaleFontSize * 0.3, "font-family:arial;font-size:" + nScaleFontSize + "px;text-anchor:end;fill:#888888;stroke:none;pointer-events:none;", this.nLowValue);
											}
										}
										
										if ( this.nHighValue ){
											map.Dom.newShape('line', gridGroup, left, -this.nHighValue*nScale, right, -this.nHighValue*nScale, "stroke:#dd0000;stroke-opacity:0.4;stroke-width:" + (map.Scale.normalX(0.1*nPlotScale)) + ";stroke-dasharray:"+(6*nPlotScale)+" "+(3*nPlotScale)+";");
											if ( szFlag.match(/ZOOM/) ) {
												map.Dom.newText(gridGroup, right*1.06, -this.nHighValue*nScale + nScaleFontSize * 0.3, "font-family:arial;font-size:" + nScaleFontSize + "px;text-anchor:end;fill:#888888;stroke:none;pointer-events:none;", this.nHighValue);
											}
										}
										}

										map.Dom.newShape('line', gridGroup, nAxis, 0, nAxis, -(nMaxValue - nMinValue) * nScale, "stroke:#aaaaaa;stroke-width:" + (map.Scale.normalX(0.1)) + ";");

										if (this.szXaxisA && this.szXaxisA.length) {
											for (var s = 0; s < this.szXaxisA.length; s++) {
												if ((this.szXaxisA[s].length && (this.szXaxisA[s] != " ")) || s==0 || s == this.szXaxisA.length-1) {
													map.Dom.newShape('line', gridGroup, nStep * s, 100, nStep * s, -(nMaxValue - nMinValue) * nScale, "stroke:#888888;stroke-opacity:0.4;stroke-width:" + (map.Scale.normalX(0.05*this.szXaxisA.length)) + ";stroke-dasharray:"+(6*this.szXaxisA.length)+" "+(3*this.szXaxisA.length)+";");
													map.Dom.newText(gridGroup, nStep * s, (nScaleFontSize * 1.5), "font-family:arial;font-size:" + nScaleFontSize + "px;text-anchor:middle;fill:#888888;stroke:none;pointer-events:none;", this.szXaxisA[s]);
												}
											}
										}
									}
									// GR 29.10.2019 clip plot to grid
									if (!szFlag.match(/NOCLIP/)) {
										map.Dom.setClipRect(shapeGroup, {
											x: -100,
											y: -(nMaxValue - nMinValue) * nScale,
											width: 100 + (nMaxI/(this.nGridX||1)) * nStep,
											height: 100 + (nMaxValue - nMinValue) * nScale
										});
									}
									
								}

								var xi = this.nGridX ? (Math.floor(i / this.nGridX) + 1) : 1;
								var yi = this.nGridX ? (i % this.nGridX) : 1;
								
								if (szFlag.match(/LOG/) && nValue) {
									nValue = Math.log10(nValue)*nMaxValue/Math.ceil(Math.log10(nMaxValue));
								}

								var nPValue = (szFlag.match(/INVERT/) ? (nMaxValue - nValue) : nValue);

								nPValue -= nMinValue;

								nPValue += (szFlag.match(/STACKED/) ? (this.plot_last_stacked_value[xi] || 0) : 0);
								newShape.fu.setPosition(nAxis, (-nPValue) * nScale);
								if (newShapeBg) {
									newShapeBg.fu.setPosition(nAxis, (-nPValue) * nScale);
								}
								
								// remove some value displays to create readable chart
								if (newText && newText.parentNode) {
									if ( this.nXLen > 10 ){
										var nModulo = Math.floor(this.nXLen/5);  
										var ai = Math.floor(i/(this.nGridX||1));
										if ( (ai != 0) && (ai != this.nXLen-1) ){
											if (!this.szXaxisA || !this.szXaxisA.length || ((this.nXLen > 100)&&(ai >= this.nXLen-5))) {
												newText.parentNode.removeChild(newText);
											}else
											if ( 1 || !this.szXaxisA[ai] || !this.szXaxisA[ai].length || (this.szXaxisA[ai] == " ")) {
												newText.parentNode.removeChild(newText);
											}else{
												newShape.fu.scaleBy(4,4	);
											}
										}
									}
									nPLastValue = nPValue;
									
									if (newText && newText.parentNode) {
										if ( szFlag.match(/\bINLINETEXT\b/) ){
											newText.fu.setPosition(nAxis, (-nPValue) * nScale);
										}else
										if ( szFlag.match(/\bSTACKED\b/) ){
											newText.parentNode.removeChild(newText);
										}else
										if ( szFlag.match(/LINES/) && ((this.nGridX == null) || (this.nGridX <= 1)) ) {
											newText.fu.setPosition(nAxis - map.Scale.normalX(nChartSize * this.nGridX||1), (-nPValue) * nScale  );
											newText.fu.scale(2.5,2.5);
											} else {
											newText.fu.scale(1.5*this.nValueScale,1.5*this.nValueScale);
											newText.fu.setPosition(nAxis - map.Scale.normalX(nChartSize/7), (-nPValue) * nScale);
										}
									}
								}

								// ---------------------------------------------------------------------------------------	
								// lines and area charts
								// ---------------------------------------------------------------------------------------	

								if (szFlag.match(/LINES/)) {
									var plotShape = null;

									if ((szFlag.match(/ZEROISVALUE/) && !szFlag.match(/ZEROISNOTVALUE/) && this.plot_last_position[yi] && (nValue || this.plot_last_position[yi].y)) ||
										(nValue && this.plot_last_position[yi] && this.plot_last_position[yi].y)) {
										if (szFlag.match(/AREA/)) {
											plotShape = map.Dom.newShape('path', plotGroup, 'M' + (this.plot_last_position[yi].x - 2) + ',' + (this.plot_last_position[yi].y) +
												' L ' + (nAxis) + ',' + ((-nPValue) * nScale) + ' ' +
												(nAxis) + ',' + ((-nPValue + nValue) * nScale) + ' ' +
												(this.plot_last_position[yi].x - 2) + ',' +
												(this.plot_last_last_position[yi - 1] ? this.plot_last_last_position[yi - 1].y : (nMinValue * nScale)) +
												' z',
												"fill:" + szColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";");
											if (plotShape) {
												plotShape.setAttributeNS(szMapNs, "value", String(nValue));
												plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
												if ( this.nXLen < 25 ){
													var v = this.formatValue(this.plot_last_areaValue[yi], this.nValueDecimals || 2) + " ... " + this.formatValue(nValue, this.nValueDecimals || 2);
												}else{
													var v = this.formatValue(nValue, this.nValueDecimals || 2);
												}
												plotShape.setAttributeNS(szMapNs, "tooltip", v + this.szUnit + " " + (this.szLabelA ? (this.szLabelA[nIndex % (this.nGridX || 1000000)]) : ""));
												plotShape.setAttributeNS(szMapNs, "time", String(uTime));

												if (this.szFlag.match(/\bFADE\b/)) {
													var gradientId = "Gradient" + Math.random();
													var myGradient = map.Dom.constructNode('linearGradient', shapeGroup, {
														"id": gradientId,
														"gradientTransform": "rotate(90)"
													});
													map.Dom.constructNode('stop', myGradient, {
														"offset": "0",
														"stop-color": szColor,
														"stop-opacity": ("1")
													});
													map.Dom.constructNode('stop', myGradient, {
														"offset": "1",
														"stop-color": szColor,
														"stop-opacity": ("0.1")
													});
													plotShape.style.setProperty("fill", "url(#" + gradientId + ")");
												}
											}
											var linecap = ((i == 1) || (i == nMaxI - 1) || (xi == 2) || (xi == (nMaxI / (this.nGridX || 1)))) ? "but" : "round";
											plotShape = map.Dom.newShape('line', plotGroup, this.plot_last_position[yi].x, this.plot_last_position[yi].y, nAxis, (-nPValue) * nScale, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(szFlag.match(/STACKED/) ? 1 : (this.nLineWidth || 3)) + ";stroke-linecap:" + linecap + ";");
											if (plotShape) {
												plotShape.setAttributeNS(szMapNs, "value", String(nValue));
												plotShape.setAttributeNS(szMapNs, "tooltip",  this.formatValue(nValue, this.nValueDecimals || 2) + this.szUnit + " " + (this.szLabelA ? (this.szLabelA[nClass % (this.nGridX || 1000000)]) : ""));
											}
										} else {
											plotShape = map.Dom.newShape('line', plotGroup, this.plot_last_position[yi].x, this.plot_last_position[yi].y, nAxis, (-nPValue) * nScale, "stroke:" + (this.szLineColor || szColor) + ";stroke-width:" + map.Scale.normalX(this.nLineWidth || 3) + ";stroke-linecap:round;");
											if ( this.nXLen < 25 ){
												var v = this.formatValue(this.plot_last_areaValue[yi], this.nValueDecimals || 2) + " ... " + this.formatValue(nValue, this.nValueDecimals || 2);
											}else{
												var v = this.formatValue(nValue, this.nValueDecimals || 2);
											}
											if (plotShape) {
												plotShape.setAttributeNS(szMapNs, "value", String(nValue));
												plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
												plotShape.setAttributeNS(szMapNs, "tooltip", v + this.szUnit + " " + (this.szLabelA ? (this.szLabelA[nClass % (this.nGridX || 1000000)]) : ""));
												plotShape.setAttributeNS(szMapNs, "time", String(uTime));
											}
											try {
												shapeGroup.insertBefore(plotShape, this.plot_last_shape[yi]);
											} catch (e) {}
										}
									}
									if (szFlag.match(/LOLLIPOP/) && nValue) {
										plotShape = map.Dom.newShape('line', plotGroup, nAxis, (nMinValue * nScale), nAxis, (-nPValue) * nScale, "stroke:" + (szColor) + ";stroke-width:" + map.Scale.normalX(3) + ";stroke-linecap:butt;");
										if (plotShape) {
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}
									}
									if (szFlag.match(/LASTPOP/) && nValue && (i >= nMaxI-(this.nGridX||1)) ) {
										plotShape = map.Dom.newShape('circle', plotGroup, nAxis, (-nPValue) * nScale, map.Scale.normalX((this.nLineWidth||5)*(this.nMarkerSize||1.5)), "fill:" + szColor + ";stroke:" + szLineColor + ";stroke-width:" + nLineWidth + ";");
										if (plotShape) {
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											//plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}
									}
									
									if (plotShape && this.szFlag.match(/\bLASTARROW\b/) && nValue && (i >= nMaxI-(this.nGridX||1))) {
										var arrowId = "ArrowMarker" + Math.random();
										var tmpDefs = map.Dom.newNode('defs', plotGroup);
										var nP = Math.min(5, 2.5 + (100 / (((this.nLineWidth||1) / this.nChartGroupScale)))) * (this.nMarkerSize || 3);
										var myMarker = map.Dom.constructNode('marker', tmpDefs, {
											"id": arrowId,
											"markerWidth": nP,
											"markerHeight": nP,
											"refX": nP / 1.7,
											"refY": nP / 2,
											"orient": "auto",
											"markerUnits": "strokeWidth"
										});
										var myMarkerShape = map.Dom.constructNode('path', myMarker, {
											"d": "M0," + nP + " L" + nP + "," + nP / 2 + " L0,0 Z",
											"style": "fill:" + szColor + ";opacity:" + (1) + ";stroke:none;stroke-width:0.03"
										});
										plotShape.setAttributeNS(null, "marker-end", "url(#" + arrowId + ")");
									}
									
									
									
									
									if (szFlag.match(/PLOTVAR/)) {
										var nMean = szFlag.match(/MEDIAN/) ? this.nMedianA[nIndex] : this.nMeanA[nIndex];
										nMean -= nMinValue;
										if (this.plot_last_mean[yi]) {
											plotShape = map.Dom.newShape('path', gridGroup, 'M' + (this.plot_last_mean[yi].x) + ',' + (this.plot_last_mean[yi].y - this.nDeviationA[nIndex - 1] * nScale) +
												' L ' + (nAxis) + ',' + ((-nMean - this.nDeviationA[nIndex]) * nScale) + ' ' +
												(nAxis) + ',' + ((-nMean + this.nDeviationA[nIndex]) * nScale) + ' ' +
												(this.plot_last_mean[yi].x) + ',' + (this.plot_last_mean[yi].y + this.nDeviationA[nIndex - 1] * nScale) + ' z', "fill:#d8d8dd;fill-opacity:0.2;stroke:none;");
											if (plotShape) {
												plotShape.setAttributeNS(szMapNs, "tooltip", "standard deviation");
											}
											plotShape = map.Dom.newShape('line', shapeGroup, this.plot_last_mean[yi].x, this.plot_last_mean[yi].y, nAxis, (-nMean) * nScale, "stroke:#888888;stroke-width:" + map.Scale.normalX(2) + ";stroke-linecap:round;stroke-dasharray:10 80;");
											if (plotShape) {
												plotShape.setAttributeNS(szMapNs, "tooltip", "mean");
											}
											/**
											plotShape = map.Dom.newShape('line',shapeGroup,this.plot_last_mean[yi].x,this.plot_last_mean[yi].y-this.nDeviationA[nIndex-1]*nScale,nAxis,(-nMean-this.nDeviationA[nIndex])*nScale,"stroke:#ffffff;stroke-opacity:0.5;stroke-width:"+map.Scale.normalX(1)+";stroke-linecap:round;stroke-dasharray:10 80;");
											if (plotShape){ 
												plotShape.setAttributeNS(szMapNs,"tooltip","standard deviation");
											}
											plotShape = map.Dom.newShape('line',shapeGroup,this.plot_last_mean[yi].x,this.plot_last_mean[yi].y+this.nDeviationA[nIndex-1]*nScale,nAxis,(-nMean+this.nDeviationA[nIndex])*nScale,"stroke:#ffffff;stroke-opacity:0.5;stroke-width:"+map.Scale.normalX(1)+";stroke-linecap:round;stroke-dasharray:10 80;");
											if (plotShape){
												plotShape.setAttributeNS(szMapNs,"tooltip","standard deviation");
											}
											**/
										}
										this.plot_last_mean[yi] = new point(nAxis, (-nMean) * nScale);
									}
									this.plot_last_last_position[yi] = szFlag.match(/STACKED/) ? (this.plot_last_position[yi] || new point(0, 0)) : new point(0, 0);
									this.plot_last_position[yi] = (nPValue >= 0) ? new point(nAxis, (-nPValue) * nScale) : new point(nAxis, 0);
									this.plot_last_shape[yi] = newShape;
									this.plot_last_areaValue[yi] = nValue;

									this.plot_area_points.push(new point(nAxis, ((-nPValue) * nScale)));

								} else
								if (szFlag.match(/LOLLIPOP/) && nValue) {
									plotShape = map.Dom.newShape('line', plotGroup, nAxis, 0, nAxis, (-nPValue) * nScale, "stroke:" + (szColor) + ";stroke-width:" + map.Scale.normalX(3) + ";stroke-linecap:round;");
									if (plotShape) {
										plotShape.setAttributeNS(szMapNs, "value", String(nValue));
										plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
										plotShape.setAttributeNS(szMapNs, "time", String(uTime));
									}
								} else
								if (szFlag.match(/LASTPOP/) && nValue ) {
									plotShape = map.Dom.newShape('line', plotGroup, nAxis, 0, nAxis, (-nPValue) * nScale, "stroke:" + (szColor) + ";stroke-width:" + map.Scale.normalX(3) + ";stroke-linecap:round;");
									if (plotShape) {
										plotShape.setAttributeNS(szMapNs, "value", String(nValue));
										plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
										plotShape.setAttributeNS(szMapNs, "time", String(uTime));
									}
								} else
								if (nPartsA.length / this.nGridX > 1) {

									// plot with more than 1 set of values
									// -----------------------------------
									// bubble, line or area charts with more than one item per x value 
									// es. a line chart with 2 lines
									//
									// the data for every item must be a value array with X x Y values
									//
									// example: 3 curves with 10 values
									// the data array must have 30 values, with the order:    
									// curve1valueA, curve2valueA, curve3valueA, curve1valueB, curve2valueB, curve3valueB, ...
									//
									// and this.nGridX must be 3 !!!
									// ---------------------------------------------------------------------------------------	

									if (szFlag.match(/PLOTVAR/)) {
										newShape.style.setProperty("fill-opacity", ((xi == (nPartsA.length / this.nGridX)) ? "1" : "0.2"), "");
										newShape.style.setProperty("stroke-width", ((xi == (nPartsA.length / this.nGridX)) ? "0" : "3"), "");

										var plotShape = null;
										if (this.plot_last_position[yi]) {
											if (szFlag.match(/PLOTVAR/)) {
												plotShape = map.Dom.newShape('line', shapeGroup, this.plot_last_position[yi].x, this.plot_last_position[yi].y, nAxis, (-nPValue) * nScale, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(2) + ";");
												if (plotShape){
													plotShape.setAttributeNS(szMapNs, "value", String(nValue));
													plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
													plotShape.setAttributeNS(szMapNs, "time", String(uTime));
													plotShape.parentNode.insertBefore(plotShape, plotShape.parentNode.firstChild);
												}

												plotShape = map.Dom.newShape('line', shapeGroup, this.plot_last_position[yi].x - 40, this.plot_last_position[yi].y, this.plot_last_position[yi].x + 40, this.plot_last_position[yi].y, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(this.nLineWidth || 3) + ";");
												if (plotShape){
													plotShape.setAttributeNS(szMapNs, "value", String(nValue));
													plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
													plotShape.setAttributeNS(szMapNs, "time", String(uTime));
													plotShape.parentNode.insertBefore(plotShape, plotShape.parentNode.firstChild);
												}

												plotShape = map.Dom.newShape('line', shapeGroup, nAxis, 0, nAxis, -this.nPlotHeight, "stroke:#dddddd;stroke-width:" + map.Scale.normalX(0.25) + ";");
												if (plotShape){
													plotShape.setAttributeNS(szMapNs, "value", String(nValue));
													plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
													plotShape.setAttributeNS(szMapNs, "time", String(uTime));
													plotShape.parentNode.insertBefore(plotShape, plotShape.parentNode.firstChild);
												}
											} else {
												plotShape = map.Dom.newShape('line', shapeGroup, this.plot_last_position[yi].x, this.plot_last_position[yi].y, nAxis, (-nPValue) * nScale, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(this.nLineWidth || 3) + ";");
												if (plotShape){
													plotShape.setAttributeNS(szMapNs, "value", String(nValue));
													plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
													plotShape.setAttributeNS(szMapNs, "time", String(uTime));
													shapeGroup.insertBefore(plotShape, this.plot_last_shape[yi]);
												}
											}
										}
										this.plot_last_last_position[yi] = this.plot_last_position[yi] || new point(0, 0);
										this.plot_last_position[yi] = new point(nAxis, (-nPValue) * nScale);
										this.plot_last_shape[yi] = newShape;
									} else if (szFlag.match(/BOX/)) {
										map.Dom.newShape('line', gridGroup, nAxis, 0, nAxis, -this.nPlotHeight, "stroke:#dddddd;stroke-width:" + map.Scale.normalX(0.25) + ";");
									}
								} else {

									// 'normal' plot
									// -------------

									if (szFlag.match(/PLOTVAR/)) {

										// show standard deviation
										//
										var plotShape = null;
										var nMean = szFlag.match(/MEDIAN/) ? this.nMedianA[nIndex] : this.nMeanA[nIndex];
										nMean -= nMinValue;

										plotShape = map.Dom.newShape('line', gridGroup, nAxis, -(nMean - this.nDeviationA[nIndex]) * nScale, nAxis, -(nMean + this.nDeviationA[nIndex]) * nScale, "stroke:" + "#444444" + ";stroke-width:" + map.Scale.normalX(1) + ";");
										if (plotShape){
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}

										plotShape = map.Dom.newShape('line', gridGroup, nAxis - 40, -(nMean) * nScale, nAxis + 40, -(nMean) * nScale, "stroke:" + "#444444" + ";stroke-width:" + map.Scale.normalX(2) + ";");
										if (plotShape){
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}
										
										plotShape = map.Dom.newShape('line', gridGroup, nAxis - 80, -(nMean - this.nDeviationA[nIndex]) * nScale, nAxis + 80, -(nMean - this.nDeviationA[nIndex]) * nScale, "stroke:" + "#444444" + ";stroke-width:" + map.Scale.normalX(1) + ";");
										if (plotShape){
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}
										plotShape = map.Dom.newShape('line', gridGroup, nAxis - 80, -(nMean + this.nDeviationA[nIndex]) * nScale, nAxis + 80, -(nMean + this.nDeviationA[nIndex]) * nScale, "stroke:" + "#444444" + ";stroke-width:" + map.Scale.normalX(1) + ";");
										if (plotShape){
											plotShape.setAttributeNS(szMapNs, "value", String(nValue));
											plotShape.setAttributeNS(szMapNs, "class", String(nClass % (this.nGridX || 1000000)));
											plotShape.setAttributeNS(szMapNs, "time", String(uTime));
										}

										map.Dom.newShape('line', gridGroup, nAxis, 0, nAxis, -this.nPlotHeight, "stroke:#dddddd;stroke-width:" + map.Scale.normalX(0.25) + ";");
										if (this.plot_last_position[yi]) {
											plotShape = map.Dom.newShape('line', gridGroup, this.plot_last_position[yi].x, this.plot_last_position[yi].y, nAxis, (-nMean) * nScale, "stroke:#888888;stroke-width:" + map.Scale.normalX(1) + ";");
										}

										this.plot_last_last_position[yi] = this.plot_last_position[yi] || new point(0, 0);
										this.plot_last_position[yi] = new point(nAxis, (-nMean) * nScale);

									} else if (szFlag.match(/BOX/)) {
										map.Dom.newShape('line', gridGroup, nAxis, 0, nAxis, -this.nPlotHeight, "stroke:#aaaaaa;stroke-width:" + map.Scale.normalX(0.25) + ";");
									}
								}

								this.plot_last_value[xi] = nValue;
								this.plot_last_stacked_value[xi] = nPValue;
							}
							nSymbolOffsetY = 0;

						} else {

							if (szSymbol == "label") {
								nSymbolOffsetY -= nLabelHeight / 1.95;
							}
							newShape.fu.setPosition(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
							if (newShapeBg) {
								newShapeBg.fu.setPosition(map.Scale.normalX(0) + nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
							}
							if (newText) {
								newText.fu.setPosition(nSymbolOffsetX, map.Scale.normalY(0) + nSymbolOffsetY);
							}
							if (szSymbol == "label") {
								nSymbolOffsetY -= nLabelHeight / 1.95;
							} else {
								nSymbolOffsetY -= nRadius;
							}
						}
					}
				}
			}
		}
		// if we have values, move to top
		if (shapeTextGroup && shapeTextGroup.parentNode) {
			shapeTextGroup.parentNode.appendChild(shapeTextGroup);
		}
		// if we have one shape of a sequence defined as top, move it there
		if (topShape && topShape.parentNode) {
			topShape.parentNode.appendChild(topShape);
		}
		// also the text !
		if (topText && topText.parentNode) {
			topText.parentNode.appendChild(topText);
		}
		if (topText2 && topText2.parentNode) {
			topText2.parentNode.appendChild(topText2);
		}
		// also lines on top of the chart !
		//if (topGroup) {
		//	topGroup.parentNode.appendChild(topGroup);
		//}

		// for single color area chart, redraw continous polygon to avoid 'ugly' vertical lines  
		if (0 & szFlag.match(/AREA/) && !this.nGridX && this.plot_area_points && this.plot_area_points.length) {
			var fdo = true;
			var np = this.plot_area_points.length;
			for (var p = 0; p < np; p++) {
				if (this.plot_area_points[p].y === 0) {
					fdo = false;
				}
			}
			if (fdo || szFlag.match(/ZEROISVALUE/)) {
				var d = "M" + (this.plot_area_points[0].x) + ',' + (this.plot_area_points[0].y) + " L ";
				for (var p = 1; p < np; p++) {
					d += (this.plot_area_points[p].x) + ',' + (this.plot_area_points[p].y) + " ";
				}
				d += (this.plot_area_points[np - 1].x) + ',' + (0) + " ";
				d += (0) + ',' + (0) + " ";
				d += "z ";
				this.plot_area_shapes[0].setAttributeNS(null, "d", d);
			}
		}
		
		// draw linear regression line 
		if (szFlag.match(/\bLINREG\b/)) {
			var x1 = 0;
			var x2 = nPartsA.length-1;
			var y1 = linreg_m * x1 + linreg_b;
			var y2 = linreg_m * x2 + linreg_b;
			var szLineColor = this.szLineColorA ? this.szLineColorA[0] : this.chart.szColor;

			var linearRegressionShape = map.Dom.newShape('line', plotGroup, x1*nStep, -y1*nScale, x2*nStep, -y2*nScale, "stroke:"+szLineColor+";stroke-width:50;stroke-dasharray:50 50"); 
			linearRegressionShape.setAttributeNS(szMapNs,"tooltip","linerar regression");
		}

		// set frame size
		if (typeof (this.szSymbolBoxStyle) != 'undefined') {
			var bBox = map.Dom.getBox(shapeGroup);
			newFrame.setAttributeNS(null, "x", -map.Scale.normalX(15));
			newFrame.setAttributeNS(null, "y", -map.Scale.normalY(15));
			newFrame.setAttributeNS(null, "width", map.Scale.normalX(30 * nSymbols));
			newFrame.setAttributeNS(null, "height", map.Scale.normalY(30));
			newFrame.setAttributeNS(null, "fill-opacity", 1.0);
		}

		ptNull.x = map.Scale.normalY(0);
		ptNull.y = map.Scale.normalY((szFlag.match(/ZOOM/) || szFlag.match(/MENUSIZE/)) ? 20 : nRadius / map.Scale.normalY(1) + 5);
	}

	// == BUFFER ==============================================================================
	else if (szFlag.match(/BUFFER/)) {
		var nMaxValue = this.nMaxA[0];
		var nValue = nPartsA[0];
		var nRadius = this.nBufferSize ? this.nBufferSize : 1000;
		// line buffer cannot be scaled, so we must apply scale on redraw
		if (this.szShapeType.match(/line/)) {
			nRadius *= this.nScale;
		}

		nRadius = map.Scale.getDeltaXofDistanceInMeter(nRadius);
		var szColor = this.colorScheme[0];

		if (this.szFields && this.szFields.length && this.nRangesA && this.nRangesA.length) {
			szColor = null;
			var i;
			if (this.nRangesA.length == this.colorScheme.length) {
				for (i = 0; i < this.nRangesA.length; i++) {
					if ((nValue == this.nRangesA[i]) || (Number(nValue) == Number(this.nRangesA[i]))) {
						szColor = this.colorScheme[i];
						var cColor = __maptheme_getChartColors(szColor);
						if (typeof (this.szBorderColor) != 'undefined') {
							szLineColor = this.szBorderColor;
						} else {
							szLineColor = (this.fillOpacity < 0.8) ? "#888888" : cColor.textColor;
						}
						break;
					}
				}
			}
		}
		if (this.szShapeType.match(/dummy||point/)) {
			// circle buffer	
			if (szColor) {
				nChartSize = nRadius * 2 / map.Scale.normalX(1);
				ptNull.x = 0;
				ptNull.y = nRadius + map.Scale.normalY(5);
				var nFillOpacity = 1;
				nFillOpacity = 0.75;
				if (this.szFlag.match(/OVERLAY/) || (this.fillOpacity === 0)) {
					nFillOpacity = this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 0);
				}
				nFillOpacity = this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 0);
				// GR 20.09.2011 style is set in chart group g element
				var newShape = map.Dom.newShape('circle', shapeGroup, 0, 0, nRadius, "");
				if (this.szFlag.match(/VALUE/)) {
					var szTextStyle = "font-family:arial;font-size:" + (map.Scale.normalX(30)) + "px;fill:#222222;fill-opacity:1;stroke:white;stroke-opacity:0.2;stroke-dasharray:none;pointer-events:none;";
					var newText = map.Dom.newText(shapeGroup, nRadius - map.Scale.normalX(20), 0, szTextStyle, Map.Scale.prototype.formatDistanceString(this.nBufferSize));
				}
				this.nRealizedCount++;
			} else {
				return new point(0, 0);
			}
		}
		if (this.szShapeType.match(/line/)) {
			// linear buffer
			var shapeNode = SVGDocument.getElementById(a);
			var szId = shapeNode.getAttributeNS(null, "id");
			if (!szId.match(":paint")) {
				var cloneShape = SVGDocument.getElementById(szId + ":paint");
				if (!cloneShape) {
					var cloneShape = shapeNode.cloneNode(1000);
					shapeGroup.appendChild(cloneShape);
					cloneShape.setAttributeNS(null, "id", szId + ":paint");
				}
				shapeNode = cloneShape;
				this.nRealizedCount++;
			}
			var nStrokeWidth = nRadius * 2 / map.Scale.normalX(1);
			shapeNode.setAttributeNS(null, "style", "fill:none;stroke:" + szColor + ";stroke-linejoin:round;stroke-linecap:round;stroke-width:" + map.Scale.normalX(nStrokeWidth) * map.Scale.nZoomScale + ";stroke-opacity:" + String(this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 0)) + "");
			// return null, to disable positioning or scaling
			return null;
		}
	}

	// == BAR CHART =================================================================================
	else if (szFlag.match(/BAR/) || szFlag.match(/BARS/)) {
		var nPosX = 0;
		var nPosY = 0;

		var origChartSize = nChartSize;
		var nSizer = 1;

		// ----- get nSizer ------------------------------------------------------

		var nHeight = 0;
		var nSize = 1;
		var nRange = this.nMax - this.nMin;
		var nRange100 = this.nMax100 - this.nMin100;
		if (this.nNormalSizeValue) {
			nRange = nRange100 = this.nMaxSize = this.nNormalSizeValue;
		}

		// by sizefield
		//
		if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/) && this.szSizeField && a && this.itemA[a]) {
			if (szFlag.match(/SIZELOG/)) {
				nSizer = 1 / Math.max(1,Math.log((this.nMaxSize)) * Math.log(this.itemA[a].nSize));
			} else
			if (szFlag.match(/SIZEP4/)) {
				nSizer = 1 / Math.pow((this.nMaxSize), 1 / 4) * Math.pow(this.itemA[a].nSize, 1 / 4);
			} else
			if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
				nSizer = 1 / Math.pow((this.nMaxSize), 1 / 3) * Math.pow(this.itemA[a].nSize, 1 / 3);
			} else {
				nSizer = 1 / Math.sqrt((this.nMaxSize)) * Math.sqrt(this.itemA[a].nSize);
			}
		}
		// by values
		//
		else if (szFlag.match(/SIZE/) && !szFlag.match(/NORMSIZE/)) {

			var nValueSum = nMySum;
			// GR 30.01.2015 special case POINTER, they will be sized individually 
			//
			if (szFlag.match(/POINTER/)) {
				nValueSum /= nPartsA.length;
			}

			if (szFlag.match(/SIZELOG/)) {
				nSizer = 1 / Math.max(1,Math.log((nRange)) * Math.log(Math.abs(nValueSum)));
			} else
			if (szFlag.match(/SIZEP4/)) {
				nSizer = 1 / Math.pow((nRange), 1 / 4) * Math.pow(Math.abs(nValueSum), 1 / 4);
			} else
			if (szFlag.match(/3D/) || szFlag.match(/SIZEP3/) || szFlag.match(/SIZEVOLUME/)) {
				nSizer = 1 / Math.pow((nRange), 1 / 3) * Math.pow(Math.abs(nValueSum), 1 / 3);
			} else {
				nSizer = 1 / Math.pow((nRange), 1 / 2) * Math.pow(Math.abs(nValueSum), 1 / 2);
			}
		}
		// ------------------------------------------------------------

		// GR 12.03.2013 in case of nMySum == max value -> 0 so set it to fix
		if ((nSizer === 0) && (nMySum !== 0)) {
			nSizer = 30 / nChartSize;
		}

		// calcolate chartsize
		// -------------------
		//
		nChartSize = nChartSize * nSizer;

		// bar width and textsize
		// ----------------------

		//var nWidth = map.Scale.normalX(Math.min(8*nSizer,nChartSize/nPartsA.length)); 
		var nWidth = map.Scale.normalX(nChartSize / nPartsA.length * 0.66);

		if (szFlag.match(/STACKED/)) {
			nWidth = map.Scale.normalX(nChartSize / 3);
			if (this.nGridX && !szFlag.match(/MULTI/)) {
				nWidth /= 2;
			}
		}
		// GR 16.06.2011 give me nice MENUSIZE bars
		if (szFlag.match(/MENUSIZE/) && nPartsA.length == 1) {
			nWidth = map.Scale.normalX(nChartSize / 2);
		}

		//var nTextSize = Math.min(map.Scale.normalX(6),(nWidth<map.Scale.normalX(5)?(nWidth*4/5):(nWidth*5/5))); 
		var nTextSize = (nWidth < map.Scale.normalX(5) ? (nWidth * 4 / 5) : (nWidth * 5 / 5));
		var nTextOpacity = 1;

		if (szFlag.match(/COLUMN/)) {
			nWidth = nWidth * (szFlag.match(/THICK/) ? 2 : (szFlag.match(/THIN/) ? 1 : 1.5));
		}
		if (szFlag.match(/THIN/)) {
			nWidth = nWidth * 0.6;
			nTextSize = nTextSize * 0.75;
		}
		if (szFlag.match(/THICK/)) {
			nWidth = nWidth * 1.5;
			nTextSize = nTextSize * 1.5;
		}
		if (szFlag.match(/STACKED/)) {
			nTextSize = map.Scale.normalX(5);
		} else
		if ((szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) && (nPartsA.length == 1)) {
			nTextSize = nTextSize * 2.5;
		}

		if (szFlag.match(/STACKED/) && !szFlag.match(/ZOOM/)) {
			nTextSize *= nSizer;
		}

		nTextSize *= (this.nValueScale||1);

		//nTextSize = Math.max(map.Scale.normalX(2),nTextSize);
		var szTextStyle = "font-family:arial;font-size:" + (nTextSize * 0.95) + "px;fill:#606060;pointer-events:none;";
		szTextStyle = map.Scale.tStyle.Values.szStyle + "font-size:" + (nTextSize * 0.95) + "px";
		var szTextBgStyle = szTextStyle + ";fill:none;stroke:none;";


		// bar height scale (nStep)
		// ----------------------------------
		//

		// GR 04.04.2009 - if we don't want normalized size
		if (!szFlag.match(/NORMSIZE/) && !szFlag.match(/MENUSIZE/) && !this.szFlag.match(/NORMSIZE/) && !this.szFlag.match(/MENUSIZE/)) {
			// GR 22.03.2009 - override by directly defined normal size value
			if (this.nNormalSizeValue && (!this.szField100 || szFlag.match(/POINTER/))) {
				nMax = this.nNormalSizeValue;
			}
		}
		// GR 15.06.2011 - override by directly defined max size - needed for selections
		if (this.nOverrideMax) {
			nMax = this.nOverrideMax;
		}

		var nStep = map.Scale.normalX(origChartSize) / nMax; // this.nMax;

		if (szFlag.match(/OFFSETMEAN/) || szFlag.match(/OFFSETMEDIAN/) || szFlag.match(/DEVIATION/)) {
			nStep = map.Scale.normalX(nChartSize) / 300;
		}
		if (szFlag.match(/SIZE/) && szFlag.match(/SEQUENCE/) && a && (nPartsA.length > 1) && !this.szSizeField && !this.szField100) {
			nStep = nStep * nPartsA.length / nSizer;
		} else
		if (szFlag.match(/SIZE/) && a && (nPartsA.length > 1) && !szFlag.match(/EXPAND/)) {
			if (this.szField100 || szFlag.match(/POINTER/)) {
				nStep = nStep * nSizer;
			} else {
				nStep = nStep / (szFlag.match(/SIZEP4/) ? (nSizer * nSizer) : nSizer);
			}
		}

		//if (this.nRangeScale && !(szFlag.match(/ZOOM/) && szFlag.match(/HORZ/))) {
		if (this.nRangeScale) {
			nStep = nStep * this.nRangeScale;
		}

		if (szFlag.match(/COMPRESSMAX/)) {
			nStep = nStep / 4;
		} else
		if (szFlag.match(/COMPRESSMORE/)) {
			nStep = nStep / 3;
		} else
		if (szFlag.match(/COMPRESS/)) {
			nStep = nStep / 2;
		} else
		if (szFlag.match(/EXPANDMAX/)) {
			nStep = nStep * 4;
		} else
		if (szFlag.match(/EXPANDMORE/)) {
			nStep = nStep * 3;
		} else
		if (szFlag.match(/EXPAND/)) {
			nStep = nStep * 2;
		}

		if (szFlag.match(/POINTER/) && !szFlag.match(/NORMSIZE/)) {
			nStep *= 1.2;
		}

		// some other parameters
		// ----------------------

		var barGroup = map.Dom.newGroup(shapeGroup, "");

		if (szFlag.match(/\bSORT\b/)) {
			this.sortedIndex = [];
			for (i = 0; i < nPartsA.length; i++) {
				this.sortedIndex[i] = {
					index: i,
					value: nPartsA[i]
				};
			}
			this.sortedIndex.sort(szFlag.match(/STACKED/) ? this.sortIndexUp : this.sortIndexDown);
		} else {
			this.sortedIndex = null;
		}

		var nStartI = 0;
		if (szFlag.match(/\bUP\b/)) {
			nStartI = nPartsA.length - 1;
		}
		var nCenter = 1;
		if (szFlag.match(/CENTER/)) {
			nCenter = 2;
		}

		// --------------------
		// make the bars
		// --------------------

		var minNextTextPos = new point(0, 0);
		var lastValue = null;
		var lastHeight = null;
		var lastX = null;
		var lastY = null;
		var lastWidth = null;
		var lastColor = null;
		var nValueSum = 0;
		var nBarsDrawn = 0;
		var nClass = null;

		var nOldStep = nStep;

		for (i = ((this.nClipParts && (this.nClipParts < nPartsA.length)) ? (nPartsA.length - this.nClipParts) : 0); i < nPartsA.length; i++) {

			if (this.szShowParts) {
				var skipIt = true;
				for (p in this.szShowPartsA) {
					if (this.szShowPartsA[p] == i) {
						skipIt = false;
					}
				}
				if (skipIt) {
					continue;
				}
			}


			nStep = nOldStep;

			var nIndex = Math.abs(nStartI - i);
			if (this.sortedIndex) {
				nIndex = this.sortedIndex[nIndex].index;
			}

			var nValue = nPartsA[nIndex];

			// GR 18.02.2009 clip = sequence
			// ------------------------------
			if (this.szFlag.match(/\bCLIP\b/) && !this.szFlag.match(/MORPH/) && this.nClipFrames) {
				if ((this.nClipFrames == nPartsA.length)) {
					nValue = Number(nPartsA[this.nActualFrame]);
				} else {
					nValue = nPartsA[0] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + nPartsA[nPartsA.length - 1] * this.nActualFrame / (this.nClipFrames - 1);
				}
				nIndex = this.nActualFrame;
				i = nPartsA.length;
			}

			var nTextValue = nValue;

			// GR 20.10.2015
			if (szFlag.match(/INVERT/)) {
				if ((nValue !== 0) || (szFlag.match(/ZEROISVALUE/))) {
					nValue = this.nMax - nValue;
				}
			}

			// GR 04.03.2020 if(0) GR 01.02.2011
			if (0 && szFlag.match(/DIFFERENCE/) && szFlag.match(/SUM/)) {
				nValueSum += nValue;
				nTextValue = nValueSum;
			}
			var szValue = this.formatValue(nValue, this.nValueDecimals || 2);

			// special case where we calcolate the deviation from mean/median
			// --------------------------------------------------------------
			if (szFlag.match(/OFFSETMEAN/) || szFlag.match(/OFFSETMEDIAN/)) {
				if (szFlag.match(/OFFSETMEAN/)) {
					nValue = 100 / this.nMeanA[nIndex] * nValue;
				}
				if (szFlag.match(/OFFSETMEDIAN/)) {
					nValue = 100 / this.nMedianA[nIndex] * nValue;
				}
				nValue -= 100;
				// GR 30.06.2014 assert nValue
				nValue = (isFinite(nValue) && !isNaN(nValue)) ? nValue : 0;
				nTextValue = nValue;
				nMax = 100;
				szValue = this.formatValue(nValue, this.nValueDecimals || 2);
				if (nValue > 0) {
					szValue = "+" + szValue;
				}
			} else
			if (szFlag.match(/DEVIATION/)) {
				nValue = (nValue - this.nMeanA[nIndex]) / this.nDeviationA[nIndex];
				// GR 30.06.2014 assert nValue
				nValue = (isFinite(nValue) && !isNaN(nValue)) ? nValue : 0;
				nTextValue = nValue;
				nValue *= 100;
				szValue = this.formatValue(nValue, this.nValueDecimals || 2);
				if (nValue > 0) {
					szValue = "+" + szValue;
				}
			}

			// define color
			// --------------------------------------------------------------
			// position -> color
			// GR 09.04.2020 repetitive coloscheme with gridx
			var nColor = this.colorScheme[nIndex]||this.colorScheme[nIndex%(this.nGridX||1000000)];
			var nClass = nIndex%(this.nGridX||1000000);

			// or: value -> class -> color 
			if ((szFlag.match(/SEQUENCE|CLIP/) || (nPartsA.length == 1)) && this.colorScheme.length >= 2) {
				nColor = this.colorScheme[this.partsA.length - 1];
				for (ii = 0; ii < this.partsA.length; ii++) {
					if (nValue < this.partsA[ii].max) {
						nColor = this.colorScheme[ii];
						nClass = ii;
						break;
					}
				}
			}

			// handle different chart types 
			// --------------------------------------------------------------
			if (szFlag.match(/LEFT/) && szFlag.match(/HORZ/)) {
				nValue = -nValue;
			}

			if (nValue < 0 && !szFlag.match(/STACKED/)) {
				nPosY = -nValue * nStep;
				nValue = -nValue;
			}

			// special bar derivations 
			// --------------------------------------------------------------
			if (szFlag.match(/VOLUME/) && szFlag.match(/3D/)) {

				// 3D qube
				// -------

				nStep = 1;
				// GR 03.09.2007 explicit size field
				if (this.szSizeField && a) {
					nValue = nWidth = (map.Scale.normalX(nChartSize / 3 * 2) * Math.pow((1 / this.nMaxSize * this.itemA[a].nSize), 1 / 3));
				} else {
					nValue = nWidth = (map.Scale.normalX(nChartSize / 3 * 2) * Math.pow((1 / nMax * nValue), 1 / 3));
				}
			} else {

				// sized pointer
				//
				// dynamic width of pointer, must e done here, because we need nMax
				// ----------------------------------------------------------------
				if (szFlag.match(/POINTER/) && szFlag.match(/SIZE/) && a) {
					if (szFlag.match(/WIDTH/) && nValue100 &&
						(!(szFlag.match(/DIFFERENCE/) || szFlag.match(/RELATIVE/) || szFlag.match(/FRACTION/)) ||
							(szFlag.match(/OFFSETMEAN/) || szFlag.match(/OFFSETMEDIAN/) || szFlag.match(/DEVIATION/)))
					) {
						// dynamic width by value100 -> width equals importance
						nWidth = (map.Scale.normalX(nChartSize) * Math.pow(Math.abs(1 / this.nMax100 * nValue100), 1 / 2));
					} else {
						// dynamic width by value -> pointer sized 
						nWidth = (map.Scale.normalX(nChartSize) * Math.pow(Math.abs(1 / nMax * nValue), 1 / 3));
					}

					// dynamic text size and opacity - experimental !
					// ----------------------------------------------
					nTextSize = nWidth * 0.6;
					if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
						nTextSize = ((nTextSize * map.Layer.nDynamicObjectScale) > map.Scale.normalX(this.nValueSizeMin)) ? nTextSize : 0;
					}
					if (!szFlag.match(/ZOOM|XAXIS/)) {
						nTextOpacity = Math.pow(Math.abs(nValue), 1 / 2) / Math.pow(this.nMax, 1 / 2);
						if (this.szFadeValuePow && Number(this.szFadeValuePow)) {
							nTextOpacity = Math.pow(Math.abs(nValue), Number(this.szFadeValuePow)) / Math.pow(nMax, Number(this.szFadeValuePow));
						}
					}
				}

				// normal pointer with dynamic fade label
				// ----------------------------------------------------------------
				if (szFlag.match(/DTEXT/) && a && !szFlag.match(/ZOOM/)) {
					// dynamic text size and opacity - experimental !
					// ----------------------------------------------
					nTextSize = (map.Scale.normalX(nChartSize / 3 * 2) * Math.pow(Math.abs(1 / nMax * nValue), 1 / 2)) * 0.75;
					if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
						nTextSize = ((nTextSize * map.Layer.nDynamicObjectScale) > map.Scale.normalX(this.nValueSizeMin)) ? nTextSize : 0;
					}
					nTextOpacity = Math.pow(Math.abs(nValue), 1 / 3) / Math.pow(nMax, 1 / 3);
				} else {
					if (this.nValueSizeMin && !szFlag.match(/ZOOM/)) {
						nTextSize = ((nTextSize * map.Layer.nDynamicObjectScale) > map.Scale.normalX(this.nValueSizeMin)) ? nTextSize : 0;
					}
				}

			}

			// =======================
			// finally, make the bar !
			// =======================

			// GR 30.06.2014 assert nValue
			nValue = (isFinite(nValue) && !isNaN(nValue)) ? nValue : 0;

			if ((nValue === 0) && szFlag.match(/NOZERO/)) {
				nPosY = 0;
				continue;
			}
			if ((nTextValue < 0) && szFlag.match(/NONEGATIVE/)) {
				nPosY = 0;
				continue;
			}
			if ((nTextValue > 0) && szFlag.match(/ONLYNEGATIVE/)) {
				nPosY = 0;
				continue;
			}

			var barShape = map.Dom.newGroup(barGroup, "");

			//chartGroup.setAttributeNS(szMapNs, "value", "seechilds");

			// GR 16.06.2011 give me nice MENUSIZE bars, make invisible bg rect to help sizeing 
			if (this.szFlag.match(/MENUSIZE/) && (nPartsA.length == 1) && !szFlag.match(/VOLUME/)) {
				nWidth *= 0.8;
				nValue = nWidth / nStep * 1.7;
				map.Dom.newShape('rect', barShape, 0, -map.Scale.normalY(nChartSize * 0.75), map.Scale.normalX(nChartSize * 0.5), map.Scale.normalY(nChartSize * 0.75), "fill:red;stroke:none;fill-opacity:0");
			}

			var nnValue = nValue;
			if (szFlag.match(/COLUMN/)) {

				// -------------
				// 3D column bar
				// -------------

				if (nValue * nStep > 0) {
					var donut = DonutCharts.newChart(SVGDocument, barShape, nPosX + nWidth / 2, 0, nWidth / 2, 0);
					donut.setStyle("3D");
					donut.addStyle("SILENT");
					donut.addPart(100, nValue * nStep * 2 - (szFlag.match(/SPACED/) ? (nWidth / 2) : nWidth / 5), nColor, 0, (this.szAggregation && this.szAggregation.match(/sum/)) ? this.formatValue(nPartsA[nI], this.nValueDecimals || (nPartsA[nI] < 5 ? 1 : 0), "ROUND") + this.szUnit : this.formatValue(nPartsA[nI], this.nValueDecimals || (nPartsA[nI] < 5 ? 1 : 0), "ROUND") + this.szUnit, this.formatValue(nPartsA[nI], 2) + this.szUnit + szLabel);
					donut.realize();
				}

			} else
			if (szFlag.match(/3D/)) {

				// -------------
				// 3D bar
				// -------------

				var cColor = __maptheme_getChartColors(nColor);

				if (szFlag.match(/VOLUME/) && lastHeight) {
					var nDY = (nValue * nStep - lastHeight) / 15;
					nPosY += nDY;
					var szColor = "white";
					szColor = "#444444";
					szColor = lastColor.borderColor;
					var szFillColor = lastColor.mainColor;
					var szFillOpacity = 0.3;
					if (lastHeight < nValue * nStep) {
						szFillOpacity = 0.2;
					}
					map.Dom.newShape('line', barShape, lastX + lastWidth, lastY - nDY, nPosX, nPosY - nDY, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.25) + ";");
					map.Dom.newShape('line', barShape, lastX + lastWidth, lastY - lastHeight - nDY, nPosX, nPosY - nValue * nStep - nDY, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.25) + ";");
					map.Dom.newShape('line', barShape, lastX + lastWidth + lastWidth / 3, lastY - lastWidth / 4 - nDY, nPosX + nWidth / 3, nPosY - nWidth / 4 - nDY, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.25) + ";");
					map.Dom.newShape('line', barShape, lastX + lastWidth + lastWidth / 3, lastY - lastHeight - lastWidth / 4 - nDY, nPosX + nWidth / 3, nPosY - nValue * nStep - nWidth / 4 - nDY, "stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.25) + "");
					map.Dom.newShape('path', barShape, 'M' + (lastX + lastWidth) + ',' + (lastY - nDY) + ' L ' + (nPosX) + ',' + (nPosY - nDY) + ' ' + (nPosX) + ',' + (nPosY - nValue * nStep - nDY) + ' ' + (lastX + lastWidth) + ',' + (lastY - lastHeight - nDY) + ' z', "fill:" + szFillColor + ";stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:" + szFillOpacity);
					if ((lastHeight - nValue * nStep) > -nWidth / 4) {
						map.Dom.newShape('path', barShape, 'M' + (lastX + lastWidth) + ',' + (lastY - lastHeight - nDY) + ' L ' + (nPosX) + ',' + (nPosY - nValue * nStep - nDY) + ' ' + (nPosX + nWidth / 3) + ',' + (nPosY - nValue * nStep - nWidth / 4 - nDY) + ' ' + (lastX + lastWidth + lastWidth / 3) + ',' + (lastY - lastHeight - lastWidth / 4 - nDY) + ' z', "fill:" + szFillColor + ";stroke:" + szColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:" + szFillOpacity);
					}
				}
				lastHeight = nValue * nStep;
				lastX = nPosX;
				lastY = nPosY;
				lastWidth = nWidth;
				lastColor = cColor;

				// GR 07.11.2008 show mean or median
				nnValue = this.nFilterA[nIndex];
				if (nnValue) {
					var tmpStyle = "fill:#FFFFFF;stroke:gray;stroke-width:" + map.Scale.normalX(0.5) + ";fill-opacity:0.1;stroke-opacity:0.1";
					map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (0) + ' l ' + nWidth + ',' + 0 + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' ' + (-nWidth) + ' ' + 0 + ' z', tmpStyle);
					map.Dom.newShape('rect', barShape, nPosX + nWidth / 3, -nnValue * nStep / nCenter - nWidth / 4, nWidth, nnValue * nStep, tmpStyle);
					map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (0) + ' l ' + '0,' + (-nnValue * nStep / nCenter) + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' 0,' + (nnValue * nStep) + ' z', tmpStyle);
					map.Dom.newShape('rect', barShape, nPosX, -nnValue * nStep / nCenter, nWidth, nnValue * nStep, tmpStyle);
					map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth) + ',' + (0) + ' l ' + '0,' + (-nnValue * nStep / nCenter) + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' 0,' + (nnValue * nStep) + ' z', tmpStyle);
					cColor.highColor = ColorScheme.getDerivateColor(nColor, 0.9);
				}

				if ((nPosY <= 0) || szFlag.match(/LEFT/) || szFlag.match(/VOLUME/)) {
					if (nValue) {
						// 3D bar front 
						if (nValue === 0) {
							cColor = __maptheme_getChartColors("none");
						}
						map.Dom.newShape('rect', barShape, nPosX, -nValue * nStep / nCenter, nWidth, nValue * nStep, "fill:" + cColor.mainColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";stroke-opacity:0.3");
						// 3D bar side 
						map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth) + ',' + (0) + ' l ' + '0,' + (-nValue * nStep / nCenter) + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' 0,' + (nValue * nStep) + ' z', "fill:" + cColor.lowColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + "");
						cColor.highColor = ColorScheme.getDerivateColor(nColor, 0.9);
					}
					// 3D bar top 
					var strokeOpacity = 1;
					map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (-nValue * nStep / nCenter) + ' l ' + nWidth + ',' + 0 + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' ' + (-nWidth) + ' ' + 0 + ' z', "fill:" + cColor.highColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";stroke-opacity:" + strokeOpacity);
				} else {
					map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (0) + ' l ' + nWidth + ',' + 0 + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' ' + (-nWidth) + ' ' + 0 + ' z', "fill:" + cColor.highColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.2");
					map.Dom.newShape('rect', barShape, nPosX + nWidth / 3, -nValue * nStep / nCenter - nWidth / 4, nWidth, nValue * nStep, "fill:" + cColor.mainColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.4");
					map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (0) + ' l ' + '0,' + (-nValue * nStep / nCenter) + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' 0,' + (nValue * nStep) + ' z', "fill:" + cColor.lowColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.4");
					cColor.highColor = ColorScheme.getDerivateColor(nColor, 0.9);
					map.Dom.newShape('rect', barShape, nPosX, -nValue * nStep / nCenter, nWidth, nValue * nStep, "fill:" + cColor.mainColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.4");
					map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth) + ',' + (0) + ' l ' + '0,' + (-nValue * nStep / nCenter) + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' 0,' + (nValue * nStep) + ' z', "fill:" + cColor.lowColor + ";stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.4");
					cColor.highColor = ColorScheme.getDerivateColor(nColor, 0.9);
				}
				// GR 07.11.2008 show mean or median
				if (nnValue) {
					map.Dom.newShape('rect', barShape, nPosX, -nnValue * nStep / nCenter, nWidth, nnValue * nStep, "fill:#FFFFFF;stroke:none;stroke-width:" + map.Scale.normalX(0.05) + ";fill-opacity:0.25");
					if (nnValue > nValue) {
						map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (-nnValue * nStep / nCenter) + ' l ' + nWidth + ',' + 0 + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' ' + (-nWidth) + ' ' + 0 + ' z', "fill:#8888FF;stroke:#444488;stroke-width:" + map.Scale.normalX(0.1) + ";fill-opacity:0.2");
					} else {
						map.Dom.newShape('path', barShape, 'M' + (nPosX) + ',' + (-nnValue * nStep / nCenter) + ' l ' + nWidth + ',' + 0 + ' ' + nWidth / 3 + ',' + (-nWidth / 4) + ' ' + (-nWidth) + ' ' + 0 + ' z', "fill:#8888FF;stroke:" + cColor.borderColor + ";stroke-width:" + map.Scale.normalX(0.1) + ";fill-opacity:0.1;stroke-opacity:0.4");
					}
				}
			} else
			if (szFlag.match(/Border/)) {
				map.Dom.newShape('rect', barShape, nPosX, -nValue * nStep / nCenter, nWidth, nValue * nStep, "fill:" + nColor + ";stroke:none;");
				var nOff = 2;
				var x1 = nPosX + nOff;
				var x2 = nPosX + nWidth - nOff;
				var y1 = nOff - nValue * nStep / nCenter;
				var y2 = y1 + nValue * nStep - nOff;
				var cColor = __maptheme_getChartColors(nColor);
				map.Dom.newShape('line', barShape, x1, y1, x1, y2, "stroke:white;stroke-width:" + map.Scale.normalX(0.001) + ";stroke-opacity:1.0");
				map.Dom.newShape('line', barShape, x1, y1, x2, y1, "stroke:white;stroke-width:" + map.Scale.normalX(0.001) + ";stroke-opacity:1.0");
				map.Dom.newShape('line', barShape, x1, y2, x2, y2, "stroke:black;stroke-width:" + map.Scale.normalX(0.001) + ";stroke-opacity:0.9");
				map.Dom.newShape('line', barShape, x2, y1, x2, y2, "stroke:black;stroke-width:" + map.Scale.normalX(0.001) + ";stroke-opacity:0.9");
			} else {
				// ------
				// 2D bar
				// ------

				if (szFlag.match(/POINTER/) && nValue) {

					// ---------------
					// 2D pointer bar
					// --------------

					// GR 30.11.2013 clip extremely heigh bar, by let them grow with .pow after height of 1000  
					if ((szFlag.match(/OFFSETMEAN/) || szFlag.match(/OFFSETMEDIAN/) || szFlag.match(/DEVIATION/)) && (Math.abs(nValue * nStep) > 1000)) {
						nStep = (1000 + (Math.abs(nValue * nStep) - 1000) / 10 + Math.abs(nValue * nStep) % 1000) / Math.abs(nValue);
					}

					var szStyle = "fill:" + nColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";stroke:" + (this.szLineColor || "black") + ";stroke-opacity:0.5;stroke-width:" + (map.Scale.normalX(this.nLineWidth) * Math.sqrt(nSizer || 1)) + "";
					if (nPosY <= 0) {
						// positive value
						if (!this.fShadow && this.fOrigShadow) {
							map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth / 7 + 10) + ',' + (-nValue * nStep / nCenter + 10) + ' l ' +
								-nWidth / 7 + ',' + 0 + ' ' +
								0 + ',' + (-nWidth / 15) + ' ' +
								nWidth / 2 + ',' + (-nWidth / 3) + ' ' + nWidth / 2 + ',' + nWidth / 3 + ' ' +
								0 + ',' + (nWidth / 15) + ' ' +
								-nWidth / 7 + ',' + 0 + ' ' +
								'0,' + (nValue * nStep) + ' ' + (-nWidth * 5 / 7) + ',0 ' +
								'z', "fill:000000;fill-opacity:0.5;stroke:none;");
						}
						map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth / 7) + ',' + (-nValue * nStep / nCenter) + ' l ' +
							-nWidth / 7 + ',' + 0 + ' ' +
							0 + ',' + (-nWidth / 15) + ' ' +
							nWidth / 2 + ',' + (-nWidth / 3) + ' ' + nWidth / 2 + ',' + nWidth / 3 + ' ' +
							0 + ',' + (nWidth / 15) + ' ' +
							-nWidth / 7 + ',' + 0 + ' ' +
							'0,' + (nValue * nStep) + ' ' + (-nWidth * 5 / 7) + ',0 ' +
							'z', szStyle);
					} else
					if (!(szFlag.match(/NONEGATIVE/))) {
						// negative value
						if (!(szFlag.match(/LEFT/))) {
							if (szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) {
								szStyle = "fill:" + nColor + ";stroke:" + nColor + ";stroke-width:" + map.Scale.normalX(0.25) + ";fill-opacity:0.5";
							} else
							if ((this.partsA.length > 2)) {
								var cColor = __maptheme_getChartColors(nColor);
								szStyle = "fill:" + nColor + ";stroke:" + cColor.lowColor + ";stroke-width:" + map.Scale.normalX(this.nLineWidth * 0.25 * nSizer || 0.25) + ";fill-opacity:" + (this.nFadeNegative || 0.1) + ";stroke-opacity:0.8";
							} else {
								var cColor = __maptheme_getChartColors(nColor);
								szStyle = "fill:" + (1 ? nColor : "white") + ";stroke:" + cColor.highColor + ";stroke-width:" + (map.Scale.normalX(this.nLineWidth) * Math.sqrt(nSizer || 1)) + ";fill-opacity:" + (this.nFadeNegative || 0.1) + ";stroke-opacity:1";
							}
						}
						map.Dom.newShape('path', barShape, 'M' + (nPosX + nWidth / 7) + ',' + (-nValue * nStep / nCenter) + ' l ' +
							nWidth * 5 / 7 + ',0 0,' + (nValue * nStep) + ' ' +
							nWidth / 7 + ',' + 0 + ' ' +
							(-nWidth / 2) + ',' + (nWidth / 4) + ' ' + (-nWidth / 2) + ',' + (-nWidth / 4) + ' ' +
							nWidth / 7 + ',' + 0 + ' ' +
							'z', szStyle);
					}
				} else {

					// -------------
					// simple 2D bar
					// -------------
					if ((nPosY <= 0) || szFlag.match(/LEFT/)) {
						map.Dom.newShape('rect', barShape, nPosX, -nValue * nStep / nCenter, nWidth, nValue * nStep, "fill:" + nColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";stroke:" + (this.szLineColor || "black") + ";stroke-width:" + map.Scale.normalX(this.nLineWidth * 0.25 * nSizer || 0.2) + ";stroke-opacity:" + (this.nLineWidth ? 1 : 0.1) + "");
					} else {
						map.Dom.newShape('rect', barShape, nPosX, -nValue * nStep / nCenter, nWidth, nValue * nStep, "fill:" + nColor + ";fill-opacity:" + (this.fillOpacity || 1) + ";stroke:" + nColor + ";stroke-width:" + map.Scale.normalX(0.25) + ";fill-opacity:0.3");
					}
					// GR 07.11.2008 show mean or median
					nnValue = this.nFilterA[nIndex];
					if (nnValue) {
						if ((nPosY <= 0) || szFlag.match(/LEFT/)) {
							map.Dom.newShape('rect', barShape, nPosX, -nnValue * nStep / nCenter, nWidth, nnValue * nStep, "fill:none;stroke:black;stroke-width:" + map.Scale.normalX(0.5) + ";stroke-opacity:0.1");
						} else {
							map.Dom.newShape('rect', barShape, nPosX, -nnValue * nStep / nCenter, nWidth, nnValue * nStep, "fill:none;stroke:" + nColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";fill-opacity:0.3");
						}
					}
				}
			}

			// add text values
			// ---------------
			if ((szFlag.match(/VALUES/) || this.szXaxisA) &&
				!((nPosY > 0) && szFlag.match(/NONEGATIVE/)) &&
				(szFlag.match(/ZOOM/) || !this.fHideValues)) {

				if (!nValue) {
					nValue = 0;
				}
				// GR 07.08.2008 new axis text
				// ---------------------------
				if (szFlag.match(/AXIS/) && (this.szLabelA || this.szXaxisA) &&
					!(szFlag.match(/STACKED/) && nIndex%(this.nGridX||1)) &&
					!(szFlag.match(/STACKED/) && szFlag.match(/HORZ/)) ) {
					
					var xi = nIndex/(this.nGridX||1);
					var szAxisText = (this.szXaxisA ? this.szXaxisA[xi] : (this.szLabelA ? this.szLabelA[xi] : " ")) || " ";
					var nAxisTextSize = nWidth * 0.5;
					if (szFlag.match(/\bUP\b/)) {
						nAxisTextSize = nWidth * 0.6;
					}
					if (szFlag.match(/\bHORZ\b/)) {
						nAxisTextSize = nWidth * 0.9;
					}
					
					var newText = map.Dom.newText(barShape, 0, 0, szTextStyle + ";fill:#666666;text-anchor:end;font-size:" + (nAxisTextSize) + "px", " " + szAxisText + " ");

					var ptPos = new point(map.Scale.normalX(0.8), nWidth / 2 + nTextSize / 5 * 2);

					if (this.fNegativeValues) {
						newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (-ptPos.x + nTextSize * 0.9 + 10) + ") rotate(270)");
					} else if (szFlag.match(/CENTER/)) {
						newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (map.Scale.normalX(nChartSize / 2) + nTextSize * 0.9) + ") rotate(270)");
					} else if (szFlag.match(/HORZ/)) {
						newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (-ptPos.x + nTextSize * 0.9 + 10) + ") rotate(270)");
					} else {
						newText.style.setProperty("text-anchor", "end", "");
						if (nPartsA.length == 1) {
							newText.setAttributeNS(null, "transform", "translate(" + (nPosX + (szFlag.match(/VOLUME/) ? nWidth * 1.3 : ptPos.y * 1.5)) + "," + (-ptPos.x) + ") ");
						} else {
							if (szAxisText.length > 1) {
								newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (nTextSize * 0.8) + ") rotate(315)");
							} else {
								newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y * 0.1) + "," + (-ptPos.x + nTextSize) + ")");
							}
						}
					}
				}
				// make the bar value label
				// ------------------------
				if (szFlag.match(/VALUES/) && (nTextSize > 0) && !(this.nGridX && (this.partsA.length / this.nGridX > 2))) {

					var szText = this.formatValue(nTextValue, this.nValueDecimals || ((this.nMax <= 1) ? 1 : 0));
					if (szFlag.match(/POINTER/) && (nTextValue > 0) && (this.nMin < 0 || szFlag.match(/OFFSETMEAN/) || szFlag.match(/OFFSETMEDIAN/) || this.szFlag.match(/\bSIGN\b/))) {
						szText = "+" + szText;
					}
					if (!szFlag.match(/VOLUME/)) {
						szText += (this.szUnit ? (" " + this.szUnit + " ") : "");
					}
					if (szFlag.match(/STACKED/) && (nTextValue !== 0) && (!nValue100) && (!this.nGridX)) {
						szText = szText + " (" + Math.round(nTextValue / nMySum * 100) + "%)";
					}
					if (szFlag.match(/STACKED/)) {
						if (szFlag.match(/ZOOM/)) {
							nTextSize = map.Scale.normalX(18);
						}else{
							nTextSize = map.Scale.normalX(5);
						}
						nTextSize *= (this.nValueScale||1);
					}

					var nTextLen = szText.length * nTextSize * 4 / 8;

					var newText = this.createTextLabel(SVGDocument, barShape, "", szText, nTextSize / map.Scale.normalX(1.0), null, ((nTextValue > 0) && (szFlag.match(/CTEXT/) || szFlag.match(/VALUEBACKGROUND/))) ? nColor : null, this.szTextColor);
					newText.style.setProperty("opacity", String(nTextOpacity), "");

					var newTextBg = null;
					var newUnitText = null;
					var newXaxisText = null;

					// add the xaxis description (if defined) GR 15.10.2007
					if (this.szXaxisA && szFlag.match(/CATEGORICAL/) && !szFlag.match(/AXIS/)) {
						var newXaxisText = map.Dom.newTSpan(newText, "fill:fill:#444444;font-size:" + (nTextSize) + "px", " " + this.szXaxisA[i]);
					}

					// position the value label
					// ------------------------
					var tLen = newText.fu.getBox().width;
					var ptPos = new point(map.Scale.normalX(-4), nWidth / 2 + nTextSize * 0.15);
					var fTextInside = true;

					if (
						(!szFlag.match(/DOINLINETEXT/) || szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) &&
						(szFlag.match(/VALUE/) && !(szFlag.match(/VOLUME/) && !szFlag.match(/ZOOM/)) && (
							szFlag.match(/THIN/) || szFlag.match(/NOINLINETEXT/) || szFlag.match(/DTEXT/) || szFlag.match(/SIZE/) ||
							(tLen + map.Scale.normalX(1)) > nValue * nStep / nCenter || szFlag.match(/STACKED/) || szFlag.match(/NORMSIZE/) || szFlag.match(/ZOOM/)))) {

						// text to large to keep inside the bar
						// ------------------------------------

						fTextInside = false;

						if (szFlag.match(/STACKED/)) {

							// with stacked bars, don't show zero values; the bar part doesn't exist  
							if ((nValue === 0) && !(szFlag.match(/ZEROISVALUE/))) {
								newText.parentNode.removeChild(newText);
							} else
							if (this.nGridX && ((nPartsA.length/this.nGridX)>2)) {
								newText.parentNode.removeChild(newText);

							} else {

								// special label placement for stacked bars
								// ----------------------------------------
								ptPos.x = 0;
								if (szFlag.match(/3D/)) {
									ptPos.x += nWidth / 4;
									ptPos.y += nWidth / 3;
								}
								// GR 01.02.2011
								var nTopDx = nValue * nStep / (szFlag.match(/SUM/) ? 2 : 2);

								minNextTextPos.x = Math.max(0, minNextTextPos.x + (nTextSize * 0.75 - nTopDx));
								var ptTextPos = new point(minNextTextPos.x + ptPos.x + nTopDx - nTextSize / 3, 0);

								var nIndent = map.Scale.normalX(0.5) * nSizer;

								var nXPos1 = nPosX + ptPos.y + nWidth / 3;
								var nXPos2 = nPosX + ptPos.y + nWidth * 7 / 8;
								var nYPos1 = -ptPos.x - nTopDx;
								var nYPos2 = -ptTextPos.x - nTextSize / 3;
								// if dubble stacked bar, first n label must go to the left
								// --------------------------------------------------------
								if (this.nGridX && nBarsDrawn < this.nGridX) {
									ptPos.y -= nWidth * 2 + newText.fu.getBox().width;
									var nTemp = nXPos2;
									nXPos2 = nXPos1 - (szFlag.match(/3D/) ? (nWidth * 1.5) : (nWidth * 1.4));
									nXPos1 = nTemp - (szFlag.match(/3D/) ? (nWidth * 7 / 4) : (nWidth * 1.4));
									if (szFlag.match(/3D/)) {
										nYPos1 += nWidth / 5;
										nYPos2 += nWidth / 5;
										ptTextPos.x -= nWidth / 7;
									}
									nIndent = -nIndent;
								}

								newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y + nWidth + nIndent - nTextSize) + "," + (-ptTextPos.x - nTextSize * 0.25) + ") ");

								var linebgGroup = map.Dom.newGroup(barShape, "");
								var lineGroup = map.Dom.newGroup(barShape, "");

								map.Dom.newShape('line', linebgGroup, nXPos1, nYPos1, nXPos1 + nIndent, nYPos1, "stroke-width:" + map.Scale.normalX(0.15) + ";stroke:white;opacity:0.2;");
								map.Dom.newShape('line', lineGroup, nXPos1, nYPos1, nXPos1 + nIndent, nYPos1, "stroke-width:" + map.Scale.normalX(0.05) + ";stroke:#888888;");

								map.Dom.newShape('line', linebgGroup, nXPos1 + nIndent, nYPos1, nXPos2, nYPos2, "stroke-width:" + map.Scale.normalX(0.15) + ";stroke:white;opacity:0.2;stroke-linecap:round;");
								map.Dom.newShape('line', lineGroup, nXPos1 + nIndent, nYPos1, nXPos2, nYPos2, "stroke-width:" + map.Scale.normalX(0.05) + ";stroke:#888888;");

								map.Dom.newShape('line', linebgGroup, nXPos2, nYPos2, nXPos2 + nIndent, nYPos2, "stroke-width:" + map.Scale.normalX(0.15) + ";stroke:white;opacity:0.2;");
								map.Dom.newShape('line', lineGroup, nXPos2, nYPos2, nXPos2 + nIndent, nYPos2, "stroke-width:" + map.Scale.normalX(0.05) + ";stroke:#888888;");

								minNextTextPos.x = Math.max(0, minNextTextPos.x + (nTextSize * 2 / 3 - (nValue * nStep - nTopDx)));
							}
						} else {
							// normal bars and barcharts 
							// -------------------------

							ptPos.x += nWidth / 4;

							if (szFlag.match(/3D/)) {
								ptPos.x += nWidth / 4;
								ptPos.y = nWidth * 0.30 + nTextSize / 2;
							}
							if (szFlag.match(/POINTER/) && (nTextValue > 0)) {
								ptPos.x += nWidth * 0.25;
							}
							var xValue = nValue;
							if ((tLen + map.Scale.normalX(1)) > (nnValue - nValue) * nStep / nCenter) {
								xValue = Math.max(nValue, nnValue);
								if (nnValue > nValue) {
									xValue += nWidth / nStep * 0.2;
									map.Dom.newShape('line', barShape, nPosX + nWidth * 0.6, -ptPos.x - nValue * nStep / nCenter + nWidth / 3, nPosX + nWidth * 0.6, -ptPos.x - nnValue * nStep / nCenter - nWidth * 0.4, "stroke:white;");
								}
							}
							if (szFlag.match(/VOLUME/)) {
								xValue += nWidth / 5;
							}
							if (nPartsA.length == 1 && !szFlag.match(/HORZ/) && !szFlag.match(/VOLUME/)) { //&& szFlag.match(/NORMSIZE/) ){
								if (szFlag.match(/ZOOM/) || szFlag.match(/NORMSIZE/)) {
									ptPos.y += szFlag.match(/3D/) ? nWidth * 0.75 : nWidth * 0.5;
									var dy = Math.min(0, nTextSize * 0.55 - nValue * nStep);
									var dx = nTextSize;
									if ((szFlag.match(/3D/) || szFlag.match(/ZOOM/)) && !szFlag.match(/SIZE/)) {
										dx = 0;
									}
									newText.setAttributeNS(null, "transform", "translate(" + (nPosX + dx) + "," + (dy - nTextSize * 0.5) + ")");
								} else {
									ptPos.y += szFlag.match(/3D/) ? (szFlag.match(/VOLUME/) ? nWidth * 0.75 : nWidth * 0.6) : nWidth * 0.2;
									newText.setAttributeNS(null, "transform", "translate(" + (nPosX - nWidth * 0.8) + "," + (-xValue * nStep / nCenter - nTextSize * 0.8 - ((szFlag.match(/POINTER/) && (nTextValue > 0)) ? nWidth * 0.3 : 0)) + ")");
								}
								if (nTextValue < 0) {
									newText.style.setProperty("opacity", String(nTextOpacity * 0.75), "");
								}
							} else {
								if (szFlag.match(/VOLUME/)) {
									newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (-ptPos.x - xValue * nStep / nCenter) + ")  scale(0.9,0.9)");
								} else {
									newText.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y) + "," + (-10 - nWidth * 0.25 - xValue * nStep / nCenter) + ") rotate(270) scale(0.9,0.9)");
								}
							}
							newText.style.setProperty("fill", "#404040", "");
						}
					} else {
						// label text inside the bar (no background needed but adapted color)
						// ------------------------------------------------------------------
						var cColor = __maptheme_getChartColors(nColor);

						newText.removeChild(newText.firstChild);

						newText.firstChild.style.setProperty("fill", cColor.textColor, "");
						if (newUnitText) {
							newUnitText.style.setProperty("fill", cColor.textColor, "");
						}
						if (newXaxisText) {
							newXaxisText.style.setProperty("fill", cColor.textColor, "");
						}
						if (newTextBg) {
							newTextBg.parentNode.removeChild(newTextBg);
						}

						var dX = map.Scale.normalX(0);
						var dY = map.Scale.normalY(0.5);


						if (szFlag.match(/VOLUME/)) {
							nScale = (nValue * nStep) / (tLen + map.Scale.normalX(2));
							// GR 21.03.2013 remove already drawn text and make new centered text 
							newText.parentNode.removeChild(newText);
							newText = map.Dom.newText(barShape, nPosX + (nValue * nStep) / 2, nTextSize * nScale / 4 - (nValue * nStep) / 2, "font-family:arial;font-size:" + nTextSize * nScale + "px;text-anchor:middle;fill:" + cColor.textColor + ";opacity:" + nOpacity + ";stroke:none;pointer-events:none", szText);

						} else {
							nScale = Math.min(1, (nValue * nStep) / (tLen));
							if (nScale < 0.33) {
								newText.parentNode.removeChild(newText);
							} else {
								if (nTextValue > 0) {
									ptPos.x += Math.max(map.Scale.normalX(1), nValue * nStep - (tLen + map.Scale.normalX(3)) * nScale);
								}
								dY /= nScale;
								newText.firstChild.style.setProperty("font-size", String(nTextSize * nScale));
								newText.firstChild.setAttributeNS(null, "transform", "translate(" + (nPosX + ptPos.y - dY) + "," + (-ptPos.x - dX) + ") rotate(270)	");
							}
						}
						minNextTextPos.x = Math.max(0, minNextTextPos.x - nValue * nStep);
					}
				}
			}

			// add a mark sign
			// ---------------
			if ((nMark != null) && (i == nMark)) {
				var nSize = nTextSize * 2;
				var cColor = __maptheme_getChartColors(nColor);
				var newPath;
				newPath = map.Dom.newShape('path', barShape, 'M5,0 l 35,-45 -25,0 0,-30 -20,0 0,30 -25,0 35,45', "fill:#404040;stroke:white;stroke-width:" + map.Scale.normalX(0.2) + "");
				newPath.fu.setPosition(i * (nWidth + 1.5) + nWidth * 0.5, -nValue * nStep + (fTextInside ? -map.Scale.normalX(3) : -tLen - map.Scale.normalX(12)));
			}

			// add a trend line 
			// ----------------
			if (szFlag.match(/TRENDLINE/)) {

				var dY = Math.min((nValue * nStep / 2), map.Scale.normalY(1.5));
				var cColor = __maptheme_getChartColors(nColor);
				var szColor = cColor.lowColor; //"white";
				var nSize = nTextSize / 5;

				if (i > 0) {
					var x1 = (i - 1) * (nWidth + (szFlag.match(/SPACED/) ? nWidth / 5 : 1)) + nWidth / 2;
					var x2 = (i) * (nWidth + (szFlag.match(/SPACED/) ? nWidth / 5 : 1)) + nWidth / 2;
					szColor = "white";
					szColor = (lastValue > nValue ? "#CC3333" : (lastValue < nValue ? "#22BB22" : cColor.lowColor));
					map.Dom.newShape('line', barShape, x1, -lastValue * nStep + dY, x2, -nValue * nStep + dY, "stroke:" + "#666666" + ";stroke-width:" + map.Scale.normalX(1 / nPartsA.length * 1.2) + ";opacity:0.8");
				}
				var newSpot = map.Dom.newShape('circle', barShape, 0, 0, nSize, "fill:" + szColor + ";stroke:none;opacity:0.8");
				if (newSpot){
					newSpot.fu.setPosition(i * (nWidth + (szFlag.match(/SPACED/) ? nWidth / 5 : 0)) + nWidth / 2, -nValue * nStep + dY);
				}
			}

			// make a tooltip
			// ----------------
			if (!szFlag.match(/SILENT/)) {
				if (this.szFlag.match(/SEQUENCE/)) {
					barShape.setAttributeNS(szMapNs, "tooltip", szValue + " (" + (this.szLabelA ? this.szLabelA[nClass] : "") + ") [" + this.szFieldsA[nIndex] + "]");
				} else {
					var szLabel = this.szFieldsA[nIndex];
					if (this.szLabelA && this.szLabelA[nIndex]) {
						szLabel = this.szLabelA[nIndex];
					}
					szValue += this.szUnit?" ["+this.szUnit+"]":"";
					if (nMySum && !this.nGridX && !(this.szField100 && !this.szFlag.match(/FRACTION/))) {
						//szValue += " (" + this.formatValue(100 / nMySum * nValue, 2) + "%)";
					}
					barShape.setAttributeNS(szMapNs, "tooltip", szValue + " '" + szLabel + "'");
				}
			}

			// applicate special styles
			// ------------------------
			if (szFlag.match(/FADEIN/)) {
				if ((nPartsA.length == 2) && (i === 0)) {
					barShape.style.setProperty("opacity", String(0.6), "");
				} else
				if (!szFlag.match(/NORMSIZE/)) {
					var nPow = szFlag.match(/FADEINP4/) ? 10 : 3;
					barShape.style.setProperty("opacity", String(0.1 + 0.9 * Math.pow((i + 1), nPow) / Math.pow(nPartsA.length, nPow)), "");
				}
			}
			if (szFlag.match(/FADENEGATIVE/)) {
				if (nTextValue < 0) {
					barShape.style.setProperty("opacity", String(0.5), "");
				}
			}

			// make bar markable/switchable 
			// ----------------------------
			barShape.setAttributeNS(szMapNs, "class", String(nClass));

			// finally position this bar within the chart
			// ------------------------------------------

			barShape.fu.setPosition(0, nPosY);

			if (szFlag.match(/STACKED/)) {
				if (!szFlag.match(/CENTER/)) {
					nPosY -= nValue * nStep;
				}
			} else {
				nPosY = 0;
				nPosX += nWidth;
				if (szFlag.match(/VOLUME/) && szFlag.match(/SPACED/)) {
					nPosX += nWidth / (nPartsA.length == 2 ? 2 : 4);
				} else
				if (szFlag.match(/SPACED/)) {
					nPosX += nWidth / 5;
				} else {
					if (!szFlag.match(/\bUP\b/)) {
						nPosX += 1;
					}
				}
			}

			// needed for positioning
			// ----------------------
			nBarsDrawn++;

			if (szFlag.match(/STACKED/) && !szFlag.match(/MULTI/) && this.nGridX && (nBarsDrawn % this.nGridX === 0)) {
				nPosY = 0;
				nPosX += nWidth + nWidth / 20;
			}
			// store last values
			// -----------------
			lastValue = nValue;
		}

		// finish the bar chart 
		// --------------------

		if (szFlag.match(/HOR/)) {
			barGroup.setAttributeNS(null, "transform", "rotate(90) translate(" + (-nPosX) + ",0)");
		}

		// position the bar relative 0 point
		// ---------------------------------

		ptNull.y = 0;
		ptNull.x = 0;

		if (szFlag.match(/HOR/)) {
			ptNull.y -= nWidth * 1 / 2;
			if (szFlag.match(/3D/)) {
				ptNull.y -= nWidth * 1 / 3;
			}
		} else {
			if (szFlag.match(/STACKED/)) {
				ptNull.x = nWidth / 2;
			} else if (szFlag.match(/Up/) || szFlag.match(/HOR/)) {
				ptNull.x = 0;
			} else {
				ptNull.x = nWidth * (nBarsDrawn) / 2;
			}
		}
		if (szFlag.match(/MENUSIZE/)) {
			ptNull.x += nWidth * (szFlag.match(/HORZ/) ? 1 : 0);
			ptNull.y += nWidth * (szFlag.match(/HORZ/) ? 0.3 : 0);
			ptNull.y += nWidth * ((szFlag.match(/HORZ/) && szFlag.match(/3D/)) ? 1 : (szFlag.match(/VOLUME/) ? 0.3 : 0.6));
		}

		this.nRealizedCount++;

		var barPositionGroup = map.Dom.newGroup(shapeGroup, "");
		barPositionGroup.appendChild(barGroup);

		if (szFlag.match(/ZOOM/)) {
			var nScale = 240 / nTextSize / ((nPartsA.length > 1) ? 2 : 1);
			barPositionGroup.fu.scale(nScale, nScale);
		}
		barPositionGroup.fu.setPosition(shapeGroup.fu.getPosition().x - ptNull.x, -ptNull.y);

		ptNull.x = 0;
		ptNull.y = 0;

		if (szFlag.match(/HOR/)) {
			ptNull.y = nWidth * 1 / 2;
		}

	}

	// ===================================================================================
	// == charts drawing finished ========================================================
	// ===================================================================================

	// call user plugin to add elements to the chart

	if (szFlag.match(/EXTEND/) && HTMLWindow.ixmaps.htmlgui_drawChartAfter) {
		try {
			var objTheme = this.objThemesA[this.szThemesA[0]];
			HTMLWindow.ixmaps.htmlgui_drawChartAfter(SVGDocument, {
				target: shapeGroup,
				theme: this,
				item: a,
				values: nPartsA,
				maxSize: nChartSize,
				flag: szFlag,
				mark: nMark,
				dbRecord: (objTheme.dbRecords ? objTheme.dbRecords[this.itemA[a].dbIndex] : null)
			});
		} catch (e) {}
	}

	// align the generated chart object
	if (!szFlag.match(/NORMSIZE/)) {

		var ptNullOrig = new point(ptNull.x, ptNull.y);
		
		if ( szFlag.match(/PLOT/)) {
			ptNull.x = map.Scale.normalX(this.nOffsetX || 0);
			ptNull.y = map.Scale.normalY(-this.nOffsetY || 0);
		}else{
			ptNull.x = map.Scale.normalX(this.nOffsetX || 0) * (this.nSymbolScale || 1);
			ptNull.y = map.Scale.normalY(-this.nOffsetY || 0) * (this.nSymbolScale || 1);
		}

		if (this.szAlign) {
			if (szFlag.match(/PLOT/) && !szFlag.match(/ZOOM/)) {
				if (this.szAlign.match(/center/)) {
					ptNull.x = map.Scale.normalX(nChartSize/2*nPartsA.length/(this.nGridX||1));
					if (!this.szAlign.match(/top/)) {
						ptNull.y = -map.Scale.normalX(nChartSize/2*nPartsA.length/(this.nGridX||1));
					}
				}
				if (this.szAlign.match(/right/)) {
					ptNull.x = map.Scale.normalX(nChartSize*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/23right/)) {
					ptNull.x = map.Scale.normalX(nChartSize*0.66*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/10\%right/)) {
					ptNull.x = map.Scale.normalX(nChartSize*0.90*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/10\%left/)) {
					ptNull.x = map.Scale.normalX(nChartSize*0.10*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/23left/)) {
					ptNull.x = map.Scale.normalX(nChartSize*0.33*nPartsA.length/(this.nGridX||1));
				}
			}else	
			if (this.nGridX && !szFlag.match(/ZOOM/)) {
				if (this.szAlign.match(/center/)) {
					ptNull.x = map.Scale.normalX(nChartSize/2/this.partsA.length*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/right/)) {
					ptNull.x = map.Scale.normalX(nChartSize/this.partsA.length*nPartsA.length/(this.nGridX||1));
				}
				if (this.szAlign.match(/23right/)) {
					ptNull.x = map.Scale.normalX(nChartSize/this.partsA.length*0.66*nPartsA.length/(this.nGridX||1));
				}
			}else{
				if (this.szAlign.match(/center/)) {
					ptNull.y = 0;
				}
				if (this.szAlign.match(/bottom/)) {
					ptNull.y = (ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 5));
				}
				if (this.szAlign.match(/above/)) {
					ptNull.y = (ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 2));
				}
				if (this.szAlign.match(/2above/)) {
					ptNull.y += map.Scale.normalX(nChartSize / 2);
				}
				if (this.szAlign.match(/below/)) {
					ptNull.y = -(ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 2));
				}
				if (this.szAlign.match(/2below/)) {
					ptNull.y -= map.Scale.normalX(nChartSize / 2);
				}
				if (this.szAlign.match(/top/)) {
					ptNull.y = -(ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 2));
				}
				if (this.szAlign.match(/left/)) {
					ptNull.x = -(ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 2));
				}
				if (this.szAlign.match(/2left/)) {
					ptNull.x -= map.Scale.normalX(nChartSize / 2);
				}
				if (this.szAlign.match(/right/)) {
					ptNull.x = (ptNullOrig.y ? ptNullOrig.y : map.Scale.normalX(nChartSize / 2));
				}
				if (this.szAlign.match(/2right/)) {
					ptNull.x += map.Scale.normalX(nChartSize / 2);
				}
				if (this.szAlign.match(/23right/)) {
					ptNull.x = map.Scale.normalX(nChartSize / 3);
				}
				if (this.szAlign.match(/baseline/)) {
					ptNull.y += map.Scale.normalY(nChartSize / 5);
				}
			}
		}
	}
	// make chart label, if source field is defined 
	if (a && this.szLabelField && !szFlag.match(/NORMSIZE/) && !szFlag.match(/ZOOM/) && (!this.nLabelUpper || (map.Scale.nTrueMapScale * map.Scale.nZoomScale <= this.nLabelUpper))) {
		var szLabel = this.itemA[a].szLabel;
		if (!szLabel) {
			szLabel = this.szLabelField + "?";
		} else {
			if (!isNaN(__scanValue(szLabel))) {
				szLabel = this.formatValue(__scanValue(szLabel), this.nValueDecimals || 2) + (this.szLabelUnits || "");
			} else {
				szLabel += (this.szLabelUnits || "");
			}
		}
		var nTextSize = map.Scale.normalX(5) * (this.nTextScale||1);
		
		var szTextStyle = "opacity:0.7;font-family:arial;font-size:" + (nTextSize) + "px;text-anchor:middle;fill:#000000;pointer-events:none";
		var szBgStyle = "opacity:1;fill:white;fill-opacity:0.4;stroke:#000000;stroke-width:" + map.Scale.normalX(1) + "pointer-events:none;";
		var nTextLen = (szLabel.length + 2) * nTextSize * 0.50;

		var labelGroup = map.Dom.newGroup(shapeGroup, "");
		// push to bottom 
		//labelGroup.parentNode.insertBefore(labelGroup,labelGroup.parentNode.firstChild);
		labelGroup.parentNode.append(labelGroup);
		if (!szFlag.match(/MULTI/)) {
			labelGroup.setAttributeNS(szMapNs, "class", String(nClass));
		} else {
			szTextStyle += ";fill:#444444;text-anchor:start;";
		}

		var newBg = map.Dom.newShape('rect', labelGroup, -nTextLen / 2, -nTextSize * 0.95, nTextLen, nTextSize * 1.2, szBgStyle);
		newBg.setAttributeNS(null, 'rx', nTextSize * 0.2);
		newBg.setAttributeNS(null, 'ry', nTextSize * 0.2);

		var newText = map.Dom.newText(labelGroup, 0, 0, szTextStyle, szLabel);

		var bBox = newText.fu.getBox();
		var nWidth = Math.max(bBox.width, nTextLen);

		newBg.setAttributeNS(null, "x", -nWidth / 2);
		newBg.setAttributeNS(null, "width", nWidth);

		if (szFlag.match(/MULTI/)) {
			labelGroup.fu.setPosition(map.Scale.normalX(nChartSize*0.8), nTextSize * 0.77);
			labelGroup.fu.scale(2, 2);
			newBg.parentNode.removeChild(newBg);
			//labelGroup.fu.setPosition(nWidth/3,nTextSize/3+ptNullOrig.y);
		} else {
			labelGroup.fu.setPosition(nWidth / 3, nTextSize / 3 + ptNullOrig.y);
		}

		this.itemA[a].labelGroup = labelGroup;
		
		if ( this.szTimeField ){
			var uTime = new Date(this.itemA[a].szTime).getTime() || this.itemA[a].szTime;
			labelGroup.setAttributeNS(szMapNs, "time", uTime);
		 }
	}

	// position the generated chart object
	if (szFlag.match(/MENU/)) {
		var box = shapeGroup.fu.getBox();
		shapeGroup.fu.setPosition(-box.x - box.width / 2, -box.y - box.height / 2 - map.Scale.normalY(nChartSize / 2) - map.Scale.normalY(2));
	} else {
		if (!szFlag.match(/ZOOM/) ) {
			shapeGroup.fu.setPosition(shapeGroup.fu.getPosition().x - ptNull.x, shapeGroup.fu.getPosition().y - ptNull.y);
			if (gridGroup){
				gridGroup.fu.setPosition(gridGroup.fu.getPosition().x - ptNull.x, gridGroup.fu.getPosition().y - ptNull.y);
			}
		}
	}

	ptNull.x = 0;
	ptNull.y = 0;
	// GR 01.02.2015 we need to know later, if chart has been drawn
	if (a) {
		this.itemA[a].fDone = true;
	}

	this.nChartSizeDone = nChartSize;

	return ptNull;
};

//..............................................
// H E L P E R
//..............................................

/**
 * get relevant shapes (incl. tiles)
 */
MapTheme.prototype.getShapes = function () {

	// not on tiled layer
	var layerItem = map.Layer.getLayerObj(this.szThemesA[0]);
	if (layerItem && layerItem.szFlag.match(/tiled/)) {
		_TRACE("== done === ");
		return;
	}

	_TRACE("== MapTheme.getShapes() ===> ");
	for (var a in this.itemA) {
		if (!this.parent.themeNodesA[a]) {
			this.parent.themeNodesA[a] = this.getShapeA(a);
		}
	}
	_TRACE("== done === ");
};
/**
 * get relevant nodes of one item (incl. tiles)
 * @param a the (map) id of the item
 */
MapTheme.prototype.getItemNodes = function (a) {

	if (!this.parent.themeNodesA[a] || !this.parent.themeNodesA[a].length) {
		this.parent.themeNodesA[a] = this.getShapeA(a);
	}

	return this.parent.themeNodesA[a] || [];
};
/**
 * get shape array of one item 
 * one item can have n shapes in n tiles
 * @param a the (map) id of the item
 */
MapTheme.prototype.getShapeA = function (a) {
	
	a = __mpap_decode_utf8(a);
	var sNode = SVGDocument.getElementById(a.trim());

	if (sNode) {
		return new Array(sNode);
	}
	if (a.match(/\,/)) {
		var parts = a.split("::");
		var aA = parts[0].split(",");
		for (var i = 0; i < aA.length; i++) {
			var sNode = SVGDocument.getElementById((aA[i] + "::" + parts[1]).trim());
			if (sNode) {
				return new Array(sNode);
			}
		}
	}
	this.nMissingLookupCount++;
	this.missedA[a] = a;
	return [];
};
/**
 * calcolate shape positions
 */
MapTheme.prototype.getPositions = function () {

	_TRACE("== MapTheme.getPositions() ===> ");
	for (var a in this.itemA) {
		this.getNodePosition(this.itemA[a].szSelectionId);
	}
	_TRACE("== done === ");
};
/**
 * get the position (in internal map coordinates) one theme item shape
 * @param a the (map) id of the item
 */
MapTheme.prototype.getNodePosition = function (a) {

	if (typeof (a) == "undefined") {
		return null;
	}
	
	if (map.Themes.themeNodesPosA[a]) {
		return map.Themes.themeNodesPosA[a];
	}
	
	var themeNodesPosA = this.themeNodesPosA;
	
	if (!themeNodesPosA[a]) {
		if (a.match(/:clone/)) {
			return null;
		}
		// GR 18.10.2013 new: lookup field may contain geo position
		if (a.match(/(-?[0-9\.]+) ?, ?(-?[0-9\.]+)/)) {
			var ptPos = this.getMapPosition(a);
			themeNodesPosA[a] = new point(ptPos.x, ptPos.y);
			return themeNodesPosA[a];
		}

		if (!this.parent.themeNodesA[a]) {
			this.parent.themeNodesA[a] = this.getShapeA(a);
		}
		var sNode = this.parent.themeNodesA[a][0];
		// if we have more than 1 shape, search the biggest one
		if (this.parent.themeNodesA[a].length > 1) {
			var nMaxArea = parseFloat(sNode.getAttributeNS(szMapNs, "area"));
			for (var i = 1; i < this.parent.themeNodesA[a].length; i++) {
				var tNode = this.parent.themeNodesA[a][i];
				var nArea = parseFloat(tNode.getAttributeNS(szMapNs, "area"));
				if (nArea > nMaxArea) {
					nMaxArea = nArea;
					sNode = tNode;
				}
			}
		}
		if (sNode) {
			if (this.szShapeType.match(/line/)) {
				var szCenter = sNode.getAttributeNS(szMapNs, "center");
				if (szCenter && szCenter.length > 2) {
					var szCenterA = szCenter.split(',');
					var bBox = new box(Number(szCenterA[0].split(':')[1]), Number(szCenterA[1].split(':')[1]), 0, 0);
				} else {
					var bBox = map.Dom.getBox(sNode);
				}
				var bBox = map.Dom.getBox(sNode);
			} else {
				var szCenter = sNode.getAttributeNS(szMapNs, "center");
				if (!szCenter && sNode.parentNode) {
					szCenter = sNode.parentNode.getAttributeNS(szMapNs, "center");
				}
				if (szCenter && szCenter.length > 2) {
					var szCenterA = szCenter.split(',');
					var bBox = new box(Number(szCenterA[0].split(':')[1]), Number(szCenterA[1].split(':')[1]), 0, 0);
				} else {
					var bBox = map.Dom.getBox(sNode);
				}
			}
			var ptMapOffset = map.Scale.getMapOffset(sNode);
			themeNodesPosA[a] = new point((ptMapOffset.x + bBox.x + bBox.width / 2), (ptMapOffset.y + bBox.y + bBox.height / 2));

			// GR 28.02.2019 for instant layer by POSITION themes
			var matrix = getMatrix(sNode);
			if (matrix) {
				themeNodesPosA[a].x += matrix[4];
				themeNodesPosA[a].y += matrix[5];
			}

		}
	}
	if (themeNodesPosA[a] && (typeof (themeNodesPosA[a].x) != 'undefined') && (typeof (themeNodesPosA[a].y) != 'undefined')) {
		return themeNodesPosA[a];
	}

	this.missedA[a] = a;

	return null;
};
/**
 * get the bounding box of one themn item node (shape)
 * @param a the (map) id of the item
 */
MapTheme.prototype.getNodeBox = function (a) {

	if (typeof (a) == "undefined") {
		return null;
	}

	if (!this.parent.themeNodesBoxA[a]) {
		if (a.match(/:clone/)) {
			return null;
		}
		if (!this.parent.themeNodesA[a]) {
			this.parent.themeNodesA[a] = this.getShapeA(a);
		}
		var sNode = this.parent.themeNodesA[a][0];
		// if we have more than 1 shape, search the biggest one
		if (this.parent.themeNodesA[a].length > 1) {
			var nMaxArea = parseFloat(sNode.getAttributeNS(szMapNs, "area"));
			for (var i = 1; i < this.parent.themeNodesA[a].length; i++) {
				var tNode = this.parent.themeNodesA[a][i];
				var nArea = parseFloat(tNode.getAttributeNS(szMapNs, "area"));
				if (nArea > nMaxArea) {
					nMaxArea = nArea;
					sNode = tNode;
				}
			}
		}
		if (sNode) {
			var bBox = map.Dom.getBox(sNode);
			var ptMapOffset = map.Scale.getMapOffset(sNode);
			this.parent.themeNodesBoxA[a] = new box((ptMapOffset.x + bBox.x), (ptMapOffset.y + bBox.y), (bBox.width), (bBox.height));
		}
	}
	return this.parent.themeNodesBoxA[a];
};
/**
 * get the calcolated and stored area of one theme shape in square KM
 * @param a the (map) id of the item
 */
MapTheme.prototype.getNodeArea = function (a) {

	var tilesNodesA = this.getItemNodes(a);
	var xNode = tilesNodesA[0];
	if ((xNode)) {
		return Number(xNode.getAttributeNS(szMapNs, "area")) / 1000000;
	}
	return 0;
};
/**
 * if the theme item id is a (lat,lon) position	
 * turn the geo coordinate string (lat,lon) into a map position
 * @param a the (map) id of the item
 */
var positionRegExp = /(-?[0-9\.]+) ?[, ] ?(-?[0-9\.]+)/;
MapTheme.prototype.getMapPosition = function (a) {
	if (a) {
		var szM = a;
		var szMA = null;
		if (szM && (szMA = szM.match(positionRegExp))) {
			if ((Math.abs(parseFloat(szMA[1])) > 180) || (Math.abs(parseFloat(szMA[2])) > 180)) {
				return new point(0, 0);
			}
			return map.Scale.getMapPositionOfLatLon(parseFloat(szMA[1]), parseFloat(szMA[2]));
		}
	}
	return new point(0, 0);
};

//..............................................
// theme legend in SVG
//..............................................

/**
 * handle onClick on the info pane field
 * @param evt the event
 */
MapTheme.prototype.onClick = function (evt) {
	if (!this.fRemove) {
		if (this.widgetNode) {
			this.enable();
		}
		this.fToFront = true;
		executeWithMessage("map.Themes.execute()", "... processing ...");

		map.Themes.onclickInfo(evt, this.szId);
	}
};

/**
 * Display an error summary for the chart creation
 */
MapTheme.prototype.showErrorInfo = function () {

	_TRACE("== MapTheme.showErrorInfo(" + this.szId + ")===> ");

	if (this.nMissingPositionCount === 0) {
		return;
	}
	var szDisplayId = this.szId + ":errordisplay:widget";
	var szTitle = map.Dictionary.getLocalText("Chart statistic");

	var newInfo = new InfoContainer(SVGDocument, this.widgetNode, szDisplayId + ":movable", new point(map.Scale.normalX(0), map.Scale.normalX(0)), new point(-map.Scale.normalX(15), map.Scale.normalX(80)), "fixed", szTitle);
	var infoWorkspace = newInfo.workspaceNode;
	
	var textA = new Array(   map.Dictionary.getLocalText("total items")
							,map.Dictionary.getLocalText("charts drawn")
							,map.Dictionary.getLocalText("missing positions")
							,map.Dictionary.getLocalText("missing value match")
							,map.Dictionary.getLocalText("zero values")
						    ,String(this.nCount)
							,String(this.nRealizedCount)
							,String(this.nMissingPositionCount)
							,String(this.nMissingRangeCount)
							,String(this.nZeroValueCount)

	);

	var gridGroup = map.Dom.newGroup(infoWorkspace, "");
	gridGroup.fu.setPosition(0, map.Scale.normalY(3));
	var newText = createTextGrid(SVGDocument, gridGroup, szDisplayId + ":textgrid", textA, 2);

	newInfo.reformat();
};

/**
 * Display the data of a theme item
 * @param szShapeId the id of the theme item
 * @param targetGroup the SVG target group
 * @type SVG element
 * @return the SVG element created
 */
MapTheme.prototype.getDataGrid = function (szShapeId, targetGroup) {

	if (this.szFlag.match(/AGGREGATE/) && (this.itemA[szShapeId].nCount > 3)) {
		return null;
	}

	var textA = map.Themes.getDataRow(szShapeId, this);
	if (textA && textA.length) {
		for (var x = 0; x < textA.length; x++) {
			textA[x] = textA[x] || "---";
		}
        var gridGroup;
		var scrollObj = new ScrollArea(null, targetGroup, null, 10, 10, 10);
		if (scrollObj) {
			scrollObj.reformat();
			gridGroup = scrollObj.workspaceNode;
		} else {
			gridGroup = targetGroup;
		}
		// get all theme field indices to show with extra color
		var styleA = [];
		var indexA = map.Themes.getFieldIndexArray(this);
		for (var i = 0; i < indexA.length; i++) {
			styleA[indexA[i]] = "font-weight:bold;fill:#087BBB";
			styleA[indexA[i + textA.length / 2]] = "font-weight:bold;fill:#087BBB";
		}
		var nFontHeight = map.Scale.tStyle.Description.nFontHeight / map.Scale.normalX(1);
		var newText = createTextGrid(SVGDocument, gridGroup, ":textgrid", textA, 2, nFontHeight, styleA);
		if (!scrollObj) {
			return newText.fu;
		} else {
			scrollObj.setWidth(Math.min(newText.fu.getBox().width / map.Scale.normalX(1) + 25, map.Scale.bBox.width / map.Scale.normalY(2.2)));
			scrollObj.setHeight(Math.min(newText.fu.getBox().height / map.Scale.normalY(1) + 25, map.Scale.bBox.height / map.Scale.normalY(1.5)));
			scrollObj.reformat();
			if (scrollObj.hasScrollBars()) {
				scrollObj.setScrollPosition(new point(0, 0));
			}
			return scrollObj;
		}
	}
};

//..............................................
// value label for PIE, DONUT, ...
//..............................................

function __sortYposUp(a, b) {
	if (a.y > b.y) {
		return 1;
	}
	return -1;
}

function __sortYposDown(a, b) {
	if (a.y < b.y) {
		return 1;
	}
	return -1;
}

/**
 * Create the value label for one quadrant of the pie,...
 * makes the texts positions it well and draws a lines from the text to the pie part
 * @param donut the pie/donut object
 * @param quadA an array with the label to draw for this quadrant
 * @param nFontSize the font size for the label text
 * @param szTextOrientation a style def for the SVG text to create
 * @param xDir increment direction for the label
 * @param yDir increment direction for the label
 * @param xMax horizontal position limits for this quadrant
 * @param yMax vertical position limits for this quadrant
 * @type void
 */
MapTheme.prototype.drawTextforOneQuadrant = function (donut, quadA, nFontSize, szTextOrientation, xDir, yDir, xMax, yMax) {

	var nLineHeight = donut.szStyle.match(/3D/) ? nFontSize * 2.4 : nFontSize * 1.2;
	var yMin = nLineHeight / 2;
	var ySpace = yMax - nLineHeight * (quadA.length - 2);
	var szColor = "#777777";
	var szLColor = "#888888";
	for (var i = 0; i < quadA.length; i++) {

		var nKnee = quadA[i].y / quadA[i].ly;

		var yPos = Math.max(yMin, Math.min(quadA[i].y, ySpace));
		yMin = yPos + nLineHeight;
		ySpace += nFontSize;

		var xPos = quadA[i].x * 1.2;
		xPos = xMax + map.Scale.normalX(2);

		if (yPos > quadA[i].y) {
			nKnee = Math.max(nKnee, yPos / quadA[i].y);
		}

		var startX = donut.mX + quadA[i].lx * xDir;
		var startY = donut.mY + quadA[i].ly * yDir;
		var kneeX = donut.mX + quadA[i].x * xDir;
		var kneeY = donut.mY + quadA[i].y * yDir;
		var endX = donut.mX + xPos * xDir;
		var endY = donut.mY + yPos * yDir;

		var textGroup = map.Dom.newGroup(donut.frameGroup, "");
		donut.donutPartsA[quadA[i].index].textNode = textGroup;

		var linebgGroup = map.Dom.newGroup(textGroup, "");
		var lineGroup = map.Dom.newGroup(textGroup, "");

		if (nKnee) {
			map.Dom.newShape('line', linebgGroup, startX, startY, kneeX, kneeY, "stroke:white;stroke-width:" + map.Scale.normalX(1.5) + ";opacity:0.2;");
			map.Dom.newShape('line', lineGroup, startX, startY, kneeX, kneeY, "stroke:" + szLColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";opacity:1;");
			startX = kneeX;
			startY = kneeY;
		}

		if (quadA[i].x < xMax - map.Scale.normalX(3)) {
			map.Dom.newShape('line', linebgGroup, startX, startY, donut.mX + (xMax - map.Scale.normalX(3)) * xDir, startY, "stroke:white;stroke-width:" + map.Scale.normalX(1.5) + ";opacity:0.2;stroke-linecap:round;");
			map.Dom.newShape('line', lineGroup, startX, startY, donut.mX + (xMax - map.Scale.normalX(3)) * xDir, startY, "stroke:" + szLColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";opacity:1;");
			startX = donut.mX + (xMax - map.Scale.normalX(3)) * xDir;
		}

		map.Dom.newShape('line', linebgGroup, startX, startY, endX, endY, "stroke:white;stroke-width:" + map.Scale.normalX(1.5) + ";opacity:0.2;stroke-linecap:round;");
		map.Dom.newShape('line', lineGroup, startX, startY, endX, endY, "stroke:" + szLColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";opacity:1;");
		startX = endX;
		endX += map.Scale.normalX(2) * xDir;

		map.Dom.newShape('line', linebgGroup, startX, endY, endX, endY, "stroke:white;stroke-width:" + map.Scale.normalX(1.5) + ";opacity:0.2;");
		map.Dom.newShape('line', lineGroup, startX, endY, endX, endY, "stroke:" + szLColor + ";stroke-width:" + map.Scale.normalX(0.5) + ";opacity:1;");
		endX += map.Scale.normalX(1.5) * xDir;

		var szText = (donut.partsA[quadA[i].index] && donut.partsA[quadA[i].index].szText) ? donut.partsA[quadA[i].index].szText : null;
		if (!szText) {
			szText = donut.partsA[quadA[i].index].szInfo ? donut.partsA[quadA[i].index].szInfo : Math.round(donut.partsA[quadA[i].index].nInfoValue * 10) / 10 + " % ";
		}
		// GR 17.10.2011 new background for text
		var nTextLen = szText.length * nFontSize * 5 / 8;
		var newTextField = this.createTextLabel(SVGDocument, textGroup, "", szText, nFontSize / map.Scale.normalX(1), szTextOrientation, this.szFlag.match(/VALUEBACKGROUND/)?donut.partsA[quadA[i].index].color:"white", (this.szChartFlag.match(/ZOOM/) ? null : this.szTextColor));
		newTextField.fu.setPosition(endX - nFontSize, endY - nFontSize * 0);

		newTextField.setAttributeNS(szMapNs, "tooltip", donut.partsA[quadA[i].index].szInfo);

		// 3D donuts are squeezed !!
		if (donut.szStyle.match(/3D/)) {
			newTextField.fu.scale(1, 2);
		}
	}
};
/**
 * Generate textvalues for pie/donut charts
 * @param donut the pie/donut object
 * @param nFontSize the font size for the label texts
 */
MapTheme.prototype.drawDonutText = function (donut, nFontSize) {

	var nYmaxPos = 0;
	var nXmaxPos = 0;
	var nXminPos = 0;

	// get the text positions from the pie/donut object, and create separate arrays for each quadrant
	var quad1A = [];
	var quad2A = [];
	var quad3A = [];
	var quad4A = [];

	var maxValues = Math.min(50, this.partsA.length);

	for (var i = 0; i < maxValues; i++) {
		var ptText = donut.getTextPosition(i);
		if (!ptText) {
			continue;
		}

		if (this.szShowPartsA) {
			var fShow = false;
			for (var p in this.szShowPartsA) {
				if (this.szShowPartsA[p] == i) {
					fShow = true;
				}
			}
			if (!fShow) {
				continue;
			}
		}

		nYmaxPos = Math.max(nYmaxPos, Math.abs(ptText.y));
		nXmaxPos = Math.max(nXmaxPos, ptText.x);
		nXminPos = Math.min(nXminPos, ptText.x);
		if (donut.szStyle.match(/STARBURST/)) {
			nXmaxPos = Math.max(nXmaxPos, ptText.x);
			nXminPos = Math.min(nXminPos, ptText.x);
		} else {
			nXmaxPos = donut.nRadOuter;
			nXminPos = -donut.nRadOuter;
		}

		if (ptText.x > 0) {
			if (ptText.y > 0) {
				quad2A[quad2A.length] = {
					index: i,
					x: ptText.x,
					y: ptText.y,
					lx: ptText.lx,
					ly: ptText.ly
				};
			} else {
				quad1A[quad1A.length] = {
					index: i,
					x: ptText.x,
					y: -ptText.y,
					lx: ptText.lx,
					ly: -ptText.ly
				};
			}
		} else {
			if (ptText.y > 0) {
				quad3A[quad3A.length] = {
					index: i,
					x: -ptText.x,
					y: ptText.y,
					lx: -ptText.lx,
					ly: ptText.ly
				};
			} else {
				quad4A[quad4A.length] = {
					index: i,
					x: -ptText.x,
					y: -ptText.y,
					lx: -ptText.lx,
					ly: -ptText.ly
				};
			}
		}
	}
	quad1A.sort(__sortYposUp);
	quad2A.sort(__sortYposUp);
	quad3A.sort(__sortYposUp);
	quad4A.sort(__sortYposUp);

	if (!nFontSize) {
		nFontSize = map.Scale.normalX(12);
	}

	this.drawTextforOneQuadrant(donut, quad1A, nFontSize, "text-anchor:start;", 1, -1, nXmaxPos, nYmaxPos);
	this.drawTextforOneQuadrant(donut, quad2A, nFontSize, "text-anchor:start;", 1, 1, nXmaxPos, nYmaxPos);
	this.drawTextforOneQuadrant(donut, quad3A, nFontSize, "text-anchor:end;", -1, 1, -nXminPos, nYmaxPos);
	this.drawTextforOneQuadrant(donut, quad4A, nFontSize, "text-anchor:end;", -1, -1, -nXminPos, nYmaxPos);
};

//..............................................
// v a r i o u s 
//..............................................

/**
 * Display the given text with autosizing background 
 * @param SVGDocument		the target document
 * @param SVGTargetGroup	the target group
 * @param szId				give the new element this id
 * @param szText			the text to display
 * @param nFontSize			the font size for the label texts
 * @param szTextOrientation a style def for the SVG text to create (text-anchor) 
 * @param szBgColor			the color of the label background (optional) 
 * @param szTColor			the color of the label text (optional)
 */
MapTheme.prototype.createTextLabel = function (SVGDocument, SVGTargetGroup, szId, szText, nFontSize, szTextOrientation, szBgColor, szTColor, szFlag) {

	var szTextColor = "#555555";
	var fBackground = true;
	var fShadow = true;
	var bgOpacity = 1;

	var testFlag = " " + this.szChartFlag + "|" + this.szFlag;
	if (testFlag.match(/ZOOM/) ||
		testFlag.match(/MENUSIZE/) ||
		testFlag.match(/NORMSIZE/) ||
		testFlag.match(/INFOSIZE/) ||
		testFlag.match(/AXIS/) ||
		testFlag.match(/SELECTION/)) {
		fBackground = szBgColor ? fBackground : false;
		fShadow = false;
	}
	if (testFlag.match(/VALUEBACKGROUND/)) {
		fBackground = true;
	}
	if (testFlag.match(/HORZ/)) {
		fBackground = false;
	}

	if (!nFontSize) {
		nFontSize = 14;
	}
	if (!szTextOrientation) {
		szTextOrientation = "";
	}
	if (!szBgColor || !fBackground) {
		szBgColor = "#fefeff";
		szTextColor = (parseFloat(szText) < 0 ? "#ee3333" : szTColor);
	} else {
		szTextColor = szTColor || ColorScheme.getTextColor(szBgColor); // szInfoBodyColor;
		bgOpacity = (testFlag.match(/ZOOM/) ? 0.9 : 0.5);
	}

	if (SVGDocument && SVGTargetGroup) {
		var newGroup = map.Dom.newGroup(SVGTargetGroup, szId);
		var shadowRect = null;
		if (fShadow && !this.fShadow && this.fOrigShadow) {
			shadowRect = map.Dom.newShape('rect', newGroup, 1, 1, 1, 1, "fill:#444444;fill-opacity:0.4;stroke:none;");
		}
		var newRect = map.Dom.newShape('rect', newGroup, 1, 1, 1, 1, "fill:" + szBgColor + ";fill-opacity:" + bgOpacity + ";stroke:" + ("none") + ";stroke-width:" + map.Scale.normalX(nFontSize * 0.05) + "");
		var szTextStyle = map.Scale.tStyle.Values.szStyle + (this.szTextFont ? ("font-family:" + this.szTextFont) : "") + ";font-size:" + map.Scale.normalY(nFontSize) + "px;fill:" + szTextColor + ";fill-opacity:1;" + szTextOrientation;

		if (szFlag && szFlag.match(/\bGLOW\b/)) {
			var newTextBg = map.Dom.newText(newGroup, map.Scale.normalX(nFontSize), map.Scale.normalY(nFontSize * 0.25), szTextStyle + ";font-size:" + map.Scale.normalY(nFontSize) + "px;font-weight:normal;fill:none;stroke:white;stroke-width:" + map.Scale.normalY(nFontSize) / 5 + ";stroke-opacity:0.3;pointer-events:none;stroke-linejoin:bevel;", szText);
		}
		var newText = map.Dom.newText(newGroup, map.Scale.normalX(nFontSize), map.Scale.normalY(nFontSize * 0.25), szTextStyle, szText);

		// GR 16.01.2020 due to a browser SVG problem we must put the text into a unscaled group to get the right Box
		var xText = map.Dom.newText(SVGHiddenGroup, map.Scale.normalX(nFontSize), map.Scale.normalY(nFontSize * 0.25), szTextStyle, szText);
		var bBox = xText.fu.getBox();
		SVGHiddenGroup.removeChild(xText);

		newRect.setAttributeNS(null, "rx", map.Scale.normalX(nFontSize * 0.1));
		newRect.setAttributeNS(null, "ry", map.Scale.normalX(nFontSize * 0.1));
		newRect.setAttributeNS(null, "x", bBox.x - map.Scale.normalX(nFontSize * 0.3));
		newRect.setAttributeNS(null, "y", bBox.y - map.Scale.normalY(nFontSize * 0.0));
		newRect.setAttributeNS(null, "width", bBox.width + map.Scale.normalX(nFontSize * 0.7));
		newRect.setAttributeNS(null, "height", bBox.height + map.Scale.normalY(nFontSize) * 0.1);
		if (shadowRect) {
			shadowRect.setAttributeNS(null, "rx", map.Scale.normalX(nFontSize * 0.1));
			shadowRect.setAttributeNS(null, "ry", map.Scale.normalX(nFontSize * 0.1));
			shadowRect.setAttributeNS(null, "x", bBox.x - map.Scale.normalX(nFontSize * 0.3) + map.Scale.normalX(nFontSize * 0.12));
			shadowRect.setAttributeNS(null, "y", bBox.y + map.Scale.normalY(nFontSize * 0.0) + map.Scale.normalY(nFontSize * 0.12));
			shadowRect.setAttributeNS(null, "width", bBox.width + map.Scale.normalX(nFontSize * 0.7));
			shadowRect.setAttributeNS(null, "height", bBox.height + map.Scale.normalY(nFontSize) * 0.1);
		}
		if (!fBackground) {
			newRect.style.setProperty("display", "none", "");
			if (shadowRect) {
				shadowRect.style.setProperty("display", "none", "");
			}
		}

		return newGroup;
	}
};

//..............................................
// for theme legend in SVG
//..............................................

/**
 * Generate an overview chart of the theme
 * @param targetGroup the target group for the char to create
 * @param szDisplayId id of the parent widget (SVG)
 */
MapTheme.prototype.getOverviewChart = function (targetGroup, szDisplayId) {

	// GR 18.05.2015
	targetGroup.fu = new Methods(targetGroup);

	var nChartSize = 30;
	// important for text value label
	this.szChartFlag += "|MENUSIZE";

	// make overview chart for CHOROPLETH maps
	// ----------------------------------------
	if (this.szOverviewChart && this.szOverviewChart != "NONE" && this.nCount) {

		var mX = map.Scale.normalX(100);
		var mY = map.Scale.normalY(100);
		var nRadOuter = map.Scale.normalX(75);
		var nRadInner = map.Scale.normalX(50);


		if (typeof (DonutCharts) != 'undefined') {

			var pieGroup = map.Dom.newGroup(targetGroup);
			var donut = DonutCharts.newChart(SVGDocument, pieGroup, mX, mY, nRadOuter, nRadInner);

			if (this.szOverviewChart.match(/PIE/)) {
				donut.setStyle("flat");
				donut.setRadInner(0);
				donut.setRadOuter(map.Scale.normalX(55));
				donut.setCenter(map.Scale.normalX(80), map.Scale.normalY(55));
			}
			if (this.szOverviewChart.match(/DONUT/) || this.szOverviewChart.match(/3D/)) {
				donut.setStyle("3D");
				donut.setCenter(map.Scale.normalX(80), map.Scale.normalY(100));
			}
			donut.setLine("white");
			donut.setLineWidth(map.Scale.normalX(0.1));

			var nHeight = map.Scale.normalY(20);

			for (var i = 0; i < this.partsA.length; i++) {
				var nPercent = this.partsA[i].nCount / this.nCount * 100;
				var nPercentOfValue = 100 / this.nSum * this.partsA[i].nSum;
				if (this.nRealizedCount && this.szFlag.match(/CHART/)) {
					nPercent = this.partsA[i].nCount / this.nRealizedCount * 100;
				}
				if (this.nExactCount && this.exactSizeA) {
					nPercent = this.partsA[i].nCount / this.nExactCount * 100;
					nPercentOfValue = this.exactSizeA[i];
				}
				if (this.szOverviewChart.match(/DONUT/)) {
					nHeight = map.Scale.normalY(this.partsA[i].nSum / this.nSum * 80);
				}

				var szValue = String(this.partsA[i].nCount);
				var szPercent = nPercent ? String(" = " + this.formatValue(nPercent, 1) + " %") : "";
				var szPercentOfValue = nPercentOfValue ? String(", " + this.szLabelA[i] + " => " + this.formatValue(nPercentOfValue, 1) + "" + this.szUnit) : "";

				if (this.szOverviewChart.match(/PERCENTOFVALUE/)) {
					nPercent = nPercentOfValue;
					szPercent = "";
					if (this.nExactCount && this.exactSizeA) {
						szValue = String(this.formatValue(nPercent, 0));
					} else {
						szValue = String(this.formatValue(nPercent, 1) + (this.szFlag.match(/CHART/) ? this.szUnit : " %"));
					}
				} else if (!this.szOverviewChart.match(/DONUT/)) {
					szPercentOfValue = "";
				}
				if (this.szFlag.match(/CATEGORICAL/)) {
					szPercent += " (" + this.szLabelA[i] + ")";
					szPercentOfValue = "";
				} else if (this.szLegendLabelA && this.szLegendLabelA.length) {
					szPercent += " [" + this.szLegendLabelA[i] + "])";
				}

				donut.addPart(nPercent, nHeight, this.partsA[i].color, 0, szValue, String(this.partsA[i].nCount) + " member(s)" + szPercent + szPercentOfValue, "map.Themes.markClass(evt,'" + this.szId + "','" + i + "')", "map.Themes.unmarkClass(evt,'" + this.szId + "')");
			}
			donut.realize();

			this.drawDonutText(donut);

			var chartBox = map.Dom.getBox(targetGroup);
			if (chartBox.width > 0 && chartBox.height > 0) {
				var ptPos = targetGroup.fu.getPosition();
				var szSummarize = this.szOverviewChart.match(/PERCENTOFVALUE/) ? "*  value / class" : "*  members / class";
				var nYoff = map.Scale.normalY(10);
				if (this.szOverviewChart.match(/DONUT/) || this.szOverviewChart.match(/3D/)) {
					nYoff = map.Scale.normalY(15);
				}
				map.Dom.newText(targetGroup, map.Scale.normalX(80), chartBox.y + chartBox.height + nYoff, map.Scale.tStyle.Note.szStyle + ";text-anchor:middle;", szSummarize);
			}
		}
	} else {
		// make overview chart for bubble, square, symbols 
		// ----------------------------------------------------
		if ((this.szFlag.match(/BUBBLE/) || this.szFlag.match(/SQUARE/) || this.szFlag.match(/SYMBOL/)) &&
			!(this.szFlag.match(/CATEGORICAL/) && this.szFlag.match(/SYMBOL/))) {

			var nMinValue = this.nMinA[0];
			var nMaxValue = this.nMaxA[0];
			// GR 03.09.2007 new 
			if (this.szSizeField) {
				nMinValue = this.nMinSize;
				nMaxValue = this.nMaxSize;
			}
			var nMaxRadius = map.Scale.normalX(nChartSize / 2); //  * map.Scale.nFeatureScaling*map.Scale.nObjectScaling;
			var nMinRadius = nMaxRadius / Math.sqrt(nMaxValue) * Math.sqrt(nMinValue);
			if (this.szFlag.match(/LINEAR/) || this.szFlag.match(/SIZEP1/)) {
				nMinRadius = nMaxRadius / nMaxValue * nMinValue;
			}
			var szLineColor = this.colorScheme[1] ? this.colorScheme[1] : "none";
			var szSummarize = this.szFlag.match(/SUM/) ? "sum" : "mean";

			var nLinePos = 5;
			var nXPos = 20;
			var sumGroup = map.Dom.newGroup(targetGroup);

			if (!this.szFlag.match(/CATEGORICAL/)) {
				var sChartGroup = map.Dom.newGroup(sumGroup);
				var ptNull = this.drawChart(sChartGroup, null, nChartSize * 1.5, "VALUES|ZOOM|NORMSIZE");

				if (this.szFlag.match(/SEQUENCE/)) {
					var sChartBox = map.Dom.getBox(sChartGroup);
					var ptPos = sChartGroup.fu.getPosition();
					sChartGroup.fu.setPosition(sChartBox.width / 1.5 + ptPos.x, -sChartBox.height / 2 + ptPos.y);
					var scale = map.Scale.normalX(nChartSize * 7) / sChartBox.height;
					sChartGroup.fu.scale(scale, scale);
					nChartSize *= 7;
				}

				map.Dom.newText(sumGroup, map.Scale.normalX(0), map.Scale.normalY(5), map.Scale.tStyle.Note.szStyle + ";text-anchor:left;", map.Dictionary.getLocalText(szSummarize));

				sumGroup.fu.setPosition(map.Scale.normalX(nXPos), map.Scale.normalY(nChartSize));
				nLinePos = nChartSize + 15;
			}

			if (!this.szFlag.match(/SEQUENCE/)) {

				var minmaxGroup = map.Dom.newGroup(targetGroup);
				var sumBox = map.Dom.getBox(sumGroup);
				minmaxGroup.fu.setPosition(sumBox.x + sumBox.width + map.Scale.normalX(nChartSize * 0.66), map.Scale.normalY(-5));
				nLinePos = 0;
				var szLineStyle = "fill:none;stroke:black;stroke-width:" + map.Scale.normalX(0.25) + "px";

				var maxGroup = map.Dom.newGroup(minmaxGroup);
				if (this.szFlag.match(/BUBBLE/)) {
					map.Dom.newShape('circle', maxGroup, 0, 0, nMaxRadius, szLineStyle);
				} else if (this.szFlag.match(/SQUARE/)) {
					map.Dom.newShape('rect', maxGroup, -nMaxRadius, -nMaxRadius, nMaxRadius * 2, nMaxRadius * 2, szLineStyle);
				}
				map.Dom.newShape('line', maxGroup, 0, -nMaxRadius, nMaxRadius * 1.1, -nMaxRadius, szLineStyle);
				map.Dom.newText(maxGroup, nMaxRadius * 1.1 + map.Scale.normalX(2), -nMaxRadius, "font-family:arial;font-size:" + map.Scale.normalX(10) + "px;text-anchor:left;baseline-shift:-10%;fill:black;stroke:none;pointer-events:none", this.formatValue(nMaxValue, 1) + this.szUnit);
				maxGroup.fu.setPosition(map.Scale.normalX(nXPos), map.Scale.normalY(nLinePos + nChartSize / 2));

				if ((nMinRadius > 0) && (nMinRadius != nMaxRadius)) {
					var minGroup = map.Dom.newGroup(minmaxGroup);
					if (this.szFlag.match(/BUBBLE/)) {
						map.Dom.newShape('circle', minGroup, 0, 0, nMinRadius, szLineStyle);
					} else if (this.szFlag.match(/SQUARE/)) {
						map.Dom.newShape('rect', minGroup, -nMinRadius, -nMinRadius, nMinRadius * 2, nMinRadius * 2, szLineStyle);
					}

					map.Dom.newShape('line', minGroup, 0, -nMinRadius, nMaxRadius * 1.1, -nMinRadius, szLineStyle);
					map.Dom.newText(minGroup, nMaxRadius * 1.1 + map.Scale.normalX(2), -nMinRadius, "font-family:arial;font-size:" + map.Scale.normalX(10) + "px;text-anchor:left;baseline-shift:-60%;fill:black;stroke:none;pointer-events:none", this.formatValue(nMinValue, 1) + this.szUnit);
					minGroup.fu.setPosition(map.Scale.normalX(nXPos), map.Scale.normalY(nLinePos) + nMaxRadius * 2 - nMinRadius);
				}

				map.Dom.newText(minmaxGroup, map.Scale.normalX(nXPos), map.Scale.normalY(nLinePos + nChartSize + 15), map.Scale.tStyle.Note.szStyle + ";text-anchor:left;", map.Dictionary.getLocalText("min / max size-values"));
			}
			targetGroup.fu.scale(1, 1);
		}
		// make overview chart for buffer 
		// ----------------------------------------------------
		if (this.szFlag.match(/CHART/) && this.szFlag.match(/BUFFER/)) {


			var nMaxRadius = map.Scale.normalX(nChartSize / 2); //  * map.Scale.nFeatureScaling*map.Scale.nObjectScaling;
			var bBox = map.Dom.getBox(targetGroup.parentNode);
			var classOffset = bBox.width > 0 ? bBox.width / map.Scale.normalX(1) + 10 : 10;
			var maxGroup = map.Dom.newGroup(targetGroup.parentNode);
			map.Dom.newShape('circle', maxGroup, 0, 0, nMaxRadius, "fill:none;stroke:black;");
			var szLineStyle = "fill:none;stroke:black;stroke-width:" + map.Scale.normalX(1) + ";";
			map.Dom.newShape('line', maxGroup, 0, 0, nMaxRadius, 0, szLineStyle);
			map.Dom.newShape('line', maxGroup, 0, map.Scale.normalY(-2), 0, map.Scale.normalY(2.5), szLineStyle);
			map.Dom.newShape('line', maxGroup, nMaxRadius, 0, nMaxRadius + map.Scale.normalX(-3), map.Scale.normalY(-3), szLineStyle);
			map.Dom.newShape('line', maxGroup, nMaxRadius, 0, nMaxRadius + map.Scale.normalX(-3), map.Scale.normalY(3), szLineStyle);
			map.Dom.newText(maxGroup, nMaxRadius * 1.1 + map.Scale.normalX(2), map.Scale.normalX(-10), "font-family:arial;font-size:" + map.Scale.normalX(10) + "px;text-anchor:left;baseline-shift:-10%;fill:black;stroke:none;pointer-events:none", Map.Scale.prototype.formatDistanceString(this.nBufferSize * this.nScale));
			maxGroup.fu.setPosition(map.Scale.normalX(nChartSize / 2 + classOffset), map.Scale.normalY(nChartSize / 2));
			var chartButtonObj = new Button(targetGroup.parentNode, szDisplayId + ":bufferselectbutton", "BUTTON", '#bufferselect_button', "map.Selections.newSelection('activeLayer','activeBuffer','type:BUFFER;buffersize:200','test');", "", "select active layer with this buffer");
			chartButtonObj.setPosition(map.Scale.normalX(nChartSize + classOffset + 10), map.Scale.normalY(nChartSize));
			chartButtonObj.scale(1.4, 1.4);
			chartButtonObj = null;
			if (_activeTheme) {
				map.Dom.newText(targetGroup.parentNode, map.Scale.normalX(nChartSize + classOffset + 20), map.Scale.normalY(nChartSize + 6), "font-family:arial;font-size:" + map.Scale.normalX(8) + "px;text-anchor:left;baseline-shift:-10%;fill:gray;stroke:none;pointer-events:none", "... " + _activeTheme + "");
			}
		}
		// make overview chart for bar/pie/donut charts
		// --------------------------------------------
		if (this.szFlag.match(/CHART/) && !this.szFlag.match(/BUBBLE/) && !this.szFlag.match(/SQUARE/) && !this.szFlag.match(/CATEGORICAL/) && !this.szFlag.match(/BUFFER/) && !this.szFlag.match(/SYMBOL/)) {
			_TRACE("showInfo - drawChart =====>");
			var textBox = map.Dom.getBox(targetGroup.parentNode);
			if (textBox.width < 0) {
				textBox = new box(0, 0, 0, 0);
			}
			// GR 17.08.2008 dynamic size
			var nChartSize = 30;
			if (this.szFlag.match(/BAR/) && (this.nOrigSumA.length > 5) && !(this.szFlag.match(/STACKED/))) {
				nChartSize = 15 * this.nOrigSumA.length / Math.log(this.nOrigSumA.length);
			}

			var ptNull = this.drawChart(targetGroup, null, nChartSize, "VALUES|NORMSIZE" + (this.szFlag.match(/STACKED/) ? "|EXPANDMAX" : ""));
			var chartBox = map.Dom.getBox(targetGroup);
			var nScale = 1;
			nScale = Math.min(2.5, Math.max(textBox.height / chartBox.height, map.Scale.normalX(100) / chartBox.height));
			targetGroup.fu = new Methods(targetGroup);
			targetGroup.fu.scale(nScale, nScale);

			var summarizeGroup = map.Dom.newGroup(targetGroup, "textGroup");
			summarizeGroup.fu.scale(1 / nScale, 1 / nScale);

			chartBox = targetGroup.fu.getBox();
			if (this.szFlag.match(/BAR/)) {
				targetGroup.fu.setPosition(textBox.width - chartBox.x + map.Scale.normalX(10), -chartBox.y + Math.max(10, textBox.height * 0.95 - chartBox.height));
			} else {
				targetGroup.fu.setPosition(textBox.width - chartBox.x + map.Scale.normalX(10), -chartBox.y + Math.max(10, textBox.height / 2 - chartBox.height / 2));
			}

			var szSummarize = " * overall sum";
			if (this.szAggregation && this.szAggregation.match(/mean/)) {
				var szSummarize = " * arithmetic mean";
			}
			var szAnchor = "middle";
			if (this.szFlag.match(/RIGHT/) ||
				this.szFlag.match(/STACKED/) ||
				this.szFlag.match(/CENTER/) ||
				this.szFlag.match(/POINTER/) ||
				this.partsA.length <= 2) {
				szAnchor = "start";
			}
			map.Dom.newText(summarizeGroup, 0, chartBox.height + chartBox.y + map.Scale.normalY(5), map.Scale.tStyle.Note.szStyle + "baseline-shift:-100%;text-anchor:" + szAnchor + ";", szSummarize);
		}
	}
};


/**
 * Create a color scheme legend 
 * @param targetGroupp target group (SVG)
 * @param szDisplayId id of the parent widget (SVG)
 * @type group
 * @return legend group (SVG)
 */
MapTheme.prototype.drawColorSchemeLegend = function (targetGroupp, szDisplayId) {

	_TRACE("== colorlegend ==>");

	var legendGroup = null;

	// preparations
	// -----------------------

	var nFontSize = map.Scale.nButtonSize ? map.Scale.nButtonSize * 0.66 : 12;
	var nSwatchHeight = map.Scale.nButtonSize || 12;
	var nSwatchWidth = map.Scale.nButtonSize ? map.Scale.nButtonSize * 1.2 : 18;
	var nSwatchWidthDef = nSwatchWidth;

	var nChartSize = 30;

	var szTextStyle = "font-family:arial;font-size:" + map.Scale.normalY(nFontSize) + "px;fill:#666666;pointer-events:none;";


	var nLine = 0;
	var nLineHeight = nSwatchHeight * 1.2;
	if (this.szFlag.match(/BAR/) && this.szFlag.match(/\bUP\b/)) {
		nLineHeight = nSwatchHeight;
	}
	var nTextOff = nFontSize * 1.15;
	var nLinePos = nLine * nLineHeight;
	var nStartI = 0;
	if (this.szFlag.match(/BAR/) && (this.szFlag.match(/\bUP\b/) || this.szFlag.match(/STACKED/))) {
		nStartI = this.partsA.length - 1;
	}

	if (this.showInfoMore || this.szFlag.match(/CATEGORICAL/) || this.szFlag.match(/\bUP\b/) || this.szFlag.match(/SYMBOL/) || (this.szLabelA && (!this.szFlag.match(/\bCLIP\b/))) || (this.partsA.length <= 2)) {
		this.szLegendStyle = "large";
	} else {
		this.szLegendStyle = "compact";
	}

	// GR make legend scrollable
	var scrollObj = new ScrollArea(null, targetGroupp, null, 10, 10, 10);
	if (scrollObj) {
		scrollObj.reformat();
		legendGroup = scrollObj.workspaceNode;
	} else {
		legendGroup = map.Dom.newGroup(targetGroupp, szDisplayId + ":legend");
	}

	// calculate the precision for the min increment; 
	// reason: min < value >= max but partsA[i].min == partsA[i-1].max
	// so we have to increment the min value in the legend by 0.01, 0.1 or 1
	var nMinInc = 1;
	_TRACE("colorlegend: " + this.partsA.length + " parts --->");
	for (var i = 0; i < this.partsA.length; i++) {
		if (this.partsA[i].min) {
			if (this.partsA[i].min.toFixed(0) != this.partsA[i].min) {
				nMinInc = Math.min(nMinInc, 0.1);
			}
			if (this.partsA[i].min.toFixed(1) != this.partsA[i].min) {
				nMinInc = Math.min(nMinInc, 0.01);
			}
		}
	}

	var _indexA = [];
	for (var i = 0; i < this.partsA.length; i++) {
		_indexA[i] = {};
		_indexA[i].i = i;
		_indexA[i].value = this.partsA[i].nCount;
	}

	if (this.szFlag.match(/SYMBOL/) && this.szFlag.match(/CATEGORICAL/) && this.szFlag.match(/SORTDOWN/)) {
		_indexA.sort(this.sortIndexDown);
	}

	if ((this.szFlag.match(/POINTER/) || this.szFlag.match(/INVERT/)) && !this.szLegendStyle.match(/compact/)) {
		_indexA.reverse();
	}

	var nStep = 1;
	if (!this.szLabelA && (_indexA.length > 15)) {
		nStep = Math.floor(_indexA.length / 10);
		nSwatchHeight *= 1.5;
	}

	var nXpos = ((this.showInfoMore && this.isMarkable)) ? 18 : 10;

	// check, if we have counts for dynamic swatch width
	// -------------------------------------------------
	var fSumSwatch = false;
	if (this.szFlag.match(/CHART/) && this.szFieldsA.length > 1 && !(this.szFlag.match(/OFFSET/) || this.szFlag.match(/DEVIATION/))) {
		var sss = 0;
		for (var s = 0; s < this.nOrigSumA.length; s++) {
			if (this.partsA[s] && typeof (this.partsA[s].nSum) != "undefined") {
				sss++;
			}
		}
		var fSumSwatch = (sss == this.nOrigSumA.length);
	}

	// here we go
	// ===========
	for (var n = 0; n < _indexA.length; n += nStep) {
		var i = _indexA[n].i;

		var nIndex = Math.min(Math.abs(nStartI - i), this.partsA.length - nStep);
		var newText = null;
		var classRect = null;

		if (this.szFlag.match(/SYMBOL/) && this.szFlag.match(/CATEGORICAL/)) {
			if (this.nSkipCount === 0) {
				nSwatchWidth = nChartSize / 10 * this.partsA[i].nCount / this.nCount * 100;
			} else {
				nSwatchWidth = nChartSize / this.nCount * 10 * this.partsA[i].nCount;
			}
		} else
		if (fSumSwatch) {
			var nSumMax = 0;
			var width = 0;
			if (this.szFlag.match(/MORPH/)) {
				for (var s = 0; s < this.nOrigSumA.length / 2; s++) {
					var nSum = this.nOrigSumA[s] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + this.nOrigSumA[s + this.nOrigSumA.length / 2] * this.nActualFrame / (this.nClipFrames - 1);
					nSumMax = Math.max(nSumMax, nSum);
				}
				width = (this.nOrigSumA[nIndex] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + this.nOrigSumA[nIndex + this.nOrigSumA.length / 2] * this.nActualFrame / (this.nClipFrames - 1)) / nSumMax;
			} else {
				for (var s = 0; s < this.nOrigSumA.length; s++) {
					nSumMax = Math.max(nSumMax, this.partsA[s].nSum);
				}
				width = this.partsA[nIndex].nSum / nSumMax;
			}
			nSwatchWidth = nChartSize * 2 * width;
		}

		// GR 30.06.2014 assert nSwatchWidth
		nSwatchWidth = isNaN(nSwatchWidth) ? nSwatchWidthDef : nSwatchWidth;

		if (this.szFlag.match(/BUBBLE/)) {
			var nSize = (this.szFlag.match(/CATEGORICAL/) || this.szSizeField) ? nSwatchHeight / 2 : nSwatchHeight / 4 + nSwatchHeight / 4 * (i + 1) / this.partsA.length;
			classRect = map.Dom.newShape('circle', legendGroup, map.Scale.normalX(nXpos + nSwatchHeight / 2), map.Scale.normalY(nLinePos + nSwatchHeight / 2), map.Scale.normalY(nSize), "fill:" + this.colorScheme[nIndex] + ";stroke:#eeeeee;stroke-width:" + map.Scale.normalX(0.1) + ";");
		} else {
			if (nStep > 1) {
				classRect = map.Dom.newGroup(legendGroup, "");
				for (var k = 0; k < nStep; k++) {
					map.Dom.newShape('rect', classRect, map.Scale.normalX(nXpos), map.Scale.normalY(nLinePos + nSwatchHeight / nStep * k), map.Scale.normalX(nSwatchWidth), map.Scale.normalY(nSwatchHeight / nStep), "fill:" + this.colorScheme[nIndex + k] + ";stroke:none;");
				}
			} else {
				classRect = map.Dom.newShape('rect', legendGroup, map.Scale.normalX(nXpos), map.Scale.normalY(nLinePos), map.Scale.normalX(nSwatchWidth), map.Scale.normalY(nSwatchHeight), "fill:" + this.colorScheme[nIndex] + ";stroke:#eeeeee;stroke-width:" + map.Scale.normalX(0.1) + ";");
			}
		}

		if (classRect) {

			var nClassCount = this.partsA[nIndex].nCount;
			for (var k = 1; k < nStep; k++) {
				nClassCount += this.partsA[nIndex + k].nCount;
			}

			// GR 10.02.2009 create checkboxes to toggle class display
			//
			if (this.isMarkable && this.showInfoMore) {
				// GR 10.12.2010 prevent clicking on background --> refresh 
				var helpRect = map.Dom.newShape('rect', legendGroup, map.Scale.normalX(-5), map.Scale.normalY(nLinePos - 2), map.Scale.normalX(nSwatchWidth), map.Scale.normalY(nSwatchHeight + 4), "fill:white;stroke:none;opacity:0;");
				helpRect.setAttributeNS(null, "id", this.szId + ":widget:background:" + nIndex);

				var buttonObj = new Button(legendGroup, this.szId + ":class:" + nIndex, "CHECKBOX|SELECTED", "", "map.Themes.showClass(evt,'" + this.szId + "','" + nIndex + "','" + nStep + "')", "map.Themes.hideClass(evt,'" + this.szId + "','" + nIndex + "','" + nStep + "')", "show/hide class");
				buttonObj.setPosition(map.Scale.normalX(map.Scale.nButtonSize / 2 - 1), map.Scale.normalY(nLinePos + map.Scale.nButtonSize / 2 - 1));
				buttonObj.scale(0.75, 0.75);
			}

			// make class label
			//
			var nMinVal = this.partsA[nIndex].min + (n ? nMinInc : 0);
			var nMaxVal = this.partsA[nIndex + nStep - 1].max;
			var nDezimal = ((nMaxVal - nMinVal) > 100) ? 0 : 2;
			var szMin = this.formatValue(nMinVal, nDezimal);
			var szMax = this.formatValue(nMaxVal, nDezimal);
			var szMembers = "";
			if (this.szFlag.match(/SHOWMEMBERS/)) {
				szMembers = "  [" + nClassCount + "]";
			}
            var szLabel = "";
			if (szMin != szMax) {
				szLabel = szMin + "..." + szMax + (this.szLegendUnits ? this.szLegendUnits : "") + this.szUnit + szMembers;
			} else {
				szLabel = szMin + (this.szLegendUnits ? this.szLegendUnits : "") + this.szUnit + szMembers;
			}
			if (!this.szFlag.match(/\bCLIP\b/) || this.szFlag.match(/MORPH/)) {
				if (this.szLabelA && this.szLabelA[nIndex]) {
					szLabel = this.szLabelA[nIndex];
				}
			}
			this.szLegendLabelA[nIndex] = szLabel;

			if (this.szLegendStyle.match(/compact/)) {
				if (this.fGrayNoMember && (nClassCount === 0) && this.szFlag.match(/CHOROPLETH/) && this.szFlag.match(/DOMINANT/)) {
					classRect.style.setProperty("fill-opacity", "0.03", "");
					var color = classRect.style.getPropertyValue("fill");
					classRect.style.setProperty("stroke-opacity", "0.2", "");
					classRect.style.setProperty("stroke", "black", "");
					classRect.style.setProperty("stroke-width", map.Scale.normalX(0.3), "");
				}
				if (!this.szFlag.match(/CATEGORICAL/) && !(this.szFlag.match(/DOMINANT/) && szLabel.length > 15)) {
					var szSize = ";font-size:" + map.Scale.normalX(nFontSize * 0.9) + "px;";
					if (n === 0) {
						szLabel = (szLabel.length > 0) ? (szMin + this.szUnit) : szLabel;
						newText = map.Dom.newText(legendGroup, map.Scale.normalX(nXpos + 2), map.Scale.normalY(nLinePos + nTextOff * (nStep + 1.5)), szTextStyle + szSize, szLabel);
					} else if (n == _indexA.length - nStep) {
						szLabel = (szLabel.length > 0) ? (szMax + this.szUnit) : szLabel;
						newText = map.Dom.newText(legendGroup, map.Scale.normalX(nXpos + 2), map.Scale.normalY(nLinePos + nTextOff * (nStep + 1.5)), szTextStyle + szSize, szLabel);
					}
				}
			} else {

				// symbol and text
				//
				if (this.szFlag.match(/SYMBOL/) && this.szFlag.match(/CATEGORICAL/)) {
					var nXoff = nSwatchWidth + 2;

					var szText = String(this.partsA[i].nCount);
					if (this.nSkipCount === 0) {
						szText = String(Math.round(100 / this.nCount * this.partsA[i].nCount)) + "%";
					}
					var nValueTextLen = szText.length * 5 / 7 * nFontSize;
					if ((this.szTextPlacement == "dynamic") && (nValueTextLen < nSwatchWidth)) {
						nXoff -= String(this.partsA[i].nCount).length * 5 / 7 * nFontSize;
					}
					newText = map.Dom.newText(legendGroup, map.Scale.normalX(nXpos + nXoff), map.Scale.normalY(nLinePos + nTextOff + 1), szTextStyle, szText);
					nXoff += nValueTextLen;

					if (this.szSymbolsA[i] && this.szSymbolsA[i].match(/symbol/)) {
						var newShape = map.Dom.constructNode('use', legendGroup, {
							'xlink:href': '#' + this.szSymbolsA[i] + ":antizoomandpan"
						});
						newShape.setAttributeNS(null, "style", "fill:" + this.colorScheme[nIndex]);
						newShape.fu.scale(0.5, 0.5);
						newShape.fu.setPosition(map.Scale.normalX(nXpos + nXoff + 10), map.Scale.normalY(nLinePos + nTextOff - 3));
						nXoff += 20;
					}
					newText = map.Dom.newText(legendGroup, map.Scale.normalX(nXpos + nXoff), map.Scale.normalY(nLinePos + nTextOff), szTextStyle, "(" + szLabel + ")");
					newText.style.setProperty("fill", "#bbbbdd", "");
				}
				// only text
				//
				else {
					var nXoff = nSwatchWidth + 4;
					if (fSumSwatch) {
						var tValue = this.partsA[nIndex].nSum;
						if (this.szFlag.match(/MORPH/)) {
							tValue = this.nOrigSumA[nIndex] * (this.nClipFrames - 1 - this.nActualFrame) / (this.nClipFrames - 1) + this.nOrigSumA[nIndex + this.nOrigSumA.length / 2] * this.nActualFrame / (this.nClipFrames - 1);
						}
						if ((this.szField100 && !this.szFlag.match(/SUM/)) || (this.szAggregation && !this.szAggregation.match(/sum/))) {
							tValue /= this.partsA[nIndex].nCount;
						}
						szLabel = szLabel + "  (" + this.formatValue(tValue, 1) + this.szUnit + ")";
					}
					newText = map.Dom.newText(legendGroup, map.Scale.normalX(nXpos + nXoff), map.Scale.normalY(nLinePos + nTextOff), szTextStyle, szLabel);
					if (this.fGrayNoMember && nClassCount === 0 && this.szFlag.match(/CHOROPLETH/)) {
						newText.style.setProperty("fill", "#bbbbdd", "");
						classRect.style.setProperty("opacity", "0.1", "");
					}
				}
			}
			if (this.szFlag.match(/BUFFER/)) {
				classRect.style.setProperty("fill-opacity", this.fillOpacity ? this.fillOpacity : (this.nOpacity ? this.nOpacity : 0), "");
			}
			if (this.szFieldsA.length == 1 || !this.szFlag.match(/CHART/) || (this.szFlag.match(/SYMBOL/) && this.szFlag.match(/CATEGORICAL/))) {
				if (this.szLegendStyle.match(/compact/)) {
					classRect.setAttributeNS(szMapNs, "tooltip", szLabel + " (" + nClassCount + " member(s))");
				} else {
					classRect.setAttributeNS(szMapNs, "tooltip", nClassCount + " member(s)");
				}

				// get actual classRect and set style for onover
				var szRectStyle = classRect.getAttributeNS(null, "style");
				classRect.setAttributeNS(szMapNs, "onoverstyle", szRectStyle + ";stroke:black;stroke-width:" + map.Scale.normalX(0.5) + ";");

				classRect.setAttributeNS(null, "onmouseover", "map.Themes.markClass(evt,'" + this.szId + "','" + nIndex + "','" + nStep + "')");
				classRect.setAttributeNS(null, "onmouseout", "map.Themes.unmarkClass(evt,'" + this.szId + "')");
				classRect.setAttributeNS(null, "onclick", "map.Themes.zoomToClass(evt,'" + this.szId + "','" + nIndex + "','" + nStep + "')");
				classRect.setAttributeNS(null, "id", szDisplayId + ":widget:classrect:" + nIndex);
			} else if (this.szFlag.match(/SYMBOL/)) {
				if (this.szFlag.match(/CATEGORICAL/)) {
					classRect.setAttributeNS(szMapNs, "tooltip", this.partsA[i].nCount + " (" + this.formatValue(this.partsA[i].nCount / this.nCount * 100, 1) + " %)");
				} else if (this.szFlag.match(/SEQUENCE/)) {
					classRect.setAttributeNS(szMapNs, "tooltip", this.nOrigSumA[i] + " (" + this.formatValue(this.nOrigSumA[i] / this.nSum * 100, 1) + " %)");
				}
			} else if (this.szFieldsA.length > 1 && !this.szFlag.match(/SEQUENCE/)) {
				if (this.nSum100) {
					classRect.setAttributeNS(szMapNs, "tooltip", this.formatValue(100 / this.nSum100 * this.nOrigSumA[nIndex], 1) + " %");
				} else if (this.nSum) {
					classRect.setAttributeNS(szMapNs, "tooltip", this.nOrigSumA[nIndex] + " (" + this.formatValue(100 / this.nSum * this.nOrigSumA[nIndex], 1) + " %)");
				}
				classRect.setAttributeNS(null, "onmouseover", "map.Themes.markClass(evt,'" + this.szId + "','" + nIndex + "','" + nStep + "')");
				classRect.setAttributeNS(null, "onmouseout", "map.Themes.unmarkClass(evt,'" + this.szId + "')");
			}
		}
		// one swatch done 
		// ------------------
		if (this.szLegendStyle.match(/compact/)) {
			nXpos += nSwatchWidth;
		} else {
			nLinePos += nLineHeight * 9 / 10;
		}
	}
	if (this.szLegendStyle.match(/compact/)) {
		nLinePos += nLineHeight * nStep * 2;
	} else
	if (this.nNoData) {
		nLinePos += nLineHeight * 1.5 / 10;
		classRect = map.Dom.newShape('rect', legendGroup, 0, map.Scale.normalY(nLinePos), map.Scale.normalX(nSwatchWidth), map.Scale.normalY(nSwatchHeight), "fill:" + (this.szNoDataColor ? this.szNoDataColor : "#ffffff") + ";stroke:#000000;stroke-width:" + map.Scale.normalX(0.1) + ";");
		classRect.setAttributeNS(szMapNs, "tooltip", this.nNoData + " member(s)");
		classRect.setAttributeNS(null, "onmouseover", "map.Themes.markClass(evt,'" + this.szId + "','" + nIndex + "')");
		classRect.setAttributeNS(null, "onmouseout", "map.Themes.unmarkClass(evt,'" + this.szId + "')");
		newText = map.Dom.newText(legendGroup, map.Scale.normalX(22), map.Scale.normalY(nLinePos + nTextOff), szTextStyle, map.Dictionary.getLocalText("no data"));
		nLinePos += nLineHeight * 9 / 10;
	}

	if (scrollObj) {
		scrollObj.setWidth(-1);
		scrollObj.setHeight(Math.min(nLinePos + nLineHeight, (map.Scale.bBox.height / map.Scale.normalY(2.2))));
		if (this.nClipColorLegend) {
			scrollObj.setHeight(this.nClipColorLegend);
		}
		scrollObj.reformat();
		if (scrollObj.hasScrollBars()) {
			legendGroup.style.setProperty("display", "none", "");
			map.Dom.newShape('rect', targetGroupp, 0, 0, map.Scale.normalX(scrollObj.getWidth()), map.Scale.normalY(scrollObj.getHeight()), "fill:none;stroke:none;");
		}
	}

	return legendGroup;
};


/**
 *	
 * Display the info pane for a realized map theme
 *
 */

MapTheme.prototype.showInfo = function () {
	// GR 17.076.2018 no more
	return;
};


//..............................................
// C H A R T   T Y P E   M E N U
//..............................................

/**
 * get chart button
 * create a chart variation to be used as a button to change the chart theme 
 * @param targetGroup the SVG group where to create the button
 * @param nChartSize the size of the chart within the button
 * @param szMenuType flag to create size/height arrows within the buttons
 */
MapTheme.prototype.chartButton = function (targetGroup, nChartSize, szMenuType) {

	var targetGroup = map.Dom.newGroup(targetGroup, "chartvari" + String(Math.random()));
	var szMerkFlag = this.szFlag;
	if (szMenuType == "2D") {
		this.removeDefinitionFromFlag("3D");
	}
	this.szFlag += "|NORMSIZE|SILENT|MENUSIZE|" + szMenuType;
	var ptNull = this.drawChart(targetGroup, null, nChartSize);
	this.szFlag = szMerkFlag;
	var bBox = map.Dom.getBox(targetGroup);
	this.addChartTypeSign(targetGroup, szMenuType);
	var nScale = Math.min(map.Scale.normalX(nChartSize) / bBox.width, map.Scale.normalY(nChartSize) / bBox.height);
	targetGroup.fu.scale(nScale, nScale);
	targetGroup.fu.setPosition(map.Scale.normalX(nChartSize + 10), map.Scale.normalY(nChartSize) * nScale);
	return targetGroup;
};

/**
 * add definition from flag string
 * @param szDef the definition to remove (e.g. "3D" )
 * @type string
 * @return the new flag string without szDef
 */
MapTheme.prototype.addDefinitionToFlag = function (szDef) {
	return (this.szFlag = this.szFlag + "|" + szDef);
};

/**
 * remove definition from flag string
 * @param szDef the definition to remove (e.g. "3D" )
 * @type string
 * @return the new flag string without szDef
 */
MapTheme.prototype.removeDefinitionFromFlag = function (szDef) {
	var szNewFlag = "";
	var szFlagA = this.szFlag.split('|');
	for (var i = 0; i < szFlagA.length; i++) {
		if (szFlagA[i] != szDef) {
			szNewFlag += (szNewFlag.length ? "|" : "") + szFlagA[i];
		}
	}
	return (this.szFlag = szNewFlag);
};

/**
 * remove definition from string
 * @param szFlag the definition string
 * @param szDef the definition to remove (e.g. "3D" )
 * @type string
 * @return the new flag string without szDef
 */
MapTheme.prototype.removeDefinition = function (szFlag, szDef) {
	var szNewFlag = "";
	var szFlagA = szFlag.split('|');
	for (var i = 0; i < szFlagA.length; i++) {
		if (szFlagA[i] != szDef) {
			szNewFlag += (szNewFlag.length ? "|" : "") + szFlagA[i];
		}
	}
	return szNewFlag;
};

/**
 * add a size sign to the chart group
 * @param targetGroup the group where to create the sign
 * @param szFlag the actual chart type
 */
MapTheme.prototype.addChartTypeSign = function (targetGroup, szFlag) {
	var szPath = "M0,0 l" + map.Scale.normalX(1.5) + ",-" + map.Scale.normalX(1.5) + " 0," + map.Scale.normalX(3) + " -" + map.Scale.normalX(1.5) + ",-" + map.Scale.normalX(1.5) + " M" + map.Scale.normalX(2.5) + ",0 l" + map.Scale.normalX(17.5) + ",0 M" + map.Scale.normalX(22.5) + ",0 l-" + map.Scale.normalX(1.5) + ",-" + map.Scale.normalX(1.5) + " 0," + map.Scale.normalX(3) + " " + map.Scale.normalX(1.5) + ",-" + map.Scale.normalX(1.5) + "";
	if (szFlag.match(/SIZE/)) {
		var signGroup = map.Dom.newGroup(targetGroup, "");
		map.Dom.newShape('path', signGroup, szPath, "stroke:white;stroke-width:" + map.Scale.normalX(4) + ";stroke-opacity:0.5;stroke-linejoin:miter;stroke-linecap:square;");
		map.Dom.newShape('path', signGroup, szPath, "stroke:#666666;stroke-width:" + map.Scale.normalX(1.5) + ";stroke-linejoin:miter;stroke-linecap:square;");
		signGroup.fu.setPosition(-map.Scale.normalX(10), map.Scale.normalX(-5));
	}
	if (szFlag.match(/HEIGHT/)) {
		var signGroup = map.Dom.newGroup(targetGroup, "");
		map.Dom.newShape('path', signGroup, szPath, "stroke:white;stroke-width:" + map.Scale.normalX(4) + ";stroke-opacity:0.5;stroke-linejoin:miter;stroke-linecap:square;");
		map.Dom.newShape('path', signGroup, szPath, "stroke:#666666;stroke-width:" + map.Scale.normalX(1.5) + ";stroke-linejoin:miter;stroke-linecap:square;");
		signGroup.setAttributeNS(null, "transform", "translate(0," + (-map.Scale.normalX(25)) + ") rotate(90)");
	}
};

/**
 * chart type menu
 * make chart type button array in the target group and 
 * return an array of possible char types 
 * @param targetGroup the group where to create the sign
 * @param szType the type of the menu (obsolete) 
 * @param nMaxWidth maximal width (pixel) of the buttonarray to crteate (optional)
 * @type array
 * @return array of chart definitions
 */
MapTheme.prototype.getChartTypeMenu = function (targetGroup, szType, nMaxWidth) {
	if (typeof (szChartTypeList) == "undefined") {
		var szChartTypeList = new Array(
		"CHART|BAR"
		,"CHART|BAR|3D"
		,"CHART|BAR|3D|SORT"
		,"CHART|BAR|HORZ|LEFT|UP"
		,"CHART|BAR|HORZ|RIGHT|UP"
		,"CHART|BAR|HORZ|LEFT|UP|COMPRESS"
		,"CHART|BAR|HORZ|RIGHT|UP|COMPRESS"
		,"CHART|BAR|HORZ|LEFT|UP|3D"
		,"CHART|BAR|HORZ|RIGHT|UP|3D"
		,"CHART|BAR|HORZ|LEFT|UP|COMPRESS|3D"
		,"CHART|BAR|HORZ|RIGHT|UP|COMPRESS|3D"
		,"CHART|BAR|HORZ|CENTER|UP"
		,"CHART|BAR|STACKED"
		,"CHART|BAR|STACKED|3D"
		,"CHART|BAR|SORT|3D|COLUMNS|STACKED"
		,"CHART|BAR|SORT|3D|COLUMNS|STACKED|SIZE"
		,"CHART|PIE"
		,"CHART|PIE|SIZE"
		,"CHART|PIE|3D"
		,"CHART|PIE|3D|SIZE"
		,"CHART|PIE|3D|HEIGHT"
		,"CHART|PIE|3D|VOLUME"
		,"CHART|PIE|DONUT"
		,"CHART|PIE|DONUT|SIZE"
		,"CHART|PIE|DONUT|3D"
		,"CHART|PIE|DONUT|3D|SIZE"
		,"CHART|PIE|DONUT|3D|HEIGHT"
		,"CHART|PIE|DONUT|3D|VOLUME"
		,"CHART|PIE|STARBURST"
		,"CHART|PIE|STARBURST|SIZE"
		,"CHART|PIE|STARBURST|3D"
		,"CHART|PIE|STARBURST|3D|SIZE"
		,"CHART|PIE|STARBURST|3D|HEIGHT"
		,"CHART|PIE|STARBURST|3D|VOLUME"
		,"CHART|PIE|DONUT|STARBURST"
		,"CHART|PIE|DONUT|STARBURST|SIZE"
		,"CHART|PIE|DONUT|STARBURST|3D"
		,"CHART|PIE|DONUT|STARBURST|3D|SIZE"
		,"CHART|PIE|DONUT|STARBURST|3D|HEIGHT"
		,"CHART|PIE|DONUT|STARBURST|3D|VOLUME"
		);
	}
	if ( typeof(szChartTypeListSingleValue_old) == "undefined" ){
		var szChartTypeListSingleValue_old = new Array(
		"CHART|BAR"
		,"CHART|BAR|VALUES"
		,"CHART|BAR|3D"
		,"CHART|BAR|3D|VALUES"
		,"CHART|BAR|3D|VOLUME"
		,"CHART|BAR|3D|VOLUME|VALUES"
		,"CHART|BAR|HORZ|RIGHT|UP"
		,"CHART|BAR|HORZ|RIGHT|UP|VALUES"
		,"CHART|BAR|HORZ|RIGHT|UP|3D"
		,"CHART|BAR|HORZ|RIGHT|UP|VALUES|3D"
		,"CHART|BAR|POINTER"
		,"CHART|BAR|POINTER|VALUES"
		,"CHART|BUBBLE|SURFACE"
		,"CHART|BUBBLE|SURFACE|VALUES"
		,"CHART|SQUARE|SURFACE"
		,"CHART|SQUARE|SURFACE|VALUES"
		);
	}
	if ( typeof(szChartTypeListSingleValue) == "undefined" ){
		var szChartTypeListSingleValue = new Array(
		 "CHOROPLETH"
		,"CHART|BUBBLE"
		,"CHART|SQUARE"
		,"CHART|PIE|3D|SIZE"
		,"CHART|PIE|3D|HEIGHT"
		,"CHART|PIE|3D|SIZE|HEIGHT"
 		,"CHART|BAR|3D|VOLUME"
		,"CHART|BAR"
		,"CHART|BAR|3D"
		,"CHART|BAR|3D|SIZE"
		,"CHART|BAR|HORZ|RIGHT|UP"
		,"CHART|BAR|HORZ|RIGHT|UP|3D"
		,"CHART|BAR|POINTER"
		,"CHART|BAR|POINTER|SIZE"
		,"CHART|BAR|HORZ|RIGHT|UP|POINTER"
		,"CHART|LABEL"
		);
	}

	var szOrigFlag = this.szOrigFlag;

	var szTypeList = szChartTypeListSingleValue;
	if ((this.szFieldsA.length > 1) ||
		(this.szFlag.match(/CATEGORICAL/) && this.szFlag.match(/AGGREGATE/))) {
		szTypeList = szChartTypeList;
	}

	var nSwatch = 60;
	var nNewLine = nMaxWidth ? (nMaxWidth / nSwatch) : 3;

	for (var i = 0; i < szTypeList.length; i++) {
		var merkFlag = this.szFlag;

		var aGroup = map.Dom.constructNode("a", targetGroup, {});
		map.Dom.newShape('rect', aGroup, map.Scale.normalX(nSwatch * (i % nNewLine)), map.Scale.normalY(nSwatch * Math.floor(i / nNewLine)), map.Scale.normalX(nSwatch), map.Scale.normalY(nSwatch), "fill:#f8f8ff;stroke:lightgray;stroke-dasharray:50 50;stroke-width:" + map.Scale.normalX(1) + ";");

		var donutGroup = map.Dom.newGroup(aGroup, "szDisplayId" + ":chart:" + String(Math.random()));

		map.Dom.setClipRect(donutGroup, new box(-map.Scale.normalX(25), -map.Scale.normalX(nSwatch), map.Scale.normalX(nSwatch), map.Scale.normalX(nSwatch)));

		this.szFlag = szTypeList[i] + "|NORMSIZE|SILENT|MENUSIZE";
		if (merkFlag.match(/CATEGORICAL/)) {
			this.szFlag += "|CATEGORICAL";
		}
		if (merkFlag.match(/GROUP/)) {
			this.szFlag += "|GROUP";
		}
		if (merkFlag.match(/AGGREGATE/)) {
			this.szFlag += "|AGGREGATE";
		}
		if (merkFlag.match(/COMPATIBLE/)) {
			this.szFlag += "|COMPATIBLE";
		}
		if (merkFlag.match(/FAST/)) {
			this.szFlag += "|FAST";
		}
		if (merkFlag.match(/RELOCATE/)) {
			this.szFlag += "|RELOCATE";
		}
		if (merkFlag.match(/DIFFERENCE/)) {
			this.szFlag += "|DIFFERENCE";
		}
		if (merkFlag.match(/FRACTION/)) {
			this.szFlag += "|FRACTION";
		}
		if (merkFlag.match(/INVERT/)) {
			this.szFlag += "|INVERT";
		}
		if (merkFlag.match(/INVERTSIZE/)) {
			this.szFlag += "|INVERTSIZE";
		}
		if (merkFlag.match(/RELATIVE/)) {
			this.szFlag += "|RELATIVE";
		}
		if (merkFlag.match(/DENSITY/)) {
			this.szFlag += "|DENSITY";
		}
		if (merkFlag.match(/DOPACITYMAX/)) {
			this.szFlag += "|DOPACITYMAX";
		} else
		if (merkFlag.match(/DOPACITYLOGMAX/)) {
			this.szFlag += "|DOPACITYLOGMAX";
		} else
		if (merkFlag.match(/DOPACITYPOWMAX/)) {
			this.szFlag += "|DOPACITYPOWMAX";
		} else
		if (merkFlag.match(/DOPACITYMEAN/)) {
			this.szFlag += "|DOPACITYMEAN";
		} else
		if (merkFlag.match(/DOPACITYLOGMEAN/)) {
			this.szFlag += "|DOPACITYLOGMEAN";
		} else
		if (merkFlag.match(/DOPACITYPOWMEAN/)) {
			this.szFlag += "|DOPACITYPOWMEAN";
		} else
		if (merkFlag.match(/DOPACITYLOG/)) {
			this.szFlag += "|DOPACITYLOG";
		} else
		if (merkFlag.match(/DOPACITY/)) {
			this.szFlag += "|DOPACITY";
		}
		/**
		if (merkFlag.match(/SUM/) ){
			this.szFlag += "|SUM";
		}
		**/

		if (merkFlag.match(/AUTO100/)) {
			this.szFlag += "|AUTO100";
		}
		if (merkFlag.match(/AUTOCOMPLETE/)) {
			this.szFlag += "|AUTOCOMPLETE";
		}
		// GR 12.01.2012 aggregation sum bad for menu charts
		var szTemp = this.szAggregation;
		//		this.szAggregation = "mean";

		var nTempClipParts = this.nClipParts;
		this.nClipParts = 10;

		// ----------------------------------------------------------
		var ptNull = this.drawChart(donutGroup, null, nSwatch * 2 / 3);
		// ----------------------------------------------------------

		if (typeof nTempClipParts === 'undefined') {
			delete this.nClipParts;
		} else {
			this.nClipParts = nTempClipParts;
		}

		this.szAggregation = szTemp;

		if (ptNull) {
			this.szFlag = merkFlag;

			var nMargin = map.Scale.normalX(10);
			ptNull.x -= map.Scale.normalX(nSwatch / nNewLine);
			donutGroup.fu.setPosition(nMargin - ptNull.x + (i % nNewLine) * map.Scale.normalX(nSwatch), map.Scale.normalY(nSwatch * 2 / 3) + nMargin + ptNull.y + Math.floor(i / nNewLine) * map.Scale.normalY(nSwatch));

			donutGroup.setAttributeNS(null, "clip-path", "");
			var nSize = Math.max(donutGroup.fu.getBox().width, donutGroup.fu.getBox().height);
			var nScale = 900 / nSize;
			if (nScale < 1) {
				donutGroup.fu.scale(nScale, nScale);
			}

			var szOrigFlagKeep = "";
			if (szOrigFlag.match(/UNDEFINEDISVALUE/)) {
				szOrigFlagKeep += "|UNDEFINEDISVALUE";
			}
			if (szOrigFlag.match(/ZEROISVALUE/)) {
				szOrigFlagKeep += "|ZEROISVALUE";
			}
			if (szOrigFlag.match(/NEGATIVEISVALUE/)) {
				szOrigFlagKeep += "|NEGATIVEISVALUE";
			}
			if (szOrigFlag.match(/NONEGATIVE/)) {
				szOrigFlagKeep += "|NEGATIVEISVALUE";
			}
			if (szOrigFlag.match(/GROUP/)) {
				szOrigFlagKeep += "|GROUP";
			}
			if (szOrigFlag.match(/AGGREGATE/)) {
				szOrigFlagKeep += "|AGGREGATE";
			}
			if (szOrigFlag.match(/COMPATIBLE/)) {
				szOrigFlagKeep += "|COMPATIBLE";
			}
			if (szOrigFlag.match(/FAST/)) {
				szOrigFlagKeep += "|FAST";
			}
			if (szOrigFlag.match(/\bRECT\b/)) {
				szOrigFlagKeep += "|RECT";
			}
			if (szOrigFlag.match(/HEX/)) {
				szOrigFlagKeep += "|HEX";
			}
			if (szOrigFlag.match(/RELOCATE/)) {
				szOrigFlagKeep += "|RELOCATE";
			}
			if (szOrigFlag.match(/CATEGORICAL/)) {
				szOrigFlagKeep += "|CATEGORICAL";
			}
			if (szOrigFlag.match(/SUM/)) {
				szOrigFlagKeep += "|SUM";
			}
			if (szOrigFlag.match(/MEAN/)) {
				szOrigFlagKeep += "|MEAN";
			}
			if (szOrigFlag.match(/DIFFERENCE/)) {
				szOrigFlagKeep += "|DIFFERENCE";
			}
			if (szOrigFlag.match(/RELATIVE/)) {
				szOrigFlagKeep += "|RELATIVE";
			}
			if (szOrigFlag.match(/INVERT/)) {
				szOrigFlagKeep += "|INVERT";
			}
			if (szOrigFlag.match(/INVERTSIZE/)) {
				szOrigFlagKeep += "|INVERTSIZE";
			}
			if (szOrigFlag.match(/CALCMEAN/)) {
				szOrigFlagKeep += "|CALCMEAN";
			}
			if (szOrigFlag.match(/CALC100/)) {
				szOrigFlagKeep += "|CALC100";
			}
			if (szOrigFlag.match(/PRODUCT/)) {
				szOrigFlagKeep += "|PRODUCT";
			}
			if (szOrigFlag.match(/AUTOCOMPLETE/)) {
				szOrigFlagKeep += "|AUTOCOMPLETE";
			}
			if (szOrigFlag.match(/AUTO100/)) {
				szOrigFlagKeep += "|AUTO100";
			}
			if (szOrigFlag.match(/QUANTILE/)) {
				szOrigFlagKeep += "|QUANTILE";
			}
			if (szOrigFlag.match(/DENSITY/)) {
				szOrigFlagKeep += "|DENSITY";
			}
			if (szOrigFlag.match(/DOPACITY/)) {
				szOrigFlagKeep += "|DOPACITY";
			}
			if (szOrigFlag.match(/VALUES/) || merkFlag.match(/VALUES/)) {
				szOrigFlagKeep += "|VALUES";
			}
			if (szOrigFlag.match(/VALUEBACKGROUND/)) {
				szOrigFlagKeep += "|VALUEBACKGROUND";
			}
			// if new chart type has SIZE flag
			// -------------------------------
			if (szTypeList[i].match(/SIZE/)) {
				if (merkFlag.match(/SIZELOG/)) {
					szOrigFlagKeep += "|SIZELOG";
				} else
				if (merkFlag.match(/SIZEP4/)) {
					szOrigFlagKeep += "|SIZEP4";
				} else
				if (merkFlag.match(/SIZEP3/)) {
					szOrigFlagKeep += "|SIZEP3";
				} else
				if (merkFlag.match(/SIZE/)) {
					szOrigFlagKeep += "|SIZE";
				}
			}
			if (merkFlag.match(/SPACED/)) {
				szOrigFlagKeep += "|SPACED";
			}

			aGroup.setAttributeNS(null, "onclick", "map.Themes.changeThemeStyle(evt,'" + this.szId + "','type:" + szTypeList[i] + szOrigFlagKeep + "')");

			this.addChartTypeSign(donutGroup, szTypeList[i]);
		}
	}
	var retA = [];
	for (var a in szTypeList) {
		retA.push(szTypeList[a] + szOrigFlagKeep);
	}
	return retA;
};

/**
 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1.023.234 
 * @param nValue the number to format
 * @param nPrecision the wanted decimal points 
 * @param szFlag "CEIL" or "FLOOR" (round either up or down)
 */
MapTheme.prototype.formatValue = function (nValue, nPrecision, szFlag) {
	if (isNaN(nValue)) {
		return nValue;
	}
	if (this.nMin > 999 && this.nMax < 3000) {
		return __formatValue(nValue, nPrecision, szFlag + "|NOBREAKS");
	}
	return __formatValue(nValue, nPrecision, szFlag);
};

/**
 * remove the theme (from the parents theme list) 
 * @param evt the event
 */
MapTheme.prototype.remove = function (evt) {
	this.parent.removeTheme(evt, this.szId);
};

/**
 * remove the representation of this theme (chart objects, shape colorizing, info display ...) 
 * @param evt the event
 */
MapTheme.prototype.removeElements = function (evt) {
	if (this.widgetNode) {
		widgetList.removeWidget(this.widgetNode);
		this.widgetNode.parentNode.removeChild(this.widgetNode);
		this.widgetNode = null;
	}

	// GR 29.12.2013 remove clip timeout !
	if (this.clipTimeout) {
		clearTimeout(this.clipTimeout);
	}

	// remove old theme colors
	this.unpaintMap();

	// remove WMS images
	this.clearWMS();
	
	// remove FEATURE generated groups in layer pane
	if (this.szFlag.match(/FEATURE/) && this.chartGroup) {
		var labelGroup = SVGDocument.getElementById(this.chartGroup.getAttributeNS(null,"id") + ":label");
		this.chartGroup.parentNode.removeChild(labelGroup);
		this.chartGroup.parentNode.removeChild(this.chartGroup);
	}
	
	if (this.onremove) {
		try {
			eval(this.onremove);
		} catch (e) {}
	}
	// notify HTML user about the new theme
	try {
		HTMLWindow.ixmaps.htmlgui_onRemoveTheme(this.szId);
	} catch (e) {}

};

/**
 * remove the shape colorizing (depreciated; now use method this.unpaintMap() )
 * @param szThemes the colorized themes(layer)
 */
MapTheme.prototype.removeMapThemeStyles = function (szThemes) {
	var szThemesA = szThemes.split('|');
	var childsA = SVGRootElement.getElementsByTagName('path');
	for (var i = 0; i < childsA.length; i++) {
		if (childsA.item(i).nodeType == 1) {
			var szId = childsA.item(i).parentNode.getAttributeNS(null, "id");
			var fMatch = false;
			if (szId && (szId.length !== 0)) {
				var szTest = map.Tiles.getMasterId(szId).split(':')[0];
				for (var j = 0; j < szThemesA.length; j++) {
					if (szTest == szThemesA[j]) {
						fMatch = true;
					}
				}
			}
			if (fMatch) {
				childsA.item(i).parentNode.removeAttributeNS(null, "style");
			}
		}
	}
};

/**
 * hide or fade the info display of this theme
 */
MapTheme.prototype.disable = function () {
	if (this.szFlag.match(/CHART/)) {
		return;
	}
	if (this.widgetNode) {
		var subNodesA = this.widgetNode.getElementsByTagName('g');
		for (var i = 0; i < subNodesA.length; i++) {
			subNodesA.item(i).setAttributeNS(null, "opacity", "0.9");
		}
	}
};

/**
 * show (opacity = 1 && tofront) the info display of this theme
 */
MapTheme.prototype.enable = function () {
	if (this.widgetNode) {
		var subNodesA = this.widgetNode.getElementsByTagName('g');
		for (var i = 0; i < subNodesA.length; i++) {
			subNodesA.item(i).setAttributeNS(null, "opacity", "1.0");
		}
		this.widgetNode.parentNode.appendChild(this.widgetNode);
	}
	map.Themes.setActive(this);
};

/**
 * force the layer(s) referenced within this theme to be visible
 */
MapTheme.prototype.makeVisible = function () {

	for (var i = 0; i < this.szThemesA.length; i++) {
		if (!map.Layer.isLayerOn(this.szThemesA[i]) &&
			!map.Layer.isScaleDependentLayer(this.szThemesA[i])) {
			map.Themes.switchedLayerA[this.szThemesA[i]] = true;
			map.Api.switchMapTheme(this.szThemesA[i], "on");
		}
		// GR 30.10.2015 important!
		map.Tiles.switchScaleDependentTiles();
	}
};

/**
 * check the layer(s) referenced within this theme to continuo to be visible
 */
MapTheme.prototype.checkVisible = function () {
	for (var i = 0; i < this.szThemesA.length; i++) {
		if (!(map.Themes.isThemeLayerUsed(this.szThemesA[i]) && this.isVisible) &&
			map.Themes.switchedLayerA[this.szThemesA[i]]) {
			map.Api.switchMapTheme(this.szThemesA[i], "off");
			map.Themes.switchedLayerA[this.szThemesA[i]] = null;
		}
	}
};

/**
 * resize the chart objects
 * @param nDelta the resizing factor
 */
MapTheme.prototype.resize = function (nDelta) {
	// GR 15.02.2011 see resize all charts
	if (nDelta != 999) {
		this.nScale *= nDelta;
	}
	// line buffer cannot be scaled, so we must redraw them
	if ((this.szFlag.match(/BUFFER/)) && (this.szShapeType.match(/line/))) {
		this.fRedraw = true;
		this.fRedrawInfo = true;
		this.nSkipCount = 1; // QaD see .redraw();
		map.Themes.execute();
	} else {
		map.Layer.changeObjectScaling(null, nDelta, this.chartGroup);
		if (this.szFlag.match(/DECLUTTER/)) {
			this.declutterCharts();
		}
		if ((this.szFlag.match(/BUFFER/))) {
			var nodeStyleA = this.chartGroup.getElementsByTagName('circle');
			for (var n = 0; n < nodeStyleA.length; n++) {
				var szStyle = nodeStyleA.item(n).getAttributeNS(null, "style");
				if (szStyle && szStyle.length) {
					var szNewStylesValue = __scaleStyleString(szStyle, 1 / nDelta);
					nodeStyleA.item(n).setAttributeNS(null, "style", szNewStylesValue);
				}
			}
		}
		this.f = true;

		this.showInfo();
	}
};

/**
 * change the offset of the chart objects
 * @param ptOffset the offset as pont object
 */
MapTheme.prototype.offset = function (ptOffset) {
	var ptOldOffset = this.chartGroup.fu.getPosition();
	this.chartGroup.fu.setPosition(ptOldOffset.x + ptOffset.x, ptOldOffset.y + ptOffset.y);
};

/**
 * change the opacity of the chart objects
 * @param nDelta the opacity factor
 */
MapTheme.prototype.opacity = function (nDelta) {

	this.fillOpacity = (this.fillOpacity ? this.fillOpacity : 1) * nDelta;
	this.fillOpacity = Math.min(1, this.fillOpacity);
	this.fillOpacity = Math.max(0, this.fillOpacity);

	this.nOpacity = (this.nOpacity ? this.nOpacity : 1) * nDelta;
	this.nOpacity = Math.min(1, this.nOpacity);
	this.nOpacity = Math.max(0, this.nOpacity);

	if (this.chartGroup) {
		var chartObjA = this.chartGroup.childNodes;
		for (var i = 0; i < chartObjA.length; i++) {
			map.Layer.changeNodeOpacity(chartObjA.item(i), nDelta);
		}
	} else {
		if (this.szShapeType.match(/line/)) {
			for (var i = 0; i < this.szThemesA.length; i++) {
				map.Layer.changeLayerOpacity(this.szThemesA[i], nDelta);
			}
		} else {
			for (var a in this.itemA) {
				var tilesNodesA = this.getItemNodes(a);
				for (var j = 0; j < tilesNodesA.length; j++) {
					map.Layer.changeNodeOpacity(tilesNodesA[j], nDelta, "fill-opacity");
				}
			}
		}
	}
};

/**
 * change the blur effect on theme charts
 * @param nBlur the blur factor
 */
MapTheme.prototype.blur = function (nBlur) {

	if (this.chartGroup) {
		// GR 04.11.2014 make blur for the objects
		if (this.nBlur) {
			var szBlurFilterId = "blur-3";
			var filterNode = SVGDocument.getElementById(szBlurFilterId);
			if (!filterNode) {
				var filterNode = map.Dom.newNode('filter', this.chartGroup.parentNode);
				filterNode.setAttributeNS(null, "id", szBlurFilterId);
				var filter = map.Dom.newNode('feGaussianBlur', filterNode);
				filter.setAttributeNS(null, "stdDeviation", map.Scale.normalX(nBlur));
			} else {
				filterNode.firstChild.setAttributeNS(null, "stdDeviation", map.Scale.normalX(nBlur));
			}
			this.chartGroup.style.setProperty("filter", "url(#" + szBlurFilterId + ")", "");
		} else {
			this.chartGroup.style.removeProperty("filter");
		}
	} else
	if (this.szThemesA[0]) {

		var layerObj = SVGDocument.getElementById("maplayer");
		if (layerObj) {
			// GR 04.11.2014 make blur for the objects
			if (this.nBlur) {
				szBlurFilterId = "blur-map";
				var filterNode = SVGDocument.getElementById(szBlurFilterId);
				if (!filterNode) {
					var filterNode = map.Dom.newNode('filter', layerObj.parentNode);
					filterNode.setAttributeNS(null, "id", szBlurFilterId);
					filterNode.setAttributeNS(null, "x", 0);
					filterNode.setAttributeNS(null, "y", 0);
					filterNode.setAttributeNS(null, "width", "100%");
					filterNode.setAttributeNS(null, "height", "100%");
					filter = map.Dom.newNode('feGaussianBlur', filterNode);
					filter.setAttributeNS(null, "stdDeviation", map.Scale.normalX(nBlur) / map.Zoom.nZoom);
				} else {
					filterNode.firstChild.setAttributeNS(null, "stdDeviation", map.Scale.normalX(nBlur) / map.Zoom.nZoom);
				}
				layerObj.style.setProperty("filter", "url(#" + szBlurFilterId + ")", "");
			} else {
				layerObj.style.removeProperty("filter");
			}
		}
	}

};

/**
 * toggle (switch on/off) the chart objects of a theme
 */
MapTheme.prototype.toggle = function (flag) {
	_TRACE("----->>>>>> toggle:" + this.szId + " -------->>>>>>");
	if (this.chartGroup) {

		if (flag === true || (typeof (flag) == 'undefined' && (this.chartGroup.style.getPropertyValue("display") == "none"))) {
			this.chartGroup.style.setProperty("display", "inline", "");
			this.chartGroup.display = "inline";
			this.isChecked = true;
		} else {
			this.chartGroup.style.setProperty("display", "none", "");
			this.chartGroup.display = "none";
			this.isChecked = false;
		}
	} else {
		if (this.isChecked) {
			this.unpaintMap();
			this.isChecked = false;
			if (map.Themes.activateNextPaint(this)) {
				this.fToggle = false;
				map.Themes.execute();
				if (this.widgetNode) {
					this.widgetNode.setAttributeNS(null, "opacity", "1.0");
					this.widgetNode.parentNode.appendChild(this.widgetNode);
				}
			}
		} else {
			this.isChecked = true;
			this.fRedraw = true;
			this.fToggle = false;
			map.Themes.execute();
		}
	}
};

/**
 * get Histogram
 * create a theme value distribution
 * @param szId an item it to mark within the histogram (optional)
 * @param targetGroup where to create
 * @param szFlag type of histogram "DISTRIBUTION", "CLASSES"

 */
MapTheme.prototype.getHistogram = function (szId, targetGroup, szFlag) {
	map.Themes.getHistogram(szId, targetGroup, szFlag, this);
};

var __maptheme_chartcolors = [];
/**
 * get color derivates for 3D chart objects
 * if color object exists, return this, else build derivate colors
 * @parameter nColor the main color
 */
function __maptheme_getChartColors(nColor) {
	if (!__maptheme_chartcolors[nColor]) {
		__maptheme_chartcolors[nColor] = new ChartColors(nColor);
	}
	return __maptheme_chartcolors[nColor];
}
/**
 * This is the ChartColors class.  
 * It realizes an object for color derivates to realize 3d chart objects
 * @constructor
 * @parameter nColor the main color
 * @throws 
 * @return A new ChartColors object
 */
function ChartColors(nColor) {
	if (typeof (nColor) != 'string') {
		nColor = "#ffffff";
	}
	this.mainColor = nColor;
	this.lowColor = ColorScheme.getDerivateColor(nColor, 0.7);
	this.highColor = ColorScheme.getDerivateColor(nColor, 1.3);
	this.borderColor = ColorScheme.getBorderColor(nColor);
	this.textColor = ColorScheme.getTextColor(nColor);
}

// utf8 handling
// -----------------

function __mpap_hex2dec(n) {
	return parseInt(n, 16);
}

function __mpap_decode_utf8(s) {
	if ((typeof (s) == "string") && s.match(/&#x/)) {
		var text = "";
		var sA = s.split("&#x");
		text = sA[0];
		for (var i = 1; i < sA.length; i++) {
			text += String.fromCharCode(__mpap_hex2dec(sA[i].substr(0, 2)));
			text += sA[i].substr(3, sA[i].length - 3);
		}
		return text;
	}
	return s;
}
// .............................................................................
// EOF
// .............................................................................

/**********************************************************************
 theme_legend.js

$Comment: provides JavaScript for ixmaps UI theme legends in HTML
$Source : theme_legend.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: theme_legend.js 8 2015-02-10 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: theme_legend.js,v $
**********************************************************************/

window.ixmaps = window.ixmaps || {};
window.ixmaps.legend = window.ixmaps.legend || {};

(function() {

	ixmaps.legend.legendA = [];

	var szControls = "small";
	var szSvgLegendFlag = "nolegend";
	var szHTMLLegendFlag = "1";
	var szLegendId = null;
	var fLegendDialog = false;
	var fOnRemove = false;
	var fButton = false;

	// -------------
	// little helper
	// -------------

	ixmaps.legend.sortList = function(a,b){
		if ( a.count < b.count){
			return 1;
		}
		return -1;
	};

	ixmaps.legend.sortUp = function(a,b){
		if ( a.index < b.index){
			return 1;
		}
		return -1;
	};

	ixmaps.toggleValueDisplay = function(szThemeId){
		var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);
		if ( szThemeStyle && szThemeStyle.match(/VALUES/) ){
			ixmaps.changeThemeStyle(szThemeId,'type:VALUES;','remove');
		}else{
			ixmaps.changeThemeStyle(szThemeId,'type:VALUES;','add');
			ixmaps.changeThemeStyle(szThemeId,'type:NOINLINETEXT;','add');
			ixmaps.changeThemeStyle(szThemeId,'type:VALUEBACKGROUND;','add');
			ixmaps.changeThemeStyle(szThemeId,'valueupper','remove');
		}
	};

	ixmaps.changeThemeDynamic = function(szThemeId,szParameter,szFactor){

		var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);

		if ( szThemeStyle.match(/CHOROPLETH/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'dopacitypow:'+String(1/Number(szFactor)),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'dopacityscale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'opacity:'+String(szFactor),'factor');
					break;
			}
		}else
		if ( szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) || szThemeStyle.match(/AGGREGATE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
			}
		}else{
			switch (szParameter) {
				case "amplify":
					if ( szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/) ){
						ixmaps.changeThemeStyle(szThemeId,'rangescale:'+String(szFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(szThemeId,'normalsizevalue:'+String(1/Number(szFactor)),'factor');
					}
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
			}
		}
	};


	// ------------------------------------------
	// color scheme for legend, explicit version
	// ------------------------------------------

	/**
	 * make a long version color scheme with multiple lines 	
	 * @param {string} szId the theme id 
	 * @param {string} szLegendId a target id (div) [optional] 
	 * @param {string} szMode "compact" to allow compact (one line) legend if possible 
	 */
	ixmaps.legend.makeColorLegendHTML = function(szId,szLegendId,szMode){

		szLegendId = szLegendId || "generic";

		var fLegendCompact = (szMode && szMode == "compact")?true:false;
		var themeObj = ixmaps.getThemeObj(szId);

		// check whether to make compact (one line) legend 
		// -----------------------------------------------
		if ( ((themeObj.partsA.length == 1) || !themeObj.szAlphaField ) && themeObj.szFlag.match(/DOPACITY/) ){
			return ixmaps.legend.makeColorLegendHTMLCompact(szId,szLegendId);
		}
		if ( fLegendCompact && !themeObj.szFlag.match(/EXACT/) && themeObj.partsA.length >= 5 && !( !(themeObj.szFlag.match(/SEQUENCE/) && !themeObj.szFlag.match(/SYMBOL/)) && themeObj.szLabelA && themeObj.szLabelA.length ) ){
			return ixmaps.legend.makeColorLegendHTMLCompact(szId,szLegendId);
		}

		// ok make long (multiple line) version
		// =====================================

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;

		// if color field defined, we collect the colors and make legend label here
		// -----------------------------------------------------------------------
		if ( themeObj.colorFieldA ){
			labelA = [];
			for ( a in themeObj.colorFieldA ){
				labelA.push(a);
			}
			// create list of colors (classes) used 
			themeObj.colorClassUsedA = [];
			for ( i in themeObj.indexA ){
				themeObj.colorClassUsedA[themeObj.itemA[themeObj.indexA[i]].nClass] = true;
			}
		}

		// if no labels or colors are defined, make value range texts as label
		// -----------------------------------------------------------------------
		if ( !labelA ){
			labelA = new Array();
			var len = Math.min(colorA.length,themeObj.partsA.length);
			for ( var i=0; i<len; i++){
				var szPart = parseFloat(themeObj.partsA[i].min).toFixed(2)+"&nbsp;"+" ... "+parseFloat(themeObj.partsA[i].max).toFixed(2)+"&nbsp;"+szUnit;
				labelA.push(szPart);
			}
		}

		// compose the units suffix
		// ---------------------------
		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
		szUnit = szUnit.replace(/ /g,'&nbsp;');

		// how many rows 
		// ---------------------------
		var nRows = Math.min(colorA.length,labelA.length);

		// sort (or don't sort) the legend rows
		// -------------------------------------
		var sortA = [];
		for ( var i=0; i<nRows; i++){
			if(  themeObj.szFlag.match(/SUM/) || 
				(themeObj.szFlag.match(/EXACT/) && !themeObj.szFlag.match(/SIZE/)) ){
				if ( typeof(themeObj.partsA[i].nSum) != "undefined" && !themeObj.szFlag.match(/EXACT/)){
					sortA.push({index:i,color:(themeObj.szFlag.match(/INVERT/)?(nRows-i-1):i),count:(themeObj.partsA[i].nSum)});
				}else{
					sortA.push({index:i,color:(themeObj.szFlag.match(/INVERT/)?(nRows-i-1):i),count:(themeObj.exactSizeA[i]||themeObj.exactCountA[i]||themeObj.nMeanA[i]||((themeObj.szFieldsA.length > 1)?themeObj.nOrigSumA[i]:null))});
				}
			}else{
				sortA.push({index:i,color:(i),count:(themeObj.exactSizeA[i]/themeObj.exactCountA[i])});
			}
		}
		if( themeObj.szFlag.match(/EXACT/) && !themeObj.szFlag.match(/NOSORT/) ){
			sortA.sort(this.sortList);
		}else
		if( themeObj.szFlag.match(/AREA/) && themeObj.szFlag.match(/STACKED/) && !themeObj.szShowParts ){
			sortA.sort(this.sortUp);
		}

		// clip legend rows !!
		nRows = Math.min(500,Math.min(colorA.length,labelA.length));

		// colorscheme
		//
		// start making the HTML
		// -----------------------------
		var szHtml = "";

		// show theme filter, if defined
		if (themeObj.szFilter){
			szHtml += "<p class='legend-filter' style='margin-top:0em;color:#fff;background:#ddd'><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'>";
			szHtml += "</span><span class='legend-filter-text'>"+themeObj.szFilter+"</span>";
			szHtml += "<a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"filter\",\"remove\");' title=\"remove\" >";
			szHtml += "<span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
		}

		// color legend = table
		szHtml += "<table id='legend-classes"+szLegendId+"' style='border-spacing:2px;' >";

		var fColorScheme = false; 
		var fCountBars = false;
		var nMaxCount = 0;

		for ( var i=0; i<nRows; i++){
			if ( colorA[0] !=  colorA[i] ){
				fColorScheme = true; 
			}
			if ( sortA[i].count ){
				nMaxCount = Math.max(nMaxCount,sortA[i].count);
				fCountBars = true;
			}
		}
		if ( fColorScheme &&
			( ( themeObj.partsA.length > 2)		||
				themeObj.szLabelA				||
				themeObj.szFlag.match(/EXACT/)	||
				themeObj.szRangesA ) ){

			// get exact count from themeObj
			var count = "";
			for ( var i=0; i<nRows; i++){

				if ( themeObj.colorFieldA ){
					if ( !themeObj.colorClassUsedA[sortA[i].index] ){
						continue;
					}
				}else
				if ( !themeObj.partsA[sortA[i].index].nSum ){
					continue;
				}

				if ( (fCountBars || themeObj.szFlag.match(/FILTER/) )&& !sortA[i].count ){
					continue;
				}

				var fSelected = false;
				if ( ((typeof(themeObj.markedClass)   != "undefined") && (themeObj.markedClass == sortA[i].index)) ||
					 ((typeof(themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[sortA[i].index]))	) {
					fSelected = true;
				}else
				if ( themeObj.szShowParts ){
					for ( p in themeObj.szShowPartsA ){
						if ( themeObj.szShowPartsA[p] == i ){
							fSelected = true;
						}
					}
				}

				count = ixmaps.__formatValue(sortA[i].count,2,"BLANK"); //sortA[i].count?""+sortA[i].count+"":"";

				if ( fSelected ){
					szHtml += "<tr valign='center' class='theme-legend-item-selected'>";
				}else{
					szHtml += "<tr valign='center' class='theme-legend-item' >";
				}

				szHtml += "<td><a class='legend-color-button' href='#' title='click to see'><span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+"'>";

				if ( fCountBars ){
					var nMaxBar = 60;
					var nBar = Math.ceil(Math.pow(sortA[i].count,1)*(nMaxBar/Math.pow(nMaxCount,1)));
					szHtml += "<span style='display:inline-block;width:"+nBar+"px;'>&nbsp;</span>";
				}else{
					if ( themeObj.szFlag.match(/DOPACITY/) ){
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
						szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+";opacity:0.75;'>"; 
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
						szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+";opacity:0.5;'>"; 
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					}else{
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					}
				}

				var szLabel = labelA[sortA[i].index];
				var szCount = sortA[i].count?("<td class='theme-legend-count' >"+count+" "+szUnit.replace(/ /g,'&nbsp;')+"</td>"):"";

				szHtml += "</span></td><td class='theme-legend' ><a class='theme-button' href='#' title='click to see'><span title='"+szLabel+"'><span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+sortA[i].index+");event.stopPropagation();return false;' >"+szLabel+"</span></span></a></td>"+szCount+"</tr>";
			}
		}else{
			if ( ((themeObj.nMinValue||themeObj.nMin) != 1) || ((themeObj.nMaxValue||themeObj.nMax) != 1) ){
				szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\""+szId+"\","+0+")'  style='background:"+colorA[0]+";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:5px'>"+ ixmaps.__formatValue((themeObj.nMinValue||themeObj.nMin),2,"BLANK")+" "+szUnit+"</span></td><td> &nbsp;...</td><td><span style='padding-left:5px'>"+ ixmaps.__formatValue((themeObj.nMaxValue||themeObj.nMax),2,"BLANK")+" "+szUnit+"</span></td></tr>";
			}else{
				szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\""+szId+"\","+0+")'  style='background:"+colorA[0]+";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:5px'>"+ (themeObj.szLabelA || themeObj.szFields) +"</td></tr>";
			}
		}

		szHtml += "</table>";

		return szHtml;
	};

	// --------------------------------
	// color scheme compact (one line) 
	// --------------------------------

	/**
	 * make a short version color scheme with only one line	
	 * @param {string} szId the theme id 
	 * @param {string} szLegendId a target id (div) [optional] 
	 * @param {string} szMode "compact" to allow compact (one line) legend if possible 
	 */
	ixmaps.legend.makeColorLegendHTMLCompact = function(szId,szLegendId){

		szLegendId = szLegendId || "generic";

		var themeObj = ixmaps.getThemeObj(szId);

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;
		var nColors = colorA.length;

		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
		szUnit = szUnit.replace(/ /g,'&nbsp;');

		var nLegendWidth = (ixmaps.legend.maxwidth*0.95)||300;
		var szHtml = "";

		// show theme filter, if defined
		if (themeObj.szFilter){
			szHtml += "<p class='legend-filter' style='margin-top:0em;color:#fff;background:#ddd'><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'>";
			szHtml += "</span><span class='legend-filter-text'>"+themeObj.szFilter+"</span>";
			szHtml += "<a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"filter\",\"remove\");' title=\"remove\" >";
			szHtml += "<span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
		}

		// 1 color and DOPACITY, make 7 step opacity growth
		// -------------------------------------------------

		if ( (themeObj.partsA.length == 1) && themeObj.szFlag.match(/DOPACITY/) ){

			nColors = 7;
			
			szHtml += "<table id='legend-classes"+szLegendId+"' >";

			szHtml += "<tr valign='top' >";
			for ( var i=0; i<nColors; i++){
				var szMinMax = "";
				if ( themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max ){
					var szUnit = themeObj.szUnit || "";
					szUnit = szUnit.replace(/ /g,'&nbsp;');
					szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0)+szUnit+" ... "+parseFloat(themeObj.partsA[ix].max).toFixed(0)+szUnit;
				}

				var nCount = nLegendWidth/nColors;
				var nGap = nCount/10;

				szHtml += "<td><div style='width:"+(nCount-nGap)+"px;margin-right:"+nGap+"px;overflow:hidden;'>";
				szHtml += "<a class='legend-color-button' href='#' title='"+szMinMax+" click to see'>";
				szHtml += "<span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+ix+");event.stopPropagation();return false;' style='background:"+colorA[0]+";opacity:"+(1/(nColors-i))+"'>";

				if ( ((typeof(themeObj.markedClass)   != "undefined") && (themeObj.markedClass == ix)) ||
					 ((typeof(themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))	) {
					szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
				}
				szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				szHtml += "</div></td></a>";
			}
			szHtml += "</tr>";

		}else

		// 2 color and DOPACITY, make 8 step opacity down and up
		// -------------------------------------------------

		if ( ((themeObj.partsA.length == 2) && !themeObj.szAlphaField ) && themeObj.szFlag.match(/DOPACITY/) ){

			nColors = 8;
			nOpacityA = [1,0.7,0.3,0.1,0.1,0.3,0.7,1];
			
			szHtml += "<table id='legend-classes"+szLegendId+"' >";

			szHtml += "<tr valign='top' >";
			for ( var i=0; i<nColors; i++){
				var szMinMax = "";
				if ( themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max ){
					var szUnit = themeObj.szUnit || "";
					szUnit = szUnit.replace(/ /g,'&nbsp;');
					szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0)+szUnit+" ... "+parseFloat(themeObj.partsA[ix].max).toFixed(0)+szUnit;
				}

				var nCount = nLegendWidth/nColors;
				var nGap = nCount/10;

				szHtml += "<td><div style='width:"+(nCount-nGap)+"px;margin-right:"+nGap+"px;overflow:hidden;'>";
				szHtml += "<a class='legend-color-button' href='#' title='"+szMinMax+" click to see'>";
				szHtml += "<span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+ix+");event.stopPropagation();return false;' style='background:"+colorA[Math.floor(i/4)]+";opacity:"+nOpacityA[i]+"'>";

				if ( ((typeof(themeObj.markedClass)   != "undefined") && (themeObj.markedClass == ix)) ||
					 ((typeof(themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))	) {
					szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
				}
				szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				szHtml += "</div></td></a>";
			}
			szHtml += "</tr>";

		}else{

			// 'normal' color scheme, a line of colors
			// -------------------------------------------------

			szHtml += "<table id='legend-classes"+szLegendId+"' >";

			var nRows = themeObj.szFlag.match(/DOPACITY/)?3:1;

			for ( var row=0; row<nRows; row++){
				szHtml += "<tr valign='top' >";
				for ( var i=0; i<nColors; i++){
					var szMinMax = "";
					var ix = i;
					if ( themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max ){
						var szUnit = themeObj.szUnit || "";
						szUnit = szUnit.replace(/ /g,'&nbsp;');
						szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0)+szUnit+" ... "+parseFloat(themeObj.partsA[ix].max).toFixed(0)+szUnit;
					}

					var nCount = nLegendWidth/nColors;
					var nGap = nCount/10;

					szHtml += "<td><div style='width:"+(nCount-nGap)+"px;margin-right:"+nGap+"px;overflow:hidden;'>";
					szHtml += "<a class='legend-color-button' href='#' title='"+szMinMax+" click to see'>";
					szHtml += "<span onclick='javascript:ixmaps.markThemeClass(\""+szId+"\","+ix+");event.stopPropagation();return false;' style='background:"+colorA[ix]+";opacity:"+(1/(row+1))+"'>";

					if ( ((typeof(themeObj.markedClass)   != "undefined") && (themeObj.markedClass == ix)) ||
						 ((typeof(themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))	) {
						szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
					}
					szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

					szHtml += "</div></td></a>";
				}
				if ( themeObj.szFlag.match(/DOPACITY/) && themeObj.nMaxAlpha ){
					if ( row == 0 ){
						szHtml += "<td><span style='padding-left:0.5em'>"+ixmaps.__bestFormatValue(themeObj.nMaxAlpha)+"</span></td>";
					}else
					if ( row == 1 ){
						szHtml += "<td><span style='padding-left:0.5em'>&#8595; "+(themeObj.szAlphaValueUnits||(themeObj.szFlag.match(/DENSITY/)?"density":""))+"</span></td>";
					}else{
						szHtml += "<td><span style='padding-left:0.5em'>"+ixmaps.__bestFormatValue(themeObj.nMinAlpha)+"</span></td>";
					}
				}
				szHtml += "</tr>";
			}
		}

		// first/last value text below the one line color scheme
		// -------------------------------------------
		// if szUnits == . don't insert leading blank
		var szUnits = ((themeObj.szUnits.substr(0,1) == '.')?"":" ") + themeObj.szUnits;
		var span = Math.floor(nColors*0.5);

		szHtml += "<tr class='legend-range-text' >";
		szHtml += "<td colspan='"+(span)+"' >"+ixmaps.__formatValue(themeObj.nMin,2,"BLANK")+szUnits+"</td>";
		szHtml += "<td colspan='"+(nColors - span)+"' align='right'>"+ixmaps.__formatValue(themeObj.nMax,2,"BLANK")+szUnits+"</td>";
		szHtml += "</tr>";

		szHtml += "</table>";

		return szHtml;
	};

	// --------------------------------
	//
	// make the complete legend
	//
	// --------------------------------

	/**
	 * make all the legend with title, snippet, color scheme and footer	
	 * @param {string} szLegendId a target id (div) [optional] 
	 */
	ixmaps.legend.makeLegendHTML = function(szLegendId){

		var fColors = true;
		var fFilter = false;
		var fLimits = false;

		var szId = this.legendA[szLegendId].szId;
		
		if ( ixmaps.legend.legendA[szLegendId] ){
			ixmaps.themeObj = ixmaps.legend.legendA[szLegendId].themeObj;
		}else{
			return;
		}

		var colorA  = ixmaps.themeObj.colorScheme;
		var labelA  = ixmaps.themeObj.szLabelA;
		if ( !labelA ){
			labelA = new Array();
			var szUnit = ixmaps.themeObj.szUnit || "";
			szUnit = szUnit.replace(/ /g,'&nbsp;');
			var len = Math.min(colorA.length,ixmaps.themeObj.partsA.length);
			for ( var i=0; i<len; i++){
				var szPart = parseFloat(ixmaps.themeObj.partsA[i].min).toFixed(2)+szUnit+" ... "+parseFloat(ixmaps.themeObj.partsA[i].max).toFixed(2)+szUnit;
				labelA.push(szPart);
			}
		}

		szHtml = "";

		var nLegendHeight = Math.max(100,$(window).innerHeight()/3); 

		// legend container
		szHtml += "<div  id='legend-container"+szLegendId+"' >";

		// theme snippet
		if (ixmaps.themeObj.szSnippet){
			szHtml += "<p class='legend-description' style='margin-top:0em;'>"+ixmaps.themeObj.szSnippet+"</p>";
		}

		// scroll wrap
		szHtml += "<div id='legend-scroll"+szLegendId+"' style='margin-top:0.2em;max-height:"+nLegendHeight+"px;overflow:auto' onclick='javascript:_toggle_tools(\""+szLegendId+"\")'>";

		// legend colorscheme
		if ( fColors ){
			szHtml += ixmaps.legend.makeColorLegendHTML(szId,szLegendId);
		}

		szHtml += "</div>";

		if ( fButton ){
			szHtml += 	"	<div style='position:absolute;bottom:0.5em;right:0.3em;'><a style='color:#eee;font-size:1em;' onclick='javascript:_toggle_tools(\""+szLegendId+"\")'><span class='icon icon-contract2'></span></a></div>";
		}else{
			szHtml += 	"	<div style='position:absolute;bottom:0.3em;right:0.3em;'><a style='color:#eee;font-size:1.3em;' onclick='javascript:_toggle_tools(\""+szLegendId+"\")'><span class='icon icon-settings legend-button-settings'></span></a></div>";
		}

		// footer
		szHtml += "<div id='legend-footer"+szLegendId+"' style='margin-top:0.5m'>";

		if (ixmaps.themeObj.szDescription){
			szHtml += "<p class='legend-description' >"+ixmaps.themeObj.szDescription+"</p>";
		}else{
			if ( ixmaps.themeObj.szFlag.match(/DOPACITY/) ){
				if ( ixmaps.themeObj.szAlphaField100 == "$density$" ){
					szHtml += "<span style='font-size:0.6em'>(dynamic opacity from density)</span>";
				}else{
					szHtml += "<span style='font-size:0.6em'>(dynamic opacity from value)</span>";
				}
			}else{
				szHtml += "";
				}
		}
		if( fFilter ){
			var szFilter = "";
			szHtml += "<div style='margin-top:0.5em;'>";
			szHtml += "filter: <form "
					  +"style=\"display:inline-block;left:0px;height:26px;margin-right:10px;\" "
					  +"name=\"FilterForm\">" 
							+"<input class=\"form-control\" id=\"query\" type=\"text\" size=\"9\" "
								+"value=\""+ szFilter +"\" "
								+"style=\"width:150px;height:22px;position:relative;top:0px;\" title=\"query map items\" " 
								+"onkeyup=\"javascript:var value = $(this).val();ixmaps.filterThemeItems('"+szId+"',value);\">"
							+"</input>"
					  +"</form>"
					  +"<span><a href=\"javascript:ixmaps.selectFilterItems('"+szId+"');\" >sum"
					  +"</a></span>";
				szHtml += "</div>";
		}
		if ( ixmaps.themeObj.szFlag.match(/SUBTHEME/) ){
			szHtml += "<h3><a href='javascript:ixmaps.unmarkThemeClass(\""+szId+"\")' class='theme-button'><span class='icon icon-undo2 theme-button' ></span></a></h3>";
		}else
		if ( fButton ){
			var id = szId.replace(/\./g,'');

			szHtml += 		"<div style='margin-top:0.2em;margin-bottom:1;' >";
			szHtml += 		"<span id='legend-buttons"+szLegendId+"'>";
				
			szHtml += 		"<a id='highbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"0.66\");' title='smooth chart' >";
			szHtml += 			"<span class='icon icon-arrow-down theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='lowbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1.5\");' title='amplify chart'>";
			szHtml += 			"<span class='icon icon-arrow-up theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='minusbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"0.66\");' title='smaller charts'>";
			szHtml += 			"<span class='icon icon-minus theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='plusbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1.5\");' title='bigger charts'>";
			szHtml += 			"<span class='icon icon-plus theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='valuebutton"+id+"' class='theme-button' href='javascript:ixmaps.toggleValueDisplay(\""+szId+"\");' title='add/remove textual values'>";
			szHtml += 			"<span class='icon icon-spell-check theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='opminusbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"0.66\");' title='more transparency'>";
			szHtml += 			"<span class='icon icon-checkbox-unchecked theme-button' style='padding:0.5em;'></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='opplusbutton"+id+"' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"1.5\");' title='less transparency'>";
			szHtml += 			"<span class='icon icon-checkbox-partial theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='deletebutton"+id+"' class='theme-button'  href='javascript:ixmaps.makeChartMenueHTML(\""+szId+"\");' title='chart menu'>";
			szHtml += 			"<span class='icon icon-pie theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";

			szHtml += 		"<a id='deletebutton"+id+"' class='theme-button'  href='javascript:ixmaps.removeTheme(\""+szId+"\");' title='remove theme'>";
			szHtml += 			"<span class='icon icon-remove theme-button' ></span>";
			szHtml += 			"</a>&nbsp;";


			szHtml += 		"</ span>";
			szHtml += 		"</ div>";

			if( fLimits ){	
				szHtml += 	"	<div style=\"margin-top:0.5em;margin-bottom:0.5em;\">";
				szHtml += 	"		limitare elementi dei grafici:";
				szHtml += 	"		<a href=\"javascript:$('#info-limitare').toggle();\">";
				szHtml += 	"		<span class=\"icon icon-info tip\" data-tip=\"più/<br>meno\" style=\"font-size:14px;color:#aaaaaa;margin-left:0.2em;\"></span></a>";
				szHtml += 	"		<br>";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:1\");' title=\"massimo 1 parte\" >1</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:2\");' title=\"massimo 2 parti\" >2</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:3\");' title=\"massimo 3 parti\" >3</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:4\");' title=\"massimo 4 parti\" >4</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:5\");' title=\"massimo 5 parti\" >5</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"clipparts:0\");' title=\"tutti parti\" >tutti</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"type:FADEIN\",\"toggle\");' title=\"trasparenza dinamica\" >dinamico</a> |";
				szHtml += 	"		<a href='javascript:ixmaps.changeThemeStyle(null,\"type:NONEGATIVE\",\"toggle\");' title=\"no valori negativi\" >solo valori positivi</a>";
				szHtml += 	"	</div>";
			}

			if(0){	
				szHtml += 	"	<div id=\"info-limitare\" style=\"display:none\">";
				szHtml += 	"	<p>	<b>Limita</b> il numero di <b>elementi realizzati</b> per grafici con <b>più parti</b>,"; 
				szHtml += 	"		come per esempio per colonnine con i risultati di più partiti.<br>";
				szHtml += 	"		La differenza tra selezionare solo 3 partiti e questo metodo è la seguente:";
				szHtml += 	"		siccome la sequenza dei partiti è decrescente, limitando su 3 parti ottengo una grafica che mostra per ogni comune i 3 partiti più votati.";
				szHtml += 	"		<br><a href=\"javascript:$('#info-limitare').toggle();\">";
				szHtml += 	"		[chiudi]</a><p>";
				szHtml += 	"	</div>";
			}
		}

		szHtml += "</div>";
		// end of legend-footer	
		szHtml += "</div>";

		// end of legend-container	
		szHtml += "</div>";

		szHtml += "<div id='legend-extension"+szLegendId+"' style='overflow:hidden'>"
		// ------------------------------------
		szHtml += "<div>"
		szHtml += "<p class='legend-description' >";
		szHtml += "min: " + ixmaps.__formatValue((ixmaps.themeObj.nMin),2,"BLANK") + "<br>";
		szHtml += "max: " + ixmaps.__formatValue((ixmaps.themeObj.nMax),2,"BLANK");
		szHtml += "</p>";
		szHtml += "</div>"
		
		if ( ixmaps.themeObj.szFieldsA.length == 1 && !ixmaps.themeObj.szFlag.match(/EXACT/) ){
			szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em;overflow:hidden;'>Histogram:</div>";
			szHtml += "<div id='histogram1Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_1"+szLegendId+"'></g></svg></div></div>";
			szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em'>Distribuzione:</div>";
			szHtml += "<div id='histogram2Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_2"+szLegendId+"' style='fill-opacity:0.7;stroke-opacity:0.8;'></g></svg></div></div>";
		}else{
			// x,y width,height parameter by testing
			szHtml += "<div id='overviewChartDiv' style='width:440px;height:300px;overflow:auto'>";
			szHtml += "<div>";
			szHtml += "<svg width='400' height='300' viewBox='0 0 7200 6000'>";
			szHtml +=   "<g id='overview_chart'><rect x='0' y='0' width='10' height='3000' style='fill:none' />"
			szHtml +=   "<g id='overview_target_1"+szLegendId+"'>";
			szHtml += "</g></g></svg>";
			szHtml += "</div></div>";
			szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em;overflow:hidden;'>sum/average chart:</div>";
		}

		// end of legend-extension  -----------
		szHtml += "</div>";
		ixmaps.legend.legendA[szLegendId].html = szHtml;

		return szHtml;
	}

	// --------------------------------
	//
	// various helper
	//
	// --------------------------------

	/**
	 * refresh the legend 	
	 * @param {string} szId the theme id  
	 * @param {string} szLegendId a target id (div) [optional] 
	 */
	ixmaps.legend.refreshColorLegendHTML = function(szId,szLegendId){
		$("#legend-scroll"+szLegendId).html(ixmaps.legend.makeColorLegendHTML(szId,szLegendId));

		ixmaps.themeObj = ixmaps.legend.legendA[szLegendId].themeObj; 
		// insert SVG
		if ( ixmaps.themeObj.szFieldsA.length == 1 && !ixmaps.themeObj.szFlag.match(/EXACT/) ){
			$("#histogram_target_1"+szLegendId).empty();
			$("#histogram_target_2"+szLegendId).empty();
			ixmaps.themeObj.getHistogram(null,$("#histogram_target_1"+szLegendId)[0],"");
			setTimeout('ixmaps.themeObj.getHistogram(null,$("#histogram_target_2'+szLegendId+'")[0],"DISTRIBUTION")',200);
		}else{
			ixmaps.themeObj.getOverviewChart($("#overview_target_1"+szLegendId)[0],null);
		}

	};
	
	/**
	 * show the legend in a dialog frame	
	 * @param {string} szLegendId a target id (div) [optional] 
	 */
	ixmaps.legend.show = function(szLegendId){
		__showLegendDialog(szLegendId);
	};		

	/**
	 * switch on/off the theme manipulation buttons
	 */
	_toggle_tools = function(szId){
		fButton = !fButton;
		ixmaps.legend.makeLegendHTML(szId)
		$("#legend"+szId).dialog("close");
		__switchLegendMode();
	};

	// ---------------------------------------------------
	// Dialog H E L P E R 
	// ---------------------------------------------------

	/**
	 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1 023 234 
	 * @param nValue the number to format
	 */
	ixmaps.__bestFormatValue = function(nValue){
		if ( nValue >= 10 )	{
			return ixmaps.__formatValue(nValue,0,"BLANK");
		}else
		if ( nValue >= 1 )	{
			return ixmaps.__formatValue(nValue,1,"BLANK");
		}else{
			return ixmaps.__formatValue(nValue,2,"BLANK");
		}
	};

	// ---------------------------------------------------
	// format number display 
	// ---------------------------------------------------

	/**
	 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1 023 234 
	 * @param nValue the number to format
	 * @param nPrecision the wanted decimal points 
	 * @param szFlag "CEIL" or "FLOOR" (round either up or down)
	 */
	ixmaps.__formatValue = function(nValue,nPrecision,szFlag){

		nValue = Number(nValue);

		if ( !isFinite(nValue) || !isFinite(nPrecision) ){
			return String(nValue);
		}
		if ( nValue == 0 ){
			return String(nValue);
		}

		if ( !nPrecision ){
			nPrecision = 0;
		}
		nPrecision = Math.max(0,nPrecision);

		// GR 02.12.2011 make that low values do not collapse to 0
		if ( (nValue > 0.0000001) && (nPrecision > 0) ){
			while ( nValue.toFixed(nPrecision-1) == 0 ){
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
				while ( szDecimals.length < nPrecision ){
					szDecimals += '0';
				} 
			}
			else {
				szDecimals = "";
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
							szBreak   = "&nbsp;";
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

	// must clear some chars to get it through the .dialog precedures 
	var __getLegendId = function(szId){
		return szId.replace(".","_");
	};

	// ---------------------------------------------------
	// global legend functions   
	// ---------------------------------------------------

	// redraw or hide legend  
	__switchLegendMode = function(){
		ixmaps.fLegendVisible = true;
		__showLegendDialog();		
	};


	// ---------------------------------------------------
	// on draw, remove theme   
	// ---------------------------------------------------

	ixmaps.htmlgui_onInitThemes = function(){

		for ( i in ixmaps.legend.legendA ){
			ixmaps.htmlgui_onRemoveTheme(ixmaps.legend.legendA[i].szId);
		}
		ixmaps.legend.legendA = [];

		// bubble up event
		return ixmaps.parentApi.htmlgui_onInitThemes();
	};


	ixmaps.setTitle = function(szTitle) { 
		if ( szTitle && szTitle.length ){
			$("#title").html(szTitle).show();
		}else{
			$("#title").html("").hide();
		}

	};


	/**
	 * intercept map resizing 
	 * @param void
	 */
	ixmaps.htmlgui_onWindowResize = function(){

		__positionLegendDialog();		

		// bubble up event
		return ixmaps.parentApi.htmlgui_onMapResize();
	};


/**
 * end of namespace
 */

})();

// -----------------------------
// EOF
// -----------------------------


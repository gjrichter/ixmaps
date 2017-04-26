/**********************************************************************
 legend.js

$Comment: provides JavaScript for ixmaps UI theme legends in HTML
$Source : legend.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: legend.js 8 2015-02-10 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: legend.js,v $
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
	var fLegendCompact = true;
	var fButton = true;

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
			ixmaps.changeThemeStyle(szThemeId,'valueupper','remove');
		}
	};

	ixmaps.changeThemeDynamic = function(szThemeId,szParameter,szFactor){

		var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);

		if ( szThemeStyle.match(/CHOROPLETHE/) ){
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
		if ( szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(szFactor),'factor');
					break;
				case "opacity":
					if ( szThemeStyle.match(/DOPACITY/) ){
						ixmaps.changeThemeStyle(szThemeId,'dopacityscale:'+String(szFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					}
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
					if ( szThemeStyle.match(/DOPACITY/) ){
						ixmaps.changeThemeStyle(szThemeId,'dopacityscale:'+String(szFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					}
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
			}
		}
	};


	ixmaps.showClass = [];
	ixmaps.switchThemeClass = function(szThemeId,nClass){

		ixmaps.markThemeClass(szThemeId,nClass);
		return;

		if ( ixmaps.showClass[nClass] ){
			ixmaps.showClass[nClass] = false;
		}else{
			ixmaps.changeThemeStyle(szThemeId,"showparts:"+String(nClass),"set");
			ixmaps.showClass[nClass] = true;
		}
		szShow = "";
		for (i in ixmaps.showClass ){
			if( ixmaps.showClass[i] ){
				szShow += (szShow.length?',':'')+String(i);
			}
		}
		ixmaps.changeThemeStyle(szThemeId,"showparts:"+szShow,szShow.length?"set":"remove");
	};

	// ---------------------------------------------------
	// format number display 
	// ---------------------------------------------------

	/**
	 * convert a number into a formatted string; if the number > 1000 it will be formatted like 1.023.234 
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


	// ============================================
	// create legend elements
	// ============================================

	// ------------------
	// color scheme table 
	// ------------------

	ixmaps.legend.makeColorLegendHTML = function(szId,szLegendId,szMode){

		fLegendCompact = (szMode && szMode == "compact")?true:false;

		szLegendId = szLegendId || "generic";

		var themeObj = ixmaps.getThemeObj(szId);

		if ( (themeObj.partsA.length == 1) && themeObj.szFlag.match(/DOPACITY/) ){
			return ixmaps.legend.makeColorLegendHTMLCompact(szId,szLegendId);
		}

		if ( fLegendCompact && !themeObj.szFlag.match(/EXACT/) && themeObj.partsA.length >= 5 && !( !(themeObj.szFlag.match(/SEQUENCE/) && !themeObj.szFlag.match(/SYMBOL/)) && themeObj.szLabelA && themeObj.szLabelA.length ) ){
			return ixmaps.legend.makeColorLegendHTMLCompact(szId,szLegendId);
		}

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;

		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
		szUnit = szUnit.replace(/ /g,'&nbsp;');

		if ( !labelA ){
			labelA = new Array();
			var len = Math.min(colorA.length,themeObj.partsA.length);
			for ( var i=0; i<len; i++){
				var szPart = " ... "+parseFloat(themeObj.partsA[i].max).toFixed(2)+"&nbsp;"+szUnit;
				labelA.push(szPart);
			}
		}

		var szHtml = "";

		// theme filter
		if (themeObj.szFilter){
			szHtml += "<p class='legend-filter-text'>&nbsp;"+themeObj.szFilter+"</p>";
		}

		// color legend = table
		szHtml += "<table id='legend-classes"+szLegendId+"' class='legend-color-scheme'>";

		var max = Math.min(colorA.length,labelA.length);

		// get exact count from themeObj
		var count = "";

		sortA = [];
		for ( var i=0; i<max; i++){
			if(  themeObj.szFlag.match(/SUM/) || 
				(themeObj.szFlag.match(/EXACT/) && !themeObj.szFlag.match(/SIZE/)) ){
				if ( typeof(themeObj.partsA[i].nSum) != "undefined" ){
					sortA.push({index:i,color:(themeObj.szFlag.match(/INVERT/)?(max-i-1):i),count:(themeObj.partsA[i].nSum)});
				}else{
					sortA.push({index:i,color:(themeObj.szFlag.match(/INVERT/)?(max-i-1):i),count:(themeObj.exactSizeA[i]||themeObj.exactCountA[i]||themeObj.nMeanA[i]||((themeObj.szFieldsA.length > 1)?themeObj.nOrigSumA[i]:null))});
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

		max = Math.min(500,Math.min(colorA.length,labelA.length));

		// colorscheme
		//
		var fColorScheme = false; 
		var fCountBars = false;
		var nMaxCount = 0;

		for ( var i=0; i<max; i++){
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
				(themeObj.szRangesA && themeObj.szRangesA.length) ) ){

			// get exact count from themeObj
			var count = "";
			for ( var i=0; i<max; i++){

				if ( (fCountBars || themeObj.szFlag.match(/FILTER/) )&& !sortA[i].count ){
					continue;
				}

				var fSelected = false;
				if ( (typeof(themeObj.markedClass) != "undefined") && (themeObj.markedClass == sortA[i].index) ){
					fSelected = true;
				}else
				if ( themeObj.szShowParts ){
					for ( p in themeObj.szShowPartsA ){
						if ( themeObj.szShowPartsA[p] == sortA[i].index ){
							fSelected = true;
						}
					}
					if ( !fSelected ){
						continue; 
					}
					fSelected = false;
				}

				count = ixmaps.__formatValue(sortA[i].count,2,"BLANK"); //sortA[i].count?""+sortA[i].count+"":"";
				if ( fSelected ){
					szHtml += "<tr valign='center' class='theme-legend-item-selected'>";
				}else{
					szHtml += "<tr valign='center' class='theme-legend-item'>";
				}

				szHtml += "<td><a class='legend-color-button' href='#' title='click to see'><span onclick='javascript:ixmaps.switchThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+"'>";

				if ( fCountBars ){
					//for ( var w=0; w<Math.ceil(Math.pow(sortA[i].count,0.5)/10); w++ ){
					for ( var w=0; w<Math.ceil(Math.pow(sortA[i].count,0.5)*(20/Math.pow(nMaxCount,0.5))); w++ ){
						szHtml += "&nbsp;";
					}
				}else{
					if ( themeObj.szFlag.match(/DOPACITY/) ){
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
						szHtml += "</span><span onclick='javascript:ixmaps.switchThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+";opacity:0.75;'>"; 
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
						szHtml += "</span><span onclick='javascript:ixmaps.switchThemeClass(\""+szId+"\","+sortA[i].color+");event.stopPropagation();return false;' style='background:"+colorA[sortA[i].color]+";opacity:0.5;'>"; 
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					}else{
						szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
					}

				}

				var szLabel = labelA[sortA[i].index];
				var szCount = sortA[i].count?("<td class='theme-legend-count' style='text-align:right;padding-left:1em;'>"+count+" "+szUnit.replace(/ /g,'&nbsp;')+"</td>"):"";

				szHtml += "</span></td><td class='theme-legend' style='max-width:"+(szCount.length?"200px":"300px")+"'><a class='theme-button' href='#' title='click to see'><span title='"+szLabel+"' style='color:#888888'><span onclick='javascript:ixmaps.switchThemeClass(\""+szId+"\","+sortA[i].index+");event.stopPropagation();return false;' >"+szLabel+"</span></span></a></td>"+szCount+"</tr>";
			}

		}else if (0){
			szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\""+szId+"\","+0+")'  style='background:"+colorA[0]+";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:5px'>"+labelA[0]+"</span></td><td> &nbsp;&nbsp;|</td><td><span style='padding-left:5px'>"+labelA[labelA.length-1]+"</span></td></tr>";
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

	ixmaps.legend.makeColorLegendHTMLCompact = function(szId,szLegendId){

		szLegendId = szLegendId || "generic";

		var themeObj = ixmaps.getThemeObj(szId);

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;
		var nColors = colorA.length;

		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
		szUnit = szUnit.replace(/ /g,'&nbsp;');

		var szHtml = "";

		// theme filter
		if (themeObj.szFilter){
			szHtml += "<p class='legend-filter-text' >Filter: "+themeObj.szFilter+"</p>";
		}

		if ( (themeObj.partsA.length == 1) && themeObj.szFlag.match(/DOPACITY/) ){

			// 1 color and DOPACITY, make 7 step opacity growth
			nColors = 7;

			szHtml += "<table id='legend-classes"+szLegendId+"' >";

			szHtml += "<tr valign='top' >";
			for ( var i=0; i<nColors; i++){

				var nCount = Math.min(100/nColors,8);
				var nGap = nCount/10;

				szHtml += "<td><div style='margin-right:"+nGap+"px;overflow:hidden;'>";
				szHtml += "<span style='background:"+colorA[0]+";opacity:"+(1/(nColors-i))+"'>";

				for ( ii=0; ii<nCount; ii++){
					szHtml += "&nbsp;";
				}

				szHtml += "</span></div></td>";
			}
			szHtml += "</tr>";

		}else{

			// color legend 
			szHtml += "<table id='legend-classes"+szLegendId+"' cellspacing='0' cellpadding='0' >";

			var nRows = themeObj.szFlag.match(/DOPACITY/)?3:1;
			for ( var row=0; row<nRows; row++){
				szHtml += "<tr valign='top' >";
				for ( var i=0; i<nColors; i++){
					var szMinMax = "";
					var ix = themeObj.szFlag.match(/XXX/)?(nColors-i-1):i;
					if ( themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max ){
						var szUnit = themeObj.szUnit || "";
						szUnit = szUnit.replace(/ /g,'&nbsp;');
						szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0)+szUnit+" ... "+parseFloat(themeObj.partsA[ix].max).toFixed(0)+szUnit;
					}
					var nCount = Math.min(100/nColors,8);
					szHtml += "<td><a "+((nCount<=1)?"style='margin-right:-0.5px'":"")+" class='legend-color-button' href='#' title='"+szMinMax+" click to see'><span onclick='javascript:ixmaps.switchThemeClass(\""+szId+"\","+ix+");event.stopPropagation();return false;' style='background:"+colorA[ix]+";opacity:"+(1/(row+1))+"'>";
					if ( (typeof(themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix) ){
						nCount -= 2;
					}
					for ( ii=0; ii<nCount; ii++){
						szHtml += "&nbsp;";
					}
					if ( (typeof(themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix) ){
						szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
					}
					szHtml += "</td></a>";
				}
				if ( themeObj.szFlag.match(/DOPACITY/) && themeObj.nMaxAlpha ){
					if ( row == 0 ){
						szHtml += "<td><span style='padding-left:0.5em'>"+ixmaps.__formatValue(themeObj.nMaxAlpha,0,"BLANK")+"</span></td>";
					}else
					if ( row == 1 ){
						szHtml += "<td><span style='padding-left:0.5em'>&#8595; "+(themeObj.szAlphaValueUnits||"density")+"</span></td>";
					}else{
						szHtml += "<td><span style='padding-left:0.5em'>"+ixmaps.__formatValue(themeObj.nMinAlpha,0,"BLANK")+"</span></td>";
					}
				}
				szHtml += "</tr>";
			}
		}
		var span = Math.floor(nColors*0.5);
		szHtml += "<tr class='legend-range-text' >";
		szHtml += "<td colspan='"+(span)+"' >"+ixmaps.__formatValue(themeObj.nMin,2,"BLANK")+" "+themeObj.szUnits+"</td>";
		szHtml += "<td colspan='"+(nColors - span)+"' align='right'>"+ixmaps.__formatValue(themeObj.nMax,2,"BLANK")+" "+themeObj.szUnits+"</td>";
		szHtml += "</tr>";

		szHtml += "</table>";

		return szHtml;
	};


	// ---------------------------------------------
	// legend footer  
	// ---------------------------------------------

	ixmaps.htmlgui_onLegendFooter = function(szId,themeObj){ 

		this.themeObj = themeObj;

		var themeDef = themeObj.def();

		var szHtml = "";

		if ( 0 && (themeObj.partsA.length > 2) ){
			szHtml += "<p style='color:#444444;margin-top:-10px'><i class='icon-arrow-up' title='arrow up' ></i> clicca sui colori per evidenziare</p>";
		}
		if ( themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidthpx ){
			szHtml += "<p style='color:#444444;margin-top:-10px'> aggregato per griglia di "+ themeDef.style.gridwidthpx +" pixel</p>";
			szHtml += "<p>";
			szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:10\",\"set\");'>10</button>";
			szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:20\",\"set\");'>20</button>";
			szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:50\",\"set\");'>50</button>";
			szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:100\",\"set\");'>100</button>";
			szHtml += "</p>";
		} else
		if ( themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidth ){
			szHtml += "<p style=margin-top:-10px'> aggregato per griglia di "+ themeDef.style.gridwidth.toFixed(0) +" metri</p>";
			szHtml += "<p>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==100?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:100\",\"set\");'>100</button>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==250?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:250\",\"set\");'>250</button>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==500?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:500\",\"set\");'>500</button>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==1000?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:1000\",\"set\");'>1000</button>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==5000?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:5000\",\"set\");'>5km</button>";
			szHtml += "<button type='button' class='btn btn-default "+((themeDef.style.gridwidth==10000?"focus":""))+"' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:10000\",\"set\");'>10km</button>";
			szHtml += "</p>";
			szHtml += "<div class='btn-group' style='margin-bottom:1em' ole='group' aria-label='...'>";
			szHtml += "  <button type='button' class='btn btn-default "+(themeDef.style.symbols == "square"?"focus":"")+"' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"add\");ixmaps.changeThemeStyle(null,\"symbols:square\",\"set\");'>rettangoli</button>";
			szHtml += "  <button type='button' class='btn btn-default "+(themeDef.style.symbols == "circle"?"focus":"")+"' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"add\");ixmaps.changeThemeStyle(null,\"symbols:circle\",\"set\");'>cerchi</button>";
			szHtml += "  <button type='button' class='btn btn-default "+(themeDef.style.symbols == "hexagon"?"focus":"")+"' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"remove\");ixmaps.changeThemeStyle(null,\"symbols:hexagon\",\"set\");'>esagoni</button>";
			szHtml += "</div>";
		}else
		if ( themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidthxxx ){
			szHtml += "<p style='color:#444444;margin-top:-10px'>"+
						"<div class='dropdown' >aggregato per griglia di "+
						"<button class='btn btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'> "+
						themeDef.style.gridwidth+
						" <span class='caret'></span>"+
						"</button>"+
						 "<ul class='dropdown-menu' aria-labelledby='dropdownMenu1'>"+
							"<li><a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"gridwidth:100\",\"set\");'>100 metri</a></li>"+
							"<li><a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"gridwidth:250\",\"set\");'>250 metri</a></li>"+
							"<li><a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"gridwidth:500\",\"set\");'>500 metri</a></li>"+
							"<li><a href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"gridwidth:1000\",\"set\");'>1000 metri</a></li>"+
						"</ul> metri"+
						"</div>";
			szHtml += "</p>";
		}

		var id = szId.replace(/\./g,'');

		szHtml += 		"<div style='margin-left:-5px;margin-top:0.2em;margin-bottom:1em;' >";
		szHtml += 		"<span id='legend-buttons"+szId+"'>";
			
		szHtml += 		"<a id='highbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"0.66\");' title='smooth chart' >";
		szHtml += 			"<span class='icon icon-arrow-down theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='lowbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1.5\");' title='amplify chart'>";
		szHtml += 			"<span class='icon icon-arrow-up theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='minusbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"0.66\");' title='smaller charts'>";
		szHtml += 			"<span class='icon icon-minus theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='plusbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1.5\");' title='bigger charts'>";
		szHtml += 			"<span class='icon icon-plus theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='valuebutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.toggleValueDisplay(\""+szId+"\");' title='add/remove textual values'>";
		szHtml += 			"<span class='icon icon-spell-check theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='opminusbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"0.66\");' title='more transparency'>";
		szHtml += 			"<span class='icon icon-checkbox-unchecked theme-tool-button' style='padding:0.5em;'></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='opplusbutton"+id+"' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"1.5\");' title='less transparency'>";
		szHtml += 			"<span class='icon icon-checkbox-partial theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";

		szHtml += 		"<a id='deletebutton"+id+"' class='theme-tool-button'  href='javascript:ixmaps.makeChartMenueHTML(\""+szId+"\");' title='chart menu'>";
		szHtml += 			"<span class='icon icon-pie theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";
		
		szHtml += 		"<a id='lockbutton"+id+"' class='theme-tool-button'  href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"type:LOCKED\",\"toggle\");' title='chart menu'>";
		if ( themeDef.style.type.match(/LOCKED/) ) {
			szHtml += 			"<span class='icon icon-lock theme-tool-button' ></span>";
			szHtml += 			"</a>&nbsp;";
		}else{
			szHtml += 			"<span class='icon icon-unlocked theme-tool-button' ></span>";
			szHtml += 			"</a>&nbsp;";
		}

		szHtml += 		"<a id='deletebutton"+id+"' class='theme-tool-button'  href='javascript:ixmaps.removeTheme(\""+szId+"\");' title='remove theme'>";
		szHtml += 			"<span class='icon icon-remove theme-tool-button' ></span>";
		szHtml += 			"</a>&nbsp;";


		szHtml += 		"</ span>";
		szHtml += 		"</ div>";

		if ( ixmaps.date && (ixmaps.date != "null") ){
			if ( ixmaps.parent && (ixmaps.parent != "null") ){
				var link = "<a style='text-decoration:none' href='"+ixmaps.parent+"' target='_blank'>this application</a>";
				szHtml += "<div style='margin-left:0.5em;font-size:0.8em'><p>created by "+link+" on "+ixmaps.date.split(/GMT/)[0]+"</p></div>";
			}else{
				szHtml += "<div style='margin-left:0.5em;font-size:0.7em'><p>creation time:<br> "+ixmaps.date+"</p></div>";
			}
		}

		szHtml += "</div>";

		return szHtml;
	};


	// ----------------------
	// make chart type menu 
	// ----------------------

	var szChartMenuId = null;
	var fChartMenuDialog = false;
	var fChartMenuVisible = true;

	ixmaps.makeChartMenueHTML = function(szId){

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
			ixmaps.openDialog(null,'chartmenue','',ixmaps.szChartTitle,'auto',800,500);
			fChartMenuDialog = true;
		}

		// set content and resize
		//
		$("#chartmenue").html(ixmaps.szChartHtml);

		$("#chartmenue").parent().css("width","300px");
		$("#chartmenue").parent().css("height","300px");

		$("#chartmenue").dialog({
		  close: function( event, ui ) {
				fChartMenuDialog = false;
				$("#chartmenue").remove();
			}
		});
	};



	// ============================================
	// event handler
	// ============================================


	// --------------------------------------------------
	// intercept theme creation, to make the theme legend
	// --------------------------------------------------

	ixmaps.htmlgui_onDrawTheme = function(szId){

		var themeObj = ixmaps.getThemeObj(szId);
		if ( !themeObj ) {
			return;
		}

		if ( themeObj.szFlag.match(/SUBTHEME/) ){
			return;
		}

		// in case szId is not giveb, set it from themeObj
		szId = szId || themeObj.szId;	

		var	szHtml = "";
		szHtml += "<h3 id='map-legend-title'>"+themeObj.szTitle||"Color Legend"+"</h3>";
		szHtml += "<h4 id='map-legend-snippet'>"+(themeObj.szSnippet||"")+"</h4>";

		szHtml += "<div id='map-legend-body'>";
		szHtml += "<div style='max-height:300px;overflow:auto;margin-right:1em;margin-bottom:1em'>";
		szHtml += ixmaps.legend.makeColorLegendHTML(szId,"generic","compact");
		szHtml += "</div>";
		//szHtml += "<br>";

		//szHtml += ixmaps.legend.makeLegendButtons(szId,"generic");
		//szHtml += "<br>";

		if( themeObj.szDescription ){
			szHtml += "<p>"+(themeObj.szDescription||"")+"</p>";
			}
	
		szHtml += "</div>";
		szHtml += "<div id='map-legend-footer'>";

		szHtml += ixmaps.htmlgui_onLegendFooter ? ixmaps.htmlgui_onLegendFooter(szId,themeObj,ixmaps.getThemeDefinitionObj(szId)) : "";
			
		szLegendPane = "<div id='map-legend-pane' class='map-legend-pane'>"+
						 "<a href='javascript:__toggleLegendPane()'>"+
						 "<div style='position:absolute;top:0em;right:0px;float:right;z-index:1;font-size:1em;padding:0.3em 0.5em;border:solid #ddd 1px'>"+
						   "<i id='map-legend-pane-switch' class='fa fa-chevron-up' title='close' style='color:#888' tabindex='-1'></i>"+
						 "</div>"+
						 "</a>"+ 
						 "<div class='container'>"+
						   "<div class='row'>"+
						     "<div class='col-lg-12 col-md-12 col-xs-0'>"+
							   "<div id='map-legend-content'>"+szHtml+"</div>"+
							 "</div>"+
						  "</div>"+
						"</div>";

		$("#map-legend").html(szLegendPane);

		$("#map-legend").slideDown();

		__actualThemeId = szId;

		__switchLegendPanes();
	};

	// --------------------------------------------------
	// intercept theme deletion, to remove active themes mark
	// --------------------------------------------------

	ixmaps.htmlgui_onRemoveTheme = function(szId){

		if ( !__actualThemeId || (__actualThemeId == szId) ){
			$("#map-legend-content").html("");
			$("#map-legend").hide();
		}
	};

	// ============================================
	// show/hide legend parts
	// ============================================

	/**
	 * display/hide the legend parts
	 * @type void
	 */
	var __themeLegendState = 2;

	__switchLegendPanes = function(){
		if ( __themeLegendState == 2 ){
			$("#map-legend-body").show();
			$("#map-legend-snippet").show();
			$("#map-legend-footer").show();
			$("#map-legend-pane-switch").removeClass("fa-chevron-down");
			$("#map-legend-pane-switch").addClass("fa-chevron-up");
		}else
		if ( __themeLegendState == 1 ){
			$("#map-legend-body").show();
			$("#map-legend-snippet").show();
			$("#map-legend-footer").hide();
			$("#map-legend-pane-switch").removeClass("fa-chevron-up");
			$("#map-legend-pane-switch").addClass("fa-chevron-down");
		}else{
			$("#map-legend-body").hide();
			$("#map-legend-snippet").hide();
			$("#map-legend-footer").hide();
			$("#map-legend-pane-switch").removeClass("fa-chevron-up");
			$("#map-legend-pane-switch").addClass("fa-chevron-down");
		}

	}

	/**
	 * open/close the legend parts
	 * @type void
	 */
	__toggleLegendPane = function(){
		__themeLegendState = ++__themeLegendState%3;

		ixmaps.htmlgui_onDrawTheme(__actualThemeId);

		//__switchLegendPanes();

	};

	/**
	 * set legend background on map type change
	 * @type void
	 */
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
			changeCss(".map-legend-pane:before", "background:#333" );
			changeCss(".map-legend-pane", "color:#888" );
			changeCss(".map-legend-count", "color:#888" );
			changeCss(".map-legend-switch", "color:#888" );

			$("#map-legend-pane-switch").attr("style","color:#888");

			changeCss(".btn-default","color:#888");
			changeCss(".btn-default","border-color:#666");
			changeCss(".btn-default","background-color:#333");

			changeCss(".btn-default.active","color:#888");
			changeCss(".btn-default.focus","color:#888");
			changeCss(".btn-default:active","color:#888");
			changeCss(".btn-default:focus","color:#888");

			changeCss(".btn-default.active","background-color:#333");
			changeCss(".btn-default.focus","background-color:#333");
			changeCss(".btn-default:active","background-color:#333");
			changeCss(".btn-default:focus","background-color:#333");

			changeCss(".btn-default.active","outline:none");
			changeCss(".btn-default.focus","outline:none");
			changeCss(".btn-default:active","outline:none");
			changeCss(".btn-default:focus","outline:none");

			changeCss("tr.theme-legend-item-selected", "background:#444" );


		}
	};

/**
 * end of namespace
 */

})();

// -----------------------------
// EOF
// -----------------------------


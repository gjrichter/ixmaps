/**********************************************************************
 inline_legend.js

$Comment: provides JavaScript for ixmaps UI theme legends in HTML
$Source : inline_legend.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: inline_legend.js 8 2015-02-10 08:14:02Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: inline_legend.js,v $
**********************************************************************/

var ixmaps = ixmaps || {};
ixmaps.legend = ixmaps.legend || {};

(function () {

    ixmaps.legend.legendA = [];

    var szControls = "small";
    var szSvgLegendFlag = "nolegend";
    var szHTMLLegendFlag = "1";
    var szLegendId = null;
    var fLegendDialog = false;
    var fOnRemove = false;
    var fLegendCompact = true;
    var fButton = false;

    // -------------
    // little helper
    // -------------

    ixmaps.toggleValueDisplay = function (szThemeId) {
        var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);
        if (szThemeStyle && szThemeStyle.match(/VALUES/)) {
            ixmaps.changeThemeStyle(null,szThemeId, 'type:VALUES;', 'remove');
        } else {
            ixmaps.changeThemeStyle(null,szThemeId, 'type:VALUES;', 'add');
        }
    };

    ixmaps.changeThemeDynamic = function (szThemeId, szParameter, szFactor) {

        var nFactor = Number(eval(szFactor));

        var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);

        if (szThemeStyle.match(/CHOROPLETH/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(null,szThemeId, 'dopacitypow:' + String(1 / nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(null,szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    break;
                case "opacity":
                    ixmaps.changeThemeStyle(null,szThemeId, 'opacity:' + String(nFactor), 'factor');
                    break;
            }
        } else
        if (szThemeStyle.match(/VECTOR|BEZIER/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(null,szThemeId, 'rangescale:' + String(1 / nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(null,szThemeId, 'normalsizevalue:' + String(1 / nFactor), 'factor');
                    break;
                case "opacity":
                    ixmaps.changeThemeStyle(null,szThemeId, 'opacity:' + String(nFactor), 'factor');
                    break;
            }
        } else
        if (szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) || szThemeStyle.match(/AGGREGATE/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(null,szThemeId, 'gridwidth:' + String(nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(null,szThemeId, 'scale:' + String(nFactor), 'factor');
                    break;
                case "opacity":
                    if (szThemeStyle.match(/DOPACITY/)) {
                        ixmaps.changeThemeStyle(null,szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(null,szThemeId, 'fillopacity:' + String(nFactor), 'factor');
                    }
                    break;
                case "aggregation":
                    ixmaps.changeThemeStyle(null,szThemeId, 'gridwidth:' + String(nFactor), 'factor');
                    break;
            }
        } else {
            switch (szParameter) {
                case "amplify":
                    if (szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/)) {
                        ixmaps.changeThemeStyle(null,szThemeId, 'rangescale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(null,szThemeId, 'normalsizevalue:' + String(1 / nFactor), 'factor');
                    }
                    break;
                case "scale":
                    if (szThemeStyle.match(/VECTOR/)) {
                        ixmaps.changeThemeStyle(null,szThemeId, 'linewidth:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(null,szThemeId, 'scale:' + String(nFactor), 'factor');
                    }
                    break;
                case "opacity":
                    if (szThemeStyle.match(/DOPACITY/)) {
                        ixmaps.changeThemeStyle(null,szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(null,szThemeId, 'fillopacity:' + String(nFactor), 'factor');
                    }
                    break;
                case "aggregation":
                    ixmaps.changeThemeStyle(null,szThemeId, 'gridwidth:' + String(nFactor), 'factor');
                    break;
            }
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
    ixmaps.__formatValue = function (nValue, nPrecision, szFlag) {

        nValue = Number(nValue);

        if (!isFinite(nValue) || !isFinite(nPrecision)) {
            return String(nValue);
        }
        if (nValue == 0) {
            return String(nValue);
        }
        if (nValue > 1000000000000) {
            return String(nValue);
        }
        if (nValue < -1000000000000) {
            return String(nValue);
        }

        if (!nPrecision) {
            nPrecision = 0;
        }
        nPrecision = Math.max(0, nPrecision);

        // GR 02.12.2011 make that low values do not collapse to 0
        if ((nValue > 0.0000001) && (nPrecision > 0)) {
            while (nValue.toFixed(nPrecision - 1) == 0) {
                nPrecision++;
            }
        }

        // GR 11.03.2009 fix precision before CEIL or FLOOR to avoid JS errors eg. 0.0000000000003
        nValue = nValue.toFixed(nPrecision + 1);

        nClipDecimal = Math.pow(10, nPrecision);
        if (szFlag && szFlag.match(/CEIL/)) {
            nValue = Math.ceil(nValue * nClipDecimal) / nClipDecimal;
        } else
        if (szFlag && szFlag.match(/FLOOR/)) {
            nValue = Math.floor(nValue * nClipDecimal) / nClipDecimal;
        } else {
            nValue = Math.round(nValue * nClipDecimal) / nClipDecimal;
        }
        // format numbers > 1000
        if (0 && (nValue < 1000)) {
            return String(nValue);
        } else {
            var szDecimals = String(nValue);
            if (szDecimals.match(/\./)) {
                szDecimals = szDecimals.split(".")[1];
                while (szDecimals.length < nPrecision) {
                    szDecimals += '0';
                }
            } else {
                szDecimals = "";
            }
            var szReturn = nValue < 0 ? "-" : "";
            var szLeading = "";

            nValue = Math.floor(Math.abs(nValue));

            // GR new flag
            if (!szFlag || !szFlag.match(/NOBREAKS/)) {
                var nClip = 1000;
                while (nValue > nClip) {
                    nClip *= 1000;
                }
                nClip /= 1000;

                var nPart = 0;
                var szBreak = " ";
                while (nClip >= 1000) {
                    nPart = Math.floor(nValue / nClip);
                    szReturn += __maptheme_formatpart(nPart, szLeading);
                    nValue = nValue % nClip;
                    nClip /= 1000;
                    if (nPart) {
                        szLeading = "0";
                        if (szFlag && szFlag.match(/SPACE/)) {
                            szBreak = "<span style=\"font-size:0.5em;\">&nbsp;</span>";
                        } else 
                        if (szFlag && szFlag.match(/BLANK/)) {
                            szBreak = "&nbsp;";
                        } else {
                            szBreak = ".";
                        }
                    }
                    szReturn += szBreak;
                }
            }

            szReturn += __maptheme_formatpart(nValue, szLeading);

            if (!szReturn.length || (szReturn == "-")) {
                szReturn += "0";
            }

            if (szDecimals.length && szDecimals != "00") {
                szReturn += ((szFlag && szFlag.match(/BLANK/)) ? "." : ",") + szDecimals;
            }
        }
        return szReturn;
    }
    /**
     * helper to format a number from 0 to 999 into a string with leading character (sample 32 -> "032" )
     * @param nPart the number to format
     * @param szLeading the leading character to insert if necessary 
     */
    function __maptheme_formatpart(nPart, szLeading) {
        if (!szLeading) {
            szLeading = "";
        }
        var szPart = "";
        if (nPart < 100) {
            szPart += szLeading;
        }
        if (nPart < 10) {
            szPart += szLeading;
        }
        if (nPart == 0) {
            szPart += szLeading;
        } else {
            szPart += String(nPart);
        }
        return szPart;
    }

    /**
     * convert a number into a formatted string; if the number > 1000 it will be formatted like 1 023 234 
     * @param nValue the number to format
     */
    ixmaps.__bestFormatValue = function (nValue) {
        if (nValue >= 10) {
            return ixmaps.__formatValue(nValue, 0, "SPACE");
        } else
        if (nValue >= 1) {
            return ixmaps.__formatValue(nValue, 1, "SPACE");
        } else {
            return ixmaps.__formatValue(nValue, 2, "SPACE");
        }
    };

    // ------------------------------------------
    // color scheme for legend, explicit version
    // ------------------------------------------
    ixmaps.legend.fShowFilter = true;
    
    
    // ===========================================================================
    // ===========================================================================
    //
    // long color legend
    //
    // ===========================================================================
    // ===========================================================================
    
    /**
     * make a long version color scheme with multiple lines 	
     * @param {string} szId the theme id 
     * @param {string} szLegendId a target id (div) [optional] 
     * @param {string} szMode "compact" to allow compact (one line) legend if possible 
     */
    ixmaps.legend.makeColorLegendHTMLLong = function (szId, szLegendId, szMode) {

        szLegendId = szLegendId || "generic";
		
		var fDark = ixmaps.htmlgui_getMapTypeId().match(/dark/i) || ixmaps.htmlgui_getMapTypeId().match(/black/i);

        var themeObj = ixmaps.getThemeObj(szId);
		
        var colorA = themeObj.colorScheme;
        var labelA = themeObj.szFlag.match(/CATEGORICAL/) ? themeObj.szLabelA : themeObj.szOrigLabelA ;
		
        // if color field defined, we collect the colors and make legend label here
        // -----------------------------------------------------------------------
        if (!labelA && themeObj.colorFieldA) {
            labelA = [];
            for (a in themeObj.colorFieldA) {
                labelA.push(a);
            }
            // create list of colors (classes) used 
            themeObj.colorClassUsedA = [];
            for (i in themeObj.indexA) {
                themeObj.colorClassUsedA[themeObj.itemA[themeObj.indexA[i]].nClass] = true;
            }
        }

		var nDecimals = (typeof(themeObj.szValueDecimals) != 'undefined')?themeObj.szValueDecimals:2; 		

		// compose the units suffix
        // ---------------------------
        var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
        szUnit = szUnit.replace(/ /g, '&nbsp;');

        // if no labels or colors are defined, make value range texts as label
        // -----------------------------------------------------------------------
        if (!labelA) {
            labelA = new Array();
            var len = Math.min(colorA.length, themeObj.partsA.length);
            for (var i = 0; i < len; i++) {
                var szPart = parseFloat(themeObj.partsA[i].min).toFixed(2) + "&nbsp;" + " ... " + parseFloat(themeObj.partsA[i].max).toFixed(2) + "&nbsp;" + szUnit;
                labelA.push(szPart);
            }
        }

        // how many rows 
        // ---------------------------
        var nRows = Math.min(colorA.length, labelA.length);
		
        // sort (or don't sort) the legend rows
        // -------------------------------------
        var sortA = [];

        for (var i = 0; i < nRows; i++) {

            // ic = i for color, may be recursive for plot curves 
            var ic = i;
			if ( themeObj.szFlag.match(/PLOT/) ){
            	ic = i % (themeObj.nGridX || 10000000000);
			}

            if (themeObj.szFlag.match(/SUM/) ||
                (themeObj.szFlag.match(/CATEGORICAL/) && !themeObj.szFlag.match(/SIZE/))) {
                if (themeObj.szFlag.match(/AUTO100/)) {
                    sortA.push({
                        index: i,
                        color: (themeObj.szFlag.match(/INVERT/) ? (nRows - i - 1) : ic),
                        count: (themeObj.partsA[i].nSum / themeObj.partsA[i].nCount)
                    });
                } else
                if (themeObj.partsA[i] && typeof (themeObj.partsA[i].nSum) != "undefined") {
                    if (themeObj.szFlag.match(/SUM/) && !themeObj.szFlag.match(/COUNT/)) {
                        sortA.push({
                            index: i,
                            color: (themeObj.szFlag.match(/INVERT/) ? (nRows - i - 1) : ic),
                            count: (themeObj.partsA[i].nSum)
                        });
                    } else
                    if (themeObj.szFlag.match(/MEAN/) && !themeObj.szFlag.match(/COUNT/)) {
                        sortA.push({
                            index: i,
                            color: (themeObj.szFlag.match(/INVERT/) ? (nRows - i - 1) : ic),
                            count: (themeObj.partsA[i].nSum / themeObj.partsA[i].nCount)
                        });
                    } else {
                        sortA.push({
                            index: i,
                            color: (themeObj.szFlag.match(/INVERT/) ? (nRows - i - 1) : ic),
                           	//count: themeObj.exactCountA[i] //(themeObj.partsA[i].nCount)
                            count: (themeObj.partsA[i].nCount)
                        });
                    }
                } else {
                    sortA.push({
                        index: i,
                        color: (themeObj.szFlag.match(/INVERT/) ? (nRows - i - 1) : ic),
                        count: (themeObj.exactSizeA[i] || themeObj.exactCountA[i] || themeObj.nMeanA[i] || ((themeObj.szFieldsA.length > 1) ? themeObj.nOrigSumA[i] : null))
                    });
                }
            } else {
                if (themeObj.szFlag.match(/COUNT/)) {
                    sortA.push({
                        index: i,
                        color: (ic),
                        count: themeObj.partsA[i] ? themeObj.partsA[i].nCount : themeObj.exactCountA[i]
                    });
                } else {
                    sortA.push({
                        index: i,
                        color: (ic),
                        count: (themeObj.exactSizeA[i] / themeObj.exactCountA[i])
                    });
                }
            }
        }
        if (themeObj.szFlag.match(/AREA/) && themeObj.szFlag.match(/STACKED/) && !themeObj.szShowParts) {
            sortA.sort(function (a, b) {
                return b.index - a.index;
            });
        } else
        if (!themeObj.szFlag.match(/NOSORT/)) {
            sortA.sort(function (a, b) {
                return b.count - a.count;
            });
        }

		// colorscheme
        //
        // start making the HTML
        // -----------------------------
        var szHtml = "";

        // show theme filter, if defined
        if (!themeObj.szFlag.match(/SIMPLELEGEND|COMPACTLEGEND|MINILEGEND/) && !(ixmaps.layout == "minimal") ) {
            if (ixmaps.legend.fShowFilter && themeObj.szFilter && themeObj.szFilter.length > 5) {
                szHtml += "<p class='legend-filter' ><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'></span><span class='legend-filter-text'>" + themeObj.szFilter + "</span><a href='javascript:ixmaps.changeThemeStyle(null,null,\"filter\",\"remove\");' title=\"remove\" ><span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
            }
        }

        // color legend = table
        // ---------------------
        szHtml += "<div id='legend-classes" + szLegendId + "' style='border-spacing:2px;line-height:1.25em;margin-top:0.2em;margin-bottom:0.5em;margin-right:1em' >";

        var fColorScheme = false;
        var fCountBars = false;
        var nMaxCount = 0;
		var nSumCount = 0;

        for (var i = 0; i < nRows; i++) {
            if (colorA[0] != colorA[i]) {
                fColorScheme = true;
            }
            if (sortA[i].count) {
                nMaxCount = Math.max(nMaxCount, sortA[i].count);
				nSumCount += sortA[i].count;
                fCountBars = true;
                fColorScheme = true;
            }
        }
        
        // show count sum in legend
        if (nSumCount && !themeObj.szFlag.match(/BAR/) && !(ixmaps.layout == "minimal") ){
            var szSum = ixmaps.__formatValue(nSumCount,nDecimals,"SPACE") + " " + (themeObj.szLegendUnits||themeObj.szUnits||"");
            szHtml += "<div style='font-size:1.8em;font-weight:light;margin:0em 0em 0.7em 0em;'>" + szSum + "</div>";
        }
        
        // clip legend rows !!
        nRows = Math.min(500, Math.min(colorA.length, labelA.length));

        if (fColorScheme &&
            ((themeObj.partsA.length > 2) ||
                themeObj.szLabelA ||
                themeObj.szFlag.match(/CATEGORICAL/) ||
                themeObj.szRangesA)) {

            // get exact count from themeObj
            var count = "";
			
            // -------------------------
            // make legend rows
            // -------------------------

            for (var i = 0; i < nRows; i++) {
				
                // suppress legend rows with no map charts
                // ----------------------------------------

                if (themeObj.colorFieldA) {
                    if (!themeObj.colorClassUsedA[sortA[i].index]) {
                        continue;
                    }
                } else
                if (themeObj.szFlag.match(/CATEGORICAL&CHART/) && themeObj.partsA[sortA[i].index] && !themeObj.partsA[sortA[i].index].nSum) {
                    continue;
                }

                if ((fCountBars || themeObj.szFlag.match(/FILTER/)) && !sortA[i].count) {
                    continue;
                }

                // check if legend part is selected (shows a marked class)
                // --------------------------------------------------------

                var fSelected = false;
                if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == sortA[i].index)) ||
                    ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[sortA[i].index]))) {
                    fSelected = true;
                } else
                if (themeObj.szShowParts) {
                    for (p in themeObj.szShowPartsA) {
                        if (themeObj.szShowPartsA[p] == i) {
                            fSelected = true;
                        }
                    }
                }

                // show class count
                var szCount = ixmaps.__formatValue(sortA[i].count, nDecimals, "SPACE") + (themeObj.szFlag.match(/COUNT/) ? "" : (" " + szUnit));

                // -------------------------
                // start legend row
                // -------------------------

                // switch theme class onclick
                var szAction = "javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + sortA[i].index + ");event.stopPropagation();return false;"
                if (themeObj.szFlag.match(/SIMPLELEGEND|COMPACTLEGEND/)) {
                    
                    // ---------------------------
                    // simple one line legend item
                    // ---------------------------

                    if (fSelected) {
                        szHtml += "<div valign='center' class='theme-legend-item-selected' onclick='" + szAction + "' style='border:none'>";
                    } else {
                        szHtml += "<div valign='center' class='theme-legend-item' onclick='" + szAction + "' style='border:none'>";
                    }

                    szHtml += "<div style='margin-top:0em;margin-bottom:-0.4em;white-space:nowrap;'>";

                    szHtml += "<span style='line-height:5px'>";
                    szHtml += "<a class='legend-color-button' href='#' title='"+szCount+" - click to see'>";

					if ( themeObj.szFlag.match(/CHART/) ){
						if ((colorA[sortA[i].color] == "none") || (themeObj.szLineColor && themeObj.nLineWidth)) {
							if (themeObj.fillOpacity < 0.1) {
								szHtml += "<span style='background:none;border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:1em;border-radius:1em;margin-right:1em;'>";
							} else 
							if ( themeObj.szFlag.match(/BAR/) ){
								szHtml += "<span style='background:" + colorA[sortA[i].color] + ";border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:1.3em;margin-right:1em;'>";
							}else{
								/**
								szHtml += "<span class='icon icon-arrow-up' style='background:" + colorA[sortA[i].color] + ";float:left;padding:0.2em 0.5em;'></span>";
								**/
								szHtml += "<span style='background:" + colorA[sortA[i].color] + ";border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:1em;border-radius:1em;margin-right:1em;'>";
							}
						} else {
							if ( themeObj.szFlag.match(/BAR/) && themeObj.szFlag.match(/POINTER/) ){
								szHtml += "<span class='icon icon-arrow-up' style='color:" + colorA[sortA[i].color] + ";font-size:1.2em;margin-right:-0.17em;float:left'></span>";
							}else {
								szHtml += "<span style='background:" + (themeObj.szLineColor||colorA[sortA[i].color]) + ";opacity:0.7;font-size:1em;border-radius:1em;margin-right:1em;'>";
							}
						}
					}else{
						szHtml += "<span style='background:" + (colorA[sortA[i].color]) + ";opacity:0.7;font-size:1em;border-radius:1em;margin-right:1em;'>";
					}

                    if (fCountBars && !themeObj.szFlag.match(/SIMPLELEGEND/) && !(ixmaps.layout == "minimal") ) {
                        var nMaxBar = 200;
                        var nBar = Math.ceil(Math.pow(sortA[i].count, 1) * (nMaxBar / Math.pow(nMaxCount, 1)));
 						if ( themeObj.szFlag.match(/VECTOR/) && themeObj.szFlag.match(/POINTER/) ){
							szHtml += "<span class='icon icon-arrow-right' style='padding-left:0.2em;color:"+(fDark?"black":"white")+";font-size:1.1em;vertical-align:-20%;'></span>";
						}
                       szHtml += "<span style='color:black;display:inline-block;width:" + nBar + "px;font-size:0.9em'>&nbsp;</span>";
                    } else {
                        szHtml += "&nbsp;&nbsp;";
                    }

                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";
                    
                    var szLabel = labelA[sortA[i].index];
                    var szValue = sortA[i].count?(""+ixmaps.__formatValue(sortA[i].count, nDecimals, "SPACE")+""):"";
                    szHtml += "<span class='theme-legend' style='white-space:nowrap'>";
                    szHtml += "<a class='theme-button' href='#' title='click to see'>";
                    szHtml += "<span title='" + szLabel + "' style=''>";
                    
                    // --------------------------------
                    // add label
                    // --------------------------------
                    
                    szHtml += "<span>";
                    szHtml += szLabel;
                    szHtml += "</span>";

                    // --------------------------------
                    // add values
                    // --------------------------------
                    
                    if (sortA[i].count) {
                        szHtml += "<span class='theme-legend-count' style='font-size:0.7em;'> " + szValue + " " + szUnit + "</span>";
                    } else
                    if (themeObj.szLabelA && !themeObj.szFlag.match(/SIMPLELEGEND/) && !(ixmaps.layout == "minimal") ) {
                        if ((typeof (themeObj.nMinA[i]) != "undefined") &&
                            (typeof (themeObj.nMaxA[i]) != "undefined") &&
                            (themeObj.nMinA[i] < themeObj.nMaxA[i])) {
                            if (themeObj.nMeanA[i]) {
                                szHtml += "<span style='font-size:0.7em;float:right;padding-left:10px' title='mean value'>" + ixmaps.__formatValue(themeObj.nMeanA[i], nDecimals, "SPACE") + "" + szUnit+ "</span>";
                            }
                        } else
                        if ((typeof (themeObj.nOrigMinA[i]) != "undefined") &&
                            (typeof (themeObj.nOrigMaxA[i]) != "undefined") &&
                            (themeObj.nOrigMinA[i] < themeObj.nOrigMaxA[i])) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.nOrigMinA[i], nDecimals, "SPACE") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.nOrigMaxA[i], nDecimals, "SPACE") + " " + szUnit + "</span>";
                        } else
                        if ((typeof (themeObj.partsA[i].min) != "undefined") && (typeof (themeObj.partsA[i].max) != "undefined")) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.partsA[i].min, nDecimals, "SPACE") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.partsA[i].max, nDecimals, "SPACE") + " " + szUnit + "</span>";
                        } else {
                            console.log(themeObj);
                        }
                    }
                    
                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";

                    //szHtml += "<span style='float:right'>" + szCount + "</span>";
                   

                    // end of legend part
                    szHtml += "</div>";

                } else {

                    // -------------------------------------
                    // simple 1 line legend item with values
                    // -------------------------------------

                    // -------------------------
                    // make the color bar header
                    // -------------------------

                    if (fSelected) {
                        szHtml += "<div valign='center' class='theme-legend-item-selected' onclick='" + szAction + "'>";
                    } else {
                        szHtml += "<div valign='center' class='theme-legend-item' onclick='" + szAction + "'>";
                    }

                    szHtml += "<div style='margin-top:-0.3em;margin-bottom:-0.3em'>";

                    szLabel = labelA[sortA[i].index];
                    szHtml += "<span class='theme-legend' >";
                    szHtml += "<a class='theme-button' href='#' title='click to see'>";
                    szHtml += "<span title='" + szLabel + "' >";
                    szHtml += "<span>";
                    szHtml += szLabel;
                    szHtml += "</span>";
                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";

                    szHtml += "</div>";

                    // -------------------
                    // make the color bar
                    // -------------------

                    szHtml += "<div style='margin-top:-2px;'>";

                    szHtml += "<span style='line-height:5px'>";
                    szHtml += "<a class='legend-color-button' href='#' title='click to see'>";
                    
                    var szRoundBorder = fCountBars ? "border-radius:0 0.5em 0.5em 0;" : "";
					
                    if ( (themeObj.szFlag.match(/VECTOR/) || themeObj.szFlag.match(/BEZIER/)) && themeObj.szLineColor ){
                         szHtml += "<span style='background:" + (themeObj.szLineColor||colorA[sortA[i].color]) + ";opacity:0.7;font-size:0.5em;"+szRoundBorder+"'>";
                    } else
                    if ((colorA[sortA[i].color] == "none") || (themeObj.szLineColor && themeObj.nLineWidth)) {
                        if (themeObj.fillOpacity < 0.1) {
                            szHtml += "<span style='background:none;border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em;"+szRoundBorder+"'>";
                        } else {
                            szHtml += "<span style='background:" + colorA[sortA[i].color] + ";border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em;"+szRoundBorder+"'>";
                        }
                    } else {
                        szHtml += "<span style='background:" + colorA[sortA[i].color] + ";opacity:0.7;font-size:0.5em;"+szRoundBorder+"'>";
                    }

                    if (fCountBars) {
                        var nMaxBar = 200;
                        var nBar = Math.ceil(Math.pow(sortA[i].count, 1) * Math.min(10, nMaxBar / Math.pow(nMaxCount, 1)));
                        szHtml += "<span style='display:inline-block;width:" + nBar + "px;font-size:0.5em'>&nbsp;</span>";
                    } else {
                        if (themeObj.szFlag.match(/DOPACITY/)) {
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                            szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + sortA[i].color + ");event.stopPropagation();return false;' style='background:" + colorA[sortA[i].color] + ";opacity:0.45;font-size:0.5em'>";
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                            szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + sortA[i].color + ");event.stopPropagation();return false;' style='background:" + colorA[sortA[i].color] + ";opacity:0.25;font-size:0.5em'>";
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        } else {
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        }
                    }

                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";

                    // --------------------------------
                    // add information to the color bar
                    // --------------------------------

                    if (sortA[i].count) {
                        szHtml += "<span class='theme-legend-count' style='color:#888888;float:right'> " + szCount + "</span>";
                    } else
                    if (themeObj.szLabelA) {
                        if ((typeof (themeObj.nMinA[i]) != "undefined") &&
                            (typeof (themeObj.nMaxA[i]) != "undefined") &&
                            (themeObj.nMinA[i] < themeObj.nMaxA[i])) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.nMinA[i], nDecimals, "SPACE") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.nMaxA[i], nDecimals, "SPACE") + " " + szUnit + "</span>";
                            if (themeObj.nMeanA[i]) {
                                szHtml += "<span style='padding-left:10px' title='mean value'>(" + ixmaps.__formatValue(themeObj.nMeanA[i], nDecimals, "BLANK") + ")</span>";
                            }
                        } else
                        if ((typeof (themeObj.nOrigMinA[i]) != "undefined") &&
                            (typeof (themeObj.nOrigMaxA[i]) != "undefined") &&
                            (themeObj.nOrigMinA[i] < themeObj.nOrigMaxA[i])) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.nOrigMinA[i], nDecimals, "SPACE") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.nOrigMaxA[i], nDecimals, "SPACE") + " " + szUnit + "</span>";
                        } else
                        if ((typeof (themeObj.partsA[i].min) != "undefined") && (typeof (themeObj.partsA[i].max) != "undefined")) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.partsA[i].min, nDecimals, "SPACE") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.partsA[i].max, 2, "SPACE") + " " + szUnit + "</span>";
                        } else {
                            console.log(themeObj);
                        }
                    }

                    // end of color bar
                    szHtml += "</div>";
                }
                // end of legend part
                szHtml += "</div>";
            }

        } else {
            if (((themeObj.nMinValue || themeObj.nMin) != 1) || ((themeObj.nMaxValue || themeObj.nMax) != 1)) {
                var opacity = themeObj.fillOpacity || 1;
				if ( (themeObj.szFlag.match(/VECTOR/) || themeObj.szFlag.match(/BEZIER/)) ){
					szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\"" + szId + "\"," + 0 + ")'  style='background:" + colorA[0] + ";font-size:0.5em;vertical-align:10%;border-radius:1em;opacity:"+opacity+";width:30px'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:0.5em'>" + ixmaps.__formatValue((themeObj.nMinValue || themeObj.nMin), nDecimals, "SPACE") + " " + ((szUnit.length < 5) ? szUnit : "") + "</span></td><td> ...</td><td><span style='padding-left:5px'>" + ixmaps.__formatValue((themeObj.nMaxValue || themeObj.nMax), nDecimals, "SPACE") + " " + szUnit + "</span></td></tr>";
				}else{
					szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\"" + szId + "\"," + 0 + ")'  style='background:" + colorA[0] + ";font-size:1em;border-radius:1em;opacity:"+opacity+";'>&nbsp;&nbsp;</span></td><td><span style='padding-left:0.5em'>" + ixmaps.__formatValue((themeObj.nMinValue || themeObj.nMin), nDecimals, "SPACE") + " " + ((szUnit.length < 5) ? szUnit : "") + "</span></td><td> ...</td><td><span style='padding-left:5px'>" + ixmaps.__formatValue((themeObj.nMaxValue || themeObj.nMax), nDecimals, "SPACE") + " " + szUnit + "</span></td></tr>";
				}
            } else {
                szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\"" + szId + "\"," + 0 + ")'  style='background:" + colorA[0] + ";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:0.5em'>" + (themeObj.szLabelA || themeObj.szFields) + "</td></tr>";
            }
        }

        szHtml += "</table>";

        return szHtml;
    };

    // ===========================================================================
    // ===========================================================================
    //
    // compact color legend (one line)
    //
    // ===========================================================================
    // ===========================================================================

    /**
     * make a short version color scheme with only one line	
     * @param {string} szId the theme id 
     * @param {string} szLegendId a target id (div) [optional] 
     * @param {string} szMode "compact" to allow compact (one line) legend if possible 
     */
    ixmaps.legend.makeColorLegendHTMLCompact = function (szId, szLegendId) {

        szLegendId = szLegendId || "generic";

        var themeObj = ixmaps.getThemeObj(szId);

        var colorA = themeObj.colorScheme;
        var labelA = themeObj.szLabelA;
        var nColors = colorA.length;

		var nDecimals = (typeof(themeObj.szValueDecimals) != 'undefined')?themeObj.szValueDecimals:2; 		

		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
        szUnit = szUnit.replace(/ /g, '&nbsp;');

        var nLegendWidth = (ixmaps.legend.maxwidth * 0.95) || 300;
        var szHtml = "";

        // show theme filter, if defined
        if (!themeObj.szFlag.match(/SIMPLELEGEND|COMPACTLEGEND|MINILEGEND/) && !(ixmaps.layout == "minimal") ) {
            if (themeObj.szFilter) {
                szHtml += "<p class='legend-filter' ><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'></span><span class='legend-filter-text'>" + themeObj.szFilter + "</span><a href='javascript:ixmaps.changeThemeStyle(null,null,\"filter\",\"remove\");' title=\"remove\" ><span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
            }
        }

        // 1 color and DOPACITY, make 7 step opacity growth
        // -------------------------------------------------

        if ((themeObj.partsA.length == 1) && themeObj.szFlag.match(/DOPACITY/)) {

            nColors = 7;

            szHtml += "<table id='legend-classes" + szLegendId + "' >";

            szHtml += "<tr valign='top' >";
            for (var i = 0; i < nColors; i++) {
                var szMinMax = "";
                if (themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max) {
                    var szUnit = themeObj.szUnit || "";
                    szUnit = szUnit.replace(/ /g, '&nbsp;');
                    szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0) + szUnit + " ... " + parseFloat(themeObj.partsA[ix].max).toFixed(0) + szUnit;
                }

                var nCount = nLegendWidth / nColors;
                var nGap = nCount / 10;

                szHtml += "<td><div style='width:" + (nCount - nGap) + "px;margin-right:" + nGap + "px;overflow:hidden;'>";
                szHtml += "<a class='legend-color-button' href='#' title='" + szMinMax + " click to see'>";
                szHtml += "<span onclick='javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + ix + ");event.stopPropagation();return false;' style='background:" + colorA[0] + ";opacity:" + (1 / (nColors - i)) + "'>";

                if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix)) ||
                    ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))) {
                    szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
                }
                szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

                szHtml += "</div></td></a>";
            }
            szHtml += "</tr>";

        } else

            // 2 color and DOPACITY, make 8 step opacity down and up
            // -------------------------------------------------

            if (((themeObj.partsA.length == 2) && !themeObj.szAlphaField) && themeObj.szFlag.match(/DOPACITY/)) {

                nColors = 8;
                nOpacityA = [1, 0.7, 0.3, 0.1, 0.1, 0.3, 0.7, 1];

                szHtml += "<table id='legend-classes" + szLegendId + "' >";

                szHtml += "<tr valign='top' >";
                for (var i = 0; i < nColors; i++) {
                    var szMinMax = "";
                    if (themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max) {
                        var szUnit = themeObj.szUnit || "";
                        szUnit = szUnit.replace(/ /g, '&nbsp;');
                        szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0) + szUnit + " ... " + parseFloat(themeObj.partsA[ix].max).toFixed(0) + szUnit;
                    }

                    var nCount = nLegendWidth / nColors;
                    var nGap = nCount / 10;

                    szHtml += "<td><div style='width:" + (nCount - nGap) + "px;margin-right:" + nGap + "px;overflow:hidden;'>";
                    szHtml += "<a class='legend-color-button' href='#' title='" + szMinMax + " click to see'>";
                    szHtml += "<span onclick='javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + ix + ");event.stopPropagation();return false;' style='background:" + colorA[Math.floor(i / 4)] + ";opacity:" + nOpacityA[i] + "'>";

                    if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix)) ||
                        ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))) {
                        szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
                    }
                    szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

                    szHtml += "</div></td></a>";
                }
                szHtml += "</tr>";

            } else {

                // 'normal' color scheme, a line of colors
                // -------------------------------------------------

                szHtml += "<table id='legend-classes" + szLegendId + "' >";

                // GR 02.11.2019 only one row 
                var nRows = (themeObj.szFlag.match(/DOPACITY/) && themeObj.szAlphaField) ? 3 : 1;
                nLegendWidth = (themeObj.szFlag.match(/DOPACITY/) && themeObj.szAlphaField && themeObj.nMaxAlpha) ? (nLegendWidth-100) : nLegendWidth;

                var nWidth = Math.min(50,nLegendWidth / nColors);
                var nGap = (nColors<25) ? (nWidth / 10) : 0;

                for (var row = 0; row < nRows; row++) {
                    szHtml += "<tr valign='top' >";
                    for (var i = 0; i < nColors; i++) {
                        var szMinMax = "";
                        var ix = i;
                        if (themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max) {
                            var szUnit = themeObj.szUnit || "";
                            szUnit = szUnit.replace(/ /g, '&nbsp;');
                            szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0) + szUnit + " ... " + parseFloat(themeObj.partsA[ix].max).toFixed(0) + szUnit;
                        }

                        szHtml += "<td><div style='width:" + nWidth + "px;margin-right:" + nGap + "px;overflow:hidden;'>";
                        szHtml += "<a class='legend-color-button' href='#' title='" + szMinMax + " click to see'>";
                        szHtml += "<span onclick='javascript:ixmaps.markThemeClass(null,\"" + szId + "\"," + ix + ");event.stopPropagation();return false;' style='background:" + colorA[ix] + ";opacity:" + (1 / (row + 1)) + "'>";

                        if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix)) ||
                            ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))) {
                            szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em'>*</span>";
                        }
                        szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

                        szHtml += "</span></a></div></td>";
                    }
                    if (themeObj.szFlag.match(/DOPACITY/) && themeObj.szAlphaField && themeObj.nMaxAlpha) {
                        if (row == 0) {
                            szHtml += "<td><span style='padding-left:0.5em'>" + ixmaps.__bestFormatValue(themeObj.nMaxAlpha) + "</span></td>";
                        } else
                        if (row == 1) {
                            szHtml += "<td><span style='padding-left:0.5em'>&#8595; " + (themeObj.szAlphaValueUnits || (themeObj.szFlag.match(/DENSITY/) ? "density" : "")) + "</span></td>";
                        } else {
                            szHtml += "<td><span style='padding-left:0.5em'>" + ixmaps.__bestFormatValue(themeObj.nMinAlpha) + "</span></td>";
                        }
                    }
                    szHtml += "</tr>";
                }
            }

        // first/last value text below the one line color scheme
        // -------------------------------------------
        // if szUnits == . don't insert leading blank
        var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "     ";

        szUnit = ((szUnit.substr(0, 1) == '.') ? "" : " ") + szUnit;
        var span = Math.floor(nColors * 0.5);

		var nMin = themeObj.nMinA[0]||themeObj.nMin;
		var nMax = themeObj.nMaxA[0]||themeObj.nMax;
        szHtml += "<tr class='legend-range-text' >";
        szHtml += "<td colspan='" + (span) + "' >" + ixmaps.__formatValue(nMin, nDecimals, "SPACE") + szUnit + "</td>";
        szHtml += "<td colspan='" + (nColors - span) + "' align='right'>" + ixmaps.__formatValue(nMax, nDecimals, "SPACE") + ((szUnit.length <= 3) ? szUnit : "") + "</td>";
        szHtml += "</tr>";

        szHtml += "</table>";

        return szHtml;
    };

    // ===========================================================================
    // ===========================================================================
    //
    // make color legend HTML
    //
    // ===========================================================================
    // ===========================================================================
    
    /**
     * make a color scheme legend in HTML 	
     * @param {string} szId the theme id 
     * @param {string} szLegendId a target id (div) [optional] 
     * @param {string} szMode "compact" to allow compact (one line) legend if possible 
     */
    ixmaps.legend.makeColorLegendHTML = function (szId, szLegendId, szMode) {

        szLegendId = szLegendId || "generic";

        var fLegendCompact = (szMode && szMode == "compact") ? true : false;
        var themeObj = ixmaps.getThemeObj(szId);

        if (themeObj.nDoneCount == 0) {
            if (themeObj.nChartUpper) {	
				nextTab();
                return ("<strong>not visible at actual zoom!</strong><br>please zoom in below 1:" + themeObj.nChartUpper);
            }
            if (themeObj.nChartLower) {
				nextTab();
                return ("<strong>not visible at actual zoom!</strong><br>please zoom out over 1:" + themeObj.nChartUpper);
            }
        }

        // check whether to make VECTOR legend 
        // -----------------------------------------------
        if (themeObj.szFlag.match(/VECTOR/) && themeObj.szLineColor && 0) {
            return ("<span style='display:inline-block;background:" + themeObj.szLineColor + ";font-size:0.1em;width:350px'>&nbsp;</span>");
        }

        // no  parts, no legend
		// ----------------------
		if ( !themeObj.partsA ){
			return "";
		}
		
        // check whether to make compact (one line) legend 
        // -----------------------------------------------
        if (themeObj.szFlag.match(/\bCLIP\b/)) {
            return ixmaps.legend.makeColorLegendHTMLLong(szId, szLegendId);
        }
        if ((themeObj.partsA.length == 1) &&
            themeObj.szFlag.match(/DOPACITY/) &&
            !themeObj.szFlag.match(/CATEGORICAL/)) {
            return ixmaps.legend.makeColorLegendHTMLCompact(szId, szLegendId);
        }
        if (fLegendCompact &&
            themeObj.partsA.length >= 5 &&
            themeObj.origColorScheme.length > 1 &&
            !themeObj.szFlag.match(/CATEGORICAL/) &&
            !themeObj.szFlag.match(/PLOT/) &&
            !(themeObj.szLabelA && themeObj.szLabelA.length && !(themeObj.szFlag.match(/SEQUENCE/) && !themeObj.szFlag.match(/SYMBOL/)))) {
            return ixmaps.legend.makeColorLegendHTMLCompact(szId, szLegendId);
        }

        return ixmaps.legend.makeColorLegendHTMLLong(szId, szLegendId);
    }

    // ===========================================================================
    // ===========================================================================
    //
    // make the complete legend HTML
    //
    // ===========================================================================
    // ===========================================================================

    /**
     * make all the legend with title, snippet, color scheme and footer	
     * @param {string} szLegendId a target id (div) [optional] 
     */
    ixmaps.legend.makeLegendHTML = function (szLegendId) {

        var fColors = true;
        var fFilter = false;
        var fLimits = false;

        var szId = this.legendA[szLegendId].szId;

        if (ixmaps.legend.legendA[szLegendId]) {
            ixmaps.themeObj = ixmaps.legend.legendA[szLegendId].themeObj;
        } else {
            return;
        }

        var colorA = ixmaps.themeObj.colorScheme;
        var labelA = ixmaps.themeObj.szLabelA;
        if (!labelA) {
            labelA = new Array();
            var szUnit = ixmaps.themeObj.szUnit || "";
            szUnit = szUnit.replace(/ /g, '&nbsp;');
            var len = Math.min(colorA.length, ixmaps.themeObj.partsA.length);
            for (var i = 0; i < len; i++) {
                var szPart = parseFloat(ixmaps.themeObj.partsA[i].min).toFixed(2) + szUnit + " ... " + parseFloat(ixmaps.themeObj.partsA[i].max).toFixed(2) + szUnit;
                labelA.push(szPart);
            }
        }

        szHtml = "";

        var nLegendHeight = Math.max(100, $(window).innerHeight() / 3);

        // legend container
        szHtml += "<div  id='legend-container" + szLegendId + "' >";

        // theme snippet
        if (ixmaps.themeObj.szSnippet) {
            szHtml += "<p class='legend-description' style='margin-top:0em;'>" + ixmaps.themeObj.szSnippet + "</p>";
        }

        // scroll wrap
        szHtml += "<div id='legend-scroll" + szLegendId + "' style='margin-top:0.2em;max-height:" + nLegendHeight + "px;overflow:auto' onclick='javascript:_toggle_tools(\"" + szLegendId + "\")'>";

        // legend colorscheme
        if (fColors) {
            szHtml += ixmaps.legend.makeColorLegendHTML(szId, szLegendId);
        }

        szHtml += "</div>";

        if (fButton) {
            szHtml += "	<div style='position:absolute;bottom:0.5em;right:0.3em;'><a style='color:#eee;font-size:1em;' onclick='javascript:_toggle_tools(\"" + szLegendId + "\")'><span class='icon icon-contract2'></span></a></div>";
        } else {
            szHtml += "	<div style='position:absolute;bottom:0.3em;right:0.3em;'><a style='color:#eee;font-size:1.3em;' onclick='javascript:_toggle_tools(\"" + szLegendId + "\")'><span class='icon icon-settings legend-button-settings'></span></a></div>";
        }

        // footer
        szHtml += "<div id='legend-footer" + szLegendId + "' style='margin-top:0.5m'>";

        if (ixmaps.themeObj.szDescription) {
            szHtml += "<p class='legend-description' style='margin-bottom:0.5em'>" + ixmaps.themeObj.szDescription + "</p>";
        } else {
            if (ixmaps.themeObj.szFlag.match(/DOPACITY/)) {
                if (ixmaps.themeObj.szAlphaField100 == "$density$") {
                    szHtml += "<span style='font-size:0.6em'>(dynamic opacity from density)</span>";
                } else {
                    szHtml += "<span style='font-size:0.6em'>(dynamic opacity from value)</span>";
                }
            } else {
                szHtml += "";
            }
        }
        if (fFilter) {
            var szFilter = "";
            szHtml += "<div style='margin-top:0.5em;'>";
            szHtml += "filter: <form " +
                "style=\"display:inline-block;left:0px;height:26px;margin-right:10px;\" " +
                "name=\"FilterForm\">" +
                "<input class=\"form-control\" id=\"query\" type=\"text\" size=\"9\" " +
                "value=\"" + szFilter + "\" " +
                "style=\"width:150px;height:22px;position:relative;top:0px;\" title=\"query map items\" " +
                "onkeyup=\"javascript:var value = $(this).val();ixmaps.filterThemeItems('" + szId + "',value);\">" +
                "</input>" +
                "</form>" +
                "<span><a href=\"javascript:ixmaps.selectFilterItems('" + szId + "');\" >sum" +
                "</a></span>";
            szHtml += "</div>";
        }
        if (ixmaps.themeObj.szFlag.match(/SUBTHEME/)) {
            szHtml += "<h3><a href='javascript:ixmaps.unmarkThemeClass(null,\"" + szId + "\")' class='theme-button'><span class='icon icon-undo2 theme-button' ></span></a></h3>";
        } else
        if (fButton) {
            var id = szId.replace(/\./g, '');

            szHtml += "<div style='margin-top:0.2em;margin-bottom:1;' >";
            szHtml += "<span id='legend-buttons" + szLegendId + "'>";

            szHtml += "<a id='highbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"amplify\",\"1/1.5\");' title='smooth chart' >";
            szHtml += "<span class='icon icon-arrow-down theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='lowbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"amplify\",\"1.5\");' title='amplify chart'>";
            szHtml += "<span class='icon icon-arrow-up theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='minusbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"scale\",\"1/1.5\");' title='smaller charts'>";
            szHtml += "<span class='icon icon-minus theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='plusbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"scale\",\"1.5\");' title='bigger charts'>";
            szHtml += "<span class='icon icon-plus theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='valuebutton" + id + "' class='theme-button' href='javascript:ixmaps.toggleValueDisplay(\"" + szId + "\");' title='add/remove textual values'>";
            szHtml += "<span class='icon icon-spell-check theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='opminusbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"opacity\",\"1/1.5\");' title='more transparency'>";
            szHtml += "<span class='icon icon-checkbox-unchecked theme-button' style='padding:0.5em;'></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='opplusbutton" + id + "' class='theme-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"opacity\",\"1.5\");' title='less transparency'>";
            szHtml += "<span class='icon icon-checkbox-partial theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='deletebutton" + id + "' class='theme-button'  href='javascript:ixmaps.makeChartMenueHTML(\"" + szId + "\");' title='chart menu'>";
            szHtml += "<span class='icon icon-pie theme-button' ></span>";
            szHtml += "</a>&nbsp;";

            szHtml += "<a id='deletebutton" + id + "' class='theme-button'  href='javascript:ixmaps.removeTheme(\"" + szId + "\");' title='remove theme'>";
            szHtml += "<span class='icon icon-remove theme-button' ></span>";
            szHtml += "</a>&nbsp;";


            szHtml += "</ span>";
            szHtml += "</ div>";

            if (fLimits) {
                szHtml += "	<div style=\"margin-top:0.5em;margin-bottom:0.5em;\">";
                szHtml += "		limitare elementi dei grafici:";
                szHtml += "		<a href=\"javascript:$('#info-limitare').toggle();\">";
                szHtml += "		<span class=\"icon icon-info tip\" data-tip=\"più/<br>meno\" style=\"font-size:14px;color:#aaaaaa;margin-left:0.2em;\"></span></a>";
                szHtml += "		<br>";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:1\");' title=\"massimo 1 parte\" >1</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:2\");' title=\"massimo 2 parti\" >2</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:3\");' title=\"massimo 3 parti\" >3</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:4\");' title=\"massimo 4 parti\" >4</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:5\");' title=\"massimo 5 parti\" >5</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"clipparts:0\");' title=\"tutti parti\" >tutti</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"type:FADEIN\",\"toggle\");' title=\"trasparenza dinamica\" >dinamico</a> |";
                szHtml += "		<a href='javascript:ixmaps.changeThemeStyle(null,null,\"type:NONEGATIVE\",\"toggle\");' title=\"no valori negativi\" >solo valori positivi</a>";
                szHtml += "	</div>";
            }

            if (0) {
                szHtml += "	<div id=\"info-limitare\" style=\"display:none\">";
                szHtml += "	<p>	<b>Limita</b> il numero di <b>elementi realizzati</b> per grafici con <b>più parti</b>,";
                szHtml += "		come per esempio per colonnine con i risultati di più partiti.<br>";
                szHtml += "		La differenza tra selezionare solo 3 partiti e questo metodo è la seguente:";
                szHtml += "		siccome la sequenza dei partiti è decrescente, limitando su 3 parti ottengo una grafica che mostra per ogni comune i 3 partiti più votati.";
                szHtml += "		<br><a href=\"javascript:$('#info-limitare').toggle();\">";
                szHtml += "		[chiudi]</a><p>";
                szHtml += "	</div>";
            }
        }

        szHtml += "</div>";
        // end of legend-footer	
        szHtml += "</div>";

        // end of legend-container	
        szHtml += "</div>";

        szHtml += "<div id='legend-extension" + szLegendId + "' style='overflow:hidden'>"
        // ------------------------------------
        szHtml += "<div>"
        szHtml += "<p class='legend-description' >";
        szHtml += "min: " + ixmaps.__formatValue((ixmaps.themeObj.nMin), 2, "SPACE") + "<br>";
        szHtml += "max: " + ixmaps.__formatValue((ixmaps.themeObj.nMax), 2, "SPACE");
        szHtml += "</p>";
        szHtml += "</div>"

        if (ixmaps.themeObj.szFieldsA.length == 1 && !ixmaps.themeObj.szFlag.match(/EXACT/)) {
            szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em;overflow:hidden;'>Histogram:</div>";
            szHtml += "<div id='histogram1Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_1" + szLegendId + "'></g></svg></div></div>";
            szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em'>Distribuzione:</div>";
            szHtml += "<div id='histogram2Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_2" + szLegendId + "' style='fill-opacity:0.7;stroke-opacity:0.8;'></g></svg></div></div>";
        } else {
            // x,y width,height parameter by testing
            szHtml += "<div id='overviewChartDiv' style='width:440px;height:300px;overflow:auto'>";
            szHtml += "<div>";
            szHtml += "<svg width='400' height='300' viewBox='0 0 7200 6000'>";
            szHtml += "<g id='overview_chart'><rect x='0' y='0' width='10' height='3000' style='fill:none' />"
            szHtml += "<g id='overview_target_1" + szLegendId + "'>";
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
    ixmaps.legend.refreshColorLegendHTML = function (szId, szLegendId) {
        $("#legend-scroll" + szLegendId).html(ixmaps.legend.makeColorLegendHTML(szId, szLegendId));

        ixmaps.themeObj = ixmaps.legend.legendA[szLegendId].themeObj;
        // insert SVG
        if (ixmaps.themeObj.szFieldsA.length == 1 && !ixmaps.themeObj.szFlag.match(/EXACT/)) {
            $("#histogram_target_1" + szLegendId).empty();
            $("#histogram_target_2" + szLegendId).empty();
            ixmaps.themeObj.getHistogram(null, $("#histogram_target_1" + szLegendId)[0], "");
            setTimeout('ixmaps.themeObj.getHistogram(null,$("#histogram_target_2' + szLegendId + '")[0],"DISTRIBUTION")', 200);
        } else {
            ixmaps.themeObj.getOverviewChart($("#overview_target_1" + szLegendId)[0], null);
        }

    };

    /**
     * show the legend in a dialog frame	
     * @param {string} szLegendId a target id (div) [optional] 
     */
    ixmaps.legend.show = function (szLegendId) {
        __showLegendDialog(szLegendId);
    };

    /**
     * show item list sidebar 	
      */
	ixmaps.legend.showItemList = function(){
		ixmaps.loadStoryTool('./list.html',{frame:true});
 	}
	
    // redraw or hide legend  
    __switchLegendMode = function () {
        ixmaps.fLegendVisible = true;
        __showLegendDialog();
    };

    /**
     * switch on/off the theme manipulation buttons
     */
    _toggle_tools = function (szId) {
        fButton = !fButton;
        ixmaps.legend.makeLegendHTML(szId)
        $("#legend" + szId).dialog("close");
        __switchLegendMode();
    };


    /**
     * for index.js
     */
    ixmaps.setTitle = function (szTitle) {
        if (szTitle && szTitle.length) {
            $("#title").html(szTitle).show();
        } else {
            $("#title").html("").hide();
        }
		
		ixmaps.embeddedApi.setTitle(szTitle);

    };

    // ---------------------------------------------------
    // on init, remove theme   
    // ---------------------------------------------------

    ixmaps.htmlgui_onInitThemes = function () {

        for (i in ixmaps.legend.legendA) {
            ixmaps.htmlgui_onRemoveTheme(ixmaps.legend.legendA[i].szId);
        }
        ixmaps.legend.legendA = [];

        // bubble up event
        return ixmaps.parentApi.htmlgui_onInitThemes();
    };

    /**
     * intercept map resizing 
     * @param void
     */
    ixmaps.htmlgui_onWindowResize = function () {

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

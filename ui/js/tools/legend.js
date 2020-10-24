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

(function () {

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

    ixmaps.toggleValueDisplay = function (szThemeId) {
        var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);
        if (szThemeStyle && szThemeStyle.match(/VALUES/)) {
            ixmaps.changeThemeStyle(szThemeId, 'type:VALUES;', 'remove');
        } else {
            ixmaps.changeThemeStyle(szThemeId, 'type:VALUES;', 'add');
        }
    };

    ixmaps.changeThemeDynamic = function (szThemeId, szParameter, szFactor) {

        var nFactor = Number(eval(szFactor));

        var szThemeStyle = ixmaps.getThemeStyleString(szThemeId);

        if (szThemeStyle.match(/CHOROPLETH/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(szThemeId, 'dopacitypow:' + String(1 / nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    break;
                case "opacity":
                    ixmaps.changeThemeStyle(szThemeId, 'opacity:' + String(nFactor), 'factor');
                    break;
            }
        } else
        if (szThemeStyle.match(/VECTOR|BEZIER/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(szThemeId, 'rangescale:' + String(1 / nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(szThemeId, 'normalsizevalue:' + String(1 / nFactor), 'factor');
                    break;
                case "opacity":
                    ixmaps.changeThemeStyle(szThemeId, 'opacity:' + String(nFactor), 'factor');
                    break;
            }
        } else
        if (szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) || szThemeStyle.match(/AGGREGATE/)) {
            switch (szParameter) {
                case "amplify":
                    ixmaps.changeThemeStyle(szThemeId, 'gridwidth:' + String(nFactor), 'factor');
                    break;
                case "scale":
                    ixmaps.changeThemeStyle(szThemeId, 'scale:' + String(nFactor), 'factor');
                    break;
                case "opacity":
                    if (szThemeStyle.match(/DOPACITY/)) {
                        ixmaps.changeThemeStyle(szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(szThemeId, 'fillopacity:' + String(nFactor), 'factor');
                    }
                    break;
                case "aggregation":
                    ixmaps.changeThemeStyle(szThemeId, 'gridwidth:' + String(nFactor), 'factor');
                    break;
            }
        } else {
            switch (szParameter) {
                case "amplify":
                    if (szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/)) {
                        ixmaps.changeThemeStyle(szThemeId, 'rangescale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(szThemeId, 'normalsizevalue:' + String(1 / nFactor), 'factor');
                    }
                    break;
                case "scale":
                    if (szThemeStyle.match(/VECTOR/)) {
                        ixmaps.changeThemeStyle(szThemeId, 'linewidth:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(szThemeId, 'scale:' + String(nFactor), 'factor');
                    }
                    break;
                case "opacity":
                    if (szThemeStyle.match(/DOPACITY/)) {
                        ixmaps.changeThemeStyle(szThemeId, 'dopacityscale:' + String(nFactor), 'factor');
                    } else {
                        ixmaps.changeThemeStyle(szThemeId, 'fillopacity:' + String(nFactor), 'factor');
                    }
                    break;
                case "aggregation":
                    ixmaps.changeThemeStyle(szThemeId, 'gridwidth:' + String(nFactor), 'factor');
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

    // must clear some chars to get it through the .dialog precedures 
    var __getLegendId = function (szId) {
        return szId.replace(".", "_");
    };

    // ------------------------------------------
    // color scheme for legend, explicit version
    // ------------------------------------------

    /**
     * make a long version color scheme with multiple lines
     * there are different types selectable via themeObj.szFlag:
     * default:       one line with the color label
     *                and one line with the color bar and additional text (values, min, max ...)
     * COMPACTLEGEND: 
     * @param {string} szId the theme id 
     * @param {string} szLegendId a target id (div) [optional] 
     * @param {string} szMode "compact" to allow compact (one line) legend if possible 
     */
    ixmaps.legend.makeColorLegendHTMLLong = function (szId, szLegendId, szMode) {

        szLegendId = szLegendId || "generic";

        var themeObj = ixmaps.getThemeObj(szId);

        var colorA = themeObj.colorScheme;
        var labelA = themeObj.szLabelA;

        // if color field defined, we collect the colors and make legend label here
        // -----------------------------------------------------------------------
        if (themeObj.colorFieldA) {
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
            var ic = i % (themeObj.nGridX || 10000000000);

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
                    if (themeObj.szFlag.match(/SUM/)) {
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
        if (0 && themeObj.szFilter) {
            szHtml += "<p class='legend-filter' style='margin-top:0em;color:#fff;background:#ddd'><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'></span><span class='legend-filter-text'>" + themeObj.szFilter + "</span><a href='javascript:ixmaps.changeThemeStyle(null,null,\"filter\",\"remove\");' title=\"remove\" ><span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
        }

        // color legend = table
        // ---------------------
        szHtml += "<div id='legend-classes" + szLegendId + "' class='legend-item-list' style='overflow:hidden'>";

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
        // clip legend rows !!
        nRows = Math.min(500, Math.min(colorA.length, labelA.length));

        if (fColorScheme &&
            ((themeObj.partsA.length > 2) ||
                themeObj.szLabelA ||
                themeObj.szFlag.match(/CATEGORICAL/) ||
                themeObj.szRangesA)) {

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
                    for ( var p in themeObj.szShowPartsA) {
                        if (themeObj.szShowPartsA[p] == i) {
                            fSelected = true;
                        }
                    }
                }

                // show class count
                var szCount = ixmaps.__formatValue(sortA[i].count, 2, "BLANK") + (themeObj.szFlag.match(/COUNT/) ? "" : (" " + szUnit));

                // -------------------------
                // start legend row
                // -------------------------

                // switch theme class onclick
                var szAction = "javascript:ixmaps.markThemeClass(\"" + szId + "\"," + sortA[i].index + ");event.stopPropagation();return false;"

                if (fSelected) {
                    szHtml += "<div valign='center' class='theme-legend-item-selected' style='margin-bottom:0.5em' onclick='" + szAction + "'>";
                } else {
                    szHtml += "<div valign='center' class='theme-legend-item' style='margin-bottom:0.5em' onclick='" + szAction + "'>";
                }

                szHtml += "<div>";

                if (themeObj.szFlag.match(/SIMPLELEGEND/)) {

                    // ---------------------------
                    // simple one line legend item
                    // ---------------------------

                    szHtml += "<div style='margin-top:0.2em;margin-bottom:0em'>";

                    szHtml += "<span style='line-height:5px'>";
                    szHtml += "<a class='legend-color-button' style='pointer-events:all'  href='#' title='click to see'>";

                    if ((colorA[sortA[i].color] == "none") || (themeObj.szLineColor && themeObj.nLineWidth)) {
                        if (themeObj.fillOpacity < 0.1) {
                            szHtml += "<span style='background:none;border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em'>";
                        } else {
                            szHtml += "<span style='background:" + colorA[sortA[i].color] + ";border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em'>";
                        }
                    } else {
                        szHtml += "<span style='background:" + colorA[sortA[i].color] + ";opacity:0.7;font-size:1em;border-radius:1em;margin-right:1em;width:1em;'>";
                    }

                    szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";

                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";
                    var szLabel = labelA[sortA[i].index];
                    szHtml += "<span class='theme-legend' >";
                    szHtml += "<a class='theme-button' style='pointer-events:all' href='#' title='click to see'>";
                    szHtml += "<span title='" + szLabel + "' style=''>";
                    szHtml += "<span>";
                    szHtml += szLabel;
                    szHtml += "</span>";
                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";

                    szHtml += "</div>";


                } else {

                    // ------------------------------
                    // 2 line legend item with values
                    // ------------------------------
                    // make the color bar header

                    var szLabel = labelA[sortA[i].index];
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

                    if (fSelected) {
                        szHtml += "<div style='margin-top:0px;margin-bottom:0em;padding-bottom:0.3em;border-bottom:#dddddd solid 0px;'>";
                    } else {
                        szHtml += "<div style='margin-top:0px;margin-bottom:0em;padding-bottom:0.3em;border-bottom:#dddddd solid 0px;'>";
                    }

                    szHtml += "<span style='line-height:5px'>";
                    szHtml += "<a class='legend-color-button' style='pointer-events:all' href='#' title='click to see'>";

                    if ( themeObj.szFlag.match(/VECTOR/) || themeObj.szFlag.match(/BEZIER/) && themeObj.szLineColor ){
                         szHtml += "<span style='background:" + (themeObj.szLineColor||colorA[sortA[i].color]) + ";opacity:0.7;font-size:0.5em'>";
                    } else
                    if (colorA[sortA[i].color] == "none" || (themeObj.szLineColor && themeObj.nLineWidth) ) {
                        if (themeObj.fillOpacity < 0.1) {
                            szHtml += "<span style='background:none;border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em'>";
                        } else {
                            szHtml += "<span style='background:" + colorA[sortA[i].color] + ";border:solid " + themeObj.szLineColor + " 1px;opacity:0.7;font-size:0.5em'>";
                        }
                    } else {
                        szHtml += "<span style='background:" + colorA[sortA[i].color] + ";opacity:1;font-size:0.6em;border-radius:0 0.6em 0.6em 0'>";
                    }

                    // make the color bar

                    if (fCountBars) {
                        var nMaxBar = ($("#map-legend").width() - 20) * 0.5;
                        var nBar = Math.ceil(Math.pow(sortA[i].count, 1) * Math.min(10, nMaxBar / Math.pow(nMaxCount, 1)));
                        szHtml += "<span style='display:inline-block;width:" + nBar + "px;font-size:0.5em'>&nbsp;</span>";
                    } else {
                        if (themeObj.szFlag.match(/DOPACITY/)) {
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                            szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(\"" + szId + "\"," + sortA[i].color + ");event.stopPropagation();return false;' style='background:" + colorA[sortA[i].color] + ";opacity:0.55;font-size:0.5em'>";
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                            szHtml += "</span><span onclick='javascript:ixmaps.markThemeClass(\"" + szId + "\"," + sortA[i].color + ");event.stopPropagation();return false;' style='background:" + colorA[sortA[i].color] + ";opacity:0.25;font-size:0.5em'>";
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        } else {
                            szHtml += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                        }
                    }

                    szHtml += "</span>";
                    szHtml += "</a>";
                    szHtml += "</span>";

                    // add information to the color bar

                    if (sortA[i].count) {
 						if ( $("#map-legend").attr("data-align") == "left" ){
                       		szHtml += "<span class='theme-legend-count' style='pointer-events:all;color:#888888;vertical-align:-10%'>&nbsp;&nbsp;" + szCount + "</span>";
						}else{
							szHtml += "<span class='theme-legend-count' style='pointer-events:all;color:#888888;float:right;'>&nbsp;&nbsp;" + szCount + "</span>";
						}
                    } else
                    if (themeObj.szLabelA) {
                        if ((typeof (themeObj.nMinA[i]) != "undefined") &&
                            (typeof (themeObj.nMaxA[i]) != "undefined") &&
                            (themeObj.nMinA[i] < themeObj.nMaxA[i])) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.nMinA[i], 2, "BLANK") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.nMaxA[i], 2, "BLANK") + " " + szUnit + "</span>";
                            if (themeObj.nMeanA[i]) {
                                szHtml += "<span style='padding-left:10px' title='mean value'>(" + ixmaps.__formatValue(themeObj.nMeanA[i], 2, "BLANK") + ")</span>";
                            }
                        } else
                        if ((typeof (themeObj.nOrigMinA[i]) != "undefined") &&
                            (typeof (themeObj.nOrigMaxA[i]) != "undefined") &&
                            (themeObj.nOrigMinA[i] < themeObj.nOrigMaxA[i])) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.nOrigMinA[i], 2, "BLANK") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.nOrigMaxA[i], 2, "BLANK") + " " + szUnit + "</span>";
                        } else
                        if ((typeof (themeObj.partsA[i].min) != "undefined") && (typeof (themeObj.partsA[i].max) != "undefined")) {
                            szHtml += "<span style='padding-left:10px'>" + ixmaps.__formatValue(themeObj.partsA[i].min, 2, "BLANK") + " " + szUnit + "</span>  ... <span style='padding-left:5px'>" + ixmaps.__formatValue(themeObj.partsA[i].max, 2, "BLANK") + " " + szUnit + "</span>";
                        } else {
                            console.log(themeObj);
                        }
                    }
                }

                // end of color bar
                szHtml += "</div>";

                // end of legend part
                szHtml += "</div>";
            }
        } else {
            if (((themeObj.nMinValue || themeObj.nMin) != 1) || ((themeObj.nMaxValue || themeObj.nMax) != 1)) {
                szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\"" + szId + "\"," + 0 + ")'  style='background:" + colorA[0] + ";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:5px'>" + ixmaps.__formatValue((themeObj.nMinValue || themeObj.nMin), 2, "BLANK") + " </span></td><td> &nbsp;...</td><td><span style='padding-left:5px'>" + ixmaps.__formatValue((themeObj.nMaxValue || themeObj.nMax), 2, "BLANK") + " " + szUnit + "</span></td></tr>";
            } else {
                szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\"" + szId + "\"," + 0 + ")'  style='background:" + colorA[0] + ";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span style='padding-left:5px'>" + (themeObj.szLabelA || themeObj.szFields) + "</td></tr>";
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
    ixmaps.legend.makeColorLegendHTMLCompact = function (szId, szLegendId) {

        szLegendId = szLegendId || "generic";

        var themeObj = ixmaps.getThemeObj(szId);

        var colorA = themeObj.colorScheme;
        var labelA = themeObj.szLabelA;
        var nColors = colorA.length;

        var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";
        szUnit = szUnit.replace(/ /g, '&nbsp;');
        var szHtml = "";

        // theme filter
        if (0 && themeObj.szFilter) {
            szHtml += "<p class='legend-filter-text' >Filter: " + themeObj.szFilter + "</p>";
        }

        if ((themeObj.partsA.length == 1) && themeObj.szFlag.match(/DOPACITY/)) { 

            // 1 color and DOPACITY, make 7 step opacity growth
            nColors = 7;

            szHtml += "<table id='legend-classes" + szLegendId + "' >";

            szHtml += "<tr valign='top' >";
            for (var i = 0; i < nColors; i++) {

                var nCount = Math.min(100 / nColors, 8);
                var nGap = nCount / 10;

                szHtml += "<td><div style='margin-right:" + nGap + "px;overflow:hidden;'>";
                szHtml += "<span style='background:" + colorA[0] + ";opacity:" + (1 / (nColors - i)) + "'>";

                for (ii = 0; ii < nCount; ii++) {
                    szHtml += "&nbsp;";
                }

                szHtml += "</span></div></td>";
            }
            szHtml += "</tr>";

        } else { 

            // color legend 
            szHtml += "<table id='legend-classes" + szLegendId + "' cellspacing='2' cellpadding='0' >";

            var nRows = (themeObj.szFlag.match(/DOPACITY/) && themeObj.szAlphaField && themeObj.nMaxAlpha) ? 3 : 1;
            for (var row = 0; row < nRows; row++) {
                szHtml += "<tr valign='top' >";
                for (var i = 0; i < nColors; i++) {
                    var szMinMax = "";
                    var ix = themeObj.szFlag.match(/INVERT/) ? (nColors - i - 1) : i;
                    if (themeObj.partsA[ix] && themeObj.partsA[ix].min && themeObj.partsA[ix].max) {
                        szMinMax = parseFloat(themeObj.partsA[ix].min).toFixed(0) + szUnit + " ... " + parseFloat(themeObj.partsA[ix].max).toFixed(0) + szUnit;
                    }
                    var nCount = Math.min(70 / nColors, 8);
                    var nOpacity = (1 / (row + 1));
                    if (themeObj.szFlag.match(/DOPACITY/)) {
                        nOpacity = (i + (nColors / 10)) / nColors;
                    }
                    szHtml += "<td><a " + ((nCount <= 1) ? "style='margin-right:-0.5px'" : "") + " class='legend-color-button' href='#' title='" + szMinMax + " click to see'><span onclick='javascript:ixmaps.markThemeClass(\"" + szId + "\"," + ix + ");event.stopPropagation();return false;' style='background:" + colorA[ix] + ";opacity:" + nOpacity + "'>";
                    if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix)) ||
                        ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))) {
                        nCount -= 4;
                    }
                    for (ii = 0; ii < nCount; ii++) {
                        szHtml += "&nbsp;";
                    }
                    if (((typeof (themeObj.markedClass) != "undefined") && (themeObj.markedClass == ix)) ||
                        ((typeof (themeObj.markedClasses) != "undefined") && (themeObj.markedClasses[ix]))) {
                        szHtml += "<span style='font-size:2em;line-height:0;vertical-align:-0.35em;color:#444'>*</span>";
                    }
                    szHtml += "</td></a>";
                }
                if (themeObj.szFlag.match(/DOPACITY/) && themeObj.szAlphaField && themeObj.nMaxAlpha) {
                    if (row == 0) {
                        szHtml += "<td><span style='padding-left:0.5em'>" + ixmaps.__formatValue(themeObj.nMaxAlpha, 0, "BLANK") + "</span></td>";
                    } else
                    if (row == 1) {
                        szHtml += "<td><span style='padding-left:0.5em'>&#8595; " + (themeObj.szAlphaValueUnits || "density") + "</span></td>";
                    } else {
                        szHtml += "<td><span style='padding-left:0.5em'>" + ixmaps.__formatValue(themeObj.nMinAlpha, 0, "BLANK") + "</span></td>";
                    }
                }
                szHtml += "</tr>";
            }
        }
        var span = Math.floor(nColors * 0.5);
        szHtml += "<tr class='legend-range-text' >";
        szHtml += "<td colspan='" + (span) + "' >" + ixmaps.__formatValue(themeObj.nMin, 2, "BLANK") + " " + szUnit + "</td>";
        szHtml += "<td colspan='" + (nColors - span) + "' align='right'>" + ixmaps.__formatValue(themeObj.nMax, 2, "BLANK") + " " + szUnit + "</td>";
        szHtml += "</tr>";

        szHtml += "</table>";

        return szHtml;
    };


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
                return ("<strong>not visible at actual zoom!</strong><br>please zoom in below 1:" + themeObj.nChartUpper);
            }
        }

        // check whether to make VECTOR legend 
        // -----------------------------------------------
        if (themeObj.szFlag.match(/VECTOR/) && themeObj.szLineColor && 0 ) {
            return ("<span style='display:inline-block;background:" + themeObj.szLineColor + ";font-size:0.1em;width:350px'>&nbsp;</span>");
        }

        // check whether to make compact (one line) legend 
        // -----------------------------------------------
        if ((themeObj.partsA.length == 1) &&
            themeObj.szFlag.match(/DOPACITY/) &&
            !themeObj.szFlag.match(/CATEGORICAL/)) {
            return ixmaps.legend.makeColorLegendHTMLCompact(szId, szLegendId);
        }
       if (fLegendCompact &&
		   themeObj.szFlag.match(/CLIP/)){
       		return ixmaps.legend.makeColorLegendHTMLCompact(szId, szLegendId);
	   }
       if (fLegendCompact &&
            themeObj.partsA.length >= 5 &&
            !themeObj.szFlag.match(/CATEGORICAL/) &&
            !themeObj.szFlag.match(/PLOT/) &&
            !(themeObj.szLabelA && themeObj.szLabelA.length && !(themeObj.szFlag.match(/SEQUENCE/) && !themeObj.szFlag.match(/SYMBOL/)))) {
            return ixmaps.legend.makeColorLegendHTMLCompact(szId, szLegendId);
        }

        return ixmaps.legend.makeColorLegendHTMLLong(szId, szLegendId);
    }

    // ---------------------------------------------
    // legend footer  
    // ---------------------------------------------

    ixmaps.htmlgui_onLegendFooter = function (szId, themeObj) {

        this.themeObj = themeObj;

        var themeDef = themeObj.def();

        var szHtml = "";

        // show theme filter, if defined
        if (themeObj.szFilter) {
            szHtml += "<p class='legend-filter' style='margin-top:0em;color:#fff;background:#ddd;width:85%'><span class='icon icon-filter' style='float:left;padding:0.2em 0.5em;'></span><span class='legend-filter-text'>" + themeObj.szFilter + "</span><a href='javascript:ixmaps.changeThemeStyle(null,null,\"filter\",\"remove\");' title=\"remove\" ><span class='icon icon-cancel-circle' style='float:right;padding:0.2em 0.5em;'></span></a></p>";
        }
        if (0 && (themeObj.partsA.length > 2)) {
            szHtml += "<p style='color:#444444;><i class='icon-arrow-up' title='arrow up' ></i> clicca sui colori per evidenziare</p>";
        }
        if (themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidthpx) {
            szHtml += "<p style='color:#444444'> aggregato per griglia di " + themeDef.style.gridwidthpx + " pixel</p>";
            szHtml += "<p>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:1\",\"set\");'>1</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:2\",\"set\");'>2</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:5\",\"set\");'>5</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:10\",\"set\");'>10</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:20\",\"set\");'>20</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:50\",\"set\");'>50</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidthpx:100\",\"set\");'>100</button>";
            szHtml += "</p>";
            
            szHtml += "<p>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridoffsetx:-5\",\"add\");'>&larr;</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridoffsetx:5\",\"add\");'>&rarr;</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridoffsety:-5\",\"add\");'>&darr;</button>";
            szHtml += "<button type='button' class='btn btn-default' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridoffsety:5\",\"add\");'>&uarr;</button>";
            szHtml += "</p>";
        } else
        if (themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidth) {
            szHtml += "<p style=margin-top:-10px'> aggregato per griglia di " + themeDef.style.gridwidth.toFixed(0) + " metri</p>";
            szHtml += "<p>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 100 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:100\",\"set\");'>100</button>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 250 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:250\",\"set\");'>250</button>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 500 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:500\",\"set\");'>500</button>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 1000 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:1000\",\"set\");'>1000</button>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 5000 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:5000\",\"set\");'>5km</button>";
            szHtml += "<button type='button' class='btn btn-default " + ((themeDef.style.gridwidth == 10000 ? "focus" : "")) + "' onclick='javascript:ixmaps.changeThemeStyle(null,\"gridwidth:10000\",\"set\");'>10km</button>";
            szHtml += "</p>";
            szHtml += "<div class='btn-group' style='margin-bottom:1em' ole='group' aria-label='...'>";
            szHtml += "  <button type='button' class='btn btn-default " + (themeDef.style.symbols == "square" ? "focus" : "") + "' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"add\");ixmaps.changeThemeStyle(null,\"symbols:square\",\"set\");'>rettangoli</button>";
            szHtml += "  <button type='button' class='btn btn-default " + (themeDef.style.symbols == "circle" ? "focus" : "") + "' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"add\");ixmaps.changeThemeStyle(null,\"symbols:circle\",\"set\");'>cerchi</button>";
            szHtml += "  <button type='button' class='btn btn-default " + (themeDef.style.symbols == "hexagon" ? "focus" : "") + "' onclick='ixmaps.changeThemeStyle(null,\"type:RECT\",\"remove\");ixmaps.changeThemeStyle(null,\"symbols:hexagon\",\"set\");'>esagoni</button>";
            szHtml += "</div>";
        } else
        if (themeDef.style.type.match(/AGGREGATE/) && themeDef.style.gridwidthxxx) {
            szHtml += "<p style='color:#444444;margin-top:-10px'>" +
                "<div class='dropdown' >aggregato per griglia di " +
                "<button class='btn btn-default dropdown-toggle' type='button' id='dropdownMenu1' data-toggle='dropdown' aria-haspopup='true' aria-expanded='true'> " +
                themeDef.style.gridwidth +
                " <span class='caret'></span>" +
                "</button>" +
                "<ul class='dropdown-menu' aria-labelledby='dropdownMenu1'>" +
                "<li><a href='javascript:ixmaps.changeThemeStyle(\"" + szId + "\",\"gridwidth:100\",\"set\");'>100 metri</a></li>" +
                "<li><a href='javascript:ixmaps.changeThemeStyle(\"" + szId + "\",\"gridwidth:250\",\"set\");'>250 metri</a></li>" +
                "<li><a href='javascript:ixmaps.changeThemeStyle(\"" + szId + "\",\"gridwidth:500\",\"set\");'>500 metri</a></li>" +
                "<li><a href='javascript:ixmaps.changeThemeStyle(\"" + szId + "\",\"gridwidth:1000\",\"set\");'>1000 metri</a></li>" +
                "</ul> metri" +
                "</div>";
            szHtml += "</p>";
        }

        var id = szId.replace(/\./g, '');

        var bigger_icon = "<span class='icon icon-arrow-up theme-tool-button' ></span>";
        var smaller_icon = "<span class='icon icon-arrow-down theme-tool-button' ></span>";

        if (themeObj.szFlag.match(/AGGREGATE/)) {
            bigger_icon = "<i class='fa fa-th-large fa-fw'></i>";
            smaller_icon = "<span style='margin-left:3px'>&nbsp;</span><i class='fa fa-th fa-fw'></i>";
        }

        szHtml += "<div style='position:relative;margin-top:0.5em;margin-bottom:1em;margin-left:-0.8em;line-height:2em;' >";
        szHtml += "<span id='legend-buttons" + szId + "'>";

        szHtml += "<a id='highbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"amplify\",\"0.66\");' title='smooth chart' >";
        szHtml += smaller_icon;
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='lowbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"amplify\",\"1.5\");' title='amplify chart'>";
        szHtml += bigger_icon;
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='minusbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"scale\",\"0.66\");' title='smaller charts'>";
        szHtml += "<span class='icon icon-minus theme-tool-button' ></span>";
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='plusbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"scale\",\"1.5\");' title='bigger charts'>";
        szHtml += "<span class='icon icon-plus theme-tool-button' ></span>";
        szHtml += "</a> ";

        szHtml += "<a id='valuebutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.toggleValueDisplay(\"" + szId + "\");' title='add/remove textual values'>";
        szHtml += "<span class='icon icon-spell-check theme-tool-button' ></span>";
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='opminusbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"opacity\",\"0.66\");' title='more transparency'>";
        szHtml += "<span class='icon icon-checkbox-unchecked theme-tool-button' style='padding:0.5em;'></span>";
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='opplusbutton" + id + "' class='theme-tool-button' href='javascript:ixmaps.changeThemeDynamic(\"" + szId + "\",\"opacity\",\"1.5\");' title='less transparency'>";
        szHtml += "<span class='icon icon-stop2 theme-tool-button' ></span>";
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='deletebutton" + id + "' class='theme-tool-button'  href='javascript:ixmaps.makeChartMenueHTML(\"" + szId + "\");' title='chart menu'>";
        szHtml += "<span class='icon icon-pie-chart theme-tool-button' ></span>";
        szHtml += "</a>&nbsp;";

        szHtml += "<a id='lockbutton" + id + "' class='theme-tool-button'  href='javascript:ixmaps.changeThemeStyle(\"" + szId + "\",\"type:LOCKED\",\"toggle\");' title='chart menu'>";
        if (themeDef.style.type.match(/LOCKED/)) {
            szHtml += "<span class='icon icon-lock theme-tool-button' ></span>";
            szHtml += "</a>&nbsp;";
        } else {
            szHtml += "<span class='icon icon-unlocked theme-tool-button' ></span>";
            szHtml += "</a>&nbsp;";
        }

        szHtml += "<a id='deletebutton" + id + "' class='theme-tool-button'  href='javascript:ixmaps.removeTheme(\"" + szId + "\");' title='remove theme'>";
        szHtml += "<span class='icon icon-bin2 theme-tool-button' ></span>";
        szHtml += "</a>&nbsp;";


        szHtml += "</ span>";
        szHtml += "</ div>";

        if (ixmaps.date && (ixmaps.date != "null")) {
            if (ixmaps.parent && (ixmaps.parent != "null")) {
                var link = "<a style='text-decoration:none' href='" + ixmaps.parent + "' target='_blank'>this application</a>";
                szHtml += "<div style='margin-left:0.5em;font-size:0.8em'><p>created by " + link + " on " + ixmaps.date.split(/GMT/)[0] + "</p></div>";
            } else {
                szHtml += "<div style='margin-left:0.5em;font-size:0.7em'><p>creation time:<br> " + ixmaps.date + "</p></div>";
            }
        }

        szHtml += "</div>";

        return szHtml;
    };


    ixmaps.legend.loadExternalLegend = function (szUrl) {

        var szHtml = '<div id="map-legend-body" class="map-legend-body" style="margin-top:-1em"></div>';
		if (0){
			szHtml += '<div id="map-legend-delete" style="position:absolute;top:0.2em;right:-1em;border:solid 1px;padding:0.9em 1.2em 1.2em 1.2em;border-radius:2em">';
			szHtml += '<b><a href="javascript:ixmaps.legend.removeExternalLegend(\'' + szUrl + '\')" style="text-decoration:none">...</a></b></div>';
		}
        $("#map-legend").html(szHtml);
        $("#map-legend-body").load(szUrl);
        $("#map-legend-body").css("pointer-events","all");
        $("#map-legend-delete").css("pointer-events","all");
        $("#map-legend").show();

    };
    ixmaps.legend.setExternalLegend = function (szLegend) {
		
        var szHtml = '<div id="map-legend-body" class="map-legend-body" style="margin-top:-1em">'+szLegend+'</div>';
		if (0){
			szHtml += '<div id="map-legend-delete" style="position:absolute;top:0.2em;right:-1em;border:solid 1px;padding:0.9em 1.2em 1.2em 1.2em;border-radius:2em">';
			szHtml += '<b><a href="javascript:ixmaps.legend.removeExternalLegend(\'' + "" + '\')" style="text-decoration:none">...</a></b></div>';
		}
        $("#map-legend").html(szHtml);
        $("#map-legend-body").css("pointer-events","all");
        $("#map-legend-delete").css("pointer-events","all");
        $("#map-legend").show();

    };
   ixmaps.legend.removeExternalLegend = function (szUrl) {
        var szHtml = '<div id="map-legend-body" class="map-legend-body" style="margin-top:-1em"></div>';
        szHtml += '<div id="map-legend-delete" style="position:absolute;top:0.4em;right:-1em;border:solid 1px;padding:1.1em 0.8em 0.9em 0.8em;border-radius:2em">';
        szHtml += '<b><a href="javascript:ixmaps.legend.loadExternalLegend(\'' + szUrl + '\')" style="text-decoration:none"><span class="icon icon-menu theme-tool-button" ></span></a></b></div>';
        $("#map-legend").html(szHtml);
        ixmaps.legend.url = null;
        ixmaps.legend.externalLegend = false;
        var idA = ixmaps.getThemes();
        ixmaps.htmlgui_onDrawTheme(idA[idA.length - 1].szId);
    }

    // ============================================
    // event handler
    // ============================================

    var old_onNewTheme = ixmaps.htmlgui_onNewTheme;

    ixmaps.htmlgui_onNewTheme = function (szId) {

        try {
            old_onNewTheme(szId);
        } catch (e) {}

        var themeObj = ixmaps.getThemeObj(szId);
        if (!themeObj) {
            return;
        }

        if (themeObj.szFlag.match(/SUBTHEME/) || themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/)) {
            return;
        }
        ixmaps.legend.externalLegend = false;
        $("#map-legend").html("<h3 id='map-legend-title' class='loading-text' style='font-size:20px;line-height:1.3em;margin-top:1px;padding:0.5em 1em;border:solid #444 0.5px;border-radius:5px'>" + (themeObj.szSplash || "loading ...") + "</h3>");
        $("#map-legend").show();
    }

    // --------------------------------------------------
    // intercept theme creation, to make the theme legend
    // --------------------------------------------------

    var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;

    ixmaps.htmlgui_onDrawTheme = function (szId) {

        try {
            old_onDrawTheme(szId);
        } catch (e) {}

        // GR 18.12.2018
        ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId());
		
        if (ixmaps.legend.url && ( (ixmaps.legend.url.substr(0,4) == "http") || (ixmaps.legend.url.substr(0,6) == "../../") ) ) {
            if ( 1 || !ixmaps.legend.externalLegend) {
                ixmaps.legend.loadExternalLegend(ixmaps.legend.url);
                ixmaps.legend.externalLegend = true;
            }
			return;
        }else
        if (ixmaps.legend.url && ixmaps.legend.url.length ) {
            if ( 1 || !ixmaps.legend.externalLegend) {
                ixmaps.legend.setExternalLegend(ixmaps.legend.url);
                ixmaps.legend.externalLegend = true;
            }
			return;
		}

        var themeObj = ixmaps.getThemeObj(szId);
        if (!themeObj) {
            return;
        }

        if (themeObj.szFlag.match(/SUBTHEME/) || themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/)) {
            return;
        }

		// if CLIP theme, don't actualize legend on every frame
		//
		if(themeObj.szFlag.match(/\bCLIP\b/) && themeObj.nActualFrame){
			var actualFrame = themeObj.nActualFrame;
			var szFrameText = themeObj.szXaxisA[themeObj.nActualFrame];
			$("#time-span").html(szFrameText);
			$("#myRange").attr("value",actualFrame);
			return;
		}

		$("#map-legend").html("");
		
        // in case szId is not giveb, set it from themeObj
        szId = szId || themeObj.szId;

        var szHtml = "";
		
		if (!ixmaps.legend.externalLegend){			
			szHtml += "<h3 id='map-legend-title' style='pointer-events:all'>" + themeObj.szTitle || "Color Legend";
			// theme filter
			if (themeObj.szFilter) {
				//szHtml += "<p class='legend-filter-text' style='font-size:11px'>&nbsp;"+themeObj.szFilter+"</p>";
			}
			szHtml += "</h3>";

			szHtml += "<h4 id='map-legend-snippet' style='pointer-events:all'>" + (themeObj.szSnippet || "") + "</h4>";
		}

        szHtml += "<div id='map-legend-body' >";
		
 		if ( $("#map-legend").attr("data-align") == "left" ){
        	szHtml += "<div style='max-height:"+window.innerHeight+"px;overflow:hidden;margin-right:24px;padding-right:1em;'>";
		}else{
        	szHtml += "<div style='max-height:300px;overflow:auto;margin-right:24px;padding-right:1em;'>";
		}	
        szHtml += ixmaps.legend.makeColorLegendHTML(szId, "generic", "compact");
        szHtml += "</div>";
        //szHtml += "<br>";

        //szHtml += ixmaps.legend.makeLegendButtons(szId,"generic");
        //szHtml += "<br>";


        szHtml += "</div>";

        if (themeObj.szDescription) {
           szHtml += "<div style='height:0em;'></div>";
           szHtml += "<div id='map-legend-description' style='pointer-events:all'>" + (themeObj.szDescription || "") + "</div>";
        } else {
            szHtml += "<div style='height:0.4em'></div>";
        }

		// ---------------------------------------------------------------
		// make slider 
		// ---------------------------------------------------------------
		
		// if time field is defined, make time slider 
		// ---------------------------------------------------------------
		var uMin = 10000000000000;
		var uMax = -100000000000000;
		if (themeObj.szTimeField){
			szHtml += "<h4 style='margin-top:0.5em;margin-bottom:0.5em'>time <span id='time-span'></span></h4>";
			for ( a in themeObj.itemA ){
				var uTime = new Date(themeObj.itemA[a].szTime).getTime();
				uMax = Math.max(uMax,uTime);
				uMin = Math.min(uMin,uTime);
			}
	  		szHtml += "<div style='margin-bottom:0.8em'><input type='range' min='"+uMin+"' max='"+uMax+"' value='0' class='slider' id='myRange'></div>";
		}
		
 		// if theme is CLIP, make clip frame slider 
		// ---------------------------------------------------------------
		if (themeObj.szFlag.match(/\bCLIP\b/)){
			var clipFrames = themeObj.nClipFrames;
			var actualFrame = themeObj.nActualFrame;
			var szFrameText = themeObj.szXaxisA[themeObj.nActualFrame];
			szHtml += "<h4 style='margin-top:0.5em;margin-bottom:0.5em'>frame <span id='time-span'>"+szFrameText+"</span></h4>";
			szHtml += "<div style='margin-left:-0.2em;margin-bottom:0.9em;pointer-events:all'>"
			if(themeObj.fClipPause){
				szHtml += "<a id='clipbutton' href='javascript:ixmaps.legend.toggleClipState(true);' title='start clip'>";
				szHtml += "<i id='clipbuttonicon' class='fa fa-play fa-fw' style='color:#666666;'></i>";
				szHtml += "</a>";
			}else{
				szHtml += "<a id='clipbutton' href='javascript:ixmaps.legend.toggleClipState(false);' title='pause clip'>";
				szHtml += "<i id='clipbuttonicon' class='fa fa-pause fa-fw' style='color:#666666;vertical-align:-10%'></i>";
				szHtml += "</a>";
			}
			szHtml += "<input type='range' min='"+0+"' max='"+(clipFrames-1)+"' value='"+actualFrame+"' class='slider' id='myRange' style='margin-left:2em;width:50%;margin-top:-1em'>";
			szHtml += "</div>"
			
			ixmaps.legend.toggleClipState = function(state){
				if (state){
					ixmaps.startThemeClip(null);
					$("#clipbutton").attr("href","javascript:ixmaps.legend.toggleClipState(false);");
					$("#clipbuttonicon").removeClass("fa-play");
					$("#clipbuttonicon").addClass("fa-pause");
				}else{
					ixmaps.pauseThemeClip(null);
					$("#clipbutton").attr("href","javascript:ixmaps.legend.toggleClipState(true);");
					$("#clipbuttonicon").removeClass("fa-pause");
					$("#clipbuttonicon").addClass("fa-play");
				}
			}
		}
		
		// ---------------------------------------------------------------
		// ---------------------------------------------------------------
		
		szHtml += "<div id='map-legend-footer' >";
        szHtml += ixmaps.htmlgui_onLegendFooter ? ixmaps.htmlgui_onLegendFooter(szId, themeObj, ixmaps.getThemeDefinitionObj(szId)) : "";
		szHtml += "</div>";

		szLegendPane = "<div id='map-legend-pane' class='map-legend-pane'>" +
            "<a href='javascript:__toggleLegendPane()'>" +
            "<div id='legend-type-switch'>" +
            "..." +
            "</div>" +
            "</a>" +
            "<div>" +
            "<div class='row'>" +
            "<div class='col-lg-12 col-md-12 col-xs-0'>" +
            "<div id='map-legend-content'>" + szHtml + "</div>" +
            "</div>" +
            "</div>" +
            "</div>";

        szLegendPane += "<a href='javascript:__toggleLegendPane(0);'>" +
            "<div id='legend-type-switch-bottom'>" +
            "<i id='map-legend-pane-switch' class='icon shareIcon blackHover icon-arrow-down2' title='close' style='color:#888;pointer-events:none;' tabindex='-1'></i>" +
            "</div>" +
            "</a>";

		if ( $("#map-legend").attr("data-align") == "left" ){
        	$("#map-legend").append(szHtml);
			$("#map-legend").css("pointer-events","none");
		}else{
       		$("#map-legend").html(szLegendPane);
		}

		// ---------------------------------------------------------------
		// init the slider if created
		// ---------------------------------------------------------------

		// init time frame slider
		// ------------------------
		if (themeObj.szTimeField){
			var slider = document.getElementById("myRange");
			// Update the current slider value (each time you drag the slider handle)
			slider.oninput = function() {
				var x = new Date(Number(this.value));
				if (this.value == uMin ){
					ixmaps.setThemeTimeFrame(null,uMin, uMax);
					$("#time-span").html("");
				}else{
					ixmaps.setThemeTimeFrame(null,this.value-(1000*60*60*24),this.value);
					$("#time-span").html(x.toLocaleDateString()+"-"+x.toLocaleTimeString());
				}
			}
			slider.onmouseup = function(){
				//ixmaps.setClipFrame(Number(this.value));
			}
			slider.onchange = function(){
				console.log(this.value);
			}
		}
		
		// init clip frame slider
		// ------------------------
		if (themeObj.szFlag.match(/\bCLIP\b/) ){
			var slider = document.getElementById("myRange");
			// Update the current slider value (each time you drag the slider handle)
			slider.oninput = function() {
				__noSlideRefresh = true;
				ixmaps.legend.toggleClipState(false);
				ixmaps.setThemeClipFrame(null,this.value);
				$("#time-span").html(themeObj.szXaxisA[this.value]);
			}
			slider.onmouseup = function(){
				__noSlideRefresh = false;
				//ixmaps.setClipFrame(Number(this.value));
			}
			slider.onchange = function(){
				console.log(this.value);
			}
		}
		
        __actualThemeId = szId;

        __switchLegendPanes();
		
		ixmaps.legendType = "theme";
    };

    // --------------------------------------------------
    // intercept theme deletion, to remove active themes mark
    // --------------------------------------------------

    var old_onRemoveTheme = ixmaps.htmlgui_onRemoveTheme;
    ixmaps.htmlgui_onRemoveTheme = function (szId) {

        try {
            old_onRemoveTheme(szId);
        } catch (e) {}

        if ((!__actualThemeId || (__actualThemeId == szId)) && !ixmaps.legend.externalLegend) {
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

    // define initial/actual legend state (0=title only, 1=colorlegend, 2=footer/tools)
    ixmaps.legendState = 0;

    __actualThemeId = null;

    __switchLegendPanes = function (state) {

        ixmaps.legendState = (typeof (state) != 'undefined') ? state : ixmaps.legendState;

        $("#map-legend-pane-switch").removeClass("icon-arrow-down2");
        $("#map-legend-pane-switch").addClass("icon-arrow-up2");

        if (ixmaps.legendState == 2) {
            $("#map-legend-body").show();
            $("#map-legend-snippet").show();
            $("#map-legend-footer").show();
            $("#map-legend-pane-switch").parent().show();
        } else
        if (ixmaps.legendState == 1) {
            $("#map-legend-body").show();
            $("#map-legend-snippet").show();
            $("#map-legend-footer").hide();
            $("#map-legend-pane-switch").show();
        } else {
            $("#map-legend-body").hide();
            $("#map-legend-snippet").hide();
            $("#map-legend-footer").hide();
            $("#map-legend-pane-switch").parent().hide();
        }
        $("#map-legend").slideDown();
    }

    /**
     * open/close the legend parts
     * @type void
     */
    __toggleLegendPane = function (i) {

        if (i == 0) {
            __switchLegendPanes(-1);
        } else
        if (ixmaps.legendState == 2) {
            if (ixmaps.makeLayerLegend()){
				ixmaps.legendType = "layer";
			}else{
				// switch to next theme (if we have more than one)
				__nextLegendTheme();
				ixmaps.htmlgui_onDrawTheme(__actualThemeId);
				__switchLegendPanes();
			}
        } else
            // switch back to theme legend
            if ((i == -1) && __actualThemeId) {
				// switch to next theme (if we have more than one)
				__nextLegendTheme();
                ixmaps.htmlgui_onDrawTheme(__actualThemeId);
                __switchLegendPanes(0);
				ixmaps.legendType = "theme";
            } else {
                i = 0;
            }

        ixmaps.legendState += i || 0;

        if ($("#map-legend-footer").height()) {
            ixmaps.legendState = ++ixmaps.legendState % 3;
        } else {
            ixmaps.legendState = ++ixmaps.legendState % 2;
        }

		__switchLegendPanes();

    };
	
    /**
     * get the next theme to display in Legend
     * @type void
     */
	__nextLegendTheme = function(){
		var szThemeA = ixmaps.getThemes();
		for ( var t = 0; t < szThemeA.length; t++ ){
			if ( szThemeA[t].szId == __actualThemeId ){
				__actualThemeId = szThemeA[(++t)%szThemeA.length].szId;
			}
		}
        var themeObj = ixmaps.getThemeObj(__actualThemeId);
        if (themeObj.szFlag.match(/SUBTHEME/) || themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/)) {
            __nextLegendTheme();
        }
	}

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
    var old_setMapTypeBG = ixmaps.htmlgui_setMapTypeBG;
    ixmaps.htmlgui_setMapTypeBG = function (szId) {

        if (old_setMapTypeBG) {
            old_setMapTypeBG(szId);
        }

        $("#css-modifier-container").remove();

        if (szId.match(/dark/i) || szId.match(/black/i)) {

            changeCss(".map-legend-body", "color:#fff");

            changeCss(".map-legend-pane:before", "background:#111");
            changeCss(".map-legend-pane:before", "border-color:#444");
            changeCss(".map-legend-pane", "color:#fff");
            changeCss(".map-legend-count", "color:#ddd");
            changeCss(".map-legend-switch", "color:#888");

            $("#map-legend-pane-switch").attr("style", "color:#888");

            changeCss(".btn-default", "color:#888");
            changeCss(".btn-default", "border-color:#666");
            changeCss(".btn-default", "background-color:#333");

            changeCss(".btn-default.active", "color:#888");
            changeCss(".btn-default.focus", "color:#888");
            changeCss(".btn-default:active", "color:#888");
            changeCss(".btn-default:focus", "color:#888");

            changeCss(".btn-default.active", "background-color:#333");
            changeCss(".btn-default.focus", "background-color:#333");
            changeCss(".btn-default:active", "background-color:#333");
            changeCss(".btn-default:focus", "background-color:#333");

            changeCss(".btn-default.active", "outline:none");
            changeCss(".btn-default.focus", "outline:none");
            changeCss(".btn-default:active", "outline:none");
            changeCss(".btn-default:focus", "outline:none");

            changeCss("tr.theme-legend-item-selected", "background:#444");

            changeCss("#legend-type-switch", "background-color:#111");
            changeCss("#legend-type-switch", "border-color:#444");

            changeCss(".loading-text", "background-color:rgba(0,0,0,0.5)");
            changeCss(".loading-text", "color:#d8d8d8");

        } else {
            changeCss(".loading-text", "background-color:rgba(255,255,255,0.5)");
            changeCss(".loading-text", "color:#666");
       }
    };

    /**
     * end of namespace
     */

})();

// -----------------------------
// EOF
// -----------------------------

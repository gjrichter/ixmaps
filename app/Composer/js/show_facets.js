/**
 * @fileoverview This file provides functions to list filter facets
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0.0
 * @date 2025-01.01
 * @description 
 * @license
 * This software is licensed under the MIT License.
 *
 * Copyright (c) 2025 Guenter Richter
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

ixmaps = ixmaps || {};
ixmaps.data = ixmaps.data || {};

(function () {

	// ===========================================
	//
	// h e l p e r
	//
	// ===========================================

	/**
	 * Create a distribution of data values for histograms  
	 * @param szMapDiv the id of the div, where to create the SVG map
	 * @param options javascript object with the creation options
	 * @type object
	 * @return the new ixmaps object
	 */
	var __getScatterArray = function (data, nMin, nMax, nTicks, szFlag) {

		var nValuePos = 0;
		var nCountMax = 0;
		var dValue = 0;
		var a;

		if (szFlag.match(/LOG/)) {
			dValue = nMin ? 0 : 0.1;
			nMin = Math.log(nMin + dValue);
			nMax = Math.log(nMax + dValue);
		}

		var nPop = (nMax - nMin) / (nTicks - 1);

		var nPopA = [];
		var nTickA = [];
		var nTickVal = nMin;
		for (var i = 0; i < nTicks + 1; i++) {
			nPopA[i] = 0;
			nTickA[i] = (szFlag.match(/LOG/) ? (Math.exp(nTickVal)) : nTickVal);
			nTickVal += nPop

		}
		data.forEach(function (value) {
			var xValue = value;
			if (typeof (xValue) == 'number') {
				if (szFlag.match(/LOG/)) {
					xValue = Math.log(xValue + dValue);
				}
				nPos = Math.max(0, Math.min(nTicks - 1, Math.floor((xValue - nMin) / nPop)));
				nPopA[nPos]++;
				nCountMax = Math.max(nCountMax, nPopA[nPos]);
			}
		});

		return {
			min: nTickA,
			count: nPopA
		};
	};

	// get unique values array via filter
	var __onlyUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	// get unique values array via named array
	var __getUniqueValues = function (a) {
		var u = [];
		for (var i in a) {
			u[String(a[i])] = 1;
		}
		var retA = [];
		for (var v in u) {
			retA.push(v);
		}
		return retA;
	};

	// get numbers from formatted values like 235 678.98 or 235.678,98
	var __scanValue = function (nValue) {
		if (String(nValue).match(/:/)) {
			return "date";
		} else
			// strips blanks inside numbers (e.g. 1 234 456 --> 1234456)
			if (String(nValue).match(/,/)) {
				return parseFloat(String(nValue).replace(/\./gi, "").replace(/,/gi, "."));
			} else {
				return parseFloat(String(nValue).replace(/ /gi, ""));
			}
	};

	
	const hex2rgba = (hex, alpha = 1) => {
	  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
	  return `rgba(${r},${g},${b},${alpha})`;
	};	
	
	
	
	// ===========================================
	//
	// facet filter handling 
	//
	// ===========================================
    
    __getFacetFilterA = function (dataName){
        
        let szFilter = dataA[dataName].facetsFilter;
        let facetFilterA = [];
    
		if (szFilter && szFilter.match(/WHERE/)) {
            // get filter parts
            // ----------------
            let szPartsA = szFilter.split('WHERE ')[1].split('AND');
            // test if BETWEEN x AND y and join two parts around AND
            for ( var i=0; i<szPartsA.length; i++ ){
                if ( szPartsA[i].match(/BETWEEN/) ){
                    szPartsA[i] = szPartsA[i] + "AND" + szPartsA[i+1];
                    szPartsA.splice(i+1,1);
                }
            }
            // set filter parts
            // ----------------
            szPartsA.forEach(function(x){
                facetFilterA.push(x);
            });
        }
        return facetFilterA;
    }
    

	// -----------------------------------------------
	// set the selected facet filter
	// if this filter is already active, clear filter
	// -----------------------------------------------
	__setFacetFilter = function (szFilter, dataName) {
        
        let __facetFilterA = __getFacetFilterA(dataName);

		// if new filter given, add to filter array (delete existent filter of the same data column)
		if (szFilter.length) {

			// get filter without WHERE 
			szFilter = szFilter.split(/WHERE /)[1];

			// add, or remove filter, if exists  
			__facetFilterA = __facetFilterA.filter(function (value, index, self) {
				return !(szFilter.split(/"/)[1] == value.split(/"/)[1]);
			});

			__facetFilterA.push(szFilter);
		}

		// make final filter from actual parts stored in __facetFilterA
		szFilter = __facetFilterA.length ? ("WHERE " + __facetFilterA.join(" AND ")) : null;

        ixmaps.data.facetsCallback(dataName, szFilter);
	};

	// -------------------------------------------------------------------------
	// set a range filter for a data field
	// if a range is already active on this data field, remove this range before
	// --------------------------------------------------------------------------
	__setRangeFilter = function (szField, szRange, min, max, dataName) {
		rangeA = szRange.split(",");
		let szFilter = "WHERE \"" + szField + "\" BETWEEN " + rangeA[0] + " AND " + rangeA[1];
		__setFacetFilter(szFilter,dataName);
	};

	// -------------------------------------------------------------------------
	// set a input field filter
	// --------------------------------------------------------------------------
	__setFilter = function (szField, szFilter, dataName) {
		let szQuery = "WHERE \"" + szField + "\" like \"" + szFilter + "\"";
		__setFacetFilter(szFilter.length ? szQuery : "", dataName);
	};

	// -----------------------------------------------
	// remove all filter of one data field
	// -----------------------------------------------
	__removeFacets = function (szField, dataName) {
    
        let __facetFilterA = __getFacetFilterA(dataName);
    
		// remove filter for szField
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		// make final filter from actual parts stored in __facetFilterA
		szFilter = __facetFilterA.length ? ("WHERE " + __facetFilterA.join(" AND ")) : null;

        ixmaps.data.facetsCallback(dataName, szFilter);
	};

	// -----------------------------------------------
	// set word cloud field name
	// -----------------------------------------------
    
	let __szFilter = null;
	let __szDiv = null;
	let __facetsA = null;
    let __dataObj = null;
    let __dataName = null;
	let __worldCloudField = null;
    
    __makeWordCloud = function (szField) {
		if ( __worldCloudField == szField ){
			__worldCloudField = null;	
		}else{
			__worldCloudField = szField;
		}
		ixmaps.data.showFacets(__szFilter, __szDiv, __facetsA, __dataObj, __dataName);
	};
	
	var __makeHistogram = function (id, szRange) {
        
        let facetsA = __facetsA;

		var rangeA = szRange.split(",");

		var facet = null;

		for (i in facetsA) {
 			if (facetsA[i].safeId == id) {
				facet = facetsA[i];
			}
		}
        
		if (facet && facet.data) {

			var objThemeDefinition = null; //ixmaps.getThemeDefinitionObj();
			var objTheme = null; //ixmaps.getThemeObj();

			var fOnMap = false;
			if (objThemeDefinition && (objThemeDefinition.field == facet.id)) {
				fOnMap = true;
			}
            
			var min = __rangesA[facet.id].min;
			var max = __rangesA[facet.id].max;
			var sliderId = id;
			var nTicks = Math.min(40, (max - min + 1));
			nTicks = (nTicks >= 5) ? nTicks : 40;
            
 			var nStep = pop = (max - min) / nTicks;
			if (nStep > 1 && nStep < 2) {
				nTicks = max - min + 1;
			}

			var szScale = ((max - min) < 100000) ? "" : "LOG";
			var fDiscret = (nTicks/(max - min) >= 1);
            
 			var barA = __getScatterArray(__rangesA[facet.id].data, min, max, nTicks, szScale);
            
			var maxHeight = 0;
			barA.count.forEach(function (height) {
				maxHeight = Math.max(maxHeight, height);
			});
			var scale = 75 / maxHeight;
			var width = 210 / nTicks;
			szHtml = "";

			for (b = 0; b < barA.count.length - 1; b++) {
				var height = barA.count[b];
				var bMin = barA.min[b];
				var bMax = fDiscret ? barA.min[b] : barA.min[b + 1];
				var color = ((bMax >= rangeA[0]) && (bMin <= rangeA[1])) ? "#888" : "#ddd";

				if (fOnMap) {
					//color = objTheme.partsA[0].color;
					objTheme.partsA.forEach(function (part) {
						if (bMin >= part.min) {
							color = part.color;
						}
					});
				}
				var szFilter = "ixmaps.filterThemeItems(null, null, '', { field: '" + facet.id + "', min: " + bMin + ", max: " + bMax + " }";
				var szHighlight = "$(this).css('background','#880000');" + szFilter;
				var szClearHighlight = "$(this).css('background','');ixmaps.filterThemeItems(null,null,'','remove');"
                var szSetFilter = "__setRangeFilter('" + facet.id + "',  '"+(bMin+","+bMax)+"', 0, 1000, '"+__dataName+"')";
				bMin = ixmaps.formatValue(bMin, 0, "BLANK");
				bMax = ixmaps.formatValue(bMax, 0, "BLANK");
				szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (bMin==bMax?bMax:(bMin + ' - ' + bMax)) + "' onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + " onclick=\""+szSetFilter+"\"></div>";
			}
			szHtml += "</div>";
            
			$("#" + sliderId + "histogram").html(szHtml);
		}
	};

	__oldFilter = "";

	// ---------------------------------------------------
	// highlight map theme items by query
	// select data by query and create list of theme items 
	// highlight this item on the map
	// ---------------------------------------------------

	__HighlightFacetItems = function (szField, szValue) {
		var objTheme = ixmaps.getThemeObj();
		__oldFilter = objTheme.szFilter;
		if (objTheme && (objTheme.szFlag.match(/AGGREGATE/) || objTheme.szFlag.match(/MULTI/))) {
			if (__oldFilter.match(/WHERE/)) {
				ixmaps.filterThemeItems(null, null, __oldFilter + ' AND "' + szField + '" = "' + szValue + '"', 'set');
			} else {
				ixmaps.filterThemeItems(null, null, 'WHERE "' + szField + '" = "' + szValue + '"', 'set');
			}
		} else {
			ixmaps.filterThemeItems(null, null, "", {
				field: szField,
				txt: szValue
			});
		}
		return;

	};

	// ===========================================
	// ===========================================
	//
	// create the html facet list
	//
	// ===========================================
	// ===========================================

	ixmaps.data.showFacets = function (szFilter, szDiv, facetsA, dataObj, dataName) {
        
 		__szFilter = szFilter;
		__szDiv = szDiv;
		__facetsA = facetsA;
		__dataObj = dataObj;
		__dataName = dataName;
		
		var fTest = true;
		var sliderA = [];

		var objThemeDefinition = null; //ixmaps.data.objThemeDefinition;
		var objTheme = null; //ixmaps.data.objTheme;

		var szHtml = "";
		szHtml += "<div id='list-facets' class='list-group' style='width:100%;margin-bottom:5em;padding-right:0.4em'>";

		$("#" + (szDiv || "facets")).html(szHtml);

		// create an array of the filter to pass them to the executing function
		// to avoid problems with special characters " and '
		__queryA = [];

		// loop over facets array and create HTML top show the facets
		//

        let __facetFilterA = [];
        
 		if (szFilter && szFilter.match(/WHERE/)) {
            // get filter parts
            // ----------------
            var szPartsA = szFilter.split('WHERE ')[1].split('AND');
            // test if BETWEEN x AND y and join two parts around AND
            for ( i=0; i<szPartsA.length; i++ ){
                if ( szPartsA[i].match(/BETWEEN/) ){
                    szPartsA[i] = szPartsA[i] + "AND" + szPartsA[i+1];
                    szPartsA.splice(i+1,1);
                }
            }
            // set filter parts
            // ----------------
            szPartsA.forEach(function(x){
                __facetFilterA.push(x);
            });
        }
       
		for (var i = 0; i < facetsA.length; i++) {
            
			var fActiveFacet = false;
			var szActiveFilter = null;

			// replace all non word characters with underscore
			var szSafeId = facetsA[i].id.replace(/ |\W/g, "_");
            facetsA[i].safeId = szSafeId;
            
			__facetFilterA.forEach(function (szFilter, index) {
				if (szFilter.split("\"")[1] == facetsA[i].id) {
					fActiveFacet = true;
					szActiveFilter = szFilter;
				}
			});

			szHtml += fActiveFacet ? "<div class='facet-active'>" : "<div class='facet'>";

			// ------------------------------
            //
			// facet header
            //
			// ------------------------------

			var headerClass = fActiveFacet ? "facet-header active" : "facet-header";

			var szMin = ixmaps.formatValue(facetsA[i].min, 0, "BLANK");
			var szMax = ixmaps.formatValue(facetsA[i].max, 0, "BLANK");

			szHtml += fActiveFacet ? "<a href='javascript:__removeFacets(\"" + (facetsA[i].id) + "\",\"" +dataName+ "\");' style='color:white' >" : "";
			szHtml += "<div class='"+headerClass+"'>";
            
			szHtml += facetsA[i].id;

			if (facetsA[i].data &&
				facetsA[i].data.length &&
				!isNaN(facetsA[i].min) &&
				!isNaN(facetsA[i].max) &&
				(facetsA[i].min < facetsA[i].max)) {
				szHtml += (typeof (facetsA[i].min) != "undefined") ? ((facetsA[i].min != facetsA[i].max) ? (": " + szMin + " - " + szMax) : (": " + szMin)) : "";
			}

			szHtml += fActiveFacet ? "<span style='float:right;margin-right:0em;padding-top:0em;'><i class='icon shareIcon share_bitly icon-cancel-circle' title='Share a short link' tabindex='-1'></i></span>" : "";
			
			if ((facetsA[i].type == "textual") && !facetsA[i].values){
				szHtml += "<a href='javascript:__makeWordCloud(\"" + (facetsA[i].id) + "\")'><span style='float:right;margin-right:0em;padding-top:0em;color:#888888'><i class='icon shareIcon share_bitly icon-cloud' title='Share a short link' tabindex='-1'></i></span></a>";
			}
			
			szHtml += "</div>";
			szHtml += fActiveFacet ? "</a>" : "";

			if (facetsA[i].type == "textual" || facetsA[i].type == "categorical") {
				var placeholder = "Cerca ..." + ((!facetsA[i].values) ? (" (e.g. " + (facetsA[i].example || " ") + ")") : "");
				var value = "";
				if (fActiveFacet) {
					value = placeholder = szActiveFilter.split("\"")[3];
				}
				if ( 1 || !facetsA[i] || !facetsA[i].values || facetsA[i].values.length > 10){
					szHtml += '<div class="input-group">';
					szHtml += '<input id="' + (szSafeId + "query") + '" type="text" class="form-control" style="background:transparent;border:none" value="' + value + '" placeholder="' + placeholder + '"';
					szHtml += 'onKeyUp="if(event.which == 13){var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value,\'' +dataName+'\');}">';
					szHtml += '<span class="input-group-btn" style="float:right;margin-left:-0.5em;margin-right:0.2em;">';
					szHtml += '<button class="btn btn-search" style="border:none" type="button" onclick="var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value,\'' +dataName+'\');"><i class="icon shareIcon share_bitly icon-search" title="Search by text" tabindex="-1"></i> </button>';
					szHtml += '</span></input>';
					szHtml += '</div>'
				}else{
					szHtml += '<div class="input-group" >';
					szHtml += '</div>'
				}
				if ( facetsA[i].id == __worldCloudField ){
					szTarget = "thisismywordcloud"+facetsA[i].id.replace(/[\W_]/g, "_");
					szHtml += "<div id='"+szTarget+"'><div style='width:100%;text-align:center'><i class='icon shareIcon share_bitly icon-cloud' title='Share a short link' style='color:#888888;font-size:36px' tabindex='-1'></i><br><img src='./resources/images/loading_blue.gif' style='height:48px'></div></div>";
                    setTimeout(()=>{ixmaps.data.makeWordCloud(dataObj,__worldCloudField,szTarget,dataName)},100);
				}
			}

			// ------------------------------------
            //
			// make facet content, different types
            //
			// ------------------------------------
            
            var szHighlight = "$(this).css(\"border\",\"solid #ffffff 0.5px\");"; 
            var szClearHighlight = "$(this).css(\"border\",\"\");"; 
            if (facetsA[i].type == "numeric" ) {
//			if (typeof (facetsA[i].min) != "undefined" &&
//				!isNaN(facetsA[i].min) &&
//				!isNaN(facetsA[i].max) &&
//				(facetsA[i].min < facetsA[i].max)) {

				// ---------------------------------
				// type A
				// continous value facet
				// make min/max slider
				// ---------------------------------
				
				if (!__rangesA[facetsA[i].id] || !fActiveFacet) {
					__rangesA[facetsA[i].id] = {
						min: facetsA[i].min,
						max: facetsA[i].max,
						data: facetsA[i].data,
						id: facetsA[i].id
					};
				}

				var min = __rangesA[facetsA[i].id].min;
				var max = __rangesA[facetsA[i].id].max;
				var szMin = ixmaps.formatValue(__rangesA[facetsA[i].id].min, 0, "BLANK");
				var szMax = ixmaps.formatValue(__rangesA[facetsA[i].id].max, 0, "BLANK");

				var href = "#";
				var bgColor = "#ffffff";
				var szCount = "";

				// make histogram
				// ---------------------------------

				if (facetsA[i].data) {

					var fOnMap = false;
					if (objThemeDefinition && (objThemeDefinition.field == facetsA[i].id)) {
						fOnMap = true;
					}

					var sliderId = szSafeId;
					var nTicks = Math.min(40, (max - min + 1));
					nTicks = (nTicks >= 5) ? nTicks : 40;

					var nStep = pop = (max - min) / nTicks;
					if (nStep > 1 && nStep < 2) {
						nTicks = max - min;
					}

					var szScale = ((max - min) < 100000) ? "" : "LOG";

					szHtml += '<div style="background:#ffffff;margin-top:0.4em;border-radius:5px;">'
					szHtml += '<div id="' + sliderId + 'histogram" style="padding-top:2em;min-height:120px">';
					szHtml += "</div>";

					// make slider
					// ---------------------------------

					sliderA.push({
						id: sliderId,
						field: facetsA[i].id,
						scale: szScale,
						min: min,
						max: max,
						ticks: nTicks,
                        dataName: dataName
					});
                    szHtml += '<div style="margin: -0.5em 0em 0em 2em;border-radius:5px;height:2.5em;padding-top:0.5em"><input id="' + sliderId + '" type="text" class="span2" style="border:none" value="" data-slider-min="' + min + '" data-slider-max="' + max + '" data-slider-step="5" data-slider-value="[' + facetsA[i].min + ',' + facetsA[i].max + ']"/> </div><div class="span2" ><span class="minvalue" style="float:left">' + szMin + '</span><span class="maxvalue" style="float:right">' + szMax + '</span> </div>';

					szHtml += '</div>'
				}
			} else
			if (facetsA[i].values) {

				// ---------------------------------
				// type B
				// unique value facet
				// ---------------------------------
				
				szHtml += '<div>'

				// if more than 20 items, clip list to 10
				// --------------------------------------
				var maxII = (facetsA[i].values.length < 12) ? facetsA[i].values.length : 10;
                var maxAll = Math.min(1000,facetsA[i].values.length);
				for (var ii = 0; ii < maxAll; ii++) {
					
					if (facetsA[i].values[ii] != " ") {

						// make the facet filter 
						var szQuery = "WHERE \"" + facetsA[i].id + "\" = \"" + facetsA[i].values[ii] + "\"";

						// make href, pass filter by filter array to avoid " or ' conflicts
						__queryA.push(szQuery);
						var href = "javascript:__setFacetFilter(__queryA[" + (__queryA.length - 1) + "],\'"+ dataName +"\');";

						// how often is the value in the column
						var nCount = facetsA[i].valuesCount ? facetsA[i].valuesCount[facetsA[i].values[ii]] : null;
						var nMaxCount = facetsA[i].nValuesSum || facetsA[i].nCount;

						var bgColor = "";
						var szCount = ixmaps.formatValue(nCount, 0, "BLANK") + " " + (ixmaps.data.fShowFacetValues ? ((objTheme?objTheme.szUnits:"") || "") : ""); //String(nCount || "");
						
						var szText = facetsA[i].values[ii];
						
						if (objThemeDefinition && (objThemeDefinition.field == facetsA[i].id)) {
							bgColor = hex2rgba(objTheme.colorScheme[objTheme.nStringToValueA[facetsA[i].values[ii]] - 1],0.7);
							if ( objTheme.szLabelA && objTheme.szValuesA ){
								szText = objTheme.szLabelA[objTheme.nStringToValueA[facetsA[i].values[ii]] - 1];
							}
						}

						// facet button with one unique value
						// -----------------------------------
 						szHtml += '<a href="' + href + '">';
						szHtml += '<div class="input-group">';
						if (objThemeDefinition && (objThemeDefinition.field == facetsA[i].id)) {
							szHtml += '<span class="input-group-addon" id="btnGroupAddon" style="background:' + bgColor + ';"></span>';
						}
						
						if (facetsA[i].type == "textual") {
 							if (fActiveFacet) {
								value = szActiveFilter.split("\"")[3];
								if ( value ){
									value = value.replace("\/", "\\\/");
                                    valueA = value.split("|");
                                    valueA.forEach( value => {
                                         if ( value != "*" ){
                                            var szTextA = eval("szText.split(/" + value + "/i)");
                                            szText = szTextA.join("<span style='color:#000000;background:#ffff00;padding:0 0.2em;'>" + value + "</span>");
                                        }
                                    });
								}
							}
						}
						szHtml += '<button type="button" class="btn btn-block btn-primary " style="width:100%;border:none;border-bottom:solid #000000 0.1px;border-radius:0;background:'+bgColor+'"><span style="margin-left:-0.5em;float:left;white-space:normal;text-align:left;margin-top:0.2em">' + szText + '</span><span class="facet-value-count pull-right" onmouseover=\'' + szHighlight + '\' onmouseout=\'' + szClearHighlight + '\'>' + szCount + '</span></button>';

						var nWidth = (100 / nMaxCount * nCount);
						if (!isNaN(nWidth) && (nWidth < 100) && (facetsA[i].uniqueValues > 2)) {
							szHtml += '<div style="position:relative;top:3px;left:0.1em;background:rgba(208,208,208,1);line-height:0.4em;width:' + nWidth + '%;border-radius:0 0.5em 0.5em 0">&nbsp;</div>';
						}

						szHtml += '</div>';
						szHtml += '</a>';
					}

					// clip list to max itema
					// --------------------------------------
					if (ii == maxII) {
						szHtml += '</div>';
						szHtml += '<div id="' + (szSafeId + "plus") + '" style="display:none">';
					}

				}
				szHtml += '</div>';
				szHtml += '<div>';

				// if list clipped, make butto to expand 
				// --------------------------------------
				if (facetsA[i].values.length > maxII) {
					szHtml += '<a ><button type="button" class="btn btn-default " style="margin-top:0.5em; padding:0.2em 0.5em" onclick="$(this).hide();$(\'#' + (szSafeId + "plus") + '\').toggle();">+ ' + (facetsA[i].values.length - maxII) + '</button></a>';
				}

				szHtml += "</div>";
			} else {
				
				// facet has no property .values 
				// may be there are 0 or to many unique values when creating the facet
				//szHtml += '(too many values)';
			}
			szHtml += "</div>";
            
		}
		szHtml += "</div>";
        
		$("#" + (szDiv || "facets")).html(szHtml);
        
        // if active facet(s) - scroll first into view
         if ($(".facet-active")[0]){
            $(".facet-active")[0].scrollIntoView();
        }
        
        sliderA.forEach(function (x) {
            $("#" + x.id + "histogram").css("margin-left", ($("#" + x.id).offset().left - $("#" + x.id + "histogram").offset().left) + "px");
            __makeHistogram(x.id, $("#" + x.id).attr("data-slider-value").split('[')[1].split(']')[0]);
        });
        
        try {
            ixmaps.data.initSliders(sliderA);
        } catch (e) {
            setTimeout(() => {ixmaps.data.initSliders(sliderA)},600);
        }
        
        $('[data-toggle="tooltip"]').tooltip();
 
    };
    
    ixmaps.data.toFirstActiveFacet = (szDiv) => {
        if ($(".facet-active")[0]){
            $(".facet-active")[0].scrollIntoView();
            //let top = ($(".facet-active").offset().top);
            //alert(top);
            //$("#" + (szDiv || "facets")).scrollTop(600);
        }
    };

     ixmaps.data.initSliders = function (sliderA) {
         
       sliderA.forEach(function (x) {

           // $("#" + x.id + "histogram").css("margin-left", ($("#" + x.id).offset().left - $("#" + x.id + "histogram").offset().left) + "px");

            var nStep = ((x.max - x.min) == x.ticks) ? 1 : Math.min(1, Math.pow(10, Math.floor(Math.log((x.max - x.min) / 100))));

            var mySlider = $("#" + x.id).slider({
                step: nStep,
                tooltip_split: true,
                tooltip_position: "bottom",
                scale: (x.scale == "LOG") ? 'logarithmic' : 'linear'
            }).on("slideStop", function () {
                __setRangeFilter(x.field, $(this).val(), $(this).attr("data-slider-min"), $(this).attr("data-slider-max"), x.dataName);
            }).on("slide", function () {
                __makeHistogram($(this).attr("id"), $(this).val());
            });
            
        });
     };
	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------

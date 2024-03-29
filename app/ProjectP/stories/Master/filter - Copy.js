/** 
 * @fileoverview This file provides functions for facet filtering
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

window.ixmaps = window.ixmaps || {};
window.ixmaps.data = window.ixmaps.data || {};

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
	__getScatterArray = function (data, nMin, nMax, nTicks, szFlag) {

		var nValuePos = 0;
		var nCountMax = 0;
		var dValue = 0;
		var a;

		if (szFlag.match(/LOG/)) {
			dValue = nMin ? 0 : 0.1;
			nMin = Math.log(nMin + dValue);
			nMax = Math.log(nMax + dValue);
		}

		var nPop = (nMax - nMin) / nTicks;

		var nPopA = [];
		var nTickA = [];
		var nTickVal = nMin;
		for (var i = 0; i < nTicks + 1; i++) {
			nPopA[i] = 0;
			nTickA[i] = szFlag.match(/LOG/) ? (Math.exp(nTickVal)) : nTickVal;
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

		return { min: nTickA, count: nPopA };
	};

	// get unique values array
	__onlyUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	// get numbrs from formatted values like 235 678.98 or 235.678,98
	__scanValue = function (nValue) {
		// strips blanks inside numbers (e.g. 1 234 456 --> 1234456)
		if (String(nValue).match(/,/)) {
			return parseFloat(String(nValue).replace(/\./gi, "").replace(/,/gi, "."));
		} else {
			return parseFloat(String(nValue).replace(/ /gi, ""));
		}
	};

	// ===========================================
	//
	// facet filter handling 
	//
	// ===========================================

	__facetFilterA = [];
	__rangesA = [];

	// -----------------------------------------------
	// set the selected facet filter
	// if this filter is already active, clear filter
	// -----------------------------------------------
	__setFacetFilter = function (szFilter) {

		if (szFilter.length) {

			// store filter without WHERE 
			szfilter = szFilter.split(/WHERE /)[1];

			// add, or remove filter, if exists  
			var fDelete = false;
			__facetFilterA = __facetFilterA.filter(function (value, index, self) {
				fDelete = fDelete | (szfilter == value);
				return !(szfilter == value);
			});
			if (!fDelete) {
				__facetFilterA.push(szFilter.split(/WHERE /)[1]);
			}
		}

		// make final filter from actual parts stored in __facetFilterA
		szFilter = __facetFilterA.length ? ("WHERE " + __facetFilterA.join(" AND ")) : null;

		// show filter in input field
		$("#query").val(szFilter);

		// make new facets
		__redrawFacets(szFilter);

		// filter items on map
		var objTheme = ixmaps.getThemeObj();
		ixmaps.changeThemeStyle(objTheme.szId, "filter:" + (szFilter || " "), "set");

	};

	__redrawFacets = function (szFilter) {
		$("#facets").html('<h2 style="padding:0.2em 0.5em;background:#dddddd;border-radius:5px;color:white">refresh facets ...<img src="resources/images/bg-spinner.gif" style="display:block;margin:1em auto;height:32px"></h2>');

		setTimeout("ixmaps.data.makeFacets('" + (szFilter ? szFilter.replace(/\'/g, "\\'") : "") + "')", 100);
		if (szFilter) {
			setTimeout("$('#btn-solo-attivi').click()", 100);
		} else {
			setTimeout("$('#btn-tutti').click()", 100);
		}

	};

	// -------------------------------------------------------------------------
	// set a range filter for a data field
	// if a range is already active on this data field, remove this range before
	// --------------------------------------------------------------------------
	__setRangeFilter = function (szField, szRange, min, max) {
		rangeA = szRange.split(",");
		szFilter = "WHERE \"" + szField + "\" BETWEEN " + rangeA[0] + " AND " + rangeA[1];
		// delete filter with same field
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter(szFilter);
		/**
		if ((rangeA[0] != min) || (rangeA[1] != max)) {
			__setFacetFilter(szFilter);
		} else {
			__setFacetFilter("");
		}
		**/
	};

	// -------------------------------------------------------------------------
	// set a input field filter
	// --------------------------------------------------------------------------
	__setFilter = function (szField, szFilter) {
		szQuery = "WHERE \"" + szField + "\" is \"" + szFilter + "\"";
		// delete filter with same field
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter(szQuery);
	};

	// -----------------------------------------------
	// remove all filter of one data field
	// -----------------------------------------------
	__removeFacets = function (szField) {
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter("");
	};

	// ===========================================
	//
	// create filter facets from theme data
	//
	// ===========================================

	ixmaps.data.makeFacets = function (szFilter) {

		facetsA = [];

		var fTest = true;
		var sliderA = [];

		console.log("=== make facets ===");

		// theme
		// ------------------------------------
		var objThemeDefinition = ixmaps.getThemeDefinitionObj();
		var objTheme = ixmaps.getThemeObj();

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);

		// GR 23.02.2018 take only rows which are on the map
		// -------------------------------------------------
		var records = [];
		for ( i in objTheme.indexA ){
			if ( objTheme.itemA[objTheme.indexA[i]].dbIndex ){
				records.push(dataObj.records[objTheme.itemA[objTheme.indexA[i]].dbIndex]);
			}
			if ( objTheme.itemA[objTheme.indexA[i]].dbIndexA ){
				for ( a in objTheme.itemA[objTheme.indexA[i]].dbIndexA ) {
					records.push(dataObj.records[objTheme.itemA[objTheme.indexA[i]].dbIndexA[a]]);
				}
			}
		}
		mydata.records = records;

		// if we have already a filter on the map,
		// filter data before creating facets
		// ------------------------------------
		if (szFilter && szFilter.match(/WHERE/)) {
			mydata = mydata.select(szFilter);
		}

		// make facets from data fields
		// ----------------------------

		var a, u;
		var fields = mydata.columnNames();

		for (var i = 0; i < fields.length; i++) {

			a = mydata.column(fields[i]).values();

			// test for only numeric values
			// ----------------------------
			fNumeric = true;
			a.forEach(function (x) {
				if (isNaN(__scanValue(x))) {
					fNumeric = false;
				}
			});
			console.log("fNumeric: " + fNumeric);

			// test if field already part of the active query 
			// ------------------------------------------
			var fActiveFacet = false;
			__facetFilterA.forEach(function (szFilter, index) {
				if ((szFilter.split("\"")[1] == fields[i]) && (szFilter.split("\"")[2] == " is ")) {
					fActiveFacet = true;
				}
			});

			// test for unique values 
			// -----------------------

			// first test maximal 1000 values at the beginning 

			a.length = Math.min(a.length, 1000);
			u = a.filter(__onlyUnique);

			// if we have many unique values and they are numbers,
			// make a numerique facet, if they are texts, skip field
			// -----------------------------------------------------
			if ((a.length > 100) && (u.length >= a.length / 2)) {

				if (fNumeric) {

					a = mydata.column(fields[i]).values();
					a = a.map(function (x) {
						return __scanValue(x);
					});
					a.sort(function (a, b) {
						return ((a > b) ? 1 : -1);
					});
					var facet = {};
					facet.id = fields[i];
					facet.min = a[0];
					facet.max = a[a.length - 1];
					facet.values = a;
					facet.data = a;
					facetsA.push(facet);
					console.log("...... numeric");

				} else {
					// make input field to define filter 
					// ------------------------------------------
					var facet = {};
					facet.id = fields[i];
					facet.type = "search";

					if (fActiveFacet) {

						// add value list in any case 
						// ---------------------------
						facet.values = a;
						// count values
						var valuesCount = {};
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + 1;
						});
						facet.valuesCount = valuesCount;
						facet.uniqueValues = a.length;
					}

					facetsA.push(facet);
					console.log("...... filter");
				}
				continue;
			};

			// ok, data with many different values done
			// lets get all! unique values
			// -----------------------------------------

			a = mydata.column(fields[i]).values();

			// get unique values array
			var u = a.filter(__onlyUnique);

			// if less than 50 unique values, make text or number facet
			// --------------------------------------------------------

			if (u.length < 50 && !__rangesA[fields[i]] && !fNumeric) {

				// count values
				var valuesCount = {};
				a.forEach(function (x) {
					valuesCount[x] = (valuesCount[x] || 0) + 1;
				});

				if (fNumeric) {
					u = u.map(function (x) {
						return Number(x);
					});
					u.sort(function (a, b) {
						return ((a > b) ? 1 : -1);
					});
				} else {
					u.sort();
					u.sort(function (a, b) {
						return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
					});
				}

				var facet = {};
				facet.id = fields[i];
				facet.values = u;
				facet.valuesCount = valuesCount;
				facet.uniqueValues = u.length;

				if (fActiveFacet) {
					facet.type = "search";
				}

				facetsA.push(facet);

				console.log("...... text");
			}
			else {

				// more than 50 unique values

				if (fNumeric) {

					// if numeric data, make min/max range filter
					// ------------------------------------------
					a = mydata.column(fields[i]).values();
					var min = null;
					var max = null;
					var fNaN = false
					a = a.map(function (x) {
						x = __scanValue(x);
						min = Math.min(min || x, x);
						max = Math.max(max || x, x);
						return (x);
					});
					var facet = {};
					facet.id = fields[i];
					facet.min = min; //a[0];
					facet.max = max; //a[a.length-1];
					facet.data = a;
					facet.uniqueValues = u.length;
					facet.type = "numeric";
					facetsA.push(facet);

					console.log("...... numeric");

				} else {

					// if not numeric, make input field to define filter 
					// ------------------------------------------
					var facet = {};
					facet.id = fields[i];
					facet.type = "search";
					if (u.length < 200) {
						// add value list
						// ---------------
						facet.values = u;
						var valuesCount = {};
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + 1;
						});
						facet.valuesCount = valuesCount;
						facet.uniqueValues = u.length;
					}
					facetsA.push(facet);
					console.log("...... filter");
				}
			}
		}

		console.log("=== done ========");

		// ===========================================
		//
		// create the html facet list
		//
		// ===========================================

		szHtml = "";
		szHtml += "<div id='list-facets' class='list-group' style='width:100%;margin-bottom:5em;'>";

		$("#facets").html(szHtml);

		// create an array of the filter to pass them to the executing function
		// to avoid problems with special characters " and '
		__queryA = [];

		// check if we have already a filter defined
		// and facets are elements of the filter
		var nSelectA = [];
		for (var i = 0; i < facetsA.length; i++) {
			__facetFilterA.forEach(function (szFilter) {
				if (szFilter.split("\"")[1] == facetsA[i].id) {
					nSelectA.push(i);
				}
			});
		}
		// if yes, get the selected facet to the top of the list
		nSelectA.forEach(function (nSelect) {
			var toTop = facetsA.slice(nSelect, nSelect + 1);
			facetsA.splice(nSelect, 1);
			facetsA.splice(0, 0, toTop[0]);
		});

		for (var i = 0; i < facetsA.length; i++) {

			var fActiveFacet = false;
			var szActiveFilter = null;
			var szSafeId = facetsA[i].id.replace(/ /g, "_").replace(/:/g, "_");

			__facetFilterA.forEach(function (szFilter, index) {
				if (szFilter.split("\"")[1] == facetsA[i].id) {
					fActiveFacet = true;
					szActiveFilter = szFilter;
				}
			});

			szHtml += fActiveFacet ? "<div class='facet-active'>" : "<div class='facet'>";

			// ------------------------------
			// facet header - with fieldname
			// ------------------------------

			var bgColor = fActiveFacet ? "#884444" : "#888888";

			var szMin = ixmaps.__formatValue(facetsA[i].min, 2, "BLANK");
			var szMax = ixmaps.__formatValue(facetsA[i].max, 2, "BLANK");

			szHtml += fActiveFacet ? "<a href='javascript:__removeFacets(\"" + (facetsA[i].id) + "\");' style='color:white' >" : "";
			szHtml += "<div style='font-family:arial;font-size:1.1em;text-align:left;padding:0.5em 0.5em 0.5em 0.5em;margin:1em 0 0.4em 0;background:" + bgColor + ";border-radius:5px;color:white'>";
			szHtml += facetsA[i].id;
			szHtml += (typeof (facetsA[i].min) != "undefined") ? ((facetsA[i].min != facetsA[i].max) ? (": " + szMin + " - " + szMax) : (": " + szMin)) : "";
			szHtml += fActiveFacet ? "<span style='float:right;margin-right:0em'><i class='shareIcon blackHover share_bitly icon-cancel-circle' title='Share a short link' tabindex='-1'></i></span>" : "";
			szHtml += "</div>";
			szHtml += fActiveFacet ? "</a>" : "";

			if (facetsA[i].type == "search") {
				var placeholder = "Search for...";
				if (fActiveFacet) {
					placeholder = szActiveFilter.split("\"")[3];
				}
				szHtml += '<div class="input-group" style="margin-bottom:0.5em" >';
				szHtml += '<input id="' + (szSafeId + "query") + '" type="text" class="form-control" placeholder="' + placeholder + '">';
				szHtml += '<span class="input-group-btn">';
				szHtml += '<button class="btn btn-search" type="button" onclick="var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value);"><i class="fa fa-search fa-fw"></i> filtra</button>';
				szHtml += '</span>';
				szHtml += '</div>'
			}

			// ---------------------------------
			// facet content
			// ---------------------------------

			if (typeof (facetsA[i].min) != "undefined" && !isNaN(facetsA[i].min) && !isNaN(facetsA[i].max) && (facetsA[i].min != facetsA[i].max)) {

				// ---------------------------------
				// continous value facet
				// make min/max slider
				// ---------------------------------

				if (!__rangesA[facetsA[i].id] || !fActiveFacet) {
					__rangesA[facetsA[i].id] = { min: facetsA[i].min, max: facetsA[i].max, data: facetsA[i].data, id: facetsA[i].id };
				}

				var min = __rangesA[facetsA[i].id].min;
				var max = __rangesA[facetsA[i].id].max;
				var szMin = ixmaps.__formatValue(__rangesA[facetsA[i].id].min, 2, "BLANK");
				var szMax = ixmaps.__formatValue(__rangesA[facetsA[i].id].max, 2, "BLANK");

				var href = "#";
				var bgColor = "#eeeeee";
				var szCount = "";

				// make histogram
				// ---------------------------------

				if (facetsA[i].data) {

					var fOnMap = false;
					if ((objThemeDefinition.field == facetsA[i].id)) {
						fOnMap = true;
					}

					var sliderId = szSafeId;
					var nTicks = Math.min(40, (max - min));
					nTicks = (nTicks >= 5) ? nTicks : 40;

					var szScale = ((max - min) < 40) ? "" : "LOG";

					var barA = __getScatterArray(__rangesA[facetsA[i].id].data, min, max, nTicks, szScale);
					var maxHeight = 0;
					barA.count.forEach(function (height) {
						maxHeight = Math.max(maxHeight, height);
					});
					var fDiscret = (nTicks == max-min);
					var scale = 75 / maxHeight;
					var width = 210 / nTicks;
					szHtml += '<div style="background:#eeeeee;margin-top:0.4em;border-radius:5px;">'

					szHtml += '<div id="' + sliderId + 'histogram" style="padding-top:2em">';
					for (b = 0; b < barA.count.length - 1; b++) {
						var height = barA.count[b];
						var bMin = barA.min[b];
						var bMax = fDiscret?barA.min[b]:barA.min[b + 1];
						var szbMin = ixmaps.__formatValue(bMin, bMin < 100 ? 2 : 0, "BLANK");
						var szbMax = ixmaps.__formatValue(bMax, bMax < 100 ? 2 : 0, "BLANK");
						var fActive = ((bMax >= facetsA[i].min) && (bMin <= facetsA[i].max));
						var color = fActive ? "#888" : "#ddd";
						if (fOnMap) {
							//color = objTheme.partsA[0].color;
							objTheme.partsA.forEach(function (part) {
								if (bMin >= part.min) {
									color = part.color;
								}
							});
						}

						var szTooltip = fDiscret?String(bMin):String(bMin) + '-' + String(bMax);
						var szFilter = "ixmaps.filterThemeItems(null, null, \"\", { field: \""+facetsA[i].id+"\", min: "+bMin+", max: "+bMax+" });";
						var szHighlight = "$(this).css(\"background\",\"#880000\");"+szFilter;
						var szClearHighlight = "$(this).css(\"background\",\"#888888\");ixmaps.filterThemeItems(null,null,\"\",\"remove\");"
						var szRange = "__setRangeFilter(\""+facetsA[i].id+"\", \""+bMin+","+bMax+"\", 0, 0)";

						szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' ";
						szHtml += " data-toggle='tooltip' title='" + szTooltip + "' onClick='" + szRange + "'"; 
						szHtml += fActive?(" onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + "'>"):">";
						szHtml += "</div>";
						//szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (szbMin + ' - ' + szbMax) + "'></div>";
					}
					szHtml += "</div>";

					// make slider
					// ---------------------------------

					sliderA.push({ id: sliderId, field: facetsA[i].id, scale: szScale, min: min, max: max, ticks: nTicks });
					szHtml += '<div style="margin:0em 0em 0.5em 0em;background:#eee;border-radius:5px;height:2.5em;padding-top:0.5em"><span class="minvalue">' + szMin + '</span> <input id="' + sliderId + '" type="text" class="span2" value="" data-slider-min="' + min + '" data-slider-max="' + max + '" data-slider-step="5" data-slider-value="[' + facetsA[i].min + ',' + facetsA[i].max + ']"/> <span class="maxvalue">' + szMax + '</span></div>';

					szHtml += '</div>'
				}
			} else
				if (facetsA[i].values) {

					// ---------------------------------
					// unique value facet
					// ---------------------------------

					szHtml += '<div>'

					for (var ii = 0; ii < facetsA[i].values.length; ii++) {

						if (facetsA[i].values[ii] != " ") {

							// make the facet filter 
							var szQuery = "WHERE \"" + facetsA[i].id + "\" = \"" + facetsA[i].values[ii] + "\"";

							// make href, pass filter by filter array to avoid " or ' conflicts
							__queryA.push(szQuery);
							var href = "javascript:__setFacetFilter(__queryA[" + (__queryA.length - 1) + "]);";

							// how often is the value in the column
							var nCount = facetsA[i].valuesCount ? facetsA[i].valuesCount[facetsA[i].values[ii]] : null;

							var bgColor = "#eeeeee";
							var szCount = String(nCount || "");

							if ((objThemeDefinition.field == facetsA[i].id)) {
								bgColor = objTheme.colorScheme[objTheme.nStringToValueA[facetsA[i].values[ii]] - 1];
								href = "javascript:ixmaps.markThemeClass('" + objTheme.szId + "'," + (objTheme.nStringToValueA[facetsA[i].values[ii]] - 1) + ");";
							}

							// create highlight item link
							// -----------------------------------
							var szHighlight = "$(this).css('background','#880000');__HighlightFacetItems('" + facetsA[i].id + "','" + facetsA[i].values[ii].replace(/\'/g, "\\\'") + "')";
							var szClearHighlight = "$(this).css('background','');ixmaps.filterThemeItems(null,null,'','remove');"

							// facet button with one unique value
							// -----------------------------------
							//szHtml += '<a href="'+href+'" onmouseover="'+szHighlight+'" onmouseout="'+szClearHighlight+'" >';
							szHtml += '<a href="' + href + '">';
							szHtml += '<div class="input-group" style="margin-bottom:0.5em;width:100%">';
							if ((objThemeDefinition.field == facetsA[i].id)) {
								szHtml += '<span class="input-group-addon" id="btnGroupAddon" style="background:' + bgColor + '"></span>';
							}
							szHtml += '<button type="button" class="btn btn-block btn-secondary "><span style="margin-left:0.5em;float:left;white-space:normal;text-align:left">' + facetsA[i].values[ii] + '</span><span class="badge badge-primary badge-pill pull-right" style="top:0.1em;right:0.2em;" onmouseover="' + szHighlight + '" onmouseout="' + szClearHighlight + '">' + szCount + '</span></button>';
							szHtml += '</div>';
							szHtml += '</a>';
						}
					}
					szHtml += "</div>";
				}
			szHtml += "</div>";
		}
		szHtml += "</div>";

		$("#facets").html(szHtml);

		sliderA.forEach(function (x) {

			$("#" + x.id + "histogram").css("margin-left", ($("#" + x.id).prev().offset().left + $("#" + x.id).prev().width()) + "px");

			var nStep = ((x.max - x.min) == x.ticks)?1:Math.min(1, Math.pow(10, Math.floor(Math.log((x.max - x.min) / 100))));

			var mySlider = $("#" + x.id).slider({
				step: nStep,
				tooltip_split: true,
				tooltip_position: "bottom",
				scale: (x.scale == "LOG") ? 'logarithmic' : 'linear'
			}).on("slideStop", function () {
				__setRangeFilter(x.field, $(this).context.value, $(this).attr("data-slider-min"), $(this).attr("data-slider-max"));
			}).on("slide", function () {
				__makeHistogram($(this).attr("id"), $(this).context.value);
			});
		});

		$('[data-toggle="tooltip"]').tooltip();
	};

	__makeHistogram = function (id, szRange) {

		var rangeA = szRange.split(",");

		var facet = null;

		for (i in facetsA) {
			if (facetsA[i].id == id) {
				facet = facetsA[i];
			}
		}

		if (facet && facet.data) {

			var objThemeDefinition = ixmaps.getThemeDefinitionObj();
			var objTheme = ixmaps.getThemeObj();

			var fOnMap = false;
			if ((objThemeDefinition.field == facet.id)) {
				fOnMap = true;
			}

			var min = __rangesA[facet.id].min;
			var max = __rangesA[facet.id].max;
			var sliderId = facet.id;
			var nTicks = Math.min(40, (max - min));
			nTicks = (nTicks >= 5) ? nTicks : 40;

			var szScale = ((max - min) < 40) ? "" : "LOG";
			var fDiscret = (nTicks == max-min);

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
				var bMax = fDiscret?barA.min[b]:barA.min[b + 1];
				var color = ((bMax >= rangeA[0]) && (bMin <= rangeA[1])) ? "#888" : "#ddd";
				if (fOnMap) {
					//color = objTheme.partsA[0].color;
					objTheme.partsA.forEach(function (part) {
						if (bMin >= part.min) {
							color = part.color;
						}
					});
				}
				var szFilter = "ixmaps.filterThemeItems(null, null, '', { field: '"+facet.id+"', min: "+bMin+", max: "+bMax+" }";
				var szHighlight = "$(this).css('background','#880000');"+szFilter;
				var szClearHighlight = "$(this).css('background','');ixmaps.filterThemeItems(null,null,'','remove');"
				szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (bMin + '-' + bMax) + " onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + "'></div>";
			}
			szHtml += "</div>";

			$("#" + sliderId + "histogram").html(szHtml);
		}
	};

	// ---------------------------------------------------
	// highlight map theme items by query
	// select data by query and create list of theme items 
	// highlight this item on the map
	// ---------------------------------------------------

	__HighlightFacetItems = function (szField, szValue) {
		var objTheme = ixmaps.getThemeObj();
		if ( objTheme && ( objTheme.szFlag.match(/AGGREGATE/) || objTheme.szFlag.match(/MULTI/)) ){
			ixmaps.filterThemeItems(null, null, 'WHERE "'+szField+'" is "'+szValue+'"', 'set');
		}else{
			ixmaps.filterThemeItems(null, null, "", { field: szField, txt: szValue });
		}
		return;

		// theme
		// ------------------------------------
		var objThemeDefinition = ixmaps.getThemeDefinitionObj();
		var objTheme = ixmaps.getThemeObj();

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);

		// create highlight item list
		// -----------------------------------
		var layer = null;
		for (item in objTheme.itemA) {
			layer = item.split("::")[0];
		}

		var valuesA = [];
		var x = mydata.select(szQuery);
		var lookupA = objThemeDefinition.style.lookupfield.split("|");
		lookupA.forEach(function (id) {
			valuesA.push(x.column(id).values());
		});

		var itemA = [];
		for (k = 0; k < valuesA[0].length; k++) {
			var itemJ = [];
			for (kk = 0; kk < valuesA.length; kk++) {
				itemJ.push(valuesA[kk][k]);
			}
			itemA.push(layer + "::" + itemJ.join(','));
		}

		ixmaps.highlightThemeItems(null, itemA.join("|"), '|');
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


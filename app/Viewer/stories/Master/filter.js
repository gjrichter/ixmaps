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

		var nPop = (nMax - nMin ) / (nTicks-1);

		var nPopA = [];
		var nTickA = [];
		var nTickVal = nMin;
		for (var i = 0; i < nTicks + 1; i++) {
			nPopA[i] = 0;
			nTickA[i] = Math.floor(szFlag.match(/LOG/) ? (Math.exp(nTickVal)) : nTickVal);
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

	// get unique values array via filter
	var __onlyUnique = function (value, index, self) {
		return self.indexOf(value) === index;
	};

	// get unique values array via named array
	var __getUniqueValues = function(a) {
		var u = [];
		for ( var i in a ){
			u[String(a[i])] = 1;
		}
		var retA = [];
		for ( var v in u ){
			retA.push(v);
		}
		return retA;
	};

	// get numbers from formatted values like 235 678.98 or 235.678,98
	var __scanValue = function (nValue) {
		if (String(nValue).match(/:/)){
			return "date";
		} else
		// strips blanks inside numbers (e.g. 1 234 456 --> 1234456)
		if (String(nValue).match(/,/)) {
			return parseFloat(String(nValue).replace(/\./gi, "").replace(/,/gi, "."));
		} else {
			return parseFloat(String(nValue).replace(/ /gi, ""));
		}
	};

	// ===========================================
	//
	// create word cloud from theme data
	//
	// ===========================================

	ixmaps.data.makeWordCloud = function (szThemeId,szField,szDiv) {

		facetsA = [];

		var fTest = true;
		var sliderA = [];

		console.log("=== make list ===");

		if (ixmaps.getMapTypeId().match(/dark/i)){
			$("#container").css("background-color","#333");
			$("#container").css("color","#ddd");
			normal   	= "#aaaaaa";
			highLight   = "#ffffff";
			highLightBg = "#404040";
		}

		// theme
		// ------------------------------------
		var objThemeDefinition = ixmaps.getThemeDefinitionObj(szThemeId);
		var objTheme = ixmaps.getThemeObj(szThemeId);

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);
		
		// ..........................................................
		//
		// 1. loop over data request and set value into card templates
		//
		// ..........................................................

		// store absolut number of entries  				
		var records = mydata.table.records;

		var allText = "";

		var szColumn = szField;
	    var nValueIndex  = mydata.column(szColumn).index;
		
		for ( i in objTheme.indexA ){
			var dbIndexA = objTheme.itemA[objTheme.indexA[i]].dbIndexA || [objTheme.itemA[objTheme.indexA[i]].dbIndex];
			for ( ii in dbIndexA ){
				index = dbIndexA[ii];
				allText += mydata.records[index][nValueIndex].replace(/&amp;/g, '&').replace(/[^a-z0-9]/gmi, " ") + " ";
			}
		}

		var wordsA = allText.split(/\s+/);
		
		var stopWords = "a,able,about,across,after,all,almost,also,am,among,an,and,any,are,as,at,be,because,been,but,by,can,cannot,could,dear,did,do,does,either,else,ever,every,for,from,get,got,had,has,have,he,her,hers,him,his,how,however,i,if,in,into,is,it,its,just,least,let,like,likely,may,me,might,most,must,my,neither,no,nor,not,of,off,often,on,only,or,other,our,own,rather,said,say,says,she,should,since,so,some,than,that,the,their,them,then,there,these,they,this,tis,to,too,twas,us,wants,was,we,were,what,when,where,which,while,who,whom,why,will,with,would,yet,you,your";
		var stopWords_it = "a,adesso,ai,al,all,alla,allo,allora,altre,altri,altro,anche,ancora,avere,aveva,avevano,ben,buono,che,chi,cinque,comprare,con,consecutivi,consecutivo,cosa,cui,da,dal,dalla,dall,degli,dei,del,dell,della,delle,dello,dentro,deve,devo,di,doppio,due,e,ecco,fare,fine,fino,fra,gente,giu,gli,ha,hai,hanno,ho,il,indietro,invece,io,la,le,lei,lo,loro,lui,lungo,ma,me,meglio,molta,molti,molto,nei,nel,nella,no,noi,nome,nostro,nove,nuovi,nuovo,o,oltre,ora,otto,peggio,per,pero,persone,piu,poco,primo,promesso,qua,quarto,quasi,quattr,quello,questo,qui,quindi,quinto,rispetto,sara,secondo,sei,sembra,sembrava,senza,sette,sia,siamo,siete,solo,sono,sopra,soprattutto,sotto,stati,stato,stesso,su,subito,sul,sulla,tanto,te,tempo,terzo,tra,tre,triplo,ultimo,un,una,uno,va,vai,voi,volte,vostro";
		 
		var stopWordA = stopWords_it.split(',');
		var stopWord = function(i){
			for ( x in stopWordA ){
				if ( i == stopWordA[x] ){
					return true;
				}
			}
			return false;
		}
		//wordsA = nomeA;

		var wordsMap = {};
		  /*
			wordsMap = {
			  'Oh': 2,
			  'Feelin': 1,
			  ...
			}
		  */
		wordsA.forEach(function (key) {
			key = key.toLowerCase();
			if (wordsMap.hasOwnProperty(key)) {
				wordsMap[key]++;
			} else {
				wordsMap[key] = 1;	
			}
		});

		var words = [];
		for (var i in wordsMap ){
			if ( (i.length >= 3) && (wordsMap[i] >= 2) && !stopWord(i) ){
				words.push({"text":i,"size":wordsMap[i],"href":"javascript:__setFilter(\"" + szColumn + "\",\""+i+"\");"});
				//words.push({"text":i,"size":wordsMap[i],"href":"javascript:ixmaps.map().changeThemeStyle(null,'filter:WHERE \""+szColumn+"\" like \""+i+"\"','set');"});
			}
		}
		words.sort(function(a,b){
					if(a.size<b.size){
						return 1;
					}
					if(a.size>b.size){
						return -1;
					}
					return 0;
				});

		$("#"+szDiv).show();
		$("#"+szDiv).html("");

		var selector = "#"+szDiv;

		var width = 400;
		var height = 400;
		
		if ( words.length < 15 ){
			return;
		}
		
		d3.wordcloud()
			.selector(selector)
			.size([width||500, height||300])
			.font("Impact")
			.scale("linear")
			.fill(d3.scale.ordinal().range(["#444444", "#888888"]))
			//.fill(d3.scale.category20b())
			.words(words)
			.spiral("rectangular")
			.onwordclick(function(d, i) {
			if (d.href) { 
				window.location = d.href; 
			}
		}).start();
	};

	// ===========================================
	//
	// facet filter handling 
	//
	// ===========================================

	var __facetFilterA = [];
	var __rangesA = [];

	// -----------------------------------------------
	// set the selected facet filter
	// if this filter is already active, clear filter
	// -----------------------------------------------
	__setFacetFilter = function (szFilter) {
		
		// if new filter given, add to filter array (delete existent filter of the same data column)
		if (szFilter.length) {

			// get filter without WHERE 
			szFilter = szFilter.split(/WHERE /)[1];

			// add, or remove filter, if exists  
			__facetFilterA.filter(function (value, index, self) {
				return !(szFilter.split(/"/)[1] == value.split(/"/)[1]);
			});

			__facetFilterA.push(szFilter);
		}

		// make final filter from actual parts stored in __facetFilterA
		szFilter = __facetFilterA.length ? ("WHERE " + __facetFilterA.join(" AND ")) : null;

		// show filter in input field
		$("#query").val(szFilter);

		// filter items on map
		var objTheme = ixmaps.getThemeObj();
		var objThemesA = ixmaps.getThemes();
		for ( a in objThemesA ){
			objTheme = objThemesA[a];
			if ( objTheme.szFlag.match(/CHART|CHOROPLETH/) ){
                if ( szFilter ){
                    ixmaps.changeThemeStyle(null,objTheme.szId, "filter:" + (szFilter || " "), "set");
                }else{
                    ixmaps.changeThemeStyle(null,objTheme.szId, "filter", "remove");
                }
            }
		}
		/**
		if ( szFilter ){
			if ( !objTheme.szFlag.match(/CATEGORICAL/) ){
				ixmaps.changeThemeStyle(null,objTheme.szId,"type:RANGES","add");
			}
			ixmaps.changeThemeStyle(objTheme.szId, "filter:" + (szFilter || " "), "set");
		}else{
			ixmaps.changeThemeStyle(objTheme.szId, "filter", "remove");
		}
		**/
		// make new facets
		//__redrawFacets(szFilter);

	};

	var __redrawFacets = function (szFilter) { 

		$("#facets").html('<h2 style="padding:0.2em 0.5em;background:#dddddd;border-radius:5px;color:white">refresh facets ...<img src="resources/images/bg-spinner.gif" style="display:block;margin:1em auto;height:32px"></h2>');
		ixmaps.data.szFilter = szFilter;
		//setTimeout("ixmaps.data.makeFacets('"+szFilter+"','facetDiv')",1000);
	};

	var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;
	// intercept theme creation done, and make the legend
	//
	ixmaps.htmlgui_onDrawTheme = function(szId){
		ixmaps.data.makeFacets(ixmaps.data.szFilter,'facetDiv');
		old_onDrawTheme(szId);
	}
	ixmaps.htmlgui_onHideStoryTool = function(){
		ixmaps.htmlgui_onDrawTheme = old_onDrawTheme;
	}

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
	};

	// -------------------------------------------------------------------------
	// set a input field filter
	// --------------------------------------------------------------------------
	__setFilter = function (szField, szFilter) {
		szQuery = "WHERE \"" + szField + "\" like \"" + szFilter + "\"";
		// delete filter with same field
		__facetFilterA = __facetFilterA.filter(function (value, index, self) {
			return !(value.split("\"")[1] == szField);
		});
		__setFacetFilter(szFilter.length?szQuery:"");
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

	var __makeHistogram = function (id, szRange) {

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
			var nTicks = Math.min(40, (max - min + 1));
			nTicks = (nTicks >= 5) ? nTicks : 40;
            var nStep = pop = (max - min) / nTicks;
            if ( nStep > 1 && nStep < 2 ) {
                nTicks = max - min +1;                     
            }

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
                bMin = ixmaps.__formatValue(bMin, 2, "BLANK");
			    bMax = ixmaps.__formatValue(bMax, 2, "BLANK");
 				szHtml += "<div style='display:inline-block;width:" + width + "px;background-color:" + color + ";height:" + (1 + (height * scale)) + "px;' data-toggle='tooltip' title='" + (bMin + ' - ' + bMax) + " onmouseover='" + szHighlight + "' onmouseout='" + szClearHighlight + "'></div>";
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

	__HighlightFacetItems = function (szField, szValue) { console.log("__HighlightFacetItems");
		var objTheme = ixmaps.getThemeObj();
		__oldFilter = objTheme.szFilter;
		if ( objTheme && ( objTheme.szFlag.match(/AGGREGATE/) || objTheme.szFlag.match(/MULTI/)) ){
			if ( __oldFilter.match(/WHERE/) ){
				ixmaps.filterThemeItems(null, null, __oldFilter + ' AND "'+szField+'" = "'+szValue+'"', 'set');
			}else{
				ixmaps.filterThemeItems(null, null, 'WHERE "'+szField+'" = "'+szValue+'"', 'set');
			}
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

	// ===========================================
	//
	// create the html facet list
	//
	// ===========================================

	ixmaps.data.showFacets = function (szFilter,szDiv,facetsA) {

		var fTest = true;
		var sliderA = [];

		var objThemeDefinition = ixmaps.data.objThemeDefinition;
		var objTheme = ixmaps.data.objTheme;

		var szHtml = "";
		szHtml += "<div id='list-facets' class='list-group' style='width:100%;margin-bottom:5em;'>";

		$("#"+(szDiv||"facets")).html(szHtml);

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
		/**
		// if yes, get the selected facet to the top of the list
		nSelectA.forEach(function (nSelect) {
			var toTop = facetsA.slice(nSelect, nSelect + 1);
			facetsA.splice(nSelect, 1);
			facetsA.splice(0, 0, toTop[0]);
		});
		**/
		for (var i = 0; i < facetsA.length; i++) {
			
			var fActiveFacet = false;
			var szActiveFilter = null;
            
            // replace all non word characters with underscore
			var szSafeId = facetsA[i].id.replace(/ |\W/g, "_");

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
            
			if(facetsA[i].data &&
               facetsA[i].data.length &&
               !isNaN(facetsA[i].min) &&
               !isNaN(facetsA[i].max) &&
               (facetsA[i].min < facetsA[i].max) ){
 				szHtml += (typeof (facetsA[i].min) != "undefined") ? ((facetsA[i].min != facetsA[i].max) ? (": " + szMin + " - " + szMax) : (": " + szMin)) : "";
			}
            
			szHtml += fActiveFacet ? "<span style='float:right;margin-right:0em'><i class='icon shareIcon share_bitly icon-cancel-circle' title='Share a short link' tabindex='-1'></i></span>" : "";
			szHtml += "</div>";
			szHtml += fActiveFacet ? "</a>" : "";

			if (facetsA[i].type == "search") {
				var placeholder = "Search for..." + ( (!facetsA[i].values)?(" (e.g. "+(facetsA[i].example||" ")+")"):"" );
				var value = "";
				if (fActiveFacet) {
					value = placeholder = szActiveFilter.split("\"")[3];
				}
				szHtml += '<div class="input-group" style="margin-bottom:0.5em" >';
				szHtml += '<input id="' + (szSafeId + "query") + '" type="text" class="form-control" value="' + value + '" placeholder="' + placeholder + '"';
				szHtml += 'onKeyUp="if(event.which == 13){var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value);}">';
				szHtml += '<span class="input-group-btn">';
				szHtml += '<button class="btn btn-search" type="button" onclick="var value = $(\'#' + (szSafeId + "query") + '\').val();__setFilter(\'' + facetsA[i].id + '\',value);"><i class="fa fa-search fa-fw"></i> </button>';
				szHtml += '</span></input>';
				szHtml += '</div>'
				
				if (verbose){
					szTarget = "thisismywordcloud"+facetsA[i].id.replace(/[\W_]/g, "_");
					szHtml += "<div id='"+szTarget+"'></div>";
					setTimeout("ixmaps.data.makeWordCloud('"+objTheme.szId+"','"+facetsA[i].id+"','"+szTarget+"')",100);
				}
			}

			// ---------------------------------
			// facet content
			// ---------------------------------

			if (typeof (facetsA[i].min) != "undefined" && 
				 !isNaN(facetsA[i].min)				   &&
				 !isNaN(facetsA[i].max)				   &&
				 (facetsA[i].min < facetsA[i].max)	   ){

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
					var nTicks = Math.min(40, (max - min + 1));
					nTicks = (nTicks >= 5) ? nTicks : 40;
                    
                    var nStep = pop = (max - min) / nTicks;
                    if ( nStep > 1 && nStep < 2 ) {
                        nTicks = max - min;                     
                    }

					var szScale = ((max - min) < 40) ? "" : "LOG";

					var barA = __getScatterArray(__rangesA[facetsA[i].id].data, min, max, nTicks, szScale);
					var maxHeight = 0;
					barA.count.forEach(function (height) {
						maxHeight = Math.max(maxHeight, height);
					});
					var fDiscret = (nTicks == max-min+1);
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

						var szTooltip = 
                            fDiscret?String(bMin):ixmaps.__formatValue(bMin, 2, "BLANK") + ' - ' + ixmaps.__formatValue(bMax, 2, "BLANK");
						var szFilter = "ixmaps.filterThemeItems(null, null, \"\", { field: \""+facetsA[i].id+"\", min: "+bMin+", max: "+bMax+" });";
						var szHighlight = "__origBg=$(this).css(\"background\");$(this).css(\"background\",\"#880000\");";//+szFilter;
						var szClearHighlight = "$(this).css(\"background\",__origBg);";//ixmaps.filterThemeItems(null,null,\"\",\"remove\");"
						var szHighlight = "$(this).css(\"border\",\"solid #ffffff 0.5px\");";//+szFilter;
						var szClearHighlight = "$(this).css(\"border\",\"\");";//ixmaps.filterThemeItems(null,null,\"\",\"remove\");"
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

					// if more than 20 items, clip list to 10
					// --------------------------------------
					var maxII = (facetsA[i].values.length<20)?facetsA[i].values.length:10;

					for (var ii = 0; ii <facetsA[i].values.length; ii++) {

						if (facetsA[i].values[ii] != " ") {

							// make the facet filter 
							var szQuery = "WHERE \"" + facetsA[i].id + "\" = \"" + facetsA[i].values[ii] + "\"";

							// make href, pass filter by filter array to avoid " or ' conflicts
							__queryA.push(szQuery);
							var href = "javascript:__setFacetFilter(__queryA[" + (__queryA.length - 1) + "]);";

							// how often is the value in the column
							var nCount = facetsA[i].valuesCount ? facetsA[i].valuesCount[facetsA[i].values[ii]] : null;
                            var nMaxCount = facetsA[i].nCount;
                            
							var bgColor = "#eeeeee";
							var szCount = String(nCount || "");

							if ((objThemeDefinition.field == facetsA[i].id)) {
								bgColor = objTheme.colorScheme[objTheme.nStringToValueA[facetsA[i].values[ii]] - 1];
								//href = "javascript:ixmaps.markThemeClass('" + objTheme.szId + "'," + (objTheme.nStringToValueA[facetsA[i].values[ii]] - 1) + ");";
							}

							// facet button with one unique value
							// -----------------------------------
							//szHtml += '<a href="'+href+'" onmouseover="'+szHighlight+'" onmouseout="'+szClearHighlight+'" >';
							szHtml += '<a href="' + href + '">';
							szHtml += '<div class="input-group" style="margin-bottom:0.5em;width:100%">';
							if ((objThemeDefinition.field == facetsA[i].id)) {
								szHtml += '<span class="input-group-addon" id="btnGroupAddon" style="background:' + bgColor + '"></span>';
							}
							var szText = facetsA[i].values[ii];
							if (facetsA[i].type == "search") {
								if (fActiveFacet) {
									value = szActiveFilter.split("\"")[3].replace("\/","\\\/");
									var szTextA = eval("szText.split(/"+value+"/i)");
									szText = szTextA.join("<span style='background:#ffff00'>"+value+"</span>");
								}
							}
							szHtml += '<button type="button" class="btn btn-block btn-secondary "><span style="margin-left:0.5em;float:left;white-space:normal;text-align:left">' + szText + '</span><span class="badge badge-primary badge-pill pull-right" style="top:0.1em;right:0.2em;" onmouseover=\'' + szHighlight + '\' onmouseout=\'' + szClearHighlight + '\'>' + szCount + '</span></button>';
                            
                            var nWidth = (100/nMaxCount*nCount);
                            if ( !isNaN(nWidth) && (nWidth<100) && (facetsA[i].uniqueValues > 1) ) {
                                szHtml += '<div style="position:relative;top:0.25em;left:0.1em;background:rgba(208,208,208,1);line-height:0.4em;width:'+nWidth+'%;border-radius:0 0.5em 0.5em 0">&nbsp;</div>';                               
                                }
                                
							szHtml += '</div>';
							szHtml += '</a>';
						}

						// clip list to max itema
						// --------------------------------------
						if ( ii == maxII ){
							szHtml += '</div>';
							szHtml += '<div id="'+(facetsA[i].id+"plus")+'" style="display:none">';
						}

					}

					szHtml += '</div>';
					szHtml += '<div>';

					// if list clipped, make butto to expand 
					// --------------------------------------
					if ( facetsA[i].values.length > maxII ){
						szHtml += '<a ><button type="button" class="btn btn-default " style="padding:0.2em 0.5em" onclick="$(this).hide();$(\'#'+(facetsA[i].id+"plus")+'\').toggle();">+ '+(facetsA[i].values.length-maxII)+'</button></a>';
					}

					szHtml += "</div>";
				}else{
					if (verbose){
						szTarget = "thisismywordcloud"+facetsA[i].id.replace(/[\W_]/g, "_");
						szHtml += "<div id='"+szTarget+"'></div>";
						setTimeout("ixmaps.data.makeWordCloud('"+objTheme.szId+"','"+facetsA[i].id+"','"+szTarget+"')",100);
					}
				}
			szHtml += "</div>";
		}
		szHtml += "</div>";

		$("#"+(szDiv||"facets")).html(szHtml);

		sliderA.forEach(function (x) {

			$("#" + x.id + "histogram").css("margin-left", ($("#" + x.id).prev().offset().left + $("#" + x.id).prev().width()) + "px");

			var nStep = ((x.max - x.min) == x.ticks)?1:Math.min(1, Math.pow(10, Math.floor(Math.log((x.max - x.min) / 100))));
			var mySlider = $("#" + x.id).slider({
				step: nStep,
				tooltip_split: true,
				tooltip_position: "bottom",
				scale: (x.scale == "LOG") ? 'logarithmic' : 'linear'
			}).on("slideStop", function () {
				__setRangeFilter(x.field, $(this).attr("value"), $(this).attr("data-slider-min"), $(this).attr("data-slider-max"));
			}).on("slide", function () {
				__makeHistogram($(this).attr("id"), $(this).attr("value"));
			});
		});

		$('[data-toggle="tooltip"]').tooltip();
	};

	// ===========================================
	//
	// create filter facets from theme data
	//
	// ===========================================

	ixmaps.data.makeFacets = function (szFilter,szDiv) {

		facetsA = [];

		var fTest = true;
		var sliderA = [];

		console.log("=== make facets ===");
		
		var szThemeId = ixmaps.filterThemeId = null;
	
 		if ( ixmaps.legend && ixmaps.legend.legendA[ixmaps.legend.activeLegendId] ){
			szThemeId = ixmaps.filterThemeId = ixmaps.legend.legendA[ixmaps.legend.activeLegendId].szId || null;
		}
        if ( !szThemeId ){
            var themesA = ixmaps.getThemes();
            if (themesA.length > 1){
                for ( i in themesA ){
                    if ( !themesA[i].szFlag.match(/POSITION|FEATURE/) && themesA[i].fVisible  ){
                        szThemeId = themesA[i].szId;
                        break;
                    }
                }
            }
        }

		// theme
		// ------------------------------------
		var objThemeDefinition = ixmaps.data.objThemeDefinition = ixmaps.getThemeDefinitionObj(szThemeId);
		var objTheme = ixmaps.data.objTheme = ixmaps.getThemeObj(szThemeId);

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);

		// GR 23.02.2018 take only rows which are on the map
		// -------------------------------------------------
		records = [];
		try	{
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
		}
		// maybe the data is not ready, then we repeat
		catch (e){
			setTimeout("ixmaps.data.makeFacets('"+szFilter+"','"+szDiv+"')",1000);
			return;
		}

		mydata.records = records;

		// if we have already a filter on the map,
		// filter data before creating facets
		// ------------------------------------
		if (szFilter && szFilter.match(/WHERE/)) {
			mydata = mydata.select(szFilter);

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
			__facetFilterA = [];
			szPartsA.forEach(function(x){
				__facetFilterA.push(x);
			});
		}
		console.log(__facetFilterA);
		// make facets from data fields
		// ----------------------------

		var a, u;
		var fields = mydata.columnNames();

		for (var i = 0; i < fields.length; i++) {

			a = mydata.column(fields[i]).values();

			console.log(fields[i]+"-------->");

			// test for only numeric values
			// ----------------------------
			fNumeric = true;
			a.every(function (x) {
				if (x.length && isNaN(__scanValue(x))) {
					console.log(x);
					fNumeric = false;
				}
				return fNumeric;
			});
			console.log("fNumeric: " + fNumeric);

			// test if field already part of the active query 
			// ------------------------------------------
			var fActiveFacet = false;
			__facetFilterA.forEach(function (szFilter, index) {
				if ((szFilter.split("\"")[1] == fields[i]) && ((szFilter.split("\"")[2] == " is ")||(szFilter.split("\"")[2] == " = "))) {
					fActiveFacet = true;
				}
			});

			// test for unique values 
			// -----------------------

			// first test maximal 250 values at the beginning 

			a.length = Math.min(a.length, 250);
			u = a.filter(__onlyUnique);

			console.log(u.length);
			console.log(a.length);

			// if we have many unique values and they are numbers,
			// make a numerique facet, if they are texts, skip field
			// -----------------------------------------------------
			if ((a.length >= 250) && (u.length >= (a.length / 5))) {

				console.log("many unique values");

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
					facet.example = a[0];

					if (fActiveFacet) {

						// add value list in any case 
						// ---------------------------
						facet.values = a;
						// count values
						var valuesCount = {};
						var nCount = {};
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + 1;
                            nCount++;
						});
						facet.nCount = nCount;
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

			console.log("get all values");
			a = mydata.column(fields[i]).values();

			// get unique values array
			console.log("get unique values");

			u = __getUniqueValues(a);
			//console.log(u);
			//u = a.filter(__onlyUnique);
			console.log("-- done --");

			// if less than 50 unique values, make text or number facet
			// --------------------------------------------------------

			if (u.length < 50 && !__rangesA[fields[i]] && !fNumeric) {

				console.log("less than 50 values");


				// count values
				var valuesCount = {};
				var nCount = 0;
				a.forEach(function (x) {
					valuesCount[x] = (valuesCount[x] || 0) + 1;
                    nCount++;
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
				facet.nCount = nCount;
				facet.valuesCount = valuesCount;
				facet.uniqueValues = u.length;

				if ((u.length >= 1) || fActiveFacet) {
					facet.type = "search";
				}

				facetsA.push(facet);

				console.log("...... text");
			}
			else {

				// more than 50 unique values

				if ( fNumeric ) {
					if ( u.length > 3 ) {

						// if more than 3 values, make min/max range filter
						// ------------------------------------------
						a = mydata.column(fields[i]).values();
						var min = Number.MAX_VALUE;
						var max = (-Number.MAX_VALUE);
						var fNaN = false
						a = a.map(function (x) {
							x = __scanValue(x);
							min = Math.min(min, x);
							max = Math.max(max, x);
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
						
					}else{
						
						// make input field to define filter 
						// ------------------------------------------
						var facet = {};
						facet.id = fields[i];
						facet.type = "list";
						if (u.length < 200) {
							// add value list
							// ---------------
							facet.values = u;
							var valuesCount = {};
							var nCount = 0;
							a.forEach(function (x) {
								valuesCount[x] = (valuesCount[x] || 0) + 1;
								nCount++;
							});
							u.sort(function (a, b) {
								return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
							});
							facet.nCount = nCount;
							facet.valuesCount = valuesCount;
							facet.uniqueValues = u.length;
						}
						facetsA.push(facet);
						
					}

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
						var nCount = 0;
						a.forEach(function (x) {
							valuesCount[x] = (valuesCount[x] || 0) + 1;
                            nCount++;
						});
						u.sort(function (a, b) {
							return ((valuesCount[a] < valuesCount[b]) ? 1 : -1);
						});
						facet.nCount = nCount;
						facet.valuesCount = valuesCount;
						facet.uniqueValues = u.length;
					}
					facetsA.push(facet);
					console.log("...... filter");
				}
			}
		}

		ixmaps.data.showFacets(szFilter,szDiv,facetsA);

		return;
	};


	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


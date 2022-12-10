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

	// light theme
	// ------------------------------------
	var normal   	= "#888888";
	var highLight   = "#000000";
	var highLightBg = "#e8e8e8";
	
	// ===========================================
	//
	// h e l p e r
	//
	// ===========================================


	// get unique values array
	var __onlyUnique = function (value, index, self) {
		return self.indexOf(value) === index;
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

	__onMouseOver = function(){
		var szId = event.target.getAttribute("id");
		if ( szId ){
			event.target.style.setProperty("background-color",highLightBg);
			ixmaps.embeddedSVG.window.map.Api.highlightItem(szId);
		}
	};

	__onMouseOut = function(){
		var szId = event.target.getAttribute("id");
		if ( szId ){
			event.target.style.removeProperty("background-color");
		}
	};

	var __lastClicked = null;
	__onMouseClick = function(){
		var szItem = event.target.getAttribute("item");
		if ( szItem ){
			ixmaps.embeddedSVG.window.map.Api.clearHighlightThemeItems(null);
			if ( szItem != __lastClicked ){
				ixmaps.embeddedSVG.window.map.Api.highlightThemeItems(null,szItem,"|");
				__lastClicked = szItem;
			}else{
				__lastClicked = null;
			}
		}
	};

	// ---------------------------------------------------
	// highlight map theme items by query
	// select data by query and create list of theme items 
	// highlight this item on the map
	// ---------------------------------------------------

	__HighlightFacetItems = function (szField, szValue) { 
		var objTheme = ixmaps.getThemeObj();
		__oldFilter = objTheme.szFilter;
		if ( objTheme && ( objTheme.szFlag.match(/AGGREGATE/) || objTheme.szFlag.match(/MULTI/)) ){
			if ( __oldFilter.match(/WHERE/) ){
				ixmaps.filterThemeItems(null, null, __oldFilter + ' AND "'+szField+'" is "'+szValue+'"', 'set');
			}else{
				ixmaps.filterThemeItems(null, null, 'WHERE "'+szField+'" is "'+szValue+'"', 'set');
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
	// create item list from theme data
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
			if ( (i.length >= 6) && (wordsMap[i] >= 2) ){
				words.push({"text":i,"size":wordsMap[i],"href":"javascript:__setFilter(\''" + szField + "'\',"+i+");}"});
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
		console.log(words);

		$("#"+szDiv).show();
		$("#"+szDiv).html("");

		var selector = "#"+szDiv;

		var width = 300;
		var height = 500;

		d3.wordcloud()
			.selector(selector)
			.size([width||500, height||300])
			.font("Impact")
			.scale("linear")
			//.fill(d3.scale.ordinal().range(["#884400", "#448800", "#888800", "#444400"]))
			.fill(d3.scale.category20b())
			.words(words)
			.spiral("rectangular")
			.onwordclick(function(d, i) {
			if (d.href) { 
				window.location = d.href; 
			}
		}).start();


	};
	console.log(ixmaps.data);
	
	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


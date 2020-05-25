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
		var szData = objThemeDefinition.style.dbtable;
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

	ixmaps.data.makeItemList = function (szFilter,szDiv) {

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
		var objThemeDefinition = ixmaps.getThemeDefinitionObj();
		var objTheme = ixmaps.getThemeObj();

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable;
		var dataObj = eval("ixmaps.embeddedSVG.window." + (szData || "themeDataObj"));

		// create data object from theme data
		// ------------------------------------
		var mydata = new Data.Table(dataObj);

	    var nTitleIndex = mydata.column(objTheme.szTitleField)?mydata.column(objTheme.szTitleField).index:null;
	    var nValueIndex = mydata.column(objTheme.szFieldsA[0])?mydata.column(objTheme.szFieldsA[0]).index:null;
	    var nSizeIndex  = mydata.column(objTheme.szSizeField) ?mydata.column(objTheme.szSizeField).index:null;

		// make list from data fields
		// ----------------------------

		var szHtml = "";
		var index = null;

		// take only rows which are on the map
		// -------------------------------------------------

		szHtml += "<div class='title'>"+objTheme.indexA.length+" items on map</div>";
		var maxList = Math.min(objTheme.indexA.length,100);
		if ( maxList < objTheme.indexA.length ){
			szHtml += "<div class='title'>(only the first "+maxList+" items are shown)</div>";
		}
		szHtml += "<hr>";

		var nItems = 0;

		objTheme.indexA.reverse();
		
		for ( i in objTheme.indexA ){

			var dbIndexA = objTheme.itemA[objTheme.indexA[i]].dbIndexA || [objTheme.itemA[objTheme.indexA[i]].dbIndex];

			for ( ii in dbIndexA ){

				index = dbIndexA[ii];

				var szValue = (nValueIndex?(mydata.records[index][nValueIndex]):"");
				var szSize  = (nSizeIndex ?(ixmaps.__bestFormatValue(__scanValue(mydata.records[index][nSizeIndex]), 2, "SPACE") + objTheme.szUnit) :"");
				var szTitle = (nTitleIndex?(mydata.records[index][nTitleIndex]):"");
                if ( 		 objTheme.itemA[objTheme.indexA[i]].szSelectionId2 &&
							(objTheme.itemA[objTheme.indexA[i]].szSelectionId2 != 'undefined') &&
				     (typeof(objTheme.itemA[objTheme.indexA[i]].szSelectionId2) != 'undefined') 
				   ){
                     szValue = objTheme.itemA[objTheme.indexA[i]].szSelectionId + " &rarr; " + objTheme.itemA[objTheme.indexA[i]].szSelectionId2;                
                }
				if ( szSize == "0" ){
					continue;
				}	

				var szText = "<h3><b>"+szSize+"</b>" + "  "+ szTitle + "</h3><h4>" + szValue +"</h4>";
				var leftWidth = 0; //window.innerWidth/3;

				szHtml += "<div id='"+objTheme.szId+":"+objTheme.indexA[i]+":chart' item='"+objTheme.indexA[i]+"' class='listitem' style='padding:0.5em 0em 0.7em 0.5em;margin-right:2em;border-bottom:#888 solid 0.5px'>";
				
				szHtml += "<div class='title' style='pointer-events:none'>"+szText+"</div>";
				
				szHtml += "<div class='data' style='pointer-events:none'>";
				szHtml += "<table style='font-size: 0.7em;line-height:1em;'>";
				
				if ( objTheme.szDataFieldsA ){
					for ( d = 0; d<mydata.records[index].length; d++ ){
						for ( f = 0; f<objTheme.szDataFieldsA.length; f++ ){
							if ( mydata.fields[d].id == objTheme.szDataFieldsA[f] ){
								szHtml += "<tr><td style='text-align:right;width:10%'>"+mydata.fields[d].id+"&nbsp;</td><td>&nbsp;"+mydata.records[index][d]+"</td></tr>";
							}
						}
					}
				}else{
					for ( d = 0; d<mydata.records[index].length; d++ ){
						szHtml += "<tr><td style='text-align:right;vertical-align:top;width:"+leftWidth+"px;color:#aaa;font-size:0.8em;'>"+mydata.fields[d].id+"</td><td style='padding-left:0.5em;'>"+mydata.records[index][d]+"</td></tr>";
					}
				}
				szHtml += "</table>";
				szHtml += "</div>";
				szHtml += "</div>";

				if ( ++nItems > 100 ){
					break;
				}
			}
			
			objTheme.indexA.reverse();

		}

		$("#"+szDiv).html(szHtml);
		$(".listitem").attr("onMouseOver","__onMouseOver(event,$(this).text())");
		$(".listitem").attr("onMouseOut","__onMouseOut()");
		$(".listitem").attr("onClick","__onMouseClick()");
		
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


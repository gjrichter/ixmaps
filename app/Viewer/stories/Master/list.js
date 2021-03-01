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
		
		// GR 11.02.2021 if theme = PLOT, make charts
		if ( objTheme.szFlag.match(/PLOT|PIE|BAR/) ){
			ixmaps.data.makeItemList_charts(szFilter,szDiv);
			return;
		}

		// theme data
		// ------------------------------------
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
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
							(!objTheme.itemA[objTheme.indexA[i]].szSelectionId2.match(/undefined/)) &&
				     (typeof(objTheme.itemA[objTheme.indexA[i]].szSelectionId2) != 'undefined') 
				   ){
                     szValue = objTheme.itemA[objTheme.indexA[i]].szSelectionId + " &rarr; " + objTheme.itemA[objTheme.indexA[i]].szSelectionId2; 
					
					szValue = objTheme.itemA[objTheme.indexA[i]].szSelectionId2
                }else{
					szValue = String(Number(i)+1);
				}
				if ( szSize == "0" ){
					continue;
				}	
				var szText = "<h3><b>"+szSize+"</b>" + "  "+ szTitle + "</h3><h4>" + szValue +"</h4>";
				var leftWidth = 0; //window.innerWidth/3;

				szHtml += "<div id='"+objTheme.szId+":"+objTheme.indexA[i]+":chart' item='"+objTheme.indexA[i]+"' class='listitem' style='padding:0.7em 0em 1em 0.5em;margin-right:2em;border-bottom:#888 solid 0.5px'>";
				
				szHtml += "<div class='title' style='pointer-events:none'>"+szText+"</div>";
				
				szHtml += "<div class='data' style='pointer-events:none'>";
				szHtml += "<table style='font-size: 1em;line-height:1em;'>";
				
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
						szHtml += "<tr><td style='text-align:right;vertical-align:top;width:"+leftWidth+"px;color:#aaa;font-size:0.8em;'>"+mydata.fields[d].id+"</td>";
						var szValue = String(mydata.records[index][d]);
						if (szValue.match(/http:/) || szValue.match(/https:/)) {
							if (szValue.match(/.jpg/) || szValue.match(/.png/)) {
								szValue = "<img  src='" + szValue + "' style='max-width:100%'>";
							} else {
								szValue = "<a  href='" + szValue + "' target='_blank' style='z-index:999999'>" + szValue + "</a>";
							}
						}
						szHtml += "<td style='padding-left:0.5em;'>"+szValue+"</td></tr>";
					}
				}
				szHtml += "</table>";
				szHtml += "</div>";
				szHtml += "</div>";

				if ( ++nItems > 100 ){
					break;
				}
			}
			
		}
		
		objTheme.indexA.reverse();

		$("#"+szDiv).html(szHtml);
		$(".listitem").attr("onMouseOver","__onMouseOver(event,$(this).text())");
		$(".listitem").attr("onMouseOut","__onMouseOut()");
		$(".listitem").attr("onClick","__onMouseClick()");
		
	};

	// ------------------------
	// tooltips for SVG charts
	// ------------------------

	var showTooltip = function(evt, text) {
		if (text && text.length) {
			var tooltip = document.getElementById("tooltip");
			tooltip.innerHTML = text;
			tooltip.style.display = "block";
			tooltip.style.left = evt.pageX - 20 + 'px';
			tooltip.style.top = evt.pageY + 20 + 'px';
		}
	}

	var hideTooltip = function() {
		var tooltip = document.getElementById("tooltip");
		tooltip.style.display = "none";
	}

	var oldTarget = null;
	var oldOpacity = null;

	ixmaps.onMouseOver = function() {

		if (oldTarget){
			oldTarget.style.setProperty("fill-opacity",oldOpacity);
			oldTarget = oldOpacity = null;
		}

		var szTooltip = null;
		var source = oldTarget = event.target;

		oldOpacity = oldOpacity || source.style.getPropertyValue("fill-opacity");
		//source.style.setProperty("fill-opacity","1");

		while (!szTooltip && source) {
			szTooltip = source.getAttribute("tooltip");
			time = new Date(Number(source.getAttribute("time")));
			if ((time != "Invalid Date") && time.getTime() ){
				szTooltip = "<span style='font-size:0.8em;line-height:0.5em;color:#cccccc'>"+time.toLocaleDateString()+"</span><br>" + szTooltip;
			}
			source = source.parentNode;
		}
		event.target.style.setProperty("fill-opacity","1");
		showTooltip(event, szTooltip);
		event.stopPropagation();
		event.preventDefault();
	};

	ixmaps.onMouseOut = function() {
		if (oldTarget){
			oldTarget.style.setProperty("fill-opacity",oldOpacity);
			oldTarget = oldOpacity = null;
		}
		hideTooltip();
	};

	ixmaps.data.makeItemList_charts = function (szFilter,szDiv) {

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
		var szData = objThemeDefinition.style.dbtable || objThemeDefinition.data.name;
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

		szHtml += "<div class='title'>&nbsp;&nbsp;"+objTheme.indexA.length+" items on map</div>";
		var maxList = Math.min(objTheme.indexA.length,100);
		if ( maxList < objTheme.indexA.length ){
			szHtml += "<div class='title'>(only the first "+maxList+" items are shown)</div>";
		}
		szHtml += "<hr>";

		var nItems = 0;

		objTheme.indexA.reverse();

		for ( i in objTheme.indexA ){
			
			console.log(objTheme.indexA[i]);

			var dbIndexA = objTheme.itemA[objTheme.indexA[i]].dbIndexA || [objTheme.itemA[objTheme.indexA[i]].dbIndex];

			for ( ii in dbIndexA ){

				index = dbIndexA[ii];

				var szValue = (nValueIndex?(mydata.records[index][nValueIndex]):"");
				var szSize  = (nSizeIndex ?(ixmaps.__bestFormatValue(__scanValue(mydata.records[index][nSizeIndex]), 2, "SPACE") + objTheme.szUnit) :"");
				
				if (objTheme.szFlag.match(/AUTO100/)){
					szSize = "";
				}
				
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

				var szText = "<h3><b>"+szSize+"</b>" + "  "+ szTitle + "</h3>";
				var leftWidth = 0; //window.innerWidth/3;

				szHtml += "<div id='"+objTheme.szId+":"+objTheme.indexA[i]+":chart' item='"+objTheme.indexA[i]+"' class='listitem' style='padding:0.5em 0em 0.7em 0.5em;margin-right:2em;border-bottom:#888 solid 0.5px;pointer-events:none'>";
				
				szHtml += "<div class='title' style='pointer-events:none'>"+szText+"</div>";
				
				// make chart HTML
				szHtml += "<div id='chartDiv"+i+"' style='margin:1em;width:400px;margin:0;overflow:hidden;pointer-events:all;'><svg width='400' height='0' viewBox='-500 -3500 8000 4000'><g id='getchartmenutarget"+i+"'  onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg></div>";
				
				if ( mydata.records[index].length < 15){
					szHtml += "<div class='data' style='pointer-events:none'>";
					szHtml += "<table style='font-size: 1em;line-height:1em;'>";

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
							szHtml += "<tr><td style='text-align:right;vertical-align:top;width:"+leftWidth+"px;color:#aaa;font-size:0.8em;'>"+mydata.fields[d].id+"</td>";
							var szValue = String(mydata.records[index][d]);
							if (szValue.match(/http:/) || szValue.match(/https:/)) {
								if (szValue.match(/.jpg/) || szValue.match(/.png/)) {
									szValue = "<img  src='" + szValue + "' style='max-width:100%'>";
								} else {
									szValue = "<a  href='" + szValue + "' target='_blank' style='z-index:999999'>" + szValue + "</a>";
								}
							}
							szHtml += "<td style='padding-left:0.5em;'>"+szValue+"</td></tr>";
						}
					}
					szHtml += "</table>";
					szHtml += "</div>";
				}
				
				szHtml += "</div>";
				szHtml += "</div>";

				if ( ++nItems > 100 ){
					break;
				}
			}
		}

		$("#"+szDiv).html(szHtml);
		$(".listitem").attr("onMouseOver","__onMouseOver(event,$(this).text())");
		$(".listitem").attr("onMouseOut","__onMouseOut()");
		$(".listitem").attr("onClick","__onMouseClick()");
		
		for ( i in objTheme.indexA ){
			var dbIndexA = objTheme.itemA[objTheme.indexA[i]].dbIndexA || [objTheme.itemA[objTheme.indexA[i]].dbIndex];
			var szFlag = objTheme.szFlag.match(/PLOT/) ? "VALUES|XAXIS|ZOOM|BOX|GRID" :
				(objTheme.szFlag.match(/POINTER/) ? "VALUES|XAXIS" :
					"VALUES|XAXIS|ZOOM");
			var szIdA = objTheme.indexA[i];
			console.log(objTheme.indexA[i]);
			console.log($("#getchartmenutarget"+i)[0]);
			
			setTimeout("ixmaps.data.drawChart("+i+",'" +szIdA+ "','" +szFlag+"')",50);
			//objTheme.drawChart($("#getchartmenutarget"+i)[0], szIdA, 30, szFlag);	
		}

		objTheme.indexA.reverse();
	};
	
	
	ixmaps.data.drawChart = function(i,szIdA,szFlag){
		var objTheme = ixmaps.getThemeObj();
		objTheme.drawChart($("#getchartmenutarget"+i)[0], szIdA, 30, szFlag);
		$("#getchartmenutarget"+i).parent().attr("height","200");
		var SVGBox = $("#getchartmenutarget"+i)[0].getBBox();
		if (SVGBox.width && SVGBox.height) {
			var scale = Math.max(1, 4000 / SVGBox.width);
			SVGBox.width *= scale;
			SVGBox.height *= scale;
			SVGBox.y -= (SVGBox.y+SVGBox.height)/4; //60;
			SVGBox.height -= 60;

			var size = objTheme.szFlag.match(/PLOT|HORZ|STACKED/) ? 400 : 300;
			var width = size;
			var height = size / SVGBox.width * SVGBox.height;

			while (height > width) {
				height *= 0.9;
			}

			$("#getchartmenutarget"+i)[0].parentNode.setAttribute("height", height+20);
			$("#getchartmenutarget"+i)[0].parentNode.setAttribute("viewBox", SVGBox.x + ' ' + SVGBox.y + ' ' + SVGBox.width + ' ' + SVGBox.height);

		} else {
			$("#chartDiv").height(0);
		}

		
		
		
		
		
	};
	
	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


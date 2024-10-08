/**********************************************************************
tooltip_moustache.js

$Comment: provides custem HTML tooltip for iXMaps SVG maps
$Source : tooltip_moustache.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2022/11/02 $
$Author: guenter richter $
$Id: tooltip_moustache.js 1 2022-11-02 10:51:41Z Guenter Richter $map

Copyright (c) Guenter Richter
$Log: tooltip_moustache.js,v $
**********************************************************************/

/** 
 * @fileoverview 
 * This file provides custom HTML tooltip for iXMaps SVG Maps with moustache syntax ({{}})
 *  
 * intercepts tooltip display from the iXMaps SVG map
 *
 * ixmaps.htmlgui_onTooltipDisplay() intercepts the tooltip display of the SVG map and displays the given text in a popup window
 * ixmaps.htmlgui_onTooltipDelete() removes the popup with the tooltip
 * 
 * intercepts mouse over map item events from the iXMaps SVG map
 * 
 * in this case, the code generates a complex tooltip (html) from the item data and uses ixmaps.htmlgui_onTooltipDisplay()
 * to display the generated html
 *
 * ixmaps.htmlgui_onItemOver() generates and displays the custom tooltip
 * ixmaps.htmlgui_onItemClick() generates the same tooltip popup, but 'pinned' 
 *
 * at the end it provides a local tooltip for integrated SVG charts
 * SVG charts are generated using a dedicated method of the theme class (hosted by the SVG map)
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

window.ixmaps = window.ixmaps || {};
(function () {

	// this creates the tooltip/info popup 
	// may be only on mouseover or pinned (click) 

	$.when(
		$.getScript("../../ui/js/tools/format.js"),	
		$.getScript("../../ui/js/tools/mustache.js",
		$.Deferred(function (deferred) {
			$(deferred.resolve);
		})
	).done(function () {
		Mustache.escape = function(string){return string}
		})
	);


	/**
	 * intercept tooltip display of ythe SVG map
	 * used also from htmlgui_onItemOver() to display the generated HTML code
	 *
	 * @param {event} evt the mouse event handler
	 * @param {string} szText the text or HTML code to display
	 * @param {string} szId the id of the tooltip item (SVG object)
	 * @return boolean
	 * @public
	 */

	var __fTooltipPin = false;
	var __fTooltipPinned = false;

	ixmaps.htmlgui_onTooltipDisplay = function (evt, szText, szId) {

		// avoid empty tooltips

		if (!szText || szText.length <= 0) {
			__fTooltipPin = false;
			__fTooltipPinned = false;
			return false;
		}

		// if the parent does not provide a tooltip target, create it

		if (!window.document.getElementById("tooltip")) {
			var div = document.createElement("div");
			div.setAttributeNS(null, "id", "tooltip");
			document.activeElement.appendChild(div);
		}

		// -----------------------------------------------------
		// take the text from the argument and create the popup 
		// -----------------------------------------------------

		var width = Math.min(400, window.innerWidth / 2);
		var height = window.innerHeight / 1.5;

		var xPos = evt.clientX;
		var yPos = evt.clientY;

		if (evt.type == 'touchstart' || evt.type == 'touchmove' || evt.type == 'touchend' || evt.type == 'touchcancel') {
			var touch = evt.touches[0] || evt.changedTouches[0];
			xPos = touch.pageX;
			yPos = touch.pageY;
		} else if (evt.type == 'mousedown' || evt.type == 'mouseup' || evt.type == 'mousemove' || evt.type == 'mouseover' || evt.type == 'mouseout' || evt.type == 'mouseenter' || evt.type == 'mouseleave') {
			xPos = evt.clientX;
			yPos = evt.clientY;
		}

		var fontsize = Math.min(14, Math.max(11, (22 / 1200 * window.innerWidth)));

		// make tooltip container 
		//

		var szHtml = "";

		szHtml += "<div id='tooltipDiv' style='position:absolute;left:" + xPos + "px;top:" + yPos + "px;font-family: arial narrow, system;font-size:" + fontsize + "px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px;padding:0.5em;;box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 3px 10px 0 rgba(0, 0, 0, 0.19);'>";

		// insert tooltip content (szText) 
		//
		szHtml += "<div style='margin:0.5em 0.5em;max-width:" + width + "px;max-height:" + height + "px;overflow:auto'>" + szText + "</div>";

		// create delete button for tooltip -> pop up
		//
		if (__fTooltipPin) {

			ixmaps.htmlgui_deleteItemPinned = ixmaps.htmlgui_deleteItemPinned || function () {
				__fTooltipPinned = false;
				__fTooltipPin = false;
				//ixmaps.setMapOverlayHTML("");
				window.document.getElementById("tooltip").innerHTML = "";
				ixmaps.clearHighlight();
			};
			szHtml += "<div onclick='ixmaps.htmlgui_deleteItemPinned()' style='position:absolute;top:-0.7em;right:-0.7em'><img src='../../ui/resources/images/delete.png' height='22px'></div>"
			__fTooltipPinned = true;
		}

		szHtml += "</div>";

		// realize the tooltip

		window.document.getElementById("tooltip").innerHTML = szHtml;

		// position the tooltip 

		var width = window.document.getElementById("tooltipDiv").clientWidth;
		var height = window.document.getElementById("tooltipDiv").clientHeight;

		xPos = xPos > window.innerWidth / 2 ? (xPos - width - 30) : xPos + 30;
		yPos = yPos > window.innerHeight / 2 ? (yPos - height) : (yPos + 20);
        
        yPos = Math.min(Math.max(10,yPos),window.innerHeight-height);
        
		window.document.getElementById("tooltipDiv").style.left = xPos + "px";
		window.document.getElementById("tooltipDiv").style.top = yPos + "px";

		// adapt tooltip background to the map style

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "rgba(50,50,50,0.85)");
			window.document.getElementById("tooltipDiv").style.setProperty("border-color", "#555");
		} else {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "rgba(255,255,255,0.95)");
		}
		if (window.document.getElementById("tooltipChartContainer")) {
			window.document.getElementById("tooltipChartContainer").scrollLeft = 200;
		}
		// tooltip ready, return true!

		return true;
	}

	/**
	 * remove the tooltip
	 * @return boolean
	 * @public
	 */
	ixmaps.htmlgui_onTooltipDelete = function () {
		if (__fTooltipPinned) {
			return false;
		}
		//ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		return true;
	}

	// -------------------------------------------------------------
	//
	// intercept mouse over map item and create the tooltip
	//
	// -------------------------------------------------------------

	/**
	 * intercept mouse over map item and create the tooltip
	 * overwrites previous defined mouseover handling
	 *
	 * this creates the custom tooltip content from theme/item data
	 *
	 * @param {event} evt the mouse event handler
	 * @param {string} szId the id of the mouseover opbject (SVG object)
	 * @return boolean
	 * @public
	 */

	ixmaps.htmlgui_onItemOver = function (evt, szId) {

		if (__fTooltipPinned) {
			return true;
		}

		var fThemeChart = false;
		var fThemeData = false;

		// ------------------------------------
		// get the theme object from item id
		// ------------------------------------
		
		console.log("=== item over ===");
		console.log(szId);
		

		// 1.try
		var themeObj = ixmaps.getThemeObj(szId.split(":")[0]);

		// check and if not the right theme (possible if onOver on map shape)
		if (!(themeObj.szId == szId.split(":")[0])) {
			// look in all CHOROPLETH themes for the a corrisponding one
			//
			var themes = ixmaps.getThemes();
			for (i in themes) {
				if (themes[i].szThemes == szId.split(":")[0] && themes[i].szFlag.match(/CHOROPLETH|FEATURES/)) {
					themeObj = themes[i];
				}
			}
			
			szId = themeObj.szId+":"+szId;
		}
		
		console.log("=== theme ===");
		console.log(themeObj.szId);
		console.log(themeObj.szFlag);
		console.log(themeObj);

		// ------------------------------------------
		// start creating the tooltip content
		// ------------------------------------------

		// create a theme item list compatible item id
		// to get the chart, see __add_chart(themeObj,szItem)
		//
		var szItem = szId;
		if (szId.match(/chartgroup/)) {
			szItem = szId.split(":chartgroup")[0].split(":");
			szItem = szItem[1] + "::" + szItem[3];
		} else
		if (szId.match(/text/)) {
			szItem = szId.split(":text")[0].split(":");
			szItem = szItem[1] + "::" + szItem[3];
		} else {
			szItem = szId.split(/\b\:\b/)[1];
		}
		
		if (!szItem || !szItem.length || szItem.match(/mapbackground/i)) {
			__fTooltipPin = false;
			__fTooltipPinned = false;
			return;
		}
		if (!szId.match(/\:\:/)) {
			var obj = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szItem);
			var szChartId = szItem.match(/::/) ? szId : obj.parentNode.getAttribute("id");
			var szIdA = szChartId.split("#");
			if (szIdA.length > 1) {
				var szIdAA = szIdA[1].split(/\b::\b/);
				szChartId = szIdA[0] + "::" + szIdAA[1];
			}
			szItem = szChartId;
		}
		console.log("=== item ===");
		console.log(szItem);
		
		// get data and tooltip (mustache) template
		
		//var szHtml = themeObj.szTooltip || "no template! ";
		var szHtml = themeObj.szTooltip || "<span style='white-space:nowrap;font-size:1.5em'>{{theme.title}}</span><br>{{theme.item.title}}{{theme.item.chart}}";
		
		var data = ixmaps.map().getData(szId);
		
		console.log("=== item data ===");
		console.log(data);
		var nValue = themeObj.itemA[szItem].nValue || themeObj.itemA[szItem].nValuesA[0];
		if (themeObj.itemA[szItem].nValuesA.length > 1){
			nValue = 0;
			for (i in themeObj.itemA[szItem].nValuesA){
				nValue += themeObj.itemA[szItem].nValuesA[i];
			}
		}
		var szLabel = "";
		if (themeObj.szFlag.match(/\bCLIP\b/)){
			nValue = themeObj.itemA[szItem].nValuesA[themeObj.nActualFrame];
			szLabel = themeObj.szXaxisA[themeObj.nActualFrame];
		}
		var szTitle = themeObj.itemA[szItem].szTitle;
	
		// make data object to feed mustache rendering
		
		var dataObj = {};
		
		dataObj.theme = dataObj.theme || {};
		dataObj.theme.title = themeObj.szTitle;
		dataObj.theme.snippet = themeObj.szSnippet;
		dataObj.theme.description = themeObj.szDescription;
		dataObj.theme.chart = __add_chart(themeObj,szItem);
		dataObj.theme.item = dataObj.theme.item || {};
		dataObj.theme.item.chart = dataObj.theme.chart;
		dataObj.theme.item.data = __add_data(themeObj,szId);
		dataObj.theme.item.value = ixmaps.formatValue(nValue,themeObj.nValueDecimals||2,"BLANK");
		dataObj.theme.item.label = szLabel;
		dataObj.theme.item.title = szTitle;
		dataObj.theme.item.count = data.length;
		dataObj.raw = {};
		dataObj.local = {};
		
		if (data){
			dObj = data[0];
			for (var i in dObj){
				if (!isNaN(dObj[i])){
					dataObj[i] = (ixmaps.formatValue(dObj[i],themeObj.nValueDecimals||2,"BLANK"));
					dataObj.raw[i] =  (dObj[i]);
				}else{
					dataObj[i] = (dObj[i]);
					dataObj.local[i] = (ixmaps.getLocalString(dObj[i]));
				}
			}
		}
			
		// ------------------------------------------------------------------------------
		// tooltip content is ready 
		// now show the tooltip using the tooltip hook ixmaps.htmlgui_onTooltipDisplay()
		// ------------------------------------------------------------------------------

		if (typeof (Mustache) === "undefined") {
			alert("mustache not loaded!");
		} else {
			szHtml = Mustache.render(szHtml, dataObj);
			ixmaps.htmlgui_onTooltipDisplay(evt, szHtml, szId);
		}
		
		return true;
	};

	/**
	 * create item SVG CHART
	 * get the items ZOOM chart from the theme into an SVG environment,
	 * and scale it to the tooltip
	 *
	 * @param {object} themeObj the ixmaps theme object
	 * @param {string} szItem the id of the mouseover opbject (item)
	 * @return {string} the embeddeb and scaled SVG chart code
	 * @public
	 */
	
	var __add_chart = function(themeObj,szItem){
		
		var suffix = "";
		var szHtml = "";

		// ------------------------------------------
		//
		// add chart 
		//
		// ------------------------------------------
		
		var origThemeObj = themeObj;

		if (!themeObj.szFlag.match(/TOOLTIPNOCHART/)) {

			if (!window.document.getElementById("chartDiv")) {
				var div = document.createElement("div");
				div.setAttributeNS(null, "id", "chartDiv");
				div.setAttributeNS(null, "style", "margin:0.5em 1em;overflow:hidden");
				document.activeElement.appendChild(div);
			}

			// prepare chart hosting SVG div (is not the final host of the chart)
			//
			var szTarget = "<svg width='300' height='300' viewBox='0 0 6000 6000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg>";
			try {
				window.document.getElementById("getchartmenutarget").remove();
			} catch (e) {}
			window.document.getElementById("chartDiv").innerHTML = szTarget;

			// request chart from map 
			// -----------------------
			if (themeObj.szFlag.match(/BAR/) && themeObj.szFlag.match(/STACKED/)){
				themeObj.getChart(window.document.getElementById("getchartmenutarget"), szItem, 60, "VALUES|XAXIS|NOSIZE|BOX|GRID");
			} else
			if (themeObj.szFlag.match(/CHART|COMPOSECOLOR|DOMINANT|SUBTHEME/)){
				themeObj.getChart(window.document.getElementById("getchartmenutarget"), szItem, 30, "VALUES|XAXIS|ZOOM|BOX|GRID");
			}else{
				var themesA = ixmaps.getThemes();
				for (var t = themesA.length-1; t >= 0; t--) {
					var themeObj = themesA[t];
					if (themeObj.szFlag.match(/CHART|COMPOSECOLOR/)){
						themeObj.getChart(window.document.getElementById("getchartmenutarget"), szItem, 30, "VALUES|XAXIS|NORMSIZE|ZOOM|BOX|GRID");
						break;
					}
				}
			}

			// check if chart has been created 
			//
			var SVGBox = window.document.getElementById("getchartmenutarget").getBBox();
			if (SVGBox && SVGBox.width && SVGBox.height) {
				
				fThemeChart = true;

				// if yes, scale the chart
				//
				var width = Math.min(400, window.innerWidth / 2.5);
				var height = window.innerHeight / 2;
				
				
				if (themeObj.szFlag.match(/PLOT/)) {
					width /= Math.max(1, (3 / themeObj.itemA[szItem].nValuesA.length));	
				} else
				if (themeObj.szFlag.match(/(BAR)|PLOT|CHOROPLETH/)) {
					var nSymbols = 0;
					for ( i in themeObj.itemA[szItem].nValuesA ){
						nSymbols += themeObj.itemA[szItem].nValuesA[i]?1:1;
					}
					if ( themeObj.szFlag.match(/CHOROPLETH/) ){
						height = nSymbols*15;
						width = height / SVGBox.height * SVGBox.width;
					}else{
						width = 100 + nSymbols*30;	
					}
				} else
				if (themeObj.szFlag.match(/(SYMBOL)|SEQUENCE/)) {
					var nSymbols = 0;
					for ( i in themeObj.itemA[szItem].nValuesA ){
						nSymbols += themeObj.itemA[szItem].nValuesA[i]?1:0;
					}
					width = 100 + nSymbols*30;	
				} else {
					width /= themeObj.szFlag.match(/PIE/) ? 2 : 3;
				}
				height = width / SVGBox.width * SVGBox.height;
				while (height > window.innerHeight / 3) {
					width *= 0.9;
					height *= 0.9;
				}
				// create some space around the chart, some need it 
				if (themeObj.szFlag.match(/PLOT/)) {
					SVGBox.width += 200;
					SVGBox.height += 200;
				} else
				if (themeObj.szFlag.match(/BUBBLE|SYMBOL|PIE/) && !themeObj.szFlag.match(/PLOT/)) {
					var space = Math.min(SVGBox.width,SVGBox.height)/50;
					SVGBox.x -= space;
					SVGBox.y -= space;
					SVGBox.width += space*2;
					SVGBox.height += space*2;
					//width *= 1.01;
					//height *= 1.01;
				}

				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("width", width);
				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("height", height);
				window.document.getElementById("getchartmenutarget").parentNode.setAttribute("viewBox", SVGBox.x + ' ' + SVGBox.y + ' ' + SVGBox.width + ' ' + SVGBox.height);

				// then get the chart code (html,svg) and insert into the tooltip HTML code
				szHtml += "<div id='tooltipChartContainer' style='overflow:auto'>"+ window.document.getElementById("chartDiv").innerHTML +"</div>";
				// and delete the temporary chart hosting div !!
				window.document.getElementById("chartDiv").remove();
			}else{
				window.document.getElementById("chartDiv").remove();
			}

			//szHtml += "</div>";

			szHtml += "<div id='tooltip_2' style='position:absolute;font-family: arial narrow, system;color:#444;background:white;border:0.5px solid black;border-radius:5px;padding:5px;max-width:80%;display:none'></div>";
		}

		return szHtml;
	
	};

	/**
	 * create item data Table
	 * get the items data from the theme 
	 * create a HTML table
	 *
	 * @param {object} themeObj the ixmaps theme object
	 * @param {string} szItem the id of the mouseover opbject (item)
	 * @return {string} the embeddeb and scaled SVG chart code
	 * @public
	 */
	
	var __add_data = function(themeObj,szItem){
		
		var suffix = "";
		var szHtml = "";

		// adapt content to map style
		//
		var normal = "#000000";
		var highLight = "#000000";
		var highLightBg = "#e8e8e8";

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			normal = "#bbbbbb";
			highLight = "#ffffff";
			highLightBg = "#808080";
		}
		
		var origThemeObj = themeObj;

		themeObj = origThemeObj;
		var	fThemeData = false;
		
		// ------------------------------------------
		//
		// add data table ? 
		//
		// ------------------------------------------

		if (themeObj.fShowData) {
			
			// get the data, and make tooltip content
			// ---------------------------------------
			//
			var data = ixmaps.map().getData(szItem);

			if (data) {

				szHtml += "<table class='tooltip' style='font-size:0.85em;spacing:0.5em;min-width:300px'>"

				for (d = 0; d < Math.min(50, data.length); d++) {

					if (data.length > 1) {
						szHtml += "<tr><td style='font-size:1em;'>&nbsp;</td><tr>";
						szHtml += "<tr><td style='font-size:1.5em;border:solid black 1px;border-radius:1em;padding:0.1em 0.4em 0em 0.3em'>"+(d+1)+"</td><tr>";
					}

					var dataObject = data[d];
					for (i in dataObject) {
						if ((i == "geometry")) {
							continue;
						}
						if (themeObj.szDataFieldsA) {
							var fShow = false;
							for (var f = 0; f < themeObj.szDataFieldsA.length; f++) {
								if (themeObj.szDataFieldsA[f] == i) {
									fShow = true;
								}
							}
							if (!fShow){
								continue;
							}
						}
						var value = dataObject[i];
						var szValue = (isNaN(value) || value < 10000) ? String(value) : String(value);

						if (szValue.match(/http:/) || szValue.match(/https:/)) {
							if (szValue.match(/.jpg/) || szValue.match(/.jpeg/) || szValue.match(/.png/)) {
								szValue = "<img  src='" + szValue + "' style='max-width:100%'>";
								szHtml += "<tr><td></td><td class='label'>" + i + "</td><td class='value clip'>" + szValue + "</td></tr>";
							} else {
								szValue = "<a  href='" + szValue + "' target='_blank' style='width:100px'>" + szValue + "</a>";
								szHtml += "<tr><td></td><td class='label'>" + i + "</td><td class='value clip'>" + szValue + "</td></tr>";
							}
						} else {
							if (!i.match(/------/)) {
								if (0 && (i == themeObj.szColorField ||
										(themeObj.szFieldsA.indexOf(i) >= 0))) {
									var color = themeObj.colorScheme[themeObj.nStringToValueA[szValue] - 1];
									szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#888888;' ><b>" + (i) + "</b></td><td class='value' style='color:" + "#000000" + ";background:" + color + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								} else
								if (i == themeObj.szSizeField ||
									i == themeObj.szSymbolField ||
									(themeObj.szFieldsA.indexOf(i) >= 0)
								) {
									szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#000000;' ><b>" + (i) + "</b></td><td class='value' style='color:" + highLight + ";background:" + highLightBg + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								} else {
								szHtml += "<tr><td></td><td class='label' style='text-align:right;color:#cccccc';' >" + (i) + "</td><td class='value' style='color:" + normal + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								}
							} else {}
						}
					}
				}
				szHtml += "</table>";
				
				fThemeData = true;
			}

		}
		
		var obj = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szItem);
		if ( 0 && obj ){

			var szId =  ixmaps.embeddedSVG.window.map.Api.getShapeId(obj);
			var szChartId = szId.match(/::/) ? szId : obj.parentNode.getAttribute("id");
			
			if (themeObj.fShowData){

				// get shape info
				// --------------------------
				var layerA = ixmaps.getLayer();

				var szLayer = (szChartId.split("::")[0]);
				var szLayerName = layerA[szLayer].szLegendName || szLayerName;

				var szItemName = (szChartId.split("::")[1]);
				if (!isNaN(szItemName)) {
					szItemName = layerA[szLayer].szSelection + ": " + szItemName;
				} else {
					szItemName = szItemName;
					szLayerName += ":";
				}

				// get map shape metadata or theme data
				// ------------------------------------
				var child = obj.childNodes.item(1);
				var data = ixmaps.embeddedSVG.window.map.Api.getShapeMetadataArray(child || obj);

				// list data
				// ----------
				if ( data ) {
					szHtml += "<table style='font-size:0.85em;spacing:0.5em;min-width:300px'>"

					var dataObject = data;
					for (i in dataObject) {
						if ((i == "geometry")) {
							continue;
						}
						if (themeObj.szDataFieldsA) {
							var fShow = false;
							for (var f = 0; f < themeObj.szDataFieldsA.length; f++) {
								if (themeObj.szDataFieldsA[f] == i) {
									fShow = true;
								}
							}
							if (!fShow){
								continue;
							}
						}

						var value = dataObject[i];
						var szValue = (isNaN(value) || value < 10000) ? String(value) : String(value);
						if (szValue.match(/http:/) || szValue.match(/https:/)) {
							if (szValue.match(/.jpg/) || szValue.match(/.jpeg/) || szValue.match(/.png/)) {
								szValue = "<img  src='" + szValue + "' style='max-width:100%'>";
								szHtml += "<tr><td></td><td class='label'>" + i + "</td><td class='value clip'>" + szValue + "</td></tr>";
							} else {
								szValue = "<a  href='" + szValue + "' target='_blank' style='width:100px'>" + szValue + "</a>";
								szHtml += "<tr><td></td><td class='label'>" + i + "</td><td class='value clip'>" + szValue + "</td></tr>";
							}
						} else {
							if (!i.match(/------/)) {
								if (0 && (i == themeObj.szColorField ||
										(themeObj.szFieldsA.indexOf(i) >= 0))) {
									var color = themeObj.colorScheme[themeObj.nStringToValueA[szValue] - 1];
									szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#888888;' ><b>" + (i.replace(/\_/g, " ")) + "</b></td><td class='value' style='color:" + "#000000" + ";background:" + color + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								} else
								if (i == themeObj.szSizeField ||
									i == themeObj.szSymbolField ||
									(themeObj.szFieldsA.indexOf(i) >= 0)
								) {
									szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#000000;' ><b>" + (i.replace(/\_/g, " ")) + "</b></td><td class='value' style='color:" + highLight + ";background:" + highLightBg + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								} else {
									szHtml += "<tr><td></td><td class='label' style='text-align:right;color:#cccccc';' >" + (i.replace(/\_/g, " ")) + "</td><td class='value' style='color:" + normal + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
								}
							} else {}
						}
					}
					szHtml += "</table>";
				}
			}
		}
		
		return szHtml;
	
	};
	
	
	
	// ==============================================================
	//
	// intercept mouse click on map item
	//
	// ==============================================================

	/**
	 * intercept mouse click on map item and redirect to onItemOver()
	 * overwrites previous defined mouse click handling
	 *
	 * @param {event} evt the mouse event handler
	 * @param {string} szId the id of the mouseover opbject (SVG object)
	 * @return boolean
	 * @public
	 */
	ixmaps.htmlgui_onItemClick = function (evt, szId) {
		if (!(evt && szId)) {
			return;
		}
		__fTooltipPinned = false;
		__fTooltipPin = true;
		return ixmaps.htmlgui_onItemOver(evt, szId);
	}

	// ============================
	//
	// tooltips for SVG charts
	//
	// ============================

	/**
	 * show tooltip on chart
	 *
	 * @param {event} evt the mouse event handler
	 * @param {string} text the text to show
	 * @return void
	 * @public
	 */
	var showTooltip = function (evt, text) {
		if (text && text.length) {
			var page = document.getElementById("tooltipDiv");
			var tooltip = document.getElementById("tooltip_2");
			tooltip.innerHTML = text;
			tooltip.style.display = "block";
			tooltip.style.left = evt.pageX - parseFloat(page.style.left) - 20 + 'px';
			tooltip.style.top = evt.pageY - parseFloat(page.style.top) + 20 + 'px';
		}
	}

	/**
	 * remove tooltip on chart
	 * @return void
	 * @public
	 */
	var hideTooltip = function () {
		var tooltip = document.getElementById("tooltip_2");
		tooltip.style.display = "none";
	}

	/**
	 * onMouse over handler
	 * @return void
	 * @public
	 */
	var oldTarget = null;
	var oldOpacity = null;

	ixmaps.onMouseOver = function () {

		if (oldTarget) {
			oldTarget.style.setProperty("fill-opacity", oldOpacity);
			oldTarget = oldOpacity = null;
		}

		var szTooltip = null;
		var source = oldTarget = event.target;

		oldOpacity = oldOpacity || source.style.getPropertyValue("fill-opacity");
		//source.style.setProperty("fill-opacity","1");

		while (!szTooltip && source) {
			szTooltip = source.getAttribute("tooltip");
			time = new Date(Number(source.getAttribute("time")));
			if ((time != "Invalid Date") && time.getTime()) {
				szTooltip = "<span style='font-size:0.8em;line-height:0.5em;color:#cccccc'>" + time.toLocaleDateString() + "</span><br>" + szTooltip;
			}
			source = source.parentNode;
		}
		// try to format tooltip

		var szTestA = szTooltip.split(" ");
		var szValue = "";
		var szUnit = "";
		var fValue = true;
		szTestA.forEach(function (value) {
			if (fValue && !isNaN(value)) {
				szValue += (value + " ");
			} else {
				fValue = false;
				szUnit += (value + " ");
			}
			if (value == "...") {
				szValue += (value + " ");
				fValue = true;
			}
		})
		if (szUnit.match(/\%/)) {
			szUnit = szUnit.replace("\%", "");
			szValue += " %";
		}
		if (szUnit.match(/\$/)) {
			szUnit = szUnit.replace("\$", "");
			szValue += " $";
		}
		if (szUnit.match(/\€/)) {
			szUnit = szUnit.replace("\€", "");
			szValue += " €";
		}
		szUnit = szUnit.replace("\[", "");
		szUnit = szUnit.replace("\]", "");

		szValue.trim();
		szTestA = szValue.split(" ");
		if (0 && szTestA.length > 2) {
			szTestA[szTestA.length - 2] = "<span style='font-size:0.9em;color:#aaaaaa'>" + szTestA[szTestA.length - 2] + "</span>";
		}
		szValue = szTestA.join(" ");

		szTooltip = "<div style='font-size:0.9em;line-height:1.2em;color:#aaaaaa;max-width:300px'>" + szUnit + "</div><div style='font-size:1.5em;margin:-0em 0.5em -0.1em 0em;white-space:nowrap'>" + szValue + "</div>";

		event.target.style.setProperty("fill-opacity", "1");
		showTooltip(event, szTooltip);
		event.stopPropagation();
		event.preventDefault();
	};

	/**
	 * onMouse out handler
	 * @return void
	 * @public
	 */
	ixmaps.onMouseOut = function () {
		if (oldTarget) {
			oldTarget.style.setProperty("fill-opacity", oldOpacity);
			oldTarget = oldOpacity = null;
		}
		hideTooltip();
		event.stopPropagation();
		event.preventDefault();
	};

	/**
	 * dummies for PIE CHARTS
	 */
	DonutCharts = {};
	DonutCharts.partOver = function () {};
	DonutCharts.partOut = function () {};



})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

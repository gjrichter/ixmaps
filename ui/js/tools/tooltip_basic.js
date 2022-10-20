/**
 * data broker for COVID-19 Italy Map
 * loads data fro ArcGis feature service
 * parses it into iXMaps data table
 */

window.ixmaps = window.ixmaps || {};
(function () {

	// this creates the tooltip/info popup 
	// may be only on mouseover or pinned (click) 

	var __fTooltipPin = false;
	var __fTooltipPinned = false;

	ixmaps.htmlgui_onTooltipDisplay = function (evt, szText, szId) {

		// avoid empty tooltips

		if (!szText || szText.length <= 0) {
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
		var height = window.innerHeight / 2;

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

		szHtml += "<div id='tooltipDiv' style='position:absolute;left:" + xPos + "px;top:" + yPos + "px;font-family: arial narrow, system;font-size:" + fontsize + "px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px;margin-top:0.7em;margin-right:0.7em;'>";

		// insert tooltip content (szText) 
		//
		szHtml += "<div style='margin:0.5em 0.5em;max-width:" + width + "px;max-height:" + height + "px;overflow:auto'>" + szText + "</div>";

		// create delete button for tooltip -> pop up
		//
		if (__fTooltipPin) {

			ixmaps.htmlgui_deleteItemPinned = ixmaps.htmlgui_deleteItemPinned || function () {
				__fTooltipPinned = false;
				__fTooltipPin = false;
				ixmaps.setMapOverlayHTML("");
				window.document.getElementById("tooltip").innerHTML = "";
				ixmaps.clearHighlight();
			};
			szHtml += "<div onclick='ixmaps.htmlgui_deleteItemPinned()' style='position:absolute;top:-0.5em;right:-0.5em;font-size:16px;color:white;background:#444444;padding:0 0.25em;border-radius:1em;cursor:pointer;'>&Cross;</div>"
			__fTooltipPinned = true;
		}

		szHtml += "</div>";

		// realize the tooltip

		window.document.getElementById("tooltip").innerHTML = szHtml;

		// position the tooltip 

		var width = window.document.getElementById("tooltipDiv").clientWidth;
		var height = window.document.getElementById("tooltipDiv").clientHeight;

		xPos = xPos > window.innerWidth / 2 ? (xPos - width - 30) : xPos + 30;
		yPos = yPos > window.innerHeight / 3 ? (yPos - height + 150) : (yPos + 20);
		window.document.getElementById("tooltipDiv").style.left = xPos + "px";
		window.document.getElementById("tooltipDiv").style.top = yPos + "px";

		// adapt tooltip background to the map style

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "#333");
		}else{
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "rgba(255,255,255,0.75)");
		}

		// tooltip ready, return true!

		return true;
	}

	// remove the created tooltip 

	ixmaps.htmlgui_onTooltipDelete = function () {
		if (__fTooltipPinned) {
			return false;
		}
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		return true;
	}

	// -------------------------------------------------------------
	//
	// intercept mouse over map item and create the tooltip
	// overwrites previous defined mouseover handling
	// 
	// this creates the custom tooltip content from theme/item data
	//
	// -------------------------------------------------------------

	ixmaps.htmlgui_onItemOver = function (evt, szId) {

		if (__fTooltipPinned) {
			return true;
		}

		// ------------------------------------
		// get the theme object from item id
		// ------------------------------------

		// 1.try
		var themeObj = ixmaps.getThemeObj(szId.split(":")[0]);

		// check and if not the right theme (possilble if onOver on map shape)
		if (!(themeObj.szId == szId.split(":")[0])) {

			// look in all CHOROPLETH themes for the a corrisponding one
			//
			var themes = ixmaps.getThemes();
			for (i in themes) {
				if (themes[i].szThemes == szId.split(":")[0] && themes[i].szFlag.match(/CHOROPLETH/)) {
					console.log("found the right theme:" + i);
					themeObj = themes[i];
				}
			}
		}

		// ------------------------------------------
		// start creating the tooltip content
		// ------------------------------------------

		// create a theme item list compatible item id
		//
		var szItem = szId;
		if (szId.match(/chartgroup/)) {
			szItem = szId.split(":chartgroup")[0].split(":");
			szItem = szItem[1] + "::" + szItem[3];
		}
		if (!szItem || !szItem.length || szItem.match(/mapbackground/i)) {
			return;
		}

		// here we go
		//
		var szHtml = "<div style='font-size:18px;min-width:150px;max-width:400px'>";

		// insert theme title
		szHtml += "<p style='font-size:12px;margin-top:0em;margin-bottom:0.5em'>" + themeObj.szTitle + "</p>";

		// insert item title and value, if theme has only one value
		if (themeObj.itemA[szItem] && (themeObj.itemA[szItem].nValuesA.length == 1)) {
			var nValue = themeObj.itemA[szItem] ? (themeObj.itemA[szItem].nValue || themeObj.itemA[szItem].nValuesA[0]) : "";
			var szSign = ((nValue > 0) && themeObj.szFlag.match(/SIGN/)) ? "+" : "";
			szHtml += "<h4 style='margin-top:0em;margin-bottom:0.5em'>" + (themeObj.itemA[szItem] ? (themeObj.itemA[szItem].szTitle || ("[" + szId + "]")) : "") + "</br>" + szSign + nValue.toFixed(2) + themeObj.szUnit + "</h5>";
		} else {
			// if theme has more values, insert only item title
			szHtml += "<h4 style='margin-top:0em;margin-bottom:0.5em'>" + (themeObj.itemA[szItem] ? (themeObj.itemA[szItem].szTitle || ("[" + szId + "]")) : "") + "</h5>";
		}

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
		var suffix = "";

		// ------------------------------------------
		// add data table ? 
		// ------------------------------------------

		if (themeObj.fShowData) {

			// item is not a chart -> item is a map shape
			// then we have to get the id for tyhe data in another way
			//
			if (!szId.match(/chart/i)) {
				var obj = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szId);
				var szChartId = szId.match(/::/) ? szId : obj.parentNode.getAttribute("id");
				var szIdA = szChartId.split("#");
				if (szIdA.length > 1) {
					var szIdAA = szIdA[1].split(/\b::\b/);
					szChartId = szIdA[0] + "::" + szIdAA[1];
					szTitle = szIdAA[1];
				}
				szId = ixmaps.getThemes()[1].szId + ":" + szChartId + ":chartgroup";
			}

			// get the data, and make tooltip content
			// ---------------------------------------
			//
			var data = ixmaps.map().getData(szId);

			if (data) {
				
				szHtml += "<table style='font-size:0.7em;spacing:0.5em;min-width:200px'>"

				for (d = 0; d < Math.min(50, data.length); d++) {

					var dataObject = data[d];
					for (i in dataObject) {
						if ((i == "geometry")) {
							continue;
						}
						var value = dataObject[i];
						var szValue = (isNaN(value) || value < 10000) ? String(value) : String(value);
						if (szValue.match(/http:/) || szValue.match(/https:/)) {
							if (szValue.match(/.jpg/) || szValue.match(/.png/)) {
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
					if (d < data.length - 1) {
						szHtml += "<tr><td style='font-size:0.2em'>&nbsp;</td><tr>";
					}
				}
				szHtml += "</table>";
			}
		}


		// ------------------------------------------
		// add chart 
		// ------------------------------------------
		
		if (!window.document.getElementById("chartDiv")) {
			var div = document.createElement("div");
			div.setAttributeNS(null, "id", "chartDiv");
			div.setAttributeNS(null, "style", "margin:0.5em 1em;overflow:hidden");
			document.activeElement.appendChild(div);
		}
		
		// prepare chart hosting SVG div (is not the final host of the chart)
		//
		var szTarget = "</div><svg width='300' height='300' viewBox='0 0 5000 5000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg>";
		try {
			window.document.getElementById("getchartmenutarget").remove();
		} catch (e) {}
		window.document.getElementById("chartDiv").innerHTML = szTarget;
		
		// request chart from map 
		// -----------------------
		themeObj.drawChart(window.document.getElementById("getchartmenutarget"), szItem, 30, "VALUES|XAXIS|ZOOM|BOX|GRID");
		
		// check if chart has been created 
		//
		var SVGBox = window.document.getElementById("getchartmenutarget").getBBox();
		if (SVGBox && SVGBox.width && SVGBox.height) {
			
			// if yes, scale the chart
			//
			var width = Math.min(400, window.innerWidth / 2);
			var height = window.innerHeight / 2;
			var scale = 1; //Math.max(1, width / SVGBox.width);

			SVGBox.width *= scale;
			SVGBox.height *= scale;

			width /= Math.max(1, (3 / themeObj.itemA[szItem].nValuesA.length));
			height = width / SVGBox.width * SVGBox.height;
			while (height > width) {
				height *= 0.9;
			}

			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("width", width);
			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("height", height);
			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("viewBox", SVGBox.x + ' ' + SVGBox.y + ' ' + SVGBox.width + ' ' + SVGBox.height);
			
			// then get the chart code (html,svg) and insert into the tooltip HTML code
			szHtml += window.document.getElementById("chartDiv").innerHTML;
			// and delete the temporary chart hosting div !!
			window.document.getElementById("chartDiv").remove();
		}

		szHtml += "</div>";
		
		// tooltip content is ready 
		// now show the tooltip using the tooltip hook ixmaps.htmlgui_onTooltipDisplay()
		
		ixmaps.htmlgui_onTooltipDisplay(evt, szHtml, szId);

		return true;
	}

	// -------------------------------------------------------------
	//
	// intercept mouse click on map item and redirect to onItemOver()
	// overwrites previous defined mouse click handling
	//
	// -------------------------------------------------------------

	ixmaps.htmlgui_onItemClick = function (evt, szId) {
		if (!evt) {
			return;
		}
		__fTooltipPinned = false;
		__fTooltipPin = true;
		return ixmaps.htmlgui_onItemOver(evt, szId);
	}

})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

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

		var szHtml = "";

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

		szHtml += "<div id='tooltipDiv' style='position:absolute;left:" + xPos + "px;top:" + yPos + "px;font-family: arial narrow, system;font-size:" + fontsize + "px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px;margin-top:0.7em;margin-right:0.7em;'>";
		console.log(szText);
		szHtml += "<div style='margin:0.5em 0.5em;max-width:" + width + "px;max-height:" + height + "px;overflow:auto'>" + szText + "</div>";

		szHtml += "<div id='chartDiv' style='margin:0.5em 1em;overflow:hidden'><svg width='300' height='300' viewBox='0 0 5000 5000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg></div>";


		// create delete button 

		if (__fTooltipPin) {
			szHtml += "<div onclick='ixmaps.htmlgui_deleteItemPinned()' style='position:absolute;top:-0.5em;right:-0.5em;font-size:16px;color:white;background:#444444;padding:0 0.25em;border-radius:1em;cursor:pointer;'>&Cross;</div>"
			__fTooltipPinned = true;
		}

		szHtml += "</div>";

		// -----------------------------------------------------
		// let's see if we can add some chart (SVG) of the theme
		// -----------------------------------------------------

		window.document.getElementById("tooltip").innerHTML = szHtml;
		//szId = szId || evt.path[1].getAttributeNS(null, "id");
		if ( szId.match(/chart/i)){
			console.log("=================");
			console.log(szId);
			console.log("=================");
			var szIdA = szId.split(":");
			var szFlag = "VALUES|XAXIS|ZOOM|BOX|GRID";
			var themesA = ixmaps.getThemes();
			for (var t = 0; t < themesA.length; t++) {
				var objTheme = themesA[t];
				if (objTheme.szFlag.match(/PLOT|CHART/)) {
					console.log(objTheme.szFlag);
					objTheme.drawChart(window.document.getElementById("getchartmenutarget"), szIdA[1] + "::" + szIdA[3], 30, szFlag);
				}
			}
		}

		var SVGBox = window.document.getElementById("getchartmenutarget").getBBox();
		console.log(SVGBox);
		if (SVGBox && SVGBox.width && SVGBox.height) {
			var scale = Math.max(1, width / SVGBox.width);
			SVGBox.width *= scale;
			SVGBox.height *= scale;
			SVGBox.y -= 30;
			SVGBox.height += 60;

			var size = width/2;
			var width = size;
			var height = size / SVGBox.width * SVGBox.height;
			while (height > width) {
				height *= 0.9;
			}

			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("width", width);
			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("height", height);
			window.document.getElementById("getchartmenutarget").parentNode.setAttribute("viewBox", SVGBox.x + ' ' + SVGBox.y + ' ' + SVGBox.width + ' ' + SVGBox.height);

			xPos = xPos > window.innerWidth / 2 ? (xPos - width - 100) : xPos + 30;
			yPos = yPos > window.innerHeight / 2 ? (yPos - width / 2) : (yPos + 150);
			window.document.getElementById("tooltipDiv").style.left = xPos + "px";
			window.document.getElementById("tooltipDiv").style.top = yPos + "px";

		} else {
			window.document.getElementById("chartDiv").remove();
			var width = window.document.getElementById("tooltipDiv").clientWidth;
			var height = window.document.getElementById("tooltipDiv").clientHeight;
			xPos = xPos > window.innerWidth / 2 ? (xPos - width - 30) : xPos + 30;
			yPos = yPos > window.innerHeight / 3 ? (yPos - height + 150) : (yPos + 20);
			window.document.getElementById("tooltipDiv").style.left = xPos + "px";
			window.document.getElementById("tooltipDiv").style.top = yPos + "px";
		}

		// adapt to the map style

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "#333");
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
		console.log("xxxxxxxxxxxxxxxxxxxx");
		console.log(szId);
		console.log("xxxxxxxxxxxxxxxxxxxx");

		if (__fTooltipPinned) {
			return true;
		}
		__themeObj = ixmaps.getThemeObj(szId.split(":")[0]);

		var szHtml = "<div style='font-size:18px;min-width:150px;max-width:400px'>";

		szHtml += "<p style='font-size:12px;margin-top:0em;margin-bottom:0.5em'>" + __themeObj.szTitle + "</p>";

		var szItem = szId;
		if (szId.match(/chartgroup/)){
			szItem = szId.split(":chartgroup")[0].split(":");
			szItem = szItem[1]+"::"+szItem[3];
		}
		var nValue = __themeObj.itemA[szItem] ? (__themeObj.itemA[szItem].nValue || __themeObj.itemA[szItem].nValuesA[0]) : "";
		console.log(nValue);
		var szSign = ((nValue > 0) && __themeObj.szFlag.match(/SIGN/)) ? "+" : "";
		szHtml += "<h4 style='margin-top:0em;margin-bottom:0.5em'>" + (__themeObj.itemA[szItem] ? (__themeObj.itemA[szItem].szTitle || ("[" + szId + "]")) : "") + "</br>" + szSign + nValue.toFixed(2) + __themeObj.szUnit + "</h5>";

		var normal = "#000000";
		var highLight = "#000000";
		var highLightBg = "#e8e8e8";

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			normal = "#bbbbbb";
			highLight = "#ffffff";
			highLightBg = "#808080";
		}
		var suffix = "";

		if (!szId.match(/chart/i)) {

			// item is not a chart -> item is a map shape
			// then we have to get the id in another way

			var obj = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szId);

			var szChartId = szId.match(/::/) ? szId : obj.parentNode.getAttribute("id");
			var szIdA = szChartId.split("#");
			if (szIdA.length > 1) {
				var szIdAA = szIdA[1].split(/\b::\b/);
				szChartId = szIdA[0] + "::" + szIdAA[1];
				szTitle = szIdAA[1];
			}
			//szId = ixmaps.getThemes()[1].szId + ":" + szChartId + ":chartgroup";

		}

		// get the theme object (for title, ...)
		var themeObj = ixmaps.getThemeObj(szId.split(":")[0]);

		if (0 && __themeObj.fShowData) {

			// get the data, and make tooltip content
			// 
			var data = ixmaps.map().getData(szId);

			for (d = 0; d < Math.min(50, data.length); d++) {

				szHtml += "<table style='font-size:0.7em;spacing:0.5em;min-width:200px'>"
				var dataObject = data[d];
				for (i in dataObject) {
					console.log(i);
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
				szHtml += "</table>";
			}
		}
		szHtml += "</div>"; //data[i];

		console.log("arrivato!");

		ixmaps.htmlgui_onTooltipDisplay(evt, szHtml, szId);
		return true;
	}

	ixmaps.htmlgui_onItemClick = function (evt, szId) {
		if (!evt) {
			return;
		}
		__fTooltipPinned = false;
		__fTooltipPin = true;
		return ixmaps.htmlgui_onItemOver(evt, szId);
	}
	ixmaps.htmlgui_deleteItemPinned = function () {
		__fTooltipPinned = false;
		__fTooltipPin = false;
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		ixmaps.clearHighlight();
	}




})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

/** 
 * @fileoverview This file provides functions for a HTML layer legend
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 * @copyright CC BY SA
 * @license MIT
 */

window.ixmaps = window.ixmaps || {};

(function () {

	// --------------------------------
	// h e l p e r 
	// --------------------------------

	var __Utf8 = {

		// public method for url encoding
		encode: function (string) {
			string = string.replace(/\r\n/g, "\n");
			var utftext = "";

			for (var n = 0; n < string.length; n++) {

				var c = string.charCodeAt(n);

				if (c < 128) {
					if (string[n] == '&' || string[n] == '"' || string[n] == '<' || string[n] == '>') {
						utftext += "&#";
						utftext += String(c);
						utftext += ";";
					} else {
						utftext += String.fromCharCode(c);
					}
				} else if ((c > 127) && (c < 2048)) {
					utftext += "&#";
					utftext += String(c);
					utftext += ";";
				} else {
					utftext += "&#";
					utftext += String(c);
					utftext += ";";
				}

			}

			return utftext;
		},

		// public method for url decoding
		decode: function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;

			while (i < utftext.length) {

				c = utftext.charCodeAt(i);

				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i + 1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = utftext.charCodeAt(i + 1);
					c3 = utftext.charCodeAt(i + 2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}

			}

			return string;
		}

	}

	/**
	 * __listOneNode  
	 * @param oneNode the DOM node to list
	 * @type string
	 * @return node code
	 */
	var depth = 0;

	function __listOneNode(oneNode) {

		var htmla = new String("");

		var attrs = null;
		if (attrs = oneNode.attributes) {
			for (i = 0; i < attrs.length; i++) {
				var nAttr = attrs.item(i);
				htmla += " " + nAttr.name + "=\"" + __Utf8.encode(nAttr.value) + "\"";
			}
		}
		if (oneNode.nodeName == "#text") {
			if (oneNode.nodeValue.length && !(oneNode.nodeValue.charCodeAt(0) == 10)) {
				htmla += __Utf8.encode(oneNode.nodeValue.replace(/\n\t+/g, ''));
			} else {
				return "";
			}
		}
		if (oneNode.nodeName == "#cdata-section") {

			if (1 || (oneNode.parentNode.nodeName == "style")) {
				htmla += "<![CDATA[\n";
				htmla += oneNode.nodeValue;
				htmla += "]]>\n";
				return htmla;
			}
			return "";
		}
		if (oneNode.nodeName == "#text") {
			return htmla;
		}
		return "<" + oneNode.nodeName + " " + htmla + " >\n";
	}

	/**
	 * __listNodewithChilds  
	 * @param originalNode the DOM node to start listing
	 * @type string
	 * @return node and child code
	 */
	function __listNodewithChilds(originalNode) {

		var szIndent = "  ";

		var s = "";
		if (!originalNode.nodeName.match(/#/)) {
			for (var i = 0; i < depth; i++) {
				s += szIndent;
			}
		}

		s += __listOneNode(originalNode);

		if (originalNode.hasChildNodes()) {

			depth++;

			var collChilds = originalNode.childNodes;
			for (var c = 0; c < collChilds.length; c++) {
				s += __listNodewithChilds(collChilds.item(c));
			}
			depth--;
		}

		if (!originalNode.nodeName.match(/#/)) {
			for (var i = 0; i < depth; i++) {
				s += szIndent;
			}
			s += "</" + originalNode.nodeName + ">\n";
		}

		return s;
	}

	/**
	 * __inFilter  
	 * check if sublayer is filtered 
	 * @param layer the layer object
	 * @param c the sublayer name
	 * @type boiolean
	 * @return true if sublayer is in filter value
	 */
	__inFilter = function (layer, c) {
		var filterA = layer.szFilterValue.split("|");
		for (i in filterA) {
			if (filterA[i] == c) {
				return true;
			}
		}
		return false;
	}

	/**
	 * ixmaps.__switchLayer  
	 * switch one layer/sublayer on/off dependent of the checked value  
	 * @param el the caller (HTML) element 
	 * @param szLayer the layer name
	 * @type void
	 */
	ixmaps.__switchLayer = function (el, szLayer) {
		szLayer = szLayer.replace(/\'/g, "&#x27;");
		ixmaps.map().switchLayer(szLayer, $(el).is(":checked"));
		ixmaps.makeLayerLegend();
	}

	/**
	 * ixmaps.__switchMasterLayer  
	 * switch all sublayer of a master layer on/off dependent of the checked value 
	 * to switch, trigger the legend checkboxes of the sublayer
	 * @param el the caller (HTML) element 
	 * @param szLayer the layer name
	 * @type void
	 */
	ixmaps.__switchMasterLayer = function (el, szLayer) {
		var subLayerList = $($(el)[0].parentNode).find('input.sub_check');
		for (var i = 0; i < subLayerList.length; i++) {
			$(subLayerList[i]).prop('checked', $(el).is(":checked"));
			$(subLayerList[i]).trigger('change');
		}
		ixmaps.makeLayerLegend();
	}

	// --------------------------------
	// m a i n   c o d e    
	// --------------------------------

	/**
	 * __makeLegendType  
	 * make a part of the layer legend 
	 * generates the legend elements of one layer with the given type (polygon,polyline,point,..) 
	 * the layer may have sublayer
	 * @param layer the layer object
	 * @param name the layer name
	 * @param type the type of the layer (polygon,polyline,point,..)
	 * @type string
	 * @return the legend element (HTML)
	 */
	__makeLegendType = function (layer, name, type) {

		var szLegend = "";

		if (layer.categoryA && (layer.szType == type)) {

			var sub = false;
			for (c in layer.categoryA) {
				if (c && (layer.categoryA[c].type != "single") && (layer.categoryA[c].legendname)) {
					sub = true;
				}
			}

			if (0) {
				var szChecked = (layer.nState == false) ? "" : "checked=\"checked\"";

				szLegend += "<li style='margin-top:1.5em;'>";
				szLegend += '<input type="checkbox" class="check" ' + szChecked + ' onchange="javascript:ixmaps.__switchMasterLayer($(this),\'' + name + '\');">';
				szLegend += '<span style="font-size:1.3em;line-height:0.8em;">&nbsp;' + layer.szLegendName + '</span>';
			}
			if (sub) {
				var szChecked = (layer.nState == false) ? "" : "checked=\"checked\"";

				szLegend += "<li style='margin-top:1.5em;'>";
				szLegend += '<div class="checkbox layerheader"><label>';
				szLegend += '<input type="checkbox" class="check" ' + szChecked + '  onchange="javascript:ixmaps.__switchMasterLayer($(this),\'' + name + '\');">';
				szLegend += '<span class="cr" style="font-size:1.2em"><i class="cr-icon fa fa-check fa-fw"></i></span>';
				szLegend += '<span style="font-size:1.3em;line-height:1.2em;text-decoration:none">&nbsp;' + layer.szLegendName + '</span>';
			}

			szLegend += sub ? "<div class='list-group' style='margin-top:0.5em;margin-bottom:0.5em;'>" : "";

			var szChecked = (layer.szDisplay == "none") ? "" : "checked=\"checked\"";

			switch (layer.szType) {
				case "point":
					for (c in layer.categoryA) {
						if (c == "" || (layer.szFilter && layer.szFilterValue && !__inFilter(layer, c))) {
							continue;
						}
						var szCatogoryName = layer.categoryA[c].legendname || layer.szLegendName;
						szCatogoryName = (c && (szCatogoryName != "(null)")) ? szCatogoryName : layer.szLegendName;
						szLegend += "<div class='list-group-item'>";
						szLegend += '<div class="checkbox" style="font-size:0.8em;float:right;padding:0;margin-top:5px;margin-right:-10px;margin-left:0px"><label>';
						szLegend += '<input type="checkbox" class="check sub_check" ' + szChecked + ' style="margin:0.4em 0em 0 0.2em;float:right" onchange="javascript:ixmaps.__switchLayer($(this),\'' + name + ((c && (layer.categoryA[c].legendname)) ? ('::' + String(c).replace(/\'/g, "\\\'")) : '') + '\');">&nbsp;';
						szLegend += '<span class="cr"><i class="cr-icon fa fa-check fa-fw"></i></span>';
						szLegend += "</label></div>";
						szLegend += "<span style='vertical-align:-0.1em;font-size:1.5em;line-height:0.8em;color:" + layer.categoryA[c].fill + "'>&#8226;</span>&nbsp;&nbsp;" + szCatogoryName + "</div>";
					}
					break;
				case "line":
					for (c in layer.categoryA) {
						if (c == "" || (c && c != "null" && layer.szFilter && layer.szFilterValue && !__inFilter(layer, c))) {
							continue;
						}
						szChecked = (layer.categoryA[c].display == "none") ? "" : "checked=\"checked\"";

						var szCatogoryName = layer.categoryA[c].legendname || layer.szLegendName;
						szCatogoryName = (c && (szCatogoryName != "(null)")) ? szCatogoryName : layer.szLegendName;
						var szCategory = (c && (c != "null")) ? c : name;
						szLegend += "<div class='list-group-item'>";
						szLegend += "<div class='list-group-item-left'>";
						szLegend += "<span style='vertical-align:1.1em;font-size:0.2em;margin-left:0.3em;background:" + layer.categoryA[c].fill + "'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
						szLegend += "</div><div class='list-group-item-right'>";
						szLegend += "<span style='color:" + (szChecked.length ? "inherit" : "#bbb") + "'>" + szCatogoryName + "</span>";
						szLegend += '<div class="checkbox" style="font-size:0.8em;float:right;padding:0;margin-top:5px;margin-right:-10px;margin-left:0px"><label>';
						szLegend += '<input type="checkbox" class="check sub_check" ' + szChecked + ' style="margin:0.4em 0em 0 0.2em;float:right" onchange="javascript:ixmaps.__switchLayer($(this),\'' + name + ((c && (layer.categoryA[c].legendname)) ? ('::' + String(c).replace(/\'/g, "\\\'")) : '') + '\');">&nbsp;';
						szLegend += '<span class="cr"><i class="cr-icon fa fa-check fa-fw"></i></span>';
						szLegend += "</label></div>";
						szLegend += "</div>";
						szLegend += "</div>";
					}
					break;
				case "polygon":
					for (c in layer.categoryA) {
						if (c == "" || (c && c != "null" && layer.szFilter && layer.szFilterValue && !__inFilter(layer, c))) {
							continue;
						}
						szChecked = (layer.categoryA[c].display == "none") ? "" : "checked=\"checked\"";

						var szCatogoryName = layer.categoryA[c].legendname || layer.szLegendName;
						szCatogoryName = (c && (szCatogoryName != "(null)")) ? szCatogoryName : layer.szLegendName;
						var szCategory = (c && (c != "null")) ? c : name;
						szLegend += "<div class='list-group-item'>";
						szLegend += "<div class='list-group-item-left'>";
						if (szChecked.length) {
							szLegend += ixmaps.__getLayerLegendSVG(name, szCategory, layer.categoryA[c].fill, layer.categoryA[c].stroke);
						} else {
							szLegend += ixmaps.__getLayerLegendSVG(name, szCategory, "none", "#aaaaaa");
						}
						szLegend += "</div><div class='list-group-item-right' style='width:90%;>";
						szLegend += "<span style='color:" + (szChecked.length ? "inherit" : "#bbb") + "'>" + szCatogoryName + "</span>";
						szLegend += '<div class="checkbox" style="font-size:0.8em;float:right;padding:0;margin-top:2px;margin-right:-50px;"><label>';
						szLegend += '<input type="checkbox" class="check sub_check" ' + szChecked + ' style="margin:0.4em 0em 0 0.2em;float:right" onchange="javascript:ixmaps.__switchLayer($(this),\'' + name + ((c && (layer.categoryA[c].legendname)) ? ('::' + String(c).replace(/\'/g, "\\\'")) : '') + '\');">&nbsp;';
						szLegend += '<span class="cr"><i class="cr-icon fa fa-check fa-fw"></i></span>';
						szLegend += "</label></div>";
						szLegend += "</div>";
						szLegend += "</div>";
					}
					break;
			}
			szLegend += sub ? "</div>" : "";

			if (sub) {
				szLegend += "</li>";
			}

		} else
		if (layer.szType == type) {
			
			var szChecked = (layer.szDisplay == "none") ? "" : "checked=\"checked\"";

			szLegend += "<li style='margin-top:-1em;margin-bottom:1em;'>";
			szLegend += '<input type="checkbox" class="check" '+szChecked+' onchange="javascript:ixmaps.__switchLayer($(this),\'' + name + '\');">';
			szLegend += '<span>&nbsp;' + name + ' (' + type + ') </span>';
			szLegend += "</li>";
		}
		return szLegend;
	};

	/**
	 * ixmaps.__getLayerLegendSVG  
	 * get a legend stroke/fill sprite (icon) in SVG 
	 * tries to get the layer style from the SVG code inside the map
	 * this includes pattern, opacity etc.
	 * if no style found, uses the function parameter szFill/szStroke 
	 * @param szLayerName the layer name
	 * @param szCategoryName the (sub)layer name
	 * @param szFill a default fill color
	 * @param szFill a default stroke color
	 * @type string
	 * @return the legend element (HTML)
	 */
	ixmaps.__getLayerLegendSVG = function (szLayerName, szCategoryName, szFill, szStroke) {

		var szHtml = "";

		node = ixmaps.embeddedSVG.window.SVGDocument.getElementById("legend:setactive:" + szLayerName + ((szLayerName != szCategoryName) ? ("::" + szCategoryName) : ""));
		if (node) {
			node = node.childNodes.item(1);
		}

		// a) try to get a style attribute from a SVG layer shape 
		// ------------------------------------------------------

		if (!node) {
			node = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szLayerName + ((szLayerName != szCategoryName) ? ("::" + szCategoryName) : ""));
		}

		if (node) {
			var szPattern = "";
			node = node.cloneNode(true);
			node.style.setProperty("stroke-width", "50px");
			szStyle = node.getAttributeNS(null, "style");
			var fill = node.style.getPropertyValue("fill");
			if (fill && fill.match(/url/)) {
				pattern = (fill.replace(/\"/g, "").split("#")[1].split("\)")[0] + ":antizoomandpan");
				pattern = ixmaps.embeddedSVG.window.SVGDocument.getElementById(pattern);
				if (pattern) {
					pattern = pattern.cloneNode(true);
					szPatternId = pattern.getAttributeNS(null, "id") + ":antizoomandpan";
					pattern.setAttributeNS(null, "id", szPatternId);
					szPattern = __listNodewithChilds(pattern);
					node.style.setProperty("fill", "url(#" + szPatternId + ")");
					szStyle = node.getAttributeNS(null, "style").replace(/\"/g, "");
				}
			}
			if (!szStyle.match(/fill:/) && !szStyle.match(/stroke:/)) {
				szStyle += "fill:none;stroke:black";
			}
			if (szFill && (szFill == "none")) {
				szStyle += "fill:none;stroke:black";
			}
			szHtml += '<span style="vertical-align:-4px"><svg width="25" height="25" viewBox="0 0 800 800">';
			szHtml += '<defs>';
			szHtml += szPattern;
			szHtml += '</defs>';
			szHtml += '<path style="' + szStyle + '" d="M0,0 l0,800 800,0 0,-800 z" ></path>';
			szHtml += '</svg></span>';

		}

		// b) make legend sprite from fill/stroke arguments 
		// ------------------------------------------------------
		else {

			szHtml = '<span style="vertical-align:-4px"><svg width="25" height="25" viewBox="0 0 800 800">';
			szHtml += '<path style="fill:' + szFill + ';stroke:' + szStroke + ';fill-opacity:0.7;stroke-width:80px" d="M0,0 l0,800 800,0 0,-800 z" ></path>';
			szHtml += '</svg></span>';
		}

		return (szHtml);

	};

	var list_group_item_left = {
		"float": "left",
		"padding": " 0px",
		"padding-top": "2px",
		"margin-right": "0.5em",
		"min-width": "15px",
		"text-align": "center",
		"vertical-align": "50%"
	};
	var list_group_item_right = {
		"font-weight": "300",
		"display": "block",
		"margin": "0 0 0 0px"
	};
	var list_group_item = {
		"border-top": " 0",
		"border-left": " 0",
		"border-right": "0",
		"border-bottom": "solid rgba(220,220,220,0.5) 0px",
		"margin-bottom": "0",
		"padding": "0.3em 0.5em 0.5em 0.0em",
		"font-size": "1.5em",
		"line-height": "1em",
		"background-color": "rgba(255,255,255,0)"
	};
	var list_group = {
		"border-top": "solid rgba(120,120,120,0.5) 1px",
		"background-color": "rgba(255,255,255,0)",
		"margin": "1em 0em 0em 0em",
		"padding": "0.5em 0em 0em 0em"
	};

	var ul_ = {
		"display": " block",
		"list-style-type": "disc",
		"-webkit-margin-before": "1em",
		"-webkit-margin-after": "0.5em",
		"-webkit-margin-start": "0px",
		"-webkit-margin-end": "0px",
		"-webkit-padding-start": "0px"
	};

	/**
	 * ixmaps.__makeLegend  
	 * make the legend for all layer in the map 
	 * @type boolean
	 */
	ixmaps.makeLayerLegend = function (nMaxHeight) {
		var layerA = ixmaps.getLayer();

		nMaxHeight = nMaxHeight || ixmaps.__layerLegendHeight || 300;
		ixmaps.__layerLegendHeight = nMaxHeight;

		if (!$("#map-legend")[0]) {
			return false;
		}

		var szLegend = "";

		// try to get description from SVG legend
		var description = ixmaps.embeddedSVG.window.SVGDocument.getElementById("legend:collapsable:documentinfo");
		if (description) {
			var title = description.childNodes.item(1);
			szLegend += "<h3>" + title.childNodes.item(1).nodeValue + "</h3>";
		}

		szLegend += "<ul>";

		for (a in layerA) {
			szLegend += __makeLegendType(layerA[a], a, "polygon");
		}
		//szLegend += "<div style='height:0.7em;'></div>";
		for (a in layerA) {
			szLegend += __makeLegendType(layerA[a], a, "line");
		}
		//szLegend += "<div style='height:0.7em;'></div>";
		for (a in layerA) {
			szLegend += __makeLegendType(layerA[a], a, "point");
		}

		szLegend += "</ul>";

		// no elements in legend 
		// then exit
		if (szLegend == "<ul></ul>") {
			return false;
		}

		// -------------------------------------------------
		// show the legend
		// -------------------------------------------------

		// if not yet present, create the hosting legend pane
		//
		if (!$("#map-legend-list")[0]) {
			var szHtml = "";

			if (!description) {
				szHtml += "<h3 id='map-legend-title' style='margin-top:0.5em;'>Map Layer";
				szHtml += "</h3>";
			} else {
				szHtml += "<div style='height:0.5em;'></div>";
			}

			szHtml += "<div id='map-legend-body' style='max-height:" + nMaxHeight + "px;overflow:auto;padding-right:0.7em'>";
			szHtml += "<div id='map-legend-list'>";
			szHtml += "</div>";
			szHtml += "</div>";

			var szLegendPane = "<div id='map-legend-pane' class='map-legend-pane'>" +
				"<a href='javascript:__toggleLegendPane(-1)'>" +
				"<div id='legend-type-switch' style='border:none'>" +
				"<span style='font-size:28px;'>&#8942;</span>" +
				"</div>" +
				"</a>" +
				"<div>" +
				"<div class='row'>" +
				"<div class='col-lg-12 col-md-12 col-xs-0'>" +
				"<div id='map-legend-content'>" + szHtml + "</div>" +
				"</div>" +
				"</div>" +
				"</div>";
			$("#map-legend").html(szLegendPane);
		}

		// append the legend html
		//
		$("#map-legend-list").html(szLegend);
		$("#map-legend").show();

		// set some css styles
		//
		$("div.list-group").css(list_group);
		$("div.list-group-item").css(list_group_item);
		$("div.list-group-item-left").css(list_group_item_left);
		$("div.list-group-item-right").css(list_group_item_right);
		$("ul").css(ul_);

		return true;
	}

	/**
	 * listen on Zoom and Pan  
	 * make the legend for all layer in the map 
	 * @type void
	 */
	__old__htmlgui_onZoomAndPan = ixmaps.htmlgui_onZoomAndPan;
	ixmaps.htmlgui_onZoomAndPan = function (nZoom) {
		if (  ixmaps.loadedMap && 
			!(ixmaps.loadedProject && ixmaps.loadedProject.themes) && 
			!(ixmaps.legend && ixmaps.legend.externalLegend) &&
			!(ixmaps.legendType == "theme") ) {
			setTimeout("ixmaps.makeLayerLegend(" + window.innerHeight * 0.75 + ")", 100);
		}
		__old__htmlgui_onZoomAndPan(nZoom);
	};

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------

/**
 * data broker for COVID-19 Italy Map
 * loads data fro ArcGis feature service
 * parses it into iXMaps data table
 */

window.ixmaps = window.ixmaps || {};
(function () {
	
	var __fTooltipPin = false;
	var __fTooltipPinned = false;

	ixmaps.htmlgui_onTooltipDisplay = function (evt,szText) {

		console.log("hi")
		console.log(evt)

		if (!window.document.getElementById("tooltip")) {
			var div = document.createElement("div");
			div.setAttributeNS(null, "id", "tooltip");
			document.activeElement.appendChild(div);
		}

		var szHtml = "";

		var width = window.innerWidth / 4;

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

		var fontsize = 22 / 1200 * window.innerWidth;

		szHtml += "<div id='tooltipDiv' style='position:absolute;left:" + xPos + "px;top:" + yPos + "px;font-family: arial narrow, system;font-size:" + fontsize + "px;color: #444;background: white;border: 0.5px solid black;border-radius: 5px'>";

		szHtml += "<div style='margin:0.5em 0.5em'>" + szText + "</div>";

		szHtml += "<div id='chartDiv' style='margin:0.5em 1em;width:" + width + "px;overflow:hidden'><svg width='300' height='300' viewBox='0 0 5000 5000'><g id='getchartmenutarget' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' style='pointer-events:all'></g></svg></div>";

		if (__fTooltipPin) {
			szHtml += "<div onclick='ixmaps.htmlgui_deleteItemPinned()' style='position:absolute;top:-0.5em;right:-0.5em;font-size:1em;color:white;background:#444444;padding:0 0.25em;border-radius:1em;cursor:pointer;'>&Cross;</div>"
			__fTooltipPinned = true;
		}
		
		szHtml += "</div>";

		console.log("hi-1")
		//ixmaps.setMapOverlayHTML(szHtml);
		
		
		
		

		window.document.getElementById("tooltip").innerHTML = szHtml;
		szId = evt.path[1].getAttributeNS(null, "id");
		var szIdA = szId.split(":");
		var szFlag = "VALUES|XAXIS|ZOOM|BOX|GRID";
		var themesA = ixmaps.getThemes();
		for (var t = 0; t < themesA.length; t++) {
			var objTheme = themesA[t];
			if (objTheme.szFlag.match(/PLOT/)) {
				console.log(objTheme.szFlag);
				objTheme.drawChart(window.document.getElementById("getchartmenutarget"), szIdA[0] + "::" + szIdA[2], 30, szFlag);
			}
		}
		console.log("hi-2")

		var SVGBox = window.document.getElementById("getchartmenutarget").getBBox();
		console.log(SVGBox);
		if (SVGBox && SVGBox.width && SVGBox.height) {
			var scale = Math.max(1, width / SVGBox.width);
			SVGBox.width *= scale;
			SVGBox.height *= scale;
			SVGBox.y -= 30;
			SVGBox.height += 60;

			var size = width;
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
			yPos = yPos > window.innerHeight / 3 ? (yPos - height +150) : (yPos + 20);
			window.document.getElementById("tooltipDiv").style.left = xPos + "px";
			window.document.getElementById("tooltipDiv").style.top = yPos + "px";
		}

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			window.document.getElementById("tooltipDiv").style.setProperty("background-color", "#333");
		}
		
		console.log("hi-3")
		

		return true;
	}

	ixmaps.htmlgui_onTooltipDelete = function () {
		if (__fTooltipPinned){
			return false;
		}
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		return true;
	}

	ixmaps.htmlgui_onItemOver = function (evt,szId) {
		
		if (__fTooltipPinned){
			return true;
		}
		__themeObj = ixmaps.getThemeObj(szId.split(":")[0]);
		var data = ixmaps.getData(szId);
		var szHtml = "<div style='font-size:18px;max-width:400px'>";

		    szHtml += "<h4 style='margin:0 0 0.7em 0'>"+__themeObj.szTitle+"</h4>";

		var normal = "#aaaaaa";
		var highLight = "#000000";
		var highLightBg = "#e8e8e8";

		if (ixmaps.getMapTypeId().match(/dark/i)) {
			//$("#container").css("background-color", "#333");
			//$("#container").css("color", "#ddd");
			normal = "#bbbbbb";
			highLight = "#ffffff";
			highLightBg = "#808080";
		}
		var suffix = "";


		var themeObj = ixmaps.getThemeObj(szId.split(":")[0]);
		for (d = 0; d < Math.min(50, data.length); d++) {

			szHtml += "<table style='font-size:0.7em;spacing:0.5em'>"
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
						if (i == themeObj.szColorField || 
							(themeObj.szFieldsA.indexOf(i) >= 0)
						) {
							var color = themeObj.colorScheme[themeObj.nStringToValueA[szValue]-1];
							var tcolor = _circ_getTextColor(color);
							szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#888888;' ><b>" + (i.replace(/\_/g, " ")) + "</b></td><td class='value' style='color:" + tcolor + ";background:" + color + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
						} else 
						if (i == themeObj.szSizeField ||
							i == themeObj.szSymbolField ||
							(themeObj.szFieldsA.indexOf(i) >= 0)
						) {
							szHtml += "<tr><td><span style='color:black'>&larr;</span></td><td class='label' style='text-align:right;color:#888888;' ><b>" + (i.replace(/\_/g, " ")) + "</b></td><td class='value' style='color:" + highLight + ";background:" + highLightBg + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
						} else {
							szHtml += "<tr><td></td><td class='label' style='text-align:right;color:#888888;' >" + (i.replace(/\_/g, " ")) + "</td><td class='value' style='min-width:150px;color:" + normal + ";text-align:left;'>" + szValue + suffix + "</td></tr>";
						}
					} else {}
				}
			}
			szHtml += "</table>";
		}
		szHtml += "</div>"; //data[i];
		ixmaps.htmlgui_onTooltipDisplay(evt,szHtml);
		return true;
	}

	ixmaps.htmlgui_onItemClick = function (evt,szId) {
		if (!evt){
			return;
		}
		__fTooltipPinned = false;
		__fTooltipPin = true;
		ixmaps.fOnItemClicked = true;
		return ixmaps.htmlgui_onItemOver(evt,szId);
	}
	ixmaps.htmlgui_deleteItemPinned = function () {
		__fTooltipPinned = false;
		__fTooltipPin = false;
		ixmaps.setMapOverlayHTML("");
		window.document.getElementById("tooltip").innerHTML = "";
		ixmaps.clearHighlight();
	}
	
/**
*** color handling
**/
	
var _circ_colorNameA = new Array(0);
	_circ_colorNameA['aliceblue']="#F0F8FF";
	_circ_colorNameA['antiquewhite']="#FAEBD7";
	_circ_colorNameA['aqua']="#00FFFF";
	_circ_colorNameA['aquamarine']="#7FFFD4";
	_circ_colorNameA['azure']="#F0FFFF";
	_circ_colorNameA['beige']="#F5F5DC";
	_circ_colorNameA['bisque']="#FFE4C4";
	_circ_colorNameA['black']="#000000";
	_circ_colorNameA['blanchedalmond']="#FFEBCD";
	_circ_colorNameA['blue']="#0000FF";
	_circ_colorNameA['blueviolet']="#8A2BE2";
	_circ_colorNameA['brown']="#A52A2A";
	_circ_colorNameA['burlywood']="#DEB887";
	_circ_colorNameA['cadetblue']="#5F9EA0";
	_circ_colorNameA['chartreuse']="#7FFF00";
	_circ_colorNameA['chocolate']="#D2691E";
	_circ_colorNameA['coral']="#FF7F50";
	_circ_colorNameA['cornflowerblue']="#6495ED";
	_circ_colorNameA['cornsilk']="#FFF8DC";
	_circ_colorNameA['crimson']="#DC143C";
	_circ_colorNameA['cyan']="#00FFFF";
	_circ_colorNameA['darkblue']="#00008B";
	_circ_colorNameA['darkcyan']="#008B8B";
	_circ_colorNameA['darkgoldenr0d']="#B8860B";
	_circ_colorNameA['darkgray']="#A9A9A9";
	_circ_colorNameA['darkgreen']="#006400";
	_circ_colorNameA['darkkhaki']="#BDB76B";
	_circ_colorNameA['darkmagenta']="#8B008B";
	_circ_colorNameA['darkolivegreen']="#556B2F";
	_circ_colorNameA['darkorange']="#FF8C00";
	_circ_colorNameA['darkorchid']="#9932CC";
	_circ_colorNameA['darkred']="#8B0000";
	_circ_colorNameA['darksalmon']="#E9967A";
	_circ_colorNameA['darkseagreen']="#8FBC8F";
	_circ_colorNameA['darkslateblue']="#483D8B";
	_circ_colorNameA['darkslategray']="#2F4F4F";
	_circ_colorNameA['darkturquoise']="#00CED1";
	_circ_colorNameA['darkviolet']="#9400D3";
	_circ_colorNameA['deeppink']="#FF1493";
	_circ_colorNameA['deepskyblue']="#00BFFF";
	_circ_colorNameA['dimgray']="#696969";
	_circ_colorNameA['dodgerblue']="#1E90FF";
	_circ_colorNameA['firebrick']="#B22222";
	_circ_colorNameA['floralwhite']="#FFFAF0";
	_circ_colorNameA['forestgreen']="#228B22";
	_circ_colorNameA['fuchsia']="#FF00FF";
	_circ_colorNameA['gainsboro']="#DCDCDC";
	_circ_colorNameA['ghostwhite']="#F8F8FF";
	_circ_colorNameA['gold']="#FFD700";
	_circ_colorNameA['goldenrod']="#DAA520";
	_circ_colorNameA['gray']="#808080";
	_circ_colorNameA['green']="#008000";
	_circ_colorNameA['greenyellow']="#ADFF2F";
	_circ_colorNameA['honeydew']="#F0FFF0";
	_circ_colorNameA['hotpink']="#FF69B4";
	_circ_colorNameA['indianred']="#CD5C5C";
	_circ_colorNameA['indigo']="#4B0082";
	_circ_colorNameA['ivory']="#FFFFF0";
	_circ_colorNameA['khaki']="#F0E68C";
	_circ_colorNameA['lavender']="#E6E6FA";
	_circ_colorNameA['lavenderblush']="#FFF0F5";
	_circ_colorNameA['lawngreen']="#7CFC00";
	_circ_colorNameA['lemonchiffon']="#FFFACD";
	_circ_colorNameA['lightblue']="#ADD8E6";
	_circ_colorNameA['lightcoral']="#F08080";
	_circ_colorNameA['lightcyan']="#E0FFFF";
	_circ_colorNameA['lightgoldenrodyellow']="#FAFAD2";
	_circ_colorNameA['lightgreen']="#90EE90";
	_circ_colorNameA['lightgrey']="#D3D3D3";
	_circ_colorNameA['lightpink']="#FFB6C1";
	_circ_colorNameA['lightsalmon']="#FFA07A";
	_circ_colorNameA['lightseagreen']="#20B2AA";
	_circ_colorNameA['lightskyblue']="#87CEFA";
	_circ_colorNameA['lightslategray']="#778899";
	_circ_colorNameA['lightsteelblue']="#B0C4DE";
	_circ_colorNameA['lightyellow']="#FFFFE0";
	_circ_colorNameA['lime']="#00FF00";
	_circ_colorNameA['limegreen']="#32CD32";
	_circ_colorNameA['linen']="#FAF0E6";
	_circ_colorNameA['magenta']="#FF00FF";
	_circ_colorNameA['maroon']="#800000";
	_circ_colorNameA['mediumaquamarine']="#66CDAA";
	_circ_colorNameA['mediumblue']="#0000CD";
	_circ_colorNameA['mediumorchid']="#BA55D3";
	_circ_colorNameA['mediumpurple']="#9370DB";
	_circ_colorNameA['mediumseagreen']="#3CB371";
	_circ_colorNameA['mediumslateblue']="#7B68EE";
	_circ_colorNameA['mediumspringgreen']="#00FA9A";
	_circ_colorNameA['mediumturquoise']="#48D1CC";
	_circ_colorNameA['mediumvioletred']="#C71585";
	_circ_colorNameA['midnightblue']="#191970";
	_circ_colorNameA['mintcream']="#F5FFFA";
	_circ_colorNameA['mistyrose']="#FFE4E1";
	_circ_colorNameA['moccasin']="#FFE4B5";
	_circ_colorNameA['navajowhite']="#FFDEAD";
	_circ_colorNameA['navy']="#000080";
	_circ_colorNameA['oldlace']="#FDF5E6";
	_circ_colorNameA['olive']="#808000";
	_circ_colorNameA['olivedrab']="#6B8E23";
	_circ_colorNameA['orange']="#FFA500";
	_circ_colorNameA['orangered']="#FF4500";
	_circ_colorNameA['orchid']="#DA70D6";
	_circ_colorNameA['palegoldenrod']="#EEE8AA";
	_circ_colorNameA['palegreen']="#98FB98";
	_circ_colorNameA['paleturquoise']="#AFEEEE";
	_circ_colorNameA['palevioletred']="#DB7093";
	_circ_colorNameA['papayawhip']="#FFEFD5";
	_circ_colorNameA['peachpuff']="#FFDAB9";
	_circ_colorNameA['peru']="#CD853F";
	_circ_colorNameA['pink']="#FFC0CB";
	_circ_colorNameA['plum']="#DDA0DD";
	_circ_colorNameA['powderblue']="#B0E0E6";
	_circ_colorNameA['purple']="#800080";
	_circ_colorNameA['red']="#FF0000";
	_circ_colorNameA['rosybrown']="#BC8F8F";
	_circ_colorNameA['royalblue']="#4169E1";
	_circ_colorNameA['saddlebrown']="#8B4513";
	_circ_colorNameA['salmon']="#FA8072";
	_circ_colorNameA['sandybrown']="#F4A460";
	_circ_colorNameA['seagreen']="#2E8B57";
	_circ_colorNameA['seashell']="#FFF5EE";
	_circ_colorNameA['sienna']="#A0522D";
	_circ_colorNameA['silver']="#C0C0C0";
	_circ_colorNameA['skyblue']="#87CEEB";
	_circ_colorNameA['slateblue']="#6A5ACD";
	_circ_colorNameA['slategray']="#708090";
	_circ_colorNameA['snow']="#FFFAFA";
	_circ_colorNameA['springgreen']="#00FF7F";
	_circ_colorNameA['steelblue']="#4682B4";
	_circ_colorNameA['tan']="#D2B48C";
	_circ_colorNameA['teal']="#008080";
	_circ_colorNameA['thistle']="#D8BFD8";
	_circ_colorNameA['tomato']="#FF6347";
	_circ_colorNameA['turquoise']="#40E0D0";
	_circ_colorNameA['violet']="#EE82EE";
	_circ_colorNameA['wheat']="#F5DEB3";
	_circ_colorNameA['white']="#FFFFFF";
	_circ_colorNameA['whitesmoke']="#F5F5F5";
	_circ_colorNameA['yellow']="#FFFF00";
	_circ_colorNameA['yellowgreen']="#9ACD32";
/**
 * calculate and return a color that is lighter/darker as the given one
 * @param cc0 the original color
 * @param nFaktor the brightness faktor
 */
function _circ_getDerivateColor(cc0, nFaktor){

	if ( cc0 == "none" ){
		return cc0;
	}

	cc0 = _circ_getHexaColor(cc0);

	var rr, gg, bb, hh="0123456789abcdef";
    rr=parseInt(cc0.substr(1,2),16);
    gg=parseInt(cc0.substr(3,2),16);
    bb=parseInt(cc0.substr(5,2),16);

	if ( nFaktor > 1 ){
		rr = Math.max(rr,90);
		gg = Math.max(gg,90);
		bb = Math.max(bb,90);
		if ( (rr >= 250) || (gg >= 250) || (bb >= 250) ){
			nFaktor = Math.max(nFaktor*0.9,1.1);
		}
	}
	rr=Math.min(255,Math.floor(rr*nFaktor)); 
    gg=Math.min(255,Math.floor(gg*nFaktor));
    bb=Math.min(255,Math.floor(bb*nFaktor));

	var ss="#";
	ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
	ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
	ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);
	return(ss);
}

/**
 * calculate and return a color that is a good text color for the given color
 * @param cc0 the original color
 */
function _circ_getTextColor(cc0){

	cc0 = _circ_getHexaColor(cc0);

	var rr, gg, bb, hh="0123456789abcdef";
    rr=parseInt(cc0.substr(1,2),16);
    gg=parseInt(cc0.substr(3,2),16);
    bb=parseInt(cc0.substr(5,2),16);

	if ( ((rr + gg) > 300) || ((bb + gg) > 400) || ((bb + rr) > 400) || (rr > 127 && gg > 127 && bb > 127)  ){
		return ( _circ_getDerivateColor(cc0,0.6) );
	}else{
		return ( _circ_getDerivateColor(cc0,4.0) );
	}
}

function _circ_getHexaColor(szColorName){
	if (typeof(szColorName) != 'string'){
		return("#ffffff");
	}
	if ( szColorName.charAt(0) == "#" ){
		return szColorName;
	}
	if ( szColorName.match(/RGBA/i) ){
		try {
			szColorName = "#"+eval("__rgb2hex"+szColorName.slice(4));
		}
		catch (e){}
		return szColorName;
	}
	if ( szColorName.match(/RGB/i) ){
		try {
			szColorName = "#"+eval("__rgb2hex"+szColorName.slice(3));
		}
		catch (e){}
		return szColorName;
	}
	var szColorValue = _circ_colorNameA[szColorName];
	if ( szColorValue ){
		return szColorValue;
	}
	return("#ffffff");
}
	
function __dec2hex(n) {
	var s = n.toString(16);
	if (s.length<2){
		s = '0'+s;
	}
	return s.toUpperCase();
}

function __hex2dec(n) {
	return parseInt(n,16);
}

function __col2Gray(r,g,b) {
	var nLum = Math.round( r*0.299 + g*0.587 + b*0.114 );
	return __dec2hex(nLum)+__dec2hex(nLum)+__dec2hex(nLum);
}

function __rgb2hex(r,g,b) {
	return __dec2hex(r)+__dec2hex(g)+__dec2hex(b);
}

})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

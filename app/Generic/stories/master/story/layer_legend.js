/** 
 * @fileoverview This file provides functions for facet filtering
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
			encode : function (string) {
				string = string.replace(/\r\n/g,"\n");
				var utftext = "";
		 
				for (var n = 0; n < string.length; n++) {
		 
					var c = string.charCodeAt(n);
		 
					if (c < 128) {
						if ( string[n] == '&' || string[n] == '"' || string[n] == '<' || string[n] == '>'){
							utftext += "&#";
							utftext += String(c);
							utftext += ";";
						}else{
							utftext += String.fromCharCode(c);
						}
					}
					else if((c > 127) && (c < 2048)) {
						utftext += "&#";
						utftext += String(c);
						utftext += ";";
					}
					else {
						utftext += "&#";
						utftext += String(c);
						utftext += ";";
					}
		 
				}
		 
				return utftext;
			},
		 
			// public method for url decoding
			decode : function (utftext) {
				var string = "";
				var i = 0;
				var c = c1 = c2 = 0;
		 
				while ( i < utftext.length ) {
		 
					c = utftext.charCodeAt(i);
		 
					if (c < 128) {
						string += String.fromCharCode(c);
						i++;
					}
					else if((c > 191) && (c < 224)) {
						c2 = utftext.charCodeAt(i+1);
						string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
						i += 2;
					}
					else {
						c2 = utftext.charCodeAt(i+1);
						c3 = utftext.charCodeAt(i+2);
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
		function __listOneNode(oneNode){

			var htmla = new String(""); 
			
			var attrs = null;
			if ( attrs = oneNode.attributes ){
				for (i = 0; i < attrs.length; i++) {
					var nAttr = attrs.item(i);
					htmla += " "+nAttr.name+"=\""+__Utf8.encode(nAttr.value)+"\""; 	 
				}
			}
			if ( oneNode.nodeName == "#text" ) {
				if ( oneNode.nodeValue.length && !(oneNode.nodeValue.charCodeAt(0) == 10)){
					htmla += __Utf8.encode(oneNode.nodeValue.replace(/\n\t+/g,'')); 	 
				}else{
					return "";
				}
			}
			if ( oneNode.nodeName == "#cdata-section" ) {

				if ( 1 || (oneNode.parentNode.nodeName == "style") ){
					htmla += "<![CDATA[\n";
					htmla += oneNode.nodeValue;
					htmla += "]]>\n";
					return htmla; 	
				}
				return "";
			}
			if ( oneNode.nodeName == "#text" ) {
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
		function __listNodewithChilds(originalNode){

			var szIndent = "  ";

			var s = "";
			if ( !originalNode.nodeName.match(/#/)) {
				for (var i =0; i<depth; i++ ){
					s += szIndent;
				}
			}

			s += __listOneNode(originalNode);

			if ( originalNode.hasChildNodes() ){

				depth++;

				var collChilds = originalNode.childNodes;
				for ( var c=0; c<collChilds.length; c++ ){
					s += __listNodewithChilds(collChilds.item(c));		
				}
				depth--;
			}

			if ( !originalNode.nodeName.match(/#/)) {
				for (var i =0; i<depth; i++ ){
					s += szIndent;
				}
				s += "</"+originalNode.nodeName+">\n";
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
		__inFilter = function(layer,c){
			var filterA = layer.szFilterValue.split("|");
			for ( i in filterA ){
				if ( filterA[i] == c ){
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
		ixmaps.__switchLayer = function(el,szLayer){
			ixmaps.map().switchLayer(szLayer,$(el).is(":checked"));
			ixmaps.map().switchLayer(szLayer+":label",$(el).is(":checked"));
			//ixmaps.__refreshLegend();
		}
		
		/**
		 * ixmaps.__switchMasterLayer  
		 * switch all sublayer of a master layer on/off dependent of the checked value 
		 * to switch, trigger the legend checkboxes of the sublayer
		 * @param el the caller (HTML) element 
		 * @param szLayer the layer name
 		 * @type void
		 */
		ixmaps.__switchMasterLayer = function(el,szLayer){
			var subLayerList = $($(el)[0].parentNode.parentNode.parentNode).find('input.sub_check');
			for ( var i=0; i<subLayerList.length; i++ ){
				$(subLayerList[i]).prop('checked',$(el).is(":checked"));
				$(subLayerList[i]).trigger('change');
			}
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
		__makeLegendType = function(layer,name,type){

			var szLegend = "";
			var fClosed = false;

			if ( layer.categoryA && (layer.szType == type) ){

				var sub = false;
				for ( c in layer.categoryA ){
					if ( c && (layer.categoryA[c].type != "single") && (layer.categoryA[c].legendname) ){
						sub = true;
					}
				}
				
				if ( sub ){
					szLegend += "<li style='margin-top:1.5em;'>";
					szLegend += '<div class="checkbox layerheader"><label>';
					szLegend += '<input type="checkbox" class="check" checked="checked" onchange="javascript:ixmaps.__switchMasterLayer($(this),\''+name+'\');">';
					szLegend += '<span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span>';
					szLegend += '<a style="color:#666666;text-decoration:none" data-toggle="collapse" data-parent="#accordion" href="#'+layer.szName+'">';
					szLegend += '<span style="font-size:1.3em;line-height:0.8em;text-decoration:none">&nbsp;'+layer.szLegendName+'</span>';
					//szLegend += '<span style="float:right;margin-right:1.3em;color:#dddddd;font-size:1.1em"><i class="glyphicon glyphicon-minus-sign"></i></span>';
					szLegend += '</a>';
					szLegend += "</label>";
					szLegend += "</div>";
				}	

				szLegend += sub?"<div id='"+layer.szName+"' class='list-group panel-collapse collapse"+ (fClosed?" ":" in") +"' style='margin-top:0.5em;margin-bottom:2.5em;'>":"";

				var szChecked = (layer.szDisplay == "none")?"":"checked=\"checked\"";

				for ( c in layer.categoryA ){
					if ( c == "" || (c && c != "null" && layer.szFilter && layer.szFilterValue && !__inFilter(layer,c)) ){
						continue;
					}
					szChecked = (layer.categoryA[c].display == "none")?"":"checked=\"checked\"";

					// if layer style results 'invisible', don't draw legend entry
					if ( layer.categoryA && layer.categoryA[c] && layer.categoryA[c].style && layer.categoryA[c].style.match(/fill\:none/) && 
						 ( layer.categoryA[c].style.match(/stroke\:none/)			||
						   layer.categoryA[c].style.match(/stroke\-width\:0\.000/)	)  ){
						continue;
					}

					var szCatogoryName = layer.categoryA[c].legendname || layer.szLegendName;
					szCatogoryName = (c && (szCatogoryName!="(null)"))?szCatogoryName:layer.szLegendName;
					var szCategory = (c && (c!="null"))?c:name;
					szLegend += "<div class='list-group-item' style='padding-bottom:0.5em'>";
					szLegend += "<div class='list-group-item-left'>";
					if (szChecked.length){
						switch( layer.szType ){
							case "point":
								szLegend += "<span style='vertical-align:0.5em;font-size:1;color:"+layer.categoryA[c].fill+"'>&#8226;</span>";
								break;
							case "line":
								szLegend += "<span style='vertical-align:1.5em;font-size:0.2em;background:"+layer.categoryA[c].fill+"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>";
								break;
							case "polygon":
								szLegend += ixmaps.__getLayerLegendSVG(name,szCategory,layer.categoryA[c].fill,layer.categoryA[c].stroke,layer.categoryA[c].style);
								break;
						}
					}
					szLegend += "</div><div class='list-group-item-right'>";
					szLegend += "<span style='vertical-align:-4px;color:"+(szChecked.length?"#000":"#bbb")+"'>"+szCatogoryName+"</span>";
					szLegend += '<div class="checkbox" style="font-size:0.8em;float:right;padding:0;margin-top:5px;margin-right:-10px;margin-left:0px"><label>';
					szLegend += '<input type="checkbox" class="check sub_check" '+szChecked+' style="margin:0.4em 0em 0 0.2em;float:right" onchange="javascript:ixmaps.__switchLayer($(this),\''+name+((c&&(layer.categoryA[c].legendname))?('::'+String(c).replace(/\'/g,"\\\'")):'')+'\');">&nbsp;';
					szLegend += '<span class="cr"><i class="cr-icon glyphicon glyphicon-ok"></i></span>';
					szLegend += "</label></div>";
					szLegend += "</div>";
					szLegend += "</div>";
				}

				szLegend += sub?"</div>":"";

				if ( sub ){
					szLegend += "</li>";
				}	

			}else
			if ( layer.szType == type ){

				szLegend += "<li style='margin-top:0.5em;'>";
				szLegend += '<input type="checkbox" class="check" checked="checked" onchange="javascript:ixmaps.__switchLayer($(this),\''+name+'\');">';
				szLegend += '<span>&nbsp;'+name+'</span>';
				szLegend += "</li>";
			}
		return szLegend;
		};


		/**
		 * ixmaps.__refreshLegend  
		 * redraw the legend
		 * timeout buffered to avoid multiple refresh in short time
		 * @type void
		 */
		var __refreshTimeout = null;
		ixmaps.__refreshLegend = function(){
			if ( __refreshTimeout ){
				clearTimeout(__refreshTimeout);
			}
			__refreshTimeout = setTimeout("ixmaps.makeLayerLegend()",100);
		}

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
		ixmaps.__getLayerLegendSVG = function(szLayerName,szCategoryName,szFill,szStroke,szStyle){

			var szHtml = "";

			node = ixmaps.embeddedSVG.window.SVGDocument.getElementById("legend:setactive:"+szLayerName+((szLayerName!=szCategoryName)?("::"+szCategoryName):""));
			if ( node ){
				node = node.childNodes.item(1);
			}
		
			// a) try to get a style attribute from a SVG layer shape 
			// ------------------------------------------------------

			if ( !node ){
				node = ixmaps.embeddedSVG.window.SVGDocument.getElementById(szLayerName+((szLayerName!=szCategoryName)?("::"+szCategoryName):""));
			}

			if ( node ) {
				var szPattern = "";
				node = node.cloneNode(true);
				node.style.setProperty("stroke-width","50px");
				szStyle = node.getAttributeNS(null,"style");
				var fill= node.style.getPropertyValue("fill");
				if ( fill && fill.match(/url/) ){
					pattern = (fill.replace(/\"/g,"").split("#")[1].split("\)")[0]+":antizoomandpan");
					pattern = ixmaps.embeddedSVG.window.SVGDocument.getElementById(pattern);
					if ( pattern ){
						pattern = pattern.cloneNode(true);
						szPatternId = pattern.getAttributeNS(null,"id")+":antizoomandpan";
						pattern.setAttributeNS(null,"id",szPatternId);
						szPattern = __listNodewithChilds(pattern);
						node.style.setProperty("fill","url(#"+szPatternId+")");
						szStyle = node.getAttributeNS(null,"style").replace(/\"/g,"");
					}
				}

				szHtml+=  '<span style="vertical-align:-4px"><svg width="25" height="25" viewBox="0 0 800 800">';
				szHtml += '<defs>';
				szHtml += szPattern;
				szHtml += '</defs>';
				szHtml += '<path style="'+szStyle+'" d="M0,0 l0,800 800,0 0,-800 z" ></path>';
				szHtml += '</svg></span>';

			} 
			
			// b) use style string if defined 
			// -------------------------------

			else if ( szStyle ) {

				var szPattern = "";
				var fill= szStyle.split("fill:")[1].split(/;/)[0];
				if ( fill && fill.match(/url/) ){
					pattern = (fill.replace(/\"/g,"").split("#")[1].split("\)")[0]+":antizoomandpan");
					pattern = ixmaps.embeddedSVG.window.SVGDocument.getElementById(pattern);
					if ( pattern ){
						pattern = pattern.cloneNode(true);
						szPatternId = pattern.getAttributeNS(null,"id")+":antizoomandpan";
						pattern.setAttributeNS(null,"id",szPatternId);
						szPattern = __listNodewithChilds(pattern);
						szStyle += ";fill:url(#"+szPatternId+");";
					}
				}

				szHtml+=  '<span style="vertical-align:-4px"><svg width="25" height="25" viewBox="0 0 800 800">';
				szHtml += '<defs>';
				szHtml += szPattern;
				szHtml += '</defs>';
				szHtml += '<path style="'+szStyle+'" d="M0,0 l0,800 800,0 0,-800 z" ></path>';
				szHtml += '</svg></span>';

			}

			// c) make legend sprite from fill/stroke arguments 
			// ------------------------------------------------------

			else {

				szHtml =  '<span style="vertical-align:-4px"><svg width="25" height="25" viewBox="0 0 800 800">';
				szHtml += '<path style="fill:'+szFill+';stroke:'+szStroke+';fill-opacity:0.7;stroke-width:80px" d="M0,0 l0,800 800,0 0,-800 z" ></path>';
				szHtml += '</svg></span>';
			}

			return(szHtml);

		};

		// --------------------------------
		// m a i n   f u n c t i o n     
		// --------------------------------

		/**
		 * ixmaps.makeLayerLegend  
 		 * make the legend for all layer in the map 
		 * @type void
		 */
		ixmaps.makeLayerLegend = function(){

			var layerA = ixmaps.map().getLayer();
			var szLegend = "";

			// try to get description from SVG legend
			var description = ixmaps.embeddedSVG.window.SVGDocument.getElementById("legend:collapsable:documentinfo");
			if ( description ){
				var title = description.childNodes.item(1);
				szLegend += "<h3 style='margin-left:0.4em'>"+title.childNodes.item(1).nodeValue+"</h3>";
			}

			szLegend += "<ul>";

			for ( a in layerA ){
				szLegend += __makeLegendType(layerA[a],a,"polygon");
			}
			szLegend += "<div style='height:0.7em;'></div>";
			for ( a in layerA ){
				szLegend += __makeLegendType(layerA[a],a,"line");
			}
			szLegend += "<div style='height:0.7em;'></div>";
			for ( a in layerA ){
				szLegend += __makeLegendType(layerA[a],a,"point");
			}

			szLegend += "</ul>";

			szLegend += "<br>";

			$("#legendDiv").html(szLegend);				
		}

	/**
	 * end of namespace
	 */

})();

// -----------------------------
// EOF
// -----------------------------


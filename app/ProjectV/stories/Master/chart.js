/**********************************************************************
chart.js

$Comment: user chart drawing plugin
$Source : chart.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2015/04/13 $
$Author: guenter richter $
$Id:chart.js 1 2012-02-06 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log:chart.js,v $
**********************************************************************/

/** 
 * @fileoverview This file is a user chart draw plugin for ixmaps
 *
 * @author Guenter Richter guenter.richter@ixmaps.com
 * @version 0.9
 */

/**
 * define namespace ixmaps
 */

window.ixmaps = window.ixmaps || {};
(function() {

	// sample of a user generated chart 
	// --------------------------------
	ixmaps.htmlgui_drawChart = function(SVGDocument,args){

		// if theme specific user draw function is defined, call it !
		if ( args.theme.getDefinitionObject().style.userdraw ){
			return eval(args.theme.getDefinitionObject().style.userdraw+"(SVGDocument,args)");
		}
		if ( args.theme.szName.match(/user/) ){

			var nValue = args.values[0];
			var nMax = Math.max(args.theme.nMax,Math.abs(args.theme.nMin));

			var rad = args.item?nValue/nMax*args.maxSize:args.maxSize/2;
			if ( args.theme.nNormalSizeValue ){
				rad = args.item?nValue/args.theme.nNormalSizeValue*args.maxSize:args.maxSize/2;
			}	
			if ( args.flag.match(/ZOOM/) ){
				var rad = 20;
				}
			var szOpacity = 1;
			var szFillOpacity = 0.6;

			// use d3 to draw the circle
			// -------------------------
			var svg = d3.select(args.target);

			svg.append("circle")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", rad)
				.attr("style","fill:#ffffff;stroke:red;stroke-width:10;fill-opacity:"+szFillOpacity+";opacity:"+szOpacity+";");

			if ( args.flag.match(/VALUES/) ){

				var nFontSize = rad/2;
				var szText = String(nValue);
				var szTextOpacity = 0.2 + nValue/nMax;

				svg.append("text")
					.attr("x", 0)
					.attr("y", nFontSize*0.4)
					.attr("style","font-family:arial;font-size:"+nFontSize+"px;text-anchor:middle;fill:#333;fill-opacity:"+szTextOpacity+";stroke:none;opacity:"+szOpacity+";pointer-events:none")
					.text(szText);
			}
			return {x:0,y:args.item?0:(rad+2)};
		}

		if ( args.theme.szName.match(/waffle/) ){

			var szMapNs = "http:"+"/"+"/"+"www.medienobjekte.de";

			// use d3 to draw the chart
			// -------------------------
			var svg = d3.select(args.target);
		
			// get chart size
			// ----------------
			var nChartWidth = args.maxSize;

			// waffles background (with gap)
			// -----------------------------------------------------------
			svg.append("rect")
				.attr("x", -(nChartWidth/2)+10)
				.attr("y", -(nChartWidth/2)+10 )
				.attr("width", nChartWidth-20)
				.attr("height", nChartWidth-20)
				.attr("style","fill:black;stroke:none;stroke-width:1;fill-opacity:0.05;opacity:1;");

			// border around waffles
			// ---------------------
			nChartWidth *= 0.9;

			// sort waffle parts to beginn with the large number
			// -----------------------------------------------------------
			var sortedIndex = [];
			for ( i=0; i<args.values.length; i++){
				sortedIndex[i] = {index:i,value:args.values[i]};
			}
			if ( args.flag.match(/SORT/) ){
				sortedIndex.sort(function(a,b){
					if ( a.value < b.value){
						return 1;
					}
					return -1;
				});
			}

			// ok, let's make the waffles
			// -----------------------------------------------------------

			// calcolate waffle params
			// use square root of max theme value to calculate waffle size
			// -----------------------------------------------------------

			var nMax = Math.max(args.theme.nMax,Math.abs(args.theme.nMin));
			var nGridX = Math.max((args.theme.nGridX||5),Math.ceil(Math.sqrt(nMax)));
			var nWaffleWidth = nChartWidth / (nGridX * 1.1 );

			var x = -nChartWidth/2;
			var y = nChartWidth/2;

			var nX = 0;

			for ( i=0; i<args.values.length; i++){

				var index = sortedIndex[i].index;

				if ( args.values[index] ){

					for ( ii=0; ii<args.values[index]; ii++ ){

						var obj = svg.append("rect")
							.attr("x", x)
							.attr("y", y-nWaffleWidth)
							.attr("width", nWaffleWidth)
							.attr("height", nWaffleWidth)
							.attr("style","fill:"+args.theme.colorScheme[index]+";stroke:null;fill-opacity:"+args.theme.fillOpacity+";opacity:"+args.theme.opacity+";");

						// must set these attributes with ixmaps namespace
						// don't know how to do with D3
						obj[0][0].setAttributeNS(szMapNs,"class",String(index));
						obj[0][0].setAttributeNS(szMapNs,"tooltip",args.theme.szLabelA[index]);
		
						x += nWaffleWidth*1.1;
						if ( ++nX >= nGridX ){
							x  = -nChartWidth/2;
							y -= nWaffleWidth*1.1;
							nX = 0;
						}
					}
				}
			}
			return {x:0,y:args.item?0:(rad+2)};
		}
		return false;
	};

	// sample of a user generated chart 
	// --------------------------------
	ixmaps.myChart = function(SVGDocument,args){

		if ( args.theme.getDefinitionObject().style.title.match(/Popolazione 2011/) ){

			var nValue = args.values[0];
			var nMax = Math.max(args.theme.nMax,Math.abs(args.theme.nMin));

			var rad = args.item?nValue/nMax*args.maxSize:args.maxSize/2;
			if ( args.theme.nNormalSizeValue ){
				rad = args.item?nValue/args.theme.nNormalSizeValue*args.maxSize:args.maxSize/2;
			}	
			if ( args.flag.match(/ZOOM/) ){
				var rad = 20;
				}
			var szOpacity = 1;
			var szFillOpacity = 0.6;

			// use d3 to draw the circle
			// -------------------------
			var svg = d3.select(args.target);

			svg.append("circle")
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", rad)
				.attr("style","fill:#ffffff;stroke:red;stroke-width:10;fill-opacity:"+szFillOpacity+";opacity:"+szOpacity+";");

			if ( args.flag.match(/VALUES/) ){

				var nFontSize = rad/2;
				var szText = String(nValue);
				var szTextOpacity = 0.2 + nValue/nMax;

				svg.append("text")
					.attr("x", 0)
					.attr("y", nFontSize*0.4)
					.attr("style","font-family:arial;font-size:"+nFontSize+"px;text-anchor:middle;fill:#333;fill-opacity:"+szTextOpacity+";stroke:none;opacity:"+szOpacity+";pointer-events:none")
					.text(szText);
			}
			return {x:0,y:args.item?0:(rad+2)};
		}
		return false;
	};

/**
 * end of namespace
 */

})();

// -----------------------------
// EOF
// -----------------------------

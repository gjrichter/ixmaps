/**********************************************************************
 mapuser.js
$Id: mapuser.js 5 2007-03-01 15:17:28Z Guenter Richter $
**********************************************************************/

/** 
 * @fileoverview This file contains the user functions for SVGGIS Map Applications.<br>
 * These functions are called by the SVGGIS Map Applications to enable user defined extensions.
 * <br>Please take this file as a prototype of user defined functions. It holds an empty template for every function.
 */

/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true*/
/* globals 
	document, window, alert, _TRACE, setTimeout, HTMLWindow,
	Map, map, thisversion, szMapNs, SVGDocument, SVGRootElement, SVGPopupGroup, 
	htmlgui_prettyPrintXML, doDomViewer
	*/

Map.User = function(){
};
Map.User.prototype = new Map();
// create instance here
map.User = new Map.User(); 

/**
 * generate ARCXML code from a map shape<br>
 * (may be called by context menu and generates than the ARCXML code of the context menu mouse object)
 */
Map.User.prototype.printARCXML = function(objNode){

	if ( objNode ){

		map.Api.createInfoBubble(objNode,new Array("ARCXML created from this"),1);

		var szId =  map.Api.getShapeId(objNode);
		var ptEnvelopeA = map.Api.getActualEnvelopeCoordinates();
		var ptList = map.Api.getShapeCoordinates(objNode);

		if ( ptList ){

			var szPrint = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";

			szPrint += "<ARCXML version=\"1.1\">\n";
			szPrint += " "+"<CONFIG>\n";
			szPrint += " "+" "+"<ENVIRONMENT>\n";
			szPrint += " "+" "+" "+"<LOCALE country=\"DE\" language=\"de\" variant=\"\" />\n";
			szPrint += " "+" "+" "+"<UIFONT color=\"0,0,0\" name=\"SansSerif\" size=\"12\" style=\"regular\" />\n";
			szPrint += " "+" "+" "+"<SCREEN dpi=\"96\" />\n";
			szPrint += " "+" "+"</ENVIRONMENT>\n";
			szPrint += " "+" "+"<MAP>\n";
			szPrint += " "+" "+" "+"<PROPERTIES>\n";
			szPrint += " "+" "+" "+" "+"<ENVELOPE minx=\""+ptEnvelopeA[0].x+"\" miny=\""+ptEnvelopeA[0].y+"\" maxx=\""+ptEnvelopeA[1].x+"\" maxy=\""+ptEnvelopeA[1].y+"\" name=\"Initial_Extent\" />\n";
			szPrint += " "+" "+" "+" "+"<MAPUNITS units=\"meters\" />\n";
			szPrint += " "+" "+" "+"</PROPERTIES>\n";

			szPrint += " "+" "+" "+"<LAYER type=\"acetate\" name=\"acetate1\" id=\"acetate1\">\n";
			szPrint += " "+" "+" "+" "+"<OBJECT id=\""+szId+"\" units=\"database\">\n";
			szPrint += " "+" "+" "+" "+" "+"<SIMPLEPOLYGONSYMBOL fillcolor=\"0,0,255\" boundarycolor=\"0,0,0\" filltransparency=\"0.5\"/>\n";
			szPrint += " "+" "+" "+" "+" "+"<POLYGON>\n";
			szPrint += " "+" "+" "+" "+" "+" "+"<RING>\n";
			for ( var a in ptList ){
				szPrint += " "+" "+" "+" "+" "+" "+" "+"<POINT x=\""+ptList[a].x+"\" y=\""+ptList[a].y+"\" />\n";
			}
			szPrint += " "+" "+" "+" "+" "+" "+"</RING>\n";
			szPrint += " "+" "+" "+" "+" "+"</POLYGON>\n";
			szPrint += " "+" "+" "+" "+"</OBJECT>\n";
			szPrint += " "+" "+" "+"</LAYER>\n";

			szPrint += " "+" "+"</MAP>\n";
			szPrint += " "+" "+"<SCALEBAR backcolor=\"224,223,227\" fontcolor=\"0,0,0\" mapunits=\"meters\" scaleunits=\"meters\" screenunits=\"centimeters\" />\n";
			szPrint += " "+"</CONFIG>\n";
			szPrint += "</ARCXML>\n";
			try{
				htmlgui_prettyPrintXML("ARCXML version 1.1",szPrint);
			}
			catch (e){
			}
		}
	}
};
/**
 * generate GML (Geographis Markup Language) code from a map shape<br>
 * (may be called by context menu and generates than the GML code of the context menu mouse object)
 */
Map.User.prototype.printGML = function(objNode){
	if ( objNode ){

		map.Api.createInfoBubble(objNode,new Array("GML created from this"),1);

		var szId =  map.Api.getShapeId(objNode);
		var ptEnvelopeA = map.Api.getActualEnvelopeCoordinates();
		var ptList = map.Api.getShapeCoordinates(objNode);
		if ( ptList ){
			var szPrint =  "<?xml version='1.0' encoding='UTF-8'?>\n";
			szPrint += " "+"<gml:FeatureCollection\n";
			szPrint += " "+" "+"xmlns:gml='http:"+"/"+"/"+"www.opengis.net/gml'\n";
			szPrint += " "+" "+"xmlns:xlink='http:"+"/"+"/"+"www.w3.org/1999/xlink'>\n";
			szPrint += " "+" "+"<gml:description>SVGGIS Polygon</gml:description>\n";
			szPrint += " "+" "+"<gml:boundedBy><gml:null>unknown</gml:null></gml:boundedBy>\n";
			szPrint += " "+" "+"<gml:Polygon srsName='"+szId+"'>\n";
			szPrint += " "+" "+" "+"<gml:outerBoundaryIs>\n";
			szPrint += " "+" "+" "+" "+"<gml:LinearRing>\n";
			szPrint += " "+" "+" "+" "+" "+"<gml:coordinates>\n";
			for ( var a in ptList ){
				szPrint += " "+" "+" "+" "+" "+" "+ptList[a].x+","+ptList[a].y+"\n";
			}
			szPrint += " "+" "+" "+" "+" "+"</gml:coordinates>\n";
			szPrint += " "+" "+" "+" "+"</gml:LinearRing>\n";
			szPrint += " "+" "+" "+"</gml:outerBoundaryIs>\n";
			szPrint += " "+" "+"</gml:Polygon>\n";
			szPrint += " "+"</gml:FeatureCollection>\n";

			try{
				htmlgui_prettyPrintXML("GML",szPrint);
			}
			catch (e){
			}
		}
	}
};

/**
 * generates a DOM tree in HTML <br>
 * (may be called by context menu; evokes a DOM Viever, and passes the context menu object as parameter)
 */
Map.User.prototype.contextDomViewer = function(){
	var domObj = map.Api.getContextMenuTarget();
	while ( domObj.nodeName != 'g' && domObj.parentNode ){
		domObj = domObj.parentNode;
	}
	doDomViewer(domObj);
};


/**
 * intercept mouse over event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onMouseOver = function(evt,szId){
	return false;
};
/**
 * intercept mouse out event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onMouseOut = function(evt,szId){
	return false;
};
/**
 * intercept mouse down event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onMouseDown = function(evt,szId){
	return false;
};
/**
 * intercept mouse up event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onMouseUp = function(evt,szId){
	return false;
};
/**
 * intercept mouse move event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @param {point} ptPos the new mouse position as point object
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onMouseMove = function(evt,szId,ptPos){
	return false;
};
/**
 * intercept mouse click event<br>
 * @param evt the event
 * @param szId the id of the shape assoziated with the event
 * @type boolean
 * @return true, to suppress the normal handler action
 */
Map.User.prototype.onClick = function(evt,szId){
	try{
		HTMLWindow.ixmaps.htmlgui_onItemClick(szId);
	}
	catch (e){
	}
	return false;
};
/**
 * intercept info display<br>
 * @param szId the id of the shape assoziated with the info display
 * @type boolean
 * @return true, to suppress the info display
 */
Map.User.prototype.onInfoDisplay = function(evt,szId){
	try{
		return HTMLWindow.ixmaps.htmlgui_onInfoDisplay(szId);
	}
	catch (e){
	}
	return false;
};

/**********************************************************************
 tooltip.js

$Comment: provides tooltip on mouseover for all HTML elements
          load this javascript inside the body tag to add tooltip functionality
		  to define a tooltip for a HTML emement add: onmouseover="ShowTip('..text..');" onmouseout="HideTip();" 
		  sample: <select id="list" onmouseover="ShowTip('select this');" onmouseout="HideTip();">
$Source : tooltip.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides extended tooltip functions for HTML pages
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true*/
/* globals 
	window, document, setTimeout, clearTimeout, event,
	map, szMapNs, ColorScheme
	*/

/* ...................................................................* 
 *  global vars                                                       * 
 * ...................................................................*/
 
var xBump,yBump=10;
var MSIE=document.all;
var NS6=document.getElementById&&!document.all;
var tipTimeout = null;

/* ...................................................................* 
 *  code section                                                      * 
 * ...................................................................*/ 

// generate the tooltip template
document.write("<div id=\"ttip\" style=\"display:none;position:absolute;max-width:200px;\"><\/div>");

if(MSIE||NS6){
	var ttipObj=document.all?document.all["ttip"]:document.getElementById?document.getElementById("ttip"):"";
}

function MSIEBodyReturn(){
	return(document.compatMode&&document.compatMode!="BackCompat")?document.documentElement:document.body;
}


function ShowTip(ttipText){
	document.onmousemove=MoveTip;
	tipTimeout = setTimeout("doShowTip('"+ttipText+"')",800);
	return false;
}
function doShowTip(ttipText){
	tipTimeout = null;
	ttipObj.innerHTML=ttipText;
	ttipObj.style.display="block";
	return false;
}

function MoveTip(e){
	document.onmousemove=null;
	var xPos=(NS6)?e.pageX:event.x+MSIEBodyReturn().scrollLeft;
	var yPos=(NS6)?e.pageY:event.y+MSIEBodyReturn().scrollTop;
	var lEdge=(xBump<0)?xBump*(-1):-1000;
	var rEdge=MSIE&&!window.opera?MSIEBodyReturn().clientWidth-event.clientX-xBump:window.innerWidth-e.clientX-xBump-20;
	var bEdge=MSIE&&!window.opera?MSIEBodyReturn().clientHeight-event.clientY-yBump:window.innerHeight-e.clientY-yBump-20;
	if(rEdge<ttipObj.offsetWidth){
		ttipObj.style.left=MSIE?MSIEBodyReturn().scrollLeft+event.clientX-ttipObj.offsetWidth+"px":window.pageXOffset+e.clientX-ttipObj.offsetWidth+"px";
	}
	else if(xPos<lEdge){
		ttipObj.style.left=xBump+"px";
	}
	else{
		ttipObj.style.left=xPos+xBump+"px";
	}
	if(bEdge<ttipObj.offsetHeight){
		ttipObj.style.top=MSIE?MSIEBodyReturn().scrollTop+event.clientY-ttipObj.offsetHeight-yBump+"px":window.pageYOffset+e.clientY-ttipObj.offsetHeight-yBump+"px";
	}
	else{
		ttipObj.style.top=yPos+yBump+"px";
	}
}

function HideTip(){
	if (tipTimeout){
		clearTimeout(tipTimeout);
	}
	if(MSIE||NS6){
		ttipObj.style.display="none";
		ttipObj.innerText="";
	}
}
// .............................................................................
// EOF
// .............................................................................


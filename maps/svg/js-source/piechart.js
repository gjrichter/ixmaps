/**********************************************************************
 piechart.js

$Comment: provides donut and pie charts
$Source : piechart.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2005/03/14 $
$Author: guenter richter $
$Id: piechart.js 7 2007-05-10 07:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: piechart.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides functions to create pie and donut charts<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

/* ........................................................................................* 
 *  API for constructor of object DonutChart ( makes script loadable; see ScriptLoader() ) * 
 * ........................................................................................*/ 

	DonutCharts = new _DonutCharts();
/**
 * This is the api class for the Class: DonutChart  
 * @constructor
 * @throws 
 * @return A new DonutChart api
 */
    function _DonutCharts() {
	/** wrapper to creates a new donut chart object from the class DonutChart */
	this.newChart = function DCnewDonutChart(SVGDocument,donutGroup,mX,mY,nRadOuter,nRadInner) {
				 	return new DonutChart(SVGDocument,donutGroup,mX,mY,nRadOuter,nRadInner);
					};
	/** wrapper for the onover handler of the donut / pie */
	this.partOver = _crc_donutPartOver;	
	/** wrapper for the onout handler of the donut / pie */
	this.partOut  = _crc_donutPartOut;	
	/** wrapper for the ondownr handler of the donut / pie */
	this.partDown = _crc_donutPartDown;	
	/** wrapper for the onup handler of the donut / pie */
	this.partUp   = _crc_donutPartUp;
	
	/** wrapper to draw out a donut / pie part */
	this.partDrawOut   = _crc_donutPartDrawOut;	
	/** wrapper to draw in a donut / pie part */
	this.partDrawIn   = _crc_donutPartDrawIn;	
	}

/* ........................................................................................* 
 *  Donut Chart object                                                                     * 
 * ........................................................................................*/ 

function DonutChart(targetDocument,targetGroup,mX, mY, nRadOuter, nRadInner){
	/** the SVG Document to draw the donut in */
	this.targetDocument = targetDocument;
	/** the SVG group <g> to draw the donut in */
	this.targetGroup = targetGroup;
	/** the x coordinate of the center */
	this.mX = !isNaN(mX)?mX:0;
	/** the y coordinate of the center */
	this.mY = !isNaN(mY)?mY:0;
	/** the outer radius of the donut (or pie)*/
	this.nRadOuter = !isNaN(nRadOuter)?nRadOuter:0; 
	/** the inner radius (hole) of the donut; set to 0 -> pie */
	this.nRadInner = !isNaN(nRadInner)?nRadInner:0;
	/** the perspective style ( "flat" or "3D" ) */
	this.szStyle = "flat";
	/** the color of an outline; if "none" no outline is drawn */
	this.szLine  = null;
	/** the width of an outline */
	this.nLineWidth  = 1;
	/** the array that holds the parts of the donut/pie (internal) */
	this.partsA = new Array(0);
}
/**
 * method to set a new center to the pie/donut
 * @param mX x position of new center
 * @param mY y position of new center
 */
DonutChart.prototype.setCenter = function(mX,mY){
	this.mX = mX;
	this.mY = mY;
};
/**
 * method to set a new outer radius
 * @param nRad new outer radius
 */
DonutChart.prototype.setRadOuter = function(nRad){
	this.nRadOuter = !isNaN(nRad)?nRad:0; 
};
/**
 * method to set a new inner radius ( if 0, donut -> pie )
 * @param nRad new inner radius
 */
DonutChart.prototype.setRadInner = function(nRad){
	this.nRadInner = !isNaN(nRad)?nRad:0; 
};
/**
 * method to set a new perspective style 
 * @param szStyle  "flat" or "3D" 
 */
DonutChart.prototype.setStyle = function(szStyle){
	this.szStyle = szStyle; 
};
/**
 * method to add a new donut style 
 * @param szStyle  style to add 
 */
DonutChart.prototype.addStyle = function(szStyle){
	this.szStyle += "|"+szStyle; 
};
/**
 * method to set a new outline color
 * @param szLine outline color (p.e. #ff8800) if null -> no outline
 */
DonutChart.prototype.setLine = function(szLine){
	this.szLine = szLine; 
};
/**
 * method to set a new outline width
 * @param nWidth outline width (p.e. 2)
 */
DonutChart.prototype.setLineWidth = function(nWidth){
	this.nLineWidth = nWidth; 
};
/**
 * adds one part to the donut / pie object
 * @param nPercent size of the part in 1/100
 * @param nHeight  set individual part height, overrides global height
 * @param szColor  color of the part (p.e. #ff0000)
 * @param nOffset  define >0 to draw the part away from the center
 * @param szInfo   [optional] text for tooltip
 * @param szOver   [optional] javascript to eval on mouseover
 * @param szOut   [optional] javascript to eval on mouseout
 */
DonutChart.prototype.addPart = function(nPercent,nHeight,szColor,nOffset,szText,szInfo,szOver,szOut){
	this.partsA[this.partsA.length] = {nPercent:nPercent,nInfoValue:nPercent,nHeight:nHeight,color:szColor,nOffset:nOffset,szText:szText,szInfo:szInfo,szOver:szOver,szOut:szOut}; 
	return this.partsA[this.partsA.length-1];
};
/**
 * draw the donut / pie
 */
DonutChart.prototype.realize = function(){

	var nStartAngle = 0;
	var nEndAngle   = 360;
	var donutPart = null;
	var biggestPart = this.partsA[0];
	var biggestValue = 0;
	var nLastPart = this.partsA.length-1;

	this.donutPartsA = new Array(0);

	// check empty pie
	var fChecked = false;
	for ( var i=0;i<this.partsA.length;i++ ){
		if ( this.partsA[i].nPercent > 0 ) {
			if ( this.szStyle.match(/BIGTOTOP/) ){
				if ( this.partsA[i].nPercent > biggestValue ){
					biggestPart = this.partsA[i];
					biggestValue = this.partsA[i].nPercent;
				}
			}
			fChecked = true;
		}
	}
	if ( !fChecked && !this.szStyle.match(/AUTOCOMPLETE/) ){
		_crc_constructNode('circle',this.targetDocument,this.targetGroup,{
							id:     "emptypie",
							cx:		this.mX,
							cy:		this.mY,
							r:		this.nRadOuter,
							style:	"fill:none;stroke:gray"}
							);
		_crc_newText(this.targetDocument,this.targetGroup,this.mX,this.mY,"fill:gray;font-size:"+this.nRadOuter/5+";text-anchor:middle;","Pie error: no values !");
		return;
	}
	// recalculate percentages for volume equation
	var nSqrtSum = 0;
	var nSum = 0;
	if ( this.szStyle.match(/VOLUME/) || this.szStyle.match(/STARBURST/) ){
		for ( var i=0;i<this.partsA.length;i++ ){
			nSum += this.partsA[i].nPercent;
			nSqrtSum += Math.sqrt(this.partsA[i].nPercent);
		}
		if ( 0 && (nSum<100) ){
			nSqrtSum += Math.sqrt(100-nSum);
		}
		for ( var ii=0;ii<this.partsA.length;ii++ ){
			this.partsA[ii].nPercent = Math.round(100/nSqrtSum*Math.sqrt(this.partsA[ii].nPercent));
			if ( this.szStyle.match(/VOLUME/) ){
				this.partsA[ii].nHeight  *= this.partsA[ii].nPercent/25;
			}
		}
	}
	// recalculate percentages for pies
	else {
		for ( var i=0;i<this.partsA.length;i++ ){
			nSum += this.partsA[i].nPercent;
		}
		if ( nSum != 100 ){
			if ( this.szStyle.match(/AUTOCOMPLETE/) && (nSum < 100) ){
				var compl = Math.floor((100-nSum)*100000)/100000;
				this.addPart(compl,this.partsA[0].nHeight,"#eeeeee",0,"");
			}else{
				for ( var i=0;i<this.partsA.length;i++ ){
					this.partsA[i].nPercent = this.partsA[i].nPercent/nSum*100;
				}
			}
		}
	}

	// if we have a donut, do some rotation to make the donut symmetric
	// if parametrized, put biggest to top

	if ( (this.nRadInner || this.szStyle.match(/VOLUME/)) && !this.szStyle.match(/NOROTATE/) ){

		if ( this.szStyle.match(/STARBURST/) ){
			nEndAngle = 360 - Math.floor((360/this.partsA.length/2));
		}else{
			if ( this.szStyle.match(/BIGTOTOP/) ){
				nEndAngle = 360;
				for ( var x=0; (x < this.partsA.length) && (this.partsA[x] != biggestPart) ; x++ ){
					nEndAngle -=  (this.partsA[x].nPercent<100)?Math.floor((360/100*this.partsA[x].nPercent)):0;
				}
				nEndAngle -= (this.partsA[x].nPercent<100)?Math.floor((360/100/2*biggestPart.nPercent)):0;
			}else
			if ( this.partsA[0].nPercent < 100 ) {
				nEndAngle = 360 - Math.floor((360/100/2*this.partsA[0].nPercent));
			}
		}
	}

	// here we go

	this.nRadOuterMaxL = 0;
	this.nRadOuterMaxR = 0;
	for ( i=0;i<this.partsA.length;i++ ){
		var nAngle = this.partsA[i].nPercent/100*360;
		var nGapAngle = 0;
		if ( this.szStyle.match(/STARBURST/) ){
			nAngle = 360/this.partsA.length;
		}
		if ( this.szStyle.match(/XSRAYS/) ){
			nAngle = 360/this.partsA.length;
			nGapAngle = nAngle*0.40;
			this.nRadInner = 35;
		}else
		if ( this.szStyle.match(/SRAYS/) ){
			nAngle = 360/this.partsA.length;
			nGapAngle = nAngle*0.33;
			this.nRadInner = 35;
		}else
		if ( this.szStyle.match(/RAYS/) ){
			nAngle = 360/this.partsA.length;
			nGapAngle = nAngle*0.25;
			this.nRadInner = 35;
		}
		nStartAngle = nEndAngle%360;
		nEndAngle = nStartAngle + nAngle;
		if ( nEndAngle > 360 ){
			nEndAngle = nEndAngle%360;
		}
		this.donutPartsA[i] = {nStartAngle:nStartAngle+nGapAngle,nEndAngle:nEndAngle-nGapAngle,color:this.partsA[i].color,nHeight:this.partsA[i].nHeight,nOffset:this.partsA[i].nOffset};
		if ( !this.szStyle.match(/3D/) ){
			this.donutPartsA[i].nHeight = 0;
		}
		if ( this.szStyle.match(/STARBURST/) ){
			this.donutPartsA[i].nRadOuter = Math.max(1,this.nRadInner + this.partsA[i].nPercent/100*this.partsA.length * (this.nRadOuter-this.nRadInner));
		}
		if (nStartAngle<=180 && nEndAngle >= 180 ){
			nLastPart = i;
		}
		if (nStartAngle<=180){
			this.nRadOuterMaxR = Math.max(this.nRadOuterMaxR,this.donutPartsA[i].nRadOuter);
		}else{
			this.nRadOuterMaxL = Math.max(this.nRadOuterMaxL,this.donutPartsA[i].nRadOuter);
		}
		if ( this.partsA[i].nOpacity ){
			this.donutPartsA[i].nOpacity  = this.partsA[i].nOpacity;
		}
	}
	// GR 16.08.2008 -> infodisplay this.frameGroup = _crc_constructNode('g',this.targetDocument,this.targetGroup,{id:"donutframe"+String(Math.random())});
	this.frameGroup = _crc_constructNode('g',this.targetDocument,this.targetGroup,{});
	for ( i=0;i<nLastPart;i++ ){
		donutPart = _crc_drawDonut(this.targetDocument,this.frameGroup,this.mX,this.mY,this.donutPartsA[i].nRadOuter?this.donutPartsA[i].nRadOuter:this.nRadOuter,this.nRadInner,this.donutPartsA[i].nHeight,this.donutPartsA[i].nStartAngle,this.donutPartsA[i].nEndAngle,this.donutPartsA[i].color,null,null,this.szLine,this.nLineWidth,this.szStyle,this.donutPartsA[i].nOffset);
//		donutPart.setAttributeNS(szMapNs,"tooltip",Math.round(this.partsA[i].nPercent*10)/10+" % of members "+Math.round(this.partsA[i].nHeight/20*10)/10+" % of value");
		if ( !this.szStyle.match(/SILENT/) ){
			donutPart.setAttributeNS(szMapNs,"tooltip",this.partsA[i].szInfo?this.partsA[i].szInfo:Math.round(this.partsA[i].nInfoValue*10)/10+" % ");
			if (this.partsA[i].szOver){	
				donutPart.setAttributeNS(szMapNs,"onover",this.partsA[i].szOver);
			}
			if (this.partsA[i].szOut){	
				donutPart.setAttributeNS(szMapNs,"onout",this.partsA[i].szOut);
			}
		}
		if ( this.donutPartsA[i].nOpacity ){
			donutPart.style.setProperty("stroke-opacity",String(0.6),"");
			donutPart.style.setProperty("fill-opacity",String(0.1),"");
		}
		this.donutPartsA[i].objNode = donutPart;
	}
	for ( i=this.donutPartsA.length-1;i>=nLastPart;i-- ){
		donutPart = _crc_drawDonut(this.targetDocument,this.frameGroup,this.mX,this.mY,this.donutPartsA[i].nRadOuter?this.donutPartsA[i].nRadOuter:this.nRadOuter,this.nRadInner,this.donutPartsA[i].nHeight,this.donutPartsA[i].nStartAngle,this.donutPartsA[i].nEndAngle,this.donutPartsA[i].color,null,null,this.szLine,this.nLineWidth,this.szStyle,this.donutPartsA[i].nOffset);
//		donutPart.setAttributeNS(szMapNs,"tooltip",Math.round(this.partsA[i].nPercent*10)/10+" % of members "+Math.round(this.partsA[i].nHeight/20*10)/10+" % of value");
		if ( !this.szStyle.match(/SILENT/) ){
			donutPart.setAttributeNS(szMapNs,"tooltip",this.partsA[i].szInfo?this.partsA[i].szInfo:Math.round(this.partsA[i].nInfoValue*10)/10+" % ");
			if (this.partsA[i].szOver){	
				donutPart.setAttributeNS(szMapNs,"onover",this.partsA[i].szOver);
			}
			if (this.partsA[i].szOut){	
				donutPart.setAttributeNS(szMapNs,"onout",this.partsA[i].szOut);
			}
		}
		if ( this.donutPartsA[i].nOpacity ){
			donutPart.style.setProperty("stroke-opacity",String(0.6),"");
			donutPart.style.setProperty("fill-opacity",String(0.1),"");
		}
		this.donutPartsA[i].objNode = donutPart;
	}
	if ( this.szStyle.match(/3D/) ){
		this.frameGroup.setAttributeNS(null,"transform","matrix(1 0 0 0.5 0 0)");
	}

};

/**
 * get text position for donut / pie parts
 */
DonutChart.prototype.getTextPosition = function(i){

	if (!this.donutPartsA[i]){
		return null;
	}
	var nRad = this.donutPartsA[i].nRadOuter?this.donutPartsA[i].nRadOuter:this.nRadOuter;
	var nRadMax = this.nRadOuter;
	var nOffsetAngle = 0;
	var nStartAngle = this.donutPartsA[i].nStartAngle;
	var nEndAngle = this.donutPartsA[i].nEndAngle;
	if ( nStartAngle == nEndAngle ){
		return null;
	}
	if( nStartAngle < nEndAngle ){
		nOffsetAngle = (nStartAngle+nEndAngle)/2;
	}
	else{
		nOffsetAngle = Math.min(360,(nStartAngle+nEndAngle+360)/2)%360;
	}
	if ( nOffsetAngle < 180.0 ){
		nRadMax = this.nRadOuterMaxR?this.nRadOuterMaxR+(this.nRadOuterMaxL>this.nRadOuterMaxR?Math.min(this.nRadOuterMaxR,(this.nRadOuterMaxL-this.nRadOuterMaxR)/2):0):this.nRadOuter;
	}else{
		nRadMax = this.nRadOuterMaxL?this.nRadOuterMaxL+(this.nRadOuterMaxR>this.nRadOuterMaxL?Math.min(this.nRadOuterMaxL,(this.nRadOuterMaxR-this.nRadOuterMaxL)/2):0):this.nRadOuter;
	}
	// nRadMax = this.nRadOuterMaxL?Math.max(this.nRadOuterMaxL,this.nRadOuterMaxR):this.nRadOuter;

	var nLinePointX =   (Math.sin(Math.PI*(nOffsetAngle/180.0))) * nRad;
	var nLinePointY =  -(Math.cos(Math.PI*(nOffsetAngle/180.0))) * nRad - this.donutPartsA[i].nHeight;
	var nTextPointX =   (Math.sin(Math.PI*(nOffsetAngle/180.0))) * nRadMax * 1.1;
	var nTextPointY =  -(Math.cos(Math.PI*(nOffsetAngle/180.0))) * nRadMax * 1.1 - this.donutPartsA[i].nHeight;

	return {x:nTextPointX,y:nTextPointY,lx:nLinePointX,ly:nLinePointY};
};
/* ........................................................................................* 
 *  Code section                                                                     * 
 * ........................................................................................*/ 

/**
 * to make piechart.js independent
 */
function _crc_createSingleNode(tagName,targetDocument,targetGroup){
	var newNode = targetDocument.createElementNS("http:"+"/"+"/"+"www.w3.org/2000/svg",tagName);
	targetGroup.appendChild(newNode);
	return newNode;
}
/**
 * to make piechart.js independent
 */
function _crc_constructNode(szNodeName,targetDocument,targetGroup,attributesA){
	var newElement = _crc_createSingleNode(szNodeName,targetDocument,targetGroup);
	var a;
	for ( a in attributesA ){
		newElement.setAttribute(a,attributesA[a]);
    }
	return newElement;
}
function _crc_newText(targetDocument,targetGroup,x,y,s,szText){
	if (!szText){
		szText="(undefined)";
	}
	var nT = _crc_constructNode('text',targetDocument,targetGroup,{x:String(x),y:String(y),style:s});
	var atext = targetDocument.createTextNode(szText);
	nT.appendChild(atext);
	return nT;
}

/**
 * really draw a donut part defined by parameter
 * ---------------------------------------------
 * @param targetDocument SVG Document where to draw
 * @param targetGroup	SVG group <g> where to draw
 * @param mX			x coordinate of the donut/pie center
 * @param mY			y coordinate of the donut/pie center
 * @param nRadOuter		outer radius of this piepart 
 * @param nRadInner		inner radius of this piepart, nake the donut
 * @param nHeight		indovidual part height (if null, default height is taken)
 * @param nStartAngle	donut/pie part starts at this angle ( 0 - 360 )
 * @param nEndAngle		donut/pie part ends   at this angle ( 0 - 360 )
 * @param szColor1		color of the part (p.e. #ff0000)
 * @param szColor2		individual color of the part wall (if null, a darker version of szColor1 is set per default)
 * @param szColor3		individual color of the part wall (if null, a darker version of szColor1 is set per default))
 * @param szColorLine	outline color of the part (if null, no outline is drawn)
 * @param nWidthLine	outline width of the part 
 * @param szStyle		perspective style of the part ( "flat","3D" )
 * @param nOffset		>0 to draw the part away from the center
 */
function _crc_drawDonut(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, nEndAngle, szColor1, szColor2, szColor3, szColorLine, nWidthLine, szStyle, nOffset ){

	if ( nOffset == null ){
		nOffset = 0;
	}
	var nOffsetAngle = 0;
	if( nStartAngle < nEndAngle ){
		nOffsetAngle = (nStartAngle+nEndAngle)/2;
	}
	else{
		nOffsetAngle = Math.max(360,(nStartAngle+nEndAngle+360)/2);
	}
	var nXtrPointX =   (Math.sin(Math.PI*(nOffsetAngle/180.0)));
	var nXtrPointY =  -(Math.cos(Math.PI*(nOffsetAngle/180.0)));

	mX += nOffset*nXtrPointX;
	mY += nOffset*nXtrPointY;

	if ( szStyle == null ){
		szStyle = "3D";
	}	
	if ( szColor1 == null ) {
		szColor1 = '#ffff00';
	}
	if ( szColor2 == null ) {
		szColor2 = ColorScheme.getDerivateColor(szColor1,0.7);
	}
	if ( szColor3 == null ) {
		szColor3 = ColorScheme.getDerivateColor(szColor1,0.7);
	}
	if ( szColorLine == null ) {
		szColorLine = ColorScheme.getBorderColor(szColor1);
	}
	if ( szStyle.match(/SILENT/) ){
		targetGroup = _crc_constructNode('g',targetDocument,targetGroup,{
//	GR 16.08.2008					id:'donutpart'}	
						}	
						);	
	}
	else{
		targetGroup = _crc_constructNode('g',targetDocument,targetGroup,{
// GR 16.08.2008						id:'donutpart',
						onmouseover:'DonutCharts.partOver(evt)',	
						onmouseout: 'DonutCharts.partOut(evt)',	
						onmousedown:'DonutCharts.partDown(evt)',	
						onmouseup:  'DonutCharts.partUp(evt)'}	
						);
	}

	// GR 03.05.2007 must never be negative
	if ( nStartAngle < 0 || nEndAngle < 0 ){
		return targetGroup;
	}
	_crc_constructNode('rect',targetDocument,targetGroup,{
						id:     "extractPoint",
						x:		nXtrPointX*nRadOuter/3,
						y:		nXtrPointY*nRadOuter/3,
						width:	0,
						height:	0,
						style:	"fill:none;stroke:none"}
						);
	

	if ( szStyle.match(/3D/) ){
		// inner wall of donut
		if ( nStartAngle > nEndAngle ){
			_crc_drawInnerWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, 360, szColor2 ,"none",0);
			_crc_drawInnerWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, 0, nEndAngle, szColor2 ,"none",0);
		}
		else {
			_crc_drawInnerWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, nEndAngle, szColor2 ,szColorLine, nWidthLine);
		}
	}

	// start face of donut
	if ( szStyle.match(/3D/) && nStartAngle>180 ) {
		szPathD = "";
		szPathD += pathMoveToCirclePoint(mX,mY-nHeight,nRadOuter,nStartAngle);
		szPathD += pathLineToCirclePoint(mX,mY-nHeight,nRadInner,nStartAngle);
		szPathD += pathLineToCirclePoint(mX,mY        ,nRadInner,nStartAngle);
		szPathD += pathLineToCirclePoint(mX,mY        ,nRadOuter,nStartAngle);
		szPathD += pathLineToCirclePoint(mX,mY-nHeight,nRadOuter,nStartAngle);
		newPath	= _crc_constructNode('path',targetDocument,targetGroup,{
						d:		szPathD,
						style:	"stroke:"+szColorLine+";fill:"+szColor3+";stroke-width:"+nWidthLine+";"}
						);
	}

	// end face of donut
	if ( szStyle.match(/3D/) && nEndAngle<180 ) {
		szPathD = "";
		szPathD += pathMoveToCirclePoint(mX,mY-nHeight,nRadOuter,nEndAngle);
		szPathD += pathLineToCirclePoint(mX,mY-nHeight,nRadInner,nEndAngle);
		szPathD += pathLineToCirclePoint(mX,mY        ,nRadInner,nEndAngle);
		szPathD += pathLineToCirclePoint(mX,mY        ,nRadOuter,nEndAngle);
		szPathD += pathLineToCirclePoint(mX,mY-nHeight,nRadOuter,nEndAngle);
		newPath	= _crc_constructNode('path',targetDocument,targetGroup,{
						d:		szPathD,
						style:	"stroke:"+szColorLine+";fill:"+szColor3+";stroke-width:"+nWidthLine+";"}
						);
	}

	if ( szStyle.match(/3D/) ){
		// outer wall of donut
		if ( nStartAngle > nEndAngle ){
			_crc_drawOuterWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, 360, szColor2 ,"none",0);
			_crc_drawOuterWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, 0, nEndAngle, szColor2 ,"none",0);
		}
		else {
			_crc_drawOuterWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, nEndAngle, szColor2 ,szColorLine, nWidthLine);
		}
	}

	// GR 18.03.2011 check if we have full circle, if yes, don't draw lines to center 
	if ( (nEndAngle-nStartAngle) >= 360 ){
		// surface of donat
		szPathD = "";
		szPathD += pathMoveToCirclePoint	(mX,mY-nHeight,nRadOuter,nStartAngle);
		szPathD += pathDrawArc				(mX,mY-nHeight,nRadOuter,nStartAngle,nEndAngle);
		szPathD += pathMoveToCirclePoint	(mX,mY-nHeight,nRadInner,nEndAngle);
		if ( nRadInner ){
			szPathD += pathDrawArcCounterClock	(mX,mY-nHeight,nRadInner,nEndAngle,nStartAngle);
		}
		newPath		= _crc_constructNode('path',targetDocument,targetGroup,{
						d:		szPathD,
						style:	"stroke:"+szColorLine+";fill:"+szColor1+";stroke-width:"+nWidthLine+";"}
						);
	}else{
		// surface of donat
		szPathD = "";
		szPathD += pathMoveToCirclePoint	(mX,mY-nHeight,nRadOuter,nStartAngle);
		szPathD += pathDrawArc				(mX,mY-nHeight,nRadOuter,nStartAngle,nEndAngle);
		szPathD += pathLineToCirclePoint	(mX,mY-nHeight,nRadInner,nEndAngle);
		if ( nRadInner ){
			szPathD += pathDrawArcCounterClock	(mX,mY-nHeight,nRadInner,nEndAngle,nStartAngle);
		}
		szPathD += pathLineToCirclePoint	(mX,mY-nHeight,nRadOuter,nStartAngle);
		newPath		= _crc_constructNode('path',targetDocument,targetGroup,{
						d:		szPathD,
						style:	"stroke:"+szColorLine+";fill:"+szColor1+";stroke-width:"+nWidthLine+";"}
						);
	}

	return targetGroup;
}

/**
 * draw the inner wall of a donut part
 * ---------------------------------------------
 * @param targetDocument SVG Document where to draw
 * @param targetGroup	SVG group <g> where to draw
 * @param mX			x coordinate of the donut/pie center
 * @param mY			y coordinate of the donut/pie center
 * @param nRadOuter		outer radius of this piepart 
 * @param nRadInner		inner radius of this piepart, nake the donut
 * @param nHeight		indovidual part height (if null, default height is taken)
 * @param nStartAngle	donut/pie part starts at this angle ( 0 - 360 )
 * @param nEndAngle		donut/pie part ends   at this angle ( 0 - 360 )
 * @param szColor2		individual color of the part wall (if null, a darker version of szColor1 is set per default)
 * @param szColorLine	outline color of the part (if null, no outline is drawn)
 * @param nWidthLine	outline width of the part 
 */
function _crc_drawInnerWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, nEndAngle, szColor2, szColorLine, nWidthLine ){

	if ( nStartAngle>90 && nStartAngle<270 && nEndAngle<270 ){
		return;
	}
	szPathD = "";
	szPathD += pathMoveToCirclePoint	(mX,mY-nHeight,nRadInner,nStartAngle);
	szPathD += pathDrawArc				(mX,mY-nHeight,nRadInner,nStartAngle,nEndAngle);
	szPathD += pathLineToCirclePoint	(mX,mY        ,nRadInner,nEndAngle);
	szPathD += pathDrawArcCounterClock	(mX,mY        ,nRadInner,nEndAngle,nStartAngle);
	szPathD += pathLineToCirclePoint	(mX,mY-nHeight,nRadInner,nStartAngle);
	newPath	= _crc_constructNode('path',targetDocument,targetGroup,{
					d:		szPathD,
					style:	"stroke:"+szColorLine+";fill:"+szColor2+";stroke-width:"+nWidthLine+";"}
					);
}

/**
 * draw the outer wall of a donut part
 * ---------------------------------------------
 * @param targetDocument SVG Document where to draw
 * @param targetGroup	SVG group <g> where to draw
 * @param mX			x coordinate of the donut/pie center
 * @param mY			y coordinate of the donut/pie center
 * @param nRadOuter		outer radius of this piepart 
 * @param nRadInner		inner radius of this piepart, nake the donut
 * @param nHeight		indovidual part height (if null, default height is taken)
 * @param nStartAngle	donut/pie part starts at this angle ( 0 - 360 )
 * @param nEndAngle		donut/pie part ends   at this angle ( 0 - 360 )
 * @param szColor2		individual color of the part wall (if null, a darker version of szColor1 is set per default)
 * @param szColorLine	outline color of the part (if null, no outline is drawn)
 * @param nWidthLine	outline width of the part 
 */
function _crc_drawOuterWall(targetDocument, targetGroup,mX, mY, nRadOuter, nRadInner, nHeight, nStartAngle, nEndAngle, szColor2, szColorLine, nWidthLine ){

	var nnStartAngle = Math.max(nStartAngle,90);
	var nnEndAngle   = Math.min(nEndAngle  ,270);
	if ( nnStartAngle > nnEndAngle ){
		return;
	}
	szPathD = "";
	szPathD += pathMoveToCirclePoint	(mX,mY-nHeight,nRadOuter,nnStartAngle);
	szPathD += pathDrawArc				(mX,mY-nHeight,nRadOuter,nnStartAngle,nnEndAngle);
	szPathD += pathLineToCirclePoint	(mX,mY        ,nRadOuter,nnEndAngle);
	szPathD += pathDrawArcCounterClock	(mX,mY        ,nRadOuter,nnEndAngle,nnStartAngle);
	szPathD +=pathLineToCirclePoint	(mX,mY-nHeight,nRadOuter,nnStartAngle);
	newPath	= _crc_constructNode('path',targetDocument,targetGroup,{
					d:		szPathD,
					style:	"stroke:"+szColorLine+";fill:"+szColor2+";stroke-width:"+nWidthLine+";"}
					);
}

/* ........................................................................................* 
 *  Event Handler for mouse events  (over, out, down, up)                                  * 
 * ........................................................................................*/ 

/**
 * onmouseover event handler
 * @param evt the event
 */
function _crc_donutPartOver(evt){
	var xOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'x')); 
	var yOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'y'));
	evt.currentTarget.setAttribute('transform','translate('+xOut/5+','+yOut/5+')');
	try{
		eval(evt.currentTarget.getAttribute('onover'));
	}
	catch (e){
	}
}
/**
 * onmouseout event handler
 * @param evt the event
 */
function _crc_donutPartOut(evt){
	evt.currentTarget.setAttribute('transform','translate(0,0)');
	try{
		eval(evt.currentTarget.getAttribute('onout'));
	}
	catch (e){
	}
}
/**
 * onmousedown event handler
 * @param evt the event
 */
function _crc_donutPartDown(evt){
	var xOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'x')); 
	var yOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'y'));
	yOut += map.Scale.normalY(0.1);
	evt.currentTarget.setAttribute('transform','translate('+xOut/5+','+yOut/5+')');
}
/**
 * onmouseup event handler
 * @param evt the event
 */
function _crc_donutPartUp(evt){
	var xOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'x')); 
	var yOut = Number(evt.currentTarget.firstChild.getAttributeNS(null,'y'));
	evt.currentTarget.setAttribute('transform','translate('+xOut/5+','+yOut/5+')');
}

/**
 * drawOut part function
 * @param the part
 */
function _crc_donutPartDrawOut(obj){
	if ( obj.firstChild ){
		var xOut = Number(obj.firstChild.getAttributeNS(null,'x')); 
		var yOut = Number(obj.firstChild.getAttributeNS(null,'y'));
		if ( xOut && yOut ){
			obj.setAttribute('transform','translate('+xOut+','+yOut+')');
			return true;
		}
	}
	return false;
}
/**
 * onmouseout event handler
 * @param evt the event
 */
function _crc_donutPartDrawIn(obj){
	if ( obj.firstChild ){
		var xOut = Number(obj.firstChild.getAttributeNS(null,'x')); 
		var yOut = Number(obj.firstChild.getAttributeNS(null,'y'));
		if ( xOut && yOut ){
			obj.setAttribute('transform','translate(0,0)');
			return true;
		}
	}
	return false;
}


/* ........................................................................................* 
 *  draw primitives                                                                        * 
 * ........................................................................................*/ 

/**
 * calculate and return the path parameter to draw a part of a circle (arc) clockwise
 * @param nX x coordinate of the center of the circle
 * @param nY y coordinate of the center of the circle
 * @param nRadius the radius of the circle
 * @param nStartAngle the angle (0-360) where the arc starts
 * @param nEndAngle the angle (0-360) where the arc ends
 */
function pathDrawArc(nX, nY, nRadius, nStartAngle, nEndAngle){
	var x1,x2,y1,y2,z1,z2,xa,ya;
	var dx1,dx2,dy1,dy2,dxa,dya;
	var angle1,angle2;
	var rad1,rad2;
	var oct;
	var szPath = ' ';

	if ( nStartAngle > nEndAngle ){
		szPath += pathDrawArc(nX, nY, nRadius, nStartAngle, 360);
		szPath += pathDrawArc(nX, nY, nRadius, 0		    , nEndAngle);
		return szPath;
		}
	
	for ( oct=1; oct<=8; oct++ ){		
		if ( nStartAngle >  oct   *45 ){
			continue;
		}
		if ( nEndAngle   <  (oct-1)*45){
			continue;
		}
		angle1 = Math.max(nStartAngle,(oct-1)*45);
		angle2 = Math.min(nEndAngle  ,(oct)  *45);

		if ( angle1 == angle2 ){
			continue;
		}
		if ( angle1 > 180 ){ angle1=360-angle1;}
		if ( angle1 >  90 ){ angle1=180-angle1;}
		if ( angle1 >  45 ){ angle1= 90-angle1;}
		if ( angle2 > 180 ){ angle2=360-angle2;}
		if ( angle2 >  90 ){ angle2=180-angle2;}
		if ( angle2 >  45 ){ angle2= 90-angle2;}

		rad1 = Math.PI*angle1/180.0;
		rad2 = Math.PI*angle2/180.0;

		// 1. Anfangs und Endpunkt eines arc	
		x1 =  nRadius*Math.sin(rad1);
		y1 =  nRadius*Math.cos(rad1);
		x2 =  nRadius*Math.sin(rad2);
		y2 =  nRadius*Math.cos(rad2);
		// 2. TangentenGleichungen y = steigung*x + offset
		//	  x und y sind bekannt, steigung = -tan(angle), offset = ?
		z1 = y1 + Math.tan(rad1)*x1;
		z2 = y2 + Math.tan(rad2)*x2;
		// Schnittpunkt der Tangenten 
		xa =  (z2-z1)/(Math.tan(rad2)-Math.tan(rad1));
		ya =  -Math.tan(rad1)*xa+z1;

		// je nach Oktant umrechnen (spiegeln) 
		switch(oct){	
			case 1: dx1= x1; dx2= x2; dxa= xa; dy1=-y1; dy2=-y2; dya=-ya; break;
			case 2: dx1= y1; dx2= y2; dxa= ya; dy1=-x1; dy2=-x2; dya=-xa; break;
			case 3: dx1= y1; dx2= y2; dxa= ya; dy1= x1; dy2= x2; dya= xa; break;
			case 4: dx1= x1; dx2= x2; dxa= xa; dy1= y1; dy2= y2; dya= ya; break;
			case 5: dx1=-x1; dx2=-x2; dxa=-xa; dy1= y1; dy2= y2; dya= ya; break;
			case 6: dx1=-y1; dx2=-y2; dxa=-ya; dy1= x1; dy2= x2; dya= xa; break;
			case 7: dx1=-y1; dx2=-y2; dxa=-ya; dy1=-x1; dy2=-x2; dya=-xa; break;
			case 8: dx1=-x1; dx2=-x2; dxa=-xa; dy1=-y1; dy2=-y2; dya=-ya; break;
		}
		szPath += 'Q' + String(nX+dxa)+','+String(nY+dya) + ' ' + String(nX+dx2)+','+String(nY+dy2);
	}
	return szPath;
}


/**
 * wrapper to draw the arc counter clock wise; calls pathDrawArc(...)
 * @param nX x coordinate of the center of the circle
 * @param nY y coordinate of the center of the circle
 * @param nRadius the radius of the circle
 * @param nStartAngle the angle (0-360) where the arc starts
 * @param nEndAngle the angle (0-360) where the arc ends
 */
function pathDrawArcCounterClock(nX, nY, nRadius, nStartAngle, nEndAngle){

	var szPathD = "";
	szPathD += pathDrawArc(nX, nY, nRadius, nEndAngle, nStartAngle);

	var szInvers = "";
	var qubicA = szPathD.split('Q');
	for ( var i=qubicA.length-1; i>0; i-- ){
		var pointA = qubicA[i].split(' '); 
		for ( var ii=1; ii>=0; ii-- ){
			if ( i==qubicA.length-1 && ii == 1 ){
				continue;
			}
			if ( ii == 0 ){
				szInvers += ' Q'+pointA[ii];
			}
			else{
				szInvers += ' '+pointA[ii];
			}
		}
	}
	szInvers += pathAddCirclePoint(nX, nY, nRadius, nEndAngle);
	return szInvers;
}

/**
 * calculate and return the path parameter to move the pen from the center to a point on a circle
 * @param nX x coordinate of the center of the circle
 * @param nY y coordinate of the center of the circle
 * @param nRadius the radius of the circle
 * @param nAngle the angle (0-360) where the circle point lies
 */
function pathMoveToCirclePoint(nX, nY, nRadius, nAngle){
	var x1,y1;
	var rad1;

	rad1 = Math.PI*nAngle/180.0;

	// Kreispunkt	
	x1 =  nRadius*Math.sin(rad1);
	y1 =  nRadius*Math.cos(rad1);
	y1 = -y1;

	return 'M'+String(nX+x1)+','+String(nY+y1);
}

/**
 * calculate and return the path parameter to draw a line from the center to a point on a circle
 * @param nX x coordinate of the center of the circle
 * @param nY y coordinate of the center of the circle
 * @param nRadius the radius of the circle
 * @param nAngle the angle (0-360) where the circle point lies
 */
function pathLineToCirclePoint(nX, nY, nRadius, nAngle){
	var x1,y1;
	var rad1;

	rad1 = Math.PI*nAngle/180.0;

	// Kreispunkt	
	x1 =  nRadius*Math.sin(rad1);
	y1 =  nRadius*Math.cos(rad1);
	y1 = -y1;

	return 'L'+String(nX+x1)+','+String(nY+y1);
}

/**
 * calculate and return the path parameter to add one point on a circle
 * @param nX x coordinate of the center of the circle
 * @param nY y coordinate of the center of the circle
 * @param nRadius the radius of the circle
 * @param nAngle the angle (0-360) where the circle point lies
 */
function pathAddCirclePoint(nX, nY, nRadius, nAngle){
	var x1,y1;
	var rad1;

	rad1 = Math.PI*nAngle/180.0;

	// Kreispunkt	
	x1 =  nRadius*Math.sin(rad1);
	y1 =  nRadius*Math.cos(rad1);
	y1 = -y1;

	return ' '+String(nX+x1)+','+String(nY+y1);
}

// EOF

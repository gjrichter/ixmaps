/**********************************************************************
 mapscript2.js

$Comment: provides JavaScript interactivity for svggis
$Source : mapscript2.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2004/12/15 $
$Author: guenter richter $
$Id: mapscript2.js 9 2007-06-27 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: mapscript2.js,v $
**********************************************************************/

/** 
 * @fileoverview This file is the main extension JavaScript for SVGGIS Map Applications.<br>
 *
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

// --------------------------------------------------------------------------------- 
// label handling ( check space and overlap ) 
// --------------------------------------------------------------------------------- 

/**
 * Create a new Map.Label instance.  
 * @class It realizes the dynamic label procedures (resize, positioning, ... )
 * @constructor
 * @throws 
 * @return A new Map.Label Object
 */
Map.Label = function(evt){

	_TRACE("--- init Map.Label");

	/** the SVG document containing the layer */
	this.document = evt?evt.target.ownerDocument:SVGDocument;

	this.checkItemA = new Array(0);
	this.checkOvlA = new Array(0);

	this.nodeA = new Array(0);
	this.boxA = new Array(0);
	this.rootNode = null;
	this.zoomScale = 0;
	this.fCheckLabelOverlappingPending = false;

	this.ALTS_textA = null;
	this.ALTS_nodeA = null;
	this.ALTS_rootNode = null;
	this.fAdaptLabelToScalingPending = false;

	this.killProcess = false;
};
Map.Label.prototype = new Map();
 /**
 * Create a new Map.Label.Item instance.  
 * @class It realizes an object for one label handling
 * @constructor
 * @throws 
 * @return A new Map.Label.Item Object
 */
Map.Label.Item = function(textNode){
	if (textNode){
		this.textNode = textNode;
		this.szId = textNode.getAttributeNS(null,"id") || "noId";
		this.bgNode = SVGDocument.getElementById(this.szId+":bg");
		this.bbNode = SVGDocument.getElementById(this.szId+":textbg");
		this.poNode = SVGDocument.getElementById(this.szId.slice(0,this.szId.length-1));
		if ( !this.poNode ){
			var szId = map.Tiles.getMasterId(this.szId);
			szId = szId.slice(0,szId.length-1);
			this.poNode = SVGDocument.getElementById(szId);
		}
		this.bBox = null;
	}
	else{
		this.szId = "mapLabelNullItem";
		return null;
	}
};
/**
 * set the display state of one label, incl. background or outline
 * @param szMode the display attibute to set ( 'inline' or 'none' )
 */
Map.Label.Item.prototype.setDisplay = function(szMode){
	this.textNode.style.setProperty("display",szMode,"");
	if ( this.bgNode ){
		this.bgNode.style.setProperty("display",szMode,"");
	}
	if ( this.bbNode ){
		this.bbNode.style.setProperty("display",szMode,"");
	}
	if ( this.poNode && (this.poNode.nodeName == "use") ){
		this.poNode.style.setProperty("display",szMode,"");
	}
};
/**
 * set the scale of one label, incl. background or outline
 * @param xScale the width scaling factor
 * @param yScale the height scaling factor
 */
Map.Label.Item.prototype.setScale = function(xScale,yScale){
	setScale(this.textNode,xScale,yScale);
	if ( this.bgNode ){
		setScale(this.bgNode,xScale,yScale);
	}
	if ( this.bbNode ){
		setScale(this.bbNode,xScale,yScale);
	}
};
/**
 * adapt the size of the label background to the label text
 */
Map.Label.Item.prototype.scaleBackground = function(){
	if ( this.bbNode && this.textNode ){
		var nMargin = map.Scale.normalX(2)*map.Scale.nZoomScale;
		var bBox = map.Dom.getBox(this.textNode);
		// for text offsets in compatible format (no basline-shift)
		var ptTrans = getTranslateAttributeValue(this.textNode);
		if ( bBox.width > 0 && bBox.height > 0 ){
			this.bbNode.setAttributeNS(null,'x',bBox.x+(ptTrans.x?ptTrans.x-nMargin:0));
			this.bbNode.setAttributeNS(null,'y',bBox.y-nMargin+ptTrans.y);
			this.bbNode.setAttributeNS(null,'width',bBox.width+nMargin*2);
			this.bbNode.setAttributeNS(null,'height',bBox.height+nMargin*2);
		}
	}
};
/**
 * stop all label processing
 */
Map.Label.prototype.stopProcessing = function(){
	_TRACE("Map.Label: stopProcessing ==== >" );
	this.killProcess = true;
};
/**
 * prepare for check overlapping; needed for loaded tiles to eventuelly hide the label
 * @param rootNode the DOM SVG node to beginn to search for label
 */
Map.Label.prototype.prepareCheckOverlap = function(rootNode){
	_TRACE("Map.Label: prepareCheckOverlap ============ >>>");
	var nodeTempA = rootNode.getElementsByTagName('text');
	for ( var j=0;j<nodeTempA.length;j++ ){
		if (  nodeTempA.item(j).firstChild &&
			 !(nodeTempA.item(j).firstChild.nodeName == "textPath") && 
			 !(nodeTempA.item(j).getAttributeNS(null,"id").match(/:bg/)) 
			 ){
			var cItem = new Map.Label.Item(nodeTempA.item(j));
			cItem.setDisplay("none");
		}
	}
};
/**
 * initialize the check for label overlapping
 * @param rootNode the DOM SVG node to beginn to search for label
 */
Map.Label.prototype.initCheckOverlap = function(rootNode){

	this.killProcess = false;

	if ( this.fCheckLabelOverlappingPending ){
		return;
	}
	this.fCheckLabelOverlappingPending = true;
	
	_TRACE("Map.Label: initCheckOverlap ============ >>>");

	this.checkItemA.length = 0;
	this.checkOvlA.length = 0;
	this.nodeA.length = 0;
	this.boxA.length = 0;
	this.rootNode = rootNode;

	if ( fPDFEmbed || !map.Tiles.dataNode ){
		setTimeout("map.Label.collectCheckOverlap()",0);
	}
	else{
		map.pushAction("map.Label.collectCheckOverlap()");
	}
};
/**
 * get the item to check by index
 * @param nIndex the index
 * @type {@link Map.Label.Item}
 * @return the item, if found
 */
Map.Label.prototype.getCheckItem = function(nIndex){
	return this.checkItemA[nIndex];
};
/**
 * get the number of items to check
 * @type int
 * @return the number of items
 */
Map.Label.prototype.getCheckItemCount = function(){
	return this.checkItemA.length;
};
/**
 * add one text node to the check item list
 * @param textNode the DOM (SVG text) node to add  
 */
Map.Label.prototype.addCheckItem = function(textNode,fScale){

	if (!textNode){
		var cItem = new Map.Label.Item(null);
		this.checkItemA[this.checkItemA.length] = cItem;
		return;
	}
	var layerObj = map.Layer.getLayerObjOfNode(textNode);
	if ( layerObj && !textNode.parentNode.getAttributeNS(null,"id").match(/value/) ){
		if ( !(layerObj.szDisplayLabel == "inline") ){
			return;
		}
	}
	if ( !fCheckLabelOverlap && !(layerObj.szType == "polygon") ){
		return;
	}
	if (  textNode.firstChild &&
		 !(textNode.firstChild.nodeName == "textPath") && 
		 !(textNode.getAttributeNS(null,"id").match(/:bg/)) ){

		// GR 04.05.2011 check if visible
		var m = getMatrix(textNode);
		var ptOff = new point(Number(m[4]),Number(m[5]));
		var ptMapOffset = map.Scale.getMapOffset(textNode);
		ptOff.x += ptMapOffset.x;
		ptOff.y += ptMapOffset.y;
		if ( ptOff.x < this.zoomBox.x				||
			 ptOff.x > this.zoomBox.x+this.zoomBox.width  ||
			 ptOff.y < this.zoomBox.y				||
			 ptOff.y > this.zoomBox.y+this.zoomBox.height ){
			return;
		}

		var cItem = new Map.Label.Item(textNode);
		cItem.fRef = (layerObj && (layerObj.szType == "polygon"))?true:false;
		cItem.fScale = fScale;
		this.checkItemA[this.checkItemA.length] = cItem;
	}
};
/**
 * get all text elements to check for overlapping; calls getBoxCheckOverlap() if ready
 */
Map.Label.prototype.collectCheckOverlap = function(){

	_TRACE("Map.Label: collectCheckOverlap ============ >>>");

	var nodeTempA = null;
	var fGot = false;
	var tilesDone = false;

	// reverse order to match the layer rendering order
	var aA = [];

	// first all polygon layer, because this label are top
	for ( a in map.Layer.listA ){
		if ( map.Layer.listA[a].szType == 'polygon' ){
			aA.push(a);
		}
	}
	// dummy to flush the box list -> reset the check 
	if ( !fCheckOverlapAllLayer ){
		aA.push("resetoverlap");
	}

	// then the other
	for ( a in map.Layer.listA ){
		if ( map.Layer.listA[a].szType != 'polygon' ){
			aA.push(a);
		}
	}

	this.zoomBox = map.Zoom.getBox();

	// order is reversed here !
	for ( var aI=aA.length-1; aI>=0; aI-- ){

		// reset check => create dummy element => clear label box list 
		if ( aA[aI] == "resetoverlap" ){
			this.addCheckItem(null);
			continue;
		}

		var layerItem = map.Layer.listA[aA[aI]];
		if ( layerItem.szFlag.match(/tiled/) ){ // && (layerItem.nRenderer & (4|8)) ){
			if ( !tilesDone ){
				tilesDone = true;
				// do all tiles
				_TRACE(".collect on tiles") ;
				var tileInfoA = map.Tiles.getTileInfo();
				if ( tileInfoA ){
					this.addCheckItem(null);
					for ( var i=0; i<tileInfoA.length; i++){
						if (tileInfoA[i].tileGroup.style.getPropertyValue("display") == "inline" ){
							nodeTempA = tileInfoA[i].tileGroup.getElementsByTagName('text');
							// reverse index because represents rendering 
							for ( var j=nodeTempA.length-1; j>=0; j-- ){
								if ( !(nodeTempA.item(j).parentNode.style.getPropertyValue("display") == "none") ){
									this.addCheckItem(nodeTempA.item(j));
								}
							}
							if ( fCheckOverlapClipOnTiles ){
								this.addCheckItem(null);
							}
						}
					}
				}
			}
		}
		else {
			_TRACE(".collect on layer: "+layerItem.szName);
			if ( layerItem.szName ){ //&& ((layerItem.szDisplayLabel != "none")) ){
				var layerNode = SVGDocument.getElementById(layerItem.szName+":label");
				if (layerNode){
					var subLayerNodeA = layerNode.getElementsByTagName('g');
					if ( subLayerNodeA && (subLayerNodeA.length > 0) ){
						for ( var s=0; s<subLayerNodeA.length; s++ ){
							nodeTempA = subLayerNodeA.item(s).getElementsByTagName('text');
							_TRACE(".test "+nodeTempA.length+" label");
							// reverse index because represents rendering 
							for ( var i=nodeTempA.length-1; i>=0; i-- ){
								this.addCheckItem(nodeTempA.item(i));
							}
						}	
					}else{
						nodeTempA = layerNode.getElementsByTagName('text');
						_TRACE(".test "+nodeTempA.length+" label");
						// reverse index because represents rendering 
						for ( var i=nodeTempA.length-1; i>=0; i-- ){
							this.addCheckItem(nodeTempA.item(i));
						}
					}
				}
				var layerNode = SVGDocument.getElementById(layerItem.szName+":values");
				if (layerNode){
					nodeTempA = layerNode.getElementsByTagName('text');
					_TRACE(".test "+nodeTempA.length+" values");
					// reverse index because represents rendering 
					for ( var i=nodeTempA.length-1; i>=0; i-- ){
						this.addCheckItem(nodeTempA.item(i));
					}
				}
			}
		}
	}

	// at last add theme label
	// -----------------------
	if ( 1 ){
		var textObj = map.Themes.getTextObjects();
		for ( var i=0; i<textObj.length; i++ ){
			this.addCheckItem(textObj[i],true);
		}
	}

	_TRACE(".collected and tested: "+this.checkItemA.length+" label to check");
	this.zoomScale = map.Scale.nZoomScale;

	setTimeout("map.Label.getBoxCheckOverlap(0)",100);
};
/**
 * get the boxes of the label list items to check; function goes to sleep every 25 items
 * @param startIndex an actual startindex into the label item list; necessary for the sleeping 
 */
Map.Label.prototype.getBoxCheckOverlap = function(startIndex){
	var i;
	var checkItem = null;

	var mapSleep = new Map.Sleep("map.Label.getBoxCheckOverlap",this.nflushLabelDraw,"");

	_TRACE("Map.Label: getBoxCheckOverlap ==== "+startIndex+" ====== >>>");
	_STATUS("Map.Label: getBoxCheckOverlap ==== "+startIndex+" ====== >>>");

	for ( var i=startIndex; i>=0; i++ ){

		if ( this.killProcess ){
			this.killProcess = false;
			this.fCheckLabelOverlappingPending = false;
			return;
		}
		if ( mapSleep.checkSleep(i,10) ){
			return;
		}

		cItem = this.getCheckItem(i);

		if ( cItem ){
			if ( (cItem.szId == "mapLabelNullItem") && fCheckOverlapImplicit ){
				this.nodeA.length = 0;
				continue;
			}
			try {
			// make text visible to get the box


			cItem.szOldDisplay = cItem.textNode.style.getPropertyValue("display");
			cItem.textNode.style.setProperty("display","inline","");
			cItem.setScale(1,1);
			cItem.textNode.setAttributeNS(null,"x",0);
			cItem.textNode.setAttributeNS(null,"y",0);
			if ( cItem.bgNode ) {
				cItem.bgNode.style.setProperty("display","inline","");
				cItem.bgNode.setAttributeNS(null,"x",0);
				cItem.bgNode.setAttributeNS(null,"y",0);
			}
			// get the box
			var bBox = map.Dom.getBox(cItem.textNode);
			if (cItem.fScale){
				bBox.x *= map.Layer.nFeatureScale;
				bBox.y *= map.Layer.nFeatureScale;
				bBox.width *= map.Layer.nFeatureScale;
				bBox.height *= map.Layer.nFeatureScale;
			}
			var ptOff = map.Scale.getMapOffset(cItem.textNode);
			bBox.x += ptOff.x;
			bBox.y += ptOff.y;
			ptOff = getTranslate(cItem.textNode);
			bBox.x += ptOff.x;
			bBox.y += ptOff.y;
			
			// check the box
			if ( map.Zoom.isVisibleBox(bBox)	 &&
				 this.checkLabelSpace(cItem,bBox) ){

				// if rotated label, clip the box to the center
				if ( getRotateAttributeValue(cItem.textNode) > 15 && getRotateAttributeValue(cItem.textNode) < 345 ){
					cItem.setScale(1,1);
				}
				cItem.bBox = bBox;
				var nIndex = this.nodeA.length;
				this.checkOvlA[nIndex] = cItem;
				this.nodeA[nIndex] = cItem.textNode;
				this.boxA[nIndex] = bBox;
				// this is to be verified GR 16.12.2006
				if ( !fCheckLabelOverlap ){
					cItem.setDisplay("inline");
					cItem.scaleBackground();
				}
				if ( fCheckOverlapImplicit ){
					this.execCheckLabelOverlappingOne(nIndex);
				}
			}
			else{
				cItem.setDisplay("none");
			}
		}
		catch (e){
		}
		}
		else{
			if ( fCheckOverlapImplicit ){
				this.fCheckLabelOverlappingPending = false;
			}
			else {
				setTimeout("map.Label.doCheckOverlap()",100);
			}
			return;
		}
	}
};
/**
 * check the space for one label if is referenced on a ploygon;
 * if the space is insufficient, squezze the label width; 
 * if that not helps, hide the label and return false
 * @param cItem the {@link Map.Label.Item} to check
 * @type boolean
 * @return true or false
 */
Map.Label.prototype.checkLabelSpace = function(cItem,bBox){
	var szRefId = null;

	// check if label has reference flag set
	if ( !cItem.fRef ){
		return true;
	}
	if ( cItem.szId.match(/#/) ){
		var szIdA = cItem.szId.split("#");
		szRefId = szIdA[0].substr(0,szIdA[0].length-1)+"#"+szIdA[1];
	}
	else{
		szRefId = cItem.szId.substr(0,cItem.szId.length-1);
	}
	// check if label is referenced to polygon
	// ----------------------------------------
	var refNode = SVGDocument.getElementById(szRefId);
	if ( refNode ){
		// check if label fits on polygon space
		// ------------------------------------
		cItem.refBox = map.Dom.getBox(refNode);
		var refBox = cItem.refBox;
		refBox.width *= nCheckLabelSpace;

		if ( (bBox.width > refBox.width) && fAdaptLabelToScaling ){
			var nSqueeze = 1;
			var nSize = 1;
			// if we can squeeze the width to fit (max.60%), we do here
			if ( fCheckLabelSqueeze && ( (bBox.width <= refBox.width*2) || !fCheckLabelSpace ) ){
				nSqueeze = Math.max(0.7,refBox.width/bBox.width); 
				bBox.width *= nSqueeze;
				cItem.setScale(nSqueeze,1);
			}
			// if we can size the text to fit (max.25%), we do here
			if ( fCheckLabelSize && ( (bBox.width <= refBox.width*1.5) || !fCheckLabelSpace ) ){
				nSize = Math.max(0.7,refBox.width/bBox.width); 
				bBox.width *= nSize;
				bBox.height *= nSize;
				cItem.setScale(nSqueeze*nSize,nSize);
			}
			// if we are inside the polygons bounds, ok
			if ( !fCheckLabelSpace || (bBox.width <= refBox.width) ){
				cItem.setDisplay("inline");
			}
			// if not, switch the label off
			else {
				cItem.setDisplay("none");
				return false;
			}
		}
		// fits into polygon with full width
		else{
			cItem.setDisplay("inline");
		}
	}
	// no ref to polygon
	else{
		cItem.setDisplay(cItem.szOldDisplay);
	}
	return true;
};
/**
 * initiate the label overlap checking
 */
Map.Label.prototype.doCheckOverlap = function(){

	if ( !fCheckLabelOverlap  ){
		this.fCheckLabelOverlappingPending = false;
		return;
	}
	_TRACE("Map.Label: "+this.nodeA.length+" label to check");
	if ( nodeA.length > 20000 ){
		_TRACE("to many label to check !!!");
		this.checkOvlA.length = 0;
		this.nodeA.length = 0;
		this.boxA.length = 0;
		return;
	}
	this.zoomScale = map.Scale.nZoomScale;

	if ( fCheckLabelOverlap == "delayed" ){
		setTimeout("map.Label.execCheckLabelOverlappingOnly(0)",2000);
	}else{
		map.pushAction("map.Label.execCheckLabelOverlappingOnly(0)");
	}
};

/**
 * checks all label in the list for overlapping and try to correct this; function goes to sleep every 25 items
 * @param startIndex an actual startindex into the label item list; necessary for the sleeping 
 */
Map.Label.prototype.execCheckLabelOverlappingOnly = function(startIndex){

	var mapSleep = new Map.Sleep("map.Label.execCheckLabelOverlappingOnly",25,"");

	_TRACE("Map.Label: execCheckLabelOverlappingOnly ==== "+startIndex+" ====== >>>");

	for ( var i=startIndex; i<this.checkOvlA.length;i++ ){

		if ( this.killProcess ){
			this.killProcess = false;
			this.fCheckLabelOverlappingPending = false;
			return;
		}
		if ( mapSleep.checkSleep(i,10) ){
			return;
		}
		this.execCheckLabelOverlappingOne(i);
	}
	_TRACE('Map.Label: === checkLabelOverlapping ready === '+this.checkOvlA.length+' label checked');

	this.fCheckLabelOverlappingPending = false;
};
/**
 * checks one label for overlapping and try to correct this;
 * if label conflicts with existing, try to change the position (only vertically) to resolve; 
 * if this is impossible, hide the label. The repositioning can be prohibited by flag
 * @param nIndex the index of the label to check
 */
Map.Label.prototype.execCheckLabelOverlappingOne = function(nIndex){

	var cItem = this.checkOvlA[nIndex];

	if ( map.Zoom.isVisibleBox(cItem.bBox) ){

		if ( !cItem.refBox ){
			cItem.setDisplay("inline");
		}

		// check label overlapping
		// ------------------------------------
		if ( fCheckLabelOverlap ){

			var szTextA = cItem.textNode.firstChild.nodeValue;
			var boxA    = cItem.bBox;
			var nPos    = Number(cItem.textNode.getAttributeNS(szMapNs,"pos"));
			var nOff    = 0;

			var nDone = false;
			for ( var j=0; j<nIndex; j++ ){

				var szTextB = this.checkOvlA[j].textNode.firstChild.nodeValue;
				var boxB    = this.checkOvlA[j].bBox;

				if ( fCheckLabelOnlyOne && (szTextA == szTextB) ){
					if ( 0 ){
						var dA = Number(cItem.textNode.getAttributeNS(szMapNs,"dcenter"));
						var dB = Number(this.checkOvlA[j].textNode.getAttributeNS(szMapNs,"dcenter"));
						if ( dA < dB ){
							this.checkOvlA[j].bBox = null;
							this.checkOvlA[j].setDisplay("none");
							continue;
						}
					}
					if ( 1 ){
						var dA = Number(cItem.textNode.getAttributeNS(szMapNs,"partlen"));
						var dB = Number(this.checkOvlA[j].textNode.getAttributeNS(szMapNs,"partlen"));
						if ( dA > dB ){
							this.checkOvlA[j].bBox = null;
							this.checkOvlA[j].setDisplay("none");
							continue;
						}
					}
					cItem.setDisplay("none");
					cItem.bBox = null;
				}

				if (boxA && boxB &&
					cItem.textNode != this.checkOvlA[j].textNode &&
					map.Tiles.getMasterId(cItem.szId) != map.Tiles.getMasterId(this.checkOvlA[j].szId) && 
					__checkOverlapBox(boxA,boxB) ){
					// if nDone, than we have more than one problem, so kill the label
					if ( fKillOverlappingLabel || nDone ){
						if ( (boxB.height < boxA.height) && 
							 (cItem.refBox || !this.checkOvlA[j].refBox) ){
							this.checkOvlA[j].bBox = null;
							this.checkOvlA[j].setDisplay("none");
						}else{
							cItem.setDisplay("none");
							cItem.bBox = null;
						}
						break;
					}
					if ( cItem.refBox ){
						// label on polygon, only vertical position changes allowed
						// --------------------------------------------------------
						if ( boxA.y > boxB.y ){
							cItem.textNode.setAttributeNS(null,"y",boxA.height);
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"y",boxA.height);
							}
							boxA.y += boxA.height;
						}
						else{
							cItem.textNode.setAttributeNS(null,"y",-boxA.height);
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"y",-boxA.height);
							}
							boxA.y -= boxA.height;
						}
					}
					else{
						// label on point, possible position changes depending on label position
						// --------------------------------------------------------------------

						var fontHeight = parseInt(cItem.textNode.style.getPropertyValue("font-size"));

						// 1. check move down
						if ( boxA.y >= boxB.y && (nPos == 11 || nPos == 12 || nPos == 1 || nPos == 9 || nPos == 3 || nPos == 0) ){
							cItem.textNode.setAttributeNS(null,"y",fontHeight);
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"y",fontHeight);
							}
							boxA.y += parseInt(fontHeight);
						}
						// 2. check move up
						else if ( boxA.y <= boxB.y && (nPos == 7 || nPos == 6 || nPos == 5 || nPos == 9 || nPos == 3 || nPos == 0) ){
							cItem.textNode.setAttributeNS(null,"y",-boxA.height);
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"y",-boxA.height);
							}
							boxA.y -= boxA.height;
						}
						// 3. check move left
						else if ( boxA.x <= boxB.x && (nPos == 1 || nPos == 3 || nPos == 5) ){
							cItem.textNode.setAttributeNS(null,"x",-(boxA.width+50*map.Scale.nZoomScale));
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"x",-(boxA.width+50*map.Scale.nZoomScale));
							}
							boxA.x -= boxA.width+50*map.Scale.nZoomScale;
						}
						// 4. check move right
						else if ( boxA.x >= boxB.x && (nPos == 11 || nPos == 9 || nPos == 7) ){
							cItem.textNode.setAttributeNS(null,"x",+(boxA.width+50*map.Scale.nZoomScale));
							if ( cItem.bgNode ) {
								cItem.bgNode.setAttributeNS(null,"x",+(boxA.width+50*map.Scale.nZoomScale));
							}
							boxA.x += boxA.width+50*map.Scale.nZoomScale;
						}
						// if existing Label is minor, delete this
						else if ( (boxB.height < boxA.height) && 
								  (cItem.refBox || !this.checkOvlA[j].refBox) ){
							this.checkOvlA[j].bBox = null;
							this.checkOvlA[j].setDisplay("none");
							continue;
						}
					}
					nDone = true;
					j=0;
				}
			}
		}
		if ( cItem.bbNode ){
			cItem.scaleBackground();
		}
	}
	else{
	}
};
/**
 * checks if the two boxes have overlapping parts
 * @param aBox the first box
 * @param bBox the second box
 * @return true if the boxes are overlapping 
 */
__checkOverlapBox = function(aBox,bBox){

	if ( !aBox || !bBox ){
		return false;
	}
	if ( aBox.x+aBox.width  < bBox.x			 ||
		 aBox.x			    > bBox.x+bBox.width	 ||
		 aBox.y+aBox.height < bBox.y			 || 
		 aBox.y			    > bBox.y+bBox.height ){
		return false;
	}
	return true;
};

// ------------------------------------------------------------------- 
// switch label on path on/of 
// ------------------------------------------------------------------- 

/**
 * checks all label on path and if the text is longer than the path, switches the label off
 * @param evt the actual event
 * @param rootNode the DOM node from which on to look for labels on path
 */
Map.Label.prototype.adaptLabelToScaling = function(evt,rootNode){

	this.killProcess = false;

	if (!rootNode){
		rootNode = SVGRootElement;
	}
	this.fAdaptLabelToScalingPending = false;
	_TRACE('Map.Label: adaptLabelToScaling '+rootNode+','+(rootNode?rootNode.getAttributeNS(null,"id"):""));

	this.ALTS_nodeA = new Array(0);
	this.ALTS_textA = new Array(0);
	this.ALTS_rootNode = rootNode;

	var nodeA = this.ALTS_nodeA;
	var nodeTempA = null;
		
	// do only tiles
	var tileInfoA = map.Tiles.getTileInfo();
	if ( tileInfoA ){
		for ( var i=0; i<tileInfoA.length; i++){
			if (tileInfoA[i].tileGroup.style.getPropertyValue("display") == "inline" ){
				_TRACE("Map.Label: adaptLabelToScaling doTile:"+i);
				nodeTempA = tileInfoA[i].tileGroup.getElementsByTagName('textPath');
				for ( var k=0;k<nodeTempA.length;k++ ){
					if ( !nodeTempA.item(k).parentNode.getAttributeNS(null,"id").match(/:bg/) &&
						 !nodeTempA.item(k).parentNode.getAttributeNS(null,"id").match(/:linedecoration/) ){
						nodeA[nodeA.length] = nodeTempA.item(k);
					}
				}
			}
		}
	}
	if (nodeA == null || nodeA.length == 0 ){
		_TRACE("Map.Label: adaptLabelToScaling doAll !!!");
		nodeTempA = SVGRootElement.getElementsByTagName('textPath');
		for ( var i=0;i<nodeTempA.length;i++ ){
			if ( !nodeTempA.item(i).parentNode.getAttributeNS(null,"id").match(/:bg/) &&
			     !nodeTempA.item(i).parentNode.getAttributeNS(null,"id").match(/:linedecoration/) ){
				nodeA[nodeA.length] = nodeTempA.item(i);
			}
		}
	}
	_TRACE('Map.Label: ...adaptLabelToScaling '+nodeA.length+' to do');
	map.pushAction("map.Label.execAdaptLabelToScaling(0)");
};
/**
 * checks all label on path and if the text is longer than the path, switches the label off
 * @param startIndex the start index into the list
 */
Map.Label.prototype.execAdaptLabelToScaling = function(startIndex){

	var mapSleep = new Map.Sleep("map.Label.execAdaptLabelToScaling",25,"");

	_TRACE("Map.Label: execAdaptLabelToScaling ==== "+startIndex+" ====== >>>");

	var nodeA = this.ALTS_nodeA;
	var rootNode = this.ALTS_rootNode;
	var szText = null;

	for ( var i=startIndex; i<nodeA.length;i++ ){

		if ( mapSleep.checkSleep(i,10) ){
			return;
		}

		var szRefId = nodeA[i].getAttributeNS(szXlink,'href');
		szRefId = szRefId.substr(1,szRefId.length-1);
		var refNode = rootNode.getElementById(szRefId);
		if ( refNode ){
			var szIdLong = refNode.parentNode.getAttributeNS(null,"id");
			var szId = map.Tiles.getMasterId(szIdLong);
			var szIdTile = map.Tiles.getTileId(szIdLong);
			if ( map.Layer.isScaleDependentLayerOn(szId) == false){
				nodeA[i].parentNode.style.setProperty('display','none',"");
			}
			else{

				// GR 22.06.2006 only one label
				szText = nodeA[i].firstChild.nodeValue;
				// GR 09.01.2007 to verify
				if ( 0 && fTileTextNoClip ){
					if ( this.ALTS_textA[szText] ){
						continue;
					}
				}
				else
				if ( this.ALTS_textA[szText+szIdTile] ){
					// label on tile borders must be multiple
					var tileNodesA = map.Tiles.getTileNodes(map.Tiles.getMasterId(szRefId));
					if ( tileNodesA.length <= 1 ){
						continue;
					}
				}

				pBox = map.Dom.getBox(refNode);

				nodeA[i].setAttributeNS(szXlink,'href','');
				nodeA[i].parentNode.style.setProperty('display','inline',"");
				nodeA[i].parentNode.style.setProperty('font-stretch','normal',"");

				tBox = map.Dom.getBox(nodeA[i].parentNode);
				nodeA[i].setAttributeNS(szXlink,'href','#'+szRefId);

				var tLen = Math.sqrt(tBox.width*tBox.width+tBox.height*tBox.height);
				var pLen = Math.sqrt(pBox.width*pBox.width+pBox.height*pBox.height);

				var nodeTe = nodeA[i].parentNode;	
				var nodeBg = SVGDocument.getElementById(nodeTe.getAttributeNS(null,"id")+":bg");
				if (nodeBg){
					nodeBg.style.setProperty('display','inline',"");
				}

				// check label width to path length
				// ---------------------------------
				if ( tLen*0.9 < pLen ){

					// GR 09.10.2006 if space not sufficient, squeeze font
					if ( tLen*1.3 < pLen ){
						nodeTe.style.setProperty('font-stretch','normal',"");
						if (nodeBg){
							nodeBg.style.setProperty('font-stretch','normal',"");
						}
					}
					else{
						nodeTe.style.setProperty('font-stretch','narrower',"");
						if (nodeBg){
							nodeBg.style.setProperty('font-stretch','narrower',"");
						}
						_TRACE('Map.Label: font-stretch:narrower');
					}

					// GR 22.06.2006 new for only one label
					if ( fCheckLabelOnlyOne ){
						var ptOff = map.Scale.getMapOffset(refNode);
						pBox.x += ptOff.x;
						pBox.y += ptOff.y;
						ptOff = getTranslate(refNode);
						pBox.x += ptOff.x;
						pBox.y += ptOff.y;
						var cBox = new box(pBox.x,pBox.y,pBox.width,pBox.height);
						cBox.scale(tLen/pLen,tLen/pLen);

						if ( map.Zoom.isCompletelyVisibleBox(cBox) ){
							if ( fTileTextNoClip ){
								this.ALTS_textA[szText] = szRefId;
							}
							else{
								this.ALTS_textA[szText+szIdTile] = szRefId;
							}
						}
						else{
							nodeTe.style.setProperty('display','none',"");
							if (nodeBg){
								nodeBg.style.setProperty('display','none',"");
							}
						}
					}
				}
				else{
					nodeTe.style.setProperty('display','none',"");
					if (nodeBg){
						nodeBg.style.setProperty('display','none',"");
					}
				}
			}
		}
	}
	__adaptLabelToSymbols(null,rootNode);
	_TRACE('Map.Label: adaptLabelToScaling ready');
};
/**
 * checks all label on symbols and if the text is longer than the symbol width, switches the label off
 * ( not yet implemented ! )
 * @param evt the actual event
 * @param rootNode the DOM node from which on to look for labels on path
 */
__adaptLabelToSymbols = function(evt,rootNode){

};
/**
 * get the label of a shape (if exists)
 * @param the shape id
 * @type string
 * @return the label, if defined or null
 */
Map.Label.prototype.getLabel = function(szId){

	if ( !SVGDocument.getElementById(szId) ){
		var tileNodesA = map.Tiles.getTileNodes(map.Tiles.getMasterId(szId));
		if ( tileNodesA.length < 1 ){
			return null;
		}
		for ( var ii=0; ii<tileNodesA.length; ii++ ){
			var szLabel = this.getLabel(tileNodesA[ii].getAttributeNS(null,"id"));
			if ( szLabel ){
				return szLabel;
			}
		}
	}

	var nodeX = SVGDocument.getElementById(szId);
	if ( !nodeX ){
		return null;
	}
	if ( nodeX.tagName == "g" ){
		nodeA = nodeX.childNodes;
		for ( var i=0; i<nodeA.length; i++ ){
			if (nodeA.item(i).nodeType == 1 ){
				nodeX = nodeA.item(i);
				break;
			}
		}	
	}
	var nodeT = null;
	var szX = nodeX.getAttributeNS(null,"id");
	if ( szX ){
		if ( szX.match(/#/)){
			var szXA = szX.split("#");
			var nodeT = SVGDocument.getElementById(szXA[0]+"T#"+szXA[1]);
		}
		else{
			var nodeT = SVGDocument.getElementById(szX+"T");
		}
		if ( nodeT ){
			return nodeT.firstChild.nodeValue;
		}
	}
	return nodeX.getAttributeNS(szMapNs,"tooltip"); 
};
/**
 * get the label of a shape (if exists)
 * @param the shape id
 * @type string
 * @return the label, if defined or null
 */
Map.Label.prototype.xgetLabel = function(szId){
	var layerInfo = map.Layer.getLayerObj(szTheme);
	var szSelection = layerInfo?layerInfo.szSelection+" ":"";
	return null;
};

// -------------------------------------------------------------------------------------- 
// object to provide sleep functinality (to be able to interrupt time consuming function) 
// --------------------------------------------------------------------------------- ----

/**
 * Create a new Map.Sleep instance.  
 * @class It realizes an object for process interruption after n calls, or timeout
 * <br>This class can be used, to realize a sleep(), that in Javascript not exists, to interrupt time consumpting functions, to e.g. actualize a progress bar.
 * <br><br><strong>Important:</strong>	
 * <br>To be interruptabe, the functuion must have as <i>only</i> parameter a <code>continue value</code>
 * <br><br><strong>Sample:</strong>
 * <br> myFunction = function(startIndex){
 * <br>	
 * <br>	&nbsp;&nbsp;var mapSleep = new <strong>Map.Sleep</strong>("myFunction",25,"");
 * <br>	
 * <br> &nbsp;&nbsp;for ( var i=startIndex; i&lt;nodeA.length;i++ ){
 * <br>	
 * <br>	&nbsp;&nbsp;&nbsp;&nbsp;if ( mapSleep.<strong>checkSleep</strong>(i,10) ){
 * <br>	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return;
 * <br>	&nbsp;&nbsp;&nbsp;&nbsp;}	
 * <br>	
 * <br>	&nbsp;&nbsp;... (the code) ...	
 * <br>	&nbsp;&nbsp;}	
 * <br>	
 * <br>	};	
 *
 * @constructor
 * @throws 
 * @param szFunction the name of the javascript function to control
 * @param nMaxCount maximal process count before interruption
 * @param szMessage messag to display with progressbar
 * @return A new Map.Sleep Object
 */
Map.Sleep = function(szFunction,nMaxCount,szMessage){
	/** the function to be interrupted an continued after the sleep; must consume a 'continue parameter' @type string */
	this.szFunction = szFunction;
	this.initCheckSleep(nMaxCount,szMessage);
	/** flag to enable the display of a progress bar @type boolean */
	this.fEnableProgressBar = false;
	this.fShowProgressBar = false;
	this.nCount = 0;
	this.szCancel = "__cancelSleep()";
};
/**
 * set some parameter
 * @param nMaxCount maximal process count before interruption
 * @param szMessage messag to display with progressbar
 */
Map.Sleep.prototype.initCheckSleep = function(nMaxCount,szMessage){
	this.checkSleepMaxCount = nMaxCount;
	this.checkSleepCount = 0;
	this.checkSleepMessage = szMessage;
	this.runningTime = 0;
	this.fMessageDisplay = false;
	this.fShowProgressBar = false;
	if ( (typeof(this.checkSleepMessage) == 'string') && this.checkSleepMessage.length ){
		if ( !fExecuteSilent ){
			displayMessage(this.checkSleepMessage,1000);
		}
	}
	__timer_reset();
};
/**
 * check if process should be interrupted
 * @param szContinueParam parameter to call the interrupted function with after the sleep timed out
 * @param nTimeout sleep amount in millisec
 * @type boolean
 * @return true, if the process has been interrupted	
 */
Map.Sleep.prototype.checkSleep = function(szContinueParam,nTimeout){
	if ( this.checkSleepMaxCount && (this.checkSleepCount++ >= this.checkSleepMaxCount) ){
		this.checkSleepCount = 0;
		var szContinue = this.szFunction+"('"+String(szContinueParam)+"')";
		// _TRACE("** "+szContinue+" ** sleep:"+nTimeout+"ms, continue with:"+szContinueParam);
		if ( this.fShowProgressBar ){
			this.runningTime = __timer_getSEC();
			var nDone = Math.floor(100/this.nCount*this.nDoneCount);
			executeWithProgressBar(szContinue,this.nDoneCount,this.nCount,this.checkSleepMessage,this.szCancel,this.runningTime);
		}
		else{
			if ( !this.fMessageDisplay ){
				if ( !fExecuteSilent ){
					displayMessage(this.checkSleepMessage,1000);
				}
				this.fMessageDisplay = true;
			}	
			setTimeout(szContinue,nTimeout?nTimeout:1);
		}
		return true;
	}
	if ( 0 && this.runningTime && (this.checkSleepMaxCount > 100 ) && 
			((__timer_getSEC() - this.runningTime) > 5) ){
		this.checkSleepMaxCount --;
	}

	return false;
};
/**
 * check if process should be interrupted
 * @param szContinueParam parameter to call the interrupted function with after the sleep timed out
 * @param nTimeout sleep amount in millisec
 * @type boolean
 * @return true, if the process has been interrupted	
 */
Map.Sleep.prototype.checkSleepMS = function(szContinueParam,nTimeout){
	if ( this.checkSleepMaxCount && __timer_getMS() > this.checkSleepMaxCount ){
		__timer_reset();
		var szContinue = this.szFunction+"('"+String(szContinueParam)+"')";
		setTimeout(szContinue,nTimeout?nTimeout:1);
		return true;
	}
	return false;
};

function __cancelSleep(){
	alert("cancel sleep");
}

/**
 * Create a new Map.Tiles instance.  
 * @class It realizes an object for tiles handling
 * <br>At the moment only one set of tiles is supported; but they can contain several layer
 * @constructor
 * @throws 
 * @return A new Map.Tiles Object
 */
Map.Tiles = function(){

	_TRACE("--- init tiles");

	var tilesNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"tiles");
	if ( tilesNodesA.length ){
		/** the one and only tiles location node */
		this.tilesNode	= SVGDocument.getElementsByTagNameNS(szMapNs,"maptiles");
		/** the one and only metadata node, that contains tiling infos @type DOM node */
		this.dataNode	= tilesNodesA.item(0);
		/** the number of rows and lines (number of tiles = nCount*nCount) @type int */
		this.nCount		= this.dataNode.getAttributeNS(null,"count");
		/** the width of each tile @type int */
		this.tileWidth	= this.dataNode.getAttributeNS(null,"width");
		/** the height of each tile @type int */
		this.tileHeight = this.dataNode.getAttributeNS(null,"height");
		/** the filename root for the tiles @type string */
		this.tilesRoot  = this.dataNode.getAttributeNS(null,"root").split(".")[0];
		/** the filename suffix for the tiles @type string */
		this.tilesSuffix  = this.dataNode.getAttributeNS(null,"root").split(".")[1];
		/** an upper scale limit for the visibility of all tiles @type int */
		this.depUpper   = this.dataNode.getAttributeNS(null,"upper");
		/** a lower scale limit for the visibility of all tiles @type int */
		this.depLower   = this.dataNode.getAttributeNS(null,"lower");
		if ( fMarkTiles ){
			this.markTiles();
		}
		/** holds the tile loader @type SVGLoaderTiles */
		this.xLoader = null;
		/** flag to indicate, that tiles are in progress of beeing discarded (deleted from the DOM) @type boolean */
		this.fDiscardPending = false;
	}
};
Map.Tiles.prototype = new Map();

/**
 * get all part nodes of a map shape belonging to a tiled layer.
 * <br>map shapes can be divided by tile boundaries and one shape may consist of several parts lying on different tiles.
 * This function build a list of all nodes belonging to one shape (id) 
 * @param szBasicId the id of the shape
 * @type array
 * @return an array of DOM nodes
 */
Map.Tiles.prototype.getTileNodes = function(szBasicId){
	var tileNodesA = new Array(0); 
	var tileNodeIdsA = this.getTileNodeIds(szBasicId); 
	for ( var i=0; i<tileNodeIdsA.length; i++ ){
		var tileNode = SVGDocument.getElementById(tileNodeIdsA[i]);
		if (tileNode){
			tileNodesA[tileNodesA.length] = tileNode;
		}
	}
	return tileNodesA;
};
/**
 * generate all possible tile part id's of a map shape
 * @param szBasicId the id of the shape
 * @type array
 * @return an array of strings 
 */
Map.Tiles.prototype.getTileNodeIds = function(szBasicId){
	var szIdA = szBasicId.split(':');
	szBasicId = szIdA[0];
	var szIdX = "";
	for (var i=1; i<szIdA.length; i++ ){
		szIdX += ':'+szIdA[i];
	}
	var tileNodeIdsA = new Array(0); 
	for ( var y=0; y<this.nCount; y++ ){
		for ( var x=0; x<this.nCount; x++ ){
			tileNodeIdsA[tileNodeIdsA.length] = szBasicId + "#" + this.buildTileExtension(x,y) + szIdX;
		}
	}
	return tileNodeIdsA;
};
/**
 * generate a list of all tile position and size (box)
 * @type array
 * @return an array of boxes 
 */
Map.Tiles.prototype.getTilePositions = function(){
	var xStart = map.Scale.origMinX; // -map.Scale.mapOffset.x;
	var yStart = map.Scale.origMinY; // -map.Scale.mapOffset.y;
	var tilePosA = new Array(0); 
	for ( var y=0; y<this.nCount; y++ ){
		for ( var x=0; x<this.nCount; x++ ){
			// intentionally so because of the tile sequence - from inner to out !
			if ( x < this.nCount && y < this.nCount ) {
				var sBox = new box( xStart+x*this.tileWidth, yStart+y*this.tileHeight, this.tileWidth, this.tileHeight);
				tilePosA[tilePosA.length] = sBox;
			}
		}
	}
	return tilePosA;
};
/**
 * generate the box for one specific tile
 * @param szId the id of the tile (or one shape of the tile)
 * @type box
 * @return a box defining the tile position and size 
 */
Map.Tiles.prototype.getTileBox = function(szId){
	var szTileNr = szId.split('#')[1];
	if ( szTileNr == null || szTileNr.length <= 0 ){
		return null;
	}
	var y = Number(szTileNr.substr(0,3));
	var x = Number(szTileNr.substr(3,3));
	return new box(x*this.tileWidth-map.Scale.mapOffset.x,y*this.tileHeight-map.Scale.mapOffset.x,this.tileWidth,this.tileHeight);
};
/**
 * generate an array of elements, that hold all tile info.
 * <br>one element: {szUrl:szUrl,szGroup:szId,tileGroup:tileNode,x:x,y:y,bBox:sBox} 
 * @type array
 * @return an array of elements with tile infos 
 */
Map.Tiles.prototype.getTileInfo = function(){
	var xStart = map.Scale.origMinX; // -map.Scale.mapOffset.x;
	var yStart = map.Scale.origMinY; // -map.Scale.mapOffset.y;
	var tileInfoA = new Array(0); 
	var dy=1;
	for ( var y=Math.floor(this.nCount/2); y<=this.nCount && y>=0; ){
		var dx=1;
		for ( var x=Math.floor(this.nCount/2); x<=this.nCount && x>=0; ){
			// intentionally so because of the tile sequence - from inner to out !
			if ( x < this.nCount && y < this.nCount ) {
				var szUrl = this.tilesRoot + "_" + this.buildTileExtension(x,y) + "." + this.tilesSuffix;
				var szId   = "tile" + this.buildTileExtension(x,y);
				var tileNode = SVGDocument.getElementById(szId);
				var sBox = new box( xStart+x*this.tileWidth, yStart+y*this.tileHeight, this.tileWidth, this.tileHeight);
				
				tileInfoA[tileInfoA.length] = {szUrl:szUrl,szGroup:szId,tileGroup:tileNode,x:x,y:y,bBox:sBox};

				szUrl = this.tilesRoot + "_" + this.buildTileExtension(x,y) + "_ncl"+ "." + this.tilesSuffix;
				szId   = "tile" + this.buildTileExtension(x,y)+":noclip";
				tileNode = SVGDocument.getElementById(szId);
				if ( tileNode ){
					tileInfoA[tileInfoA.length] = {szUrl:szUrl,szGroup:szId,tileGroup:tileNode,x:x,y:y,bBox:sBox};
				}
			}
			x += dx;
			dx = Math.abs(dx) + 1;
			if ( (dx & 1) == 0 ){
				dx = -dx;
			}
		}
		y += dy;
		dy = Math.abs(dy) + 1;
		if ( (dy & 1) == 0 ){
			dy = -dy;
		}
	}
	// debug
	var nTiles		 = tileInfoA.length;
	var nTilesLoaded = 0;
	var nTilesInline = 0;
	for ( a in tileInfoA ){
		if ( tileInfoA[a].tileGroup ){
			if (tileInfoA[a].tileGroup.hasChildNodes()){
				nTilesLoaded++;
			}
			if (tileInfoA[a].tileGroup.style.getPropertyValue("display") == "inline" ){
				nTilesInline++;
			}
		}		
	}
	_STATUS("Tiling: "+nTiles+'/'+nTilesLoaded+'/'+nTilesInline);

	return tileInfoA;
};
/**
 * get id without tile number
 * @param szId the id
 * @type string
 * @return the shape id (master id)
 */
Map.Tiles.prototype.getMasterId = function(szId){
	if (szId == null){
		return null;
	}
	var szIdA = szId.split(':');
	var szNewId = szIdA[0].split('#')[0];
	for (var i=1; i<szIdA.length; i++ ){
		szNewId += ':'+szIdA[i];
	}
	szIdA.length = 0;
	return szNewId;
};
/**
 * get id without Entity
 * @param szId the id
 * @type string
 * @return the naked shape id (without entity, rendering or tile information)
 */
Map.Tiles.prototype.getTileId = function(szId){
	if (szId == null){
		return null;
	}
	var szIdA = szId.split(':');
	var szNewId = szIdA[0];
	szIdA.length = 0;
	return szNewId;
};
/**
 * helper to build a tile name extension from x,y tile position; example x=2,y=3 --> 003002
 * @param x the x position of the part
 * @param y the y position of the part
 * @type string
 * @return a tilename extension ( e.g. "002003" )
 */
Map.Tiles.prototype.buildTileExtension = function (x,y){
	return __maptheme_formatpart(y,"0")+__maptheme_formatpart(x,"0");
};
/**
 * set the given style attribute to one shape in all present tiles 
 * @param leadingNode the shape node, whose style was changed first
 * @param szStyle the style attribute to set
 */
Map.Tiles.prototype.setShapeStyle =  function(leadingNode,szStyle){
	if ( leadingNode && this.nCount ){

		var leadingObj = new MapObject(leadingNode);
		if ( leadingObj == null ){
			return;
		}
		var szLeadingId = leadingObj.szId;

		var szMasterId  = this.getMasterId(szLeadingId);
		var szBasicId   = szMasterId.split(':')[0];
		var szShapeId   = szMasterId.substr(szBasicId.length,szMasterId.length-szBasicId.length);
		var szTilesIdA  = this.getTileNodeIds(szBasicId);
		for ( var i=0; i<szTilesIdA.length; i++ ){
			shapeNode = SVGDocument.getElementById(szTilesIdA[i] + szShapeId);
			if (shapeNode){
				shapeNode.setAttributeNS(null,"style",szStyle);
			}
		}
	}
};
/**
 * mark the tiles by drawing a rect around 
 */
Map.Tiles.prototype.markTiles =  function(){
	var objectGroup = SVGDocument.getElementById("maptilesbg");
	if (objectGroup){
		for ( var y=0; y<this.nCount; y++ ){
			for ( var x=0; x<this.nCount; x++ ){
				map.Dom.newShape('rect',objectGroup	,-this.tileWidth *this.nCount/2+x*this.tileWidth
													,-this.tileHeight*this.nCount/2+y*this.tileHeight
													,this.tileWidth
													,this.tileHeight,"fill:none;stroke:gray;stroke-width:0.01");
			}
		}
	}
};
/**
 * check which tiles should be present for the actual zoom and pan.
 * <br>processes the switching or loading and discarding of tiles that are inside (or outside) the visible map area
 * @param evt the event
 */
Map.Tiles.prototype.switchScaleDependentTiles = function(evt){

	if (!fDynamicTiles){
		return;
	}
	if ( this.clearTiles(evt) ){
		return;
	}
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;

	_TRACE('! switch scale dependent tiles -->');

	var tilesSwitchedOn = false;

	if ( this.nCount > 0 ){
		var canvasMatrixA = getMatrix(map.Zoom.canvasNode);
		var xStart = map.Scale.origMinX;  //-canvasMatrixA[4];
		var yStart = map.Scale.origMinY;  // -canvasMatrixA[5];
		var zoomBox = map.Zoom.getBox();

		_TRACE('! tile --> xStart:'+xStart+' yStart:'+yStart);

		var tilesInfoA = this.getTileInfo();
		if ( tilesInfoA ){

			for ( var i=0; i<tilesInfoA.length; i++){
				var szUrl = tilesInfoA[i].szUrl;
				var szId  = tilesInfoA[i].szGroup;
				var x     = tilesInfoA[i].x;
				var y     = tilesInfoA[i].y;
				var bBox  = tilesInfoA[i].bBox;
				var tileGroup = tilesInfoA[i].tileGroup;
				if (tileGroup){

					var sBox = new box( xStart+x*this.tileWidth, yStart+y*this.tileHeight, this.tileWidth, this.tileHeight);

					if ( sBox.x != bBox.x || 
						 sBox.y != bBox.y ||
						 sBox.width != bBox.width ||
						 sBox.height != bBox.height ){
						alert("switchScaleDependentTiles box error !!");
					}

					if ( sBox.x+sBox.width  < zoomBox.x					|| 
						 sBox.y+sBox.height < zoomBox.y					||
						 sBox.x             > zoomBox.x+zoomBox.width	||
						 sBox.y             > zoomBox.y+zoomBox.height	){
						if (tileGroup.hasChildNodes()){
							if ( (tileGroup.getAttributeNS(szMapNs,"type") == "external") ){
								tileGroup.style.setProperty("display","none","");
								_TRACE("off: "+szId+" - "+tileGroup.hasChildNodes()+" - "+tileGroup.childNodes.length);
								if ( fDiscardTiles && (fDiscardTiles != "delayed") ){
									_TRACE("Tiling: -------------------------------------------------------------- ");
									_TRACE("out: "+szId);
									map.Themes.removeFromThemeNodesCache(tileGroup);
									map.Dom.clearGroup(tileGroup);
								}
							}
							else{
								tileGroup.style.setProperty("display","none","");
								_TRACE("off: "+szId+" - "+tileGroup.hasChildNodes()+" - "+tileGroup.childNodes.length);
							}
						}
					}
					else{
						if (!tileGroup.hasChildNodes() && tileGroup.getAttributeNS(szMapNs,"type") == "external"){
							tileGroup.style.setProperty("display","inline","");
							setTimeout("map.Tiles.loadScaleDependentTiles('"+szId+"','"+szUrl+"')",10);
							_TRACE("in:  "+szId);
						}
						else {
							if ( tileGroup.style.getPropertyValue("display") != "inline" ){
								tileGroup.style.setProperty("display","inline","");
								tilesSwitchedOn = true;
								if ( fAdaptLabelToScaling ){
									map.Layer.adaptLabelToScaling(evt,tileGroup);
								}
								_TRACE("on:  "+szId);
							}
							else {
								_TRACE("ok:  "+szId + " - " +tileGroup.style.getPropertyValue("display"));
							}
						}
					}
				}
			}
		}
	}
	if ( fDiscardTiles == "delayed" ){
		this.discardTiles();
	}
	if ( tilesSwitchedOn ){
		map.Layer.adaptLabel(evt,map.Layer.layerNode);
		map.Layer.doStoredFeatureScaling();
	}
};
/**
 * load one tile.
 * calls the import function of the tiles loader object
 * @param szId the id of the target group for the loaded tile
 * @param szUrl the url of the tile to be loaded
 */
Map.Tiles.prototype.loadScaleDependentTiles = function(szId,szUrl){
	_STATUS('Loading Tile:'+szUrl+','+szId);
	_TRACE('.loading: '+szUrl+','+szId);
	var tileGroup = SVGDocument.getElementById(szId);
	if (!this.xLoader){
		this.xLoader = new SVGLoaderTiles();
	}
	if (this.xLoader.importSVGFile(szUrl,SVGDocument,tileGroup,null)){
		fTilesLoaded = true;
	}
};
/**
 * check if tile loading in progress
 * @type boolean
 * @return true, if loading in progress
 */
Map.Tiles.prototype.isLoading = function(){
	if (this.xLoader){
		return this.xLoader.isLoading();
	}
	return false;
};
/**
 * clears (hide and evtl.remove) all loaded tiles if the zoom level is below or upper the tiles range
 * @param evt the event
 * @type boolean
 * @return true, if tiles have been cleared 
 */
Map.Tiles.prototype.clearTiles = function(evt){
	if (!fDynamicTiles){
		return false;
	}
	// GR 04.02.2013 if tile layer used in theme, don't hide or discard
	try {
		for ( a in map.Layer.listA ){
			var layerItem = map.Layer.listA[a];
			if ( layerItem.szFlag.match(/tiled/) ){
				if ( map.Themes.isThemeLayerUsed(layerItem.szName) && map.Layer.isScaleDependentLayerOn(layerItem.szName) ){
					return false;
				}
			}
		}
	}
	catch (e){}

	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;

	if ( this.nCount > 0 ){
		var nUpper = 100000000000;
		var nLower = 0;
		var depUpper = this.depUpper;
		var depLower = this.depLower;
		if (depUpper && depUpper.length){
			nUpper = Number(depUpper.split(':')[1]);
		}
		if (depLower && depLower.length){
			nLower = Number(depLower.split(':')[1]);
		}
		// GR 11.03.2011 TBD if tiles are initially invisible, but in scale range, we must load them for themes
		if ( (1||this.isAnyTiledLayerVisible()) &&
		     (map.Scale.getTrueMapScale()*map.Scale.nZoomScale >= nLower) && (map.Scale.getTrueMapScale()*map.Scale.nZoomScale <= nUpper) ){ 
			return false;
		}
		var tilesInfoA = this.getTileInfo();
		if ( tilesInfoA ){
			for ( var i=0; i<tilesInfoA.length; i++){
				var tileGroup = tilesInfoA[i].tileGroup;
				if (tileGroup){
					if ( tileGroup.hasChildNodes() ){
						tileGroup.style.setProperty("display","none","");
						var szId  = tilesInfoA[i].szGroup;
						_TRACE("off: "+szId+" - "+tileGroup.hasChildNodes()+" - "+tileGroup.childNodes.length);
						if ( fDiscardTiles && fDiscardTiles != "delayed" ){
							_TRACE("Tiling: -------------------------------------------------------------- ");
							map.Themes.removeFromThemeNodesCache(tileGroup);
							map.Dom.clearGroup(tileGroup);
						}
					}
				}
			}
		}
	}
	if ( fDiscardTiles == "delayed" ){
		this.discardTiles();
	}
	return true;
};
/**
 * initialises the tiles discarding.
 * calls a exec function on timeout, that will clear the groups of the tiles to be discarded;
 * for performance reasons, the discarding is done one by one with a timeout.
 * @param evt the event
 */
Map.Tiles.prototype.discardTiles= function(evt){
	if ( fTilesLoaded && fDiscardTiles && !this.fDiscardPending){
		setTimeout("map.Tiles.doDiscardTiles()",5000);
		this.fDiscardPending = true;
	}
};
/**
 * executes the tiles discarding;
 * for performance reasons, the discarding is done one by one with a timeout.
 * @param evt the event
 */
Map.Tiles.prototype.doDiscardTiles = function(evt){
	if (! (fDynamicTiles && fTilesLoaded) ){
		this.fDiscardPending = false;
		return;
	}
	if (mouseObject){
		_TRACE("--- discard tiles (suspended)");
		setTimeout("map.Tiles.doDiscardTiles()",6000);
		return;
	}
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	if ( map.Tiles && map.Tiles.nCount > 0 ){
		var tilesInfoA = map.Tiles.getTileInfo();
		if ( tilesInfoA ){
			for ( var i=0; i<tilesInfoA.length; i++){
				var szId  = tilesInfoA[i].szGroup;
				var tileGroup = tilesInfoA[i].tileGroup;
				if (tileGroup){
					if ( tileGroup.style.getPropertyValue("display") == "none" ){
						if ( tileGroup.hasChildNodes() ){
							map.Themes.removeFromThemeNodesCache(tileGroup);
							map.Dom.clearGroup(tileGroup);
							_TRACE("Tiling: -------------------------------------------------------------- ");
							_TRACE("tile: "+szId+" discarded");
							setTimeout("map.Tiles.doDiscardTiles()",2000);
							return;
						}
					}
				}
			}
		}
	}
	this.fDiscardPending = false;
};
/**
 * check, if any tiled layer is visible
 * @type boolean
 * @return true or false
 */
Map.Tiles.prototype.isAnyTiledLayerVisible = function(){
	for ( a in map.Layer.listA ){
		var layerItem = map.Layer.listA[a];
		if ( layerItem.szFlag.match(/tiled/) ){
			if ( layerItem.nState == true ){
				return true;
			}
			if ( layerItem.szDisplay != "none" ){
				return true;
			}
			if ( layerItem.szDisplayLabel != "none" ){
				return true;
			}
		}
	}
	_TRACE("no Layer visible");
	return false;
};
/**
 * check, if all tiles are loaded
 * @type boolean
 * @return true or false
 */
Map.Tiles.prototype.allTilesLoaded = function(){

	var tileInfoA = this.getTileInfo();
	if ( tileInfoA ){
		var nTiles		 = tileInfoA.length;
		var nTilesLoaded = 0;
		for ( a in tileInfoA ){
			if ( tileInfoA[a].tileGroup ){
				if (tileInfoA[a].tileGroup.hasChildNodes()){
					nTilesLoaded++;
				}
			}		
		}
		return ( nTiles == nTilesLoaded );
	}
	return false;
};
/**
 * check, if at least one tile of a layer is loaded
 * @type boolean
 * @return true or false
 */
Map.Tiles.prototype.isAnyLayerTileLoaded = function(szLayer){

	var tileInfoA = this.getTileInfo();
	if ( tileInfoA ){
		var nTiles		 = tileInfoA.length;
		var nTilesLoaded = 0;
		for ( a in tileInfoA ){
			if ( tileInfoA[a].tileGroup ){
				if (tileInfoA[a].tileGroup.hasChildNodes()){
					return true;
				}
			}		
		}
	}
	return false;
};

// .............................................................................
// event handling              
// .............................................................................

/**
 * Create a new Map.Event instance.  
 * @class It provides all event handler 
 * @constructor
 * @throws -
 * @return A new Event object
 */
Map.Event = function(){
	/** flag to notify, that a panning has been executed @type boolean */
	this.fPanDone = false;
	/** the actual object (shape) that has caused the mouseover event @type DOM node */
	this.onoverShape = null;
	/** flag to memorize the mouse down state @type boolean */
	this.fMouseDown = false;
	/** the actual object (shape) that caused a context menu (right mouse button has been pressed on this object) @type DOM node */
	this.contextMenuObj = null;
	/** true, if the mouse is over the popup info (needed to keep the popup displayed) @type boolean */
	this.onoverPopup = false;
	/** the shape node, that caused a popup (display) @type DOM node */
	this.popupContextObj = null;
	/** a tooltip is beeing displayed @type boolean */
	this.tooltipDone = null;
};
Map.Event.prototype = new Map();

// .............................................................................
// mouse events              
// .............................................................................

/**
 * stops the propagation of the mouse event
 * @param evt the event handle
 */
Map.Event.prototype.initUseNodes = function(rootNode){
	if ( !rootNode ){
		return;
	}
	var useNodesA = rootNode.getElementsByTagName('use');
	if (useNodesA && useNodesA.length){
		for ( i=0; i<useNodesA.length; i++ ){
			useNodesA.item(i).style.setProperty("pointer-events","none","");
		}
	}
};
/**
 * tests of undefined node type (assuming SVGElementInstance) if yes,
 * tries to find the reference element (use)
 * @param evt the event handle
 */
Map.Event.prototype.resolveInstance = function(objNode){
	if ( !objNode ){
		return null;
	}
	if ( typeof(objNode.nodeType) != "undefined" ){
		return objNode;
	}
	var testNode = objNode;
	while ( testNode.parentNode && testNode.correspondingUseElement == "undefined" ){
		testNode = testNode.parentNode;
	}
	return testNode.correspondingUseElement;
};
/**
 * stops the propagation of the mouse event
 * @param evt the event handle
 */
Map.Event.prototype.stopMouseEvent = function(evt){
	if (evt){
		evt.stopPropagation();
		evt.preventDefault();
	}
};
/**
 * handles <strong>all</strong> 'onmouseover' events: (highlight objects, display tooltip/info, ...)
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseOver = function(evt){
	if ( !evt || !evt.target ){
		return;
	}
	var onoverShape = this.resolveInstance(evt.target);
	if ( onoverShape.nodeType != 1 ){
		return;
		}
	var mapObject = new MapObject(onoverShape);
	if ( mapObject && mapObject.szId && mapObject.szId.match(/widget/) ){
		widgetList.onMouseOver(evt);
	}
	// GR 03.09.2010 test test test
	if ( this.fMouseDown && this.fMouseDownMoved ){
		return;
	}

	if (szMapToolType == "idle"){
		try	{
			if ( !mapObject ){
				HTMLWindow.ixmaps.htmlgui_onSVGPointerIdle();
				return;
			}
			var szId = mapObject.szId;
			if ( !( szId.match(/legend/)	|| 
					szId.match(/tool/)		|| 
					szId.match(/button/)	|| 
					szId.match(/widget/)	|| 
					szId.match(/movable/)	||
					szId.match(/checked/)	||
					szId.match(/unchecked/)	
				) ){
				HTMLWindow.ixmaps.htmlgui_onSVGPointerIdle();
				return;
			}else{
				_TRACE(szId);
			}
		}
		catch (e){
		}
	}

	// mouse over popup window
	if (SVGPopupGroup.fu.isContained(onoverShape) || SVGFixedGroup.fu.isContained(onoverShape)) {
		if ( this.popupContextObj ){
			__normalHighlight(evt,this.popupContextObj);
		}
		this.onoverPopup = true;
	}
	else{
		this.onoverPopup = false;
	}
		
	// mouse over shape
	if (( !this.onoverPopup					 ) && 
		( __normalHighlight(evt,onoverShape) ) &&
		( szMapToolType === "info"  || szMapToolType === ""				  )
		){

		displayInfo(evt,onoverShape,"delayed|pointer");
		this.onoverShape = onoverShape;

		try{
			highlightTheme(new MapObject(onoverShape));
		}
		catch (e){
		}
	}else{
		// GR 10.12.2013 test
		if ( 0 && !this.onoverPopup ){
			SVGPopupGroup.fu.clear();
		}
		__simpleHighlight(evt,onoverShape);
		this.tooltipDone = displayTooltip(evt,onoverShape);
	}

	try	{
		if (onoverShape.getAttributeNS(null,"id") == "mapbackground:eventrect"){
			HTMLWindow.ixmaps.htmlgui_onSVGPointerIdle();
		}
	}
	catch (e){
	}
};
/**
 * handles simple type of highlight (onoverstyle must be defined with the shape)
 * @param evt the event handle
 * @param onovershape the shape that caused the mouse over
 */
__simpleHighlight = function(evt,onoverShape){
	if (onoverShape){
		try{
			var test = onoverShape.getAttributeNS(szMapNs,"origstyle");
			if ( test && (test != "null") ){
				return;
			}
			var szHighlightStyle = onoverShape.getAttributeNS(szMapNs,"onoverstyle");
			if (szHighlightStyle){
				onoverShape.setAttributeNS(szMapNs,"origstyle",onoverShape.getAttributeNS(null,"style"));
				onoverShape.setAttributeNS(null,"style",szHighlightStyle);
			}
		}
		catch (e){
		}
	}
};
/**
 * remove simple type of highlight (onoverstyle must be defined with the shape)
 * @param evt the event handle
 * @param onovershape the shape that caused the mouse over
 */
__simpleHighlightRemove = function(evt,onoverShape){
	if (onoverShape){
		try{
			var szOrigStyle = onoverShape.getAttributeNS(szMapNs,"origstyle");
			if (szOrigStyle && szOrigStyle.length > 2 ){
				onoverShape.removeAttributeNS(szMapNs,"origstyle");
				onoverShape.setAttributeNS(null,"style",szOrigStyle);
			}
		}
		catch (e){
		}
	}
};
/**
 * handles highlighting of map shapes.
 * checks active layer, tiles etc.
 * @type boolean
 * @param evt the event handle
 * @param onovershape the shape that caused the mouse over
 * @return true if shape has been highlighted 
 */
__normalHighlight = function(evt,onoverShape){

	if (__isChart(evt,onoverShape)){
		new MapObject(onoverShape).fu.scale(1.05,1.05);
		return true;
	}

	var mapObject = new MapObject(onoverShape);
	if ( mapObject == null ){
		return false;
	}

	var retVal = true;
	var szMode = null;
	var szId = mapObject.szId;
	if ( szId.length === 0 || szId.match(/legend/) 
		                   || szId.match(/background/) 
		                   || szId.match(/button/) 
		                   || szId.match(/widget/) 
		                   || szId.match(/textgrid/) 
		                   || (szMapToolType != "info" && szMapToolType != "") ){
		if (highLightList){
			highLightList.removeAll();
		}
		return false;
	}
	if (highLightList && !highLightList.checkItem(onoverShape)){
		var idNode = onoverShape;
		if (idNode.nodeName != 'g' ){
			idNode = idNode.parentNode;
		}
		var legendId = idNode.getAttributeNS(null,"id");
		if (legendId && !legendId.match(/chartgroup/)){
			if (_activeTheme != map.Tiles.getMasterId(legendId.split(':')[0]) ){
				var layerObj = map.Layer.getLayerObj(legendId);
				if ( layerObj && layerObj.szSelection && !map.Event.tooltipDone && (szMapToolType == "info" || szMapToolType == "") ){
					displayTooltipText(evt, map.Dictionary.getLocalText("click to activate"));
				}
				if ( fHighlightHint ){
					szMode = "hint";
					retVal = false;
				}else{
					return false;
				}
			}
		}
		highLightList.removeAll();
		var shapeNodesA = map.Layer.getLayerItemNodes(onoverShape);
		for ( var i=0; i<shapeNodesA.length; i++ ){
			if ( highLightList.addItem(shapeNodesA[i],szMode) ){
				//map.Event.onoverShape = onoverShape;
			}
		}
	}
	return retVal;
};
/**
 * checks, if shapes is part of a chart.
 * @type boolean
 * @param evt the event handle
 * @param onovershape the shape that caused the mouse over
 * @return true if shape is part of a chart
 */
__isChart = function(evt,onoverShape){
	mapObj = new MapObject(onoverShape);
	if ( mapObj.szId.match(/chartgroup/) || mapObj.szId.match(/chart:box/) ){
		var theme = map.Themes.getTheme(mapObj.szId.split(":")[0]);
		if ( theme && theme.szFlag && theme.szFlag.match(/BUFFER/) ){
			return false;
		}
		return true;
	}
	return false;
};
/**
 * handles <strong>all</strong> 'onmouseout' events: (reset object style, remove tooltip/info, ...)
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseOut = function(evt){
	if ( !evt || !evt.target ){
		return;
	}
	var objNode = this.resolveInstance(evt.target);

	var mapObject = new MapObject(objNode);
	if ( mapObject && mapObject.szId && mapObject.szId.match(/widget/) ){
		widgetList.onMouseOut(evt);
	}
	__simpleHighlightRemove(evt,objNode);

	if (this.onoverShape ){
		removeInfo(evt,this.onoverShape);
		if (__isChart(evt,this.onoverShape)){
			new MapObject(this.onoverShape).fu.scale(1,1);
		}

	}
	if (this.onoverShape && !_activeItem){
		highLightList.removeItem(this.onoverShape);
		this.onoverShape = null;
		highlightThemeRemove();
	}
	killTooltip();
	killInfo();
};
/**
 * handles <strong>all</strong> 'onclick' events: (activate feature, do legend buttons ...)
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseClick = function(evt){
	var opacity = 1.0;
	if ( !evt || !evt.target ){
		return;
	}

	var objNode = this.resolveInstance(evt.target);
	
	if ( !objNode || (objNode.nodeType != 1) ){
		return;
	}
	var mapObject = new MapObject(objNode);
	if ( objNode != this.ondownShape ){
		return;
	}
	var clickShape = objNode;

	if ( this.fMouseDownMoved > 5){
		this.fMouseDownMoved = 0;
		return;
	}
	// GR 04.06.2007 do link here to get it into a new window
	var aNode = objNode.parentNode;
	if ( aNode.nodeName == "a" ){
		var szRef = aNode.getAttributeNS(szXlink,'href');
		try{
			HTMLWindow.ixmaps.htmlgui_popupWindow(szRef);
			this.stopMouseEvent(evt);
		}
		catch (e){
		}
	}

	var mapObject = new MapObject(objNode);
	if ( mapObject == null ){
		return;
	}
	var clickNode = mapObject.objNode;
	var szId = mapObject.szId;

	// map user interception
	try{
		if ( map.User.onClick(evt,szId) ){
			return null;
		}
	}
	catch (e){
	}
	// HTML interface interception
	try{
		HTMLWindow.ixmaps.htmlgui_onItemClick(szId);
	}
	catch (e){
	}

	//if ( szId && szId.match(/widget/) ){
	if ( szId ){
		if ( widgetList.onClick(evt) ){
			return;
		}
		try	{
			if (szId == "mapbackground:eventrect"){
				HTMLWindow.ixmaps.htmlgui_onSVGPointerIdle();
			}
		}
		catch (e){
		}
	}
	if (map.Legend && map.Legend.legendMouseClick(evt,clickNode)){
		this.stopMouseEvent(evt);
		return;
	}
	else{
		if ( clickNode && clickNode.nodeType == 1 && clickNode.parentNode && clickNode.parentNode.nodeType == 1 ){
			if (map.Legend && map.Legend.legendMouseClick(evt,clickNode.parentNode)){
				return;
			}
			szId = clickNode.parentNode.getAttributeNS(null,"id");
			if (szId && (szId != "PopupGroup") && (!szId.match(/widget/)) && (fActivateInfoOnClick || (szMapToolType == "info") || (szMapToolType == "") || (szMapToolType == "zoomrect") ) ){
				if ( isActiveTheme(map.Layer.getLayerName(szId)) ){
					SVGPopupGroup.fu.clear();
					// fix an info popup to a permanent info bubble
					var fixedInfo = displayInfo(evt,clickShape,"add|fix|pointer");
				}
				else{
					activateTheme(szId.split(':')[0]);
					if (!szMapToolType.match(/select/)){
// GR 25.10.2011						setMapTool("info");
					}
					map.Zoom.cancel();
					this.defaultMouseOver(evt);
					killTooltip();
				}
			}
		}
	}
};
/**
 * handles <strong>all</strong> 'onmousedown' events: (activate layer, execute buttons, ...)
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseDown = function(evt){
	if ( !evt || !evt.target || map.fInitializing ){
		return;
	}
	var objNode = this.resolveInstance(evt.target);

	if ( evt.button == 2 ){
		this.contextMenuObj = objNode;
		this.contextMenuCurrentObj = evt.currentTarget;
		__setContextMenu(evt);
		return;
	}
	if ( evt.button != 0 ){
		return;
	}
	this.fMouseDown = true;
	this.ondownShape = objNode;
	this.fMouseDownMoved = 0;

	var mapObject = new MapObject(objNode);
	if ( mapObject == null ){
		return;
	}
	clickNode = mapObject.objNode;
	var szId = String(mapObject.szId);
	_TRACE("defaultMouseDown on: "+szId);

	// map user interception
	try{
		if ( map.User.onMouseDown(evt,szId) ){
			return null;
		}
	}
	catch (e){
	}

	// GR 11.11.2010 prevent browser to get the event; problems with chrome and text selection
	this.stopMouseEvent(evt);

	widgetList.onMouseDown(evt);

	if ( szId.match(/movabley/) ){
		mouseObject = new MouseObject(evt,clickNode,"yonly");
		return;
	}
	if ( szId.match(/movablex/) ){
		mouseObject = new MouseObject(evt,clickNode,"xonly");
		return;
	}
	if ( szId.match(/movable/) ){
		mouseObject = new MouseObject(evt,clickNode);
		return;
	}
	if ( szId.match(/maptoolnode/) ){
		mapToolList.onMouseDown(evt);
		return;
	}
	if ( szId.match(/widget/) ){
		widgetList.onMouseDown(evt);
		return;
	}
	if ( szId.match(/legend/) ){
		var todoA = szId.split(':');
		if ( todoA.length > 2 ){
			var featureNode = clickNode.ownerDocument.getElementById(todoA[2]);
			if (featureNode){
				if (todoA[1] == 'minus' ){
					setTimeout("__opacityMinus('"+todoA[2]+"')",200);
				}
				if (todoA[1] == 'plus' ){
					setTimeout("__opacityPlus('"+todoA[2]+"')",200);
				}
			}
		}
		return;
	}
	else{
		if (!evt.shiftKey && !evt.altKey && !evt.crtlKey && map.Layer.isMapObject(clickNode) ){
			if (szMapToolType && szMapToolType!=""){
				mapTool = new MapTool(evt,szMapToolType);
			}
		}
		if (evt.shiftKey && !evt.altKey && !evt.crtlKey && map.Layer.isMapObject(clickNode) ){
			if (szMapToolType == ""){
				mapTool = new MapTool(evt,"pan");
			}
			else{
				mapTool = new MapTool(evt,szMapToolType);
			}
		}
		// GR 25.01.2012 allow pan within info, starts on mouse down and move
		if ( fTriggerMouseMoveForPan &&
				!( szId.match(/legend/)	|| 
				szId.match(/tool/)		|| 
				szId.match(/button/)	|| 
				szId.match(/widget/)	|| 
				szId.match(/movable/)	||
				szId.match(/checked/)	||
				szId.match(/unchecked/)	
			) ){
			if ( szMapToolType == "info" || szMapToolType == "" ){
				this.triggerMoveForPan = true;
			}
		}
	}
};
/**
 * handles <strong>all</strong> 'onmouseup' events
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseUp = function(evt){
	if ( !evt || !evt.target || map.fInitializing ){
		return;
	}
	this.stopMouseEvent(evt);
	// map user interception
	try{
		if ( map.User.onMouseUp(evt) ){
			return null;
		}
	}
	catch (e){
	}
	_TRACE("defaultMouseUp: mouseObject:"+mouseObject);
	this.fMouseDown = false;
	if (mouseObject){
		try{
			mouseObject.onMouseUp(evt);
		}
		catch (e){
		}
		mouseObject = null;
	}
	widgetList.onMouseUp(evt);

	this.triggerMoveForPan = false;
};
/**
 * handles <strong>all</strong> 'onmousemove' events: (dragging, tools, ...)
 * @param evt the event handle
 */
Map.Event.prototype.defaultMouseMove = function(evt){
	if ( !evt || !evt.target || map.fInitializing ){
		return;
	}
	var objNode = this.resolveInstance(evt.target);

	// GR 25.01.2012 if trigger active, start pan at this point
	if ( this.triggerMoveForPan && this.fMouseDownMoved ){
		mapTool = new MapTool(evt,"pan");
		this.triggerMoveForPan = false;
	}
	if ( !mouseObject ){
		try	{
			var mapObject = new MapObject(objNode);
			var szId = mapObject.objNode.getAttributeNS(null,"id");
			if ( !( szId.match(/legend/)	|| 
					szId.match(/tool/)		|| 
					szId.match(/button/)	|| 
					szId.match(/widget/)	|| 
					szId.match(/movable/)	||
					szId.match(/checked/)	||
					szId.match(/unchecked/)	
				) ){
				if ( szMapToolType == "idle" || (szId == "mapbackground:eventrect") ){
					HTMLWindow.ixmaps.htmlgui_onSVGPointerIdle();
					return;
				}
			}
		}
		catch (e){
		}
	}

	this.stopMouseEvent(evt);

	if (mouseObject){
		try{
			mouseObject.onMouseMove(evt);
		}
		catch (e){
		}
	}
	if (this.fPanDone){
		this.fPanDone = false;
		this.doDefaultZoom(null);
	}
	this.fMouseDownMoved += this.fMouseDown?1:0;
	widgetList.onMouseMove(evt);
};
/**
 * handles <strong>all</strong> 'onkeydown' events
 * @param evt the event handle
 */
var __fShiftDone = false;
var __szOldMapToolType = null;
Map.Event.prototype.defaultKeyDown = function(evt){
	if ( !evt || __fShiftDone ){
		return;
	}
	// switch map tool on shift key
	if (evt.shiftKey && !evt.altKey && !evt.crtlKey ){
		__szOldMapToolType = szMapToolType;
		if (szMapToolType == "pan"){
			setMapTool("zoomrect");
		}
		else
		if (szMapToolType == "zoomrect"){
			setMapTool("pan");
		}
		else
		if (szMapToolType == "info"){
			setMapTool("pan");
		}
		__fShiftDone = true;
	}
};
/**
 * handles <strong>all</strong> 'onkeyup' events
 * @param evt the event handle
 */
Map.Event.prototype.defaultKeyUp = function(evt){
	if ( !evt || !__fShiftDone ){
		return;
	}
	// reset map tool on release shift key
	if (!evt.shiftKey && !evt.altKey && !evt.crtlKey ){
		setMapTool(__szOldMapToolType);
		__fShiftDone = false;
	}
};
/**
 * called to adapt the map zoom and pan on various events
 * @param evt the event
 */
Map.Event.prototype.doDefaultZoom = function(evt){

	if ( fFroozeDynamicContent ){
		return;
	}
	
	SVGNotifyGroup.fu.clear();

	map.showMap();

	_TRACE("@ default zoom -->");

	var viewBox     = SVGRootElement.getAttribute('viewBox').split(' ');
	var origViewBox = SVGOrigViewBoxString.split(' ');
	var viewBoxScale = Number(origViewBox[2])/Number(viewBox[2]); 

	var newZoomScale = 1/1/viewBoxScale;

	var zoomNode = map.Scale.zoomNode;
	if (zoomNode){
		var zoomMatrixA = getMatrix(zoomNode);
		newZoomScale = newZoomScale/(zoomMatrixA[0]);
	}

	map.Scale.oldZoomScale = map.Scale.nZoomScale;
	map.Scale.oldMapCenter = map.Scale.mapCenter;

	if (map.Scale.nZoomScale != newZoomScale){
		map.Dom.clearGroup(SVGToolsGroup);
		map.Dom.clearGroup(SVGFixedGroup);
		map.removeAllHighlights();
	}

	// set the new zoom an pan
	map.Scale.nZoomScale = newZoomScale;
	map.Scale.mapCenter = new point(zoomMatrixA[4],zoomMatrixA[5]);

	if ( fPanByViewer == false ) {
		if( SVGRootElement.currentTranslate.x != 0 || 
			SVGRootElement.currentTranslate.y != 0 ) {
			zoomNode = map.Scale.zoomNode;
			var zoomMatrixA = getMatrix(zoomNode);
			var nZoomX = zoomMatrixA[0];
			var nZoomY = zoomMatrixA[3];

			// GR 15.11.2007 respect canvas rotation  
			var pRotated = map.Scale.rotatePoint(SVGRootElement.currentTranslate);
			SVGRootElement.currentTranslate.x = pRotated.x;
			SVGRootElement.currentTranslate.y = pRotated.y;

			var newX  = zoomMatrixA[4] + map.Scale.scaleX(SVGRootElement.currentTranslate.x);
			var newY  = zoomMatrixA[5] + map.Scale.scaleY(SVGRootElement.currentTranslate.y);

			zoomNode.setAttributeNS(null,"transform","matrix("+nZoomX+" 0 0 "+nZoomY+" "+newX+" "+newY+")");
			map.Scale.mapCenter = new point(newX,newY);

			SVGRootElement.currentTranslate.x = 0;
			SVGRootElement.currentTranslate.y = 0;
		}
	}
	else {
		var clipRect = SVGDocument.getElementById("mapcliprect");
		if (clipRect){
			clipRect.setAttributeNS(null,"x",map.Scale.scaleX(-SVGRootElement.currentTranslate.x));
			clipRect.setAttributeNS(null,"y",map.Scale.scaleY(-SVGRootElement.currentTranslate.y));
			clipRect.setAttributeNS(null,"width",map.Scale.scaleX(map.Scale.getEmbedWidth()));
			clipRect.setAttributeNS(null,"height",map.Scale.scaleX(map.Scale.getEmbedHeight()));
		}

		var eventRect = SVGDocument.getElementById("mapbackground:eventrect");
		if (eventRect){
			eventRect.setAttributeNS(null,"x",map.Scale.scaleX(-SVGRootElement.currentTranslate.x));
			eventRect.setAttributeNS(null,"y",map.Scale.scaleY(-SVGRootElement.currentTranslate.y));
			eventRect.setAttributeNS(null,"width",map.Scale.scaleX(map.Scale.getEmbedWidth()));
			eventRect.setAttributeNS(null,"height",map.Scale.scaleX(map.Scale.getEmbedHeight()));
		}
	}

	if (evt){
		antiZoomAndPanList.adjustGroups(evt);
	}

	// if zoom changed, change feature scaling
	// -----------------------------------------------
	if ( Math.abs(map.Scale.oldZoomScale-map.Scale.nZoomScale) > (map.Scale.oldZoomScale/100) ){
		_TRACE("--- zoom changed --- ("+map.Scale.oldZoomScale+" != "+map.Scale.nZoomScale+") !");
		if (fFeatureScaling == "delayed" ){
			setTimeout("map.Layer.changeFeatureScaling(null,'"+map.Scale.nZoomScale+"')",1000);
		}
		else{
			map.Layer.changeFeatureScaling(evt,map.Scale.nZoomScale);
		}
		if ( (map.Scale.oldZoomScale > map.Scale.nZoomScale) && (fDynamicLayer == "delayed") ){
			setTimeout("map.Layer.switchScaleDependentLayer(null)",500);
		}
		else{
			map.Layer.switchScaleDependentLayer(evt);
		}
		displayScale(evt);
	}
	// if not, may be, we must do some scaling on tiles, that had been outside
	// -----------------------------------------------------------------------
	else{
		if ( (fDynamicTiles == "delayed") ){
			setTimeout("map.Layer.doStoredFeatureScaling()",500);
		}
		else{
			map.Layer.doStoredFeatureScaling(evt);
		}
	}

	// switch tiles in any case
	// -----------------------------------------------
	if ( (fDynamicTiles == "delayed") ){
		setTimeout("map.Tiles.switchScaleDependentTiles(null)",500);
	}
	else{
		map.Tiles.switchScaleDependentTiles(evt);
	}

	// if zoom or panning changed, adapt dynamic label 
	//
	// GR 17.03.2017 if pan is very little, don't actualize
	// -----------------------------------------------
	if (map.Scale.oldZoomScale != map.Scale.nZoomScale		||
		Math.abs(map.Scale.oldMapCenter.x - map.Scale.mapCenter.x) > 10	||
		Math.abs(map.Scale.oldMapCenter.y - map.Scale.mapCenter.y) > 10	){

		try{
			// inform user about zoom and pan change
			HTMLWindow.ixmaps.htmlgui_onZoomAndPan(map.Scale.nZoomScale);
		}
		catch (e){
		}

		if ( (fDynamicTiles == "delayed") || (fDynamicLayer == "delayed") ){
			setTimeout("map.Layer.adaptLabel()",500);
		}
		else{
			setTimeout("map.Layer.adaptLabel()",10);
		}
		// GR 29.11.2007 now here
		try{
			// GR 17.03.2017 if only pan, actualize with timeout, so give time to show charts before actualizing
			if ( (map.Scale.oldZoomScale != map.Scale.nZoomScale) ){
				map.Themes.actualizeActiveTheme(map.Scale.oldZoomScale / map.Scale.nZoomScale);
			}else{
				setTimeout("map.Themes.actualizeActiveTheme("+map.Scale.oldZoomScale / map.Scale.nZoomScale+")",10);
			}
			//map.Themes.actualizeActiveTheme(map.Scale.oldZoomScale / map.Scale.nZoomScale);
		}
		catch (e){
		}
		try{
			// set actul zoom and pan in html interface ( 1:xxx )
			HTMLWindow.ixmaps.htmlgui_setScaleSelect(String(__formatValue(Math.floor(map.Scale.getTrueMapScale()*map.Scale.nZoomScale)),0,"BLANK"));
		}
		catch (e){
		}
	}

	zoomAndPanHistory.newItem();

	map.Zoom.actualizeOverviewMap(evt);

	map.Scale.refreshCSSStyles();


	_TRACE("@ default zoom done: "+1/map.Scale.nZoomScale);
};
/**
 * called to adapt the map zoom and pan on various events
 * @param evt the event
 */
Map.Event.prototype.doPrintZoom = function(evt){

	_TRACE("@ print zoom -->");

	map.Scale.nZoomScale /= 5;

	// if zoom changed, change feature scaling
	// -----------------------------------------------
	if (map.Scale.oldZoomScale != map.Scale.nZoomScale){
		_TRACE("--- zoom changed --- !");
		if (fFeatureScaling == "delayed" ){
			setTimeout("map.Layer.changeFeatureScaling(null,'"+map.Scale.nZoomScale+"')",1000);
		}
		else{
			map.Layer.changeFeatureScaling(evt,map.Scale.nZoomScale);
		}
		if ( (map.Scale.oldZoomScale > map.Scale.nZoomScale) && (fDynamicLayer == "delayed") ){
			setTimeout("map.Layer.switchScaleDependentLayer(null)",500);
		}
		else{
			map.Layer.switchScaleDependentLayer(evt);
		}
		displayScale(evt);
	}
	// if not, may be, we must do some scaling on tiles, that had been outside
	// -----------------------------------------------------------------------
	else{
		if ( (fDynamicTiles == "delayed") ){
			setTimeout("map.Layer.doStoredFeatureScaling()",500);
		}
		else{
			map.Layer.doStoredFeatureScaling(evt);
		}
	}

	// switch tiles in any case
	// -----------------------------------------------
	if ( (fDynamicTiles == "delayed") ){
		setTimeout("map.Tiles.switchScaleDependentTiles(null)",500);
	}
	else{
		map.Tiles.switchScaleDependentTiles(evt);
	}

	// if zoom or panning changed, adapt dynamic label 
	// -----------------------------------------------
	if (map.Scale.oldZoomScale != map.Scale.nZoomScale		||
		map.Scale.oldMapCenter.x != map.Scale.mapCenter.x	||
		map.Scale.oldMapCenter.y != map.Scale.mapCenter.y	){
		if ( (fDynamicTiles == "delayed") || (fDynamicLayer == "delayed") ){
			setTimeout("map.Layer.adaptLabel()",500);
		}
		else{
			setTimeout("map.Layer.adaptLabel()",10);
		}
		// GR 29.11.2007 now here
		try{
			map.Themes.actualizeActiveTheme(map.Scale.oldZoomScale / map.Scale.nZoomScale);
		}
		catch (e){
		}
	}

	try{
		// set actul zoom and pan in html interface ( 1:xxx )
		HTMLWindow.ixmaps.htmlgui_setScaleSelect(String(__formatValue(Math.floor(map.Scale.getTrueMapScale()*map.Scale.nZoomScale)),0,"BLANK"));
		// report actual envelope 
		HTMLWindow.ixmaps.htmlgui_setCurrentEnvelope(map.Zoom.getEnvelopeString(),(map.Scale.oldZoomScale != map.Scale.nZoomScale));
	}
	catch (e){
	}

	map.Scale.refreshCSSStyles();

	_TRACE("@ print zoom done: "+1/map.Scale.nZoomScale);
};

// .............................................................................
// viewer events              
// .............................................................................

/**
 * called on 'SVGResize'
 * @param evt the event
 */
Map.Event.prototype.doDefaultResize = function(evt){
	if ( map && map.Layer ){
		map.Layer.switchScaleDependentLayer(evt);
		displayScale(evt);
	}
};
/**
 * called on 'SVGScroll'
 * @param evt the event
 */
Map.Event.prototype.doDefaultPan = function(evt){
	if (evt && !mouseObject){
		antiZoomAndPanList.adjustGroups(evt);
		// intentionally map.Event.fPanDone and not this.fPanDone 
		map.Event.fPanDone = true;
	}
};
/**
 * called by defaultMouseMove to execute panning
 * @param evt the event
 */
Map.Event.prototype.doDefaultAdjustPan = function(evt){
	if (this.fPanDone){
		this.fPanDone = false;
		this.doDefaultZoom(null);
	}
};
/**
 * moves the event target to the top of all its siblings
 * @param evt the event
 */
Map.Event.prototype.moveToFrontOfGroup = function(evt){
	if (evt && evt.currentTarget && evt.currentTarget.parentNode){
		if ( evt.currentTarget != evt.currentTarget.parentNode.lastChild ){
			evt.currentTarget.parentNode.appendChild(evt.currentTarget);
		}
	}
};
// .............................................................................
// .............................................................................
// zoom and pan history     
// .............................................................................

/**
 * Create a new History instance.  
 * @class It holds an array of the past zoom and pan envelopes ( envelope format is the same as for bookmarks )
 * @constructor
 * @throws 
 * @return A new History
 */
function History(){
	/** array to hold all created {@link HistoryItem} objects @type array */
	this.itemA = new Array(0);
	/** pointer to the actual history entry @type int */
	this.historyPointer = 0;
	/** flag to avoid history entry dubbles @type boolean */
	this.fSuspend = false;
	this.newItem();
}
/**
 * add one history entry 
 * @param {HistoryItem} newItem the history item to add
 */
History.prototype.add = function(newItem){
	this.historyPointer = this.itemA.length;
	this.itemA[this.itemA.length] = newItem;
};
/**
 * add one history entry 
 */
History.prototype.newItem = function(){
	if ( this.fSuspend ){
		this.fSuspend = false;
		return;
	}
	this.add(new HistoryItem());
};
/**
 * go back one history entry 
 */
History.prototype.backwards = function(){
	if ( this.historyPointer > 0 ){
		this.fSuspend = true;
		this.itemA.length = this.historyPointer;
		this.historyPointer--;
		this.itemA[this.historyPointer].exec();
	}
};
/**
 * go foreward one history entry 
 */
History.prototype.forwards = function(){
	if ( this.historyPointer <  this.itemA.length-1 ){
		this.fSuspend = true;
		this.historyPointer++;
		this.itemA[this.historyPointer].exec();
	}
};
/**
 * clears the history 
 */
History.prototype.clear = function(){
	this.itemA.length = 0;
};

/**
 * Create a new HistoryItem instance.  
 * @class It realizes one zoom and pan history item with the actual envelope
 * @constructor
 * @throws 
 * @return A new HistoryItem that preserves the actual envelope (zoom and pan rect) 
 */
function HistoryItem(){
	try{
		/** holds a string with the historical zoom and pan rect (defined in map coordinates) @type string */
		this.szEnvelope = map.Zoom.getEnvelopeString();
	}
	catch (e){
	}
}
/**
 * execute history entry; reinstall the recorded envelope  
 */
HistoryItem.prototype.exec = function(){
	try{
		var szMapEnvelopeA = this.szEnvelope.split('=');
		var minBoundX = szMapEnvelopeA[1].split("'")[1];
		var maxBoundX = szMapEnvelopeA[2].split("'")[1];
		var minBoundY = szMapEnvelopeA[3].split("'")[1];
		var maxBoundY = szMapEnvelopeA[4].split("'")[1];
		map.Zoom.doZoomMapToEnvelope(minBoundX,maxBoundX,minBoundY,maxBoundY);
	}
	catch (e){
		alert("History Item not valid");
	}
};

/**
 * Create a new InfoContainer instance.  
 * @class It realizes a info container with scrollable workspace, shadow, pointer, buttons etc
 * @constructor
 * @throws 
 * @return A new MapTool
 * @param targetDocument the SVG document
 * @param targetGroup the SVG group where to create the info contatier
 * @param szInfoId the unique id for the new info contatier node
 * @param ptPosition the map position to show the info
 * @param ptOffset an offset to the given position
 * @param szMode the type of container
 * The following types can be set:
 * <br><br>
 *  <table>
 *  <tr><td>pointer</td><td>create a pointing edge to the given position (ptPosition)</td></tr>
 *  <tr><td>fix</td><td>create delete button</td></tr>
 *  </table>
 * <br>
 * types can be combined by '|', e.g. 'pointer|fix'
 */
InfoContainer = function(targetDocument,targetGroup,szInfoId,ptPosition,ptOffset,szMode,szTitle) {
	if ( targetGroup && szInfoId && szInfoId.length > 2 ){
		/** the unique id of the info container */ 
		this.szId = szInfoId+":movable";
		/** the root node of the info container */ 
		this.objectNode = map.Dom.newGroup(targetGroup,this.szId);
		/** the position, where to create the container */ 
		this.ptPosition = ptPosition;
		/** the offset relative to the position */ 
		this.ptOffsetOrig = new point(ptOffset.x,ptOffset.y);
		/** the offset relative to the position */ 
		this.ptOffset = ptOffset;
		/** the mode (type) of the container */
		this.szMode = szMode;
		/** the title of the container */
		this.szTitle = szTitle;
		/** the fontheight (for title ...)*/
		this.nFontheight = 14;
		/** function to call on delete container */
		this.onRemove = "";
		/** clip the container, creating scrollbars, if necessary */
		this.fClipped = true;
		this.create();
	}
};
/**
 * create the info container
 */
InfoContainer.prototype.create = function(){
	var objectwidth  = 10;
	var objectheight = 10;
	var margin = 10;
	var scrollBarWidth = 10;

	if ( !this.ptPosition ){
		this.ptPosition = new point(1000,1000);
	}
	if ( !this.ptOffset ){
		this.ptOffset = new point(100,100);
	}
	if ( !this.szMode ){
		this.szMode="";
	}
	if ( this.szMode.match(/left/) ) {
		this.ptOffset.x = -(this.ptOffset.x*2);
		this.ptOffset.y = (this.ptOffset.y*3);
	}
	if(0 && fObjectPseudoShadow){
		this.shadowNode = map.Dom.newShape('rect',this.objectNode,map.Scale.normalX(2),map.Scale.normalY(2),map.Scale.normalX(objectwidth),map.Scale.normalY(objectheight),"fill:#666666;stroke:#888888;opacity:0.6");
		this.shadowNode.setAttributeNS(null,"rx",map.Scale.normalX(nInfoRoundRect));
		this.shadowNode.setAttributeNS(null,"ry",map.Scale.normalX(nInfoRoundRect));
	}
 	// create background  
	this.frameNode = map.Dom.newShape('rect',this.objectNode,0,0,map.Scale.normalX(objectwidth),map.Scale.normalY(objectheight),"fill:#ffffff;stroke:black;stroke-width:"+map.Scale.normalX(0)+"");
	this.frameNode.setAttributeNS(null,"rx",map.Scale.normalX(nInfoRoundRect*2));
	this.frameNode.setAttributeNS(null,"ry",map.Scale.normalX(nInfoRoundRect*2));
 	// create shadow  
	if ( SVGDocument.getElementById(szShadowFilterToolsId) ){
		this.frameNode.style.setProperty("filter","url(#"+szShadowFilterToolsId+")","");
	}

	this.canvasNode = map.Dom.newGroup(this.objectNode,this.szId+":canvas");
	this.canvasNode.fu.setPosition(map.Scale.normalX(1),map.Scale.normalY(1));

	this.titleNode = map.Dom.newGroup(this.objectNode,this.szId+":title");
	this.titleTextNode = map.Dom.newGroup(this.titleNode,this.szId+":titletext");
	if ( this.szTitle ){
		map.Dom.newText(this.titleTextNode,map.Scale.normalX(objectwidth),map.Scale.normalY(this.nFontheight+margin),"font-family:arial;font-size:"+map.Scale.normalY(this.nFontheight/4*3)+"px;fill:black;pointer-events:none",this.szTitle);
	}

	this.scrollObj = new ScrollArea(null,this.canvasNode,null,objectwidth,objectheight,scrollBarWidth);
	if ( this.scrollObj ){
		this.scrollObj.reformat();
		this.workspaceNode = this.scrollObj.workspaceNode;
	}
	// if ScrollArea went wrong, create workspace explicit 
	if ( !this.workspaceNode ){
		this.scrollObj = null;
		this.workspaceNode = map.Dom.newGroup(this.canvasNode,this.szId+":workspace");
		this.workspaceClipRect = map.Dom.setClipRect(this.workspaceNode,new box(0,0,objectwidth,objectheight));
	}
	this.objectNode.setAttributeNS(null,"onclick","map.Event.moveToFrontOfGroup(evt)");

	// create the buttons
	if ( this.szMode.match(/fix/) ){
		this.deleteButton = new Button(this.titleNode,this.szId,"BUTTON",'#delete_button'
								,"map.Dom.removeElementById('"+this.szId+"');"
								,"remove");
		this.deleteButton.scale(1,1);
		this.deleteButton.setPosition(map.Scale.normalX(objectwidth),map.Scale.normalY(10));
	}
	else
	if ( this.szMode.match(/pin/) ){
		var pinButton = SVGDocument.getElementById("pin_button");
		if ( pinButton ){
			this.pinButton = new Button(this.titleNode,this.szId,"BUTTON",'#pin_button'
									,"doDisplayInfo("+this.ptPosition.x+","+this.ptPosition.y+",'pointer|fix');"
									,""
									,"fix it");
			this.pinButton.scale(1,1);
			this.pinButton.setPosition(map.Scale.normalX(objectwidth),map.Scale.normalY(10));
		}
	}
	this.widgetObj = new Widget(this.objectNode,this);
};
/**
 * set the info container title
 * @param szTitle the title to be displayed
 */
InfoContainer.prototype.setTitle = function(szTitle,tStyle){
	if ( !tStyle ){
		tStyle = map.Scale.tStyle.ContainerTitle;
	}
	map.Dom.clearGroup(this.titleTextNode);
	this.szTitle = szTitle;
	if ( this.szTitle ){
		map.Dom.newText(this.titleTextNode,map.Scale.normalX(10),tStyle.nFontHeight*1.3,tStyle.szStyle,this.szTitle);
	}
	this.reformat();
};
/**
 * reformat the info container
 * <br>this will resize the container (with maximal size checked), evtl.create scrollbars, and correct the position  
 */
InfoContainer.prototype.reformat = function(){
	var nFontHeight = 5;
	this.bBox = map.Dom.getBox(this.workspaceNode);
	this.tBox = map.Dom.getBox(this.titleTextNode);
	if (this.bBox.height<0 ){
		this.bBox.height = 0;
	}
	if (this.bBox.width<0 ){
		this.bBox.width = 0;
	}
	if (this.tBox.height<0){
		this.tBox.height = 0;
	}
	if ( (this.bBox.width == 0 || this.bBox.height == 0) && ( !this.szTitle || !this.szTitle.length ) ){
		this.remove();	
		return;
	}
	if (this.bBox.height == 1){
		this.bBox.height = -200;
	}

	var nButtonX = map.Scale.normalX(15+map.Scale.nButtonSize);
	if ( this.fClipped){
		var clippedWidth  = Math.min(Math.max(this.bBox.width+nButtonX,this.tBox.width+nButtonX),map.Scale.bBox.width/2);
		var clippedHeight = Math.min(this.bBox.height+this.tBox.height,map.Scale.bBox.height/2.4);
	}
	else{
		var clippedWidth  = Math.max(this.bBox.width+nButtonX,this.tBox.width+nButtonX);
		var clippedHeight = this.bBox.y+this.bBox.height+this.tBox.height+map.Scale.normalY(10);
	}
	if (clippedHeight > map.Scale.bBox.height/4*5 ){
		clippedWidth  = Math.min(this.bBox.width+map.Scale.normalX(10)+map.Scale.normalY(10),map.Scale.bBox.width/2.4);
	}
	if (clippedWidth > map.Scale.bBox.width/4*5 ){
		clippedHeight = Math.min(this.bBox.height+this.tBox.height+map.Scale.normalY(10),map.Scale.bBox.height/2.4);
	}

	if ( this.scrollObj ){
		this.scrollObj.setWidth(clippedWidth/map.Scale.normalX(1)-1);
		this.scrollObj.setHeight(clippedHeight/map.Scale.normalY(1));
		this.scrollObj.reformat();
		if ( this.scrollObj.hasScrollBars() ){
			if ( clippedHeight < (this.bBox.height+map.Scale.normalX(this.scrollObj.nScrollBarWidth)) ){
				this.scrollObj.setHeight(clippedHeight/map.Scale.normalY(1)+this.scrollObj.nScrollBarWidth+6);
				this.scrollObj.reformat();
				clippedHeight += map.Scale.normalY(this.scrollObj.nScrollBarWidth+1);
			}
			this.canvasNode.fu.setPosition(map.Scale.normalX(5),map.Scale.normalY(8)+this.tBox.height);
			clippedWidth += map.Scale.normalX(10)+map.Scale.normalX(7);
			clippedHeight += map.Scale.normalY(2)+map.Scale.normalY(10)+map.Scale.normalY(5)+this.tBox.height*2;
		}
		else { 
			this.canvasNode.fu.setPosition(map.Scale.normalX(5),map.Scale.normalY(10)+this.tBox.height*1.3);
			clippedHeight += map.Scale.normalY(10)+this.tBox.height-map.Scale.normalY(7);
		}
	}
	else{
		this.workspaceClipRect.setAttributeNS(null,"width",clippedWidth);
		this.workspaceClipRect.setAttributeNS(null,"height",clippedHeight);
	}

	var	tStyle = map.Scale.tStyle.ContainerTitle;
	var yPos = map.Scale.normalY(map.Scale.nButtonSize/3) + tStyle.nFontHeight/2;
	var xPos = map.Scale.normalY(map.Scale.nButtonSize/3);
	if ( this.pinButton ){
		this.pinButton.setPosition(clippedWidth-xPos,yPos);
	}else
	if ( this.deleteButton ){
		this.deleteButton.setPosition(clippedWidth-xPos,yPos);
	}else{
		clippedWidth -= map.Scale.normalX(map.Scale.nButtonSize);
	}
	this.bBox.width  = clippedWidth;
	this.bBox.height = clippedHeight;
	if ( this.frameNode){
		this.frameNode.setAttributeNS(null,"width",this.bBox.width+map.Scale.normalX(nFontHeight)*2);
		this.frameNode.setAttributeNS(null,"height",this.bBox.height+map.Scale.normalX(nFontHeight));
	}
	if ( this.shadowNode){
		this.shadowNode.setAttributeNS(null,"width",this.bBox.width+map.Scale.normalX(nFontHeight)*2+map.Scale.normalX(0.5));
		this.shadowNode.setAttributeNS(null,"height",this.bBox.height+map.Scale.normalX(nFontHeight)+map.Scale.normalY(1));
	}

	var gOffset = map.Scale.getGroupOffset(this.objectNode);
	this.newPosition = map.Scale.clipWidgetObjectToSVG(this.objectNode,new point(this.ptPosition.x+gOffset.x,this.ptPosition.y+gOffset.y),this.ptOffsetOrig,this.bBox);
	this.newPosition.x -= gOffset.x;
	this.newPosition.y -= gOffset.y;
	this.objectNode.fu.setPosition(this.newPosition.x,this.newPosition.y);

	this.ptOffset.x = this.newPosition.x - this.ptPosition.x;
	this.ptOffset.y = this.newPosition.y - this.ptPosition.y;

	if (this.szMode.match(/pointer/)){
		this.makePointer();
	}
};
/**
 * create the pointing edge from offset to position
 */
InfoContainer.prototype.makePointer = function(){

	var newPath = null;
	var bBox = this.bBox;

	var pHeight = this.ptOffset.y;
	var pWidth  = map.Scale.normalX(15);
	var pSize   = map.Scale.normalX(10);
	var pXoff   = map.Scale.normalX(5);
	var xPos	= -this.ptOffset.x;
	var yPos	= 0;

	if ( this.pointerObj ){
		map.Dom.clearGroup(this.pointerObj);
		map.Dom.clearGroup(this.pointShObj);
	}
	else{
		this.pointerObj = map.Dom.newGroup(this.objectNode);
		this.pointShObj = map.Dom.newGroup(this.objectNode);
		this.pointShObj.parentNode.insertBefore(this.pointShObj,this.pointShObj.parentNode.firstChild);
	}

	if ( ((this.ptOffset.y < 0) && (this.ptOffset.y > -this.bBox.height)) &&
		 ((this.ptOffset.x < 0) && (this.ptOffset.x > -this.bBox.width ))  ){
		return;
	}

	xPos = this.bBox.width/2;
	yPos = this.bBox.height/2;

	pHeight = this.ptOffset.y+this.bBox.height/2;
	pWidth  = this.ptOffset.x+this.bBox.width/2;

	if ( (Math.abs(pHeight)+this.bBox.width/2-this.bBox.height/2 > Math.abs(pWidth))  ){
		/** old dynamic pointer
		if ( this.bBox.width/3 > pSize ){
			if ( this.ptOffset.x > -this.bBox.width/3 ){
				pWidth -= this.bBox.width/3;
			}
			if ( this.ptOffset.x < -this.bBox.width/3*2 ){
				pWidth += this.bBox.width/3;
			}
		}
		**/
		// GR 22.09.2015 new dynamic pointer
		pWidth  = 0;
		if ( this.ptOffset.x > -pSize*2 ){
			pWidth = this.ptOffset.x+pSize*2;
		}
		if ( this.ptOffset.x < -this.bBox.width+pSize*2 ){
			pWidth = this.ptOffset.x+this.bBox.width-pSize*2;
		}
		if ( pHeight > 0 ){
			newPath = map.Dom.newShape('path',this.pointShObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(pWidth-map.Scale.normalX(8.5))+','+(this.ptOffset.y+map.Scale.normalX(1))+' '+map.Scale.normalX(20)+',0 z','fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path',this.pointerObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(pWidth-map.Scale.normalX(7.5))+','+(this.ptOffset.y+map.Scale.normalX(1))+' '+map.Scale.normalX(15)+',0 z','fill:white');
		}
		else{
			newPath = map.Dom.newShape('path',this.pointShObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(pWidth-map.Scale.normalX(8.5))+','+(this.ptOffset.y+this.bBox.height-map.Scale.normalX(1))+' '+map.Scale.normalX(20)+',0 z','fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path',this.pointerObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(pWidth-map.Scale.normalX(7.5))+','+(this.ptOffset.y+this.bBox.height-map.Scale.normalX(1))+' '+map.Scale.normalX(15)+',0 z','fill:white');
		}
	}
	else {
		/** old dynamic pointer
		if ( this.bBox.height/5 > pSize ){
			if ( this.ptOffset.y > -this.bBox.height/3 ){
				pHeight -= this.bBox.height/3;
			}
			if ( this.ptOffset.y < -this.bBox.height/3*2 ){
				pHeight += this.bBox.height/3;
			}
		}
		**/
		// GR 22.09.2015 new dynamic pointer
		pHeight = 0;
		if ( this.ptOffset.y > -pSize*2 ){
			pHeight = this.ptOffset.y+pSize*2;
		}
		if ( this.ptOffset.y < -this.bBox.height+pSize*2 ){
			pHeight = this.ptOffset.y+this.bBox.height-pSize*2;
		}
		if ( pWidth > 0 ){
			newPath = map.Dom.newShape('path',this.pointShObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(this.ptOffset.x+map.Scale.normalX(1))+','+(pHeight-map.Scale.normalX(8.5))+' 0,'+map.Scale.normalX(20)+' z','fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path',this.pointerObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(this.ptOffset.x+map.Scale.normalX(1))+','+(pHeight-map.Scale.normalX(7.5))+' 0,'+map.Scale.normalX(15)+' z','fill:white');
		}
	else{
			newPath = map.Dom.newShape('path',this.pointShObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(this.ptOffset.x+this.bBox.width+map.Scale.normalX(1))+','+(pHeight-map.Scale.normalX(8.5))+' 0,'+map.Scale.normalX(20)+' z','fill:black;fill-opacity:0.5');
			newPath = map.Dom.newShape('path',this.pointerObj,'M'+(-this.ptOffset.x)+','+(-this.ptOffset.y)+' l '+(this.ptOffset.x+this.bBox.width+map.Scale.normalX(1))+','+(pHeight-map.Scale.normalX(7.5))+' 0,'+map.Scale.normalX(15)+' z','fill:white');
		}
	}
};
/**
 * on info container move
 */
InfoContainer.prototype.onMouseMove = function(){
	if ( !this.fMouseDown ){
		return;
	}
	var ptActualPosition = this.objectNode.fu.getPosition();
	this.ptOffset.x += ptActualPosition.x-this.beforeMovePosition.x;
	this.ptOffset.y += ptActualPosition.y-this.beforeMovePosition.y;
	this.beforeMovePosition = this.objectNode.fu.getPosition();
	if (this.szMode.match(/pointer/)){
		this.makePointer();
	}
};
/**
 * on info container mouse up
 */
InfoContainer.prototype.onMouseUp = function(){
	var ptActualPosition = this.objectNode.fu.getPosition();
	this.ptOffset.x += ptActualPosition.x-this.beforeMovePosition.x;
	this.ptOffset.y += ptActualPosition.y-this.beforeMovePosition.y;
	this.fMouseDown = false;
	if (this.szMode.match(/pointer/)){
		this.makePointer();
	}
};
/**
 * on info container mouse down
 */
InfoContainer.prototype.onMouseDown = function(){
	this.beforeMovePosition = this.objectNode.fu.getPosition();
	this.fMouseDown = true;
};
/**
 * set onRemove container
 */
InfoContainer.prototype.setOnRemove = function(szAction){
	if ( this.deleteButton && this.deleteButton.buttonNode ){
		this.deleteButton.setActionOn("map.Dom.removeElementById('"+this.szId+"');"+szAction);
	}
};
/**
 * remove container
 */
InfoContainer.prototype.remove = function(){
	this.objectNode.parentNode.removeChild(this.objectNode);
	this.objectNode = null;
};
/**
 * clear container content
 */
InfoContainer.prototype.clear = function(){
	map.Dom.clearGroup(	this.workspaceNode);
};

// =============================================================================
// G U I   P R I M I T I V E S      
// =============================================================================

// .............................................................................
// mouse Object (moves with the mouse)      
// .............................................................................

/**
 * Create a new MouseObject instance.  
 * @class It realizes the moving of an object accross the canvas
 * <br>This is the only way to do dragging !
 * @constructor
 * @throws 
 * @return A new MouseObject
 */
MouseObject = function(evt,objNode,szFlag,pNode) {
	if (objNode){
		/** the target node of the object @type DOM node */
		this.objNode = objNode;
		this.objNode.fu = new Methods(this.objNode);
		/** the start position of the object @type point */
		this.objStartPosition = this.objNode.fu.getPosition(); 
		/** flags to control dragging @type string */
		this.szFlag = szFlag?szFlag:"";
		/** the parent of the generated mouse object; will be notified on events  */
		this.parent = pNode;
	}
	/** the position of the mouse at creation of the mouse object @type point */
	if (evt){
		this.mouseStartPosition = map.Scale.getClientMousePosition(evt,this.objNode);
	}
	else{
		this.mouseStartPosition = new point(0,0);
	}
};
/**
 * move the mouse object 
 */
MouseObject.prototype.onMouseMove = function(evt){
	var newMousePosition = map.Scale.getClientMousePosition(evt,this.objNode);
	// map user interception
	try{
		if ( map.User.onMouseMove(evt,this.objNode.getAttributeNS(null,"id"),newMousePosition) ){
			return null;
		}
	}
	catch (e){
	}
	switch (this.szFlag){
		case "yonly":
			newMousePosition.x = this.mouseStartPosition.x;	break;	
		case "xonly":
			newMousePosition.y = this.mouseStartPosition.y;	break;
	}
	if (this.objNode && (!(this.szFlag.match(/parentonly/))) ){
		var ptScale = this.objNode.fu.getScale();
		this.objNode.fu.setPosition(this.objStartPosition.x+(newMousePosition.x-this.mouseStartPosition.x)/ptScale.x,this.objStartPosition.y+(newMousePosition.y-this.mouseStartPosition.y)/ptScale.y);
	}
	if (this.parent){
		this.parent.onMouseMove(evt);
	}
};
/**
 * handle onmouseup event on the mouse object 
 */
MouseObject.prototype.onMouseUp = function(evt){
	if (this.parent){
		this.parent.onMouseUp(evt);
	}
};

// .............................................................................
// button checkbox       
// .............................................................................

/**
 * Create a new Button instance.  
 * @class It realizes the creation and animation of buttons
 * @constructor
 * @param targetGroup append the button to this group
 * @param szId user given id, if null, id is generated
 * @param szType defines the button type (see Field details)
 * @param szStyle defines additional features (depending on szType)
 * @param szActionOn javascript to evaluate on click
 * @param szActionOff (only checkboxes) to evaluate on checkbox off
 * @param szTooltip defines an additional tooltip for the button
 * @throws 
 * @return A new Button object
 */
Button = function(targetGroup,szId,szType,szStyle,szActionOn,szActionOff,szTooltip){
	/** where to create the button @type DOM node */
	this.targetGroup = targetGroup;
	/** the unique id of the button (created automatically) @type string */
	this.szId = szId?szId:"button:"+String(Math.random());
	/** the type of the button ('BUTTON','CHECKBOX','TEXTBUTTON','TEXTBUTTON|SELECTED','TEXTBUTTON|BUTTON'). 
	 *  <br><br>
	 *  <table>
	 *  <tr><td><em>szType</em></td><td><em></em></td></tr>
	 *  <tr><td>'BUTTON'</td><td>a button defined by a symbol given in the parameter szType</td></tr>
	 *  <tr><td>'CHECKBOX'</td><td>a generic checkbox</td></tr>
	 *  <tr><td>'TEXTBUTTON'</td><td>an arbitrary text to act as button (link like)</td></tr>
	 *  <tr><td>'TEXTBUTTON|SELECTED'</td><td>an arbitrary text which gets a frame to demonstrate the selection</td></tr>
	 *  <tr><td>'TEXTBUTTON|BUTTON'</td><td>an arbitrary text which gets a frame</td></tr>
	 *  </table>
	 * @type string 
	*/
	this.szType = szType?szType:"SIMPLE";
	/** the style of the button (usage depends on szType).
	 *  <br><br>
	 *  <table>
	 *  <tr><td><em>szType</em></td><td><em>szStyle defines</em></td></tr>
	 *  <tr><td>'BUTTON'</td><td>the symbol name for the button (#symbol)</td></tr>
	 *  <tr><td>'TEXTBUTTON'</td><td>an arbitrary text to be displayed as button</td></tr>
	 *  </table>
	 * @type string 
	*/
	this.szStyle = szStyle?szStyle:"";
	/** a javascript function to be executed (evaluated) on click @type string */
	this.szActionOn = szActionOn;
	/** a javascript function to be executed (evaluated) on checkbox off (only for szType == 'CHECKBOX') @type string */
	this.szActionOff = szActionOff;
	/** a tooltip to be displayed on mouse over @type string */
	this.szTooltip = szTooltip?szTooltip:"";
	this.draw();
};
/**
 * draw the Button 
 * @param evt the actual event handle
 */
Button.prototype.draw = function(evt) {

	// create <a> tag around the button, to have a 'hand' cursor
	if (!this.szType.match(/SELECTED/) || this.szType.match(/CHECKBOX/) ){
		this.nodeObj = map.Dom.newGroup(this.targetGroup);
		this.nodeObj.setAttributeNS(null,"cursor","pointer");
		var aGroup = map.Dom.constructNode("a",this.nodeObj,{});
		this.shapeObj = map.Dom.newGroup(aGroup);
	}
	else{
		this.nodeObj = map.Dom.newGroup(this.targetGroup);
		this.shapeObj = this.nodeObj;
	}
	this.nodeObj.setAttributeNS(null,"id",this.szId+":button");

	if ( this.szType.match(/CHECKBOX/) ){
		var checkOff  = map.Dom.constructNode('use',this.shapeObj,{'xlink:href':'#unchecked_button'});
		var checkOn   = map.Dom.constructNode('use',this.shapeObj,{'xlink:href':'#checked_button'});
		checkOff.setAttributeNS(null,"id",this.szId+":unchecked");
		checkOn.setAttributeNS(null,"id",this.szId+":checked");
		if ( this.szType.match(/SELECTED/) ){
			this.checked = true;
		}
		if (!this.szType.match(/SELECTED/)){
			this.checked = false;
			checkOn.style.setProperty("display","none",""); 
		}
		// GR 14.02.2009 we need this rect, because PDF doesn't support events on 'use' elements correctly
		var eventRect = map.Dom.newShape('rect',this.shapeObj,map.Scale.normalX(-map.Scale.nButtonSize/2),map.Scale.normalX(-map.Scale.nButtonSize/2),map.Scale.normalX(map.Scale.nButtonSize),map.Scale.normalX(map.Scale.nButtonSize),"fill:red;fill-opacity:0");
		eventRect.setAttributeNS(null,"id",this.szId+":widget:eventrect");
		eventRect.setAttributeNS(szMapNs,"tooltip",this.szTooltip);
		eventRect.setAttributeNS(null,"onmouseup","map.Event.stopMouseEvent(evt)");

		// insert into event queue, only CHECKBOX
		new Widget(eventRect,this);
	}
	else if ( this.szType.match(/TEXTBUTTON/) ){
		var szText = this.szStyle;
		var nFontSize = map.Scale.normalY(map.Scale.nButtonSize*0.6); // map.Scale.normalY(9);
		var szFontStyle = "font-family:arial;font-size:"+nFontSize+"px;fill:#444444;baseline-shift:-30%;pointer-events:none";
		var nTextWidth = nFontSize/2*szText.length;
		var buttonRect = null;
		if ( this.szType.match(/SELECTED/) ){
			buttonRect = map.Dom.newShape('rect',this.shapeObj,-nFontSize/5,-nFontSize/3*2,nTextWidth,nFontSize/5*6,"fill:#eeeeff;stroke:black;stroke-width:"+map.Scale.normalX(1)+";stroke-opacity:0.3");
		}
		else{
			buttonRect = map.Dom.newShape('rect',this.shapeObj,-nFontSize/5,-nFontSize/3*2,nTextWidth,nFontSize/5*6,"fill:white;stroke:none;opacity:0");
			buttonRect.setAttributeNS(null,"onmouseup","map.Event.stopMouseEvent(evt)");
			buttonRect.setAttributeNS(null,"onmouseout","map.Event.stopMouseEvent(evt)");
			buttonRect.setAttributeNS(null,"onclick",this.szActionOn);
			buttonRect.setAttributeNS(szMapNs,"tooltip",this.szTooltip);
		}
		var newText = map.Dom.newText(this.shapeObj,0,0,szFontStyle,szText);
		this.bBox = new box(-nFontSize/5,-nFontSize/3*2,newText.getComputedTextLength()+nFontSize/5*2,nFontSize/5*6);
		buttonRect.setAttributeNS(null,"width",String(this.bBox.width));
		this.buttonNode = buttonRect;
	}
	else if ( this.szType.match(/BUTTON/) ){
		var szSymbol = this.szStyle;
		var buttonNode = map.Dom.constructNode('use',this.shapeObj,{'xlink:href':szSymbol});
		buttonNode.setAttributeNS(null,"onmouseup","map.Event.stopMouseEvent(evt)");
		buttonNode.setAttributeNS(null,"onmousedown","map.Event.stopMouseEvent(evt)");
		buttonNode.setAttributeNS(null,"onclick",this.szActionOn);
		buttonNode.setAttributeNS(szMapNs,"tooltip",this.szTooltip);
		this.buttonNode = buttonNode;
	}
};
/**
 * scale the Button 
 * @param x the x scaling factor
 * @param y the y scaling factor
 */
Button.prototype.scale = function(x,y) {
	if (this.nodeObj){
		this.nodeObj.fu.scale(x,y);

	}
};
/**
 * position the Button 
 * @param x the x position
 * @param y the y position
 */
Button.prototype.setPosition = function(x,y) {
	if (this.nodeObj){
		this.nodeObj.fu.setPosition(x,y);
	}
};
/**
 * get the position of the Button 
 * @type point
 * @return the x/y position as point object
 */
Button.prototype.getPosition = function(x,y) {
	if (this.nodeObj){
		return this.nodeObj.fu.getPosition();
	}
};
/**
 * remove the Button 
 */
Button.prototype.remove = function() {
	if (this.nodeObj){
		this.nodeObj.parentNode.removeChild(this.nodeObj);
	}
};
/**
 * set the onclick action
 */
Button.prototype.setActionOn = function(szActionOn) {
	this.szActionOn = szActionOn;
	if (this.buttonNode){
		this.buttonNode.setAttributeNS(null,"onclick",this.szActionOn);
	}
};
/**
 * onclick handler for checkboxes
 */
Button.prototype.onClick= function(evt){
	this.toggleCheckBox(evt);
	map.Event.stopMouseEvent(evt);
};
/**
 * toggle checkbox state
 */
Button.prototype.toggleCheckBox= function(evt){

	_TRACE("toggleCheckBox: "+this.szId+" is "+this.checked);

	var buttonNode = SVGDocument.getElementById(this.szId+":checked");
	if (this.checked) {
		buttonNode.style.setProperty("display","none",""); 
		eval(this.szActionOff);
	} else {
		buttonNode.style.setProperty("display","inline",""); 
		eval(this.szActionOn);
	}
	this.checked = !this.checked;
};

// .............................................................................
// scroll bars      
// .............................................................................

/**
 * Create a new ScrollBar instance.  
 * @class It realizes the creation and animation of scroll bars
 * @constructor
 * @throws 
 * @return A new ScrollBar object
 */
ScrollBar= function(contObj,contOffset,maxBox,barWidth,barHeight,barMargin ){

	if ( !contObj ){
		return;
	}
	this.vBar = 0;
	this.hBar = 0;
	this.hScale=1;
	this.vScale=1;
	this.maxBox=maxBox;
	this.bWidth  = barWidth;
	this.bHeight = barHeight;
	this.hThumb=maxBox.width;
	this.vThumb=maxBox.height;
	this.hThumbOffset=0;
	this.vThumbOffset=0;
	this.hValue=0;
	this.vValue=0;

	this.contObj = contObj;
	this.contBox = contBox = map.Dom.getBox(contObj);
	this.contObj.fu = new Methods(this.contObj);

	if ( (contBox.width+contBox.x) <= (maxBox.width-maxBox.x+1) &&
		 (contBox.height+contBox.y) <= (maxBox.height-maxBox.y+1) ){
		return;		
	}
	if ( (contBox.width+contBox.x) > (maxBox.width-maxBox.x) ) {
		this.hBar	= barHeight;
	}
	if ( (contBox.height+contBox.y) > (maxBox.height-maxBox.y-this.hBar) ) {
		this.vBar	= barWidth;
	}
	if ( (contBox.width+contBox.x) > (maxBox.width-maxBox.x-this.vBar) ) {
		this.hBar	= barHeight;
	}
	if ( this.vBar ){
		this.maxBox.width  -= this.vBar + barMargin;
	}
	if ( this.hBar ){
		this.maxBox.height -= this.hBar + barMargin;
	}

	// scrollbar dimensions
	this.hMax	= this.maxBox.width  - this.hBar*2;
	this.vMax	= this.maxBox.height - this.vBar*2;

	// content scaling -> thumb-scaling
	this.hScale = (contBox.width+ contBox.x)/(this.maxBox.width);
	this.vScale = (contBox.height+contBox.y)/(this.maxBox.height);

	if ( this.hScale>1 ){ 
		// horizontal thumb 
		this.hThumb = Math.floor(this.hMax/this.hScale);
		this.hThumbOffset = Math.min((this.hMax-this.hThumb),-(contOffset.x/this.hScale));
		this.hValue = -contOffset.x / (contBox.width+contBox.x-this.maxBox.width);
	}
	if ( this.vScale>1 ){ 
		// vertical thumb and offset-scaling  
		this.vThumb = Math.floor(this.vMax/this.vScale);
		this.vThumbOffset = Math.min((this.vMax-this.vThumb),-(contOffset.y/this.vScale));
		this.vValue = -contOffset.y / (contBox.height+contBox.y-this.maxBox.height);
	}
	this.hThumbStyle = "fill:#99aacc;stroke:#dddddd;stroke-width:"+map.Scale.normalX(0.3)+";opacity:0.3";
	this.vThumbStyle = "fill:#99aacc;stroke:#dddddd;stroke-width:"+map.Scale.normalY(0.3)+";opacity:0.3";
};
/**
 * draw the scrollbars 
 * @param evt the actual event handle
 */
ScrollBar.prototype.draw = function(evt) {
	if ( !this.contObj ){
		return;
	}
	var szDefaultStyle = "fill:white;stroke:black;stroke-width:"+map.Scale.normalX(0.2)+";opacity:1.0";
	var szDefaultThumb = "fill:#e8e8f8;stroke:white;stroke-width:"+map.Scale.normalX(0.5)+";opacity:1.0";
	var szDefaultBigSt = "fill:black;stroke:black;opacity:0";
	var szDefaultPath  = "fill:none;stroke:#444444;stroke-width:"+map.Scale.normalX(2)+";opacity:1.0";

	var fClassicStyle = false;
	var szNewStyle = "fill:white;stroke:#dddddd;stroke-width:"+map.Scale.normalX(0.2)+";opacity:1.0";

	this.remove(evt);

	if ( (this.hScale != 1) || (this.vScale != 1) ){
		var scrollWidget = map.Dom.newGroup(this.contObj.parentNode);
		scrollWidget.setAttributeNS(null,"id","scrollwidget");
		this.scrollWidget = scrollWidget;

		var buttonObj = null;
		var buttonGroup = null;

		if (this.vScale > 1 && this.hScale > 1 ){
			// filling rect at bottom/right
			map.Dom.newShape('rect',scrollWidget,this.maxBox.width,this.maxBox.height,this.bWidth+map.Scale.normalX(1),this.bHeight+map.Scale.normalX(1),szDefaultStyle);
		}
		if (this.hScale > 1 ){
			// horizontal tumbspace
			if ( fClassicStyle ){
				map.Dom.newShape('rect',scrollWidget,this.bWidth,this.maxBox.height,this.hMax,this.bHeight+map.Scale.normalX(0.8),szDefaultStyle);
			}else{
				map.Dom.newShape('rect',scrollWidget,this.bWidth,this.maxBox.height,this.hMax,this.bHeight+map.Scale.normalX(0.8),szNewStyle);
			}
			// big step buttons
			buttonObj = map.Dom.newShape('rect',scrollWidget,this.bWidth,this.maxBox.height,this.hMax/2,this.bHeight,szDefaultBigSt);
			if ( buttonObj ){
				buttonObj.setAttributeNS(null,"id","widget:scrollbar:bigstepleft");
				new Widget(buttonObj,this);
			}
			buttonObj = map.Dom.newShape('rect',scrollWidget,this.bWidth+this.hMax/2,this.maxBox.height,this.hMax/2,this.bHeight,szDefaultBigSt);
			if ( buttonObj ){
				buttonObj.setAttributeNS(null,"id","widget:scrollbar:bigstepright");
				new Widget(buttonObj,this);
			}
			// horizontal thumb
			buttonObj = map.Dom.newShape('rect',scrollWidget,map.Scale.normalX(1.5),map.Scale.normalY(1.5),Math.max(2,this.hThumb-map.Scale.normalX(2)),Math.max(2,this.bHeight-map.Scale.normalY(2)),this.hThumbStyle?this.hThumbStyle:szDefaultThumb);
			buttonObj.fu.setPosition(this.bWidth,this.maxBox.height);
			this.hThumbObj = new Slider(buttonObj,new box(0,0,this.hMax-this.hThumb,0));
			this.hThumbObj.parent = this;
			this.hThumbObj.setValue(new point(this.hValue,0));
			if ( fClassicStyle ){
				// horizontal buttons
				buttonGroup = map.Dom.newGroup(scrollWidget,"widget:scrollbar:stepleft");
				map.Dom.newShape('rect',buttonGroup,0,0,this.bWidth+map.Scale.normalX(0.8),this.bHeight+map.Scale.normalX(0.8),szDefaultStyle);
				map.Dom.newShape('path',buttonGroup,"M"+( this.bWidth*2/3) + ","  + map.Scale.normalX(2.5) + "l" +
														(-this.bWidth*2/7) + ","  + this.bHeight*2/7	   + " " +
														( this.bWidth*2/7) + ","  + this.bHeight*2/7 
														,szDefaultPath);
				buttonGroup.fu.setPosition(0,this.maxBox.height);
				new Widget(buttonGroup,this);
				buttonGroup = map.Dom.newGroup(scrollWidget,"widget:scrollbar:stepright");
				map.Dom.newShape('rect',buttonGroup,0,0,this.bWidth+map.Scale.normalX(0.8),this.bHeight+map.Scale.normalX(0.8),szDefaultStyle);
				map.Dom.newShape('path',buttonGroup,"M"+( this.bWidth*1/3) + ","  + map.Scale.normalX(2.5) + "l" +
														( this.bWidth*2/7) + ","  + this.bHeight*2/7	   + " " +
														(-this.bWidth*2/7) + ","  + this.bHeight*2/7 
														,szDefaultPath);
				buttonGroup.fu.setPosition(this.maxBox.width-this.bWidth,this.maxBox.height);
				new Widget(buttonGroup,this);
			}
		}
		if (this.vScale > 1 ){
			// vertical tumbspace
			if ( fClassicStyle ){
				map.Dom.newShape('rect',scrollWidget,this.maxBox.width,this.bHeight,this.bWidth+map.Scale.normalX(0.8),this.vMax,szDefaultStyle);
			}else{
				map.Dom.newShape('rect',scrollWidget,this.maxBox.width+map.Scale.normalX(2),this.bHeight,this.bWidth-map.Scale.normalX(2),this.vMax,szNewStyle);
			}
			// big step buttons
			buttonObj = map.Dom.newShape('rect',scrollWidget,this.maxBox.width,this.bHeight,this.bWidth,this.vMax/2,szDefaultBigSt);
			if ( buttonObj ){
				buttonObj.setAttributeNS(null,"id","widget:scrollbar:bigstepup");
				new Widget(buttonObj,this);
			}
			buttonObj = map.Dom.newShape('rect',scrollWidget,this.maxBox.width,this.bHeight+this.vMax/2,this.bWidth,this.vMax/2,szDefaultBigSt);
			if ( buttonObj ){
				buttonObj.setAttributeNS(null,"id","widget:scrollbar:bigstepdown");
				new Widget(buttonObj,this);
			}
			// vertical thumb
			buttonObj = map.Dom.newShape('rect',scrollWidget,map.Scale.normalX(1.5),map.Scale.normalY(1.5),Math.max(2,this.bWidth-map.Scale.normalX(2)),Math.max(2,this.vThumb-map.Scale.normalY(2)),this.vThumbStyle?this.vThumbStyle:szDefaultThumb);
			buttonObj.fu.setPosition(this.maxBox.width,this.bHeight);
			this.vThumbObj = new Slider(buttonObj,new box(0,0,0,this.vMax-this.vThumb));
			this.vThumbObj.parent = this;
			this.vThumbObj.setValue(new point(0,this.vValue));
			if ( fClassicStyle ){
				// vertical buttons
				buttonGroup = map.Dom.newGroup(scrollWidget,"widget:scrollbar:stepup");
				map.Dom.newShape('rect',buttonGroup,0,0,this.bWidth+map.Scale.normalX(0.8),this.bHeight+map.Scale.normalX(0.8),szDefaultStyle);
				map.Dom.newShape('path',buttonGroup,"M"+map.Scale.normalX(2.5)	+ ","  +   this.bHeight*2/3  + "l" +
														this.bWidth*2/7			+ ","  + (-this.bHeight*2/7) + " " +
														this.bWidth*2/7			+ ","  + ( this.bHeight*2/7) 
														,szDefaultPath);
				buttonGroup.fu.setPosition(this.maxBox.width,0);
				new Widget(buttonGroup,this);
				buttonGroup = map.Dom.newGroup(scrollWidget,"widget:scrollbar:stepdown");
				map.Dom.newShape('rect',buttonGroup,0,0,this.bWidth+map.Scale.normalX(0.8),this.bHeight+map.Scale.normalX(0.8),szDefaultStyle);
				map.Dom.newShape('path',buttonGroup,"M"+map.Scale.normalX(2.5)	+ ","  +   this.bHeight*1/3  + "l" +
														this.bWidth*2/7			+ ","  + ( this.bHeight*2/7) + " " +
														this.bWidth*2/7			+ ","  + (-this.bHeight*2/7) 
														,szDefaultPath);
				buttonGroup.fu.setPosition(this.maxBox.width,this.maxBox.height-this.bHeight);
				new Widget(buttonGroup,this);
			}
		}
	}
	else{
		this.contObj.fu.setPosition(0,0);
	}
};
/**
 * inform about scrollbars and state
 * @param evt the actual event handle
 * @type boolean
 * @return true or false
 */
ScrollBar.prototype.hasScrollBars = function(evt) {
	return 	( (this.vScale > 1) || (this.hScale > 1) );
};
/**
 * handles onmousedown events on scrollbars (hast no function yet)
 * @param evt the actual event handle
 */
ScrollBar.prototype.onMouseDown = function(evt) {
};
/**
 * handles onmousemove events on scrollbars, repositions the target object (workspace)
 * @param evt the actual event handle
 */
ScrollBar.prototype.onMouseMove = function(evt) {
	var valueX = 0;
	var valueY = 0;
	if (this.hScale > 1 ){
		valueX = this.hThumbObj.fraction.x;
	}
	if (this.vScale > 1 ){
		valueY = this.vThumbObj.fraction.y;
	}
	this.contObj.fu.setPosition(-valueX*(this.contBox.x+this.contBox.width-this.maxBox.width),-valueY*(this.contBox.y+this.contBox.height-this.maxBox.height));
};
/**
 * handles onmouseup events on scrollbars (hast no function yet)
 * @param evt the actual event handle
 */
ScrollBar.prototype.onMouseUp = function(evt) {
};
/**
 * handles onclick events on scrollbars, moves the resp. thumb of the scrollbar
 * @param evt the actual event handle
 */
ScrollBar.prototype.onClick = function(evt) {
	var mapObject = new MapObject(evt.target);
	if (mapObject){
		szId = mapObject.szId;
		nStep = szId.match(/big/)?map.Scale.normalX(100):map.Scale.normalX(5);
		if      ( szId.match(/stepdown/ ) )	{this.vThumbObj.moveThumb(0, nStep);}	
		else if ( szId.match(/stepup/   ) )	{this.vThumbObj.moveThumb(0,-nStep);}
		else if ( szId.match(/stepleft/ ) )	{this.hThumbObj.moveThumb(-nStep,0);}			
		else if ( szId.match(/stepright/) )	{this.hThumbObj.moveThumb( nStep,0);}			
	}
};
/**
 * removes created scrollbars
 * @param evt the actual event handle
 */
ScrollBar.prototype.remove = function(evt) {
	if (this.scrollWidget){
		this.scrollWidget.parentNode.removeChild(this.scrollWidget);
	}
};

// .............................................................................
// slider     
// .............................................................................

/**
 * Create a new Slider instance.  
 * @class It realizes the creation and animation of an arbitrary slider
 * @constructor
 * @throws 
 * @return A new Slider object
 */
Slider = function(objNode,bArea,bScale,nStep,szValues){
	this.szId	   = null;
	this.moveArea  = bArea;
	this.scaleArea = bScale;
	this.value     = new point(0,0);
	this.fraction  = new point(0,0);
	this.onMove	   = null;
	this.onUp	   = null;
	if (szValues){
		this.valuesA  = szValues.split(',');
	}
	this.objNode = objNode;
	this.objNode.setAttributeNS(null,"id","widget:slider:"+String(Math.random()));
	objNode.fu = new Methods(objNode);
	this.ptNull = objNode.fu.getPosition();
	widgetList.add(this);
};
/**
 * sets a new move area fo a slider
 * @param evt the actual event handle
 */
Slider.prototype.setMoveArea = function(bArea){
	this.moveArea  = bArea;
};
/**
 * sets an id fo a slider
 * @param evt the actual event handle
 */
Slider.prototype.setId = function(szId){
	this.szId  = szId;
};
/**
 * handles onmouseover events on slider thumb
 * @param evt the actual event handle
 */
Slider.prototype.onMouseOver = function(evt){
	if (this.parent){
		try{
			this.parent.onMouseOver(evt,this.szId,this);
		}
		catch (e){
		}
	}
};
/**
 * handles onmouseout events on slider thumb
 * @param evt the actual event handle
 */
Slider.prototype.onMouseOut = function(evt){
	if (this.parent){
		try{
			this.parent.onMouseOut(evt,this.szId,this);
		}
		catch (e){
		}
	}
};
/**
 * handles onmousedown events on slider thumbs, begin dragging
 * @param evt the actual event handle
 */
Slider.prototype.onMouseDown = function(evt){
	if (this.moveArea.width == 0){
		mouseObject = new MouseObject(evt,this.objNode,"yonly");
	}
	else if (this.moveArea.height == 0){
		mouseObject = new MouseObject(evt,this.objNode,"xonly");
	}
	else{
		mouseObject = new MouseObject(evt,this.objNode,null);
	}
	mouseObject.parent = this;

	if (this.parent){
		try{
			this.parent.onMouseDown(evt,this.szId,this);
		}
		catch (e){
		}
	}
};
/**
 * handles onmousemove events on slider thumbs
 * clip slider movements
 * than calls onMouseMove() method of the slider parent (if exists)
 * @param evt the actual event handle
 */
Slider.prototype.onMouseMove = function(evt){
	var ptPos = this.objNode.fu.getPosition();
	ptPos.x = Math.min( ptPos.x,this.ptNull.x+this.moveArea.x+this.moveArea.width);
	ptPos.x = Math.max( ptPos.x,this.ptNull.x+this.moveArea.x);
	ptPos.y = Math.min( ptPos.y,this.ptNull.y+this.moveArea.y+this.moveArea.height);
	ptPos.y = Math.max( ptPos.y,this.ptNull.y+this.moveArea.y);
	this.objNode.fu.setPosition(ptPos.x,ptPos.y);

	this.value = new point(0,0);
	if ( this.moveArea.width > 0 ){
		this.value.x = ptPos.x-this.ptNull.x;
		this.fraction.x = this.value.x/this.moveArea.width;
	}
	if ( this.moveArea.height > 0 ){
		this.value.y = ptPos.y-this.ptNull.y;
		this.fraction.y = this.value.y/this.moveArea.height;
	}

	if (this.parent){
		try{
			this.parent.onMouseMove(evt,this.szId,this);
		}
		catch (e){
		}
	}
};
/**
 * handles onmouseup events on slider thumbs (dummy)
 * @param evt the actual event handle
 */
Slider.prototype.onMouseUp = function(evt){
	if (this.parent){
		try{
			this.parent.onMouseUp(evt,this.szId,this);
		}
		catch (e){
		}
	}
};
/**
 * moves the thumb of the slider by the given x/y delta values
 * calls the onMouseMove() method of the slider, to complete the function
 * @param nDx the delta x value
 * @param nDy the delta y value
 */
Slider.prototype.moveThumb = function(nDx,nDy){
	var ptPos = this.objNode.fu.getPosition();
	ptPos.x += nDx;
	ptPos.y += nDy;
	this.objNode.fu.setPosition(ptPos.x,ptPos.y);
	this.onMouseMove();
};
/**
 * moves the thumb of the given value ( x/y )
 * calls the onMouseMove() method of the slider, to complete the function
 * @param ptValue the new value as point object ( .x [0...1] , .y [0...1] ) 
 */
Slider.prototype.setValue = function(ptValue){
	var newX = ptValue.x*this.moveArea.width  + this.ptNull.x;
	var newY = ptValue.y*this.moveArea.height + this.ptNull.y;
	this.objNode.fu.setPosition(newX,newY);
	this.onMouseMove();
};
/**
 * removes the slider from the widget list
 */
Slider.prototype.remove = function(){
	widgetList.removeWidget(this);
};

/**
 * -----------------------------------------------------------------------------
 * Create a new RotationSlider instance.  
 * @class It realizes the creation and animation of an arbitrary rotation slider
 * @constructor
 * @throws 
 * @return A new RotationSlider object
 * -----------------------------------------------------------------------------
 */
RotationSlider = function(objNode,nRadius,szRange,szScale,nStep,nSnap){
	this.circlethumb = map.Dom.newGroup(objNode.parentNode,"widget:rotationslider:thumb");
	this.circlethumb.setAttributeNS(null,'area',"-1000,-1000,1000,1000");
	this.circlethumb.setAttributeNS(null,'range',szRange);
	this.circlethumb.setAttributeNS(null,'scale',szScale);
	this.nStep = nStep;
	this.nSnap = nSnap;
	this.pBase = objNode.fu.getPosition();
	this.circlethumb.fu.setPosition(this.pBase.x,this.pBase.y);

	this.circlethumbNode = map.Dom.newShape('circle',this.circlethumb,0,0,map.Scale.normalX(5),"fill:#ff0000;opacity:0.0;pointer-events:none");
	this.circleOverNode2 = map.Dom.newShape('circle',this.circlethumb,0,0,map.Scale.normalX(6),"fill:none;stroke:#ffffff;stroke-width:"+map.Scale.normalX(11)+";opacity:0.6;pointer-events:none;display:none");
	this.circleOverNode  = map.Dom.newShape('path',this.circlethumb,"M-"+map.Scale.normalX(5.5)+",0 a"+map.Scale.normalX(6)+","+map.Scale.normalX(6)+" 0 1,0 "+map.Scale.normalX(5)+","+(-map.Scale.normalX(5)),"fill:none;stroke:#888888;stroke-width:"+map.Scale.normalX(1)+";opacity:0.8;pointer-events:none;display:none");
	setRotate(this.circleOverNode,45);
	setRotate(this.circleOverNode2,45);

	var tmpDefs   = map.Dom.newNode('defs',this.circlethumb);
	var myMarker  = map.Dom.newNode('marker',tmpDefs);
	myMarker.setAttributeNS(null,"id","Triangle");
	myMarker.setAttributeNS(null,"refX","0");
	myMarker.setAttributeNS(null,"refY","0");
	myMarker.setAttributeNS(null,"orient","auto");
	myMarker.setAttributeNS(null,"style","overflow:visible");
	myMarker.setAttributeNS(null,"path","M 0 0 L "+map.Scale.normalX(10)+" "+map.Scale.normalX(5)+" L 0 "+map.Scale.normalX(10)+" z");
	this.circleOverNode.style.setProperty("marker-start","url(#Triangle)","");
	this.circleOverNode.style.setProperty("marker-end","url(#Triangle)","");
	this.objNode = objNode;
	this.objNode.setAttributeNS(null,"id","widget:slider:"+String(Math.random()));
	widgetList.add(this);
	this.isActive = false;
};

/**
 * sets the rotation of the slider by degree values
 * @param nAngle the new degree value
 */
RotationSlider.prototype.setValue = function(nAngle){
	var newX = ptValue.x*this.moveArea.width  + this.ptNull.x;
	var newY = ptValue.y*this.moveArea.height + this.ptNull.y;
	this.objNode.fu.setPosition(newX,newY);
	this.onMouseMove();
};
/**
 * handles onmouseover events on slider thumbs; show rotation ability
 * @param evt the actual event handle
 */
RotationSlider.prototype.onMouseOver = function(evt){
	this.circleOverNode.style.setProperty("display","inline","");
	this.circleOverNode2.style.setProperty("display","inline","");
	if (this.parent){
		try{
			this.parent.onMouseOver(evt);
		}
		catch (e){
		}
	}
};
/**
 * handles onmouseover events on slider thumbs; show rotation ability
 * @param evt the actual event handle
 */
RotationSlider.prototype.onMouseOut = function(evt){
	if ( !this.isActive ){
		this.circleOverNode.style.setProperty("display","none","");
		this.circleOverNode2.style.setProperty("display","none","");
	}
	if (this.parent){
		try{
			this.parent.onMouseOut(evt);
		}
		catch (e){
		}
	}
};
/**
 * handles onmousedown events on slider thumbs, begin dragging
 * @param evt the actual event handle
 */
RotationSlider.prototype.onMouseDown = function(evt){
	_TRACE("RotationSlider: onMouseDown() ");
	var newMousePosition = map.Scale.getClientMousePosition(evt,SVGToolsGroup);
	this.startPosition = new point(newMousePosition.x-this.pBase.x,newMousePosition.y-this.pBase.y);
	this.circlethumbNode.fu.setPosition(this.startPosition.x,this.startPosition.y);
	mouseObject = new MouseObject(evt,this.circlethumbNode);
	mouseObject.parent = this;
	this.isActive = true;
	if (this.parent){
		try{
			this.parent.onMouseDown(evt);
		}
		catch (e){
		}
	}
};
/**
 * handles onmousemove events on rotation slider thumbs
 * @param evt the actual event handle
 */
RotationSlider.prototype.onMouseMove = function(evt){

	if ( this.isActive ){
		setRotate(this.objNode,this.getAngle());

		if (this.parent){
			try{
				this.parent.onMouseMove(evt);
			}
			catch (e){
			}
		}
	}
};
/**
 * handles onmouseup events on slider thumbs (dummy)
 * @param evt the actual event handle
 */
RotationSlider.prototype.onMouseUp = function(evt){
	this.isActive = false;
	this.circleOverNode.style.setProperty("display","none","");
	this.circleOverNode2.style.setProperty("display","none","");
	if (this.parent){
		try{
			this.parent.onMouseUp(evt);
		}
		catch (e){
		}
	this.objNode.style.setProperty("opacity","1.0","");
	}
};
/**
 * handles onclick events on slider thumbs (dummy)
 * @param evt the actual event handle
 */
RotationSlider.prototype.onClick = function(evt){
	this.isActive = false;
	this.circleOverNode.style.setProperty("display","none","");
	this.circleOverNode2.style.setProperty("display","none","");
	setRotate(this.objNode,0);
	if (this.parent){
		try{
			this.parent.onClick(evt);
		}
		catch (e){
		}
	this.objNode.style.setProperty("opacity","1.0","");
	}
};
/*
@ -----------------------------------------------------------------------------
@ Function	 :	SORsliderGetAngle
@ Description:	gets the actual angle (value) of a rotation slider
@ Parameter  :	objNode  - node of the thumb object
@ -----------------------------------------------------------------------------
*/
RotationSlider.prototype.getAngle = function(evt){
	var actPosition = this.circlethumbNode.fu.getPosition();
	var a = actPosition.x;
	var b = actPosition.y;
	var c = Math.sqrt(a*a+b*b);
	var nSin = a/c;
	var iAngle = Math.asin(nSin)/Math.PI*180;
	iAngle = isNaN(iAngle)?180:iAngle;
	if ( a >= 0 && b >= 0 ){iAngle = 180-iAngle;}
	if ( a >= 0 && b < 0 ) {iAngle = iAngle;}
	if ( a < 0 && b >= 0 ) {iAngle = 180-iAngle;}
	if ( a < 0 && b < 0 )  {iAngle = 360+iAngle;}
	if ( this.nStep && this.nSnap ){
		if ( (iAngle%this.nStep) < this.nSnap ){
			iAngle = Math.floor(iAngle/this.nStep)*this.nStep;
			this.objNode.style.setProperty("opacity","1.0","");
		}else{
			this.objNode.style.setProperty("opacity","0.5","");
		}
	}
	return iAngle;
};
/*
@ -----------------------------------------------------------------------------
@ Function	 :	SORsliderMove
@ Description:	called if the mouse is moved to change the rotation angle of the slider thumb
@ Parameter  :	evt  - the (mouse) event
@ Note       :  the rotation angle is changed according to the delta angle of the 
@				mouse position relative to the center of the rotation slider thumb
@ -----------------------------------------------------------------------------
*/
function SORsliderMove(evt){
	var matrixA = getMatrix(this.symbolNode);
	matrixA[4] = Math.min(Math.max(Number(matrixA[4]),sliderObject.moveArea.x),sliderObject.moveArea.width);	
	matrixA[5] = Math.min(Math.max(Number(matrixA[5]),sliderObject.moveArea.y),sliderObject.moveArea.height);	
	setMatrix(this.symbolNode,matrixA);
	var iAngle = SORsliderGetAngle(this.symbolNode);		

	var szRange = this.symbolNode.getAttribute('range');
	if ( szRange && szRange != "" ){
		var firstAngle = Number(szRange.split(',')[0]);
		var lastAngle  = Number(szRange.split(',')[1]);
		var nValue = 0; 
		if ( firstAngle < lastAngle ){
			iAngle = Math.min(Math.max(iAngle,firstAngle),lastAngle);
			nValue = iAngle/(lastAngle-firstAngle)*(sliderObject.scaleVal.ymin-sliderObject.scaleVal.xmin);
			}
		else {
			if ( iAngle >= lastAngle ){
				if ( iAngle <= (firstAngle-lastAngle)/2){
					iAngle = lastAngle;
				}
				else if ( iAngle <= firstAngle ){
					iAngle = firstAngle;
				}
			}
		nValue = ((iAngle<=lastAngle?iAngle+360:iAngle)-firstAngle)/(360-firstAngle+lastAngle)*(sliderObject.scaleVal.ymin-sliderObject.scaleVal.xmin);
		}
	}
	this.symbolNode.parentNode.firstChild.setAttributeNS(null,'transform','rotate('+iAngle+')');
	
	matrixA[4] = SX(20*Math.sin(iAngle/180*Math.PI));	
	matrixA[5] = SY(-20*Math.cos(iAngle/180*Math.PI));
	setMatrix(this.symbolNode,matrixA);
	
	if ( sliderObject.onMove && sliderObject.onMove != "" ){
		eval(sliderObject.onMove+"(evt,"+String(nValue)+")");
	}
}
/*
@ -----------------------------------------------------------------------------
@ Function	 :	SORsliderUp
@ Description:	removes the rotation slider object when the mouse is released
@ Parameter  :	evt  - the (mouse) event
@				a user defined 'onUp' function is called if defined
@ -----------------------------------------------------------------------------
*/
function SORsliderUp(evt){
	var iAngle = SORsliderGetAngle(this.symbolNode);		
	if ( sliderObject.onUp && sliderObject.onUp != "" ){
		eval(sliderObject.onUp+"(evt,"+String(iAngle)+")");
	}
	if ( sliderObject.pointNode ){
		removeObject(sliderObject.pointNode);
	}
	sliderObject = null;
}
/*
@ -----------------------------------------------------------------------------
@ Function	 :	SORsliderGetAngle
@ Description:	gets the actual angle (value) of a rotation slider
@ Parameter  :	objNode  - node of the thumb object
@ -----------------------------------------------------------------------------
*/
function SORsliderGetAngle(objNode){
	var matrixA = getMatrix(objNode);
	var a = Number(matrixA[4]);
	var b = Number(matrixA[5]);
	var c = Math.sqrt(a*a+b*b);
	var nSin = a/c;
	var iAngle = Math.asin(nSin)/Math.PI*180;
	if ( a >= 0 && b >= 0 ){iAngle = 180-iAngle;}
	if ( a >= 0 && b < 0 ) {iAngle = iAngle;}
	if ( a < 0 && b >= 0 ) {iAngle = 180-iAngle;}
	if ( a < 0 && b < 0 )  {iAngle = 360+iAngle;}
	return iAngle;
}

// .............................................................................
// widgets     
// .............................................................................

/**
 * Create a new WidgetList instance.  
 * @class It holds an array of all actual widgets.
 * <br>The scope is, to pass events to the logical owner of GUI objects.
 * <br>For this, a {@link Widget} has a link to its owner object.
 * <br> 
 * <br>That's all.
 * <br> 
 * @constructor
 * @throws 
 * @return A new WidgetList
 */
WidgetList = function(){
	/** array to hold all created {@link Widget} objects @type array */
	this.widgetA = new Array(0);
};
/**
 * add one widget 
 * @param  {Widget} widgetObj the widget object to add
 */
WidgetList.prototype.add = function(widgetObj){
	this.widgetA[this.widgetA.length] = widgetObj;
};
/**
 * get Widget of object node 
 * @param objNode the SVG node that may be a widget
 * @type Widget
 * @return the widget object, if exists, or null
 */
WidgetList.prototype.getWidget = function(objNode){
	for ( i in this.widgetA ){
		if ( this.widgetA[i].objNode == objNode ){
			return this.widgetA[i];
		}
	}
	return null;
};
/**
 * execute onMouseOver on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onMouseOver() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onMouseOver = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		try{
			widgetObj.onMouseOver(evt); 
		}
		catch (e){
		}
		try{
			widgetObj.owner.onMouseOver(evt); 
		}
		catch (e){
		}
	}
};
/**
 * execute onMouseOut on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onMouseOut() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onMouseOut = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		try{
			widgetObj.onMouseOut(evt); 
		}
		catch (e){
		}
		try{
			widgetObj.owner.onMouseOut(evt); 
		}
		catch (e){
		}
	}
};
/**
 * execute onMouseDown on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onMouseDown() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onMouseDown = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		try{
			widgetObj.onMouseDown(evt); 
		}
		catch (e){
		}
		try{
			widgetObj.owner.onMouseDown(evt); 
		}
		catch (e){
		}
	}
};
/**
 * execute onMouseUp on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onMouseUp() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onMouseUp = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		try{
			widgetObj.onMouseUp(evt); 
		}
		catch (e){
		}
		try{
			widgetObj.owner.onMouseUp(evt); 
		}
		catch (e){
		}
	}
};
/**
 * execute onMouseUp on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onMouseUp() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onMouseMove = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		try{
			widgetObj.onMouseMove(evt); 
		}
		catch (e){
		}
		try{
			widgetObj.owner.onMouseMove(evt); 
		}
		catch (e){
		}
	}
};
/**
 * execute onClick on widget nodes
 * checks if the event target belongs to a widget 
 * if yes, calls the onClick() method of the widget and (if present) its owner
 * @param evt the actual event
 */
WidgetList.prototype.onClick = function(evt){
	var mapObject = new MapObject(evt.target);
	_TRACE("widget onclick "+mapObject.szId);
	if ( mapObject ){
		var widgetObj = this.getWidget(mapObject.objNode);
		if (widgetObj){
			_TRACE("widget object found: "+widgetObj);
			try{
				widgetObj.onClick(evt); 
			}
			catch (e){
			}
			_TRACE("widget object owner: "+widgetObj.owner);
			try{
				widgetObj.owner.onClick(evt); 
			}
			catch (e){
			}
			return true;
		}
	}
	return false;
};
/**
 * removes the assoziated widget 
 * @param objNode the SVG node that may be a widget
 */
WidgetList.prototype.removeWidget = function(objNode){
	for ( var i=0; i<this.widgetA.length; i++ ){
		if ( this.widgetA[i].objNode == objNode ){
			for ( ; i<this.widgetA.length-1; i++){
				this.widgetA[i] = this.widgetA[i+1];
			}
			this.widgetA.length--;
		}
	}
};
/**
 * clears widget list 
 */
WidgetList.prototype.clear = function(){
	this.widgetA.length = 0;
};

/**
 * Create a new Widget instance.  
 * @class It realizes a widget (button, ...)
 * @constructor
 * @throws 
 * @return A new Widget
 */
Widget = function(widgetNode,widgetObj){
	/** the node of the shape to become a widget @type DOM node */
	this.objNode = widgetNode;
	/** owner object @type class */
	this.owner   = widgetObj;
	widgetList.add(this);
};
/**
 * remove widget 
 */
Widget.prototype.remove = function(){
	widgetList.removeWidget(this);
};

widgetList = new WidgetList();

// .............................................................................
// Map tools       
// .............................................................................

/**
 * Create a new MapToolList instance.  
 * @class It holds an array of all actual map tools
 * @constructor
 * @throws 
 * @return A new MapToolList
 */
MapToolList = function(){
	/** array that holds all created {@link MapTool} objects @type array */
	this.toolsA = new Array(0);
};
/**
 * add one tool 
 * @param mapTool the map tool object to add to the list
 */
MapToolList.prototype.add = function(mapTool,nPos){
	if ( nPos && (nPos < this.toolsA.length-1) ){
		this.toolsA.splice(nPos,0,mapTool);
	}else{
		this.toolsA[this.toolsA.length] = mapTool;
	}
};
/**
 * getMapTool of object node 
 * @param objNode the SVG node that may be a map tool element
 */
MapToolList.prototype.getMapTool = function(objNode){
	for ( i in this.toolsA ){
		if ( this.toolsA[i].objNode == objNode.parentNode ){
			return this.toolsA[i];
		}
	}
	return null;
};
/**
 * remove the assoziated mapTool
 * checks if the objNode belongs to mapTool
 * if yes, removes this mapTool
 * @param objNode the SVG node that may be a map tool element
 */
MapToolList.prototype.removeMapTool = function(objNode){
	for ( var i=0; i<this.toolsA.length; i++ ){
		if ( this.toolsA[i].objNode == objNode.parentNode ){
			this.toolsA[i].remove();
			for ( ; i<this.toolsA.length-1; i++){
				this.toolsA[i] = this.toolsA[i+1];
			}
			this.toolsA.length--;
			if (this.toolsA.length){
				this.toolsA[0].redraw();
			}
		}
	}
};
/**
 * clear the map tools list 
 */
MapToolList.prototype.clear = function(){
	this.toolsA.length = 0;
};
/**
 * execute onMouseDown on maptool nodes
 * checks if the event target belongs to a map tool 
 * if yes, calls the onMouseDown() method of the map tool
 * @param evt the actual event
 */
MapToolList.prototype.onMouseDown = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		if ( (mapTool = mapToolList.getMapTool(mapObject.objNode)) ) {
			mouseObject = new MouseObject(evt,mapObject.objNode,"parentonly",mapTool);
			mouseObject.parent = mapTool;
		}
	}
	return;
};

mapToolList = new MapToolList();

/**
 * Create a new MapTool instance.  
 * @class It realizes a selection, measure, zoom, pan tool
 * @constructor
 * @throws 
 * @return A new MapTool
 * @param evt the actual event
 * @param szType the tool type ("coord","polygon",...)
 */
MapTool = function(evt,szType,nPos) {
	/** fontsize for all map tool texts @type int */
	this.nFontSize      =  14;
	/** SVG style to draw lines in map tools @type string */
	this.szLineStyle	= "fill:none;stroke:darkblue;stroke-width:"+map.Scale.normalX(1)+";opacity:1.0;";
	/** SVG style to draw small lines in map tools @type string */
	this.szLineStyleLite = "fill:none;stroke:darkblue;stroke-width:"+map.Scale.normalX(0.75)+";opacity:1.0;";
	/** SVG style for line backgrounds @type string */
	this.szLineBgStyle	= "fill:none;stroke:white;stroke-width:"+map.Scale.normalX(5)+";opacity:0.5;";
	/** SVG style background areas @type string */
	this.szFillBgStyle	= "fill:white;stroke:none;opacity:0.6";
	/** SVG style for text in tools @type string */
	this.szTextStyle	= "font-family:arial;font-size:"+map.Scale.normalY(this.nFontSize)+"px;fill:darkblue;pointer-events:none;";
	/** SVG style for created polyline shapes @type string */
	this.szPolylineStyle= "fill:none;stroke:blue;stroke-width:"+map.Scale.normalX(2.5)+";stroke-opacity:0.5;";
	/** SVG style for created polygon shapes @type string */
	this.szPolygonStyle = "fill:blue;stroke:black;stroke-width:"+map.Scale.normalX(1)+";fill-opacity:0.2;";
	/** SVG style for created buffer shapes @type string */
	this.szBufferStyle = "fill:blue;stroke:darkblue;stroke-width:"+map.Scale.normalX(1)+";fill-opacity:0.2;";

	/** type of this tool as string (e.g."polygon") @type string */
	this.szType = szType;
	/** rootnode of this tool @type DOM node */
	this.objNode = map.Dom.newGroup(SVGToolsGroup,szType+String(Math.random()));

	var textObj    = null;
	var endPoint   = null;
	var startPoint = null;

	var szPathStyle = this.szPolygonStyle;

	switch (szType){
		case "coord":
			mouseObject = new MouseObject(evt,null,"parentonly");
			mouseObject.parent = this;

			textObj = map.Dom.newGroup(this.objNode,"distance-text"+String(Math.random()));
			map.Dom.newShape('rect',textObj,0,0,1,1,this.szFillBgStyle);
			map.Dom.newText(textObj,0,0,this.szTextStyle,"");
			map.Dom.newText(textObj,0,0,this.szTextStyle,"");

			endPoint = map.Dom.newGroup(this.objNode,"endpoint"+String(Math.random())+':maptoolnode');
			endPoint.setAttributeNS(szMapNs,'menu','maptoolmenu');
			map.Dom.newShape('circle',endPoint,0,0,map.Scale.normalX(5.5),this.szFillBgStyle);
			map.Dom.newShape('line',endPoint,-map.Scale.normalX(10),0,map.Scale.normalX(10),0,this.szLineStyleLite);
			map.Dom.newShape('line',endPoint,0,-map.Scale.normalY(10),0,map.Scale.normalY(10),this.szLineStyleLite);
			map.Dom.newShape('circle',endPoint,0,0,map.Scale.normalX(3.7),this.szLineStyle);
			endPoint.fu.setPosition(mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y);
			this.redraw();

			break;
		case "polyline":
			szPathStyle = this.szPolylineStyle;
		case "polygon":
			mouseObject = new MouseObject(evt,null,"parentonly");
			mouseObject.parent = this;

			var szPolylineId = "maptools_polypath";
			var polylinePath = SVGDocument.getElementById(szPolylineId);
			if ( polylinePath == null ){
				polylinePath = map.Dom.newNode('path',SVGToolsGroup);
				polylinePath.setAttributeNS(null,"id",szPolylineId);
				polylinePath.setAttributeNS(szMapNs,"menu","polygonmenu");
				polylinePath.setAttributeNS(null,"style",szPathStyle);
				polylinePath.parentNode.insertBefore(polylinePath,this.objNode);
				mapToolList.toolShape = polylinePath;
			}

			endPoint = map.Dom.newGroup(this.objNode,"endpoint"+String(Math.random())+':maptoolnode');
			endPoint.setAttributeNS(szMapNs,'menu','maptoolmenu');
			map.Dom.newShape('circle',endPoint,0,0,map.Scale.normalX(5.5),this.szFillBgStyle);
			map.Dom.newShape('line',endPoint,-map.Scale.normalX(10),0,map.Scale.normalX(10),0,this.szLineStyleLite);
			map.Dom.newShape('line',endPoint,0,-map.Scale.normalY(10),0,map.Scale.normalY(10),this.szLineStyleLite);
			map.Dom.newShape('circle',endPoint,0,0,map.Scale.normalX(3.7),this.szLineStyle);
			endPoint.fu.setPosition(mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y);

			break;

		case "measurement":
		case "measurebuffer":
		case "selectbuffer":
			mouseObject = new MouseObject(evt,null);
			mouseObject.parent = this;

			map.Dom.newShape('circle',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(1),this.szLineBgStyle);
			map.Dom.newShape('circle',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(1),(this.szType=="measurebuffer"||this.szType=="selectbuffer")?this.szBufferStyle:this.szLineStyle);
			map.Dom.newShape('line',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,this.szLineBgStyle);
			map.Dom.newShape('line',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,this.szLineStyle);

			textObj = map.Dom.newGroup(this.objNode,"distance-text"+String(Math.random()));
			map.Dom.newShape('rect',textObj,mouseObject.mouseStartPosition.x+map.Scale.normalX(5),mouseObject.mouseStartPosition.y-map.Scale.normalY(5)-map.Scale.normalY(this.nFontSize*6/7),0,map.Scale.normalY(this.nFontSize),this.szFillBgStyle);
			map.Dom.newText(textObj,mouseObject.mouseStartPosition.x+map.Scale.normalX(5),mouseObject.mouseStartPosition.y-map.Scale.normalY(5),this.szTextStyle,"test");

			endPoint = map.Dom.newGroup(this.objNode,"endpoint"+String(Math.random()));
			map.Dom.newShape('circle',endPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(5.5),this.szFillBgStyle);
			map.Dom.newShape('line',endPoint,mouseObject.mouseStartPosition.x-map.Scale.normalX(10),mouseObject.mouseStartPosition.y,mouseObject.mouseStartPosition.x+map.Scale.normalX(10),mouseObject.mouseStartPosition.y,this.szLineStyleLite);
			map.Dom.newShape('line',endPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y-map.Scale.normalX(10),mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y+map.Scale.normalX(10),this.szLineStyleLite);
			map.Dom.newShape('circle',endPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(3.7),this.szLineStyle);

			startPoint = map.Dom.newGroup(this.objNode,"startpoint"+String(Math.random()));
			map.Dom.newShape('circle',startPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(5.5),this.szFillBgStyle);
			map.Dom.newShape('line',startPoint,mouseObject.mouseStartPosition.x-map.Scale.normalX(10),mouseObject.mouseStartPosition.y,mouseObject.mouseStartPosition.x+map.Scale.normalX(10),mouseObject.mouseStartPosition.y,this.szLineStyleLite);
			map.Dom.newShape('line',startPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y-map.Scale.normalX(10),mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y+map.Scale.normalX(10),this.szLineStyleLite);
			map.Dom.newShape('circle',startPoint,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,map.Scale.normalX(3.7),this.szLineStyle);
			break;
		case "zoomrect":
		case "selectrect":
			mouseObject = new MouseObject(evt,null);
			mouseObject.parent = this;
			map.Dom.newShape('rect',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,10,10,this.szLineBgStyle);
			map.Dom.newShape('rect',this.objNode,mouseObject.mouseStartPosition.x,mouseObject.mouseStartPosition.y,10,10,this.szLineStyle);
			break;
		case "pan":
			mouseObject = new MouseObject(evt,null);
			mouseObject.parent = this;
			this.beginPan(evt);
			break;
	}
	/** backlink to the object, that controls all active tools
	 * @type MapToolList 
	 */
	this.mapToolList = mapToolList;
	mapToolList.add(this,nPos); 
};
/**
 * reactivate a map tool element  
 * @param evt the actual event
 */
MapTool.prototype.onMouseDown = function(evt){
	var mapObject = new MapObject(evt.target);
	if ( mapObject ){
		mouseObject = new MouseObject(evt,mapObject.objNode);
		mouseObject.parent =this;
	}
	return;
};
/**
 * move the map tool element;
 * calls the {@link #redraw} method 
 * @param evt the actual event
 */
MapTool.prototype.onMouseMove = function(evt){

	var toolNodes = null;
	var i;
	var newMousePosition = map.Scale.getClientMousePosition(evt,SVGToolsGroup);
	var deltaX = newMousePosition.x-mouseObject.mouseStartPosition.x;
	var deltaY = newMousePosition.y-mouseObject.mouseStartPosition.y;

	switch (this.szType){
		case "coord":
			toolNodes = this.objNode.childNodes;
			i=0;
			var ctextNode   = toolNodes.item(i++);
			var cmarkerNode = toolNodes.item(i++);

			newMousePosition = map.Scale.clipWidgetPositionToMap(newMousePosition);
			cmarkerNode.fu.setPosition(newMousePosition.x,newMousePosition.y);

			this.redraw();

			break;
		case "measurement":
		case "measurebuffer":
		case "selectbuffer":
			toolNodes = this.objNode.childNodes;
			i=0;
			var circleBgNode = toolNodes.item(i++);
			var circleNode = toolNodes.item(i++);
			var lineBgNode   = toolNodes.item(i++);
			var lineNode   = toolNodes.item(i++);
			var textNode   = toolNodes.item(i++);
			var markerNode = toolNodes.item(i++);
			circleBgNode.setAttributeNS(null,"r",String(Math.sqrt(deltaX*deltaX+deltaY*deltaY)));
			circleNode.setAttributeNS(null,"r",String(Math.sqrt(deltaX*deltaX+deltaY*deltaY)));
			lineBgNode.setAttributeNS(null,"x2",String(newMousePosition.x));
			lineBgNode.setAttributeNS(null,"y2",String(newMousePosition.y));
			lineNode.setAttributeNS(null,"x2",String(newMousePosition.x));
			lineNode.setAttributeNS(null,"y2",String(newMousePosition.y));

			markerNode.fu.setPosition(deltaX,deltaY);
			textNode.fu.setPosition(deltaX/2,deltaY/2);

			var bgRect = textNode.firstChild;
			var textA = textNode.firstChild;
			var nDistance = map.Scale.getDistanceInMeter(mouseObject.mouseStartPosition.x,
																	mouseObject.mouseStartPosition.y,
																	newMousePosition.x,
																	newMousePosition.y);
			textA.firstChild.nodeValue = map.Scale.formatDistanceString(nDistance);
			var bBox = map.Dom.getBox(textA);
			bgRect.setAttributeNS(null,"width",bBox.width);
			break;
		case "zoomrect":
		case "selectrect":
			toolNodes = this.objNode.childNodes;
			i=0;
			var rectBgNode = toolNodes.item(i++);
			var rectNode = toolNodes.item(i++);
			rectBgNode.setAttributeNS(null,"width" ,String(Math.max(1,deltaX)));
			rectBgNode.setAttributeNS(null,"height",String(Math.max(1,deltaY)));
			rectNode.setAttributeNS(  null,"width" ,String(Math.max(1,deltaX)));
			rectNode.setAttributeNS(  null,"height",String(Math.max(1,deltaY)));
			break;
		case "pan":
			if ( fPDFEmbed || !fPanToolByViewer ){
				// here we take the mouse position relative to the widget layer (antizoomandpan), the old position is actualized
				map.Zoom.doPanMap(deltaX/map.Scale.normalX(1),deltaY/map.Scale.normalY(1));
				mouseObject.mouseStartPosition.x = newMousePosition.x;
				mouseObject.mouseStartPosition.y = newMousePosition.y;
			}
			else{
				// here we take the mouse position absolute, and don't actualize the old position, because the SVG is shifted by the viewer
				newMousePosition = map.Scale.getClientMousePosition(evt,null);
				deltaX = newMousePosition.x-mouseObject.mouseStartPosition.x;
				deltaY = newMousePosition.y-mouseObject.mouseStartPosition.y;
				map.Zoom.doPanMapByViewer(deltaX/map.Scale.normalX(1),deltaY/map.Scale.normalY(1));
			}
			break;
		case "polyline":
		case "polygon":
			var pmarkerNode = this.objNode.firstChild;
			pmarkerNode.fu.setPosition(newMousePosition.x,newMousePosition.y);

			this.redraw();

			break;
	}
};
/**
 * move the mouse object 
 * @param evt the actual event
 */
MapTool.prototype.onMouseUp = function(evt){
	var toolNode = null;
	var i = 0;
	switch (this.szType){
		case "coord":
			this.redraw();
			break;
		case "polyline":
		case "polygon":
			this.redraw();
			break;
		case "pan":
			displayMessage("please wait ...",500);
			setTimeout("map.Event.doDefaultZoom(null)",fPanToolByViewer?5:200);
			this.endPan(evt);
			break;
		case "measurement":
		case "measurebuffer":
			toolNodes = this.objNode.childNodes;
			i=0;
			if (this.szType == "measurement" ){
				var circleBgNode = toolNodes.item(i++);
				var circleNode = toolNodes.item(i++);
				circleBgNode.parentNode.removeChild(circleBgNode);
				circleNode.parentNode.removeChild(circleNode);
			}
			break;
		case "selectbuffer":
			toolNodes = this.objNode.childNodes;
			i=0;
			var circleBgNode = toolNodes.item(i++);
			var circleNode = toolNodes.item(i++);
			var szSelectId = circleNode.parentNode.getAttributeNS(null,"id")+":shape";
			circleNode.setAttributeNS(null,"id",szSelectId);
			var newSelection = map.Selections.newSelection("activeLayer",szSelectId,"type:circle");
			if (newSelection){
				newSelection.mapTool = this;
			}
			else{
				this.remove();
			}
			break;
		case "selectrect":
			toolNodes = this.objNode.childNodes;
			i=0;
			var rectBgNode = toolNodes.item(i++);
			var rectNode = toolNodes.item(i++);
			var szSelectId = rectNode.parentNode.getAttributeNS(null,"id")+":shape";
			rectNode.setAttributeNS(null,"id",szSelectId);
			var newSelection = map.Selections.newSelection("activeLayer",szSelectId,"type:square");
			if (newSelection){
				newSelection.mapTool = this;
			}
			else{
				this.remove();
			}
			break;
		case "zoomrect":
			toolNodes = this.objNode.childNodes;
			i=0;
			var rectBgNode = toolNodes.item(i++);
			var rectZoom = map.Dom.getBox(rectBgNode);
			this.objNode.parentNode.removeChild(this.objNode);
			map.Zoom.doZoomMapToWidgetRect(rectZoom);
			setMapTool(""); // test 
			break;
	}
};
/**
 * begin panning: hide the toolsGroup, ...
 * @param evt the actual event
 */
MapTool.prototype.beginPan = function(evt){
	if ( fPanToolByViewer && fPanHideTools && !fPDFEmbed ){
		this.endPanTimeout = false;
		map.Zoom.activateClipping(evt);
		this.hideTools(evt);
	}
	try {
		if ( HTMLWindow.ixmaps.htmlgui_isHTMLMapVisible() ){
			map.hideAll();
		}else{ 
			this.hideLayer(evt);
		}
	} catch (e) {
		this.hideLayer(evt);
	}
	map.Label.stopProcessing();
};
/**
 * end panning: hide the toolsGroup, ...
 * @param evt the actual event
 */
MapTool.prototype.endPan = function(evt){
	if( fEndPan != "delayed"){
		if ( fPanToolByViewer && fPanHideTools && !fPDFEmbed ){
			map.Zoom.removeClipping(evt);
			setTimeout("mapTool.showTools(null)",5);
		}
		setTimeout("mapTool.showLayer(null)",50);
		setTimeout("map.showAll()",250);
	}
	else{
		this.endPanTimeout = true;
		setTimeout("mapTool.doEndPan(null)",500);
	}
};
/**
 * end panning: hide the toolsGroup, ...
 * @param evt the actual event
 */
MapTool.prototype.doEndPan = function(evt){
	if ( this.endPanTimeout == true) {
		if ( fPanToolByViewer && fPanHideTools && !fPDFEmbed ){
			map.Zoom.removeClipping(evt);
			this.showTools(evt);
		}
		this.showLayer(evt);
		this.endPanTimeout = false;
		try{
			map.Themes.actualizeActiveTheme();
		}
		catch (e){
		}
		_TRACE("! doEndPan on timeout done");
	}
};
/**
 * hide the toolsGroup 
 * @param evt the actual event
 */
MapTool.prototype.hideTools = function(evt){
	if ( !this.toolsHidden || (this.toolsHidden == false) ){
		antiZoomAndPanList.setDisplay(evt,'none');
		this.toolsHidden = true;
		_TRACE("hideTools done");
	}
};
/**
 * show the toolsGroup (delayed)
 * @param evt the actual event
 */
MapTool.prototype.showTools = function(evt){
	if ( this.toolsHidden == true ) {
		antiZoomAndPanList.setDisplay(evt,'inline');
		this.toolsHidden = false;
		_TRACE("showTools done");
	}
};
/**
 * show hide spezific layer (with flag: invisiblepan) 
 * @param evt the actual event
 */
MapTool.prototype.hideLayer = function(evt){
	for ( a in map.Layer.listA ){
		var layerItem = map.Layer.listA[a];
		if ( layerItem.szFlag.match(/invisiblepan/) ){
			if ( map.Tiles && map.Tiles.nCount > 0 ){
				var szTilesIdA  = map.Tiles.getTileNodeIds(a);
				for ( var j=0; j<szTilesIdA.length; j++ ){
					var szId = szTilesIdA[j];
					featureNode = SVGDocument.getElementById(szId);
					if ( featureNode ){
						layerItem.szBeforeHideStyle = featureNode.style.getPropertyValue('display');
						featureNode.style.setProperty('display','none',"");
					}
					featureNode = SVGDocument.getElementById(szId+":label");
					if ( featureNode ){
						layerItem.szBeforeHideLabelStyle = featureNode.style.getPropertyValue('display');
						featureNode.style.setProperty('display','none',"");
					}
					featureNode = SVGDocument.getElementById(szId+":label:bg");
					if ( featureNode ){
						layerItem.szBeforeHideLabelStyle = featureNode.style.getPropertyValue('display');
						featureNode.style.setProperty('display','none',"");
					}
				}
			}
			featureNode = SVGDocument.getElementById(a);
			if (featureNode){
				layerItem.szBeforeHideStyle = featureNode.style.getPropertyValue('display');
				featureNode.style.setProperty('display','none',"");
			}
			featureNode = SVGDocument.getElementById(a+":label");
			if (featureNode){
				layerItem.szBeforeHideLabelStyle = featureNode.style.getPropertyValue('display');
				featureNode.style.setProperty('display','none',"");
			}
			featureNode = SVGDocument.getElementById(a+":label:bg");
			if (featureNode){
				layerItem.szBeforeHideLabelStyle = featureNode.style.getPropertyValue('display');
				featureNode.style.setProperty('display','none',"");
			}
		}
	}
	_TRACE("hideLayer done");
};
/**
 * show the before hidden layer
 * @param evt the actual event
 */
MapTool.prototype.showLayer = function(evt){
	for ( a in map.Layer.listA ){
		var layerItem = map.Layer.listA[a];
		if ( layerItem.szFlag.match(/invisiblepan/) ){
			if ( map.Tiles && map.Tiles.nCount > 0 ){
				var szTilesIdA  = map.Tiles.getTileNodeIds(a);
				for ( var j=0; j<szTilesIdA.length; j++ ){
					var szId = szTilesIdA[j];
					featureNode = SVGDocument.getElementById(szId);
					if ( featureNode ){
						if (layerItem.szBeforeHideStyle.length){
							featureNode.style.setProperty('display',layerItem.szBeforeHideStyle,"");
						}
						else{
							featureNode.style.removeProperty('display');
						}
					}
					featureNode = SVGDocument.getElementById(szId+":label");
					if ( featureNode ){
						if (layerItem.szBeforeHideLabelStyle.length){
							featureNode.style.setProperty('display',layerItem.szBeforeHideLabelStyle,"");
						}
						else{
							featureNode.style.removeProperty('display');
						}
					}
					featureNode = SVGDocument.getElementById(szId+":label:bg");
					if ( featureNode ){
						if (layerItem.szBeforeHideLabelStyle.length){
							featureNode.style.setProperty('display',layerItem.szBeforeHideLabelStyle,"");
						}
						else{
							featureNode.style.removeProperty('display');
						}
					}
				}
			}
			featureNode = SVGDocument.getElementById(a);
			if (featureNode){
					if (layerItem.szBeforeHideStyle.length){
						featureNode.style.setProperty('display',layerItem.szBeforeHideStyle,"");
					}
					else{
						featureNode.style.removeProperty('display');
					}
			}
			featureNode = SVGDocument.getElementById(a+":label");
			if (featureNode){
				if (layerItem.szBeforeHideLabelStyle.length){
					featureNode.style.setProperty('display',layerItem.szBeforeHideLabelStyle,"");
				}
				else{
					featureNode.style.removeProperty('display');
				}
			}
			featureNode = SVGDocument.getElementById(a+":label:bg");
			if (featureNode){
				if (layerItem.szBeforeHideLabelStyle.length){
					featureNode.style.setProperty('display',layerItem.szBeforeHideLabelStyle,"");
				}
				else{
					featureNode.style.removeProperty('display');
				}
			}
		}
	}
	_TRACE("showLayer done");
};
/**
 * redraw the tool
 * @param evt the actual event
 */
MapTool.prototype.redraw = function(evt){

	switch (this.szType){

		case "polygon":
			var szPolygonId = "maptools_polypath";
			var polygonPath = SVGDocument.getElementById(szPolygonId);
			if ( polygonPath == null ){
				break;
			}
			var ptList = new Array(0);
			var toolsA = this.mapToolList.toolsA;
			szD = "";
			var pmarkerNode = toolsA[0].objNode.firstChild;
			pmarkerNode.fu = new Methods(pmarkerNode);
			var	ptMarker = pmarkerNode.fu.getPosition();
			ptList[ptList.length] = ptMarker;
			szD += "M"+ptMarker.x+","+ptMarker.y;
			for ( i=1; i<toolsA.length; i++ ){
				pmarkerNode = toolsA[i].objNode.firstChild;
				pmarkerNode.fu = new Methods(pmarkerNode);
				ptMarker = pmarkerNode.fu.getPosition();
				ptList[ptList.length] = ptMarker;
				szD += " "+ptMarker.x+","+ptMarker.y;
			}
			szD += "z";
			polygonPath.setAttributeNS(null,"d",szD);

			// GR 28.03.2012 phantom points at half line for new points
			// ---------------------------------------------------------
			var phantomPointGroup = SVGDocument.getElementById("maptools_phantomPointGroup");
			if ( !phantomPointGroup ){
				phantomPointGroup = map.Dom.newGroup(this.objNode,"maptools_phantomPointGroup");
			}else{
				map.Dom.clearGroup(phantomPointGroup);
			}
			for ( i=0; i<ptList.length; i++ ){
				x = ptList[i].x + (ptList[((i<ptList.length-1)?i+1:0)].x - ptList[i].x)/2;
				y = ptList[i].y + (ptList[((i<ptList.length-1)?i+1:0)].y - ptList[i].y)/2;
				var newPoint = map.Dom.newShape('circle',phantomPointGroup,x,y,map.Scale.normalX(10),"fill:white;stroke:none;opacity:0.1;");
								map.Dom.newShape('circle',phantomPointGroup,x,y,map.Scale.normalX(2),this.szPolygonStyle+"pointer-events:none;");
				newPoint.setAttributeNS(szMapNs,"tooltip","click to add point");
				newPoint.setAttributeNS(null,"onmousedown","new MapTool(evt,'polygon',"+(i+1)+")");
			}
			// --------------------------------------------------------

			var szPolygonTextId = "maptools_polygon_text";
			var textGroup = map.Dom.getObjectById(szPolygonTextId);
			if ( !textGroup ){
				textGroup = map.Dom.newGroup(SVGToolsGroup,"maptools_polygon_text");
			}
			else{
				map.Dom.clearGroup(textGroup);
			}

			var ptText = __doGetPolygonCenter(ptList);
			var nSurface = Math.abs(__doGetPolygonSurface(ptList,true));

			var textField = new TextField(evt,textGroup,"maptooltext_template",18);
			textField.setText(map.Scale.formatSurfaceString(nSurface));
			var bBox = textField.textGroup.fu.getBox();
			textField.setPosition(ptText.x-bBox.width/2,ptText.y-bBox.height/2);

			break;

		case "polyline":

			var szPolylineId = "maptools_polypath";
			var polylinePath = SVGDocument.getElementById(szPolylineId);
			if ( polylinePath == null ){
				break;
			}
			var ptList = new Array(0);
			var ltoolsA = this.mapToolList.toolsA;
			szD = "";
			var lpmarkerNode = ltoolsA[0].objNode.firstChild;
			lpmarkerNode.fu = new Methods(lpmarkerNode);
			var	lptMarker = lpmarkerNode.fu.getPosition();
			ptList[ptList.length] = lptMarker;
			szD += "M"+lptMarker.x+","+lptMarker.y;
			for ( i=1; i<ltoolsA.length; i++ ){
				lpmarkerNode = ltoolsA[i].objNode.firstChild;
				lpmarkerNode.fu = new Methods(lpmarkerNode);
				lptMarker = lpmarkerNode.fu.getPosition();
				szD += " "+lptMarker.x+","+lptMarker.y;
				ptList[ptList.length] = lptMarker;
			}
			polylinePath.setAttributeNS(null,"d",szD);

			// GR 28.03.2012 phantom points at half line for new points
			// ---------------------------------------------------------
			var phantomPointGroup = SVGDocument.getElementById("maptools_phantomPointGroup");
			if ( !phantomPointGroup ){
				phantomPointGroup = map.Dom.newGroup(this.objNode,"maptools_phantomPointGroup");
			}else{
				map.Dom.clearGroup(phantomPointGroup);
			}
			for ( i=0; i<ptList.length-1; i++ ){
				x = ptList[i].x + (ptList[i+1].x - ptList[i].x)/2;
				y = ptList[i].y + (ptList[i+1].y - ptList[i].y)/2;
				var newPoint = map.Dom.newShape('circle',phantomPointGroup,x,y,map.Scale.normalX(2),this.szPolygonStyle);
				newPoint.setAttributeNS(szMapNs,"tooltip","click to add point");
				newPoint.setAttributeNS(null,"onmousedown","new MapTool(evt,'polyline',"+(i+1)+")");
			}
			// --------------------------------------------------------

			var szPolylineTextId = "maptools_polyline_textgroup";
			textGroup = SVGDocument.getElementById(szPolylineTextId);
			if ( !textGroup ){
				textGroup = map.Dom.newGroup(this.objNode,szPolylineTextId);
			}
			else{
				map.Dom.clearGroup(textGroup);
			}
			var nSum = 0;
			for ( i=1; i<ltoolsA.length; i++ ){
				var nDistance = 0;

				var startNode = ltoolsA[i-1].objNode.firstChild;
				var endNode   = ltoolsA[i].objNode.firstChild;
				var startPos  = startNode.fu.getPosition();
				var endPos    = endNode.fu.getPosition();
				nSum += nDistance = map.Scale.getDistanceInMeter(startPos.x,
															startPos.y,
															endPos.x,
															endPos.y);

				textField = new TextField(evt,textGroup,"maptooltext_template",12);
				textField.setText(map.Scale.formatDistanceString(nDistance));
				textField.setPosition(startPos.x+(endPos.x-startPos.x)/2,startPos.y+(endPos.y-startPos.y)/2);
			}

			endPos   = ltoolsA[ltoolsA.length-1].objNode.firstChild.fu.getPosition();

			textField = new TextField(evt,textGroup,"maptooltext_template",18);
			textField.setText(map.Scale.formatDistanceString(nSum));
			textField.setPosition(endPos.x+map.Scale.normalX(5),endPos.y);
			textField.textGroup.setAttributeNS(szMapNs,"menu","polylinemenu");
			break;

		case "coord":

			var toolNodes = this.objNode.childNodes;
			i=0;
			var ctextNode   = toolNodes.item(i++);
			var cmarkerNode = toolNodes.item(i++);
			var newMousePosition = cmarkerNode.fu.getPosition();

			var cbgRect = ctextNode.firstChild;
			var textX  = cbgRect.nextSibling;
			var textY  = textX.nextSibling;
			var mapPos   = map.Scale.getMapPosition(newMousePosition.x,newMousePosition.y);
			var mapCoord = map.Scale.getMapCoordinate(mapPos.x,mapPos.y);
				mapCoord = map.Scale.getGeoCoordinateOfPoint(mapCoord.x,mapCoord.y);

			var szTextX = "X="+String(mapCoord.x);
			var szTextY = "Y="+String(mapCoord.y);
			
			textX.firstChild.nodeValue = szTextX ;
			textY.firstChild.nodeValue = szTextY ;
			var bBoxX = map.Dom.getBox(textX);
			var bBoxY = map.Dom.getBox(textY);
			textX.setAttributeNS(null,"y",Number(bBoxX.height));
			textY.setAttributeNS(null,"y",Number(bBoxX.y)+Number(bBoxX.height)+Number(bBoxY.height)+map.Scale.normalY(3));
			cbgRect.setAttributeNS(null,"width" ,bBoxX.width);
			cbgRect.setAttributeNS(null,"height",Number(bBoxX.height)+Number(bBoxY.height)+map.Scale.normalY(3));

			var position = new point(newMousePosition.x,newMousePosition.y);
			var offset = new point(map.Scale.normalX(5),map.Scale.normalY(5));
			var newPosition = map.Scale.clipWidgetObjectToMap(ctextNode,position,offset);
			ctextNode.fu.setPosition(newPosition.x,newPosition.y);
			break;
	}
};
/**
 * remove this mapTool
 * @param evt the actual event
 */
MapTool.prototype.remove = function(evt){
	this.objNode.parentNode.removeChild(this.objNode);
};
/**
 * alert with the polygon path (for test only) 
 * @param evt the actual event
 */
MapTool.prototype.printPolygon = function(evt){
	var szPolygonId = "maptools_polygon";
	var polygonPath = SVGDocument.getElementById(szPolygonId);
	if ( polygonPath ){
		alert(printNode(polygonPath));
	}
};

/**
 * activate map tool
 * @param szType string that describes the tool type ( "zoomarea",...)
 */
setMapTool = function(szType){
	map.Layer.setPointerEvents(null);

	if ( (szType == "info") && (szMapToolType == "info") ){
		deactivateTheme(_activeTheme);
	}
	if ( (szType == "pan") ){
		deactivateTheme(_activeTheme);
	}
	if (szType == "overviewmap" ){
		map.Zoom.showOverviewMap();
		return;
	}

	// GR 12.07.2013 clear overlays
	killTooltip();
	killInfo();

	map.Dom.clearGroup(SVGMenuGroup);
	map.Dom.clearGroup(SVGToolsGroup);
	mapToolList.clear();
	szMapToolType = szType;
	if (fPDFEmbed && fSetToolCursor){
		setTimeout("setMapToolCursor('"+szType+"')",100);
	}
	try{
		HTMLWindow.ixmaps.htmlgui_setMapTool(szType);
	}
	catch (e){
	}

};
/**
 * get actual map tool name
 * @type string
 * @return string that describes the tool type ( "zoomarea",...)
 */
getMapTool = function(){
	return szMapToolType;
};

/**
 * set map cursor according active tool
 * @param szType string that describes the tool type ( "zoomarea",...)
 */
setMapToolCursor = function(szType){
	var cursorGroup = null;
	cursorGroup = SVGDocument.getElementById('mapbackground');
	if (cursorGroup){
		cursorGroup.setAttributeNS(null,'cursor','url(#'+szType+'_cursor)');
	}
	cursorGroup = SVGDocument.getElementById('mapcanvas');
	if (cursorGroup){
		cursorGroup.setAttributeNS(null,'cursor','url(#'+szType+'_cursor)');
	}
	if (SVGToolsGroup){
		SVGToolsGroup.setAttributeNS(null,'cursor','url(#'+szType+'_cursor)');
	}
};
/**
 * set map cursor according active tool
 * @param szType string that describes the tool type ( "zoomarea",...)
 */
var _lastActiveToolBgNode = null;
setMapToolActive = function(szType){
	if (_lastActiveToolBgNode){
		_lastActiveToolBgNode.style.setProperty('opacity','0',"");
	}
	var activeNode = null;
	activeNode = SVGDocument.getElementById('legend:activatetool:'+szType);
	if (activeNode){
		var bgNode = activeNode.getElementsByTagName("rect").item(0);
		if (bgNode){
			bgNode.style.setProperty('opacity','1',"");
			bgNode.style.setProperty('fill','#eeeeff',"");
			bgNode.style.setProperty('stroke','#0000ff',"");
			bgNode.style.setProperty('stroke-width','0.5',"");
			_lastActiveToolBgNode = bgNode;
		}
	}
};

/*
@ -----------------------------------------------------------------------------
@ T e x t   F i e l d  
@ -----------------------------------------------------------------------------
*/

/**
 * Create a new TextField instance.  
 * @class It realizes a text field with background rect using a loaded template; if the template is not found, it is created.
 * @constructor
 * @throws 
 * @return A new TextField
 * @param evt the actual event
 * @param targetGroup the DOM node to create the text field within
 * @param szTemplate the Id of the template to use
 * @param nFontSize [optional] font size different from the templates fontsize
 */
TextField = function(evt,targetGroup,szTemplate,nFontSize){
	var textTemplate = SVGDocument.getElementById(szTemplate);
	if (textTemplate){
		this.textGroup = targetGroup.appendChild(textTemplate.cloneNode(1000));
		this.textGroup.fu = new Methods(this.textGroup);
		this.textGroup.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		this.textGroup.setAttributeNS(null,"id",szTemplate+String(Math.random()));
		var rectA = this.textGroup.getElementsByTagName('rect');
		var textA = this.textGroup.getElementsByTagName('text');
		if ( rectA.length > 1){
			this.sdNode   = rectA.item(0);
			this.bgNode   = rectA.item(1);
		}
		else{
			this.bgNode   = rectA.item(0);
		}
		this.textNode = textA.item(0);
		if (nFontSize){
			this.textNode.style.setProperty("font-size",String(nFontSize)+"px","");
		}
		// if there is no workspace group aroud the text node, insert one
		if ( this.textNode.parentNode == this.textGroup ){
			this.workspaceNode = map.Dom.newGroup(this.textGroup,"workspace:"+String(Math.random()));
			this.textGroup.insertBefore(this.workspaceNode,this.textNode);
			this.workspaceNode.appendChild(this.textNode);
		}
		else{
			this.workspaceNode = this.textNode.parentNode;
		}
	}
	else if ( szTemplate == "flat" ){
		this.textGroup = map.Dom.newGroup(targetGroup,"textfield"+String(Math.random()));
		this.textGroup.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		if( fMapBorder3D && SVGDocument.getElementById(szShadowFilterId) ){
			this.sdNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#444444;opacity:0.2;stroke:none");
			this.sdNode.setAttributeNS(null,"rx",nInfoRoundRect*nFontSize/6);
			this.sdNode.setAttributeNS(null,"ry",nInfoRoundRect*nFontSize/6);
		}
		this.bgNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#ffffff;stroke:#888888;stroke-width:2;");
		this.bgNode.setAttributeNS(null,"rx",nInfoRoundRect*nFontSize/6);
		this.bgNode.setAttributeNS(null,"ry",nInfoRoundRect*nFontSize/6);
		this.textNode  = map.Dom.newText(this.textGroup,0,0,"font-family:arial;font-size:"+nFontSize+"px;fill:#888888","");
		this.workspaceNode = this.textNode.parentNode;
		this.textGroup.setAttributeNS(null,"opacity","0.7");
	}
	else if ( szTemplate == "light" ){
		this.textGroup = map.Dom.newGroup(targetGroup,"textfield"+String(Math.random()));
		this.textGroup.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		if( fMapBorder3D && SVGDocument.getElementById(szShadowFilterId) ){
			this.sdNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#444444;opacity:0.2;stroke:none");
			this.sdNode.setAttributeNS(null,"rx",nInfoRoundRect*nFontSize/6);
			this.sdNode.setAttributeNS(null,"ry",nInfoRoundRect*nFontSize/6);
		}
		this.bgNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#fdfdfd;stroke:#888888;stroke-width:0.1;opacity:1;");
		this.bgNode.setAttributeNS(null,"rx",nInfoRoundRect*nFontSize/6);
		this.bgNode.setAttributeNS(null,"ry",nInfoRoundRect*nFontSize/6);
		this.textNode  = map.Dom.newText(this.textGroup,0,0,"font-family:arial;font-size:"+nFontSize+"px;fill:#888888","");
		this.workspaceNode = this.textNode.parentNode;
		this.textGroup.setAttributeNS(null,"opacity","0.95");
	}
	else if ( szTemplate == "alert" ){
		this.textGroup = map.Dom.newGroup(targetGroup,"textfield"+String(Math.random()));
		this.textGroup.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		if( 1 && SVGDocument.getElementById(szShadowFilterId) ){
			this.sdNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#666666;opacity:0.2;stroke:none");
			this.sdNode.setAttributeNS(null,"rx",map.Scale.normalY(0.1));
			this.sdNode.setAttributeNS(null,"ry",map.Scale.normalY(0.1));
		}
		this.bgNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#F9EDB8;stroke:#EDC967;stroke-width:1;opacity:1");
		this.textNode  = map.Dom.newText(this.textGroup,0,0,"font-family:arial;font-size:"+nFontSize+"px;fill:black","");
		this.workspaceNode = this.textNode.parentNode;
	}
	else{
		this.textGroup = map.Dom.newGroup(targetGroup,"textfield"+String(Math.random()));
		this.textGroup.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		this.sdNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#444444;opacity:0.5;stroke:none");
		this.bgNode    = map.Dom.newShape('rect',this.textGroup,0,0,1,1,"fill:#ffffff;stroke:blue;stroke-width:0.1");
		this.sdNode.setAttributeNS(null,"rx",nInfoRoundRect);
		this.sdNode.setAttributeNS(null,"ry",nInfoRoundRect);
		this.bgNode.setAttributeNS(null,"rx",nInfoRoundRect);
		this.bgNode.setAttributeNS(null,"ry",nInfoRoundRect);
		this.textNode  = map.Dom.newText(this.textGroup,0,0,"font-family:arial;font-size:"+nFontSize+"px;fill:black","");
		this.workspaceNode = this.textNode.parentNode;
		if ( szTemplate == "transparent" ){
			this.textGroup.setAttributeNS(null,"opacity","0.4");
			this.sdNode.setAttributeNS(null,"rx",nInfoRoundRect*5);
			this.sdNode.setAttributeNS(null,"ry",nInfoRoundRect*5);
			this.bgNode.setAttributeNS(null,"rx",nInfoRoundRect*5);
			this.bgNode.setAttributeNS(null,"ry",nInfoRoundRect*5);
		}
	}
};
/**
 * set the text of a text field; the background rect is automatically resized
 * @param szText the new content of the text field
 */
TextField.prototype.setText = function(szText){
	try {
		this.textNode.firstChild.nodeValue = szText;
		this.resizeField();
		return true;
	}
	catch(e){return false;}
};
/**
 * set the text of a text field; the background rect is automatically resized
 * @param szText the new content of the text field
 */
TextField.prototype.resizeField = function(){
	try {
		var bBox = map.Dom.getBox(this.workspaceNode);
		if (this.bgNode){
			this.bgNode.setAttributeNS(null,"x",bBox.x-12);
			this.bgNode.setAttributeNS(null,"y",bBox.y-3);
			this.bgNode.setAttributeNS(null,"width",bBox.width+24);
			this.bgNode.setAttributeNS(null,"height",bBox.height+10);
		}
		if (this.sdNode){
			this.sdNode.setAttributeNS(null,"x" ,bBox.x-6+1);
			this.sdNode.setAttributeNS(null,"y" ,bBox.y-3+2);
			this.sdNode.setAttributeNS(null,"width" ,bBox.width +12+1);
			this.sdNode.setAttributeNS(null,"height",bBox.height+6+1);
		}
	}
	catch(e){}
};
/**
 * set the position of the text field
 * @param x the new x position
 * @param y the new y position
 */
TextField.prototype.setPosition = function(x,y){
	this.textGroup.fu.setPosition(x,y);
};

/*
@ -----------------------------------------------------------------------------
@ Scroll Area  
@ -----------------------------------------------------------------------------
*/

/**
 * Create a new ScrollArea instance.  
 * @class It realizes a clipped area, that get scrollbars, if the content exeeds the maximal width or height
 * @constructor
 * @throws 
 * @return A new ScrollArea
 * @param evt the actual event
 * @param targetGroup the DOM node to create the text field within
 * @param szTemplate the Id of the template to use
 * @param nMaxWidth [optional] maximal width, if content exeeds this, a horizontal scrollbar is created
 * @param nMaxHeight [optional] maximal height, if content exeeds this, a vertical scrollbar is created
 * @param nScrollBarWidth [optional] space of the scrollbars created, (default 10 pixel)
 */
ScrollArea = function(evt,targetGroup,szTemplate,nMaxWidth,nMaxHeight,nScrollBarWidth){

	/** maximal width @type int */
	this.nMaxWidth = nMaxWidth?nMaxWidth:100;
	/** maximal width @type int */
	this.nMaxHeight = nMaxHeight?nMaxHeight:100;
	/** 'thickness' of the scroll bars to generate @type int */
	this.nScrollBarWidth = nScrollBarWidth?nScrollBarWidth:10;

	if ( targetGroup == null  ){
		return;
	}

	var szInstance = ":"+String(Math.random());
	var areaTemplate = SVGDocument.getElementById(szTemplate);
	if (areaTemplate){
		/** the created scroll area group @type DOM node */
		this.areaGroup = targetGroup.appendChild(areaTemplate.cloneNode(1000));
		this.areaGroup.fu = new Methods(this.areaGroup);
		this.areaGroup.fu.extendAllIds(this.areaGroup,szInstance);
		/** the group to put in the content @type DOM node */
		this.workspaceNode = SVGDocument.getElementById(szTemplate+":workspace"+szInstance);
		/** the clipping rectangle @type DOM node */
		this.cliprectNode = SVGDocument.getElementById(szTemplate+":cliprect"+szInstance);
	}
	else{
		szTemplate = "scrollarea"; 
		this.areaGroup = map.Dom.newGroup(targetGroup,szTemplate+szInstance);

		var newClipPath = map.Dom.newNode('clipPath',this.areaGroup);
		newClipPath.setAttribute("id",szTemplate+":clippath"+szInstance);
		// for Firefox 1.5.0.1
		newClipPath.setAttribute("style","pointer-events:all");
		this.cliprectNode = map.Dom.newShape('rect',newClipPath,0,0, map.Scale.normalX(this.nMaxWidth), map.Scale.normalY(this.nMaxHeight),"fill:none;stroke:none");
		this.cliprectNode.setAttribute("id",szTemplate+":cliprect"+szInstance);

		this.areaGroup.setAttributeNS(null,"clip-path","url(#"+szTemplate+":clippath"+szInstance+")");
		this.workspaceNode = map.Dom.newGroup(this.areaGroup,szTemplate+":workspace"+szInstance);
	}
	/** the id of the generated scroll area */
	this.szId = szTemplate;
};
/**
 * set the new width to the scroll area
 * @param nWidth the new width
 */
ScrollArea.prototype.setWidth = function(nWidth){
	if (this.cliprectNode){
		this.nMaxWidth = Number(nWidth);
		this.cliprectNode.setAttributeNS(null,"width",map.Scale.normalX(Math.max(this.nMaxWidth,0)));
	}
};
/**
 * set the new height to the scroll area
 * @param nWidth the new heigth
 */
ScrollArea.prototype.setHeight = function(nHeight){
	if (this.cliprectNode){
		this.nMaxHeight = Number(nHeight);
		this.cliprectNode.setAttributeNS(null,"height",map.Scale.normalX(Math.max(this.nMaxHeight,0)));
	}
};
/**
 * set the position of the scroll area
 * @param x the new x position
 * @param y the new y position
 */
ScrollArea.prototype.setPosition = function(x,y){
	if (this.areaGroup){
		this.areaGroup.fu.setPosition(x,y);
	}
};
/**
 * reformat the scroll area; create or remove scrollbars
 * @param evt the actual event
 */
ScrollArea.prototype.reformat = function(evt){

	if ( this.scrollObj ){
		this.scrollObj.remove(evt);
		this.scrollObj = null;
	}
	var maxBox = new box(0,0,map.Scale.normalX(this.nMaxWidth),map.Scale.normalY(this.nMaxHeight));
	var contOff = getTranslate(this.workspaceNode);
	// GR 26.04.2011 width or height < 0 = dont care
	if ( this.nMaxWidth < 0 || this.nMaxHeight < 0 ){
		var contBox = map.Dom.getBox(this.workspaceNode);
		maxBox.width  = this.nMaxWidth >=0?maxBox.width :contBox.width +map.Scale.normalX(this.nScrollBarWidth+5);
		maxBox.height = this.nMaxHeight>=0?maxBox.height:contBox.height+map.Scale.normalY(this.nScrollBarWidth+5);
		this.cliprectNode.setAttributeNS(null,"width",maxBox.width);
		this.cliprectNode.setAttributeNS(null,"height",maxBox.height);
	}
	this.scrollObj = new ScrollBar(this.workspaceNode,new point(contOff.x,contOff.y),maxBox,map.Scale.normalX(this.nScrollBarWidth),map.Scale.normalY(this.nScrollBarWidth),map.Scale.normalX(1) );
	if ( this.scrollObj ){
		this.scrollObj.draw(evt);
	}
};
/**
 * remove the scroll area; remove scrollbars
 * @param evt the actual event
 */
ScrollArea.prototype.remove = function(evt){

	if ( this.scrollObj ){
		this.scrollObj.remove(evt);
		this.scrollObj = null;
	}
	if ( this.areaGroup ){
		this.areaGroup.parentNode.removeChild(this.areaGroup);
		this.areaGroup = null;
	}
};
/**
 * inform about scrollbars and state
 * @param evt the actual event handle
 * @type boolean
 * @return true or false
 */
ScrollArea.prototype.hasScrollBars = function(evt) {
	if ( !this.scrollObj ){
		return false;
	}
	return 	this.scrollObj.hasScrollBars();
};
/**
 * get the real width to the scroll area
 * @type integer
 * @return the realized and cliped width
 */
ScrollArea.prototype.getWidth = function(){
	if (this.cliprectNode){
		return Number(this.cliprectNode.getAttributeNS(null,"width"))/map.Scale.normalX(1);
	}
	return 0;
};
/**
 * set the real height to the scroll area
 * @type integer
 * @return the realized and cliped height
 */
ScrollArea.prototype.getHeight = function(){
	if (this.cliprectNode){
		return Number(this.cliprectNode.getAttributeNS(null,"height"))/map.Scale.normalY(1);
	}
	return 0;
};
/**
 * set the scroll area position
 * @param ptValue the new value as point object ( .x [0...1] , .y [0...1] ) 
 * @type void
 */
ScrollArea.prototype.setScrollPosition = function(ptPosition){
	if ( this.scrollObj && this.scrollObj.vThumbObj ){
		this.scrollObj.vThumbObj.setValue(ptPosition);
	}
	if ( this.scrollObj && this.scrollObj.hThumbObj ){
		this.scrollObj.hThumbObj.setValue(ptPosition);
	}
};

// .............................................................................
// h i g h l i g h t i n g  (change style of shape) and selecting    
// .............................................................................

var allHighLights = new Array(0);
map.removeAllHighlights = function(){
	for ( var i=0; i<allHighLights.length; i++ ){
		if (allHighLights[i]){
			allHighLights[i].unlock();
			allHighLights[i].removeAll();
		}
	}
	allHighLights.length=0;
}
/**
 * Create a new HighLigh instance.  
 * @class It realizes an object for highlighting map items
 * @constructor
 * @throws 
 * @return A new HighLight Object
 */
HighLight = function(){
	/** array that holds all actual {@link HighLightItem} objects @type array */
	this.itemA = new Array(0);
	allHighLights[allHighLights.length] = this;
};
/**
 * adds one item; creates new HighLightItem object and adds it to the list
 * @param itemNode the SVG node to be highlighted
 * @return the node, if it has been highlighted, or null	
 */
HighLight.prototype.addItem = function(itemNode,szMode){
	for (var i=0; i<this.itemA.length; i++){
		if (this.itemA[i].node == itemNode){
			return null;
		}
	}
	var newHighLightItem = new HighLightItem(itemNode,szMode);
	if (newHighLightItem){
		this.itemA[this.itemA.length] = newHighLightItem;
		return newHighLightItem.node;
	}
	return null;
};
/**
 * checks if item highlighted
 * @param itemNode the SVG node to be checked
 * @type boolean
 * @return true, if the node is highlighted	
 */
HighLight.prototype.checkItem = function(itemNode){
	for (var i=0; i<this.itemA.length; i++){
		if (this.itemA[i].node == itemNode){
			return true;
		}
	}
	return false;
};
/**
 * remove this item from the list
 * @param itemNode the SVG node to be removed from the list of highlighted items
 */
HighLight.prototype.removeItem = function(itemNode){
	itemNode = map.Layer.getLayerItemNodeOfNode(itemNode);
	for (var i=0; i<this.itemA.length; i++){
		if (this.itemA[i].node == itemNode){
			this.itemA[i].removeHighLight();
			for(; i<this.itemA.length-1; i++){
				this.itemA[i] = this.itemA[i+1];
			}
			this.itemA.length = this.itemA.length-1;
		}
	}
};
/**
 * remove highlight from all highlight items
 */
HighLight.prototype.offAll = function(){
	for (var i=0; i<this.itemA.length; i++){
		this.itemA[i].removeHighLight();
	}
};
/**
 * show highlight style on all highlight items
 */
HighLight.prototype.onAll = function(){
	for (var i=0; i<this.itemA.length; i++){
		this.itemA[i].doHighLight();
	}
};
var __highlightObject = null;
/**
 * start toggle highlighting on all highlight items; start 'blinking'
 */
HighLight.prototype.startToggle = function(){
	if ( nHighlightToggle > 0 ){
		this.toggleCount = nHighlightToggle*2;
		__highlightObject = this;
		setTimeout("__highlightObject.toggleAll()",1000);
	}
};
/**
 * toggle all highlight items; realizes 'blinking'
 */
HighLight.prototype.toggleAll = function(){
	for (var i=0; i<this.itemA.length; i++){
		if (this.itemA[i].highlighted){
			this.itemA[i].removeHighLight();
		}
		else{
			this.itemA[i].doHighLight();
		}
	}
	if ( --this.toggleCount > 0 ){
		setTimeout("__highlightObject.toggleAll()",500);
	}
};
/**
 * remove all highlight items
 */
HighLight.prototype.removeAll = function(){
	if ( this.fLock ){
		return;
	}
	for (var i=0; i<this.itemA.length; i++){
		this.itemA[i].removeHighLight();
	}
	this.itemA.length = 0;
};
/**
 * lock highlight list
 */
HighLight.prototype.lock = function(){
	this.fLock = true;
};
/**
 * unlock highlight list
 */
HighLight.prototype.unlock = function(){
	this.fLock = false;
};
/**
 * Create a new HighLightItem instance.  
 * @class It realizes a highlighted item
 * @constructor
 * @throws 
 * @param itemNode the node to highlight 
 * @return A new HighLightItem Object
 */
function HighLightItem(itemNode,szMode) {
	itemNode = map.Layer.getLayerItemNodeOfNode(itemNode);
	if ( !itemNode ){
		return null;
	}
	/** the DOM node to be highlighted @type DOM node */
	this.node = itemNode;
	/** parameter to set different highlight modes */
	this.szMode = szMode;
	this.doHighLight();
}
/**
 * highlights this item; 
 * does this, by cloning the node into the highlight group of the appropriate layer
 */
HighLightItem.prototype.doHighLight = function(){
	var onoverShape = this.node;
	if (onoverShape){
		var mapObj = new MapObject(onoverShape);
		var layerInfo = map.Layer.getLayerObj(mapObj.szId);
		var szHighlightStyle = layerInfo.szHighlight;
		if (!szHighlightStyle){
			switch ( layerInfo.szType ){
				case "point":
					szHighlightStyle = "filter:url(#Glow);scale:1.5";
					break;
				case "line":
					szHighlightStyle = "fill:none;stroke:yellow;stroke-width:5;stroke-opacity:0.3";
					break;
				case "polygon":
					szHighlightStyle = "fill:yellow";
					break;
			}
		}
		if ( this.szMode && this.szMode == "hint"){
			switch ( layerInfo.szType ){
				case "point":
					szHighlightStyle = "filter:url(#Glow);scale:1.5";
					break;
				case "line":
					szHighlightStyle = "fill:none;stroke:yellow;stroke-width:5;stroke-opacity:0.3";
					break;
				case "polygon":
					szHighlightStyle = "fill:#eeeeff;fill-opacity:0.2;stroke-opacity:0.5;stroke:#eeeeff;stroke-width:1;stroke-linecap:round;stroke-linejoin:round;";
					break;
			}
		}
		szHighlightStyle = __scaleStyleString(szHighlightStyle,map.Scale.normalX(1/map.Zoom.nZoom));
		if (szHighlightStyle){
			var layerNode = onoverShape.parentNode;
			var testNode = layerNode.nextSibling;
			if ( testNode && testNode.nodeType == 1 && testNode.getAttributeNS(null,"id").match(/highlightgroup/) ){
				this.highlightGroup = testNode;
				this.highlightGroup.setAttributeNS(null,"style",szHighlightStyle+";display:inline;pointer-events:none");
			}
			else {
			_TRACE("highlightGroup created");
				this.highlightGroup = map.Dom.newGroup(layerNode.parentNode,layerInfo.szName+":highlightgroup");
				this.highlightGroup = layerNode.parentNode.insertBefore(this.highlightGroup,testNode);
				this.highlightGroup.setAttributeNS(null,"class",layerNode.getAttributeNS(null,"class"));
				this.highlightGroup.setAttributeNS(null,"style",szHighlightStyle+";display:inline;pointer-events:none");
			}
			var clonedNode = onoverShape.cloneNode(1000);
			this.itemNode = this.highlightGroup.appendChild(clonedNode);
			this.itemNode.setAttributeNS(null,"id","");
			if ( szHighlightStyle.match(/fill:/) ){
				this.itemNode.style.removeProperty("fill");
				this.itemNode.style.removeProperty("fill-opacity");
				if (this.itemNode.hasChildNodes ){
					var cNodes = this.itemNode.childNodes;
					for ( var i=0; i<cNodes.length; i++ ){
						if ( cNodes.item(i).nodeType == 1 ){
							cNodes.item(i).style.setProperty("fill","inherit","");
						}
					}
				}
			}
			if ( szHighlightStyle.match(/stroke:/) ){
				this.itemNode.style.removeProperty("stroke");
				if (this.itemNode.hasChildNodes ){
					var cNodes = this.itemNode.childNodes;
					for ( var i=0; i<cNodes.length; i++ ){
						if ( cNodes.item(i).nodeType == 1 ){
							cNodes.item(i).style.setProperty("stroke","none","");
							cNodes.item(i).style.removeProperty("stroke");
						}
					}
				}
			}

			if ( szHighlightStyle.match(/scale:/) ){
				this.itemNode.fu = new Methods(this.itemNode);
				var nScale = parseFloat(szHighlightStyle.split("scale:")[1]);
				if ( isNaN(nScale) || nScale==0 ){
					nScale = 1.5;
				}
				this.itemNode.fu.scaleBy(nScale,nScale);
			}
			this.highlighted = true;
			return true;
		}
		else{
			return false;
		}
	return false;
	}
};
/**
 * remove the highlight effect for this highlight item
 */
HighLightItem.prototype.removeHighLight = function(){
	if (this.highlightGroup){
		this.highlightGroup.removeChild(this.itemNode);
	}
	this.highlighted = false;
};

// .............................................................................
// popup info     
// ..............................................................................

/**
 * Display the info of a map shape as popup textfield at the mouse position.
 * The info text is expected as attribute of the node.
 * The position of the generated popup is automatically corrected, if it exeeds the visual SVG range
 * @param evt the mouse event
 * @param infoShape the map shape to get the 'info' from (as attribute info='...')
 * @param zMode if 'add', the former info displays are not removed
 */
var __info_infoShape = null;
function displayInfo(evt,infoShape,szMode){

	var position = null;
	if (evt){
		position = map.Scale.getClientMousePosition(evt,SVGPopupGroup);
	}
	else{
		position = map.Scale.getScreenPosition(infoShape);
		if ( !map.Scale.isWidgetPositionInMap(position) ){
			return null;
		}
		szMode += "|pointer";
	}

	if ( szMode.match(/delayed/) ){
		killInfo();
		__info_infoShape = infoShape;
		idInfoTimeout = setTimeout("doDisplayInfo("+position.x+","+position.y+",'"+szMode+"')",nInfoTimeout);
	}
	else{
		__info_infoShape = infoShape;
		return doDisplayInfo(position.x,position.y,szMode);
	}
}
/**
 * Clear the info timeout, so a pending info display is not executed.
 * Called if the mouse gets 'out', or before a new info display is defined.
 */
function killInfo(){
	if (idInfoTimeout){
		clearTimeout(idInfoTimeout);
	}
	 __info_infoShape = null;
}
/**
 * Display the info of a map shape as popup textfield at the mouse position.
 * The info text is expected as attribute of the node.
 * The position of the generated popup is automatically corrected, if it exeeds the visual SVG range
 * @param xPos the x position of the info window
 * @param yPos the y position of the info window
 * @param zMode if 'add', the former info displays are not removed
 */
doDisplayInfo = function(xPos,yPos,szMode){

	var i;
	var ii;

	var dataGrid = null;

	// clear other info container, if not szMode /add/
	// ---------------------------------------------
	if ( !szMode || !szMode.match(/add/) ){
		SVGPopupGroup.fu.clear();
	}

	// check info source 
	// ---------------------------------------------
	var infoShape = null;
	if ( __info_infoShape ){
		infoShape = map.Event.popupContextObj = __info_infoShape;
	}
	else{
		infoShape = map.Event.popupContextObj;
	}
	if ( infoShape == null ){
		return null;
	}

	// get info texts
	// ---------------------------------------------
	var text = infoShape.getAttributeNS(szMapNs,"info");
	if ((text == null || text.length === 0) && infoShape.parentNode ){
		infoShape = infoShape.parentNode;
		text =infoShape.getAttributeNS(szMapNs,"info");
	}
	var titles = map.Dom.getAttributeByNodeOrParents(infoShape.parentNode,szMapNs,"info");
	var toShow = map.Dom.getAttributeByNodeOrParents(infoShape.parentNode,szMapNs,"show");
	var labels = map.Dom.getAttributeByNodeOrParents(infoShape.parentNode,szMapNs,"label");
	var units  = map.Dom.getAttributeByNodeOrParents(infoShape.parentNode,szMapNs,"units");

	// get id of info source shape 
	// ---------------------------------------------
	var szId = map.Dom.getAttributeByNodeOrParents(infoShape,null,"id");

	// avoid two info displays with the same content
	// ---------------------------------------------
	var szAvoidDoubletteId = szId+":info";
	if ( map.Themes && map.Themes.activeTheme ){
		szAvoidDoubletteId += ":"+map.Themes.activeTheme.szId;
	}
	if ( SVGDocument.getElementById(szAvoidDoubletteId) ){
		return null;
	}

	// look for an optional image
	// ---------------------------------------------
	if (szId && szId.length){
		szId = map.Tiles.getMasterId(szId);
		var szIdImage = szId.split(":::")[0];
		imageNode = SVGDocument.getElementById(szIdImage+":"+"image");
	}

	// inform map user
	// ---------------------------------------------
	try{
		if ( map.User.onInfoDisplay(null,szId) ){
			return null;
		}
	}
	catch (e){
	}
	
	// create info container
	// ---------------------------------------------
	var position = new point(xPos,yPos);
	var offset = new point(map.Scale.normalX(nInfoOffsetX),map.Scale.normalY(nInfoOffsetY));
	var szInfoId = "info:"+String(Math.random());

	var newInfo = new InfoContainer(SVGDocument,SVGPopupGroup,szInfoId+(szMode.match(/pointer/)?"":":movable"),position,offset,szMode);
	var infoWorkspace = newInfo.workspaceNode;
	// create group to set unique content id ! see if(...) above
	infoWorkspace = map.Dom.newGroup(infoWorkspace,szAvoidDoubletteId);

	// here we go to make the content
	// ---------------------------------------------
	var	contentBox = new box(0,0,0,0);

	// GR 07.05.2008 test
	// ---------------------------------------------
	var szObjId = new MapObject(infoShape).szId;
	if ( szObjId.match(/chartgroup/)){
		var szLayer     = szObjId.split(":")[1];
		var szSelection = szObjId.split(":")[3];
		szObjId = szLayer+'::'+szSelection;
	}
	else{
		layerItem = map.Layer.getLayerItemNodeOfNode(infoShape);
		if ( layerItem ){
			szObjId = layerItem.getAttributeNS(null,"id");
		}
	}
	var szInfoTitle = map.Label.getLabel(szObjId);

	// GR 13.05.2016 if no title yet, try to get it from the active theme
	if ( !szInfoTitle && map.Themes.activeTheme ){
		szInfoTitle = map.Themes.getTitle(szObjId,map.Themes.activeTheme);
	}

	// GR 29.08.2013 allow user hook
	try{
		var textA = map.Themes.getDataRow(szObjId,map.Themes.activeTheme);
		szInfoTitle = HTMLWindow.ixmaps.htmlgui_onInfoTitle(szInfoTitle,textA);
		}
	catch (e){
	}

	if (szInfoTitle){
		// add label field
		if ( !isNaN(szInfoTitle) ){
			var layerInfo = map.Layer.getLayerObj(szLayer);
			var szLabelField = layerInfo?layerInfo.szLabel+" ":"";
			szInfoTitle = (layerInfo?layerInfo.szLabel+" ":"") + szInfoTitle;
		}
		newInfo.setTitle(szInfoTitle,map.Scale.tStyle.InfoContainerTitle);
	}

	if ( szMode.match(/short/) ){
		newInfo.reformat();
		return newInfo?newInfo.objectNode:null;
	}

	// insert theme info if map has themes 
	// ====================================
	if ( map.Themes && map.Themes.activeTheme ){

		var szShapeId = null;
		var nIndent = 6;
		var objTheme = map.Themes.activeTheme;

		var shapeNodesA = map.Layer.getLayerItemNodes(infoShape);

		if ( shapeNodesA && (shapeNodesA.length > 0) ){

			// insert the charts of all themes, bound to the shape
			// ===================================================
			for ( var t=0; t<map.Themes.themesA.length; t++ ){

				var objTheme = map.Themes.themesA[t];

				// try to get the chart of a theme 
				// ===============================================
				var chartGroup = map.Dom.newGroup(infoWorkspace,"info:chart");
				szShapeId = map.Tiles.getMasterId(shapeNodesA[0].getAttributeNS(null,"id"));
				var ptNull = map.Themes.getChart(szShapeId,chartGroup,"VALUES|ZOOM|AXIS",objTheme);
				if ( !chartGroup.hasChildNodes() ){
					szShapeId = map.Tiles.getMasterId(shapeNodesA[0].parentNode.getAttributeNS(null,"id"));
					if ( szShapeId ){
						ptNull = map.Themes.getChart(szShapeId,chartGroup,"VALUES|ZOOM|AXIS",objTheme);
					}
				}
				if ( !chartGroup.hasChildNodes() ){
					var chartId = infoShape.getAttributeNS(null,"id");
					_TRACE("now try this  '"+chartId.split(":")[1]+"'");
					szShapeId = chartId.split(":")[1];
					if ( szShapeId ){
						ptNull = map.Themes.getChart(szShapeId,chartGroup,"VALUES|ZOOM|AXIS",objTheme);
					}
				}
				// check if we we succeeded to get a chart and position and comment it
				// 
				if ( chartGroup.hasChildNodes() ){
					killTooltip();
					newInfo.fClipped = false;
					var chartBox = map.Dom.getBox(chartGroup);
					if ( chartBox.width > 0 && chartBox.height > 0 ){

						// make title / description
						var nYpos = map.Scale.tStyle.Description.nFontHeight*0.9;

						var szTextStyle = __scaleStyleString(map.Scale.tStyle.Description.szStyle,1); 
						var szTitle = objTheme.szTitle;
						map.Dom.newText(infoWorkspace,map.Scale.normalX(nIndent),contentBox.height+nYpos,szTextStyle,szTitle);

						if ( objTheme.szFlag.match(/CHART/) ){
							nYpos += map.Scale.normalY(nIndent/1.3);
						}else{
							nYpos += map.Scale.normalY(nIndent*1.3);
						}

						// scale and position chart 
						var nChartScale = 2.0;
						chartGroup.fu.scale(nChartScale,nChartScale);
						chartBox = map.Dom.getBox(chartGroup);
						chartGroup.fu.setPosition(map.Scale.normalX(nIndent)-chartBox.x*nChartScale,contentBox.height+nYpos-chartBox.y*nChartScale);
						chartBox = map.Dom.getBox(chartGroup);

						// additional chart summary text (if returned from theme)  
						nYpos = chartBox.y+chartBox.height+map.Scale.normalY(nIndent);

						// is there a label ?  
						var szValue = map.Themes.getLabel(szShapeId,objTheme);
						if ( szValue ){
							szValue = szValue.length<25?szValue:szValue.substr(0,25)+"...";
							nYpos += map.Scale.normalY(nIndent*1.3);
							var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle,1); 
							map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,szValue);
							nYpos += map.Scale.tStyle.Description.nFontHeight;
						}

						// is there a summary ?  
						var szTotal = map.Themes.getSummary(szShapeId,objTheme);
						if ( szTotal ){
							var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle,1/nChartScale); 
							map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,szTotal);
						}

						// set box for next theme chart
						contentBox = map.Dom.getBox(infoWorkspace);
						contentBox.height += map.Scale.normalY(nIndent*2);
					}

					// make info text grid
					// ===================
					if ( objTheme.fShowData ){
						dataGrid = objTheme.getDataGrid(szShapeId,infoWorkspace);
						if ( dataGrid ){
							dataGrid.setPosition(map.Scale.normalX(5),contentBox.height);
							if ( dataGrid.hasScrollBars && dataGrid.hasScrollBars() ){
								dataGrid.workspaceNode.style.setProperty("display","none","");
							}
						}
					}
				}
			}
		}
		else {
			// info is on one chart object
			// try to get a zoomed and commented copy of this chart
			// ======================================================
			var chartGroup = map.Dom.newGroup(infoWorkspace,"info:chart");
			var mapObj = new MapObject(infoShape);
			var chartId = mapObj.szId;
			var szTheme = chartId.split(":")[1];
			var szChart = chartId.split(":")[3];
			var layerInfo = map.Layer.getLayerObj(szTheme);
			var szSelection = layerInfo?layerInfo.szSelection+" ":"";

			// GR 16.08.2008 overwrite active theme
			var chartTheme = map.Themes.getTheme(chartId.split(":")[0]);

			if ( chartTheme && chartTheme.szInfoTitle ){
				szSelection = chartTheme.szInfoTitle;
			}
			var szShapeLabel = map.Label.getLabel(szTheme+"::"+szChart);
			var szInfoTitle = szShapeLabel?szShapeLabel:szSelection+szChart;
			_TRACE("now try this  '"+szTheme+"::"+szChart+"'");
			szShapeId = szTheme+"::"+szChart;

			if ( chartTheme.szFlag.match(/POINTER/) && (chartTheme.nOrigSumA.length > 1) && (chartTheme.partsA.length > 1) ){
				ptNull = map.Themes.getChart(szShapeId,chartGroup,"VALUES|ZOOM|AXIS|HORZ",chartTheme);
			}else{
				ptNull = map.Themes.getChart(szShapeId,chartGroup,"VALUES|ZOOM|AXIS",chartTheme);
				// GR 10.02.2017 test second chart to show the labels
				if ( chartTheme.szFlag.match(/PIE/) ){
					var xGroup = map.Dom.newGroup(chartGroup,"info:chart:x");
					var temp = chartTheme.nNormalSizeValue;
					chartTheme.nNormalSizeValue = map.Themes.getMaxValue(szShapeId,chartTheme)*10;
					ptNull = map.Themes.getChart(szShapeId,xGroup,"CHART|BAR|HORZ|ZOOM|VALUES|AXIS|NOZERO|SORT",chartTheme);
					chartTheme.nNormalSizeValue = temp;
					xGroup.fu.setPosition(0,xGroup.fu.getBox().height+chartGroup.fu.getBox().height/2+map.Scale.normalX(5));
				}
			}

			if ( chartTheme && chartTheme.itemA[szShapeId] && chartTheme.itemA[szShapeId].szSelectionId ){
				szInfoTitle = chartTheme.itemA[szShapeId].szSelectionId.split(":").pop();
			}
			if ( chartTheme && chartTheme.itemA[szShapeId] && chartTheme.itemA[szShapeId].szTitle ){
				szInfoTitle = chartTheme.itemA[szShapeId].szTitle;
			}
			// GR 29.08.2013 allow user hook
			try{
				var textA = map.Themes.getDataRow(szObjId,map.Themes.activeTheme);
				szInfoTitle = HTMLWindow.ixmaps.htmlgui_onInfoTitle(szInfoTitle,textA);
				}
			catch (e){
			}
	
			if ( chartGroup.hasChildNodes() ){

				killTooltip();

				newInfo.fClipped = false;
				newInfo.setTitle(szInfoTitle,map.Scale.tStyle.InfoContainerTitle);

				var chartBox = map.Dom.getBox(chartGroup);
				if ( chartBox.width > 0 && chartBox.height > 0 ){
					chartGroup.fu.scale(2,2);
					chartGroup.fu.setPosition(map.Scale.normalX(nIndent)-chartBox.x*2,contentBox.height+map.Scale.normalY(nIndent)-chartBox.y*2);

					var nYpos = chartBox.y+chartBox.height+map.Scale.normalY(nIndent);

					// add title
					var szTextStyle = __scaleStyleString(map.Scale.tStyle.Description.szStyle,0.5); 
					nYpos += map.Scale.tStyle.Description.nFontHeight*0.25 + map.Scale.normalY(1);
					map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,chartTheme.szTitle);
					nYpos += map.Scale.tStyle.Description.nFontHeight*0.5 + map.Scale.normalY(1);
					// add snippet
					/**
					if (chartTheme.itemA[szShapeId].szSnippet || chartTheme.szSnippet){
						var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle,0.5); 
						map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,(chartTheme.itemA[szShapeId].szSnippet || chartTheme.szSnippet));
						nYpos += map.Scale.tStyle.Summary.nFontHeight*0.5 + map.Scale.normalY(0.5);
					}
					**/
					// add valuecomment
					var szTotal = map.Themes.getValueComment(szShapeId,map.Themes.activeTheme);
					if ( szTotal ){
						var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle,0.5); 
						map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,szTotal);
						nYpos += map.Scale.tStyle.Summary.nFontHeight*0.5 + map.Scale.normalY(0.5);
					}
					// add summary
					var szTotal = map.Themes.getSummary(szShapeId,map.Themes.activeTheme);
					if ( szTotal ){
						var szTextStyle = __scaleStyleString(map.Scale.tStyle.Summary.szStyle,0.5); 
						map.Dom.newText(chartGroup,chartBox.x,nYpos,szTextStyle,szTotal);
						nYpos += map.Scale.tStyle.Summary.nFontHeight;
					}
					contentBox = map.Dom.getBox(infoWorkspace);
					contentBox.height += map.Scale.normalY(nIndent*2);
				}

				// make info text grid
				// ===================
				if ( objTheme.fShowData ){
					dataGrid = objTheme.getDataGrid(szShapeId,infoWorkspace);
					if ( dataGrid ){
						dataGrid.setPosition(map.Scale.normalX(5),contentBox.height);
						if ( dataGrid.hasScrollBars && dataGrid.hasScrollBars() ){
							dataGrid.workspaceNode.style.setProperty("display","none","");
						}
					}
				}
			}
		}
		// set box for next elenent
		contentBox = map.Dom.getBox(infoWorkspace);
	}

	if (imageNode){
		var myImageNode = imageNode.cloneNode(1000);
		myImageNode = infoWorkspace.appendChild(myImageNode);
		myImageNode.fu = new Methods(myImageNode);
		myImageNode.fu.setPosition(map.Scale.normalX(5),contentBox.height+map.Scale.normalY(5));
		myImageNode.fu.scale(map.Scale.normalX(1),map.Scale.normalY(1));
		contentBox = map.Dom.getBox(infoWorkspace);
		contentBox.height +=  map.Scale.normalX(7);
	}

	if (text && text.length && titles.length && !dataGrid ){
	
		if ( toShow && toShow.length ){
			var textA = new Array(0);
			var titleA = titles.split('|');
			var valueA = text.split('|');
			var showA = toShow.split('|');
			var labelA = labels.split('|');
			var unitsA = units.split('|');
			if ( showA && showA.length ){
				for (i=0;i<showA.length;i++){
					for (ii=0;ii<titleA.length;ii++){
						if ( showA[i] == titleA[ii] ){
							if ( labelA && labelA[i] ){
								textA[textA.length] = map.Dictionary.getLocalText(labelA[i]);
							}else{
								textA[textA.length] = map.Dictionary.getLocalText(titleA[ii]);
							}
						}
					}
				}
				for (i=0;i<showA.length;i++){
					for (ii=0;ii<titleA.length;ii++){
						if ( showA[i] == titleA[ii] ){
							var ttext = map.Dictionary.getLocalText(valueA[ii]);
							textA[textA.length] = __formatInfoValue(ttext);
							textA[textA.length-1] += (unitsA[i]?(" "+unitsA[i]):"");
						}
					}
				}
			}
		}
		else{
			var textA = new Array(0);
			var titleA = titles.split('|');
			var unitsA = units.split('|');
			for (i=0;i<titleA.length;i++){
				textA[textA.length] = map.Dictionary.getLocalText(titleA[i]);
			}
			var valueA = text.split('|');
			for (i=0;i<valueA.length;i++){
				if ( !isNaN(valueA[i])){
					var ttext = map.Dictionary.getLocalText(titleA[i]+":"+valueA[i]);
					textA[textA.length] = __formatInfoValue((ttext!=titleA[i]+":"+valueA[i])?ttext:valueA[i]);
				}else{
					var ttext = map.Dictionary.getLocalText(titleA[i]+":"+valueA[i]);
					if ( ttext != titleA[i]+":"+valueA[i] ){
						textA[textA.length] = ttext;
					}else{
						textA[textA.length] = map.Dictionary.getLocalText(valueA[i]);
					}
				}
				textA[textA.length-1] += (unitsA[i]?(" "+unitsA[i]):"");
			}
		}
		// make info text grid
		// ===================
		if ( textA.length ){
			var newText = createTextGrid(SVGDocument,infoWorkspace,szInfoId+":textgrid",textA,2);
			newText.fu.setPosition(map.Scale.normalX(5),contentBox.height);
		}

		// inform map user
		try{
			if ( (userGroup = map.User.onInfoDisplayExtend(null,szId,newText.parentNode,position)) ){
				 userGroup = newText.appendChild(userGroup);
				 userGroup.fu.setPosition(map.Scale.normalX(5),contentBox.height);
			}
		}
		catch (e){
		}
	}

	// inform htmlgui user
	try{
		if ( (userGroup = HTMLWindow.ixmaps.htmlgui_onInfoDisplayExtend(SVGDocument,szObjId)) ){
			 userGroup = infoWorkspace.appendChild(userGroup);
			 userGroup.fu = new Methods(userGroup);
			 userGroup.fu.setPosition(map.Scale.normalX(10),contentBox.height+map.Scale.normalX(10));
		}
	}
	catch (e){
	}

	if ( !infoWorkspace.hasChildNodes() ){
		map.Dom.newShape('rect',infoWorkspace,0,0,1,1,"fill:none;stroke:none;");
	}

	newInfo.reformat();

	// must be switched on here, was hidden for uncorrect sizing 
	if ( dataGrid ){
		dataGrid.workspaceNode.style.setProperty("display","inline","");
	}

	// fix the generated info by moving it into the fixed group
	if ( szMode.match(/fix/) ){

		newInfo.objectNode.fu.scale(nFixedInfoScale,nFixedInfoScale);

		SVGFixedGroup.appendChild(newInfo.objectNode);
		newInfo.highLightList = new HighLight();
		newInfo.highLightList.addItem(infoShape);
		newInfo.highLightList.lock();
		newInfo.setOnRemove("_doRemoveFixedInfo(map.Dom.popObj('"+map.Dom.pushObj(newInfo)+"'))");
	}

	return newInfo?newInfo.objectNode:null;
};

/**
 * remove the highlight assoziated to a fixed info display container
 * @param thisInfo the info container handle
 */
_doRemoveFixedInfo = function(thisInfo){
	thisInfo.highLightList.unlock();
	thisInfo.highLightList.removeAll();
};
/**
 * remove the info display a map shape
 * @param evt the actual event
 * @param infoShape the source shape object of the info display
 */
function removeInfo(evt,infoShape){
	setTimeout("_removeInfo()",1000);
}
_removeInfo = function(evt){
	if (map.Event.onoverShape == null && !map.Event.onoverPopup ){
		SVGPopupGroup.fu.clear();
	}
	else{
		// give time to move over info to keep it
		setTimeout("_removeInfo()",250);
	}
};

/**
 * helper to delay the info display
 * (if the user moves the cursor out, before the delay time, 
 *  no info will be displayed )
 */
var __infoShape = null;
var __stackedInfoShapeA = new Array(0);
function displayInfoDelayed(evt,infoShape,nTimeout){
	__stackedInfoShapeA[__stackedInfoShapeA.length] = infoShape;
	if (__stackedInfoShapeA.length <= 1){
		setTimeout("doDisplayInfoDelayed()",nTimeout);
	}
}
function doDisplayInfoDelayed(){
	if ( SVGPopupGroup.hasChildNodes ){
		setTimeout("doDisplayInfoDelayed()",1000);
	}
	else{
		for ( var i=0; i<__stackedInfoShapeA.length; i++){
			displayInfo(null,__stackedInfoShapeA[i],(i==0)?"":"add");
		}
		__stackedInfoShapeA.length = 0;
	}
}
/**
 * helper to format values (to show within the info display)
 */
__formatInfoValue = function(szValue){
	if ( szValue.match(/E+/) ){
		var szValueA =  szValue.split('E+');
		var nMantisse = parseFloat(szValueA[0]);
		var nExponent = parseInt(szValueA[1]);
		if ( !isNaN(nMantisse) && !isNaN(nExponent) ){
			var nValue = nMantisse*Math.pow(10,nExponent);
			return String((Math.round(nValue*100))/100);
		}
	}
	var nValue = Number(szValue);
	if ( !isNaN(nValue) ){
		return String(nValue);
	}
	return(szValue);
};

// .................................................................... 
// create a text grid (similar to a table) with lines and columns                  
// .................................................................... 

/**
 * Display the text lines given as array as grid (lines and columns)  
 * The lines have alternative background color to increase readibility
 * @param targetDocument	the SVG document to create the text within
 * @param targetGroup		the SVG group (<g>) to create the text within
 * @param groupName			the id of the created new SVG element
 * @param textArray			the text for all cells of the grid as array of strings
 * @param nColumns			the number of columns to create
 */
createTextGrid = function(targetDocument,targetGroup,groupName,textArray,nColumns,fontHeight,styleArray,bgStyle) {

	var lines = Math.ceil(textArray.length/nColumns);
	var fontheight   = fontHeight?fontHeight:12;
	var objectwidth  = 100;
	var lineheight   = fontheight;
	var objectheight = lines*lineheight+lineheight*0.6;
	var maxlinelength = 0;
	for (var i=0;(i<textArray.length && textArray[i]);i++){
		maxlinelength = Math.max(maxlinelength,textArray[i].length);
	}	
	objectwidth  = maxlinelength*fontheight*5/7;
	
	var newGroup = map.Dom.newGroup(targetGroup,groupName);
	// create field rect for the values
	var fBgPattern = SVGDocument.getElementById("TextLinesBgPattern");
	szStyle = bgStyle?bgStyle:"fill:#ffffff;stroke:"+(szTextGridStyle.match(/background/)?"1":"none");
	// finally create the text 
	var newBgA = new Array(0);
	var newLA = new Array(0);
	var newxGroup = map.Dom.newNode('g',newGroup);
	var xOffset = map.Scale.normalX(5);
	var yOffset = map.Scale.normalX(3);

	for (c=0;c<nColumns;c++ ){
		for (i=0;i<lines;i++){
			if ( nColumns > 1 && c==0 && !fBgPattern && szTextGridStyle.match(/background/) && (!szTextGridStyle.match(/alternate/)||i%2) ){
				newBgA[i] = map.Dom.newShape('rect',newxGroup,0,map.Scale.normalY((i)*lineheight+2)+yOffset,100,map.Scale.normalY(lineheight-1),"fill:#f0f0f0;stroke:none;opacity:1.0");
			}
			var newLine = map.Dom.newText(newxGroup,0,(i+1)*map.Scale.normalY(lineheight),"font-family:arial;font-size:"+map.Scale.normalY(fontheight)+"px;fill:"+szInfoBodyColor+"",textArray[i+c*lines]);
			newLA[i] = newLine;
			if (nColumns > 1 && c==0 && !fBgPattern){
				if (szTextGridStyle.match(/firstsmall/)){
					newLine.style.setProperty("font-size",String(map.Scale.normalY(fontheight*0.9))+"px","");
				}
				if (szTextGridStyle.match(/firstitalic/)){
					newLine.style.setProperty("font-style","italic","");
				}
				if (szTextGridStyle.match(/firstgray/)){
					newLine.style.setProperty("fill","#888888","");
				}
			}
			// GR 01.03.2011 styles
			if ( styleArray && styleArray[i+c*lines] ){
				try	{
					var stylePropArray = __getStyleArray(styleArray[i+c*lines]);
					for ( a in stylePropArray ){
						newLine.style.setProperty(a,stylePropArray[a],"");
					}
				}
				catch (e){
				}
			}
			newLine.setAttribute("transform","matrix(1 0 0 1 "+xOffset+" "+yOffset+")");
			if (newLine.nodeName != 'a'){
				newLine.style.setProperty("pointer-events","none","");
			}
		}

		var actWidth = map.Dom.getBox(newxGroup).width;
		if ( szTextGridStyle.match(/firstright/) && c== 0 ){
			for (i=0;i<lines;i++){
				newLA[i].setAttribute("transform","matrix(1 0 0 1 "+(xOffset+actWidth)+" "+yOffset+")");
				newLA[i].style.setProperty("text-anchor","end","");
			}
			xOffset = actWidth + map.Scale.normalX(fontheight) + map.Scale.normalX(5);
		}else{
			xOffset = actWidth + map.Scale.normalX(fontheight) + map.Scale.normalX(5);
		}
		if (c==0 ){
			var bgWidth = xOffset;
		}
	}
	bBox = map.Dom.getBox(newxGroup);
	for (i=0;i<lines;i++){
		if (newBgA[i]){
			if ( szTextGridStyle.match(/full/) ){
				newBgA[i].setAttributeNS(null,"width",bBox.width+map.Scale.normalX(fontheight/2));
			}else{
				newBgA[i].setAttributeNS(null,"width",bgWidth-map.Scale.normalX(5));
			}
		}
	}

	var patternNode = SVGDocument.getElementById("TextLinesBgPattern:antizoomandpan");
	if (patternNode){
		patternNode.setAttributeNS(null,"patternTransform","matrix(1 0 0 1 "+String(0)+" "+String(yOffset-map.Scale.normalY(lineheight-1))+")");
	}

	return newGroup; 
};


// .................................................................... 
// display popup text               
// .................................................................... 

var __textField_group = null;
var __textField_frame = null;
var __textField_shadow = null;
var __textField_fontheight = 12;
/**
 * Display the given text with autosizing background and shadow  
 * @param SVGDocument		the target document
 * @param SVGTargetGroup	the target group
 * @param szId				give the new element this id
 * @param szText			the text to display
 */
function createTextField(SVGDocument,SVGTargetGroup,szId,szText,fontheight){
	if ( !fontheight){
		fontheight   = 12;
	}
	if(SVGDocument && SVGTargetGroup){
		var newGroup = map.Dom.newGroup(SVGTargetGroup,szId);
		var newShadow = map.Dom.newShape('rect',newGroup,1,1,1,1,"fill:#444444;opacity:0.5;stroke:none");
		var newRect = map.Dom.newShape('rect',newGroup,1,1,1,1,"fill:#fefeff;stroke:#444444;stroke-width:"+map.Scale.normalX(0.2)+"");
		var newText = map.Dom.newText(newGroup,0,map.Scale.normalY(fontheight*1.25),"font-family:arial;font-size:"+map.Scale.normalY(fontheight)+"px;fill:"+szInfoBodyColor+"",szText);

		__textField_group  = newGroup;
		__textField_frame  = newRect;
		__textField_shadow = newShadow;
		__textField_fontheight = fontheight;

		if ( 0 && szViewer.match(/Netscape/) ){
			setTimeout("sizeTextField()",10);
		}else{
			sizeTextField();
		}
		
		return newGroup;
	}
}
function sizeTextField(){
		var fontheight = __textField_fontheight;
		var bBox = map.Dom.getBox(__textField_group);
		__textField_frame.setAttributeNS(null,"rx" ,map.Scale.normalX(2));
		__textField_frame.setAttributeNS(null,"ry" ,map.Scale.normalX(2));
		__textField_frame.setAttributeNS(null,"x" ,-map.Scale.normalX(fontheight*0.75));
		__textField_frame.setAttributeNS(null,"y" ,-map.Scale.normalY(1));
		__textField_frame.setAttributeNS(null,"width" ,bBox.width +map.Scale.normalX(fontheight*1.5));
		__textField_frame.setAttributeNS(null,"height",bBox.height+map.Scale.normalY(fontheight)/2);

		__textField_shadow.setAttributeNS(null,"rx" ,map.Scale.normalX(4));
		__textField_shadow.setAttributeNS(null,"ry" ,map.Scale.normalX(4));
		__textField_shadow.setAttributeNS(null,"x" ,-map.Scale.normalX(fontheight*0.75)+map.Scale.normalX(2));
		__textField_shadow.setAttributeNS(null,"y" ,map.Scale.normalY(2));
		__textField_shadow.setAttributeNS(null,"width" ,bBox.width +map.Scale.normalX(fontheight*1.5)+map.Scale.normalX(1.5));
		__textField_shadow.setAttributeNS(null,"height",bBox.height+map.Scale.normalX(fontheight)/2-map.Scale.normalX(0));
		return;
}

// .................................................................... 
// display map scale element              
// .................................................................... 

/**
 * Calculate and display a map scale.  
 * The scale is calculated from metadata within the SVG map and the actual scalings 
 * @param evt			the event	
 * @param szPosition	the position of the scale display ('top','bottom'); if null, take previous position
 */
function displayScale(evt,szPosition){

	if ( !fScaleBar ){
		return;
	}
	var fontheight   = 12;
	var nScale		 = map.Scale.getTrueMapScale()*map.Scale.nZoomScale;
	var nDez		 = 0;

	// calculate the units of the scale
	for (nDez=0;nScale>10;nDez++ ){
		nScale /= 10;
	}
	if (nScale>5){
		nScale = 10;
	}
	else if (nScale>2.5){
		nScale = 5;
	}
	else if (nScale>=1.1){
		nScale = 2.5;
	}
	else {
		nScale = 1;
	}
	for (;nDez > 0;nDez-- ){
		nScale *= 10;
	}
	// get the unit in SVG width
	var nScaleUnitWidth = (nScale/(map.Scale.nMapScale*map.Scale.nZoomScale)) * (map.Scale.nMapPPI/nInch);

	// prepare the scale display group
	var scaleGroup = map.Dom.getObjectById("legend:scalegroup");
	if (!scaleGroup){
		return;
	}
	if (!scaleGroup.hasChildNodes() && !szPosition){
		return;
	}
	scaleGroup.fu.clear();

	var szBarUnits  = scaleGroup.getAttributeNS(szMapNs,"scaleunits");
	var szBarColor  = scaleGroup.getAttributeNS(szMapNs,"barcolor");
	var szBarBgColor  = scaleGroup.getAttributeNS(szMapNs,"bgcolor");
	var szBarBgStyle  = scaleGroup.getAttributeNS(szMapNs,"bgstyle");
	var nBarBgOpacity  = scaleGroup.getAttributeNS(szMapNs,"bgopacity");
	var nBarMaxWidth  = scaleGroup.getAttributeNS(szMapNs,"maxwidth");

	if ( szBarBgStyle == null || szBarBgStyle.length < 1 ){
		if ( szBarBgColor == null || szBarBgColor.length < 1 ){
			szBarBgStyle = "fill:white;";
		}
		else{
			szBarBgStyle = "fill:"+szBarBgColor+";";
		}
		if ( nBarBgOpacity ){
			szBarBgStyle  += "opacity:"+nBarBgOpacity+";";
		}
	}

	if ( nBarMaxWidth == 0 ){
		nBarMaxWidth = map.Scale.bBox.width/3/map.Scale.normalX(1);
	}

	if ( szBarColor == null || szBarColor.length < 1 ){
		szBarColor = "red";
	}
	var szBarStroke = (szBarColor=='#ffffff')?';stroke:black;stroke-width:0.1;':'';
	var szBarStyle1 = "fill:"+szBarColor+szBarStroke+";pointer-events:none";
	var szBarStyle2 = "fill:black;pointer-events:none";

	var bgRect = map.Dom.newShape('rect',scaleGroup,map.Scale.normalX(0),map.Scale.normalY(0),map.Scale.normalX(0),map.Scale.normalY(0),szBarBgStyle);

	// make the scale text ( 1:xxx )
	if ( 1 ){
		var nDispScale = map.Scale.getTrueMapScale()*map.Scale.nZoomScale;
		if ( nDispScale >= 1 ){
			var szScale = "1:"+String(__formatValue(nDispScale,0,"BLANK"));
		}
		else{
			var szScale = String(__formatValue(1/nDispScale,0,"BLANK"))+":1";
		}
		var textNode = map.Dom.newText(scaleGroup,0,map.Scale.normalY(fontheight),"font-family:arial;font-size:"+map.Scale.normalY(fontheight/4*3)+"px;fill:"+szInfoBodyColor+"",szScale);
		textNode.fu.setPosition(0,-map.Scale.normalY(10));
	}

	var nFrame = 2;

	if ( nBarMaxWidth > 0 ){
	// make the scale measurement graphic
	var nXpos = 0;
	var nYpos = 5;
	var szUnits = szBarUnits.length?szBarUnits:"meters";
	var nUnits = 100;
	if ( szUnits == 'feet' ){
		nUnits = 33.3;
		if (nScale>30000){
			szUnits = "miles";
			nUnits = 5280*33.3;
		}
	}
	else
		if (nScale>10000){
			szUnits = "km";
			nUnits = 100000;
	}
	for (var i=0;i<20 ;i++ ){
		var szStyle = i%2==1?szBarStyle1:szBarStyle2;
		map.Dom.newShape('rect',scaleGroup,map.Scale.normalX(nXpos),map.Scale.normalY(nYpos),map.Scale.normalX(nScaleUnitWidth),map.Scale.normalY(5),szStyle);
		var nText = Math.floor(nScale/nUnits*i*100)/100;
		var szText = szUnits;
		if ( i > 0 ){
			szText = Math.floor(nText)!=nText?String(nText):String(Math.floor(nText));
		}
		map.Dom.newText(scaleGroup,(i === 0)?map.Scale.normalX(nXpos):map.Scale.normalX(nXpos-4),map.Scale.normalY(nYpos+5+fontheight/3*2),"font-family:arial;font-size:"+map.Scale.normalY(fontheight/3*2)+"px;fill:"+szInfoBodyColor+";pointer-events:none;",szText);

		nXpos += nScaleUnitWidth;
		if ( ( (nBarMaxWidth > 1) && (nXpos > nBarMaxWidth) ) ||
			 ( map.Scale.mapPosition.x && (map.Scale.normalX(nXpos) > map.Scale.bBox.width*9/10))	|| 
			 (!map.Scale.mapPosition.x && (map.Scale.normalX(nXpos) > map.Scale.bBox.width/2))	){
			break;
		}
	}
	var perCm = ((map.Scale.getTrueMapScale()*map.Scale.nZoomScale)/nUnits);
	if ( perCm > 100 ){
		perCm = Math.round(perCm);
	}
	else{
		perCm = Math.round(perCm*100)/100;
	}
	if ( 0 ){
		szText = "One Centimeter = "+perCm+" "+szUnits;
		nXpos = map.Dom.getBox(textNode).width+map.Scale.normalX(10);
		map.Dom.newText(scaleGroup,nXpos,map.Scale.normalY(nYpos-3),"font-family:arial;font-size:"+map.Scale.normalY(fontheight/3*2)+"px;fill:"+szInfoBodyColor+";pointer-events:none;",szText);
	}
	}else{
		// make dummy rect
		map.Dom.newShape('rect',scaleGroup,map.Scale.normalX(50),map.Scale.normalY(20),map.Scale.normalX(1),map.Scale.normalY(1),"fill:white;opacity:0;");
	}

	var bBox = map.Dom.getBox(scaleGroup);

	// set the background to the real width and height of the scale display
	if (bgRect){
		bgRect.setAttributeNS(null,"x",bBox.x-map.Scale.normalX(nFrame+5));
		bgRect.setAttributeNS(null,"y",bBox.y-map.Scale.normalY(nFrame));
		bgRect.setAttributeNS(null,"width",bBox.width+map.Scale.normalX((nFrame+5)*2));
		bgRect.setAttributeNS(null,"height",bBox.height+map.Scale.normalY(nFrame*2));
		bgRect.setAttributeNS(null,"rx",map.Scale.normalY(2));
		bgRect.setAttributeNS(null,"ry",map.Scale.normalY(2));
	}

	// position the scale
	if (szPosition){
		var nXoff = map.Scale.normalX(8);
		var nMapBorder = map.Scale.normalX(nMapBorderWidth);
		if ( (map.Scale.mapPosition.y + map.Scale.bBox.height) < map.Scale.viewBox.height ){
			nXoff = map.Scale.normalX(2);
			nMapBorder = 0;
		}
		var xpos = map.Scale.mapPosition.x+nXoff; 
		if (szPosition == "bottom"){
			scaleGroup.fu.setPosition(xpos+nMapBorder,map.Scale.normalY(map.Scale.getEmbedHeight()/map.Scale.getEmbedScale())-nMapBorder-bBox.height);
		}else{
			scaleGroup.fu.setPosition(xpos+nMapBorder,-bBox.y+map.Scale.normalY(nFrame)+map.Scale.normalY(1)+nMapBorder);
		}
	}

	if (bgRect){
		var szNextPosition = scaleGroup.fu.getPosition().y>map.Scale.normalY(100)?'top':'bottom';
		bgRect.setAttributeNS(null,"onclick","displayScale(evt,'"+szNextPosition+"')");
	}
	
	if(SVGPopupGroup){
		SVGPopupGroup.fu.clear();
		scaleGroup.setAttributeNS(szMapNs,"tooltip","click to move it");
	}
}

// .............................................................................
// toolbar functions              
// .............................................................................

/**
 * Create a new Map.Toolbar instance.  
 * @class It realizes an object to handle a toolbar on the SVG canvas (or map area, or legend space)
 * <br>The toolbar itself must be provided by an additional SVG file (in general 'mapwidget.svg')
 * <br>
 * @constructor
 * @throws 
 * @param evt the actual event
 * @return A new Map.Toolbar Object
 */
Map.Toolbar = function(evt){
	this.init(evt);
};
Map.Toolbar.prototype = new Map();

/**
 * initialize the toolbar. This requires, that a SVG widget definition (mapwidget.svg) has been loaded, which has a toolbar defined.
 * @param evt the event
 */
Map.Toolbar.prototype.init = function(evt){
	var toolbarNode = SVGDocument.getElementById("legend:toolbar");
	var toolbarSrc  = SVGDocument.getElementById("toolbar");
	if (toolbarNode && toolbarSrc){
		toolbarSrc.setAttributeNS(null,"id","toolbar:movable");
		map.Dom.clearGroup(toolbarNode);
		toolbarNode.appendChild(toolbarSrc);
		// GR 11.11.2010 
		toolbarNode.setAttributeNS(null,"cursor","pointer");
		this.refresh();
	}
};
/**
 * sets the toolbar position
 * @param evt the event
 */
Map.Toolbar.prototype.refresh = function(evt){
	var toolbarNode = SVGDocument.getElementById("legend:toolbar");
	if (toolbarNode && (!map.Legend || !map.Legend.objNode || !map.Legend.objNode.fu.isContained(toolbarNode)) ){
		var nBorder = map.Scale.normalX(nMapBorderWidth);
		toolbarNode.fu = new Methods(toolbarNode);
		var ptPos = toolbarNode.fu.getPosition();
		var szPosition = toolbarNode.getAttributeNS(szMapNs,"position");
		if ( szPosition.match(/NONE/) ){
			toolbarNode.style.setProperty("display","none","");
		}
		if ( szPosition.match(/INMAP/)){
			if ( szPosition.match(/RIGHT/)){
				var ptBox = toolbarNode.fu.getBox();
				toolbarNode.fu.setPosition(map.Scale.mapPosition.x+map.Scale.bBox.width-nBorder-map.Scale.normalX(10)-ptBox.width,ptPos.y+nBorder);
			}
			else{
				toolbarNode.fu.setPosition(map.Scale.mapPosition.x+map.Scale.normalX(6)+nBorder,ptPos.y+nBorder);
			}
		}
	}
};

// .............................................................................
// legend functions              
// .............................................................................

/**
 * Create a new Map.Legend instance.   
 * @class It provides all legend properties and methods 
 * @constructor
 * @param evt the actual event
 * @throws -
 * @return A new Legend object
 */
Map.Legend = function(evt){

	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;

	/** check if legend node is present */
	var objNode = SVGDoc.getElementById("legend:group");
	if ( !objNode || typeof(objNode) == "undefined" ){
		return null;
	}

	_TRACE("--- new Legend() *** ");

	/** flag: initialization in progress */
	this.fInitializing = true;
	/** array to hold the object created by a legend item action, so we can remove it later */
	this.lastItemObjectA = new Array(0);

	/** the legend root node */
	this.objNode = objNode;
	this.objNode.fu = new Methods(this.objNode);

	var legendBody   = SVGDoc.getElementById("legend_body");
	try{
			map.Dictionary.applyToNode(legendBody);
	}
	catch (e){
	}

	this.objNode.style.setProperty("display","inline","");
	this.objNode.style.setProperty("opacity","0","");

	if (fAllIncluded || fPDFEmbed){
		this.init();
	}else{
		setTimeout("map.Legend.init()",500);
	}
};
Map.Legend.prototype = new Map();

/**
 * initialize the legend.
 * <ul>
 * <li>sets the legend background</li>
 * <li>translates the legend texts, includes header,footer,toolbar</li>
 * <li>makes scrollbars, if necessary</li>
 * </ul>
 * @param evt the event
 * @type boolean
 * @return true, if the legend could be initialized
 */
Map.Legend.prototype.init = function(evt){

	// GR 13.04.2010
	if (this.blockRecursion == true) {return;}

	var scaleHeight = map.Scale.mapPosition.x?map.Scale.normalY(10):map.Scale.normalY(60);
	var scrollBarWidth = 10;
	var rightMargin = scrollBarWidth+10;

	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	var legendGroup  = SVGDoc.getElementById("legend:group");
	if ( !legendGroup ){
		this.fInitializing = false;
		return false;
	}
	this.objNode = legendGroup;
	this.objNode.fu = new Methods(this.objNode);

	var legendTitle  = SVGDoc.getElementById("legend_title");

	var legendTitleBg= SVGDoc.getElementById("legend_onoff_bg:sizeable");
	var legendBody   = SVGDoc.getElementById("legend_body");
	var legendToolbar= SVGDoc.getElementById("legend:toolbar");
	var legendBg	 = SVGDoc.getElementById("legend_bg");
	var legendBodyBg = SVGDoc.getElementById("legend_body_bg");
	var legendBodyHd = SVGDoc.getElementById("legend_body_header");
	var legendBodyFt = SVGDoc.getElementById("legend_body_footer");
	var legendBodyFr = SVGDoc.getElementById("legend_body:frame");
	var legendBodySwitch = SVGDoc.getElementById("legend:off:legend_body");
	var legendBodyWorkspace = SVGDoc.getElementById("legend_body:workspace:movabley");


	/** firefox workaround **/
	try{
		var legendBox = map.Dom.getBox(legendBodyWorkspace?legendBodyWorkspace:legendBody);
	} catch (e){
		if ( !this.fHidden ){
			this.show();
			setTimeout("map.Legend.init()",10);
		}
		this.fInitializing = false;
		return;
	}
	/** ******************** **/

	var nLegendMaxWidth	  = 100000;
	var nLegendMaxHeight  = 100000;
	var legendParamNode = SVGDocument.getElementById("legend:param");
	if ( legendParamNode ){
		nLegendMaxWidth	  = Number(legendParamNode.getAttributeNS(szMapNs,"maxwidth"));
		nLegendMaxHeight  = Number(legendParamNode.getAttributeNS(szMapNs,"maxheight"));
		nLegendMaxWidth  = nLegendMaxWidth?map.Scale.normalX(nLegendMaxWidth):1000000;
		nLegendMaxHeight = nLegendMaxHeight?map.Scale.normalY(nLegendMaxHeight):1000000;
	}

	var markerRect = SVGDocument.getElementById('test:markerrect');
	if (markerRect){
		markerRect.parentNode.removeChild(markerRect);
	}

	_TRACE("--- initLegend");

	// GR 13.04.2010
	if ( this.fInitializing ){
		this.blockRecursion = true;
		this.checkGroupCollapse(null);
		this.blockRecursion = false;
	}

	if (0 && legendBodyWorkspace){
		legendBodyWorkspace.setAttributeNS(null,"transform","");
	}

	// get the elements (header,body,footer) of the legend
	try {
		var legendBox = map.Dom.getBox(legendBodyWorkspace?legendBodyWorkspace:legendBody);
	}
	catch(e){
		var legendBox = new box(0,0,map.Scale.normalX(150),map.Scale.normalX(300));
		}
	var titleBox  = __getLegendPartBox(evt,legendTitle);
	var headerBox = __getLegendPartBox(evt,legendBodyHd);
	var footerBox = __getLegendPartBox(evt,legendBodyFt);

	if (legendToolbar && (legendToolbar.parentNode == legendBody)){
		legendToolbar.fu = new Methods(legendToolbar);
		var toolBox = legendToolbar.fu.getBox();
		if ( toolBox.y <= 0 && toolBox.width > 0 && toolBox.width < 100000 ){
			if ( 1 || headerBox.height ){
				headerBox.y += toolBox.y+toolBox.height;
				headerBox.width = Math.max(headerBox.width,toolBox.width);
				if (legendBodyHd){
					legendBodyHd.fu = new Methods(legendBodyHd);
					legendBodyHd.fu.setPosition(headerBox.x,headerBox.y);
				}
			}
		}
	}
	if (legendToolbar && (legendToolbar.parentNode == legendBodyFt)){
		var overviewMap = SVGDoc.getElementById("legend:overviewmap");
		overviewMap.fu = new Methods(overviewMap);
		legendToolbar.fu = new Methods(legendToolbar);
		var toolBox = legendToolbar.fu.getBox();
		overviewMap.fu.setPosition(overviewMap.fu.getPosition().x,toolBox.height);
	}
	if ( headerBox.y || headerBox.height ){
		legendBodyFr.fu = new Methods(legendBodyFr);
		legendBodyFr.fu.setPosition(legendBodyFr.fu.getPosition().x,headerBox.y+headerBox.height);
	}

	legendBox.height += map.Scale.normalY(0);

	var showButton = SVGDocument.getElementById('legend:show:button'); 
	if ( showButton ){
		showButton.style.setProperty("display","none","");
	}
	if ( legendBody && legendBodyBg ){
		map.Scale.legendWidth  = Math.max(titleBox.x+titleBox.width+map.Scale.normalX(10),
										  Math.max(legendBox.x+legendBox.width,
												  Math.max(headerBox.x+headerBox.width,
														   footerBox.x+footerBox.width)))
								 +map.Scale.normalX(rightMargin);
		map.Scale.legendWidth  = Math.min(map.Scale.legendWidth,nLegendMaxWidth);

		// clip left-outside legend to free space left from map 
		var ptPos = this.objNode.fu.getPosition();
		// 1. legend is left outside of map
		if ( (ptPos.x < map.Scale.mapPosition.x) && map.Scale.viewBox.width-map.Scale.bBox.width > 0){
			map.Scale.legendWidth  = map.Scale.mapPosition.x-map.Scale.normalX(2); //-map.Scale.normalX(8);
			nLegendMaxHeight = 100000;
			this.fInMap = false;
			
			if ( fLegendToggleButtons ){
				var style = 1;
				var nY = Number(legendBodyBg.getAttributeNS(null,'y'));
				legendBodyBg.setAttributeNS(null,'y',nY+map.Scale.normalX(-100));

				if ( !SVGDocument.getElementById('legend:hide:button') ){
					var xButtonObj = new Button(legendGroup,"legend:hide","BUTTON",'#expand_left_button'
												,"map.Api.extendMap()"
												,""
												,"expand map");
					xButtonObj.nodeObj.style.setProperty("opacity","0.9","");
					xButtonObj.scale(1.8,1.8);
					if ( style == 1 ){
						xButtonObj.setPosition(map.Scale.legendWidth-map.Scale.normalX(6),map.Scale.mapPosition.y+map.Scale.normalY(8));
					}else{									
						xButtonObj.setPosition(map.Scale.legendWidth+map.Scale.normalX(10),map.Scale.mapOffset.y+map.Scale.normalY(14));
						if( fMapBorder3D && SVGDocument.getElementById(szShadowFilterId) ){
							xButtonObj.nodeObj.setAttributeNS(null,"style","filter:url(#"+szShadowFilterId+");opacity:0.5");
						}
					}
				}		
				if ( !SVGDocument.getElementById('legend:show:button') ){
					xButtonObj = new Button(legendGroup.parentNode,"legend:show","BUTTON",'#expand_right_button'
											,"map.Api.normalMap()"
											,""
											,"show legend");
					legendGroup.parentNode.insertBefore(xButtonObj.nodeObj,legendGroup.parentNode.firstChild);
					xButtonObj.scale(1.8,1.8);
					xButtonObj.nodeObj.style.setProperty("opacity","0.8","");
					xButtonObj.nodeObj.style.setProperty("display","none","");
					if( fMapBorder3D && SVGDocument.getElementById(szShadowFilterId) ){
						xButtonObj.nodeObj.style.setProperty("filter","url(#"+szShadowFilterId+")","");
					}
					if ( 0 && style == 1 ){
						xButtonObj.setPosition(map.Scale.normalX(9),map.Scale.mapPosition.y+map.Scale.normalY(10));
					}else{
						xButtonObj.setPosition(map.Scale.normalX(9),map.Scale.mapOffset.y+map.Scale.normalY(14));
					}
				}
			}
		}
		// 2. legend is right outside of map
		else if (ptPos.x >= (map.Scale.mapPosition.x+map.Scale.bBox.width)){
			map.Scale.legendWidth  = map.Scale.viewBox.width-map.Scale.mapPosition.x-map.Scale.bBox.width-map.Scale.normalX(8);
			nLegendMaxHeight = 100000;
			this.fInMap = false;
		}
		// 3. legend is within map 
		else{
			this.objNode.fu.setPosition(map.Scale.normalX(8+nMapBorderWidth),map.Scale.normalY(nMapBorderWidth));
			nLegendMaxHeight += footerBox.height;
			// GR 08.02.2011 make legend movable
			if (legendBodyHd){ legendBodyHd.setAttributeNS(null,"onmousedown","map.Legend.move(evt)"); }
			if (legendBodySwitch){ legendBodySwitch.setAttributeNS(null,"onmousedown","map.Legend.move(evt)"); }
			this.fInMap = true;
		}
		map.Scale.legendHeight = Math.min(legendBox.y+legendBox.height+headerBox.y+headerBox.height+footerBox.height+map.Scale.normalY(6)
										 ,Math.min(nLegendMaxHeight
												  ,map.Scale.normalY(map.Scale.getEmbedHeight()/map.Scale.getEmbedScale())-scaleHeight));
		legendBodyBg.setAttributeNS(null,'width',map.Scale.legendWidth);
		legendBodyBg.setAttributeNS(null,'height',map.Scale.legendHeight-Number(legendBodyBg.getAttributeNS(null,'y'))+map.Scale.normalY(5));
		legendBodyBg.setAttributeNS(null,'rx',map.Scale.normalX(2));
		legendBodyBg.setAttributeNS(null,'ry',map.Scale.normalX(2));

		// if legend is in map, create pseudoshading  
		if ( this.fInMap ){
			if( fObjectPseudoShadow && !this.shadowNode ){
				var a;
				a = legendBodyBg.style.getPropertyValue("opacity");
				var bgOpacity = ((a && a.length)?Number(a):1);
				a = legendBodyBg.style.getPropertyValue("fill-opacity");
				var bgFillOpacity = ((a && a.length)?Number(a):1);
				var shadowOpacity = bgOpacity * bgFillOpacity;
				shadowOpacity = (shadowOpacity==1)?shadowOpacity*0.5:shadowOpacity*0.2;
				this.shadowNode = map.Dom.newShape('rect',legendBody,map.Scale.normalX(3),map.Scale.normalY(-19),map.Scale.normalX(10),map.Scale.normalY(10),"fill:#444444;stroke:#888888;opacity:"+shadowOpacity+";");
				this.shadowNode = legendBody.insertBefore(this.shadowNode,legendBodyBg);
			}
			this.shadowNode.setAttributeNS(null,'width',map.Scale.legendWidth);
			this.shadowNode.setAttributeNS(null,'height',map.Scale.legendHeight-Number(legendBodyBg.getAttributeNS(null,'y'))+map.Scale.normalY(5));
			this.shadowNode.setAttributeNS(null,'rx',map.Scale.normalX(5));
			this.shadowNode.setAttributeNS(null,'ry',map.Scale.normalX(5));
		}

		legendBodyBg.setAttributeNS(szMapNs,"menu","legendmenu");
	}
	if ( legendBody && legendBg ){
		legendBg.setAttributeNS(null,'width',legendBox.x+legendBox.width-map.Scale.normalY(15));
	}
	if ( legendBody && legendBodySwitch && fInitLegendOff ){
		legendBody.style.setProperty('display','none',"");
		legendBodySwitch.style.setProperty('display','none',"");
	}

	// make clipping rect
	var newClipRect = null;
	// make frame clipping rect
	if ( legendBodyFr ){
		newClipRect = map.Dom.setClipRect(legendBodyFr,new box(0,0,1,1));

		var nMaxLegendBoxHeight = map.Scale.legendHeight-headerBox.height-footerBox.height;
		if ( legendBox.height <= nMaxLegendBoxHeight ){
			newClipRect.setAttributeNS(null,"width" ,map.Scale.legendWidth);
			newClipRect.setAttributeNS(null,"height",legendBox.y+legendBox.height+map.Scale.normalY(scrollBarWidth));
		}
		else{
			newClipRect.setAttributeNS(null,"width" ,map.Scale.legendWidth);
			newClipRect.setAttributeNS(null,"height",nMaxLegendBoxHeight);
		}

		if (legendBodyFt){
			legendBodyFt.fu = new Methods(legendBodyFt);
			// if legend not in map, footer on fix position
			if ( 1 || map.Scale.viewBox.width-map.Scale.bBox.width > 0 ){
				legendBodyFt.fu.setPosition(0,map.Scale.legendHeight-footerBox.height-map.Scale.normalY(2)); //-map.Scale.normalY(6));
			}
			// if legend in map, footer on variable position
			else{
				legendBodyFt.fu.setPosition(0,Math.min(headerBox.height+legendBox.height,map.Scale.legendHeight-footerBox.height));
			}
			// clip the footer
			map.Dom.setClipRect(legendBodyFt,new box(0,0,map.Scale.legendWidth-map.Scale.normalX(1),map.Scale.viewBox.height));
		}

		if (legendBodyHd){
			// clip the header
			map.Dom.setClipRect(legendBodyHd,new box(0,0,map.Scale.legendWidth-map.Scale.normalX(1),nMaxLegendBoxHeight));
		}

		if (legendTitle){
			// clip the Title
			map.Dom.setClipRect(legendTitle,new box(map.Scale.normalX(-20),map.Scale.normalY(-20),map.Scale.legendWidth-map.Scale.normalX(0),nMaxLegendBoxHeight));
		}

		// make scrollbars
		// ----------------
		if ( this.scrollObj ){
			var maxBox = new box(newClipRect.getAttributeNS(null,"x"),newClipRect.getAttributeNS(null,"y"),newClipRect.getAttributeNS(null,"width"),newClipRect.getAttributeNS(null,"height"));
			this.scrollObj.setWidth(maxBox.width/map.Scale.normalX(1));
			this.scrollObj.setHeight(maxBox.height/map.Scale.normalY(1));
			this.scrollObj.reformat(evt);
		}
		else{
			if ( 1 || legendBox.height > nMaxLegendBoxHeight){
				var legendBodyFrMove = SVGDoc.getElementById("legend_body:workspace:movabley");
				if (legendBodyFrMove){

					if (1){
						var maxBox = new box(newClipRect.getAttributeNS(null,"x"),newClipRect.getAttributeNS(null,"y"),newClipRect.getAttributeNS(null,"width"),newClipRect.getAttributeNS(null,"height"));
						this.scrollObj = new ScrollArea(evt,null,null,maxBox.width/map.Scale.normalX(1),maxBox.height/map.Scale.normalY(1),scrollBarWidth);
						this.scrollObj.workspaceNode = legendBodyFrMove;
						this.scrollObj.cliprectNode = newClipRect;
						if ( this.scrollObj ){
							this.scrollObj.reformat(evt);
						}
					}
					else{
						this.scrollObj = new ScrollBar(legendBodyFrMove,new point(0,0),map.Dom.getBox(newClipRect),map.Scale.normalX(scrollBarWidth),map.Scale.normalY(scrollBarWidth),map.Scale.normalX(1) );
						if ( this.scrollObj ){
							this.scrollObj.draw(evt);
						}
					}
				}
			}
		}
	}
	if ( fClipMapToLegend ){
		var mapClipRect = SVGDoc.getElementById("mapcliprect");
		if (mapClipRect){
			var mapBox = map.Dom.getBox(mapClipRect);
			var mapWidth = mapBox.x+mapBox.width;
			var nGap = map.Scale.normalX(5);
			mapClipRect.setAttributeNS(null,"x",map.Scale.legendWidth+nGap);
			mapClipRect.setAttributeNS(null,"width",mapWidth-map.Scale.legendWidth-nGap);
		}
	}
	this.fInitializing = false;

	// GR 25.09.2011 workaround IE9 !
	this.objNode.parentNode.appendChild(this.objNode);

	if ( !this.fHidden ){
		this.show();
	}

	return true;
};

Map.Legend.prototype.move = function(evt){
	mouseObject = new MouseObject(evt,this.objNode);
};

/**
 * reformat the legend after expand/collaps items 
 * @param evt the event
 */
Map.Legend.prototype.reformat = function(evt){
	_TRACE("Map.Legend.reformat()");
	if ( this.scrollObj ){
		this.scrollObj.reformat(evt);
	}
};
/**
 * hide the legend (group) 
 * @param evt the event
 */
Map.Legend.prototype.hide = function(evt){
	this.objNode.style.setProperty("display","none","");
	this.fHidden = true;
	var showButton = SVGDocument.getElementById('legend:show:button'); 
	if ( showButton ){
		showButton.style.setProperty("display","inline","");
	}
};
/**
 * show the legend (group)
 * @param evt the event
 */
Map.Legend.prototype.show = function(evt){
	this.objNode.style.setProperty("display","inline","");
	this.objNode.style.setProperty("opacity","1","");
	this.fHidden = false;
	var showButton = SVGDocument.getElementById('legend:show:button'); 
	if ( showButton ){
		showButton.style.setProperty("display","none","");
	}
};
/**
 * get legend position 
 * @param evt the event
 * @type point
 * @return the legend position in SVG coordinates
 */
Map.Legend.prototype.getPosition = function(evt){
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	var legendGroup  = SVGDoc.getElementById("legend:group");
	if ( legendGroup ){
		var matrixA = getMatrix(legendGroup);
		return new point(matrixA[4],matrixA[5]);
	}
	return new point(0,0);
};

/**
 * gets the box of legend parts (header,footer,...)
 * this function is necessary, because a simple getBBox() has problems with the clipping of the overviewmap
 * @param evt the event
 * @param legendPart the DOM node of the legend part
 * @return the requested box 
 */
function __getLegendPartBox(evt,legendPart){
	var partBox = new box(0,0,0,0);
	if ( legendPart ){
		try{
			if ( legendPart.nodeName == 'text' ){
				return map.Dom.getBox(legendPart);
			}
			var childNodes = legendPart.childNodes;
			for ( var i=0; i<childNodes.length; i++){
				if ( childNodes.item(i).nodeType==1 ){
					var ptScale = getScale(childNodes.item(i));
					var ptPos = getTranslate(childNodes.item(i));
					var bBox = map.Dom.getBox(childNodes.item(i));
					bBox.x = ptPos.x + bBox.x*ptScale.x;
					bBox.y = ptPos.y + bBox.y*ptScale.y;
					bBox.width*=ptScale.x;
					bBox.height*=ptScale.y;
					var szId = childNodes.item(i).getAttributeNS(null,"id");
					// if we have a clippath inside the header/footer, take its width and heigth !
					if ( szId.match(/overviewmap/) ){
						var embededClipPath = SVGDocument.getElementById("overviewmap:clippath"); 
						if ( embededClipPath ){
							bBox = map.Dom.getBox(embededClipPath);
							bBox.height = embededClipPath.firstChild.getAttribute("height");
							bBox.width  = embededClipPath.firstChild.getAttribute("width");
							bBox.height = partBox.height+bBox.height*map.Scale.getGroupScale(embededClipPath).y;
							bBox.width  = bBox.width*map.Scale.getGroupScale(embededClipPath).x;
						}
					}
					if ( isNaN(bBox.width) || isNaN(bBox.height) || bBox.width < 0 || bBox.height < 0 ){
						continue;
					}
					partBox.x	   = Math.min(partBox.x,bBox.x);
					partBox.y	   = Math.min(partBox.y,bBox.y);
					partBox.width  = Math.max(partBox.width,bBox.x+bBox.width);
					partBox.height = Math.max(partBox.height,bBox.y+bBox.height);
				}
			}
			if ( isNaN(partBox.width) || isNaN(partBox.height) || partBox.width < 0 || partBox.height < 0 ){
				partBox = new box(0,0,0,0);
			}
		}
		catch (e){
			partBox = new box(0,0,0,0);
		}
	}
	return partBox;
}
/**
 * checks and sets the initial collapse state of legend groups
 * @param evt the event handle
 * @param leadNode the legend DOM node, to start the checking with
 */
Map.Legend.prototype.checkGroupCollapse = function(evt,leadNode){
	var SVGDoc = evt?evt.target.ownerDocument:SVGDocument;
	if ( leadNode == null ){
		leadNode = SVGDoc.getElementById("legend_body:workspace:movabley");
	}
	if ( leadNode && leadNode.nodeType == 1 ){
		var groupNodesA = leadNode.childNodes;
		for ( var i=0; i<groupNodesA.length; i++ ){
			if ( groupNodesA.item(i).nodeType == 1 ){
				var szFlag = groupNodesA.item(i).getAttributeNS(szMapNs,"mode");
				if ( szFlag && szFlag.match(/HIDDEN/) ){
					var szId = groupNodesA.item(i).getAttributeNS(null,"id");
					var szIdA = szId.split(':');
					if ( szIdA[0] == 'legend' && szIdA[1] == 'item' ){
						var collapseButtonNode = SVGDoc.getElementById("legend:collapse:"+szIdA[2]);
						// GR 14.12.2006 layer checkboxes no longer collapse groups
						if ( 0 && !collapseButtonNode ){
							collapseButtonNode = SVGDoc.getElementById("legend:off:"+szIdA[2]);
						}
						this.legendMouseClick(evt,collapseButtonNode);
					}
				}
				this.checkGroupCollapse(evt,groupNodesA.item(i));
			}
		}
	}
};
/**
 * handles 'onmouseclick' events on the legend
 * @type boolean
 * @param evt the event handle
 * @param clickNode the legend node that has been clicked
 * @return true, if the click could be executed
 */
Map.Legend.prototype.legendMouseClick = function(evt,clickNode){
	if ( clickNode == null || clickNode.nodeType != 1 ){
		return false;
		}
	var szId = clickNode.getAttributeNS(null,'id');

	if ( szId && !szId.match(/legend/) ){
		return false;
	}

	if ( szId && szId.match(/this:item/) ){
		this.execLegendMouseClickOnItem(evt,clickNode,szId);
		return true;
	}

	var todoA = szId.split(':');
	for (var i=3;i<todoA.length;i++ ){
		todoA[2] += ':'+todoA[i];
	}

	// features
	if ( !this.execLegendMouseClick(evt,clickNode,todoA[2],todoA[1]) ){
		if ( !this.execLegendMouseClickOnTiles(evt,clickNode,todoA[2],todoA[1]) ){
			clearThemes();
			setMapTool("");	
		}
	}

	// label
	if (todoA[2] && !todoA[2].match(/:label/)){
		if ( map.Layer.isScaleDependentLayerOn(todoA[2]+":label") ){
			this.execLegendMouseClick(evt,clickNode,todoA[2]+":label",todoA[1]);
		}
	}

	return true;
};

/**
 * executes events on a legend button
 * @param evt the event handle
 * @param clickNode the legend button clicked
 * @param szThemeId the name of the resp. theme (layer)
 * @param szAction the action to perform
 * @param szOnlyClassName if this string is defined, use exclusively CSS to execute the event
 * @type boolean
 * @return true, if event could be executed
 */
Map.Legend.prototype.execLegendMouseClick = function(evt,clickNode,szThemeId,szAction,szOnlyClassName){

	if ( szThemeId == null || szAction == null ){
		return false;
		}
	if ( (szAction == 'mapzoom') && (!szThemeId.match(/label/)) ){
		map.Zoom.doZoomMap(szThemeId,'byfactor');
		return true;
		}
	if ( (szAction == 'textscale') && (!szThemeId.match(/label/)) ){
		map.Layer.changeLabelScaling(null,szThemeId,'byfactor');
		return true;
		}
	if ( (szAction == 'backwards') && (!szThemeId.match(/label/)) ){
		zoomAndPanHistory.backwards();
		return true;
		}
	if ( (szAction == 'activatetool') && (!szThemeId.match(/label/)) ){
		setMapTool(szThemeId);
		return true;
		}

	var szClassName = map.Dom.getAttributeByNodeOrParents(clickNode,szMapNs,"classname");
	// a 'legendgroup' is no layer
	if ( szClassName.match(/legendgroup/) ) {
		szClassName = null;
	}
	switch (szAction){
		case 'suboff':
			szAction = 'off';
		case 'off':
			if ( szOnlyClassName && szOnlyClassName.length ){
				map.Layer.switchLayerByCSS(evt,szThemeId,szClassName,'none');
			}
			else{
				if (szThemeId.match(/\'/)){
					map.Layer.switchLayer(evt,szThemeId,szClassName,false);
				}else{
					executeWithMessage("map.Layer.switchLayer(null,'"+szThemeId+"','"+szClassName+"',false)","...");
				}
			}
			clickNode.style.setProperty('display','none',"");
			if ( !szThemeId.match(/label/) && fCheckSublayerCollapse ){
				__checkCollapsable(clickNode,'collapse');
			}
			break;

		case 'on':
			if ( szOnlyClassName && szOnlyClassName.length ){
				map.Layer.switchLayerByCSS(evt,szThemeId,szClassName,'inline');
			}
			else{
				if (szThemeId.match(/\'/)){
					map.Layer.switchLayer(evt,szThemeId,szClassName,true);
				}else{
					executeWithMessage("map.Layer.switchLayer(null,'"+szThemeId+"','"+szClassName+"',true)","...");
				}
			}
			var szId = "legend:off:"+szThemeId;
			var targetNode = SVGDocument.getElementById(szId);
			if (targetNode){
				targetNode.style.setProperty('display','inline',"");
			}
			if ( !szThemeId.match(/label/) && fCheckSublayerCollapse ){
				__checkCollapsable(clickNode,'expand');
			}
			_TRACE("??????????????????????????????");
			map.Event.doDefaultZoom(evt);
			break;

		case 'collapse':
			clickNode.style.setProperty('display','none',"");
			__checkCollapsable(clickNode,'collapse');
			break;

		case 'expand':
			var szId = "legend:collapse:"+szThemeId;
			var targetNode = SVGDocument.getElementById(szId);
			if (targetNode){
				targetNode.style.setProperty('display','inline',"");
			}
			__checkCollapsable(clickNode,'expand');
			break;

		case 'minus':
			opacity = featureNode.style.getPropertyValue('opacity');
			opacity = opacity !== "" ? Number(opacity) : 1.0;
			if ( opacity > 0 ){
				opacity -= 0.1;
				featureNode.style.setProperty('opacity',String(opacity),"");
			}
			break;

		case 'plus':
			opacity = featureNode.style.getPropertyValue('opacity');
			opacity = opacity !== "" ? Number(opacity) : 1.0;
			if ( opacity < 1.0 ){
				opacity += 0.1;
				featureNode.style.setProperty('opacity',String(opacity),"");
			}
			break;

		case 'setactive':
			activateTheme(szThemeId);
			if (!szMapToolType.match(/select/)){
				setMapTool("info");
			}
			break;

		case 'item':
			try{
				this.lastItemObjectA[szThemeId].redraw();
			}
			catch (e){
			}
			break;

	}

	__setThemeState(szThemeId,szAction);

	return true;
};
/**
 * executes events on a legend item that is not a layer or sublayer.
 * <br>these items can be programmed freely to execute arbitrary functions (defined by onactivate='...')
 * @param evt the event handle
 * @param clickNode the legend button clicked
 * @param szId the id of the legend item
 * @type boolean
 * @return true, if event could be executed
 */
Map.Legend.prototype.execLegendMouseClickOnItem = function(evt,clickNode,szId){

	var szOnActivate = map.Dom.getAttributeByNodeOrParents(clickNode,szMapNs,"onactivate");
	_TRACE("szOnActivate="+szOnActivate);
	
	if ( szOnActivate && szOnActivate.length ){
		szIdA = szId.split(':');
		szAction = szIdA[1];
		szItem = szIdA[szIdA.length-1];
		_TRACE(szAction);
		switch (szAction){
			case 'off':
				clickNode.style.setProperty('display','none',"");
				try{
					if (this.lastItemObjectA[szItem]){
						this.lastItemObjectA[szItem].remove();
					}		
				}
				catch (e){
				}
				this.lastItemObjectA[szItem] = null;
				lastItemObject = null;
				break;

			case 'on':
				if (this.lastItemObjectA[szItem]){
					break;
				}
				var szThemeId = szId.substr(10,szId.length-10);
				var szId = "legend:off:"+szThemeId;
				var targetNode = SVGDocument.getElementById(szId);
				if (targetNode){
					targetNode.style.setProperty('display','inline',"");
				}
				try{
					this.lastItemObjectA[szItem] = eval(szOnActivate);
					if(this.lastItemObjectA[szItem]){
						this.lastItemObjectA[szItem].onremove = "map.Legend.setLegendCheckBox(null,'"+szId+"','unchecked');map.Legend.lastItemObjectA['"+szItem+"']=null;deactivateTheme('"+szItem+"')";
						this.lastItemObjectA[szItem].szItem = szItem;
					}
				}
				catch (e){
					alert("ERROR: "+e.description+" \nIN: "+szOnActivate);
				}
				break;
		}
	}

	return true;
};
/**
 * increases the opacity of the SVG group given by id
 * recalls itself by setTimeout(...) while flag map.Event.fMouseDown == true
 * @param szId the id of the group whichs opacity will be increased
 */
function __opacityPlus(szId){
	if ( !map.Event.fMouseDown ){
		return;
	}
	var featureNode = SVGDocument.getElementById(szId);
	var opacity = featureNode.style.getPropertyValue('opacity');
	opacity = opacity !== "" ? Number(opacity) : 1.0;
	if ( opacity < 1.0 ){
		opacity += 0.1;
		featureNode.style.setProperty('opacity',String(opacity),"");
		setTimeout("__opacityPlus('"+szId+"')",200);
	}
}
/**
 * decreases the opacity of the SVG group given by id
 * recalls itself by setTimeout(...) while flag map.Event.fMouseDown == true
 * @param szId the id of the group whichs opacity will be decreased
 */
function __opacityMinus(szId){
		if ( !map.Event.fMouseDown ){
		return;
	}
	var featureNode = SVGDocument.getElementById(szId);
	var opacity = featureNode.style.getPropertyValue('opacity');
	opacity = opacity !== "" ? Number(opacity) : 1.0;
	if ( opacity > 0 ){
		opacity -= 0.1;
		featureNode.style.setProperty('opacity',String(opacity),"");
		setTimeout("__opacityMinus('"+szId+"')",200);
	}
}

/**
 * executes events on a legend button if the target is tiled
 * @param evt the event handle
 * @param clickNode the legend button clicked
 * @param szThemeId the id of the theme (layer) in the legend
 * @param szAction the action to perform
 * @type boolean
 * @return true, if the event could be executed
 */
Map.Legend.prototype.execLegendMouseClickOnTiles = function(evt,clickNode,szThemeId,szAction){
	var nRet = false;
	if ( szThemeId && map.Tiles && map.Tiles.nCount > 0 ){
		var szTilesIdA  = map.Tiles.getTileNodeIds(szThemeId);
		for ( var i=0; i<szTilesIdA.length; i++ ){
			var szId = szTilesIdA[i];
			if ( this.execLegendMouseClick(evt,clickNode,szId,szAction) ) {
				nRet = true;
			}
		}
	}
	if (!nRet){
		var szClassName = map.Dom.getAttributeByNodeOrParents(clickNode,szMapNs,"classname");
		if ( szClassName && szClassName.length ){
			nRet = this.execLegendMouseClick(evt,clickNode,szThemeId,szAction,szClassName);
		}
	}
	return nRet;
};
/**
 * switch legend checkbox state
 * @param evt the event handle
 * @param szId the id of the legend item to change
 * @param szState checkbox state to set ('checked' or 'unchecked')
 */
Map.Legend.prototype.setLegendCheckBox = function(evt,szId,szState){
	_TRACE("setLegendCheckBox(evt,"+szId+","+szState+")");
	if ( szId.match(/legend/)){
		szIdA = szId.split(':');
		szId = "legend:off";
		for ( var i=2; i<szIdA.length; i++ ){
			szId += ":"+szIdA[i];
		}
	}
	var targetNode = SVGDocument.getElementById(szId);
	if (targetNode){
		targetNode.style.setProperty("display",szState=="checked"?"inline":"none","");
	}
};
/**
 * helper function, to switch the checkbox of a theme 
 * @param evt the event handle
 * @param szThemeId the id of the legend theme (layer) to switch
 * @param szDisplayAttribute 'none' or 'inline'
 */
Map.Legend.prototype.switchLegendCheckBox = function(evt,szThemeId,szDisplayAttribute){
	var szId = "legend:off:"+szThemeId;
	var targetNode = SVGDocument.getElementById(szId);
	if ( !targetNode ){
		targetNode = SVGDocument.getElementById(szId+":byclassname");
	}
	if (targetNode){
		targetNode.style.setProperty("display",szDisplayAttribute,"");
	}
	szId = "legend:setactive:"+szThemeId;
	targetNode = SVGDocument.getElementById(szId);
	if (targetNode){
		targetNode.style.setProperty("opacity",szDisplayAttribute == 'none' ? "0.4":"1","");
	}
};
/**
 * helper function, to actualize the theme state in the metadata 
 * @param szThemeId the id of the legend theme (layer) to switch
 * @param szAction the state to set
 */
function __setThemeState(szThemeId,szAction){
	var themeNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
	if (themeNodesA){
		for (var i=0;i<themeNodesA.length;i++){
			if ( themeNodesA.item(i).getAttributeNS(null,"name") == map.Tiles.getMasterId(szThemeId) ){
				themeNodesA.item(i).setAttributeNS(null,"state",szAction);
			}
		}
	}
}
/**
 * helper function, to actualize the theme state in the metadata 
 * @param szThemeId the id of the legend theme (layer) to switch
 * @param szAction the state to set
 */
function __getThemeState(szThemeId){
	var themeNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
	if (themeNodesA){
		for (var i=0;i<themeNodesA.length;i++){
			if ( themeNodesA.item(i).getAttributeNS(null,"name") == map.Tiles.getMasterId(szThemeId) ){
				return themeNodesA.item(i).getAttributeNS(null,"state");
			}
		}
	}
	return "none";
}
/**
 * helper function, to collapse or expand legend groups or themes (layer) 
 * @param targetNode the DOM node to start the procedure with
 * @param szAction 'collapse' or 'expand'
 */
function __checkCollapsable(targetNode,szAction){
	if ( targetNode == null ){
		return;
	}
	var szId = targetNode.getAttributeNS(null,"id");
	if ( szId.match(/label/)){
		return;
	}
    var i;
	var szIdA = szId.split(':');
	szId = szIdA[0] + ':item:' + szIdA[2];
	for ( i=3; i<szIdA.length; i++ ){
		szId = szId + ':' + szIdA[i];
	}
	var leadNode = targetNode.ownerDocument.getElementById(szId);
	if ( leadNode ){
		var itemBox;
		var deltaY;
		var placeHolder = null;
		var legendNodesA = leadNode.childNodes;
		for ( i=0; i<legendNodesA.length; i++ ){
			if ( (legendNodesA.item(i).nodeType == 1) && legendNodesA.item(i).getAttributeNS(null,"id") && legendNodesA.item(i).getAttributeNS(null,"id").match(/collapsable/) ){
				deltaY = 0;
				switch (szAction){
					case 'collapse':
						if ( legendNodesA.item(i).getAttributeNS(szMapNs,"state") == 'collapsed' || 
						     legendNodesA.item(i).getAttributeNS(null,"id").match(/placeholder/)) {
							break;
						}
						var endNode = targetNode.ownerDocument.getElementById(legendNodesA.item(i).getAttributeNS(null,"id")+":end");
						if (endNode){
							deltaY = -endNode.getAttributeNS(null,"y") + map.Scale.normalY(20);
						}else{
							itemBox = map.Dom.getBox(legendNodesA.item(i));
							deltaY = -itemBox.height;
						}
						if (1){
							placeHolder = map.Dom.newGroup(legendNodesA.item(i).parentNode,legendNodesA.item(i).getAttributeNS(null,"id")+":placeholder");
							placeHolder.setAttributeNS(szMapNs,"state",'collapsed');
							placeHolder.parentNode.insertBefore(placeHolder,legendNodesA.item(i));
							SVGHiddenGroup.appendChild(legendNodesA.item(i+1));
						}
						break;
					case 'expand':
						if ( !(legendNodesA.item(i).getAttributeNS(szMapNs,"state") == 'collapsed') && 
						     !(legendNodesA.item(i).getAttributeNS(null,"id").match(/placeholder/)) ) {
							break;
						}
						var origNode = null;
						if ( legendNodesA.item(i).getAttributeNS(null,"id").match(/placeholder/)){
							placeHolder = legendNodesA.item(i);
							var szOrigIdA = placeHolder.getAttributeNS(null,"id").split(':');
							var szOrigId = "";
							for ( i=0; i<szOrigIdA.length-1; i++ ){
								szOrigId += i>0?":":"";
								szOrigId += szOrigIdA[i];
							}
							origNode = SVGDocument.getElementById(szOrigId);
							placeHolder.parentNode.replaceChild(origNode,placeHolder);
							origNode = SVGDocument.getElementById(szOrigId);
						}
						else{
							origNode = legendNodesA.item(i);
						}
						origNode.setAttributeNS(szMapNs,"state",'expanded');
						var endNode = targetNode.ownerDocument.getElementById(origNode.getAttributeNS(null,"id")+":end");
						if (endNode){
							deltaY = endNode.getAttributeNS(null,"y") - map.Scale.normalY(20);
						}else{
							itemBox = map.Dom.getBox(origNode);
							deltaY = itemBox.height;
						}
						break;
				}
				var followingNode = leadNode.nextSibling;
				while ( followingNode && deltaY ){
					if ( followingNode.nodeType == 1 ){
						var matrixA = getMatrix(followingNode);
						matrixA[5] += deltaY;
						setMatrix(followingNode,matrixA);
					}
					followingNode = followingNode.nextSibling;
					if ( followingNode == null ){
						while ( leadNode.parentNode && leadNode.parentNode.getAttributeNS(null,"id").match(/legend/)){
							leadNode = leadNode.parentNode;
							if ( leadNode.getAttributeNS(null,"id").match(/item/) ){
								followingNode = leadNode.nextSibling;
								break;
							}
						}
					}
				}
				try{
					map.Legend.init(null);
				}
				catch (e){
				}
				return;
			}
		}
	}
}

// initialize   

zoomAndPanHistory = new History();

// initialize highlighting                                    
highLightList = new HighLight();

// .............................................................................
// EOF
// .............................................................................

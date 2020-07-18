/**********************************************************************
 mapquery.js

$Comment: provides JavaScript query functions for svggis
$Source : mapquery.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2004/12/15 $
$Author: guenter richter $
$Id: mapquery.js 7 2007-05-10 07:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: mapquery.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides the api classes for map querys<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

/* jshint funcscope:true, evil:true, eqnull:true, loopfunc:true, shadow: true, laxcomma: true, laxbreak: true, expr: true, sub: true*/
/* globals 
	document, window, alert, _TRACE, setTimeout,
	Map, map, thisversion, szMapNs, SVGDocument, SVGRootElement, SVGPopupGroup, 
	point, box, getMatrix, setMapTool,
	displayMessage, _activeTheme, _activeItem, displayInfo, displayInfoDelayed, clearThemes, highLightList
	*/

// .............................................................................
// Query  (search in attributes and texts)     
// .............................................................................

/**
 * Create a new Query instance.  
 * @class It realizes an object for defining and executing map querys (get information about the map themes and search items)
 * @constructor
 * @throws 
 * @return A new Query instance
 */
Map.Query = function(){
	this.themesA     = new Array(0);
	this.infoThemesA = new Array(0);
	this.foundNodesA = new Array(0);
	this.searchRecursion = 0;
};
Map.Query.prototype = new Map();

// create instance on load
if ( (typeof(thisversion) == "string") && map.checkVersion(thisversion) ){
	map.Query = new Map.Query(); 
}
else{
	alert("Map.Query incompatible !");
}

/**
 * get themes
 * return list with all themes within the map
 */
Map.Query.prototype.xgetThemes = function(){
	if (this.themesA.length === 0 && SVGDocument){
		var mapNode   = SVGDocument.getElementById("mapzoomandpan");
		if (mapNode){
			var featureNodes = mapNode.childNodes;
			for (var i=0;i<featureNodes.length;i++){
				if (featureNodes.item(i).nodeName == "g" ){
					var szID = featureNodes.item(i).getAttributeNS(null,"id");
					if( !szID.match(/label/) ){
						this.themesA[this.themesA.length] = featureNodes.item(i).getAttributeNS(null,"id");
					}
				}
			}
		}
	}
	return this.themesA;
};
/**
 * get themes
 * @return list with all themes within the map
 */
Map.Query.prototype.getThemes = function(){
	if (this.themesA.length === 0 && SVGDocument){
		var themeNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
		if (themeNodesA){
			for (var i=0;i<themeNodesA.length;i++){
				this.themesA[this.themesA.length] = themeNodesA.item(i).getAttributeNS(null,"name");
			}
		}
	}
	return this.themesA;
};
/**
 * get themes
 * return list with all themes within the map^which have an info attribute
 */
Map.Query.prototype.getThemesWithInfo = function(){
	if (this.infoThemesA.length === 0 && SVGDocument){
		var themeNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
		if (themeNodesA){
			for (var i=0;i<themeNodesA.length;i++){
				if ( themeNodesA.item(i).getAttributeNS(null,"flag").match(/info/) ){
					this.infoThemesA[this.infoThemesA.length] = themeNodesA.item(i).getAttributeNS(null,"name");
			    }
			}
		}
	}
	return this.infoThemesA;
};
/**
 * get themes with selection (lookup)
 * return list with all themes within the map^which have a selection attribute
 */
Map.Query.prototype.getThemesWithSelection = function(){
	if (this.infoThemesA.length === 0 && SVGDocument){
		var themeNodesA = SVGDocument.getElementsByTagNameNS(szMapNs,"theme");
		if (themeNodesA){
			for (var i=0;i<themeNodesA.length;i++){
				if ( themeNodesA.item(i).getAttributeNS(null,"selection").length ){
					this.infoThemesA[this.infoThemesA.length] = themeNodesA.item(i).getAttributeNS(null,"name");
			    }
			}
		}
	}
	return this.infoThemesA;
};
/**
 * get active theme
 * return the active theme
 */
Map.Query.prototype.getActiveTheme = function(){
	return _activeTheme;
};
/**
 * looks for the info attribute of the given map theme 
 * @param szTheme the given map theme
 * @return a list with all fields of the given map theme
 */
Map.Query.prototype.getFieldsOfTheme = function(szTheme){
	var fieldsA = new Array(0);
	if (SVGDocument){
		var themeNode   = SVGDocument.getElementById(szTheme);
		if (themeNode == null){
			if ( map.Tiles && map.Tiles.nCount > 0 ){
				for ( var y=0; (y < map.Tiles.nCount) && (themeNode == null); y++ ){
					for ( var x=0; (x < map.Tiles.nCount) && (themeNode == null); x++ ){
						themeNode = SVGDocument.getElementById(szTheme + "#" + "00"+String(y) + "00"+String(x));
					}
				}
			}
		}
		if (themeNode){
			var szFields = themeNode.getAttributeNS(szMapNs,"info");
			fieldsA = szFields.split("|");
		}
	}
	return fieldsA;
};
/**
 * looks for the values of a given field and theme 
 * @param szTheme the given map theme
 * @param szField the given field of the map theme
 * @return a list of all (different) values found
 */
Map.Query.prototype.getValuesOfFieldAndTheme = function(szTheme,szField,nMaxCount){
	var fieldsA = new Array(0);
	var i;
	if ( szTheme == null || szField == null ){
		return fieldsA;
	}
	if ( !nMaxCount ){
		nMaxCount = 100000;
	}
	// _TRACE("szTheme="+szTheme+"szField="+szField+"nMaxCount="+nMaxCount);
	if (SVGDocument){
		var themeNode   = SVGDocument.getElementById(szTheme);

		if (themeNode == null){
			var themeNodesA = map.Tiles.getTileNodes(szTheme);
			for ( var t=0; t<themeNodesA.length; t++){
				var tileFieldsA = this.getValuesOfFieldAndTheme(themeNodesA[t].getAttributeNS(null,"id"),szField,nMaxCount);
				for ( var f=0; f<tileFieldsA.length ;f++ ){
					fieldsA[fieldsA.length] = tileFieldsA[f];
				}
				if ((nMaxCount -= tileFieldsA.length) < 0 ){
					break;
				}
			}
			return fieldsA;
		}

		if (themeNode){
			var szFields = themeNode.getAttributeNS(szMapNs,"info");
			var szFieldsA = szFields.split("|");
			var nField = -1;
			var infoA = null;
			var szValue = null;
			for (i=0;i<szFieldsA.length;i++){
				if(szFieldsA[i] == szField){
					nField = i;
				}
			}
			if (nField>=0){
				var childsA = null;
				childsA = themeNode.getElementsByTagName('g');
				for (i=0;i<childsA.length;i++ ){
					if (childsA.item(i).nodeType == 1 ){
						infoA = (childsA.item(i).getAttributeNS(szMapNs,"info")||"").split('|');
						if (infoA.length > nField){
							if (infoA[nField].length){
								fieldsA[fieldsA.length] = infoA[nField];
								if ( fieldsA.length > nMaxCount ){
									return fieldsA;
								}
							}
						}
					}
				}
				childsA = themeNode.getElementsByTagName('path');
				for (i=0;i<childsA.length;i++ ){
					if (childsA.item(i).nodeType == 1 ){
						infoA = (childsA.item(i).getAttributeNS(szMapNs,"info")||"").split('|');
						if (infoA.length > nField){
							if (infoA[nField].length){
								fieldsA[fieldsA.length] = infoA[nField];
								if ( fieldsA.length > nMaxCount ){
									return fieldsA;
								}
							}
						}
					}
				}
				childsA = themeNode.getElementsByTagName('use');
				for (i=0;i<childsA.length;i++ ){
					if (childsA.item(i).nodeType == 1 ){
						infoA = (childsA.item(i).getAttributeNS(szMapNs,"info")||"").split('|');
						if (infoA.length > nField){
							if (infoA[nField].length){
								fieldsA[fieldsA.length] = infoA[nField];
								if ( fieldsA.length > nMaxCount ){
									return fieldsA;
								}
							}
						}
					}
				}
			}
		}
	}
	return fieldsA;
};
/**
 * looks for selection values in the given theme (layer) 
 * @param szTheme the given map theme
 * @param nMaxCount return maximal this count
 * @return a list of id's
 */
Map.Query.prototype.getSelectionValuesOfTheme = function(szTheme,nMaxCount){
	var valuesA = new Array(0);
	var i;
	if ( szTheme == null ){
		return valuesA;
	}
	if ( !nMaxCount ){
		nMaxCount = 100000;
	}
	if (SVGDocument){
		var themeNode  = SVGDocument.getElementById(szTheme);
		if (themeNode == null){
			var themeNodesA = map.Tiles.getTileNodes(szTheme);
		}else{
			var themeNodesA = new Array(themeNode);
		}
		for ( var t=0; t<themeNodesA.length; t++){
			var childsA = themeNodesA[t].getElementsByTagName('g');
			for ( var tt=0; tt<childsA.length; tt++){
				var szId = map.Tiles.getMasterId(childsA.item(tt).getAttributeNS(null,"id"));
				var szIdA = szId.split(":");
				valuesA.push(szIdA.pop());
				if ( valuesA.length > nMaxCount ){
					return valuesA;
				}
			}
		}
	}
	return valuesA;
};
/**
 * returns for the values of a given item and field 
 * @param szId the id of the item
 * @param szField the given field of the map theme
 * @return the field value or null
 */
Map.Query.prototype.getValueOfFieldAndItem = function(szId,szField){

	if (SVGDocument){
		var itemNode   = SVGDocument.getElementById(szId);
		if (itemNode == null){
			var itemNodesA = map.Tiles.getTileNodes(szId);
			itemNode = itemNodesA[0];
		}
		if (itemNode){
			var szValues = itemNode.getAttributeNS(szMapNs,"info");
			if ( !szValues || szValues.length === 0 ){
				var childsA = itemNode.childNodes;
				for ( var i=0;i<childsA.length;i++ ){
					if (childsA.item(i).nodeType == 1 ){
						szValues = childsA.item(i).getAttributeNS(szMapNs,"info");
					}
				}
			}
			var szValuesA = szValues.split("|");

			var themeNode = itemNode.parentNode;
			var szFields  = themeNode.getAttributeNS(szMapNs,"info");

			if ( szFields && szFields.length ){
				var szFieldsA = szFields.split("|");
				for ( var i=0; i<szFieldsA.length; i++ ){
					if ( szFieldsA[i] == szField ){
						return szValuesA[i];
					}
				}
			}
		}
	}
	return "?";
};
/**
 * returns for the values of a given item and field 
 * @param szId the id of the item
 * @param szField the given field of the map theme
 * @return the field value or null
 */
Map.Query.prototype.getClassnameOfItem = function(szId){
	var szClassname = null;
	if (SVGDocument){
		var itemNode   = SVGDocument.getElementById(szId);
		if (itemNode == null){
			var itemNodesA = map.Tiles.getTileNodes(szId);
			itemNode = itemNodesA[0];
		}
		if (itemNode){
			szClassname = itemNode.getAttributeNS(null,"class");
			if ( !szClassname || !szClassname.length ){
				var childsA = itemNode.childNodes();
				for ( var i=0; i<childsA.length; i++ ){
					var cNode = childsA.item(i);
					if ( cNode.nodeType == 1 ){
						szClassname = cNode.getAttributeNS(null,"class");
						if ( szClassname && szClassname.length ){
							break;
						}
					}
				}
			}
			if ( !szClassname || !szClassname.length ){
				var childsA = itemNode.childNodes();
				for ( var i=0; i<childsA.length; i++ ){
					var cNode = childsA.item(i);
					if ( cNode.nodeType == 1 ){
						szClassname = cNode.getAttributeNS(szMapNs,"value");
						if ( szClassname && szClassname.length ){
							break;
						}
					}
				}
			}

		}
	}
	return szClassname;
};
/**
 * insert a found Node into the query result list
 * @param nodeObj the found node
 * @param szTheme the query relevant theme
 * @param szValue the query relevant value 
 */
Map.Query.prototype.addFoundNode = function(nodeObj,szFeature,szItem,itemA){
	var szId = map.Tiles.getMasterId(nodeObj.parentNode.getAttributeNS(null,"id"));
	var szTheme = szId.split(':')[0];
	if ( szTheme && szTheme.length && szId && szId.length ){
		for ( var i=0; i<this.foundNodesA.length; i++){
			if ( this.foundNodesA[i].id		 == szId		&&
				 this.foundNodesA[i].feature == szFeature	&& 
				 this.foundNodesA[i].item	 == szItem		){
				return;
			}
		}
		this.foundNodesA[this.foundNodesA.length] = {node:nodeObj,id:szId,theme:szTheme,feature:szFeature,item:szItem,itemA:itemA};
	}
};
/**
 * simple search
 * search text within SVG shape attributes, and store nodes in list
 * @param szSearch the text to search
 * @param szMethod the search method: 'any','begin','whole'
 * @param szThemes restrict the search to this theme(s) 
 * @return a list with matching map shape nodes 
 */
Map.Query.prototype.searchItem = function(szSearch,szMethod,szThemes){

	_TRACE("searchItem("+szSearch+','+szMethod+','+szThemes+")");
	var i;
	this.foundNodesA.length = 0;
	if ( szSearch.length === 0 ){
		return this.foundNodesA;
	}

	this.szQuery = szSearch;

	var szSearchLower = szSearch.toLowerCase();
	var szSearchUpper = szSearch.toUpperCase();
	var szSearchSubst = szSearch.substr(0,1).toUpperCase()+szSearch.substr(1,szSearch.length-1).toLowerCase();

	var szSearchA = new Array(0);
	if (szSearchSubst != szSearch){
		szSearchA = new Array(szSearch,szSearchSubst,szSearchLower,szSearchUpper);
	}
	else{
		szSearchA = new Array(szSearch,szSearchLower);
	}

	this.szThemesA = szThemes.split('|');
	var nodeA = new Array(0);
	var childsA = map.Scale.canvasNode.getElementsByTagName('path');
	for ( i=0; i<childsA.length; i++){
		nodeA[nodeA.length] = childsA.item(i);
	}
	var childsB = map.Scale.canvasNode.getElementsByTagName('use');
	for ( i=0; i<childsB.length; i++){
		nodeA[nodeA.length] = childsB.item(i);
	}
	for ( i=0;i<nodeA.length;i++ ){
		if (nodeA[i].nodeType == 1 ){
			var fMatch = false;
			if (this.szThemesA[0] == "all"){
				fMatch = true;
			}
			else{
				var szId = map.Tiles.getMasterId(nodeA[i].parentNode.getAttributeNS(null,"id"));
				if ( szId && (szId.length !== 0) ){
					var szTest = szId.split(':')[0];
					for (var j=0; j<this.szThemesA.length; j++){
						if ( szTest == this.szThemesA[j] ){
							fMatch = true;
						}
					}
				}
			}
			if ( fMatch ){
				var szInfo = nodeA[i].getAttributeNS(szMapNs,"info") || nodeA[i].getAttributeNS(szMapNs,"tooltip");
				if ( szInfo==null || szInfo.length === 0 ){
					szInfo = nodeA[i].parentNode.getAttributeNS(szMapNs,"info") || nodeA[i].parentNode.getAttributeNS(szMapNs,"tooltip");
				}
				var infoA = szInfo.split('|');
				if ( szSearch == '*' ){
					this.addFoundNode(nodeA[i],"*","*",infoA);
				}
				else {
					for (var ii=0;ii<infoA.length;ii++ ){

						// here we test the items
						if ( infoA[ii].length && this.isEqualA(szSearchA,szMethod,infoA[ii]) ){
	//					if ( infoA[ii].length && this.isEqual(szSearch,szMethod,infoA[ii]) ){

							var featureA = map.Dom.getAttributeByNodeOrParents(nodeA[i].parentNode,szMapNs,"info");
							featureA = featureA.split('|');
							szId = map.Tiles.getMasterId(nodeA[i].parentNode.getAttributeNS(null,"id"));
							var szTheme = szId.split(':')[0];

							this.addFoundNode(nodeA[i],featureA[ii],infoA[ii],infoA);

	//						this.foundNodesA[this.foundNodesA.length] = {node:nodeA[i],id:szId,theme:szTheme,feature:featureA[ii],item:infoA[ii]};
						}
					}
				}
			}
		}
	}
	return this.foundNodesA;
};

/**
 * is equal to any item in array
 * compare value with query condition 
 * @param szSearchA the array of texts to search
 * @param szMethod the search method: 'any','begin','whole'
 * @param szTest the value to test
 * @return true or false 
 */
Map.Query.prototype.isEqualA = function(szSearchA,szMethod,szTest){

	for ( var i=0; i<szSearchA.length; i++ ){
		if ( this.isEqual(szSearchA[i],szMethod,szTest) ){
			return true;
		}
	}
	return false;
};
/**
 * is equal
 * compare value with query condition 
 * @param szSearch the text to search
 * @param szMethod the search method: 'any','begin','whole'
 * @param szTest the value to test
 * @return true or false 
 */
Map.Query.prototype.isEqual = function(szSearch,szMethod,szTest){

	switch ( szMethod ){
		case "any":
			return ( szTest.indexOf(szSearch) >= 0 );
		case "begin":
			return ( szTest.indexOf(szSearch) === 0 );
		case "whole":	
			return ( szTest == szSearch );
	}
	return false;
};

/**
 * advanced search
 * search values with query condition within theme(s)
 * @param szQuery  the query condition
 * @param szThemes restrict the search to this theme(s) 
 * @return a list with matching map shape nodes 
 */
Map.Query.prototype.searchItemAdvanced = function(szQuery,szTheme){
	var i,ii;
	var nIndex;

	if (this.searchRecursion === 0){
		this.foundNodesA.length = 0;
		this.szThemesA = new Array(szTheme);
	}
	if ( szQuery.length === 0 ){
		return this.foundNodesA;
	}

	this.szQuery = szQuery;

	var szQueryP = new Array(0);
	var szQueryA = szQuery.split(' ');
	szQueryP[szQueryP.length] = "";
	for ( i=0; i<szQueryA.length; i++){
		if( szQueryA[i].length ){
			if( "< == > <= <> >= and or like".indexOf(szQueryA[i]) != -1 ){
				szQueryP[szQueryP.length] = szQueryA[i];
				szQueryP[szQueryP.length] = "";
			}
			else{
				if ( szQueryP[szQueryP.length-1].length ){
					szQueryP[szQueryP.length-1] += " ";
				}
				szQueryP[szQueryP.length-1] += szQueryA[i];
			}
		}
	}
	// check query has at least 3 terms
	if (szQueryP.length < 3){
		return this.foundNodesA;
	}

	// check query syntax
	for ( i=1; i<szQueryP.length; i+=2 ){
		if( "< == > <= <> >= and or like".indexOf(szQueryP[i]) == -1 ){
			alert(szQueryP[i]+" is not an operator");
			return this.foundNodesA;
		}
	}

	// build query object
	var thisQuery = new _Query();
	thisQuery.newPart();

	for ( i=0; i<szQueryP.length ; i+=4 ){
		thisQuery.actPart.addCondition(szQueryP[i],szQueryP[i+1],szQueryP[i+2]);
		switch(szQueryP[i+3]){
			case 'and': break;
			case 'or':  thisQuery.newPart(); break;
			default: i=10000;
		}
	}

	/* 
	// debug print query 
	var anzParts = thisQuery.partA.length;
	var szAlert= "Query Parts: "+anzParts+"\n";
	for ( i=0; i<anzParts; i++ ){
		anzConditions = thisQuery.partA[i].conditionA.length;
		szAlert += "Part "+i+" Conditions: "+anzConditions;
		szAlert += "\n";
		for ( ii=0; ii<anzConditions; ii++ ){
			szAlert += thisQuery.partA[i].conditionA[ii].szTopic+' ';
			szAlert += thisQuery.partA[i].conditionA[ii].szOperator+' ';
			szAlert += thisQuery.partA[i].conditionA[ii].szValue;
			szAlert += "\n";
		}
	}
	*/

	if (SVGDocument){
		var themeNode   = SVGDocument.getElementById(szTheme);

		if (themeNode == null){
			var themeNodesA = map.Tiles.getTileNodes(szTheme);
			this.searchRecursion++;
			for ( var t=0; t<themeNodesA.length; t++){
				this.searchItemAdvanced(szQuery,themeNodesA[t].getAttributeNS(null,"id"));
			}
			this.searchRecursion=0;
			return this.foundNodesA;
		}

		if (themeNode){
			// get field array
			var szFields = themeNode.getAttributeNS(szMapNs,"info");
			var szFieldsA = szFields.split("|");
			for ( i=0;i<szFieldsA.length;i++){
				szFieldsA[szFieldsA[i]] = i;
			}
			var childsA = null;
			var infoA = null;
			childsA = themeNode.getElementsByTagName('path');
			if (childsA && childsA.length){
				infoA = childsA.item(0).getAttributeNS(szMapNs,"info");
			}
			if (infoA == null || infoA.length === 0){
				childsA = themeNode.getElementsByTagName('use');
			}
			if (childsA && childsA.length){
				infoA = childsA.item(0).getAttributeNS(szMapNs,"info");
			}
			if (infoA == null || infoA.length === 0){
				childsA = themeNode.getElementsByTagName('g');
			}
			for ( i=0;i<childsA.length;i++ ){
				if (childsA.item(i).nodeType == 1 ){
					infoA = childsA.item(i).getAttributeNS(szMapNs,"info").split('|');

					var anzParts = thisQuery.partA.length;
					for (var p=0; p<anzParts; p++){
						var fOK = true;
						var anzConditions = thisQuery.partA[p].conditionA.length;
						for (var c=0; c<anzConditions; c++){
							nIndex = szFieldsA[thisQuery.partA[p].conditionA[c].szTopic];
							switch(thisQuery.partA[p].conditionA[c].szOperator){
								case '<':  fOK = (Number(infoA[nIndex]) <  thisQuery.partA[p].conditionA[c].szValue); break;
								case '==': fOK = ((infoA[nIndex])       == thisQuery.partA[p].conditionA[c].szValue); break;
								case '>':  fOK = (Number(infoA[nIndex]) >  thisQuery.partA[p].conditionA[c].szValue); break;
								case '<=': fOK = (Number(infoA[nIndex]) <= thisQuery.partA[p].conditionA[c].szValue); break;
								case '<>': fOK = (Number(infoA[nIndex]) != thisQuery.partA[p].conditionA[c].szValue); break;
								case '>=': fOK = (Number(infoA[nIndex]) >= thisQuery.partA[p].conditionA[c].szValue); break;
								}
							if (fOK === false){
								break;
							}
						}
						if(fOK){
							var szFeature = thisQuery.partA[0].conditionA[0].szTopic;
							nIndex = szFieldsA[szFeature];
							this.addFoundNode(childsA.item(i),szFeature,null,infoA);
//							this.foundNodesA[this.foundNodesA.length] = {node:childsA.item(i),theme:szTheme,feature:szFeature,itemA:infoA};
						}
					}
				}
			}
		}
	}
	return this.foundNodesA;
};
/**
 * search for items with spezified attribute
 * @param szAttribute the attribute to look for
 * @param szValue the attribute value to match
 * @return a list with matching map shape nodes 
 */
Map.Query.prototype.searchItemByAttribute = function(szAttribute,szValue){
	this.foundNodesA.length = 0;
	var nodeA = new Array(0);

	var childsA = SVGRootElement.getElementsByTagName('path');
	for ( var i=0; i<childsA.length; i++){
		nodeA[nodeA.length] = childsA.item(i);
	}
	childsA = SVGRootElement.getElementsByTagName('use');
	for ( i=0; i<childsA.length; i++){
		nodeA[nodeA.length] = childsA.item(i);
	}
	childsA = SVGRootElement.getElementsByTagName('g');
	for ( i=0; i<childsA.length; i++){
		nodeA[nodeA.length] = childsA.item(i);
	}
	for ( i=0; i<nodeA.length; i++){
		if ( nodeA[i].getAttributeNS(null,szAttribute) == szValue ){
			var szInfo = nodeA[i].getAttributeNS(szMapNs,"info");
			if ( szInfo==null || szInfo.length === 0 ){
				szInfo = nodeA[i].parentNode.getAttributeNS(szMapNs,"info");
			}
			var infoA = szInfo.split('|');
			this.addFoundNode(nodeA[i],null,null,infoA);
		}
		if ( nodeA[i].getAttributeNS(szMapNs,szAttribute) == szValue ){
			var szInfo = nodeA[i].getAttributeNS(szMapNs,"info");
			if ( szInfo==null || szInfo.length === 0 ){
				szInfo = nodeA[i].parentNode.getAttributeNS(szMapNs,"info");
			}
			var infoA = szInfo.split('|');
			this.addFoundNode(nodeA[i],null,null,infoA);
		}
	}
	return this.foundNodesA;
};
/**
 * highlight and/or position to the found item
 * zoom and pans the map 
 * optional: zoom the map to a predefined level
 *			 zoom the map to the item extend
 * @param nIndex the index of the item within the list of found items
 * @param mode   different highlight and zooming modes
 * @param newZoom predefined zoom 
 */
Map.Query.prototype.gotoFoundItem = function(nIndex,mode,newZoom){
	if (map.Query){
		if (mode == '0'){
			map.Query.execGotoFoundItem(nIndex,mode,newZoom);
		}
		else{
			displayMessage("please wait ...",500);
			setTimeout("map.Query.execGotoFoundItem("+nIndex+",'"+mode+"',"+newZoom+")",100);
		}
	}
};
Map.Query.prototype.execGotoFoundItem = function(nIndex,mode,newZoom){
	var i;
	var bBox;

	if(SVGPopupGroup){
		SVGPopupGroup.fu.clear();
	}
	if (mode == null || mode == 'undefined' ){
		mode = '3';
	}
	// _TRACE("execGotoFoundItem: "+nIndex+','+mode+','+newZoom);
	if (nIndex < 0){

		if ( mode == 'select'){
			var szSelectId  = "select:"+this.szThemesA[0]+":found:"+this.foundNodesA.length;
			var newSelection = map.Selections.newSelection(this.szThemesA[0],this.foundNodesA,"type:queryresult",this.szQuery);
		}
		else
		if ( mode == 'zoomto'){
			var zoomNode = SVGDocument.getElementById("mapzoomandpan");
			if ( zoomNode ){
				var pStart = new point(100000,100000);
				var pEnd   = new point(-100000,-100000);
				for ( i=0; i<this.foundNodesA.length; i++){
					bBox = map.Dom.getBox(this.foundNodesA[i].node);
					if ( bBox.width === 0 || bBox.height === 0 ){
						var nodeMatrixA = getMatrix(this.foundNodesA[i].node);
						bBox.x += nodeMatrixA[4]; 
						bBox.y += nodeMatrixA[5]; 
						bBox.width  = map.Scale.viewBox.width/20;
						bBox.height = map.Scale.viewBox.height/20;
						bBox.x -= bBox.width/2;
						bBox.y -= bBox.height/2;
					}
					var ptOffset = map.Scale.getMapOffset(this.foundNodesA[i].node);
					bBox.x += ptOffset.x;
					bBox.y += ptOffset.y;
					pStart.x = Math.min(pStart.x,bBox.x);
					pStart.y = Math.min(pStart.y,bBox.y);
					pEnd.x   = Math.max(pEnd.x,bBox.x+bBox.width);
					pEnd.y   = Math.max(pEnd.y,bBox.y+bBox.height);
				}
				var allBox = new box(pStart.x,pStart.y,pEnd.x-pStart.x,pEnd.y-pStart.y);
				// _TRACE("gotoFoundItem - zoomto-all: "+pStart.x+','+pStart.y+','+(pEnd.x-pStart.x)+','+(pEnd.y-pStart.y));
				allBox.scale(1.2);
				allBox =  map.Zoom.clipArea(allBox);
				map.Zoom.setNewArea(allBox);
				if (this.foundNodesA.length == 1){
					displayInfoDelayed(null, this.foundNodesA[0].node,1000);
				}
				return;
			}
		}
		else {
			clearThemes();
			highLightList.removeAll();
			for ( i=0; i<this.foundNodesA.length; i++){

				if ( !mode.match(/info/) || !map.Themes.isNodePartOfAnyTheme(this.foundNodesA[i].node) ){
					var shapeNodesA = map.Layer.getLayerItemNodes(this.foundNodesA[i].node);
					for ( var n=0; n<shapeNodesA.length; n++ ){
						highLightList.addItem(shapeNodesA[n]);
					}
					highLightList.startToggle();
				}
				if ( mode.match(/info/) ){
					displayInfo(null, this.foundNodesA[i].node,"add|fix");
				}
			}
			setMapTool("info");	
		}
		return;
	}

	if (nIndex < this.foundNodesA.length){

		var foundNode = this.foundNodesA[nIndex].node;
		_activeItem = foundNode;
		_activeTheme = null;
		clearThemes();
		highLightList.removeAll();

		if ( !map.Themes.isNodePartOfAnyTheme(foundNode) ){
			var shapeNodesA = map.Layer.getLayerItemNodes(foundNode);
			for ( var n=0; n<shapeNodesA.length; n++ ){
				highLightList.addItem(shapeNodesA[n]);
			}
			highLightList.startToggle();
		}

		if (mode == '0' && map.Scale.nZoomScale == 1){
			displayInfo(null,foundNode);
			return;
		}
		// position to found shape
		bBox = map.Dom.getBox(foundNode);
		bBox = new box(bBox.x,bBox.y,bBox.width,bBox.height);
		if ( bBox.width === 0 || bBox.height === 0 ){
			var zoomBox = map.Zoom.getBox();
			nodeMatrixA = getMatrix(foundNode);
			bBox.x += nodeMatrixA[4]; 
			bBox.y += nodeMatrixA[5]; 
			bBox.width  = Math.min(zoomBox.width,map.Scale.bBox.width/10);
			bBox.height = Math.min(zoomBox.height,map.Scale.bBox.height/10);
			bBox.x -= bBox.width/2;
			bBox.y -= bBox.height/2;
		}
		ptOffset = map.Scale.getMapOffset(foundNode);
		bBox.x += ptOffset.x;
		bBox.y += ptOffset.y;
		if (mode == '0'){
			if ( map.Zoom.isVisibleBox(bBox) ){
				displayInfo(null,foundNode);
				return;
			}
			var zoomBox = map.Zoom.getBox();
			var nScale = Math.min(zoomBox.width/bBox.width,zoomBox.height/bBox.height);
			bBox.scale(nScale);
		}else{
			bBox.scale(2.0);
		}
		bBox =  map.Zoom.clipArea(bBox);
		if (mode == '0'){
			// _TRACE("gotoFoundItem - centerto: "+bBox.x+','+bBox.y+','+bBox.width+','+bBox.height);
			map.Zoom.setNewCenter(bBox);
			displayInfoDelayed(null,foundNode,1000);
		}
		else{
			// _TRACE("gotoFoundItem - zoomto: "+bBox.x+','+bBox.y+','+bBox.width+','+bBox.height);
			map.Zoom.setNewArea(bBox);
			displayInfoDelayed(null,foundNode,1000);
		}
	}
};

/**
 * This is the _Query class.  
 * It realizes an object for advanced db queries
 * @constructor
 * @throws 
 * @return A new _Query Object
 */
function _Query() {
	this.partA = new Array(0);
}
/**
 * adds one query part
 */
_Query.prototype.newPart = function(){
	this.partA[this.partA.length] = this.actPart = new _QueryPart();
};
function _QueryPart() {
	this.conditionA = new Array(0);
}
/**
 * adds one query condition
 */
_QueryPart.prototype.addCondition = function(szTopic,szOperator,szValue){
	this.conditionA[this.conditionA.length] = new _QueryCondition(szTopic,szOperator,szValue);
};

/**
 * This is the _QueryCondition class.  
 * It defines one query condition
 * @constructor
 * @throws 
 * @parameter szTopic the theme field to search for values
 * @parameter szOperator boolean operator 
 * @parameter szValue the compare value for condition 
 * @return A new _QueryCondition Object
 */
function _QueryCondition(szTopic,szOperator,szValue) {
	this.szTopic = szTopic;
	this.szOperator = szOperator;
	this.szValue = szValue;
}

// .............................................................................
// EOF
// .............................................................................


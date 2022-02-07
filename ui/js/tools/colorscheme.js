/**********************************************************************
 colorscheme.js

$Comment: provides colorscheme functions 
$Source : colorscheme.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2005/03/14 $
$Author: guenter richter $
$Id: colorscheme.js 7 2007-05-10 07:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: colorscheme.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides colorscheme functions to create charts and coroplethe shapes<br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.1 
 */

if ( typeof(szMapNs) == "undefined" ){
	var szMapNs = "http:"+"/"+"/"+"www.medienobjekte.de";
}


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
 * calculate and return a color that is a good border color for the given color
 * @param cc0 the original color
 */
function _circ_getBorderColor(cc0){

	cc0 = _circ_getHexaColor(cc0);

	var rr, gg, bb, hh="0123456789abcdef";
    rr=parseInt(cc0.substr(1,2),16);
    gg=parseInt(cc0.substr(3,2),16);
    bb=parseInt(cc0.substr(5,2),16);

	if ( rr > 127 && gg > 127 && bb > 127  ){
		return ( _circ_getDerivateColor(cc0,0.7) );
	}else{
		return ( _circ_getDerivateColor(cc0,1.4) );
	}
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

/**
 * calculate and return a color sequence ( n colors from coror a to color b )
 * @param cc1 the start color
 * @param cc2 the end color
 * @param nSteps the number of steps from color1 to color2
 */
function _circ_createColorScheme(cc1, cc2, nSteps, nParam1, nParam2 ){

	if ( cc1 == "spectrum" ||
		 cc1 == "Spectrum" ||
		 cc1 == "SPECTRUM" ||
		 cc1 == "spectral" ||
		 cc1 == "Spectral" ||
		 cc1 == "SPECTRAL" ){
		return _circ_createSpectrumColorScheme(nSteps, cc2, nParam1, nParam2);
	}
	if ( cc1 == "office" ||
		 cc1 == "OFFICE" ||
		 cc1 == "Office" ){
		return _circ_createPaletteColorScheme("office",nSteps,Number(cc2));
	}
	if ( cc1 == "mineral" ||
		 cc1 == "MINERAL" ||
		 cc1 == "Minaral" ){
		return _circ_createPaletteColorScheme("mineral",nSteps,Number(cc2));
	}
	if ( cc1 == "pastel" ||
		 cc1 == "PASTEL" ||
		 cc1 == "Pastel" ){
		return _circ_createPaletteColorScheme("pastel",nSteps,Number(cc2));
	}
	if ( cc1 == "harvest" ||
		 cc1 == "HARVEST" ||
		 cc1 == "Harvest" ){
		return _circ_createPaletteColorScheme("harvest",nSteps,Number(cc2));
	}
	if ( cc1 == "fruit" ||
		 cc1 == "FRUIT" ||
		 cc1 == "Fruit" ){
		return _circ_createPaletteColorScheme("fruit",nSteps,Number(cc2));
	}
	if ( cc1 == "kmeans" ||
		 cc1 == "KMEANS" ||
		 cc1 == "Kmeans" ){
		return _circ_createPaletteColorScheme("kmeans",nSteps,Number(cc2));
	}
	if ( cc1 == "kmeansp" ||
		 cc1 == "KMEANSP" ||
		 cc1 == "Kmeansp" ){
		return _circ_createPaletteColorScheme("kmeansp",nSteps,Number(cc2));
	}
	if ( cc1 == "pimp" ||
		 cc1 == "PIMP" ||
		 cc1 == "Pimp" ){
		return _circ_createPaletteColorScheme("pimp",nSteps,Number(cc2));
	}
	if ( cc1 == "intense" ||
		 cc1 == "INTENSE" ||
		 cc1 == "Intense" ){
		return _circ_createPaletteColorScheme("intense",nSteps,Number(cc2));
	}
	if ( cc1 == "fluo" ||
		 cc1 == "FLUO" ||
		 cc1 == "Fluo" ){
		return _circ_createPaletteColorScheme("fluo",nSteps,Number(cc2));
	}
	if ( cc1 == "tableau" ||
		 cc1 == "TABLEAU" ||
		 cc1 == "Tableau" ){
		return _circ_createPaletteColorScheme("tableau",nSteps,Number(cc2));
	}
	if ( cc1 == "tableau10" ||
		 cc1 == "TABLEAU10" ||
		 cc1 == "Tableau10" ){
		return _circ_createPaletteColorScheme("tableau10",nSteps,Number(cc2));
	}
	if ( cc1 == "tableau20" ||
		 cc1 == "TABLEAU20" ||
		 cc1 == "Tableau20" ){
		return _circ_createPaletteColorScheme("tableau20",nSteps,Number(cc2));
	}
	nSteps = Number(nSteps);	

	if ( nSteps < 2 ){
		return new Array(cc2);
	}
	if ( nSteps < 3 ){
		return new Array(cc1, cc2);
	}

	if ( typeof(cc1) != "string" ){
		cc1 = "#ffffff";
	}
	if ( typeof(cc2) != "string" ){
		cc2 = "#000000";
	}
	cc1 = _circ_getHexaColor(cc1);
	cc2 = _circ_getHexaColor(cc2);

	var hh="0123456789abcdef";

	var rr1, gg1, bb1;
    rr1=parseInt(cc1.substr(1,2),16);
    gg1=parseInt(cc1.substr(3,2),16);
    bb1=parseInt(cc1.substr(5,2),16);

	var rr2, gg2, bb2;
	rr2=parseInt(cc2.substr(1,2),16);
    gg2=parseInt(cc2.substr(3,2),16);
    bb2=parseInt(cc2.substr(5,2),16);

	var cc3 = '#FFFDE0';
	var rr3, gg3, bb3;
	if ( (rr1+gg1+bb1)/3 > 127 || (rr2+gg2+bb2)/3 > 127 ){
		rr3=Math.min(255,(rr1+rr2)*0.55);
		gg3=Math.min(255,(gg1+gg2)*0.55);
		bb3=Math.min(255,(bb1+bb2)*0.55);
		cc3 = "#";
		cc3 += hh.charAt(Math.floor(rr3/16))+hh.charAt(rr3%16);
		cc3 += hh.charAt(Math.floor(gg3/16))+hh.charAt(gg3%16);
		cc3 += hh.charAt(Math.floor(bb3/16))+hh.charAt(bb3%16);
	}
	if ( nParam1 == 'auto' || nParam2 == 'auto' ){
		rr3=Math.min(255,(rr1+rr2)*1.5);
		gg3=Math.min(255,(gg1+gg2)*1.5);
		bb3=Math.min(255,(bb1+bb2)*1.5);
		cc3 = "#";
		cc3 += hh.charAt(Math.floor(rr3/16))+hh.charAt(rr3%16);
		cc3 += hh.charAt(Math.floor(gg3/16))+hh.charAt(gg3%16);
		cc3 += hh.charAt(Math.floor(bb3/16))+hh.charAt(bb3%16);
		nParam1 = nParam2 = 'auto';
	}

	if ( nParam1 ){
		switch( nParam1 ){
			case 'auto':
			case 'linear':
			case 'dynamic':
			case '2colors':
			case '2wide':
			case '2narrow':
			case '2low':
			case '2high':
			case '3colors':
			case '3wide':
			case '3narrow':
			case '3low':
			case '3high':
				break;
			default:
				cc3 = _circ_getHexaColor(nParam1);
				nParam1 = 'auto';
				if ( cc3.substr(0,1) != '#' ){
					cc3 = '#FFFDE0';
				}
		}
	}
	if ( !nParam1 ){
		nParam1 = 'auto';
	}
	if ( nParam2 ){
		switch( nParam2 ){
			case 'shift':
				break;
			case 'auto':
			case 'linear':
			case 'dynamic':
			case '2colors':
			case '2wide':
			case '2narrow':
			case '2low':
			case '2high':
			case '3colors':
			case '3wide':
			case '3narrow':
			case '3low':
			case '3high':
				nParam1 = nParam2;
				break;
			case 'warm':
				cc3 = '#FFFDD8';
				break;
			case 'cold':
				cc3 = '#FFFFFF';
				break;
			default:
				cc3 = _circ_getHexaColor(nParam2);
				if ( cc3.substr(0,1) != '#' ){
					cc3 = '#FFFDE0';
				}
		}
	}

	// set middle color for 2 color sweeps
	// -----------------------------------
	rr3=parseInt(cc3.substr(1,2),16);
	gg3=parseInt(cc3.substr(3,2),16);
	bb3=parseInt(cc3.substr(5,2),16);
	
	// 1. generate linear sweep from cc1 to cc2 
	// ---------------------------------------------------
	if ( nParam1 == 'linear' ){
		var dr = (rr2-rr1)/(nSteps-1);
		var dg = (gg2-gg1)/(nSteps-1);
		var db = (bb2-bb1)/(nSteps-1);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		for (var i=0;i<nSteps;i++){
			rr=Math.floor(rr1+dr*i); 
			gg=Math.floor(gg1+dg*i);
			bb=Math.floor(bb1+db*i);

			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		return(ssA);
	}
	// 1.1 generate dynamic sweep from cc1 to cc2 (low range expanded) 
	// ------------------------------------------------------------------------
	else if ( (nParam1 == 'dynamic') || ( (nParam1 == 'auto') && ( (rr1+gg1+bb1)/3 > 127 || (rr2+gg2+bb2)/3 > 127 ) ) ){
		var nnSteps = 0;

		// GR 09.04.2014 make one step more and skip first color 
		var nShift = (nParam2 == 'shift')?1:0;
		// GR 09.04.2014 +nShift to get a slightly colored first value
		for (var i=0;i<(nSteps+nShift);i++){
			nnSteps += i;
		}	
		var dr = (rr2-rr1)/(nnSteps);
		var dg = (gg2-gg1)/(nnSteps);
		var db = (bb2-bb1)/(nnSteps);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		nnSteps = 0;
		// GR 09.04.2014 +nShift to get a slightly colored first value
		for (var i=nShift;i<(nSteps+nShift);i++){
			nnSteps += i;
			rr=Math.floor(rr1+dr*nnSteps); 
			gg=Math.floor(gg1+dg*nnSteps);
			bb=Math.floor(bb1+db*nnSteps);

			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		return(ssA);
	}
	// 2. generate 2 color sweep - cc1 -> white -> cc2  
	// ------------------------------------------------------------------------
	else if ( nParam1 == 'auto' || nParam1 == '2colors' || nParam1 == '2high' || nParam1 == '2low'||
								   nParam1 == '3colors' || nParam1 == '3high' || nParam1 == '3low' ){

		var nPart1 = 0.5;
		switch ( nParam1 ){
			case '2low':	nPart1 = 0.75;	break;
			case '2high':	nPart1 = 0.23;	break;
			case '3low':	nPart1 = 0.75;	break;
			case '3high':	nPart1 = 0.23;	break;
			default:	break;
		}
		var nPart2 = 1 - nPart1;

		var dr1 = (rr3-rr1)/((nSteps-1)*nPart1);
		var dg1 = (gg3-gg1)/((nSteps-1)*nPart1);
		var db1 = (bb3-bb1)/((nSteps-1)*nPart1);

		var dr2 = (rr3-rr2)/((nSteps-1)*nPart2);
		var dg2 = (gg3-gg2)/((nSteps-1)*nPart2);
		var db2 = (bb3-bb2)/((nSteps-1)*nPart2);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		rr = rr1;
		gg = gg1;
		bb = bb1;

		for (var i=0;i<nSteps-1;i++){

			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;

			if ( i < (nSteps-1)*nPart1 ){
				rr += dr1; 
				gg += dg1;
				bb += db1;
			}
			else{
				rr -= dr2; 
				gg -= dg2;
				bb -= db2;
			}
			rr = Math.max(Math.min(255,rr),0);
			gg = Math.max(Math.min(255,gg),0);
			bb = Math.max(Math.min(255,bb),0);
		}

		ssA[ssA.length] = cc2;

		return(ssA);
	}
	// 2.1 generate 2 color sweep with compressed mid range
	// ---------------------------------------------------------------------------------
	else if (nParam1 == '2narrow' || nParam1 == '3narrow'){

		var nnSteps = 0;
		for (var i=0;i<nSteps/2;i++){
			nnSteps += i;
		}
	
		var dr1 = (rr3-rr1)/(nnSteps+1);
		var dg1 = (gg3-gg1)/(nnSteps+1);
		var db1 = (bb3-bb1)/(nnSteps+1);

		var dr2 = (rr3-rr2)/(nnSteps+1);
		var dg2 = (gg3-gg2)/(nnSteps+1);
		var db2 = (bb3-bb2)/(nnSteps+1);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		rr = rr1;
		gg = gg1;
		bb = bb1;

		for (var i=0;i<nSteps-1;i++){

			if ( i < nSteps/2 ){
				rr += dr1*i; 
				gg += dg1*i;
				bb += db1*i;
			}
			else{
				rr -= dr2*(nSteps-1-i); 
				gg -= dg2*(nSteps-1-i);
				bb -= db2*(nSteps-1-i);
			}
			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		ssA[ssA.length] = cc2;

		return(ssA);
	}
	// 2.2 generate 2 color sweep with expanded mid range
	// ---------------------------------------------------------------------------------
	else if (nParam1 == '2wide' || nParam1 == '3wide'){
		var nnSteps = 0;
		for (var i=0;i<nSteps/2;i++){
			nnSteps += i;
		}
		var nxSteps = Math.floor((nSteps/2 - Math.floor(nSteps/2)) * nSteps/2);
		nnSteps -= nxSteps;
	
		var dr1 = (rr3-rr1)/(nnSteps+1);
		var dg1 = (gg3-gg1)/(nnSteps+1);
		var db1 = (bb3-bb1)/(nnSteps+1);

		var dr2 = (rr3-rr2)/(nnSteps+1);
		var dg2 = (gg3-gg2)/(nnSteps+1);
		var db2 = (bb3-bb2)/(nnSteps+1);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		rr = rr1;
		gg = gg1;
		bb = bb1;

		for (var i=0;i<nSteps-1;i++){

			if ( i < nSteps/2 ){
				rr += dr1*(nSteps/2-1-i); 
				gg += dg1*(nSteps/2-1-i);
				bb += db1*(nSteps/2-1-i);
			}
			else{
				rr -= dr2*(i-nSteps/2); 
				gg -= dg2*(i-nSteps/2);
				bb -= db2*(i-nSteps/2);
			}
			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		ssA[ssA.length] = cc2;

		return(ssA);
	}
	// 2.3 generate 2 color sweep - cc1 -> white -> cc2 with expanded low range
	// ------------------------------------------------------------------------
	else if (nParam1 == '2low' || nParam1 == '3low'){
	
		var dr1 = (rr3-rr1)/(nSteps*0.75+1);
		var dg1 = (gg3-gg1)/(nSteps*0.75+1);
		var db1 = (bb3-bb1)/(nSteps*0.75+1);

		var dr2 = (rr3-rr2)/(nSteps*0.25+1);
		var dg2 = (gg3-gg2)/(nSteps*0.25+1);
		var db2 = (bb3-bb2)/(nSteps*0.25+1);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		rr = rr1;
		gg = gg1;
		bb = bb1;

		for (var i=0;i<nSteps-1;i++){

			if ( i < nSteps*0.75 ){
				rr += dr1; 
				gg += dg1;
				bb += db1;
			}
			else{
				rr -= dr2; 
				gg -= dg2;
				bb -= db2;
			}
			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		ssA[ssA.length] = cc2;

		return(ssA);
	}
	// 2.4 generate 2 color sweep - cc1 -> white -> cc2 with expanded high range
	// ------------------------------------------------------------------------
	else if (nParam1 == '2high' || nParam1 == '3high' ){
	
		var dr1 = (rr3-rr1)/(nSteps*0.3+1);
		var dg1 = (gg3-gg1)/(nSteps*0.3+1);
		var db1 = (bb3-bb1)/(nSteps*0.3+1);

		var dr2 = (rr3-rr2)/(nSteps*0.7+1);
		var dg2 = (gg3-gg2)/(nSteps*0.7+1);
		var db2 = (bb3-bb2)/(nSteps*0.7+1);
		var rr, gg, bb;

		var ss="";
		var ssA = new Array(0);

		rr = rr1;
		gg = gg1;
		bb = bb1;

		for (var i=0;i<nSteps-1;i++){

			if ( i < nSteps*0.3 ){
				rr += dr1; 
				gg += dg1;
				bb += db1;
			}
			else{
				rr -= dr2; 
				gg -= dg2;
				bb -= db2;
			}
			ss="#";
			ss+=hh.charAt(Math.floor(rr/16))+hh.charAt(rr%16);
			ss+=hh.charAt(Math.floor(gg/16))+hh.charAt(gg%16);
			ss+=hh.charAt(Math.floor(bb/16))+hh.charAt(bb%16);

			ssA[ssA.length] = ss;
		}
		ssA[ssA.length] = cc2;

		return(ssA);
	}
}

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

function _circ_getHexaColor(szColorName){
	if (typeof(szColorName) != 'string'){
		return("#ffffff");
	}
	if ( szColorName.charAt(0) == "#" ){
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

function _circ_createSpectrumColorScheme(nColors,szMode,nHueStart,nHueEnd){

	var i;
	var colorObj = null;

	var minColor = nHueStart?Number(nHueStart):270;
	var maxColor = nHueEnd?Number(nHueEnd):0;

	minColor = isNaN(minColor)?270:minColor;
	maxColor = isNaN(maxColor)?0:maxColor;

	var nStep = (maxColor-minColor)/(nColors-1);

	var ss="";
	var ssA = new Array(0);

	colorObj = new Color(0);
	
	colorObj.setVariantPreset(szMode?szMode:'default');

	for(i=0; i<nColors; i++){
		ss="#";
		colorObj.setBaseColor((minColor+nStep*i)%360);
		ss += colorObj.getHex(0,0,0);
		ssA[ssA.length] = ss;
	}
	return ssA;
}

var __officeColors = new Array(
	'#9999FF',
	'#993366',
	'#FFFFCC',
	'#CCFFFF',
	'#660066',
	'#FF8080',
	'#0066CC',
	'#CCCCFF',
	'#000080',
	'#FF00FF',
	'#FFFF00',
	'#00FFFF',
	'#800080',
	'#800000',
	'#008080',
	'#0000FF',
	'#00CCFF',
	'#CCFFFF',
	'#CCFFCC',
	'#FFFF99',
	'#99CCFF',
	'#FF99CC',
	'#CC99FF',
	'#FFCC99'
	);

var __mineralColors = new Array(
	'#F3898B',
	'#7BFECD',
	'#B3B07B',
	'#49BA85',
	'#FEDBFE',
	'#847FBA',
	'#FEA869',
	'#17BCC4',
	'#DC686D',
	'#28803C',
	'#FFFF00',
	'#C09B43',
	'#746FC0',
	'#9C9C9C',
	'#EDFEA5',
	'#0000FF',
	'#00E04D',
	'#86A9CE',
	'#B37B9D',
	'#9FD8B3',
	'#FEB676',
	'#C09671',
	'#87CFFE',
	'#00A7C7'
	);

var __pastelColors = new Array(
	'#D2D2D2',
	'#9DC0C0',
	'#DFC7AA',
	'#A1D197',
	'#E2A6A6',
	'#CBA6CB',
	'#FEA4A4',
	'#A8ACD1',
	'#C8D89A',
	'#F3C4D8',
	'#E9E15E',
	'#EEEEEE',
	'#C0AB79',
	'#E2E17F',
	'#B4E1FE',
	'#E8DDFE',
	'#E1FEEB',
	'#FEF782',
	'#C3FFC3',
	'#CEFE87',
	'#8CFEB3',
	'#D2D2D2',
	'#9DC0C0',
	'#DFC7AA'
	);

var __harvestColors = new Array(
	'#C06549',
	'#FFD700',
	'#BDB76B',
	'#F7B567',
	'#CEC395',
	'#CD9B1D',
	'#F0E68C',
	'#A7AF5E',
	'#C09058',
	'#8B4513',
	'#AC96AC',
	'#698B69',
	'#8B6914',
	'#8B8B00',
	'#FFFBC3',
	'#BDB056',
	'#DCCEDB',
	'#FEF782',
	'#FEEAC6',
	'#FFC7AE',
	'#A6B655',
	'#DB6700',
	'#E5A100',
	'#F7D3B3'
	);

var __fruitColors = new Array(
	'#1F77B4',
	'#AEC7E8',
	'#FF7F0E',
	'#FFBB78',
	'#2CA02C',
	'#99DF8B',
	'#D62728',
	'#FF9896',
	'#966ABE',
	'#C5B0D5',
	'#8C564B',
	'#C49C94',
	'#E377C2',
	'#F7B6D2',
	'#7E7E7E',
	'#C7C7C7',
	'#BCBD22',
	'#DBDB8D',
	'#18BECF',
	'#9EDAE5',
	'#1F77B4',
	'#AEC7E8'
	);

var __kmeansColors = new Array(
	"#c17cd3",
	"#91c15d",
	"#6a70d7",
	"#bab440",
	"#513688",
	"#5dc67f",
	"#993888",
	"#37d8b0",
	"#e3586f",
	"#36dee6",
	"#d66044",
	"#47b795",
	"#ab396c",
	"#568429",
	"#e07db5",
	"#3c7c3d",
	"#628bd5",
	"#cb8832",
	"#ad4258",
	"#a2863e",
	"#ad4248",
	"#9c4629"	
	);

var __kmeanspColors = new Array(
	"#ffd1b2",
	"#a5b2e9",
	"#effcc2",
	"#e1c3f8",
	"#acc692",
	"#d899b7",
	"#bbfdd9",
	"#e8a197",
	"#8ceceb",
	"#fab9a0",
	"#6dc5b7",
	"#ffc0bc",
	"#66b8bd",
	"#dcc992",
	"#7db3c8",
	"#fffedb",
	"#ffdfff",
	"#84b5ac",
	"#ffebf2",
	"#a2aead",
	"#e1f3ff",
	"#b5e6ff"
	);

var __pimpColors = new Array(
	"#b09234",
	"#5f3dc1",
	"#4ca735",
	"#b54ade",
	"#7e9a36",
	"#cb43b3",
	"#4a9f61",
	"#d93f76",
	"#3a9e88",
	"#da4631",
	"#7876dc",
	"#d57a29",
	"#5e90cd",
	"#814b1b",
	"#554f95",
	"#396829",
	"#c275ba",
	"#75702e",
	"#89376c",
	"#bf7f51",
	"#923432",
	"#d37075"
	);

var __intenseColors = new Array(
	"#c98ab6",
	"#5bbb42",
	"#6035bd",
	"#9dac3c",
	"#c450da",
	"#66b888",
	"#d84fa9",
	"#44733a",
	"#7370d7",
	"#d19231",
	"#443672",
	"#db4d32",
	"#4ca5b0",
	"#d5466d",
	"#829fdb",
	"#8b3b26",
	"#506793",
	"#a69358",
	"#873987",
	"#4f4b21",
	"#d58873",
	"#79354c"
	);

var __fluoColors = new Array(
	"#ecd730",
	"#4ddded",
	"#c0ee32",
	"#f6ac8d",
	"#64ea51",
	"#eebd5e",
	"#5be9c8",
	"#d9db55",
	"#77e7a1",
	"#c6e552",
	"#8ac793",
	"#95e354",
	"#a5e3ad",
	"#dff782",
	"#67ee8b",
	"#e2d680",
	"#a5e47d",
	"#b0d490",
	"#9fc658",
	"#d1f5a5",
	"#b4db6c",
	"#c1d271"
	);

var __tableauColors = new Array(
	"#4e79a7",
	"#a0cbe8",
	"#f28e2b",
	"#ffbe7d",
	"#59a14f",
	"#8cd17d",
	"#b6992d",
	"#f1ce63",
	"#499894",
	"#86bcb6",
	"#e15759",
	"#ff9d9a",
	"#79706e",
	"#bab0ac",
	"#d37295",
	"#fabfd2",
	"#b07aa1",
	"#d4a6c8",
	"#9d7660",
	"#d7b5a6"
	);

var __tableauColors20 = new Array(
	"#1F77B4",
	"#AEC7E8",
	"#FF7F0E",
	"#FFBB78",
	"#2CA02C",
	
	"#98DF8A",
	"#D62728",
	"#FF9896",
	"#9467BD",
	"#C5B0D5",
	
	"#8C564B",
	"#C49C94",
	"#E377C2",
	"#F7B6D2",
	"#7F7F7F",
	
	"#C7C7C7",
	"#BCBD22",
	"#DBDB8D",
	"#17BECF",
	"#9EDAE5"
	);

var __tableauColors10 = new Array(
	"#1F77B4",
	"#FF7F0E",
	"#2CA02C",
	"#D62728",
	"#9467BD",
	
	"#8C564B",
	"#E377C2",
	"#7F7F7F",
	"#BCBD22",
	"#17BECF",
	
	"#1F77B4",
	"#FF7F0E",
	"#2CA02C",
	"#D62728",
	"#9467BD",
	
	"#8C564B",
	"#E377C2",
	"#7F7F7F",
	"#BCBD22",
	"#17BECF"
	);

var __colorPaletteA = new Array();
__colorPaletteA["office"]  = __officeColors;
__colorPaletteA["mineral"] = __mineralColors;
__colorPaletteA["pastel"]  = __pastelColors;
__colorPaletteA["harvest"] = __harvestColors;
__colorPaletteA["fruit"]   = __fruitColors;
__colorPaletteA["kmeans"]   = __kmeansColors;
__colorPaletteA["kmeansp"]   = __kmeanspColors;
__colorPaletteA["pimp"]   = __pimpColors;
__colorPaletteA["intense"]   = __intenseColors;
__colorPaletteA["fluo"]   = __fluoColors;
__colorPaletteA["tableau"]   = __tableauColors;
__colorPaletteA["tableau10"]   = __tableauColors10;
__colorPaletteA["tableau20"]   = __tableauColors20;

function _circ_createPaletteColorScheme(szPalette,nColors,nOffset){
	var colorPalette = __colorPaletteA[szPalette];
	if ( !nOffset ){
		nOffset = 0;
	}
	if ( nOffset+nColors <= colorPalette.length ){
		return colorPalette.slice(nOffset,nOffset+nColors);
	}else{
		var xA = new Array();
		for ( var i=0; i<nColors; i++ ){
			xA.push(colorPalette[(nOffset+i)%colorPalette.length]);
		}
		return xA;
	}
}

// ---------------------------------------------------------------------------
// Color object
// original from http://wellstyled.com/tools/colorscheme2/index-en.html
// ---------------------------------------------------------------------------

var __colWheel = new Array(12);
	__colWheel['0']   = new Array(255,0,0,		0, 100, 100);
	__colWheel['15']  = new Array(255,51,0,		15, 100, 100);
	__colWheel['30']  = new Array(255,102,0,	30, 100, 100);
	__colWheel['45']  = new Array(255,128,0,	45, 100, 100);
	__colWheel['60']  = new Array(255,153,0,	60, 100, 100);
	__colWheel['75']  = new Array(255,178,0,	75, 100, 100);
	__colWheel['90']  = new Array(255,204,0,	90, 100, 100);
	__colWheel['105'] = new Array(255,229,0,	105, 100, 100);
	__colWheel['120'] = new Array(255,255,0,	120, 100, 100);
	__colWheel['135'] = new Array(204,255,0,	135, 100, 100);
	__colWheel['150'] = new Array(153,255,0,	150, 100, 100);
	__colWheel['165'] = new Array(51,255,0,		165, 100, 100);
	__colWheel['180'] = new Array(0,204,0,		180, 100, 80);
	__colWheel['195'] = new Array(0,178,102,	195, 100, 70);
	__colWheel['210'] = new Array(0,153,153,	210, 100, 60);
	__colWheel['225'] = new Array(0,102,178,	225, 100, 70);
	__colWheel['240'] = new Array(0,51,204,		240, 100, 80);
	__colWheel['255'] = new Array(25,25,178,	255, 100, 70);
	__colWheel['270'] = new Array(51,0,153,		270, 100, 60);
	__colWheel['285'] = new Array(64,0,153,		285, 100, 60);
	__colWheel['300'] = new Array(102,0,153,	300, 100, 60);
	__colWheel['315'] = new Array(153,0,153,	315, 100, 60);
	__colWheel['330'] = new Array(204,0,153,	330, 100, 80);
	__colWheel['345'] = new Array(229,0,102,	345, 100, 90);

var __varPresets = new Array();
__varPresets['default'] = new Array( -1,-1, 1,-0.7, 0.25,1, 0.5,1 );
__varPresets['pastel'] = new Array( 0.5,-0.9, 0.5,0.5, 0.1,0.9, 0.75,0.75 );
__varPresets['soft'] = new Array( 0.3,-0.8, 0.3,0.5, 0.1,0.9, 0.5,0.75 );
__varPresets['hard'] = new Array( 1,-1, 1,-0.6, 0.1,1, 0.6,1 );
__varPresets['light'] = new Array( 0.25,1, 0.5,0.75, 0.1,1, 0.5,1 );
__varPresets['pale'] = new Array( 0.1,-0.85, 0.1,0.5, 0.1,1, 0.1,0.75 );
__varPresets['work'] = new Array();

// helper

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

// color class

function Color(H) {
	this.S = new Array();
	this.V = new Array();
	this.setBaseColor(H);
}

Color.prototype.setBaseColor = function (H) {
	this.moveHue(H);
};

Color.prototype.moveHue = function (H) {

	function avrg(a,b,k) {
		return a + Math.round((b-a)*k);
		}

	this.H = H;
	var nHue = Math.round(this.H) % 360;
	var d = nHue%15 + (this.H-Math.floor(this.H));
	var k = d/15;
	var d1 = nHue - Math.floor(d);
	var c1 = __colWheel[d1];
	d1 = (d1+15)%360;
	var c2 = __colWheel[d1];
	this.baseR = avrg(c1[0],c2[0],k);
	this.baseG = avrg(c1[1],c2[1],k);
	this.baseB = avrg(c1[2],c2[2],k);
	this.baseS = avrg(c1[4],c2[4],k)/100;
	this.baseV = avrg(c1[5],c2[5],k)/100;
};

Color.prototype.setVariant = function (varNr, S, V) {
	this.S[varNr] = S;
	this.V[varNr] = V;
};
Color.prototype.getS = function (varNr) {
	var S = (this.S[varNr]<0) ? -this.S[varNr] * this.baseS : this.S[varNr];
	if (S>1) {
		S = 1;
	}
	if (S<0) {
		S = 0;
	}
	return S;
};
Color.prototype.getV = function (varNr) {
	var V = (this.V[varNr]<0) ? -this.V[varNr] * this.baseV : this.V[varNr];
	if (V>1) {
		V = 1;
	}
	if (V<0) {
		V = 0;
	}
	return V;
};
Color.prototype.setVariantPreset = function (preset) {
	var i;
	var p = __varPresets[preset];
	if (!p){
		p = __varPresets['default'];
	}
	for (i=0;i<4;i++){
		this.setVariant(i,p[2*i],p[2*i+1]);
	}
};

Color.prototype.getHex = function(webColors,CBMode,varNr) {
	var r;
	var g;
	var b;

	var baseMax = Math.max(Math.max(this.baseR,this.baseG),this.baseB);
	var baseMin = Math.min(Math.min(this.baseR,this.baseG),this.baseB);
	var V = (varNr<0) ? this.baseV : this.getV(varNr);
	var S = (varNr<0) ? this.baseS : this.getS(varNr);
	var v = V*255;
	var k = (baseMax>0) ? v/baseMax : 0;

	r = Math.min(255,Math.round(v-(v-this.baseR*k)*S));
	g = Math.min(255,Math.round(v-(v-this.baseG*k)*S));
	b = Math.min(255,Math.round(v-(v-this.baseB*k)*S));

	if ( webColors ) {
		r = Math.round(r/51) * 51;
		g = Math.round(g/51) * 51;
		b = Math.round(b/51) * 51;
	}
	if ( CBMode ) {
		if ( CBMode == 7 ){
			return __col2Gray(r,g,b);
		}
		else{
			return getColorBlindColor(r,g,b,CBMode);
		}
	}
	else{
		return __dec2hex(r)+__dec2hex(g)+__dec2hex(b);
	}
};

Color.prototype.rotate = function (nAngle) {
	var newH = (this.H + nAngle) % 360;
	this.setBaseColor(newH);
};


/**
 * create ColorScheme instance, to export some functions 
 */
	ColorScheme = new _ColorScheme();
/**
 * This is the api class for the Class: ColorScheme  
 * @constructor
 * @throws 
 * @return A new DonutChart api
 */
    function _ColorScheme() {
	/** make public */
	this.createColorScheme = _circ_createColorScheme;	
	/** make public */
	this.getDerivateColor = _circ_getDerivateColor;	
	/** make public */
	this.getBorderColor = _circ_getBorderColor;	
	/** make public */
	this.getTextColor = _circ_getTextColor;	
	/** make public */
	this.getHexaColor = _circ_getHexaColor;
	}

// EOF

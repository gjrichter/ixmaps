(function( ixmaps, $, undefined ) {

	/* ---------------------------------------------------------------- */
	/* L o c a l   D a t a														*/
	/* ---------------------------------------------------------------- */
	
	// all theme types here 
	// ---------------------------------------------------
	var themeStylesA = new Array ();
		themeStylesA['shape'] = "type:CHOROPLETH|QUANTILE|FORCED;";
		themeStylesA['circle'] = "type:CHART|BUBBLE|QUANTILE|VALUES|FORCED;";
		themeStylesA['square'] = "type:CHART|SQUARE|QUANTILE|VALUES|FORCED;";
		themeStylesA['trend'] = "type:CHART|BAR|POINTER|QUANTILE|RELATIVE|THIN|FORCED;";
		themeStylesA['charts'] = "type:CHART|BAR|3D|FADEIN|THIN|TRENDLINE|SPACED|SIZE|QUANTILE|FORCED;";
		themeStylesA['xcharts'] = "type:CHART|BAR|3D|STACKED|DIFF|SIZE|SUM|FADEIN|FORCED;";
		themeStylesA['xxcharts'] = "type:CHART|BAR|3D|VOLUME|SEQUENCE|SPACED|SUM|FADEIN|FORCED;";
		themeStylesA['pie'] = "type:CHART|PIE|3D|QUANTILE|SIZE;";
		themeStylesA['bar'] = "type:CHART|BAR|3D|QUANTILE|SIZE;";
		themeStylesA['cube'] = "type:CHART|BAR|3D|VOLUME|QUANTILE;";
		themeStylesA['stackedbar'] = "type:CHART|BAR|STACKED|3D;";
		themeStylesA['pyramid'] = "type:CHART|BAR|HORZ|CENTER|UP;";
		themeStylesA['dominant'] = "type:CHOROPLETH|DOMINANT;";
		themeStylesA['percentofmean'] = "type:CHOROPLETH|DOMINANT|PERCENTOFMEAN;";
	__getThemeTypeDef = function(szType){
		return themeStylesA[szType];
	};

	// all color schemes here 
	// ---------------------------------------------------
	var colorSchemesA = new Array ();
		colorSchemesA['red']		= "#ffeeee,#dd0000,dynamic,cold";
		colorSchemesA['green']		= "#eeffee,#00cc00,dynamic,cold";
		colorSchemesA['blue']		= "#eeeeff,#0000cc,dynamic,cold";

		colorSchemesA['gray']		= "#eeeeee,#444444,dynamic,cold";
		colorSchemesA['warmgray']	= "#FaF8F8,#888876,dynamic,warm";
		colorSchemesA['greengray']	= "#FEFDDF,#888A56,dynamic,warm";

		colorSchemesA['darkred']	= "#FEF0DF,#bb2233,dynamic,warm";
		colorSchemesA['petrol']		= "#FEFDDF,#008A56,dynamic,warm";
		colorSchemesA['darkblue']	= "#FEFDDF,#00308F,dynamic,warm";
		colorSchemesA['petrol2']	= "#CEDDF6,#2C516A,dynamic,cold";
		colorSchemesA['inkblue']	= "#D2E3F4,#104482,3colors,#4A90E1";

		colorSchemesA['density1']	= "#FFFDD8,#B5284B,3colors,#FCBA6C";
		colorSchemesA['density2']	= "#FFFFFF,#BC0225,3colors,#FC8C3D";
		colorSchemesA['density3']	= "#FFEDA0,#800026,3colors,#FC5E2A";
		colorSchemesA['density4']	= "#FEE5D9,#A50F15,3colors,#FB6A4A";
		colorSchemesA['density5']	= "#D1EC6E,#F7C025,null,null";

		colorSchemesA['filler1']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['heatmap']	= "blue,#ffcc77,3low,red";
		colorSchemesA['heatmap0']	= "#eeffaa,#9944B5,3colors,#ff8800";
		colorSchemesA['heatmap01']	= "#6E4AF6,#F9FA84,3colors,#F52926";
		colorSchemesA['heatmap1']	= "#ddff66,#AA7FB5,3low,#DB706D";

		colorSchemesA['viridis-b']   = "#440154,#FDE725,3colors,#238A8D";
		colorSchemesA['viridis-a']   = "#FDE725,#440154,3colors,#238A8D";
		colorSchemesA['magma-b']     = "#100050,#F2F226,3colors,#CC4878";
		colorSchemesA['magma-a']     = "#F2F226,#100050,3colors,#CC4878";

		colorSchemesA['filler11']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['heatmap2']	= "#000523,#446CFF,3colors,#2239FC";
		colorSchemesA['heatmap3']	= "#000523,#ffffFF,3colors,#2239FC";
		colorSchemesA['heatmap31']	= "#334455,#88eeFF,dynamic,cold";
		colorSchemesA['heatmap4']	= "RGB(74,74,255)|RGB(245,41,38)|dynamic";
		colorSchemesA['heatmap5']	= "RGB(245,41,38)|RGB(74,74,255)|dynamic";;


		colorSchemesA['filler2']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['blue-red9'] = "#36A6B1|#794073|3colors|#DDA729";
		colorSchemesA['red-blue9'] = "#794073|#36A6B1|3colors|#DDA729";
		colorSchemesA['green-red9'] = "#56A651|#794073|3colors|#DDA729";
		colorSchemesA['red-green9'] = "#794073|#56A651|3colors|#DDA729";

		colorSchemesA['blue-green-red'] = "#5EB6BA,#DD8356,3colors,#95B526";
		colorSchemesA['red-green-blue'] = "#DD8356,#5EB6BA,3colors,#95B526";
		colorSchemesA['green-blue-red1'] = "#95B526,#DD8356,3colors,#5EB6BA";
		colorSchemesA['red-blue-green1'] = "#DD8356,#95B526,3colors,#5EB6BA";

		colorSchemesA['filler3']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['green-red']	= "green,red,,warm";
		colorSchemesA['red-green']	= "red,green,,warm";
		colorSchemesA['green-red2'] = "#7CB832,#FF4800,auto,#F7FA7A";
		colorSchemesA['red-green2'] = "#FF4800,#7CB832,auto,#F7FA7A";
		colorSchemesA['green-red3'] = "#41826C,#EF5D52,3colors,#E1D495";
		colorSchemesA['red-green3'] = "#EF5D52,#41826C,3colors,#E1D495";
		colorSchemesA['blue-red9'] = "#36A6B1|#794073|3colors|#DDA729";
		colorSchemesA['red-blue9'] = "#794073|#36A6B1|3colors|#DDA729";

		colorSchemesA['blue-red']	= "blue,red,,warm";
		colorSchemesA['red-blue']	= "red,blue,,warm";
		colorSchemesA['blue-red2']	= "#00308F,#FF4800,,warm";
		colorSchemesA['red-blue2']	= "#FF4800,#00308F,,warm";
		colorSchemesA['blue-red3'] = "#C1DAE7,#D95461,3colors,#FBE9CA";
		colorSchemesA['red-blue3'] = "#D95461,#C1DAE7,3colors,#FBE9CA";
		colorSchemesA['blue-red4'] = "#3288BD,#D53E4F,3colors,#F7F7F7";
		colorSchemesA['red-blue4'] = "#D53E4F,#3288BD,3colors,#F7F7F7";
		colorSchemesA['blue-red5'] = "#3288BD,#D53E4F,3colors,#d4d898";
		colorSchemesA['red-blue5'] = "#D53E4F,#3288BD,3colors,#d4d898";
		colorSchemesA['blue-red6'] = "RGB(1,175,221)|RGB(253,88,7)|3colors|RGB(230,230,136)";
		colorSchemesA['red-blue6'] = "RGB(253,88,7)|RGB(1,175,221)|3colors|RGB(230,230,136)";
		colorSchemesA['blue-red7'] = "#62D2EA|#FF6801|3colors|#E0E4CB";
		colorSchemesA['red-blue7'] = "#FF6801|#62D2EA|3colors|#E0E4CB";
		colorSchemesA['blue-red8'] = "#80AF9B|#FF3D62|3colors|#FBCDAB";
		colorSchemesA['red-blue8'] = "#FF3D62|#80AF9B|3colors|#FBCDAB";
		colorSchemesA['blue-redA'] = "#276E83|#AA0321|3colors|#FBF7B6";
		colorSchemesA['red-blueA'] = "#AA0321|#276E83|3colors|#FBF7B6";
		
		colorSchemesA['green-brown']= "#828A4D,#CF926D,3colors,#FFFFFF";
		colorSchemesA['brown-green']= "#CF926D,#828A4D,3colors,#FFFFFF";

		colorSchemesA['blue-orange']= "#88A6B7,#FD9807,3colors,#FFFFFF";
		colorSchemesA['orange-blue']= "#FD9807,#88A6B7,3colors,#FFFFFF";
		colorSchemesA['blue-orange2']= "#04A3F4,#F5A506,3colors,#F4E4C0";
		colorSchemesA['orange-blue2']= "#F5A506,#04A3F4,3colors,#F4E4C0";

		colorSchemesA['green-blue-red2'] = "RGB(207,255,51)|RGB(221,0,0)|3colors|RGB(148,204,200)";
		colorSchemesA['red-blue-green2'] = "RGB(221,0,0)|RGB(207,255,51)|3colors|RGB(148,204,200)";

		colorSchemesA['green-dark'] = "#CFFF33,#000523,3colors,#94CCC8";
		colorSchemesA['dark-green'] = "#000523,#CFFF33,3colors,#94CCC8";
		colorSchemesA['green-blue2'] = "#CFFF33,#2239FC,3colors,#f8f8f8";
		colorSchemesA['blue-green2'] = "#2239FC,#CFFF33,3colors,#f8f8f8";
		colorSchemesA['blue-green3']= "#88A6B7,#97AB5E,3colors,#FFFFFF";
		colorSchemesA['green-blue3']= "#97AB5E,#88A6B7,3colors,#FFFFFF";
		colorSchemesA['green-viola'] = "#CFFF33,#9A5195,3colors,#94CCC8";
		colorSchemesA['viola-green'] = "#9A5195,#CFFF33,3colors,#94CCC8";
		colorSchemesA['brown-viola'] = "#DB9151,#8B79B9,3colors,#F9F9DF";
		colorSchemesA['viola-brown'] = "#8B79B9,#DB9151,3colors,#F9F9DF";
		colorSchemesA['brown-blue4'] = "#CC8400,#3F3FFF,3colors,#FFE8BF";
		colorSchemesA['blue4-brown'] = "#3F3FFF,#CC8400,3colors,#FFE8BF";
		colorSchemesA['brown-blue5'] = "#ffaa88,#0044dd";
		colorSchemesA['blue5-brown'] = "#0044dd,#ffaa88";

		colorSchemesA['filler31']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['spectral']	= "spectrum,default,200,0";
		colorSchemesA['rev-spec.']	= "spectrum,default,0,200";

		colorSchemesA['filler4']		= "#eeeeee,#eeeeee,#eeeeee,#eeeeee";

		colorSchemesA['office']		= "office,,,";
		colorSchemesA['mineral']	= "mineral,,";
		colorSchemesA['pastel']		= "pastel,,";
		colorSchemesA['harvest']	= "harvest,,,";
		colorSchemesA['fruit']		= "fruit,,,";
		colorSchemesA['filler5']	= "none,none,none,none";
		colorSchemesA['kmeans']		= "kmeans,,,";
		colorSchemesA['kmeansp']	= "kmeansp,,,";
		colorSchemesA['pimp']		= "pimp,,,";
		colorSchemesA['intense']	= "intense,,,";
		colorSchemesA['fluo']		= "fluo,,,";
		colorSchemesA['tableau']	= "tableau,,,";
		colorSchemesA['tableau10']	= "tableau10,,,";
		colorSchemesA['tableau20']	= "tableau20,,,";

	__getThemeColorDef = function(szColor){
		return colorSchemesA[szColor];
	};

	/****************************************************** 
	 * populate select boxes
	 ******************************************************/

	ixmaps.getColorSwatches = function(colorSelect,flag){
		szSelectedColor = __getColorSchemeText(colorSelect,flag);
		return szSelectedColor;
	};

	ixmaps.setColors= function(colorSelect,flag,maxLen){
		szSelectedColor = __getColorSchemeText(colorSelect,flag,maxLen);
		$("#xcolor-label").html(szSelectedColor);
	};

	ixmaps.getColors= function(colorSelect){
		var szColorOptions = "";
		var szIndicators = "<div style=\"margin-bottom:5em;\"><ul class=\"colorlist\" >";
		var szColorLi = "";
		var szSelectedColor="";
		for ( i in 	colorSchemesA ){
			var szColor=__getColorSchemeText(colorSchemesA[i]);
			if ( i == colorSelect ){
				szSelectedColor = szColor;
			}
			szIndicators += "<li id=\"color"+i+"\" class=\"colorlistitem\" >";
			szIndicators += "<a title=\""+i+"\" href=\"javascript:ixmaps.setColorScheme('"+colorSchemesA[i]+"')\">"+szColor+"</a>";
			szIndicators += "</li>";
		}
		// color not found, may colorscheme is defined directly
		if ( szSelectedColor == "" ){
			szSelectedColor = __getColorSchemeText(colorSelect);
			szIndicators += "<li id=\"color"+i+"\" class=\"colorlistitem\" >";
			szIndicators += "<a title=\""+i+"\" href=\"javascript:ixmaps.setColorScheme('"+colorSchemesA[i]+"')\">"+szSelectedColor+"</a>";
			szIndicators += "</li>";
		}
		szIndicators += "</ul>";
		szIndicators += "</div>";
		return szIndicators;
	};

	ixmaps.getColorsOption= function(colorSelect){

		var szColorOptions = "";
		var szIndicators = "";
		var szColorLi = "";
		var szSelectedColor="";
		for ( i in 	colorSchemesA ){
			var szColor=__getColorSchemeText(colorSchemesA[i]);
			szIndicators += "<option value='"+colorSchemesA[i]+"' >"+colorSchemesA[i]+"</option>";
		}
		return szIndicators;
	};

	ixmaps.getColorsFromColorScheme = function(szColorScheme){
		if ( !szColorScheme || typeof(szColorScheme) == "undefined" || !szColorScheme.length ){
			return null;
		}
		var colorDefA = szColorScheme.match(/\|/)?szColorScheme.split('|'):szColorScheme.split(',');
		var colorSchemeA = String(_circ_createColorScheme(colorDefA[1],colorDefA[2],colorDefA[0],colorDefA[3],colorDefA[4])).split(",");

		if ( !colorSchemeA || !colorSchemeA.length ){
			return null;
		}
		return colorSchemeA;
	};

	function __getColorSchemeText(szColorScheme,szFlag,maxLen){
		if ( !szColorScheme || typeof(szColorScheme) == "undefined" || !szColorScheme.length ){
			return "";
		}
		var colorSchemeA = null;
		if ( szFlag && (szFlag == "directly_defined_colors") ){
			if ( szColorScheme.match(/RGB/) ){
				colorSchemeA = szColorScheme.split('|');
			}else{
				colorSchemeA = szColorScheme.match(/\|/)?szColorScheme.split('|'):szColorScheme.split(',');
			}
		}else{
			var colorDefA = szColorScheme.match(/\|/)?szColorScheme.split('|'):szColorScheme.split(',');
			colorSchemeA = String(_circ_createColorScheme(colorDefA[0],colorDefA[1],7,colorDefA[2],colorDefA[3])).split(",");
		}
		if ( !colorSchemeA || !colorSchemeA.length ){
			return "";
		}
		var szColor="";
		var nColors = Math.min(colorSchemeA.length,maxLen||colorSchemeA.length);
		for ( var c=0; c<nColors; c++ ){
			szColor += "<span style='background-color:"+colorSchemeA[c]+";'>&nbsp;&nbsp;</span>";
		}
		if ( maxLen && (maxLen < colorSchemeA.length) ){
			szColor += " ...";
		}
		return szColor;
	}


}( window.ixmaps = window.ixmaps || {}, jQuery ));

// .............................................................................
// EOF
// .............................................................................


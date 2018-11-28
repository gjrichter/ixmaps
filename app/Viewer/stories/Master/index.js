
	/**
		init sidebar	
	**/

	var nLegendTabs = 0;

	// --------------------------------------------------------------
	// define click extension to
	// check/highlight the theme button 
	// --------------------------------------------------------------

	// array to store the clicked objects for onRemoveTheme callback
	var clickA = new Array(0);

	// store the last clicked object for onNewTheme callback
	var lastClicked = null;
	var actualClicked = null;
	$("a").click(function () {
		if ( String($(this).attr("href")).match(/ixmaps.newTheme/i) || 
			 String($(this).attr("href")).match(/ixmaps.changeThemeStyle/i) ){
			lastClicked = actualClicked = $(this);
		}
	});

	// change 'button' style to show presence of theme
	__setThemeButtonStyle = function(buttonObj,fFlag){
		if ( fFlag ){
			buttonObj.css("background","#D6D9Dd");
			buttonObj.css("border-left","solid #dddddd 1px");
			buttonObj.css("border-right","solid #dddddd 1px");
			buttonObj.append("<span id='temp-delete-icon' class='icon icon-cancel-circle' style='color:#ffffff;float:right;padding:0.2em 0 0.5em 0;'></span>");
		}else{
			buttonObj.css("background","");
			buttonObj.css("border-left","0");
			buttonObj.css("border-right","0");
			$("#temp-delete-icon").remove();
		}
	}; 

	__showFooter = function(buttonObj){
		$("#"+buttonObj.attr("id")+"_footer").show();
	};

	__hideFooter = function(buttonObj){
		$("#"+buttonObj.attr("id")+"_footer").hide();
	};
	
	// intercept theme creation, to mark active themes
	ixmaps.htmlgui_onNewTheme = function(szId){

		if ( themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/) ) {
			return;
		}
		$("#themeLegendDiv").html("<p style='font-size:22px'>loading ... <div style='text-align:center;margin-bottom:-1em'><img src='../../../../ui/resources/images/loading_blue.gif' id='load-file-spinner' style='height:72px'></div></p>");
		$("#themeLegendDiv").show();
		$("#loadProject").hide();
		$("#loadProjectButton").show();
		$("#saveProjectButton").show();

		setTimeout("ixmaps.hideLoading()",1);
		
		ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId());
	};
	
	
	var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;
	// intercept theme creation, to mark active themes
	ixmaps.htmlgui_onDrawTheme = function(szId){ 

		var themeObj = ixmaps.getThemeObj(szId);
		ixmaps.themeObj = themeObj;	
		if ( themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/) ) {
			try	{
				old_onDrawTheme(szId); 
			}catch (e){}
			return;
		};

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;
		if ( !labelA ){
			labelA = new Array();
			var szUnit = themeObj.szUnit || "";
			for ( var i=0; i<colorA.length; i++){
				var szPart = parseFloat(themeObj.partsA[i].min).toFixed(2)+szUnit+" ... "+parseFloat(themeObj.partsA[i].max).toFixed(2)+szUnit;
				labelA.push(szPart);
			}
		}

		szHtml = "";
		szHtml += "<h3>"+themeObj.szTitle+"</h3>";
		if ( themeObj.szSnippet && typeof(themeObj.szSnippet)!="undefined"){
			szHtml += "<div style=\"margin:0.5em 1.5em 0.5em 0;font-size:0.9em;\">"+themeObj.szSnippet+"</div>";
		}

		if ( ixmaps.legend.makeColorLegendHTML ){
			szHtml += "<div style='margin-top:1em;margin-bottom:1em;overflow:auto'>";
			szHtml += ixmaps.legend.makeColorLegendHTML(szId,null,"compact");
			szHtml += "</div>";
		}else{
			szHtml += "<table style='font-size:0.8em;line-height:1.1em;margin-top:0.3em;margin-bottom:0.3em;'>";
			var max = Math.min(100,colorA.length);
			for ( var i=0; i<labelA.length; i++){
				szHtml += "<tr valign='top'><td><span onclick='javascript:ixmaps.hideThemeClass(\""+szId+"\","+i+")' onmouseover='javascript:ixmaps.markThemeClass(\""+szId+"\","+i+")' onmouseout='javascript:ixmaps.unmarkThemeClass(\""+szId+"\","+i+")' style='background:"+colorA[i]+";font-size:0.7em;'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></td><td><span>"+ labelA[i] +"</span></td></tr>";
			}
			szHtml += "</table>";
		}

		szHtml += "<div id='map-legend-footer'>";
		if (themeObj.szDescription){
			szHtml += "<div style=\"font-size:0.9em;margin-bottom:2em\"><em>"+themeObj.szDescription+"</em></div>";
		}
		szHtml += ixmaps.htmlgui_onLegendFooter ? ixmaps.htmlgui_onLegendFooter(szId,themeObj,ixmaps.embeddedApi.embeddedApi.getThemeDefinitionObj(szId)) : "";
		szHtml += "</div>";

			var id = szId.replace(/\./g,'');

			var bigger_icon = "icon icon-arrow-up";
			var smaller_icon = "icon icon-arrow-down";

			if ( themeObj.szFlag.match(/AGGREGATE/) ){
				bigger_icon = "icon icon-table2";
				smaller_icon = "icon icon-table";
				bigger_icon = "glyphicon glyphicon-th-large";
				smaller_icon = "glyphicon glyphicon-th";
			}

			if (themeObj.nDoneCount){
				szHtml += 		"<div style='margin-left:0px;margin-top:0.75em;margin-bottom:0.25em;' >";
					
				szHtml += 		"<a id='highbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1/1.5\");' title='flatten' >";
				szHtml += 			"<span class='"+smaller_icon+"' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='lowbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1.5\");' title='amplify'>";
				szHtml += 			"<span class='"+bigger_icon+"' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='minusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1/1.5\");' title='smaller charts'>";
				szHtml += 			"<span class='icon icon-minus' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='plusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1.5\");' title='bigger charts'>";
				szHtml += 			"<span class='icon icon-plus' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='valuebutton"+id+"' href='javascript:ixmaps.toggle_values(\""+szId+"\");' title='text value -/+'>";
				szHtml += 			"<span class='icon icon-spell-check' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='opminusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"1/1.5\");' title='more trasparency'>";
				szHtml += 			"<span class='icon icon-checkbox-unchecked' style='font-size:17px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='opplusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"1.5\");' title='less trasparency'>";
				szHtml += 			"<span class='icon icon-stop2' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='deletebutton"+id+"' href='javascript:ixmaps.removeTheme(\""+szId+"\");' title='remove theme'>";
				szHtml += 			"<span class='icon icon-bin2' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='lockbutton"+id+"' href='javascript:ixmaps.changeThemeStyle(\""+szId+"\",\"type:LOCKED\",\"toggle\");' title='chart menu'>";
				if ( themeObj.szFlag.match(/LOCKED/) ) {
					szHtml += 			"<span class='icon icon-lock' style='font-size:18px;color:#444444;padding:0.4em;'></span>";
					szHtml += 			"</a>&nbsp;";
				}else{
					szHtml += 			"<span class='icon icon-unlocked' style='font-size:18px;color:#444444;padding:0.4em;'></span>";
					szHtml += 			"</a>&nbsp;";
				}

				szHtml += 		"</ div>";

				/**
				szHtml +=	"<div style='margin-left:-5px;float-left;margin-top:2em' >";
				if(ixmaps.themeObj.szFlag.match(/CHOROPLETH/) ){
					if( !ixmaps.themeObj.szFlag.match(/EXACT/)  ){
					    szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.2em' onclick='javascript:ixmaps.changeThemeStyle(null,null,\"type:QUANTILE\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:LOG\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:EQUIDISTANT\",\"add\");'>equidistante</button>"; 
						szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.2em' onclick='javascript:ixmaps.changeThemeStyle(null,null,\"type:QUANTILE\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:EQUIDISTANT\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:LOG\",\"add\");'>logarithmico</button>";
						szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.2em' onclick='javascript:ixmaps.changeThemeStyle(null,null,\"type:QUANTILE\",\"add\");ixmaps.changeThemeStyle(null,null,\"type:LOG\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:EQUIDISTANT\",\"remove\");'>quantile</button> ";
						szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.2em' onclick='javascript:ixmaps.changeThemeStyle(null,null,\"type:QUANTILE\",\"add\");ixmaps.changeThemeStyle(null,null,\"type:LOG\",\"remove\");ixmaps.changeThemeStyle(null,null,\"type:DOPACITYMINMAX\",\"toggle\");'>enfatizza min/max</button> ";
					}
					szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.2em' onclick='javascript:ixmaps.newTheme(null,null,tema_popolazione);'>aggiungi la popolazione</button>"; 
				}else{
					szHtml +=	"<button type='button' class='btn btn-default' style='padding:0.7em;margin:0.4em' onclick='javascript:ixmaps.changeThemeStyle(null,null,\"type:AGGREGATE\",\"toggle\");ixmaps.changeThemeStyle(null,null,\"type:RELOCATE\",\"toggle\");ixmaps.changeThemeStyle(null,\"type:SUM\",\"add\");ixmaps.changeThemeStyle(null,\"gridwidthpx:25\",\"set\");'>aggregated yes/no</button> ";
				}
				szHtml +=	"</div>";
				**/		
			
			/**			
			szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em;overflow:hidden;'>Histogram:</div>";
			szHtml += "<div id='histogram1Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_1"+szId+"'></g></svg></div></div>";
			szHtml += "<div style='font-size:0.6em;margin-bottom:0.5em'>Distribuzione:</div>";
			szHtml += "<div id='histogram2Div' style='width:400px;height:100px;overflow:auto'><div><svg width='400' height='100' viewBox='-20 0 2000 500'><g id='histogram_target_2"+szId+"' style='fill-opacity:0.7;stroke-opacity:0.8;'></g></svg></div></div>";
			**/			
			
			}
		try	{
			ixmaps.setTitle(String(themeObj.szTitle+"<div style='font-size:0.5em;line-height:1em;'>"+(themeObj.szSnippet||"")+"</div>"));
		}catch (e){}

		/** tbd non shure when sum ar mean !!!
		// show sum
		// ---------
		nSum = themeObj.nSum/((themeObj.nMedianA[0] <= 100)?themeObj.nCount:1);
		console.log(themeObj);
		console.log(themeObj.nSum);
		console.log(themeObj.nCount);
		console.log(themeObj.nSum/themeObj.nCount);
		if ( themeObj.szFlag.match(/EXACT/) ){
			nSum = themeObj.nSumSize||themeObj.nCount;
		}
		if ( themeObj.szFlag.match(/AGGREGATE/) && !themeObj.szFlag.match(/SUM/) ){
			nSum = (themeObj.nSum/themeObj.nCount).toFixed(2);
		}
		if ( themeObj.szFlag.match(/SUM/) || 
			(themeObj.szFlag.match(/EXACT/) && !themeObj.szFlag.match(/SIZE/)) ){
			if ( typeof(themeObj.partsA[0].nSum) != "undefined" ){
				nSum = 0;
				for ( i=0; i<themeObj.partsA.length; i++){
					nSum += themeObj.partsA[i].nSum;
				}
			}
		}
		var szUnit = themeObj.szLegendUnits || themeObj.szUnits || "";

		var szSum = "<h3 style='font-size:46px'><b>"+String(ixmaps.__formatValue(nSum,2,"BLANK"))+(themeObj.szLegendUnits || themeObj.szUnit||"")+"</b></h3>"

		szHtml = szSum + szHtml;
		**/
		
		$("#loadProject").hide();
		$("#themeLegendDiv").show();

		// append or replace legend div
		// ---------------------------------------------------------------
		var szLegendId = szId.replace(/\./g,"_");

		if ( !$("#"+szLegendId)[0] ){
			$("#themeLegendDiv").append('<div id="'+(szLegendId)+'" ></div>');
			tabDivA.push(szLegendId);
			$("#themeLegendDiv").children().css("display","none");
			$("#"+tabDivA[0]).show();

			// if more than 1 panes, create new tab to switch legend panes
			if ( ++nLegendTabs > 1 ){
				$("#legendTabs").append('<li><a href="#" onclick="activateTab($(this))">Theme '+ (nLegendTabs) +'</a></li>');
			}
		}

		$("#"+szLegendId).html(szHtml);

		// GR 12.11.2016 keep mouse and touch events inside the legend div
		// ---------------------------------------------------------------
		$("#themeLegendDiv").attr("onwheel","javascript:event.stopPropagation();");
		$("#themeLegendDiv")[0].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchend", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchmove", function(event){event.stopPropagation();}, false);
		// ---------------------------------------------------------------

		setTimeout("ixmaps.viewer_makeLayerLegend()",1000);

		try	{
			old_onDrawTheme(szId); 
		}catch (e){}

	};

	// intercept theme deletion, to remove active themes mark
	ixmaps.htmlgui_onRemoveTheme = function(szId){
		if ( clickA[szId] ){
			__setThemeButtonStyle(clickA[szId],false);
			__hideFooter(clickA[szId]);
			clickA[szId] = null;
		}

		//remove theme div
		var szLegendId = szId.replace(/\./g,"_");
		$("#"+szLegendId).remove();

		//remove theme legend tab
		for ( i in tabDivA ){
			if ( tabDivA[i] == szLegendId ){
				console.log(tabDivA);
				tabDivA.splice(i, 1);;
			}
		}
		nLegendTabs--;
		try	{
			ixmaps.setTitle("");
		}catch (e){}
	};
	ixmaps.toggle_values = function(szThemeId){
		var szThemeStyle = ixmaps.getThemeStyleString();
		if ( szThemeStyle && szThemeStyle.match(/VALUES/) ){
			ixmaps.changeThemeStyle(szThemeId,'type:VALUES;','remove');
		}else{
			ixmaps.changeThemeStyle(szThemeId,'type:VALUES;','add');
			ixmaps.changeThemeStyle(szThemeId,'type:DTEXT;','add');
			ixmaps.changeThemeStyle(szThemeId,'type:VALUEBACKGROUND;','add');
		}
	};

	ixmaps.changeThemeDynamic = function(szThemeId,szParameter,szFactor){

		var nFactor = Number(eval(szFactor));

		var szThemeStyle = ixmaps.getThemeStyleString();

		if ( szThemeStyle.match(/CHOROPLETH/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'dopacitypow:'+String(1/nFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'dopacityscale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'opacity:'+String(nFactor),'factor');
					break;
			}
		}else
		if ( szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(nFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(nFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(nFactor),'factor');
					break;
			}
		}else{
			switch (szParameter) {
				case "amplify":
					if ( szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/) ){
						ixmaps.changeThemeStyle(szThemeId,'rangescale:'+String(nFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(szThemeId,'normalsizevalue:'+String(1/Number(nFactor)),'factor');
					}
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(nFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(nFactor),'factor');
					break;
			}
		}
	};

	ixmaps.viewerSpinOut = function(){

		// make url of the map template 
		var szTemplateUrl = ixmaps.dispatch("ui/dispatch.htm?");
		alert(szTemplateUrl);
		var szBasemap = ixmaps.getBaseMapParameter(ixmaps.szMapService);
		alert(szBasemap);

		var szTemplateEdit   = szTemplateUrl + "ui=edit"   + szBasemap;
		var szTemplateView   = szTemplateUrl + "ui=view"   + szBasemap;
		var szTemplateEmbed  = szTemplateUrl + "ui=embed"  + szBasemap;
		var szTemplateMain   = szTemplateUrl + "ui=embed"  + szBasemap;
		var szTemplatePopout = szTemplateUrl + "ui=popout" + szBasemap;

		window.document.body.topMargin = 0;
		window.document.body.leftMargin = 0;

		var szMapType  = ixmaps.getMapTypeId();
		var szMapUrl   = ixmaps.getMapUrl();
		var szStoryUrl = ixmaps.getStoryUrl();
		var szBookmark = ixmaps.getBookmarkString(2);
		var szAttrib   = ixmaps.htmlgui_getAttributionString();

		szQuery  = "&maptype=" + szMapType;
		szQuery += "&minimal=1&toolbutton=1&logo=1&child=1";
		szQuery += "&svggis=" + encodeURI(szMapUrl);
		szQuery += "&story="  + encodeURI(szStoryUrl||"");
		szQuery += "&bookmark=" + encodeURIComponent(szBookmark);
		szQuery += "&attribution=" + encodeURIComponent(szAttrib);

		szEmbedUrl  = szEmbedUrl || (szTemplateEmbed + szQuery);
		szAloneUrl  = szAloneUrl || (szTemplateMain + szQuery);
		szEditUrl   = szEditUrl  || (szTemplateEdit + szQuery);
		szViewUrl   = szViewUrl  || (szTemplateView + szQuery);

		alert(szViewUrl);
	};

	function changeCss(className, classValue) {
		var cssMainContainer = $('#css-modifier-container');

		if (cssMainContainer.length == 0) {
			var cssMainContainer = $('<style id="css-modifier-container"></style>');
			cssMainContainer.appendTo($('head'));
		}
		cssMainContainer.append(className + " {" + classValue + "}\n");
	}

	var old_setMapTypeBG = ixmaps.htmlgui_setMapTypeBG;
	ixmaps.htmlgui_setMapTypeBG = function(szId){ 

		if (old_setMapTypeBG){
			old_setMapTypeBG(szId);
		}

		$("#css-modifier-container").remove();

		if ( szId.match(/dark/i) || szId.match(/black/i) ){

			$("#header").css("background","black");
			$("#themeLegendDiv").css("background","#111");
			$("#themeLegendDiv").css("border","none");
			$("legend").css("color","#ddd");
			$(".story-body").css("background-color","rgba(0,0,0,0.35)");

			changeCss("a.theme-button", "color:#888" );
			changeCss(".theme-legend-item", "border-bottom:#222 solid 1px" );
			changeCss("a.theme-legend-item", "border-bottom:#222 solid 1px" );

			changeCss(".theme-legend-item-selected", "border-bottom:#444 solid 1px" );
			changeCss("a.theme-legend-item-selected", "border-bottom:#444 solid 1px" );
			changeCss(".theme-legend-item-selected", "background-color:#222" );
			changeCss("a.theme-legend-item-selected", "background-color:#222" );
	
			changeCss(".nav-tabs>li>a:hover","background-color:#222" );
			changeCss(".nav-tabs>li>a:hover","border: 1px solid #000" );
			changeCss(".nav-tabs>li.active>a","background-color:#222" );
			changeCss(".nav-tabs>li.active>a:hover","background-color:#222" );
			changeCss(".nav-tabs>li.active>a:focus","background-color:#222" );
			changeCss(".nav-tabs>li.active>a","color:#dddd" );
			changeCss(".nav-tabs>li.active>a:hover","color:#ddd" );
			changeCss(".nav-tabs>li.active>a:focus","color:#ddd" );
			changeCss(".nav-tabs>li.active>a","border: 1px solid #000" );;
			changeCss(".nav-tabs>li.active>a:hover","border: 1px solid #000" );
			changeCss(".nav-tabs>li.active>a:focus","border: 1px solid #000" );

			changeCss(".list-group-item","background:#181818");

		}else{

			$("#header").css("background","white");
			$("#themeLegendDiv").css("background","rgba(255,255,255,0.8)");
			$("#themeLegendDiv").css("border","none");
			$("legend").css("color","#222");
			$(".story-body").css("background-color","rgba(255,255,255,0.3)");
			changeCss(".theme-legend-item", "border-bottom:#eee solid 1px" );
			changeCss("a.theme-legend-item", "border-bottom:#eee solid 1px" );

			changeCss(".list-group-item","background:#ffffff");
		}
	};

	// set story colors to basemap type

	setTimeout("ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId())",1);


	ixmaps.viewer_makeLayerLegend = function(){ 

		// append or replace legend div
		// ---------------------------------------------------------------
		var szLegendId = "map-legend";

		if ( !$("#"+szLegendId)[0] ){
			$("#themeLegendDiv").append('<div id="'+(szLegendId)+'" style="font-size:0.8em;line-height:1.5em"></div>');
			tabDivA.push(szLegendId);

			// if more than 1 panes, create new tab to switch legend panes
			if ( ++nLegendTabs > 1 ){
				$("#legendTabs").append('<li><a href="#" onclick="activateTab($(this))">Theme '+ (nLegendTabs) +'</a></li>');
			}
		}

		ixmaps.makeLayerLegend(2000);
		if ( nLegendTabs > 1 ){
			$("#"+tabDivA[(nLegendTabs-1)]).hide();
		}
	};



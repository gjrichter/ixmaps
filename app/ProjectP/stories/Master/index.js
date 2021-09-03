
	/**
		init map viewer in sidebar	
	**/

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
	
	// --------------------------------------------------------------
	// intercept theme creation, to create the theme legend 
	// --------------------------------------------------------------
	
	// intercept new theme to prepare the legend
	//
	ixmaps.htmlgui_onNewTheme = function(szId){

		//__showMD(ixmaps.parentApi.project.split(".json")[0]+".md");

		var themeObj = ixmaps.getThemeDefinitionObj(szId);

		if (themeObj.style.splash){
			$("#themeLegendDiv").html("<div class='inline-legend' style='font-size:22px;padding:0.5em 0.7em 1em 0.7em'>"+themeObj.style.splash+"</div>");
			//$("#themeLegendDiv").html("<div style='font-size:22px;padding:0.5em 0.7em 1em 0.7em'>"+themeObj.style.splash+"<div style='text-align:center;margin-bottom:-1em'><img src='../../../../ui/resources/images/loading_blue.gif' id='load-file-spinner' style='height:72px'></div></div>");
			$("#themeLegendDiv").show();
		}

		$("#legend").hide();
		$("#loadProject").hide();
		$("#loadProjectButton").show();
		$("#saveProjectButton").show();

		setTimeout("ixmaps.hideLoading()",1);
		
		ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId());
	};
	
	var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;

	// intercept theme creation done, and make the legend
	//
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
			szHtml += "<div style=\"margin:0.5em 1.5em 0.5em 0;font-size:1.1em;line-height:1.2em\">"+themeObj.szSnippet+"</div>";
		}

		if ( ixmaps.legend.makeColorLegendHTML ){
			szHtml += "<div style='margin-top:1em;margin-bottom:1em;max-height:400px;overflow:auto'>";
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

		szHtml += "<div class='map-legend-footer' >";
		if (themeObj.szDescription){
			szHtml += "<div style=\"font-size:0.9em;margin-bottom:2em\"><em>"+themeObj.szDescription+"</em></div>";
		}
		szHtml += ixmaps.htmlgui_onLegendFooter ? ixmaps.htmlgui_onLegendFooter(szId,themeObj,ixmaps.embeddedApi.embeddedApi.getThemeDefinitionObj(szId)) : "";

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

			}
		try	{
			ixmaps.setTitle(String(themeObj.szTitle+"<div style='font-size:0.5em;line-height:1em;'>"+(themeObj.szSnippet||"")+"</div>"));
		}catch (e){}

		szHtml += "</div>";

		$("#legend").hide();
		$("#loadProject").hide();
		$("#loadProjectButton").show();
		$("#themeLegendDiv").show();

		// append or replace legend div
		// ---------------------------------------------------------------
		var szLegendId = szId.replace(/\./g,"_");

		if ( !$("#"+szLegendId)[0] ){
			ixmaps.legend.createTab(szLegendId);
		}

		$("#"+szLegendId).html(szHtml);

		// GR 12.11.2016 keep mouse and touch events inside the legend div
		// ---------------------------------------------------------------
		$("#themeLegendDiv").attr("onwheel","javascript:event.stopPropagation();");
		$("#themeLegendDiv")[0].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchend", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchmove", function(event){event.stopPropagation();}, false);
		// ---------------------------------------------------------------

		//setTimeout("ixmaps.viewer_makeLayerLegend()",1000);

		try	{
			old_onDrawTheme(szId); 
		}catch (e){}

	};

	// intercept theme deletion, to remove active themes mark
	//
	ixmaps.htmlgui_onRemoveTheme = function(szId){
		if ( clickA[szId] ){
			__setThemeButtonStyle(clickA[szId],false);
			__hideFooter(clickA[szId]);
			clickA[szId] = null;
		}

		//remove theme div
		var szLegendId = szId.replace(/\./g,"_");
		ixmaps.legend.removeTab(szLegendId);

		try	{
			ixmaps.setTitle("");
		}catch (e){}
	};

	// --------------------------------------------------------------
	// helper
	// --------------------------------------------------------------

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

	ixmaps.viewerSpinOut = function(){ alert("cccccc");

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
		
		if (!szId){
			return;
		}

		if (old_setMapTypeBG){
			old_setMapTypeBG(szId);
		}

		$("#css-modifier-container").remove();

		if ( szId.match(/dark/i) || szId.match(/black/i) ){ return;

			$("#header").css("background","black");
			$("#themeLegendDiv").css("background","#111");
			$("#themeLegendDiv").css("border","none");
			$("#map-legend").css("background","#111");
			$("legend").css("color","#ddd");
			$(".story-body").css("background-color","rgba(0,0,0,1)");

			changeCss("a.theme-button", "color:#888" );
			changeCss(".theme-legend-item", "border-bottom:#222 solid 1px" );
			changeCss("a.theme-legend-item", "border-bottom:#222 solid 1px" );

			changeCss(".theme-legend-item-selected", "border-bottom:#444 solid 1px" );
			changeCss("a.theme-legend-item-selected", "border-bottom:#444 solid 1px" );
			changeCss(".theme-legend-item-selected", "background-color:#222" );
			changeCss("a.theme-legend-item-selected", "background-color:#222" );
	
			changeCss(".nav-tabs>li>a","background-color:#111" );
			changeCss(".nav-tabs>li>a","color:#666" );
			changeCss(".nav-tabs>li>a","border: 1px solid #000" );
			changeCss(".nav-tabs>li>a:hover","background-color:#222" );
			changeCss(".nav-tabs>li>a:hover","border: 1px solid #000" );
			changeCss(".nav-tabs>li>a:focus","background-color:#222" );
			changeCss(".nav-tabs>li>a:focus","border: 1px solid #000" );
			changeCss(".nav-tabs>li.active>a","background-color:#222" );
			changeCss(".nav-tabs>li.active>a:hover","background-color:#222" );
			changeCss(".nav-tabs>li.active>a:focus","background-color:#222" );
			changeCss(".nav-tabs>li.active>a","color:#dddd" );
			changeCss(".nav-tabs>li.active>a:hover","color:#ddd" );
			changeCss(".nav-tabs>li.active>a:focus","color:#ddd" );
			changeCss(".nav-tabs>li.active>a","border: 1px solid #222" );;
			changeCss(".nav-tabs>li.active>a:hover","border: 1px solid #444" );
			changeCss(".nav-tabs>li.active>a:focus","border: 1px solid #222" );

			changeCss(".list-group-item","background:#181818");

			changeCss(".inline-legend","background-color:rgba(0,0,0,0.8)");
			changeCss(".inline-legend","border-color:rgba(120,120,120,0)");

		}else{

			$("#header").css("background","white");
			$("#themeLegendDiv").css("background","rgba(255,255,255,0.8)");
			$("#themeLegendDiv").css("border","none");
			$("#map-legend").css("background","rgba(255,255,255,0.8)");
			$("legend").css("color","#222");
			$(".story-body").css("background-color","rgba(255,255,255,0.3)");
			changeCss(".theme-legend-item", "border-bottom:#eee solid 1px" );
			changeCss("a.theme-legend-item", "border-bottom:#eee solid 1px" );

			changeCss(".list-group-item","background:#ffffff");
		}
	};

	// set story colors to basemap type

	setTimeout("ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId())",1);


	// --------------------------------------------------------------
	// --------------------------------------------------------------
	//
	// legend tabs for more than 1 theme and the map layer
	//
	// --------------------------------------------------------------
	// --------------------------------------------------------------

	ixmaps.legend = ixmaps.legend || {};

	ixmaps.legend.nTabs = 0;

	ixmaps.legend.tabDivA = [{"tabName":"Map Layer",
					"tabId":"lastLegendTab",
					"divId":"map-legend",
					}];

	ixmaps.legend.resetTabs = function(){
		ixmaps.legend.nTabs = 0;
		ixmaps.legend.tabDivA = [{"tabName":"Map Layer",
					"tabId":"lastLegendTab",
					"divId":"map-legend",
					}];

		$("#themeLegendDiv").html("");
		$("#legendTabs").html('<ul id="legendTabsList" class="nav nav-tabs">'+
								'<li id="lastLegendTab">'+
								  '<a href="#" onclick="ixmaps.legend.activateTab($(this))">Map Layer</a>'+
								'</li>'+
							  '</ul>');
	}

	ixmaps.legend.createTab = function(szLegendId){

		// create new tab to switch legend panes
		++ixmaps.legend.nTabs;

		var tabName = 'Theme '+ (ixmaps.legend.nTabs);
		var tabId =   'Theme'+ (ixmaps.legend.nTabs);
	
		ixmaps.legend.tabDivA.push({	"tabName":tabName,
						"tabId":tabId,
						"divId":szLegendId	});

		$("#themeLegendDiv").append('<div id="'+(szLegendId)+'" class="inline-legend" ></div>');

		$("#lastLegendTab").parent().parent().find("li").removeClass("active");
		$("#lastLegendTab").before('<li id="'+(tabId)+'" class="active"><a href="#" onclick="ixmaps.legend.activateTab($(this))">'+ tabName +'</a></li>');

		$("#themeLegendDiv").children().css("display","none");
		$(".inline-legend").hide();

		$("#"+ixmaps.legend.tabDivA[ixmaps.legend.nTabs].divId).show();

		$("#legendTabs").show();

	}

	ixmaps.legend.activateTab = function(el){
		el.parent().parent().find("li").removeClass("active");
		el.parent().addClass("active");
		if ( el.text().length <= 1 ){
			$(".inline-legend").show();
			$(".map-legend-footer").hide();
		}else{
			$(".inline-legend").hide();
			$(".map-legend-footer").show();
			for ( i in ixmaps.legend.tabDivA ){
				if ( ixmaps.legend.tabDivA[i].tabName == el.text() ){
					$("#"+ixmaps.legend.tabDivA[i].divId).show();
				}
			}
		}
		ixmaps.resizeStoryFrame();
	}

	ixmaps.legend.removeTab = function(szLegendId){
		if ( ixmaps.legend.nTabs <= 0 ){
			ixmaps.legend.nTabs = 0;
			return;
		}
		$("#"+szLegendId).remove();
		//remove theme legend tab
		for ( i in ixmaps.legend.tabDivA ){
			if ( ixmaps.legend.tabDivA[i].divId == szLegendId ){
				$("#legendTabs .active").remove();
				ixmaps.legend.tabDivA.splice(i, 1);
			}
		}
		ixmaps.legend.nTabs--;

		$("#"+ixmaps.legend.tabDivA[ixmaps.legend.nTabs].divId).show();
		$("#"+ixmaps.legend.tabDivA[ixmaps.legend.nTabs].tabId).addClass("active");

		if ( ixmaps.legend.nTabs <= 0 ){
			$("#legendTabs").hide();
		}
		ixmaps.resizeStoryFrame();
	}

	ixmaps.viewer_makeLayerLegend = function(){
		
		szDisplay = ixmaps.legend.nTabs?$("#"+ixmaps.legend.tabDivA[0].divId).css("display"):null;

		if ( ixmaps.makeLayerLegend(2000) ){
			$("#legend").hide();
			$("#loadProject").hide();
			$("#loadProjectButton").show();
		}
		
		if ( szDisplay ){
			$("#"+ixmaps.legend.tabDivA[0].divId).css("display",szDisplay);
		}

		$("#legend-type-switch").hide();

	};


// -----------------------------
// EOF
// -----------------------------

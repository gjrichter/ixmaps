
	/**
		init sidebar	
	**/

	// change 'button' style to show presence of theme
	__setThemeButtonStyle = function(buttonObj,fFlag){
		if ( buttonObj.children().last().css("display") == "none" ){
			return;
		}
		if ( fFlag ){
			buttonObj.css("color","#ffffff");
			buttonObj.css("background","#70B86B");
			buttonObj.css("padding","0em 0.5em 0.15em 0.5em");
			buttonObj.css("border-radius","1em");
			buttonObj.css("line-height","0.8");
			buttonObj.css("font-size","0.9em");
			buttonObj.children().last().css("display","inline");
		}else{
			buttonObj.css("font-weight","");
			buttonObj.css("color","");
			buttonObj.css("background","");
			buttonObj.css("background-size","");
			buttonObj.css("margin","0em 0em 0em 0em");
			buttonObj.css("font-size","1em");
			buttonObj.children().last().css("display","none");
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

		//ixmaps.showLoading(". . .",true);
		setTimeout("ixmaps.hideLoading()",1);

		__setThemeButtonStyle(lastClicked,true);
		var li = (lastClicked.parent());
		var themeObj = ixmaps.getThemeObj(szId);
		if ( !themeObj.szFlag.match(/NOLEGEND/) ) {
			szHtml = themeObj.szTitle;
			if ( themeObj.szSnippet && typeof(themeObj.szSnippet)!="undefined"){
				szHtml += "<br><span style=\"font-size:0.8em;\"><em>"+themeObj.szSnippet+"</em></span>";
			}
			szHtml += "<div><img src='resources/images/bg-spinner.gif' style='display:block;margin:1em auto;height:32px'></div>";
			$(li).append("<div id='themeLegendDiv"+szId.replace(/\./g,'')+"' class='inline-legend' style='min-height:2em'>"+szHtml+"</div>");
		}
		clickA[szId] = lastClicked;
		if ( actThemeId ){
			ixmaps.removeTheme(actThemeId);
		}
	};
	
	
	var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;
	// intercept theme creation, to mark active themes
	ixmaps.htmlgui_onDrawTheme = function(szId){ 

		var themeObj = ixmaps.getThemeObj(szId);
		if ( themeObj.szFlag.match(/NOLEGEND/) ) {
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
		szHtml += themeObj.szTitle;
		if ( themeObj.szSnippet && typeof(themeObj.szSnippet)!="undefined"){
			szHtml += "<div style=\"margin:0.5em 1.5em 0.5em 0;font-size:0.8em;\">"+themeObj.szSnippet+"</div>";
		}

		if ( ixmaps.legend.makeColorLegendHTML ){
			szHtml += "<div style='margin-top:1em;margin-bottom:1em;overflow:auto'>";
			szHtml += ixmaps.legend.makeColorLegendHTML(szId);
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
			szHtml += "<span style=\"font-size:0.9em;\"><em>"+themeObj.szDescription+"</em></span>";
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

			if (1){
				szHtml += 		"<div style='margin-top:0.75em;margin-bottom:0.25em;' >";
					
				szHtml += 		"<a id='highbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"0.66\");' title='flatten' >";
				szHtml += 			"<span class='"+smaller_icon+"' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='lowbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1.5\");' title='amplify'>";
				szHtml += 			"<span class='"+bigger_icon+"' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='minusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"0.66\");' title='smaller charts'>";
				szHtml += 			"<span class='icon icon-minus' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='plusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1.5\");' title='bigger charts'>";
				szHtml += 			"<span class='icon icon-plus' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='valuebutton"+id+"' href='javascript:ixmaps.toggle_values(\""+szId+"\");' title='text value -/+'>";
				szHtml += 			"<span class='icon icon-spell-check' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='opminusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"0.66\");' title='more trasparency'>";
				szHtml += 			"<span class='icon icon-checkbox-unchecked' style='font-size:18px; color:#bbbbbb;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='opplusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"opacity\",\"1.5\");' title='less trasparency'>";
				szHtml += 			"<span class='icon icon-checkbox-partial' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='deletebutton"+id+"' href='javascript:ixmaps.removeTheme(\""+szId+"\");' title='remove theme'>";
				szHtml += 			"<span class='icon icon-remove' style='font-size:18px; color:#444444;background:#ffffff;padding:0.4em;'></span>";
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

		$("#themeLegendDiv"+id).html(szHtml);

		// GR 12.11.2016 keep mouse and touch events inside the legend div
		// ---------------------------------------------------------------
		$("#themeLegendDiv"+id).attr("onwheel","javascript:event.stopPropagation();");
		$("#themeLegendDiv"+id)[0].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv"+id)[0].addEventListener("touchend", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv"+id)[0].addEventListener("touchmove", function(event){event.stopPropagation();}, false);
		// ---------------------------------------------------------------

		$( "#lowbutton"+id ).button();
		$( "#highbutton"+id  ).button();
		$( "#minusbutton"+id  ).button();
		$( "#plusbutton"+id  ).button();
		$( "#valuebutton"+id  ).button();
		$( "#opminusbutton"+id  ).button();
		$( "#opplusbutton"+id  ).button();
		$( "#deletebutton"+id  ).button();

		__showFooter(clickA[szId]);

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
		$("#themeLegendDiv"+szId.replace(/\./g,'')).html("");
		$("#themeLegendDiv"+szId.replace(/\./g,'')).remove();

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

		var szThemeStyle = ixmaps.getThemeStyleString();

		if ( szThemeStyle.match(/CHOROPLETHE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'dopacitypow:'+String(1/Number(szFactor)),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'dopacityscale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'opacity:'+String(szFactor),'factor');
					break;
			}
		}else
		if ( szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
			}
		}else{
			switch (szParameter) {
				case "amplify":
					if ( szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/) ){
						ixmaps.changeThemeStyle(szThemeId,'rangescale:'+String(szFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(szThemeId,'normalsizevalue:'+String(1/Number(szFactor)),'factor');
					}
					break;
				case "scale":
					ixmaps.changeThemeStyle(szThemeId,'scale:'+String(szFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(szThemeId,'fillopacity:'+String(szFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(szThemeId,'gridwidth:'+String(szFactor),'factor');
					break;
			}
		}
	};


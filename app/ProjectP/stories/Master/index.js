
	/**
		init map viewer in sidebar	
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

	// ------------------------
	// tooltips for SVG charts
	// ------------------------

	var showTooltip = function(evt, text) {
	  if ( text && text.length )		  {
		  var tooltip = document.getElementById("tooltip");
		  var sidebar = document.getElementById("sidebar");
		  var tA = text.split(".00");
		  tooltip.innerHTML = tA[0] + ( (tA[1] && !tA[1].match(/undefined/)) ? tA[1] : "");
		  tooltip.style.display = "block";
		  var left = 0; //parseInt(sidebar.style.getPropertyValue("left"));
		  tooltip.style.left = evt.pageX - left - 20 + 'px';
		  tooltip.style.top = evt.pageY + 20 + 'px';
	  }
	}

	var hideTooltip = function() {
	  var tooltip = document.getElementById("tooltip");
	  tooltip.style.display = "none";
	}

	ixmaps.onMouseOver = function(){
		var szTooltip = null;
		var source = event.target;
		while ( !szTooltip && source ){
			szTooltip = source.getAttribute("tooltip");
			source = source.parentNode;
		}
		showTooltip(event,szTooltip);
	};

	ixmaps.onMouseOut = function(){
		hideTooltip();
	};
	
	ixmaps.onMouseClick = function(){
		var szId = null;
		var nClass = null;
		var source = event.target;
		while ( !nClass && source ){
			nClass = source.getAttribute("class");
			source = source.parentNode;
		}
		var source = event.target;
		while ( !szId && source ){
			szId = source.getAttribute("id");
			source = source.parentNode;
		}
		szId = szId.split(":")[0];
		ixmaps.markThemeClass(szId,nClass);
	};

	// --------------------------------------------------------------
	// intercept theme creation, to create the theme legend 
	// --------------------------------------------------------------
	
	// intercept new theme to prepare the legend
	//
	ixmaps.htmlgui_onNewTheme = function(szId){

		var themeObj = ixmaps.getThemeDefinitionObj(szId);

        if ( (themeObj.style.type.match(/NOLEGEND/) || themeObj.style.type.match(/NOINFO/)) ) {
			return;
		}
        
		// append or replace legend div
		// ---------------------------------------------------------------
		var szLegendId = szId.replace(/\./g,"_");
        
        // store theme id for further usage
        ixmaps.legend.legendA = ixmaps.legend.legendA || {};
        ixmaps.legend.legendA[szLegendId] = ixmaps.legend.legendA[szLegendId] || {};      
        ixmaps.legend.legendA[szLegendId].szId = szId;

 		createTab(szLegendId);
        
		// show splash message
		// ---------------------------------------------------------------
        if ( !$("#externalLegend")[0] ){
			if (themeObj.style.splash){
 				$("#"+szLegendId).html(themeObj.style.splash);
			}else{
				$("#"+szLegendId).html("...");
			}
		}
 
		// show legend 
		// ---------------------------------------------------------------
		$("#themeLegendDiv").show();

		$("#legend").hide();
		$("#loadProject").hide();
		$("#loadProjectButton").show();
		$("#saveProjectButton").show();

		ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId());
	};

	
	var old_onDrawTheme = ixmaps.htmlgui_onDrawTheme;
	var __noSlideRefresh = false;
	var __sliderRange = null;

	// intercept theme creation done, and make the legend
	//
	ixmaps.htmlgui_onDrawTheme = function(szId){ 
		
		if ( !szId ){
			return;
		}
		if(__noSlideRefresh){
			return;
		}	
		var themeObj = ixmaps.getThemeObj(szId);
		ixmaps.themeObj = themeObj;	
		if ( themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/) ) {
			try	{
				old_onDrawTheme(szId); 
			}catch (e){}
			return;
		};
		
		// get old legend scroll
		var szLegendId = szId.replace(/\./g,"_");
		var nOldLegendScroll = 0;
		if ( $("#"+szLegendId)[0] ){
			nOldLegendScroll = ($("#"+szLegendId+" .color-legend-scroll").scrollTop());
		}

		// if CLIP theme, don't actualize legend on every frame
		if(themeObj.szFlag.match(/\bCLIP\b/) && themeObj.nActualFrame){
			var actualFrame = themeObj.nActualFrame;
			var szFrameText = themeObj.szXaxisA[themeObj.nActualFrame];
			$("#time-span").html(szFrameText);
			$("#myRange").attr("value",actualFrame);
			return;
		}

		var colorA  = themeObj.colorScheme;
		var labelA  = themeObj.szLabelA;
		if ( !labelA ){
			labelA = new Array();
			var szUnit = themeObj.szUnit || "";
			for ( var i=0; i<colorA.length && themeObj.partsA[i]; i++){
				var szPart = parseFloat(themeObj.partsA[i].min).toFixed(2)+szUnit+" ... "+parseFloat(themeObj.partsA[i].max).toFixed(2)+szUnit;
				labelA.push(szPart);
			}
		}
 
		// --------------------------
 		// compose the legend (HTML)
        // --------------------------
		
		szHtml = "";
        
		// title
		szHtml += "<h3>"+themeObj.szTitle+"</h3>";
		if ( themeObj.szSnippet && typeof(themeObj.szSnippet)!="undefined"){
			szHtml += "<div style=\"margin:0.5em 1.5em 0.5em 0;font-size:1.1em;line-height:1.2em\">"+themeObj.szSnippet+"</div>";
		}

		// <div> + <svg> to receive a chart (svg)
		if(1){
			szHtml += "<div id='menuDiv"+szLegendId+"' style='margin:1em 0 0.5em 0;overflow:hidden'>";
			szHtml += "<svg width='300' height='300' viewBox='-500 -3500 5000 5000'>";
			szHtml += "<g id='getchartmenutarget"+szLegendId+"' onmousemove='javascript:ixmaps.onMouseOver();' onmouseout='javascript:ixmaps.onMouseOut();' onclick='javascript:ixmaps.onMouseClick();'></g>";
			szHtml += "</svg></div>";
		}		

		// make legend colors 
        // a table of colors, label and values
        if ( 1 || !themeObj.szFlag.match(/\bCLIP\b/) )
		if ( ixmaps.legend.makeColorLegendHTML ){
            var maxLegendHeight = themeObj.szFlag.match(/SIMPLELEGEND|COMPACTLEGEND|MINILEGEND/)?200:400;
			szHtml += "<div class='color-legend-scroll' style='margin-top:1em;margin-bottom:0em;max-height:"+maxLegendHeight+"px;overflow:auto'>";
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

		szHtml += "</div>";
		
        // add legend footer
		szHtml += "<div class='map-legend-footer' >";
		if (themeObj.szDescription){
			szHtml += "<div style=\"font-size:0.9em;margin:1em 0 0 0\"><em>"+themeObj.szDescription+"</em></div>";
		}
 		szHtml += ixmaps.htmlgui_onLegendFooter ? ixmaps.htmlgui_onLegendFooter(szId,themeObj,ixmaps.embeddedApi.embeddedApi.getThemeDefinitionObj(szId)) : "";

        if ( !themeObj.szFlag.match(/SIMPLELEGEND|COMPACTLEGEND|MINILEGEND/) && !(ixmaps.layout == "minimal") ) {
       
			var id = szId.replace(/\./g,'');

			var bigger_icon = "icon icon-arrow-up";
			var smaller_icon = "icon icon-arrow-down";

			if ( themeObj.szFlag.match(/VECTOR/) ){
				bigger_icon = "icon icon-shrink2";
				smaller_icon = "icon icon-enlarge2";
			}else
			if ( themeObj.szFlag.match(/AGGREGATE/) ){
				bigger_icon = "icon icon-table2";
				smaller_icon = "icon icon-table";
				bigger_icon = "glyphicon glyphicon-th-large";
				smaller_icon = "glyphicon glyphicon-th";
			}else
			if ( themeObj.szFlag.match(/DOPACITY/) ){
				bigger_icon = "icon icon-contrast";
				smaller_icon = "icon icon-radio-unchecked";
			}
			
			if (themeObj.nDoneCount){
				szHtml += 		"<div style='margin-left:0px;margin-top:0.75em;margin-bottom:0.25em;' >";
					
				szHtml += 		"<a id='highbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1/1.25\");' title='flatten' >";
				szHtml += 			"<span class='"+smaller_icon+"' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='lowbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"amplify\",\"1.25\");' title='amplify'>";
				szHtml += 			"<span class='"+bigger_icon+"' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='minusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1/1.25\");' title='smaller charts'>";
				szHtml += 			"<span class='icon icon-minus' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='plusbutton"+id+"' href='javascript:ixmaps.changeThemeDynamic(\""+szId+"\",\"scale\",\"1.25\");' title='bigger charts'>";
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

				szHtml += 		"<a id='deletebutton"+id+"' href='javascript:ixmaps.removeTheme(null,\""+szId+"\");' title='remove theme'>";
				szHtml += 			"<span class='icon icon-bin2' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += 			"</a>&nbsp;";

				szHtml += 		"<a id='lockbutton"+id+"' href='javascript:ixmaps.changeThemeStyle(null,\""+szId+"\",\"type:LOCKED\",\"toggle\");' title='chart menu'>";
				if ( themeObj.szFlag.match(/LOCKED/) ) {
					szHtml += 			"<span class='icon icon-lock' style='font-size:18px;color:#444444;padding:0.4em;'></span>";
					szHtml += 			"</a>&nbsp;";
				}else{
					szHtml += 			"<span class='icon icon-unlocked' style='font-size:18px;color:#444444;padding:0.4em;'></span>";
					szHtml += 			"</a>&nbsp;";
				}

				szHtml += 		"</ div>";

			}
        }
		
		// if time field is defined, make time slider 
		// ---------------------------------------------------------------
		var uMin = 10000000000000;
		var uMax = -100000000000000;
		if (themeObj.szTimeField  ){
			szHtml += "<h4 style='margin-top:0.5em;margin-bottom:0.5em'>time <span id='time-span'></span></h4>";
			if ( themeObj.szTimeField == "$item$" ){
				uMin = new Date(themeObj.szFieldsA[0]).getTime();
				uMax = new Date(themeObj.szFieldsA[themeObj.szFieldsA.length-1]).getTime();
				__sliderRange = uMax-uMin;
			}else
			for ( a in themeObj.itemA ){
				var uTime = new Date(themeObj.itemA[a].szTime).getTime() || 0;
				uMax = Math.max(uMax,uTime||uMax);
				uMin = Math.min(uMin,uTime||uMin);
			}
	  		szHtml += "<input type='range' min='"+uMin+"' max='"+uMax+"' value='0' class='slider' id='myRange'>";

			var uDay = 1000*60*60*24;
			var days = (uMax-uMin)/uDay;
			
			szHtml += "<div class='btn-group btn-group-toggle' data-toggle='buttons' style='margin-left:-0.6em;margin-top:0.5em'>";
			szHtml += "  <label class='btn btn-secondary' onclick='javascript:__sliderRange=1000*60*60*24;'>";
			szHtml += "	<input type='radio' name='options' id='option1'> day";
			szHtml += "  </label>";
			if ( days < 2 ){
				szHtml += "  <label class='btn btn-secondary' onclick='javascript:__sliderRange=1000*60*60;'>";
				szHtml += "	<input type='radio' name='options' id='option1'> hour";
				szHtml += "  </label>";
			}
			if ( days > 13 ){
				szHtml += "  <label class='btn btn-secondary' onclick='javascript:__sliderRange=1000*60*60*24*7;'>";
				szHtml += "	<input type='radio' name='options' id='option1'> week";
				szHtml += "  </label>";
			}
			if ( days > 55 ){
				szHtml += "  <label class='btn btn-secondary' onclick='javascript:__sliderRange=1000*60*60*24*28;'>";
				szHtml += "	<input type='radio' name='options' id='option2'> month";
				szHtml += "  </label>";
			}
			if ( days > 365 ){
				szHtml += "  <label class='btn btn-secondary' onclick='javascript:__sliderRange=1000*60*60*24*365;'>";
				szHtml += "	<input type='radio' name='options' id='option3' > year";
				szHtml += "  </label>";
			}
			szHtml += "</div>";
		}
		
 		// if theme is CLIP, make clip frame slider 
		// ---------------------------------------------------------------
		if (themeObj.szFlag.match(/\bCLIP\b/)){
			var clipFrames = themeObj.nClipFrames;
			var actualFrame = themeObj.nActualFrame;
			var szFrameText = themeObj.szXaxisA[themeObj.nActualFrame];
			szHtml += "<h4 style='margin-top:0.5em;margin-bottom:0em'><span id='time-span'>"+szFrameText+"</span></h4>";
			szHtml += "<div style='margin-left:-0.4em'>"
			if(themeObj.fClipPause){
				szHtml += "<a id='clipbutton' href='javascript:ixmaps.legend.toggleClipState(true);' title='start clip'>";
				szHtml += "<span id='clipbuttonicon' class='glyphicon glyphicon-play' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += "</a>";
			}else{
				szHtml += "<a id='clipbutton' href='javascript:ixmaps.legend.toggleClipState(false);' title='pause clip'>";
				szHtml += "<span id='clipbuttonicon' class='glyphicon glyphicon-pause' style='font-size:18px; color:#444444;background:none;padding:0.4em;'></span>";
				szHtml += "</a>";
			}
			szHtml += "<input type='range' min='"+0+"' max='"+(clipFrames-1)+"' value='"+actualFrame+"' class='slider' id='myRange' style='margin-left:2em;width:50%;margin-top:-1em'>";
			szHtml += "</div>"
			
			ixmaps.legend.toggleClipState = function(state){
				if (state){
					ixmaps.startThemeClip(null);
					$("#clipbutton").attr("href","javascript:ixmaps.legend.toggleClipState(false);");
					$("#clipbuttonicon").removeClass("glyphicon-play");
					$("#clipbuttonicon").addClass("glyphicon-pause");
				}else{
					ixmaps.pauseThemeClip(null);
					$("#clipbutton").attr("href","javascript:ixmaps.legend.toggleClipState(true);");
					$("#clipbuttonicon").removeClass("glyphicon-pause");
					$("#clipbuttonicon").addClass("glyphicon-play");
				}
			}
		}
       
		try	{
			ixmaps.setTitle(String(themeObj.szTitle+"<div style='font-size:0.5em;line-height:1em;'>"+(themeObj.szSnippet||"")+"</div>"));
		}catch (e){}

		szHtml += "</div>";
        
		// ---------------------------------------------------------------
        // HTML for legend is complete
		// ---------------------------------------------------------------

		$("#legend").hide();
		$("#loadProject").hide();
		$("#loadProjectButton").show();
		$("#themeLegendDiv").show();

		// append or replace legend div
		// ---------------------------------------------------------------
		var szLegendId = szId.replace(/\./g,"_");

		createTab(szLegendId);
        ixmaps.legend.legendA[szLegendId].szId = szId;
        
		$("#"+szLegendId).html(szHtml);

		// draw the chart by theme api call 
		// -----------------------------------
		// -----------------------------------

		if ( themeObj.szFlag.match(/OVERVIEW|GAUGE/) &&
			 themeObj.nDoneCount			  &&
			 $("#getchartmenutarget"+szLegendId)[0] ){
			var fDark = ixmaps.htmlgui_getMapTypeId().match(/dark/i) || ixmaps.htmlgui_getMapTypeId().match(/black/i);

			old_szValueUpper = themeObj.szValueUpper;
			themeObj.szValueUpper = null;
			old_nClipParts = themeObj.nClipParts;
			themeObj.nClipParts = null;
			old_szTextColor = themeObj.szTextColor;
			themeObj.szTextColor = fDark?"white":null;
			old_szLineColor = themeObj.szLineColor;
			themeObj.szLineColor = themeObj.szLineColor || "#888888";
			old_nLineWidth = themeObj.nLineWidth;
			themeObj.nLineWidth = themeObj.nLineWidth ? Math.min(themeObj.nLineWidth/2.5,0.5) : 0;
			old_fillOpacity = themeObj.fillOpacity;
			themeObj.fillOpacity = "0.8";
			old_szUnit = themeObj.szUnit;
			themeObj.szUnit = themeObj.szFlag.match(/SUM/)?"":"";
			old_szValueDecimals = themeObj.szValueDecimals;
			themeObj.szValueDecimals = null;
		
			if ( themeObj.szFlag.match(/BAR/) ){
				var ptNull = themeObj.drawChart($("#getchartmenutarget"+szLegendId)[0], null, 90, themeObj.szFlag+"|NORMSIZE|SPACED");
			}else
			if ( themeObj.szFlag.match(/PLOT/) ){
					themeObj.fillOpacity = old_fillOpacity;
					old_nMaxValue = themeObj.nMaxValue;
					delete themeObj.nMaxValue;
					var tmp = themeObj.nMaxValuePlot;
					var ptNull = themeObj.drawChart($("#getchartmenutarget"+szLegendId)[0], null, 30, themeObj.szFlag+"|GRID");
					themeObj.nMaxValuePlot= tmp;
					if ( typeof(old_nMaxValue) != "undefined" ){
						themeObj.nMaxValue = old_nMaxValue;
					}
			}else{
				// make summary pie
				// ----------------
				if ( fDark && (!themeObj.szLineColor || (themeObj.szLineColor == "black") || (themeObj.szLineColor == "#000000") || (themeObj.szLineColor == "RGB(0,0,0)")) ){
					themeObj.szLineColor = "#888888";
				}
				if ( themeObj.szFlag.match(/EXACT|CATEGORICAL/) ){
					var ptNull = themeObj.drawChart($("#getchartmenutarget"+szLegendId)[0], null, 90, "CHART|PIE|DONUT|HALF|VALUES|EXACT|ORDER|SORT|SUM|AUTO100");
				}else if ( themeObj.szFlag.match(/HALF/) ) {
					var ptNull = themeObj.drawChart($("#getchartmenutarget"+szLegendId)[0], null, 90, "CHART|PIE|DONUT|HALF|VALUES|SUM" );
				}else{
					var ptNull = themeObj.drawChart($("#getchartmenutarget"+szLegendId)[0], null, 90, "CHART|PIE|DONUT|HALF|VALUES|SUM" );
				}
			}

			themeObj.szValueUpper = old_szValueUpper;
			themeObj.nClipParts = old_nClipParts;
			themeObj.szTextColor = old_szTextColor;
			themeObj.szLineColor = old_szLineColor;
			themeObj.nLineWidth = old_nLineWidth;
			themeObj.fillOpacity = old_fillOpacity;
			themeObj.szUnit = old_szUnit;
			themeObj.szValueDecimals = old_szValueDecimals;

			// size the chart to div extent

			var SVGBox = $("#getchartmenutarget"+szLegendId)[0].getBBox();

			if ( SVGBox.width && SVGBox.height ){
				var scale = Math.max(1,400/SVGBox.width);
				SVGBox.width *= scale;
				SVGBox.height *= scale;
				SVGBox.y -= 30;
				SVGBox.height += 60;
				SVGBox.width += 60;

				var size = 300;
				if ( themeObj.szFlag.match(/PLOT/) ){
					size = 400;
				}
				if ( themeObj.szFlag.match(/BAR/) ){
					size = 200;
				}
				var width  = size;
				var height = size/SVGBox.width*SVGBox.height;

				while (height > width){
					height*= 0.9;
				}

				$("#getchartmenutarget"+szLegendId)[0].parentNode.setAttribute("height",height);
				$("#getchartmenutarget"+szLegendId)[0].parentNode.setAttribute("viewBox",SVGBox.x+' '+SVGBox.y+' '+SVGBox.width+' '+SVGBox.height);
				$("#menuDiv"+szLegendId).show();

			}else{
				$("#menuDiv"+szLegendId).hide();
			}
		}else{
			//$("#getchartmenutarget"+szLegendId)[0].parentNode.setAttribute("height",0);
			$("#menuDiv"+szLegendId).hide();
		}

		// init time frame slider
		// ------------------------
		if (themeObj.szTimeField){
			var slider = document.getElementById("myRange");
			// Update the current slider value (each time you drag the slider handle)
			slider.oninput = function() {
				var x = new Date(Number(this.value)) || this.value;
				if (this.value == uMin ){
					ixmaps.setThemeTimeFrame(null,null,uMin, uMax);
					$("#time-span").html("");
				}else{
					var uDay = 1000*60*60*24;
					var range = uDay;
					var days = (uMax-uMin)/uDay;
                    // values are not uTime values, but simple numeric sequenze
                    if (uMax < uDay){
                        range = 1;
                    }else
					if (days > 120){
						range = 1000*60*60*24*28;
					}else
					if (days < 7){
						range = 1000*60*60;
					}
					range = __sliderRange||range;
					if ( themeObj.szTimeField == "$item$" ){
						ixmaps.setThemeTimeFrame(null,null,Number(this.value)-Number(range),this.value);
					}else{
						ixmaps.setThemeTimeFrame(null,null,this.value,Number(this.value)+Number(range));
					}
					if (range == 1){
						$("#time-span").html(String(this.value));
                    }else
					if (range < uDay){
						$("#time-span").html(x.toLocaleDateString()+"-"+x.toLocaleTimeString());
					}else{
						$("#time-span").html(x.toLocaleDateString()+" - "+new Date(Number(this.value)+Number(range)).toLocaleDateString());
					}
				}
				//clearTimeout(clipTimeout);
				//ixmaps.setClipFrame(Number(this.value));
			}
			slider.onmouseup = function(){
				//ixmaps.setClipFrame(Number(this.value));
			}
			slider.onchange = function(){
				console.log(this.value);
			}
		}
		
		// init clip frame slider
		// ------------------------
		if (themeObj.szFlag.match(/\bCLIP\b/) && !__noSlideRefresh){
			var slider = document.getElementById("myRange");
			// Update the current slider value (each time you drag the slider handle)
			slider.oninput = function() {
				__noSlideRefresh = true;
				ixmaps.legend.toggleClipState(false);
				ixmaps.setThemeClipFrame(null,null,this.value);
				$("#time-span").html(themeObj.szXaxisA[this.value]);
			}
			slider.onmouseup = function(){
				__noSlideRefresh = false;
				//ixmaps.setClipFrame(Number(this.value));
			}
			slider.onchange = function(){
				console.log(this.value);
			}
		}
		
		// -----------------------------------
		// -----------------------------------

		// GR 12.11.2016 keep mouse and touch events inside the legend div
		// ---------------------------------------------------------------
		$("#themeLegendDiv").attr("onwheel","javascript:event.stopPropagation();");
		$("#themeLegendDiv")[0].addEventListener("touchstart", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchend", function(event){event.stopPropagation();}, false);
		$("#themeLegendDiv")[0].addEventListener("touchmove", function(event){event.stopPropagation();}, false);

		// set old legend scroll if defined
		if (nOldLegendScroll ){
			$("#"+szLegendId+" .color-legend-scroll").scrollTop(nOldLegendScroll);
		}	

		// ---------------------------------------------------------------

		try	{
			old_onDrawTheme(szId); 
		}catch (e){}

	};

	// intercept theme deletion, to remove active themes mark
	//
	ixmaps.htmlgui_onRemoveTheme = function(szId){ 
        
		var themeObj = ixmaps.getThemeObj(szId);
		ixmaps.themeObj = themeObj;	
		if ( themeObj.szFlag.match(/NOLEGEND/) || themeObj.szFlag.match(/NOINFO/) ) {
			try	{
				old_onRemoveTheme(szId); 
			}catch (e){}
			return;
		};
        
		if ( clickA[szId] ){
			__setThemeButtonStyle(clickA[szId],false);
			__hideFooter(clickA[szId]);
			clickA[szId] = null;
		}

		//remove theme div
		var szLegendId = szId.replace(/\./g,"_");
		removeTab(szLegendId);

		try	{
			ixmaps.setTitle("");
		}catch (e){}
	};

	// --------------------------------------------------------------
	// helper
	// --------------------------------------------------------------

	ixmaps.toggle_values = function(szThemeId){
		var themeObj = ixmaps.getThemeObj(szThemeId);
		if ( themeObj && themeObj.szFlag.match(/VALUES/) ){
			ixmaps.changeThemeStyle(null,szThemeId,'type:VALUES;','remove');
		}else{
			ixmaps.changeThemeStyle(null,szThemeId,'type:VALUES;','add');
			ixmaps.changeThemeStyle(null,szThemeId,'type:DTEXT;','add');
			ixmaps.changeThemeStyle(null,szThemeId,'type:VALUEBACKGROUND;','add');
		}
	};

	ixmaps.changeThemeDynamic = function(szThemeId,szParameter,szFactor){
		
		var themeObj = ixmaps.getThemeObj(szThemeId);

		var nFactor = Number(eval(szFactor));

		var szThemeStyle = themeObj.szFlag;

		if ( szThemeStyle.match(/CHOROPLETH/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(null,szThemeId,'dopacitypow:'+String(1/nFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(null,szThemeId,'dopacityscale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(null,szThemeId,'opacity:'+String(nFactor),'factor');
					break;
			}
		}else
		if ( szThemeStyle.match(/GRIDSIZE/) || szThemeStyle.match(/AUTOSIZE/) ){
			switch (szParameter) {
				case "amplify":
					ixmaps.changeThemeStyle(null,szThemeId,'gridwidth:'+String(nFactor),'factor');
					break;
				case "scale":
					ixmaps.changeThemeStyle(null,szThemeId,'scale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(null,szThemeId,'fillopacity:'+String(nFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(null,szThemeId,'gridwidth:'+String(nFactor),'factor');
					break;
			}
		}else{
			switch (szParameter) {
				case "amplify":
					if ( szThemeStyle.match(/BAR/) || szThemeStyle.match(/PLOT/) || szThemeStyle.match(/STAR/) ){
						ixmaps.changeThemeStyle(null,szThemeId,'rangescale:'+String(nFactor),'factor');
					}else{
						ixmaps.changeThemeStyle(null,szThemeId,'normalsizevalue:'+String(1/Number(nFactor)),'factor');
					}
					break;
				case "scale":
					ixmaps.changeThemeStyle(null,szThemeId,'scale:'+String(nFactor),'factor');
					break;
				case "opacity":
					ixmaps.changeThemeStyle(null,szThemeId,'fillopacity:'+String(nFactor),'factor');
					break;
				case "aggregation":
					ixmaps.changeThemeStyle(null,szThemeId,'gridwidth:'+String(nFactor),'factor');
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

		if ( szId.match(/dark/i) || szId.match(/black/i) || szId.match(/satellite/i) ){

			$("#header").css("background","black");
			$("#themeLegendDiv").css("background","none");
			$("#themeLegendDiv").css("border","none");
			$("#map-legend").css("background","rgba(0,0,0,0.66)");
			$("legend").css("color","#ddd");
			$(".story-body").css("background-color","rgba(0,0,0,0)");

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

			changeCss(".inline-legend","color:rgba(200,200,200,1)");
			changeCss(".inline-legend","background-color:rgba(0,0,0,0.75)");
			changeCss(".inline-legend","border-color:rgba(120,120,120,0)");
			changeCss(".inline-legend","border-top:rgba(120,120,120,0.5) solid 1px");

			changeCss("hr","border-top: 1px solid #444");

		}else{

			$("#header").css("background","white");
			$("#themeLegendDiv").css("background","rgba(255,255,255,0.6)");
			$("#themeLegendDiv").css("border","none");
			$("#map-legend").css("background","rgba(255,255,255,0.75)");
			$("legend").css("color","#222");
			$(".story-body").css("background-color","rgba(255,255,255,0)");
			changeCss(".theme-legend-item", "border-bottom:#eee solid 1px" );
			changeCss("a.theme-legend-item", "border-bottom:#eee solid 1px" );

			changeCss(".list-group-item","background:#ffffff");
		}
	};

	// set story colors to basemap type

	setTimeout("ixmaps.htmlgui_setMapTypeBG(ixmaps.getMapTypeId())",1);

	// --------------------------------------------------------------
	// legend tabs for more than 1 theme and the map layer
	// --------------------------------------------------------------

	var tabDivA = [{"tabName":"Map",
					"tabId":"lastLegendTab",
					"divId":"map-legend"
					}];

	createTab = function(szLegendId,szTabName){
        
        // check if tab for legend id already exist
        for ( var i in tabDivA ){
            if ( tabDivA[i].divId == szLegendId ) {
               return;
            }
        }

		// create new tab to switch legend panes
		++nLegendTabs;

		var tabName = szTabName || 'Theme ';//+ (nLegendTabs-1);
		var tabId =   'Theme'+ (nLegendTabs);
	
		tabDivA.push({	"tabName":tabName,
						"tabId":tabId,
						"divId":szLegendId	});

		$("#themeLegendDiv").append('<div id="'+(szLegendId)+'" class="inline-legend" ></div>');

		if ( nLegendTabs == 1 ){
			$("#lastLegendTab").parent().parent().find("li").removeClass("active");
			$("#lastLegendTab").before('<li id="'+(tabId)+'" class="active"><a href="#" onclick="activateTab($(this))">'+ tabName +'</a></li>');
		}else{
			$("#lastLegendTab").before('<li id="'+(tabId)+'"><a href="#" onclick="activateTab($(this))">'+ tabName +'</a></li>');
		}
		$("#themeLegendDiv").children().css("display","none");
		$(".inline-legend").hide();
		$("#"+tabDivA[1].divId).show();
		$("#legendTabs").show();
        
        try {
            ixmaps.legend.activeLegendId = tabDivA[1].divId;
            ixmaps.parentApi.activeThemeId = ixmaps.legend.legendA[ixmaps.legend.activeLegendId].szId;
        }catch (e){}
	}

	activateTab = function(el){
		el.parent().parent().find("li").removeClass("active");
		el.parent().addClass("active");
		if ( el.text().length <= 1 ){
			$(".inline-legend").show();
			$(".map-legend-footer").hide();
		}else{
			$(".inline-legend").hide();
			$(".map-legend-footer").show();
			var tabId = el.parent()[0].getAttribute("id");
			for ( i in tabDivA ){
				if ( tabDivA[i].tabId == tabId ){
					$("#"+tabDivA[i].divId).show();
                    try {
                        ixmaps.legend.activeLegendId = tabDivA[i].divId;
                        ixmaps.parentApi.activeThemeId = ixmaps.legend.legendA[ixmaps.legend.activeLegendId].szId;
                     }catch (e){}
 				}
			}
		}
		ixmaps.resizeStoryFrame();
	}

	nextTab = function(){ return;
		for ( i in tabDivA ){
			activateTab($("#"+tabDivA[i].tabId+":first-child"));
			return;
		}
	}

	removeTab = function(szLegendId){
		$("#"+szLegendId).remove();
		//remove theme legend tab
		for ( i in tabDivA ){
			if ( tabDivA[i].divId == szLegendId ){
				$("#legendTabs .active").remove();
				tabDivA.splice(i, 1);
			}
		}
		nLegendTabs--;

		$("#"+tabDivA[nLegendTabs].divId).show();
		$("#"+tabDivA[nLegendTabs].tabId).addClass("active");

		if ( nLegendTabs <= 0 ){
			$("#legendTabs").hide();
		}else{
           try {
                ixmaps.legend.activeLegendId = tabDivA[nLegendTabs].divId;
                ixmaps.parentApi.activeThemeId = ixmaps.legend.legendA[ixmaps.legend.activeLegendId].szId;
             }catch (e){}
        }
		ixmaps.resizeStoryFrame();
	}

	ixmaps.loadExternalLegend = function(szUrl){

		if (!szUrl || (szUrl == "undefined") ){
			return;
		}

		var szHtml  = '<div id="map-legend-body" class="map-legend-body" style="margin-top:-1em;margin-bottom:0em;font-size:11px"></div>';
		
		if ( !$("#externalLegend")[0]){
			createTab("externalLegend","Info");
			$("#externalLegend").html(szHtml);
            if ((szUrl.substr(0,4) == "http")){
                $("#map-legend-body").load(szUrl);
			}else
            if (szUrl.match(/.html/)){
                $("#map-legend-body").load("../../"+szUrl);
            }else{
                 $("#map-legend-body").html("<div style='margin-top:1em'>"+szUrl+"</div>");
            }
			$("#themeLegendDiv").show();
		}

	};
	ixmaps.removeExternalLegend = function(){
		$("#externalLegend").html("");
		ixmaps.legend.url = null;
		var idA = ixmaps.getThemes();
		ixmaps.htmlgui_onDrawTheme(idA[idA.length-1].szId);
	}
	
	ixmaps.redrawLegend = function(){
		var idA = ixmaps.getThemes();
		if (idA && idA.length){
			ixmaps.htmlgui_onDrawTheme(idA[idA.length-1].szId);
		}
	}

	
	ixmaps.viewer_makeLayerLegend = function(){
        
        try	{
		  //ixmaps.loadExternalLegend(ixmaps.embeddedApi.embeddedApi.loadedProject.map.legend);
        }catch (e){}
		
		szDisplay = nLegendTabs?$("#"+tabDivA[0].divId).css("display"):null;

		$(".story-body").show();

		if ( ixmaps.makeLayerLegend(window.innerHeight*0.85) ){
			$("#legend").hide();
			$("#loadProject").hide();
			$("#loadProjectButton").show();
		}
		
		if ( szDisplay ){
			$("#"+tabDivA[0].divId).css("display",szDisplay);
		}

		$("#legend-type-switch").hide();

	};


// -----------------------------
// EOF
// -----------------------------

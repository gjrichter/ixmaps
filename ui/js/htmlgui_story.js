/**********************************************************************
	 htmlgui_story.js

$Comment: provides story functions to ixmaps
$Source : htmlgui_story.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2011/10/19 $
$Author: guenter richter $
$Id: htmlgui_story.js 1 2011-10-19 10:51:41Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: htmlgui_story.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides iXmaps HTML interface functions for map charting stories <br>
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

(function( ixmaps, $, undefined ) {

	// globals vars
	ixmaps.storyUrl = null;
	ixmaps.objThemesA = new Array();

	// local vars
	var szStoryRoot = ""; 
	var szStoryRootA = []; 
	var xmlLegendItems = null; 
	var szTheme = null; 

	// global functions

	/**
	 * reset story root
	 * (called on changing map, important if stories are defined with relativ urls)
	 * @return void
	 */
	ixmaps.resetStory = function(){
		szStoryRoot = ""; 
		szStoryRootA = []; 
	};

	/**
	 * loads a story given by szUrl into a HTML <div> with the id "story-board"
	 * (be shure to provide this div in your HTML)
	 * if szUrl is relative it will be applied to the last stories url root
	 * if it is the first story, the url root will be taken from the SVG maps url
	 * @param szUrl the url of the story (may be relative)
	 * @return void
	 */
	ixmaps.loadStory = function(szUrl,szFlag,target){

		if ( (szUrl == null) || typeof(szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0) ){
			return;
		}
		if ( target == null ){
			target = $('#story-board');
		}

		// set story board height (important for scrolling) 
		// ------------------------------------------------
		target.css("height",String(target.parent().height()-target.offset().top+25)+"px");
		// something gone wrong, so set to 100%
		if ( target.css("height") == "0px" ){
			target.css("height","100%");
		}

		/**
		if ( !(this.embeddedSVG || (this.embeddedApi && this.embeddedApi.embeddedSVG) ) && (!szFlag || !szFlag.match(/silent/)) ){
			setTimeout("ixmaps.loadStory('"+szUrl+"')",1000);
			return;
		}
		**/
		szUrl = encodeURI(unescape(szUrl));
		
		// absolute or relative URL 
		// ------------------------
		if ( szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//) ) {
			szStoryRoot = ""; 
			urlA = szUrl.split("/");
			for ( var i=0; i<urlA.length-1; i++){
				szStoryRoot += urlA[i]+"/";
			}
			szUrl = urlA[urlA.length-1];
		}

		// we have a master story loaded; all child stories refer to this root
		// -------------------------------------------------------------------
		if ( this.storyUrl && !this.masterStoryRoot ){
			// make absolute master story URL
			var urlA = String($(location).attr('origin')+$(location).attr('pathname')).split("/");
			urlA.pop();
			var szMasterStory = urlA.join('/') +'/'+ this.storyUrl; 

			// get absolute master story root
			urlA = szMasterStory.split("/");
			urlA.pop();
			this.masterStoryRoot = urlA.join('/')+'/';
		}
		
		// make absolute story root, if we have a master story loaded
		// ----------------------------------------------------------
		szStoryRoot = (this.masterStoryRoot||"")+szStoryRoot;

		// if not story root yet, preset with SVG map root
		// ----------------------------------------------------------------------------
		if ( !szStoryRoot || (szStoryRoot.length == 0) ){
			szStoryRoot = this.szUrlSVGRoot;
		}

		// final URL
		// ---------
		// magick, get rid of ./

		urlA = szUrl.split("./");
		/**
		szUrl = "";
		for ( var i=0; i<urlA.length; i++){
			szUrl += urlA[i];
		}
		**/
		var szStoryFilename = urlA[urlA.length-1];
		ixmaps.storyRoot = szStoryRoot;
		ixmaps.storyUrl = szStoryRoot+szUrl;
		if ( szUrl && typeof(szUrl) == "string" && szUrl.length ){

			$("#story-css").attr("href", szStoryRoot+szUrl.split('.')[0]+".css");
			$("#story-css-font").attr("href", szStoryRoot+szUrl.split('.')[0]+"_fonts.css");

			target.attr("visibility","invisible");

			// store root for further use inside callbacks
			szStoryRootA[szUrl] = szStoryRoot;

			target.load(szStoryRoot+szUrl+' #story', function(response, status, xhr) {
				if (status == "error") {
					var msg = "Sorry but there was an error: ";
					$("#story").html(msg + xhr.status + "<br><br> '" +szStoryRoot+szUrl+ "'<br><br> " + xhr.statusText);
				}else{
					try{
						ixmaps.htmlgui_onStoryLoaded(szUrl,target);
					}
					catch (e){}
					$.ajax({
						type: "GET",
						url: szStoryRootA[szUrl]+szUrl.split('.')[0]+".xml",
						dataType: "xml",
						success: function(xml) {
							ixmaps.objThemesA[String(szStoryFilename.split('.')[0])] = xml;
							if ( !szFlag || !szFlag.match(/silent/) ){
								$.getScript(szStoryRootA[szUrl]+szUrl.split('.')[0]+".js");
							}
						},
						error: function(xml) {
							if ( !szFlag || !szFlag.match(/silent/) ){
								$.getScript(szStoryRootA[szUrl]+szUrl.split('.')[0]+".js");
								}
							}
					});
				}
			});
		}
	};

	/**
	 * set a story given by szUrl as loaded 
	 * is needed to store the relative or absolute story addresses for further use.
	 * if it is the first story, the url root will be taken from the SVG maps url
	 * @param szUrl the url of the story (may be relative)
	 * @return void
	 */
	ixmaps.setStoryUrl = function(szUrl){

		if ( (szUrl == null) || typeof(szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0) ){
			return;
		}

		szUrl = encodeURI(unescape(szUrl));

		// absolute or relative URL 
		// ------------------------
		if ( szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//) ) {
			szStoryRoot = ""; 
			urlA = szUrl.split("/");
			for ( var i=0; i<urlA.length-1; i++){
				szStoryRoot += urlA[i]+"/";
			}
			szUrl = urlA[urlA.length-1];
		}

		// relative URL, combine with old story root or if not given, with SVG map root
		// ----------------------------------------------------------------------------
		if ( !szStoryRoot || (szStoryRoot.length == 0) ){
			szStoryRoot = this.szUrlSVGRoot;
		}

		// final URL
		// ---------
		// magick, get rid of ./

		urlA = szUrl.split("./");

		ixmaps.storyRoot = szStoryRoot;
		ixmaps.storyUrl = szStoryRoot+szUrl;
	};

	/**
	 * loads a story given by szUrl into a HTML <div> with the id "story-board"
	 * (be shure to provide this div in your HTML)
	 * if szUrl is relative it will be applied to the last stories url root
	 * if it is the first story, the url root will be taken from the SVG maps url
	 * @param szUrl the url of the story (may be relative)
	 * @return void
	 */
	ixmaps.loadStoryTool = function(szUrl){

		if ( (szUrl == null) || typeof(szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0) ){
			return;
		}
		$('#story-board').hide();
		$('#story-tool').show();
		var target = $('#story-tool');

		// set story board height (important for scrolling) 
		// ------------------------------------------------
		target.css("height",String(target.parent().height()-target.offset().top+25)+"px");
		// something gone wrong, so set to 100%
		if ( target.css("height") == "0px" ){
			target.css("height","100%");
		}

		/**
		if ( !(this.embeddedSVG || (this.embeddedApi && this.embeddedApi.embeddedSVG) ) && (!szFlag || !szFlag.match(/silent/)) ){
			setTimeout("ixmaps.loadStory('"+szUrl+"')",1000);
			return;
		}
		**/
		szUrl = encodeURI(unescape(szUrl));
		
		// absolute or relative URL 
		// ------------------------
		if ( szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//) ) {
			szStoryRoot = ""; 
			urlA = szUrl.split("/");
			for ( var i=0; i<urlA.length-1; i++){
				szStoryRoot += urlA[i]+"/";
			}
			szUrl = urlA[urlA.length-1];
		}

		// we have a master story loaded; all child stories refer to this root
		// -------------------------------------------------------------------
		if ( this.storyUrl && !this.masterStoryRoot ){
			// make absolute master story URL
			var urlA = String($(location).attr('origin')+$(location).attr('pathname')).split("/");
			urlA.pop();
			var szMasterStory = urlA.join('/') +'/'+ this.storyUrl; 

			// get absolute master story root
			urlA = szMasterStory.split("/");
			urlA.pop();
			this.masterStoryRoot = urlA.join('/')+'/';
		}
		
		// make absolute story root, if we have a master story loaded
		// ----------------------------------------------------------
		szStoryRoot = (this.masterStoryRoot||"")+szStoryRoot;

		// if not story root yet, preset with SVG map root
		// ----------------------------------------------------------------------------
		if ( !szStoryRoot || (szStoryRoot.length == 0) ){
			szStoryRoot = this.szUrlSVGRoot;
		}

		// final URL
		// ---------
		// magick, get rid of ./

		urlA = szUrl.split("./");

		var szStoryFilename = urlA[urlA.length-1];

		if ( szUrl && typeof(szUrl) == "string" && szUrl.length ){

			$("#story-css").attr("href", szStoryRoot+szUrl.split('.')[0]+".css");
			$("#story-css-font").attr("href", szStoryRoot+szUrl.split('.')[0]+"_fonts.css");

			target.attr("visibility","visible");

			// store root for further use inside callbacks
			szStoryRootA[szUrl] = szStoryRoot;

			target.load(szStoryRoot+szUrl, function(response, status, xhr) {
				if (status == "error") {
					var msg = "Sorry but there was an error: ";
					$("#story").html(msg + xhr.status + "<br><br> '" +szStoryRoot+szUrl+ "'<br><br> " + xhr.statusText);
				}else{
					target.append('<a href="javascript:ixmaps.hideStoryTool()" style="position:absolute;right:2em;top:1em">X</a>');
				}
			});
		}
	};

	/**
	 * loads a story given by szUrl into a HTML <div> with the id "story-board"
	 * (be shure to provide this div in your HTML)
	 * if szUrl is relative it will be applied to the last stories url root
	 * if it is the first story, the url root will be taken from the SVG maps url
	 * @param szUrl the url of the story (may be relative)
	 * @return void
	 */
	ixmaps.hideStoryTool = function(){
		$('#story-board').show();
		$('#story-tool').hide();
	}

	/**
	 * loads a theme from the theme definition part of a story
	 * this is a XML file, that contains definitions to be identified by a theme name
	 * @param szThemeName the name of the theme to load
	 * @param szSourceName the name of the xml file (load once!)
	 * @param callback the function to call when the theme has been successfully loaded
	 * @return void
	 */
	ixmaps.loadTheme = function(szThemeName,szSourceName,callback){

		if ( (szSourceName == null) || (typeof(szSourceName) == 'undefined') ){
			return;
		}
		if (!this.embeddedSVG && !this.embeddedApi.embeddedSVG){
			return;
		}

		if ( !szStoryRoot || (szStoryRoot.length == 0) ){
			szStoryRoot = this.szUrlSVGRoot;
		}

		var szUrl = szStoryRoot + szSourceName +".xml";
		if ( szUrl && typeof(szUrl) == "string" && szUrl.length ){
            $.ajax({
                 type: "GET",
                 url: szUrl,
                 dataType: "xml",
                 success: function(xml) {
					ixmaps.objThemesA[szSourceName] = xml;
					callback(szThemeName,szSourceName);
                 },
                 error: function(xml) {
					alert("error on loadTheme(): "+szSourceName+" not found!");
                 }
            });
		}
	};

	/**
	 * get the theme definition string for a theme
	 * (looks for any loaded theme)
	 * @param szThemeName the name of the theme
	 * @type string
	 * @return an executable theme definition string (javascript function call)
	 */
	ixmaps.getTheme = function(szThemeName,szSourceName){

		var szTheme = null;
		for ( a in ixmaps.objThemesA )	{
			if ( !szSourceName || (szSourceName == a) ){
				$(ixmaps.objThemesA[a]).find('LEGENDITEM').each(function(){
					if ( $(this).attr('name') == szThemeName ){
						szTheme = $(this).attr('onactivate').replace(/\n/gi,"");
					}
				}); //close each(
			}
		}
		if ( szTheme == null ){
			alert("error on getTheme(): '"+szThemeName+"' not found!");
		}
		return szTheme;
	};

	/**
	 * add a theme to the map
	 * looks for the requested theme
	 * if a theme source given, controls if it has already been loaded, if not tries to load the source first
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @param szSourceName the name of the theme source
	 * @return void
	 */
	ixmaps.addTheme = function(szThemeName,szSourceName){

		if ( szSourceName ){
			if ( !ixmaps.objThemesA[szSourceName] ){
				ixmaps.loadTheme(szThemeName,szSourceName,ixmaps.addTheme);
				return;
			}
		}
		var szTheme = ixmaps.getTheme(szThemeName,szSourceName);
		if ( szTheme ){
			ixmaps.execScript(szTheme,false);
		}
		
	};

	/**
	 * set a theme on the map
	 * looks for the requested theme
	 * if a theme source given, controls if it has already been loaded, if not tries to load the source first
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @param szSourceName the name of the theme source
	 * @return void
	 */
	ixmaps.setTheme = function(szThemeName,szSourceName){
		this.clearAll();
		this.toggleTheme(szThemeName,szSourceName);
	};
	/**
	 * toggle a theme to the map
	 * looks for the requested theme
	 * if a theme source given, controls if it has already been loaded, if not tries to load the source first
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @param szSourceName the name of the theme source
	 * @return void
	 */
	ixmaps.toggleTheme = function(szThemeName,szSourceName){

		if ( szSourceName ){
			if ( !ixmaps.objThemesA[szSourceName] ){
				ixmaps.loadTheme(szThemeName,szSourceName,ixmaps.toggleTheme);
				return;
			}
		}
		var szTheme = ixmaps.getTheme(szThemeName,szSourceName);
		if ( szTheme ){
			var theme = (eval('ixmaps.embeddedSVG.window.'+szTheme));
			if ( theme == null ){
				// ixmaps.embeddedApi.clearAll();
			}
		}
	};
	/**
	 * change the style of a theme
	 * looks for the requested theme
	 * if a theme source given, controls if it has already been loaded, if not tries to load the source first
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @param szSourceName the name of the theme source
	 * @return void
	 */
	ixmaps.changeThemeStyle = function(szThemeName,szStyle,szFlag){
		try {
			ixmaps.embeddedSVG.window.map.Api.changeThemeStyle(szThemeName,szStyle,szFlag);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.changeThemeStyle(szThemeName,szStyle,szFlag);
			}
			catch (e){
			}
		}
	};
	/**
	 * change the style of a theme
	 * looks for the requested theme
	 * if a theme source given, controls if it has already been loaded, if not tries to load the source first
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @param szSourceName the name of the theme source
	 * @return void
	 */
	ixmaps.changeObjectScaling = function(nDelta){
		try {
			ixmaps.embeddedSVG.window.map.Api.changeObjectScaling(nDelta);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.changeObjectScaling(nDelta);
			}
			catch (e){
			}
		}
	};
	/**
	 * get the style of a theme
	 * looks for the requested theme
	 * and returns the theme definition string; if theme not given, returns the actual theme
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getThemeStyleString = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeStyleString(szThemeName);
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getMapThemeStyleString(szThemeName);
			}
			catch (e){
			}
		}
	};
	/**
	 * get the definition string of a theme
	 * looks for the requested theme
	 * and returns the theme definition string; if theme not given, returns the actual theme
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getThemeDefinitionString = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeDefinitionStrings(szThemeName);
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getMapThemeDefinitionStrings(szThemeName);
			}
			catch (e){
			}
		}
	};
	/**
	 * get the definition string of a theme
	 * looks for the requested theme
	 * and returns the theme definition string; if theme not given, returns the actual theme
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getThemeDefinitionObj = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeDefinitionObj(szThemeName);
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getMapThemeDefinitionObj(szThemeName);
			}
			catch (e){
			}
		}
	};
	/**
	 * get the style of a theme
	 * looks for the requested theme
	 * and returns the theme definition string; if theme not given, returns the actual theme
	 * if the theme is found, it is executed and added to th current map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getThemeObj = function(szThemeName){
		try {
			return ixmaps.embeddedSVG.window.map.Api.getTheme(szThemeName);
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getTheme(szThemeName);
			}
			catch (e){
			}
		}
	};
	/**
	 * make new theme
	 * @param szThemeName the name of the theme to add
	 * @param opt the theme options
	 * @param fClear if true, clear all themes before
	 * @return void
	 */
	ixmaps.newTheme = function(szThemeName,opt,fClear){ 

		if ( !opt ){
			alert("no theme defined");
			return;
		}
		// clone opt to not destroy the original
		// method found on stackoverflow.org
		ixmaps.opt = JSON.parse(JSON.stringify(opt));

		// to clear, call clearAll() and give time by setTimeout 
		if ( fClear ){
			if ( fClear == "force" ){
				opt.style.type += "|FORCE";
			}
			if ( fClear == "clearcharts" ){
				this.clearAllCharts();
			}else{
				//this.clearAll();
				try {
					ixmaps.embeddedSVG.window.map.Api.clearAll();
				}
				catch (e){
					try {
						ixmaps.embeddedApi.embeddedSVG.window.map.Api.clearAll();
					}
					catch (e){
					}
				}
			}
		}

		// set theme title to theme name if not defined in theme object
		if ( !opt.style.title && szThemeName ){
			opt.style.title = szThemeName;
		}

		try {
			ixmaps.embeddedSVG.window.map.Api.newMapThemeByObj(opt);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.newMapThemeByObj(opt);
			}
			catch (e){
			}
		}
		return;

		if ( typeof(opt.field) != 'string' ){
			s = "";
			for ( x=0; x<opt.field.length; x++ ){
				s += opt.field[x] + "|";
			}
			opt.field = s;
		}
		if ( typeof(opt.style) != 'string' ){
			var szStyle = "";
			var s = null;
			for ( a in opt.style ){
				// separated by '|' because of possible RGB(r,g,b) color definition  
				if ( $.isArray(opt.style[a]) ){
					s = "";
					for ( x=0; x<opt.style[a].length; x++ ){
						s += (x?"|":"") + opt.style[a][x];
					}
				}else{
					s = String(opt.style[a]);	
				}
				szStyle += a +':'+ s + ";";
			}
			opt.style = szStyle;
		}

		try {
			ixmaps.embeddedSVG.window.map.Api.newMapTheme(opt.layer,opt.field,opt.field100,opt.style,szThemeName,opt.axis);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.newMapTheme(opt.layer,opt.field,opt.field100,opt.style,szThemeName,opt.axis);
			}
			catch (e){
			}
		}
	};
	/**
	 * remove theme
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.removeTheme = function(szThemeId){

		try {
			ixmaps.embeddedSVG.window.map.Api.removeTheme(szThemeId);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.removeTheme(szThemeId);
			}
			catch (e){
			}
		}
	};
	/**
	 * get the actual bookmark
	 * looks for the requested theme
	 * and returns the bookmark string; it is an executable javascript to zoom and pan the map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getBookmarkString_old = function(){

			var arrayPtLatLon = ixmaps.embeddedSVG.window.map.Api.getBoundsOfMapInGeoBounds();
			arrayPtLatLon[0].x = Math.max(Math.min(arrayPtLatLon[0].x,180),-180);
			arrayPtLatLon[0].y = Math.max(Math.min(arrayPtLatLon[0].y,80),-80);
			arrayPtLatLon[1].x = Math.max(Math.min(arrayPtLatLon[1].x,180),-180);
			arrayPtLatLon[1].y = Math.max(Math.min(arrayPtLatLon[1].y,80),-80);

			var szEnvelope = "\t"   + String(arrayPtLatLon[0].y) + "," +
							 "\n\t" + String(arrayPtLatLon[0].x) + "," +
							 "\n\t" + String(arrayPtLatLon[1].y) + "," +
							 "\n\t" + String(arrayPtLatLon[1].x);

			// make executable SVG map API call
			return "map.Api.doZoomMapToGeoBounds("+szEnvelope+");\n";
	};

	/**
	 * get the actual bookmark
	 * looks for the requested theme
	 * and returns the bookmark string; it is an executable javascript to zoom and pan the map
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getBookmarkString = function(){

			var nZoom  = htmlMap_getZoom();
			var center = htmlMap_getCenter();

			var szCenter = "["   + String(center.lat) + "," +
							     + String(center.lng) + "]"; 

			// make executable API call
			return "ixmaps.setView("+szCenter+","+nZoom+");\n";
	};

	/**
	 * mark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.markThemeClass = function(szThemeId,nIndex){

		try {
			ixmaps.embeddedSVG.window.map.Api.markThemeClass(szThemeId,nIndex);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.markThemeClass(szThemeId,nIndex);
			}
			catch (e){
			}
		}
	};
	/**
	 * unmark theme class
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.unmarkThemeClass = function(szThemeId,nIndex){

		try {
			ixmaps.embeddedSVG.window.map.Api.unmarkThemeClass(szThemeId,nIndex);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.unmarkThemeClass(szThemeId,nIndex);
			}
			catch (e){
			}
		}
	};
	/**
	 * filter theme items by reloading theme
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 */
	ixmaps.filterThemeItemsReload = function(szThemeId,szFilter,mode){
		if ( ixmaps.tFilterThemeItemsReload ){
			clearTimeout(ixmaps.tFilterThemeItemsReload);
		}
		ixmaps.tFilterThemeItemsReload = setTimeout("ixmaps.filterThemeItemsReloadExecute('"+szThemeId+"','"+szFilter+"','"+mode+"')",1000);
	};
	/**
	 * filter theme items by reloading theme
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 */
	ixmaps.filterThemeItemsReloadExecute = function(szThemeId,szFilter,mode){
//		ixmaps.changeThemeStyle(szThemeId,'type:FILTER','add');	
		ixmaps.changeThemeStyle(szThemeId,'filter:'+ szFilter);	
	};
	/**
	 * filter theme items 
	 * @param szThemeId the id of the theme received on create
	 * @param szFilter the filter string
	 * @param mode an additional flag
	 * @return void
	 */
	ixmaps.filterThemeItems = function(szThemeId,szFilter,mode){

		// GR 30.06.2015 different filter for AGGREGATE themes
		var themeObj = ixmaps.getThemeObj(szThemeId);
		if ( themeObj && ( themeObj.szFlag.match(/AGGREGATE/) || themeObj.szFlag.match(/MULTI/)) ){
			ixmaps.filterThemeItemsReload(szThemeId,(szFilter||" "),mode);
			return;
		}
		
		try {
			ixmaps.embeddedSVG.window.map.Api.filterThemeItems(szThemeId,szFilter,mode);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.filterThemeItems(szThemeId,szFilter,mode);
			}
			catch (e){
			}
		}
	};
	/**
	 * select filtered theme items
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.selectFilterItems = function(szThemeId){

		try {
			ixmaps.embeddedSVG.window.map.Api.selectFilterItems(szThemeId);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.selectFilterItems(szThemeId);
			}
			catch (e){
			}
		}
	};
	/**
	 * get map theme item data row
	 * @param szThemeId the id of the theme received on create
	 * @return void
	 */
	ixmaps.getMapThemeDataRow = function(szThemeId,szItem){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getMapThemeDataRow(szThemeId,szItem);
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getMapThemeDataRow(szThemeId,szItem);
			}
			catch (e){
			}
		}
	};

	/**
	 * show error message
	 * @param szText the error message
	 * @return void
	 */
	ixmaps.error = function(szText){
		try	{
			MessageBox.show(MESSAGE_TYPE.Error, "iXmaps", szText.replace(/\n+/g,'<br>'), null, null);
		}
		catch (e){
			alert(szText);
		}
	};
	/**
	 * show confirm dialog
	 * @param szText a message
	 * @param callOk the function to call on ok
	 * @param callCancel the function to call on cancel
	 * @return void
	 */
	ixmaps.confirm = function(szText,callOk,callCancel){
		try	{
			MessageBox.show(MESSAGE_TYPE.Confirmation, "iXmaps", szText.replace(/\n+/g,'<br>'), callOk, callCancel);
		}
		catch (e){
			if ( confirm("szText") ){
				callOk();
			}
		}
	};

	/**
	 * show loading
	 * @return void
	 */
	ixmaps.showLoading = function(szMessage,flag){
		ixmaps.embeddedApi.showLoading(szMessage,flag);
	};

	/**
	 * hide loading
	 * @return void
	 */
	ixmaps.hideLoading = function(){
		ixmaps.embeddedApi.hideLoading();
	};

	/**
	 * show UI
	 * @return void
	 */
	ixmaps.showUi = function(){
		try	{
			ixmaps.embeddedApi.showUi();
		} catch (e){}
	};

	/**
	 * hide UI
	 * @return void
	 */
	ixmaps.hideUi = function(){
		try	{
			ixmaps.embeddedApi.hideUi();
		} catch (e){}
	};

	/**
	 * get the map object
	 * and returns an object
	 * @param szThemeName the name of the theme to add
	 * @return void
	 */
	ixmaps.getMap = function(){
		return ixmaps.embeddedSVG.window.map;
	};

	/**
	 * get layer list
	 * @return array array of layer objects
	 */
	ixmaps.getLayer = function(){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayer();
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getLayer();
			}
			catch (e){
			}
		}
	};
	/**
	 * get layer dependency list
	 * @return array array of layer dependency objects
	 */
	ixmaps.getLayerDependency = function(){

		try {
			return ixmaps.embeddedSVG.window.map.Api.getLayerDependency();
		}
		catch (e){
			try {
				return ixmaps.embeddedApi.embeddedSVG.window.map.Api.getLayerDependency();
			}
			catch (e){
			}
		}
	};
	/**
	 * switch layer
	 * @param szLayerName the name of the layer to switch visible/invisible
	 * @param opt the theme options
	 * @param fClear if true, clear all themes before
	 * @return void
	 */
	ixmaps.switchLayer = function(szLayerName,fState){

		try {
			ixmaps.embeddedSVG.window.map.Api.switchLayer(szLayerName,fState);
		}
		catch (e){
			try {
				ixmaps.embeddedApi.embeddedSVG.window.map.Api.switchLayer(szLayerName,fState);
			}
			catch (e){
			}
		}

		if ( !szLayerName.match(/:label/) ){
			ixmaps.switchLayer(szLayerName+":label",fState);
		}
	};

	/**
	 * evoke the chart style menu
	 * @return void
	 */
	ixmaps.popupThemeMenu = function(){
		ixmaps.embeddedSVG.window.map.Api.setMapTool("info");
		ixmaps.embeddedSVG.window.map.Api.popupThemeStyleMenu();
	};
	/**
	 * evoke the data table viewer
	 * @return void
	 */
	ixmaps.popupThemeTable = function(){
		ixmaps.embeddedApi.embeddedApi.viewTable('dialog','10,103');
	};

	ixmaps.makeChartMenueHTML = function(szId){
		ixmaps.embeddedApi.embeddedApi.makeChartMenueHTML(szId);
	};

}( window.ixmaps = window.ixmaps || {}, jQuery ));

// .............................................................................
// EOF
// .............................................................................


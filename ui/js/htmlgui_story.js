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

(function (ixmaps, $, undefined) {

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
	ixmaps.resetStory = function () {
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
	ixmaps.loadStory = function (szUrl, szFlag, target) {

		if ((szUrl == null) || typeof (szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0)) {
			return;
		}
		if (target == null) {
			target = $('#story-board');
		}

		// set story board height (important for scrolling) 
		// ------------------------------------------------
		target.css("height", String(target.parent().height() - target.offset().top + 25) + "px");
		// something gone wrong, so set to 100%
		if (target.css("height") == "0px") {
			target.css("height", "100%");
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
		if (szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//)) {
			szStoryRoot = "";
			urlA = szUrl.split("/");
			for (var i = 0; i < urlA.length - 1; i++) {
				szStoryRoot += urlA[i] + "/";
			}
			szUrl = urlA[urlA.length - 1];
		}

		// we have a master story loaded; all child stories refer to this root
		// -------------------------------------------------------------------
		if (this.storyUrl && !this.masterStoryRoot) {
			// make absolute master story URL
			var urlA = String($(location).attr('origin') + $(location).attr('pathname')).split("/");
			urlA.pop();
			var szMasterStory = urlA.join('/') + '/' + this.storyUrl;

			// get absolute master story root
			urlA = szMasterStory.split("/");
			urlA.pop();
			this.masterStoryRoot = urlA.join('/') + '/';
		}

		// make absolute story root, if we have a master story loaded
		// ----------------------------------------------------------
		szStoryRoot = (this.masterStoryRoot || "") + szStoryRoot;

		// if not story root yet, preset with SVG map root
		// ----------------------------------------------------------------------------
		if (!szStoryRoot || (szStoryRoot.length == 0)) {
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
		var szStoryFilename = urlA[urlA.length - 1];
		ixmaps.storyRoot = szStoryRoot;
		ixmaps.storyUrl = szStoryRoot + szUrl;
		if (szUrl && typeof (szUrl) == "string" && szUrl.length) {

			$("#story-css").attr("href", szStoryRoot + szUrl.split('.')[0] + ".css");
			$("#story-css-font").attr("href", szStoryRoot + szUrl.split('.')[0] + "_fonts.css");

			target.attr("visibility", "invisible");

			// store root for further use inside callbacks
			szStoryRootA[szUrl] = szStoryRoot;

			target.load(szStoryRoot + szUrl + ' #story', function (response, status, xhr) {
				if (status == "error") {
					var msg = "Sorry but there was an error: ";
					$("#story").html(msg + xhr.status + "<br><br> '" + szStoryRoot + szUrl + "'<br><br> " + xhr.statusText);
				} else {
					try {
						ixmaps.htmlgui_onStoryLoaded(szUrl, target);
					} catch (e) {}
					$.ajax({
						type: "GET",
						url: szStoryRootA[szUrl] + szUrl.split('.')[0] + ".xml",
						dataType: "xml",
						success: function (xml) {
							ixmaps.objThemesA[String(szStoryFilename.split('.')[0])] = xml;
							if (!szFlag || !szFlag.match(/silent/)) {
								$.getScript(szStoryRootA[szUrl] + szUrl.split('.')[0] + ".js");
							}
						},
						error: function (xml) {
							if (!szFlag || !szFlag.match(/silent/)) {
								$.getScript(szStoryRootA[szUrl] + szUrl.split('.')[0] + ".js");
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
	ixmaps.setStoryUrl = function (szUrl) {

		if ((szUrl == null) || typeof (szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0)) {
			return;
		}

		szUrl = encodeURI(unescape(szUrl));

		// absolute or relative URL 
		// ------------------------
		if (szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//)) {
			szStoryRoot = "";
			urlA = szUrl.split("/");
			for (var i = 0; i < urlA.length - 1; i++) {
				szStoryRoot += urlA[i] + "/";
			}
			szUrl = urlA[urlA.length - 1];
		}

		// relative URL, combine with old story root or if not given, with SVG map root
		// ----------------------------------------------------------------------------
		if (!szStoryRoot || (szStoryRoot.length == 0)) {
			szStoryRoot = this.szUrlSVGRoot;
		}

		// final URL
		// ---------
		// magick, get rid of ./

		urlA = szUrl.split("./");

		ixmaps.storyRoot = szStoryRoot;
		ixmaps.storyUrl = szStoryRoot + szUrl;
	};

	/**
	 * loads a story given by szUrl into a HTML <div> with the id "story-board"
	 * (be shure to provide this div in your HTML)
	 * if szUrl is relative it will be applied to the last stories url root
	 * if it is the first story, the url root will be taken from the SVG maps url
	 * @param szUrl the url of the story (may be relative)
	 * @return void
	 */
	ixmaps.loadStoryTool = function (szUrl, opt) {

		if ((szUrl == null) || typeof (szUrl) == 'undefined' || (szUrl == 'null') || (szUrl.length == 0)) {
			return;
		}
		$('#story-board').hide();
		
		ixmaps.oldFSidebar = ixmaps.fSidebar;
		
		if (!ixmaps.fSidebar) {
			ixmaps.toggleSidebar();
		}

		var target = $('#story-tool');
		
		//target.html("<p>loading ...</p>");

		// set story board height (important for scrolling) 
		// ------------------------------------------------
		//target.css("height", String(target.parent().height() - target.offset().top + 25) + "px");
		// something gone wrong, so set to 100%
		//if (target.css("height") == "0px") {
		//	target.css("height", "100%");
		//}
		if (opt && opt.background) {
			target.css("background", opt.background);
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
		if (szUrl.match(/HTTP:\/\//) || szUrl.match(/http:\/\//) || szUrl.match(/\/\//) || szUrl.match(/\//)) {
			szStoryRoot = "";
			urlA = szUrl.split("/");
			for (var i = 0; i < urlA.length - 1; i++) {
				szStoryRoot += urlA[i] + "/";
			}
			szUrl = urlA[urlA.length - 1];
		}

		// we have a master story loaded; all child stories refer to this root
		// -------------------------------------------------------------------
		if (this.storyUrl && !this.masterStoryRoot) {
			if (this.storyUrl.substr(0,4) == "http"){
				var urlA = this.storyUrl.split("/");
				urlA.pop();
				this.masterStoryRoot = urlA.join('/') + '/';
			} else {
				// make absolute master story URL
				var urlA = String($(location).attr('origin') + $(location).attr('pathname')).split("/");
				urlA.pop();
				var szMasterStory = urlA.join('/') + '/' + this.storyUrl;

				// get absolute master story root
				urlA = szMasterStory.split("/");
				urlA.pop();
				this.masterStoryRoot = urlA.join('/') + '/';
			}
		}

		// make absolute story root, if we have a master story loaded
		// ----------------------------------------------------------
		if ( !szStoryRoot.match(/http/) ){
			szStoryRoot = (this.masterStoryRoot || "") + szStoryRoot;
		}

		// if not story root yet, preset with SVG map root
		// ----------------------------------------------------------------------------
		if (!szStoryRoot || (szStoryRoot.length == 0)) {
			szStoryRoot = this.szUrlSVGRoot;
		}

		// final URL
		// ---------
		// magick, get rid of ./

		urlA = szUrl.split("./");

		var szStoryFilename = urlA[urlA.length - 1];

		if (szUrl && typeof (szUrl) == "string" && szUrl.length) {

			var backButtonStyle = {
				"position": "absolute",
				"left": "1em",
				"top": "0.5em",
				"background": "#aaaaaa",
				"border-radius": "5px",
				"width": "80%",
				"margin-right": "5em",
				"padding": "0.5em",
				"text-align": "center",
				"color": "white",
				"text-decoration": "none",
				"pointer-events": "all"
			};

			$("#story-css").attr("href", szStoryRoot + szUrl.split('.')[0] + ".css");
			$("#story-css-font").attr("href", szStoryRoot + szUrl.split('.')[0] + "_fonts.css");

			target.attr("visibility", "visible");

			// store root for further use inside callbacks
			szStoryRootA[szUrl] = szStoryRoot;

			if (opt && opt.frame) {
				// GR 14.09.2017 load story on map ready
				// -------------------------------------
				var width = ixmaps.sidebarWidth;
				var height = parseInt($("#sidebar").css("height"));
				target.html("<iframe id='embed-tool' src=\"" + szStoryRoot + szUrl + "\" " +
					" style='border:0;margin:0px;width:" + width + "px;height:" + height + "px;pointer-events:all' /><a href='javascript:ixmaps.hideStoryTool()' class='hide-story-tool-button' ><span style='font-size:24px;color:#aaaaaa;vertical-align:10px'><i class='fa fa-times fa-fw' ></i></span></a>");
			} else {
				target.css("pointer-events", "all");
				// make content div for height
				target.html("<div id='story-tool-content'></div>");
				$('#story-tool-content').load(szStoryRoot + szUrl, function (response, status, xhr) {
					if (status == "error") {
						var msg = "Sorry but there was an error: ";
						$("#story").append(msg + xhr.status + "<br><br> '" + szStoryRoot + szUrl + "'<br><br> " + xhr.statusText);
					} else {
						target.append('<a href="javascript:ixmaps.hideStoryTool()" class="hide-story-tool-button" ><span style="font-size:24px;color:#aaaaaa;vertical-align:10px"><i class="fa fa-times fa-fw" ></i></span></a>');
					}
				});
			}
			if (!ixmaps.fStoryTool) {
				$('#story-board').fadeOut("fast", function () {
					$('#story-tool').fadeIn("slow");
				});

			}
			ixmaps.fStoryTool = true;
		}
	};

	/**
	 * set background of the story pane
	 * @param szColor the background color
	 * @return void
	 */
	ixmaps.setStoryBg = function (szColor) {
		$('#story-board').css("background", szColor);
		$('#story-tool').css("background", szColor);

	}

	/**
	 * hide story tool and go back to main story content
	 * @return void
	 */
	ixmaps.hideStoryTool = function () {

		if (ixmaps.fStoryTool) {

			$('#story-tool').fadeOut("fast", function () {
				if (!ixmaps.oldFSidebar) {
					ixmaps.fSidebar = true;
					ixmaps.toggleSidebar();
					setTimeout("$('#story-board').show()", 500);
				} else {
					$('#story-board').fadeIn();
				}
				$('#story-tool').html("");
			});
			ixmaps.embeddedSVG.window.map.Api.clearHighlight();
			ixmaps.embeddedSVG.window.map.Api.clearAllOverlays();
			ixmaps.embeddedSVG.window.map.Api.setMapTool("pan");
		}
		
		try {
			ixmaps.htmlgui_onHideStoryTool();
		} catch (e) {}

		ixmaps.fStoryTool = false;
	}
	
	// ----------------------------------------------------------------------
	// adapt iframe height from embed rendered height
	// will be called from story tool script
	// ----------------------------------------------------------------------
	
	ixmaps.resizeStoryToolFrame = function() {
		// give time to render
		setTimeout('ixmaps.doresizeStoryToolFrame()',1);
	}
	ixmaps.doresizeStoryToolFrame = function() {
		if(window.document.getElementById('embed-tool')){
			var the_height = window.document.getElementById('embed-tool').contentWindow.document.body.scrollHeight;
		}else{
			var the_height = Math.min($('#story-tool-content').height(),window.innerHeight);
		}

		the_height += 40;
		if ( the_height > 100 ){
			window.document.getElementById('story-tool').style.height= the_height+"px";
			window.document.getElementById('story-tool').style.overflow= "auto";
			// set border radius !!
			window.document.getElementById('story-tool').style["border-radius"] = "0.5em";
			window.document.getElementById('story-tool').style["border"] = "solid #ddd 0px";
		}
	};
		
	// -----------------------------------
	// deprecated functions
	// remain for compatibility reasons
	// -----------------------------------

	/**
	 * get the theme definition string for a theme
	 * (looks for any loaded theme)
	 * @param szThemeName the name of the theme
	 * @type string
	 * @return an executable theme definition string (javascript function call)
	 */
	ixmaps.getTheme = function (szThemeName, szSourceName) {
		
		ixmaps.objThemesA = ixmaps.objThemesA || ixmaps.embeddedApi.objThemesA;
		if (!ixmaps.objThemesA.length){
			ixmaps.objThemesA = ixmaps.embeddedApi.objThemesA;
		}

		var szTheme = null;
		for (a in ixmaps.objThemesA) {
			if (!szSourceName || (szSourceName == a)) {
				$(ixmaps.objThemesA[a]).find('LEGENDITEM').each(function () {
					if ($(this).attr('name') == szThemeName) {
						szTheme = $(this).attr('onactivate').replace(/\n/gi, "");
					}
				}); //close each(
			}
		}
		if (szTheme == null) {
			alert("error on getTheme(): '" + szThemeName + "' not found!");
		}
		return szTheme;
	};
	/**
	 * show error message
	 * @param szText the error message
	 * @return void
	 */
	ixmaps.error = function (szText) {
		try {
			MessageBox.show(MESSAGE_TYPE.Error, "iXmaps", szText.replace(/\n+/g, '<br>'), null, null);
		} catch (e) {
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
	ixmaps.confirm = function (szText, callOk, callCancel) {
		try {
			MessageBox.show(MESSAGE_TYPE.Confirmation, "iXmaps", szText.replace(/\n+/g, '<br>'), callOk, callCancel);
		} catch (e) {
			if (confirm("szText")) {
				callOk();
			}
		}
	};

}(window.ixmaps = window.ixmaps || {}, jQuery));

// .............................................................................
// EOF
// .............................................................................

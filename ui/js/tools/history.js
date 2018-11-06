(function( ixmaps, $, undefined ) {
	/* ---------------------------------------------------------------- */
	/* D a t a   C a c h e 												*/
	/* ---------------------------------------------------------------- */

	// init HTML5 localStorage 
	// ---------------------------------------------------
	// test if localStorage is upported by browser
	// redefine the setItem and getItem procedures for Javascript objects
	//
	if ( typeof(localStorage) == 'undefined' ) {

		alert('Your browser does not support HTML5 localStorage. Try upgrading.');

	} else {

		// check local storage
		// ---------------------------------------------------------------
		//

		var keys = "";
		var bytes = 0;
		for (var i=0; i<localStorage.length; i++) {
			keys += localStorage.key(i) + ",";
			bytes += localStorage.getItem(localStorage.key(i)).length;
		}
		// keep the local storage below 2 MB
		// ---------------------------------
		if ( bytes > 2000000 ){
			// alert("local Storage exeeds: "+(bytes/1000).toFixed(0)+" Kb !\nWe will try to free some indicator values.");
			bytes = 0;
			for (var i=0; i<localStorage.length; i++) {
				var key = localStorage.key(i);
				if ( key.match(/topic/) || key.match(/WorldBank/) ){
					continue;
				}
				bytes += localStorage.getItem(key).length;
				localStorage.removeItem(key);
				if ( bytes > 500000 ){
					break;
				}
			}
		}

		// redefine storage setter and getter to handle Javascript Objects
		// ---------------------------------------------------------------
		//

		Storage.prototype._setItem = Storage.prototype.setItem;
		Storage.prototype.setItem = function(key, value) {
			this._setItem(key, JSON.stringify(value));
		};

		Storage.prototype._getItem = Storage.prototype.getItem;
		Storage.prototype.getItem = function(key) {  
			try {
				return JSON.parse(this._getItem(key));
			} catch(e) {
				return this._getItem(key);
			}
		};
	}

	// cache world bank queries
	// ---------------------------------------------------
	// 
	// a) local in object worldBankData
	// b) in localStorage of HTML5 (if present and allowed)
	//
	var fAllowLOcalStorage = true;
	ixmaps.getStoredObject = function(szKey){
		var item = null;
		if ((typeof(localStorage) != 'undefined') && fAllowLOcalStorage ) {
			try {
				item = localStorage.getItem(szKey);
			}catch(e){}
		}
		return item;
	};

	ixmaps.storeObject = function(szKey,object){

		if ((typeof(localStorage) != 'undefined') && fAllowLOcalStorage ) {
			try {
				localStorage.setItem(szKey,object);
				return;
			}catch(e){}
		}
	};

	// end of data cache handling -----------------

	/* ---------------------------------------------------------------- */
	/* H I S T O R Y													*/
	/* ---------------------------------------------------------------- */

	/**
	 * This is the themeHistory class.  
	 * It realizes an object to store and retrieve theme definitions 
	 * @constructor
	 * @throws 
	 * @return A new themeQuery object
	 */
	function themeHistory(szName,szObj) {
		this.szName = szName;
		this.itemA = new Array();
		this.szObj = szObj;
		this.szDiv = null;
	}
	themeHistory.prototype.add = function(name,theme,bounds,center,zoom){
		// avoid doublettes
		for ( i=0; i<this.itemA.length; i++ ){
			if ( (JSON.stringify(this.itemA[i].theme) == JSON.stringify(theme))   &&
				 (JSON.stringify(this.itemA[i].bounds) == JSON.stringify(bounds)) &&
				 (this.itemA[i].name == name) ){
				return;
			}
		}
		var d = new Date();
		var themeObj = {"time":d.getTime(),"theme":theme};
		if (name){
			themeObj.name = name;
		}
		if (bounds){
			themeObj.bounds = bounds;
		}
		if (center){
			themeObj.center = center;
		}
		if (zoom){
			themeObj.zoom = zoom;
		}
		this.itemA.splice(0,0,themeObj);	
		this.save();
	};
	themeHistory.prototype.copyto = function(historyIndex,target){
		var xx = this.itemA[historyIndex].theme;
		var yy = this.itemA[historyIndex].bounds || null;
		target.add(xx,yy);
	};
	themeHistory.prototype.get = function(historyIndex){
		ixmaps.newTheme(this.itemA[historyIndex].theme.style.title,this.itemA[historyIndex].theme,"force");
		ixmaps.setBounds(String(this.itemA[historyIndex].bounds).split(","));
		// close dialog
		window.$("#bookmarks").dialog("close");
	};
	themeHistory.prototype.getLast = function(){
		return this.itemA[0];
	};
	themeHistory.prototype.remove = function(historyIndex,callback){
		this.itemA.splice(historyIndex,1);
		this.save();
		callback();
	};
	themeHistory.prototype.addActualTheme = function(name,callback){
		var themeDefObj = ixmaps.getThemeDefinitionObj();
		var szEnvelope = ixmaps.getEnvelopeString(1);
		var szCenter = ixmaps.htmlgui_getCenter();
		var szZoom = ixmaps.htmlgui_getZoom();
		this.add(name,themeDefObj,szEnvelope,szCenter,szZoom);
		callback();
	};
	themeHistory.prototype.getItemList = function(){

		var szItemList = "<table style='style='line-height:0.9em;padding:5px 0px 0px 5px;'>";

		for ( var i=0; i<this.itemA.length; i++ ){
			if ( this.itemA[i] ){

				var theme = this.itemA[i].theme;
				if ( !theme ){
					continue;
				}
				var d = new Date(this.itemA[i].time);
				var date  = d.toLocaleDateString();
				var hour  = d.toTimeString().split(" ")[0];

				// create description of theme
				//
				var szDescription = "";

				// - title 
				szDescription += "<tr valign='top'><td>";
				if ( hour ){
						szDescription += "<span style='color:#444;font-weight:normal;'>" + date +"&nbsp;&nbsp;"+ hour + "</span>&nbsp;&nbsp;&nbsp;";
				}

				szDescription += "</td><td width='520' style='max-width:520px;overflow:hidden;text-overflow:ellipsis;white-space: nowrap;' >";

				if ( theme.style.title ){
					szDescription += theme.style.title + " ";
				}else
				if ( theme.layer ){
						szDescription += theme.layer + " ";
				}
				if ( theme.style.colorscheme ){
					szDescription += "<span style=\"font-size:12px;margin-left:0.25em;\">";
					var nColors = Number(theme.style.colorscheme[0]);
					if ( nColors ){
						szDescription += ixmaps.getColorSwatches(theme.style.colorscheme.slice(1).join('|'));
					}else{
						szDescription += ixmaps.getColorSwatches(theme.style.colorscheme.join('|'),"directly_defined_colors");
					}
					szDescription += "</span>";
				}
				/**
				if ( theme.field ){
						szDescription += theme.field + " ";
				}
				**/
				//szDescription += "</span>";
				//szDescription += "</br>";

				// - style 
				szDescription += "<span style=\"font-size:12px;color:#aaa;\">";
				szDescription += theme.style.type;
				szDescription += "</span>";

				// create list item
				//
				var szHistory = this.szObj;
				szItemList += "<a title=\""+i+"\" href=\"javascript:"+szHistory+".get("+i+");\">"+szDescription+"</a>";

				szItemList += "</td><td>";

				// action buttons 
				szItemList += "<a class=\"actionLink\" style=\"color:#1c94c4\" title=\"add this to bookmark\"   href=\"javascript:"+szHistory+".get("+i+");\">&nbsp;set&nbsp;</a>";			
				szItemList += "<span class=\"separator\">&bull;</span>";
				if ( szHistory.match(/history/) ){
					szItemList += "<a class=\"actionLink\" style=\"color:#1c94c4\" title=\"add this to bookmark\"  href=\"javascript:"+szHistory+".copyto("+i+",ixmaps.bookmark);\">&nbsp;bookmark&nbsp;</a>";			
					szItemList += "<span class=\"separator\">&bull;</span>";
				}
				szItemList += "<a class=\"actionLink\" style=\"color:#a00\" title=\"remove entry\" style=\"text-decoration:none;\" href=\"javascript:"+szHistory+".remove("+i+");\">"+"&nbsp;delete&nbsp;"+"</a><br>";
				szItemList += "</td>";

				szItemList += "</tr>";
			}
		}
		szItemList += "</table>";
		return szItemList;
	};
	themeHistory.prototype.makeItemList = function(output){
		this.output = output?output:this.output;
		if ( this.output && this.output.innerHTML ){
			this.output.innerHTML = this.getItemList();
		}
	};
	themeHistory.prototype.getList = function(){
		return this.itemA;
	};

	themeHistory.prototype.save = function(){
		if ( typeof(localStorage) != 'undefined' ) {
			localStorage.setItem(this.szName,this.itemA);
		}
	};
	themeHistory.prototype.load = function(){
		if ( typeof(localStorage) != 'undefined' ) {
			this.itemA = localStorage.getItem(this.szName);
			if ( this.itemA == null ){
				this.itemA = new Array();
			}
		}
	};
	themeHistory.prototype.loadFile = function(szFilename){
		 ixmaps.tempTarget = this;
		 $.ajax({ 
				url: szFilename, 
				dataType: 'json', 
			    success: function(data) { ixmaps.tempTarget.itemA = data; }, 
			    error: function(data) { alert("error on loading bookmark file "+szFilename+" !"); } 
		 });
	};
	themeHistory.prototype.clear = function(){
		this.itemA = new Array();
	};
		

	/* ---------------------------------------------------------------- */
	/* I n i t i a l i z e              								*/
	/* ---------------------------------------------------------------- */

	ixmaps.history	= new themeHistory("iXmapsHistory","ixmaps.history");
	ixmaps.bookmark	= new themeHistory(ixmaps.szAppId?(ixmaps.szAppId+"Bookmarks"):("iXmapsBookmark"),"ixmaps.bookmark");

	ixmaps.history.load();
	ixmaps.history.clear();
	ixmaps.bookmark.load();

	/* 
	 * GR 04.05.2016 use an app id to make app specific bookmarks 
	*/
	ixmaps.setAppId = function(szAppId){
		ixmaps.bookmark	= new themeHistory(szAppId,"ixmaps.bookmark");
		ixmaps.bookmark.load();
	};

}( window.ixmaps = window.ixmaps || {}, jQuery ));

// .............................................................................
// EOF
// .............................................................................


/**********************************************************************
data.js

$Comment: provides JavaScript for loading, parsing, selection, transforming and caching data tables
$Source :data.js,v $

$InitialAuthor: guenter richter $
$InitialDate: 2016/26/09 $
$Author: guenter richter $
$Id:data.js 1 2016-26-09 10:30:35Z Guenter Richter $

Copyright (c) Guenter Richter
$Log:data.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides the data object to load, parse and cache data tables 
 * @author Guenter Richter guenter.richter@gmx.de
 * @version 0.1
 */

(function (window, document, undefined) {

	// write to console with time in sec : millisec
	//
	var _log_start_time = new Date();
	_LOG = function(szLog) {
		var x = new Date();
		//var time = String(x.getSeconds()+(x.getMilliseconds()/1000));
		var time = ((new Date()) - _log_start_time)/1000;
		console.log("_LOG: time[sec.ms] "+time+" "+szLog);
	};


	var Data = {
		version: "1.0"
	};

	function expose() {
		var oldData = window.Data;

		Data.noConflict = function () {
			window.Data = oldData;
			return this;
		};

		window.Data = Data;
	}

	// define Data for Node module pattern loaders, including Browserify
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = Data;

	// define Data as an AMD module
	} else if (typeof define === 'function' && define.amd) {
		define(Data);
	}

	// define Data as a global variable, saving the original Data to restore later if needed
	if (typeof window !== 'undefined') {
		expose();
	}

	/**
	 * Create a new Data.Import instance.  
	 * @class It realizes an object to load and handle internal data sources (CSV,JSON,...)
	 * @constructor
	 * @throws 
	 * @return A new Data.Import object
	 */

	Data.Object = function (id,options) {
		this.id = id;
		this.options = options;
		this.debug = false;
		};

	Data.Object.prototype = {

		/**
		 * @method success
		 * set data from the specified source and call user function
		 * @param callback a function to call on success
		 * @type Data.Import
		 * @return itself 
		 */
		import: function (callback) {

			this.options.success = callback;

			// we create a dummy Data.feed to use its parser
			var feed = Data.feed("dummy",{});

			// pass options to the Data.feed
			feed.options = this.options;

			// import json and create table, calls the callback when done
			feed.__processJsonData(this.options.source,this.options);

			// supports only json objects 
			// TBD: maybe CSV arrays, text

			return this;
		}
	};


	/*** how to use
	var data = Data.feed("arbitrary name"    ,{ source:"filename.csv", type:"csv" }).load();
	var data = Data.feed("my_broker_function",{ ext:"broker.js" , type:"ext" }).load();
	**/

	/**
	 * Create a new Data.Feed instance.  
	 * @class It realizes an object to load and handle data sources (CSV,JSON,...)
	 * @constructor
	 * @throws 
	 * @return A new Data.Feed object
	 */

	Data.Feed = function (id,options) {
		this.id = id;
		this.options = options;
		this.debug = false;
		};

	Data.Feed.prototype = {

		/**
		 * @method load
		 * load data from the specified source
		 * @param callback a function to call on success
		 * @type Data.Feed
		 * @return itself 
		 */
		load: function (callback) {

			this.options.success = callback;

			var option = this.options;
			var szUrl = option.source || option.src || option.url;

			var _this = this;
			if ( option.type == "ext" ){
				$.getScript(option.ext)
					.done(function(script, textStatus) {
					  _this.__createDataTableObjectExt(null,option.type,option);
					})
					.fail(function(jqxhr, settings, exception) {
					console.log(jqxhr);
					console.log(exception);
					  alert("external data provider: '"+option.ext+"' could not be loaded !",2000);
					});
			}else{

				if ( !szUrl ){
					alert("no source defined ! "+szUrl,2000);
				}

				if ( option.type == "FT" ){
					var options = {packages: ['corechart'], callback : function() {
									this.__doFTImport(szUrl,option);
									}};
					google.load('visualization', '1', options);
				}else
				if ( option.type == "FTV1" ){
					this.__doFTImportNew(szUrl,option);
				}else
				if ( (option.type == "csv") || (option.type == "CSV") ){
					this.__doCSVImport(szUrl,option);
				}else
				if ( (option.type == "rss") || (option.type == "RSS") ){
					this.__doRSSImport(szUrl,option);
				}else
				if ( (option.type == "json") || (option.type == "JSON") || (option.type == "Json")){
					this.__doJSONImport(szUrl,option);
				}else
				if ( (option.type == "jsonDB") || (option.type == "JSONDB") || (option.type == "JsonDB") || (option.type == "jsondb") ){
					this.__doJsonDBImport(szUrl,option);
				}else
				if ( (option.type == "jsonstat") || (option.type == "JSONSTAT") ){
					$.getScript("http://json-stat.org/lib/json-stat.js")
					.done(function(script, textStatus) {
					  this.__doLoadJSONstat(szUrl,option);
					  return;
					})
					.fail(function(jqxhr, settings, exception) {
					  alert("'"+option.type+"' unknown format !");
					});
				}else{
					alert("'"+option.type+"' unknown format !");
				}
			}
			return this;
		}
	};


	// @section

	// @factory Data.feed(id: String, options?: Data options)
	// Instantiates a data object given id == name
	// and an object literal with `data options`.
	//

	Data.feed = function (id, options) {
		return new Data.Feed(id, options);
	};

	// @factory Data.feed(id: String, options?: Data options)
	// Instantiates a data object given id == name
	// and an object literal with `data options`.
	//

	Data.object = function (id, options) {
		return new Data.Object(id, options);
	};


	var ixmaps = ixmaps || {};

	// -----------------------------
	// D A T A    L O A D E R 
	// -----------------------------

	// --------------------------------------
	// F u s i o n   T a b l e s (depricated)
	// --------------------------------------
	
	/**
	 * doFTImport  
	 * reads from Google Fusion Table 
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	Data.Feed.prototype.__doFTImport = function(ftId,opt) {

       // Construct query
        var query = "SELECT * FROM " + ftId;
        var queryText = encodeURIComponent(query);
        var gvizQuery = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + queryText);

        // Send query and draw table with data in response
        gvizQuery.send(function(response) {

			var numRows = response.getDataTable().getNumberOfRows();
			var numCols = response.getDataTable().getNumberOfColumns();

			var newData = new Array();

			var newRow = new Array();
			for (var i = 0; i < numCols; i++) {
				newRow.push(response.getDataTable().getColumnLabel(i));
			}
			newData.push(newRow);

			for (var i = 0; i < numRows; i++) {
				newRow = new Array();
				for(var j = 0; j < numCols; j++) {
					newRow.push(response.getDataTable().getValue(i, j));
				}
				newData.push(newRow);
			}
			// user defined callback
			if ( opt.callback ){
				opt.callback(newData,opt);
				return;
			}
			// called by a theme 
			this.__createDataTableObject(newData,opt.type,opt);
       });
	};
	/**
	 * doFTImportNew 
	 * reads from Google Fusion Table using API V1 (requires API key !)
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	Data.Feed.prototype.__doFTImportNew = function(ftId,opt) {

		var szKey = "AIzaSyDvly_8Nx4wPF-Otful4IdGVEvjNJdPl5M";
		var szFT  = "https://www.googleapis.com/fusiontables/v1/query?";

		// Construct query
        var szUrl = szFT + "sql=SELECT * FROM " + ftId + "&key=" + szKey;

		$.getJSON(szUrl,function( data, textStatus, jqxhr ) {

			var newData = new Array();

			newData.push(data.columns);
			for (var i = 0; i < data.rows.length; i++) {
				newData.push(data.rows[i]);
			}
			// user defined callback
			if ( opt.callback ){
				opt.callback(newData,opt);
				return;
			}
			// called by a theme 
			this.__createDataTableObject(newData,opt.type,opt);
		});
	};

	// ---------------------------------
	// J S O N s t a t  
	// ---------------------------------
	/**
	 * doLoadJSONstat 
	 * reads JSONstat format using JSONstat Javascript
	 * parses the data into the map data source
	 * @param szUrl JSONstat URL
	 * @param opt options
	 * @type void
	 */
	Data.Feed.prototype.__doLoadJSONstat = function(szUrl,opt) {

		JSONstat( szUrl, 
			function(){
				var newData = new Array();
				var row = this.Dataset(0).Dimension(2).id;
				row.unshift( this.Dataset(0).Dimension(1).label );
				newData.push(row);
				for (var i=0; i<this.Dataset(0).Dimension(1).length; i++ ){
					var row = new Array();
					row.push(this.Dataset(0).Dimension(1).id[i]);
					for (var ii=0; ii<this.Dataset(0).Dimension(2).length; ii++ ){
						row.push(this.Dataset(0).Data([0,i,ii]).value);
					}
					newData.push(row);
				}
			// user defined callback
			if ( opt.callback ){
				opt.callback(newData,opt);
				return;
			}
			// called by a theme 
				this.__createDataTableObject(newData,opt.type,opt);
			}
		);
	}

	// ---------------------------------
	// J s o n D B 
	// ---------------------------------

	/**
	 * doJsonDBImport 
	 * reads JsonDB files from URL
	 * JsonDB files are regural JavaScript files, the data object is parsed automatically on load 
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	Data.Feed.prototype.__doJsonDBImport = function(szUrl,opt) {

		_LOG("__doJsonDBImport: "+szUrl);

		opt.url = szUrl;

		$.getScript(szUrl+".gz")
			.done(function(script, textStatus) {
			  this.__processJsonDBData(script,opt);
			})
			.fail(function(jqxhr, settings, exception) {
				$.getScript(szUrl)
				.done(function(script, textStatus) {
				  this.__processJsonDBData(script,opt);
				})
				.fail(function(jqxhr, settings, exception) {
				  alert("external data: '"+szUrl+"' could not be loaded !",2000);
				});
			});
	};

	Data.Feed.prototype.__processJsonDBData = function(script,opt) {

		_LOG("__processJsonDBData:");

		// cteate data object
		// ------------------
		this.dbtable = new Data.Table();

		var loadedTable = eval("opt.name");

		this.dbtable.table   = loadedTable.table;
		this.dbtable.fields  = loadedTable.fields;
		this.dbtable.records = loadedTable.records;
	};


	// ---------------------------------
	// C S V 
	// ---------------------------------

	/**
	 * __doCSVImport 
	 * reads CSV files from URL
	 * parses the data into the map data source
	 * @param szUrl csv file url
	 * @param opt optional options
	 * @type void
	 */
	Data.Feed.prototype.__doCSVImport = function(szUrl,opt) {

		_LOG("__doCSVImport: "+szUrl);
		var _this = this;

		$.ajax({
			type: "GET",
			url: szUrl,
			dataType: "text",
			success: function(data) {
			  _this.__processCSVData
				  (data,opt);
			},
			error: function() {
				alert("\"" + szUrl + "\" could not be loaded!");
			}
		 });
	};

	/**
	 * __processCSVData 
	 * parse the loaded CVS text data and create data object
	 * @param the csv text string
	 * @param opt optional options
	 * @type void
	 */
	Data.Feed.prototype.__processCSVData = function(csv,opt) {

		_LOG("__processCSVData:");

		var c1 = null;
		var c2 = null;
		var newData1 = new Array(0);
		var newData2 = new Array(0);

		// GR 02.11.2015 nuovo csv parser Papa Parse by Matt Hold 
		// GR 21.07.2016 if autodecet delimiter fails, try first ; and then ,   

		var newData = Papa.parse(csv).data;
		if ( newData[0].length != newData[1].length ){
			_LOG("csv parser: autodetect failed");
			_LOG("csv parser: delimiter = ;");
			newData = Papa.parse(csv,{delimiter:";"}).data;
			if ( newData[0].length != newData[1].length ){
				_LOG("csv parser: delimiter = ; failed");
				_LOG("csv parser: delimiter = ,");
				newData = Papa.parse(csv,{delimiter:","}).data;
				if ( newData[0].length != newData[1].length ){
					_LOG("csv parser: delimiter = , failed");
					alert("csv parsing error");
				}
			}
		}

		// if csv ends with /n, last element is " ", so we must pop it 
		//
		if ( newData[newData.length-1].length != newData[0].length ){
			newData.pop();
		}

		// if only the first line ends with delimiter, we get one more (empty!) column
		// the parser gives the first row with different length; 
		// we must correct this here, because iXMaps checks every row's length with the first ones length later 
		// 
		if ( (newData[0].length - newData[1].length) == 1 ) {
			if ( newData[0][newData[0].length-1] == " " ){
				newData[0].pop();
			}
		}
		// user defined callback
		if ( opt.callback ){
			opt.callback(newData,opt);
			return;
		}
		// called by a theme 
		if ( newData ){
			this.__createDataTableObject(newData,"csv",opt);
			return true;
		}
		return false;
	};

	// ---------------------------------
	// R S S
	// ---------------------------------

	/**
	 * __doRSSImport 
	 * reads RSS feed from URL
	 * parses the data into a table
	 * @param szUrl rss feed url
	 * @param opt optional options
	 * @type void
	 */
	Data.Feed.prototype.__doRSSImport = function(szUrl,opt) {

		_LOG("__doRSSImport: "+szUrl);
		var _this = this;

		opt.format = "xml";

		$.ajax({
			type: "GET",
			url: szUrl,
			dataType: "xml",
			success: function(data) {
			_this.__processRSSData
				(data,opt);
			},
			error: function() {
				alert("\"" + szUrl + "\" could not be loaded!");
			}
		});

	};

	/**
	 * __processRSSData 
	 * parse the loaded RSS xml data and create data object
	 * @param the rss object
	 * @param opt optional options
	 * @type void
	 */
	Data.Feed.prototype.__processRSSData = function(data,opt) {

		if ( opt.format == "xml" ) {

			var layerset = null;
			var layer = null;
			var fonte = null;

			if ( $(data).find('rss').length ){
				this.__parseRSSData(data,opt);
			}else
			if ( $(data).find('feed').length ){
				alert("feed");
			}else
			if ( $(data).find('atom').length ){
				alert("atom");
			}
		}
	};

		$.fn.filterNode = function(name) {
			return this.find('*').filter(function() {
				return this.nodeName === name;
			});
		};

		$.fn.filterNodeGetFirst = function(name) {
			return this.filterNode(name).first().text();
		};
	/**
	 * __parseRSSData 
	 * parse the loaded RSS xml data and create data object
	 * @param the rss object
	 * @param opt optional options
	 * @type void
	 */
	Data.Feed.prototype.__parseRSSData = function(data,opt){

		var _this = this;

		if ( opt.format == "xml" ) {

			var layerset = null;
			var layer = null;
			var fonte = null;

			var channelLat = null;
			var channelLng = null;

			var version = $(data).find('rss').attr("version");

			$(data).find('channel').each(function(){

				var dataA = [];
				var count = 0;
				var childNamesA = null;

				$(data).find('item').each(function(){

					// get item fieldnames from the first item of the channel
					// ------------------------------------------------------
					if ( !childNamesA ){ 
						var check = [];
						childNamesA = [];
						var childs = $(this).children();
						for (i=0; i<childs.length; i++)	{
							var szNode = $(this).children()[i].nodeName;
							while ( check[szNode] ){
								szNode += "*";
							}
							check[szNode] = szNode;
							childNamesA[i] = szNode;
						}

						dataA.push(childNamesA);
					}

					// make one item values
					var row = [];
					for (i=0; i<childNamesA.length; i++){
						if ( childNamesA[i] == "enclosure" ){
							row.push(($(this).find(childNamesA[i]+':first').attr("url"))||"");
						}else{
							row.push(($(this).find(childNamesA[i]+':first').text())||"");
						}
					}
					dataA.push(row);
				});

				_this.__createDataTableObject(dataA,"rss",opt);
			});
		}
	};

	// ---------------------------------
	// J S O N  
	// ---------------------------------

	/** T B D
	 * __doJSONImport 
	 * reads a simple JSON table 
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	Data.Feed.prototype.__doJSONImport = function(szUrl,opt) {

		var _this = this;
		$.get(szUrl,
			function(data){
				_this.__processJsonData(data,opt);
			}).fail(function(e) { 
				alert('loading error with:'+szUrl);
			});

	}
	/** T B D
	 * __processJsonData 
	 * reads a simple JSON table 
	 * parses the data into the map data source
	 * @param file filename
	 * @param i filenumber
	 * @type void
	 */
	Data.Feed.prototype.__processJsonData = function(script,opt) {

		if ( typeof(script) == "string" ){
			eval("var data = "+script );
		}else{
			var data = script;
		}

		var dataA = [];

		var row = [];
		for ( a in data[0] ){
			row.push(a);
		}
		dataA.push(row);

		for ( i=0; i<data.length;i++ ){
			var row = [];
			for ( a in data[i] ){
				row.push(data[i][a]);
			}
			dataA.push(row);
		}
		this.__createDataTableObject(dataA,"json",opt);
	}



	// ---------------------------------
	// C R E A T E   D A T A   T A B L E 
	// ---------------------------------

	/**
	 * __createDataTableObject  
	 * take the loaded data and create a json object with the iXmaps data structure
	 * @type void
	 */
	Data.Feed.prototype.__createDataTableObject = function(dataA,szType,opt){

		var zValues = 0;
		var nValues = 0;

		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			if ( opt.ext.length ){
				$.getScript(opt.ext)
					.done(function(script, textStatus) {
					  this.__createDataTableObjectExt(dataA,szType,opt);
					})
					.fail(function(jqxhr, settings, exception) {
					  alert("external data provider: '"+opt.ext+"' could not be loaded !",2000);
					});
			}else{
				this.__createDataTableObjectExt(dataA,szType,opt);
			}

		// if not store data table as loaded
		// --------------------------------------------------
		}else{
			this.__doCreateTableDataObject(dataA,szType,opt);
		}

	};

	/**
	 * __createDataTableObjectExt  
	 * call an external data processing function, if defined
	 * @type void
	 */
	Data.Feed.prototype.__createDataTableObjectExt = function(dataA,szType,opt){

		_LOG("__createDataTableObjectExt:");

		var zValues = 0;
		var nValues = 0;

		_LOG(dataA+' , '+szType+' , '+this.id);

		// if there is an ext data processor defined, call it
		// --------------------------------------------------
		if ( typeof(opt.ext) != "undefined" ){
			try {
				eval("dataA = this."+this.id+"(dataA)");
			} catch (e){}
		}
		if ( dataA ){
			this.__doCreateTableDataObject(dataA,szType,opt);
		}
	}

	/**
	 * __doCreateTableDataObject 
	 * finally make the data object with the iXmaps data structure
	 * @type void
	 */
	Data.Feed.prototype.__doCreateTableDataObject = function(dataA,szType,opt){

		var zValues = 0;
		var nValues = 0;

		// cteate data object
		// ------------------
		this.dbtable = new Data.Table();

		// first row of data => object.fields
		// ------------
		this.dbtable.fields = new Array ();
		for ( var a in dataA[0] ){
			this.dbtable.fields.push({id:(dataA[0][a]||" "),typ:0,width:60,decimals:0});
		}

		// following rows => object.records
		// records array
		// --------------
		this.dbtable.records = new Array ();

		// get all values we want 
		// loop over countries
		for ( i=1; i<dataA.length; i++ ){
			// add one record
			var valuesA = new Array ();
			for ( var a in dataA[i] ){
				valuesA.push((dataA[i][a]||" "));
			}
			this.dbtable.records.push(valuesA);
		}

		// finish the data object by creating object.table
		// -----------------------------------------------
		this.dbtable.table = {records:dataA.length-1 , fields:dataA[0].length };

		// deploy the object into the map
		// ------------------------------
		
		if ( (typeof(opt) != "undefined") && opt.success ){
			opt.success(this.dbtable);
		}
	}

	/**
	 * Create a new Data.Table instance.  
	 * @class It realizes an object to hold 2d table data in the ixmaps dbTable format
	 * @constructor
	 * @throws 
	 * @return A new Data.Table object
	 */

	Data.Table = function () {
		this.table = {records:0,
					  fields:0};
		this.fields = [];
		this.records = [];
		};

	/**
	 * revert the rows of a data table
	 * @parameter none
	 * @type data table
	 * @return the reverted table
	 */
	Data.Table.prototype.revert= function(){
		var records = [];
		for ( var i=this.records.length-1; i>=0; i-- )	{
			records.push(this.records[i]);
		}
		this.records = records;
		return this;
	};

	/**
	 * reverse the rows of a data table
	 * @parameter none
	 * @type data table
	 * @return the reversed table
	 */
	Data.Table.prototype.reverse = function(){
		var records = [];
		for ( var i=this.records.length-1; i>=0; i-- )	{
			records.push(this.records[i]);
		}
		this.records = records;
		return this;
	};

	/**
	 * get the index of a column by name
	 * @parameter szColumn the name of the column
	 * @type int
	 * @return the index of the column or null
	 */
	Data.Table.prototype.columnIndex = function(szColumn){
		for (i in this.fields )	{
			if ( this.fields[i].id == szColumn ){
				return i;
			}
		}
		return null;
	};

	/**
	 * extract the values of one column from a data table
	 * @parameter szColumn the name of the column to extract from loaded data
	 * @type array
	 * @return column values or null
	 */
	Data.Table.prototype.column= function(szColumn){ 
		for (i in this.fields )	{
			if ( this.fields[i].id == szColumn ){
				var column = new Data.Column();
				column.index = i;
				column.table = this;
				return column;
			}
		}
		return null;
	};

	/**
	 * creates new columns on based on existing ones <br>
	 * <br>
	 * @parameter options the creation parameter
	 * @parameter callback the user creation function
	 * @type array of arrays
	 * @return the table
	 * <br><br>
	 * <strong>options definition object:</strong>
	 *		var options = { "source":		'name of the source column',
	 *						"destination":	'name of the column to create',
	 *					  }
	 *	<br>
	 *  source: is optional! 
	 *  if no source is defined, the callback receives the whole row as array of values
	 *  <br>
	 *  callback: must be a function that returns the value for the new column
	 *  it is called for every row of the table. It receives as only parameter the value
	 *  of the source column, or, if no source column defined, an array of all values or the row.
	 */
	Data.Table.prototype.addColumn = function(options,callback){

		if ( !options.destination ){
			return null;
		}

		var column = null;
		if (options.source)	{
			for (var i in this.fields ){
				if ( this.fields[i].id == options.source ){
					column = i;
				}
			}
		}
		if ( column ==	 null ){
			return null;
		}

		this.__subt = new Data.Table;

		// make fields (=column names)
		// ----------------------------------
		// copy orig column names 
		for (var i in this.fields )	{
			this.__subt.fields.push(this.fields[i]);
			this.__subt.table.fields++;
		}
		// add new column name
		this.__subt.fields.push({id:String(options.destination),created:true});
		this.__subt.table.fields++;


		// make records 
		// ------------------
		for ( j in this.records ){
			var records = [];

			// copy orig values 
			for ( var i in this.fields ){
				records.push(this.records[j][i]);
			}
			// add new column value
			records.push((column!=null)?callback(this.records[j][column]):callback(this.records[j]));

			// add row to table
			this.__subt.records.push(records);
			this.__subt.table.records++;
		}
		this.table   = this.__subt.table;
		this.fields  = this.__subt.fields;
		this.records = this.__subt.records;

		return this.__subt;
	};

	/**
	 * select rows from a dbtable objects data by SQL query
	 * @parameter szSelection the selection query string
	 * @type Data.Table
	 * @return Data.Table object with the selection result in dbTable format
	 */
	Data.Table.prototype.select= function(szSelection){

		if ( szSelection.match(/WHERE/) ){

			// first time ?
			// get query parts

			if ( 1 ){
				
				var szPartsA = szSelection.split('AND');
				var szFieldA = [];
				var filterObj = {};

				// test if BETWEEN x AND y
				if ( (szPartsA.length > 1) && (szPartsA[1].split(' ').length < 3) ){
					szPartsA = [szSelection];
				}
				this.filterQueryA = [];

				for ( i=0; i<szPartsA.length; i++ ){

					// GR 20.05.2016 field defined by: 'name'
					if ( szPartsA[i].match(/\'/) ){
						szFieldA = szPartsA[i].split("\'");
						filterObj = {};
						filterObj.szSelectionField = szFieldA[1];
						szFieldA = szFieldA[2].split(' ');
						if ( szFieldA.length >= 2 ){
							filterObj.szSelectionOp = szFieldA[1];
							filterObj.szSelectionValue = szFieldA[2].replace('.','\\.').replace(/\//gi,'\\/');
							if ( (filterObj.szSelectionOp == "BETWEEN") && (szFieldA[3] == "AND") && (szFieldA.length >= 4) ){
								filterObj.szSelectionValue2 = szFieldA[4].replace('.','\\.').replace(/\//gi,'\\/');
							}
						}
					}else
					// GR 20.05.2016 field defined by: "name"
					if ( szPartsA[i].match(/\"/) ){
						szFieldA = szPartsA[i].split("\"");
						filterObj = {};
						filterObj.szSelectionField = szFieldA[1];
						szFieldA = szFieldA[2].split(' ');
						if ( szFieldA.length >= 2 ){
							filterObj.szSelectionOp = szFieldA[1];
							filterObj.szSelectionValue = szFieldA[2].replace('.','\\.').replace(/\//gi,'\\/');
							if ( (filterObj.szSelectionOp == "BETWEEN") && (szFieldA[3] == "AND")  && (szFieldA.length >= 4) ){
								filterObj.szSelectionValue2 = szFieldA[4].replace('.','\\.').replace(/\//gi,'\\/');
							}
						}
					}else{
					// GR 20.05.2016 field defined by: name
						szFieldA = szPartsA[i].split(' ');
						filterObj = {};
						if ( szFieldA.length >= 3 ){
							filterObj.szSelectionField = szFieldA[1];
							filterObj.szSelectionOp = szFieldA[2];
							filterObj.szSelectionValue = szFieldA[3].replace('.','\\.').replace(/\//gi,'\\/');
							if ( (filterObj.szSelectionOp == "BETWEEN") && (szFieldA[4] == "AND") && (szFieldA.length >= 5) ){
								filterObj.szSelectionValue2 = szFieldA[5].replace('.','\\.').replace(/\//gi,'\\/');
							}
						}
					}
					for ( var ii=0; ii<this.fields.length; ii++ ){
						if ( this.fields[ii].id == filterObj.szSelectionField ){
							filterObj.nFilterFieldIndex = ii;
						}
					}
					this.filterQueryA.push(filterObj);
				}
			}
			this.selection = new Data.Table;

			for ( i in this.filterQueryA ){
				if ( typeof this.filterQueryA[i].nFilterFieldIndex === "undefined" ){
					this.selection.fields = this.fields;
					this.selection.table.fields = this.table.fields;
					_LOG("Selection: invalid query: "+szSelection);
					return this.selection;
				}
			}

			for ( j in this.records ){

				var allResult = true;

				for ( i in this.filterQueryA ){

					var result = true;
					// get the value to test
					this.__szValue		 = String(this.records[j][this.filterQueryA[i].nFilterFieldIndex]);
					this.__szSelectionOp	 = this.filterQueryA[i].szSelectionOp; 
					this.__szSelectionValue = this.filterQueryA[i].szSelectionValue;
					this.__szSelectionValue2 = this.filterQueryA[i].szSelectionValue2;

					// do the query 
					// ------------
					var nValue = parseFloat(this.__szValue);
					if ( this.__szSelectionOp == "=" ){
						if ( this.__szSelectionValue == '*' ){
							result = (this.__szValue.replace(/ /g,"") != "");
						}else{
							result = ( (this.__szValue == this.__szSelectionValue) || (nValue == Number(this.__szSelectionValue)) );
						}
					}else
					if ( this.__szSelectionOp == "<>" ){
						result = !( (this.__szValue == this.__szSelectionValue) || (nValue == Number(this.__szSelectionValue)) );
					}else
					if ( this.__szSelectionOp == ">" ){
						result = ( nValue > Number(this.__szSelectionValue) );
					}else
					if ( this.__szSelectionOp == "<" ){
						result = ( nValue < Number(this.__szSelectionValue) );
					}else
					if ( this.__szSelectionOp == ">=" ){
						result = ( nValue >= Number(this.__szSelectionValue) );
					}else
					if ( this.__szSelectionOp == "<=" ){
						result = ( nValue <= Number(this.__szSelectionValue) );
					}else
					if ( this.__szSelectionOp == "LIKE" ){
						result = eval("this.__szValue.match(/"+this.__szSelectionValue+"/i)");
					}else
					if ( this.__szSelectionOp == "NOT" ){
						result = !eval("this.__szValue.match(/"+this.__szSelectionValue+"/i)");
					}else
					if ( this.__szSelectionOp == "IN" ){
						result = eval("this.__szSelectionValue.match(/\\("+this.__szValue+"\\,/)") || 
								 eval("this.__szSelectionValue.match(/\\,"+this.__szValue+"\\,/)") ||
								 eval("this.__szSelectionValue.match(/\\,"+this.__szValue+"\\)/)")
								;
					}else
					if ( (this.__szSelectionOp == "BETWEEN") ){
						result = ( (nValue >= Number(this.__szSelectionValue)) &&
								   (nValue <= Number(this.__szSelectionValue2)) );
					}else {
					// default operator	
						result = eval("this.__szValue.match(/"+this.__szSelectionValue+"/i)");
					}
					allResult = (allResult && result);
				}
				if ( allResult ){
					this.selection.records.push(this.records[j]);
					this.selection.table.records++;
				}
			}
		}
		this.selection.fields = this.fields;
		this.selection.table.fields = this.table.fields;
		return this.selection;
	};


	__myNumber = function(value){
		var number = parseFloat(value.replace(/\./g,"").replace(/\,/g,"."));
		return isNaN(number)?0:number;
	};

	/**
	 * select rows from a dbtable objects data by SQL query
	 * @parameter szSelection the selection query string
	 * @type Data.Table
	 * @return Data.Table object with the selection result in dbTable format
	 */
	Data.Table.prototype.aggregate = function(szColumn,szAggregate){

		var szAggregateA = szAggregate.split("|");
		var nAggregateIndexA = [];

		var nValueIndex = null;

		for ( var i=0; i<szAggregateA.length; i++ ){
			for ( var ii=0; ii<this.fields.length; ii++ ){
				if ( this.fields[ii].id == szAggregateA[i] ){
					nAggregateIndexA[i] = ii;
				}
				if ( this.fields[ii].id == szColumn ){
					nValueIndex = ii;
				}
			}
		}

		this.aggregation = new Data.Table;

		xRecords = [];
		for ( j in this.records ){
			xField = ""
			for ( i=0; i<nAggregateIndexA.length; i++ ){
				xField += this.records[j][nAggregateIndexA[i]];
			}
			if ( xRecords[xField] ){
				xRecords[xField][nAggregateIndexA.length] += __myNumber(this.records[j][nValueIndex]);
			}else{
				xRecords[xField] = [];
				xRecords[xField][nAggregateIndexA.length] = __myNumber(this.records[j][nValueIndex]);
				for ( var i=0; i<nAggregateIndexA.length; i++ ){
					xRecords[xField][i] = this.records[j][nAggregateIndexA[i]];
				}
			}
		}

		for ( j in xRecords ){
			this.aggregation.records.push(xRecords[j]);
			this.aggregation.table.records++;
		}

		var fields = [];
		for ( var i=0; i<szAggregateA.length; i++ ){
			fields[i] = {id:szAggregateA[i]};
		}
		fields[szAggregateA.length] = {id:szColumn};

		this.aggregation.fields = fields;
		this.aggregation.table.fields = fields;

		return this.aggregation;
	};

	/**
	 * creates a pivot table <br>
	 * <br>
	 * source and destination tables are defined by one header row with the field names and n data rows
	 * the pivot generation is defined by an pivot object
	 * @parameter options the pivot creation parameter
	 * @type dbtable
	 * @return the pivot table
	 * <br><br>
	 * <strong>pivot definition object:</strong>
	 *		var options = { "lead":	'comune',
	 *					    "keep":	['comune_scr','provincia_scr','Lat','Lon'],
	 *					    "cols":	'tipo_scr',
	 *					    "value":  1 
	 *					  }
	 *	<br>
	 *  lead: the sourcetable field that defines the pivot rows
	 *  keep: columns of the sourcetable to copy into the pivot
	 *  cols: the sourcetable field that defines the pivot columns (together with 'keep')
	 *  value: the sourcetable field where to get the value to accumulate
	 *         if '1', count the cases of the cols topics 
	 */
	Data.Table.prototype.pivot = function(options){

		options.keep = options.keep || [];

		// make field indices

		var indexA = [];
		for ( i=0; i<this.fields.length; i++ ){
			indexA[String(this.fields[i].id)] = i;
		}

		// make the pivot 

		var rowA = [];
		var colA = [];
		var data = this.records;

		for ( var row=0; row<data.length; row++ ){

			var szRow  = String(data[row][indexA[options.lead]]);
			var szCol  = String(data[row][indexA[options.cols]]);
			var nValue = options.value?__myNumber(data[row][indexA[options.value]]):1;

			if ( !szCol || szCol.length < 1 ){
				szCol = "undefined"
			}
			if ( !colA[szCol] ){
				colA[szCol] = 0;
			}
			if ( !rowA[szRow] ){
				rowA[szRow] = {"Total":0};
				for ( k=0; k<options.keep.length; k++ ){
					rowA[szRow][options.keep[k]] = data[row][indexA[options.keep[k]]];
				}
			}

			rowA[szRow]["Total"] += nValue;

			if ( !rowA[szRow][szCol] ){
				rowA[szRow][szCol] = nValue;
			}else{
				rowA[szRow][szCol] += nValue;
			}
		}

		this.__pivot = new Data.Table;
		var pivotTable = this.__pivot.records;

		// fields array
		// ------------

		// lead
		this.__pivot.fields.push({id:options.lead});
		// keep
		for ( k=0; k<options.keep.length; k++ ){
			this.__pivot.fields.push({id:options.keep[k]});
		}
		// cols
		for ( a in colA ){
			this.__pivot.fields.push({id:a});
		}
		//totale
		this.__pivot.fields.push({id:"Total"});


		// values
		// ------------
		for ( a in rowA ){

			// collect values per place
			var valueA = new Array();

			// lead
			valueA.push(a);

			// keep
			for ( k=0; k<options.keep.length; k++ ){
				valueA.push(rowA[a][options.keep[k]]);
			}

			// cols
			for ( t in colA ){
				valueA.push(rowA[a][t]||0);
			}

			// totale
			valueA.push(rowA[a]["Total"]);

			// record complete
			this.__pivot.records.push(valueA);
			this.__pivot.table.records++;
		}

		return(this.__pivot);
	};

	/**
	 * creates a sub table <br>
	 * <br>
	 * destination tables contains only the specified columns
	 * @parameter options the target columns definition
	 * @type array of arrays
	 * @return the generated sub table
	 * <br><br>
	 * <strong>options:</strong>
	 *		var options = { "columns":	[1,2,3],
	 *						"fields":	['comune_scr','provincia_scr','Lat','Lon'],
	 *					  }
	 *	<br>
	 *  columns: the position(s) of the source columns to copy into the subtable
	 *  fields:  the name(s) of the source columns to copy into the subtable
	 *  <br>
	 *  use only one, or columns or fields 
	 */
	Data.Table.prototype.subtable = function(options){

		this.__subt = new Data.Table;

		if ( options.fields ){
			options.columns = [];
			for ( i=0; i<options.fields.length; i++ ){
				for ( ii=0; ii<this.fields.length; ii++ ){
					if ( this.fields[ii].id == options.fields[i] ){
						options.columns.push(ii);
					}
				}
			}
		}
		
		var indexA = [];
		for ( i=0; i<options.columns.length; i++ ){
			this.__subt.fields.push({id:String(this.fields[options.columns[i]].id)});
			this.__subt.table.fields++;
		}
		for ( j in this.records ){
			var records = [];
			for ( i=0; i<options.columns.length; i++ ){
				records.push(this.records[j][options.columns[i]]);
			}
			this.__subt.records.push(records);
			this.__subt.table.records++;
		}
		return this.__subt;
	};

	// ---------------------------------------------------------------------------------
	//
	// additional specific functions (not core, can also be realized by above functions)
	//
	// ---------------------------------------------------------------------------------

	/**
	 * creates new columns on base of a timestamp that contain the following time orders <br>
	 * date,year,month,day,hour
	 * <br>
	 * @parameter data the input tabel (array of arrarys)
	 * @parameter options generation options
	 * @type array of arrays
	 * @return the pivot table
	 * <br><br>
	 * <strong>options definition object:</strong>
	 *		var options = { "source":	'name of timestamp column',
	 *						"create":	['date','year','month','day','hour']
	 *					}
	 *	<br>
	 *  source: the sourcetable field that contains the toime stamp
	 *  create: [optional] an array of columns to creaate
	 *          to define only if not wished to create all of above listed time columns
	 */
	Data.Table.prototype.addTimeColumns = function(options){

		if ( !options.source ){
			return null;
		}

		this.__subt = new Data.Table;
		
		var indexA = [];
		for (var column in this.fields )	{
			if ( this.fields[column].id == options.source ){

				// make fields object
				// ------------------

				// copy orig fields 
				for (var i in this.fields )	{
					this.__subt.fields.push({id:String(this.fields[i].id)});
					this.__subt.table.fields++;
				}
				var timeCollA = options.create || ['date','year','month','day','hour'];

				// add new time columns 
				for ( i=0; i<timeCollA.length; i++ ){
					this.__subt.fields.push({id:String(timeCollA[i])});
					this.__subt.table.fields++;
				}

				// make values 
				// ------------------

				for ( j in this.records ){
					var records = [];

					// copy orig values 
					for ( var i in this.fields ){
						records.push(this.records[j][i]);
					}

					// add new time column values
					var d = new Date(this.records[j][column]);
					for ( i=0; i<timeCollA.length; i++ ){
						switch ( timeCollA[i] )	{
						case 'date':
							var date = String(d.getDate()) + "." + String(d.getMonth()+1) + "." + String(d.getFullYear());
							records.push(date);
							break;
						case 'year':
							records.push(d.getFullYear());
							break;
						case 'month':
							records.push(d.getMonth()+1);
							break;
						case 'day':
							records.push(d.getDay());
							break;
						case 'hour':
							records.push(d.getHours());
							break;
						}
					}

					this.__subt.records.push(records);
					this.__subt.table.records++;
				}
			}
		}

		return this.__subt;
	};

	/**
	 * Create a new Data.Column instance.  
	 * @class It realizes an object to hold a table column
	 * @constructor
	 * @throws 
	 * @return A new Data.Column object
	 */

	Data.Column = function () {
		this.table = null;
		this.index = null;
		this.valueA = null;
		};

	/**
	 * get the values of one column
	 * <br>
	 * @type array
	 * @return the values of a column in an array
	 */
	Data.Column.prototype.values = function(){
		this.valueA = [];
		for ( i in this.table.records ){
			this.valueA.push(this.table.records[i][this.index]);
		}
		return this.valueA;
	};

	/**
	 * map the values of one column
	 * <br>
	 * @parameter callback the user creation function
	 * @type void
	 * @return true
	 */
	Data.Column.prototype.map = function(callback){

		// make new record values 
		// ----------------------
		for ( j in this.table.records ){
			// query new column value by callback
			this.table.records[j][this.index] = callback(this.table.records[j][this.index]);
		}

		return true;
	};



	// ----------------------------------------------------
	// W R A P  Data.Table  functions to Data.Feed objectr
	// ----------------------------------------------------
	
	/**
	 * extract the values of one column from a data table
	 * @parameter szColumn the name of the column to extract from loaded data
	 * @type array
	 * @return column values array or null
	 */
	Data.Feed.prototype.column = function(szColumn){ 
		return this.dbtable.column(szColumn);
	};

	/**
	 * applicate filter to one theme item
	 * @parameter j the index (data row) of the item to check
	 * @type boolean
	 * @return true if item passes the filter
	 */
	Data.Feed.prototype.select= function(szSelection){
		return this.dbtable.select(szSelection);
	};

	/**
	 * aggregate 
	 * @parameter j the index (data row) of the item to check
	 * @type boolean
	 * @return true if item passes the filter
	 */
	Data.Feed.prototype.aggregate= function(szColumn,szAggregation){
		return this.dbtable.aggregate(szColumn,szAggregation);
	};

	/**
	 * revert 
	 * @parameter void
	 * @type feed
	 * @return the reverted feed
	 */
	Data.Feed.prototype.revert= function(){
		return this.dbtable.revert();
	};

	/**
	 * reverse 
	 * @parameter void
	 * @type feed
	 * @return the reversed feed
	 */
	Data.Feed.prototype.reverse = function(){
		return this.dbtable.reverse();
	};

	/**
	 * pivot 
	 * @parameter j the index (data row) of the item to check
	 * @type boolean
	 * @return true if item passes the filter
	 */
	Data.Feed.prototype.pivot= function(options){
		return this.dbtable.pivot(options);
	};

	/**
	 * subtable 
	 * @parameter j the index (data row) of the item to check
	 * @type boolean
	 * @return true if item passes the filter
	 */
	Data.Feed.prototype.subtable= function(options){
		return this.dbtable.subtable(options);
	};

	/**
	 * add time fields to table by a timestamp column 
	 * @parameter options ( see Data.Table.prototype.addTimeColumns )
	 * @type feed
	 * @return the enhanced feed
	 */
	Data.Feed.prototype.addTimeColumns= function(options){
		return this.dbtable.addTimeColumns(options);
	};

	// =====================================================================
	// data broker
	// =====================================================================

	/**
	 * This is the dataBroker class.  
	 * 
	 * It realizes an object to load one or more data sources 
	 * calls a callback on successful load of all sources to filter or merge the data sources
	 * 
	 * @constructor
	 * @throws 
	 * @return A new dataBroker object
	 */
	Data.Broker = function (options) {
		this.sourceQueryA = [];
		this.options = options;
		if ( options ){
			this.parseDefinition(options);
		}
	};

	/**
	 * inherit methods from Data.Feed class  
	 */
	Data.Broker.prototype = new Data.Feed();

	/**
	 * @method addSource
	 * add one source to the broker
	 * @param szUrl the url of the data source
	 * @param szType type of the data (csv,...)
	 * @type void
	*/
	Data.Broker.prototype.addSource = function(szUrl,szType){
			_LOG("DataBroker: addSource:"+szUrl);
			this.sourceQueryA.push({
				url:szUrl,
				type:szType,
				data:null,
				result:null,
				next:this
				});
	};
	/**
	 * @method setCallback
	 * set the collback function to execute on sucess of all loadings
	 * @param callback the callback function
	 * @type void
	*/
		Data.Broker.prototype.setCallback = function(callback){
			this.callback = callback;
		};
	/**
	 * @method parseDefinition
	 * internal method to read parameter from the definition object
	 * @param definition the object literal with `data options`
	 * @param szType type of the data (csv,...)
	 * @type void
	*/
		Data.Broker.prototype.parseDefinition = function(definition){
			this.callback = definition.callback || null;
		};
	/**
	 * @method realize
	 * start the broker
	 * initiate the process to load the programmed sources
	 * @type void
	*/
		Data.Broker.prototype.realize = function(){
			for ( i in this.sourceQueryA ){
				if ( this.sourceQueryA[i].url && !this.sourceQueryA[i].result ){
					this.getData(this.sourceQueryA[i]);
					return;
				}
			}
			this.callback(this);
		};
	/**
	 * @method getData
	 * internal method to get one data from the specified source
	 * @param query object with the definition of the data source
	 * @type void
	*/
		Data.Broker.prototype.getData = function(query){
			_LOG("dbbroker get data");
			this.__doCSVImport(query.url,{
				callback:function(data){
					query.data = data;
					query.result = "success";
					query.next.realize();
					}
				});
		};
	/**
	 * @method setData
	 * set the broker result as the new Data.Table in the parent Data.Feed object
	 * @param data a 2 dim data array
	 * @type void
	*/
		Data.Broker.prototype.setData = function(data){
			this.parent.__doCreateTableDataObject(data,null,this.parent.options);
		};

	// @factory Data.Feed.broker(options?: Data options)
	// Instantiates a broker object with 
	// an object literal with `data options`.
	//
	Data.Feed.prototype.broker = function (options) {
		var broker = new Data.Broker(options);
		broker.parent = this;
		return broker;
	};

	// =====================================================================
	// end of data broker
	// =====================================================================












/**
 * end of namespace
 */


}(window, document));

// -----------------------------
// EOF
// -----------------------------

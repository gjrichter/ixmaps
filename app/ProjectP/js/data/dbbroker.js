/**********************************************************************
 dbbroker.js

$Comment: provides JavaScript to preprocess data 
$Source : dbbroker.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: dbbroker.js 8 2014-04-06 00:00:00Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: preprocess.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides preprocessing functions for datasets
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

(function() {

	// extend Number to format with leading blanks

	Number.prototype.pad = function(size) {
		var s = String(this);
		while (s.length < (size || 2)) {s = "0" + s;}
		return s;
    }

	/**
	 * data broker to query the last 10 days of air quality data from ARPA Puglia  
	 * 1. constructs the URL to query the data from ARPA 
	 * 2. on load calls e callback function to filter the data 
	 * 3. creates the Data.Feed.Table
	 * 4. this will be passed to the original Data.Feed function call:
	 * 	var mydata = Data.feed("ActualAirQuality",{"ext":szExt,"type":"ext"}).load(function(){...}
	 */

	Data.Feed.prototype.ActualAirQuality = function(){

		// start with the actual day and got 10 days back
		// ----------------------------------------------
		var d = new Date();
		var szToday = d.toLocaleString();
		var dateA = szToday.split(",")[0].split("/");
		var end = (Number(dateA[2])+Number(dateA[1]).pad(2)+Number(dateA[0]).pad(2));

		d.setDate(d.getDate()-10);
		szToday = d.toLocaleString();
		dateA = szToday.split(",")[0].split("/");
		var start = (Number(dateA[2])+Number(dateA[1]).pad(2)+Number(dateA[0]).pad(2));

		this.broker = this.broker(this.options);
		this.broker.addSource("http://corsme.herokuapp.com/http://www.arpa.puglia.it/pentaho/ViewAction?&DATAINIZIO="+start+"&DATAFINE="+end+"&type=csv&=2016&solution=ARPAPUGLIA&action=meta-aria.xaction&path=metacatalogo&PROVINCIA=Lecce");
		this.broker.setCallback(__theme_1);
		this.broker.realize();
		return;
	};		
	function __theme_1(broker) {

		var result = [];

		// get column names

		for ( i in broker.sourceQueryA[0].data ){
			var x = broker.sourceQueryA[0].data[i];
			if ( x[0] && x[0].length && x[0] == 'NomeCentralina ' )	{
				result.push(x);
				break;
			}
		}

		// get data rows

		for ( i in broker.sourceQueryA[0].data ){
			var x = broker.sourceQueryA[0].data[i];
			if ( (x[3] && x[3].length && x[3] == 'Lecce') )	{
				result.push(x);
			}
		}

		broker.setData(result);
	}




	// =====================================================================
	// data merger
	// =====================================================================

	/**
	 * This is the DataMerger class.  
	 * It realizes an object to load one or more data sources 
	 * @constructor
	 * @throws 
	 * @return A new DataMerger object
	 */
	function DataMerger(definition) {
		this.sourceA = [];
		if ( definition ){
			this.parseDefinition(definition);
		}
	}
	DataMerger.prototype.addSource = function(source,option){
		this.sourceA.push({data:source,opt:option});	
	};
	DataMerger.prototype.setOutputColumns = function(columnsA){
		this.outColumnsA = columnsA;
	};
	DataMerger.prototype.realize = function(){

		_LOG("DataMerger: >>>");

		var indexAA = []; 

		for ( i in this.sourceA ){
			var index = [];
			for ( ii in this.sourceA[i].data[0] )	{

				if ( this.sourceA[i].data[0][ii] == this.sourceA[i].opt.lookup ){
					index[this.sourceA[i].opt.lookup] = ii;
				}

				for ( iii in this.sourceA[i].opt.columns )	{
					if ( this.sourceA[i].data[0][ii] == this.sourceA[i].opt.columns[iii] ){
						index[this.sourceA[i].opt.label[iii]] = ii;
					}
				}
			}
			indexAA.push(index);
		}

		var labelA = [];
		for ( i in this.sourceA ){
			for ( ii in this.sourceA[i].opt.label )	{
				labelA.push(this.sourceA[i].opt.label[ii]);
			}
		}

		var outColumnsLookupA = [];
		for ( i in this.outColumnsA ){
			for ( ii in indexAA ){
				for ( iii in indexAA[ii] ){
					if ( iii == this.outColumnsA[i] ){
						outColumnsLookupA[iii] = {input:ii,index:indexAA[ii][iii] };
					}
				}
			}
		}

		for ( i in this.outColumnsA ){
			if ( !outColumnsLookupA[this.outColumnsA[i]] ){

				for ( ii in this.sourceA[0].data[0] )	{
					if ( this.sourceA[0].data[0][ii] == this.outColumnsA[i] ){
						outColumnsLookupA[this.outColumnsA[i]] = {input:0,index:ii }
					}
				}
			}
		}

		this.namedSourceA = [];
		for ( i=1; i<this.sourceA.length; i++ ){
			this.namedSourceA[i] = [];
			for ( ii=1; ii<this.sourceA[i].data.length; ii++ ){
				this.namedSourceA[i][String(this.sourceA[i].data[ii][indexAA[i][this.sourceA[i].opt.lookup]])] = this.sourceA[i].data[ii];
			}
		}

		var newData = [];
		newData.push(this.outColumnsA);

		for ( i=1; i<this.sourceA[0].data.length; i++ ){
			var	lookup = String(this.sourceA[0].data[i][[indexAA[0][this.sourceA[0].opt.lookup]]]);

			var row = [];
				
			for ( ii in this.outColumnsA ){
				var ll = outColumnsLookupA[this.outColumnsA[ii]];
				if ( ll ){
					if ( ll.input == 0 ){
						row.push(this.sourceA[0].data[i][ll.index]);
					}else{
						if (this.namedSourceA[ll.input][lookup]){
							row.push(this.namedSourceA[ll.input][lookup][ll.index]);
						}
					}
				}
			}

			newData.push(row);
		}

		_LOG("DataMerger: done");

		return newData;
	};

	// =====================================================================
	// end of data merger
	// =====================================================================


})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

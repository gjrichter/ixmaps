$(function() {

	// get actual air quality from ARPA 
	// using a data broker 
	// with name: ActualAirQuality()
	// defined in "../../js/data/dbbroker.js"

	var szExt = "../../js/data/dbbroker.js";
	var mydata = Data.feed("ActualAirQuality",{"ext":szExt,"type":"ext"}).load(function(){

		var columns = [];
		for ( i in mydata.dbtable.fields ){
			columns.push({title:mydata.dbtable.fields[i].id});
		}
		$('#tableTest').DataTable( {
			data: mydata.dbtable.records,
			columns: columns
		});
	});
});


$(function() {

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(){

		var columns = [];
		for ( i in mydata.dbtable.fields ){
			columns.push({title:mydata.dbtable.fields[i].id});
		}
		$('#Rifiuti').DataTable( {
			data: mydata.dbtable.records,
			columns: columns,
				sort:false
		});
	});
});

$(function() {

	// we load the dataset once and create several tables
	// --------------------------------------------------
	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/8O6bQ6";
	var mydata = Data.feed("Rifiuti_2015_particolari",{"source":szUrl,"type":"csv"}).load(function(){

		// raw data table 
		//----------------
		var columns = [];
		for ( i in mydata.dbtable.fields ){
			columns.push({title:mydata.dbtable.fields[i].id});
		}
		$('#Rifiuti-particolari').DataTable( {
			data: mydata.dbtable.records,
			columns: columns,
				sort:false
		});

		// aggregated for mese and tipologia 
		// and 'selected' only rows with tipologia legno 
		//----------------------------------------------

		var aggregation = mydata.aggregate("Q.TA (KG)","MESE|TIPOLOGIA DI RIFIUTI ");
		aggregation = aggregation.select("WHERE 'TIPOLOGIA DI RIFIUTI ' like LEGNO");

		columns = [];
		for ( i in aggregation.fields ){
			columns.push({title:aggregation.fields[i].id});
		}
		$('#Rifiuti-particolari-aggregati').DataTable( {
			data: aggregation.records,
			columns: columns,
				sort:false
		});


		// create a pivot table with tipologia aggregated by month 
		//--------------------------------------------------------

		var opt   = { "lead":	'MESE',
					  "keep":	['COMUNE'],
					  "cols":	'TIPOLOGIA DI RIFIUTI ',
					  "value":  "Q.TA (KG)" 
					};

		var pivot = mydata.pivot(opt);

		console.log("pivot"	);
		console.log(pivot);

		// I. all columns with aggregated tipologia in one table 
		// -----------------------------------------------------

		columns = [];
		for ( i in pivot.fields ){
			columns.push({title:pivot.fields[i].id});
		}
		$('#Rifiuti-particolari-pivot').DataTable( {
			data: pivot.records,
			columns: columns,
				sort:false
		});

		// tipologia columns split into 3 tables 
		// -----------------------------------------------------

		var subtable1 = pivot.subtable({columns:[0,1,2,3,4,5,6,7,8]});
		columns = [];
		for ( i in subtable1.fields ){
			columns.push({title:subtable1.fields[i].id});
		}
		$('#Rifiuti-particolari-pivot-sub1').DataTable( {
			data: subtable1.records,
			columns: columns,
				sort:false
		});

		var subtable2 = pivot.subtable({columns:[0,1,9,10,11,12,13,14,15]});
		columns = [];
		for ( i in subtable2.fields ){
			columns.push({title:subtable2.fields[i].id});
		}
		$('#Rifiuti-particolari-pivot-sub2').DataTable( {
			data: subtable2.records,
			columns: columns,
				sort:false
		});

		var subtable3 = pivot.subtable({columns:[0,1,16,17,18,19,20,21,22]});
		columns = [];
		for ( i in subtable3.fields ){
			columns.push({title:subtable3.fields[i].id});
		}
		$('#Rifiuti-particolari-pivot-sub3').DataTable( {
			data: subtable3.records,
			columns: columns,
				sort:false
		});

	});
});

$(function() {

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/RFthBo";
	var mydata = Data.feed("BnB",{"source":szUrl,"type":"csv"}).load(function(){

		var columns = [];
		for ( i in mydata.dbtable.fields ){
			columns.push({title:mydata.dbtable.fields[i].id});
		}
		$('#BnB').DataTable( {
			data: mydata.dbtable.records,
			columns: columns,
				sort:false
		});
	});
});

$(function() {

	//2016 var szUrl = "http://corsme.herokuapp.com/https://goo.gl/4JQIzn";
	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/kRKeTf";
	var mydata = Data.feed("Anagrafe",{"source":szUrl,"type":"csv"}).load(function(){

		var columns = [];
		for ( i in mydata.dbtable.fields ){
			columns.push({title:mydata.dbtable.fields[i].id});
		}
		$('#Anagrafe').DataTable( {
			data: mydata.dbtable.records,
			columns: columns,
				sort:false
		});
	});
});


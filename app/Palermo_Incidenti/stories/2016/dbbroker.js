/**********************************************************************
 dbbroker.js

$Comment: provides JavaScript to query data from data.world and prepare for ixmaps theme
$Source : preprocess.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: dbbroker.js 8 2017-09-11 00:00:00Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: dbbroker.js,v $
**********************************************************************/

/** 
 * @fileoverview provides JavaScript to query data from data.world and prepare for ixmaps theme
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

window.ixmaps = window.ixmaps || {};
(function() {

	__sourceColumn = function(szColumn){
		if ( szColumn == "FasciaOraria" ){
			return "ORA,DATA,Incidenti";
		}
		if ( szColumn == "GiornoDellaSettimana" ){
			return "ORA,DATA,Incidenti";
		}
		
		return szColumn;
	}


	ixmaps.query_data_world = function(data,option){

		_LOG("dbbroker -----------------------");

		// get an array of the fields we want to query from data.world
		// -----------------------------------------------------------

		var szRequestedFields = "";
		var nFields = option.theme.szFieldsA.length;
		var szField = __sourceColumn(option.theme.szFieldsA[0]);

		for ( var i=0; i<nFields; i++ ){
			szRequestedFields += (i>0?",":"") + __sourceColumn(option.theme.szFieldsA[i]);
		}
		szRequestedFields += ((option.theme.szField100 && option.theme.szField100.length)?(","+option.theme.szField100):"") +
							 ((option.theme.szItemField && option.theme.szItemField.length)?(","+option.theme.szItemField.replace("|",",")):"") +
							 ((option.theme.szTitleField && option.theme.szTitleField.length)?(","+option.theme.szTitleField):"") +
							 ((option.theme.szAlphaField && option.theme.szAlphaField.length)?(","+option.theme.szAlphaField):"");

		// define the query
		// ----------------

		var settings = {
		  "async": true,
		  "crossDomain": true,
		  "url": "https://api.data.world/v0/sql/grichter/palermo-incidenti-stradali?includeTableSchema=false&query=SELECT%20"+szRequestedFields+"%20FROM%2020032017144826",
		  "method": "GET",
		  "headers": {
			"authorization": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwcm9kLXVzZXItY2xpZW50OmdyaWNodGVyIiwiaXNzIjoiYWdlbnQ6Z3JpY2h0ZXI6OjFkMTJiY2VjLTQ0NzItNDg2Mi05YmZmLTE2YTBlMDY4Y2M1ZSIsImlhdCI6MTQ5OTA5MzQ0Niwicm9sZSI6WyJ1c2VyX2FwaV9yZWFkIiwidXNlcl9hcGlfd3JpdGUiXSwiZ2VuZXJhbC1wdXJwb3NlIjp0cnVlfQ.5XyTRdCdft7v28LrODgudwzS69RosFSfhmBS1EfNJ3JERNvJEb267G_ahvxwSncar9bV6rEPElfqCd1yxPli1A",
			"accept": "application/json"
		  },
		  "data": "{}"
		}

		// here we go
		// ----------------

		console.log("dbbroker - "+JSON.stringify(settings));

		$.ajax(settings).done(function (response) {
			if ( response ){
				_LOG("dbbroker - data received");

				// finally set the data into the theme and go on
				ixmaps.setExternalData(response,{type:"json",name:"query_data_world",ext:"dbbroker.js"});

			}else{
				alert("error loading data from data.world");
			}

		}); // end of ajax http request

	}; // end of data broker  

	ixmaps.query_data_world.after = function(script) {

		// get time index

		var indexOra = 0;
		var indexData = 0;
		var indexIncidenti = 0;
		for ( i in query_data_world.fields )	{
			if ( query_data_world.fields[i].id == "ORA" ){
				indexOra = i;
			}
			if ( query_data_world.fields[i].id == "DATA" ){
				indexData = i;
			}
			if ( query_data_world.fields[i].id == "Incidenti" ){
				indexIncidenti = i;
			}
		}

		// parse date and generate new fields

		for ( i in query_data_world.records )	{

			var szTipo = query_data_world.records[i][indexIncidenti];

			if ( szTipo == "M" || szTipo == "R" ){
				query_data_world.records[i].push(2);
				query_data_world.records[i].push(0);
			}else
			if ( szTipo == "F" ){
				query_data_world.records[i].push(1);
				query_data_world.records[i].push(0);
			}else{
				query_data_world.records[i].push(0);
				query_data_world.records[i].push(1);
			}

			var dateA = query_data_world.records[i][indexData].split('-');
			var date = new Date(Number(dateA[2]),Number(dateA[1])-1,Number(dateA[0]));

			// add month: Mese
			var mese = date.getMonth()+1;
			query_data_world.records[i].push(String(mese));

			// add day of week: GiornoDellaSettimana
			var giorno = date.getDay();
			query_data_world.records[i].push(String(giorno));

			// add our: Ora
			var ora = Math.floor(query_data_world.records[i][indexOra]);
			query_data_world.records[i].push(String(ora));

			// add our range: FasciaOraria
			if ( ora >= 0 && ora < 3 ){
 				query_data_world.records[i].push("0-3");
			}else
			if ( ora >= 3 && ora < 6 ){
 				query_data_world.records[i].push("3-6");
			}else
			if ( ora >= 6 && ora < 9 ){
 				query_data_world.records[i].push("6-9");
			}else
			if ( ora >= 9 && ora < 12 ){
 				query_data_world.records[i].push("9-12");
			}else
			if ( ora >= 12 && ora < 15 ){
 				query_data_world.records[i].push("12-15");
			}else
			if ( ora >= 15 && ora < 18 ){
 				query_data_world.records[i].push("15-18");
			}else
			if ( ora >= 18 && ora < 21 ){
 				query_data_world.records[i].push("18-21");
			}else{
 				query_data_world.records[i].push("21-24");
			}
		}
		
		// add field "Feriti"
		query_data_world.fields.push({id:"Feriti",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		// add field "Illesi"
		query_data_world.fields.push({id:"Illesi",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		// add field "Mese"
		query_data_world.fields.push({id:"Mese",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		// add field "GiornoDellaSettimana"
		query_data_world.fields.push({id:"GiornoDellaSettimana",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		// add field "Ora"
		query_data_world.fields.push({id:"Ora",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		// add field "FasciaOraria"
		query_data_world.fields.push({id:"FasciaOraria",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;

		
		// next step 

		var index = 0;
		var indexIncidenti = 0;

		for ( i in query_data_world.fields )	{
			if ( query_data_world.fields[i].id == "FasciaOraria" ){
				index = i;
			}
			if ( query_data_world.fields[i].id == "Incidenti" ){
				indexIncidenti = i;
			}
		}

		// parse date and generate new fields

		for ( i in query_data_world.records )	{

			var FasciaOraria= query_data_world.records[i][index];
			var szTipo		= query_data_world.records[i][indexIncidenti];

			var feriti		= (szTipo == "F")?1:0;
			var riservata	= (szTipo == "R")?1:0;
			var morti		= (szTipo == "M")?1:0;
			var illesi		= (szTipo == "C")?1:0;

			query_data_world.records[i].push((FasciaOraria=="0-3")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="3-6")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="6-9")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="9-12")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="12-15")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="15-18")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="18-21")?feriti:0);
			query_data_world.records[i].push((FasciaOraria=="21-24")?feriti:0);

			query_data_world.records[i].push((FasciaOraria=="0-3")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="3-6")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="6-9")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="9-12")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="12-15")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="15-18")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="18-21")?riservata:0);
			query_data_world.records[i].push((FasciaOraria=="21-24")?riservata:0);

			query_data_world.records[i].push((FasciaOraria=="0-3")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="3-6")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="6-9")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="9-12")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="12-15")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="15-18")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="18-21")?morti:0);
			query_data_world.records[i].push((FasciaOraria=="21-24")?morti:0);

			query_data_world.records[i].push((FasciaOraria=="0-3")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="3-6")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="6-9")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="9-12")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="12-15")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="15-18")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="18-21")?illesi:0);
			query_data_world.records[i].push((FasciaOraria=="21-24")?illesi:0);
		}

		query_data_world.fields.push({id:"F0-3",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F3-6",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F6-9",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F9-12",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F12-15",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F15-18",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F18-21",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"F21-24",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;

		query_data_world.fields.push({id:"R0-3",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R3-6",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R6-9",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R9-12",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R12-15",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R15-18",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R18-21",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"R21-24",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;

		query_data_world.fields.push({id:"M0-3",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M3-6",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M6-9",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M9-12",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M12-15",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M15-18",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M18-21",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"M21-24",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;

		query_data_world.fields.push({id:"I0-3",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I3-6",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I6-9",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I9-12",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I12-15",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I15-18",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I18-21",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;
		query_data_world.fields.push({id:"I21-24",typ:0,width:40,decimals:0});
		query_data_world.table.fields += 1;

	};

})();

// -----------------------------
// EOF
// -----------------------------

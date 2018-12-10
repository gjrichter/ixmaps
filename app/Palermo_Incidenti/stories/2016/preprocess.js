/**********************************************************************
 preprocess.js

$Comment: provides JavaScript to preprocess data for 'Palermo incidents'
$Source : preprocess.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: preprocess.js 8 2017-04-06 00:00:00Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: preprocess.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides preprocessing functions for datasets of 'Palermo incidents'
 * @author Guenter Richter guenter.richter@gmail.com
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

window.ixmaps = window.ixmaps || {};
window.ixmaps.totale_incidenti_georef = window.ixmaps.totale_incidenti_georef || {};

(function() {

	ixmaps.totale_incidenti_georef.after = function(dbtable) {

		dbtable.column("ORA").map(value => {
			return parseInt(value);
		});

		// get time index

		var indexOra = 0;
		var indexData = 0;
		var indexIncidenti = 0;
		for ( i in dbtable.fields )	{
			if ( dbtable.fields[i].id == "ORA" ){
				indexOra = i;
			}
			if ( dbtable.fields[i].id == "DATA" ){
				indexData = i;
			}
			if ( dbtable.fields[i].id == "Incidenti" ){
				indexIncidenti = i;
			}
		}

		// parse date and generate new fields

		for ( i in dbtable.records )	{

			var szTipo = dbtable.records[i][indexIncidenti];

			if ( szTipo == "M" || szTipo == "R" ){
				dbtable.records[i].push(2);
				dbtable.records[i].push(0);
			}else
			if ( szTipo == "F" ){
				dbtable.records[i].push(1);
				dbtable.records[i].push(0);
			}else{
				dbtable.records[i].push(0);
				dbtable.records[i].push(1);
			}

			var dateA = dbtable.records[i][indexData].split('/');
			var date = new Date(Number(dateA[2]),Number(dateA[1])-1,Number(dateA[0]));

			// add month: Mese
			var mese = date.getMonth()+1;
			dbtable.records[i].push(String(mese));

			// add day of week: GiornoDellaSettimana
			var giorno = date.getDay();
			dbtable.records[i].push(String(giorno));

			// add our: Ora
			var ora = Math.floor(dbtable.records[i][indexOra]);
			dbtable.records[i].push(String(ora));

			// add our range: FasciaOraria
			if ( ora >= 0 && ora < 3 ){
 				dbtable.records[i].push("0-3");
			}else
			if ( ora >= 3 && ora < 6 ){
 				dbtable.records[i].push("3-6");
			}else
			if ( ora >= 6 && ora < 9 ){
 				dbtable.records[i].push("6-9");
			}else
			if ( ora >= 9 && ora < 12 ){
 				dbtable.records[i].push("9-12");
			}else
			if ( ora >= 12 && ora < 15 ){
 				dbtable.records[i].push("12-15");
			}else
			if ( ora >= 15 && ora < 18 ){
 				dbtable.records[i].push("15-18");
			}else
			if ( ora >= 18 && ora < 21 ){
 				dbtable.records[i].push("18-21");
			}else{
 				dbtable.records[i].push("21-24");
			}
		}
		
		// add field "Feriti"
		dbtable.fields.push({id:"Feriti",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		// add field "Illesi"
		dbtable.fields.push({id:"Illesi",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		// add field "Mese"
		dbtable.fields.push({id:"Mese",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		// add field "GiornoDellaSettimana"
		dbtable.fields.push({id:"GiornoDellaSettimana",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		// add field "Ora"
		dbtable.fields.push({id:"Ora",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		// add field "FasciaOraria"
		dbtable.fields.push({id:"FasciaOraria",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;

		
		// next step 

		var index = 0;
		var indexIncidenti = 0;

		for ( i in dbtable.fields )	{
			if ( dbtable.fields[i].id == "FasciaOraria" ){
				index = i;
			}
			if ( dbtable.fields[i].id == "Incidenti" ){
				indexIncidenti = i;
			}
		}

		// parse date and generate new fields

		for ( i in dbtable.records )	{

			var FasciaOraria= dbtable.records[i][index];
			var szTipo		= dbtable.records[i][indexIncidenti];

			var feriti		= (szTipo == "F")?1:0;
			var riservata	= (szTipo == "R")?1:0;
			var morti		= (szTipo == "M")?1:0;
			var illesi		= (szTipo == "C")?1:0;

			dbtable.records[i].push((FasciaOraria=="0-3")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="3-6")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="6-9")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="9-12")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="12-15")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="15-18")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="18-21")?feriti:0);
			dbtable.records[i].push((FasciaOraria=="21-24")?feriti:0);

			dbtable.records[i].push((FasciaOraria=="0-3")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="3-6")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="6-9")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="9-12")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="12-15")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="15-18")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="18-21")?riservata:0);
			dbtable.records[i].push((FasciaOraria=="21-24")?riservata:0);

			dbtable.records[i].push((FasciaOraria=="0-3")?morti:0);
			dbtable.records[i].push((FasciaOraria=="3-6")?morti:0);
			dbtable.records[i].push((FasciaOraria=="6-9")?morti:0);
			dbtable.records[i].push((FasciaOraria=="9-12")?morti:0);
			dbtable.records[i].push((FasciaOraria=="12-15")?morti:0);
			dbtable.records[i].push((FasciaOraria=="15-18")?morti:0);
			dbtable.records[i].push((FasciaOraria=="18-21")?morti:0);
			dbtable.records[i].push((FasciaOraria=="21-24")?morti:0);

			dbtable.records[i].push((FasciaOraria=="0-3")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="3-6")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="6-9")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="9-12")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="12-15")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="15-18")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="18-21")?illesi:0);
			dbtable.records[i].push((FasciaOraria=="21-24")?illesi:0);
		}

		dbtable.fields.push({id:"F0-3",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F3-6",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F6-9",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F9-12",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F12-15",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F15-18",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F18-21",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"F21-24",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;

		dbtable.fields.push({id:"R0-3",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R3-6",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R6-9",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R9-12",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R12-15",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R15-18",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R18-21",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"R21-24",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;

		dbtable.fields.push({id:"M0-3",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M3-6",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M6-9",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M9-12",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M12-15",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M15-18",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M18-21",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"M21-24",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;

		dbtable.fields.push({id:"I0-3",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I3-6",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I6-9",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I9-12",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I12-15",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I15-18",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I18-21",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;
		dbtable.fields.push({id:"I21-24",typ:0,width:40,decimals:0});
		dbtable.table.fields += 1;

	};

})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

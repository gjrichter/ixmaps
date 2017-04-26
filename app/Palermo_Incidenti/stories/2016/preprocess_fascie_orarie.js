/**********************************************************************
 preprocess.js

$Comment: provides JavaScript to preprocess data for 'Rome incidents'
$Source : preprocess.js,v $

$InitialAuthor: guenter richter $
$InitialDate: $
$Author: guenter richter $
$Id: preprocess.js 8 2014-04-06 00:00:00Z Guenter Richter $

Copyright (c) Guenter Richter
$Log: preprocess.js,v $
**********************************************************************/

/** 
 * @fileoverview This file provides preprocessing functions for datasets of 'Rome incidents'
 * @author Guenter Richter guenter.richter@medienobjekte.de
 * @version 1.0 
 */

/**
 * define namespace ixmaps
 */

window.ixmaps = window.ixmaps || {};
window.ixmaps.json_totale_incidenti_2015_georef_ore = window.json_totale_incidenti_2015_georef_ore || {};

(function() {

	ixmaps.json_totale_incidenti_2015_georef_ore.after = function(script) {

		// get dateandtime index

		var index = 0;
		for ( i in json_totale_incidenti_2015_georef_ore.fields )	{
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "DataOraIncidente" ){
				index = i;
			}
		}

		// parse date and generate new fields

		for ( i in json_totale_incidenti_2015_georef_ore.records )	{

			var dateA = json_totale_incidenti_2015_georef_ore.records[i][index].substr(0,10).split('-');
			var timeA = json_totale_incidenti_2015_georef_ore.records[i][index].substr(10).split(':');
			var date = new Date(Number(dateA[2]),Number(dateA[1])-1,Number(dateA[0]),Number(timeA[0]));

			// add month: Mese
			var mese = date.getMonth()+1;
			json_totale_incidenti_2015_georef_ore.records[i].push(String(mese));

			// add day of week: GiornoDellaSettimana
			var giorno = date.getDay();
			json_totale_incidenti_2015_georef_ore.records[i].push(String(giorno));

			// add our: Ora
			var ora = date.getHours();
			json_totale_incidenti_2015_georef_ore.records[i].push(String(ora));

			// add our range: FasciaOraria
			if ( ora >= 0 && ora < 3 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("0-3");
			}else
			if ( ora >= 3 && ora < 6 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("3-6");
			}else
			if ( ora >= 6 && ora < 9 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("6-9");
			}else
			if ( ora >= 9 && ora < 12 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("9-12");
			}else
			if ( ora >= 12 && ora < 15 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("12-15");
			}else
			if ( ora >= 15 && ora < 18 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("15-18");
			}else
			if ( ora >= 18 && ora < 21 ){
 				json_totale_incidenti_2015_georef_ore.records[i].push("18-21");
			}else{
 				json_totale_incidenti_2015_georef_ore.records[i].push("21-24");
			}
		}

		// add field "Mese"
		json_totale_incidenti_2015_georef_ore.fields.push({id:"Mese",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		// add field "GiornoDellaSettimana"
		json_totale_incidenti_2015_georef_ore.fields.push({id:"GiornoDellaSettimana",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		// add field "Ora"
		json_totale_incidenti_2015_georef_ore.fields.push({id:"Ora",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		// add field "FasciaOraria"
		json_totale_incidenti_2015_georef_ore.fields.push({id:"FasciaOraria",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;

		// get day of week index

		console.log(json_totale_incidenti_2015_georef_ore);

		var index = 0;
		var indexFERITI = 0;
		var indexRISERVATA = 0;
		var indexMORTI = 0;
		var indexILLESI = 0;

		for ( i in json_totale_incidenti_2015_georef_ore.fields )	{
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "FasciaOraria" ){
				index = i;
			}
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "NUM_FERITI" ){
				indexFERITI = i;
			}
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "NUM_RISERVATA" ){
				indexRISERVATA = i;
			}
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "NUM_MORTI" ){
				indexMORTI = i;
			}
			if ( json_totale_incidenti_2015_georef_ore.fields[i].id == "NUM_ILLESI" ){
				indexILLESI = i;
			}
		}
		
		// parse date and generate new fields

		for ( i in json_totale_incidenti_2015_georef_ore.records )	{

			var FasciaOraria= json_totale_incidenti_2015_georef_ore.records[i][index];
			var feriti		= json_totale_incidenti_2015_georef_ore.records[i][indexFERITI];
			var riservata	= json_totale_incidenti_2015_georef_ore.records[i][indexRISERVATA];
			var morti		= json_totale_incidenti_2015_georef_ore.records[i][indexMORTI];
			var illesi		= json_totale_incidenti_2015_georef_ore.records[i][indexILLESI];

			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="0-3")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="3-6")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="6-9")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="9-12")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="12-15")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="15-18")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="18-21")?feriti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="21-24")?feriti:0);

			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="0-3")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="3-6")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="6-9")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="9-12")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="12-15")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="15-18")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="18-21")?riservata:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="21-24")?riservata:0);

			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="0-3")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="3-6")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="6-9")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="9-12")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="12-15")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="15-18")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="18-21")?morti:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="21-24")?morti:0);

			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="0-3")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="3-6")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="6-9")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="9-12")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="12-15")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="15-18")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="18-21")?illesi:0);
			json_totale_incidenti_2015_georef_ore.records[i].push((FasciaOraria=="21-24")?illesi:0);
		}

		
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F0-3",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F3-6",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F6-9",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F9-12",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F12-15",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F15-18",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F18-21",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"F21-24",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;

		json_totale_incidenti_2015_georef_ore.fields.push({id:"R0-3",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R3-6",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R6-9",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R9-12",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R12-15",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R15-18",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R18-21",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"R21-24",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;

		json_totale_incidenti_2015_georef_ore.fields.push({id:"M0-3",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M3-6",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M6-9",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M9-12",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M12-15",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M15-18",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M18-21",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"M21-24",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;

		json_totale_incidenti_2015_georef_ore.fields.push({id:"I0-3",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I3-6",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I6-9",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I9-12",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I12-15",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I15-18",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I18-21",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;
		json_totale_incidenti_2015_georef_ore.fields.push({id:"I21-24",typ:0,width:40,decimals:0});
		json_totale_incidenti_2015_georef_ore.table.fields += 1;

		console.log(json_totale_incidenti_2015_georef_ore);
	};



})();

/**
 * end of namespace
 */

// -----------------------------
// EOF
// -----------------------------

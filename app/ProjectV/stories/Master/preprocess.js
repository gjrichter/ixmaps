
	// --------------------------------------------------------------
	// preprocess data: Firenze/incidenti_sap_2011_2015.csv
	// --------------------------------------------------------------

	window.ixmaps = window.ixmaps || {};
	window.ixmaps.themeDataObj = window.ixmaps.themeDataObj || {};
	(function() {

		/**
		 * map time from type 10.30, 18.20 to groups of 3 hours like 9-12, 18-21
		 * @param ora time stamp like "10.34"
		 * @return houre range like "9-12"
		 */

		__toFasciaOraria = function(ora){

			ora = parseFloat(ora);

			if ( ora >= 0 && ora < 3 ){
 				return("0-3");
			}else
			if ( ora >= 3 && ora < 6 ){
 				return("3-6");
			}else
			if ( ora >= 6 && ora < 9 ){
 				return("6-9");
			}else
			if ( ora >= 9 && ora < 12 ){
 				return("9-12");
			}else
			if ( ora >= 12 && ora < 15 ){
 				return("12-15");
			}else
			if ( ora >= 15 && ora < 18 ){
 				return("15-18");
			}else
			if ( ora >= 18 && ora < 21 ){
 				return("18-21");
			}else{
 				return("21-24");
			}
		};

		/**
		 * preprocess data
		 * @param data the original data object
		 * @return the modifies data
		 */
		ixmaps.themeDataObj.process = function(data) { 

			var table = new Data.Table(data);

			table.column("ORA").map(__toFasciaOraria);

			return table;

		}
	})();



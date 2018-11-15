/**
 * define namespace ixmaps
 */

(function() {

	ixmaps.totale_incidenti_georef = ixmaps.totale_incidenti_georef || {};
	ixmaps.totale_incidenti_georef.process = function(dbTable){

		dbTable.addColumn({'source':'DATA','destination':'GiornoDellaSettimana'},function(value){
			var dateA = value.split('/');
			var date = new Date(Number(dateA[2]),Number(dateA[1])-1,Number(dateA[0]));
			return String(date.getDay());
		});
	};

/**
 * end of namespace
 */

})();

// -----------------------------
// EOF
// -----------------------------

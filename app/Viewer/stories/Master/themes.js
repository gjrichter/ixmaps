	

	// -----------------------------------------------------------
	// T H E M E S 
	// -----------------------------------------------------------

	var theme_StatoAvanz = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "StatoAvanz",
		"field100": "",
		"style": {
			"type": "CHART|BUBBLE|MULTIQUAD|SIZE|EXACT|VALUES|EXACT|SUM|FORCE",
			"colorscheme": [
				"#00ff00",
				"orange",
				"#0044dd",
				"cyan",
				"lightgrey",
				"red"],
			"shadow": "false",
			"datacache": "true",
			"showdata":"true",
			"values": [
				"Lavori ultimati",
				"Lavori in corso",
				"Appalto lavori",
				"Approvazione progetto",
				"Progettazione",
				"Da rimodulare"],
			"units": "",
			"normalsizevalue": "1",
			"scale": "1",
			"sizefield": "Numero_Int",
			"valuefield": "Numero_Int",
			"titlefield": "CodiceProg",
			"valuedecimals":"0",
			"linecolor": "black",
			"linewidth": "1",
			"fillopacity": "0.66",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"evidence":"isolate_gray",
			"title": "Interventi ANAS"
			}
		}
	)};

	var theme_Provincia = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "Provincia",
		"field100": "",
		"style": {
			"type": "CHART|BUBBLE|MULTIQUAD|SIZE|EXACT|VALUES|EXACT|SUM|FORCE",
			"colorscheme": [
				"31",
				"fruit"],
			"shadow": "false",
			"datacache": "true",
			"showdata":"true",
			"units": "",
			"normalsizevalue": "1",
			"scale": "1",
			"sizefield": "Numero_Int",
			"valuefield": "Numero_Int",
			"titlefield": "CodiceProg",
			"valuedecimals":"0",
			"linecolor": "black",
			"linewidth": "1",
			"fillopacity": "0.66",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"title": "Interventi ANAS"
			}
		}
	)};

	var theme_EnteAttuat = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "EnteAttuat",
		"field100": "",
		"style": {
			"type": "CHART|BUBBLE|MULTIQUAD|SIZE|EXACT|VALUES|EXACT|SUM|FORCE",
			"colorscheme": [
				"31",
				"fruit"],
			"shadow": "false",
			"datacache": "true",
			"showdata":"true",
			"units": "",
			"normalsizevalue": "1",
			"scale": "1",
			"sizefield": "Numero_Int",
			"valuefield": "Numero_Int",
			"titlefield": "CodiceProg",
			"valuedecimals":"0",
			"linecolor": "black",
			"linewidth": "1",
			"fillopacity": "0.66",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"title": "Interventi ANAS"
			}
		}
	)};

	var theme_Gestore = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "Gestore",
		"field100": "",
		"style": {
			"type": "CHART|BUBBLE|MULTIQUAD|SIZE|EXACT|VALUES|EXACT|SUM|FORCE",
			"colorscheme": [
				"31",
				"fruit"],
			"shadow": "false",
			"datacache": "true",
			"showdata":"true",
			"units": "",
			"normalsizevalue": "1",
			"scale": "1",
			"sizefield": "Numero_Int",
			"valuefield": "Numero_Int",
			"titlefield": "CodiceProg",
			"valuedecimals":"0",
			"linecolor": "black",
			"linewidth": "1",
			"fillopacity": "0.66",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"title": "Interventi ANAS"
			}
		}
	)};

	var theme_sum_provincia = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "StatoAvanz",
		"field100": "",
		"style": {
			"type": "CHART|PIE|DONUT|VALUES|SIZE|EXACT|AGGREGATE|SUM",
			"colorscheme": [
				"#00ff00",
				"orange",
				"#0044dd",
				"cyan",
				"lightgrey",
				"red"],
			"fillopacity": "1",
			"shadow": "true",
			"dbtable": "genericTable",
			"datacache": "true",
			"showdata": "true",
			"values": [
				"Lavori ultimati",
				"Lavori in corso",
				"Appalto lavori",
				"Approvazione progetto",
				"Progettazione",
				"Da rimodulare"],
			"units": "",
			"normalsizevalue": "100",
			"scale": "7",
			"valuefield": "Numero_Int",
			"labelfield": "Provincia",
			"sizefield": "Numero_Int",
			"linecolor": "black",
			"linewidth": "1",
			"valuedecimals": "0",
			"aggregationfield": "Provincia",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"evidence": "isolate_gray",
			"title": "Interventi ANAS"
			}
		}
	)};

	var theme_waffle = function(){return(
		{
		"layer": "Progetti_P_B100",
		"field": "StatoAvanz",
		"field100": "",
		"style": {
			"type": "CHART|WAFFLE|SORT|GRIDSIZE|BOX|AGGREGATE|RECT|EXACT|SUM",
			"colorscheme": [
				"RGB(0,255,0)",
				"orange",
				"RGB(0,68,221)",
				"cyan",
				"lightgrey",
				"red"],
			"fillopacity": "1",
			"shadow": "false",
			"dbtable": "genericTable",
			"datacache": "true",
			"showdata": "true",
			"child": "true",
			"symbols": [
				"circle"],
			"values": [
				"Lavori ultimati",
				"Lavori in corso",
				"Appalto lavori",
				"Approvazione progetto",
				"Progettazione",
				"Da rimodulare"],
			"units": "",
			"normalsizevalue": "1",
			"scale": "1",
			"valuefield": "Numero_Int",
			"sizefield": "Numero_Int",
			"linecolor": "black",
			"linewidth": "1",
			"bordercolor": "red",
			"boxcolor": "black",
			"boxopacity": "0.01",
			"titlefield": "CodiceProg",
			"valuedecimals": "0",
			"gridwidthpx": "106.98638061375001",
			"dominantfilter": "min",
			"dominantdfilter": "0",
			"evidence": "isolate_gray",
			"title": "Interventi ANAS"
			}
		}
	)};

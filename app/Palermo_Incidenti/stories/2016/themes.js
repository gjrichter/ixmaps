 
	// -----------------------------------------------------------
	// T H E M E S 
	// -----------------------------------------------------------

	var num_totale =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|BUBBLE|EXACT",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "1",
		"title": "Incidenti Palermo 2016",
		}
	};
	var num_totale_glow =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|BUBBLE|GLOW|EXACT",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "0.6",
		"title": "Incidenti Palermo 2016",
		}
	};
	var num_totale_pie_centervalue =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|PIE|CENTERVALUE|EXACT|AGGREGATE|RECT|RELOCATE|SIZE|SUM",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "2",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidth": "15px",
		"title": "Incidenti Palermo 2016",
		}
	};
	var num_totale_multibubble =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|STAR|SORT|RANDOM|VALUES|AGGREGATE|RELOCATE|EXACT|SUM",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"opacity": "0.66",
		"fillopacity": "0.6534",
		"shadow": "true",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "1.5",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidthpx": "15",
		"title": "Incidenti Palermo 2016",
		}
	};
	var num_totale_multibubble_glow =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|STAR|SORT|RANDOM|VALUES|GLOW|AGGREGATE|RELOCATE|EXACT|SUM",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "0.646866",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidthpx": "15",
		"title": "Incidenti Palermo 2016",
		}
	}

	var num_totale_multibubble_center_glow =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|EXACT|SEQUENCE|CENTER|SORT|UP|RINGS|GLOW|AGGREGATE|RECT|SUM|SIZE",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"opacity": "0.66",
		"fillopacity": "1",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "0.7",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidth": "10px",
		"title": "Incidenti Palermo 2016",
		}
	}

	var num_totale_multibubble_center_linear_glow =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|GLOW|EXACT|SEQUENCE|CENTER|SORT|UP|LINEAR|RINGS|AGGREGATE|RECT|RELOCATE|SUM|SIZE",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"opacity": "0.66",
		"fillopacity": "1",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "0.9227446944279201",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidth": "10px",
		"title": "Incidenti Palermo 2016",
		"description":"lineare - il radius dei cerchi corrisponde al n° di incidenti"
		}
	}

	var giorno_della_settimana_curve =  
	{
	"layer": "Sagoma",
	"field": "GiornoDellaSettimana",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|PLOT|LINES|BOX|GRID|AREA|EXACT|FIXSIZE|SIZELOG|GRIDSIZE|ZEROISVALUE|NEGATIVEISVALUE|AGGREGATE|RECT|SUM|CLEAR|FORCE",
		"colorscheme": [
			"#0079C6",
			"#0079C6",
			"#0079C6",
			"#0079C6",
			"#0079C6",
			"RGB(237,124,137)",
			"RGB(237,124,137)"],
		"evidence": "isolate",
		"shadow": "true",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"values": [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"0"],
		"units": "",
		"units": "",
		"title": "Giorno della settimana",
		"sizevalueunits": "",
		"label": [
			"Lunedì",
			"Martedì",
			"Mercoledì",
			"Giovedì",
			"Venerdì",
			"Sabato",
			"Domenica"],
		"xaxis": [
			"L",
			"M",
			"M",
			"G",
			"V",
			"S",
			"D"],
		"scale": "1",
		"minvalue": "0",
		"normalsizevalue":"20",
		"sizefield": "aggregation",
		"boxopacity": "0.1",
		"gridwidthpx": "100",
		"dominantfilter": "mean",
		"dominantdfilter": "0",
		"title": "Incidenti Palermo 2016",
		"snippet": "Incidenti aggregati per griglia geografica e per giorno della settimana"
		}
	};

	var mese_curve =  
	{
	"layer": "Sagoma",
	"field": "Mese",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|PLOT|LINES|BOX|GRID|AREA|EXACT|FIXSIZE|SIZELOG|GRIDSIZE|ZEROISVALUE|NEGATIVEISVALUE|AGGREGATE|RECT|SUM|CLEAR|FORCE",
		"colorscheme": [
			"RGB(193,218,231)",
			"RGB(193,218,231)",
			"RGB(193,218,231)",
			"RGB(184,217,97)",
			"RGB(184,217,97)",
			"RGB(184,217,97)",
			"RGB(217,84,97)",
			"RGB(217,84,97)",
			"RGB(217,84,97)",
			"RGB(217,184,97)",
			"RGB(217,184,97)",
			"RGB(217,184,97)"],
		"shadow": "true",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"rangecentervalue": "8",
		"symbols": [
			"circle"],
		"values": [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"10",
			"11",
			"12"],
		"label": [
			"Gennaio",
			"Febbraio",
			"Marzo",
			"Aprile",
			"Maggio",
			"Giunio",
			"Luglio",
			"Agosto",
			"Settembre",
			"Ottobre",
			"Novembre",
			"Dicembre"],
		"xaxis": [
			"G",
			"F",
			"M",
			"A",
			"M",
			"G",
			"L",
			"A",
			"S",
			"O",
			"N",
			"D"],
		"units": "",
		"minvalue": "0",
		"scale": "1",
		"normalsizevalue":"20",
		"rangescale":"1.6",
		"sizefield": "aggregation",
		"boxopacity": "0.1",
		"gridwidthpx": "100",
		"dominantfilter": "mean",
		"dominantdfilter": "0",
		"title": "Incidenti Palermo 2016",
		"snippet": "Incidenti aggregati per griglia geografica e per mese"
		}
	};

	var fasce_orarie_curve = 
	{
	"layer": "Sagoma",
	"field": "FasciaOraria",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|PLOT|LINES|BOX|GRID|AREA|EXACT|FIXSIZE|SIZELOG|GRIDSIZE|ZEROISVALUE|NEGATIVEISVALUE|AGGREGATE|RECT|SUM|CLEAR|FORCE",
		"colorscheme": [
			"#5566dd",
			"#5566dd",
			"#5566dd",
			"#bbccff",
			"#bbccff",
			"#bbccff",
			"#5566dd",
			"#5566dd"],
		"shadow": "true",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"0-3",
			"3-6",
			"6-9",
			"9-12",
			"12-15",
			"15-18",
			"18-21",
			"21-24"],
		"xaxis": [
			"0-3",
			"3-6",
			"6-9",
			"9-12",
			"12-15",
			"15-18",
			"18-21",
			"21-24"],
		"units": "",
		"minvalue": "0",
		"normalsizevalue": "256",
		"scale": "1",
		"rangescale":"1.1",
		"sizefield": "aggregation",
		"boxopacity": "0.1",
		"gridwidthpx": "100",
		"dominantfilter": "mean",
		"dominantdfilter": "0",
		"title": "Incidenti Palermo 2016",
		"snippet": "Incidenti aggregati per griglia geografica e per fasce orarie di 3 ore"
		}
	};

	var fasce_orarie_curve_all = 
{
	"layer": "Sagoma",
	"field": "I0-3|F0-3|R0-3|M0-3|I3-6|F3-6|R3-6|M3-6|I6-9|F6-9|R6-9|M6-9|I9-12|F9-12|R9-12|M9-12|I12-15|F12-15|R12-15|M12-15|I15-18|F15-18|R15-18|M15-18|I18-21|F18-21|R18-21|M18-21|I21-24|F21-24|R21-24|M21-24",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|SEQUENCE|PLOT|RAW|LINES|NOSORT|BOX|GRID|FIXSIZE|TITLE|AGGREGATE|RECT|AUTOSIZE|SUM|CLEAR|ZEROISVALUE|FORCE",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(153,51,102)",
			"RGB(3,3,3)"],
		"gridx":"4",
		"shadow": "true",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"symbols": [
			"circle"],
		"values": [
			"0-3",
			"3-6",
			"6-9",
			"9-12",
			"12-15",
			"15-18",
			"18-21",
			"21-24"],
		"xaxis": [
			"0-3",
			"3-6",
			"6-9",
			"9-12",
			"12-15",
			"15-18",
			"18-21",
			"21-24"],
		"units": "",
		"normalsizevalue": "256",
		"rangescale":"1.1",
		"scale": "1",
		"minvalue": "0",
		"sizefield": "aggregation",
		"boxopacity": "0.1",
		"gridwidthpx": "100",
		"dominantfilter": "mean",
		"dominantdfilter": "0",
		"title": "Incidenti Palermo 2016",
		"snippet": "Incidenti aggregati per griglia geografica e per fasce orarie di 3 ore"
		}
	};

	var num_feriti_fraction_px_dyn =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "Illesi",
	"style": {
		"type": "CHART|SYMBOL|ZEROISVALUE|QUANTILE|NEGATIVEISVALUE|SUM|AGGREGATE|RECT|FRACTION|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"10",
			"green",
			"red",
			"warm"],
		"fillopacity": "0.5",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"circle"],
		"values": [],
		"units": "",
		"normalsizevalue": "0.1",
		"scale": "1",
		"dopacitypow": "0.5",
		"dopacityscale": "170",
		"linecolor": "none",
		"valuedecimals": "2",
		"aggregationscale": [
			"1:1",
			"50px",
			"1:100000",
			"20px",
			"1:1000000",
			"10px"],
		"minaggregation": "auto",
		"title": "Indice sintetico di pericolosità",
		"snippet": "n° degli Incidenti con feriti/morti / n° degli Incidenti con solo danni materiali normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	}
	var test_pie =  
	{
	"layer": "generic",
	"field": "Incidenti",
	"field100": "",
	"style": {
		"type": "CHART|PIE|CENTERVALUE|EXACT|ZEROISVALUE|NEGATIVEISVALUE|AGGREGATE|RECT|SIZE|SUM",
		"colorscheme": [
			"RGB(77,184,73)",
			"RGB(255,92,92)",
			"RGB(3,3,3)",
			"RGB(153,51,102)"],
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"values": [
			"C",
			"F",
			"M",
			"R"],
		"label": [
			"cose",
			"feriti",
			"mortale",
			"riserva"],
		"units": "",
		"scale": "6.75",
		"sizefield": "aggregation",
		"centerpart": "max",
		"gridwidthpx": "250",
		"title": "Incidenti Palermo 2016"
		}
	}
	var test_fraction =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "$item$",
	"style": {
		"type": "CHART|SYMBOL|ZEROISVALUE|QUANTILE|NEGATIVEISVALUE|SUM|AGGREGATE|RECT|RELOCATE|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"10",
			"green",
			"red",
			"warm"],
		"fillopacity": "0.5",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"circle"],
		"values": [],
		"units": "",
		"normalsizevalue": "0.1",
		"scale": "1",
		"linecolor": "none",
		"valuedecimals": "2",
		"aggregationscale": [
			"1:100",
			"100px",
			"1:10000",
			"50px",
			"1:100000",
			"25"],
		"minaggregation": "auto",
		"title": "Indice sintetico di pericolosità",
		"snippet": "n° degli Incidenti con feriti/morti / n° degli Incidenti con solo danni materiali normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	};

	var test_feriti =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|ZEROISVALUE|QUANTILE|NEGATIVEISVALUE|SUM|AGGREGATE|RECT|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"red"],
		"fillopacity": "0.5",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"circle"],
		"values": [],
		"units": "",
		"scale": "1",
		"gridwidthpx": "250",
		"title": "Indice sintetico di incidentalità",
		"snippet": "n° degli Incidenti con feriti/morti / n° degli Incidenti con solo danni materiali normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	}
	var test_feriti_relativi_monochrome =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "$item$",
	"style": {
		"type": "CHART|SYMBOL|QUANTILE|ZEROISVALUE|NEGATIVEISVALUE|SUM|AGGREGATE|GAP|DOPACITY|GRIDSIZE|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"1",
			"#ffeeee",
			"#dd0000",
			"dynamic",
			"cold"],
		"fillopacity": "0.4900500000000001",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"hexagon"],
		"values": [],
		"units": "",
		"normalsizevalue": "0.1",
		"scale": "0.9801",
		"dopacitypow": "0.5",
		"dopacityscale": "5",
		"linecolor": "none",
		"valuedecimals": "2",
		"gridwidthpx": "50",
		"textcolor":"black",
		"minaggregation": "auto",
		"title": "Indice sintetico di pericolosità relativa",
		"snippet": "n° degli Incidenti con feriti/morti per n° degli Incidenti, normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	};
	var test_feriti_monochrome_old =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|QUANTILE|ZEROISVALUE|NEGATIVEISVALUE|SUM|AGGREGATE|GAP|DOPACITY|GRIDSIZE|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"1",
			"#ffeeee",
			"#dd0000",
			"dynamic",
			"cold"],
		"fillopacity": "0.4900500000000001",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"hexagon"],
		"values": [],
		"units": "",
		"normalsizevalue": "0.1",
		"scale": "0.9801",
		"dopacitypow": "0.5",
		"dopacityscale": "5",
		"linecolor": "none",
		"valuedecimals": "2",
		"gridwidthpx": "50",
		"textcolor":"black",
		"minaggregation": "auto",
		"title": "Indice sintetico di pericolosità",
		"snippet": "n° degli Incidenti con feriti/morti per area, normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	};
	var test_feriti_monochrome =  
	{
	"layer": "generic",
	"field": "$item$",
	"field100": "",
	"style": {
		"type": "CHART|SYMBOL|QUANTILE|ZEROISVALUE|NEGATIVEISVALUE|SUM|AGGREGATE|GAP|DOPACITY|GRIDSIZE|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"1",
			"#ffeeee",
			"#dd0000",
			"dynamic",
			"cold"],
		"fillopacity": "0.4900500000000001",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"hexagon"],
		"values": [],
		"units": "",
		"normalsizevalue": "0.1",
		"scale": "0.9801",
		"dopacitypow": "0.5",
		"dopacityscale": "5",
		"linecolor": "none",
		"valuedecimals": "2",
		"gridwidthpx": "50",
		"textcolor":"black",
		"minaggregation": "auto",
		"title": "Indice sintetico di incidentalità",
		"snippet": "n° degli Incidenti per area, normalizzato (massimo = 1). Morti e riservati hanno più peso."
		}
	};

	var num_feriti_totale_circlebin_px_dyn =  
	{
	"layer": "generic",
	"field": "Feriti",
	"field100": "$item$",
	"style": {
		"type": "CHART|SYMBOL|GLOW|ZEROISVALUE|QUANTILE|NEGATIVEISVALUE|AGGREGATE|RELOCATE|FRACTION|NORMALIZE|VALUES|DTEXT|VALUEBACKGROUND",
		"colorscheme": [
			"10",
			"green",
			"red",
			"warm"],
		"fillopacity": "1",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"circle"],
		"values": [],
		"units": "",
		"normalsizevalue": "1",
		"scale": "1.8454893888558401",
		"dopacitypow": "0.5",
		"dopacityscale": "170",
		"linecolor": "none",
		"valuedecimals": "2",
		"valuesupper":"1:10000",
		"aggregationscale": [
			"1:100",
			"100px",
			"1:10000",
			"50px",
			"1:100000",
			"15"],
		"minaggregation": "auto",
		"title": "Numero feriti per incidente",
		"snippet": "Incidenti luglio - dicembre 2016"
		}
	}

	var num_feriti_totale_hexbin_heat_px_dyn =  
	{	
	"layer": "generic",
	"field": "Feriti",
	"field100": "$item$",
	"style": {
		"type": "CHART|SYMBOL|ZEROISVALUE|NEGATIVEISVALUE|AGGREGATE|FRACTION|NORMALIZE|DTEXT|GRIDSIZE|GAP|VALUEBACKGROUND",
		"colorscheme": [
			"10",
			"#6E4AF6",
			"#F9FA84",
			"3colors",
			"#F52926"],
		"fillopacity": "1",
		"shadow": "false",
		"dbtable": "totale_incidenti_georef",
		"dbtableUrl": "../../data/Palermo/_20032017144826.csv",
		"dbtableType": "csv",
		"dbtableExt": "../../app/Palermo_Incidenti/stories/2016/preprocess.js",
		"datacache": "true",
		"itemfield": "lat|lon",
		"lookupfield": "lat|lon",
		"showdata": "true",
		"symbols": [
			"hexagon"],
		"values": [],
		"units": "",
		"normalsizevalue": "1.1111111111111112",
		"scale": "2.4291836046637796",
		"dopacitypow": "0.5",
		"dopacityscale": "170",
		"linecolor": "none",
		"valuedecimals": "2",
		"gridwidthpx": "7.878976637476708",
		"minaggregation": "auto",
		"title": "Numero feriti per incidente",
		"snippet": "Incidenti luglio - dicembre 2016"
		}
	};

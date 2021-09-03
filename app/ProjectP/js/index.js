$(function() {

	var myNumber = function(value){
		return parseFloat(value);
	}

	// get Rifiuti 2015 from Lecce Open Data

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata2 = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(data){

	  var set1  = data.column("Percentuale differenziata").values().map(myNumber);
	  var set2  = [70,70,70,70,70,70,70,70,70,70,70,70];
	  var label = data.column("Mesi").values();

	  var ctx, data, myLineChart, options;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#jumbotron-line-3-chart').get(0).getContext('2d');
	  options = {

		scales: {
            yAxes: [{
                ticks: {
                    max: 100
                }
            }]
        },

		showScale: false,
		scaleShowGridLines: false,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 0,
		scaleShowHorizontalLines: false,
		scaleShowVerticalLines: false,
		bezierCurve: false,
		bezierCurveTension: 0.4,
		pointDot: false,
		pointDotRadius: 0,
		pointDotStrokeWidth: 2,
		pointHitDetectionRadius: 20,
		datasetStroke: true,
		datasetStrokeWidth: 4,
		datasetFill: true,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	  };
	  options.type = "line";
	  options.data = {
		labels: label,
		datasets: [
		  {
			label: "My Second dataset",
			backgroundColor: "rgba(26, 188, 156,0.2)",
			borderColor: "#1ABC9C",
			pointDot: false,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set1
		  },
		  {
			label: "target",
			backgroundColor: "rgba(34, 240, 170,0.2)",
			borderColor: "#22F0A7",
			pointColor: "#22F0A7",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#22F0A7",
			borderDash:[5, 15],
			data: set2
		  }
		]
	  };
	  myLineChart = new Chart(ctx).Line(data, options);
	});
});

$(function() {

	var myNumber = function(value){
		return parseFloat(value);
	}

	// get Rifiuti 2015 from Lecce Open Data

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata2 = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(data){

	  var set1  = data.column("Percentuale differenziata").values().map(myNumber);
	  var label = data.column("Mesi").values();

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#jumbotron-line-2-chart').get(0).getContext('2d');
	  options = {
		showScale: false,
		scaleShowGridLines: false,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: true,
		bezierCurve: false,
		bezierCurveTension: 0.4,
		pointDot: false,
		pointDotRadius: 4,
		pointDotStrokeWidth: 1,
		pointHitDetectionRadius: 20,
		datasetStroke: true,
		datasetStrokeWidth: 4,
		datasetFill: true,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	  };
	  options.type = "line";
	  options.data = {
		labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Jun', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
		datasets: [
		  {
			label: "Percentuale differenziata",
			backgroundColor: "rgba(26, 188, 156,0.2)",
			borderColor: "#1ABC9C",
			pointDot: false,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set1
		  }
		]
	  };
	  options.options = {
		  scales : {
			xAxes: [{
				scaleLabel: {
					display: false,
					labelString: 'Day'
				}
			}],
			yAxes: [{
				ticks: {
					min: 0,
				},
				scaleLabel: {
					labelString: 'Value'
				}
			}]
		  }
		};


	  myBarChart = new Chart(ctx, options);

	});

});

$(function() {

	myNumber = function(value){
		return value.replace(/\./g,"");
	}

	// get Rifiuti 2015 from Lecce Open Data

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata2 = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(data){

		var set1  = data.column("Totale RSU in  Kg ").values().map(myNumber);
		var set2  = data.column("Totale differenziata in Kg").values().map(myNumber);
		var label = data.column("Mesi").values();

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#jumbotron-bar-chart').get(0).getContext('2d');
	  options = {
		showScale: false,
		scaleShowGridLines: false,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: true,
		bezierCurve: false,
		bezierCurveTension: 0.4,
		pointDot: false,
		pointDotRadius: 4,
		pointDotStrokeWidth: 1,
		pointHitDetectionRadius: 20,
		datasetStroke: true,
		datasetStrokeWidth: 4,
		datasetFill: true,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	  };
	  options.type = "line";
	  options.data = {
		labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Jun', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
		datasets: [
		  {
			label: "Totale RSU in  Kg",
			backgroundColor: "rgba(188, 188, 188,0.2)",
			borderColor: "#9C9C9C",
			pointDot: false,
			pointColor: "#9C9C9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#9C9C9C",
			data: set1
		  }, {
			label: "Totale differenziata in Kg",
			backgroundColor: "rgba(26, 188, 156,0.2)",
			borderColor: "#1ABC9C",
			pointDot: false,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set2
		  }
		]
	  };
	  options.options = {
		  scales : {
			xAxes: [{
				scaleLabel: {
					display: false,
					labelString: 'Day'
				}
			}],
			yAxes: [{
				ticks: {
					min: 0,
				},
				scaleLabel: {
					labelString: 'Value'
				}
			}]
		  }
		};


	  myBarChart = new Chart(ctx, options);

	});

});


$(function() {

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/8O6bQ6";
	var mydata2 = Data.feed("Rifiuti_2015-particolari",{"source":szUrl,"type":"csv"}).load(function(data){

	  var pivot = mydata2.pivot({ "lead":	'MESE',
								  "keep":	['COMUNE'],
								  "cols":	'TIPOLOGIA DI RIFIUTI ',
								  "value":  "Q.TA (KG)" 
								});
	  var set1  = pivot.column("CARTA E CARTONI").values();
	  var set2  = pivot.column("RIFIUTI DI GIARDINI E PARCHI").values();
	  var set3  = pivot.column("FRAZIONE ORGANICA UMIDA").values();

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#bar-chart-rifiuti-particolari-1').get(0).getContext('2d');

	  options = {
		scaleBeginAtZero: true,
		scaleShowGridLines: true,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		barShowStroke: true,
		barStrokeWidth: 1,
		barValueSpacing: 5,
		barDatasetSpacing: 3,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	  };
	  options.type = "bar";
	  options.data = {
		labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Jun', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
		datasets: [
		  {
			label: "Carta e cartoni",
			backgroundColor: "rgba(250,240,0,0.6)",
			borderColor: "rgba(210,200,0,1)",
			borderWidth: 1,
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set1
		  }, {
			label: "Rifiuti di giardine e parchi",
			backgroundColor: "rgba(10, 147, 40,0.6)",
			borderColor: "#c287F0",
			borderWidth: 1,
			pointColor: "#a2A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#a2A8F0",
			data: set2
		  }, {
			label: "Umido",
			backgroundColor: "rgba(240, 167, 40,0.6)",
			borderColor: "#c287F0",
			borderWidth: 1,
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set3
		  }
		]
	  };
	  options.options = {
		  scales : {
			xAxes: [{
				stacked: true
			}],
			yAxes: [{
				stacked: true
			}]
		  }
		};
	  myBarChart = new Chart(ctx, options);
	});
});

$(function() {
	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/8O6bQ6";
	var mydata2 = Data.feed("Rifiuti_2015-particolari",{"source":szUrl,"type":"csv"}).load(function(data){

	 var pivot = mydata2.pivot({"lead":	'MESE',
								"keep":	['COMUNE'],
								"cols":	'TIPOLOGIA DI RIFIUTI ',
								"value":  "Q.TA (KG)" 
								});
	  var set1  = pivot.column("VETRO").values();
	  var set2  = pivot.column("METALLO").values();
	  var set3  = pivot.column("PLASTICA").values();
	  var set4  = pivot.column("RACCOLTA MULTIMATERIALE").values();

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#bar-chart-rifiuti-particolari-2').get(0).getContext('2d');
	  options = {
		scaleBeginAtZero: true,
		scaleShowGridLines: true,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: false,
		barShowStroke: true,
		barStrokeWidth: 1,
		barValueSpacing: 5,
		barDatasetSpacing: 3,
		legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	  };
	  options.type = "bar";
	  options.data = {
		labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Jun', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
		datasets: [
		  {
			label: "Vetro",
			backgroundColor: "rgba(26, 188, 156,0.6)",
			borderColor: "#1ABC9C",
			borderWidth: 1,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set1
		  }, {
			label: "Metallo",
			backgroundColor: "rgba(34, 167, 240,0.6)",
			borderColor: "#22A7F0",
			borderWidth: 1,
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#22A7F0",
			data: set2
		  }, {
			label: "Plastica",
			backgroundColor: "rgba(240,240,0,0.6)",
			borderColor: "#afaf88",
			borderWidth: 1,
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set3
		  }, {
			label: "Multimateriale",
			backgroundColor: "rgba(0,100,240,0.6)",
			borderColor: "#000088",
			borderWidth: 1,
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set4
		  }
		]
	  };
	  options.options = {
		  scales : {
			xAxes: [{
				stacked: true
			}],
			yAxes: [{
				stacked: true
			}]
		  }
		};
	  myBarChart = new Chart(ctx, options);
	});
});



$(function() {

	
  var data = [];
  data["lecce-actual-air-quality"] = {
    "Valore_Pm10":"122,3"
  }


  // -------------------------	
  // air quality data 	
  // -------------------------
  
  $(".data-dynamic").each( function( index ) {
    var txt = $(this).attr("data-path");
    if (txt) {
      var textA = txt.split(".");
      if (textA[0] == "data" ){
        //$(this).text(data[textA[1]][textA[2]]);
      }
    }
	});

    // -------------------------	
    // open data lece 	
    // -------------------------
	/**
	var szUrl = "http://dati.comune.lecce.it/dataset/a93fc559-c151-4e74-86de-a50f301e49bb/resource/d9ab9f72-7bc8-483e-a50d-a7794fe6e03a/download/datiariagiorno28092016.csv";
	mydata = Data.feed("lecce-actual-air-quality",{"source":szUrl,"type":"csv"}).load(function(data){
		console.log(data);
		console.log(data.dbtable.records[0][1]);

		$(".data-dynamic").each( function( index ) {
			var txt = $(this).attr("data-path");
			if (txt) {
				var textA = txt.split("::");
				var colum = textA[2].split('[')[0];
				if (textA[0] == "data" ){
					console.log(textA[1]);
					if ( textA[1] == mydata.id ){
						for ( i in mydata.dbtable.fields ){
							if ( mydata.dbtable.fields[i].id == colum ){
								$(this).text(mydata.dbtable.records[0][i]);
							}
						}
					}
				}
			}
		});
	});
	**/
    // ------------------------------	
    // actual data directly from ARPA 	
    // ------------------------------

	var parse = function(num){
		return Number(num.replace(",","."));
	};

	var __getArrow = function(last,before){
		return (last == before)?"fa-arrow-right":((last < before)?"fa-arrow-down":"fa-arrow-up");
	}
	
	var szExt = "../js/data/dbbroker.js";
	mydata2 = Data.feed("ActualAirQuality",{"ext":szExt,"type":"ext"}).load(function(data){

		$("#airquality-splash").hide();

		var stazione = "Libertini";
		selectionNO2  = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS NO2");
		selectionPM10 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS PM10");
		selectionPM25 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS PM2.5");
		selectionC6H6 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS C6H6");

		var setPM10 = selectionPM10.column("Valore ").values().map(parse);
		var setPM25 = selectionPM25.column("Valore ").values().map(parse);
		var setNO2  = selectionNO2.column("Valore ").values().map(parse);
		var setC6H6  = selectionC6H6.column("Valore ").values().map(parse);

		var date = selectionNO2.column("DataRilevazione ").values();
		
		var label = [];
		for ( var i=0; i<date.length; i++ ){
			d = new Date(date[i]);
			var x = d.toDateString().split(" ")[2] + "." + d.toDateString().split(" ")[1];
			label.push(x);
		}

		var small_curve_options = 
			{
				responsive: true,
				legend: {
					position: 'bottom',
					display: false,	
				},
				hover: {
					mode: 'index'
				},
				scales: {
					xAxes: [{
						display: false,
						scaleLabel: {
							display: false,
							labelString: 'Day'
						}
					}],
					yAxes: [{
						display: false,
						ticks: {
							min: 0,
						},
						scaleLabel: {
							display: false,
							labelString: 'Value'
						}
					}]
				},
				title: {
					display: false,
					text: 'Chart.js Line Chart - Legend'
				}
			};

		$(".data-dynamic").each( function( index ) {
			var txt = $(this).attr("data-path");
			if (txt) {
				var textA = txt.split("::");
				var column = textA[2].split('[')[0];
				if (textA[0] == "data" ){
					console.log(textA[1]);

					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_Pm10" ){
						var last   = setPM10[setPM10.length-1];
						var before = setPM10[setPM10.length-2];
						var szArrow = __getArrow(last,before);
						var chart = "<div style='width:90%'><canvas id='pm10-line-chart'></canvas></div>";
						$(this).html(setPM10[setPM10.length-1]+"<i class='icon fa "+szArrow+"'></i> " +chart);

						ctx = $('#pm10-line-chart').get(0).getContext('2d');

						myLineChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: label,
								datasets: [{
									label: "My First dataset",
									data: setPM10,
									fill: true,
									borderColor: "white",
									backgroundColor: "rgba(255,255,255,0.2)",
									pointRadius: 0,
									lineTension: 0
								}]
							},
							options: small_curve_options
						});
					}

					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_PM_2.5" ){
						var last   = setPM25[setPM25.length-1];
						var before = setPM25[setPM25.length-2];
						var szArrow = __getArrow(last,before);
						var chart = "<div style='width:90%'><canvas id='pm25-line-chart'></canvas></div>";
						$(this).html(setPM25[setPM25.length-1]+"<i class='icon fa "+szArrow+"'></i> "+chart);

						ctx = $('#pm25-line-chart').get(0).getContext('2d');

						myLineChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: label,
								datasets: [{
									label: "My First dataset",
									data: setPM25,
									fill: true,
									borderColor: "white",
									backgroundColor: "rgba(255,255,255,0.2)",
									pointRadius: 0,
									lineTension: 0
								}]
							},
							options: small_curve_options
						});
					}

					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_C6H6" ){
						var last   = setC6H6[setC6H6.length-1];
						var before = setC6H6[setC6H6.length-2];
						var szArrow = __getArrow(last,before);
						var chart = "<div style='width:90%'><canvas id='C6H6-line-chart'></canvas></div>";
						$(this).html(setC6H6[setC6H6.length-1]+"<i class='icon fa "+szArrow+"'></i> "+chart);

						ctx = $('#C6H6-line-chart').get(0).getContext('2d');
						
						myLineChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: label,
								datasets: [{
									label: "My First dataset",
									data: setC6H6,
									fill: true,
									borderColor: "white",
									backgroundColor: "rgba(255,255,255,0.2)",
									pointRadius: 0,
									lineTension: 0
								}]
							},
							options: small_curve_options
						});
					}

					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_NO2" ){
						var last   = setNO2[setNO2.length-1];
						var before = setNO2[setNO2.length-2];
						var szArrow = __getArrow(last,before);
						var chart = "<div style='width:90%'><canvas id='NO2-line-chart'></canvas></div>";
						$(this).html(setNO2[setNO2.length-1]+"<i class='icon fa "+szArrow+"'></i> "+chart);

						ctx = $('#NO2-line-chart').get(0).getContext('2d');

						myLineChart = new Chart(ctx, {
							type: 'line',
							data: {
								labels: label,
								datasets: [{
									label: "My First dataset",
									data: setNO2,
									fill: true,
									borderColor: "white",
									backgroundColor: "rgba(255,255,255,0.2)",
									pointRadius: 0,
									lineTension: 0
								}]
							},
							options: small_curve_options
						});
					}

					/** done **/

				}
			}
		});
			 
	});



});

$(function() {

	var __getArrow = function(last,before){
		return (last == before)?"fa-arrow-right":((last < before)?"fa-arrow-down":"fa-arrow-up");
	}
	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/kRKeTf";
	var mydata = Data.feed("Anagrafe",{"source":szUrl,"type":"csv"}).load(function(){

		var setPOP = mydata.column("Popolazione fine periodo").values();

		// clear array, clip trailing 0
		setPOP = setPOP.filter(function(e){ return ( Number(e)) });

		$(".data-dynamic").each( function( index ) {

			var txt = $(this).attr("data-path");
			if (txt) {
				var textA = txt.split("::");
				var column = textA[2].split('[')[0];
				if (textA[0] == "data" ){
					if ( (textA[1] == "popolazione") && (column == "Popolazione fine Periodo") ){
						var last   = setPOP[setPOP.length-2];
						var before = setPOP[0];
						var szArrow = __getArrow(last,before);
						$(this).html("<span class='pull-left'>"+last+" </span><br><span class='pull-right' style='font-size:0.8em'>"+Math.abs(last-before)+"<i class='icon fa "+szArrow+"'></i></span> ");
					}
				}
			}

		});
	});
});


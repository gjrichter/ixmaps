$(function() {

	var myNumber = function(value){
		return parseFloat(value);
	}

	// get Rifiuti 2015 from Lecce Open Data

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata2 = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(data){

	  var set1  = data.dbtable.column("Percentuale differenziata").map(myNumber);
	  var set2  = [70,70,70,70,70,70,70,70,70,70,70,70];
	  var label = data.dbtable.column("Mesi");

	  var ctx, data, myLineChart, options;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#jumbotron-line-2-chart').get(0).getContext('2d');
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
	  data = {
		labels: label,
		datasets: [
		  {
			label: "My Second dataset",
			fillColor: "rgba(26, 188, 156,0.2)",
			strokeColor: "#1ABC9C",
			pointDot: false,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set1
		  },
		  {
			label: "target",
			fillColor: "rgba(34, 240, 170,0.2)",
			strokeColor: "#22F0A7",
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

	myNumber = function(value){
		return value.replace(/\./g,"");
	}

	// get Rifiuti 2015 from Lecce Open Data

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/x9pPJ4";
	var mydata2 = Data.feed("Rifiuti_2015",{"source":szUrl,"type":"csv"}).load(function(data){

		var set1  = data.dbtable.column("Totale RSU in  Kg ").map(myNumber);
		console.log(set1);
		var set2  = data.dbtable.column("Totale differenziata in Kg").map(myNumber);
		console.log(set2	);
		var label = data.dbtable.column("Mesi");

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
	  data = {
		labels: label,
		datasets: [
		  {
			label: "My First dataset",
			fillColor: "rgba(188, 188, 188,0.2)",
			strokeColor: "#9C9C9C",
			pointDot: false,
			pointColor: "#9C9C9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#9C9C9C",
			data: set1
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(26, 188, 156,0.2)",
			strokeColor: "#1ABC9C",
			pointDot: false,
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set2
		  }
		]
	  };

	  myBarChart = new Chart(ctx).Line(data, options);

	});

});

$(function() {

	ctx = $('#jumbotron-line-chart').get(0).getContext('2d');
	ctx.font = "30px Arial";
	ctx.fillStyle = "#FFFFFF";
	ctx.fillText("loading from www.arpa.puglia.it ...",ctx.canvas.width*0.5,ctx.canvas.height*0.6);

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

	var szExt = "../js/data/dbbroker.js";
	mydata2 = Data.feed("ActualAirQuality",{"ext":szExt,"type":"ext"}).load(function(data){

		$("#airquality-splash").hide();

		var stazione = "Libertini";
		selectionNO2  = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS NO2");
		selectionPM10 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS PM10");
		selectionPM25 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS PM2.5");
		selectionC6H6 = mydata2.select("WHERE 'NomeCentralina ' like "+stazione+" AND 'Sigla ' IS C6H6");

		var setPM10 = selectionPM10.column("Valore ").map(parse);
		var setPM25 = selectionPM25.column("Valore ").map(parse);
		var setNO2  = selectionNO2.column("Valore ").map(parse);
		var setC6H6  = selectionC6H6.column("Valore ").map(parse);

		var date = selectionNO2.column("DataRilevazione ");
		
		var label = [];
		for ( var i=0; i<date.length; i++ ){
			d = new Date(date[i]);
			label.push(d.toLocaleString().split(",")[0]);
		}

		var ctx, data, myLineChart, options;
		Chart.defaults.global.responsive = true;
		ctx = $('#jumbotron-line-chart').get(0).getContext('2d');
		options = {
			scales: {
				yAxes: [{
					ticks: {
						max: 50
					}
				}]
			},
			showScale: false,
			scaleShowGridLines: true,
			scaleGridLineColor: "rgba(256,256,256,1)",
			scaleGridLineWidth: 1,
			scaleShowHorizontalLines: true,
			scaleShowVerticalLines: false,
			bezierCurve: false,
			bezierCurveTension: 0.4,
			pointDot: false,
			pointDotRadius: 5,
			pointDotStrokeWidth: 2,
			pointHitDetectionRadius: 20,
			datasetStroke: true,
			datasetStrokeWidth: 3,
			datasetFill: true,
			legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
		};
		data = {
		labels: label,
		datasets: [
		   {
			label: "My Third dataset",
			fillColor: "rgba(34, 167, 240,0.3)",
			strokeColor: "#22A7F0",
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#22A7F0",
			data: setNO2
		  }, {
			label: "My First dataset",
			fillColor: "rgba(211, 177, 48,0.2)",
			strokeColor: "#ffb400",
			pointColor: "#ffb400",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#ffb400C",
			data: setPM25
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(250, 42, 0,0.2)",
			strokeColor: "#FA2A00",
			pointColor: "#FA2A00",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#FA2A00",
			data: setPM10
			}
		]
		};
		myLineChart = new Chart(ctx).Line(data, options);


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
						var szArrow = (last < before)?"fa-arrow-down":"fa-arrow-up";
						var chart = "<div style='width:90%'><canvas id='pm10-line-chart'></canvas></div>";
						$(this).html("<i class='icon fa "+szArrow+"'></i> "+setPM10[setPM10.length-1]+chart);

						ctx = $('#pm10-line-chart').get(0).getContext('2d');

						data = {
						labels: label,
						datasets: [
						    {
							label: "My Second dataset",
							fillColor: "rgba(250, 2502, 250,0.2)",
							strokeColor: "#FAFAFA",
							pointColor: "#FAFAFA",
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: "#FAFAFA",
							data: setPM10
							}
						]
						};
						myLineChart = new Chart(ctx).Line(data, options);
					}
					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_PM_2.5" ){
						var last   = setPM25[setPM25.length-1];
						var before = setPM25[setPM25.length-2];
						var szArrow = (last < before)?"fa-arrow-down":"fa-arrow-up";
						var chart = "<div style='width:90%'><canvas id='pm25-line-chart'></canvas></div>";
						$(this).html("<i class='icon fa "+szArrow+"'></i> "+setPM25[setPM25.length-1]+chart);

						ctx = $('#pm25-line-chart').get(0).getContext('2d');

						data = {
						labels: label,
						datasets: [
						    {
							label: "My Second dataset",
							fillColor: "rgba(250, 2502, 250,0.2)",
							strokeColor: "#FAFAFA",
							pointColor: "#FAFAFA",
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: "#FAFAFA",
							data: setPM25
							}
						]
						};
						myLineChart = new Chart(ctx).Line(data, options);
					}
					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_C6H6" ){
						var last   = setC6H6[setC6H6.length-1];
						var before = setC6H6[setC6H6.length-2];
						var szArrow = (last < before)?"fa-arrow-down":"fa-arrow-up";
						var chart = "<div style='width:90%'><canvas id='C6H6-line-chart'></canvas></div>";
						$(this).html("<i class='icon fa "+szArrow+"'></i> "+setC6H6[setC6H6.length-1]+chart);

						ctx = $('#C6H6-line-chart').get(0).getContext('2d');
						
						data = {
						labels: label,
						datasets: [
						    {
							label: "My Second dataset",
							fillColor: "rgba(250, 2502, 250,0.2)",
							strokeColor: "#FAFAFA",
							pointColor: "#FAFAFA",
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: "#FAFAFA",
							data: setC6H6
							}
						]
						};
						myLineChart = new Chart(ctx).Line(data, options);
					}
					if ( textA[1] == "lecce-actual-air-quality" && column == "Valore_NO2" ){
						var last   = setNO2[setNO2.length-1];
						var before = setNO2[setNO2.length-2];
						var szArrow = (last < before)?"fa-arrow-down":"fa-arrow-up";
						var chart = "<div style='width:90%'><canvas id='NO2-line-chart'></canvas></div>";
						$(this).html("<i class='icon fa "+szArrow+"'></i> "+setNO2[setNO2.length-1]+chart);

						ctx = $('#NO2-line-chart').get(0).getContext('2d');

						data = {
						labels: label,
						datasets: [
						    {
							label: "My Second dataset",
							fillColor: "rgba(250, 2502, 250,0.2)",
							strokeColor: "#FAFAFA",
							pointColor: "#FAFAFA",
							pointStrokeColor: "#fff",
							pointHighlightFill: "#fff",
							pointHighlightStroke: "#FAFAFA",
							data: setNO2
							}
						]
						};
						myLineChart = new Chart(ctx).Line(data, options);
					}
				}
			}
		});
			 
		 
			 
			 console.log(selectionPM10);
	});



});



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

		var ctx, data, myLineChart, options;
		Chart.defaults.global.responsive = true;
		ctx = $('#line-chart').get(0).getContext('2d');
	  options = {
		scaleShowGridLines: true,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		scaleShowHorizontalLines: true,
		scaleShowVerticalLines: true,
		bezierCurve: false,
		bezierCurveTension: 0.4,
		pointDot: true,
		pointDotRadius: 4,
		pointDotStrokeWidth: 1,
		pointHitDetectionRadius: 20,
		datasetStroke: true,
		datasetStrokeWidth: 2,
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
			pointColor: "#9C9C9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#9C9C9C",
			data: set1
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(26, 188, 156,0.2)",
			strokeColor: "#1ABC9C",
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set2
		  }
		]
	  };
	  myLineChart = new Chart(ctx).Line(data, options);

	});

});


$(function() {

	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/8O6bQ6";
	var mydata2 = Data.feed("Rifiuti_2015-particolari",{"source":szUrl,"type":"csv"}).load(function(data){

	  var opt   = { "lead":	'MESE',
		    		      "keep":	['COMUNE'],
					        "cols":	'TIPOLOGIA DI RIFIUTI ',
				          "value":  "Q.TA (KG)" 
					      };
	  var pivot = mydata2.pivot(opt);
	  var set1  = pivot.column("CARTA E CARTONI");
	  var set2  = pivot.column("RIFIUTI DI GIARDINI E PARCHI");
	  var set3  = pivot.column("LEGNO");

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#line-chart-2').get(0).getContext('2d');
	  option_bars = {
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
	  data = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dez'],
		datasets: [
		  {
			label: "My First dataset",
			fillColor: "rgba(250,240,0,0.6)",
			strokeColor: "#afaf88",
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set1
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(10, 147, 40,0.6)",
			strokeColor: "#c287F0",
			pointColor: "#a2A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#a2A8F0",
			data: set2
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(240, 167, 40,0.6)",
			strokeColor: "#c287F0",
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set3
		  }
		]
	  };
	  myBarChart = new Chart(ctx).Bar(data, option_bars);
	});
});




$(function() {
  var ctx, data, myBarChart, option_bars;
  Chart.defaults.global.responsive = true;
  ctx = $('#bar-chart').get(0).getContext('2d');
  option_bars = {
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
  data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(26, 188, 156,0.6)",
        strokeColor: "#1ABC9C",
        pointColor: "#1ABC9C",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#1ABC9C",
        data: [65, 59, 80, 81, 56, 55, 40]
      }, {
        label: "My Second dataset",
        fillColor: "rgba(34, 167, 240,0.6)",
        strokeColor: "#22A7F0",
        pointColor: "#22A7F0",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#22A7F0",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };
  myBarChart = new Chart(ctx).Bar(data, option_bars);
});


$(function() {
	var szUrl = "http://corsme.herokuapp.com/https://goo.gl/8O6bQ6";
	var mydata2 = Data.feed("Rifiuti_2015-particolari",{"source":szUrl,"type":"csv"}).load(function(data){

	  var opt   = { "lead":	'MESE',
		    		"keep":	['COMUNE'],
					"cols":	'TIPOLOGIA DI RIFIUTI ',
				    "value":  "Q.TA (KG)" 
					};
	  var pivot = mydata2.pivot(opt);
	  var set1  = pivot.column("VETRO");
	  var set2  = pivot.column("METALLO");
	  var set3  = pivot.column("PLASTICA");

	  var ctx, data, myBarChart, option_bars;
	  Chart.defaults.global.responsive = true;
	  ctx = $('#bar-chart-2').get(0).getContext('2d');
	  option_bars = {
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
	  data = {
		labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dez'],
		datasets: [
		  {
			label: "My First dataset",
			fillColor: "rgba(26, 188, 156,0.6)",
			strokeColor: "#1ABC9C",
			pointColor: "#1ABC9C",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#1ABC9C",
			data: set1
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(34, 167, 240,0.6)",
			strokeColor: "#22A7F0",
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#22A7F0",
			data: set2
		  }, {
			label: "My Second dataset",
			fillColor: "rgba(240,240,0,0.6)",
			strokeColor: "#afaf88",
			pointColor: "#22A7F0",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "#afaf88",
			data: set3
		  }
		]
	  };
	  myBarChart = new Chart(ctx).Bar(data, option_bars);
	});
});

$(function() {
  var ctx, data, myBarChart, option_bars;
  Chart.defaults.global.responsive = true;
  ctx = $('#radar-chart').get(0).getContext('2d');
  option_bars = {
    scaleBeginAtZero: true,
    scaleShowGridLines: true,
    scaleGridLineColor: "rgba(0,0,0,.05)",
    scaleGridLineWidth: 1,
    scaleShowHorizontalLines: true,
    scaleShowVerticalLines: false,
    barShowStroke: false,
    barStrokeWidth: 0,
    barValueSpacing: 5,
    barDatasetSpacing: 1,
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
  };
  data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: "My First dataset",
        fillColor: "rgba(26, 188, 156,0.2)",
        strokeColor: "#1ABC9C",
        pointColor: "#1ABC9C",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#1ABC9C",
        data: [65, 59, 80, 81, 56, 55, 40]
      }, {
        label: "My Second dataset",
        fillColor: "rgba(34, 167, 240,0.2)",
        strokeColor: "#22A7F0",
        pointColor: "#22A7F0",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#22A7F0",
        data: [28, 48, 40, 19, 86, 27, 90]
      }
    ]
  };
  myBarChart = new Chart(ctx).Radar(data, option_bars);
});

$(function() {
  var ctx, data, myPolarAreaChart, option_bars;
  Chart.defaults.global.responsive = true;
  ctx = $('#polar-area-chart').get(0).getContext('2d');
  option_bars = {
    scaleShowLabelBackdrop: true,
    scaleBackdropColor: "rgba(255,255,255,0.75)",
    scaleBeginAtZero: true,
    scaleBackdropPaddingY: 2,
    scaleBackdropPaddingX: 2,
    scaleShowLine: true,
    segmentShowStroke: true,
    segmentStrokeColor: "#fff",
    segmentStrokeWidth: 2,
    animationSteps: 100,
    animationEasing: "easeOutBounce",
    animateRotate: true,
    animateScale: false,
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
  };
  data = [
    {
      value: 300,
      color: "#FA2A00",
      highlight: "#FA2A00",
      label: "Red"
    }, {
      value: 50,
      color: "#1ABC9C",
      highlight: "#1ABC9C",
      label: "Green"
    }, {
      value: 100,
      color: "#FABE28",
      highlight: "#FABE28",
      label: "Yellow"
    }, {
      value: 40,
      color: "#999",
      highlight: "#999",
      label: "Grey"
    }, {
      value: 120,
      color: "#22A7F0",
      highlight: "#22A7F0",
      label: "Blue"
    }
  ];
  myPolarAreaChart = new Chart(ctx).PolarArea(data, option_bars);
});

$(function() {
  var ctx, data, myLineChart, options;
  Chart.defaults.global.responsive = true;
  ctx = $('#pie-chart').get(0).getContext('2d');
  options = {
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
  data = [
    {
      value: 300,
      color: "#FA2A00",
      highlight: "#FA2A00",
      label: "Red"
    }, {
      value: 50,
      color: "#1ABC9C",
      highlight: "#1ABC9C",
      label: "Green"
    }, {
      value: 100,
      color: "#FABE28",
      highlight: "#FABE28",
      label: "Yellow"
    }
  ];
  myLineChart = new Chart(ctx).Pie(data, options);
});

$(function() {
  var ctx, data, myLineChart, options;
  Chart.defaults.global.responsive = true;
  ctx = $('#jumbotron-line-chart').get(0).getContext('2d');
  options = {
    showScale: false,
    scaleShowGridLines: true,
    scaleGridLineColor: "rgba(0,0,0,.05)",
    scaleGridLineWidth: 1,
    scaleShowHorizontalLines: true,
    scaleShowVerticalLines: true,
    bezierCurve: false,
    bezierCurveTension: 0.4,
    pointDot: true,
    pointDotRadius: 4,
    pointDotStrokeWidth: 1,
    pointHitDetectionRadius: 20,
    datasetStroke: true,
    datasetStrokeWidth: 2,
    datasetFill: true,
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
  };
  data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: "My Second dataset",
        fillColor: "rgba(34, 167, 240,0.2)",
        strokeColor: "#22A7F0",
        pointColor: "#22A7F0",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "#22A7F0",
        data: [28, 48, 40, 45, 76, 65, 90]
      }
    ]
  };
  myLineChart = new Chart(ctx).Line(data, options);
});

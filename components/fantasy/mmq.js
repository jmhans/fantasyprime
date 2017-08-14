
$(document).ready(function() {
 var table =  $('#example').DataTable( {
        "ajax": '/data/2015Keepers.JSON', 
		"pagingType": "simple_numbers",
		"lengthMenu": [ [16,-1], [16, "All"] ], 
		"columns": [
	{ "data": "Translated Team" },
	{ "data": "PLAYER, TEAM POS" },
    { "data": "Last Year Cost" },
	{ "data": "ADV" },
	{ "data": "2015 Keeper Cost" }
    ] 
} );


});



// load the visualization library from Google and set a listener
/*
google.load("visualization", "1", {packages:["corechart", "charteditor"]});
google.setOnLoadCallback(drawAllCharts);

function drawAllCharts() {

drawTable("data/2015Keepers.CSV");
}

 function drawTable(location) {
	    
		$.get(location, function(csvString) {
      // transform the CSV string into a 2-dimensional array
      var arrayData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});
     // this new DataTable object holds all the data
      var data = new google.visualization.arrayToDataTable(arrayData);
	  /* data.addColumn('string', 'Details');
	  for (i = 0; i < data.getNumberOfRows(); i++) {
		data.setValue(i, data.getNumberOfColumns()-1,  "Click for Details");
	  } 
	  
      // this view can select a subset of the data at a time
      var view = new google.visualization.DataView(data);
      view.setColumns([0,1,2,3,4,5]);

	  var table = new google.visualization.Table(document.getElementById('blank_spot'));
	  table.draw(view);
  
  });
		      
} */


var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
    var state = {
        name: 'propbets',
        url: '/fun',
        component: 'propbets',
        menu: { name: 'Andy vs Justin', priority: 1 , tag: 'topmenu'},
        requiresParams: false,
        resolve: {
            bbRecs : function (propBetService) {
                return propBetService.getBBData();
            },
            configData: function (propBetService) {
                return propBetService.getConfigData();
            }
        }
    }; 

    $stateProvider.state(state);
    
});


app.component('propbets', {
    bindings: { bbRecs: '<', configData: '<' },
    templateUrl: 'components/fun/fun.html',
    controller: propBetCtrl
})


function propBetCtrl($http, $scope, $q, googleChartApiPromise) {
   
    $scope.curYr = 2017;

    $q.all({ api: googleChartApiPromise }).then(apiLoadSuccess);


    function apiLoadSuccess(result) {
        /*var table = new google.visualization.arrayToDataTable($scope.$ctrl.bbRecs);
        var view = new google.visualization.DataView(table);

        view.setColumns([0, 1, 6, 11, 14]);*/

        $scope.$ctrl.filteredRecs = $scope.$ctrl.configData.filter(function (rec) { 
            return (rec.Season == $scope.curYr);
        });

        $scope.$ctrl.myBetCharts = [];

        $scope.$ctrl.filteredRecs.forEach(function (rec) {



            var cols = [Number(rec['X series'])];

            if (rec['Dark Blue'] != '') { cols.push(Number(rec['Dark Blue'])); }
            if (rec['Dark Red'] != '') { cols.push(Number(rec['Dark Red'])); }
            if (rec['Light Blue'] != '') { cols.push(Number(rec['Light Blue'])); }
            if (rec['Light Red'] != '') { cols.push(Number(rec['Light Red'])); }

            $scope.$ctrl.myBetCharts.push(
                drawChart(
                    rec.Title,
                    cols,
                    rec['Y Axis Label'],
                    rec['Y Axis Minimum']
                    )
                );

            $scope[rec.Title] = drawChart(
                    rec.Title,
                    cols,
                    rec['Y Axis Label'],
                    rec['Y Axis Minimum']
                    );

        });


        //$scope.myChartObject = drawChart("WinDiff", [0, 25, 25], "Yep", 0);

    }

    function drawChart(chartTitle, dataCols, yLabel, altMinY) {

        var arrayData = $scope.$ctrl.bbRecs;

        // this new DataTable object holds all the data
        var data = new google.visualization.arrayToDataTable(arrayData);

        // this view can select a subset of the data at a time
        var view = new google.visualization.DataView(data);
        view.setRows(data.getFilteredRows([{ column: 17, value: $scope.curYr }]));

        view.setColumns(dataCols);
        var minY = view.getColumnRange(1).min;
        var maxY = view.getColumnRange(1).max;
        for (var i = 1; i < view.getNumberOfColumns() ; i++) {
            minY = Math.min(minY, view.getColumnRange(i).min);
            maxY = Math.max(maxY, view.getColumnRange(i).max);
        }
        var vAxisOptions = '';
        var hAxisOptions = '';
        // set chart options
        if (altMinY != 0) {
            minY = altMinY;
            hAxisOptions = { title: view.getColumnLabel(0), viewWindow: { max: Math.max(10, view.getColumnRange(0).max), min: view.getColumnRange(0).max - 30 } };
            vAxisOptions = { title: yLabel, viewWindow: { max: maxY, min: minY } };
        } else {
            hAxisOptions = { title: view.getColumnLabel(0), minValue: view.getColumnRange(0).min, maxValue: Math.max(10, view.getColumnRange(0).max) };
            vAxisOptions = { title: yLabel, viewWindow: { max: maxY, min: minY }, viewWindowMode: 'maximized' };
        }

        var options = {
            title: chartTitle,
            interpolateNulls: false,
            hAxis: hAxisOptions,
            vAxis: vAxisOptions,
            series: {
                0: { color: '#3366FF' }, // Blue - MIL_DIFF
                1: { color: '#FF0000' }, // Red - MIN_Diff
                2: { color: '#C2D1FF' }, // Light Blue - Mil Target
                3: { color: '#FF9999' } // Light Red - Minn Target
            },
            'height': 400,
            'width': 600
        };

        // create the chart object and draw it

        

        return {
            type: "LineChart",
            cssStyle: "height:600px; width:100%",
            options: options,
            data: view
        };
        //  var chart = new google.visualization.LineChart(document.getElementById(displayDiv));
        // chart.draw(view, options);

    };


}









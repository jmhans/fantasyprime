var betsModule = angular.module('bets', [])

betsModule.config(function ($stateProvider) {
    var state = {
        name: 'bets',
        url: '/bets',
        component: 'betsComponent',
        menu: { name: 'Prop Bets', priority: 1, tag: 'topmenu' },
        requiresParams: false,
        resolve: {
            mlbBoxscores: function (mlbDataService) {
                d = new Date(); 
                s = new Date('03/29/2018');
                tms = [142, 158];
                return mlbDataService.getAllBoxscoresForDates(s,d,tms).then(function (resp){
                    var result = [];
                    resp.forEach(function (tm) {
                        tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                    });
                    return resp;
                });
            },
            //betSummary: function (propBetService) {
            //    return propBetService.getBetList();
            //},
            betData: function (propBetService) {
                return propBetService.getBetDataPromise();
            },
            //betDataPromise: function (propBetService) {
            //    return propBetService.getBetDataPromise();
            //},
            betGraphConfig: function (propBetService) {
                return propBetService.getGraphConfig();
            },
            betSummary: function (betGraphConfig, betData) {
                var betSummary = []
                for (i = 0; i < betGraphConfig.length; i++) {
                    if (betGraphConfig[i].betSides) {
                        betGraphConfig[i].betSides.forEach(function (side) {
                            side.curVal = getValFromArrayColumn(betData, side.seriesName) + side.adjustment
                        });
                    };
                    betSummary.push({
                        "betNumber": betGraphConfig[i].betNumber,
                        "betYear": betGraphConfig[i].betYear,
                        "betDescription": betGraphConfig[i].betDescription,
                        "betSides" : betGraphConfig[i].betSides
                    });
                }
                return betSummary;
            }

        }
    };

    $stateProvider.state(state);

});

betsModule.component('betsComponent', {
    bindings: {  betSummary: '<', betData:'<', betGraphConfig:'<', mlbBoxscores:'<'},
    templateUrl: 'components/fun/bets.html',
    controller: betsCtrl
});

function betsCtrl($http, $scope, googleChartApiPromise, propBetService) {

    $ctrl = this;

    $scope.myChart = {};
    init();
    function init() {
        googleChartApiPromise.then(chartApiSuccess);
    }

    function chartApiSuccess() {

        graphBets = $ctrl.betGraphConfig;
        $scope.allData = new google.visualization.arrayToDataTable($ctrl.betData, false);
        
        graphBets.forEach(function (graphBet) {
            var colIndexes = [0];
            graphBet.chtOptions = {
                seriesType: 'line',
                series: {},
                height: 400,
                width: 600
            }

            for (i = 0; i < graphBet.chartSeries.length; i++) {
                graphBet.chtOptions.series[i] = { color: graphBet.chartSeries[i].seriesColor, type: graphBet.chartSeries[i].seriesType }
                colIndexes.push($ctrl.betData[0].indexOf(graphBet.chartSeries[i].seriesLookup));
            }
            graphBet.view = new google.visualization.DataView($scope.allData);
            graphBet.view.setColumns(colIndexes);

            $scope[graphBet.betDescription] = drawGoogleChart(graphBet.view, graphBet.chtOptions);


        });
        


    }
    function saveData() {
        propBetService.saveBetData('tempBets', { "fake": 3, "otherFake": "string" }).then(function (resp) {
            return resp.data;
        })
    }


}


function drawGoogleChart(dataVu, options) {
    return {
        type: "ComboChart",
        cssStyle: "height:1000px; width:100%",
        options: options,
        data: dataVu
    };
}


function getValFromArrayColumn(data,columnName, rowNum) {
    var colNum = data[0].indexOf(columnName);
    var len = data.length;
    var retVal = '';
    if (rowNum) {
        return data[rowNum][colNum];
    } else {
        rowNum = len -1;
        while (!data[rowNum][colNum]){
            rowNum--;
        };
        return data[rowNum][colNum];
    }
}

betsModule.filter('numbersWithoutTrailingZero', function ($filter) {
    return function (input, decimalPlaces) {
        if (input % 1) {
            return $filter('number')(input, decimalPlaces);
        }
        return $filter('number')(input, 0);
    };
});
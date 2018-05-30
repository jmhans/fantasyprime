var winsPoolModule = angular.module('winsPool', [])

winsPoolModule.config(function ($stateProvider) {
    var state = {
        name: 'winsPool',
        url: '/winsPool',
        component: 'winsPoolComponent',
        menu: { name: 'MLB Wins Pool', priority: 1, tag: 'topmenu' },
        requiresParams: false,
        resolve: {
            //bbRecs: function (mlbDataService) {
            //    d = new Date();
            //    return mlbDataService.getSchedule(158, d, d).then(function (resp) {
            //        var result = [];
            //        resp.forEach(function (tm) {
            //            //if (tm.name == 'Minnesota Twins' || tm.name == "Milwaukee Brewers") {
            //            var w_count = 0;
            //            var l_count = 0;
            //            tm.games.forEach(function (gm) {
            //                (gm.isWinner) ? w_count++ : l_count++;
            //            });
            //            tm.wins = w_count;
            //            tm.losses = l_count;
            //            //return { wins: w_count, losses: l_count };
            //            //}
            //        });

            //        return resp;
                    

            //    });
                
            //},

            standings: function (mlbDataService) {
                return mlbDataService.getStandings().then(function (resp) {
                    return resp;
                });


            },
            picks: function ($http, standings) {
                return $http.get('./data/picks.json').then(function (picks) {
                    var output = {};
                    var projectedWins = function (pk) {
                        return 162 * pk.leagueRecord.wins / (pk.leagueRecord.wins + pk.leagueRecord.losses);
                    }
                    picks.data.forEach(function (pick) {
                        pick.leagueRecord = standings.find(function (tm) { return (tm.team.name == pick.Pick); }).leagueRecord;
                        pick.projectedWins = projectedWins(pick);
                        if (output[pick.Name]) {
                            output[pick.Name].wins += pick.leagueRecord.wins;
                            output[pick.Name].losses += pick.leagueRecord.losses;
                            output[pick.Name].picks.push(pick);
                            output[pick.Name].projectedWins += projectedWins(pick);
                        } else {
                            output[pick.Name] = { wins: pick.leagueRecord.wins, losses: pick.leagueRecord.losses, picks: [pick], projectedWins: projectedWins(pick)};

                        };
                    });
                    outputArr = [];
                    for (var key in output) {
                        if (Object.prototype.hasOwnProperty.call(output, key)) {
                            outputArr.push({ name: key, data: output[key] });
                            // use val
                        }
                    }


                    return outputArr;
                });
            }
        }
    };

    $stateProvider.state(state);

});

winsPoolModule.component('winsPoolComponent', {
    bindings: { picks: '<' , standings: '<'},
    templateUrl: 'components/fun/winsPool.html',
    controller: winsPoolCtrl
});

function winsPoolCtrl($http, $scope, googleChartApiPromise) {

    this.expand = function (item) {
        item.show =!item.show;
    }
    this.winPct = function (pickObj) {
        return pickObj.data.wins / (pickObj.data.wins + pickObj.data.losses);
    };
}



var ablModule = angular.module('abl', [])

ablModule.config(function ($stateProvider) {
    var states = [{
        name: 'abl',
        url: '/abl',
        component: 'abl',
        menu: { name: 'ABL', priority: 1 , tag: 'topmenu'},
        requiresParams: false,
        resolve: {
            currDt: function () {
                var d = new Date();
                return stringifyDate(d);

            }
        }
    },
    {
        name: 'abl.players',
        url: '/players',
        component: 'ablPlyrs',
        requiresParams: false,
        resolve: {
            players: function (ablService) {
                return ablService.getPlayers('07-08-2017');
            }
        }
    },
    {
        name: 'abl.dougstatsdetail',
        url: '/dougstats/:dt',
        component: 'abldougstats',
        requiresParams: false,
        resolve: {
            dougstats: function ($stateParams, ablService) {
                //return ablService.getDougStats();
            }
        }
    },
    {
        name: 'abl.stats.detail',
        url: '/:dt',
        component: 'ablstatsdetail',
        requiresParams: true,
        resolve: {
            allGames: function ($stateParams, mlbDataService) {
                return mlbDataService.getGamesForDate($stateParams.dt);
            },
            games: function ($stateParams, mlbDataService) {
                var m = mlbDataService.getDailyStats($stateParams.dt);
                return m;
            },
            stats: function (games) {
                var statsArr = [];
                if (games) {
                    games.forEach(function (gmObj) {
                        gmObj.players.forEach(function (plyrObj) {
                            statsArr.push(plyrObj);
                        });
                    });
                }
                return statsArr;
            }
        }
    },
    {
        name: 'abl.dougstats',
        url: '/dougstats',
        menu: { name: 'ABLDS', priority: 3, tag: 'topmenu' },
        component: 'abldougstats',
        redirectTo: 'abl.dougstatsdetail({dt: 06-19-2017})'
    },
    {
        name: 'abl.stats',
        url: '/stats',
        component: 'abl.stats',
        requiresParams: false
    }];

    states.forEach(function (st) {
        $stateProvider.state(st);
    });
    
});


ablModule.component('abl', {
    bindings: { currDt:'<' },
    templateUrl: 'components/abl/abl.html',
    controller: ablCtrl,
    controllerAs: 'vm'
});


function ablCtrl($http, $scope) {
  
    var vm = this;

    //test comment

    vm.treeOptions = {
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return true;
        },
    };

}

ablModule.component('abl.stats', {
    templateUrl: 'components/abl/abl_stats.html',
    controller: ablStatsCtrl
});

function ablStatsCtrl(mlbDataService, $scope) {


    this.availableGames = [];
    vm = this;
    vm.getSchedule = function (dt) {
        mlbDataService.getGamesForDate(dt).then(function (resp) {
            vm.availableGames = resp;
        });

    };
    vm.saveAllGames = function () {
        vm.availableGames.forEach(function (gm) {
            vm.saveGameStats(gm.gamePk);
        })
    }
    vm.saveGameStats = function (gmPk) {
        gm = vm.availableGames.find(function (gmItem) { return (gmItem.gamePk == gmPk); })
        gm.isBoxscoreSaved = false;
        getBS = function (gm) {
            mlbDataService.getGameBoxscore(gm.gamePk).then(function (resp) {
                gm.boxscore = resp;
                mlbDataService.saveGameStats(gm).then(function (resp) {
                    gm.isBoxscoreSaved = true;
                })
            })
        }

        getBS(gm);
        
    };
    

}

ablModule.component('ablPlyrs', {
    bindings: { players: '<' },
    templateUrl: 'components/abl/abl_players.html',
    controller: ablPlyrCtrl
});


function ablPlyrCtrl($scope) {

}

ablModule.component('ablstatsdetail', {
    bindings: { games:'<', dt:'<', stats:'<', allGames:'<'},
    templateUrl: 'components/abl/abl_stats_detail.html',
    controller: ablDSCtrl
});


function ablDSCtrl(mlbDataService, $scope) {

    var vm = this;

    //test comment
    vm.saveAllGames = function () {
        vm.allGames.forEach(function (gm) {
            vm.saveGameStats(gm.gamePk);
        })
    }
    vm.saveGameStats = function (gmPk) {
        gm = vm.allGames.find(function (gmItem) { return (gmItem.gamePk == gmPk); })
        gm.isBoxscoreSaved = false;
        getBS = function (gm) {
            mlbDataService.getGameBoxscore(gm.gamePk).then(function (resp) {
                gm.boxscore = resp;
                mlbDataService.saveGameStats(gm).then(function (resp) {
                    gm.isBoxscoreSaved = true;
                })
            })
        }

        getBS(gm);

    };
    $scope.$watch('allGames', function (newValue) {
        console.log('allGames changed:' + newValue);
    })


}

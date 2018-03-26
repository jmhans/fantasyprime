
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
                return ablService.getDougStats();
            },
            games: function ($stateParams, mlbDataService) {
                var m = mlbDataService.appendStatstoGames($stateParams.dt);
                return m;
            }/*,
            dt: function ($stateParams) {
                return $stateParams.dt;
            }*/
        }
    },
    {
        name: 'abl.stats.detail',
        url: '/:dt',
        component: 'ablstatsdetail',
        requiresParams: true,
        resolve: {
            dougstats: function ($stateParams, ablService) {
                return ablService.getDougStats();
            },
            games: function ($stateParams, mlbDataService) {
                var m = mlbDataService.getDailyStats($stateParams.dt); // mlbDataService.appendStatstoGames($stateParams.dt);
                return m;
            },
            games2: function ($stateParams, mlbDataService) {
                var m = mlbDataService.getGamesForDate($stateParams.dt);
                return m; 
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

function ablStatsCtrl(mlbDataService) {
    this.availableGames = []
    vm = this
    vm.getSchedule = function (dt) {
        mlbDataService.getGamesForDate(dt).then(function (resp) {
            vm.availableGames = resp;
        });

    };

    vm.saveGameStats = function (gmPk) {
        mlbDataService.getGameBoxscore(gmPk).then(function (resp) {
            gm = vm.availableGames.find(function (gmItem) { return (gmItem.gamePk == gmPk); })
            gm.boxscore = resp;
            gm.isBoxscoreSaved = false;
            mlbDataService.saveGameStats(gm).then(function (resp) {
                gm.isBoxscoreSaved = true;
            });
            
        });
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
    bindings: { games:'<', dt:'<'},
    templateUrl: 'components/abl/abl_stats_detail.html',
    controller: ablDSCtrl
});


function ablDSCtrl() {

    var vm = this;

    //test comment


    vm.advance = function (effDate) {

        $state.go('abl.stats.detail', { dt: effDate });
    }


}

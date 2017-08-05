
var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
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
                var m = mlbDataService.appendStatstoGames($stateParams.dt);
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


app.component('abl', {
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

app.component('abl.stats', {
    templateUrl: 'components/abl/abl_stats.html',
    controller: ablStatsCtrl
});

function ablStatsCtrl() {

}

app.component('ablPlyrs', {
    bindings: { players: '<' },
    templateUrl: 'components/abl/abl_players.html',
    controller: ablPlyrCtrl
});


function ablPlyrCtrl($scope) {

}

app.component('ablstatsdetail', {
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

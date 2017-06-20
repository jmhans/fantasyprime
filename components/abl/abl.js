
var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
    var states = [{
        name: 'abl',
        url: '/abl',
        component: 'abl',
        menu: { name: 'ABL', priority: 1 , tag: 'topmenu'},
        requiresParams: false/*,
        resolve: {
            plyrs: function ($rootScope, $stateParams, ablService) {
                return ablService.getPlayers("2016-05-01");

            }
        }*/
    },
    {
        name: 'abl.dougstats',
        url: '/dougstats',
        component: 'abldougstats',
        requiresParams: true,
        resolve: {
            dougstats: function ($stateParams, ablService) {
                return ablService.getDougStats();
            }
        }
    },
    {
        name: 'abl.stats',
        
        url: '/:effDate',
        component: 'abl1',
        requiresParams: true,
        resolve: {
            stats: function ($stateParams, ablService) {
                return ablService.getPlayers($stateParams.effDate);
            }
        }
    }];

    states.forEach(function (st) {
        $stateProvider.state(st);
    });
    
});


app.component('abl', {
    bindings: { plyrs: '<', stats: '<' },
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

app.component('abl1', {
    bindings: { stats: '<' },
    templateUrl: 'components/abl/abl.html',
    controller: ablCtrl1,
    controllerAs: 'vm2'
});


function ablCtrl1() {

    var vm1 = this;

    //test comment

    vm1.treeOptions = {
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return true;
        },
    };

    vm1.advance = function (effDate) {
        
        $state.go('abl.stats', { effDate: effDate });
    }



}

app.component('abldougstats', {
    bindings: { dougstats: '<' },
    templateUrl: 'components/abl/abl_stats.html',
    controller: ablDSCtrl
});


function ablDSCtrl() {

    var vm = this;

    //test comment

    vm.treeOptions = {
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return true;
        },
    };

    vm.advance = function (effDate) {

        $state.go('abl.dougstats', { effDate: effDate });
    }



}

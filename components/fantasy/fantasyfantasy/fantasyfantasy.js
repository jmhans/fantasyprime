var fantasyFantasyModule = angular.module('fantasyfantasy', ['ui.router', 'table-admin'])

fantasyFantasyModule.config(function ($stateProvider) {

    var states = [{
        name: 'ff',
        parent: 'fantasyfootball',
        url: '/fantasyfantasy',
        component: 'fantasyfantasy',
        menu: {
            name: 'Fantasy Fantasy', tag: 'submenu'
        },
        tree: {
            name: 'Fantasy Fantasy',
        },
        resolve: {
            allTeams: function (TeamsService) {
                //var a = TeamsService.getAllTeams();
                var a = TeamsService.getPrimeTeams()
                return a;
            }
        },
        requiresParams: false
    },

   
    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });

});



fantasyFantasyModule.component('fantasyfantasy', {
    bindings: { users: '=', allTeams: '<'},
    templateUrl: 'components/fantasy/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl
})


function ffCtrl($http, $scope, TeamsService, FFDBService) {
    //$scope.$parent.myTeams = allTeams;

    /*$scope.updateUsers = function () {
        $scope.onUserUpdate($scope.allTeams)
    }*/

  //  $scope.val = TeamsService.getESPNDraftInfo('5437')

    var a = 1;

}


// $scope.params = $routeParams;

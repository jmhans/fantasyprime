var fantasyFantasyModule = angular.module('fantasyfantasy', ['ui.router'])

fantasyFantasyModule.config(function ($stateProvider) {

    var state = {
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
                var a = TeamsService.getAllTeams();
                return a;
            }
        },
        requiresParams: false
    };

    $stateProvider.state(state);
});



fantasyFantasyModule.component('fantasyfantasy', {
    bindings: { users: '<', allTeams: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl
})


function ffCtrl($http, $scope) {
    //$scope.$parent.myTeams = allTeams;

    /*$scope.updateUsers = function () {
        $scope.onUserUpdate($scope.allTeams)
    }*/

}

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
            name: 'Fantasy Fantasy', users: 'allTeams'
        },
        //resolve: {
        //    allTeams: function (FFDBService) {
        //        var a = FFDBService.getTeams();
        //        return a;
        //    }
        //},
        requiresParams: false
    },

   
    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });

});



fantasyFantasyModule.component('fantasyfantasy', {
    bindings: {},
    templateUrl: 'components/fantasy/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl
})


function ffCtrl($http, $scope, TeamsService, FFDBService) {
    var a = 1;
}

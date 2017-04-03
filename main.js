
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus', 'angular-google-gapi', 'datatables', 'datatables.bootstrap', 'ui.bootstrap', 'ui.tree']);

myApp.config(function ($stateProvider) {

});

// To account for plunker embeds timing out, preload the async data
myApp.run(['$http', '$rootScope', 'TeamsService', '$state', '$stateParams', function ($http, $rootScope, TeamsService, $state, $stateParams) {
    // $http.get('data/data.json', { cache: true });

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    getTeams();

    function getTeams() {
        TeamsService.getAllTeams()
        .then(function (tms) {
            $rootScope.teams = tms;
        })
    }

}


]);


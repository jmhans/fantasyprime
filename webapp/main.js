
var actuarialGamesModule = angular.module('actuarial.games',
    [
        'ui.router',
        'ui.router.menus',
        'angular-google-gapi',
        'datatables',
        'datatables.bootstrap',
        'datatables.buttons',
        'ui.bootstrap',
        'ui.tree',
        'googlechart',
        'fantasyFootball',
        'abl',
        'fantasyGolf',
        'propBets',
        'state.tree'
    ]);

actuarialGamesModule.config(function ($stateProvider) {

});

// To account for plunker embeds timing out, preload the async data
actuarialGamesModule.run(['$http', '$rootScope', 'TeamsService', '$state', '$stateParams', function ($http, $rootScope, TeamsService, $state, $stateParams) {
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
    $rootScope.$on('$stateChangeStart', function (evt, to, params) {
        if (to.redirectTo) {
            evt.preventDefault();
            $state.go(to.redirectTo, params, { location: 'replace' })
        }
    });


}


]);


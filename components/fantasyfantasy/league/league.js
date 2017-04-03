var myApp = angular.module('fantasyfantasy')


myApp.config(function ($stateProvider) {
    // An array of state definitions
    var state = 
        {
            name: 'ff.league',
            url: '/league',
            menu: { name: 'League', priority: 10},
            component: 'league',
            requiresParams: false
        };

     $stateProvider.state(state);
});


myApp.component('league', {
    bindings: { league: '<' },
    templateUrl: 'components/blank.html'
})


fantasyFantasyModule.config(function ($stateProvider) {
    // An array of state definitions
    var state = 
        {
            name: 'ff.league',
            url: '/league',
            menu: { name: 'League', priority: 10 },
            tree: { name: 'League', position: 'right'}, 
            component: 'league',
            requiresParams: false
        };

     $stateProvider.state(state);
});


fantasyFantasyModule.component('league', {
    bindings: { league: '<' },
    templateUrl: 'components/blank.html'
})


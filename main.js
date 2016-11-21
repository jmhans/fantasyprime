
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus']);

myApp.config(function ($stateProvider) {
    // An array of state definitions
    var states = [

      {
          name: 'standings',
          url: '/standings',
          menu: 'Standings',
          component: 'standings'
      },
      {
          name: 'teams',
          url: '/teams',
          component: 'teams',
          // This state defines a 'people' resolve
          // It delegates to the PeopleService to HTTP fetch (async)
          // The people component receives this via its `bindings: `
          resolve: {
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              }
          },
          menu: 'Teams'
      },
      {
        name: 'teams.team',
            // This state takes a URL parameter called teamId
        url: '/{teamId}',
        component: 'team',
        // This state defines a 'person' resolve
        // It delegates to the PeopleService, passing the personId parameter
        resolve: {
            team: function (teams, $stateParams) {
                return teams.find(function (team) {
                    return team.id === $stateParams.teamId;
                });
            }
        }
      }


    ]

    // Loop over the state definitions and register them
    states.forEach(function (state) {
        $stateProvider.state(state);
    });
});

// To account for plunker embeds timing out, preload the async data
myApp.run(function ($http) {
    $http.get('data/people.json', { cache: true });
});
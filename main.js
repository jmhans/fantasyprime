
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus', 'angular-google-gapi', 'datatables']);

myApp.config(function ($stateProvider) {
    // An array of state definitions
    var states = [
        {
            name: 'league',
            url: '/league',
            menu: 'League',
            component: 'league',
            requiresParams: false
        },
        {
            name: 'teams.team.roster',
            url: '/roster',
            component: 'roster',
            requiresParams: true,
            resolve: {
                team: function (teams, $rootScope, $stateParams, TeamsService) {
                    return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                        $rootScope.selectedTeam = tm;
                        return $rootScope.selectedTeam;
                    });

                },
                roster: function (RostersService, team) {
                    return RostersService.getOwnerRoster(team.name);
                }

            }
        },
        {
            name: 'teams.team.detail',
            url: '/info',
            component: 'info',
            resolve: {
                team: function (teams, $rootScope, $stateParams, TeamsService) {
                    return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                        $rootScope.selectedTeam = tm;
                        return $rootScope.selectedTeam;
                    }); 
                }
            },
            requiresParams: false,
            menu: "My Team"
        },

      {
          name: 'teams',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              },
              fantasy_teams: function (RostersService) {
                  return RostersService.getActiveRosters();
              }

          }
      },
      {
          name: 'standings',
          url: '/standings',
          menu: 'Standings',
          requiresParams: false,
          component: 'standings',
          resolve: {
              standings: function (GoogleSheetsService) {
                  return GoogleSheetsService.getStandings();
              }
          }
      },
      {
          name: 'scoreboard',
          url: '/scoreboard',
          menu: 'Scoreboard',
          requiresParams: false,
          component: 'scoreboard'
      },
      {
          name: 'teams.team',
          // This state takes a URL parameter called teamId
          url: '/{teamId:int}',
          component: 'team',
          // This state defines a 'person' resolve
          // It delegates to the PeopleService, passing the personId parameter
          requiresParams: true,
          resolve: {
              team: function (teams, $rootScope, $stateParams, TeamsService) {
                  return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                      $rootScope.selectedTeam = tm;
                      return $rootScope.selectedTeam;
                  });
              }
          },
          params: {
              teamId: 1
          }
      },
      {
          name: 'teams.freeagents',
          // This state takes a URL parameter called teamId
        url: '/allteams',
        component: 'allteams',
          menu: 'All Teams',
        requiresParams: false
      },

    ]

    // Loop over the state definitions and register them
    states.forEach(function (state) {
        $stateProvider.state(state);
    });
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


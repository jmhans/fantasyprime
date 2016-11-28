
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus', 'angular-google-gapi', 'datatables']);

myApp.config(function ($stateProvider) {
    // An array of state definitions
    var states = [
        {
            name: 'league',
            url: '/league',
            menu: 'League',
            component: 'league'
        },
        {
            name: 'teams.roster',
            url: '/{teamId}/roster',
            component: 'roster',
            resolve: {
                team: function (teams, $rootScope, $stateParams, TeamsService) {
                    return teams.find(function (team) {
                        TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                            $rootScope.selectedTeam = tm;
                        })
                        return team.id === $stateParams.teamId;
                        
                    });
                },
                roster: function (RostersService, team) {
                    return RostersService.getOwnerRoster(team.name);
                }
            },
            menu: 'Roster Teams'
        },
      {
          name: 'teams',
          url: '/teams',
          menu: 'All Teams',
          component: 'teams',
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
          component: 'standings'
      },
      {
          name: 'scoreboard',
          url: '/scoreboard',
          menu: 'Scoreboard',
          component: 'scoreboard'
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
            },
            selectedTeamId: function (team) {
                return team.teamId;
            }
        }
      },

    ]

    // Loop over the state definitions and register them
    states.forEach(function (state) {
        $stateProvider.state(state);
    });
});

// To account for plunker embeds timing out, preload the async data
myApp.run(['$http', '$rootScope', 'TeamsService', '$state', function ($http, $rootScope, TeamsService, $state) {
    // $http.get('data/data.json', { cache: true });
       
    $rootScope.teams;
    $rootScope.selectedTeam;

    getTeams();

    function getTeams() {
        TeamsService.getAllTeams()
        .then(function (tms) {
            $rootScope.teams = tms;
        })
    }

    function start() {
        // 2. Initialize the JavaScript client library.
        gapi.client.init({
            'apiKey': 'AIzaSyCz_JWHeHrf-AUs2YlZlwcu3q3XRJQoon8',
            'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            // clientId and scope are optional if auth is not required.
            'clientId': '1005055514218-blfai4g2nid0s7bvvdgc1ekltvfnk591.apps.googleusercontent.com',
            'scope': ["https://www.googleapis.com/auth/spreadsheets"].join(' '),
        }).then(function () {
            // 3. Initialize and make the API request.
            $rootScope.GApi = gapi.client;
            //return gapi.client;
            /*return gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns',
                range: 'RosterRecords!A:G',
            }).then(function (response) {

                return response;
            });*/
        }, function (reason) {
            console.log('Error: ' + reason.result.error.message);
        });
    };
    // 1. Load the JavaScript client library.
     gapi.load('client', start);

}


]);
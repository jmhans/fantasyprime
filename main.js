
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus', 'angular-google-gapi', 'datatables']);

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
      },

        {
            name: 'teams.roster',
            url: '/{teamId}/roster',
            component: 'roster',
            resolve: {
                team: function (teams, $stateParams) {
                    return teams.find(function (team) {
                        return team.id === $stateParams.teamId;
                    });
                },
                roster: function (RostersService, team) {
                    return RostersService.getOwnerRoster(team.name);
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
myApp.run(['$http', '$rootScope', function ($http, $rootScope) {
    $http.get('data/data.json', { cache: true });

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
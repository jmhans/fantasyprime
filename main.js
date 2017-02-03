
var myApp = angular.module('fantasyfantasy', ['ui.router', 'ui.router.menus', 'angular-google-gapi', 'datatables', 'ui.bootstrap']);

myApp.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {
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
      ,
      {
          name: 'scoreboard.details',
          url: '/{weekId:int}',
          requiresParams: false,
          component: 'scoreboard.details',
          resolve: {
              scores: function (GoogleSheetsService, $stateParams) {
                  var rawData = GoogleSheetsService.getScoresforWeek($stateParams.weekId);
                  return rawData;
              },
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              },
              games: function (TeamsService, scores, $stateParams) {
                  var ret = TeamsService.getGamesforWeek($stateParams.weekId).then(function (data) {
                      Array.prototype.sumif = function (sumProp, critProp, crit) {
                          var total = 0;
                          for (var i = 0; i < this.length; i++) {
                              if (this[i][critProp] == crit) {
                                  total += parseFloat(this[i][sumProp]);
                              }
                          }
                          return total;
                      }
                      Array.prototype.countif = function (prop, crit) {
                          return this.filter(function (itm) { return (itm.prop == crit); }).length;
                      }

                      function determineResult(gameRec) {


                          if (gameRec['Team W'] + 0.5 * gameRec['Team T'] > gameRec['Opp W'] + 0.5 * gameRec['Opp T']) return 'W'
                          if (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)']) return 'W';
                          if (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)']) return 'W';
                          if ((gameRec['Team W'] + 0.5 * gameRec['Team T'] > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
                          return '';
                      }

                      data.forEach(function (gameRec) {
                          var scoresForTeam = scores.filter(function (scoreRec) { return (scoreRec.Owner == gameRec['Team Name']); });
                          var scoresForOpp = scores.filter(function (scoreRec) { return (scoreRec.Owner == gameRec['Opp Name']); });
                          gameRec['Team W'] = scoresForTeam.sumif('W', 'Position', 'Starter');
                          gameRec['Team L'] = scoresForTeam.sumif('L', 'Position', 'Starter');
                          gameRec['Team T'] = scoresForTeam.sumif('T', 'Position', 'Starter');

                          gameRec['Opp W'] = scoresForOpp.sumif('W', 'Position', 'Starter');
                          gameRec['Opp L'] = scoresForOpp.sumif('L', 'Position', 'Starter');
                          gameRec['Opp T'] = scoresForOpp.sumif('T', 'Position', 'Starter');

                          gameRec['Pts (Starters)'] = scoresForTeam.sumif('Score', 'Position', 'Starter');
                          gameRec['Pts (Bench)'] = scoresForTeam.sumif('Score', 'Position', 'Bench');;

                          gameRec['Opp Pts (Starters)'] = scoresForOpp.sumif('Score', 'Position', 'Starter');
                          gameRec['Opp Pts (Bench)'] = scoresForOpp.sumif('Score', 'Position', 'Bench');;

                          gameRec['Team Result'] = determineResult(gameRec);
                          gameRec['Subgame Details'] = scoresForTeam;
                          gameRec['Subgame Opp Details'] = scoresForOpp;

                          gameRec['isCollapsed'] = true;



                      });
                      return data;
                  });
                  return ret;


              }

          },
          params: {
              weekId: 14
          }
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
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');

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


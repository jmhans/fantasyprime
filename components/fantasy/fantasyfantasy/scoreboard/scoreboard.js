var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
    var states = [{
        name: 'ff.scoreboard',
        url: '/scoreboard',
        menu: { name: 'Scoreboard', priority: 200 },
        requiresParams: false,
        component: 'scoreboard'
    },
      {
          name: 'ff.scoreboard.details',
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
      }
    ];

    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


app.component('scoreboard', {
    bindings: { scores: '<', teams: '<', games: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboard.html',
    controller: function ($scope, $log, $state, $http) {
        $scope.weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        $scope.totalItems = $scope.weeks.length;
        // $scope.currentWeek = 14;

        $scope.goToWeek = function (wk) {
            $scope.selectedWeek = wk;
            $state.go('ff.scoreboard.details', { weekId: $scope.selectedWeek });
        }

        $scope.currentWeek = $http.get('data/weekDetails.json').then(function (resp) {
            for (var i = 0; i < resp.data.weeks.length; i++) {
                var d = new Date(resp.data.weeks[i]['Scores Final']);
                var curTime = new Date();
                var lastCheckD = new Date('12/31/2999');
                var wk = 1;
                if (curTime < d && d < lastCheckD) {
                    wk = resp.data.weeks[i]['WeekId'];
                    lastCheckD = d;
                }
            }
            $scope.goToWeek(wk);
            return wk;

        });

        


    }
})

app.component('scoreboard.details', {
    bindings: { scores: '<', teams: '<', games: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboardDetails.html',
    controller: function ($scope) {
        $scope.isCollapsed = false;
    }
})
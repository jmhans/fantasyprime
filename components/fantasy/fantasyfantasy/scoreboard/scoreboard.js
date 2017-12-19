
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [{
        name: 'ff.scoreboard',
        url: '/scoreboard',
        menu: { name: 'Scoreboard', priority: 200 },
        tree: { name: 'Scoreboard' },
        requiresParams: false,
        component: 'scoreboard',
        resolve: {
            scores: function (FFDBService, $stateParams) {

            },
            ff_matchups: function (TeamsService, scores, $stateParams) {
                return TeamsService.getFullSchedule();
            }
        }
    },
      {
          name: 'ff.scoreboard.details',
          url: '/{weekId:int}',
          requiresParams: false,
          component: 'scoreboard.details',
          resolve: {
              scores: function (FFDBService, $stateParams, ScoresService) {

                  return FFDBService.getScoresForWeek($stateParams.weekId).then(function (resp) {
                      return resp;
                  })

              },
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              },
              weeklymatchups: function ($stateParams, ff_matchups, scores) {

                  determineResult = function (gameRec) {
                      if (gameRec['Team W'] + 0.5 * gameRec['Team T'] > gameRec['Opp W'] + 0.5 * gameRec['Opp T']) return 'W'
                      if (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)']) return 'W';

                      if (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)']) return 'W';
                      if ((gameRec['Team W'] + 0.5 * gameRec['Team T'] > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
                      return '';
                  }

                  var newArr = ff_matchups.filter(function (matchup) { return (parseInt(matchup.Week) == parseInt($stateParams.weekId)); });
                  newArr.forEach(function (gameRec) {
                      var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { OWNER: { TEAM_NAME: gameRec['Team Name'] } } });
                      var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { OWNER: { TEAM_NAME: gameRec['Opp Name'] } } });

                      gameRec['Team W'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                      gameRec['Team L'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                      gameRec['Team T'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                      gameRec['Opp W'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                      gameRec['Opp L'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                      gameRec['Opp T'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                      gameRec['Pts (Starters)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                      gameRec['Pts (Bench)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });
                      gameRec['Opp Pts (Starters)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                      gameRec['Opp Pts (Bench)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });

                      gameRec['Team Result'] = determineResult(gameRec);
                      gameRec['Subgame Details'] = scoresForTeam;
                      gameRec['Subgame Opp Details'] = scoresForOpp;
                      gameRec['isCollapsed'] = true;

                  });
                  return newArr;
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


fantasyFantasyModule.component('scoreboard', {
    bindings: { scores: '<', teams: '<', games: '<', ff_matchups: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboard.html',
    controller: function ($scope, $log, $state, $http) {

        // $scope.currentWeek = 14;

        $scope.goToWeek = function (wk) {
            $scope.selectedWeek = wk;
            $state.go('ff.scoreboard.details', { weekId: $scope.selectedWeek });
        }


        $scope.currentWeek = $http.get('data/weekDetails.json').then(function (resp) {
            
            var wkDetails = resp.data.weeks.find(function (lookupWk, idx, arr) {
                var d = new Date(lookupWk['Scores Final']);
                var curTime = new Date();
                var last_d = (idx > 0 ? new Date(arr[idx-1]['Scores Final']) : new Date('1970-01-01'));
                return (curTime >= last_d && curTime < d);
            });

            $scope.goToWeek(wkDetails.WeekId);
            return wkDetails.WeekId;

        });

    }
});

fantasyFantasyModule.component('scoreboard.details', {
    bindings: { weeklymatchups: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboardDetails.html',
    controller: function ($scope, $state) {
        //$scope.isCollapsed = false;

        this.selectedWeek = $state.params.weekId

    }
})


fantasyFantasyModule.component('fantasymatchup', {
    bindings: { scorerecords: '<', ft: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/matchup.html'
})
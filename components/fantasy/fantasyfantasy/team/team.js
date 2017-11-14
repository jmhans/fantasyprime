
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [
      {
          name: 'teams',
          parent: 'ff',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function (FFDBService) {
                  return FFDBService.getTeams();
              },
              fantasyTeams: function (FFDBService) {
                  return FFDBService.getEnrichedRosters().then(function (response) {
                      return response;
                  });
              }

          }
      },
      {
          name: 'team',
          // This state takes a URL parameter called teamId
          parent: 'teams',
          url: '/team?teamId&weekId',
          component: 'team',
          // This state defines a 'person' resolve
          // It delegates to the PeopleService, passing the personId parameter
          requiresParams: true,
          resolve: {
              team: function (teams, FFDBService, $transition$) {
                  var tm = teams.find(function (team) { return team.id == $transition$.params().teamId; });
                  /*return FFDBService.getTeam($stateParams.teamId).then(function (tm) {
                      $rootScope.selectedTeam = tm;
                      return $rootScope.selectedTeam;
                  });*/
                  FFDBService.activeTeam = tm;
                  return tm;
              },
              roster: function (FFDBService, team) {
                  return FFDBService.getActiveRosters();
              },
              week: function ($transition$) {
                  // datepart: 'y', 'm', 'w', 'd', 'h', 'n', 's'
                  Date.dateDiff = function (datepart, fromdate, todate) {
                      datepart = datepart.toLowerCase();
                      var diff = todate - fromdate;
                      var divideBy = {
                          w: 604800000,
                          d: 86400000,
                          h: 3600000,
                          n: 60000,
                          s: 1000
                      };

                      return Math.floor(diff / divideBy[datepart]);
                  }
                  //Set the two dates
                  var startDate = new Date("2017-09-05T00:00:00");
                  var today = new Date();

                  var myWeek = (parseInt($transition$.params().weekId) || Date.dateDiff('w', startDate, today) + 1);
                  return myWeek;
              }
          },
          params: {
              teamId: "1",
              weekId: "10"
          },
          menu: { name: "My Team", priority: 1000 },

      },
      {
          name: 'freeagents',
          // This state takes a URL parameter called teamId
          parent: 'team',
          url: '/allteams',
          component: 'allteams',
          resolve: {
              thingy: function ($transition$) {
                  return '1';
              }
          },
          menu: { name: 'All Teams', priority: 900 },
          tree: { name: 'All Teams' },
          requiresParams: false
      },
      {
          name: 'detail',
          // This state takes a URL parameter called teamId
          parent: 'team',
          url: '/detail',
          component: 'team.detail',
          resolve: {
              
          },
          menu: { name: 'All Teams', priority: 900 },
          tree: { name: 'My Team' }
      },
      {
          name: 'addteam',
          parent: 'team',
          url: '/addteam?addTeamId',
          component: 'addteam',
          requiresParams: false,
          resolve: {
              addTeam: function (FFDBService, $transition$) {
                  return FFDBService.getTeamInfo($transition$.params().addTeamId);
              },
              roster: function (FFDBService, team) {
                  return FFDBService.getActiveRosters();
              }
          }
      }

    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


fantasyFantasyModule.component('team', {
    bindings: { team: '<', teams: '<'},
    templateUrl: 'components/fantasy/fantasyfantasy/team/team.html',
    controller: function ($scope, $state) {
        this.changeTeam = function () {
            console.log($scope.$ctrl.activeTeam);
            $state.go($state.current.name, { teamId: $scope.$ctrl.team.id });
        }


    }
})

fantasyFantasyModule.component('team.detail', {
    bindings: { team: '<', roster: '<', week: '<', teams: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/detail.html',
    controller: function () {
        this.action = 'standard'

        this.$onChanges = function(chg) {
            console.log(chg);
        }
        // this.teams = teams
    }
})


fantasyFantasyModule.component('info', {
    bindings: { team: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/info.html',
    controller: teamDetailController
})


function teamDetailController(FFDBService, $scope) {

    this.statusMessage = '';
    this.editMode = false;
    this.edited = false;

    this.originalTeamDetail = $scope.$ctrl.team

    this.editHandler = function (txt, elem) {
        this.edited = true;
    }

    this.saveDataChanges = function () {
        FFDBService.updateItem(this.team).then(function (resp) {
            console.log('Saved');
            $scope.$ctrl.edited = false;
        });
    }

    //this.$onInit = function () {
    //    $scope.$ctrl.activeTeam = $scope.$ctrl.team
    //}

    this.$onChanges = function (changes) {
        console.log(changes);
        if (changes.team.isFirstChange()) {
            this.originalTeamDetail = changes.team.currentValue
        } else {
            if (this.originalTeamDetail !== changes.team.currentValue) {
                console.log('team was changed from ' + changes.team.previousValue + ' to ' + changes.team.currentValue);
            }
        }


    };


    this.updateItem = function (itemToUpdate) {
        if (this.editMode) {

            var newObj = {
                id: itemToUpdate.id,
                SEASON: itemToUpdate.editTeamSeason,
                TEAM_NAME: itemToUpdate.editTeamName,
                TEAM_OWNER: itemToUpdate.editTeamOwner
            };
            this.statusMessage = 'Updating data'
            FFDBService.updateItem(newObj).then(reloadData);
        }
    }

    function reloadData() {
        $state.reload();
    }



}


fantasyFantasyModule.component('addteam', {
    bindings: { team: '<', addTeam: '<', roster:'<', week:'<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/addteam.html',
    controller: addTeamController
})


function addTeamController() {
    this.action = 'add_drop'
}




fantasyFantasyModule.config(function ($stateProvider) {
    var states = [
        //{
        //    name: 'detail',
        //    url: '/info',
        //    parent: 'team',
        //    component: 'info',
        //    resolve: {
        //        team: function (teams, $rootScope, $stateParams, FFDBService) {
        //            return FFDBService.getTeam($stateParams.teamId).then(function (tm) {
        //                $rootScope.selectedTeam = tm;
        //                return $rootScope.selectedTeam;
        //            });
        //        }
        //    },
        //    requiresParams: false,
        //    menu: { name: "My Team", priority: 1000 },
        //    tree: { name: "My Team"}
        //},

      {
          name: 'teams',
          parent: 'ff',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function (FFDBService) {
                  return FFDBService.getTeams();
              }

          }
      },
      {
          name: 'team',
          // This state takes a URL parameter called teamId
          parent: 'teams',
          url: '/{teamId:int}',
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
                  return FFDBService.getOwnerRoster(team.TEAM_NAME);
              }
          },
          params: {
              teamId: 1
          },
          menu: { name: "My Team", priority: 1000 },
          tree: { name: "My Team" }
      },
      {
          name: 'freeagents',
          // This state takes a URL parameter called teamId
          parent: 'teams',
          url: '/allteams',
          component: 'allteams',
          menu: { name: 'All Teams', priority: 900 },
          tree: { name: 'All Teams'},
          requiresParams: false
      }

    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


fantasyFantasyModule.component('team', {
    bindings: { team: '<', roster:'<'},
    templateUrl: 'components/fantasy/fantasyfantasy/team/team.html'
})


fantasyFantasyModule.component('info', {
    bindings: { team: '<'},
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
        } else
        {
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
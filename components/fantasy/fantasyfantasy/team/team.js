
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [
      {
          name: 'teams',
          parent: 'ff',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function ( AWSFantasyService) {
                return AWSFantasyService.getAllTeams();
              },
              fantasyTeams: function ( AWSFantasyService) {
                return AWSFantasyService.getEnrichedRosters().then(function (response) {
                  return response;
                })

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
              team: function (teams, $transition$) {
                  var tm = teams.find(function (team) { return team.OWNER_ID == $transition$.params().teamId; });
                  return tm;
              },
              week: function ($transition$, AWSFantasyService) {
                 
                  var myWeek = AWSFantasyService.getWeek((parseInt($transition$.params().weekId) || '')).then(function (resp) { return resp });
                  return myWeek;   
              }
          },
          params: {
              teamId: "1"
          },
          menu: { name: "My Team", priority: 1000 },

      },
      {
          name: 'freeagents',
          // This state takes a URL parameter called teamId
          parent: 'team',
          url: '/allteams',
          component: 'allteams',
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
            roster: function(AWSFantasyService, team) {
              AWSFantasyService.getActiveRosters().then(function (allrosters) {
              var a = allrosters.filter(function (rosterRec) {
                return (rosterRec.PRIME_OWNER == team.TEAM_NAME);
              })
              return a;
            });
            }
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
              addTeam: function ( AWSFantasyService, $transition$, roster) {
                return AWSFantasyService.getRosterRecord($transition$.params().addTeamId).then(function(tm) {
                  tm.action = 'Add';
                  return tm;
                });
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
    controller: function ($scope, $state, AWSFantasyService) {
        this.changeTeam = function () {
            // console.log($scope.$ctrl.activeTeam);
            $state.go($state.current.name, { teamId: $scope.$ctrl.team.OWNER_ID });
        }

        var $ctrl = this

        this.$onInit = function () {
            $ctrl.loadRosters();
        }

        this.loadRosters = function () {
          AWSFantasyService.getActiveRosters().then(function (allrosters) {
            var a = allrosters.filter(function (rosterRec) {
              return (rosterRec.PRIME_OWNER == $ctrl.team.TEAM_NAME);
            })
            $ctrl.roster = a;
          });

        }
        this.handleRosterUpdate = function (rosterRec, rosterAction) {
            console.log("Roster Updated");
            switch (rosterAction) {
                case 'add':
                    rosterRec.PRIME_OWNER = $ctrl.team.TEAM_NAME;
                    rosterRec.POSITION = 'Bench';
                    break;
                case 'drop':
                    //drop team
                    rosterRec.PRIME_OWNER = '';
                    rosterRec.POSITION= '';
                    break;
            }
            $ctrl.beginUpdate(rosterRec, rosterAction);
            AWSFantasyService.updateRosterRecord(rosterRec).then(function (resp) {
              $ctrl.endUpdate(resp);
              $ctrl.loadRosters();
            }, function (err) {
              $ctrl.failUpdate(claimingTeam.RECORD_ID, err)
            });
          
        }

        this.submitWaiverClaim = function (claimingTeam, conditionallyDroppingTeam) {
            // console.log("submitted claim to add " + claimingTeam + " and drop " + conditionallyDroppingTeam);
            $ctrl.beginUpdate(claimingTeam, 'waiver');
            AWSFantasyService.submitWaiverClaim(claimingTeam, conditionallyDroppingTeam).then(function (resp) {
              $ctrl.endUpdate(claimingTeam.RECORD_ID);
            }, function (err) {
              $ctrl.failUpdate(claimingTeam.RECORD_ID, err)
            });

        }

        this.updating = [];
        this.beginUpdate = function (updateRec, rosterAction) {
            switch (rosterAction) {
                case 'add':
                    updateRec.msg = { text: 'Adding Team' }
                    break;
                case 'drop':
                    updateRec.msg = { text: 'Dropping Team' }
                    break;
                case 'waiver':
                    updateRec.msg = { text: 'Waiver claim submitted for ' }
                    break;
                default:
                    updateRec.msg = { text: 'Updating Team' }
            }

            updateRec.msg.status = 'In progress'
            updateRec.msg.type = 'warning'
            $ctrl.updating.push(updateRec);
        }
        this.endUpdate = function (updateRecID) {
            var idx = $ctrl.updating.findIndex(function (itm) { return (itm.recno == updateRecID); })
            $ctrl.updating[idx].msg.status = "Successful"
            $ctrl.updating[idx].msg.type = "success"
            //$ctrl.updating.splice(idx, 1)
            $ctrl.loadRosters();
        }

        this.closeAlert = function (index) {
            this.updating.splice(index, 1);
        }
        this.failUpdate = function (updateRecID, err) {
            var idx = $ctrl.updating.findIndex(function (itm) { return (itm.recno == updateRecID); });
            $ctrl.updating[idx].msg.status = "Failed: " + err
            $ctrl.updating[idx].msg.type = "danger"

        }


    }
})

fantasyFantasyModule.component('team.detail', {
    bindings: { team: '<', roster: '<', week: '<', teams: '<', reload: '&'},
    templateUrl: 'components/fantasy/fantasyfantasy/team/detail.html',
    controller: function ($scope) {
        this.action = 'standard'
        this.$onInit = function () {
            console.log("initialized");
        }
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


function teamDetailController(AWSFantasyService, $scope) {

    this.statusMessage = '';
    this.editMode = false;
    this.edited = false;

    this.originalTeamDetail = $scope.$ctrl.team

    this.editHandler = function (txt, elem) {
        this.edited = true;
    }

    this.saveDataChanges = function () {
      AWSFantasyService.updateOwner(this.team).then(function (resp) {
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
                OWNER_ID: itemToUpdate.OWNER_ID,
                SEASON: itemToUpdate.editTeamSeason,
                TEAM_NAME: itemToUpdate.editTeamName,
                TEAM_OWNER: itemToUpdate.editTeamOwner
            };
            this.statusMessage = 'Updating data'
          AWSFantasyService.updateOwner(newObj).then(reloadData);
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
    this.actionsAllowed = function () {
        curDate = new Date();
        cutoffDate = new Date("2017-09-07T14:46:30.510Z");


        return
        (this.roster ? (this.roster.length - this.roster.filter(function (r) { return (r.action == 'Drop'); }).length + 1 <= 8) : false) &&
        (curDate <= cutoffDate);
    }

}



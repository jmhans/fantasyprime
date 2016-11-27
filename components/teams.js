


angular.module('fantasyfantasy').component('teams', {
    bindings: { teams: '<' },
    controller: function ($state) {
        this.selectTeam = function () {
            $state.go('teams.team', { "teamId": this.selectedTeam.id })
        }

    },
    template: '<div>Choose a team:</div>' +
              '<select ng-options= "tm.name for tm in $ctrl.teams track by tm.id" ng-model="$ctrl.selectedTeam" ng-change="$ctrl.selectTeam()"></select>' + 
              '<a ui-sref="teams.team({teamId : $ctrl.selectedTeam.id})">Team Information</a> | ' +
              '<a ui-sref="teams.roster({teamId : $ctrl.selectedTeam.id})">Roster</a>' +
              '<ui-view></ui-view>'
})
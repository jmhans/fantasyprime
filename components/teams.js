


angular.module('fantasyfantasy').component('teams', {
    bindings: { teams: '<' },
    controller: function ($state) {
        this.selectTeam = function () {
            $state.go('teams.team', { "teamId": this.selectedTeam.id })
        }

    },
    template: '<div>Choose a team:</div>' +
              '<select ng-options= "tm.name for tm in $ctrl.teams track by tm.id" ng-model="$ctrl.selectedTeam" ng-change="$ctrl.selectTeam()"></select>' + 
              '<ui-view></ui-view>'
})
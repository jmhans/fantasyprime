


angular.module('fantasyfantasy').component('teams', {
    bindings: { teams: '<' },
    controller: function ($state) {
        this.selectTeam = function () {
            if ($state.current.name === 'teams') {
                $state.go('teams.roster', { "teamId": this.selectedTeam.id })
            } else {
                $state.go($state.current.name, { "teamId": this.selectedTeam.id })
            }
            
        }

    },
    template: '<a ui-sref="teams.roster({teamId : $ctrl.selectedTeam.id})">Roster</a> | ' +
              '<a ui-sref="teams.team({teamId : $ctrl.selectedTeam.id})">Team Information</a>' +
              '<ui-view></ui-view>'
})
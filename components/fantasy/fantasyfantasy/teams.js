fantasyFantasyModule.component('teams', {
    bindings: { teams: '<'},
    template: '<ui-view />',
    controller: teamsController,
    controllerAs: 'teamsCtrl'
    //template: '<ui-view />'
});

function teamsController($scope, $state, FFDBService) {
    this.teamChange = function () {
        $state.go('team', { teamId: $scope.$ctrl.activeTeam.id });
    }

}
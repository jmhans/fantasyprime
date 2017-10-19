fantasyFantasyModule.component('teams', {
    bindings: { teams: '<' , activeTeam: '<'},
    templateUrl: 'components/fantasy/fantasyfantasy/teams.html',
    controller: teamsController
    //template: '<ui-view />'
});

function teamsController($scope, $state, FFDBService) {
    this.teamChange = function () {
        console.log($scope.$ctrl.activeTeam);
        $state.go('team', { teamId: $scope.$ctrl.activeTeam.id });
    }

    this.setActiveTeam = function (tmObj) {
        this.activeTeam = tmObj;
    }

    var ctrl = this
    ctrl.FFDBService = FFDBService;

    this.$onInit = function () {
        ctrl.activeTeam = ctrl.FFDBService.activeTeam;
    }


}
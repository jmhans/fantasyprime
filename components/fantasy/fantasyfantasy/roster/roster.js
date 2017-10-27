
fantasyFantasyModule.component('roster', {
    bindings: { roster: '<', team:'<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html',
    controllerAs: 'rosterCtrl'
})


function RosterTableCtrl($http, /*DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, GoogleSheetsService, */ FFDBService, $scope, $compile) {

    var vm = this;

    // this.team = $scope.$parent.$ctrl.team;

    vm.actionsAvailable = true; //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';

    vm.dbService = FFDBService

   
    vm.updateRoster = _updateRoster

    vm.updateTeamRecord = _updateRoster

    function _updateRoster(rosterRec) {
        console.log('it worked!')
        newObj = {
            team_id: rosterRec.TeamID,
            prime_owner: rosterRec.Owner,
            start_date: rosterRec.StartDate,
            end_date: '',
            position: 'BENCH'
        }
        rosterRec.updating = true;
        this.dbService.updateRosterRecord(rosterRec).then(function (response) {
            rosterRec.recno = response;
            rosterRec.updating = false;
        })

    }



 
    

   

}

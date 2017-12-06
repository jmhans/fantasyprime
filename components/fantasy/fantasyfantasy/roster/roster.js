
fantasyFantasyModule.component('roster', {
    bindings: { roster: '<', team:'<', week: '<', action: '<', weekdetails:'<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html',
    controllerAs: 'rosterCtrl'
})


function RosterTableCtrl($http, FFDBService, $scope, $compile) {

    var vm = this;

    // this.team = $scope.$parent.$ctrl.team;

    vm.loadTime = new Date(); //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';

    vm.dbService = FFDBService

    vm.updateRoster = _updateRoster

    vm.updateTeamRecord = _updateRoster

    vm.getDateTime = function (datetime) {
        var a = (typeof(datetime) == 'undefined' ? new Date() : new Date(datetime))
        return a;
    }

    vm.updateAllowed = function () {
        return (vm.loadTime <= new Date(vm.week['Roster Lock Time']));
    }

    function _updateRoster(rosterRec) {
        starters = vm.roster.filter(function (rr) {return (rr.position == 'Starter');});
        
        if (starters.length <= 7) {
            //newObj = {
            //    team_id: rosterRec.TeamID,
            //    prime_owner: rosterRec.Owner,
            //    start_date: rosterRec.StartDate,
            //    end_date: '',
            //    position: 'Bench'
            //}
            rosterRec.updating = true;
            rosterRec.info = 'Saving...'
            this.dbService.updateRosterRecord(rosterRec).then(function (response) {
                rosterRec.recno = response;
                rosterRec.updating = false;
                rosterRec.info = ''
            })
        } else {
            rosterRec.position = 'Bench'
            rosterRec.info = 'Too Many Starters'
        }
        
    }



    vm.processAdd = _processAdd

    function _processAdd(dropTeam) {
        alert("Confirmation - Add " + (this.addTeam ? this.addTeam.TEAM_INFO.TEAM_NAME : "") + " and drop " + dropTeam.TEAM_INFO.TEAM_NAME + "?");
    }


 
    

   

}

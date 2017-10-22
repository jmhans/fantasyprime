
fantasyFantasyModule.component('roster', {
    bindings: { roster: '<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html',
    controllerAs: 'newThing'
})


function RosterTableCtrl($http, /*DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, GoogleSheetsService, */ FFDBService, $scope, $compile) {

    var vm = this;

    vm.actionsAvailable = true; //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';
    //vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10)
    //    .withOption('lengthMenu', [[10, 25, 50, -1], [10, 25, 50, "All"]])
    //    .withOption('searching', false)
    //    .withOption('paging', false)
    //    .withOption('dom', '')
    //    .withOption('responsive', true)
    //;
    ///*vm.dtColumns = [
    //    DTColumnBuilder.newColumn('TeamID').withTitle('Team ID')
    //    ,DTColumnBuilder.newColumn('TeamName (Ref Only)').withTitle('Team Name')
    //    ,DTColumnBuilder.newColumn('Owner').withTitle('Owner')
    //    ,DTColumnBuilder.newColumn(null).withTitle('Position')
    //];*/

    //vm.options = {
    //    'aoColumns': [{
    //        'mData': 'team_id', 'sTitle': 'Team ID'
    //    },
    //    {
    //        'mData': 'TeamName (Ref Only)', 'sTitle': 'Team Name'
    //    },
    //    {
    //        'mData': 'prime_owner', 'sTitle': 'Owner'
    //    },
    //    {
    //         "mData": null, 'sTitle': 'Position' 
    //    }

    //    ]
    //}

    //$scope.$watch(vm.roster, function (newVal, oldVal) {
    //    console.log(newVal);
    //});


    vm.dbService = FFDBService
    //vm.gsService = GoogleSheetsService
   
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

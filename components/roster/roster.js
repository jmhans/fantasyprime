angular.module('fantasyfantasy').component('roster', {
    bindings: { roster: '<' },
    controller: RosterTableCtrl, 
    templateUrl: 'components/roster/roster.html'
})

function RosterTableCtrl($http, DTOptionsBuilder, DTColumnDefBuilder, GoogleSheetsService) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('paging', false)
        .withOption('searching', false);
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];

    vm.dropTeam = dropTeam;
    vm.updateTeamRecord = updateTeamRecord;

    function dropTeam(index) {
        vm.roster.splice(index, 1);
    }


    function updateTeamRecord() {
        tmRec = {
            "RecNo": 363,
            "TeamID": "fakeID",
            "TeamName (Ref Only)": "fakeName",
            "Owner": "fakeOwner",
            "Position" : "fakeBench"

        }

        GoogleSheetsService.writeRosterRecord(tmRec)
    }

}

angular.module('fantasyfantasy').component('roster', {
    bindings: { roster: '<' },
    controller: RosterTableCtrl, 
    templateUrl: 'components/roster/roster.html'
})

function RosterTableCtrl(DTOptionsBuilder, DTColumnDefBuilder) {
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers');
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];

    vm.dropTeam = dropTeam;

    function dropTeam(index) {
        vm.roster.splice(index, 1);
    }
}

fantasyFantasyModule.component('allteams', {
    bindings: { fantasyTeams: '<' },
    controller: FATableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/freeagents/freeagents.html'
})

function FATableCtrl($http, $scope, DTOptionsBuilder, DTColumnDefBuilder) {
    //var vm = this;

    //vm.fantasy_teams = $scope.$parent.$resolve.fantasy_teams.filter(function(rec) {
    //    return (rec.Owner == '');
    //});
    //vm.dtOptions = DTOptionsBuilder.newOptions()
    //    .withOption('paging', true)
    //    .withOption('searching', false)
    //    /*.withOption('data', function (data) {
    //        return data.filter(function (rec) {
    //            return (rec.Owner == '');
    //        });
    //    })*/;
    //vm.dtColumnDefs = [
    //    DTColumnDefBuilder.newColumnDef(0),
    //    DTColumnDefBuilder.newColumnDef(1),
    //    DTColumnDefBuilder.newColumnDef(2),
    //    DTColumnDefBuilder.newColumnDef(3),
    //    DTColumnDefBuilder.newColumnDef(4).notSortable()
    //];

    //vm.dropTeam = dropTeam;

    //function dropTeam(index) {
    //    vm.roster.splice(index, 1);
    //}

}

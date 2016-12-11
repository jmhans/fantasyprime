angular.module('fantasyfantasy').component('standings', {
    bindings: { standings: '<' },
    controller: StandingsCtrl,
    templateUrl: 'components/standings.html'
});

function StandingsCtrl($http, DTOptionsBuilder, DTColumnDefBuilder, GoogleSheetsService) {

    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('paging', false)
        .withOption('searching', false)
        .withOption('order', [[0, 'asc']]);
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4),
        DTColumnDefBuilder.newColumnDef(5),
        DTColumnDefBuilder.newColumnDef(6),
        DTColumnDefBuilder.newColumnDef(7),
        DTColumnDefBuilder.newColumnDef(8)
        
    ];
    vm.dtInstance = {};
    
    

}
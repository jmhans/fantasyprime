angular.module('fantasyfantasy').component('golf', {
    bindings: { leaders: '<' },
    templateUrl: 'components/golf/golf.html',
    controller: golfCtrl
})


function golfCtrl($http, DTOptionsBuilder, DTColumnDefBuilder) {
    $.fn.dataTable.ext.order['dom-select'] = function (settings, col) {
        return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
            return $('select', td).val();
        });
    };
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('paging', false)
        .withOption('searching', false)
        .withOption('order', [[3, 'desc']])
        .withBootstrap();
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3),
        DTColumnDefBuilder.newColumnDef(4)
    ];
    vm.dtInstance = {};
    

}
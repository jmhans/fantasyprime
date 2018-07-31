fantasyFootballModule.component('mmq', {
    bindings: {},
    template: '<ui-view />',
    controller: mmqCtrl,
})


function mmqCtrl($http, $scope) {

}


fantasyFootballModule.component('keepers', {
    bindings: { keepers: '=' },
    templateUrl: 'components/fantasy/MMQKeepers.htm',
    controller: keepersCtrl,
})


function keepersCtrl(DTOptionsBuilder, DTColumnBuilder, $scope, $http, footballdexService) {
    var vm = this;

    vm.dtOptions = DTOptionsBuilder.fromFnPromise(footballdexService.getMMQKeepers);
    vm.dtOptions.withPaginationType('full_numbers').withDisplayLength(17)
        .withOption('lengthMenu', [[17, -1], [17, "All"]])
        .withDOM('Bfrtip')
        .withButtons([
            {extend: 'copy', text: 'Copy to Clipboard'},
            {extend: 'excel', text: 'Export to SS'}
        ])
    ;
    vm.dtColumns = [
        DTColumnBuilder.newColumn('Translated Team').withTitle('Team'),
        DTColumnBuilder.newColumn('Translated Name').withTitle('Player'),
        DTColumnBuilder.newColumn('Last Year Cost').withTitle('Last Year Cost'),
        DTColumnBuilder.newColumn('ADV').withTitle('ESPN ADV'),
        DTColumnBuilder.newColumn('2018 Keeper Cost').withTitle('2018 Cost')

    ];

}




fantasyFantasyModule.config(function ($stateProvider) {
    var st = {
        name: 'standings',
        parent: 'ff',
        url: '/standings',
        menu: { name: 'Standings', priority: 300, tag: 'submenu' },
        tree: { name: 'Standings'}, 
        requiresParams: false,
        component: 'standings',
        resolve: {
            standings: function (AWSFantasyService) {
                return AWSFantasyService.getScheduleAndResults().then(function (resp) {
                    return resp;
                });
            }
        }
    };
    $stateProvider.state(st);

});



fantasyFantasyModule.component('standings', {
    bindings: { standings: '<' },
    controller: StandingsCtrl,
    templateUrl: 'components/fantasy/fantasyfantasy/standings.html'
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
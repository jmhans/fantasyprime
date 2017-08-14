
var fantasyGolfModule = angular.module('fantasyGolf', [])

fantasyGolfModule.config(function ($stateProvider) {
    var state = {
        name: 'golf',
        url: '/golf',
        component: 'golf',
        resolve: {
            leaders: function (golfService) {
                return golfService.getLeaderboard();
            },
            picks: function (golfService) {
                return golfService.getPicks();
            }
        },
        requiresParams: false
    }; 

    $stateProvider.state(state);
    
});


fantasyGolfModule.component('golf', {
    bindings: { leaders: '<', picks: '<' },
    templateUrl: 'components/golf/golf.html',
    controller: golfCtrl,
    controllerAs: 'vm'
})


function golfCtrl($http, $scope, DTOptionsBuilder, DTColumnDefBuilder) {
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
    vm.selectedPlyr = { PlayerName: '' };

    var setHighlights = function () {
        console.log(vm.selectedPlyr.PlayerName + ' chosen.');

    }

    $scope.$watch('vm.selectedPlyr', setHighlights);
    

}
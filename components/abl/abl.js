
var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
    var state = {
        name: 'abl',
        url: '/abl',
        component: 'abl',
        menu: { name: 'ABL', priority: 1 , tag: 'topmenu'},
        requiresParams: false,
        resolve: {
            plyrs: function ($rootScope, $stateParams, ablService) {
                return ablService.getPlayers();

            }
        }
    }; 

    $stateProvider.state(state);
    
});


app.component('abl', {
    bindings: {plyrs:'<' },
    templateUrl: 'components/abl/abl.html',
    controller: ablCtrl,
    controllerAs: 'vm'
})


function ablCtrl($http, $scope) {
  
    var vm = this;  

    vm.treeOptions = {
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return true;
        },
    };



}
var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {

    var state = {
        name: 'ff',
        url: '/ff',
        component: 'fantasyfantasy',
        menu: {
            name: 'Fantasy Fantasy', priority: 10000, tag: 'topmenu'
        },
        requiresParams: false
    };

    $stateProvider.state(state);
});



app.component('fantasyfantasy', {
    bindings: { leaders: '<', picks: '<' },
    templateUrl: 'components/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl,
    controllerAs: 'vm'
})


function ffCtrl($http, $scope) {
    var vm = this;

}

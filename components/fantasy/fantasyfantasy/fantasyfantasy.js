﻿var fantasyFantasyModule = angular.module('fantasyfantasy', ['ui.router'])

fantasyFantasyModule.config(function ($stateProvider) {

    var state = {
        name: 'ff',
        parent: 'fantasyfootball',
        url: '/fantasyfantasy',
        component: 'fantasyfantasy',
        menu: {
            name: 'Fantasy Fantasy', tag: 'submenu'
        },
        requiresParams: false
    };

    $stateProvider.state(state);
});



fantasyFantasyModule.component('fantasyfantasy', {
    bindings: { leaders: '<', picks: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl,
    controllerAs: 'vm'
})


function ffCtrl($http, $scope) {
    var vm = this;

}

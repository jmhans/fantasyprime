var fantasyFantasyModule = angular.module('fantasyfantasy', ['ui.router', 'table-admin', 'statusMessageList'])

fantasyFantasyModule.config(function ($stateProvider) {

    var states = [{
        name: 'ff',
        parent: 'fantasyfootball',
        url: '/fantasyfantasy',
        component: 'fantasyfantasy',
        menu: {
            name: 'Fantasy Fantasy', tag: 'submenu'
        },
        tree: {
            name: 'Fantasy Fantasy', users: 'allTeams'
        },

        requiresParams: false
    },

   
    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });

});



fantasyFantasyModule.component('fantasyfantasy', {
    bindings: {},
    templateUrl: 'components/fantasy/fantasyfantasy/fantasyfantasy.html',
    controller: ffCtrl
})


function ffCtrl() {
    var a = 1;
}

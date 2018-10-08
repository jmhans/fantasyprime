var fantasyFootballModule = angular.module('fantasyFootball', ['footballDex', 'fantasyfantasy'])

fantasyFootballModule.config(function ($stateProvider) {

    var states = [
        {
            name: 'fantasyfootball',
            url: '/ff',
            component: 'fantasyfootball',
            menu: {
                name: 'Fantasy Football', priority: 10000, tag: 'topmenu'
            },
            tree: {name: 'Fantasy Football'}, 
            requiresParams: false            
        },
        {
            name: 'footballdex',
            url: '/fbd',
            parent: 'fantasyfootball',
            component: 'footballdex',
            menu: {
                name: 'FootballDex', tag: 'submenu'
            },
            tree: {
                name: 'FootballDex'
            },
            requiresParams: false
        },
        {
            name: 'mondaymorningquarterbacks',
            parent: 'fantasyfootball',
            url: '/mmq',
            component: 'mmq',
            menu: {
                name: 'Monday Morning Quarterbacks', tag: 'submenu'
            },
            tree: {
                name: 'Monday Morning Quarterbacks'
            },

            requiresParams: false
        },
        {
            name: 'keepers',
            parent: 'mondaymorningquarterbacks',
            url: '/keepers',
            component: 'keepers',
            tree: {
                name: 'Keeper Costs'
            },
            resolve: {
                keepers: function (footballdexService) {
                    return footballdexService.getMMQKeepers();
                }
            },
            requiresParams: false
        },
        {
            name: 'rfa',
            parent: 'footballdex',
            url: '/rfa',
            component: 'rfa',
            resolve: {
                keepers: function (footballdexService) {
                    return footballdexService.getRFAs();
                }
            },
            tree: {
                name: 'RFA'
            },
            menu: {
                name: 'RFA'
            },
            requiresParams: false
        },
    ];


    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});



fantasyFootballModule.component('fantasyfootball', {
    bindings: { },
    templateUrl: 'components/fantasy/fantasyfootball.html',
    controller: fantasyfootballCtrl,
})


function fantasyfootballCtrl($scope, $state, $rootScope, $stateTree) {
    
    $scope.childStates = $stateTree.getChildren('fantasyfootball') //$menus.get().filter(function (m) { return (m.state.parent == 'fantasyfootball'); });

    $scope.treeStates = $stateTree.get();
    $scope.treeChildren = $stateTree.getChildren('footballdex');

    $scope.activeChild = $state.$current.self;

    $scope.menuFilter = function (n) { return (n.tree.position == 'right'); };

    refreshGrandchildren = function (st) {

        $scope.grandChildStates = [];

        if ($scope.childStates.indexOf(st) > -1) {
            $scope.grandChildStates = $stateTree.getChildren($scope.activeChild.name);
        }
    }

    refreshGrandchildren($scope.activeChild);

    $scope.$watch('$root.$state.$current', function (newValue, oldValue) {
        // var nearAnc = $stateTree.nearestAncestor(newValue.self.name);

        var anc = $scope.childStates.find(function (cs) { return (newValue.includes[cs.name]); })

        if (isDefined(anc)) {        
//        if (newValue.self.name == 'fantasyfootball' || newValue.parent.self.name == 'fantasyfootball') {
            $scope.activeChild = anc; // newValue.self;
            // refreshGrandchildren(anc);
        } else {
            $scope.activeChild = $state.get('fantasyfootball');
            
        }
        refreshGrandchildren($scope.activeChild);

    });

    $scope.setUsers = function (usrList) {
        $scope.users = usrList;
    };

    this.users = [];

    this.$onChanges = function (changesObj) {
        console.log(changesObj);
    };

}


fantasyFootballModule.component('footballdex', {
    bindings: {},
    template: '<ui-view />',
    controller: footballDexCtrl,
})


function footballDexCtrl($http, $scope) {

}


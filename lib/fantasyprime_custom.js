
var actuarialGamesModule = angular.module('actuarial.games',
    [
        'ui.router',
        'ui.router.menus',
        'angular-google-gapi',
        'datatables',
        'datatables.bootstrap',
        'datatables.buttons',
        'ui.bootstrap',
        'ui.tree',
        'googlechart',
        'fantasyFootball',
        'abl',
        'fantasyGolf',
        'propBets',
        'state.tree',
        'angular-content-editable',
        'winsPool',
        'bets',
        'aws-cognito'
    ]);

actuarialGamesModule.config(function ($stateProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    var param = function (obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null) query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});

// To account for plunker embeds timing out, preload the async data
actuarialGamesModule.run(['$http', '$rootScope', '$state', '$stateParams', 'cognitoService', function ($http, $rootScope, $state, $stateParams, cognitoService) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function (evt, to, params) {
        if (to.redirectTo) {
            var authorizedRoles = to.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                evt.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is logged in, but not authorized for page.
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in.
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
                
            } else {
                $state.go(to.redirectTo, params, { location: 'replace' })
            }
            
        }
    });
    

}


]);


actuarialGamesModule.controller('ApplicationController', function ($scope, $rootScope, $http, $state, USER_ROLES, AUTH_EVENTS, cognitoService) {
    var userPool = cognitoService.getUserPool();
    $scope.currentUser = userPool.getCurrentUser();
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = cognitoService.isAuthorized;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };
    $scope.signOut = function () {
        cognitoService.signOut();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    }

    $http.get('http://games.espn.com/ffl/api/v2/scoreboard?leagueId=44600&matchupPeriodId=1&seasonId=2018').then(function (resp) {
      var a = resp.data;
    });
    $scope.$on(AUTH_EVENTS.loginSuccess, function (event, data) {
        console.log("Successfully logged in");
        $scope.setCurrentUser(cognitoService.getCurrentUser());  
        $scope.accessToken = data;
        $state.go('contents');
        $scope.$apply();
    });
    $scope.$on(AUTH_EVENTS.logoutSuccess, function (event, data) {
        console.log("Logged out and event handler fired.");
        $scope.setCurrentUser(null);
        $state.go('login');
        $scope.$apply();
    });

})

actuarialGamesModule.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
})

actuarialGamesModule.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});
var ablModule = angular.module('abl', [])

ablModule.config(function ($stateProvider) {
    var states = [{
        name: 'abl',
        url: '/abl',
        component: 'abl',
        menu: { name: 'ABL', priority: 1 , tag: 'topmenu'},
        requiresParams: false,
        resolve: {
            currDt: function () {
                var d = new Date();
                return stringifyDate(d);

            }
        }
    },
    {
        name: 'abl.players',
        url: '/players',
        component: 'ablPlyrs',
        requiresParams: false,
        resolve: {
            players: function (ablService) {
                return ablService.getPlayers('07-08-2017');
            }
        }
    },
    {
        name: 'abl.dougstatsdetail',
        url: '/dougstats/:dt',
        component: 'abldougstats',
        requiresParams: false,
        resolve: {
            dougstats: function ($stateParams, ablService) {
                //return ablService.getDougStats();
            }
        }
    },
    {
        name: 'abl.stats.detail',
        url: '/:dt',
        component: 'ablstatsdetail',
        requiresParams: true,
        resolve: {
            allGames: function ($stateParams, mlbDataService) {
                return mlbDataService.getGamesForDate($stateParams.dt);
            },
            games: function ($stateParams, mlbDataService) {
                var m = mlbDataService.getDailyStats($stateParams.dt);
                return m;
            },
            stats: function (games) {
                var statsArr = [];
                if (games) {
                    games.forEach(function (gmObj) {
                        gmObj.players.forEach(function (plyrObj) {
                            statsArr.push(plyrObj);
                        });
                    });
                }
                return statsArr;
            }
        }
    },
    {
        name: 'abl.dougstats',
        url: '/dougstats',
        menu: { name: 'ABLDS', priority: 3, tag: 'topmenu' },
        component: 'abldougstats',
        redirectTo: 'abl.dougstatsdetail({dt: 06-19-2017})'
    },
    {
        name: 'abl.stats',
        url: '/stats',
        component: 'abl.stats',
        requiresParams: false
    }];

    states.forEach(function (st) {
        $stateProvider.state(st);
    });
    
});


ablModule.component('abl', {
    bindings: { currDt:'<' },
    templateUrl: 'components/abl/abl.html',
    controller: ablCtrl,
    controllerAs: 'vm'
});


function ablCtrl($http, $scope) {
  
    var vm = this;

    //test comment

    vm.treeOptions = {
        accept: function (sourceNodeScope, destNodesScope, destIndex) {
            return true;
        },
    };

}

ablModule.component('abl.stats', {
    templateUrl: 'components/abl/abl_stats.html',
    controller: ablStatsCtrl
});

function ablStatsCtrl(mlbDataService, $scope) {


    this.availableGames = [];
    vm = this;
    vm.getSchedule = function (dt) {
        mlbDataService.getGamesForDate(dt).then(function (resp) {
            vm.availableGames = resp;
        });

    };
    vm.saveAllGames = function () {
        vm.availableGames.forEach(function (gm) {
            vm.saveGameStats(gm.gamePk);
        })
    }
    vm.saveGameStats = function (gmPk) {
        gm = vm.availableGames.find(function (gmItem) { return (gmItem.gamePk == gmPk); })
        gm.isBoxscoreSaved = false;
        getBS = function (gm) {
            mlbDataService.getGameBoxscore(gm.gamePk).then(function (resp) {
                gm.boxscore = resp;
                mlbDataService.saveGameStats(gm).then(function (resp) {
                    gm.isBoxscoreSaved = true;
                })
            })
        }

        getBS(gm);
        
    };
    

}

ablModule.component('ablPlyrs', {
    bindings: { players: '<' },
    templateUrl: 'components/abl/abl_players.html',
    controller: ablPlyrCtrl
});


function ablPlyrCtrl($scope) {

}

ablModule.component('ablstatsdetail', {
    bindings: { games:'<', dt:'<', stats:'<', allGames:'<'},
    templateUrl: 'components/abl/abl_stats_detail.html',
    controller: ablDSCtrl
});


function ablDSCtrl(mlbDataService, $scope) {

    var vm = this;

    //test comment
    vm.saveAllGames = function () {
        vm.allGames.forEach(function (gm) {
            vm.saveGameStats(gm.gamePk);
        })
    }
    vm.saveGameStats = function (gmPk) {
        gm = vm.allGames.find(function (gmItem) { return (gmItem.gamePk == gmPk); })
        gm.isBoxscoreSaved = false;
        getBS = function (gm) {
            mlbDataService.getGameBoxscore(gm.gamePk).then(function (resp) {
                gm.boxscore = resp;
                mlbDataService.saveGameStats(gm).then(function (resp) {
                    gm.isBoxscoreSaved = true;
                })
            })
        }

        getBS(gm);

    };
    $scope.$watch('allGames', function (newValue) {
        console.log('allGames changed:' + newValue);
    })


}
;ablModule.component('multiuserdraft', {
    bindings: { },
    templateUrl: 'components/draft/multiuserdraft.html',
    controller: function () {
        this.teams = []
        this.draftees = []
        this.currentPick = 1


    }
});;var fantasyFootballModule = angular.module('fantasyFootball', ['footballDex', 'fantasyfantasy'])

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

;
var tableAdminModule = angular.module('table-admin', [])

tableAdminModule.config(function ($stateProvider) {

    var states = [{
        name: 'admin',
        parent: 'ff',
        url: '/admin',
        component: 'tableadmincomponent',
        resolve: {
            tableRows: function ($http, AWSFantasyService) {
              var a =  $http.get('data/tempRosterRecords.JSON', {
                cache: false
              }).then(function(resp) {
                var tempRows = resp.data;
                return AWSFantasyService.getRosterRecs().then(function (dbRRs) {
                  tempRows.forEach(function (tr) {
                    if (typeof(dbRRs.find(function(dbRR) {return (dbRR.RECORD_ID == tr.RECORD_ID);})) != 'undefined') {
                      tr.supplemental = {"inDB" : true};
                    }
                  });
                  return tempRows;
                });
                
                
              });
              return a;
            }
        }
    },

    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });

});

tableAdminModule.component('tableadmincomponent', {
    bindings: { tableRows: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/admin/admin.html',
    controller: tableAdminCtrl,
    controllerAs: 'tableCtrl'
});



function tableAdminCtrl($http, DTOptionsBuilder, DTColumnBuilder, AWSFantasyService, $scope, $state) {
  
  
    var vm = this;

    vm.actionsAvailable = true; //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';
    vm.statusMessage = '';

    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10)
        .withOption('lengthMenu', [[10, 25, 50, -1], [10, 25, 50, "All"]])
        .withOption('searching', false)
        .withOption('paging', false)
        .withOption('dom', '')
        .withOption('responsive', true)
    ;
    //vm.dtColumns = [
    //];

    vm.refreshTeams = function () {
        console.log('refresh processed.');
    }

    vm.options = {
        'aoColumns': [{
            'mData': 'id', 'sTitle': 'id'
        },
        {
            'mData': 'TEAM_OWNER', 'sTitle': 'Owner'
        },
        {
            'mData': 'TEAM_NAME', 'sTitle': 'Team Name'
        },
        {
            "mData": 'SEASON', 'sTitle': 'Season'
        },
        {
            "mData": null, 'sTitle': 'Actions'
        }

        ]
    }
    
    vm.itemsToAdd = []

    vm.add = function (itemToAdd) {
        if (vm.actionsAvailable) {
            var index = vm.itemsToAdd.indexOf(itemToAdd);
            vm.itemsToAdd.splice(index, 1);

            if (itemToAdd.owner != '') {
                // Valid entry. Insert into DB. Else, do nothing.  
                vm.statusMessage = 'Adding data'
                AWSFantasyService.addTeam(itemToAdd.owner, itemToAdd.teamName, itemToAdd.season).then(reloadData);
                // $http.post('http://actuarialgames.x10host.com/includes/api.php/footballdex', newItem).then(vm.refreshPlayers);
            }
        } else {
            vm.error = 'Actions currently disabled.'
        }
    }
    vm.moveToAWS = function (itemToMove) {
      const prop = 'supplemental'

      const newItem = Object.keys(itemToMove).reduce( function (object, key) {
        if (key !== prop) {
          object[key] = itemToMove[key];
        }
        return object;
      }, {});
      
      
      AWSFantasyService.addItemToTable("FANTASY_ROSTER_RECORDS", newItem).then(function() {
        itemToMove.supplemental = {"inDB": true};
        reloadData();
      });
    }; 
    vm.addNew = function () {
        vm.itemsToAdd.push({
            owner: '',
            teamName: '',
            season: (new Date).getFullYear()
        });
    }

    vm.removeNew = function (itemToRemove) {
        var index = vm.itemsToAdd.indexOf(itemToRemove);
        vm.itemsToAdd.splice(index, 1);
    }

    vm.deleteItem = function (itemToDelete) {
        if (vm.actionsAvailable) {
            vm.statusMessage = 'Deleting Data'
            $http.delete('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + itemToDelete.id).then(reloadData); //Need to repoint this to the AWSFantasyService. 
        }
    };

    vm.updateItem = function (itemToUpdate) {
        if (vm.actionsAvailable) {

            var newObj = {
                OWNER_ID: itemToUpdate.OWNER_ID,
                SEASON: itemToUpdate.editTeamSeason,
                TEAM_NAME: itemToUpdate.editTeamName,
                TEAM_OWNER: itemToUpdate.editTeamOwner
            };
            vm.statusMessage = 'Updating data'
            AWSFantasyService.updateItem(newObj).then(reloadData);
        }
    }
    vm.dtInstance = {};

    function reloadData() {
        $state.reload();
    }

    updateData = function (updatedItem) {
        console.log(updatedItem);
        console.log(vm.tableRows);
    }

    vm.modifyItem = function (rowObj) {
        rowObj.editable = true;
        rowObj.editTeamOwner = rowObj.TEAM_OWNER
        rowObj.editTeamName = rowObj.TEAM_NAME
    }

    vm.discardModifications = function (rowObj) {
        rowObj.editable = false;
        rowObj.editTeamOwner = ''
        rowObj.editTeamName = ''
    }


    vm.itemsToAddIsEmpty = function () { return (vm.itemsToAdd.length === 0); };

    vm.showError = function () { return (vm.error !== ''); };

    vm.showSuccess = function () { return (vm.successMessage !== ''); };

    vm.showStatus = function () { return (vm.statusMessage !== ''); };

    vm.deleteOkay = function () { return true; };

}



;var fantasyFantasyModule = angular.module('fantasyfantasy', ['ui.router', 'table-admin', 'statusMessageList'])

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
;fantasyFantasyModule.component('allteams', {
    bindings: { fantasyTeams: '<', team: '<', week:'<' , roster: '<', onRosterUpdate: '&', onWaiverClaim: '&'},
    controller: FATableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/freeagents/freeagents.html'
})

function FATableCtrl($uibModal, $log, $document) {



    this.waiversActive = function () {
        d = new Date();
        return (d <= new Date(this.week['Waiver Period End'])) && (d > new Date(this.week['Waiver Period Start']));
    };
    this.addsAvailable = function () {
        d = new Date();
        return (d <= new Date(this.week['Roster Lock Time'])) && (d > new Date(this.week['Waiver Period End']));
    };

    var $ctrl = this;
    this.addTeam = function (teamToAdd, addType) {
        $ctrl.teamToAdd = teamToAdd;
        $ctrl.addType = addType;
        var modalInstance = $uibModal.open({
            animation: false,
            component: 'modalComponent',
            resolve: {
                items: function () {
                    return $ctrl.roster;

                },
                teamToAdd: function () {
                    return { add: teamToAdd, addType: addType };
                },
                week: function () {
                    return $ctrl.week;
                }
            },
            windowClass: 'app-modal-window'
        });
        modalInstance.result.then(function (selectedItem) {
            // $ctrl.selected = selectedItem;
            // $ctrl.addingTeam = teamToAdd;
            $ctrl.droppingTeam = selectedItem;

            switch ($ctrl.addType) {
                case 'add':
                    $ctrl.onRosterUpdate({ rosterRec: $ctrl.teamToAdd, rosterAction: 'add' });
                    $ctrl.onRosterUpdate({ rosterRec: $ctrl.droppingTeam, rosterAction: 'drop' });
                    break;
                case 'waiver':
                    $ctrl.onWaiverClaim({ claimTeam: $ctrl.teamToAdd, conditionalDropTeam: $ctrl.droppingTeam});
                    break;
                default: 
                    
            }

        }, function () {
            $log.info('modal-component dismissed at: ' + new Date());
        })


    }
}


// Please note that the close and dismiss bindings are from $uibModalInstance.

fantasyFantasyModule.component('modalComponent', {
    templateUrl: 'myModalContent.html',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    },
    controller: function () {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            $ctrl.items = $ctrl.resolve.items;
            $ctrl.teamToAdd = $ctrl.resolve.teamToAdd;
            $ctrl.week = $ctrl.resolve.week;
        };

        $ctrl.ok = function () {
            $ctrl.close({ $value: $ctrl.selected.item });
        };

        $ctrl.cancel = function () {
            $ctrl.dismiss({ $value: 'cancel' });
        };
    }
});

;fantasyFantasyModule.config(function ($stateProvider) {
    // An array of state definitions
    var state = 
        {
            name: 'ff.league',
            url: '/league',
            menu: { name: 'League', priority: 10 },
            tree: { name: 'League', position: 'right'}, 
            component: 'league',
            requiresParams: false
        };

     $stateProvider.state(state);
});


fantasyFantasyModule.component('league', {
    bindings: { league: '<' },
    templateUrl: 'components/blank.html'
})

;
fantasyFantasyModule.component('roster', {
    bindings: { roster: '<', team:'<', week: '<', action: '<', weekdetails:'<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html',
    controllerAs: 'rosterCtrl'
})


function RosterTableCtrl($http, AWSFantasyService, $scope, $compile) {

    var vm = this;

    // this.team = $scope.$parent.$ctrl.team;

    vm.loadTime = new Date(); //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';

    vm.dbService = AWSFantasyService

    vm.updateRoster = _updateRoster

    vm.updateTeamRecord = _updateRoster

    vm.getDateTime = function (datetime) {
        var a = (typeof(datetime) == 'undefined' ? new Date() : new Date(datetime))
        return a;
    }

    vm.updateAllowed = function () {
        return (vm.loadTime <= new Date(vm.week['Roster Lock Time']));
    }

    function _updateRoster(rosterRec) {
        starters = vm.roster.filter(function (rr) {return (rr.position == 'Starter');});
        
        if (starters.length <= 7) {
            rosterRec.updating = true;
            rosterRec.info = 'Saving...'
            this.dbService.updateRosterRecord(rosterRec).then(function (response) {
                rosterRec.recno = response;
                rosterRec.updating = false;
                rosterRec.info = ''
            })
        } else {
            rosterRec.position = 'Bench'
            rosterRec.info = 'Too Many Starters'
        }
        
    }



    vm.processAdd = _processAdd

    function _processAdd(dropTeam) {
        alert("Confirmation - Add " + (this.addTeam ? this.addTeam.TEAM_INFO.TEAM_NAME : "") + " and drop " + dropTeam.TEAM_INFO.TEAM_NAME + "?");
    }


 
    

   

}
;fantasyFantasyModule.component('detailedGameResults', {
    bindings: {  games: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/detailedGameResults.html',
    controller: function () {
        this.orderTeams = function (x) {
            return ((x['PRIME_ROSTER_ENTRY']['position']));
        }
    }
});
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [{
        name: 'ff.scoreboard',
        url: '/scoreboard',
        menu: { name: 'Scoreboard', priority: 200 },
        tree: { name: 'Scoreboard' },
        requiresParams: false,
        component: 'scoreboard',
        resolve: {
            scores: function ($stateParams) {

            },
            ff_matchups: function (TeamsService, scores, $stateParams) {
                return TeamsService.getFullSchedule();
            }
        }
    },
      {
          name: 'ff.scoreboard.details',
          url: '/{weekId:int}',
          requiresParams: false,
          component: 'scoreboard.details',
          resolve: {
              scores: function (AWSFantasyService, $stateParams, ScoresService) {
                  var a = AWSFantasyService.getScoresForWeek($stateParams.weekId).then(function (resp) {
                    return resp;
                  })

              },
              teams: function (TeamsService) {
                  return TeamsService.getAllTeams();
              },
              weeklymatchups: function ($stateParams, ff_matchups, scores) {

                  determineResult = function (gameRec) {
                      if (gameRec['Team W'] + 0.5 * gameRec['Team T'] > gameRec['Opp W'] + 0.5 * gameRec['Opp T']) return 'W'
                      if (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)']) return 'W';

                      if (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)']) return 'W';
                      if ((gameRec['Team W'] + 0.5 * gameRec['Team T'] > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
                      return '';
                  }

                  var newArr = ff_matchups.filter(function (matchup) { return (parseInt(matchup.Week) == parseInt($stateParams.weekId)); });
                  newArr.forEach(function (gameRec) {
                      var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { OWNER: { TEAM_NAME: gameRec['Team Name'] } } });
                      var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { OWNER: { TEAM_NAME: gameRec['Opp Name'] } } });

                      gameRec['Team W'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                      gameRec['Team L'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                      gameRec['Team T'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                      gameRec['Opp W'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                      gameRec['Opp L'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                      gameRec['Opp T'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                      gameRec['Pts (Starters)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                      gameRec['Pts (Bench)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });
                      gameRec['Opp Pts (Starters)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                      gameRec['Opp Pts (Bench)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });

                      gameRec['Team Result'] = determineResult(gameRec);
                      gameRec['Subgame Details'] = scoresForTeam;
                      gameRec['Subgame Opp Details'] = scoresForOpp;
                      gameRec['isCollapsed'] = true;

                  });
                  return newArr;
              }

          },
          params: {
              weekId: 14
          }
      }
    ];

    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


fantasyFantasyModule.component('scoreboard', {
    bindings: { scores: '<', teams: '<', games: '<', ff_matchups: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboard.html',
    controller: function ($scope, $log, $state, $http) {

        // $scope.currentWeek = 14;

        $scope.goToWeek = function (wk) {
            $scope.selectedWeek = wk;
            $state.go('ff.scoreboard.details', { weekId: $scope.selectedWeek });
        }


        $scope.currentWeek = $http.get('data/weekDetails.json').then(function (resp) {
            
            var wkDetails = resp.data.weeks.find(function (lookupWk, idx, arr) {
                var d = new Date(lookupWk['Scores Final']);
                var curTime = new Date();
                var last_d = (idx > 0 ? new Date(arr[idx-1]['Scores Final']) : new Date('1970-01-01'));
                return (curTime >= last_d && curTime < d);
            });

            $scope.goToWeek(wkDetails.WeekId);
            return wkDetails.WeekId;

        });

    }
});

fantasyFantasyModule.component('scoreboard.details', {
    bindings: { weeklymatchups: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/scoreboardDetails.html',
    controller: function ($scope, $state) {
        //$scope.isCollapsed = false;

        this.selectedWeek = $state.params.weekId

    }
})


fantasyFantasyModule.component('fantasymatchup', {
    bindings: { scorerecords: '<', ft: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/matchup.html'
});
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
    
    

};
fantasyFantasyModule.config(function ($stateProvider) {
    var states = [
      {
          name: 'teams',
          parent: 'ff',
          url: '/teams',
          component: 'teams',
          requiresParams: false,
          resolve: {
              teams: function ( AWSFantasyService) {
                return AWSFantasyService.getAllTeams();
              },
              fantasyTeams: function ( AWSFantasyService) {
                return AWSFantasyService.getEnrichedRosters().then(function (response) {
                  return response;
                })

              }

          }
      },
      {
          name: 'team',
          // This state takes a URL parameter called teamId
          parent: 'teams',
          url: '/team?teamId&weekId',
          component: 'team',
          // This state defines a 'person' resolve
          // It delegates to the PeopleService, passing the personId parameter
          requiresParams: true,
          resolve: {
              team: function (teams, $transition$) {
                  var tm = teams.find(function (team) { return team.OWNER_ID == $transition$.params().teamId; });
                  return tm;
              },
              week: function ($transition$, AWSFantasyService) {
                 
                  var myWeek = AWSFantasyService.getWeek((parseInt($transition$.params().weekId) || '')).then(function (resp) { return resp });
                  return myWeek;   
              }
          },
          params: {
              teamId: "1"
          },
          menu: { name: "My Team", priority: 1000 },

      },
      {
          name: 'freeagents',
          // This state takes a URL parameter called teamId
          parent: 'team',
          url: '/allteams',
          component: 'allteams',
          menu: { name: 'All Teams', priority: 900 },
          tree: { name: 'All Teams' },
          requiresParams: false
      },
      {
          name: 'detail',
          // This state takes a URL parameter called teamId
          parent: 'team',
          url: '/detail',
          component: 'team.detail',
          resolve: {
            roster: function(AWSFantasyService, team) {
              AWSFantasyService.getActiveRosters().then(function (allrosters) {
              var a = allrosters.filter(function (rosterRec) {
                return (rosterRec.PRIME_OWNER == team.TEAM_NAME);
              })
              return a;
            });
            }
          },
          menu: { name: 'All Teams', priority: 900 },
          tree: { name: 'My Team' }
      },
      {
          name: 'addteam',
          parent: 'team',
          url: '/addteam?addTeamId',
          component: 'addteam',
          requiresParams: false,
          resolve: {
              addTeam: function ( AWSFantasyService, $transition$, roster) {
                return AWSFantasyService.getRosterRecord($transition$.params().addTeamId).then(function(tm) {
                  tm.action = 'Add';
                  return tm;
                });
              }
          }
      }

    ];
    states.forEach(function (st) {
        $stateProvider.state(st);
    });
});


fantasyFantasyModule.component('team', {
    bindings: { team: '<', teams: '<'},
    templateUrl: 'components/fantasy/fantasyfantasy/team/team.html',
    controller: function ($scope, $state, AWSFantasyService) {
        this.changeTeam = function () {
            // console.log($scope.$ctrl.activeTeam);
            $state.go($state.current.name, { teamId: $scope.$ctrl.team.OWNER_ID });
        }

        var $ctrl = this

        this.$onInit = function () {
            $ctrl.loadRosters();
        }

        this.loadRosters = function () {
          AWSFantasyService.getActiveRosters().then(function (allrosters) {
            var a = allrosters.filter(function (rosterRec) {
              return (rosterRec.PRIME_OWNER == $ctrl.team.TEAM_NAME);
            })
            $ctrl.roster = a;
          });

        }
        this.handleRosterUpdate = function (rosterRec, rosterAction) {
            console.log("Roster Updated");
            switch (rosterAction) {
                case 'add':
                    rosterRec.PRIME_OWNER = $ctrl.team.TEAM_NAME;
                    rosterRec.POSITION = 'Bench';
                    break;
                case 'drop':
                    //drop team
                    rosterRec.PRIME_OWNER = '';
                    rosterRec.POSITION= '';
                    break;
            }
            $ctrl.beginUpdate(rosterRec, rosterAction);
            AWSFantasyService.updateRosterRecord(rosterRec).then(function (resp) {
              $ctrl.endUpdate(resp);
              $ctrl.loadRosters();
            }, function (err) {
              $ctrl.failUpdate(claimingTeam.RECORD_ID, err)
            });
          
        }

        this.submitWaiverClaim = function (claimingTeam, conditionallyDroppingTeam) {
            // console.log("submitted claim to add " + claimingTeam + " and drop " + conditionallyDroppingTeam);
            $ctrl.beginUpdate(claimingTeam, 'waiver');
            AWSFantasyService.submitWaiverClaim(claimingTeam, conditionallyDroppingTeam).then(function (resp) {
              $ctrl.endUpdate(claimingTeam.RECORD_ID);
            }, function (err) {
              $ctrl.failUpdate(claimingTeam.RECORD_ID, err)
            });

        }

        this.updating = [];
        this.beginUpdate = function (updateRec, rosterAction) {
            switch (rosterAction) {
                case 'add':
                    updateRec.msg = { text: 'Adding Team' }
                    break;
                case 'drop':
                    updateRec.msg = { text: 'Dropping Team' }
                    break;
                case 'waiver':
                    updateRec.msg = { text: 'Waiver claim submitted for ' }
                    break;
                default:
                    updateRec.msg = { text: 'Updating Team' }
            }

            updateRec.msg.status = 'In progress'
            updateRec.msg.type = 'warning'
            $ctrl.updating.push(updateRec);
        }
        this.endUpdate = function (updateRecID) {
            var idx = $ctrl.updating.findIndex(function (itm) { return (itm.recno == updateRecID); })
            $ctrl.updating[idx].msg.status = "Successful"
            $ctrl.updating[idx].msg.type = "success"
            //$ctrl.updating.splice(idx, 1)
            $ctrl.loadRosters();
        }

        this.closeAlert = function (index) {
            this.updating.splice(index, 1);
        }
        this.failUpdate = function (updateRecID, err) {
            var idx = $ctrl.updating.findIndex(function (itm) { return (itm.recno == updateRecID); });
            $ctrl.updating[idx].msg.status = "Failed: " + err
            $ctrl.updating[idx].msg.type = "danger"

        }


    }
})

fantasyFantasyModule.component('team.detail', {
    bindings: { team: '<', roster: '<', week: '<', teams: '<', reload: '&'},
    templateUrl: 'components/fantasy/fantasyfantasy/team/detail.html',
    controller: function ($scope) {
        this.action = 'standard'
        this.$onInit = function () {
            console.log("initialized");
        }
        this.$onChanges = function(chg) {
            console.log(chg);
        }
        // this.teams = teams
    }
})


fantasyFantasyModule.component('info', {
    bindings: { team: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/info.html',
    controller: teamDetailController
})


function teamDetailController(AWSFantasyService, $scope) {

    this.statusMessage = '';
    this.editMode = false;
    this.edited = false;

    this.originalTeamDetail = $scope.$ctrl.team

    this.editHandler = function (txt, elem) {
        this.edited = true;
    }

    this.saveDataChanges = function () {
      AWSFantasyService.updateOwner(this.team).then(function (resp) {
        console.log('Saved');
        $scope.$ctrl.edited = false;
      });
    }

    //this.$onInit = function () {
    //    $scope.$ctrl.activeTeam = $scope.$ctrl.team
    //}

    this.$onChanges = function (changes) {
        console.log(changes);
        if (changes.team.isFirstChange()) {
            this.originalTeamDetail = changes.team.currentValue
        } else {
            if (this.originalTeamDetail !== changes.team.currentValue) {
                console.log('team was changed from ' + changes.team.previousValue + ' to ' + changes.team.currentValue);
            }
        }


    };


    this.updateItem = function (itemToUpdate) {
        if (this.editMode) {

            var newObj = {
                OWNER_ID: itemToUpdate.OWNER_ID,
                SEASON: itemToUpdate.editTeamSeason,
                TEAM_NAME: itemToUpdate.editTeamName,
                TEAM_OWNER: itemToUpdate.editTeamOwner
            };
            this.statusMessage = 'Updating data'
          AWSFantasyService.updateOwner(newObj).then(reloadData);
        }
    }

    function reloadData() {
        $state.reload();
    }



}


fantasyFantasyModule.component('addteam', {
    bindings: { team: '<', addTeam: '<', roster:'<', week:'<' },
    templateUrl: 'components/fantasy/fantasyfantasy/team/addteam.html',
    controller: addTeamController
})


function addTeamController() {
    this.action = 'add_drop'
    this.actionsAllowed = function () {
        curDate = new Date();
        cutoffDate = new Date("2017-09-07T14:46:30.510Z");


        return
        (this.roster ? (this.roster.length - this.roster.filter(function (r) { return (r.action == 'Drop'); }).length + 1 <= 8) : false) &&
        (curDate <= cutoffDate);
    }

}


;fantasyFantasyModule.component('teams', {
    bindings: { teams: '<'},
    template: '<ui-view />',
    controller: teamsController,
    controllerAs: 'teamsCtrl'
    //template: '<ui-view />'
});

function teamsController($scope, $state) {
    this.teamChange = function () {
        $state.go('team', { teamId: $scope.$ctrl.activeTeam.OWNER_ID });
    }

};
var footballDexModule = angular.module('footballDex', [])

footballDexModule.component('rfa', {
    bindings: {keepers : '='},
    templateUrl: 'components/fantasy/rfa.html',
    controller: footballdexCtrl,
    controllerAs: 'bm'
})

function testC() {

}


        // $scope.params = $routeParams;
function footballdexCtrl($http, DTOptionsBuilder, DTColumnDefBuilder, footballdexService, $scope , $state) {
    var vm = this;

    vm.actionsAvailable = true; //True for testing only. Should be set back to false.

    vm.error = '';
    vm.successMessage = '';
    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(10)
        .withOption('lengthMenu', [[10, 25, 50, -1], [10, 25, 50, "All"]])
        .withOption('searching', false)
        .withOption('paging', false)
        .withOption('dom', '')
        .withOption('responsive', true)
    ;
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1)
    ];

    vm.itemsToAdd = []

    vm.add = function (itemToAdd) {
        if (vm.actionsAvailable) {
            var index = vm.itemsToAdd.indexOf(itemToAdd);
            vm.itemsToAdd.splice(index, 1);
        
            var newItem = {
                team: itemToAdd.team,
                rfa: itemToAdd.rfa,
                season: (new Date).getFullYear()
            }
            if (newItem.rfa != '') {
                // Valid entry. Insert into DB. Else, do nothing.  
                $http.post('http://actuarialgames.x10host.com/includes/api.php/footballdex', newItem).then(vm.refreshPlayers);
            }
        } else {
            vm.error = 'Actions currently disabled.'
        }
    }

    vm.addNew = function () {
        vm.itemsToAdd.push({
            team: '',
            rfa: ''
        });
    }

    vm.removeNew = function (itemToRemove) {
        var index = vm.itemsToAdd.indexOf(itemToRemove);
        vm.itemsToAdd.splice(index, 1);
    }

    vm.refreshPlayers = function () {
        vm.error = '';

        footballdexService.getRFAs().then(function (res) {
            vm.keepers = res;
        });

    }


    vm.deleteItem = function (itemToDelete) {
        if (vm.actionsAvailable) {
            $http.delete('http://actuarialgames.x10host.com/includes/api.php/footballdex/' + itemToDelete.recNo).then(vm.refreshPlayers);
        }
    };

    vm.itemsToAddIsEmpty = function () { return (vm.itemsToAdd.length == 0); };

    vm.showError = function () { return (vm.error != ''); };

    vm.showSuccess = function () { return (vm.successMessage != ''); };

    vm.deleteOkay = function () { return false; };

    vm.submitBid = function (plyr) {
        if (vm.actionsAvailable) {
            vm.error = '';
            vm.successMessage = '';

            if (plyr.bidder == '') {
                vm.error = "Please enter bidder name."
            }

            if (plyr.bidAmount == '') {
                vm.error = "Please enter bid amount."
            }
            var newItem = {
                bidder: plyr.bidder,
                rfa: plyr.rfa,
                bid_amount: plyr.bidAmount,
                season: (new Date).getFullYear()
            }


            if (vm.error == '') {
                // Valid entry. Insert into DB. Else, do nothing.  
                $http.post('http://actuarialgames.x10host.com/includes/api.php/rfa_bids', newItem).then(function SuccessFunction(response) {
                    vm.successMessage =  plyr.bidder + " bid $" + plyr.bidAmount + " on " + plyr.rfa;
                    vm.refreshPlayers();
                });
            }
        } else {
            vm.error = 'No actions currently available.'
        }


    }

};


  ;fantasyFootballModule.component('mmq', {
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


;var betsModule = angular.module('bets', [])

betsModule.config(function ($stateProvider) {
    var state = {
        name: 'bets',
        url: '/bets',
        component: 'betsComponent',
        menu: { name: 'Prop Bets', priority: 1, tag: 'topmenu' },
        requiresParams: false,
        resolve: {
            mlbBoxscores: function (mlbDataService) {
                d = new Date(); 
                s = new Date('03/29/2018');
                tms = [142, 158];
                return mlbDataService.getAllBoxscoresForDates(s,d,tms).then(function (resp){
                    var result = [];
                    resp.forEach(function (tm) {
                        tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                    });
                    return resp;
                });
            },
            //betSummary: function (propBetService) {
            //    return propBetService.getBetList();
            //},
            betData: function (propBetService) {
                return propBetService.getBetDataPromise();
            },
            //betDataPromise: function (propBetService) {
            //    return propBetService.getBetDataPromise();
            //},
            betGraphConfig: function (propBetService) {
                return propBetService.getGraphConfig();
            },
            betSummary: function (betGraphConfig, betData) {
                var betSummary = []
                for (i = 0; i < betGraphConfig.length; i++) {
                    if (betGraphConfig[i].betSides) {
                        betGraphConfig[i].betSides.forEach(function (side) {
                            side.curVal = getValFromArrayColumn(betData, side.seriesName) + side.adjustment
                        });
                    };
                    betSummary.push({
                        "betNumber": betGraphConfig[i].betNumber,
                        "betYear": betGraphConfig[i].betYear,
                        "betDescription": betGraphConfig[i].betDescription,
                        "betSides" : betGraphConfig[i].betSides
                    });
                }
                return betSummary;
            }

        }
    };

    $stateProvider.state(state);

});

betsModule.component('betsComponent', {
    bindings: {  betSummary: '<', betData:'<', betGraphConfig:'<', mlbBoxscores:'<'},
    templateUrl: 'components/fun/bets.html',
    controller: betsCtrl
});

function betsCtrl($http, $scope, googleChartApiPromise, propBetService) {

    $ctrl = this;

    $scope.myChart = {};
    init();
    function init() {
        googleChartApiPromise.then(chartApiSuccess);
    }

    function chartApiSuccess() {

        graphBets = $ctrl.betGraphConfig;
        $scope.allData = new google.visualization.arrayToDataTable($ctrl.betData, false);
        
        graphBets.forEach(function (graphBet) {
            var colIndexes = [0];
            graphBet.chtOptions = {
                seriesType: 'line',
                series: {},
                height: 400,
                width: 600
            }

            for (i = 0; i < graphBet.chartSeries.length; i++) {
                graphBet.chtOptions.series[i] = { color: graphBet.chartSeries[i].seriesColor, type: graphBet.chartSeries[i].seriesType }
                colIndexes.push($ctrl.betData[0].indexOf(graphBet.chartSeries[i].seriesLookup));
            }
            graphBet.view = new google.visualization.DataView($scope.allData);
            graphBet.view.setColumns(colIndexes);

            $scope[graphBet.betDescription] = drawGoogleChart(graphBet.view, graphBet.chtOptions);


        });
        


    }
    function saveData() {
        propBetService.saveBetData('tempBets', { "fake": 3, "otherFake": "string" }).then(function (resp) {
            return resp.data;
        })
    }


}


function drawGoogleChart(dataVu, options) {
    return {
        type: "ComboChart",
        cssStyle: "height:1000px; width:100%",
        options: options,
        data: dataVu
    };
}


function getValFromArrayColumn(data,columnName, rowNum) {
    var colNum = data[0].indexOf(columnName);
    var len = data.length;
    var retVal = '';
    if (rowNum) {
        return data[rowNum][colNum];
    } else {
        rowNum = len -1;
        while (!data[rowNum][colNum]){
            rowNum--;
        };
        return data[rowNum][colNum];
    }
}

betsModule.filter('numbersWithoutTrailingZero', function ($filter) {
    return function (input, decimalPlaces) {
        if (input % 1) {
            return $filter('number')(input, decimalPlaces);
        }
        return $filter('number')(input, 0);
    };
});;
var propBetModule = angular.module('propBets', [])

propBetModule.config(function ($stateProvider) {
    var state = {
        name: 'propbets',
        url: '/fun',
        component: 'propbets',
        menu: { name: 'Andy vs Justin', priority: 1 , tag: 'topmenu'},
        requiresParams: false,
        resolve: {
            bbRecs : function (propBetService) {
                return propBetService.getBBDataJSON();
            },
            configData: function (propBetService) {
                var ret = propBetService.getConfigDataJSON();
                

                return ret;
            },
            updateTime: function (propBetService) {
                return propBetService.getLastUpdateTime();
            },
            betSummary: function (propBetService) {
                return propBetService.getBetSummaryJSON();
            }
        }
    }; 

    $stateProvider.state(state);
    
});


propBetModule.component('propbets', {
    bindings: { bbRecs: '<', configData: '<'  ,betSummary: '<', updateTime: '<'},
    templateUrl: 'components/fun/fun.html',
    controller: propBetCtrl
})


function propBetCtrl($http, $scope, $q, googleChartApiPromise) {
    $scope.curYr = 2018;
    $scope.yrs = [];

    $q.when($scope.$ctrl.configData, setYrs);

    $q.all({ api: googleChartApiPromise }).then(drawAll);

    function setYrs() {
        $scope.$ctrl.configData.forEach(function (rec) {
            if ($scope.yrs.indexOf(rec.Season) == -1) {
                $scope.yrs.push(rec.Season);
            }
        });
    }

    $scope.$watch('curYr', function () {

        $scope.$ctrl.filteredRecs = $scope.$ctrl.configData.filter(function (rec) {
            return (rec.Season == $scope.curYr);
        });
        $scope.$ctrl.bbRecs_filtered = $scope.$ctrl.bbRecs.filter(function (rec, idx) { return ((rec[17] == $scope.curYr) || (idx == 0)); });
        drawAll();

    });

    function drawAll(result) {

        drawTable();

        $scope.$ctrl.arrayData = new google.visualization.arrayToDataTable($scope.$ctrl.bbRecs_filtered, opt_firstRowIsData = false);
        
        $scope.$ctrl.filteredRecs.forEach(function (rec) {

            var cols = [Number(rec['X series'])];

            if (rec['Dark Blue'] != null) { cols.push(Number(rec['Dark Blue'])); }
            if (rec['Dark Red'] != null) { cols.push(Number(rec['Dark Red'])); }
            if (rec['Light Blue'] != null) { cols.push(Number(rec['Light Blue'])); }
            if (rec['Light Red'] != null) { cols.push(Number(rec['Light Red'])); }

            $scope[rec.SafeTitle] = drawChart(
                    rec.Title,
                    cols,
                    rec['Y Axis Label'],
                    rec['Y Axis Minimum']
                    );
        });


    };


    function drawTable() {
	    
        // transform the CSV string into a 2-dimensional array
        var data = new google.visualization.arrayToDataTable($scope.$ctrl.betSummary, opt_firstRowIsData=false);
 	  
        // this view can select a subset of the data at a time
        var view = new google.visualization.DataView(data);
        view.setRows(data.getFilteredRows([{ column: 14, value: $scope.curYr }]));
        view.setColumns([0,1,2,3,4,5,6,7,8,9,10,11,12,13]);

        $scope.betTable = {
            type: "Table",
            data: view
        };
    };

    function drawChart(chartTitle, dataCols, yLabel, altMinY) {

        // this new DataTable object holds all the data
        
        // this view can select a subset of the data at a time
        var view = new google.visualization.DataView($scope.$ctrl.arrayData);

        view.setColumns(dataCols);
        var minY = view.getColumnRange(1).min;
        var maxY = view.getColumnRange(1).max;
        for (var i = 1; i < view.getNumberOfColumns() ; i++) {
            minY = Math.min(minY, view.getColumnRange(i).min);
            maxY = Math.max(maxY, view.getColumnRange(i).max);
        }
        var vAxisOptions = '';
        var hAxisOptions = '';
        // set chart options
        if (altMinY != 0) {
            minY = altMinY;
            hAxisOptions = { title: view.getColumnLabel(0), viewWindow: { max: Math.max(10, view.getColumnRange(0).max), min: view.getColumnRange(0).max - 30 } };
            vAxisOptions = { title: yLabel, viewWindow: { max: maxY, min: minY } };
        } else {
            hAxisOptions = { title: view.getColumnLabel(0), minValue: view.getColumnRange(0).min, maxValue: Math.max(10, view.getColumnRange(0).max) };
            vAxisOptions = { title: yLabel, viewWindow: { max: maxY, min: minY }, viewWindowMode: 'maximized' };
        }

        var options = {
            title: chartTitle,
            interpolateNulls: false,
            hAxis: hAxisOptions,
            vAxis: vAxisOptions,
            series: {
                0: { color: '#3366FF' }, // Blue - MIL_DIFF
                1: { color: '#FF0000' }, // Red - MIN_Diff
                2: { color: '#C2D1FF' }, // Light Blue - Mil Target
                3: { color: '#FF9999' } // Light Red - Minn Target
            },
            'height': 400,
            'width': 600
        };

        // create the chart object and draw it

        return {
            type: "LineChart",
            cssStyle: "height:600px; width:100%",
            options: options,
            data: view
        };


    };


}








;var winsPoolModule = angular.module('winsPool', [])



winsPoolModule.config(function($stateProvider) {
  var state = {
    name: 'winsPool',
    url: '/winsPool',
    component: 'winsPoolComponent',
    menu: {
      name: 'Wins Pool',
      priority: 1,
      tag: 'topmenu'
    },
    requiresParams: false,
    resolve: {
      mlbStandings: function(mlbDataService) {
        return mlbDataService.getStandings().then(function(resp) {
          return resp;
        });
      },
      nflStandings: function(nflScoresService) {
        const seasonId = "2018"
        return nflScoresService.getScoreboard(seasonId).then(function(resp) {
          // need a nice reduce function here to convert from individual game results into a standings array. 
          var standings = resp.reduce(function (results, gm) {
            if (gm.homeResult !== '') {
              if (!results.hasOwnProperty(gm.homeTeam)) {
                results[gm.homeTeam] = {"wins": 0, "losses": 0, "ties": 0};
              }
              results[gm.homeTeam].wins += (gm.homeResult == 'W');
              results[gm.homeTeam].losses += (gm.homeResult == 'L')
              results[gm.homeTeam].ties += (gm.homeResult == 'T')

              if (!results.hasOwnProperty(gm.awayTeam)) {
                results[gm.awayTeam] = {"wins": 0, "losses": 0, "ties": 0};
              }
              results[gm.awayTeam].wins += (gm.awayResult == 'W');
              results[gm.awayTeam].losses += (gm.awayResult == 'L')
              results[gm.awayTeam].ties += (gm.awayResult == 'T')
            }
            return results;
          }, {});
          
          var output = [];
          for (var key in standings) {
            output.push({"team": {"name": key}, "season": seasonId, "leagueRecord": standings[key]})
          }
          
          return output;
        });
      },
      picks: function($http, mlbStandings, nflStandings) {
        return $http.get('./data/picks.json').then(function(picks) {
          var output = {};
          const leagueGames = {"MLB": 162, "NFL": 16}
          var projectedWins = function(pk) {
            
            const w = (typeof(pk.leagueRecord.wins) === 'undefined') ? 0 : pk.leagueRecord.wins
            const l = (typeof(pk.leagueRecord.losses) === 'undefined') ? 0 : pk.leagueRecord.losses
            const t = (typeof(pk.leagueRecord.ties) === 'undefined') ? 0 : pk.leagueRecord.ties; 
            return leagueGames[pk.League] * (w + 0.5 * t) / (w + l + t);
          }

          
          picks.data.forEach(function(pick) {
            var standings = (pick.League == "MLB") ? mlbStandings : nflStandings;
            
            pick.leagueRecord = standings.find(function(tm) {
              return (tm.team.name == pick.Pick);
            }).leagueRecord;
            pick.projectedWins = projectedWins(pick);
            
          });
          
          return picks.data;
        });
      }
    }
  };

  $stateProvider.state(state);

});

winsPoolModule.component('winsPoolComponent', {
  bindings: {
    picks: '<'
  },
  templateUrl: 'components/fun/winsPool.html',
  controller: winsPoolCtrl
});

function winsPoolCtrl($http, $scope, nflScoresService, mlbDataService) {
  var ctrl = this
  function sortOn(collection, name) {
    collection.sort(
      function(a, b) {
        if (a[name] <= b[name]) {
          return (-1);
        }
        return (1);
      }
    );
 }
 ctrl.sortBy = function(sortbyParameter) {
   return function(a) {
    const val = a[sortbyParameter];
     if (isNaN(val)) {
       return val;
     } else return parseFloat(val);
   }
 }

  ctrl.leagueFilter = function(el) {return (el.League == ctrl.selectedLeague);}  
  
  ctrl.leagues = ["NFL", "MLB"];
  ctrl.seasons = [2018];
  
  ctrl.aggRecord = function (pks) { 
    if (typeof(pks) === 'undefined') return '';
    return pks.reduce(function (total, pk) {
      for (var key in pk.leagueRecord) {
        if(!total.hasOwnProperty(key)) {
           total[key] = 0 
        }
        total[key] += pk.leagueRecord[key]
      }
      if (!total.hasOwnProperty('projectedWins')) {
        total.projectedWins = 0;
      }
      total.projectedWins += pk.projectedWins;
      return total;
    }, {})
  }
  
  $scope.$watch('$ctrl.selectedLeague', function() {
    ctrl.regroup();
  });

  ctrl.sumProp = function(itemList, propName) {
    var propList = propName.split(".");
    return itemList.reduce(function(total, itm) {
      var result = itm;
      for (p=0; p<propList.length; p++) {
        result = result[propList[p]] || 0
      }
      total += result;
      return total;
    }, 0)
  };
  
  
  ctrl.regroup = function() {
    // Function based on this blog post: https://www.bennadel.com/blog/2456-grouping-nested-ngrepeat-lists-in-angularjs.htm
    ctrl.groups = [];
    var attribute = "Name";
    sortOn(ctrl.picks, attribute);
    var groupValue = "_INVALID_GROUP_VALUE_";

    for (i = 0; i < ctrl.picks.length; i++) {
      var pick = ctrl.picks[i];
      if (pick.League == ctrl.selectedLeague && pick.Season == ctrl.selectedSeason) {
        if (pick[attribute] !== groupValue) {
          var group = {
            label: pick[attribute],
            picks: []
          };
          groupValue = group.label;
          ctrl.groups.push(group);
        }

        // Add the pick to the currently active
        // grouping.
        group.picks.push(pick);
      }
    }
    
    ctrl.groups.sort(function (a, b) {
      function groupProj(grp) {
        return grp.picks.reduce(function (total, pk) {
          total += pk.projectedWins;
          return total
        }, 0);
      }
      return -1 * (groupProj(a) - groupProj(b));
    });
  }
  
  ctrl.$onInit = function () {
    ctrl.selectedLeague = ctrl.leagues[0];
    ctrl.selectedSeason = ctrl.seasons[0];
    ctrl.regroup();
  }
  
  
  ctrl.expand = function(item) {
    item.show = !item.show;
  }
  ctrl.winPct = function(pickObj) {
    return pickObj.data.wins / (pickObj.data.wins + pickObj.data.losses);
  };
};
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
    

};'use strict';

var AWScognito = angular.module('aws-cognito', ['login', 'signup', 'activate']);


AWScognito.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('base', {
          abstract: true,
          url: '',
          templateUrl: 'components/login/base.html'
      })
      .state('login', {
          url: '/login',
          parent: 'base',
          title: 'Login',
          templateUrl: 'components/login/login.html',
          controller: 'LoginCtrl',
          menu: { name: "Login", priority: 1, tag: 'topmenu' },
      })
      .state('signup', {
          url: '/signup',
          parent: 'base',
          title: 'Sign Up',
          templateUrl: 'components/login/signup.html',
          controller: 'SignupCtrl',
          menu: { name: "Register", priority: 2, tag: 'topmenu' },
      })
      .state('activate', {
          url: '/activate',
          parent: 'base',
          title: 'Activate',
          templateUrl: 'components/login/activate.html',
          controller: 'ActivateCtrl',
          menu: { name: "Activate", priority: 3, tag: 'topmenu' },
      })
      .state('contents', {
          url: '/contents',
          title: 'Contents',
          templateUrl: 'components/login/contents.html',
          controller: 'ContentsCtrl',
          menu: { name: "Contents", priority: 4, tag: 'topmenu' }
      });
});

var activateModule = angular.module('activate', []);
    
activateModule.controller('ActivateCtrl', function ($scope, $rootScope, $location, cognitoService) {

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var cognitoUser = cognitoService.getUser(userPool, $('#userName').val());
        var activationKey = $('#activationCode').val();

        cognitoUser.confirmRegistration(activationKey, true, function (err, result) {
            if (err) {
                console.log(err);

                $scope.errorMessage = err.message;
                $scope.$apply();
                return;
            }

            $location.path('/login');
            $scope.$apply();
        });
    };

    return false;
});


'use strict';

activateModule.controller('ContentsCtrl', function($scope, $rootScope, $state, $http, $location, cognitoService) {

  this.dt = new Date();

  var authToken;
  cognitoService.authToken.then(function setAuthToken(token) {

    if (token) {
      authToken = token;

      $http({
        method: 'GET',
        url: "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/teststats?&gamedate=2018-08-15",
        headers: {
          Authorization: authToken
        },
        //data: JSON.stringify({
        //              PickupLocation: {
        //                  Latitude: 47.61226823896646,
        //                  Longitude: -122.30073028564247
        //              }
        //}),
        contentType: 'application/json'

      }).then(function successCallback(response) {
        console.log("AWS DB API call worked:" + response);
      }, function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
      });
      
      $http({
        method: 'POST', 
        url: "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/fantasyprime", 
        headers: {
          Authorization: authToken
        }, 
        data: JSON.stringify({tableName: "FANTASY_TEAMS", requestType: 'QUERY', record: {}})
      }).then(function successCallback(response) {
        console.log("AWS API call worked:" + response);
        
      }, function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error', textStatus, ', Details: ', errorThrown);
      });

    } else {
      $state.go('login');
    }
  });



});;
'use strict';

var loginModule = angular.module('login', [])

loginModule.controller('LoginCtrl', function ($scope, $state, $rootScope, $location, USER_ROLES, AUTH_EVENTS, cognitoService) {

    if (cognitoService.isAuthorized()) {
        $state.go('contents');
    }

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var cognitoUser = cognitoService.getUser(userPool, $('#username').val());
        var authenticationDetails = cognitoService.getAuthenticationDetails($('#username').val(), $('#password').val());

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                var accessToken = result.getAccessToken().getJwtToken();
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, accessToken);
                $rootScope.$broadcast(AUTH_EVENTS.authenticated, accessToken);
            },
            onFailure: function (err) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, '');
                $scope.errorMessage = err.message;
                $scope.$apply();
            },

        });
    };

    $scope.forgotPassword = function () {
        var userPool = cognitoService.getUserPool();
        var cognitoUser = cognitoService.getUser(userPool, $('#username').val());
            
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                console.log('call result: ' + result);
            },
            onFailure: function (err) {
                alert(err);
            },
            inputVerificationCode: function() {
                var verificationCode = prompt('Please input verification code ', '');
                var newPassword = prompt('Enter new password ', '');
                cognitoUser.confirmPassword(verificationCode, newPassword, this);
            }
        });
    }
    

});;'use strict';

var signupModule = angular.module('signup', []);

signupModule.controller('SignupCtrl', function ($scope, $location, cognitoService) {

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var nameParam = {
            Name: 'name',
            Value: $('#name').val()
        };

        var emailParam = {
            Name: 'email',
            Value: $('#email').val()
        };

        var attributes = cognitoService.getUserAttributes(nameParam, emailParam);
        // attributes.push({ name: 'role', value: 'user' });
        userPool.signUp($('#userName').val(), $('#password').val(), attributes, null, function (err, result) {
            if (err) {
                console.log(err);
                $scope.errorMessage = err.message;
                $scope.$apply();
                return;
            } else {
                console.log(result);

                $location.path('/activate');
                $scope.$apply();
            }
        });

        return false;
    }

});;
fantasyFantasyModule.controller('DatepickerCtrl', function ($scope, $rootScope, $state, $stateParams) {
    if (typeof $state.params.dt !== 'undefined') {
        // the variable is defined
        $scope.dt = new Date($state.params.dt);
    } else {
        $scope.dt = new Date();
    }

   $scope.today = function () {
        $scope.dt = new Date();

        //$scope.dt = $scope.$parent.$ctrl.dt;
    };
    //$scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: new Date(2010, 4, 1),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return false; //mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }


    $scope.open = function () {
        $scope.popup.opened = true;
    };


    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['MM-dd-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup = {
        opened: false
    };

    /*$scope.$watch('$scope.dt', function ( newVal, oldVal) {
        console.log($scope.dt);
        startDt = $scope.dt;

        strDate = stringifyDate(startDt);

        $state.go('abl.stats.detail', { dt: strDate });
    })*/




});;var stateTreeModule = angular.module('state.tree', ['ng', 'ui.router']);

var isDefined = angular.isDefined;;const CURRENT_SEASON = 2018

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function stringifyDate(dt) {
    var d = new Date(dt)
    var ret = pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) + "-" + d.getFullYear();
    return ret;
}

Array.prototype.filterWithCriteria = function (critObj) {

    function matchesProp(item, match) {
        if (typeof match != "object") {
            return (item === match);
        } else {
            return Object.keys(match).every(function (key) {
                return matchesProp((item[key] ? item[key] : ''), match[key]);
            });
        }
    }

    return this.filter(function (entry) {
        return (matchesProp(entry, critObj));
    })
}


Array.prototype.SUMIFS = function (sumProp, critObj) {
    return this.filterWithCriteria(critObj).reduce(function (total, curVal) { return total + parseFloat(curVal[sumProp]) }, 0);
}

contains = function (needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (needle) {
            var i = -1, index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

Array.prototype.sumProp = function (prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop]
    }
    return total
}


getStatusforTime = function (curTime) {
    curTime = (curTime || new Date());
    var SEASON_START_DATE = new Date("2017-09-07"); //First Thursday game date of the NFL season

    var myWeek = (parseInt($transition$.params().weekId) || Date.dateDiff('w', SEASON_START_DATE, curTime) + 1);
    return myWeek;

    nextReoccurringTime = function (curTime, reoccurDay /*SUNDAY in TZ is 0, MONDAY in TZ is 1...*/, reoccurTime /*Time expressed in '00:00:00' string format*/, tzName) {
        tzName = (tzName || "America/Chicago")
        reoccurDay = (reoccurDay || 0);
        reoccurTime = (reoccurTime || "00:00:00")
        curTZtime = new Date(moment.tz((curTime || new Date), tzName).toJSON());

        if (curTZtime.getDay() < reoccurDay) {
            // It's before Wednesday (CT), so add 1, 2, or 3 days
            dayAdd = 3 - curTZtime.getDay();
        } else if (curTZtime.getDay() == reoccurDay && curTZtime <= Date(moment.tz(curTZtime.getFullYear() + "-" + (curTZtime.getMonth() + 1) + "-" + (curTZtime.getDate()) + " " + reoccurTime, tzName).toJSON())) {
            // It is Wednesday (CT), so check the hours. If it's before the process time, add 7 days
            dayAdd = 0; 
        } else {
            // It is after Wednesday (CT), so add 3, 4, 5, or 6 days
            dayAdd = 7 - (3 - curTZtime.getDay());
        }

        return new Date(moment.tz(curTZtime.getFullYear() + "-" + (curTZtime.getMonth() + 1) + "-" + (curTZtime.getDate() + dayAdd) + " " + reoccurTime, tzName).toJSON())
        
    }
    
    nextGameStart = rangeArrayLookup(new Date, a);
    
    // Thursday 7:00PM - Wednesday 5:00PM: WAIVER_PERIOD // rosterMoves : {type: 'WAIVER', week: this_week}
    // Wednesday 5:00PM - Thursday 7:00PM: FREE_AGENT_PICKUP_PERIOD // rosterMoves : {type: 'FREE_AGENT', week: this_week}

    return ;

}

rangeArrayLookup = function (needle, range_array) {
    // Returns 1st the element of an array that is greater than or equal to the needle
    range_array.sort()
    j = 0 
    for (i = 0; i < range_array.length; i++) {
        if (range_array[i] < needle) {
            j = i + 1;
        }
    }
    return range_array[Math.min(range_array.length, j)];
}


getTimeZoneOffsetForTimeZone = function (dtString, tz) {
    var dt = new Date(dtString);
    tz = (tz || 'America/Chicago');
    a = moment.tz(dtString, tz);
    utcDate = new Date(a.toJSON())
    return utcDate.getTimezoneOffset();
}


Date.dateDiff = function (datepart, fromdate, todate) {
    datepart = datepart.toLowerCase();
    var diff = todate - fromdate;
    var divideBy = {
        w: 604800000,
        d: 86400000,
        h: 3600000,
        n: 60000,
        s: 1000
    };

    return Math.floor(diff / divideBy[datepart]);
}

Date.prototype.slashFormat = function () {
    

    MyDateString = ('0' + (this.getMonth() + 1)).slice(-2) + '/'
                    + ('0' + this.getDate()).slice(-2) + '/'
                    + this.getFullYear();

    return MyDateString;
};

var statusMsgListModule = angular.module('statusMessageList', [])

statusMsgListModule.component('statusMessageList', {
    bindings: { },
    template: '<ul><li uib-alert ng-repeat="alert in $ctrl.alerts" ng-class="alert-(alert.type || warning)" close="$ctrl.closeAlert($index)">{{alert.msg}}</li></ul>',
    controller: statusMessageListController,
})


function statusMessageListController() {
    var $ctrl = this;
    this.$onInit = function () {
        $ctrl.alerts = [];
    }

    this.addMessage = function (msg) {
        msg.type = (msg.type || 'info');
        $ctrl.alerts.push(msg);
        return $ctrl.alerts.length()-1;
    }
    this.closeAlert = function (msgIdx) {
        $ctrl.alerts.splice(msgIdx, 1);
    }
    this.updateMessage = function (msg) {

    }

}

;//var ssID = '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns';
var ssID = '1Q2e_brKxu3aXer7-T1SUO7HLv9xr9STwNLHCR9YfKNc';
// Note: All returnRanges will be sent back as a JSON object where the name of the element is the name of the sheet. (Or, technically, the stuff before the ! in the range name). 
var returnRanges = [
    'RosterRecords!A:G'
    ,'Scores!A:Y'
    //,'ScoreFlattener!A:V'
    ,'Standings'//,
    //'Regular Season Standings'
]


function stripSheetName(fullRangeString) {
    var n = fullRangeString.indexOf("!")
    return fullRangeString.substring(0, n);
}

function convertSSArraytoJSON(arr, headerIndex) {
    if (typeof headerIndex === 'undefined') { headerIndex = 0; }
    var outputArr = [];
    for (i = 0; i < arr.length; i++) {
        if (i != headerIndex) {
            var obj = {};
            for (j = 0; j < arr[headerIndex].length; j++) {
                if (typeof arr[i][j] === 'undefined') {
                    obj[arr[headerIndex][j]] = '';
                } else {
                    obj[arr[headerIndex][j]] = arr[i][j];
                }
            }
            outputArr.push(obj);
        }
    }
    return outputArr;
}




actuarialGamesModule.service('GoogleSheetsService', ['$rootScope', '$q', function ($rootScope, $q) {
    var CLIENT_ID = '1005055514218-blfai4g2nid0s7bvvdgc1ekltvfnk591.apps.googleusercontent.com';
    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
    var domain = '';
    var deferred = $q.defer();
    
    var service = {
        getRosters: function() {
            return service.getData().then(function (data) {
                return data.RosterRecords;
            }, function (err) {
                console.log('Failed: ' + err);
            });
        },
        getStandings: function () {
            
            return service.getData().then(function (data) {
                return data.Standings;
            }, function (err) {
                console.log('Failed: ' + err);
            });
            //return Promise.resolve([1, 2, 3, 4, 5, 6]);

        },
        getScores: function () {
            
            return service.getData().then(function (data) {
                return data.ScoreFlattener;
            }, function (err) {
                console.log('Failed: ' + err);
            });

        },
        getScoresforWeek: function (wkID) {
            return service.getScores().then(function (data) {
                return data.filter(function (itm) { return (itm.Week == wkID); });
            });
        },

        writeRosterRecord: function (newRecords) {
            var insertRecs = [];
            if (typeof (newRecords) === 'object') {
                if (newRecords.isArray) {
                    
                } else {
                    newRecords = [newRecords];
                }
                for (var recNo = 0; recNo < newRecords.length; recNo++) {
                    insertRecs.push([
                        newRecords[recNo].RecNo,
                        newRecords[recNo].TeamID,
                        newRecords[recNo]['TeamName (RefOnly)'],
                        newRecords[recNo].Owner,
                        new Date(),
                        '',
                        newRecords[recNo].Position
                    ]);
                }
            };


            return gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: ssID,
                range: 'RosterRecords!A1',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                includeValuesInResponse: true,
                values: insertRecs
            }).then(function (resp) {

            })
        },

        login: function () {
            var a = gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: true, 
                hd: domain 
            }, service.handleAuthResult);
            return deferred.promise;
        },

        getData: function () {

            var retObj = $q.defer();

            var handleAuth = function (authResult) {
                if (authResult && !authResult.error) {
                    retObj.resolve(service.loadSheetsApi());
                }
            };

            gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: true, 
                hd: domain 
            }, handleAuth);

            return retObj.promise;
        }, 
        handleAuthResult: function (authResult) {
            var authorizeDiv = document.getElementById('authorize-div');
            if (authResult && !authResult.error) {
                // Hide auth UI, then load client library.
                authorizeDiv.style.display = 'none';
                return Promise.resolve(service.loadSheetsApi());
            } else {
                // Show auth UI, allowing the user to initiate authorization by
                // clicking authorize button.
                authorizeDiv.style.display = 'inline';
            }
        },
        handleAuthClick: function(event) {
            return gapi.auth.authorize({
                client_id: CLIENT_ID,
                scope: SCOPES,
                immediate: false
            },service.handleAuthResult);
            // return false;
        },

        loadSheetsApi: function () {


            var discoveryUrl =
                'https://sheets.googleapis.com/$discovery/rest?version=v4';
            var a = gapi.client.load(discoveryUrl).then(service.retrieveAllRanges);
            return a;
        },

        retrieveAllRanges: function() {
            var a = gapi.client.sheets.spreadsheets.values.batchGet({
                spreadsheetId: ssID,
                ranges: returnRanges,
            }).then(function (resp) {
                var outputJSON = {};
                // return convertSSArraytoJSON(resp.result.values);
                for (var sht = 0; sht < resp.result.valueRanges.length; sht++) {
                    outputJSON[stripSheetName(resp.result.valueRanges[sht].range)] = convertSSArraytoJSON(resp.result.valueRanges[sht].values)
                }

                return outputJSON;
            });
            return a;
        }


    }

    return service;
}]);
;;
ablModule.service('ablService', function ($http) {
    var service = {
        getPlayers: function (effDate) {
            var qry = 'SELECT * from stats'; // Need to write appropriate query for stat display. And include JOIN into abl_lineups.
            var dataObj =  {functionname: 'db_select', effDate: effDate, teamName: 'Machines'};
            return $http({
                url: 'http://actuarialgames.x10host.com/includes/abl_db.php',
                dataType: 'json',
                method: 'POST',
                data: dataObj,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function (resp) {
                    return resp.data.result.players;
            });
        },

        getDougStats: function () {
            return $http.get("data/20170619.csv").then(function (resp) {
                var csvData = resp.data;
                var config = {
                    delimiter: "",	// auto-detect
                    newline: "",	// auto-detect
                    quoteChar: '"',
                    header: true,
                    dynamicTyping: false,
                    preview: 0,
                    encoding: "",
                    worker: false,
                    comments: false,
                    step: undefined,
                    complete: undefined,
                    error: undefined,
                    download: false,
                    skipEmptyLines: true,
                    chunk: undefined,
                    fastMode: undefined,
                    beforeFirstChunk: undefined,
                    withCredentials: undefined
                };


                var jsonData = Papa.parse(csvData, config);

                return jsonData.data.filter(function (itm) { return (itm.Player != '');});
            });
        }
        
    };

    return service;
});actuarialGamesModule.service('cognitoService', function () {

    // Region
    AWS.config.region = 'us-east-1'; // Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:167da025-fe57-48c9-a814-d956ca92ca95',
    });

    //// Cognito User Pool Id
    //AWSCognito.config.region = 'us-east-1';
    //AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    //    IdentityPoolId: 'us-east-1_JkFX0MtS9'
    //});
    authService = {};
    authService.currentAuthToken = '';
    authService.getUserPool = function () {
        var poolData = {
            UserPoolId: 'us-east-1_JkFX0MtS9',
            ClientId: '19h0k0bp8ao9fd3tnl0blm0smb'
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        return userPool;
    };

    authService.getUser = function (userPool, username) {
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        return cognitoUser;
    };

    authService.getAuthenticationDetails = function (username, password) {
        var authenticationData = {
            Username: username,
            Password: password
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        return authenticationDetails;
    };
    authService.signOut = function () {

        currentUser = authService.getCurrentUser();
        if (currentUser != null) {
            currentUser.signOut();
        }
        return;
    };
    authService.getCurrentUser = function () {
        return authService.getUserPool().getCurrentUser();
    }

    authService.getUserAttributes = function () {
        var attributes = [];
        for (var i = 0; i < arguments.length; i++) {
            var attr = new AmazonCognitoIdentity.CognitoUserAttribute(arguments[i]);
            attributes.push(attr);
        }
        return attributes;
    };

    authService.updateAttributes = function (attr) {
        var attributeList = [];
        var attribute = new AmazonCognitoIdentity.CognitoUserAttribute(attr);
        attributeList.push(attr);

        cognitoUser.updateAttributes(attributeList, function (err, result) {
            if (err) {
                alert(err);
                return;
            }
            console.log('call result: ' + result);
        });
    };

    authService.login = function (credentials) {
        return $http
          .post('/login', credentials)
          .then(function (res) {
              Session.create(res.data.id, res.data.user.id,
                             res.data.user.role);
              return res.data.user;
          });
    };

    authService.isAuthenticated = function () {
        currentUser = authService.getUserPool().getCurrentUser();
        if (currentUser != null) {
            return currentUser.getSession(function (err, session) {
                if (err) {
                    alert(err);
                    return;
                }
                return session.isValid();
                //console.log('session validity: ' + session.isValid());
            });
        }
        return;
        
    };
    authService.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        if (authService.currentAuthToken !== '') {
          resolve(authService.currentAuthToken);
        } else {
          var cognitoUser = authService.getCurrentUser();

          if (cognitoUser) {
              cognitoUser.getSession(function sessionCallback(err, session) {
                  if (err) {
                      reject(err);
                  } else if (!session.isValid()) {
                      resolve(null);
                  } else {
                      resolve(session.getIdToken().getJwtToken());
                  }
              });
          } else {
              resolve(null);
          }  
        }
        
    });
    
    authService.isAuthorized = function () {
        //if (!angular.isArray(authorizedRoles)) {
        //    authorizedRoles = [authorizedRoles];
        //}
        //return (authService.isAuthenticated() &&
        //  authorizedRoles.indexOf(Session.userRole) !== -1);

        return authService.isAuthenticated();
    };

    return authService;



});

function toUsername(email) {
    return email.replace('@', '-at-');
};const BASE_AWS_FANTASYPRIME_URL = "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/fantasyprime";

fantasyFantasyModule.service('AWSFantasyService', function ($http, $q, ScoresService, cognitoService, espnAPIService) {
function postToAPI(postData) {
  return cognitoService.authToken.then(function(token) {
      return $http({
        method: 'POST',
        url: BASE_AWS_FANTASYPRIME_URL,
        headers: {
          Authorization: token
        },
        data: JSON.stringify(postData)
      }).then(function(resp) {
        return resp.data.Items;
      });
    });
}

  var FantasyService = {};
  
  FantasyService.teams = [];
  FantasyService.rawRosters = [];
  FantasyService.activeRosters = [];
  FantasyService.enrichedRosters = [];
  
  
  FantasyService.getAllTeams = function(fromServer) {
        
    fromServer = fromServer || true;
    if ((FantasyService.teams.length <= 0) || fromServer) {
      const postData = {
        tableName: "FANTASY_TEAMS",
        requestType: "QUERY",
        record: {}
      };
      return postToAPI(postData).then(function (resp) {
        FantasyService.teams = resp; 
        return FantasyService.teams;
      });      
    } else {
      var prom = new Promise(function (resolve, reject) {
        resolve(FantasyService.teams);
      });
      return prom;
    }
  }
  FantasyService.getFullSchedule = function() {
    return $http.get('data/ffSetup.json', {
      cache: false
    }).then(function(resp) {
      return resp.data.games;
    });
  };
  
  FantasyService.getPrimeTeams = function() {
        return $http.get('data/prime_teams.json', {
          cache: false
        }).then(function(resp) {
          return resp.data.prime_teams;
        });
      };
  
  FantasyService.getGamesforWeek = function(wk) {
    return FantasyService.getFullSchedule().then(function(gmData) {
      return gmData.filter(function(gmRec) {
        return (gmRec.Week == wk);
      });
    })
  };
  
  FantasyService.getTeam = function(id) {
        function teamMatchesParam(team) {
          return team.OWNER_ID === id;
        }

        return FantasyService.getAllTeams(false).then(function(teams) {
          return teams.find(teamMatchesParam)
        });
      }
  FantasyService.getTeamByOwnerName = function () {
            return FantasyService.getAllTeams(false).then(function (resp) {
                return resp.filter(function (PT) { return (PT.TEAM_NAME == ownerName); })
            });
        }
  FantasyService.addTeam = function (ownerName, teamName, season) {

            var record = {
                    LEAGUE_ID: "Fantasy_Prime", 
                    TEAM_OWNER: ownerName,
                    TEAM_NAME: teamName, 
                    SEASON: season
                };
            return FantasyService.addItemToTable("FANTASY_TEAMS", record);

        }
  FantasyService.updateOwner = function (item) {
            return FantasyService.addItemToTable("FANTASY_TEAMS", item)
        }
  FantasyService.addItemToTable = function (tbl, item) {
            var postData = {
                tableName: tbl,
                requestType: "ADD",
                record: item
            }
        return postToAPI(postData);
        }
  FantasyService.getRosterRecs = function (fromServer) {
    fromServer = fromServer || false;
    if (FantasyService.rawRosters.length <= 0 || fromServer) {
            var postData = {
                tableName: "FANTASY_ROSTER_RECORDS",
                requestType: "QUERY",
                record: {}
            }
          return postToAPI(postData);
    } else return new Promise(function(res, rej) {res(FantasyService.rawRosters)});
      
  };
  FantasyService.getActiveRosters = function(fromServer) {
    fromServer = fromServer || false;

    function activeRecForTeam(teamRecs) {
      return teamRecs.sort(function(a, b) {
        if (typeof(a.TIMESTAMP) !== 'undefined') {
          var aDate = new Date(a.TIMESTAMP);
          var bDate = new Date(b.TIMESTAMP);
          if (aDate < bDate)
            return 1;
          if (aDate > bDate)
            return -1;
        }
        return 0;
      })[0];
    }

    if (FantasyService.activeRosters.length <= 0 || fromServer) {
      return FantasyService.getRosterRecs().then(function(rosterRecords) {
        FantasyService.activeRosters = [];
        if (rosterRecords.length <= 0) return new Promise(function(resolve, reject) {
          resolve([]);
        }); // No active rosterRecords existed. Returning empty array immediately.  

        var sortedRosterRecords = rosterRecords.sort(function(a, b) {
          if (a.TEAM_ID < b.TEAM_ID)
            return -1;
          if (a.TEAM_ID > b.TEAM_ID)
            return 1;
          return 0;
        });
        for (i = 0; i < sortedRosterRecords.length; i++) {
          var teamRecords = rosterRecords.filter(function(rec) {
            return (rec.TEAM_ID == sortedRosterRecords[i].TEAM_ID);
          });

          FantasyService.activeRosters.push(activeRecForTeam(teamRecords));
          i += teamRecords.length - 1;
        }

        return $q.all([FantasyService.getAllTeams(false), FantasyService.getPrimeTeamInfo()]).then(function(respArr) {
          const OwnersArr = respArr[0];
          const TeamInfoArr = respArr[1];
          FantasyService.activeRosters.forEach(function(activeRosterRec) {
            activeRosterRec.OWNER = OwnersArr.find(function(owner) {
              return (owner.TEAM_NAME == activeRosterRec.PRIME_OWNER);
            })
            activeRosterRec.TEAM_INFO = TeamInfoArr.find(function(ti) {
              return (activeRosterRec.TEAM_ID == ti.LEAGUE_ID + '_' + ti.TEAM_ID);
            })
          });
          return FantasyService.activeRosters;
        });

      });
    } else return new Promise(function (res, rej) {
      res(FantasyService.activeRosters)
    })

  };
  FantasyService.getWeekSetup = function () {
            return $http.get('data/weekDetails.json').then(function (resp) {
                return resp.data.weeks;
            });
        };
  FantasyService.getWeek = function (weekNum) {
          //allWeeks = service.getWeekSetup();

          return FantasyService.getWeekSetup().then(function(allWeeks) {
            if (weekNum === '') {
              lookupDate = new Date();
              allWeeks.sort(function (a, b) {
                  return (a['WeekId'] < b['WeekId'] ? -1 : 1);
              });
              retVal = 0;
              for (i = 0; i < allWeeks.length ; i++) {
                  if (lookupDate >= new Date(allWeeks[i]['Scores Final'])) {
                      retVal = i + 1;
                  }
              }
              return allWeeks[Math.min(retVal, allWeeks.length-1)];
          } else {
              return allWeeks.find(function (wk) { return (wk.WeekId == weekNum) });
          } 
          });
        
          
      };
  FantasyService.getRosterRecordsForWeek= function (wk, ssn) {
            return $q.all([FantasyService.getRosterRecs(), FantasyService.getWeekSetup()]).then(function (respArr) {
                var rosterRecords = respArr[0];
                var weekDetails = respArr[1];
                const rosterLockTime = new Date(weekDetails.find(function (lookupWk) { return (lookupWk.WeekId == wk); })['Roster Lock Time']);
                var filteredRosterRecords = rosterRecords.filter(function (rr) {
                    return (new Date(rr.TIMESTAMP) <= rosterLockTime);
                });

                filteredRosterRecords = filteredRosterRecords.filter(function (rr, idx, arr) {
                    var teamRecArray = arr.filter(function (tmpRR) { return (rr.TEAM_ID == tmpRR.TEAM_ID) });

                    if (teamRecArray.length > 1) {
                        var maxStart = teamRecArray.reduce(function (a, b) { return new Date(a.TIMESTAMP) > new Date(b.TIMESTAMP) ? a : b; });
                        return (rr == maxStart)
                    } else {

                        return true;
                    }


                });

                return filteredRosterRecords;

            });
        };
  
  FantasyService.getOwnerRoster = function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.PRIME_OWNER === owner;
            }

            return FantasyService.getActiveRosters().then(function (rosterRecords) {
                return FantasyService.getPrimeTeamInfo().then(function (teamRecords) {
                    var filteredRosterRecords = rosterRecords.filter(rosterRecMatchesParam)
                    filteredRosterRecords.forEach(function (rosterRec) {
                        rosterRec.TEAM_INFO = teamRecords.find(function (teamRec) {
                            return (rosterRec.TEAM_ID == teamRec.LEAGUE_ID + '_' + teamRec.TEAM_ID);
                        });
                    });
                    return filteredRosterRecords;
                })

            });
        }
  FantasyService.getPrimeTeamInfo = function () {
      return FantasyService.getPrimeTeams().then(function (teams) {
        var scoreboards = [];
        teams.forEach(function(tm) {
          tm.TEAM_INFO = FantasyService.getUpdatedTeamInfo(tm.LEAGUE_ID, tm.TEAM_ID);
        });
        
        return teams;
        
      });

  };
  FantasyService.scoreboards = [];
  
  FantasyService.getScoreboard = function(league_id) {
    return new Promise(function (resolve, reject) {
      var sbMatch = FantasyService.scoreboards.find(function (sb) { return (sb.metadata.league_id == league_id);})
      if (typeof(sbMatch) != 'undefined') { //Contains the scoreboard with the league_id
          resolve(sbMatch);
      } else {
        //return a promise that will resolve when the scoreboard does exist. 
        espnAPIService.getScoreboard(league_id, CURRENT_SEASON).then(function (sb) {
          FantasyService.scoreboards.push(sb);
          resolve(sb);
        });
      }
    });
  };
      
  FantasyService.getUpdatedTeamInfo  = function (lg_id, team_id) {
    return FantasyService.getScoreboard(lg_id).then(function (scoreboard) {
      const matchupMatch = scoreboard.scoreboard.matchups.find(function (matchup) {
        for (t=0; t<matchup.teams.length; t++) {
          if (matchup.teams[t].teamId == team_id) {
            return true;
          }
        }
      });
      var tm = {};
      tm.TEAM_SCORE = matchupMatch.teams.find(function(matchup_team) {return (matchup_team.teamId == team_id);});
      tm.OPPONENT_SCORE = matchupMatch.teams.find(function(matchup_team) {return (matchup_team.teamId != team_id);});
      return tm;
    })
  };
  
  
  FantasyService.getRosterRecord =  function (teamId) {
            return FantasyService.getActiveRosters().then(function (rrs) {
                return rrs.find(function (rr) { return (rr.TEAM_ID == teamId); })
            })
        };
  FantasyService.updateRosterRecord = function (updateRecord) {
            var expireRecord = FantasyService.getRosterRecord(updateRecord.TEAM_ID);
            expireRecord.END_DATE = new Date();
            var expirePost = {
                tableName: "FANTASY_ROSTER_RECORDS", 
                requestType: "ADD", 
                record: expireRecord
            }
            var createPost = {
                tableName: "FANTASY_ROSTER_RECORDS", 
                requestType: "ADD", 
                record: {
                    LEAGUE_ID: expireRecord.LEAGUE_ID,
                    SEASON: expireRecord.END_DATE.getFullYear(),
                    TEAM_ID: updateRecord.TEAM_ID,
                    TIMESTAMP: new Date(),
                    POSITION: updateRecord.POSITION,
                    PRIME_OWNER: updateRecord.PRIME_OWNER,
                }
            };
            return postToAPI(expirePost).then(postToAPI(createPost));
        };
  
  FantasyService.getScoresForWeek= function (week, ssn) {
            return ScoresService.getScoreRecordsForWeek(week, ssn).then(function (resp) {
                var scoreRecs = resp;
                return FantasyService.getActiveRosters().then(function (rosterRecs) {
                    //                    outputArr = [];
                    scoreRecs.forEach(function (scoreRec) {
                        // scoreRec.HOME_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        // scoreRec.AWAY_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        scoreRec.PRIME_ROSTER_ENTRY = rosterRecs.find(function (rosterRec) { return (rosterRec.TEAM_ID == scoreRec.TEAM_ID) });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });
                    return scoreRecs;
                });

            })
        };
  FantasyService.getEnrichedRosters = function () {
            return FantasyService.getActiveRosters().then(function (activeRosters) {
                return FantasyService.getPrimeTeamInfo().then(function (teamInfo) {
                    activeRosters.forEach(function (ar) {
                        ar.TEAM_INFO = teamInfo.find(function (info_rec) {
                            return (info_rec.LEAGUE_ID + '_' + info_rec.TEAM_ID == ar.TEAM_ID);
                        })
                    });
                    return activeRosters;
                });
            });
        };
  FantasyService.submitWaiverClaim = function (addTm, dropTm) {
            const newRec = {
                REQUESTER_ID: dropTm.PRIME_OWNER,
                ADD_TEAM_ID: addTm.TEAM_ID,
                DROP_TEAM_ID: dropTm.TEAM_ID,
                TIMESTAMP: new Date()
            };

            return FantasyService.addItemToTable('FantasyPrime_Waivers', newRec).then(function (resp) {
                return resp;
            });
        };
  FantasyService.getScheduleAndResults = function () {
            return $q.all([FantasyService.getFullSchedule(), ScoresService.getScoreRecords()]).then(function (respArr) {
                var sched = respArr[0];
                var scores = respArr[1].filter(function (rec) { return rec.SEASON == CURRENT_SEASON });
                var rosterRecs = respArr[2];

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                const weeks = scores.map(function (scr) { return (scr.WEEK); }).filter(onlyUnique);
                var rosterLists = [];

                weeks.forEach(function (wk) {
                    rosterLists.push(FantasyService.getRosterRecordsForWeek(wk, CURRENT_SEASON));
                });

                return $q.all(rosterLists).then(function (respArr) {
                    scores.forEach(function (scoreRec) {
                        scoreRec.PRIME_ROSTER_ENTRY = respArr[scoreRec.WEEK - 1].find(function (rr) { return (scoreRec.TEAM_ID == rr.TEAM_ID); });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });

                    sched.forEach(function (gameRec) {
                        var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { PRIME_OWENR: gameRec['Team Name'] }, SEASON: 2017, WEEK: gameRec.Week });
                        var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { PRIME_OWNER: gameRec['Opp Name'] }, SEASON: 2017, WEEK: gameRec.Week });

                        gameRec['Team W'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Team L'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Team T'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Opp W'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Opp L'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Opp T'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Pts (Starters)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Pts (Bench)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });
                        gameRec['Opp Pts (Starters)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Opp Pts (Bench)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });

                        gameRec['Team Result'] = determineResult(gameRec);
                        gameRec['Subgame Details'] = scoresForTeam;
                        gameRec['Subgame Opp Details'] = scoresForOpp;
                        gameRec['isCollapsed'] = true;
                    });

                    var fullresults = sched.reduce(function (result, current) {
                        result[current['Team Name']] = result[current['Team Name']] || [];
                        result[current['Team Name']].push(current);
                        if (current['Opp Name'] != 'BYE') {
                            result[current['Opp Name']] = result[current['Opp Name']] || [];
                            result[current['Opp Name']].push(current);
                        }
                        return result;
                    }, {});
                    var standings = [];
                    Object.keys(fullresults).forEach(function (tm) {
                        if (tm != 'BYE') {
                            standings.push(fullresults[tm].reduce(function (result, current) {
                                var myStr = (tm == current['Team Name'] ? 'Team' : 'Opp')
                                var oppStr = (tm == current['Team Name'] ? 'Opp' : 'Team')
                                var FF_POINTS = current[myStr + ' W'] + 0.5 * current[myStr + ' T'];
                                var OPP_POINTS = current[oppStr + ' W'] + 0.5 * current[oppStr + ' T'];
                                var FF_TEAM_POINTS = (myStr == 'Team' ? current['Pts (Starters)'] : current['Opp Pts (Starters)']);
                                var OPP_TEAM_POINTS = (myStr == 'Team' ? current['Opp Pts (Starters)'] : current['Pts (Starters)']);
                                var RESULT = (myStr == 'Team' ? current['Team Result'] : (current['Team Result'] == 'W' ? 'L' : (current['Team Result'] == 'L' ? 'W' : (current['Team Result'] == 'T' ? 'T' : ''))));
                                result.W = (result.W || 0) + (RESULT == 'W' ? 1 : 0)
                                result.L = (result.L || 0) + (RESULT == 'L' ? 1 : 0)
                                result.T = (result.T || 0) + (RESULT == 'T' ? 1 : 0)
                                result.FF_POINTS = (result.FF_POINTS || 0) + FF_POINTS
                                result.OPP_FF_POINTS = (result.OPP_FF_POINTS || 0) + OPP_POINTS
                                result.TEAM_POINTS = (result.TEAM_POINTS || 0) + FF_TEAM_POINTS
                                result.OPP_TEAM_POINTS = (result.OPP_TEAM_POINTS || 0) + OPP_TEAM_POINTS
                                return result;
                            }, { TEAM_NAME: tm, GAME_RECORDS: fullresults[tm] }))
                        }
                    })

                    return standings;
                })
            });
        };  
  
    return FantasyService;
})

function determineResult (gameRec) {
    var gamePts = gameRec['Team W'] + 0.5 * gameRec['Team T'];
    var oppPts = gameRec['Opp W'] + 0.5 * gameRec['Opp T'];

    if (gamePts > oppPts) return 'W'
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)'])) return 'W';
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] == gameRec['Opp Pts (Starters)']) && (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)'])) return 'W';

    if ((gamePts > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
    return '';
}
;const BASE_ESPN_URL = "http://games.espn.com/ffl/api/v2"

fantasyFantasyModule.service('espnAPIService', function ($http) {
  service = {}; 
  
  service.getScoreboard = function(lgId,seasonId, wkId) {
    var wkIdStr = ''
    if (typeof(wkId) != 'undefined') { wkIdStr = "&scoringPeriodId=" + wkId; }
    
    return $http.get(BASE_ESPN_URL + "/scoreboard?leagueId=" + lgId + "&seasonId=" + seasonId + wkIdStr, { cache: false }).then(function (resp) {
                return resp.data;
            }, 
            // failure function 
            function () {
                return false;
            });
  };
  service.getAllScores = function () {
    
  };
  
  return service;
});;
footballDexModule.service('footballdexService', function ($http) {
    var service = {
        getRFAs: function (effDate) {
            var players = [];
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/footballdex?transform=1&filter=season,eq,2018').then(function (response) {
                players = response.data.footballdex;
                return $http.get('http://actuarialgames.x10host.com/includes/api.php/rfa_bids?transform=1&filter=season,eq,2018');
            }).then(function (response) {
                players.forEach(function (plyr) {
                    plyr.bidder = '';
                    plyr.bidAmount = '';
                    plyrName = plyr.rfa;
                    totalBids = response.data.rfa_bids.filter(function (bid) { return bid.rfa == plyrName }).length;
                    plyr.bidCount = totalBids;
                });
                return players;
            });

        },
        getMMQKeepers: function () {
            return $http.get('data/2018Keepers.JSON').then(function (response) {
                players = response.data.data;
                return players;
            });
        }
        
    };

    return service;
});
fantasyGolfModule.service('golfService', function ($http) {
    var service = {
        getLeaderboard: function () {
            return tournNum = service.getTournamentNum().then(function (resp) {
                return  $http.get('http://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard/players?event=' + resp + '&lang=en&region=us').then(function (resp) {
                    return resp.data.leaderboard;
                });
            });
        },
        getPicks: function () {
            return service.getTournamentNum().then(function (resp) {
                return $http.get("data/golf.json").then(function (resp) {
                    return resp.data.Players;
                });
            });
        },
        getTournamentNum: function () {
            var prom = new Promise(function (resolve, reject) {
                resolve('2697');
            });
            /*var newprom = $http.get('http://www.espn.com/golf/leaderboard').then(function(resp) {
                const regex = /espn\.leaderboard\.tournamentId = (.*);/g;
                const str = resp.data;
                let m;

                while ((m = regex.exec(str)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
    
                    return m[1];

                }
            });*/

            return prom;
        }
    };

    return service;
})



;
actuarialGamesModule.service('mlbDataService', function ($http, $q) {
    const BASE_URL = "http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1"
    var service = {
        getDailyStats: function (gm_date) {
            var inputDate = new Date(gm_date)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get('data/' + year + month + day + '.json', { cache: false }).then(function (resp) {
                return resp.data.games;
            }, 
            // failure function 
            function () {
                return false;
            });
        },
        getGamesForDate: function (gm_date) {
            var inputDate = new Date(gm_date)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get(BASE_URL + "/schedule/?sportId=1&date=" + month + "%2F" + day +  "%2F" + year).then(function (resp) {
                var dateObj = resp.data.dates.find(function (dateObj) { return (dateObj.date == (year + "-" + month + "-" + day)); });
                return dateObj.games;
            })
        },
        getBoxscoresForGames: function (gamesList) {
            var promArr = [];
            gamesList.forEach(function (gm) {

                var stats = new Promise(function (resolve, reject) {
                    if (gm.status != "Preview") {
                        resolve(service.getGameBoxscore(gm.gamePk));
                    } else {
                        resolve([]);
                    }
                })
                stats.then(
                    function (result) {
                        gm.stats = result;
                        //                            $http.post('http://actuarialgames.x10host.com/site3/server/save_stats.php', {'json': gm });
                    },
                    function (reason) {
                        console.log(reason);
                    });
                promArr.push(stats);
                    
            });
            return $q.all(promArr).then(function () {
               
                return gamesList;


            });
        },
        getGameBoxscore: function (gamePk) {
            return $http.get(BASE_URL+ "/game/" + gamePk + "/boxscore").then(function (resp) {
                return resp.data; //service.saveGameStats(resp);
            })
        },
        ParseBoxscoreForStats: function(bs) {
            bs.teams = []
        },
        saveGameStats: function (gmData) {
            var d =  new Date(gmData.gameDate);
            var flname = d.getFullYear().toString() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //d.toISOString().substring(0, 10).replace(/-/g, "");
            // var clean_data = pruneEmpty(gmData);
            return $http.post('server/save_stats.php/' + flname, JSON.stringify({
                'gamePk': gmData.gamePk, 'players': getAllPlayers(gmData)
            })).then(function (resp) {
                return resp;
            });
        },
        getSchedule: function (startDate, endDate, teamsArr) {
            teamsString = (teamsArr.length > 0) ? '&teamId=' + encodeURIComponent(teamsArr) : '';

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate='+ encodeURIComponent(startDate.slashFormat()) + '&endDate='+encodeURIComponent(endDate.slashFormat())+'&gameType=R' + teamsString).then(function (resp) {
                var fullResp = resp.data;

                var promArray = [];
                
                createSummaryTmRec = function (fullRec) {
                    
                    Object.keys(fullRec.teams).forEach(function (tmKey) {
                        fullRec.teams[tmKey].leagueRecord = fullRec.teams[tmKey].team.record.leagueRecord;
                        fullRec.teams[tmKey].score = fullRec.teams[tmKey].teamStats.batting.runs;
                        fullRec.teams[tmKey].isWinner = (fullRec.teams[tmKey].teamStats.batting.runs > fullRec.teams[tmKey].teamStats.pitching.runs);
                    });

                    return fullRec;
                };
                
                for (i = 0; i < fullResp.dates.length; i++) {
                    fullResp.dates[i].games.forEach(function (gm) {
                        var promise;
                        if (gm.status.statusCode == 'F') {
                            if (gm.isTie) {

                                if (teamsArr.includes(gm.teams.away.team.id) || teamsArr.includes(gm.teams.home.team.id)) { 

                                // Potential error. Look up full game result.
                                promise = new Promise(function(resolve, reject) {
                                    $http.get(BASE_URL+ '/game/' + gm.gamePk + '/boxscore').then(function (resp) {
                                        gm_boxscore = resp.data;
                                        gm.isTie = false;
                                        resolve({respType: "full", boxscore: createSummaryTmRec(gm_boxscore), game: gm });
                                    });

                                });

                                promArray.push(promise);
                                }
                            } else {
                                promise = new Promise(function(resolve, reject) {
                                    resolve({ respType: "summary", boxscore: gm, game: gm });
                                });
                                promArray.push(promise);

                            }
                        }
                    })
                }

                return $q.all(promArray).then(function (resArray) {
                    var results = [];
                    

                    addGameToRec = function (tmGameRec, gmRec) {
                        tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                        if (!tmRec) {
                            var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                            tmRec = results[idx - 1]
                        };
                        if (!tmRec.hasOwnProperty('games')) { tmRec.games = []; }
                        tmRec.games.push({ gameDate: gmRec.gameDate, gamePk: gmRec.gamePk, isWinner: tmGameRec.isWinner, isTie: gmRec.isTie, teamRec: tmGameRec });

                    };

                    resArray.forEach(function (gm) {
                        if (teamsArr.includes(gm.boxscore.teams.away.team.id)) { addGameToRec(gm.boxscore.teams.away, gm.game); }
                        if (teamsArr.includes(gm.boxscore.teams.home.team.id)) { addGameToRec(gm.boxscore.teams.home, gm.game); }
                    });
                    return results;
                });

            }, function (err) {
                return '';
            })
        },
        getLatestRecords: function () {
            var today = new Date();
            var twoDaysAgo = new Date(today.getTime());
            twoDaysAgo.setDate(today.getDate() - 2);

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate='
                                + encodeURIComponent(twoDaysAgo.slashFormat()) + '&endDate='
                                + encodeURIComponent(today.slashFormat()) + '&gameType=R').then(function (resp) {
                var fullResp = resp.data;
                var results = [];
                for (i = fullResp.dates.length - 1; i >= 0; i--) {
                    fullResp.dates[i].games.forEach(function (gm) {
                        addTeamRec = function (tmGameRec) {
                            tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                            if (!tmRec) {
                                var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                                tmRec = results[idx - 1];
                                tmRec.leagueRecord = tmGameRec.leagueRecord;
                            };
                        }
                        addTeamRec(gm.teams.away);
                        addTeamRec(gm.teams.home);
                    })
                }

                return results;
            }, function (err) {
                return '';
            })
        },
        getStandings: function (dt) {
            dt = dt || new Date();
            var result = [];
            return $http.get(BASE_URL+ '/standings?leagueId=103,104&season=2018&date='
                + encodeURIComponent(dt.slashFormat())).then(function (resp) {
                    resp.data.records.forEach(function (standingsRec) {
                        standingsRec.teamRecords.forEach(function (teamRec) {
                            result.push(teamRec);
                        });
                    });
                    return result;
                });

        },
        getAllBoxscoresForDates: function (startDate, endDate, teamsArr) {
            teamsString = (teamsArr.length > 0) ? '&teamId=' + encodeURIComponent(teamsArr) : '';

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate=' + encodeURIComponent(startDate.slashFormat()) + '&endDate=' + encodeURIComponent(endDate.slashFormat()) + '&gameType=R' + teamsString).then(function (resp) {
                var fullResp = resp.data;

                var promArray = [];

                for (i = 0; i < fullResp.dates.length; i++) {
                    fullResp.dates[i].games.forEach(function (gm) {

                        if (gm.status.statusCode == 'F') {
                            if (teamsArr.includes(gm.teams.away.team.id) || teamsArr.includes(gm.teams.home.team.id)) {

                                // Potential error. Look up full game result.
                                var promise = new Promise(function (resolve, reject) {
                                    $http.get(BASE_URL+ '/game/' + gm.gamePk + '/boxscore').then(function (resp) {
                                        gm_boxscore = resp.data;
                                        resolve({ respType: "full", boxscore: gm_boxscore, game: gm });
                                    });

                                });

                                promArray.push(promise);
                            }
                        }
                    })
                }

                return $q.all(promArray).then(function (resArray) {
                    var results = [];


                    addGameToRec = function (tmGameRec, gmRec, oppGameRec) {
                        tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                        if (!tmRec) {
                            var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                            tmRec = results[idx - 1]
                        };
                        if (!tmRec.hasOwnProperty('games')) { tmRec.games = []; }
                        tmRec.games.push({ gameDate: gmRec.gameDate, gamePk: gmRec.gamePk, boxscore: tmGameRec, opponentBoxscore: oppGameRec});

                    };

                    resArray.forEach(function (gm) {
                        if (teamsArr.includes(gm.boxscore.teams.away.team.id)) { addGameToRec(gm.boxscore.teams.away, gm.game, gm.boxscore.teams.home); }
                        if (teamsArr.includes(gm.boxscore.teams.home.team.id)) { addGameToRec(gm.boxscore.teams.home, gm.game, gm.boxscore.teams.away); }
                    });
                    return results;
                });

            }, function (err) {
                return '';
            })
        },
        getPBP: function (gamePk) {
            return $http.get(BASE_URL+ '/game/' + gamePk + '/playByPlay').then(function (resp) {
                return resp.data;
            })

        },
        getAllPBPForTeams: function (teamIds) {

        }
    };

    return service;
})

function getAllPlayers(gmData) {
    players = [];
    do_it = function () {
        for (var key in src_players) {
            if (src_players.hasOwnProperty(key)) {
                plyr = src_players[key];
                newPlayerObj = {
                    'mlbid': plyr.person.id,
                    'name': plyr.person.fullName,
                    'team': src_team.teamCode,
                    'positions': plyr.allPositions,
                    'status': 'status' in plyr ? plyr.status.code : '',
                    'status_description' : 'status' in plyr ? plyr.status.description : '',
                }
                if (plyr.hasOwnProperty("stats")) {
                    batStat = plyr.stats.batting
                    newObj = {
                        'ab': batStat.atBats,
                        'h': batStat.hits,
                        '2b': batStat.doubles,
                        '3b': batStat.triples,
                        'hr': batStat.homeRuns,
                        'r': batStat.runs,
                        'rbi': batStat.rbi,
                        'bb': batStat.baseOnBalls,
                        'hbp': batStat.hitByPitch,
                        'so': batStat.strikeOuts,
                        'sb': batStat.stolenBases,
                        'cs': batStat.caughtStealing,
                        'sac': batStat.sacBunts,
                        'sf': batStat.sacFlies,
                        'e': plyr.stats.fielding.errors,
                        'lob': batStat.leftOnBase,
                    };
                    for (var attrname in newObj) {
                        newPlayerObj[attrname] = newObj[attrname];
                    }
                }
                
                players.push(
                    newPlayerObj
                    );
                //pruneEmpty(src_players[key]));
            }
        }
    }
    src_players = gmData.boxscore.teams.away.players;
    src_team = gmData.boxscore.teams.away.team;
    do_it();
    src_players = gmData.boxscore.teams.home.players;
    src_team = gmData.boxscore.teams.home.team;
    do_it();
    return players;
}


// Array format
// [MLBID, Name, Team, AB, H, 2B, 3B, HR, R, RBI, BB, HBP, SO, SB, CS, Sac, SF, E, LOB, Position(s)]
// pulls from "Boxscore -> [player].stats.batting
// categories are: atBats, hits, doubles, triples, homeRuns, runs, rbi, baseOnBalls, hitByPitch, strikeOuts, stolenBases, caughtStealing, sacBunts, sacFlies, fielding.errors, batting.leftOnBase, allPositions[array]]

function pruneEmpty(obj) {
  return function prune(current) {
    _.forOwn(current, function (value, key) {
      if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
        (_.isString(value) && _.isEmpty(value)) ||
        (_.isObject(value) && _.isEmpty(prune(value)))) {

        delete current[key];
      }
    });
    // remove any leftover undefined values from the delete 
    // operation on an array
    if (_.isArray(current)) _.pull(current, undefined);

    return current;

  }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
}

;const NFL_URL = "http://www.nfl.com/ajax/scorestrip?"

winsPoolModule.service('nflScoresService', function ($http, $q) {
  var service = {}; 
  
  service.getScoreboard = function(seasonId) {
    var weekProms = [];
    
    for (var weekId=1; weekId<=17; weekId++) {
      weekProms.push($http.get(NFL_URL + "season=" + seasonId + "&seasonType=REG&week=" + weekId, { cache: false }).then(function (resp) { return (resp.data); }))
    }
    return $q.all(weekProms).then(function (respArr) {
    var retArr = []
      respArr.forEach(function (resp) {
        var parser = new DOMParser();
        const xmlDoc = parser.parseFromString(resp,"text/xml");          
        const thisWk = xmlDoc.getElementsByTagName("gms")[0].getAttribute("w");
        const myList = xmlDoc.getElementsByTagName("g")
        for (i=0; i<myList.length; i++) {
          var gEle = myList[i];
          retArr.push( { 
            "seasonId": seasonId, 
            "weekId" : thisWk, 
            "homeTeam" : gEle.getAttribute("h"), 
            "awayTeam" : gEle.getAttribute("v"), 
            "homeScore" : gEle.getAttribute("hs"), 
            "awayScore" : gEle.getAttribute("vs"), 
            "winner" : getWinner(gEle),
            "loser" : getLoser(gEle), 
            "homeResult" : getResult(gEle, "home"),
            "awayResult" : getResult(gEle, "away")
            });
        }
      });
      return retArr;
    });
  };
  
  service.getStandings = function (seasonId) {
    
  }
  
  
  
  return service;
});

function getResult(gEle, homeOrAway) {
  //const resultArray = ["W", "T", "L"]
  const result = {"1": "W", "0": "T", "-1": "L"}
  
  if (gEle.getAttribute("hs") !== '' && (gEle.getAttribute("vs") !== '')) {
    homeDiff = gEle.getAttribute("hs") - gEle.getAttribute("vs"); 
    if (homeDiff === 0) return "T";
    homeDiff = homeDiff / Math.abs(homeDiff)
    if (homeOrAway == "home") return result[homeDiff];
    if (homeOrAway == "away") return result[-homeDiff];
    
  }
return '';
}

function getWinner(gEle) {
  if ((gEle.getAttribute("hs") !== '') && (gEle.getAttribute("vs") !== '')) {
    return (gEle.getAttribute("hs") > gEle.getAttribute("vs")) ? gEle.getAttribute("h") : gEle.getAttribute("v");
  }
  return '';
}
function getLoser(gEle) {
  if ((gEle.getAttribute("hs") !== '') && (gEle.getAttribute("vs") !== '')) {
    return (gEle.getAttribute("hs") > gEle.getAttribute("vs")) ? gEle.getAttribute("v") : gEle.getAttribute("h");
  }
  return '';
};propBetModule.service('propBetService', function ($http, mlbDataService) {

    var service = {
        
        getBBDataJSON: function () {
            return $http.get("data/baseballdata.json").then(function (resp) {
                return resp.data.data
            });

        },
        getLastUpdateTime: function() {
            return $http.get("data/baseballdata.json").then(function (resp) {
                var jsDate = new Date(resp.data.createTime)
                return jsDate;
            });
        },
        getConfigDataJSON: function () {
            return $http.get("data/configuration.json").then(function (resp) {
                var keys = resp.data.data.shift();
                resp.data.data = resp.data.data.map(function (row) {
                    return keys.reduce(function (obj, key, i) {
                        obj[key] = row[i];
                        return obj;
                    }, {});
                });

                resp.data.data.forEach(function (obj) {
                    obj.SafeTitle = obj.Title.replace(/\s/g, '_');
                });

                return resp.data.data;
            });

        },
        getBetSummaryJSON: function () {
            return $http.get("data/bet.json").then(function (resp) {
                return resp.data.data;
            });

        },
        getBetList: function () {
            return $http.get("data/bets.json").then(function (resp) {
                return resp.data.data;
            })
        },
        getGraphConfig: function () {
            return $http.get("data/betGraphConfig.json").then(function (resp) {
                return resp.data;
            })
        },
        getStoredBetData: function() {
            return $http.get("data/betData.json").then(function (resp) {
                return resp.data;
            })
        },
        getBetDataPromise: function () {
            return service.getStoredBetData().then(function (resp) {
                var outputBetData = resp
                minDateCol = outputBetData[0].indexOf("minGameTime");
                milDateCol = outputBetData[0].indexOf("milGameTime");
                minMaxDate = outputBetData.slice(1).reduce(function (maxDate, curArrItem) { return Math.max(new Date(curArrItem[minDateCol] || maxDate), maxDate) }, new Date('03/29/2018'));
                milMaxDate = outputBetData.slice(1).reduce(function (maxDate, curArrItem) { return Math.max(new Date(curArrItem[milDateCol] || maxDate), maxDate) }, new Date('03/29/2018'));
                s = Math.min(minMaxDate, milMaxDate);
                tms = [142, 158];
                

                return mlbDataService.getAllBoxscoresForDates(new Date(s), new Date(), tms).then(function (resp) {
                    function updateKOData(origOutput) {
                        minInc = 4; milInc = -4;
                        curMin = minInc; curMil = milInc;
                        for (i = 1; i < origOutput.length; i++) {
                            if (origOutput[i][16] && origOutput[i][17]) {
                                origOutput[i][1] = origOutput[i][16] - origOutput[i][17];
                                origOutput[i][2] = curMin; origOutput[i][3] = curMil;
                                if (origOutput[i][1] >= curMin) {
                                    curMin += minInc; curMil = curMin + milInc;
                                };
                                if (origOutput[i][1] <= curMil) {
                                    curMin = curMil + minInc; curMil += milInc;
                                }

                            }
                        };
                        return origOutput
                    }

                    var teams = resp;
                    teams.forEach(function (tm) {
                        tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                    })

                    function getColNum(titleString) { return outputBetData[0].indexOf(titleString);}


                    priorMinGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minGamePk")] }).length;
                    priorMilGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("milGamePk")] }).length;;
                    maxMinGames = teams[0].games.length + priorMinGames;
                    maxMilGames = teams[1].games.length + priorMilGames;

                    for (i = 0; i < teams.length; i++) {
                        tm = teams[i];
                        tmOffset = (tm.name == "Minnesota Twins") ? 0 : (tm.name == "Milwaukee Brewers") ? 1 : 0;
                        tmKOInc = (tm.name == "Minnesota Twins") ? { tmKO: 4, oppKO: -4 } : (tm.name == "Milwaukee Brewers") ? { tmKO: -4, oppKO: 4 } : { tmKO: 0, oppKO: 0 };
                        tmPriorGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minWins") + tmOffset] }).length;
                        oppPriorGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minWins") + 1 - tmOffset] }).length;

                        tm.games.forEach(function (gm) {

                            gmNum = gm.boxscore.team.record.gamesPlayed
                            // outputBetData[gmNum][0] = teams[0].games[gmNum - priorMinGames].boxscore.team.record.wins - teams[1].games[gmNum - priorMilGames].boxscore.team.record.wins; // winDiff -- needs to be error-proofed
                            if (!outputBetData[gmNum]) {
                                newRow = [];
                                for (col = 1; col < outputBetData[0].length; col++) {
                                    newRow[col] = null;
                                }
                                newRow[0] = gmNum;
                                outputBetData[gmNum] = newRow;
                            };
                            outputBetData[gmNum][getColNum("minResult") + tmOffset] = win(gm); // minResult
                            outputBetData[gmNum][getColNum("minAvg") + tmOffset] = battingAvg(gm); // minAvg
                            //outputBetData[gmNum][getColNum("min95Avg") + tmOffset] = 
                            outputBetData[gmNum][getColNum("minInnBat") + tmOffset] = inningsBatted(gm);
                            outputBetData[gmNum][getColNum("minGameTime") + tmOffset] = gameTimes(gm); // minGameTime
                            outputBetData[gmNum][getColNum("minGamePk") + tmOffset] = gameNums(gm); // minGamePk
                            outputBetData[gmNum][getColNum("minWins") + tmOffset] = gm.boxscore.team.record.wins;
                            
                        });

                        // Loop through and populate agg functions now that all raw stat values are included.  
                        for (gmLoopCtr = Math.min(priorMinGames, priorMilGames) ; gmLoopCtr < gmNum; gmLoopCtr++) {
                            outputBetData[gmLoopCtr][getColNum("min95Avg") + tmOffset] = Pctile(outputBetData.filter(function (itm) { return (itm[0] <= gmLoopCtr); }).map(function (arrRow) { return arrRow[getColNum("minAvg") + tmOffset]; }), 95); // min95Avg
                            // outputBetData[gmLoopCtr][getColNum("minInnBat") + tmOffset] += outputBetData[gmLoopCtr - 1][getColNum("minInnBat") + tmOffset]; // minInnBat -- needs to be running sum
                            outputBetData[gmLoopCtr][getColNum("minInnBatCumulative") + tmOffset] = outputBetData.filter(function (itm) { return (itm[0] <= gmLoopCtr); }).map(function (arrRow) { return arrRow[getColNum("minInnBat") + tmOffset]; }).reduce(function (a, b) { return (a + b); });
                        };
                    };

                    return updateKOData(outputBetData);
                })

            });


        },
        getBetData: function () {
            
            d = new Date();
            s = new Date('03/29/2018')
            // Minnesota: Team Id = 142
            // Milwaukee: Team Id = 158` 
            tms = [142, 158];
            return mlbDataService.getAllBoxscoresForDates(s, d, tms).then(function (resp) {
                var teams = resp;
                teams.forEach(function (tm) {
                    //if (tm.name == 'Minnesota Twins' || tm.name == "Milwaukee Brewers") {
                    tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                });

                curMinInc = 4;
                curMilInc = -4;
                curMinLine = curMinInc;
                curMilLine = curMilInc;
                var minLine = [];
                var milLine = [];


                var minAvg = createStatCol(teams[0].games, battingAvg);
                var milAvg = createStatCol(teams[1].games, battingAvg);
                var winDiff = createStatCompareColumn(createStatCol(teams[0].games, seasonWins), createStatCol(teams[1].games, seasonWins), function (a, b) { return a - b; }, null);


                //var outputArr = [["gameNum", "winDiff", "minline", "milline", "minResult", "milResult", "minAvg", "milAvg"]];
                for (i = 0; i < Math.max(teams[0].games.length, teams[1].games.length) ; i++) {

                    minLine[i] = curMinLine;
                    milLine[i] = curMilLine;
                    if (winDiff[i]) {
                        if (winDiff[i] >= curMinLine) {
                            curMinLine += curMinInc;
                            curMilLine -= curMilInc;
                        }
                        if (winDiff[i] <= curMilLine) {
                            curMilLine += curMilInc;
                            curMinLine -= curMinInc;
                        }
                    }
                }

                // var a = createStatCol(teams[0].games, win);

                outputArr1 = [['gameNum']];
                function addColToOutputArr(colObj) {
                    newCol = outputArr1[0].length;
                    outputArr1[0][newCol] = colObj.name;
                    for (i = 0; i < colObj.data.length; i++) {
                        if (i + 1 >= outputArr1.length) {
                            var addRow = [i + 1];
                            for (j = 1; j <= newCol; j++) {
                                addRow[j] = null;
                            }
                            outputArr1.push(addRow);
                        }
                        outputArr1[i + 1][newCol] = colObj.data[i];
                    }
                }


                addColToOutputArr({ name: 'winDiff', data: winDiff });
                addColToOutputArr({ name: 'minline', data: minLine});
                addColToOutputArr({ name: 'milline', data: milLine });
                addColToOutputArr({ name: 'minResult', data: createStatCol(teams[0].games, win) });
                addColToOutputArr({ name: 'milResult', data: createStatCol(teams[1].games, win) });
                addColToOutputArr({ name: 'minAvg', data: minAvg });
                addColToOutputArr({ name: 'milAvg', data: milAvg });
                addColToOutputArr({ name: 'min95Avg', data: createRunningTotalCol(minAvg, avg95Pctile) });
                addColToOutputArr({ name: 'mil95Avg', data: createRunningTotalCol(milAvg, avg95Pctile) });
                addColToOutputArr({ name: 'minInnBat', data: createRunningTotalCol( createStatCol(teams[0].games, inningsBatted), runningSum ) });
                addColToOutputArr({ name: 'milInnBat', data: createRunningTotalCol(createStatCol(teams[1].games, inningsBatted), runningSum) });
                addColToOutputArr({ name: 'minGameTime', data: createStatCol(teams[0].games, gameTimes) });
                addColToOutputArr({ name: 'milGameTime', data: createStatCol(teams[1].games, gameTimes) });
                addColToOutputArr({ name: 'minGamePk', data: createStatCol(teams[0].games, gameNums) });
                addColToOutputArr({ name: 'milGamePk', data: createStatCol(teams[1].games, gameNums) });
                

                return outputArr1;

            });
        }//,
        //saveBetData: function (flname, dataObj) {
        //    return $http.post('server/save_json.php/' + flname, JSON.stringify({
        //        dataObj
        //    })).then(function (resp) {
        //        return resp;
        //    });
        //}
    };

    return service;
})

function createStatCol(boxscores, statFunction) {
    var statCol = [];

    for (i = 0; i < boxscores.length ; i++) {
        statCol[i] = statFunction(boxscores[i]);
    }

    return statCol;
}

function createStatCompareColumn(tm1StatCol, tm2StatCol, compareFunction, defaultVal) {
    var statCol = [];
    defaultVal = null; // defaultVal ? defaultVal : '';

    for (i = 0; i < Math.max(tm1StatCol.length, tm2StatCol.length) ; i++) {
        if (i < tm1StatCol.length && i < tm2StatCol.length) {
            statCol[i] = compareFunction(tm1StatCol[i], tm2StatCol[i]);
        } else 
        {
            statCol[i] = defaultVal;
        }
    }
    return statCol;
} 

function createRunningTotalCol(inputStatCol, runningTotalFunction) {
    return inputStatCol.map(runningTotalFunction);
}

function win(bs) {
    return bs.boxscore.teamStats.batting.runs > bs.boxscore.teamStats.pitching.runs ? 1 : -1;
}
function seasonWins(bs) {
    return bs.boxscore.team.record.leagueRecord.wins;
}
function avg95Pctile(curVal, index, arr) {
    var truncArr = arr.slice(0, index).sort();
    var len = truncArr.length;
    var per95 = Math.floor(len * .95)-1
    return (truncArr[per95]);
}
function battingAvg(bs) {
    return (bs.boxscore.teamStats.batting.hits / bs.boxscore.teamStats.batting.atBats)
}

function runningSum(curVal, index, arr) {
    var add = function (a, b) {
        return a + b
    }
    if (index > 0) {
        return arr.slice(0, index).reduce(add);
    } else {
        return curVal;
    };

}

function inningsBatted(bs) {
    return Math.ceil(parseFloat((bs.opponentBoxscore.teamStats.pitching.inningsPitched)))-9.0;
}

function gameTimes(bs) {
    return bs.gameDate;
}
function gameNums(bs) {
    return bs.gamePk;
}

function Pctile(arr, pct) {
    var len = arr.length;
    arr.sort();
    var lower = Math.floor((len-1) * pct / 100);
    var upper = Math.ceil((len-1) * pct / 100);

    if (lower != upper) {
        var interPct = (pct / 100 * (len - 1) - Math.floor(pct / 100 * (len - 1))) / (Math.ceil(pct / 100 * (len - 1)) - Math.floor(pct / 100 * (len - 1)));
    } else {
        var interPct = 1;
    }

    

    return arr[upper] * interPct + arr[lower] * (1 - interPct);
};fantasyFantasyModule.service('RostersService', ['GoogleSheetsService',  function (GoogleSheetsService) {

    var service = {
        getAllRosterRecords: function () {
            
            return GoogleSheetsService.getData().then(function (data) {
                return data.RosterRecords;
            }, function (err) {
                console.log('Failed: ' + err);
            });
            //return Promise.resolve([1, 2, 3, 4, 5, 6]);

        },

        getActiveRosters: function () {
            function activeRecForTeam(teamRecs) {
                return teamRecs.sort(function (a, b) {
                    if (typeof(a.start_date) !== 'undefined') {
                    var aDate = new Date(a.start_date.replace(/-/g, "/"));
                    var bDate = new Date(b.start_date.replace(/-/g, "/"));
                    if (aDate < bDate)
                        return 1;
                    if (aDate > bDate)
                        return -1;
                    }
                    return 0;
                })[0];
            }
            return service.getAllRosterRecords().then(function (rosterRecords) {
                var activeRecords = [];
                var sortedRosterRecords = rosterRecords.sort(function (a, b) {
                    if (a.team_id < b.team_id)
                        return -1;
                    if (a.team_id > b.team_id)
                        return 1;
                    return 0;
                });
                for (i = 0; i < sortedRosterRecords.length; i++) {
                    var teamRecords = rosterRecords.filter(function (rec) {
                        return (rec.team_id == sortedRosterRecords[i].team_id);
                    });

                    activeRecords.push( activeRecForTeam(teamRecords));
                    i += teamRecords.length - 1;
                }

            return activeRecords;
            });
        },

        getOwnerRoster: function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.PRIME_OWNER === owner;
            }

            return service.getActiveRosters().then(function (rosterRecords) {
                return rosterRecords.filter(rosterRecMatchesParam)
            });
        },

    }

    return service;
}])
;fantasyFantasyModule.service('ScoresService', function ($http) {
    var service = {
        getScoreRecords: function () {
            return $http.get('data/ResultsStore.json', { cache: false }).then(function (resp) {
                var outputArr = [];
                resp.data.data.forEach(function (gm) {
                    outputArr.push({
                        TEAM_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
                        OPPONENT_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
                        SEASON: gm.Season,
                        WEEK: gm.Week,
                        POINTS_FOR: gm['Home Score'],
                        POINTS_AGAINST: gm['Away Score'],
                        PROJ_POINTS_FOR: gm['HomeProj'],
                        PROJ_POINTS_AGAINST: gm['AwayProj'],
                        UPDATE_TIME: gm['Updated']
                    });
                    outputArr.push({
                        TEAM_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
                        OPPONENT_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
                        SEASON: gm.Season,
                        WEEK: gm.Week,
                        POINTS_FOR: gm['Away Score'],
                        POINTS_AGAINST: gm['Home Score'],
                        PROJ_POINTS_FOR: gm['AwayProj'],
                        PROJ_POINTS_AGAINST: gm['HomeProj'],
                        UPDATE_TIME: gm['Updated']
                    });

                });
                return outputArr;
            });
        },
        getScoreRecordsForWeek: function (wk, ssn) {
            var d = new Date();
            ssn = ssn || d.getFullYear()
            return scoreRecs = service.getScoreRecords().then(function (resp) {
                return resp.filter(function (sr) { return (sr.WEEK == wk && sr.SEASON == ssn); });
            });
        }

    }

    return service;
});


function FantasyMatchup(gm) {
    this.team1 = {
        TEAM_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
        OPPONENT_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
        SEASON: gm.Season,
        WEEK: gm.Week,
        POINTS_FOR: gm['Home Score'],
        POINTS_AGAINST: gm['Away Score'],
        PROJ_POINTS_FOR: gm['HomeProj'],
        PROJ_POINTS_AGAINST: gm['AwayProj'],
        UPDATE_TIME: gm['Updated']
    };
    this.team2 = {
        TEAM_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
        OPPONENT_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
        SEASON: gm.Season,
        WEEK: gm.Week,
        POINTS_FOR: gm['Away Score'],
        POINTS_AGAINST: gm['Home Score'],
        PROJ_POINTS_FOR: gm['AwayProj'],
        PROJ_POINTS_AGAINST: gm['HomeProj'],
        UPDATE_TIME: gm['Updated']
    };

};stateTreeModule.service('$stateTree', ['$state', function ($state) {
    var treeStates;

    this.nearestAncestor = function (stateName) {
        var ancestor = $state.get(stateName).$$state().parent;
        while (ancestor != '' && treeStates.indexOf(ancestor.self) == -1) {
            ancestor = ancestor.parent;
        }
        if (ancestor != '') {
            return ancestor.self;
        }
    };

    this.get = function () {
        var self = this;
        var states = $state.get();

        treeStates = states.filter(function (st) {
            return isDefined(st.tree);
        });

        treeStates.forEach(function (ts) {
            var anc = self.nearestAncestor(ts.name);
            if (isDefined(anc)) {
            ts.ancestor = anc;
            }
        });

        return treeStates;
    };




    this.getChildren = function (stateName) {
        var result;
        if (!treeStates) {this.get();}

        var result = treeStates.filter(function (ts) {
            if (isDefined(ts.ancestor)) {
                return (ts.ancestor.name == stateName);
            }
        });
        return result;
    }

}]);;fantasyFantasyModule.service('TeamsService', function ($http) {
    var service = {
        getAllTeams: function () {
            return $http.get('data/ffSetup.json', { cache: false }).then(function (resp) {
                return resp.data.teams;
            });
        },
        getFullSchedule: function () {
            return $http.get('data/ffSetup.json', { cache: false }).then(function (resp) {
                return resp.data.games;
            });
        },
        getGamesforWeek: function (wk) {
            return service.getFullSchedule().then(function (gmData) {
                return gmData.filter(function (gmRec) {
                    return (gmRec.Week == wk);
                });
            })
        },

        getTeam: function (id) {
            function teamMatchesParam(team) {
                return team.OWNER_ID === id;
            }

            return service.getAllTeams().then(function (teams) {
                return teams.find(teamMatchesParam)
            });
        },
        getPrimeTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_owners?transform=1').then(function (response) {
                players = response.data.prime_owners;
                return players;
            });
        },
        getTeamByOwnerName: function () {
            return service.getPrimeTeams().then(function (resp) {
                return resp.filter(function (PT) { return (PT.TEAM_NAME == ownerName); })
            });
        }

    }

    return service;
})

fantasyFantasyModule.service('FFDBService', [ '$http', 'TeamsService', '$q', 'ScoresService', function ( $http, TeamsService, $q, ScoresService) {

    var service = {

        addTeam: function (ownerName, teamName, season) {
            var tmObj = {
                TEAM_OWNER: ownerName,
                TEAM_NAME: teamName,
                SEASON: season
            };

            return $http.post('http://actuarialgames.x10host.com/includes/api.php/prime_owners', tmObj).then(function (resp) {
                return resp.data;
            });


        },
        getTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_owners?transform=1').then(function (response) {
                players = response.data.prime_owners;
                return players;
            });
        },
        deleteTeam: function (teamID) {
            return $http.delete('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + teamID).then(function (response) {
                return response.data;
            });
        },
        updateItem: function (item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + item.id, item).then(function (response) {
                return response.data;
            })
        },
        updateTable: function (tbl, item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/' + tbl + '/' + item.recno).then(function (response) {
                return response.data;
            })
        },
        getTeam: function (teamID) {
            return service.getTeams().then(function (response) {
                return response.find(function (tm) { return (tm.id == teamID) });
            });
        },
        addItemToTable: function (tbl, item) {
            return $http.post('http://actuarialgames.x10host.com/includes/api.php/' + tbl, item).then(function (resp) {
                return resp.data;
            });
        },
        getRosterRecs: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_rosters?transform=1').then(function (resp) {
                return resp.data.prime_rosters;
            });
        },
        getActiveRosters: function () {
            function activeRecForTeam(teamRecs) {
                return teamRecs.sort(function (a, b) {
                    if (typeof (a.start_date) !== 'undefined') {
                        var aDate = new Date(a.start_date.replace(/-/g, "/"));
                        var bDate = new Date(b.start_date.replace(/-/g, "/"));
                        if (aDate < bDate)
                            return 1;
                        if (aDate > bDate)
                            return -1;
                    }
                    return 0;
                })[0];
            }
            return service.getRosterRecs().then(function (rosterRecords) {
                var activeRecords = [];
                var sortedRosterRecords = rosterRecords.sort(function (a, b) {
                    if (a.team_id < b.team_id)
                        return -1;
                    if (a.team_id > b.team_id)
                        return 1;
                    return 0;
                });
                for (i = 0; i < sortedRosterRecords.length; i++) {
                    var teamRecords = rosterRecords.filter(function (rec) {
                        return (rec.team_id == sortedRosterRecords[i].team_id);
                    });

                    activeRecords.push(activeRecForTeam(teamRecords));
                    i += teamRecords.length - 1;
                }

                return $q.all([service.getTeams(), service.getAllTeamInfo()]).then(function (respArr) {
                    OwnersArr = respArr[0];
                    TeamInfoArr = respArr[1];
                    activeRecords.forEach(function (activeRosterRec) {
                        activeRosterRec.OWNER = OwnersArr.find(function (owner) { return (owner.TEAM_NAME == activeRosterRec.prime_owner); })
                        activeRosterRec.TEAM_INFO = TeamInfoArr.find(function (ti) { return (activeRosterRec.team_id == ti.LEAGUE_ID + '_' + ti.TEAM_ID); })
                    });
                    return activeRecords;
                });


                //return service.getTeams().then(function (PTs) {
                //    activeRecords.forEach(function (activeRosterRec) {
                //        activeRosterRec.OWNER = PTs.find(function (PT) { return (PT.TEAM_NAME == activeRosterRec.prime_owner); });
                //    });

                //    return activeRecords;
                //});
                    

            });
        },
        getWeekSetup: function () {
            return $http.get('data/weekDetails.json').then(function (resp) {
                //var wkDetails = resp.data.weeks.find(function (lookupWk, idx, arr) {
                //    var d = new Date(lookupWk['Scores Final']);
                //    var curTime = new Date();
                //    var last_d = (idx > 0 ? new Date(arr[idx-1]['Scores Final']) : new Date('1970-01-01'));
                //    return (curTime >= last_d && curTime < d);
                //});

                //$scope.goToWeek(wkDetails.WeekId);
                return resp.data.weeks;
            });
        },
        
        getRosterRecordsForWeek: function (wk, ssn) {
            return $q.all([service.getRosterRecs(), service.getWeekSetup()]).then(function (respArr) {
                var rosterRecords = respArr[0];
                var weekDetails = respArr[1];
                rosterLockTime = new Date(weekDetails.find(function (lookupWk) {return (lookupWk.WeekId == wk);})['Roster Lock Time']);
                var filteredRosterRecords = rosterRecords.filter(function (rr) {
                    return (new Date(rr.start_date) <= rosterLockTime);
                });

                var filteredRosterRecords = filteredRosterRecords.filter(function (rr, idx, arr) {
                    var teamRecArray = arr.filter(function (tmpRR) { return (rr.team_id == tmpRR.team_id) });

                    if (teamRecArray.length > 1) {
                        var maxStart = teamRecArray.reduce(function (a, b) { return new Date(a.start_date) > new Date(b.start_date) ? a : b; });
                        return (rr == maxStart)
                    } else {

                        return true;
                    }
                    

                });

                return filteredRosterRecords;
                
            });
        },
        getOwnerRoster: function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.prime_owner === owner;
            }

            return service.getActiveRosters().then(function (rosterRecords) {
                return service.getAllTeamInfo().then(function (teamRecords) {
                    var filteredRosterRecords = rosterRecords.filter(rosterRecMatchesParam)
                    filteredRosterRecords.forEach(function (rosterRec) {
                        rosterRec.TEAM_INFO = teamRecords.find(function (teamRec) {
                            return (rosterRec.team_id == teamRec.LEAGUE_ID + '_' + teamRec.TEAM_ID);
                        });
                    });
                    return filteredRosterRecords;
                })
                
            });
        },
        getAllTeamInfo: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_teams?transform=1').then(function (teams) {
                return ScoresService.getScoreRecords().then(function (scores) {
                    teams.data.prime_teams.forEach(function (tm) {
                        tm.scores = scores.filter(function (score) {
                            return (score.TEAM_ID == tm.LEAGUE_ID + '_' + tm.TEAM_ID);
                        });
                        tm.wins = tm.scores.filter(function (ts) { return (ts.POINTS_FOR > ts.POINTS_AGAINST); }).length;
                        tm.losses = tm.scores.filter(function (ts) { return (ts.POINTS_FOR < ts.POINTS_AGAINST); }).length;
                        tm.ties = tm.scores.filter(function (ts) { return (ts.POINTS_FOR == ts.POINTS_AGAINST); }).length;
                        tm.TOTAL_POINTS_FOR = tm.scores.sumProp('POINTS_FOR');
                        tm.TOTAL_POINTS_AGAINST = tm.scores.sumProp('POINTS_AGAINST');

                    });
                    return teams.data.prime_teams;
                });

                
            });
        },
        getTeamInfo: function(teamId) {
            return service.getAllTeamInfo().then(function (tms) {
                return tms.find(function (tm) { return ((tm.LEAGUE_ID + '_' +  tm.TEAM_ID) == teamId); })
            });
        },
        getRosterRecord: function(teamId) {
            return service.getActiveRosters().then(function (rrs) {
                return rrs.find(function (rr) { return (rr.team_id == teamId);})
            })
        },
        updateRosterRecord: function (updateRecord) {
            expireRecord = {
                recno: updateRecord.recno,
                end_date: new Date()
            }
            newRecord = {
                team_id: updateRecord.team_id,
                start_date: new Date(),
                position: updateRecord.position,
                prime_owner: updateRecord.prime_owner,

            }
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/prime_rosters/' + expireRecord.recno, expireRecord).then(function (response) {
                return $http.post('http://actuarialgames.x10host.com/includes/api.php/prime_rosters', newRecord).then(function (response) {
                    return response.data;
                });

            });
        },
        getScoresForWeek: function (week, ssn) {
            return ScoresService.getScoreRecordsForWeek(week, ssn).then(function (resp) {
                var scoreRecs = resp;
                return service.getActiveRosters().then(function (rosterRecs) {
//                    outputArr = [];
                    scoreRecs.forEach(function (scoreRec) {
                        // scoreRec.HOME_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        // scoreRec.AWAY_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        scoreRec.PRIME_ROSTER_ENTRY = rosterRecs.find(function (rosterRec) {return (rosterRec.team_id == scoreRec.TEAM_ID)});
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });
                    return scoreRecs;
                });

            })
        },
        getEnrichedRosters: function () {
            return service.getActiveRosters().then(function (activeRosters) {
                return service.getAllTeamInfo().then(function (teamInfo) {
                    activeRosters.forEach(function (ar) {
                        ar.TEAM_INFO = teamInfo.find(function (info_rec) {
                            return (info_rec.LEAGUE_ID + '_' + info_rec.TEAM_ID == ar.team_id);
                        })
                    });
                    return activeRosters;
                });
            });
        },
        submitWaiverClaim: function (addTm, dropTm) {
            newRec = {
                REQUESTER_ID: dropTm.prime_owner,
                ADD_TEAM_ID: addTm.team_id,
                DROP_TEAM_ID: dropTm.team_id,
                REQUEST_TIME: new Date()
            };

            return service.addItemToTable('prime_waivers', newRec).then(function (resp) {
                return resp; 
            });
        },
        processWaiverClaims: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_waivers?transform=1').then(function (waiverClaims) {
                return 2;
            })
        },
        getScheduleAndResults: function () {


            return $q.all([TeamsService.getFullSchedule(), ScoresService.getScoreRecords()]).then(function (respArr) {
                var sched = respArr[0];
                var scores = respArr[1].filter(function (rec) {return rec.SEASON == 2017});
                var rosterRecs = respArr[2];

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                weeks = scores.map(function (scr) { return (scr.WEEK); }).filter(onlyUnique);
                rosterLists = [];

                weeks.forEach(function (wk) {
                    rosterLists.push(service.getRosterRecordsForWeek(wk, 2017));
                });

                return $q.all(rosterLists).then(function (respArr) {
                    scores.forEach(function (scoreRec) {
                        scoreRec.PRIME_ROSTER_ENTRY = respArr[scoreRec.WEEK - 1].find(function (rr) { return (scoreRec.TEAM_ID == rr.team_id); });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });

                    sched.forEach(function (gameRec) {
                        var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { prime_owner :  gameRec['Team Name'] }, SEASON: 2017, WEEK: gameRec.Week } );
                        var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { prime_owner: gameRec['Opp Name'] }, SEASON: 2017, WEEK: gameRec.Week });

                        gameRec['Team W'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Team L'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Team T'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Opp W'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Opp L'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Opp T'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Pts (Starters)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Pts (Bench)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });
                        gameRec['Opp Pts (Starters)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Opp Pts (Bench)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });

                        gameRec['Team Result'] = determineResult(gameRec);
                        gameRec['Subgame Details'] = scoresForTeam;
                        gameRec['Subgame Opp Details'] = scoresForOpp;
                        gameRec['isCollapsed'] = true;
                    });

                    var fullresults = sched.reduce(function (result, current) {
                        result[current['Team Name']] = result[current['Team Name']] || [];
                        result[current['Team Name']].push(current);
                        if (current['Opp Name'] != 'BYE') {
                            result[current['Opp Name']] = result[current['Opp Name']] || [];
                            result[current['Opp Name']].push(current);
                        }                        
                        return result;
                    }, {});
                    var standings = [];
                    Object.keys(fullresults).forEach(function (tm) {
                        if (tm != 'BYE') {
                            standings.push(fullresults[tm].reduce(function (result, current) {
                                var myStr = ( tm == current['Team Name'] ? 'Team' : 'Opp')
                                var oppStr = ( tm == current['Team Name'] ? 'Opp' : 'Team')
                                var FF_POINTS = current[myStr + ' W'] + 0.5 * current[myStr + ' T'];
                                var OPP_POINTS = current[oppStr + ' W'] + 0.5 * current[oppStr + ' T'];
                                var FF_TEAM_POINTS = (myStr == 'Team' ? current['Pts (Starters)'] : current['Opp Pts (Starters)']);
                                var OPP_TEAM_POINTS = (myStr == 'Team' ? current['Opp Pts (Starters)'] : current['Pts (Starters)']);
                                var RESULT = (myStr == 'Team' ? current['Team Result'] : (current['Team Result'] == 'W' ? 'L' : (current['Team Result'] == 'L' ? 'W' : (current['Team Result'] == 'T' ? 'T' : ''))));
                                result.W = (result.W || 0) + (RESULT == 'W' ? 1 : 0)
                                result.L =( result.L || 0) + (RESULT == 'L' ? 1 : 0)
                                result.T = (result.T || 0) + (RESULT == 'T' ? 1 : 0)
                                result.FF_POINTS = (result.FF_POINTS || 0) + FF_POINTS
                                result.OPP_FF_POINTS = (result.OPP_FF_POINTS || 0 ) + OPP_POINTS
                                result.TEAM_POINTS = (result.TEAM_POINTS || 0 ) + FF_TEAM_POINTS
                                result.OPP_TEAM_POINTS = (result.OPP_TEAM_POINTS || 0) + OPP_TEAM_POINTS
                                return result;
                            }, {TEAM_NAME: tm, GAME_RECORDS: fullresults[tm]}))
                        }
                    })

                    return standings;



                })

                
            });

        }


    };

    return service;
}]);



determineResult = function (gameRec) {
    var gamePts = gameRec['Team W'] + 0.5 * gameRec['Team T'];
    var oppPts = gameRec['Opp W'] + 0.5 * gameRec['Opp T'];

    if (gamePts > oppPts) return 'W'
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)'])) return 'W';
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] == gameRec['Opp Pts (Starters)']) && (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)'])) return 'W';

    if ((gamePts > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
    return '';
}

function FantasyFantasyMatchup(gameRec) {
    // Constructor for FFMatchup - calculates result, status, etc. from a game record that contains a list of subgames. 

}
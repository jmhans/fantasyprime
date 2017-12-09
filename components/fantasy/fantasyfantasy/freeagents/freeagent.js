fantasyFantasyModule.component('allteams', {
    bindings: { fantasyTeams: '<', team: '<', week:'<' , roster: '<', myRosterUpdate: '&'},
    controller: FATableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/freeagents/freeagents.html'
})

function FATableCtrl($uibModal, $log, $document, FFDBService) {



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
            $ctrl.addingTeam = teamToAdd;
            $ctrl.droppingTeam = selectedItem;
            if ($ctrl.teamToAdd.addType == 'add') {
                $ctrl.addingTeam.prime_owner = $ctrl.team.TEAM_NAME;
                $ctrl.addingTeam.position = 'Bench';
                $ctrl.droppingTeam.prime_owner = '';
                $ctrl.droppingTeam.position = '';
                FFDBService.updateRosterRecord($ctrl.addingTeam).then(function (result) {
                    // Finalize add
                }, function () {
                    // Process failed
                })
                FFDBService.updateRosterRecord($ctrl.droppingTeam).then(function (result) {
                    // Finalize drop
                }, function () {
                    // Process failed.
                })
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


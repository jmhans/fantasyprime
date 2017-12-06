fantasyFantasyModule.component('allteams', {
    bindings: { fantasyTeams: '<', team: '<', week:'<' , roster: '<'},
    controller: FATableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/freeagents/freeagents.html'
})

function FATableCtrl($uibModal, $log, $document) {

    this.waiversActive = function () {
        return !this.addsAvailable();
    };
    this.addsAvailable = function () {
        return (new Date() <= new Date(this.week['Roster Lock Time']));
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


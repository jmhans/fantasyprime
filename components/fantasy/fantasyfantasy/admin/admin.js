
var tableAdminModule = angular.module('table-admin', [])

tableAdminModule.config(function ($stateProvider) {

    var states = [{
        name: 'admin',
        parent: 'ff',
        url: '/admin',
        component: 'tableadmincomponent',
        resolve: {
            tableRows: function (FFDBService) {
                var a = FFDBService.getTeams();
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



function tableAdminCtrl($http, DTOptionsBuilder, DTColumnBuilder, FFDBService, $scope, $state) {
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
    
    //vm.keys = Object.keys($scope.$parent.$resolve.tableRows[0]);

    //for (i = 0; i < vm.keys.length ; i++) {
    //    vm.dtColumns.push(DTColumnBuilder.newColumn(vm.keys[i]).withTitle(vm.keys[i]));
    //}

   // vm.dtColumns.push(DTColumnBuilder.newColumn(null, 'Actions'));

    vm.itemsToAdd = []

    vm.add = function (itemToAdd) {
        if (vm.actionsAvailable) {
            var index = vm.itemsToAdd.indexOf(itemToAdd);
            vm.itemsToAdd.splice(index, 1);

            if (itemToAdd.owner != '') {
                // Valid entry. Insert into DB. Else, do nothing.  
                vm.statusMessage = 'Adding data'
                FFDBService.addTeam(itemToAdd.owner, itemToAdd.teamName, itemToAdd.season).then(reloadData);
                // $http.post('http://actuarialgames.x10host.com/includes/api.php/footballdex', newItem).then(vm.refreshPlayers);
            }
        } else {
            vm.error = 'Actions currently disabled.'
        }
    }

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
            $http.delete('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + itemToDelete.id).then(reloadData);
        }
    };

    vm.updateItem = function (itemToUpdate) {
        if (vm.actionsAvailable) {

            var newObj = {
                id: itemToUpdate.id,
                SEASON: itemToUpdate.editTeamSeason,
                TEAM_NAME: itemToUpdate.editTeamName,
                TEAM_OWNER: itemToUpdate.editTeamOwner
            };
            vm.statusMessage = 'Updating data'
            FFDBService.updateItem(newObj).then(reloadData);
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


    vm.itemsToAddIsEmpty = function () { return (vm.itemsToAdd.length == 0); };

    vm.showError = function () { return (vm.error != ''); };

    vm.showSuccess = function () { return (vm.successMessage != ''); };

    vm.showStatus = function () { return (vm.statusMessage != ''); };

    vm.deleteOkay = function () { return true; };

};




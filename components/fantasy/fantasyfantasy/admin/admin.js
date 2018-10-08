
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




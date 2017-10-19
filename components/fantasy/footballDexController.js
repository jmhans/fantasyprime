
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

    vm.actionsAvailable = false; //True for testing only. Should be set back to false.

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


  
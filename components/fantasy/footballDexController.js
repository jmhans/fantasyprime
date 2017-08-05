
var app = angular.module('fantasyfantasy')

app.component('rfa', {
    bindings: {keepers : '<'},
    templateUrl: 'components/fantasy/rfa.html',
    controller: footballdexCtrl,
    controllerAs: 'bm'
})

function testC() {

}


        // $scope.params = $routeParams;
function footballdexCtrl($http, DTOptionsBuilder, DTColumnDefBuilder, footballdexService, $scope) {
    var vm = this;

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

    /*$http.get('../includes/api.php/footballdex?transform=1').then(function (response) {
        vm.players = response.data.footballdex;
        vm.players.forEach(function (plyr) {

            
        });

    });*/


    vm.itemsToAdd = []

    vm.add = function (itemToAdd) {

        var index = vm.itemsToAdd.indexOf(itemToAdd);
        vm.itemsToAdd.splice(index, 1);
        
        var newItem = {
            team: itemToAdd.team,
            rfa: itemToAdd.rfa,
            season: (new Date).getFullYear()
        }
        if (newItem.rfa != '') {
            // Valid entry. Insert into DB. Else, do nothing.  
            $http.post('../includes/api.php/footballdex', newItem).then(vm.refreshPlayers);
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
        vm.keepers = footballdexService.getRFAs();

    }

//    vm.refreshPlayers();

    vm.deleteItem = function (itemToDelete) {
        $http.delete('http://actuarialgames.x10host.com/includes/api.php/footballdex/' + itemToDelete.recNo).then(vm.refreshPlayers);
    };

    vm.itemsToAddIsEmpty = function () { return (vm.itemsToAdd.length == 0); };

    vm.showError = function () { return (vm.error != ''); };

    vm.showSuccess = function () { return (vm.successMessage != ''); };

    vm.deleteOkay = function () { return false; };

    vm.submitBid = function (plyr) {
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
            bid_amount: plyr.bidAmount
        }


        if (vm.error == '') {
            // Valid entry. Insert into DB. Else, do nothing.  
            $http.post('http://actuarialgames.x10host.com/includes/api.php/rfa_bids', newItem).then(function SuccessFunction(response) {
                vm.successMessage =  plyr.bidder + " bid $" + plyr.bidAmount + " on " + plyr.rfa;
                vm.refreshPlayers();
            });
        }


    }

};


  
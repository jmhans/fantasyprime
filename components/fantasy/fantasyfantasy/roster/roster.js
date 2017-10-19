
//fantasyFantasyModule.config(function ($stateProvider) {
//    var state = {
//        name: 'roster',
//        url: '/roster',
//        parent: 'team',
//        component: 'roster',
//        requiresParams: true,
//        resolve: {
//            //team: function (teams, $rootScope, $stateParams, TeamsService, FFDBService) {
//            //    return FFDBService.getTeam($stateParams.teamId).then(function (tm) {
//            //        $rootScope.selectedTeam = tm;
//            //        return $rootScope.selectedTeam;
//            //    });

//            //    /*return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
//            //        $rootScope.selectedTeam = tm;
//            //        return $rootScope.selectedTeam;
//            //    });*/

//            //},
//            roster: function (RostersService, team) {
//                return RostersService.getOwnerRoster(team.TEAM_NAME);
//            }

//        }
//    };
//    $stateProvider.state(state);
//   });

fantasyFantasyModule.component('roster', {
    bindings: { roster: '<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html',
    controllerAs: 'newThing'
})


function RosterTableCtrl($http, DTOptionsBuilder, DTColumnBuilder, DTColumnDefBuilder, GoogleSheetsService, $scope, $compile) {

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
    /*vm.dtColumns = [
        DTColumnBuilder.newColumn('TeamID').withTitle('Team ID')
        ,DTColumnBuilder.newColumn('TeamName (Ref Only)').withTitle('Team Name')
        ,DTColumnBuilder.newColumn('Owner').withTitle('Owner')
        ,DTColumnBuilder.newColumn(null).withTitle('Position')
    ];*/

    vm.options = {
        'aoColumns': [{
            'mData': 'TeamID', 'sTitle': 'Team ID'
        },
        {
            'mData': 'TeamName (Ref Only)', 'sTitle': 'Team Name'
        },
        {
            'mData': 'Owner', 'sTitle': 'Owner'
        },
        {
             "mData": null, 'sTitle': 'Position' 
        }

        ]
    }

    $scope.$watch(vm.roster, function (newVal, oldVal) {
        console.log(newVal);
    });

   
    vm.updateRoster = _updateRoster;

    vm.updateTeamRecord = _updateRoster;

    function _updateRoster() {
        console.log('it worked!')
    }
 
    //$.fn.dataTable.ext.order['dom-select'] = function (settings, col) {
    //    return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
    //        return $('select', td).val();
    //    });
    //};
    //var vm = this;
    //vm.dtOptions = DTOptionsBuilder.newOptions()
    //    .withOption('paging', false)
    //    .withOption('searching', false)
    //    .withOption('order', [[3, 'desc']]);
    //vm.dtColumnDefs = [
    //    DTColumnDefBuilder.newColumnDef(0),
    //    DTColumnDefBuilder.newColumnDef(1),
    //    DTColumnDefBuilder.newColumnDef(2),
    //    DTColumnDefBuilder.newColumnDef(3).withOption( "orderDataType", "dom-select" ),
    //    DTColumnDefBuilder.newColumnDef(4).notSortable()
    //];
    //vm.dtInstance = {};
    //vm.dropTeam = dropTeam;
    //vm.updateTeamRecord = updateTeamRecord;
    //vm.handleAuthClick = GoogleSheetsService._handleAuthClick;
    //vm.handleSignoutClick = GoogleSheetsService._handleSignoutClick;
    //vm.changePosition = changePosition;
    //vm.origRoster = vm.roster.slice(0);
    
    //function dropTeam(index) {
    //    vm.roster.splice(index, 1);
    //}

    //function changePosition($idx) {
    //    vm.dtInstance.rerender();//DataTable.order();
    //}
    //function updateTeamRecord() {
    //    tmRec = {
    //        "RecNo": 363,
    //        "TeamID": "fakeID",
    //        "TeamName (Ref Only)": "fakeName",
    //        "Owner": "fakeOwner",
    //        "Position" : "fakeBench"

    //    }

    //    GoogleSheetsService.writeRosterRecord(tmRec)
    //}

}

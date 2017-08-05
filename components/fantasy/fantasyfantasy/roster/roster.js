var app = angular.module('fantasyfantasy')

app.config(function ($stateProvider) {
    var state = {
        name: 'ff.teams.team.roster',
        url: '/roster',
        component: 'roster',
        requiresParams: true,
        resolve: {
            team: function (teams, $rootScope, $stateParams, TeamsService) {
                return TeamsService.getTeam($stateParams.teamId).then(function (tm) {
                    $rootScope.selectedTeam = tm;
                    return $rootScope.selectedTeam;
                });

            },
            roster: function (RostersService, team) {
                return RostersService.getOwnerRoster(team.name);
            }

        }
    };
    $stateProvider.state(state);
   });

app.component('roster', {
    bindings: { roster: '<'},
    controller: RosterTableCtrl, 
    templateUrl: 'components/fantasy/fantasyfantasy/roster/roster.html'
})


function RosterTableCtrl($http, DTOptionsBuilder, DTColumnDefBuilder, GoogleSheetsService) {
    $.fn.dataTable.ext.order['dom-select'] = function (settings, col) {
        return this.api().column(col, { order: 'index' }).nodes().map(function (td, i) {
            return $('select', td).val();
        });
    };
    var vm = this;
    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('paging', false)
        .withOption('searching', false)
        .withOption('order', [[3, 'desc']]);
    vm.dtColumnDefs = [
        DTColumnDefBuilder.newColumnDef(0),
        DTColumnDefBuilder.newColumnDef(1),
        DTColumnDefBuilder.newColumnDef(2),
        DTColumnDefBuilder.newColumnDef(3).withOption( "orderDataType", "dom-select" ),
        DTColumnDefBuilder.newColumnDef(4).notSortable()
    ];
    vm.dtInstance = {};
    vm.dropTeam = dropTeam;
    vm.updateTeamRecord = updateTeamRecord;
    vm.handleAuthClick = GoogleSheetsService._handleAuthClick;
    vm.handleSignoutClick = GoogleSheetsService._handleSignoutClick;
    vm.changePosition = changePosition;
    vm.origRoster = vm.roster.slice(0);
    
    function dropTeam(index) {
        vm.roster.splice(index, 1);
    }

    function changePosition($idx) {
        vm.dtInstance.rerender();//DataTable.order();
    }
    function updateTeamRecord() {
        tmRec = {
            "RecNo": 363,
            "TeamID": "fakeID",
            "TeamName (Ref Only)": "fakeName",
            "Owner": "fakeOwner",
            "Position" : "fakeBench"

        }

        GoogleSheetsService.writeRosterRecord(tmRec)
    }

}

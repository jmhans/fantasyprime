angular.module('fantasyfantasy').service('RostersService', function ($http, $rootScope) {
    var service = {
        getAllRosterRecords: function () {
           return $rootScope.GApi.sheets.spreadsheets.values.get({
                spreadsheetId: '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns',
                range: 'RosterRecords!A:G',
            }).then(function (resp) {
                return convertSSArraytoJSON(resp.result.values);
            });
        },

        getOwnerRoster: function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.Owner === owner;
            }

            return service.getAllRosterRecords().then(function (rosterRecords) {
                return rosterRecords.filter(rosterRecMatchesParam)
            });
        }
    }

    return service;
})

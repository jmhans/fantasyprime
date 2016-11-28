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

        getActiveRosters: function () {
            function activeRecForTeam(teamRecs) {
                return teamRecs.sort(function (a, b) {

                    var aDate = new Date(a.StartDate.replace(/-/g, "/"));
                    var bDate = new Date(b.StartDate.replace(/-/g, "/"));
                    if (aDate < bDate)
                        return -1;
                    if (aDate > bDate)
                        return 1;
                    return 0;
                })[0];
            }
            return service.getAllRosterRecords().then(function (rosterRecords) {
                var activeRecords = [];
                var sortedRosterRecords = rosterRecords.sort(function (a, b) {
                    if (a.TeamID < b.TeamID)
                        return -1;
                    if (a.TeamID > b.TeamID)
                        return 1;
                    return 0;
                });
                for (i = 0; i < sortedRosterRecords.length; i++) {
                    var teamRecords = rosterRecords.filter(function (rec) {
                        return (rec.TeamID == sortedRosterRecords[i].TeamID);
                    });

                    activeRecords.push( activeRecForTeam(teamRecords));
                    i += teamRecords.length - 1;
                }

            return activeRecords;
            });
        },

        getOwnerRoster: function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.Owner === owner;
            }

            return service.getActiveRosters().then(function (rosterRecords) {
                return rosterRecords.filter(rosterRecMatchesParam)
            });
        }
    }

    return service;
})

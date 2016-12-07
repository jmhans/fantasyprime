angular.module('fantasyfantasy').service('RostersService', ['GoogleSheetsService', function (GoogleSheetsService) {

    var service = {
        getAllRosterRecords: function () {
            
            return GoogleSheetsService.getData().then(function (data) {
                return data.RosterRecords;
            }, function (err) {
                console.log('Failed: ' + err);
            });
            //return Promise.resolve([1, 2, 3, 4, 5, 6]);

        },

        getActiveRosters: function () {
            function activeRecForTeam(teamRecs) {
                return teamRecs.sort(function (a, b) {
                    if (typeof(a.StartDate) !== 'undefined') {
                    var aDate = new Date(a.StartDate.replace(/-/g, "/"));
                    var bDate = new Date(b.StartDate.replace(/-/g, "/"));
                    if (aDate < bDate)
                        return 1;
                    if (aDate > bDate)
                        return -1;
                    }
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
}])

fantasyFantasyModule.service('TeamsService', function ($http) {
    var service = {
        getAllTeams: function () {
            return $http.get('data/data.json', { cache: true }).then(function (resp) {
                return resp.data.teams;
            });
        },
        getFullSchedule: function () {
            return $http.get('data/data.json', { cache: true }).then(function (resp) {
                return resp.data.games;
            });
        },
        getGamesforWeek: function (wk) {
            return service.getFullSchedule().then(function (gmData) {
                return gmData.filter(function (gmRec) {
                    return (gmRec.Week == wk);
                });
            })
        },

        getTeam: function (id) {
            function teamMatchesParam(team) {
                return team.id === id;
            }

            return service.getAllTeams().then(function (teams) {
                return teams.find(teamMatchesParam)
            });
        },
        getPrimeTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_owners?transform=1').then(function (response) {
                players = response.data.prime_owners;
                return players;
            });
        }

    }

    return service;
})

fantasyFantasyModule.service('FFDBService', [ '$http', function ( $http) {
    this.activeTeam = {};

    var service = {

        addTeam: function (ownerName, teamName, season) {
            var tmObj = {
                TEAM_OWNER: ownerName,
                TEAM_NAME: teamName,
                SEASON: season
            };

            return $http.post('http://actuarialgames.x10host.com/includes/api.php/prime_owners', tmObj).then(function (resp) {
                return resp.data;
            });


        },
        getTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_owners?transform=1').then(function (response) {
                players = response.data.prime_owners;
                return players;
            });
        },
        deleteTeam: function (teamID) {
            return $http.delete('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + teamID).then(function (response) {
                return response.data;
            });
        },
        updateItem: function (item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/prime_owners/' + item.id, item).then(function (response) {
                return response.data;
            })
        },
        updateTable: function (tbl, item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/' + tbl + '/' + item.recno).then(function (response) {
                return response.data;
            })
        },
        getTeam: function (teamID) {
            return service.getTeams().then(function (response) {
                return response.find(function (tm) { return (tm.id == teamID) });
            });
        },
        addItemToTable: function (tbl, item) {
            return $http.post('http://actuarialgames.x10host.com/includes/api.php/' + tbl, item).then(function (resp) {
                return resp.data;
            });
        },
        addRosterRecord: function (rosterRec) {
            return service.addItemToTable('prime_rosters', rosterRec).then(function (resp) {
                return resp.data;
            });
        },
        getRosterRecs: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_rosters?transform=1').then(function (resp) {
                return resp.data.prime_rosters;
            });
        },
        getActiveRosters: function () {
            function activeRecForTeam(teamRecs) {
                return teamRecs.sort(function (a, b) {
                    if (typeof (a.start_date) !== 'undefined') {
                        var aDate = new Date(a.start_date.replace(/-/g, "/"));
                        var bDate = new Date(b.start_date.replace(/-/g, "/"));
                        if (aDate < bDate)
                            return 1;
                        if (aDate > bDate)
                            return -1;
                    }
                    return 0;
                })[0];
            }
            return service.getRosterRecs().then(function (rosterRecords) {
                var activeRecords = [];
                var sortedRosterRecords = rosterRecords.sort(function (a, b) {
                    if (a.team_id < b.team_id)
                        return -1;
                    if (a.team_id > b.team_id)
                        return 1;
                    return 0;
                });
                for (i = 0; i < sortedRosterRecords.length; i++) {
                    var teamRecords = rosterRecords.filter(function (rec) {
                        return (rec.team_id == sortedRosterRecords[i].team_id);
                    });

                    activeRecords.push(activeRecForTeam(teamRecords));
                    i += teamRecords.length - 1;
                }

                return activeRecords;
            });
        },

        getOwnerRoster: function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.prime_owner === owner;
            }

            return service.getActiveRosters().then(function (rosterRecords) {
                return service.getAllTeamInfo().then(function (teamRecords) {
                    var filteredRosterRecords = rosterRecords.filter(rosterRecMatchesParam)
                    filteredRosterRecords.forEach(function (rosterRec) {
                        rosterRec.team_name = teamRecords.find(function (teamRec) {
                            return (rosterRec.team_id == teamRec.LEAGUE_ID + '_' + teamRec.TEAM_ID);
                        }).TEAM_NAME;
                    });
                    return filteredRosterRecords;
                })
                
            });
        },

        getAllTeamInfo: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_teams?transform=1').then(function (resp) {
                return resp.data.prime_teams;
            });
        },
        updateRosterRecord: function (updateRecord) {
            expireRecord = {
                recno: updateRecord.recno,
                end_date: new Date()
            }
            newRecord = {
                team_id: updateRecord.team_id, 
                start_date: new Date(), 
                position: updateRecord.position,
                prime_owner: updateRecord.prime_owner, 

            }
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/prime_rosters/' + expireRecord.recno, expireRecord).then(function (response) {
                return $http.post('http://actuarialgames.x10host.com/includes/api.php/prime_rosters', newRecord).then(function (response) {
                    return response.data;
                });

            });
        }


    };

    return service;
}]);
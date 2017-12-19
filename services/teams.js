fantasyFantasyModule.service('TeamsService', function ($http) {
    var service = {
        getAllTeams: function () {
            return $http.get('data/data.json', { cache: false }).then(function (resp) {
                return resp.data.teams;
            });
        },
        getFullSchedule: function () {
            return $http.get('data/data.json', { cache: false }).then(function (resp) {
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
        },
        getTeamByOwnerName: function () {
            return service.getPrimeTeams().then(function (resp) {
                return resp.filter(function (PT) { return (PT.TEAM_NAME == ownerName); })
            });
        }

    }

    return service;
})

fantasyFantasyModule.service('FFDBService', [ '$http', 'TeamsService', '$q', 'ScoresService', function ( $http, TeamsService, $q, ScoresService) {
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

                return $q.all([service.getTeams(), service.getAllTeamInfo()]).then(function (respArr) {
                    OwnersArr = respArr[0];
                    TeamInfoArr = respArr[1];
                    activeRecords.forEach(function (activeRosterRec) {
                        activeRosterRec.OWNER = OwnersArr.find(function (owner) { return (owner.TEAM_NAME == activeRosterRec.prime_owner); })
                        activeRosterRec.TEAM_INFO = TeamInfoArr.find(function (ti) { return (activeRosterRec.team_id == ti.LEAGUE_ID + '_' + ti.TEAM_ID); })
                    });
                    return activeRecords;
                });


                //return service.getTeams().then(function (PTs) {
                //    activeRecords.forEach(function (activeRosterRec) {
                //        activeRosterRec.OWNER = PTs.find(function (PT) { return (PT.TEAM_NAME == activeRosterRec.prime_owner); });
                //    });

                //    return activeRecords;
                //});
                    

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
                        rosterRec.TEAM_INFO = teamRecords.find(function (teamRec) {
                            return (rosterRec.team_id == teamRec.LEAGUE_ID + '_' + teamRec.TEAM_ID);
                        });
                    });
                    return filteredRosterRecords;
                })
                
            });
        },

        getAllTeamInfo: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_teams?transform=1').then(function (teams) {
                return ScoresService.getScoreRecords().then(function (scores) {
                    teams.data.prime_teams.forEach(function (tm) {
                        tm.scores = scores.filter(function (score) {
                            return (score.TEAM_ID == tm.LEAGUE_ID + '_' + tm.TEAM_ID);
                        });
                        tm.wins = tm.scores.filter(function (ts) { return (ts.POINTS_FOR > ts.POINTS_AGAINST); }).length;
                        tm.losses = tm.scores.filter(function (ts) { return (ts.POINTS_FOR < ts.POINTS_AGAINST); }).length;
                        tm.ties = tm.scores.filter(function (ts) { return (ts.POINTS_FOR == ts.POINTS_AGAINST); }).length;
                        tm.TOTAL_POINTS_FOR = tm.scores.sumProp('POINTS_FOR');
                        tm.TOTAL_POINTS_AGAINST = tm.scores.sumProp('POINTS_AGAINST');

                    });
                    return teams.data.prime_teams;
                });

                
            });
        },
        getTeamInfo: function(teamId) {
            return service.getAllTeamInfo().then(function (tms) {
                return tms.find(function (tm) { return ((tm.LEAGUE_ID + '_' +  tm.TEAM_ID) == teamId); })
            });
        },
        getRosterRecord: function(teamId) {
            return service.getActiveRosters().then(function (rrs) {
                return rrs.find(function (rr) { return (rr.team_id == teamId);})
            })
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
        },
        getScoresForWeek: function (week, ssn) {
            return ScoresService.getScoreRecordsForWeek(week, ssn).then(function (resp) {
                var scoreRecs = resp;
                return service.getActiveRosters().then(function (rosterRecs) {
//                    outputArr = [];
                    scoreRecs.forEach(function (scoreRec) {
                        // scoreRec.HOME_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        // scoreRec.AWAY_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        scoreRec.PRIME_ROSTER_ENTRY = rosterRecs.find(function (rosterRec) {return (rosterRec.team_id == scoreRec.TEAM_ID)});
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });
                    return scoreRecs;
                });

            })
        },
        getEnrichedRosters: function () {
            return service.getActiveRosters().then(function (activeRosters) {
                return service.getAllTeamInfo().then(function (teamInfo) {
                    activeRosters.forEach(function (ar) {
                        ar.TEAM_INFO = teamInfo.find(function (info_rec) {
                            return (info_rec.LEAGUE_ID + '_' + info_rec.TEAM_ID == ar.team_id);
                        })
                    });
                    return activeRosters;
                });
            });
        },
        submitWaiverClaim: function (addTm, dropTm) {
            newRec = {
                REQUESTER_ID: dropTm.prime_owner,
                ADD_TEAM_ID: addTm.team_id,
                DROP_TEAM_ID: dropTm.team_id,
                REQUEST_TIME: new Date()
            };

            return service.addItemToTable('prime_waivers', newRec).then(function (resp) {
                return resp; 
            });
        }


    };

    return service;
}]);
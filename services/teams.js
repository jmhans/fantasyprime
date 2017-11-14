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
        } ,
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
        getScoresForWeek: function (week) {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_scores?transform=1').then(function (resp) {
                var scoreRecs = resp.data.prime_scores.filter(function (ps) { return (ps.WEEK == week) });
                return service.getActiveRosters().then(function (rosterRecs) {
                    outputArr = [];
                    scoreRecs.forEach(function (scoreRec) {
                        scoreRec.HOME_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.LEAGUE_ID + '_' + scoreRec.HOME_TEAM_ID); }).OWNER;
                        scoreRec.AWAY_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.LEAGUE_ID + '_' + scoreRec.AWAY_TEAM_ID); }).OWNER;
                        outputArr.push({
                            TEAM_ID: scoreRec.LEAGUE_ID + '_' + scoreRec.HOME_TEAM_ID,
                            LOCATION: 'HOME',
                            RESULT: (scoreRec.HOME_SCORE > scoreRec.AWAY_SCORE ? 'W' : (scoreRec.HOME_SCORE < scoreRec.AWAY_SCORE ? 'L' : 'T')),
                            GAME_INFO: scoreRec,
                            PRIME_ROSTER_ENTRY: rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.LEAGUE_ID + '_' + scoreRec.HOME_TEAM_ID); }),
                            OPPONENT: scoreRec.LEAGUE_ID + '_' + scoreRec.AWAY_TEAM_ID,
                            POINTS_FOR: scoreRec.HOME_SCORE, 
                            POINTS_AGAINST: scoreRec.AWAY_SCORE,
                            PROJ_POINTS_FOR: scoreRec.HOME_PROJ,
                            PROJ_POINTS_AGAINST: scoreRec.AWAY_PROJ
                        });
                        outputArr.push({
                            TEAM_ID: scoreRec.LEAGUE_ID + '_' + scoreRec.AWAY_TEAM_ID,
                            LOCATION: 'AWAY',
                            RESULT: (scoreRec.HOME_SCORE > scoreRec.AWAY_SCORE ? 'L' : (scoreRec.HOME_SCORE < scoreRec.AWAY_SCORE ? 'W' : 'T')),
                            GAME_INFO: scoreRec,
                            PRIME_ROSTER_ENTRY: rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.LEAGUE_ID + '_' + scoreRec.AWAY_TEAM_ID); }),
                            OPPONENT: scoreRec.LEAGUE_ID + '_' + scoreRec.HOME_TEAM_ID,
                            POINTS_FOR: scoreRec.AWAY_SCORE,
                            POINTS_AGAINST: scoreRec.HOME_SCORE,
                            PROJ_POINTS_FOR: scoreRec.AWAY_PROJ,
                            PROJ_POINTS_AGAINST: scoreRec.HOME_PROJ
                        });
                    });
                    return outputArr;
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
        }


    };

    return service;
}]);
fantasyFantasyModule.service('FantasyFantasyService', function ($http) {
    var service = {
        getConfig: function () {
            return $http.get('data/ffconfig.json', { cache: true }).then(function (resp) {
                return resp.data;
            });
        }
    }

    return service;
})
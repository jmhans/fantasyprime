const BASE_URL = "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/fantasyprime";

fantasyFantasyModule.service('AWSFantasyService', function ($http, $q, ScoresService) {
    var service = {
        getAllTeams: function () {
            postData = {
                tableName: "FantasyPrime_Owners", 
                requestType: "QUERY", 
                record: {}
            };
            return $http.post(BASE_URL, postData).then(function (resp) {
                return resp.data;
            });
        },
        getFullSchedule: function () {
            return $http.get('data/ffSetup.json', { cache: false }).then(function (resp) {
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
            postData = {
                tableName: "FantasyPrime_Owners", 
                requestType: "QUERY", 
                record: {}
            };
            return $http.post(BASE_URL, postData).then(function (response) {
                players = response.data;
                return players;
            });
        },
        getTeamByOwnerName: function () {
            return service.getPrimeTeams().then(function (resp) {
                return resp.filter(function (PT) { return (PT.TEAM_NAME == ownerName); })
            });
        }, 


        addTeam: function (ownerName, teamName, season) {

            var existingData = getPrimeTeams();
            var curIDMax = existingData.reduce(function(curMax, tm) {return (Math.max(curMax, parseInt(tm.ownerID)))});
            var record = {
                    ownerID: (curIDMax + 1).toString(), 
                    TEAM_OWNER: ownerName,
                    TEAM_NAME: teamName, 
                    SEASON: season
                };
            return service.addItemToTable("FantasyPrime_Owners", record);

        },
        updateOwner: function (item) {
            return addItemToTable("FantasyPrime_Owners", item)
        },
        addItemToTable: function (tbl, item) {
            var postData = {
                tableName: tbl,
                requestType: "ADD",
                record: item
            }
            return $http.post(BASE_URL, postData).then(function (resp) {
                return resp.data;
            });
        },
        getRosterRecs: function () {
            postData = {
                tableName: "FantasyPrime_RosterRecords",
                requestType: "QUERY",
                record: {}
            }
            return $http.post(BASE_URL, postData).then(function (resp) {
                return resp.data;
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

            });
        },
        getWeekSetup: function () {
            return $http.get('data/weekDetails.json').then(function (resp) {
                return resp.data.weeks;
            });
        },
        getRosterRecordsForWeek: function (wk, ssn) {
            return $q.all([service.getRosterRecs(), service.getWeekSetup()]).then(function (respArr) {
                var rosterRecords = respArr[0];
                var weekDetails = respArr[1];
                rosterLockTime = new Date(weekDetails.find(function (lookupWk) { return (lookupWk.WeekId == wk); })['Roster Lock Time']);
                var filteredRosterRecords = rosterRecords.filter(function (rr) {
                    return (new Date(rr.start_date) <= rosterLockTime);
                });

                var filteredRosterRecords = filteredRosterRecords.filter(function (rr, idx, arr) {
                    var teamRecArray = arr.filter(function (tmpRR) { return (rr.team_id == tmpRR.team_id) });

                    if (teamRecArray.length > 1) {
                        var maxStart = teamRecArray.reduce(function (a, b) { return new Date(a.start_date) > new Date(b.start_date) ? a : b; });
                        return (rr == maxStart)
                    } else {

                        return true;
                    }


                });

                return filteredRosterRecords;

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
            var teams = service.getTeams();
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

        },
        getRosterRecord: function (teamId) {
            return service.getActiveRosters().then(function (rrs) {
                return rrs.find(function (rr) { return (rr.team_id == teamId); })
            })
        },
        updateRosterRecord: function (updateRecord) {
            var expireRecord = getRosterRecord(updateRecord.team_id);
            expireRecord.end_date = new Date();
            var expirePost = {
                tableName: "FantasyPrime_RosterRecords", 
                requestType: "ADD", 
                record: expireRecord
            }
            var createPost = {
                tableName: "FantasyPrime_RosterRecords", 
                requestType: "ADD", 
                record: { 
                    SEASON: expireRecord.end_date.getFullYear(),
                    TIMESTAMP: expireRecord.end_date, 
                    team_id: updateRecord.team_id,
                    start_date: new Date(),
                    position: updateRecord.position,
                    prime_owner: updateRecord.prime_owner,
                }
            };
            return $http.post(BASE_URL, expirePost).then(function () {
                return $http.post(BASE_URL, createPost).then(function (response) {
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
                        scoreRec.PRIME_ROSTER_ENTRY = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID) });
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
                TIMESTAMP: new Date()
            };

            return service.addItemToTable('FantasyPrime_Waivers', newRec).then(function (resp) {
                return resp;
            });
        },
        getScheduleAndResults: function () {
            return $q.all([service.getFullSchedule(), ScoresService.getScoreRecords()]).then(function (respArr) {
                var sched = respArr[0];
                var scores = respArr[1].filter(function (rec) { return rec.SEASON == CURRENT_SEASON });
                var rosterRecs = respArr[2];

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                weeks = scores.map(function (scr) { return (scr.WEEK); }).filter(onlyUnique);
                rosterLists = [];

                weeks.forEach(function (wk) {
                    rosterLists.push(service.getRosterRecordsForWeek(wk, CURRENT_SEASON));
                });

                return $q.all(rosterLists).then(function (respArr) {
                    scores.forEach(function (scoreRec) {
                        scoreRec.PRIME_ROSTER_ENTRY = respArr[scoreRec.WEEK - 1].find(function (rr) { return (scoreRec.TEAM_ID == rr.team_id); });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });

                    sched.forEach(function (gameRec) {
                        var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { prime_owner: gameRec['Team Name'] }, SEASON: 2017, WEEK: gameRec.Week });
                        var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { prime_owner: gameRec['Opp Name'] }, SEASON: 2017, WEEK: gameRec.Week });

                        gameRec['Team W'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Team L'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Team T'] = scoresForTeam.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Opp W'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'W' }).length;
                        gameRec['Opp L'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'L' }).length;
                        gameRec['Opp T'] = scoresForOpp.filterWithCriteria({ PRIME_ROSTER_ENTRY: { position: 'Starter' }, RESULT: 'T' }).length;

                        gameRec['Pts (Starters)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Pts (Bench)'] = scoresForTeam.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });
                        gameRec['Opp Pts (Starters)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Starter' } });
                        gameRec['Opp Pts (Bench)'] = scoresForOpp.SUMIFS('POINTS_FOR', { PRIME_ROSTER_ENTRY: { position: 'Bench' } });

                        gameRec['Team Result'] = determineResult(gameRec);
                        gameRec['Subgame Details'] = scoresForTeam;
                        gameRec['Subgame Opp Details'] = scoresForOpp;
                        gameRec['isCollapsed'] = true;
                    });

                    var fullresults = sched.reduce(function (result, current) {
                        result[current['Team Name']] = result[current['Team Name']] || [];
                        result[current['Team Name']].push(current);
                        if (current['Opp Name'] != 'BYE') {
                            result[current['Opp Name']] = result[current['Opp Name']] || [];
                            result[current['Opp Name']].push(current);
                        }
                        return result;
                    }, {});
                    var standings = [];
                    Object.keys(fullresults).forEach(function (tm) {
                        if (tm != 'BYE') {
                            standings.push(fullresults[tm].reduce(function (result, current) {
                                var myStr = (tm == current['Team Name'] ? 'Team' : 'Opp')
                                var oppStr = (tm == current['Team Name'] ? 'Opp' : 'Team')
                                var FF_POINTS = current[myStr + ' W'] + 0.5 * current[myStr + ' T'];
                                var OPP_POINTS = current[oppStr + ' W'] + 0.5 * current[oppStr + ' T'];
                                var FF_TEAM_POINTS = (myStr == 'Team' ? current['Pts (Starters)'] : current['Opp Pts (Starters)']);
                                var OPP_TEAM_POINTS = (myStr == 'Team' ? current['Opp Pts (Starters)'] : current['Pts (Starters)']);
                                var RESULT = (myStr == 'Team' ? current['Team Result'] : (current['Team Result'] == 'W' ? 'L' : (current['Team Result'] == 'L' ? 'W' : (current['Team Result'] == 'T' ? 'T' : ''))));
                                result.W = (result.W || 0) + (RESULT == 'W' ? 1 : 0)
                                result.L = (result.L || 0) + (RESULT == 'L' ? 1 : 0)
                                result.T = (result.T || 0) + (RESULT == 'T' ? 1 : 0)
                                result.FF_POINTS = (result.FF_POINTS || 0) + FF_POINTS
                                result.OPP_FF_POINTS = (result.OPP_FF_POINTS || 0) + OPP_POINTS
                                result.TEAM_POINTS = (result.TEAM_POINTS || 0) + FF_TEAM_POINTS
                                result.OPP_TEAM_POINTS = (result.OPP_TEAM_POINTS || 0) + OPP_TEAM_POINTS
                                return result;
                            }, { TEAM_NAME: tm, GAME_RECORDS: fullresults[tm] }))
                        }
                    })

                    return standings;

                })


            });

        }

    }

    return service;
})

determineResult = function (gameRec) {
    var gamePts = gameRec['Team W'] + 0.5 * gameRec['Team T'];
    var oppPts = gameRec['Opp W'] + 0.5 * gameRec['Opp T'];

    if (gamePts > oppPts) return 'W'
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)'])) return 'W';
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] == gameRec['Opp Pts (Starters)']) && (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)'])) return 'W';

    if ((gamePts > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
    return '';
}

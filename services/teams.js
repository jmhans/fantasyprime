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
        getWeekSetup: function () {
            return $http.get('data/weekDetails.json').then(function (resp) {
                //var wkDetails = resp.data.weeks.find(function (lookupWk, idx, arr) {
                //    var d = new Date(lookupWk['Scores Final']);
                //    var curTime = new Date();
                //    var last_d = (idx > 0 ? new Date(arr[idx-1]['Scores Final']) : new Date('1970-01-01'));
                //    return (curTime >= last_d && curTime < d);
                //});

                //$scope.goToWeek(wkDetails.WeekId);
                return resp.data.weeks;
            });
        },
        
        getRosterRecordsForWeek: function (wk, ssn) {
            return $q.all([service.getRosterRecs(), service.getWeekSetup()]).then(function (respArr) {
                var rosterRecords = respArr[0];
                var weekDetails = respArr[1];
                rosterLockTime = new Date(weekDetails.find(function (lookupWk) {return (lookupWk.WeekId == wk);})['Roster Lock Time']);
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
        },
        processWaiverClaims: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_waivers?transform=1').then(function (waiverClaims) {
                return 2;
            })
        },
        getScheduleAndResults: function () {


            return $q.all([TeamsService.getFullSchedule(), ScoresService.getScoreRecords()]).then(function (respArr) {
                var sched = respArr[0];
                var scores = respArr[1].filter(function (rec) {return rec.SEASON == 2017});
                var rosterRecs = respArr[2];

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                weeks = scores.map(function (scr) { return (scr.WEEK); }).filter(onlyUnique);
                rosterLists = [];

                weeks.forEach(function (wk) {
                    rosterLists.push(service.getRosterRecordsForWeek(wk, 2017));
                });

                return $q.all(rosterLists).then(function (respArr) {
                    scores.forEach(function (scoreRec) {
                        scoreRec.PRIME_ROSTER_ENTRY = respArr[scoreRec.WEEK - 1].find(function (rr) { return (scoreRec.TEAM_ID == rr.team_id); });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });

                    sched.forEach(function (gameRec) {
                        var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { prime_owner :  gameRec['Team Name'] }, SEASON: 2017, WEEK: gameRec.Week } );
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
                                var myStr = ( tm == current['Team Name'] ? 'Team' : 'Opp')
                                var oppStr = ( tm == current['Team Name'] ? 'Opp' : 'Team')
                                var FF_POINTS = current[myStr + ' W'] + 0.5 * current[myStr + ' T'];
                                var OPP_POINTS = current[oppStr + ' W'] + 0.5 * current[oppStr + ' T'];
                                var FF_TEAM_POINTS = (myStr == 'Team' ? current['Pts (Starters)'] : current['Opp Pts (Starters)']);
                                var OPP_TEAM_POINTS = (myStr == 'Team' ? current['Opp Pts (Starters)'] : current['Pts (Starters)']);
                                var RESULT = (myStr == 'Team' ? current['Team Result'] : (current['Team Result'] == 'W' ? 'L' : (current['Team Result'] == 'L' ? 'W' : (current['Team Result'] == 'T' ? 'T' : ''))));
                                result.W = (result.W || 0) + (RESULT == 'W' ? 1 : 0)
                                result.L =( result.L || 0) + (RESULT == 'L' ? 1 : 0)
                                result.T = (result.T || 0) + (RESULT == 'T' ? 1 : 0)
                                result.FF_POINTS = (result.FF_POINTS || 0) + FF_POINTS
                                result.OPP_FF_POINTS = (result.OPP_FF_POINTS || 0 ) + OPP_POINTS
                                result.TEAM_POINTS = (result.TEAM_POINTS || 0 ) + FF_TEAM_POINTS
                                result.OPP_TEAM_POINTS = (result.OPP_TEAM_POINTS || 0) + OPP_TEAM_POINTS
                                return result;
                            }, {TEAM_NAME: tm, GAME_RECORDS: fullresults[tm]}))
                        }
                    })

                    return standings;



                })

                
            });

        }


    };

    return service;
}]);



determineResult = function (gameRec) {
    var gamePts = gameRec['Team W'] + 0.5 * gameRec['Team T'];
    var oppPts = gameRec['Opp W'] + 0.5 * gameRec['Opp T'];

    if (gamePts > oppPts) return 'W'
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)'])) return 'W';
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] == gameRec['Opp Pts (Starters)']) && (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)'])) return 'W';

    if ((gamePts > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
    return '';
}

function FantasyFantasyMatchup(gameRec) {
    // Constructor for FFMatchup - calculates result, status, etc. from a game record that contains a list of subgames. 

}
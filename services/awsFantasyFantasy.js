const BASE_AWS_FANTASYPRIME_URL = "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/fantasyprime";

fantasyFantasyModule.service('AWSFantasyService', function ($http, $q, ScoresService, cognitoService, espnAPIService) {
function postToAPI(postData) {
  return cognitoService.authToken.then(function(token) {
      return $http({
        method: 'POST',
        url: BASE_AWS_FANTASYPRIME_URL,
        headers: {
          Authorization: token
        },
        data: JSON.stringify(postData)
      }).then(function(resp) {
        return resp.data.Items;
      });
    });
}

  var FantasyService = {};
  
  FantasyService.teams = [];
  FantasyService.rawRosters = [];
  FantasyService.activeRosters = [];
  FantasyService.enrichedRosters = [];
  
  
  FantasyService.getAllTeams = function(fromServer) {
        
    fromServer = fromServer || true;
    if ((FantasyService.teams.length <= 0) || fromServer) {
      const postData = {
        tableName: "FANTASY_TEAMS",
        requestType: "QUERY",
        record: {}
      };
      return postToAPI(postData).then(function (resp) {
        FantasyService.teams = resp; 
        return FantasyService.teams;
      });      
    } else {
      var prom = new Promise(function (resolve, reject) {
        resolve(FantasyService.teams);
      });
      return prom;
    }
  }
  FantasyService.getFullSchedule = function() {
    return $http.get('data/ffSetup.json', {
      cache: false
    }).then(function(resp) {
      return resp.data.games;
    });
  };
  
  FantasyService.getPrimeTeams = function() {
        return $http.get('data/prime_teams.json', {
          cache: false
        }).then(function(resp) {
          return resp.data.prime_teams;
        });
      };
  
  FantasyService.getGamesforWeek = function(wk) {
    return FantasyService.getFullSchedule().then(function(gmData) {
      return gmData.filter(function(gmRec) {
        return (gmRec.Week == wk);
      });
    })
  };
  
  FantasyService.getTeam = function(id) {
        function teamMatchesParam(team) {
          return team.OWNER_ID === id;
        }

        return FantasyService.getAllTeams(false).then(function(teams) {
          return teams.find(teamMatchesParam)
        });
      }
  FantasyService.getTeamByOwnerName = function () {
            return FantasyService.getAllTeams(false).then(function (resp) {
                return resp.filter(function (PT) { return (PT.TEAM_NAME == ownerName); })
            });
        }
  FantasyService.addTeam = function (ownerName, teamName, season) {

            var record = {
                    LEAGUE_ID: "Fantasy_Prime", 
                    TEAM_OWNER: ownerName,
                    TEAM_NAME: teamName, 
                    SEASON: season
                };
            return FantasyService.addItemToTable("FANTASY_TEAMS", record);

        }
  FantasyService.updateOwner = function (item) {
            return FantasyService.addItemToTable("FANTASY_TEAMS", item)
        }
  FantasyService.addItemToTable = function (tbl, item) {
            var postData = {
                tableName: tbl,
                requestType: "ADD",
                record: item
            }
        return postToAPI(postData);
        }
  FantasyService.getRosterRecs = function (fromServer) {
    fromServer = fromServer || false;
    if (FantasyService.rawRosters.length <= 0 || fromServer) {
            var postData = {
                tableName: "FANTASY_ROSTER_RECORDS",
                requestType: "QUERY",
                record: {}
            }
          return postToAPI(postData);
    } else return new Promise(function(res, rej) {res(FantasyService.rawRosters)});
      
  };
  FantasyService.getActiveRosters = function(fromServer) {
    fromServer = fromServer || false;

    function activeRecForTeam(teamRecs) {
      return teamRecs.sort(function(a, b) {
        if (typeof(a.TIMESTAMP) !== 'undefined') {
          var aDate = new Date(a.TIMESTAMP);
          var bDate = new Date(b.TIMESTAMP);
          if (aDate < bDate)
            return 1;
          if (aDate > bDate)
            return -1;
        }
        return 0;
      })[0];
    }

    if (FantasyService.activeRosters.length <= 0 || fromServer) {
      return FantasyService.getRosterRecs().then(function(rosterRecords) {
        FantasyService.activeRosters = [];
        if (rosterRecords.length <= 0) return new Promise(function(resolve, reject) {
          resolve([]);
        }); // No active rosterRecords existed. Returning empty array immediately.  

        var sortedRosterRecords = rosterRecords.sort(function(a, b) {
          if (a.TEAM_ID < b.TEAM_ID)
            return -1;
          if (a.TEAM_ID > b.TEAM_ID)
            return 1;
          return 0;
        });
        for (i = 0; i < sortedRosterRecords.length; i++) {
          var teamRecords = rosterRecords.filter(function(rec) {
            return (rec.TEAM_ID == sortedRosterRecords[i].TEAM_ID);
          });

          FantasyService.activeRosters.push(activeRecForTeam(teamRecords));
          i += teamRecords.length - 1;
        }

        return $q.all([FantasyService.getAllTeams(false), FantasyService.getPrimeTeamInfo()]).then(function(respArr) {
          const OwnersArr = respArr[0];
          const TeamInfoArr = respArr[1];
          FantasyService.activeRosters.forEach(function(activeRosterRec) {
            activeRosterRec.OWNER = OwnersArr.find(function(owner) {
              return (owner.TEAM_NAME == activeRosterRec.PRIME_OWNER);
            })
            activeRosterRec.TEAM_INFO = TeamInfoArr.find(function(ti) {
              return (activeRosterRec.TEAM_ID == ti.LEAGUE_ID + '_' + ti.TEAM_ID);
            })
          });
          return FantasyService.activeRosters;
        });

      });
    } else return new Promise(function (res, rej) {
      res(FantasyService.activeRosters)
    })

  };
  FantasyService.getWeekSetup = function () {
            return $http.get('data/weekDetails.json').then(function (resp) {
                return resp.data.weeks;
            });
        };
  FantasyService.getWeek = function (weekNum) {
          //allWeeks = service.getWeekSetup();

          return FantasyService.getWeekSetup().then(function(allWeeks) {
            if (weekNum === '') {
              lookupDate = new Date();
              allWeeks.sort(function (a, b) {
                  return (a['WeekId'] < b['WeekId'] ? -1 : 1);
              });
              retVal = 0;
              for (i = 0; i < allWeeks.length ; i++) {
                  if (lookupDate >= new Date(allWeeks[i]['Scores Final'])) {
                      retVal = i + 1;
                  }
              }
              return allWeeks[Math.min(retVal, allWeeks.length-1)];
          } else {
              return allWeeks.find(function (wk) { return (wk.WeekId == weekNum) });
          } 
          });
        
          
      };
  FantasyService.getRosterRecordsForWeek= function (wk, ssn) {
            return $q.all([FantasyService.getRosterRecs(), FantasyService.getWeekSetup()]).then(function (respArr) {
                var rosterRecords = respArr[0];
                var weekDetails = respArr[1];
                const rosterLockTime = new Date(weekDetails.find(function (lookupWk) { return (lookupWk.WeekId == wk); })['Roster Lock Time']);
                var filteredRosterRecords = rosterRecords.filter(function (rr) {
                    return (new Date(rr.TIMESTAMP) <= rosterLockTime);
                });

                filteredRosterRecords = filteredRosterRecords.filter(function (rr, idx, arr) {
                    var teamRecArray = arr.filter(function (tmpRR) { return (rr.TEAM_ID == tmpRR.TEAM_ID) });

                    if (teamRecArray.length > 1) {
                        var maxStart = teamRecArray.reduce(function (a, b) { return new Date(a.TIMESTAMP) > new Date(b.TIMESTAMP) ? a : b; });
                        return (rr == maxStart)
                    } else {

                        return true;
                    }


                });

                return filteredRosterRecords;

            });
        };
  
  FantasyService.getOwnerRoster = function (owner) {
            function rosterRecMatchesParam(rosterRec) {
                return rosterRec.PRIME_OWNER === owner;
            }

            return FantasyService.getActiveRosters().then(function (rosterRecords) {
                return FantasyService.getPrimeTeamInfo().then(function (teamRecords) {
                    var filteredRosterRecords = rosterRecords.filter(rosterRecMatchesParam)
                    filteredRosterRecords.forEach(function (rosterRec) {
                        rosterRec.TEAM_INFO = teamRecords.find(function (teamRec) {
                            return (rosterRec.TEAM_ID == teamRec.LEAGUE_ID + '_' + teamRec.TEAM_ID);
                        });
                    });
                    return filteredRosterRecords;
                })

            });
        }
  FantasyService.getPrimeTeamInfo = function () {
      return FantasyService.getPrimeTeams().then(function (teams) {
        var scoreboards = [];
        teams.forEach(function(tm) {
          tm.TEAM_INFO = FantasyService.getUpdatedTeamInfo(tm.LEAGUE_ID, tm.TEAM_ID);
        });
        
        return teams;
        
      });

  };
  FantasyService.scoreboards = [];
  
  FantasyService.getScoreboard = function(league_id) {
    return new Promise(function (resolve, reject) {
      var sbMatch = FantasyService.scoreboards.find(function (sb) { return (sb.metadata.league_id == league_id);})
      if (typeof(sbMatch) != 'undefined') { //Contains the scoreboard with the league_id
          resolve(sbMatch);
      } else {
        //return a promise that will resolve when the scoreboard does exist. 
        espnAPIService.getScoreboard(league_id, CURRENT_SEASON).then(function (sb) {
          FantasyService.scoreboards.push(sb);
          resolve(sb);
        });
      }
    });
  };
      
  FantasyService.getUpdatedTeamInfo  = function (lg_id, team_id) {
    return FantasyService.getScoreboard(lg_id).then(function (scoreboard) {
      const matchupMatch = scoreboard.scoreboard.matchups.find(function (matchup) {
        for (t=0; t<matchup.teams.length; t++) {
          if (matchup.teams[t].teamId == team_id) {
            return true;
          }
        }
      });
      var tm = {};
      tm.TEAM_SCORE = matchupMatch.teams.find(function(matchup_team) {return (matchup_team.teamId == team_id);});
      tm.OPPONENT_SCORE = matchupMatch.teams.find(function(matchup_team) {return (matchup_team.teamId != team_id);});
      return tm;
    })
  };
  
  
  FantasyService.getRosterRecord =  function (teamId) {
            return FantasyService.getActiveRosters().then(function (rrs) {
                return rrs.find(function (rr) { return (rr.TEAM_ID == teamId); })
            })
        };
  FantasyService.updateRosterRecord = function (updateRecord) {
            var expireRecord = FantasyService.getRosterRecord(updateRecord.TEAM_ID);
            expireRecord.END_DATE = new Date();
            var expirePost = {
                tableName: "FANTASY_ROSTER_RECORDS", 
                requestType: "ADD", 
                record: expireRecord
            }
            var createPost = {
                tableName: "FANTASY_ROSTER_RECORDS", 
                requestType: "ADD", 
                record: {
                    LEAGUE_ID: expireRecord.LEAGUE_ID,
                    SEASON: expireRecord.END_DATE.getFullYear(),
                    TEAM_ID: updateRecord.TEAM_ID,
                    TIMESTAMP: new Date(),
                    POSITION: updateRecord.POSITION,
                    PRIME_OWNER: updateRecord.PRIME_OWNER,
                }
            };
            return postToAPI(expirePost).then(postToAPI(createPost));
        };
  
  FantasyService.getScoresForWeek= function (week, ssn) {
            return ScoresService.getScoreRecordsForWeek(week, ssn).then(function (resp) {
                var scoreRecs = resp;
                return FantasyService.getActiveRosters().then(function (rosterRecs) {
                    //                    outputArr = [];
                    scoreRecs.forEach(function (scoreRec) {
                        // scoreRec.HOME_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        // scoreRec.AWAY_OWNER = rosterRecs.find(function (rosterRec) { return (rosterRec.team_id == scoreRec.TEAM_ID); }).OWNER;
                        scoreRec.PRIME_ROSTER_ENTRY = rosterRecs.find(function (rosterRec) { return (rosterRec.TEAM_ID == scoreRec.TEAM_ID) });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });
                    return scoreRecs;
                });

            })
        };
  FantasyService.getEnrichedRosters = function () {
            return FantasyService.getActiveRosters().then(function (activeRosters) {
                return FantasyService.getPrimeTeamInfo().then(function (teamInfo) {
                    activeRosters.forEach(function (ar) {
                        ar.TEAM_INFO = teamInfo.find(function (info_rec) {
                            return (info_rec.LEAGUE_ID + '_' + info_rec.TEAM_ID == ar.TEAM_ID);
                        })
                    });
                    return activeRosters;
                });
            });
        };
  FantasyService.submitWaiverClaim = function (addTm, dropTm) {
            const newRec = {
                REQUESTER_ID: dropTm.PRIME_OWNER,
                ADD_TEAM_ID: addTm.TEAM_ID,
                DROP_TEAM_ID: dropTm.TEAM_ID,
                TIMESTAMP: new Date()
            };

            return FantasyService.addItemToTable('FantasyPrime_Waivers', newRec).then(function (resp) {
                return resp;
            });
        };
  FantasyService.getScheduleAndResults = function () {
            return $q.all([FantasyService.getFullSchedule(), ScoresService.getScoreRecords()]).then(function (respArr) {
                var sched = respArr[0];
                var scores = respArr[1].filter(function (rec) { return rec.SEASON == CURRENT_SEASON });
                var rosterRecs = respArr[2];

                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }

                const weeks = scores.map(function (scr) { return (scr.WEEK); }).filter(onlyUnique);
                var rosterLists = [];

                weeks.forEach(function (wk) {
                    rosterLists.push(FantasyService.getRosterRecordsForWeek(wk, CURRENT_SEASON));
                });

                return $q.all(rosterLists).then(function (respArr) {
                    scores.forEach(function (scoreRec) {
                        scoreRec.PRIME_ROSTER_ENTRY = respArr[scoreRec.WEEK - 1].find(function (rr) { return (scoreRec.TEAM_ID == rr.TEAM_ID); });
                        scoreRec.RESULT = (scoreRec.POINTS_FOR > scoreRec.POINTS_AGAINST ? 'W' : (scoreRec.POINTS_FOR < scoreRec.POINTS_AGAINST ? 'L' : 'T'));

                    });

                    sched.forEach(function (gameRec) {
                        var scoresForTeam = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { PRIME_OWENR: gameRec['Team Name'] }, SEASON: 2017, WEEK: gameRec.Week });
                        var scoresForOpp = scores.filterWithCriteria({ PRIME_ROSTER_ENTRY: { PRIME_OWNER: gameRec['Opp Name'] }, SEASON: 2017, WEEK: gameRec.Week });

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
        };  
  
    return FantasyService;
})

function determineResult (gameRec) {
    var gamePts = gameRec['Team W'] + 0.5 * gameRec['Team T'];
    var oppPts = gameRec['Opp W'] + 0.5 * gameRec['Opp T'];

    if (gamePts > oppPts) return 'W'
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] > gameRec['Opp Pts (Starters)'])) return 'W';
    if ((gamePts == oppPts) && (gameRec['Pts (Starters)'] == gameRec['Opp Pts (Starters)']) && (gameRec['Pts (Bench)'] > gameRec['Opp Pts (Bench)'])) return 'W';

    if ((gamePts > 0) || (gameRec['Pts (Starters)'] > 0) || (gameRec['Pts (Bench)'] > 0)) return 'L';
    return '';
}


actuarialGamesModule.service('mlbDataService', function ($http, $q) {
    const BASE_URL = "http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1"
    var service = {
        getDailyStats: function (gm_date) {
            var inputDate = new Date(gm_date)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get('data/' + year + month + day + '.json', { cache: false }).then(function (resp) {
                return resp.data.games;
            }, 
            // failure function 
            function () {
                return false;
            });
        },
        getGamesForDate: function (gm_date) {
            var inputDate = new Date(gm_date)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get(BASE_URL + "/schedule/?sportId=1&date=" + month + "%2F" + day +  "%2F" + year).then(function (resp) {
                var dateObj = resp.data.dates.find(function (dateObj) { return (dateObj.date == (year + "-" + month + "-" + day)); });
                return dateObj.games;
            })
        },
        getBoxscoresForGames: function (gamesList) {
            var promArr = [];
            gamesList.forEach(function (gm) {

                var stats = new Promise(function (resolve, reject) {
                    if (gm.status != "Preview") {
                        resolve(service.getGameBoxscore(gm.gamePk));
                    } else {
                        resolve([]);
                    }
                })
                stats.then(
                    function (result) {
                        gm.stats = result;
                        //                            $http.post('http://actuarialgames.x10host.com/site3/server/save_stats.php', {'json': gm });
                    },
                    function (reason) {
                        console.log(reason);
                    });
                promArr.push(stats);
                    
            });
            return $q.all(promArr).then(function () {
               
                return gamesList;


            });
        },
        getGameBoxscore: function (gamePk) {
            return $http.get(BASE_URL+ "/game/" + gamePk + "/boxscore").then(function (resp) {
                return resp.data; //service.saveGameStats(resp);
            })
        },
        ParseBoxscoreForStats: function(bs) {
            bs.teams = []
        },
        saveGameStats: function (gmData) {
            var d =  new Date(gmData.gameDate);
            var flname = d.getFullYear().toString() + ("0" + (d.getMonth() + 1)).slice(-2) + ("0" + (d.getDate())).slice(-2); //d.toISOString().substring(0, 10).replace(/-/g, "");
            // var clean_data = pruneEmpty(gmData);
            return $http.post('server/save_stats.php/' + flname, JSON.stringify({
                'gamePk': gmData.gamePk, 'players': getAllPlayers(gmData)
            })).then(function (resp) {
                return resp;
            });
        },
        getSchedule: function (startDate, endDate, teamsArr) {
            teamsString = (teamsArr.length > 0) ? '&teamId=' + encodeURIComponent(teamsArr) : '';

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate='+ encodeURIComponent(startDate.slashFormat()) + '&endDate='+encodeURIComponent(endDate.slashFormat())+'&gameType=R' + teamsString).then(function (resp) {
                var fullResp = resp.data;

                var promArray = [];
                
                createSummaryTmRec = function (fullRec) {
                    
                    Object.keys(fullRec.teams).forEach(function (tmKey) {
                        fullRec.teams[tmKey].leagueRecord = fullRec.teams[tmKey].team.record.leagueRecord;
                        fullRec.teams[tmKey].score = fullRec.teams[tmKey].teamStats.batting.runs;
                        fullRec.teams[tmKey].isWinner = (fullRec.teams[tmKey].teamStats.batting.runs > fullRec.teams[tmKey].teamStats.pitching.runs);
                    });

                    return fullRec;
                };
                
                for (i = 0; i < fullResp.dates.length; i++) {
                    fullResp.dates[i].games.forEach(function (gm) {
                        var promise;
                        if (gm.status.statusCode == 'F') {
                            if (gm.isTie) {

                                if (teamsArr.includes(gm.teams.away.team.id) || teamsArr.includes(gm.teams.home.team.id)) { 

                                // Potential error. Look up full game result.
                                promise = new Promise(function(resolve, reject) {
                                    $http.get(BASE_URL+ '/game/' + gm.gamePk + '/boxscore').then(function (resp) {
                                        gm_boxscore = resp.data;
                                        gm.isTie = false;
                                        resolve({respType: "full", boxscore: createSummaryTmRec(gm_boxscore), game: gm });
                                    });

                                });

                                promArray.push(promise);
                                }
                            } else {
                                promise = new Promise(function(resolve, reject) {
                                    resolve({ respType: "summary", boxscore: gm, game: gm });
                                });
                                promArray.push(promise);

                            }
                        }
                    })
                }

                return $q.all(promArray).then(function (resArray) {
                    var results = [];
                    

                    addGameToRec = function (tmGameRec, gmRec) {
                        tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                        if (!tmRec) {
                            var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                            tmRec = results[idx - 1]
                        };
                        if (!tmRec.hasOwnProperty('games')) { tmRec.games = []; }
                        tmRec.games.push({ gameDate: gmRec.gameDate, gamePk: gmRec.gamePk, isWinner: tmGameRec.isWinner, isTie: gmRec.isTie, teamRec: tmGameRec });

                    };

                    resArray.forEach(function (gm) {
                        if (teamsArr.includes(gm.boxscore.teams.away.team.id)) { addGameToRec(gm.boxscore.teams.away, gm.game); }
                        if (teamsArr.includes(gm.boxscore.teams.home.team.id)) { addGameToRec(gm.boxscore.teams.home, gm.game); }
                    });
                    return results;
                });

            }, function (err) {
                return '';
            })
        },
        getLatestRecords: function () {
            var today = new Date();
            var twoDaysAgo = new Date(today.getTime());
            twoDaysAgo.setDate(today.getDate() - 2);

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate='
                                + encodeURIComponent(twoDaysAgo.slashFormat()) + '&endDate='
                                + encodeURIComponent(today.slashFormat()) + '&gameType=R').then(function (resp) {
                var fullResp = resp.data;
                var results = [];
                for (i = fullResp.dates.length - 1; i >= 0; i--) {
                    fullResp.dates[i].games.forEach(function (gm) {
                        addTeamRec = function (tmGameRec) {
                            tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                            if (!tmRec) {
                                var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                                tmRec = results[idx - 1];
                                tmRec.leagueRecord = tmGameRec.leagueRecord;
                            };
                        }
                        addTeamRec(gm.teams.away);
                        addTeamRec(gm.teams.home);
                    })
                }

                return results;
            }, function (err) {
                return '';
            })
        },
        getStandings: function (dt) {
            dt = dt || new Date();
            var result = [];
            return $http.get(BASE_URL+ '/standings?leagueId=103,104&season=2018&date='
                + encodeURIComponent(dt.slashFormat())).then(function (resp) {
                    resp.data.records.forEach(function (standingsRec) {
                        standingsRec.teamRecords.forEach(function (teamRec) {
                            result.push(teamRec);
                        });
                    });
                    return result;
                });

        },
        getAllBoxscoresForDates: function (startDate, endDate, teamsArr) {
            teamsString = (teamsArr.length > 0) ? '&teamId=' + encodeURIComponent(teamsArr) : '';

            return $http.get(BASE_URL+ '/schedule/?sportId=1&startDate=' + encodeURIComponent(startDate.slashFormat()) + '&endDate=' + encodeURIComponent(endDate.slashFormat()) + '&gameType=R' + teamsString).then(function (resp) {
                var fullResp = resp.data;

                var promArray = [];

                for (i = 0; i < fullResp.dates.length; i++) {
                    fullResp.dates[i].games.forEach(function (gm) {

                        if (gm.status.statusCode == 'F') {
                            if (teamsArr.includes(gm.teams.away.team.id) || teamsArr.includes(gm.teams.home.team.id)) {

                                // Potential error. Look up full game result.
                                var promise = new Promise(function (resolve, reject) {
                                    $http.get(BASE_URL+ '/game/' + gm.gamePk + '/boxscore').then(function (resp) {
                                        gm_boxscore = resp.data;
                                        resolve({ respType: "full", boxscore: gm_boxscore, game: gm });
                                    });

                                });

                                promArray.push(promise);
                            }
                        }
                    })
                }

                return $q.all(promArray).then(function (resArray) {
                    var results = [];


                    addGameToRec = function (tmGameRec, gmRec, oppGameRec) {
                        tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                        if (!tmRec) {
                            var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                            tmRec = results[idx - 1]
                        };
                        if (!tmRec.hasOwnProperty('games')) { tmRec.games = []; }
                        tmRec.games.push({ gameDate: gmRec.gameDate, gamePk: gmRec.gamePk, boxscore: tmGameRec, opponentBoxscore: oppGameRec});

                    };

                    resArray.forEach(function (gm) {
                        if (teamsArr.includes(gm.boxscore.teams.away.team.id)) { addGameToRec(gm.boxscore.teams.away, gm.game, gm.boxscore.teams.home); }
                        if (teamsArr.includes(gm.boxscore.teams.home.team.id)) { addGameToRec(gm.boxscore.teams.home, gm.game, gm.boxscore.teams.away); }
                    });
                    return results;
                });

            }, function (err) {
                return '';
            })
        },
        getPBP: function (gamePk) {
            return $http.get(BASE_URL+ '/game/' + gamePk + '/playByPlay').then(function (resp) {
                return resp.data;
            })

        },
        getAllPBPForTeams: function (teamIds) {

        }
    };

    return service;
})

function getAllPlayers(gmData) {
    players = [];
    do_it = function () {
        for (var key in src_players) {
            if (src_players.hasOwnProperty(key)) {
                plyr = src_players[key];
                newPlayerObj = {
                    'mlbid': plyr.person.id,
                    'name': plyr.person.fullName,
                    'team': src_team.teamCode,
                    'positions': plyr.allPositions,
                    'status': 'status' in plyr ? plyr.status.code : '',
                    'status_description' : 'status' in plyr ? plyr.status.description : '',
                }
                if (plyr.hasOwnProperty("stats")) {
                    batStat = plyr.stats.batting
                    newObj = {
                        'ab': batStat.atBats,
                        'h': batStat.hits,
                        '2b': batStat.doubles,
                        '3b': batStat.triples,
                        'hr': batStat.homeRuns,
                        'r': batStat.runs,
                        'rbi': batStat.rbi,
                        'bb': batStat.baseOnBalls,
                        'hbp': batStat.hitByPitch,
                        'so': batStat.strikeOuts,
                        'sb': batStat.stolenBases,
                        'cs': batStat.caughtStealing,
                        'sac': batStat.sacBunts,
                        'sf': batStat.sacFlies,
                        'e': plyr.stats.fielding.errors,
                        'lob': batStat.leftOnBase,
                    };
                    for (var attrname in newObj) {
                        newPlayerObj[attrname] = newObj[attrname];
                    }
                }
                
                players.push(
                    newPlayerObj
                    );
                //pruneEmpty(src_players[key]));
            }
        }
    }
    src_players = gmData.boxscore.teams.away.players;
    src_team = gmData.boxscore.teams.away.team;
    do_it();
    src_players = gmData.boxscore.teams.home.players;
    src_team = gmData.boxscore.teams.home.team;
    do_it();
    return players;
}


// Array format
// [MLBID, Name, Team, AB, H, 2B, 3B, HR, R, RBI, BB, HBP, SO, SB, CS, Sac, SF, E, LOB, Position(s)]
// pulls from "Boxscore -> [player].stats.batting
// categories are: atBats, hits, doubles, triples, homeRuns, runs, rbi, baseOnBalls, hitByPitch, strikeOuts, stolenBases, caughtStealing, sacBunts, sacFlies, fielding.errors, batting.leftOnBase, allPositions[array]]

function pruneEmpty(obj) {
  return function prune(current) {
    _.forOwn(current, function (value, key) {
      if (_.isUndefined(value) || _.isNull(value) || _.isNaN(value) ||
        (_.isString(value) && _.isEmpty(value)) ||
        (_.isObject(value) && _.isEmpty(prune(value)))) {

        delete current[key];
      }
    });
    // remove any leftover undefined values from the delete 
    // operation on an array
    if (_.isArray(current)) _.pull(current, undefined);

    return current;

  }(_.cloneDeep(obj));  // Do not modify the original object, create a clone instead
}



actuarialGamesModule.service('mlbDataService', function ($http, $q) {
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

            return $http.get("http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/schedule/?sportId=1&date=" + month + "%2F" + day +  "%2F" + year).then(function (resp) {
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
            return $http.get("http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com:80/api/v1/game/" + gamePk + "/boxscore").then(function (resp) {
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
        getSchedule: function (tm, startDate, endDate) {
            return $http.get('http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/schedule/?sportId=1&startDate=03%2F15%2F2018&endDate=05%2F28%2F2018&gameType=R').then(function (resp) {
                var fullResp = resp.data;
                var results = [];
                for (i = 0; i < fullResp.dates.length; i++) {
                    fullResp.dates[i].games.forEach(function (gm) {
                        addGameToRec = function (tmGameRec) {
                            tmRec = results.find(function (res) { return (res.id == tmGameRec.team.id); })
                            if (!tmRec) {
                                var idx = results.push({ id: tmGameRec.team.id, name: tmGameRec.team.name });
                                tmRec = results[idx - 1]
                            };
                            if (!tmRec.hasOwnProperty('games')) { tmRec.games = []; }
                            tmRec.games.push({ gameDate: gm.gameDate, gamePk: gm.gamePk, isWinner: tmGameRec.isWinner });

                        }
                        if (gm.status.statusCode == 'F') {

                            addGameToRec(gm.teams.away);
                            addGameToRec(gm.teams.home);
                        }
                    })
                }

                return results;
            }, function (err) {
                return '';
            })
        },
        getLatestRecords: function () {
            var today = new Date();
            var twoDaysAgo = new Date(today.getTime());
            twoDaysAgo.setDate(today.getDate() - 2);

            return $http.get('http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/schedule/?sportId=1&startDate='
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
            return $http.get('http://statsapi-default-elb-prod-876255662.us-east-1.elb.amazonaws.com/api/v1/standings?leagueId=103,104&season=2018&date='
                + encodeURIComponent(dt.slashFormat())).then(function (resp) {
                    resp.data.records.forEach(function (standingsRec) {
                        standingsRec.teamRecords.forEach(function (teamRec) {
                            result.push(teamRec);
                        });
                    });
                    return result;
                });

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


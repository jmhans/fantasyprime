propBetModule.service('propBetService', function ($http, mlbDataService) {

    var service = {
        
        getBBDataJSON: function () {
            return $http.get("data/baseballdata.json").then(function (resp) {
                return resp.data.data
            });

        },
        getLastUpdateTime: function() {
            return $http.get("data/baseballdata.json").then(function (resp) {
                var jsDate = new Date(resp.data.createTime)
                return jsDate;
            });
        },
        getConfigDataJSON: function () {
            return $http.get("data/configuration.json").then(function (resp) {
                var keys = resp.data.data.shift();
                resp.data.data = resp.data.data.map(function (row) {
                    return keys.reduce(function (obj, key, i) {
                        obj[key] = row[i];
                        return obj;
                    }, {});
                });

                resp.data.data.forEach(function (obj) {
                    obj.SafeTitle = obj.Title.replace(/\s/g, '_');
                });

                return resp.data.data;
            });

        },
        getBetSummaryJSON: function () {
            return $http.get("data/bet.json").then(function (resp) {
                return resp.data.data;
            });

        },
        getBetList: function () {
            return $http.get("data/bets.json").then(function (resp) {
                return resp.data.data;
            })
        },
        getGraphConfig: function () {
            return $http.get("data/betGraphConfig.json").then(function (resp) {
                return resp.data;
            })
        },
        getStoredBetData: function() {
            return $http.get("data/betData.json").then(function (resp) {
                return resp.data;
            })
        },
        getBetDataPromise: function () {
            return service.getBetData().then(function (resp) {
                var outputBetData = resp
                minDateCol = outputBetData[0].indexOf("minGameTime");
                milDateCol = outputBetData[0].indexOf("milGameTime");
                minMaxDate = outputBetData.reduce(function (maxDate, curArrItem) { return Math.max(new Date(curVal[minDateCol]), curTotal) }, new Date('03/29/2018'));
                milMaxDate = outputBetData.reduce(function (maxDate, curArrItem) { return Math.max(new Date(curVal[milDateCol]), curTotal) }, new Date('03/29/2018'));
                s = Math.min(minMaxDate, milMaxDate);
                tms = [142, 158];

                return mlbDataService.getAllBoxscoresForDates(s, new Date(), tms).then(function (resp) {
                    var teams = resp;
                    teams.forEach(function (tm) {
                        tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                    })

                    for (i = 0; i < teams.length; i++) {
                        tm = teams[i];
                        tmOffset = tm.name == ("Minnesota Twins" ? 0 : (tm.name == "Milwaukee Brewers" ? 1 : 0));
                        tmKOInc = tm.name == ("Minnesota Twins" ? 4 : (tm.name == "Milwaukee Brewers" ? -4 : 0));

                        tm.games.forEach(function (gm) {
                            gmNum = gm.boxscore.team.record.gamesPlayed
                            outputBetData[gmNum][0] = teams[1].games[gmNum].boxscore.team.record.wins - teams[1].games[gmNum].boxscore.team.record.wins; // winDiff -- needs to be defined
                            outputBetData[gmNum][1 + tmOffset] = 4; // minLine -- needs to be defined 
                            outputBetData[gmNum][3 + tmOffset] = win(gm.boxscore); // minResult
                            outputBetData[gmNum][5 + tmOffset] = battingAvg(gm.boxscore); // minAvg
                            outputBetData[gmNum][7 + tmOffset] = Pctile(outputBetData.slice(1, gmNum).map(function (arrRow) { return arrRow[5 + tmOffset]; }), 95); // min95Avg 
                            outputBetData[gmNum][9 + tmOffset] = inningsBatted(gm.boxscore); // minInnBat
                            outputBetData[gmNum][11 + tmOffset] = gameTimes(gm.boxscore); // minGameTime
                            outputBetData[gmNum][13 + tmOffset] = gameNums(gm.boxscore); // minGamePk

                        })
                    }

                })

            });


        },
        getBetData: function () {
            
            d = new Date();
            s = new Date('03/29/2018')
            // Minnesota: Team Id = 142
            // Milwaukee: Team Id = 158` 
            tms = [142, 158];
            return mlbDataService.getAllBoxscoresForDates(s, d, tms).then(function (resp) {
                var teams = resp;
                teams.forEach(function (tm) {
                    //if (tm.name == 'Minnesota Twins' || tm.name == "Milwaukee Brewers") {
                    tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                });

                curMinInc = 4;
                curMilInc = -4;
                curMinLine = curMinInc;
                curMilLine = curMilInc;
                var minLine = [];
                var milLine = [];


                var minAvg = createStatCol(teams[0].games, battingAvg);
                var milAvg = createStatCol(teams[1].games, battingAvg);
                var winDiff = createStatCompareColumn(createStatCol(teams[0].games, seasonWins), createStatCol(teams[1].games, seasonWins), function (a, b) { return a - b; }, null);


                //var outputArr = [["gameNum", "winDiff", "minline", "milline", "minResult", "milResult", "minAvg", "milAvg"]];
                for (i = 0; i < Math.max(teams[0].games.length, teams[1].games.length) ; i++) {

                    minLine[i] = curMinLine;
                    milLine[i] = curMilLine;
                    if (winDiff[i]) {
                        if (winDiff[i] >= curMinLine) {
                            curMinLine += curMinInc;
                            curMilLine -= curMilInc;
                        }
                        if (winDiff[i] <= curMilLine) {
                            curMilLine += curMilInc;
                            curMinLine -= curMinInc;
                        }
                    }
                }

                // var a = createStatCol(teams[0].games, win);

                outputArr1 = [['gameNum']];
                function addColToOutputArr(colObj) {
                    newCol = outputArr1[0].length;
                    outputArr1[0][newCol] = colObj.name;
                    for (i = 0; i < colObj.data.length; i++) {
                        if (i + 1 >= outputArr1.length) {
                            var addRow = [i + 1];
                            for (j = 1; j <= newCol; j++) {
                                addRow[j] = null;
                            }
                            outputArr1.push(addRow);
                        }
                        outputArr1[i + 1][newCol] = colObj.data[i];
                    }
                }


                addColToOutputArr({ name: 'winDiff', data: winDiff });
                addColToOutputArr({ name: 'minline', data: minLine});
                addColToOutputArr({ name: 'milline', data: milLine });
                addColToOutputArr({ name: 'minResult', data: createStatCol(teams[0].games, win) });
                addColToOutputArr({ name: 'milResult', data: createStatCol(teams[1].games, win) });
                addColToOutputArr({ name: 'minAvg', data: minAvg });
                addColToOutputArr({ name: 'milAvg', data: milAvg });
                addColToOutputArr({ name: 'min95Avg', data: createRunningTotalCol(minAvg, avg95Pctile) });
                addColToOutputArr({ name: 'mil95Avg', data: createRunningTotalCol(milAvg, avg95Pctile) });
                addColToOutputArr({ name: 'minInnBat', data: createRunningTotalCol( createStatCol(teams[0].games, inningsBatted), runningSum ) });
                addColToOutputArr({ name: 'milInnBat', data: createRunningTotalCol(createStatCol(teams[1].games, inningsBatted), runningSum) });
                addColToOutputArr({ name: 'minGameTime', data: createStatCol(teams[0].games, gameTimes) });
                addColToOutputArr({ name: 'milGameTime', data: createStatCol(teams[1].games, gameTimes) });
                addColToOutputArr({ name: 'minGamePk', data: createStatCol(teams[0].games, gameNums) });
                addColToOutputArr({ name: 'milGamePk', data: createStatCol(teams[1].games, gameNums) });
                

                return outputArr1;

            });
        }//,
        //saveBetData: function (flname, dataObj) {
        //    return $http.post('server/save_json.php/' + flname, JSON.stringify({
        //        dataObj
        //    })).then(function (resp) {
        //        return resp;
        //    });
        //}
    };

    return service;
})

function createStatCol(boxscores, statFunction) {
    var statCol = [];

    for (i = 0; i < boxscores.length ; i++) {
        statCol[i] = statFunction(boxscores[i]);
    }

    return statCol;
}

function createStatCompareColumn(tm1StatCol, tm2StatCol, compareFunction, defaultVal) {
    var statCol = [];
    defaultVal = null; // defaultVal ? defaultVal : '';

    for (i = 0; i < Math.max(tm1StatCol.length, tm2StatCol.length) ; i++) {
        if (i < tm1StatCol.length && i < tm2StatCol.length) {
            statCol[i] = compareFunction(tm1StatCol[i], tm2StatCol[i]);
        } else 
        {
            statCol[i] = defaultVal;
        }
    }
    return statCol;
} 

function createRunningTotalCol(inputStatCol, runningTotalFunction) {
    return inputStatCol.map(runningTotalFunction);
}

function win(bs) {
    return bs.boxscore.teamStats.batting.runs > bs.boxscore.teamStats.pitching.runs ? 1 : -1;
}
function seasonWins(bs) {
    return bs.boxscore.team.record.leagueRecord.wins;
}
function avg95Pctile(curVal, index, arr) {
    var truncArr = arr.slice(0, index).sort();
    var len = truncArr.length;
    var per95 = Math.floor(len * .95)-1
    return (truncArr[per95]);
}
function battingAvg(bs) {
    return (bs.boxscore.teamStats.batting.hits / bs.boxscore.teamStats.batting.atBats)
}

function runningSum(curVal, index, arr) {
    var add = function (a, b) {
        return a + b
    }
    if (index > 0) {
        return arr.slice(0, index).reduce(add);
    } else {
        return curVal;
    };

}

function inningsBatted(bs) {
    return Math.ceil(parseFloat((bs.opponentBoxscore.teamStats.pitching.inningsPitched)))-9.0;
}

function gameTimes(bs) {
    return bs.gameDate;
}
function gameNums(bs) {
    return bs.gamePk;
}

function Pctile(arr, pct) {
    var len = arr.length;
    var pctile = Math.floor(len * .95) - 1;
    return arr[pctile];
}
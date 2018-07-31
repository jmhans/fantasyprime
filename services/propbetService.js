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
            return service.getStoredBetData().then(function (resp) {
                var outputBetData = resp
                minDateCol = outputBetData[0].indexOf("minGameTime");
                milDateCol = outputBetData[0].indexOf("milGameTime");
                minMaxDate = outputBetData.slice(1).reduce(function (maxDate, curArrItem) { return Math.max(new Date(curArrItem[minDateCol] || maxDate), maxDate) }, new Date('03/29/2018'));
                milMaxDate = outputBetData.slice(1).reduce(function (maxDate, curArrItem) { return Math.max(new Date(curArrItem[milDateCol] || maxDate), maxDate) }, new Date('03/29/2018'));
                s = Math.min(minMaxDate, milMaxDate);
                tms = [142, 158];
                

                return mlbDataService.getAllBoxscoresForDates(new Date(s), new Date(), tms).then(function (resp) {
                    function updateKOData(origOutput) {
                        minInc = 4; milInc = -4;
                        curMin = minInc; curMil = milInc;
                        for (i = 1; i < origOutput.length; i++) {
                            if (origOutput[i][16] && origOutput[i][17]) {
                                origOutput[i][1] = origOutput[i][16] - origOutput[i][17];
                                origOutput[i][2] = curMin; origOutput[i][3] = curMil;
                                if (origOutput[i][1] >= curMin) {
                                    curMin += minInc; curMil = curMin + milInc;
                                };
                                if (origOutput[i][1] <= curMil) {
                                    curMin = curMil + minInc; curMil += milInc;
                                }

                            }
                        };
                        return origOutput
                    }

                    var teams = resp;
                    teams.forEach(function (tm) {
                        tm.games.sort(function (a, b) { return (new Date(a.gameDate) - new Date(b.gameDate)); });
                    })

                    function getColNum(titleString) { return outputBetData[0].indexOf(titleString);}


                    priorMinGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minGamePk")] }).length;
                    priorMilGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("milGamePk")] }).length;;
                    maxMinGames = teams[0].games.length + priorMinGames;
                    maxMilGames = teams[1].games.length + priorMilGames;

                    for (i = 0; i < teams.length; i++) {
                        tm = teams[i];
                        tmOffset = (tm.name == "Minnesota Twins") ? 0 : (tm.name == "Milwaukee Brewers") ? 1 : 0;
                        tmKOInc = (tm.name == "Minnesota Twins") ? { tmKO: 4, oppKO: -4 } : (tm.name == "Milwaukee Brewers") ? { tmKO: -4, oppKO: 4 } : { tmKO: 0, oppKO: 0 };
                        tmPriorGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minWins") + tmOffset] }).length;
                        oppPriorGames = outputBetData.slice(1).filter(function (curItem) { return curItem[getColNum("minWins") + 1 - tmOffset] }).length;

                        tm.games.forEach(function (gm) {

                            gmNum = gm.boxscore.team.record.gamesPlayed
                            // outputBetData[gmNum][0] = teams[0].games[gmNum - priorMinGames].boxscore.team.record.wins - teams[1].games[gmNum - priorMilGames].boxscore.team.record.wins; // winDiff -- needs to be error-proofed
                            if (!outputBetData[gmNum]) {
                                newRow = [];
                                for (col = 1; col < outputBetData[0].length; col++) {
                                    newRow[col] = null;
                                }
                                newRow[0] = gmNum;
                                outputBetData[gmNum] = newRow;
                            };
                            outputBetData[gmNum][getColNum("minResult") + tmOffset] = win(gm); // minResult
                            outputBetData[gmNum][getColNum("minAvg") + tmOffset] = battingAvg(gm); // minAvg
                            //outputBetData[gmNum][getColNum("min95Avg") + tmOffset] = 
                            outputBetData[gmNum][getColNum("minInnBat") + tmOffset] = inningsBatted(gm);
                            outputBetData[gmNum][getColNum("minGameTime") + tmOffset] = gameTimes(gm); // minGameTime
                            outputBetData[gmNum][getColNum("minGamePk") + tmOffset] = gameNums(gm); // minGamePk
                            outputBetData[gmNum][getColNum("minWins") + tmOffset] = gm.boxscore.team.record.wins;
                            
                        });

                        // Loop through and populate agg functions now that all raw stat values are included.  
                        for (gmLoopCtr = Math.min(priorMinGames, priorMilGames) ; gmLoopCtr < gmNum; gmLoopCtr++) {
                            outputBetData[gmLoopCtr][getColNum("min95Avg") + tmOffset] = Pctile(outputBetData.filter(function (itm) { return (itm[0] <= gmLoopCtr); }).map(function (arrRow) { return arrRow[getColNum("minAvg") + tmOffset]; }), 95); // min95Avg
                            // outputBetData[gmLoopCtr][getColNum("minInnBat") + tmOffset] += outputBetData[gmLoopCtr - 1][getColNum("minInnBat") + tmOffset]; // minInnBat -- needs to be running sum
                            outputBetData[gmLoopCtr][getColNum("minInnBatCumulative") + tmOffset] = outputBetData.filter(function (itm) { return (itm[0] <= gmLoopCtr); }).map(function (arrRow) { return arrRow[getColNum("minInnBat") + tmOffset]; }).reduce(function (a, b) { return (a + b); });
                        };
                    };

                    return updateKOData(outputBetData);
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
    arr.sort();
    var lower = Math.floor((len-1) * pct / 100);
    var upper = Math.ceil((len-1) * pct / 100);

    if (lower != upper) {
        var interPct = (pct / 100 * (len - 1) - Math.floor(pct / 100 * (len - 1))) / (Math.ceil(pct / 100 * (len - 1)) - Math.floor(pct / 100 * (len - 1)));
    } else {
        var interPct = 1;
    }

    

    return arr[upper] * interPct + arr[lower] * (1 - interPct);
}
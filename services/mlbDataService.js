
actuarialGamesModule.service('mlbDataService', function ($http, $q) {
    var service = {
        getGames: function (dt) {
            var inputDate = new Date(dt)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get("http://gd2.mlb.com/components/game/mlb/year_" + year + "/month_" + month + "/day_" + day + "/miniscoreboard.json").then(function (resp) {

                var gameData = resp.data.data.games.game;

                return gameData;
            }, 
            function (reason) {
                console.log(reason);
            }
            );
        },
        appendStatstoGames: function (dt) {
            d = new Date(dt);
            gameDate = d.toISOString().substring(0, 10).replace(/-/g, "");
            var games = service.getGames(dt).then(function (gamesList) {
                var promArr = []                
                gamesList.forEach(function (gm) {

                    var stats = new Promise(function (resolve, reject) {
                        if (gm.status != "Preview") {
                            resolve(service.getBatterStats(gm.game_data_directory));
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
                    $http.post('http://actuarialgames.x10host.com/site3/server/save_stats.php', JSON.stringify({ filename: gameDate, games: gamesList }));
                    return gamesList;


                });
            });
             //
            // $http.get('http://actuarialgames.x10host.com/site3/server/save_stats.php'); //
            
            return games;
        },
        getBatterStats: function (gm_directory) {
            var req = $http.get("http://gd2.mlb.com" + gm_directory + "/boxscore.json");
            return req.then(function (resp) {
                var homeBatters = resp.data.data.boxscore.batting[0].batter;
                var awayBatters = resp.data.data.boxscore.batting[1].batter;
                var stats = [];
                var addBatter = function (bt) {
                    stats.push(bt);
                };

                homeBatters.forEach(addBatter);
                awayBatters.forEach(addBatter);
                return stats;
            },
                        function (reason) {
                            console.log(reason);
                        });
        },
        getDailyStats: function (gm_date) {
            var inputDate = new Date(gm_date)
            var day = pad(inputDate.getDate(), 2);
            var month = pad(inputDate.getMonth() + 1, 2);
            var year = inputDate.getFullYear();

            return $http.get('data/' + year + month + day + '.json', { cache: false }).then(function (resp) {
                return resp.data[0].games;
            }, 
            // failure function 
            function () {
                return 'no data for ' + gm_date;
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
                return resp.data;
            })
        },
        saveGameStats: function (gmData) {
            var d =  new Date(gmData.gameDate);
            var flname = d.toISOString().substring(0, 10).replace(/-/g, "");
            return $http.post('http://actuarialgames.x10host.com/site3/server/save_stats.php', JSON.stringify({ filename: flname, games: [gmData] })).then(function (resp) {
                return resp;
            });
        }
        
    };

    return service;
})




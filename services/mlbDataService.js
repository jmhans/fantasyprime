
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
                        function (result) { gm.stats = result;}, 
                        function (reason) {
                            console.log(reason);
                        });
                    promArr.push(stats);
                    
                });

                return $q.all(promArr).then(function () {
                    return gamesList;
                });

            });
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
        }
        
    };

    return service;
})




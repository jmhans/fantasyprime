
fantasyGolfModule.service('golfService', function ($http) {
    var service = {
        getLeaderboard: function () {
            return tournNum = service.getTournamentNum().then(function (resp) {
                return  $http.get('http://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard/players?event=' + resp + '&lang=en&region=us').then(function (resp) {
                    return resp.data.leaderboard;
                });
            });
        },
        getPicks: function () {
            return service.getTournamentNum().then(function (resp) {
                return $http.get("data/golf.json").then(function (resp) {
                    return resp.data.Players;
                });
            });
        },
        getTournamentNum: function () {
            var prom = new Promise(function (resolve, reject) {
                resolve('2697');
            });
            /*var newprom = $http.get('http://www.espn.com/golf/leaderboard').then(function(resp) {
                const regex = /espn\.leaderboard\.tournamentId = (.*);/g;
                const str = resp.data;
                let m;

                while ((m = regex.exec(str)) !== null) {
                    // This is necessary to avoid infinite loops with zero-width matches
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
    
                    return m[1];

                }
            });*/

            return prom;
        }
    };

    return service;
})




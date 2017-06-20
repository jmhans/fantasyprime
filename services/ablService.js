
angular.module('fantasyfantasy').service('ablService', function ($http) {
    var service = {
        getPlayers: function (effDate) {
            var qry = 'SELECT * from stats'; // Need to write appropriate query for stat display. And include JOIN into abl_lineups.
            var dataObj =  {functionname: 'db_select', effDate: effDate, teamName: 'Machines'};
            return $http({
                url: 'http://actuarialgames.x10host.com/includes/abl_db.php',
                dataType: 'json',
                method: 'POST',
                data: dataObj,
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function (resp) {
                    return resp.data.result.players;
            });
        },

        getDougStats: function () {
            return $http.get("data/20170619.csv").then(function (resp) {
                return resp.data
            });
        }
        
    };

    return service;
})
﻿
angular.module('fantasyfantasy').service('ablService', function ($http) {
    var service = {
        getPlayers: function () {
            var qry = 'SELECT * from stats'; // Need to write appropriate query for stat display. And include JOIN into abl_lineups.
            var dataObj =  {functionname: 'db_select', effDate: "2016-05-01", teamName: 'Machines'};
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
        }
        
    };

    return service;
})
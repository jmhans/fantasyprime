
angular.module('fantasyfantasy').service('propBetService', function ($http) {
    var service = {
        
        getBBDataJSON: function () {
            return $http.get("data/baseballdata.json").then(function (resp) {
                return resp.data
            });

        },
        getConfigDataJSON: function () {
            return $http.get("data/configuration.json").then(function (resp) {
                var keys = resp.data.shift();
                resp.data = resp.data.map(function (row) {
                    return keys.reduce(function (obj, key, i) {
                        obj[key] = row[i];
                        return obj;
                    }, {});
                });

                resp.data.forEach(function (obj) {
                    obj.SafeTitle = obj.Title.replace(/\s/g, '_');
                });

                return resp.data;
            });

        },
        getBetSummaryJSON: function () {
            return $http.get("data/bet.json").then(function (resp) {
                return resp.data;
            });

        }
    };

    return service;
})
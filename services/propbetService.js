
angular.module('fantasyfantasy').service('propBetService', function ($http) {
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

        }
    };

    return service;
})
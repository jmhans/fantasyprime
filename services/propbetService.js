
angular.module('fantasyfantasy').service('propBetService', function ($http) {
    var service = {
        
        getBBData: function () {
            var prom = new Promise(function (resolve, reject) {
                
                return Papa.parse('data/baseballdata.csv?q="+Math.random()', {
                    download: true,
                    delimiter: ",",
                    dynamicTyping: true,
                    header: false,
                    skipEmptyLines: true,
                    complete: function (results, file) {
                        resolve( results.data);
                    }
                });

            });
            return prom;

        },
        getBBDataJSON: function () {
            return $http.get("data/baseballdata.json").then(function (resp) {
                /*var keys = resp.data.shift();
                resp.data = resp.data.map(function (row) {
                    return keys.reduce(function (obj, key, i) {
                        obj[key] = row[i];
                        return obj;
                    }, {});
                });*/
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

                return resp.data;
            });

        },
        getConfigData: function () {
            var prom = new Promise(function (resolve, reject) {
                return Papa.parse('data/Configuration.csv?q="+Math.random()', {
                    download: true,
                    delimiter: ",",
                    dynamicTyping: true,
                    header: true,
                    skipEmptyLines: true,
                    complete: function (results, file) {
                        resolve(results.data);
                    }
                });
            });
            return prom;
        }
    };

    return service;
})
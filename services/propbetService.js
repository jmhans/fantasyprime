
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
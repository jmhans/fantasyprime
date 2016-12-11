angular.module('fantasyfantasy').service('StandingsService', ['GoogleSheetsService', function (GoogleSheetsService) {

    var service = {
        getStandings: function () {
            
            return GoogleSheetsService.getData().then(function (data) {
                return data.Standings;
            }, function (err) {
                console.log('Failed: ' + err);
            });
            //return Promise.resolve([1, 2, 3, 4, 5, 6]);

        }
    }

    return service;
}])

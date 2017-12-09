
fantasyFantasyModule.service('FantasyFantasyService', function ($http) {
    var service = {
        getConfig: function () {
            return $http.get('data/ffconfig.json', { cache: true }).then(function (resp) {
                return resp.data;
            });
        },
        getWeekDetails: function (week) {
            return $http.get('data/weekDetails.json', { cache: true }).then(function (resp) {
                return resp.data.weeks.find(function (wk) {return wk.WeekId == week});
            });
        },
        getWeek: function (weekNum) {
            return $http.get('data/weekDetails.json', {cache: true}).then(function (resp) {
                allWeeks = resp.data.weeks;
                
                if (weekNum == '') {
                    lookupDate = new Date();
                    allWeeks.sort(function (a, b) {
                        return (a['WeekId'] < b['WeekId'] ? -1 : 1);
                    });
                    retVal = 0;
                    for (i = 0; i < allWeeks.length ; i++) {
                        if (lookupDate >= new Date(allWeeks[i]['Scores Final'])) {
                            retVal = i + 1;
                        }
                    }
                    return allWeeks[Math.min(retVal, allWeeks.length-1)];
                } else {
                    return allWeeks.find(function (wk) { return (wk.WeekId == weekNum) });
                } 
            })
    }
    }

    return service;
})
﻿fantasyFantasyModule.service('ScoresService', function ($http) {
    var service = {
        getScoreRecords: function () {
            return $http.get('data/ResultsStore.json', { cache: false }).then(function (resp) {
                var outputArr = [];
                resp.data.data.forEach(function (gm) {
                    outputArr.push({
                        TEAM_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
                        OPPONENT_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
                        SEASON: gm.Season,
                        WEEK: gm.Week,
                        POINTS_FOR: gm['Home Score'],
                        POINTS_AGAINST: gm['Away Score'],
                        PROJ_POINTS_FOR: gm['HomeProj'],
                        PROJ_POINTS_AGAINST: gm['AwayProj'],
                        UPDATE_TIME: gm['Updated']
                    });
                    outputArr.push({
                        TEAM_ID: gm.LeagueID + '_' + gm['AwayTeam ID'],
                        OPPONENT_ID: gm.LeagueID + '_' + gm['HomeTeam ID'],
                        SEASON: gm.Season,
                        WEEK: gm.Week,
                        POINTS_FOR: gm['Away Score'],
                        POINTS_AGAINST: gm['Home Score'],
                        PROJ_POINTS_FOR: gm['AwayProj'],
                        PROJ_POINTS_AGAINST: gm['HomeProj'],
                        UPDATE_TIME: gm['Updated']
                    });

                });
                return outputArr;
            });
        },
        getScoreRecordsForWeek: function (wk, ssn) {
            var d = new Date();
            ssn = ssn || d.getFullYear()
            return service.getScoreRecords().filter(function (sr) { return (sr.Week == wk && sr.Season == ssn); });
        }

    }

    return service;
});
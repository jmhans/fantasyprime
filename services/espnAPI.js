const BASE_ESPN_URL = "http://games.espn.com/ffl/api/v2"

fantasyFantasyModule.service('espnAPIService', function ($http) {
  service = {}; 
  
  service.getScoreboard = function(lgId,seasonId, wkId) {
    var wkIdStr = ''
    if (typeof(wkId) != 'undefined') { wkIdStr = "&scoringPeriodId=" + wkId; }
    
    return $http.get(BASE_ESPN_URL + "/scoreboard?leagueId=" + lgId + "&seasonId=" + seasonId + wkIdStr, { cache: false }).then(function (resp) {
                return resp.data;
            }, 
            // failure function 
            function () {
                return false;
            });
  };
  service.getAllScores = function () {
    
  };
  
  return service;
});
const NFL_URL = "http://www.nfl.com/ajax/scorestrip?"

winsPoolModule.service('nflScoresService', function ($http, $q) {
  var service = {}; 
  
  service.getScoreboard = function(seasonId) {
    var weekProms = [];
    
    for (var weekId=1; weekId<=17; weekId++) {
      weekProms.push($http.get(NFL_URL + "season=" + seasonId + "&seasonType=REG&week=" + weekId, { cache: false }).then(function (resp) { return (resp.data); }))
    }
    return $q.all(weekProms).then(function (respArr) {
    var retArr = []
      respArr.forEach(function (resp) {
        var parser = new DOMParser();
        const xmlDoc = parser.parseFromString(resp,"text/xml");          
        const thisWk = xmlDoc.getElementsByTagName("gms")[0].getAttribute("w");
        const myList = xmlDoc.getElementsByTagName("g")
        for (i=0; i<myList.length; i++) {
          var gEle = myList[i];
          retArr.push( { 
            "seasonId": seasonId, 
            "weekId" : thisWk, 
            "homeTeam" : gEle.getAttribute("h"), 
            "awayTeam" : gEle.getAttribute("v"), 
            "homeScore" : gEle.getAttribute("hs"), 
            "awayScore" : gEle.getAttribute("vs"), 
            "winner" : getWinner(gEle),
            "loser" : getLoser(gEle), 
            "homeResult" : getResult(gEle, "home"),
            "awayResult" : getResult(gEle, "away")
            });
        }
      });
      return retArr;
    });
  };
  
  service.getStandings = function (seasonId) {
    
  }
  
  
  
  return service;
});

function getResult(gEle, homeOrAway) {
  //const resultArray = ["W", "T", "L"]
  const result = {"1": "W", "0": "T", "-1": "L"}
  
  if (gEle.getAttribute("hs") !== '' && (gEle.getAttribute("vs") !== '')) {
    homeDiff = gEle.getAttribute("hs") - gEle.getAttribute("vs"); 
    if (homeDiff === 0) return "T";
    homeDiff = homeDiff / Math.abs(homeDiff)
    if (homeOrAway == "home") return result[homeDiff];
    if (homeOrAway == "away") return result[-homeDiff];
    
  }
return '';
}

function getWinner(gEle) {
  if ((gEle.getAttribute("hs") !== '') && (gEle.getAttribute("vs") !== '')) {
    return (gEle.getAttribute("hs") > gEle.getAttribute("vs")) ? gEle.getAttribute("h") : gEle.getAttribute("v");
  }
  return '';
}
function getLoser(gEle) {
  if ((gEle.getAttribute("hs") !== '') && (gEle.getAttribute("vs") !== '')) {
    return (gEle.getAttribute("hs") > gEle.getAttribute("vs")) ? gEle.getAttribute("v") : gEle.getAttribute("h");
  }
  return '';
}
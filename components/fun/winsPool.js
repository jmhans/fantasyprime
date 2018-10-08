var winsPoolModule = angular.module('winsPool', [])



winsPoolModule.config(function($stateProvider) {
  var state = {
    name: 'winsPool',
    url: '/winsPool',
    component: 'winsPoolComponent',
    menu: {
      name: 'Wins Pool',
      priority: 1,
      tag: 'topmenu'
    },
    requiresParams: false,
    resolve: {
      mlbStandings: function(mlbDataService) {
        return mlbDataService.getStandings().then(function(resp) {
          return resp;
        });
      },
      nflStandings: function(nflScoresService) {
        const seasonId = "2018"
        return nflScoresService.getScoreboard(seasonId).then(function(resp) {
          // need a nice reduce function here to convert from individual game results into a standings array. 
          var standings = resp.reduce(function (results, gm) {
            if (gm.homeResult !== '') {
              if (!results.hasOwnProperty(gm.homeTeam)) {
                results[gm.homeTeam] = {"wins": 0, "losses": 0, "ties": 0};
              }
              results[gm.homeTeam].wins += (gm.homeResult == 'W');
              results[gm.homeTeam].losses += (gm.homeResult == 'L')
              results[gm.homeTeam].ties += (gm.homeResult == 'T')

              if (!results.hasOwnProperty(gm.awayTeam)) {
                results[gm.awayTeam] = {"wins": 0, "losses": 0, "ties": 0};
              }
              results[gm.awayTeam].wins += (gm.awayResult == 'W');
              results[gm.awayTeam].losses += (gm.awayResult == 'L')
              results[gm.awayTeam].ties += (gm.awayResult == 'T')
            }
            return results;
          }, {});
          
          var output = [];
          for (var key in standings) {
            output.push({"team": {"name": key}, "season": seasonId, "leagueRecord": standings[key]})
          }
          
          return output;
        });
      },
      picks: function($http, mlbStandings, nflStandings) {
        return $http.get('./data/picks.json').then(function(picks) {
          var output = {};
          const leagueGames = {"MLB": 162, "NFL": 16}
          var projectedWins = function(pk) {
            
            const w = (typeof(pk.leagueRecord.wins) === 'undefined') ? 0 : pk.leagueRecord.wins
            const l = (typeof(pk.leagueRecord.losses) === 'undefined') ? 0 : pk.leagueRecord.losses
            const t = (typeof(pk.leagueRecord.ties) === 'undefined') ? 0 : pk.leagueRecord.ties; 
            return leagueGames[pk.League] * (w + 0.5 * t) / (w + l + t);
          }

          
          picks.data.forEach(function(pick) {
            var standings = (pick.League == "MLB") ? mlbStandings : nflStandings;
            
            pick.leagueRecord = standings.find(function(tm) {
              return (tm.team.name == pick.Pick);
            }).leagueRecord;
            pick.projectedWins = projectedWins(pick);
            
          });
          
          return picks.data;
        });
      }
    }
  };

  $stateProvider.state(state);

});

winsPoolModule.component('winsPoolComponent', {
  bindings: {
    picks: '<'
  },
  templateUrl: 'components/fun/winsPool.html',
  controller: winsPoolCtrl
});

function winsPoolCtrl($http, $scope, nflScoresService, mlbDataService) {
  var ctrl = this
  function sortOn(collection, name) {
    collection.sort(
      function(a, b) {
        if (a[name] <= b[name]) {
          return (-1);
        }
        return (1);
      }
    );
 }
 ctrl.sortBy = function(sortbyParameter) {
   return function(a) {
    const val = a[sortbyParameter];
     if (isNaN(val)) {
       return val;
     } else return parseFloat(val);
   }
 }

  ctrl.leagueFilter = function(el) {return (el.League == ctrl.selectedLeague);}  
  
  ctrl.leagues = ["NFL", "MLB"];
  ctrl.seasons = [2018];
  
  ctrl.aggRecord = function (pks) { 
    if (typeof(pks) === 'undefined') return '';
    return pks.reduce(function (total, pk) {
      for (var key in pk.leagueRecord) {
        if(!total.hasOwnProperty(key)) {
           total[key] = 0 
        }
        total[key] += pk.leagueRecord[key]
      }
      if (!total.hasOwnProperty('projectedWins')) {
        total.projectedWins = 0;
      }
      total.projectedWins += pk.projectedWins;
      return total;
    }, {})
  }
  
  $scope.$watch('$ctrl.selectedLeague', function() {
    ctrl.regroup();
  });

  ctrl.sumProp = function(itemList, propName) {
    var propList = propName.split(".");
    return itemList.reduce(function(total, itm) {
      var result = itm;
      for (p=0; p<propList.length; p++) {
        result = result[propList[p]] || 0
      }
      total += result;
      return total;
    }, 0)
  };
  
  
  ctrl.regroup = function() {
    // Function based on this blog post: https://www.bennadel.com/blog/2456-grouping-nested-ngrepeat-lists-in-angularjs.htm
    ctrl.groups = [];
    var attribute = "Name";
    sortOn(ctrl.picks, attribute);
    var groupValue = "_INVALID_GROUP_VALUE_";

    for (i = 0; i < ctrl.picks.length; i++) {
      var pick = ctrl.picks[i];
      if (pick.League == ctrl.selectedLeague && pick.Season == ctrl.selectedSeason) {
        if (pick[attribute] !== groupValue) {
          var group = {
            label: pick[attribute],
            picks: []
          };
          groupValue = group.label;
          ctrl.groups.push(group);
        }

        // Add the pick to the currently active
        // grouping.
        group.picks.push(pick);
      }
    }
    
    ctrl.groups.sort(function (a, b) {
      function groupProj(grp) {
        return grp.picks.reduce(function (total, pk) {
          total += pk.projectedWins;
          return total
        }, 0);
      }
      return -1 * (groupProj(a) - groupProj(b));
    });
  }
  
  ctrl.$onInit = function () {
    ctrl.selectedLeague = ctrl.leagues[0];
    ctrl.selectedSeason = ctrl.seasons[0];
    ctrl.regroup();
  }
  
  
  ctrl.expand = function(item) {
    item.show = !item.show;
  }
  ctrl.winPct = function(pickObj) {
    return pickObj.data.wins / (pickObj.data.wins + pickObj.data.losses);
  };
}

footballDexModule.service('footballdexService', function ($http) {
    var service = {
        getRFAs: function (effDate) {
            var players = [];
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/footballdex?transform=1&filter=season,eq,2017').then(function (response) {
                players = response.data.footballdex;
                return $http.get('http://actuarialgames.x10host.com/includes/api.php/rfa_bids?transform=1&filter=season,eq,2017');
            }).then(function (response) {
                players.forEach(function (plyr) {
                    plyr.bidder = '';
                    plyr.bidAmount = '';
                    plyrName = plyr.rfa;
                    totalBids = response.data.rfa_bids.filter(function (bid) { return bid.rfa == plyrName }).length;
                    plyr.bidCount = totalBids;
                });
                return players;
            });

        },
        
    };

    return service;
})
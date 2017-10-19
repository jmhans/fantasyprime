fantasyFantasyModule.service('TeamsService', function ($http) {
    var service = {
        getAllTeams: function () {
            return $http.get('data/data.json', { cache: true }).then(function (resp) {
                return resp.data.teams;
            });
        },
        getFullSchedule: function () {
            return $http.get('data/data.json', { cache: true }).then(function (resp) {
                return resp.data.games;
            });
        },
        getGamesforWeek: function (wk) {
            return service.getFullSchedule().then(function (gmData) {
                return gmData.filter(function (gmRec) {
                    return (gmRec.Week == wk);
                });
            })
        },

        getTeam: function (id) {
            function teamMatchesParam(team) {
                return team.id === id;
            }

            return service.getAllTeams().then(function (teams) {
                return teams.find(teamMatchesParam)
            });
        },
        getPrimeTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_teams?transform=1').then(function (response) {
                players = response.data.prime_teams;
                return players;
            });
        }

    }

    return service;
})

fantasyFantasyModule.service('FFDBService', function ($http) {
    this.activeTeam = {};

    var service = {
        
        addTeam: function (ownerName, teamName, season) {
            var tmObj = {
                TEAM_OWNER: ownerName,
                TEAM_NAME: teamName,
                SEASON: season
            };

            return $http.post('http://actuarialgames.x10host.com/includes/api.php/prime_teams', tmObj).then(function (resp) {
                return resp.data;
            });


        },
        getTeams: function () {
            return $http.get('http://actuarialgames.x10host.com/includes/api.php/prime_teams?transform=1').then(function (response) {
                players = response.data.prime_teams;
                return players;
            });
        },
        deleteTeam: function (teamID) {
            return $http.delete('http://actuarialgames.x10host.com/includes/api.php/prime_teams/' + teamID).then(function (response) {
                return response.data;
            });
        },
        updateItem: function (item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/prime_teams/' + item.id, item).then(function (response) {
                return response.data;
            })
        }, 
        updateTable: function (tbl, item) {
            return $http.put('http://actuarialgames.x10host.com/includes/api.php/' + tbl + '/' + item.recno).then(function (response) {
                return response.data;
            })
        },
        getTeam: function (teamID) {
            return service.getTeams().then(function (response) {
                return response.find(function (tm) { return (tm.id == teamID) });
            });
        }
    };

    return service;
})
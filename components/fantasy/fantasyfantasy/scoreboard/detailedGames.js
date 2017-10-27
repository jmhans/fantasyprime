fantasyFantasyModule.component('detailedGameResults', {
    bindings: {  games: '<' },
    templateUrl: 'components/fantasy/fantasyfantasy/scoreboard/detailedGameResults.html',
    controller: function () {
        this.orderTeams = function (x) {
            return ((x['PRIME_ROSTER_ENTRY']['position']));
        }
    }
})
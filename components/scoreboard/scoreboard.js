angular.module('fantasyfantasy').component('scoreboard', {
    bindings: { scores: '<', teams: '<', games: '<' },
    templateUrl: 'components/scoreboard/scoreboard.html',
    controller: function ($scope, $log, $state, $http) {
        $scope.weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
        $scope.totalItems = $scope.weeks.length;
        // $scope.currentWeek = 14;

        $scope.goToWeek = function (wk) {
            $scope.selectedWeek = wk;
            $state.go('scoreboard.details', { weekId: $scope.selectedWeek });
        }

        $scope.currentWeek = $http.get('data/weekDetails.json').then(function (resp) {
            for (var i = 0; i < resp.data.weeks.length; i++) {
                var d = new Date(resp.data.weeks[i]['Scores Final']);
                var curTime = new Date();
                var lastCheckD = new Date('12/31/2999');
                var wk = 1;
                if (curTime < d && d < lastCheckD) {
                    wk = resp.data.weeks[i]['WeekId'];
                    lastCheckD = d;
                }
            }
            $scope.goToWeek(wk);
            return wk;

        });

        


    }
})

angular.module('fantasyfantasy').component('scoreboard.details', {
    bindings: { scores: '<', teams: '<', games: '<' },
    templateUrl: 'components/scoreboard/scoreboardDetails.html',
    controller: function ($scope) {
        $scope.isCollapsed = false;
    }
})
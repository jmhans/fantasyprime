
var app = angular.module('fantasyfantasy').controller('DatepickerCtrl', function ($scope, $rootScope, $state, $stateParams) {
    if (typeof $state.params.dt !== 'undefined') {
        // the variable is defined
        $scope.dt = new Date($state.params.dt);
    } else {
        $scope.dt = new Date();
    }

   $scope.today = function () {
        $scope.dt = new Date();

        //$scope.dt = $scope.$parent.$ctrl.dt;
    };
    //$scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: new Date(2010, 4, 1),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return false; //mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }


    $scope.open = function () {
        $scope.popup.opened = true;
    };


    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['MM-dd-yyyy', 'dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup = {
        opened: false
    };

    /*$scope.$watch('$scope.dt', function ( newVal, oldVal) {
        console.log($scope.dt);
        startDt = $scope.dt;

        strDate = stringifyDate(startDt);

        $state.go('abl.stats.detail', { dt: strDate });
    })*/

    $scope.$watch('dt', function (newVal, oldVal) {
        console.log($scope.dt);
        startDt = $scope.dt;

        strDate = stringifyDate(startDt);

        $state.go('abl.stats.detail', { dt: strDate });
    })



});
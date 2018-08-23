'use strict';

var signupModule = angular.module('signup', []);

signupModule.controller('SignupCtrl', function ($scope, $location, cognitoService) {

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var nameParam = {
            Name: 'name',
            Value: $('#name').val()
        };

        var emailParam = {
            Name: 'email',
            Value: $('#email').val()
        };

        var attributes = cognitoService.getUserAttributes(nameParam, emailParam);
        // attributes.push({ name: 'role', value: 'user' });
        userPool.signUp($('#userName').val(), $('#password').val(), attributes, null, function (err, result) {
            if (err) {
                console.log(err);
                $scope.errorMessage = err.message;
                $scope.$apply();
                return;
            } else {
                console.log(result);

                $location.path('/activate');
                $scope.$apply();
            }
        });

        return false;
    }

});
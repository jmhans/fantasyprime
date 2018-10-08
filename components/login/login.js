
'use strict';

var loginModule = angular.module('login', [])

loginModule.controller('LoginCtrl', function ($scope, $state, $rootScope, $location, USER_ROLES, AUTH_EVENTS, cognitoService) {

    if (cognitoService.isAuthorized()) {
        $state.go('contents');
    }

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var cognitoUser = cognitoService.getUser(userPool, $('#username').val());
        var authenticationDetails = cognitoService.getAuthenticationDetails($('#username').val(), $('#password').val());

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                var accessToken = result.getAccessToken().getJwtToken();
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess, accessToken);
                $rootScope.$broadcast(AUTH_EVENTS.authenticated, accessToken);
            },
            onFailure: function (err) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, '');
                $scope.errorMessage = err.message;
                $scope.$apply();
            },

        });
    };

    $scope.forgotPassword = function () {
        var userPool = cognitoService.getUserPool();
        var cognitoUser = cognitoService.getUser(userPool, $('#username').val());
            
        cognitoUser.forgotPassword({
            onSuccess: function (result) {
                console.log('call result: ' + result);
            },
            onFailure: function (err) {
                alert(err);
            },
            inputVerificationCode: function() {
                var verificationCode = prompt('Please input verification code ', '');
                var newPassword = prompt('Enter new password ', '');
                cognitoUser.confirmPassword(verificationCode, newPassword, this);
            }
        });
    }
    

});
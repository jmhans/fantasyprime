'use strict';

var AWScognito = angular.module('aws-cognito', ['login', 'signup', 'activate']);


AWScognito.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/login');

    $stateProvider
      .state('base', {
          abstract: true,
          url: '',
          templateUrl: 'components/login/base.html'
      })
      .state('login', {
          url: '/login',
          parent: 'base',
          title: 'Login',
          templateUrl: 'components/login/login.html',
          controller: 'LoginCtrl',
          menu: { name: "Login", priority: 1, tag: 'topmenu' },
      })
      .state('signup', {
          url: '/signup',
          parent: 'base',
          title: 'Sign Up',
          templateUrl: 'components/login/signup.html',
          controller: 'SignupCtrl',
          menu: { name: "Register", priority: 2, tag: 'topmenu' },
      })
      .state('activate', {
          url: '/activate',
          parent: 'base',
          title: 'Activate',
          templateUrl: 'components/login/activate.html',
          controller: 'ActivateCtrl',
          menu: { name: "Activate", priority: 3, tag: 'topmenu' },
      })
      .state('contents', {
          url: '/contents',
          title: 'Contents',
          templateUrl: 'components/login/contents.html',
          controller: 'ContentsCtrl',
          menu: { name: "Contents", priority: 4, tag: 'topmenu' }
      });
});

var activateModule = angular.module('activate', []);
    
activateModule.controller('ActivateCtrl', function ($scope, $rootScope, $location, cognitoService) {

    $scope.submit = function () {
        var userPool = cognitoService.getUserPool();

        var cognitoUser = cognitoService.getUser(userPool, $('#userName').val());
        var activationKey = $('#activationCode').val();

        cognitoUser.confirmRegistration(activationKey, true, function (err, result) {
            if (err) {
                console.log(err);

                $scope.errorMessage = err.message;
                $scope.$apply();
                return;
            }

            $location.path('/login');
            $scope.$apply();
        });
    };

    return false;
});


'use strict';

activateModule.controller('ContentsCtrl', function($scope, $rootScope, $state, $http, $location, cognitoService) {

  this.dt = new Date();

  var authToken;
  cognitoService.authToken.then(function setAuthToken(token) {

    if (token) {
      authToken = token;

      $http({
        method: 'GET',
        url: "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/teststats?&gamedate=2018-08-15",
        headers: {
          Authorization: authToken
        },
        //data: JSON.stringify({
        //              PickupLocation: {
        //                  Latitude: 47.61226823896646,
        //                  Longitude: -122.30073028564247
        //              }
        //}),
        contentType: 'application/json'

      }).then(function successCallback(response) {
        console.log("AWS DB API call worked:" + response);
      }, function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
        console.error('Response: ', jqXHR.responseText);
        alert('An error occured when requesting your unicorn:\n' + jqXHR.responseText);
      });
      
      $http({
        method: 'POST', 
        url: "https://s6hvfgl42c.execute-api.us-east-1.amazonaws.com/prod/fantasyprime", 
        headers: {
          Authorization: authToken
        }, 
        data: JSON.stringify({tableName: "FANTASY_TEAMS", requestType: 'QUERY', record: {}})
      }).then(function successCallback(response) {
        console.log("AWS API call worked:" + response);
        
      }, function ajaxError(jqXHR, textStatus, errorThrown) {
        console.error('Error', textStatus, ', Details: ', errorThrown);
      });

    } else {
      $state.go('login');
    }
  });



});
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

activateModule.controller('ContentsCtrl', function ($scope, $rootScope, $location, cognitoService) {

    //var userPool = cognitoService.getUserPool();

    //var currentUser = userPool.getCurrentUser();

    //if (currentUser != null) {
    //    currentUser.getSession(function (err, session) {
    //        if (err) {
    //            alert(err);
    //            return;
    //        }
    //        console.log('session validity: ' + session.isValid());
    //    });
    //}


    //console.log(currentUser);

    var params = {
        ExpressionAttributeValues: {
            ":v1": {
                S: "No One You Know"
            }
        },
        KeyConditionExpression: "Artist = :v1",
        ProjectionExpression: "SongTitle",
        TableName: "Music"
    };
    dynamodb.query(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
        /*
        data = {
         ConsumedCapacity: {
         }, 
         Count: 2, 
         Items: [
            {
           "SongTitle": {
             S: "Call Me Today"
            }
          }
         ], 
         ScannedCount: 2
        }
        */
    });




});
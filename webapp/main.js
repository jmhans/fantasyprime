
var actuarialGamesModule = angular.module('actuarial.games',
    [
        'ui.router',
        'ui.router.menus',
        'angular-google-gapi',
        'datatables',
        'datatables.bootstrap',
        'datatables.buttons',
        'ui.bootstrap',
        'ui.tree',
        'googlechart',
        'fantasyFootball',
        'abl',
        'fantasyGolf',
        'propBets',
        'state.tree',
        'angular-content-editable',
        'winsPool',
        'bets',
        'aws-cognito'
    ]);

actuarialGamesModule.config(function ($stateProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    var param = function (obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            value = obj[name];

            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if (value !== undefined && value !== null) query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});

// To account for plunker embeds timing out, preload the async data
actuarialGamesModule.run(['$http', '$rootScope', '$state', '$stateParams', 'cognitoService', function ($http, $rootScope, $state, $stateParams, cognitoService) {

    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;

    $rootScope.$on('$stateChangeStart', function (evt, to, params) {
        if (to.redirectTo) {
            var authorizedRoles = to.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                evt.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is logged in, but not authorized for page.
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in.
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
                
            } else {
                $state.go(to.redirectTo, params, { location: 'replace' })
            }
            
        }
    });
    

}


]);


actuarialGamesModule.controller('ApplicationController', function ($scope, $rootScope, $http, $state, USER_ROLES, AUTH_EVENTS, cognitoService) {
    var userPool = cognitoService.getUserPool();
    $scope.currentUser = userPool.getCurrentUser();
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = cognitoService.isAuthorized;

    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };
    $scope.signOut = function () {
        cognitoService.signOut();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    }

    $http.get('http://games.espn.com/ffl/api/v2/scoreboard?leagueId=44600&matchupPeriodId=1&seasonId=2018').then(function (resp) {
      var a = resp.data;
    });
    $scope.$on(AUTH_EVENTS.loginSuccess, function (event, data) {
        console.log("Successfully logged in");
        $scope.setCurrentUser(cognitoService.getCurrentUser());  
        $scope.accessToken = data;
        $state.go('contents');
        $scope.$apply();
    });
    $scope.$on(AUTH_EVENTS.logoutSuccess, function (event, data) {
        console.log("Logged out and event handler fired.");
        $scope.setCurrentUser(null);
        $state.go('login');
        $scope.$apply();
    });

})

actuarialGamesModule.constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    editor: 'editor',
    guest: 'guest'
})

actuarialGamesModule.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
})
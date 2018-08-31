actuarialGamesModule.service('cognitoService', function () {

    // Region
    AWS.config.region = 'us-east-1'; // Region
    //AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    //    IdentityPoolId: 'us-east-1:71b6f6ff-517a-4cf8-8bd3-f9f1ddbe6fae',
    //});

    //// Cognito User Pool Id
    //AWSCognito.config.region = 'us-east-1';
    //AWSCognito.config.credentials = new AWS.CognitoIdentityCredentials({
    //    IdentityPoolId: 'us-east-1_JkFX0MtS9'
    //});
    authService = {};

    authService.getUserPool = function () {
        var poolData = {
            UserPoolId: 'us-east-1_JkFX0MtS9',
            ClientId: '19h0k0bp8ao9fd3tnl0blm0smb'
        };
        var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
        return userPool;
    };

    authService.getUser = function (userPool, username) {
        var userData = {
            Username: username,
            Pool: userPool
        };
        var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
        return cognitoUser;
    };

    authService.getAuthenticationDetails = function (username, password) {
        var authenticationData = {
            Username: username,
            Password: password
        };
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
        return authenticationDetails;
    };
    authService.signOut = function () {

        currentUser = authService.getCurrentUser();
        if (currentUser != null) {
            currentUser.signOut();
        }
        return;
    };
    authService.getCurrentUser = function () {
        return authService.getUserPool().getCurrentUser();
    }

    authService.getUserAttributes = function () {
        var attributes = [];
        for (var i = 0; i < arguments.length; i++) {
            var attr = new AmazonCognitoIdentity.CognitoUserAttribute(arguments[i]);
            attributes.push(attr);
        }
        return attributes;
    };

    authService.updateAttributes = function (attr) {
        var attributeList = [];
        var attribute = new AmazonCognitoIdentity.CognitoUserAttribute(attr);
        attributeList.push(attr);

        cognitoUser.updateAttributes(attributeList, function (err, result) {
            if (err) {
                alert(err);
                return;
            }
            console.log('call result: ' + result);
        });
    };

    authService.login = function (credentials) {
        return $http
          .post('/login', credentials)
          .then(function (res) {
              Session.create(res.data.id, res.data.user.id,
                             res.data.user.role);
              return res.data.user;
          });
    };

    authService.isAuthenticated = function () {
        currentUser = authService.getUserPool().getCurrentUser();
        if (currentUser != null) {
            return currentUser.getSession(function (err, session) {
                if (err) {
                    alert(err);
                    return;
                }
                return session.isValid();
                //console.log('session validity: ' + session.isValid());
            });
        }
        return;
        
    };
    
    authService.isAuthorized = function () {
        //if (!angular.isArray(authorizedRoles)) {
        //    authorizedRoles = [authorizedRoles];
        //}
        //return (authService.isAuthenticated() &&
        //  authorizedRoles.indexOf(Session.userRole) !== -1);

        return authService.isAuthenticated();
    };

    return authService;



});

function toUsername(email) {
    return email.replace('@', '-at-');
}
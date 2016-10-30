

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
;'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {
      $scope.$on('$viewContentLoaded', function () {

          document.getElementById("msg").innerHTML = "Paragraph changed!"

          //Added a comment

          var url = "https://spreadsheets.google.com/feeds/list/1-T37CNjD3u4mO2p21rKbajCPgyhigC-M9pySexxF_Pg/om6s0f5/public/basic?alt=json";
          $.ajax({
              url: url,
              dataType: "jsonp",
              success: function (data) {
                  // data.feed.entry is an array of objects that represent each cell
              },
          })

      });
  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
;'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]);
;'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    };
  }]);
;//$("#msg").html("change it");
;'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1');

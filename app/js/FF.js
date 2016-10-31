'use strict';

/* Controllers */

angular.module('myApp.FF', [])
  .controller('FantasyFootball', ['$scope', '$http', function ($scope, $http) {
      $scope.$on('$viewContentLoaded', function () {

          //Added a comment

          var url = "https://spreadsheets.google.com/feeds/list/1-T37CNjD3u4mO2p21rKbajCPgyhigC-M9pySexxF_Pg/om6s0f5/public/basic?alt=json";
          $http.get(url).then(function (data) {
              document.getElementById("msg").innerHTML = "Spreadsheet Data Retrieved";
              $scope.ssData = data.data.feed.entry;
          }
          );


      });
  }]);
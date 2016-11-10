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

          (function (d, script) {
              script = d.createElement('script');
              script.type = 'text/javascript';
              script.async = true;
              script.onload = function () {
                  // remote script has loaded
              };
              script.src = 'https://apis.google.com/js/client.js?onload=checkAuth';
              d.getElementsByTagName('head')[0].appendChild(script);
          }(document));



          listMajors();


      });
  }]);




function listMajors() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns',
        range: 'RosterRecords!A:G',
    }).then(function (response) {
        var range = response.result;
        if (range.values.length > 0) {
            appendPre('Name, Major:');
            for (i = 0; i < range.values.length; i++) {
                var row = range.values[i];
                // Print columns A and E, which correspond to indices 0 and 4.
                appendPre(row[1] + ', ' + row[2] + ', ' + row[6]);
            }
        } else {
            appendPre('No data found.');
        }
    }, function (response) {
        appendPre('Error: ' + response.result.error.message);
    });
}
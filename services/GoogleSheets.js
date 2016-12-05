var ssID = '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns';

function stripSheetName(fullRangeString) {
    var n = fullRangeString.indexOf("!")
    return fullRangeString.substring(0, n);
}


angular.module('fantasyfantasy').service('GoogleSheetsService', ['$rootScope', '$q', function ($rootScope, $q) {
    var CLIENT_ID = '1005055514218-blfai4g2nid0s7bvvdgc1ekltvfnk591.apps.googleusercontent.com';
    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
    var domain = '';
    var deferred = $q.defer();
    
    var service = {
        getAllRanges: function () {

            service.login().then(function (res) {
                console.log(res);
                return $rootScope.GApi.sheets.spreadsheets.values.batchGet({
                    spreadsheetId: ssID,
                    ranges: [
                        'RosterRecords!A:G',
                        'Scores!A:Y'
                    ],
                }).then(function (resp) {
                    var outputJSON = {};
                    // return convertSSArraytoJSON(resp.result.values);
                    for (var sht = 0; sht < resp.result.valueRanges.length; sht++) {
                        outputJSON[stripSheetName(resp.result.valueRanges[sht].range)] = convertSSArraytoJSON(resp.result.valueRanges[sht].values)
                    }

                    return outputJSON;
                });
            });

            
        },
        writeRosterRecord: function (newRecords) {
            var insertRecs = [];
            if (typeof (newRecords) === 'object') {
                if (newRecords.isArray) {
                    
                } else {
                    newRecords = [newRecords];
                }
                for (var recNo = 0; recNo < newRecords.length; recNo++) {
                    insertRecs.push([
                        newRecords[recNo].RecNo,
                        newRecords[recNo].TeamID,
                        newRecords[recNo]['TeamName (RefOnly)'],
                        newRecords[recNo].Owner,
                        new Date(),
                        '',
                        newRecords[recNo].Position
                    ]);
                }
            };


            return $rootScope.GApi.sheets.spreadsheets.values.append({
                spreadsheetId: ssID,
                range: 'RosterRecords!A1',
                body: {
                    'values': [insertRecs] 
                }
                }).then(function (resp) {

                })
        },

        login: function () {
            gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: true, 
                hd: domain 
            }, service.handleAuthResult);

            return deferred.promise;
        },

        checkAuth: function() {
            gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: false, 
                hd: domain 
            }, service.handleAuthResult);
        }, 

        handleAuthResult: function (authResult) {
            var authorizeDiv = document.getElementById('authorize-div');
            if (authResult && !authResult.error) {
                // Hide auth UI, then load client library.
                authorizeDiv.style.display = 'none';
                service.loadSheetsApi();
            } else {
                // Show auth UI, allowing the user to initiate authorization by
                // clicking authorize button.
                authorizeDiv.style.display = 'inline';
            }
        },
        handleAuthClick: function(event) {
            gapi.auth.authorize({
                client_id: CLIENT_ID,
                scope: SCOPES,
                immediate: false
            },service.handleAuthResult);
        return false;
        },
        loadSheetsApi: function () {
            var discoveryUrl =
                'https://sheets.googleapis.com/$discovery/rest?version=v4';
            gapi.client.load(discoveryUrl).then(service.listMajors);
        },
        listMajors: function () {
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
                range: 'Class Data!A2:E',
            }).then(function (response) {
                var range = response.result;
                if (range.values.length > 0) {
                    service.appendPre('Name, Major:');
                    for (i = 0; i < range.values.length; i++) {
                        var row = range.values[i];
                        // Print columns A and E, which correspond to indices 0 and 4.
                        service.appendPre(row[0] + ', ' + row[4]);
                    }
                } else {
                    service.appendPre('No data found.');
                }
            }, function (response) {
                service.appendPre('Error: ' + response.result.error.message);
            });
        },
        appendPre:  function (message) {
            var pre = document.getElementById('output');
            var textContent = document.createTextNode(message + '\n');
            pre.appendChild(textContent);
        }


    }

    return service;
}]);

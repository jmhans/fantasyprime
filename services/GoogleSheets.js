var ssID = '1yLdsc_2T9k6I1PVKManfbO6ZliNC1Auu4cLqqXIB_ns';
// Note: All returnRanges will be sent back as a JSON object where the name of the element is the name of the sheet. (Or, technically, the stuff before the ! in the range name). 
var returnRanges = [
    'RosterRecords!A:G',
    'Scores!A:Y',
    'ScoreFlattener!A:V',
    'Standings',
    'Regular Season Standings'
]


function stripSheetName(fullRangeString) {
    var n = fullRangeString.indexOf("!")
    return fullRangeString.substring(0, n);
}

function convertSSArraytoJSON(arr, headerIndex) {
    if (typeof headerIndex === 'undefined') { headerIndex = 0; }
    var outputArr = [];
    for (i = 0; i < arr.length; i++) {
        if (i != headerIndex) {
            var obj = {};
            for (j = 0; j < arr[headerIndex].length; j++) {
                if (typeof arr[i][j] === 'undefined') {
                    obj[arr[headerIndex][j]] = '';
                } else {
                    obj[arr[headerIndex][j]] = arr[i][j];
                }
            }
            outputArr.push(obj);
        }
    }
    return outputArr;
}




actuarialGamesModule.service('GoogleSheetsService', ['$rootScope', '$q', function ($rootScope, $q) {
    var CLIENT_ID = '1005055514218-blfai4g2nid0s7bvvdgc1ekltvfnk591.apps.googleusercontent.com';
    var SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
    var domain = '';
    var deferred = $q.defer();
    
    var service = {

        getStandings: function () {
            
            return service.getData().then(function (data) {
                return data.Standings;
            }, function (err) {
                console.log('Failed: ' + err);
            });
            //return Promise.resolve([1, 2, 3, 4, 5, 6]);

        },
        getScores: function () {
            
            return service.getData().then(function (data) {
                return data.ScoreFlattener;
            }, function (err) {
                console.log('Failed: ' + err);
            });

        },
        getScoresforWeek: function (wkID) {
            return service.getScores().then(function (data) {
                return data.filter(function (itm) { return (itm.Week == wkID); });
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


            return gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: ssID,
                range: 'RosterRecords!A1',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                includeValuesInResponse: true,
                values: insertRecs
            }).then(function (resp) {

            })
        },

        login: function () {
            var a = gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: true, 
                hd: domain 
            }, service.handleAuthResult);
            return deferred.promise;
        },

        getData: function () {

            var retObj = $q.defer();

            var handleAuth = function (authResult) {
                if (authResult && !authResult.error) {
                    retObj.resolve(service.loadSheetsApi());
                }
            };

            gapi.auth.authorize({ 
                client_id: CLIENT_ID,
                scope: SCOPES.join(' '),
                immediate: true, 
                hd: domain 
            }, handleAuth);

            return retObj.promise;
        }, 
        handleAuthResult: function (authResult) {
            var authorizeDiv = document.getElementById('authorize-div');
            if (authResult && !authResult.error) {
                // Hide auth UI, then load client library.
                authorizeDiv.style.display = 'none';
                return Promise.resolve(service.loadSheetsApi());
            } else {
                // Show auth UI, allowing the user to initiate authorization by
                // clicking authorize button.
                authorizeDiv.style.display = 'inline';
            }
        },
        handleAuthClick: function(event) {
            return gapi.auth.authorize({
                client_id: CLIENT_ID,
                scope: SCOPES,
                immediate: false
            },service.handleAuthResult);
            // return false;
        },

        loadSheetsApi: function () {


            var discoveryUrl =
                'https://sheets.googleapis.com/$discovery/rest?version=v4';
            var a = gapi.client.load(discoveryUrl).then(service.retrieveAllRanges);
            return a;
        },

        retrieveAllRanges: function() {
            var a = gapi.client.sheets.spreadsheets.values.batchGet({
                spreadsheetId: ssID,
                ranges: returnRanges,
            }).then(function (resp) {
                var outputJSON = {};
                // return convertSSArraytoJSON(resp.result.values);
                for (var sht = 0; sht < resp.result.valueRanges.length; sht++) {
                    outputJSON[stripSheetName(resp.result.valueRanges[sht].range)] = convertSSArraytoJSON(resp.result.valueRanges[sht].values)
                }

                return outputJSON;
            });
            return a;
        }


    }

    return service;
}]);

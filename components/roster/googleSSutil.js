function convertSSArraytoJSON(arr, headerIndex) {
    if (typeof headerIndex === 'undefined') { headerIndex = 0; }
    var outputArr = [];
    for (i = 0; i < arr.length; i++) {
        if (i != headerIndex) {
            var obj = {};
            for (j = 0; j< arr[headerIndex].length; j++) {
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


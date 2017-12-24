function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function stringifyDate(dt) {
    var d = new Date(dt)
    var ret = pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2) + "-" + d.getFullYear();
    return ret;
}

Array.prototype.filterWithCriteria = function (critObj) {

    function matchesProp(item, match) {
        if (typeof match != "object") {
            return (item === match);
        } else {
            return Object.keys(match).every(function (key) {
                return matchesProp((item[key] ? item[key] : ''), match[key]);
            });
        }
    }

    return this.filter(function (entry) {
        return (matchesProp(entry, critObj));
    })
}


Array.prototype.SUMIFS = function (sumProp, critObj) {
    return this.filterWithCriteria(critObj).reduce(function (total, curVal) { return total + parseFloat(curVal[sumProp]) }, 0);
}

contains = function (needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if (!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function (needle) {
            var i = -1, index = -1;

            for (i = 0; i < this.length; i++) {
                var item = this[i];

                if ((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

Array.prototype.sumProp = function (prop) {
    var total = 0
    for (var i = 0, _len = this.length; i < _len; i++) {
        total += this[i][prop]
    }
    return total
}


getStatusforTime = function (curTime) {
    curTime = (curTime || new Date());
    var SEASON_START_DATE = new Date("2017-09-07"); //First Thursday game date of the NFL season

    var myWeek = (parseInt($transition$.params().weekId) || Date.dateDiff('w', SEASON_START_DATE, curTime) + 1);
    return myWeek;

    nextReoccurringTime = function (curTime, reoccurDay /*SUNDAY in TZ is 0, MONDAY in TZ is 1...*/, reoccurTime /*Time expressed in '00:00:00' string format*/, tzName) {
        tzName = (tzName || "America/Chicago")
        reoccurDay = (reoccurDay || 0);
        reoccurTime = (reoccurTime || "00:00:00")
        curTZtime = new Date(moment.tz((curTime || new Date), tzName).toJSON());

        if (curTZtime.getDay() < reoccurDay) {
            // It's before Wednesday (CT), so add 1, 2, or 3 days
            dayAdd = 3 - curTZtime.getDay();
        } else if (curTZtime.getDay() == reoccurDay && curTZtime <= Date(moment.tz(curTZtime.getFullYear() + "-" + (curTZtime.getMonth() + 1) + "-" + (curTZtime.getDate()) + " " + reoccurTime, tzName).toJSON())) {
            // It is Wednesday (CT), so check the hours. If it's before the process time, add 7 days
            dayAdd = 0; 
        } else {
            // It is after Wednesday (CT), so add 3, 4, 5, or 6 days
            dayAdd = 7 - (3 - curTZtime.getDay());
        }

        return new Date(moment.tz(curTZtime.getFullYear() + "-" + (curTZtime.getMonth() + 1) + "-" + (curTZtime.getDate() + dayAdd) + " " + reoccurTime, tzName).toJSON())
        
    }
    
    nextGameStart = rangeArrayLookup(new Date, a);
    
    // Thursday 7:00PM - Wednesday 5:00PM: WAIVER_PERIOD // rosterMoves : {type: 'WAIVER', week: this_week}
    // Wednesday 5:00PM - Thursday 7:00PM: FREE_AGENT_PICKUP_PERIOD // rosterMoves : {type: 'FREE_AGENT', week: this_week}

    return ;

}

rangeArrayLookup = function (needle, range_array) {
    // Returns 1st the element of an array that is greater than or equal to the needle
    range_array.sort()
    j = 0 
    for (i = 0; i < range_array.length; i++) {
        if (range_array[i] < needle) {
            j = i + 1;
        }
    }
    return range_array[Math.min(range_array.length, j)];
}


getTimeZoneOffsetForTimeZone = function (dtString, tz) {
    var dt = new Date(dtString);
    tz = (tz || 'America/Chicago');
    a = moment.tz(dtString, tz);
    utcDate = new Date(a.toJSON())
    return utcDate.getTimezoneOffset();
}


Date.dateDiff = function (datepart, fromdate, todate) {
    datepart = datepart.toLowerCase();
    var diff = todate - fromdate;
    var divideBy = {
        w: 604800000,
        d: 86400000,
        h: 3600000,
        n: 60000,
        s: 1000
    };

    return Math.floor(diff / divideBy[datepart]);
}


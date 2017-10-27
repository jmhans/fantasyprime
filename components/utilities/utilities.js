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
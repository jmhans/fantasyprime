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

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
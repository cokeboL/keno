var TotalMidd = 810;


//倒计时
function downtimerFunc(a) {
    $("#minute").text("");
    $("#seconds").text("");
    var downtimer = window.setInterval(function() {
        // if (0 > a) return i.downtimer && window.clearInterval(i.downtimer), j = window.setInterval(f, 5e3), "0" == $("#award_mode").attr("data-state") && d(!0), $("#minute").text("00"), void $("#seconds").text("00");
        var b = a--,
            c = parseInt(b / 60 % 60),
            e = parseInt(b % 60);
        10 > c && (c = "0" + c), 10 > e && (e = "0" + e), $("#minute").attr("time", b), $("#minute").text(c), $("#seconds").text(e)
    }, 1e3);
    return downtimer
}



// var a = "06,08,09,11,16,18,28,34,36,37,41,43,47,48,53,62,63,70,72,79";

//获取大小
function GetBigOrSmall(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = getTotal(a),
        c = "";
    return c = b < TotalMidd ? "小" : b > TotalMidd ? "大" : TotalMidd
};

// console.log('GetBigOrSmall', GetBigOrSmall(a))

//获取奇偶
function GetEvenOrOdd(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = 0,
        c = 0;
    if (!(void 0 != a.split("|")[0] && a.split("|")[0].split(",").length > 0)) return "";
    for (var d = a.split("|")[0].split(","), e = 0; e < d.length; e++) parseInt(d[e]) % 2 == 0 ? c++ : b++;
    return b > c ? "奇" : c > b ? "偶" : "和"
};

// console.log('GetEvenOrOdd', GetEvenOrOdd(a))

//获取奇数个数
function GetEvenOrOddCount(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = 0,
        c = 0;
    if (!(void 0 != a.split("|")[0] && a.split("|")[0].split(",").length > 0)) return "";
    for (var d = a.split("|")[0].split(","), e = 0; e < d.length; e++) parseInt(d[e]) % 2 == 0 ? c++ : b++;
    return b
};

// console.log('GetEvenOrOddCount', GetEvenOrOddCount(a))

//获取单双
function GetOneOrTwo(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = getTotal(a);
    return b % 2 == 0 ? "双" : "单"
};

// console.log('GetOneOrTwo', GetOneOrTwo(a))

//获取上中下
function GetUpOrDown(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = 0,
        c = 0;
    if (!(void 0 != a.split("|")[0] && a.split("|")[0].split(",").length > 0)) return "";
    for (var d = a.split("|")[0].split(","), e = 0; e < d.length; e++) parseInt(d[e], 10) >= 1 && parseInt(d[e], 10) < 41 ? b++ : parseInt(d[e], 10) >= 41 && parseInt(d[e], 10) < 81 && c++;
    return b > c ? "上" : c > b ? "下" : "中"
};

// console.log('GetUpOrDown', GetUpOrDown(a))

///获取上盘个数
function GetUpOrDownCount(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = 0,
        c = 0;
    if (!(void 0 != a.split("|")[0] && a.split("|")[0].split(",").length > 0)) return "";
    for (var d = a.split("|")[0].split(","), e = 0; e < d.length; e++) parseInt(d[e], 10) >= 1 && parseInt(d[e], 10) < 41 ? b++ : parseInt(d[e], 10) >= 41 && parseInt(d[e], 10) < 81 && c++;
    return b
};

// console.log('GetUpOrDownCount', GetUpOrDownCount(a))

//获取五行
function GetFive(a) {
    if (void 0 == a || 0 == a.length) return "";
    var b = getTotal(a);
    return b >= 210 && 696 > b ? "金" : b >= 696 && 764 > b ? "木" : b >= 764 && 856 > b ? "水" : b >= 856 && 924 > b ? "火" : b >= 924 && 1411 > b ? "土" : ""
};

// console.log('GetFive', GetFive(a))

//计算总值
function getTotal(a) {
    var b = 0;
    if (void 0 == a || 0 == a.length) return b;
    if (void 0 != a.split("|")[0] && a.split("|")[0].split(",").length > 0)
        for (var c = a.split("|")[0].split(","), d = 0; d < c.length; d++) b += parseInt(c[d], 10);
    return b
};

// console.log('getTotal', getTotal(a))

//获取串关
function GetBigOne(a) {
    if ("810" == getTotal(a)) return "810";
    var b = this.GetBigOrSmall(a),
        c = this.GetOneOrTwo(a);
    return b + c
};

// console.log('GetBigOne', GetBigOne(a))

function nDaysAgo(n) {
    var timeStamp = new Date(new Date().setHours(0, 0, 0, 0));
    var nDaysAgo = timeStamp - 86400 * 1000 * n;
    return nDaysAgo
}
//格式化日期
Date.prototype.Format = function(fmt) {
    var o = {
        "y+": this.getFullYear(),
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S+": this.getMilliseconds() //毫秒
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            if (k == "y+") {
                fmt = fmt.replace(RegExp.$1, ("" + o[k]).substr(4 - RegExp.$1.length));
            } else if (k == "S+") {
                var lens = RegExp.$1.length;
                lens = lens == 1 ? 3 : lens;
                fmt = fmt.replace(RegExp.$1, ("00" + o[k]).substr(("" + o[k]).length - 1, lens));
            } else {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
    }
    return fmt;
}
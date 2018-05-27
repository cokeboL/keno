var query = location.search.substr(1).split('&');
var QueryObj = {};
query.forEach(function(v) {
    QueryObj[v.split('=')[0]] = v.split('=')[1]
})



//全局变量
var code = QueryObj['code'] || 'bjkl8';
// var diff = '';
var downtimer = '';
var reloadTimer = '';
var pendingTimer = '';
var latestTen = '';
$(document).ready(function() {

    //日期初始化
    laydate.render({
        elem: '#begintime',
        type: 'datetime',
        // value: new Date(nDaysAgo(1)),
        min: nDaysAgo(1),
        max: nDaysAgo(-1) - 1000
    });
    laydate.render({
        elem: '#endtime',
        type: 'datetime',
        // value: new Date(Date.now()),
        min: nDaysAgo(1),
        max: nDaysAgo(-1) - 1000
    });

    //期号下拉选择
    $('#first_period').click(function() {
        $('#issue_list').show();
    })
    $('#issueSelect').mouseleave(function() {
        $('#issue_list').hide();
    })
    $('#issue_list').on('click', '>a', function() {
        var issueno = $(this).data('issueno');
        $('#first_period').html('').html(issueno + '期');
        $('#period').html('').html(issueno);
        $('#issue_list').hide();

        var idx = $(this).index();
        var len = $('#issue_list>a').length;
        if (idx == 0) {
            $('#arrow_next').addClass('sel');
            $('#arrow_prv').removeClass('sel');
        } else if (idx + 1 == len) {
            $('#arrow_prv').addClass('sel');
            $('#arrow_next').removeClass('sel');
        } else {
            $('#arrow_prv').removeClass('sel');
            $('#arrow_next').removeClass('sel');
        }
        drawReslutHtml(latestTen[idx]);
    })

    //期号下拉左右箭头切换
    var arrowIdx = 0;
    $("#arrow_prv").click(function() {
        if ($(this).hasClass('sel')) {
            return
        } else {
            arrowIdx++;
            var len = $('#issue_list>a').length;
            $('#issue_list>a:eq(' + arrowIdx + ')').click();
            if (arrowIdx > 0) $('#arrow_next').removeClass('sel')
            if (arrowIdx + 1 == len) $('#arrow_prv').addClass('sel')
        }
    })
    $("#arrow_next").click(function() {
        if ($(this).hasClass('sel')) {
            return
        } else {
            arrowIdx--;
            var len = $('#issue_list>a').length;
            $('#issue_list>a:eq(' + arrowIdx + ')').click();
            if (arrowIdx + 1 < len) $('#arrow_prv').removeClass('sel')
            if (arrowIdx == 0) $('#arrow_next').addClass('sel')
        }
    })

    //彩种切换
    function setNavHover($el) {
        $el.addClass('hover').siblings().removeClass('hover');
        code = $el.data('code');
        var imgUrl = "../images/pic/" + code + "_logo.png";
        $('#timer_logo').attr('src', imgUrl);
    }


    $('#topNav>a').click(function() {
        setNavHover($(this))

        $('#begintime').val('')
        $('#endtime').val('')
        $('#search_issue_no').val('')

        if (!!downtimer) {
            clearInterval(downtimer)
        }
        searchCurrNext()
        searchHistory(true)
    })

    function popupMsg(msg) {
        $('#editorPage_popUps').html('').html(msg);
        $('#editorPage_popUps').fadeIn();
        setTimeout(function() {
            $('#editorPage_popUps').fadeOut('slow');
        }, 2000)
    }

    function drawResultTd(arr) {
        var result = '';
        arr.forEach(function(v, i) {
            if (v <= 40) {
                result += '<i class="color0564a2">' + v + '</i>';
                result += (i == 9 ? '<i class="color0564a2">&nbsp;</i>' : i == 19 ? '<i class="colorb40c19"></i>' : ' <i class="color0564a2">, </i>')
            } else {
                result += '<i class="colorb40c19">' + v + '</i>';
                result += (i == 9 ? '<i class="color0564a2">&nbsp;</i>' : i == 19 ? '<i class="colorb40c19"></i>' : ' <i class="colorb40c19">, </i>')
            }
        })
        return result
    }

    function drawTableRow(v) {
        // v = {
        //     "issueno": "201805110010",
        //     "originissueno": "887412",
        //     "awardtime": 1526813427825,
        //     "awardtimestr": "2018-05-11 16:45:00",
        //     "result": "05,07,11,22,23,24,25,28,33,46,47,48,55,60,66,67,68,69,70,71"
        // }
        var html = '<tr><td class="color3">' + v.issueno + '</td><td>' + v.awardtimestr.substr(5, 16) + '</td><td class="tdNum">';
        var result = v.result.split(',');
        html += drawResultTd(result);
        var total = getTotal(v.result)
        html += (total < TotalMidd ? '</td><td><i class="color0564a2">' + total + '</i></td><td>' : total > TotalMidd ? '</td><td><i class="colorb40c19">' + total + '</i></td><td>' : '</td><td><i>810</i></td><td>');
        var bigSamll = GetBigOrSmall(v.result);
        var oneTwo = GetOneOrTwo(v.result);
        var upDown = GetUpOrDown(v.result);
        var evenOdd = GetEvenOrOdd(v.result);
        var five = GetFive(v.result);
        html += (bigSamll == '小' ? '<b class="color00a0e9">小</b>' : bigSamll == '大' ? '<b class="colore60012">大</b>' : '<b class="weight100">810</b>');
        html += (oneTwo == '单' ? '<b class="colore60012">单</b>' : '<b class="color00a0e9">双</b>');
        html += (upDown == '上' ? '<b class="colore60012">上</b>' : upDown == '下' ? '<b class="color00a0e9">下</b>' : '<b class="color22ac38">中</b>');
        html += (evenOdd == '奇' ? '<b class="colore60012">奇</b>' : evenOdd == '偶' ? '<b class="color00a0e9">偶</b>' : '<b class="color22ac38">和</b>');
        html += (five == '金' ? '<b class="colore5d914">金</b>' : five == '木' ? '<b class="color22ac38">木</b>' : five == '水' ? '<b class="color13b5b1">水</b>' : five == '火' ? '<b class="colorf39800">火</b>' : five == '土' ? '<b class="color7e6b5a">土</b>' : '<b class="weight100">--</b>');
        html += '</td></tr>';
        return html
    }


    function drawReslutHtml(v) {
        var result = v.result.split(',');

        var total = getTotal(v.result);
        var totalhtml = '<span class="skyBlue">' + total + '</span>';

        var bigSamll = GetBigOrSmall(v.result);
        var bigSamllHtml = bigSamll == '小' ? '<span class="blue">小</span>' : bigSamll == '大' ? '<span class="red">大</span>' : '<span class="green">810</span>';

        var oneTwo = GetOneOrTwo(v.result);
        var oneTwoHtml = oneTwo == '单' ? '<span class="red">单</span>' : '<span class="blue">双</span>';

        var upDown = GetUpOrDown(v.result);
        var upDownHtml = upDown == '上' ? '<span class="red">上</span>' : upDown == '下' ? '<span class="blue">下</span>' : '<span class="green">中</span>';

        var evenOdd = GetEvenOrOdd(v.result);
        var evenOddHtml = evenOdd == '奇' ? '<span class="red">奇</span>' : evenOdd == '偶' ? '<span class="blue">偶</span>' : '<span class="green">和</span>';

        var five = GetFive(v.result);
        var fiveHtml = five == '金' ? '<span class="yellow">金</span>' : five == '木' ? '<span class="green">木</span>' : five == '水' ? '<span class="cyanBlue">水</span>' : five == '火' ? '<span class="orange">火</span>' : five == '土' ? '<span class="earthy">土</span>' : '<span class="green">--</span>';

        var fregHtml = totalhtml + bigSamllHtml + oneTwoHtml + upDownHtml + evenOddHtml + fiveHtml;
        $('#award_mode').html('').html(fregHtml);


        var awardResultHtml = '';
        result.forEach(function(v) {
            awardResultHtml += v <= 40 ? '<span class="blueBall">' + v + '</span>' : '<span class="redBall">' + v + '</span>';
        })
        $('#award_result').html('').html(awardResultHtml);
    }

    //初始化查询下期开奖
    function searchCurrNext() {
        if (!!reloadTimer) clearInterval(reloadTimer);
        $.ajax({
            type: 'GET',
            // url: '../data/currIssueInfo.json',
            url: '/query/currIssueInfo',
            data: { code: code },
            dataType: 'json',
            success: function(data) {
                if (data.error !== null) {
                    $('#loading').parent().hide();
                    popupMsg(data.error)
                } else {
                    var next = data.next.awardtime;
                    var diff = parseInt((next - Date.now()) / 1000);
                    if (diff > 0) {
                        if (!!pendingTimer) clearInterval(pendingTimer)

                        $('#award_close').hide();
                        $('#award_info').css('display', 'inline-block');

                        downtimer = downtimerFunc(diff);
                        reloadTimer = window.setInterval(function() {
                            diff--;
                            if (diff < 0) {
                                searchCurrNext()
                                searchHistory(true)
                            }
                        }, 1000)
                    } else {
                        if (!!downtimer) clearInterval(downtimer)
                        if (!!reloadTimer) clearInterval(reloadTimer)
                        pendingTimer = window.setInterval(function() {
                            searchCurrNext()
                            searchHistory(true)
                        }, 1000 * 60)
                        $('#award_close').css('display', 'inline-block');
                        $('#award_info').hide();
                    }

                    var currIssueNo = data.curr.issueno;
                    $('#first_period').html('').html(currIssueNo + '期');
                    $('#period').html('').html(currIssueNo);
                }
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.error(textStatus)
            }
        })
    }
    searchCurrNext()

    function searchHistory(isInitSearch) {
        var flag = true;
        var param = {
            code: code,
        };
        if (isInitSearch) {
            $('#search_issue_no,#begintime,#endtime').val('');
        }

        var issueno = $('#search_issue_no').val().trim();
        var begintime = $('#begintime').val().trim();
        var endtime = $('#endtime').val().trim();

        if (issueno != undefined && !isNaN(issueno)) {
            param.issueno = issueno;
        }
        if (issueno != undefined && isNaN(issueno)) {
            flag = false;
            popupMsg('请输入有效期号!')
        }
        if (!begintime && !endtime) {
            flag = true;
            param.begintime = new Date(nDaysAgo(1)).Format("yyyy-MM-dd hh:mm:ss");
            param.endtime = new Date(Date.now()).Format("yyyy-MM-dd hh:mm:ss");
        }
        if (!!begintime && !endtime) {
            flag = false;
            popupMsg('结束时间错误!')
        }
        if (!begintime && !!endtime) {
            flag = false;
            popupMsg('开始时间错误!')
        }
        if (!!begintime && !!endtime && new Date(begintime) >= new Date(endtime)) {
            flag = false;
            popupMsg('结束时间必须大于开始时间!')
        }
        if (!!begintime && !!endtime && new Date(begintime) < new Date(endtime)) {
            flag = true;
            param.begintime = begintime;
            param.endtime = endtime;
        }

        var $nav = $('#' + code + '_nav');
        setNavHover($nav)

        if (flag) {
            $.ajax({
                type: 'GET',
                // url: '../data/issueInfo.json',
                url: '/query/issueInfo',
                data: param,
                dataType: 'json',
                success: function(data) {
                    $('#loading').parent().hide();
                    if (data.error !== null) {
                        popupMsg(data.error)
                        $('#noData').show();
                        $('#data').hide();

                        $('#award_mode,#award_result').hide();
                        $('#award_wait').show();

                    } else {
                        var issues = data.issues;
                        var code = data.code;
                        if (issues.length == 0) {
                            $('#noData').show();
                            $('#data').hide();

                            $('#award_mode,#award_result').hide();
                            $('#award_wait').show();
                        } else {
                            $('#noData').hide();
                            $('#award_mode,#award_result').show();
                            $('#award_wait').hide();

                            var html = '';
                            issues.forEach(function(v) {
                                html += drawTableRow(v)
                            });


                            latestTen = issues.slice(0, 10);
                            if (latestTen.length !== 0) {
                                var optionHtml = '';
                                latestTen.forEach(function(v) {
                                    optionHtml += ' <a href="javascript:void(0);" data-code="' + code + '" data-issueno="' + v.issueno + '">' + v.issueno + '期</a>';
                                })
                                $('#issue_list').html('').html(optionHtml);

                                drawReslutHtml(latestTen[0])
                            }



                            $('#data tbody tr:gt(0)').remove();
                            $('#data tbody').append(html);
                            $('#data').show();
                        }
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.error(textStatus)
                }
            })
        }
    }
    searchHistory()

    $('#searchDateBtn').click(function() {
        searchHistory()
    })
})
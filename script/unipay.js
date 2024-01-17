/*
    云闪付：“🎁签到领签到金” 

    *************************
    【Loon 2.1+ 脚本配置】
    *************************
    [Script]
    http-request https:\/\/youhui\.95516\.com/newsign/api/shop_items/list script-path=https://raw.githubusercontent.com/yidasanqian/script/master/check_in/unipay/unipay.js, tag=云闪付签到cookie
    cron "31 8 * * *" script-path=https://raw.githubusercontent.com/yidasanqian/script/master/check_in/unipay/unipay.js, tag=云闪付签到
 
    *************************
    【 QX 1.0.10+ 脚本配置 】 
    *************************
    [task_local]
    31 8 * * * unipay.js,tag=云闪付签到

    [rewrite_local]
    https:\/\/youhui\.95516\.com/newsign/api/shop_items/list url script-request-header unipay.js,tag=云闪付签到cookie
    
    [MITM]
    hostname = youhui.95516.com
*/

const cookieKey = 'unipay_cookieKey';
const authorizationKey = 'unipay_authorizationKey';
const userAgentKey = 'unipay_userAgentKey';
const $tool = tool();
try {
    console.log("🍎云闪付签到脚本开始!");
    var img = "https://is5-ssl.mzstatic.com/image/thumb/Purple114/v4/53/bc/b5/53bcb52a-6c33-67cc-0c70-faf4ffbdb71e/AppIcon-0-0-1x_U007emarketing-0-0-0-6-0-0-85-220.png/230x0w.png";
    let isGetCookie = typeof $request !== 'undefined' && $request.method != 'OPTIONS';

    if (isGetCookie && $request.url.indexOf("https://youhui.95516.com/newsign/api/shop_items") > -1) {
        var authorizationVal = $request.headers["Authorization"];
        var cookieVal = $request.headers['Cookie'];
        var userAgentVal = $request.headers['User-Agent'];
        if (!!authorizationVal) {            
            $tool.setkeyval(authorizationVal, authorizationKey);
            $tool.setkeyval(cookieVal, cookieKey);
            $tool.setkeyval(userAgentVal, userAgentKey);
            console.log("🍎Authorization:" + authorizationVal);
            $tool.notify("云闪付签到!", "获得Authorization", authorizationVal, { img: img });
            $done({});
        }
    } else {
        var url = 'https://youhui.95516.com/newsign/api/daily_sign_in';
        var method = 'POST';
        var headers = {
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip, deflate, br',            
            'Origin': 'https://youhui.95516.com',
            'User-Agent': $tool.getkeyval(userAgentKey),
            'Authorization': $tool.getkeyval(authorizationKey),
            'Referer': 'https://youhui.95516.com/newsign/public/app/index.html',
            'Host': 'youhui.95516.com',
            'Accept-Language': 'zh-cn',
            'Accept': 'application/json, text/plain, */*'
        };
        var body = '';

        var myRequest = {
            url: url,
            method: method,
            headers: headers,
            body: body
        };

        $tool.post(myRequest, function (e, r, d) {
            console.log(d);
            var obj = JSON.parse(d);
            if (!!obj.signedIn) {
                if (obj.signedIn == true) {
                    var days = 0;
                    for (var item in obj.days) {
                        if (obj.days[item] == 1) days++;
                    }
                    $tool.notify("云闪付签到成功!", "首次签到时间:" + obj.startedAt.split('T')[0], "已签到:" + days + "天!", { img: img });
                    $done();
                }
                else {
                    $tool.notify("云闪付签到失败!", d, d, { img: img });
                    $done();
                }
            }
            else {
                $tool.notify("云闪付签到失败!", d, d, { img: img });
                $done();
            }
        })

    }

} catch (e) {
    console.log("🍎error" + e);
    $tool.notify("云闪付签到错误!", e, e, { img: img });
    $done();
}

function tool() { var isLoon = typeof $httpClient != "undefined"; var isQuanX = typeof $task != "undefined"; var obj = { notify: function (title, subtitle, message, option) { var option_obj = {}; if (isQuanX) { if (!!option) { if (typeof option == "string") { option_obj["open-url"] = option } if (!!option.url) { option_obj["open-url"] = option.url } if (!!option.img) { option_obj["media-url"] = option.img } $notify(title, subtitle, message, option_obj) } else { $notify(title, subtitle, message) } } if (isLoon) { if (!!option) { if (typeof option == "string") { option_obj["openUrl"] = option } if (!!option.url) { option_obj["openUrl"] = option.url } if (!!option.img) { option_obj["mediaUrl"] = option.img } $notification.post(title, subtitle, message, option_obj) } else { $notification.post(title, subtitle, message) } } }, get: function (options, callback) { if (isQuanX) { if (typeof options == "string") { options = { url: options } } options["method"] = "GET"; $task.fetch(options).then(function (response) { callback(null, adapterStatus(response), response.body) }, function (reason) { callback(reason.error, null, null) }) } if (isLoon) { $httpClient.get(options, function (error, response, body) { callback(error, adapterStatus(response), body) }) } }, post: function (options, callback) { if (isQuanX) { if (typeof options == "string") { options = { url: options } } options["method"] = "POST"; $task.fetch(options).then(function (response) { callback(null, adapterStatus(response), response.body) }, function (reason) { callback(reason.error, null, null) }) } if (isLoon) { $httpClient.post(options, function (error, response, body) { callback(error, adapterStatus(response), body) }) } }, unicode: function (str) { return unescape(str.replace(/\\u/gi, "%u")) }, decodeurl: function (str) { return decodeURIComponent(str) }, json2str: function (obj) { return JSON.stringify(obj) }, str2json: function (str) { return JSON.parse(str) }, setkeyval: function (value, key) { if (isQuanX) { $prefs.setValueForKey(value, key) } if (isLoon) { $persistentStore.write(value, key) } }, getkeyval: function (key) { if (isQuanX) { return $prefs.valueForKey(key) } if (isLoon) { return $persistentStore.read(key) } } }; function adapterStatus(response) { if (response) { if (response.status) { response["statusCode"] = response.status } else { if (response.statusCode) { response["status"] = response.statusCode } } } return response } return obj };
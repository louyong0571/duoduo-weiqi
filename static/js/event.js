var button = $("#button");
var msg = $("#msg");
var info = $("#info");
var net_mode = false;
var ws;

button.click(function () {
    var name_str = $("#name").val();
    if (name_str.length !== 0) {
        connectServer(name_str);
    } else {
        console.log('name is empty');
    }
})

function connectServer(name) {
    if (window.WebSocket) {
        ws = new WebSocket('ws://127.0.0.1:8001');
        //ws = new WebSocket('ws://139.198.9.194:8001');

        ws.onopen = function (e) {
            console.log("连接服务器成功");
            ws.send('login:' + name);
        }
        ws.onclose = function (e) {
            console.log("服务器关闭");
            alert("服务器关闭");
        }
        ws.onerror = function () {
            console.log("连接出错");
            alert("连接出错");
        }

        ws.onmessage = function (e) {

            if (e.data.startWith('userList:')) {
                var userlist = e.data.replace('userList:', '').split(':');
                var userlist_str = '当前在线用户(点击可以开始对战):';
                userlist.forEach(function (value) {
                    if ($("#name").val() === value) {
                        return;
                    }
                    userlist_str += '<span class=\"user\" onclick="javascript:doConnect(' + '\'' + value + '\'' + ')">' + value + '</span>';
                });
                msg.html(userlist_str);
                button.text('success');
            }
            if (e.data.startWith('connect_request:')) {
                var fromName = e.data.split(':')[1];
                var toName = e.data.split(':')[3];

                var result = confirm(fromName + "请求和你对战，同意？");
                if (result) {
                    ws.send("connect_response_ok:" + fromName + ":to:" + toName);
                } else {
                    ws.send("connect_response_not:" + fromName + ":to:" + toName);
                }
            }
            if (e.data.startWith('connect_response_not:')) {
                var toName = e.data.split(':')[1];
                alert(toName + "拒绝了您的对战请求");
                return;
            }
            if (e.data.startWith('bind:')) {
                var bindName = e.data.split(':')[1];
                me = (e.data.split(':')[3] === 'true');
                net_mode = true;
                var text = bindName + '是' + (me ? '白色' : '黑色') + '，你是' + (me ? '黑色' : '白色');
                button.text(text);
                need_wait = me ? false : true;
                alert(bindName + "开始和你对战！！！");
                initGame();
            }
            if (e.data.startWith('chess')) {
                var param = e.data.split(':')
                onStep(parseInt(param[1]), parseInt(param[2]), param[3] === 'true' ? true : false);
                console.log(e.data);
                need_wait = false;
            }
            if (e.data.startWith('fail')) {
                var code = e.data.split(':')[1];
                if (code === '1') {
                    button.text("重名了，请重起昵称！");
                }
            }
            if (e.data.startWith('close')) {
                var name = e.data.split(':')[1];
                confirm(name + "已掉线");
                location.reload(false);
            }
        }
    }
}

function doConnect(name) {
    ws.send('connect_request:' + name);
}

function onEaten(b, w) {
    info.text("黑子被吃：" + eatBlackCount + " 白子被吃：" + eatWhiteCount);
    if (eatBlackCount >= 5) {
        alert("对战结束，白方胜利！" + "黑子被吃：" + eatBlackCount + " 白子被吃：" + eatWhiteCount);
        initGame();
        info.text("");
    }
    if (eatWhiteCount >= 5) {
        alert("对战结束，黑方胜利！" + "黑子被吃：" + eatBlackCount + " 白子被吃：" + eatWhiteCount);
        initGame();
        info.text("");
    }
}

String.prototype.endWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substring(this.length - s.length) == s)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substr(0, s.length) == s)
        return true;
    else
        return false;
    return true;
}

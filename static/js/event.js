
var button = $("#button");
var msg = $("#msg");
var force_me = false;
var ws;

button.click(function(){
    var name_str = $("#name").val();
    if (name_str.length !== 0) {
        connectServer(name_str);
        if (name_str==='game1') {
            force_me = true;
            me = true;
        }
        if (name_str==='game2') {
            force_me = true;
            me = false;
        }
    } else {
        console.log('name is empty');
    }
})

function connectServer(name) {
    if(window.WebSocket){
        ws = new WebSocket('ws://127.0.0.1:8001');
        //ws = new WebSocket('ws://139.198.9.194:8001');

        ws.onopen = function(e){
            console.log("连接服务器成功");
            ws.send('login:' + name);
        }
        ws.onclose = function(e){
            console.log("服务器关闭");
        }
        ws.onerror = function(){
            console.log("连接出错");
        }

        ws.onmessage = function(e){

            if (e.data.startWith('userList:')) {
                var userlist = e.data.replace('userList:','').split(':');
                var userlist_str='当前在线用户:';
                userlist.forEach(function (value) {
                    if ($("#name").val() === value) {
                        return;
                    }
                    userlist_str += '<div onclick="javascript:doConnect(' + value+ ')">' + value + '</div>';
                });
                msg.html(userlist_str);
                button.text('success');
            }
            if (e.data.startWith('black:')) {
                me = (e.data.split(':')[1] === 'true');
                force_me = true;
                var text = '对战开始，你是' + (me ? '黑色' : '白色');
                button.text(text);
                need_wait = me ? false : true;
            }
            if (e.data.startWith('chess')) {
                var param=e.data.split(':')
                onStep(parseInt(param[1]),parseInt(param[2]),param[3] === 'true'?true:false);
                console.log(e.data);
                need_wait = false;
            }
        }
    }
}

function doConnect(name) {
    ws.send('connect:' + name);
}

String.prototype.endWith=function(s){
    if(s==null||s==""||this.length==0||s.length>this.length)
        return false;
    if(this.substring(this.length-s.length)==s)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith=function(s){
    if(s==null||s==""||this.length==0||s.length>this.length)
        return false;
    if(this.substr(0,s.length)==s)
        return true;
    else
        return false;
    return true;
}

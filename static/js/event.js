
var button = $("#button");
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
        ws = new WebSocket('ws://139.198.9.194:8001');

        ws.onopen = function(e){
            console.log("连接服务器成功");
            ws.send(name);
        }
        ws.onclose = function(e){
            console.log("服务器关闭");
        }
        ws.onerror = function(){
            console.log("连接出错");
        }

        ws.onmessage = function(e){
            button.text(e.data);
            if (e.data.indexOf('chess') === 0) {
                var param=e.data.split(':')
                onStep(param[1],param[2],param[3] === 'true'?true:false);
            }
        }
    }
}

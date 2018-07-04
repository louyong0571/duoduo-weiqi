var ws = require("nodejs-websocket");

var game1 = null,game2 = null , game1Ready = false , game2Ready = false;
var userMap = new Map();
var connectMap = new Map();
var server = ws.createServer(function(conn){
	conn.on("text", function (str) {
		console.log("收到的信息为:"+str)
		if (str.startWith('login')) {
			var userList = '';
			var name = str.replace('login:', '');
			if (userMap.has(name)) {
                conn.sendText("Fail: user name exsit!");
                return;
			}
            userMap.set(name, conn);
			userMap.forEach(function (value, key) {
                userList += key + ":";
			});
            conn.sendText("userList:" + userList);
            return;
		}
        if (str.startWith('connect')) {
			var name = str.split(':')[1];
            if (userMap.has(name)) {
                connectMap.set(userMap.get(name), conn);
            }
            conn.sendText("black:" + "true");
            userMap.get(name).sendText("black:" + "false");
            return;
        }
        if (str.startWith('chess')) {
            connectMap.forEach(function (value, key) {
            	if (conn === value) {
            		key.sendText(str);
				}
				if (conn === key) {
                    value.sendText(str);
                }
			})
        }



		if(str==="game1"){
			game1 = conn;
			game1Ready = true;
			conn.sendText("login:true");
		}
		if(str==="game2"){
			game2 = conn;
			game2Ready = true;
            conn.sendText("login:false");
		}

		if(game1Ready&&game2Ready){
			if (conn === game1) {
                game2.sendText(str);
			} else if (conn === game2)  {
                game1.sendText(str);
			}
		}

		//conn.sendText(str);
	});
	conn.on("close", function (code, reason) {
		console.log("关闭连接")
		userMap.forEach(function (value, key) {
            console.log(key);
			if (value === conn) {
				userMap.delete(key);

            }
		});
        connectMap.forEach(function (value, key) {
            if (conn === value || conn === key) {
                connectMap.delete(key);
            }
        });
	});
	conn.on("error", function (code, reason) {
		console.log("异常关闭")
        userMap.forEach(function (value, key) {
            console.log(key);
            if (value === conn) {
                userMap.delete(key);

            }
        });
        connectMap.forEach(function (value, key) {
            if (conn === value || conn === key) {
                connectMap.delete(key);
            }
        });
	});
}).listen(8001);
console.log("websocker server on 8001");


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
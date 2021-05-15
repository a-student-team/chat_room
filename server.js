var ws = require("nodejs-websocket");
var express = require("express");
var c_uid = require("uuid");
const { nativeSync } = require("mkdirp");
var app = express();
var port = 3101;
var user = 0;
var uuid = {};
var conns = {};
var names = {};
var month = [1,2,3,4,5,6,7,8,9,10,11,12];
var messages = [];

function check_time(i){
    if (i < 10) return "0" + i;
    else return i;

}

// 创建一个连接
var server = ws.createServer(function (conn) {
    console.log("创建一个新的连接--------");
    user++;
    if (user>=1000) { user = 1;}
    conn.nickname = "user" + user;
    var mes = {}; // 消息
    var nm = {}; // 昵称
    var timestring;
    var time;
    var id = c_uid(); // uuid
    conn.id = id;
    uuid[id] = conn;
    conns[conn] = id;
    names[id] = conn.nickname;
    mes.type = "enter";
    time = new Date();
    timestring = check_time(month[time.getMonth()]) + "-" + check_time(time.getDate()) + " " + check_time(time.getHours()) + ":" + check_time(time.getMinutes()) + ":" + check_time(time.getSeconds());

    mes.data = {"nick name": conn.nickname , "message": " 进来了", "time":timestring, "uuid": conn.id};
    var mes2 = {};
    mes2.data = mes.data;
    mes2.type = mes.type;
    broadcast(JSON.stringify(mes)); // 广播进入消息 
    nm.type = "name"
    nm.data = conn.nickname;
    conn.sendText(JSON.stringify(nm)); // 向客户端发送昵称
    // conn.sendText(conn.nickname)
    // 向客户端推送消息
    nm.type = "uuid";
    nm.data = id;
    conn.sendText(JSON.stringify(nm)); // 向客户端发送uuid
    mes.type = "list";
    mes.data = names;
    broadcast(JSON.stringify(mes))
    conn.on("text", function (str) {
        var nm = {};
        var mes = {};
        var timestring;
        var time;
        try {
            var js = JSON.parse(str);
        } catch (err){
            console.log("！！！紧急错误！！！");
            console.log(err);
            return 0;
        }
        time = new Date();
        timestring = check_time(month[time.getMonth()]) + "-" + check_time(time.getDate()) + " " + check_time(time.getHours()) + ":" + check_time(time.getMinutes()) + ":" + check_time(time.getSeconds());

        if (js["type"] == 'nick name') {
            nickname = conn.nickname;
            conn.nickname = js["value"];
            console.log(nickname + '将自己名字改为' + conn.nickname);
            mes.type = "change name";
            nm.type = "name";
            nm.data = conn.nickname;
            names[conn.id] = conn.nickname;
            conn.sendText(JSON.stringify(nm));
            mes.data = {"nick name" : nickname, "message" :conn.nickname, "time":timestring, "uuid": conn.id};
            messages.unshift({"data":mes.data, "type": mes.type});

            broadcast(JSON.stringify(mes));
            mes.type = "list";
            mes.data = names;
            broadcast(JSON.stringify(mes));
        } else if (js["type"] == 'message') {
            
            console.log("回复 " + js["value"]);
            mes.type = "message";
            mes.data = {"nick name": conn.nickname , "message" : js["value"], "time":timestring, "uuid": conn.id};
            messages.unshift(mes);
            broadcast(JSON.stringify(mes));
        } else if (js["type"] == 'get old message') {
            mes.type = "old message";
            mes.data = messages;
            conn.sendText(JSON.stringify(mes));
            messages.unshift(mes2);
        }
        if (messages.length > 100) {for (var x = messages.length - 100;x > 0;x--) messages.pop()}
    });

    //监听关闭连接操作
    conn.on("close", function (code, reason) {
        console.log("关闭连接");
        mes.type = "leave";
        time = new Date();
        timestring = check_time(month[time.getMonth()]) + "-" + check_time(time.getDate()) + " " + check_time(time.getHours()) + ":" + check_time(time.getMinutes()) + ":" + check_time(time.getSeconds());

        mes.data = {"nick name":conn.nickname ,"message": " 离开了", "time":timestring, "uuid": conn.id};
        delete uuid[conns[conn]];
        delete conns[conn];
        delete names[id]
        messages.unshift({"data": mes.data, "type": mes.type});
        
        broadcast(JSON.stringify(mes));
        mes.type = "list"
        mes.data = names
        broadcast(JSON.stringify(mes));

    });

    //错误处理
    conn.on("error", function (err) {
        console.log("监听到错误");
        console.log(err);
    });
}).listen(port);

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get('/notify.wav', function (req, res){res.sendFile(__dirname + "/notify.wav")})
app.get('/notify.mp3', function (req, res){res.sendFile(__dirname + "/notify.mp3")})
app.use('/static', express.static("static"));

var svr = app.listen(3000, function () {
    var host = svr.address().address;
    var port = svr.address().port;
    console.log("服务器开启地址为 http://%s:%s", host, port);
});

function broadcast(str) {
    server.connections.forEach(function (connection) {
        connection.sendText(str);
    });
}


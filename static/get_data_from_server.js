//在页面显示聊天内容
var uuid;
var websocket;
var lockOfConn = false;
var intv;
var first_con = false;
function showMessage(data, type, x) {
    if (type == "name") {
        $("#name").html(data);
    } else if (type == "uuid") {
        uuid = data;
    } else if (type == "list") {
        var ch;
        $("#conn_list").empty();
        for (var i in data){
            ch = $("<div></div>").html(data[i])
            $("#conn_list").append(ch);
        }
    } else {
        var div = $("<div></div>");
        var message_div = $("<div></div>");
        if (type == "enter") {
            message_div.css({"color":"rgba(0,0,255,0.8)","text-align":"center", "font-size":"14px"});
            message_div.html(data["nick name"]+ "进来了");
        } else if (type == "leave") {
            message_div.css({"color":"rgba(255,0,0,0.8)","text-align":"center", "font-size":"14px"});
            message_div.html(data["nick name"]+ "离开了");
        } else if (type == "change name") {
            message_div.css({"text-align":"center", "font-size":"14px   !important"});
            message_div.html(data["nick name"] + "将昵称改为" + data["message"]);
        } else if (type == "message"){
            message_div.html(data["message"]);
            message_div.css({"position":"absolute","left":"40px"})
            var time_div = $("<div></div>");
            time_div.css({"color": "rgba(20, 20, 20, 0.7)", "font-size":"11px"});
            time_div.html(`<span style="color: blue">${data["nick name"]}</span>  `+ data["time"]);
            if (data["uuid"] != uuid) {$("#chat_audio")[0].play();}
            div.append(time_div);

        }
        div.append(message_div);
        div.append("<br/>")
        let msg = $('#msg');
        if (x == 0) {
            msg.append(div);
        } else {
            msg.prepend(div);
        }
        msg.scrollTop(document.getElementById("msg").scrollHeight); 
    }
}
$(document).ready(function(){
    //新建一个websocket
    //打开websocket连接
    $('<audio id="chat_audio"><source src="./notify.mp3" type="audio/mpeg"><source src="./notify.wav" type="audio/wav"></audio>').appendTo("body");
    function createConnection() {
        if (!lockOfConn) {
            websocket = new WebSocket("ws://www.dage.world:3101");
            
            websocket.onopen = function () {
                lockOfConn = true;
                intv = setInterval(function () {console.log("aaa");websocket.send(JSON.stringify({"type": "heart", value: "", "uuid": uuid}));}, 5000);
                $("#state").text("在线");
                if (!first_con) {
                    websocket.send(JSON.stringify({"type": "get old message","value":"","uuid": uuid}))
                    first_con = true;
                }
            }
            
            websocket.onclose = function () {
                console.log("websocket close");
                lockOfConn = false;
                clearInterval(intv);
                $("#conn_list").empty();
                $("#name").html("");
                $("#state").text("离线");

            }
            //接收服务器返回的数据
            websocket.onmessage = function (e) {
                var mes = JSON.parse(e.data);
                
                if (mes.type == "old message") {
                    mes.data.forEach (function (data){showMessage(data.data, data.type,1);})
                    console.log(mes)
                } else 
                {showMessage(mes.data, mes.type,0);}
            }
            
            console.log('已经连上服务器----')

        } else {alert("现在已经连接了！")}
    }


    function closeConnection()
    {
        if (lockOfConn) {
            websocket.close();
        } else {alert("现在已经断开了！");}
    }

    function send() {
        if (!lockOfConn) return 1;
        var txt = $("#sendMsg").val();
        if (txt) {
            //向服务器发送数据
            websocket.send(JSON.stringify({"type":"message", "value": txt, "uuid": uuid}));
            $("#sendMsg").val("");
        } else {
            warning_prompt("消息不能为空")
        }
        return 0;
    }


    $("#change").click(function () {
        if (!lockOfConn) return 1;
        let new_name = $("#new_nickname");
        if (new_name.val() == "") {
            warning_prompt("昵称不能为空！")
        } else {
            websocket.send(JSON.stringify({"type":"nick name","value": new_name.val(), "uuid": uuid}))
        }
        return 0;
    })

    $("#submitBtn").click(send);
    $("#sendMsg").keydown (function (event) {
        if (event.keyCode == 13) {
            send();
        }
    })
    $("#connect").click(createConnection);
    $("#disconnect").click(closeConnection);
    createConnection();
});
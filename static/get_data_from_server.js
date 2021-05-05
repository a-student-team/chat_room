//在页面显示聊天内容
var uuid;
var websocket;
var lockOfConn = false;
var intv;
var first_con = false;
function showMessage(data, type) {
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
        var time_div = $("<div></div>");
        var message_div = $("<div></div>");
        time_div.css({"color": "rgba(20, 20, 20, 0.7)", "font-size":"8px"});
        time_div.text(data["time"]);
        if (type == "enter") {
            message_div.css("color","blue")
            message_div.html(data["nick name"]+ "进来了");
        } else if (type == "leave") {
            message_div.css("color","red")
            message_div.html(data["nick name"]+ "离开了")
        } else if (type == "change name") {
            message_div.html(data["nick name"] + "将昵称改为" + data["message"])
        } else {
            message_div.html(data["nick name"] + " 说： " + data["message"])
        }
        div.append(time_div);
        div.append(message_div);
        let msg = $('#msg');
        msg.append(div);
        msg.append("<br/>");
        msg.scrollTop(document.getElementById("msg").scrollHeight); 
    }
}
$(document).ready(function(){
    //新建一个websocket
    //打开websocket连接
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
                    for (var data in mes.data) {showMessage(data.data, data.type);}
                } else 
                {showMessage(mes.data, mes.type);}
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
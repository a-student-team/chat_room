

//在页面显示聊天内容
var uuid;
var websocket;
var lockOfConn = false;
var intv;
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
        
        if (type == "enter") {
            div.css("color","blue")
            div.html(data["nick name"]+ "进来了");
        } else if (type == "leave") {
            div.css("color","red")
            div.html(data["nick name"]+ "离开了")
        } else if (type == "change name") {
            div.html(data["nick name"] + "将昵称改为" + data["message"])
        } else {
            div.html(data["nick name"] + " 说： " + data["message"])
        }
        let msg = $('#msg');
        msg.append(div);
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
            }
            
            websocket.onclose = function () {
                console.log("websocket close");
                lockOfConn = false;
                clearInterval(intv);
                $("#conn_list").empty();
                $("#name").html("");
            }
            //接收服务器返回的数据
            websocket.onmessage = function (e) {
                var mes = JSON.parse(e.data);
                
                showMessage(mes.data, mes.type);
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
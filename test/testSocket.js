var net = require('net');
var HOST = '10.32.62.202';
var PORT = 8123;
var client = new net.Socket();
client.connect(PORT, HOST, function() {
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // 建立连接后立即向服务器发送数据，服务器将收到这些数据
    var data = "yiqiuhengissb";
    var length = data.length;
    var cmd = 'put monitor1 3 '+ length +" 1 123453435\r\n"+data;
    console.info(length);
    var i = 0;
    while(i < 1000){
        client.write(cmd);
        console.info("msg:"+i);
        i ++;
    }
});
var j = 0;
// 为客户端添加“data”事件处理函数
// data是服务器发回的数据
client.on('data', function(data) {
    console.info("recive:" + j ++);
//    console.log((data+"").split(" "));
    // 完全关闭连接
//    client.destroy();
});

// 为客户端添加“close”事件处理函数
client.on('close', function() {
    console.log('Connection closed');
});
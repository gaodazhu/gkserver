/**
 * Created by gaozhu on 2015/3/27.
 */
//var net = require('net');
//setInterval(function(){
//    var testClient = new net.Socket();
//    testClient.on("error",function(){
//        console.info("no connect");
//    })
//    testClient.connect(17776, "localhost", function() {
//        console.info("connect");
//        testClient.destroy();
//    });
//},3000);
var exec = require('child_process').exec;
//exec("call C:\\Users\\gaozhu\\Desktop\\gkClient\\gk-auto-connector.exe");
exec(
    'wmic logicaldisk get Caption,FreeSpace,Size,VolumeSerialNumber,Description  /format:list',
    function (err, stdout, stderr) {
        console.info(stdout);
    });


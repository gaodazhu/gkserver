var thrift = require("thrift");
var ping = require("ping");
var ExceptionService = require("../gen-nodejs/ExceptionService");
//var ecodes = ["E01",//实时数据库异常
//    "E02",//内网工控网络异常
//    "E03"//数据中心网络异常
//];
//Date.prototype.Format = function (fmt) { //author: meizz
//    var o = {
//        "M+": this.getMonth() + 1, //月份
//        "d+": this.getDate(), //日
//        "h+": this.getHours(), //小时
//        "m+": this.getMinutes(), //分
//        "s+": this.getSeconds(), //秒
//        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
//        "S": this.getMilliseconds() //毫秒
//    };
//    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
//    for (var k in o)
//        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
//    return fmt;
//}
//var exceptionServer = thrift.createServer(ExceptionService, {
//    checkException: function(result) {
//        ping.sys.probe("10.32.10.112", function(isAlive){
//            var status = [];
//            !isAlive && status.push({ecode:ecodes[1],date:new Date().Format("yyyy-MM-dd HH:mm:ss")});
//            result(null,JSON.stringify({
//                ucode:"1212120",
//                Status:status
//            }));
//        });
//    }
//},{
//    transport : thrift.TFramedTransport,
//    protocol : thrift.TBinaryProtocol
//});
//exceptionServer.listen(12345);

var connection = thrift.createConnection("10.32.95.21", 17789, {
    transport : thrift.TFramedTransport,
    protocol : thrift.TBinaryProtocol
});
connection.on('error', function(err) {
    console.info(err)
});
// Create a Calculator client with the connection
var client = thrift.createClient(ExceptionService, connection);
client.checkException(function(err,val){
    console.info(val)
});
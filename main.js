/**
 * Created by gaozhu on 2015/3/24.
 */
var path = require('path');
var fs = require("fs");
//执行路径
var baseDir = path.dirname(process.execPath);
//var baseDir = "C:\\Users\\gaozhu\\Desktop";
//var baseDir = "C:\\GkProgram";

var logPath = path.join(baseDir, "logs");
!fs.existsSync(logPath) && fs.mkdirSync(logPath);
var log4js = require('log4js');
log4js.configure({
    appenders: [
        { type: 'file', filename: path.join(logPath, "server.log"), "maxLogSize": 5 * 1024 * 1024,
            pattern: "%d - %m%n", "backups": 3, category: 'gkserver' }
    ]
});

var log = log4js.getLogger('gkserver');

try {

    var conf = JSON.parse(fs.readFileSync(path.join(baseDir, "conf.json")));
    process.on("uncaughtException", function (e) {
        log.error("无法处理的异常:" + e);
    });


    var heartInfo;
    if (!conf.centerIp || !conf.topic || !conf.ucode) {
        exitWhenErr("需要配置安装目录下的conf.json文件中的参数：centerIp,topic,ucode!")
    }
//当异常的时候退出
    var exitWhenErr = function (err) {
        err && log.error("无法处理的异常:" + err);
        io && io.close();
        process.exit(0);
    }


    var Producer = require("metaq-producer");
    var p = new Producer(conf.topic, conf.centerIp + "/meta", function (result) {
        isSendDone = true;
        if (result && result.stat == "200") {
            heartInfo.totalSend++;
            if (result.flag)
                heartInfo.updateTime = result.flag;
        } else {
            log.error("消息发送失败")
        }
    }, function (result, err) {
        isSendDone = true;
        log.error("消息发送失败:" + err);
    })


    var zkUcodePath = "/" + conf.ucode;
    var zkAlivePath = zkUcodePath + "/alive";
    var os = require("os");
    var diskinfo = require('./diskinfo');


//更新本地服务器的基本信息
    var updateInfo = function (callback) {
        heartInfo && diskinfo.getDrives(function (err, aDrives) {
            var mount = baseDir[0].toUpperCase() + ":"
            for (var i = 0; i < aDrives.length; i++) {
                if (mount === aDrives[i].mounted) {
                    heartInfo.totalDisk = aDrives[i].blocks;
                    heartInfo.freeDisk = aDrives[i].available;
                    heartInfo.freeMemory = os.freemem();
                    heartInfo.totalMemory = os.totalmem();
                    break;
                }
            }
            heartInfo.connector = connector;
            callback && callback();
        });
    };

    var alive = function(){
        zkClient && zkClient.isConnected() && zkClient.exists(zkAlivePath,function(err,stat){
            if(err) return;
            setTimeout(function(){
                zkClient && zkClient.isConnected() && zkClient.create(
                    zkAlivePath,
                    new Buffer("i am alive"),
                    zookeeper.CreateMode.EPHEMERAL,
                    function (error, path) {
                        error && log.error(error);
                    }
                );
            },!stat ? 10 : 60000);
        });

    }
    //开启心跳
    var startHeart = function () {
        setInterval(function () {
            try{
                updateInfo(function () {
                    zkClient && zkClient.isConnected() && zkClient.setData(zkUcodePath, new Buffer(JSON.stringify(heartInfo)), function (err) {
                        err && log.error("心跳失败！" + err);
                    });
                });
            }catch(e){
                log.error(e);
            }
        }, 10000);
    }
    var zookeeper = require("mlsc-zookeeper");
    var zkClient;
    function zkInit(){
        try{
            log.info("Retry to connect to remote center!!!");
        }catch(e){}

        zkClient = zookeeper.createClient(conf.centerIp + "/mlsc.monitor/clients");
        zkClient.on("closed",function(){
            //停止producer
            try{
                log.info("Disconnected from the remote center!!!");
            }catch(e){}
            setTimeout(zkInit,30000);
        });
        zkClient.once("connected",function(){
            try{
                log.info("Connect to remote center successed!");
            }catch(e){}
            alive();
            !p.isStarted && startProducer();
        });
        zkClient.connect();
    }
//开启省厅发送程序
    var startProducer = function () {
        zkClient && zkClient.isConnected() && zkClient.getData(zkUcodePath, function (err, data) {
            err && log.error(err);
            try {
                var info = JSON.parse(data.toString());
                if (info && info.totalSend != undefined) {
                    heartInfo = info;
                } else {
                    heartInfo = {};
                    heartInfo.totalSend = 0;
                }
            } catch (e) {
                heartInfo = {};
                heartInfo.totalSend = 0;
            }
            heartInfo.installPath = baseDir;
            p.start(function () {
                p.isStarted = true;
            });
        })
    };
    zkInit();
    startHeart();
    var io = require('socket.io').listen(17776);

    io.sockets.on('connection', function (socket) {
        socket.on('alive', function (serverName) {
            socket.serverName = serverName;
        });
        socket.on("stop", function () {
            exitWhenErr("客户端强行终止！")
        });
    });

    var exec = require('child_process').exec;
    var startCmd = "call \"" + path.join(baseDir, "nw.exe") + "\"  \"" + path.join(baseDir, "gk-auto-connecor.nw") + "\"";
    var ioClient = require("socket.io-client");

    var socket = ioClient.connect("http://localhost:17777", {
        'force new connection': true,  // 是否允许建立新的连接
        reconnect: true,           // 是否允许重连
        'reconnection delay': 1000, // 重连时间间隔 毫秒
        'max reconnection attempts': Number.MAX_VALUE // 重连次数上限
    });
    socket.on("connect", function () {
        connector = true
        socket.emit("alive", "gkserver");
    });
    socket.on("reconnect_attempt", function (times) {
        connector = false;
        if (times % 10 == 0)
            try {
                exec(startCmd, function (err) {
                    err && log.error(err);
                });
            } catch (e) {
                log.error(e);
            }
    });

    var perTime = parseInt(conf.perTime) * 1000;
    var perNum = conf.perNum;
    var isSendDone = true;
    var isGetUpdateTime = false;
    var baseStartTime = "2010-01-01 00:01:01";
//leveldb 是否连通
    var connector = false;

    setInterval(function () {
        try{
            if (connector && !isGetUpdateTime && heartInfo && !heartInfo.updateTime) {
                socket.emit("updateTime", false, function (updateTime) {
                    heartInfo.updateTime = (updateTime ? updateTime : baseStartTime);
                    isGetUpdateTime = true;
                });
                return;
            }
            if (heartInfo && heartInfo.updateTime && isSendDone && connector && p.isStarted && p.isConnected()) {
                socket.emit("query", {limit: perNum, startTime: heartInfo.updateTime, endTime: new Date().getTime(), offset: 0}, function (queryResult) {
                    if (queryResult.err || (queryResult.datas && queryResult.datas.length == 0)) {
                        return;
                    }
                    var lastTime = queryResult.datas[queryResult.datas.length - 1].time;
                    if (lastTime) {
                        for(var i=0;i < queryResult.datas.length; i ++){
                            queryResult.datas[i].ucode = conf.ucode;
                        }
                        isSendDone = false;
                        p.sendMessage(queryResult.datas, lastTime);
                    }
                });
            }
        }catch(e){
            log.error(e);
        }
    }, perTime);



    var thrift = require("thrift");
    var ping = require("ping");
    var ExceptionService = require("./gen-nodejs/ExceptionService");
    var ecodes = ["E01",//实时数据库异常
                    "E02",//内网工控网络异常
                    "E03"//数据中心网络异常
                   ];
    Date.prototype.Format = function (fmt) { //author: meizz
        var o = {
            "M+": this.getMonth() + 1, //月份
            "d+": this.getDate(), //日
            "h+": this.getHours(), //小时
            "m+": this.getMinutes(), //分
            "s+": this.getSeconds(), //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    var exceptionServer = thrift.createServer(ExceptionService, {
        checkException: function(result) {
            ping.sys.probe(conf.gkHost, function(isAlive){
                var status = [];
                !connector && status.push({ecode:ecodes[0],date:new Date().Format("yyyy-MM-dd hh:mm:ss")});
                !isAlive && status.push({ecode:ecodes[1],date:new Date().Format("yyyy-MM-dd hh:mm:ss")});
                if(!zkClient)
                    !zkClient.isConnected()  && status.push({ecode:ecodes[2],date:new Date().Format("yyyy-MM-dd hh:mm:ss")});
                result(null,{
                    ucode:conf.ucode,
                    Status:status
                });
            });
        }
    },{
        transport : thrift.TFramedTransport,
        protocol : thrift.TBinaryProtocol
    });
    exceptionServer.listen(12345);
} catch (e) {
    log.error(e);
}
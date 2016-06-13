/**
 * Created by gaozhu on 2015/3/27.
 */
var os = require("os");
var d = require('diskinfo');
var path = require('path');
console.info(process)
//执行路径
var baseDir = path.dirname(process.execPath);
var info = {};
info.freeMemory = os.freemem();
info.totalMemory = os.totalmem();
info.installPath = baseDir;
d.getDrives(function(err, aDrives) {
    var mount = baseDir[0].toUpperCase()+":"
    for (var i = 0; i < aDrives.length; i++) {
        if(mount ===  aDrives[i].mounted ){
            info.totalDisk = aDrives[i].blocks;
            info.freeDisk = aDrives[i].available;
            break;
        }
    }
});
//info.updateTime = msg[0].time;
info.totalSend = "";
info.shortName = "";
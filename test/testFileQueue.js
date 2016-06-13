/**
 * Created by gaozhu on 2015/3/25.
 */

var Queue = require('file-queue').Queue,
    queue;
var fs = require("fs");
var path = require("path");
queue = new Queue('C:\\Users\\gaozhu\\Desktop\\Queue', function(err) {

//    setInterval(function() {
//        queue.push({ time: "4565" }, function(err) {
//            if(err) { throw err; }
//            !err && queue.tpop(function(err, message, commit,rollback) {
//                if (err) { throw err; }
//                console.info(message);
//                console.info(commit);
//                console.info(rollback);
//            });
//        });
//    }, 10000);




//    fs.readdir(newPath, function(err, messages) {
//        console.info(messages)
//    });

//    console.info(queue.maildir);
    setInterval(function(){
        queue.length(function(err,length){
            console.info(length);
            length > 0 && queue.pop(function(err, message, commit,rollback) {
                console.info(err);
                console.info(message);
                commit && commit();
            });
        });
    },100);

});

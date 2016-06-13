/**
 * Created by gaozhu on 2015/3/23.
 */
var brokers = [];
var broker2Uri = {};
zookeeper = require("node-zookeeper-client");
var i = 0;
function init(){
    var a = {
        sessionTimeout: 30000,
        spinDelay : 1000,
        retries : 0
    };
    var zkClient = zookeeper.createClient('dn1:2181/watchTest',{
        sessionTimeout: 30000,
        spinDelay : 1000,
        retries : 0
    });
    zkClient.once('connected', function () {
        setInterval(function(){
          zkClient.create("/leader/aa",new Buffer(JSON.stringify(a)),function(err){
            console.info(err);
          });
//        zkClient.getChildren(
//            "/",
//            function (event) {
//                console.log(i+': Got watcher event: %s', event);
//            },
//            function (error, children, stat) {
//                if (error) {
//                    console.log(
//                            i+': Failed to list children  due to: %s.',
//                        error
//                    );
//                    return;
//                }
//                console.log(i+': Children of are: %j.', children);
//            }
//        );
        },2000);
    });
    zkClient.connect();
    zkClient.on('connected', function () {
        console.log('Client state is changed to connected.');
    });
    zkClient.on('state', function (state) {
        if(state === zookeeper.State.DISCONNECTED){
            zkClient.close();
            init();
        }
    });
}
init();
setInterval(function(){
    console.info("i alive");
},5000);
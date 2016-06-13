var thrift = require('thrift');
var MetaqService = require('./../gen-nodejs/MetaqService.js'),
    ttypes = require('./../gen-nodejs/metaq_types.js');
var execPath = "C:\\Users\\gaozhu\\Desktop";

var Db = require('tingodb')().Db;

var db = new Db('C:\\Users\\gaozhu\\Desktop\\TingoDB', {});
// Fetch a collection to insert document into
var collection = db.collection("message");
// Insert a single document
collection.createIndex({ "time": 1 });
var server = thrift.createServer(MetaqService, {
    sendMsg: function (msg, result) {
        collection.insert(eval("[" + msg + "]"),{w:1}, function (err, result) {
            console.info(result);
        });
        result(null, true);
    }
}, {
    transport: thrift.TFramedTransport,
    protocol: thrift.TBinaryProtocol
});
server.listen(17788);


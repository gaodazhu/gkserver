var thrift = require('thrift');
var MetaqService = require('../gen-nodejs/MetaqService.js'),
    ttypes = require('../gen-nodejs/metaq_types.js');
var server = thrift.createServer(MetaqService, {
    sendMsg: function (msg, result) {
        console.info(msg);
        result(null, true);
    }
}, {
    transport: thrift.TFramedTransport,
    protocol: thrift.TBinaryProtocol
});
server.listen(17788);
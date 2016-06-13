/**
 * Created by gaozhu on 2015/3/26.
 */
var Db = require('tingodb')().Db;

var db = new Db('C:\\Users\\gaozhu\\Desktop\\TingoDB', {});
// Fetch a collection to insert document into
var collection = db.collection("message");
collection.find({time:{$gt:"2015-03-30 10:20:02",$lt:"2015-03-30 10:24:02"}}, function(err, items) {
    console.info(items);
})
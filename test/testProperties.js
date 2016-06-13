var fs = require("fs");
var jf = require('jsonfile');
var obj = jf.readFileSync("C:\\Users\\gaozhu\\Desktop\\conf.json");
console.info(obj);
/**
 * Created by gaozhu on 2015/3/26.
 */
var msg = '[{"time":"2015-03-26 14:47:01.074","points":[{"name":"U13_02_01001","type":1,"value":0.0247},{"name":"U13_02_01003","type":1,"value":0.1642},{"name":"U13_02_01004","type":1,"value":0.1396},{"name":"U13_02_01002","type":1,"value":0.8013},{"name":"U13_02_02001","type":1,"value":0.1323},{"name":"U13_02_02002","type":1,"value":0.2064},{"name":"U13_02_02003","type":1,"value":0.2479},{"name":"U13_02_02004","type":1,"value":0.3319},{"name":"U13_02_02014","type":1,"value":0.0349},{"name":"U13_02_02015","type":1,"value":0.6186},{"name":"U13_02_02017","type":1,"value":0.2045},{"name":"U13_02_02018","type":1,"value":0.7089},{"name":"U13_02_02005","type":1,"value":0.0643},{"name":"U13_02_02006","type":1,"value":0.0734},{"name":"U13_02_02016","type":1,"value":0.6611},{"name":"U13_02_02019","type":1,"value":0.3736},{"name":"U13_02_02007","type":1,"value":0.2878},{"name":"U13_02_02008","type":1,"value":0.7185},{"name":"U13_02_02009","type":1,"value":0.8903},{"name":"U13_02_02010","type":1,"value":0.4766}]}]';
var Producer = require("metaq-producer");
var p = new Producer("monitor1","dn1:2181,dn2:2181,dn3:2181/meta",function(result){
    if(result && result.stat == "200"){
        console.info(result.flag +",send success！")
    }else{
        console.info(result.flag +",send error！")
    }
},function(result,err){
    console.info(err+result.flag +",send error！")
}).start(function(){
        var name = "test";
        setInterval(function(){
            p.sendMessage(msg);
        },5000);
    });

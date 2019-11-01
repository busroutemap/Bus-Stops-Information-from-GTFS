var express = require('express');
var router = express.Router();
var getGTFS = require('./mymodule/getGTFS')
var appSettings = require('./mymodule/appSettings')
//---------------------------------------------
// nodeGTFS周りの設定
const gtfs = require('gtfs');
const mongoose = require('mongoose');
const config = {
    mongoUrl: 'mongodb://localhost:27017/gtfs',
};
// 入力に応じて処理を分ける
// user、app、gtfs


//---------------------------------------------
let api_user = function(req, res, next){
    mongoose.connect(config.mongoUrl, {useNewUrlParser: true});
    // http://localhost:3000/dev/?stop_id="id指定"
    // http://localhost:3000/dev/?stop_id=S00525AGC9070001018357H001
    // 敷島公園北
    const stop_id = req.query.stop_id;
    let pages = {};
    //---------------------------------------------
    selectedStop(stop_id)
    .then(stop => {
        let routes = {}
        routes = getRoutes(stop);
        return stop, routes
    })
    .then((stop, routes) => {
        let stops = {};
        routes.forEach(element => {
            stops[element.route_id] = getEachStops(element);
        });
        let fareRules = {};
        routes.forEach(element => {
            fareRules[element.route_id] = getEachFareRules(element, stop);
        });
        let stopTimes = {}
        routes.forEach(element => {
            stopTimes[element.route_id] = getEach1stTrip(element);
        })
        return stop, routes, stops, fareRules, stopTimes;
    })
    .then((stop, routes, stops, fareRules, stopTimes) => {
        pages = {stop, routes, stops, fareRules, stopTimes};
        return pages
        // return stop, routes, stops, fareRules, stopTimes;
    })
    .then(pages => {
        res.header('Content-Type', 'application/json; charset=utf-8')
        res.send(pages);
    })
    return
}

//---------------------------------------------
// apis配列に記述していく順に各ミドルウェアが実行
let apis = [api_user]
// http://localhost:3000/dev/
router.get('/', apis);

module.exports = router;

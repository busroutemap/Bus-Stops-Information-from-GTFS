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

let selectedStop = function(stop_id){
    const p = new Promise((resolve, reject) => {
        gtfs.getStops({
            stop_id : stop_id
        },{
            stop_id : 1,
            stop_code : 1,
            stop_name : 1,
            stop_desc : 1,
            zone_id : 1,
            location_type : 1,
            parent_station : 1
        })
        .then(stop=>resolve(stop))
    });
    return p;
}


let getRoutes = function(reqStop) {
    const p = new Promise((resolve, reject) => {
        gtfs.getRoutes({
            stop_id : reqStop.stop_id
        },{
            route_id : 1,
            agency_id : 1,
            route_short_name : 1,
            route_long_name: 1,
            jp_parent_route_id: 1,
            agency_key: 1
        })
        .then(routes=>resolve(routes))
    });
    return p;
}

let getEachStops = function(reqRoute) {
    const p = new Promise((resolve, reject) => {
        gtfs.getStops({
            route_id : reqRoute.route_id
        },{
            stop_id : 1,
            stop_code : 1,
            stop_name : 1,
            stop_desc : 1,
            zone_id : 1,
            location_type : 1,
            parent_station : 1
        })
        .then(stops => resolve(stops))
    });
    return p;
}
let getEachFareRules = function(reqRoute, reqStop){
    const p = new Promise((resolve, reject) => {
        gtfs.getFareRules({
            route_id : reqRoute.route_id,
            origin_id : stop.zone_id
        },{
            // fareRulesの配列が何かにもよる
            // fareattributionsが含まれてい無いと思うけど、
            // そうなれば、mongooseからfare_idを問い合わせる必要がある
        })
        .then(rules => resolve(rules))
    });
    return p;
}

let getEach1stTrip = function(reqRoute){
    const p = new Promise((resolve, reject) => {
        gtfs.getTrips({
            route_id : reqRoute.route_id,
        },{
            trip_id : 1,
            service_id : 1
        })
        .then(trips => {
            gtfs.getStoptimes({
                trip_id : trips[0],
                route_id : reqRoute.route_id
            },{
                arrival_time : 1,
                departure_time : 1,
                stop_id : 1,
                stop_sequence : 1,
                stop_headsign : 1
            })
        })
        .then(stop_times => resolve(stop_times))
    })
    return p
}


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

    // console.log(pages);
    // next()
    // TODO : ここでの値を確認する
    // -> 特に、各routeデータに含まれる値は？
    return
}
//---------------------------------------------
let api_gtfs = function(req, res, next){
    const reqStop = req.query.stop_id;
    let resStops = [];
    // 1. 系統ごとのstops一覧を取得
    resRoutes.forEach(element => {
        gtfs.getStops({
            route_id : element.route_id
        })
        .then(stops => {
            stops.forEach(element => {
                resStops.push(element);
            })
        })
    })
    // 2. 系統ごとの初便stop_timesを取得
    // TODO : 初便だけ、というoption指定を追加
    // QURSTION : 無いとは思うものの、初便は終点まで行かない、とか不安
    let resStopTimes = [];
    resRoutes.forEach(element => {
        gtfs.getStoptimes({
            agency_key : element.agency_key,
            route_id : element.route_id,
        })
        .then(stoptimes => {
            stoptimes.forEach(element => {
                resStopTimes.push(element);
            })
        })
    })
    // 3. 運賃取得
    // TODO : 指定されたstop_idが始発となるfareRuleの指定追加
    // QUESTION : zone_idとorigin_id,destination_id周りの関連
    let resFareRules = [];
    resRoutes.forEach(element => {
        gtfs.getFareRules({
            route_id : element.route_id
        })
        .then(farerules => {
            farerules.forEach(element => {
                resFareRules.push(element);
            })
        })
    })
    // next()
    return res.send();
}
//---------------------------------------------
let api_app = function(req, res, next){
    return res.end();
}
//---------------------------------------------
// 取得したものを元に、出力周りの最終調整
let api_page = function(req, res, next){
    let pages = [];
    resRoutes.forEach(element => {
        let eachRoute = {
            route_id : element.route_id,
            agency_id : element.agency_id,
        }
        pages.push(eachRoute);
    })
}

//---------------------------------------------
// apis配列に記述していく順に各ミドルウェアが実行
let apis = [api_user]
// http://localhost:3000/dev/
router.get('/', apis);

module.exports = router;

var express = require('express');
var router = express.Router();

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
    // http://localhost:3000/dev/?stop_id="id指定"
    const reqStop = req.query.stop_id;
    let resRoutes = [];
    gtfs.getRoutes({
        stop_id : reqStop
    })
    .then(routes=>{
        routes.forEach(element => {
            resRoutes.push(element);
        });
    })
    // next()
    // TODO : ここでの値を確認する
    // -> 特に、各routeデータに含まれる値は？
    return res.send();
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

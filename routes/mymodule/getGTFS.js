const gtfs = require('gtfs');
const getPeriods = require('./getPeriods');
const getFares = require('./getFares');
const mongoose = require('mongoose');

/**
 * データベースへGTFSを探す関数
 * 
 * mongoDBにアクセスし、GTFSの系統・停留所・運賃・時刻を取り出す
 * @param stop_id ユーザーからURLのQueryで指定された、単一停留所
 * @return routes stop_idを通る系統ごとの、系統の配列
 * @return eachStops stop_idを通る系統ごとの、停留所の配列
 * @return ruleLists stop_idを通る系統ごとの、運賃の配列
 * @return periodLists stop_idを通る系統ごとの、各バス停までの所要時間の配列
 */
const getData = async (stop_id) => {
    console.time('getData');
    //---------------------------------------------
    const p1getRoutes = (stop_id) => {
        const p = gtfs.getRoutes({
                stop_id : stop_id
            }, {
                _id : 0,
                route_id : 1,
                agency_id : 1,
                route_short_name : 1,
                route_long_name: 1,
                jp_parent_route_id: 1,
                agency_key: 1
            })
            .catch(e=>{
                console.log(e);
            })
            .then(routes => {
                return(routes);
            })
        return p
    }
    console.timeLog('getData');
    const routes = await p1getRoutes(stop_id);
    console.timeLog('getData');
    //---------------------------------------------
    const p2getEachStops = async (routes) => {
        const f = (route) => {
            const p = gtfs.getStops({
                route_id : route.route_id,
                agency_key : route.agency_key
            },{
                _id : 0,
                stop_id : 1,
                stop_code : 1,
                stop_name : 1,
                stop_desc : 1,
                zone_id : 1,
                location_type : 1,
                parent_station : 1
            })
            .catch(e=>{
                console.log(e);
            })
            .then(stops => {
                return(stops);
            })
        return p;
        }
        const plist = routes.map(route => f(route))
        const results = await Promise.all(plist);
        return results;
    }
    const eachStops = await p2getEachStops(routes);
    console.timeLog('getData');
    //---------------------------------------------
    /**
     * 停留所間の運賃ルールを問い合わせる
     * 
     * 系統ごとに、ユーザー指定停留所からの運賃をデータベースへアクセスし算出する
     * @param routes ユーザー指定停留所が通る系統群
     * @param stop_id ユーザー指定停留所
     * @returns ruleLists 系統ごとの運賃ルール配列
     */
    const p2getEachFareRules = async(routes, stop_id) => {
        // このawaitは必要
        const originStop = await gtfs.getStops({
            route_id : routes.route_id,
            stop_id : stop_id
        },{
            _id : 0,
            zone_id : 1
        }).then(stops=>{
            return stops[0]
        })
        // console.log(originStop);
        const f = async(route) => {
            let rules = await gtfs.getFareRules({
                route_id : route.route_id,
                origin_id : originStop.zone_id
            },{
                _id : 0,
                fare_id : 1,
                origin_id : 1,
                destination_id : 1
            })
            .catch(e=>{
                console.log(e);
            })
            return rules
        }
        const plist = routes.map(route => f(route))
        const results = await Promise.all(plist);
        return results;
    }
    const ruleLists = await p2getEachFareRules(routes, stop_id);
    const fareLists = await getFares(ruleLists);
    // 賢くない
    for (let i = 0; i < ruleLists.length; i++){
        for (let j = 0; j < ruleLists[i].length; j++){
            ruleLists[i][j].price = fareLists[i][j].price
        }
    }
    console.timeLog('getData');
    //---------------------------------------------
    /**
     * 各系統の平均的な所要時間を求める
     * 
     * 各系統の便数を数え上げ、その中央値(恐らく昼)の便を使用し、ユーザー指定停留所から他バス停までの所要時間を算出する
     * @param routes stop_idを通る系統ごとの、系統の配列
     * @return periods
     */
    const p2getEachMiddleTrip = async (routes,stop_id) => {
        const f = async (route) => {
            const mTrip = await gtfs.getTrips({
                route_id : route.route_id
            },{
                _id : 0,
                trip_id : 1
            })
            .catch(e=>{
                console.log(e);
                return(null);
            })
            .then(trips => {
                // ゼロベースなんだよね、trips
                const middleLength = Math.ceil(trips.length / 2) - 1;
                return(trips[middleLength]);
            })
            if(mTrip!=null){
                const p = await gtfs.getStoptimes({
                    trip_id : mTrip.trip_id,
                    route_id : route.route_id,
                    agency_key : route.agency_key
                },{
                    _id : 0,
                    arrival_time : 1,
                    departure_time : 1,
                    stop_id : 1,
                    stop_sequence : 1,
                    stop_headsign : 1
                })
                .catch(e=>{
                    console.log(e);
                })
                .then(stop_times => {
                    return(stop_times);
                })
                return p;
            }
        }
        const plist = routes.map(route => f(route));
        const results = await Promise.all(plist);
        //---------------------------------------------
        // ユーザー指定停留所の時刻を調べておく
        return results;
    }
    const periodLists = await p2getEachMiddleTrip(routes);
    const periods = await getPeriods(periodLists,stop_id);
    console.timeLog('getData');
    //---------------------------------------------
    const all = {
        routes:routes,
        eachStops:eachStops,
        ruleLists:ruleLists,
        // fares:fareLists,
        periodLists:periodLists,
        periods:periods
    }
    console.timeEnd('getData');
    return all
}

module.exports = getData;


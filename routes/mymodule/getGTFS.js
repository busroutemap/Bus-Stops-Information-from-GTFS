const gtfs = require('gtfs');
const getPeriods = require('./getPeriods');
const getFares = require('./getFares');
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
let getData = async (stop_id) => {
    //---------------------------------------------
    let p1getRoutes = async (stop_id) => {
        let p = await new Promise((resolve, reject) => {
            gtfs.getRoutes({
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
            .then(routes => {
                resolve(routes);
            })
        });
        return p
    }
    let routes = await p1getRoutes(stop_id);
    //---------------------------------------------
    let p2getEachStops = async (routes) => {
        let f = (route) => {
            let p = new Promise((resolve, reject) => {
                gtfs.getStops({
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
                .then(stops => {
                    resolve(stops);
                })
            });
        return p;
        }
        let plist = routes.map(
            (route) => {return f(route)})
        let results = await Promise.all(plist);
        return results;
    }
    let eachStops = await p2getEachStops(routes);
    //---------------------------------------------
    /**
     * 停留所間の運賃ルールを問い合わせる
     * 
     * 系統ごとに、ユーザー指定停留所からの運賃をデータベースへアクセスし算出する
     * @param routes ユーザー指定停留所が通る系統群
     * @param stop_id ユーザー指定停留所
     * @returns ruleLists 系統ごとの運賃ルール配列
     */
    let p2getEachFareRules = async(routes, stop_id) => {
        // 後でfare_idに対応する運賃を問い合わせる必要あり
        let originStop = await new Promise((resolve,reject) => {
            gtfs.getStops({
                route_id : routes.route_id,
                stop_id : stop_id
            },{
                _id : 0,
                zone_id : 1
            })
            .then(stops => {
                // たとえ1バス停だけの情報でも、stopsは配列で返される点に留意
                resolve(stops[0]);
            });
        });
        let f = (route) => {
            let p = new Promise((resolve, reject) => {
                gtfs.getFareRules({
                    route_id : route.route_id,
                    origin_id : originStop.zone_id
                },{
                    _id : 0,
                    fare_id : 1,
                    origin_id : 1,
                    destination_id : 1
                })
                .then(rules => {
                    resolve(rules);
                })
            });
            return p;
        }
        let plist = routes.map((route) => {
            return f(route);
        })
        let results = await Promise.all(plist);
        return results;
    }
    let ruleLists = await p2getEachFareRules(routes, stop_id);
    const fareLists = await getFares(ruleLists);
    //---------------------------------------------
    /**
     * 各系統の平均的な所要時間を求める
     * 
     * 各系統の便数を数え上げ、その中央値(恐らく昼)の便を使用し、ユーザー指定停留所から他バス停までの所要時間を算出する
     * @param routes stop_idを通る系統ごとの、系統の配列
     * @return periods
     */
    let p2getEachMiddleTrip = async (routes,stop_id) => {
        let f = async (route) => {
            let mTrip = await new Promise((resolve,reject) => {
                gtfs.getTrips({
                    route_id : route.route_id
                },{
                    _id : 0,
                    trip_id : 1
                })
                .then(trips => {
                    let middleLength = Math.ceil(trips.length / 2);
                    resolve(trips[middleLength]);
                })
            });
            let p = new Promise((resolve, reject) => {
                gtfs.getStoptimes({
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
                .then(stop_times => {
                    resolve(stop_times);
                })
            })
            return p;
        }
        let plist = routes.map((route) => {
            return f(route);
        });
        let results = await Promise.all(plist);
        //---------------------------------------------
        // ユーザー指定停留所の時刻を調べておく
        return results;
    }
    let periodLists = await p2getEachMiddleTrip(routes);
    let periods = await getPeriods(periodLists,stop_id);
    //---------------------------------------------
    let all = {
        routes:routes,
        eachStops:eachStops,
        ruleLists:ruleLists,
        fares:fareLists,
        periodLists:periodLists,
        periods:periods
    }
    return all
}

module.exports = getData;


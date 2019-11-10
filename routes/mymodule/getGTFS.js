const gtfs = require('gtfs');

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
    let p1getRoutes = (stop_id) => {
        const p = new Promise((resolve, reject) => {
            gtfs.getRoutes({
                stop_id : stop_id
            }, {
                _id : 0,
                route_id : 1,
                agency_id : 1,
                route_short_name : 1,
                route_long_name: 1,
                jp_parent_route_id: 1,
                // agency_key: 1
            })
            .then(routes => resolve(routes))
        });
        return p
    }
    let routes = await p1getRoutes(stop_id);
    //---------------------------------------------
    let p2getEachStops = async (routes) => {
        let f = (route) => {
            let p = new Promise((resolve, reject) => {
                gtfs.getStops({
                    route_id : route.route_id
                },{
                    stop_id : 1,
                    stop_code : 1,
                    stop_name : 1,
                    stop_desc : 1,
                    zone_id : 1,
                    location_type : 1,
                    parent_station : 1
                })
                .catch((e) => {
                    console.log(e.message);
                })
                .then(stops => {
                    console.log(stops);
                    resolve(stops);
                })
            });
        return p;
        }
        let plist = routes.map(
            (route) => {return f(route)})
        let s = await Promise.all(plist)
        .then((results) => {
            console.log(results);
        });
        return s;
    }
    // let eachStops = await p2getEachStops(routes);
    //---------------------------------------------
    let p2getEachFareRules = async(routes, stop_id) => {
        // 後でfare_idに対応する運賃を問い合わせる必要あり
        console.log(routes);
        console.log(stop_id);
        let originStop = await new Promise((resolve,reject) => {
            gtfs.getStops({
                route_id : routes.route_id,
                stop_id : stop_id
            },{
                _id : 0,
                zone_id : 1
            })
            .then(stop => {
                resolve(stop);
            });
        });
        console.log(originStop.zone_id);
        let f = (route,origin) => {
            let p = new Promise((resolve, reject) => {
                gtfs.getFareRules({
                    route_id : route.route_id,
                    // origin_id : origin.zone_id
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
            return f(route,originStop)
        })
        let results = await Promise.all(plist);
        return results;
    }
    let ruleLists = await p2getEachFareRules(routes, stop_id);
    //---------------------------------------------
    let p2getEach1stTrip = async (routes) => {
        let f = (route) => {
            let p = new Promise((resolve, reject) => {
                // gtfs.getTrips({
                //     route_id : route.route_id,
                // },{
                //     trip_id : 1,
                //     service_id : 1
                // })
                // .then(trips => {
                    gtfs.getStoptimes({
                        // trip_id : trips[0],
                        // 上はどうも不具合の原因
                        route_id : route.route_id
                    },{
                        arrival_time : 1,
                        departure_time : 1,
                        stop_id : 1,
                        stop_sequence : 1,
                        stop_headsign : 1
                    })
                // })
                .then(stop_times => {
                    resolve(stop_times);
                })
            })
            return p;
        }
        let plist = routes.map((route) => {
            return f(route);
        })
        let s = await Promise.all(plist)
        return s;
    }
    let periodLists = p2getEach1stTrip(routes);
    //---------------------------------------------
    return ruleLists, periodLists;
    // return routes,eachStops,ruleLists,periodLists
}

module.exports = getData;


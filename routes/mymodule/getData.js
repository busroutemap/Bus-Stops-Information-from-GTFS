const gtfs = require('gtfs');
const getPeriods = require('./getPeriods');
const getFares = require('./getFares');
const mongoose = require('mongoose');
const getStops = require('./getStops')

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
    const reqRoutes = gtfs.getRoutes({
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
    });
    //---------------------------------------------
    console.timeLog('getData');
    const originStop = gtfs.getStops({
        route_id : reqRoutes.route_id,
        stop_id : stop_id
    },{
        _id : 0,
        zone_id : 1
    }).then(stops=>{
        return stops[0]
    });
    //---------------------------------------------
    // getData+getStops+getFare+getPeriodルート
    const getEachRouteData = async (routes) => {
        for (let route of routes){
            // mTrip調査
            const mTrip = gtfs.getTrips({
                route_id : route.route_id
            },{
                _id : 0,
                trip_id : 1,
                agency_key : 1,
                route_id : 1
            })
            .catch(e=>{
                console.log(e);
                return(null);
            })
            .then(trips => {
                // ゼロベースなんだよね、trips
                const middleLength = Math.ceil(trips.length / 2) - 1;
                return(trips[middleLength]);
            });
            //---------------------------------------------
            route.stops = await getStops(route,originStop,mTrip);
        }
        return routes
    }
    const routes = await getEachRouteData(reqRoutes);
    //---------------------------------------------
    console.timeEnd('getData');
    return routes
}



module.exports = getData;

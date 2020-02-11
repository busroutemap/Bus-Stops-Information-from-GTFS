const gtfs = require('gtfs');
const mongoose = require('mongoose');
const getPeriods = require('./getPeriods');

/**
 * データベースへGTFSを探す関数
 * 
 * mongoDBにアクセスし、GTFSの系統・停留所・運賃・時刻を取り出す
 * @param stop_id ユーザーからURLのQueryで指定された、単一停留所
 * @param Fare むちゃくちゃブサイクな暫定処理
 */
const getData = async(stop_id,Fare) => {
    // 最初にdataをletで指定
    // data.routes
    // data.here
    // data.ERfareRules
    // data.ERperiods
    // data.ERstops
    // data.ALprices
    let data={};
    console.time(stop_id);
    //---------------------------------------------
    // p_routes
    let p_routes = gtfs.getRoutes({
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
    // p_here
    let p_here = gtfs.getStops({
        stop_id : stop_id
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
    .then(stops=>{
        return stops[0];
    });
    //---------------------------------------------
    // 系統、現在停留所の取得の一括処理
    await Promise.all([p_routes,p_here])
    .catch(e=>{
        console.log(e);
    })
    .then(v=>{
        data.routes = v[0];
        data.here = v[1];
    });
    // 1回目
    console.timeLog(stop_id);
    //---------------------------------------------
    // p_fare
    // fare_attributes.txt : 運賃属性情報
    // fare_rules.txt : 運賃定義情報
    let p_ERfareRules = [];
    // [fareRules(Route01),fareRules(Route02),fareRules(Route03)...]
    let fareIds = [];
    // [fare_id01,fare_id02,fare_id03...]
    let p_ERperiods = [];
    let p_ERstops = [];
    for (let i = 0; i < data.routes.length;i++){
        // (1)routeごとに運賃定義取得
        let route = data.routes[i];
        p_ERfareRules[i] = gtfs.getFareRules({
            route_id : route.route_id,
            origin_id : data.here.zone_id
        },{
            _id : 0,
            fare_id : 1,
            route_id : 1,
            origin_id : 1,
            destination_id : 1
        })
        .catch(e=>{
            console.log(e);
        })
        .then(rules=>{
            for (let rule of rules){
                // とりあえずIdを記録する
                fareIds.push(rule.fare_id);
            }
            return rules;
        });
        //---------------------------------------------
        // (2)routeごとに初便時刻取得->各停留所の時刻差算出
        p_ERperiods[i] = gtfs.getTrips({
            route_id : route.route_id
        },{
            _id : 0,
            trip_id : 1,
            agency_key : 1,
            route_id : 1
        })
        .catch(e=>{
            console.log(e);
        })
        .then(trips => {
            const mLength = Math.ceil(trips.length / 2) - 1;
            const trip = trips[mLength]
            //---------------------------------------------
            // 続けて中間の便の時刻を算出
            const tmpPeriods = gtfs.getStoptimes({
                trip_id : trip.trip_id,
                agency_key : trip.agency_key,
                route_id : trip.route_id,
                stop_id : data.here.stop_id
            },{
                _id : 0,
                arrival_time : 1,
                departure_time : 1,
                stop_id : 1,
                stop_sequence : 1,
            })
            .catch(e=>{
                console.log(e);
            })
            .then(async (hereTime) => {
                return(await getPeriods(trip,hereTime[0]));
            });
            return(tmpPeriods);
        });
        //---------------------------------------------
        // (3)routeごとに停留所取得
        p_ERstops[i] = gtfs.getStops({
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
        .then(stops=>{
            console.log("stopsうひょおおおおおおおおおおお");
            return stops;
        });
    }
    //---------------------------------------------
    // 路線ごとの3種データ取得の一括処理
    // EachRoutesの略
    await Promise.all(p_ERfareRules)
    .catch(e=>{
        console.log(e);
    })
    .then(v=>{
        data.ERfareRules = v;
    })
    console.timeLog(stop_id);
    //---------------------------------------------
    await Promise.all(p_ERperiods)
    .catch(e=>{
        console.log(e);
    })
    .then(v=>{
        data.ERperiods = v;
    })
    console.timeLog(stop_id);
    //---------------------------------------------
    await Promise.all(p_ERstops)
    .catch(e=>{
        console.log(e);
    })
    .then(v=>{
        data.ERstops = v;
    })
    // 2回目
    console.timeLog(stop_id);
    // console.log(data.ERperiods);
    //---------------------------------------------
    // p_price
    // 自分でSchemaを定義しDBにデータを入れていれば、
    // 本当は.populateを使って運賃定義情報と一緒に取得できるはず
    let p_price = Fare.find({
        "fare_id" : {
            // fareIdsに同じ値も多いはず
            $in: fareIds
        }
        },{
            _id : 0,
            fare_id : 1,
            price : 1,
            agency_key : 1
            // payment_method : 1
        })
        // execしないとpromiseになってくれない
        .exec()
        .catch((e)=>{
            console.log(e);
        })
        .then((attributes)=>{
            console.log("attributes:"+attributes.length);
            return attributes;
    })
    //---------------------------------------------
    await Promise.all([p_price])
    .catch(e=>{
        console.log(e);
    })
    .then(v=>{
        data.ALprices = v[0];
    })
    // 3回目
    console.timeLog(stop_id);
    //---------------------------------------------
    // 成形処理、高速化が目的であって出力変更は行わない(クライアント変えたくない)
    let routes = [];
    // [route1,route2,route3...]
    for (let i = 0; i< data.routes.length;i++){
        let route = data.routes[i];
        // {
        // route_id:XXXX,
        // agency_id:XXXX,
        // route_short_name:XXXX,
        // route_long_name:XXXX
        // jp_parent_route_id:XXXX
        // agency_key:XXXX,
        // ↓この1値を追加する
        // stops:[stop1,stop2,stop3....]
        //---------------------------------------------
        let stops = data.ERstops[i];
        // {
        // stop_id : XXXX,
        // stop_code : XXXX,
        // stop_name : XXXX,
        // stop_desc : XXXX,
        // zone_id : XXXX,
        // location_type : XXXX,
        // parent_station : XXXX,
        // ↓この2値を追加する
        // price : XXXX,
        // period : XXXX
        // }
        //---------------------------------------------
        for (let j = 0; j< stops.length;j++){
            let stop = stops[j];
            // data.ERperiods[i]は下記イメージ
            // [route1の所要時間配列,route2の所要時間配列....]
            // stop_sequenceで並び替え済みなのでこれでOK
            stop.period = data.ERperiods[i][j];
            // fare_idとstopの関連付け
            data.ERfareRules[i].some(fareRule=>{
                if(fareRule.destination_id==stop.zone_id){
                    stop.fare_id = fareRule.fare_id;
                    return true;
                    // これ以降のループは停止
                    // .someはtrueを返す。が、今回はどこにも代入しない
                }
            })
            // stopとpriceの関連付け
            data.ALprices.some(price=>{
                if(stop.fare_id==price.fare_id){
                    stop.price = price.price;
                    return true;
                }
            })
        }
        route.stops = stops;
        routes.push(route);
    }
    //---------------------------------------------
    // 4回目
    console.timeEnd(stop_id);
    return routes
}



module.exports = getData;

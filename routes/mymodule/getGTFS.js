const gtfs = require('gtfs');
const mongoose = require('mongoose');
const config = {
    mongoUrl: 'mongodb://localhost:27017/gtfs',
};



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


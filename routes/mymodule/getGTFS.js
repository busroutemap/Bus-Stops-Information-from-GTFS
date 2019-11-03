const gtfs = require('gtfs');


let getData = async (stop_id) => {
    //---------------------------------------------
    let p1 = (stop_id) => {
        const p = new Promise((resolve, reject) => {
            gtfs.getRoutes({
                stop_id : stop_id
            }, {
                route_id : 1,
                agency_id : 1,
                route_short_name : 1,
                route_long_name: 1,
                jp_parent_route_id: 1,
                agency_key: 1
            })
            .then(routes => resolve(routes))
        });
        return p
    }
    let routes = await p1(stop_id);
    //---------------------------------------------
    let p2getEachStops = (routes) => {
        const p = new Promise((resolve, reject) => {
            gtfs.getStops({
                route_id : routes.route_id
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
    let eachStops = p2getEachStops(routes)
    //---------------------------------------------
    let p2getEachFareRules = async (routes, stop_id) => {
        let origin_id = await gtfs.getStops({
            route_id : routes.route_id,
            stop_id : stop_id
        },{
            zone_id : 1
        });
        const p = new Promise((resolve, reject) => {
            gtfs.getFareRules({
                route_id : routes.route_id,
                origin_id : origin_id.zone_id
            },{
                // fareRulesの配列が何かにもよる
                // fareattributionsが含まれてい無いと思うけど、
                // そうなれば、mongooseからfare_idを問い合わせる必要がある
            })
            .then(rules => resolve(rules))
        });
        return p;
    }
    let ruleLists = p2getEachFareRules(routes, stop_id);
    //---------------------------------------------
    let p2getEach1stTrip = function(routes){
        const p = new Promise((resolve, reject) => {
            gtfs.getTrips({
                route_id : routes.route_id,
            },{
                trip_id : 1,
                service_id : 1
            })
            .then(trips => {
                gtfs.getStoptimes({
                    trip_id : trips[0],
                    route_id : routes.route_id
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
    let periodLists = p2getEach1stTrip(routes);
    //---------------------------------------------
    return routes,eachStops,ruleLists,periodLists
}

module.exports = getData;


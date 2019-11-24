const gtfs = require('gtfs');
const mongoose = require('mongoose');
const getFare = require('./getFare');
const getPeriod = require('./getPeriod');

const getStops = async (route,originStop,mTrip) => {
    let stops = await gtfs.getStops({
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
    for (let stop of stops){
        stop.fare = await getFare(route,originStop,stop);
        stop.period = await getPeriod(mTrip,originStop,stop);
    }
    return stops;
}
module.exports = getStops;

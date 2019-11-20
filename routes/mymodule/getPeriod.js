const gtfs = require('gtfs');


/**
 * timeListを元に、各バス停までの所要時間を算出する
 * 
 * なお、事前に本moduleの呼び出し元でmongoose.connectが必要
 * @param timeLists [route1のある1便のStopTimesのArray,route2のある1便のStopTimesのArray...]
 * @returns periods [route1の所要時間Array,route2の所要時間Array...]
 */
let getPeriod = async(mTrip,originStop,destinationStop) => {
    const stopTimes = gtfs.getStoptimes({
        trip_id : mTrip.trip_id,
        route_id : mTrip.route_id,
        agency_key : mTrip.agency_key,
        stop_id : [
            originStop.stop_id,
            destinationStop.stop_id
        ]
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
    .then(stop_times => {
        return(stop_times);
    })
    const yy = 2016;
    const mm = 4;
    const dd = 4;
    // stopTimes[here,aim]か[aim,here]かで場合分け
    var a_here;
    var a_aim;
    if (stopTimes[0].stop_id == originStop.stop_id){
        a_here = stopTimes[0].arrival_time.split(":");
        a_aim = stopTimes[1].arrival_time.split(":");
    } else {
        a_here = stopTimes[1].arrival_time.split(":");
        a_aim = stopTimes[0].arrival_time.split(":");
    }
    const b_here = new Date(yy,mm,dd,a_here[0],a_here[1],a_here[2]);
    const b_aim = new Date(yy,mm,dd,a_aim[0],a_aim[1],a_aim[2]);
    const diff = b_aim.getTime() - b_here.getTime();
    const m = diff / 1000 / 60;
    // マイナスになることもありうるのでmで絶対値化
    const period = Math.abs(m);
    return period;
}


module.exports = getPeriod;

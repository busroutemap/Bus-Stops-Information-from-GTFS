const gtfs = require('gtfs');


/**
 * timeListを元に、各バス停までの所要時間を算出する
 * 
 * なお、事前に本moduleの呼び出し元でmongoose.connectが必要
 * @param timeLists [route1のある1便のStopTimesのArray,route2のある1便のStopTimesのArray...]
 * @returns period 所要時間Number
 */
let getPeriod = async(mTrip,originStop,destinationStop) => {
    if (originStop.stop_id===destinationStop.stop_id){
        // 0を返す
        return 0
    }
    const stopTimes = await gtfs.getStoptimes({
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
    });
    const yy = 2016;
    const mm = 4;
    const dd = 4;
    // stopTimes[here,aim]か[aim,here]かで場合分け
    // stop_sequence順に出てくるはずなので。
    let hereTime;
    let aimTime;
    if (stopTimes[0].stop_id == originStop.stop_id){
        hereTime = stopTimes[0];
        aimTime = stopTimes[1];
    } else {
        hereTime = stopTimes[1];
        aimTime = stopTimes[0];
    }
    const a_here = hereTime.arrival_time.split(":");
    const a_aim = aimTime.arrival_time.split(":");
    const b_here = new Date(yy,mm,dd,a_here[0],a_here[1],a_here[2]);
    const b_aim = new Date(yy,mm,dd,a_aim[0],a_aim[1],a_aim[2]);
    const diff = b_aim.getTime() - b_here.getTime();
    const m = diff / 1000 / 60;
    // マイナスになることもありうるのでmで絶対値化
    const period = Math.abs(m);
    return period;
}


module.exports = getPeriod;

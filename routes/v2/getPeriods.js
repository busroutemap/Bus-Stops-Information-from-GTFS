const gtfs = require('gtfs');


/**
 * timeListを元に、各バス停までの所要時間を算出する
 * 各系統ごとに呼び出される想定
 * 
 * @param trip 系統ごとに1つ定めた便情報
 * @param hereTime 系統ごとに1つあるであろう選択停留所の時刻情報
 * @returns periods 所要時間Numberの配列
 */
const getPeriods = (trip,hereTime) => {
    // 1度便の時刻を全部算出し、引数の時刻から所要時間を算出
    const stopTimes = gtfs.getStoptimes({
        trip_id : trip.trip_id,
        agency_key : trip.agency_key,
        route_id : trip.route_id
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
    .then(stopTimes => {
        return(stopTimes);
    });
    const yy = 2016;
    const mm = 4;
    const dd = 4;
    let periods;
    for (let aimTime of stopTimes){
        const a_here = hereTime.arrival_time.split(":");
        const a_aim = aimTime.arrival_time.split(":");
        const b_here = new Date(yy,mm,dd,a_here[0],a_here[1],a_here[2]);
        const b_aim = new Date(yy,mm,dd,a_aim[0],a_aim[1],a_aim[2]);
        const diff = b_aim.getTime() - b_here.getTime();
        const m = diff / 1000 / 60;
        // マイナスになることもありうるのでmで絶対値化
        // stop_sequence順に並べ替えられているはずなのでこれでOK
        periods.push(Math.abs(m));
    }
    return periods;
}


module.exports = getPeriods;

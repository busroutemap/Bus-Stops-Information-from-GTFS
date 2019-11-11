const gtfs = require('gtfs');


/**
 * timeListを元に、各バス停までの所要時間を算出する
 * 
 * なお、事前に本moduleの呼び出し元でmongoose.connectが必要
 * @param timeLists
 * @returns fares
 */
let getPeriods = (timeLists) => {
    let periods = timeLists.map((timesEachRoute) => {
        // 
        const yy = 2016;
        const mm = 4;
        const dd = 4;
        for (let i; i < timesEachRoute.length; i++){
            if (timesEachRoute.stop_id == stop_id){
                return timeEachStop;
            }
        }
        let hereStopTime = here.map(time => {
            let stopTime = time.arrival_time.split("-");
            return new Date(yy,mm,dd,stopTime[0],stopTime[1],stopTime[2]);
        })
    


    let periods = timeLists.map(times => {
        for (let i; i < times.length; i++){
            let stopTime = times[i].arrival_time.split("-");
            let aimStopTime = new Date(yy,mm,dd,stopTime[0],stopTime[1],stopTime[2]);
            let diff = aimStopTime.getTime() - hereStopTime.getTime();
            let minute = diff / 1000 * 60;
        }
        return period
    })
    return periods
    })

    // 1. まずはユーザー指定停留所の時刻を配列から探す(頭悪い？)
    // 2. 比較して所要時間の差を返す
}


module.exports = getPeriods;

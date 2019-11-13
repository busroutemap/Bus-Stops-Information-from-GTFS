const gtfs = require('gtfs');


/**
 * timeListを元に、各バス停までの所要時間を算出する
 * 
 * なお、事前に本moduleの呼び出し元でmongoose.connectが必要
 * @param timeLists [route1のある1便のStopTimesのArray,route2のある1便のStopTimesのArray...]
 * @returns periods [route1の所要時間Array,route2の所要時間Array...]
 */
let getPeriods = (timeLists,stop_id) => {
    let periods = timeLists.map((timesEachRoute) => {
        console.log(timesEachRoute);
        const yy = 2016;
        const mm = 4;
        const dd = 4;
        let hereStopTime;
        for (let i = 0; i < timesEachRoute.length; i++){
            if (timesEachRoute[i].stop_id == stop_id){
                let here = timesEachRoute[i];
                let stopTime = here.arrival_time.split(":");
                hereStopTime = new Date(yy,mm,dd,stopTime[0],stopTime[1],stopTime[2]);
                break;
            }
        }
        let periodsEachRoutes = [];
        for (let i = 0; i < timesEachRoute.length; i++){
            let stopTime = timesEachRoute[i].arrival_time.split(":");
            let aimStopTime = new Date(yy,mm,dd,stopTime[0],stopTime[1],stopTime[2]);
            let diff = aimStopTime.getTime() - hereStopTime.getTime();
            let m = diff / 1000 / 60;
            // マイナスになることもありうるのでmで絶対値化
            periodsEachRoutes.push(Math.abs(m));
        }
        return periodsEachRoutes;
    })
    return periods;
}


module.exports = getPeriods;

const gtfs = require('gtfs');
const mongoose = require('mongoose');

/**
 * getFare DBにアクセスし、originStopとdestinationStop間の運賃をNumberで返す
 * @param route 
 * @param originStop 
 * @param destinationStop 
 * @return price 定義されていなければnullを返すことがある
 */
const getFare = async(route,originStop,destinationStop) => {
    const rule = await gtfs.getFareRules({
        route_id : route.route_id,
        origin_id : originStop.zone_id,
        destination_id : destinationStop.zone_id
    },{
        _id : 0,
        fare_id : 1
    })
    .catch(e=>{
        console.log(e);
    })
    .then(rule=>{
        return rule
    });
    if (rule[0]===undefined){
        return undefined
    }
    const Schema = mongoose.Schema;
    const fareSchema = new Schema({
        fare_id : {
            type : String,
            require : true,
            unique : true
        },
        price : {
            type : Number
        }
    });
    // なお、円が設定されていない場合もある
    // (通過済みなど)

    const FareModel = mongoose.model('Fare', fareSchema,'fareattributes');
    const find = (rule) => {
        let fare = FareModel.findOne({
            fare_id : rule[0].fare_id
            },{
                _id : 0,
                price : 1
            })
        return fare
    }
    const price = await find(rule);
    mongoose.deleteModel('Fare');
    return price.price;
}

module.exports = getFare
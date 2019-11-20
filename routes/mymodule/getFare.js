const gtfs = require('gtfs');
const mongoose = require('mongoose');

const getFare = async(route,originStop,destinationStop) => {
    const rule = gtfs.getFareRules({
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
    const FareModel = mongoose.model('Fare', fareSchema,'fareattributes');
    const find = (rule)=>{
        let fare = FareModel.findOne({
            fare_id : rule.fare_id
            },{
                _id : 0,
                fare_id : 0,
                price : 1
            })
        return fare.price
    }
    const price = await find(rule);
    return price;
}

module.exports = getFare
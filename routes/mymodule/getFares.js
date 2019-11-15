const gtfs = require('gtfs');
const mongoose = require('mongoose')

/**
 * farerulesを元に、mongoDBへ運賃情報を取りに行く
 * 
 * なお、事前に本moduleの呼び出し元でmongoose.connectが必要
 * @param farerules [系統1][系統2]で、各系統内で[fare_id,stop_id,destination_id]が複数入っている
 * @returns fares
 */
let getFares = async(farerules) => {
    // 今テストしているデータの場合、
    // 引数は[系統1の運賃情報群,系統2の運賃情報群]
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
    // modelは'モデル名','Schema名','コレクション名(省略可能)'
    let find = (rule)=>{
        let fare = FareModel.findOne({
            fare_id : rule.fare_id
            },{
                _id : 0,
                fare_id : 1,
                price : 1
            })
        return fare
    }
    const fares = await Promise.all(farerules.map((array) => {
        return Promise.all(array.map((rule) => {
            return find(rule);
        }))
    }))
    mongoose.deleteModel('Fare');
    return fares
}

module.exports = getFares;

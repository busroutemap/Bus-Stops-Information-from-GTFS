
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FareSchema = new Schema({
    fare_id : {
        type : String,
        require : true,
        unique : true
    },
    price : {
        type : Number
    }
});

module.exports = mongoose.model('fare', FareSchema,'fareattributes');
const express = require('express');
const router = express.Router();
const getData = require('./mymodule/getData');
const getDataV2 = require('./v2/getData');
const mongoose = require('mongoose');
// mongooseがグローバルインストールになっている
// ここを変えれば？？？
const config = {
    mongoUrl: 'mongodb://localhost:27017/gtfs',
};
// Fareモデルの参照
const Fare = require('./models/fare');
//---------------------------------------------
const api = async function(req, res, next){
    mongoose.set('useCreateIndex', true);
    mongoose.connect(config.mongoUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    // http://localhost:3000/api/?stop_id="id指定"
    // http://localhost:3000/api/?stop_id=S00525AGC9070001018357H001
    // 敷島公園北
    // 三中前 S00517AGC9070001018357H001
    // 本町 S00436AGC9070001018357H001
    const stop_id = req.query.stop_id;
    // let data = await getData(stop_id);
    let data = await getDataV2(stop_id,Fare);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(data);
}
//---------------------------------------------
// http://localhost:3000/api/
router.get('/', api);

module.exports = router;

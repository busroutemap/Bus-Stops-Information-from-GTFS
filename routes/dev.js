const express = require('express');
const router = express.Router();
// const getGTFS = require('./mymodule/getGTFS');
const getData = require('./mymodule/getData');
const mongoose = require('mongoose');
// mongooseがグローバルインストールになっている
// ここを変えれば？？？
const config = {
    mongoUrl: 'mongodb://localhost:27017/gtfs',
};
//---------------------------------------------
const api = async function(req, res, next){
    mongoose.set('useCreateIndex', true);
    mongoose.connect(config.mongoUrl, {useNewUrlParser: true});
    // http://localhost:3000/dev/?stop_id="id指定"
    // http://localhost:3000/dev/?stop_id=S00525AGC9070001018357H001
    // 敷島公園北
    // 三中前 S00517AGC9070001018357H001
    // 前橋駅3番乗り場
    // 本町 S00436AGC9070001018357H001
    const stop_id = req.query.stop_id;
    // let data = await getGTFS(stop_id);
    let data = await getData(stop_id);
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.send(data);
}
//---------------------------------------------
// apis配列に記述していく順に各ミドルウェアが実行
const apis = [api]
// http://localhost:3000/dev/
router.get('/', apis);

module.exports = router;

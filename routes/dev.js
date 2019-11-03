var express = require('express');
var router = express.Router();
var getGTFS = require('./mymodule/getGTFS');
// var periods = require('./mymodule/makePeriodList');
// var fareLists = require('./mymodule/makeFareList');
// var appSettings = require('./mymodule/appSettings');
//---------------------------------------------
let api = async function(req, res, next){
    mongoose.connect(config.mongoUrl, {useNewUrlParser: true});
    // http://localhost:3000/dev/?stop_id="id指定"
    // http://localhost:3000/dev/?stop_id=S00525AGC9070001018357H001
    // 敷島公園北
    const stop_id = req.query.stop_id;
    res.header('Content-Type', 'application/json; charset=utf-8');
    let data = await getGTFS.getData(stop_id)
    res.send(data);
}
//---------------------------------------------
// apis配列に記述していく順に各ミドルウェアが実行
let apis = [api]
// http://localhost:3000/dev/
router.get('/', apis);

module.exports = router;

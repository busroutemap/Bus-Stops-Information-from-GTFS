// nodeGTFS(MIT Licence)のgithub内解説ページより引用し、解説を加筆
const gtfs = require('gtfs');
const mongoose = require('mongoose');
const config = {
    mongoUrl: 'mongodb://localhost:27017/gtfs',
    agencies: [
        {
            // agency_keyはデータベースに対しGTFSデータを挿入する際、
            // 管理者が付与する、GTFSデータ固有id
            agency_key: 'BSI_sample01',
            // url(インターネット経由)またはpath(PC内)で指定
            url: 'http://loc.bus-vision.jp/gtfs/ryobi/gtfsFeed',
            // path: "/path/to/the/gtfs.zip"
            exclude: [
                'shapes'
            ]
        }
    ]
};

mongoose.connect(config.mongoUrl, {useNewUrlParser: true});

gtfs.import(config)
.then(() => {
    console.log('Import Successful');
    return mongoose.connection.close();
})
.catch(err => {
    console.error(err);
});
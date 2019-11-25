/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
/* eslint-disable indent */
/* eslint-disable linebreak-style */
// import routeArea from './routeArea'
// import rows from './rows'

const fare = {
    props: ['stop'],
    template: `
    <span>{{stop.fare}}円 </span>
    `
};

const period = {
    props: ['stop'],
    template: `
    <span>{{stop.period}}分 </span>
    `
};

// 注:lineは今手抜き
const line = {
    template: `
    <span style="color:red">●</span>
    `
};

const stopName = {
    props: ['stop'],
    template: `
    <span>{{stop.stop_name}}</span>
    `
};

const stopDesc = {
    props: ['stop'],
    template: `
    <span style="color:red">{{stop.stop_desc}}</span>
    `
};


const rows = {
    props: ['stop'],
    // components: {
    //     fare: fare,
    //     period: period,
    //     line: line,
    //     stopName: stopName,
    //     stopDesc: stopDesc
    // },
    // v-showで何かstop.stop_descに値がある場合のみ表示
    // template: `
    // <p>
    // <span>{{stop.fare}}</span>
    // <span>{{stop.period}}</span>
    // <span>{{stop.line}}</span>
    // <span>{{stop.stopName}}</span>
    // <span
    //     v-bind:stop="stop"
    //     v-show="stop.stop_desc">
    // {{stop.stopDesc}}</span>
    // </p>
    // `
};

{/* <period
v-bind:stop="stop"
></period>
<line
v-bind:stop="stop"
></line>
<stopName
v-bind:stop="stop"
></stopName>
<stopDesc
v-bind:stop="stop"
v-show="stop.stop_desc"
></stop_desc>
</p>
<br> */}

const routeInfo = {
    props: ['route'],
    // template: `
    // <p>
    // <ol>
    //     <li>{{route.route_short_name}}</li>
    //     <li>{{route.route_long_name}}</li>
    //     <li>{{route.jp_parent_route_id}}</li>
    //     <li>{{route.agency_key}}</li>
    // </ol>
    // </p>
    // `
};

const routeArea = {
    props: ['route'],
    components: {
        routeInfo: routeInfo,
        rows: rows
    }
};

//---------------------------------------------
let app = new Vue({
    data() {
        return {
            stop_id: '',
            routes: '',
            // eachStops : '',
            // ruleLists : '',
            // periods : ''
        };
    },
    computed: {
        // 1値に依存して動作する系は、本来はここ？
    },
    components: {
        routeArea: routeArea,
    },
    mounted() {
        // 仮に「本町」を指定
        // this.stop_id = 'S00436AGC9070001018357H001';
        // this.getGTFSapi(this.stop_id);
        // this.canvas = this.$refs.canvas;
        // this.context = this.canvas.getContext("2d");
    },
    watch: {
        stop_id: function (val, _oldVal) {
            this.getGTFSapi(val);
        },
        // routes: function (val, _oldVal) {
        //     return this.routes
        // },
    },
    methods: {
        /**
         * APIとやりとりをし、dataを取ってくる
         * @param {*} stop_id
         * @returns (watch中の各値が更新される)
         */
        getGTFSapi:(stop_id)=> {
            const baseURL = 'http://localhost:3000/dev/?stop_id=';
            fetch(baseURL + stop_id)
            .catch((e) => {
                console.log(e);
            })
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                app.routes = myJson;
            });
        }
    }
}).$mount('#view');
//---------------------------------------------

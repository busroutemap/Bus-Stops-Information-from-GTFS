

const rows = {
    name : "rows",
    props: ['stop'],
    template: "#rows"
};

const routeinfo = {
    name : "route-info",
    props: ['route'],
    template: "#route-info"
};

const routearea = {
    name : "route-area",
    props: ['route'],
    template:"#route-area",
    components: {
        "route-info" : routeinfo,
        "rows" : rows
    }
};

//---------------------------------------------
let app = new Vue({
    el : "#view",
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
        "route-area" : routearea,
    },
    mounted() {
        // 仮に「敷島公園北」を指定
        this.stop_id = 'S00525AGC9070001018357H001';
        this.getGTFSapi(this.stop_id);
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
            const baseURL = 'http://localhost:3000/api/?stop_id=';
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
});
//---------------------------------------------

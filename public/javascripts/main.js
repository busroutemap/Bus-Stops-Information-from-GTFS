import routeArea from './routeArea'
//---------------------------------------------
let app = new Vue({
    data(){
        return{
            stop_id : '',
            routes : '',
            eachStops : '',
            ruleLists : '',
            periods : ''
        }
    },
    computed:{
        // 1値に依存して動作する系は、本来はここ？
    },
    components:{
        'routeArea' : routeArea,
    },
    mounted(){
        // 仮に「本町」を指定
        this.stop_id = 'S00436AGC9070001018357H001'
        this.canvas = this.$refs.canvas;
        this.context = this.canvas.getContext("2d");
    },
    watch:{
        stop_id : function(val,oldVal) {
            this.getGTFSapi(val);
        },
        routes : function(val,oldVal){
            this.drawGTFS(val);
        },
        eachStops : function(val,oldVal){
            this.drawGTFS(val);
        },
        ruleLists : function(val,oldVal){
            this.drawGTFS(val);
        },
        periods : function(val,oldVal){
            this.drawGTFS(val);
        }
    },
    methods:{
        /**
         * APIとやりとりをし、dataを取ってくる
         * @param {*} stop_id 
         * @returns (watch中の各値が更新される)
         */
        getGTFSapi(stop_id){
            const baseURL = 'http://localhost:3000/dev/stop_id='
            fetch(baseURL+stop_id)
            .then(response => {
                return response.json();
            })
            .then(myJson => {
                let newData = JSON.stringify(myJson);
                console.log(newData);
                this.routes = newData.routes;
                this.eachStops = newData.eachStops;
                this.ruleLists = newData.ruleLists;
                this.periods = newData.periods;
            });
        }
    }
}).$mount('#view')

//---------------------------------------------



const rows = {
    name : "rows",
    props: ['stop','here_id'],
    template: "#rows"
};

const routeinfo = {
    name : "route-info",
    props: ['route'],
    template: "#route-info"
};

const routearea = {
    name : "route-area",
    props: ['route','here_id'],
    template:"#route-area",
    components: {
        "route-info" : routeinfo,
        "rows" : rows
    },
    methods:{
        exportPDF : (route_id)=>{
            const prop = document.querySelector("#pdf" + route_id);
            html2canvas(prop).then(canvas => {
                const imgdata = canvas.toDataURL();
                const pdfContent = {
                    pageSize: 'A4',
                    pageMargins: [ 40, 60, 40, 60 ],
                    content: [
                        {
                            image : imgdata,
                            fit: [210*2.6, 297*2.6],
                            // width: 100
                        }
                    ]
                };
                // document.getElementById("img" + route_id).src = imgdata;
                pdfMake.createPdf(pdfContent).download("exportData.pdf");
            });
        }
    }
};

//---------------------------------------------
let app = new Vue({
    el : "#view",
    data() {
        return {
            stop_id: '',
            route_id:'', /* 選択されたroute_id */
            routes: '',
            route:''
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
        // this.stop_id = 'S00525AGC9070001018357H001';
        // 61_2は両備バス「大雲寺前」
        // 27_1は両備バス「天満屋」
        this.stop_id='27_1';
    },
    watch: {
        // stop_id: function (val, _oldVal) {
        //     this.getGTFSapi(val);
        // },
        route_id: function (val, _oldVal){
            for (const route of this.routes){
                // valのうち1つ1つ取り出して確認
                if (route.route_id == this.route_id){
                    this.route = route;
                }
            }
        }
    },
    methods: {
        /**
         * APIとやりとりをし、dataを取ってくる
         * @param {*} stop_id
         * @returns (watch中の各値が更新される)
         */
        getGTFSapi:(stop_id)=> {
            const baseURL = 'http://localhost:3000/api/?stop_id=';
            document.getElementById("status").textContent = "データ取得中...";
            fetch(baseURL + stop_id)
            .catch((e) => {
                console.log(e);
                document.getElementById("status").textContent = e;
            })
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                app.routes = myJson;
                document.getElementById("status").textContent = "取得完了!";
            });
        },
    }
});
//---------------------------------------------

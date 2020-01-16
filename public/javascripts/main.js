

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
    },
    methods:{
        exportPDF : (route_id)=>{
            // まずidを振る
            let ra = document.getElementsByClassName("ra");
            for(let i = 0; i < app.routes.length; i++){
                ra.item(i).setAttribute("id",app.routes[i].route_id);
            }
            //---------------------------------------------
            const prop = document.querySelector("#" + route_id);
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
        },
    }
});
//---------------------------------------------


// function downloadImage() {
//     html2canvas(document.body, {
//         onrendered: function(canvas) {
//             // var dataURI = canvas.toDataURL();
//             var pdf = new jsPDF();
//             // 横幅をぴったり合わせたかったので横幅を取得して指定してます
//             var width = pdf.internal.pageSize.width;
//             pdf.addImage(canvas, 'JPEG', 0, 0, width, 0);
//             pdf.save('test.pdf');
//         }
//     });
// }

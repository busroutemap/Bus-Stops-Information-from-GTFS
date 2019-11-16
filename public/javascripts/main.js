
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
    mounted(){
        // 仮に「本町」を指定
        this.stop_id = 'S00436AGC9070001018357H001'
        this.canvas = this.$refs.canvas;
        this.context = this.canvas.getContext("2d");
    },
    watch:{
        stop_id : function(val,oldVal) {
            this.getJSON(val);
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
        },
        getJSON(filename){
            var req = new XMLHttpRequest();
            // XMLHttpRequest オブジェクトを生成する
            req.open("GET", filename, true);
            // HTTPメソッドとアクセスするサーバーのURLを指定
            req.overrideMimeType("text/plain; charset=UTF-8");
            req.addEventListener("loadend", function(e){
                if(req.status === 0)
                {
                    // エラー時の処理
                    // 今は何もなし
                }
                else
                {
                    // 非エラー時の処理
                    app.contents = JSON.parse(req.responseText);
                    // appはこのVueインスタンスのこと
                    // thisだとなぜか変化なし
                }
            });
            req.send(null);
            // 実際にサーバーへリクエストを送信
        },
        draw(data){
            let ctx = this.context.canvas.getContext("2d");
            ctx.clearRect(0, 0, 210, 297)
            // 引数のpxをlinewidthに
            ctx.font = "10pt Arial";
            for(var i=0;i<data.length;i++){
                let textbox = data[i]["stop_id"] + 'は' + data[i]["stop_name"];
                ctx.fillText(textbox, 30, (i+1)*50, 210);
                ctx.strokeStyle = 'rgb(0, 0, 255)';
                ctx.strokeRect(5, (i+1)*50-10, 20, 20);
            };
            // この設定で描画
            ctx.stroke();
            // 内部的にはここで描画内容を保存しておく
            ctx.save();
        },
        saveImg(){
            // 内部的に保存したデータをここでimgに移す
            var dataURL = this.canvas.toDataURL('image/png');
            var img = this.$refs.img;
            img.src = dataURL;
        }
    }
}).$mount('#listview')

//---------------------------------------------

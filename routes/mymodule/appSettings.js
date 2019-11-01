//---------------------------------------------
// NOTE : APIに書くことではないかも？
/* let conVue = new Vue({
    data(){
        return{
            stop_id : ''
        }
    },
    mounted(){
        this.canvas = this.$refs.canvas;
        this.context = this.canvas.getContext("2d");
    },
    watch : {
        stop_id : function(val,oldVal){
            this.reqAPI(val);
        }
    },
    methods : {
        reqAPI(stop_id){
            let baseURL = 'http://localhost:3000/dev/?stop_id=' + val;
            const req = new XMLHttpRequest();
            req.open("GET", baseURL, true);
            req.overrideMimeType("text/plain; charset=UTF-8");
            req.addEventListener("loadend", function(e){
                if(req.status === 0)
                {
                    // エラー時の処理
                }
                else
                {
                    // 非エラー時の処理
                }
            });
            req.send(null);
        },
        // drawCanvas(data){
        //     let ctx = this.context.canvas.getContext("2d");
        //     ctx.clearRect(0, 0, 210, 297)
        //     // 引数のpxをlinewidthに
        //     ctx.font = "10pt Arial";
        //     for(var i=0;i<data.length;i++){
        //         let textbox = data[i]["stop_id"] + 'は' + data[i]["stop_name"];
        //         ctx.fillText(textbox, 30, (i+1)*50, 210);
        //         ctx.strokeStyle = 'rgb(0, 0, 255)';
        //         ctx.strokeRect(5, (i+1)*50-10, 20, 20);
        //     };
        //     ctx.stroke();
        //     ctx.save();
        // },
    }
})
// .$mount('#listview') */
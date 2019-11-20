
const fare = Vue.components('fare',{
    props : ['stop'],
    template : ```
    <span>{{stop.fare}}円 </span>
    ```
})

const period = Vue.components('fare',{
    props : ['stop'],
    template : ```
    <span>{{stop.period}}分 </span>
    ```
})

// 注:lineは今手抜き
const line = Vue.components('line',{
    template : ```
    <span style="color:red">●</span>
    ```
})

const stopName = Vue.components('stopName',{
    props : ['stop'],
    template : ```
    <span>{{stop.stop_name}}</span>
    ```
})

const stopDesc = Vue.components('stopDesc',{
    props : ['stop'],
    template : ```
    <span style="color:red">{{stop.stop_desc}}</span>
    ```
})


const rows = Vue.components('rows',{
    props : ['stop'],
    components : {
        'fare' : fare,
        'period' : period,
        'line' : line,
        'stopName' : stopName,
        'stopDesc' : stopDesc
    },
    // 面倒なので、ここまでコンポーネント化しないでも良い説
    // {{stop.fare}}{{stop.period}}など
    template : ```
    <p>
    <fare
        v-bind:stop="stop"
    ></fare>
    <period
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
        v-show="!(stop.stop_desc=='')"
    ></stop_desc>
    </p>
    <br>
    ```
})

export default {
    components: {
        rows
    },
}
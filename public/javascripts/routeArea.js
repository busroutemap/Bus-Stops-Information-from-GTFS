import rows from './rows'

const routeInfo = Vue.components('routeInfo',{
    props : ['route'],
    template : ```
    <p>
    <ol>
        <li>{{route.route_short_name}}</li>
        <li>{{route.route_long_name}}</li>
        <li>{{route.jp_parent_route_id}}</li>
        <li>{{route.agency_key}}</li>
    </ol>
    </p>
    ```
})

const routeArea = Vue.components('routeArea',{
    props : ['route','rows'],
    components:{
        'routeInfo' : routeInfo,
        'rows' : rows
    },
    template : ```
    <routeInfo
        v-bind:route="route"
    ></routeInfo>
    <rows
        v-for="stop in route.stops"
        v-bind:key="stop.stop_id"
    ></rows>
    ```
})

export default {
    components: {
        routeArea
    },
}
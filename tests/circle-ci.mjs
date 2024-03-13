import { Exporter } from '../src/index.mjs'

const routes = [
    {
        'routeId': 'myRoute',
        'routeType': 'get',
        'requestHeaders': { 'authentification': 'Bearer 123' },
        'requestUrl': 'http://localhost:3000/get',
        'concurrentRequestsPerLoop': 5,
        'delayInMsPerLoop': 5000
    }
]

const exporter = new Exporter()
exporter.setRoutes( { routes } )
const result = exporter.sendData( { 
    'routeId': 'myRoute', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )

if( result === true ) {
    console.log( 'Success' )
    process.exit( 0 )
} else {
    console.log( 'Failure' )
    process.exit( 1 )
}
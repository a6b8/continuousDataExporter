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

const exporter = new Exporter( { 'silent': false, 'emitEvents': true } )
exporter.setRoutes( { routes } )
exporter.sendData( { 
    'routeId': 'myRoute', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )

exporter.on(
    'exporterRouteLoopUpdate', 
    ( eventResponse ) => {
        exporter.printRouteStatus( {
            'symbol': `📅`, 
            'operation': 'Event',
            eventResponse
        } )
        console.log( 'Success' )
        process.exit( 0 )
    } 
)


const delay = 5000
await new Promise( resolve => setTimeout( resolve, delay ) )
console.log( 'Event not received.' )
process.exit( 1 )
import { Exporter } from '../src/index.mjs'

const routes = [
    {
        'routeId': 'myGet',
        'routeType': 'get',
        'requestUrl': 'http://localhost:3000/get',
        'requestHeaders': { 'authentification': 'Bearer 123' },
        'concurrentRequestsPerLoop': 5,
        'delayInMsPerLoop': 5000
    }
]

const exporter = new Exporter()
exporter.setRoutes( { routes } )
exporter.sendData( { 
    'routeId': 'myGet', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )
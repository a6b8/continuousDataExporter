import { Exporter } from '../src/index.mjs'

const routes = [
    {
        'routeId': 'myGet',
        'routeType': 'get',
        'requestUrl': 'http://localhost:3000/get',
        'requestHeaders': { 'authentification': 'Bearer 123' },
        'concurrentRequestsPerLoop': 5,
        'delayInMsPerLoop': 5000
    },
    {
        'routeId': 'myFile',
        'routeType': 'file',
        'destinationFolder': 'tests/output/',
        'destinationFileName': 'test-{{id}}-{{known}}-{{unknown}}--{{ex_unixTime}}.json',
        'concurrentRequestsPerLoop': 5,
        'delayInMsPerLoop': 5000
    }
]

const exporter = new Exporter( { 'silent': false, 'emitEvents': true })
exporter.setRoutes( { routes } )

/*
// 
exporter.sendData( { 
    'routeId': 'myGet', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )
*/

exporter.sendData( { 
    'routeId': 'myFile', 
    'obj': { 
        'id': '1', 
        'known': 'knownKey' 
    }
} )
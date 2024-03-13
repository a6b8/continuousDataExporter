import { Exporter, sendDemoData } from '../src/index.mjs'

const config = {
    'routes': [
        {
            'routeId': 'myGet',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 5000
        }
        ,{
            'routeId': 'myPost',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 2000
        }
        ,{
            'routeId': 'myLocal',
            'routeType': 'local',
            'destinationFolder': 'output/key/',
            'destinationFileName': 'out.txt',
            'concurrentRequestsPerLoop': 3,
            'delayInMsPerLoop': 3000
        }
    ],
    'keys': [
        [ 'myGet', { chunkSize: 5, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'myPost', { chunkSize: 2, objSize: 10, delayInMsPerChunk: 1500 } ],
        [ 'myLocal', { chunkSize: 7, objSize: 8, delayInMsPerChunk: 2000 } ]
    ]
}


// start first node tests/0-start-server.mjs
//
//

const silent = true
const exporter = new Exporter( silent )
exporter.setRoutes( { 'routes': config['routes'] } )
await sendDemoData( { exporter, 'keys': config['keys'] } )

import { Exporter, sendDemoData } from '../src/index.mjs'

const config = {
    'routes': [
        {
            'routeId': 'myGetAuthTrue',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 500
        }
        ,{
            'routeId': 'myGetAuthFalse',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authorization': 'Bearer abc' },
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 1000
        }
        ,{
            'routeId': 'myGetNoAuth',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': {},
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 1500
        }
        ,{
            'routeId': 'myPostAuthTrue',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 2000
        }
        ,{
            'routeId': 'myPostAuthFalse',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authorization': 'Bearer abc' },
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 2500
        }
        ,{
            'routeId': 'myPostNoAuth',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': {},
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 3000
        }
        ,{
            'routeId': 'myLocal',
            'routeType': 'local',
            'destinationFolder': 'output/key/',
            'destinationFileName': 'out.txt',
            'concurrentRequestsPerLoop': 3,
            'delayInMsPerLoop': 1000
        }
    ],
    'keys': [
        [ 'myGetAuthTrue', { chunkSize: 10, objSize: 20, delayInMsPerChunk: 1000 } ],
        [ 'myGetAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'myGetNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'myPostAuthTrue', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'myPostAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'myPostNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'wrongRouteId', { chunkSize: 1, objSize: 1, delayInMsPerChunk: 1000 } ]
        // [ 'myGet', { chunkSize: 10, objSize: 9, delayInMsPerChunk: 1000 } ],
        // [ 'myPost', { chunkSize: 2, objSize: 10, delayInMsPerChunk: 1500 } ],
        // [ 'myLocal', { chunkSize: 7, objSize: 8, delayInMsPerChunk: 2000 } ]
    ]
}


// start first node tests/0-start-server.mjs
//
//

const silent = false
const exporter = new Exporter( silent )
exporter.setRoutes( { 'routes': config['routes'] } )
await sendDemoData( { exporter, 'keys': config['keys'] } )

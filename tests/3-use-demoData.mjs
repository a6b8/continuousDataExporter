import { Exporter, sendDemoData } from '../src/index.mjs'
import EventEmitter from 'events'


const config = {
    'routes': [
        {
            'routeId': 'myGetAuthTrue',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 10
        }
        ,{
            'routeId': 'myGetAuthFalse',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authorization': 'Bearer abc' },
            'concurrentRequestsPerLoop': 2,
            'delayInMsPerLoop': 10
        }
        ,{
            'routeId': 'myGetNoAuth',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': {},
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 10
        }
        ,{
            'routeId': 'myPostAuthTrue',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authorization': 'Bearer 123' },
            'concurrentRequestsPerLoop': 5,
            'delayInMsPerLoop': 20
        }
        ,{
            'routeId': 'myPostAuthFalse',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authorization': 'Bearer abc' },
            'concurrentRequestsPerLoop': 2,
            'delayInMsPerLoop': 25
        }
        ,{
            'routeId': 'myPostNoAuth',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': {},
            'concurrentRequestsPerLoop': 1,
            'delayInMsPerLoop': 30
        }
        ,{
            'routeId': 'myLocal',
            'routeType': 'local',
            'destinationFolder': 'output/key/',
            'destinationFileName': 'out.txt',
            'concurrentRequestsPerLoop': 3,
            'delayInMsPerLoop': 10
        }
    ],
    'keys': [
        [ 'myGetAuthTrue', { chunkSize: 10, objSize: 200, delayInMsPerChunk: 100 } ],
        [ 'myGetAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 100 } ],
        [ 'myGetNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 100 } ],
        [ 'myPostAuthTrue', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 100 } ],
        [ 'myPostAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 100 } ],
        [ 'myPostNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 100 } ],
        [ 'wrongRouteId', { chunkSize: 1, objSize: 1, delayInMsPerChunk: 100 } ]
        // [ 'myGet', { chunkSize: 10, objSize: 9, delayInMsPerChunk: 1000 } ],
        // [ 'myPost', { chunkSize: 2, objSize: 10, delayInMsPerChunk: 1500 } ],
        // [ 'myLocal', { chunkSize: 7, objSize: 8, delayInMsPerChunk: 2000 } ]
    ]
}


// start first node tests/0-start-server.mjs
//
//

const eventEmitter = new EventEmitter()


const silent = false
const exporter = new Exporter( silent )

exporter.on(
    'exporterResponse', 
    ( data ) => {
        const state = data['responses'].map( a => a['status'] ).join( ', ' )
        console.log( `🛎️  EVENT: ${state}`)
    } 
)


exporter.setRoutes( { 'routes': config['routes'] } )
await sendDemoData( { exporter, 'keys': config['keys'] } )

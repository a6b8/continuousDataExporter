import { Exporter, sendDemoData } from '../src/index.mjs'

const config = {
    'routes': [
        {
            'name': 'get',
            'headers': { 'authentification': 'Bearer 123' },
            'type': 'get',
            'url': 'http://localhost:3000/get',
            'concurrentRequests': 5,
            'delayInMs': 5000
        }
        ,{
            'name': 'post',
            'headers': { 'authentification': 'Bearer abc' },
            'type': 'post',
            'url': 'http://localhost:3000/post',
            'concurrentRequests': 1,
            'delayInMs': 2000
        }
        ,{
            'name': 'local',
            'type': 'local',
            'outFolder': '/out',
            'fileName': 'out.txt',
            'concurrentRequests': 3,
            'delayInMs': 3000
        }
    ],
    'keys': [
        [ 'get', { chunkSize: 5, objSize: 9, delayInMsPerChunk: 1000 } ],
        [ 'post', { chunkSize: 2, objSize: 10, delayInMsPerChunk: 1500 } ],
        [ 'local', { chunkSize: 7, objSize: 8, delayInMsPerChunk: 2000 } ]
    ]
}


const exporter = new Exporter( false )
exporter.setRoutes( { 'routes': config['routes'] } )
await sendDemoData( { exporter, 'keys': config['keys'] } )

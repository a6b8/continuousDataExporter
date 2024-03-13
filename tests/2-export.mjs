import { Exporter } from './../src/index.mjs'


const ex = new Exporter() 
ex.setRoutes( { 
    'routes': [
        {
            'routeId': 'get',
            'routeType': 'get',
            'requestUrl': 'http://localhost:3000/get',
            'requestHeaders': { 'authentification': 'Bearer 123' },
            'concurrentRequests': 1,
            'delayInMs': 1000
        }
/*
        ,{
            'routeId': 'post',
            'routeType': 'post',
            'requestUrl': 'http://localhost:3000/post',
            'requestHeaders': { 'authentification': 'Bearer abc' },
            'concurrentRequests': 3,
            'delayInMs': 2000
        }
        ,{
            'routeId': 'local',
            'routeType': 'local',
            'outFolder': '/out',
            'fileName': 'out.txt',
            'concurrentRequests': 3,
            'delayInMs': 3000
        }
*/
    ]
} )



const cmds = [
    {
        'routeId': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeId': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeId': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeId': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    }
]

function delay( ms ) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

cmds.forEach( cmd => {
    ex.sendData( cmd )
} )
await delay( 9000 )

cmds.forEach( cmd => {
    ex.sendData( cmd )
} )
await delay( 3000 )

cmds.forEach( cmd => {
    ex.sendData( cmd )
} )
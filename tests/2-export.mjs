import { Exporter } from './../src/index.mjs'


const ex = new Exporter() 
ex.setRoutes( { 
    'routes': [
        {
            'name': 'get',
            'headers': { 'authentification': 'Bearer 123' },
            'type': 'get',
            'url': 'http://localhost:3000/get',
            'concurrentRequests': 1,
            'delayInMs': 1000
        }
/*
        ,{
            'name': 'post',
            'headers': { 'authentification': 'Bearer abc' },
            'type': 'post',
            'url': 'http://localhost:3000/post',
            'concurrentRequests': 3,
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
*/
    ]
} )



const cmds = [
    {
        'routeName': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeName': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeName': 'get',
        'obj': { 'abc': 123, 'def': 456 }
    },
    {
        'routeName': 'get',
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
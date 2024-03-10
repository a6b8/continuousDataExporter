import { Exporter } from './../src/index.mjs'


const ex = new Exporter() 
ex.setRoutes( { 
    'routes': [
        {
            'name': 'get',
            'headers': { 'authentification': 'Bearer 123' },
            'requestType': 'get',
            'url': 'http://localhost:3000/get',
            'concurrentRequests': 3,
            'delayInMs': 1000
        },

        {
            'name': 'post',
            'headers': { 'authentification': 'Bearer abc' },
            'requestType': 'post',
            'url': 'http://localhost:3000/post',
            'concurrentRequests': 3,
            'delayInMs': 2000
        },
        {
            'name': 'local',
            'requestType': 'local',
            'outFolder': '/out',
            'fileName': 'out.txt',
            'concurrentRequests': 3,
            'delayInMs': 3000
        }
    ]
} )
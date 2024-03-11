import { Exporter } from '../src/index.mjs'

const routes = [
    {
        'name': 'myRoute',
        'headers': { 'authentification': 'Bearer 123' },
        'type': 'get',
        'url': 'http://localhost:3000/get',
        'concurrentRequests': 5,
        'delayInMs': 5000
    }
]

const exporter = new Exporter()
exporter.setRoutes( { routes } )
exporter.sendData( { 
    'routeName': 'myRoute', 
    'obj': { 'id': '1', 'foo': 'bar' }
} )
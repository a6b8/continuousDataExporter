import { printStatus } from './../index.mjs'


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
        [ 'myGetAuthTrue', { chunkSize: 10, objSize: 200, delayInMsPerChunk: 500 } ],
        [ 'myGetAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 500 } ],
        [ 'myGetNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 500 } ],
        [ 'myPostAuthTrue', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 500 } ],
        [ 'myPostAuthFalse', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 500 } ],
        [ 'myPostNoAuth', { chunkSize: 1, objSize: 9, delayInMsPerChunk: 500 } ],
        [ 'wrongRouteId', { chunkSize: 1, objSize: 1, delayInMsPerChunk: 500 } ]
    ]
}


function dataFromType( type, { chunkSize, objSize, delayInMsPerChunk } ) {
    let id = 0
    const chunks = new Array( chunkSize )
        .fill( 0 )
        .map( ( _, index ) => {
            const objs = new Array( objSize )
                .fill( 0 )
                .map( ( _, rindex ) => {
                    const struct = {
                        'routeId': type,
                        'obj': { id, rindex, index, type }
                    }
                    id++
                    return struct
                } )

            const struct = {
                delayInMsPerChunk,
                objs
            }

            return struct
        } )

    return chunks
}


function getDemoDataSorted( keys ) {
    if( keys === undefined ) {
        keys = [
            [ 'get', { chunkSize: 5, objSize: 4, delayInMsPerChunk: 1000 } ],
            [ 'post', { chunkSize: 2, objSize: 6, delayInMsPerChunk: 3000 } ],
            [ 'local', { chunkSize: 7, objSize: 2, delayInMsPerChunk: 2000 } ]
        ]
    }

    const result = keys
        .reduce( ( acc, a, index ) => {
            const [ key, value ] = a
            acc[ key ] = dataFromType( key, value )
            return acc
        }, {} )

    return result
}


function getDemoDataUnsorted( keys ) {
    const demoData = getDemoDataSorted( keys )
    const types = Object.keys( demoData )
    const maxLength = Object
        .values( demoData )
        .reduce( ( acc, arr ) => Math.max( acc, arr.length ), 0 )

    const result = new Array( maxLength )
        .fill( 0 )
        .reduce( ( acc, a, index ) => {
            const n = types
                .forEach( type => {
                    if( demoData[ type ][ index ] ) {
                        const item = {
                            type,
                            ...demoData[ type ][ index ]
                        }
                        acc.push( item )
                    }
                } )
            return acc
        }, [] )

    return result
}


async function sendDemoData( { exporter, keys, silent } ) {
    const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
    const demoData = getDemoDataUnsorted( keys )

    if( !silent ) {
        printStatus( { symbol: '🚀', operation: 'Start', routeId: 'Script' } )
    }

    await demoData
        .reduce( async( acc, a, index ) => {
            const prom = await acc
            const { delayInMsPerChunk, objs } = a
            await delay( delayInMsPerChunk )

            if( !silent ) {
                printStatus( { 
                    symbol: '🚀', 
                    operation: 'Send', 
                    routeId: `Chunk ${index + 1} of ${demoData.length}`
                } )
            }

            const result = objs
                .map( a => {
                    const { routeId, obj } = a
                    exporter.sendData( { routeId, obj } )
                    return true
                } )
        }, Promise.resolve( [] ) )

    if( !silent ) {
        printStatus( { symbol: '🏁', operation: 'Finished', routeId: 'Script' } )
    }

    return true
}


function getDemoRoutes() {
    return config['routes']
}

function getDemoKeys() {
    return config['keys']
}


export { getDemoDataUnsorted, getDemoDataSorted, sendDemoData, getDemoRoutes, getDemoKeys }
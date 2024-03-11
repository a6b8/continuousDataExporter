function dataFromType( type, { chunkSize, objSize, delayInMsPerChunk } ) {
    let id = 0
    const chunks = new Array( chunkSize )
        .fill( 0 )
        .map( ( _, index ) => {
            const objs = new Array( objSize )
                .fill( 0 )
                .map( ( _, rindex ) => {
                    const struct = {
                        'routeName': type,
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


async function sendDemoData( { exporter, keys } ) {
    const demoData = getDemoDataUnsorted( keys )
    const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
    console.log( 'Start submitting...' )
    await demoData
        .reduce( async( acc, a, index ) => {
            const prom = await acc
            const { delayInMsPerChunk, objs } = a
            await delay( delayInMsPerChunk )
            const result = objs
                .map( a => {
                    const { routeName, obj } = a
                    exporter.sendData( { routeName, obj } )
                    return true
                } )
        }, Promise.resolve( [] ) )

    console.log( 'All submitted' )
    return true
}



export { getDemoDataUnsorted, getDemoDataSorted, sendDemoData  }
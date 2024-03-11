import { URL } from 'url'


function printMessages( { messages=[], comments=[] } ) {
    let panic = false
    const n = [
        [ comments, 'Comment', false ],
        [ messages, 'Message', true ]
    ]
        .forEach( ( a, index ) => {
            const [ msgs, headline, stop ] = a
            msgs
                .forEach( ( msg, rindex, all ) => {
                    rindex === 0 ? console.log( `\n${headline}${all.length > 1 ? 's' : ''}:` ) : ''
                    console.log( `  - ${msg}` )
                    if( ( all.length - 1 ) === rindex ) {
                        stop === true ? panic = true : ''
                    }
                } )
        } )

    if( panic === true ) {
        throw new Error()
    }

    return true
}


function printConsole( { first, second } ) {
    if( first !== undefined ) {
        const space = new Array( 25 - first.length ).fill( ' ' ).join( '' )
        process.stdout.write( `${first}${space}` )
    }

    if( second !== undefined ) {
        const greenColor = '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log( greenColor + second + resetColor )
    }
} 



function isValidUrl( str ) {
    try {
        new URL( str )
        return true
    } catch( error ) {
        return false
    }
}


export { printMessages, isValidUrl, printConsole }
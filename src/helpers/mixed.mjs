import { URL } from 'url'
import { config } from './../data/config.mjs'


function printMessages( { messages=[], comments=[], silent } ) {
    const n = [
        [ comments, 'Comment', false ],
        [ messages, 'Message', true ]
    ]
        .forEach( ( a, index ) => {
            const [ msgs, headline, stop ] = a

            if( silent === true && headline === 'Comment') {
                return true
            }

            msgs
                .forEach( ( msg, rindex, all ) => {
                    rindex === 0 ? console.log( `\n${headline}${all.length > 1 ? 's' : ''}:` ) : ''
                    console.log( `  - ${msg}` )
                    if( ( all.length - 1 ) === rindex ) {
                        if( stop === true ) {
                            throw new Error("")
                        }
                    }
                } )
        
            if( headline === 'Comment' && msgs.length !== 0 ) {
                console.log( "Disable comments by setting the first constructor variable 'silent' to 'true'." )
            }
        } )

    return true
}


function printConsole( { first, second } ) {
    if( first !== undefined ) {
        const n = 30 - first.length > 0 ? 30 - first.length : 0
        const space = new Array( n ).fill( ' ' ).join( '' )
        process.stdout.write( `${first}${space}` )
    }

    if( second !== undefined ) {
        const greenColor = '\x1b[32m';
        const resetColor = '\x1b[0m';
        console.log( greenColor + second + resetColor )
    }
} 


function getSpace( length, str ) {
    const l = length - `${str}`.length
    const spacer = ( l > -1 ) ? new Array( l ).fill( ' ' ).join( '' ) : ''
    return spacer
}


function printStatus( { symbol, operation, routeId }) { 
    const line = [ 
        `${symbol} ${operation}`,
        `${routeId}`,
        ``,
        ``,
        ``
    ]
        .map( ( str, index ) => {
            const [ maxLength, alignment ] = config['console']['table'][ index ]
            const spacer = ( maxLength !== null ) ? getSpace( maxLength, str ) : ''
            const result = alignment === 'right' ? `${spacer}${str}` : `${str}${spacer}`
            return `${result}`
        } )
        .join( ' | ' )

    console.log( line )
    return true
}


export { printMessages, printConsole, getSpace, printStatus }
import fs from 'fs'
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


function isValidUrl( str ) {
    try {
        new URL( str )
        return true
    } catch( error ) {
        return false
    }
}


export { printMessages, isValidUrl }
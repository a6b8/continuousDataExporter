import { printMessages, isValidUrl } from './../helpers/mixed.mjs'
import { config } from './../data/config.mjs'


class Exporter {
    #config
    #state


    constructor() {
        this.#config = config
        this.#state = {}

        return true
    }


    setRoutes( { routes } ) {
        const [ messages, comments ] = this.#validateRoutes( { routes } )
        printMessages( { messages, comments } )

        return true
    }


    #validateRoutes( { routes } ) {
        const messages = []
        const comments = []

        if( routes === undefined ) {
            messages.push( `No routes defined.` )
        } else if( Array.isArray( routes ) === false ) {
            messages.push( `Routes must be an array.` )
        } else if( routes.length === 0 ) {
            messages.push( `No routes defined.` )
        } else {
            const validKeys = [ 
                [ 'name', 'string' ], 
                [ 'requestType', 'string' ],
                // [ 'concurrentRequests', 'number'], 
                // [ 'delayInMs', 'number' ]
            ]
            routes.forEach( ( route, index ) => {
                if( !( typeof route === 'object' && route !== null ) ) {
                    messages.push( `Route at index ${index} is not an object.` )
                } else {
                    validKeys.forEach( ( [ key, type ] ) => {
                        if( route[ key ] === undefined ) {
                            messages.push( `Route at index ${index} is missing key ${key}.` )
                        } else if( typeof route[ key ] !== type ) {
                            messages.push( `Route at index ${index} is not type of '${type}'.` )
                        }
                    } )
                }
            } )
        }

        if( messages.length !== 0 ) {
            return [ messages, comments ]
        }

        routes.forEach( ( route, index ) => {
            if( route['name'] === 'get' || route['name'] === 'post' ) {
                if( route['url'] === undefined ) {
                    messages.push( `Route at index ${index} is missing key 'url'.` )
                } else if( typeof route['url'] !== 'string' ) {
                    messages.push( `Route at index ${index} is not type of 'string'.` )
                } else if( !isValidUrl( route['url'] ) ) {
                    messages.push( `Route at index ${index} has an invalid URL.` )
                }

                if( route['headers'] === undefined ) {
                    messages.push( `Route at index ${index} has no headers.` )
                } else if( typeof route['headers'] !== 'object' ) {
                    messages.push( `Route at index ${index} has headers that are not an object.` )
                } else {
                    const keys = Object.keys( route['headers'] )
                    keys.forEach( key => {
                        if( typeof route['headers'][ key ] !== 'string' ) {
                            messages.push( `Route at index ${index} has a header with key '${key}' that is not a string.` )
                        }
                    } )
                }
            } else if( route['name'] === 'local' ) {
                if( route['outFolder'] === undefined ) {
                    messages.push( `Route at index ${index} is missing key 'outFolder'.` )
                } else if( typeof route['outFolder'] !== 'string' ) {
                    messages.push( `Route at index ${index} is not type of 'string'.` )
                } else if( !this.#config['validation']['folder']['regex'].test( route['outFolder'] ) ) {
                    messages.push( `Route at index ${index} has an invalid outFolder.` )
                }

                if( route['fileName'] === undefined ) {
                    messages.push( `Route at index ${index} is missing key 'fileName'.` )
                } else if( typeof route['fileName'] !== 'string' ) {
                    messages.push( `Route at index ${index} is not type of 'string'.` )
                } else if( !this.#config['validation']['fileName']['regex'].test( route['fileName'] ) ) {
                    messages.push( `Route at index ${index} has an invalid fileName.`)
                }
            } else {
                messages.push( `Route at index ${index} has an invalid name. Use 'get', 'post' or 'local'.` )
            }
        } )

        return [ messages, comments ]
    }

}


export { Exporter }
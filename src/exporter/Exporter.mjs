import { printMessages, isValidUrl, printConsole } from './../helpers/mixed.mjs'
import { config } from './../data/config.mjs'
import axios from 'axios'


class Exporter {
    #config
    #state
    #queue
    #silent


    constructor( silent=false ) {
        this.#silent = silent
        this.#config = config
        this.#state = {
            'routes': []
        }

        return true
    }


    sendData( { routeName, obj } ) {
        const [ messages, comments ] = this.#validateSendData( { routeName, obj } )
        printMessages( { messages, comments } )

        this.#queue[ routeName ]['queue'].push( obj )
        this.#queue[ routeName ]['nonceSum']++
        if( !this.#queue[ routeName ]['running'] ) {
            !this.#silent ? printConsole( { 'first': `Route ${routeName}`, 'second': `start` } ) : ''
            this.#queue[ routeName ]['running'] = true
            this.#startSending( { 'type': this.#queue[ routeName ]['type'], routeName } )
                .then( a => {
                    !this.#silent ? printConsole( { 'first': `Route ${routeName}`, 'second': `end` } ) : ''
                } )
        }

        return true
    }


    async #startSending( { type, routeName } ) {
        const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
        const { delayInMs, concurrentRequests } = this.#queue[ routeName ]

        while( this.#queue[ routeName ]['running'] ) {
            const result = this.#queue[ routeName ]['queue'].slice( 0, concurrentRequests )
            this.#queue[ routeName ]['queue'].splice( 0, concurrentRequests )

            this.#queue[ routeName ]['nonce'] += result.length
            let second = ''
            second += `${this.#queue[ routeName ]['nonce']}`
            second += `/`
            second += `${this.#queue[ routeName ]['nonceSum']} `
            second += `${JSON.stringify( result.map( a => a['id'] ) )}`

            printConsole( { 
                'first': `  ${routeName}`, 
                second
            } )

            await delay( delayInMs )

            if( this.#queue[ routeName ]['queue'].length === 0 ) {
                this.#queue[ routeName ]['running'] = false
            }
        }

        return true
    }


    setRoutes( { routes, obj } ) {
        const [ messages, comments ] = this.#validateRoutes( { routes } )
        printMessages( { messages, comments } )

        this.#queue = routes
            .reduce( ( acc, a, index ) => {
                acc[ a['name'] ] = { 
                    ...a, 
                    'queue': [], 
                    'running': false, 
                    'nonce': 0,
                    'nonceSum': 0
                }
                delete acc[ a['name'] ]['name']
                return acc
            }, {} )

        return true
    }


    async #postRequest() {
        console.log( 'Sending POST Request' )
        const msg = this.#state['msg']
        const response = await axios.post( `${this.#state['url']}/post`, msg )
        console.log( 'Response:', response.data )
        return response
    }


    async #getRequest( { routeName, obj } ) {
        console.log( 'Sending GET Request URL' )
        const msg = this.#state['msg']
        const response = await axios.get( `${this.#state['url']}/get`, { 'params': msg } )
        console.log( 'Response:', response.data )
        return response
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
                [ 'type', 'string' ],
                [ 'concurrentRequests', 'number'], 
                [ 'delayInMs', 'number' ]
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
            if( route['type'] === 'get' || route['type'] === 'post' ) {
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
            } else if( route['type'] === 'local' ) {
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

        if( messages.length !== 0 ) {
            return [ messages, comments ]
        }

        const names = Object
            .entries( 
                routes
                    .map( a => a['name'] )
                    .reduce( ( acc, a, index ) => {
                        if( !Object.hasOwn( acc, a ) ) {
                            acc[ a ] = 1
                        } else {
                            acc[ a ]++
                        }
                        return acc
                    }, {} )
            )
            .filter( ( a, index ) => a[ 1 ] > 1 )
            .forEach( ( a, index ) => {
                messages.push( `Route name '${a[ 0 ]}' is used more than once.` )
            } )

        return [ messages, comments ]
    }


    #validateSendData( { routeName, obj } ) {
        const messages = []
        const comments = []

        if( routeName === undefined ) {
            messages.push( `Route name is missing.` )
        } else if( typeof routeName !== 'string' ) {
            messages.push( `Route name is not type of 'string'.` )
        } else if( this.#queue[ routeName ] === undefined ) {
            messages.push( `Route name is not defined.` )
        }

        if( messages.length !== 0 ) {
            return [ messages, comments ]
        }

        if( obj === undefined ) {
            messages.push( `Object is missing.` )
        } else if( typeof obj !== 'object' ) {
            messages.push( `Object is not type of 'object'.` )
        } else if( Object.keys( obj ).length === 0 ) {
            messages.push( `Object is empty.` )
        }

        return [ messages, comments ]
    }

}


export { Exporter }
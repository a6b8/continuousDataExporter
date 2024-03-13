import { printMessages, isValidUrl, printConsole } from './../helpers/mixed.mjs'
import { config } from './../data/config.mjs'
import axios from 'axios'
import EventEmitter from 'events'


class Exporter extends EventEmitter {
    #config
    #queue
    #silent
    #state



    constructor( silent=false, emitEvents=true ) {
        super()
        this.#silent = silent
        this.#config = config

        this.#state = {
            'queueIsReady': false
        }

    }


    setRoutes( { routes } ) {
        // const [ messages, comments ] = this.#validateRoutes( { routes } )
        const [ messages, comments ] = this.#validateRoutes( { routes } )
        printMessages( { messages, comments } )

        this.#queue = routes
            .reduce( ( acc, a, index ) => {
                acc[ a['routeId'] ] = { 
                    ...a, 
                    'queue': [], 
                    'running': false, 
                    'nonce': 0,
                    'nonceSum': 0,
                    'count': 0
                }
                delete acc[ a['routeId'] ]['name']
                return acc
            }, {} )
        this.#state['queueIsReady'] = true

        return true
    }


    sendData( { routeId, obj, strict=false } ) {
        const [ messages, comments ] = this.#validateSendData( { routeId, obj } )
        printMessages( { messages, comments } )
        if( !strict && comments.length !== 0 ) {
            return false
        }

        this.#queue[ routeId ]['queue'].push( obj )
        this.#queue[ routeId ]['nonceSum']++
        if( !this.#queue[ routeId ]['running'] ) {
            !this.#silent ? printConsole( { 'first': `🌟 OPEN: Route ${routeId}`, 'second': `      |           |` } ) : ''
            this.#queue[ routeId ]['running'] = true
            this.#startSending( { routeId } )
                .then( a => {
                    let first = `${this.#config['console']['emojis']['route']} CLOSE: ${routeId}`
                    !this.#silent ? printConsole( { first, 'second': `      |           |` } ) : ''
                } )
        }

        return true
    }


    async #startSending( { routeId } ) {
        const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
        const { delayInMsPerLoop, concurrentRequestsPerLoop } = this.#queue[ routeId ]

        while( this.#queue[ routeId ]['running'] ) {
            const datas = this.#queue[ routeId ]['queue'].slice( 0, concurrentRequestsPerLoop )
            this.#queue[ routeId ]['queue'].splice( 0, concurrentRequestsPerLoop )
            this.#queue[ routeId ]['nonce'] += datas.length
            this.#queue[ routeId ]['count'] ++

            const responses = await Promise.all( 
                datas
                    .map( async ( data, index ) => {
                        const result = await this.#requestCentral( { routeId, data } )
                        return result
                    } )
            )

            this.emit( 
                this.#config['events']['channelName'], 
                {
                    routeId,
                    responses 
                }
                
            )

            if( !this.#silent ) {
                const { first, second } = this.#generateStatusMessage( { routeId, responses } )
                printConsole( { first, second } )
            }

            await delay( delayInMsPerLoop )

            if( this.#queue[ routeId ]['queue'].length === 0 ) {
                this.#queue[ routeId ]['running'] = false
            }
        }

        return true
    }


    async #requestCentral( { routeId, data } ) {
        const type = this.#queue[ routeId ]['routeType']

        let result = { 
            'status': null, 
            'response': null, 
            data 
        }

        switch( type ) {
            case 'get': {
                    const [ status, response ] = await this.#getRequest( { routeId, data } )
                    result = { status, response, data }
                }
                break
            case 'post': {
                    const [ status, response ] = await this.#postRequest( { routeId, data } )
                    result = { status, response, data }
                }
                break
            case 'local': {
                    const [ status, response ] = this.#localRequest( { routeId, data } )
                    result = { status, response, data }
                }
                break
            default:
                console.log( `Unknown type: '${type}'.` )
                break
        }

        return result
    }


    async #postRequest( { routeId, data } ) {
        let status
        let response
        try {
            const r = await axios.post( 
                this.#queue[ routeId ]['requestUrl'], 
                data,
                {
                    'headers': this.#queue[ routeId ]['requestHeaders']
                }
            )
            status = true
            response = r.data
        } catch( e ) {
            status = false
        }

        return [ status, response ]
    }


    async #getRequest( { routeId, data } ) {
        let status
        let response
        try {
            const r = await axios.get( 
                this.#queue[ routeId ]['requestUrl'], 
                { 
                    'params': data,
                    'headers': this.#queue[ routeId ]['requestHeaders']
                } 
            )
            status = true
            response = r.data
        } catch( e ) {
            status = false
        }

        return [ status, response ]
    }


    #localRequest( { routeId, data } ) {
        return [ true, 'localRequest' ]
    }


    #validateRoutes( { routes } ) {
        const messages = []
        const comments = []

        if( routes === undefined ) {
            messages.push( `Routes are undefined.` )
        } else if( !Array.isArray( routes ) ) {
            messages.push( `Routes are not type of 'array'.` )
        } else if( routes.length === 0 ) {
            messages.push( `Routes are empty.` )
        } else {
            const tests = routes.map( ( route, index ) => {
                    if( typeof route === 'object' && route !== null ) {
                        if( !Array.isArray( route ) ) {
                            return Object.keys( route ).length > 0
                        }
                    }
                    return false
                } )
                .every( a => a )
            !tests ? messages.push( `Routes are not valid key/value objects.` ) : ''
        }

        if( messages.length !== 0 ) {
            return [ messages, comments ]
        }

        routes
            .forEach( ( route, index ) => {
                const keys = [
                    ...Object.keys( this.#config['validation']['default'] ).map( a => [ 'default', a ] ),
                    ...Object.keys( this.#config['validation']['custom'][ route['routeType'] ] ).map( a => [ 'custom', a ] )
                ]
                    .forEach( ( b ) => {
                        const [ type, keyName ] = b
                        let validation 
                        if( type === 'custom' ) {
                            validation = this.#config['validation']['custom'][ route['routeType'] ][ keyName ]
                        } else if( type === 'default' ) {
                            validation = this.#config['validation']['default'][ keyName ]
                        } else {
                            console.log( `Unknown type: '${type}'.` )
                        }

                        if( route[ keyName ] === undefined ) {
                            messages.push( `[${index}] key: '${keyName}' value: '${route[ keyName ]}' is undefined.` )
                        } else if( typeof route[ keyName ] !== validation['type'] ) {
                            messages.push( `[${index}] key: '${keyName}' value: '${route[ keyName ]}' is not type of 'string'.` )
                        } 

                        if( validation['type'] === 'object' ) {
                            try {
                                JSON.stringify( route[ keyName ] )
                            } catch( e ) {
                                messages.push( `[${index}] key: '${keyName}' value: '${route[ keyName ]}' is not valid JSON object.` )
                            }
                        } else if( !validation['regex'].test( `${route[ keyName ]}` ) ) {
                            messages.push( `[${index}] key: '${keyName}' value: '${route[ keyName ]}' is not valid. ${validation['message']}` )
                        }
                    } )
            } )

        return [ messages, comments ]
    }


    #validateSendData( { routeId, obj, routes } ) {
        const messages = []
        const comments = []

        if( routeId === undefined ) {
            messages.push( `RouteId is missing.` )
        } else if( typeof routeId !== 'string' ) {
            messages.push( `RouteId is not type of 'string'.` )
        } else if( this.#queue[ routeId ] === undefined ) {
            comments.push( `RouteId with the value: ${routeId} is not defined, add Route with setRoute() first.` )
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
        } else if( !Object.hasOwn( obj, 'id') ) {
            comments.push( `Object has no 'id' property.` )
        }

        if( !this.#state['queueIsReady'] ) {
            messages.push( `Call '.setRoutes' first. Routes are not defined.` )
        }

        return [ messages, comments ]
    }


    #generateStatusMessage( { routeId, responses } ) {
        const nonce = this.#queue[routeId]['nonce']
        const nonceSum = this.#queue[routeId]['nonceSum']
        const percent = Math.round( ( nonce * 100 ) / nonceSum )

        const m = 3 - `${percent}`.length
        const spacer = ( m > -1 ) ? new Array( m ).fill( ' ' ).join( '' ) : ''
        const percentStr = `${spacer}${percent}`
   
        const s = `${nonce}/${nonceSum}`
        const n = 9 - s.length
        let spacer2 = ( n > 0 ) ? new Array( n ).fill( ' ' ).join( '' ) : ''


        let first = ''
        first += `${this.#config['console']['emojis']['loop']} ID: ${routeId} `
        first += `(${this.#queue[ routeId ]['count']})`
    
        let second = ''
        second += `${percentStr} % | `
        second += `${spacer2}${s} | `
        second += ``
        second += responses
            .reduce( ( acc, a, index, all ) => {
                if( !Object.hasOwn( acc, a['status'] ) ) {
                    acc[ a['status'] ] = []
                }
                acc[ a['status'] ].push( a['data']['id'] )

                if( index === all.length - 1 ) {
                    acc = Object
                        .entries( acc )
                        .map( ( [ key, value ] ) => {
                            return `${key}: ${value.join( ', ' )}`
                        } )
                        .join( ' | ' )
                }
                return acc
            }, {} )

        return { first, second }
    }
}


export { Exporter }
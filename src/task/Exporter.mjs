import { printMessages, getSpace, printStatus } from './../helpers/mixed.mjs'
import { config } from './../data/config.mjs'
import axios from 'axios'
import EventEmitter from 'events'


class Exporter extends EventEmitter {
    #config
    #queue
    #silent
    #state


    constructor( { silent, emitEvents } ) {
        super()
        const [ messages, comments ] = this.#validateConstructor( { silent, emitEvents } )

        this.#silent = silent
        this.#config = config

        this.#state = {
            'queueIsReady': false,
            emitEvents
        }
    }


    setRoutes( { routes } ) {
        const [ messages, comments ] = this.#validateRoutes( { routes } )
        printMessages( { messages, comments, 'silent': this.#silent } )

        this.#queue = routes
            .reduce( ( acc, a, index ) => {
                acc[ a['routeId'] ] = { 
                    ...a, 
                    'queue': [], 
                    'routeIsRunning': false, 
                    'sendDone': 0,
                    'sendTotal': 0,
                    'loopsDone': 0,
                    'progressInPercent': 0
                }
                delete acc[ a['routeId'] ]['name']
                return acc
            }, {} )
        this.#state['queueIsReady'] = true

        return true
    }


    sendData( { routeId, obj, strict=false } ) {
        const [ messages, comments ] = this.#validateSendData( { routeId, obj } )
        printMessages( { messages, comments, 'silent': this.#silent } )
        if( !strict && comments.length !== 0 ) {
            return false
        }

        this.#queue[ routeId ]['queue'].push( obj )
        this.#queue[ routeId ]['sendTotal']++
        if( !this.#queue[ routeId ]['routeIsRunning'] ) {
            this.#outputRouteStatus( { 'operation': 'Open', routeId } )
            this.#queue[ routeId ]['routeIsRunning'] = true
            this.#startSending( { routeId } )
                .then( a => this.#outputRouteStatus( { 'operation': 'Closed', routeId } ) )
        }

        return true
    }


    getConfig() {
        return this.#config
    }


    setConfig( { config } ) {
        const [ messages, comments ] = this.#validateSetConfig( { config } )
        printMessages( { messages, comments, 'silent': this.#silent } )

        return true
    }


    printRouteStatus( { symbol, operation, routeId, eventResponse=null, responses=null } ) {  
        let sendDone, sendTotal, loopsDone, progressInPercent
        if( eventResponse !== null ) {
            routeId = eventResponse['routeId']
            sendDone = eventResponse['sendDone']
            sendTotal = eventResponse['sendTotal']
            loopsDone = eventResponse['loopsDone']
            progressInPercent = eventResponse['progressInPercent']
            responses = eventResponse['responses']
        } else {
            sendDone = this.#queue[ routeId ]['sendDone']
            sendTotal = this.#queue[ routeId ]['sendTotal']
            loopsDone = this.#queue[ routeId ]['loopsDone']
            progressInPercent = this.#queue[ routeId ]['progressInPercent']
        }

        const states = responses
            .reduce( ( acc, a, index, all ) => {
                !Object.hasOwn( acc, a['status'] ) ? acc[ a['status'] ] = [] : ''
                acc[ a['status'] ].push( a['data']['id'] )
                if ( index !== all.length - 1 ) { return acc }
                acc = Object
                    .entries( acc )
                    .map( ( [ key, value ] ) => `${key}: ${value.join( ', ' )}` )
                    .join( ' | ' )
    
                return acc
            }, {} )

        const line = [ 
            `${symbol} ${operation}`,
            `${routeId} [${loopsDone}]`,
            `${progressInPercent}%`,
            `${sendDone}/${sendTotal}`,
            `${states}`
        ]
            .map( ( str, index ) => {
                const [ maxLength, alignment ] = this.#config['console']['table'][ index ]
                const spacer = ( maxLength !== null ) ? getSpace( maxLength, str ) : ''
                const result = alignment === 'right' ? `${spacer}${str}` : `${str}${spacer}`
                return `${result}`
            } )
            .join( ' | ' )
        console.log( line )

        return true
    }


    async #startSending( { routeId } ) {
        const delay = ( ms ) => new Promise( resolve => setTimeout( resolve, ms ) )
        const { delayInMsPerLoop, concurrentRequestsPerLoop } = this.#queue[ routeId ]

        while( this.#queue[ routeId ]['routeIsRunning'] ) {
            const datas = this.#queue[ routeId ]['queue'].slice( 0, concurrentRequestsPerLoop )
            this.#queue[ routeId ]['queue'].splice( 0, concurrentRequestsPerLoop )
            const responses = await Promise.all( 
                datas.map( async( data ) => await this.#requestCentral( { routeId, data } ) )
            )

            this.#queueUpdateStats( { routeId, datas } )
            this.#outputRouteLoop( { routeId, responses } )
            await delay( delayInMsPerLoop )

            if( this.#queue[ routeId ]['queue'].length === 0 ) {
                this.#queue[ routeId ]['routeIsRunning'] = false
            }
        }

        return true
    }


    #queueUpdateStats( { routeId, datas } ) {
        this.#queue[ routeId ]['sendDone'] += datas.length
        this.#queue[ routeId ]['loopsDone']++

        const { nonce, nonceSum } = this.#queue[ routeId ]
        this.#queue[ routeId ]['progressInPercent'] = Math.round( 
            ( this.#queue[ routeId ]['sendDone'] * 100 ) / this.#queue[ routeId ]['sendTotal']
        )
        
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
                    const [ status, response ] = await this.#requestGet( { routeId, data } )
                    result = { status, response, data }
                }
                break
            case 'post': {
                    const [ status, response ] = await this.#requestPost( { routeId, data } )
                    result = { status, response, data }
                }
                break
            case 'local': {
                    const [ status, response ] = this.#requestLocal( { routeId, data } )
                    result = { status, response, data }
                }
                break
            default:
                console.log( `Unknown type: '${type}'.` )
                break
        }

        return result
    }


    async #requestPost( { routeId, data } ) {
        let status
        let response
        try {
            const r = await axios.post( 
                this.#queue[ routeId ]['requestUrl'], 
                data,
                { 'headers': this.#queue[ routeId ]['requestHeaders'] }
            )
            response = r.data
            status = true
        } catch( e ) {
            status = false
        }

        return [ status, response ]
    }


    async #requestGet( { routeId, data } ) {
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
            response = r.data
            status = true
        } catch( e ) {
            status = false
        }

        return [ status, response ]
    }


    #requestLocal( { routeId, data } ) {
        return [ true, 'localRequest' ]
    }


    #validateConstructor( { silent, emitEvents } ) {
        const messages = []
        const comments = []

        const tmp = [ 
            [ silent, 'silent' ], 
            [ emitEvents, 'emitEvents' ] 
        ]
            .forEach( ( a, index ) => {
                const [ value, key ] = a
                if( value === undefined ) {
                    messages.push( `Constructor variable '${key}' is undefined.` )
                } else if( typeof value !== 'boolean' ) {
                    messages.push( `Constructor variable '${key}' is not type of 'boolean'.` )
                }
            } )

        return [ messages, comments ]
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
            const tests = routes
                .map( ( route ) => {
                    if( !( typeof route === 'object' && route !== null ) ) {
                        return false
                    } else if( !Array.isArray( route ) ) {
                        return Object.keys( route ).length > 0
                    } else {
                        return false
                    }
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


    #validateSendData( { routeId, obj } ) {
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


    #validateSetConfig( { config } ) {
        const messages = []
        const comments = []

        if( config === undefined ) {
            messages.push( `Config is undefined.` )
        } else if( typeof config !== 'object' ) {
            messages.push( `Config is not type of 'object'.` )
        } else if( Object.keys( config ).length === 0 ) {
            messages.push( `Config is an empty object.` )
        } else if( Object.keys( config ).length > 0 ) {
            const valids = Object.keys( this.#config )
            const test = Object.keys( config )
                .map( a => valids.includes( a ) )
                .every( a => a )

            if( !test ) {
                messages.push( `Config contains unknown keys: ${Object.keys( this.#config ).join( ', ' ) }.` )
            }
        }

        return [ messages, comments ]
    }


    #outputRouteLoop( { routeId, responses } ) {
        if( !this.#silent === true ) {
            this.printRouteStatus( { 
                'symbol' : this.#config['console']['emojis']['loop'], 
                'operation': 'Loop', 
                routeId, responses
            } )
        }

        if( this.#state['emitEvents'] === true ) {
            const { sendDone, sendTotal, loopsDone, progressInPercent } = this.#queue[ routeId ]
            this.emit( 
                this.#config['events']['routeLoopUpdate'], 
                { routeId, sendDone, sendTotal, loopsDone, progressInPercent, responses }
            )
        }

        return true
    }


    #outputRouteStatus( { operation, routeId } ) {
        if( !this.silent === true ) {
            printStatus( {
                'symbol': `${this.#config['console']['emojis'][ operation ]}`, 
                operation, routeId
            } )
        }

        if( this.#state['emitEvents'] === true ) {
            this.emit( 
                this.#config['events']['routeStatus'], 
                { operation, routeId }
            )
        }

        return true
    }
}


export { Exporter }
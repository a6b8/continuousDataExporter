import express from 'express'
import bodyParser from 'body-parser'


class Server {
    #config
    #app


    constructor( config ) {
        this.#config = config

        this.#app = express()
        this.#addUse()
        this.#addRoutes()

        return true
    }


    start() {
        this.#app.listen(
            this.#config['port'], 
            () => {
                console.log( `Server is running at ${this.#config['host']}:${this.#config['port']}` )
            } 
        )
    }


    #addUse() {
        this.#app.use( bodyParser.json() )
        this.#app.use( bodyParser.urlencoded( { 'extended': true } ) )
        this.#app.use( ( req, res, next ) => {

            let authentification = null
            if( req.headers?.authorization ) {
                const [ key, token ] = req.headers.authorization.split( ' ' )
                if( `${token}` === `${this.#config['bearer']}` ) {
                    authentification = 'true'
                } else {
                    authentification = 'false'
                }
            } else {
                authentification = 'none'
            }


            let id = null
            switch( req.method ) {
                case 'GET':
                    id = req.query['id']
                    break
                case 'POST':
                    id = req.body['id']
                    break
                default:
                    break
            }

            const n = this.#config['maxLength']
            const a = 6 - `${req.method} `.length > 0 ? 6 - `${req.method} `.length : 0
            const b = 4 - `${id} `.length > 0 ? 4 - `${id} `.length : 0
            const c = 4 - `${id} `.length > 0 ? 4 - `${id} `.length : 0
            const d = 8 - `${authentification} `.length > 0 ? 8 - `${authentification} `.length : 0

            let str = ''
            str += `${req.method} `
            str += new Array( a ).fill( ' ' ).join( '' )
            str += new Array( b ).fill( ' ' ).join( '' )
            str += `${id} `
            str += new Array( d ).fill( ' ' ).join( '' )
            str += `${authentification} `
            str += new Array( c ).fill( ' ' ).join( '' )
            str += `${req.url.length > n ? `${req.url.substring( 0, n )}...` : req.url} `

            console.log( `${str}` )
            next()
        } )

        return true
    }


    #addRoutes() {
        function generateResponse( type, req ) {
            function empty( obj ) {
                return typeof obj === 'object' && Object.keys(obj).length === 0
            }


            const struct = {
                'query': null,
                'body': null
            }

            struct['query'] = !empty( req['query'] ) ? true : false
            struct['body'] = !empty( req['body'] ) ? true : false

            let str = ''
            str += `${type} `
            str += 'Request received: Request Parameters in '
            str += struct['query'] ? 'URL ' : ''
            str += struct['body'] ? 'JSON Body ' : ''
            str += struct['query'] ? JSON.stringify( req.query ) + '  ' : ', '
            str += struct['body'] ? JSON.stringify( req.body ) + '  ' : ', '

            // console.log( 'query', struct )
            // console.log( 'body', req.body )
            // console.log( 'str', str ) 
            return str
        }


        this.#app.get(
            '/get', 
            ( req, res ) => {
                res.send( generateResponse( 'GET', req ) )
            } 
        )
          
        this.#app.post(
            '/post', 
            ( req, res ) => {
                res.send( generateResponse( 'POST', req ) )
            }
        )
    }
}

const ex = new Server( {
    'port': 3000,
    'host': 'http://localhost',
    'maxLength': 25,
    'bearer': 123
} )
ex.start()

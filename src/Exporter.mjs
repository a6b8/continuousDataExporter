import axios from 'axios'
import fs from 'fs'

import { printConsole } from './../helpers/mixed.mjs'


class Exporter {
    #config
    #state


    constructor( { exporter, type, url, folder, bearer } ) {
        this.#config = { exporter }

        const [ messages, comments ] = this.#validateSetExporterType( { type, url, folder, bearer } )
        printConsole( { messages, comments } )

        this.#state = {
            'destination': {}
        }

        this.#state['destination'] = {
            type,
            'option': type === 'web' ? url : folder
        }

        return true
    }


    async start( { msg } ) {
        let result = false

        switch( this.#state['destination']['type'] ) {
            case 'web': {
                    const [ status ] = await this.#postRequest( { msg } )
                    result = status
                }
                break
            case 'file': {
                    const [ status ] = this.#localRequest( { msg } )
                    result = status
                }
                break
            case 'none': {

                }
                break
            default:
                break
        }

        return result
    }


    #getAvailableExporters() {
        return Object.keys( this.#config['exporter']['types'] )
    }


    async #postRequest( { url, body, authorization } ) {
        let status = false

        try {        
            const data = JSON.stringify( body )
            const headers = { 
                'Content-Type': 'application/json',
                authorization
            }
            const config = {
                'method': 'post',
                'maxBodyLength': Infinity,
                url,
                headers,
                data
            }

            const response = await axios.request( config )
            status = true
        } catch( error ) {
            console.error('Error:', error);
        }
        
        return [ status ]
    }


    #localRequest( { url, msg } ) {
        let status = false
        try {
            const { key, blockHeight, index, indexMax } = msg['call_id']
            const { path, fileName } = this.#config['exporter']['file']

            let p = path
                .replaceAll( '{{key}}', key )

            let f = fileName
                .replaceAll( '{{blockHeight}}', blockHeight )
                .replaceAll( '{{index}}', index )
                .replaceAll( '{{indexMax}}', indexMax )

            fs.mkdirSync( p, { recursive: true });
            fs.writeFileSync( `${p}${f}`, JSON.stringify( msg, null, 4 ) )

        } catch( e ) {
            console.log( 'msg', msg )
            console.log( e )

            process.exit( 1 )
        }

        return [ status ]
    }


    #validateSetExporterType( { type, url, folder } ) {
        const messages = []
        const comments = []

        if( type === undefined ) {
            messages.push( 'Type is not defined' )
        } else if( typeof type !== 'string' ) {
            messages.push( 'Type is not a string' )
        } else if( this.#getAvailableExporters().includes( type ) === false ) {
            messages.push( `Type is not valid. Valid keys are: ${this.#getAvailableExporters().join( ', ' )}` )
        }

        if( messages.length > 0 ) {
            return [ messages, comments ]
        }

        if( type === 'file' ) {
            if( folder === undefined ) {
                messages.push( 'Folder is not defined' )
            } else if( typeof folder !== 'string' ) {
                messages.push( 'Folder is not a string' )
            } else if( !this.#config['exporter']['types']['file']['optionValidation']['regex'].test( folder ) ) {
                messages.push( this.#config['exporter']['types']['file']['optionValidation']['message'] )
            }
        } else if( type === 'web' ) {
            if( url === undefined ) {
                messages.push( 'URL is not defined' )
            } else if( typeof url !== 'string' ) {
                messages.push( 'URL is not a string' )
            } else if( !this.#config['exporter']['types']['web']['optionValidation']['regex'].test( url ) ) {
                messages.push( this.#config['exporter']['types']['web']['optionValidation']['message'] )
            }
        }

        return [ messages, comments ]
    }
}


export { Exporter }
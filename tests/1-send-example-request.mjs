import axios from 'axios'

class Example {
    #config  
    #state 


    constructor( config ) {
        this.#config = config

        return true
    }


    init() {
        this.#state = {
            'url': `http://${this.#config['host']}:${this.#config['port']}`,
            'msg': { 
                'msg': 'Hello World',
                'from': 'Example',
                'to': 'Server',
                'date': '2021-01-01',
                'time': '12:00:00'
            }
        }

        return true
    }


    async postRequest() {
        console.log( 'Sending POST Request' )
        const msg = this.#state['msg']
        const response = await axios.post( `${this.#state['url']}/post`, msg )
        console.log( 'Response:', response.data )
        return response
    }


    async getRequest() {
        console.log( 'Sending GET Request URL' )
        const msg = this.#state['msg']
        const response = await axios.get( `${this.#state['url']}/get`, { 'params': msg } )
        console.log( 'Response:', response.data )
        return response
    }
}


const example = new Example( {
    'port': 3000,
    'host': 'localhost'
} )

example.init()
await example.postRequest()
console.log()
await example.getRequest()
console.log()
// await example.getRequestUrl()




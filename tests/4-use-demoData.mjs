import { Exporter, sendDemoData, getDemoRoutes, getDemoKeys } from '../src/index.mjs'


// start first node tests/0-start-server.mjs
//
//


const silent = false
const emitEvents = true

const exporter = new Exporter( { silent, emitEvents } )
exporter.on(
    'exporterRouteLoopUpdate', 
    ( eventResponse ) => {
        exporter.printRouteStatus( {
            'symbol': `📅`, 
            'operation': 'Event',
            eventResponse
        } )


/*
        const { routeId, sendDone, sendTotal, loopsDone, progressInPercent, responses } = data
        const { line } = getPrintLineLoop( { 
            'symbol': `📅`, 
            'operation': 'Event',
            routeId, sendDone, sendTotal, loopsDone, progressInPercent, responses 
        } )
        console.log( line )
       // printConsole( { first, second } )
*/
    } 
)

const routes = getDemoRoutes()
exporter.setRoutes( { routes } )

const keys = getDemoKeys()
await sendDemoData( { exporter, keys } )

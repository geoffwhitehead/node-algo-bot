
import Alpaca from '@alpacahq/alpaca-trade-api'
import { config } from '../config/config'

const client = new Alpaca({
    keyId: config.apiKey,
    secretKey: config.secretKey,
    paper: true,
})

const getAccount = client.getAccount

const getBars = (symbol, config) => client.getBarsV2(symbol, config, client.configuration)

const getLatestBars = (symbol) => client.getLatestBar(symbol, client.configuration)

const websocket = () => client.data_ws

const getClock = () => client.getClock()

const getPosition = (symbol) => client.getPosition(symbol)

const closePosition = (symbol: string) => client.closePosition(symbol)

export {
    closePosition,
    websocket,
    getBars,
    getLatestBars,
    getAccount,
    getClock,
    getPosition
}
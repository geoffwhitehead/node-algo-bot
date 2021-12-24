
import Alpaca from '@alpacahq/alpaca-trade-api'
import { config } from '../config/config'

const client = new Alpaca({
    keyId: config.apiKey,
    secretKey: config.secretKey,
    paper: true,
})

const getAccount = client.getAccount

const getBars = (symbol, config) => client.getBarsV2(symbol, config, client.configuration)

export {
    getBars,
    getAccount
}
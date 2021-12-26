
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

interface Order {
    symbol: string,
    side: 'buy' | 'sell',
    type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop',
    time_in_force: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok',
    order_id?: string,
}

interface NotionalOrder extends Order {
    notional: number,
}
interface QtyOrder extends Order {
    qty: number,
}

type CreateOrder = NotionalOrder | QtyOrder

const createOrder = (order: CreateOrder) => client.createOrder(order)

export {
    createOrder,
    closePosition,
    websocket,
    getBars,
    getLatestBars,
    getAccount,
    getClock,
    getPosition
}
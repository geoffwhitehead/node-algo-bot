import * as ti from 'technicalindicators'
import dayjs from "dayjs"
import { getValues } from "./utils"
import { closePosition, createOrder, getClock, getPosition } from '../alpaca'
import { AlpacaBar } from '@alpacahq/alpaca-trade-api/dist/resources/datav2/entityv2'

interface EmaCrossWithBuffer {
    symbol: string
    timeframe: string
    openVolatilityBuffer: number // number of consequetive candles above / below ema to trigger open
    closeVolatilityBuffer: number // number of consequetive candles above / below ema to trigger close 
}

const mapTimeframeToMin = {
    '1Min': 1,
    '1Hour': 60,
    '1Day': 60 * 24
}

export const init = async (args: EmaCrossWithBuffer) => {
    const { timeframe } = args

    loop(mapTimeframeToMin[timeframe] * 100, () => run(args))
}

async function loop(interval: number, fn) {
    await new Promise(res => setTimeout(res, interval))
    await fn()
    process.nextTick(loop.bind(this, interval, fn))
}

async function run(args: EmaCrossWithBuffer) {
    const { symbol, timeframe, closeVolatilityBuffer, openVolatilityBuffer } = args

    // isMarketOpen
    // return if not
    const { is_open } = await getClock();

    if (!is_open) {
        return
    }
    // get positions
    const position = await getPosition(symbol)

    // get values
    const now = dayjs.tz(dayjs(), "America/New_York")
    const values = await getValues({
        symbol,
        start: now.subtract(1, 'day').format(),
        end: now.format(),
        timeframe
    })

    // get ema
    const ema = getEMA(values)
    const emaResult = ema.getResult()

    // if position - determine if position should be closed
    if (position) {
        const shouldClose = checkHistorySupportsAction({ values, ema: emaResult, side: position.side, buffer: closeVolatilityBuffer })
        if (shouldClose) {
            return closePosition(symbol)
        }
    }


    if (!position) {
        // determine if downtrend or uptrend
        const isUptrend = values.at(-1).ClosePrice < emaResult

        const side = isUptrend ? 'long' : 'short'

        // determine if position should be opened
        const shouldOpenPosition = checkHistorySupportsAction({ values, ema: emaResult, side, buffer: openVolatilityBuffer })

        if (shouldOpenPosition) {
            // open position
            const orderSide = side === 'short' ? 'sell' : 'buy'
            return createOrder({
                symbol,
                notional: 10000, // in test
                side: orderSide,
                type: 'market',
                time_in_force: 'day'
            })
        }
    }
}

interface CheckHistory {
    values: AlpacaBar[],
    ema: number,
    side: 'short' | 'long',
    buffer: number
}

function checkHistorySupportsAction({ values, ema, side, buffer }: CheckHistory) {
    const history = values.slice(-buffer)
    if (history.length < buffer) {
        throw new Error('check history length incorrect: ' + history.length)
    }

    if (side === 'short') {
        return !history.some(({ ClosePrice }) => ClosePrice > ema)
    }

    if (side === 'long') {
        return !history.some(({ ClosePrice }) => ClosePrice < ema)
    }
}

function getEMA(values: AlpacaBar[]): ti.EMA {
    const emaValues = values.slice(-200).map(({ ClosePrice }) => ClosePrice)
    if (emaValues.length !== 200) {
        throw new Error('Invalid array length for EMA')
    }
    const ema = new ti.EMA({ period: 200, values: emaValues })

    return ema
}

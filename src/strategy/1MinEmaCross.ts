import * as ti from 'technicalindicators'
import dayjs from "dayjs"
import { getLatestValues, getValues } from "./utils"
import { getBars, getClock, getPosition, websocket } from '../alpaca'
import { createSocket } from 'dgram'
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
    // const now = dayjs.tz(dayjs(), "America/New_York").subtract(3, 'days')
    // const start = now.subtract(1, 'day').format()
    // const end = now.format()

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

    if (position) {
        if (position.side === 'long') {
            const shouldClose = checkHistorySupportsAction({ values, ema: ema.getResult(), side: 'long', buffer: closeVolatilityBuffer })
            if (shouldClose) {

            }

        }
    }
    // determine if buying or selling


    // if buying
    // should i close position? has latest value dropped below ema?

    // if selling
    // should i close position? has latest value dropped below ema?

    // if value below ema
    // should i open sell position

    // if value above ema
    // should i open buy position

    console.log('check')
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

import { getAccount, getBars } from "../alpaca"
import * as ti from 'technicalindicators'
import dayjs from "dayjs"
import { concatMap, from, lastValueFrom, toArray } from "rxjs"

export const engulfing = async (symbol) => {
    let sma20, sma50
    const lastOrder = 'SELL'

    initAverages(symbol)
}

async function initAverages(symbol) {

    const now = dayjs.tz(dayjs(), "America/New_York").subtract(14, 'hours')

    const options = {
        start: now.subtract(1, 'day').format(),
        end: now.format(),
        // start: "2021-02-01",
        // end: "2021-02-10",
        timeframe: "1Min",

    }



    try {

        const resp = getBars(
            symbol,
            options,
        )
        const x = await lastValueFrom(from(resp).pipe(toArray()))
        const sliced = x.slice(-200)
        console.log(`sliced.length`, sliced.length)
        // for await (let b of resp) {
        //     console.log('*********************')
        //     console.log('*********************')
        //     console.log('*********************')
        //     console.log('*********************')
        //     console.log('*********************')
        //     console.log('*********************')
        //     console.log('b', b)
        // }

        console.log(`x[0]`, sliced[0])
        console.log(`x[x.length-1]`, sliced[sliced.length - 1])
    } catch (e) {
        console.log(`e`, e)
    }

}

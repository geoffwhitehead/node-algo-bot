import { from, lastValueFrom, toArray } from "rxjs"
import { getBars, getLatestBars } from "../alpaca"

interface GetValues {
    start: string,
    end: string,
    timeframe: string,
    symbol: string
    limit?: number
}

export async function getValues({ start, end, timeframe, symbol, limit = 500 }: GetValues) {
    const options = {
        start,
        end,
        timeframe,
        limit
    }

    try {
        const resp = getBars(
            symbol,
            options,
        )
        const values = await lastValueFrom(from(resp).pipe(toArray()))
        return values
    } catch (error) {
        console.log(`e`, error)
    }
}

export async function getLatestValues(symbol) {
    try {
        const resp = getLatestBars(symbol)
        const values = await lastValueFrom(from(resp).pipe(toArray()))
        return values
    } catch (error) {
        console.log(`error`, error)
    }
}
import { init } from "./src/strategy/1MinEmaCross";
import dayjs from "dayjs"

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

init({ symbol: 'SPXL', timeframe: '1Min', openVolatilityBuffer: 5, closeVolatilityBuffer: 3 });
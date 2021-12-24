import { engulfing } from "./src/bots/engulfing";
import dayjs from "dayjs"

import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

dayjs.tz.setDefault("America/New_York")


engulfing('SPXL');
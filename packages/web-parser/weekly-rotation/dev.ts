import { logInfo } from "logger"

import { getWeeklyRotation } from "./getWeeklyRotation"

getWeeklyRotation().then(logInfo)

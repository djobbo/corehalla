import { getWeeklyRotation } from "./getWeeklyRotation"
import { logInfo } from "logger"

getWeeklyRotation().then(logInfo)

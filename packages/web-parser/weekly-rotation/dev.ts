import { getWeeklyRotation } from "./getWeeklyRotation"
import { logInfo } from "@ch/logger"

getWeeklyRotation().then(logInfo)

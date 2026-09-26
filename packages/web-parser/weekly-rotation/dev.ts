import { getWeeklyRotation } from "./getWeeklyRotation"
import { logInfo } from "@crh/logger"

getWeeklyRotation().then(logInfo)

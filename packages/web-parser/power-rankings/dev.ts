import { logInfo } from "@ch/logger"
import { parsePowerRankingsPage } from "./parsePowerRankingsPage"

parsePowerRankingsPage("2v2", "us-e").then((data) => logInfo(data[0]))

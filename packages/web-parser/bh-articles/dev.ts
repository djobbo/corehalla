import { logInfo } from "logger"
import { parseBHArticlesPage } from "./parseBHArticlesPage"

parseBHArticlesPage(1, "patch-notes").then((data) => logInfo(data[0]))

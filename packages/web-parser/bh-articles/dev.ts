import { logInfo } from "@crh/logger"
import { parseBHArticlesPage } from "./parseBHArticlesPage"

parseBHArticlesPage(1, "patch-notes").then((data) => logInfo(data[0]))

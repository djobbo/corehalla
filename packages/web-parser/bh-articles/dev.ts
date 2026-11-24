import { logInfo } from "@crh/logger"
import { parseBHArticlesPage } from "./parseBHArticlesPage"

void parseBHArticlesPage(1, "patch-notes").then((data) => logInfo(data[0]))

import { parseBHArticlesPage } from "./parseBHArticlesPage"

parseBHArticlesPage(1, "patch-notes").then((data) => console.log(data[0]))

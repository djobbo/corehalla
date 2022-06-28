import { parseBHArticlesPage } from "./parseBHArticlesPage"

// eslint-disable-next-line no-console
parseBHArticlesPage(1, "patch-notes").then((data) => console.log(data[0]))

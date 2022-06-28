import { parsePowerRankingsPage } from "./parsePowerRankingsPage"

// eslint-disable-next-line no-console
parsePowerRankingsPage("2v2", "us-e").then((data) => console.log(data[0]))

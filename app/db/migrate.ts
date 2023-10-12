import { migrate } from "drizzle-orm/node-postgres/migrator"

import { db } from "."

const main = async () => {
    await migrate(db, { migrationsFolder: "db/migrations" })
}

main()

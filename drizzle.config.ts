import type { Config } from "drizzle-kit"
import dotenv from "dotenv"

dotenv.config()

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",

  dbCredentials: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: {
      rejectUnauthorized: false // esto debe de cmabiar en prod:
      //ca: fs.readFileSync("ca-certificate.crt")
    }
  }
} satisfies Config

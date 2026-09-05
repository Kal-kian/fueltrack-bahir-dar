import { defineConfig } from 'prisma/config'
import 'dotenv/config'

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres.uxflafnbfjugqnjzwdts:%2312%40AB%2334%40bc@3.139.14.59:5432/postgres?sslmode=disable",
  },
})
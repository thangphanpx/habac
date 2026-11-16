import { sql } from './db'

await sql.unsafe(await Bun.file(new URL('./schema.sql', import.meta.url)).text())
console.log('Đã áp dụng schema.')
await sql.close()

if (!process.env.DATABASE_URL) throw new Error('Thiếu biến môi trường DATABASE_URL (xem .env.example)')

// Giữ một kết nối duy nhất khi Vite reload module ở chế độ dev.
const globalDb = globalThis as typeof globalThis & { __sql?: Bun.SQL }
export const sql = (globalDb.__sql ??= new Bun.SQL(process.env.DATABASE_URL))

import { sql } from './db'
import { isRole } from '../lib/permissions'
import type { SessionUser } from '../lib/types'

const SESSION_DAYS = 7
export const SESSION_SECONDS = SESSION_DAYS * 24 * 3600

const sha256 = (value: string) => new Bun.CryptoHasher('sha256').update(value).digest('hex')

export async function createSession(userId: number) {
  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('base64url')
  await sql`delete from sessions where expires_at < now()`
  await sql`insert into sessions (id, user_id, expires_at) values (${sha256(token)}, ${userId}, now() + ${SESSION_DAYS} * interval '1 day')`
  return token
}

export const destroySession = (token: string) => sql`delete from sessions where id = ${sha256(token)}`
export const destroyUserSessions = (userId: number, exceptToken?: string) =>
  sql`delete from sessions where user_id = ${userId} and id <> ${exceptToken ? sha256(exceptToken) : ''}`

// Role đọc trực tiếp từ DB ở mỗi request nên đổi quyền hoặc khóa tài khoản có hiệu lực ngay.
export async function userFromToken(token: string): Promise<SessionUser | null> {
  const [row] = await sql`
    select u.id, u.email, u.name, u.role from sessions s join users u on u.id = s.user_id
    where s.id = ${sha256(token)} and s.expires_at > now() and u.active`
  if (!row || !isRole(row.role)) return null
  return { id: row.id, email: row.email, name: row.name, role: row.role }
}

// Băm giả để thời gian phản hồi không lộ email có tồn tại hay không.
const dummyHash = await Bun.password.hash('khong-ton-tai')

export async function verifyLogin(email: string, password: string): Promise<number | null> {
  const [user] = await sql`select id, password_hash from users where email = ${email.toLowerCase()} and active`
  const ok = await Bun.password.verify(password, user?.password_hash ?? dummyHash)
  return user && ok ? user.id : null
}

const hits = new Map<string, number[]>()
// shortcut: bộ đếm trong RAM của một tiến trình, dùng Redis/DB khi chạy nhiều instance.
export function tooMany(key: string, max: number, windowMs: number) {
  const now = Date.now()
  if (hits.size > 10_000) hits.clear()
  const recent = (hits.get(key) ?? []).filter(time => now - time < windowMs)
  hits.set(key, [...recent, now])
  return recent.length >= max
}

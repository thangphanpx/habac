import { Hono, type Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { createMiddleware } from 'hono/factory'
import { csrf } from 'hono/csrf'
import { bodyLimit } from 'hono/body-limit'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { z, type ZodType } from 'zod'
import { get, put } from '@vercel/blob'
import { mkdir } from 'node:fs/promises'
import { sql } from './db'
import { SESSION_SECONDS, createSession, destroySession, destroyUserSessions, tooMany, userFromToken, verifyLogin } from './auth'
import { CONTACT_TOPICS, hasPermission, type Permission } from '../lib/permissions'
import type { SessionUser } from '../lib/types'

type Env = { Variables: { user: SessionUser } }

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads'
const USE_BLOB = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID)
if (process.env.VERCEL && !USE_BLOB) throw new Error('Thiếu cấu hình Vercel Blob cho ảnh tải lên')
// Chừa chỗ cho multipart trong giới hạn request 4.5 MB của Vercel Functions.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const COOKIE_NAME = 'sid'

const clientIp = (c: Context) => c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
const idParam = (c: Context) => Number(c.req.param('id'))
const isValidId = (id: number) => Number.isInteger(id) && id > 0
const isUniqueViolation = (error: unknown) => typeof error === 'object' && error !== null && 'errno' in error && error.errno === '23505'

// ---------- Schema kiểm tra dữ liệu (luôn kiểm tra phía server) ----------
const text = (max: number) => z.string().trim().min(1).max(max)
const optionalText = (max: number) => z.string().trim().max(max).default('')
const slug = z.string().trim().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang').max(120)
// Chỉ nhận ảnh nội bộ để không chèn được URL ngoài hoặc javascript:
const image = z.string().regex(/^\/(assets\/images|uploads)\/[\w.-]+$/, 'Ảnh không hợp lệ')
const lines = z.array(z.string().trim().min(1).max(300)).max(30)
const position = z.number().int().min(0).max(9999).default(0)

const serviceSchema = z.object({ slug, title: text(150), subtitle: optionalText(150), image, intro: text(500), description: text(2000), scope: lines, position, published: z.boolean().default(true) })
const productSchema = z.object({ slug, title: text(150), use_text: text(200), body: text(2000), criteria: lines, image, position, published: z.boolean().default(true) })
const projectSchema = z.object({ title: text(150), description: optionalText(300), image, category: z.enum(['water', 'equipment', 'construction']), position, published: z.boolean().default(true) })

const contactSchema = z.object({
  name: text(100),
  phone: z.string().trim().refine(value => /^\d{9,15}$/.test(value.replace(/[\s().+-]/g, '')), 'Số điện thoại không hợp lệ'),
  email: z.union([z.literal(''), z.email().max(160)]).default(''),
  topic: z.enum(CONTACT_TOPICS),
  message: optionalText(2500),
  website: z.string().default(''), // ô ẩn chống bot: người thật không điền
})
const inquiryUpdateSchema = z.object({ status: z.enum(['new', 'in_progress', 'done']), note: optionalText(2000) })
const settingsSchema = z.object({ company: text(200), address: text(300), phone: text(30), email: z.email().max(160) })
const passwordSchema = z.string().min(10, 'Mật khẩu cần ít nhất 10 ký tự').max(200)
const userCreateSchema = z.object({ email: z.email().max(160), name: text(100), password: passwordSchema, role: z.enum(['admin', 'editor', 'support']) })
const userUpdateSchema = z.object({ name: text(100), role: z.enum(['admin', 'editor', 'support']), active: z.boolean(), password: passwordSchema.optional() })


// Trả lỗi kiểm tra dữ liệu dạng { error } để giao diện hiển thị trực tiếp.
const json = <T extends ZodType>(schema: T) => zValidator('json', schema, (result, c) => {
  if (result.success) return
  const issue = result.error.issues[0]
  return c.json({ error: `${issue.path.join('.') || 'Dữ liệu'}: ${issue.message}` }, 400)
})

// ---------- Xác thực & phân quyền ----------
const requireUser = createMiddleware<Env>(async (c, next) => {
  const token = getCookie(c, COOKIE_NAME)
  const user = token ? await userFromToken(token) : null
  if (!user) return c.json({ error: 'Chưa đăng nhập' }, 401)
  c.set('user', user)
  await next()
})

const can = (permission: Permission) => createMiddleware<Env>(async (c, next) => {
  if (!hasPermission(c.var.user.role, permission)) return c.json({ error: 'Bạn không có quyền thực hiện thao tác này' }, 403)
  await next()
})

// ---------- CRUD dùng chung cho dịch vụ, thiết bị, công trình ----------
function crud(table: string, schema: z.ZodObject) {
  const routes = new Hono<Env>()
  routes.get('/', async c => c.json(await sql`select * from ${sql(table)} order by position, id`))
  routes.post('/', json(schema), async c => {
    const [created] = await sql`insert into ${sql(table)} ${sql(c.req.valid('json'))} returning *`
    return c.json(created, 201)
  })
  routes.put('/:id', json(schema), async c => {
    const id = idParam(c)
    if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
    const [updated] = await sql`update ${sql(table)} set ${sql(c.req.valid('json'))} where id = ${id} returning *`
    return updated ? c.json(updated) : c.json({ error: 'Không tìm thấy' }, 404)
  })
  routes.delete('/:id', async c => {
    const id = idParam(c)
    if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
    const deleted = await sql`delete from ${sql(table)} where id = ${id} returning id`
    return deleted.length ? c.json({ ok: true }) : c.json({ error: 'Không tìm thấy' }, 404)
  })
  return routes
}

// ---------- Ảnh tải lên ----------
const IMAGE_SIGNATURES: { ext: string; matches: (b: Uint8Array) => boolean }[] = [
  { ext: 'png', matches: b => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { ext: 'jpg', matches: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: 'webp', matches: b => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP' },
  { ext: 'gif', matches: b => String.fromCharCode(...b.slice(0, 4)) === 'GIF8' },
]
// Đọc phần đầu file thay vì tin file.type / tên file do client gửi lên (SVG bị loại vì có thể chứa script).
const detectImageExtension = (bytes: Uint8Array) => IMAGE_SIGNATURES.find(signature => signature.matches(bytes))?.ext

const upload = new Hono<Env>()
upload.post('/', bodyLimit({ maxSize: MAX_UPLOAD_BYTES + 100_000, onError: c => c.json({ error: 'Ảnh tối đa 4 MB' }, 413) }), async c => {
  const body = await c.req.parseBody()
  const file = body.file
  if (!(file instanceof File)) return c.json({ error: 'Thiếu file ảnh' }, 400)
  if (file.size > MAX_UPLOAD_BYTES) return c.json({ error: 'Ảnh tối đa 4 MB' }, 413)
  const ext = detectImageExtension(new Uint8Array(await file.slice(0, 12).arrayBuffer()))
  if (!ext) return c.json({ error: 'Chỉ nhận ảnh PNG, JPG, WebP hoặc GIF' }, 415)
  const name = `${crypto.randomUUID()}.${ext}`
  if (USE_BLOB) {
    await put(`uploads/${name}`, file, {
      access: 'private',
      addRandomSuffix: false,
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    })
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true })
    await Bun.write(`${UPLOAD_DIR}/${name}`, file)
  }
  return c.json({ url: `/uploads/${name}` }, 201)
})

// ---------- Quản lý người dùng ----------
const users = new Hono<Env>()
users.get('/', async c => c.json(await sql`select id, email, name, role, active, created_at from users order by id`))
users.post('/', json(userCreateSchema), async c => {
  const { password, email, ...rest } = c.req.valid('json')
  const row = { ...rest, email: email.toLowerCase(), password_hash: await Bun.password.hash(password) }
  const [created] = await sql`insert into users ${sql(row)} returning id, email, name, role, active, created_at`
  return c.json(created, 201)
})
users.put('/:id', json(userUpdateSchema), async c => {
  const id = idParam(c)
  if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
  const { password, ...fields } = c.req.valid('json')
  const [current] = await sql`select role, active from users where id = ${id}`
  if (!current) return c.json({ error: 'Không tìm thấy' }, 404)
  // Không tự hạ quyền/khóa chính mình => luôn còn ít nhất một quản trị viên.
  const changesOwnAccess = id === c.var.user.id && (fields.role !== current.role || fields.active !== current.active)
  if (changesOwnAccess) return c.json({ error: 'Không thể đổi vai trò hoặc khóa chính tài khoản của bạn' }, 400)
  const password_hash = password ? await Bun.password.hash(password) : undefined
  const [updated] = await sql`update users set ${sql(password_hash ? { ...fields, password_hash } : fields)} where id = ${id} returning id, email, name, role, active, created_at`
  if (password || !fields.active) await destroyUserSessions(id)
  return c.json(updated)
})
users.delete('/:id', async c => {
  const id = idParam(c)
  if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
  if (id === c.var.user.id) return c.json({ error: 'Không thể xóa chính tài khoản của bạn' }, 400)
  const deleted = await sql`delete from users where id = ${id} returning id`
  return deleted.length ? c.json({ ok: true }) : c.json({ error: 'Không tìm thấy' }, 404)
})

// ---------- Yêu cầu tư vấn ----------
const inquiries = new Hono<Env>()
inquiries.get('/', async c => {
  const status = c.req.query('status')
  const rows = status
    ? await sql`select * from inquiries where status = ${status} order by created_at desc limit 500`
    : await sql`select * from inquiries order by created_at desc limit 500`
  return c.json(rows)
})
inquiries.put('/:id', json(inquiryUpdateSchema), async c => {
  const id = idParam(c)
  if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
  const [updated] = await sql`update inquiries set ${sql(c.req.valid('json'))} where id = ${id} returning *`
  return updated ? c.json(updated) : c.json({ error: 'Không tìm thấy' }, 404)
})
inquiries.delete('/:id', async c => {
  const id = idParam(c)
  if (!isValidId(id)) return c.json({ error: 'ID không hợp lệ' }, 400)
  const deleted = await sql`delete from inquiries where id = ${id} returning id`
  return deleted.length ? c.json({ ok: true }) : c.json({ error: 'Không tìm thấy' }, 404)
})

// ---------- Cài đặt chung ----------
const settings = new Hono<Env>()
settings.get('/', async c => {
  const rows: { key: string; value: string }[] = await sql`select key, value from settings`
  return c.json(Object.fromEntries(rows.map(row => [row.key, row.value])))
})
settings.put('/', json(settingsSchema), async c => {
  const entries = Object.entries(c.req.valid('json'))
  await Promise.all(entries.map(([key, value]) =>
    sql`insert into settings (key, value) values (${key}, ${value}) on conflict (key) do update set value = excluded.value`))
  return c.json({ ok: true })
})

const admin = new Hono<Env>()
admin.use(requireUser)
admin.use('/services/*', can('content'))
admin.use('/products/*', can('content'))
admin.use('/projects/*', can('content'))
admin.use('/upload/*', can('content'))
admin.use('/inquiries/*', can('inquiries'))
admin.use('/settings/*', can('settings'))
admin.use('/users/*', can('users'))
admin.route('/services', crud('services', serviceSchema))
admin.route('/products', crud('products', productSchema))
admin.route('/projects', crud('projects', projectSchema))
admin.route('/upload', upload)
admin.route('/inquiries', inquiries)
admin.route('/settings', settings)
admin.route('/users', users)

// ---------- Ứng dụng chính ----------
export const app = new Hono<Env>()

app.use('/api/*', csrf())

app.post('/api/contact', json(contactSchema), async c => {
  if (tooMany(`contact:${clientIp(c)}`, 5, 10 * 60_000)) return c.json({ error: 'Bạn gửi quá nhanh, vui lòng thử lại sau ít phút' }, 429)
  const { website, ...inquiry } = c.req.valid('json')
  if (website) return c.json({ ok: true }) // bot: giả vờ thành công, không lưu
  await sql`insert into inquiries ${sql(inquiry)}`
  return c.json({ ok: true }, 201)
})

app.post('/api/auth/login', json(z.object({ email: z.string().max(160), password: z.string().max(200) })), async c => {
  const { email, password } = c.req.valid('json')
  if (tooMany(`login:${email.toLowerCase()}`, 10, 15 * 60_000) || tooMany(`login-ip:${clientIp(c)}`, 30, 15 * 60_000)) {
    return c.json({ error: 'Đăng nhập sai quá nhiều lần, vui lòng thử lại sau' }, 429)
  }
  const userId = await verifyLogin(email, password)
  if (!userId) return c.json({ error: 'Email hoặc mật khẩu không đúng' }, 401)
  const token = await createSession(userId)
  setCookie(c, COOKIE_NAME, token, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: SESSION_SECONDS, secure: process.env.COOKIE_SECURE === 'true' })
  return c.json({ ok: true })
})

app.post('/api/auth/logout', async c => {
  const token = getCookie(c, COOKIE_NAME)
  if (token) await destroySession(token)
  deleteCookie(c, COOKIE_NAME, { path: '/' })
  return c.json({ ok: true })
})

app.get('/api/auth/me', requireUser, c => c.json(c.var.user))

app.put('/api/auth/password', requireUser, json(z.object({ current: z.string().max(200), next: passwordSchema })), async c => {
  const { current, next } = c.req.valid('json')
  const [row] = await sql`select password_hash from users where id = ${c.var.user.id}`
  if (!row || !(await Bun.password.verify(current, row.password_hash))) return c.json({ error: 'Mật khẩu hiện tại không đúng' }, 400)
  await sql`update users set password_hash = ${await Bun.password.hash(next)} where id = ${c.var.user.id}`
  await destroyUserSessions(c.var.user.id, getCookie(c, COOKIE_NAME)) // đăng xuất các thiết bị khác
  return c.json({ ok: true })
})

app.route('/api/admin', admin)

app.get('/uploads/:name', async c => {
  const name = c.req.param('name')
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp|gif)$/.test(name)) return c.notFound()
  if (USE_BLOB) {
    const result = await get(`uploads/${name}`, { access: 'private' })
    if (!result) return c.notFound()
    return new Response(result.stream, {
      headers: {
        'content-type': result.blob.contentType ?? 'application/octet-stream',
        'x-content-type-options': 'nosniff',
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  }
  const file = Bun.file(`${UPLOAD_DIR}/${name}`)
  if (!(await file.exists())) return c.notFound()
  return new Response(file, { headers: { 'content-type': file.type, 'x-content-type-options': 'nosniff', 'cache-control': 'public, max-age=31536000, immutable' } })
})

app.onError((error, c) => {
  if (error instanceof HTTPException) return error.getResponse() // ví dụ 403 do csrf()
  if (isUniqueViolation(error)) return c.json({ error: 'Giá trị đã tồn tại (slug hoặc email trùng)' }, 409)
  console.error(error)
  return c.json({ error: 'Lỗi máy chủ' }, 500)
})

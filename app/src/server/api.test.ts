import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { app } from './api'
import { sql } from './db'

// Kiểm thử tích hợp trên PostgreSQL thật (cần `bun run db:up` và `db:migrate`).
// Dữ liệu dùng hậu tố riêng và được dọn sau khi chạy.
const tag = `t${Date.now()}`
const password = 'mat-khau-test-123'
const emails = { admin: `${tag}-admin@test.local`, editor: `${tag}-editor@test.local`, support: `${tag}-support@test.local` }
const origin = 'http://localhost'

const send = async (path: string, init: { method?: string; body?: unknown; cookie?: string } = {}) =>
  app.request(path, {
    method: init.method ?? 'GET',
    headers: { 'content-type': 'application/json', ...(init.cookie ? { cookie: init.cookie } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })
const statusOf = async (path: string, cookie: string) => (await send(path, { cookie })).status

// Mỗi tài khoản chỉ đăng nhập một lần vì /api/auth/login giới hạn số lần thử.
const sessions = new Map<string, Promise<string>>()
const login = (email: string) => {
  const existing = sessions.get(email)
  if (existing) return existing
  const session = send('/api/auth/login', { method: 'POST', body: { email, password } }).then(response => (response.headers.get('set-cookie') ?? '').split(';')[0])
  sessions.set(email, session)
  return session
}
const userId = async (email: string): Promise<number> => (await sql`select id from users where email = ${email}`)[0].id

const service = { slug: `${tag}-dv`, title: 'Dịch vụ thử', subtitle: '', image: '/assets/images/plant.webp', intro: 'i', description: 'd', scope: ['a', 'b'], position: 99, published: true }
const inquiryForm = { name: tag, phone: '0912 345 678', topic: 'Nhu cầu khác', message: 'xin tư vấn' }
const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])

const uploadFile = (bytes: Uint8Array<ArrayBuffer>, cookie: string) => {
  const form = new FormData()
  form.set('file', new File([bytes], 'x.png', { type: 'image/png' }))
  return app.request('/api/admin/upload', { method: 'POST', headers: { cookie, origin, host: 'localhost' }, body: form })
}

beforeAll(async () => {
  const password_hash = await Bun.password.hash(password)
  await Promise.all(Object.entries(emails).map(([role, email]) => sql`insert into users ${sql({ email, name: role, role, password_hash })}`))
})

afterAll(async () => {
  await sql`delete from users where email like ${`${tag}-%`}`
  await sql`delete from services where slug like ${`${tag}-%`}`
  await sql`delete from inquiries where name = ${tag}`
  await sql.close()
})

describe('given a visitor without a session', () => {
  it('admin_api_is_unauthorized', async () => {
    expect(await statusOf('/api/admin/services', '')).toBe(401)
  })

  it('wrong_password_is_rejected', async () => {
    const response = await send('/api/auth/login', { method: 'POST', body: { email: emails.admin, password: 'sai-mat-khau' } })
    expect(response.status).toBe(401)
  })
})

describe('given an editor session', () => {
  it('content_is_readable', async () => {
    expect(await statusOf('/api/admin/services', await login(emails.editor))).toBe(200)
  })

  it.each(['/api/admin/inquiries', '/api/admin/settings', '/api/admin/users'])('%s_is_forbidden', async path => {
    expect(await statusOf(path, await login(emails.editor))).toBe(403)
  })

  it('a_service_with_an_external_image_url_is_rejected', async () => {
    const cookie = await login(emails.editor)
    const response = await send('/api/admin/services', { method: 'POST', cookie, body: { ...service, slug: `${tag}-img`, image: 'https://evil.example/x.png' } })
    expect(response.status).toBe(400)
  })

  it('a_service_with_an_invalid_slug_is_rejected', async () => {
    const cookie = await login(emails.editor)
    expect((await send('/api/admin/services', { method: 'POST', cookie, body: { ...service, slug: 'Sai Slug' } })).status).toBe(400)
  })

  it('a_png_upload_is_stored_and_served', async () => {
    const response = await uploadFile(pngBytes, await login(emails.editor))
    const { url } = await response.json()
    expect([response.status, (await send(url)).status]).toEqual([201, 200])
  })

  it('a_script_disguised_as_png_is_rejected', async () => {
    const response = await uploadFile(new TextEncoder().encode('<script>alert(1)</script>'), await login(emails.editor))
    expect(response.status).toBe(415)
  })

  it('an_upload_from_another_origin_is_blocked', async () => {
    const form = new FormData()
    form.set('file', new File([pngBytes], 'x.png', { type: 'image/png' }))
    const response = await app.request('/api/admin/upload', { method: 'POST', headers: { cookie: await login(emails.editor), origin: 'https://evil.example', host: 'localhost' }, body: form })
    expect(response.status).toBe(403)
  })
})

describe('given a support session', () => {
  it('inquiries_are_readable', async () => {
    expect(await statusOf('/api/admin/inquiries', await login(emails.support))).toBe(200)
  })

  it.each(['/api/admin/services', '/api/admin/settings', '/api/admin/users'])('%s_is_forbidden', async path => {
    expect(await statusOf(path, await login(emails.support))).toBe(403)
  })
})

describe('given an admin session', () => {
  it.each(['/api/admin/services', '/api/admin/inquiries', '/api/admin/settings', '/api/admin/users'])('%s_is_readable', async path => {
    expect(await statusOf(path, await login(emails.admin))).toBe(200)
  })

  it('a_service_can_be_created_then_deleted', async () => {
    const cookie = await login(emails.admin)
    const created = await send('/api/admin/services', { method: 'POST', cookie, body: { ...service, slug: `${tag}-crud` } })
    const { id } = await created.json()
    const deleted = await send(`/api/admin/services/${id}`, { method: 'DELETE', cookie })
    expect([created.status, deleted.status]).toEqual([201, 200])
  })

  it('a_duplicate_slug_conflicts', async () => {
    const cookie = await login(emails.admin)
    await send('/api/admin/services', { method: 'POST', cookie, body: { ...service, slug: `${tag}-dup` } })
    const duplicate = await send('/api/admin/services', { method: 'POST', cookie, body: { ...service, slug: `${tag}-dup` } })
    expect(duplicate.status).toBe(409)
  })

  it('own_role_cannot_be_lowered', async () => {
    const cookie = await login(emails.admin)
    const response = await send(`/api/admin/users/${await userId(emails.admin)}`, { method: 'PUT', cookie, body: { name: 'admin', role: 'editor', active: true } })
    expect(response.status).toBe(400)
  })

  it('own_account_cannot_be_deleted', async () => {
    const cookie = await login(emails.admin)
    expect((await send(`/api/admin/users/${await userId(emails.admin)}`, { method: 'DELETE', cookie })).status).toBe(400)
  })

  it('deactivating_a_user_ends_their_session', async () => {
    const [admin, support] = await Promise.all([login(emails.admin), login(emails.support)])
    await send(`/api/admin/users/${await userId(emails.support)}`, { method: 'PUT', cookie: admin, body: { name: 'support', role: 'support', active: false } })
    expect(await statusOf('/api/auth/me', support)).toBe(401)
  })
})

describe('given a role change on a logged-in user', () => {
  it('new_permissions_apply_on_the_next_request', async () => {
    const [admin, editor] = await Promise.all([login(emails.admin), login(emails.editor)])
    await send(`/api/admin/users/${await userId(emails.editor)}`, { method: 'PUT', cookie: admin, body: { name: 'editor', role: 'support', active: true } })
    expect(await statusOf('/api/admin/inquiries', editor)).toBe(200)
  })
})

describe('given a contact form submission', () => {
  it('a_valid_form_is_stored_as_a_new_inquiry', async () => {
    const response = await send('/api/contact', { method: 'POST', body: inquiryForm })
    const [stored] = await sql`select status from inquiries where name = ${tag}`
    expect([response.status, stored.status]).toEqual([201, 'new'])
  })

  it('a_form_with_an_invalid_phone_is_rejected', async () => {
    expect((await send('/api/contact', { method: 'POST', body: { ...inquiryForm, phone: 'abc' } })).status).toBe(400)
  })

  it('a_form_with_the_hidden_field_filled_is_not_stored', async () => {
    const before = (await sql`select count(*)::int as n from inquiries where name = ${tag}`)[0].n
    await send('/api/contact', { method: 'POST', body: { ...inquiryForm, website: 'http://spam' } })
    const after = (await sql`select count(*)::int as n from inquiries where name = ${tag}`)[0].n
    expect(after).toBe(before)
  })
})

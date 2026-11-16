import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ApiError, apiGet, apiSend } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'
import { ROLES, isRole, type Role } from '../../../lib/permissions'
import type { AdminUser } from '../../../lib/types'

export const Route = createFileRoute('/admin/_panel/users')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'users'),
  loader: () => apiGet<AdminUser[]>('/api/admin/users'),
  component: Users,
})

const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : 'Có lỗi xảy ra')

function RoleSelect({ value, onChange, disabled }: { value: Role; onChange: (role: Role) => void; disabled?: boolean }) {
  return (
    <select value={value} disabled={disabled} onChange={event => { if (isRole(event.target.value)) onChange(event.target.value) }}>
      {Object.entries(ROLES).map(([key, role]) => <option key={key} value={key}>{role.label}</option>)}
    </select>
  )
}

function CreateUser() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('editor')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    try {
      await apiSend('POST', '/api/admin/users', { ...data, role })
      setError('')
      form.reset()
      await router.invalidate()
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <form className="card form-grid" onSubmit={onSubmit}>
      <h2>Thêm người dùng</h2>
      <label className="field">Họ tên<input name="name" required maxLength={100} /></label>
      <label className="field">Email<input name="email" type="email" required autoComplete="off" /></label>
      <label className="field">Mật khẩu ban đầu<input name="password" type="password" minLength={10} required autoComplete="new-password" /><small>Ít nhất 10 ký tự. Người dùng nên đổi sau khi đăng nhập.</small></label>
      <label className="field">Vai trò<RoleSelect value={role} onChange={setRole} /></label>
      <p className="muted">{ROLES[role].label}: {ROLES[role].can.join(', ')}</p>
      <div className="actions"><button className="btn">Tạo tài khoản</button></div>
      <p className="error" role="alert" hidden={!error}>{error}</p>
    </form>
  )
}

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const router = useRouter()
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [active, setActive] = useState(user.active)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const save = async () => {
    try {
      await apiSend('PUT', `/api/admin/users/${user.id}`, { name, role, active, ...(password ? { password } : {}) })
      setPassword('')
      setMessage('Đã lưu')
      await router.invalidate()
    } catch (failure) {
      setMessage(errorMessage(failure))
    }
  }
  const remove = async () => {
    if (!confirm(`Xóa tài khoản ${user.email}?`)) return
    try {
      await apiSend('DELETE', `/api/admin/users/${user.id}`)
      await router.invalidate()
    } catch (failure) {
      setMessage(errorMessage(failure))
    }
  }

  return (
    <tr>
      <td><input value={name} onChange={event => setName(event.target.value)} aria-label="Họ tên" /><div className="muted">{user.email}</div></td>
      <td><RoleSelect value={role} onChange={setRole} disabled={isSelf} /></td>
      <td><label className="field inline"><input type="checkbox" checked={active} disabled={isSelf} onChange={event => setActive(event.target.checked)} />Hoạt động</label></td>
      <td><input type="password" placeholder="Mật khẩu mới (tùy chọn)" value={password} minLength={10} autoComplete="new-password" onChange={event => setPassword(event.target.value)} aria-label="Mật khẩu mới" /></td>
      <td>
        <div className="actions">
          <button className="btn small" onClick={save}>Lưu</button>
          <button className="btn danger small" onClick={remove} disabled={isSelf}>Xóa</button>
        </div>
        <div className="muted" role="status">{message}</div>
      </td>
    </tr>
  )
}

function Users() {
  const users = Route.useLoaderData()
  const { user: me } = Route.useRouteContext()
  return (
    <>
      <h1>Người dùng &amp; phân quyền</h1>
      <div className="card">
        <table>
          <thead><tr><th>Người dùng</th><th>Vai trò</th><th>Trạng thái</th><th>Đặt lại mật khẩu</th><th /></tr></thead>
          <tbody>{users.map(user => <UserRow key={`${user.id}-${user.role}-${user.active}`} user={user} isSelf={user.id === me.id} />)}</tbody>
        </table>
      </div>
      <CreateUser />
    </>
  )
}

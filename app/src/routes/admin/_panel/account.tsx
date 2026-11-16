import { useState, type FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { ApiError, apiSend } from '../../../lib/admin-api'
import { ROLES } from '../../../lib/permissions'

export const Route = createFileRoute('/admin/_panel/account')({ component: Account })

function Account() {
  const { user } = Route.useRouteContext()
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    try {
      await apiSend('PUT', '/api/auth/password', { current: data.get('current'), next: data.get('next') })
      setFailed(false)
      setMessage('Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.')
      form.reset()
    } catch (failure) {
      setFailed(true)
      setMessage(failure instanceof ApiError ? failure.message : 'Không đổi được mật khẩu')
    }
  }

  return (
    <>
      <h1>Tài khoản của tôi</h1>
      <div className="card">
        <p><strong>{user.name}</strong> · {user.email}</p>
        <p className="muted">Vai trò: {ROLES[user.role].label}</p>
      </div>
      <form className="card form-grid" onSubmit={onSubmit}>
        <h2>Đổi mật khẩu</h2>
        <label className="field">Mật khẩu hiện tại<input name="current" type="password" autoComplete="current-password" required /></label>
        <label className="field">Mật khẩu mới<input name="next" type="password" autoComplete="new-password" minLength={10} required /><small>Ít nhất 10 ký tự.</small></label>
        <div className="actions"><button className="btn">Đổi mật khẩu</button></div>
        <p className={failed ? 'error' : 'success'} role="status">{message}</p>
      </form>
    </>
  )
}

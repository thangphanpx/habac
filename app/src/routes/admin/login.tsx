import { useState, type FormEvent } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { ApiError, apiSend, fetchMe } from '../../lib/admin-api'

export const Route = createFileRoute('/admin/login')({
  beforeLoad: async () => {
    if (await fetchMe()) throw redirect({ to: '/admin' })
  },
  component: Login,
})

function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    setError('')
    try {
      await apiSend('POST', '/api/auth/login', { email: data.get('email'), password: data.get('password') })
      await navigate({ to: '/admin' })
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Không đăng nhập được')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <form className="card form-grid" onSubmit={onSubmit}>
        <h1>Đăng nhập quản trị</h1>
        <label className="field">Email<input name="email" type="email" autoComplete="username" required /></label>
        <label className="field">Mật khẩu<input name="password" type="password" autoComplete="current-password" required /></label>
        <button className="btn" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
        <p className="error" role="alert" hidden={!error}>{error}</p>
      </form>
    </div>
  )
}

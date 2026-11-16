import { Link, Outlet, createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { apiSend, fetchMe } from '../../lib/admin-api'
import { ROLES, hasPermission } from '../../lib/permissions'

export const Route = createFileRoute('/admin/_panel')({
  beforeLoad: async () => {
    const user = await fetchMe()
    if (!user) throw redirect({ to: '/admin/login' })
    return { user }
  },
  component: Panel,
})

function Panel() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const current = { 'aria-current': 'page' as const }
  const allowed = (permission: Parameters<typeof hasPermission>[1]) => hasPermission(user.role, permission)

  const logout = async () => {
    await apiSend('POST', '/api/auth/logout')
    await navigate({ to: '/admin/login' })
  }

  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Quản trị">
        <div className="brand">Ngân Hà · Quản trị</div>
        {allowed('inquiries') ? <Link to="/admin/inquiries" activeProps={current}>Yêu cầu tư vấn</Link> : null}
        {allowed('content') ? <Link to="/admin/services" activeProps={current}>Dịch vụ</Link> : null}
        {allowed('content') ? <Link to="/admin/products" activeProps={current}>Thiết bị</Link> : null}
        {allowed('content') ? <Link to="/admin/projects" activeProps={current}>Công trình</Link> : null}
        {allowed('settings') ? <Link to="/admin/settings" activeProps={current}>Thông tin công ty</Link> : null}
        {allowed('users') ? <Link to="/admin/users" activeProps={current}>Người dùng</Link> : null}
        <Link to="/admin/account" activeProps={current}>Tài khoản của tôi</Link>
        <a href="/" target="_blank" rel="noopener noreferrer">Xem website ↗</a>
        <div className="who">
          <strong>{user.name}</strong>
          {ROLES[user.role].label}
          <div><button className="btn secondary small" onClick={logout}>Đăng xuất</button></div>
        </div>
      </nav>
      <main className="content"><Outlet /></main>
    </div>
  )
}

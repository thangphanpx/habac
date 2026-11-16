import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ApiError, apiGet, apiSend } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'
import type { Site } from '../../../lib/types'

export const Route = createFileRoute('/admin/_panel/settings')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'settings'),
  loader: () => apiGet<Site>('/api/admin/settings'),
  component: Settings,
})

const FIELDS: { name: keyof Site; label: string; type?: string }[] = [
  { name: 'company', label: 'Tên công ty' },
  { name: 'address', label: 'Địa chỉ văn phòng' },
  { name: 'phone', label: 'Số điện thoại / Zalo' },
  { name: 'email', label: 'Email nhận liên hệ', type: 'email' },
]

function Settings() {
  const site = Route.useLoaderData()
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    try {
      await apiSend('PUT', '/api/admin/settings', data)
      setFailed(false)
      setMessage('Đã lưu. Website cập nhật ngay.')
      await router.invalidate()
    } catch (failure) {
      setFailed(true)
      setMessage(failure instanceof ApiError ? failure.message : 'Không lưu được')
    }
  }

  return (
    <>
      <h1>Thông tin công ty</h1>
      <form className="card form-grid" onSubmit={onSubmit}>
        {FIELDS.map(field => (
          <label key={field.name} className="field">{field.label}
            <input name={field.name} type={field.type ?? 'text'} defaultValue={site[field.name]} required />
          </label>
        ))}
        <div className="actions"><button className="btn">Lưu</button></div>
        <p className={failed ? 'error' : 'success'} role="status">{message}</p>
      </form>
    </>
  )
}

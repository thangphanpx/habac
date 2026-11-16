import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ApiError, apiGet, apiSend } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'
import { INQUIRY_STATUS } from '../../../lib/permissions'
import type { Inquiry } from '../../../lib/types'

export const Route = createFileRoute('/admin/_panel/inquiries')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'inquiries'),
  loader: () => apiGet<Inquiry[]>('/api/admin/inquiries'),
  component: Inquiries,
})

const isStatus = (value: string): value is Inquiry['status'] => value in INQUIRY_STATUS
const formatDate = (iso: string) => new Date(iso).toLocaleString('vi-VN')

function InquiryItem({ inquiry }: { inquiry: Inquiry }) {
  const router = useRouter()
  const [status, setStatus] = useState(inquiry.status)
  const [note, setNote] = useState(inquiry.note)
  const [message, setMessage] = useState('')

  const save = async (event: FormEvent) => {
    event.preventDefault()
    try {
      await apiSend('PUT', `/api/admin/inquiries/${inquiry.id}`, { status, note })
      setMessage('Đã lưu')
      await router.invalidate()
    } catch (failure) {
      setMessage(failure instanceof ApiError ? failure.message : 'Không lưu được')
    }
  }
  const remove = async () => {
    if (!confirm('Xóa yêu cầu này?')) return
    await apiSend('DELETE', `/api/admin/inquiries/${inquiry.id}`)
    await router.invalidate()
  }

  return (
    <details className="card inquiry">
      <summary>
        <span className={`badge ${inquiry.status}`}>{INQUIRY_STATUS[inquiry.status]}</span>
        <strong>{inquiry.name}</strong>
        <span>{inquiry.phone}</span>
        <span className="muted">{inquiry.topic} · {formatDate(inquiry.created_at)}</span>
      </summary>
      <div className="inquiry-body">
        <p><a href={`tel:${inquiry.phone.replace(/[^\d+]/g, '')}`}>{inquiry.phone}</a>{inquiry.email ? <> · <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a></> : null}</p>
        <p>{inquiry.message || <span className="muted">(Không có nội dung)</span>}</p>
        <form className="form-grid" onSubmit={save}>
          <label className="field">Trạng thái
            <select value={status} onChange={event => { if (isStatus(event.target.value)) setStatus(event.target.value) }}>
              {Object.entries(INQUIRY_STATUS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label className="field">Ghi chú nội bộ<textarea value={note} maxLength={2000} onChange={event => setNote(event.target.value)} /></label>
          <div className="actions">
            <button className="btn">Lưu</button>
            <button type="button" className="btn danger" onClick={remove}>Xóa</button>
            <span className="muted" role="status">{message}</span>
          </div>
        </form>
      </div>
    </details>
  )
}

function Inquiries() {
  const inquiries = Route.useLoaderData()
  const [filter, setFilter] = useState('all')
  const visible = filter === 'all' ? inquiries : inquiries.filter(item => item.status === filter)

  return (
    <>
      <div className="toolbar">
        <h1>Yêu cầu tư vấn</h1>
        <label className="field inline">Lọc
          <select value={filter} onChange={event => setFilter(event.target.value)}>
            <option value="all">Tất cả ({inquiries.length})</option>
            {Object.entries(INQUIRY_STATUS).map(([key, label]) => <option key={key} value={key}>{label} ({inquiries.filter(item => item.status === key).length})</option>)}
          </select>
        </label>
      </div>
      {visible.map(inquiry => <InquiryItem key={`${inquiry.id}-${inquiry.status}-${inquiry.note}`} inquiry={inquiry} />)}
      {visible.length === 0 ? <p className="muted">Chưa có yêu cầu nào.</p> : null}
    </>
  )
}

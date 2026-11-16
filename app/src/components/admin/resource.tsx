import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from '@tanstack/react-router'
import { ApiError, apiSend, uploadImage } from '../../lib/admin-api'

export type Field = {
  name: string
  label: string
  kind: 'text' | 'textarea' | 'lines' | 'image' | 'number' | 'checkbox' | 'select'
  options?: Record<string, string>
  hint?: string
  defaultValue?: string
  optional?: boolean
}
export type Row = { id: number } & Record<string, unknown>
type Draft = Record<string, string | boolean>

const initialValue = (field: Field, value: unknown): string | boolean => {
  if (field.kind === 'checkbox') return value === undefined ? true : Boolean(value)
  if (field.kind === 'lines') return Array.isArray(value) ? value.join('\n') : ''
  if (field.kind === 'select') return String(value ?? Object.keys(field.options ?? {})[0] ?? '')
  return String(value ?? field.defaultValue ?? (field.kind === 'number' ? '0' : ''))
}

const toDraft = (fields: Field[], row: Row | null): Draft =>
  Object.fromEntries(fields.map(field => [field.name, initialValue(field, row?.[field.name])]))

const payloadValue = (field: Field, value: string | boolean): unknown => {
  if (field.kind === 'number') return Number(value)
  if (field.kind === 'lines') return String(value).split('\n').map(line => line.trim()).filter(Boolean)
  return value
}
const toPayload = (fields: Field[], draft: Draft) =>
  Object.fromEntries(fields.map(field => [field.name, payloadValue(field, draft[field.name])]))

const errorMessage = (error: unknown) => (error instanceof ApiError ? error.message : 'Có lỗi xảy ra, vui lòng thử lại')

function ImageInput({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const onFile = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadImage(file))
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="image-field">
      {value ? <img src={value} alt="" /> : <div />}
      <div className="form-grid">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={event => onFile(event.target.files?.[0])} />
        <input value={value} onChange={event => onChange(event.target.value)} placeholder="/uploads/… hoặc /assets/images/…" />
        <small>{busy ? 'Đang tải ảnh lên…' : 'Chọn ảnh mới (PNG/JPG/WebP/GIF, tối đa 5 MB) hoặc nhập đường dẫn ảnh có sẵn.'}</small>
        <p className="error" hidden={!error}>{error}</p>
      </div>
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: Field; value: string | boolean; onChange: (value: string | boolean) => void }) {
  const text = String(value)
  if (field.kind === 'checkbox') {
    return <label className="field inline"><input type="checkbox" checked={value === true} onChange={event => onChange(event.target.checked)} />{field.label}</label>
  }
  if (field.kind === 'image') {
    return <div className="field">{field.label}<ImageInput value={text} onChange={onChange} /></div>
  }
  const control = {
    textarea: <textarea value={text} required={!field.optional} onChange={event => onChange(event.target.value)} />,
    lines: <textarea value={text} rows={6} onChange={event => onChange(event.target.value)} />,
    number: <input type="number" min={0} max={9999} value={text} onChange={event => onChange(event.target.value)} />,
    select: <select value={text} onChange={event => onChange(event.target.value)}>{Object.entries(field.options ?? {}).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>,
    text: <input value={text} required={!field.optional} onChange={event => onChange(event.target.value)} />,
  }[field.kind]
  return <label className="field">{field.label}{control}{field.hint ? <small>{field.hint}</small> : null}</label>
}

function ResourceForm({ endpoint, fields, row, onDone }: { endpoint: string; fields: Field[]; row: Row | null; onDone: () => void }) {
  const [draft, setDraft] = useState(() => toDraft(fields, row))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await (row ? apiSend('PUT', `${endpoint}/${row.id}`, toPayload(fields, draft)) : apiSend('POST', endpoint, toPayload(fields, draft)))
      onDone()
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card form-grid" onSubmit={onSubmit}>
      <h2>{row ? 'Sửa mục' : 'Thêm mới'}</h2>
      {fields.map(field => (
        <FieldInput key={field.name} field={field} value={draft[field.name]} onChange={value => setDraft(current => ({ ...current, [field.name]: value }))} />
      ))}
      <p className="error" role="alert" hidden={!error}>{error}</p>
      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? 'Đang lưu…' : 'Lưu'}</button>
        <button type="button" className="btn secondary" onClick={onDone}>Hủy</button>
      </div>
    </form>
  )
}

export function ResourcePage({ endpoint, title, fields, columns, rows }: {
  endpoint: string
  title: string
  fields: Field[]
  columns: { label: string; render: (row: Row) => ReactNode }[]
  rows: Row[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState<Row | 'new' | null>(null)
  const [error, setError] = useState('')

  const finish = async () => {
    setEditing(null)
    await router.invalidate()
  }
  const remove = async (row: Row) => {
    if (!confirm('Xóa mục này? Thao tác không thể hoàn tác.')) return
    try {
      await apiSend('DELETE', `${endpoint}/${row.id}`)
      setError('')
      await router.invalidate()
    } catch (failure) {
      setError(errorMessage(failure))
    }
  }

  return (
    <>
      <div className="toolbar">
        <h1>{title}</h1>
        <button className="btn" onClick={() => setEditing('new')}>+ Thêm mới</button>
      </div>
      {editing ? <ResourceForm key={editing === 'new' ? 'new' : editing.id} endpoint={endpoint} fields={fields} row={editing === 'new' ? null : editing} onDone={finish} /> : null}
      <p className="error" role="alert" hidden={!error}>{error}</p>
      <div className="card">
        <table>
          <thead><tr>{columns.map(column => <th key={column.label}>{column.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                {columns.map(column => <td key={column.label}>{column.render(row)}</td>)}
                <td><div className="actions">
                  <button className="btn secondary small" onClick={() => setEditing(row)}>Sửa</button>
                  <button className="btn danger small" onClick={() => remove(row)}>Xóa</button>
                </div></td>
              </tr>
            ))}
            {rows.length === 0 ? <tr><td colSpan={columns.length + 1} className="muted">Chưa có dữ liệu.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  )
}

export const thumbnail = (row: Row) => <img className="thumb" src={String(row.image)} alt="" />
export const publishedBadge = (row: Row) => (row.published ? <span className="badge">Hiển thị</span> : <span className="badge off">Ẩn</span>)

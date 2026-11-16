import { useState, type FormEvent } from 'react'
import { createFileRoute, getRouteApi } from '@tanstack/react-router'
import { Icon, Intro, pageHead } from '../../components/site'
import { CONTACT_TOPICS } from '../../lib/permissions'

export const Route = createFileRoute('/_site/lien-he')({
  validateSearch: (search: Record<string, unknown>): { 'dich-vu'?: string } => (typeof search['dich-vu'] === 'string' ? { 'dich-vu': search['dich-vu'] } : {}),
  head: () => pageHead('Liên hệ tư vấn', 'Liên hệ Ngân Hà EC để được tư vấn giải pháp xử lý nước và môi trường.'),
  component: Contact,
})

type Result = { kind: 'ok' | 'error'; message: string }

const isTopic = (value: string | undefined): value is (typeof CONTACT_TOPICS)[number] =>
  CONTACT_TOPICS.some(topic => topic === value)

async function submitInquiry(form: HTMLFormElement): Promise<Result> {
  const body = Object.fromEntries(new FormData(form))
  const response = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
  if (response.ok) return { kind: 'ok', message: 'Ngân Hà đã nhận được yêu cầu của bạn và sẽ liên hệ lại sớm nhất.' }
  const error: { error?: string } = await response.json().catch(() => ({}))
  return { kind: 'error', message: error.error ?? 'Không gửi được yêu cầu. Vui lòng kiểm tra thông tin hoặc gọi trực tiếp cho Ngân Hà.' }
}

function Contact() {
  const site = getRouteApi('/_site').useLoaderData()
  const { 'dich-vu': topicFromLink } = Route.useSearch()
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const digits = site.phone.replace(/\D/g, '')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setSending(true)
    const outcome = await submitInquiry(form).catch((): Result => ({ kind: 'error', message: 'Mất kết nối. Vui lòng thử lại.' }))
    setSending(false)
    setResult(outcome)
    if (outcome.kind === 'ok') form.reset()
  }

  return (
    <>
      <Intro title="Bắt đầu từ một trao đổi" text="Chia sẻ nhu cầu của bạn. Ngân Hà sẽ cùng bạn làm rõ yêu cầu kỹ thuật và hướng triển khai phù hợp." />
      <section className="section">
        <div className="wrap contact-layout">
          <div>
            <h2>Kết nối với Ngân Hà</h2>
            <dl className="contact-data">
              <div><dt>Điện thoại tư vấn</dt><dd><a href={`tel:${digits}`}>{site.phone}</a></dd></div>
              <div><dt>Email</dt><dd><a href={`mailto:${site.email}`}>{site.email}</a></dd></div>
              <div><dt>Văn phòng</dt><dd className="address">{site.address}</dd></div>
            </dl>
            <a className="text-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`} target="_blank" rel="noopener noreferrer">Tìm đường đến văn phòng <Icon /></a>
            <p><a className="text-link" href={`https://zalo.me/${digits}`} target="_blank" rel="noopener noreferrer">Trao đổi qua Zalo <Icon /></a></p>
          </div>
          <form className="contact-form" onSubmit={onSubmit}>
            <h2>Thông tin cần tư vấn</h2>
            <div className="form-grid">
              <label className="field">Họ và tên *<input name="name" autoComplete="name" required maxLength={100} placeholder="Nguyễn Văn An" /></label>
              <label className="field">Số điện thoại *<input name="phone" type="tel" autoComplete="tel" required maxLength={24} placeholder="Số điện thoại liên hệ" /></label>
              <label className="field field-full">Email<input name="email" type="email" autoComplete="email" maxLength={160} placeholder="ten@doanhnghiep.vn" /></label>
              <label className="field field-full">Bạn đang quan tâm đến
                <select name="topic" defaultValue={isTopic(topicFromLink) ? topicFromLink : CONTACT_TOPICS[0]}>
                  {CONTACT_TOPICS.map(topic => <option key={topic}>{topic}</option>)}
                </select>
              </label>
              <label className="field field-full">Nội dung trao đổi<textarea name="message" maxLength={2500} placeholder="Loại hình công trình, vị trí, công suất dự kiến hoặc nhu cầu của bạn…" /></label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />
            </div>
            <p className="form-note" id="contact-note">Thông tin được gửi trực tiếp đến Ngân Hà và chỉ dùng để liên hệ tư vấn. Các trường có dấu * là bắt buộc.</p>
            <button className="btn" type="submit" aria-describedby="contact-note" disabled={sending}>{sending ? 'Đang gửi…' : 'Gửi yêu cầu tư vấn'} <Icon /></button>
            <div className="form-result" role="status" hidden={!result}>{result?.message}</div>
          </form>
        </div>
      </section>
    </>
  )
}

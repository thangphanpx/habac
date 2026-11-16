import { useEffect, useState, type ReactNode } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { Site } from '../lib/types'

const ICONS = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  phone: <path d="M6 3H3v3c0 8.3 6.7 15 15 15h3v-3l-5-2-2 2a13 13 0 0 1-8-8l2-2-2-5Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 7 9-7" /></>,
}

export function Icon({ name = 'arrow' }: { name?: keyof typeof ICONS }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>
}

export const asset = (name: string) => `/assets/images/${name}.webp`

export function Photo({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  return (
    <img src={src} width={1200} height={900} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : undefined} />
  )
}

export const pageTitle = (title: string) => `${title} | Ngân Hà EC`
export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: pageTitle(title) },
    { name: 'description', content: description },
    { property: 'og:title', content: pageTitle(title) },
    { property: 'og:description', content: description },
  ],
})

export function Intro({ title, text, parent }: { title: string; text: string; parent?: ReactNode }) {
  return (
    <section className="page-intro">
      <div className="wrap">
        <nav className="breadcrumb" aria-label="Đường dẫn">
          <Link to="/">Trang chủ</Link>
          <span aria-hidden="true">/</span>
          {parent ? <>{parent}<span aria-hidden="true">/</span></> : null}
          <span aria-current="page">{title}</span>
        </nav>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
    </section>
  )
}

const PHONE_DIGITS = (phone: string) => phone.replace(/\D/g, '')

export function Header() {
  const [open, setOpen] = useState(false)
  const pathname = useRouterState({ select: state => state.location.pathname })

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || event.target.closest('.site-header')) return
      setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const desktop = matchMedia('(min-width: 821px)')
    const closeOnDesktop = () => setOpen(false)
    document.addEventListener('click', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      document.removeEventListener('click', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [])

  const current = { 'aria-current': 'page' as const }
  return (
    <>
      <a className="skip-link" href="#main">Đến nội dung chính</a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Link className="brand" to="/" aria-label="Ngân Hà EC, trang chủ">
            <span className="brand-name">ngân hà<span className="brand-suffix">ec</span></span>
            <span className="brand-description">Môi trường &amp; Xây dựng</span>
          </Link>
          <button className="menu-toggle" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen(value => !value)}>
            Menu <Icon name="menu" />
          </button>
          <nav className={open ? 'nav is-open' : 'nav'} id="main-nav" aria-label="Điều hướng chính">
            <Link to="/dich-vu" activeProps={current}>Giải pháp</Link>
            <Link to="/du-an" activeProps={current}>Công trình</Link>
            <Link to="/gioi-thieu" activeProps={current}>Về Ngân Hà</Link>
            <Link to="/thiet-bi" activeProps={current}>Thiết bị</Link>
            <Link className="btn" to="/lien-he" activeProps={current}>Cùng trao đổi <Icon /></Link>
          </nav>
        </div>
      </header>
    </>
  )
}

export function Footer({ site }: { site: Site }) {
  const digits = PHONE_DIGITS(site.phone)
  return (
    <>
      <section className="contact-band">
        <div className="wrap">
          <div>
            <h2>Bắt đầu một<br />dòng chảy mới.</h2>
            <p>Một cuộc trao đổi hôm nay.<br />Một giải pháp phù hợp cho ngày mai.</p>
          </div>
          <div className="band-actions">
            <Link className="contact-orbit" to="/lien-he" aria-label="Liên hệ tư vấn"><Icon /></Link>
            <div>
              <Link className="text-link" to="/lien-he">Cùng trao đổi</Link>
              <a className="contact-phone" href={`tel:${digits}`}>{site.phone}</a>
            </div>
          </div>
        </div>
      </section>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <strong>{site.company}</strong>
              <p>Giải pháp kỹ thuật hôm nay.<br />Giá trị môi trường lâu dài.</p>
              <p className="footer-address">{site.address}</p>
            </div>
            <div>
              <strong>Khám phá</strong>
              <ul>
                <li><Link to="/gioi-thieu">Về Ngân Hà</Link></li>
                <li><Link to="/dich-vu">Giải pháp môi trường</Link></li>
                <li><Link to="/thiet-bi">Thiết bị xử lý nước</Link></li>
                <li><Link to="/du-an">Công trình thực tế</Link></li>
              </ul>
            </div>
            <div>
              <strong>Luôn sẵn sàng lắng nghe</strong>
              <ul>
                <li><a href={`tel:${digits}`}>{site.phone}</a></li>
                <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
                <li><a href={`https://zalo.me/${digits}`} target="_blank" rel="noopener noreferrer">Kết nối qua Zalo</a></li>
              </ul>
            </div>
          </div>
          <p className="footer-name">ngân hà.</p>
          <div className="footer-bottom">
            <p>© Ngân Hà EC</p>
            <p>Ảnh thiên nhiên: <a href="https://unsplash.com/photos/yQJfvo_9eBs" target="_blank" rel="noopener noreferrer">Rod Long / Unsplash</a></p>
            <a href="#top">Về đầu trang <Icon name="up" /></a>
          </div>
        </div>
      </footer>
      <aside className="contact-bubbles" aria-label="Liên hệ nhanh với Ngân Hà">
        <a className="contact-bubble bubble-email" href={`mailto:${site.email}`} aria-label={`Gửi email đến ${site.email}`} title="Gửi email"><Icon name="email" /><span>Email</span></a>
        <a className="contact-bubble bubble-zalo" href={`https://zalo.me/${digits}`} target="_blank" rel="noopener noreferrer" aria-label={`Nhắn Zalo cho Ngân Hà, ${site.phone}`} title="Nhắn Zalo"><b aria-hidden="true">Zalo</b><span>Nhắn Zalo</span></a>
        <a className="contact-bubble bubble-phone" href={`tel:${digits}`} aria-label={`Gọi Ngân Hà, ${site.phone}`} title={`Gọi ${site.phone}`}><Icon name="phone" /><span>Gọi ngay</span></a>
      </aside>
    </>
  )
}

const REVEAL_SELECTOR = '[data-reveal], .page-intro h1, .page-intro p, .contact-data > div, .contact-form h2, .contact-form .field, .contact-form .btn, .contact-band h2, .contact-band p, .band-actions, .footer-grid > div'

// Hiệu ứng xuất hiện khi cuộn; chạy lại sau mỗi lần đổi trang.
export function useRevealOnScroll() {
  const pathname = useRouterState({ select: state => state.location.pathname })
  useEffect(() => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)')
    if (reduceMotion.matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(({ target }) => {
        const isPicture = target.matches('figure, .intro-pictures, .hero-media')
        if (target instanceof HTMLElement) target.style.animationDelay = `${Number(target.dataset.delay ?? 0)}ms`
        target.classList.add(isPicture ? 'reveal-picture' : 'reveal-in')
        observer.unobserve(target)
      })
    }, { threshold: 0.12 })
    document.querySelectorAll(REVEAL_SELECTOR).forEach(element => observer.observe(element))
    const pauseWhenHidden = () => document.documentElement.classList.toggle('motion-paused', document.hidden)
    document.addEventListener('visibilitychange', pauseWhenHidden)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', pauseWhenHidden)
    }
  }, [pathname])
}

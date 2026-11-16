import type { ReactNode } from 'react'
import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width,initial-scale=1' },
      { name: 'theme-color', content: '#153c52' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'vi_VN' },
    ],
    links: [
      { rel: 'icon', href: '/assets/images/logo.png' },
    ],
  }),
  component: () => (
    <RootDocument>
      <Outlet />
    </RootDocument>
  ),
  notFoundComponent: () => (
    <main id="main" className="page-intro">
      <div className="wrap">
        <h1>Không tìm thấy trang</h1>
        <p>Đường dẫn bạn mở không tồn tại hoặc đã được chuyển đi.</p>
        <Link className="btn" to="/">Về trang chủ</Link>
      </div>
    </main>
  ),
})

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="vi" id="top">
      <head>
        <HeadContent />
        <noscript><link rel="stylesheet" href="/assets/nojs.css" /></noscript>
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

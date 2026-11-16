import { Outlet, createFileRoute } from '@tanstack/react-router'

// Khu quản trị chỉ chạy ở trình duyệt: dữ liệu lấy qua /api/admin (Hono) kèm cookie phiên.
export const Route = createFileRoute('/admin')({
  ssr: false,
  head: () => ({
    meta: [{ title: 'Quản trị | Ngân Hà EC' }, { name: 'robots', content: 'noindex,nofollow' }],
    links: [{ rel: 'stylesheet', href: '/assets/admin.css' }],
  }),
  component: Outlet,
})

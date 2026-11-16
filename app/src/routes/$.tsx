import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { legacyTarget } from '../lib/legacy'

// Mọi đường dẫn không khớp route nào: chuyển hướng 301 nếu là URL cũ, ngược lại 404.
export const Route = createFileRoute('/$')({
  beforeLoad: ({ location }) => {
    const target = legacyTarget(location.pathname)
    if (target) throw redirect({ href: target, statusCode: 301 })
    throw notFound()
  },
})

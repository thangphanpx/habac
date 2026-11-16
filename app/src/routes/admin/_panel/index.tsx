import { createFileRoute, redirect } from '@tanstack/react-router'
import { hasPermission } from '../../../lib/permissions'

// Chuyển tới mục đầu tiên mà vai trò hiện tại được phép dùng.
export const Route = createFileRoute('/admin/_panel/')({
  beforeLoad: ({ context }) => {
    const { role } = context.user
    if (hasPermission(role, 'inquiries')) throw redirect({ to: '/admin/inquiries' })
    if (hasPermission(role, 'content')) throw redirect({ to: '/admin/services' })
    throw redirect({ to: '/admin/account' })
  },
})

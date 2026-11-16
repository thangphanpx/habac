import { redirect } from '@tanstack/react-router'
import { hasPermission, type Permission } from './permissions'
import type { SessionUser } from './types'

// Chỉ để điều hướng gọn; quyền thật được kiểm tra lại ở server cho mọi API.
export function requirePermission(user: SessionUser, permission: Permission) {
  if (!hasPermission(user.role, permission)) throw redirect({ to: '/admin' })
}

// Dùng chung cho server (kiểm tra thật) và giao diện admin (chỉ để ẩn menu).
export const ROLES = {
  admin: { label: 'Quản trị viên', can: ['content', 'inquiries', 'settings', 'users'] },
  editor: { label: 'Biên tập nội dung', can: ['content'] },
  support: { label: 'Chăm sóc khách hàng', can: ['inquiries'] },
} as const

export type Role = keyof typeof ROLES
export type Permission = (typeof ROLES)[Role]['can'][number]

export const isRole = (value: unknown): value is Role => typeof value === 'string' && value in ROLES
export const hasPermission = (role: Role, permission: Permission) =>
  (ROLES[role].can as readonly string[]).includes(permission)

export const PROJECT_CATEGORIES = {
  water: 'Hệ thống xử lý',
  equipment: 'Thiết bị & đường ống',
  construction: 'Thi công & lắp đặt',
} as const
export const INQUIRY_STATUS = { new: 'Mới', in_progress: 'Đang xử lý', done: 'Đã xong' } as const
export const CONTACT_TOPICS = ['Nước thải sinh hoạt', 'Nước thải công nghiệp', 'Hồ sơ môi trường', 'Thiết bị môi trường', 'Nhu cầu khác'] as const

import { createFileRoute } from '@tanstack/react-router'
import { ResourcePage, publishedBadge, thumbnail, type Field, type Row } from '../../../components/admin/resource'
import { apiGet } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'

const FIELDS: Field[] = [
  { name: 'title', label: 'Tên thiết bị', kind: 'text' },
  { name: 'slug', label: 'Đường dẫn (slug)', kind: 'text', hint: 'Chữ thường, số, dấu gạch ngang. Ví dụ: may-khuay' },
  { name: 'use_text', label: 'Công dụng ngắn', kind: 'text' },
  { name: 'image', label: 'Ảnh', kind: 'image', defaultValue: '/assets/images/pumps.webp' },
  { name: 'body', label: 'Mô tả', kind: 'textarea' },
  { name: 'criteria', label: 'Yêu cầu kỹ thuật cần có', kind: 'lines', hint: 'Mỗi dòng một mục.' },
  { name: 'position', label: 'Thứ tự hiển thị', kind: 'number', hint: 'Số nhỏ hiển thị trước.' },
  { name: 'published', label: 'Hiển thị trên website', kind: 'checkbox' },
]

export const Route = createFileRoute('/admin/_panel/products')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'content'),
  loader: () => apiGet<Row[]>('/api/admin/products'),
  component: () => (
    <ResourcePage endpoint="/api/admin/products" title="Thiết bị" fields={FIELDS} rows={Route.useLoaderData()}
      columns={[{ label: 'Ảnh', render: thumbnail }, { label: 'Tên', render: row => String(row.title) }, { label: 'Thứ tự', render: row => String(row.position) }, { label: 'Trạng thái', render: publishedBadge }]} />
  ),
})

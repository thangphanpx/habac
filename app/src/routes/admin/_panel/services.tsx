import { createFileRoute } from '@tanstack/react-router'
import { ResourcePage, publishedBadge, thumbnail, type Field, type Row } from '../../../components/admin/resource'
import { apiGet } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'

const FIELDS: Field[] = [
  { name: 'title', label: 'Tên dịch vụ', kind: 'text' },
  { name: 'slug', label: 'Đường dẫn (slug)', kind: 'text', hint: 'Chữ thường, số, dấu gạch ngang. Ví dụ: xu-ly-nuoc-thai-sinh-hoat' },
  { name: 'subtitle', label: 'Phụ đề', kind: 'text', optional: true },
  { name: 'image', label: 'Ảnh', kind: 'image' },
  { name: 'intro', label: 'Giới thiệu ngắn', kind: 'textarea' },
  { name: 'description', label: 'Mô tả chi tiết', kind: 'textarea' },
  { name: 'scope', label: 'Phạm vi triển khai', kind: 'lines', hint: 'Mỗi dòng một mục.' },
  { name: 'position', label: 'Thứ tự hiển thị', kind: 'number', hint: 'Số nhỏ hiển thị trước.' },
  { name: 'published', label: 'Hiển thị trên website', kind: 'checkbox' },
]

export const Route = createFileRoute('/admin/_panel/services')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'content'),
  loader: () => apiGet<Row[]>('/api/admin/services'),
  component: () => (
    <ResourcePage endpoint="/api/admin/services" title="Dịch vụ" fields={FIELDS} rows={Route.useLoaderData()}
      columns={[{ label: 'Ảnh', render: thumbnail }, { label: 'Tên', render: row => String(row.title) }, { label: 'Thứ tự', render: row => String(row.position) }, { label: 'Trạng thái', render: publishedBadge }]} />
  ),
})

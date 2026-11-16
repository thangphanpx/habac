import { createFileRoute } from '@tanstack/react-router'
import { ResourcePage, publishedBadge, thumbnail, type Field, type Row } from '../../../components/admin/resource'
import { apiGet } from '../../../lib/admin-api'
import { requirePermission } from '../../../lib/admin-guard'
import { PROJECT_CATEGORIES } from '../../../lib/permissions'

const FIELDS: Field[] = [
  { name: 'title', label: 'Tên công trình', kind: 'text' },
  { name: 'description', label: 'Mô tả ngắn', kind: 'text', optional: true },
  { name: 'image', label: 'Ảnh', kind: 'image' },
  { name: 'category', label: 'Nhóm', kind: 'select', options: PROJECT_CATEGORIES },
  { name: 'position', label: 'Thứ tự hiển thị', kind: 'number', hint: 'Số nhỏ hiển thị trước; 3 công trình đầu tiên hiện ở trang chủ.' },
  { name: 'published', label: 'Hiển thị trên website', kind: 'checkbox' },
]

export const Route = createFileRoute('/admin/_panel/projects')({
  beforeLoad: ({ context }) => requirePermission(context.user, 'content'),
  loader: () => apiGet<Row[]>('/api/admin/projects'),
  component: () => (
    <ResourcePage endpoint="/api/admin/projects" title="Công trình" fields={FIELDS} rows={Route.useLoaderData()}
      columns={[{ label: 'Ảnh', render: thumbnail }, { label: 'Tên', render: row => String(row.title) },
        { label: 'Nhóm', render: row => PROJECT_CATEGORIES[String(row.category) as keyof typeof PROJECT_CATEGORIES] /* khóa do server ràng buộc bằng check constraint */ },
        { label: 'Thứ tự', render: row => String(row.position) }, { label: 'Trạng thái', render: publishedBadge }]} />
  ),
})

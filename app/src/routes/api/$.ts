import { createFileRoute } from '@tanstack/react-router'
import { app } from '../../server/api'

const handle = ({ request }: { request: Request }) => app.fetch(request)

// Toàn bộ /api/* do Hono xử lý.
export const Route = createFileRoute('/api/$')({
  server: { handlers: { GET: handle, POST: handle, PUT: handle, DELETE: handle } },
})

import { createFileRoute } from '@tanstack/react-router'
import { app } from '../../server/api'

export const Route = createFileRoute('/uploads/$')({
  server: { handlers: { GET: ({ request }) => app.fetch(request) } },
})

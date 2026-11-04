import { createFileRoute, redirect } from '@tanstack/react-router'
import { Canvas } from '../components/aurora/Canvas'
function validateSearch(search: Record<string, unknown>): { query?: string; von?: 'lab' } {
  return {
    query: typeof search.query === 'string' ? search.query : undefined,
    von: search.von === 'lab' ? 'lab' : undefined,
  }
}
export const Route = createFileRoute('/canvas/$investigationId')({
  validateSearch,
  beforeLoad: ({ location, params }) => {
    const raw = location.search as Record<string, unknown>
    if (raw.von !== undefined && raw.von !== 'lab') {
      throw redirect({
        to: '/canvas/$investigationId',
        params,
        search: validateSearch(raw),
        replace: true,
      })
    }
  },
  component: Page,
})
function Page() {
  const { investigationId } = Route.useParams()
  const { query, von } = Route.useSearch()
  return <Canvas investigationId={investigationId} query={query} von={von} />
}

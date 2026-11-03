import { createFileRoute } from '@tanstack/react-router'
import { Find } from '../components/aurora/Find'
type Search = { query?: string; selected?: string; compare?: string[] }
export const Route = createFileRoute('/find')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    query: typeof s.query === 'string' ? s.query : undefined,
    selected: typeof s.selected === 'string' ? s.selected : undefined,
    compare: Array.isArray(s.compare)
      ? [
          ...new Set(
            s.compare.filter((id): id is string => typeof id === 'string'),
          ),
        ].slice(0, 2)
      : undefined,
  }),
  component: Page,
})
function Page() {
  return <Find {...Route.useSearch()} />
}

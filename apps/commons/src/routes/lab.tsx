import { createFileRoute } from '@tanstack/react-router'
import { Workbench } from '../features/lab/Workbench'
import { validateLabSearch } from '../features/lab/state'
export const Route = createFileRoute('/lab')({
  validateSearch: validateLabSearch,
  head: () => ({ meta: [{ title: 'PDF Lab · Werkbank' }] }),
  component: () => <Workbench search={Route.useSearch()} />,
})

import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '../components/aurora/AppShell'
export const Route = createFileRoute('/')({component: () => <AppLayout aside={<h3>Verläufe</h3>}><h1>Guten Tag, Achim.</h1></AppLayout>})

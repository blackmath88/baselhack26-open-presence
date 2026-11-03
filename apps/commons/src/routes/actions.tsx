import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '../components/aurora/AppShell'
export const Route = createFileRoute('/actions')({component: () => <AppLayout aside="Offen"><h1>Zuschreibung widersprüchlich</h1></AppLayout>})

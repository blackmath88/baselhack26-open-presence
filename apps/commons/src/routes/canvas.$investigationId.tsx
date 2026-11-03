import { createFileRoute } from '@tanstack/react-router'
import { AppLayout } from '../components/aurora/AppShell'
export const Route = createFileRoute('/canvas/$investigationId')({component: () => <AppLayout aside="Assistent"><h1>Herkunft: «Die Stadt als Schwamm»</h1></AppLayout>})

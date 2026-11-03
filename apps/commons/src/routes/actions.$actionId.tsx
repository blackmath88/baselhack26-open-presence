import { createFileRoute } from '@tanstack/react-router'
import { Actions } from '../components/aurora/Actions'
export const Route = createFileRoute('/actions/$actionId')({component:Page})
function Page(){const {actionId}=Route.useParams();return <Actions actionId={actionId} />}

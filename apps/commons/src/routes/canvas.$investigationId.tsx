import { createFileRoute } from '@tanstack/react-router'
import { Canvas } from '../components/aurora/Canvas'
export const Route = createFileRoute('/canvas/$investigationId')({validateSearch:(search:Record<string,unknown>): {query?:string}=>({query:typeof search.query==='string'?search.query:undefined}),component:Page})
function Page(){const {investigationId}=Route.useParams();const {query}=Route.useSearch();return <Canvas investigationId={investigationId} query={query} />}

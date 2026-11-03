import { createService } from './core.mjs'
import { sdkRequire } from './sdk.mjs'

try {
  const { McpServer } = sdkRequire('@modelcontextprotocol/server')
  const { serveStdio, StdioServerTransport } = sdkRequire('@modelcontextprotocol/server/stdio')
  const z = sdkRequire('zod/v4')
  const service = createService()
  const inputs = {
    get_capabilities: z.object({}),
    get_example: z.object({ capability: z.string().optional() }),
    validate_project: z.looseObject({}),
    render_project: z.looseObject({}),
    retrieve_artifact: z.object({ renderId: z.string(), artifactId: z.string() }),
  }
  serveStdio(() => {
    const server = new McpServer({ name: 'pdf-lab-local', version: '1.0.0' }, { capabilities: { tools: {} } })
    for (const [name, operation] of Object.entries(service)) {
      server.registerTool(name, { description: `${name}: local owned-fixture PDF capability path. Retrieval includes actual base64 bytes.`, inputSchema: inputs[name] }, async input => {
        try { return { content: [{ type: 'text', text: JSON.stringify(await operation(input)) }] } }
        catch (error) { return { isError: true, content: [{ type: 'text', text: error.message }] } }
      })
    }
    return server
  }, { transport: new StdioServerTransport(process.stdin, process.stdout, { maxBufferSize: 32768 }), onerror: error => console.error(error.message) })
} catch (error) { console.error(`Local MCP SDK unavailable: ${error.message}. Use cli.mjs; MCP wiring requires the existing Commons SDK installation.`); process.exitCode = 1 }

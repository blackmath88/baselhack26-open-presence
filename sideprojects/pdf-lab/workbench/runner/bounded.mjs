// Run one allowlisted tool as an argv array (never a shell) with the lab's existing limits:
// wall time, CPU seconds, address space, file size and captured output. When the host allows it the
// child also gets an empty network namespace (unshare -rn). The whole process group is killed on
// timeout or output overflow. What was actually enforced is reported with every result.
import { execFileSync, spawn } from 'node:child_process'

export const DEFAULT_LIMITS = Object.freeze({ wallMs: 10_000, cpuSeconds: 8, addressSpaceMiB: 768, fileSizeMiB: 4, outputMiB: 4 })

function works(argv) {
  try { execFileSync(argv[0], argv.slice(1), { stdio: 'ignore', timeout: 5000 }); return true } catch { return false }
}

let probed = null
/** Which isolation layers this host supports. Probed once, by actually running them. */
export function isolation() {
  if (!probed) {
    probed = {
      network: works(['unshare', '-rn', '--', 'true']) ? 'none (unshare -rn)' : 'not isolated: unshare -rn unavailable',
      rlimits: works(['prlimit', '--cpu=1', '--', 'true']) ? 'prlimit' : 'not enforced: prlimit unavailable',
    }
  }
  return probed
}

export function wrap(argv, limits = DEFAULT_LIMITS) {
  const iso = isolation()
  let out = argv
  if (iso.rlimits === 'prlimit') out = ['prlimit', `--cpu=${limits.cpuSeconds}`, `--as=${limits.addressSpaceMiB * 1024 * 1024}`, `--fsize=${limits.fileSizeMiB * 1024 * 1024}`, '--', ...out]
  if (iso.network.startsWith('none')) out = ['unshare', '-rn', '--', ...out]
  return out
}

export function runBounded(argv, { cwd, limits = DEFAULT_LIMITS, env = {} } = {}) {
  const wrapped = wrap(argv, limits)
  const started = Date.now()
  return new Promise((resolve) => {
    const child = spawn(wrapped[0], wrapped.slice(1), { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: { PATH: process.env.PATH, LANG: 'C.UTF-8', ...env } })
    const cap = limits.outputMiB * 1024 * 1024
    const chunks = { stdout: [], stderr: [] }
    let size = 0
    let timedOut = false
    let truncated = false
    const killGroup = () => { try { process.kill(-child.pid, 'SIGKILL') } catch { /* already gone */ } }
    const timer = setTimeout(() => { timedOut = true; killGroup() }, limits.wallMs)
    for (const stream of ['stdout', 'stderr']) {
      child[stream].on('data', (d) => {
        size += d.length
        if (size > cap) { truncated = true; killGroup(); return }
        chunks[stream].push(d)
      })
    }
    child.on('error', (e) => { clearTimeout(timer); resolve({ exitCode: null, signal: null, stdout: '', stderr: String(e.message), durationMs: Date.now() - started, timedOut, truncated, wrapped }) })
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer)
      killGroup()
      resolve({ exitCode, signal, stdout: Buffer.concat(chunks.stdout).toString('utf8'), stderr: Buffer.concat(chunks.stderr).toString('utf8'), durationMs: Date.now() - started, timedOut, truncated, wrapped })
    })
  })
}

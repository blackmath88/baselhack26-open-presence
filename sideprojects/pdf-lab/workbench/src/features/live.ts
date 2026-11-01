// Where the optional local runner listens. Loopback only: it is reachable when the workbench is used
// on the machine that runs it, and reported as unavailable everywhere else.
export function runnerUrl(): string {
  return import.meta.env.VITE_RUNNER_URL || 'http://127.0.0.1:3110'
}

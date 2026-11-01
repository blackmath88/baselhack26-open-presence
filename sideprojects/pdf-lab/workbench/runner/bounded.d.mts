export const DEFAULT_LIMITS: Readonly<{ wallMs: number; cpuSeconds: number; addressSpaceMiB: number; fileSizeMiB: number; outputMiB: number }>
export function isolation(): { network: string; rlimits: string }
export function wrap(argv: string[], limits?: typeof DEFAULT_LIMITS): string[]
export function runBounded(argv: string[], opts?: { cwd?: string; limits?: typeof DEFAULT_LIMITS; env?: Record<string, string> }): Promise<{ exitCode: number | null; signal: string | null; stdout: string; stderr: string; durationMs: number; timedOut: boolean; truncated: boolean; wrapped: string[] }>

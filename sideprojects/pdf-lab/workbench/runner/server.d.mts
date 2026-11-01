import type { Server } from 'node:http'
export const SCHEMA: string
export function fixtureProblem(bytes: Buffer): string | null
export function instruments(): Record<'mupdf' | 'pdftotext' | 'pdftoppm', { engine: string; wrapper: string; version: string | null; wrapperVersion?: string } | null>
export function createRunner(opts?: { tools?: ReturnType<typeof instruments>; allowOrigins?: Set<string>; port?: number }): Server

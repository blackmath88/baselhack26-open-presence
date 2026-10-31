/**
 * The single browser-side reader over the committed record-only index.
 * Deterministic and offline: no network, no source cache.
 */
import { createCommonsReader } from './retrieval'

export const commonsReader = createCommonsReader()

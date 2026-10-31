// Adapted from postack-underflow 9fffa36e04edc7fd76aaa82f36c5f1ef12cea5bf:
// src/lib/records.ts (field projection), src/commons/model.ts (Commons weights).
// Only contract-explainable fields are indexed; interpretations are never quotes.
export interface IndexableProblem {
  id: string;
  title: string;
  symptoms: string[];
  aliases: string[];
  device: string[];
  environment: string[];
  evidence: Array<{ quote: string }>;
}
export const RECORD_WEIGHTS = { title: 3, symptoms: 2, aliases: 2, device: 1, environment: 1, quote: 1 };
export function recordFields(p: IndexableProblem): Record<string, string> {
  return {
    title: p.title,
    symptoms: p.symptoms.join('. '),
    aliases: p.aliases.join('. '),
    device: p.device.join('. '),
    environment: p.environment.join('. '),
    quote: p.evidence.map(e => e.quote).join(' '),
  };
}

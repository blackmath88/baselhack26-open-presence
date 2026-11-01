/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PHF_PDF_URL?: string
  readonly VITE_PHF_HISTORY_URL?: string
  /** Absolute backend origin. Leave unset in dev; the Vite proxy handles /api. */
  readonly VITE_API_BASE?: string
  /** Where "Back to the presentation" links. Defaults to port 8001 on the serving host. */
  readonly VITE_PHF_PRESENTATION_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

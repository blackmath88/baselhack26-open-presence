/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PHF_STORY_URL?: string
  /** Where the legacy cabinet (sideprojects/pdf-lab/index.html) is served. Default: port 8000 on this host. */
  readonly VITE_LEGACY_CABINET_URL?: string
}

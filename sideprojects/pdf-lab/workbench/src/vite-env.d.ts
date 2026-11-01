/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Where the legacy cabinet (sideprojects/pdf-lab/index.html) is served. Default: port 8000 on this host. */
  readonly VITE_LEGACY_CABINET_URL?: string
  /** The local measurement runner (workbench/runner). Default http://127.0.0.1:3110. */
  readonly VITE_RUNNER_URL?: string
}

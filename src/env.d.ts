/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'crypto-browserify'
declare module 'stream-browserify'
declare module 'util'

interface ImportMetaEnv {
  readonly VITE_OPEN_METEO_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

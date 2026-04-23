/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*.astro' {
  const Component: any;
  export default Component;
}

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  /** Base URL of your backend (no trailing slash), e.g. https://api.example.com/v1 */
  readonly PUBLIC_API_URL?: string;
  /** Server-only backend URL (internal/private origin, no trailing slash). */
  readonly API_INTERNAL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
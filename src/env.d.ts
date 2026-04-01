/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '*.astro' {
  const Component: any;
  export default Component;
}

interface ImportMetaEnv {
  readonly SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
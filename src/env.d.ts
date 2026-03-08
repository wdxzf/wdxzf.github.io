/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module '@fancyapps/ui/dist/fancybox/fancybox.esm.js' {
  export const Fancybox: {
    bind: (selector: string, options?: Record<string, unknown>) => void;
  };
}

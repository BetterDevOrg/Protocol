/** Shim for Next.js generated `.next/types` imports (strict TS + missing .d.ts in some Next patches). */
declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export type ResolvingMetadata = import("next").Metadata;
  export type ResolvingViewport = import("next").Viewport;
}

declare module "next/types.js" {
  export type ResolvingMetadata = import("next").Metadata;
  export type ResolvingViewport = import("next").Viewport;
}

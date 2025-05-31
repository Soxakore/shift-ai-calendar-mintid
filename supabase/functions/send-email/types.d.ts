// Type declarations for Deno Edge Functions
/// <reference types="https://raw.githubusercontent.com/denoland/deno/main/cli/dts/lib.deno.d.ts" />

declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export {};

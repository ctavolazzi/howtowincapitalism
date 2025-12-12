/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Cloudflare KV bindings
interface Env {
  USERS: KVNamespace;
  SESSIONS: KVNamespace;
  RESEND_API_KEY: string;
}

// Extend Astro's locals with our bindings
declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
    };
  }
}

import { afterEach, describe, expect, it, vi } from "vitest";

import { getSupabaseEnv, hasSupabaseEnv, isRemoteContentEnabled } from "../env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("supabase env helpers", () => {
  it("returns null when env is incomplete", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    expect(getSupabaseEnv()).toBeNull();
    expect(hasSupabaseEnv()).toBe(false);
  });

  it("returns credentials when both public env vars are present", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "demo-anon-key");

    expect(getSupabaseEnv()).toEqual({
      url: "https://demo.supabase.co",
      anonKey: "demo-anon-key",
    });
    expect(hasSupabaseEnv()).toBe(true);
  });

  it("only enables remote content when source is explicitly remote", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://demo.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "demo-anon-key");
    vi.stubEnv("SUPABASE_CONTENT_SOURCE", "local");

    expect(isRemoteContentEnabled()).toBe(false);

    vi.stubEnv("SUPABASE_CONTENT_SOURCE", "remote");
    expect(isRemoteContentEnabled()).toBe(true);
  });
});

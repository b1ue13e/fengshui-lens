import { describe, expect, it } from "vitest";

import { buildAuthCallbackRedirectUrl } from "../auth-callback";

describe("auth callback redirect", () => {
  it("falls back to /profile when next is missing", () => {
    const redirectUrl = buildAuthCallbackRedirectUrl("https://young.study/auth/callback");

    expect(redirectUrl.toString()).toBe("https://young.study/profile?login=success");
  });

  it("redirects to the requested in-app path when next is safe", () => {
    const redirectUrl = buildAuthCallbackRedirectUrl(
      "https://young.study/auth/callback?next=/login"
    );

    expect(redirectUrl.toString()).toBe("https://young.study/login?login=success");
  });

  it("ignores unsafe next targets that do not start with /", () => {
    const redirectUrl = buildAuthCallbackRedirectUrl(
      "https://young.study/auth/callback?next=https://evil.example/phish"
    );

    expect(redirectUrl.toString()).toBe("https://young.study/profile?login=success");
  });

  it("ignores protocol-relative next targets that could leave the app origin", () => {
    const redirectUrl = buildAuthCallbackRedirectUrl(
      "https://young.study/auth/callback?next=//evil.example/phish"
    );

    expect(redirectUrl.toString()).toBe("https://young.study/profile?login=success");
  });

  it("adds login=success without preserving unrelated callback query params", () => {
    const redirectUrl = buildAuthCallbackRedirectUrl(
      "https://young.study/auth/callback?code=abc123&next=/profile?tab=saved"
    );

    expect(redirectUrl.toString()).toBe(
      "https://young.study/profile?tab=saved&login=success"
    );
  });
});

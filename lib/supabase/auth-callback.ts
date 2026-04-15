function isSafeInAppPath(nextPath: string | null): nextPath is string {
  return Boolean(nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//"));
}

export function buildAuthCallbackRedirectUrl(requestUrl: string | URL) {
  const url = typeof requestUrl === "string" ? new URL(requestUrl) : new URL(requestUrl.toString());
  const requestedNext = url.searchParams.get("next");
  const nextPath = isSafeInAppPath(requestedNext) ? requestedNext : "/profile";
  const redirectUrl = new URL(nextPath, url.origin);

  redirectUrl.searchParams.set("login", "success");

  return redirectUrl;
}

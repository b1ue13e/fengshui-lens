import { notFound } from "next/navigation";

export function isInternalPath(pathname: string) {
  return pathname === "/design" || pathname.startsWith("/dev");
}

export function isInternalPagesEnabled(
  nodeEnv = process.env.NODE_ENV,
  internalPagesFlag = process.env.ENABLE_INTERNAL_PAGES
) {
  return nodeEnv !== "production" || internalPagesFlag === "true";
}

export function areInternalPagesEnabled() {
  return isInternalPagesEnabled();
}

export function assertInternalPageAccess() {
  if (!areInternalPagesEnabled()) {
    notFound();
  }
}

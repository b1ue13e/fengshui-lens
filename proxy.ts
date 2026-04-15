import { NextResponse, type NextRequest } from "next/server";

import { isInternalPagesEnabled, isInternalPath } from "@/lib/internal-access";
import { updateSession } from "@/lib/supabase/proxy";

function shouldBlockInternalPath(pathname: string) {
  const internalPagesEnabled = isInternalPagesEnabled();

  if (internalPagesEnabled) {
    return false;
  }

  return isInternalPath(pathname);
}

export async function proxy(request: NextRequest) {
  if (shouldBlockInternalPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

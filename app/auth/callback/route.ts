import { NextResponse } from "next/server";

import { buildAuthCallbackRedirectUrl } from "@/lib/supabase/auth-callback";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectUrl = buildAuthCallbackRedirectUrl(requestUrl);

  if (code) {
    const supabase = await getServerSupabaseClient();
    if (supabase) {
      await supabase.auth.exchangeCodeForSession(code);
    }
  }

  return NextResponse.redirect(redirectUrl);
}

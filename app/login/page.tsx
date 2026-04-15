import { LoginScreen } from "@/components/login/login-screen";
import { AppShell } from "@/components/shared/app-shell";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { getServerSupabaseClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ login?: string }>;
}) {
  await searchParams;
  const supabase = await getServerSupabaseClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <AppShell>
      <LoginScreen hasSupabase={hasSupabaseEnv()} userEmail={user?.email ?? null} />
    </AppShell>
  );
}

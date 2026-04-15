"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, LoaderCircle, Mail, RefreshCw } from "lucide-react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { mergeLocalProgressAfterLogin, syncLocalRoutePlansAfterLogin } from "@/app/actions/young-study";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readLocalRoutePlans } from "@/lib/survival/local-plans";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store/app-store";

export function LoginScreen({
  hasSupabase,
  userEmail,
}: {
  hasSupabase: boolean;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pushToast = useAppStore((state) => state.pushToast);
  const hydrateRemoteProgress = useAppStore((state) => state.hydrateRemoteProgress);
  const favorites = useAppStore((state) => state.favorites);
  const completed = useAppStore((state) => state.completed);
  const recent = useAppStore((state) => state.recent);
  const savedToolkits = useAppStore((state) => state.savedToolkits);
  const checklistState = useAppStore((state) => state.checklistState);
  const onboardingStage = useAppStore((state) => state.onboardingStage);

  const [email, setEmail] = useState(userEmail ?? "");
  const [isSending, setIsSending] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const autoSyncTriggeredRef = useRef(false);

  const localSnapshot = useMemo(
    () => ({
      favorites,
      completed,
      recent,
      savedToolkits,
      checklistState,
      onboardingStage,
    }),
    [checklistState, completed, favorites, onboardingStage, recent, savedToolkits]
  );

  useEffect(() => {
    if (searchParams.get("login") !== "success") {
      return;
    }

    pushToast("登录成功", "你的账号已经接上了，现在可以把本地学习记录同步到云端。");
  }, [pushToast, searchParams]);

  useEffect(() => {
    if (!userEmail || autoSyncTriggeredRef.current) {
      return;
    }

    autoSyncTriggeredRef.current = true;
    startTransition(async () => {
      setIsSyncing(true);
      const merged = await mergeLocalProgressAfterLogin(localSnapshot);
      await syncLocalRoutePlansAfterLogin(readLocalRoutePlans());
      hydrateRemoteProgress(merged);
      setIsSyncing(false);
      pushToast("学习记录已同步", "收藏、完成状态和最近学习已经合并到当前账号。");
      router.replace("/profile");
      router.refresh();
    });
  }, [hydrateRemoteProgress, localSnapshot, pushToast, router, userEmail]);

  async function handleSendMagicLink() {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      pushToast("先填邮箱", "你填一个常用邮箱，我给你发一封登录链接。");
      return;
    }

    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      pushToast("当前是本地模式", "没配 Supabase 的时候，软件也能直接浏览，只是不会同步到云端。");
      return;
    }

    setIsSending(true);

    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", "/login");

    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: redirectTo.toString(),
      },
    });

    setIsSending(false);

    if (error) {
      pushToast("登录邮件没发出去", error.message);
      return;
    }

    pushToast("登录链接已发送", "去邮箱点开链接，回来之后我会自动帮你同步本地进度。");
  }

  async function handleSignOut() {
    const supabase = getBrowserSupabaseClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    pushToast("已退出登录", "本地学习记录还在，你随时可以再次同步到账号。");
    router.replace("/profile");
    router.refresh();
  }

  if (!hasSupabase) {
    return (
      <div className="space-y-6">
        <section className="hero-panel rounded-[2rem] p-5 md:p-7">
          <div className="sticker-label">登录与同步</div>
          <h1 className="mt-4 text-[2rem] font-semibold leading-tight text-foreground">
            现在是本地演示模式
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/78">
            你现在照样可以浏览全部场景、清单、路线和模拟器。等你后面补上 Supabase
            环境变量，再打开登录页，就能同步收藏、完成状态和最近学习。
          </p>
        </section>

        <EmptyState
          title="还没接入云端同步"
          description="把 .env.example 里的 Supabase 变量填好，再重启应用，这里就会出现邮箱登录入口。"
          actionLabel="先去个人中心继续体验"
          actionHref="/profile"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="hero-panel rounded-[2rem] p-5 md:p-7">
        <div className="sticker-label">登录与同步</div>
        <h1 className="mt-4 text-[2rem] font-semibold leading-tight text-foreground">
          把你的学习记录接到云端
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-foreground/78">
          这里先用邮箱魔法链接做 MVP。你不用记密码，点开邮件里的登录链接就能回来，收藏和进度也会自动合并。
        </p>
      </section>

      {userEmail ? (
        <section className="soft-panel rounded-[1.8rem] p-5">
          <SectionHeading
            eyebrow="已登录"
            title="账号已经接好了"
            description="如果你刚从邮箱链接回来，我会顺手把本地记录和账号里的旧记录合并。"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.4rem] bg-white/70 p-4 dark:bg-white/6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1.5 text-sm text-foreground">
              <CheckCircle2 className="size-4 text-primary" />
              {userEmail}
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                startTransition(async () => {
                  setIsSyncing(true);
                  const merged = await mergeLocalProgressAfterLogin(localSnapshot);
                  await syncLocalRoutePlansAfterLogin(readLocalRoutePlans());
                  hydrateRemoteProgress(merged);
                  setIsSyncing(false);
                  pushToast("再次同步完成", "本地和云端的收藏、完成状态已经重新合并。");
                  router.refresh();
                })
              }
              disabled={isSyncing}
            >
              {isSyncing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              立即同步一次
            </Button>
            <Button type="button" variant="ghost" onClick={handleSignOut}>
              退出登录
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-foreground/82">
            <span className="rounded-full bg-white/68 px-3 py-1 dark:bg-white/6">收藏 {favorites.length}</span>
            <span className="rounded-full bg-white/68 px-3 py-1 dark:bg-white/6">完成 {completed.length}</span>
            <span className="rounded-full bg-white/68 px-3 py-1 dark:bg-white/6">最近学习 {recent.length}</span>
          </div>

          <div className="mt-5">
            <Link href="/profile">
              <Button type="button">
                去个人中心看看
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="soft-panel rounded-[1.8rem] p-5">
          <SectionHeading
            eyebrow="邮箱 OTP"
            title="输一个常用邮箱，我给你发登录链接"
            description="浏览内容不需要登录，但如果你想跨设备保留学习记录，最好把账号先接上。"
          />

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-[1rem] bg-background/75 px-4"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleSendMagicLink} disabled={isSending}>
                {isSending ? <LoaderCircle className="size-4 animate-spin" /> : <Mail className="size-4" />}
                发送登录链接
              </Button>
              <Link href="/profile">
                <Button type="button" variant="outline">
                  先回个人中心
                </Button>
              </Link>
            </div>

            <p className="text-sm leading-6 text-muted-foreground">
              邮件里点一下就能登录，不需要密码。邮箱没收到的话，记得顺手看一下垃圾箱和推广邮件。
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

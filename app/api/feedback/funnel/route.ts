import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const FUNNEL_HASH_KEY = "rent:funnel:counts";
const FUNNEL_LIST_KEY = "rent:funnel:events";
const MAX_EVENTS = 2000;
const EXPIRE_SECONDS = 60 * 60 * 24 * 30;

const ALLOWED_EVENTS = new Set([
  "home_primary_cta_clicked",
  "listing_extract_submit",
  "listing_extract_success",
  "listing_extract_failure",
  "manual_evaluate_start",
  "report_share",
  "report_add_to_compare",
  "route_plan_open",
]);

let redis: ReturnType<typeof Redis.fromEnv> | null = null;

function getRedis() {
  if (!redis) {
    redis = Redis.fromEnv();
  }

  return redis;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      event?: string;
      reportId?: string;
      source?: string;
      failureCode?: string;
      pathname?: string;
      timestamp?: string;
    };

    if (!payload.event || !ALLOWED_EVENTS.has(payload.event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    const entry = {
      ...payload,
      timestamp: payload.timestamp ?? new Date().toISOString(),
    };

    try {
      const pipeline = getRedis().pipeline();
      pipeline.hincrby(FUNNEL_HASH_KEY, payload.event, 1);
      pipeline.lpush(FUNNEL_LIST_KEY, JSON.stringify(entry));
      pipeline.ltrim(FUNNEL_LIST_KEY, 0, MAX_EVENTS - 1);
      pipeline.expire(FUNNEL_HASH_KEY, EXPIRE_SECONDS);
      pipeline.expire(FUNNEL_LIST_KEY, EXPIRE_SECONDS);
      await pipeline.exec();
    } catch (error) {
      console.warn("[funnel] Redis unavailable, event logged only to console.", error);
      console.info("[funnel] event", entry);
    }

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error("[funnel] Failed to record event.", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

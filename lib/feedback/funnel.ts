"use client";

export const funnelEventNames = [
  "home_primary_cta_clicked",
  "listing_extract_submit",
  "listing_extract_success",
  "listing_extract_failure",
  "manual_evaluate_start",
  "report_share",
  "report_add_to_compare",
  "route_plan_open",
] as const;

export type FunnelEventName = (typeof funnelEventNames)[number];

export interface FunnelEventPayload {
  event: FunnelEventName;
  reportId?: string;
  source?: string;
  failureCode?: string;
  pathname?: string;
  timestamp?: string;
}

function buildPayload(payload: FunnelEventPayload) {
  return {
    ...payload,
    pathname: payload.pathname ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}

export async function trackFunnelEvent(payload: FunnelEventPayload) {
  const body = JSON.stringify(buildPayload(payload));

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon("/api/feedback/funnel", blob);

      if (sent) {
        return;
      }
    }

    await fetch("/api/feedback/funnel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      keepalive: true,
    });
  } catch (error) {
    console.warn("[funnel] failed to record event", error);
  }
}

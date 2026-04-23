import type { Metadata } from "next";

export const SITE_NAME = "青年大学习";

const DEFAULT_SITE_URL = "http://localhost:3000";

function normalizePath(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getMetadataBase() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  try {
    return new URL(rawUrl && rawUrl.length > 0 ? rawUrl : DEFAULT_SITE_URL);
  } catch {
    return new URL(DEFAULT_SITE_URL);
  }
}

type PageMetadataInput = {
  pageTitle: string;
  description: string;
  pathname?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
};

export function buildPageMetadata({
  pageTitle,
  description,
  pathname,
  openGraphTitle,
  openGraphDescription,
}: PageMetadataInput): Metadata {
  const fullTitle = `${pageTitle} | ${SITE_NAME}`;
  const canonicalPath = pathname ? normalizePath(pathname) : undefined;

  return {
    title: pageTitle,
    description,
    alternates: canonicalPath
      ? {
          canonical: canonicalPath,
        }
      : undefined,
    openGraph: {
      type: "website",
      locale: "zh_CN",
      siteName: SITE_NAME,
      url: canonicalPath,
      title: openGraphTitle ?? fullTitle,
      description: openGraphDescription ?? description,
    },
    twitter: {
      card: "summary",
      title: openGraphTitle ?? fullTitle,
      description: openGraphDescription ?? description,
    },
  };
}

export function buildRentalEntryMetadata(
  pageTask: string,
  description: string,
  pathname?: string
): Metadata {
  return buildPageMetadata({
    pageTitle: `${pageTask}：青年大学习的第一课`,
    description,
    pathname,
  });
}

export function buildHandoffMetadata(
  pageTask: string,
  description: string,
  pathname?: string
): Metadata {
  return buildPageMetadata({
    pageTitle: `${pageTask}：租房之后的到沪承接`,
    description,
    pathname,
  });
}

export function buildTrainingMetadata(
  pageTask: string,
  description: string,
  pathname?: string
): Metadata {
  return buildPageMetadata({
    pageTitle: `${pageTask}：青年大学习的训练底盘`,
    description,
    pathname,
  });
}

export function buildScenarioMetadata(
  scenarioTitle: string,
  description: string,
  pathname?: string
): Metadata {
  return buildPageMetadata({
    pageTitle: `${scenarioTitle}：现实判断训练`,
    description,
    pathname,
  });
}

export function buildCategoryMetadata(
  categoryTitle: string,
  description: string,
  pathname?: string
): Metadata {
  return buildPageMetadata({
    pageTitle: `${categoryTitle}：场景判断训练`,
    description,
    pathname,
  });
}

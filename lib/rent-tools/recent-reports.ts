"use client";

const RECENT_REPORTS_KEY = "rent-decision_recent_reports";
const COMPARE_REPORTS_KEY = "rent-decision_compare_reports";
const LEGACY_RECENT_REPORTS_KEY = "young-study_recent_rent_reports";
const LEGACY_COMPARE_REPORTS_KEY = "young-study_compare_rent_reports";

function readArray(key: string) {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  try {
    const fallbackKey =
      key === RECENT_REPORTS_KEY ? LEGACY_RECENT_REPORTS_KEY : LEGACY_COMPARE_REPORTS_KEY;
    const raw = localStorage.getItem(key) ?? localStorage.getItem(fallbackKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function rememberRecentReport(reportId: string) {
  const next = [reportId, ...readArray(RECENT_REPORTS_KEY).filter((item) => item !== reportId)].slice(
    0,
    8
  );
  writeArray(RECENT_REPORTS_KEY, next);
}

export function getRecentReports() {
  return readArray(RECENT_REPORTS_KEY);
}

export function getCompareReportIds() {
  return readArray(COMPARE_REPORTS_KEY).slice(0, 2);
}

export function toggleCompareReport(reportId: string) {
  const current = getCompareReportIds();

  if (current.includes(reportId)) {
    const next = current.filter((item) => item !== reportId);
    writeArray(COMPARE_REPORTS_KEY, next);
    return next;
  }

  const next = [...current, reportId].slice(-2);
  writeArray(COMPARE_REPORTS_KEY, next);
  return next;
}

export function clearCompareReports() {
  writeArray(COMPARE_REPORTS_KEY, []);
}

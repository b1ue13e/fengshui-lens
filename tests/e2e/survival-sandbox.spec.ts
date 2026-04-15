import { expect, test } from "@playwright/test";

test("guest can generate a survival plan from the homepage wizard and reopen it locally", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByTestId("survival-origin-city").fill("合肥");
  await page.getByTestId("survival-graduation-date").fill("2026-06-30");
  await page.getByTestId("survival-housing-budget").fill("3500-4500");
  await page.getByTestId("survival-submit").click();

  await page.waitForURL(/\/survival-plans\/.+$/);

  const generatedUrl = page.url();
  const generatedPlanId = generatedUrl.split("/").pop();

  await expect(page.getByTestId("survival-plan-root")).toBeVisible();
  await expect(page.getByTestId("survival-plan-city")).toContainText("合肥");
  await expect(page.getByTestId("survival-plan-offer-status")).not.toBeEmpty();

  const storedPlanIds = await page.evaluate(() => {
    const raw = window.localStorage.getItem("young-study_survival_route_plans");

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Array<{ id: string }>;
    return parsed.map((item) => item.id);
  });

  expect(generatedPlanId).toBeTruthy();
  expect(storedPlanIds).toContain(generatedPlanId);

  await page.reload();

  await expect(page).toHaveURL(new RegExp(`/survival-plans/${generatedPlanId}$`));
  await expect(page.getByTestId("survival-plan-root")).toBeVisible();
});

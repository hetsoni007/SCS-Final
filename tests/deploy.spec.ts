import { expect, test } from "@playwright/test";

/**
 * Only for the deploy artefact: a build made with NEXT_PUBLIC_LEAD_ENDPOINT (scripts/deploy-aws.sh does this).
 *
 *   NEXT_PUBLIC_LEAD_ENDPOINT=<url> STATIC_HOST=1 BASE_URL=http://127.0.0.1:3200 npx playwright test tests/deploy.spec.ts
 *
 * The request is intercepted in the browser and answered locally, so no real lead is ever created.
 */
const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
test.skip(!endpoint, "needs NEXT_PUBLIC_LEAD_ENDPOINT (a build that delivers forms)");

test("contact form posts the brief to the lead API as JSON @all", async ({ page }) => {
  const posts: { url: string; type: string | undefined; body: Record<string, string> }[] = [];
  await page.route(`${endpoint}**`, async (route) => {
    const req = route.request();
    if (req.method() === "POST") posts.push({ url: req.url(), type: req.headers()["content-type"], body: req.postDataJSON() });
    await route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*" }, contentType: "application/json", body: "{}" });
  });
  await page.goto("/contact/?utm_source=deploy-check");
  await page.getByLabel("First name").fill("Deploy");
  await page.getByLabel("Last name").fill("Check");
  await page.getByLabel("Work email").fill("deploy-check@example.com");
  await page.getByLabel("Tell us about your project").fill("Intercepted in the browser; not sent.");
  await page.getByRole("button", { name: /Send brief/ }).click();
  await expect(page.getByRole("status")).toContainText("Brief received");

  expect(posts).toHaveLength(1);
  expect(posts[0].type).toContain("application/json");
  expect(posts[0].body).toMatchObject({ kind: "contact", name: "Deploy Check", email: "deploy-check@example.com", page: "/contact/" });
  expect(posts[0].body.message ?? Object.values(posts[0].body).join(" ")).toContain("Intercepted in the browser");
});

test("a failing lead API shows the e-mail fallback instead of a false success @all", async ({ page }) => {
  await page.route(`${endpoint}**`, (route) => route.request().method() === "POST" ? route.fulfill({ status: 500, headers: { "access-control-allow-origin": "*" }, body: "{}" }) : route.fulfill({ status: 204, headers: { "access-control-allow-origin": "*" } }));
  await page.goto("/contact/");
  await page.getByLabel("First name").fill("Deploy");
  await page.getByLabel("Last name").fill("Check");
  await page.getByLabel("Work email").fill("deploy-check@example.com");
  await page.getByLabel("Tell us about your project").fill("Should fail.");
  await page.getByRole("button", { name: /Send brief/ }).click();
  await expect(page.getByText(/Please email/)).toBeVisible();
  await expect(page.getByRole("status")).toHaveCount(0);
});

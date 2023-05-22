import { test, expect } from "@playwright/test";

test("get the issues", async ({ request, baseURL }) => {
  console.log({ baseURL });
  const issues = await request.get(baseURL + "/issues");
  expect(issues.ok()).toBeTruthy();
});

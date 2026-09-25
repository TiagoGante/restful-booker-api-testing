import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/specs",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL ?? "https://restful-booker.herokuapp.com",
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    trace: "retain-on-failure",
  },
  projects: [{ name: "api" }],
})

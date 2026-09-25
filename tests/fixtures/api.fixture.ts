import { test as base } from "@playwright/test"
import { AuthRequest } from "../requests/auth.request"

type ApiFixtures = {
  authRequest: AuthRequest
}

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ request }, use) => {
    await use(new AuthRequest(request))
  },
})

export { expect } from "@playwright/test"

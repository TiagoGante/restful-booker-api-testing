import { test as base } from "@playwright/test"
import { AuthRequest } from "../requests/auth.request"
import { BookingRequest } from "../requests/booking.request"

type ApiFixtures = {
  authRequest: AuthRequest
  bookingRequest: BookingRequest
}

export const test = base.extend<ApiFixtures>({
  authRequest: async ({ request }, use) => {
    await use(new AuthRequest(request))
  },
  bookingRequest: async ({ request }, use) => {
    await use(new BookingRequest(request))
  },
})

export { expect } from "@playwright/test"

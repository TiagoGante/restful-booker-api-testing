import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/api.fixture"
import { bookingIdsSchema } from "../contracts/getBookingIds.schema"
import { buildBooking } from "../data/booking-builder"
import type { Booking } from "../requests/booking.request"

test.describe("GET /booking - GetBookingIds", () => {
  test.describe("Happy paths", () => {
    let bookingId: number
    let booking: Booking

    test.beforeEach(async ({ bookingRequest }) => {
      const response = await bookingRequest.createBooking(buildBooking())
      expect(response.status()).toBe(200)
      ;({ bookingid: bookingId, booking } = await response.json())
    })

    test.afterEach(async ({ authRequest, bookingRequest }) => {
      await bookingRequest.deleteBooking(bookingId, await authRequest.getToken())
    })

    test("Should return all booking ids", { tag: "@smoke" }, async ({ bookingRequest }) => {
      const response = await bookingRequest.getBookingIds()

      expect(response.status()).toBe(200)
      const body = await response.json()
      await bookingIdsSchema.validateAsync(body)
      expect(body).toContainEqual({ bookingid: bookingId })
    })

    test("Should filter by firstname", async ({ bookingRequest }) => {
      const response = await bookingRequest.getBookingIds({ firstname: booking.firstname })

      expect(response.status()).toBe(200)
      expect(await response.json()).toContainEqual({ bookingid: bookingId })
    })

    test("Should filter by lastname", async ({ bookingRequest }) => {
      const response = await bookingRequest.getBookingIds({ lastname: booking.lastname })

      expect(response.status()).toBe(200)
      expect(await response.json()).toContainEqual({ bookingid: bookingId })
    })

    test("Should filter by firstname and lastname", async ({ bookingRequest }) => {
      const response = await bookingRequest.getBookingIds({
        firstname: booking.firstname,
        lastname: booking.lastname,
      })

      expect(response.status()).toBe(200)
      expect(await response.json()).toContainEqual({ bookingid: bookingId })
    })
  })

  test.describe("Unhappy paths", () => {
    test("Should return empty list when no booking matches", async ({ bookingRequest }) => {
      const response = await bookingRequest.getBookingIds({ firstname: faker.string.uuid() })

      expect(response.status()).toBe(200)
      expect(await response.json()).toEqual([])
    })

    test("Should return error when checkin date is invalid", async ({ bookingRequest }) => {
      // Known issue: the API returns 500 instead of 400 for invalid dates
      const response = await bookingRequest.getBookingIds({ checkin: "not-a-date" })

      expect(response.status()).toBe(500)
    })
  })
})

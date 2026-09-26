import { test, expect } from "../fixtures/api.fixture"
import { bookingSchema } from "../contracts/getBookingById.schema"
import { validCredentials } from "../data/credentials"
import { buildBooking } from "../data/booking-builder"
import type { Booking } from "../requests/booking.request"

test.describe("GET /booking/:id - GetBooking", () => {
  test.describe("With existing booking", () => {
    let bookingId: number
    let booking: Booking

    test.beforeEach(async ({ bookingRequest }) => {
      const response = await bookingRequest.createBooking(buildBooking())
      expect(response.status()).toBe(200)
      ;({ bookingid: bookingId, booking } = await response.json())
    })

    test.afterEach(async ({ authRequest, bookingRequest }) => {
      const { token } = await (await authRequest.createToken(validCredentials)).json()
      await bookingRequest.deleteBooking(bookingId, token)
    })

    test("Should return booking by id", { tag: "@smoke" }, async ({ bookingRequest }) => {
      const response = await bookingRequest.getBooking(bookingId)

      expect(response.status()).toBe(200)
      const body = await response.json()
      await bookingSchema.validateAsync(body)
      expect(body).toEqual(booking)
    })

    test("Should return not found after booking is deleted", async ({ authRequest, bookingRequest }) => {
      const { token } = await (await authRequest.createToken(validCredentials)).json()
      await bookingRequest.deleteBooking(bookingId, token)

      const response = await bookingRequest.getBooking(bookingId)

      expect(response.status()).toBe(404)
      expect(await response.text()).toBe("Not Found")
    })

    test("Should return not found when id is decimal", async ({ bookingRequest }) => {
      test.fail()

      const response = await bookingRequest.getBooking(`${bookingId}.5`)

      expect(response.status()).toBe(404)
    })
  })

  test.describe("With invalid id", () => {
    const invalidIds = [
      { name: "non-existent id", id: 999999999 },
      { name: "non-numeric id", id: "abc" },
      { name: "zero", id: 0 },
      { name: "negative id", id: -1 },
    ]

    for (const { name, id } of invalidIds) {
      test(`Should return not found when using ${name}`, async ({ bookingRequest }) => {
        const response = await bookingRequest.getBooking(id)

        expect(response.status()).toBe(404)
        expect(await response.text()).toBe("Not Found")
      })
    }
  })
})

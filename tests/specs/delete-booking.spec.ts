import { test, expect } from "../fixtures/api.fixture"
import { buildBooking } from "../data/booking-builder"

test.describe("DELETE /booking/:id - DeleteBooking", () => {
  test.describe("With existing booking", () => {
    let bookingId: number
    let token: string

    test.beforeEach(async ({ authRequest, bookingRequest }) => {
      token = await authRequest.getToken()
      const response = await bookingRequest.createBooking(buildBooking())
      expect(response.status()).toBe(200)
      bookingId = (await response.json()).bookingid
    })

    test.afterEach(async ({ bookingRequest }) => {
      await bookingRequest.deleteBooking(bookingId, token)
    })

    test("Should delete booking with valid token", { tag: "@smoke" }, async ({ bookingRequest }) => {
      // Known issue: the API returns 201 Created instead of 200 OK or 204 No Content
      const response = await bookingRequest.deleteBooking(bookingId, token)

      expect(response.status()).toBe(201)
      expect(await response.text()).toBe("Created")

      const getResponse = await bookingRequest.getBooking(bookingId)
      expect(getResponse.status()).toBe(404)
    })

    test("Should return forbidden without token", async ({ bookingRequest }) => {
      const response = await bookingRequest.deleteBooking(bookingId)

      expect(response.status()).toBe(403)
      expect(await response.text()).toBe("Forbidden")

      const getResponse = await bookingRequest.getBooking(bookingId)
      expect(getResponse.status()).toBe(200)
    })

    test("Should return forbidden with invalid token", async ({ bookingRequest }) => {
      const response = await bookingRequest.deleteBooking(bookingId, "invalid-token")

      expect(response.status()).toBe(403)
      expect(await response.text()).toBe("Forbidden")

      const getResponse = await bookingRequest.getBooking(bookingId)
      expect(getResponse.status()).toBe(200)
    })

    test("Should return error when booking is already deleted", async ({ bookingRequest }) => {
      // Known issue: the API returns 405 instead of 404
      await bookingRequest.deleteBooking(bookingId, token)

      const response = await bookingRequest.deleteBooking(bookingId, token)

      expect(response.status()).toBe(405)
      expect(await response.text()).toBe("Method Not Allowed")
    })
  })

  test.describe("With invalid id", () => {
    // Known issue: the API returns 405 instead of 404 for ids that don't exist
    const invalidIds = [
      { name: "non-existent id", id: 999999999 },
      { name: "non-numeric id", id: "abc" },
    ]

    for (const { name, id } of invalidIds) {
      test(`Should return error when using ${name}`, async ({ authRequest, bookingRequest }) => {
        const response = await bookingRequest.deleteBooking(id, await authRequest.getToken())

        expect(response.status()).toBe(405)
        expect(await response.text()).toBe("Method Not Allowed")
      })
    }
  })
})

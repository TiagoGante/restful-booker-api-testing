import { test, expect } from "../fixtures/api.fixture"
import { bookingSchema } from "../contracts/getBookingById.schema"
import { buildBooking, buildBookingWithout } from "../data/booking-builder"
import type { Booking } from "../requests/booking.request"

test.describe("PUT /booking/:id - UpdateBooking", () => {
  test.describe("With existing booking", () => {
    let bookingId: number
    let booking: Booking
    let token: string

    test.beforeEach(async ({ authRequest, bookingRequest }) => {
      token = await authRequest.getToken()
      const response = await bookingRequest.createBooking(buildBooking())
      expect(response.status()).toBe(200)
      ;({ bookingid: bookingId, booking } = await response.json())
    })

    test.afterEach(async ({ bookingRequest }) => {
      await bookingRequest.deleteBooking(bookingId, token)
    })

    test("Should update booking with valid token", { tag: "@smoke" }, async ({ bookingRequest }) => {
      const updatedBooking = buildBooking()

      const response = await bookingRequest.updateBooking(bookingId, updatedBooking, token)

      expect(response.status()).toBe(200)
      const body = await response.json()
      await bookingSchema.validateAsync(body)
      expect(body).toEqual(updatedBooking)

      const getResponse = await bookingRequest.getBooking(bookingId)
      expect(await getResponse.json()).toEqual(updatedBooking)
    })

    test("Should return forbidden without token", async ({ bookingRequest }) => {
      const response = await bookingRequest.updateBooking(bookingId, buildBooking())

      expect(response.status()).toBe(403)
      expect(await response.text()).toBe("Forbidden")

      const getResponse = await bookingRequest.getBooking(bookingId)
      expect(await getResponse.json()).toEqual(booking)
    })

    test("Should return forbidden with invalid token", async ({ bookingRequest }) => {
      const response = await bookingRequest.updateBooking(bookingId, buildBooking(), "invalid-token")

      expect(response.status()).toBe(403)
      expect(await response.text()).toBe("Forbidden")
    })

    test("Should return bad request when body is malformed JSON", async ({ bookingRequest }) => {
      const response = await bookingRequest.updateBooking(bookingId, '{"firstname":', token)

      expect(response.status()).toBe(400)
      expect(await response.text()).toBe("Bad Request")
    })

    const invalidPayloads = [
      { name: "empty body", data: {} },
      { name: "missing firstname", data: buildBookingWithout("firstname") },
      { name: "missing lastname", data: buildBookingWithout("lastname") },
      { name: "missing totalprice", data: buildBookingWithout("totalprice") },
      { name: "missing depositpaid", data: buildBookingWithout("depositpaid") },
      { name: "missing bookingdates", data: buildBookingWithout("bookingdates") },
      { name: "missing checkin", data: { ...buildBooking(), bookingdates: { checkout: "2026-10-05" } } },
      { name: "missing checkout", data: { ...buildBooking(), bookingdates: { checkin: "2026-10-01" } } },
    ]

    for (const { name, data } of invalidPayloads) {
      test(`Should return bad request when using ${name}`, async ({ bookingRequest }) => {
        const response = await bookingRequest.updateBooking(bookingId, data, token)

        expect(response.status()).toBe(400)
        expect(await response.text()).toBe("Bad Request")
      })
    }

    test("Should return error when firstname is a number", async ({ bookingRequest }) => {
      // Known issue: the API returns 500 instead of 400
      const response = await bookingRequest.updateBooking(bookingId, { ...buildBooking(), firstname: 123 }, token)

      expect(response.status()).toBe(500)
      expect(await response.text()).toBe("Internal Server Error")
    })

    // Known bug: the API accepts the update (200) instead of returning 400 Bad Request for:
    // - totalprice as string (stored as null)
    // Known bug: omitting additionalneeds keeps the previous value,
    // but PUT should replace the whole resource
  })

  test.describe("With invalid id", () => {
    // Known issue: the API returns 405 instead of 404 for ids that don't exist
    const invalidIds = [
      { name: "non-existent id", id: 999999999 },
      { name: "non-numeric id", id: "abc" },
    ]

    for (const { name, id } of invalidIds) {
      test(`Should return error when using ${name}`, async ({ authRequest, bookingRequest }) => {
        const response = await bookingRequest.updateBooking(id, buildBooking(), await authRequest.getToken())

        expect(response.status()).toBe(405)
        expect(await response.text()).toBe("Method Not Allowed")
      })
    }
  })
})

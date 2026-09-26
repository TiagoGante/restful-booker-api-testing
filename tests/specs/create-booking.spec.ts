import { test, expect } from "../fixtures/api.fixture"
import { createBookingSchema } from "../contracts/createBooking.schema"
import { buildBooking } from "../data/booking-builder"
import type { Booking } from "../requests/booking.request"

const without = (field: keyof Booking) => {
  const booking: Partial<Booking> = buildBooking()
  delete booking[field]
  return booking
}

test.describe("POST /booking - CreateBooking", () => {
  test.describe("Happy paths", () => {
    let bookingId: number

    test.afterEach(async ({ authRequest, bookingRequest }) => {
      await bookingRequest.deleteBooking(bookingId, await authRequest.getToken())
    })

    test("Should create booking with valid data", { tag: "@smoke" }, async ({ bookingRequest }) => {
      const booking = buildBooking()

      const response = await bookingRequest.createBooking(booking)

      expect(response.status()).toBe(200)
      const body = await response.json()
      bookingId = body.bookingid
      await createBookingSchema.validateAsync(body)
      expect(body.booking).toEqual(booking)
    })

    test("Should create booking without additionalneeds", async ({ bookingRequest }) => {
      const booking = without("additionalneeds")

      const response = await bookingRequest.createBooking(booking)

      expect(response.status()).toBe(200)
      const body = await response.json()
      bookingId = body.bookingid
      expect(body.booking).toEqual(booking)
    })
  })

  test.describe("Unhappy paths", () => {
    test("Should return bad request when body is malformed JSON", async ({ bookingRequest }) => {
      const response = await bookingRequest.createBooking('{"firstname":')

      expect(response.status()).toBe(400)
      expect(await response.text()).toBe("Bad Request")
    })

    test.describe("Rejected payloads", () => {
      // Known issue: the API returns 500 instead of 400 for invalid payloads
      const rejectedPayloads = [
        { name: "empty body", data: {} },
        { name: "missing firstname", data: without("firstname") },
        { name: "missing lastname", data: without("lastname") },
        { name: "missing totalprice", data: without("totalprice") },
        { name: "missing depositpaid", data: without("depositpaid") },
        { name: "missing bookingdates", data: without("bookingdates") },
        { name: "missing checkin", data: { ...buildBooking(), bookingdates: { checkout: "2026-10-05" } } },
        { name: "missing checkout", data: { ...buildBooking(), bookingdates: { checkin: "2026-10-01" } } },
        { name: "firstname as number", data: { ...buildBooking(), firstname: 123 } },
      ]

      for (const { name, data } of rejectedPayloads) {
        test(`Should return error when using ${name}`, async ({ bookingRequest }) => {
          const response = await bookingRequest.createBooking(data)

          expect(response.status()).toBe(500)
          expect(await response.text()).toBe("Internal Server Error")
        })
      }
    })

    // Known bug: the API does not validate field values and creates the booking (200)
    // instead of returning 400 Bad Request for:
    // - empty firstname
    // - totalprice as string (stored as null)
    // - negative totalprice
    // - decimal totalprice (truncated, e.g. 99.99 is stored as 99)
    // - depositpaid as string (coerced to true)
    // - invalid checkin date (stored as "0NaN-aN-aN")
    // - checkout before checkin
  })
})

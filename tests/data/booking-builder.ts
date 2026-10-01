import { faker } from "@faker-js/faker"
import type { Booking } from "../requests/booking.request"

const toDate = (date: Date) => date.toISOString().slice(0, 10)

export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const checkin = faker.date.soon({ days: 30 })
  const checkout = faker.date.soon({ days: 10, refDate: checkin })

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 2000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: toDate(checkin), checkout: toDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(["Breakfast", "Lunch", "Dinner"]),
    ...overrides,
  }
}

export function buildBookingWithout(field: keyof Booking): Partial<Booking> {
  const booking: Partial<Booking> = buildBooking()
  delete booking[field]
  return booking
}

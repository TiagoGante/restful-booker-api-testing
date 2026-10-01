import type { APIRequestContext, APIResponse } from "@playwright/test"

export type Booking = {
  firstname: string
  lastname: string
  totalprice: number
  depositpaid: boolean
  bookingdates: { checkin: string; checkout: string }
  additionalneeds?: string
}

export type BookingFilters = {
  firstname?: string
  lastname?: string
  checkin?: string
  checkout?: string
}

export class BookingRequest {
  constructor(private readonly request: APIRequestContext) {}

  getBookingIds(filters: BookingFilters = {}): Promise<APIResponse> {
    return this.request.get("/booking", { params: filters })
  }

  // Accepts any object or string so that negative tests can send invalid payloads
  createBooking(booking: object | string): Promise<APIResponse> {
    return this.request.post("/booking", { data: booking })
  }

  deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } })
  }

  getBooking(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`)
  }

  updateBooking(id: number | string, booking: object | string, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, {
      data: booking,
      headers: token ? { Cookie: `token=${token}` } : {},
    })
  }
}

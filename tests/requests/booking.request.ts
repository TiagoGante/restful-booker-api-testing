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

  createBooking(booking: Booking): Promise<APIResponse> {
    return this.request.post("/booking", { data: booking })
  }

  deleteBooking(id: number, token: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } })
  }
}

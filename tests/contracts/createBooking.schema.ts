import Joi from "joi"
import { bookingSchema } from "./getBookingById.schema"

export const createBookingSchema = Joi.object({
  bookingid: Joi.number().integer().positive().required(),
  booking: bookingSchema.required(),
})

import Joi from "joi"

export const bookingIdsSchema = Joi.array().items(
  Joi.object({
    bookingid: Joi.number().integer().required(),
  }),
)

import Joi from "joi"

export const bookingSchema = Joi.object({
  firstname: Joi.string().required(),
  lastname: Joi.string().required(),
  totalprice: Joi.number().required(),
  depositpaid: Joi.boolean().required(),
  bookingdates: Joi.object({
    checkin: Joi.string().isoDate().required(),
    checkout: Joi.string().isoDate().required(),
  }).required(),
  additionalneeds: Joi.string(),
})

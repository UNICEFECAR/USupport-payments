import express from "express";
import dotenv from "dotenv";

import { postCreatePaymentIntentSchema } from "#schemas/paymentSchemas";

import { createPaymentIntent } from "#controllers/payments";

dotenv.config();

const router = express.Router();

router.post("/create-payment-intent", async (req, res, next) => {
  /**
   * #route   GET /payments/v1/one-time/create-pyment-intent
   * #desc
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");

  return await postCreatePaymentIntentSchema
    .noUnknown(true)
    .strict()
    .validate({ country, language })
    .then(createPaymentIntent)
    .then((result) => res.json(result).status(204))
    .catch(next);
});

export { router };

import express from "express";
import dotenv from "dotenv";

import {
  postCreatePaymentIntentSchema,
  postWebhookEventSchema,
} from "#schemas/paymentSchemas";

import {
  createPaymentIntent,
  processWebhookEvent,
} from "#controllers/payments";

import { populateClient } from "#middlewares/populateMiddleware";

dotenv.config();

const router = express.Router();

router.post(
  "/create-payment-intent",
  populateClient,
  async (req, res, next) => {
    /**
     * #route   GET /payments/v1/one-time/create-pyment-intent
     * #desc
     */

    const country = req.header("x-country-alpha-2");
    const language = req.header("x-language-alpha-2");
    const user_id = req.header("x-user-id");

    const client_id = req.client.client_detail_id;
    const stripe_customer_id = req.client.stripe_customer_id;
    const email = req.client.email;

    return await postCreatePaymentIntentSchema
      .noUnknown(true)
      .strict()
      .validate({
        country,
        language,
        user_id,
        client_id,
        stripe_customer_id,
        email,
      })
      .then(createPaymentIntent)
      .then((result) => res.json(result).status(204))
      .catch(next);
  }
);

router.post("/webhook", async (req, res, next) => {
  /**
   * #route   GET /payments/v1/one-time/webhook
   * #desc
   */
  const signature = req.headers["stripe-signature"];
  const payload = req.body;

  return await postWebhookEventSchema
    .noUnknown(true)
    .strict()
    .validate({ signature, payload })
    .then(processWebhookEvent)
    .then((result) => res.json(result).status(204))
    .catch(next);
});

export { router };

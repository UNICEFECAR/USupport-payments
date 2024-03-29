import express from "express";
import dotenv from "dotenv";

import {
  postCreatePaymentIntentSchema,
  postWebhookEventSchema,
  getPaymentHistorySchema,
  postRefundSchema,
  cancelPaymentIntentSchema,
} from "#schemas/paymentSchemas";

import {
  createPaymentIntent,
  processWebhookEvent,
  getPaymentHistory,
  processRefund,
  cancelPaymentIntent,
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

    const consultationId = req.body.consultationId;

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
        consultationId,
      })
      .then(createPaymentIntent)
      .then((result) => res.json(result).status(204))
      .catch(next);
  }
);

router.put("/cancel-payment-intent", async (req, res, next) => {
  /**
   * #route   GET /payments/v1/one-time/cancel-payment-intent
   * #desc
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const paymentIntentId = req.body.paymentIntentId;

  return await cancelPaymentIntentSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      paymentIntentId,
    })
    .then(cancelPaymentIntent)
    .then((result) => res.json(result).status(204))
    .catch(next);
});

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

router.get("/history", populateClient, async (req, res, next) => {
  /**
   * #route   GET /payments/v1/one-time/history
   * #desc
   */
  const stripe_customer_id = req.client.stripe_customer_id;
  const limit = req.query.limit;
  const start_after_payment_intent_id = req.query.start_after_payment_intent_id;

  return await getPaymentHistorySchema
    .noUnknown(true)
    .strict()
    .validate({
      stripe_customer_id,
      limit,
      start_after_payment_intent_id,
    })
    .then(getPaymentHistory)
    .then((result) => res.json(result).status(204))
    .catch(next);
});

router.post("/refund", async (req, res, next) => {
  /**
   * #route   GET /payments/v1/one-time/refund
   * #desc
   */

  const country = req.header("x-country-alpha-2");
  const language = req.header("x-language-alpha-2");
  const user_id = req.header("x-user-id");
  const consultationId = req.body.consultationId;

  return await postRefundSchema
    .noUnknown(true)
    .strict()
    .validate({
      country,
      language,
      user_id,
      consultationId,
    })
    .then(processRefund)
    .then((result) => res.json(result).status(204))
    .catch(next);
});

export { router };

import * as yup from "yup";

export const postCreatePaymentIntentSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
  client_id: yup.string().uuid().required(),
  stripe_customer_id: yup.string().nullable(),
  email: yup.string().email().nullable(),
  consultationId: yup.string().uuid().required(),
});

export const postWebhookEventSchema = yup.object().shape({
  signature: yup.string().required(),
  payload: yup.object().required(),
});

export const getPaymentHistorySchema = yup.object().shape({
  stripe_customer_id: yup.string().nullable(),
  limit: yup.string().required(),
  start_after_payment_intent_id: yup.string().nullable(),
});

export const postRefundSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
  consultationId: yup.string().uuid().required(),
});

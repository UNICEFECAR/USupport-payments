import * as yup from "yup";

export const postCreatePaymentIntentSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
  user_id: yup.string().uuid().required(),
  client_id: yup.string().uuid().required(),
  stripe_customer_id: yup.string().nullable(),
  email: yup.string().email().nullable(),
});

export const postWebhookEventSchema = yup.object().shape({
  signature: yup.string().required(),
  payload: yup.object().required(),
});
import { t } from "#translations/index";

export const currencyNotFound = (language) => {
  const error = new Error();
  error.message = t("currency_not_found_error", language);
  error.name = "CURRENCY NOT FOUND";
  error.status = 404;
  return error;
};

export const clientNotFound = (language) => {
  const error = new Error();
  error.message = t("client_not_found_error", language);
  error.name = "CLIENT NOT FOUND";
  error.status = 404;
  return error;
};

export const stripeCustomerIdNotFound = (language) => {
  const error = new Error();
  error.message = t("stripe_customer_id_not_found_error", language);
  error.name = "STRIPE CUSTOMER ID NOT FOUND";
  error.status = 404;
  return error;
};

export const transactionNotFound = (language) => {
  const error = new Error();
  error.message = t("consultation_not_found_error", language);
  error.name = "CONSULTATION NOT FOUND";
  error.status = 404;
  return error;
};

export const metadataKeysNotFound = (language) => {
  const error = new Error();
  error.message = t("metadata_keys_not_found_error", language);
  error.name = "METADATA KEYS NOT FOUND";
  error.status = 404;
  return error;
};

export const webhookEventKeysNotFound = (language) => {
  const error = new Error();
  error.message = t("webhook_event_keys_not_found_error", language);
  error.name = "WEBHOOK EVENT KEYS NOT FOUND";
  error.status = 404;
  return error;
};

export const consultationNotFound = (language) => {
  const error = new Error();
  error.message = t("consultation_not_found_error", language);
  error.name = "CONSULTATION NOT FOUND";
  error.status = 404;
  return error;
};

export const scheduleCondultationError = () => {
  const error = new Error();
  error.message = "SCHEDULE CONSULTATION ERROR";
  error.name = "SCHEDULE CONSULTATION ERROR";
  error.status = 500;
  return error;
};

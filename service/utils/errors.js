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

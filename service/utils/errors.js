import { t } from "#translations/index";

export const currencyNotFound = (language) => {
  const error = new Error();
  error.message = t("currency_not_found_error", language);
  error.name = "CURRENCY NOT FOUND";
  error.status = 404;
  return error;
};

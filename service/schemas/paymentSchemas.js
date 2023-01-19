import * as yup from "yup";

export const postCreatePaymentIntentSchema = yup.object().shape({
  country: yup.string().required(),
  language: yup.string().required(),
});

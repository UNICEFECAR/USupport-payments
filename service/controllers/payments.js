import stripe from "stripe";

import { getCurrencyByCountryId } from "#queries/currencies";

import { currencyNotFound } from "#utils/errors";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

const stripeInstance = stripe(
  "sk_test_51MPzPVEFe7qoLe5Dus2p44zahzGm5vzhiipfjfscDHr3JbMvT3RErkU4Lxkj7AraTR8eKv7Bt8gv8IDRC0bspa0S00ggkcE7YS"
);

export const createPaymentIntent = async ({ country, language }) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  // TODO: Get consultation price from database and multiply by 100 to convert to cents

  // Get currency from database based on countryId
  const countryCurrency = await getCurrencyByCountryId({
    country: country,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw currencyNotFound(language);
      } else {
        return res.rows[0].code;
      }
    })
    .catch((err) => {
      throw err;
    });

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripeInstance.paymentIntents
    .create({
      amount: 50000,
      currency: countryCurrency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
    })
    .catch((err) => {
      throw err;
    });

  return { clientSecret: paymentIntent.client_secret };
};

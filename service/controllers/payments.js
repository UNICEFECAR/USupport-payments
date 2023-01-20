import stripe from "stripe";

import { getCurrencyByCountryId } from "#queries/currencies";
import { updateStripeCustomerIdQuery } from "#queries/clients";

import { currencyNotFound, stripeCustomerIdNotFound } from "#utils/errors";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_ENDPOINT_SECRET =
  process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

const stripeInstance = stripe(STRIPE_SECRET_KEY);

export const createPaymentIntent = async ({
  country,
  language,
  user_id,
  client_id,
  stripe_customer_id,
  email,
}) => {
  // TODO: Get consultation price from database and multiply by 100 to convert to cents

  let newCustomer;
  // Chekc if stripe customer exists
  if (!stripe_customer_id) {
    // Create a new customer and attach the PaymentMethod in one API call.
    newCustomer = await stripeInstance.customers
      .create({
        email: email ? email : "",
        metadata: {
          user_id: user_id,
          client_id: client_id,
        },
      })
      .then(async (res) => {
        // Update stripe_customer_id in database
        await updateStripeCustomerIdQuery({
          poolCountry: country,
          client_id: client_id,
          stripe_customer_id: res.id,
        })
          .then((res) => {
            if (res.rowCount === 0) {
              throw stripeCustomerIdNotFound(language);
            }
          })
          .catch((err) => {
            throw err;
          });

        return res;
      });
  }

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
      customer: stripe_customer_id ? stripe_customer_id : newCustomer?.id,
    })
    .catch((err) => {
      throw err;
    });

  return { clientSecret: paymentIntent.client_secret };
};

export const processWebhookEvent = async ({ signature, payload }) => {
  let event = payload;

  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse
  if (STRIPE_WEBHOOK_ENDPOINT_SECRET) {
    event = stripeInstance.webhooks
      .constructEvent(payload, signature, STRIPE_WEBHOOK_ENDPOINT_SECRET)
      .catch((err) => {
        throw err;
      });
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  return { received: true };
};

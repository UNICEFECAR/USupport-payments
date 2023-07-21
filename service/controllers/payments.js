import fetch from "node-fetch";
import stripe from "stripe";

import { getCurrencyByCountryId } from "#queries/currencies";
import {
  getClientLanguageByClientId,
  updateStripeCustomerIdQuery,
} from "#queries/clients";
import {
  addTransactionQuery,
  getTrasanctionByConsultationIdQuery,
} from "#queries/transactions";
import { getConsultationByIdQuery } from "#queries/consultations";
import { getProviderNameQuery } from "#queries/providers";

import {
  consultationNotFound,
  currencyNotFound,
  stripeCustomerIdNotFound,
  transactionNotFound,
  metadataKeysNotFound,
  webhookEventKeysNotFound,
  scheduleCondultationError,
  paymentIntentsNotFound,
  providerNotFound,
} from "#utils/errors";
import { getDateView, getTime } from "#utils/helperFunctions";
import { t } from "#translations/index";

const PROVIDER_LOCAL_HOST = "http://localhost:3002";
const PROVIDER_URL = process.env.PROVIDER_URL;
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
  consultationId,
}) => {
  // Get consultation price from database by consultationId.
  const consultation = await getConsultationByIdQuery({
    poolCountry: country,
    consultationId,
  })
    .then((raw) => {
      if (raw.rowCount === 0) {
        throw consultationNotFound(language);
      } else {
        return raw.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  const providerData = await getProviderNameQuery({
    poolCountry: country,
    providerId: consultation.provider_detail_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw providerNotFound(language);
      }
      return res.rows[0];
    })
    .catch((err) => {
      throw err;
    });

  const clientLanguage = await getClientLanguageByClientId({
    poolCountry: country,
    clientDetailId: consultation.client_detail_id,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        return "kk";
      }
      return res.rows[0].language;
    })
    .catch((err) => {
      throw err;
    });

  const providerName = providerData.patronym
    ? `${providerData.name} ${providerData.patronym} ${providerData.surname}`
    : `${providerData.name} ${providerData.surname}`;

  let newCustomer;
  // Chekc if stripe customer exists and if not create new one and save it to the database.
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
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  const consultationDate = getDateView(consultation.time);
  const consultationTime = getTime(consultation.time);
  let paymentIntentObj = {
    amount: consultation.price * 100,
    currency: countryCurrency.code.toLowerCase(),
    setup_future_usage: "off_session",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      consultationId: consultationId,
      countryAlpha2: country,
      language: language,
      campaignId: consultation?.campaign_id,
    },
    description: t("payment_description", clientLanguage || "kk", [
      providerName,
      consultationDate,
      consultationTime,
    ]),
    customer: stripe_customer_id ? stripe_customer_id : newCustomer?.id,
  };

  if (email) {
    paymentIntentObj["receipt_email"] = email;
  }
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripeInstance.paymentIntents
    .create(paymentIntentObj)
    .catch((err) => {
      throw err;
    });

  return {
    clientSecret: paymentIntent.client_secret,
    price: consultation.price,
    currency: countryCurrency.symbol,
    consultationCreationTime: consultation.created_at,
    paymentIntentId: paymentIntent.id,
  };
};

export const processWebhookEvent = async ({ signature, payload }) => {
  let event = payload;

  // Only verify the event if you have an endpoint secret defined.
  // Otherwise use the basic event deserialized with JSON.parse

  if (STRIPE_WEBHOOK_ENDPOINT_SECRET) {
    try {
      event = stripeInstance.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_ENDPOINT_SECRET
      );
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err.message);
    }
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      // eslint-disable-next-line no-case-declarations
      let consultationId, country, language, paymentIntentId, campaignId;
      try {
        paymentIntentId = event.data.object.id;
      } catch {
        throw webhookEventKeysNotFound;
      }

      try {
        consultationId = event.data.object.metadata.consultationId;
        country = event.data.object.metadata.countryAlpha2;
        language = event.data.object.metadata.language;
        campaignId = event.data.object.metadata.campaignId || null;
      } catch {
        throw metadataKeysNotFound;
      }

      // Add new transaction to database.
      await addTransactionQuery({
        poolCountry: country,
        type: "card",
        consultationId: consultationId,
        paymentIntent: paymentIntentId,
        paymentRefundId: null,
        campaignId,
      })
        .then((raw) => {
          if (raw.rowCount === 0) {
            throw transactionNotFound("en");
          } else {
            return raw.rows[0];
          }
        })
        .catch((err) => {
          throw err;
        });

      // eslint-disable-next-line no-case-declarations
      const consultation = await getConsultationByIdQuery({
        poolCountry: country,
        consultationId,
      })
        .then((raw) => {
          if (raw.rowCount === 0) {
            throw consultationNotFound(language);
          } else {
            return raw.rows[0];
          }
        })
        .catch((err) => {
          throw err;
        });

      if (consultation.status === "suggested") {
        // Accept Schedule consultation
        try {
          await fetch(
            `${PROVIDER_URL}/provider/v1/consultation/accept-suggest`,
            {
              method: "PUT",
              headers: {
                "x-country-alpha-2": country,
                "x-language-alpha-2": language,
                host: PROVIDER_LOCAL_HOST,
                "Content-type": "application/json",
              },
              ...(consultationId && {
                body: JSON.stringify({ consultationId }),
              }),
            }
          );
        } catch (err) {
          throw scheduleCondultationError;
        }
      } else {
        // Schedule consultation
        try {
          await fetch(`${PROVIDER_URL}/provider/v1/consultation/schedule`, {
            method: "PUT",
            headers: {
              "x-country-alpha-2": country,
              "x-language-alpha-2": language,
              host: PROVIDER_LOCAL_HOST,
              "Content-type": "application/json",
            },
            ...(consultationId && {
              body: JSON.stringify({ consultationId }),
            }),
          });
        } catch (err) {
          throw scheduleCondultationError;
        }
      }

      break;

    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  return { received: true };
};

export const getPaymentHistory = async ({
  stripe_customer_id,
  limit,
  start_after_payment_intent_id,
}) => {
  // Initialise the response
  let response = [];

  if (!stripe_customer_id) {
    return { payments: [], lastPaymentId: null, hasMore: false };
  }
  let stripeObject = {
    customer: stripe_customer_id,
    limit: limit && limit,
  };

  if (start_after_payment_intent_id) {
    stripeObject["starting_after"] = start_after_payment_intent_id;
  }
  const result = await stripeInstance.paymentIntents
    .list(stripeObject)
    .then(async (paymentIntents) => {
      // Get the id of the last payment retrieved in order to pass it to the ui. It will be passed back in order to perform the loading on scroll funcitonality
      let lastPaymentId;
      if (paymentIntents.data.length > 0) {
        lastPaymentId = paymentIntents.data[paymentIntents.data.length - 1].id;
      } else {
        // When it is set to null it means that there are no more
        lastPaymentId = null;
      }

      // Get the has more value in order to pass it to the ui. It will be passed back in order to perform the loading on scroll funcitonality
      let hasMore = paymentIntents.has_more; // true or false

      // Compute the response based on each payment intent including just events with the status "succeeded".
      for (let i = 0; i < paymentIntents.data.length; i++) {
        if (paymentIntents.data[i].status === "succeeded") {
          const payment = paymentIntents.data[i];
          let currentPaymentObj = {
            service: "",
            price: null,
            date: "",
            time: "",
            paymentId: "",
            paymentMethod: "",
            recipient: "USupport",
            address:
              "Almaty Kazakstan, 050000, 1st street, 1st building, 1st floor, 1st room",
            email: "usupport@7digit.io",
            invoice_pdf: "",
            hosted_invoice_url: "",
            receipt_url: "",
          };

          let creationDate = new Date(payment.created * 1000);

          currentPaymentObj.product = payment.description;
          currentPaymentObj.price = payment.amount / 100;
          currentPaymentObj.date = creationDate;
          currentPaymentObj.paymentId = payment.id;
          currentPaymentObj.service = payment.description
            ? payment.description
            : "Consultation";

          // Try to get the receipt of the payment
          try {
            const charge = await stripeInstance.charges.retrieve(
              payment.latest_charge
            );
            currentPaymentObj.receipt_url = charge.receipt_url;
          } catch (error) {
            currentPaymentObj.receipt_url = "";
          }

          //Try to get the payment method details which were used for the given payment. An error might occur if the payment method was deleted by the user.
          try {
            const paymentMethod = await stripeInstance.paymentMethods.retrieve(
              payment.payment_method
            );
            currentPaymentObj.paymentMethod = paymentMethod.card.brand;
          } catch (error) {
            currentPaymentObj.paymentMethod = "Not Existent";
          }

          //If the payment intent has attached to it an invoice fetch the data for it and place the download and preview url inside the response object
          if (payment.invoice) {
            const invoice = await stripeInstance.invoices.retrieve(
              payment.invoice
            );
            currentPaymentObj.invoice_pdf = invoice.invoice_pdf;
            currentPaymentObj.hosted_invoice_url = invoice.hosted_invoice_url;
          }

          // Add the current computed details information to the response
          response.push(currentPaymentObj);
        }
      }

      return {
        payments: response.length > 0 ? response : null,
        lastPaymentId: lastPaymentId,
        hasMore: hasMore,
      };
    })
    .catch((err) => {
      console.log("error ", err);
      throw paymentIntentsNotFound;
    });
  return result;
};

export const processRefund = async ({
  country,
  language,
  user_id,
  consultationId,
}) => {
  // Find transaction and get the payment intent id from it if it exists.
  const transaction = await getTrasanctionByConsultationIdQuery({
    poolCountry: country,
    consultationId,
  })
    .then((res) => {
      if (res.rowCount === 0) {
        throw transactionNotFound("en");
      } else {
        return res.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  //Create refund for the payment intent
  const refund = await stripeInstance.refunds
    .create({
      payment_intent: transaction.payment_intent,
      metadata: {
        consultationId: consultationId,
        userId: user_id,
        countryAlpha2: country,
        language: language,
      },
    })
    .catch((err) => {
      throw err;
    });

  // Add new transaction to database.
  await addTransactionQuery({
    poolCountry: country,
    type: "payment_refund",
    consultationId: consultationId,
    paymentIntent: transaction.payment_intent,
    paymentRefundId: refund.id,
  })
    .then((raw) => {
      if (raw.rowCount === 0) {
        throw transactionNotFound("en");
      } else {
        return raw.rows[0];
      }
    })
    .catch((err) => {
      throw err;
    });

  await fetch(`${PROVIDER_URL}/provider/v1/consultation/cancel`, {
    method: "PUT",
    headers: {
      host: PROVIDER_LOCAL_HOST,
      "x-user-id": user_id,
      "x-language-alpha-2": language,
      "x-country-alpha-2": country,
      "Content-type": "application/json",
    },
    ...({ consultationId } && { body: JSON.stringify({ consultationId }) }),
  }).catch(console.log);

  return { success: true };
};

export const cancelPaymentIntent = async ({ paymentIntentId }) => {
  const paymentIntent = await stripeInstance.paymentIntents.cancel(
    paymentIntentId
  );
  return paymentIntent;
};

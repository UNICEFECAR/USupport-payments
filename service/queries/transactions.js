import { getDBPool } from "#utils/dbConfig";

export const addTransactionQuery = async ({
  poolCountry,
  type,
  consultationId,
  paymentIntent,
  paymentRefundId,
  campaignId = null,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `

        INSERT INTO transaction_log (type, consultation_id, payment_intent, payment_refund_id, campaign_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
  
      `,
    [type, consultationId, paymentIntent, paymentRefundId, campaignId]
  );

export const getTrasanctionByConsultationIdQuery = async ({
  poolCountry,
  consultationId,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
      SELECT * FROM transaction_log WHERE consultation_id = $1;
    `,
    [consultationId]
  );

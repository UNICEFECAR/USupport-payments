import { getDBPool } from "#utils/dbConfig";

export const addTransactionQuery = async ({
  poolCountry,
  type,
  consultationId,
  paymentIntent,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `

        INSERT INTO transaction_log (type, consultation_id, payment_intent)
        VALUES ($1, $2, $3)
        RETURNING *;
  
      `,
    [type, consultationId, paymentIntent]
  );

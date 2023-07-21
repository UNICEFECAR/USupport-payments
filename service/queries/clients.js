import { getDBPool } from "#utils/dbConfig";

export const getClientByUserID = async (poolCountry, user_id) =>
  await getDBPool("piiDb", poolCountry).query(
    `
  WITH userData AS (

    SELECT client_detail_id 
    FROM "user"
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1

  ), clientData AS (

      SELECT client_detail."client_detail_id", "name", surname, nickname, email, stripe_customer_id
      FROM client_detail
        JOIN userData ON userData.client_detail_id = client_detail.client_detail_id
      ORDER BY client_detail.created_at DESC
      LIMIT 1

  )
  
  SELECT * FROM clientData;
  `,
    [user_id]
  );

export const updateStripeCustomerIdQuery = async ({
  poolCountry,
  client_id,
  stripe_customer_id,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      UPDATE client_detail
      SET stripe_customer_id = $1
      WHERE client_detail_id = $2
      RETURNING *;
  `,
    [stripe_customer_id, client_id]
  );

export const getClientLanguageByClientId = async ({
  poolCountry,
  clientDetailId,
}) =>
  await getDBPool("piiDb", poolCountry).query(
    `
  SELECT language
  FROM "user"
  WHERE client_detail_id = $1
  ORDER BY created_at DESC
  LIMIT 1;
`,
    [clientDetailId]
  );

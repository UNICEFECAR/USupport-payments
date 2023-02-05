import { getDBPool } from "#utils/dbConfig";

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

import { getDBPool } from "#utils/dbConfig";

export const getProviderNameQuery = async ({ poolCountry, providerId }) =>
  await getDBPool("piiDb", poolCountry).query(
    `
      SELECT "name", patronym, surname
      FROM provider_detail
      WHERE provider_detail.provider_detail_id = $1
      ORDER BY provider_detail.created_at DESC
      LIMIT 1;
    `,
    [providerId]
  );

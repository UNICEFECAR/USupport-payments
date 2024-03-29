import { getDBPool } from "#utils/dbConfig";

export const getConsultationByIdQuery = async ({
  poolCountry,
  consultationId,
}) =>
  await getDBPool("clinicalDb", poolCountry).query(
    `
        SELECT price, time, status, created_at, campaign_id, provider_detail_id, client_detail_id
        FROM consultation
        WHERE consultation_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
  
      `,
    [consultationId]
  );

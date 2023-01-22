import { getDBPool } from "#utils/dbConfig";

export const getCurrencyByCountryId = async ({ country }) =>
  await getDBPool("masterDb").query(
    `
        SELECT currency.code, symbol
        FROM country_currency_links
          INNER JOIN currency ON country_currency_links.currency_id = currency.currency_id
          INNER JOIN country ON country_currency_links.country_id = country.country_id
        WHERE country.alpha2 = $1
    `,
    [country]
  );

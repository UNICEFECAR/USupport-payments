import { getClientByUserID } from "#queries/clients";

import { clientNotFound } from "#utils/errors";

export const populateClient = async (req, res, next) => {
  const country = req.header("x-country-alpha-2");
  const user_id = req.header("x-user-id");

  const client = await getClientByUserID(country, user_id)
    .then((res) => res.rows[0])
    .catch((err) => {
      throw err;
    });

  if (!client) {
    return next(clientNotFound(country));
  }

  req.client = client;

  return next();
};

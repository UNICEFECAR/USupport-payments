import { clientNotFound } from "#utils/errors";

const CLIENT_API_URL = process.env.CLIENT_API_URL;
const CLIENT_API_LOCAL_HOST = "http://localhost:3001";

export const populateClient = async (req, res, next) => {
  const country = req.header("x-country-alpha-2");

  const clientResponse = await fetch(`${CLIENT_API_URL}/client/v1/client`, {
    headers: {
      ...req.headers,
      host: CLIENT_API_LOCAL_HOST,
      "Content-type": "application/json",
    },
  })
    .then((raw) => raw.json())
    .catch(console.log);

  if (clientResponse?.error?.status === 404) {
    return next(clientNotFound(country));
  }

  req.client = clientResponse;

  return next();
};

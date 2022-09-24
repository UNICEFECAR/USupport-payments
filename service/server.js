import express from "express";
import helmet from "helmet";
import dotenv from "dotenv";

import v1 from "#routes/index";
import middleware from "#middlewares/index";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

/*------------- Security Config -------------*/

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

/*------------- Payments Service Endpoints -------------*/

// Example router
app.use("/payments/v1/", v1.PaymentsRouter);

/*------------- Error middleware -------------*/

app.use(middleware.errorMiddleware.notFound);
app.use(middleware.errorMiddleware.errorHandler);

app.listen(PORT, () => {
  console.log(`Payments Server listening on port ${PORT}`);
});

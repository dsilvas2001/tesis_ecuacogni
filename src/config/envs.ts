import "dotenv/config";
import env from "env-var";
import { get } from "http";
console.log(process.env.PORT);
console.log(process.env.MONGO_URL);

export const envs = {
  PORT: env.get("PORT").required().asPortNumber(),
  MONGO_URL: env.get("MONGO_URL").required().asString(),
  MONGO_DB_NAME: env.get("MONGO_DB_NAME").required().asString(),
  MONGO_USER: env.get("MONGO_USER").required().asString(),
  MONGO_PASS: env.get("MONGO_PASS").required().asString(),
  JWT_SEED: env.get("JWT_SEED").required().asString(),
  OPENAI_API_KEY: env.get("OPENAI_API_KEY").required().asString(),
  GOOGLE_SEARCH_ID: env.get("GOOGLE_SEARCH_ID").required().asString(),
  GOOGLE_SEARCH_KEY: env.get("GOOGLE_SEARCH_KEY").required().asString(),
};

import express from "express";
import cors from "cors";
import { envs } from "./config";
import { MongoDatabase } from "./data";
import { AppRoutes } from "./presentation";
import { Cluster } from "puppeteer-cluster";
import { promises as fs } from "fs";
import { describe, it } from "node:test";

const app = express();

MongoDatabase.connect({
  dbName: envs.MONGO_DB_NAME,
  mongoURL: envs.MONGO_URL,
});

app.use(cors());
app.use(express.json());
app.use(AppRoutes.routes);

app.listen(envs.PORT, () => {
  console.log(`Listen port: ${envs.PORT}`);
});

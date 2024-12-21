import mongoose from "mongoose";
import * as models from "./models";

interface Options {
  mongoURL: string;
  dbName: string;
}

export class MongoDatabase {
  static async connect(options: Options) {
    const { mongoURL, dbName } = options;
    try {
      await mongoose.connect(mongoURL, { dbName });
      console.log("MongoDB Connected");

      for (const modelName in models) {
        const model = models[modelName as keyof typeof models];
        if (model && typeof model.init === "function") {
          await model.init();
          console.log(`Modelo ${modelName} inicializado correctamente`);
        }
      }

      return true;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }
}

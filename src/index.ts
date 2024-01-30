import { Elysia } from "elysia";
import { routes } from "./routes";
import { logger } from "@bogeychan/elysia-logger";
import mongoose from "mongoose";
import cors from "@elysiajs/cors";

export const PORT = 5000;
export const URL = `http://localhost:${PORT}`;

const app = new Elysia()
  .use(cors())
  .use(logger({
    autoLogging: true,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }))
  .use(routes)
  .get("/", ({ log }) => {
    log.error("WHAT?@");
    return "Hello Elysia";
  })
  .listen(PORT, async () => {
    if (!Bun.env.JWT_SECRET) {
      throw new Error(`'JWT_SECRET' must be defined!`);
    }
    try {
      const MongoDBURI = Bun.env.NODE_ENV === "development"
        ? `mongodb://localhost:27017/?directConnection=true&serverSelectionTimeoutMS=2000`
        : `mongodb://auth-mongo-srv:27017/auth`;

      console.log(`Connecting to ${MongoDBURI}...`);
      await mongoose.connect(MongoDBURI);
      console.log(`Auth service is connected to mongodb.`);
    } catch (err) {
      console.error(err);
    }
  });

console.log(
  `AUTH --- 🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type AppType = typeof app;

// app.handle(new Request(`http:localhost:5000/`, { method: "GET" }));

import { Elysia } from "elysia";
import { routes } from "./routes";
import { logger } from "@bogeychan/elysia-logger";

export const PORT = 5000;
export const URL = `http://localhost:${PORT}`;

const app = new Elysia()
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
  .listen(PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type AppType = typeof app;

// app.handle(new Request(`http:localhost:5000/`, { method: "GET" }));

import Elysia from "elysia";
import { logger } from "@bogeychan/elysia-logger";
import { ResponseModel, SignInModel } from "../validation";
import { createUser } from "../models";

export const routes = new Elysia()
  .use(logger({
    autoLogging: true,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  }))
  .group(
    "/api/users",
    (app) =>
      app
        // --- GET
        .get("/current-user", (ctx) => "Current user!")
        // --- POST
        .post("/sign-up", async ({ body, log }) => {
          log.info({ body }, "New sign up");

          await createUser(body);

          return {
            success: true,
            message: `User was signed up successfully.`,
          };
        }, {
          body: SignInModel,
          response: ResponseModel,
        })
        .post("/sign-in", ({ body, log }) => {
          log.info({ body }, "User signed in");
          return {
            success: true,
            message: "Signed in successfully.",
          };
        }, {
          body: SignInModel,
          response: ResponseModel,
        })
        .post("/sign-out", ({ body, log }) => {
          log.info({ body }, "User signed out");
          return {
            success: true,
            message: "Signed out successfully",
          };
        }, {
          body: SignInModel,
          response: ResponseModel,
        }),
  );

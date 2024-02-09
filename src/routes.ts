import Elysia, { t } from "elysia";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { logger } from "@bogeychan/elysia-logger";

import { ResponseModel, SignInModel } from "./validation";
import {
  createUserAndReturnUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "./services";
import { verifyHashedPassword } from "./utils";
import cors from "@elysiajs/cors";

export const routes = new Elysia()
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
  .use(bearer())
  .use(jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET as string,
    exp: "5d",
  }))
  .group(
    "/api/users",
    (app) =>
      app
        //
        //
        //
        // --- GET --- /all
        .get("/all", async () => {
          // log.info("Retrieving users from database.");
          const users = await getUsers();

          return { success: true, users: users };
        }, {
          body: t.Optional(t.Any()),
        })
        //
        //
        //
        // --- GET --- /current-user
        .get(
          "/current-user",
          async ({ set, bearer, jwt, log, cookie: { session } }) => {
            try {
              // @ts-ignore
              // const userId = bearer;
              // @ts-ignore
              // const { userId } = await jwt.verify(
              //   JSON.stringify(bearer),
              // );
              const { userId } = await jwt.verify(bearer);

              log.info(`Fetching user with id=${userId} from database.`);

              const user = await getUserById({ id: userId });

              log.info(`Fetched user from db.`, { user });
              set.status = 201;

              return {
                id: user._id,
                email: user.email,
              };
            } catch (err) {
              log.error({ bearer, jwt });
              log.error(`Unable to verify jwt.`, { error: err });
              set.status = 401;
              return {
                success: false,
                message: err,
              };
            }
          },
          {
            // cookie: t.Cookie({
            //   session: t.Optional(t.Object({
            //     id: t.String(),
            //     email: t.String(),
            //   })),
            // }),
            beforeHandle({ bearer, set, log }) {
              if (!bearer) {
                log.error(`No bearer token found.`);
                set.status = 400;
                set.headers[
                  "www-Authenticate"
                ] = `Bearer realm='sign', error="invalid_request"`;

                return "Unauthorized";
              }
            },
          },
        )
        //
        //
        //
        // --- POST --- /sign-up
        .post(
          "/sign-up",
          async ({ body, log, jwt, set, cookie: { session } }) => {
            log.info({ body }, "New sign up");

            try {
              const newUser = await createUserAndReturnUser(body);
              log.info({ user: newUser }, `User was created.`);

              // --- JWT
              const accessToken = await jwt.sign({
                userId: newUser._id,
              });
              log.info({ accessToken }, `Access-Token was set.`);

              // --- COOKIE
              session.set({
                value: accessToken,
                httpOnly: true,
                maxAge: 15 * 60 * 1000,
                secure: Bun.env.NODE_ENV !== "production",
                sameSite: "strict",
              });
              log.info({ session }, `Cookie was set.`);

              set.headers = {
                "Authorization": `Bearer ${accessToken}`,
              };
              log.debug(`Authorization header set.`);
              set.status = 201;
              log.debug(`Response status-code set.`);

              return {
                success: true,
                message: `User was signed up successfully.`,
              };
            } catch (err) {
              log.error(
                { error: err },
                `Someone already used this email address to create an account.`,
              );

              set.status = 401;

              return {
                success: false,
                message:
                  `User was not signed up; Someone already used this email address to create an account.`,
              };
            }
          },
          {
            body: SignInModel,
            response: ResponseModel,
          },
        )
        //
        //
        //
        // --- POST --- /sign-in
        .post(
          "/sign-in",
          async ({ body, log, set, jwt, cookie: { session } }) => {
            log.info("New sign-in request.", { body });

            async function handleUserSignIn(
              { email, password }: { email: string; password: string },
            ) {
              const existingUser = await getUserByEmail({ email });
              const passwordVerified = await verifyHashedPassword({
                inputPassword: password,
                hashedPassword: existingUser.password,
              });

              if (!passwordVerified) {
                set.status = 401;

                return {
                  success: false,
                  message: `Password was invalid`,
                };
              }

              const accessToken = await jwt.sign({
                userId: existingUser._id,
              });

              log.info({ accessToken }, `Access-Token was set.`);

              // --- COOKIE
              session.set({
                value: accessToken,
                maxAge: 15 * 60 * 1000,
                httpOnly: true,
              });
              log.info({ session }, `Cookie was set.`);

              set.headers = {
                "Authorization": `Bearer ${accessToken}`,
              };
              log.debug(`Authorization header set.`);
            }

            try {
              await handleUserSignIn(body);

              set.status = 200;
              log.debug(`Response status-code set.`);
              return {
                success: true,
                message: "Signed in successfully.",
              };
            } catch (err) {
              log.error(`Unauthorized.`, { error: err });
              set.status = 401;

              return {
                success: false,
                message: `Email + Password combination was not found in db.`,
              };
            }
          },
          {
            body: SignInModel,
            response: ResponseModel,
          },
        )
        //
        //
        //
        // --- POST --- /sign-out
        .post("/sign-out", ({ set, log, cookie: { session } }) => {
          log.info(`Sign out request received.`);
          session.remove();
          set.status = 200;
          log.info("User signed out");
          return {
            success: true,
            message: "Signed out successfully",
          };
        }, {
          // body: SignInModel,
          response: ResponseModel,
        }),
  );

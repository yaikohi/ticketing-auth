import Elysia, { t } from "elysia";
import { logger } from "@bogeychan/elysia-logger";
import { ResponseModel, SignInModel } from "./validation";
import {
  createUserAndReturnUser,
  getUserByEmail,
  getUserById,
  getUsers,
} from "./services";
import jwt from "@elysiajs/jwt";
import bearer from "@elysiajs/bearer";
import { getAccessTokenFromHeader, verifyHashedPassword } from "./utils";

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
  .use(bearer())
  .use(jwt({
    name: "jwt",
    secret: "big-secret",
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
          async ({ set, headers, jwt, log }) => {
            const accessToken = getAccessTokenFromHeader(headers);
            try {
              const jwtObj = await jwt.verify(accessToken);

              if (!jwtObj) {
                log.error(`Unable to verify jwt`);
              }
              // @ts-ignore: Does exist.
              const { userId } = jwtObj;

              log.debug(`Fetching user with id=${userId} from database.`);

              const user = await getUserById({ id: userId });

              log.info(`Fetched user from db.`, { user });
              set.status = 201;

              return {
                id: user._id,
                email: user.email,
              };
            } catch (err) {
              log.error(`Unable to verify jwt.`, { error: err });
              set.status = 500;
              return {
                success: false,
                message: err,
              };
            }
          },
          {
            beforeHandle({ bearer, set }) {
              if (!bearer) {
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

              const accessToken = await jwt.sign({
                userId: newUser._id,
              });
              log.info({ accessToken }, `Access-Token was set.`);
              session.value = {
                id: newUser._id,
                email: newUser.email,
              };
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
                `Something went wrong creating the user / setting the cookie.`,
              );
              set.status = 500;
              log.error(`Error code 500!`);

              return {
                success: false,
                message: `User was not signed up; something went wrong.`,
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
            log.info({ body }, "User signed in");

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
              session.value = {
                id: existingUser._id,
                email: existingUser.email,
              };
              log.info({ session }, `Cookie was set.`);

              set.headers = {
                "Authorization": `Bearer ${accessToken}`,
              };
              log.debug(`Authorization header set.`);
            }

            await handleUserSignIn(body);

            set.status = 201;
            log.debug(`Response status-code set.`);
            return {
              success: true,
              message: "Signed in successfully.",
            };
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

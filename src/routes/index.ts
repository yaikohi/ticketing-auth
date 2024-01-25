import Elysia, { t } from "elysia";

export const routes = new Elysia().group(
  "/api/users",
  (app) =>
    app
      .get("/current-user", (ctx) => "Current user!")
      .post("/sign-up", ({ body }) => "Signed up!")
      .post("/sign-in", ({ body }) => "Sign in!")
      .post("/sign-out", ({ body }) => "Sign out!", {
        body: t.Object({
          email: t.String(),
        }),
      }),
);

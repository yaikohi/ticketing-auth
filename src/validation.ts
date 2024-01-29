import { t } from "elysia";

export const ResponseModel = t.Object({
  success: t.Boolean(),
  message: t.String(),
});
export const SignInModel = t.Object({
  email: t.String(),
  password: t.String(),
});

import { Context } from "elysia";

export function getAccessTokenFromHeader(headers: Context["headers"]) {
  if (!headers["authorization"]) {
    throw new Error(`No authorization header present!`);
  }
  return headers["authorization"].split(" ")[1];
}
export const hashPasswordWithArgon2 = async (
  password: string,
): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  });
};

export async function verifyHashedPassword(
  { inputPassword, hashedPassword }: {
    inputPassword: string;
    hashedPassword: string;
  },
): Promise<boolean> {
  return await Bun.password.verify(inputPassword, hashedPassword);
}

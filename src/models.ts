import { User } from "@prisma/client";
import db from "./database";

export const hashPasswordWithArgon2 = async (
  password: string,
): Promise<string> => {
  return await Bun.password.hash(password, {
    algorithm: "argon2id",
    memoryCost: 4,
    timeCost: 3,
  });
};

export const getUserById = async (
  { id }: Pick<User, "id">,
): Promise<User> => {
  const user = await db.user.findFirst({
    where: {
      id,
    },
  });

  if (!user) {
    throw new Error("No user was found.");
  }

  return user;
};

export const createUser = async (
  { email, password }: Pick<User, "email" | "password">,
): Promise<void> => {
  const hashedPw = await hashPasswordWithArgon2(password);

  try {
    await db.user.create({
      data: {
        password: hashedPw,
        email,
      },
    });
  } catch (err) {
    throw new Error("User cannot be created");
  }
};

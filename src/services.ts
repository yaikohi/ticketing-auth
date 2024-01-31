import User, { IUser } from "./models";
import { hashPasswordWithArgon2 } from "./utils";

/**
 * Retrieves all users from the db.
 */
export async function getUsers() {
  const users = await User.find({});
  return users;
}
/**
 * Retrieves user by email.
 */
export async function getUserByEmail(
  { email }: Pick<IUser, "email">,
): Promise<IUser> {
  const existingUser = await User.findOne({ email: email });

  if (!existingUser) {
    throw new Error(`No user with such email was found.`);
  }

  return existingUser;
}
/**
 * Retrieves user by id.
 */
export async function getUserById(
  { id }: Pick<IUser, "id">,
): Promise<IUser> {
  const user = await User.findById(id);
  if (!user) {
    throw new Error(`User was not found in db!`);
  }

  return user;
}

/**
 * Creates a new user
 */
export async function createUser(
  { email, password }: Pick<IUser, "email" | "password">,
): Promise<void> {
  const hashedPw = await hashPasswordWithArgon2(password);
  const emailExists = await User.findOne({ email });

  if (emailExists) {
    throw new Error(`Email exists.`);
  }

  await User.create({
    password: hashedPw,
    email,
  });
}

/**
 * Deltes a user record from the database.
 */
export async function deleteUserById(
  { id }: { id: Pick<IUser, "_id"> },
) {
  await User.deleteOne({
    _id: id,
  });
}
/**
 * **FOR TESTING**
 * Deletes a user record from the database by email.
 */
export async function deleteUserByEmail(
  { email }: Pick<IUser, "email">,
) {
  await User.deleteOne({
    email,
  });
}
/**
 * Updates a user password after finding the user by id.
 */
export async function updateUserPasswordByUserId(
  { id, password }: Pick<IUser, "password" | "id">,
): Promise<void> {
  const newHashedPassword = await hashPasswordWithArgon2(password);

  await User.findOneAndUpdate({ _id: id }, {
    password: newHashedPassword,
  });
}

/**
 * Updates a user email after finding the user by id.
 */
export async function updateUserEmailByUserId(
  { id, email }: Pick<IUser, "email" | "id">,
): Promise<void> {
  await User.findOneAndUpdate({ _id: id }, { email });
}

export async function createUserAndReturnUser(
  { email, password }: Pick<IUser, "email" | "password">,
): Promise<IUser> {
  const hashedPassword = await hashPasswordWithArgon2(password);

  const user = await User.create({
    email,
    password: hashedPassword,
  });

  // if (!user) {
  //   throw new Error(`Something went wrong?`);
  // }

  return user;
}

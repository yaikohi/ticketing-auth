import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { AppType, PORT } from "../src";
import { edenFetch } from "@elysiajs/eden";
import { deleteUserByEmail } from "../src/services";
// @TODO: Mock mongoDB, don't use actual database
// import { MongoMemoryServer } from "mongodb-memory-server";
// const mongoDB = await MongoMemoryServer.create();
const BASE_URL = `http://localhost`;
const URL = `${BASE_URL}:${PORT}`;

// Type-Safe HTTP Client
export const eFetch = edenFetch<AppType>(`${URL}`);

// --- test data
const testAcc = {
  email: "test@hu.com",
  password: "testacc",
};
// --- Lifecycle hooks
afterAll(async () => {
  await deleteUserByEmail({ email: testAcc.email });
});
// --- Integration tests
describe("Sign-up + sign-in flow", () => {
  it("POST /sign-up: 201 success when signing up with valid details - expected return statement", async () => {
    const { data } = await eFetch("/api/users/sign-up", {
      method: "POST",
      body: testAcc,
    });
    expect(data).toEqual({
      success: true,
      message: `User was signed up successfully.`,
    });
  });

  it("POST /sign-in: 200 success when logging in with valid details - expected return statement", async () => {
    const { data } = await eFetch("/api/users/sign-in", {
      method: "POST",
      body: testAcc,
    });

    expect(data).toEqual({
      success: true,
      message: `Signed in successfully.`,
    });
  });
  it("POST /sign-out: 200 success when signing out - expected return statement", async () => {
    const { data } = await eFetch("/api/users/sign-out", {
      method: "POST",
      body: testAcc,
    });

    expect(data).toEqual({
      success: true,
      message: `Signed out successfully`,
    });
  });
});

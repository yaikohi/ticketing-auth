import { describe, expect, it } from "bun:test";
import { AppType, URL } from "../src";
import { edenFetch, edenTreaty } from "@elysiajs/eden";

export const eFetch = edenFetch<AppType>(`${URL}`);
export const appClient = edenTreaty<AppType>(`${URL}`);

// describe("/api/users/current-user", () => {
//   it("return a 200 response", async () => {
//     const { data } = await eFetch("/api/users/current-user", {
//       method: "GET",
//     });
//
//     expect(data).toBe("Current user!");
//   });
// });
//
// describe("/api/users/sign-up", () => {
//   it("return a 200 response", async () => {
//     const { data } = await eFetch("/api/users/sign-up", {
//       method: "POST",
//       body: {
//         email: "thisis@hu.com",
//         password: "pws",
//       },
//     });
//     expect(data).toEqual({
//       success: true,
//       message: `User was signed up successfully.`,
//     });
//   });
// });
// describe("/api/users/sign-out", () => {
//   it("return a response", async () => {
//     const { data } = await eFetch("/api/users/sign-out", {
//       method: "POST",
//       body: { email: "some@email.com" },
//     });
//
//     expect(data).toBe("Sign out!");
//   });
// });

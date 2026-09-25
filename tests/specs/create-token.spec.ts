import { faker } from "@faker-js/faker"

import { test, expect } from "../fixtures/api.fixture"
import { tokenSchema } from "../contracts/auth.schema"
import { validCredentials } from "../data/credentials"

test.describe("POST /auth - CreateToken", () => {
  test.describe("Happy paths", () => {
    test("Should create token when using valid credentials", { tag: "@smoke" }, async ({ authRequest }) => {
      const response = await authRequest.createToken(validCredentials)

      expect(response.status()).toBe(200)
      await tokenSchema.validateAsync(await response.json())
    })
  })

  test.describe("Unhappy paths", () => {
    const invalidCases = [
      { name: "wrong password", data: { username: validCredentials.username, password: faker.internet.password() } },
      { name: "wrong username", data: { username: faker.internet.username(), password: validCredentials.password } },
      {
        name: "wrong username and password",
        data: { username: faker.internet.username(), password: faker.internet.password() },
      },
      { name: "empty body", data: {} },
      { name: "empty fields", data: { username: "", password: "" } },
    ]

    for (const { name, data } of invalidCases) {
      test(`Should return error when using ${name}`, async ({ authRequest }) => {
        const response = await authRequest.createToken(data)

        expect(response.status()).toBe(200)
        expect((await response.json()).reason).toBe("Bad credentials")
      })
    }
  })
})

import type { APIRequestContext, APIResponse } from "@playwright/test"
import { validCredentials } from "../data/credentials"

export type Credentials = {
  username?: string
  password?: string
}

export class AuthRequest {
  constructor(private readonly request: APIRequestContext) {}

  createToken(credentials: Credentials): Promise<APIResponse> {
    return this.request.post("/auth", { data: credentials })
  }

  async getToken(): Promise<string> {
    const response = await this.createToken(validCredentials)
    return (await response.json()).token
  }
}

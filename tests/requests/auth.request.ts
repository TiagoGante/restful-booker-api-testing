import type { APIRequestContext, APIResponse } from "@playwright/test"

export type Credentials = {
  username?: string
  password?: string
}

export class AuthRequest {
  constructor(private readonly request: APIRequestContext) {}

  createToken(credentials: Credentials): Promise<APIResponse> {
    return this.request.post("/auth", { data: credentials })
  }
}

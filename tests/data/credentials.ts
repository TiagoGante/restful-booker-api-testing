import type { Credentials } from "../requests/auth.request"

export const validCredentials: Credentials = {
  username: process.env.API_USERNAME ?? "admin",
  password: process.env.API_PASSWORD ?? "password123",
}

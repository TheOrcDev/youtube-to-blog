import {
  apiKeyClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [apiKeyClient(), lastLoginMethodClient()],
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

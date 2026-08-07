import { createAstraguardClient } from "@astraguard/api-client";
import { env } from "./env";

export const apiClient = createAstraguardClient({
  baseUrl: env.NEXT_PUBLIC_API_URL,
});

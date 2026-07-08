import { createAstraguardClient } from "@astraguard/api-client";

export const apiClient = createAstraguardClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
});

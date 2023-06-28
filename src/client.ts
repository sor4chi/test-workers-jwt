import { hc } from "hono/client";
import type { AppType } from "../functions/api/[[route]]";

// every request, check localStorage for token, if it exists, add it to the headers
export const client = hc<AppType>("/", {
  fetch: (input, init) => {
    const token = localStorage.getItem("token");
    if (token) {
      init.headers = {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return fetch(input, init);
  },
});

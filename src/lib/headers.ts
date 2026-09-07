import { createIsomorphicFn } from "@tanstack/react-start";
import type { getRequestHeaders } from "@tanstack/react-start/server";

export const getHeaders = createIsomorphicFn()
  .server(async () => {
    const { getRequestHeaders } = await import("@tanstack/react-start/server");
    return getRequestHeaders();
  })
  .client(async () => {
    return new Headers().values() as unknown as ReturnType<
      typeof getRequestHeaders
    >;
  });

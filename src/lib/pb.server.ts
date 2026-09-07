import PocketBase from "pocketbase";
import { env } from "@/env";

declare global {
  var pocketBase: PocketBase | undefined;
}

export async function getPB() {
  globalThis.pocketBase ??= new PocketBase(env.PB_URL);
  if (!globalThis.pocketBase.authStore.isValid) {
    console.log("signing in");
    await globalThis.pocketBase
      .collection("_superusers")
      .authWithPassword(env.PB_USERNAME, env.PB_PASSWORD);
  }
  return globalThis.pocketBase;
}

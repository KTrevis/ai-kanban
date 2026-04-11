import { Client } from "@notionhq/client";
import { getStoredAccessToken } from "./notion.oauth";

export async function getNotionClient() {
  return new Client({
    auth: await getStoredAccessToken(),
  });
}

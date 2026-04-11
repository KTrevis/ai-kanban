import { ENVIRONMENT } from "../../config/env";

const NOTION_TOKEN_PATH = new URL("./notion-token.txt", import.meta.url)
  .pathname;

export async function getStoredAccessToken() {
  const file = Bun.file(NOTION_TOKEN_PATH);

  if (await file.exists()) {
    const text = await file.text();
    return text.trim();
  }
}

export async function fetchAccessToken(code: string) {
  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          `${ENVIRONMENT.NOTION_CLIENT_ID}:${ENVIRONMENT.NOTION_CLIENT_SECRET}`,
        ).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: ENVIRONMENT.NOTION_REDIRECT_URI,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    return data.error_description;
  }

  const file = Bun.file(NOTION_TOKEN_PATH);
  file.write(data.access_token);

  return data.access_token;
}

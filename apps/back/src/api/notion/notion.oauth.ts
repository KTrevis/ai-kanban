import { ENVIRONMENT } from '../../schema/env.schema';
import { HttpError } from '../../lib/http-error';

const NOTION_TOKEN_PATH = new URL('./notion-token.txt', import.meta.url)
  .pathname;

type NotionTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function fetchNotionAccessToken(code: string) {
  const clientId = ENVIRONMENT.NOTION_CLIENT_ID?.trim();
  const clientSecret = ENVIRONMENT.NOTION_CLIENT_SECRET?.trim();
  const redirectUri = getNotionRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    throw new HttpError(
      500,
      'Missing NOTION_CLIENT_ID, NOTION_CLIENT_SECRET or NOTION_REDIRECT_URI',
    );
  }

  const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });
  const data = (await tokenResponse.json()) as NotionTokenResponse;

  if (!tokenResponse.ok || !data.access_token) {
    throw new HttpError(
      400,
      data.error_description ?? data.error ?? 'Failed to fetch Notion token',
    );
  }

  await Bun.write(NOTION_TOKEN_PATH, data.access_token);

  return data.access_token;
}

export function getNotionAuthorizationUrl() {
  const clientId = ENVIRONMENT.NOTION_CLIENT_ID?.trim();
  const redirectUri = getNotionRedirectUri();

  if (!clientId || !redirectUri) {
    return;
  }

  const url = new URL('https://api.notion.com/v1/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('owner', 'user');
  url.searchParams.set('redirect_uri', redirectUri);

  return url.toString();
}

export function getNotionRedirectUri() {
  return ENVIRONMENT.NOTION_REDIRECT_URI?.trim();
}

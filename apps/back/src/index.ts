import { app } from './app';
import {
  getNotionAuthorizationUrl,
  getNotionRedirectUri,
} from './api/notion/notion.oauth';

app.listen(420);

console.log('Server started on port', app.server?.port);

const notionAuthorizationUrl = getNotionAuthorizationUrl();

if (notionAuthorizationUrl) {
  console.log('Notion redirect URI to register:', getNotionRedirectUri());
  console.log('Notion token generation URL:', notionAuthorizationUrl);
}

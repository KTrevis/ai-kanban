import { isFullBlock, isFullPage } from "@notionhq/client";
import { getNotionClient } from "./notion.client";
import { richTextToString } from "./rich-text-to-string";

export async function getPageDescription(pageId: string) {
  const client = await getNotionClient();

  const blocks = await client.blocks.children.list({
    block_id: pageId,
  });

  const description = blocks.results.reduce((acc, curr) => {
    if (!isFullBlock(curr)) {
      return acc;
    }
    if (curr.type !== "paragraph") {
      return acc;
    }
    acc += richTextToString(curr.paragraph.rich_text);
    return acc;
  }, "");

  return description;
}

export async function getPageTitle(pageId: string) {
  const client = await getNotionClient();

  const page = await client.pages.retrieve({
    page_id: pageId,
  });
  if (!isFullPage(page)) {
    return null;
  }
  const titleProperty = Object.values(page.properties).find(
    (curr) => curr.type === "title",
  );
  const title = titleProperty?.title.map((curr) => curr.plain_text).join("");
  return title;
}

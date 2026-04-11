import { getNotionClient } from "./notion.client";
import { richTextToString } from "./rich-text-to-string";

export type NotionComment = {
  comment: string;
  author: string | null;
  type: "person" | "bot";
};

export async function getPageComments(blockId: string) {
  const client = await getNotionClient();
  const { results } = await client.comments.list({
    block_id: blockId,
    page_size: 100,
  });

  const comments = Array.from<NotionComment>({ length: results.length });

  for (const [i, curr] of results.entries()) {
    const comment = richTextToString(curr.rich_text);
    const user = await client.users.retrieve({
      user_id: curr.created_by.id,
    });
    comments[i] = {
      comment,
      author: user.name,
      type: user.type,
    };
  }
  return comments;
}

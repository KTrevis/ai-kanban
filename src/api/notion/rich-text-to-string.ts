import { RichTextItemResponse } from "@notionhq/client";

export function richTextToString(richText: RichTextItemResponse[]) {
  return richText.map((richText) => richText.plain_text).join("");
}

import type { ContentRecord } from "@/content/types";

export function articlePath(row: ContentRecord, topic = row.topic) {
  return topic?.universe === "professional"
    ? "/professional/topic/" + encodeURIComponent(topic.slug) + "#" + encodeURIComponent(row.slug)
    : "/personal/post/" + encodeURIComponent(row.slug);
}

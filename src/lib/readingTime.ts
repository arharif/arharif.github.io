// Match the site's Markdown dialect. Count Unicode words in visible prose and
// code, ignoring structural markers, image markup and link destinations.
export function readingStats(body: string, override?: number) {
  let fenced = false;
  const lines = body.split('\n').map(line => {
    if (line.trimStart().startsWith('```')) { fenced = !fenced; return ''; }
    if (fenced) return line;
    return line.replace(/^\s*(?:#{1,3}\s|[-*>]\s|\d+\.\s)/, '')
      .replace(/!\[[^\]]*\]\(https:\/\/[^)]+\)/gi, '')
      .replace(/\[([^\]]+)\]\((?:https:\/\/|mailto:)[^)]+\)/gi, '$1');
  });
  const words = lines.join(' ').match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  const automatic = Math.max(1, Math.ceil(words / 220));
  return { words, minutes: override && Number.isInteger(override) && override > 0 ? override : automatic, automatic };
}

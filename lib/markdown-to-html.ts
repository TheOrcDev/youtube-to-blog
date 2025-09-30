import { remark } from "remark";
import html from "remark-html";

// Regex to match frontmatter (YAML metadata between --- markers)
const FRONTMATTER_REGEX = /^---\s*\n[\s\S]*?\n---\s*\n/;

function stripFrontmatter(content: string): string {
  // Remove frontmatter (YAML metadata between --- markers)
  return content.replace(FRONTMATTER_REGEX, "").trim();
}

export default async function markdownToHtml(markdown: string) {
  // Remove frontmatter before processing
  const cleanMarkdown = stripFrontmatter(markdown);
  const result = await remark().use(html).process(cleanMarkdown);
  return result.toString();
}

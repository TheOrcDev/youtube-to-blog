import { remark } from "remark";
import html from "remark-html";

// Regex to match frontmatter (YAML metadata between --- markers)
const FRONTMATTER_REGEX = /^---\s*\n[\s\S]*?\n---\s*\n/;

// Regex to match markdown code block markers at the beginning
const CODE_BLOCK_REGEX = /^```(?:md|mdx)?\s*\n/;

function stripFrontmatter(content: string): string {
  // Remove frontmatter (YAML metadata between --- markers)
  let cleanedContent = content.replace(FRONTMATTER_REGEX, "");
  
  // Remove markdown code block markers at the beginning
  cleanedContent = cleanedContent.replace(CODE_BLOCK_REGEX, "");
  
  return cleanedContent.trim();
}

export default async function markdownToHtml(markdown: string) {
  // Remove frontmatter before processing
  const cleanMarkdown = stripFrontmatter(markdown);
  const result = await remark().use(html).process(cleanMarkdown);
  return result.toString();
}

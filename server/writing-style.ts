import {
  buildStylePromptSection,
  DEFAULT_WRITING_STYLE_ID,
  isWritingStyleId,
  type WritingStyleId,
} from "../lib/writing-styles.ts";
import { BlogWorkflowError } from "./blog-errors.ts";

export interface SavedWritingStyle {
  styleInstructions: string | null;
  writingStyle: string;
}

export interface WritingStyleOverride {
  id?: WritingStyleId;
  instructions?: string;
}

interface ResolveWritingStyleInput {
  canUseCustomInstructions: boolean;
  override?: WritingStyleOverride;
  saved: SavedWritingStyle | null;
}

// Returns the prompt section for the effective style. Explicitly requested
// custom instructions (API) fail loudly without Pro; saved instructions are
// dropped silently on downgrade so old settings never break generation.
export function resolveWritingStyle({
  canUseCustomInstructions,
  override,
  saved,
}: ResolveWritingStyleInput): string {
  const savedId =
    saved && isWritingStyleId(saved.writingStyle) ? saved.writingStyle : null;
  const styleId = override?.id ?? savedId ?? DEFAULT_WRITING_STYLE_ID;

  const overrideInstructions = override?.instructions?.trim();

  if (overrideInstructions) {
    if (!canUseCustomInstructions) {
      throw new BlogWorkflowError("STYLE_REQUIRES_PRO");
    }

    return buildStylePromptSection(styleId, overrideInstructions);
  }

  const savedInstructions = canUseCustomInstructions
    ? saved?.styleInstructions
    : null;

  return buildStylePromptSection(styleId, savedInstructions);
}

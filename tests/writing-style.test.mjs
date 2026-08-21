import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStylePromptSection,
  DEFAULT_WRITING_STYLE_ID,
  getWritingStyleById,
  isWritingStyleId,
  MAX_STYLE_INSTRUCTIONS_LENGTH,
  WRITING_STYLES,
} from "../lib/writing-styles.ts";
import { resolveWritingStyle } from "../server/writing-style.ts";

const FIRST_PERSON_RULE = /first person/;
const TUTORIAL_RULE = /hands-on tutorial/;
const STYLE_NOTES_OPEN = /<style-notes>/;
const NO_EMOJI_NOTE = /Never use emoji\./;

test("every preset id is valid and resolvable", () => {
  for (const style of WRITING_STYLES) {
    assert.equal(isWritingStyleId(style.id), true);
    assert.equal(getWritingStyleById(style.id).id, style.id);
  }

  assert.equal(isWritingStyleId("shakespearean"), false);
  assert.equal(
    getWritingStyleById("shakespearean").id,
    DEFAULT_WRITING_STYLE_ID
  );
});

test("the default resolution keeps the original personal voice", () => {
  const section = resolveWritingStyle({
    canUseCustomInstructions: false,
    saved: null,
  });

  assert.match(section, FIRST_PERSON_RULE);
  assert.doesNotMatch(section, STYLE_NOTES_OPEN);
});

test("a per-request override wins over the saved default", () => {
  const section = resolveWritingStyle({
    canUseCustomInstructions: true,
    override: { id: "tutorial" },
    saved: { styleInstructions: null, writingStyle: "punchy" },
  });

  assert.match(section, TUTORIAL_RULE);
});

test("an unknown saved style falls back to the default preset", () => {
  const section = resolveWritingStyle({
    canUseCustomInstructions: true,
    saved: { styleInstructions: null, writingStyle: "legacy-style" },
  });

  assert.match(section, FIRST_PERSON_RULE);
});

test("saved custom instructions are included for entitled users only", () => {
  const saved = {
    styleInstructions: "Never use emoji.",
    writingStyle: "personal",
  };

  const proSection = resolveWritingStyle({
    canUseCustomInstructions: true,
    saved,
  });
  assert.match(proSection, STYLE_NOTES_OPEN);
  assert.match(proSection, NO_EMOJI_NOTE);

  // A downgraded user keeps generating; the stale instructions just drop out.
  const freeSection = resolveWritingStyle({
    canUseCustomInstructions: false,
    saved,
  });
  assert.doesNotMatch(freeSection, STYLE_NOTES_OPEN);
});

test("explicit instructions without Pro fail with STYLE_REQUIRES_PRO", () => {
  assert.throws(
    () =>
      resolveWritingStyle({
        canUseCustomInstructions: false,
        override: { instructions: "Sound like a pirate." },
        saved: null,
      }),
    (error) => error.code === "STYLE_REQUIRES_PRO"
  );
});

test("instructions are capped at the documented length", () => {
  const section = buildStylePromptSection(
    "personal",
    "x".repeat(MAX_STYLE_INSTRUCTIONS_LENGTH + 100)
  );
  const [, notes] = section.split("<style-notes>\n");

  assert.equal(notes.split("\n")[0].length, MAX_STYLE_INSTRUCTIONS_LENGTH);
});

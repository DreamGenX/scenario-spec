import { z } from "zod";

// Regex matching all {{placeholders}} in a prompt.
const PLACEHOLDER_REGEX = /{{([^}]*?)}}/g;

export function getAllPlaceholders(text: string): Set<string> {
  const matches = text.matchAll(PLACEHOLDER_REGEX);
  const placeholders: Set<string> = new Set();
  for (const match of matches) {
    const content = match[1]?.trim();
    if (content != null && content.length > 0) {
      placeholders.add(content);
    }
  }
  return placeholders;
}

export function checkPlaceholderValidity(
  validPlaceholders: Set<string>,
  text: string,
  path: (string | number)[],
  ctx: z.RefinementCtx
) {
  const placeholders = getAllPlaceholders(text);
  const validPlaceholdersMessage = `Valid placeholders are: ${Array.from(
    validPlaceholders
  )
    .map((p) => `{{${p}}}`)
    .join(", ")}.`;

  const invalidPlaceholders: string[] = [];
  for (const placeholder of placeholders) {
    if (!validPlaceholders.has(placeholder)) {
      invalidPlaceholders.push(`{{${placeholder}}}`);
    }
  }

  if (invalidPlaceholders.length === 0) {
    return;
  }

  const message = `${
    invalidPlaceholders.length === 1 ? "Placeholder" : "Placeholders"
  } ${invalidPlaceholders.join(", ")} ${
    invalidPlaceholders.length === 1 ? "is" : "are"
  } invalid.\n${validPlaceholdersMessage}`;

  ctx.addIssue({
    code: z.ZodIssueCode.custom,
    message,
    path,
    fatal: false,
  });
}

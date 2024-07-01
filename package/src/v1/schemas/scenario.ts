import { z } from "zod";

import {
  definitionDescriptionLaxSchema,
  definitionDescriptionSchema,
  definitionPastEventsSchema,
  definitionStyleSchema,
  displayDescriptionMarkdownSchema,
  displayNameSchema,
  imageSchema,
} from "./common.js";
import { Entity, entityLaxSchema, entitySchema } from "./entity.js";
import { interactionDataSchema } from "./interaction.js";
import { checkPlaceholderValidity } from "../../utils/placeholders.js";

export const sessionStartSchema = z.object({
  interactions: z.array(interactionDataSchema).default([]),
});

export type SessionStart = z.infer<typeof sessionStartSchema>;

export const sessionExampleSchema = z.object({
  description: z.string().max(1500, {
    message: "Example description must be less than 1500 characters",
  }),
  interactions: z.array(interactionDataSchema).default([]),
});

export type SessionExample = z.infer<typeof sessionExampleSchema>;

export const sessionExamplesSchema = z.object({
  examples: z.array(sessionExampleSchema).default([]),
});

export type SessionExamples = z.infer<typeof sessionExamplesSchema>;

export const scenarioTagSchema = z.object({
  label: z
    .string()
    .max(64, { message: "Tag label must be less than 64 characters" }),
  name: z
    .string()
    .max(64, { message: "Tag name must be less than 64 characters" }),
});

export type ScenarioTag = z.infer<typeof scenarioTagSchema>;

export const scenarioDisplayDataSchema = z.object({
  name: displayNameSchema,
  descriptionMarkdown: displayDescriptionMarkdownSchema,
  shortDescriptionMarkdown: displayDescriptionMarkdownSchema,
  tags: z.array(scenarioTagSchema).default([]),
  images: z.array(imageSchema).default([]),
});

export type ScenarioDisplayData = z.infer<typeof scenarioDisplayDataSchema>;

export const scenarioDefinitionDataSchema = z.object({
  description: definitionDescriptionSchema,
  pastEvents: definitionPastEventsSchema,
  style: definitionStyleSchema,
  start: sessionStartSchema,
  examples: sessionExamplesSchema,
});

export const scenarioDefinitionDataLaxSchema = scenarioDefinitionDataSchema
  .omit({
    description: true,
  })
  .merge(z.object({ description: definitionDescriptionLaxSchema }));

export type ScenarioDefinitionData = z.infer<
  typeof scenarioDefinitionDataSchema
>;

export const scenarioFormatSchema = z.enum(["story", "role_play"]);

export type ScenarioFormat = z.infer<typeof scenarioFormatSchema>;

export const scenarioSchema = z.object({
  format: scenarioFormatSchema,

  display: scenarioDisplayDataSchema.default({
    name: "",
    descriptionMarkdown: "",
    shortDescriptionMarkdown: "",
    tags: [],
  }),

  definition: scenarioDefinitionDataSchema.default({
    description: "",
    pastEvents: "",
    style: "",
    start: { interactions: [] },
    examples: { examples: [] },
  }),

  entities: z.array(entitySchema).default([]),
});

export const scenarioLaxSchema = scenarioSchema
  .omit({
    definition: true,
    entities: true,
  })
  .merge(
    z.object({
      definition: scenarioDefinitionDataLaxSchema.default({
        description: "",
        pastEvents: "",
        style: "",
        start: { interactions: [] },
        examples: { examples: [] },
      }),
      entities: z.array(entityLaxSchema),
    })
  );

export type Scenario = z.infer<typeof scenarioSchema>;

function getValidPlaceholders(
  entities: Entity[],
  format: ScenarioFormat
): Set<string> {
  const placeholders: Set<string> = new Set();
  for (const entity of entities) {
    if (entity.label == null || entity.label.trim().length === 0) {
      continue;
    }
    placeholders.add(entity.label.trim());
  }
  if (format === "role_play") {
    placeholders.add("user");
  }
  return placeholders;
}

export const scenarioWithExtraChecksSchema = scenarioSchema
  .superRefine((v, ctx) => {
    const validPlaceholders = getValidPlaceholders(v.entities, v.format);

    checkPlaceholderValidity(
      validPlaceholders,
      v.definition.description,
      ["definition", "description"],
      ctx
    );

    checkPlaceholderValidity(
      validPlaceholders,
      v.definition.style,
      ["definition", "style"],
      ctx
    );

    {
      for (const [
        index,
        interaction,
      ] of v.definition.start.interactions.entries()) {
        checkPlaceholderValidity(
          validPlaceholders,
          interaction.payload.content,
          ["definition", "start", "interactions", index],
          ctx
        );
      }
    }

    {
      for (const [index, entity] of v.entities.entries()) {
        checkPlaceholderValidity(
          validPlaceholders,
          entity.definition.description,
          ["entities", index, "definition", "description"],
          ctx
        );
      }
    }
  })
  .superRefine((v, ctx) => {
    const entityLabels = new Set<string>();
    for (const [index, entity] of v.entities.entries()) {
      if (entity.label == null || entity.label.trim().length === 0) {
        continue;
      }
      if (entityLabels.has(entity.label.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Entity labels must be unique.",
          path: ["entities", index, "label"],
          fatal: false,
        });
      }
      entityLabels.add(entity.label.trim());
    }
  });

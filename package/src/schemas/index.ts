import { z } from "zod";

import {
  scenarioLaxSchema as scenarioLaxSchemaV1,
  scenarioSchema as scenarioSchemaV1,
} from "../v1/index.js";

export const scenarioContainerSchema = z.object({
  object: z.literal("scenario"),
  version: z.literal("1.0"),
  data: z.object({
    scenario: scenarioSchemaV1,
  }),
});

export const scenarioContainerLaxSchema = z.object({
  object: z.literal("scenario"),
  version: z.literal("1.0"),
  data: z.object({
    scenario: scenarioLaxSchemaV1,
  }),
});

export type ScenarioContainer = z.infer<typeof scenarioContainerSchema>;

export const scenarioSessionContainerSchema = z.object({
  object: z.literal("scenario_session"),
  version: z.literal("1.0"),
  data: z.object({
    scenario: scenarioSchemaV1,
  }),
});

export type ScenarioSessionContainer = z.infer<
  typeof scenarioSessionContainerSchema
>;

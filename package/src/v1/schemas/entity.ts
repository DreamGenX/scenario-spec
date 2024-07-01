import { z } from 'zod';

import {
  definitionDescriptionSchema,
  definitionNameLaxSchema,
  definitionNameSchema,
  displayDescriptionMarkdownSchema,
  displayNameSchema,
  imageSchema,
  labelSchema
} from './common.js';

export const entityKindSchema = z.enum(['character', 'character_user', 'location', 'item']);

export type EntityKind = z.infer<typeof entityKindSchema>;

export const ENTITY_KINDS: EntityKind[] = ['character', 'character_user', 'location', 'item'];

export const entityDisplayDataSchema = z.object({
  name: displayNameSchema,
  descriptionMarkdown: displayDescriptionMarkdownSchema,
  images: z.array(imageSchema).default([])
});

export type EntityDisplayData = z.infer<typeof entityDisplayDataSchema>;

export const entityDefinitionDataSchema = z.object({
  name: definitionNameSchema,
  description: definitionDescriptionSchema
});

export const entityDefinitionDataLaxSchema = entityDefinitionDataSchema
  .omit({ name: true })
  .merge(z.object({ name: definitionNameLaxSchema }));

export type EntityDefinitionData = z.infer<typeof entityDefinitionDataSchema>;

export const entitySchema = z.object({
  id: z.string().uuid(),

  label: labelSchema.optional(),

  kind: entityKindSchema,

  display: entityDisplayDataSchema,
  definition: entityDefinitionDataSchema
});

export const entityLaxSchema = entitySchema
  .omit({ definition: true })
  .merge(z.object({ definition: entityDefinitionDataLaxSchema }));

export type Entity = z.infer<typeof entitySchema>;

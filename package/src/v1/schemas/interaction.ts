import { z } from 'zod';

const interactionPayloadBaseSchema = z.object({
  content: z.string().default(''),
  closed: z.boolean().default(true),
  // If set to true, it will be hidden by default form the user, but the user can reveal it in settings.
  hidden: z.boolean().default(false),

  prompt: z
    .object({
      // When constructing the prompt and prioritizing interactions to fit into the token limit, the interactions with lowest priority will be removed first.
      // By convention, the maximum priority is 0.
      priority: z.number().max(0).default(-1),

      // If set to true, the interaction will not be used in the prompt.
      excluded: z.boolean().default(false)
    })
    .default({ priority: -1, excluded: false })
});

const interactionInstructionPayloadSchema = z.intersection(
  interactionPayloadBaseSchema,
  z.object({
    kind: z.literal('instruction')
  })
);

const interactionTextPayloadSchema = z.intersection(
  interactionPayloadBaseSchema,
  z.object({
    kind: z.literal('text')
  })
);

const interactionMessagePayloadSchema = z.intersection(
  interactionPayloadBaseSchema,
  z.object({
    kind: z.literal('message'),
    role: z.enum(['bot', 'user']).default('bot'),
    name: z.string().optional(),
    characterId: z.string().uuid().optional()
  })
);

export const INTERACTION_DEFAULTS = { hidden: false, excluded: false, sticky: false };

export const interactionPayloadSchema = z.union([
  interactionInstructionPayloadSchema,
  interactionTextPayloadSchema,
  interactionMessagePayloadSchema
]);

export type InteractionPayload = z.infer<typeof interactionPayloadSchema>;

export const interactionSchema = z.object({
  payload: interactionPayloadSchema,
  id: z.string().uuid(),
  parentId: z.string().uuid().optional()
});

export type Interaction = z.infer<typeof interactionSchema>;

export const interactionDataSchema = z.object({
  payload: interactionPayloadSchema
});

export type InteractionData = z.infer<typeof interactionDataSchema>;

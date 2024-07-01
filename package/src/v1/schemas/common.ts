import { z } from 'zod';

export const labelSchema = z
  .string()
  .min(2, { message: 'Label must be at least 2 characters' })
  .max(64, { message: 'Label must be less than 64 characters' })
  .regex(/((?!(user)).)*/, { message: 'Label cannot contain "user"' })
  .regex(/^[a-zA-Z0-9]+(_[a-zA-Z0-9]+)*$/, { message: 'Label must be snake_case' });

export const definitionNameLaxSchema = z
  .string()
  .max(64, { message: 'Name must be less than 64 characters' });

export const definitionNameSchema = definitionNameLaxSchema.min(2, {
  message: 'Name must be at least 2 characters'
});

export const definitionDescriptionLaxSchema = z
  .string()
  .max(15000, { message: 'Prompt description must be less than 15000 characters' });

export const definitionDescriptionSchema = definitionDescriptionLaxSchema.min(10, {
  message: 'Prompt description must be at least 10 characters'
});

export const definitionPastEventsSchema = z
  .string()
  .max(10000, { message: 'Past events must be less than 10000 characters' })
  // Regex to check that the string is a list of bullet points
  .regex(/^(?:(?:- .*\n?)|(:?\s+))*$/, {
    message: 'Past events must be a list of bullet points'
  });

export const definitionStyleSchema = z
  .string()
  .max(1500, { message: 'Prompt style description must be less than 1500 characters' });

export const displayDescriptionMarkdownSchema = z.string().max(5000, {
  message: 'Description must be less than 5000 characters'
});

export const displayNameSchema = z.string().max(64, {
  message: 'Name must be less than 64 characters'
});

export const privateNotesMarkdownSchema = z.string().max(2048, {
  message: 'Notes must be less than 2048 characters'
});

export const imageSchema = z.object({
  nsfw: z.boolean().default(false),
  dataBase64: z.string().base64()
});

export type Image = z.infer<typeof imageSchema>;

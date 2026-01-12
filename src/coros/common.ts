import { z } from 'zod';

export const CorosResponseBase = z.object({
  apiCode: z.string(),
  message: z.string(),
  result: z.string(),
});
export type CorosResponseBase = z.infer<typeof CorosResponseBase>;

export const CorosResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    ...CorosResponseBase.shape,
    data: dataSchema,
  });

const CorosResponseWithData = CorosResponse(
  z.union([z.string(), z.record(z.string(), z.unknown()), z.array(z.unknown()), z.undefined()]).optional(),
);
export type CorosResponseWithData = z.infer<typeof CorosResponseWithData>;

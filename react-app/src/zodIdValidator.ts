import { z, SuperRefinement } from "zod";

export const validId = (idRegex: RegExp, message: string): SuperRefinement<string> => {
  const correctFormatSchema = z.string().regex(idRegex, {
    message,
  });

  return (val, ctx) => {
    const result = correctFormatSchema.safeParse(val);

    if (!result.success) {
      ctx.addIssue({
        message: result.error.issues.at(0)?.message,
        code: z.ZodIssueCode.custom,
        fatal: true,
      });
    }
  };
};

import { ZodError } from "zod";

export function zodErrorToObject(err: ZodError<any>): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  err.issues.forEach(issue => {
    const key = issue.path[0] as string || "_global";
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  });
  return out;
}

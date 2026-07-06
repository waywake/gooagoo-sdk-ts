import { createHash } from "node:crypto";

export type SignableValue = string | number | boolean | null | undefined;
export type SignableParams = Record<string, SignableValue>;

export function md5Upper(input: string): string {
  return createHash("md5").update(input, "utf8").digest("hex").toUpperCase();
}

export function buildSignString(
  params: SignableParams,
  secretKey: string,
): string {
  const body = Object.keys(params)
    .filter((key) => key !== "sign")
    .sort()
    .flatMap((key) => {
      const value = params[key];
      if (value === null || value === undefined || value === "") return [];
      return `${key}=${String(value)}`;
    })
    .join("&");

  return body ? `${body}&key=${secretKey}` : `key=${secretKey}`;
}

export function sign(params: SignableParams, secretKey: string): string {
  return md5Upper(buildSignString(params, secretKey));
}

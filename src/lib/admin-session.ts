import { createHmac, timingSafeEqual } from "node:crypto";

export const adminSessionCookieName = "mesa-admin-session";
export const adminSessionMaxAge = 60 * 60 * 24 * 7;

type AdminSessionPayload = {
  userId: string;
  exp: number;
};

function getAdminSessionSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    "dev-admin-session-secret-change-me-before-production"
  );
}

function createSignature(payload: string) {
  return createHmac("sha256", getAdminSessionSecret())
    .update(payload)
    .digest("hex");
}

export function createAdminSessionValue(userId: string) {
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      exp: Date.now() + adminSessionMaxAge * 1000,
    } satisfies AdminSessionPayload),
    "utf8",
  ).toString("base64url");

  const signature = createSignature(payload);

  return `${payload}.${signature}`;
}

export function readAdminSessionValue(value?: string | null) {
  if (!value) {
    return null;
  }

  const [payload, signature] = value.split(".");

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = createSignature(payload);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSessionPayload;

    if (!parsed.userId || !parsed.exp || parsed.exp < Date.now()) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

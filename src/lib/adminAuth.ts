import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "siren_admin_session";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

interface SessionPayload {
  sub: string;
  exp: number;
}

const encode = (value: string): string => {
  return Buffer.from(value, "utf8").toString("base64url");
};

const decode = (value: string): string => {
  return Buffer.from(value, "base64url").toString("utf8");
};

const sign = (payload: string, secret: string): string => {
  return createHmac("sha256", secret).update(payload).digest("base64url");
};

const secureCompare = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

export const hasAdminConfig = (): boolean => {
  return Boolean(
    import.meta.env.ADMIN_USER &&
    import.meta.env.ADMIN_PASSWORD &&
    import.meta.env.ADMIN_SESSION_SECRET,
  );
};

export const validateAdminCredentials = (
  username: string,
  password: string,
): boolean => {
  const expectedUser = import.meta.env.ADMIN_USER;
  const expectedPassword = import.meta.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPassword) {
    return false;
  }

  return (
    secureCompare(username, expectedUser) &&
    secureCompare(password, expectedPassword)
  );
};

export const createSessionToken = (subject: string, secret: string): string => {
  const payload: SessionPayload = {
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
};

export const verifySessionToken = (
  token: string | undefined,
  secret: string,
): boolean => {
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const encodedPayload = parts[0];
  const signature = parts[1];
  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature = sign(encodedPayload, secret);

  if (!secureCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

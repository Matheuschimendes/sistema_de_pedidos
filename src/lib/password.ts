import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const expectedHash = Buffer.from(hash, "hex");
  const candidateHash = scryptSync(password, salt, PASSWORD_KEY_LENGTH);

  if (expectedHash.length !== candidateHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, candidateHash);
}

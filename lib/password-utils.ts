// Password hashing utilities
import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [salt, hash] = hashedPassword.split(':');
    const hashBuffer = Buffer.from(hash, 'hex');
    const hashToVerify = scryptSync(password, salt, 64);
    
    return timingSafeEqual(hashBuffer, hashToVerify);
  } catch (error) {
    return false;
  }
}
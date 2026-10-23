import argon2 from 'argon2';
import { randomBytes, createHash } from 'node:crypto';
export const hashPassword = value => argon2.hash(value, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
export const verifyPassword = (hash, value) => argon2.verify(hash, value);
export const randomToken = () => randomBytes(32).toString('hex');
export const hashToken = token => createHash('sha256').update(token).digest('hex');

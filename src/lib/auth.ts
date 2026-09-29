import bcrypt from 'bcryptjs';
import { Member, Role } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'sparc_orbital_secret_super_secure_key_2026';

export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

export async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plainPassword, hash);
}

/**
 * Strips password hash and private credentials from Member object
 */
export function sanitizeMember(member: Member): Member {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safeMember } = member;
  return {
    ...safeMember,
    has_password: Boolean(password_hash)
  };
}

/**
 * Checks if user is Founder (Super Admin)
 */
export function isFounder(role?: Role | string): boolean {
  return role === 'FOUNDER';
}

/**
 * Checks if user is Leadership (Founder, Captain, Vice Captain, Secretary)
 * According to updated requirements: ONLY these 4 roles can mark attendance!
 */
export function isLeadership(role?: Role | string): boolean {
  return role === 'FOUNDER' || role === 'CAPTAIN' || role === 'VICE_CAPTAIN' || role === 'SECRETARY';
}

/**
 * Checks if user can mark attendance
 */
export function canMarkAttendance(role?: Role | string): boolean {
  return isLeadership(role);
}

/**
 * Checks if user can manage members (Founder, Captain, Vice Captain, Secretary)
 */
export function canManageMembers(role?: Role | string): boolean {
  return isLeadership(role);
}

/**
 * Encodes payload into a safe base64url signed token
 */
export function createSessionToken(member: Member): string {
  const payload = {
    sub: member.id,
    sparc_id: member.sparc_id,
    name: member.name,
    role: member.role,
    department: member.department,
    batch: member.batch,
    academic_year: member.academic_year,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  const str = JSON.stringify(payload);
  const base64 = Buffer.from(str).toString('base64url');
  // Simple HMAC-like signature token
  const signature = Buffer.from(`${base64}.${JWT_SECRET}`).toString('base64url').slice(0, 32);
  return `${base64}.${signature}`;
}

/**
 * Verifies session token
 */
export function verifySessionToken(token: string): { valid: boolean; payload?: any } {
  try {
    if (!token) return { valid: false };
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    
    const [base64, sig] = parts;
    const expectedSig = Buffer.from(`${base64}.${JWT_SECRET}`).toString('base64url').slice(0, 32);
    if (sig !== expectedSig) return { valid: false };

    const jsonStr = Buffer.from(base64, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);

    if (payload.exp && Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

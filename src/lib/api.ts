import crypto from 'crypto';
import type {
  DomainInfo,
  DomainAttributes,
  SignupFormData,
  UserData,
  Country,
  InviteInfo,
  FollowedSite,
} from './types';

const CONTRIB_API = process.env.CONTRIB_API_URL || 'http://api.contrib.com/requestreplicated';
const IPARTNER_API = process.env.IPARTNER_API_URL || 'http://api1.contrib.co/ipartner';

function generateKey(domain: string): string {
  return crypto.createHash('md5').update(domain).digest('hex');
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    console.error(`API fetch failed: ${url}`);
    return null;
  }
}

// --- Contrib API (api.contrib.com) ---

export async function getDomainInfo(domain: string): Promise<DomainInfo | null> {
  const key = generateKey(domain);
  const data = await fetchJSON<{ data: DomainInfo }>(
    `${CONTRIB_API}/getdomaininfo?domain=${encodeURIComponent(domain)}&key=${key}`
  );
  return data?.data ?? null;
}

export async function getDomainAttributes(domain: string): Promise<DomainAttributes | null> {
  const key = generateKey(domain);
  const data = await fetchJSON<{ data: DomainAttributes }>(
    `${CONTRIB_API}/getdomainattributes?domain=${encodeURIComponent(domain)}&key=${key}`
  );
  return data?.data ?? null;
}

export async function getFollowedSites(domain: string): Promise<FollowedSite[]> {
  const key = generateKey(domain);
  const data = await fetchJSON<{ data: FollowedSite[] }>(
    `${CONTRIB_API}/getfollowedsites?key=${key}`
  );
  return data?.data ?? [];
}

export async function getFollowCount(domain: string): Promise<number> {
  const key = generateKey(domain);
  const data = await fetchJSON<{ data: { count: number } }>(
    `${CONTRIB_API}/getdomainfollowcount?domain=${encodeURIComponent(domain)}&key=${key}`
  );
  return data?.data?.count ?? 0;
}

export async function getSignupFormData(): Promise<SignupFormData | null> {
  const data = await fetchJSON<{ data: SignupFormData }>(
    `${CONTRIB_API}/getsignupformdata`
  );
  return data?.data ?? null;
}

export async function getDomainAffiliateId(domain: string): Promise<string> {
  const key = generateKey(domain);
  const data = await fetchJSON<{ data: { affiliateid: string } }>(
    `${CONTRIB_API}/getdomainaffiliateid?domain=${encodeURIComponent(domain)}&key=${key}`
  );
  return data?.data?.affiliateid ?? '';
}

// --- iPartner API (api1.contrib.co) ---

export async function authenticateUser(
  email: string,
  password?: string
): Promise<UserData | null> {
  const params = new URLSearchParams({ email });
  if (password) params.append('password', password);
  const data = await fetchJSON<{ data: UserData }>(
    `${IPARTNER_API}/GetVNOCUserData?${params.toString()}`
  );
  return data?.data ?? null;
}

export async function checkVnocMemberExist(email: string): Promise<boolean> {
  const data = await fetchJSON<{ data: { exists: boolean } }>(
    `${IPARTNER_API}/CheckVnocMemberExist?email=${encodeURIComponent(email)}`
  );
  return data?.data?.exists ?? false;
}

export async function getCountries(): Promise<unknown> {
  const data = await fetchJSON<Record<string, unknown>>(
    `${IPARTNER_API}/Getcountry`
  );
  // API may return { data: [...] } or { data: { value: [...] } }
  const inner = data?.data;
  if (Array.isArray(inner)) return inner;
  if (inner && typeof inner === 'object' && 'value' in (inner as Record<string, unknown>)) {
    return (inner as Record<string, unknown>).value;
  }
  return inner ?? [];
}

export async function checkDomainExist(domain: string): Promise<boolean> {
  const data = await fetchJSON<{ data: { exists: boolean } }>(
    `${IPARTNER_API}/CheckDomainExist?domain=${encodeURIComponent(domain)}`
  );
  return data?.data?.exists ?? false;
}

export async function checkMemberExist(memberId: string): Promise<boolean> {
  const data = await fetchJSON<{ data: { exists: boolean } }>(
    `${IPARTNER_API}/CheckMemberExist?memberid=${encodeURIComponent(memberId)}`
  );
  return data?.data?.exists ?? false;
}

export async function getUserData(memberId: string, field: string): Promise<string> {
  const data = await fetchJSON<{ data: { value: string } }>(
    `${IPARTNER_API}/GetUserData?memberid=${encodeURIComponent(memberId)}&field=${encodeURIComponent(field)}`
  );
  return data?.data?.value ?? '';
}

export async function checkInviteExist(inviteId: string): Promise<boolean> {
  const data = await fetchJSON<{ data: { exists: boolean } }>(
    `${IPARTNER_API}/CheckInviteExist?inviteid=${encodeURIComponent(inviteId)}`
  );
  return data?.data?.exists ?? false;
}

export async function getInviteInfo(inviteId: string): Promise<InviteInfo | null> {
  const data = await fetchJSON<{ data: InviteInfo }>(
    `${IPARTNER_API}/GetInviteInfo?inviteid=${encodeURIComponent(inviteId)}`
  );
  return data?.data ?? null;
}

export async function getAppInviteInfo(inviteId: string): Promise<InviteInfo | null> {
  const data = await fetchJSON<{ data: InviteInfo }>(
    `${IPARTNER_API}/GetAppInviteInfo?inviteid=${encodeURIComponent(inviteId)}`
  );
  return data?.data ?? null;
}

export async function getVnocMemberInfo(memberId: string): Promise<UserData | null> {
  const data = await fetchJSON<{ data: UserData }>(
    `${IPARTNER_API}/GetVNOCUserData?email=&memberid=${encodeURIComponent(memberId)}`
  );
  return data?.data ?? null;
}

export interface DomainInfo {
  domainid: string;
  domainname: string;
  memberid: string;
  title: string;
  logo: string;
  description: string;
  account_ga: string;
  background_image: string;
  introduction: string;
  about: string;
  forsale: string;
  forsaletext: string;
  follow_count: number;
  domain_affiliate_link: string;
}

export interface DomainAttributes {
  forsale: string;
  forsaletext: string;
  background_image: string;
  logo: string;
  title: string;
  description: string;
  introduction: string;
  about: string;
  account_ga: string;
}

export interface SignupFormData {
  roles: FormOption[];
  intentions: FormOption[];
  industries: FormOption[];
  experiences: FormOption[];
}

export interface FormOption {
  id: string;
  name: string;
}

export interface UserData {
  memberid: string;
  email: string;
  firstname: string;
  lastname: string;
  country: string;
  [key: string]: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface InviteInfo {
  inviteid: string;
  memberid: string;
  email: string;
  firstname: string;
  lastname: string;
  domain: string;
  status: string;
}

export interface FollowedSite {
  domain: string;
  logo: string;
  title: string;
  description: string;
}

export interface SiteConfig {
  domain: string;
  domainInfo: DomainInfo | null;
  formData: SignupFormData | null;
}

export type PartnershipType = 'domain' | 'apps' | 'leaders' | 'product-service';

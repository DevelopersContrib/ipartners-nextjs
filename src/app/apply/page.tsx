import type { Metadata } from 'next';
import ApplyPageClient from './ApplyPageClient';

export const metadata: Metadata = {
  title: 'Apply for a Partnership - iPartner',
  description: 'Choose your partnership type and apply to join iPartner.',
};

export default function ApplyPage() {
  return <ApplyPageClient />;
}

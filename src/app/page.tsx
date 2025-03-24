import { redirect } from 'next/navigation';
import { defaultLocale } from '@/i18n/settings';

export default function Home() {
  console.log("Redirecting to default locale:", defaultLocale);
  redirect(`/${defaultLocale}`);
}

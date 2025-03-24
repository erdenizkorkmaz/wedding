import { setRequestLocale } from "next-intl/server";
import HomeClient from "@/components/HomeClient";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  // Since params is now a Promise in newer Next.js versions, we need to await it
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  console.log("Page component - Locale:", locale);

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <HomeClient locale={locale} />
  );
}

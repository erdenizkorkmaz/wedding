import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/settings";
import { setRequestLocale } from "next-intl/server";
import { getMessages } from "next-intl/server";
import ClientProviderWrapper from "@/components/ClientProviderWrapper";

export const metadata: Metadata = {
    title: "Our Wedding",
    description: "Join us for our special day",
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const resolvedParams = await params;
    const { locale } = resolvedParams;

    if (!locales.includes(locale)) {
        console.log("Locale not found:", locale);
        notFound();
    }

    // Enable static rendering
    setRequestLocale(locale);

    // Get the messages for the specific locale
    const messages = await getMessages({ locale });

    console.log("Loaded messages for locale:", locale);

    return (
        <ClientProviderWrapper locale={locale} messages={messages}>
            {children}
        </ClientProviderWrapper>
    );
} 
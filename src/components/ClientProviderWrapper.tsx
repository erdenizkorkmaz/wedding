"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode, useEffect } from "react";

interface ClientProviderWrapperProps {
    locale: string;
    messages: Record<string, unknown>;
    children: ReactNode;
}

export default function ClientProviderWrapper({
    locale,
    messages,
    children
}: ClientProviderWrapperProps) {
    // Debug logging to verify messages and locale
    useEffect(() => {
        if (messages.home) {
            console.log("Home messages:", messages.home);
        }
    }, [locale, messages]);

    return (
        <NextIntlClientProvider
            locale={locale}
            messages={messages}
            timeZone="UTC"
            now={new Date()}
            // Use a unique key to force re-render when locale changes
            key={locale}
        >
            {children}
        </NextIntlClientProvider>
    );
} 
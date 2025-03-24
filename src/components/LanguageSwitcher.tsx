"use client";

import { usePathname } from 'next/navigation';
import { locales } from '@/i18n/settings';
import { useCallback } from 'react';

export default function LanguageSwitcher() {
    const pathname = usePathname();

    // Get the current locale from the pathname
    const currentLocale = pathname.split('/')[1];

    // Function to get the new pathname for a given locale
    const getNewPathname = (locale: string) => {
        // If the current pathname is just the locale (e.g., '/en'), 
        // then the new pathname should be just the new locale
        if (pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`) {
            return `/${locale}`;
        }

        // Otherwise, replace the current locale with the new one
        return pathname.replace(`/${currentLocale}`, `/${locale}`);
    };

    // Handle locale change with optional reload
    const handleLocaleChange = useCallback((locale: string) => {
        console.log("Switching to locale:", locale);

        if (locale === currentLocale) return;

        const newPath = getNewPathname(locale);
        // Navigate and force a refresh
        window.location.href = newPath;
    }, [currentLocale, pathname]);

    return (
        <div className="flex items-center space-x-1 lg:space-x-3">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`text-xl font-medium p-0 rounded transition-colors ${currentLocale === locale
                        ? 'text-[var(--foreground)]'
                        : 'text-[var(--foreground)]/50 hover:text-foreground'
                        }`}
                >
                    {locale.toUpperCase()}
                </button>
            ))}
        </div>
    );
} 
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ko', 'tr'];
export const defaultLocale = 'ko';

// This is the configuration needed for next-intl middleware
export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is never undefined
  const resolvedLocale = locale || defaultLocale;
  
  // Log which locale we're loading messages for
  console.log("index.ts - Loading messages for locale:", resolvedLocale);
  
  try {
    // Load messages for the current locale
    const messages = (await import(`./locales/${resolvedLocale}.json`)).default;
    console.log("index.ts - Loaded message keys:", Object.keys(messages));
    return {
      locale: resolvedLocale,
      messages
    };
  } catch (error) {
    console.error(`Failed to load messages for locale ${resolvedLocale}:`, error);
    // Fallback to default locale
    console.log("index.ts - Falling back to default locale:", defaultLocale);
    return {
      locale: defaultLocale,
      messages: (await import(`./locales/${defaultLocale}.json`)).default
    };
  }
}); 
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale} from './i18n/settings';

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
  
  // Detect the preferred locale from the browser
  localeDetection: false,
  
  // Always include the locale prefix in URLs
  localePrefix: 'always'
});

export const config = {
  // Match all pathnames except for
  // - /_next (Next.js internals)
  // - /api (API routes)
  // - /public (public files)
  // - .*\\..*\\.\\w+ (static files)
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 
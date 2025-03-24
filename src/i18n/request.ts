import {getRequestConfig} from 'next-intl/server';
import {defaultLocale} from './settings';

export default getRequestConfig(async ({locale}) => {
  // Use the requested locale, fallback to default if undefined
  const resolvedLocale = locale || defaultLocale;
  
  return {
    locale: resolvedLocale,
    messages: (await import(`./locales/${resolvedLocale}.json`)).default
  };
}); 
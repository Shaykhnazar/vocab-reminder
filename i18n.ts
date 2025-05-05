// i18n.ts
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config/i18n';

export default getRequestConfig(async ({ locale }) => {
    // Check if locale is undefined and use defaultLocale instead
    const activeLocale = locale || defaultLocale;

    // Validate that the locale is supported
    if (!locales.includes(activeLocale as any)) {
        console.warn(`Unsupported locale requested: ${activeLocale}, falling back to ${defaultLocale}`);
        // Use default locale if the requested one isn't supported
        return {
            locale: defaultLocale, // Explicitly return the locale
            messages: (await import(`./messages/${defaultLocale}.json`)).default
        };
    }

    return {
        locale: activeLocale, // Explicitly return the locale
        messages: (await import(`./messages/${activeLocale}.json`)).default
    };
});
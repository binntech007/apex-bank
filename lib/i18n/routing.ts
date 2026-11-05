import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';


export const routing = defineRouting({
  // Supported languages
  locales: ['en', 'es', 'fr', 'de', 'fil', 'th', 'it'],

  // Default language if none matches 🌐
  defaultLocale: 'en'
});

// Navigation helpers 🧭
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
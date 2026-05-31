/**
 * @module i18n/routing
 * @description Configuration de routage next-intl (locales supportées et locale par défaut).
 */

import { defineRouting } from 'next-intl/routing';

/** Configuration de routage internationalisé (locales fr/en, défaut fr). */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr'
});

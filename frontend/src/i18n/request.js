/**
 * @module i18n/request
 * @description Configuration de requête next-intl : résout la locale demandée
 * (avec repli sur le français) et charge les messages de traduction associés.
 */

import { getRequestConfig } from 'next-intl/server';

/** Locales supportées par l'application. */
const locales = ['fr', 'en'];
/** Locale par défaut (repli). */
const defaultLocale = 'fr';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = locales.includes(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../app/messages/${locale}.json`)).default
  };
});
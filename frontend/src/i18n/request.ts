import { getRequestConfig } from "next-intl/server";

import { type Locale, routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as Locale)
    ? (requested as Locale)
    : routing.defaultLocale;

  const [messages, passwordResetMessages] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/password-reset/${locale}.json`),
  ]);

  return {
    locale,
    messages: {
      ...messages.default,
      passwordReset: passwordResetMessages.default,
    },
  };
});

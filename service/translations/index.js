import en from "./en.js";

const translations = {
  en,
};

/**
 *
 * @param {string} key the key of the translation
 * @param {string} language the alpha2 code of the language
 * @returns {string} the translated string
 */
export function t(key, language = "en") {
  // Make sure the language exists and if not return the default language
  if (!Object.keys(translations).includes(language)) {
    return translations["en"][key];
  }
  return translations[language][key];
}

/**
 * @param {string} key the key of the translation
 * @param {string} language the alpha2 code of the language
 * @param {object} values the values to be used in the translation string
 * @returns {string} the translated string
 * @example text : "Payment for consultation {consultationId} of {amount}{currency}"
 * @example t2("paymentIntentDescription", "en", { consultationId: "123", amount: 100, currency: "€" }) => "Payment for consultation 123 of 100€"
 *
 *
 */
export function t2(key, language = "en", values = {}) {
  // Make sure the language exists and if not return the default language
  if (!Object.keys(translations).includes(language)) {
    return translations["en"][key];
  }

  // Get the translation string
  const translation = translations[language][key];

  // Replace placeholders inside the translation string with the received values
  const translationWithValues = translation.replace(
    /{([^}]+)}/g,
    (match, key) => {
      return values[key];
    }
  );

  return translationWithValues;
}

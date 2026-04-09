// Internationalization placeholder

export const LANGUAGES = ["en", "es", "fr", "zh", "ar"];

// Example translation map (expand as needed)
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {},
  es: { "Hello": "Hola" },
  fr: { "Hello": "Bonjour" },
  zh: { "Hello": "你好" },
  ar: { "Hello": "مرحبا" },
};

export async function t(key: string, lang: string = "en"): Promise<string> {
  if (lang === "en" || !TRANSLATIONS[lang]) return key;
  if (TRANSLATIONS[lang][key]) return TRANSLATIONS[lang][key];

  // Fallback: use Google Translate API (or similar)
  try {
    const res = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: key, target: lang })
      }
    );
    const data = await res.json();
    return data.data.translations[0].translatedText || key;
  } catch {
    return key;
  }
}

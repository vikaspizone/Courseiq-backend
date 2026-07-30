import { AsyncLocalStorage } from 'async_hooks';
import en from '../languages/en';
import hi from '../languages/hi';

export const localeStorage = new AsyncLocalStorage<string>();

const translations: Record<string, any> = {
  en,
  hi,
};

function getValue(translationsObj: any, keyPath: string): any {
  const parts = keyPath.split('.');
  let value = translationsObj;
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return null;
    }
  }
  return value;
}

function replacePlaceholders(val: any, params: Record<string, any>): string {
  if (val === null || typeof val !== 'string') return String(val);
  let result = val;
  for (const [k, v] of Object.entries(params)) {
    const placeholder = k.startsWith(':') ? k : `:${k}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(v));
  }
  return result;
}

export function trans(keyDotNotation: string, params: Record<string, any> = {}): any {
  const locale = localeStorage.getStore() || 'en';

  let value = getValue(translations[locale], keyDotNotation);

  // Fallback to 'en' if not found in current locale (and current locale is not 'en')
  if (value === null && locale !== 'en') {
    value = getValue(translations['en'], keyDotNotation);
  }

  if (value !== null) {
    return typeof value === 'object' ? value : replacePlaceholders(value, params);
  }

  return keyDotNotation;
}

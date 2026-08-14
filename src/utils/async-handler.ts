/**
 * Utility to handle promises using try-catch wrapper, returning [data, error] tuple.
 */
export async function handlePromise<T>(promise: Promise<T>): Promise<[T | null, any]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}

/**
 * Utility to clean undefined values from an object.
 */
export function cleanUndefined<T extends object>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

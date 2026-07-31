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

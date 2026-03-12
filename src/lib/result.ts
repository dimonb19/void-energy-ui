export function ok<T>(data: T): VoidResult<T, never> {
  return { ok: true, data };
}

export function err<E>(error: E): VoidResult<never, E> {
  return { ok: false, error };
}

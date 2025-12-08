/**
 * Error constructor type for custom error classes
 */
type ErrorConstructor = new (message: string, options?: ErrorOptions) => Error;

/**
 * Wraps a class instance with error handling that catches errors from any method
 * and re-throws them as a custom error type with enhanced context.
 *
 * @param instance - The class instance to wrap
 * @param CustomError - Optional custom error class (defaults to Error)
 * @returns Proxied instance with error handling
 *
 * @example
 * ```typescript
 * // With default Error
 * const repo = withCustomError(new BaseRepository(db, companies));
 *
 * // With custom error class
 * class RepositoryError extends Error {
 *   name = "RepositoryError";
 * }
 * const repo = withCustomError(new BaseRepository(db, companies), RepositoryError);
 *
 * // Thrown error format:
 * // RepositoryError: @ BaseRepository.findById: Expected 0 or 1 record...
 * //   cause: [original Error]
 * //   stack: [original stack]
 * ```
 */
export function withCustomError<T extends object>(
  instance: T,
  CustomError: ErrorConstructor = Error
): T {
  return new Proxy(instance, {
    get(target, prop) {
      const value = target[prop as keyof T];
      if (typeof value === "function") {
        return (...args: unknown[]) => {
          try {
            return value.apply(target, args);
          } catch (error) {
            const className = target.constructor.name;
            const methodName = String(prop);
            const originalMessage = error instanceof Error ? error.message : String(error);
            const originalStack = error instanceof Error ? error.stack : undefined;

            const customError = new CustomError(
              `@ ${className}.${methodName}: ${originalMessage}`,
              { cause: error }
            );

            if (originalStack) {
              customError.stack = originalStack;
            }

            throw customError;
          }
        };
      }
      return value;
    },
  });
}

/**
 * Error constructor type for custom error classes
 */
type ErrorConstructor = new (message: string, options?: ErrorOptions) => Error;

/**
 * Options for withCustomError proxy
 */
export interface WithCustomErrorOptions {
  /**
   * If provided and is a valid Error instance, the proxy will throw this error
   * with the enhanced message instead of creating a new error from ErrorConstructor.
   * Useful for passing through specific error types from callers.
   */
  passthrough?: Error;
}

/**
 * Wraps a class instance with error handling that catches errors from any method
 * and re-throws them as a custom error type with enhanced context.
 *
 * @param instance - The class instance to wrap
 * @param CustomError - Optional custom error class (defaults to Error)
 * @param options - Optional configuration options
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
 * // With passthrough error
 * class ApiError extends Error {
 *   name = "ApiError";
 * }
 * const apiError = new ApiError("original");
 * const repo = withCustomError(new BaseRepository(db, companies), RepositoryError, {
 *   passthrough: apiError,
 * });
 * // Thrown error will be the apiError instance with enhanced message
 *
 * // Thrown error format:
 * // RepositoryError: @ BaseRepository.findById: Expected 0 or 1 record...
 * //   cause: [original Error]
 * //   stack: [original stack]
 * ```
 */
export function withCustomError<T extends object>(
  instance: T,
  CustomError: ErrorConstructor = Error,
  options: WithCustomErrorOptions = {}
): T {
  const { passthrough } = options;

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

            const enhancedMessage = `@ ${className}.${methodName}: ${originalMessage}`;

            // If passthrough is a valid Error, use it with enhanced message
            if (passthrough instanceof Error) {
              passthrough.message = enhancedMessage;
              if (originalStack) {
                passthrough.stack = originalStack;
              }
              throw passthrough;
            }

            // Otherwise, create new error from CustomError constructor
            const customError = new CustomError(enhancedMessage, { cause: error });

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

export function withCustomError<T extends object>(
  instance: T,
  customError?: Error
): T {
  return new Proxy(instance, {
    get(target, prop) {
      const value = target[prop as keyof T];
      if (typeof value === "function") {
        return (...args: unknown[]) => {
          try {
            return value.apply(target, args);
          } catch (error: unknown) {
            const className =
              target.constructor && target.constructor.name
                ? target.constructor.name
                : "UnknownClass";
            const methodName = String(prop);
            const originalMessage =
              error instanceof Error ? error.message : "Unknown error";
            const newMessage = `${className}.${methodName}: ${originalMessage}`;
            if (customError instanceof Error) {
              customError.message = newMessage;
              // Optionally attach cause if supported
              if ("cause" in customError) {
                (customError as Error & { cause?: unknown }).cause = error;
              }
              throw customError;
            } else {
              throw new Error(newMessage, { cause: error });
            }
          }
        };
      }
      return value;
    },
  });
}

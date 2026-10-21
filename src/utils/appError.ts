export interface HttpError extends Error {
  statusCode: number;
  isOperational: true; // Set only by createError: marks an expected error whose message is safe to send to the client
}

export const createError = (statusCode: number, message: string): HttpError =>
  Object.assign(new Error(message), {
    statusCode,
    isOperational: true as const,
  });

export const isHttpError = (err: unknown): err is HttpError =>
  err instanceof Error && (err as HttpError).isOperational === true;

import { z } from "zod";

export type ActionResponse<T = void> = SuccessResponse<T> | ErrorResponse;

type ErrorResponse = {
  success: false;
  error: string;
  status: number;
  code?: string;
};

type SuccessResponse<T> = {
  success: true;
  data: T;
};

export class HttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }

  static from(err: unknown): HttpError {
    if (err instanceof HttpError) return err;

    if (err instanceof z.ZodError) {
      const message = err.issues.map((e) => e.message).join(", ");
      return new BadRequestError(message);
    }

    return new InternalServerError();
  }

  toActionResponse(): ErrorResponse {
    return {
      success: false,
      error: this.message,
      status: this.status,
      code: this.code,
    };
  }
}

/* ---------- 4xx Client Errors ---------- */
export class BadRequestError extends HttpError {
  constructor(message = "Bad request", code?: string) {
    super(400, message, code);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Unauthorized", code?: string) {
    super(401, message, code);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "Forbidden", code?: string) {
    super(403, message, code);
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Not found", code?: string) {
    super(404, message, code);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "Conflict", code?: string) {
    super(409, message, code);
  }
}

/* ---------- 5xx Server Errors ---------- */
export class InternalServerError extends HttpError {
  constructor(message = "Internal server error", code?: string) {
    super(500, message, code);
  }
}

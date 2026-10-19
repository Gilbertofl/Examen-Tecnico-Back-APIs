export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(409, message);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string) {
    super(413, message);
  }
}

export class UnsupportedMediaTypeError extends HttpError {
  constructor(message: string) {
    super(415, message);
  }
}

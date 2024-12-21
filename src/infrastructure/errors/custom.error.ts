export class CustomError extends Error {
  constructor(
    public readonly statuscode: number,
    public readonly message: string
  ) {
    super(message);
  }

  static badRequest(message: string) {
    return new CustomError(400, message);
  }
  static internalServer(message: string = "Internal Server Error") {
    return new CustomError(500, message);
  }

  static serverUnavailable(message: string = "Service Unavailable") {
    return new CustomError(503, message);
  }
}

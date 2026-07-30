import { HttpException } from '@nestjs/common';

export class ApiError extends HttpException {
  statusCode: number;
  success: boolean;
  errors: any[];
  data: any;

  constructor(
    statusCode: number,
    message: string = 'Something went wrong',
    errors: any[] = [],
    stack = '',
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        errors,
        data: null,
      },
      statusCode,
    );

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

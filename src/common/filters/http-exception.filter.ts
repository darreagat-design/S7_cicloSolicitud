import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

type HttpResponse = {
  status: (statusCode: number) => {
    json: (body: unknown) => void;
  };
};

type HttpRequest = {
  url: string;
};

type ErrorResponse = {
  code?: string;
  message?: unknown;
  details?: unknown;
  error?: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<HttpResponse>();
    const request = ctx.getRequest<HttpRequest>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const payload =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponse)
        : {
            message:
              exceptionResponse ??
              HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR],
          };

    const message =
      statusCode === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : payload.message;

    response.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: {
        statusCode,
        code: payload.code ?? this.getDefaultCode(statusCode),
        message,
        ...(payload.details ? { details: payload.details } : {}),
      },
    });
  }

  private getDefaultCode(statusCode: number) {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}

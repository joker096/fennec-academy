export enum ErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  FIREBASE_ERROR = 'FIREBASE_ERROR',
}

export class AppError extends Error {
  code: ErrorCode;
  originalError?: unknown;

  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, originalError?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'No internet connection. Please check your network.', originalError?: unknown) {
    super(message, ErrorCode.NETWORK_ERROR, originalError);
    this.name = 'NetworkError';
  }
}

export class ApiError extends AppError {
  status?: number;
  
  constructor(message: string, originalError?: unknown, status?: number) {
    super(message, ErrorCode.API_ERROR, originalError);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class ValidationError extends AppError {
  field?: string;

  constructor(message: string, field?: string) {
    super(message, ErrorCode.VALIDATION_ERROR);
    this.name = 'ValidationError';
    this.field = field;
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed. Please sign in again.') {
    super(message, ErrorCode.AUTH_ERROR);
    this.name = 'AuthError';
  }
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const getErrorMessage = (error: unknown): string => {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const handleAppError = (error: unknown, addNotification: (msg: string, type: 'error') => void) => {
  const message = getErrorMessage(error);
  addNotification(message, 'error');
  console.error('[AppError]', error);
};

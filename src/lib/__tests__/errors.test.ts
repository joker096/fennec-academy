/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';
import { ErrorCode, AppError, NetworkError, ApiError, ValidationError, AuthError, isAppError, getErrorMessage, handleAppError } from '../errors';

describe('ErrorCode', () => {
  it('has all error codes', () => {
    expect(ErrorCode.NETWORK_ERROR).toBe('NETWORK_ERROR');
    expect(ErrorCode.API_ERROR).toBe('API_ERROR');
    expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
    expect(ErrorCode.AUTH_ERROR).toBe('AUTH_ERROR');
    expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    expect(ErrorCode.FIREBASE_ERROR).toBe('FIREBASE_ERROR');
  });
});

describe('AppError', () => {
  it('creates with default code', () => {
    const err = new AppError('test error');
    expect(err.message).toBe('test error');
    expect(err.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(err.name).toBe('AppError');
    expect(err.originalError).toBeUndefined();
  });

  it('creates with custom code', () => {
    const err = new AppError('network error', ErrorCode.NETWORK_ERROR);
    expect(err.code).toBe(ErrorCode.NETWORK_ERROR);
  });

  it('stores original error', () => {
    const original = new Error('cause');
    const err = new AppError('wrapped', ErrorCode.API_ERROR, original);
    expect(err.originalError).toBe(original);
  });

  it('is an instance of Error', () => {
    const err = new AppError('test');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NetworkError', () => {
  it('creates with default message', () => {
    const err = new NetworkError();
    expect(err.message).toContain('No internet connection');
    expect(err.code).toBe(ErrorCode.NETWORK_ERROR);
    expect(err.name).toBe('NetworkError');
  });

  it('creates with custom message', () => {
    const err = new NetworkError('custom', new Error('e'));
    expect(err.message).toBe('custom');
    expect(err.originalError).toBeInstanceOf(Error);
  });
});

describe('ApiError', () => {
  it('creates without status', () => {
    const err = new ApiError('api error');
    expect(err.code).toBe(ErrorCode.API_ERROR);
    expect(err.name).toBe('ApiError');
    expect(err.status).toBeUndefined();
  });

  it('creates with status', () => {
    const err = new ApiError('not found', undefined, 404);
    expect(err.status).toBe(404);
  });

  it('stores original error', () => {
    const original = new Error('origin');
    const err = new ApiError('msg', original, 500);
    expect(err.originalError).toBe(original);
    expect(err.status).toBe(500);
  });
});

describe('ValidationError', () => {
  it('creates without field', () => {
    const err = new ValidationError('invalid');
    expect(err.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(err.field).toBeUndefined();
  });

  it('creates with field', () => {
    const err = new ValidationError('too long', 'email');
    expect(err.field).toBe('email');
  });
});

describe('AuthError', () => {
  it('creates with default message', () => {
    const err = new AuthError();
    expect(err.message).toContain('Authentication failed');
    expect(err.code).toBe(ErrorCode.AUTH_ERROR);
    expect(err.name).toBe('AuthError');
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError('test'))).toBe(true);
    expect(isAppError(new NetworkError())).toBe(true);
    expect(isAppError(new ApiError('test'))).toBe(true);
    expect(isAppError(new ValidationError('test'))).toBe(true);
    expect(isAppError(new AuthError())).toBe(true);
  });

  it('returns false for regular errors', () => {
    expect(isAppError(new Error('test'))).toBe(false);
    expect(isAppError('string error')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError(42)).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('extracts message from AppError', () => {
    expect(getErrorMessage(new AppError('app error'))).toBe('app error');
  });

  it('extracts message from regular Error', () => {
    expect(getErrorMessage(new Error('regular error'))).toBe('regular error');
  });

  it('converts non-Error to string', () => {
    expect(getErrorMessage('string error')).toBe('string error');
    expect(getErrorMessage(42)).toBe('42');
    expect(getErrorMessage(null)).toBe('null');
  });
});

describe('handleAppError', () => {
  it('calls addNotification with error message', () => {
    const addNotification = vi.fn();
    const err = new AppError('something broke');
    handleAppError(err, addNotification);
    expect(addNotification).toHaveBeenCalledWith('something broke', 'error');
  });

  it('handles regular Error', () => {
    const addNotification = vi.fn();
    handleAppError(new Error('oops'), addNotification);
    expect(addNotification).toHaveBeenCalledWith('oops', 'error');
  });

  it('handles string errors', () => {
    const addNotification = vi.fn();
    handleAppError('fail', addNotification);
    expect(addNotification).toHaveBeenCalledWith('fail', 'error');
  });
});

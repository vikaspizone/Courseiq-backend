import { trans, localeStorage } from './trans';

describe('trans helper', () => {
  it('should return default English translations', () => {
    expect(trans('auth.email')).toBe('Please enter a valid email address.');
    expect(trans('auth.email_required')).toBe('Email is required.');
  });

  it('should resolve translations within a localeStorage context', () => {
    localeStorage.run('hi', () => {
      expect(trans('auth.email')).toBe('कृपया एक मान्य ईमेल पता दर्ज करें।');
      expect(trans('auth.email_required')).toBe('ईमेल आवश्यक है।');
    });
  });

  it('should fallback to English if translation is missing in selected locale', () => {
    localeStorage.run('hi', () => {
      // Let's test a key that doesn't exist anywhere
      expect(trans('auth.non_existent_key')).toBe('auth.non_existent_key');
    });
  });

  it('should format string parameters correctly', () => {
    localeStorage.run('en', () => {
      // Test replacement parameter
      expect(trans('auth.password_min', { min: 6 })).toBe('Password must be at least 6 characters long.');
    });
  });

  it('should translate class-validator DTO messages dynamically', async () => {
    const { validate } = require('class-validator');
    const { LoginDto } = require('../auth/dto/login.dto');
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = '';

    // Validate in English context
    let errors = await localeStorage.run('en', () => validate(dto));
    let emailErr = errors.find((e: any) => e.property === 'email');
    expect(emailErr?.constraints?.isEmail).toBe('Please enter a valid email address.');

    // Validate in Hindi context
    errors = await localeStorage.run('hi', () => validate(dto));
    emailErr = errors.find((e: any) => e.property === 'email');
    expect(emailErr?.constraints?.isEmail).toBe('कृपया एक मान्य ईमेल पता दर्ज करें।');
  });
});

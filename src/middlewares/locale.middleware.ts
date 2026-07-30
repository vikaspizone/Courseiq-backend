import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { localeStorage } from '../utils/trans';

@Injectable()
export class LocaleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Get lang from query params (e.g. ?lang=hi) or header (Accept-Language)
    let lang = (req.query.lang as string) || (req.headers['accept-language'] as string) || 'en';

    if (lang) {
      lang = lang.split(',')[0].split('-')[0].trim().toLowerCase();
    }

    // Default to 'en' if it's not a supported language (en, hi)
    if (lang !== 'hi' && lang !== 'en') {
      lang = 'en';
    }

    // Run request lifecycle with the resolved locale
    localeStorage.run(lang, () => {
      next();
    });
  }
}

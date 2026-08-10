import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { trans } from '../../utils/trans';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || user.role.name !== 'admin') {
      throw new ForbiddenException(trans('common.forbidden'));
    }

    return true;
  }
}

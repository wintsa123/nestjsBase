// skip-auth.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SkipAuth = () => SetMetadata('skipAuth', true);
import { ApiOperationOptions, ApiOperation as NestApiOperation } from '@nestjs/swagger';

export const CustomOperationName =
  (op?: ApiOperationOptions): MethodDecorator =>
  (target, prop, descriptor) => {
    if (!op) op = {};
    NestApiOperation({
      ...op,
      'x-operation-name': prop.toString(),
    } as any)(target, prop, descriptor);
  };

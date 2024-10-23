import { ValidateIf } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function AnyOf(properties: string[]) {
  return function (target: any) {
    for (const property of properties) {
      const otherProps = properties.filter((prop) => prop !== property);
      const decorators = [
        ValidateIf((obj: Record<string, unknown>) => {
          const isCurrentPropDefined = obj[property] !== undefined;
          const areOtherPropsUndefined = otherProps.reduce(
            (acc, prop) => acc && obj[prop] === undefined,
            true,
          );

          return isCurrentPropDefined || areOtherPropsUndefined;
        }),
      ];

      for (const decorator of decorators) {
        applyDecorators(decorator)(target.prototype, property);
      }
    }
  };
}

import { registerDecorator, ValidationOptions } from 'class-validator';
import { Types as MongooseTypes } from 'mongoose';

export function IsObjectId(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isObjectId',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return MongooseTypes.ObjectId.isValid(value);
        },
      },
    });
  };
}

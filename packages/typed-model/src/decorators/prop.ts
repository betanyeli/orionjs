import {Constructor, SchemaMetaFieldType, SchemaNode} from '@orion-js/schema'
import {MetadataStorage} from '../storage/metadataStorage'
import 'reflect-metadata'
import {CannotDetermineTypeError, CannotUseArrayError} from '../errors'
import {isClass} from '../utils/isClass'
import {Model} from '@orion-js/models'

export interface SchemaNodeForClasses extends Omit<SchemaNode, 'type'> {
  type: SchemaMetaFieldType | Constructor<any> | Model
}

export type PropOptions = Partial<SchemaNodeForClasses>

export function Prop(options: PropOptions = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const schemaName = target.constructor?.name

    if (!options.type) {
      const type = Reflect.getMetadata('design:type', target, propertyKey)

      if (isClass(type) || type === Object) {
        throw new CannotDetermineTypeError(schemaName, propertyKey as string)
      }

      if (type === Array) {
        throw new CannotUseArrayError(schemaName, propertyKey as string)
      }

      if (type) {
        options.type = type
      } else {
        throw new CannotDetermineTypeError(schemaName, propertyKey as string)
      }
    }

    MetadataStorage.addPropMetadata({schemaName, propertyKey, options})
  }
}

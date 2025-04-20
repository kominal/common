import { applyDecorators, HttpException } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FilterQuery, Model, PopulateOptions } from 'mongoose';
import { v4 } from 'uuid';
import { BaseEntity } from '../models/entity.model';

export class EntitiesPathParams {
  @ApiProperty() @IsString() public tenantId: string;
}

export class OptionalEntityPathParams {
  @ApiProperty() @IsString() public tenantId: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public uuid?: string;
}

export class EntityPathParams {
  @ApiProperty() @IsString() public tenantId: string;
  @ApiProperty() @IsString() public uuid: string;
}

export class GlobalEntityPathParams {
  @ApiProperty() @IsString() public uuid: string;
}

export class ListParams {
  @ApiProperty({ required: false }) @IsOptional() @IsString() public active?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public direction?: string;
  @ApiProperty({ required: false }) @IsOptional() public pageIndex?: number;
  @ApiProperty({ required: false }) @IsOptional() public pageSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public filter?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public select?: string;
}

export class ListResponse<T> {
  @ApiProperty() public items: T[];
  @ApiProperty() @IsNumber() public count: number;
}

export const OpenApiPaginationResponse = (
  model: any,
): (<TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void) =>
  applyDecorators(
    ApiOkResponse({ schema: { properties: { items: { type: 'array', items: { $ref: getSchemaPath(model) } }, count: { type: 'number' } }, required: ['items', 'count'] } }),
    ApiExtraModels(model),
  );

export class ChangeContext {
  email: string;
}

export function created<Entity extends BaseEntity>(changeContext: ChangeContext, entity: Partial<Entity>): Partial<Entity> {
  return {
    ...entity,
    uuid: v4(),
    createdAt: new Date(),
    createdBy: changeContext.email,
    updatedAt: new Date(),
    updatedBy: changeContext.email,
  };
}

export function changed<Entity extends BaseEntity>(changeContext: ChangeContext, entity: Partial<Entity>): Partial<Entity> {
  return {
    ...entity,
    updatedAt: new Date(),
    updatedBy: changeContext.email,
  };
}

export class EntityService<
  Entity extends BaseEntity,
  EntitiesPath extends FilterQuery<Entity> = EntitiesPathParams,
  EntityPath extends FilterQuery<Entity> = EntityPathParams,
  OptionalEntityPath extends FilterQuery<Entity> = OptionalEntityPathParams,
  PopulatedEntity = Entity,
> {
  public constructor(
    private model: Model<Entity>,
    protected options: {
      listSelect?: string;
      populate?: PopulateOptions | PopulateOptions[];
      defaultSortKey?: string;
      defaultSortDirection?: string;
      technicalKeys: (keyof Entity)[];
    },
  ) {}

  public async create(changeContext: ChangeContext, pathParams: EntitiesPath, createRequest: Partial<Entity>): Promise<Entity> {
    for (const key of this.options.technicalKeys) {
      delete createRequest[key];
    }

    return this.model.create(created(changeContext, { ...createRequest, ...pathParams }));
  }

  public async list(pathParams: EntitiesPath, { active, direction, pageIndex, pageSize, filter, select }: ListParams): Promise<ListResponse<PopulatedEntity>> {
    const evaluatedFilter = { ...(filter ? JSON.parse(filter) : {}), ...pathParams };
    const items = await this.model
      .find(evaluatedFilter)
      .select(this.options.listSelect || select || '')
      .sort({ [active || this.options.defaultSortKey || '_id']: (direction || this.options.defaultSortDirection || 'asc') as any })
      .skip((pageIndex || 0) * (pageSize || 10))
      .limit(pageSize || 10)
      .populate(this.options.populate || [])
      .lean<PopulatedEntity[]>();
    const count = await this.model.countDocuments(evaluatedFilter);
    return { items, count };
  }

  public async read(params: EntityPath): Promise<Entity> {
    return this.model.findOne(params).orFail(new HttpException('exception.notFound', 404));
  }

  public async update(changeContext: ChangeContext, entityPath: EntityPath, createRequest: Partial<Entity>): Promise<void> {
    for (const key of this.options.technicalKeys) {
      delete createRequest[key];
    }

    await this.model.updateOne(entityPath, changed(changeContext, { ...createRequest, tenantId: entityPath.tenantId }));
  }

  public async upsert(changeContext: ChangeContext, entityPath: OptionalEntityPath, createRequest: Partial<Entity>): Promise<Entity | void> {
    if (entityPath.uuid) {
      return this.update(changeContext, entityPath as unknown as EntityPath, createRequest);
    }
    return this.create(changeContext, entityPath as unknown as EntitiesPath, createRequest);
  }

  public async delete(params: EntityPath): Promise<any> {
    if (await this.inUse(params)) {
      throw new HttpException('exception.inUse', 404);
    }
    return this.model.deleteOne(params);
  }

  public async inUse(params: EntityPath): Promise<boolean> {
    return false;
  }
}

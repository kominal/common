import { applyDecorators, HttpException } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApplyBasicCreateCasting, DeepPartial, Model, PopulateOptions, QueryFilter, Require_id, UpdateQuery } from 'mongoose';
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

export class OptionalGlobalEntityPathParams {
  @ApiProperty({ required: false }) @IsOptional() @IsString() public uuid?: string;
}

export class ListParams {
  @ApiProperty({ required: false }) @IsOptional() @IsString() public active?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public direction?: 'asc' | 'desc';
  @ApiProperty({ required: false }) @IsOptional() public pageIndex?: number;
  @ApiProperty({ required: false }) @IsOptional() public pageSize?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public filter?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() public select?: string;
}

export class ListResponse<T> {
  @ApiProperty() public items: T[];
  @ApiProperty() @IsNumber() public count: number;
}

export const OpenApiPaginationResponse = (model: Function): ((target: object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => void) =>
  applyDecorators(
    ApiOkResponse({ schema: { properties: { items: { type: 'array', items: { $ref: getSchemaPath(model) } }, count: { type: 'number' } }, required: ['items', 'count'] } }),
    ApiExtraModels(model),
  );

export class ChangeContext {
  email: string;
}

export function created<Entity extends BaseEntity>(changeContext: ChangeContext, entity: Partial<Entity>): DeepPartial<ApplyBasicCreateCasting<Require_id<Entity>>> {
  return {
    ...entity,
    uuid: v4(),
    createdAt: new Date(),
    createdBy: changeContext.email,
    changedAt: new Date(),
    changedBy: changeContext.email,
  } as DeepPartial<ApplyBasicCreateCasting<Require_id<Entity>>>;
}

export function changed<Entity extends BaseEntity>(changeContext: ChangeContext, entity: Partial<Entity>): UpdateQuery<Entity> {
  return {
    ...entity,
    changedAt: new Date(),
    changedBy: changeContext.email,
  };
}

export async function list<Entity extends BaseEntity, EntitiesPath extends QueryFilter<Entity>, PopulatedEntity = Entity>(
  model: Model<Entity>,
  pathParams: EntitiesPath,
  { active, direction, pageIndex, pageSize, filter, select }: ListParams,
  populate?: PopulateOptions | PopulateOptions[],
): Promise<ListResponse<PopulatedEntity>> {
  let evaluatedFilter: QueryFilter<Entity> = {};

  if (filter) {
    evaluatedFilter = JSON.parse(filter) as QueryFilter<Entity>;
  }

  evaluatedFilter = { ...evaluatedFilter, ...pathParams };

  let query = model
    .find(evaluatedFilter)
    .select(select || '')
    .sort({ [active || '_id']: direction || 'asc' })
    .populate(populate || []);

  if (pageIndex && pageSize) {
    query = query.skip(pageIndex * pageSize);
  }
  if (pageSize) {
    query = query.limit(pageSize);
  }

  const [items, count] = await Promise.all([query.lean<PopulatedEntity[]>(), model.countDocuments(evaluatedFilter)]);

  return { items, count };
}

export class EntityService<
  Entity extends BaseEntity,
  EntitiesPath extends QueryFilter<Entity> = EntitiesPathParams,
  EntityPath extends QueryFilter<Entity> = EntityPathParams,
  OptionalEntityPath extends QueryFilter<Entity> = OptionalEntityPathParams,
  PopulatedEntity = Entity,
> {
  public constructor(
    private model: Model<Entity>,
    protected options: {
      listSelect?: string;
      populate?: PopulateOptions | PopulateOptions[];
      defaultSortKey?: string;
      defaultSortDirection?: 'asc' | 'desc';
      technicalKeys: (keyof Entity)[];
    },
  ) {}

  public async create(changeContext: ChangeContext, pathParams: EntitiesPath, createRequest: Partial<Entity>): Promise<Entity> {
    for (const key of this.options.technicalKeys) {
      delete createRequest[key];
    }

    return this.model.create(created<Entity>(changeContext, { ...createRequest, ...pathParams }));
  }

  public async list(pathParams: EntitiesPath, { active, direction, pageIndex, pageSize, filter, select }: ListParams): Promise<ListResponse<PopulatedEntity>> {
    return list<Entity, QueryFilter<Entity>, PopulatedEntity>(
      this.model,
      pathParams,
      {
        active: active || this.options.defaultSortKey,
        direction: direction || this.options.defaultSortDirection,
        pageIndex,
        pageSize,
        filter,
        select: this.options.listSelect || select,
      },
      this.options.populate,
    );
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

  public async delete(changeContext: ChangeContext, params: EntityPath): Promise<any> {
    if (await this.inUse(params)) {
      throw new HttpException('exception.inUse', 404);
    }
    return this.model.deleteOne(params);
  }

  public inUse(params: EntityPath): Promise<boolean> | boolean {
    return false;
  }
}

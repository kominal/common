import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Model } from 'mongoose';
import { BaseEntity, TECHNICAL_KEYS_BASE_ENTITY } from '../models/entity.model';
import { StoredFile } from '../models/stored-file.model';

@Schema()
export class Tenant extends BaseEntity {
  @Prop() @ApiProperty() @IsString() public name: string;
  @Prop() @ApiProperty() @IsOptional() @ValidateNested() @Type(() => StoredFile)  public logo?: StoredFile;
}

export type TenantModel = Model<Tenant>;

export const TenantSchema = SchemaFactory.createForClass(Tenant).index({ uuid: 1 }, { unique: true });

export class TenantCreateRequest extends OmitType(Tenant, [...TECHNICAL_KEYS_BASE_ENTITY, 'logo']) {}

export class TenantUpdateRequest extends OmitType(Tenant, TECHNICAL_KEYS_BASE_ENTITY) {}

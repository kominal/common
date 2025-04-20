import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export abstract class BaseEntity {
  @ApiProperty() public _id: string;
  @Prop() @ApiProperty() @IsString() public uuid: string;
  @Prop() @ApiProperty() @IsDate() @Transform(({ value }) => (value === '' ? undefined : new Date(value))) public createdAt: Date;
  @Prop() @ApiProperty() @IsString() public createdBy: string;
  @Prop() @ApiProperty() @IsDate() @Transform(({ value }) => (value === '' ? undefined : new Date(value))) public updatedAt: Date;
  @Prop() @ApiProperty() @IsString() public updatedBy: string;
  @Prop() @ApiProperty() @IsNumber() public version: number;
}

export const TECHNICAL_KEYS_BASE_ENTITY: (keyof BaseEntity)[] = ['_id', 'uuid', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'version'];

export abstract class TenantEntity extends BaseEntity {
  @Prop() @ApiProperty() @IsString() public tenantId: string;
}

export const TECHNICAL_KEYS: (keyof TenantEntity)[] = [...TECHNICAL_KEYS_BASE_ENTITY, 'tenantId'];

import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export const DateTransform = Transform(({ value }) => (value ? new Date(value) : undefined));

export abstract class BaseEntity {
  @ApiProperty() public _id: string;
  @Prop() @ApiProperty() @IsString() public uuid: string;
  @Prop() @ApiProperty() @IsDate() @DateTransform public createdAt: Date;
  @Prop() @ApiProperty() @IsString() public createdBy: string;
  @Prop() @ApiProperty() @IsDate() @DateTransform @IsOptional() public changedAt: Date;
  @Prop() @ApiProperty() @IsString() @IsOptional() public changedBy: string;
  @Prop() @ApiProperty() @IsDate() @DateTransform @IsOptional() public deletedAt?: Date;
  @Prop() @ApiProperty() @IsString() @IsOptional() public deletedBy?: string;
  @Prop() @ApiProperty() @IsNumber() public version: number;
}

export const TECHNICAL_KEYS_BASE_ENTITY: (keyof BaseEntity)[] = ['_id', 'uuid', 'createdAt', 'createdBy', 'changedAt', 'changedBy', 'version'];

export abstract class TenantEntity extends BaseEntity {
  @Prop() @ApiProperty() @IsString() public tenantId: string;
}

export const TECHNICAL_KEYS: (keyof TenantEntity)[] = [...TECHNICAL_KEYS_BASE_ENTITY, 'tenantId'];

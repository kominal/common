import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Model } from 'mongoose';
import { TenantEntity } from '../models/entity.model';
import { User } from './user.entity';

export enum MembershipStatus {
  INVITED = 'INVITED',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}
export const MembershipStatusDecorator = ApiProperty({ enum: MembershipStatus, enumName: 'MembershipStatus' });

@Schema()
export class Membership extends TenantEntity {
  @Prop() @ApiProperty() @IsString() public userId: string;
  @Prop() @ApiProperty() @IsString() public email: string;
  @Prop() @ApiProperty() @IsArray() @IsString({ each: true }) public permissions: string[];
  @Prop() @ApiProperty() @IsArray() @IsString({ each: true }) public roles: string[];
  @Prop() @MembershipStatusDecorator @IsEnum(MembershipStatus) public status: MembershipStatus;
}

export type MembershipModel = Model<Membership>;

export const MembershipSchema = SchemaFactory.createForClass(Membership).index({ tenantId: 1 }).index({ tenantId: 1, uuid: 1 }, { unique: true });

export class MembershipCreateRequest {
  @IsEmail() public email: string;
  @IsArray() @IsString({ each: true }) @IsOptional() public permissions: string[];
}

export class MembershipPopulated extends PartialType(Membership) {
  public user: User;
}

export class MembershipUpdateRequest {
  @IsArray() @IsString({ each: true }) @IsOptional() public permissions: string[];
}

export class MembershipPathParams {
  public userId: string;
}

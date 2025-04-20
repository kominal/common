import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Model } from 'mongoose';
import { TECHNICAL_KEYS, TenantEntity } from '../models/entity.model';

@Schema()
export class AccessToken extends TenantEntity {
  @Prop() @ApiProperty() @IsString() public userId: string;
  @Prop() @ApiProperty() @IsString() public name: string;
  @Prop() @ApiProperty() @IsString() public token: string;
}

export type AccessTokenModel = Model<AccessToken>;

export const AccessTokenSchema = SchemaFactory.createForClass(AccessToken).index({ tenantId: 1 }).index({ tenantId: 1, uuid: 1 }, { unique: true });

export class AccessTokenRequest extends OmitType(AccessToken, TECHNICAL_KEYS) {}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Model } from 'mongoose';
import { BaseEntity, TECHNICAL_KEYS_BASE_ENTITY } from '../models/entity.model';

@Schema()
export class User extends BaseEntity {
  @Prop() @ApiProperty() @IsString() public userId: string;
  @Prop() @ApiProperty() @IsString() public lastActivity: Date;
}

export type UserModel = Model<User>;

export const UserSchema = SchemaFactory.createForClass(User).index({ uuid: 1 }, { unique: true });

export class UserUpdateRequest extends OmitType(User, TECHNICAL_KEYS_BASE_ENTITY) {}

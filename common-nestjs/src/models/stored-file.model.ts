import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class StoredFile {
 @IsString() @ApiProperty()	public name: string;
 @IsString() @ApiProperty()	public location: string;
 @IsString() @ApiProperty()	public key: string;
}

export class StoredFileSignedUrl {
  @IsString() @ApiProperty() public url: string;
}

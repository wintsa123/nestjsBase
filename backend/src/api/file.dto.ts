import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class FileUploadDto {
    // file?: Array<any>;
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any;
  }
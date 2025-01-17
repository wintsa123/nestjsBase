import { ApiBody, ApiParam, ApiProperty, } from "@nestjs/swagger";
import { IsString } from "class-validator";
export class CreateFileManageDto   {

    // 这里
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any
}


import { PartialType, ApiProperty } from '@nestjs/swagger';

export class base64 extends PartialType(class {}) {
    @ApiProperty({ required: true })
    base64!: string;
 
}


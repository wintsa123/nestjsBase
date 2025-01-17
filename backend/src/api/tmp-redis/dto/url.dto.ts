import { PartialType, ApiProperty } from '@nestjs/swagger';

export class url extends PartialType(class {}) {

  @ApiProperty({ required: true })
  url!:string
  @ApiProperty({ required: false })
  key!:string
}


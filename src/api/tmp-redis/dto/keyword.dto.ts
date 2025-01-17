import { PartialType, ApiProperty } from '@nestjs/swagger';

export class keyword extends PartialType(class {}) {
  @ApiProperty({ type: 'array', items: { type: 'string' }, required: false })
  keywords!: string[];
  @ApiProperty({ required: true })
  partment!:string
  @ApiProperty({ required: true })
  type!:string
}


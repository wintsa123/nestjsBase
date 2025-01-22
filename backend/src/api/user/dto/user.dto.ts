import { PartialType, ApiProperty } from '@nestjs/swagger';

export class user extends PartialType(class {}) {



  @ApiProperty({ required: true })

  phone!: number; 
  @ApiProperty({ required: true })

  password!: string; 
  @ApiProperty({ required: false })

  email!: string
}


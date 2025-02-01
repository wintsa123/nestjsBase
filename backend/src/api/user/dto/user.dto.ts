import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class user extends PartialType(class { }) {



  @ApiProperty({ required: false })

  phone!: number;
  @ApiProperty({ required: true })
  password!: string;
  @ApiProperty({ required: false })
  email!: string

}


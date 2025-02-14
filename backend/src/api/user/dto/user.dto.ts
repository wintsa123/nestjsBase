import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class user extends PartialType(class { }) {



  @ApiProperty({ required: false })

  phone!: string;
  @ApiProperty({ required: true })
  @IsNotEmpty()
  password!: string;
  @ApiProperty({ required: false })
  email!: string

}


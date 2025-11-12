import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class directoryDto extends PartialType(class { }) {



  @ApiProperty({ required: false })

  directoryId!: string;
  @ApiProperty({ required: false })
  @IsNotEmpty()
  TypeName!: string;


}


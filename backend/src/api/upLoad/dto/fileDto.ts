import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class fileDto extends PartialType(class { }) {



  @ApiProperty({ required: false })
  fileId?: string;
  @ApiProperty({ required: false })
  fileName!: string;
@ApiProperty({ required: false })
  sort!: number;
  @ApiProperty({ required: false })
  directoryId!: string;

}


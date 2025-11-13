import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class fileDto extends PartialType(class { }) {



  @ApiProperty({ required: false })
    @IsOptional()

  fileId?: string;
  @ApiProperty({ required: false })
    @IsOptional()

  fileName!: string;
@ApiProperty({ required: false })
  @IsOptional()

  sort!: number;

  @ApiProperty({ required: false })
    @IsOptional()

  directoryId!: string;

}


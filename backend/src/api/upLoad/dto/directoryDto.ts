

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DirectoryDto {
    @IsOptional()

  @ApiProperty({ required: false })
  directoryId?: string | null;

  @ApiProperty({ required: false })
    @IsOptional()

  directoryName!: string;

  @ApiProperty({ required: false })
    @IsOptional()

  parentId?: string;
}

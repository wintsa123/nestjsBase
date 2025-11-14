

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class deleteDirectoryDto {
    @IsNotEmpty()
    @ApiProperty({ required: false })
    directoryId!: string;


}

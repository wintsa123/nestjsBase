import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { DirectoryDto } from './directoryDto';
export class updateDirectoryDto extends DirectoryDto {



  @ApiProperty({ required: false })
  @IsNotEmpty({ message: '目录ID不能为空' })
  directoryId!: string;



}


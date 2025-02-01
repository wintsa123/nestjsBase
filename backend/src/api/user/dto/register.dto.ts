import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { user } from './user.dto';
export class register extends user {




  @ApiProperty({ required: true })
  @IsNotEmpty()
  realname!: string
  @ApiProperty({ required: true })
  @IsNotEmpty()
  sex!: number
}


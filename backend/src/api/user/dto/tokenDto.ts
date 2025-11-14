import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
export class Token extends PartialType(class { }) {



  @ApiProperty({ required: false })
@IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken!: string;


}


import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  BadRequestException,
  Delete,
  Query,
  UploadedFile,
  Put,
  Get,
  Req
} from '@nestjs/common';
import { FileInterceptor, MulterFile } from '@webundsoehne/nest-fastify-file-upload';

import { UploadService } from './upload.service';
import { ApiOperation } from '@nestjs/swagger';
import { DirectoryDto } from './dto/directoryDto';
import { fileDto } from './dto/fileDto';
import { updateDirectoryDto } from './dto/updateDirectoryDto';
import { deleteDirectoryDto } from './dto/deleteDirectoryDto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  /**
   * 小文件直接上传接口
   * POST /upload/small
   */
  @Post('small')

  @UseInterceptors(FileInterceptor('file'))
  async uploadSmallFile(
    @Req() req: Request | any,
    @UploadedFile('file') file: MulterFile,
    @Body('directoryId') directoryId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }
    const uploaderId = req.user || ''
    console.log(uploaderId)
    // 检查文件大小（小于50MB）
    // const MAX_SIZE = 50 * 1024 * 1024;
    // if (file.size > MAX_SIZE) {
    //   throw new BadRequestException('文件过大，请使用分片上传');
    // }

    return await this.uploadService.uploadSmallFile(
      file.buffer,
      file.originalname,
      directoryId,
      uploaderId
    );
  }

  /**
   * 初始化分片上传
   * POST /upload/chunk/init
   */
  @Post('chunk/init')
  async initChunkUpload(
    @Body() body: {
      fileName: string;
      fileSize: number;
      totalChunks: number;
    }
  ) {
    const { fileName, fileSize, totalChunks } = body;

    if (!fileName || !fileSize || !totalChunks) {
      throw new BadRequestException('缺少必要参数');
    }

    const sessionId = await this.uploadService.initChunkUpload(
      fileName,
      fileSize,
      totalChunks
    );

    return {
      sessionId,
      message: '分片上传已初始化'
    };
  }

  /**
   * 上传单个分片
   * POST /upload/chunk
   */
  @Post('chunk')
  @UseInterceptors(FileInterceptor('chunk'))
  async uploadChunk(
    @UploadedFile() chunk: any,
    @Body('sessionId') sessionId: string,
    @Body('chunkIndex') chunkIndex: string
  ) {
    if (!chunk || !sessionId || chunkIndex === undefined) {
      throw new BadRequestException('缺少必要参数');
    }

    const result = await this.uploadService.uploadChunk(
      sessionId,
      parseInt(chunkIndex),
      chunk.buffer
    );

    return {
      ...result,
      message: `分片 ${parseInt(chunkIndex) + 1} 上传成功`
    };
  }

  /**
   * 完成分片上传
   * POST /upload/chunk/complete
   */
  @Post('chunk/complete')
  async completeChunkUpload(
    @Body() body: {
      sessionId: string;
      directoryId?: string;
      uploaderId?: string;
    }
  ) {
    const { sessionId, directoryId, uploaderId } = body;

    if (!sessionId) {
      throw new BadRequestException('缺少sessionId');
    }

    return await this.uploadService.completeChunkUpload(
      sessionId,
      directoryId,
      uploaderId
    );
  }

  /**
   * 取消分片上传
   * DELETE /upload/chunk/:sessionId
   */
  @Delete('chunk/:sessionId')
  async cancelChunkUpload(@Query('sessionId') sessionId: string) {
    return await this.uploadService.cancelChunkUpload(sessionId);
  }

  @ApiOperation({ summary: 'addDirectory' })

  @Post('addDirectory')
  async addDirectory(
    @Body() body: DirectoryDto
  ) {
    const { directoryId, directoryName } = body;

    return await this.uploadService.addDirectory(

      directoryId,
      directoryName
    );
  }

  //删除文件夹
  @ApiOperation({ summary: 'deleteDirectory' })
  @Delete('deleteDirectory')
  async deleteDirectory(@Body() data: deleteDirectoryDto) {
    const { directoryId } = data;
    return await this.uploadService.deleteDirectory(directoryId);
  }
  //删除文件
  @ApiOperation({ summary: 'deleteFile' })
  @Delete('deleteFile')
  async deleteFile(@Query('fileId') fileId: string) {
    return await this.uploadService.deleteFile(fileId);
  }
  //更新文件
  @ApiOperation({ summary: 'updateFile' })
  @Put('updateFile')
  async updateFile(
    @Query('fileId') fileId: string,

    @Body() body: fileDto
  ) {
    return await this.uploadService.updateFile(fileId,
      body
    );
  }
  //更新文件夹
  @ApiOperation({ summary: 'updateDirectory' })
  @Put('updateDirectory')
  async updateDirectory(
    @Query('directoryId') directoryId: string,
    @Body() body: updateDirectoryDto
  ) {
    return await this.uploadService.updateDirectory(
      directoryId,
      body
    );
  }

  //获取文件夹下的文件和目录
  @ApiOperation({ summary: 'getDirectoryFiles' })
  @Get('getDirectoryFiles')
  async getDirectoryFiles(
    @Query('directoryId') directoryId: string | null | undefined
  ) {
    directoryId = (directoryId && directoryId !== 'undefined' && directoryId !== 'null') ? directoryId : undefined;

    return await this.uploadService.getDirectoryFiles(
      directoryId
    );
  }
}
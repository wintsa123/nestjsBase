import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream, createReadStream } from 'fs';
import * as libre from 'libreoffice-convert';
import { promisify } from 'util';
import { PrismaService } from '@src/plugin/prisma/prisma.service';

const convertAsync = promisify(libre.convert);

@Injectable()
export class UploadService {
  private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
  private readonly CHUNK_SIZE = 50 * 1024 * 1024; // 5MB 切片大小
  private readonly SMALL_FILE_THRESHOLD = 100 * 1024 * 1024; // 10MB 以下直接上传
  
  // 临时存储分片上传的信息
  private uploadSessions = new Map<string, {
    fileName: string;
    totalChunks: number;
    uploadedChunks: Set<number>;
    tempDir: string;
    md5Hash?: string;
  }>();

  constructor(    private prisma: PrismaService,
  ) {
    this.initUploadDir();
  }

  private async initUploadDir() {
    await fs.ensureDir(this.UPLOAD_DIR);
    await fs.ensureDir(path.join(this.UPLOAD_DIR, 'temp'));
  }

  /**
   * 计算文件的 MD5 哈希值
   */
  private async calculateMD5(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = createReadStream(filePath);
      
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  /**
   * 计算 Buffer 的 MD5 哈希值
   */
  private calculateMD5FromBuffer(buffer: Buffer): string {
    return crypto.createHash('md5').update(buffer).digest('hex');
  }

  /**
   * 检查文件是否已存在（通过MD5）
   */
  private async checkFileExists(md5Hash: string) {
    return await this.prisma.file.findUnique({
      where: { md5Hash },
      include: { directory: true }
    });
  }

  /**
   * 获取文件存储路径
   */
  private getFilePath(fileName: string, md5Hash: string): string {
    const fileNameWithoutExt = path.parse(fileName).name;
    return path.join(this.UPLOAD_DIR, fileNameWithoutExt, md5Hash, fileName);
  }

  /**
   * 将 Word 文档转换为 PDF
   */
  private async convertWordToPdf(inputPath: string): Promise<string> {
    try {
      const docxBuffer = await fs.readFile(inputPath);
      const pdfBuffer = await convertAsync(docxBuffer, '.pdf', undefined);
      
      const pdfPath = inputPath.replace(/\.(docx?|doc)$/i, '.pdf');
      await fs.writeFile(pdfPath, pdfBuffer);
      
      // 删除原始 Word 文件
      await fs.unlink(inputPath);
      
      return pdfPath;
    } catch (error:any) {
      throw new BadRequestException(`Word转PDF失败: ${error.message}`);
    }
  }

  /**
   * 小文件直接上传
   */
  async uploadSmallFile(
    file: Buffer,
    fileName: string,
    directoryId?: string,
    uploaderId?: string
  ) {
    // 验证文件格式
    const ext = path.extname(fileName).toLowerCase();
    if (!['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      throw new BadRequestException('不支持的文件格式，仅支持 PDF, Word, TXT');
    }

    // 计算 MD5
    const md5Hash = this.calculateMD5FromBuffer(file);

    // 检查是否已存在
    const existingFile = await this.checkFileExists(md5Hash);
    if (existingFile) {
      // 文件已存在，直接复用
      return await this.createFileRecord(
        existingFile.fileName,
        existingFile.fileType as string,
        existingFile.fileSize,
        md5Hash,
        directoryId,
        uploaderId,
        true // 标记为复用
      );
    }

    // 保存文件到目标路径
    const finalFileName = ext === '.docx' || ext === '.doc' 
      ? fileName.replace(/\.(docx?|doc)$/i, '.pdf') 
      : fileName;
    
    const filePath = this.getFilePath(finalFileName, md5Hash);
    await fs.ensureDir(path.dirname(filePath));
    
    const tempPath = path.join(this.UPLOAD_DIR, 'temp', `${md5Hash}_temp${ext}`);
    await fs.writeFile(tempPath, file);

    // 如果是 Word 文件，转换为 PDF
    let finalPath = tempPath;
    if (ext === '.docx' || ext === '.doc') {
      finalPath = await this.convertWordToPdf(tempPath);
    }

    // 移动到最终位置
    await fs.move(finalPath, filePath, { overwrite: true });

    // 创建数据库记录
    return await this.createFileRecord(
      finalFileName,
      path.extname(finalFileName).slice(1),
      file.length,
      md5Hash,
      directoryId,
      uploaderId,
      false
    );
  }

  /**
   * 初始化分片上传
   */
  async initChunkUpload(
    fileName: string,
    _fileSize: number,
    totalChunks: number
  ): Promise<string> {
    // 验证文件格式
    const ext = path.extname(fileName).toLowerCase();
    if (!['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      throw new BadRequestException('不支持的文件格式');
    }

    const sessionId = crypto.randomUUID();
    const tempDir = path.join(this.UPLOAD_DIR, 'temp', sessionId);
    await fs.ensureDir(tempDir);

    this.uploadSessions.set(sessionId, {
      fileName,
      totalChunks,
      uploadedChunks: new Set(),
      tempDir
    });

    return sessionId;
  }

  /**
   * 上传单个分片
   */
  async uploadChunk(
    sessionId: string,
    chunkIndex: number,
    chunkData: Buffer
  ) {
    const session = this.uploadSessions.get(sessionId);
    if (!session) {
      throw new BadRequestException('无效的上传会话');
    }

    const chunkPath = path.join(session.tempDir, `chunk_${chunkIndex}`);
    await fs.writeFile(chunkPath, chunkData);
    
    session.uploadedChunks.add(chunkIndex);

    return {
      uploaded: session.uploadedChunks.size,
      total: session.totalChunks,
      isComplete: session.uploadedChunks.size === session.totalChunks
    };
  }

  /**
   * 完成分片上传，合并文件
   */
  async completeChunkUpload(
    sessionId: string,
    directoryId?: string,
    uploaderId?: string
  ) {
    const session = this.uploadSessions.get(sessionId);
    if (!session) {
      throw new BadRequestException('无效的上传会话');
    }

    if (session.uploadedChunks.size !== session.totalChunks) {
      throw new BadRequestException('文件分片未上传完整');
    }

    // 合并分片
    const mergedPath = path.join(session.tempDir, 'merged');
    const writeStream = createWriteStream(mergedPath);

    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = path.join(session.tempDir, `chunk_${i}`);
      const chunkBuffer = await fs.readFile(chunkPath);
      writeStream.write(chunkBuffer);
    }

    writeStream.end();
    await new Promise((_resolve, reject) => {
    //   writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // 计算 MD5
    const md5Hash = await this.calculateMD5(mergedPath);

    // 检查是否已存在
    const existingFile = await this.checkFileExists(md5Hash);
    if (existingFile) {
      // 清理临时文件
      await fs.remove(session.tempDir);
      this.uploadSessions.delete(sessionId);

      return await this.createFileRecord(
        existingFile.fileName,
        existingFile.fileType as string,
        existingFile.fileSize,
        md5Hash,
        directoryId,
        uploaderId,
        true
      );
    }

    // 处理文件（Word转PDF）
    let finalPath = mergedPath;
    const ext = path.extname(session.fileName).toLowerCase();
    const finalFileName = (ext === '.docx' || ext === '.doc')
      ? session.fileName.replace(/\.(docx?|doc)$/i, '.pdf')
      : session.fileName;

    if (ext === '.docx' || ext === '.doc') {
      finalPath = await this.convertWordToPdf(mergedPath);
    }

    // 移动到最终位置
    const targetPath = this.getFilePath(finalFileName, md5Hash);
    await fs.ensureDir(path.dirname(targetPath));
    await fs.move(finalPath, targetPath, { overwrite: true });

    const fileSize = (await fs.stat(targetPath)).size;

    // 清理临时文件
    await fs.remove(session.tempDir);
    this.uploadSessions.delete(sessionId);

    // 创建数据库记录
    return await this.createFileRecord(
      finalFileName,
      path.extname(finalFileName).slice(1),
      fileSize,
      md5Hash,
      directoryId,
      uploaderId,
      false
    );
  }

  /**
   * 创建文件记录
   */
  private async createFileRecord(
    fileName: string,
    fileType: string,
    fileSize: number,
    md5Hash: string,
    directoryId?: string,
    uploaderId?: string,
    isDuplicate: boolean = false
  ) {
    // 如果是重复文件，创建新的文件记录但指向同一个物理文件
    const file = await this.prisma.file.create({
      data: {
        fileName,
        fileType,
        fileSize,
        md5Hash: isDuplicate ? undefined : md5Hash, // 重复文件不设置md5Hash（避免唯一约束）
        directoryId,
        uploaderId
      },
      include: {
        directory: true
      }
    });

    return {
      ...file,
      isDuplicate,
      message: isDuplicate ? '文件已存在，已复用现有文件' : '文件上传成功'
    };
  }

  /**
   * 取消分片上传
   */
  async cancelChunkUpload(sessionId: string) {
    const session = this.uploadSessions.get(sessionId);
    if (session) {
      await fs.remove(session.tempDir);
      this.uploadSessions.delete(sessionId);
    }
    return { message: '上传已取消' };
  }
}
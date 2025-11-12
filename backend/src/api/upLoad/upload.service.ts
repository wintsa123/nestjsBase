import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream, createReadStream } from 'fs';
import { LibreOfficeFileConverter } from 'libreoffice-file-converter';
import { promisify } from 'util';
import { PrismaService } from '@src/plugin/prisma/prisma.service';
import { blake3 } from 'hash-wasm';

import { fileDto } from './dto/fileDto';
import { isValidFileName } from '@src/utils';
import { directoryDto } from './dto/directoryDto';

@Injectable()
export class UploadService {
    private readonly UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
    private readonly CHUNK_SIZE = 50 * 1024 * 1024; // 50MB 切片大小
    private readonly SMALL_FILE_THRESHOLD = 100 * 1024 * 1024; // 100MB 以下直接上传
    private rootId?: string;
    // 临时存储分片上传的信息
    private uploadSessions = new Map<string, {
        fileName: string;
        totalChunks: number;
        uploadedChunks: Set<number>;
        tempDir: string;
        blake3Hash?: string;
    }>();

    constructor(private prisma: PrismaService,
    ) {
        this.initUploadDir();

    }

    private async initUploadDir() {
        await fs.ensureDir(this.UPLOAD_DIR);
        await fs.ensureDir(path.join(this.UPLOAD_DIR, 'temp'));
        const root = await this.prisma.directory.findFirst({
            where: { parentId: null }, // 或者根据你的唯一字段改
        });

        if (!root) {
            const result = await this.prisma.directory.create({
                data: {
                    name: '/',
                    parentId: null, // 根目录没有上级
                },
            });
            this.rootId = result.id
            console.log('已创建根目录', result);
        } else {
            console.log('根目录已存在');
            this.rootId = root.id

        }
    }

    /**
     * 计算文件的 blake3 哈希值
     */
    private async calculateblake3(filePath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('blake3');
            const stream = createReadStream(filePath);

            stream.on('data', (data) => hash.update(data));
            stream.on('end', () => resolve(hash.digest('hex')));
            stream.on('error', reject);
        });
    }

    /**
     * 计算 Buffer 的 blake3 哈希值
     */
    private async calculateblake3FromBuffer(buffer: Buffer): Promise<string> {
        return await blake3(buffer)
    }

    /**
     * 检查文件是否已存在（通过blake3）
     */
    private async checkFileExists(blake3Hash: string) {
        return await this.prisma.file.findFirst({
            where: { hash: blake3Hash },
            include: { directory: true }
        });
    }

    /**
     * 获取文件存储路径
     */
    private getFilePath(fileName: string, blake3Hash: string): string {
        const fileNameWithoutExt = path.parse(fileName).name;
        return path.join(this.UPLOAD_DIR, fileNameWithoutExt, blake3Hash, fileName);
    }

    /**
     * 将 Word 文档转换为 PDF
     */
    private async convertWordToPdf(file: Buffer, inputPath: string): Promise<string> {
        try {
            const libreOfficeFileConverter = new LibreOfficeFileConverter({
                childProcessOptions: {
                    timeout: 60 * 1000,
                },
            });
            const pdfBuffer = await libreOfficeFileConverter.convert({
                buffer: file,
                format: 'pdf',
                input: 'buffer',
                output: 'buffer'
            })
            console.log(pdfBuffer)
            const pdfPath = inputPath.replace(/\.(docx?|doc)$/i, '.pdf');
            await fs.writeFile(pdfPath, pdfBuffer);

            // 删除原始 Word 文件
            await fs.unlink(inputPath);

            return pdfPath;
        } catch (error: any) {
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

        // 计算 blake3
        const blake3Hash = await this.calculateblake3FromBuffer(file);
        if (!directoryId) {
            const rootDirectory = await this.prisma.directory.findFirst({
                where: { parentId: null }, // 或用固定 id: 'root-id'
            });

            if (!rootDirectory) {
                throw new Error('根目录不存在，请先初始化根目录');
            }

            directoryId = rootDirectory.id;
        }
        // 检查是否已存在
        const existingFile = await this.checkFileExists(blake3Hash);
        if (existingFile) {
            // 文件已存在，直接复用
            if (existingFile.directoryId == directoryId) {
                throw new BadRequestException('文件已存在于该目录');
            }
            return await this.createFileRecord(
                existingFile.fileName,
                existingFile.fileType as string,
                existingFile.fileSize,
                blake3Hash,
                directoryId,
                uploaderId,
                true // 标记为复用
            );
        }

        // 保存文件到目标路径
        const finalFileName = ext === '.docx' || ext === '.doc'
            ? fileName.replace(/\.(docx?|doc)$/i, '.pdf')
            : fileName;

        const filePath = this.getFilePath(finalFileName, blake3Hash);
        await fs.ensureDir(path.dirname(filePath));

        const tempPath = path.join(this.UPLOAD_DIR, 'temp', `${blake3Hash}_${fileName}`);
        await fs.writeFile(tempPath, file);

        // 如果是 Word 文件，转换为 PDF
        let finalPath = tempPath;
        if (ext === '.docx' || ext === '.doc') {
            finalPath = await this.convertWordToPdf(file, finalPath);
        }

        // 移动到最终位置
        await fs.move(finalPath, filePath, { overwrite: true });

        // 创建数据库记录
        return await this.createFileRecord(
            finalFileName,
            path.extname(finalFileName).slice(1),
            file.length,
            blake3Hash,
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

        // 计算 blake3
        const blake3Hash = await this.calculateblake3(mergedPath);

        // 检查是否已存在
        const existingFile = await this.checkFileExists(blake3Hash);
        if (existingFile) {
            // 清理临时文件
            await fs.remove(session.tempDir);
            this.uploadSessions.delete(sessionId);

            return await this.createFileRecord(
                existingFile.fileName,
                existingFile.fileType as string,
                existingFile.fileSize,
                blake3Hash,
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
            const file = await fs.readFile(mergedPath)
            finalPath = await this.convertWordToPdf(file, mergedPath);
        }

        // 移动到最终位置
        const targetPath = this.getFilePath(finalFileName, blake3Hash);
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
            blake3Hash,
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
        blake3Hash: string,
        directoryId?: string,
        uploaderId?: string,
        isDuplicate: boolean = false
    ) {
        const maxSortResult = await this.prisma.file.aggregate({
            _max: { sort: true },
            where: { directoryId: directoryId ?? null },
        });

        const nextSort = (maxSortResult._max.sort ?? 0) + 1;
        // 如果是重复文件，创建新的文件记录但指向同一个物理文件
        const file = await this.prisma.file.create({
            data: {
                fileName,
                fileType,
                fileSize,
                hash: blake3Hash, // 重复文件不设置blake3Hash（避免唯一约束）
                directoryId,
                uploaderId,
                sort: nextSort
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
    async addDirectory(directoryId: string, DirectoryName: string) {
        return await this.prisma.$transaction(async (tx) => {
            const existingDirectory = await tx.directory.findFirst({
                where: {
                    name: DirectoryName,
                    parentId: directoryId,
                }
            });

            if (existingDirectory) {
                throw new ConflictException('目标位置已存在同名文件夹');
            }
            return await this.prisma.directory.create({

                data: {
                    parentId: directoryId,
                    name: DirectoryName
                }
            })
        })
    }
    /**
  * @Author: wintsa
  * @Date: 2025-11-12 
  * @LastEditors: wintsa
  * @Description: 删除文件，并且检索，如果无其他，删除文件夹
  * @returns {*} 
  */
    async deleteFile(fileId: string) {
        // 使用事务确保数据一致性
        return await this.prisma.$transaction(async (tx) => {
            // 1️⃣ 查出文件信息
            const file = await tx.file.findUnique({
                where: { id: fileId },
                select: { hash: true, fileName: true },
            });

            if (!file) throw new BadRequestException('文件不存在');

            // 2️⃣ 删除数据库记录（先删除，避免计数问题）
            const deletedFile = await tx.file.delete({
                where: { id: fileId }
            });

            // 3️⃣ 检查是否还有其他文件使用相同的 hash
            const hashCount = await tx.file.count({
                where: { hash: file.hash },
            });

            // 4️⃣ 如果没有其他文件使用该 hash，删除物理文件
            if (hashCount === 0) {
                const fileNameWithoutExt = path.parse(file.fileName).name;
                const filePath = path.join(this.UPLOAD_DIR, fileNameWithoutExt, file.hash);

                try {
                    await fs.remove(filePath);
                } catch (error) {
                    // 记录错误但不阻断流程（物理文件可能已被手动删除）
                    console.error(`Failed to delete file: ${filePath}`, error);
                }

                // 5️⃣ 检查文件夹是否还有其他文件
                const fileNameCount = await tx.file.count({
                    where: { fileName: file.fileName },
                });

                // 6️⃣ 如果文件夹为空，删除文件夹
                if (fileNameCount === 0) {
                    const dirPath = path.join(this.UPLOAD_DIR, fileNameWithoutExt);
                    try {
                        await fs.remove(dirPath);
                    } catch (error) {
                        console.error(`Failed to delete directory: ${dirPath}`, error);
                    }
                }
            }

            return deletedFile;
        });
    }


    /**
     * @Description: 更新文件信息（重命名/移动/排序）
     */
    async updateFile(fileId: string, fileDto: fileDto) {
        return await this.prisma.$transaction(async (tx) => {
            // 1️⃣ 获取原文件信息
            const originalFile = await tx.file.findUnique({
                where: { id: fileId },
                select: {
                    id: true,
                    fileName: true,
                    hash: true,
                    directoryId: true,
                    sort: true,
                }
            });

            if (!originalFile) {
                throw new BadRequestException('文件不存在');
            }

            const data: any = {};
            let needHandlePhysicalFile = false;
            let oldFileNameWithoutExt = '';
            let newFileNameWithoutExt = '';

            // 2️⃣ 处理重命名
            if (fileDto.fileName !== undefined && fileDto.fileName !== originalFile.fileName) {
                // 检查新文件名是否合法
                if (!isValidFileName(fileDto.fileName)) {
                    throw new BadRequestException('文件名不合法');
                }





                // 检查文件夹名称是否改变
                oldFileNameWithoutExt = path.parse(originalFile.fileName).name;
                newFileNameWithoutExt = path.parse(fileDto.fileName).name;

                if (oldFileNameWithoutExt !== newFileNameWithoutExt) {
                    needHandlePhysicalFile = true;
                }

                data.fileName = fileDto.fileName;
            }

            // 3️⃣ 处理移动到其他文件夹
            if (fileDto.directoryId !== undefined && fileDto.directoryId !== originalFile.directoryId) {
                // 检查目标文件夹是否存在
                if (fileDto.directoryId) {
                    const targetDirectory = await tx.directory.findUnique({
                        where: { id: fileDto.directoryId }
                    });
                    if (!targetDirectory) {
                        throw new BadRequestException('目标文件夹不存在');
                    }
                }





                data.directoryId = fileDto.directoryId;

                // 移动到新文件夹时，如果没有指定 sort，则自动放到最后
                if (fileDto.sort === undefined) {
                    const maxSortResult = await tx.file.aggregate({
                        _max: { sort: true },
                        where: { directoryId: fileDto.directoryId },
                    });
                    data.sort = (maxSortResult._max.sort ?? 0) + 1;
                }
            }

            // 4️⃣ 处理排序（独立的排序操作）
            if (fileDto.sort !== undefined && fileDto.directoryId === undefined) {
                // 只在当前文件夹内调整排序
                data.sort = fileDto.sort;
            } else if (fileDto.sort !== undefined && fileDto.directoryId !== undefined) {
                // 移动到新文件夹时，使用指定的 sort
                data.sort = fileDto.sort;
            }

            // 5️⃣ 如果没有任何更新
            if (Object.keys(data).length === 0) {
                return originalFile;
            }

            // 6️⃣ 更新数据库
            const updatedFile = await tx.file.update({
                where: { id: fileId },
                data,
            });

            // 7️⃣ 处理物理文件（重命名导致文件夹名改变）
            if (needHandlePhysicalFile) {
                // 检查是否有其他文件使用相同的 hash
                const sameHashFiles = await tx.file.findMany({
                    where: {
                        hash: originalFile.hash,
                        id: { not: fileId }
                    },
                    select: { fileName: true }
                });

                // 检查这些文件中是否有使用旧文件夹名的
                const hasOldFolderReference = sameHashFiles.some(f =>
                    path.parse(f.fileName).name === oldFileNameWithoutExt
                );

                // 检查是否已存在新文件夹路径的文件
                const hasNewFolderReference = sameHashFiles.some(f =>
                    path.parse(f.fileName).name === newFileNameWithoutExt
                );

                const oldPhysicalPath = path.join(this.UPLOAD_DIR, oldFileNameWithoutExt, originalFile.hash);
                const newPhysicalPath = path.join(this.UPLOAD_DIR, newFileNameWithoutExt, originalFile.hash);

                // 返回物理文件操作信息，在事务外执行
                return {
                    ...updatedFile,
                    _physicalFileOperation: {
                        shouldCopy: !hasNewFolderReference,
                        shouldDeleteOld: !hasOldFolderReference,
                        oldPath: oldPhysicalPath,
                        newPath: newPhysicalPath
                    }
                };
            }

            return updatedFile;
        }).then(async (result: any) => {
            // 8️⃣ 在事务外处理物理文件
            if (result._physicalFileOperation) {
                const { shouldCopy, shouldDeleteOld, oldPath, newPath } = result._physicalFileOperation;

                try {
                    // 如果新文件夹路径不存在，复制文件过去
                    if (shouldCopy) {
                        await fs.ensureDir(path.dirname(newPath));
                        await fs.copy(oldPath, newPath);
                    }

                    // 如果没有其他文件引用旧文件夹，删除旧路径的文件
                    if (shouldDeleteOld) {
                        await fs.remove(oldPath);

                        // 检查旧文件夹是否为空，为空则删除
                        await this.cleanupEmptyDirectory(oldPath);
                    }
                } catch (error) {
                    console.error('Physical file operation failed:', error);
                    // 物理文件操作失败，记录错误但不影响业务
                    // 可以添加到修复队列，定时任务处理
                }

                // 删除临时的操作信息
                delete result._physicalFileOperation;
            }

            return result;
        });
    }
    async getDirectoryFiles(directoryId: string) {
        return await this.prisma.file.findMany({
            where: {
                directoryId: directoryId
            }
        })
    }
    /**
    * @Description: 清理空文件夹
    */
    private async cleanupEmptyDirectory(filePath: string) {
        try {
            const dirPath = path.dirname(filePath);
            const files = await fs.readdir(dirPath);

            if (files.length === 0) {
                await fs.remove(dirPath);
            }
        } catch (error) {
            // 忽略错误
            console.error('Failed to cleanup directory:', error);
        }
    }
    async deleteDirectory(directoryId: string) {
        if (directoryId === this.rootId) {
            throw new BadRequestException('不能删除根目录');
        }
        return await this.prisma.$transaction(async (tx) => {
            // 1️⃣ 递归查询所有子文件夹 ID
            const result = await tx.$queryRawUnsafe<{ id: string }[]>(`
            WITH RECURSIVE subdirs AS (
                SELECT id FROM "Directory" WHERE id = $1
                UNION ALL
                SELECT d.id
                FROM "Directory" d
                INNER JOIN subdirs s ON d."parentId" = s.id
            )
            SELECT id FROM subdirs;
        `, directoryId);

            const directoryIds = result.map(item => item.id);

            // 2️⃣ 批量查询所有需要删除的文件
            const files = await tx.file.findMany({
                where: {
                    directoryId: { in: directoryIds }
                },
                select: {
                    id: true,
                    hash: true,
                    fileName: true
                }
            });

            // 3️⃣ 删除所有文件记录
            if (files.length > 0) {
                await tx.file.deleteMany({
                    where: {
                        directoryId: { in: directoryIds }
                    }
                });
            }

            // 4️⃣ 批量统计每个 hash 的剩余引用数
            const hashesToCheck = [...new Set(files.map(f => f.hash))];
            const hashCounts = await tx.file.groupBy({
                by: ['hash'],
                where: { hash: { in: hashesToCheck } },
                _count: { hash: true },
            });

            const hashCountMap = new Map(
                hashCounts.map(h => [h.hash, h._count.hash])
            );

            // 5️⃣ 批量统计每个 fileName 的剩余引用数
            const fileNamesToCheck = [...new Set(files.map(f => f.fileName))];
            const fileNameCounts = await tx.file.groupBy({
                by: ['fileName'],
                where: { fileName: { in: fileNamesToCheck } },
                _count: { fileName: true },
            });

            const fileNameCountMap = new Map(
                fileNameCounts.map(f => [f.fileName, f._count.fileName])
            );

            // 6️⃣ 删除物理文件和文件夹
            const filePathsToDelete: string[] = [];
            const dirPathsToDelete = new Set<string>();

            for (const file of files) {
                const fileNameWithoutExt = path.parse(file.fileName).name;

                // 如果该 hash 没有其他引用，标记删除物理文件
                if (!hashCountMap.has(file.hash)) {
                    const filePath = path.join(this.UPLOAD_DIR, fileNameWithoutExt, file.hash);
                    filePathsToDelete.push(filePath);
                }

                // 如果该 fileName 没有其他引用，标记删除文件夹
                if (!fileNameCountMap.has(file.fileName)) {
                    const dirPath = path.join(this.UPLOAD_DIR, fileNameWithoutExt);
                    dirPathsToDelete.add(dirPath);
                }
            }

            // 7️⃣ 并发删除物理文件（事务外执行，避免阻塞）
            // 注意：这里在事务内删除是为了确保一致性
            await Promise.allSettled([
                ...filePathsToDelete.map(p => fs.remove(p).catch(err =>
                    console.error(`Failed to delete file: ${p}`, err)
                )),
                ...Array.from(dirPathsToDelete).map(p => fs.remove(p).catch(err =>
                    console.error(`Failed to delete directory: ${p}`, err)
                ))
            ]);

            // 8️⃣ 批量删除文件夹记录（按层级从深到浅删除）
            await tx.directory.deleteMany({
                where: { id: { in: directoryIds } }
            });

            return { deletedDirectories: directoryIds.length, deletedFiles: files.length };
        });
    }
    /**
     * @Description: 更新文件夹信息（重命名/移动/排序）
     */
    async updateDirectory(directoryId: string, body: directoryDto) {
        return await this.prisma.$transaction(async (tx) => {
            // 1️⃣ 检查文件夹是否存在
            const directory = await tx.directory.findUnique({
                where: { id: directoryId },
                select: {
                    id: true,
                    name: true,
                    parentId: true
                }
            });

            if (!directory) {
                throw new BadRequestException('文件夹不存在');
            }

            const data: any = {};

            // 2️⃣ 处理重命名
            if (body.DirectoryName !== undefined && body.DirectoryName !== directory.name) {
                // 验证文件夹名是否合法
                if (!isValidFileName(body.DirectoryName)) {
                    throw new BadRequestException('文件夹名不合法');
                }

                // 检查同级目录下是否已存在同名文件夹
                const existingDirectory = await tx.directory.findFirst({
                    where: {
                        name: body.DirectoryName,
                        parentId: directory.parentId,
                        id: { not: directoryId }
                    }
                });

                if (existingDirectory) {
                    throw new ConflictException('同级目录下已存在同名文件夹');
                }

                data.name = body.DirectoryName;
            }

            // 3️⃣ 处理移动到其他父文件夹里面
            if (body.parentId !== undefined && body.parentId !== directory.parentId) {
                // 检查目标父文件夹是否存在
                const parentDirectory = await tx.directory.findUnique({
                    where: { id: body.parentId }
                });

                if (!parentDirectory) {
                    throw new BadRequestException('目标父文件夹不存在');
                }
                let isCircular = false
                // 检查是否会造成循环引用（不能移动到自己的子文件夹下）
                if (directoryId === body.parentId) {
                    isCircular = true;
                }

                // 递归查询目标父文件夹的所有祖先
                const result = await tx.$queryRawUnsafe<{ id: string }[]>(`
        WITH RECURSIVE ancestors AS (
            SELECT id, "parentId" FROM "Directory" WHERE id = $1
            UNION ALL
            SELECT d.id, d."parentId"
            FROM "Directory" d
            INNER JOIN ancestors a ON d.id = a."parentId"
        )
        SELECT id FROM ancestors WHERE id = $2
    `, body.parentId, directoryId);

                isCircular = result.length > 0;


                if (isCircular) {
                    throw new BadRequestException('不能移动到自己的子文件夹下');
                }


                // 检查目标位置是否已存在同名文件夹
                const targetDirectoryName = data.directoryName || directory.name;
                const existingDirectory = await tx.directory.findFirst({
                    where: {
                        name: targetDirectoryName,
                        parentId: body.parentId,
                        id: { not: directoryId }
                    }
                });

                if (existingDirectory) {
                    throw new ConflictException('目标位置已存在同名文件夹');
                }

                data.parentId = body.parentId;


            }



            // 5️⃣ 如果没有任何更新
            if (Object.keys(data).length === 0) {
                return directory;
            }

            // 6️⃣ 更新数据库
            return await tx.directory.update({
                where: { id: directoryId },
                data
            });
        });
    }
}

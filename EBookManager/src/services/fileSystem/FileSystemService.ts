import RNFS from 'react-native-fs';
import {Platform} from 'react-native';
import {STORAGE_PATHS, APP_CONFIG} from '@constants';
import {FileOperationResult} from '@types';

export class FileSystemService {
  private static instance: FileSystemService;
  private documentsPath: string;

  private constructor() {
    this.documentsPath = RNFS.DocumentDirectoryPath;
  }

  public static getInstance(): FileSystemService {
    if (!FileSystemService.instance) {
      FileSystemService.instance = new FileSystemService();
    }
    return FileSystemService.instance;
  }

  // 初始化应用目录结构
  async initializeDirectories(): Promise<FileOperationResult> {
    try {
      const directories = [
        STORAGE_PATHS.BOOKS_DIR,
        STORAGE_PATHS.COVERS_DIR,
        STORAGE_PATHS.CACHE_DIR,
        STORAGE_PATHS.DATABASE_DIR,
        STORAGE_PATHS.EPUB_DIR,
        STORAGE_PATHS.PDF_DIR,
        STORAGE_PATHS.TXT_DIR,
      ];

      for (const dir of directories) {
        const dirPath = this.getPath(dir);
        const exists = await RNFS.exists(dirPath);
        
        if (!exists) {
          await RNFS.mkdir(dirPath);
        }
      }

      return {
        success: true,
        path: this.documentsPath,
      };
    } catch (error) {
      console.error('Error initializing directories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取完整路径
  getPath(relativePath: string): string {
    return `${this.documentsPath}/${relativePath}`;
  }

  // 复制文件到应用目录
  async copyFileToApp(sourcePath: string, targetDir: string, newFileName?: string): Promise<FileOperationResult> {
    try {
      // 检查源文件是否存在
      const sourceExists = await RNFS.exists(sourcePath);
      if (!sourceExists) {
        return {
          success: false,
          error: 'Source file does not exist',
        };
      }

      // 获取文件信息
      const fileInfo = await RNFS.stat(sourcePath);
      
      // 检查文件大小
      if (fileInfo.size > APP_CONFIG.MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'File size exceeds maximum allowed size',
        };
      }

      // 生成目标文件名
      const originalFileName = sourcePath.split('/').pop() || 'unknown';
      const fileName = newFileName || this.generateUniqueFileName(originalFileName);
      const targetPath = this.getPath(`${targetDir}/${fileName}`);

      // 确保目标目录存在
      const targetDirPath = this.getPath(targetDir);
      const dirExists = await RNFS.exists(targetDirPath);
      if (!dirExists) {
        await RNFS.mkdir(targetDirPath);
      }

      // 复制文件
      await RNFS.copyFile(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
      };
    } catch (error) {
      console.error('Error copying file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 移动文件
  async moveFile(sourcePath: string, targetPath: string): Promise<FileOperationResult> {
    try {
      const sourceExists = await RNFS.exists(sourcePath);
      if (!sourceExists) {
        return {
          success: false,
          error: 'Source file does not exist',
        };
      }

      await RNFS.moveFile(sourcePath, targetPath);

      return {
        success: true,
        path: targetPath,
      };
    } catch (error) {
      console.error('Error moving file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 删除文件
  async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return {
          success: true,
          path: filePath,
        };
      }

      await RNFS.unlink(filePath);

      return {
        success: true,
        path: filePath,
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 检查文件是否存在
  async fileExists(filePath: string): Promise<boolean> {
    try {
      return await RNFS.exists(filePath);
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  // 获取文件信息
  async getFileInfo(filePath: string): Promise<RNFS.StatResult | null> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return null;
      }

      return await RNFS.stat(filePath);
    } catch (error) {
      console.error('Error getting file info:', error);
      return null;
    }
  }

  // 读取文件内容
  async readFile(filePath: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<string | null> {
    try {
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        return null;
      }

      return await RNFS.readFile(filePath, encoding);
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  // 写入文件
  async writeFile(filePath: string, content: string, encoding: 'utf8' | 'base64' = 'utf8'): Promise<FileOperationResult> {
    try {
      await RNFS.writeFile(filePath, content, encoding);

      return {
        success: true,
        path: filePath,
      };
    } catch (error) {
      console.error('Error writing file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取目录下的所有文件
  async listFiles(dirPath: string): Promise<RNFS.ReadDirItem[]> {
    try {
      const exists = await RNFS.exists(dirPath);
      if (!exists) {
        return [];
      }

      return await RNFS.readDir(dirPath);
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // 获取可用存储空间
  async getAvailableSpace(): Promise<number> {
    try {
      const freeSpace = await RNFS.getFSInfo();
      return freeSpace.freeSpace;
    } catch (error) {
      console.error('Error getting available space:', error);
      return 0;
    }
  }

  // 清理缓存文件
  async clearCache(): Promise<FileOperationResult> {
    try {
      const cachePath = this.getPath(STORAGE_PATHS.CACHE_DIR);
      const exists = await RNFS.exists(cachePath);
      
      if (exists) {
        const files = await RNFS.readDir(cachePath);
        
        for (const file of files) {
          await RNFS.unlink(file.path);
        }
      }

      return {
        success: true,
        path: cachePath,
      };
    } catch (error) {
      console.error('Error clearing cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 生成唯一文件名
  private generateUniqueFileName(originalFileName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalFileName.split('.').pop() || '';
    
    return `${timestamp}_${random}.${extension}`;
  }

  // 根据文件格式获取存储目录
  getStorageDir(fileFormat: string): string {
    switch (fileFormat.toLowerCase()) {
      case 'epub':
        return STORAGE_PATHS.EPUB_DIR;
      case 'pdf':
        return STORAGE_PATHS.PDF_DIR;
      case 'txt':
        return STORAGE_PATHS.TXT_DIR;
      default:
        return STORAGE_PATHS.BOOKS_DIR;
    }
  }

  // 获取封面存储路径
  getCoverPath(bookId: number): string {
    return this.getPath(`${STORAGE_PATHS.COVERS_DIR}/cover_${bookId}.jpg`);
  }
}
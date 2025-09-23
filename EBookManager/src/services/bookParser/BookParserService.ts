import {BaseBookParser} from './BaseBookParser';
import {EPUBParser} from './EPUBParser';
import {PDFParser} from './PDFParser';
import {TXTParser} from './TXTParser';
import {BookMetadata, Chapter} from '@types/models';
import {BookParseResult} from '@types';

export class BookParserService {
  private static instance: BookParserService;
  private epubParser: EPUBParser;
  private pdfParser: PDFParser;
  private txtParser: TXTParser;

  private constructor() {
    this.epubParser = new EPUBParser();
    this.pdfParser = new PDFParser();
    this.txtParser = new TXTParser();
  }

  public static getInstance(): BookParserService {
    if (!BookParserService.instance) {
      BookParserService.instance = new BookParserService();
    }
    return BookParserService.instance;
  }

  // 根据文件格式获取相应的解析器
  private getParser(fileFormat: string): BaseBookParser | null {
    switch (fileFormat.toLowerCase()) {
      case 'epub':
        return this.epubParser;
      case 'pdf':
        return this.pdfParser;
      case 'txt':
        return this.txtParser;
      default:
        return null;
    }
  }

  // 检测文件格式
  detectFileFormat(filePath: string): string | null {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'epub':
        return 'epub';
      case 'pdf':
        return 'pdf';
      case 'txt':
        return 'txt';
      case 'mobi':
        return 'mobi';
      default:
        return null;
    }
  }

  // 解析书籍元数据
  async parseBookMetadata(filePath: string): Promise<BookParseResult> {
    try {
      const fileFormat = this.detectFileFormat(filePath);
      if (!fileFormat) {
        return {
          success: false,
          error: 'Unsupported file format',
        };
      }

      const parser = this.getParser(fileFormat);
      if (!parser) {
        return {
          success: false,
          error: `No parser available for ${fileFormat} format`,
        };
      }

      return await parser.parseMetadata(filePath);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 提取封面图片
  async extractBookCover(filePath: string): Promise<string | null> {
    try {
      const fileFormat = this.detectFileFormat(filePath);
      if (!fileFormat) {
        return null;
      }

      const parser = this.getParser(fileFormat);
      if (!parser) {
        return null;
      }

      return await parser.extractCover(filePath);
    } catch (error) {
      console.error('Error extracting book cover:', error);
      return null;
    }
  }

  // 获取目录结构
  async getBookTableOfContents(filePath: string): Promise<Chapter[]> {
    try {
      const fileFormat = this.detectFileFormat(filePath);
      if (!fileFormat) {
        return [];
      }

      const parser = this.getParser(fileFormat);
      if (!parser) {
        return [];
      }

      return await parser.getTableOfContents(filePath);
    } catch (error) {
      console.error('Error getting book table of contents:', error);
      return [];
    }
  }

  // 获取书籍内容
  async getBookContent(filePath: string, position?: string): Promise<string> {
    try {
      const fileFormat = this.detectFileFormat(filePath);
      if (!fileFormat) {
        return '';
      }

      const parser = this.getParser(fileFormat);
      if (!parser) {
        return '';
      }

      return await parser.getContent(filePath, position);
    } catch (error) {
      console.error('Error getting book content:', error);
      return '';
    }
  }

  // 验证文件是否为有效的电子书
  async validateBookFile(filePath: string): Promise<{
    isValid: boolean;
    format?: string;
    error?: string;
  }> {
    try {
      const fileFormat = this.detectFileFormat(filePath);
      if (!fileFormat) {
        return {
          isValid: false,
          error: 'Unsupported file format',
        };
      }

      const parser = this.getParser(fileFormat);
      if (!parser) {
        return {
          isValid: false,
          error: `No parser available for ${fileFormat} format`,
        };
      }

      // 尝试解析元数据来验证文件有效性
      const result = await parser.parseMetadata(filePath);
      
      return {
        isValid: result.success,
        format: fileFormat,
        error: result.error,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取支持的文件格式列表
  getSupportedFormats(): string[] {
    return ['epub', 'pdf', 'txt'];
  }

  // 检查文件格式是否支持
  isFormatSupported(format: string): boolean {
    return this.getSupportedFormats().includes(format.toLowerCase());
  }

  // 获取文件格式的显示名称
  getFormatDisplayName(format: string): string {
    switch (format.toLowerCase()) {
      case 'epub':
        return 'EPUB电子书';
      case 'pdf':
        return 'PDF文档';
      case 'txt':
        return '文本文件';
      case 'mobi':
        return 'Kindle电子书';
      default:
        return format.toUpperCase();
    }
  }

  // 获取格式特定的功能支持情况
  getFormatCapabilities(format: string): {
    hasTableOfContents: boolean;
    hasCover: boolean;
    supportsBookmarks: boolean;
    supportsSearch: boolean;
  } {
    switch (format.toLowerCase()) {
      case 'epub':
        return {
          hasTableOfContents: true,
          hasCover: true,
          supportsBookmarks: true,
          supportsSearch: true,
        };
      case 'pdf':
        return {
          hasTableOfContents: true,
          hasCover: false,
          supportsBookmarks: true,
          supportsSearch: false,
        };
      case 'txt':
        return {
          hasTableOfContents: true,
          hasCover: false,
          supportsBookmarks: true,
          supportsSearch: true,
        };
      default:
        return {
          hasTableOfContents: false,
          hasCover: false,
          supportsBookmarks: false,
          supportsSearch: false,
        };
    }
  }
}
import {BookMetadata, Chapter} from '@types/models';
import {BookParseResult} from '@types';

export abstract class BaseBookParser {
  abstract parseMetadata(filePath: string): Promise<BookParseResult>;
  abstract extractCover(filePath: string): Promise<string | null>;
  abstract getTableOfContents(filePath: string): Promise<Chapter[]>;
  abstract getContent(filePath: string, position?: string): Promise<string>;
  
  // 通用方法：验证文件格式
  protected validateFileFormat(filePath: string, expectedExtensions: string[]): boolean {
    const extension = filePath.split('.').pop()?.toLowerCase();
    return expectedExtensions.includes(extension || '');
  }

  // 通用方法：清理HTML内容
  protected cleanHtmlContent(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }

  // 通用方法：提取文本内容
  protected extractTextFromHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // 通用方法：生成唯一ID
  protected generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
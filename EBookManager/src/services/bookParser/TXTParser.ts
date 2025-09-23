import RNFS from 'react-native-fs';
import {BaseBookParser} from './BaseBookParser';
import {BookMetadata, Chapter} from '@types/models';
import {BookParseResult} from '@types';

export class TXTParser extends BaseBookParser {
  private readonly supportedExtensions = ['txt'];
  private readonly chapterPatterns = [
    /^第[一二三四五六七八九十百千万\d]+章/,
    /^Chapter\s+\d+/i,
    /^章节\s*\d+/,
    /^\d+\./,
    /^[一二三四五六七八九十百千万]+[、\.]/,
  ];

  async parseMetadata(filePath: string): Promise<BookParseResult> {
    try {
      if (!this.validateFileFormat(filePath, this.supportedExtensions)) {
        return {
          success: false,
          error: 'Invalid TXT file format',
        };
      }

      const fileName = filePath.split('/').pop() || 'Unknown';
      const title = fileName.replace('.txt', '').replace(/_/g, ' ');

      // 尝试从文件内容中提取更多信息
      const content = await RNFS.readFile(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim());
      
      let author = 'Unknown Author';
      let description = '';

      // 查找作者信息
      const authorPatterns = [
        /作者[：:]\s*(.+)/,
        /著[：:]\s*(.+)/,
        /Author[：:]\s*(.+)/i,
        /By[：:]\s*(.+)/i,
      ];

      for (const line of lines.slice(0, 20)) { // 只检查前20行
        for (const pattern of authorPatterns) {
          const match = line.match(pattern);
          if (match && match[1]) {
            author = match[1].trim();
            break;
          }
        }
        if (author !== 'Unknown Author') break;
      }

      // 生成简单描述
      const firstParagraph = lines.find(line => line.length > 50);
      if (firstParagraph) {
        description = firstParagraph.substring(0, 200) + '...';
      }

      const metadata: BookMetadata = {
        title,
        author,
        language: this.detectLanguage(content),
        description,
      };

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async extractCover(filePath: string): Promise<string | null> {
    // TXT文件没有封面图片
    return null;
  }

  async getTableOfContents(filePath: string): Promise<Chapter[]> {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      const chapters: Chapter[] = [];

      let currentPosition = 0;
      let chapterCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (this.isChapterTitle(line)) {
          chapterCount++;
          chapters.push({
            id: this.generateId(),
            title: line || `第 ${chapterCount} 章`,
            href: `line_${i}`,
          });
        }
      }

      // 如果没有检测到章节，按字符数创建章节
      if (chapters.length === 0) {
        const totalLength = content.length;
        const chapterLength = Math.max(5000, Math.floor(totalLength / 20)); // 每章至少5000字符
        let currentPos = 0;
        let chapterNum = 1;

        while (currentPos < totalLength) {
          const endPos = Math.min(currentPos + chapterLength, totalLength);
          
          chapters.push({
            id: this.generateId(),
            title: `第 ${chapterNum} 部分`,
            href: `char_${currentPos}`,
          });

          currentPos = endPos;
          chapterNum++;
        }
      }

      return chapters;
    } catch (error) {
      console.error('Error getting TXT table of contents:', error);
      return [];
    }
  }

  async getContent(filePath: string, position?: string): Promise<string> {
    try {
      const content = await RNFS.readFile(filePath, 'utf8');
      
      if (!position) {
        return content;
      }

      // 解析位置信息
      if (position.startsWith('line_')) {
        const lineNumber = parseInt(position.replace('line_', ''));
        const lines = content.split('\n');
        
        // 返回从指定行开始的内容
        return lines.slice(lineNumber).join('\n');
      } else if (position.startsWith('char_')) {
        const charPosition = parseInt(position.replace('char_', ''));
        
        // 返回从指定字符位置开始的内容
        return content.substring(charPosition);
      }

      return content;
    } catch (error) {
      console.error('Error getting TXT content:', error);
      return '';
    }
  }

  // TXT特有方法：检测是否为章节标题
  private isChapterTitle(line: string): boolean {
    if (!line || line.length < 2 || line.length > 100) {
      return false;
    }

    return this.chapterPatterns.some(pattern => pattern.test(line));
  }

  // TXT特有方法：检测语言
  private detectLanguage(content: string): string {
    const chineseCharCount = (content.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalCharCount = content.length;
    
    if (chineseCharCount / totalCharCount > 0.3) {
      return 'zh-CN';
    }
    
    return 'en';
  }

  // TXT特有方法：分段处理
  private splitIntoParagraphs(content: string): string[] {
    return content
      .split(/\n\s*\n/) // 按空行分割
      .map(paragraph => paragraph.trim())
      .filter(paragraph => paragraph.length > 0);
  }

  // TXT特有方法：格式化内容
  async getFormattedContent(filePath: string, position?: string): Promise<string> {
    try {
      const rawContent = await this.getContent(filePath, position);
      const paragraphs = this.splitIntoParagraphs(rawContent);
      
      // 添加HTML格式
      const formattedContent = paragraphs
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('\n');

      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            p {
              margin-bottom: 1em;
              text-indent: 2em;
            }
          </style>
        </head>
        <body>
          ${formattedContent}
        </body>
        </html>
      `;
    } catch (error) {
      console.error('Error formatting TXT content:', error);
      return '';
    }
  }
}
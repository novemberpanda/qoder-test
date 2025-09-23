import {DatabaseManager} from './DatabaseManager';
import {Book, ReadingProgress, UserSetting, Bookmark} from '@types/models';
import {DATABASE_CONFIG} from '@constants';
import {DatabaseResult} from '@types';

export class BookRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  // 添加书籍
  async addBook(book: Omit<Book, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<Book>> {
    try {
      const sql = `
        INSERT INTO ${DATABASE_CONFIG.TABLES.BOOKS} 
        (title, author, file_path, file_format, file_size, cover_path, total_pages)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        book.title,
        book.author || null,
        book.file_path,
        book.file_format,
        book.file_size,
        book.cover_path || null,
        book.total_pages || null,
      ];

      const result = await this.dbManager.executeQuery(sql, params);
      
      if (result.success && result.data) {
        const insertId = result.data.insertId;
        const newBook = await this.getBookById(insertId);
        
        if (newBook.success && newBook.data) {
          return {
            success: true,
            data: newBook.data,
          };
        }
      }

      return {
        success: false,
        error: 'Failed to retrieve added book',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取所有书籍
  async getAllBooks(): Promise<DatabaseResult<Book[]>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.BOOKS}
        ORDER BY created_at DESC
      `;
      
      const result = await this.dbManager.executeQuery(sql);
      
      if (result.success && result.data) {
        const books: Book[] = [];
        const rows = result.data.rows;
        
        for (let i = 0; i < rows.length; i++) {
          books.push(rows.item(i));
        }
        
        return {
          success: true,
          data: books,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch books',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 根据ID获取书籍
  async getBookById(id: number): Promise<DatabaseResult<Book>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.BOOKS}
        WHERE id = ?
      `;
      
      const result = await this.dbManager.executeQuery(sql, [id]);
      
      if (result.success && result.data && result.data.rows.length > 0) {
        return {
          success: true,
          data: result.data.rows.item(0),
        };
      }

      return {
        success: false,
        error: 'Book not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 更新书籍信息
  async updateBook(id: number, updates: Partial<Book>): Promise<DatabaseResult> {
    try {
      const setClause = Object.keys(updates)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const sql = `
        UPDATE ${DATABASE_CONFIG.TABLES.BOOKS}
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      const params = [...Object.values(updates), id];
      
      const result = await this.dbManager.executeQuery(sql, params);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 删除书籍
  async deleteBook(id: number): Promise<DatabaseResult> {
    try {
      const sql = `
        DELETE FROM ${DATABASE_CONFIG.TABLES.BOOKS}
        WHERE id = ?
      `;
      
      const result = await this.dbManager.executeQuery(sql, [id]);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 检查文件是否已存在
  async isFileExists(filePath: string): Promise<DatabaseResult<boolean>> {
    try {
      const sql = `
        SELECT COUNT(*) as count FROM ${DATABASE_CONFIG.TABLES.BOOKS}
        WHERE file_path = ?
      `;
      
      const result = await this.dbManager.executeQuery(sql, [filePath]);
      
      if (result.success && result.data) {
        const count = result.data.rows.item(0).count;
        return {
          success: true,
          data: count > 0,
        };
      }

      return {
        success: false,
        error: 'Failed to check file existence',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
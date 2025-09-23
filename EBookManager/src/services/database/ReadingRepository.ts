import {DatabaseManager} from './DatabaseManager';
import {ReadingProgress, Bookmark} from '@types/models';
import {DATABASE_CONFIG} from '@constants';
import {DatabaseResult} from '@types';

export class ReadingRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  // 更新阅读进度
  async updateReadingProgress(progress: Omit<ReadingProgress, 'id'>): Promise<DatabaseResult> {
    try {
      // 检查是否已存在该书籍的进度记录
      const existingSql = `
        SELECT id FROM ${DATABASE_CONFIG.TABLES.READING_PROGRESS}
        WHERE book_id = ?
      `;
      
      const existingResult = await this.dbManager.executeQuery(existingSql, [progress.book_id]);
      
      let sql: string;
      let params: any[];
      
      if (existingResult.success && existingResult.data && existingResult.data.rows.length > 0) {
        // 更新现有记录
        sql = `
          UPDATE ${DATABASE_CONFIG.TABLES.READING_PROGRESS}
          SET current_position = ?, progress_percentage = ?, last_read_at = ?, reading_time = ?
          WHERE book_id = ?
        `;
        params = [
          progress.current_position,
          progress.progress_percentage,
          progress.last_read_at,
          progress.reading_time,
          progress.book_id,
        ];
      } else {
        // 创建新记录
        sql = `
          INSERT INTO ${DATABASE_CONFIG.TABLES.READING_PROGRESS}
          (book_id, current_position, progress_percentage, last_read_at, reading_time)
          VALUES (?, ?, ?, ?, ?)
        `;
        params = [
          progress.book_id,
          progress.current_position,
          progress.progress_percentage,
          progress.last_read_at,
          progress.reading_time,
        ];
      }

      return await this.dbManager.executeQuery(sql, params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取书籍阅读进度
  async getReadingProgress(bookId: number): Promise<DatabaseResult<ReadingProgress>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.READING_PROGRESS}
        WHERE book_id = ?
      `;
      
      const result = await this.dbManager.executeQuery(sql, [bookId]);
      
      if (result.success && result.data && result.data.rows.length > 0) {
        return {
          success: true,
          data: result.data.rows.item(0),
        };
      }

      return {
        success: false,
        error: 'Reading progress not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 添加书签
  async addBookmark(bookmark: Omit<Bookmark, 'id' | 'created_at'>): Promise<DatabaseResult<Bookmark>> {
    try {
      const sql = `
        INSERT INTO ${DATABASE_CONFIG.TABLES.BOOKMARKS}
        (book_id, position, note)
        VALUES (?, ?, ?)
      `;
      
      const params = [
        bookmark.book_id,
        bookmark.position,
        bookmark.note || null,
      ];

      const result = await this.dbManager.executeQuery(sql, params);
      
      if (result.success && result.data) {
        const insertId = result.data.insertId;
        const newBookmark = await this.getBookmarkById(insertId);
        
        if (newBookmark.success && newBookmark.data) {
          return {
            success: true,
            data: newBookmark.data,
          };
        }
      }

      return {
        success: false,
        error: 'Failed to retrieve added bookmark',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取书籍的所有书签
  async getBookmarksByBookId(bookId: number): Promise<DatabaseResult<Bookmark[]>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.BOOKMARKS}
        WHERE book_id = ?
        ORDER BY created_at DESC
      `;
      
      const result = await this.dbManager.executeQuery(sql, [bookId]);
      
      if (result.success && result.data) {
        const bookmarks: Bookmark[] = [];
        const rows = result.data.rows;
        
        for (let i = 0; i < rows.length; i++) {
          bookmarks.push(rows.item(i));
        }
        
        return {
          success: true,
          data: bookmarks,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch bookmarks',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 根据ID获取书签
  async getBookmarkById(id: number): Promise<DatabaseResult<Bookmark>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.BOOKMARKS}
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
        error: 'Bookmark not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 删除书签
  async deleteBookmark(id: number): Promise<DatabaseResult> {
    try {
      const sql = `
        DELETE FROM ${DATABASE_CONFIG.TABLES.BOOKMARKS}
        WHERE id = ?
      `;
      
      return await this.dbManager.executeQuery(sql, [id]);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
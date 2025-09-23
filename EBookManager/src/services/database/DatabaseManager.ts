import SQLite from 'react-native-sqlite-storage';
import {DATABASE_CONFIG} from '@constants';
import {DatabaseResult} from '@types';

// 启用调试模式
SQLite.DEBUG(true);
SQLite.enablePromise(true);

export class DatabaseManager {
  private static instance: DatabaseManager;
  private database: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  // 初始化数据库
  public async initDatabase(): Promise<DatabaseResult> {
    try {
      this.database = await SQLite.openDatabase({
        name: DATABASE_CONFIG.NAME,
        location: 'default',
      });

      await this.createTables();
      
      return {
        success: true,
        data: 'Database initialized successfully',
      };
    } catch (error) {
      console.error('Database initialization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 创建数据表
  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    // 创建书籍表
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.TABLES.BOOKS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT,
        file_path TEXT UNIQUE NOT NULL,
        file_format TEXT NOT NULL,
        file_size INTEGER,
        cover_path TEXT,
        total_pages INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 创建阅读进度表
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.TABLES.READING_PROGRESS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        current_position TEXT,
        progress_percentage REAL DEFAULT 0,
        last_read_at DATETIME,
        reading_time INTEGER DEFAULT 0,
        FOREIGN KEY (book_id) REFERENCES ${DATABASE_CONFIG.TABLES.BOOKS}(id) ON DELETE CASCADE
      )
    `);

    // 创建用户设置表
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.TABLES.USER_SETTINGS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT,
        category TEXT
      )
    `);

    // 创建书签表
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.TABLES.BOOKMARKS} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id INTEGER NOT NULL,
        position TEXT NOT NULL,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (book_id) REFERENCES ${DATABASE_CONFIG.TABLES.BOOKS}(id) ON DELETE CASCADE
      )
    `);

    // 创建索引
    await this.database.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_books_created_at ON ${DATABASE_CONFIG.TABLES.BOOKS}(created_at)
    `);
    
    await this.database.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON ${DATABASE_CONFIG.TABLES.READING_PROGRESS}(book_id)
    `);
  }

  // 获取数据库实例
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.database) {
      throw new Error('Database not initialized. Call initDatabase first.');
    }
    return this.database;
  }

  // 关闭数据库
  public async closeDatabase(): Promise<void> {
    if (this.database) {
      await this.database.close();
      this.database = null;
    }
  }

  // 执行SQL查询
  public async executeQuery(
    sql: string,
    params: any[] = []
  ): Promise<DatabaseResult> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      const [result] = await this.database.executeSql(sql, params);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Database query error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 批量执行SQL
  public async executeBatch(queries: Array<{sql: string; params?: any[]}>): Promise<DatabaseResult> {
    try {
      if (!this.database) {
        throw new Error('Database not initialized');
      }

      await this.database.transaction((tx) => {
        queries.forEach(({sql, params = []}) => {
          tx.executeSql(sql, params);
        });
      });

      return {
        success: true,
        data: 'Batch execution completed',
      };
    } catch (error) {
      console.error('Database batch execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
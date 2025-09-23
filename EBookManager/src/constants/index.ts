// 应用常量
export const APP_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_FORMATS: ['epub', 'pdf', 'txt', 'mobi'] as const,
  DEFAULT_FONT_SIZE: 16,
  DEFAULT_LINE_HEIGHT: 1.5,
  DEFAULT_BRIGHTNESS: 0.8,
} as const;

// 文件路径常量
export const STORAGE_PATHS = {
  BOOKS_DIR: 'books',
  COVERS_DIR: 'covers', 
  CACHE_DIR: 'cache',
  DATABASE_DIR: 'database',
  EPUB_DIR: 'books/epub',
  PDF_DIR: 'books/pdf',
  TXT_DIR: 'books/txt',
} as const;

// 数据库常量
export const DATABASE_CONFIG = {
  NAME: 'ebooks.db',
  VERSION: 1,
  TABLES: {
    BOOKS: 'books',
    READING_PROGRESS: 'reading_progress',
    USER_SETTINGS: 'user_settings',
    BOOKMARKS: 'bookmarks',
  },
} as const;

// 主题颜色常量
export const THEMES = {
  LIGHT: {
    name: 'light',
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    primaryColor: '#007AFF',
    secondaryColor: '#F2F2F7',
  },
  DARK: {
    name: 'dark',
    backgroundColor: '#1C1C1E',
    textColor: '#FFFFFF',
    primaryColor: '#0A84FF',
    secondaryColor: '#2C2C2E',
  },
  SEPIA: {
    name: 'sepia',
    backgroundColor: '#F7F3E9',
    textColor: '#5D4E37',
    primaryColor: '#8B4513',
    secondaryColor: '#F0EAD6',
  },
} as const;

// 默认阅读器设置
export const DEFAULT_READER_SETTINGS = {
  fontSize: 16,
  fontFamily: 'System',
  lineHeight: 1.5,
  brightness: 0.8,
  backgroundColor: THEMES.LIGHT.backgroundColor,
  textColor: THEMES.LIGHT.textColor,
  theme: 'light' as const,
};

// 错误消息常量
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: '文件大小超过限制',
  UNSUPPORTED_FORMAT: '不支持的文件格式',
  FILE_CORRUPTED: '文件已损坏',
  IMPORT_FAILED: '导入失败',
  DATABASE_ERROR: '数据库操作失败',
  STORAGE_ERROR: '存储空间不足',
  NETWORK_ERROR: '网络连接失败',
} as const;
// 书籍信息模型
export interface Book {
  id: number;
  title: string;
  author?: string;
  file_path: string;
  file_format: 'epub' | 'pdf' | 'txt' | 'mobi';
  file_size: number;
  cover_path?: string;
  total_pages?: number;
  created_at: string;
  updated_at: string;
}

// 阅读进度模型
export interface ReadingProgress {
  id: number;
  book_id: number;
  current_position: string;
  progress_percentage: number;
  last_read_at: string;
  reading_time: number; // 累计阅读时长(秒)
}

// 用户设置模型
export interface UserSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  category: 'reader' | 'app' | 'theme';
}

// 书签模型
export interface Bookmark {
  id: number;
  book_id: number;
  position: string;
  note?: string;
  created_at: string;
}

// 章节信息
export interface Chapter {
  id: string;
  title: string;
  href: string;
  children?: Chapter[];
}

// 书籍元数据
export interface BookMetadata {
  title: string;
  author?: string;
  publisher?: string;
  language?: string;
  description?: string;
  cover?: string;
  identifier?: string;
}

// 阅读器设置
export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  brightness: number;
  backgroundColor: string;
  textColor: string;
  theme: 'light' | 'dark' | 'sepia';
}

// 导入状态
export interface ImportStatus {
  isImporting: boolean;
  progress: number;
  currentFile?: string;
  error?: string;
}
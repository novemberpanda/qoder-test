import {Book, ReadingProgress, UserSetting, Bookmark, Chapter, ReaderSettings, ImportStatus} from './models';

// Redux状态类型定义
export interface BooksState {
  bookList: Book[];
  currentBook: Book | null;
  loading: boolean;
  error: string | null;
}

export interface ReaderState {
  currentPosition: string;
  isReading: boolean;
  tableOfContents: Chapter[];
  settings: ReaderSettings;
  bookmarks: Bookmark[];
}

export interface SettingsState {
  userSettings: UserSetting[];
  readerSettings: ReaderSettings;
}

export interface UIState {
  isMenuVisible: boolean;
  isSettingsOpen: boolean;
  importStatus: ImportStatus;
}

export interface RootState {
  books: BooksState;
  reader: ReaderState;
  settings: SettingsState;
  ui: UIState;
}

// Action类型
export interface LoadBooksAction {
  type: 'books/loadBooks';
}

export interface AddBookAction {
  type: 'books/addBook';
  payload: Book;
}

export interface UpdateReadingProgressAction {
  type: 'reader/updateProgress';
  payload: {
    bookId: number;
    position: string;
    percentage: number;
  };
}

export interface SetCurrentBookAction {
  type: 'books/setCurrentBook';
  payload: Book;
}

export interface UpdateReaderSettingsAction {
  type: 'reader/updateSettings';
  payload: Partial<ReaderSettings>;
}

export interface ToggleMenuAction {
  type: 'ui/toggleMenu';
  payload: boolean;
}

// 导航类型
export type RootStackParamList = {
  BookShelf: undefined;
  Reader: {
    bookId: number;
  };
  Settings: undefined;
  Import: undefined;
};

// 数据库操作结果类型
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 文件操作结果类型
export interface FileOperationResult {
  success: boolean;
  path?: string;
  error?: string;
}

// 书籍解析结果类型
export interface BookParseResult {
  success: boolean;
  metadata?: any;
  error?: string;
}
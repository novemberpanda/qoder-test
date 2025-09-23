import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Chapter, Bookmark, ReaderSettings} from '@types/models';
import {ReaderState} from '@types';
import {DEFAULT_READER_SETTINGS} from '@constants';

const initialState: ReaderState = {
  currentPosition: '',
  isReading: false,
  tableOfContents: [],
  settings: DEFAULT_READER_SETTINGS,
  bookmarks: [],
};

const readerSlice = createSlice({
  name: 'reader',
  initialState,
  reducers: {
    // 设置阅读状态
    setReading: (state, action: PayloadAction<boolean>) => {
      state.isReading = action.payload;
    },

    // 更新当前阅读位置
    updateCurrentPosition: (state, action: PayloadAction<string>) => {
      state.currentPosition = action.payload;
    },

    // 更新阅读进度
    updateReadingProgress: (state, action: PayloadAction<{
      position: string;
      percentage: number;
    }>) => {
      state.currentPosition = action.payload.position;
    },

    // 设置目录
    setTableOfContents: (state, action: PayloadAction<Chapter[]>) => {
      state.tableOfContents = action.payload;
    },

    // 更新阅读器设置
    updateReaderSettings: (state, action: PayloadAction<Partial<ReaderSettings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },

    // 重置阅读器设置
    resetReaderSettings: (state) => {
      state.settings = DEFAULT_READER_SETTINGS;
    },

    // 设置字体大小
    setFontSize: (state, action: PayloadAction<number>) => {
      state.settings.fontSize = action.payload;
    },

    // 设置字体系列
    setFontFamily: (state, action: PayloadAction<string>) => {
      state.settings.fontFamily = action.payload;
    },

    // 设置行高
    setLineHeight: (state, action: PayloadAction<number>) => {
      state.settings.lineHeight = action.payload;
    },

    // 设置亮度
    setBrightness: (state, action: PayloadAction<number>) => {
      state.settings.brightness = action.payload;
    },

    // 设置主题
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'sepia'>) => {
      state.settings.theme = action.payload;
    },

    // 设置背景颜色
    setBackgroundColor: (state, action: PayloadAction<string>) => {
      state.settings.backgroundColor = action.payload;
    },

    // 设置文字颜色
    setTextColor: (state, action: PayloadAction<string>) => {
      state.settings.textColor = action.payload;
    },

    // 加载书签
    loadBookmarks: (state, action: PayloadAction<Bookmark[]>) => {
      state.bookmarks = action.payload;
    },

    // 添加书签
    addBookmark: (state, action: PayloadAction<Bookmark>) => {
      state.bookmarks.unshift(action.payload);
    },

    // 删除书签
    removeBookmark: (state, action: PayloadAction<number>) => {
      state.bookmarks = state.bookmarks.filter(bookmark => bookmark.id !== action.payload);
    },

    // 清空阅读器状态
    clearReaderState: (state) => {
      state.currentPosition = '';
      state.isReading = false;
      state.tableOfContents = [];
      state.bookmarks = [];
    },

    // 跳转到指定位置
    jumpToPosition: (state, action: PayloadAction<string>) => {
      state.currentPosition = action.payload;
    },

    // 跳转到章节
    jumpToChapter: (state, action: PayloadAction<string>) => {
      state.currentPosition = action.payload;
    },
  },
});

export const {
  setReading,
  updateCurrentPosition,
  updateReadingProgress,
  setTableOfContents,
  updateReaderSettings,
  resetReaderSettings,
  setFontSize,
  setFontFamily,
  setLineHeight,
  setBrightness,
  setTheme,
  setBackgroundColor,
  setTextColor,
  loadBookmarks,
  addBookmark,
  removeBookmark,
  clearReaderState,
  jumpToPosition,
  jumpToChapter,
} = readerSlice.actions;

export default readerSlice.reducer;
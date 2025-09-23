import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Book} from '@types/models';
import {BooksState} from '@types';

const initialState: BooksState = {
  bookList: [],
  currentBook: null,
  loading: false,
  error: null,
};

const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // 设置错误信息
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // 加载书籍列表
    loadBooks: (state, action: PayloadAction<Book[]>) => {
      state.bookList = action.payload;
      state.loading = false;
      state.error = null;
    },

    // 添加书籍
    addBook: (state, action: PayloadAction<Book>) => {
      state.bookList.unshift(action.payload);
      state.error = null;
    },

    // 更新书籍信息
    updateBook: (state, action: PayloadAction<Book>) => {
      const index = state.bookList.findIndex(book => book.id === action.payload.id);
      if (index !== -1) {
        state.bookList[index] = action.payload;
      }
      
      // 如果是当前书籍，也更新当前书籍
      if (state.currentBook && state.currentBook.id === action.payload.id) {
        state.currentBook = action.payload;
      }
    },

    // 删除书籍
    removeBook: (state, action: PayloadAction<number>) => {
      state.bookList = state.bookList.filter(book => book.id !== action.payload);
      
      // 如果删除的是当前书籍，清空当前书籍
      if (state.currentBook && state.currentBook.id === action.payload) {
        state.currentBook = null;
      }
    },

    // 设置当前书籍
    setCurrentBook: (state, action: PayloadAction<Book | null>) => {
      state.currentBook = action.payload;
    },

    // 清空书籍列表
    clearBooks: (state) => {
      state.bookList = [];
      state.currentBook = null;
      state.error = null;
    },

    // 按标题排序
    sortBooksByTitle: (state) => {
      state.bookList.sort((a, b) => a.title.localeCompare(b.title));
    },

    // 按添加时间排序
    sortBooksByDate: (state) => {
      state.bookList.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },

    // 按作者排序
    sortBooksByAuthor: (state) => {
      state.bookList.sort((a, b) => {
        const authorA = a.author || '';
        const authorB = b.author || '';
        return authorA.localeCompare(authorB);
      });
    },
  },
});

export const {
  setLoading,
  setError,
  loadBooks,
  addBook,
  updateBook,
  removeBook,
  setCurrentBook,
  clearBooks,
  sortBooksByTitle,
  sortBooksByDate,
  sortBooksByAuthor,
} = booksSlice.actions;

export default booksSlice.reducer;
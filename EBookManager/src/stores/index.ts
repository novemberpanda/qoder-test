import {configureStore} from '@reduxjs/toolkit';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';

import booksReducer from './slices/booksSlice';
import readerReducer from './slices/readerSlice';
import settingsReducer from './slices/settingsSlice';
import uiReducer from './slices/uiSlice';

import type {RootState} from '@types';

export const store = configureStore({
  reducer: {
    books: booksReducer,
    reader: readerReducer,
    settings: settingsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
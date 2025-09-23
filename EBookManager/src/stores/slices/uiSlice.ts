import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ImportStatus} from '@types/models';
import {UIState} from '@types';

const initialState: UIState = {
  isMenuVisible: false,
  isSettingsOpen: false,
  importStatus: {
    isImporting: false,
    progress: 0,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 切换菜单显示状态
    toggleMenu: (state, action: PayloadAction<boolean | undefined>) => {
      state.isMenuVisible = action.payload !== undefined ? action.payload : !state.isMenuVisible;
    },

    // 显示菜单
    showMenu: (state) => {
      state.isMenuVisible = true;
    },

    // 隐藏菜单
    hideMenu: (state) => {
      state.isMenuVisible = false;
    },

    // 切换设置界面显示状态
    toggleSettings: (state, action: PayloadAction<boolean | undefined>) => {
      state.isSettingsOpen = action.payload !== undefined ? action.payload : !state.isSettingsOpen;
    },

    // 显示设置界面
    showSettings: (state) => {
      state.isSettingsOpen = true;
    },

    // 隐藏设置界面
    hideSettings: (state) => {
      state.isSettingsOpen = false;
    },

    // 开始导入
    startImport: (state, action: PayloadAction<string | undefined>) => {
      state.importStatus = {
        isImporting: true,
        progress: 0,
        currentFile: action.payload,
        error: undefined,
      };
    },

    // 更新导入进度
    updateImportProgress: (state, action: PayloadAction<{
      progress: number;
      currentFile?: string;
    }>) => {
      if (state.importStatus.isImporting) {
        state.importStatus.progress = action.payload.progress;
        if (action.payload.currentFile) {
          state.importStatus.currentFile = action.payload.currentFile;
        }
      }
    },

    // 导入成功
    importSuccess: (state) => {
      state.importStatus = {
        isImporting: false,
        progress: 100,
      };
    },

    // 导入失败
    importError: (state, action: PayloadAction<string>) => {
      state.importStatus = {
        isImporting: false,
        progress: 0,
        error: action.payload,
      };
    },

    // 重置导入状态
    resetImportStatus: (state) => {
      state.importStatus = {
        isImporting: false,
        progress: 0,
      };
    },

    // 重置UI状态
    resetUIState: (state) => {
      state.isMenuVisible = false;
      state.isSettingsOpen = false;
      state.importStatus = {
        isImporting: false,
        progress: 0,
      };
    },

    // 批量更新UI状态
    updateUIState: (state, action: PayloadAction<Partial<UIState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const {
  toggleMenu,
  showMenu,
  hideMenu,
  toggleSettings,
  showSettings,
  hideSettings,
  startImport,
  updateImportProgress,
  importSuccess,
  importError,
  resetImportStatus,
  resetUIState,
  updateUIState,
} = uiSlice.actions;

export default uiSlice.reducer;
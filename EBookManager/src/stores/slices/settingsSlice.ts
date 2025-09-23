import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserSetting, ReaderSettings} from '@types/models';
import {SettingsState} from '@types';
import {DEFAULT_READER_SETTINGS} from '@constants';

const initialState: SettingsState = {
  userSettings: [],
  readerSettings: DEFAULT_READER_SETTINGS,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // 加载用户设置
    loadUserSettings: (state, action: PayloadAction<UserSetting[]>) => {
      state.userSettings = action.payload;
      
      // 从用户设置中提取阅读器设置
      const readerSettings: Partial<ReaderSettings> = {};
      action.payload.forEach(setting => {
        if (setting.category === 'reader') {
          switch (setting.setting_key) {
            case 'fontSize':
              readerSettings.fontSize = Number(setting.setting_value);
              break;
            case 'fontFamily':
              readerSettings.fontFamily = setting.setting_value;
              break;
            case 'lineHeight':
              readerSettings.lineHeight = Number(setting.setting_value);
              break;
            case 'brightness':
              readerSettings.brightness = Number(setting.setting_value);
              break;
            case 'backgroundColor':
              readerSettings.backgroundColor = setting.setting_value;
              break;
            case 'textColor':
              readerSettings.textColor = setting.setting_value;
              break;
            case 'theme':
              readerSettings.theme = setting.setting_value as 'light' | 'dark' | 'sepia';
              break;
          }
        }
      });
      
      state.readerSettings = {
        ...DEFAULT_READER_SETTINGS,
        ...readerSettings,
      };
    },

    // 更新用户设置
    updateUserSetting: (state, action: PayloadAction<UserSetting>) => {
      const index = state.userSettings.findIndex(
        setting => setting.setting_key === action.payload.setting_key
      );
      
      if (index !== -1) {
        state.userSettings[index] = action.payload;
      } else {
        state.userSettings.push(action.payload);
      }
    },

    // 批量更新用户设置
    updateUserSettings: (state, action: PayloadAction<UserSetting[]>) => {
      action.payload.forEach(newSetting => {
        const index = state.userSettings.findIndex(
          setting => setting.setting_key === newSetting.setting_key
        );
        
        if (index !== -1) {
          state.userSettings[index] = newSetting;
        } else {
          state.userSettings.push(newSetting);
        }
      });
    },

    // 更新阅读器设置
    updateReaderSettings: (state, action: PayloadAction<Partial<ReaderSettings>>) => {
      state.readerSettings = {
        ...state.readerSettings,
        ...action.payload,
      };
    },

    // 重置阅读器设置
    resetReaderSettings: (state) => {
      state.readerSettings = DEFAULT_READER_SETTINGS;
    },

    // 删除用户设置
    removeUserSetting: (state, action: PayloadAction<string>) => {
      state.userSettings = state.userSettings.filter(
        setting => setting.setting_key !== action.payload
      );
    },

    // 清空所有设置
    clearAllSettings: (state) => {
      state.userSettings = [];
      state.readerSettings = DEFAULT_READER_SETTINGS;
    },

    // 根据分类获取设置
    getSettingsByCategory: (state, action: PayloadAction<string>) => {
      return state.userSettings.filter(setting => setting.category === action.payload);
    },

    // 导入设置
    importSettings: (state, action: PayloadAction<{
      userSettings: UserSetting[];
      readerSettings: ReaderSettings;
    }>) => {
      state.userSettings = action.payload.userSettings;
      state.readerSettings = action.payload.readerSettings;
    },

    // 导出设置
    exportSettings: (state) => {
      return {
        userSettings: state.userSettings,
        readerSettings: state.readerSettings,
      };
    },
  },
});

export const {
  loadUserSettings,
  updateUserSetting,
  updateUserSettings,
  updateReaderSettings,
  resetReaderSettings,
  removeUserSetting,
  clearAllSettings,
  getSettingsByCategory,
  importSettings,
  exportSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
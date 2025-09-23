import {DatabaseManager} from '@services/database';
import {UserSetting, ReaderSettings} from '@/types/models';
import {DATABASE_CONFIG, DEFAULT_READER_SETTINGS} from '@constants';
import {DatabaseResult} from '@/types';

export class SettingsService {
  private static instance: SettingsService;
  private dbManager: DatabaseManager;

  private constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // 保存用户设置
  async saveUserSetting(
    key: string,
    value: string,
    category: 'reader' | 'app' | 'theme' = 'app'
  ): Promise<DatabaseResult> {
    try {
      const sql = `
        INSERT OR REPLACE INTO ${DATABASE_CONFIG.TABLES.USER_SETTINGS}
        (setting_key, setting_value, category)
        VALUES (?, ?, ?)
      `;
      
      return await this.dbManager.executeQuery(sql, [key, value, category]);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取用户设置
  async getUserSetting(key: string): Promise<DatabaseResult<UserSetting>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS}
        WHERE setting_key = ?
      `;
      
      const result = await this.dbManager.executeQuery(sql, [key]);
      
      if (result.success && result.data && result.data.rows.length > 0) {
        return {
          success: true,
          data: result.data.rows.item(0),
        };
      }

      return {
        success: false,
        error: 'Setting not found',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 获取所有用户设置
  async getAllUserSettings(): Promise<DatabaseResult<UserSetting[]>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS}
        ORDER BY category, setting_key
      `;
      
      const result = await this.dbManager.executeQuery(sql);
      
      if (result.success && result.data) {
        const settings: UserSetting[] = [];
        const rows = result.data.rows;
        
        for (let i = 0; i < rows.length; i++) {
          settings.push(rows.item(i));
        }
        
        return {
          success: true,
          data: settings,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch settings',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 根据分类获取设置
  async getSettingsByCategory(category: string): Promise<DatabaseResult<UserSetting[]>> {
    try {
      const sql = `
        SELECT * FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS}
        WHERE category = ?
        ORDER BY setting_key
      `;
      
      const result = await this.dbManager.executeQuery(sql, [category]);
      
      if (result.success && result.data) {
        const settings: UserSetting[] = [];
        const rows = result.data.rows;
        
        for (let i = 0; i < rows.length; i++) {
          settings.push(rows.item(i));
        }
        
        return {
          success: true,
          data: settings,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch settings',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 保存阅读器设置
  async saveReaderSettings(settings: ReaderSettings): Promise<DatabaseResult> {
    try {
      const settingsToSave = [
        { key: 'fontSize', value: settings.fontSize.toString(), category: 'reader' },
        { key: 'fontFamily', value: settings.fontFamily, category: 'reader' },
        { key: 'lineHeight', value: settings.lineHeight.toString(), category: 'reader' },
        { key: 'brightness', value: settings.brightness.toString(), category: 'reader' },
        { key: 'backgroundColor', value: settings.backgroundColor, category: 'reader' },
        { key: 'textColor', value: settings.textColor, category: 'reader' },
        { key: 'theme', value: settings.theme, category: 'reader' },
      ];

      for (const setting of settingsToSave) {
        const result = await this.saveUserSetting(setting.key, setting.value, setting.category as any);
        if (!result.success) {
          throw new Error(`Failed to save ${setting.key}: ${result.error}`);
        }
      }

      return {
        success: true,
        data: 'Reader settings saved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 加载阅读器设置
  async loadReaderSettings(): Promise<DatabaseResult<ReaderSettings>> {
    try {
      const result = await this.getSettingsByCategory('reader');
      
      if (!result.success || !result.data) {
        return {
          success: true,
          data: DEFAULT_READER_SETTINGS,
        };
      }

      const settings = result.data;
      const readerSettings: ReaderSettings = { ...DEFAULT_READER_SETTINGS };

      settings.forEach(setting => {
        switch (setting.setting_key) {
          case 'fontSize':
            readerSettings.fontSize = parseInt(setting.setting_value);
            break;
          case 'fontFamily':
            readerSettings.fontFamily = setting.setting_value;
            break;
          case 'lineHeight':
            readerSettings.lineHeight = parseFloat(setting.setting_value);
            break;
          case 'brightness':
            readerSettings.brightness = parseFloat(setting.setting_value);
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
      });

      return {
        success: true,
        data: readerSettings,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 重置设置
  async resetSettings(category?: string): Promise<DatabaseResult> {
    try {
      let sql: string;
      let params: any[] = [];

      if (category) {
        sql = `DELETE FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS} WHERE category = ?`;
        params = [category];
      } else {
        sql = `DELETE FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS}`;
      }
      
      return await this.dbManager.executeQuery(sql, params);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 删除特定设置
  async deleteSetting(key: string): Promise<DatabaseResult> {
    try {
      const sql = `
        DELETE FROM ${DATABASE_CONFIG.TABLES.USER_SETTINGS}
        WHERE setting_key = ?
      `;
      
      return await this.dbManager.executeQuery(sql, [key]);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 导出设置
  async exportSettings(): Promise<DatabaseResult<{userSettings: UserSetting[], readerSettings: ReaderSettings}>> {
    try {
      const userSettingsResult = await this.getAllUserSettings();
      const readerSettingsResult = await this.loadReaderSettings();

      if (!userSettingsResult.success || !readerSettingsResult.success) {
        return {
          success: false,
          error: 'Failed to export settings',
        };
      }

      return {
        success: true,
        data: {
          userSettings: userSettingsResult.data!,
          readerSettings: readerSettingsResult.data!,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // 导入设置
  async importSettings(data: {userSettings: UserSetting[], readerSettings: ReaderSettings}): Promise<DatabaseResult> {
    try {
      // 先清空现有设置
      await this.resetSettings();

      // 导入用户设置
      for (const setting of data.userSettings) {
        const result = await this.saveUserSetting(
          setting.setting_key,
          setting.setting_value,
          setting.category as any
        );
        if (!result.success) {
          throw new Error(`Failed to import setting ${setting.setting_key}`);
        }
      }

      // 导入阅读器设置
      const readerResult = await this.saveReaderSettings(data.readerSettings);
      if (!readerResult.success) {
        throw new Error('Failed to import reader settings');
      }

      return {
        success: true,
        data: 'Settings imported successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
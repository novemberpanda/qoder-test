import {THEMES, DEFAULT_READER_SETTINGS} from '@constants';
import {ReaderSettings} from '@/types/models';

export class ThemeService {
  private static instance: ThemeService;

  private constructor() {}

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  // 获取主题配置
  getThemeConfig(themeName: 'light' | 'dark' | 'sepia') {
    return THEMES[themeName.toUpperCase() as keyof typeof THEMES];
  }

  // 应用主题到阅读器设置
  applyThemeToSettings(
    currentSettings: ReaderSettings, 
    themeName: 'light' | 'dark' | 'sepia'
  ): ReaderSettings {
    const themeConfig = this.getThemeConfig(themeName);
    
    return {
      ...currentSettings,
      theme: themeName,
      backgroundColor: themeConfig.backgroundColor,
      textColor: themeConfig.textColor,
    };
  }

  // 获取所有可用主题
  getAvailableThemes() {
    return [
      {
        name: 'light',
        displayName: '浅色模式',
        config: THEMES.LIGHT,
      },
      {
        name: 'dark',
        displayName: '深色模式',
        config: THEMES.DARK,
      },
      {
        name: 'sepia',
        displayName: '护眼模式',
        config: THEMES.SEPIA,
      },
    ];
  }

  // 根据时间自动选择主题
  getAutoTheme(): 'light' | 'dark' {
    const hour = new Date().getHours();
    // 晚上6点到早上6点使用深色模式
    return (hour >= 18 || hour < 6) ? 'dark' : 'light';
  }

  // 验证主题名称是否有效
  isValidThemeName(themeName: string): themeName is 'light' | 'dark' | 'sepia' {
    return ['light', 'dark', 'sepia'].includes(themeName);
  }

  // 获取主题的CSS样式字符串
  getThemeCSS(settings: ReaderSettings): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: ${settings.fontSize}px;
        line-height: ${settings.lineHeight};
        color: ${settings.textColor};
        background-color: ${settings.backgroundColor};
        padding: 20px;
        margin: 0;
        transition: all 0.3s ease;
      }
      p {
        margin-bottom: 1em;
        text-indent: 2em;
      }
      h1, h2, h3, h4, h5, h6 {
        color: ${settings.textColor};
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      img {
        max-width: 100%;
        height: auto;
      }
    `;
  }

  // 获取适合的文字颜色（基于背景色）
  getContrastTextColor(backgroundColor: string): string {
    // 简单的颜色对比度计算
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // 计算亮度
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 根据亮度返回合适的文字颜色
    return brightness > 128 ? '#000000' : '#FFFFFF';
  }

  // 生成自定义主题
  createCustomTheme(
    backgroundColor: string,
    textColor?: string,
    primaryColor?: string
  ) {
    return {
      name: 'custom',
      backgroundColor,
      textColor: textColor || this.getContrastTextColor(backgroundColor),
      primaryColor: primaryColor || THEMES.LIGHT.primaryColor,
      secondaryColor: this.lightenColor(backgroundColor, 0.1),
    };
  }

  // 颜色工具函数：调亮颜色
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // 保存用户偏好的主题设置
  saveThemePreference(themeName: 'light' | 'dark' | 'sepia') {
    // 这里可以使用 AsyncStorage 或其他持久化存储
    console.log('Saving theme preference:', themeName);
  }

  // 加载用户偏好的主题设置
  loadThemePreference(): 'light' | 'dark' | 'sepia' {
    // 这里可以从 AsyncStorage 或其他持久化存储加载
    return 'light'; // 默认返回浅色主题
  }
}
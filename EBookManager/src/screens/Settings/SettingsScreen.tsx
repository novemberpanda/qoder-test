import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
// @ts-ignore - Slider component will be added later
// import Slider from '@react-native-community/slider';

import {useAppDispatch, useAppSelector} from '@stores';
import {
  updateReaderSettings,
  resetReaderSettings,
  setFontSize,
  setLineHeight,
  setBrightness,
  setTheme,
} from '@stores/slices/readerSlice';
import {SettingsService} from '@services/settings';
import {ThemeService} from '@services/theme';
import {FileSystemService} from '@services/fileSystem';
import {THEMES, DEFAULT_READER_SETTINGS} from '@constants';

interface SettingItemProps {
  title: string;
  children: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({title, children}) => {
  return (
    <View style={styles.settingItem}>
      <Text style={styles.settingTitle}>{title}</Text>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
};

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const {settings} = useAppSelector((state) => state.reader);
  
  const [tempFontSize, setTempFontSize] = useState(settings.fontSize);
  const [tempLineHeight, setTempLineHeight] = useState(settings.lineHeight);
  const [tempBrightness, setTempBrightness] = useState(settings.brightness);
  const [settingsService] = useState(() => SettingsService.getInstance());
  const [themeService] = useState(() => ThemeService.getInstance());
  const [fileService] = useState(() => FileSystemService.getInstance());

  const handleThemeChange = async (theme: 'light' | 'dark' | 'sepia') => {
    const themeColors = THEMES[theme.toUpperCase() as keyof typeof THEMES];
    const newSettings = {
      ...settings,
      theme,
      backgroundColor: themeColors.backgroundColor,
      textColor: themeColors.textColor,
    };
    
    dispatch(setTheme(theme));
    dispatch(updateReaderSettings({
      backgroundColor: themeColors.backgroundColor,
      textColor: themeColors.textColor,
    }));
    
    // 保存到数据库
    try {
      await settingsService.saveReaderSettings(newSettings);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setTempFontSize(size);
    dispatch(setFontSize(size));
  };

  const handleLineHeightChange = (height: number) => {
    setTempLineHeight(height);
    dispatch(setLineHeight(height));
  };

  const handleBrightnessChange = (brightness: number) => {
    setTempBrightness(brightness);
    dispatch(setBrightness(brightness));
  };

  const handleResetSettings = async () => {
    Alert.alert(
      '重置设置',
      '确定要将所有阅读设置重置为默认值吗？',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await settingsService.resetSettings('reader');
              dispatch(resetReaderSettings());
              setTempFontSize(DEFAULT_READER_SETTINGS.fontSize);
              setTempLineHeight(DEFAULT_READER_SETTINGS.lineHeight);
              setTempBrightness(DEFAULT_READER_SETTINGS.brightness);
              Alert.alert('成功', '设置已重置');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('错误', '重置设置失败');
            }
          },
        },
      ]
    );
  };

  const clearCache = async () => {
    Alert.alert(
      '清除缓存',
      '确定要清除应用缓存吗？这将删除所有临时文件。',
      [
        {text: '取消', style: 'cancel'},
        {
          text: '确定',
          onPress: async () => {
            try {
              const result = await fileService.clearCache();
              if (result.success) {
                Alert.alert('成功', '缓存已清除');
              } else {
                Alert.alert('错误', result.error || '清除缓存失败');
              }
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('错误', '清除缓存时发生错误');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>设置</Text>
      </View>

      {/* 阅读设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>阅读设置</Text>

        <SettingItem title="主题">
          <View style={styles.themeContainer}>
            {(['light', 'dark', 'sepia'] as const).map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.themeButton,
                  {backgroundColor: THEMES[theme.toUpperCase() as keyof typeof THEMES].backgroundColor},
                  settings.theme === theme && styles.themeButtonSelected,
                ]}
                onPress={() => handleThemeChange(theme)}>
                <Text
                  style={[
                    styles.themeButtonText,
                    {color: THEMES[theme.toUpperCase() as keyof typeof THEMES].textColor},
                  ]}>
                  {theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '护眼'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingItem>

        <SettingItem title={`字体大小: ${tempFontSize}px`}>
          {/* <Slider
            style={styles.slider}
            minimumValue={12}
            maximumValue={24}
            step={1}
            value={tempFontSize}
            onValueChange={handleFontSizeChange}
            minimumTrackTintColor={THEMES.LIGHT.primaryColor}
            maximumTrackTintColor="#E5E5EA"
            thumbStyle={{backgroundColor: THEMES.LIGHT.primaryColor}}
          /> */}
          <Text>字体大小控制（待实现）</Text>
        </SettingItem>

        <SettingItem title={`行间距: ${tempLineHeight}`}>
          <Slider
            style={styles.slider}
            minimumValue={1.0}
            maximumValue={2.5}
            step={0.1}
            value={tempLineHeight}
            onValueChange={handleLineHeightChange}
            minimumTrackTintColor={THEMES.LIGHT.primaryColor}
            maximumTrackTintColor="#E5E5EA"
            thumbStyle={{backgroundColor: THEMES.LIGHT.primaryColor}}
          />
        </SettingItem>

        <SettingItem title={`屏幕亮度: ${Math.round(tempBrightness * 100)}%`}>
          <Slider
            style={styles.slider}
            minimumValue={0.1}
            maximumValue={1.0}
            step={0.05}
            value={tempBrightness}
            onValueChange={handleBrightnessChange}
            minimumTrackTintColor={THEMES.LIGHT.primaryColor}
            maximumTrackTintColor="#E5E5EA"
            thumbStyle={{backgroundColor: THEMES.LIGHT.primaryColor}}
          />
        </SettingItem>
      </View>

      {/* 应用设置 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>应用设置</Text>

        <TouchableOpacity style={styles.buttonItem} onPress={clearCache}>
          <Text style={styles.buttonText}>清除缓存</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonItem} onPress={handleResetSettings}>
          <Text style={[styles.buttonText, styles.dangerButtonText]}>重置设置</Text>
        </TouchableOpacity>
      </View>

      {/* 关于 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>应用版本</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>开发者</Text>
          <Text style={styles.infoValue}>电子书管理器团队</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEMES.LIGHT.backgroundColor,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEMES.LIGHT.textColor,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingTitle: {
    fontSize: 16,
    color: THEMES.LIGHT.textColor,
    marginBottom: 12,
  },
  settingControl: {
    flex: 1,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  themeButtonSelected: {
    borderColor: THEMES.LIGHT.primaryColor,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  buttonItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  buttonText: {
    fontSize: 16,
    color: THEMES.LIGHT.primaryColor,
    textAlign: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30',
  },
  infoItem: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 16,
    color: THEMES.LIGHT.textColor,
  },
  infoValue: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default SettingsScreen;
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';

import {useAppDispatch, useAppSelector} from '@stores';
import {
  updateReaderSettings,
  setFontSize,
  setLineHeight,
  setBrightness,
  setTheme,
} from '@stores/slices/readerSlice';
import {ReaderSettings} from '@/types/models';
import {THEMES} from '@constants';

interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const {settings} = useAppSelector(state => state.reader);

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia') => {
    const themeColors = THEMES[theme.toUpperCase() as keyof typeof THEMES];
    dispatch(setTheme(theme));
    dispatch(updateReaderSettings({
      backgroundColor: themeColors.backgroundColor,
      textColor: themeColors.textColor,
    }));
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(24, settings.fontSize + delta));
    dispatch(setFontSize(newSize));
  };

  const handleLineHeightChange = (delta: number) => {
    const newLineHeight = Math.max(1.0, Math.min(2.5, settings.lineHeight + delta));
    dispatch(setLineHeight(Number(newLineHeight.toFixed(1))));
  };

  const handleBrightnessChange = (delta: number) => {
    const newBrightness = Math.max(0.1, Math.min(1.0, settings.brightness + delta));
    dispatch(setBrightness(Number(newBrightness.toFixed(1))));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>阅读设置</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 主题设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>主题</Text>
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
          </View>

          {/* 字体大小设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>字体大小: {settings.fontSize}px</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleFontSizeChange(-1)}>
                <Text style={styles.controlButtonText}>A-</Text>
              </TouchableOpacity>
              <View style={styles.controlValue}>
                <Text style={styles.controlValueText}>{settings.fontSize}</Text>
              </View>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleFontSizeChange(1)}>
                <Text style={styles.controlButtonText}>A+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 行间距设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>行间距: {settings.lineHeight}</Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleLineHeightChange(-0.1)}>
                <Text style={styles.controlButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.controlValue}>
                <Text style={styles.controlValueText}>{settings.lineHeight}</Text>
              </View>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleLineHeightChange(0.1)}>
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 亮度设置 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              屏幕亮度: {Math.round(settings.brightness * 100)}%
            </Text>
            <View style={styles.controlRow}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleBrightnessChange(-0.1)}>
                <Text style={styles.controlButtonText}>🔅</Text>
              </TouchableOpacity>
              <View style={styles.controlValue}>
                <Text style={styles.controlValueText}>
                  {Math.round(settings.brightness * 100)}%
                </Text>
              </View>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleBrightnessChange(0.1)}>
                <Text style={styles.controlButtonText}>🔆</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 预览区域 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>预览</Text>
            <View 
              style={[
                styles.previewContainer,
                {
                  backgroundColor: settings.backgroundColor,
                  borderColor: '#E5E5EA',
                  borderWidth: 1,
                }
              ]}>
              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: settings.fontSize,
                    lineHeight: settings.fontSize * settings.lineHeight,
                    color: settings.textColor,
                  }
                ]}>
                这是一段示例文字，用于预览当前的阅读设置效果。
                您可以调整字体大小、行间距和主题来获得最佳的阅读体验。
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEMES.LIGHT.backgroundColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: THEMES.LIGHT.primaryColor,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    marginBottom: 12,
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
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEMES.LIGHT.secondaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
  },
  controlValue: {
    minWidth: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  controlValueText: {
    fontSize: 16,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
  },
  previewContainer: {
    padding: 16,
    borderRadius: 8,
    minHeight: 120,
  },
  previewText: {
    textAlign: 'justify',
  },
});

export default ReaderSettingsModal;
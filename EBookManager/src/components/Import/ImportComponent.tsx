import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import DocumentPicker from 'react-native-document-picker';

import {useAppDispatch, useAppSelector} from '@stores';
import {addBook} from '@stores/slices/booksSlice';
import {startImport, updateImportProgress, importSuccess, importError} from '@stores/slices/uiSlice';
import {BookRepository} from '@services/database';
import {FileSystemService} from '@services/fileSystem';
import {BookParserService} from '@services/bookParser';
import {Book} from '@/types/models';
import {THEMES, APP_CONFIG, ERROR_MESSAGES} from '@constants';
import {formatFileSize, isValidEBookFormat, generateUUID} from '@utils';

interface ImportComponentProps {
  onImportComplete?: () => void;
}

const ImportComponent: React.FC<ImportComponentProps> = ({onImportComplete}) => {
  const dispatch = useAppDispatch();
  const {importStatus} = useAppSelector(state => state.ui);
  
  const [bookRepository] = useState(() => new BookRepository());
  const [fileService] = useState(() => FileSystemService.getInstance());
  const [bookParser] = useState(() => BookParserService.getInstance());

  // 选择文件
  const selectFiles = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      if (results.length > 0) {
        await importBooks(results);
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User cancelled file selection');
      } else {
        console.error('Error selecting files:', error);
        Alert.alert('错误', '选择文件时发生错误');
      }
    }
  };

  // 导入书籍
  const importBooks = async (files: any[]) => {
    dispatch(startImport());
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = (i / files.length) * 100;
        
        dispatch(updateImportProgress({
          progress,
          currentFile: file.name,
        }));

        try {
          await importSingleBook(file);
          successCount++;
        } catch (error) {
          errorCount++;
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          errors.push(`${file.name}: ${errorMessage}`);
          console.error(`Error importing ${file.name}:`, error);
        }
      }

      dispatch(importSuccess());

      // 显示导入结果
      const message = `导入完成！\n成功: ${successCount}本\n失败: ${errorCount}本`;
      Alert.alert('导入结果', message);

      if (errors.length > 0 && errors.length <= 3) {
        Alert.alert('导入错误', errors.join('\n'));
      }

      onImportComplete?.();

    } catch (error) {
      dispatch(importError(error instanceof Error ? error.message : '导入失败'));
      Alert.alert('错误', '导入过程中发生错误');
    }
  };

  // 导入单本书籍
  const importSingleBook = async (file: any): Promise<void> => {
    // 验证文件格式
    if (!isValidEBookFormat(file.name)) {
      throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT);
    }

    // 检查文件大小
    if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    // 检查文件是否已存在
    const existsResult = await bookRepository.isFileExists(file.uri);
    if (existsResult.success && existsResult.data) {
      throw new Error('该书籍已存在');
    }

    // 验证文件有效性
    const validationResult = await bookParser.validateBookFile(file.uri);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error || ERROR_MESSAGES.FILE_CORRUPTED);
    }

    // 复制文件到应用目录
    const fileFormat = validationResult.format!;
    const targetDir = fileService.getStorageDir(fileFormat);
    const copyResult = await fileService.copyFileToApp(file.uri, targetDir);
    
    if (!copyResult.success) {
      throw new Error(copyResult.error || '文件复制失败');
    }

    // 解析书籍元数据
    const metadataResult = await bookParser.parseBookMetadata(copyResult.path!);
    if (!metadataResult.success) {
      // 清理已复制的文件
      await fileService.deleteFile(copyResult.path!);
      throw new Error(metadataResult.error || '元数据解析失败');
    }

    // 提取封面（如果有）
    let coverPath: string | null = null;
    try {
      const cover = await bookParser.extractBookCover(copyResult.path!);
      if (cover) {
        // 这里应该保存封面到covers目录
        // 暂时使用原始封面路径
        coverPath = cover;
      }
    } catch (error) {
      console.warn('Failed to extract cover:', error);
    }

    // 创建书籍记录
    const bookData: Omit<Book, 'id' | 'created_at' | 'updated_at'> = {
      title: metadataResult.metadata?.title || file.name.replace(/\.[^/.]+$/, ''),
      author: metadataResult.metadata?.author,
      file_path: copyResult.path!,
      file_format: fileFormat as any,
      file_size: file.size,
      cover_path: coverPath,
      total_pages: 0, // 这里可以从解析结果中获取
    };

    // 保存到数据库
    const addResult = await bookRepository.addBook(bookData);
    if (!addResult.success) {
      // 清理已复制的文件
      await fileService.deleteFile(copyResult.path!);
      throw new Error(addResult.error || '保存到数据库失败');
    }

    // 更新Redux状态
    dispatch(addBook(addResult.data!));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>导入电子书</Text>
        <Text style={styles.subtitle}>
          支持格式：{APP_CONFIG.SUPPORTED_FORMATS.join('、').toUpperCase()}
        </Text>
      </View>

      {!importStatus.isImporting ? (
        <TouchableOpacity style={styles.selectButton} onPress={selectFiles}>
          <Text style={styles.selectButtonText}>选择文件</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.importingContainer}>
          <ActivityIndicator size="large" color={THEMES.LIGHT.primaryColor} />
          <Text style={styles.importingText}>正在导入...</Text>
          
          {importStatus.currentFile && (
            <Text style={styles.currentFileText} numberOfLines={1}>
              {importStatus.currentFile}
            </Text>
          )}

          <View style={styles.progressContainer}>
            {Platform.OS === 'android' ? (
              <ProgressBarAndroid
                styleAttr="Horizontal"
                indeterminate={false}
                progress={importStatus.progress / 100}
                color={THEMES.LIGHT.primaryColor}
              />
            ) : (
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    {width: `${importStatus.progress}%`}
                  ]} 
                />
              </View>
            )}
            <Text style={styles.progressText}>
              {Math.round(importStatus.progress)}%
            </Text>
          </View>
        </View>
      )}

      {importStatus.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{importStatus.error}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>使用说明：</Text>
        <Text style={styles.infoText}>
          • 支持EPUB、PDF、TXT格式的电子书{'\n'}
          • 单个文件大小不超过{formatFileSize(APP_CONFIG.MAX_FILE_SIZE)}{'\n'}
          • 可同时选择多个文件进行批量导入{'\n'}
          • 重复文件将自动跳过
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: THEMES.LIGHT.backgroundColor,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEMES.LIGHT.textColor,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  selectButton: {
    backgroundColor: THEMES.LIGHT.primaryColor,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  importingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  importingText: {
    fontSize: 16,
    color: THEMES.LIGHT.textColor,
    marginTop: 12,
    marginBottom: 8,
  },
  currentFileText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEMES.LIGHT.primaryColor,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginTop: 'auto',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6C757D',
    lineHeight: 20,
  },
});

export default ImportComponent;
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useAppDispatch, useAppSelector} from '@stores';
import {setReading, updateCurrentPosition, setTableOfContents} from '@stores/slices/readerSlice';
import {BookParserService} from '@services/bookParser';
import {ReadingRepository} from '@services/database';
import TableOfContents from '@components/Reader/TableOfContents';
import ReaderSettingsModal from '@components/Reader/ReaderSettingsModal';
import {RootStackParamList} from '@types';
import {Chapter} from '@/types/models';
import {THEMES} from '@constants';

type ReaderRouteProp = RouteProp<RootStackParamList, 'Reader'>;
type ReaderNavigationProp = StackNavigationProp<RootStackParamList, 'Reader'>;

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const ReaderScreen: React.FC = () => {
  const route = useRoute<ReaderRouteProp>();
  const navigation = useNavigation<ReaderNavigationProp>();
  const dispatch = useAppDispatch();
  
  const {bookId} = route.params;
  const {currentBook} = useAppSelector((state) => state.books);
  const {settings, isReading, tableOfContents} = useAppSelector((state) => state.reader);
  
  const [content, setContent] = useState<string>('');
  const [showControls, setShowControls] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookParser] = useState(() => BookParserService.getInstance());
  const [readingRepository] = useState(() => new ReadingRepository());

  useEffect(() => {
    if (currentBook) {
      loadBookContent();
      loadTableOfContents();
      dispatch(setReading(true));
    }

    return () => {
      dispatch(setReading(false));
    };
  }, [currentBook]);

  const loadBookContent = async () => {
    if (!currentBook) return;

    try {
      const bookContent = await bookParser.getBookContent(currentBook.file_path);
      
      if (currentBook.file_format === 'txt') {
        // 对于TXT文件，获取格式化的HTML内容
        const txtParser = bookParser['txtParser'];
        if (txtParser && typeof txtParser.getFormattedContent === 'function') {
          const formattedContent = await txtParser.getFormattedContent(currentBook.file_path);
          setContent(formattedContent);
        } else {
          setContent(createHtmlContent(bookContent));
        }
      } else if (currentBook.file_format === 'pdf') {
        // PDF使用react-native-pdf组件渲染
        setContent(bookContent); // PDF路径
      } else {
        // EPUB等其他格式
        setContent(bookContent);
      }
    } catch (error) {
      console.error('Error loading book content:', error);
      Alert.alert('错误', '无法加载书籍内容');
    }
  };

  const loadTableOfContents = async () => {
    if (!currentBook) return;

    try {
      const chapters = await bookParser.getBookTableOfContents(currentBook.file_path);
      dispatch(setTableOfContents(chapters));
    } catch (error) {
      console.error('Error loading table of contents:', error);
    }
  };

  const createHtmlContent = (textContent: string): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: ${settings.fontSize}px;
            line-height: ${settings.lineHeight};
            color: ${settings.textColor};
            background-color: ${settings.backgroundColor};
            padding: 20px;
            margin: 0;
          }
          p {
            margin-bottom: 1em;
            text-indent: 2em;
          }
        </style>
        <script>
          window.addEventListener('scroll', function() {
            const progress = window.pageYOffset / (document.body.scrollHeight - window.innerHeight);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'scroll',
              progress: progress,
              position: window.pageYOffset
            }));
          });
          
          document.addEventListener('click', function() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'click'
            }));
          });
        </script>
      </head>
      <body>
        ${textContent.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'scroll':
          dispatch(updateCurrentPosition(data.position.toString()));
          updateReadingProgress(data.progress);
          break;
        case 'click':
          setShowControls(!showControls);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const updateReadingProgress = async (progress: number) => {
    if (!currentBook) return;

    try {
      await readingRepository.updateReadingProgress({
        book_id: currentBook.id,
        current_position: progress.toString(),
        progress_percentage: progress * 100,
        last_read_at: new Date().toISOString(),
        reading_time: 0, // 这里需要实现阅读时长计算
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleTableOfContents = () => {
    setShowTableOfContents(true);
  };

  const handleChapterSelect = (chapter: Chapter) => {
    // 跳转到指定章节
    console.log('Jump to chapter:', chapter.title);
    setShowTableOfContents(false);
  };

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>书籍未找到</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={!showControls} />
      
      {/* 顶部控制栏 */}
      {showControls && (
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleBack}>
            <Text style={styles.controlButtonText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.bookTitleHeader} numberOfLines={1}>
            {currentBook.title}
          </Text>
          <TouchableOpacity style={styles.controlButton} onPress={handleTableOfContents}>
            <Text style={styles.controlButtonText}>目录</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 内容区域 */}
      <View style={styles.contentContainer}>
        {currentBook.file_format === 'pdf' ? (
          // PDF渲染组件（需要安装react-native-pdf）
          <Text style={styles.placeholderText}>PDF渲染组件待实现</Text>
        ) : (
          <WebView
            source={{html: content}}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </View>

      {/* 底部控制栏 */}
      {showControls && (
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleSettings}>
            <Text style={styles.controlButtonText}>设置</Text>
          </TouchableOpacity>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>0%</Text>
          </View>
        </View>
      )}

      {/* 目录组件 */}
      <TableOfContents
        visible={showTableOfContents}
        chapters={tableOfContents}
        onChapterSelect={handleChapterSelect}
        onClose={() => setShowTableOfContents(false)}
      />

      {/* 设置组件 */}
      <ReaderSettingsModal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEMES.LIGHT.backgroundColor,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  controlButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: THEMES.LIGHT.primaryColor,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bookTitleHeader: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  progressInfo: {
    flex: 1,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: THEMES.LIGHT.textColor,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 100,
  },
  placeholderText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 100,
  },
});

export default ReaderScreen;
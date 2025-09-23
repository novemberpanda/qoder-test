import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';

import {Chapter} from '@/types/models';
import {THEMES} from '@constants';

interface TableOfContentsProps {
  visible: boolean;
  chapters: Chapter[];
  currentChapter?: string;
  onChapterSelect: (chapter: Chapter) => void;
  onClose: () => void;
}

interface ChapterItemProps {
  chapter: Chapter;
  isSelected: boolean;
  onPress: (chapter: Chapter) => void;
  level?: number;
}

const ChapterItem: React.FC<ChapterItemProps> = ({
  chapter,
  isSelected,
  onPress,
  level = 0,
}) => {
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.chapterItem,
          { paddingLeft: 20 + level * 16 },
          isSelected && styles.selectedChapterItem,
        ]}
        onPress={() => onPress(chapter)}>
        <Text
          style={[
            styles.chapterTitle,
            isSelected && styles.selectedChapterTitle,
          ]}
          numberOfLines={2}>
          {chapter.title}
        </Text>
      </TouchableOpacity>
      
      {chapter.children && chapter.children.map((child, index) => (
        <ChapterItem
          key={child.id}
          chapter={child}
          isSelected={isSelected}
          onPress={onPress}
          level={level + 1}
        />
      ))}
    </View>
  );
};

const TableOfContents: React.FC<TableOfContentsProps> = ({
  visible,
  chapters,
  currentChapter,
  onChapterSelect,
  onClose,
}) => {
  const renderChapter = ({item}: {item: Chapter}) => (
    <ChapterItem
      chapter={item}
      isSelected={item.id === currentChapter}
      onPress={onChapterSelect}
    />
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>目录</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>关闭</Text>
          </TouchableOpacity>
        </View>

        {chapters.length > 0 ? (
          <FlatList
            data={chapters}
            renderItem={renderChapter}
            keyExtractor={(item) => item.id}
            style={styles.chapterList}
            showsVerticalScrollIndicator={true}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>暂无目录信息</Text>
          </View>
        )}
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
  chapterList: {
    flex: 1,
  },
  chapterItem: {
    paddingVertical: 16,
    paddingRight: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  selectedChapterItem: {
    backgroundColor: THEMES.LIGHT.secondaryColor,
  },
  chapterTitle: {
    fontSize: 16,
    color: THEMES.LIGHT.textColor,
    lineHeight: 22,
  },
  selectedChapterTitle: {
    color: THEMES.LIGHT.primaryColor,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});

export default TableOfContents;
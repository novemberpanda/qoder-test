import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import {useAppDispatch, useAppSelector} from '@stores';
import {loadBooks, setCurrentBook, removeBook} from '@stores/slices/booksSlice';
import {BookRepository} from '@services/database';
import {Book} from '@/types/models';
import {RootStackParamList} from '@types';
import {THEMES} from '@constants';

type BookShelfNavigationProp = StackNavigationProp<RootStackParamList, 'BookShelf'>;

interface BookItemProps {
  book: Book;
  onPress: (book: Book) => void;
  onLongPress: (book: Book) => void;
}

const BookItem: React.FC<BookItemProps> = ({book, onPress, onLongPress}) => {
  return (
    <TouchableOpacity
      style={styles.bookItem}
      onPress={() => onPress(book)}
      onLongPress={() => onLongPress(book)}>
      <View style={styles.bookCover}>
        {book.cover_path ? (
          <Image source={{uri: book.cover_path}} style={styles.coverImage} />
        ) : (
          <View style={styles.defaultCover}>
            <Text style={styles.defaultCoverText}>{book.title.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author || '未知作者'}
        </Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>0%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: '0%'}]} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BookShelfScreen: React.FC = () => {
  const navigation = useNavigation<BookShelfNavigationProp>();
  const dispatch = useAppDispatch();
  const {bookList, loading} = useAppSelector((state) => state.books);
  
  const [refreshing, setRefreshing] = useState(false);
  const [bookRepository] = useState(() => new BookRepository());

  // 加载书籍列表
  const loadBookList = async () => {
    try {
      const result = await bookRepository.getAllBooks();
      if (result.success && result.data) {
        dispatch(loadBooks(result.data));
      }
    } catch (error) {
      console.error('Error loading books:', error);
    }
  };

  // 屏幕获得焦点时加载书籍
  useFocusEffect(
    React.useCallback(() => {
      loadBookList();
    }, [])
  );

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookList();
    setRefreshing(false);
  };

  // 点击书籍
  const handleBookPress = (book: Book) => {
    dispatch(setCurrentBook(book));
    navigation.navigate('Reader', {bookId: book.id});
  };

  // 长按书籍
  const handleBookLongPress = (book: Book) => {
    Alert.alert(
      '书籍操作',
      `选择对 "${book.title}" 的操作`,
      [
        {text: '取消', style: 'cancel'},
        {text: '删除', style: 'destructive', onPress: () => handleDeleteBook(book)},
      ]
    );
  };

  // 删除书籍
  const handleDeleteBook = async (book: Book) => {
    try {
      const result = await bookRepository.deleteBook(book.id);
      if (result.success) {
        dispatch(removeBook(book.id));
      } else {
        Alert.alert('错误', '删除书籍失败');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      Alert.alert('错误', '删除书籍时发生错误');
    }
  };

  // 渲染空状态
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>书架空空如也</Text>
      <Text style={styles.emptySubtitle}>点击右上角的加号添加书籍</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的书架</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            navigation.navigate('Import');
          }}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={bookList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <BookItem
            book={item}
            onPress={handleBookPress}
            onLongPress={handleBookLongPress}
          />
        )}
        numColumns={3}
        contentContainerStyle={styles.bookGrid}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: THEMES.LIGHT.textColor,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEMES.LIGHT.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bookGrid: {
    padding: 16,
  },
  bookItem: {
    flex: 1,
    margin: 8,
    maxWidth: '30%',
  },
  bookCover: {
    aspectRatio: 3 / 4,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultCover: {
    width: '100%',
    height: '100%',
    backgroundColor: THEMES.LIGHT.secondaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultCoverText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEMES.LIGHT.textColor,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 10,
    color: '#8E8E93',
    marginRight: 8,
    minWidth: 24,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEMES.LIGHT.primaryColor,
    borderRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEMES.LIGHT.textColor,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default BookShelfScreen;
import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';

import ImportComponent from '@components/Import/ImportComponent';
import {RootStackParamList} from '@/types';
import {THEMES} from '@constants';

type ImportScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Import'>;

const ImportScreen: React.FC = () => {
  const navigation = useNavigation<ImportScreenNavigationProp>();

  const handleImportComplete = () => {
    // 导入完成后返回书架
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>导入书籍</Text>
        <View style={styles.placeholder} />
      </View>

      <ImportComponent onImportComplete={handleImportComplete} />
    </SafeAreaView>
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
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: THEMES.LIGHT.primaryColor,
  },
  placeholder: {
    width: 60, // 与返回按钮宽度保持平衡
  },
});

export default ImportScreen;
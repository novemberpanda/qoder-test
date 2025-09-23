import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import {Provider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';

import {store} from '@stores';
import {DatabaseManager} from '@services/database';
import {FileSystemService} from '@services/fileSystem';
import {SettingsService} from '@services/settings';
import {loadUserSettings} from '@stores/slices/settingsSlice';
import AppNavigator from './src/navigation/AppNavigator';
import {THEMES} from '@constants';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? THEMES.DARK.backgroundColor : THEMES.LIGHT.backgroundColor,
  };

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // 初始化文件系统
      const fileService = FileSystemService.getInstance();
      await fileService.initializeDirectories();

      // 初始化数据库
      const dbManager = DatabaseManager.getInstance();
      await dbManager.initDatabase();

      // 加载用户设置
      const settingsService = SettingsService.getInstance();
      const settingsResult = await settingsService.getAllUserSettings();
      if (settingsResult.success && settingsResult.data) {
        store.dispatch(loadUserSettings(settingsResult.data));
      }

      console.log('App initialized successfully');
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  return (
    <Provider store={store}>
      <NavigationContainer>
        <SafeAreaView style={[styles.container, backgroundStyle]}>
          <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
          />
          <AppNavigator />
        </SafeAreaView>
      </NavigationContainer>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;